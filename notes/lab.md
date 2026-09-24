# notes/lab.md

Owner of `lab/*`, `lab/experiments/*`, `bench/lab.mjs`, `test/lab.test.mjs`, and the one
`describe('lab', ...)` block plus the directory form of `replay` in `bin/brain.mjs`.
Nothing under `core/`, `viz/`, `web/`, `runtime/`, `self/`, `world/`, `generations/`,
`capability/`, `mind/`, `seeds/` or `daemon/` was edited.

His manual, section A, is the specification for this directory:

> BRAIN is therefore designed as both an intelligence architecture and a research
> instrument. The system should support controlled experiments on new primitives, new cell
> architectures, new learning mechanisms, new memory structures, new routing strategies,
> and new forms of structural adaptation. Researchers should be able to create isolated
> experimental regions, introduce alternative mechanisms, compare their behavior against
> existing systems, and integrate successful approaches into the larger architecture. The
> system must support failure as a normal part of research

> The system should make it possible to pause computation, inspect state, replay events,
> compare versions, analyze connectivity, and reproduce experiments.

Every number below was printed by a command, and the command is named beside it.

---

## What an experiment is

`lab/experiment.mjs`. An experiment is a hypothesis with a bar written down **before** the
numbers exist, and nothing in the file can edit the bar afterwards: `defineExperiment`
freezes both `hypothesis` and `bar`, and `test/lab.test.mjs` asserts that assigning to
either throws a `TypeError`.

```
name        the verdict file it writes
hypothesis  { metric, direction, minEffect }   which number moves, which way, how far
bar         { alpha, seeds }                   the permutation share it must clear
build(seed)   the base organism, the same one both arms start from
stream(seed)  the seeded input stream, computed ONCE and handed to both arms
mechanism(brain, ctx)  installs the alternative into an ISOLATED region of a CLONE
control(brain, ctx)    the untouched clone, same stream, same seed
measure(brain, ctx)    drives the stream and returns a bag of numbers
seeds       the K seeds the pair is run over
```

`run(exp)` clones the base twice per seed with `simulate/clone.mjs cloneSub`, so the two
arms differ in exactly one thing: which function was called on the clone. The comparison is
**paired** per seed. The share is a **sign-flip permutation** over the paired differences,
exact when 2^K fits in a sweep (`exactUpTo`, default 16) and seeded-sampled above that.
Nothing here is a t test: the null is the experiment's own pairs with their signs shuffled,
which needs no distributional claim. Both tails are computed, so a refutation is graded as
strictly as a confirmation.

Three outcomes and only three:

- **confirmed** effect >= minEffect in the stated direction AND share <= alpha
- **refuted** effect <= -minEffect (a significant move the wrong way) AND reverse <= alpha
- **undecided** everything else, including "the right sign but not far enough"

Every verdict is written to `lab/verdicts/<name>.json` with the numbers and a **git free**
content hash of the mechanism's own source text (`sha256` over
`Function.prototype.toString`), so the file names the code it graded without asking git
anything. `test/lab.test.mjs` re-hashes each shipped mechanism and control and asserts the
verdict on disk still names the code that is there now.

## Isolation

`lab/isolate.mjs`. A cell inside an isolated region may only receive from and emit to
**declared ports**. Three doors lead into or out of a region and the firewall stands at all
three. Nothing in `core/` is edited: every wrap is an own property on the brain instance,
which shadows the prototype method and is put back by `detach()`.

1. `brain.connect(...)` an illegal crossing throws `RegionCrossing` and logs.
2. `brain.gate.policy` `core/brain.mjs _structural` proposes `edge.grow` / `edge.replace`
   to the gate before it calls `connect`, so the firewall rejects the **proposal** and the
   tick loop never reaches a throw. This is the region firewall "enforced through the gate
   policy" in the literal sense: the policy the gate consults is the firewall's, and it
   delegates to the previous policy whenever the wiring is legal.
3. `brain.inject(...)` an injection into an undeclared in port of a sealed cell is refused.

