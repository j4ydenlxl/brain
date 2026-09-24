# Research batch 1 (2026-09-16). Solo, no subagents. Format per source: what · take · reject. Numbers only as the source printed them.

## 01 Hermes Agent (Nous Research) MIT, github.com/NousResearch/hermes-agent (README + architecture page read)
What: self-hosted LLM agent. "Closed learning loop": creates skills from experience, improves them in use, nudges itself to persist memory, FTS5 over past sessions, user model (Honcho). Profiles = independent agents (config.yaml, SOUL.md, SQLite memory, gateway, cron). 70+ tools / 28 toolsets, 7 terminal backends, subagents, RPC scripts. Batch trajectory generation "for training the next generation of tool-calling models". Architecture: entry points → AIAgent loop (prompt builder, provider resolution, tool dispatch) → SQLite+FTS5 sessions, tool backends. ~25,000 tests across ~1,250 files. Memory providers and context engines are single-select plugins.
Take: skills as PROCEDURAL memory the system writes for itself; the trajectory→training loop (they log runs to train the next model: that is generations); one gateway fronting many surfaces; pluggable memory provider / context engine ABCs; the test count as a rigor bar.
Reject: every step is an API call to a frozen LLM; "learning" is text files, weights never change; no cells, no connectome, no time dimension. It is the wrapper he does not want.

## 02 OpenClaw, github.com/openclaw/openclaw (raw README 429; search-level; docs pending)
What: local-first agent (Peter Steinberger), 50+ integrations, runs on the user's hardware, 501(c)(3) foundation. Hermes ships `hermes claw migrate`, so the two share a shape. OpenClaw-RL (Gen-Verse) "train any agent by talking".
Take: gateway/channel pattern; local-first; SOUL.md identity files (162 templates exist).
Reject: same as Hermes. Check the docs for self-training before closing.

## 03 Embodied whole-brain fly (Rojas Aliaga 2026) MIT, github.com/rjo6615/fly-brain-interactive, doi 10.5281/zenodo.19152238 (README read)
What: FlyWire v783, 138,639 LIF neurons, 15,091,983 weighted directed synapses, 0.2 ms step (5 kHz), PyTorch sparse on one CUDA GPU; body NeuroMechFly v2 / MuJoCo (87 joints). Hebbian on ALL synapses: dW = eta*(r_i*r_j) - alpha*W, eta 1e-4, alpha 1e-7. Two flies from identical connectomes diverge after 24 h (81% vs 47% escape, 76,034 divergent synapses). ~11,500 lines Python, 20 modules; Brian2CUDA and NEST-GPU backends plus benchmark.py.
Take: existence proof that a whole real brain runs on one consumer GPU at 5 kHz with plasticity; brain-body bridge (descending-neuron rates → mode → torques); real-time brain monitor; synapse sign from neurotransmitter type; the three-backend benchmark. A whole fly = 11.5k lines is a size reference.
Reject: LIF is not our cell (his cell holds NN / state machine / retrieval / algorithm); Hebbian-only; no generations; nothing above spikes.
Related: arXiv 2508.16792 (Sandia): full FlyWire connectome, "140K neurons and 50M synapses", fits on 12 Loihi 2 chips, "orders of magnitude faster than numerical simulations", advantage grows with sparser activity.

## 04 Darwin Gödel Machine (Sakana/UBC, ICLR 2026) Apache-2, github.com/jennyzzt/dgm, arXiv 2505.22954 (README read)
What: agent rewrites its own code; each change validated on SWE-bench/Polyglot; keeps an ARCHIVE of agents (open-ended), samples parents from it. Snippet: SWE-bench 20.0%→50.0%, Polyglot 14.2%→30.7%. Runs generated code in Docker.
Take: archive-based open-ended search (parents from the whole archive) = generations without collapse; empirical gate before a change is kept = his computation-vs-authority split; the loop is one file (DGM_outer.py).
Reject: what improves is scaffolding around a frozen LLM; API cost per child; coding-only.

