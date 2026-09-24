# notes/capability.md: the capability layer (induction, skills, router, market)

His words for this piece: "Modern Ai u have to ask for it to build something. What if this
brain already had the idea to do everything! And can figure out everything?", "I siad if
the brain is done, it should auto know how to trade and everything possible", "Make it
actually be able to do anything even the hardest request", "Think about what Ai cannot do
or gets wrong often (like algebra problems)".

No core change was needed. `core/`, `viz/`, `web/`, `generations/` and `runtime/` were read
only, never edited. New files: `capability/induce.mjs`, `capability/skills.mjs`,
`capability/router.mjs`, `capability/market.mjs`, `capability/index.mjs`,
`test/capability.test.mjs`, `bench/capability.mjs`.

Commands, and what they printed:

- `node --test test/capability.test.mjs` : 11 tests, 11 pass, 0 fail, 14824.9ms.
- `node bench/capability.mjs` : writes `bench/verdicts/capability.json`.

## What was built, and the numbers the commands printed

- **Induction over our own sym language.** 15 of 15 catalogue tasks solved, 308912
  candidate programs evaluated, 450.61ms for the whole catalogue. Per task, the program
  the search wrote and the candidates it needed: `(2 + (x * 3))` 3097, `((x * 5) - 7)`
  13142, `(x * x)` 463, `((x + -1) / 2)` 39413, `(x + (x * x))` 1308, `rev(xs)` 41,
  `sum(xs)` 44, `max(xs)` 46, `sort(xs)` 42, `sum(tail(sort(xs)))` 8612,
  `map(e -> (e * 2), xs)` 77678, string reverse 41, `map(e -> (e + 1), xs)` 81537,
  `map(e -> (e - 32), xs)` 83400, `len(xs)` 48.
- **Algebra, exact.** 194 of 194 solvable equations solved and every one verified by
  substitution, 6 degenerate cases named rather than guessed at (`200` generated in the
  bench battery). In the test suite, 59 of 59 with 1 degenerate.
- **Skills.** First request for an unseen family: 11318 candidates in 25.16ms. Second
  request of the same family: 0 candidates, answered from the registry. Registry after the
  bench: 16 skills.
- **Router.** Five routes exercised, each answer carrying the cells that produced it:
  arithmetic `router(solve) > eval(sym.eval)`, algebra `router(solve) > algebra(sym.solve)`,
  sequence `router(solve) > fit(seq.fit)`, list `router(solve) > skill.list.sort(skill)`,
  grid `router(solve) > g.r0.0(grid.rotate)`.
- **Market.** Policy `(v + (z - -1))`, size 5, found after 2581 candidates over 594
  distinct decision vectors. Held-out policy return 4.6374 against control 0.7147, always
  long 0.6468 beaten on 8 of 8 seeds, gap 3.9227, mean gap per seed 0.4903, paired t 7.443,
  permutation share 0.0253, positive gap on 8 of 8 held-out seeds.

## Design decisions worth recording

- **Bottom-up enumeration with observational equivalence, not top-down search.** Terms are
  built smallest first and evaluated on every example the moment they are built; a term
  whose output vector has already been seen is discarded, because any larger term built on
  it would behave identically. That is why `sort(xs)` costs 42 candidates and the hardest
  task in the catalogue costs 83400 rather than millions. The pruning is on behaviour, not
  on syntax, which also means the same enumerator can prune a policy search on the
  DECISION vector instead (see below).
- **Scalar programs are sym trees, evaluated by `core/primitives.evalSym` itself.** A term
  with no list operator anywhere is handed straight to the brain's own evaluator, so the
  arithmetic and algebra answers come out of the same code path the rest of the brain uses,
  over exact BigInt rationals. `evalTerm` only takes over where the list layer starts.
- **Lists are a typed layer above the scalar language, and strings are lists of code
  points.** `rev, sort, tail, sum, prod, max, min, len, head, last, map, filter`, with
  `map` and `filter` carrying a scalar sym body in the variable `e`. This is why the string
  tasks needed no new machinery at all: `string.upper` is `map(e -> (e - 32), xs)` and
  `string.reverse` is literally the same program as `list.reverse`.
- **Algebra is solved, not searched.** `f(x) = left - right`; if `f` is linear then
  `a = f(1) - f(0)` and `b = f(0)`, so the root is `-b/a`. Linearity is then checked at
  `x = 2`, a third point no coefficient was read from, and the answer is only returned when
  substituting it back makes both sides the same exact rational. A non-linear equation, an
  identity and a contradiction are each named in words. This is the failure mode the manual
  singled out (an assistant that gets algebra wrong), and the reason it cannot happen here
  is that an unverified solution is never returned.
