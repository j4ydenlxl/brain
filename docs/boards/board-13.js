export const meta = {
  name: 'board-13-ceiling',
  description: 'BOARD 13 THE CEILING: every item finds where improvement stops and moves it: the 0.4 s plateau of organism-years, the 3 s clock that times out 80 percent of grid tasks, the token cap that hands math its gain, held-out code only, a leak-free direct table, a dated live view on the site, an exit for the venue edge, then a contamination row on the gate',
  phases: [
    { title: 'Build', detail: 'seven builders on disjoint files (Opus 5.5 only, his 21:51 order); two wait for the Ollama queue' },
    { title: 'Verify', detail: 'Opus 5.5 re-runs each bar and checks file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
    { title: 'Rows', detail: 'one builder adds the CLIMB deltas and the plateau block to the ladder and the CONTAMINATION row to the gate, then verify' },
  ],
}

const ROOT = 'C:\\Users\\ybmic\\Downloads\\claudeskillsvideo-to-website\\brain'
const MARKER = 'C:\\Users\\ybmic\\Downloads\\claudeskillsvideo-to-website\\brain\\state\\board13.marker'
const MODEL_BUILD = 'claude-opus-5-5'
const MODEL_VERIFY = 'claude-opus-5-5'

const BOARD12 = (args && args.board12) || 'Board 12 result not supplied to this script: read the last six lines of docs/LOG.md and every notes/*.md written in the last two days before you start.'

const STATE_OF_TREE = `STATE OF THE TREE (2026-09-24 and after). Boards 8 to 12 landed and the gate was GREEN before this board started. Board 12, in the orchestrator's words: ${BOARD12}
Board 11 THE CLIMB landed on 2026-09-24 (18 Opus 5.5 agents, 7 of 7 items verified, 6 bars met, 1 missed honestly). What it measured: MATH (reason/math.mjs, program of thought with an exact executor): on 200 GSM8K records with qwen3:1.7b, k=5 with verify 90.00 percent [85.06, 93.43] against the model alone 82.00 percent [76.09, 86.71], McNemar p 0.0041, bar MISSED because the intervals overlap; and the finding that matters: 17 of the 20 paired wins are records where the model alone gave NO number because it hit the 3000-token cap, only 3 are wrong numbers a program fixed, so the gain is the token budget, not the arithmetic; the development records were TEST records (no train split on disk), so they are contaminated for any held-out claim and the public chain must exclude them. CODE (reason/synth.mjs, sample k, tests from the docstring, repair): HumanEval development records 0 to 39 on qwen3:1.7b: k=5+repair 36 of 40 = 90.00 percent against alone 26 of 40 = 65.00 percent, McNemar p 0.0063; on qwen3:30b-a3b 14 against 13 of 15; the smoke on records 40 to 160 (held out) printed organism 16 of 23 against alone 10 of 23. NATIVE (memory/direct.mjs, the DIRECT class): 122 of 200 held-out wiki questions answered with no model call (61.0 percent), 176 direct hits at 42 ns median per hit, 15 ns per miss, suite tally unchanged 724 of 725; caveat: the direct table was filled by sweeping all 284,749 titles, the drawn ones included, so it is memoisation of the tier, not knowledge earned by asking; the control table with the drawn titles left out still answered 122 of 200 through the tier (with 0 direct hits). ARC (capability/grid-library.mjs, library learning and a learned search order): 73 against 71 of 400 evaluation tasks within 2 attempts at a 3 s clock, noise 0 over two control runs; 319 of 400 tasks TIME OUT, 7 are found but wrong, 1 macro learned and 0 used in a right answer; the gain comes from the learned search order in the last 25 percent of the clock. YEARS (generations/years.mjs): 716,457 organism-years in 300 s at 2,388 generations per second; grid held-out 49 to 148 with growth on (140.5 score per million organism-years) and 49 to 109 with growth off; the FIRST PLATEAU IS AT 0.400 s on both planes: after 0.4 s the score does not move for the remaining 299.6 s; the 'above zero' bar is weak (one gained task passes it). VENUE (world/venue.mjs, sensors from the tape): evolved entries beat the age control by 0.161 units of size [0.129, 0.194], win rate 45.98 percent against 34.27 percent, payable violations 0 of 8,466, but every holdout trip loses 9.54 percent after the 4.54 percent fee (5.11 percent before it): an edge, not a profit; the fee is borrowed from pump.fun. SITE (web/ladder.mjs): dilation.dev/ladder renders 722 numbers each traced to a verdict field; the live view always reads 'daemon not running' because no daemon sits behind the site. PUBLIC (bench/public.mjs): ask() now routes math-shaped and code-shaped prompts to the regions; smokes GSM8K 27 of 30 against 26, HumanEval 23 of 30 against 14; the whole-set chain (GSM8K 1319 on 1.7b, then HumanEval 161, then GSM8K on 30b) was launched DETACHED with --resume and journals to bench/verdicts/public/; at 1.45 tasks per minute GSM8K alone is about 15 hours; its 'capped' counts in the two smoke partials are invalid (region tokens summed over calls) and later rows carry capped null. Reconciled by the orchestrator at the checkpoint: test/recall.test.mjs pins 'model+memory'; test/native.test.mjs counts model calls relative to the math-region ask; bench/ladder.mjs reads ANSWER_PROVENANCE (which lists 'direct'). His orders (section A, 2026-09-23): 400B-level reasoning and code, then significantly better; billions of years in seconds; smarter than the orchestrator; multiplying; no subscription; never stop; match what he says.`

const COMMON = `You are one builder on BOARD 13 of the BRAIN project at ${ROOT} (Node 24 only, ESM .mjs, zero npm dependencies, Windows 11, 32 threads, 64 GB RAM, RTX 4070 Ti 12 GB, Ollama at http://localhost:11434 serving qwen3:1.7b and qwen3:30b-a3b; ONE OLLAMA IS ONE QUEUE: Board 11's detached public chain may still own it; an item that calls the model says in its verdict that latencies were measured on a shared queue, and an item marked model-off never opens the socket). The owner's vision is verbatim in brain/MANUAL.md section A (read the last twelve dated bullets: his orders of 2026-09-23) and section B (objectives P0 to P15 and STATE). ARCHITECTURE.md sections 12 and 13 map every subsystem with a check command; notes/<subsystem>.md explain each one.
${STATE_OF_TREE}
BUDGETS (his PC stalled on 2026-09-23 at 263 MB free disk and 85 GB committed): launch every bench through node tools/budget.mjs --ram-mb 6000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=6000 ...; at most 2 workers; before any bench check free RAM with PowerShell (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory and wait if under 16 GB free; run at most ONE bench process at a time; never load organism/scale-52000 whole; never run a daemon with ledger=full; total bench wall time for your item under 4 hours; a bench that will write over 200 MB says so in its note and rotates. Seven builders share this machine with a detached public run.
Your item is ONE of seven on DISJOINT files: touch only the files you own (listed) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/, web/ (except the live item), site/, organism/, bench/gate.mjs, bench/ladder.mjs (a later stage owns those two). Reading anything is fine. The tree is a git repository: never commit, never run git write commands; the orchestrator commits at the checkpoint.
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, a "split" object naming what was development and what was held out (and "contaminated": true with the reason when a held-out record was ever seen in development), and a one paragraph "statement" in plain prose a reader can check against the fields. (2) A bar file bench/verdicts/<name>.json is written ONCE when the run completes; a narrow or partial run writes <name>-partial.json with "isTheBar": false. (3) Write the verdict and the note the moment the bar is measured, then keep improving. (4) Tests use node:test, exit on their own, finish under 120 s, never process.exit before the write they exist to prove, never call Ollama (mock the model cell), and never post a typed-array view to a worker without ownBytes() (runtime/protocol.mjs). (5) No em-dashes anywhere in files you write (the gate scans; use a comma or a colon). (6) No dependencies; network only where your item says so; never create an account or enter a credential anywhere. (7) Run your bar command yourself and paste its printed lines into your report. (8) A missed bar reported with its measured number is a landing; a number without a print is not; never widen a bar to pass it; never write "cannot be done": write what was measured and what the next rung is. (9) A CONTROL for every claim: the same seeds with the intervention off, and the seed-to-seed noise printed before any gap is called real. (10) Your final message is read by a machine: fill the schema; notes under 300 words.`

const ITEMS = [
  {
    key: 'plateau',
    owns: 'generations/plateau.mjs (new), generations/velocity.mjs (the objective, the archive descriptors and the restart schedule only), generations/archive.mjs, bench/plateau.mjs (new), test/plateau.test.mjs (new), notes/plateau.md (new), bench/verdicts/plateau.json (new)',
    task: `ITEM plateau (P5 "billions of years in seconds", and the finding that after 0.400 s nothing improves for 299.6 s). BUILD: (a) MEASURE the plateau exactly: score against organism-years at 0.1 s resolution over 120 s on five seeds for both planes (grid held-out and synthetic fresh draw), printing per seed the plateau second (first second after which the score never rises again), the score there, and the seed-to-seed noise of the final score; (b) THREE INTERVENTIONS, each against the plain control on the same seeds: NOVELTY (MAP-Elites archive dimensions from behaviour descriptors of the program, so the search keeps cells that behave differently even when they score the same), TRANSFER (elites from the synthetic plane injected into the grid plane's population at each generation and back, the descriptor-matched ones only), RESTART (when the score has not risen for N seconds, the population is re-seeded from the archive's most distant cells; N a flag); (c) the combination that the three single runs say is best, run once more on five fresh seeds nobody tuned on. BAR (bench/plateau.mjs, bench/verdicts/plateau.json): per intervention and per plane, the held-out score at 120 s against the control's, the score gained per million organism-years AFTER the control's plateau second (the control gains zero there by definition), the plateau second under the intervention, all with the five-seed noise. Bar met when the best combination on the fresh seeds beats the control's final score by more than the seed-to-seed noise on BOTH planes and moves the plateau second later. A combination that does not is printed as such with its numbers. Tests: the plateau detector on a synthetic curve; the descriptor is deterministic; a restart re-seeds from the archive and never from the current elite.`,
  },
  {
    key: 'clock',
    owns: 'capability/grid-search.mjs, capability/grid-library.mjs, capability/grid-invent.mjs (only if the invented primitives need a switch), bench/grid.mjs (a --clock flag and a --primitives flag), test/grid-clock.test.mjs (new), notes/grid.md, bench/verdicts/grid-clock.json (new), bench/verdicts/grid-clock-whole.json (new)',
    task: `ITEM clock (P4 the ARC rung: 73 of 400 with 319 TIMEOUTS at a 3 s clock; Icecuber 17 percent with a hand DSL and no time cap; the frontier 97.5). The binding constraint is the clock, not the vocabulary. BUILD: (a) the SOLVE CURVE against clock: a seeded 100-task slice of the evaluation set at 3, 10, 30 and 100 s per task, four arms: fixed vocabulary; library on; library plus Board 10's invented primitives (capability/grid-invent.mjs, 5 kept); library plus invented plus a learned search order; print solved, timed out, found-but-wrong, mean ms to the first answer, per arm per clock; (b) the FOUND-BUT-WRONG seven: print each one's program, what it produced, and whether a second candidate ranked below would have been right (a ranking problem or a vocabulary problem: say which); (c) the WHOLE 400 once, at the clock the curve says pays most solved per second of wall under a 2 h cap per arm, best arm against the fixed-vocabulary control at the same clock, two control runs for noise. BAR (grid-clock.json for the curve, grid-clock-whole.json for the whole set): bar met when the whole-400 solved count beats the control at the same clock by more than the two-run noise AND beats 73 (the 3 s result) by more than noise; print the arithmetic. Timeouts are the constraint: the note says how many remain at the chosen clock and what the next rung is (a smarter search, not a longer clock). Tests: the clock flag is honoured within 5 percent; the curve JSON has every arm at every clock; the found-but-wrong report lists exactly the wrong ones.`,
  },
  {
    key: 'math',
    ollama: true,
    owns: 'reason/math.mjs, reason/solved.mjs (new: a memory of solved programs), bench/math.mjs, test/math.test.mjs, test/solved.test.mjs (new), notes/math.md, bench/verdicts/math.json (rewritten by the run; copy the Board 11 file to math-board11.json first), bench/verdicts/math-30b.json (new)',
    task: `ITEM math (P4 the 405B row 96.8 on GSM8K; Board 11 printed 90.00 against 82.00 on 1.7b with 17 of 20 wins coming from the token cap). WAITS FOR THE QUEUE: before any model call, check bench/verdicts/public/ for a journal modified in the last 3 minutes; if one is, the public chain owns Ollama: build and test with the mocked model, write a -partial from the tests, and say in your report that the bar was not run (the orchestrator resumes you later); never start a model run beside the chain. BUILD: (a) the FAIR ALONE arm: the model alone at the same 3000-token cap AND at 8192 tokens, so the gain of the program-of-thought path is decomposed into budget and arithmetic (print both gaps); (b) SOLVED-PROGRAM RETRIEVAL (reason/solved.mjs): every verified program is stored with its question's hypervector; a new question retrieves the k nearest solved programs as worked examples in its prompt (a memory the organism earned, not a train-split leak: the store is filled ONLY by the development records, the held-out slice never enters it); (c) SELF-CONSISTENCY across k=10 programs with the executor's answers voted and the verify step on the majority; (d) the 30b model on the same 200 development records, both arms. BAR (math.json on 1.7b, math-30b.json on 30b): the 200 development records (they are TEST records: the verdict's split says contaminated for any held-out claim and names the public chain's held-out journal as the only clean number); bar met on either model when organism minus alone-at-8192 has separated 95 percent intervals, with the budget-vs-arithmetic decomposition printed. Print ms per record and calls per record; the ladder's 405B row is compared only by the public chain, never here.`,
  },
  {
    key: 'code',
    ollama: true,
    owns: 'reason/synth.mjs, bench/synth.mjs, test/synth.test.mjs, notes/synth.md, bench/verdicts/synth.json (rewritten by the run; copy the Board 11 file to synth-board11.json first), bench/verdicts/synth-heldout.json (new), bench/verdicts/synth/ (journals)',
    task: `ITEM code (P4 the frontier rows 94.5 and 99.3 on HumanEval; Board 11 printed 90.00 against 65.00 on the 40 development records and 16 of 23 against 10 of 23 on a held-out smoke). WAITS FOR THE QUEUE exactly as the math item does (check bench/verdicts/public/ for a journal modified in the last 3 minutes; if so, mock and -partial). BUILD: (a) TEST VALIDITY: the tests the organism writes from the docstring are graded against the gold solution on the development records (a test that fails the gold solution is invalid); print the validity rate and drop invalid tests before they filter candidates; (b) k=10 with repair on the held-out records 40 to 160 (121 records), never touched in development; (c) the 30b model on the held-out slice, one arm each (organism, alone); (d) the repair loop bounded by a call budget, with calls per record printed. BAR (synth-heldout.json): held-out pass@1 organism against alone on 1.7b with 95 percent intervals and the exact McNemar, and the same on 30b; bar met when the intervals separate on either model; print test validity before and after the filter, calls per record, ms per record. The development file synth.json is rewritten from the same run's development slice with split named.`,
  },
  {
    key: 'direct',
    owns: 'memory/direct.mjs, act/prompt.mjs (the direct-table fill path only), cells/basic.mjs (memory.assoc count cap to a byte budget only), bench/native.mjs (a --fill-from-asks mode and a --model-off flag), test/direct-clean.test.mjs (new), notes/native.md, bench/verdicts/direct-clean.json (new)',
    task: `ITEM direct (P10 knowledge earned, not memoised; P15 the ns class). Board 11 filled the direct table by sweeping every title, the drawn ones included: a memoisation of the tier. BUILD, MODEL OFF (the bench never opens the Ollama socket: a miss is a miss): (a) FILL FROM ASKS: the table starts empty and fills only from questions the organism has answered through the tier, in a warm-up draw of N questions from a seed different from the held-out draw; then the held-out 200 are asked; print recall@1 with no model call, direct hits, hits that were correct, ns per hit and per miss, against the swept table (Board 11's number, re-run here) and against null; (b) the GROWTH CURVE: recall on the held-out 200 as the warm-up grows 0, 1k, 10k, 100k asks, printed; (c) the assoc cap in cells/basic.mjs (4096 entries) becomes a byte budget with eviction by least recent hit, and the suite tally (724 of 725) is re-run to show it did not move; (d) a leak check: the held-out titles must not appear in the warm-up draw (assert it, print the overlap count, 0). BAR (direct-clean.json): the leak-free recall printed beside the swept one and null; the growth curve; the suite tally; ns within noise of Board 11's 42 ns. Bar met when the leak-free table's recall at 100k warm-up asks is above null by separated intervals and the suite tally is unchanged; recall below the swept number is expected and printed, not hidden. Tests: fill-from-asks never inserts a question it did not answer; eviction by bytes; the overlap assertion fails on a planted overlap.`,
  },
  {
    key: 'live',
    owns: 'web/live.mjs (new), web/build.mjs (the live.json step only), web/src/hud.js and web/src/index.html (the live view only), daemon/health.mjs (a CORS header only), tools/deploy.mjs (the snapshot step only), test/web-live.test.mjs (new), notes/web.md, bench/verdicts/live.json (new)',
    task: `ITEM live (P15 "all in the cloud"; the site's live view always says "daemon not running"). BUILD: (a) a DATED SNAPSHOT: at every build, web/live.mjs reads the newest state directory's checkpoint header and health (ticks, generations, organism-years by the years arithmetic, instances alive, elites, authored share, last checkpoint time, gate line) and writes web/dist/live.json; the page renders it labelled "as of <time>, from the last checkpoint on the builder's machine", every number traced to its file and field, and NEVER as live; when no state exists the page says "no checkpoint" and nothing else; (b) a REAL /health when one is reachable: the page first tries a same-origin /health (web/serve.mjs proxies it locally), then a configured remote URL with the CORS header daemon/health.mjs now sends; when neither answers within 2 s it shows the snapshot; (c) the HOST TABLE: measure, from documentation only and with no account created and no credential entered, which zero-cost hosts run a Node process 24 hours a day under 512 MB with a public URL (the container from Board 10: Dockerfile, compose.yaml, bin/serve.mjs), printing per host: allowed or not, RAM, hours per month, sleep policy, source URL, date read; if a host is already logged in on this machine (check the CLIs on PATH: vercel is, and vercel cannot run a daemon), say so; the deploy of the daemon itself is the orchestrator's call, never yours. BAR (live.json): the built page's live block with its numbers traced (the walk tool web/ladder-walk.mjs can be reused), the health fallback proven both ways through the real health.mjs in a test, the host table. Bar met when the deployed-shape page shows a dated snapshot with 0 untraced numbers and the fallback test passes; a remote /health reachable from the page is a MET+ and not required.`,
  },
  {
    key: 'exit',
    owns: 'world/venue.mjs (the exit rules only), generations/venue-suite.mjs, bench/venue.mjs (an --exit flag), test/venue-exit.test.mjs (new), notes/venue.md, bench/verdicts/venue-exit.json (new)',
    task: `ITEM exit (the venue edge is not a profit: entries beat the age control by 0.161 units of size, yet every holdout trip loses 9.54 percent after the 4.54 percent fee). The entry is decided; the lever left is the EXIT. BUILD on the tapes on disk only (no network, no live venue): (a) EXIT RULES evolved beside the entries: a trailing stop in units of the size the entry sensors read, a time stop, a target, and the take-the-whole-tape control (hold to the end, which is Board 11's exit), each a gene; (b) the DEVELOPMENT search on the 2,126 train instruments and the HOLDOUT grade on the 713, printing net per trip AFTER the fee for evolved entries with evolved exits, evolved entries with the hold-to-end exit, age-control entries with evolved exits, and both controls; (c) the FEE: the 4.54 percent is pump.fun's measured round trip (memory: trader curve fee bar); print the net at 2 percent and 1 percent as well, labelled hypothetical, so the reader sees what fee the edge would need; (d) the tail: the share of net carried by the top 5 percent of trips, printed (Board 11: 41.87 percent). BAR (venue-exit.json): bar met when evolved exits on the holdout turn the net per trip after the 4.54 percent fee positive with a 95 percent interval above zero; NULL honest (still negative) is a landing with the fee at which it would turn positive printed. Never quote a P&L without the fee and the interval; the trader package is frozen: read its verdict files, never its code paths.`,
  },
]

const ROWS_ITEM = {
  key: 'rows',
  owns: 'bench/ladder.mjs, bench/gate.mjs (only the CONTAMINATION row and its tests), test/ladder.test.mjs, test/gate*.test.mjs, notes/ladder.md, bench/verdicts/ladder.json (rewritten by a run), bench/verdicts/rows.json (new)',
  task: `ITEM rows. BUILD in bench/ladder.mjs: a CLIMB block per public set (this board's whole-set number against the previous board's, the delta with both intervals, "not measured" or "partial" when a verdict is missing or partial, never a zero for a missing number), a PLATEAU block (plateau second and score gained after it, from plateau.json), a CLOCK block (solved against clock from grid-clock.json and the whole-400 count), a DIRECT block that now prints the leak-free recall beside the swept one (direct-clean.json). BUILD in bench/gate.mjs: a CONTAMINATION row: every bench/verdicts/*.json with isTheBar true must carry a split object; RED when a bar file's held-out record was seen in development (contaminated true) and its statement does not say so, or when a bar file has no split at all; print the count of bar files, with split, contaminated and labelled, contaminated and unlabelled. BAR (bench/verdicts/rows.json): node bench/ladder.mjs prints the new blocks from the verdicts on disk (paste them); node bench/gate.mjs runs to completion under the budget and prints every row including CONTAMINATION (paste the row lines and the GATE line); the ladder and gate tests pass. Bar met when the gate is GREEN with the new row printed; a RED row is printed honestly with its cause and the bar is missed, not widened: older bar files without a split are listed by name so the orchestrator can decide.`,
}

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    landed: { type: 'boolean' },
    barMet: { type: 'boolean', description: 'true only if the verdict file carries isTheBar true; a -partial verdict means false' },
    files: { type: 'array', items: { type: 'string' } },
    barCommand: { type: 'string' },
    printed: { type: 'string', description: 'the key printed lines of the bar command, verbatim, under 1200 chars' },
    verdictFile: { type: 'string' },
    testsCommand: { type: 'string' },
    testsPrinted: { type: 'string' },
    peakRssMb: { type: 'number', description: 'the largest working set any process of yours reached, as printed' },
    waitedForQueue: { type: 'boolean', description: 'true if the bar was not run because the public chain owned Ollama' },
    open: { type: 'string', description: 'what is not done or suspicious, under 300 words' },
  },
  required: ['landed', 'barMet', 'files', 'barCommand', 'printed', 'verdictFile', 'testsCommand', 'testsPrinted', 'peakRssMb', 'waitedForQueue', 'open'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    reran: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['blocker', 'defect', 'note'] }, what: { type: 'string' }, where: { type: 'string' } }, required: ['severity', 'what', 'where'] } },
    strayFiles: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'reran', 'findings', 'strayFiles'],
}

