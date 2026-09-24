export const meta = {
  name: 'board-12-self',
  description: 'BOARD 12 SELF: multiplying instances with shared elites, the 5.1M-line seed censused and pruned, checkpoint deltas and packed hypervectors, the worker-boundary audit, the organism authoring its own patches on open weights, the whole English Wikipedia ingested, then the ladder and gate rows',
  phases: [
    { title: 'Build', detail: 'six builders on disjoint files (Opus 5.5 only, his 21:51 order)' },
    { title: 'Verify', detail: 'Opus 5.5 re-runs each bar and checks file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
    { title: 'Rows', detail: 'one builder adds the multiply and authorship rows to the ladder and the gate from the landed verdicts, then verify' },
  ],
}

const ROOT = 'C:\\Users\\ybmic\\Downloads\\claudeskillsvideo-to-website\\brain'
const MARKER = 'C:\\Users\\ybmic\\Downloads\\claudeskillsvideo-to-website\\brain\\state\\board12.marker'
const MODEL_BUILD = 'claude-opus-5-5'
const MODEL_VERIFY = 'claude-opus-5-5'

const BOARD11 = (args && args.board11) || 'Board 11 result not supplied to this script: read the last four lines of docs/LOG.md and every notes/*.md written today before you start.'

const STATE_OF_TREE = `STATE OF THE TREE (2026-09-24). Boards 8 to 11 landed and the gate was GREEN before this board started. Board 11, in the orchestrator's words: ${BOARD11}
Board 10 landed on 2026-09-24 (all verified): tools/budget.mjs (a process-tree budget: RAM, disk and CPU caps, kills the whole tree within 3 s of the cap; the gate now runs every test file under it at 6000 MB), daemon/run.mjs (57,000 ticks in 364 s at 157 ticks/s with generations, dream, spawn, ingest and self-code steps per tick at idle; ledger=summary under 4 KB per 1000 ticks; 59 checkpoints of about 69 MB each, 2.2 GB written in six minutes: that is the compression problem), core/ledger.mjs (rotation under a byte budget), core/pack.mjs and core/persist.mjs (a binary checkpoint container v2, only 1.036x smaller than JSON; replay identity 0 of 200 mismatches after two fixes), Dockerfile, compose.yaml, bin/serve.mjs, daemon/health.mjs, tools/deploy-host.mjs (Docker is ABSENT on this machine, so the container ran natively: killed at t=14097, restarted from its checkpoint in 10.7 s; /health, /duplicate?seed=N copies the checkpoint to dup-N; an egress allowlist; no secrets), mind/imagine.mjs and capability/grid-invent.mjs (on the 236 training grid tasks the fixed vocabulary times out on, invented primitives solved 6 against 3 for the recombination null; 5 primitives kept through the gate), generations/velocity.mjs (the objective is now the mean over K fresh draws: K=1 gives 158/160 searched and 109/160 held-out), self/autopilot.mjs and tools/authorship.mjs (73 candidates on the real tree from notes 44, census 23, slow 4, imagine 2; 2 KEPT with the gate GREEN; a per-run memo; a bench flag so the daemon refuses self-code while a bench runs), act/prompt.mjs recall (the ask path answers 88 percent of held-out wiki questions natively at 8.9 ms with the tier on, 0 with it off), tools/organism-census.mjs (the sharded census REFUSED organism/scale-52000: an exact shard must load its backward cone, 410,718 of 416,000 cells at a 132-tick horizon, about 43.5 GB per shard; the gen-0 seed pruned to organism/gen-0-pruned: 259,943 lines, 37,533 cells, 100 percent ran, 100 percent of edges delivered), bench/ladder.mjs (three classes per set: model in seconds, native in microseconds, direct in nanoseconds; the frontier rows inside each verdict), bench/gate.mjs (BUDGET, COMPRESS and HIS DATA rows; COMPRESS GREEN at 275,022 bytes per score point against 701,874 before). A runtime defect found by the new budget row and fixed the same night: posting a hypervector view (an 8192-byte Int8Array on core/simd.mjs's 514.7 MB WebAssembly heap) to a worker copied the whole heap; runtime/protocol.mjs ownBytes() now sends only the view's bytes (runtime/cluster.mjs injectMany and runtime/shard.mjs flushCross); ELEVEN other files start workers or post messages and were NOT audited: bench/imagine.mjs, bench/public.mjs, bench/grid.mjs, bench/live-shards.mjs, daemon/run.mjs, daemon/generations-worker.mjs, generations/velocity.mjs, generations/worker.mjs, generations/evaluate.mjs, act/run.mjs, tools/ingest-wiki.mjs. His orders (section A, 2026-09-23): smarter than the orchestrator, multiplying, duplicating, all in the cloud with zero data of his, no subscription; it should work without the orchestrator very soon; know everything that exists or existed; self growing, self improving, self compressing, self iterating; billions of years in seconds; never stop tonight.`

const COMMON = `You are one builder on BOARD 12 of the BRAIN project at ${ROOT} (Node 24 only, ESM .mjs, zero npm dependencies, Windows 11, 32 threads, 64 GB RAM, RTX 4070 Ti 12 GB, Ollama at http://localhost:11434 serving qwen3:1.7b and qwen3:30b-a3b; ONE OLLAMA IS ONE QUEUE and the detached public runs of Board 11 may be using it: keep model calls few and say in your verdict that latencies were measured on a shared queue). The owner's vision is verbatim in brain/MANUAL.md section A (read the last twelve dated bullets: his orders of 2026-09-23) and section B (objectives P0 to P15 and STATE). ARCHITECTURE.md sections 12 and 13 map every subsystem with a check command; notes/<subsystem>.md explain each one.
${STATE_OF_TREE}
BUDGETS (his PC stalled on 2026-09-23 at 263 MB free disk and 85 GB committed): launch every bench through node tools/budget.mjs --ram-mb 6000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=6000 ...; at most 2 workers; before any bench check free RAM with PowerShell (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory and wait if under 16 GB free; run at most ONE bench process at a time; never load organism/scale-52000 whole; never run a daemon with ledger=full; a bench that will write over 200 MB says so in its note and rotates. Six builders share this machine.
Your item is ONE of six on DISJOINT files: touch only the files you own (listed) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/, web/, site/, organism/ (except the emitted seed your item names), bench/gate.mjs, bench/ladder.mjs (a later stage owns those two). Reading anything is fine.
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, and a one paragraph "statement" in plain prose a reader can check against the fields. (2) A bar file bench/verdicts/<name>.json is written ONCE when the run completes; a narrow or partial run writes <name>-partial.json with "isTheBar": false. (3) Write the verdict and the note the moment the bar is measured, then keep improving. (4) Tests use node:test, exit on their own (no open handles, no servers left listening), finish under 120 s, never process.exit before the write they exist to prove, never call Ollama (mock the model cell), and never post a hypervector view to a worker without ownBytes(). (5) No em-dashes anywhere in files you write (the gate scans; use a comma or a colon). (6) No dependencies; network only where your item says so; every download lands under bench/fixtures/ with a LICENSE and a SOURCES.md line. (7) Run your bar command yourself and paste its printed lines into your report. (8) A missed bar reported with its measured number is a landing; a number without a print is not; never widen a bar to pass it; never write "cannot be done": write what was measured and what the next rung is. (9) Your final message is read by a machine: fill the schema; notes under 300 words.`

const ITEMS = [
  {
    key: 'multiply',
    owns: 'daemon/multiply.mjs (new), daemon/run.mjs and daemon/health.mjs (the elite exchange hook and the instances fields only), bin/serve.mjs (the /duplicate route only if it must change), bench/multiply.mjs (new), test/multiply.test.mjs (new), notes/multiply.md (new), bench/verdicts/multiply.json (new)',
    task: `ITEM multiply (P15 MULTIPLYING, his words: "multiplying, duplicating, all within cloud"). Today /duplicate?seed=N copies a checkpoint to dup-N and nothing runs it. BUILD daemon/multiply.mjs: (a) DUPLICATE: an instance spawns a second instance from its latest checkpoint with a different seed (a child process of daemon/run.mjs under tools/budget.mjs caps, its own state directory, its own health port), and a third the same way; (b) ELITE EXCHANGE: each instance writes its plane elites (the MAP-Elites archive generations/archive.mjs keeps) to a shared elite store directory at every checkpoint and reads the others' at every checkpoint, keeping the best per cell of the archive across the population (an instance's own elite is replaced only by a strictly better one, with the source instance recorded); (c) the health endpoint of each instance prints instances alive, its instance id, duplications made, elites imported and exported; (d) a supervisor that restarts a dead instance from its own last checkpoint (Board 10's supervisor pattern in bin/serve.mjs). BAR (bench/multiply.mjs): run ONE instance alone for 240 wall seconds and a POPULATION of 3 instances for 240 wall seconds each (the three run together; total RAM under 6000 MB across the tree: shrink the organism per instance if needed and say so), same seeds of the fresh-draw grid suite (velocity.mjs's held-out draws), printing per arm: the best fresh-draw score at the end, evaluations, elites imported and exported, duplications, instances alive at the end, and RSS; then kill one instance of the population at 120 s and print that it came back from its checkpoint. Bar met when best-of-population at 240 s is at or above the single instance at 240 s on the fresh-draw score AND the killed instance came back. A population that does no better is printed as such. Tests: duplicate produces a distinct seed and state dir; the elite store keeps the better of two; a dead instance restarts; ownBytes() on every worker boundary you add.`,
  },
  {
    key: 'scale',
    owns: 'tools/organism-census.mjs (a static and a sampled mode), genome/emit.mjs (--prune from a static census), organism/scale-52000-pruned/ (new, emitted), test/census-static.test.mjs (new), notes/census.md, bench/verdicts/census-scale-static.json (new), bench/verdicts/census-scale-pruned.json (new)',
    task: `ITEM scale (P8 "make sure the 5 million organism lines arent empty code"). The exact sharded census refused organism/scale-52000 (5,125,448 lines) because an exact shard must load its 43 GB backward cone. FIND THE WAY (never "cannot be done"): (a) a STATIC census that never loads the organism: stream every emitted file line by line under a fixed RAM (a few hundred MB), build the reachability of declared cells from the drive cells through the edge lists (a forward closure over cell ids on disk, in passes if it must), and print per file and in total: declarations, cells reachable from a drive cell, edges whose both ends are reachable, dead declarations, the load-bearing share by the static rule, RAM peak and seconds; (b) a SAMPLED dynamic census: 2 percent of cells drawn by seed, each with its backward cone at a SHORT horizon (16 ticks), run exactly, printing the ran and fired shares with a 95 percent interval, as a check that the static rule agrees with the dynamic one on the sample (print both shares side by side); (c) emit --prune organism/scale-52000 into organism/scale-52000-pruned from the static dead set (the same rule that pruned gen-0), and run the EXACT sharded census on the pruned seed under the 8000 MB cap if its estimate fits, else the static census again with the dead share printed. BAR: census-scale-static.json prints the 5,125,448-line seed's load-bearing share with its arithmetic (isTheBar true when the whole seed was walked), census-scale-pruned.json prints the pruned seed's line count and dead share (isTheBar true when the whole pruned seed was censused by any mode that walked all of it). Disk: the pruned seed may be up to 5 GB; say the bytes. Tests: the static closure on a toy organism of 30 cells with 6 dead ones; the sampled mode's interval; the prune drops exactly the static dead set.`,
  },
  {
    key: 'delta',
    owns: 'core/persist.mjs (delta checkpoints), core/pack.mjs (packed hypervectors), core/checkpoint-delta.mjs (new), bench/compress.mjs, test/compress.test.mjs, test/delta.test.mjs (new), notes/compress.md, bench/verdicts/compress.json (rewritten by the run; copy the Board 10 file to compress-board10.json first)',
    task: `ITEM delta (P5 SELF-COMPRESSING: "self compressing self iterating"). Today the daemon writes a 69 MB checkpoint every few seconds (2.2 GB in six minutes) and the binary container is only 1.036x smaller than JSON. BUILD two things. (a) DELTA CHECKPOINTS: core/checkpoint-delta.mjs writes only what changed since the last full checkpoint (cells whose state or weights moved, edges added, removed or reweighted, memory entries added), with a full checkpoint every N deltas (a flag, default 20) and a chain header so restore replays full plus deltas; restore identity is proven by a 200-tick lockstep replay against the live organism (0 mismatches, the compress bench's method). (b) PACKED HYPERVECTORS: every stored hypervector is 8192 int8 lanes today; bipolar vectors pack to 1 bit per lane (1024 bytes, 8x) and the tiers that only compare by Hamming distance can read the packed form directly; pack on write, unpack only where a lane value is needed; print the bytes before and after and the recall of the tiers before and after (the same held-out draw bench/knowledge.mjs uses; recall must not move). BAR (bench/compress.mjs, bench/verdicts/compress.json): the daemon's checkpoint bytes per tick over a 60 s run with deltas against Board 10's full checkpoints (both measured in this run), the ratio printed; bytes per score point (the gate's COMPRESS row) must fall while the score holds; replay identity 0 of 200. Bar met when checkpoint bytes per tick fall by at least 5x with identity intact and tier recall unchanged. Tests: a delta chain restores to the full state; a corrupted delta is refused with the last good full kept; pack and unpack round trip; Hamming on packed equals Hamming on unpacked.`,
  },
  {
    key: 'boundary',
    owns: 'runtime/protocol.mjs (ownBytes only), the eleven files named in the state paragraph (ONLY the lines that post or send data to a worker: bench/imagine.mjs, bench/public.mjs, bench/grid.mjs, bench/live-shards.mjs, daemon/run.mjs, daemon/generations-worker.mjs, generations/velocity.mjs, generations/worker.mjs, generations/evaluate.mjs, act/run.mjs, tools/ingest-wiki.mjs), tools/boundary-audit.mjs (new), test/boundary.test.mjs (new), notes/boundary.md (new), bench/verdicts/boundary.json (new)',
    task: `ITEM boundary (the BUDGETS rule, and the defect the budget row found tonight: a posted view copies its whole 514.7 MB WebAssembly heap). BUILD tools/boundary-audit.mjs: (a) STATIC: find every postMessage, workerData, transferList and structured-clone boundary in the tree (worker_threads and child_process send), list the file and line and what expression crosses; (b) DYNAMIC: a probe that wraps the boundary in a test harness and measures the serialized bytes of each message (the size of the buffers a structured clone would copy: walk the value, sum every ArrayBuffer backing store reached, count a view on a larger non-shared buffer as its whole buffer), asserting no single message carries more than a declared cap (default 16 MB) and no view on the wasm heap crosses unpacked; (c) FIX every boundary that fails by routing through ownBytes() (runtime/protocol.mjs) or a SharedArrayBuffer, touching only the crossing lines; (d) a gate-shaped test that fails when a new boundary is added without being listed in the audit's allowlist with its measured bytes. BAR (bench/verdicts/boundary.json): the audit's table (boundaries found, bytes per message before and after per boundary, fixed count), and the tests of every touched file re-run (paste the tallies: node --test on each touched file's test). Bar met when every boundary's largest message is under the cap and the touched tests pass. Tests: the byte walker on a view, a shared buffer, a nested object; the audit finds a planted boundary.`,
  },
  {
    key: 'authored',
    owns: 'self/autopilot.mjs, self/propose.mjs, self/apply.mjs, self/trial.mjs, tools/authorship.mjs, daemon/run.mjs (the self-code step only, coordinate with the multiply item by touching only the self-code lines), bench/autopilot.mjs, test/autopilot.test.mjs, test/autopilot-plant.mjs, notes/autopilot.md, bench/verdicts/autopilot.json (rewritten; copy the Board 10 file to autopilot-board10.json first), bench/verdicts/authorship.json (new)',
    task: `ITEM authored (P15 NO SUBSCRIPTION, his words: "It should be able to work without you very soon"; "I wouldnt even need to pay $100 claude subscription anymore"). Today the autopilot keeps deterministic candidates (2 kept on the real tree) and the patch author on open weights (qwen3:30b-a3b through Ollama, never a Claude call) exists but has authored 0 landed changes. BUILD: (a) the PATCH AUTHOR LOOP on the real tree: for each candidate source (census dead share, red or slow gate rows, the OPEN lines in notes/*.md, imagination proposals), the open-weights model cell writes a patch against the named file with the candidate's evidence in its prompt, the trial applies it in a copied tree, runs the touched tests and the gate rows, and keeps it only on GREEN with a measured output changed (the census, a verdict field, a test count); every kept patch is committed to the tree with an authorship line "authored by organism (qwen3:30b-a3b) from <source>" in the note the tool writes; (b) tools/authorship.mjs prints the AUTHORED SHARE: landed changes this week by author class (board builders from docs/BOARDS.json, orchestrator, organism), the share authored by the organism, patches proposed and kept per source per day, days since the last board; (c) the daemon's self-code step calls this loop at idle with a budget of model calls per hour (a flag) and refuses while a bench flag is set (Board 10's state/bench-flags). BAR (bench/autopilot.mjs and bench/verdicts/authorship.json): run the loop on the real tree for at most 60 minutes of wall time with qwen3:30b-a3b (the queue is shared: say so), printing candidates per source, patches proposed, trials run, kept, reverted, the gate result after each kept patch, the authored share line; the Board 10 checks (21 of 21) must still pass first. Bar met when at least ONE patch authored by the open-weights model is KEPT on the real tree with the gate GREEN and a measured output changed; zero kept, printed with every trial's reason, is a landing (rule 8). Never let the loop edit a test file, MANUAL.md, docs/ or bench/gate.mjs; never widen a bar.`,
  },
  {
    key: 'enwiki',
    owns: 'tools/ingest-wiki.mjs (the flags and the streaming path), memory/knowledge.mjs (only if the tier needs a disk-backed segment to hold 6.9M articles under the RAM cap), bench/knowledge.mjs (an --source flag), test/knowledge-en.test.mjs (new), notes/knowledge.md, bench/fixtures/wiki/ (the English dump, its LICENSE and SOURCES.md line), bench/verdicts/knowledge-en.json (new)',
    task: `ITEM enwiki (P10, his words: "should know everything that exists or existed. Dont be lazy. Dont say it cant be done. It can."). Today the tier holds the Simple English Wikipedia (284,749 articles at 407 memory bytes and 1,365 disk bytes per article, ingested at 3,950 articles/s). BUILD the same for the whole English Wikipedia: (a) DOWNLOAD https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles-multistream.xml.bz2 (about 22 GB, CC BY-SA 4.0) into bench/fixtures/wiki with a LICENSE and a SOURCES.md line (url, bytes, sha256 prefix, licence), streaming to disk, resumable (a Range header from the bytes already on disk), printing MB per second; if the connection cannot finish in 90 minutes, stop at the byte budget you set and ingest what is on disk (a complete bz2 prefix is readable stream by stream: say how many articles that was); (b) INGEST under tools/budget.mjs --ram-mb 6000: the tier must hold about 6.9M articles, so memory bytes per article must fall or the tier must spill to a disk segment (an append-only fact file with an in-memory index of packed keys), the ingest rate printed every 100k articles; (c) BREADTH: articles held over articles in the source; RECALL: 200 held-out first sentences drawn by seed from the ENGLISH set asked through ask() (the Board 11 native path) against a no-memory null, recall@1 and @5, mean microseconds per native answer; and the Simple English bar re-run to show it did not regress. BAR (bench/verdicts/knowledge-en.json): breadth at or above 0.99 of what was downloaded, recall printed against null, RAM peak under 6000 MB, disk bytes per article printed. Bar met when the whole dump is ingested with breadth at or above 0.99 and recall@1 beats null; a partial download is -partial with the article count. Disk: 22 GB of dump plus the tier: say the bytes in the note.`,
  },
]

const ROWS_ITEM = {
  key: 'rows',
  owns: 'bench/ladder.mjs, bench/gate.mjs (only new rows and their tests), test/ladder.test.mjs, test/gate*.test.mjs, notes/ladder.md, bench/verdicts/ladder.json (rewritten by a run), bench/verdicts/rows.json (new)',
  task: `ITEM rows (P15's four rulers on the ladder; P8 on the gate). BUILD in bench/ladder.mjs: a MULTIPLYING block (instances alive, duplications, best-of-population against single-instance, from multiply.json), an AUTHORED block (the authored share, patches proposed and kept per source per day, days since the last board, from authorship.json), a KNOWLEDGE block (articles held per source, breadth, recall against null, from knowledge.json and knowledge-en.json), each printing "not measured" for a missing verdict and "partial" for a -partial one, never a zero for a missing number. BUILD in bench/gate.mjs: a LOAD-BEARING row (the dead share of every emitted seed from the census verdicts on disk; RED when a seed the daemon loads has a dead share above 10 percent, or when any seed has no census at all), a BOUNDARY row (from boundary.json: RED when any boundary exceeds the cap or a boundary is unlisted). BAR (bench/verdicts/rows.json): node bench/ladder.mjs prints the new blocks from the verdicts on disk (paste them), node bench/gate.mjs runs to completion under the budget and prints every row (paste the row lines and the GATE line); the ladder and gate tests pass. Bar met when the gate is GREEN with the new rows printed; a RED row is printed honestly with its cause and the bar is missed, not widened.`,
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
      log(`${opts.label}: model ${opts.model} rejected (${msg.slice(0, 100)}); retrying with alias opus`)
      try { return await agent(prompt, { ...opts, model: 'opus' }) } catch (e2) { log(`${opts.label}: failed again: ${String(e2 && e2.message || e2).slice(0, 160)}`); return null }
    }
    log(`${opts && opts.label}: agent error: ${msg.slice(0, 160)}`)
    return null
  }
}

