// bench/grid.mjs: THE ARC BAR FOR THE GRID VOCABULARY, NO MODEL.
//
//   node bench/grid.mjs --split training --budget-ms 3000 [--workers N] [--limit N] [--ids a,b]
//
// Runs capability/grid-search.mjs over every task of one ARC-AGI-1 split: the typed program
// search of capability/grid-dsl.mjs over the train pairs, to depth 4, under a per task wall
// clock budget, with the winning program run as real grid.dsl cells and graded by
// grid.dsl.match cells. ONE attempt per task (ARC allows two; bench/public.mjs takes one and
// so does this). A task is solved when the one program's output equals every test output.
//
// The evaluation split is HELD OUT: this bench can run it (the orchestrator does, after the
// vocabulary is frozen), and nothing in capability/grid-dsl.mjs was tuned on it.
//
// What it prints: solved of N, mean ms per task, exhausted (no program left to try within the
// budget), timed out (the clock ran out first), found but wrong (a program fit every train
// pair and missed a test output), and the depth histogram of solved programs, where depth is
// the number of steps including a learned last step. The published no-model row (Icecuber,
// 17 percent on the evaluation set) is copied from bench/verdicts/public-arc.json, where it
// was read from the web with its citation.
//
// What it writes: bench/verdicts/grid.json (training) or grid-evaluation.json (evaluation)
// with isTheBar true, ONLY when every task of the split ran; a --limit or --ids run writes the
// same name with -partial and isTheBar false.
import { Worker } from 'node:worker_threads';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(ROOT, 'bench', 'fixtures', 'public', 'arc-agi-1');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');

// board 19 builder: the split each grid verdict was measured on (the gate's CONTAMINATION row needs an
// object; the ARC split's own name moved to arcSplit beside it).
/** What a grid run developed on and what it graded: pure, from the ARC split, the library flag, the fold and the corpus. */
export function splitFor(opts = {}) {
  const arc = opts.arcSplit === 'evaluation' ? 'evaluation' : 'training';
  if (opts.library && opts.devFold) {
    const graded = opts.devFold === 'even' ? 'odd' : 'even';
    return {
      development: { what: 'the ARC-AGI-1 training tasks of the ' + opts.devFold + ' index (sorted ids): the library is learned from them', arcSplit: 'training', fold: opts.devFold },
      heldOut: { what: 'the training tasks of the ' + graded + ' index, which the library did not learn from; the vocabulary itself was written against the whole training split', arcSplit: 'training', fold: graded },
      contaminated: 'the graded fold is training data the vocabulary (capability/grid-dsl.mjs) was written against',
    };
  }
  const development = opts.library
    ? { what: 'the ARC-AGI-1 training split: the vocabulary was written against it and the library is learned from the programs that solved it (the corpus verdicts)', arcSplit: 'training', corpus: Array.isArray(opts.corpus) ? opts.corpus.slice() : [] }
    : { what: 'the ARC-AGI-1 training split: the vocabulary of capability/grid-dsl.mjs was written against it', arcSplit: 'training' };
  if (arc === 'evaluation') {
    return {
      development,
      heldOut: { what: 'the ARC-AGI-1 evaluation split; nothing in capability/grid-dsl.mjs was tuned on it (this bench header), and a library refuses any corpus that is not a training verdict', arcSplit: 'evaluation' },
      contaminated: false,
    };
  }
  return {
    development,
    heldOut: { what: 'none: this run grades the training split itself', n: 0 },
    contaminated: 'the training split is the one the vocabulary was written against, so this run is in sample',
  };
}

