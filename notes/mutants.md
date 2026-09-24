# notes/mutants.md: what the mutation plane found

Written by the testing plane. Every number below was printed by a command named beside it;
nothing here is estimated.

## The run

```
node bench/mutants.mjs --timeout 20000 --budget 40000
preflight: 44 mutants, every find string found exactly once
baseline: 50 tests pass, 0 fail, 296ms, files 5
MUTANTS GREEN: 44 defined, 44 executed, 44 killed, 0 survived, 0 never ran, baseline 50 pass / 0 fail
```

Verdict file: `bench/verdicts/mutants.json`, per-mutant log `bench/verdicts/mutants.progress.log`.

**No core defect was found.** No test in this plane is marked expected-failing, because none
needs to be: every deliberate defect the table describes was caught by a test that passed at
baseline, and nothing the property tests measured disagreed with the core.

## Three rules the harness needed before its tally meant anything

**1. Killed is measured against a baseline, not against green.** The suite is run once
unmutated and every test that already fails is remembered by name; a mutant counts as killed
only when a test that PASSED at baseline fails under the mutation. Earlier in this session
`test/universal.test.mjs` was red at baseline (0 of its 7 tests passing), and without this rule
those red tests would have certified every mutant as killed while measuring nothing at all.

**2. A mutant that never ran is not a survivor and not a kill.** The preflight requires every
`find` string to occur EXACTLY ONCE in the file or the whole run aborts before a single test
executes (`MUTANT TABLE IS STALE, nothing was run`, exit 2), `applyMutant` throws if the write
did not change the file, and the tally line carries `executed` next to `killed` and `survived`.
This is not hypothetical: the first preflight of this table aborted on four entries whose
anchors had moved under a concurrent edit of `core/`. A silent skip would have printed a clean
44 of 44.

**3. A mutant can stop the machine halting instead of failing a test.** `m33` (ratCmp cross
multiplies the wrong pairs) makes a program in `test/universal.test.mjs` run forever. The
per-test timeout could not end it, so the harness also puts a wall clock on the whole suite,
aborts the run, and records the kill as `by the suite stopped halting` with `timedOut: true` in
the JSON. It is a real kill, and it is labelled differently from an assertion kill so nobody
has to guess which it was.

## An equivalent mutant, deliberately left out of the table

`core/connectome.mjs:74`

```js
arrival(e, t) { return t + 1 + this.delay[e]; }
```

Mutating the `+ 1` to `+ 0` looks like the obvious travel-time mutant, and it is UNKILLABLE.
`Brain._schedule` clamps any arrival that lands in an already drained tick:

```js
_schedule(at, item) { if (at <= this.drainedT) at = this.drainedT + 1; ... }
```

so an arrival of `t + 0 + delay` for a zero-delay edge is pushed straight back to the next tick
and the brain behaves identically. Putting it in the table would make `survived === 0` (and
therefore exit 0) impossible to reach for a core that is not actually wrong. The travel rule is
covered instead by `m07` (`t + 2`), `m08` (delay dropped), `m05` (the clamp itself removed) and
the invariant `a signal never arrives earlier than t + 1 + delay`.

Two more traps that shape the table rather than sit in it:

- `core/gate.mjs:26`, `this.humanRequired.has(p.kind) ? 'hold' : this.policy(...)`. Mutating
  `'hold'` to the policy call is INVISIBLE, because `defaultPolicy` also returns `hold` for
  those kinds. The killable mutation is `? 'approve' :`, which is `m19`.
- `core/signal.mjs:62`, the bundle tie vector cache. `m25` (never rebuild TIE on a width change)
  is only killable if the first bundle in the process happens at a SMALL width, because a longer
  TIE built from the same seed has the shorter one as a prefix. That is why the test that kills
  it is declared first in `test/invariants.test.mjs` and says so in its name.

## Where the kills came from

Counted from `bench/verdicts/mutants.json`, by the test that killed each mutant:

| killed by | mutants |
| --- | --- |
| test/core.test.mjs | 20 |
| test/invariants.test.mjs | 14 |
| test/universal.test.mjs | 6 |
| test/simd.test.mjs | 2 |
| test/fuzz.test.mjs | 1 |
| the suite stopped halting | 1 |

The 14 that only this plane catches are the scheduler tie-break, the drained-tick clamp, the
arrival floor, the port kind check on both paths, the prune candidate rules, the co-activation
budget and self-pairing, the tie vector width, and the rational normal form. The one caught by
`test/fuzz.test.mjs` is the `fits` lane condition, caught at width 40. Per-mutant attribution is
one line each in `bench/verdicts/mutants.progress.log`.

## The whole plane, after the sweep

