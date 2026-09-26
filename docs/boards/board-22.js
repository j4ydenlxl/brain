export const meta = {
  name: 'board-22-induce',
  description: 'BOARD 22 (written at the end of the $250 cloud session for the first session of the banked week, on his 19:41 EDT research order): Route A of docs/RESEARCH-PARADIGM.md, program induction over a small DSL on the GSM8K development records, the held-out 200 asked through the kept programs only, the first number that would show the paradigm shift (heldOut right above 0 with provenance program, 0 model calls, microseconds). Model off, CPU only.',
  phases: [
    { title: 'Build', detail: 'Opus 5.5 builders on disjoint files, two at a time on this host; one builder, one verify, one fix at most' },
    { title: 'Verify', detail: 'Opus 5.5 re-runs each bar and checks file ownership' },
    { title: 'Fix', detail: 'one Opus 5.5 fix per failed verify, then a second verify' },
  ],
}

const ROOT = (args && args.root) || '/home/user/brain'
const MARKER = (args && args.marker) || (ROOT + '/state/board22.marker')
const MODEL_BUILD = 'claude-opus-5-5'
const MODEL_VERIFY = 'claude-opus-5-5'

const COMMON = `You are one builder on BOARD 22 of the BRAIN project at ${ROOT} (the $250 cloud session; Linux; NODE 24 IS AT $HOME/node24/bin/node and the tree targets Node 24 (its gate parses the Node 24 test reporter): run EVERY node command with PATH="$HOME/node24/bin:$PATH" in front of it, in the same shell line, and confirm once with node -v that it prints v24.9.0 (the shell's default node is ${(args && args.node) || 'v22.22.2'} and its test tallies read as null in the gate); 4 CPUs, 16 GB RAM, about 30 GB free disk, ESM .mjs, ZERO npm dependencies, NO Ollama, NO GPU, NO Docker; the outbound proxy allows raw.githubusercontent.com and api.github.com (the environment holds GH_TOKEN and GITHUB_TOKEN: use a NAME, never print or store a value) and blocks dilation.dev and api.vercel.com). The owner's vision is verbatim in MANUAL.md section A; section B holds objectives P0 to P15 and STATE; docs/CLOUD-SESSION.md holds "The queue, in his order" with your item's text: read your item's paragraph there in full before anything else, and read MANUAL.md section B STATE (from the line "### STATE" to the end of the file) once. Never cat a file over 20 KB whole into your context: extract with node, grep or sed ranges.
HIS ORDERS THIS BOARD EXISTS FOR, verbatim: 2026-09-23 "Its gotta be nanoseconds.. it processes items in nanoseconds? so why cant this be nanoseconds."; 2026-09-23 21:51 "It also needs to evolve over billions of years in a bunch of seconds"; 2026-09-23 17:30 "It should live 24/7 on the cloud remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE"; 2026-09-26 10:05 EDT "Every request should be less than a token and it should be done in microseconds ... clock dilation, and I SHOULD BE ABLE TO TEST AND USE IT"; 2026-09-26 13:58 EDT "the whole vision MUST be done. it should be a GOD"; and the standing rule: HE authors the WHAT, the session owns the HOW, never reinterpret, never shrink, never a falsification engine, never a number a command did not print.
BUDGETS (16 GB here): launch every bench through node tools/budget.mjs --ram-mb 4000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=4000 ...; before a bench read free RAM with \`free -m\` and wait while under 4000 MB free; run at most ONE bench process of your own at a time; NEVER run the whole bench/gate.mjs; never load organism/scale-52000; a bench that will write over 100 MB says so in its note and rotates; total bench wall time for your item under 3 hours; a copy of the tree for a trial EXCLUDES organism/, state/, bench/fixtures/, web/dist/ and .git/ and is deleted when the trial ends. Never wait on a long run with a loop of sleeps: one Bash call with a timeout and an output file, read once; a run over 10 minutes is launched detached with nohup and its file is read after ONE sleep of its length.
Your item is the ONE item of this board. Touch only the files you own (listed below) plus new files named for your item under bench/verdicts/, notes/ and test/. Never edit MANUAL.md, docs/ (the orchestrator's), CLAUDE.md, bench/gate.mjs, bench/ladder.mjs, .github/workflows/cloud.yml, or a file another item owns. Reading anything is fine except state/ (the deny list). The tree is a git repository on branch claude/relaxed-volta-x31cmk: never commit, never push, never run any git write command. Never create an account, never enter or print a credential.
RULES. (1) Never quote a number a command did not print. A verdict JSON is written by the bench from its own measurements with an ISO "at", the "command", the "node" version, "isTheBar": true, "barMet": true or false as a top-level boolean, a "split" object naming what was development and what was held out (and "contaminated": false or the reason), and a one paragraph "statement" in plain prose a reader can check against the fields. (2) A bar file is written ONCE when the run completes; a narrow or partial run writes <name>-partial.json with "isTheBar": false. (3) Write the verdict and the note the moment the bar is measured, then keep improving. (4) Tests use node:test, exit on their own, finish under 120 s, never call a model, never reach the network (mock the REST API with a planted local listener), never write the real tree, never process.exit before the write they exist to prove. (5) No em-dash character anywhere in a file you write; none in prose you print. (6) No dependencies; no socket but 127.0.0.1 and, for the host item, api.github.com. (7) Run your bar command yourself and paste its printed lines into your report. (8) A missed bar reported with its measured number is a landing; a number without a print is not; never widen a bar to pass it; never write "cannot be done": write what was measured and what the next rung is. (9) A CONTROL for every claim: the same command with the intervention off, and the run-to-run noise printed before any gap is called moved. (10) Every kept change carries its author line "board 20 builder" in the file header comment it adds. (11) Your final message is read by a machine: fill the schema; notes under 300 words. (12) MODEL OFF: nothing you build or run opens a model socket on this host.`