export function parseArgs(argv) {
  const a = { split: 'training', budgetMs: 3000, workers: Math.max(1, Math.min(2, Math.floor(os.availableParallelism() / 4))), /* at most 2: the machine budget */ limit: null, ids: null, maxDepth: 4, quiet: false, graceMs: 4000 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    if (k === '--split') { a.split = v; i++; }
    else if (k === '--budget-ms') { a.budgetMs = Number(v); i++; }
    else if (k === '--workers') { a.workers = Number(v); i++; }
    else if (k === '--limit') { a.limit = Number(v); i++; }
    else if (k === '--ids') { a.ids = String(v).split(',').filter(Boolean); i++; }
    else if (k === '--depth') { a.maxDepth = Number(v); i++; }
    else if (k === '--quiet') a.quiet = true;
    // Board 11 flags: the library bar (runLibraryBar below; notes/grid.md)
    else if (k === '--library') a.library = true;
    else if (k === '--attempts') { a.attempts = Number(v); i++; }
    else if (k === '--arms') { a.arms = String(v).split(',').filter(Boolean); i++; }
    else if (k === '--corpus') { a.corpus = String(v).split(',').filter(Boolean); i++; }
    else if (k === '--dev-fold') { a.devFold = v; i++; }
    else if (k === '--top-n') { a.topN = Number(v); i++; }
    else if (k === '--alpha') { a.alpha = Number(v); i++; }
    else if (k === '--alpha-frac') { a.alphaFrac = Number(v); i++; }
    else if (k === '--min-net') { a.minNet = Number(v); i++; }
    else if (k === '--min-tasks') { a.minTasks = Number(v); i++; }
    else if (k === '--share') { a.share = Number(v); i++; }
    else if (k === '--min-free-mb') { a.minFreeMb = Number(v); i++; }
    else if (k === '--tag') { a.tag = String(v); i++; }
    else if (k === '--only-unsolved') { a.onlyUnsolved = String(v); i++; }
    else throw new Error('bench/grid.mjs: unknown argument ' + k);
  }
  if (a.split !== 'training' && a.split !== 'evaluation') throw new Error('bench/grid.mjs: --split must be training or evaluation');
  if (!(a.budgetMs > 0) || !(a.workers >= 1) || !(a.maxDepth >= 1)) throw new Error('bench/grid.mjs: bad budget, workers or depth');
  if (!a.library && (a.attempts !== undefined || a.arms || a.corpus || a.devFold || a.tag || a.onlyUnsolved)) throw new Error('bench/grid.mjs: --attempts, --arms, --corpus, --dev-fold, --tag and --only-unsolved belong to --library');
  if (a.attempts !== undefined && !(a.attempts === 1 || a.attempts === 2)) throw new Error('bench/grid.mjs: --attempts is 1 or 2 (ARC grades two tries per test input)');
  if (a.devFold !== undefined && !(a.devFold === 'even' || a.devFold === 'odd')) throw new Error('bench/grid.mjs: --dev-fold is even or odd');
  if (a.devFold && a.split !== 'training') throw new Error('bench/grid.mjs: --dev-fold runs on the training split');
  return a;
}

const WORKER_SRC = [
  "const { parentPort, workerData } = require('node:worker_threads');",
  'let solveArcTask = null, library = null;',
  'Promise.all([import(workerData.searchUrl), workerData.library ? import(workerData.libraryUrl) : null]).then(([m, L]) => { solveArcTask = m.solveArcTask; if (L) library = L.buildSearchLibrary(workerData.library); parentPort.postMessage({ type: "ready", macros: library ? library.macros.length : 0 }); },',
  '  (e) => parentPort.postMessage({ type: "bootFailed", error: String(e && e.stack || e) }));',
  'parentPort.on("message", (msg) => {',
  '  const t0 = performance.now();',
  '  try {',
  '    const r = solveArcTask(msg.task, { budgetMs: workerData.budgetMs, maxDepth: workerData.maxDepth, library, attempts: workerData.attempts || 1 });',
  '    parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: r.status, solved: r.solved, solvedFirst: r.solvedFirst, names: r.names, depth: r.depth, attempts: r.attempts, attemptRight: r.attemptRight, firstMs: r.firstMs, searched: r.searched, states: r.states, rejected: r.rejected, ms: r.ms, cells: r.cells, vocabulary: r.vocabulary } });',
  '  } catch (e) {',
  '    parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: "error", solved: false, error: String(e && e.message || e) } });',
  '  }',
  '});',
].join('\n');

function spawn(cfg) {
  return new Worker(WORKER_SRC, {
    eval: true,
    workerData: { searchUrl: pathToFileURL(path.join(ROOT, 'capability', 'grid-search.mjs')).href, budgetMs: cfg.budgetMs, maxDepth: cfg.maxDepth, library: cfg.libraryJson || null, libraryUrl: pathToFileURL(path.join(ROOT, 'capability', 'grid-library.mjs')).href, attempts: cfg.attempts || 1 },
    resourceLimits: { maxOldGenerationSizeMb: 1536, maxYoungGenerationSizeMb: 64, stackSizeMb: 8 },
  });
}
function ready(worker) {
  return new Promise((resolve) => {
    const on = (m) => { if (m && (m.type === 'ready' || m.type === 'bootFailed')) { worker.off('message', on); resolve(m); } };
    worker.on('message', on);
  });
}

