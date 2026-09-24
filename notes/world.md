# notes/world.md: the world region (senses, actuators, authority, trace back)

No core change was made. `core/`, `viz/`, `web/`, `generations/`, `capability/`,
`runtime/`, `self/`, `mind/`, `cells/fhrr.mjs` and the existing `io/` files were read
only, never edited. Files owned by this subsystem:

`world/policy.mjs`, `world/policy.json`, `world/actuators.mjs`, `world/senses.mjs`,
`world/trace.mjs`, `world/index.mjs`, `test/world.test.mjs`.

## What it is

His words: "be able to execute literally evrything in the world", "Not isolated
environments, this brain should have access to being a genius and prodigy in literally
every single segment of everything capable", "what if you didnt require a browser for it
to do EVERYTHING in the internet".

The answer is not a browser. It is eight cell kinds plus a border relay, on the same
connectome as every other cell:

| kind | reach |
| --- | --- |
| `world.http` | GET and POST an allowlisted host with the global fetch, response as `event`, `sym` or `vec` |
| `world.fs` | read, write, append, list, stat under an allowlisted root |
| `world.proc` | spawn an allowlisted executable, no shell, capture stdout, stderr, exit code |
| `world.clock` | wall time as an event stream, plus one shot timers armed by signal |
| `world.net.listen` | a loopback endpoint other programs POST to, so the world can signal the brain |
| `world.relay` | the named border cell in perception and in motor |
| `sense.poll` | an allowlisted URL as a periodic event stream at a declared period |
| `sense.watch` | a file under an allowlisted root as a change stream |
| `sense.stdin` | lines from a stream, refused unless the policy opens it |

`attachWorld(brain, policy)` grows region `world` with circuits `senses` and `actuators`,
puts one `world.relay` in `perception` and one in `motor`, and wires them: motor drives
every actuator, and every actuator answers back into perception, because what the world
replied is something the organism perceived and not something it decided.

## The rule that binds it, and how it is enforced

The manual: "The ability of a subsystem to reason about a change does not automatically
grant it permission to make that change... modifications to core architecture, learning
rules, external interfaces, or persistent state should pass through explicit control
mechanisms."

Four properties make that real rather than decorative.

1. **Nothing acts without a proposal.** Every actuator files `gate.propose({ kind:
   'world.act', what, why, evidence })` and acts only on `status === 'approved'`.
2. **The gate does not read the evidence.** `worldDecision(policy)` runs `authorize()`
   again over `proposal.what`. A cell that attaches evidence claiming a host is allowed
   changes nothing: there is a test that proposes a lie and watches it get rejected.
3. **Deny by default.** An empty allowlist denies. There is no wildcard meaning any host.
   The shipped `world/policy.json` allows no host, no root, no executable, no listener and
   no stdin, and the test asserts that.
4. **An unarmed gate cannot act at all.** `core/gate.mjs` freezes `PROPOSAL_KINDS`, and
   core is not ours to edit, so `armWorld(gate, policy)` installs the kind on the gate
   INSTANCE, exactly as `self/apply.mjs` installs `self.improve`. A brain that was never
   armed refuses every world act, naming `armWorld` in the refusal.

## Trace back

`world.trace(brain, actionSeq)` (exported as `worldTrace`, and as `trace`) walks the
ledger backward from an action. The links are written at the moment of the act, not
reconstructed afterwards:

```
world.outcome.from -> world.act.seq
world.act.from     -> the seq of the SIGNAL that asked for the action
signal.from        -> the seq of the cell.run that emitted that signal
cell.run.consumed  -> the seqs of the signals that cell consumed
```

`core/ledger.mjs` `trace()` already follows exactly those two fields, so `worldTrace` is
its walk plus the two things the walk cannot know: which gate proposal authorized the act
(the act records `proposalSeq`, and the decision is found by a bounded forward scan, since
`core/gate.mjs` writes proposal and decision as free standing events with no `from`), and
how to print the whole chain as one page of prose. Every successful `event` response also
carries `trace: { act, outcome }` in its own data, so a downstream cell can trace what it
just received without being told the seq.

