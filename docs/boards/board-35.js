export const meta = {
  name: 'board-35-fill-the-gaps',
  description: 'BOARD 35 (local, his machine, 2026-09-28, after checkpoint 3): his 13:12 order, "self improving to make it fill in the gaps is very high priority, 73 percent on the banked week". Four Opus 5.5 builders on disjoint files: the organism induces programs from its own graded mistakes and keeps the ones that generalise (self-learn); the exact readers cover every phrasing the self-query generator produces and the arithmetic reader that read "product" as a sum (readers-2); the program tier never answers a kind it has no program for, so a wrong exact answer is replaced by a refusal (program-guard); and one command, run by the autopilot every morning, generates queries, re-asks the ledger, learns, records the delta and turns every open miss group into a gap with a trial (self-loop). Each item: build, a skeptic re-runs the bar, one fix, a second verify.',
  phases: [{ title: 'Build' }, { title: 'Verify' }, { title: 'Fix' }, { title: 'Verify again' }],
};

const ROOT = (args && args.root) || 'C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain';
const SCRATCH = (args && args.scratch) || (ROOT + '/state/board35');
const ONLY = (args && args.only) || null;
const MODEL = 'claude-opus-5-5';

const CONCISE = [
  '[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]',
  '- You are a subagent reporting directly to a Fable 5.1 Orchestrator running under Ultracode.',
  '- DO NOT think out loud, explain your logic, or provide conversational pleasantries in your final response payload.',
  '- Execute your task internally. When returning the result, output ONLY the raw completed artifact (e.g., the exact code block, the specific terminal command output, or the strict data structure requested).',
  '- Minimize conversational tokens to protect the Orchestrator\'s context window. Every unnecessary word incurs extreme token penalties.',
  '',
  'The work itself stays the same optimal work: every test, every bar, every number printed by a command. Only the report shrinks: a schema field holds the number or the exact printed line, never a narrative; a list holds the items, never a paragraph per item.',
  '',
].join('\n');

const COMMON = [
  'TREE: ' + ROOT + ' (the BRAIN, its own git repository on master; Windows 11, Git Bash and PowerShell, Node v24, 32 CPUs, 64 GB; no python on this machine). Your scratch: ' + SCRATCH + '/<item> (create it; delete it when done). Three other builders and the orchestrator work in this tree at the same time: never touch a file outside the ones your item names; never run bench/gate.mjs, bench/ladder.mjs or bench/public.mjs --limit 0 on a whole set unless your item says so; never commit or stage; never edit MANUAL.md, docs/, CLAUDE.md, .github, .vercelignore, vercel.json, web/, capability/, state/ (except your scratch and what your item names under state/self/).',
  'MODEL OFF for everything: no Ollama, no network calls from the organism (the self-queries bench counts sockets; so must you). Downloading a public dataset is allowed only where your item says so, with its licence on a SOURCES.md line.',
  'HIS WORDS THAT RULE THIS BOARD (MANUAL.md section A, verbatim): "self improving to make it fill in the gaps is very high priority, 73 percent on the banked week" (13:12 EDT); "the whole goal is fronteir bench, very adaptive reasoning, learning from mistakes, simulating and stimulating itself by so many automatic queries and self iteration + superior coding skills + super long context window plus being a pro at everything and being able to respond to everything and doing everything natively eliminating the need of vibe coding"; "Its gotta work without me... EVERY GAP should be able to be filled by itself, ur just the engineer to author it".',
  'RESEARCH WHILE WORKING (his order): before writing a new path, read the tree\'s prior attempt (the files your item names as READ FIRST) and the published way; when something goes wrong, read why before fixing and once more after; bounded, never a session of its own.',
  'RULES: 1. never quote a number a command did not print; a verdict statement carries only numbers a printed line carries. 2. no em-dashes anywhere. 3. every bar verdict is JSON under bench/verdicts/ with at, command, isTheBar true, barMet, a split object (which rows were development, which held out, contaminated false or the reason), and a statement in words. 4. every bench runs under BUDGETS: node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <your scratch> -- node --max-old-space-size=4000 <bench> ...; one heavy bench at a time on the machine; wait while free RAM is under 8000 MB (PowerShell: (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024). 5. a control that cannot fail is not a control; an assertion that holds for any result is not an assertion; a claim in prose says exactly what the check shows. 6. a wrong exact answer is worse than a refusal: nothing you add may answer wrong where it refused before; every bar prints wrong and it must be 0. 7. a held-out set is written BEFORE the code that reads it and its ids hashed into the verdict; the GSM8K TEST records (bench/fixtures/public/gsm8k, the 1319 the ladder grades) are never read by anything that learns; development is the 200 ids bench/verdicts/math.json lists and any train split you download. 8. tests: node --test test/<item>.test.mjs, add-only to other test files. 9. notes/<item>.md: what was built, how to run it, what the numbers say, what remains. 10. report through the schema only; printed lines verbatim.',
].join('\n');

