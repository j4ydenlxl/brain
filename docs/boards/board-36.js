export const meta = {
  name: 'board-36-leftovers-and-the-gain',
  description: 'BOARD 36 (local, his machine, 2026-09-28 evening, after board 35 landed uncommitted): his "LOCK THE FUCK IN" at 86 percent of the banked week. Two lanes of Opus 5.5 builders on disjoint files. Lane one: the two measured leftovers of board 35 on the learner and the guard (rule-7 disclosure of the program index, the production loader applying the learned retractions), then the gain itself (the self-learn bar printed learned 0 and a ceiling of 769 of 7613: measure the ceiling by cause, raise it add-only, re-run the same bar). Lane two: the pinned leftovers of the developers doc, the self-loop and the readers (six probes pinned, the seed split disclosed, seeds 38 and 39 run fresh). Each item: build, a skeptic re-runs the bar, one fix, a second verify.',
  phases: [{ title: 'Build' }, { title: 'Verify' }, { title: 'Fix' }, { title: 'Verify again' }],
};

const ROOT = (args && args.root) || 'C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain';
const SCRATCH = (args && args.scratch) || (ROOT + '/state/board36');
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
  'TREE: ' + ROOT + ' (the BRAIN, its own git repository on master; Windows 11, Git Bash and PowerShell, Node v24, 32 CPUs, 64 GB; no python on this machine). Your scratch: ' + SCRATCH + '/<item> (create it; delete it when done). Another builder and the orchestrator work in this tree at the same time: never touch a file outside the ones your item names; never run bench/gate.mjs, bench/ladder.mjs or bench/public.mjs --limit 0 on a whole set; never commit or stage; never edit MANUAL.md, docs/ (except docs/DEVELOPERS.md, which the pins item owns), CLAUDE.md, .github, .vercelignore, vercel.json, web/, capability/, state/ (except your scratch and state/board35/self-loop for the pins item).',
  'GIT IS READ-ONLY FOR YOU: never git checkout, git stash, git reset, git clean, git restore or git commit. The tree carries uncommitted work of the other item; an edit you must undo is undone by hand, edit by edit, from git diff.',
  'MODEL OFF for everything: no Ollama, no network calls from the organism (the benches count sockets; so must you).',
  'HIS WORDS THAT RULE THIS BOARD (MANUAL.md section A, verbatim): "LOCK THE FUCK IN!!!!" (18:5x EDT today); "self improving to make it fill in the gaps is very high priority" (13:12 EDT today); "Its gotta work without me... EVERY GAP should be able to be filled by itself, ur just the engineer to author it"; "I NEVER WANT TO HEAR "No, we are far from the vision" again. after tonight "Yes. we are close. No lies"": a verdict says what its command printed, met or not met, never softened and never inflated.',
  'RESEARCH WHILE WORKING (his order): before writing a new path, read the tree\'s prior attempt (the files your item names as READ FIRST) and the published way; when something goes wrong, read why before fixing and once more after; bounded, never a session of its own.',
  'RULES: 1. never quote a number a command did not print; a verdict statement carries only numbers a printed line carries. 2. no em-dashes anywhere. 3. every bar verdict is JSON under bench/verdicts/ with at, command, isTheBar true, barMet, a split object (which rows were development, which held out, contaminated false or the reason), and a statement in words. 4. every bench runs under BUDGETS: node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <your scratch> -- node --max-old-space-size=4000 <bench> ...; one heavy bench at a time on the machine; wait while free RAM is under 8000 MB (PowerShell: (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024). 5. a control that cannot fail is not a control; an assertion that holds for any result is not an assertion; a claim in prose says exactly what the check shows. 6. a wrong exact answer is worse than a refusal: nothing you add may answer wrong where it refused before; every bar prints wrong and it must be 0. 7. a held-out set is written BEFORE the code that reads it and its ids hashed into the verdict; the GSM8K TEST records (bench/fixtures/public/gsm8k, the 1319 the ladder grades) are never read by anything that learns; development is the 200 ids bench/verdicts/math.json lists and the train split on disk. 8. tests: node --test test/<item>.test.mjs, add-only to other test files. 9. notes/<item>.md: what was built, how to run it, what the numbers say, what remains. 10. report through the schema only; printed lines verbatim. 11. line numbers in your task were measured on the files as they are now; re-find the line by its text before editing.',
].join('\n');

