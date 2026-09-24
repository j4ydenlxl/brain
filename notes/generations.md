# generations: notes to the core owners

Every number below came off a run on this machine (Windows 11, node v24, 32 logical cpus).
Nothing here is an estimate.

## Requests for core (worked around, not edited)

1. **Vec carrying cells ignore the edge weight.** In `cells/basic.mjs` only `hv.bundle`
   reads `it.w` on a delivered signal. `vec.mlp`, `vec.gain` and the rest drop it. A NEAT
   style weight gene is meaningless on a cell that never looks at the weight, so the
   generations engine registers two of its own kinds in `generations/palette.mjs`,
   `gen.node` and `gen.ema`, whose whole job is `sum(w * x)`. They are namespaced `gen.`
   and guarded with `hasKind` so they cannot collide with anything `cells/*.mjs` adds.
   Request: either document that the edge weight is per kind and optional, or give
   `core/cell.mjs` a declared flag for it so a search knows which kinds a weight gene bites.

2. **The default Brain allocates for a brain, not for an episode.** A race episode builds
   and throws away one Brain per car. `new Ledger()` reserves a ring of 100000 slots and
   `new Connectome()` reserves 1024 edges across ten typed arrays, about 34 KB, for a
   genome that usually has fewer than 20 edges. `generations/genome.mjs buildBrain()`
   therefore replaces both after construction: a 16 slot ring, and a connectome sized to
   `genome.edges.length + 2`. Request: let the Brain constructor take `ledgerRing` and
   `connectomeCapacity` so a short lived brain does not have to be rebuilt from outside.

3. **`connect()` is deliberately looser than the genome needs, and that is fine, but it
   is worth writing down.** `core/brain.mjs` line 78 admits a wire when ANY kind can meet
   (`outKinds.some(...)`) and refuses the wrong signal later at emit time. The genome uses
   the stricter `every` rule (`palette.mjs portsCompatible`), because a genome that wires
   `predict.next` (can emit vec, hv or num) into a vec only port would run and silently
   drop signals, which reads as a dead lineage rather than a bug. No change requested, only
   a note that the two rules differ on purpose. The test
   `genome: instantiate builds real cells and edges into a Brain` pins both.

4. **Edge delay semantics.** `_schedule(this.clock.t + 1 + delay[e], ...)` means `delay: 0`
   is one tick of latency, not zero. Genome edges are written against that. Every task reads
   its output cell's state through `palette.readVec` instead of the outbox, so a task still
   scores correctly if an added out edge swallows the emission.

## Measured, for anyone reading the bench

**Worker scaling is sublinear, and the reason is allocation, not the pool.** Sweep over
1500 race genomes, 2 episodes each: serial 871 genomes/s; 4 workers 3.36x; 8 workers 5.04x;
16 workers 5.26x; 24 workers 4.85x; 32 workers 4.06x. A pure CPU control harness on the
same pool reached 13.66x at 32 workers with 93 percent utilisation, so the pool design is
sound and the race episode is allocation and GC bound. Switching the job and result payload
to one JSON string per chunk and shrinking per episode allocations each gave no measurable
gain. The bench prints workers and the real throughput; it does not claim linear scaling.

**Archive parent sampling was the dominant cost of a generation until it was cached.**
`sampleParents` sorted the whole archive and scored novelty (a distance to every descriptor
in the sample) for every entry, about 30 times per generation, growing with the archive. On
an 8 s, population 120 run that held evaluation to 7.2 percent of wall time: 10 generations,
163.7 genomes/s. With `_ranks()` caching the two shortlists per `stats.added` and bounding
novelty candidates to 192: 129 generations, 2316 genomes/s, 4632.1 episodes/s, evaluation
87.1 percent of wall.

**A real bug the test suite caught.** `crossover()` computed the side label as
`(which === 'a' && side === 'a') || (which === 'b' && side === 'b')`, but `align()` labels
genes by the position it is handed them in and is always handed the fitter parent first.
When parent b was the fitter, the child inherited disjoint and excess genes from the WEAKER
parent. Fixed to `side === 'a'`; the test
`crossover: alignment splits matching, disjoint and excess` pins it in both directions.

**`predict.next` cannot be inserted by an add cell mutation and never could.** A split needs
both halves legal, and its prediction port can emit hv and num, which no vec cell accepts.
It was removed from the sequence task's add cell palette; it stays in that genome as the
unwired control cell whose `state.lastError` is the baseline every sequence fitness is
printed next to.

**xor calibration**, population 48, 2 episodes, serial, cap 40 generations, threshold 0.95:
seeds a to h all solved, at generations 25, 9, 6, 9, 5, 17, 15, 6. The threshold is 0.95
because accuracy can only be 0, 0.25, 0.5, 0.75 or 1 and fitness is accuracy minus a small
residual, so anything above 0.75 is four cases out of four and nothing else reaches it.

**Core suite.** `node --test test/core.test.mjs` had 3 failures before this subsystem
existed (hypervectors, "periodic cells fire on their period", "growth proposals"). They are
not owned here and nothing in `generations/` depends on those paths.

## Answered in core (2026-09-16, later)

Request 2 done: Brain takes ledgerRing (default 100000) and connectomeCapacity (default 1024) in its constructor, so an episode brain can be built small. Request 1 stands as documented: edge weight is per kind; only hv.bundle reads it today. core 15/15, generations 16/16 after the change.

## The organism genome, deep time and creativity (2026-09-16)

`generations/organism-genome.mjs` and `generations/epochs.mjs` evolve the WHOLE organism
rather than a twenty cell circuit: per region cell kind mixes, shares of the major nodes,
period mixes, delay scales and learning policy, plus the four scale genes buildOrganism
already takes. Four requests came out of building it. None of them was worked around by
editing a file this subsystem does not own.

### Requests

4. **`buildOrganism` has no `regions` option.** It reads the module level `REGIONS` table
   of `seeds/organism.mjs`, so a genome that wants a different share or a different roster
   per region cannot pass one. `buildFromOrganismGenome` therefore writes the genes into
   that exported table, calls `buildOrganism`, and restores the table in a `finally`. Two
   tests pin the restore: one on the happy path and one on a build that throws. Request:
   a `regions` argument on `buildOrganism` that defaults to the table, which would delete
   the patch and make concurrent builds possible. Until then no two organisms may be grown
   at the same time in one process, which is true today because an evaluation is
   synchronous from its first line to its last.

5. **A period is registered in the tick wheel at `addCell` time.** `core/clock.mjs` indexes
   a cell by its period when the brain registers it, so a period gene cannot be written
   into `cell.policy.period` after the build without the wheel going stale.
   `applyPeriodAndPolicyGenes` therefore calls `clock.unregister`, writes the period, and
   calls `clock.register` again. That is the public path and it works. Request: none, only
   the note that `policy.period` is not a plain field and must never be assigned directly.