/** Run one task on a worker, with a hard kill at budget plus grace in case a primitive hangs. */
function runOne(worker, id, task, hardMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (done) return; done = true; clearTimeout(t); worker.off('message', onMsg); worker.off('error', onErr); resolve(v); };
    const onMsg = (m) => { if (m && m.type === 'done' && m.id === id) finish({ killed: false, wallMs: m.wallMs, r: m.r }); };
    const onErr = (e) => finish({ killed: true, wallMs: hardMs, r: { status: 'error', solved: false, error: String(e && e.message || e) } });
    const t = setTimeout(() => finish({ killed: true, wallMs: hardMs, r: { status: 'timeout', solved: false, error: 'killed at the hard deadline' } }), hardMs);
    worker.on('message', onMsg);
    worker.on('error', onErr);
    worker.postMessage({ id, task });
  });
}

export function loadSplit(split) {
  const dir = path.join(FIXTURES, split);
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => ({ id: f.replace(/\.json$/, ''), file: path.join(dir, f) }));
}

function icecuberRow() {
  try {
    const j = JSON.parse(readFileSync(path.join(VERDICTS, 'public-arc.json'), 'utf8'));
    const row = (j.published || []).find((r) => /icecuber/i.test(r.system));
    return row ? { ...row, copiedFrom: 'bench/verdicts/public-arc.json' } : null;
  } catch { return null; }
}

const r2 = (x) => Math.round(x * 100) / 100;

