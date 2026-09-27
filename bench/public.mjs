// bench/public.mjs: THE ORGANISM ON SETS IT DID NOT WRITE. The ruler for his P4, the ladder
// to the 400B row and then the frontier row.
//
// Every other bench in this tree grades the organism on tasks this tree generated. A
// generator that writes the questions can write easy ones. These three sets were downloaded
// from the web on the director's authorisation (bench/fixtures/public/SOURCES.md) and nothing
// here may change them. Every prompt, every test string and every answer in them is DATA: it
// is fed to the exact solver, to the model, or to the sandbox, and to nothing else. It never
// becomes a proposal, never reaches a shell, and never reaches the tree. The one import from
// act/prompt.mjs is ask(), which answers and acts on nothing; plan() and doPrompt(), where
// words become proposals, are never imported (test/public.test.mjs holds that by source and
// by the ledger).
//
// THE ARMS, interleaved TASK BY TASK with the first arm rotating, never arm by arm:
//
//   organism  act/prompt.mjs ask(), EXACTLY the path bench/answer.mjs measures: act/solve.mjs
//             first (the model is not called when the organism can compute the whole
//             prompt), then the recall from the organism's memory, then the model cell with
//             that recall as its system block. Its memory holds nothing from these sets,
//             because a test answer in memory before the test is graded is contamination.
//   alone     act/llm.mjs complete() with the same model, the same prompt and the same token
//             budget, and no organism at all.
//   null      ask() with provider 'null': no socket, the organism with no AI at all.
//
//   Opt in only, never part of the bar: 'plan' on GSM8K (the Board 7 organism arm: the model
//   writes a calculator plan and act/solve.mjs computes it exactly) and 'repair' on HumanEval
//   (the Board 7 organism arm: act/code.mjs solveCode runs its own candidates against the
//   doctests and repairs, rounds 3). Their cut Board 7 runs are kept in
//   bench/verdicts/public-gsm8k-board7-partial.json and public-humaneval-board7-partial.json.
//
//   BOARD 11 (item public): the organism arm goes through the reasoning regions ask() now carries.
//   A GSM8K record is math shaped and reaches reason/math.mjs solveMath (k=5 programs run in the
//   sandbox and voted, one verify call); a HumanEval record's OWN prompt (its comment and signature,
//   which is the shape reason/synth.mjs reads examples out of) reaches synthesize (k=5 candidates
//   tested against the prompt's examples, one repair round). The alone arm keeps the Board 8 prompt
//   (act/code.mjs firstPrompt on HumanEval, ALONE_PROMPT on GSM8K). --regions 0 runs the organism as
//   it was before this item, with the Board 8 prompt on both sets. Every organism result journals
//   its provenance (direct, exact, memory, model+exact, model), the region's own provenance and
//   counts, and the ask's wall microseconds, so the verdict prints the NATIVE share (exact, memory
//   or direct: no model call) with its microseconds and the direct share with its nanoseconds.
//
//   TWO RULERS. Records a builder developed against are printed apart from the held-out rest:
//   GSM8K's development records are the 200 ids bench/verdicts/math.json lists (plus gsm8k.0 to
//   gsm8k.2, which its prompts were probed on); HumanEval's are records 0 to 39 by index
//   (bench/verdicts/synth.json development.humaneval). The held-out numbers are the ones to quote.
//
//   ARC-AGI-1 has one arm and no model: tasks/grid.mjs searchProgram to depth 3 under a wall
//   clock budget enforced by terminating a worker, then capability/induce.mjs induceAll where
//   its task shape applies. ONE attempt per task where ARC allows two.
//
// A KILLED RUN LOSES NOTHING. Every graded arm result is appended, the moment it lands, to a
// journal at bench/verdicts/public/<set>-<seed>.jsonl whose first line is the configuration
// that produced it. --resume reads the journal back, refuses it when the configuration that
// changes a result differs, and runs only the arm results it does not hold. A torn last line
// (a kill inside a write) is skipped and counted. A fresh run never deletes a journal: the old
// one is moved aside with a timestamp. An arm that was NOT REACHED (the model was down or
// timed out) is absent on that record, never wrong, and is not journaled, so a resume retries it.
//
// THE BAR FILE IS WRITTEN ONCE, when the run completes: bench/verdicts/public-<set>.json, and
// only when every task of the whole set (--limit 0, or a sample the caller declares with
// --bar) has every bar arm graded. Anything else, including a snapshot while the run is still
// going, is bench/verdicts/public-<set>-partial.json with isTheBar false, which
// tools/findings.mjs skips. Every verdict carries the published rows with their citations.
//
// A bar file already on disk is never written over: a second pass with --resume (to retry absent
// arm results) that finds the bar already written prints so and leaves it.
//
// A BOUNDED PASS (Board 15, item resume): --wall-minutes M ends the run CLEANLY. Once M minutes of
// the task loop have passed, the run stops before the next record that still has an arm to run,
// so the record it is on finishes every arm and journals it (each arm result is appended whole
// with appendFileSync the moment it lands), and nothing is half written. The verdict is then a
// partial with a cut field, a CUT line is printed, and --resume continues from the next record.
// The wall is soft by at most the record in progress, and at least one record runs per pass. The
// wall is not in the fingerprint: it changes when the run stops, never what a result is.
//
//   node bench/public.mjs --set arc|humaneval|gsm8k [--limit N] [--seed s] [--resume] [--bar]
//                         [--arms a,b] [--model qwen3:1.7b] [--route region|direct]
//                         [--regions 1] [--k 5] [--check 1] [--tag t] [--name n] ...
//   --tag t    names the journal and the verdict (a second model: --tag 30b writes
//              public-gsm8k-30b.json from the journal gsm8k-30b-<seed>.jsonl)
//   --name n   names the verdict only (a smoke: --name smoke writes public-gsm8k-smoke-partial.json
//              while its journal is the one the whole run resumes from)
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, appendFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { RNG } from '../core/rng.mjs';
import { Brain } from '../core/brain.mjs';
import { attachMemory } from '../memory/index.mjs';
import { ask, ROUTES } from '../act/prompt.mjs';
import { solveCode, extractCode, firstPrompt } from '../act/code.mjs';
import { runTests } from '../act/run.mjs';
import { solve } from '../act/solve.mjs';
import { complete, probeOllama, OLLAMA_BASE } from '../act/llm.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const PUBLIC = path.join(HERE, 'fixtures', 'public');
const abs = (rel) => path.join(ROOT, rel);
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

export const SETS = Object.freeze(['arc', 'humaneval', 'gsm8k']);
export const DEFAULT_MODEL = 'qwen3:1.7b';
export const DEFAULT_SEED = 'public/1';
/** The three arms the bar is made of, in declaration order. The run order rotates; this does not. */
export const ARMS = Object.freeze(['organism', 'alone', 'null']);
/** The arms each set's bar needs. ARC has no model, so its bar is the organism arm alone. */
export const BAR_ARMS = Object.freeze({ arc: Object.freeze(['organism']), humaneval: ARMS, gsm8k: ARMS });
/** Arms a run may add by naming them in --arms. They are measured beside the bar, never part of it. */
export const EXTRA_ARMS = Object.freeze({ arc: Object.freeze([]), humaneval: Object.freeze(['repair']), gsm8k: Object.freeze(['plan']) });
/** The arms that open a socket to the model. null never does, and ARC's organism arm has no model. */
const MODEL_ARMS = new Set(['organism', 'alone', 'plan', 'repair']);
export const JOURNAL_DIR = path.join(HERE, 'verdicts', 'public');
export const VERDICT_DIR = path.join(HERE, 'verdicts');

// Copied from SOURCES.md, which is the only record of where these files came from. The
// benchmark key is the key research/published.json uses, so the published rows line up.
export const SET_META = Object.freeze({
  arc: Object.freeze({
    benchmark: 'arc-agi-1', noun: 'ARC-AGI-1 evaluation tasks', metric: 'tasks solved, every test pair exact, one attempt',
    source: 'https://github.com/fchollet/ARC-AGI (archive of master, data/evaluation)',
    license: 'Apache 2.0',
    file: 'bench/fixtures/public/arc-agi-1/evaluation',
  }),
  humaneval: Object.freeze({
    benchmark: 'humaneval', noun: 'MultiPL-E JavaScript HumanEval records', metric: 'pass@1 on one sample',
    source: 'https://huggingface.co/datasets/nuprl/MultiPL-E (config humaneval-js, split test), the JavaScript translation of https://github.com/openai/human-eval',
    license: 'BSD 3-Clause with Machine Learning Restriction (MultiPL-E), MIT (the original HumanEval)',
    file: 'bench/fixtures/public/humaneval/humaneval-js.jsonl',
  }),
  gsm8k: Object.freeze({
    benchmark: 'gsm8k', noun: 'GSM8K test records', metric: 'exact integer accuracy',
    source: 'https://github.com/openai/grade-school-math (grade_school_math/data/test.jsonl)',
    license: 'MIT',
    file: 'bench/fixtures/public/gsm8k/test.jsonl',
  }),
});

// ---------------------------------------------------------------- statistics
// The same arithmetic bench/code.mjs and bench/answer.mjs print, copied rather than imported:
// those files belong to other builders and a bench must not go red because a neighbour is
// being edited. test/public.test.mjs checks the copies agree.
const r6 = (x) => Math.round(x * 1e6) / 1e6;
const r2 = (x) => Math.round(x * 100) / 100;
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const pct = (x) => (x === null || x === undefined ? 'absent' : (x * 100).toFixed(2) + '%');

/** Wilson 95% interval for correct of n, with its width, which is one edge. */
export function wilson(correct, n, z = 1.96) {
  if (!(n > 0)) return { lo: null, hi: null, width: null };
  const p = correct / n, z2 = z * z;
  const d = 1 + z2 / n;
  const c = (p + z2 / (2 * n)) / d;
  const h = (z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n))) / d;
  return { lo: r6(c - h), hi: r6(c + h), width: r6(2 * h) };
}

/** Tasks per arm needed for a 95% interval on this gap to exclude zero at these rates. */
export function nFor95(p1, p2, z = 1.96) {
  const gap = Math.abs(p1 - p2);
  if (!(gap > 0)) return null;
  return Math.max(1, Math.ceil((z * z * (p1 * (1 - p1) + p2 * (1 - p2))) / (gap * gap)));
}

/** The arm order for each of n tasks: every selected arm every time, first arm rotating. */
export function planArms(n, arms = ARMS) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = ((i % arms.length) + arms.length) % arms.length;
    out.push([...arms.slice(k), ...arms.slice(0, k)]);
  }
  return out;
}

/** "1h 02m 03s", for an ETA a human reads at a glance. */
export function fmtDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '?';
  const s = Math.round(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return (h ? h + 'h ' + String(m).padStart(2, '0') + 'm ' : m + 'm ') + String(sec).padStart(2, '0') + 's';
}

// ---------------------------------------------------------------- the sample
/**
 * A seeded sample of a set, returned in the set's own fixed order.
 *
 * The seed picks WHICH records; the order they are run in is the order the set already has,
 * so two runs at one seed are the same run and a comparison between arms is never a
 * comparison between orders. limit 0 is the whole set and needs no seed at all. A smaller
 * limit at one seed is a subset of a larger one, which is what lets a journal written by a
 * short run serve a longer one.
 */
export function sampleIds(ids, limit, seed = DEFAULT_SEED) {
  const all = [...ids];
  if (!(limit > 0) || limit >= all.length) return all;
  const rng = new RNG(String(seed));
  const pool = rng.shuffle([...all]);
  const chosen = new Set(pool.slice(0, limit));
  return all.filter((id) => chosen.has(id));
}

// ---------------------------------------------------------------- the published rows
/** The rows research/published.json holds for one benchmark, copied with their citation. */
export function publishedFor(benchmark) {
  let doc = null;
  try { doc = JSON.parse(readFileSync(abs('research/published.json'), 'utf8')); } catch { return []; }
  const rows = Array.isArray(doc && doc.rows) ? doc.rows : [];
  return rows.filter((r) => r && r.benchmark === benchmark)
    .map((r) => ({ system: r.system, score: r.score, unit: r.unit, metric: r.metric || null, class: r.class || null, source: r.source, readAt: r.readAt }));
}

