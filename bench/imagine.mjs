// bench/imagine.mjs: THE IMAGINE BAR. Can the organism invent a primitive that solves a task
// its fixed vocabulary could not, and does it beat a null that only recombines what it has?
//
//   node bench/imagine.mjs --split training --budget-work 1500 --workers 2
//        [--limit N] [--ids a,b] [--shape same|smaller|mult] [--admit K] [--mine-work M]
//        [--imagine-budget N] [--seeds a,b,c | --seed s] [--runs R] [--no-library] [--no-knowledge] [--quiet]
//
// EVERY BUDGET IS WORK (board 28, item imagine-repeat). --budget-work is the work one task gets per
// arm and --mine-work the work of mining one task, in work ms: capability/grid-invent.mjs counts
// what a search does (word and learner applications, the cells they read and write, the cells
// graded) and weighs the counts by WORK_MS, fitted once on this machine so that one work ms is
// about one wall ms here. A budget of work stops a search at the same state on any machine under
// any load, so a seed fixes the draw. The wall clock is printed and never budgets anything; it only
// stops a job at WALL_SAFETY times its budget plus a grace, and every such stop is counted and
// printed. --budget-ms and --mine-ms are still read, as the same work budgets (the names
// tools/boundary-audit.mjs drives this bench with).
//
// The tasks are the ones the fixed vocabulary TIMED OUT on in bench/verdicts/grid.json (236 on
// the training split when board 24a ran, 195 in the grid.json of 2026-09-27T18:54:29Z), so the
// fixed vocabulary solves 0 of them
// at this budget by construction. Three phases:
//
//   1. mine     every task is searched once with the fixed vocabulary for --mine-work and the
//               partial programs with the best mapped pixel agreement are recorded (source ii)
//   2. invent   capability/grid-invent.mjs builds the invented library from (i) the solved
//               programs of grid.json collapsed into one step and generalised over siblings,
//               (ii) the mined partials generalised, and (iii) mind/imagine.mjs propose() over
//               the DSL, whose words are outside memory (hypervector distance above the floor
//               from every stored word, no exact title in the knowledge store when it is
//               present) and outside its own recombination null. The NULL library is as many
//               random compositions and pairwise recombinations of the same memory.
//   3. solve    each task runs twice, once per arm, interleaved on the workers, under ONE work
//               budget of --budget-work that covers everything: the arm's words are screened on
//               the task's train pairs and test inputs (never its test outputs), the top
//               --admit enter the search ahead of the base words, and the search spends the
//               rest of the same work. A word is never offered to a task it was mined or collapsed
//               from (held out). A word that solves a task enters that arm's run time
//               vocabulary: the invented arm through the authority gate (kind imagine.keep),
//               the null arm by the same rule without a gate, so both arms grow alike.
//
// Then objectives: mind/imagine.mjs propose() over objectiveSpace() of what this run measured;
// each carries a suite, a bar and a control, goes through the gate, and the approved ones are
// appended to state/imagine/objectives.jsonl. Kept chain words become code patches proposed
// to the autopilot (held by the gate until verified) in state/imagine/patches.jsonl, and the
// kept vocabulary is written to state/imagine/vocabulary.json.
//
// SEEDS, RUNS AND THE BAR (board 24a, board 28). The bar command runs every phase after mining once
// per seed (imagine-bench, s2, s3: the imagination draw, the null draw and the library draw change,
// nothing else), and the whole of it, mining included, TWICE (--runs 2). It decides barMet from its
// own rows with barOf(): true only when the mean lead of the invented arm over the null arm is above
// the band, the larger of (a) the seed to seed band, the largest range across the seeds within one
// run of the invented count, the null count and the lead, and (b) the run to run band, the largest
// move of any of those three between the two runs AT ONE SEED; with at least three seeds, each run
// at least twice. Board 24a's band read (a) alone, and two runs of the same command at the same
// seeds moved as far as the seeds did (the null arm 3 then 5 at imagine-bench) because the budgets
// were the wall clock. Results are applied in job order, and job j of a stage is offered only the
// words the jobs up to j - LAG solved (visibleAt), so the worker that finishes first decides nothing.
//
// THE LIBRARY ARM (one published idea on the invention step: DreamCoder, Ellis et al., PLDI 2021;
// on ARC, Banburski et al., CBMM Memo 113). The timeouts split into two folds by a hash of the id.
// Stage A runs the invented and null arms on fold 0. The SLEEP for fold 1 compresses the solved
// programs of the development tasks (grid.json) and the invented arm's solved programs of fold 0
// into routines by description length and refits the imagination's draw to them; stage B runs the
// invented, null and library arms on fold 1, interleaved. The sleep for fold 0 reads fold 1's
// solves, and stage C runs the library arm on fold 0. So each fold is scored by a library its own
// tasks never fed, against the same null on the same seeds.
//
// Writes bench/verdicts/imagine.json with isTheBar true ONLY when every timeout of the
// training split ran with the bar options, read from a grid.json that ran the whole split
// (gridWhole); any narrower run writes imagine-partial.json with isTheBar false. Board 26 writes the
// training grid.json with isTheBar false by design (the training split is in sample for the grid
// bar), so whether the grid run covered the split is read from its own counts, not its isTheBar.
import { Worker } from 'node:worker_threads';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as G from '../capability/grid-invent.mjs';
import { propose, keep, objectiveSpace } from '../mind/imagine.mjs';
import { Gate } from '../core/gate.mjs';
import { Ledger } from '../core/ledger.mjs';

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object;
// the ARC split's own name moved to arcSplit beside it). Board 24a: development is what the words
// were invented on, heldOut is what was scored, and contaminated is false only when no scored task
// fed the invention. Mining reads every scored task's train pairs for words offered to the OTHER
// scored tasks, so on either split contaminated is the reason, never false.
/** What the imagine bar developed on and what it scored: pure, from the ARC split and the grid verdict it read. */
export function splitFor(opts = {}) {
  const evaluation = opts.arcSplit === 'evaluation';
  const src = opts.from || 'bench/verdicts/grid.json';
  const n = typeof opts.n === 'number' ? opts.n : null;
  return {
    development: {
      what: 'the ARC-AGI-1 training tasks the vocabulary was invented on: the DSL and its combinators were written against the training split, the solved programs of ' + src + (typeof opts.development === 'number' ? ' (' + opts.development + ' tasks, never scored)' : '') + ' are collapsed into words and are the development corpus of the sleep, and the train pairs of the scored timeouts are mined for partial programs offered to the OTHER scored tasks',
      arcSplit: 'training',
      tasks: typeof opts.development === 'number' ? opts.development : null,
      // board 31: the ids themselves, the tasks grid.json solved (never scored here)
      ids: Array.isArray(opts.developmentIds) ? opts.developmentIds.slice() : null,
    },
    heldOut: {
      what: (evaluation ? 'the ARC-AGI-1 evaluation tasks the fixed vocabulary timed out on, scored in every arm; nothing here was written against them' : 'the ARC-AGI-1 training tasks the fixed vocabulary timed out on, scored in every arm')
        + '; a word is never offered to the task it was mined or collapsed from, test outputs are read only to grade'
        + (opts.library ? '; the library arm is cross fitted: fold f is scored with a library slept on the development programs and the solved programs of the invented arm on the other fold only, and a word the prior imagined carries the tasks that fed it as sources, so the own program of no scored task shaped a word it was offered' : ''),
      arcSplit: evaluation ? 'evaluation' : 'training',
      n,
      ids: Array.isArray(opts.heldOutIds) ? opts.heldOutIds.slice() : null,
      folds: opts.folds || null,
    },
    // board 28: the seeds every arm drew with, and how many times the whole bench ran at each
    seeds: Array.isArray(opts.seeds) ? opts.seeds.slice() : null,
    runs: typeof opts.runs === 'number' ? opts.runs : null,
    contaminated: evaluation
      ? 'the scored evaluation tasks fed the invention through mining: the train pairs of each task were mined for words offered to the other scored tasks, never to itself; no test output fed a word'
      : 'the scored tasks are training tasks the DSL and its combinators were written against, and the train pairs of each scored task were mined for words offered to the other scored tasks, never to itself; no test output of a scored task fed a word it was offered',
  };
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(ROOT, 'bench', 'fixtures', 'public', 'arc-agi-1');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const STATE = path.join(ROOT, 'state', 'imagine');
const KNOWLEDGE = path.join(ROOT, 'bench', 'fixtures', 'wiki', 'store');
const MAX_WORKERS = 2; // eight builders share this machine

/**
 * The bar's work budgets, in work ms (capability/grid-invent.mjs WORK_MS): per task per arm, and per
 * task mined. Chosen so that the bar, 3 seeds x 2 runs x 3 jobs per task over the timeouts on 2
 * workers, fits an hour on this machine; never tuned on a solve. Board 31 measured 0.88 wall ms per
 * work ms per job on 2 workers under the shared load (a 24 task partial, 0 solves in either arm) and
 * chose 1500: 3510 jobs x 1.5 s x 0.88 / 2 is about 2320 s of solving (notes/imagine.md, board 31).
 */
export const BAR_WORK = 1500;
export const BAR_MINE_WORK = 300;
export function parseArgs(argv) {
  const a = { split: 'training', budgetWork: BAR_WORK, workers: 2, limit: null, ids: null, shape: null, admit: G.INVENT_DEFAULTS.admit, admitFrac: 0.4, mineWork: BAR_MINE_WORK, mineTop: G.INVENT_DEFAULTS.mineTop, imagineBudget: 1600, seed: 'imagine-bench', seeds: ['imagine-bench', 's2', 's3'], runs: 2, library: true, knowledge: true, carry: false, doubt: G.INVENT_DEFAULTS.doubt, quiet: false, graceMs: 4000 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    if (k === '--split') { a.split = v; i++; }
    else if (k === '--budget-work' || k === '--budget-ms') { a.budgetWork = Number(v); i++; }
    else if (k === '--workers') { a.workers = Number(v); i++; }
    else if (k === '--limit') { a.limit = Number(v); i++; }
    else if (k === '--ids') { a.ids = String(v).split(',').filter(Boolean); i++; }
    else if (k === '--shape') { a.shape = String(v); i++; }
    else if (k === '--admit') { a.admit = Number(v); i++; }
    else if (k === '--admit-frac') { a.admitFrac = Number(v); i++; }
    else if (k === '--mine-work' || k === '--mine-ms') { a.mineWork = Number(v); i++; }
    else if (k === '--imagine-budget') { a.imagineBudget = Number(v); i++; }
    else if (k === '--seed') { a.seeds = [String(v)]; i++; }
    else if (k === '--seeds') { a.seeds = String(v).split(',').map((x) => x.trim()).filter(Boolean); i++; }
    else if (k === '--runs') { a.runs = Number(v); i++; }
    else if (k === '--no-library') a.library = false;
    else if (k === '--no-knowledge') a.knowledge = false;
    else if (k === '--quiet') a.quiet = true;
    else if (k === '--carry') a.carry = true;
    else if (k === '--doubt') a.doubt = true;
    else if (k === '--no-doubt') a.doubt = false;
    else throw new Error('bench/imagine.mjs: unknown argument ' + k);
  }
  if (a.split !== 'training' && a.split !== 'evaluation') throw new Error('bench/imagine.mjs: --split must be training or evaluation');
  if (!(a.budgetWork > 0) || !(a.workers >= 1) || !(a.admit >= 0) || !(a.mineWork >= 0) || !(a.imagineBudget >= 1) || !(a.admitFrac > 0 && a.admitFrac <= 1)) throw new Error('bench/imagine.mjs: bad budget, workers, admit, mine or imagine budget');
  if (!(Number.isInteger(a.runs) && a.runs >= 1)) throw new Error('bench/imagine.mjs: --runs must be a whole number of 1 or more');
  if (!a.seeds.length || new Set(a.seeds).size !== a.seeds.length) throw new Error('bench/imagine.mjs: --seeds must name distinct seeds');
  a.seed = a.seeds[0];
  a.workers = Math.min(a.workers, MAX_WORKERS);
  return a;
}

// ---------------------------------------------------------------- workers
const WORKER_SRC = [
  "const { parentPort, workerData } = require('node:worker_threads');",
  'let G = null;',
  'let LIB = {};',
  'import(workerData.inventUrl).then((m) => { G = m; parentPort.postMessage({ type: "ready" }); },',
  '  (e) => parentPort.postMessage({ type: "bootFailed", error: String(e && e.stack || e) }));',
  'parentPort.on("message", (msg) => {',
  '  if (msg.kind === "libs") { LIB = msg.libraries || {}; return; }',
  '  const t0 = performance.now();',
  '  try {',
  '    const w0 = G.meterSnap();',
  '    if (msg.kind === "mine") {',
  '      const r = G.searchWith(G.arcTask(msg.task), [], { work: msg.work, mine: msg.mineTop });',
  '      parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: r.status, mined: r.mined || [], baseline: r.baseline, searched: r.searched, states: r.states, work: r.work } });',
  '      return;',
  '    }',
  '    const lib = G.offerable(LIB[msg.lib || msg.arm] || [], msg.extra || [], msg.taskId);',
  '    const inVocab = new Set(msg.vocab || []);',
  '    const fixed = lib.filter((w) => inVocab.has(w.key)).slice(0, msg.admit);',
  '    const rest = lib.filter((w) => !inVocab.has(w.key));',
  '    const adm = G.admitFor(rest, G.arcTask(msg.task), msg.admit - fixed.length, Infinity, msg.work * msg.admitFrac);',
  '    const words = fixed.concat(adm.admitted);',
  '    const extras = words.map((w) => G.asPrimitive(w)).filter(Boolean);',
  '    const r = G.solveWith(msg.task, extras, { work: Math.max(0, msg.work - G.workSince(w0)), doubt: !!msg.doubt });',
  '    parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: r.status, solved: r.solved, names: r.names, depth: r.depth, used: r.used, searched: r.searched, states: r.states, searchMs: r.ms, work: Math.round(G.workSince(w0) * 1e4) / 1e4, doubted: r.doubted || 0, fromFallback: !!r.fromFallback, admitted: words.length, fromVocab: fixed.length, offered: lib.length, screened: adm.screened, admitMs: adm.ms, admitWork: adm.work, admitCut: adm.cut } });',
  '  } catch (e) {',
  '    parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: "error", solved: false, error: String(e && e.stack || e) } });',
  '  }',
  '});',
].join('\n');

function spawn() {
  return new Worker(WORKER_SRC, {
    eval: true,
    workerData: { inventUrl: pathToFileURL(path.join(ROOT, 'capability', 'grid-invent.mjs')).href },
    resourceLimits: { maxOldGenerationSizeMb: 1536, maxYoungGenerationSizeMb: 64, stackSizeMb: 8 },
  });
}
function ready(worker) {
  return new Promise((resolve) => {
    const on = (m) => { if (m && (m.type === 'ready' || m.type === 'bootFailed')) { worker.off('message', on); resolve(m); } };
    worker.on('message', on);
  });
}
function runOne(worker, msg, hardMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (done) return; done = true; clearTimeout(t); worker.off('message', onMsg); worker.off('error', onErr); resolve(v); };
    const onMsg = (m) => { if (m && m.type === 'done' && m.id === msg.id) finish({ killed: false, wallMs: m.wallMs, r: m.r }); };
    const onErr = (e) => finish({ killed: true, wallMs: hardMs, r: { status: 'error', solved: false, error: String(e && e.message || e) } });
    const t = setTimeout(() => finish({ killed: true, wallMs: hardMs, r: { status: 'timeout', solved: false, error: 'stopped by the wall clock safety' } }), hardMs);
    worker.on('message', onMsg);
    worker.on('error', onErr);
    worker.postMessage(msg);
  });
}
/**
 * The workers, spawned ONCE for the whole bench and kept for every stage of every run, so every
 * job runs the capability code the bench started with (a file edited on disk while it runs is not
 * picked up by a later stage). A stage's libraries travel as one message per worker. A worker the
 * wall clock safety stops is replaced, and the replacement counted (respawns).
 */