export async function runGridBench(cfg) {
  let list = cfg.taskList || loadSplit(cfg.split);
  const of = list.length;
  if (cfg.ids) list = list.filter((t) => cfg.ids.includes(t.id));
  if (cfg.limit) list = list.slice(0, cfg.limit);
  const complete = !cfg.ids && !cfg.limit && list.length === of;
  const hardMs = cfg.budgetMs + cfg.graceMs;
  if (!cfg.quiet) {
    console.log('ARC-AGI-1 ' + cfg.split + ', ' + list.length + ' of ' + of + ' tasks, budget ' + cfg.budgetMs + ' ms per task, depth ' + cfg.maxDepth + ', ' + cfg.workers + ' workers');
    console.log('capability/grid-search.mjs over capability/grid-dsl.mjs, answers run as grid.dsl cells and graded by grid.dsl.match cells. NO MODEL. ' + ((cfg.attempts || 1) === 2 ? 'TWO attempts per task (ARC grades two tries per test input).' : 'ONE attempt per task.') + (cfg.label ? ' Arm: ' + cfg.label + (cfg.libraryJson ? ' (learned library, ' + cfg.libraryJson.macros.length + ' macros)' : ' (no library)') + '.' : ''));
  }
  const t0 = performance.now();
  const rows = new Array(list.length);
  let next = 0, finished = 0;
  const lane = async () => {
    let w = spawn(cfg);
    let boot = await ready(w);
    if (boot.type !== 'ready') throw new Error('grid worker did not boot: ' + boot.error);
    while (next < list.length) {
      const i = next++;
      const t = list[i];
      const json = JSON.parse(readFileSync(t.file, 'utf8'));
      const res = await runOne(w, t.id, json, hardMs);
      rows[i] = { id: t.id, killed: res.killed, wallMs: r2(res.wallMs), ...res.r };
      finished++;
      if (!cfg.quiet && finished % 50 === 0) console.log('  ' + finished + ' of ' + list.length + ' done, ' + rows.filter((r) => r && r.solved).length + ' solved so far');
      if (res.killed) {
        try { await w.terminate(); } catch { /* already gone */ }
        w = spawn(cfg);
        boot = await ready(w);
        if (boot.type !== 'ready') throw new Error('grid worker did not reboot: ' + boot.error);
      }
    }
    await w.terminate();
  };
  await Promise.all(Array.from({ length: Math.min(cfg.workers, list.length) }, lane));
  const wallMs = performance.now() - t0;

  const solved = rows.filter((r) => r.solved).length;
  const exhausted = rows.filter((r) => r.status === 'exhausted').length;
  const timedOut = rows.filter((r) => r.status === 'timeout').length;
  const errors = rows.filter((r) => r.status === 'error').length;
  const foundWrong = rows.filter((r) => r.status === 'found' && !r.solved).length;
  const killed = rows.filter((r) => r.killed).length;
  const meanMs = r2(rows.reduce((s, r) => s + r.wallMs, 0) / rows.length);
  const meanSolvedMs = solved ? r2(rows.filter((r) => r.solved).reduce((s, r) => s + r.wallMs, 0) / solved) : null;
  const depthHistogram = {};
  for (const r of rows) if (r.solved) depthHistogram[r.depth] = (depthHistogram[r.depth] || 0) + 1;
  const opUse = {};
  for (const r of rows) if (r.solved) for (const n of r.names) opUse[n] = (opUse[n] || 0) + 1;
  const topOps = Object.entries(opUse).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 15);
  const vocabulary = rows.find((r) => r.vocabulary)?.vocabulary ?? null;
  const pct = r2((100 * solved) / rows.length);
  const ice = icecuberRow();

  if (cfg.write === false) return armResult(cfg, rows, { solved, exhausted, timedOut, errors, foundWrong, killed, meanMs, meanSolvedMs, wallMs, depthHistogram, topOps, vocabulary, pct });

  console.log('');
  console.log('solved ' + solved + ' of ' + rows.length + ' = ' + pct + ' percent, one attempt per task');
  console.log('mean ms per task ' + meanMs + (meanSolvedMs !== null ? ', mean ms per solved task ' + meanSolvedMs : '') + ', wall ' + r2(wallMs / 1000) + ' s');
  console.log('exhausted ' + exhausted + ', timed out ' + timedOut + ', found but wrong ' + foundWrong + ', errors ' + errors + ', killed at the hard deadline ' + killed);
  console.log('depth histogram of solved programs (steps, learned last step included): ' + JSON.stringify(depthHistogram));
  console.log('vocabulary ' + vocabulary + ' primitives and learners; most used in solutions: ' + topOps.map(([n, c]) => n + ' ' + c).join(', '));
  if (ice) console.log('published no-model row: ' + ice.system + ' ' + ice.score + ' percent on the ARC-AGI-1 evaluation set (' + ice.source + ', copied from bench/verdicts/public-arc.json)');

  const name = (cfg.split === 'training' ? 'grid' : 'grid-evaluation') + (complete ? '' : '-partial');
  const command = 'node bench/grid.mjs ' + process.argv.slice(2).join(' ');
  const verdict = {
    at: new Date().toISOString(),
    command: command.trim(),
    node: process.version,
    isTheBar: complete,
    split: splitFor({ arcSplit: cfg.split }),
    arcSplit: cfg.split,
    heldOut: cfg.split === 'evaluation',
    n: rows.length, of, solved, pct,
    meanMs, meanSolvedMs, wallSeconds: r2(wallMs / 1000),
    exhausted, timedOut, foundButWrong: foundWrong, errors, killedAtHardDeadline: killed,
    depthHistogram, topOps: Object.fromEntries(topOps),
    budgetMs: cfg.budgetMs, maxDepth: cfg.maxDepth, workers: cfg.workers, vocabulary,
    attemptsPerTask: 1, attemptsAllowedByArc: 2, model: null,
    published: ice ? [ice] : [],
    statement: 'On the ARC-AGI-1 ' + cfg.split + ' split the grid program search solved ' + solved + ' of ' + rows.length + ' tasks (' + pct + ' percent) with one attempt per task, no model and a ' + cfg.budgetMs + ' ms wall clock budget per task, mean ' + meanMs + ' ms per task. '
      + exhausted + ' exhausted the vocabulary, ' + timedOut + ' ran out of clock, ' + foundWrong + ' found a program that fit every train pair and missed a test output. Every solved answer is what a chain of grid.dsl cells emitted after grid.dsl.match cells confirmed every train pair. '
      + (cfg.split === 'training' ? 'This is the TRAINING split, which the vocabulary was written against, so it is not comparable to the published row; ' : 'This is the held out EVALUATION split; ')
      + (ice ? 'the published no-model row is ' + ice.system + ' at ' + ice.score + ' percent on the evaluation split.' : 'no published row was found in public-arc.json.'),
    rows,
  };
  mkdirSync(VERDICTS, { recursive: true });
  const file = path.join(VERDICTS, name + '.json');
  writeFileSync(file, JSON.stringify(verdict, null, 1) + '\n');
  console.log('wrote ' + path.relative(ROOT, file).replace(/\\/g, '/') + (complete ? ' (isTheBar true)' : ' (partial, isTheBar false)'));
  return verdict;
}

