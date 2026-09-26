export const meta = {
  name: 'board-21-census-yield',
  description: 'BOARD 21 (written in the $250 cloud session for the separate session that follows it, on his 17:16 and 17:18 EDT words): the CLOUD parts of queue items 5 and 7: census (the loop round that spawns a typed cell for a red bench, keeps it only if the bench moves, with the placebo control, the census written to bench/verdicts/census.json and read onto the site) and yield (the kept-per-hour line on the site read from the autopilot verdicts, with its own site bar). Model off; the LOCAL rungs (the builder cell on Ollama, self-code --gap, the autopilot bar) stay with his machine.',
  phases: [
    { title: 'Build', detail: 'Opus 5.5 builders on disjoint files, two at a time on this host; census and yield together (their bars are not timing bars)' },
    { title: 'Verify', detail: 'Opus 5.5 re-runs each bar and checks file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
  ],
}

const ROOT = (args && args.root) || '/home/user/brain'
const MARKER = (args && args.marker) || (ROOT + '/state/board21.marker')
const MODEL_BUILD = 'claude-opus-5-5'
const MODEL_VERIFY = 'claude-opus-5-5'

const COMMON = `You are one builder on BOARD 21 of the BRAIN project at ${ROOT} (the $250 cloud session; Linux; NODE 24 IS AT $HOME/node24/bin/node and the tree targets Node 24 (its gate parses the Node 24 test reporter): run EVERY node command with PATH="$HOME/node24/bin:$PATH" in front of it, in the same shell line, and confirm once with node -v that it prints v24.9.0 (the shell's default node is ${(args && args.node) || 'v22.22.2'} and its test tallies read as null in the gate); 4 CPUs, 16 GB RAM, about 30 GB free disk, ESM .mjs, ZERO npm dependencies, NO Ollama, NO GPU, NO Docker; the outbound proxy allows raw.githubusercontent.com and api.github.com (the environment holds GH_TOKEN and GITHUB_TOKEN: use a NAME, never print or store a value) and blocks dilation.dev and api.vercel.com). The owner's vision is verbatim in MANUAL.md section A; section B holds objectives P0 to P15 and STATE; docs/CLOUD-SESSION.md holds "The queue, in his order" with your item's text: read your item's paragraph there in full before anything else, and read MANUAL.md section B STATE (from the line "### STATE" to the end of the file) once. Never cat a file over 20 KB whole into your context: extract with node, grep or sed ranges.
HIS ORDERS THIS BOARD EXISTS FOR, verbatim: 2026-09-23 "Its gotta be nanoseconds.. it processes items in nanoseconds? so why cant this be nanoseconds."; 2026-09-23 21:51 "It also needs to evolve over billions of years in a bunch of seconds"; 2026-09-23 17:30 "It should live 24/7 on the cloud remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE"; 2026-09-26 10:05 EDT "Every request should be less than a token and it should be done in microseconds ... clock dilation, and I SHOULD BE ABLE TO TEST AND USE IT"; 2026-09-26 13:58 EDT "the whole vision MUST be done. it should be a GOD"; and the standing rule: HE authors the WHAT, the session owns the HOW, never reinterpret, never shrink, never a falsification engine, never a number a command did not print.
BUDGETS (16 GB here): launch every bench through node tools/budget.mjs --ram-mb 4000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=4000 ...; before a bench read free RAM with \`free -m\` and wait while under 4000 MB free; run at most ONE bench process of your own at a time; NEVER run the whole bench/gate.mjs; never load organism/scale-52000; a bench that will write over 100 MB says so in its note and rotates; total bench wall time for your item under 3 hours; a copy of the tree for a trial EXCLUDES organism/, state/, bench/fixtures/, web/dist/ and .git/ and is deleted when the trial ends. Never wait on a long run with a loop of sleeps: one Bash call with a timeout and an output file, read once; a run over 10 minutes is launched detached with nohup and its file is read after ONE sleep of its length.
Your item is ONE of two on DISJOINT files. Touch only the files you own (listed below) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/ (the orchestrator's), CLAUDE.md, bench/gate.mjs, bench/ladder.mjs, .github/workflows/cloud.yml, or a file another item owns. Reading anything is fine except state/ (the deny list). The tree is a git repository on branch claude/relaxed-volta-x31cmk: never commit, never push, never run any git write command. Never create an account, never enter or print a credential.
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, "barMet": true or false as a top-level boolean, a "split" object naming what was development and what was held out (and "contaminated": false or the reason), and a one paragraph "statement" in plain prose a reader can check against the fields. (2) A bar file is written ONCE when the run completes; a narrow or partial run writes <name>-partial.json with "isTheBar": false. (3) Write the verdict and the note the moment the bar is measured, then keep improving. (4) Tests use node:test, exit on their own, finish under 120 s, never call a model, never reach the network (mock the REST API with a planted local listener), never write the real tree, never process.exit before the write they exist to prove. (5) No em-dash character anywhere in a file you write; none in prose you print. (6) No dependencies; no socket but 127.0.0.1 and, for the host item, api.github.com. (7) Run your bar command yourself and paste its printed lines into your report. (8) A missed bar reported with its measured number is a landing; a number without a print is not; never widen a bar to pass it; never write "cannot be done": write what was measured and what the next rung is. (9) A CONTROL for every claim: the same command with the intervention off, and the run-to-run noise printed before any gap is called moved. (10) Every kept change carries its author line "board 20 builder" in the file header comment it adds. (11) Your final message is read by a machine: fill the schema; notes under 300 words. (12) MODEL OFF: nothing you build or run opens a model socket on this host.`

const ITEMS = [
  {
    key: 'census',
    owns: 'bench/spawn.mjs (the census and placebo path, behind a flag; every existing row and test stays green), ONE new round file under self/ (name it census-round.mjs) that the loop calls when model off, bench/verdicts/census.json and census-partial.json, test/census.test.mjs, notes/census.md, and in web/ ONLY the status block of the page that prints the cell count (name the file; never web/ladder.mjs, never web/ask.mjs, never web/build.mjs beyond registering your block).',
    task: `ITEM census (queue item 5, the CLOUD part). HIS WORDS, verbatim from docs/CLOUD-SESSION.md: "Adapt and generate cells: the organism grows its own census. His 10:51 words: '12000 cells is a little isnt it?' and 'it needs to adapat and generate cells or smthn'. A count typed by the orchestrator is the wrong kind of number; the organism must SPAWN cells where a bench misses and keep only the ones that pay." and "Item: inside the loop (self-code --auto), a round that reads the gap ledger, spawns a typed cell for a red bench (a solved template, a direct entry, a sequence program, a grid primitive), wires it, re-runs that bench on a copy, and keeps the cell only if the bench moves with no regression; the census (cells, edges, kinds, kept per hour) is written to bench/verdicts/census.json and read onto the site, never typed. Bar: node bench/spawn.mjs with a split object and barMet on cells kept per hour above the placebo (a random cell of the same kind) at the stated n. LOCAL first (the loop's builder is on Ollama), CLOUD for the census and the placebo control (CPU)." WHAT STANDS (read, never rewrite): bench/spawn.mjs and bench/verdicts/spawn.json (the spawn operator and its verdict); ask --spawn landed by hand 2026-09-26 10:59 EDT (act/prompt.mjs, region spawn: the first algebra question printed "1 cells spawned for this question, 1 kept"); the gap ledger state/self/gaps.jsonl is RUNTIME and may be absent on this host: then build it with the loop's own ledger writer model off (find the command in self/, say which) or read bench/verdicts/gaps.json; the four walls of the loop live under self/ (read self-code --auto's round code before writing yours). BUILD, model OFF (no Ollama here; the builder cell is the LOCAL rung and is out of scope): (1) self/census-round.mjs: one round that reads the gap ledger, picks the first red bench of a TYPED kind (solved template, direct entry, sequence program, grid primitive: the kinds the spawn operator already makes), spawns ONE typed cell for it through the existing operator, wires it into a COPY of the state directory (never the live state), re-runs that bench on the copy with the smallest documented form, and keeps the cell only if the bench's score moves and no control row regresses; (2) the PLACEBO in the same round: a random cell of the same kind through the same path, same n, kept by the same rule; (3) bench/spawn.mjs --census N (document the flag in the file header) runs N rounds and writes bench/verdicts/census.json from its own measurements: cells, edges, kinds, kept, keptPerHour, placeboKept, placeboKeptPerHour, n, rounds, the wall seconds, the split object (development: the red benches read from the ledger; heldOut: the benches never read while writing the round), isTheBar true, barMet true only if keptPerHour is above placeboKeptPerHour at the stated n with the noise band printed (bootstrap or the bench's own band), the statement; (4) the census read onto the site from that verdict file (the status block: cells, kinds, kept per hour, placebo, the verdict's at and file name beside them), never typed; (5) test/census.test.mjs: the round keeps nothing when the bench does not move, keeps the cell when it does (a fixture bench), the placebo runs the same path, the page block equals the verdict. RUN the bar with n at least 20 rounds inside the budget wrapper; a run under 20 rounds is a -partial. HE TESTS (keep it green): node bin/brain.mjs status dilation, then node bin/brain.mjs ask dilation "Solve for x, exactly. Answer with the value only, as an integer or a fraction: 3*x + 2 = 11" --provider null --spawn, then status again and reads cells.`,
  },
  {
    key: 'yield',
    owns: 'tools/yield.mjs (new), bench/yield-site.mjs (new), bench/verdicts/yield-site.json and yield-site-partial.json, test/yield.test.mjs, notes/yield.md, and in web/ ONLY a kept-per-hour block on the findings page (name the file; never web/ladder.mjs (board 20 spread owns the organism-years line), never web/ask.mjs, never web/build.mjs beyond registering your block).',
    task: `ITEM yield (queue item 7, the CLOUD part). HIS WORDS, verbatim from docs/CLOUD-SESSION.md: "Self-improving: the loop that runs without either of us. It exists: bench/verdicts/soak.json (2026-09-26 10:38Z, --soak 90 --author on, isTheBar true, barMet true, kept 0 of the candidates it tried, 13 model calls at a mean of 90.03 s). BrainAutopilot runs it at 05:00 daily and BrainLadder at 04:00. Item: the kept-per-hour line and the organism-years line on the site, read from the verdict, so the loop's yield is visible without a terminal. LOCAL. Bar: node bench/autopilot.mjs (bench/verdicts/autopilot-*.json)." The LOCAL bar (the loop on Ollama) is out of scope here; the CLOUD part is the LINE ON THE SITE and its own site bar. WHAT STANDS (read, never rewrite): bench/verdicts/soak.json; the autopilot verdicts on disk under bench/verdicts/ (list them with ls and node; autopilot-*.json and bench/verdicts/autopilot/*.jsonl); web/build.mjs and the page modules under web/ (site-ask's tab page web/ask.mjs shows how a page reads a verdict and prints the file name beside the number); bench/site-ask.mjs shows a site bar written by the bench. BUILD, model OFF: (1) tools/yield.mjs: reads every autopilot verdict and soak.json, prints one line per verdict (at, kept, candidates, model calls, mean seconds, kept per hour computed from the verdict's own wall seconds, never from the clock) and one summary line (the newest verdict's kept per hour, the 7 day kept per hour if the verdicts cover 7 days, else the span they cover, printed); (2) the kept-per-hour block on the findings page, read from the verdicts at build time, the verdict file names and their at fields beside the numbers; when the newest kept is 0 the line prints 0 (never softened, never hidden); (3) bench/yield-site.mjs: builds the site with node web/build.mjs into a temp dir (or reads web/dist after a build), reads the block back from the HTML, compares every number to the verdicts, writes bench/verdicts/yield-site.json (isTheBar true, barMet true only if every number on the page equals its verdict and the newest verdict is named; the split object: development the verdicts read, heldOut none, say so); (4) test/yield.test.mjs (a fixture verdict set: the line equals the fixture; a 0 kept prints 0; a missing verdict directory prints "no autopilot verdict on this host" and the bar is a -partial). The site build must stay byte-identical for every other page (compare sha256 of the other pages before and after; print them).`,
  },
]

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    landed: { type: 'boolean' },
    barMet: { type: 'boolean', description: 'true only if the verdict file carries isTheBar true and barMet true; a -partial verdict means false' },
    files: { type: 'array', items: { type: 'string' } },
    barCommand: { type: 'string' },
    printed: { type: 'string', description: 'the key printed lines of the bar command, verbatim, under 1500 chars' },
    verdictFile: { type: 'string' },
    testsCommand: { type: 'string' },
    testsPrinted: { type: 'string' },
    peakRssMb: { type: 'number', description: 'the largest RSS any process of yours reached, as printed' },
    modelCalls: { type: 'number', description: 'model sockets opened in total, 0 for a model-off item' },
    open: { type: 'string', description: 'what is not done or suspicious, and the next rung, under 300 words' },
  },
  required: ['landed', 'barMet', 'files', 'barCommand', 'printed', 'verdictFile', 'testsCommand', 'testsPrinted', 'peakRssMb', 'modelCalls', 'open'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    reran: { type: 'string', description: 'the commands you re-ran and their printed tallies, under 1200 chars' },
    findings: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['blocker', 'defect', 'note'] }, what: { type: 'string' }, where: { type: 'string' } }, required: ['severity', 'what', 'where'] } },
    strayFiles: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'reran', 'findings', 'strayFiles'],
}