Signals need no fourth door: `core/brain.mjs _emit` only routes along edges in the
connectome and no illegal edge can exist, so no illegal signal can travel.

Every refusal is a `lab.isolate.refuse` ledger event carrying the door, the two cells, the
port and the reason. `fw.declare(dir, spec)` lets a mechanism open the one door its own new
cell needs, and writes a `lab.isolate.declare` event; everything not declared is still
refused. The tally `node --test test/lab.test.mjs` asserts, and would fail on: four
refusals in one brain, `{ connect: 2, gate: 1, inject: 1 }`, zero undeclared crossings in the
connectome afterwards. The gate case uses `evidence.coActivations = 16`, which is above
core's own `growThreshold` of 8, so the only thing that can separate the refused proposal
from the accepted one is the firewall.

## Comparing against the control

`lab/compare.mjs`. `compareBrains(a, b)` and `compareStates(dirA, dirB)` both go through
`tools/diff.mjs diffSnapshots` for structure and add two things a snapshot diff cannot see:

- **per-region run counts** from the per-cell counters core keeps, which is the same source
  `core/scheduler.mjs` charges, so this never disagrees with the budget report;
- **prediction error curves** read off the `surprise` field of `cell.run` ledger events,
  bucketed on a **shared tick grid** so bucket i of A covers the same ticks as bucket i of B.

`renderCompare` prints three tables. Nothing is computed that is not printed.

## Replay

`lab/replay.mjs`. `record(brain, dir, { ticks })` snapshots a brain with a file backed
ledger and runs N ticks; `replay(dir, { ticks })` restores the snapshot, re-runs the same
ticks and compares, in order: the ledger sequence, the `cell.run` order, the output content
hashes `core/signal.mjs` stamps on every emitted signal, and the `simulate/clone.mjs`
fingerprint. It reports the first divergence as `{ index, tick, cell, port, field,
expected, got }`.

Nothing is written back: the replayed brain is restored with `dir: null` so it keeps its
ledger in memory and cannot overwrite the recording. `test/lab.test.mjs` re-reads the
recording's ledger afterwards and asserts it is the same length.

`node --test test/lab.test.mjs` asserts both halves: a clean replay compares every event with
no divergence, and a replay with one cell's parameters tampered diverges at the `out` field
of a `cell.run` for the tampered cell with the fingerprint no longer matching. The numbers
are printed by `node bench/lab.mjs` and are in the bench table further down.

`brain replay <dir> --ticks N` runs the same instrument from the CLI. On a 20 tick recording
of a four cell probe it printed: reference 127 events, replayed 127, compared 127; cell.run
order reference 90 replayed 90 identical true; signal outputs 37 and 37 with hashes
identical true; fingerprint `68449e8c261f2253:3710` recorded and replayed, match true;
VERDICT DETERMINISTIC in 4.822 ms.

## Integration through the gate

`lab/integrate.mjs`. Computation is not authority, and neither is a good result. A confirmed
experiment becomes part of the main organism only through a gate proposal of kind
`lab.integrate` carrying the verdict file as evidence. The policy checks four things, all
of them read out of the verdict file and none of them supplied by the caller:

1. `verdict === 'confirmed'`
2. the effect reached the `minEffect` the hypothesis stated
3. the permutation share cleared the `alpha` the bar stated
4. the seed count reached the bar, and the mechanism hash in the file matches the mechanism
   being integrated when the caller supplies one

The proposal is opened on the brain's own gate: its `nextId`, its `stats`, its `pending`
map, and the same two ledger events (`proposal` then `decision`) `core/gate.mjs` writes, so
`brain proposals` lists a `lab.integrate` exactly like any other. The `apply` callback runs
only on approval; `test/lab.test.mjs` asserts a refused proposal never runs it.

---

## The three shipped experiments

Run with `node lab/cli.mjs run all`. Every number here is off that command's output and is
also in `lab/verdicts/<name>.json`.

### a. learning-rule: REFUTED