const ITEMS = [
  {
    key: 'induce',
    owns: 'reason/induce.mjs (new: the DSL, the parse, the bottom-up search, the kept-program store), bench/induce.mjs (new: the bar), bench/verdicts/induce.json and induce-partial.json, test/induce.test.mjs, notes/induce.md; bench/ns.mjs ONLY a new arm that asks the held-out records through the kept programs (every existing arm and row unchanged, its verdict fields kept); act/prompt.mjs ONLY the wiring of the kept programs into the solved tier behind an option that is off by default, so every existing test stays green.',
    task: `ITEM induce (ROUTE A of docs/RESEARCH-PARADIGM.md, his 2026-09-26 19:41 EDT order: "there needs to be a paradigm shift It must be reseaerched instead of relying on a flawed way. there are many different ways to get to an endpoint, u arent thiinking hard enough"). READ FIRST, whole: docs/RESEARCH-PARADIGM.md (under 12 KB) and queue item 1 of docs/CLOUD-SESSION.md. THE FLAW, measured: a template is the same question with other numbers, a held-out record is a new question; the word reader answered 1 of 200 held-out GSM8K records (bench/verdicts/ns.json heldOut). THE ROUTE: a question is parsed into quantities and relations, the answer is a short program in a fixed DSL (extract, add, subtract, multiply, divide, half, twice, per, total, remaining, compare, and what the development records need, named in your notes); the organism searches programs bottom-up that reproduce the DEVELOPMENT answers, keeps the programs that reproduce many development records (an abstraction, the way tasks/grid.mjs keeps grid primitives), and answers a held-out record with the program whose parse matches, the program as provenance, a program run in microseconds, 0 model calls. THE SPLIT, never crossed: development = the records bench/public.mjs gsm8kDevIds names plus every record a journal under bench/verdicts names (ns.json's split object lists them); held out = the 200 ns.json heldOut ids; a held-out record is NEVER read while the DSL, the parse or a program is written; the parse and the DSL are written against development records only, and your notes say which records you looked at. BUILD, model OFF: (1) reason/induce.mjs: parse(sentence) to quantities with roles and the cue words around them; a DSL of at most 24 primitives with a one-line meaning each; search(record) bottom-up to depth 4 over the parsed quantities, returning every program that reproduces the answer; abstract(programs) keeping the programs that reproduce the most development records under the same cue pattern; answer(sentence, kept) that runs the first matching kept program; a store of kept programs written by the bench (a JSON under bench/verdicts/ or a file the notes name; never state/); (2) bench/induce.mjs: runs the search over every development record, then asks the 200 held-out records THROUGH THE KEPT PROGRAMS ONLY, and writes bench/verdicts/induce.json from its own measurements: development reproduced (n and share), programs kept, held-out answered, held-out right, median ns per answer, the split object (development ids, heldOut ids, contaminated none or the reason), modelCalls 0, isTheBar true, barMet true only if held-out right is above 0 with provenance program (queue item 1's bar is 1; the first number above 0 is the shift; write barMet against 1 and print the share); a run under the whole development set is a -partial; (3) bench/ns.mjs: a new arm "program" beside the template arm, asking the held-out records through the kept programs, its share written beside heldOut.share (the existing fields unchanged); (4) act/prompt.mjs: the kept programs consulted in the solved tier behind an option off by default (say the flag), provenance "program"; HE TESTS: node bin/brain.mjs ask dilation "Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?" --provider null with the option on prints 72 with provenance program; (5) test/induce.test.mjs: the parse on 5 development sentences (quote them by id), a program reproducing a known development answer, abstraction keeping a program that covers 2 planted records, the held-out ids never opened by the search (a fixture that throws when a held-out id is read during search), the ask wiring off by default. RUN the bar inside the budget wrapper; print every tally; a miss is written with its number, never softened.`,
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

// args.only lists keys; args.skip removes keys. Launch: Workflow({scriptPath: "docs/boards/board-22.js", args: {root: "<checkout>", marker: "<scratch>/board22.marker"}}).
phase('Build')
const ONLY = new Set((args && Array.isArray(args.only)) ? args.only : [])
const SKIP = new Set((args && Array.isArray(args.skip)) ? args.skip : [])
const active = ITEMS.filter(it => !SKIP.has(it.key) && (ONLY.size ? ONLY.has(it.key) : true))
log(`BOARD 22: ${active.map(it => it.key).join(', ')} (${active.length} of ${ITEMS.length} items), model-off, on disjoint files`)
const results = (await parallel(active.map(it => () => buildVerifyFix(it, 'BOARD 22')))).filter(Boolean).map(summarise)
log(`BOARD 22 done: items verified ${results.filter(r => r.verified).length} of ${results.length}, bars met ${results.filter(r => r.barMet).length}; output tokens spent this turn ${budget.spent()}`)
return { items: results, tokensSpent: budget.spent() }