## 05 AlphaEvolve / OpenEvolve / CodeEvolve (search-level)
AlphaEvolve (arXiv 2506.13131): LLM proposes edits, evaluator scores, evolutionary DB (islands, MAP-Elites style). OpenEvolve = open reimplementation. CodeEvolve (arXiv 2510.14150): LLM + GA, "matches or surpasses AlphaEvolve on 5 of 9, beats OpenEvolve and ShinkaEvolve on 6 of 9".
Take: evolutionary database (islands, quality-diversity, elite sampling) as the generations engine; evaluator-first. Read OpenEvolve's DB before P2.
Reject: LLM per mutation is token-heavy; not the brain.

## 06 Nested Learning / Hope / Titans (Google, NeurIPS 2025; blog read)
What: a model = nested optimisation problems each with its own context flow and UPDATE FREQUENCY; architecture and optimiser are the same thing at different levels; Continuum Memory System = spectrum of modules updating at different rates; Hope = self-modifying Titans + CMS, "unbounded levels of in-context learning", lower perplexity than Titans/Samba/Transformer, better NIAH long-context (blog, no numbers).
Take: his "time as a fundamental dimension" published: every component gets an update period; memory is a frequency spectrum, not short/long. Update period becomes a cell parameter. Surprise (local error) prioritises what is stored.
Reject: still one sequence model; no connectome; no structural change.

## 07 Thousand Brains / Monty (independent non-profit, Gates-funded; MIT), github.com/thousandbrainsproject/tbp.monty (docs index read)
What: sensorimotor framework; repeating unit = Learning Module (cortical column) with reference frames and object models; Sensor Modules; Cortical Messaging Protocol between LMs; LMs vote; heterarchy of LMs; motor system/policy. Roadmap lists GPU support as future work (CPU today). Paper: Neural Computation 38(6) 845-896 (2026).
Take: one repeating unit type that scales by copying; a MESSAGING PROTOCOL between units as the contract; voting as consensus; sensorimotor loop (action is part of perception).
Reject: object recognition focus; CPU-bound Python; no language.

## 08 OpenCog Hyperon (arXiv 2310.18318; pre-alpha; search-level)
What: Atomspace metagraph, MeTTa rewriting, PRIMUS model (working/declarative/procedural memory, ECAN attention economy, goal-driven cycle); LLMs/provers/evolutionary learners as lobes; MeTTaCycle fabric.
Take: attention ECONOMY (resource allocation as currency); heterogeneous lobes on one substrate; the hub is the graph.
Reject: 15+ years, pre-alpha; symbolic-heavy. Lesson: a substrate with no improvement loop never ships.

## 09 Neuromorphic / SNN (search-level)
Loihi 2 co-designed continual learning (arXiv 2511.01553): "113x lower latency, 6,600x lower energy than edge-GPU". Hala Point 1.15 B neurons / 1,152 Loihi 2 (Sandia, Apr 2024). NorthPole 22x over GPU on ResNet-50. No commercial product. GPU SNN: GeNN/Brian2GeNN "tens to hundreds of times faster than CPU", Brian2CUDA, NEST-GPU, snnTorch.
Take: sparsity + event-driven is the efficiency he asks for; on the 4070 Ti the analogue is event-driven sparse updates (only cells whose inputs changed run).
Reject: we own no neuromorphic chip.

## 10 Generations engines (search-level)
MarI/O (SethBling 2015): NEAT, fitness = distance right, 34 generations to finish the level; MariFlow = RNN for Mario Kart. NEAT (Stanley 2002): grow topology from minimal, speciation protects innovation, innovation numbers align crossover. GPU: TensorNEAT (ACM TELO 2025, arXiv 2504.08339) "up to 500x over NEAT-Python"; EvoJAX (arXiv 2202.05008) minutes vs hours/days; evosax.
Take: population + fitness + speciation + innovation history, tensorised on the GPU = "millions of years in five minutes" with printed numbers; DGM archive + NEAT speciation together prevent collapse.
Reject: scalar fitness; NEAT genomes are tiny; our cells are heterogeneous so genome ≠ weights only.