/**
 * Where an accuracy sits against the published rows. `beats` is the point estimate above the
 * row; `decidedAbove` and `decidedBelow` are the rows the 95% interval clears entirely, which
 * is the only comparison a small sample can actually decide.
 */
export function comparePublished(accuracy, interval, rows) {
  const out = { beats: [], doesNotBeat: [], decidedAbove: [], decidedBelow: [], undecided: [] };
  if (accuracy === null || accuracy === undefined) return out;
  const p = accuracy * 100;
  const lo = interval && interval.lo !== null ? interval.lo * 100 : null;
  const hi = interval && interval.hi !== null ? interval.hi * 100 : null;
  for (const r of rows) {
    if (!Number.isFinite(r.score)) continue;
    const row = { system: r.system, score: r.score };
    (p > r.score ? out.beats : out.doesNotBeat).push(row);
    if (lo !== null && lo > r.score) out.decidedAbove.push(row);
    else if (hi !== null && hi < r.score) out.decidedBelow.push(row);
    else out.undecided.push(row);
  }
  return out;
}

function printPublished(rows, label) {
  if (!rows.length) { console.log('no published row cited yet for ' + label); return; }
  console.log('published rows for ' + label + ', read from the web and cited in research/published.json:');
  for (const r of rows) {
    console.log('  ' + String(r.score).padStart(6) + ' ' + String(r.unit).padEnd(8) + String(r.system).padEnd(58)
      + (r.class || '') + (r.metric ? ' [' + r.metric + ']' : ''));
  }
}

// ---------------------------------------------------------------- loaders
export function loadArc() {
  const dir = path.join(PUBLIC, 'arc-agi-1', 'evaluation');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  return files.map((f) => ({ id: f.replace(/\.json$/, ''), file: path.join(dir, f) }));
}

export function loadHumanEval() {
  const src = readFileSync(path.join(PUBLIC, 'humaneval', 'humaneval-js.jsonl'), 'utf8');
  return src.split(/\r?\n/).filter((l) => l.trim().length).map((l) => JSON.parse(l));
}

export function loadGsm8k() {
  const src = readFileSync(path.join(PUBLIC, 'gsm8k', 'test.jsonl'), 'utf8');
  return src.split(/\r?\n/).filter((l) => l.trim().length).map((l, i) => ({ id: 'gsm8k.' + i, ...JSON.parse(l) }));
}

// ---------------------------------------------------------------- the organism
// One brain per run, the shape bench/answer.mjs builds, with NOTHING in its memory: a public
// test answer in memory before that test is graded would be the answer key, not recall.
export function buildBrain(set) {
  const name = 'public-' + set;
  const brain = new Brain({ name, ledger: 'full', pruneEvery: 0 });
  attachMemory(brain, { name });
  return brain;
}

// The organism arm and the null arm, exactly as bench/answer.mjs asks them. solve() answering
// is not a fall back: the model was not asked because it was not needed. The model cell not
// being REACHED is an absent arm on this record, never a wrong answer.
async function askArm(arm, brain, prompt, cfg) {
  if (arm === 'null') {
    const t0 = performance.now();
    const a = await ask(brain, prompt, { provider: 'null', route: cfg.route, regions: regionsOf(cfg) });
    // the null arm never calls a model, so whatever it answered is native by construction
    return { text: a.text, provenance: a.provenance.answer, redacted: !!a.redacted, route: a.route, us: r2((performance.now() - t0) * 1000), native: true };
  }
  const t0 = performance.now();
  const a = await ask(brain, prompt, {
    provider: cfg.provider === 'null' ? 'null' : 'ollama', model: cfg.model, base: cfg.base, probeMs: cfg.probeMs,
    timeoutMs: cfg.timeoutMs, maxTokens: cfg.maxTokens, route: cfg.route,
    regions: regionsOf(cfg), ...(cfg.cell ? { cell: cfg.cell } : {}),
  });
  const us = r2((performance.now() - t0) * 1000);
  const l = a.provenance.llm || null;
  const prov = a.provenance.answer;
  // NATIVE means no model call was needed: exact, direct, or memory from the knowledge tier. A
  // 'memory' answer anywhere else on this arm is ask() falling back because the model cell (or
  // a region's cell) was NOT REACHED, which is absent on this record, never a wrong answer.
  const native = prov === 'exact' || prov === 'direct' || (prov === 'memory' && a.provenance.tier === 'knowledge');
  if (!native && !(l && l.ok && l.provider === modelProvider(cfg))) return { absent: true, reason: (l && l.reason) || 'the model cell did not answer' };
  // A region's tokens are SUMMED over its k programs (or candidates) and its check call, so the
  // sum says nothing about whether any ONE call hit maxTokens: capped is null there, never guessed.
  // (Measured on the GSM8K smoke: the sum read "capped 19 of 30" at maxTokens 3000.)
  const spent = a.provenance.region ? { tokens: Number.isFinite(l && l.tokens) ? l.tokens : null, capped: null } : budgetOf(native ? null : l.tokens, cfg);
  const out = { text: a.text, provenance: prov, redacted: !!a.redacted, route: a.route, us, native, ...spent };
  if (prov === 'direct') { out.lookupNs = a.provenance.lookupNs ?? null; out.directSource = a.provenance.source ?? null; }
  if (a.provenance.region) {
    const g = a.provenance.region;
    out.region = {
      name: g.name, provenance: g.provenance, calls: g.calls, modelMs: g.modelMs, execMs: g.execMs, k: g.k,
      ...(g.name === 'math'
        ? { verify: g.verify, allFailed: g.allFailed, vote: g.vote, verdict: g.verified ? g.verified.verdict : null, changed: g.verified ? g.verified.changed : null }
        : { repair: g.repair, extracted: g.extracted, passedExtracted: g.passedExtracted, keptPhase: g.keptPhase, repaired: g.repaired }),
    };
  }
  return out;
}

/** The provenances that are NATIVE: answered with no model call at all. */
export const NATIVE = Object.freeze(['exact', 'memory', 'direct']);
/** The provider a reached model arm reports: ollama, or 'mock' when a test handed run() a cell. */
const modelProvider = (cfg) => (cfg.cell ? 'mock' : 'ollama');
const mockReply = (r) => (typeof r === 'string' ? { ok: true, text: r, tokens: null, provider: 'mock' } : { ...(r || {}), ok: !!(r && r.ok !== false), text: String((r && r.text) ?? ''), provider: 'mock' });
/** The regions option ask() gets from a run's configuration. */
export function regionsOf(cfg) {
  if (!cfg.regions) return false;
  const check = cfg.check !== 0;
  return { math: { k: cfg.k, verify: check }, code: { k: cfg.k, repair: check } };
}

// How much of the token budget a model answer spent. A reasoning model that thinks for the
// whole of maxTokens hands back NO answer text: the cell was reached and was cut off, which
// is neither absent nor the model being wrong. capped names those rows so a score can say how
// much of it was graded on the budget. solve() answering exactly spends no tokens at all.
export function budgetOf(tokens, cfg) {
  if (!Number.isFinite(tokens)) return { tokens: null, capped: false };
  return { tokens, capped: Number.isFinite(cfg.maxTokens) && cfg.maxTokens > 0 && tokens >= cfg.maxTokens };
}

// The model alone: the same prompt, the same model, the same token budget, nothing else.
async function aloneArm(prompt, cfg) {
  const c = cfg.cell
    ? mockReply(await cfg.cell({ prompt, maxTokens: cfg.maxTokens, purpose: 'alone', phase: 'alone', index: 0 }))
    : await complete({ prompt, provider: 'ollama', model: cfg.model, base: cfg.base, probeMs: cfg.probeMs, timeoutMs: cfg.timeoutMs, maxTokens: cfg.maxTokens });
  if (!c.ok || c.provider !== modelProvider(cfg)) return { absent: true, reason: c.reason || 'the model did not answer' };
  return { text: c.text, ...budgetOf(c.tokens, cfg) };
}

// ================================================================ ARC
// The search runs in a worker so that the budget can be enforced at all. A depth 3 search is
// one synchronous call inside tasks/grid.mjs with no hook to check a clock through, and a
// synchronous loop cannot be interrupted from the thread running it. worker.terminate() can.
// One worker serves every task; a task that hits the deadline costs that worker, and the next
// task starts a fresh one, because a thread wedged on a search has also wedged its brain.
const ARC_WORKER_SRC = [
  "'use strict';",
  "const { parentPort, workerData } = require('node:worker_threads');",
  'let G = null, searchProgram = null, runProgramInBrain = null, buildGridBrain = null;',
  'let induceAll = null, num = null, list = null, valueToString = null;',
  'function describe(e) { return (e && e.name ? String(e.name) + ": " + String(e.message) : String(e)); }',
  'async function boot() {',
  '  const grid = await import(workerData.gridUrl);',
  '  const cells = await import(workerData.cellsUrl);',
  '  const induce = await import(workerData.induceUrl);',
  '  G = cells.G; searchProgram = grid.searchProgram; runProgramInBrain = grid.runProgramInBrain;',
  '  buildGridBrain = grid.buildGridBrain;',
  '  induceAll = induce.induceAll; num = induce.num; list = induce.list; valueToString = induce.valueToString;',
  '}',
  // induceAll's task shape is examples of rationals and lists of rationals. An ARC grid is a
  // list of lists, so the shape applies only to a task whose every grid is one row high.
  'function oneRow(pairs) { return pairs.every((p) => p.input.length === 1 && p.output.length === 1); }',
  'function induceRows(train, test) {',
  '  const task = { name: "arc.row", family: "list", examples: train.map((p) => ({ in: { xs: list(p.input[0]) }, out: list(p.output[0]) })) };',
  '  const r = induceAll({ tasks: [task], registry: null, useLibrary: false });',
  '  return { applied: true, solved: !!(r.rows[0] && r.rows[0].solved), program: r.rows[0] ? r.rows[0].program : null, searched: r.searched };',
  '}',
  'boot().then(() => parentPort.postMessage({ type: "ready" }), (e) => parentPort.postMessage({ type: "bootFailed", error: describe(e) }));',
  'parentPort.on("message", (msg) => {',
  '  if (!msg || msg.type !== "task") return;',
  '  try {',
  '    const demos = msg.train.map((p) => ({ input: G.from(p.input), output: G.from(p.output) }));',
  '    const found = searchProgram(demos, { maxDepth: workerData.maxDepth });',
  '    const outputs = [];',
  '    if (found.program) {',
  '      const brain = buildGridBrain({ name: "arc" });',
  '      for (let i = 0; i < msg.test.length; i++) {',
  '        const run = runProgramInBrain(brain, found.program, G.from(msg.test[i].input), "t" + i);',
  '        outputs.push(run.grid ? G.rows(run.grid) : null);',
  '      }',
  '    }',
  '    let induced = { applied: false, solved: false, program: null, searched: 0 };',
  '    if (!found.program && oneRow(msg.train) && oneRow(msg.test)) induced = induceRows(msg.train, msg.test);',
  '    parentPort.postMessage({ type: "done", names: found.names, searched: found.searched, outputs, induced });',
  '  } catch (e) {',
  '    parentPort.postMessage({ type: "done", names: null, searched: 0, outputs: [], induced: { applied: false, solved: false, program: null, searched: 0 }, error: describe(e) });',
  '  }',
  '});',
].join('\n');

function spawnArcWorker(maxDepth) {
  return new Worker(ARC_WORKER_SRC, {
    eval: true,
    workerData: {
      gridUrl: pathToFileURL(path.join(ROOT, 'tasks', 'grid.mjs')).href,
      cellsUrl: pathToFileURL(path.join(ROOT, 'cells', 'grid.mjs')).href,
      induceUrl: pathToFileURL(path.join(ROOT, 'capability', 'induce.mjs')).href,
      maxDepth,
    },
    stdout: true, stderr: true,
    resourceLimits: { maxOldGenerationSizeMb: 512, maxYoungGenerationSizeMb: 64, codeRangeSizeMb: 32, stackSizeMb: 8 },
  });
}