async function openPool(n) {
  const boot = async () => { const w = spawn(); const b = await ready(w); if (b.type !== 'ready') throw new Error('imagine worker did not boot: ' + b.error); return w; };
  const lanes = [];
  for (let i = 0; i < Math.max(1, n); i++) lanes.push({ w: await boot(), libraries: null });
  const self = {
    respawns: 0,
    /** Run jobs on every lane: next() hands out the next message (or null, or a promise of one), onDone takes each result. */
    async run(libraries, next, hardMs, onDone) {
      await Promise.all(lanes.map(async (lane) => {
        if (libraries) { lane.libraries = libraries; lane.w.postMessage({ kind: 'libs', libraries }); }
        for (let msg = await next(); msg; msg = await next()) {
          const res = await runOne(lane.w, msg, hardMs);
          onDone(msg, res);
          if (res.killed) {
            try { await lane.w.terminate(); } catch { /* already gone */ }
            lane.w = await boot();
            self.respawns++;
            if (lane.libraries) lane.w.postMessage({ kind: 'libs', libraries: lane.libraries });
          }
        }
      }));
    },
    async close() { await Promise.all(lanes.map((l) => l.w.terminate().catch(() => {}))); },
  };
  return self;
}

// ---------------------------------------------------------------- helpers
const BAR_OPTIONS = ['budgetWork', 'workers', 'admit', 'admitFrac', 'mineWork', 'mineTop', 'imagineBudget', 'seeds', 'runs', 'knowledge', 'carry', 'doubt', 'library'];
/** The options of a run that differ from the bar command's, as a short file name tag ('' for the bar). */
export function variantOf(cfg) {
  const d = parseArgs([]);
  // compared as strings: the seeds are an array, and two arrays are never === each other
  return BAR_OPTIONS.filter((k) => String(cfg[k]) !== String(d[k])).map((k) => k.toLowerCase() + '-' + String(cfg[k]).replace(/[^a-z0-9.]+/gi, '')).join('-');
}
const r2 = (x) => Math.round(x * 100) / 100;
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const loadTask = (split, id) => JSON.parse(readFileSync(path.join(FIXTURES, split, id + '.json'), 'utf8'));
/** The shape relation of a task's train pairs: same, smaller, mult or other, joined when pairs differ. */
export function shapeOf(json) {
  const cat = (p) => {
    const ih = p.input.length, iw = p.input[0].length, oh = p.output.length, ow = p.output[0].length;
    if (ih === oh && iw === ow) return 'same';
    if (oh * ow < ih * iw) return 'smaller';
    if (oh % ih === 0 && ow % iw === 0) return 'mult';
    return 'other';
  };
  return [...new Set(json.train.map(cat))].join('+');
}
/**
 * Merge this run's words into the words earlier runs kept, by key: a word stays kept once it
 * passed the gate, its solved tasks are the union, and runs lists the run times that kept it.
 */
export function mergeWords(old, now, runAt) {
  const m = new Map();
  for (const e of old || []) if (e && e.key) m.set(e.key, { ...e, runs: e.runs || [] });
  for (const e of now || []) {
    if (!e || !e.key) continue;
    const had = m.get(e.key);
    m.set(e.key, had
      ? { ...had, solved: [...new Set([...(had.solved || []), ...(e.solved || [])])].sort(), runs: [...new Set([...(had.runs || []), runAt])] }
      : { ...e, runs: [runAt] });
  }
  return [...m.values()];
}
/** Two sided sign test: the probability of a split at least this uneven among n untied pairs. */
export function signTest(wins, losses) {
  const n = wins + losses;
  if (!n) return 1;
  const k = Math.min(wins, losses);
  let p = 0, c = 1;
  for (let i = 0; i <= k; i++) { p += c; c = (c * (n - i)) / (i + 1); }
  return Math.min(1, (2 * p) / 2 ** n);
}
/**
 * The runs log summarised, one group per comparable setting (split, budget, admit, admit
 * fraction, imagination budget, carry): per run the two arms, then pooled totals, wins, ties,
 * losses, the sign test and how often each task fell to each arm.
 */
/** The tasks exactly one arm solved, the count both solved, and a two sided sign test on the first two. */
export function pairedOf(invIds, nullIds) {
  const a = new Set(invIds || []), b = new Set(nullIds || []);
  const inv = [...a].filter((id) => !b.has(id)).sort(), nul = [...b].filter((id) => !a.has(id)).sort();
  return { invented: inv, null: nul, both: [...a].filter((id) => b.has(id)).length, p: signTest(inv.length, nul.length) };
}
export function runsSummary(records) {
  const groups = new Map();
  for (const r of records || []) {
    if (!r || !r.invented || !r.null || r.partial) continue;
    const g = [r.split, r.budgetWork != null ? 'work ' + r.budgetWork : r.budgetMs, r.admit, r.admitFrac, r.imagineBudget, !!r.carry, !!r.doubt].join('|');
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(r);
  }
  return [...groups.entries()].map(([g, rs]) => {
    let wins = 0, ties = 0, losses = 0;
    const freq = { invented: {}, null: {} };
    for (const r of rs) {
      const d = r.invented.solved - r.null.solved;
      if (d > 0) wins++; else if (d < 0) losses++; else ties++;
      for (const a of ['invented', 'null']) for (const id of r[a].ids || []) freq[a][id] = (freq[a][id] || 0) + 1;
    }
    const sumOf = (a) => rs.reduce((x, r) => x + r[a].solved, 0);
    // per run: a task one arm alone solved counts once per run (runs share tasks, so these are not independent)
    let invOnly = 0, nullOnly = 0;
    for (const r of rs) { const q = pairedOf(r.invented.ids, r.null.ids); invOnly += q.invented.length; nullOnly += q.null.length; }
    // per task: the runs the invented arm solved it in minus the runs the null did; one vote per task
    let taskAhead = 0, taskBehind = 0;
    for (const id of new Set([...Object.keys(freq.invented), ...Object.keys(freq.null)])) { const d = (freq.invented[id] || 0) - (freq.null[id] || 0); if (d > 0) taskAhead++; else if (d < 0) taskBehind++; }
    const pairing = { invOnly, nullOnly, pRuns: signTest(invOnly, nullOnly), taskAhead, taskBehind, pTasks: signTest(taskAhead, taskBehind) };
    return { group: g, runs: rs.length, invented: sumOf('invented'), null: sumOf('null'), wins, ties, losses, p: signTest(wins, losses), freq, pairing, records: rs };
  });
}
const VALUE_FLAGS_OFF = new Set(['--carry', '--quiet', '--no-knowledge', '--doubt', '--no-doubt', '--no-library']);
/** The flags of a bench/imagine.mjs command line, as a map from flag to value ('' for a switch). */
export function argsOf(command) {
  const t = String(command || '').trim().split(/\s+/);
  const at = t.findIndex((x) => x.endsWith('imagine.mjs'));
  const m = new Map();
  for (let i = at + 1; at >= 0 && i < t.length; i++) {
    if (!t[i].startsWith('--')) continue;
    if (VALUE_FLAGS_OFF.has(t[i]) || i + 1 >= t.length || t[i + 1].startsWith('--')) m.set(t[i], '');
    else { m.set(t[i], t[i + 1]); i++; }
  }
  return m;
}
/** A run tests an objective's suite when it ran every flag of the suite, and nothing else but a seed or seeds, a carry or quiet. */
const EXTRA_OK = new Set(['--seed', '--seeds', '--carry', '--quiet']);
export function suiteMatches(suite, command) {
  const want = argsOf(suite), got = argsOf(command);
  if (!want.size) return false;
  for (const [k, v] of want) if (got.get(k) !== v) return false;
  for (const k of got.keys()) if (!want.has(k) && !EXTRA_OK.has(k)) return false;
  return true;
}
/** The value an objective's metric takes in one logged run, or null when the run cannot say. */
/** A bar on the lead: the invented arm minus the null arm. */
const leadBar = (o) => /minus solved by the null arm/.test(String(o && o.ruler && o.ruler.bar && o.ruler.bar.metric));
export function metricOf(objective, run) {
  const t = objective.template, h = String(objective.hypothesis || '');
  if (!run || !run.invented || !run.null) return null;
  if (t === 'lead' || t === 'budget') return run.invented.solved - run.null.solved;
  if (t === 'screen') return leadBar(objective) ? run.invented.solved - run.null.solved : run.invented.solved;
  if (t === 'transfer') {
    const m = /^the kept word (\S+) solves/.exec(h);
    if (!m || !run.transfer || !run.transfer.byWord) return null;
    return (run.transfer.byWord[m[1]] || []).length;
  }
  if (t === 'operator') {
    const m = /^the imagination operator (\S+?),/.exec(h);
    return m && run.operators && run.operators[m[1]] ? run.operators[m[1]].solved : null;
  }
  if (t === 'shape') {
    const m = /^a combinator built for (\S+) shape tasks/.exec(h);
    return m && run.shapes && run.shapes[m[1]] ? run.shapes[m[1]].invented : null;
  }
  return null;
}
/**
 * The null arm's value on the same metric in one logged run, where the metric has a null side: the
 * lead and budget bars already subtract it, the null arm has no operators, and a transfer counts one
 * word where the null carries eight, so none of those has one. Null when it cannot say.
 */
