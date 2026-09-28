export const meta = {
  name: 'board-34b-close-board-34',
  description: 'BOARD 34b (local, his machine, 2026-09-28 13:1x EDT): the two stages board 34 left open. The mistakes item takes a second fix pass on the three problems its second verify named, then a third verify; the arc-vocab item gets the second verify the session limit killed: a skeptic re-runs its bar into scratch and checks every number its verdict states against what printed. Nothing else is touched. His 13:12 order stands over both: self improving to fill in the gaps is very high priority, 73 percent on the banked week.',
  phases: [{ title: 'Fix' }, { title: 'Verify' }],
};

const ROOT = (args && args.root) || 'C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain';
const SCRATCH = (args && args.scratch) || (ROOT + '/state/board34');
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
  'TREE: ' + ROOT + ' (the BRAIN, its own git repository on master; Windows 11, Git Bash and PowerShell, Node v24, 32 CPUs, 64 GB). Scratch for you: ' + SCRATCH + '/<item> (create it; delete it when done).',
  'MODEL OFF for every bench you run: no Ollama, no network. The orchestrator owns the Ollama queue.',
  'THE ORCHESTRATOR is landing checkpoint 3 in this tree at the same time: never run bench/gate.mjs, never commit, never stage, never touch MANUAL.md, docs/LOG.md, docs/CLAUDE.md, .github, .vercelignore, vercel.json, web/, state/ (except your scratch), and never edit a file outside the ones your item names.',
  'HIS RULES (docs/VISION.md, MANUAL.md section A): never quote a number a command did not print; a verdict statement carries only numbers that printed; no em-dashes anywhere; a wrong exact answer is worse than a refusal; a control that cannot fail is not a control; an assertion that holds for any result is not an assertion; a claim in prose must be exactly what the check shows, no more.',
  'BUDGETS: every bench runs as node tools/budget.mjs --ram-mb <N> --disk-mb <M> --dir <dir> -- node --max-old-space-size=<N> <bench> ...; one bench at a time on the machine; wait while free RAM is under 8000 MB (PowerShell: (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024).',
  'REPORT through the StructuredOutput schema only: printed lines verbatim, never paraphrased.',
].join('\n');

const FIX_SCHEMA = {
  type: 'object',
  properties: {
    landed: { type: 'boolean', description: 'every named problem addressed in code, not in prose' },
    barMet: { type: 'boolean', description: 'exactly what the bar command printed' },
    files: { type: 'array', items: { type: 'string' }, description: 'every file written, repo-relative' },
    barCommand: { type: 'string', description: 'the exact command that ran, copy-pasteable from the tree root' },
    printed: { type: 'string', description: 'the bar command\'s summary lines verbatim (the lines that carry the numbers), 30 lines at most' },
    testsCommand: { type: 'string' },
    testsPrinted: { type: 'string', description: 'the tests, pass and fail lines verbatim' },
    perProblem: { type: 'array', items: { type: 'string' }, description: 'one line per problem named in the task: what the code now does and which line' },
    open: { type: 'array', items: { type: 'string' }, description: 'what remains, one line each, empty when nothing' },
  },
  required: ['landed', 'barMet', 'files', 'barCommand', 'printed', 'testsCommand', 'testsPrinted', 'perProblem', 'open'],
};

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean', description: 'true only when no problem survived your own re-run' },
    barMet: { type: 'boolean', description: 'what YOUR re-run printed' },
    printed: { type: 'string', description: 'your re-run\'s summary lines verbatim, 30 lines at most' },
    testsPrinted: { type: 'string' },
    unowned: { type: 'array', items: { type: 'string' }, description: 'files the item changed outside its list (git status and git diff --stat against the index), empty when none' },
    statementNumbersUnprinted: { type: 'array', items: { type: 'string' }, description: 'every number in the verdict statement that no printed line carries, empty when none' },
    problems: { type: 'array', items: { type: 'string' }, description: 'file:line and the defect, one line each; empty when none' },
  },
  required: ['ok', 'barMet', 'printed', 'testsPrinted', 'unowned', 'statementNumbersUnprinted', 'problems'],
};

const MISTAKES_FILES = 'bench/mistakes.mjs, self/mistakes.mjs, test/mistakes.test.mjs, notes/mistakes.md, bench/verdicts/mistakes.json, bench/verdicts/mistakes-ledger.jsonl, bench/verdicts/mistakes-reask.jsonl, bench/verdicts/mistakes-heldout.json';
const MISTAKES_BAR = 'node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts --record ' + SCRATCH + '/mistakes/budget.json -- node --max-old-space-size=4000 bench/mistakes.mjs --reask';