function waitReady(worker, ms) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (v) => { if (settled) return; settled = true; clearTimeout(t); worker.off('message', onMsg); resolve(v); };
    const onMsg = (m) => { if (m && (m.type === 'ready' || m.type === 'bootFailed')) finish(m); };
    const t = setTimeout(() => finish({ type: 'bootFailed', error: 'the arc worker did not boot within ' + ms + ' ms' }), ms);
    worker.on('message', onMsg);
  });
}

const sameRows = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** One ARC task on the organism's own induction, under a wall clock budget. */
export async function arcTask(task, opts = {}) {
  const budgetMs = Number.isFinite(opts.budgetMs) && opts.budgetMs > 0 ? opts.budgetMs : 3000;
  const maxDepth = Number.isFinite(opts.maxDepth) ? opts.maxDepth : 3;
  let worker = opts.worker || null, owned = false;
  if (!worker) {
    worker = spawnArcWorker(maxDepth);
    owned = true;
    const boot = await waitReady(worker, Number.isFinite(opts.bootMs) ? opts.bootMs : 20000);
    if (boot.type !== 'ready') {
      try { await worker.terminate(); } catch { /* already gone */ }
      return { solved: false, timedOut: false, exhausted: false, bootFailed: boot.error, ms: 0, found: null, searched: 0, induced: null };
    }
  }
  const started = performance.now();
  const r = await new Promise((resolve) => {
    let settled = false;
    const finish = (v) => { if (settled) return; settled = true; clearTimeout(t); worker.off('message', onMsg); worker.off('error', onErr); worker.off('exit', onExit); resolve(v); };
    const onMsg = (m) => { if (m && m.type === 'done') finish({ kind: 'done', msg: m }); };
    const onErr = (e) => finish({ kind: 'error', error: String((e && e.message) || e) });
    const onExit = (c) => finish({ kind: 'error', error: 'the arc worker exited with code ' + c });
    const t = setTimeout(() => finish({ kind: 'timeout' }), budgetMs);
    worker.on('message', onMsg);
    worker.on('error', onErr);
    worker.on('exit', onExit);
    worker.postMessage({ type: 'task', train: task.train, test: task.test });
  });
  const ms = r2(performance.now() - started);
  if (r.kind !== 'done') {
    // The deadline costs the worker: a thread still inside a synchronous search cannot be
    // asked to stop, so it is terminated and the caller gets a dead worker back.
    try { await worker.terminate(); } catch { /* already gone */ }
    return {
      solved: false, timedOut: r.kind === 'timeout', exhausted: false, workerDied: true,
      error: r.kind === 'timeout' ? 'the search did not finish within ' + budgetMs + ' ms' : r.error,
      ms, found: null, searched: 0, induced: null,
    };
  }
  if (owned) { try { await worker.terminate(); } catch { /* already gone */ } }
  const m = r.msg;
  // ONE ATTEMPT. ARC's own rule allows two; this bench takes the single program the search
  // returned and every test pair must match it exactly.
  const solved = !!m.names && task.test.length > 0 && task.test.every((p, i) => m.outputs[i] && sameRows(m.outputs[i], p.output));
  return {
    solved, timedOut: false, exhausted: !m.names, workerDied: false,
    error: m.error || null, ms, found: m.names, searched: m.searched, induced: m.induced,
  };
}

async function arcArm(_arm, item, ctx) {
  const task = JSON.parse(readFileSync(item.file, 'utf8'));
  if (!ctx.arcWorker) {
    const w = spawnArcWorker(3);
    const boot = await waitReady(w, 20000);
    if (boot.type !== 'ready') { try { await w.terminate(); } catch { /* gone */ } throw new Error('the arc worker did not boot: ' + boot.error); }
    ctx.arcWorker = w;
  }
  const r = await arcTask(task, { budgetMs: ctx.cfg.budgetMs, maxDepth: 3, worker: ctx.arcWorker });
  if (r.workerDied) ctx.arcWorker = null;
  return {
    ok: !!r.solved, timedOut: !!r.timedOut, exhausted: !!r.exhausted, found: r.found, searched: r.searched, ms: r.ms,
    induceApplied: !!(r.induced && r.induced.applied), induceSolved: !!(r.induced && r.induced.solved), error: r.error || null,
  };
}

// ================================================================ HumanEval
const DOCTEST_RE = /^\s*\/\/\s*>>>\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\((.*)\)\s*$/;

/**
 * The visible cases a MultiPL-E record shows in its own prompt: each `// >>> f(args)` line
 * and the line under it. A case whose argument text or expected text is not a JSON value is
 * dropped, because guessing at it would invent a case the record does not contain.
 * @returns {{cases: object[], seen: number}}
 */
export function parseVisible(prompt, entry) {
  const lines = String(prompt ?? '').split(/\r?\n/);
  const cases = [];
  let seen = 0;
  for (let i = 0; i < lines.length - 1; i++) {
    const m = DOCTEST_RE.exec(lines[i]);
    if (!m) continue;
    if (entry && m[1] !== entry) continue;
    seen++;
    const nxt = /^\s*\/\/\s?(.*)$/.exec(lines[i + 1]);
    if (!nxt) continue;
    let args, expected;
    try { args = JSON.parse('[' + m[2] + ']'); } catch { continue; }
    try { expected = JSON.parse(nxt[1].trim()); } catch { continue; }
    cases.push({ args, expected });
  }
  return { cases, seen };
}

/** The function the record's prompt declares last, which is the one its tests call. */
export function humanEvalEntry(record) {
  const ms = [...String(record.prompt ?? '').matchAll(/function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)];
  if (ms.length) return ms[ms.length - 1][1];
  const m = /^HumanEval_\d+_(.+)$/.exec(String(record.name ?? ''));
  return m ? m[1] : null;
}

/**
 * The record's stop_tokens, applied to a completion as MultiPL-E applies them. The first
 * token that appears anywhere ends the answer.
 * @returns {{text: string, cutAt: string|null}}
 */
export function cutAtStopTokens(text, stopTokens) {
  const s = String(text ?? '');
  let at = -1, tok = null;
  for (const t of (Array.isArray(stopTokens) ? stopTokens : [])) {
    const i = s.indexOf(String(t));
    if (i >= 0 && (at < 0 || i < at)) { at = i; tok = String(t); }
  }
  return at < 0 ? { text: s, cutAt: null } : { text: s.slice(0, at), cutAt: tok };
}

/** A record as act/code.mjs wants a task: hidden is empty because the hidden grade here is the record's own suite. */
export function humanEvalTask(record) {
  const entry = humanEvalEntry(record);
  const v = parseVisible(record.prompt, entry);
  const sig = (/^.*function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\([^)]*\)/m.exec(String(record.prompt ?? '')) || [''])[0].split('\n').pop().trim();
  return {
    task: {
      id: record.name, kind: 'humaneval', entry,
      spec: String(record.prompt ?? '').replace(/\r?\n/g, ' ').trim(),
      signature: sig || (entry + '(...)'),
      visible: v.cases, hidden: [],
    },
    visibleSeen: v.seen, visibleParsed: v.cases.length,
  };
}

// Every arm is graded by one ruler: the code out of what the arm wrote (act/code.mjs
// extractCode, the last fenced block), cut at the record's stop tokens, run against the
// record's OWN tests string inside act/run.mjs's sandbox. A throw is a failure.
async function humanEvalArm(arm, rec, ctx) {
  const { cfg, brain } = ctx;
  const built = humanEvalTask(rec);
  const prompt = firstPrompt(built.task, built.task.entry);
  const t0 = performance.now();
  let code, extra = {};
  if (arm === 'repair') {
    const r = await solveCode(built.task, {
      provider: 'ollama', rounds: built.visibleParsed ? cfg.rounds : 1, model: cfg.model, base: cfg.base,
      probeMs: cfg.probeMs, timeoutMs: cfg.timeoutMs, maxTokens: cfg.maxTokens, limitMs: cfg.limitMs, memoryMB: cfg.memoryMB,
    });
    if (r.absent) return { absent: true, reason: r.reason || 'the arm produced no candidate' };
    code = r.code || '';
    extra = { rounds: r.rounds, visiblePassed: r.visible ? r.visible.passed : null, visibleOf: built.visibleParsed };
  } else {
    // With the regions on, ask() is handed the record's own prompt (comment and signature), the
    // shape the code region reads examples out of; the alone arm keeps the Board 8 prompt.
    const asked = cfg.regions ? String(rec.prompt ?? '') : prompt;
    const a = arm === 'alone' ? await aloneArm(prompt, cfg) : await askArm(arm, brain, asked, cfg);
    if (a.absent) return a;
    code = extractCode(a.text);
    Object.assign(extra, askFields(a));
  }
  const cut = cutAtStopTokens(code, rec.stop_tokens);
  const graded = await runTests(cut.text, rec.tests, { limitMs: cfg.testMs, memoryMB: cfg.memoryMB });
  return {
    ok: !!graded.passed, ms: r2(performance.now() - t0), testMs: graded.ms, codeChars: cut.text.length, cutAt: cut.cutAt,
    timedOut: !!graded.timedOut, error: graded.error ? String(graded.error).slice(0, 200) : null, ...extra,
  };
}

// ================================================================ GSM8K
const THINK_RE = /<think>[\s\S]*?<\/think>/gi;
const FENCE_RE = /```[a-zA-Z]*[ \t]*\r?\n([\s\S]*?)```/g;
const LET_RE = /^let\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*;?$/;
const WORD_RE = /[A-Za-z_][A-Za-z0-9_]*/g;

/** The integer after #### in a GSM8K answer, which is the only thing graded. */
export function finalAnswer(record) {
  const m = /####\s*(-?[\d,]+)/.exec(String((record && record.answer) || ''));
  if (!m) return null;
  const t = m[1].replace(/,/g, '');
  return /^-?\d+$/.test(t) ? t : null;
}

/**
 * The last number in a block of prose, decimals included, which is how every GSM8K arm is
 * read. A decimal matters: "$18.00" read as integers ends in 00, which is a wrong answer the
 * model did not give. sameInteger then accepts 18.00 as 18 and refuses 18.5.
 */
export function lastNumber(text) {
  const t = String(text ?? '').replace(THINK_RE, ' ').replace(/(\d),(?=\d\d\d\b)/g, '$1');
  const ms = [...t.matchAll(/-?\d+(?:\.\d+)?/g)];
  return ms.length ? ms[ms.length - 1][0] : null;
}

/**
 * A calculator plan out of the model's answer, or the reason it is not one (the 'plan' arm).
 * A plan is `let name = expression` lines and one final bare expression. EVERY word in it
 * must be `let` or a name bound above, because a word that is neither is prose.
 * @returns {{ok: boolean, lets: object[], last: string|null, reason: string|null}}
 */
export function parsePlan(text) {
  let t = String(text ?? '').replace(THINK_RE, ' ');
  const fences = [...t.matchAll(FENCE_RE)];
  if (fences.length) t = fences[fences.length - 1][1];
  const lines = t.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (!lines.length) return { ok: false, lets: [], last: null, reason: 'the answer held no lines' };
  const lets = [];
  const bound = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = LET_RE.exec(line);
    const isLast = i === lines.length - 1;
    if (m) {
      if (isLast) return { ok: false, lets, last: null, reason: 'the last line is a let and not the answer expression' };
      for (const w of m[2].matchAll(WORD_RE)) {
        if (!bound.has(w[0])) return { ok: false, lets, last: null, reason: 'the word ' + JSON.stringify(w[0]) + ' is not let and is not a name bound above it' };
      }
      bound.add(m[1]);
      lets.push({ name: m[1], expr: m[2] });
      continue;
    }
    if (!isLast) return { ok: false, lets, last: null, reason: 'line ' + (i + 1) + ' is neither a let nor the final expression: ' + JSON.stringify(line.slice(0, 60)) };
    for (const w of line.matchAll(WORD_RE)) {
      if (!bound.has(w[0])) return { ok: false, lets, last: null, reason: 'the word ' + JSON.stringify(w[0]) + ' is not let and is not a name bound above it' };
    }
    return { ok: true, lets, last: line, reason: null };
  }
  return { ok: false, lets, last: null, reason: 'the plan has no final expression' };
}

function substitute(expr, env) {
  return String(expr).replace(WORD_RE, (w) => (env.has(w) ? '(' + env.get(w) + ')' : w));
}

