# notes/simulate.md

Owner of `simulate/*`, `cells/simulate.mjs`, `test/simulate.test.mjs`.
Nothing under `core/` was edited. Everything below is either a request for the core owner
or a measured behaviour that this subsystem had to work around. Every number here was
printed by `node --test test/simulate.test.mjs` run from `brain/`.

## Requests for core (worked around here, not patched)

1. **`serializeCell` drops `cell.memory.working`.** It carries `memory.refs` only. A clone
   and a `Brain.snapshot` both lose a circuit cell's working memory. `cloneSub` copies
   `memory.working` itself after `deserializeCell`; `Brain.restore` still loses it.
   Request: add `working` to `serializeCell` / `deserializeCell`.

2. **`serializeCell` returns live references.** `params: cell.params` is the same object,
   and for a kind with no custom `serialize` the returned `state` is the cell's own state
   object. Measured: a `source.const` holding an `hv` returns the identical `Int8Array`.
   Any caller that does not deep copy is sharing typed arrays with the original.
   `simulate/clone.mjs` deep copies the whole serialized record for exactly this reason
   (`deepCopy`, and `sharedBuffers()` proves the result shares nothing).
   Request: either copy in core, or say so in the `defineKind` contract.

3. **A kind whose state holds a class instance must define `serialize`/`deserialize`.**
   `encode.hv` and `hv.cleanup` hold an `ItemMemory` and do define both, so they clone
   correctly. A future kind that does not would be handed an object literal with no
   methods by any generic copy. Request: `defineKind` could refuse a kind whose `init`
   returns a non-plain object without a `serialize`.

4. **Injection timing from an `afterTick` hook.** `_tick` calls `_deliver(t)` first and
   `clock.advance()` last, and hooks run before the advance. `inject(..., { delay: 0 })`
   from a hook therefore schedules into `inflight[t]`, a tick that was already delivered,
   and the item is never delivered and never dropped. Both managers here always inject
   with `delay: 1`. Request: `inject` could clamp to the next undelivered tick, and
   `_deliver` could drop keys older than `t`, which otherwise leak.
   (Edges are fine: `_emit` schedules at `clock.t + 1 + delay`, so a delay-0 edge lands
   the next tick. Measured with a two-cell probe.)

5. **The scheduler's tie-break is the registration order.** `Scheduler.allocate` sorts by
   bid with a stable sort, so cells with equal bids are funded in the order they were
   added to the brain. Measured in the attention control arm: with two identical cells in
   a region of budget 1, the cell added first takes the budget. Any claim about priorities
   has to name that tie-break, so `test/simulate.test.mjs` registers the boring cell first
   and shows attention inverting the outcome.

6. **No per-region, per-tick allocation record.** `scheduler.stats` is global
   (`funded`, `skipped`, `ticks`). `Attention._budget` reconstructs the per-region,
   per-tick numbers by differencing each cell's `stats.runs` and `stats.skips` across the
   tick. Request: a `Scheduler.lastAllocation` map of region to `{ funded, skipped, spent }`
   would make the budget report exact at the source instead of inferred.

## Measured, in this subsystem

- `cloneSub` of 1,000 cells and 250 edges: **4.20 ms** (50 of the cells are `vec.mlp` with
  real weight matrices). Nothing is shared: `sharedBuffers(parent, clone)` is empty.
- Toy 1D forward model (`vec.mlp`, 2 inputs, 24 hidden, 8,000 training ticks) learning
  `p' = clamp(p + 0.25a, -1, 1)`: **rmse 0.0223** on 200 held-out transitions.
- **Open-loop rollout error compounds.** Six simulated steps feeding the model its own
  output drift **0.0703** from the true 0.9. That is the honest cost of simulating in
  latent state, and it is why the horizon is a parameter and not a constant.