Measured by `node --test test/world.test.mjs`: the chain for one allowed fetch contains a
`signal`, a `cell.run`, a `proposal`, a `decision`, a `world.act` and a `world.outcome`,
and it reaches the `cell.run` of the motor border cell that decided to act.

## Core behaviours this had to work with

- **A cell's compute() is synchronous and must stay that way.** `core/cell.mjs` calls it
  and expects an array back, not a Promise. Same pattern as `io/sources.mjs`: kick the
  async work off once, land the result on a queue in `cell.state`, drain one item per run.
  The filesystem is synchronous, so its result is pushed and drained inside the same run
  and an fs answer costs one tick instead of two.
- **An actuator cannot have `period: 'event'`.** An event cell runs only when its mailbox
  is non-empty, so a cell waiting on a fetch that has already come back would never run
  again to drain it. `DEFAULT_PERIODS` gives actuators period 1 and the clock 64; a run
  with an empty queue and no mail returns immediately.
- **A cell run's own ledger seq does not exist inside compute().** `Brain._tick` appends
  `cell.run` after `compute` returns. That is why a `world.act` links to the seq of the
  SIGNAL that asked for it and not to its own run: the signal event already carries
  `from: <the emitting run's seq>`, so the chain is complete anyway.
- **`Brain.log` returns -1 when the ledger is off**, so every seq written into a link is
  passed through a null check first. A null link ends the walk instead of chasing seq -1.
- **A snapshot must not carry a payload from the world.** A queued response can hold a sym
  tree of BigInt rationals, which makes `JSON.stringify` throw, or a megabyte of text. The
  http, fs and proc kinds serialize `queue: []` plus `queuedAtSnapshot`, since the act and
  the outcome are already in the ledger, which is where the history of a reach belongs.
- **The event border refuses a `sym` or `vec` response on purpose.** `world.http` declares
  `event|sym|vec` on its out port because a response may arrive as any of the three, and
  the border relay carries events. A cell configured with `as: 'sym'` or `as: 'vec'` is
  refused at that one edge (counted in `brain.stats.refused`) and should be wired straight
  into the region that eats that kind. That is a statement about the border, not a bug.

## Decisions worth recording

- **Granularity of authority differs between an actuator and a sense, deliberately.** An
  actuator proposes once per act, because each act is a separate reach. A sense proposes
  once when the STREAM OPENS, because the stream is the act, and every arrival after that
  is a `world.sense` ledger event whose `from` is the opening proposal. Otherwise a 10ms
  poll would file six thousand identical proposals a minute and the pending queue would
  stop meaning anything. The test asserts exactly two `world.act` events for two declared
  polls, one approved and one denied, while arrivals keep flowing.
- **A refusal is a value, never an exception.** Nothing in `world/` throws into a tick. A
  denied act emits on the cell's `error` port, increments a counter, and writes
  `world.refused` to the ledger.
- **Loopback is enforced twice.** The policy refuses a non loopback listen host, and the
  bind uses the policy's host rather than the requested one.
- **Redirects are not followed by default.** A 302 to a host that is not on the allowlist
  would be a hole straight through the gate, so `redirect: 'error'` unless the policy sets
  `followRedirects`.
- **A path is judged on its real path.** `realpathSync` on the nearest existing ancestor,
  with the not yet existing remainder appended, so a write to a new file cannot escape its
  root through a symlinked parent, and `..` cannot walk out.
- **A cell may tighten a cap, never widen one.** `tighten(limit, want)` takes the smaller.
  The authority is the armed policy on the gate, not the cell's params.
- **`wouldAllow(brain, what)` is the read side of authority.** A planner may ask whether a
  reach is inside the declared world before committing a cell to trying. Asking proposes
  nothing, and the test asserts `gate.stats.proposed === 0` after asking.

## Things another subsystem may want

- `core/gate.mjs` now has two instance level kind installers against it (`self/apply.mjs`
  and `world/policy.mjs`) that copy the same eleven lines of `propose`. If a third appears,
  core should grow a `gate.register(kind, decide)` and all three should use it.
