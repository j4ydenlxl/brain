# Board 17 (proposed)

at: 2026-09-26T02:26:03.947Z
date: 2026-09-26
board: 17
author: organism (nextboard)
code: self/nextboard.mjs (board 15 builder)
ledger: state/self/gaps.jsonl (193 lines, written 2026-09-26T02:24:57.776Z)
counts: lines 193, eligible 70, excluded 123, items 8 (missed 2, gate slow 3, dead share 1, ladder 1, board item 1)
excluded: no verdict file: nothing could say the item is done 90; no trial and no brief 23; a line of a proposed board (docs/boards/proposed/board-17.md) 8; the trial names a script that does not exist: bench/plateau.mjs 1; the trial names a script that does not exist: bench/resume.mjs 1
ranking: score = distance to the bar (unit free, capped at 1) / trial minutes; the best of each kind, then by score with at most 3 per kind (the cap lifted under 5)
target: rewrite: today's proposed board docs/boards/proposed/board-17.md has no decision recorded against it: rewritten with today's ranking
grammar: self/boards.mjs
placeholders: {tmp} {copy} {out} are the trial's budget dirs, as in its argv

## item missed-authorship-json
wave: 1
ollama: false
owns: none named by the gap line
task:
GAP: missed:authorship.json (kind missed, state/self/gaps.jsonl line 1, since 2026-09-24T18:47:29.192Z; score 1 = distance 1 / 1 trial minutes; distance from the line (|distance| / |bar|, capped at 1))
BUILD: fill missed:authorship.json (subsystem unmapped): the ledger measured 0 share of landed changes the organism authored against a bar of 1 (higher is better, distance 1) in bench/verdicts/authorship.json, from node tools/authorship.mjs --root C:\Users\ybmic\Downloads\claudeskillsvideo-to-website\brain; a fill changes no file the gap line names. The ledger's reason: decided by barMet; measured share, bar 1 (its barRule: an organism share of exactly 1)
BAR (bench/verdicts/authorship.json): it must reach 1 share of landed changes the organism authored (higher is better) where the ledger measured 0; the trial that measures it again (trial.command of authorship, run in the tree; 1 min) is node tools/budget.mjs --ram-mb 6000 --disk-mb 100 --dir {tmp} -- node tools/authorship.mjs --no-write --json.
Tests: test/authorship.test.mjs, test/autopilot.test.mjs.
MODEL OFF.

## item gate-slow-test-autopilot-test-mjs
wave: 1
ollama: false
owns: none named by the gap line
task:
GAP: gate-slow:test/autopilot.test.mjs (kind gate slow, state/self/gaps.jsonl line 36, since 2026-09-24T21:18:55.119Z; score 0.5 = distance 1 / 2 trial minutes; distance from the line (|distance| / |bar|, capped at 1))
BUILD: fill gate-slow:test/autopilot.test.mjs (subsystem unmapped): the ledger measured 36209 ms against a bar of 15000 (lower is better, distance -21209) in bench/verdicts/gate.json, from node bench/gate.mjs --quiet; a fill changes no file the gap line names. The ledger's reason: test/autopilot.test.mjs took 36209 ms in the gate
BAR (bench/verdicts/gate.json): it must reach 15000 ms (lower is better) where the ledger measured 36209; the trial that measures it again (trial.command of test:test/autopilot.test.mjs, run in the tree; 2 min) is node tools/budget.mjs --ram-mb 6000 --disk-mb 2048 --dir {tmp} -- node --max-old-space-size=6000 --test test/autopilot.test.mjs.
Tests: test/autopilot.test.mjs, test/gate.test.mjs.
MODEL OFF.

## item dead-organism-gen-1-4-4-1-4
wave: 1
ollama: false
owns: organism/gen-1-4-4-1-4
task:
GAP: dead:organism/gen-1-4-4-1-4 (kind dead share, state/self/gaps.jsonl line 145, since 2026-09-23T20:45:55.613Z; score 0.35718 = distance 0.71436 / 2 trial minutes; distance from the line (|distance| / |bar|, capped at 1))
BUILD: fill dead:organism/gen-1-4-4-1-4 (subsystem unmapped): the ledger measured 0.71436 share of loaded lines that never ran against a bar of 0 (lower is better, distance -0.71436) in bench/verdicts/census-all.json, from node tools/organism-census.mjs --all --ticks 200 --max-cells 1000; a fill changes organism/gen-1-4-4-1-4. The ledger's reason: census census-all.json (dynamic, 1929 lines loaded, 551 load bearing); the gate caps it at 0.1 and MANUAL P8 asks for 0
BAR (bench/verdicts/census-all.json): it must reach 0 share of loaded lines that never ran (lower is better) where the ledger measured 0.71436; the trial that measures it again (trial.command of census:gen-1-4-4-1-4, run in the copy; 2 min) is node tools/budget.mjs --ram-mb 6000 --disk-mb 400 --dir {copy} -- node --max-old-space-size=6000 tools/organism-census.mjs --seed organism/gen-1-4-4-1-4 --ticks 200 --no-knockout --tag gaps.
Tests: test/census-static.test.mjs, test/census.test.mjs.
MODEL OFF.