const ITEMS = [
  {
    key: 'learn',
    lane: 'learn',
    owns: 'bench/program-guard.mjs, notes/program-guard.md, bench/verdicts/program-guard.json, bench/verdicts/induce-programs.json (the devRows descriptor, add-only, written by --forms), act/prompt.mjs (learnedInto() and the PROGRAM_TIER counters only), test/act-prompt.test.mjs (add-only), self/learn.mjs, bench/self-learn.mjs, test/self-learn.test.mjs, notes/self-learn.md, bench/verdicts/self-learn.json, bench/verdicts/learned-programs.json (rewritten by the bar)',
    task: [
      'ITEM learn: TWO MEASURED LEFTOVERS OF BOARD 35 ON THE LEARNER AND THE GUARD, FIXED AS WRITTEN, THEN BOTH BARS RE-RUN. Nothing here is a redesign.',
      'READ FIRST: notes/program-guard.md, notes/self-learn.md, bench/verdicts/program-guard.json and bench/verdicts/self-learn.json (their statements and split objects as they stand), act/prompt.mjs learnedInto() and programStore(), self/learn.mjs mergeStores(), bench/program-guard.mjs writeForms() and the verdict split near the text "the must-keep rows (b)", bench/self-learn.mjs (the COMMAND constant near line 58, the arm name near line 174, the split near line 267 and the what near line 273).',
      '(P1) RULE-7 DISCLOSURE OF THE PROGRAM INDEX. Measured by the orchestrator last session with node: the 533 devRows of bench/verdicts/induce-programs.json are ALL in bench/verdicts/ns.json rows.development (1090 ids) and 0 in its heldOut 200; only 95 of them are in bench/verdicts/math.json\'s 200 ids; 438 are GSM8K test records that board 26\'s induce named development (induce-programs.json development.source is ns.json rows.development; the store\'s 814 entries fit 533 distinct records, the same split). The index adds no reading beyond what induce did, so the fix is DISCLOSURE, not a rewrite. Re-count all of it with node yourself and print the counts. Then, add-only: (a) writeForms() writes a descriptor object beside store.devRows.rows (for example store.devRows.split = { inMathDevelopment, outsideMathDevelopment, inNsDevelopment, inNsHeldOut, wording }) whose wording says the store was fit on these records before board 35 and that 438 of them are GSM8K test records outside the 200 development ids of math.json, so every measure on them is development, never held out; re-run node bench/program-guard.mjs --forms (add-only: it must print "had" for forms and write the descriptor without changing any row); (b) the verdict split.development.what (near line 439) carries the same counts and wording; (c) notes/program-guard.md near lines 15 and 20 says the same in one sentence each. Also self-learn\'s testPopulation (1119 = the 1319 GSM8K test records minus the 200) holds 890 ns-development rows the kept store was fit on, 200 ns heldOut and 29 neither: re-count with node, then say so in bench/self-learn.mjs split.testPopulation (near line 267) and in notes/self-learn.md.',
      '(P3) APPLY THE RETRACTIONS IN THE PRODUCTION LOADER. act/prompt.mjs learnedInto() (near lines 1236 to 1258) never reads bench/verdicts/learned-programs.json `retract` (22 entries, 29 forms; shape { level, pattern, program, forms, wrongRows, rightRows, date, by }); self/learn.mjs mergeStores (near lines 510 to 537) shows the application: remove x.forms from the kept entry\'s forms.roles, record forms.retracted, count the unapplied. Add exactly that to learnedInto(), with PROGRAM_TIER counters retracted and retractUnapplied, never removing an entry; a retraction only refuses (rule 6). Add a test to test/act-prompt.test.mjs modelled on its planted-store test near line 1088 (plantedStore(BAKER, \'sub(mul(q0,q1),q2)\', 1) with a learned file that holds only `retract`): after the load the planted form is refused, the entry stays, the counter reads 1. Then bench/self-learn.mjs: the arm name near line 174 and the `what` near line 273 ("does not apply the retract list" becomes: applies it); notes/self-learn.md near lines 56 to 58 and 92 to 94 say the loader now applies them; test/self-learn.test.mjs near lines 62 to 70 gains the control where the 6th planted row fits too (refusedContradiction 0).',
      'RE-RUN, under BUDGETS with --dir your scratch: node --max-old-space-size=4000 bench/self-learn.mjs (the COMMAND constant; about the time the note says; expect the production loader arm on the 60 held-out rows to print wrong 0 where it printed 2, and the statement to say so); node bench/program-guard.mjs (its (f) arm reads the overlay through the production loader: print its line before and after your change); node --test test/act-prompt.test.mjs test/self-learn.test.mjs.',
      'THE BAR for this item: bench/verdicts/program-guard.json barMet stays true, with the devRows descriptor present in induce-programs.json and its counts equal to the node count you printed; bench/verdicts/self-learn.json\'s production-loader arm prints wrong 0 on the 60 held-out rows, its split.testPopulation carries the three counts, and its barMet stays false on gain with the statement saying gain 0 against the bar 8 (that is the honest verdict; the learn-2 item that follows you takes the gain); every number in both statements is printed by a line; tests pass. Print every count.',
    ].join('\n'),
  },
  {
    key: 'learn-2',
    lane: 'learn',
    owns: 'self/learn.mjs, reason/induce.mjs (add-only), bench/self-learn.mjs, test/self-learn.test.mjs, notes/self-learn.md (append a dated section), bench/verdicts/self-learn.json, bench/verdicts/learned-programs.json (rewritten by the bar); read-only: bench/fixtures/public/gsm8k/ (the train split on disk), bench/verdicts/self-learn-heldout.jsonl (never rewritten), bench/verdicts/induce-programs.json, act/prompt.mjs',
    task: [
      'ITEM learn-2: THE GAIN. bench/verdicts/self-learn.json (the run of 2026-09-28T19:29:03.605Z, re-run once more by the learn item before you) is BAR NOT MET on gain: 0 programs learned from 7466 mistakes; the support gate (0 wrong and at least 60 right on programs learned on one half of the development rows and asked on the other) validated no support (at 2 others right 31 wrong 8; at 3 others 21 and 7; at 4 others 16 and 6; at 5 others 1 and 1; at 6 others 1 and 1; at 7 others 0 and 0); the ceiling of ANY rule over role-pattern programs is 769 of 7613 development rows (notes/self-learn.md, "What remains"). So the loop that is meant to fill the organism\'s gaps learns nothing today. Your job is the ceiling first, then the gain, by the same bar.',
      'READ FIRST: notes/self-learn.md whole; self/learn.mjs whole; reason/induce.mjs (the language: the numbers of a prompt, the ops, MAX_OPS, patternAt(), questionForm(), makeRecordReader(); what a program can and cannot see); bench/self-learn.mjs; twenty records of the GSM8K train split under bench/fixtures/public/gsm8k/ (each carries a worked solution with <<expression=value>> calculator annotations: read what those chains use); bench/verdicts/induce-programs.json (what a kept entry looks like and what its forms are); act/prompt.mjs programAnswer() (how a program is run on a prompt at ask time: which leaves exist).',
      'MEASURE FIRST, and print it (a flag of bench/self-learn.mjs, its table in the verdict): THE CEILING BY CAUSE over the development rows: for each row no role-pattern program at MAX_OPS reaches, which of these holds, in this order, the first that holds: (1) the gold needs a number that is not in the prompt (a word quantity: dozen, week, half, twice, a percent written as a word, a unit constant; test by adding the candidate constant leaves and searching again); (2) the worked chain, parsed from the <<a op b=c>> annotations into a straight-line program over the prompt numbers and earlier intermediates, runs on the prompt numbers to the gold but needs more steps than MAX_OPS; (3) the parsed chain does not reproduce the gold at all on the prompt numbers (a number in the chain comes from the text, not the numbers); (4) the role parse of the prompt fails or the pattern misassigns (the chain reproduces the gold but no pattern at any level matches); (5) other. The counts sum to the unreachable count; print reachable, unreachable and the five counts.',
      'THEN RAISE THE CEILING on the largest cause, add-only in reason/induce.mjs and self/learn.mjs, never removing a check and never widening the gate: for example straight-line programs read from the worked chain (a sequence of ops over prompt numbers and earlier intermediates, length up to 8), generalised by the same role pattern and validated by the same support gate; or a word-quantity table (dozen 12, week 7, half 0.5, twice 2, ...) as extra leaves that the reader admits only when the word is in the prompt. Choose by the cause counts, say why in the note, and keep every existing rule: the strict contradiction rule, the retractions, the 2-fold support gate, rule 6 wrong 0, the held-out file untouched, the 1119 test-population rows graded ONCE at the end and never iterated on.',
      'THE BAR is the item\'s own bar, unchanged: node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <your scratch> -- node --max-old-space-size=4000 bench/self-learn.mjs (the COMMAND constant): gain on the 60 held-out rows at least 8 with wrong 0, the ledger test rows graded once, tests pass. Print the ceiling by cause before and after, the support-gate table before and after, the held-out counts of both arms, and the test-population counts. BAR MET only when the bar prints it. If the gain stays under 8, barMet false is the honest verdict and the statement names the ceiling before and after, the cause table and the largest cause left. A learned program that answers a held-out row wrong is a defect the bar prints by id.',
      'TESTS test/self-learn.test.mjs add-only: the cause classifier on five planted rows, one per cause, prints the cause named; a planted train record whose chain has three annotated steps yields the straight-line program text you assert; a planted word quantity is read only when its word is in the prompt; the new steps or leaves never change what the old rule keeps on the board 35 planted ledger (the kept program text is unchanged).',
    ].join('\n'),
  },
  {
    key: 'pins',
    lane: 'pins',
    owns: 'docs/DEVELOPERS.md (this item only; the docs/ rule yields for this one file), bench/developers.mjs (add-only), test/developers.test.mjs (add-only), bench/verdicts/developers.json, self/loop.mjs, bench/self-loop.mjs, test/self-loop.test.mjs, notes/self-loop.md, bench/verdicts/self-loop.json, state/board35/self-loop/ (the bench scratch), test/solve.test.mjs (add-only), test/exact-kinds.test.mjs (add-only), notes/exact-kinds.md (append), bench/self-queries.mjs (the split text and DEV_SEEDS only), bench/exact-kinds.mjs (add-only, the control flag), bench/verdicts/self-queries.json, bench/verdicts/self-queries-misses.jsonl, bench/verdicts/exact-kinds.json',
    task: [
      'ITEM pins: THREE MEASURED LEFTOVERS OF BOARD 35, FIXED AS WRITTEN, EACH BAR RE-RUN. Nothing here is a redesign; each is a pinned line. Do (P5) FIRST, because its 2-second self-queries run rewrites two verdict files the other lane reads.',
      '(P5) READERS-2: THE PINS, THE SPLIT, THE FRESH SEEDS. Probes measured by the orchestrator with node last session: "What\'s the product of 1,000 and 2?" gives solve null AND exactKinds null (the comma guard holds); "What is the product of 1000 and 2?" gives 2000 by exact.arith; "Which is bigger, 3 or 5? Answer yes or no." gives null; "Is 7 greater than 3? Answer yes or no." gives yes by exact.comparison; "difference of 3 and 5" gives null; "of 5 and 3" gives 2. Re-probe each with node, then pin the six in test/solve.test.mjs (the block near line 104) and test/exact-kinds.test.mjs (its refuses and reads helpers), add-only, asserting what printed. notes/exact-kinds.md near lines 100 to 108 says the bar seeds 36 and 37 were asked twice (before and after the fix), so bench/self-queries.mjs\'s split (near lines 484 to 486; DEV_SEEDS near line 71) must say that seeds 34 and 35 were development for the readers and that 36 and 37 were read once before the fix; the statement must contain the word "contaminat" with that reason, or the gate\'s CONTAMINATION row goes RED (bench/gate.mjs near lines 953 to 1000 is the rule: read it). Seeds 38 and 39 have never been asked: run the bar there fresh, ONCE, before any other edit of this item: node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/self-queries.mjs --n 5000 --seed 38 --seed 39 (about 2 s; it rewrites bench/verdicts/self-queries.json and self-queries-misses.jsonl; then make the split edit and re-run it once more so the file carries the split). Two templates answer nothing by design (counting.occurrences.casual-how-many 0 of 115, spelling.backwards.reverse-the-letters 0 of 138): say so in the note. The census control blind spot: bench/exact-kinds.mjs near line 145 unplugs only kindsReader, not the act/exact-read.mjs spoken rewrites: add the second unplug to the control (add-only, a flag), re-run bench/exact-kinds.mjs under BUDGETS and print the control line both ways; its held-out must stay 106 of 106 wrong 0.',
      '(P2) THE DEVELOPERS DOC ROW THAT TURNS THE GATE RED. docs/DEVELOPERS.md near lines 72 to 76 holds the row `solve 2x + 3 = 11` | `program` | `31`; that prompt is now refused by memory (board 35\'s guard), so bench/developers.mjs and test/developers.test.mjs (14 tests) disagree with the document. Run node bin/brain.mjs ask dev ... (it needs node bin/brain.mjs init dev first; state/ is gitignored) to see what prints, then node bench/developers.mjs (about 16 s) and node --test test/developers.test.mjs; change the row to what prints (isMiss near bench/developers.mjs line 489 prints `miss`) and the prose around it; never change the bench to fit the document. Re-run both; bench/verdicts/developers.json must print its bar met and the test its full count passing.',
      '(P4) SELF-LOOP: FOUR PINNED DEFECTS. (i) The skeptic MEASURED that an eval:true worker nested inside the re-ask worker (act/run.mjs near lines 155 and 386, reached through self/mistakes.mjs runTests near line 712) made a real connect under the file-main preload (it printed ECONNREFUSED 127.0.0.1:9 and the socket count stayed unchanged), so self/loop.mjs near lines 39 to 44 ("EVERY thread") and notes/self-loop.md near lines 57 to 60 are false for nested workers: change the words to exactly what is covered, and make record.sockets.notCovered (self/loop.mjs near line 397) name nested eval workers and child processes. (ii) parseArgs (near line 148) must refuse --plant-closed without --dry (a planted closure on a real record is a lie): print the refusal and exit 2, and test it. (iii) bench/self-loop.mjs near lines 178 to 187: beside the dropped-group control add a renamed-group control (the same counts, one group renamed; the diff must differ; print both controls). (iv) The split text names the first bar run at seeds 268 and 269 (18:52:15Z, refused 20 and 11) and says that HELD_OUT is a constant in the bench (near line 49): make the split say exactly that. Re-run: node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir state/board35/self-loop -- node --max-old-space-size=4000 bench/self-loop.mjs --state-dir state/board35/self-loop (about 90 s) and node --test test/self-loop.test.mjs (12 today, plus the ones you add).',
      'THE BAR for this item: bench/verdicts/developers.json bar met; bench/verdicts/self-loop.json barMet true with the renamed-group control printed and the sockets words true of the code; bench/verdicts/self-queries.json at seeds 38 and 39 barMet by its own rules (wrong 0 on every kind, answered share at least 0.5) with the split naming the contamination as written above; bench/verdicts/exact-kinds.json held out 106 of 106 wrong 0 with both control arms printed; tests: node --test test/developers.test.mjs test/self-loop.test.mjs test/solve.test.mjs test/exact-kinds.test.mjs all pass. Print every count.',
    ].join('\n'),
  },
];

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    landed: { type: 'boolean', description: 'every file in the item\'s list written and every bar run to its end' },
    barMet: { type: 'boolean', description: 'exactly what the bar command printed, never inferred; for an item with several bars, true only when every one printed met' },
    files: { type: 'array', items: { type: 'string' }, description: 'every file written or changed, repo-relative' },
    barCommand: { type: 'string', description: 'the exact bar command(s), copy-pasteable from the tree root, one per line' },
    printed: { type: 'string', description: 'the bar commands\' summary lines verbatim (every line that carries a number), 60 lines at most' },
    verdictFile: { type: 'string', description: 'the verdict file(s), one per line' },
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
    barMet: { type: 'boolean', description: 'what YOUR re-run printed (every bar of the item)' },
    printed: { type: 'string', description: 'your re-run\'s summary lines verbatim, 60 lines at most' },
    testsPrinted: { type: 'string' },
    ownershipOk: { type: 'boolean' },
    unowned: { type: 'array', items: { type: 'string' }, description: 'files changed outside the item\'s list and outside the other item\'s list and outside the orchestrator\'s (MANUAL.md, tools/.reorient-stamp, web/dist/), empty when none' },
    statementNumbersUnprinted: { type: 'array', items: { type: 'string' }, description: 'every number in a verdict statement no printed line carries, empty when none' },
    problems: { type: 'array', items: { type: 'string' }, description: 'file:line and the defect, one line each; empty when none' },
  },
  required: ['ok', 'barMet', 'printed', 'testsPrinted', 'ownershipOk', 'unowned', 'statementNumbersUnprinted', 'problems'],
};