const ITEMS = [
  {
    key: 'self-learn',
    owns: 'self/learn.mjs (new), bench/self-learn.mjs (new), test/self-learn.test.mjs (new), notes/self-learn.md (new), bench/verdicts/self-learn.json, bench/verdicts/learned-programs.json (the learned store, new), bench/verdicts/self-learn-heldout.jsonl (new, written first), bench/fixtures/public/gsm8k/ (a train split may be added, with a line in bench/fixtures/public/SOURCES.md, add-only)',
    task: [
      'ITEM self-learn: THE ORGANISM LEARNS FROM ITS OWN MISTAKES, MODEL OFF. Today the re-ask of the mistakes ledger prints "learned 0" (bench/verdicts/mistakes.json, REASK all: fixed 2, still 18, refused 397, learned 0): nothing the organism got wrong ever changes what it does next. You build the step that does.',
      'READ FIRST: reason/induce.mjs (the program language: numbers of a prompt, ops, MAX_OPS 4, parse, compile, readProgram), bench/induce.mjs (how bench/verdicts/induce-programs.json, the kept store, was induced from the 200 development GSM8K records and graded), act/prompt.mjs lines 1060 to 1220 (programStore(), programAnswer(): how the tier loads a store, keeps shapes, and answers; opts.programs takes a path or a store object), self/mistakes.mjs and bench/verdicts/mistakes-ledger.jsonl (727 rows: id, source, prompt, gold, why, lesson shape), bench/verdicts/math.json (the 200 development ids).',
      'BUILD self/learn.mjs, export async function learn({ root, dry = false, limit = 0 }) and a CLI (node self/learn.mjs [--dry] [--limit N] [--json]): for every ledger row that has a prompt and a gold answer and belongs to a DEVELOPMENT record (a gsm8k id in bench/verdicts/math.json, or a row from a train split you add under bench/fixtures/public/gsm8k/ with its licence line; never a gsm8k test record, never an ARC row), induce candidate programs with reason/induce.mjs from the prompt\'s numbers to the gold, then keep a candidate only when it also fits at least 2 other development rows of the same lesson shape and contradicts none of them (fits: the program applied to that row\'s numbers gives that row\'s gold). Write the kept programs to bench/verdicts/learned-programs.json in the same shape the tier\'s store uses, each with its provenance (the row ids it was induced from and fit, the lesson shape, the date), never a test id. Merging with the existing store is NOT your file: act/prompt.mjs belongs to the program-guard item this board; you measure with a merged store OBJECT passed as opts.programs.',
      'THE HELD-OUT: before writing learn.mjs, write bench/verdicts/self-learn-heldout.jsonl: 60 development-record rows (from math.json ids or the train split) the induction never sees, chosen by a seeded shuffle, ids sha256 into the verdict. Contamination is disclosed honestly: if you wrote both the rows and the learner, split.contaminated names it.',
      'THE BAR bench/self-learn.mjs (under BUDGETS, --dir your scratch): (a) learn from the development rows and print kept programs, induced-from counts, shapes; (b) re-ask every held-out row through act/prompt.mjs ask() with provider null and opts.programs = the merged store object (induce-programs.json plus learned-programs.json): print answered, correct, wrong, refused; (c) the same 60 rows with the kept store alone (the control: what the tier already did); (d) the ledger re-ask for the 130 gsm8k rows the same two ways (this is the "learned" count the mistakes bench prints; the test-record rows are graded here ONCE, never iterated on: your loop of edit and re-run uses only (b) and (c)). BAR MET when held-out correct with the merged store exceeds the control by at least 8 rows, wrong with the merged store is 0 (rule 6: a learned program that answers a held-out row wrong is a defect, and the bar prints which), and tests pass. Print every count; the verdict statement quotes them.',
      'TESTS test/self-learn.test.mjs: a planted ledger of 6 rows of one shape where a 2-op program fits 5 and contradicts 1 (the learner keeps it only if the rule says so, and the test asserts the exact kept program text); a planted test-record id is refused by learn() with the exact reason; the held-out file\'s ids never appear in learned-programs.json provenance; dry mode writes nothing.',
    ].join('\n'),
  },
  {
    key: 'readers-2',
    owns: 'act/exact-kinds.mjs (extend), act/exact-read.mjs (extend, add-only), act/solve.mjs (add-only), bench/exact-kinds-heldout.jsonl (add-only), test/exact-kinds.test.mjs, test/solve.test.mjs (add-only), notes/exact-kinds.md (append a dated section), bench/verdicts/exact-kinds.json, bench/verdicts/self-queries.json and bench/verdicts/self-queries-misses.jsonl (rewritten by the bar you run, never by hand)',
    task: [
      'ITEM readers-2: THE READERS COVER WHAT THE ORGANISM ASKS ITSELF. Board 34\'s self-queries item (self/queries.mjs, bench/self-queries.mjs: 10000 generated questions over eight kinds with truth it did not write) printed asked 10000 answered 1186 correct 965 wrong 221 refused 8814: sequence, units, counting and comparison refused 1250 of 1250 each; arithmetic wrong 36 because exact.arith reads "the product of A and B" as A plus B; calendar wrong 71 and probability wrong 113 because the program tier answered them with integers (the program-guard item of this board takes the tier; you take the readers). That run preceded board 34\'s exact-kinds readers (act/exact-kinds.mjs, held out 106 of 106 on the builder\'s own phrasings). RE-RUN AFTER THOSE READERS LANDED (bench/verdicts/self-queries.json at 2026-09-28T17:51:40.859Z, the file on disk now): asked 10000 answered 6898 correct 6733 wrong 165 refused 3102; wrong by kind arithmetic 36, calendar 16, probability 113, the other five kinds wrong 0; answered of 1250 by kind: arithmetic 1135, sequence 631, units 1129, calendar 539, counting 908, spelling 763, comparison 961, probability 832; the misses file now holds 39 groups and 3267 rows. Work from the files on disk, never from the numbers of the first run.',
      'READ FIRST: self/queries.mjs (every template of every kind: byTemplate in bench/verdicts/self-queries.json names them and their counts), bench/verdicts/self-queries-misses.jsonl (39 groups, 3267 rows as re-run after the readers landed: the 165 wrong rows and the refused groups by count), act/exact-kinds.mjs, act/exact-read.mjs, act/solve.mjs (FORMAT_TAIL_RE, exact.arith), test/exact-kinds.test.mjs, bench/exact-kinds.mjs and its held-out.',
      'BUILD: first re-run the self-queries bar as it stands to see what the exact-kinds readers already cover (node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <scratch> -- node --max-old-space-size=4000 bench/self-queries.mjs --n 5000 --seed 34 --seed 35 --nowrite --json > <scratch>/before.json) and record its per-kind line. Then extend the readers so every template of the eight kinds is read: the arithmetic phrasing defect (product, quotient, difference, sum, "A times B", "A more than B"), sequences (next term, nth term, missing term of arithmetic and geometric and simple recursive sequences), units (how many X in a Y, convert, abbreviations, is how many), counting (letters, words, vowels, occurrences, digits), comparison (greater, smaller, larger, bigger, smallest of three, colon forms, just-number forms), calendar (ISO weekday, days between, day after N days), probability (cards, dice, coins as fractions in lowest terms), spelling (backwards, nth letter). A reader answers only what it read completely and refuses the rest (rule 6). Do not read self/queries.mjs\'s truth functions into the readers: the readers are written from the question forms, and the generator\'s truth is the independent check.',
      'THE BAR: the self-queries bench at two FRESH seeds, held out by construction, run ONCE at the end: node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <scratch> -- node --max-old-space-size=4000 bench/self-queries.mjs --n 5000 --seed 36 --seed 37. Its own bar rules: wrong 0 on every kind, answered share at least 0.5 over the 10000. Development runs use seeds 34 and 35 with --nowrite. Also re-run bench/exact-kinds.mjs (its held-out must stay 106 of 106 wrong 0) and the census control node bench/conceive.mjs --limit 0 --nowrite --json (the other kinds keep their counts; print the organism native and correct line before and after). BAR MET when the fresh-seed run prints wrong 0 on every kind and answered share at least 0.5, the exact-kinds held-out keeps wrong 0, the census kinds outside the eight keep their correct counts, and tests pass.',
      'TESTS: test/exact-kinds.test.mjs gains one test per kind with three phrasings each taken from the generator\'s templates and one near-miss that must refuse; test/solve.test.mjs (add-only) pins "the product of 7 and 8" as 56 and "7 more than 8" as 15.',
    ].join('\n'),
  },
  {
    key: 'program-guard',
    owns: 'act/prompt.mjs (the program tier only: programStore(), programAnswer(), mathShape() and the constants beside them; plus ONE guarded load of bench/verdicts/learned-programs.json after induce-programs.json inside programStore(), add-only), reason/induce.mjs (add-only if a shape reader is needed), test/act-prompt.test.mjs (add-only), bench/program-guard.mjs (new), bench/verdicts/program-guard.json, bench/verdicts/program-guard-heldout.jsonl (new, written first), notes/program-guard.md (new)',
    task: [
      'ITEM program-guard: A WRONG EXACT ANSWER IS WORSE THAN A REFUSAL. The program tier (act/prompt.mjs programAnswer(): kept programs induced from development GSM8K word problems, answered when a prompt has mathShape) answered 113 card-probability prompts and 71 ISO-weekday prompts with integers (bench/verdicts/self-queries-misses.jsonl, the wrong rows of kinds probability and calendar), answers gsm8k.991 with 42 (bench/verdicts/mistakes.json REASK gsm8k wrong-now 1), and pre-empts the exact solver on the fixture rows alg-01, alg-02, alg-04 and word-08 (notes/mistakes.md). Yesterday it answered 65 to "What is 7 * 8 * 9?" until EXPRESSION_RE refused explicit expressions. Each of these is one symptom: the tier answers by SHAPE OF NUMBERS, not by the kind of question.',
      'READ FIRST: act/prompt.mjs lines 1060 to 1360 (the tier, PROGRAM_TIER counters, mathShape, EXPRESSION_RE, QUANTITY_CUE), reason/induce.mjs, bench/verdicts/induce-programs.json (every kept program and the development rows it fit: what a program is FOR), bench/verdicts/self-queries-misses.jsonl wrong rows, bench/verdicts/mistakes-ledger.jsonl rows with why wrong-program, test/act-prompt.test.mjs (the planted-store tests: plantedStore, newBrain).',
      'BUILD the guard so that the tier answers a prompt only when the prompt is of the KIND the matching program was induced for: a kept program carries the question forms it fit (the cue words and the unit or role of its quantities from its development rows; add them to the store entries add-only if absent); a prompt whose cue words name a different kind (a weekday, a date, a card, a die, a coin, a probability, a percent chance, a letter, a word count, a unit conversion, a sequence term, a comparison) is refused by the tier and left to the exact path or to a refusal. The exact path runs before the tier and the tier never answers a prompt the exact path READ and refused for a reason (rule 6). Add the guarded load of bench/verdicts/learned-programs.json (the self-learn item writes it; absent today: the load must be a no-op when the file is missing, and a store entry without provenance is never loaded).',
      'THE HELD-OUT, written before the guard: bench/verdicts/program-guard-heldout.jsonl: 120 prompts, 60 that the tier must REFUSE (drawn by a seeded shuffle from the self-queries wrong rows across calendar and probability, plus 10 you write for weekday, cards, dice, percent chance, letters, sequences) and 60 development GSM8K word problems the kept store answered RIGHT before (from bench/verdicts/induce-programs.json fits, never a test record), ids sha256 into the verdict.',
      'THE BAR bench/program-guard.mjs (under BUDGETS): through ask() with provider null and the real store: (a) the 60 must-refuse prompts: the tier answers 0 (print asked, answered by the tier, wrong); (b) the 60 must-keep development problems: the tier still answers them right (print before and after counts; a drop of more than 2 fails the bar); (c) the wrong rows of bench/verdicts/self-queries-misses.jsonl (165 at 2026-09-28T17:51:40.859Z: arithmetic 36, calendar 16, probability 113): wrong by the tier 0; (d) the four fixture rows alg-01, alg-02, alg-04, word-08 and gsm8k.991: the exact path or a refusal, never a wrong tier answer; (e) the control: with the guard OFF (a flag), (a) and (c) reproduce the wrong answers (a guard that changes nothing is not a guard: print both arms). BAR MET when (a) is 0, (b) drops at most 2, (c) is 0, (d) holds, (e) shows the control arm answering wrong, and tests pass.',
      'TESTS test/act-prompt.test.mjs (add-only): a planted store whose program fit a money word problem is refused on a weekday prompt with the same number shape, and still answers the money problem; a learned-programs.json planted in a temp dir loads only entries with provenance; PROGRAM_TIER counts the refusal under a named counter.',
    ].join('\n'),
  },
  {
    key: 'self-loop',
    owns: 'self/loop.mjs (new), bench/self-loop.mjs (new), test/self-loop.test.mjs (new), notes/self-loop.md (new), bench/verdicts/self-loop.json, state/self/loop/ (runtime records, never committed), self/autopilot.mjs (ONE guarded candidate source, add-only), self/gaps.mjs (FORMS entries add-only), bench/self-queries.mjs (add-only flags --group and --template if missing)',
    task: [
      'ITEM self-loop: ONE COMMAND THAT MAKES THE ORGANISM FILL ITS OWN GAPS, RUN BY THE AUTOPILOT EVERY MORNING WITHOUT HIM. His words: "Its gotta work without me... EVERY GAP should be able to be filled by itself". Today the pieces exist apart: self/queries.mjs generates questions (bench/self-queries.mjs), self/mistakes.mjs ledgers every graded-wrong row and re-asks it (bench/mistakes.mjs --reask), self/gaps.mjs turns a missed bar into a gap row with a trial (state/self/gaps.jsonl, FORMS), self/autopilot.mjs picks a candidate gap and runs its trial (tools/schedule-autopilot.mjs tick() runs node self/autopilot.mjs at 05:00 as the BrainAutopilot task), and this board\'s self-learn item writes self/learn.mjs (export async function learn({ root, dry, limit }) returning { kept, tried, shapes }; it may not exist yet when you build: import it dynamically and skip with a printed line when absent).',
      'READ FIRST: self/autopilot.mjs (how candidates are gathered and a trial run, what a decision file under bench/verdicts/autopilot/ records), tools/schedule-autopilot.mjs tick() and tickArgv(), self/gaps.mjs (FORMS, LADDER_FORMS, trialOf, how the ledger is rebuilt), bench/self-queries.mjs (flags, output, misses file shape: group rows with count, wrong, refused; wrong rows), bench/mistakes.mjs (--reask, --since), test/gaps.test.mjs, test/gate-autonomy.test.mjs (the AUTONOMY row\'s rules: every counted gap carries a trial; a decision file under 48 h).',
      'BUILD self/loop.mjs, CLI node self/loop.mjs [--dry] [--n 2000] [--seed <s>] [--json]: one tick does, in order, (1) the self-queries generator at a fresh seed (default: the day number since 2026-01-01, so every morning asks new questions) with --n 2000, writing its misses to state/self/loop/<date>-misses.jsonl (not to bench/verdicts); (2) the ledger re-ask (self/mistakes.mjs, model off) and, if self/learn.mjs exists, learn() then the re-ask again, so the record shows learned before and after; (3) the diff against the previous record in state/self/loop/: which miss groups closed (answered right now), which opened, which stayed; (4) every open group becomes a gap row for state/self/gaps.jsonl (kind self-query group, subsystem act, measured wrong and refused counts, bar wrong 0 and refused 0, trial = the self-queries bench filtered to that group at the same seed, through a FORMS entry you add to self/gaps.mjs so trialOf() resolves it), and the record state/self/loop/<date>.json holds every count; (5) ONE printed line: LOOP <date>: asked N answered N correct N wrong N refused N; groups open N closed N opened N; ledger learned before N after N; gaps written N. Dry mode prints the line and writes nothing. Then add ONE guarded candidate source to self/autopilot.mjs: when a loop record exists, its open groups are candidates ranked by count, each with its trial, so the 05:00 tick can run one; the dry tick (node self/autopilot.mjs --dry) must list them.',
      'THE BAR bench/self-loop.mjs (under BUDGETS, in a scratch copy of state/self/loop so the real records are not touched: pass --state-dir): two ticks in a row at seeds you choose; the second tick\'s record names the first as previous and prints closed, opened, stayed that equal a count you compute independently from the two misses files in the bench (the control: the loop\'s diff against the bench\'s own diff, printed side by side); a planted closure (the bench passes --plant-closed <group>, which marks one group answered in the previous record) prints closed 1 for that group; every gap row the second tick wrote resolves through self/gaps.mjs trialOf() to a command that exits 0 when run (run each, print the count, the AUTONOMY row\'s rule); node self/autopilot.mjs --dry lists the loop\'s candidates (print the lines); sockets 0 across both ticks. BAR MET when all of those hold and tests pass. Print every count.',
      'TESTS test/self-loop.test.mjs: the diff on planted misses files (closed, opened, stayed exact); the seed of the day is deterministic for a planted date; dry mode writes nothing; a gap row it writes has kind, trial and files; the FORMS entry resolves through trialOf() to an existing bench file.',
    ].join('\n'),
  },
];

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    landed: { type: 'boolean', description: 'every file in the item\'s list written and the bar run to its end' },
    barMet: { type: 'boolean', description: 'exactly what the bar command printed, never inferred' },
    files: { type: 'array', items: { type: 'string' }, description: 'every file written or changed, repo-relative' },
    barCommand: { type: 'string', description: 'the exact bar command, copy-pasteable from the tree root' },
    printed: { type: 'string', description: 'the bar command\'s summary lines verbatim (every line that carries a number), 40 lines at most' },
    verdictFile: { type: 'string' },
    testsCommand: { type: 'string' },
    testsPrinted: { type: 'string', description: 'the tests, pass and fail lines verbatim' },
    open: { type: 'array', items: { type: 'string' }, description: 'what remains or was found, one line each' },
    read: { type: 'array', items: { type: 'string' }, description: 'the READ FIRST files actually read, and what each changed in the design, one line each' },
  },
  required: ['landed', 'barMet', 'files', 'barCommand', 'printed', 'verdictFile', 'testsCommand', 'testsPrinted', 'open', 'read'],
};

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean', description: 'true only when no problem survived your own re-run' },
    barMet: { type: 'boolean', description: 'what YOUR re-run printed' },
    printed: { type: 'string', description: 'your re-run\'s summary lines verbatim, 40 lines at most' },
    testsPrinted: { type: 'string' },
    ownershipOk: { type: 'boolean' },
    unowned: { type: 'array', items: { type: 'string' }, description: 'files changed outside the item\'s list (git status --short and git diff --stat against the index), empty when none' },
    statementNumbersUnprinted: { type: 'array', items: { type: 'string' }, description: 'every number in the verdict statement no printed line carries, empty when none' },
    problems: { type: 'array', items: { type: 'string' }, description: 'file:line and the defect, one line each; empty when none' },
  },
  required: ['ok', 'barMet', 'printed', 'testsPrinted', 'ownershipOk', 'unowned', 'statementNumbersUnprinted', 'problems'],
};