- `Ledger` has no index from a proposal id to its decision, so `world/trace.mjs` scans
  forward a bounded 64 seqs. A proposal decided far later than it was filed (a human hold)
  will not have its decision folded into the chain. The proposal itself always is.
- A CLI surface for this region (`brain world status`, `brain world trace <seq>`,
  `brain world allow <host>`) is not written. `worldStatus(brain)` and `worldActions(brain)`
  return exactly the payloads such commands would print.

## 2026-09-17: the venue, the trading use case inside the organism

Date from the `date` command on this machine: `Thu Sep 17 17:19:35 EDT 2026`.

This section was owed by the run that built the venue and was cut off by a session limit
before it could be written. The files it left on disk are `world/venue.mjs`,
`bench/venue.mjs`, the `venue` block in `world/policy.json` and `world/policy.mjs`, the
venue wiring in `world/index.mjs`, and the venue tests in `test/world.test.mjs`. What I
added today is one test it never wrote and this note; everything else below I re-ran
rather than copied, and every number here is from a line printed in that re-run.

### What it is

The trading use case, inside the brain, with no real orders anywhere in it. Four cell
kinds, each an ordinary cell in an ordinary circuit on the same connectome as everything
else: `sense.venue` replays a recorded tape of pool reserves one reading per run in time
order, `world.venue` turns motor output into a paper order filled off that tape,
`venue.trader` is the decision cell, and `venue.script` is the same shape driven by a
fixed order list so a control arm travels the identical edges with the identical latency.
The tape comes out of the frozen trader package, `trader/data/trader.db`, opened through
`node:sqlite` with `readOnly: true`. Nothing in the module imports anything but local
files, `node:sqlite` and `node:path`, and a test asserts that against the source text,
which is the only form of the assertion that survives somebody editing the file.

Three things the fill refuses to do. It never reaches a venue: there is no order path out
of the process, no credential and no signer. It never fills at a mid: a mid is a ratio,
not an offer, so every fill is the constant product payable price out of the reserves at
the reading, which means a buy pays strictly more than the mid and a sell receives
strictly less. It never fills for free: a round trip is charged the round trip cost once,
when it closes, on the notional that opened it, so a pool that never moved still loses.

An order fills at the reading AFTER the one the decision cell reacted to, when the tape
has one. That is the conservative convention: the organism never trades at the price of
the tick it reacted to. The cost of that convention is measured rather than assumed, and
it is the same wiring for every arm:

```
  order path: 1400 brain orders, 1400 filled, 0 refused by the gate, 0 open at the end, mean fill lag 1.792 readings
```

### The authority

Every order is a `world.act` proposal of op `venue.order` before it is anything else, and
the replay itself is one proposal of op `sense.venue` that opens the stream, exactly the
granularity `sense.poll` already uses. The gate re-derives both out of `what`, so a cell
that attaches flattering evidence changes nothing. `world/policy.json` ships the venue
denied: `enabled` false, no tape, no venue, synthetic not allowed. `paper` is not a mode
among modes, it is the only mode there is: a policy with `paper` false refuses every
order rather than opening a live one. A whole venue run files proposals of exactly two
ops and no others, which the test asserts by reading the ledger back:
`assert.deepEqual(ops, ['sense.venue', 'venue.order'])`.

### The fee is borrowed, and the note says so in those words

`trader/bench/verdicts/desk.json` publishes the assertion "FEE_BAR is the measured 4.54%
round trip" with detail "0.0454". That was measured on pump.fun bonding curves. The tape
replayed here is pumpswap, and `trader/bench/verdicts/instrument.json` says of that venue
that its round-trip cost has never been measured. So 0.0454 is a BORROWED constant, not a
measurement of this venue, and borrowing it is the conservative direction only if pumpswap
is cheaper than pump.fun, which nobody has shown either. The bench prints that on its own
fourth line, and the verdict carries `fee.borrowed: true` next to the value.

### What was measured

