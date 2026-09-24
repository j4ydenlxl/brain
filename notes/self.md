# notes/self.md: requests from self/ to core and to the rest of the brain

self/ is the layer where the brain observes itself, proposes changes TO ITSELF as genome
deltas with stated hypotheses, tries each one in an isolated clone against a matched
control, and applies only what the gate approves. Files: `self/observe.mjs`,
`self/propose.mjs`, `self/trial.mjs`, `self/apply.mjs`, `self/daemon.mjs`. Bench:
`bench/self.mjs` writes `bench/verdicts/self.json`. Tests: `test/self.test.mjs`.

Nothing in core/, viz/, web/, generations/, capability/, runtime/ or cells/fhrr.mjs was
edited to build this layer.

---

## Request 1 (core, cells/basic.mjs): a polymorphic in port cannot be serialized after it
## has met two kinds

`predict.next` declares `observe` as `kinds: ['vec', 'hv', 'num']` and keeps
`state.history` plus `state.lastPrediction`. Its `serialize` encodes EVERY history entry
with `s.kind`, which is the kind of the LAST signal the cell saw. A cell that saw an `hv`
and then a `num` therefore serializes its `hv` history as `num`, or its `num` history as
`hv`, and `S.dataToJSON('hv', <rational>)` calls `Buffer.from(undefined)`:

```
TypeError [ERR_INVALID_ARG_TYPE]: The first argument must be of type string or an instance
of Buffer ... at dataToJSON (core/signal.mjs:308) at serialize (cells/basic.mjs:182)
at serializeCell (core/cell.mjs:103) at fingerprint (simulate/clone.mjs:174)
```

MEASURED here: `self/trial.mjs` injected a `num` into every in port that ACCEPTS `num`,
which includes ports an `hv` already owned, and the next `fingerprint()` of that clone
crashed. The organism already avoids this: `genome/wire.mjs` monomorphises a port by its
first afferent, and `seeds/organism.mjs` keeps a `claims` map so no port ever meets two
kinds. The injection path had no such rule, so an EXTERNAL signal could break an invariant
the WIRING maintains.

Worked around in self/: `inputStream()` now injects only into ports that declare exactly
one kind (`kinds.length === 1 && kinds[0] === 'num'`). That keeps the invariant, but the
workaround belongs to whoever injects next too.

The request, one of:
1. `Brain.inject` refuses a signal whose kind is not the kind that already claimed the
   destination port (the claim is the cheapest possible piece of state: one kind per port
   index), or
2. a kind that keeps typed history stores the kind WITH each entry, so `serialize` cannot
   encode an entry with a kind it never had.

Until one of those lands, any code that injects into the organism from outside must pick
monomorphic ports, and nothing enforces that.

## Request 2 (core/gate.mjs): PROPOSAL_KINDS is frozen, so a new authority kind cannot be
## registered without editing core

`self/apply.mjs` proposes `self.improve`, and `Gate.propose` throws
`gate: unknown proposal kind` for anything not in the frozen `PROPOSAL_KINDS` array. core
is not ours to edit from this layer, so `arm(gate)` installs the kind on a gate INSTANCE:
it keeps the gate's own counters, ledger events, pending queue and `humanRequired` set, and
delegates every other kind to the original `propose`.

This is deliberate in one way worth keeping: a brain whose gate was never armed REFUSES
self.improve outright, so an organism cannot be rewritten by itself unless a human armed it
in this process. But the patch is a monkey patch, and a second layer wanting its own kind
would patch the patch.

The request: `Gate.register(kind, { humanRequired })`, appending to a per instance kind set
rather than the module level frozen list, with the same throw for anything unregistered.
Then `arm()` becomes two lines and the frozen list stays the default set.

## Request 3 (core/ledger.mjs): the trace of an application must be taken when it lands

`Ledger.trace(seq)` walks `consumed`/`from` upstream through the in memory ring, and falls
back to reading the JSONL file only when the brain has a `dir`. A running organism at 1600
cells writes tens of thousands of events per round, so an apply event from round 1 has
rolled out of a 400k ring by round 4 and `trace()` then returns a partial chain with no
error at all.

