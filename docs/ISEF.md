# BRAIN: ISEF Planning Document

This is a planning document, not the Research Plan, Abstract, or poster. Regeneron ISEF
rules require the student to write those documents himself and forbid using generative
AI to write them (quoted exactly in section 1). This document exists so that work is not
guessed at later: it lists the eligibility rules to satisfy, a timeline template, three
candidate research questions that fit the central experiment in `MANUAL.md` section A and
`DESIGN.md`, the measurement and statistical plan for each, a booth demo plan, what the
student must write himself, how to cite AI assistance correctly, and how SOFT-category
projects are typically judged. Every rule quoted below was read directly from the
official Society for Science pages on 2026-09-16 (URLs given at each quote); dates that
are not yet announced are marked TBC rather than guessed.

## 1. Eligibility and rule checklist

Source: Society for Science, "Rules for All Projects,"
<https://www.societyforscience.org/isef/international-rules/rules-for-all-projects/>,
read 2026-09-16, current 2027 Rules and Guidelines. Quotes below are exact.

| # | Rule (quoted) | Status for this project |
|---|---|---|
| 1 | "be in grades 9-12 or equivalent" | satisfied: the student is a sophomore, grade 10, in the school year that ends before ISEF 2027 |
| 2 | "not have reached age 20 on or before May 1 preceding ISEF" | to confirm: student's age on May 1 of the ISEF 2027 calendar year |
| 3 | research "may include no more than 12 months of continuous research and may not include research performed before January 2026" | satisfied if the research log starts no earlier than January 2026; `MANUAL.md` dates project start 2026-09-16, well inside the window and well under 12 months if ISEF 2027 falls in its usual May window |
| 4 | "Team projects must have no more than three members" | this project is planned as an individual project; confirm before registering |
| 5 | "Projects that are demonstrations, literature reviews, 'library' research, informational projects, and/or 'explanation' models are not recommended or appropriate for ISEF" | see section 3: every research question below is a testable hypothesis with controls and a falsification condition, not a build-and-show |
| 6 | "Artificial Intelligence (AI) may be used as a project resource but must be cited and given proper acknowledgment" | see section 6 |
| 7 | "A student may not use generative AI to write the research plan, abstract, poster or to create citations (it is known to hallucinate and falsify references)" | this document is scaffolding only; the student writes those four documents himself (section 5) |

Note on a discrepancy in the project's own earlier research notes:
`research/batch-1.md` item 16 (written before the official page was read) says "under 21
on May 1"; that number belongs to some individual affiliated fairs' own local rules, not
the ISEF rule. The ISEF-level rule, confirmed against the official page above, is under
20. Use the affiliated fair's own published rules for anything the fair sets locally
(registration deadlines, forms, local category names); use the ISEF international rules
for everything that gates advancement to ISEF itself.

Also required, not yet action-needed at this stage: an affiliated regional or state fair
must be the qualification path (ISEF does not accept direct entry). Find the
student's affiliated fair through Society for Science's fair network; see "Affiliation
Requirements," <https://www.societyforscience.org/isef/affiliated-fair-guidelines/requirements/>,
and general information at <https://www.societyforscience.org/isef/faq/>. Every ISEF
project also needs the paperwork set described in the Rules and Guidelines booklet
(the exact set is project-specific and determined by ISEF's own Rules Wizard tool, linked
from the international rules page); confirm the required forms for a pure-software,
no-human-subjects, no-animal-subjects project using that Wizard before the affiliated
fair's paperwork deadline, since the required set is not invented here.

## 2. Timeline template (fill in dates as they are confirmed)

Project start per `MANUAL.md`: 2026-09-16. ISEF 2026 was in Phoenix, Arizona,
May 9-15, 2026 (research/batch-1.md item 16). ISEF 2027's dates and city have since been
read off <https://www.societyforscience.org/isef/> and are recorded in
`docs/ISEF-REGISTRATION.md`: May 8 to 14, 2027, Los Angeles. The rows below that are still
marked TBC are the ones set by his own affiliated fair, which are local and not published
on the ISEF pages; they stay TBC until the fair is identified rather than being guessed.