`node bench/venue.mjs`, 12 seeds, 24 instruments drawn per seed out of 2839 eligible
pumpswap signatures, three arms interleaved inside each seed so nothing that drifts
between the start and the end of a run can land on one arm and not the others. The
primary size is 0.02 SOL, which is the desk incumbent. Printed:

```
  arm       trips   net SOL      deployed SOL   return on deployed   mean gross return per trip   fees SOL   seeds net positive
  brain      700    -3.65504        14.0000              -26.11%                      -21.57%    0.63560    0 of 12
  control    700    -7.29304        14.0000              -52.09%                      -47.55%    0.63560    0 of 12
  hold       288    -2.41539         5.7600              -41.93%                      -37.39%    0.26150    1 of 12
  brain beat the control on 12 of 12 seeds (sign test p 0.000244141), beat hold on 10 of 12 (p 0.019287109), deterministic true
  CLAIM at 0.02 SOL: the brain beats the matched random control but does NOT clear the fee bar: nothing here is purchasable
```

The plain reading. The brain arm beat its own rate matched and duration matched random
control on every one of the 12 seeds, and the printed sign test says a coin does that with
probability 0.000244141. It beat buy and hold on 10 of 12 at p 0.019287109. And it lost
money on 12 of 12 seeds. Both facts are the result. The separation from the control is
real and is not purchasable, because the gross return per round trip is -21.57% against a
4.54% bar: the brain is losing less badly than random, not winning.

Why it loses is printed too, and it is not the fee. What our own size costs against the
recorded book, buying and selling back at the same reading, with no fee charged at all:

```
  impact ONLY (not a fee), a round trip at 0.02 SOL against the reserves of seed 1 over 1440 readings:
     p10 0.0066%   median 35.0379%   p90 100.0000%   worst 100.0000%   mean 47.9195%
     52.43% of readings cost more in impact alone than the whole 4.54% fee bar
the quote reserve on the seed 1 tape: p10 0.000000  median 0.074505  p90 610.5794 SOL
```

A median quote reserve of 0.074505 SOL against an order of 0.02 SOL: the order IS the
book on most readings, and at the p90 reading a round trip costs 100.0000%, which is the
arithmetic saying the order empties the pool. So the bench sweeps the size rather than
assuming it, and a second sweep at 0.0005 SOL prints:

```
  brain      700    -0.07909         0.3500              -22.60%                      -18.06%    0.01589    0 of 12
     46.67% of readings cost more in impact alone than the whole 4.54% fee bar
  CLAIM at 0.0005 SOL: the brain beats the matched random control but does NOT clear the fee bar: nothing here is purchasable
```

Shrinking the order moved the mean gross return per trip from -21.57% to -18.06% and
moved the share of readings whose impact alone exceeds the fee bar from 52.43% to 46.67%.
It did not change the verdict at either size. That is the honest shape of it: on this tape
the size is not the thing standing between the organism and a purchasable rule.

The verdict field of `bench/verdicts/venue.json` is about whether the MEASUREMENT is
sound, never about whether the brain made money, which is the separate `claim` field and
is allowed to say no. It said:

```
VENUE GREEN: every arm ran true, no order refused true, nothing open at the end true, nothing dropped at the border true, control rate matched true, deterministic true, every trip paid the fee true
```

Written at `2026-09-17T21:20:06.299Z` by the bench itself, on `node v24.15.0`, 32 cpus,
win32.

### The hole I closed today

Every venue test in the file ran on a SYNTHETIC tape: rows this process generated, whose
balances are numbers by construction and whose readings are in time order by construction.
`loadTape` against the real recorded database, which is the only tape the bench ever
replays, had no test at all. That is the shape of defect this codebase keeps finding: a
check that has only ever seen one kind of row. A schema drift, a u64 balance arriving as a
string, or a row order that is not time order would have reached the bench with nothing in
the way, and the bench would have fallen back to the generator and kept printing rates.

