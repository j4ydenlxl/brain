export const meta = {
  name: 'board-24b-local-night',
  description: 'BOARD 24B (the third local board of the banked week, three items on files no running item owns; his 2026-09-26 20:20, 20:40 and 21:03 EDT orders: "100x more in a crunch", "Use subagent boards when u need to", "the endpoint at the end of the night is what matters", "after tonight Yes. we are close. No lies"): multiply-suite (a suite one instance does not saturate, order 12), unsplit-bars (the eleven bar files with no split object, the CONTAMINATION row), web-vision (the vision counter line and the live bar on the portfolio and ladder pages, orders 9 and 14). Model OFF for every item (the one Ollama queue is taken by the GSM8K rung).',
  phases: [
    { title: 'Build', detail: 'Opus 5.5 builders on disjoint files, all nine at once' },
    { title: 'Verify', detail: 'Opus 5.5 skeptics re-run each bar and check file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
  ],
}

const ROOT = (args && args.root) || 'C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain'
const SCRATCH = (args && args.scratch) || (ROOT + '/state/board24b')
const GATE_OUT = (args && args.gate) || ''
const ONLY = (args && args.only) || null
const SKIP = (args && args.skip) || []
const MODEL_BUILD = 'claude-opus-5-5'
const MODEL_VERIFY = 'claude-opus-5-5'
const MODEL_LOW = 'claude-sonnet-5'

const CONCISE = `[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]
- You are a subagent reporting directly to a Fable 5.1 Orchestrator running under Ultracode.
- DO NOT think out loud, explain your logic, or provide conversational pleasantries in your final response payload.
- Execute your task internally. When returning the result, output ONLY the raw completed artifact (e.g., the exact code block, the specific terminal command output, or the strict data structure requested).
- Minimize conversational tokens to protect the Orchestrator's context window. Every unnecessary word incurs extreme token penalties.
The work itself stays the same optimal work: every test, every bar, every number printed by a command. Only the report shrinks: a schema field holds the number or the exact printed line, never a narrative; a list holds the items, never a paragraph per item.`

const COMMON = `You are one builder on BOARD 24B of the BRAIN project at ${ROOT} (HIS WINDOWS 11 MACHINE, 32 CPUs, 64 GB RAM; Node v24.15.0 is on PATH: run node -v once and confirm it prints v24.15.0; the Bash tool is Git Bash (POSIX): forward slashes, absolute paths under the root, one command per line or ';' between them, never rely on '&&' chains to carry an exit code you then quote; PowerShell exists but you do not need it). Ollama is installed on this machine but the ONE Ollama queue is taken by the orchestrator's GSM8K rung tonight: EVERY item on this board is MODEL OFF (provider null, no socket, no model call); never start ollama, never call port 11434.
HIS ORDERS THIS BOARD EXISTS FOR, verbatim: 2026-09-26 20:20 EDT "What it did with $250, you need to able to 100x more in a crunch. WIthout compromising efficacy or efficiency"; "Match EVERY part of the vision ... Opus 5.5 level. NEEDS TO BE REACHED. Self improving over billions of years, MUST BE REACHED"; "Push everything the cloud session missed because it was cloud, this is local now"; 2026-09-26 20:40 EDT "U are to literally execute every word i told u, find a way. research, doesnt matter. i dotn care about the process. the endpoint at the end of the night is what matters"; 2026-09-26 19:46 EDT "U should learn how to research while working and also research before and after something goes wrong or something but not to an excess"; 2026-09-26 19:41 EDT "there needs to be a paradigm shift It must be reseaerched instead of relying on a flawed way. there are many different ways to get to an endpoint, u arent thiinking hard enough"; 2026-09-23 "Its gotta be nanoseconds"; 2026-09-24 14:39 "were not building a 400 B AI, we are building that and conscious being hyperintelligent like alien brain thing".
RESEARCH WHILE WORKING (his 19:46 rule, bounded): before you write a new path, read the tree's own prior attempt (the file you own, its notes/ file, its verdict) and, where a published way exists, read it (WebSearch or WebFetch, at most a few pages, never a session of its own); when a bar fails, read WHY before the fix and once more after; name what you read in your notes file's Measured section.
BUDGETS (64 GB here, shared with boards 23 and 24a still building, this board's other builders and the orchestrator's GSM8K rung): launch every bench through node tools/budget.mjs --ram-mb 4000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=4000 ...; before a bench read free RAM with node -e "console.log(Math.round(require('os').freemem()/1048576))" and wait while under 8000 MB free; run at most ONE bench process of your own at a time; NEVER run the whole bench/gate.mjs (run only your own test files with node --test <file>); never load organism/scale-52000; a bench that will write over 100 MB says so in its verdict; scratch copies go under ${SCRATCH}/<your item> (make the directory; delete it when done), never under state/ and never under /tmp.
Touch only the files you own (listed below) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/ (the orchestrator's), CLAUDE.md, bench/gate.mjs, bench/ladder.mjs, act/prompt.mjs, .github/workflows/*, .vercelignore, vercel.json, web/, or a file another item owns. Reading anything is fine except state/ (the deny list: runtime, never read, never listed in a report) and .vercel/ and .env.local (credentials: never open, never print). NEVER commit, stage, push, stash, reset or checkout: the orchestrator commits; git status --short and git diff are yours to read. Never print a token, key or URL value of any kind. bench/fixtures/ is never committed. No em-dashes anywhere you write (use a comma, a colon or a new sentence).
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, "barMet": true or false as a top-level boolean, a "split" object naming what was development and what was held out (and "contaminated": false or the reason; for a bar with no held-out data the split says so explicitly with "heldOut": "none" and why), and a one paragraph "statement" in plain prose a VC could read. (2) A test is added, never weakened; an assertion true of nothing is a defect. (3) Correct on the population you have: a check that has only ever seen one kind of row is not a check. (4) A perfect score is a missing measurement until the bar's command prints it. (5) The verdict names the control where one exists. (6) Return ONLY the schema fields; "printed" holds the bar command's key lines verbatim (under 1500 chars); "testsPrinted" holds the node --test tally line verbatim.`

const ITEMS = [
  {
    key: 'multiply-suite',
    owns: 'daemon/multiply.mjs, bench/multiply.mjs, test/multiply.test.mjs, notes/multiply.md, bench/verdicts/multiply.json and multiply-*-partial.json (new). NOT generations/ (board 24a item plateau owns generations/plateau.mjs, velocity.mjs and archive.mjs tonight), NOT daemon/run.mjs, NOT bench/years.mjs, NOT bench/ladder.mjs.',
    task: `ITEM multiply-suite (P15 MULTIPLYING; his "multiplying, duplicating, all within cloud" of 2026-09-23 and "multiply forever for 2 billion + lines is weird, find a way that code isnt local" of 2026-09-26 20:20 EDT; docs/VISION.md order 12). STATE ON DISK: bench/verdicts/multiply.json is isTheBar true with NO barMet: notes/multiply.md "The plateau" says one instance alone reaches the suite's searched plateau (598 at length 96) inside 240 s, so on that suite N instances cannot beat one and the bar is undecidable. READ FIRST, whole: notes/multiply.md, bench/multiply.mjs, daemon/multiply.mjs, test/multiply.test.mjs, the verdict (node -e, print its keys and statement), and the published way (WebSearch, at most three pages: island-model evolutionary algorithms and migration intervals; the "when do islands help" results). BUILD: (1) a suite the single instance does NOT saturate inside the wall: raise the length cap or the task family so that the control (one instance, the same total organism-years) is still rising at the end of the wall, measured first on three seeds and printed (the control's score at the end and its slope over the last quarter of the wall); if the suite is still saturated at every cap the bench can afford in 120 s, print that and stop the item with barMet false and the numbers. (2) N instances (N a flag, default 4) against one instance at the SAME total organism-years (the control gets N times the wall, or N times the population: say which, and why the published way chooses it), with elite exchange every M generations (M a flag) and a no-exchange arm as the second control; five seeds for the run that decides. (3) THE MACHINE IS SHARED tonight (boards 23 and 24a, the orchestrator's GSM8K rung on the one Ollama queue): MODEL OFF, at most 4 workers, at most 120 s per arm; the verdict says exactly what was run. BAR (bench/multiply.mjs, bench/verdicts/multiply.json): per arm the held-out score with the seed band, the organism-years, the exchange count; barMet true only when N instances with exchange beat both controls by more than the seed band on the suite the single instance does not saturate; barMet false otherwise with every number printed (a false verdict with the band printed is a landing; a missing number is not). The split object names the deciding seeds as held out and says the tuning seeds never touched them. test/multiply.test.mjs green under Node 24 with the tally printed.`,
  },
  {
    key: 'unsplit-bars',
    owns: 'bench/census.mjs, bench/code.mjs, bench/compress.mjs, bench/math.mjs, bench/public.mjs (the split object of its verdict only), bench/synth.mjs, bench/web-ladder.mjs, tools/split-stamp.mjs (new), test/unsplit-bars.test.mjs (new), notes/contamination.md (a new section "The eleven", appended only), and these verdict files: autopilot-board10.json, census-prune.json, census-scale-static.json, census.json, code.json, compress-board10.json, compress.json, math.json, public-launch.json, synth.json, web-ladder.json. NOT bench/gate.mjs, NOT test/contamination-split.test.mjs or test/census.test.mjs (board 23 items own them), NOT bench/grid.mjs or grid.json (board 23 item ladder-arc is inside it), NOT bench/senses.mjs, recall.mjs, native.mjs, knowledge.mjs, daemon.mjs.',
    task: `ITEM unsplit-bars (Board 13 RULES (1): a bar verdict names its split; the gate's CONTAMINATION row). STATE: node bench/gate.mjs --contamination prints RED with CAUSES: 11 bar files with no split (autopilot-board10.json, census-prune.json, census-scale-static.json, census.json, code.json, compress-board10.json, compress.json, math.json, public-launch.json, synth.json, web-ladder.json) and 1 whose split is a string (grid.json, NOT yours tonight: another item is inside bench/grid.mjs; leave it and print it as the one remaining cause). READ FIRST: bench/gate.mjs contaminationRow, contaminationRecords and splitShapeOf (the accepted shape of a split object and of the contaminated flag), test/gate-contamination.test.mjs (what a split must carry), notes/contamination.md as it stands, and each of the eleven files (node -e: print at, command, isTheBar, n or of, and whether a writer named in its command still exists in the tree). RULES: a verdict's numbers are never altered by hand; the split object says what the bar's records were (development: what the code was tuned on; heldOut: what was scored; contaminated: true only when the scored records fed the tuning, with the statement saying so). BUILD: (1) for every writer that still exists, the writer emits the split object on its next run (the honest one for that bench: a synthetic draw names its seed and generator; a fixed public set names the set and its held-out ids; a census names the organism it counted, split not applicable is still an object {kind: 'census', heldOut: 'none', why}); (2) tools/split-stamp.mjs: for a file whose writer no longer runs (the two board-10 files) or whose run costs more than 120 s tonight, stamp the split object INTO the existing file without touching any other field, adding splitStampedAt (ISO), splitStampedBy ('tools/split-stamp.mjs'), and the writer's current split logic as the source; print each file's before and after shape; (3) re-run every writer whose run is under 120 s with MODEL OFF so its file carries the split from its own run (say which ran and which were stamped); (4) test/unsplit-bars.test.mjs: every one of the eleven now has a split object accepted by splitShapeOf, no numeric field changed (compare against a copy taken before), and node bench/gate.mjs --contamination prints exactly one remaining cause, grid.json. BAR: node bench/gate.mjs --contamination, its line printed verbatim in the verdict statement of notes/contamination.md "The eleven"; barMet true when the only remaining cause is grid.json. The machine is shared: MODEL OFF, at most 2 workers, no run over 120 s.`,
  },
  {
    key: 'web-vision',
    owns: 'web/build.mjs (the portfolio and ladder page sections only), web/src/portfolio.html, web/src/ladder.html, test/portfolio-page.test.mjs and test/ladder-page.test.mjs (added cases only), tools/vision-count.mjs (the --json verdict fields only), bench/verdicts/vision-count.json. NOT web/ask.mjs, NOT web/ladder.mjs, NOT web/dist (the orchestrator rebuilds and deploys), NOT docs/VISION.md (the orchestrator edits it), NOT docs/PORTFOLIO.md.',
    task: `ITEM web-vision (his "Listen vcs must yell" and "Put portfolio in dilation.dev ... up to date"; his 2026-09-26 20:20 "I wouldnt declare the project EVER over until the vision is 100 percent fulfilled" and 21:03 "after tonight 'Yes. we are close. No lies'"; docs/VISION.md orders 9 and 14). STATE: node tools/vision-count.mjs prints the counter line for docs/VISION.md ("36 orders listed. MET: 16. PARTIAL: 18. OPEN: 1. FROZEN: 1." at the time of writing; read the live number, never retype this one) and with --json writes bench/verdicts/vision-count.json; bench/verdicts/site-ask.json is the live bar (a GitHub runner asking https://dilation.dev/ask through playwright: tab nanoseconds and server microseconds). The portfolio page (web/build.mjs from docs/PORTFOLIO.md) quotes gate.json in its footer; nothing on the site prints the vision counter or the live bar. READ FIRST: web/build.mjs whole, web/src/portfolio.html and ladder.html, test/portfolio-page.test.mjs and test/ladder-page.test.mjs, tools/vision-count.mjs, bench/verdicts/vision-count.json and site-ask.json (node -e: keys and statement). BUILD: (1) the portfolio page carries a "The vision, counted" block: the counter line read from bench/verdicts/vision-count.json at build time (never typed), each status word with its count, the verdict's at, and one sentence that says the project is over when MET equals the total and not before; (2) the same page carries a "Live" block from site-ask.json: the url asked, the tab nanoseconds per ask, the server microseconds, the round trip, the run's at, and the GitHub run id when the file carries it; (3) the ladder page prints the counter line in its header line beside the gate line; (4) a missing verdict file prints "not measured" in that block, never a number; (5) tests: the built page contains the counter line byte for byte equal to countLine(countVision(docs/VISION.md)) when the json is fresh, prints "not measured" on a planted missing file, no em dash, the size cap of the existing test holds. BAR: node web/build.mjs prints the pages built; node --test test/portfolio-page.test.mjs test/ladder-page.test.mjs green with the tally printed; the block text printed by node -e from web/dist/portfolio/index.html (the orchestrator deploys). MODEL OFF; nothing here needs a run over 30 s.`,
  },
]

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    landed: { type: 'boolean' },
    barMet: { type: 'boolean', description: 'true only if the verdict file carries isTheBar true and barMet true; a -partial verdict means false' },
    files: { type: 'array', items: { type: 'string' }, description: 'every file created or edited, repo-relative' },
    barCommand: { type: 'string' },
    printed: { type: 'string', description: 'the key printed lines of the bar command, verbatim, under 1500 chars' },
    verdictFile: { type: 'string' },
    testsCommand: { type: 'string' },
    testsPrinted: { type: 'string', description: 'the node --test tally line(s), verbatim' },
    read: { type: 'array', items: { type: 'string' }, description: 'what was read before building (files, pages), under 12 entries' },
    open: { type: 'array', items: { type: 'string' }, description: 'what is left undone, one line each' },
  },
  required: ['landed', 'barMet', 'files', 'barCommand', 'printed', 'verdictFile', 'testsCommand', 'testsPrinted', 'open'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean', description: 'true only if the bar command re-run printed what the builder claimed, the tests pass, and only owned files changed' },
    barMet: { type: 'boolean' },
    printed: { type: 'string', description: 'the re-run bar command key lines, verbatim, under 1200 chars' },
    testsPrinted: { type: 'string' },
    ownershipOk: { type: 'boolean' },
    unowned: { type: 'array', items: { type: 'string' } },
    problems: { type: 'array', items: { type: 'string' }, description: 'each a one-line defect with file:line where it applies' },
  },
  required: ['ok', 'barMet', 'printed', 'testsPrinted', 'ownershipOk', 'unowned', 'problems'],
}