const buildPrompt = it => `${COMMON}\n\nFILES YOU OWN: ${it.owns}\n\n${it.task}\n\nWhen done, fill the schema. "printed" must be pasted from your terminal, not typed from memory. barMet is true only if your verdict file says isTheBar true.`
const verifyPrompt = (it, built, board) => `You are the verify plane for item "${it.key}" of ${board} in ${ROOT}. You are a skeptic: the builder's report is a claim, not a fact. The builder owns ONLY: ${it.owns}. Marker file (created before the board started): ${MARKER}. BUDGETS: check free RAM before re-running a bench and wait if under 16 GB free; run benches through tools/budget.mjs --ram-mb 6000; never load organism/scale-52000 whole; Ollama is one shared queue, so a latency that differs from the builder's is noise, a count or accuracy that differs by more than the interval is not.
BUILDER'S REPORT (JSON): ${JSON.stringify(built).slice(0, 6000)}
DO, in order, and paste the printed tallies: (1) re-run the builder's tests command; (2) re-run the bar command (if it takes over 15 minutes, run the smallest form it documents and say so; the enwiki download is never repeated: check the bytes on disk against the SOURCES.md line instead); (3) open the verdict file and check that every number in its "statement" exists in its fields and matches what the bar printed within run-to-run noise (a stochastic bench may differ; a deterministic one must not), and that barMet in the report agrees with isTheBar in the file; (4) list files under ${ROOT} newer than the marker (PowerShell: Get-ChildItem -Recurse -File | Where-Object { $_.LastWriteTime -gt (Get-Item '${MARKER}').LastWriteTime }) excluding .git/ (the tree became a git repository on 2026-09-24; its objects are not files a builder wrote), organism/ outputs, state/, bench/verdicts/, bench/fixtures/, notes/ and test/ files named for this item, and report any outside the owned set as strayFiles (other items of this board build in parallel on their own owned files: a file owned by another item is a note not a blocker; name it anyway; MANUAL.md and docs/LOG.md are the orchestrator's); (5) grep the builder's files for an em-dash character, for a process.exit before a write, for a postMessage of a typed-array view without ownBytes, and for a listener or handle left open; (6) judge: pass is true only if the tests pass, the bar command runs to completion, the verdict matches the print, the report's barMet matches the file, and no stray file is this builder's. A missed bar reported honestly is a pass; a claimed number you could not reproduce is a blocker. Do not edit any file. Under 300 words in findings.`
const fixPrompt = (it, built, verdict) => `${COMMON}\n\nFILES YOU OWN: ${it.owns}\n\nYou are the FIX stage for item "${it.key}". The builder reported: ${JSON.stringify(built).slice(0, 4000)}\nThe verify plane FAILED it with: ${JSON.stringify(verdict).slice(0, 4000)}\nOriginal task, for the bar and the intent:\n${it.task}\n\nFix every blocker and defect on the files you own, re-run the tests and the bar, rewrite the verdict from the new run (a bar file is written once by a completed run; if you must re-measure, the new run's file replaces it and says so in "at"), and fill the schema with what your terminal printed.`

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
// args.skip names items deferred to a later launch (Ollama is one queue: while Board 11's detached public chain runs, 'authored' and 'enwiki' wait). A resume with skip emptied re-runs only the skipped items and the rows stage.
const SKIP = new Set((args && Array.isArray(args.skip)) ? args.skip : [])
const active = ITEMS.filter(it => !SKIP.has(it.key))
if (SKIP.size) log(`skipped this launch (deferred, not dropped): ${[...SKIP].join(', ')}`)
const first = (await pipeline(active, it => buildVerifyFix(it, 'BOARD 12'))).filter(Boolean).map(summarise)
log(`${active.length} items done: ${first.filter(r => r.verified).length} verified, ${first.filter(r => r.barMet).length} bars met`)

// Barrier justified: the rows item reads every landed verdict's field names.
phase('Rows')
const landedList = first.map(r => `${r.key}: landed=${r.landed} barMet=${r.barMet} verified=${r.verified} verdict=${r.verdictFile} open=${String(r.open).slice(0, 240)}`).join('\n')
const rowsItem = { ...ROWS_ITEM, task: `${ROWS_ITEM.task}\n\nWHAT THE SIX ITEMS LANDED (read each verdict file for its fields; a missing or partial verdict is printed as such, never invented):\n${landedList}` }
const rows = summarise(await buildVerifyFix(rowsItem, 'BOARD 12 rows stage'))

return { items: first, rows }