## 11 What LLMs get wrong: numbers (search + arXiv 2608.13129 intro read)
BPE fragments digits, place value lost. Survey (Ni 2026) Numerical Grounding Framework: Representational Grounding (numeral → value/magnitude) and Procedural Grounding (executing arithmetic faithfully); root causes: BPE tokenization, positional encoding, embedding discontinuity, data distribution; four failure classes: fragility, tokenization artifacts, length generalisation, algorithmic asymmetry; frontier models still assert 9.11 > 9.9. Fixes that work only when training FROM SCRATCH: little-endian, Abacus embeddings (20-digit → 100-digit with recurrence); FoNE (arXiv 2502.09741), xVal, BitTokens, AOE (arXiv 2606.14108).
Take: the unit of representation decides what can be computed exactly. A number must be a typed quantity, not text; algebra = symbolic cell (CAS) + verifier, not next-token. For numbers "tokens → quanta" is literally: do not tokenise. Because we train from scratch, the from-scratch fixes are available to us and not to the incumbents.

## 12 AI proving open theorems (search-level)
AlphaProof Nexus (DeepMind, arXiv 2605.22763, May 2026): LLM proposes, Lean checks; "9 of 353 open Erdős problems, 44 of 492 OEIS conjectures", a few hundred dollars each.
Take: his RIGOR = propose → formal verifier → keep/reject at scale. A verifier cell is a primitive; generations of proposals graded by a checker.

## 13 Hyperdimensional computing / VSA (search-level)
Kleyko et al. surveys (ACM CSUR; arXiv 2111.06077). Bind, bundle (superpose), permute on ~10k-dim vectors; analogical and abductive reasoning (arXiv 2401.16024); Hyperdimensional Probe decodes LLM states via VSA (arXiv 2509.25045, probing@1 87%); torchhd library exists.
Take: strongest classical candidate for QUANTA: a hypervector is a superposition (bundle) of symbols, composable, noise-robust, one-shot learnable, cheap. Read torchhd + survey Part I.
Reject: capacity limits; complements learned features, does not replace them.

## 14 Neural cellular automata (search-level)
Growing NCA (Mordvintsev, Distill 2020): one seed cell + local rule grows a target and regenerates after damage. 2026: structured fluctuations are functional for self-repair (Entropy 28(8):893); EngramNCA (arXiv 2504.11855); conditional morphogenesis (arXiv 2512.08360); goal-guided NCA (2205.06806).
Take: GROWTH is learnable: circuits grown from a seed under local rules, self-repairing. This is "growth actualization simulation" with code.

## 15 Liquid / CfC (search-level)
19 liquid neurons steered a car; CfC removed the ODE solver; exact closed-form cells (IEEE 2025); Liquid AI ships foundation models on it.
Take: tiny continuous-time cells with a time constant = a cell type; time constant is a parameter (multi-timescale).

## 16 ISEF (search-level; rules page pending)
Qualify via affiliated fair; grades 9-12; under 21 on May 1. ≤ 12 months continuous research, not before January of the prior year (ISEF 2027: not before Jan 2026, so a Sep 2026 start is inside). Teams ≤ 3. ISEF 2026 Phoenix May 9-15, 1,700+ finalists, 67 countries, $7M+. Category SOFT.
Take: date the research log from today; research question + measurement, not a product; live demo judged. Pull SOFT 2026 finalists (isef.net/viewAll?category=SOFT) to set the bar.

## 17 Own LLM on one GPU (search-level)
modded-nanogpt: GPT-2 124M to 3.28 val loss, record "1.918 minutes" on 8xH100; single RTX 4090 reaches 3.25 in 90 minutes (Deveraux-Parker). Tricks: Muon, RoPE, value embeddings, FP8 head, flex attention, QK-norm, ReLU², lr cooldown. 4070 Ti (12 GB) guides: small models from scratch are realistic; GPT-2 124M ~97 GPU-hours unoptimised on one GPU (WhiteFiber snippet).
Take: a 124M-class language REGION trained overnight on our card is realistic; later trained on the brain's own ledger. Tokenizer decision stays open (see 11, 13, 18).