const run = (prompt, opts) => agent(CONCISE + '\n\n' + prompt, opts)

const buildPrompt = (it) => COMMON + '\n\nYOUR ITEM: ' + it.key + '\nYOU OWN: ' + it.owns + '\nTASK: ' + it.task + '\n\nWhen done, return ONLY the schema fields.'

const verifyPrompt = (it, built) => `You are the verify plane for item "${it.key}" of BOARD 24B in ${ROOT} (his Windows 11 machine, Node v24.15.0 on PATH, Git Bash through the Bash tool, 64 GB, MODEL OFF, never call Ollama). You are a skeptic: the builder's report is a claim, not a result. The builder owns ONLY: ${it.owns}. Its report: ${JSON.stringify(built).slice(0, 6000)}.
DO: (1) git status --short and git diff --stat: list every changed or new file; any file outside the owned list (plus new files named for the item under bench/verdicts/, notes/, test/) goes in "unowned" and ownershipOk is false. (2) Re-run the bar command exactly as reported (through tools/budget.mjs as the builder did; wait while free RAM under 8000 MB: node -e "console.log(Math.round(require('os').freemem()/1048576))") and paste its key lines; compare with the builder's "printed". (3) Re-run the tests command and paste the tally. (4) Open the verdict file with node -e and check: isTheBar true, barMet a top-level boolean matching the printed numbers, "at" ISO, "command", "split" object present, "statement" present, no number in the statement that the command did not print. (5) Read the diff for a weakened assertion, an assertion true of nothing, a hand-edited verdict, an em-dash, a read of state/, a secret. Never edit anything. Never commit. Return ONLY the schema fields; "problems" is empty when ok.`