```
node bench/invariants.mjs
INVARIANTS GREEN: 16 tests, 16 pass, 0 fail, 116ms, file test/invariants.test.mjs

node bench/fuzz.mjs
FUZZ GREEN: 6 tests, 6 pass, 0 fail, 270ms, file test/fuzz.test.mjs

node bench/gate.mjs
GATE GREEN: test files 19/19, assertions 248 pass / 0 fail, authored code lines 26214 in 130
files, prose lines 6436, generated organism lines 485992 in 29 files, em-dash files 0, bad
imports 0
```

## The surfaces landed today: act/, core/simd.mjs slots, self/propose.mjs, the years clock (2026-09-17)

37 new mutants over six modules, four new subsystems in the table (`act-web`, `act-shell`,
`act-llm`, `simd`), and two passes, because the first pass is the measurement and the second
one is the proof that the tests added in between do what they were added for.

### Pass 1: every mutant ran, eleven of them survived

```
node bench/mutants.mjs --sub act-web,act-shell,act-llm,simd --timeout 90000 --budget 90000 --tag pass1
MUTANTS RED: 30 generated, 30 executed, 26 killed, 4 survived, 0 not executed, wall 78948ms

node bench/mutants.mjs --sub self --only sp --timeout 90000 --budget 90000 --tag pass1
MUTANTS RED: 3 generated, 3 executed, 0 killed, 3 survived, 0 not executed, wall 9144ms

node bench/mutants.mjs --sub epochs --only ey --timeout 90000 --budget 90000 --tag pass1
MUTANTS RED: 4 generated, 4 executed, 0 killed, 4 survived, 0 not executed, wall 4143ms
```

37 generated, 37 executed, 26 killed, 11 survived, 0 not executed. Every survivor carries the
probe count that proves the mutated line RAN, which is what makes "survived" a statement about
the tests rather than about the mutation:

| mutant | file | probe hits | what nothing noticed |
| --- | --- | --- | --- |
| aw07 | act/web.mjs | 11 | the url guard is consulted only on the first url |
| aw09 | act/web.mjs | 27 | credentials in a url stop being refused |
| aw10 | act/web.mjs | 6 | the wildcard allow entry loses its dot |
| al03 | act/llm.mjs | 6 | scrub replaces only the FIRST occurrence of the key |
| sp01 | self/propose.mjs | 25 | the prune cap collapses to its floor |
| sp02 | self/propose.mjs | 25 | the prune cap is ten times its declared share |
| sp03 | self/propose.mjs | 1 | the PUBLISHED rule states a share the code does not use |
| ey01 | generations/epochs.mjs | 1 | the year becomes a 365 day calendar year |
| ey02 | generations/epochs.mjs | 4 | years per generation drops the population |
| ey03 | generations/epochs.mjs | 14 | the lineage clock counts one generation too many |
| ey04 | generations/epochs.mjs | 14 | the printed arithmetic states a different number than it reports |

### The eleven survivors are three findings

**1. A refusal is only evidence of the rule it names (aw09, aw10).** `test/act-web.test.mjs`
refuses twelve hostile urls and asserts, for each, `ok === false` and a non empty reason. Both
mutants deleted a whole refusal rule and not one assertion moved, because the url meant to
exercise the rule is ALSO refused by a different one: `http://allowed.example@10.0.0.1/` is a
private address whatever the userinfo says, and the wildcard was never offered a name that ends
in an allowed suffix without the dot (`notdocs.example`). The twelve urls measure that the guard
refuses, not WHY. New test, named after the mutants: `each refusal rule is exercised by a url
that only that rule refuses (mutants aw09, aw10)`, which puts userinfo in front of an ALLOWED
public host and offers `notdocs.example` against `*.docs.example`, with the two shapes the
wildcard exists for as the control.

**2. A rule that is published as prose is a number nothing checks (sp03, ey01, ey04).**
`PRUNE_CAP_RULE = 'cap = max(256, ceil(edges * 0.01))'` is exported, read by `self/daemon.mjs`
to arm the gate and quoted in notes; changing the string to `0.02` while the code kept `0.01`
was invisible to 28 passing tests. `SECONDS_PER_YEAR` was compared only against ITSELF: the old
years test asserts `y.years === (y.ticks * m.secondsPerTick) / SECONDS_PER_YEAR` with the same
constant on both sides, so a year of 365 days passes it. And `years().arithmetic`, the sentence
the portfolio and the CLI print, was asserted only to CONTAIN the substring `organism-years`;
ey04 doubled the number inside it and nothing failed. The two new tests grade each number
against its DEFINITION instead of against itself: the cap against the rule string parsed at run
time, the Julian year against `365.25 * 24 * 60 * 60`, and the printed sentence against the
field it claims to explain.