const othersOf = (it) => ITEMS.filter((o) => o.key !== it.key).map((o) => o.key + ': ' + o.owns).join(' | ');

const buildPrompt = (it, prior) => [CONCISE, COMMON, '', 'YOU OWN ONLY: ' + it.owns + '. Read each file you own that exists, whole, before editing it. THE OTHER ITEMS OWN (never touch): ' + othersOf(it) + '.', prior ? 'THE ITEM BEFORE YOU ON THESE FILES (learn) REPORTED: ' + prior : '', it.task, '', 'When done: delete your scratch, then report through the schema.'].join('\n');

const verifyPrompt = (it, build, again) => [
  CONCISE, COMMON, '',
  'YOU ARE THE SKEPTIC for item ' + it.key + (again ? ' after its fix pass' : '') + '. Assume the build report is wrong until you have re-run it yourself. Edit nothing outside ' + SCRATCH + '/' + it.key + '-verify (your scratch).',
  'THE ITEM OWNS ONLY: ' + it.owns,
  'THE OTHER ITEMS OWN (their changes are theirs, not unowned): ' + othersOf(it) + '. The orchestrator owns MANUAL.md, tools/.reorient-stamp and web/dist/.',
  'THE ITEM\'S TASK WAS: ' + it.task,
  'THE BUILD REPORTED: ' + JSON.stringify(build).slice(0, 7000),
  'CHECK, and re-run everything yourself: 1. git status --short and git diff --stat: every changed or new file outside the owned list, the other items\' lists and the orchestrator\'s is unowned (list them). 2. Re-run every bar command exactly (under BUDGETS, --dir your scratch; the self-queries bar at seeds 38 and 39 is re-run with --nowrite so the fresh-seed file is not rewritten a third time) and the tests; compare every printed number with the report. 3. Read each verdict file: isTheBar, barMet, the split object, the statement; list every number in the statement no printed line carries. 4. Read the held-out file\'s mtime against the code\'s and the ids hash. 5. Rule 6: search the printed lines and the verdicts for any wrong count above 0 and for any kind that answers now where it refused before with a wrong answer. 6. Plant one failing case per control in your scratch (a copied test) and show each control can fail; a control that cannot fail is a problem. 7. For prose claims in notes, docs/DEVELOPERS.md and the statements, check each against what the code does. 8. Line-numbered pins in the task: check the edit landed at the text named, not only near the number.',
  'Report through the schema; problems as file:line and the defect, one line each.',
].join('\n');