A new **learning mechanism**. Eight symbols arrive one per tick in a seeded cyclic order;
each symbol owns one `event.filter` cell wired all to all laterally. The edge from a symbol
to its true successor is the only one whose pre spike lands on the same tick as its post
spike (dt = 0, the top of the STDP window in `learning/hebbian.mjs`). Metric
`nextSymbolAccuracy`: the heaviest lateral edge out of each symbol cell, one point when it
points at the true successor, and **1/m for a tie among m edges**, so an untouched
connectome scores exactly chance 1/7 = 0.142857 by construction rather than by luck of the
insertion order.

```
treatment (predictive)  mean 0.142857   sd 0.000000
control   (hebbian)     mean 1.000000   sd 0.000000
effect    mean -0.857143   median -0.857143   min -0.857143   max -0.857143
pairs     wins 0   losses 8   ties 0
permutation share 1.000000   reverse 0.003906   (exact, 256 draws)
ruleApplications   treatment 0        control 10561
weightsMoved       treatment 0        control 64
meanAbsWeightDelta treatment 0        control 0.630341
tiedCells          treatment 8        control 0
```

The finding, plainly: **the predictive rule cannot replace an edge rule.**
`learning/predictive.mjs` is scope `cell`. It smooths a predicting cell's error into
`cell.stats.surprise` and scales a learning rate; it never writes a weight, and on cells
that publish no error it does not even run. The instrument proves it rather than the
comment asserting it: zero rule applications, zero weights moved, all eight cells still
tied at chance. This is a real result about the registry, not a failure of the harness.

### b. phasor-memory: UNDECIDED

A new **memory structure**. `cells/fhrr.mjs phv.memory` (one superposition accumulator)
against `cells/basic.mjs memory.assoc` (a nearest neighbour list) at the **same dimension**,
1024, with 64 key-value pairs written and queried back in a seeded order that is not the
write order. Both arms are scored by the same `lab.answer` recorder cell inside the sealed
region, so neither has a private path to the score.

```
treatment (phv.memory)   mean 0.988281   sd 0.011049
control   (memory.assoc) mean 1.000000   sd 0.000000
effect    mean -0.011719   median -0.015625   min -0.031250   max 0.000000
pairs     wins 0   losses 5   ties 3
permutation share 1.000000   reverse 0.031250   (exact, 256 draws)
correct         treatment 63.25     control 64
meanSim         treatment 0.11075   control 1
traceBytes      treatment 16384     control 65536
traceBytesPerPair treatment 256     control 1024
recallPerKB     treatment 0.061768  control 0.015625
codebookBytes   treatment 524288    control 0
```

Undecided is the honest answer: the effect of -0.011719 is inside the stated band of
+-0.05, so 64 pairs at dimension 1024 does not separate the two stores on recall. What DID
separate them is the bytes. `traceBytes` is what the store must keep to answer a query given
the codebook: for the phasor store that is the accumulator alone, 16 bytes per dimension and
**constant in the number of pairs**; for the list store it is every key it was handed, one
byte per dimension per pair, growing without bound. At this load that is 16384 against
65536, a factor of 4, and `recallPerKB` of 0.061768 against 0.015625, a factor of 3.95.
`codebookBytes` is reported beside it and is not the same kind of thing: the phasor codebook
is a cache of `phvFromSeed`, a deterministic function of the name, while the list store's
keys ARE the store.

### c. goal-routing: CONFIRMED

A new **routing policy**. Eight `sink.log` cells in a region whose budget is one cell run
per tick, all eight receiving a hypervector every tick, so the scheduler must refuse seven
cells per tick for 200 ticks. One of the eight, chosen per seed, receives a copy of the goal
vector with 5 percent of its bits flipped; the other seven receive fresh random vectors.
Treatment is `simulate/attention.mjs` with `weights { novelty: 0, surprise: 0, goal: 1 }`
and everything else at its defaults; control is the scheduler as it ships.