- Planner budget is hard: budget 20 spends exactly **20 ticks on 5 rollouts**; budget 400
  spends **240 ticks on 60 candidates** and finds a strictly better plan (-0.222 against
  -0.474). A budget of 3 ticks against a cost of 4 buys nothing and spends nothing.
- **A radius-1 local search exhausts its own neighbourhood.** A horizon-4 sequence over a
  3-action alphabet has only 8 radius-1 neighbours, so the first version of `plan()` went
  stale after two rounds and spent 56 of 400 available ticks with no improvement. Fixed by
  widening the radius with the round number and topping every batch up with random
  restarts. Same budget now spends 240 ticks and improves the score.
- Attention against its own control, 8 ticks, one region of budget 1, two cells that are
  identical except for what arrives at them: without attention the relevant cell ran 3
  times and the boring one 4; with attention the relevant cell ran **7** and the boring one
  **0**. The relevant cell's priority reached 5.55 against 1.24.
- A starved cell is not starved forever. The scheduler bid includes `(1 + pending)`, so a
  skipped cell's backlog eventually outbids a high priority. At the numbers above that
  crossover is past tick 8, which is why the test measures 8 ticks and says so.

## Design notes that are not obvious from the code

- **Uncertainty is never blended.** `uncertaintySeeds` (score spread across perturbed
  seeds) and `uncertaintyPredictors` (spread across predictor cells at the same tick) are
  reported separately. `uncertainty` picks one by `uncertaintyFrom`, default `auto`:
  seeds when there is more than one, predictors otherwise. Two rulers for one denominator
  would otherwise be quoted as one number.
- **A planner never clones itself.** `cells/simulate.mjs` passes
  `excludeKinds: ['simulate.plan', 'simulate.counterfactual']` into every clone it makes.
- **A clone does not grow or prune by default.** `cloneSub` sets the co-activation
  threshold to `MAX_SAFE_INTEGER` and `pruneEvery` to 0, so a rollout cannot make a
  structural change that was never proposed to the gate. Pass `evolve: true` to opt in.
- **A clone starts with an empty outbox.** The outbox is a delivery queue to the outside,
  not internal state, so `takeOutbox()` inside a rollout returns only what that rollout
  produced. Pass `copyOutbox: true` if a caller wants the parent's queue.
- **The workspace refuses, it never coerces.** A broadcast whose kind a subscriber's port
  does not accept is counted in `stats.refused` and dropped, matching the core rule that a
  kind mismatch is refused rather than converted.

## Not mine (state of the rest of the suite when this subsystem was finished)

Per file, `node --test test/<file>` run from `brain/`, all on the same pass:

| file | tests | pass | fail |
| --- | --- | --- | --- |
| cells.test.mjs | 22 | 22 | 0 |
| cli.test.mjs | 12 | 12 | 0 |
| core.test.mjs | 15 | 15 | 0 |
| generations.test.mjs | 16 | 13 | 3 |
| learning.test.mjs | 11 | 11 | 0 |
| memory.test.mjs | 12 | 12 | 0 |
| simd.test.mjs | 6 | 6 | 0 |
| simulate.test.mjs | 21 | 21 | 0 |
| universal.test.mjs | 7 | 4 | 3 |
| viz.test.mjs | 7 | 7 | 0 |

The 3 failures in `universal.test.mjs` are all `TypeError: S.num is not a function`, a
`core/signal.mjs` export that moved while the suite was being written. `generations.test.mjs`
appeared during this session and its owner was still working. Both files belong to other
agents and were left alone. `core.test.mjs` had 3 failures early in this session
(hypervectors, periodic-cells/budget, growth-proposals/hebbian); its owner fixed them and it
is 15/15 now.

Environment note: on this machine `node --test test/` (a directory argument) does not run the
directory. Node 24.15.0 tries to load `brain\test` as a module and exits with
`MODULE_NOT_FOUND`, reported as `tests 1, pass 0, fail 1`. That failure is the argument, not a
test. `node --test` with no argument, or a path to one file, both work.