const fixPrompt = (it, build, verify) => [
  CONCISE, COMMON, '',
  'YOU FIX item ' + it.key + '. YOU OWN ONLY: ' + it.owns + '. THE OTHER ITEMS OWN (never touch): ' + othersOf(it) + '.',
  'THE ITEM\'S TASK WAS: ' + it.task,
  'THE BUILD REPORTED: ' + JSON.stringify(build).slice(0, 5000),
  'THE SKEPTIC FOUND: ' + JSON.stringify(verify).slice(0, 5000),
  'Fix every problem in code (never by weakening a bar, a control or a test; never by editing an unowned file: if the skeptic listed unowned files, undo your item\'s edits to them BY HAND from git diff, never with git checkout or git restore, and find another way inside your list), re-run the bars and the tests, and report through the schema with the per-problem outcome in open (one line per problem: what changed, which line).',
].join('\n');

async function buildVerifyFix(it, prior) {
  const build = await agent(buildPrompt(it, prior), { label: 'build:' + it.key, phase: 'Build', model: MODEL, schema: BUILD_SCHEMA });
  if (!build) return { key: it.key, build: null, verify: null, fix: null, verify2: null };
  const verify = await agent(verifyPrompt(it, build, false), { label: 'verify:' + it.key, phase: 'Verify', model: MODEL, schema: VERIFY_SCHEMA });
  if (!verify || (verify.ok && verify.ownershipOk && !verify.problems.length && !verify.statementNumbersUnprinted.length)) return { key: it.key, build, verify, fix: null, verify2: null };
  const fix = await agent(fixPrompt(it, build, verify), { label: 'fix:' + it.key, phase: 'Fix', model: MODEL, schema: BUILD_SCHEMA });
  if (!fix) return { key: it.key, build, verify, fix: null, verify2: null };
  const verify2 = await agent(verifyPrompt(it, fix, true), { label: 'verify2:' + it.key, phase: 'Verify again', model: MODEL, schema: VERIFY_SCHEMA });
  return { key: it.key, build, verify, fix, verify2 };
}