export function controlOf(objective, run) {
  const t = objective.template, h = String(objective.hypothesis || '');
  if (!run || !run.invented || !run.null) return null;
  if (t === 'screen') return leadBar(objective) ? null : run.null.solved;
  if (t === 'shape') {
    const m = /^a combinator built for (\S+) shape tasks/.exec(h);
    return m && run.shapes && run.shapes[m[1]] ? run.shapes[m[1]].null : null;
  }
  return null;
}
const compare = (x, op, v) => (op === '>' ? x > v : op === '>=' ? x >= v : op === '<' ? x < v : op === '<=' ? x <= v : op === '=' || op === '==' ? x === v : false);
/** When a logged run started (older records carry only their end and wall time). */
const startOf = (r) => (r.startedAt ? Date.parse(r.startedAt) : Date.parse(r.at) - 1000 * (r.wallS || 0));
/**
 * Every objective, graded against the logged runs that tested its suite and STARTED after it was
 * written: an objective is a prediction, so the run it was read off never grades it.
 */
export function gradeObjectives(objectives, runs) {
  return (objectives || []).filter((o) => o && o.ruler && o.ruler.bar).map((o) => {
    const tested = (runs || []).filter((r) => startOf(r) > Date.parse(o.at) && suiteMatches(o.ruler.suite, r.command) && (o.template !== 'transfer' || r.carry));
    const measured = tested.filter((r) => typeof metricOf(o, r) === 'number');
    const values = measured.map((r) => metricOf(o, r));
    const paired = measured.map((r, i) => [values[i], controlOf(o, r)]).filter(([, c]) => typeof c === 'number');
    const controls = paired.map(([, c]) => c), beyond = paired.filter(([v, c]) => v > c).length;
    const met = values.filter((x) => compare(x, o.ruler.bar.op, o.ruler.bar.value)).length;
    return { key: o.key, template: o.template, hypothesis: o.hypothesis, suite: o.ruler.suite, bar: o.ruler.bar, runs: tested.length, values, controls, beyond, met, status: !values.length ? 'untested' : met === values.length ? 'met' : met ? 'mixed' : 'not met' };
  });
}
const readJsonl = (file) => {
  if (!existsSync(file)) return [];
  const out = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) { if (!line.trim()) continue; try { out.push(JSON.parse(line)); } catch { /* a torn line is skipped */ } }
  return out;
};

/** The objective templates: each turns one measured fact into a hypothesis with a suite, a bar and a control. */
export function objectiveTemplates(cfg) {
  // the budget is work (board 28); a cfg or fact written before carries budgetMs, read the same way
  const B = cfg.budgetWork ?? cfg.budgetMs;
  const bf = (f) => f.budgetWork ?? f.budgetMs;
  const bar = 'node bench/imagine.mjs --split training --budget-work ' + B + ' --workers 2';
  const nullArm = 'the null arm: random compositions and pairwise recombinations of the same memory, same library size, same admission, same budget';
  return [
    {
      name: 'lead', accepts: (f) => f.kind === 'arms',
      make: (f) => ({ hypothesis: 'imagined primitives solve more of the ' + f.n + ' fixed vocabulary timeouts than the recombination null does at ' + bf(f) + ' work ms', plane: 'capability', ruler: { suite: bar, bar: { metric: 'solved with invented primitives minus solved by the null arm', op: '>', value: f.invented - f.null }, control: nullArm } }),
    },
    {
      name: 'budget', accepts: (f) => f.kind === 'arms',
      make: (f) => ({ hypothesis: 'at ' + 2 * bf(f) + ' work ms the invented arm leads the null by more than the ' + (f.invented - f.null) + ' it leads by at ' + bf(f) + ' work ms', plane: 'capability', ruler: { suite: bar.replace('--budget-work ' + B, '--budget-work ' + 2 * bf(f)), bar: { metric: 'solved with invented primitives minus solved by the null arm', op: '>', value: f.invented - f.null }, control: nullArm + ', at the doubled budget' } }),
    },
    {
      name: 'transfer', accepts: (f) => f.kind === 'kept',
      make: (f) => ({ hypothesis: 'the kept word ' + f.key + ' solves a held out evaluation task the fixed vocabulary timed out on', plane: 'capability', ruler: { suite: 'node bench/imagine.mjs --split evaluation --budget-work ' + B + ' --workers 2', bar: { metric: 'evaluation timeouts solved by a program that uses ' + f.key, op: '>=', value: 1 }, control: nullArm + ', on the evaluation timeouts' } }),
    },
    {
      name: 'shape', accepts: (f) => f.kind === 'shape' && f.invented === 0 && f.n > 0,
      make: (f) => ({ hypothesis: 'a combinator built for ' + f.name + ' shape tasks solves at least one of the ' + f.n + ' ' + f.name + ' timeouts nothing solved', plane: 'capability', ruler: { suite: bar + ' --shape ' + f.name, bar: { metric: f.name + ' timeouts solved with invented primitives', op: '>=', value: 1 }, control: nullArm + ', on the same ' + f.name + ' tasks' } }),
    },
    {
      name: 'operator', accepts: (f) => f.kind === 'operator' && f.words > 0,
      make: (f) => ({ hypothesis: 'the imagination operator ' + f.name + ', nested one level deeper, solves more timeouts than the ' + f.solved + ' it solves at one level', plane: 'mind', ruler: { suite: bar, bar: { metric: 'timeouts solved by words from operator ' + f.name, op: '>', value: f.solved }, control: nullArm } }),
    },
    {
      name: 'screen', accepts: (f) => f.kind === 'screen',
      make: (f) => ({ hypothesis: 'admitting ' + 2 * f.admit + ' words per task instead of ' + f.admit + ' keeps the invented arm ahead of the null by more than the ' + (f.invented - f.null) + ' it leads by at ' + f.admit, plane: 'capability', ruler: { suite: bar + ' --admit ' + 2 * f.admit, bar: { metric: 'solved with invented primitives minus solved by the null arm', op: '>', value: f.invented - f.null }, control: nullArm + ', admitting ' + 2 * f.admit + ' too' } }),
    },
  ];
}

// ---------------------------------------------------------------- the bar, decided from the rows
/**
 * The library step's settings (DreamCoder's sleep, capability/grid-invent.mjs compressLibrary and
 * libraryPrior): two folds, a library cost of lambda per token, at most 24 routines, and a
 * pseudocount alpha on every count of the refit draw. Fixed before the first bar run with the
 * library arm, never tuned on its solves.
 */
export const LIBRARY = Object.freeze({ folds: 2, lambda: 1, maxRoutines: 24, alpha: 1 });
/** The bar needs this many seeds, and the bar command runs these. */
export const MIN_SEEDS = 3;
/** The bar needs every seed run this many times, and the bar command runs them (--runs). */
export const MIN_RUNS = 2;
export const BAR_SEEDS = Object.freeze(['imagine-bench', 's2', 's3']);
/**
 * One arm against a control over seeds and runs: the lead in each row (one seed in one run), the
 * mean lead over every row, and two bands over three numbers (the arm's count, the control's count
 * and the lead):
 *   seed to seed (ranges): within one run, the range across the seeds; the largest over the runs.
 *     How far a number moved when only the draw changed.
 *   run to run (runRanges): at one seed, the range across its runs; the largest over the seeds.
 *     How far a number moved when NOTHING changed but the run. Null when no seed ran twice.
 * The band is the larger of the two, and `bound` names which one set it. Met only with at least
 * minSeeds seeds, every seed run at least minRuns times, and a mean lead strictly above the band.
 * A row without a run is run 1.
 * @param {{seed?: string, run?: number, arm: number, control: number}[]} perSeed
 */
export function barOf(perSeed, minSeeds = MIN_SEEDS, minRuns = MIN_RUNS) {
  const rows = (perSeed || []).filter((s) => s && Number.isFinite(s.arm) && Number.isFinite(s.control));
  const runOf = (s) => s.run ?? 1, seedOf = (s) => s.seed ?? null;
  const arm = rows.map((s) => s.arm), control = rows.map((s) => s.control), lead = rows.map((s) => s.arm - s.control);
  const pick = { arm: (s) => s.arm, control: (s) => s.control, lead: (s) => s.arm - s.control };
  const range = (xs) => (xs.length ? Math.max(...xs) - Math.min(...xs) : null);
  const seeds = [...new Set(rows.map(seedOf))];
  const runs = [...new Set(rows.map(runOf))].sort((a, b) => a - b);
  const bySeed = seeds.map((sd) => rows.filter((s) => seedOf(s) === sd));
  const ranges = {}, runRanges = {};
  for (const q of ['arm', 'control', 'lead']) {
    const within = runs.map((r) => range(rows.filter((s) => runOf(s) === r).map(pick[q]))).filter((x) => x !== null);
    ranges[q] = within.length ? Math.max(...within) : null;
    const moves = bySeed.filter((xs) => xs.length >= 2).map((xs) => range(xs.map(pick[q])));
    runRanges[q] = moves.length ? Math.max(...moves) : null;
  }
  const seedBand = rows.length ? Math.max(ranges.arm, ranges.control, ranges.lead) : null;
  const runBand = runRanges.lead === null ? null : Math.max(runRanges.arm, runRanges.control, runRanges.lead);
  const band = seedBand === null ? null : runBand === null ? seedBand : Math.max(seedBand, runBand);
  const bound = band === null ? null : runBand === null ? 'the seed to seed band (the run to run band unmeasured)'
    : runBand > seedBand ? 'the run to run band' : seedBand > runBand ? 'the seed to seed band' : 'both bands (equal)';
  const meanLead = rows.length ? Math.round((lead.reduce((a, b) => a + b, 0) / rows.length) * 1e4) / 1e4 : null;
  const runsPerSeed = bySeed.length ? Math.min(...bySeed.map((xs) => new Set(xs.map(runOf)).size)) : 0;
  const met = seeds.length >= minSeeds && runsPerSeed >= minRuns && meanLead > band;
  const why = seeds.length < minSeeds ? seeds.length + ' seed' + (seeds.length === 1 ? '' : 's') + ', the bar needs ' + minSeeds
    : runsPerSeed < minRuns ? runsPerSeed + ' run' + (runsPerSeed === 1 ? '' : 's') + ' at a seed, the bar needs ' + minRuns + ': the run to run band is unmeasured'
      : (met ? 'the mean lead ' + meanLead + ' is above the band ' + band : 'the mean lead ' + meanLead + ' is not above the band ' + band) + ', set by ' + bound;
  return { seeds, runs, rowSeeds: rows.map(seedOf), rowRuns: rows.map(runOf), arm, control, lead, meanLead, ranges, runRanges, seedBand, runBand, band, bound, minSeeds, minRuns, runsPerSeed, met, why };
}
/**
 * Per task over seeds: the seeds arm a solved it in minus the seeds arm b did, one vote per task,
 * and a two sided sign test on the votes.
 */