Which cell is relevant and the **order the eight cells are registered in** are both shuffled
per seed, because `core/scheduler.mjs` sorts bids with a stable sort and equal bids are
broken by registration order: an experiment that fixed that order would be grading one
arbitrary point of the tie-break band and calling it the control.

```
treatment (attention.goal) mean 0.418750   sd 0.004282
control   (no gating)      mean 0.125000   sd 0.000000
effect    mean 0.293750   median 0.295000   min 0.285000   max 0.300000
pairs     wins 16   losses 0   ties 0
permutation share 0.000015   reverse 1.000000   (exact, 65536 draws)
relevantRuns    treatment 83.75     control 25
distractorRuns  treatment 116.25    control 175
funded          treatment 200       control 200
skipped         treatment 1400      control 1400
relevantPriority treatment 3.018555 control 1
attentionScored treatment 9265.6875 control 0
```

Goal gating gives the relevant cell 3.35 times its ungated share of a scarce budget. It does
not starve the distractors: the ungated control lands on exactly 0.125, which is 1/8, so an
ungated overloaded region is a **backlog round robin**, and the gated one still funds a
distractor on 116.25 of 200 ticks because the pending term in
`priority x (1 + surprise) x (1 + pending)` keeps a starved queue competitive.

**One confirmed, one undecided, one refuted.** Failure is a normal result and it is reported
as one.

## The cost instrument

`lab/cost.mjs`, run with `node lab/cost.mjs`, writes `bench/verdicts/cost.json`.

External API tokens are zero, and "by construction" is not a measurement, so the file
measures it: every outbound door in the process is wrapped and counted before the task list
runs (`fetch`, `http.request`, `https.request`, `net.Socket.prototype.connect`,
`tls.connect`, `dns.lookup`, `dns.promises.lookup`). `package.json` has no dependencies, so
there is no client in the process that could call one, and the counter proves that rather
than restating it. `test/lab.test.mjs` makes the same counter report a non-zero number at
two of those doors, so a zero is a reading and not a dead instrument.

The CPU clock resolution is measured, not assumed, and printed beside the table, because a
task that prints 0 cpu ms did not cost nothing: it cost less than one tick of that clock.
On this machine that resolution is **16 ms, measured in 2147328 spins**, which is why two of
the three rows below print 0 and why the per-task cpu column is not a number to quote. The
totals and the cost per solved task are.

```
task             n   solved   accuracy       cpu ms      wall ms     rss MB   cpu ms/solved
algebra        191      191          1            0        5.859     64.305               0
recall         512      512          1           62       41.762     68.867          0.1211
sequence        54       54          1            0       12.088     70.914               0

total  757 tasks, 757 solved (1)
  cpu                    62 ms
  wall                   59.87 ms
  peak memory            75.094 MB   process.resourceUsage().maxRSS (process lifetime peak)
  cost per solved task   0.0819 cpu ms   (0.0791 wall ms)
  external API tokens    0   no network call was made, counted at every outbound door
  network calls made     0   {"fetch":0,"httpRequest":0,"httpsRequest":0,"socketConnect":0,
                              "tlsConnect":0,"dnsLookup":0,"dnsPromisesLookup":0}
```

What each row counted, printed beside it rather than buried in the JSON, because an accuracy
of 1 with no denominator visible is a rumour:

- **algebra** `capability/induce.mjs algebraBattery`, linear equations solved and verified by
  substitution: attempted 200, degenerate 9, solved 191, verified 191. The 9 are equations
  the generator produced with no unique solution; they are excluded from n and counted in the
  open rather than quietly dropped.
- **recall** `memory/episodic.mjs EpisodicStore`, d 2048, 512 episodes written and queried
  back with a key corrupted at 10 percent of its bits: 512 queries, 512 correct,
  1048576 bytes of keys.
- **sequence** `tasks/sequence.mjs runSequences` graded by `tasks/exact.mjs`: 54 problems,
  54 correct, and the `predict.next` floor on the same 54 is **2**, so the suite is measuring
  induction and not a lucky baseline. 55 cells, 484 cell runs, suite 10.597 ms.

## The bench