**3. The self plane's own cap had no test at all (sp01, sp02).** Nothing in
`test/self.test.mjs` imported `pruneCap`. The number that decides how much of a live organism
one approved self change may prune was ungraded, on the plane that writes it.

### An equivalent mutant, removed from the table

aw07 was `if (!guard.ok)` narrowed to `if (firstHop && !guard.ok)` in `fetchPage`: the url guard
consulted on the first url only. It ran 11 times and survived, and it is UNKILLABLE, because
`guardResolved` returns the guard's own reason unchanged when the guard is not ok:

```js
if (!guard || !guard.ok) return { ok: false, reason: guard && guard.reason ? guard.reason : 'no guard', addresses: [] };
```

and the `!res.ok` branch two lines below composes the identical `redirect hop N to ... refused: `
message from it. Skipping the `!guard.ok` branch on a later hop changes no observable value, so
that branch is a short circuit, not a second authority. Leaving it in the table would make
`survived === 0` unreachable for a surface that is not wrong. aw07 now mutates the hop RECORD
instead (`hops.push(...)` deleted), which is the evidence that the hop never left, and that one
is killed by `a redirect into loopback is refused at the hop, and the hop never leaves`.

### Pass 2: the same 37 mutants against the tests added for them

```
node bench/mutants.mjs --sub act-web,act-shell,act-llm,simd,self,epochs --only aw,as,al,sm,sp,ey --timeout 90000 --budget 90000 --tag landed-2026-09-17
MUTANTS GREEN: 37 generated, 37 executed, 37 killed, 0 survived, 0 not executed, wall 92867ms
subsystem      generated executed killed survived notExec unmutatedMs
  act-web             10       10     10        0       0         323
  act-shell           10       10     10        0       0        3130
  act-llm              5        5      5        0       0         157
  simd                 5        5      5        0       0         369
  self                 3        3      3        0       0        2328
  epochs               4        4      4        0       0         947
```

Verdict `bench/verdicts/mutants.json`, per subsystem
`bench/verdicts/mutants-by-sub/<sub>-landed-2026-09-17.json` (plus `-pass1` and `-pass2`, the
before and after of the same mutants). Unmutated baselines in that sweep: act-web 16 pass / 0
fail, act-shell 19 / 0, act-llm 15 / 0, simd 19 / 0, self 29 / 0, epochs 29 pass / 1 fail. The
one epochs red is `genome: the default genome is valid and carries every region`, which lives in
`generations/organism-genome.mjs` and belongs to another builder; the harness remembers it by
name at baseline, so it certified nothing.

### Where the 37 kills came from

| killed by | mutants |
| --- | --- |
| test/act-web.test.mjs :: the address families are read from the address, not from the spelling | 5 |
| test/act-shell.test.mjs :: allowArgv: a shell string, an empty argv and a bad element are all refused | 5 |
| test/epochs.test.mjs :: the years clock is the Julian year, the population and the sentence it prints | 4 |
| test/act-llm.test.mjs :: env provider: the header arrives, and the key is in nothing that comes back | 3 |
| test/self.test.mjs :: the prune cap is the rule it publishes, at every organism size | 3 |
| test/act-web.test.mjs :: a redirect into loopback is refused at the hop, and the hop never leaves | 2 |
| test/act-web.test.mjs :: each refusal rule is exercised by a url that only that rule refuses | 2 |
| test/act-shell.test.mjs :: the ledger holds one event per run, and never an output or a secret value | 2 |
| test/hvheap.test.mjs :: a dropped view returns its slot, and a stale finalizer cannot free a slot handed out again | 2 |
| eight more tests, one mutant each | 8 |

`core/simd.mjs`'s slot allocator was one of the two modules that killed everything on the first
pass: all five slot arithmetic mutants (a view placed at `s * n` instead of `s * SLOT`, a slot
never marked used, a generation that never advances, a finalizer handle packed the other way
round, a full heap test that can never be true) died against `test/hvheap.test.mjs`, which was
in no suite of this table until today. `act/shell.mjs` killed all ten on the first pass as well:
the argv allow list and the env NAMES rule are both tested as behaviour, including the run that
proves an unnamed variable does not reach the child.

### Two things the harness grew for this

- `--tag <name>` writes `bench/verdicts/mutants-by-sub/<sub>-<tag>.json` after the sweep, by the
  bench itself, so a sweep of one subsystem no longer erases the record of the last one and a
  before and after pair of the same mutants survives on disk.
- `--only` takes a comma separated list of prefixes, so one command can select the mutants of
  several subsystems and print ONE tally line over them.