/**
 * Evaluate a plan EXACTLY, through act/solve.mjs and nothing else. No eval, no Function, no
 * sandbox: every expression is parsed and computed as rationals by the organism's own solver.
 * @returns {{ok: boolean, value: string|null, steps: object[], reason: string|null}}
 */
export function evalPlan(plan) {
  if (!plan || !plan.ok) return { ok: false, value: null, steps: [], reason: (plan && plan.reason) || 'not a plan' };
  const env = new Map();
  const steps = [];
  for (const l of plan.lets) {
    const expr = substitute(l.expr, env);
    const s = solve(expr);
    if (!s) return { ok: false, value: null, steps, reason: 'act/solve.mjs could not compute ' + JSON.stringify(expr.slice(0, 80)) };
    env.set(l.name, s.answer);
    steps.push({ name: l.name, expr, value: s.answer, method: s.method });
  }
  const lastExpr = substitute(plan.last, env);
  const s = solve(lastExpr);
  if (!s) return { ok: false, value: null, steps, reason: 'act/solve.mjs could not compute the final expression ' + JSON.stringify(lastExpr.slice(0, 80)) };
  steps.push({ name: null, expr: lastExpr, value: s.answer, method: s.method });
  return { ok: true, value: s.answer, steps, reason: null };
}

/** Exact integer match, which is the only reading of a GSM8K answer. */
export function sameInteger(got, gold) {
  if (got === null || got === undefined || gold === null) return false;
  let t = String(got).trim();
  const frac = /^(-?\d+)\s*\/\s*(1)$/.exec(t);
  if (frac) t = frac[1];
  const dot = /^(-?\d+)\.0+$/.exec(t);
  if (dot) t = dot[1];
  return /^-?\d+$/.test(t) && String(Number(t)) === String(Number(gold));
}

export function planPrompt(question, bad) {
  const head = [
    'Read the problem and write ONLY the arithmetic that answers it.',
    '',
    'PROBLEM: ' + String(question ?? ''),
    '',
    'Answer with a PLAN and nothing else. A plan is a list of lines.',
    'Every line except the last is exactly',
    '  let name = expression',
    'where name is one lowercase word and expression uses only numbers, names bound on earlier',
    'lines, and the operators + - * / ( ).',
    'The last line is one expression with no let, and its value is the answer.',
    'No prose, no units, no currency signs, no comments, no code fence, and no word that is not',
    'let or a name you bound.',
    '',
    'EXAMPLE PLAN',
    'let eggs = 16 - 3 - 4',
    'eggs * 2',
  ];
  if (!bad) return head.join('\n');
  return head.concat(['', 'YOUR PREVIOUS ANSWER WAS NOT A PLAN: ' + bad, '', 'Write the plan again, lines only.']).join('\n');
}

/** The one prompt the organism, alone and null arms all get on a GSM8K record. */
export const ALONE_PROMPT = (question) => String(question ?? '') + '\n\nAnswer with the final number.';

async function gsm8kArm(arm, rec, ctx) {
  const { cfg, brain } = ctx;
  const gold = finalAnswer(rec);
  const t0 = performance.now();
  if (arm === 'plan') {
    // the Board 7 arm: one plan, one retry when it does not parse, then exact evaluation
    let bad = null, evaluated = null, calls = 0, reached = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      const c = await complete({ prompt: planPrompt(rec.question, bad), provider: 'ollama', model: cfg.model, base: cfg.base, probeMs: cfg.probeMs, timeoutMs: cfg.timeoutMs, maxTokens: cfg.maxTokens });
      calls++;
      if (!c.ok || c.provider !== 'ollama') { bad = c.reason; break; }
      reached = true;
      const parsed = parsePlan(c.text);
      evaluated = evalPlan(parsed);
      if (evaluated.ok) break;
      bad = parsed.ok ? evaluated.reason : parsed.reason;
    }
    if (!reached) return { absent: true, reason: bad || 'the model did not answer' };
    const got = evaluated && evaluated.ok ? evaluated.value : null;
    return { ok: sameInteger(got, gold), got, ms: r2(performance.now() - t0), calls, planParsed: !!(evaluated && evaluated.ok), reason: evaluated && evaluated.ok ? null : bad };
  }
  const prompt = ALONE_PROMPT(rec.question);
  const a = arm === 'alone' ? await aloneArm(prompt, cfg) : await askArm(arm, brain, prompt, cfg);
  if (a.absent) return a;
  const got = lastNumber(a.text);
  return { ok: sameInteger(got, gold), got, ms: r2(performance.now() - t0), chars: String(a.text).length, ...askFields(a) };
}

// What an arm result carries into the journal besides its grade: provenance, the ask's route and
// wall microseconds, whether it was native, a direct hit's nanoseconds, and the region's counts.
function askFields(a) {
  const out = {};
  if (a.provenance) { out.provenance = a.provenance; out.redacted = a.redacted; }
  for (const k of ['route', 'us', 'native', 'lookupNs', 'directSource', 'region']) if (a[k] !== undefined) out[k] = a[k];
  if (a.tokens !== undefined) { out.tokens = a.tokens; out.capped = a.capped; }
  return out;
}

// ---------------------------------------------------------------- the two rulers
/** HumanEval records a builder developed against: 0 to 39 by file index (bench/verdicts/synth.json development.humaneval). */
export const HUMANEVAL_DEV_BELOW = 40;
/** GSM8K records the prompts of reason/math.mjs were probed on, outside math.json's 200. */
export const GSM8K_PROBED = Object.freeze(['gsm8k.0', 'gsm8k.1', 'gsm8k.2']);
let gsmDev = null;
/**
 * The GSM8K development ids: the 200 bench/verdicts/math.json lists under records.ids plus
 * the three its prompts were probed on. Read from the file, never typed here. A missing file
 * leaves only the three, and says so in the verdict (devSource).
 */
export function gsm8kDevIds(file = abs('bench/verdicts/math.json')) {
  if (gsmDev && gsmDev.file === file) return gsmDev;
  let ids = [], source = null;
  try {
    const m = JSON.parse(readFileSync(file, 'utf8'));
    if (m && m.records && Array.isArray(m.records.ids)) { ids = m.records.ids.map(String); source = rel(file) + ' records.ids (' + ids.length + ')'; }
  } catch { /* absent: only the probed three */ }
  const set = new Set([...ids, ...GSM8K_PROBED]);
  gsmDev = { file, set, source: (source || 'no readable ' + rel(file)) + ' plus ' + GSM8K_PROBED.join(', ') + ' (the records reason/math.mjs prompts were probed on)' };
  return gsmDev;
}
/** 'development' or 'heldOut' for one record; null where a set has no development records (ARC). */
export function splitOf(set, item) {
  if (set === 'humaneval') return Number.isInteger(item.index) && item.index < HUMANEVAL_DEV_BELOW ? 'development' : 'heldOut';
  if (set === 'gsm8k') return gsm8kDevIds().set.has(String(item.id)) ? 'development' : 'heldOut';
  return null;
}
// board 24b builder (item unsplit-bars): the split object of a public verdict, which the gate's
// CONTAMINATION row reads (twoRulers above is the per set rule in words; this is the object).
/**
 * What a public verdict developed on and what it scored: pure, from the per set counts of the
 * records the run graded, as splitOf placed them. Clean (contaminated false) only when no graded
 * record is a development record; a count that was not measured is a reason, never clean.
 * @param {{set?: string, development?: number, heldOut?: number, sets?: Object<string, {development: number, heldOut: number}>}} [opts]
 */
export function splitFor(opts = {}) {
  const RULE = {
    gsm8k: 'the 200 GSM8K test ids bench/verdicts/math.json lists under records.ids plus gsm8k.0 to gsm8k.2 (the records reason/math.mjs prompts were probed on)',
    humaneval: 'MultiPL-E JavaScript HumanEval records 0 to 39 by index (the reason/synth.mjs extractor was written reading them)',
    arc: 'no ARC-AGI-1 evaluation task (splitOf gives null for ARC: bench/grid.mjs develops on the training directory)',
  };
  const given = opts.sets && typeof opts.sets === 'object' ? opts.sets : opts.set ? { [opts.set]: { development: opts.development, heldOut: opts.heldOut } } : {};
  const sets = {};
  const unmeasured = [];
  let dev = 0, held = 0;
  for (const name of Object.keys(given).sort()) {
    const c = given[name] || {};
    const d = Number.isInteger(c.development) && c.development >= 0 ? c.development : null;
    const h = Number.isInteger(c.heldOut) && c.heldOut >= 0 ? c.heldOut : null;
    if (d === null || h === null) unmeasured.push(name); else { dev += d; held += h; }
    sets[name] = { development: d, heldOut: h };
  }
  const names = Object.keys(sets);
  const measured = names.length > 0 && unmeasured.length === 0;
  const perSet = (k) => names.map((n) => n + ' ' + sets[n][k]).join(', ');
  const contaminated = !names.length ? 'no set was named, so no graded record was placed on either side of the split'
    : !measured ? 'the development and held-out counts were not measured for ' + unmeasured.join(', ') + ', so the split cannot be called clean'
    : dev > 0 ? dev + ' of the ' + (dev + held) + ' graded records are development records (' + perSet('development') + '): every count over all records includes them, and only the held-out counts (' + perSet('heldOut') + ') are clean'
    : false;
  return {
    development: { what: 'records a builder developed against, graded apart under TWO RULERS: ' + (names.length ? names.map((n) => n + ', ' + (RULE[n] || 'no development rule is known for this set')).join('; ') : 'no set named'), n: measured ? dev : null, sets: Object.fromEntries(names.map((n) => [n, sets[n].development])) },
    heldOut: { what: 'every other record of each set, never read while the arm that grades it was built; the held-out counts are the ones to quote', n: measured ? held : null, sets: Object.fromEntries(names.map((n) => [n, sets[n].heldOut])) },
    contaminated,
  };
}

const SPLIT_SOURCE = Object.freeze({
  humaneval: () => 'records 0 to ' + (HUMANEVAL_DEV_BELOW - 1) + ' by index of the file are development (bench/verdicts/synth.json development.humaneval: the extractor was written reading them); 40 to 160 are held out',
  gsm8k: () => gsm8kDevIds().source + ' are development; every other record is held out',
  arc: () => null,
});

// ---------------------------------------------------------------- the sets
const SETUP = Object.freeze({
  arc: () => ({ items: loadArc(), extras: (it) => { const t = JSON.parse(readFileSync(it.file, 'utf8')); return { trainPairs: t.train.length, testPairs: t.test.length }; }, arm: arcArm, split: () => null }),
  humaneval: () => ({ items: loadHumanEval().map((r, index) => ({ id: r.name, index, ...r })), extras: (r) => { const b = humanEvalTask(r); return { index: r.index, entry: b.task.entry, visibleSeen: b.visibleSeen, visibleParsed: b.visibleParsed }; }, arm: humanEvalArm, split: (r) => splitOf('humaneval', r) }),
  gsm8k: () => ({ items: loadGsm8k(), extras: (r) => ({ gold: finalAnswer(r) }), arm: gsm8kArm, split: (r) => splitOf('gsm8k', r) }),
});

// ---------------------------------------------------------------- the journal
/** The journal of one set at one seed. A seed's slash becomes an underscore in the name. */
export function journalPath(dir, set, seed, tag = null) {
  return path.join(dir, set + (tag ? '-' + safeName(tag) : '') + '-' + safeName(seed) + '.jsonl');
}
const safeName = (s) => String(s).replace(/[^A-Za-z0-9._-]+/g, '_');

// The configuration that changes a graded result, per set. A journal written under one of
// these is not evidence about another, so --resume refuses a mismatch rather than mixing two
// measurements into one number. The limit is not here: a smaller sample at one seed is a
// subset of a larger one, so a journal serves any limit. The arms are not here either: a
// journal holds results per arm, and an arm it does not hold is simply run.
// regions, k and check (Board 11) change what the organism arm is, so a journal written under
// one setting is refused by a resume under another.
const FINGERPRINT = Object.freeze({
  arc: ['set', 'seed', 'budgetMs'],
  humaneval: ['set', 'seed', 'model', 'route', 'maxTokens', 'testMs', 'limitMs', 'memoryMB', 'rounds', 'regions', 'k', 'check'],
  gsm8k: ['set', 'seed', 'model', 'route', 'maxTokens', 'regions', 'k', 'check'],
});