const CONCISE = "[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]\n- You are a subagent reporting directly to a Fable 5.1 Orchestrator running under Ultracode.\n- DO NOT think out loud, explain your logic, or provide conversational pleasantries in your final response payload.\n- Execute your task internally. When returning the result, output ONLY the raw completed artifact (e.g., the exact code block, the specific terminal command output, or the strict data structure requested).\n- Minimize conversational tokens to protect the Orchestrator's context window. Every unnecessary word incurs extreme token penalties.\nThe work stays the same optimal work (every test, every bar, every printed number); only the payload shrinks: a schema field holds the number or the exact printed line, never a narrative."

async function run(prompt, opts) {
  try { return await agent(CONCISE + '\n\n' + prompt, opts) } catch (e) {
    const msg = String((e && e.message) || e)
    if (/model/i.test(msg) && opts && opts.model) {
      log(`${opts.label}: model ${opts.model} rejected (${msg.slice(0, 100)}); retrying with alias opus`)
      try { return await agent(CONCISE + '\n\n' + prompt, { ...opts, model: 'opus' }) } catch (e2) { log(`${opts.label}: failed again: ${String(e2 && e2.message || e2).slice(0, 160)}`); return null }
    }
    log(`${opts && opts.label}: agent error: ${msg.slice(0, 160)}`)
    return null
  }
}