// ---------------------------------------------------------------- one arm of the library bar
function armResult(cfg, rows, s) {
  const attempts = cfg.attempts || 1;
  const solvedFirst = rows.filter((r) => r.solvedFirst).length;
  const firsts = rows.filter((r) => typeof r.firstMs === 'number');
  const meanFirstMs = firsts.length ? r2(firsts.reduce((a, r) => a + r.firstMs, 0) / firsts.length) : null;
  const secondFound = rows.filter((r) => Array.isArray(r.attempts) && r.attempts.length >= 2).length;
  const rescuedBySecond = rows.filter((r) => r.solved && !r.solvedFirst).length;
  // solved only by an attempt the learned phase of a portfolio clock found
  const rightBy = (r, phase) => Array.isArray(r.attempts) && r.attempts.some((a, k) => r.attemptRight && r.attemptRight[k] && (a.phase || 'hand') === phase);
  const solvedByLearnedPhase = rows.filter((r) => r.solved && rightBy(r, 'learned') && !rightBy(r, 'hand')).length;
  const macroUse = {};
  for (const r of rows) {
    if (!r.solved || !Array.isArray(r.attempts)) continue;
    const used = new Set();
    r.attempts.forEach((a, k) => { if (r.attemptRight && r.attemptRight[k]) for (const n of a.names) if (n.includes('+')) used.add(n); });
    for (const n of used) macroUse[n] = (macroUse[n] || 0) + 1;
  }
  const macrosUsed = Object.keys(macroUse).length;
  console.log(cfg.label + ': solved ' + s.solved + ' of ' + rows.length + ' within ' + attempts + ' attempt' + (attempts > 1 ? 's' : '') + ' (' + solvedFirst + ' at attempt 1, ' + rescuedBySecond + ' only by attempt 2), mean ms per task ' + s.meanMs
    + (meanFirstMs !== null ? ', mean ms to the first answer ' + meanFirstMs : '') + ', timed out ' + s.timedOut + ', exhausted ' + s.exhausted + ', found but wrong ' + s.foundWrong + ', errors ' + s.errors + ', killed ' + s.killed + ', wall ' + r2(s.wallMs / 1000) + ' s');
  if (cfg.libraryJson) console.log(cfg.label + ': macros learned ' + cfg.libraryJson.macros.length + ', macros used in at least one solution ' + macrosUsed + (macrosUsed ? ' (' + Object.entries(macroUse).map(([n, c]) => n + ' ' + c).join(', ') + ')' : '') + '; solved only by the learned phase ' + solvedByLearnedPhase);
  return {
    solved: s.solved, solvedFirst, rescuedBySecond, secondFound, solvedByLearnedPhase, n: rows.length, pct: s.pct, meanMs: s.meanMs, meanSolvedMs: s.meanSolvedMs, meanFirstMs,
    wallSeconds: r2(s.wallMs / 1000), exhausted: s.exhausted, timedOut: s.timedOut, foundButWrong: s.foundWrong, errors: s.errors, killedAtHardDeadline: s.killed,
    depthHistogram: s.depthHistogram, topOps: Object.fromEntries(s.topOps), vocabulary: s.vocabulary, macroUse, macrosUsed, rows,
  };
}

// ---------------------------------------------------------------- the library bar (Board 11, item arc)
//   node bench/grid.mjs --split evaluation --budget-ms 3000 --workers 2 --library
//        [--attempts 2] [--arms base,library,base] [--corpus bench/verdicts/grid.json[,more]]
//        [--top-n 24] [--alpha X | --alpha-frac 1] [--min-net 1] [--min-tasks 2] [--share 0.5] [--min-free-mb 16384]
//        [--only-unsolved <verdict>] [--tag name]
//   node bench/grid.mjs --split training --budget-ms 3000 --workers 2 --library --dev-fold even
//        (DEVELOPMENT: learn from the even numbered training tasks, run the odd numbered ones)
//
// Learns a library with capability/grid-library.mjs from programs that solved TRAINING tasks
// (the corpus verdicts must be training verdicts: the library refuses anything else), then runs
// the arms ONE AT A TIME, free RAM checked before each (waits while under --min-free-mb): by
// default no library, library, no library again, so the two no-library runs print the run to run
// noise on the same clock and machine. Every arm uses the same budget, workers, depth and number
// of attempts (default 2, ARC's own rule); only the library differs. Printed per arm: solved,
// solved at attempt 1, mean ms per task, timeouts; for the library arm the macros learned and
// the macros used in at least one solution; then newly solved and lost against the first
// no-library run and against both. The bar: the library arm solves more tasks than the BETTER of
// the two no-library runs by more than the gap between them.
//
// Writes bench/verdicts/grid-library.json with isTheBar true only for the whole evaluation split
// with two no-library arms and a library arm; a narrower run writes grid-library-partial.json, a
// development fold grid-library-dev-<fold>[-<tag>].json, both isTheBar false. Size: about 0.3 MB
// per 400 tasks per arm, so no rotation is needed.
async function waitFreeRam(minMb, label) {
  const t0 = Date.now();
  for (;;) {
    const free = Math.round(os.freemem() / 1048576);
    if (free >= minMb) { console.log(label + ': free RAM ' + free + ' MB before the arm (floor ' + minMb + ' MB)'); return free; }
    if (Date.now() - t0 > 30 * 60 * 1000) throw new Error('bench/grid.mjs: free RAM stayed under ' + minMb + ' MB for 30 minutes before ' + label);
    console.log(label + ': free RAM ' + free + ' MB, under ' + minMb + ' MB; waiting 30 s');
    await new Promise((r) => setTimeout(r, 30000));
  }
}