## 18 Quantum NLP / "quanta" (search-level)
lambeq (Quantinuum): sentence → DisCoCat string diagram → tensor network or quantum circuit; meaning composed by grammar. Trapped-ion QNLP (arXiv 2409.08777). Review arXiv 2504.09909.
Take: meaning as tensor contraction over grammar (words = states, grammar = wiring). With 13, the strongest concrete reading of "tokens → quanta": a quantum of meaning is a composable state, not a subword id. Tensor-network simulation is classical and runs on our GPU.
Reject: toy vocabularies.

## 19 State of Brain Emulation Report 2025 (arXiv 2510.15745, abstract)
Three capabilities: recording dynamics, connectomics, emulation + embodiment. Read the emulation chapter for what is unsolved (learning rules, plasticity, neuromodulation) before claiming "10000x better".

## 20 World models (search-level)
Two camps: compress-to-understand (JEPA, Dreamer: predict abstract outcomes, plan by latent imagination) vs render-to-predict (Sora, Genie). V-JEPA 2: 1M hours video, 62 h robot data, ~80% zero-shot manipulation. Capability audit arXiv 2608.23070.
Take: internal simulation = predict in LATENT space, never pixels; Dreamer-style imagined rollouts are his "candidate trajectories propagated through internal models".

## 21 Global Workspace implementations (search-level)
"Theater of Mind" GWA (arXiv 2604.08206, Apr 2026): stage (limited working memory), spotlight (selection), audience (parallel specialists), explicit broadcast. LIDA; ASAC attention schema (arXiv 2509.16058); selection-broadcast cycle for real-time worlds (PMC12657164).
Take: selection → broadcast → competition is the routing primitive for "thousands of components cannot all run at max".

## 22 Runtime substrate (search-level)
BEAM: lightweight isolated processes, supervision trees, hot code; Rust: tokio + Ractor/Actix (shared-nothing per core); Spawned (Erlang-style actors for Rust). wgpu: one Rust GPU API over Vulkan/Metal/DX12/GL/WebGPU, WGSL compute, boids with thousands of agents demoed; 3D cellular automata in wgpu exists.
Take: cells as actors with mailboxes + supervision is the observability/fault-isolation he lists; numeric hot loops belong on the GPU (CUDA via PyTorch or wgpu compute). Decision deferred to P2 with a measured micro-benchmark, not a preference.

## 23 ARC-AGI-3 (search-level)
Interactive reasoning benchmark (Mar 2026): frontier LLMs "<1%" at launch, humans solve all; by Sep 2026 GPT-6 Astra 62.7%, Claude Opus 5 30.2% (BenchLM). "Learning on the fly inside unfamiliar environments" is where models are weakest; scale did not buy it.
Take: the benchmark that measures exactly what his brain is for (learn while acting). Candidate external yardstick for ISEF.

## 24 SDR / HTM (search-level)
Sparse distributed representations (Ahmad & Hawkins arXiv 1503.07469): high-dim binary, ~2% active, overlap = similarity, noise-robust, union capacity. HTM learns continuously from streams. 2026: distributed HTM with shared associative memory (arXiv 2606.31789).
Take: sparse binary states as the wire format between cells (cheap to route, cheap to compare, unions carry superposition). Pairs with 13.

## 25 Creativity / slop (search-level)
LLM outputs less novel across n-gram, psychometric and creativity-theoretic measures; converge on a narrow style; human stories carry more cultural nuance, emotional ambiguity, unexpected twists (StoryScope arXiv 2604.03136; TechXplore Mar 2026). CreBench (arXiv 2511.13626). "Death of the Novel(ty)" (arXiv 2509.22641) argues n-gram novelty is the wrong metric.
Take: creativity must be measured as VARIETY across a population, which a generations engine has natively and a single model does not. Never grade by n-gram novelty alone.