const FIX_MISTAKES = [
  CONCISE, COMMON, '',
  'ITEM: mistakes, second fix pass (board 34, item mistakes: self/mistakes.mjs reads every graded-wrong row of five sources into a ledger with a why and a lesson, and re-asks each row model off; bench/mistakes.mjs is its bar; test/mistakes.test.mjs its tests; notes/mistakes.md its note).',
  'YOU OWN ONLY: ' + MISTAKES_FILES + '. Read them first, whole.',
  'THE SECOND VERIFY NAMED THREE PROBLEMS. Fix each in code, then re-run the bar and the tests:',
  '1. test/mistakes.test.mjs:416 assert.ok(shaped.shaped === 0 || shaped.shaped === 1) holds for any result once of === 1: an assertion that cannot fail. Replace it with an assertion on the exact value a planted input must produce (plant a row whose lesson shapes and one whose lesson cannot shape; assert shaped 1 and 0 respectively, and assert the lesson text).',
  '2. bench/mistakes.mjs:255 the statement says the vocabulary was written after the held-out file, but bench/mistakes.mjs:207 checks only the last mtime of self/mistakes.mjs, which any later edit passes. Make the prose claim exactly what the check shows: name the check (the mtime of self/mistakes.mjs is later than the held-out file\'s at field, necessary and not sufficient), or add a check that shows what is claimed (a sha256 of self/mistakes.mjs recorded at the moment the held-out file was written, compared now). Whichever you do, the statement and the check must say the same thing.',
  '3. bench/mistakes.mjs:132 the empty control (418 of 418 refused) always holds because self/mistakes.mjs gradeReask returns answered false on isNative(\'\') at its first line, so the per-row count cannot fail. A control must be able to fail per row. Replace it with controls that can: for every re-askable row, grade the row\'s own gold answer as the reply (must read fixed) and a deliberately wrong reply (must read still); keep the empty reply as ONE call, not a per-row count, and print it as such. The printed CONTROL line changes accordingly; the verdict and notes/mistakes.md follow the new line.',
  'THEN: run node --test test/mistakes.test.mjs; run the bar: ' + MISTAKES_BAR + '; the verdict must keep isTheBar true and a split object with contaminated false or the reason; every number in the verdict statement must appear on a printed line. Report through the schema.',
].join('\n');

const VERIFY_MISTAKES = (fix) => [
  CONCISE, COMMON, '',
  'YOU ARE THE SKEPTIC for the mistakes item after its second fix pass. Assume the fix report is wrong until you have re-run it yourself. Do not edit any file outside ' + SCRATCH + '/mistakes-verify (your scratch).',
  'THE FIX REPORTED: ' + JSON.stringify(fix).slice(0, 6000),
  'CHECK, in this order, and re-run everything yourself:',
  '1. git status --short and git diff --stat (against the index) for files outside: ' + MISTAKES_FILES + '. Anything else changed by this item is unowned.',
  '2. Re-run the bar: ' + MISTAKES_BAR + ' and node --test test/mistakes.test.mjs. Compare every printed number with the fix report.',
  '3. Open bench/mistakes.mjs and test/mistakes.test.mjs at the three spots the second verify named (the shaped assertion, the written-after claim, the empty control) and judge whether each is now a check that can fail and a claim that says exactly what the check shows. Plant a failing case for each in your scratch (a copied test file) and show it fails.',
  '4. Read bench/verdicts/mistakes.json: isTheBar, barMet, split.contaminated present, and list every number in its statement that no printed line carries.',
  'Report through the schema; problems as file:line and the defect.',
].join('\n');

const ARC_BAR_EVAL = 'node tools/budget.mjs --ram-mb 8000 --disk-mb 300 --dir ' + SCRATCH + '/arc-verify -- node --max-old-space-size=4000 bench/grid-curve.mjs --out attempts --split evaluation --budget-ms 3000 --attempts 2 --workers 12 --base bench/verdicts/grid-local-evaluation.json --control bench/verdicts/grid-split-evaluation-control.json --journal ' + SCRATCH + '/arc-verify/evaluation-3000ms.jsonl --verdicts ' + SCRATCH + '/arc-verify/v --quiet';
const ARC_BAR_TRAIN = 'node tools/budget.mjs --ram-mb 8000 --disk-mb 300 --dir ' + SCRATCH + '/arc-verify -- node --max-old-space-size=4000 bench/grid-curve.mjs --split training --budget-ms 3000 --attempts 2 --workers 12 --limit 100 --seed 33 --journal ' + SCRATCH + '/arc-verify/training-3000ms-n100-seed33.jsonl --verdicts ' + SCRATCH + '/arc-verify/v --quiet';