export async function runLibraryBar(cfg) {
  const { corpusFromVerdict, mergeCorpora, learnLibrary } = await import('../capability/grid-library.mjs');
  const attempts = cfg.attempts || 2;
  const arms = cfg.arms || ['base', 'library', 'base'];
  for (const a of arms) if (a !== 'base' && a !== 'library') throw new Error('bench/grid.mjs: an arm is base or library, not ' + a);
  const workers = cfg.workers;
  const corpusFiles = cfg.corpus || ['bench/verdicts/grid.json'];
  const trainList = loadSplit('training');
  const trainIndex = new Map(trainList.map((t, i) => [t.id, i]));
  let keep = null, taskList = null;
  if (cfg.devFold) {
    const par = cfg.devFold === 'even' ? 0 : 1;
    keep = (id) => trainIndex.has(id) && trainIndex.get(id) % 2 === par;
    taskList = trainList.filter((t, i) => i % 2 !== par);
  }
  if (cfg.onlyUnsolved) {
    // a HARVEST: only the tasks a verdict of the same split left unsolved (for example a longer
    // clock on the training timeouts, so deeper training programs can join the corpus)
    const v = JSON.parse(readFileSync(path.resolve(ROOT, cfg.onlyUnsolved), 'utf8'));
    if ((v.arcSplit ?? v.split) !== cfg.split) throw new Error('bench/grid.mjs: --only-unsolved needs a verdict of the ' + cfg.split + ' split');
    const done = new Set((v.rows || []).filter((r) => r.solved || (r.arms && Object.values(r.arms).some((a) => a.solved))).map((r) => r.id));
    taskList = (taskList || loadSplit(cfg.split)).filter((t) => !done.has(t.id));
    console.log('only the ' + taskList.length + ' tasks ' + cfg.onlyUnsolved + ' left unsolved');
  }
  if (cfg.split === 'training' && !cfg.devFold) console.log('NOTE: the training split with a library learned from the training split is an IN SAMPLE run (a corpus harvest), not a measurement of transfer.');
  const corpus = mergeCorpora(...corpusFiles.map((f) => corpusFromVerdict(JSON.parse(readFileSync(path.resolve(ROOT, f), 'utf8')), { keep })));
  const lopts = {};
  for (const k of ['topN', 'alpha', 'alphaFrac', 'minNet', 'minTasks', 'share']) if (cfg[k] !== undefined) lopts[k] = cfg[k];
  const lib = learnLibrary(corpus, lopts);
  const cheapest = Object.entries(lib.bits).sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 12);
  console.log('library learned from ' + lib.stats.tasks + ' solved TRAINING tasks (' + lib.stats.programs + ' programs, ' + corpusFiles.join(', ') + (cfg.devFold ? ', ' + cfg.devFold + ' numbered tasks only' : '') + '): '
    + lib.stats.candidates + ' candidate chains, ' + lib.macros.length + ' macros kept, steps ' + lib.stats.stepsBefore + ' to ' + lib.stats.stepsAfter + ' (' + lib.stats.stepsSaved + ' saved, ' + lib.stats.definitionSteps + ' to define them)');
  for (const m of lib.macros) console.log('  macro ' + m.name + ': ' + m.from + ' to ' + m.to + ', shortens ' + m.tasks + ' tasks, net ' + m.net + ' steps, learned cost ' + m.costUnits + ' units (hand ' + m.hand + ')');
  console.log('learned search order (prior alpha ' + lib.params.alpha + ' over ' + lib.stats.words + ' words; learned cost in units before quantising, cheapest first): ' + cheapest.map(([n, c]) => n + ' ' + c).join(', '));
  console.log('learned learner order: ' + lib.learnerOrder.join(', '));
  console.log('library arm clock: ' + (lib.params.share > 0 && lib.params.share < 1 ? 'the hand ordered search for ' + Math.round(cfg.budgetMs * (1 - lib.params.share)) + ' ms, then the learned order with the macros for the rest of the ' + cfg.budgetMs + ' ms' : 'the learned order with the macros for all ' + cfg.budgetMs + ' ms'));

  const results = [];
  const seenArm = {};
  for (const arm of arms) {
    seenArm[arm] = (seenArm[arm] || 0) + 1;
    const label = (arm === 'base' ? 'no-library' : 'library') + ' run ' + seenArm[arm];
    const free = await waitFreeRam(cfg.minFreeMb ?? 16384, label);
    const r = await runGridBench({ ...cfg, workers, write: false, label, taskList, libraryJson: arm === 'library' ? lib : null, attempts });
    results.push({ arm, label, freeMbBefore: free, ...r });
  }

  const base = results.filter((r) => r.arm === 'base'), libs = results.filter((r) => r.arm === 'library');
  const idsOf = (r, key) => new Set(r.rows.filter((x) => x[key]).map((x) => x.id));
  const compare = (key) => {
    if (!base.length || !libs.length) return null;
    const L = idsOf(libs[0], key), A = idsOf(base[0], key), B = base[1] ? idsOf(base[1], key) : null;
    const newly = [...L].filter((id) => !A.has(id)).sort(), lost = [...A].filter((id) => !L.has(id)).sort();
    const newlyVsBoth = B ? [...L].filter((id) => !A.has(id) && !B.has(id)).sort() : null;
    const lostVsBoth = B ? [...A].filter((id) => B.has(id) && !L.has(id)).sort() : null;
    const baseFlips = B ? [...A].filter((id) => !B.has(id)).length + [...B].filter((id) => !A.has(id)).length : null;
    const bestBase = B ? Math.max(A.size, B.size) : A.size;
    const noise = B ? Math.abs(A.size - B.size) : null;
    const margin = L.size - bestBase;
    return { library: L.size, noLibrary: B ? [A.size, B.size] : [A.size], bestNoLibrary: bestBase, noise, baseFlips, margin, met: B ? margin > noise : null, newly, lost, newlyVsBoth, lostVsBoth };
  };
  const cmp = compare('solved'), cmp1 = compare('solvedFirst');
  if (cmp) {
    console.log('');
    const line = (c, what) => console.log(what + ': library ' + c.library + ', no library ' + c.noLibrary.join(' and ') + (c.noise !== null ? ' (noise ' + c.noise + ', ' + c.baseFlips + ' tasks flipped between the two no-library runs)' : '')
      + '; margin over the better no-library run ' + c.margin + '; newly solved ' + c.newly.length + ', lost ' + c.lost.length + ' (against no-library run 1)'
      + (c.newlyVsBoth ? '; newly solved against both ' + c.newlyVsBoth.length + ', lost against both ' + c.lostVsBoth.length : ''));
    line(cmp, 'within ' + attempts + ' attempt' + (attempts > 1 ? 's' : ''));
    if (attempts > 1) line(cmp1, 'at attempt 1');
    if (cmp.newly.length) console.log('newly solved: ' + cmp.newly.join(', '));
    if (cmp.lost.length) console.log('lost: ' + cmp.lost.join(', '));
    if (cmp.met !== null) console.log('BAR ' + (cmp.met ? 'MET' : 'MISSED') + ': margin ' + cmp.margin + (cmp.met ? ' > ' : ' <= ') + 'noise ' + cmp.noise);
  }

  const complete = !taskList && !cfg.ids && !cfg.limit && results.every((r) => r.n === loadSplit(cfg.split).length);
  const isTheBar = !cfg.devFold && cfg.split === 'evaluation' && complete && base.length >= 2 && libs.length >= 1;
  const name = cfg.devFold ? 'grid-library-dev-' + cfg.devFold + (cfg.tag ? '-' + cfg.tag : '')
    : isTheBar ? 'grid-library' : 'grid-library' + (cfg.tag ? '-' + cfg.tag : '') + '-partial';
  const byId = new Map();
  results.forEach((r) => {
    for (const x of r.rows) {
      const e = byId.get(x.id) || { id: x.id, arms: {} };
      e.arms[r.label] = { solved: x.solved, solvedFirst: x.solvedFirst, status: x.status, wallMs: x.wallMs, firstMs: x.firstMs ?? null, attempts: (x.attempts || []).map((a) => ({ names: a.names })), attemptRight: x.attemptRight ?? null };
      byId.set(x.id, e);
    }
  });
  const armRows = results.map(({ rows, ...rest }) => rest);
  const L0 = libs[0] || null, A0 = base[0] || null, B0 = base[1] || null;
  const statement = cmp
    ? 'On the ARC-AGI-1 ' + cfg.split + ' split' + (cfg.devFold ? ' (DEVELOPMENT: the ' + (cfg.devFold === 'even' ? 'odd' : 'even') + ' numbered training tasks, library learned from the ' + cfg.devFold + ' numbered ones)' : '') + ', ' + results[0].n + ' tasks, at ' + cfg.budgetMs + ' ms per task, ' + workers + ' workers and ' + attempts + ' attempt' + (attempts > 1 ? 's' : '') + ' per task, arms run one at a time: '
      + 'the grid search with a library learned from ' + lib.stats.tasks + ' solved training tasks (' + lib.macros.length + ' macros, a learned search order' + (lib.params.share > 0 && lib.params.share < 1 ? ', run as a portfolio: the hand ordered search for the first ' + Math.round(cfg.budgetMs * (1 - lib.params.share)) + ' ms, then the learned order with the macros' : '') + ') solved ' + cmp.library + ', and without it ' + cmp.noLibrary.join(' and ') + ' in ' + base.length + (base.length === 1 ? ' run' : ' runs')
      + (cmp.noise !== null ? ' (run to run noise ' + cmp.noise + ' tasks, ' + cmp.baseFlips + ' tasks flipped between them)' : '') + '. '
      + 'Against the better no-library run the margin is ' + cmp.margin + '; against the first no-library run the library newly solved ' + cmp.newly.length + ' and lost ' + cmp.lost.length + '. '
      + 'At attempt 1 alone: library ' + cmp1.library + ', no library ' + cmp1.noLibrary.join(' and ') + '. '
      + 'Macros used in at least one right answer: ' + (L0 ? L0.macrosUsed : 0) + ' of ' + lib.macros.length + '. Mean ms per task: library ' + (L0 ? L0.meanMs : null) + ', no library ' + base.map((b) => b.meanMs).join(' and ') + '; timed out: library ' + (L0 ? L0.timedOut : null) + ', no library ' + base.map((b) => b.timedOut).join(' and ') + '. '
      + (cmp.met === null ? 'Only one no-library run, so no noise was measured and no bar is claimed.' : 'The bar (library above the better no-library run by more than the noise) is ' + (cmp.met ? 'MET' : 'MISSED') + '.')
      + ' Latencies were measured on a machine shared with other builders.'
    : 'Arms run: ' + results.map((r) => r.label + ' solved ' + r.solved).join(', ') + '. No comparison: a library arm and a no-library arm are both needed.';
  const verdict = {
    at: new Date().toISOString(),
    command: ('node bench/grid.mjs ' + process.argv.slice(2).join(' ')).trim(),
    node: process.version,
    isTheBar,
    barMet: isTheBar && !!(cmp && cmp.met),
    split: splitFor({ arcSplit: cfg.split, library: true, devFold: cfg.devFold || null, corpus: corpusFiles }),
    arcSplit: cfg.split, heldOut: cfg.split === 'evaluation', devFold: cfg.devFold || null,
    developmentRecords: cfg.devFold ? 'training tasks of the ' + (cfg.devFold === 'even' ? 'odd' : 'even') + ' index (sorted ids) graded, library from the ' + cfg.devFold + ' index' : cfg.split === 'training' ? 'the whole training split (in sample)' : 'none: the evaluation split is held out; the library was learned from training programs only',
    n: results[0] ? results[0].n : 0,
    budgetMs: cfg.budgetMs, workers, maxDepth: cfg.maxDepth, attemptsPerTask: attempts, attemptsAllowedByArc: 2, model: null,
    library: { corpus: corpusFiles, params: lib.params, stats: lib.stats, macros: lib.macros, learnerOrder: lib.learnerOrder, cheapestWords: Object.fromEntries(cheapest) },
    comparison: cmp, comparisonAtAttempt1: cmp1,
    arms: armRows,
    noise: cmp ? cmp.noise : null,
    statement,
    rows: [...byId.values()],
  };
  mkdirSync(VERDICTS, { recursive: true });
  const file = path.join(VERDICTS, name + '.json');
  writeFileSync(file, JSON.stringify(verdict, null, 1) + '\n');
  console.log('wrote ' + path.relative(ROOT, file).replace(/\\/g, '/') + (isTheBar ? ' (isTheBar true)' : ' (isTheBar false)'));
  return verdict;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cfg = parseArgs(process.argv.slice(2));
  (cfg.library ? runLibraryBar(cfg) : runGridBench(cfg)).catch((e) => { console.error(e && e.stack || e); process.exitCode = 1; });
}