const fixPrompt = (it, built, v) => COMMON + `\n\nYOUR ITEM: ${it.key} (FIX PASS). YOU OWN: ${it.owns}.\nThe builder reported: ${JSON.stringify(built).slice(0, 4000)}\nThe verify plane found these problems (fix every one at the source, never by weakening a test or editing a verdict by hand): ${JSON.stringify(v.problems)}; unowned files touched: ${JSON.stringify(v.unowned)} (revert those edits with git checkout -- <file> ONLY for files you did not own and that are not new; a new unowned file is deleted). Re-run the bar and the tests. Return ONLY the schema fields.`

async function buildVerifyFix(it) {
  const built = await run(buildPrompt(it), { label: 'build:' + it.key, phase: 'Build', schema: BUILD_SCHEMA, model: it.model || MODEL_BUILD })
  if (!built) return { key: it.key, landed: false, barMet: false, reason: 'the builder died or was skipped' }
  let v = await run(verifyPrompt(it, built), { label: 'verify:' + it.key, phase: 'Verify', schema: VERIFY_SCHEMA, model: MODEL_VERIFY })
  if (!v) return { key: it.key, landed: built.landed, barMet: false, built, reason: 'the verify plane died' }
  if (v.ok) return { key: it.key, landed: built.landed, barMet: v.barMet, built, verify: v }
  log(`${it.key}: verify found ${v.problems.length} problems; one fix pass`)
  const fixed = await run(fixPrompt(it, built, v), { label: 'fix:' + it.key, phase: 'Fix', schema: BUILD_SCHEMA, model: MODEL_BUILD })
  if (!fixed) return { key: it.key, landed: built.landed, barMet: false, built, verify: v, reason: 'the fix plane died' }
  const v2 = await run(verifyPrompt(it, fixed), { label: 'verify2:' + it.key, phase: 'Verify', schema: VERIFY_SCHEMA, model: MODEL_VERIFY })
  return { key: it.key, landed: fixed.landed, barMet: !!(v2 && v2.ok && v2.barMet), built: fixed, verify: v2 || v, firstVerify: v }
}

const items = ITEMS.filter(it => (!ONLY || ONLY.includes(it.key)) && !SKIP.includes(it.key))
log(`BOARD 24B: ${items.length} items: ${items.map(i => i.key).join(', ')}`)
const results = (await pipeline(items, it => buildVerifyFix(it))).filter(Boolean)
const summary = {
  items: results.map(r => ({ key: r.key, landed: r.landed, barMet: r.barMet, verified: !!(r.verify && r.verify.ok), files: (r.built && r.built.files) || [], verdictFile: r.built && r.built.verdictFile, barCommand: r.built && r.built.barCommand, printed: r.built && r.built.printed, testsPrinted: r.built && r.built.testsPrinted, verifyPrinted: r.verify && r.verify.printed, problems: (r.verify && r.verify.problems) || [], unowned: (r.verify && r.verify.unowned) || [], open: (r.built && r.built.open) || [], reason: r.reason || null })),
  landed: results.filter(r => r.landed).length,
  barMet: results.filter(r => r.barMet).length,
  verified: results.filter(r => r.verify && r.verify.ok).length,
}
log(`BOARD 24B done: ${summary.landed} landed, ${summary.verified} verified, ${summary.barMet} bars met of ${results.length}`)
return summary