So `test/world.test.mjs` grew one test, "the recorded tape really is the frozen trader
package, read only, and its rows survive the trip". It opens the real file, asserts the
tape is the recording and not the generator, asserts every balance at every reading is a
finite positive NUMBER and not a string, walks the whole replay asserting it is in
non-decreasing time order, loads the same seed twice for the same tape and a different
seed for a different draw, asserts the database is byte for byte the same size with the
same mtime afterwards and that no write ahead log or journal sidecar was left behind, and
then runs a real arm on those recorded rows and asserts it filled, closed round trips, had
nothing refused, left nothing open and paid the fee on every entry notional. It skips with
a named path if the frozen package is not on the machine, and it did not skip here:

```
ℹ tests 27
ℹ pass 27
ℹ fail 0
ℹ skipped 0
```

### What I request from core

One. A way to run a brain until it is quiet. Both `bench/venue.mjs` and
`test/world.test.mjs` hand-roll the same loop: tick once, look at three queue lengths and
a done flag, break, with a capped iteration count so a stuck organism cannot hang the
gate. Two copies of a termination condition is how two arms end up settling differently
without anybody noticing. Core should own it as `brain.settle({ maxTicks, quiet })`,
returning the tick count it used and whether it reached quiet or hit the cap, so that a
run that hit the cap is a reported fact rather than a silent truncation.

Two. The border relay passes one event per run, which is why `attachVenue` gives the sense
half the border period: two border runs per reading, one for the reading and one for
whatever the reading caused. That ratio is reasoning, not measurement, and a decision cell
that fell behind would be trading on a price that is already old without the number
changing anywhere. The measured `mean fill lag 1.792 readings` above is the only witness
there is. Core should either let a relay declare how many it may drain per run, or publish
a backlog counter on a relay so a bench can assert the border never queued.

Three. A borrowed number needs one home. The 0.0454 fee is written into `world/venue.mjs`
as a constant with its source, into `world/policy.json` as a default, into the bench
banner, into the verdict, and into a test assertion. Hand copies of a number measured on a
different venue, spread over that many files, are exactly the arrangement where one of
them gets updated and the others do not. If core
grew a small registry of foreign constants (value, source file, source assertion, what it
was measured on, what it is being applied to), the disclosure would be structural instead
of five paragraphs of good intentions.

Four, restating an open request from the section above, because the venue leans on it: the
`Ledger` has no index from a proposal id to its decision, so `world/trace.mjs` scans a
bounded 64 seqs forward. A venue sweep files an order proposal for every one of the
`1400 brain orders` printed above, on top of one replay proposal per arm. Nothing observed
here failed because of it, and I am not claiming it did, but the bound is the kind of thing
that stops being true quietly.

## The venue, as bench/verdicts/venue.json measured it (2026-09-17)

Date from the `date` command on this machine: `Thu Sep 17 22:33:12 EDT 2026`. The section
above describes the venue and its authority; this one is the arithmetic, so that the file
carries the numbers and not only the design. Every figure here is read back out of
`bench/verdicts/venue.json`, which `bench/venue.mjs` wrote after its own measurement.

The tape is recorded, not synthetic: `trader.db`, venue `pumpswap`, 24 instruments per
seed drawn from 2839 eligible, 1440 readings, spanning 370435713 ms. The fee bar is
0.0454 a round trip and it is BORROWED: measured on pump.fun, applied to pumpswap, which
has never been measured. Twelve seeds, three arms, interleaved inside each seed.

At the incumbent 0.02 SOL:

```
  arm       trips   net SOL     return on deployed   mean gross per trip   seeds net positive
  brain       700   -3.65504              -26.1074%             -21.5674%    0 of 12
  control     700   -7.29304              -52.0931%             -47.5531%    0 of 12
  hold        288   -2.41539              -41.9339%             -37.3939%    1 of 12
```

The brain beat the matched random control on 12 of 12 seeds, sign test p 0.000244140625,
and beat hold on 10 of 12. At the small 0.0005 SOL size the shape is the same: brain
-22.5975%, control -47.2931%, hold -38.5744%, again 12 of 12, again p 0.000244140625. So
the ordering is stable across a 40x change in size, which is the one thing about it worth
believing.