const buildPrompt = (it) => [CONCISE, COMMON, '', 'YOU OWN ONLY: ' + it.owns + '. Read each file you own that exists, whole, before editing it.', it.task, '', 'When done: delete your scratch, then report through the schema.'].join('\n');

const verifyPrompt = (it, build, again) => [
  CONCISE, COMMON, '',
  'YOU ARE THE SKEPTIC for item ' + it.key + (again ? ' after its fix pass' : '') + '. Assume the build report is wrong until you have re-run it yourself. Edit nothing outside ' + SCRATCH + '/' + it.key + '-verify (your scratch).',
  'THE ITEM OWNS ONLY: ' + it.owns,
  'THE ITEM\'S TASK WAS: ' + it.task,
  'THE BUILD REPORTED: ' + JSON.stringify(build).slice(0, 7000),
  'CHECK, and re-run everything yourself: 1. git status --short and git diff --stat against the index: every changed or new file outside the owned list is unowned (list them). 2. Re-run the bar command exactly (under BUDGETS, --dir your scratch) and the tests; compare every printed number with the report. 3. Read the verdict file: isTheBar, barMet, the split object, the statement; list every number in the statement no printed line carries. 4. Read the held-out file\'s mtime against the code\'s and the ids hash. 5. Rule 6: search the printed lines and the verdict for any wrong count above 0 and for any kind that answers now where it refused before with a wrong answer. 6. Plant one failing case per control in your scratch (a copied test) and show each control can fail; a control that cannot fail is a problem. 7. For prose claims in notes and the statement, check each against what the code does.',
  'Report through the schema; problems as file:line and the defect, one line each.',
].join('\n');