6. **Two of the three task suites are unreachable from this gene space.** `tasks/index.mjs`
   has three suites. The algebra suite is made of `sym.eval`, `sym.solve`, `num.compare`
   and `num.arith`, all of which the cognitive roster carries, so a genome can contain it
   and the task score moves when a mutation drops one of those kinds. The sequence suite is
   made of `seq.fit`, and the grid suite of the `grid.rotate`, `grid.flip`, `grid.transpose`,
   `grid.crop`, `grid.translate` and `grid.tile` family. No region roster of
   `seeds/organism.mjs` carries any of those, so NO genome in this space can ever host
   them. The task score is therefore divided by the number of HOSTABLE suites, computed
   from the union of the rosters, not by three: a denominator of three would have published
   a ceiling of one third and called it a score. `hostableSuites()` reports the unreachable
   ones by name with the kinds they want. Request: put `seq.fit` in the cognitive or
   association roster and the grid family in the perception roster, and the denominator
   moves on its own with no change here.

7. **The suite runs on its own brain, not inside the organism.** `runAlgebra` builds its own
   eight cell brain. What the task component measures is therefore whether the organism
   CONTAINS the machinery a suite needs and how that machinery scores, not the organism
   solving the suite through its own connectome. It is a function of the organism's kind set
   and of nothing else, which is why one run per eligible set is memoised. Request: a
   `brain` argument threaded through `solveAlgebra` already exists; what is missing is a way
   to name the cells of an arbitrary brain to inject into, which is what would let a suite
   run inside the organism. That is the next honest version of this component.

### Measured, on this machine

- **Throughput is the one component that is not deterministic.** prediction, task, cost and
  novelty are a pure function of the genome, the seed and the archive handed in. throughput
  is cell runs per wall second. Two evaluations of one genome therefore disagree in the last
  places of the scalar, and on a tie that decides which of two organisms holds a cell of the
  archive. The test asserts the four exactly and holds throughput to a band. Measured spread
  on identical work at 48 cells: the two scalars differed by 0.000508 of 0.212.
- **Surprise must be read on the ticks a predictor RAN.** Reading `cell.stats.surprise` once
  per window instead re-reports the last error a cell wrote, however many windows ago. The
  first version of the evaluator did that and printed four identical window means of
  0.063629150390625 on an organism whose predictors were in fact firing, which scored every
  organism the neutral 0.5 and gave the search no gradient at all. Sampling only on the tick
  a predictor's run counter moved turned the same organism's four windows into 0.0363,
  0.1067, 0.1282, 0.1260: error RISING, which is a real reading and a real score of 0.
- **`BOUNDS.rosterLength` is 16 because the longest roster is 14.** At 12 the default genome,
  every kind weighted 1, silently lost two kinds of the cognitive roster to the largest
  remainder, which made the algebra suite ineligible for the DEFAULT organism. That is a
  score decided by a constant in this file rather than by a gene anybody chose.

### The first deep time run, 5 minutes, this machine

`node bench/epochs.mjs --minutes 5 --pop 12 --ticks 160 --emit 20`, verdict in
`bench/verdicts/epochs.json`:

- 302.38 s wall, **100 generations**, **19.842 generations/minute**, 3.0238 s/generation mean.
- 1200 organisms evaluated, 192000 ticks. Years: 1200 x 160 = 192000 ticks; x 0.001 s/tick
  = 192.000 organism-seconds; / 31557600 s/year = **6.084113e-6 organism-years**. One
  lineage over the 100 generations is 5.070094e-7 organism-years. Those are the numbers the
  declared clock gives. A headline of millions of years is a statement about
  `secondsPerTick`, not about this engine, and the flag that would produce it is
  `--seconds-per-tick`; nothing here quotes a number the manifest did not declare.
- Archive: **119 of 2401 cells filled, 4.956 %**, qd 79.077654. 119 placed, 144 replaced,
  937 rejected of 1200 evaluated. Fill rose 10, 16, 21, 23, 26 over the first five
  generations and was still climbing at generation 100, which is what an archive that keeps
  different organisms looks like and is not what a single best-of would look like.
- Best: 0.8423 (og-g77-11, cell 5-1-2-4, generation 77, 275 cells, 532 edges), components
  prediction 0.9994, task 1.0000, throughput 0.7713, cost 0.9983, novelty 0.2453.
- Emission: 20 elites under `organism/gen-<generation>-<slot>/`, **21153 generated lines in
  100 files**, counted by reading the files back; the emitter reported the same number.
  Gate total after the run: 507145 generated lines in 129 files, which is the pre-existing
  `organism/gen-0` (485992 in 29) plus this run's 21153 in 100.

## Requests 4, 6 and 7 answered (2026-09-17)

Three of the four requests the last section filed are closed. The fourth, request 5, asked
for nothing, and nothing was done to it.

### 4. buildOrganism takes a regions table now

`buildOrganism` has a `regions` option that defaults to the `REGIONS` table
`seeds/organism.mjs` exports. The table is read and never written. It is validated by
name on the way in: a region with no roster, a share that is not a positive number, and a
`flow` entry naming a region the table does not declare are all refused with the region
named, because a flow to a region that is not there would otherwise be met later as an
undefined range rather than as a mistake.

`buildFromOrganismGenome` builds its own table per call, one entry per exported region
with the gene's share and a roster expanded from the gene's kind mix, and hands it over.
The patch of the exported table and the `finally` that put it back are gone. The two
tests that pinned the restore were re-examined rather than kept: the happy path one still
says something real once it is reworded to assert the exported table is never written at
all, so it was kept in that form; the one that made a build throw inside the patched window
was testing a `finally` that no longer exists, so it was replaced by the thing the request
was for. `build: two organisms with different rosters are built in one process` builds
organism A, then organism B with a different cognitive roster, then A again, and asserts
each was built from its own roster and that A did not change when B was built. A table
patched and restored per call would have passed the old test and could not have been asked
this question at all.

### 6. seq.fit and the grid family are in the rosters, and the denominator moved on its own

`seq.fit` is the last kind of the cognitive roster; `grid.rotate`, `grid.flip`,
`grid.transpose`, `grid.crop`, `grid.translate` and `grid.tile` are the last six of
the perception roster. Neither family is registered by `cells/index.mjs`, so
`seeds/organism.mjs` now imports `cells/grid.mjs` and `tasks/sequence.mjs` as well.
Both families guard their input: a grid cell returns nothing unless what reached it is a
valid grid, and `seq.fit` returns nothing unless the event carries an array of terms, so
they are inert in an organism nobody has injected a grid or a tape into. Fifty ticks of a
freshly grown organism raise 0 errors and 0 refusals, as before.

`BOUNDS.rosterLength` was 16 because the longest roster was cognitive at 14. The longest
roster is now perception at exactly 16, so the default genome, every kind weighted 1, still
gives every kind one slot and the constant did not have to move. Any roster that grows past
16 must move it.

Nothing in `hostableSuites()` was touched. The denominator is the union of the rosters
against the kinds each solver is made of, so it moved by itself: **1 of 3 hostable before,
3 of 3 after**, with the roster vocabulary going from **47 kinds to 54**. Before, the run
printed `unreachable sequence (missing seq.fit); grid (missing grid.rotate grid.flip
grid.transpose grid.crop grid.translate grid.tile)`; after, it printed `unreachable none`.

### The deep time A/B, three minutes a side, this machine

`node generations/bench-hostable.mjs --label before|after --minutes 3 --seed hostable`,
verdict in `bench/verdicts/generations-hostable.json`, node v24.15.0, 32 cpus. The two
runs are the same command on the same machine with the same seed and the same budget, and
the only difference between them is the two roster lines of `seeds/organism.mjs`.