`bench/lab.mjs`, run with `node bench/lab.mjs`, writes `bench/verdicts/lab.json`.

A lab is only worth its verdicts if the same seeds give the same numbers, so the bench does
not read `lab/verdicts/*.json` and repeat what it finds. It **re-runs** every shipped
experiment into a throwaway directory and compares the fresh numbers against the ones on disk
seed by seed: the verdict, every effect statistic, the permutation share and mode and draw
count, the per seed value arrays of both arms, and the four content hashes. A verdict whose
mechanism hash moved is stale even when its numbers agree, and the bench says so.

```
experiment        verdict    metric              seeds   treatment     control      effect           bar     w/l/t      share    reverse  reproduced        ms
learning-rule     refuted    nextSymbolAccuracy      8    0.142857    1.000000   -0.857143   +0.05 a0.05     0/8/0   1.000000   0.003906  yes            110.8
phasor-memory     undecided  recall                  8    0.988281    1.000000   -0.011719   +0.05 a0.05     0/5/3   1.000000   0.031250  yes            103.5
goal-routing      confirmed  relevantShare          16    0.418750    0.125000    0.293750    +0.2 a0.05    16/0/0   0.000015   1.000000  yes           1136.9

  verdicts: confirmed 1, refuted 1, undecided 1 of 3; reproduced 3/3
  isolation: refused crossings 0, undeclared crossings left 0
```

Then it records an organism and replays it twice, once clean and once with one cell's
parameter changed after the snapshot was restored, so the determinism check is shown catching
a divergence rather than asserted to work:

```
run          events ref/replay   compared   cell.run ref/replay  signals ref/replay  fingerprint match   first divergence
clean                  225/225        225               168/168               57/57  true                none
tampered               225/211         22               168/161               57/50  false               event 21 t4 a.s2#null out
  30 ticks recorded, 225 ledger events, co-activation counters pending at snapshot 0
  clean replay deterministic true, tampered replay caught true
```

The whole bench is **1438 ms** and ends on one line:

```
LAB GREEN: experiments 3 (confirmed 1, refuted 1, undecided 1), reproduced 3/3, replay
deterministic true, tamper caught true, cost per solved task 0.1863 cpu ms over 757 tasks,
external API calls 0, 1438 ms, verdict written to bench/verdicts/lab.json
```

That cost figure is higher than the 0.0819 above and both are correct: `measureCost` runs
inside the bench process, which had already run three experiments and a replay, so its cpu
reading carries a different warm state and its peak memory is the bench's 294.965 MB rather
than the task list's 75.094 MB. The bench therefore passes `write: false` and leaves
`bench/verdicts/cost.json` to `node lab/cost.mjs`, which measures the task list in a process
that did nothing else.

## Requests for core (worked around here, not patched)

1. **`PROPOSAL_KINDS` is frozen and `propose()` throws on an unknown kind.**
   `core/gate.mjs` line 1 of `propose` is
   `if (!PROPOSAL_KINDS.includes(p.kind)) throw ...`, and `PROPOSAL_KINDS` is
   `Object.freeze([...])`. A research instrument cannot add a proposal kind, which is
   exactly what "integrate successful approaches into the larger architecture" needs.
   `lab/integrate.mjs` therefore decides the proposal itself, on the brain's own gate, using
   the same id space (`gate.nextId`), the same statistics (`gate.stats`), the same pending
   map and the same two ledger events, so `brain proposals` cannot tell the difference.
   It reports `coreKnowsKind: false` rather than hiding the workaround.
   **Request:** add `'lab.integrate'` to `PROPOSAL_KINDS`, or better, make proposal kinds
   registrable (`registerProposalKind(name)`), so a subsystem can open a kind of its own.
   A second half of the same request: `makePolicy` has `default: return 'hold'` and no
   branch that can read a verdict file, so the policy for a new kind has to come from the
   subsystem that defined it. A policy registry keyed by kind would let core keep the gate
   and let the subsystem keep the judgment.