const buildPrompt = it => `${COMMON}\n\nFILES YOU OWN: ${it.owns}\n\n${it.task}\n\nWhen done, fill the schema. "printed" must be pasted from your terminal, not typed from memory. barMet is true only if your verdict file says isTheBar true and barMet true.`
const verifyPrompt = (it, built, board) => `You are the verify plane for item "${it.key}" of ${board} in ${ROOT} (Linux, Node 22, 4 CPUs, 16 GB RAM, no Ollama, no GPU; api.github.com reachable with the token named GH_TOKEN, never printed). You are a skeptic: the builder's report is a claim, not a fact. The builder owns ONLY: ${it.owns}. Marker file (created before the board started): ${MARKER}. BUDGETS: read free RAM with free -m before re-running a bench and wait while under 4000 MB free; run benches through node tools/budget.mjs --ram-mb 4000; never run the whole bench/gate.mjs; never load organism/scale-52000; a bar that takes over 20 minutes is re-run in the smallest form it documents and you say so; a latency that differs from the builder's is noise, a count or accuracy that differs by more than the interval is not. The tree is a git repository: never run a git write command. Never read state/. Never cat a file over 20 KB whole.
BUILDER'S REPORT (JSON): ${JSON.stringify(built).slice(0, 7000)}
DO, in order, and paste the printed tallies: (1) re-run the builder's tests command; (2) re-run the bar command (the smallest documented form if it takes over 20 minutes; say so); (3) open the verdict file (node -e, never cat) and check that every number in its "statement" exists in its fields and matches what the bar printed within run-to-run noise, that it carries isTheBar, a top-level barMet boolean and a split object, and that barMet in the report agrees with the file; for the host item grep the verdict, the note and the printed lines for the token value (read the NAME from the environment and compare, never print it); (4) list files under ${ROOT} newer than the marker: find ${ROOT} -type f -newer ${MARKER} -not -path '*/.git/*' -not -path '*/state/*' -not -path '*/bench/fixtures/*' -not -path '*/web/dist/*' and report any outside the owned set as strayFiles (bench/verdicts/, notes/ and test/ files named for this item are fine; a file owned by another item of this board is a note, not a blocker, name it anyway; MANUAL.md, docs/ are the orchestrator's; a copy of the tree left on disk by a trial is a defect); (5) grep the builder's files for an em-dash character (U+2014), for a process.exit before a write, for a claim without its control or noise band, for a bare package import, for a secret pattern (ghp_, github_pat_, Bearer , token=) in any generated document, and for a listener or handle left open; (6) judge: pass is true only if the tests pass, the bar command runs to completion, the verdict matches the print, the report's barMet matches the file, and no stray file is this builder's. A missed bar reported honestly is a pass; a claimed number you could not reproduce is a blocker. Do not edit any file. Under 300 words in findings.`
const fixPrompt = (it, built, verdict) => `${COMMON}\n\nFILES YOU OWN: ${it.owns}\n\nYou are the FIX stage for item "${it.key}". The builder reported: ${JSON.stringify(built).slice(0, 4500)}\nThe verify plane FAILED it with: ${JSON.stringify(verdict).slice(0, 4500)}\nOriginal task, for the bar and the intent:\n${it.task}\n\nFix every blocker and defect on the files you own, re-run the tests and the bar, rewrite the verdict from the new run (a bar file is written once by a completed run; if you must re-measure, the new run's file replaces it and says so in "at"), and fill the schema with what your terminal printed.`

