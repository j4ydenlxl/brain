# BRAIN DESIGN (P2). His WHAT (MANUAL.md §A) mapped to my HOW. Source numbers refer to research/batch-1.md.

## 0. Shape
One process is one brain. Node 24 ESM, zero dependencies. Worker threads over 32 CPUs sharing typed arrays; a compute backend interface (cpu now, gpu slot). Everything persistent under `brain/state/<name>/`. Everything observable through an append-only ledger. CLI first, viz served by the CLI, chatbot structure later.

## 1. Signal, the quantum (tokens to quanta)
`{ kind, data, t, gen, src, port, seq }`. Kinds:
- `hv` hypervector Int8Array (D = 8192) with bind, bundle, permute, sim (13, 24). Concepts, roles, sequences.
- `sdr` sparse active indices over N (24). Cheap wire format.
- `num` exact typed quantity: BigInt rationals, never text (11).
- `sym` expression tree for algebra, run and verified by symbolic cells (12).
- `vec` Float32Array dense activation (NN cells).
- `event` structured object (external I/O, control).
A cell declares the kinds each port accepts. Mismatch is refused at wiring time, never at run time.

## 2. Cell
`{ id, idx, kind, region, circuit, ports, params, policy, state, memory, stats, mailbox }`
- `policy = { period: ticks | 'event', priority, budget, backend, learn }` (period from 06).
- `kind` is a registered type with `compute(ins, cell, ctx)`, optional `learn`, `predict`, `serialize`, `deserialize`.
- Cells are built from primitives (section 3). State is serializable.
- Every run appends `{ t, cell, in, out, cost }` to the ledger with the seqs of consumed signals, so provenance is exact.

## 3. Orthogonal primitives (small vocabulary)
transform, predict, compare, retrieve, remember, route, aggregate, integrate, evaluate, simulate, bind, bundle, permute, count, verify, gate. Each is a pure function with a manifest (in kinds, out kinds, cost) in `core/primitives.mjs`.

## 4. Circuit, region, brain
Circuit = named set of cells + working memory ring + a period. Region = set of circuits + a budget + a broadcast bus. Brain = regions + connectome + clock + ledger + gate. Seed regions: perception, association, cognitive, motor (his image), plus memory and generations as service regions.

## 5. Connectome (first class)
Typed-array edge store: `src, dst, srcPort, dstPort, w, delay, usage, lastT, conf, flags`. Indexed by src (propagation) and by dst (trace). Ops: strengthen and weaken (hebbian dW = eta r_i r_j minus alpha W, 03), prune (w under floor and unused K ticks), grow (co-activation candidates, NCA-style local rule 14, and generations), replace. Grow, prune and replace are Proposals (section 10); every op is a ledger event.

## 6. Clock (time is fundamental)
Two axes. Wall ticks: base tick 1 ms logical; a tick wheel runs each cell whose period divides t; periods span ms to hours (consolidation cells run at minutes or hours). Generation ticks: the generations engine advances `gen` independently, many episodes per wall second. Both stamp every signal.

## 7. Multi-scale
The same event is a signal (cell), a bundle (circuit), a representation (region), a concept (attractor in semantic memory). Aggregation cells at each level, each with its own period. Nothing is forced to full resolution.

## 8. Memory tiers (distributed)
working (ring per circuit, seconds); episodic (ledger-backed, hv keys); semantic (associative hv memory with cleanup, 13); procedural (stored circuits = skills); sequence (permute-chained hv); associative (bound pairs); self (activity statistics). Consolidation: slow cells bundle frequent items upward; decay compresses downward.

## 9. Learning (distributed, interoperable)
Named rules a cell policy selects: hebbian, delta, reinforcement, predictive (surprise), structural, evolutionary. Rules communicate only through signals and the ledger.

## 10. Prediction, simulation, attention, authority
- Predictor cells hold hypotheses; observation produces an error signal (surprise) that drives learning and budget.
- Simulator cell: copy-on-write clone of a subgraph, k candidate trajectories through predictor cells, ranked outcomes back (20).
- Attention economy: per-region budget per tick; cells bid priority x (1 + surprise) x relevance; winners run and broadcast; the rest sleep (08, 21, 09).
- Gate: every structural change, learning-rule change and external action is a Proposal `{ kind, what, why, evidence, by }`; policy decides (tests, budget, allowlist, human-required classes); every decision is logged. Computation is not authority (04).

## 11. Generations engine (time x amount x scale x cells)
Genome = cell params + circuit topology with innovation numbers (10). Population with speciation; archive sampled as parents (04); fitness from evaluator cells on tasks run across worker threads, later GPU. The bench prints genomes per second and episodes per second.

## 12. Observability
Ledger (JSONL now, binary later): every cell run, edge op, proposal, decision. `trace <seq>` walks upstream through consumed signals, edges and memories to name what contributed. Pause, step, snapshot, replay, diff between snapshots.

## 13. CLI (`node brain/bin/brain.mjs`)
init, run, tick, inspect, trace, propose, approve, grow, evolve, bench, snapshot, replay, viz.

## 14. Viz
Served page: WebGL point cloud of cells by region, edges, live activity via SSE from the ledger, generation counter. His image's aesthetic: dark, glowing, animated.

## 15. Not today
Own LLM region (needs a tensor stack), GPU backend (after a bench prints the need), chatbot surface.