This drives `generations/epochs.mjs` directly rather than `bench/epochs.mjs`, for one
reason written down so nobody reads it as a second engine: `bench/epochs.mjs` calls
`engine.checkpoint()` unconditionally at the end of a run, which writes under
`brain/state`, and this session may not write there. It is the same `Epochs` object with
the same defaults, run with `checkpointEvery 0`, emission off and a checkpoint directory
outside the repository.

| | before | after |
|---|---|---|
| hostable suites | 1 of 3 | 3 of 3 |
| roster vocabulary | 47 kinds | 54 kinds |
| wall | 180.051 s | 180.343 s |
| generations | 303 | 518 |
| organisms evaluated | 3636 | 6216 |
| ticks | 581760 | 994560 |
| archive fill | 174 of 2401 (7.247 %) | 211 of 2401 (8.788 %) |
| qd | 129.333021 | 144.096307 |
| best fitness | 0.856664 | 0.847174 |
| best task component | 1 | 0.972222 |
| elite task mean | 0.988506 over 174 elites | 0.814903 over 211 elites |
| eval errors | 0 | 0 |

The best organism before was og-g1-6, cell 4-3-3-4, generation 1, 114 cells, 517 edges. The
best after was og-g456-11, cell 2-2-1-3, generation 456, 370 cells, 692 edges, components
prediction 1.0000, task 0.9722, throughput 0.9118, cost 0.9978, novelty 0.1830. The printed
deltas are hostable +2, best task -0.027778, best fitness -0.00949, archive fill +37,
generations +215.

**The task score went DOWN and that is the point.** Before, the score was one suite over a
denominator of one, so an organism that carried `sym.eval`, `sym.solve`, `num.compare`
and `num.arith` scored 1 and there was nothing further to reach: the elite task mean was
0.988506, which is a ceiling dressed as a score. After, three suites are scored over a
denominator of three and the elite task mean is 0.814903, because a small organism often
carries the kinds of one or two suites and not all three. The best organism's own task
component fell from 1 to 0.972222 for the same reason. The archive filled 37 more cells and
the run got through 215 more generations, which is not a claim about the roster: a run with
a wider gene space drew different organisms and a different mix of sizes, and generations
per minute is a function of the sizes drawn.

### 7. A suite runs inside the organism now

`tasks/host.mjs` is the answer to "a way to name the cells of an arbitrary brain to inject
into". Two functions and one cell kind:

`nameCells(brain, roles)` takes a list of roles, each a cell kind and an optional predicate
on the cell (the `num.arith` roles are told which `op` they want), and returns the map of
role to cell id plus the roles this brain has no cell for. It is deterministic: the lowest
cell index wins, except that a cell on period `event` beats one on a numeric period,
because a cell that runs once an organism-hour will not answer a question this tick.

`attachTap(brain, cellId)` is a read head, and it exists because of something that is only
obvious once a suite is pointed at a real organism: `Brain._emit` puts a signal in the
outbox only when it routed to NOBODY, and every out port of an organism is wired by
construction, so a cell inside the organism can compute the right answer and the suite can
never see it. A tap is one `task.tap` cell wired from the target's out port and left with
no out edge of its own; it re-emits what it was handed, unrouted, into the outbox. The cost
is one extra tick, since a signal takes at least one tick to cross an edge, which is why a
hosted solve ticks twice per problem where the suite's own brain ticks once. A test pins the
failure the tap is for: a `num.arith` cell wired to a sink reaches the outbox 0 times, and
the same cell with a tap reaches it once, with the right answer.

`solveAlgebra` and `solveSequences` take a `cells` option, role to cell id. Absent, they
use the ids of the brain they build for themselves and behave exactly as before, one tick
per problem and the answer read from the outbox. Present, they read through a tap. A role the
host brain cannot fill is recorded on the result as `no cell for role <role>` and graded
wrong, rather than thrown, so a hosted run reports what the host cannot do instead of dying.

**Which suites run inside the organism.** Algebra and sequence do. Grid does not, and the
reason is structural rather than missing work: `solveGrids` answers by wiring the program
its search found as a fresh chain of grid cells and running that chain, so the cells that
compute the answer are built for the task. There is no existing cell in any brain to name.
Putting the grid kinds in the perception roster made the grid suite HOSTABLE in the sense
request 6 asked for, that a genome can contain the machinery, and it did not make it
runnable through the organism's own connectome. Both things are true and they are not the
same thing.

### Measured: the same problems, both ways

On a 200 major, 8 subcell organism grown by `buildOrganism` at seed `organism`, 1600
cells and 17906 edges as grown:

- **algebra: 120 of 120 on its own brain, 112 of 120 inside the organism, difference
  -0.066667.** Every one of the 8 misses is a problem whose route wants a `num.arith` cell
  with `op` `/` or `^`, and the organism has neither: `paramsFor` gives a
  `num.arith` cell one of `+`, `-`, `*`. The test asserts exactly that, problem by
  problem, rather than accepting the total: every failing problem's role is one of the roles
  `nameCells` reported missing, and there is no third category.
- **sequence: 44 of 44 both ways, difference 0.** One `seq.fit` cell in the cognitive
  region answered every problem the suite's own `seq.fit` cell answered.
- **0 cell errors** were raised inside the organism while both suites ran.
- The organism ended the run at 1607 cells and 20506 edges: 7 read heads and their 7 edges,
  plus **2593 edges that co-activation growth added while the suites were ticking**, which
  `brain.stats.grown` reports as 2593. A hosted run is not free of the organism; it is a
  measurement taken while the organism is alive.

The honest reading of the algebra difference: what the suite measures inside the organism is
still not the organism REASONING. It is the organism's own cells of the right kinds, reached
through its own connectome and read through a tap, doing the arithmetic. That is strictly
more than the old version, which only asked whether the kind set was present, and it is
strictly less than an organism that routes a problem to the right cell by itself. The next
honest version of this component is the routing.

### What is requested from core

1. **`num.arith` cannot be given `/` or `^` inside the organism, and that is why the
   hosted algebra score is 112 of 120 rather than 120.** It was left that way deliberately:
   `S.ratDiv` throws `num: division by zero` on a zero divisor, and `S.ratPow` computes
   `a.n ** k` for whatever BigInt `toRat` makes of the exponent, so an organism cell of
   either op fed by its own connectome could throw on every tick or hang on one. Request: a
   `num.arith` that emits nothing on a zero divisor instead of throwing, and that refuses an
   exponent outside a declared bound instead of raising a number to it. With those two
   guards the organism can carry all five ops and the hosted algebra suite has a route for
   every problem.
2. **A signal cannot be read out of a wired cell without adding a cell.** `task.tap` works
   and costs one cell, one edge and one tick, but it is a cell in the organism that the
   organism did not grow. Request: an `afterTick` hook that carries the SIGNALS a named
   cell emitted, not only the indices of the cells that fired. `Brain._emit` already has
   the signal in hand at the moment it routes it.
3. **Growth runs while a suite is being measured.** 2593 edges were added by co-activation
   during a run that was supposed to measure an organism as grown. `buildOrganism` takes a
   `growth` option and the generations evaluator already passes a threshold nothing can
   reach, but a caller who just wants to ask an organism a question has to know that. Not a
   defect, a request for a named way to say "hold structure still for this measurement".