Nothing here is purchasable, and the reason is one line: mean gross return per round trip
is -21.5674% at the incumbent size and -18.0575% at the small one, against a 4.54% bar.
Both sweeps carry `clearsFeeBar` false. What the brain has is a smaller loss than random
entry, not a gain. `verdict` is GREEN and `claim` says so in words, because the verdict
field is about whether the measurement was sound (every arm ran, no order refused,
nothing open at the end, nothing dropped at the border, control rate matched,
deterministic, every trip paid the fee) and never about whether the organism made money.

The number that explains the rest: over the 1440 readings of the seed 1 tape, a round trip
at 0.02 SOL costs a median 35.0379% in IMPACT alone, and 52.4306% of readings cost more in
impact than the whole fee bar. The quote reserve on that tape has a median of 0.074505 SOL
against an order of 0.02. At that size the order IS the book, and what a fill costs is our
own size rather than the venue.

## The venue suite, and generations on a market (2026-09-17)

Date from the `date` command on this machine: `Thu Sep 17 22:33:12 EDT 2026`. What this
adds to the section above: the venue stopped being one bench and became a SUITE the
generations engine can evolve on, and the first evolution run on it is a null.

### Hosted

`tasks/venue.mjs` is the fourth suite in `tasks/index.mjs`, alongside algebra, sequence and
grid. It is the only one whose number is a difference against a control rather than an
exact answer, which is why `SUITES` (the row `bench/tasks.mjs` adds into one accuracy) is
still the three and `SUITES_ALL` is the four: summing windows-a-control-was-beaten-on into
an answer accuracy would publish one rate over two populations.

The hosting is real and it was checked rather than assumed. `hostableSuites()` returns
`["algebra","sequence","grid","venue"]` with nothing unreachable, so the denominator of
the task score is 4. An organism carrying only `sense.venue`, `world.venue` and
`venue.trader` scores:

```
{"score":0.0625,"eligible":["venue"],"skipped":["algebra","sequence","grid"],"unreachable":[],"denominator":4,"coverage":0.21428571428571427,"perSuite":{"algebra":null,"sequence":null,"grid":null,"venue":0.25}}
```

0.25 on venue over a denominator of 4 is 0.0625, and the three suites it cannot host are
`null` and named in `skipped`, not scored zero. That distinction is the whole point: a zero
would read as "did not beat a coin" when the truth is "was never run". The venue number is
low because the engine runs that suite at `{ windows: 4, readings: 20 }` and the brain beat
its own control on 1 of those 4 windows.

This block was typed WRONG the first time (0.125 and 0.5, exactly double both) and nothing
checked it. It is not typed any more: `bench/venue-suite.mjs` asks the genome module for it,
prints it, and writes it into the verdict as `hosting`, and two tests in
`test/venue-suite.test.mjs` compare the published copies, here and in the verdict, against a
fresh `scoreSuitesFor` call. See the correction section at the end of this file.

Added today so the suite names cells the way the other three do: `VENUE_ROLES` and
`venueCellsOf(brain)`, over `tasks/host.mjs` `nameCells`. A brain with no venue cell gets
every role back in `missing` and an empty `cells` map, rather than a wrong id.

### The third arm

`solveVenue` runs two arms per window, the brain and its own matched random control.
`bench/venue-suite.mjs` needed a third, never trade, and it may not be assumed: an arm that
returns zero because it never ran and an arm that returns zero because it declined to trade
are the same number. So `windowTapeOf`, `runWindowArm` and `matchedControl` are exported
from `tasks/venue.mjs` and the never trade arm is a `venue.script` cell with an empty order
list, travelling the identical edges. On the run below all three arms emitted 192 readings
on train and 192 on holdout, which is what makes its zero a measured zero.

### Generations on the tape