const VERIFY_ARC = [
  CONCISE, COMMON, '',
  'YOU ARE THE SKEPTIC for board 34\'s arc-vocab item after its fix pass; its second verify never ran. The item owns capability/grid-dsl.mjs (additions only: primitives and fallback learners, never a removal), test/grid-vocab.test.mjs, test/grid-vocab-verdict.mjs, notes/grid-vocab.md, bench/verdicts/grid-vocab.json, bench/verdicts/grid-vocab-training-3000ms-n100-seed33.jsonl, bench/verdicts/grid-vocab-evaluation-3000ms.jsonl. Its bar: the ARC evaluation split at 3000 ms with 2 attempts at least 96 of 400 solved inside the clock, lost at most 3 against bench/verdicts/grid-attempts.json (86 of 400), the training control (100 tasks, seed 33) losing at most 2. Its verdict says barMet false: 94 of 400, gained 8 lost 0, all attempts past the clock 0.',
  'THE FIRST VERIFY FOUND: capability/grid-search.mjs and capability/grid-invent.mjs edited though read only; bench/grid-vocab.mjs created outside the list; gains solved only by attempts stamped past the 3000 ms clock (settle() accepted reserve answers with no clock check); the verdict statement carried numbers the command did not print (15, 2877, 2154, 3008.71); a re-run gave 93 with lost 1. The fix pass reports these are undone. Assume it is wrong until shown.',
  'Do not edit any file outside ' + SCRATCH + '/arc-verify (your scratch). Wait until free RAM is over 8000 MB before each bar run; the two runs take about two minutes each at 12 workers.',
  'CHECK, and re-run everything yourself:',
  '1. git status --short and git diff --stat against the index for capability/, bench/, test/: capability/grid-search.mjs and capability/grid-invent.mjs must show NO unstaged change (a staged hunk in grid-search.mjs belongs to board 33 and is not this item\'s); bench/grid-vocab.mjs must not exist. List anything else this item changed outside its files.',
  '2. git diff --numstat capability/grid-dsl.mjs: deletions must be 0; grep that every name in the old PRIMS and LEARNERS tables (git show HEAD:capability/grid-dsl.mjs) is still present.',
  '3. Re-run the evaluation bar into your scratch: ' + ARC_BAR_EVAL + '. Then the training control: ' + ARC_BAR_TRAIN + '. Report the POINT lines and the control line verbatim, and the solved, gained, lost, timed out and found-but-wrong counts against the verdict\'s (94, 8, 0, 279, 26). A difference of a task or two under load is a finding to report, not to hide.',
  '4. The clock: in your scratch journal, count attempts with a right answer whose stamped ms exceeds 3000; it must be 0 and the solved count must equal the count of tasks with a right attempt at or under 3000 ms. Print the node one-liner you used and its output.',
  '5. Read bench/verdicts/grid-vocab.json: isTheBar, barMet, split object (contaminated false or a reason), and list every number in its statement that no printed line of the item\'s own bar command carries (re-run node test/grid-vocab-verdict.mjs to see which lines it prints).',
  '6. node --test test/grid-vocab.test.mjs test/grid.test.mjs test/grid-library.test.mjs test/grid-curve.test.mjs test/imagine.test.mjs test/contamination-split.test.mjs test/gate-contamination.test.mjs: the pass and fail lines.',
  'Report through the schema; problems as file:line and the defect.',
].join('\n');

phase('Fix');
log('board 34b: mistakes second fix, arc-vocab second verify');
const results = await parallel([
  () => agent(FIX_MISTAKES, { label: 'fix2:mistakes', phase: 'Fix', model: MODEL, schema: FIX_SCHEMA })
    .then((fix) => fix ? agent(VERIFY_MISTAKES(fix), { label: 'verify3:mistakes', phase: 'Verify', model: MODEL, schema: VERIFY_SCHEMA }).then((v) => ({ key: 'mistakes', fix, verify: v })) : { key: 'mistakes', fix: null, verify: null }),
  () => agent(VERIFY_ARC, { label: 'verify2:arc-vocab', phase: 'Verify', model: MODEL, schema: VERIFY_SCHEMA }).then((v) => ({ key: 'arc-vocab', fix: null, verify: v })),
]);
return { items: results.filter(Boolean) };