export function taskVotes(perSeedIds) {
  const a = {}, b = {};
  for (const s of perSeedIds || []) { for (const id of s.a || []) a[id] = (a[id] || 0) + 1; for (const id of s.b || []) b[id] = (b[id] || 0) + 1; }
  let ahead = 0, behind = 0;
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) { const d = (a[id] || 0) - (b[id] || 0); if (d > 0) ahead++; else if (d < 0) behind++; }
  return { ahead, behind, p: signTest(ahead, behind) };
}
// ---------------------------------------------------------------- one seed, one draw (board 28)
// Board 24a's two runs of the bar at the same seeds disagreed (invented 8, 9, 5 and null 3, 5, 6,
// then 8, 9, 7 and 5, 5, 4) for two reasons, both removed here. Every budget was the wall clock, now
// every budget is work (capability/grid-invent.mjs). And the run time vocabulary a job was offered
// held the words of whichever jobs had FINISHED, which depends on the machine; now the results are
// applied in job order (inOrder), and job j of a stage is offered only the words that jobs up to
// j - LAG of that stage (and every job of an earlier stage) brought in, whatever the worker count up
// to LAG. The run to run band of the bar measures what is left.
/** Job j is offered the words brought in by jobs 0 .. j - LAG of its stage, and by every earlier stage. */
export const LAG = MAX_WORKERS;
/** The wall clock stops a job at this many times its work budget plus the grace: a safety, counted and printed. */
export const WALL_SAFETY = 4;
/**
 * Whether a word that entered a run time vocabulary at `entered` ({stage, job}; null or stage -1 for
 * a word carried in before the first stage) is offered to job `job` of stage `stage`.
 */
