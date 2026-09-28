// test/grid-vocab-verdict.mjs: THE VERDICT OF THE BOARD 34 WORDS (item arc-vocab; docs/VISION.md order 4,
// the ARC-AGI-1 row). NO MODEL, nothing searched here: it reads the two journals bench/grid-curve.mjs
// wrote with the words of notes/grid-vocab.md, pairs each by task id with the journal Board 33 wrote
// with the 196 word vocabulary at the same clock, and writes bench/verdicts/grid-vocab.json. It lives
// in test/ (a file named for this item) and is not a node --test file: test/grid-vocab.test.mjs imports
// it to check the verdict on disk against a recomputation from the same journals.
//
//   THE TRAINING CONTROL (in sample: the words were read off the training split):
//   node tools/budget.mjs --ram-mb 8000 --disk-mb 300 --dir state/board34/arc-vocab -- node --max-old-space-size=4000
//        bench/grid-curve.mjs --split training --budget-ms 3000 --attempts 2 --workers 12 --limit 100 --seed 33
//        --journal bench/verdicts/grid-vocab-training-3000ms-n100-seed33.jsonl --verdicts state/board34/arc-vocab/v --quiet
//   paired with bench/verdicts/grid-curve-training-3000ms-n100-seed33.jsonl (Board 33).
//
//   THE EVALUATION SPLIT (held out):
//   node tools/budget.mjs --ram-mb 8000 --disk-mb 300 --dir state/board34/arc-vocab -- node --max-old-space-size=4000
//        bench/grid-curve.mjs --out attempts --split evaluation --budget-ms 3000 --attempts 2 --workers 12
//        --base bench/verdicts/grid-local-evaluation.json --control bench/verdicts/grid-split-evaluation-control.json
//        --journal bench/verdicts/grid-vocab-evaluation-3000ms.jsonl --verdicts state/board34/arc-vocab/v --quiet
//   paired with bench/verdicts/grid-attempts-evaluation-3000ms.jsonl, the journal of bench/verdicts/grid-attempts.json.
//
//   THE VERDICT:  node test/grid-vocab-verdict.mjs
//
// THE BAR: the evaluation split run whole at 3000 ms with 2 attempts against the control file Board 33
// used is the bar run (isTheBar); it is MET when it solves at least 96 of 400 INSIDE THE CLOCK (a task
// counts only when a right attempt was stamped at or under 3000 ms), loses at most 3 of the tasks
// Board 33 solved, and the training control loses at most 2 of its 41.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJournal, pointOf, pairById, wallOfJournal } from '../bench/grid-curve.mjs';
import { PRIMS, LEARNERS, FALLBACK_LEARNERS, LATE_PRIMS, VOCABULARY_SIZE } from '../capability/grid-dsl.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (p) => path.resolve(ROOT, p);
export const BEFORE_VOCABULARY = 196;
export const FILES = Object.freeze({
  verdict: 'bench/verdicts/grid-vocab.json',
  controlJournal: 'bench/verdicts/grid-vocab-training-3000ms-n100-seed33.jsonl',
  controlBefore: 'bench/verdicts/grid-curve-training-3000ms-n100-seed33.jsonl',
  evaluationJournal: 'bench/verdicts/grid-vocab-evaluation-3000ms.jsonl',
  evaluationBefore: 'bench/verdicts/grid-attempts-evaluation-3000ms.jsonl',
  evaluationBeforeVerdict: 'bench/verdicts/grid-attempts.json',
  controlFile: 'bench/verdicts/grid-split-evaluation-control.json',
});
export const BAR = Object.freeze({ budgetMs: 3000, attempts: 2, minSolved: 96, maxLost: 3, maxControlLost: 2, controlBefore: 41, evaluationBefore: 86 });
export const LATE_WORDS = Object.freeze(['cropPeriod', 'monochrome', 'outlineDiag', 'fillColorBoxes', 'downAny2', 'downAny3', 'cropFrame', 'cropCorners', 'cropCornersPaint', 'kronHalves', 'pullToTop', 'pullToRare', 'padEdge']);
export const ADDED_LEARNERS = Object.freeze(['solidColor', 'countOut', 'extendPeriod', 'pickObject', 'partsPick', 'partsOverlay', 'cellsMap', 'regionRecolor', 'symComplete', 'lateWord']);
// notes/grid-vocab.md: each family, the TRAINING tasks it was read from, the words added for it
export const FAMILIES = Object.freeze([
  { name: 'pick an object by a measure', taskIds: ['8efcae92', 'ae4f1146', 'e50d258f', '48d8fb45', '3f7978a0', '5117e062'], words: ['pickObject', 'monochrome'] },
  { name: 'parts: pick one, or lay them over one another', taskIds: ['662c240a', '75b8110e', 'cf98881b'], words: ['partsPick', 'partsOverlay'] },
  { name: 'the periodic tile and the 1D period', taskIds: ['2dee498d', '7b7f7511', '017c7c7b'], words: ['cropPeriod', 'extendPeriod'] },
  { name: 'symmetry completed about a local centre', taskIds: ['11852cab', '1b60fb0c', '4c5c2cf0'], words: ['symComplete'] },
  { name: 'background regions recoloured by a feature', taskIds: ['44d8ac46', '868de0fa', 'e73095fd'], words: ['regionRecolor'] },
  { name: 'frames and corners', taskIds: ['1c786137', '3de23699'], words: ['cropFrame', 'cropCorners', 'cropCornersPaint'] },
  { name: 'the Kronecker product of two parts', taskIds: ['b190f7f5'], words: ['kronHalves'] },
  { name: 'pull toward an anchor', taskIds: ['05f2a901', '4093f84a'], words: ['pullToRare', 'pullToTop'] },
  { name: 'lossy downscale', taskIds: ['46f33fce'], words: ['downAny2', 'downAny3'] },
  { name: 'edge padding', taskIds: ['49d1d64f'], words: ['padEdge'] },
  { name: 'diagonal neighbours', taskIds: ['10fcaaa3'], words: ['outlineDiag'] },
  { name: "each colour's box filled", taskIds: ['56ff96f3'], words: ['fillColorBoxes'] },
  { name: 'a count made into a grid', taskIds: ['1fad071e', 'd0f5fe59', 'b0c4d837'], words: ['countOut'] },
  { name: 'a uniform output of a learned colour', taskIds: ['445eab21', '5582e5ca'], words: ['solidColor'] },
  { name: 'partition cells mapped by a feature', taskIds: ['6773b310', '29623171'], words: ['cellsMap'] },
]);