2. **`brain.coact.counts` is not in `snapshot.json`.** `core/brain.mjs snapshot` writes
   cells, the connectome, the gate, mail and in-flight signals. The co-activation counters
   that drive structural growth are not among them, so a recording taken part way to a
   growth threshold cannot be replayed structurally: the replayed brain starts its counters
   at zero and grows a different organism. `lab/replay.mjs` cannot fix this, so it measures
   it instead and writes `coactPending` into the recording manifest, and the shipped
   recordings have `coactPending: 0` by construction.
   **Request:** serialize `coact.counts` (it is a `Map` of pair keys to integers) alongside
   the connectome, or expose a `coact.serialize()` for `snapshot` to call.

3. **In-flight signals restored from a snapshot carry their original `seq`.** The replayed
   brain gets a fresh ledger that starts at 0, so those original seqs land INSIDE the
   replayed window and a `cell.run` that consumed one normalizes to a distance where the
   reference normalizes to "out of window". That is a divergence created by the counter, not
   by the computation. `lab/replay.mjs` works around it by setting `brain.ledger.seq` to the
   recording's `baseSeq` before the first tick, which makes the two windows the same
   interval.
   **Request:** either let `Brain.restore` take a `ledgerSeq` option, or write the ledger
   seq at snapshot time into `snapshot.json` and restore the counter from it. The second is
   better: it makes every restored brain's ledger continuous with the one it came from.

4. **The scheduler's tie-break is the registration order.** `Scheduler.allocate` sorts by
   bid with a stable sort, so equal bids are funded in the order cells were added. Measured
   in the goal-routing control arm: with the registration order shuffled per seed the
   ungated share of a one-per-tick budget across eight equal cells is exactly 0.125 on all
   16 seeds, and with a fixed order it would be 1 or 0 depending on where the relevant cell
   landed. This is not a defect, but it is a trap for anyone who benchmarks a routing change
   without shuffling. Already filed by `notes/simulate.md` request 5; repeated here because
   `lab/experiments/goal-routing.mjs` had to design around it.
   **Request:** an explicit documented tie-break (cell id, or a seeded jitter on the bid)
   so a benchmark cannot silently inherit file order.

5. **`Brain.restore(dir, opts)` spreads `opts` after `dir`.** That is what makes
   `{ dir: null }` work for a read-only replay, and it is load bearing here: without it a
   replay would append to the recording's own `ledger.jsonl` and destroy the thing it is
   checking. Not a request, a note: please keep that order.

## Two traps this subsystem walked into, written down so nobody repeats them

- **A cell that emits at tick t is heard at t+1.** `core/brain.mjs _emit` schedules delivery
  at `connectome.arrival(e, clock.t)`, which is `t + 1 + delay`, while `inject` schedules at
  `clock.t + delay`. The first version of `lab/experiments/phasor-memory.mjs` ticked once per
  query and scored **every answer against the previous query's answer**, which gave both arms
  a recall of 0 and a confident, wrong verdict. Two ticks per query fixed it. Neither arm
  looked broken while it was wrong, which is the dangerous kind of wrong.
- **An exact permutation on K seeds cannot go below 1 in 2^K.** With 4 seeds the smallest
  attainable share is 0.0625, so a bar of alpha 0.05 is unreachable at 4 seeds no matter how
  clean the separation is, and the honest verdict is undecided. `test/lab.test.mjs` asserts
  that floor before it states its own bar, so the harness's own unit experiment cannot be
  written against a bar it could never clear.

## Not mine (state of the rest of the suite when this subsystem was finished)

`node bench/gate.mjs`, one process per file, all on the same pass:

```
GATE RED: test files 28/30, assertions 422 pass / 2 fail, authored code lines 49646 in 215
files, prose lines 22918, generated organism lines 507145 in 129 files, em-dash files 0,
bad imports 0
```

`test/lab.test.mjs` is **18 pass, 0 fail in 291 ms** inside that run. The two red files
belong to agents who were still working while this was written, and were left alone:

- `test/speed.test.mjs` (7 pass, 1 fail, 8248 ms):
  `a weight of one per cell changes no decision, and a real weight balances weight`, with
  `8 shards: weighting made the weight imbalance worse, 1.116 to 1.179`.
- `test/whole.test.mjs` (8 pass, 1 fail, 47410 ms):
  `(b) an event at perception reaches motor, proposes a world action, and traces back to the
  injection`, with `a world.act for key reflex appears in the ledger`, actual null.

Everything else passed: capability 11, cells 22, cells2 13, cli 14, core 15, epochs 28,
fhrr 18, fuzz 6, generations 16, genome 33, invariants 16, io 8, lab 18, lang 14, learning 11,
memory 12, mind 14, runtime 5, self 26, simd 6, simulate 21, substrate 11, tasks 10, tools 9,
universal 7, viz 14, web 11, world 18.

Environment note, for whoever chases the next slow gate: the gate's earlier run on this
machine did not finish inside 600 s, and the cause was in this subsystem. An early draft of
`test/lab.test.mjs` proved the network counter by making two real `dns.lookup` calls to a
`.invalid` name. On Windows those sit in the libuv threadpool for a long time and keep
`node --test` from exiting. They were replaced by calls that throw synchronously after the
counter has already incremented (`dns.lookup` with no callback, `new net.Socket().connect()`
with no arguments), which proves the same thing, touches no network, and returns in under a
millisecond. A test that proves an absence must not do it by waiting.

## 2026-09-17: core answered all five requests, and both workarounds are deleted

Core now takes a registered proposal kind. `core/gate.mjs` keeps its nine built in kinds
frozen and keeps deciding them exactly as it did, and adds a registry beside them:
`registerProposalKind(name, { policy, slim })`, `registerPolicy(kind, fn)`, `policyFor(kind)`,
`knownKind(kind)` and `registeredKinds()`. `propose()` accepts a registered kind, `makePolicy`
looks the kind's policy up at decision time and falls back to `hold` when nobody registered
one, and the registration may carry a `slim(evidence)` that says what the LEDGER LINE holds
when the evidence is a whole verdict file. Trying to register one of the nine throws, and so
does a policy that is not a function. `lab/integrate.mjs` registers `lab.integrate` with
`labPolicy` and its own slim at import time, and `proposeIntegration` now calls
`brain.gate.propose` like anything else: the local `decideHere` copy of the gate is gone, the
id space, the statistics, the pending map and the two ledger events are core's, and
`coreKnowsKind` is true. The kind is still not in `PROPOSAL_KINDS`, which is the point: a
brain that never imported `lab/` still refuses a `lab.integrate` outright.

The co-activation counters and the ledger seq now travel in the snapshot.
`CoActivation.serialize()` and `restore()` write the counters the way the connectome writes
its edges, two typed arrays in base64 and never one object per pair, and `core/brain.mjs`
adds them as a section of the same streamed document together with `ledger: { seq }`. The
snapshot is version 2; a version 1 file that has neither section restores exactly as it did,
with empty counters and a ledger that starts where a new one starts. On restore the ledger
continues from the snapshot's seq and never moves backwards, so the restore event takes the
seq the snapshot event took and a seq is never spent twice. `lab/replay.mjs` no longer sets
`brain.ledger.seq` by hand, `record()` reports the counters the snapshot carried rather than
the ones left at the end, and `replay()` reports `coactPending` measured on the restored brain
with `coactMatch` against the manifest.

The scheduler's tie-break is the cell id. `Scheduler.byId` sorts the due cells before the bid
sort, and the bid sort is stable, so equal bids are funded in id order whatever order the
cells were registered in. `Brain.restore(dir, opts)` keeps its argument order and now says in
the file why it must.

Measured, before and after, by one script over the same five fixtures (it lives in this
session's scratchpad; `test/core.test.mjs` and `test/lab.test.mjs` assert the same behaviours
on the same fixtures). Before, with core as it was:

