# P1 SYNTHESIS (2026-09-16). Every mechanism below is sourced to batch-1.md by number or declared an invention.

The question his manual asks: can intelligence be engineered as an emergent property of a persistent, interconnected computational system rather than one model. What the sources say, reduced to what we build:

1. A whole real brain already runs on one consumer GPU at 5 kHz with plasticity on every synapse (fly, 03). Scale is not the blocker on this machine. The blocker is that nothing above spikes exists in that code: no typed cells, no generations, no memory tiers, no authority. That gap is this project.
2. Every serious brain framework converges on ONE repeating unit type plus ONE messaging protocol (Monty CMP 07, Hyperon Atomspace 08, GWT broadcast 21). His cell with standardized interfaces is that. Heterogeneous internals behind one contract is what lets 5,000 nodes stay coherent.
3. Time as update frequency per component is published and beats the transformer family on long context (Nested Learning, 06). So every cell carries a period. Memory is a spectrum of periods, not two boxes.
4. Generations without collapse = population + speciation + innovation history (NEAT, 10) + an archive sampled as parents (DGM, 04) + an evaluator that gates what is kept (AlphaEvolve DB, 05). Tensorised, a population evaluates in parallel (TensorNEAT up to 500x, 10). "Millions of years in five minutes" is episodes per wall second, printed by a bench.
5. What LLMs get wrong is the unit of representation: digits fragmented by BPE (11). The fixes work only from scratch (11), which we are. So a number is a typed exact quantity, algebra is a symbolic cell plus a verifier (12), and meaning is a composable state (hypervector 13, SDR 24, tensor composition 18). That is the concrete reading of tokens to quanta.
6. Learning on the fly in unfamiliar environments is the measured gap of every frontier model (ARC-AGI-3, 23). It is what a persistent brain with local learning rules does natively. Candidate external yardstick.
7. Creativity is variety across a population, not novelty of one output (25). A generations engine has it natively.
8. Resource allocation is an economy: bids, budgets, broadcast of winners (Hyperon ECAN 08, GWT 21); event-driven sparsity is where efficiency comes from (Loihi 09).
9. Internal simulation is prediction in latent state, never rendering (world models, 20).
10. The projects that never shipped had a substrate and no improvement loop (Hyperon, 08). The projects that shipped fast were wrappers with no substrate (Hermes 01, OpenClaw 02). Build both, substrate and loop, from day one.
11. A brain can be grown from a seed by local rules and repair itself (NCA, 14); a genome far smaller than the connectome can generate it (genomic bottleneck, batch-1 tail). Growth is a program, not a file.
12. ISEF: research done from Sep 2026 is inside the window for ISEF 2027; a demonstration is not appropriate, a measured research question is (16). The question is item 1, measured.

Runtime decision (measured on this machine, not preferred): Node 24, 32 logical CPUs, one 12 GB GPU, no Rust, no Python. The organism layer (cells, connectome, scheduler, ledger, CLI, viz) is systems software and runs on Node with worker threads and shared typed arrays, zero dependencies (his "make your own systems"). Numeric hot loops get a backend interface: CPU typed arrays today, GPU when a bench prints that it pays. The own-LLM phase will need a tensor stack (PyTorch on the 4070 Ti, or ours); not today.

Inventions (not found in any source, declared ours): the Signal as a typed quantum (hv, sdr, num, sym, vec, event) as the single wire format; the two-axis clock (wall ticks and generation ticks); the Proposal gate separating computation from authority for structural change; the trace-back ledger that names the cells, edges, memories and predictions behind any output.
