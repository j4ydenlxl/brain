export const meta = {
  name: 'board-27-dead-share-all',
  description: 'BOARD 27 (the first local board of the banked week, his 2026-09-26 20:20 and 20:40 EDT orders: "100x more in a crunch", "Use subagent boards when u need to", "the endpoint at the end of the night is what matters"): nine items on disjoint files on his 64 GB, 32 CPU Windows machine. Route A induce (the paradigm shift), dead-share, ladder-arc, the two red gate tests (boundary, shell-windows), the 18 unsplit bar files, the one unnamed data file, the census loop inside runSoak, and the published GPT-4o and Opus 5.5 rows. Model OFF for every item (the one Ollama queue is taken by the GSM8K rung).',
  phases: [
    { title: 'Build', detail: 'Opus 5.5 builders on disjoint files, all nine at once' },
    { title: 'Verify', detail: 'Opus 5.5 skeptics re-run each bar and check file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
  ],
}

const ROOT = (args && args.root) || 'C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain'
const SCRATCH = (args && args.scratch) || (ROOT + '/state/board27')
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

const COMMON = `You are one builder on BOARD 27 of the BRAIN project at ${ROOT} (HIS WINDOWS 11 MACHINE, 32 CPUs, 64 GB RAM; Node v24.15.0 is on PATH: run node -v once and confirm it prints v24.15.0; the Bash tool is Git Bash (POSIX): forward slashes, absolute paths under the root, one command per line or ';' between them, never rely on '&&' chains to carry an exit code you then quote; PowerShell exists but you do not need it). Ollama is installed on this machine but the ONE Ollama queue is taken by the orchestrator's GSM8K rung tonight: EVERY item on this board is MODEL OFF (provider null, no socket, no model call); never start ollama, never call port 11434.
HIS ORDERS THIS BOARD EXISTS FOR, verbatim: 2026-09-26 20:20 EDT "What it did with $250, you need to able to 100x more in a crunch. WIthout compromising efficacy or efficiency"; "Match EVERY part of the vision ... Opus 5.5 level. NEEDS TO BE REACHED. Self improving over billions of years, MUST BE REACHED"; "Push everything the cloud session missed because it was cloud, this is local now"; 2026-09-26 20:40 EDT "U are to literally execute every word i told u, find a way. research, doesnt matter. i dotn care about the process. the endpoint at the end of the night is what matters"; 2026-09-26 19:46 EDT "U should learn how to research while working and also research before and after something goes wrong or something but not to an excess"; 2026-09-26 19:41 EDT "there needs to be a paradigm shift It must be reseaerched instead of relying on a flawed way. there are many different ways to get to an endpoint, u arent thiinking hard enough"; 2026-09-23 "Its gotta be nanoseconds"; 2026-09-24 14:39 "were not building a 400 B AI, we are building that and conscious being hyperintelligent like alien brain thing".
RESEARCH WHILE WORKING (his 19:46 rule, bounded): before you write a new path, read the tree's own prior attempt (the file you own, its notes/ file, its verdict) and, where a published way exists, read it (WebSearch or WebFetch, at most a few pages, never a session of its own); when a bar fails, read WHY before the fix and once more after; name what you read in your notes file's Measured section.
BUDGETS (64 GB here, shared with board 26 (six builders), board 24a still fixing imagine, and the orchestrator's GSM8K rung): launch every bench through node tools/budget.mjs --ram-mb 4000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=4000 ...; before a bench read free RAM with node -e "console.log(Math.round(require('os').freemem()/1048576))" and wait while under 8000 MB free; run at most ONE bench process of your own at a time; NEVER run the whole bench/gate.mjs (run only your own test files with node --test <file>); never load organism/scale-52000; a bench that will write over 100 MB says so in its verdict; scratch copies go under ${SCRATCH}/<your item> (make the directory; delete it when done), never under state/ and never under /tmp.
Touch only the files you own (listed below) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/ (the orchestrator's), CLAUDE.md, bench/gate.mjs, bench/ladder.mjs, act/prompt.mjs, .github/workflows/*, .vercelignore, vercel.json, web/, or a file another item owns. Reading anything is fine except state/ (the deny list: runtime, never read, never listed in a report) and .vercel/ and .env.local (credentials: never open, never print). NEVER commit, stage, push, stash, reset or checkout: the orchestrator commits; git status --short and git diff are yours to read. Never print a token, key or URL value of any kind. bench/fixtures/ is never committed. No em-dashes anywhere you write (use a comma, a colon or a new sentence).
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, "barMet": true or false as a top-level boolean, a "split" object naming what was development and what was held out (and "contaminated": false or the reason; for a bar with no held-out data the split says so explicitly with "heldOut": "none" and why), and a one paragraph "statement" in plain prose a VC could read. (2) A test is added, never weakened; an assertion true of nothing is a defect. (3) Correct on the population you have: a check that has only ever seen one kind of row is not a check. (4) A perfect score is a missing measurement until the bar's command prints it. (5) The verdict names the control where one exists. (6) Return ONLY the schema fields; "printed" holds the bar command's key lines verbatim (under 1500 chars); "testsPrinted" holds the node --test tally line verbatim.`

const ITEMS = [
  {
    key: 'dead-share-all',
    owns: 'genome/emit.mjs (the --dead-share landing only: a way to run it over every seed, nothing else in the emitter), generations/epochs.mjs (ONLY the call into the dead-share landing right after emitElite writes a seed, so a re-emit never writes a dead seed again), the seeds under organism/ that the census counts (rewritten in place by the emitter only, never by hand; NOT organism/scale-52000 or scale-52000-pruned: never loaded), tools/organism-census.mjs (ONLY so --all writes isTheBar true and a top-level barMet from the census it ran), bench/dead-share-all.mjs (new), bench/verdicts/dead-share-all.json (new) and dead-share-all-*-partial.json, bench/verdicts/census-all.json (re-written by its own command), test/dead-share-all.test.mjs (new), test/census.test.mjs and test/census-static.test.mjs (added cases only), notes/census.md (a new section "Every seed", appended only). NOT test/dead-share-bar.mjs, NOT bench/verdicts/dead-share.json (board 23 landed them; read them).',
    task: `ITEM dead-share-all (P8 the census; his 2026-09-23 "make sure the 5 million organism lines u wrote arent empty code, that all of the code is extremely important"; docs/VISION.md order 19). STATE, printed by bench/verdicts/census-all.json at 2026-09-27T14:42:52Z (node tools/organism-census.mjs --all --ticks 200 --max-cells 1000): 20 seeds counted, 4 skipped as over --max-cells (gen-0, gen-0-pruned, scale-52000, scale-52000-pruned); 2696 of 2922 declared cells ran, 4526 of 14655 declared edges delivered, 10168 of 20523 loaded lines load bearing. ONE seed is at dead share 0: organism/gen-1-4-4-1-4 (1299 of 1299 lines, 254 of 254 cells ran, 701 of 701 edges delivered) after board 23 item dead-share (commit 31a18ac) ran genome/emit.mjs --dead-share on it: wire a never-run cell where the census shows a reachable role, prune it where nothing reaches it, and land the result in place; test/dead-share-bar.mjs graded it on 18 held-out seeds (all lowered, after 0 to 0.007389). READ FIRST, whole: notes/census.md (the board 23 section), genome/emit.mjs --dead-share (how it wires, prunes, lands, records), test/dead-share-bar.mjs (the control, the provenance, the clone control, the held-out grading), tools/organism-census.mjs header (--seed, --all, --tag, what neverRanEventNoMail means: the census names 18, 2, 15, 6, 10, 12, 12, 12, 6, 17, 4, 17, 11, 23, 7, 10, 25, 6, 13 such cells on the other 19 seeds), bench/verdicts/census-all.json (node -e: the per-seed rows), generations/epochs.mjs emitElite (where a new seed is written). BUILD, MODEL OFF: (1) genome/emit.mjs --dead-share --all (or one call per seed from bench/dead-share-all.mjs: say which) lands every counted seed except gen-1-4-4-1-4 in place, each landing followed by that seed's own census (node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir bench/verdicts -- node --max-old-space-size=4000 tools/organism-census.mjs --seed organism/<seed> --ticks 200 --no-knockout --tag dead-share-all-<seed>), printing per seed: lines loaded, load bearing before and after, dead share before and after, cells wired, cells pruned, cells ran of declared, edges delivered of declared, wall seconds; at most TWO census processes at a time (the machine is shared with board 26, board 24a and the GSM8K rung); (2) the 4 skipped seeds: gen-0 and gen-0-pruned are over --max-cells 1000: measure whether the landing plus a census at --max-cells 2000 fits 15 minutes each and land them if so, else print the count and skip them by name; scale-52000 and scale-52000-pruned are never loaded (BUDGETS): skipped by name; (3) generations/epochs.mjs: right after emitElite writes a seed, the dead-share landing runs on it (a test with a planted small seed proves a freshly emitted seed comes out at dead share 0 and that the call happens once per emit); (4) tools/organism-census.mjs --all writes isTheBar true and barMet (true only when every counted seed prints dead share 0) from its own census, and the statement says which seeds were counted and which skipped by name; (5) bench/dead-share-all.mjs writes bench/verdicts/dead-share-all.json: the per-seed table with before and after, the totals before (from the 14:42:52Z census, quoted from that file, not typed) and after (from the new census-all run), isTheBar true, barMet true only when every counted seed is at 0, split heldOut none with why (a census of the tree's own seeds), the control named (the before census, and the clone control test/dead-share-bar.mjs already runs: cite its verdict, do not re-run it); (6) tests green: test/census.test.mjs, test/census-static.test.mjs, test/dead-share-all.test.mjs (the per-seed table has every counted seed, before and after are numbers, after is at most before on every row, the skipped list names the 4). The orchestrator un-ignores the landed seeds in .gitignore and commits them (list every seed directory that changed). BAR: node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir bench/verdicts -- node --max-old-space-size=4000 tools/organism-census.mjs --all --ticks 200 --max-cells 1000 printing load bearing lines equal to loaded lines on every counted seed (paste the census-all statement verbatim), then node bench/gate.mjs --load-bearing (read bench/gate.mjs for the row flag; print the row line) staying GREEN. Keep the whole item under 90 minutes of runs; a run that cannot finish writes a -partial and says what it covered.`,
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

const verifyPrompt = (it, built) => `You are the verify plane for item "${it.key}" of BOARD 27 in ${ROOT} (his Windows 11 machine, Node v24.15.0 on PATH, Git Bash through the Bash tool, 64 GB, MODEL OFF, never call Ollama). You are a skeptic: the builder's report is a claim, not a result. The builder owns ONLY: ${it.owns}. Its report: ${JSON.stringify(built).slice(0, 6000)}.
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
log(`BOARD 27: ${items.length} items: ${items.map(i => i.key).join(', ')}`)
const results = (await pipeline(items, it => buildVerifyFix(it))).filter(Boolean)
const summary = {
  items: results.map(r => ({ key: r.key, landed: r.landed, barMet: r.barMet, verified: !!(r.verify && r.verify.ok), files: (r.built && r.built.files) || [], verdictFile: r.built && r.built.verdictFile, barCommand: r.built && r.built.barCommand, printed: r.built && r.built.printed, testsPrinted: r.built && r.built.testsPrinted, verifyPrinted: r.verify && r.verify.printed, problems: (r.verify && r.verify.problems) || [], unowned: (r.verify && r.verify.unowned) || [], open: (r.built && r.built.open) || [], reason: r.reason || null })),
  landed: results.filter(r => r.landed).length,
  barMet: results.filter(r => r.barMet).length,
  verified: results.filter(r => r.verify && r.verify.ok).length,
}
log(`BOARD 27 done: ${summary.landed} landed, ${summary.verified} verified, ${summary.barMet} bars met of ${results.length}`)
return summary