export function fingerprint(cfg) {
  const out = {};
  for (const k of FINGERPRINT[cfg.set]) out[k] = cfg[k] === undefined ? null : cfg[k];
  return out;
}

/**
 * Read a journal back. A line that does not parse is TORN (a kill inside a write) and is
 * skipped and counted; it can only ever cost the one arm result it was writing.
 * @returns {{header: object|null, records: Map<string, object>, torn: number, lines: number}}
 */
export function readJournal(file) {
  const out = { header: null, records: new Map(), torn: 0, lines: 0 };
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    out.lines++;
    let j;
    try { j = JSON.parse(line); } catch { out.torn++; continue; }
    if (j && j.type === 'header' && !out.header) { out.header = j; continue; }
    if (j && j.type === 'arm' && typeof j.id === 'string' && typeof j.arm === 'string') out.records.set(j.id + '\u0000' + j.arm, j);
    else out.torn++;
  }
  return out;
}

/**
 * Open the journal for this run. Resume reads it back and checks the fingerprint; a fresh run
 * moves an existing journal aside (never deletes it) and starts a new one.
 */
export function openJournal({ dir, cfg, resume, write }) {
  const file = journalPath(dir, cfg.set, cfg.seed, cfg.tag);
  const fp = fingerprint(cfg);
  const empty = { file: null, records: new Map(), torn: 0, movedAside: null, resumed: false, append: () => {} };
  if (!write) return empty;
  mkdirSync(dir, { recursive: true });
  if (resume && existsSync(file)) {
    const j = readJournal(file);
    const theirs = j.header ? j.header.fingerprint || {} : null;
    if (!theirs) throw new Error('--resume refused: ' + rel(file) + ' has no header line, so what produced its results is unknown');
    const diffs = Object.keys(fp).filter((k) => JSON.stringify(theirs[k] ?? null) !== JSON.stringify(fp[k]));
    if (diffs.length) {
      throw new Error('--resume refused: ' + rel(file) + ' was written with ' + diffs.map((k) => k + ' ' + JSON.stringify(theirs[k] ?? null)).join(', ')
        + ' and this run has ' + diffs.map((k) => k + ' ' + JSON.stringify(fp[k])).join(', ')
        + '. Resume with the same flags, or run without --resume to start a new journal (the old one is moved aside, never deleted)');
    }
    // A kill inside a write leaves a last line with no newline. The next append would join it
    // and be torn with it, so the line is closed first and costs only the result it was writing.
    const text = readFileSync(file, 'utf8');
    if (text.length && !text.endsWith('\n')) appendFileSync(file, '\n');
    return { file, records: j.records, torn: j.torn, movedAside: null, resumed: true, append: (rec) => appendFileSync(file, JSON.stringify(rec) + '\n') };
  }
  let movedAside = null;
  if (existsSync(file)) {
    movedAside = file.replace(/\.jsonl$/, '.superseded-' + new Date().toISOString().replace(/[:.]/g, '-') + '.jsonl');
    renameSync(file, movedAside);
  }
  writeFileSync(file, JSON.stringify({ type: 'header', at: new Date().toISOString(), node: process.version, fingerprint: fp, command: cfg.command }) + '\n');
  return { file, records: new Map(), torn: 0, movedAside, resumed: false, append: (rec) => appendFileSync(file, JSON.stringify(rec) + '\n') };
}

// ---------------------------------------------------------------- the verdict
export const VERDICT_NAME = (set, bar, tag = null, name = null) => 'public-' + set + (tag ? '-' + safeName(tag) : '') + (name ? '-' + safeName(name) : '') + (bar ? '' : '-partial') + '.json';

/**
 * Why this run is or is not the bar. The bar is the whole set (or a sample the caller
 * declared with --bar), finished, with every bar arm graded on every task.
 * @returns {{isTheBar: boolean, why: string[]}}
 */
export function barStatus({ set, limit, bar, arms, complete, absentRecords, of, modelOff = false }) {
  const why = [];
  if (!complete) why.push('the run had not finished');
  if (limit > 0 && limit < of && !bar) why.push('a sample of ' + limit + ' of ' + of + ', not the whole set (--limit 0, or --bar to declare a sample the bar)');
  const missing = BAR_ARMS[set].filter((a) => !arms.includes(a));
  if (missing.length) why.push('the bar arm' + (missing.length > 1 ? 's ' : ' ') + missing.join(',') + ' did not run');
  if (modelOff) why.push('the model cell was null (--provider null, board 18 builder): the accuracy row needs the model chain' + (absentRecords > 0 ? ', and ' + absentRecords + ' record' + (absentRecords > 1 ? 's' : '') + ' with no native answer ' + (absentRecords > 1 ? 'are' : 'is') + ' absent' : ''));
  else if (absentRecords > 0) why.push(absentRecords + ' arm result' + (absentRecords > 1 ? 's were' : ' was') + ' absent (the model was not reached; --resume retries them)');
  return { isTheBar: why.length === 0, why };
}

function summarizeArm(set, arm, rows, cfg) {
  if (!cfg.arms.includes(arm)) {
    const reason = set === 'arc'
      ? (arm === 'alone' ? 'ARC has no model arm in this bench: the organism arm is the grid search and nothing else' : 'ARC has no null arm: with no model arm there is nothing for a floor to be a floor of')
      : 'not selected: this run was --arms ' + cfg.arms.join(',');
    return { absent: true, reason, n: 0, correct: null, accuracy: null, interval: { lo: null, hi: null, width: null }, meanMs: null, absentRecords: 0 };
  }
  const cells = rows.map((r) => r.arms[arm]).filter(Boolean);
  const recs = cells.filter((c) => !c.absent);
  const absents = cells.filter((c) => c.absent);
  const absentReason = absents.length ? absents[0].reason || 'absent' : null;
  if (!recs.length) {
    return { absent: true, reason: absentReason || 'no record was graded', n: 0, correct: null, accuracy: null, interval: { lo: null, hi: null, width: null }, meanMs: null, absentRecords: absents.length };
  }
  const correct = recs.filter((c) => c.ok).length;
  const out = {
    absent: false, n: recs.length, correct, accuracy: r6(correct / recs.length), interval: wilson(correct, recs.length),
    meanMs: r2(mean(recs.map((c) => c.ms)) || 0), absentRecords: absents.length, absentReason,
  };
  // provenance, as bench/answer.mjs counts it: what each answer came from and how many were right
  if (recs.some((c) => c.provenance)) {
    out.provenance = {};
    for (const c of recs) {
      if (!c.provenance) continue;
      const e = out.provenance[c.provenance] || (out.provenance[c.provenance] = { n: 0, correct: 0 });
      e.n++; if (c.ok) e.correct++;
    }
    out.redacted = recs.filter((c) => c.redacted).length;
    Object.assign(out, sharesOf(recs));
  }
  if (recs.some((c) => c.region)) out.regions = regionCounts(recs);
  if (set !== 'arc') out.splits = splitsOf(set, rows, arm);
  // answers cut off by maxTokens; a journal written before this field existed has none to count
  if (recs.some((c) => c.capped !== undefined)) {
    // a region row's journaled capped (from a summed token count) is not a cap reading
    const capOf = (c) => c.capped === true && !c.region;
    out.cappedAtMaxTokens = recs.filter(capOf).length;
    out.cappedAndWrong = recs.filter((c) => capOf(c) && !c.ok).length;
    const regionRows = recs.filter((c) => c.region).length;
    if (regionRows) out.cappedNotReadable = { n: regionRows, why: 'a region answer journals the SUM of its calls tokens, so whether one call hit maxTokens is not readable from it' };
  }
  if (set === 'humaneval') {
    out.cutByStopToken = recs.filter((c) => c.cutAt).length;
    out.testTimedOut = recs.filter((c) => c.timedOut).length;
    if (arm === 'repair') out.meanRounds = r2(mean(recs.map((c) => c.rounds || 0)) || 0);
  }
  if (set === 'gsm8k' && arm === 'plan') out.plansThatDidNotEvaluate = recs.filter((c) => !c.planParsed).length;
  if (set === 'arc') {
    out.exhausted = recs.filter((c) => !c.ok && c.exhausted).length;
    out.timedOut = recs.filter((c) => !c.ok && c.timedOut).length;
    out.wrongProgram = recs.filter((c) => !c.ok && !c.exhausted && !c.timedOut).length;
    out.induceApplied = recs.filter((c) => c.induceApplied).length;
    out.induceSolved = recs.filter((c) => c.induceSolved).length;
  }
  return out;
}

// THE NATIVE SHARE: the records ask() answered with no model call at all (exact, memory or
// direct), with the ask's own wall microseconds; the direct share with its table lookup
// nanoseconds; the model share with its microseconds for contrast. A journal written before
// these fields existed has no us to average, so its mean is null, never zero.
function sharesOf(recs) {
  const n = recs.length;
  const avg = (xs) => { const v = xs.filter((x) => Number.isFinite(x)); return v.length ? r2(mean(v)) : null; };
  // the journaled native flag decides; a record from before it existed falls back to its provenance
  const isNative = (c) => (c.native !== undefined ? !!c.native : NATIVE.includes(c.provenance));
  const nat = recs.filter(isNative);
  const dir = recs.filter((c) => c.provenance === 'direct');
  const mod = recs.filter((c) => c.provenance && !isNative(c));
  return {
    native: { n: nat.length, of: n, share: n ? r6(nat.length / n) : null, correct: nat.filter((c) => c.ok).length, meanUs: avg(nat.map((c) => c.us)), maxUs: nat.length && nat.every((c) => Number.isFinite(c.us)) ? r2(Math.max(...nat.map((c) => c.us))) : null, provenances: NATIVE },
    direct: { n: dir.length, of: n, share: n ? r6(dir.length / n) : null, correct: dir.filter((c) => c.ok).length, meanNs: avg(dir.map((c) => c.lookupNs)), meanUs: avg(dir.map((c) => c.us)) },
    viaModel: { n: mod.length, of: n, share: n ? r6(mod.length / n) : null, correct: mod.filter((c) => c.ok).length, meanUs: avg(mod.map((c) => c.us)) },
  };
}

// What the reasoning regions did, by region: how many records reached each, the region's own
// provenance of each, and the model calls and milliseconds they spent.
function regionCounts(recs) {
  const out = {};
  for (const c of recs) {
    if (!c.region) continue;
    const g = c.region;
    const e = out[g.name] || (out[g.name] = { n: 0, correct: 0, byProvenance: {}, calls: 0, modelMs: 0, execMs: 0 });
    e.n++; if (c.ok) e.correct++;
    const p = g.provenance || 'none';
    const b = e.byProvenance[p] || (e.byProvenance[p] = { n: 0, correct: 0 });
    b.n++; if (c.ok) b.correct++;
    e.calls += Number(g.calls) || 0; e.modelMs += Number(g.modelMs) || 0; e.execMs += Number(g.execMs) || 0;
    if (g.name === 'math') {
      e.verdicts = e.verdicts || {};
      const v = g.verdict || (g.verify ? 'none' : 'unverified');
      e.verdicts[v] = (e.verdicts[v] || 0) + 1;
      e.allFailed = (e.allFailed || 0) + (g.allFailed ? 1 : 0);
    } else {
      e.repaired = (e.repaired || 0) + (g.repaired ? 1 : 0);
      e.noExamples = (e.noExamples || 0) + (g.extracted ? 0 : 1);
    }
  }
  for (const e of Object.values(out)) { e.meanCalls = r2(e.calls / e.n); e.meanModelMs = r2(e.modelMs / e.n); e.modelMs = r2(e.modelMs); e.execMs = r2(e.execMs); }
  return out;
}

// TWO RULERS: an arm's accuracy on the development records and on the held-out records, apart.
function splitsOf(set, rows, arm) {
  const out = {};
  for (const name of ['development', 'heldOut']) {
    const cs = rows.filter((r) => r.split === name).map((r) => r.arms[arm]).filter((c) => c && !c.absent);
    const correct = cs.filter((c) => c.ok).length;
    out[name] = { n: cs.length, correct, accuracy: cs.length ? r6(correct / cs.length) : null, interval: cs.length ? wilson(correct, cs.length) : { lo: null, hi: null, width: null } };
  }
  return out;
}