## The prune BATCH, not just its cap (2026-09-17)

The sweep above landed 37 mutants over the six modules of that day and closed at 37 killed, 0
survived. Re-reading it against the contract it answered ("self/propose.mjs (batch cap)") left
one gap: sp01, sp02 and sp03 all grade `pruneCap`, which is only the UPPER BOUND of the batch.
The batch a round actually proposes is

```js
const batch = Math.max(8, Math.min(pruneCap(model.metrics.edges), Math.ceil(model.metrics.staleEdges * 0.02)));
```

Three terms, and each of them decides the number on a different organism: the floor on a small
stale population, the share in the middle, the cap on a large one. `pruneCap` is one of the
three, so the test added for sp01 to sp03 could not see the other two at all.

### Pass 1: three new mutants, all three ran, all three survived

```
node bench/mutants.mjs --sub self --only sp04,sp05,sp06 --timeout 90000 --budget 90000 --tag batch-pass1
   unmutated: 29 tests pass, 0 fail, 2319ms (budget 90000ms, a timeout counts as a kill)
   SURVIVED sp04  BATCH: the floor is dropped ... hits 21 (no new failure in 29 passing tests)
   SURVIVED sp05  BATCH: the share of the stale population is a tenth of the declared 2% hits 21 (no new failure in 29 passing tests)
   SURVIVED sp06  BATCH: the cap is not a cap ... hits 21 (no new failure in 29 passing tests)
MUTANTS RED: 3 generated, 3 executed, 0 killed, 3 survived, 0 not executed, wall 9235ms
```

21 probe hits each: the batch line ran 21 times under every one of them and no assertion in
`test/self.test.mjs` moved. Verdict `bench/verdicts/mutants-by-sub/self-batch-pass1.json`.

### The test that should have killed them

`test/self.test.mjs :: the prune batch is the floor, the share and the cap, one organism for
each (mutants sp04, sp05, sp06)`. One organism (majors 30, 80 ticks), three models over it,
each point a number only ONE of the three terms can produce:

| point | edges | staleEdges | cap | ceil(stale * 0.02) | batch | what decides it |
| --- | --- | --- | --- | --- | --- | --- |
| floor | 4,400 | 50 | 256 | 1 | 8 | the floor: the share asks for 1 |
| share | 1,000,000 | 5,000 | 10,000 | 100 | 100 | the share: floor 8, cap 10,000 |
| cap | 4,400 | 50,000 | 256 | 1,000 | 256 | the cap: the share asks for 1,000 |

The control the three points need is asserted first: the region holds 494 stale conduits, more
than the largest batch asked for, so what comes back is the rule's number and not the number
the region ran out at. Without it every point would measure the organism, not the rule. The
`self/propose.mjs` source was not touched; the model handed to `propose()` is.

### Pass 2: the same 40 mutants, after the test

```
node bench/mutants.mjs --sub act-web,act-shell,act-llm,simd,self,epochs --only aw,as,al,sm,sp,ey --timeout 90000 --budget 90000 --tag batch-landed-2026-09-17
MUTANTS GREEN: 40 generated, 40 executed, 40 killed, 0 survived, 0 not executed, wall 101095ms
subsystem      generated executed killed survived notExec unmutatedMs
  act-web             10       10     10        0       0         317
  act-shell           10       10     10        0       0        3180
  act-llm              5        5      5        0       0         159
  simd                 5        5      5        0       0         381
  self                 6        6      6        0       0        2473
  epochs               4        4      4        0       0         951
```

Unmutated baselines in this sweep: act-web 16 pass / 0 fail, act-shell 19 / 0, act-llm 15 / 0,
simd 19 / 0, self 30 / 0, epochs 30 / 0. The epochs baseline was 29 pass / 1 fail in the
22:38 sweep (`genome: the default genome is valid and carries every region`, owned by another
builder); that test passes now, so this sweep's epochs kills were measured against a clean
baseline rather than around a remembered red. Verdict `bench/verdicts/mutants.json`, per
subsystem `bench/verdicts/mutants-by-sub/<sub>-batch-landed-2026-09-17.json` (the
`-landed-2026-09-17` files of the 37 mutant sweep are left where they are).

Kills of the three new mutants, from the run above: sp04 28 hits, sp05 35, sp06 28, each by the
new test. The six `self` mutants are the whole rule now: `pruneCap` against the string it
publishes, and the batch against the three terms that compose it.

### One line of the harness

`bench/mutants.mjs` printed `...move the ratehits 21` for a `why` longer than its 66 char
column, because the pad was the only separator. A space now follows the pad. Nothing else in
the harness changed.
