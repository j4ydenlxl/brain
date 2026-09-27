export const meta = {
  name: 'board-24a-local-night',
  description: 'BOARD 24A (the second local board of the banked week, two items on files board 23 does not own; his 2026-09-26 20:20 and 20:40 EDT orders: "100x more in a crunch", "Use subagent boards when u need to", "the endpoint at the end of the night is what matters"): nine items on disjoint files on his 64 GB, 32 CPU Windows machine. Route A induce (the paradigm shift), dead-share, ladder-arc, the two red gate tests (boundary, shell-windows), the 18 unsplit bar files, the one unnamed data file, the census loop inside runSoak, and the published GPT-4o and Opus 5.5 rows. Model OFF for every item (the one Ollama queue is taken by the GSM8K rung).',
  phases: [
    { title: 'Build', detail: 'Opus 5.5 builders on disjoint files, both at once (plateau, imagine)' },
    { title: 'Verify', detail: 'Opus 5.5 skeptics re-run each bar and check file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
  ],
}

const ROOT = (args && args.root) || 'C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain'
const SCRATCH = (args && args.scratch) || (ROOT + '/state/board24a')
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

const COMMON = `You are one builder on BOARD 24A of the BRAIN project at ${ROOT} (HIS WINDOWS 11 MACHINE, 32 CPUs, 64 GB RAM; Node v24.15.0 is on PATH: run node -v once and confirm it prints v24.15.0; the Bash tool is Git Bash (POSIX): forward slashes, absolute paths under the root, one command per line or ';' between them, never rely on '&&' chains to carry an exit code you then quote; PowerShell exists but you do not need it). Ollama is installed on this machine but the ONE Ollama queue is taken by the orchestrator's GSM8K rung tonight: EVERY item on this board is MODEL OFF (provider null, no socket, no model call); never start ollama, never call port 11434.
HIS ORDERS THIS BOARD EXISTS FOR, verbatim: 2026-09-26 20:20 EDT "What it did with $250, you need to able to 100x more in a crunch. WIthout compromising efficacy or efficiency"; "Match EVERY part of the vision ... Opus 5.5 level. NEEDS TO BE REACHED. Self improving over billions of years, MUST BE REACHED"; "Push everything the cloud session missed because it was cloud, this is local now"; 2026-09-26 20:40 EDT "U are to literally execute every word i told u, find a way. research, doesnt matter. i dotn care about the process. the endpoint at the end of the night is what matters"; 2026-09-26 19:46 EDT "U should learn how to research while working and also research before and after something goes wrong or something but not to an excess"; 2026-09-26 19:41 EDT "there needs to be a paradigm shift It must be reseaerched instead of relying on a flawed way. there are many different ways to get to an endpoint, u arent thiinking hard enough"; 2026-09-23 "Its gotta be nanoseconds"; 2026-09-24 14:39 "were not building a 400 B AI, we are building that and conscious being hyperintelligent like alien brain thing".
RESEARCH WHILE WORKING (his 19:46 rule, bounded): before you write a new path, read the tree's own prior attempt (the file you own, its notes/ file, its verdict) and, where a published way exists, read it (WebSearch or WebFetch, at most a few pages, never a session of its own); when a bar fails, read WHY before the fix and once more after; name what you read in your notes file's Measured section.
BUDGETS (64 GB here, shared with board 23's last builders, this board's other builder and the orchestrator's GSM8K rung): launch every bench through node tools/budget.mjs --ram-mb 4000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=4000 ...; before a bench read free RAM with node -e "console.log(Math.round(require('os').freemem()/1048576))" and wait while under 8000 MB free; run at most ONE bench process of your own at a time; NEVER run the whole bench/gate.mjs (run only your own test files with node --test <file>); never load organism/scale-52000; a bench that will write over 100 MB says so in its verdict; scratch copies go under ${SCRATCH}/<your item> (make the directory; delete it when done), never under state/ and never under /tmp.
Touch only the files you own (listed below) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/ (the orchestrator's), CLAUDE.md, bench/gate.mjs, bench/ladder.mjs, act/prompt.mjs, .github/workflows/*, .vercelignore, vercel.json, web/, or a file another item owns. Reading anything is fine except state/ (the deny list: runtime, never read, never listed in a report) and .vercel/ and .env.local (credentials: never open, never print). NEVER commit, stage, push, stash, reset or checkout: the orchestrator commits; git status --short and git diff are yours to read. Never print a token, key or URL value of any kind. bench/fixtures/ is never committed. No em-dashes anywhere you write (use a comma, a colon or a new sentence).
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, "barMet": true or false as a top-level boolean, a "split" object naming what was development and what was held out (and "contaminated": false or the reason; for a bar with no held-out data the split says so explicitly with "heldOut": "none" and why), and a one paragraph "statement" in plain prose a VC could read. (2) A test is added, never weakened; an assertion true of nothing is a defect. (3) Correct on the population you have: a check that has only ever seen one kind of row is not a check. (4) A perfect score is a missing measurement until the bar's command prints it. (5) The verdict names the control where one exists. (6) Return ONLY the schema fields; "printed" holds the bar command's key lines verbatim (under 1500 chars); "testsPrinted" holds the node --test tally line verbatim.`

const ITEMS = [
  {
    key: 'plateau',
    owns: 'generations/plateau.mjs (new), generations/velocity.mjs (the objective, the archive descriptors and the restart schedule only), generations/archive.mjs, bench/plateau.mjs (new), test/plateau.test.mjs (new), notes/plateau.md (new), bench/verdicts/plateau.json and plateau-partial.json (new). NOT bench/years.mjs, NOT generations/epochs.mjs, NOT daemon/.',
    task: `ITEM plateau (Board 13 item never launched; docs/HANDOFF.md lists it as pending: "node bench/plateau.mjs runs bench/plateau.mjs, to be built by its board item"; his P5 "evolve over billions of years in a bunch of seconds"; the finding that after 0.400 s nothing improves for 299.6 s; notes/multiply.md "The plateau": one instance alone reaches the suite's searched plateau (598 at length 96) inside 240 s, so a suite or a length cap the single instance does not saturate is the test that could show a gain). READ FIRST: notes/multiply.md (the plateau and tie-break paragraphs), bench/years.mjs and bench/verdicts/years.json (how organism-years are declared and printed: one organism-year is one generation of the whole population on a plane), generations/velocity.mjs and generations/archive.mjs as they stand, bench/verdicts/multiply.json (statement), and the published way (WebSearch, at most three pages: MAP-Elites / quality diversity archives, and restart schedules for evolutionary search). BUILD: (a) MEASURE the plateau exactly: score against organism-years at 0.1 s resolution over the run on five seeds for both planes (grid held-out and synthetic fresh draw), printing per seed the plateau second (the first second after which the score never rises again), the score there, and the seed-to-seed noise of the final score; (b) THREE INTERVENTIONS, each against the plain control on the same seeds: NOVELTY (MAP-Elites archive dimensions from behaviour descriptors of the program, so the search keeps cells that behave differently even when they score the same), TRANSFER (elites from the synthetic plane injected into the grid plane's population at each generation and back, the descriptor-matched ones only), RESTART (when the score has not risen for N seconds, the population is re-seeded from the archive's most distant cells; N a flag); (c) the combination that the three single runs say is best, run once more on five fresh seeds nobody tuned on. THE MACHINE IS SHARED tonight (board 23's last builders and the GSM8K rung): a run may be 60 s instead of 120 s and three seeds instead of five for the tuning runs, but the fresh-seed run of (c) uses five seeds; the verdict says exactly what was run. BAR (bench/plateau.mjs, bench/verdicts/plateau.json): per intervention and per plane, the held-out score at the end against the control's, the score gained per million organism-years AFTER the control's plateau second (the control gains zero there by definition), the plateau second under the intervention, all with the seed noise; barMet true only when the best combination on the fresh seeds beats the control's final score by more than the seed-to-seed noise on BOTH planes and moves the plateau second later on both; barMet false otherwise with every number printed (a false verdict with the band printed is a landing; a missing number is not). The split object names the fresh seeds as held out and says the tuning seeds never touched them.`,
  },
  {
    key: 'imagine',
    owns: 'mind/imagine.mjs, capability/grid-invent.mjs, bench/imagine.mjs, test/imagine.test.mjs, notes/imagine.md, bench/verdicts/imagine.json and imagine-*-partial.json. NOT bench/ladder.mjs, NOT bench/grid.mjs, NOT bench/public.mjs.',
    task: `ITEM imagine (board 17 wave 3, never landed; his 2026-09-23 "It also should hallucinate" and "a visionary, dreams" of 2026-09-26 21:03 EDT; P14 the imagination region against the search null). STATE ON DISK: bench/verdicts/imagine.json written 2026-09-26T19:52:35Z, isTheBar true, NO barMet: its statement says that on the 236 ARC-AGI-1 training tasks the fixed vocabulary timed out on (bench/verdicts/grid.json), the invented arm solved 5 with a program using an invented primitive and the null arm solved 5. READ FIRST, whole: notes/imagine.md, mind/imagine.mjs, capability/grid-invent.mjs, bench/imagine.mjs, test/imagine.test.mjs, the verdict (node -e, print its keys and statement), and bench/verdicts/dream.json (barMet true; the dream region is the sibling that already beats its null), then the published way (WebSearch, at most three pages: DreamCoder library learning / wake-sleep, and program synthesis with learned primitives on ARC). BUILD: (1) the bench decides barMet from its own rows: barMet true only when the invented arm solves MORE timed-out tasks than the null arm by more than the seed-to-seed band (at least three seeds, the band printed), false otherwise; the verdict on disk must carry a top-level barMet boolean and a split object (development: the training tasks the vocabulary was invented on; heldOut: the tasks scored; contaminated false only if the scored tasks never fed the invention). (2) ONE published idea applied to the invention step (a library of invented primitives kept across tasks, compression-scored, the way DreamCoder keeps a library), measured against the same null on the same seeds. (3) The trial that measures it: node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2 (the fixture bench/fixtures/public/arc-agi-1/training/ is present on this machine; if it is not, say so and stop). BAR: bench/verdicts/imagine.json isTheBar true with barMet decided by the rows; a false barMet with the band printed is a landing; test/imagine.test.mjs green under Node 24 with the tally printed.`,
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

const verifyPrompt = (it, built) => `You are the verify plane for item "${it.key}" of BOARD 24A in ${ROOT} (his Windows 11 machine, Node v24.15.0 on PATH, Git Bash through the Bash tool, 64 GB, MODEL OFF, never call Ollama). You are a skeptic: the builder's report is a claim, not a result. The builder owns ONLY: ${it.owns}. Its report: ${JSON.stringify(built).slice(0, 6000)}.
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
log(`BOARD 24A: ${items.length} items: ${items.map(i => i.key).join(', ')}`)
const results = (await pipeline(items, it => buildVerifyFix(it))).filter(Boolean)
const summary = {
  items: results.map(r => ({ key: r.key, landed: r.landed, barMet: r.barMet, verified: !!(r.verify && r.verify.ok), files: (r.built && r.built.files) || [], verdictFile: r.built && r.built.verdictFile, barCommand: r.built && r.built.barCommand, printed: r.built && r.built.printed, testsPrinted: r.built && r.built.testsPrinted, verifyPrinted: r.verify && r.verify.printed, problems: (r.verify && r.verify.problems) || [], unowned: (r.verify && r.verify.unowned) || [], open: (r.built && r.built.open) || [], reason: r.reason || null })),
  landed: results.filter(r => r.landed).length,
  barMet: results.filter(r => r.barMet).length,
  verified: results.filter(r => r.verify && r.verify.ok).length,
}
log(`BOARD 24A done: ${summary.landed} landed, ${summary.verified} verified, ${summary.barMet} bars met of ${results.length}`)
return summary