function splitLine(name, sp) {
  if (!sp) return '';
  const one = (k, label) => sp[k].n ? label + ' ' + sp[k].correct + ' of ' + sp[k].n + ' = ' + pct(sp[k].accuracy) + ' (' + pct(sp[k].interval.lo) + ' to ' + pct(sp[k].interval.hi) + ')' : label + ' none in this sample';
  return name + ': ' + one('heldOut', 'held out') + ', ' + one('development', 'development');
}

/** The native share of a model-off run (board 18 builder): native answers over every record asked, absent ones included. */
function nativeShareModelOff(o, asked) {
  const native = o && !o.absent ? o.native ? o.native.n : o.n : 0;
  const correct = o && !o.absent ? o.native ? o.native.correct : o.correct : 0;
  return { native, of: asked, share: asked ? r6(native / asked) : null, correct, absent: asked - native, how: 'native answers (' + NATIVE.join(', ') + ') over every record the run asked; a record with no native answer is absent, since the model cell is null' };
}

function nativeLine(s) {
  if (!s || s.absent || !s.native) return '';
  const nat = s.native, dir = s.direct;
  return 'native (' + NATIVE.join(', ') + ': no model call) ' + nat.n + ' of ' + nat.of + ' = ' + pct(nat.share)
    + (nat.n ? ', mean ' + (nat.meanUs === null ? 'unmeasured' : nat.meanUs + ' us') + ' per ask' : '')
    + '; direct ' + dir.n + ' of ' + dir.of + (dir.n ? ', mean lookup ' + (dir.meanNs === null ? 'unmeasured' : dir.meanNs + ' ns') : ' (no record was answered from the direct table)')
    + '; through the model ' + s.viaModel.n + ' of ' + s.viaModel.of + (s.viaModel.n && s.viaModel.meanUs !== null ? ', mean ' + r2(s.viaModel.meanUs / 1e6) + ' s per ask' : '');
}

// The rows the ladder climbs to: the Llama 3.1 405B GSM8K row every verdict carries (read from
// research/published.json, never typed here), and the frontier rows of this set with sources.
function ladderRows(set, published) {
  const gsm = set === 'gsm8k' ? published : publishedFor(SET_META.gsm8k.benchmark);
  const r405 = gsm.find((r) => /405B/.test(String(r.system))) || null;
  const frontier = published.filter((r) => /frontier/i.test(String(r.class || '')));
  const top = published.length ? published.reduce((a, b) => (b.score > a.score ? b : a)) : null;
  return {
    row405B: r405 ? { system: r405.system, benchmark: SET_META.gsm8k.benchmark, score: r405.score, metric: r405.metric, source: r405.source, readAt: r405.readAt } : null,
    frontier: frontier.map((r) => ({ system: r.system, score: r.score, metric: r.metric, class: r.class, source: r.source, readAt: r.readAt })),
    frontierNote: frontier.length ? null : 'research/published.json cites no row of class frontier for ' + set + '; its highest cited row is ' + (top ? top.system + ' ' + top.score : 'none'),
  };
}

function ledgerCounts(brain) {
  const out = {};
  for (const e of brain.ledger.recent(Number.MAX_SAFE_INTEGER)) out[e.type] = (out[e.type] || 0) + 1;
  return out;
}

function cappedSentence(cfg, arms) {
  const hit = cfg.arms.filter((a) => arms[a] && !arms[a].absent && arms[a].cappedAtMaxTokens > 0);
  if (!hit.length) return '';
  const wrong = hit.reduce((t, a) => t + arms[a].cappedAndWrong, 0);
  const all = hit.reduce((t, a) => t + arms[a].cappedAtMaxTokens, 0);
  return ' ' + hit.map((a) => arms[a].cappedAtMaxTokens + ' of ' + arms[a].n + ' ' + a + ' answers').join(' and ')
    + ' used the whole maxTokens ' + cfg.maxTokens + ' budget, and ' + wrong + ' of those ' + all + ' were wrong, so those rows grade the budget as much as the model.';
}

function armLine(name, s) {
  if (s.absent) return name + ' absent (' + s.reason + ')';
  return name + ' ' + pct(s.accuracy) + ' (' + s.correct + ' of ' + s.n + ')';
}

function buildVerdict(st, { final }) {
  const { cfg, meta, chosen, published, rows, journal } = st;
  const armNames = [...new Set([...ARMS, ...cfg.arms])];
  const arms = {};
  for (const a of armNames) arms[a] = summarizeArm(cfg.set, a, rows, cfg);
  const absentRecords = cfg.arms.reduce((t, a) => t + (arms[a].absentRecords || 0), 0);
  const complete = final && rows.length === chosen.length;
  const bar = barStatus({ set: cfg.set, limit: cfg.limit, bar: cfg.bar, arms: cfg.arms, complete, absentRecords, of: st.of, modelOff: cfg.provider === 'null' && cfg.set !== 'arc' });
  const o = arms.organism, al = arms.alone;
  const gap = !o.absent && !al.absent ? r6(o.accuracy - al.accuracy) : null;
  const need = gap === null ? null : nFor95(o.accuracy, al.accuracy);
  const cmp = comparePublished(o.absent ? null : o.accuracy, o.interval, published);
  const timed = st.taskMs;
  const msPerTask = timed.length ? r2(mean(timed)) : null;
  const rate = { tasksPerMinute: msPerTask ? r2(60000 / msPerTask) : null, msPerTask, tasksTimed: timed.length, arms: cfg.arms, how: 'wall ms per task over the tasks at least one arm ran IN THIS PROCESS; a task read whole from the journal is not timed' };
  const row = (r) => r.system + ' ' + r.score;
  // --provider null (board 18 builder): the model cell is null, so no model is named, the graded rows are the records
  // answered natively (a selection, not a GSM8K accuracy: no published row is set beside it), and the native share is
  // stated over EVERY record the run asked
  const modelOff = cfg.provider === 'null' && cfg.set !== 'arc';
  const offShare = modelOff ? nativeShareModelOff(o, rows.length) : null;
  const organismHow = cfg.set === 'arc'
    ? 'the grid search, no model'
    : modelOff
      ? 'act/prompt.mjs ask() with the model cell null, no socket and no model: the direct table, act/solve.mjs (the exact reader, the word reader exact.word), then memory; a record it does not answer natively is absent, not graded'
    : cfg.regions
      ? 'act/prompt.mjs ask(): the direct table, act/solve.mjs, then the ' + (cfg.set === 'gsm8k' ? 'math region (reason/math.mjs solveMath, k=' + cfg.k + (cfg.check ? ', verify' : '') + ')' : 'code region (reason/synth.mjs synthesize, k=' + cfg.k + (cfg.check ? ', repair' : '') + ')') + ' on the model cell ' + cfg.model
      : 'act/prompt.mjs ask(): act/solve.mjs, then recall, then the model cell ' + cfg.model;
  const whole = timed.length ? { msPerTask, of: st.of, minutes: r2(msPerTask * st.of / 60000), remaining: st.of - rows.length, remainingMinutes: r2(msPerTask * (st.of - rows.length) / 60000) } : null;
  if (whole) whole.arithmetic = msPerTask + ' ms per record x ' + st.of + ' records / 60000 = ' + whole.minutes + ' minutes (arms ' + cfg.arms.join(',') + ', interleaved; a resume skips the ' + rows.length + ' held here, leaving ' + whole.remainingMinutes + ' minutes)';
  const ladder = ladderRows(cfg.set, published);
  const statement = (bar.isTheBar ? '' : 'PARTIAL, isTheBar false (' + bar.why.join('; ') + '): ')
    + 'on ' + rows.length + ' of ' + st.of + ' ' + meta.noun + ' at seed ' + cfg.seed + ', ' + meta.metric + ': the organism (' + organismHow + ') '
    + (modelOff ? 'answered natively ' + offShare.native + ' of the ' + offShare.of + ' records asked (' + pct(offShare.share) + '), ' + offShare.correct + ' of those right' + (o.absent ? '' : ', mean ' + o.meanMs + ' ms per graded task') + '; the other ' + offShare.absent + ' records were not answered with no model and are absent'
      : o.absent ? 'was absent (' + o.reason + ')' : 'scored ' + o.correct + ' of ' + o.n + ' = ' + pct(o.accuracy) + ', 95 percent interval ' + pct(o.interval.lo) + ' to ' + pct(o.interval.hi) + ', mean ' + o.meanMs + ' ms per task')
    + '; ' + armLine('the model alone', al) + '; ' + armLine('null', arms.null)
    + (cfg.arms.filter((a) => !ARMS.includes(a)).map((a) => '; opt in arm ' + armLine(a, arms[a])).join(''))
    + '. ' + (gap === null ? 'No organism minus alone gap is measurable on this run.' : 'Organism minus alone = ' + (gap * 100).toFixed(2) + ' points, '
      + (need === null ? 'no gap at all, so no n separates it.' : 'which at these rates needs ' + need + ' tasks per arm to separate from zero.'))
    + cappedSentence(cfg, arms)
    + (modelOff ? ' No published row is set beside this run: only the records the organism answered natively were graded, a selection, so their accuracy is not a GSM8K accuracy.' : '')
    + (o.absent || !published.length || modelOff ? '' : ' Against the published rows the organism point estimate is above ' + (cmp.beats.length ? cmp.beats.map(row).join(', ') : 'none of them')
      + ' and not above ' + (cmp.doesNotBeat.length ? cmp.doesNotBeat.map(row).join(', ') : 'none of them')
      + '; its 95 percent interval lies wholly below ' + cmp.decidedBelow.length + ' of ' + published.length + ' rows and wholly above ' + cmp.decidedAbove.length + '.')
    + (rate.tasksPerMinute === null ? '' : ' Rate: ' + rate.tasksPerMinute + ' tasks per minute in this process (' + r2(msPerTask / 1000) + ' s per task, arms ' + cfg.arms.join(',') + ').')
    + (o.absent || !o.native ? '' : ' Organism ' + nativeLine(o) + '.')
    + (o.absent || !o.splits ? '' : ' TWO RULERS, organism ' + splitLine('by split', o.splits) + (al.absent ? '' : '; alone ' + splitLine('by split', al.splits)) + '.')
    + (cfg.set === 'arc' || modelOff ? '' : ' Every latency here was measured on ONE shared Ollama queue that other builders were using at the same time.');
  return {
    at: new Date().toISOString(), node: process.version, command: cfg.command,
    isTheBar: bar.isTheBar, notTheBarBecause: bar.why, complete, progress: { done: rows.length, of: chosen.length },
    ms: Date.now() - st.t0,
    set: cfg.set, source: meta.source, license: meta.license, file: meta.file,
    n: rows.length, of: st.of, seed: cfg.seed, limit: cfg.limit, budgetMs: cfg.set === 'arc' ? cfg.budgetMs : null,
    model: cfg.set === 'arc' || modelOff ? null : cfg.model, provider: cfg.provider || 'ollama', nativeShareModelOff: offShare, route: cfg.route, maxTokens: cfg.set === 'arc' ? null : cfg.maxTokens,
    ollamaUp: st.up, armsRun: cfg.arms,
    attemptsPerTask: cfg.set === 'arc' ? 1 : null, attemptsAllowedByArc: cfg.set === 'arc' ? 2 : null,
    organismPath: cfg.set === 'arc'
      ? 'tasks/grid.mjs searchProgram to depth 3 with inferColorMap at every terminal, the winning program executed as real grid cells through runProgramInBrain; capability/induce.mjs induceAll on the tasks whose every grid is one row high'
      : cfg.regions
        ? 'act/prompt.mjs ask(): the direct table, askBySpawn, then act/solve.mjs; a record solve() cannot compute reaches the ' + (cfg.set === 'gsm8k' ? 'math region (reason/math.mjs solveMath: k programs written by the model cell, run in act/run.mjs sandbox, voted by value, one verify call)' : 'code region (reason/synth.mjs synthesize: the prompt examples read out as assertions, k candidates tested against them in the sandbox, one repair round); the organism is handed the record OWN prompt, the alone arm the Board 8 act/code.mjs firstPrompt') + '; the brain holds nothing from this set'
        : 'act/prompt.mjs ask() exactly as bench/answer.mjs asks it: act/solve.mjs first, then recall from memory, then the model cell with that recall as its system block; the brain holds nothing from this set',
    regions: cfg.set === 'arc' ? null : { on: !!cfg.regions, k: cfg.regions ? cfg.k : null, check: cfg.regions ? !!cfg.check : null, sent: regionsOf(cfg) },
    twoRulers: SPLIT_SOURCE[cfg.set](),
    split: splitFor({ set: cfg.set, development: rows.filter((r) => r.split === 'development').length, heldOut: rows.filter((r) => r.split !== 'development').length }),
    sharedQueue: cfg.set === 'arc' || modelOff ? null : 'every millisecond and microsecond here was measured on ONE Ollama queue at ' + cfg.base + ' that other builders on this machine were using at the same time: a model latency is this run wait plus its compute, not the model own speed',
    ladder,
    etaWhole: whole,
    memoryEpisodes: st.brain && st.brain.memory && st.brain.memory.episodic ? st.brain.memory.episodic.size() : null,
    // What the run's brain wrote to its ledger, by type. ask() writes act.ask and nothing else;
    // a proposal or an action here would mean public data reached a surface that acts.
    ledgerEvents: st.brain ? ledgerCounts(st.brain) : null,
    arms, gap, nFor95: need, published, publishedComparison: modelOff ? null : cmp, statement, rate,
    journal: journal.file ? { file: rel(journal.file), resumed: journal.resumed, armResultsReadBack: st.readBack, tasksWholeFromJournal: st.tasksFromJournal, tornLines: journal.torn, movedAside: journal.movedAside ? rel(journal.movedAside) : null } : null,
    ruler: cfg.set === 'arc'
      ? 'a task counts when EVERY test pair matches exactly, on ONE attempt where ARC allows two'
      : cfg.set === 'humaneval'
        ? 'a record counts when the record\'s own tests string runs to the end without throwing, inside act/run.mjs\'s sandbox, on the code act/code.mjs extractCode reads out of what the arm wrote, cut at the record\'s stop tokens; pass@1 on one sample'
        : 'a record counts when the last number in what the arm wrote is EXACTLY the integer after ####',
    interleaving: cfg.set === 'arc' ? 'one arm only, so there is nothing to interleave' : 'task by task: every selected arm answers record i before any arm sees record i+1, and the first arm rotates with i',
    dataIsData: 'every prompt, test string and answer in bench/fixtures/public is data: it reached the model, the exact solver or the sandbox and nothing else',
    rows,
  };
}