Handled in self/: `apply()` calls `traceApply()` IMMEDIATELY after writing the apply event
and stores the chain in the decision, so `bench/verdicts/self.json` carries a trace that
was provable at the moment it was taken, not one re walked later. The daemon report and the
bench both read the recorded chain.

The request: `trace()` should say when it stopped because an event was no longer resident
(`{ truncated: true, missing: seq }`) instead of returning a short chain that reads exactly
like a complete one. A chain that is missing its root and a chain that reached its root
must not look the same.

## Request 4 (design note, not a defect): what the window measures

A clone inherits every cell's lifetime counters. Measuring a 48 tick trial on top of an
organism's whole history dilutes a real effect by however long the organism happened to
have been running, and the same delta then looks stronger on a young brain than on an old
one. `self/trial.mjs:resetWindow()` zeroes run, fired, error, skip and cost counters on
BOTH arms identically before the window, keeping `surprise` and `lastT` because those are
state the cells compute with, not counters of the window.

Anything else that grades a clone over a window (generations, simulate) inherits the same
trap and should zero the same counters, or say in its own verdict that its numerator and
denominator come from different windows.

## Request 5 (calibration, MEASURED 2026-09-17 by bench/self-null.mjs): the bar a hypothesis is held to

Answered. Two nulls were run (`node bench/self-null.mjs [--majors N]`, verdicts self-null.json,
self-null-100.json, self-null-200.json): (1) two arms of the same parent with no delta differ
by exactly 0% on every metric (450 readings over 3 sizes), so any gain is the delta; (2) the
spillover of a real delta onto the metrics it did not target has a p95 of 0.8256% at 240
cells, 0.4525% at 800 and 0.1259% at 1600 (max 15.736%, 3.0624%, 1.4851%). The noise falls
with size, so a flat number is wrong at both ends: the old bar floor of 0.1% was under the
spillover at every size, and a flat 0.5% at 1600 cells turned 2 confirmations into undecided
(effects above the noise there, under 0.5%). Both the bar floor and the trial band are now
`spillFloor(cells)` in self/propose.mjs: the three measured points, a straight line between
them, clamped outside; the daemon passes it as the band unless --band is given, and every
hypothesis a round proposes is floored at it (test in test/self.test.mjs). `keep = 0.25`
stays a judgement: the bench measures what a bar must clear, not what a change of a given
size should deliver.

The request as it was written:

Every candidate states what should move and by how much: `propose.barFrom(share)` derives
the bar from the SIZE of the change (a quarter of the naive share, floored at 0.1%, capped
at 50%) rather than from a number someone picked. Adding 1 cell to a region of 53 is
predicted to lift that region's runs by at least 0.47%, not by 1%.

This matters because the first calibration used flat bars (1% and 2%) and the loop refuted
everything: a change that touches 2% of a region cannot move it by 10%, so a flat bar
manufactures refutations exactly as a zero bar manufactures confirmations. The current
constants (`keep = 0.25`, floor 0.001, cap 0.5) are a judgement, not a measurement.