### What is on disk

`seeds/organism.mjs` (regions option, two imports, two rosters, params for the seven new
kinds), `generations/organism-genome.mjs` (the patch deleted, the header and the
denominator comment rewritten), `generations/bench-hostable.mjs` (new),
`tasks/host.mjs` (new), `tasks/algebra.mjs` and `tasks/sequence.mjs` (roles, the
`cells` option), `tasks/index.mjs` (the new exports), and the tests in
`test/epochs.test.mjs`, `test/genome.test.mjs` and `test/tasks.test.mjs`. Per file:
`node --test test/epochs.test.mjs` 29 pass 0 fail, `node --test test/genome.test.mjs` 36
pass 0 fail, `node --test test/tasks.test.mjs` 15 pass 0 fail.

## planes: hundreds of simulation coordinates at once (2026-09-17)

`generations/epochs.mjs` runs ONE search: one seed, one scale box, one seconds per tick, one
archive. A **plane** is a point in the space of searches, written down so it can be
reproduced, compared and run beside hundreds of its neighbours. The coordinate is

    { seed, world, secondsPerTick, epochScale }

with `world` either a POLICY world (the declared reach the organism would run under;
`world/policy.json` is the only policy shipped and it denies everything) or a VENUE world
naming a tape segment by venue, instrument count, readings per instrument and offset.
`secondsPerTick` is the time dilation axis, drawn from a declared ladder of eight rungs from
0.001 s to one Julian year per tick. `epochScale` is popSize, ticks per organism, windows and
the four scale ranges the organism shapes are drawn from.

### What the world does, and what it does not do

The world is an axis. It enters the run in exactly two places: it is mixed into the engine
seed, so two planes differing only in their world are two different searches, and it carries
the `suites` flag the evaluator is called with. A plane does NOT open a socket, read
trader.db, arm a policy or replay a tape. A venue world's segment is a DESCRIPTION of the
tape a later bench would replay, recorded so the plane that searched for it can be found
again, not evidence that the tape was replayed. Anything stronger than that is the next
piece of work, not a claim this bench supports.

### Reproducibility

`planeDescriptor` fingerprints the coordinate through canonical JSON (keys sorted at every
depth) so two code paths that set the same fields in a different ORDER still agree the plane
is the same plane, and the plane INDEX is deliberately left out so the same point reached
from two sweeps is recognised as one point. `node --test test/planes.test.mjs`: **9 pass, 0
fail, 4023.0061 ms**. It grades the fingerprint against a control, because a descriptor that
never changed would also rerun identically: 64 planes give 64 distinct ids, a second sweep
base gives 64 ids disjoint from the first, and each of seed, world, secondsPerTick and
epochScale moves the id while the index does not. Rerunning one plane reproduces
generations, organisms, ticks, simulated years, archive fill and the best grid cell exactly;
fitness is asserted to a band, not exactly, because it carries a throughput term measured in
cell runs per wall second.

### Child processes, and why

Ten planes run back to back in ONE process took resident set from **85.559 MB to 866.277 MB**
and it never came back down: a brain built in a process leaves module level state behind
that a later build never frees, the same thing `bench/footprint.mjs` found. So the sweep is
chunked into short lived children (`--chunk`, default 6 planes a child) and the chunks are
handed out from a single shared cursor, so a slow arm of the coordinate space cannot land
entirely on one worker and bend the wall clock. Worker threads were not used: a child exits
and its memory goes back to the operating system. The worker count is the lower of the cores
minus two and what free memory allows at 900 MB a child, and the reason a number was lowered
is printed rather than silently applied. A plane writes nothing at all, so `state/soak` is
untouched by any number here.

### Measured: 200 planes, tick budget 2000 each

`node bench/planes.mjs --planes 200 --ticks 2000`, 30 workers, verdict
`bench/verdicts/planes.json`:

- **200 planes completed, 0 failed**, 200 distinct descriptors over 200 rows.
- **34.888 s of sweep wall** against **850769.8 ms of child wall: 24.386x**.
- **1189 generations, 8346 organisms, 443548 ticks**, at **12713.521 ticks per wall second**.
- **5.506135e+4 organism-years** simulated, which is **1.578236e+3 organism-years per wall
  second**. The arithmetic is carried beside it: the sum over the 200 planes of that plane's
  ticks times its own declared seconds per tick, divided by 31557600 s/year. The years are a
  DECLARATION per plane, never a measurement, and the bench prints the declaration so a
  reader can undo it.
- **Cost per plane: 4253.8 ms** mean measured inside the child, **174.4 ms** of sweep wall,
  **139.168 MB** mean rise in resident set, peak child resident set **965.438 MB**. The two
  wall figures differ by the speedup, and both are printed because neither alone is the cost.
- **Archive coverage 74 of 2401 cells (3.082 %) after the first generation, 133 (5.539 %) at
  the end, gained 59.** Each plane keeps its own archive, so this is the union across the
  sweep, not what any one search found: **18.195 cells** per plane on the mean, 3639 placed,
  1833 replaced, 2874 rejected of 8346 evaluated.
- Best over the sweep **0.803782** (`og-g2-1`, plane 55 `p865afad0`, grid cell 6-3-3-4,
  generation 2, 170 cells, 1044 edges).

### What is on disk

`generations/planes.mjs` (the coordinate, its descriptor, `runPlane`, the declared ladders),
`bench/planes.mjs` (the sweep, the child mode, the verdict), `test/planes.test.mjs`,
`bench/verdicts/planes.json`. Neighbours re-run: `node --test test/generations.test.mjs`
**16 pass, 0 fail**; `node --test test/epochs.test.mjs` **28 pass, 1 fail**, and that one
failure is not this work: "genome: the default genome is valid and carries every region"
counts 17 regions where it expects 16, which is somebody else's region added to
`seeds/organism.mjs` while this was being built.

## reproduce: an organism makes children, and they are saved (2026-09-17)

His words: "It actually needs to be reproducing itself, which is what ASI is. Getting better
by itself. And saved states". Three claims. Two of them are now on disk and working. The
third one, getting better, does not clear its own control yet, and most of this section is
about that.

`brain reproduce <name> [--children N] [--ticks T] [--seed S] [--approve]`. From the named
organism's genome it mutates (and crosses) N children, evaluates each on the hostable suites
for T ticks, ranks them on the Pareto front, writes every child to `state/<name>-child-<k>`
through the same path `init` and `snapshot` use, and proposes the best one on the PARENT's
gate as kind `self.reproduce`. Without `--approve` the proposal HOLDS. With it, the parent's
`meta.json` gains a lineage entry and a `self.reproduce.lineage` ledger event records it.

### The loop closes, and where it closes

A child is a first class organism, not a report about one. Its genome travels beside its
snapshot in `meta.json`, which is what lets a child be reproduced from in its turn.
Measured, on the CLI, two generations deep:

```
brain reproduce cli2        --children 3 --ticks 48 --seed cli --approve
brain reproduce cli-child-3 --children 2 --ticks 48 --seed g2  --approve
```