## item ladder-sets-arc-frontier
wave: 1
ollama: false
owns: capability/grid-library.mjs
task:
GAP: ladder:sets.arc.frontier (kind ladder, state/self/gaps.jsonl line 30, since 2026-09-24T15:45:16.051Z; score 0.272959 = distance 0.818878 / 3 trial minutes; distance from the line (|distance| / |bar|, capped at 1))
BUILD: fill ladder:sets.arc.frontier (subsystem unmapped): the ledger measured 17.75 percent against a bar of 98 (higher is better, distance 80.25) in bench/verdicts/ladder.json, from node bench/ladder.mjs; a fill changes capability/grid-library.mjs. The ledger's reason: board.sets[arc].bars.frontier: Gemini 3.1 Pro (Preview) at 98, the organism at 17.75 (below)
BAR (bench/verdicts/ladder.json): it must reach 98 percent (higher is better) where the ledger measured 17.75; the trial that measures it again (trial.command of grid, run in the copy; 3 min) is node tools/budget.mjs --ram-mb 6000 --disk-mb 200 --dir {copy} -- node --max-old-space-size=6000 bench/grid.mjs --split evaluation --budget-ms 3000 --workers 2 --limit 10.
Tests: test/grid-library.test.mjs, test/grid.test.mjs, test/ladder.test.mjs.
MODEL OFF.