const r2 = (x) => Math.round(x * 100) / 100;
const ADDED = new Set([...LATE_WORDS, ...ADDED_LEARNERS]);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const attemptLine = (r, budgetMs) => (r.attempts || []).map((a, i) => a.names.join('>') + ' (' + a.phase + ', ' + Math.round(a.ms) + ' ms' + (a.ms > budgetMs ? ', PAST THE CLOCK' : '') + ', ' + (r.attemptRight[i] ? 'right' : 'wrong') + ')');
/** True when a right attempt of the row was stamped at or under the clock. */
export const solvedInClock = (r, budgetMs) => r.solved === true && (r.attempts || []).some((a, i) => r.attemptRight[i] && a.ms <= budgetMs);

/** One side of the verdict: a journal paired by task id with the journal before it. */
export function sideOf(file, beforeFile) {
  const j = readJournal(abs(file)), b = readJournal(abs(beforeFile));
  const ids = j.header.ids || [];
  const missing = ids.filter((id) => !j.rows.has(id));
  if (missing.length) throw new Error('test/grid-vocab-verdict.mjs: ' + file + ' is not complete (' + missing.length + ' tasks have no row)');
  const rows = ids.map((id) => j.rows.get(id));
  const before = ids.map((id) => b.rows.get(id));
  if (before.some((r) => !r)) throw new Error('test/grid-vocab-verdict.mjs: ' + beforeFile + ' has not graded every task of ' + file);
  for (const k of ['split', 'budgetMs', 'attempts', 'maxDepth']) if (j.header[k] !== b.header[k]) throw new Error('test/grid-vocab-verdict.mjs: ' + file + ' and ' + beforeFile + ' differ in ' + k);
  const budgetMs = j.header.budgetMs;
  const p = pointOf(rows, { budgetMs, attempts: j.header.attempts, workers: j.header.workers, wallSeconds: wallOfJournal(rows, j.sessions) });
  const q = pointOf(before, { budgetMs: b.header.budgetMs, attempts: b.header.attempts });
  const pair = pairById(rows, before);
  const inClock = new Set(rows.filter((r) => solvedInClock(r, budgetMs)).map((r) => r.id));
  const beforeInClock = before.filter((r) => solvedInClock(r, budgetMs)).length;
  const lostInClock = before.filter((r) => r.solved === true && !inClock.has(r.id)).map((r) => r.id);
  const gainedInClock = rows.filter((r, k) => inClock.has(r.id) && before[k].solved !== true).map((r) => r.id);
  const byId = new Map(rows.map((r) => [r.id, r])), bById = new Map(before.map((r) => [r.id, r]));
  let right = 0, wrong = 0, maxAddedMs = 0, pastClock = 0, addedPastClock = 0;
  for (const r of rows) (r.attempts || []).forEach((a, i) => {
    if (a.ms > budgetMs) pastClock++;
    if (!a.names.some((n) => ADDED.has(n))) return;
    if (a.ms > budgetMs) addedPastClock++;
    if (r.attemptRight[i]) right++; else wrong++;
    maxAddedMs = Math.max(maxAddedMs, a.ms);
  });
  const byWord = {};
  for (const r of rows) (r.attempts || []).forEach((a, i) => {
    for (const n of new Set(a.names)) if (ADDED.has(n)) { const w = byWord[n] || (byWord[n] = { right: 0, wrong: 0 }); if (r.attemptRight[i]) w.right++; else w.wrong++; }
  });
  return {
    split: j.header.split, n: rows.length, budgetMs, attempts: j.header.attempts, maxDepth: j.header.maxDepth, workers: j.header.workers,
    idsSha: j.header.idsSha, journal: file, beforeJournal: beforeFile, commands: j.sessions.map((s) => s.command),
    before: q.solved, beforeInClock, afterBench: p.solved, after: inClock.size, gained: gainedInClock, lost: lostInClock,
    benchGained: pair.gained, benchLost: pair.lost,
    timedOut: p.timedOut, foundButWrong: p.foundButWrong, exhausted: p.exhausted, errors: p.errors, killed: p.killed,
    meanMs: p.meanMs, wallSeconds: p.wallSeconds, maxRowMs: r2(Math.max(...rows.map((r) => Number(r.ms) || 0))),
    attemptsPastTheClock: pastClock,
    attemptsWithAnAddedWord: { right, wrong, pastTheClock: addedPastClock, maxMs: r2(maxAddedMs), byWord },
    gainedBy: gainedInClock.map((id) => ({ id, attempts: attemptLine(byId.get(id), budgetMs) })),
    lostDetail: lostInClock.map((id) => ({ id, before: attemptLine(bById.get(id), budgetMs), after: byId.get(id).status, attempts: attemptLine(byId.get(id), budgetMs), phases: byId.get(id).phases || null })),
  };
}