async function run(prompt, opts) {
  try { return await agent(prompt, opts) } catch (e) {
    const msg = String((e && e.message) || e)
    if (/model/i.test(msg) && opts && opts.model) {
      log(`${opts.label}: model ${opts.model} rejected (${msg.slice(0, 100)}); retrying with alias opus`)
      try { return await agent(prompt, { ...opts, model: 'opus' }) } catch (e2) { log(`${opts.label}: failed again: ${String(e2 && e2.message || e2).slice(0, 160)}`); return null }
    }
    log(`${opts && opts.label}: agent error: ${msg.slice(0, 160)}`)
    return null
  }
}

const buildPrompt = it => `${COMMON}\n\nFILES YOU OWN: ${it.owns}\n\n${it.task}\n\nWhen done, fill the schema. "printed" must be pasted from your terminal, not typed from memory. barMet is true only if your verdict file says isTheBar true.`
const verifyPrompt = (it, built, board) => `You are the verify plane for item "${it.key}" of ${board} in ${ROOT}. You are a skeptic: the builder's report is a claim, not a fact. The builder owns ONLY: ${it.owns}. Marker file (created before the board started): ${MARKER}. BUDGETS: check free RAM before re-running a bench and wait if under 16 GB free; run benches through tools/budget.mjs --ram-mb 6000; never load organism/scale-52000 whole; Ollama is one shared queue: if bench/verdicts/public/ has a journal modified in the last 3 minutes, do not start a model run; a latency that differs from the builder's is noise, a count or accuracy that differs by more than the interval is not. The tree is a git repository: never run a git write command.
BUILDER'S REPORT (JSON): ${JSON.stringify(built).slice(0, 6000)}
DO, in order, and paste the printed tallies: (1) re-run the builder's tests command; (2) re-run the bar command (if it takes over 15 minutes, run the smallest form it documents and say so; if the builder reported waitedForQueue true, check that its -partial file says so and that no model run was started); (3) open the verdict file and check that every number in its "statement" exists in its fields and matches what the bar printed within run-to-run noise (a stochastic bench may differ; a deterministic one must not), that it carries a split object, and that barMet in the report agrees with isTheBar in the file; (4) list files under ${ROOT} newer than the marker (PowerShell: Get-ChildItem -Recurse -File | Where-Object { $_.LastWriteTime -gt (Get-Item '${MARKER}').LastWriteTime }) excluding .git/, organism/ outputs, state/, bench/verdicts/, bench/fixtures/, web/dist/, notes/ and test/ files named for this item, and report any outside the owned set as strayFiles (other items of this board build in parallel on their own owned files: a file owned by another item is a note not a blocker; name it anyway; MANUAL.md and docs/LOG.md are the orchestrator's); (5) grep the builder's files for an em-dash character, for a process.exit before a write, for a postMessage of a typed-array view without ownBytes, for a claim without its control, and for a listener or handle left open; (6) judge: pass is true only if the tests pass, the bar command runs to completion (or the queue wait is documented), the verdict matches the print, the report's barMet matches the file, and no stray file is this builder's. A missed bar reported honestly is a pass; a claimed number you could not reproduce is a blocker. Do not edit any file. Under 300 words in findings.`
const fixPrompt = (it, built, verdict) => `${COMMON}\n\nFILES YOU OWN: ${it.owns}\n\nYou are the FIX stage for item "${it.key}". The builder reported: ${JSON.stringify(built).slice(0, 4000)}\nThe verify plane FAILED it with: ${JSON.stringify(verdict).slice(0, 4000)}\nOriginal task, for the bar and the intent:\n${it.task}\n\nFix every blocker and defect on the files you own, re-run the tests and the bar, rewrite the verdict from the new run (a bar file is written once by a completed run; if you must re-measure, the new run's file replaces it and says so in "at"), and fill the schema with what your terminal printed.`

