export const meta = {
  name: 'brain-board-10',
  description: 'BOARD 10: budgets, the daemon as a continuous sandboxed service, sharded census and prune, self-compression, cloud container, imagination, multi-draw velocity, autopilot candidates, then the ladder and gate rows',
  phases: [
    { title: 'Build', detail: 'nine builders on disjoint files (Opus 5.5 only, his 21:51 order)' },
    { title: 'Verify', detail: 'Opus 5.5 re-runs each bar and checks file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
    { title: 'Rows', detail: 'one builder adds the ladder and gate rows from the landed verdicts, then verify' },
  ],
}

const ROOT = 'C:\\Users\\ybmic\\Downloads\\claudeskillsvideo-to-website\\brain'
const MARKER = 'C:\\Users\\ybmic\\Downloads\\claudeskillsvideo-to-website\\brain\\state\\board10.marker'
const MODEL_BUILD = 'claude-opus-5-5'
const MODEL_SMALL = 'claude-opus-5-5'
const MODEL_VERIFY = 'claude-opus-5-5'

const STATE_OF_TREE = `STATE OF THE TREE (2026-09-23 evening). Boards 8 and 9 landed today and the gate was GREEN before this board started. Landed and free to read: act/ (solve.mjs exact path, prompt.mjs, spawn.mjs), capability/grid-dsl.mjs and grid-search.mjs (ARC vocabulary 196 primitives, 148 of 400 training tasks at 3000 ms, 236 timed out on the clock, 0 exhausted), generations/velocity.mjs (matrix path 2,173,397 evals/s, exact to 0 mismatches; the best library scores 158/160 on the suite it searched and 110/160 on a fresh draw), world/venue.mjs and generations/venue-suite.mjs (full tape, NULL against the matched control), genome/spawn.mjs (regions grown at ask time through the gate), tools/organism-census.mjs (gen-0: 485,992 lines, 53.51 percent load bearing, 225,923 dead declarations; organism/scale-52000 with 5,125,448 lines reached 62 GB and was stopped: NEVER load that seed whole), self/autopilot.mjs (13/13, 0 candidates on a green tree), bench/public.mjs (write-once journal, --resume), memory/knowledge.mjs and tools/ingest-wiki.mjs (P10), mind/dream.mjs with one idle hook in daemon/run.mjs (P11), world/senses.mjs with world/receptor-*.mjs (P12). The daemon daemon/run.mjs defaults to ledger=full, which once wrote a 1 TB ledger.jsonl; state/soak/snapshot.json is 231 MB of JSON. His orders today (section A, last eight dated bullets): 5 percent every second not daily, self growing self improving self compressing self iterating; lives 24/7 on the cloud, sandboxed; imagination, outside the box, create what has never been done; by the end smarter than the orchestrator, multiplying, duplicating, zero data of his, no subscription.`

const COMMON = `You are one builder on BOARD 10 of the BRAIN project at ${ROOT} (Node 24 only, ESM .mjs, zero npm dependencies, Windows 11, 32 threads, 64 GB RAM, RTX 4070 Ti 12 GB, Ollama at http://localhost:11434 serving qwen3:1.7b and qwen3:30b-a3b; one Ollama is one queue, keep model calls few). The owner's vision is verbatim in brain/MANUAL.md section A (read the last eight dated bullets: today's orders) and section B (objectives P0 to P15 and STATE). ARCHITECTURE.md sections 12 and 13 map every subsystem with a check command; notes/<subsystem>.md explain each one.
${STATE_OF_TREE}
BUDGETS (his PC stalled today at 263 MB free disk and 85 GB committed): every process you launch declares --max-old-space-size of at most 6000 and at most 2 workers; before any bench check free RAM with PowerShell (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory and wait if under 16 GB free; run at most ONE bench process at a time; never load organism/scale-52000 whole; never run a daemon with ledger=full; a bench that will write over 200 MB says so in its note and rotates. Eight builders share this machine.
Your item is ONE of eight on DISJOINT files: touch only the files you own (listed) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/, web/, site/, viz/, organism/, bench/gate.mjs, bench/ladder.mjs (a later stage owns those two). Reading anything is fine.
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, and a one paragraph "statement" in plain prose a reader can check against the fields. (2) A bar file bench/verdicts/<name>.json is written ONCE when the run completes; a narrow or partial run writes <name>-partial.json with "isTheBar": false. (3) Write the verdict and the note the moment the bar is measured, then keep improving. (4) Tests use node:test, exit on their own (no open handles, no servers left listening), finish under 120 s, never process.exit before the write they exist to prove. (5) No em-dashes anywhere in files you write (the gate scans; use a comma or a colon). (6) No dependencies; network only where your item says so; every download lands under bench/fixtures/ with a LICENSE and a SOURCES.md line. (7) Run your bar command yourself and paste its printed lines into your report. (8) A missed bar reported with its measured number is a landing; a number without a print is not; never widen a bar to pass it; never write "cannot be done": write what was measured and what the next rung is. (9) Your final message is read by a machine: fill the schema; notes under 300 words.`

const ITEMS = [
  {
    key: 'budget',
    model: MODEL_BUILD,
    owns: 'tools/budget.mjs (new), bench/budget.mjs (new), test/budget.test.mjs (new), notes/budget.md (new), bench/verdicts/budget.json (new)',
    task: `ITEM budget (the BUDGETS rule in MANUAL.md, born today when a census took 62 GB and a ledger took 1 TB). BUILD tools/budget.mjs, a process budget wrapper: node tools/budget.mjs --ram-mb N --disk-mb N --cpu-s N --dir <watched dir> -- <command and args>. It spawns the child (stdio inherited, exit code passed through), samples every 2 s the child's working set (Windows: PowerShell Get-Process by pid, or the Win32 counters through wmic-free PowerShell; Linux and the container: /proc/<pid>/status VmRSS) and its children, bytes under the watched dir (a stat walk, cached mtimes so it stays cheap), and CPU seconds; prints one status line per minute; kills the whole tree at any cap and prints "BUDGET KILLED <which> <value> over <cap>" with exit code 137; writes a run record to state/budget/last.json (peak RSS, peak dir bytes, CPU seconds, wall, outcome). Also export a library form (budget(cmd, args, caps)) so bin/serve.mjs and benches can use it. BAR: node bench/budget.mjs runs three planted children: one that allocates past a 300 MB RAM cap, one that writes past a 50 MB disk cap into a temp dir, one that finishes under both caps; prints for each the cap, the peak, the outcome and the time to kill after the cap was crossed (must be under 5 s), and writes bench/verdicts/budget.json once. node --test test/budget.test.mjs (kill on RAM, kill on disk, pass-through exit code, no orphan processes after a kill: prove by listing the pid tree) passes and exits.`,
  },
  {
    key: 'daemon',
    model: MODEL_BUILD,
    owns: 'daemon/run.mjs, the ledger module it uses (find it by reading buildWhole and brain.ledger; name it in your report), bench/daemon.mjs (new), test/daemon.test.mjs (new or existing), notes/daemon.md (new), bench/verdicts/daemon.json (new), state/daemon-bar/ (scratch for the bar, deleted after)',
    task: `ITEM daemon (his P5 today: "5 percent every second? Or nanosecond? ... self growing and self improving self compressing self iterating"; and P13: lives 24/7 sandboxed). BUILD, in daemon/run.mjs and the ledger module: (a) ledger=summary is the default; ledger=full requires --ledger-budget-mb N and rotates the file at the budget (keep the last two segments, print bytes written per tick); (b) the continuous loop: with no ask active the daemon runs, per period, a generations step (generations/ through the existing self loop), a dream step (the hook Board 9 placed), a spawn step (genome/spawn.mjs when a suite question had no cell), and a self-code step (self/autopilot.mjs --auto, gated, at most once per M ticks and never while a bench is running); every step is a ledger summary line with its wall ms; (c) the ruler: every checkpoint prints improvement per wall second on the internal suites (bench/answer.mjs draws: algebra, sequence, grid, exact path only) as score now minus score at the last checkpoint over wall seconds, plus a plateau signal (the same rule generations/velocity.mjs uses) that switches the loop from generations to growth (spawn, ingest, dream) when a coordinate stops moving; (d) a checkpoint carries its wall time, tick, suite scores and bytes so the ruler is reproducible from disk. BAR: node bench/daemon.mjs runs the 12 major organism from a fresh build for 6 minutes wall under the caps (ledger=summary, checkpoint every 1000 ticks) and prints: ticks per second, steps run by kind, ledger bytes written per 1000 ticks (must be under 1 MB), checkpoint count and bytes, suite scores at start and end and improvement per wall second, the plateau signal state, then repeats 2 minutes with ledger=full --ledger-budget-mb 50 and proves rotation kept the file under 50 MB. Writes bench/verdicts/daemon.json once. node --test test/daemon.test.mjs (summary default, rotation at the budget, every step kind runs at least once in a short run, self-code refuses while a bench flag is set, the ruler reads back from a checkpoint) passes and exits; test/whole.test.mjs and test/dream.test.mjs stay green.`,
  },
  {
    key: 'census',
    model: MODEL_BUILD,
    owns: 'tools/organism-census.mjs, genome/emit.mjs (only the --prune path), test/census.test.mjs, notes/census.md, bench/verdicts/census-scale.json (new), bench/verdicts/census-prune.json (new), organism/gen-0-pruned/ (new output only)',
    task: `ITEM census (his P8: "make sure the 5 million organism lines u wrote arent empty code, that all of the code is extremely important"). STATE: the gen-0 census landed (53.51 percent load bearing). organism/scale-52000 (manifest 5,125,448 lines) reached 62.01 GB private and was stopped; the record is bench/verdicts/census-scale-52000-stopped-partial.json. BUILD: (a) a sharded mode: --shard-files N loads and drives N generated files at a time against the hosted problems, frees them, and accumulates the tallies, so the whole seed is censused under a RAM cap you print (measure peak RSS per shard with tools/budget.mjs if it has landed, else with PowerShell); (b) the refusal: before any whole load the census estimates RSS from manifest bytes times the measured bytes-per-line ratio of gen-0 and refuses (exit 2, printed reason) when the estimate exceeds half of physical RAM, telling the caller to use --shard-files; (c) genome/emit.mjs --prune <census verdict>: emits a seed with the dead declarations removed (never removes a declaration that ran, fired or delivered, or one a knockout showed to matter) and prints lines before and after. BAR, two commands: node tools/organism-census.mjs --seed organism/scale-52000 --shard-files 4 --ticks 20 under an 8 GB cap prints the full-seed tally (lines loaded, load-bearing share, dead declarations, cells ran, edges delivered, peak RSS per shard, wall) and writes bench/verdicts/census-scale.json once; then node genome/emit.mjs --prune bench/verdicts/census.json --out organism/gen-0-pruned followed by a census of organism/gen-0-pruned --ticks 200 prints lines before and after, load-bearing share before and after (must rise), the algebra and sequence task scores before and after (must not fall), and writes bench/verdicts/census-prune.json once. node --test test/census.test.mjs (sharded tallies equal whole tallies on a tiny seed, the refusal fires on a planted manifest, prune never removes a running declaration) passes and exits.`,
  },
  {
    key: 'compress',
    model: MODEL_BUILD,
    owns: 'the checkpoint writer and reader (brain.snapshot and restoreWhole: find the files by reading daemon/run.mjs imports; name them; touch only the snapshot format code), core/pack.mjs (new, packed bipolar hypervectors), bench/compress.mjs (new), test/compress.test.mjs (new), notes/compress.md (new), bench/verdicts/compress.json (new)',
    task: `ITEM compress (his P5 today: "self compressing"). STATE: state/soak/snapshot.json is 231 MB of JSON for one organism; hypervectors are 8192 lanes bipolar (core/simd.mjs) and are stored as JSON arrays of numbers; a bipolar vector packs to 1024 bytes. BUILD: (a) core/pack.mjs: pack and unpack bipolar and ternary hypervectors to bit-packed buffers, exact round trip, with a checksum; (b) a checkpoint format version 2: a binary section for every hypervector, edges and cell state as typed arrays, a small JSON header; the reader restores version 1 and version 2; the writer emits version 2; (c) the ruler: bytes per score point = checkpoint bytes divided by the summed suite score (bench/answer.mjs draws, exact path) printed at every checkpoint alongside generated lines and cells, and written into the checkpoint header so the daemon ruler can read it. BAR: node bench/compress.mjs builds the 12 major organism, runs 2000 ticks, writes a version 1 and a version 2 checkpoint, prints bytes of each, the ratio, write and restore ms, proves the restored organism answers the three suites identically (same outputs, tick for tick, on a 200 tick replay), prints bytes per score point for both, and writes bench/verdicts/compress.json once. node --test test/compress.test.mjs (pack round trip exact for 1000 random vectors, version 1 still restores, version 2 restore equals the live organism on a replay, a corrupted section is refused with its checksum) passes and exits; test/whole.test.mjs stays green.`,
  },
  {
    key: 'cloud',
    model: MODEL_BUILD,
    owns: 'Dockerfile (new), compose.yaml (new), .dockerignore (new), bin/serve.mjs (new), daemon/health.mjs (new), tools/deploy-host.mjs (new), docs/CLOUD.md (new, the one docs file this item may write), bench/cloud.mjs (new), test/cloud.test.mjs (new), notes/cloud.md (new), bench/verdicts/cloud.json (new)',
    task: `ITEM cloud (his P13 today, verbatim: "It should live 24/7 on the cloud remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE"; and P15: "multiplying, duplicating, all within cloud with zero data on my part"). BUILD: (a) Dockerfile on node:24-slim, no npm install (zero dependencies), copies the tree minus organism/scale-* and state/, runs as a non-root user, read-only root filesystem except /state (a volume), memory and cpu limits in compose.yaml (512 MB RAM cap for the 12 major organism, 1 CPU), restart: always, no secrets (a test greps the image context for key patterns), an egress allowlist documented in compose.yaml as an extra_hosts plus a fetch guard in bin/serve.mjs (the only hosts: the venue feed host from world/policy.json, the model endpoint, the checkpoint store; everything else refused and logged); (b) bin/serve.mjs, the container entry: starts daemon/run.mjs (ledger=summary, checkpoint every N ticks, resume from /state) under the budget caps (use tools/budget.mjs if present, else its own sampler), restarts it from the last checkpoint on any exit and prints the restart count, starts daemon/health.mjs, and runs bench/ladder.mjs --log once a day at 04:00 container time; (c) daemon/health.mjs: HTTP on a port from env, GET /health returns JSON read from disk only (uptime, restarts, tick, checkpoint age seconds, checkpoint bytes, the last ladder row, native share if bench/verdicts/ladder.json has it) and GET /duplicate?seed=N copies the last checkpoint to /state/dup-N so a second container can start from it (multiplying: the ruler is instances alive, read from a small /state/instances.json each serve.mjs writes on start and on every minute); (d) tools/deploy-host.mjs <user@host>: one command he runs from his PC: packs the tree with tar over ssh (no key handling of ours; his ssh agent does it), runs docker compose up -d --build on the host, waits for /health, prints the health JSON. BAR: node bench/cloud.mjs: if docker is installed here, builds the image and runs the container for 5 minutes with the caps, kills the daemon process inside once, and prints: image bytes, RSS peak, restart count 1, health JSON before and after, checkpoint age, instances alive after a /duplicate and a second container from the copy, egress test (a fetch to an allowed host succeeds or is refused for the documented reason; a fetch to example.com is refused); if docker is absent here (say so in the verdict, isTheBar false, name the field), runs bin/serve.mjs natively for 5 minutes with the same kills and prints the same rows. node --test test/cloud.test.mjs (serve restarts a killed child from the checkpoint, health reads only from disk, the fetch guard refuses a host not on the list, no secret pattern in the build context, the duplicate endpoint copies a checkpoint) passes and exits.`,
  },
  {
    key: 'imagine',
    model: MODEL_BUILD,
    owns: 'mind/imagine.mjs (new), capability/grid-invent.mjs (new), bench/imagine.mjs (new), test/imagine.test.mjs (new), notes/imagine.md (new), bench/verdicts/imagine.json (new)',
    task: `ITEM imagine (his P14 today, verbatim: "Ai is algorithms. What if this had imagination? Could think outside the box? Could vision? Could create new things that have never been done before"). STATE: mind/dream.mjs (Board 9) generates hypotheses with provenance dream and scores them; genome/spawn.mjs grows regions at ask time through the gate; capability/grid-dsl.mjs holds 196 primitives and grid-search.mjs solves 148 of 400 training tasks at 3000 ms, 236 time out on the clock (the box). BUILD: (a) mind/imagine.mjs: propose(context, budget) returns candidates that are OUTSIDE MEMORY (hypervector distance from every stored item above a floor, and no exact match in memory/knowledge.mjs when it is present) and OUTSIDE THE RECOMBINATION NULL (a null arm at the same budget: random and pairwise recombined candidates from memory), where a candidate is a typed proposal: a new primitive (a composition or a parametrised transform), a new region wiring, a new objective (a hypothesis with a ruler: a suite, a bar and a control) or a code patch for the autopilot; keep(candidate) submits the ones that solved a held-out task to the authority gate; every kept candidate records its novelty distance and the task it solved; (b) capability/grid-invent.mjs: invents primitives from (i) compositions that solved tasks (the depth 2 and 3 solutions) collapsed into one named step, (ii) the timeouts: for a task that timed out, the partial programs with the best pixel agreement, generalised over parameters, become candidate primitives, (iii) imagine.propose over the DSL, and adds the ones that pass a held-out task to the vocabulary at run time; (c) vision: imagine.propose can return an objective; the bench prints how many self-proposed objectives it wrote to state/imagine/objectives.jsonl. BAR: node bench/imagine.mjs --split training --budget-ms 3000 --workers 2 takes the 236 tasks that timed out in bench/verdicts/grid.json (read the ids from it) and prints: solved with invented primitives at the same budget versus solved by the null arm (random compositions at the same budget) versus the fixed vocabulary (0 by construction), primitives invented, primitives kept, mean novelty distance of kept primitives, objectives proposed, ms per task; writes bench/verdicts/imagine.json once. node --test test/imagine.test.mjs (a candidate inside memory is rejected as not novel, a recombination the null reaches is rejected, a planted timeout task is solved by an invented primitive, an objective carries a suite, a bar and a control, nothing enters the vocabulary without a held-out pass) passes and exits; test/grid.test.mjs stays green.`,
  },
  {
    key: 'velocity',
    model: MODEL_SMALL,
    owns: 'generations/velocity.mjs (only the objective), bench/velocity.mjs (only the new printed rows), test/velocity.test.mjs, notes/velocity.md, bench/verdicts/velocity-heldout.json (new)',
    task: `ITEM velocity (the open item from Board 8, his P5: peak efficiency). STATE: the best library solves 158/160 on the suite it was searched on and 110/160 on a fresh draw (seed grid/velocity:heldout); the objective is single draw. BUILD: a multi-draw objective: fitness is the mean over K draws of the suite (K printed, seeds derived from the run seed), with the plateau rule unchanged; keep the matrix path exact (the exactness check must still print 0 mismatches). BAR: node bench/velocity.mjs --draws 4 prints, for K=1 and K=4, the searched-suite score and the fresh-draw score (the same seed grid/velocity:heldout), evals per second on the matrix path, generations to plateau, and writes bench/verdicts/velocity-heldout.json once (the fresh-draw score at K=4 must be above the K=1 fresh-draw score, or the verdict says by how much it is not). node --test test/velocity.test.mjs passes and exits.`,
  },
  {
    key: 'autopilot',
    model: MODEL_BUILD,
    owns: 'self/autopilot.mjs, bench/autopilot.mjs, test/autopilot.test.mjs, notes/autopilot.md, tools/authorship.mjs (new), bench/verdicts/authorship.json (new), state/self/authored.jsonl (new, written by the autopilot)',
    task: `ITEM autopilot (his P15 today, verbatim: "I wouldnt even need to pay $100 claude subscription anymore"; the ruler in section B: the share of landed changes authored by the organism). STATE: self/autopilot.mjs applies self-code candidates with no human, gates, reverts on red; on the real tree it finds 0 candidates (40 mutants, 0 survived). BUILD: (a) candidate sources beyond mutants: the census dead share (bench/verdicts/census.json: a dead declaration is a prune candidate), the failing or slow rows of the last gate run (bench/verdicts/last-run.json or wherever the gate writes it), the notes/*.md "open" sections (a planted grammar: a line starting with "OPEN:" is a candidate), and mind/imagine.mjs propose() when that file exists (a code patch candidate); each candidate carries its source; (a2) the PATCH AUTHOR for a candidate that needs new code is a model cell on open weights (qwen3:30b-a3b through Ollama at http://localhost:11434 here; the endpoint and model name from env in the container), asked with the candidate, the file, its tests and the OPEN line, returning a unified diff the autopilot applies and gates; NEVER a Claude or Anthropic call (his 18:12 line: it should work without the orchestrator very soon); print patches proposed and kept per source and the model ms per patch; (b) every kept patch appends a line to state/self/authored.jsonl (at, files, source, gate hash before and after); (c) tools/authorship.mjs prints the share: kept patches by the organism over kept patches plus files landed by boards (read docs/BOARDS.json, which the orchestrator maintains: an array of {board, at, files}), per week and cumulative, and writes bench/verdicts/authorship.json once per run. BAR: node bench/autopilot.mjs (the existing 13 checks stay) plus a real-tree pass: node bin/brain.mjs self-code --auto --dry --json prints candidates per source (must be above 0 in total now), and one wet pass on a planted repository copy keeps at least one candidate from a non-mutant source with the gate green; then node tools/authorship.mjs prints the share with its numerator and denominator. Writes bench/verdicts/autopilot.json once (overwrites the Board 8 bar with the new rows, say so in the statement) and bench/verdicts/authorship.json once. node --test test/autopilot.test.mjs (each source yields a candidate on a planted tree, authored.jsonl grows only on a kept patch, the share arithmetic) passes and exits; test/self-code.test.mjs and test/cli.test.mjs stay green.`,
  },
  {
    key: 'recall',
    model: MODEL_SMALL,
    owns: 'act/prompt.mjs (only the memory recall step), bench/recall.mjs (new), test/recall.test.mjs (new), notes/recall.md (new), bench/verdicts/recall.json (new)',
    task: `ITEM recall (his P4 native share and P10: the knowledge tier landed but the ask path never calls it). STATE: memory/knowledge.mjs (Board 9) holds 284,749 Simple English Wikipedia articles and 1,911,943 facts with recall(query) under 10 ms and provenance memory; act/prompt.mjs runs the ask path (exact first, memory second, model cells third) and its memory step reads only the organism's own tiers. BUILD: wire KnowledgeStore.recall into the memory step of act/prompt.mjs so a question the exact path cannot answer is tried against the knowledge tier before any model cell, with provenance memory and the article title in the answer record, and a confidence floor below which the model cell is still asked; open the store lazily and only when bench/fixtures/wiki has been ingested (state path from notes/knowledge.md), never at import. BAR: node bench/recall.mjs draws 200 held-out wiki questions by seed (the rule in notes/knowledge.md) and 200 questions from the algebra and sequence suites, runs the ask path with the tier on and off, and prints per set: answered natively (provenance exact or memory) share, accuracy, mean microseconds for native answers, model calls made; the native share on the wiki questions must rise with the tier on and the suite accuracy must not fall; writes bench/verdicts/recall.json once. node --test test/recall.test.mjs (a planted fact is answered from memory with provenance memory and title, a question below the floor falls through to the model cell, the store is not opened when the fixture is absent) passes and exits; test/act-prompt.test.mjs and test/solve.test.mjs stay green.`,
  },
]

const ROWS_ITEM = {
  key: 'rows',
  owns: 'bench/ladder.mjs, bench/gate.mjs (only new rows and their tests), test/ladder.test.mjs, test/gate.test.mjs (if it exists), notes/ladder.md, bench/verdicts/ladder.json (rewritten by a run)',
  task: `ITEM rows (his P4 and P15: the ladder prints three shares and the frontier bar; the gate prints budgets, compression and his-data rows). BUILD in bench/ladder.mjs: per public set the accuracy row against the published rows kept in each verdict; three answer classes with their shares and latencies: model (seconds), native (provenance exact or memory, microseconds), direct (one hypervector lookup, nanoseconds; read the ns per cell run and per packet hop the browser organism measured, cite the verdict file); the frontier row as the "smarter than the orchestrator" bar (add a Fable 5.1 row ONLY if a published source with a URL is in brain/research/published.json; otherwise print "no published row"); instances alive (from /state/instances.json or bench/verdicts/cloud.json); the authored share (bench/verdicts/authorship.json); bytes per score point (bench/verdicts/compress.json and the last checkpoint header); improvement per wall second (the last daemon checkpoint). BUILD in bench/gate.mjs three rows: BUDGET (every bench in the gate ran under tools/budget.mjs caps, peak RSS and dir bytes printed, red if any kill), COMPRESS (bytes per score point at this checkpoint against the last recorded one, red if it rose while the score did not), HIS DATA (bytes of the owner's data in the tree = 0: every file under bench/fixtures/ is covered by a SOURCES.md line with a licence, red otherwise). BAR: node bench/ladder.mjs prints the new columns for the three sets from the verdicts on disk (partial where only partial verdicts exist, and says so) and writes bench/verdicts/ladder.json; node bench/gate.mjs runs to completion GREEN with the three new rows printed. node --test test/ladder.test.mjs passes and exits.`,
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
    downloads: { type: 'string', description: 'url, bytes, licence of anything downloaded, or none' },
    open: { type: 'string', description: 'what is not done or suspicious, under 300 words' },
  },
  required: ['landed', 'barMet', 'files', 'barCommand', 'printed', 'verdictFile', 'testsCommand', 'testsPrinted', 'peakRssMb', 'downloads', 'open'],
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
      const alias = opts.model.includes('opus') ? 'opus' : 'sonnet'
      log(`${opts.label}: model ${opts.model} rejected (${msg.slice(0, 100)}); retrying with alias ${alias}`)
      try { return await agent(prompt, { ...opts, model: alias }) } catch (e2) { log(`${opts.label}: failed again: ${String(e2 && e2.message || e2).slice(0, 160)}`); return null }
    }
    log(`${opts && opts.label}: agent error: ${msg.slice(0, 160)}`)
    return null
  }
}