`bench/venue-suite.mjs` evolves the five parameters `venue.trader` reads (lookback,
entryUp, trail, maxHold, maxOpen). `size` is deliberately NOT a gene: a search allowed to
shrink its own order would discover that the smallest order pays the least impact and
report that as a trading rule. Two populations are stepped in the same generation on the
same windows, differing in one line, who may be a parent: `selected` breeds the top half,
`drift` breeds anybody. The windows are split by INSTRUMENT, 8 train and 8 holdout out of
one pool of 16, disjoint, so the search never saw the holdout instruments.

```
node bench/venue-suite.mjs --generations 16 --pop 32 --drift 16 --windows 8 --readings 24
```

wrote `bench/verdicts/venue-suite.json`, verdict GREEN, and printed:

```
  HOLDOUT, 8 windows, three arms interleaved per window
  arm           trips   net quote   deployed quote   return on deployed        per window mean   95% interval, both edges
  brain            3   -0.000233         0.001500            -15.5098%               -3.9752%   [-9.0943%, 1.1439%]
  random           3   -0.000098         0.001500             -6.5401%               -2.2934%   [-6.4433%, 1.8566%]
  never trade      0    0.000000         0.000000              0.0000%                0.0000%   [0.0000%, 0.0000%]
  brain minus random, per window: mean -1.6818%  95% [-4.9782%, 1.6146%]  n 8  sd 0.047569
  won 0 of 8 windows against its own control (sign test p 1.000000), traded on 2
  mean gross return per round trip -10.9698% against the 4.54% borrowed fee bar: clears it false
```

Both edges, always, and here both edges matter: the brain-minus-random interval runs from
-4.9782% to +1.6146% and therefore includes zero. Quoting either end alone would be
quoting whichever end helped.

THE RESULT IS A NULL, and it is written as one. On train the best genome reached a fitness
of 0.1548825307294358 at generation 2; on the holdout the same genome lost to its own
control on 0 of 8 windows and returned -15.5098% on deployed against the incumbent
defaults' -0.7232% on the SAME windows. The search MOVED holdout return on deployed by
-14.7866%: it made the holdout worse than the parameters it started from. Selection beat
drift on train by 0.023187 of return on deployed, which is a gap between two numbers that
both came out of the train windows and says nothing about the holdout.

The line that explains all of it:

```
BUDGET: 692 evaluations over 5 genes, graded on 6 closed round trips across 8 train windows (3 of them traded at all), and checked on 3 round trips across 8 holdout windows
```

115.33 evaluations per closed round trip. The denominator of this experiment is not
windows and it is not evaluations, it is TRADES, and six of them cannot support a search
over five free parameters. The honest reading of the whole run is that the measurement is
sound and the evidence is absent. Before today 0 of 12 arms in `bench/verdicts/venue.json`
cleared the fee bar; after today that is still true, and now an evolved trader has failed
to clear it too.

### Things another subsystem may want

One. The suite is hostable, but it is not yet hosted the way algebra and sequence are:
`solveVenue` always builds its own brain through `attachVenue` rather than injecting into a
brain somebody else grew, so `venueCellsOf` currently reports what a host brain COULD carry
without anything using the answer. The blocker is that the venue path needs a live tape
object bound into `sense.venue` params and the border relays wired, which `attachVenue`
does at construction. Until a cell can be handed a tape after it exists, an organism's own
venue cells cannot be driven by this suite.

Two. The venue suite's score under `scoreSuitesFor` is a function of the KIND SET alone, so
every organism that contains the three kinds scores the identical number and the generations
engine gets no gradient from it. That is why the search in this bench moves cell PARAMETERS
and not anatomy. Giving the engine a real gradient needs the organism's genome to carry the
decision cell's parameters, which is a genome change and not a suite change.

Three. `test/epochs.test.mjs:32` is RED and it was RED before this run: it asserts that a
default genome's `kindMix` has exactly `r.roster.length` keys for each region of
`seeds/organism.mjs` REGIONS. `generations/organism-genome.mjs` deliberately never writes
that exported table and instead unions it with `VENUE_ROSTER`, so perception is 16 in seeds
and 17 in the genome, and motor is 8 and 10. The assertion should compare against
`rosterOf(r.name)` from `generations/organism-genome.mjs`, which is the table the genome is
actually built from. That file is not mine to edit.