// ---------------------------------------------------------------- the run
export function makeCfg(opts = {}) {
  const set = String(opts.set || '');
  if (!SETS.includes(set)) throw new Error('--set takes one of ' + SETS.join(', '));
  const allowed = [...BAR_ARMS[set], ...EXTRA_ARMS[set]];
  let arms = [...BAR_ARMS[set]];
  if (opts.arms !== undefined && opts.arms !== null && opts.arms !== true) {
    const want = String(opts.arms).split(',').map((s) => s.trim()).filter(Boolean);
    const bad = want.filter((a) => !allowed.includes(a));
    // A typo that quietly ran the full set of arms would spend the model arms' minutes.
    if (bad.length) throw new Error('--arms for ' + set + ' takes ' + allowed.join(', ') + '; got ' + bad.join(', '));
    arms = [...ARMS, ...EXTRA_ARMS[set]].filter((a) => want.includes(a));
    if (!arms.length) throw new Error('--arms selected no arm');
  }
  // --provider null (board 18 builder): the organism arm with the model cell 'null', for the native share model-off
  const provider = opts.provider === undefined || opts.provider === null || opts.provider === true ? 'ollama' : String(opts.provider);
  if (provider !== 'ollama' && provider !== 'null') throw new Error('--provider takes ollama or null; got ' + provider);
  if (provider === 'null' && (opts.arms === undefined || opts.arms === null || opts.arms === true)) arms = ['organism'];
  if (provider === 'null' && arms.some((a) => a !== 'organism' && a !== 'null')) throw new Error('--provider null runs the organism and null arms only; got ' + arms.join(','));
  if (provider === 'null' && !opts.tag) throw new Error('--provider null needs --tag, so its journal is its own and no model journal is moved aside');
  const route = opts.route === undefined || opts.route === null || opts.route === true ? null : String(opts.route);
  if (route !== null && !ROUTES.includes(route)) throw new Error('--route takes ' + ROUTES.join(' or ') + '; got ' + route);
  return {
    set, arms, route, provider,
    limit: Number.isFinite(opts.limit) ? opts.limit : 0,
    seed: opts.seed === undefined || opts.seed === null ? DEFAULT_SEED : String(opts.seed),
    bar: !!opts.bar,
    budgetMs: Number.isFinite(opts.budgetMs) ? opts.budgetMs : 3000,
    model: opts.model || DEFAULT_MODEL,
    base: opts.base || OLLAMA_BASE,
    rounds: Number.isFinite(opts.rounds) ? opts.rounds : 3,
    probeMs: Number.isFinite(opts.probeMs) ? opts.probeMs : 1500,
    timeoutMs: Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 300_000,
    // qwen3:1.7b thinks before it answers and the thinking is counted here. A GSM8K record
    // measured 6732 characters of thinking and then ran out of budget with an EMPTY answer,
    // so the gsm8k default is larger. Every model arm of one run gets the same budget.
    // HumanEval was 1600 on Board 7. Measured on Board 8: at 1600, qwen3:1.7b spent exactly
    // 1600 tokens thinking and returned 0 text chars on HumanEval_89_encrypt and
    // HumanEval_144_simplify; at 4000 the same prompts finished in 2363 and 1728 tokens with code.
    maxTokens: Number.isFinite(opts.maxTokens) ? opts.maxTokens : (set === 'gsm8k' ? 3000 : 4000),
    limitMs: Number.isFinite(opts.limitMs) ? opts.limitMs : 2000,
    testMs: Number.isFinite(opts.testMs) ? opts.testMs : 5000,
    memoryMB: Number.isFinite(opts.memoryMB) ? opts.memoryMB : 128,
    // Board 11: the reasoning regions ask() carries. regions 0 is the organism before this item.
    regions: set === 'arc' ? false : opts.regions !== 0,
    k: Number.isFinite(opts.k) && opts.k >= 1 ? Math.floor(opts.k) : 5,
    check: opts.check === 0 ? 0 : 1,
    tag: opts.tag === undefined || opts.tag === null || opts.tag === true ? null : String(opts.tag),
    name: opts.name === undefined || opts.name === null || opts.name === true ? null : String(opts.name),
    // A test hands run() a model cell (library only, never a flag): the model arms are then 'mock'.
    cell: typeof opts.cell === 'function' ? opts.cell : null,
    quiet: !!opts.quiet,
    // Board 15 (resume): minutes of task loop after which the run stops before the next record
    wallMinutes: (() => { const w = Number(opts['wall-minutes'] ?? opts.wallMinutes); return Number.isFinite(w) && w > 0 ? w : null; })(),
    command: 'node bench/public.mjs ' + (opts.argv || ['--set', set]).join(' '),
  };
}

export async function run(opts = {}) {
  const cfg = makeCfg(opts);
  const write = opts.write !== false;
  const verdictDir = opts.verdictDir ? path.resolve(opts.verdictDir) : VERDICT_DIR;
  const journalDir = opts.journalDir ? path.resolve(opts.journalDir) : JOURNAL_DIR;
  const meta = SET_META[cfg.set];
  const S = SETUP[cfg.set]();
  const byId = new Map(S.items.map((x) => [x.id, x]));
  const chosen = sampleIds(S.items.map((x) => x.id), cfg.limit, cfg.seed).map((id) => byId.get(id));
  const plan = planArms(chosen.length, cfg.arms);
  const needsModel = cfg.set !== 'arc' && cfg.arms.some((a) => MODEL_ARMS.has(a)) && cfg.provider !== 'null';
  const up = needsModel ? (cfg.cell ? true : await probeOllama(cfg.base, cfg.probeMs)) : null;
  const downReason = 'no ollama at ' + cfg.base + ': /api/tags did not answer within ' + cfg.probeMs + ' ms';
  const journal = openJournal({ dir: journalDir, cfg, resume: !!opts.resume, write });
  const st = {
    cfg, meta, chosen, of: S.items.length, published: publishedFor(meta.benchmark), rows: [], journal, up,
    brain: cfg.set === 'arc' ? null : buildBrain(cfg.set), taskMs: [], readBack: 0, tasksFromJournal: 0, t0: Date.now(),
  };
  const ctx = { cfg, brain: st.brain, arcWorker: null };
  const target = (isBar) => path.join(verdictDir, VERDICT_NAME(cfg.set, isBar, cfg.tag, cfg.name));
  // THE BAR FILE IS WRITTEN ONCE. A later pass that also reaches the bar (a --resume retry of
  // absent arm results) leaves the first one and says so; a partial is a snapshot and is rewritten.
  let barKept = null;
  const save = (v) => {
    if (!write) return null;
    mkdirSync(verdictDir, { recursive: true });
    const f = target(v.isTheBar);
    if (v.isTheBar && existsSync(f)) { barKept = f; return null; }
    writeFileSync(f, JSON.stringify(v, null, 2));
    return f;
  };

  if (!cfg.quiet) {
    console.log('\n' + meta.noun + ': ' + chosen.length + ' of ' + st.of + ', seed ' + cfg.seed + ', arms ' + cfg.arms.join(',')
      + (cfg.arms.length > 1 ? ' interleaved task by task, first arm rotating' : ''));
    if (cfg.set === 'arc') console.log('organism: searchProgram to depth 3 with inferColorMap, then induceAll where its shape applies; budget ' + cfg.budgetMs + ' ms per task; ONE attempt where ARC allows two');
    else {
      console.log(cfg.regions
        ? cfg.provider === 'null' ? 'organism: act/prompt.mjs ask() with the model cell null (--provider null, board 18 builder): the direct table, act/solve.mjs, then memory; no model, no socket; a record with no native answer is absent'
        : 'organism: act/prompt.mjs ask() with the reasoning regions: the direct table, act/solve.mjs, then the ' + (cfg.set === 'gsm8k' ? 'math region (solveMath k=' + cfg.k + (cfg.check ? ', verify' : '') + ')' : 'code region (synthesize k=' + cfg.k + (cfg.check ? ', repair' : '') + ') on the record\'s own prompt') + '; alone: the Board 8 prompt to the same model with no organism; null: ask() with no model'
        : 'organism: act/prompt.mjs ask(), the path bench/answer.mjs measures: act/solve.mjs, then recall, then the model cell; alone: the same prompt to the same model with no organism; null: ask() with no model');
      if (cfg.provider === 'null') console.log('model none: the model cell is null (--provider null), no socket is opened');
      else console.log('model ' + (cfg.cell ? 'a MOCK cell handed in by the caller' : cfg.model + ' at ' + cfg.base) + ', maxTokens ' + cfg.maxTokens + ', route ' + (cfg.route || 'whatever ask() picks') + ', ollama ' + (cfg.cell ? 'not asked' : up ? 'up' : (needsModel ? 'DOWN, so the model arms are absent' : 'not wanted')));
    }
    console.log(write
      ? 'journal ' + rel(journal.file) + (journal.resumed ? ', RESUMED: ' + journal.records.size + ' arm results held, ' + journal.torn + ' torn line(s) skipped' : ', fresh') + (journal.movedAside ? '; the previous journal was moved aside to ' + rel(journal.movedAside) : '')
      : 'nothing is written (--nowrite): no journal, no verdict');
    console.log('');
  }

  let lastSnap = Date.now();
  // --wall-minutes: the cut happens BETWEEN records, never inside one (see A BOUNDED PASS above)
  const loopT0 = performance.now();
  const wallMs = cfg.wallMinutes ? cfg.wallMinutes * 60_000 : null;
  let cut = null;
  try {
    for (let i = 0; i < chosen.length; i++) {
      const item = chosen[i];
      if (wallMs !== null && st.taskMs.length > 0 && performance.now() - loopT0 >= wallMs && plan[i].some((arm) => !journal.records.has(item.id + '\u0000' + arm))) {
        cut = { at: new Date().toISOString(), wallMinutes: cfg.wallMinutes, elapsedMinutes: r2((performance.now() - loopT0) / 60_000), recordsRunHere: st.taskMs.length, rowsDone: st.rows.length, nextId: item.id, nextIndex: i, of: chosen.length };
        break;
      }
      const row = { i, id: item.id, order: plan[i].join('>'), split: S.split(item), ...S.extras(item), arms: {} };
      const t0 = performance.now();
      let ranHere = 0, fromJournal = 0;
      for (const arm of plan[i]) {
        const held = journal.records.get(item.id + '\u0000' + arm);
        if (held) {
          const { type: _t, id: _i, arm: _a, at: _at, ...rest } = held;
          row.arms[arm] = { ...rest, journal: true };
          fromJournal++; st.readBack++;
          continue;
        }
        if (MODEL_ARMS.has(arm) && cfg.set !== 'arc' && !up && cfg.provider !== 'null') { row.arms[arm] = { absent: true, reason: downReason }; continue; }
        const r = await S.arm(arm, item, ctx);
        ranHere++;
        row.arms[arm] = r;
        if (!r.absent) journal.append({ type: 'arm', id: item.id, arm, at: new Date().toISOString(), ...r });
      }
      if (ranHere) st.taskMs.push(performance.now() - t0);
      else if (fromJournal) st.tasksFromJournal++;
      st.rows.push(row);
      if (!cfg.quiet) console.log(runningLine(cfg, st, row, i, chosen.length, ranHere));
      if (write && (Date.now() - lastSnap >= 5000) && i < chosen.length - 1) { save(buildVerdict(st, { final: false })); lastSnap = Date.now(); }
    }
  } finally {
    if (ctx.arcWorker) { try { await ctx.arcWorker.terminate(); } catch { /* already gone */ } ctx.arcWorker = null; }
  }

  const verdict = buildVerdict(st, { final: true });
  if (cut) {
    verdict.cut = cut;
    verdict.statement = 'CUT by --wall-minutes ' + cut.wallMinutes + ' at ' + cut.at + ' after ' + cut.recordsRunHere + ' record(s) run in this pass; --resume continues from ' + cut.nextId + '. ' + verdict.statement;
  }
  const written = save(verdict);
  if (cut && !cfg.quiet) console.log('CUT ' + cfg.set + ' at ' + cut.at + ': --wall-minutes ' + cut.wallMinutes + ' reached after ' + cut.elapsedMinutes + ' min and ' + cut.recordsRunHere + ' record(s) run in this pass; ' + cut.rowsDone + ' of ' + cut.of + ' rows done; the next record is ' + cut.nextId + ' and --resume continues from it');
  if (!cfg.quiet) printSummary(verdict);
  if (barKept && !cfg.quiet) console.log('the bar file ' + rel(barKept) + ' was already written and is written ONCE: this pass left it as it was');
  return { ...verdict, writtenTo: written ? rel(written) : null, barKept: barKept ? rel(barKept) : null };
}