const buildPrompt = it => `${COMMON}\n\nFILES YOU OWN: ${it.owns}\n\n${it.task}\n\nWhen done, fill the schema. "printed" must be pasted from your terminal, not typed from memory. barMet is true only if your verdict file says isTheBar true.`
const verifyPrompt = (it, built, board) => `You are the verify plane for item "${it.key}" of ${board} in ${ROOT}. You are a skeptic: the builder's report is a claim, not a fact. The builder owns ONLY: ${it.owns}. Marker file (created before the board started): ${MARKER}. BUDGETS: check free RAM before re-running a bench and wait if under 16 GB free; --max-old-space-size at most 6000; never load organism/scale-52000 whole (the sharded census is allowed).
BUILDER'S REPORT (JSON): ${JSON.stringify(built).slice(0, 6000)}
DO, in order, and paste the printed tallies: (1) re-run the builder's tests command; (2) re-run the bar command (if it takes over 15 minutes, run the smallest form it documents and say so); (3) open the verdict file and check that every number in its "statement" exists in its fields and matches what the bar printed within run-to-run noise (a stochastic bench may differ; a deterministic one must not), and that barMet in the report agrees with isTheBar in the file; (4) list files under ${ROOT} newer than the marker (PowerShell: Get-ChildItem -Recurse -File | Where-Object { $_.LastWriteTime -gt (Get-Item '${MARKER}').LastWriteTime }) excluding organism/ outputs, state/, bench/verdicts/, bench/fixtures/, notes/ and test/ files named for this item, and report any outside the owned set as strayFiles (other items of this board build in parallel on their own owned files: a file owned by another item is a note not a blocker; name it anyway; MANUAL.md and docs/LOG.md are the orchestrator's); (5) grep the builder's files for an em-dash character, for a process.exit before a write, and for a listener or handle left open; (6) judge: pass is true only if the tests pass, the bar command runs to completion, the verdict matches the print, the report's barMet matches the file, and no stray file is this builder's. A missed bar reported honestly is a pass; a claimed number you could not reproduce is a blocker. Do not edit any file. Under 300 words in findings.`
const fixPrompt = (it, built, verdict) => `${COMMON}\n\nFILES YOU OWN: ${it.owns}\n\nYou are the FIX stage for item "${it.key}". The builder reported: ${JSON.stringify(built).slice(0, 4000)}\nThe verify plane FAILED it with: ${JSON.stringify(verdict).slice(0, 4000)}\nOriginal task, for the bar and the intent:\n${it.task}\n\nFix at cause (not by widening the bar or skipping a test), re-run the tests and the bar yourself, rewrite the verdict from the new run, and fill the schema. If a stray file of yours was named, restore it and say so.`