const summarise = (r) => {
  const final = r.fixed || r.built
  const v = r.verify2 || r.verify
  return {
    key: r.key,
    landed: !!(final && final.landed),
    barMet: !!(final && final.barMet),
    verified: !!(v && v.pass),
    waitedForQueue: !!(final && final.waitedForQueue),
    verdictFile: final ? final.verdictFile : null,
    files: final ? final.files : [],
    peakRssMb: final ? final.peakRssMb : null,
    printed: final ? String(final.printed).slice(0, 700) : '',
    open: final ? String(final.open).slice(0, 500) : 'no report',
    blockers: v ? v.findings.filter(f => f.severity !== 'note').map(f => `${f.severity}: ${f.what} @ ${f.where}`).slice(0, 6) : ['no verify'],
    strayFiles: v ? v.strayFiles : [],
  }
}

async function buildVerifyFix(it, board) {
  const built = await run(buildPrompt(it), { label: `build:${it.key}`, phase: 'Build', model: it.model || MODEL_BUILD, schema: BUILD_SCHEMA })
  if (!built) { log(`${it.key}: builder returned nothing`); return { key: it.key, built: null, verify: null, fixed: null, verify2: null } }
  log(`${it.key}: built landed=${built.landed} barMet=${built.barMet} waitedForQueue=${built.waitedForQueue} peakRss=${built.peakRssMb} MB; verifying`)
  const verify = await run(verifyPrompt(it, built, board), { label: `verify:${it.key}`, phase: 'Verify', model: MODEL_VERIFY, schema: VERIFY_SCHEMA })
  if (!verify) return { key: it.key, built, verify: null, fixed: null, verify2: null }
  if (verify.pass) { log(`${it.key}: VERIFIED`); return { key: it.key, built, verify, fixed: null, verify2: null } }
  log(`${it.key}: verify FAILED (${verify.findings.filter(f => f.severity === 'blocker').length} blockers); fixing`)
  const fixed = await run(fixPrompt(it, built, verify), { label: `fix:${it.key}`, phase: 'Fix', model: MODEL_BUILD, schema: BUILD_SCHEMA })
  if (!fixed) return { key: it.key, built, verify, fixed: null, verify2: null }
  const verify2 = await run(verifyPrompt(it, fixed, board), { label: `verify2:${it.key}`, phase: 'Fix', model: MODEL_VERIFY, schema: VERIFY_SCHEMA })
  log(`${it.key}: after fix verify=${verify2 ? verify2.pass : 'null'}`)
  return { key: it.key, built, verify, fixed, verify2 }
}