Generation 1 promoted `cli-g0-c1-3` at fitness **0.440939** against a parent bar of
**0.429502**, on 3 suites (algebra, sequence, grid). Generation 2 promoted `cli-g0-c2-1` at
**0.652029** against **0.461196**, on **4** suites: that child had grown the venue kinds, so
the venue suite became hostable for it and the denominator moved on its own, the same way it
moved when the rosters grew.

### The parent is evaluated twice, and the children run between the two readings

Three of the five objective components are pure functions of the genome; throughput is a wall
clock measurement. So the parent is evaluated once before the children and once after, the
bar a child must clear is the BETTER of the two readings, and the drift is printed. Mean
drift per arm over 12 rounds: **0.000142, 0.000085, 0.000121** (post minus pre). The drift is
small. It is not what the trouble is.

### Measured: `node bench/reproduce.mjs --rounds 12 --ticks 48 --majors 40 --arms 2,4`

Three arms interleaved round by round, never arm by arm, 36 runs, **120 child state
directories written in 8.89 s of sweep wall**. Verdict `bench/verdicts/reproduce.json`.

| arm | runs | kids | ms/run | ms/kid | parent | best | gain | beat | front | regr | promo | MB/kid |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| children=2 | 12 | 24 | 231.3 | 115.7 | 0.452038 | 0.488333 | 0.036295 | 0.5 | 1.5 | 3 | 8/12 | 0.953 |
| children=4 | 12 | 48 | 243.6 | 60.9 | 0.452354 | 0.524786 | 0.072432 | 0.4375 | 2.33 | 11 | 8/12 | 0.942 |
| placebo rate 0, children=4 | 12 | 48 | 221.9 | 55.5 | 0.452595 | 0.485746 | 0.033151 | 0.25 | 1.42 | 0 | 6/12 | 0.918 |

A child costs **60.9 ms** at four to a generation and **0.942 MB** on disk. Doubling the
children roughly halves the cost of each one, because the two parent evaluations are paid
once per run whatever N is. The first run of a sweep also pays for loading every cell kind
and filling the suite cache: **1000.9 ms** against **154.2 ms** for the same arm in round 3
(`node bench/reproduce.mjs --rounds 3 --ticks 48 --majors 40 --arms 2,4`), so the bench now
discards one warm up run before its clock starts. Interleaving spreads drift across the arms;
it cannot spread a cost that is only ever paid once.

### The control, and what it says

The placebo arm keeps EVERY GENE of the parent and differs only in the id the build seed is
derived from. It is the same four organisms every round; only the evaluation seed moves. It
still promoted **6 of 12** runs, against **8 of 12** for each mutated arm: promotion rate
**0.6667 against 0.5, gap 0.1667**, which is two runs of difference on twelve. Mean gain
**0.054363 against 0.033151, gap 0.021212**, and the placebo's single best gain was
**0.149856**, from a child that carries no gene the parent does not have.

So: **at 48 ticks and 40 majors the promotion bar is not measuring the genes.** A wiring seed
alone buys a gain of up to 0.149856, which is larger than the whole gap between the arms.
"The best child beat the parent" is a sentence this machinery produces for gene identical
children half the time. Nothing here has shown the organism getting better by itself.

Two things keep that from being a claim made to anyone: the gate HOLDS, so no noisy child
ever changes a parent without a human typing `--approve`; and the per suite check is exact
rather than statistical, so a child that lost a suite is refused whatever its scalar says.
That check is doing work: the mutated arms produced **3** and **11** suite regressions over
the sweep and the placebo produced **0**, which is the one place where mutation and its
control separate cleanly.

The fix this asks for is a MATCHED CONTROL INSIDE EVERY RUN: one clone child per generation,
and a bar that the best mutated child must clear against the best CLONE rather than against
the parent alone. That changes what `--children N` means, so it is written here rather than
built. His call.

### The suites saturate at this size

Every hostable suite scores 1.0 for parent and children alike at 40 majors. The per suite
comparison can therefore only catch a LOST suite, not a lower score. It is a floor, not a
ruler, until the organisms are large enough or the suites hard enough to sit below 1.

### Reproducibility is keyed to the genome, not to the directory

The evaluation seed and every child id are built from the PARENT GENOME's id, never from the
state directory's name. Two directories holding the same organism are the same organism and
must breed the same children. This was found by the control in `test/reproduce.test.mjs (e)`:
keyed to the directory, two copies of one organism gave the same cell counts and different
edge counts, because the build seed follows the id. `node --test test/reproduce.test.mjs`:
**10 pass, 0 fail, 3351.9331 ms**.

### OPEN PROBLEM for whoever owns world/venue.mjs

`world.venue`'s `serialize` is not idempotent, so a brain carrying one can be saved twice and
no more.

```
serialize: (s) => ({ ...s, queue: [], queuedAtSnapshot: s.queue.length, trades: s.trades.length })
```

`trades` is an array on a live cell and a NUMBER after one save. The second save reads
`(0).length`, which is `undefined`, and `JSON.stringify` drops the key; the third save reads
`undefined.length` and throws. Measured, on a brain grown from the default organism genome:

```
round 1  trades on the restored cell = 0          save 1 ok
round 2  trades on the restored cell = undefined  save 2 FAILED: Cannot read properties of undefined (reading 'length')
```

at `world/venue.mjs:310`. That file is not this session's and was not edited. Its cost here:
one state directory can be reproduced FROM exactly once, because reproduce loads the parent
and saves it back to persist the held proposal. The lineage still goes arbitrarily deep,
because each generation lands in a new directory. `generations/reproduce.mjs` re-raises the
failure with the children named instead of letting a bare serializer stack stand, and does
not swallow it: a run whose proposal never reached the snapshot put nothing in front of a
human and must not report that it did. The same defect means `brain tick` twice on any
organism carrying a venue cell fails identically.

### What is on disk

`generations/reproduce.mjs` (the kind, its policy, `saveOrganismState`, `parentGenomeOf`,
`compareSuites`, `reproduce`), one `describe` entry in `bin/brain.mjs`,
`test/reproduce.test.mjs`, `bench/reproduce.mjs`, `bench/verdicts/reproduce.json`. Neighbours
re-run: `node --test test/cli.test.mjs test/core.test.mjs` **39 pass, 0 fail, 13543.1813 ms**;
`node --test test/generations.test.mjs test/epochs.test.mjs` **46 pass, 0 fail, 2659.1446 ms**
(the region count failure recorded against `epochs` earlier today is gone). No parent, child
or bench of this work writes anywhere under `state/soak`: the bench redirects
`BRAIN_STATE_DIR` to a temp directory and removes it, and `soak` is refused by name before
anything is read.

## the reproduce bar measures genes, not seeds (2026-09-18)

The bar recorded above promoted a child on ONE reading of the child against the better of two
readings of the parent. `bench/verdicts/reproduce.json` at 2026-09-18T03:03:10.406Z says what
that bar was reading. The placebo arm, whose children keep every gene of the parent and differ
only in their id, promoted at a rate of **0.5** against **0.7084** for the mutated arms, with a
mean gain of **0.033174** against **0.054608** (gap **0.021434**). A bar that a gene identical
child clears half the time is not measuring genes.

### the cause, at a line that is not this file's

`generations/organism-genome.mjs:443` seeds the period and learning draw with
`genome.seed + ':periods:' + genome.id`, so the ID IS A BUILD SEED and not a label. On the
default genome at 40 majors, holding the wiring seed fixed and changing ONLY the id:

```
id effect   prediction id=probe-a 0.714045  id=probe-b 0.571165  fitness 0.633245 against 0.593263
```

0.633245 against 0.593263 on identical genes is larger than the mean gain of a whole mutated
bench arm (0.025733 below). One reading of a child was one draw from that lottery.

### the fix: paired on K build seeds

`reproduce()` takes `--seeds K` (default 5, at least 3) and reads the parent and EVERY child on
the same K build seeds. Seed s of the child is compared against seed s of the parent, so the
period draw, the wiring draw and the suite seed are common to both sides of every pair. A child
is scored by its paired mean gain and by how many of the K pairs it won. The bar is: paired mean
gain above the parent's own seed spread, a majority of the K pairs won (3 of 5), and no suite
regression on the paired means. The parent is still read twice per seed, before and after the
children, and pair s still uses the BETTER of the parent's two readings, so drift can only make
the bar harder. The Pareto front and the gate path did not move: nothing is applied without
`--approve`, and the proposal now carries the K readings of both sides as its evidence.

### measured

`node bench/reproduce.mjs --rounds 12 --ticks 48 --majors 40 --arms 2,4 --seeds 5`, arms
interleaved, node v24.15.0, verdict at 2026-09-18T07:56:25.019Z:

```
arm                           runs  kids  ms/run  ms/kid    parent    spread       gain     won    beat  front  regr  promo  MB/kid
children=2                      12    24   745.3   372.7  0.458412  0.003403    0.01675  2.92/5  0.4167   1.83     3   7/12   0.953
children=4                      12    48   924.5   231.1  0.458586  0.002943   0.034717  3.25/5  0.4583   2.83    11   9/12   0.942
placebo (rate 0), children=4    12    48   869.1   217.3  0.458721  0.002804  -0.000206  1.83/5  0.0625      1   0/12   0.918

control              promotion rate mutated 0.6666 against placebo 0, gap 0.6666
control              mean gain mutated 0.025733 against placebo -0.000206, gap 0.02594
gap spread           sd 0.032949 over 12 rounds, min -0.014313, max 0.097738, positive in 10 of 12
false positive rate  0.209877 implied by the bar, against a measured placebo rate of 0
bar before           2026-09-18T03:03:10.406Z  placebo 0.5  mutated 0.7084  gain gap 0.021434
bar after            placebo 0  mutated 0.6666  gain gap 0.02594
```

120 children saved in 30.97 s of sweep wall, 16 of 36 runs proposed a child. The placebo rate
fell from 0.5 to **0** and sits under the **0.209877** the bar implies, which is
`P(Binomial(5, 1/3) >= 3)`: an UPPER bound, because a gene identical child must also clear the
parent's own spread and 0 of 12 placebo runs did. The gap between the arms is now 0.6666 of
promotion rate where it was 0.2084. `barBefore` was copied off the verdict file by the bench
before the sweep overwrote it; neither bar was typed.

### which spread, and what the other one costs

Two numbers can be called "the parent's own seed spread", and they are not close:

```
parent paired spread 0.003403, 0.002943, 0.002804 (the parent read twice on each seed), min 0.000924 max 0.007571
parent seed range    0.121598, 0.121441, 0.121791 (the parent ACROSS the 5 build seeds), min 0.002738 max 0.284732
```

The bar uses the paired one. The across seed range is reported in every run as
`parentSeedRange`, and applied to nothing, for two reasons. The pairing has already cancelled it
out of every gain, and it is a lottery of its own: the same bench parent read 0.002738 in one
round and 0.284732 in another. Its measured cost, from the run above:
`other floor promotion rate mutated 0.25 against placebo 0`, and test (k), which constructs a
child that hosts a suite its parent cannot host, wins 4 of 5 pairs by 0.039151 against a paired
spread of 0.001097 and would be refused by an across seed range of 0.163110. A bar that refuses a
strictly better child is not a stricter bar.

### what is on disk

`generations/reproduce.mjs` (`DEFAULT_SEEDS`, `buildSeedsFor`, `readingOn`, `evaluateOnSeeds`,
`spreadOf`, `parentBarReadings`, `pairsNeededFor`, `falsePositiveRateOfBar`, `pairChild`,
`meanReading`, the paired terms in `judgeReproduction`), the `--seeds` flag in `bin/brain.mjs`,
`test/reproduce.test.mjs` (i) determinism of the K readings, (j) a placebo refused with a reason
naming the seed spread, (k) the constructed better child clearing the bar, (l) the K readings in
the evidence and on the gate, `bench/reproduce.mjs`, `bench/verdicts/reproduce.json`. Tests re-run:
`node --test test/reproduce.test.mjs test/generations.test.mjs test/epochs.test.mjs test/planes.test.mjs`
**69 pass, 0 fail, 8280.7983 ms**. Nothing of this work writes under `state/soak`: the bench
redirects `BRAIN_STATE_DIR` to a temp directory and removes it.

## the old ruler and the paired bar, read off the same children (2026-09-18, 04:24)

A verdict that a rerun overwrites cannot hold its own "before". The 07:56 run of the paired bar copied the 03:03 verdict as barBefore; the testing plane's 08:00 rerun then copied the 07:56 paired run as its before, and the 03:03 record was gone from the verdict on disk. Two changes, at cause. bench/reproduce.mjs refuses a paired run as a before (a verdict whose config carries seeds is not a before of the paired bar; the unpaired before it holds is carried forward, and none is left, so barBefore is null now). generations/reproduce.mjs computes the ruler it replaced on every generation and applies it to nothing: the genome on its own id, the run's evaluation seed, one reading of the parent before and after the children, one of each child, the better parent reading as the bar, the best child on the front of those single readings, no regression against the parent's first reading. That is exactly how the board 1 code read them (recovered from its transcript: evaluateOrganismGenome(g, { ticks, windows, seed: evalSeed })).

A first reconstruction keyed the readings on the genome id alone, through readingOn, and it is not the old ruler: under it the placebo promoted 0 of 12, with the parent's own reading 0.438956 and the placebo child's 0.435431 in round 1 and the same to the third decimal in every other round, because the child ids are fixed per generation and the readings were then the same four builds every round. With the run's evaluation seed the lottery is back, and it is the one the 03:03 verdict measured.

The run of 2026-09-18T08:24:20.795Z (node bench/reproduce.mjs --rounds 12 --ticks 48 --majors 40 --arms 2,4 --seeds 5), both rulers on the same 120 children:

    old ruler, same run   placebo 0.5833   mutated 0.5417   gap -0.0416
    paired bar, same run  placebo 0        mutated 0.625    gap 0.625     implied bound 0.209877
    gain gap              0.025743, sd 0.03292 over 12 rounds, min -0.014048, max 0.097813, positive in 9 of 12
    parent paired spread  0.002067 mean;  parent seed range 0.121302 mean, applied to nothing
    regressions           3 and 11 in the mutated arms, 0 in the placebo;  120 children in 34891.6 ms of sweep wall

