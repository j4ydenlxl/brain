export const meta = {
  name: 'board-33-arc-lock-in',
  description: 'BOARD 33 (the first local board of the banked week, his 2026-09-26 20:20 and 20:40 EDT orders: "100x more in a crunch", "Use subagent boards when u need to", "the endpoint at the end of the night is what matters"): nine items on disjoint files on his 64 GB, 32 CPU Windows machine. Route A induce (the paradigm shift), dead-share, ladder-arc, the two red gate tests (boundary, shell-windows), the 18 unsplit bar files, the one unnamed data file, the census loop inside runSoak, and the published GPT-4o and Opus 5.5 rows. Model OFF for every item (the one Ollama queue is taken by the GSM8K rung).',
  phases: [
    { title: 'Build', detail: 'Opus 5.5 builders on disjoint files, all nine at once' },
    { title: 'Verify', detail: 'Opus 5.5 skeptics re-run each bar and check file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
  ],
}

const ROOT = (args && args.root) || 'C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain'
const SCRATCH = (args && args.scratch) || (ROOT + '/state/board33')
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

const COMMON = `You are one builder on BOARD 33 of the BRAIN project at ${ROOT} (HIS WINDOWS 11 MACHINE, 32 CPUs, 64 GB RAM; Node v24.15.0 is on PATH: run node -v once and confirm it prints v24.15.0; the Bash tool is Git Bash (POSIX): forward slashes, absolute paths under the root, one command per line or ';' between them, never rely on '&&' chains to carry an exit code you then quote; PowerShell exists but you do not need it). Ollama is installed on this machine but the ONE Ollama queue is taken by the orchestrator's GSM8K rung tonight: EVERY item on this board is MODEL OFF (provider null, no socket, no model call); never start ollama, never call port 11434.
HIS ORDERS THIS BOARD EXISTS FOR, verbatim: 2026-09-26 20:20 EDT "What it did with $250, you need to able to 100x more in a crunch. WIthout compromising efficacy or efficiency"; "Match EVERY part of the vision ... Opus 5.5 level. NEEDS TO BE REACHED. Self improving over billions of years, MUST BE REACHED"; "Push everything the cloud session missed because it was cloud, this is local now"; 2026-09-26 20:40 EDT "U are to literally execute every word i told u, find a way. research, doesnt matter. i dotn care about the process. the endpoint at the end of the night is what matters"; 2026-09-26 19:46 EDT "U should learn how to research while working and also research before and after something goes wrong or something but not to an excess"; 2026-09-26 19:41 EDT "there needs to be a paradigm shift It must be reseaerched instead of relying on a flawed way. there are many different ways to get to an endpoint, u arent thiinking hard enough"; 2026-09-23 "Its gotta be nanoseconds"; 2026-09-24 14:39 "were not building a 400 B AI, we are building that and conscious being hyperintelligent like alien brain thing".
RESEARCH WHILE WORKING (his 19:46 rule, bounded): before you write a new path, read the tree's own prior attempt (the file you own, its notes/ file, its verdict) and, where a published way exists, read it (WebSearch or WebFetch, at most a few pages, never a session of its own); when a bar fails, read WHY before the fix and once more after; name what you read in your notes file's Measured section.
BUDGETS (64 GB here, shared with board 32's builders and the orchestrator's HumanEval rung): launch every bench through node tools/budget.mjs --ram-mb 4000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=4000 ...; before a bench read free RAM with node -e "console.log(Math.round(require('os').freemem()/1048576))" and wait while under 8000 MB free; run at most ONE bench process of your own at a time; NEVER run the whole bench/gate.mjs (run only your own test files with node --test <file>); never load organism/scale-52000; a bench that will write over 100 MB says so in its verdict; scratch copies go under ${SCRATCH}/<your item> (make the directory; delete it when done), never under state/ and never under /tmp.
Touch only the files you own (listed below) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/ (the orchestrator's), CLAUDE.md, bench/gate.mjs, bench/ladder.mjs, act/prompt.mjs, .github/workflows/*, .vercelignore, vercel.json, web/, or a file another item owns. Reading anything is fine except state/ (the deny list: runtime, never read, never listed in a report) and .vercel/ and .env.local (credentials: never open, never print). NEVER commit, stage, push, stash, reset or checkout: the orchestrator commits; git status --short and git diff are yours to read. Never print a token, key or URL value of any kind. bench/fixtures/ is never committed. No em-dashes anywhere you write (use a comma, a colon or a new sentence).
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, "barMet": true or false as a top-level boolean, a "split" object naming what was development and what was held out (and "contaminated": false or the reason; for a bar with no held-out data the split says so explicitly with "heldOut": "none" and why), and a one paragraph "statement" in plain prose a VC could read. (2) A test is added, never weakened; an assertion true of nothing is a defect. (3) Correct on the population you have: a check that has only ever seen one kind of row is not a check. (4) A perfect score is a missing measurement until the bar's command prints it. (5) The verdict names the control where one exists. (6) Return ONLY the schema fields; "printed" holds the bar command's key lines verbatim (under 1500 chars); "testsPrinted" holds the node --test tally line verbatim.`

const ITEMS = [
  {
    key: 'arc-lock-in',
    owns: 'bench/grid-curve.mjs (NEW, the bar), test/grid-curve.test.mjs (NEW), notes/grid-curve.md (NEW), bench/verdicts/grid-curve.json, bench/verdicts/grid-curve-partial.json, bench/verdicts/grid-attempts.json (NEW), the search module bench/grid.mjs loads as workerData.searchUrl (for the second attempt only), and bench/grid.mjs for an --attempts flag only if none exists. READ ONLY: notes/grid.md, capability/grid-dsl.mjs, bench/verdicts/grid-local-evaluation.json, bench/verdicts/grid-split-evaluation-control.json, bench/verdicts/public-arc.json. NOT the vocabulary (capability/grid-dsl.mjs stays as it is on this board).',
    task: `ITEM arc-lock-in (docs/VISION.md order 4, the ARC-AGI-1 row; his 2026-09-27 20:5x EDT message quoting the row "ARC-AGI-1 0.25 (Sep 18) 21.25 (today 18:38) 98 97.75 -> 76.75 why so far?> lock in"). WHAT IS PRINTED TODAY (bench/verdicts/grid-local-evaluation.json at 2026-09-27T18:38:05.825Z, command node bench/grid.mjs --split evaluation --budget-ms 3000 --workers 4 --tag local-evaluation --control bench/verdicts/grid-split-evaluation-control.json): 85 of 400 solved (21.25 percent), one attempt per task, no model, 3000 ms wall clock per task, depth 4, vocabulary 196, mean 2422.38 ms per task; of the 315 unsolved: 288 ran out of clock, 26 found a program that fit every train pair and missed a test output, 1 exhausted the vocabulary; attemptsPerTask 1 while attemptsAllowedByArc is 2; the published no-model row is Icecuber at 17 percent; the bar row is Gemini 3.1 Pro (Preview) at 98. So the gap is the clock and the single attempt, not knowledge: 288 of 315 unsolved never finished searching. WHAT IS MADE, in this order, each step's numbers printed before the next starts: (1) THE SECOND ATTEMPT: ARC scores a task right when either of two attempts matches; the search module already takes an attempts option (bench/grid.mjs line 225 passes workerData.attempts). Make attempt 2 real: when more than one program fits every train pair, emit the two programs whose TEST outputs differ, ordered by program length then by discovery order (say the rule in notes/grid-curve.md); when only one program fits, attempt 2 is empty. Add --attempts N to bench/grid.mjs only if the flag is missing. Measure at the SAME budget as today, 3000 ms, 12 workers, on the evaluation split with the same control file: bench/verdicts/grid-attempts.json {at, command, attempts: 2, solved, of, pct, convertedFoundButWrong: k of 26, lost: tasks solved at attempts 1 and not now (must be 0), paired gain and loss against grid-local-evaluation.json by task id, statement}. (2) THE CLOCK CURVE: bench/grid-curve.mjs runs the evaluation split at --budget-ms 30000 --attempts 2 --workers 12 with a journal and --resume (one row per task, so a killed run continues), prints per budget the solved count, the timed out count, the found but wrong count, the exhausted count and the wall seconds, and the paired gain and loss against the 3000 ms run; writes bench/verdicts/grid-curve.json {at, command, points: [{budgetMs, attempts, workers, solved, of, pct, timedOut, foundButWrong, exhausted, meanMs, wallSeconds, gainedIds, lostIds}], the 3000 ms point copied from grid-attempts.json with its stamp, marginal: solved per 10x clock, statement}; --limit N writes grid-curve-partial.json. PRICE IT BEFORE RUNNING: 288 timed out tasks times 30 s over 12 workers is about 12 minutes plus the solved ones; print the price line first. Run the 30000 ms point to the end inside this item. The 300000 ms point is NOT run by you: bench/grid-curve.mjs takes --budget-ms 300000 --only-timed-out-of <the 30000 ms journal> so the orchestrator runs it afterwards on the tasks that still timed out; document that command in notes/grid-curve.md and in the verdict's nextCommand. (3) THE CONTROL: the training split at 30000 ms --attempts 2 --limit 100 (a fixed seed draw, say which), so the curve's gain is shown on a split the search was tuned on as well as the held out one; paired gain and loss printed. (4) test/grid-curve.test.mjs: the second-attempt rule on a fixture task with two fitting programs and with one, the paired gain and loss on fixed row sets, the journal resume on a fixture journal, the price line, and the verdict files' shapes after the 3000 ms attempts run (never re-run the 30 s point in a test). BUDGET: run every bench through node tools/budget.mjs --ram-mb 6000 --disk-mb 300 --dir bench/verdicts -- node bench/grid-curve.mjs ...; the depth stays 4 and the vocabulary stays 196 on this board (say so in the verdict). STANDING RULES: zero dependencies, Node 24 ESM, no em-dash character anywhere in any file you write, never commit, never edit a file you do not own, never call a model (this item is no-model by design and the one ollama queue is taken), never more than 12 worker threads (board 32 and the HumanEval rung share the 32 CPUs), never run two grid benches at once, report the exact printed lines. Research while working (his 2026-09-26 19:46 EDT order): read notes/grid.md and bench/grid.mjs before writing, and read why a run failed before fixing it. Return per the schema.`,
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

const verifyPrompt = (it, built) => `You are the verify plane for item "${it.key}" of BOARD 33 in ${ROOT} (his Windows 11 machine, Node v24.15.0 on PATH, Git Bash through the Bash tool, 64 GB, MODEL OFF, never call Ollama). You are a skeptic: the builder's report is a claim, not a result. The builder owns ONLY: ${it.owns}. Its report: ${JSON.stringify(built).slice(0, 6000)}.
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
log(`BOARD 33: ${items.length} items: ${items.map(i => i.key).join(', ')}`)
const results = (await pipeline(items, it => buildVerifyFix(it))).filter(Boolean)
const summary = {
  items: results.map(r => ({ key: r.key, landed: r.landed, barMet: r.barMet, verified: !!(r.verify && r.verify.ok), files: (r.built && r.built.files) || [], verdictFile: r.built && r.built.verdictFile, barCommand: r.built && r.built.barCommand, printed: r.built && r.built.printed, testsPrinted: r.built && r.built.testsPrinted, verifyPrinted: r.verify && r.verify.printed, problems: (r.verify && r.verify.problems) || [], unowned: (r.verify && r.verify.unowned) || [], open: (r.built && r.built.open) || [], reason: r.reason || null })),
  landed: results.filter(r => r.landed).length,
  barMet: results.filter(r => r.barMet).length,
  verified: results.filter(r => r.verify && r.verify.ok).length,
}
log(`BOARD 33 done: ${summary.landed} landed, ${summary.verified} verified, ${summary.barMet} bars met of ${results.length}`)
return summary