const summarise = (r) => {
  const final = r.fixed || r.built
  const v = r.verify2 || r.verify
  return {
    key: r.key,
    landed: !!(final && final.landed),
    barMet: !!(final && final.barMet),
    verified: !!(v && v.pass),
    verdictFile: final ? final.verdictFile : null,
    files: final ? final.files : [],
    peakRssMb: final ? final.peakRssMb : null,
    downloads: final ? String(final.downloads).slice(0, 300) : '',
    printed: final ? String(final.printed).slice(0, 700) : '',
    open: final ? String(final.open).slice(0, 500) : 'no report',
    blockers: v ? v.findings.filter(f => f.severity !== 'note').map(f => `${f.severity}: ${f.what} @ ${f.where}`).slice(0, 6) : ['no verify'],
    strayFiles: v ? v.strayFiles : [],
  }
}

async function buildVerifyFix(it, board) {
  const built = await run(buildPrompt(it), { label: `build:${it.key}`, phase: 'Build', model: it.model || MODEL_BUILD, schema: BUILD_SCHEMA })
  if (!built) { log(`${it.key}: builder returned nothing`); return { key: it.key, built: null, verify: null, fixed: null, verify2: null } }
  log(`${it.key}: built landed=${built.landed} barMet=${built.barMet} peakRss=${built.peakRssMb} MB; verifying`)
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
const first = (await pipeline(ITEMS, it => buildVerifyFix(it, 'BOARD 10'))).filter(Boolean).map(summarise)
log(`nine items done: ${first.filter(r => r.verified).length} verified, ${first.filter(r => r.barMet).length} bars met`)

// Barrier justified: the rows item reads every landed verdict's field names.
phase('Rows')
const landedList = first.map(r => `${r.key}: landed=${r.landed} barMet=${r.barMet} verified=${r.verified} verdict=${r.verdictFile} open=${String(r.open).slice(0, 240)}`).join('\n')
const rowsItem = { ...ROWS_ITEM, task: `${ROWS_ITEM.task}\n\nWHAT THE EIGHT ITEMS LANDED (read each verdict file for its fields; a missing or partial verdict is printed as such, never invented):\n${landedList}` }
const rows = summarise(await buildVerifyFix(rowsItem, 'BOARD 10 rows stage'))

return { items: first, rows }
