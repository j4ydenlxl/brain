# notes/learning.md

Requests for `core/` from the distributed learning subsystem (`learning/*.mjs`,
`cells/learning.mjs`). Nothing here blocks: every item names the workaround already in the
code and the test that covers it. Every number below came from a command in this session.

## 1. The tick does not publish which cells fired

`Brain._tick` builds a local `fired` array for its own co-activation step and then drops it.
`hooks.afterTick(brain, t)` gets only the brain and the tick, so a learning rule cannot know
who fired without re-deriving it.

**Workaround in place:** `LearningEngine._sample` scans every cell once per tick and diffs
`cell.stats.fired`, which `core/cell.mjs runCell` increments exactly when a cell emitted. The
diff is exact. The cost is a full pass over `brain.cells` whether or not anything happened.

**Measured**, idle brains (no cell ever fires, no rule ever applies, engine attached, 2000
ticks after a 200 tick warm up, this machine):

| cells | engine us/tick |
|------:|---------------:|
|    16 |          0.579 |
|   256 |          0.768 |
|  4096 |         11.479 |
| 16384 |         84.450 |

Linear in cells, for zero work. DESIGN.md section 0 aims at thousands of nodes, so this pass
is the one part of the subsystem that does not scale with activity.

**Ask:** pass the fired indices to the hook, `fn(brain, t, fired)`, or leave them on
`brain.lastFired`. Either makes the engine cost proportional to activity, which is what the
attention economy in DESIGN.md section 10 is for.

## 2. The arrival tick of a signal is computed inside `_emit` and never published

`_emit` schedules delivery at `clock.t + 1 + delay`: one tick of travel plus the edge delay,
because the bucket for the current tick was already drained. Spike timing dependent learning
lives or dies on that number, so `learning/hebbian.mjs` has to mirror the arithmetic.

**Workaround in place:** every ordering judgment in this directory goes through
`LearningEngine.arrival(e, tPre)` and `LearningEngine.travel(e)` (engine.mjs), so the mirror
is one function, not a constant scattered over six files. This already earned its keep: the
`+ 1` appeared in core after the first draft of these rules was written against `+ delay`.

**Ask:** `Connectome.arrival(e, t)` in core, or an `arriveAt` field on the in flight item, so
there is one definition of when a signal lands.

## 3. `policy.learn === 'hebbian'` is claimed by core

`Brain._tick` runs its own `connectome.strengthen` for every cell whose `policy.learn` is
exactly the string `hebbian`. The registry also has a rule named `hebbian`, so a cell that
names it in the obvious way gets two different updates on the same edges, and they disagree:
the core branch potentiates on any post spike, the registry rule depresses an anti-causal
pairing.

**Workaround in place:** a cell opts into a registry rule with the ARRAY form,
`policy.learn: ['hebbian']`, which the core's strict equality does not match while
`runCell` still honours it as "learning is not disabled". `attach()` detects the plain string
form and prints a warning naming the cells. Covered by the budget test.

**Ask:** either move the core branch behind `if (!this.ctx.learning)`, or give cells a
separate `policy.rules` array and leave `policy.learn` to core. The array form is a
convention, and a convention is not a guarantee.

## 4. The gate policy is derived from the growth config

`new Brain(...)` builds the gate as
`makePolicy({ growThreshold: this.coact.threshold, pruneStale: pruneEvery })`. Turning the
core's own co-activation growth off, which any test of an independent structural rule has to
do, therefore also moves the bar that every OTHER proposer has to clear. Setting
`growth.threshold = 1e9` silently raised the gate's grow threshold to 1e9, and a structural
proposal carrying nine co-activations came back rejected with nothing in the failure to say
why. This cost a real debugging pass.

**Workaround in place:** `test/learning.test.mjs quietBrain` passes `policy: makePolicy()`
explicitly, with a comment saying why.

**Ask:** separate the two. `growth` should configure the core's tracker; the gate's
thresholds should be their own argument, defaulted independently. Coupling a permission
boundary to a performance knob is the kind of thing that makes a green gate meaningless.

## 5. Not a request, a note for whoever writes the generations engine

`learning/registry.mjs` reserves the scope `structure`, and `learning/structural.mjs` is the
only rule that writes topology. It writes it ONLY after `brain.gate` approves, and the test
proves the negative as well as the positive: the same evidence against a stricter gate
proposes, is rejected, and leaves the connectome at zero edges. An evolutionary rule that
promotes genomes should take the same shape, `kind: 'genome.promote'` through the same gate,
rather than mutating structure directly.

## Answered in core (2026-09-16)

1 done: hooks.afterTick(brain, t, fired) and brain.lastFired. 2 done: Connectome.arrival(e, t). 3 done: the core hebbian branch runs only when no engine is attached (ctx.learning unset). 4 done: new Brain({ gate: { growThreshold, pruneStale, pruneFloor } }) sets the bar on its own; growth only configures the tracker.