const summary = (r) => {
  if (!r) return 'no report';
  const v = r.verify2 || r.verify;
  const b = r.fix || r.build;
  return 'barMet ' + (b && b.barMet) + '; skeptic ok ' + (v && v.ok) + '; printed: ' + String((v && v.printed) || (b && b.printed) || '').slice(0, 2500) + '; open: ' + JSON.stringify((b && b.open) || []).slice(0, 1200);
};

const wanted = ONLY ? String(ONLY).split(',') : ITEMS.map((it) => it.key);
const byKey = Object.fromEntries(ITEMS.map((it) => [it.key, it]));
log('board 36: ' + wanted.join(', '));

const laneLearn = async () => {
  const out = [];
  if (wanted.includes('learn')) out.push(await buildVerifyFix(byKey['learn']));
  if (wanted.includes('learn-2')) out.push(await buildVerifyFix(byKey['learn-2'], out.length ? summary(out[out.length - 1]) : ''));
  return out;
};
const lanePins = async () => (wanted.includes('pins') ? [await buildVerifyFix(byKey['pins'])] : []);

const lanes = await parallel([laneLearn, lanePins]);
const done = lanes.filter(Boolean).flat().filter(Boolean);
return {
  items: done,
  landed: done.filter((r) => r.build && r.build.landed).length,
  barMet: done.filter((r) => { const last = r.fix || r.build; return last && last.barMet; }).length,
  verified: done.filter((r) => { const v = r.verify2 || r.verify; return v && v.ok && !v.problems.length; }).length,
};