function runningLine(cfg, st, row, i, total, ranHere) {
  const cell = (a) => {
    const c = row.arms[a];
    if (!c) return a + ' -';
    if (c.absent) return a + ' absent';
    const tag = c.ok ? 'OK ' : 'no ';
    const got = cfg.set === 'gsm8k' ? ' ' + String(c.got === null || c.got === undefined ? '-' : c.got).padStart(7) : '';
    return a + ' ' + tag + got + ' ' + (c.journal ? '(journal)' : String(r2((c.ms || 0) / 1000)).padStart(6) + 's') + (c.provenance ? ' [' + c.provenance + ']' : '');
  };
  const tally = cfg.arms.map((a) => {
    const cs = st.rows.map((r) => r.arms[a]).filter((c) => c && !c.absent);
    return a + ' ' + cs.filter((c) => c.ok).length + '/' + cs.length;
  }).join(' ');
  const msPer = st.taskMs.length ? mean(st.taskMs) : null;
  const left = total - (i + 1);
  const eta = msPer === null ? 'ETA ?' : r2(60000 / msPer) + ' tasks/min, ETA ' + fmtDuration(left * msPer);
  const head = String(i + 1).padStart(String(total).length) + '/' + total + ' ' + String(row.id).padEnd(cfg.set === 'humaneval' ? 34 : 14)
    + (cfg.set === 'gsm8k' ? ' gold ' + String(row.gold).padStart(7) : '');
  return head + ' | ' + row.order.split('>').map(cell).join(' | ') + '   [' + tally + '] ' + eta + (ranHere ? '' : ' (whole task from the journal)');
}

function printSummary(v) {
  console.log('\n' + 'arm'.padEnd(10) + 'n'.padStart(5) + 'correct'.padStart(9) + 'accuracy'.padStart(11) + '95% interval'.padStart(20) + 'mean ms'.padStart(12) + '  provenance');
  console.log('-'.repeat(90));
  for (const [a, s] of Object.entries(v.arms)) {
    if (s.absent) { console.log(a.padEnd(10) + 'absent: ' + s.reason); continue; }
    console.log(a.padEnd(10) + String(s.n).padStart(5) + String(s.correct).padStart(9) + pct(s.accuracy).padStart(11)
      + (pct(s.interval.lo) + ' to ' + pct(s.interval.hi)).padStart(20) + String(s.meanMs).padStart(12)
      + '  ' + (s.provenance ? Object.entries(s.provenance).map(([k, e]) => k + ' ' + e.correct + '/' + e.n).join(', ') : '')
      + (s.cappedAtMaxTokens > 0 ? (s.provenance ? '; ' : '') + 'capped ' + s.cappedAtMaxTokens + ' (wrong ' + s.cappedAndWrong + ')' : ''));
  }
  for (const [a, s] of Object.entries(v.arms)) {
    if (s.absent) continue;
    if (s.native) console.log('NATIVE ' + a + ': ' + nativeLine(s));
    if (a === 'organism' && v.nativeShareModelOff) console.log('NATIVE SHARE model off: ' + v.nativeShareModelOff.native + ' of ' + v.nativeShareModelOff.of + ' records = ' + pct(v.nativeShareModelOff.share) + ', ' + v.nativeShareModelOff.correct + ' correct among the native answers, ' + v.nativeShareModelOff.absent + ' absent (no native answer, no model)');
    if (s.regions) for (const [g, e] of Object.entries(s.regions)) console.log('REGION ' + a + ' ' + g + ': ' + e.n + ' records, ' + e.correct + ' correct, by provenance ' + Object.entries(e.byProvenance).map(([k, b]) => k + ' ' + b.correct + '/' + b.n).join(', ') + ', mean ' + e.meanCalls + ' model calls and ' + r2(e.meanModelMs / 1000) + ' s of model per record');
    if (s.splits) console.log('SPLIT ' + a + ': ' + splitLine('by split', s.splits));
  }
  if (v.twoRulers) console.log('two rulers: ' + v.twoRulers);
  if (v.etaWhole) console.log('ETA whole set: ' + v.etaWhole.arithmetic);
  if (v.sharedQueue) console.log('shared queue: ' + v.sharedQueue);
  console.log('');
  printPublished(v.published, v.set);
  if (v.ladder && v.ladder.row405B) console.log('the 405B row: ' + v.ladder.row405B.system + ' ' + v.ladder.row405B.benchmark + ' ' + v.ladder.row405B.score + ' (' + v.ladder.row405B.source + ')');
  console.log('\n' + v.statement + '\n');
}

// ---------------------------------------------------------------- cli
export const FLAGS = Object.freeze({
  set: 'string', seed: 'string', arms: 'string', model: 'string', base: 'string', route: 'string',
  journalDir: 'string', verdictDir: 'string',
  limit: 'number', budgetMs: 'number', rounds: 'number', maxTokens: 'number', regions: 'number', k: 'number', check: 'number',
  tag: 'string', name: 'string', 'wall-minutes': 'number', provider: 'string',
  limitMs: 'number', testMs: 'number', timeoutMs: 'number', memoryMB: 'number', probeMs: 'number',
  resume: 'bool', bar: 'bool', quiet: 'bool', json: 'bool', nowrite: 'bool', help: 'bool',
});

export const USAGE = [
  'node bench/public.mjs --set arc|humaneval|gsm8k [--limit N] [--seed public/1] [--resume] [--bar]',
  '                      [--arms organism,alone,null(,plan|repair)] [--model qwen3:1.7b] [--route region|direct]',
  '                      [--budgetMs 3000] [--rounds 3] [--maxTokens n] [--testMs ms] [--quiet] [--json] [--nowrite]',
  '                      [--regions 1] [--k 5] [--check 1] [--tag t] [--name n] [--wall-minutes M] [--provider null --tag t]',
  '--provider null (board 18 builder): the organism arm asks with the model cell null, no socket; a native answer is graded, any other is absent. It needs its own --tag (its own journal).',
  '',
  '--regions 1 (the default) sends the organism through the reasoning regions ask() carries: a GSM8K',
  'record reaches reason/math.mjs solveMath (k programs, verify when --check 1), a HumanEval record\'s',
  'own prompt reaches reason/synth.mjs synthesize (k candidates, repair when --check 1). --regions 0 is',
  'the organism before Board 11. --tag names the journal and the verdict (--tag 30b); --name names',
  'the verdict only (--name smoke writes public-<set>-smoke-partial.json from the journal a whole run',
  'resumes). A bar file already written is never written over.',
  '',
  '--limit 0 is the whole set. The sample is seeded and runs in the set\'s own order.',
  'Every graded arm result is journaled to bench/verdicts/public/<set>-<seed>.jsonl as it lands;',
  '--resume continues a killed run from that journal. --wall-minutes M stops the run cleanly',
  'before the next record once M minutes of tasks have passed, so --resume continues from it.',
  'The bar file bench/verdicts/public-<set>.json',
  'is written only when the whole set (or a sample declared with --bar) finished with every bar arm',
  'graded; every other write is bench/verdicts/public-<set>-partial.json with isTheBar false.',
  'ARC has one arm and no model: --model and --route do not apply to it.',
].join('\n');

export function args(argv) {
  const out = {}, bad = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { bad.push('stray argument ' + JSON.stringify(a)); continue; }
    const k = a.slice(2);
    const kind = FLAGS[k];
    if (!kind) { bad.push('unknown flag --' + k); continue; }
    const v = argv[i + 1];
    const bare = v === undefined || v.startsWith('--');
    if (kind === 'bool') { out[k] = true; continue; }
    if (bare) { bad.push('--' + k + ' needs a value'); continue; }
    i++;
    if (kind === 'number') {
      if (!/^-?\d+(\.\d+)?$/.test(v)) { bad.push('--' + k + ' needs a number, got ' + JSON.stringify(v)); continue; }
      out[k] = Number(v);
      continue;
    }
    out[k] = v;
  }
  return { opts: out, bad };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const parsed = args(argv);
  const a = parsed.opts;
  if (parsed.bad.length) {
    console.error('bench/public.mjs ran nothing, because of ' + parsed.bad.length + ': ' + parsed.bad.join('; ') + '\n\n' + USAGE);
    process.exitCode = 2;
  } else if (a.help || !a.set) {
    console.log(USAGE);
    if (!a.set && !a.help) process.exitCode = 2;
  } else {
    let v = null;
    try {
      v = await run({ ...a, argv, write: !a.nowrite });
    } catch (e) {
      console.error('bench/public.mjs stopped: ' + String((e && e.message) || e));
      process.exitCode = 2;
    }
    if (v) {
      if (a.json) console.log(JSON.stringify(v, null, 2));
      console.log('PUBLIC ' + v.set + (v.isTheBar ? ' (THE BAR)' : ' (partial)') + ': ' + v.statement + ' ' + v.ms + 'ms, '
        + (v.writtenTo ? 'verdict written to ' + v.writtenTo : 'nothing written (--nowrite)'));
      console.log('RATE ' + v.set + ': ' + (v.rate.tasksPerMinute === null ? 'no task ran in this process' : v.rate.tasksPerMinute + ' tasks per minute, ' + r2(v.rate.msPerTask / 1000) + ' s per task over ' + v.rate.tasksTimed + ' tasks run here, arms ' + v.rate.arms.join(',')));
    }
  }
}
