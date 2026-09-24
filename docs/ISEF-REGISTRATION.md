# ISEF 2027: how a sophomore with no mentor enters, in SOFT

Read on 2026-09-16 from the Society for Science rules pages (links at the end). Nothing here is a
guess; where a fact is local to his fair it says so.

## The dates that bind

| What | When |
|---|---|
| Regeneron ISEF 2027 | May 8 to 14, 2027, Los Angeles |
| Research window judged | 12 continuous months, no earlier than January 2026, ending May 2027 |
| BRAIN work started | 2026-09-16 (inside the window) |
| Affiliated fairs run | January to April 2027; last allowed fair date April 14, 2027 |
| Fair registration deadlines | set by each fair, usually December to February; check his fair |
| Finalist notifications | March 2027 |
| Abstract rewrite deadline | April 18, 2027 |

## The path (there is no direct entry to ISEF)

1. Find his ISEF-affiliated fair at https://findafair.societyforscience.org/ (state and county). Each
   fair covers one territory and sends a fixed number of finalists to ISEF. Some regions go
   school fair, then regional, then state; others go regional straight to ISEF. The fair page names
   its registration platform and deadline.
2. Register on that fair's platform by its deadline with the forms below.
3. Win the fair's allocation. The fair notifies him and Society for Science registers him.

## No mentor is required

The rules require an Adult Sponsor, not a mentor. The Adult Sponsor signs Form 1 and is the adult
responsible for the project. A teacher or a parent can be the Adult Sponsor. A Qualified
Scientist is required only for BSL-2 agents, DEA substances, and many human or vertebrate
studies. A software project on his own machine needs none of that. So: ask one science or CS
teacher this month, or a parent, to be the Adult Sponsor. That is the whole "mentor" problem.

## Forms every project needs (fill before experimentation continues; the SRC reviews them)

- Form 1, Checklist for Adult Sponsor (the sponsor completes it)
- Form 1A, Student Checklist
- Research Plan (rationale; research question or engineering goal and expected outcomes;
  materials; procedures; risk and safety; data analysis; bibliography)
- Form 1B, Approval Form (student, parent, sponsor signatures)
- Form 2A, Student Support Disclosure
- Form 2C only if any work was done at a regulated institution or company (not the case)

The rules say the Research Plan should be completed before experimentation and that changes go in
an addendum. The build began on 2026-09-16, so write the plan now and date the addendum honestly.

## The AI rule, which matters for this project

"Artificial Intelligence may be used as a project resource but must be cited and given proper
acknowledgment. A student is expected to do independent work and all materials presented must be
in the researcher's own words. A student may not use generative AI to write the research plan,
abstract, poster or to create citations."

So the Research Plan, the abstract (250 words max) and the poster are written by him, in his
words. The code assistance is disclosed on Form 2A and in the plan. The defensible framing is
the true one: he authored the architecture (the manual is his), directed the build, and the
experiments and numbers come from the gate and benches he can rerun in front of a judge.

## Category

Systems Software (SOFT). Subcategories include Algorithms, Languages and Operating Systems,
Human/Machine Interface, Other. BRAIN fits Algorithms or Other: a persistent computational
organism (cells, connectome, generations) evaluated as a system.

## What ISEF judges score, and what BRAIN already has

- Research question or engineering goal: can intelligence be engineered as an emergent
  property of a persistent, interconnected, self-rewiring computational system rather than one
  model? Engineering goal: a substrate of universal primitives (proved: sym language and register
  machines run natively, test/universal.test.mjs, which node --test reports as 7 pass and 0
  fail) that grows by generations.
- Methodology: every claim is a test or a bench with a printed number (bench/gate.mjs). The
  gate writes its own tally, test files passed out of test files run, assertions passed,
  assertions failed and a GREEN or RED verdict, into bench/verdicts/gate.json on every run.
  This page cites that file instead of reprinting the tally, because the tally changes every
  time the gate runs and a printed copy of it ages into a false claim within the hour.
- Data: throughput, SIMD speedups, generations curves, task suite scores, all in
  bench/verdicts, indexed into docs/NUMBERS.md by tools/numbers.mjs and checked against every
  document by tools/docs-numbers.mjs. The controlled ones are the ones a judge can press on:
  bench/lab.mjs confirmed goal routing at a relevant share of 0.41875 against 0.125 for its
  control over 16 seeds, refuted the predictive learning rule over 8 seeds, and left phasor
  memory undecided over 8 seeds.
- Creativity: tokens to quanta (typed signals), genome as source, time x amount x scale x cells.
- Presentation: the animated connectome (viz/) and the CLI, shown live at the booth (a display
  must also work without power or internet, so print the poster with the key figures). The
  largest organism the whole-organism bench has built is 8,072 cells and 91,159 edges at
  1,000 majors, built in 3,982.8 ms with 0 illegal edges.

## Do this week

1. findafair: write down the fair name, platform, registration deadline, and whether a school fair
   comes first.
2. Ask the Adult Sponsor.
3. Draft the Research Plan in his own words using the seven headings; I supply the numbers and
   the bibliography sources from brain/research/.
4. Register on the fair platform the day it opens.

## Sources

- Rules for All Projects: https://www.societyforscience.org/isef/international-rules/rules-for-all-projects/
- ISEF FAQ (find a fair, no fair in your area): https://www.societyforscience.org/isef/faq/
- Find a fair: https://findafair.societyforscience.org/
- Categories: https://www.societyforscience.org/isef/categories-and-subcategories/
- ISEF 2027 dates: https://www.societyforscience.org/isef/
