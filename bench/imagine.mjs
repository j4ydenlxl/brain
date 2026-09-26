// bench/imagine.mjs: THE IMAGINE BAR. Can the organism invent a primitive that solves a task
// its fixed vocabulary could not, and does it beat a null that only recombines what it has?
//
//   node bench/imagine.mjs --split training --budget-ms 3000 --workers 2
//        [--limit N] [--ids a,b] [--shape same|smaller|mult] [--admit K] [--mine-ms M]
//        [--imagine-budget N] [--no-knowledge] [--quiet]
//
// The tasks are the ones the fixed vocabulary TIMED OUT on in bench/verdicts/grid.json (236 on
// the training split when that verdict was written), so the fixed vocabulary solves 0 of them
// at this budget by construction. Three phases:
//
//   1. mine     every task is searched once with the fixed vocabulary for --mine-ms and the
//               partial programs with the best mapped pixel agreement are recorded (source ii)
//   2. invent   capability/grid-invent.mjs builds the invented library from (i) the solved
//               programs of grid.json collapsed into one step and generalised over siblings,
//               (ii) the mined partials generalised, and (iii) mind/imagine.mjs propose() over
//               the DSL, whose words are outside memory (hypervector distance above the floor
//               from every stored word, no exact title in the knowledge store when it is
//               present) and outside its own recombination null. The NULL library is as many
//               random compositions and pairwise recombinations of the same memory.
//   3. solve    each task runs twice, once per arm, interleaved on the workers, under ONE wall
//               clock of --budget-ms that covers everything: the arm's words are screened on
//               the task's train pairs and test inputs (never its test outputs), the top
//               --admit enter the search ahead of the base words, and the search runs to the
//               same deadline. A word is never offered to a task it was mined or collapsed
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
// Writes bench/verdicts/imagine.json with isTheBar true ONLY when every timeout of the
// training split ran; any narrower run writes imagine-partial.json with isTheBar false.
import { Worker } from 'node:worker_threads';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as G from '../capability/grid-invent.mjs';
import { propose, keep, objectiveSpace } from '../mind/imagine.mjs';
import { Gate } from '../core/gate.mjs';
import { Ledger } from '../core/ledger.mjs';

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object;
// the ARC split's own name moved to arcSplit beside it).
/** What the imagine bar developed on and what it graded: pure, from the ARC split and the grid verdict it read. */
export function splitFor(opts = {}) {
  const evaluation = opts.arcSplit === 'evaluation';
  return {
    development: { what: 'the ARC-AGI-1 training split: the fixed vocabulary and these combinators were written against it; the invented words come from the solved programs of ' + (opts.from || 'bench/verdicts/grid.json') + ' and the partials mined from the graded tasks themselves', arcSplit: 'training' },
    heldOut: evaluation
      ? { what: 'the ARC-AGI-1 evaluation split tasks the fixed vocabulary timed out on; nothing here was written against it', arcSplit: 'evaluation' }
      : { what: 'per task only: a word is never offered to the task it was mined or collapsed from, and the test outputs are never read before grading; the tasks themselves are training tasks', arcSplit: 'training' },
    contaminated: evaluation ? false : 'the graded tasks are training-split tasks the vocabulary and the combinators were written against; only the words mined from a task are held out from it',
  };
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(ROOT, 'bench', 'fixtures', 'public', 'arc-agi-1');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const STATE = path.join(ROOT, 'state', 'imagine');
const KNOWLEDGE = path.join(ROOT, 'bench', 'fixtures', 'wiki', 'store');
const MAX_WORKERS = 2; // eight builders share this machine

export function parseArgs(argv) {
  const a = { split: 'training', budgetMs: 3000, workers: 2, limit: null, ids: null, shape: null, admit: G.INVENT_DEFAULTS.admit, admitFrac: 0.4, mineMs: 1000, mineTop: G.INVENT_DEFAULTS.mineTop, imagineBudget: 1600, seed: 'imagine-bench', knowledge: true, carry: false, doubt: G.INVENT_DEFAULTS.doubt, quiet: false, graceMs: 4000 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    if (k === '--split') { a.split = v; i++; }
    else if (k === '--budget-ms') { a.budgetMs = Number(v); i++; }
    else if (k === '--workers') { a.workers = Number(v); i++; }
    else if (k === '--limit') { a.limit = Number(v); i++; }
    else if (k === '--ids') { a.ids = String(v).split(',').filter(Boolean); i++; }
    else if (k === '--shape') { a.shape = String(v); i++; }
    else if (k === '--admit') { a.admit = Number(v); i++; }
    else if (k === '--admit-frac') { a.admitFrac = Number(v); i++; }
    else if (k === '--mine-ms') { a.mineMs = Number(v); i++; }
    else if (k === '--imagine-budget') { a.imagineBudget = Number(v); i++; }
    else if (k === '--seed') { a.seed = String(v); i++; }
    else if (k === '--no-knowledge') a.knowledge = false;
    else if (k === '--quiet') a.quiet = true;
    else if (k === '--carry') a.carry = true;
    else if (k === '--doubt') a.doubt = true;
    else if (k === '--no-doubt') a.doubt = false;
    else throw new Error('bench/imagine.mjs: unknown argument ' + k);
  }
  if (a.split !== 'training' && a.split !== 'evaluation') throw new Error('bench/imagine.mjs: --split must be training or evaluation');
  if (!(a.budgetMs > 0) || !(a.workers >= 1) || !(a.admit >= 0) || !(a.mineMs >= 0) || !(a.imagineBudget >= 1) || !(a.admitFrac > 0 && a.admitFrac <= 1)) throw new Error('bench/imagine.mjs: bad budget, workers, admit, mine or imagine budget');
  a.workers = Math.min(a.workers, MAX_WORKERS);
  return a;
}

// ---------------------------------------------------------------- workers
const WORKER_SRC = [
  "const { parentPort, workerData } = require('node:worker_threads');",
  'let G = null;',
  'const LIB = workerData.libraries || {};',
  'import(workerData.inventUrl).then((m) => { G = m; parentPort.postMessage({ type: "ready" }); },',
  '  (e) => parentPort.postMessage({ type: "bootFailed", error: String(e && e.stack || e) }));',
  'parentPort.on("message", (msg) => {',
  '  const t0 = performance.now();',
  '  try {',
  '    if (msg.kind === "mine") {',
  '      const r = G.searchWith(G.arcTask(msg.task), [], { budgetMs: msg.mineMs, mine: msg.mineTop });',
  '      parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: r.status, mined: r.mined || [], baseline: r.baseline } });',
  '      return;',
  '    }',
  '    const lib = (LIB[msg.arm] || []).filter((w) => !w.sources.includes(msg.taskId));',
  '    const inVocab = new Set(msg.vocab || []);',
  '    const fixed = lib.filter((w) => inVocab.has(w.key)).slice(0, msg.admit);',
  '    const rest = lib.filter((w) => !inVocab.has(w.key));',
  '    const adm = G.admitFor(rest, G.arcTask(msg.task), msg.admit - fixed.length, t0 + msg.budgetMs * msg.admitFrac);',
  '    const words = fixed.concat(adm.admitted);',
  '    const extras = words.map((w) => G.asPrimitive(w)).filter(Boolean);',
  '    const r = G.solveWith(msg.task, extras, { deadline: t0 + msg.budgetMs, doubt: !!msg.doubt });',
  '    parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: r.status, solved: r.solved, names: r.names, depth: r.depth, used: r.used, searched: r.searched, states: r.states, searchMs: r.ms, doubted: r.doubted || 0, fromFallback: !!r.fromFallback, admitted: words.length, fromVocab: fixed.length, offered: lib.length, screened: adm.screened, admitMs: adm.ms, admitCut: adm.cut } });',
  '  } catch (e) {',
  '    parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: "error", solved: false, error: String(e && e.stack || e) } });',
  '  }',
  '});',
].join('\n');

function spawn(libraries) {
  return new Worker(WORKER_SRC, {
    eval: true,
    workerData: { inventUrl: pathToFileURL(path.join(ROOT, 'capability', 'grid-invent.mjs')).href, libraries },
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
    const t = setTimeout(() => finish({ killed: true, wallMs: hardMs, r: { status: 'timeout', solved: false, error: 'killed at the hard deadline' } }), hardMs);
    worker.on('message', onMsg);
    worker.on('error', onErr);
    worker.postMessage(msg);
  });
}
/** Run jobs on `workers` lanes; next() hands out the next message (or null), onDone takes each result. */
async function pool(workers, libraries, next, hardMs, onDone) {
  const lane = async () => {
    let w = spawn(libraries);
    let boot = await ready(w);
    if (boot.type !== 'ready') throw new Error('imagine worker did not boot: ' + boot.error);
    for (let msg = next(); msg; msg = next()) {
      const res = await runOne(w, msg, hardMs);
      onDone(msg, res);
      if (res.killed) {
        try { await w.terminate(); } catch { /* already gone */ }
        w = spawn(libraries);
        boot = await ready(w);
        if (boot.type !== 'ready') throw new Error('imagine worker did not reboot: ' + boot.error);
      }
    }
    await w.terminate();
  };
  await Promise.all(Array.from({ length: Math.max(1, workers) }, lane));
}

// ---------------------------------------------------------------- helpers
const BAR_OPTIONS = ['budgetMs', 'workers', 'admit', 'admitFrac', 'mineMs', 'mineTop', 'imagineBudget', 'seed', 'knowledge', 'carry', 'doubt'];
/** The options of a run that differ from the bar command's, as a short file name tag ('' for the bar). */
export function variantOf(cfg) {
  const d = parseArgs([]);
  return BAR_OPTIONS.filter((k) => cfg[k] !== d[k]).map((k) => k.toLowerCase() + '-' + String(cfg[k]).replace(/[^a-z0-9.]+/gi, '')).join('-');
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
    const g = [r.split, r.budgetMs, r.admit, r.admitFrac, r.imagineBudget, !!r.carry, !!r.doubt].join('|');
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
const VALUE_FLAGS_OFF = new Set(['--carry', '--quiet', '--no-knowledge', '--doubt', '--no-doubt']);
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
/** A run tests an objective's suite when it ran every flag of the suite, and nothing else but a seed, a carry or quiet. */
const EXTRA_OK = new Set(['--seed', '--carry', '--quiet']);
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
  const bar = 'node bench/imagine.mjs --split training --budget-ms ' + cfg.budgetMs + ' --workers 2';
  const nullArm = 'the null arm: random compositions and pairwise recombinations of the same memory, same library size, same admission, same budget';
  return [
    {
      name: 'lead', accepts: (f) => f.kind === 'arms',
      make: (f) => ({ hypothesis: 'imagined primitives solve more of the ' + f.n + ' fixed vocabulary timeouts than the recombination null does at ' + f.budgetMs + ' ms', plane: 'capability', ruler: { suite: bar, bar: { metric: 'solved with invented primitives minus solved by the null arm', op: '>', value: f.invented - f.null }, control: nullArm } }),
    },
    {
      name: 'budget', accepts: (f) => f.kind === 'arms',
      make: (f) => ({ hypothesis: 'at ' + 2 * f.budgetMs + ' ms the invented arm leads the null by more than the ' + (f.invented - f.null) + ' it leads by at ' + f.budgetMs + ' ms', plane: 'capability', ruler: { suite: bar.replace('--budget-ms ' + f.budgetMs, '--budget-ms ' + 2 * f.budgetMs), bar: { metric: 'solved with invented primitives minus solved by the null arm', op: '>', value: f.invented - f.null }, control: nullArm + ', at the doubled budget' } }),
    },
    {
      name: 'transfer', accepts: (f) => f.kind === 'kept',
      make: (f) => ({ hypothesis: 'the kept word ' + f.key + ' solves a held out evaluation task the fixed vocabulary timed out on', plane: 'capability', ruler: { suite: 'node bench/imagine.mjs --split evaluation --budget-ms ' + cfg.budgetMs + ' --workers 2', bar: { metric: 'evaluation timeouts solved by a program that uses ' + f.key, op: '>=', value: 1 }, control: nullArm + ', on the evaluation timeouts' } }),
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

// ---------------------------------------------------------------- the bench
export async function runImagineBench(cfg) {
  const t0 = performance.now();
  let peakRss = process.memoryUsage().rss;
  const sampler = setInterval(() => { const r = process.memoryUsage().rss; if (r > peakRss) peakRss = r; }, 250);
  sampler.unref();
  const say = (s) => { if (!cfg.quiet) console.log(s); };

  const srcName = cfg.split === 'training' ? 'grid.json' : 'grid-evaluation.json';
  const gv = JSON.parse(readFileSync(path.join(VERDICTS, srcName), 'utf8'));
  const timeouts = gv.rows.filter((r) => r.status === 'timeout').map((r) => r.id);
  const solvedRows = gv.rows.filter((r) => r.solved && Array.isArray(r.names));
  let list = timeouts.slice();
  if (cfg.ids) list = list.filter((id) => cfg.ids.includes(id));
  const shapes = new Map(list.map((id) => [id, shapeOf(loadTask(cfg.split, id))]));
  if (cfg.shape) list = list.filter((id) => shapes.get(id) === cfg.shape);
  if (cfg.limit) list = list.slice(0, cfg.limit);
  const fullList = !cfg.ids && !cfg.limit && !cfg.shape && list.length === timeouts.length && gv.isTheBar === true;
  const complete = cfg.split === 'training' && fullList;
  // a complete run that changed any option of the bar command is a VARIANT: its own verdict name, isTheBar false
  const variant = variantOf(cfg);
  const isBar = complete && !variant;
  const hardMs = cfg.budgetMs + cfg.graceMs;
  say('imagine bar: ' + list.length + ' of the ' + timeouts.length + ' tasks the fixed vocabulary timed out on in bench/verdicts/' + srcName + ' (' + cfg.split + '), budget ' + cfg.budgetMs + ' ms per task per arm, ' + cfg.workers + ' workers, admit ' + cfg.admit);

  // 1. mine the timeouts (source ii)
  const tm = performance.now();
  const minedRows = [];
  if (cfg.mineMs > 0 && list.length) {
    let i = 0;
    await pool(Math.min(cfg.workers, list.length), {}, () => (i < list.length ? { kind: 'mine', id: 'mine:' + list[i], taskId: list[i], task: loadTask(cfg.split, list[i++]), mineMs: cfg.mineMs, mineTop: cfg.mineTop } : null), cfg.mineMs + cfg.graceMs, (msg, res) => {
      minedRows.push({ id: msg.taskId, mined: (res.r && res.r.mined) || [], status: res.r && res.r.status });
    });
  }
  const mineMs = performance.now() - tm;
  const foundWhileMining = minedRows.filter((r) => r.status === 'found').length;

  // 2. the libraries
  const ti = performance.now();
  const collapsed = G.collapseSolved(solvedRows);
  const fromTimeouts = G.fromTimeouts(minedRows);
  const solvedChains = solvedRows.map((r) => ({ spec: G.chainSpec(G.unlearned(r.names)) })).filter((m) => m.spec && m.spec.k === 'chain');
  const memory = G.vocabularyMemory().concat(solvedChains, collapsed, fromTimeouts);
  let knowledge = null, knowledgeNote = 'absent';
  if (cfg.knowledge && existsSync(path.join(KNOWLEDGE, 'meta.json'))) {
    try { const K = await import('../memory/knowledge.mjs'); knowledge = K.openKnowledge(KNOWLEDGE); knowledgeNote = knowledge ? 'bench/fixtures/wiki/store, ' + knowledge.A + ' articles' : 'failed to open'; } catch (e) { knowledgeNote = 'failed to open: ' + (e && e.message); }
  } else if (!cfg.knowledge) knowledgeNote = 'off (--no-knowledge)';
  const imagined = G.imagineWords({ memory, budget: cfg.imagineBudget, seed: cfg.seed, knowledge });
  if (knowledge) { try { knowledge.close(); } catch { /* closed */ } knowledge = null; }
  const invented = new Map();
  for (const w of [...collapsed, ...fromTimeouts, ...imagined.words]) {
    const had = invented.get(w.key);
    if (had) had.sources = [...new Set([...had.sources, ...w.sources])].sort();
    else invented.set(w.key, { key: w.key, spec: w.spec, source: w.source, sources: w.sources.slice(), operator: w.operator ?? null, novelty: w.novelty ?? null, round: w.round ?? null });
  }
  const invLib = [...invented.values()];
  const nullLib = G.nullLibrary(invLib.length, memory, cfg.seed + ':null').map((w) => ({ key: w.key, spec: w.spec, source: w.source, sources: [], operator: null, novelty: null }));
  const bySource = {};
  for (const w of invLib) bySource[w.source] = (bySource[w.source] || 0) + 1;
  const inventMs = performance.now() - ti;
  say('invented ' + invLib.length + ' primitives: ' + Object.entries(bySource).map(([k, v]) => k + ' ' + v).join(', ') + '; null library ' + nullLib.length + '; imagination rejected ' + JSON.stringify(imagined.report.rejected) + ', knowledge ' + knowledgeNote);

  // 3. solve, arms interleaved
  const gate = new Gate({ ledger: new Ledger({ ring: 4096 }) });
  const vocab = new G.InventedVocabulary({ gate });
  const nullVocab = new Map();
  // --carry: the words each arm kept in earlier bar runs (state/imagine/vocabulary.json) enter this
  // run's vocabulary first. The invented arm's pass the gate again on their earlier held out
  // solves; the null arm's are carried by the same rule. They are counted apart from this run's.
  const carried = { from: null, at: null, invented: [], null: [] };
  const carriedInv = [], carriedNull = [];
  if (cfg.carry) {
    const vf = path.join(STATE, 'vocabulary.json');
    let prior = null;
    try { prior = existsSync(vf) ? JSON.parse(readFileSync(vf, 'utf8')) : null; } catch { prior = null; }
    if (prior) {
      carried.from = path.relative(ROOT, vf).split(path.sep).join('/');
      carried.at = prior.at || null;
      const invKeys = new Set(invLib.map((w) => w.key)), nullKeys = new Set(nullLib.map((w) => w.key));
      for (const e of prior.entries || []) {
        if (!e || !e.spec || !G.isGridWord(e.spec)) continue;
        const w = { key: e.key, spec: e.spec, source: 'carried', sources: [], operator: e.operator ?? null, novelty: e.novelty ?? null };
        const p = vocab.submit(w, { solved: e.solved || [], novelty: e.novelty });
        if (p.status !== 'approved') continue;
        carried.invented.push(e.key);
        if (!invKeys.has(e.key)) carriedInv.push(w);
      }
      for (const e of prior.nullArm || []) {
        if (!e || !e.spec || !G.isGridWord(e.spec)) continue;
        nullVocab.set(e.key, { key: e.key, spec: e.spec, source: 'carried', solved: [] });
        carried.null.push(e.key);
        if (!nullKeys.has(e.key)) carriedNull.push({ key: e.key, spec: e.spec, source: 'carried', sources: [], operator: null, novelty: null });
      }
    }
    say('carried from ' + (carried.from || 'nothing (no state/imagine/vocabulary.json)') + ': invented arm ' + carried.invented.length + ' words, null arm ' + carried.null.length);
  }
  const libraries = { invented: invLib.concat(carriedInv), null: nullLib.concat(carriedNull) };
  const byKey = { invented: new Map(libraries.invented.map((w) => [w.key, w])), null: new Map(libraries.null.map((w) => [w.key, w])) };
  const jobs = [];
  list.forEach((id, i) => { const arms = i % 2 === 0 ? ['invented', 'null'] : ['null', 'invented']; for (const arm of arms) jobs.push({ id, arm }); });
  const rows = new Map(list.map((id) => [id, { id, shape: shapes.get(id) }]));
  const submissions = [];
  let j = 0, finished = 0;
  const usedAdded = (a) => !!(a && a.solved && Array.isArray(a.used) && a.used.length);
  const ts = performance.now();
  if (jobs.length) await pool(Math.min(cfg.workers, jobs.length), libraries, () => {
    if (j >= jobs.length) return null;
    const job = jobs[j++];
    const inVocab = job.arm === 'invented' ? vocab.list().map((e) => e.key) : [...nullVocab.keys()];
    return { kind: 'solve', id: job.arm + ':' + job.id, arm: job.arm, taskId: job.id, task: loadTask(cfg.split, job.id), vocab: inVocab, admit: cfg.admit, admitFrac: cfg.admitFrac, budgetMs: cfg.budgetMs, doubt: cfg.doubt };
  }, hardMs, (msg, res) => {
    const r = { killed: res.killed, wallMs: r2(res.wallMs), ...res.r };
    rows.get(msg.taskId)[msg.arm] = r;
    finished++;
    if (usedAdded(r)) {
      for (const key of new Set(r.used)) {
        const w = byKey[msg.arm].get(key);
        if (!w || w.sources.includes(msg.taskId)) continue;
        if (msg.arm === 'invented') {
          const [scored] = G.noveltyAgainst([{ ...w }], solvedRows);
          const p = vocab.submit(w, { solved: [msg.taskId], novelty: scored.novelty0 });
          submissions.push({ key, task: msg.taskId, status: p.status, novelty0: scored.novelty0, noveltyHeld: scored.noveltyHeld, proposal: p.id });
        } else {
          const had = nullVocab.get(key);
          nullVocab.set(key, { key, spec: w.spec, source: w.source, solved: [...new Set([...(had ? had.solved : []), msg.taskId])].sort() });
        }
      }
    }
    if (!cfg.quiet && finished % 50 === 0) {
      const all = [...rows.values()];
      say('  ' + finished + ' of ' + jobs.length + ' runs, invented arm ' + all.filter((x) => usedAdded(x.invented)).length + ', null arm ' + all.filter((x) => usedAdded(x.null)).length);
    }
  });
  const solveMs = performance.now() - ts;

  // 4. tally
  const all = [...rows.values()];
  const arm = (name) => {
    const rs = all.map((x) => x[name]).filter(Boolean);
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
      meanAdmitMs: rs.length ? r2(rs.reduce((s, a) => s + (a.admitMs || 0), 0) / rs.length) : null,
      meanAdmitted: rs.length ? r2(rs.reduce((s, a) => s + (a.admitted || 0), 0) / rs.length) : null,
      admitCut: rs.filter((a) => a.admitCut).length,
      doubted: rs.filter((a) => a.doubted > 0).length,
      fromFallback: rs.filter((a) => a.fromFallback).length,
      solvedIds: all.filter((x) => usedAdded(x[name])).map((x) => x.id),
    };
  };
  const inv = arm('invented'), nul = arm('null');
  const carriedSet = new Set(carried.invented), carriedNullSet = new Set(carried.null);
  const kept = vocab.list().filter((e) => !carriedSet.has(e.key));
  const nullSolvedWords = [...nullVocab.values()].filter((e) => e.solved.length && !carriedNullSet.has(e.key));
  const transferOf = (name, keys) => {
    const ks = new Set(keys);
    const hit = all.filter((x) => usedAdded(x[name]) && x[name].used.some((k) => ks.has(k)));
    const byWord = {};
    for (const x of hit) for (const k of new Set(x[name].used)) if (ks.has(k)) (byWord[k] || (byWord[k] = [])).push(x.id);
    return { words: keys.length, solvedIds: hit.map((x) => x.id), wordsThatSolved: Object.keys(byWord).sort(), byWord };
  };
  const transfer = cfg.carry ? { from: carried.from, at: carried.at, invented: transferOf('invented', carried.invented), null: transferOf('null', carried.null) } : null;
  const meanNovelty = kept.length ? r4(kept.reduce((s, e) => s + e.novelty, 0) / kept.length) : null;

  // per operator and per shape facts, for the objectives
  const opFacts = {};
  for (const w of invLib) if (w.operator) (opFacts[w.operator] || (opFacts[w.operator] = { kind: 'operator', name: w.operator, words: 0, solved: 0 })).words++;
  for (const x of all) if (usedAdded(x.invented)) for (const key of new Set(x.invented.used)) { const w = byKey.invented.get(key); if (w && w.operator && opFacts[w.operator]) opFacts[w.operator].solved++; }
  const shapeFacts = {};
  for (const x of all) { const f = shapeFacts[x.shape] || (shapeFacts[x.shape] = { kind: 'shape', name: x.shape, n: 0, invented: 0, null: 0 }); f.n++; if (usedAdded(x.invented)) f.invented++; if (usedAdded(x.null)) f.null++; }
  // per imagination round: the words the round put in the library, and the tasks a word of that round helped solve
  const roundFacts = {};
  for (const w of invLib) if (w.source === 'imagine' && w.round) (roundFacts[w.round] || (roundFacts[w.round] = { round: w.round, words: 0, tasks: [] })).words++;
  for (const x of all) {
    if (!usedAdded(x.invented)) continue;
    const rs = new Set(x.invented.used.map((k) => byKey.invented.get(k)).filter((w) => w && w.source === 'imagine' && w.round).map((w) => w.round));
    for (const r of rs) if (roundFacts[r]) roundFacts[r].tasks.push(x.id);
  }
  const noRound = invLib.filter((w) => w.source === 'imagine' && !w.round).length; // said aloud, never a silent none
  // paired by task: the tasks exactly one arm solved, which is where the arms differ
  const paired = pairedOf(inv.solvedIds, nul.solvedIds);

  // 5. objectives (vision). A narrower run keeps its state apart, so a probe never becomes the bar's memory.
  const stateDir = isBar ? STATE : path.join(STATE, 'partial');
  const stateRel = path.relative(ROOT, stateDir).split(path.sep).join('/');
  mkdirSync(stateDir, { recursive: true });
  const objFile = path.join(stateDir, 'objectives.jsonl');
  const priorObjectives = readJsonl(objFile).filter((o) => o && o.hypothesis && o.ruler);
  const facts = {
    templates: objectiveTemplates(cfg),
    items: [{ kind: 'arms', n: list.length, invented: inv.solvedWithAdded, null: nul.solvedWithAdded, budgetMs: cfg.budgetMs }, { kind: 'screen', admit: cfg.admit, invented: inv.solvedWithAdded, null: nul.solvedWithAdded }, ...kept.map((e) => ({ kind: 'kept', key: e.key })), ...Object.values(opFacts), ...Object.values(shapeFacts)],
    memory: priorObjectives,
  };
  const objReport = propose({ space: objectiveSpace(facts), memory: priorObjectives, seed: cfg.seed + ':objectives', floor: 0.02 }, 24);
  const objWritten = [];
  for (const c of objReport.candidates) {
    const p = keep(c, {}, { gate, by: 'bench/imagine.mjs' });
    if (p.status !== 'approved') continue;
    const line = { at: new Date().toISOString(), key: c.key, hypothesis: c.hypothesis, plane: c.plane, ruler: c.ruler, template: c.template, novelty: c.novelty, proposal: p.id, from: 'bench/imagine.mjs' };
    appendFileSync(objFile, JSON.stringify(line) + '\n');
    objWritten.push(line);
  }

  // 6. patches for the autopilot, held until verified
  const patchFile = path.join(stateDir, 'patches.jsonl');
  const patches = [];
  for (const e of kept) {
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
  const runAt = new Date().toISOString();
  writeFileSync(vocabFile, JSON.stringify({ at: runAt, from: 'bench/imagine.mjs', budgetMs: cfg.budgetMs, note: 'merged across runs: a word stays kept once it passed the gate', entries: mergeWords(priorVocab && priorVocab.entries, kept, runAt), nullArm: mergeWords(priorVocab && priorVocab.nullArm, nullSolvedWords, runAt) }, null, 1) + '\n');
  // the transfer objectives earlier runs wrote, checked when this run carried their words
  const transferObjectives = [];
  if (transfer && cfg.split === 'evaluation') {
    for (const o of readJsonl(path.join(STATE, 'objectives.jsonl'))) {
      if (!o || o.template !== 'transfer' || typeof o.hypothesis !== 'string') continue;
      const m = /^the kept word (\S+) solves/.exec(o.hypothesis);
      if (!m) continue;
      transferObjectives.push({ key: o.key, word: m[1], carried: carriedSet.has(m[1]), met: transfer.invented.wordsThatSolved.includes(m[1]) });
    }
  }

  const wallMs = performance.now() - t0;
  clearInterval(sampler);
  peakRss = Math.max(peakRss, process.memoryUsage().rss);
  const peakRssMb = Math.round(peakRss / (1024 * 1024));
  const sources = Object.entries(bySource).map(([k, v]) => k + ' ' + v).join(', ');

  // the summary is kept in the verdict as printed, so a lost or shared stdout never loses it
  const printed = [];
  const out = (line) => { printed.push(line); console.log(line); };
  console.log('');
  out('tasks ' + list.length + ' (the fixed vocabulary timed out on every one at ' + gv.budgetMs + ' ms in bench/verdicts/' + srcName + ')');
  out('solved with invented primitives at the same budget: ' + inv.solvedWithAdded + ' of ' + list.length + (inv.solvedIds.length ? ' (' + inv.solvedIds.join(', ') + ')' : ''));
  out('solved by the null arm (random compositions and recombinations at the same budget): ' + nul.solvedWithAdded + ' of ' + list.length + (nul.solvedIds.length ? ' (' + nul.solvedIds.join(', ') + ')' : ''));
  out('solved by the fixed vocabulary: 0 of ' + list.length + ' (by construction: these are its timeouts)');
  out('solved without an added word under the same clock: invented arm ' + inv.solvedBaseOnly + ', null arm ' + nul.solvedBaseOnly + '; found but wrong: invented ' + inv.foundButWrong + ', null ' + nul.foundButWrong);
  if (cfg.doubt) out('doubt (a top cost learner that predicts no train pair from the others is kept as a fallback): tasks that doubted a program, invented arm ' + inv.doubted + ', null arm ' + nul.doubted + '; answered from the fallback, invented arm ' + inv.fromFallback + ', null arm ' + nul.fromFallback);
  out('paired by task: invented only ' + paired.invented.length + (paired.invented.length ? ' (' + paired.invented.join(', ') + ')' : '') + ', null only ' + paired.null.length + (paired.null.length ? ' (' + paired.null.join(', ') + ')' : '') + ', both ' + paired.both + '; two sided sign test on the tasks one arm alone solved: p ' + r4(paired.p));
  out('primitives invented: ' + invLib.length + ' (' + sources + '); null library ' + nullLib.length);
  out('imagination by round (words in the library, then the tasks a word of that round helped solve): ' + (Object.values(roundFacts).map((f) => 'round ' + f.round + ' ' + f.words + ' words, ' + f.tasks.length + ' tasks' + (f.tasks.length ? ' (' + f.tasks.join(', ') + ')' : '')).join('; ') || 'none') + (noRound ? '; round unknown for ' + noRound + ' imagined words' : ''));
  out('by operator (words in the library / solves by a word of it): ' + Object.values(opFacts).map((f) => f.name + ' ' + f.words + '/' + f.solved).join(', '));
  out('primitives kept: ' + kept.length + ' through the gate (' + submissions.length + ' submitted, ' + vocab.refused + ' refused); null arm words that solved: ' + nullSolvedWords.length);
  if (transfer) out('carried from ' + (transfer.from || 'nothing') + ' (written ' + transfer.at + '): invented arm ' + transfer.invented.words + ' words solved ' + transfer.invented.solvedIds.length + ' tasks' + (transfer.invented.solvedIds.length ? ' (' + transfer.invented.solvedIds.join(', ') + ')' : '') + ', null arm ' + transfer.null.words + ' words solved ' + transfer.null.solvedIds.length + (transfer.null.solvedIds.length ? ' (' + transfer.null.solvedIds.join(', ') + ')' : ''));
  if (transferObjectives.length) out('transfer objectives in state/imagine/objectives.jsonl: ' + transferObjectives.length + ', their word carried ' + transferObjectives.filter((o) => o.carried).length + ', met ' + transferObjectives.filter((o) => o.met).length + (transferObjectives.some((o) => o.met) ? ' (' + transferObjectives.filter((o) => o.met).map((o) => o.word).join(', ') + ')' : ''));
  out('mean novelty distance of kept primitives: ' + (meanNovelty === null ? 'none kept' : meanNovelty) + ' (hypervector distance from the nearest word of the base vocabulary)');
  out('objectives proposed: ' + objReport.candidates.length + ', written to ' + stateRel + '/objectives.jsonl: ' + objWritten.length + ' (' + priorObjectives.length + ' were already there); patches proposed and held: ' + patches.length);
  out('ms per task: invented arm ' + inv.meanMs + ' (admission ' + inv.meanAdmitMs + ' ms, ' + inv.meanAdmitted + ' words admitted), null arm ' + nul.meanMs + ' (admission ' + nul.meanAdmitMs + ' ms, ' + nul.meanAdmitted + ' admitted); killed at the hard deadline ' + (inv.killed + nul.killed) + ', errors ' + (inv.errors + nul.errors));
  out('phases: mine ' + r2(mineMs / 1000) + ' s (' + foundWhileMining + ' found a program while mining), invent ' + r2(inventMs / 1000) + ' s, solve ' + r2(solveMs / 1000) + ' s; wall ' + r2(wallMs / 1000) + ' s; peak rss ' + peakRssMb + ' MB');

  // a shape suite names its own file, so the next suite does not overwrite it
  const name = 'imagine' + (cfg.split === 'training' ? '' : '-' + cfg.split) + (variant ? '-' + variant : '') + (cfg.shape ? '-shape-' + String(cfg.shape).replace(/[^a-z0-9]+/gi, '-') : '') + (fullList ? '' : '-partial');
  const command = ('node ' + process.execArgv.join(' ') + ' bench/imagine.mjs ' + process.argv.slice(2).join(' ')).replace(/\s+/g, ' ').trim();
  const verdictAt = new Date().toISOString();
  // the run's record for state/imagine/runs.jsonl: every complete run, and every run of one whole shape class
  const record = fullList || (cfg.shape && !cfg.ids && !cfg.limit) ? { at: verdictAt, startedAt: new Date(Date.parse(verdictAt) - Math.round(wallMs)).toISOString(), command, split: cfg.split, isTheBar: isBar, variant: variant || null, seed: cfg.seed, budgetMs: cfg.budgetMs, admit: cfg.admit, admitFrac: cfg.admitFrac, imagineBudget: cfg.imagineBudget, carry: !!cfg.carry, doubt: !!cfg.doubt, n: list.length, invented: { solved: inv.solvedWithAdded, ids: inv.solvedIds }, null: { solved: nul.solvedWithAdded, ids: nul.solvedIds }, kept: kept.map((e) => e.key), transfer: transfer ? { invented: transfer.invented.solvedIds, null: transfer.null.solvedIds, byWord: transfer.invented.byWord } : null, shape: cfg.shape || null, partial: !fullList, operators: Object.fromEntries(Object.values(opFacts).map((f) => [f.name, { words: f.words, solved: f.solved }])), shapes: Object.fromEntries(Object.values(shapeFacts).map((f) => [f.name, { n: f.n, invented: f.invented, null: f.null }])), rounds: roundFacts, paired, verdict: 'bench/verdicts/' + name + '.json', printed } : null;
  // vision closes its loop: every objective the runs wrote, graded against the runs that tested its
  // suite after it was written, this run included
  const graded = gradeObjectives(readJsonl(path.join(STATE, 'objectives.jsonl')), readJsonl(path.join(STATE, 'runs.jsonl')).concat(record ? [record] : []));
  const gcount = (st) => graded.filter((g) => g.status === st).length;
  out('objectives graded by the runs that tested them after they were written: ' + graded.length + ' in state/imagine/objectives.jsonl, met ' + gcount('met') + ', mixed ' + gcount('mixed') + ', not met ' + gcount('not met') + ', untested ' + gcount('untested'));
  const verdict = {
    at: verdictAt,
    command,
    node: process.version,
    isTheBar: isBar,
    variant: variant || null,
    split: splitFor({ arcSplit: cfg.split, from: 'bench/verdicts/' + srcName }),
    arcSplit: cfg.split,
    from: 'bench/verdicts/' + srcName,
    n: list.length, of: timeouts.length,
    budgetMs: cfg.budgetMs, workers: cfg.workers, admit: cfg.admit, admitFrac: cfg.admitFrac, mineMs: cfg.mineMs, imagineBudget: cfg.imagineBudget, seed: cfg.seed, doubt: cfg.doubt,
    solvedWithInvented: inv.solvedWithAdded, solvedByNull: nul.solvedWithAdded, solvedByFixed: 0,
    invented: inv, null: nul,
    primitivesInvented: invLib.length, bySource, nullLibrary: nullLib.length,
    imagination: imagined.report, knowledge: knowledgeNote,
    primitivesKept: kept.length, meanNoveltyKept: meanNovelty, kept, submissions,
    objectivesProposed: objReport.candidates.length, objectivesWritten: objWritten.length, objectives: objWritten, objectiveRejections: objReport.rejected,
    patchesHeld: patches.length,
    shapes: shapeFacts, operators: opFacts, rounds: roundFacts, paired,
    foundWhileMining,
    phasesSeconds: { mine: r2(mineMs / 1000), invent: r2(inventMs / 1000), solve: r2(solveMs / 1000), wall: r2(wallMs / 1000) },
    peakRssMb,
    carried: transfer, transferObjectives,
    objectivesGraded: graded.map((g) => ({ template: g.template, hypothesis: g.hypothesis, bar: g.bar, status: g.status, values: g.values })),
    printed,
    statement: 'On the ' + list.length + ' ARC-AGI-1 ' + cfg.split + ' tasks the fixed vocabulary timed out on (bench/verdicts/' + srcName + ', so it solves 0 of them by construction), the invented arm solved ' + inv.solvedWithAdded + ' with a program that uses an invented primitive and the null arm solved ' + nul.solvedWithAdded + ', where the null arm is as many random compositions and pairwise recombinations of the same memory under the same screen, the same admission of ' + cfg.admit + ' words and the same ' + cfg.budgetMs + ' ms clock per task covering admission and search. '
      + 'The invented library held ' + invLib.length + ' words (' + sources + '), a word was never offered to a task it came from, and ' + kept.length + ' words passed the authority gate with a held out solve' + (meanNovelty === null ? '' : ', mean novelty distance ' + meanNovelty + ' from the base vocabulary') + '. '
      + (transfer ? 'It carried ' + transfer.invented.words + ' kept words into the invented arm and ' + transfer.null.words + ' into the null arm, which solved ' + transfer.invented.solvedIds.length + ' and ' + transfer.null.solvedIds.length + ' tasks with them. ' : '')
      + 'The run proposed ' + objReport.candidates.length + ' objectives of its own, each with a suite, a bar and a control, and wrote ' + objWritten.length + ' to ' + stateRel + '/objectives.jsonl. Mean ' + inv.meanMs + ' ms per task in the invented arm and ' + nul.meanMs + ' in the null arm. ' + (cfg.split === 'training' ? 'This is the TRAINING split, which the fixed vocabulary and these combinators were written against.' : 'This is the EVALUATION split: nothing here was written against it.'),
    rows: all,
  };
  mkdirSync(VERDICTS, { recursive: true });
  const file = path.join(VERDICTS, name + '.json');
  writeFileSync(file, JSON.stringify(verdict, null, 1) + '\n');
  if (record) {
    mkdirSync(STATE, { recursive: true });
    appendFileSync(path.join(STATE, 'runs.jsonl'), JSON.stringify(record) + '\n');
  }
  console.log('wrote ' + path.relative(ROOT, file).replace(/\\/g, '/') + (isBar ? ' (isTheBar true)' : complete ? ' (a variant of the bar, isTheBar false)' : fullList ? ' (every ' + cfg.split + ' timeout, isTheBar false)' : ' (partial, isTheBar false)'));
  return verdict;
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
    const [split, budgetMs, admit, admitFrac, imagineBudget, carry, doubt] = g.group.split('|');
    console.log('');
    console.log(split + ', ' + budgetMs + ' ms, admit ' + admit + ', admit fraction ' + admitFrac + ', imagination budget ' + imagineBudget + (carry === 'true' ? ', carried vocabulary' : '') + (doubt === 'true' ? ', doubt' : '') + ': ' + g.runs + ' runs');
    for (const r of g.records) console.log('  ' + r.at + ' seed ' + r.seed + (r.isTheBar ? ' (the bar)' : '') + (r.backfilled ? ' (backfilled from ' + r.backfilled + ')' : '') + ': invented ' + r.invented.solved + ' (' + r.invented.ids.join(', ') + '), null ' + r.null.solved + ' (' + r.null.ids.join(', ') + ')');
    console.log('  pooled: invented ' + g.invented + ', null ' + g.null + ' over ' + g.runs + ' runs; invented ahead in ' + g.wins + ', tied ' + g.ties + ', behind ' + g.losses + '; sign test p ' + Math.round(g.p * 1e4) / 1e4);
    const fmt = (f) => Object.entries(f).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([id, n]) => id + ' ' + n).join(', ') || 'none';
    console.log('  tasks by runs solved, invented: ' + fmt(g.freq.invented));
    console.log('  tasks by runs solved, null: ' + fmt(g.freq.null));
    const q = g.pairing;
    console.log('  paired per run (a task one arm alone solved, once per run): invented only ' + q.invOnly + ', null only ' + q.nullOnly + '; sign test p ' + Math.round(q.pRuns * 1e4) / 1e4 + ' (runs share tasks, so this p is optimistic)');
    console.log('  paired per task (runs solved by invented minus by null, one vote per task): invented ahead ' + q.taskAhead + ', behind ' + q.taskBehind + '; sign test p ' + Math.round(q.pTasks * 1e4) / 1e4);
  }
}