phase('Build')
// args.skip names items deferred to a later launch (Ollama is one queue: while the public chain runs, 'math' and 'code' wait). A resume with skip emptied re-runs only the skipped items and the rows stage.
const SKIP = new Set((args && Array.isArray(args.skip)) ? args.skip : [])
const active = ITEMS.filter(it => !SKIP.has(it.key))
if (SKIP.size) log(`skipped this launch (deferred, not dropped): ${[...SKIP].join(', ')}`)
const first = (await pipeline(active, it => buildVerifyFix(it, 'BOARD 13'))).filter(Boolean).map(summarise)
log(`${active.length} items done: ${first.filter(r => r.verified).length} verified, ${first.filter(r => r.barMet).length} bars met, ${first.filter(r => r.waitedForQueue).length} waited for the queue`)

// Barrier justified: the rows item reads every landed verdict's field names.
phase('Rows')
const landedList = first.map(r => `${r.key}: landed=${r.landed} barMet=${r.barMet} verified=${r.verified} waitedForQueue=${r.waitedForQueue} verdict=${r.verdictFile} open=${String(r.open).slice(0, 240)}`).join('\n')
const rowsItem = { ...ROWS_ITEM, task: `${ROWS_ITEM.task}\n\nWHAT THE ITEMS LANDED (read each verdict file for its fields; a missing or partial verdict is printed as such, never invented):\n${landedList}` }
const rows = summarise(await buildVerifyFix(rowsItem, 'BOARD 13 rows stage'))

return { items: first, rows }