- **Memory before search is the retrieval rule, not a cache.** A request is matched against
  stored skills by RUNNING their programs on the request's own examples. A cache keyed by
  the request text would answer the same question twice; this answers a question it has
  never seen whenever a stored program happens to reproduce the examples, and it refuses
  when none does. The measured effect in the bench is 11318 candidates against 0.
- **The library grows, and it is not free.** Every solved task becomes an operator later
  searches may use. That is what the manual asked for, and it has a measured cost: with 14
  skills in the library, `half.minus.one` takes 39413 candidates against 22016 with an
  empty one, because every library operator widens the branching factor. The trade is
  recorded here rather than hidden: the growth buys compositional reach (a later task can
  call an earlier program) and pays in candidates per search.
- **The router's ledger runs at `full`.** Trace-back is a requirement of the manual, and
  only the full ledger level records the signal events that let a cell run be walked back
  to the request that caused it. At `runs` the walk stops after one event, which is what
  the first version of the test caught.
- **The trace names cells that really ran.** Each step of a trace carries the ledger
  sequence of an actual `cell.run` event found in the window around the call, not a label
  written by the driver. If a cell had not run, there would be no sequence to name.

## The market section, and what it does not claim

- **No old data, no venue, no money.** The manual forbids old project data leaking in, so
  the world is generated here: a seeded price process that switches between mean reversion,
  momentum bursts and pure noise. On the held-out seeds the tape was 1997 reverting, 1499
  momentum and 1104 noise rows of 4600.
- **The policy is induced by the same machinery as `3x + 2`.** The only difference is what
  counts as the same program: two policies are identical when they produce the same buy,
  hold and sell vector, so the enumeration prunes on decisions. 2581 candidates collapsed
  to 594 distinct decision vectors.
- **Two controls, and the stricter one decides.** A step shuffle of the positions keeps the
  same holdings but destroys the runs, so it trades far more often and pays far more fees:
  it scored -0.5031 and it would have flattered the policy for a reason that has nothing to
  do with knowing anything. The run-order control permutes the ORDER of the runs instead,
  keeping the holdings and very nearly the trade count, and scored 0.7147. The gap is taken
  against the stricter of the two on every seed, which on all eight seeds was the run-order
  control.
- **Always long is reported next to it.** The policy must beat the drift of the tape as
  well as its control, and it did, on 8 of 8 seeds (4.6374 against 0.6468).
- **The bar was stated before the numbers were read.** A gap is called real only when the
  paired t across held-out seeds clears 2 and the permutation share is under 5 in 100.
  Measured: t 7.443, share 0.0253, so this one is called significant. An earlier
  configuration (4 training seeds instead of 8) gave t 5.210 with a share of 0.0936 and was
  reported as NOT significant by the same bar, which is the point of stating the bar first.
- **The placebo arm is in the test file, not just in the prose.** A policy fitted to tape
  whose forward returns were shuffled earns a training return of 1.1423 and then a held-out
  gap of -0.2023 with a paired t of -0.397. The real arm on the same seeds: gap 3.8568,
  t 7.435. A training return proves nothing on its own, and the two arms show it.
- **What is NOT claimed.** Nothing here says anything about a real venue, a real fee
  schedule, real slippage or real money. The claim is that the induction finds planted
  structure and survives a matched control on seeds it never saw.

## Requests to the core owners

1. **A public `ctx.capability` slot.** The `skill` and `solve` cells reach their registry
   through `ctx.brain.capability.registry`, a property the capability layer sets on the
   brain object itself. It works and it changes nothing in `core/`, but a declared slot
   (like `ctx.learning`) would make the dependency visible from `core/brain.mjs`.
2. **A port-addressed outbox read.** `takeOutbox()` empties the whole outbox, so a driver
   that fires one cell at a time has to filter by `src` and `port` and drops anything
   another cell left there. A `takeOutbox({ src, port })` would make single-cell driving
   exact instead of careful.
3. **`connect` refuses a polymorphic source into a narrower port only at emit time.** The
   `skill` cell declares `sym` on one out port and `event` on another for exactly this
   reason. Worth confirming that is the intended pattern rather than a workaround.

## Open

- The list layer has no `fold` with an induced binary body, so a task like "alternating
  sum" is outside the vocabulary today. It would be one more operator plus a body pool.
- The policy vocabulary is four features and size 5. Nothing was searched above that, so
  nothing is known about what a larger one would find, and the placebo arm suggests the
  first thing to add is more held-out seeds rather than more candidates.