export function visibleAt(entered, stage, job, lag = LAG) {
  if (!entered || entered.stage < stage) return true;
  return entered.stage === stage && entered.job <= job - lag;
}
/** FNV-1a of a string, as 8 hex digits. */
export function hashOf(str) {
  let h = 0x811c9dc5;
  const t = String(str);
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
/**
 * What must come back identical when a job runs again: its status, answer, program, words used,
 * the states it searched and stored, the work it spent, and (mining) the partial programs it kept.
 * The wall clock is not in it.
 */
export function fingerprintOf(r) {
  if (!r) return null;
  return JSON.stringify([r.status ?? null, r.solved ?? null, (r.names || []).join(' '), (r.used || []).join(' '), r.searched ?? null, r.states ?? null, r.work ?? null, r.admitted ?? null, r.screened ?? null, r.mined || null]);
}
/**
 * Two runs of one seed, row by row: per arm the ids whose fingerprint differs (or that ran in one
 * run only), and the count of tasks compared.
 */
export function rowsDiffer(rowsA, rowsB, arms) {
  const byId = new Map((rowsB || []).map((x) => [x.id, x]));
  const out = { of: (rowsA || []).length };
  for (const a of arms) out[a] = (rowsA || []).filter((x) => { const y = byId.get(x.id); return !y || fingerprintOf(x[a]) !== fingerprintOf(y[a]); }).map((x) => x.id);
  return out;
}
/**
 * Results applied in job order, whatever order the workers finish in: done(j, x) buffers x and
 * apply(j, x) runs for j = 0, 1, 2 ... as soon as every job before j is done; until(k) resolves once
 * the first k results are applied.
 */
export function inOrder(apply) {
  const buf = new Map(), waiting = [];
  let next = 0;
  const flush = () => {
    while (buf.has(next)) { const x = buf.get(next); buf.delete(next); apply(next, x); next++; }
    for (let i = waiting.length - 1; i >= 0; i--) if (next >= waiting[i].k) { waiting[i].resolve(); waiting.splice(i, 1); }
  };
  return {
    done(j, x) { buf.set(j, x); flush(); },
    until(k) { return next >= k ? Promise.resolve() : new Promise((resolve) => waiting.push({ k, resolve })); },
    get applied() { return next; },
  };
}
/**
 * The sleep's corpus for one fold: the development programs (the solved programs of grid.json,
 * tasks that are never scored) and the programs the invented arm SOLVED on the other folds of this
 * seed. A program of the fold being slept for is never read, so a fold's library is fed only by
 * tasks it is not scored on.
 */
export function sleepCorpus({ rows, fold, folds = LIBRARY.folds, devPrograms = [], byKey = new Map() }) {
  const fed = [], programs = (devPrograms || []).slice();
  for (const x of rows || []) {
    if (!x || G.foldOf(x.id, folds) === fold) continue;
    const a = x.invented;
    if (!a || a.solved !== true || !Array.isArray(a.names)) continue;
    const steps = G.programSteps(a.names, byKey);
    if (!steps || !steps.length) continue;
    programs.push({ id: x.id, steps });
    fed.push(x.id);
  }
  return { programs, fed: fed.sort() };
}

// ---------------------------------------------------------------- the bench
/**
 * Whether a grid verdict ran the whole split: every task of it has a row, it is no control arm and
 * no repeat. Its isTheBar decides it only when true (board 26 writes the training grid.json with
 * isTheBar false: in sample for the grid bar, still every task of the split).
 */
export function gridWhole(gv) {
  if (!gv || !Array.isArray(gv.rows)) return false;
  if (gv.isTheBar === true) return true;
  return typeof gv.n === 'number' && gv.n > 0 && gv.n === gv.of && gv.rows.length === gv.n && !gv.controlArm && !gv.repeatOf;
}
const slim = (w) => ({ key: w.key, spec: w.spec, source: w.source, sources: (w.sources || []).slice(), operator: w.operator ?? null, novelty: w.novelty ?? null, round: w.round ?? null });
export async function runImagineBench(cfg) {
  // parseArgs always names the seeds and the runs; a cfg without them is refused, never defaulted
  if (!Array.isArray(cfg.seeds) || !cfg.seeds.length || !(Number.isInteger(cfg.runs) && cfg.runs >= 1)) throw new Error('bench/imagine.mjs: runImagineBench needs cfg.seeds and cfg.runs, as parseArgs gives them');
  const t0 = performance.now();
  let peakRss = process.memoryUsage().rss;
  const sampler = setInterval(() => { const r = process.memoryUsage().rss; if (r > peakRss) peakRss = r; }, 250);
  sampler.unref();
  const say = (s) => { if (!cfg.quiet) console.log(s); };
  const seeds = cfg.seeds.slice(), runsN = cfg.runs;
  // the budgets are work; a cfg written before board 28 names them budgetMs and mineMs
  const budgetWork = cfg.budgetWork ?? cfg.budgetMs, mineWork = cfg.mineWork ?? cfg.mineMs ?? 0;
  const graceMs = cfg.graceMs ?? 4000;
  const srcName = cfg.split === 'training' ? 'grid.json' : 'grid-evaluation.json';
  const gv = JSON.parse(readFileSync(path.join(VERDICTS, srcName), 'utf8'));
  const timeouts = gv.rows.filter((r) => r.status === 'timeout').map((r) => r.id);
  const solvedRows = gv.rows.filter((r) => r.solved && Array.isArray(r.names));
  let list = timeouts.slice();
  if (cfg.ids) list = list.filter((id) => cfg.ids.includes(id));
  const shapes = new Map(list.map((id) => [id, shapeOf(loadTask(cfg.split, id))]));
  if (cfg.shape) list = list.filter((id) => shapes.get(id) === cfg.shape);
  if (cfg.limit) list = list.slice(0, cfg.limit);
  const fullList = !cfg.ids && !cfg.limit && !cfg.shape && list.length === timeouts.length && gridWhole(gv);
  const complete = cfg.split === 'training' && fullList;
  // a complete run that changed any option of the bar command is a VARIANT: its own verdict name, isTheBar false
  const variant = variantOf(cfg);
  const isBar = complete && !variant;
  const name = 'imagine' + (cfg.split === 'training' ? '' : '-' + cfg.split) + (variant ? '-' + variant : '') + (cfg.shape ? '-shape-' + String(cfg.shape).replace(/[^a-z0-9]+/gi, '-') : '') + (fullList ? '' : '-partial');
  const file = path.join(VERDICTS, name + '.json');
  // the verdict this run replaces, read before it is overwritten, so the statement can name it
  let previous = null;
  try { const p = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null; previous = p ? { at: p.at || null, barMet: p.barMet ?? null, byWork: p.budgetWork != null } : null; } catch { previous = null; }
  const hardMs = WALL_SAFETY * budgetWork + graceMs, mineHardMs = WALL_SAFETY * mineWork + graceMs;
  const folds = new Map(list.map((id) => [id, G.foldOf(id, LIBRARY.folds)]));
  const foldIds = (f) => list.filter((id) => folds.get(id) === f);
  say('imagine bar: ' + list.length + ' of the ' + timeouts.length + ' tasks the fixed vocabulary timed out on in bench/verdicts/' + srcName + ' (' + cfg.split + '), budget ' + budgetWork + ' work ms per task per arm (the wall clock stops a job only at ' + hardMs + ' ms), mining ' + mineWork + ' work ms per task, ' + cfg.workers + ' workers, admit ' + cfg.admit + ', seeds ' + seeds.join(', ') + ', runs ' + runsN + (cfg.library ? ', library arm on (' + LIBRARY.folds + ' folds: ' + foldIds(0).length + ' and ' + foldIds(1).length + ' tasks)' : ', library arm off'));

  // a marker that a bench is running: test/imagine.mutants.mjs refuses to edit sources while a
  // bench/verdicts/imagine-*-partial.json is younger than ten minutes; refreshed every minute, removed at the end
  mkdirSync(VERDICTS, { recursive: true });
  const marker = path.join(VERDICTS, 'imagine-running-partial.json');
  const beat = () => { try { writeFileSync(marker, JSON.stringify({ at: new Date().toISOString(), from: 'bench/imagine.mjs', isTheBar: false, note: 'a bench is running; removed when it ends' }) + '\n'); } catch { /* the marker is a courtesy */ } };
  beat();
  const beater = setInterval(beat, 60000);
  beater.unref();
  const pool = await openPool(Math.min(cfg.workers, MAX_WORKERS));
  let knowledge = null, knowledgeNote = 'absent';
  try {
    // what every run shares: the collapsed words, the memory before mining, the development programs
    const collapsed = G.collapseSolved(solvedRows);
    const solvedChains = solvedRows.map((r) => ({ spec: G.chainSpec(G.unlearned(r.names)) })).filter((m) => m.spec && m.spec.k === 'chain');
    const devPrograms = solvedRows.map((r) => ({ id: r.id, steps: G.programSteps(r.names) })).filter((p) => p.steps && p.steps.length);
    if (cfg.knowledge && existsSync(path.join(KNOWLEDGE, 'meta.json'))) {
      try { const K = await import('../memory/knowledge.mjs'); knowledge = K.openKnowledge(KNOWLEDGE); knowledgeNote = knowledge ? 'bench/fixtures/wiki/store, ' + knowledge.A + ' articles' : 'failed to open'; } catch (e) { knowledgeNote = 'failed to open: ' + (e && e.message); }
    } else if (!cfg.knowledge) knowledgeNote = 'off (--no-knowledge)';
    // --carry: the words each arm kept in earlier bar runs (state/imagine/vocabulary.json), read once
    let carryFile = null, carryPrior = null;
    if (cfg.carry) {
      const vf = path.join(STATE, 'vocabulary.json');
      try { carryPrior = existsSync(vf) ? JSON.parse(readFileSync(vf, 'utf8')) : null; } catch { carryPrior = null; }
      carryFile = carryPrior ? path.relative(ROOT, vf).split(path.sep).join('/') : null;
    }
    const usedAdded = (a) => !!(a && a.solved && Array.isArray(a.used) && a.used.length);

    // one run: mining, then every seed; a fresh gate, nothing carried from an earlier run
    const runOnce = async (run) => {
      const trun = performance.now();
      // 1. mine the timeouts (source ii) by work, the results kept in list order whatever finishes first
      const tm = performance.now();
      const mined = new Array(list.length).fill(null);
      let mineKilled = 0;
      if (mineWork > 0 && list.length) {
        let i = 0;
        await pool.run(null, () => {
          if (i >= list.length) return null;
          const k = i++;
          return { kind: 'mine', id: 'mine:' + run + ':' + k, k, taskId: list[k], task: loadTask(cfg.split, list[k]), work: mineWork, mineTop: cfg.mineTop };
        }, mineHardMs, (msg, res) => {
          const r = res.r || {};
          mined[msg.k] = { id: msg.taskId, mined: r.mined || [], status: r.status, searched: r.searched ?? null, states: r.states ?? null, work: r.work ?? null, killed: res.killed };
          if (res.killed) mineKilled++;
        });
      }
      const minedRows = mined.filter(Boolean);
      const mineS = r2((performance.now() - tm) / 1000);
      const foundWhileMining = minedRows.filter((r) => r.status === 'found').length;
      const mineHash = hashOf(JSON.stringify(minedRows.map((r) => [r.id, r.status, r.searched, r.states, r.work, r.mined])));
      // 2. what every seed of this run shares: the collapsed and mined words and the memory
      const fromTimeouts = G.fromTimeouts(minedRows);
      const memory = G.vocabularyMemory().concat(solvedChains, collapsed, fromTimeouts);
      const gate = new Gate({ ledger: new Ledger({ ring: 4096 }) });

      // 3. every seed: its own imagination, null and library draws, the arms interleaved
      const runSeed = async (seed) => {
        const startedAt = new Date().toISOString();
        const tseed = performance.now();
        const ti = performance.now();
        const imagined = G.imagineWords({ memory, budget: cfg.imagineBudget, seed, knowledge });
        const invented = new Map();
        for (const w of [...collapsed, ...fromTimeouts, ...imagined.words]) {
          const had = invented.get(w.key);
          if (had) had.sources = [...new Set([...had.sources, ...w.sources])].sort();
          else invented.set(w.key, slim(w));
        }
        const invLib = [...invented.values()];
        const nullLib = G.nullLibrary(invLib.length, memory, seed + ':null').map((w) => ({ key: w.key, spec: w.spec, source: w.source, sources: [], operator: null, novelty: null, round: null }));
        const bySource = {};
        for (const w of invLib) bySource[w.source] = (bySource[w.source] || 0) + 1;
        let inventMs = performance.now() - ti;

        const vocab = { invented: new G.InventedVocabulary({ gate }), library: new G.InventedVocabulary({ gate }) };
        const nullVocab = new Map();
        // where each word entered its arm's run time vocabulary ({stage, job}); a carried word before every stage
        const entered = { invented: new Map(), library: new Map(), null: new Map() };
        const BEFORE = { stage: -1, job: 0 };
        const carried = { from: carryFile, at: carryPrior ? carryPrior.at || null : null, invented: [], null: [] };
        const carriedInv = [], carriedNull = [];
        if (cfg.carry) {
          if (carryPrior) {
            const invKeys = new Set(invLib.map((w) => w.key)), nullKeys = new Set(nullLib.map((w) => w.key));
            for (const e of carryPrior.entries || []) {
              if (!e || !e.spec || !G.isGridWord(e.spec)) continue;
              const w = { key: e.key, spec: e.spec, source: 'carried', sources: [], operator: e.operator ?? null, novelty: e.novelty ?? null, round: null };
              const p = vocab.invented.submit(w, { solved: e.solved || [], novelty: e.novelty });
              if (p.status !== 'approved') continue;
              entered.invented.set(e.key, BEFORE);
              if (cfg.library) { const q = vocab.library.submit(w, { solved: e.solved || [], novelty: e.novelty }); if (q.status === 'approved') entered.library.set(e.key, BEFORE); }
              carried.invented.push(e.key);
              if (!invKeys.has(e.key)) carriedInv.push(w);
            }
            for (const e of carryPrior.nullArm || []) {
              if (!e || !e.spec || !G.isGridWord(e.spec)) continue;
              nullVocab.set(e.key, { key: e.key, spec: e.spec, source: 'carried', solved: [] });
              entered.null.set(e.key, BEFORE);
              carried.null.push(e.key);
              if (!nullKeys.has(e.key)) carriedNull.push({ key: e.key, spec: e.spec, source: 'carried', sources: [], operator: null, novelty: null, round: null });
            }
          }
          say('run ' + run + ' seed ' + seed + ': carried from ' + (carried.from || 'nothing (no state/imagine/vocabulary.json)') + ': invented arm ' + carried.invented.length + ' words, null arm ' + carried.null.length);
        }
        const libs = { invented: invLib.concat(carriedInv), null: nullLib.concat(carriedNull) };
        const byKey = { invented: new Map(libs.invented.map((w) => [w.key, w])), null: new Map(libs.null.map((w) => [w.key, w])) };
        const rows = new Map(list.map((id) => [id, { seed, run, id, shape: shapes.get(id), fold: folds.get(id) }]));
        const submissions = [], stages = [], sleeps = [];
        const libKeyOf = (armName, id) => (armName === 'library' ? 'library:' + folds.get(id) : armName);
        const lookup = (armName, lib, key) => (byKey[lib] && byKey[lib].get(key)) || (armName === 'library' && vocab.library.entries.get(key)) || null;
        let stageNo = 0;
        const runStage = async (stageName, ids, arms, libraries) => {
          const stage = stageNo++;
          const jobs = [];
          ids.forEach((id, i) => { for (let k = 0; k < arms.length; k++) jobs.push({ id, arm: arms[(i + k) % arms.length] }); });
          const st = performance.now();
          const wall = {};
          // job jj's result, applied in job order: its row, and every word it solved with into its arm's vocabulary
          const order = inOrder((jj, { msg, res }) => {
            const r = { killed: res.killed, wallMs: r2(res.wallMs), ...res.r };
            rows.get(msg.taskId)[msg.arm] = r;
            (wall[msg.arm] || (wall[msg.arm] = [])).push(r.wallMs);
            if (!usedAdded(r)) return;
            for (const key of new Set(r.used)) {
              const w = lookup(msg.arm, msg.lib, key);
              if (!w || (w.sources || []).includes(msg.taskId)) continue;
              if (msg.arm === 'null') {
                const had = nullVocab.get(key);
                nullVocab.set(key, { key, spec: w.spec, source: w.source, solved: [...new Set([...(had ? had.solved : []), msg.taskId])].sort() });
                if (!entered.null.has(key)) entered.null.set(key, { stage, job: jj });
                continue;
              }
              const [scored] = G.noveltyAgainst([{ ...w }], solvedRows);
              const p = vocab[msg.arm].submit(w, { solved: [msg.taskId], novelty: scored.novelty0 });
              if (p.status === 'approved' && !entered[msg.arm].has(key)) entered[msg.arm].set(key, { stage, job: jj });
              submissions.push({ arm: msg.arm, key, task: msg.taskId, status: p.status, novelty0: scored.novelty0, noveltyHeld: scored.noveltyHeld, proposal: p.id });
            }
          });
          let j = 0;
          const next = async () => {
            if (j >= jobs.length) return null;
            const jj = j++;
            // job jj waits until the jobs up to jj - LAG are applied, and is offered only their words
            await order.until(jj - LAG + 1);
            const job = jobs[jj];
            const lib = libKeyOf(job.arm, job.id);
            const seen = (key) => visibleAt(entered[job.arm].get(key), stage, jj);
            const inVocab = job.arm === 'null' ? [...nullVocab.keys()].filter(seen) : vocab[job.arm].list().map((e) => e.key).filter(seen);
            // a word the library arm kept that this fold's library lacks travels with the message
            const extra = job.arm === 'library' ? vocab.library.list().filter((e) => seen(e.key) && !byKey[lib].has(e.key)).map(slim) : [];
            return { kind: 'solve', id: run + ':' + seed + ':' + job.arm + ':' + job.id, jj, arm: job.arm, lib, extra, taskId: job.id, task: loadTask(cfg.split, job.id), vocab: inVocab, admit: cfg.admit, admitFrac: cfg.admitFrac, work: budgetWork, doubt: cfg.doubt };
          };
          if (jobs.length) await pool.run(libraries, next, hardMs, (msg, res) => order.done(msg.jj, { msg, res }));
          const wallS = r2((performance.now() - st) / 1000);
          stages.push({ name: stageName, tasks: ids.length, arms, wallS, meanMs: Object.fromEntries(Object.entries(wall).map(([a, xs]) => [a, r2(xs.reduce((x, y) => x + y, 0) / xs.length)])) });
          say('run ' + run + ' seed ' + seed + ' stage ' + stageName + ': ' + ids.length + ' tasks x ' + arms.join('+') + ' in ' + wallS + ' s');
        };
        // the sleep for one fold: compress the development programs and the invented arm's solved
        // programs of the OTHER fold into routines, refit the draw to them, imagine under it
        const sleep = (fold) => {
          const tsl = performance.now();
          const corpus = sleepCorpus({ rows: [...rows.values()], fold, devPrograms, byKey: byKey.invented });
          const comp = G.compressLibrary(corpus.programs, { lambda: LIBRARY.lambda, maxRoutines: LIBRARY.maxRoutines });
          const prior = G.libraryPrior(corpus.programs, comp.routines, LIBRARY.alpha);
          const lw = G.libraryWords({ memory, base: [...collapsed, ...fromTimeouts], routines: comp.routines, prior, fedBy: corpus.fed, budget: cfg.imagineBudget, seed, knowledge, cap: invLib.length });
          const words = lw.words.map(slim);
          const have = new Set(words.map((w) => w.key));
          const lib = words.concat(carriedInv.filter((w) => !have.has(w.key)));
          libs['library:' + fold] = lib;
          byKey['library:' + fold] = new Map(lib.map((w) => [w.key, w]));
          const bySrc = {};
          for (const w of lib) bySrc[w.source] = (bySrc[w.source] || 0) + 1;
          sleeps.push({ fold, fed: corpus.fed, programs: corpus.programs.length, devPrograms: devPrograms.length, routines: comp.routines.map((r) => ({ key: r.key, uses: r.uses, dl: r.dl, gain: r.gain, from: r.from })), dlBefore: comp.before, dlAfter: comp.after, words: lib.length, bySource: bySrc, routinesNew: lw.routinesNew, imaginedUnderPrior: lw.imagined, priorOps: prior.ops, alpha: prior.alpha, ms: r2(performance.now() - tsl) });
          inventMs += performance.now() - tsl;
        };
        if (!cfg.library) await runStage('all', list, ['invented', 'null'], { invented: libs.invented, null: libs.null });
        else {
          await runStage('A', foldIds(0), ['invented', 'null'], { invented: libs.invented, null: libs.null });
          sleep(1);
          await runStage('B', foldIds(1), ['invented', 'null', 'library'], { invented: libs.invented, null: libs.null, 'library:1': libs['library:1'] });
          sleep(0);
          await runStage('C', foldIds(0), ['library'], { 'library:0': libs['library:0'] });
        }

        // tally
        const all = [...rows.values()];
        const arm = (armName) => {
          const rs = all.map((x) => x[armName]).filter(Boolean);
          return {
            runs: rs.length,
            solvedWithAdded: rs.filter(usedAdded).length,
            solvedAny: rs.filter((a) => a.solved).length,
            solvedBaseOnly: rs.filter((a) => a.solved && !(a.used && a.used.length)).length,
            foundButWrong: rs.filter((a) => a.status === 'found' && !a.solved).length,
            timedOut: rs.filter((a) => a.status === 'timeout').length,
            exhausted: rs.filter((a) => a.status === 'exhausted').length,
            errors: rs.filter((a) => a.status === 'error').length,
            killed: rs.filter((a) => a.killed).length,
            meanMs: rs.length ? r2(rs.reduce((s, a) => s + a.wallMs, 0) / rs.length) : null,
            meanWork: rs.length ? r2(rs.reduce((s, a) => s + (a.work || 0), 0) / rs.length) : null,
            meanAdmitMs: rs.length ? r2(rs.reduce((s, a) => s + (a.admitMs || 0), 0) / rs.length) : null,
            meanAdmitted: rs.length ? r2(rs.reduce((s, a) => s + (a.admitted || 0), 0) / rs.length) : null,
            admitCut: rs.filter((a) => a.admitCut).length,
            doubted: rs.filter((a) => a.doubted > 0).length,
            fromFallback: rs.filter((a) => a.fromFallback).length,
            solvedIds: all.filter((x) => usedAdded(x[armName])).map((x) => x.id),
          };
        };
        const inv = arm('invented'), nul = arm('null'), libArm = cfg.library ? arm('library') : null;
        const carriedSet = new Set(carried.invented), carriedNullSet = new Set(carried.null);
        const kept = vocab.invented.list().filter((e) => !carriedSet.has(e.key));
        const keptLibrary = vocab.library.list().filter((e) => !carriedSet.has(e.key));
        const nullSolvedWords = [...nullVocab.values()].filter((e) => e.solved.length && !carriedNullSet.has(e.key));
        const transferOf = (armName, keys) => {
          const ks = new Set(keys);
          const hit = all.filter((x) => usedAdded(x[armName]) && x[armName].used.some((k) => ks.has(k)));
          const byWord = {};
          for (const x of hit) for (const k of new Set(x[armName].used)) if (ks.has(k)) (byWord[k] || (byWord[k] = [])).push(x.id);
          return { words: keys.length, solvedIds: hit.map((x) => x.id), wordsThatSolved: Object.keys(byWord).sort(), byWord };
        };
        const transfer = cfg.carry ? { from: carried.from, at: carried.at, invented: transferOf('invented', carried.invented), null: transferOf('null', carried.null) } : null;
        const meanNovelty = kept.length ? r4(kept.reduce((s, e) => s + e.novelty, 0) / kept.length) : null;
        const opFacts = {};
        for (const w of invLib) if (w.operator) (opFacts[w.operator] || (opFacts[w.operator] = { kind: 'operator', name: w.operator, words: 0, solved: 0 })).words++;
        for (const x of all) if (usedAdded(x.invented)) for (const key of new Set(x.invented.used)) { const w = byKey.invented.get(key); if (w && w.operator && opFacts[w.operator]) opFacts[w.operator].solved++; }
        const shapeFacts = {};
        for (const x of all) { const f = shapeFacts[x.shape] || (shapeFacts[x.shape] = { kind: 'shape', name: x.shape, n: 0, invented: 0, null: 0, library: 0 }); f.n++; if (usedAdded(x.invented)) f.invented++; if (usedAdded(x.null)) f.null++; if (usedAdded(x.library)) f.library++; }
        const roundFacts = {};
        for (const w of invLib) if (w.source === 'imagine' && w.round) (roundFacts[w.round] || (roundFacts[w.round] = { round: w.round, words: 0, tasks: [] })).words++;
        for (const x of all) {
          if (!usedAdded(x.invented)) continue;
          const rs = new Set(x.invented.used.map((k) => byKey.invented.get(k)).filter((w) => w && w.source === 'imagine' && w.round).map((w) => w.round));
          for (const r of rs) if (roundFacts[r]) roundFacts[r].tasks.push(x.id);
        }
        const noRound = invLib.filter((w) => w.source === 'imagine' && !w.round).length;
        // what the library arm solved with: a routine, a word imagined under the refit prior, or another word
        const libraryUse = { routine: 0, priorImagined: 0, other: 0 };
        if (libArm) for (const x of all) {
          if (!usedAdded(x.library)) continue;
          const ws = x.library.used.map((k) => lookup('library', libKeyOf('library', x.id), k)).filter(Boolean);
          if (ws.some((w) => w.source === 'library.routine')) libraryUse.routine++;
          else if (ws.some((w) => w.source === 'imagine')) libraryUse.priorImagined++;
          else libraryUse.other++;
        }
        // the libraries as key lists, hashed: two runs of one seed must build the same ones
        const libraryHashes = Object.fromEntries(Object.entries(libs).map(([k, ws]) => [k, hashOf(ws.map((w) => w.key).join('\n'))]));
        return {
          seed, run, startedAt, at: new Date().toISOString(), wallS: r2((performance.now() - tseed) / 1000), inventS: r2(inventMs / 1000),
          primitivesInvented: invLib.length, bySource, nullLibrary: nullLib.length, imagination: imagined.report, libraryHashes,
          stages, sleeps, invented: inv, null: nul, library: libArm, libraryUse,
          paired: pairedOf(inv.solvedIds, nul.solvedIds), pairedLibrary: libArm ? pairedOf(libArm.solvedIds, nul.solvedIds) : null,
          kept, keptLibrary, submissions, refused: vocab.invented.refused, refusedLibrary: vocab.library.refused, nullSolvedWords, carried, transfer, meanNovelty,
          opFacts, shapeFacts, roundFacts, noRound, rows: all,
        };
      };
      const perSeed = [];
      for (const seed of seeds) perSeed.push(await runSeed(seed));
      return { run, mineS, mineKilled, foundWhileMining, mined: minedRows.length, mineHash, perSeed, wallS: r2((performance.now() - trun) / 1000) };
    };
    const perRun = [];
    for (let run = 1; run <= runsN; run++) perRun.push(await runOnce(run));
    const cells = perRun.flatMap((p) => p.perSeed);
    const armsOf = cfg.library ? ['invented', 'null', 'library'] : ['invented', 'null'];

    // 4. the bar, from the rows: one row per seed per run
    const rowsOf = (a, c) => cells.map((s) => ({ seed: s.seed, run: s.run, arm: s[a].solvedWithAdded, control: s[c].solvedWithAdded }));
    const bar = barOf(rowsOf('invented', 'null'));
    const libBar = cfg.library ? barOf(rowsOf('library', 'null')) : null;
    const libVsInv = cfg.library ? barOf(rowsOf('library', 'invented')) : null;
    const votes = {
      inventedOverNull: taskVotes(cells.map((s) => ({ a: s.invented.solvedIds, b: s.null.solvedIds }))),
      libraryOverNull: cfg.library ? taskVotes(cells.map((s) => ({ a: s.library.solvedIds, b: s.null.solvedIds }))) : null,
      libraryOverInvented: cfg.library ? taskVotes(cells.map((s) => ({ a: s.library.solvedIds, b: s.invented.solvedIds }))) : null,
    };
    // run to run, at one seed: the rows that came back different, and whether the libraries and the mining did
    const runToRun = [];
    for (let k = 1; k < perRun.length; k++) {
      const a = perRun[0], b = perRun[k];
      const bySeed = seeds.map((seed) => {
        const x = a.perSeed.find((s) => s.seed === seed), y = b.perSeed.find((s) => s.seed === seed);
        const d = rowsDiffer(x.rows, y.rows, armsOf);
        return { seed, of: d.of, differ: Object.fromEntries(armsOf.map((m) => [m, d[m]])), librariesSame: Object.fromEntries(Object.keys(x.libraryHashes).map((m) => [m, x.libraryHashes[m] === y.libraryHashes[m]])), counts: Object.fromEntries(armsOf.map((m) => [m, [x[m].solvedWithAdded, y[m].solvedWithAdded]])) };
      });
      runToRun.push({ runs: [a.run, b.run], miningSame: a.mineHash === b.mineHash, bySeed, rowsDiffer: bySeed.reduce((t, s) => t + armsOf.reduce((u, m) => u + s.differ[m].length, 0), 0), rowsCompared: bySeed.reduce((t, s) => t + s.of * armsOf.length, 0) });
    }
    const s0 = perRun[0].perSeed[0];

    // 5. objectives (vision), from the first seed of the first run. A narrower run keeps its state apart.
    const gate = new Gate({ ledger: new Ledger({ ring: 4096 }) });
    const stateDir = isBar ? STATE : path.join(STATE, 'partial');
    const stateRel = path.relative(ROOT, stateDir).split(path.sep).join('/');
    mkdirSync(stateDir, { recursive: true });
    const objFile = path.join(stateDir, 'objectives.jsonl');
    const priorObjectives = readJsonl(objFile).filter((o) => o && o.hypothesis && o.ruler);
    const facts = {
      templates: objectiveTemplates({ ...cfg, budgetWork }),
      items: [{ kind: 'arms', n: list.length, invented: s0.invented.solvedWithAdded, null: s0.null.solvedWithAdded, budgetWork }, { kind: 'screen', admit: cfg.admit, invented: s0.invented.solvedWithAdded, null: s0.null.solvedWithAdded }, ...s0.kept.map((e) => ({ kind: 'kept', key: e.key })), ...Object.values(s0.opFacts), ...Object.values(s0.shapeFacts)],
      memory: priorObjectives,
    };
    const objReport = propose({ space: objectiveSpace(facts), memory: priorObjectives, seed: seeds[0] + ':objectives', floor: 0.02 }, 24);
    const objWritten = [];
    for (const c of objReport.candidates) {
      const p = keep(c, {}, { gate, by: 'bench/imagine.mjs' });
      if (p.status !== 'approved') continue;
      const line = { at: new Date().toISOString(), key: c.key, hypothesis: c.hypothesis, plane: c.plane, ruler: c.ruler, template: c.template, novelty: c.novelty, proposal: p.id, from: 'bench/imagine.mjs' };
      appendFileSync(objFile, JSON.stringify(line) + '\n');
      objWritten.push(line);
    }
    // 6. patches for the autopilot, held until verified: every word the invented arm kept in any seed of any run, once
    const patchFile = path.join(stateDir, 'patches.jsonl');
    const patches = [];
    const keptUnion = new Map();
    for (const s of cells) for (const e of s.kept) if (!keptUnion.has(e.key)) keptUnion.set(e.key, e);
    for (const e of keptUnion.values()) {
      const patch = G.patchFor(e);
      if (!patch) continue;
      const p = keep({ type: 'patch', key: patch.key }, { ...patch, verified: false, novelty: e.novelty }, { gate, by: 'bench/imagine.mjs', why: 'register a kept invented word as a named primitive' });
      const line = { at: new Date().toISOString(), ...patch, status: p.status, proposal: p.id };
      appendFileSync(patchFile, JSON.stringify(line) + '\n');
      patches.push(line);
    }
    const vocabFile = path.join(stateDir, 'vocabulary.json');
    let priorVocab = null;
    try { priorVocab = existsSync(vocabFile) ? JSON.parse(readFileSync(vocabFile, 'utf8')) : null; } catch { priorVocab = null; }
    let entries = priorVocab && priorVocab.entries, nullArm = priorVocab && priorVocab.nullArm, libraryArm = priorVocab && priorVocab.libraryArm;
    for (const s of cells) { entries = mergeWords(entries, s.kept, s.at); nullArm = mergeWords(nullArm, s.nullSolvedWords, s.at); libraryArm = mergeWords(libraryArm, s.keptLibrary, s.at); }
    const runAt = new Date().toISOString();
    writeFileSync(vocabFile, JSON.stringify({ at: runAt, from: 'bench/imagine.mjs', budgetWork, note: 'merged across runs and seeds: a word stays kept once it passed the gate', entries, nullArm, libraryArm }, null, 1) + '\n');
    const transferObjectives = [];
    if (cfg.carry && cfg.split === 'evaluation') {
      const carriedAny = new Set(cells.flatMap((s) => s.carried.invented));
      const solvedBy = new Set(cells.flatMap((s) => (s.transfer ? s.transfer.invented.wordsThatSolved : [])));
      for (const o of readJsonl(path.join(STATE, 'objectives.jsonl'))) {
        if (!o || o.template !== 'transfer' || typeof o.hypothesis !== 'string') continue;
        const m = /^the kept word (\S+) solves/.exec(o.hypothesis);
        if (!m) continue;
        transferObjectives.push({ key: o.key, word: m[1], carried: carriedAny.has(m[1]), met: solvedBy.has(m[1]) });
      }
    }

    const wallMs = performance.now() - t0;
    clearInterval(sampler);
    peakRss = Math.max(peakRss, process.memoryUsage().rss);
    const peakRssMb = Math.round(peakRss / (1024 * 1024));

    // the summary, kept in the verdict as printed so a lost or shared stdout never loses it
    const printed = [];
    const seedLines = new Map();
    const cellKey = (s) => s.run + '|' + s.seed;
    const out = (line, s = null) => { printed.push(line); console.log(line); if (s) { const k = cellKey(s); if (!seedLines.has(k)) seedLines.set(k, []); seedLines.get(k).push(line); } };
    const ids = (xs) => (xs.length ? ' (' + xs.join(', ') + ')' : '');
    const arms = (s) => ['invented', 'null'].concat(s.library ? ['library'] : []);
    console.log('');
    out('tasks ' + list.length + ' (the fixed vocabulary timed out on every one at ' + gv.budgetMs + ' ms in bench/verdicts/' + srcName + '; so it solves 0 of them by construction' + (cfg.library ? '; fold 0 ' + foldIds(0).length + ', fold 1 ' + foldIds(1).length : '') + '); budget ' + budgetWork + ' work ms per task per arm, mining ' + mineWork + ' work ms per task; ' + runsN + ' run' + (runsN === 1 ? '' : 's') + ' of seeds ' + seeds.join(', '));
    for (const p of perRun) {
      out('run ' + p.run + ' mining: ' + p.mined + ' tasks, ' + p.foundWhileMining + ' found a program while mining, stopped by the wall clock safety ' + p.mineKilled + ', fingerprint ' + p.mineHash + ', ' + p.mineS + ' s');
      for (const s of p.perSeed) {
        const tag = 'run ' + s.run + ' seed ' + s.seed;
        out(tag + ': solved with an added word: invented ' + s.invented.solvedWithAdded + ids(s.invented.solvedIds) + ', null ' + s.null.solvedWithAdded + ids(s.null.solvedIds) + (s.library ? ', library ' + s.library.solvedWithAdded + ids(s.library.solvedIds) : '') + ' of ' + list.length + '; without an added word: ' + arms(s).map((a) => a + ' ' + s[a].solvedBaseOnly).join(', ') + '; found but wrong: ' + arms(s).map((a) => a + ' ' + s[a].foundButWrong).join(', '), s);
        out(tag + ' libraries: invented ' + s.primitivesInvented + ' (' + Object.entries(s.bySource).map(([k, v]) => k + ' ' + v).join(', ') + '), null ' + s.nullLibrary + (s.sleeps.length ? '; ' + s.sleeps.map((z) => 'library fold ' + z.fold + ' ' + z.words + ' (slept on ' + z.fed.length + ' invented solves of the other fold and ' + z.devPrograms + ' development programs: ' + z.routines.length + ' routines, ' + z.routinesNew + ' not already a word, description length ' + z.dlBefore + ' to ' + z.dlAfter + '; ' + z.imaginedUnderPrior + ' words imagined under the refit draw)').join('; ') : '') + '; key list fingerprints ' + Object.entries(s.libraryHashes).map(([k, v]) => k + ' ' + v).join(', '), s);
        out(tag + ' kept through the gate: invented ' + s.kept.length + ' (' + s.submissions.filter((x) => x.arm === 'invented').length + ' submitted, ' + s.refused + ' refused)' + (s.library ? ', library ' + s.keptLibrary.length + ' (' + s.submissions.filter((x) => x.arm === 'library').length + ' submitted, ' + s.refusedLibrary + ' refused)' : '') + '; null words that solved ' + s.nullSolvedWords.length + '; mean novelty of the invented arm\'s kept words ' + (s.meanNovelty === null ? 'none kept' : s.meanNovelty) + (s.library ? '; library solves by a routine ' + s.libraryUse.routine + ', by a word imagined under the refit draw ' + s.libraryUse.priorImagined + ', by another word ' + s.libraryUse.other : ''), s);
        out(tag + ' paired by task: invented only ' + s.paired.invented.length + ids(s.paired.invented) + ', null only ' + s.paired.null.length + ids(s.paired.null) + ', both ' + s.paired.both + ', sign test p ' + r4(s.paired.p) + (s.pairedLibrary ? '; library only ' + s.pairedLibrary.invented.length + ids(s.pairedLibrary.invented) + ' against null only ' + s.pairedLibrary.null.length + ', p ' + r4(s.pairedLibrary.p) : ''), s);
        out(tag + ' by operator (invented arm words / solves): ' + Object.values(s.opFacts).map((f) => f.name + ' ' + f.words + '/' + f.solved).join(', ') + '; imagination by round: ' + (Object.values(s.roundFacts).map((f) => 'round ' + f.round + ' ' + f.words + ' words, ' + f.tasks.length + ' tasks').join('; ') || 'none') + (s.noRound ? '; round unknown for ' + s.noRound : ''), s);
        if (s.transfer) out(tag + ' carried from ' + (s.transfer.from || 'nothing') + ' (written ' + s.transfer.at + '): invented arm ' + s.transfer.invented.words + ' words solved ' + s.transfer.invented.solvedIds.length + ids(s.transfer.invented.solvedIds) + ', null arm ' + s.transfer.null.words + ' words solved ' + s.transfer.null.solvedIds.length + ids(s.transfer.null.solvedIds), s);
        out(tag + ' stages: ' + s.stages.map((g) => g.name + ' ' + g.tasks + ' tasks ' + g.arms.join('+') + ' ' + g.wallS + ' s').join(', ') + '; work ms per task ' + arms(s).map((a) => a + ' ' + s[a].meanWork).join(', ') + '; wall ms per task ' + arms(s).map((a) => a + ' ' + s[a].meanMs).join(', ') + '; stopped by the wall clock safety ' + arms(s).reduce((x, a) => x + s[a].killed, 0) + ', errors ' + arms(s).reduce((x, a) => x + s[a].errors, 0), s);
      }
    }
    // a bar's numbers run by run: the seeds of run 1, then a bar, then the seeds of run 2
    const byRun = (xs, b) => b.runs.map((r) => xs.filter((_, i) => b.rowRuns[i] === r).join(', ')).join(' | ');
    const fmtBar = (b, armName, ctlName) => armName + ' ' + byRun(b.arm, b) + '; ' + ctlName + ' ' + byRun(b.control, b) + '; lead ' + byRun(b.lead, b) + ' (run ' + b.runs.join(' | run ') + ', seeds in the order ' + b.seeds.join(', ') + '); mean lead ' + b.meanLead
      + '; seed to seed band ' + b.seedBand + ' (the largest range across the ' + b.seeds.length + ' seeds within one run of: the ' + armName + ' count ' + b.ranges.arm + ', the ' + ctlName + ' count ' + b.ranges.control + ', the lead ' + b.ranges.lead + ')'
      + '; run to run band ' + (b.runBand === null ? 'unmeasured (one run)' : b.runBand + ' (the largest move between runs at one seed of: the ' + armName + ' count ' + b.runRanges.arm + ', the ' + ctlName + ' count ' + b.runRanges.control + ', the lead ' + b.runRanges.lead + ')')
      + '; band ' + b.band + ', set by ' + b.bound;
    out('the bar, the invented arm against the null arm: ' + fmtBar(bar, 'invented', 'null'));
    out('barMet ' + bar.met + ': ' + bar.why);
    if (libBar) {
      out('the library arm (DreamCoder: routines compressed from solved programs by description length, the imagination\'s draw refit to them, cross fitted by fold) against the same null: ' + fmtBar(libBar, 'library', 'null') + '; beyond the band ' + libBar.met);
      out('the library arm against the invented arm: ' + fmtBar(libVsInv, 'library', 'invented') + '; beyond the band ' + libVsInv.met);
    }
    for (const d of runToRun) {
      out('run ' + d.runs[0] + ' against run ' + d.runs[1] + ' at one seed: mining ' + (d.miningSame ? 'identical' : 'DIFFERENT') + '; rows that came back different (status, program, words, states, work) ' + d.rowsDiffer + ' of ' + d.rowsCompared + ': ' + d.bySeed.map((s) => 'seed ' + s.seed + ' ' + armsOf.map((m) => m + ' ' + s.differ[m].length).join(', ') + ' of ' + s.of + ' (libraries ' + (Object.values(s.librariesSame).every(Boolean) ? 'identical' : 'DIFFERENT: ' + Object.entries(s.librariesSame).filter(([, v]) => !v).map(([k]) => k).join(', ')) + ')').join('; '));
    }
    out('per task over the seeds and runs (seed runs one arm solved it in minus the other, one vote per task): invented over null ahead ' + votes.inventedOverNull.ahead + ', behind ' + votes.inventedOverNull.behind + ', sign test p ' + r4(votes.inventedOverNull.p) + (votes.libraryOverNull ? '; library over null ahead ' + votes.libraryOverNull.ahead + ', behind ' + votes.libraryOverNull.behind + ', p ' + r4(votes.libraryOverNull.p) + '; library over invented ahead ' + votes.libraryOverInvented.ahead + ', behind ' + votes.libraryOverInvented.behind + ', p ' + r4(votes.libraryOverInvented.p) : ''));
    if (transferObjectives.length) out('transfer objectives in state/imagine/objectives.jsonl: ' + transferObjectives.length + ', their word carried ' + transferObjectives.filter((o) => o.carried).length + ', met ' + transferObjectives.filter((o) => o.met).length + (transferObjectives.some((o) => o.met) ? ' (' + transferObjectives.filter((o) => o.met).map((o) => o.word).join(', ') + ')' : ''));
    out('objectives proposed from the first seed of the first run: ' + objReport.candidates.length + ', written to ' + stateRel + '/objectives.jsonl: ' + objWritten.length + ' (' + priorObjectives.length + ' were already there); patches proposed and held: ' + patches.length + '; knowledge ' + knowledgeNote);
    const solveS = cells.reduce((x, s) => x + s.stages.reduce((y, g) => y + g.wallS, 0), 0), inventS = cells.reduce((x, s) => x + s.inventS, 0), mineS = perRun.reduce((x, p) => x + p.mineS, 0);
    const killedSolve = cells.reduce((x, s) => x + arms(s).reduce((y, a) => y + s[a].killed, 0), 0), killedMine = perRun.reduce((x, p) => x + p.mineKilled, 0);
    out('phases: mine ' + r2(mineS) + ' s, invent and sleep ' + r2(inventS) + ' s, solve ' + r2(solveS) + ' s over ' + runsN + ' run' + (runsN === 1 ? '' : 's') + ' of ' + seeds.length + ' seed' + (seeds.length === 1 ? '' : 's') + ' (run walls ' + perRun.map((p) => p.wallS + ' s').join(', ') + '); stopped by the wall clock safety: mining ' + killedMine + ', solving ' + killedSolve + '; workers replaced ' + pool.respawns + '; wall ' + r2(wallMs / 1000) + ' s; peak rss ' + peakRssMb + ' MB');

    const command = ('node ' + process.execArgv.join(' ') + ' bench/imagine.mjs ' + process.argv.slice(2).join(' ')).replace(/\s+/g, ' ').trim();
    const verdictAt = new Date().toISOString();
    // one record per seed per run for state/imagine/runs.jsonl: every complete run, and every run of one whole shape class
    const logIt = fullList || (cfg.shape && !cfg.ids && !cfg.limit);
    const records = logIt ? cells.map((s) => ({ at: s.at, startedAt: s.startedAt, command, split: cfg.split, isTheBar: isBar, variant: variant || null, seed: s.seed, run: s.run, seeds, budgetWork, admit: cfg.admit, admitFrac: cfg.admitFrac, imagineBudget: cfg.imagineBudget, carry: !!cfg.carry, doubt: !!cfg.doubt, library: !!cfg.library, n: list.length, invented: { solved: s.invented.solvedWithAdded, ids: s.invented.solvedIds }, null: { solved: s.null.solvedWithAdded, ids: s.null.solvedIds }, libraryArm: s.library ? { solved: s.library.solvedWithAdded, ids: s.library.solvedIds } : null, kept: s.kept.map((e) => e.key), transfer: s.transfer ? { invented: s.transfer.invented.solvedIds, null: s.transfer.null.solvedIds, byWord: s.transfer.invented.byWord } : null, shape: cfg.shape || null, partial: !fullList, operators: Object.fromEntries(Object.values(s.opFacts).map((f) => [f.name, { words: f.words, solved: f.solved }])), shapes: Object.fromEntries(Object.values(s.shapeFacts).map((f) => [f.name, { n: f.n, invented: f.invented, null: f.null, library: f.library }])), rounds: s.roundFacts, paired: s.paired, verdict: 'bench/verdicts/' + name + '.json', printed: seedLines.get(cellKey(s)) || [] })) : [];
    const graded = gradeObjectives(readJsonl(path.join(STATE, 'objectives.jsonl')), readJsonl(path.join(STATE, 'runs.jsonl')).concat(records));
    const gcount = (st) => graded.filter((g) => g.status === st).length;
    out('objectives graded by the runs that tested them after they were written: ' + graded.length + ' in state/imagine/objectives.jsonl, met ' + gcount('met') + ', mixed ' + gcount('mixed') + ', not met ' + gcount('not met') + ', untested ' + gcount('untested'));
    const nums = (xs, b) => byRun(xs, b);
    const control = 'the null arm: as many random compositions of the fixed vocabulary and pairwise recombinations of the same memory as the invented library holds, under the same screen, the same admission of ' + cfg.admit + ' words and the same ' + budgetWork + ' work ms per task, on the same seeds in the same runs';
    const differText = runToRun.length ? runToRun.map((d) => 'run ' + d.runs[1] + ' repeated run ' + d.runs[0] + ' with ' + d.rowsDiffer + ' of ' + d.rowsCompared + ' task rows different and the mining ' + (d.miningSame ? 'identical' : 'different')).join('; ') : 'one run only, so the run to run band is unmeasured';
    const verdict = {
      at: verdictAt,
      command,
      node: process.version,
      isTheBar: isBar,
      barMet: bar.met,
      variant: variant || null,
      split: splitFor({ arcSplit: cfg.split, from: 'bench/verdicts/' + srcName, n: list.length, development: solvedRows.length, developmentIds: solvedRows.map((r) => r.id), heldOutIds: list, folds: cfg.library ? { 0: foldIds(0).length, 1: foldIds(1).length } : null, library: !!cfg.library, seeds, runs: runsN }),
      arcSplit: cfg.split,
      from: 'bench/verdicts/' + srcName,
      n: list.length, of: timeouts.length,
      budgetWork, mineWork, workUnit: 'work ms: capability/grid-invent.mjs WORK_MS weighs the counted applications and cells of a search', WORK_MS: { ...G.WORK_MS },
      wallSafety: { factor: WALL_SAFETY, graceMs, solveMs: hardMs, mineMs: mineHardMs, stoppedSolving: killedSolve, stoppedMining: killedMine, workersReplaced: pool.respawns },
      lag: LAG, workers: cfg.workers, admit: cfg.admit, admitFrac: cfg.admitFrac, imagineBudget: cfg.imagineBudget, seeds, runs: runsN, doubt: cfg.doubt, library: cfg.library ? LIBRARY : null,
      bar: { ...bar, rule: 'barMet is true only when the invented arm solves more of these timeouts than the null arm by more than the band: at least ' + MIN_SEEDS + ' seeds, every seed run at least ' + MIN_RUNS + ' times, and the mean lead over every seed and run above the larger of the seed to seed band (the largest range across the seeds within one run of the invented count, the null count and the lead) and the run to run band (the largest move of any of those three between runs at one seed)' },
      control,
      libraryBar: libBar, libraryVsInvented: libVsInv, taskVotes: votes, runToRun,
      solvedWithInvented: perRun.map((p) => p.perSeed.map((s) => s.invented.solvedWithAdded)), solvedByNull: perRun.map((p) => p.perSeed.map((s) => s.null.solvedWithAdded)), solvedByLibrary: cfg.library ? perRun.map((p) => p.perSeed.map((s) => s.library.solvedWithAdded)) : null, solvedByFixed: 0,
      perRun: perRun.map((p) => ({ ...p, perSeed: p.perSeed.map((s) => ({ ...s, rows: undefined })) })),
      supersedes: previous,
      knowledge: knowledgeNote,
      objectivesProposed: objReport.candidates.length, objectivesWritten: objWritten.length, objectives: objWritten, objectiveRejections: objReport.rejected,
      patchesHeld: patches.length, transferObjectives,
      phasesSeconds: { mine: r2(mineS), inventAndSleep: r2(inventS), solve: r2(solveS), wall: r2(wallMs / 1000), runs: perRun.map((p) => p.wallS) },
      peakRssMb,
      objectivesGraded: graded.map((g) => ({ template: g.template, hypothesis: g.hypothesis, bar: g.bar, status: g.status, values: g.values })),
      printed,
      statement: 'On the ' + list.length + ' ARC-AGI-1 ' + cfg.split + ' tasks the fixed vocabulary timed out on (bench/verdicts/' + srcName + ', so it solves 0 of them by construction), over ' + seeds.length + ' seeds (' + seeds.join(', ') + ') each run ' + runsN + ' time' + (runsN === 1 ? '' : 's') + ' under a budget of ' + budgetWork + ' work ms per task per arm (counted work, not the wall clock), the invented arm solved ' + nums(bar.arm, bar) + ' (run by run, seeds in that order) with a program that uses an invented primitive and the control, ' + control + ', solved ' + nums(bar.control, bar) + '. '
        + 'The mean lead is ' + bar.meanLead + '; the seed to seed band is ' + bar.seedBand + ' and the run to run band is ' + (bar.runBand === null ? 'unmeasured' : bar.runBand) + ', so the band is ' + bar.band + ', set by ' + bar.bound + ', and barMet is ' + bar.met + ': ' + bar.why + '. '
        + 'Run to run: ' + differText + '; the wall clock safety stopped ' + killedSolve + ' solve jobs and ' + killedMine + ' mining jobs. '
        + (libBar ? 'The second comparison is the library arm, DreamCoder\'s library learning applied to the invention step (routines compressed by description length from the development programs and the other fold\'s invented solves, the imagination\'s draw refit to them, so no fold is scored with a library its own tasks fed): it solved ' + nums(libBar.arm, libBar) + ', a mean lead of ' + libBar.meanLead + ' over the null against a band of ' + libBar.band + ' set by ' + libBar.bound + ' (beyond the band: ' + libBar.met + '), and a mean lead of ' + libVsInv.meanLead + ' over the invented arm against a band of ' + libVsInv.band + '. ' : '')
        + 'Per task over the seeds and runs the invented arm was ahead of the null on ' + votes.inventedOverNull.ahead + ' tasks and behind on ' + votes.inventedOverNull.behind + ' (sign test p ' + r4(votes.inventedOverNull.p) + '). '
        + (previous && previous.at && !previous.byWork ? 'This replaces the verdict written at ' + previous.at + ' (barMet ' + previous.barMet + '), whose budgets were the wall clock, so its draw was not fixed by its seeds. ' : '')
        + (cfg.split === 'training' ? 'This is the TRAINING split and it is contaminated in the sense the split object states: the DSL and its combinators were written against it, and each scored task\'s train pairs were mined for words offered to the other scored tasks, never to itself; no scored task\'s test output fed a word it was offered.' : 'This is the EVALUATION split: nothing here was written against it, but it is contaminated in the sense the split object states: each scored task\'s train pairs were mined for words offered to the other scored tasks, never to itself.'),
      rows: cells.flatMap((s) => s.rows),
    };
    const body = JSON.stringify(verdict, null, 1) + '\n';
    writeFileSync(file, body);
    if (records.length) {
      mkdirSync(STATE, { recursive: true });
      for (const rec of records) appendFileSync(path.join(STATE, 'runs.jsonl'), JSON.stringify(rec) + '\n');
    }
    const mb = Buffer.byteLength(body) / (1024 * 1024);
    console.log('wrote ' + path.relative(ROOT, file).replace(/\\/g, '/') + ' (' + r2(mb) + ' MB' + (mb > 100 ? ', OVER 100 MB' : '') + ')' + (isBar ? ' (isTheBar true, barMet ' + bar.met + ')' : complete ? ' (a variant of the bar, isTheBar false)' : fullList ? ' (every ' + cfg.split + ' timeout, isTheBar false)' : ' (partial, isTheBar false)'));
    return verdict;
  } finally {
    clearInterval(beater);
    clearInterval(sampler);
    try { unlinkSync(marker); } catch { /* already gone */ }
    await pool.close();
    if (knowledge) { try { knowledge.close(); } catch { /* closed */ } }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  if (argv[0] === '--runs') printRuns();
  else if (argv[0] === '--objectives') printObjectives();
  else runImagineBench(parseArgs(argv)).catch((e) => { console.error(e && e.stack || e); process.exitCode = 1; });
}

/** node bench/imagine.mjs --objectives: every objective the runs wrote, graded against the runs that tested its suite. */
function printObjectives() {
  const objectives = readJsonl(path.join(STATE, 'objectives.jsonl'));
  const runs = readJsonl(path.join(STATE, 'runs.jsonl'));
  const graded = gradeObjectives(objectives, runs);
  const count = (st) => graded.filter((g) => g.status === st).length;
  const matched = graded.filter((g) => g.status === 'met' && g.controls.length && g.beyond < g.controls.length).length;
  console.log('objectives in state/imagine/objectives.jsonl: ' + graded.length + '; logged runs: ' + runs.length + '; met ' + count('met') + ', mixed ' + count('mixed') + ', not met ' + count('not met') + ', untested ' + count('untested') + '; met, but the null arm matched it on the same metric in a run: ' + matched);
  for (const g of graded) console.log('  ' + g.status + ' | ' + g.template + ' | ' + g.hypothesis + ' | bar ' + g.bar.op + ' ' + g.bar.value + (g.values.length ? ' | measured ' + g.values.join(', ') + ' in ' + g.values.length + ' run' + (g.values.length === 1 ? '' : 's') : ' | suite not run yet: ' + g.suite + (g.template === 'transfer' ? ' --carry' : '')) + (g.controls.length ? ' | null arm on the same metric ' + g.controls.join(', ') + ' | beyond the null in ' + g.beyond + ' of ' + g.controls.length + ' run' + (g.controls.length === 1 ? '' : 's') : ''));
}

/** node bench/imagine.mjs --runs: every complete run in state/imagine/runs.jsonl, grouped by setting. */
function printRuns() {
  const file = path.join(STATE, 'runs.jsonl');
  const recs = readJsonl(file);
  console.log('runs in ' + path.relative(ROOT, file).split(path.sep).join('/') + ': ' + recs.length);
  for (const g of runsSummary(recs)) {
    const [split, budget, admit, admitFrac, imagineBudget, carry, doubt] = g.group.split('|');
    console.log('');
    console.log(split + ', ' + (String(budget).startsWith('work ') ? budget + ' work ms' : budget + ' ms') + ', admit ' + admit + ', admit fraction ' + admitFrac + ', imagination budget ' + imagineBudget + (carry === 'true' ? ', carried vocabulary' : '') + (doubt === 'true' ? ', doubt' : '') + ': ' + g.runs + ' runs');
    for (const r of g.records) console.log('  ' + r.at + ' seed ' + r.seed + (r.isTheBar ? ' (the bar)' : '') + (r.backfilled ? ' (backfilled from ' + r.backfilled + ')' : '') + ': invented ' + r.invented.solved + ' (' + r.invented.ids.join(', ') + '), null ' + r.null.solved + ' (' + r.null.ids.join(', ') + ')' + (r.libraryArm ? ', library ' + r.libraryArm.solved + ' (' + r.libraryArm.ids.join(', ') + ')' : ''));
    console.log('  pooled: invented ' + g.invented + ', null ' + g.null + ' over ' + g.runs + ' runs; invented ahead in ' + g.wins + ', tied ' + g.ties + ', behind ' + g.losses + '; sign test p ' + Math.round(g.p * 1e4) / 1e4);
    const fmt = (f) => Object.entries(f).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([id, n]) => id + ' ' + n).join(', ') || 'none';
    console.log('  tasks by runs solved, invented: ' + fmt(g.freq.invented));
    console.log('  tasks by runs solved, null: ' + fmt(g.freq.null));
    const q = g.pairing;
    console.log('  paired per run (a task one arm alone solved, once per run): invented only ' + q.invOnly + ', null only ' + q.nullOnly + '; sign test p ' + Math.round(q.pRuns * 1e4) / 1e4 + ' (runs share tasks, so this p is optimistic)');
    console.log('  paired per task (runs solved by invented minus by null, one vote per task): invented ahead ' + q.taskAhead + ', behind ' + q.taskBehind + '; sign test p ' + Math.round(q.pTasks * 1e4) / 1e4);
  }
}
