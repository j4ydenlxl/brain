# THE WHOLE BRAIN

One persistent organism. Every subsystem that existed as its own module now sits in one
connectome (`seeds/whole.mjs`), runs in one process (`daemon/run.mjs`, started by `brain live`),
and is proved end to end by `test/whole.test.mjs`. Every number below was printed by
`node bench/whole.mjs` (verdict in `bench/verdicts/whole.json`) or by the commands named.

## The map: nine regions, what fills each

| region | filled by | cells at 1000 majors |
| --- | --- | --- |
| perception | organism majors (encode.*, sdr, grid.* hosts), `pe.sub.0` substrate, `arc.input`, `w.percept` border, `w.inbox` | 1,445 |
| association | organism majors (hv.*, seq.fit host), `as.sub.0`, phasor circuit `as.phv.*`, `arc.encoding` | 1,769 |
| cognitive | organism majors, `co.sub.0`, `cap.solve` + 15 `skill.*` cells, `arc.processing/integration/decision`, `ws.hub`, `att.goal`, `sim.model/plan/decide` | 1,626 |
| memory | organism majors, `me.sub.0`, `mem.working/episodic/semantic/sequence/self/consolidate/forget`, phasor memory `me.phv.*` | 1,213 |
| motor | organism majors, `mo.sub.0`, `arc.action`, `w.motor` border | 804 |
| homeostasis | the clock roster (periods 1, SEC, MIN, HOUR), `ho.sub.0`, `lrn.reward/error/mod` | 645 |
| generations | organism majors, `ge.sub.0` | 562 |
| language | `lang.tokenize`, `lang.context`, `lang.assoc`, `lang.decode` (mind/index.mjs, sealed) | 4 |
| world | `w.http`, `w.fs`, `w.proc`, `w.clock` actuators (world/index.mjs policy, gate armed) | 4 |

Every region also carries one `ws.submit.<prefix>` cell feeding the workspace hub. The learning
engine (`learning/`, rule hebbian, brain wide) and the memory system (`memory/`) are attached as
services; the skill registry (`capability/`) is induced at build and carried in the snapshot.

## The information flow, with delays

Sensory input, encoding, processing, integration, decision, action, consequence: one relay per
stage, wired in that order with the delay printed by `node -e` from `ARC`:

`w.percept` (world) -> `arc.input` (perception, +0) -> `arc.encoding` (association, +1) ->
`arc.processing` (cognitive, +2) -> `arc.integration` (cognitive, +1) -> `arc.decision`
(cognitive, +1) -> `arc.action` (motor, +2) -> `w.motor` -> the four actuators -> proposals
through the gate -> outcomes and timer events back into `w.percept`.

Each stage fans out into up to 3 event ports of its region and takes 2 back, so the organism's
own circuits ride the spine. `arc.processing` also feeds `cap.solve` (a verified answer returns
to `arc.decision`), `arc.integration` feeds the planner `sim.plan` whose `decide.argmax` choice
also lands on `arc.decision`, `w.percept` feeds `lang.tokenize`, and `lang.assoc` sends its
prediction error to `lrn.error` and its predictions into episodic memory.

Proof (test b): an event injected at `arc.input` became a `clock.timer` proposal at `w.clock` at
t=64 and `world.trace` walked 94 nodes back to the injected signal. Every edge added by the whole
goes through the strict `Wiring` of genome/wire.mjs; `auditWiring` over all 91,159 edges at 1000
majors found 0 faults.

## Timescales (bench, 200 ticks at 1000 majors)

| period | cells | runs in 200 ticks |
| --- | --- | --- |
| 1 | 1,019 | 203,800 |
| 64 (`w.clock`) | 1 | 4 |
| SEC | 864 | 864 |
| MIN | 554 | 554 |
| HOUR | 318 | 318 |
| event | 5,316 | 901,631 |

The seven substrate majors (100,000 units each) fired 1,057,601 / 1,078,455 / 1,107,408 /
1,047,422 / 1,084,980 / 1,116,419 / 1,090,872 units (perception through generations) over the
200 ticks. Attention scores every 16 ticks; a port on a period of SEC or slower keeps its last
32 items (notes/whole.md, request 1).

## The slow loops (proved with `brain live whole --ticks 400 --majors 12 --units 256 --self-every 150 --gen-every 200`)

Self-improvement (`self/daemon.mjs`, default every 20,000 ticks) runs in process: the tick hook
parks the runner on the due tick, a round trials candidates in isolated clones and applies at
most one through the gate, then the runner resumes. Organism generations (`generations/epochs.mjs`,
default every 100,000 ticks) step in a worker thread (`daemon/generations-worker.mjs`); the
elite's fitness against the last promoted control becomes a `genome.promote` proposal, and an
approved one applies the elite's region genes through `applyRegionGenes`. Printed by that run
(re-run 2026-09-17 on a fresh state, bench/verdicts/whole-live.json): round 1 (4 candidates, 4
confirmed, 1 applied, 655 ms) done at t=151 and round 2 (1,092 ms) at t=301; generation 1 best
og-r5 fitness 0.391589, `genome.promote` approved for region perception, gain 0.00916100000000003,
applied: retimed 15, relearned 7, redelayed 56; stopped at t=400, 129 ticks/s, edges 906
to 1,688, 2 checkpoints, exit 0. A retimed cell keeps the
runs it made on its old period, so the printed runs per period after a promotion read by the
period each cell ends on.

## The bench numbers (`node bench/whole.mjs`, 1000 majors, 100,000 units per region, ledger off)

- build 3,983 ms: organism 634, substrates 183, skills 378, mind 2,764, world 3
- cells 8,072, edges 91,159 (live 91,159), regions 9, kinds 87, illegal edges 0
- memory: rss 83.5 MB before build, 471 MB after build (heap 33.3 MB, arrayBuffers 88.4 MB),
  1,295.9 MB after 200 ticks (heap 157.9 MB, arrayBuffers 654.8 MB)
- 200 ticks in 54,930 ms: 3.64 ticks/s, 20,156 runs/s, 13,030 signals/s, 118,823 deliveries/s,
  0 edges grown
- per-region runs: perception 207,043, association 258,678, cognitive 199,706, memory 168,012,
  motor 118,691, homeostasis 86,378, generations 67,259, language 800, world 604

## Starting it, resuming it, stopping it

```
brain live                      # builds state/whole/ at 200 majors, 10,000 units, ticks forever
brain live --ticks 200          # 200 ticks, checkpoint, exit (the test's path)
brain live big --majors 1000 --units 100000 --checkpoint 500 --realtime --viz
```

`live` builds the whole when `state/<name>/snapshot.json` is absent and resumes it otherwise
(`restoreWhole`: cells, connectome, gate, in flight signals and mailboxes from the snapshot; the
memory system, skill registry, world policy and the language model retrained from the stored
training text from the snapshot's `whole` extras). It checkpoints every N ticks (`--checkpoint`,
default 1,000): `snapshot.json`, the ledger flushed to `ledger/ledger.jsonl`, `meta.json`, plus
`self/checkpoint.json` and `generations/gen-*.json` when those loops ran. SIGINT, SIGTERM and
SIGBREAK stop the runner, take a final checkpoint, close the control plane and the world's
timers, then exit. Proof (test e): `--ticks 200` stopped at t=200 and a second `--ticks 100`
resumed at t=200 with the same 168 cells and 1,565 edges, stopping at t=300; the loops run above
resumed at t=400 in 1,653 ms with its 1,688 edges and stopped at t=500 (70 ticks/s, 1
checkpoint, round 3 in 1,056 ms at t=451, generation 2 best og-g1-3 fitness 0.477565, edges 1,750 at the end).

## Attaching the CLI and the viz