const fixPrompt = (it, build, verify) => [
  CONCISE, COMMON, '',
  'YOU FIX item ' + it.key + '. YOU OWN ONLY: ' + it.owns + '.',
  'THE ITEM\'S TASK WAS: ' + it.task,
  'THE BUILD REPORTED: ' + JSON.stringify(build).slice(0, 5000),
  'THE SKEPTIC FOUND: ' + JSON.stringify(verify).slice(0, 5000),
  'Fix every problem in code (never by weakening a bar, a control or a test; never by editing an unowned file: if the skeptic listed unowned files, revert your item\'s changes to them with git checkout -- <file> for tracked files or delete new ones, and find another way inside your list), re-run the bar and the tests, and report through the schema with the per-problem outcome in open (one line per problem: what changed, which line).',
].join('\n');

async function buildVerifyFix(it) {
  const build = await agent(buildPrompt(it), { label: 'build:' + it.key, phase: 'Build', model: MODEL, schema: BUILD_SCHEMA });
  if (!build) return { key: it.key, build: null, verify: null, fix: null, verify2: null };
  const verify = await agent(verifyPrompt(it, build, false), { label: 'verify:' + it.key, phase: 'Verify', model: MODEL, schema: VERIFY_SCHEMA });
  if (!verify || (verify.ok && verify.barMet && verify.ownershipOk && !verify.problems.length && !verify.statementNumbersUnprinted.length)) return { key: it.key, build, verify, fix: null, verify2: null };
  const fix = await agent(fixPrompt(it, build, verify), { label: 'fix:' + it.key, phase: 'Fix', model: MODEL, schema: BUILD_SCHEMA });
  if (!fix) return { key: it.key, build, verify, fix: null, verify2: null };
  const verify2 = await agent(verifyPrompt(it, fix, true), { label: 'verify2:' + it.key, phase: 'Verify again', model: MODEL, schema: VERIFY_SCHEMA });
  return { key: it.key, build, verify, fix, verify2 };
}

const items = ONLY ? ITEMS.filter((it) => String(ONLY).split(',').includes(it.key)) : ITEMS;
log('board 35: ' + items.map((it) => it.key).join(', '));
const results = await pipeline(items, (it) => buildVerifyFix(it));
const done = results.filter(Boolean);
return {
  items: done,
  landed: done.filter((r) => r.build && r.build.landed).length,
  barMet: done.filter((r) => { const last = r.fix || r.build; return last && last.barMet; }).length,
  verified: done.filter((r) => { const v = r.verify2 || r.verify; return v && v.ok && v.barMet && !v.problems.length; }).length,
};