The ruler this bar replaced promoted a gene identical child more often than a mutant. The paired bar refused every gene identical child in 12 runs and promoted mutants in 15 of 24, and its own arithmetic bounds a placebo at 0.209877, so 12 placebo runs cannot separate a true 0 from that bound; the gap 0.625 against 0 is what the run shows. The id effect row in the section above quotes a comment in generations/reproduce.mjs (line 39), not a verdict. test/reproduce.test.mjs (m) grades that the old ruler is computed from own id readings, restates its verdict from its own numbers, and decides nothing: 15 of 15.

## a planes child does not grow (2026-09-18)

A child of the sweep grew, and the growth had one cause. Measured first, inside one process running six planes at 2000 ticks with nothing changed: the hypervector heap of `core/simd.mjs` handed out slots that never came back, `inUse` 14893, 28449, 42259, 59976, then the heap full at 65536, `heapStats().finalizerCalls` reading 0 at every plane, and `rss` 377.543, 480.039, 579.203, 702.297, 821.148 MB. A slot returns in one of two ways, `release()` by an owner who knows nobody else holds the view, or the FinalizationRegistry, which fires only at an event loop turn AFTER a collection. A child that ran plane after plane synchronously gave V8 neither, so the organisms of a finished plane, already unreachable when `runPlane` returned, kept their slots to the end of the child. The archive, the ledger, the mailboxes and retained organisms were not it: the same six planes with `gc()` and three event loop turns between them read `inUse` 55, 61, 62, 84, 93, 93 and `rss` 324.039, 324.910, 324.836, 350.668, 406.070, 406.684 MB, with 93031 of 96308 allocations returned through the registry.

Two changes in `bench/planes.mjs`, both in the child. A collection point between planes: the child spawns with `--expose-gc` and runs `gc()` plus an event loop turn three times when a plane ends, then reads `process.memoryUsage()` and `heapStats()` and carries both into the row, so the series in the verdict is what the child is still HOLDING between planes rather than what it happened to hold mid tick. And a planned heap: `SIMD.plan({ majors })` is called before the first allocation for the largest organism the child will run, because the memory cannot be resized once installed and a child that says nothing gets the main thread default of 512 MB whatever it is about to run. The plan applies (`planned before the first allocation`, 222 MB installed at these coordinates against 512). A whole plane holds more at once than one organism's plan, since no slot comes back inside a plane, and the overflow is counted rather than hidden: fallback 5.362 % mean over 400 planes, 46.09 % at worst, and a fallback is a plain `Int8Array` a collection can take back where a larger wasm memory could not be. Three arms run in one wall window, six planes each, measured the cost of that at nothing: 1473.619, 1459.806 and 1467.732 ticks per second for no plan, a 32768 slot plan and a majors plan.

The same command before and after, `node bench/planes.mjs --planes 400 --ticks 2000 --workers 4`, 400 completed and 0 failed both times. Peak child rss 959.488 MB before, 588.219 MB after, down 371.269 MB (38.694 %); mean peak 676.740 to 449.274 MB. The shape: rss at the start of a plane, by position inside its child, was 62.908, 365.885, 534.606, 669.196, 767.618, 811.620 MB (slope 145.239 MB per plane) and is 68.257, 332.116, 382.015, 402.061, 421.634, 435.039 MB (slope 60.643 MB per plane); across a whole worker the series is now flat by the verdict's declared rule, slopes 0.5645, 0.0504, 0.0323 and 0.3557 MB per plane with 31, 30, 38 and 34 falling steps, where before every child climbed to the heap's ceiling and stayed. Inside one child it is still monotonic at 20.7657 MB per plane: what rises there is pages of the FIXED heap that a larger later plane touches for the first time and the operating system keeps resident, which is bounded by the 222 MB installed and steps up only when a plane needs more slots than any plane before it, not an accumulation that runs on. The sweep's arithmetic did not move: 2312 generations, 16539 organisms, 897369 ticks, 1.337761e+5 organism-years, identical before and after. The cost is wall clock, 6499.406 to 6157.137 ticks per wall second, minus 5.266 %.

Determinism was checked and the check needs its own control. Archive union at the end read 155 before and 153 after, per plane fill identical on 369 of 400 planes, best cell identical on 379, and the best organism is the same one on the same plane in both, `og-g5-0` on plane 261 in cell 2-4-1-4 at generation 5, fitness 0.831084 before and 0.831061 after. The control is two runs of the after code, which differ only in a comment and an env branch the sweep never sets: they read union 156 and 153, fill identical to the before run on 371 and 369 planes, best 0.830606 and 0.831061. The spread between two runs of the same code is as wide as the before to after gap, which is what `test/planes.test.mjs` (f) already says in prose: fitness carries a throughput term measured in cell runs per WALL second, so an organism that lands on a bin edge can take a different cell on a busier machine. The sweep is reproducible in its coordinates, its ticks and its years; its archive is reproducible to a band.

The verdict is `bench/verdicts/planes-rss.json`, written by the bench after the sweep it measured, with the before run kept beside it as `bench/verdicts/planes-rss-before.json`, and `bench/verdicts/planes.json` untouched. It records `node bench/planes.mjs --planes 400 --ticks 2000 --workers 4 --out bench/verdicts/planes-rss.json`, 400 planes completed and 0 failed, peak child rss **588.219 MB** against **959.488 MB** in the before verdict, mean peak 449.274 against 676.740 MB, the per worker series flat at 0.0323 to 0.5645 MB per plane against a before child that climbed 145.239 MB a plane, the hypervector heap installed at 222 MB by the plan with 149 slots still held after a plane at worst, and 1.337761e+5 organism-years over 897369 ticks, the same organism-years the before run measured. Tests: `node --test test/planes.test.mjs` 10 pass 0 fail, including (j), which runs the child on six planes with and without the collection point in one wall window and prints both series (held slots 41, 57, 57, 62, 66, 67 with it, 4053, 7345, 9953, 13778, 23524, 25973 without it and 0 finalizer calls); `node --test test/generations.test.mjs test/epochs.test.mjs` 46 pass 0 fail; `node --test test/hvheap.test.mjs` 18 pass 0 fail.

## a plane never falls back, and a child's residue is named (2026-09-18)

STEP 1, inside a plane. The chunk holding plane 296, the worst plane of the 400 plane sweep by its own fallbacks, run in three arms spawned together in one wall window by `node bench/planes.mjs --probe 296 --ticks 2000 --chunk 6`. The arm this replaces had no table at all before today: the child handed a recorder only to the asynchronous runner, so the control ran blind, and the generation at which the heap fills is exactly what had to be visible. `runPlane` already took an `onGeneration` hook that records without turning the event loop, and the child now passes it, so both arms print the same columns. Plane 296 is 59 majors at popSize 4 and the child's plan gives it 26356 slots, 205.9 MB.

    synchronous plane, the arm this replaces
    gen   inUse   fallbacks   fb %   gen ms
      1    6505        2365   4.25    588.4
      2   17325        2365   3.50    717.6
      3   26356        4235   5.26    661.5      the heap is FULL from here
      4   26356       22545  22.81    989.9
      5   26356       42895  35.99   1072.5
      6   26356       63330  45.35   1330.4
    this plane alone: 30701 allocs, 60965 fallbacks, 66.51 %, 0 collection points, wall 5360.9 ms

    async plane, collection point inside it        async plane, collection point, organisms released
    gen   inUse before   inUse after   peak      gen   inUse before   inUse after   peak   released
      1          6507          6507  11876        1          1662          1662   5739       4845
      2         17327           151  17327        2          4737          3225   6955       7745
      3         10842           151  17327        3          5725          2651   8723       8191
      4         16104           155  17327        4          7023           155   9681      11581
      5         17670           155  17670        5          5439          5439   9681      12231
      6         19829           155  19829        6         11394           155  15860      13719
    91666 allocs, 0 fallbacks, 5 collection points   91666 allocs, 0 fallbacks, 2 collection points, 68895 released