const summarise = (r) => {
  const final = r.fixed || r.built
  const v = r.verify2 || r.verify
  return {
    key: r.key,
    landed: !!(final && final.landed),
    barMet: !!(final && final.barMet),
    verified: !!(v && v.pass),
    modelCalls: final ? final.modelCalls : null,
    verdictFile: final ? final.verdictFile : null,
    files: final ? final.files : [],
    peakRssMb: final ? final.peakRssMb : null,
    printed: final ? String(final.printed).slice(0, 900) : '',
    open: final ? String(final.open).slice(0, 600) : 'no report',
    blockers: v ? v.findings.filter(f => f.severity !== 'note').map(f => `${f.severity}: ${f.what} @ ${f.where}`).slice(0, 8) : ['no verify'],
    strayFiles: v ? v.strayFiles : [],
  }
}

async function buildVerifyFix(it, board) {
  const built = await run(buildPrompt(it), { label: `build:${it.key}`, phase: 'Build', model: it.model || MODEL_BUILD, schema: BUILD_SCHEMA })
  if (!built) { log(`${it.key}: builder returned nothing`); return { key: it.key, built: null, verify: null, fixed: null, verify2: null } }
  log(`${it.key}: built landed=${built.landed} barMet=${built.barMet} modelCalls=${built.modelCalls} peakRss=${built.peakRssMb} MB; verifying`)
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

// args.only lists keys; args.skip removes keys. Launch: Workflow({scriptPath: "docs/boards/board-21.js", args: {root: "<checkout>", marker: "<scratch>/board21.marker"}}).
phase('Build')
const ONLY = new Set((args && Array.isArray(args.only)) ? args.only : [])
const SKIP = new Set((args && Array.isArray(args.skip)) ? args.skip : [])
const active = ITEMS.filter(it => !SKIP.has(it.key) && (ONLY.size ? ONLY.has(it.key) : true))
log(`BOARD 21: ${active.map(it => it.key).join(', ')} (${active.length} of ${ITEMS.length} items), model-off, on disjoint files`)
const results = (await parallel(active.map(it => () => buildVerifyFix(it, 'BOARD 21')))).filter(Boolean).map(summarise)
log(`BOARD 21 done: items verified ${results.filter(r => r.verified).length} of ${results.length}, bars met ${results.filter(r => r.barMet).length}; output tokens spent this turn ${budget.spent()}`)
return { items: results, tokensSpent: budget.spent() }