/** The fixed vocabulary control arm (--control of the evaluation run), paired by id with this run. */
function controlArm(evaluation) {
  const buf = readFileSync(abs(FILES.controlFile));
  const c = JSON.parse(buf.toString('utf8'));
  const ev = readJournal(abs(FILES.evaluationJournal));
  const cById = new Map((c.rows || []).map((r) => [r.id, r]));
  const ids = ev.header.ids || [];
  const solvedThere = ids.filter((id) => cById.get(id) && cById.get(id).solved === true);
  const inClock = new Set(ids.filter((id) => solvedInClock(ev.rows.get(id), evaluation.budgetMs)));
  return {
    file: FILES.controlFile, at: c.at, command: c.command, controlArm: c.controlArm === true,
    arm: 'the search without the fallback phase (--fixed-vocab), one attempt, the vocabulary before Board 23',
    sha256: sha256(buf),
    solved: solvedThere.length, thisRun: inClock.size,
    gained: ids.filter((id) => inClock.has(id) && !solvedThere.includes(id)).length,
    lost: solvedThere.filter((id) => !inClock.has(id)).length,
  };
}

export function buildVerdict({ command = 'node test/grid-vocab-verdict.mjs' } = {}) {
  const control = sideOf(FILES.controlJournal, FILES.controlBefore);
  const evaluation = sideOf(FILES.evaluationJournal, FILES.evaluationBefore);
  const base = JSON.parse(readFileSync(abs(FILES.evaluationBeforeVerdict), 'utf8'));
  if (base.solved !== evaluation.before) throw new Error('test/grid-vocab-verdict.mjs: ' + FILES.evaluationBefore + ' solved ' + evaluation.before + ', its verdict ' + FILES.evaluationBeforeVerdict + ' says ' + base.solved);
  const arm = controlArm(evaluation);
  // the one evaluation task whose pairs are all a training task's (bench/verdicts/grid-attempts.json)
  const dups = ((base.split && base.split.decidedFrom && base.split.decidedFrom.duplicates) || []).map((d) => d.id);
  const ev = readJournal(abs(FILES.evaluationJournal));
  const cleanRows = [...ev.rows.values()].filter((r) => !dups.includes(r.id));
  evaluation.clean = { n: cleanRows.length, solved: cleanRows.filter((r) => solvedInClock(r, evaluation.budgetMs)).length, without: dups };
  const notTheBarBecause = [];
  if (evaluation.split !== 'evaluation' || evaluation.n !== 400) notTheBarBecause.push('the evaluation split did not run whole');
  if (evaluation.budgetMs !== BAR.budgetMs || evaluation.attempts !== BAR.attempts) notTheBarBecause.push('not 3000 ms with 2 attempts');
  if (!evaluation.commands.length || !evaluation.commands.every((c) => c.includes('--control ' + FILES.controlFile))) notTheBarBecause.push('not run against ' + FILES.controlFile);
  if (!String(base.command || '').includes('--control ' + FILES.controlFile)) notTheBarBecause.push('Board 33 ran against another control file');
  if (control.before !== BAR.controlBefore || evaluation.before !== BAR.evaluationBefore) notTheBarBecause.push('the runs before were not the ones the bar names');
  if (!arm.controlArm) notTheBarBecause.push(FILES.controlFile + ' is not a control arm');
  const isTheBar = notTheBarBecause.length === 0;
  const barMet = isTheBar && evaluation.after >= BAR.minSolved && evaluation.lost.length <= BAR.maxLost && control.lost.length <= BAR.maxControlLost;
  const contaminatedWhy = base.split && typeof base.split.contaminated === 'string' ? base.split.contaminated : false;
  const fbBefore = FALLBACK_LEARNERS.filter((l) => !ADDED_LEARNERS.includes(l.name)).map((l) => l.name);
  const statement = 'Board 34 (arc-vocab) added ' + LATE_WORDS.length + ' primitives and ' + ADDED_LEARNERS.length + ' fallback learners to capability/grid-dsl.mjs, read off '
    + FAMILIES.length + ' families of unsolved TRAINING tasks (notes/grid-vocab.md). The primitives are late words: registered by name but kept out of PRIMS, so the counted vocabulary (PRIMS plus LEARNERS) stays '
    + VOCABULARY_SIZE + ' and the search meets them through the fallback learner lateWord; the fallback learners went from ' + fbBefore.length + ' to ' + FALLBACK_LEARNERS.length
    + ', each run on the task\'s input only, its answer taken inside the clock. A task counts as solved here only when a right attempt was stamped at or under ' + evaluation.budgetMs + ' ms. '
    + 'The training control (in sample, ' + control.n + ' tasks, seed 33) went ' + control.before + ' to ' + control.after + ' (gained ' + control.gained.length + ', lost ' + control.lost.length + '). '
    + 'The held out evaluation split at ' + evaluation.budgetMs + ' ms with ' + evaluation.attempts + ' attempts went ' + evaluation.before + ' to ' + evaluation.after + ' of ' + evaluation.n
    + ' (gained ' + evaluation.gained.length + ', lost ' + evaluation.lost.length + (evaluation.lost.length ? ': ' + evaluation.lost.join(', ') : '') + '); timed out '
    + evaluation.timedOut + ', found but wrong ' + evaluation.foundButWrong + ', exhausted ' + evaluation.exhausted + ', mean ' + evaluation.meanMs + ' ms; attempts with an added word ' + evaluation.attemptsWithAnAddedWord.right + ' right and ' + evaluation.attemptsWithAnAddedWord.wrong + ' wrong, '
    + evaluation.attemptsWithAnAddedWord.pastTheClock + ' of them stamped past the clock. '
    + 'Against the control arm ' + FILES.controlFile + ' (' + arm.arm + ', ' + arm.solved + ' solved) this run gained ' + arm.gained + ' and lost ' + arm.lost + '. '
    + (isTheBar ? 'This is the bar run, and the bar (at least ' + BAR.minSolved + ' of 400 inside the clock, at most ' + BAR.maxLost + ' lost, the training control losing at most ' + BAR.maxControlLost + ') is ' + (barMet ? 'MET.' : 'NOT MET.') : 'This file is not the bar: ' + notTheBarBecause.join('; ') + '.')
    + (contaminatedWhy ? ' Contaminated as ' + FILES.evaluationBeforeVerdict + ' was: ' + contaminatedWhy + '; without ' + dups.join(', ') + ' this run solves ' + evaluation.clean.solved + ' of ' + evaluation.clean.n + '.' : '')
    + ' This is the third run of this item\'s words on the evaluation split (the builder\'s, the verify plane\'s, this fix pass\'s); the fix was decided from the verify plane\'s findings and the training split, and no evaluation task was opened.'
    + ' Latencies were measured on a machine shared with other builders.';
  return {
    at: new Date().toISOString(), command, node: process.version, isTheBar, barMet, contaminated: contaminatedWhy !== false,
    bar: 'the evaluation split whole at ' + BAR.budgetMs + ' ms with ' + BAR.attempts + ' attempts and the control file ' + FILES.controlFile + '; met when it solves at least ' + BAR.minSolved + ' of 400 with a right attempt stamped inside the clock, loses at most ' + BAR.maxLost + ' of the tasks ' + FILES.evaluationBeforeVerdict + ' solved, and the training control loses at most ' + BAR.maxControlLost,
    runs: [
      'node tools/budget.mjs --ram-mb 8000 --disk-mb 300 --dir state/board34/arc-vocab -- node --max-old-space-size=4000 bench/grid-curve.mjs --split training --budget-ms 3000 --attempts 2 --workers 12 --limit 100 --seed 33 --journal ' + FILES.controlJournal + ' --verdicts state/board34/arc-vocab/v --quiet',
      'node tools/budget.mjs --ram-mb 8000 --disk-mb 300 --dir state/board34/arc-vocab -- node --max-old-space-size=4000 bench/grid-curve.mjs --out attempts --split evaluation --budget-ms 3000 --attempts 2 --workers 12 --base bench/verdicts/grid-local-evaluation.json --control ' + FILES.controlFile + ' --journal ' + FILES.evaluationJournal + ' --verdicts state/board34/arc-vocab/v --quiet',
      command,
    ],
    notTheBarBecause, model: 'none',
    split: {
      development: { what: 'the ARC-AGI-1 training split: every added word was read off its unsolved tasks (notes/grid-vocab.md); the control is a fixed seed draw of 100 of it', arcSplit: 'training', n: 400 },
      heldOut: { what: 'the ARC-AGI-1 evaluation split, every task scored; no evaluation task was opened to write the words (journal rows of Board 33 and of this item\'s earlier runs only: ids, status, phase)', arcSplit: 'evaluation', n: evaluation.n, idsSha256: evaluation.idsSha },
      heldOutFile: { file: FILES.controlFile, sha256: arm.sha256, at: arm.at, why: 'the file that names the held out tasks and their fixed vocabulary answers, written before this item\'s code' },
      evaluationRuns: 'third: the builder\'s run and the verify plane\'s re-run came first; this fix pass changed the code from their structural findings (answers taken past the clock, files outside the item) and the training split',
      contaminated: contaminatedWhy,
      decidedFrom: base.split ? base.split.decidedFrom : null,
    },
    vocabulary: {
      before: BEFORE_VOCABULARY, after: VOCABULARY_SIZE, definition: 'PRIMS.length + LEARNERS.length (capability/grid-dsl.mjs VOCABULARY_SIZE)',
      prims: PRIMS.length, learners: LEARNERS.length,
      latePrimitives: { added: LATE_PRIMS.map((p) => p.name), inPrims: LATE_PRIMS.filter((p) => PRIMS.includes(p)).length, reachedBy: 'lateWord' },
      fallbackLearners: { before: fbBefore.length, after: FALLBACK_LEARNERS.length, added: FALLBACK_LEARNERS.filter((l) => ADDED_LEARNERS.includes(l.name)).map((l) => l.name), inputOnly: true },
    },
    families: FAMILIES.map((f) => ({ ...f, taskIds: f.taskIds.slice(), words: f.words.slice() })),
    control, evaluation, controlArm: arm, statement,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const v = buildVerdict();
  writeFileSync(abs(FILES.verdict), JSON.stringify(v, null, 1).replace(/\n/g, '\r\n') + '\r\n');
  const c = v.control, e = v.evaluation;
  console.log('vocabulary (PRIMS plus LEARNERS) ' + v.vocabulary.before + ' -> ' + v.vocabulary.after + ', late primitives ' + v.vocabulary.latePrimitives.added.length + ' (in PRIMS ' + v.vocabulary.latePrimitives.inPrims + '), fallback learners ' + v.vocabulary.fallbackLearners.before + ' -> ' + v.vocabulary.fallbackLearners.after + ', families ' + v.families.length);
  console.log('control training n' + c.n + ' seed33: before ' + c.before + ', after ' + c.after + ' in clock (bench ' + c.afterBench + '), gained ' + c.gained.length + ' (' + c.gained.join(' ') + '), lost ' + c.lost.length + (c.lost.length ? ' (' + c.lost.join(' ') + ')' : '') + ', added-word attempts right ' + c.attemptsWithAnAddedWord.right + ' wrong ' + c.attemptsWithAnAddedWord.wrong + ' past the clock ' + c.attemptsWithAnAddedWord.pastTheClock);
  console.log('evaluation ' + e.n + ': before ' + e.before + ', after ' + e.after + ' in clock (bench ' + e.afterBench + '), gained ' + e.gained.length + ' (' + e.gained.join(' ') + '), lost ' + e.lost.length + (e.lost.length ? ' (' + e.lost.join(' ') + ')' : '') + ', timed out ' + e.timedOut + ', found but wrong ' + e.foundButWrong + ', exhausted ' + e.exhausted + ', mean ms ' + e.meanMs + ', wall s ' + e.wallSeconds);
  console.log('evaluation added-word attempts right ' + e.attemptsWithAnAddedWord.right + ' wrong ' + e.attemptsWithAnAddedWord.wrong + ' past the clock ' + e.attemptsWithAnAddedWord.pastTheClock + ', max ms ' + e.attemptsWithAnAddedWord.maxMs + '; all attempts past the clock ' + e.attemptsPastTheClock + '; by word ' + JSON.stringify(e.attemptsWithAnAddedWord.byWord));
  console.log('control arm ' + v.controlArm.file + ': solved ' + v.controlArm.solved + ', this run ' + v.controlArm.thisRun + ', gained ' + v.controlArm.gained + ', lost ' + v.controlArm.lost);
  console.log('isTheBar ' + v.isTheBar + ', barMet ' + v.barMet + (v.notTheBarBecause.length ? ' (' + v.notTheBarBecause.join('; ') + ')' : ''));
  console.log('STATEMENT ' + v.statement);
  console.log('wrote ' + FILES.verdict);
}