The heap fills at generation 3 and every attempt after that is a plain `Int8Array` copy, which is the arithmetic the wasm kernels exist to avoid. All three arms ran the same search: 6 generations, 24 organisms, 2160 ticks, fill 8, best cell 6-3-4-4 at 0.592701, 0.590936 and 0.592108. The wall of one plane was 5360.9, 5406.4 and 5601.5 ms, so the whole fix costs 240.6 ms of a 5360.9 ms plane here.

STEP 1, the residue by region. A child's rss is the JS heap node reports as `heapUsed`, plus the ArrayBuffers it counts, plus a residue, and the residue is not one thing. Over the 100 planes of the full series worker of the after sweep the mean residue is 252.299 MB and it is: the V8 heap committed and resident but never counted in `heapUsed`, 130.513 MB; the pages of the fixed wasm hypervector heap this child has written, 44.416 MB, of which 165.222 MB was installed and never touched; and 77.37 MB left over, which is the process itself. `external` reads 219.285 MB because node counts the whole installed wasm memory there whether the operating system has made it resident or not, which is why subtracting `external` whole leaves a negative remainder and why the residue has to be split by what was WRITTEN rather than by what was declared. The 20.7657 MB a plane the before verdict recorded is now 11.0174, and the region it lives in is named on the same series: across the six positions inside a child the mean rss of worker 0 rises 232.789, 253.389, 260.671, 271.948, 282.015, 286.888 MB, a slope of 10.5043 MB a plane, and that slope is hv pages touched 6.3931 plus V8 slack 0.7678 plus heapUsed 0.0726 plus 3.2708 of the rest. So 6.3931 of the 10.5043 MB a later plane costs its child is pages of a FIXED heap that a bigger plane writes for the first time and the operating system keeps resident, bounded by the 222 MB installed, and the residue flattens inside 8 of the 17 children of that worker.

STEP 2, what was released where. `generations/epochs.mjs` passes `release` into `evaluateOrganismGenome` for every candidate of a generation, and `generations/organism-genome.mjs` calls `releaseOrganism(brain)` as the last statement of the evaluation, after every component has been read off the organism and before the archive is offered anything, so no measurement can see a released lane. `releaseOrganism` walks the brain's own object graph through `organismVectors` and hands each distinct slot back with `releaseAll` from `core/signal.mjs`. Nothing an elite holds can be a slot: the archive keeps the genome as JSON, the descriptors as numbers and the descriptor vector as a plain array of four floats. This is not an option the bar command could have passed, so it is the DEFAULT in the child of `bench/planes.mjs` and `BRAIN_PLANES_RELEASE=0` is the arm without it. The reason it is not enough to yield: at `BRAIN_HV_HEAP_MB=128`, which is 16384 slots against the 26356 this plane wants, three arms of `test/planes.test.mjs` (k) in one wall window read 73138 fallbacks of 91743 attempts (79.72 %) for the runner this replaces, 4819 (5.25 %) for the yield and the collection point on their own, and 0 (0 %) for the whole fix, at a peak of 10576 slots and 58312 slots released.

Determinism, and a band that was the wrong ruler. The inherited `test/planes.test.mjs` (f) asserted that the best fitness of two runs of one plane agreed inside 0.02, and it went red once at 0.649256 against 0.671157 while every other quantity matched. It was not a defect in the yield: eight reruns of plane 2 at 400 ticks in a quiet process read 0.669606 to 0.671819, a range of 0.002213, and the throughput component is cell runs per WALL second, so a machine that gets busy can move it as far as it likes and no band is a fact about the search. The first replacement asserted that the other four components were identical, and it went red too, on a real finding: novelty is a SECOND wall clock term, because novelty is the distance to the elites the archive held when the generation began and which organism holds a cell is decided by a fitness that already carries throughput, so a flip inside generation 1 travels into every novelty read in generation 2. Cell 2-4-1-4 read novelty 0.46159629149296 on one run and 0.45194341828297546 on the next with prediction, task and cost identical to the last bit. What is graded now is an identity instead of a tolerance: over the 15 cells of plane 2, every cell is held by the same organism in the same generation, its three pure components are bit identical, and the whole of the move in the scalar is the two weights times the two moves, worst residual 0.000000752 on a rerun and 0.000000710 between the synchronous arm and the yielding, releasing arm, against worst fitness gaps of 0.010825 and 0.008841. 2e-6 is the arithmetic of the comparison, not a tolerance: fitness is stored rounded to six decimals.

The verdict is `bench/verdicts/planes-async.json`, written by the bench after the sweep it measured, with `bench/verdicts/planes-rss.json` as the before and `planes-rss-before.json` and `planes.json` untouched. The same command before and after, `node bench/planes.mjs --planes 400 --ticks 2000 --workers 4`, 400 planes completed and 0 failed both times: the worst plane's fallback rate went from **46.09 %** to **0 %** and the mean from 5.362 % to 0 %, which is 0 fallbacks in 7842463 attempts measured plane by plane as deltas either side of each plane, and the peak child rss went from **588.219 MB** to **431.594 MB**, down 156.625 MB (26.627 %), with the mean peak 449.274 to 307.6 MB and the held rss after a plane 510.336 to 349.07 MB at worst. The arithmetic of the sweep did not move: 2312 generations, 16539 organisms, 897369 ticks and 1.337761e+5 organism-years, identical to the before run, and the same organism `og-g5-0` is best on the same plane 261 in the same cell 2-4-1-4 at 0.829548 against 0.831061, a gap the throughput term covers. The archive union at the end read 156 against 153, which is inside the band two runs of IDENTICAL code already measured in the section above (156 and 153), and the union after the first generation is 90 in both. The cost is wall clock, 145.745 to 164.895 s, plus 13.1394 %, and 6157.137 to 5442.055 ticks per wall second, minus 11.6139 %; that number is not clean, because `tasklist` counted 13 node processes on this machine during the after run against the parent, its four children and the soak, so other work was running that the before run did not have. Inside a child the rise is 20.7657 to 11.0174 MB a plane, mean first plane 332.283 to 229.337 MB and mean last 441.497 to 286.982 MB, 13 children of 67 never falling against 11, and the hypervector heap holds 12263 slots at its peak against 28416 with 155 still held after a plane, over 2312 generation yields of which 17 were collection points, 5405107 slots released by organisms and 1258.3 ms suspended in the whole sweep. Tests: `node --test test/planes.test.mjs test/generations.test.mjs test/epochs.test.mjs test/genome.test.mjs` 94 pass 0 fail, of which `node --test test/planes.test.mjs` on its own is 12 pass 0 fail twice in a row, including the two new ones, (k) on a heap small enough to fill and (l) on the yield and the release against the synchronous runner.