While `brain live` runs it writes `state/<name>/control.json`; every other command attaches to
the live organism through it: `brain status whole`, `brain inspect whole cap.solve`,
`brain inject whole arc.input in event '{"afterMs":0,"key":"reflex"}'`, `brain trace whole <seq>`,
`brain proposals whole`, `brain approve whole <id>`, `brain pause|resume|step|snapshot whole`,
`brain stop whole`. Start the viz in the same process with `brain live --viz [--viz-port P]`; it
reads the live brain, so it shows the whole (an offline `brain viz whole` would restore the
snapshot without the whole's kinds registered, see notes/whole.md request 2).
# BRAIN, the persistent computational organism

Written 2026-09-17 in the form he asked for (his Tesseract write-up is the sample, kept in manual/tesseract-portfolio-sample.md). Every number below was printed by a command and lives in a verdict file under bench/verdicts/ or in the progress log of MANUAL.md; docs/NUMBERS.md indexes them, regenerated by tools/numbers.mjs and never typed. Where the build is short of the vision, this document says so in the same paragraph.

BRAIN is a computational organism, not a model. The distinction is the whole project. A language model exists for the duration of a request: it is handed a prompt, it emits tokens, it forgets. This thing is one process that stays up. It ticks, it remembers what happened at every tick, it predicts what happens next, it simulates before it acts, it acts only through a gate, it rewires itself, and every one of those events is written to an append-only ledger you can replay. The question it was built to ask is his: what becomes possible when thousands of heterogeneous computational processes maintain state, communicate through a dynamic connectome, learn at different timescales, build models of the world, simulate futures, allocate their own resources, and keep reorganizing. So the unit of work is not a token. It is a cell.

The first decision underneath everything is what moves on the wires, because language models fail at exactly the things a wire format decides. Byte-pair tokens fragment digits and lose place value, which is why a frontier model can say 9.11 is bigger than 9.9. BRAIN has one signal shape and seven kinds of payload: a hypervector of 8,192 bipolar lanes for concepts and roles, a sparse distributed representation for cheap overlap-as-similarity, an exact rational number carried as a BigInt numerator and denominator so 9.11 is smaller than 9.9 by construction and a test asserts it, a symbolic expression tree that is evaluated and verified exactly rather than guessed (194 of 194 solvable algebra problems solved and verified, 6 degenerate ones named as such), a dense float vector for small neural cells, an event for control and the outside world, and a phasor vector whose complex-valued binding stores 320 items perfectly where the bipolar one holds 120. Three operations give the hypervectors an algebra: bind, bundle and permute, so a sequence, a role-filler pair or a superposition of concepts is arithmetic, not a lookup. The kernels are hand-assembled WebAssembly SIMD because nothing on this machine compiles wasm text and the rule is zero dependencies: an 8-way bundle runs on 128-lane instructions where a scalar loop ran one lane at a time, and a codebook scan runs 128 lanes per instruction on bit-packed vectors at 64 nanoseconds per item.

The cell is the execution unit and it is a contract, not a neuron simulation. A cell has typed in ports and out ports, a kind, parameters, private state, a policy that says how often it runs (every tick, every 64, every second, minute or hour of organism time, or only when mail arrives), lifetime counters, and a serializer, so it can be inspected on its own and still sit inside a structure of thousands. There are 120 kinds defined across the tree and 87 of them are used by the whole organism: encoders, hypervector algebra, memories, statistics, logic, routing, attention, planning, decision, evaluation, error, reward, sequence and grid hosts, language cells, world actuators and senses, substrate majors that each carry 100,000 sub-units in wasm (four million units tick at 18 ticks per second in one process). Cells form circuits, circuits form the nine regions (perception, association, cognitive, memory, motor, homeostasis, generations, language, world), and the connectome between them is a first-class object held in typed arrays: every edge has a weight, a delay, a usage count and a last-used tick, so an edge can strengthen under a Hebbian rule, go stale, be pruned, or be proposed for growth by a co-activation tracker. At 1,000 majors the organism has 8,072 cells and 91,159 edges, every one of them audited by a strict wiring checker with 0 faults, built in 3,983 ms.

Time is a dimension, not a loop counter. The clock has two axes, ticks and organism time, and a cell's period puts it on one of the timescales, so in a 200 tick bench 1,019 fast cells ran 203,800 times while 318 hour-period cells ran 318 and 5,316 event cells ran 901,631 times only when something reached them. The reflex arc is wired with printed delays: input at perception, encoding in association one tick later, processing in cognitive two later, integration and decision one each, action in motor two later, then the world actuators, then the outcomes come back in as perception. The proof is a trace: an event injected at the input cell became a timer proposal at the world clock at t=64 and the trace walked 94 nodes back to the injected signal. Attention is an economy rather than a mask: the scheduler funds the cells whose inputs changed and whose predictions are uncertain, scoring every 16 ticks, and a port on a slow period keeps only its last few items so a fast producer can never bury a slow consumer.

Memory is distributed and tiered the way the manual asked, not a database bolted to a stateless model. Working memory holds the tick's context; episodic memory is an append-only store of keyed episodes with cold flags and a signature index; semantic memory is an associative tier that cleans a noisy cue up with the modern Hopfield update until it lands in a stored attractor, with every pattern resident once in a WebAssembly arena so that one update over 4,096 patterns costs 5,609 microseconds instead of 33,557 in JavaScript and returns the same vector lane for lane (10 of 10 steps identical), and it consolidates upward from episodes that keep co-occurring; procedural memory holds what worked; sequence memory encodes order by permutation chaining so position is carried by the algebra and read back by a roll in the other direction; and the self tier records the organism's own previous computational activity. A capability layer sits on top: an inducer that searched 308,912 programs to solve 15 of 15 held-out induction tasks, a skill registry that keeps induced programs and reuses them, a router that sends arithmetic, algebra and sequence problems to the cell that can verify the answer, and a synthetic market where a searched policy returned 4.637 on eight held-out seeds against 0.715 for the control and a placebo gap of -0.2023, with the fee charged. That last one is a market with a control arm, not a venue: the world region has HTTP, file, process and clock actuators behind the gate, and no exchange is connected. The brain does not trade anything today, and this document will not pretend otherwise.

Learning is modular because he said the rules should be interchangeable. The learning engine runs a Hebbian rule brain-wide, a prediction-error cell and a reward cell modulate it, and the generations engine treats the whole organism as a genome: MAP-Elites over four behaviour descriptors ran 518 generations of the whole organism in 180.343 seconds at population 12, 6,216 organisms evaluated, the archive still climbing at 211 of 2,401 niches (8.788 percent), and the elites are emitted as source code, 21,153 generated lines, so a winning organism is a file you can read. On the smaller race task the engine ran 380 generations a minute at population 300. The years clock is printed honestly: 192,000 ticks at a declared 0.001 seconds per tick is 6.08e-6 organism-years, so the millions-of-years headline is a declaration about the clock, not a number the build has earned yet.

The spine is a doctrine from his manual: computation is not authority. Nothing structural or external happens except through a gate with nine proposal kinds, three of which always hold for a human whatever the policy says, and every proposal is written to the ledger before it is decided and every decision after it. The world region is the sharp end: an actuator acts only on an approved proposal, the gate re-derives its verdict from the evidence rather than trusting the proposer, a proposal that lies about its evidence is rejected, an empty allowlist denies everything, and a trace walks an outcome back through the act, the proposal, the signal, the cell run and the consumed input. Self-improvement obeys the same doctrine. The self loop observes a scalar panel of the brain, proposes deltas, trials each one on an isolated clone against a matched control clone fed the identical input stream from the identical seed, grades the hypothesis with the brain's own exact arithmetic, and applies survivors only through the gate: 6 rounds, 32 confirmed, 0 refuted, 6 applied, health 0.866608 to 0.873584. That zero is flagged in the log as suspicious, because a self-improver that never refutes itself is not measuring, and a null-delta calibration is the open request. The live soak answered part of it at t=5,000: the first self round on the running organism tried 4 candidates against matched control clones and refuted 1 (a period change that promised cognitive runs 50 percent above control and delivered -0.7522 percent), confirmed 2, left 1 undecided inside the noise band, applied 0, in 59,501 milliseconds. The calibration itself is now a measurement rather than a constant: two arms of the same organism with no delta differ by exactly 0 percent on 180, 90 and 90 metric readings at three sizes, so any gain is the delta; and the spillover of a real delta onto the metrics it did not target has a 95th percentile of 0.8256 percent at 240 cells, 0.4525 percent at 800 and 0.1259 percent at 1,600, falling with size, so the bar every hypothesis must clear and the band that separates a refutation from a tie are that measured curve, not 0.5 percent picked by hand (the old flat floor of 0.1 percent was under the noise at every size, and a flat 0.5 percent at 1,600 cells had turned 2 real effects into ties).

It is a research instrument by construction, which is what the manual asked for and what ISEF judges will actually be able to check. The lab runs an experiment as an isolated region with a control, and reproduces it seed for seed: the predictive learning rule was refuted (it wrote no weight at all, 0 applications against 10,561), phasor memory came back undecided inside the band, and goal routing was confirmed (relevant share 0.41875 against 0.125). Replay is exact: 225 of 225 events reproduced with matching run order and output hashes, and a tampered run was caught at event 21. The cost instrument counted 757 tasks solved at 0.0819 CPU milliseconds per task with 0 external API tokens and 0 network calls, so the price of a thought is a number, not a vibe. And the organism has its own language model, cell-native, trained by local rules only: 2.8443 bits per byte held out against 5.1659 for uniform and 3.6119 for the n-gram baseline, at 12,114 tokens a second, which is small, honest, and entirely inside the brain. Building it found a real defect: co-activation growth had wired the decoder back into perception, feeding itself 120 phantom tokens, so a region seal now stops a decoder from talking to its own eyes.

Speed was measured as a ceiling, not promised. On the emitted organism the end-to-end runtime is 25.703x the naive baseline: 4.731x from a single optimised process and 5.297x more from 32 shards partitioned by label propagation, with 1, 2, 4 and 8 shards proved identical to one process with growth on after two ordering defects were caught. The gap to his 100x is 3.99x and the ceiling was measured rather than guessed: 32 threads would need 66 percent of perfect linear scaling and hold 31.8 percent at zero cut, with the tick budget charged to compute, drain, stragglers, the coordinator and dispatch, so the lever that would close it is named in the notes with its upper bound, 65.54x. In a browser the organism runs 1,200 majors with the tick rate printed on the page as it runs, and that is what dilation.dev serves today. The visualization is a brain, a lateral silhouette with lobes, cerebellum and brainstem, crisp slightly glowing discs, conduits drawn as arcs, every node clickable to its cell and its in-edges with weight, delay and usage, on 12,000 cells and 102,850 edges, with per-hop latency printed in real time rather than animated for effect.

And all of it is proved, on the rule that a number nobody printed does not exist. One command prints one verdict: today the gate is GREEN on 30 test files with 472 assertions, 53,486 authored lines in 221 files, 507,145 generated organism lines in 129 files, zero em-dash files, zero bad imports. Mutation testing killed 44 of 44 mutants in the first pass and 21 of 21 in the mind pass; fuzzing is green; every claim in the architecture document ends with the command that checks it. The soak is where the truth came out. A persistent organism running for hours found thirteen defects that no unit test could see: an outbox that grew 47 signals a tick because nobody drained it, a checkpoint that died on V8's string cap and took the run with it, a zombie holding the brain's name for twelve minutes after its own crash, a status command that read a gigabyte ledger as one string, a sequence codebook that grew by every item the brain ever saw until each scan cost milliseconds, episodic keys as one base64 string that passed the cap, a heap that ran out at t=5,000 with a 2,641,524,189 byte checkpoint due, an episodic tier with no bound at all (176,238 episodes at t=4,000, the bulk of the checkpoint), and a wire format that spent 20,466 characters on a vector that packs into 1,374. Each one is fixed with a test, and the fixes are exact: the answers did not change, only the cost. The restart proved it on the same organism: the last checkpoint on the old code was 11,672,705,288 bytes at t=9,488 and the organism ran at 3 ticks a second; restored on the new code in 313,232 milliseconds with its 1,672 cells and 111,549 edges intact and 0 illegal edges, the next checkpoint was 260,821,829 bytes and it runs at 6 ticks a second, and its next self round confirmed 3 of 4 candidates against matched controls with gains of 0.4409, 0.3388 and 0.5793 percent, all above the measured noise for its size.

Where it stands against his manual, honestly. Aligned and running: orthogonal primitives, cells into circuits into regions, a dynamic connectome with growth and pruning, time as a dimension with five timescales, memory in six tiers, prediction and simulation before action, attention as resource allocation, the gate between computation and authority, a ledger that traces any output to its sources, a lab for controlled experiments, generations over the whole organism, a CLI first and a brain-shaped visualization, a live site, and an ISEF path written in his words. Short of the vision, with the number that says by how much: 5,000 majors in one live process (the bench built 1,000; the soak runs 200 at 3 ticks a second), five million lines (53,486 authored and 507,145 generated today, none of it padding), 100x (25.703x), knowing everything natively (it induces, verifies, routes, remembers and models language at 2.84 bits per byte; it is not a frontier model's library of the world), and trading (a controlled synthetic market, no venue). Surpassing the sample it was given: numbers that cannot be wrong by construction where language models fail at arithmetic, a self-improver that must beat a matched control before the gate lets it change anything, zero external tokens per thought, and replay that is bit-exact.

What it is for. An organism that runs, remembers, predicts, simulates and acts through a gate is a substrate for any task that has a stream coming in and actions going out, which is why he said the trader is done when the brain is done. The first use case he named is the one the build has to earn next: a venue sense and a venue actuator in the world region, a measured fee bar, and the same control-arm grading the lab already applies to everything else, so that "trades memecoins like a god" becomes a printed return against a control rather than a sentence.
# notes/mind.md : requests from the mind (our own LLM)

His words this note answers: "What if we made our own LLM?", "runs AI itself",
"Instead of tokens, qubits are like quantum tokens". The manual: "Language
representations, memory, prediction, simulation, mathematical computation,
symbolic structures, probabilistic inference, and evaluation mechanisms can all
participate in the same computational process."

mind/ is that sentence built as cells. A token is not an integer with an
embedding table trained by gradient descent. A token is a **quantum**: an hv
item in the same signal algebra every other cell already speaks. A sequence is a
bundle of permuted token quanta, so context is one vector, not a growing list.
Prediction is an associative read, addressed by that vector. Learning is one
pass with local rules only. No gradient anywhere in mind/.

## What was built

- `mind/tokenizer.mjs` : bytes plus a learned byte-pair merge vocabulary of our
  own (no external vocab file). Exact round trip. Every token id carries an hv
  quantum from the shared `ItemMemory`, dimension printed by every command.
- `mind/corpus.mjs` : our own text only. `research/*.md`, `notes/*.md`,
  `docs/*.md`, and the comments lifted out of `brain/**/*.mjs`. MANUAL.md is HIS
  and is never training text. Split by file, deterministic, byte counts printed.
- `mind/model.mjs` : five predictors graded on the same held out tokens.
  uniform, unigram, n-gram backoff, hv associative, and the mixture.
- `mind/index.mjs` : four cell kinds (`mind.tokenize`, `mind.context`,
  `mind.assoc`, `mind.decode`) and a region `language` with circuits
  `tokenizer`, `context`, `memory`, `decode`, so a Brain holds the model as
  cells and ticks it.
- `mind/generate.mjs` + `mind/cli.mjs` : sampling with temperature and top k.
- `bench/mind.mjs` writes `bench/verdicts/mind.json`. `test/mind.test.mjs` is in
  the gate.

## Requests to core (none blocking)

1. **A cell kind cannot hold a live object in params.** Same constraint memory/
   hit, same answer: `mind/index.mjs` keeps a registry and cells carry
   `params.model` as a string. If core ever grows a first class "resource"
   binding on cells, mind/ should move to it. Not blocking, and copying the
   memory/ pattern is cheaper than changing core.
2. **Two edges out of one cell arriving together.** `mind.context` emits the
   context hv and the observed token on two ports in the same run, and
   `mind.assoc` needs both in the same run to score a prediction. That works
   today only because both edges carry the same delay. A per cell "emit as one
   frame" would make this structural rather than incidental. Not blocking.
3. **`cell.stats.surprise` has no writer in core.** `runCell` reads it into the
   ledger but nothing sets it. mind/ sets it to the bits of surprise of the last
   observed token, which is exactly the field's name. If another library wants a
   different unit there, core should say which.

## The defect this build found: growth closed the loop

A fixed pipeline whose cells all fire on every tick is the loudest co-activation
signal in a brain. After eight ticks the tracker proposed an edge between the
decoder and the tokenizer, the gate approved it on that evidence (both ports
carry `event`, so `compatiblePorts` matches), and the decoded token was then fed
back into the perception port as though it were text from the world. Measured
before the fix: a 45 byte sentence encoded to 16 tokens, the tokenizer queue
stalled at 4 and never drained, and the memory went on scoring 120 tokens that
nobody ever fed it. Every one of those 120 numbers would have been quotable and
every one would have been false.

Two fixes, both in mind/, neither touching core/:

- **Perception takes input from outside.** `mind.tokenize` ignores an item that
  arrived over an edge (`it.e >= 0`) unless `params.acceptWired` says otherwise,
  and ignores any event carrying neither `text` nor `bytes`.
- **The gate seals the region.** `sealRegion` wraps the brain's policy so a grow
  or replace proposal touching a language cell is refused and everything else
  goes to the policy that was already there. Computation is not authority: this
  pipeline is engineered structure, not discovered structure, and the refusal is
  a ledger event, so the seal is observable rather than invisible.

The general lesson is wider than mind/: any region wired by hand, whose cells
fire together by construction, will be rewired by growth unless something says
no. Co-firing is evidence of a shared clock, not evidence of a useful pathway.

## The measurement, and what it is not

Bits per byte, not bits per token, so a tokenizer that makes longer tokens
cannot buy the number. All five arms are graded on the same held out files,
which no arm saw and which chose nothing. The mixture weights and the one
decoding temperature of the hv arm are chosen on a **dev slice of train**, never
on held out. The uniform arm is the null: a model that has learned nothing pays
log2(V) bits per token.

What this is not: it is not a transformer, it has no attention, and nothing here
claims to reach a transformer's bits per byte. The claim is narrower and
measured: a language model built entirely out of cells in this signal algebra,
trained in one pass with local rules, beats the uniform null by the margin
`bench/mind.mjs` prints, and the hv associative arm carries information that the
n gram arm does not (the mixture is graded to say by how much).
# notes/memory.md

Owner of `memory/*.mjs`, `cells/memory.mjs`, `test/memory.test.mjs`.
Everything below was observed while building those files on 2026-09-16.

## Requests for core (worked around, not blocking)

1. **`signal.mjs bundle(list, weights)` truncates fractional weights.**
   The accumulator is an `Int32Array`, so `acc[i] += v[i] * w` with `w < 1` writes 0. A
   softmax weight vector therefore bundles to nothing. `memory/semantic.mjs` works around
   it by scaling the softmax to integers first (`WEIGHT_SCALE = 1_000_000`, rounded), which
   keeps the accumulator inside Int32 for up to a few thousand patterns. A `Float64Array`
   accumulator, or a documented "weights must be integers" contract, would remove the trap.

2. **`signal.mjs ItemMemory` has no `delete(name)`.**
   Forgetting a concept has to remove its codebook entry as well as its pattern.
   `SemanticMemory._removeSlot` reaches into `items.items` (the underlying Map) to do it.
   An `ItemMemory.delete(name)` method would let that stop being a reach through.

3. **No place on `Brain` for a service object that cells can reach.**
   Cell params are serialized with the cell, so a param cannot hold a live reference. The
   memory cells therefore carry `params.system`, a string, and resolve it through a module
   level registry in `memory/index.mjs` (`registerMemorySystem` / `getMemorySystem`).
   `attachMemory(brain, sys)` also sets `brain.memory` for code that has the brain in hand.
   A `Brain.services` map, keyed by name and restored by name, would formalise this.

4. **`Brain.snapshot()` does not carry the memory system.**
   A full restore needs `MemorySystem.serialize()` written next to `snapshot.json` and
   `MemorySystem.from()` called after `Brain.restore()`. A snapshot hook (a list of
   `{ name, serialize, restore }`) would make the pair atomic.

5. **A throwing cell is invisible outside the ledger.**
   `runCell` catches, increments `cell.stats.errors` and appends a `cell.error` event.
   Nothing surfaces it. This cost real time during development: a `MemorySystem` built with
   `d: 1024` sitting behind `encode.hv`, which always emits `D = 8192`, appended **zero**
   episodes over six rounds and reported success everywhere else. `brain.summary()` naming
   the cells with a nonzero `stats.errors` would have caught it in one line.

## Behaviour the memory tests depend on

- `core/brain.mjs _emit` schedules at `clock.t + 1 + delay`, so a zero delay edge still
  arrives on the next tick. Anything that injects into a memory cell and then reads the
  result needs at least two ticks, which is what `test/memory.test.mjs` does.
- Periodic cells are due at `t = 0` as well as at every multiple of their period, so a cell
  with `period: MIN` has run once before any minute has passed. The slow cell test asserts
  `runs === 1` before ticking and `runs === 2` at `t = MIN + 1`.

## Design decisions worth knowing about

- **Episodic is append only, so forgetting there is cooling, not deletion.** `cool(t)` marks
  every episode older than `t` cold; cold episodes leave similarity retrieval but stay on
  the record and can be read back with `{ includeCold: true }` or revived with `warm(id)`.
- **The episodic index is rebuilt from the seed, never serialized.** `serialize()` writes the
  keys, times, gens, cold flags, values and items; `from()` re-signs and re-buckets. That is
  what guarantees the index cannot drift out of step with the keys.
- **Sequence position is carried by the permutation, not by a stored index.** `encode` is
  `bundle_i permute(item_i, i * stride)` and `decodeAt(hv, i)` is `cleanup(permute(hv, -i))`.
  `recall` returns items decoded back out of the hypervector rather than copied from the
  stored name list, so a match that cannot be decoded reports `exact: false`.
- **A skill is checked for JSON safety when it is defined, not when it is used.** `jsonSafe`
  walks the value instead of trusting `JSON.stringify`, because the encoder silently drops
  functions and `undefined` and turns a typed array into an object of numbered keys.

## Measured, `node --test test/memory.test.mjs`, 2026-09-16

- 12 tests, 12 pass, 0 fail, 1537 ms total.
- Episodic at 100,000 episodes, d = 512: build 345 ms (290 episodes/ms), index query
  **0.857 ms** mean over 200 queries with top1 200/200, exact full scan 32.6 ms mean over 20
  queries, **38x** faster than the scan it is graded against, 5,823 candidates per query of
  which 58 get an exact `sim()`, 3,968 buckets over 16 bands of 8 bits, 100 row time range
  in 0.034 ms.
- Semantic cleanup, d = 2048, 8 concepts, 20 trials per row: 20/20 correct at every noise
  level tried (5%, 15%, 25%, 35% of coordinates flipped, cue similarity 0.900 down to
  0.299), mean 2.00 iterations to converge.
- Sequence memory, d = 8192, 100 sequences of 6 items over a 60 item vocabulary, cue of 3
  items: recall **100/100**, exact decode of all 6 positions **100/100**, next item
  **100/100**, 1.24 ms per recall and prediction pair.
- Consolidation over 34 episodes formed 2 co-occurrence concepts from 12 repeats each, and a
  single decay pass at rate 0.5 with floor 1 forgot exactly the 10 items seen once while the
  concepts survived at strength 6.
- Memory cells inside a brain: 60,001 ticks in 19 ms, the `MIN` period consolidation cell
  fired twice and formed 2 concepts, the `MIN` period forget cell swept 4 working entries and
  cooled 6 episodes.

## 2026-09-17, the cleanup cost: what the two kernel rows are made of

A CPU profile of the live organism named two rows inside `memory/semantic.mjs`: the weighted
accumulation `wacc`, called from `step`, and the dot scan `dots`, called from `_sims`. This
section is what those two rows are made of, what was cut out of them exactly, what was
measured and thrown away, and what the whole organism does with the cut in.

Every number below was printed on 2026-09-17 by one of three commands, and the line that
printed it is written next to it:

    node bench/semantic-cleanup.mjs
    node bench/semantic-cleanup.mjs --live
    node --test test/memory.test.mjs

The verdict is `bench/verdicts/semantic-cleanup.json`, written by the first command at
`2026-09-17T21:35:38.173Z` and carrying the live block the second merged at
`2026-09-17T21:34:57.941Z`. Nothing here is quoted from a profile that is not parsed into
that file.

### What landed, both exact

1. **The dominant weight shortcut.** When one integer weight is larger than all the others
   put together, every lane of the accumulation takes that pattern's sign: `acc[j]` is
   `w_top * p_top[j]` plus a remainder whose magnitude cannot exceed `isum - w_top`, which
   is smaller. So the bundle *is* that pattern and nothing has to be scanned to know it.
   The remainder is only bounded by the weight sum while every lane of every pattern is +1
   or -1, so `SemanticMemory` carries a bipolar flag per pattern (`bip`, `_nonBip`), set on
   the way in, and the shortcut is off while any pattern is not bipolar. The winning lane is
   then never zero, so `bundle()`'s tie rule cannot apply either.
   It is an identity, not a threshold: in the bench the full accumulation returned exactly
   the top pattern on **40/40, 34/34, 23/23 and 1/1** of the steps where the test fired.
2. **Reusing the sims in `recognize`.** A converged cleanup ends on a step whose scored
   sims belong to the state it returns, lane for lane, so `recognize` no longer scans the
   whole population a second time to pick the best match. It reuses them only when the
   cleanup converged, which is exactly when the two states are the same vector.

`SemanticMemory.fast = false` selects the old paths, and `BRAIN_SEMANTIC_FAST=0` in the
environment selects them for a whole process. The exactness test's control, the bench's old
arm and the profiled control run of the live arm all take that path, and the organism never
does.

### Exactness first

`test/memory.test.mjs`, 200 noisy cues at each of 64, 256 and 1024 stored patterns,
d = 8192, comparing `hv` lane for lane and `name`, `sim`, `slot`, `cueSim`,
`iterations` and `converged` against the same memory with `fast = false`:

    exactness n=64, 200 cues: steps 458, accumulations skipped 378, converged 200, sims reused 200, mean nonzero weights 64.0 of 64
    exactness n=256, 200 cues: steps 533, accumulations skipped 312, converged 191, sims reused 191, mean nonzero weights 256.0 of 256
    exactness n=1024, 200 cues: steps 695, accumulations skipped 214, converged 170, sims reused 170, mean nonzero weights 1024.0 of 1024

A second test holds the guard: one lane set to 0 in one stored pattern stops the shortcut
firing (`dominated` does not move), a merge that makes the slot bipolar again turns it back
on, forgetting the pattern clears the flag, and a restore rebuilds one flag per pattern. A
third walks the cleanup instead of stopping it and checks the walk against `cleanup()`:

    walk n=64, 20 cues: converged 20/20, cycles 0/20, iterations walked 44 (mean 2.20), scripted orbit cycleLength 2

Whole file: `ℹ pass 19`, `ℹ fail 0`.

### What it costs per call, `node bench/semantic-cleanup.mjs`

d = 8192, 20 cues per row, 3 interleaved repetitions, old arm and new arm in the same
process, order alternating per repetition:

    n=64  cleanup 0.240 -> 0.072 ms/call   recognize 0.264 -> 0.069 ms/call   (73.8% off recognize)
    n=256  cleanup 0.687 -> 0.326 ms/call   recognize 0.846 -> 0.326 ms/call   (61.5% off recognize)
    n=1024  cleanup 2.968 -> 1.860 ms/call   recognize 3.283 -> 1.904 ms/call   (42.0% off recognize)
    n=4096  cleanup 18.106 -> 17.497 ms/call   recognize 20.798 -> 17.865 ms/call   (14.1% off recognize)

The shortcut's reach is set by the top weight's share, which falls as the population grows,
because the softmax background mass grows with it:

    n=64   mean top share 0.8815, domination 40/40 steps
    n=256  mean top share 0.7352, domination 34/40 steps
    n=1024 mean top share 0.4765, domination 23/43 steps
    n=4096 mean top share 0.2127, domination  1/53 steps

Per iteration it is the last step of a cleanup that dominates, never the first: at n=1024,
`iteration 0: 20 steps, top share 0.2117, dominates 0` and
`iteration 1: 20 steps, top share 0.7323, dominates 20`. That is the shape of the win. The
first step of a cleanup pays the full accumulation and the step that confirms the attractor
does not.

### Measured and thrown away

- **Accumulating only the nonzero weights (candidate a) never runs.** The premise is false:
  after the round to `WEIGHT_SCALE` the weights are **not** mostly zero. Measured over
  every step of the bench, `k == n` on **40/40, 40/40, 43/43 and 53/53** steps, that is
  `nonzero weights 4096.0 of 4096` at the largest row. A weight only rounds to zero below
  5e-7 of the mass, and at beta = 8 the background patterns sit three to four orders of
  magnitude above that. The JS sparse path was priced anyway, so the crossover is on
  record: `n=1024: one wacc over all 1024 slots 0.737 ms; JS over k slots: k=1 0.015 ... k=64 0.691, k=128 1.411`
  and `n=4096: one wacc over all 4096 slots 3.393 ms; ... k=256 2.878`. The JS path wins up
  to k = 64 at n = 1024 and k = 256 at n = 4096 and the measured k is n, so it never runs
  and was not landed. What replaced it is the domination bound, which is the same sparse
  accumulation with k = 1 under a proof rather than under a count of zeros.
- **Comparing the softmax weights of one iteration with the last (candidate c) is not an
  exact convergence test.** Equal weights do imply an equal vector, but the converse fails,
  so it would find the fixed point one iteration after `sim(next, state) === 1` does and
  change `iterations`. It also cannot fire here: with k = n the weights are thousands of
  six digit integers recomputed from a state that moved.
- **Proving convergence a step early saves nothing.** When the shortcut fires the next state
  is a stored pattern, and the top weight's share cannot fall when the state moves onto it
  (the top logit rises by beta * 2h/d and no other logit can rise by more), so the next step
  is provably a fixed point. Skipping that step does not pay, because `recognize` still
  needs the sims of the answer to pick the best match, which is the same scan.
- **A cleanup that runs out of iterations is late, not circling.** `SemanticMemory.walk()`
  takes the same walk `cleanup()` takes without stopping at the fixed point, holds every
  state it passes and compares each new state against all of them, so a repeat is found
  wherever it is. Twelve cues of each of three kinds, at 1024 and at 4096 patterns,
  d = 8192, beta = 8, walked at the organism's `maxIters` of 8 and again at 32:

        n=1024 random     maxIters  8: converged 5/12, cycles 0/12, mean iterations walked 7.75
        n=1024 random     maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 9.17
        n=1024 noisy 0.15 maxIters  8: converged 12/12, cycles 0/12, mean iterations walked 2.42
        n=1024 noisy 0.15 maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 2.42
        n=1024 noisy 0.35 maxIters  8: converged 6/12, cycles 0/12, mean iterations walked 6.50
        n=1024 noisy 0.35 maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 9.58
        n=4096 random     maxIters  8: converged 9/12, cycles 0/12, mean iterations walked 7.33
        n=4096 random     maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 7.92
        n=4096 noisy 0.15 maxIters  8: converged 12/12, cycles 0/12, mean iterations walked 2.58
        n=4096 noisy 0.15 maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 2.58
        n=4096 noisy 0.35 maxIters  8: converged 7/12, cycles 0/12, mean iterations walked 7.50
        n=4096 noisy 0.35 maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 8.58

  Zero cycles in 144 walks, and every one of the 72 walks given 32 iterations converged,
  including the ones that were still moving at 8. So there is no short orbit to detect and
  cut out. What is true is that a cue far from any stored pattern needs more iterations
  than `maxIters` allows, and that a cue near one is done in about two and a half.
- **A batched `dots` kernel would not pay much.** `dots` is one wasm call per slot and
  `wacc` is one call for all of them, so the per call cost was priced by timing the same
  256 slot scan at four widths: `d=1024: dots 0.0622 us/slot` up to
  `d=8192: dots 0.4058 us/slot`, fitted `0.0479 ns per lane plus 0.0131 us per slot that
  does not scale, which is 3.2% of a slot at d=8192`. Batching the calls buys that 3.2%.

### Past 256 patterns (candidate d)

Nothing falls back. The arena is constructed at `min(capacity, 256)` slots but
`RawArena.set` reserves `max(slot + 1, capacity * 2)` when it runs out, so the same wasm
path runs at every population: the bench rows print `arena.count` equal to the pattern count
at 1024 and 4096, and the exactness test asserts it. What does change is the cost per slot,
because the arena is n * 8192 bytes and walks out of cache: dots per slot
`0.417 us` at n=256, `0.453 us` at n=1024, `0.669 us` at n=4096, and wacc per slot
`0.727`, `0.813`, `0.851 us`. The growth the profile saw over a run comes from that.

### The live organism, `node bench/semantic-cleanup.mjs --live`

The bench runs the organism three times under the V8 CPU profiler, new arm, control, new arm
again, on

    BRAIN_STATE_DIR=<dir> node --cpu-prof --cpu-prof-dir <dir> bin/brain.mjs live semantic-cleanup-prof --majors 200 --ticks 800 --checkpoint 100000 --heap 0

and parses the profiles itself into the `live` block of the verdict. The control arm is the
old paths, pinned for the whole child process by `BRAIN_SEMANTIC_FAST=0`, so choosing it
takes no preload and no edit. The state directory and the profiles live in a temporary
directory the bench deletes, which is why the parsed rows and not the `.cpuprofile` files are
the record.

The three runs did the same work, line for line, which is what makes them a matched set:
each printed `800 ticks`, `cells 1672 (start 1672), edges 37991 (start 18553)`,
`runs per period over this run: 1:174400 64:13 SEC:172 MIN:117 HOUR:63 event:774585`, and
the same semantic counters apart from the two this change moves:

    {"learned":6477,"merged":0,"forgotten":0,"dropped":2381,"cleanups":777,"iterations":5773,"concepts":0,"steps":5773,"nonzero":7862832,"dominated":85,"reusedSims":292}
    {"learned":6477, ... same ... ,"dominated":0,"reusedSims":0}   (the control)

What the profiler charged the two kernels, run by run:

    new     sampled 80996.8 ms: wacc 6484.2 ms (2886.7 then 3597.5), dots 5106.7 ms (2214.0 then 2892.7)
    control sampled 45427.4 ms: wacc 6601.6 ms (1465.9 then 5135.7), dots 5646.2 ms (1176.3 then 4469.9)
    new     sampled 47716.9 ms: wacc 6433.7 ms (1441.7 then 4992.0), dots 4952.5 ms (992.8 then 3959.8)

The first run's sampled window is nearly twice the others because the checkpoint write landed
inside it: its top row is `34512.5 ms | writeFileUtf8 :0`, against `4433.9 ms` for the same
row in the third run and no such row in the control. So the totals are not comparable across
that run, and the two rows do not resolve the change in any case:
`same arm, wacc: 50.5 ms apart; dots: 154.1 ms apart` against
`arm to control, wacc: -117.5 ms; dots: -539.5 ms`. Between the two clean runs the kernels
are `wacc 6601.6 against 6433.7` and `dots 5646.2 against 4952.5`, which is the right sign
and still smaller than what one profile can separate.

One sub row does resolve, because it is the one the reused sims deletes. Charging the kernel
samples to the nearest JS caller, the `dots` scan under `recognize` is **661.7 ms** in the
control against **227.9 ms** and **236.1 ms** in the two new runs, `65.55%` and `64.33%` off
that row, and the two new runs agree to 8.2 ms. The `dots` scan under `step`, which this
change does not touch, is `4984.5 ms` in the control against `4878.7 ms` and `4716.5 ms`.

The counters are the honest measure of the rest, because they are counts and not timings.
The semantic memory ends the run at its capacity, 4096 patterns, having held
`7862832/5773 = 1362` patterns per step on average over the run. At that operating point
this change skipped `85/5773 = 1.47%` of the accumulations and
`292/(5773+777) = 292/6550 = 4.46%` of the scans. That is the whole live effect, and it is
below what a single profile can see. The bench rows above are where the win is, and the live
organism is not there: it saturates at 4096 patterns, where the top weight holds 0.2127 of
the mass, and it converges late, `5773/777 = 7.43` iterations per cleanup of a `maxIters` of
8, with `292/777 = 37.58%` of cleanups converging.

For the record, the profile of this organism taken before the change, read back out of
`bench/verdicts/profile-live.json` (written `2026-09-17T18:58:15.990Z`) by the `--live` run,
put the same two rows at `wacc 4714.5 ms` and `dots 3687.6 ms` of `40791.7 ms` sampled. That
is a different organism load and a different sampled window from every run above, so it is a
record of where the rows started, not a comparison.

### Requests for core

5. **A packed arena for bipolar patterns (`core/simd.mjs`).** The semantic arena is
   `n * 8192` bytes, 33.5 MB at 4096 patterns, and the cost per slot grows as it leaves
   cache (dots 0.417 us/slot at n=256 against 0.669 us/slot at n=4096, measured above).
   One bit per lane would be 8x fewer bytes, and the exact dot of two bipolar vectors is
   `n - 2 * popcount(xor)`, which `hpack` and `RawArena.best` already do for the nearest
   neighbour path. `SemanticMemory` knows which patterns are bipolar (`bip`, `_nonBip`) and
   can tell the arena. This is the only lever left on the `dots` row that does not change an
   answer: the softmax needs every sim, so the scan cannot be skipped.
6. **`wacc` costs more per lane than `dots` for one more multiply.** Fitted over four widths
   on 256 slots: `dots 0.0479 ns per lane` against `wacc 0.0843 ns per lane plus 0.0044 us
   per slot`, which is `0.0843 / 0.0479 = 1.76x` the rate. If the weighted accumulation ran
   at the dot's rate the largest row in the live profile would fall by about two fifths.
   Worth a look while the kernels are being rewritten, but it is a kernel question, not a
   `memory/` one.
7. **A batched `dots` is not worth it** (3.2% of a slot at d = 8192, measured above), so
   the JS loop over one wasm call per slot can stay.

## 2026-09-17 later, finishing the landing: the walk, the environment pin, and a live arm that runs itself

A previous session was cut off with this landing in an unfinished state, and the testing
plane found three numbers in this file and in `memory/semantic.mjs` that no command in the
repository printed: a top twelve table from a `.cpuprofile` that was nowhere on disk, a
`cycles` and `mean iterations walked` tally that no code computed, and a comment in
`memory/semantic.mjs` reading `55.5 s of a 117.2 s soak profile`. All three are gone. What
replaced them is code that prints them.

`SemanticMemory.walk(query, opts)` is the cleanup walk kept instead of thrown away. It holds
every state of the walk and compares each new state against all of them, so a repeat of the
state just left is the fixed point `cleanup()` stops on and a repeat of an older one is an
orbit whose length is how far back the repeat is. It answers nothing the organism reads and
`cleanup()` is untouched by it. `test/memory.test.mjs` asserts that on a converging cue the
walk ends where `cleanup()` ends, on the same vector, after the same number of steps, and
that a scripted two step orbit is reported as `cycleLength 2` at `cycleAt 1` after 3
iterations. The bench then walks 144 cues through it, printed above: zero cycles, and every
walk given 32 iterations converges.

`BRAIN_SEMANTIC_FAST=0` in the environment builds every `SemanticMemory` in that process on
the old paths, and an explicit `{ fast: true }` beats it. That is what lets a profiled live
run take the control arm without a preload file, and `test/memory.test.mjs` asserts all four
cases, including that only the exact string `0` turns it off.

`bench/semantic-cleanup.mjs --live` is the live re-profile as a command. It runs the organism
three times at 200 majors and 800 ticks under `--cpu-prof`, parses each `.cpuprofile` itself
(self time per frame, split at the midpoint of the sampled window, with wasm frames and the
`js-to-wasm` trampolines charged to their nearest JS ancestor, which is what separates the
`wacc` row from the `dots` row), and merges the runs, the top twelve by self time, the kernel
rows, the sub rows under `step` and under `recognize`, the counters out of the checkpoint and
the run to run spread into the `live` block of the verdict. The organism's state directory
goes to a temporary directory through `BRAIN_STATE_DIR`, so a profiled run never touches
`brain/state` and leaves nothing behind. A plain `node bench/semantic-cleanup.mjs` carries an
existing `live` block forward rather than overwriting it with nothing.

Measured while finishing: `node --test test/memory.test.mjs` is `ℹ pass 19`, `ℹ fail 0`, up
from 17 by the two tests above. The whole gate line is in the report of this landing.

Requests for core, in the order they cost something:

1. The live arm is three profiled runs and takes minutes, and the checkpoint write can land
   inside the sampled window and double it, as it did in the first run above
   (`34512.5 ms | writeFileUtf8 :0`). A way to stop and start sampling around a phase, or a
   `live` flag that checkpoints outside the profiled window, would make a run comparable to
   another run without a caveat.
2. `bin/brain.mjs live` prints no counter for the memory system, so the semantic counters
   have to be scanned out of `snapshot.json` by regular expression over the file in chunks,
   because the file is hundreds of megabytes and parsing it is not affordable. A one line
   summary of `brain.memory.serialize().semantic.stats` on exit, or a small sidecar file
   next to the snapshot, would delete that scan.
3. Still open from the section above: a packed arena for bipolar patterns is the only
   remaining lever on the `dots` row that does not change an answer.

## The live organism, the top twelve by self time (2026-09-17)

The testing plane flagged a top-twelve-by-self-time table in "The live organism" section
above as unverified: no printed line or verdict field backed it. There is no such table
in that section as written; the paragraph merely describes that `bench/semantic-cleanup.mjs
--live` computes one (`live.runs[i].topSelf`, `bench/semantic-cleanup.mjs:519`) and folds it
into the verdict. This section is that table, read straight out of the verdict already on
disk rather than re-run, since the run that produced it already exists and a fresh run takes
minutes on its own admission two paragraphs up.

Source: `bench/verdicts/semantic-cleanup.json`, `live.runs[2]` (the third of the three
profiled runs, arm `new`, file `CPU.20260917.173409.38924.0.001.cpuprofile`), merged into
the verdict at `live.at = 2026-09-17T21:34:57.941Z` by

    BRAIN_STATE_DIR=<dir> node --cpu-prof --cpu-prof-dir <dir> bin/brain.mjs live semantic-cleanup-prof --majors 200 --ticks 800 --checkpoint 100000 --heap 0

This is the run picked out above as the clean one: its `sampledMs` is `47716.891`, close to
the control's `45427.397`, unlike the first run whose window the checkpoint write doubled.

    selfMs     firstHalf  secondHalf  fn
    6433.7 ms | 1441.7 then 4992.0 | wasm-function[5] b47ebc36:1
    4957.1 ms |  992.8 then 3964.3 | wasm-function[3] b47ebc36:1
    4930.7 ms | 2862.5 then 2068.2 | bundle signal.mjs:65
    4433.9 ms | 2410.2 then 2023.7 | writeFileUtf8 :0
    1598.9 ms |  945.2 then  653.7 | compute basic.mjs:72
    1537.5 ms |    0.0 then 1537.5 | dataToJSON signal.mjs:380
    1471.3 ms |  927.2 then  544.0 | _tick brain.mjs:149
    1385.8 ms | 1143.8 then  242.0 | permute signal.mjs:93
    1351.6 ms |  880.6 then  471.0 | find connectome.mjs:39
    1296.8 ms |  901.2 then  395.7 | hashData signal.mjs:349
    1261.3 ms |  737.3 then  523.9 | _emit brain.mjs:125
    1092.7 ms |  667.3 then  425.4 | append ledger.mjs:28

`wasm-function[5]` and `wasm-function[3]` are the `wacc` and `dots` kernel rows already
named in the section above (`wacc simd.mjs:311`, `dots simd.mjs:304`); this table just shows
where they sit against everything else the profiler sampled in this run, unrenamed, exactly
as `bench/semantic-cleanup.mjs` prints and stores them. `bundle signal.mjs:65` sits third,
above the checkpoint write in this run and above the two kernels in the control run's own
table (not reproduced here; same fields, in `live.runs[1]`), which is the same rank it holds
in the profile named in the requests-for-core section above (request 6, "the largest row in
the live profile"). Nothing above this line was recomputed; every millisecond is copied from
`live.runs[2].topSelf` in the verdict named at the top of this section.
# notes/whole.md: what assembling THE WHOLE BRAIN asked of the core

Everything below was met while writing seeds/whole.mjs, daemon/run.mjs and test/whole.test.mjs.
Each item names the file that owns the fix. Numbers are the ones the commands printed.

## Requests to core/

1. **Mailboxes have no cap** (core/brain.mjs `_deliver` pushes, nothing ever trims). A cell on a
   SEC, MIN or HOUR period fed by a period 1 source hoards every arrival until its period comes
   due, and `snapshot()` serializes every held item. Measured on an 8 major whole with the ledger
   off: 11,534 mailbox items at t=500 growing to 50,894 at t=4000 while the tick rate fell from
   129/s to 86/s; a MIN+1 run of the same brain in test (g) took 13,849,086 ms last night and
   held bench/gate.mjs past its 600 s cap. At 1000 majors a cap of 256 per port still held
   359,356 mailbox items (736 MB of typed array payload) after 100 ticks, next to 214,351 items
   in flight (468 MB) that belong to the organism's own delays. seeds/whole.mjs now trims ports
   on SEC and slower periods to their last 32 items from an afterTick hook (mail holds at 323 to
   352 items over the same 4000 ticks on the 8 major whole); the world clock on period 64 is
   left alone, because a cap of 32 there dropped an armed reflex timer before its due tick and
   test (b) went red. Request: a per-port cap in the core (`policy.mailCap`, drop oldest) so the
   organism itself stays bounded, and a snapshot that stores at most that many items per port.

2. **A Brain restored from a snapshot forgets its kinds.** `Brain.restore` needs every kind
   registered before it runs, and cli/state.mjs `loadBrain` imports only cells/basic.mjs, so
   `brain status whole` against a snapshot that carries substrate, phv.*, memory.*, mind.*,
   world.* and solve cells throws on the first unknown kind unless the daemon is live and the
   command attaches to the control plane. Request: a `kinds` manifest in the snapshot (the module
   that defines each kind) that loadBrain imports before restoring, or a `cells/all.mjs` barrel
   that cli/state.mjs imports.

3. **`growth` accepts no `false`.** `new Brain({ growth: null })` throws inside CoActivation
   (`Cannot read properties of null (reading 'window')`); the only off switch is
   `{ enabled: false }`. Request: treat `growth: false | null` as disabled.

## Requests to other subsystems (their owners' files)

4. **mind/model.mjs: MindModel has no serialize.** The tokenizer does, the model does not, so
   restoreWhole retrains the model from the training text stored in the snapshot extras
   (`whole.mind.text`, 40,000 bytes by default). Measured: training 20,000 bytes took 1,485 ms
   at build. Request: `MindModel.serialize()` / `MindModel.from(j)`.

5. **world/index.mjs: attachWorld's own actuator edges are illegal under the strict rule.**
   `w.http.out` carries [event, sym, vec] and attachWorld connects it to `w.percept.in` [event]
   through Brain.connect (the weaker "some kind can meet" rule), which genome/wire.mjs
   `portPairs` and seeds/organism.mjs `auditWiring` count as a fault. buildWhole therefore calls
   attachWorld with `actuators: false`, adds the four actuators itself, and routes `w.http.out`
   through an ANY port inbox (`w.inbox`, kind memory.working) whose event `top` feeds the border.
   Request: an ANY port on world.relay, or a single kind event `out` on world.http with the
   sym/vec payload inside the event.

6. **simulate/attention.mjs scores every pending signal in scope every tick.** Measured on a
   168 cell whole: 633 ms of a 1,063 ms 100 tick run (6.3 ms per tick) before anything else.
   seeds/whole.mjs runs the hook every 16 ticks (`ATTENTION_EVERY`), which lifted the same brain
   from 43 to 146 ticks/s. Request: an `every` option on attachAttention, and a working memory
   similarity that skips cells whose mailbox is empty.

7. **cells/perception.mjs encode.time costs 2 to 3 ms per run.** Measured per run inside the
   whole: first runs 2.15, 1.98, 1.96 ms, later runs 2.87, 2.93, 3.25 ms, 108 runs in 120 ticks
   for one event period cell (pe.0000.4). It is the single most expensive kind in the organism
   (277 ms of a 446 ms 100 tick run with the attention hook removed). Request: cache the level hypervectors it
   rebuilds, or give it a numeric period.

8. **cells/control.mjs event.filter has no pass-all mode.** With `values: null` it passes only
   when `data[field] === value`, and with both unset every event lacking the field passes, so
   an organism filter is either a wall or a hole. Not needed for the whole; noted because the
   world border relies on event only ports and event.filter is the commonest motor source.

9. **simulate/world.mjs worlds are closures.** defineWorld keeps functions, so the whole's
   `whole.line` world is defined at module load of seeds/whole.mjs and referenced by name from
   the sim.plan cell's params; a snapshot cannot carry a world. Fine for now, recorded.

10. **generations/organism-genome.mjs patches REGIONS in place**, so the daemon runs epochs in
    a worker thread (daemon/generations-worker.mjs) rather than in its own module instance.
    seeds/whole.mjs copies the same try/finally pattern to add the seq.fit and grid.* hosts to
    the rosters for the duration of one build. test/web.test.mjs (roster parity) passed 11/11
    after the change.

11. **Growth alone makes the rate drift.** On the 8 major whole with mail bounded, edges stayed
    at 1,206 from t=500 to t=4000 and the rate still fell 129/s to 97/s with growth enabled;
    with growth disabled the same run held 212/s to 213/s at 548 edges. The co-activation
    tracker (core/connectome.mjs CoActivation) is the remaining cost that rises with time.

## What the whole brain measured about itself

- node bench/whole.mjs (1000 majors, 100,000 units per region, ledger off, the shipped code):
  8,072 cells, 91,159 edges, 0 illegal, 87 kinds; build 3,983 ms; 200 ticks in 54,930 ms,
  3.64 ticks/s, 20,156 runs/s, 13,030 signals/s, 118,823 deliveries/s; rss 471 MB after build
  and 1,295.9 MB after the 200 ticks (arrayBuffers 654.8 MB). The same bench with a mailbox
  cap of 256 ran 200 ticks in 60,650 ms at 3.30 ticks/s with rss 1,615.1 MB after the ticks.
- Build at 16 majors, 256 units per region: 200 cells, 1,296 edges, 0 illegal (strict audit
  over every edge), 9 regions, 86 kinds, 15 skill cells.
- Reflex arc: an event injected at arc.input reached w.clock as a clock.timer proposal at t=64
  (the clock actuator's period) and world.trace walked 94 nodes back to the injected signal.
- `brain live whole --ticks 200 --majors 12 --units 256`: built at t=0, stopped at t=200, 168
  cells, 900 edges at start and 1,565 at the end (growth), 2 checkpoints; the second run with
  `--ticks 100` resumed at t=200 with 168 cells and 1,565 edges and stopped at t=300.
- node --test test/whole.test.mjs: 9 pass, 0 fail, duration_ms 43,890, exit 0 after 44,004 ms wall,
  exits on its own (the earlier green run before the daemon and cap changes: 48,431 ms wall).
- `brain live whole --ticks 400 --majors 12 --units 256 --self-every 150 --gen-every 200`: self
  round 1 done at t=151 (4 candidates, 4 confirmed, 1 applied, 1,052 ms), round 2 at t=301
  (915 ms); generation 1 best og-r1 fitness 0.388331; genome.promote approved for memory, gain
  0.07361033333333333, retimed 24, relearned 8, redelayed 123; t=400, 92 ticks/s, edges 900 to
  1,581, 2 checkpoints, exit 0 in 9,861 ms wall. Before the daemon parked the runner from the
  tick hook, the same run put round 1 at t=300: the runner's setImmediate continuation runs
  in the check phase before the orchestrator's timer, so a wide chunk lands a round one chunk
  late. With a loop on the runner now ticks one tick per chunk.
- The self daemon on the 168 cell whole confirmed conduit.prune candidates with negative gain
  on self.staleRate (treated 0.4715654952076677 vs control 0.47859424920127797, printed as
  -1.4686%) and applied one per round; whether a lower stale rate is the intended direction
  of that metric belongs to self/ (its owner), recorded here as seen.