## item board-10-imagine
wave: 1
ollama: false
owns: mind/imagine.mjs, capability/grid-invent.mjs, bench/imagine.mjs, test/imagine.test.mjs, notes/imagine.md, bench/verdicts/imagine.json
task:
GAP: board-10:imagine (kind board item, state/self/gaps.jsonl line 162, since 2026-09-24T06:15:46.366Z; score 0.016667 = distance 1 / 60 trial minutes; distance from no number on the line: the whole bar)
BUILD: finish board-10:imagine of docs/boards/board-10.js, undone (undecidable): bench/verdicts/imagine.json has no barMet, met, met.bar, bar.met or MET verdict word. Its owned files: mind/imagine.mjs, capability/grid-invent.mjs, bench/imagine.mjs, test/imagine.test.mjs, notes/imagine.md, bench/verdicts/imagine.json. Its brief is quoted whole under BRIEF below.
BAR (bench/verdicts/imagine.json): it must write bench/verdicts/imagine.json with isTheBar true and barMet true; the trial that measures it again (the board item's bar command; 60 min) is node bench/imagine.mjs --split training --budget-ms 3000 --workers 2.
Tests: test/imagine.test.mjs.
MODEL OFF.
BRIEF (the original item, whole, from docs/boards/board-10.js):
ITEM imagine (his P14 today, verbatim: "Ai is algorithms. What if this had imagination? Could think outside the box? Could vision? Could create new things that have never been done before"). STATE: mind/dream.mjs (Board 9) generates hypotheses with provenance dream and scores them; genome/spawn.mjs grows regions at ask time through the gate; capability/grid-dsl.mjs holds 196 primitives and grid-search.mjs solves 148 of 400 training tasks at 3000 ms, 236 time out on the clock (the box). BUILD: (a) mind/imagine.mjs: propose(context, budget) returns candidates that are OUTSIDE MEMORY (hypervector distance from every stored item above a floor, and no exact match in memory/knowledge.mjs when it is present) and OUTSIDE THE RECOMBINATION NULL (a null arm at the same budget: random and pairwise recombined candidates from memory), where a candidate is a typed proposal: a new primitive (a composition or a parametrised transform), a new region wiring, a new objective (a hypothesis with a ruler: a suite, a bar and a control) or a code patch for the autopilot; keep(candidate) submits the ones that solved a held-out task to the authority gate; every kept candidate records its novelty distance and the task it solved; (b) capability/grid-invent.mjs: invents primitives from (i) compositions that solved tasks (the depth 2 and 3 solutions) collapsed into one named step, (ii) the timeouts: for a task that timed out, the partial programs with the best pixel agreement, generalised over parameters, become candidate primitives, (iii) imagine.propose over the DSL, and adds the ones that pass a held-out task to the vocabulary at run time; (c) vision: imagine.propose can return an objective; the bench prints how many self-proposed objectives it wrote to state/imagine/objectives.jsonl. BAR: node bench/imagine.mjs --split training --budget-ms 3000 --workers 2 takes the 236 tasks that timed out in bench/verdicts/grid.json (read the ids from it) and prints: solved with invented primitives at the same budget versus solved by the null arm (random compositions at the same budget) versus the fixed vocabulary (0 by construction), primitives invented, primitives kept, mean novelty distance of kept primitives, objectives proposed, ms per task; writes bench/verdicts/imagine.json once. node --test test/imagine.test.mjs (a candidate inside memory is rejected as not novel, a recombination the null reaches is rejected, a planted timeout task is solved by an invented primitive, an objective carries a suite, a bar and a control, nothing enters the vocabulary without a held-out pass) passes and exits; test/grid.test.mjs stays green.

## item gate-slow-test-budget-test-mjs
wave: 1
ollama: false
owns: none named by the gap line
task:
GAP: gate-slow:test/budget.test.mjs (kind gate slow, state/self/gaps.jsonl line 37, since 2026-09-24T21:18:55.119Z; score 0.5 = distance 1 / 2 trial minutes; distance from the line (|distance| / |bar|, capped at 1))
BUILD: fill gate-slow:test/budget.test.mjs (subsystem unmapped): the ledger measured 30574 ms against a bar of 15000 (lower is better, distance -15574) in bench/verdicts/gate.json, from node bench/gate.mjs --quiet; a fill changes no file the gap line names. The ledger's reason: test/budget.test.mjs took 30574 ms in the gate
BAR (bench/verdicts/gate.json): it must reach 15000 ms (lower is better) where the ledger measured 30574; the trial that measures it again (trial.command of test:test/budget.test.mjs, run in the tree; 2 min) is node tools/budget.mjs --ram-mb 6000 --disk-mb 2048 --dir {tmp} -- node --max-old-space-size=6000 --test test/budget.test.mjs.
Tests: test/budget.test.mjs, test/gate.test.mjs.
MODEL OFF.

## item missed-gaps-json
wave: 1
ollama: false
owns: none named by the gap line
task:
GAP: missed:gaps.json (kind missed, state/self/gaps.jsonl line 4, since 2026-09-24T19:40:58.192Z; score 0.5 = distance 1 / 2 trial minutes; distance from no number on the line: the whole bar)
BUILD: fill missed:gaps.json (subsystem unmapped): the ledger measured not measured against a bar of not measured (, distance not measured) in bench/verdicts/gaps.json, from node --max-old-space-size=6000 bench/gaps.mjs; a fill changes no file the gap line names. The ledger's reason: decided by barMet; no registered field holds a number beside this bar
BAR (bench/verdicts/gaps.json): it must write bench/verdicts/gaps.json with isTheBar true and barMet true; the trial that measures it again (trial.command of gaps, run in the tree; 2 min) is node tools/budget.mjs --ram-mb 6000 --disk-mb 100 --dir {tmp} -- node self/gaps.mjs --dry.
Tests: test/boards.test.mjs, test/gaps.test.mjs.
MODEL OFF.

## item gate-slow-test-multiply-test-mjs
wave: 1
ollama: false
owns: daemon/health.mjs, daemon/multiply.mjs, daemon/run.mjs, generations/velocity.mjs
task:
GAP: gate-slow:test/multiply.test.mjs (kind gate slow, state/self/gaps.jsonl line 41, since 2026-09-24T21:18:55.119Z; score 0.464134 = distance 0.928267 / 2 trial minutes; distance from the line (|distance| / |bar|, capped at 1))
BUILD: fill gate-slow:test/multiply.test.mjs (subsystem unmapped): the ledger measured 28924 ms against a bar of 15000 (lower is better, distance -13924) in bench/verdicts/gate.json, from node bench/gate.mjs --quiet; a fill changes daemon/health.mjs, daemon/multiply.mjs, daemon/run.mjs, generations/velocity.mjs. The ledger's reason: test/multiply.test.mjs took 28924 ms in the gate
BAR (bench/verdicts/gate.json): it must reach 15000 ms (lower is better) where the ledger measured 28924; the trial that measures it again (trial.command of test:test/multiply.test.mjs, run in the tree; 2 min) is node tools/budget.mjs --ram-mb 6000 --disk-mb 2048 --dir {tmp} -- node --max-old-space-size=6000 --test test/multiply.test.mjs.
Tests: test/autopilot.test.mjs, test/cloud.test.mjs, test/daemon.test.mjs, test/gate.test.mjs, test/ladder.test.mjs, test/multiply.test.mjs, test/spread.test.mjs, test/velocity.test.mjs, test/web-daemon.test.mjs, test/whole.test.mjs.
MODEL OFF.