```
1 ledger seq   baseSeq=68 events=240 | restored ok=true divergence=none | counter at zero ok=false divergence=0 field consumed
2 coact        pendingAtSnapshot=2 counts=[5,4] manifest.coactPending=1 grown=1 | restored ok=false divergence=32 field by fingerprintMatch=false | cleared ok=false divergence=32 field by fingerprintMatch=false
3 snapshot     bytes=7305 cells=4 edges=3 coactPending=1 ledgerSeq=167
4 tie-break    cells=8 shuffles=64 ticks=24 differentOrders=64 identicalAllocations=7/64
5 goal-routing verdict=confirmed treatmentMean=0.41875 controlMean=0.125 effectMean=0.29375 share=0.000015 wins=16 losses=0
```

After, with the same fixtures:

```
1 ledger seq   baseSeq=68 events=240 | restored ok=true divergence=none | counter at zero ok=false divergence=0 field consumed
2 coact        pendingAtSnapshot=2 counts=[5,4] manifest.coactPending=2 grown=1 | restored ok=true divergence=none fingerprintMatch=true | cleared ok=false divergence=32 field by fingerprintMatch=false
3 snapshot     bytes=7434 cells=4 edges=3 coactPending=1 ledgerSeq=167 | before=7305 added=129
4 tie-break    cells=8 shuffles=64 ticks=24 differentOrders=64 identicalAllocations=64/64
5 goal-routing verdict=confirmed treatmentMean=0.418125 controlMean=0.125 effectMean=0.293125 share=0.000015 wins=16 losses=0
```

Line 1 reads the same in both because the before run still had the workaround in
`lab/replay.mjs`; the after run has none, and the replay is clean on the snapshot alone. Its
control arm is the number that matters: with the ledger counter put back to zero the very
first event of the window diverges, at index 0, on the field `consumed`. Line 2 is the
structural one. A recording whose counters stood at two pairs, counts 5 and 4 against a
threshold of 8, used to diverge at event 32 on the field `by` and to miss its fingerprint;
it now replays clean over 243 compared events with the fingerprint matching, and clearing the
restored counters puts the same divergence back at event 32. Line 3 prices the two new
sections at 129 bytes on a four cell, three edge brain with one pending pair: 7305 becomes
7434. Line 4 is the tie-break: 64 shuffled registration orders of eight equal cells under a
budget of one gave 7 of 64 identical allocations before and 64 of 64 after, and the cell that
takes the budget every tick is now the lowest id rather than whichever cell happened to be
added first.

One consequence that belongs to this subsystem and is not fixed here. The tie-break moved
`goal-routing`'s TREATMENT arm: `treatmentMean` 0.41875 becomes 0.418125 and `effectMean`
0.29375 becomes 0.293125. The control arm did not move at all (0.125 on all 16 seeds, before
and after), the permutation share is unchanged at 0.000015, the verdict is still confirmed and
the pairs are still 16 wins to 0 losses, so nothing about the finding changes. What changes is
reproduction: `lab/verdicts/goal-routing.json` and `bench/verdicts/lab.json` were written
against the old tie-break, so `node bench/lab.mjs` will now report a mismatch on that arm
until both are re-run. Those two files belong to another builder's list in this session and
were left untouched. Whoever owns them next should run `node lab/cli.mjs run goal-routing`
and then `node bench/lab.mjs`, and while doing it delete the paragraph of
`lab/experiments/goal-routing.mjs` that shuffles the registration order per seed for a reason
that no longer exists, or keep the shuffle and say in the file that it now grades nothing.

Requests for core from this round: none of the five is left open. What this subsystem asks
next is smaller. `Gate.serialize()` does not record which registered kinds a brain's gate has
seen, so a restored brain with a pending `lab.integrate` cannot report the kind's policy
unless the subsystem that owns it has been imported again; a list of kinds in the gate's
serialization would make a restored pending queue self describing. And `replay()` still grades
`ok` on the event stream and the fingerprint alone: `coactMatch` is reported but not part of
it, because a recording made before core carried the counters has no count to match. Once no
such recording is left, fold it in.