## The venue suite, three defects found by the testing plane (2026-09-17)

Three of the four problems reported against the run above were real and every one of them
was the same defect wearing three faces: **a published number that no longer belonged to the
command that printed it.** The fourth was real too and was the reason for the other three.

### One. The deliverable verdict was written by older code

`bench/verdicts/venue-suite.json` on disk had 25 top level keys, no `hosting` block, and 11
entries in `checks`. The current `bench/venue-suite.mjs` writes 29 keys, a `hosting` block
and 13 checks, the two extra being `venueSuiteIsHostable` and `hostingFigureRepeats`. The
hosting figure was added to the bench AFTER the canonical run and the canonical run was
never repeated, so the file was a verdict for a version of the script that no longer exists.
Nothing detected it except the test written to detect exactly this, which is the point of
that test. Fixed by RE-RUNNING the canonical configuration, not by editing the file: a
verdict is written by the bench after the measurement or it is not a verdict.

```
node bench/venue-suite.mjs --generations 16 --pop 32 --drift 16 --windows 8 --readings 24
```

29 keys, 13 checks, all true, `verdict` GREEN, 36541 bytes.

### Two. One test therefore failed, and the count was reported wrong

`node --test test/venue-suite.test.mjs` printed `tests 12 / pass 11 / fail 1`, the failure
being `test/venue-suite.test.mjs:214`, which asserts the verdict carries a `hosting` block.
The previous report claimed 9 tests all green. It was counting a version of the file from
before the two hosting tests were added, the same staleness as defect one. After the re-run:
12 tests, 12 pass, 0 fail.

### Three. The hosting figure quoted in the report was the doubled one

The report to the director said `{"score":0.125,...,"venue":0.5}`. The code prints half that:

```
{"score":0.0625,"eligible":["venue"],"skipped":["algebra","sequence","grid"],"unreachable":[],"denominator":4,"coverage":0.21428571428571427,"perSuite":{"algebra":null,"sequence":null,"grid":null,"venue":0.25}}
```

Line 394 of this note already carried the corrected figure, and the test that grades every
fenced hosting block in this file against `scoreSuitesFor` was green the whole time. So the
note was right, the code was right, the test was right, and the only wrong copy was the one
in prose that no test could see. That is the lesson worth keeping: **a number that lives only
in a report is a number nothing grades.** The verdict now carries the hosting block, so the
figure has exactly one source and two tests reading it.

### Four. test/epochs.test.mjs:32, closed

It compared `Object.keys(genome.regions[r].kindMix).length` against `r.roster.length` from
`seeds/organism.mjs`, while the genome is grown from `rosterOf(r)` in
`generations/organism-genome.mjs`, which is the seeds roster unioned with `VENUE_ROSTER`.
Perception is 16 in seeds and 17 in the genome, motor 8 and 10, so it went red at `17 !== 16`
the moment the venue kinds were registered. Fixed by comparing the NAMES against
`rosterOf(r.name)` and separately asserting every seeds kind survives into the mix, which is
STRONGER than the count it replaced: a count passes when one kind is swapped for another and
the name comparison does not. The roster and the genome now have to agree on what a region
hosts, and the only difference either is allowed is the one this module declares.

`node --test test/epochs.test.mjs` 30 tests, 30 pass, 0 fail.
Together with the neighbours: `test/venue-suite test/tasks test/world test/generations
test/epochs`, 100 tests, 100 pass, 0 fail.

### What did not change

No number in the experiment moved. Best train fitness is still 0.154883 at generation 2 over
692 evaluations, the holdout still wins 0 of 8 windows against its own control at sign test
p 1.000000, holdout return on deployed is still -15.5098% against the incumbent's -0.7232%
on the same windows, and the search still MOVED holdout return by -14.7866%. The null stands
and stands as a null. Only the figure that describes the SUITE's hosting was wrong, never the
figure that describes the trading, and the trading figure still says the same thing it said:
six closed round trips cannot support a search over five free parameters.