MEASURED at `keep = 0.25` on the 3 minute bench run (200 majors, 1600 cells): 36 candidates,
32 confirmed, 0 refuted, 4 undecided. A loop that refutes NOTHING is the same warning sign
as a loop that confirms nothing, from the other side: keeping a quarter of the predicted
share puts the bar at 0.5% where the prune effect is 2.0%, four times the bar. The
refutation path is real and is exercised by `test/self.test.mjs` ("a candidate with a false
hypothesis is refuted on a matched control") and fired on the live loop at 30 majors
(period.change, measured -10.1124% against a bar of +0.06%), but this run did not produce
one.

What would replace the judgement: run a NULL delta (the same delta applied to BOTH arms) on
several seeds, measure the spread of each metric, and set `keep` so the bar sits at that
spread. The `--band` option (default 0.5%) is the placeholder for that measurement and is
reported with every undecided verdict.

## Request 7 (simulate/clone.mjs): fingerprint cannot be taken at organism scale

`fingerprint(brain)` builds ONE string out of every cell, every mailbox and the whole
connectome. MEASURED on a 200 major organism (1600 cells, 17926 edges), at rest, 8 ticks
in: **20,884,589 characters, 44 ms**. After two arms have run a 32 tick trial and filled
their working memories it exceeds what a JS string can hold, and the proof itself throws:

```
RangeError: Invalid string length
    at Array.join (<anonymous>)
    at stable (simulate/clone.mjs:164:52)
    at fingerprint (simulate/clone.mjs:171:10)
    at trial (self/trial.mjs)
```

That killed the first bench run at round 2. self/trial.mjs now folds the same content into
a 32 bit digest incrementally (`armDigest`): no intermediate string, constant memory,
**2 ms** on the same organism against 44 ms for the string, and it is the digest that proves
the two arms matched before the delta.

The request: `fingerprint()` should fold rather than concatenate (return a digest, keep the
full string behind an explicit `{ full: true }`), or say in its own doc that it is a
debugging tool for brains under about a thousand cells. As written it is a proof that stops
working exactly at the scale the project is aiming for.

## Request 8 (loop design, settled here): one change per round

A round measures every candidate ALONE against the control. Applying five of them together
would land a combination nothing measured, and the first bench run did exactly that (5
prunes, 635 conduits, in one round). `applyPerRound` defaults to 1: the largest gain is
submitted to the gate, the rest are NOT archived, and the next round re-proposes and
re-measures them against a control taken from the brain as it is by then. That is why the
same candidate can appear confirmed in several rounds and land in only one.

## Request 6 (gate policy, deliberate): confirmed is not approved

`selfPolicy` rejects a confirmed change whose gain is under `minGainPct` (default 1%). In
the first 200 major run, conduit prunes confirmed their own hypothesis (bar 0.28%, measured
0.56%) and were then REJECTED by the gate for being under 1%. That gap is the point of the
layer: computation is not authority, and the authority bar is allowed to be stricter than
the evidence bar. It is printed in the round log and in `bench/verdicts/self.json` as
`rejected`, never hidden as a failure to confirm.

## What the daemon does NOT do yet

- It never retries an undecided candidate. Undecided keys are archived like refuted ones so
  the loop cannot propose the same no op every round; `Archive` keeps the outcome so a
  future `retryUndecided` option can revisit them with a longer window.
- It proposes only the six delta kinds in `DELTA_KINDS`. Removing a cell, replacing a cell
  kind, and changing a learning rule are all gate kinds core already knows and none of them
  is proposed here yet.
- It grades the task suites only when `--suites` is passed, because a suite run costs more
  than a round of trials.

## self.code: self improvement extended from the connectome to the source (2026-09-17)

self/propose.mjs proposes edges and cells. `self/code.mjs` proposes a change to the
organism's OWN code as the kind `self.code { file, patch, why, evidence }`, registered
through `registerProposalKind` (request 2 above is answered by core: `arm()`'s monkey patch
is not repeated here, this kind goes through the registry with its own policy and its own
`slim` for the ledger line). Tests: `test/self-code.test.mjs` (17 pass, 0 fail, 2.4 s).
Bench: `node bench/self-code.mjs` writes `bench/verdicts/self-code.json`.

Three walls stand between an analysis and a byte on disk, and each one is a test:

1. **EVIDENCE IS RUN, NOT READ.** The evidence is a test that FAILS before the patch and
   PASSES after it. The gate policy does not read a claim about that, it copies the tree to
   a temp dir (state/, .git, node_modules and site/ excluded), runs the named test there
   unpatched, writes the patch onto the copy, and runs it again. Both runs are child
   processes with a timeout. MEASURED at real tree size: copy 633 ms, test 2541 ms before and
   2490 ms after, 5743 ms for one verification; on the two file fixture, 424.5 ms mean.
2. **THE POLICY NEVER APPROVES.** The best a verified proposal reaches is `hold`. Only
   `brain self-code <name> --approve <id>` writes a file, and it logs `self.code.apply` with
   the file hash before and after (fixture run: 1ede7a44da54 -> 76f26bd29216, 44 -> 44 bytes,
   1 ledger event, decidedBy human).
3. **THE BOUNDARY.** An absolute path, a `..` segment, a path resolving outside ROOT and
   anything under `state/` are refused before a byte is copied (0.5 ms mean, no verification
   run at all).

Two details that are load bearing:

- **A verification the policy did not run is not believed.** The result object is put in a
  module level `WeakSet` by `verifyPatch` and the policy refuses any verification not in it,
  so a hand written proposal carrying perfect numbers is rejected ("the verification was not
  run by this process"). Identity cannot be forged and nothing extra is written to disk.
- **Text from a model is a suggestion, never a proposal.** `suggestPatch` marks its output
  `origin: 'model'`, `humanApproved: false`, and the policy rejects that origin outright. The
  CLI is the only place `humanApproved` is ever set to true, and even then the proposal only
  reaches pending.

WHAT THE ANALYSIS FOUND TODAY, and what that does not prove. The candidate comes from two
analyses that exist as data: a mutant in `bench/verdicts/mutants.json` that survived, and a
test file in `bench/verdicts/gate.json` that was red (the failing assertion is not copied out
of the verdict, which records none: the analysis RE-RUNS that file and carries the assertion
it printed). On this run both benches were clean, 0 survived of 40 mutants and 0 red of 42
test files, so the analysis found 0 candidates. An analysis graded only on that population is
graded on emptiness, so both the bench and the suite also run it against a fixture pair of
verdicts holding exactly one survived mutant and one red test file: 2 candidates found, 2
refused, 0 pending. They are refused for the right reason, and it is the honest one: an
analysis can name the file and the test, it cannot WRITE the patch, and no patch is no
evidence. The loop as it stands finds the work and refuses to do it unevidenced.

A DEFECT THE HARNESS FOUND IN ITS OWN SUITE. The first `test/self-code.test.mjs` asserted
`path.basename(ROOT) === 'brain'`. Inside a verification that file runs from a COPY of the
tree, where the root is a temp directory, so the real tree arm came back 16 pass of 17 and
the verification reported "the test still fails with the patch applied". Any self.code
proposal naming that test would have been unverifiable forever. The assertion now tests the
property that matters (ROOT is the directory holding self/ and core/), and the arm is green.
Anything else asserting its own path will do the same thing to this loop.

Two more defects, both found by running rather than reading:

- **The child inherited the test runner's environment.** When the verification runs from
  inside `node --test`, `NODE_TEST_CONTEXT` is set, the grandchild believes it is a test
  worker, emits the v8 serialized stream instead of TAP, and every run reads as a failure:
  a false refusal caused by an env var. `runTest` drops `NODE_TEST*` and `NODE_OPTIONS`
  (names only, no value is ever read or printed).
- **A patch string that ends with a newline grew an empty context line.** The trailing empty
  element of the split became a context line demanding the hunk sit at the end of the file,
  and a hunk that matched in two places matched in one and landed. Trailing blanks are now
  dropped, and an ambiguous hunk is refused rather than guessed at (`matches the file in 2
  places`).

## Request 9 (core/gate.mjs): a kind cannot say "never approve"

`humanRequired` is a per instance Set checked BEFORE the policy runs, so adding `self.code`
to it would hold every proposal without ever verifying it, and the garbage would sit pending
next to the evidenced work. The policy therefore returns `hold` itself and never returns
`approve`. That works, but it is a convention: nothing stops a future caller from registering
a policy for this kind that returns `approve`, and the gate would apply it.

The request: `registerProposalKind(name, { policy, slim, maxVerdict: 'hold' })`, so a kind can
declare that its ceiling is a human decision and the gate clamps any `approve` the policy
returns. Until then the ceiling lives in one function in self/code.mjs and in the test
"a valid proposal is pending until the human approves it".
