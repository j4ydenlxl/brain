export const meta = {
  name: 'board-30-vision-coverage',
  description: 'BOARD 30 (the first local board of the banked week, his 2026-09-26 20:20 and 20:40 EDT orders: "100x more in a crunch", "Use subagent boards when u need to", "the endpoint at the end of the night is what matters"): nine items on disjoint files on his 64 GB, 32 CPU Windows machine. Route A induce (the paradigm shift), dead-share, ladder-arc, the two red gate tests (boundary, shell-windows), the 18 unsplit bar files, the one unnamed data file, the census loop inside runSoak, and the published GPT-4o and Opus 5.5 rows. Model OFF for every item (the one Ollama queue is taken by the GSM8K rung).',
  phases: [
    { title: 'Build', detail: 'Opus 5.5 builders on disjoint files, all nine at once' },
    { title: 'Verify', detail: 'Opus 5.5 skeptics re-run each bar and check file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
  ],
}

const ROOT = (args && args.root) || 'C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain'
const SCRATCH = (args && args.scratch) || (ROOT + '/state/board30')
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

const COMMON = `You are one builder on BOARD 30 of the BRAIN project at ${ROOT} (HIS WINDOWS 11 MACHINE, 32 CPUs, 64 GB RAM; Node v24.15.0 is on PATH: run node -v once and confirm it prints v24.15.0; the Bash tool is Git Bash (POSIX): forward slashes, absolute paths under the root, one command per line or ';' between them, never rely on '&&' chains to carry an exit code you then quote; PowerShell exists but you do not need it). Ollama is installed on this machine but the ONE Ollama queue is taken by the orchestrator's GSM8K rung tonight: EVERY item on this board is MODEL OFF (provider null, no socket, no model call); never start ollama, never call port 11434.
HIS ORDERS THIS BOARD EXISTS FOR, verbatim: 2026-09-26 20:20 EDT "What it did with $250, you need to able to 100x more in a crunch. WIthout compromising efficacy or efficiency"; "Match EVERY part of the vision ... Opus 5.5 level. NEEDS TO BE REACHED. Self improving over billions of years, MUST BE REACHED"; "Push everything the cloud session missed because it was cloud, this is local now"; 2026-09-26 20:40 EDT "U are to literally execute every word i told u, find a way. research, doesnt matter. i dotn care about the process. the endpoint at the end of the night is what matters"; 2026-09-26 19:46 EDT "U should learn how to research while working and also research before and after something goes wrong or something but not to an excess"; 2026-09-26 19:41 EDT "there needs to be a paradigm shift It must be reseaerched instead of relying on a flawed way. there are many different ways to get to an endpoint, u arent thiinking hard enough"; 2026-09-23 "Its gotta be nanoseconds"; 2026-09-24 14:39 "were not building a 400 B AI, we are building that and conscious being hyperintelligent like alien brain thing".
RESEARCH WHILE WORKING (his 19:46 rule, bounded): before you write a new path, read the tree's own prior attempt (the file you own, its notes/ file, its verdict) and, where a published way exists, read it (WebSearch or WebFetch, at most a few pages, never a session of its own); when a bar fails, read WHY before the fix and once more after; name what you read in your notes file's Measured section.
BUDGETS (64 GB here, shared with boards 26, 28 and 29 and the orchestrator's GSM8K rung): launch every bench through node tools/budget.mjs --ram-mb 4000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=4000 ...; before a bench read free RAM with node -e "console.log(Math.round(require('os').freemem()/1048576))" and wait while under 8000 MB free; run at most ONE bench process of your own at a time; NEVER run the whole bench/gate.mjs (run only your own test files with node --test <file>); never load organism/scale-52000; a bench that will write over 100 MB says so in its verdict; scratch copies go under ${SCRATCH}/<your item> (make the directory; delete it when done), never under state/ and never under /tmp.
Touch only the files you own (listed below) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/ (the orchestrator's), CLAUDE.md, bench/gate.mjs, bench/ladder.mjs, act/prompt.mjs, .github/workflows/*, .vercelignore, vercel.json, web/, or a file another item owns. Reading anything is fine except state/ (the deny list: runtime, never read, never listed in a report) and .vercel/ and .env.local (credentials: never open, never print). NEVER commit, stage, push, stash, reset or checkout: the orchestrator commits; git status --short and git diff are yours to read. Never print a token, key or URL value of any kind. bench/fixtures/ is never committed. No em-dashes anywhere you write (use a comma, a colon or a new sentence).
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, "barMet": true or false as a top-level boolean, a "split" object naming what was development and what was held out (and "contaminated": false or the reason; for a bar with no held-out data the split says so explicitly with "heldOut": "none" and why), and a one paragraph "statement" in plain prose a VC could read. (2) A test is added, never weakened; an assertion true of nothing is a defect. (3) Correct on the population you have: a check that has only ever seen one kind of row is not a check. (4) A perfect score is a missing measurement until the bar's command prints it. (5) The verdict names the control where one exists. (6) Return ONLY the schema fields; "printed" holds the bar command's key lines verbatim (under 1500 chars); "testsPrinted" holds the node --test tally line verbatim.`

const ITEMS = [
  {
    key: 'vision-coverage',
    owns: 'docs/research/vision-coverage.md and bench/verdicts/vision-coverage.json only. READ ONLY: MANUAL.md (127 KB: read section A in slices with sed -n or grep -n, never the whole file in one read), docs/VISION.md (40 KB), docs/INTERPRETATION-2026-09-27.md (16 KB). No source file, no order file is edited by this item: the orchestrator inserts the orders you draft.',
    task: `ITEM vision-coverage (his 2026-09-27 15:1x EDT paste, "here this is an interpretation of the manual:", a third-party model's 125-row prompt-to-idea map of MANUAL.md section A, saved at docs/INTERPRETATION-2026-09-27.md; his standing orders 39 "Look at my vision, and my history of everything i said. its in the manual. Make exactly that" and 36 "What i want to hear, is everything i said. Every prompt, everything. Fulfilled."). AUDIT, no build. For each of the 125 numbered rows of the interpretation: (1) find his verbatim line or lines in MANUAL.md section A that the row paraphrases: quote his exact words (a substring that appears in MANUAL.md byte for byte; verify every quote you write with grep -F -c and report the number of quotes that failed, which must be 0) with the dated section header above it; mark NOT FOUND when no line in section A matches the row; (2) name every order of docs/VISION.md section 3 (1 to 43) whose quote or "what is made" text carries that row's requirement; verdict CARRIED when an order carries all of it, PARTLY when an order carries part (name the missing part in his words), UNCARRIED when none does, NOT FOUND per (1); rows that are status questions or continuations ("Try again", "Usage reset", "did a lot of work get done?") get verdict QUESTION and no draft; (3) for every UNCARRIED or PARTLY row, draft an order in the exact house format of section 3, one line: N. "<his verbatim words>" (<date from the header>) -> <what is made, with file paths> Bar: <a number or file a command prints, never a prediction> Status: OPEN (<why, from printed verdicts under bench/verdicts/ only>), numbered 44 upward in the manual's chronological order; rows that are one requirement share one draft, and each draft names the rows it covers; (4) flag every row whose paraphrase drifts from his words (softer, stronger, or a different subject), quoting both sides; (5) name the rows the interpretation numbers twice or skips (it prints 65-67 and 65, 66, then jumps to 70). Write docs/research/vision-coverage.md: a table (row, his words in at most 12 words, date, orders, verdict, missing part), then the draft orders in one section the orchestrator can paste, then the drift list, then a counts line; and bench/verdicts/vision-coverage.json {at, rows: [{n, quote, date, orders: [numbers], verdict, missing}], counts: {carried, partly, uncarried, notFound, question}, quotesChecked, quotesFailed, drafts: [{n, rows: [numbers], text}], drift: [{n, theirs, his}], statement}. No em-dash character in any file you write. Return per the schema with the counts line and the draft order numbers as printed lines.`,
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

const verifyPrompt = (it, built) => `You are the verify plane for item "${it.key}" of BOARD 30 in ${ROOT} (his Windows 11 machine, Node v24.15.0 on PATH, Git Bash through the Bash tool, 64 GB, MODEL OFF, never call Ollama). You are a skeptic: the builder's report is a claim, not a result. The builder owns ONLY: ${it.owns}. Its report: ${JSON.stringify(built).slice(0, 6000)}.
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
log(`BOARD 30: ${items.length} items: ${items.map(i => i.key).join(', ')}`)
const results = (await pipeline(items, it => buildVerifyFix(it))).filter(Boolean)
const summary = {
  items: results.map(r => ({ key: r.key, landed: r.landed, barMet: r.barMet, verified: !!(r.verify && r.verify.ok), files: (r.built && r.built.files) || [], verdictFile: r.built && r.built.verdictFile, barCommand: r.built && r.built.barCommand, printed: r.built && r.built.printed, testsPrinted: r.built && r.built.testsPrinted, verifyPrinted: r.verify && r.verify.printed, problems: (r.verify && r.verify.problems) || [], unowned: (r.verify && r.verify.unowned) || [], open: (r.built && r.built.open) || [], reason: r.reason || null })),
  landed: results.filter(r => r.landed).length,
  barMet: results.filter(r => r.barMet).length,
  verified: results.filter(r => r.verify && r.verify.ok).length,
}
log(`BOARD 30 done: ${summary.landed} landed, ${summary.verified} verified, ${summary.barMet} bars met of ${results.length}`)
return summary