| Phase | Target window | What must be done |
|---|---|---|
| Research and design | Sep 2026 to (TBC) | `research/`, `DESIGN.md` (done); pick and pre-register one research question from section 3 below, with its hypothesis, controls, and analysis plan written down *before* running the deciding experiment |
| Build the measured subsystem | (TBC) | Build only what the chosen research question needs to measure; `DESIGN.md` section 15 and `docs/ARCHITECTURE.md` section 12 list what is not built yet |
| Pilot runs | (TBC) | Small-scale runs to sanity-check the bench scripts print sensible numbers and to size the seed count for section 4's power calculation; pilot data is not the data used for the final claim |
| Full measured run(s) | (TBC) | The pre-registered experiment, at the seed count and thresholds decided during the pilot, run and recorded exactly as pre-registered |
| Research Plan / Abstract / lab notebook written | (TBC, before the local fair's deadline) | Student-authored (section 5); AI-assisted engineering work cited (section 6) |
| Local/school science fair | (TBC) | Confirm this school's own fair calendar |
| Affiliated regional or state fair | (TBC) | This is the qualifying step for ISEF; confirm this student's affiliated fair and its own deadlines, which are usually set months ahead of ISEF |
| Regeneron ISEF 2027 | May 8 to 14, 2027, Los Angeles | International finals |

## 3. The central experiment

`MANUAL.md` section A states the question the whole project exists to test: "whether
intelligence can be engineered as an emergent property of a sufficiently rich,
persistent, interconnected computational system rather than as the behavior of one
monolithic model." `research/SYNTHESIS.md` point 1 restates it as the project's actual
research question and names the gap it fills: a whole biological connectome already runs
on one consumer GPU (source 03, Rojas Aliaga 2026,
<https://github.com/rjo6615/fly-brain-interactive>, doi
<https://doi.org/10.5281/zenodo.19152238>), but nothing above raw spikes exists in that
code: no typed cells, no generations engine, no memory tiers, no authority gate. That gap
is what `core/` builds, and it is also what the three candidate questions below each
measure a piece of.

ISEF rule 5 in section 1 above rules out a pure "we built X" demonstration. Each
candidate question below is written as a comparison with a control, a falsification
condition, and a printable measurement, which is what makes it a research question rather
than a build log. Pick one (the manual says do not overoptimize for ISEF, but a single,
deep, well-controlled question scores far better under the criteria in section 9 than
three shallow ones).

### Candidate 1: does architectural specialization beat one monolithic model at matched size?

**Research question.** For tasks requiring both exact computation (arithmetic, linear
algebra) and associative pattern completion, does a heterogeneous connectome of typed,
specialized cells (`cells/basic.mjs`: `num.arith`, `sym.solve`, `hv.bundle`,
`memory.assoc`, and related kinds, wired by `seeds/basic.mjs`) outperform one monolithic
neural-network cell (`vec.mlp`) with a matched total parameter count, on accuracy per
unit of measured compute cost?

**Hypothesis.** The heterogeneous connectome reaches a fixed accuracy criterion at lower
total `cell.stats.cost` (the ledger-tracked compute cost, see `docs/ARCHITECTURE.md`
section 3) than the size-matched monolithic model, because exact primitives
(`core/primitives.mjs`'s `verify`, `evalSym`, exact `num` arithmetic) solve the exact-
computation half of the task set with zero error at fixed cost, which a gradient-trained
monolithic model cannot match at any size (source 11, Ni 2026 survey,
<https://arxiv.org/abs/2608.13129>, on why token/embedding-based models systematically
fail exact numeric tasks).

**Independent variable.** Architecture: heterogeneous connectome vs. one monolithic
`vec.mlp` cell, with total parameter count matched (sum of `nin*nhid + nhid*nout`
weights across all cells in the connectome arm, matched to the single cell's `nin, nhid,
nout` in the monolithic arm).

**Dependent variables.**
- Task accuracy at a fixed evaluation set (exact arithmetic and algebra items scored by
  `core/primitives.mjs`'s `verify`; associative-recall items scored by `memory.assoc`'s
  hit rate), to be measured by a new bench script, `node bench/rq1-architecture.mjs`
  (not yet written; see section 8).
- Total compute cost to reach a pre-registered accuracy threshold, read from
  `cell.stats.cost` summed across all cells (`Brain.summary().stats`), to be measured by
  the same script.
- Wall ticks to criterion, read from `Brain.summary().t`.

**Controls.**
- *Monolithic single-cell control* (given in the assignment): one `vec.mlp` cell sized so
  its parameter count matches the sum across the connectome arm's cells, wired to the
  same inputs and outputs, trained with the same local delta rule already implemented in
  `cells/basic.mjs`.
- *Connectome-with-learning-disabled control* (given in the assignment): the same
  heterogeneous connectome with every cell's `policy.learn` set to `false` and edge
  growth/pruning turned off (`Brain` constructed with a gate policy that rejects every
  `edge.grow`/`edge.prune` proposal). This isolates how much of any advantage comes from
  architecture alone versus from architecture plus learning.

**What would falsify it.** If the monolithic model reaches the accuracy criterion at
equal or lower total cost than the heterogeneous connectome, or if the
learning-disabled connectome performs indistinguishably from the learning-enabled one,
the specialization hypothesis is falsified for this task set.

### Candidate 2: does structural adaptation (growth and pruning) help beyond weight learning alone?

**Research question.** Does allowing the connectome to grow new edges (via co-activation,
`core/connectome.mjs`'s `CoActivation`, gated by `core/gate.mjs`'s `edge.grow` policy) and
prune stale ones (`edge.prune`) improve task performance over wall time, compared to a
frozen-topology connectome that only adjusts existing edge weights by Hebbian learning?

**Hypothesis.** A growing-and-pruning connectome reaches a fixed task-performance
criterion in fewer wall ticks than a frozen-topology connectome with the same starting
cells and the same Hebbian learning rule, because new pathways between co-activated
cells that have no direct edge cannot be discovered by weight learning alone. Sourced to
the design's separation of learning (weight change) from structural adaptation
(`DESIGN.md` sections 5 and 9) and to the growth mechanism's origin in local,
co-activation-driven rules for growing structure (source 14, neural cellular automata,
Mordvintsev, Distill 2020, and the Darwin Godel Machine's structural search, source 04,
<https://arxiv.org/abs/2505.22954>).

**Independent variable.** Structural adaptation: on (default gate policy, `edge.grow`
approved at `coActivations >= 8`, `edge.prune` approved when stale and weak, as
implemented in `core/gate.mjs`'s `makePolicy`) vs. off (frozen topology; a policy that
always rejects `edge.grow` and `edge.prune`). Both arms keep Hebbian weight learning on
for every cell (`policy.learn: 'hebbian'`).

**Dependent variables.**
- Task performance over wall ticks (a learning curve), to be measured by a new bench
  script, `node bench/rq2-structural-adaptation.mjs` (not yet written).
- Edges grown and pruned per run (`Connectome.stats.grown`, `.pruned`), read directly
  from `Brain.summary().connectome`.
- Proposals and decisions logged by the gate (`Gate.stats`), read from
  `Brain.summary().gate`, so the growth/pruning activity itself is auditable, not just
  its effect.

**Controls.**
- *Frozen connectome control* (given in the assignment): structural adaptation off, as
  defined above.
- *Random-growth control* (to isolate whether co-activation-targeted growth specifically
  matters, versus growth of any kind): edges are added at the same rate as the
  co-activation arm approves them, but to randomly chosen compatible cell pairs rather
  than pairs that just co-activated. This control is necessary because "growth helped"
  and "co-activation-targeted growth helped" are different claims; without it, a result
  favoring the growing arm could be entirely explained by having more edges, not by
  which edges were added.

**What would falsify it.** If the frozen-topology connectome reaches the criterion in
statistically indistinguishable wall ticks (see section 4 for what "statistically
indistinguishable" must mean, decided before running), or if the random-growth control
matches the co-activation-targeted growth arm, the structural-adaptation hypothesis (or
its co-activation-specific form) is falsified.

### Candidate 3: does gated selection outperform random mutation in the generations engine?

This candidate measures the generations engine described in `DESIGN.md` section 11 and
`MANUAL.md` section A ("hundreds of different race cars iterate and learn from their
mistakes over time... this is the kind of rigor that needs to be established"). The
generations engine is now built and running, so this candidate is no longer written ahead
of its code. `bench/evolve.mjs` ran the race task at population 300 for 380 generations,
evaluating 123,120 genomes over 246,240 episodes in 60,076.8 ms of wall time, and
`bench/epochs.mjs` ran 100 generations of the whole organism at population 12 in 302,383 ms,
filling 119 of 2,401 archive niches from 1,200 evaluated organisms. The clock's `gen` axis
and the gate's `genome.promote` proposal kind (with its policy rule already defined in
`core/gate.mjs`: approve only if `evidence.gain > 0` and `evidence.beatControl === true`)
are the hooks this experiment uses. What is still missing for this candidate is not the
engine but the control arm: neither bench above runs a no-selection arm at matched budget,
so the comparison below has not been made yet.

**Research question.** Once a minimal generations engine (population of genomes, an
evaluator that scores each genome on a fixed task set, and gated promotion through
`genome.promote`) exists, does gated selection reach a fixed fitness criterion in fewer
genome evaluations than random mutation with no selection pressure?

**Hypothesis.** Gated selection (only genomes whose evaluated fitness gain beats a
control are promoted, sourced to the Darwin Godel Machine's archive-based search, source
04, <https://arxiv.org/abs/2505.22954>, and to NEAT's speciation and innovation-number
protection of new structure, source 10, Stanley 2002) reaches the criterion in fewer
genome evaluations than accepting every mutation unconditionally, because selection
concentrates evaluation budget on genomes that already showed improvement rather than
spending it uniformly across a random walk.

**Independent variable.** Selection strategy: gated (`genome.promote` proposals decided
by the existing policy) vs. random-mutation (given in the assignment: every mutated
genome is kept regardless of fitness, i.e. `genome.promote` always approved).

**Dependent variables.**
- Genome evaluations (or `gen` ticks) to reach a fixed fitness criterion.
- Fitness trajectory across generations, for both arms, at matched total evaluation
  budget.
- All to be measured by a new bench script, `node bench/rq3-generations.mjs`, on top of the
  engine `bench/epochs.mjs` and `bench/evolve.mjs` already drive; the exact evaluator and
  task set must be fixed and written into the pre-registration (section 4) before this
  script is run for the deciding experiment.

**Controls.** Random-mutation control (given in the assignment), matched evaluation
budget (both arms evaluate the same total number of genomes, so a difference in outcome
cannot be explained by one arm simply doing more work).

**What would falsify it.** If random mutation reaches the fitness criterion in a number
of evaluations statistically indistinguishable from (or fewer than) gated selection at
matched budget, the hypothesis that gated selection is doing useful search, rather than
the population improving by chance, is falsified.

## 4. Statistical treatment (applies to whichever candidate is chosen)

- **Multiple seeds.** Every `Brain` takes a `seed` (`core/rng.mjs`'s `RNG`, deterministic
  and forkable: `RNG.fork(label)` derives an independent stream from a parent seed
  without correlation between forks). Run every arm of the chosen experiment across
  multiple independent seeds, not one. The number of seeds must be chosen by a power
  calculation using the effect size and variance observed in the pilot run (section 2),
  not fixed in advance without justification; write the calculation and its result into
  the lab notebook before the deciding run, and do not increase the seed count after
  seeing the deciding run's result, since that inflates the false-positive rate.
- **Pre-registered thresholds.** Before running the deciding experiment, write down, in
  the dated lab notebook: the exact accuracy/performance criterion, the exact statistical
  test to be used, the significance level, and what result counts as falsifying the
  hypothesis. Do not change any of these after seeing the results.
- **Corrections for multiple comparisons.** If more than one dependent variable or more
  than one control comparison is tested within one candidate (most of the candidates
  above have at least two: a main control and a secondary control), apply a
  multiple-comparison correction, for example the Benjamini-Hochberg procedure, across
  the full family of tests reported for that candidate, and report both the raw and the
  corrected significance for each comparison.
- **What gets printed vs. what gets asserted.** Every number that appears in the Research
  Plan, Abstract, or poster must be the literal output of a bench script run listed in
  section 8, not a value typed from memory or estimated. If a script has not been run
  yet, the correct thing to write in a draft is "to be measured by `node
  bench/<script>.mjs`," exactly as this document does, not a placeholder number.

## 5. What the student writes himself

Per ISEF rule 7 in section 1, generative AI must not write any of the following. This
document is scaffolding for them, not a draft of them.

- The Research Plan (research question, hypothesis, procedures, risk and safety, data
  analysis plan).
- The Abstract.
- The poster (board text, figures' captions and framing, the narrative connecting them).
- The bibliography and citations.
- Interview talking points and the live explanation given to judges.
- The dated entries in the lab notebook / Project Data Book recording what was tried,
  what was observed, and what was decided, as the work happens (this is also the
  student's evidence of the "skill" and "thoroughness" judging criteria in section 9,
  and of independent authorship if a project's originality is ever questioned).

## 6. How AI assistance is cited

The exact rule (section 1, quote 6 and 7): AI "may be used as a project resource but
must be cited and given proper acknowledgment," and must not be used "to write the
research plan, abstract, poster or to create citations."

Concretely, for this project: any AI-assisted software engineering (code written with an
AI coding assistant, documentation drafted with one, research notes summarized with one)
must be named in the Research Plan's acknowledgments and, where relevant, in the poster's
methods section, in the form of what tool, what it was used for, and what the student did
independently. For example: "An AI coding assistant (Claude, Anthropic) was used to help
implement the cell, connectome, ledger, and gate subsystems in `core/`, under my
direction and specification; the research questions, hypotheses, experiment design,
statistical analysis plan, and all conclusions in this Research Plan are my own." Do not
cite an AI assistant as a source for a factual claim, a citation, or the interpretation
of a result; those are the parts of the rule that are absolute.

## 7. Booth demo plan

Per Society for Science's Display & Safety Rules,
<https://www.societyforscience.org/isef/international-rules/display-safety-rules/>
(read 2026-09-16): active internet connections used as part of displaying or operating a
project at ISEF require advance approval, and when the finalist is away from the booth,
electrical power to the project must be disconnected. The practical consequence, and the
constraint this plan is built around: the poster board itself must stand alone and be
understandable with no power and no network, since it is the only thing guaranteed to be
"on" at all times, and any live demo is a supplement for when the student is present, not
a replacement for the board.

- **The poster.** A printed board following the judging structure in section 9 below
  (research question, design and methodology, execution and results with real printed
  numbers from section 8's bench runs, creativity and impact, conclusions), fully
  self-contained, no QR codes or contact information (both prohibited on the board per
  the Display & Safety Rules quoted above).
- **The offline laptop demo.** A laptop running the CLI and, once built (`DESIGN.md`
  section 14, `docs/ARCHITECTURE.md` section 12), the viz, entirely offline: no calls to
  any external API or model, since the whole point of `core/` is that it runs
  zero-dependency on local Node. Prepare the exact demo script in advance (which seed
  brain, which commands, what it shows) and rehearse it, since judges' interview time is
  short and per section 9's weighting, presentation quality is worth a large fraction of
  the score.
- **What the demo should show.** Given the central experiment (section 3), the most
  persuasive live demo is not the aesthetics of the viz but the falsifiable claim itself:
  run the chosen candidate's bench script live (or show its recorded output alongside a
  brief live run to prove it is real), and use `docs/ARCHITECTURE.md` section 11's
  provenance trace (`ledger.trace(seq)`) to show a judge, concretely, that a specific
  result can be walked back to the exact cells, edges, and signals that produced it. That
  is a direct demonstration of the observability the manual requires and a rare, memorable
  thing to show a judge.

## 8. Bench commands (measurement procedures)

`package.json` declares `npm test` (`node --test test/`), `npm run gate` (`node
bench/gate.mjs`) and `npm run bench` (`node bench/throughput.mjs`), and all three exist and
run. Every gate run writes its own tally to `bench/verdicts/gate.json`: the node version, the
test files passed out of the test files run, the assertions passed and failed, and a GREEN or
RED verdict. That tally is deliberately not restated here. It changes on every run, and a
document that reprints it is publishing a number that was true once and is now a claim about
the past dressed as a claim about the present; a reader who wants the current state opens the
verdict file, which the gate rewrites, or runs the gate. `bench/` now holds the bench
scripts and `bench/verdicts/` holds the JSON each one writes; `node tools/numbers.mjs`
indexes every one of those files into `docs/NUMBERS.md`, and `node tools/docs-numbers.mjs`
fails if any document publishes a number that is in neither place.

Three of those benches already do part of the work the candidates need. `bench/lab.mjs` is
the one that runs an arm against a control and reproduces it seed for seed: in its last
verdict goal-routing was confirmed at a relevant share of 0.41875 against 0.125 for the
control over 16 seeds, the predictive learning rule was refuted over 8 seeds, and phasor
memory came back undecided over 8 seeds. `bench/evolve.mjs` and `bench/epochs.mjs` run the
generations engine (numbers in section 3, candidate 3). None of them is yet the deciding
experiment for a candidate, because none of them runs the specific control that candidate
names. Before the deciding experiment for whichever candidate is chosen, write the
corresponding script below; every number this document or any later draft cites must be its
printed output, not an estimate.

| Candidate | Script (to be written) | What it must print |
|---|---|---|
| 1 | `node bench/rq1-architecture.mjs` | task accuracy for both arms, total `cell.stats.cost` at criterion, wall ticks at criterion, across all seeds, with the seed count and the statistical test used |
| 2 | `node bench/rq2-structural-adaptation.mjs` | performance-vs-ticks curve for all three arms (growing, frozen, random-growth), `Connectome.stats`, `Gate.stats`, across all seeds |
| 3 | `node bench/rq3-generations.mjs` | fitness-vs-evaluations curve for the gated and the no-selection arm at matched budget, across all seeds, on top of the engine `bench/epochs.mjs` already drives |

Every one of these must be runnable end to end with no network access, consistent with
the offline constraint in section 7, and must print its own seed count, thresholds, and
test statistic alongside the result, so a judge or a future reader never has to trust an
unlabeled number.

## 9. Risks and how SOFT projects are typically judged

**Risks to this project specifically, and the mitigation already built in:**

- *Scope risk.* `MANUAL.md` section A's full vision (5,000 nodes, 5,000,000 lines) cannot
  be built or measured in a 12-month window (rule 3, section 1). The distance is printed
  rather than described: every gate run counts the authored code lines and files, and the
  generated organism lines and files, into `bench/verdicts/gate.json`, and those counts move
  with every commit, so they are cited here rather than copied out. The largest organism
  `bench/whole.mjs` has built is 8,072 cells and 91,159 edges at 1,000 majors, which is a
  figure from one bench run and stands until that bench runs again. Mitigation:
  the ISEF project is one of the three candidate questions in section 3, a small, fully
  measured slice, not the whole vision; `DESIGN.md` and `MANUAL.md` explicitly separate
  "his WHAT" (the long-run vision) from what gets measured for ISEF.
- *"Looks like a demonstration" risk.* Rule 5 in section 1 disqualifies demonstrations.
  Mitigation: every candidate in section 3 is written as hypothesis, control, and
  falsification condition, not "look what it does."
  A likely judge question is "what would have proven you wrong," and the answer must be
  the falsification condition from section 3, stated precisely.
- *Authorship risk.* A judge may ask how much of the code and the ideas are the
  student's own versus AI-assisted. Mitigation: section 6's citation practice and the
  dated lab notebook (section 5) are the evidence trail; be ready to explain, cell by
  cell if asked, what the architecture decisions were and why, since `MANUAL.md` section
  A is explicit that the student "directs" and owns the vision while engineering
  execution is delegated. Judges score independent understanding under "skill" and
  "scientific thought" (below); rehearsing the reasoning behind the design, not just the
  result, is the direct mitigation.
- *Statistical risk.* A single run, or a comparison without pre-registration, invites
  the judge question "did you decide the threshold before or after you saw the result."
  Mitigation: section 4.

**How SOFT and other categories are typically scored.** Society for Science's Grand
Award Judging Criteria, <https://www.societyforscience.org/isef/grand-award/criteria/>
(read 2026-09-16), score every project out of 100 points across five weighted
components. For a Science-track project (research-question framing, which fits this
project's "does X outperform Y" framing better than the Engineering-track "build to a
need" framing, though the affiliated fair's own judging form should be confirmed once
assigned): Research Question 10 points, Design and Methodology 15 points, Execution
(data collection, analysis, interpretation) 20 points, Creativity and Potential Impact 20
points, and Presentation (poster and interview) 35 points. Presentation alone is worth
more than a third of the score, which is why sections 7 and 8 above (a rehearsed,
falsifiable, live-demonstrable presentation with real printed numbers) matter as much as
the engineering itself. Confirm with the affiliated fair whether this project's category
uses the Science-track or Engineering-track rubric, since the two differ in the first
three rows (the Engineering track instead scores Research Problem, Design and
Methodology, and Execution: Construction and Testing).

## 10. Method and result for the experiments that landed 2026-09-17 and 2026-09-18

Sections 3 and 8 describe the deciding experiment that has still to be chosen and the
scripts still to be written for it. This section is the other half of the record: the
experiments that have already been run, each written as the pair a judge asks for, the
method and then the result, with every number copied from the field of a verdict under
`bench/verdicts/` that the named command wrote. Where a result is a null, it is written as
a null; where a budget is missed, the miss is the result. None of these is yet the
pre-registered deciding experiment for a candidate in section 3, and none of them is
described here as one.

**The act surface, origin as the independent variable.** *Method.* `node bench/act.mjs`
holds everything constant except where an instruction came from: the same nine characters,
an order to delete a filesystem, are put in front of the organism twice per round for 12
interleaved rounds, once as text on a page the organism itself fetched and once as the
human's own prompt, and the run separately records that the page was fetched, that its text
carried the string and that the turn's recall held that page. *Result.* Page origin
produced 0 proposals over 12 turns and prompt origin produced 12 over 12, with 12 of 12
pages fetched and 12 of 12 carrying the string, so the difference is origin and not
exposure; on the authority arm, 36 proposals over 12 rounds with no approval flag went
pending and 0 applied against 36 proposals and 24 applied with it, and the fixture server
was reached 12 times over 24 rounds, so the held arm named a url twelve times and never
touched it (`bench/verdicts/act.json`).

**The three actuators, each graded against its own refusals.** *Method.*
`node bench/act-web.mjs`, `node --test test/act-shell.test.mjs` through
`bench/verdicts/act-shell.json`, and `node bench/act-llm.mjs` each drive the actuator with
the inputs it is supposed to refuse and record the reason printed for each. *Result.* The
web reader refused 12 hostile urls across 14 address families, including loopback written
in decimal and in octal, the cloud metadata address, credentials before an at sign and a
url of 65536 characters against a cap of 2048, and it ships with an allow list of 0
entries; the shell actuator's tree kill left a grandchild at 10 bytes written and 10 bytes
later against a parent only control that left it at 14 bytes and 22 bytes later and still
writing, and 5 runs wrote 5 ledger events of which none carries the output; the model
actuator returned 235 tokens at 51.02 tokens a second from the local model, of which 1026
characters were thinking and 3 were the answer.

**Planes, the cost of searching many coordinates at once.** *Method.*
`node bench/planes.mjs --planes 8000 --ticks 2000 --workers 16` runs a sweep of independent
searches, each a declared coordinate of seed, world, seconds per tick and scale box,
fingerprinted so that the same point reached twice is recognised as one point, in short
lived child processes because a brain built in a process leaves state a later build never
frees. *Result.* 8000 planes completed, 0 failed, 8000 distinct coordinates, 1190.688
seconds of sweep wall against 18718174.8 milliseconds of child wall for a speedup of 15.72,
49022 generations and 349731 organisms over 17803084 ticks at 14951.933 ticks a wall
second, union archive 161 of 2401 behaviour cells after the first generation and 264 at the
end, best fitness 0.900121; the simulated years figure, 2,221,687.163 organism-years at
1865.886 a wall second, is printed with the arithmetic that produced it because it is a
declaration about each plane's clock and not a measurement (`bench/verdicts/planes.json`).

**The venue suite, a null.** *Method.*
`node bench/venue-suite.mjs --generations 16 --pop 32 --drift 16 --windows 8 --readings 24`
evolves a five gene trader on a recorded pumpswap tape against two controls, a rate matched
random arm that trades as often as the evolved arm and a never trade arm, on eight train
windows and eight holdout windows whose instruments are disjoint, with every round trip
charged the fee bar. *Result.* Selection beat drift on the train windows by 0.023187 of
return on deployed, best train fitness 0.154883 found at generation 2 over 692 evaluations,
and none of it survived the holdout: 0 of 8 windows won against the matched control at a
sign test of 1, a per window return interval running up to 0.011439 and therefore covering
zero, and neither the fee bar nor the never trade arm cleared. The budget is recorded with
the result, 692 evaluations over five free parameters graded on 6 closed round trips of
which the holdout checked 3, which is 115.33 evaluations per closed round trip, so the
finding is that the experiment is underpowered and not that the strategy is refuted; the
fee itself, 4.54 percent a round trip, is labelled in the verdict as borrowed from a
measurement taken on a different venue (`bench/verdicts/venue-suite.json`).

**Reproduction, with a placebo arm and two rulers.** *Method.*
`node bench/reproduce.mjs --rounds 12 --ticks 48 --majors 40 --arms 2,4 --seeds 5` has an
organism mutate children from its own genome, reads the parent and every child on the same
5 build seeds, and promotes the best through the parent's gate when it wins a majority of
the seeds by more than the parent's own paired spread; the third arm is a placebo that
keeps every gene of the parent and changes only the seed the wiring is built from, the
three arms are interleaved round by round, and the ruler this bar replaced (one reading of
the child against one of the parent) is still computed on the same children and applied to
nothing. *Result.* 120 child states written in 34891.6 milliseconds of sweep wall at 0.918
to 0.953 MB a child. Under the old ruler the placebo promoted at 0.5833 against 0.5417 for
the mutated arms, so it was reading the seed. Under the paired bar the placebo promoted in
0 of 12 runs against 0.625 for the mutated arms, a gap of 0.625, with the bar's own
arithmetic bounding a gene identical child at 0.209877; the mean gain, 0.025743, sits
inside its own spread (standard deviation 0.03292 over 12 rounds, positive in 9), so the
promotion rate gap is the number to quote. The exact per suite check caught 3 and 11 suite
regressions in the mutated arms against 0 in the placebo (`bench/verdicts/reproduce.json`).

**The answer bench, three arms on one ruler.** *Method.* `node bench/answer.mjs --tasks 10`
asks 70 questions, 40 planted in the organism's episodic memory and ten each from its
algebra, sequence and grid suites, of three arms: the organism, the same local model alone,
and a null arm that writes what an answer looks like and knows nothing beyond what the exact
path and recall hand it. The organism now solves before it recalls and recalls before it asks:
an exact path computes on its own cells, rationals over BigInt for arithmetic, the compare and
solve cells for equations, a sequence fitter and a program search over the grid vocabulary
whose program is then run through real cells, and only a prompt that path cannot finish whole
reaches memory and then the model. The arms answer question by question with the leading arm
rotating, one extractor and one comparison grade all three, and every answer carries its
provenance, exact, memory or model, with counts that must add up or the verdict is not green.
*Result.* Organism 70 of 70, model alone 55 of 70, null 67 of 70. All 30 of the organism's
suite answers came from the exact path and its 40 planted answers from the model; the model
alone scored 6 of 10 algebra, 7 of 10 sequence and 2 of 10 grid. The ruler names the organism
over the null arm by 4.29 points and says in the same sentence that a gap this size needs 86
questions per arm to separate from zero, so the organism's nearest rival is its own no model
control at 95.71 percent and not the model at 78.57; the 95 percent intervals are 5.20 points
wide on the winner and 10.39 on the control. Mean time was 4592.95 milliseconds a question
for the organism against 34132.86 for the model alone, on a local model that was also serving
the code bench for half the run, so the time columns measure the queue as much as the arms.
Over the whole generated population the exact path scores 724 of 725, the one miss a grid
where a different program fits every demonstration (`bench/verdicts/answer.json`,
`bench/verdicts/tasks.json`).

**The code bench, and a winner that did not reproduce.** *Method.* `node bench/code.mjs`
runs 40 tasks with hidden cases, five generated kinds and 10 typed by hand, through three
arms: the organism, which asks the local model, runs the candidate against the visible cases
in a sandbox and feeds the failing cases back for up to 3 rounds; the same model asked once;
and a null arm that writes nothing. The sandbox is a worker thread with its own memory ceiling
around a context whose globals are pruned to arithmetic, collections and strings, with no
process, file, socket, timer or code generation from strings, and a case that loops forever is
ended from outside by the parent at its deadline. A task counts only when every hidden case
passes; the hidden case rate is printed and decides nothing. *Result.* Organism 16 of 40,
model alone 8 of 40, null 0 of 40, a gap of 20.00 points that the bench says needs 39 tasks
per arm to separate from zero, with 95 percent intervals 29.06 points wide on the winner and
24.26 on the runner up. On more than half of the tasks neither model arm ever produced a
candidate that passed even the visible cases, so most of the fixture carries no information
about the repair loop for a model this size. The run before this one, same tasks, same seed,
same model and same code, had named the model alone the winner by a smaller margin, and its
verdict file was overwritten before it could be kept: the bench wrote its verdict to the bar's
own file after every task of every run of every shape, a defect the review found and the fix
closed by making the shape of a run choose its file, so the earlier tallies survive only as
prose in the note. Two runs that disagree on the winner by more than either run's own gap mean
the ordering of organism and model sits inside the movement between runs; only the floor
survives both, the null arm at zero and both model arms above it. The next measurement is the
same tasks run several times per arm with paired differences as the unit
(`bench/verdicts/code.json`).

**Public rulers, downloaded and cited, not yet run.** On his authorisation the public
evaluation and training splits of ARC-AGI-1, MultiPL-E's JavaScript translation of HumanEval
and the GSM8K test split were downloaded into the tree with their licences and hashes recorded
beside them, and a table of published scores on those sets was read from the ARC Prize
leaderboard, OpenAI's simple-evals README, the Llama model card and the Qwen3 technical
report, each row dated and sourced. Those rows are citations and not measurements of this
build; the organism's scores on the same sets are the next bench, and the number this project
can own is the gap between the same small local model alone and inside the organism on the
same questions, printed beside the published rows (`bench/fixtures/public/SOURCES.md`,
`research/benchmarks-web.md`, `research/published.json`).

**Mutation testing of tonight's surfaces.** *Method.*
`node bench/mutants.mjs` generates single edit mutants of the modules that landed, runs the
suite that covers each one against a recorded unmutated baseline, and counts executed
separately from killed so that a mutant which never ran cannot be scored as one nothing
survived. *Result.* 40 mutants generated, 40 executed, 40 killed, 0 survived, score 1, in
101081 milliseconds at a per mutant budget of 90000 milliseconds
(`bench/verdicts/mutants.json`).

**The footprint budget, and the miss.** *Method.* `node bench/footprint.mjs` declares the
pocket budget in the verdict before measuring, 512 MB of resident set after 200 ticks, a
checkpoint at or under 50 MB and at least 5 ticks a second, then builds the organism at
three sizes and, at the smallest, runs three interleaved arms to attribute the memory: the
hypervector heap sized to the organism, the flat 512 MB heap it replaced, and no heap at all,
with a census after a forced collection that names the line that made every slot still held
and the route it took. *Result.* At 12 majors 355.6 MB, a 2.356 MB checkpoint and 136.677 ticks a
second; at 100 majors 607 MB, 20.162 MB and 51.336; at 1000 majors 1321.3 MB, 115.956 MB and 17.646; at
12 majors over 100000 units 462.9 MB, 12.185 MB and 55.717. The rate budget is met at every row,
the memory budget at the 12 major rows only, and the checkpoint budget everywhere but 1000
majors. The sized heap serves 299364 allocations over 200 ticks with 297220 returned by their
owners and 0 falling back, and 3 slots of garbage remain against 2144 in use after the collection,
1 as a payload still in flight and 2 held by a store. Across the three rounds the smallest row reads
369.2, 353.7, 357.3 MB with the sized heap, 353.9, 358.2, 356.2 MB with the flat one and 332.4, 330.9,
332.3 MB with none. The tick rate bar, the no heap arm less its own spread, 126.929 less 6.823 so
120.106, is met at 132.259, and the paired ruler beside it, medians 132.083 against 133.011 with a
floor of 113.311, is met as well; both are printed. Where the budget is still missed the verdict
attributes rather than guesses: at 100 majors the typed arrays hold 198.1 MB of the 607 and the
heap 256 MB, and at 1000 majors 550 MB of 1321.3; at 100 majors the unbounded peak is 28504 slots
against 32768 planned and the sized heap reads a median of 48.645 ticks a second against 47.799
for the flat one at 0 fallback, and at 1000 majors an unbounded heap fills all 65536 slots so the
need is above the ceiling, the fallback is 35.87 percent and the sized heap is slower by 1.865
against a spread of 1.035, a negative recorded as one (`bench/verdicts/footprint.json`).

**The checkpoint format, measured before it was changed.** *Method.* `node bench/checkpoint.mjs`
builds the organism at 4 sizes in child processes, ticks each 200 times, writes the same brain
in the old and the new format back to back, counts the bytes of every top level section and,
inside cells, of every field, restores each file and compares the restored brain with the
original field for field. *Result.* The bulk was not number lists, since every payload was
already base64, but byte for byte duplicate payload strings; the third format keeps one
deflated table of distinct payloads and references into it, and the fourth writes the payload
bytes raw before the deflate instead of base64 text. Third to fourth: 12 majors at 256 units 3.881 MB
to 3.687 MB, 100 majors 20.167 MB to 19.763 MB, 1000 majors 110.699 MB to 108.302 MB, 12 majors at
100000 units 15.745 MB to 14.626 MB, restored identical on every row and identical across the two
formats. The same run falsified the premise the fourth format was designed from: at 1000 majors
3 of the table's 58462 payloads are int8 bipolar vectors and 38158 are already one bit per lane, and
the 1000 major row stays over the 50 MB budget because 34621280 bytes of in flight signals and
7526476 of mailboxes are mostly frame, 22998040 and 4600957 bytes of key text and punctuation,
which no payload encoding touches (`bench/verdicts/checkpoint.json`, the earlier arm in
`bench/verdicts/checkpoint-before.json`).

**The planes child, measured and cut.** *Method.* `node bench/planes.mjs --planes 400 --ticks 2000 --workers 4`
run before and after the change into its own verdict, with the resident set, the hypervector heap
counters and the organism count recorded inside the child after every plane. *Result.* The child
grew for one measured reason: a synchronous run of plane after plane gave the heap no turn in
which a slot could return. A collection point between planes and a heap planned for the
largest organism the child will run took the peak child from 959.488 MB to 588.219 MB and
the mean peak from 676.74 MB to 449.274 MB, the per worker slope to 0.5645, 0.0504, 0.0323, 0.3557 MB a plane,
at 5.56 percent of sweep wall, with the same 2312 generations, 16539 organisms and 897369 ticks in
both runs (`bench/verdicts/planes-rss.json`, the before in `bench/verdicts/planes-rss-before.json`).
The plane itself was then made to yield, with a collection point inside it between generations
and a release for every organism the search discards: on the same sweep no plane fell back, the last
plane of every worker reading 0 percent against 1.28, 15.2, 0 and 24.05 before, the peak child fell
from 588.219 MB to 431.594 MB and the mean peak from 449.274 MB to 307.6 MB, with the same
generations, organisms and ticks, a sweep wall of 164.895 seconds against 145.745 while other work
shared the machine, and an archive of 156 cells against 153 (`bench/verdicts/planes-async.json`).

**Self modification of the source, refused for the right reason.** *Method.*
`node bench/self-code.mjs` submits proposals that would change the organism's own code. The
gate does not read the evidence, it runs it: the tree is copied to a temporary directory,
the named test is run unpatched, the patch is applied to the copy and the test is run again,
and only a verification this process produced is believed. Five fixture cases are graded
twice each, and the analysis is run both against the real verdicts and against a fixture
pair holding one survived mutant and one red test file, because an analysis graded only on
a clean tree is graded on emptiness. *Result.* All ten fixture runs came out as wanted: a
valid proposal reaches pending in 358.5 milliseconds on the mean and every rejection carries
its reason, including a patch whose test passes without it, a proposal with no patch, a
model origin proposal and a path with a parent directory segment. Against the real verdicts
the analysis found 0 candidates, from 0 of 40 mutants survived and 0 of 42 test files red;
against the fixture pair it found 2 and refused 2, on the ground that an analysis can name
the file and the test and cannot write the patch. Application happens only when a human
types the approve flag, and the ledger records the file hash before and after
(`bench/verdicts/self-code.json`).

**Perception of real pages, with the authority rule intact.** *Method.*
`node bench/perception.mjs` fetches three real pages over five rounds with the shipped allow
list empty so that nothing is reachable until a human names a host, takes a census of every
memory tier before and after so that what the pages changed is measured rather than
asserted, and repeats the origin experiment of the act surface on live text carrying an
order and a false claim of authority. *Result.* Census 0 rows to 8416, of which 8413 are
language associations and 3 are web ingest rows, and the ingest path is the only tier that
moved; 3 ledger rows for 3 pages, every one labelled as web; a user agent set on 3 of 3
fetches; the organism answered from all 3 pages on a ledger ring large enough to hold them
and from 2 of 3 on the shipped ring, which is a real limit reported rather than rounded off;
and 220 ingested rows of hostile text produced 0 proposals from the page over 5 rounds while
the human's own url produced 5, all 5 held (`bench/verdicts/perception.json`).

**The findings page, and the one gap in this list.** *Method.* `node tools/findings.mjs`
builds a public page from the verdict directory, one card per verdict file, under the rule
that every value shown must resolve to a field of a verdict, to the soak state, or to a
count the generating run printed, with three deliberate perturbations (a bent number, a
false quotation, a loose digit) run through the generator to show the refusal works.
*Result.* The page is built and linked from the site, nulls shown on the same cards as the
wins, and two defects found by reading the built page rather than the code were fixed by
changing the objective rather than the threshold. This is the one item in this section with
no verdict file of its own: its counts are printed by the build and written up in
`notes/web.md`, so a reader has to run the build to check them, which is a weaker standard
than everything above and is named here as such.
