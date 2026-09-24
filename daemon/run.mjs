// daemon/run.mjs: the persistent process. One whole brain, built once into state/<name>/
// and resumed from there ever after, ticking on every timescale, checkpointing every N
// ticks, running the self-improvement loop in this process on a slow period, running
// organism generations in a worker, and letting an approved elite replace a region through
// the gate. The control plane makes `brain <op> <name>` and the viz server attach to the live
// organism. SIGINT ends with a clean checkpoint.
//
//   import { live } from './daemon/run.mjs'; await live({ name: 'whole', ticks: 200 })
//   brain live [name] [--ticks N] [--ledger summary|full --ledger-budget-mb N] ...
//
// THE LEDGER ON DISK (his P13: it lives 24/7, so nothing it writes may grow without bound).
// The disk policy is core/ledger.mjs's, registered here before the brain opens its ledger:
//   summary  THE DEFAULT. Every event still reaches the in-memory ring, the counts and the
//            listeners (the dream region reads them), but the file receives only the daemon's
//            own step and checkpoint rows and one counts row per flush. It rotates at a
//            budget too (64 MB unless one is given), keeping the last two segments.
//   full     every event, one line each, and ONLY with a budget: --ledger-budget-mb N (or the
//            ledgerBudgetMb option, BRAIN_LEDGER_BUDGET_MB, or a policy a supervisor already
//            registered). Without one the daemon writes the summary ledger and says why: the
//            old default was full with no budget, and an unbounded soak wrote a 1 TB ledger.
//
// THE LOOP (his P5: "5 percent every second... self growing self improving self compressing
// self iterating"). With loopEvery > 0 (the default for an unbounded run), every loopEvery
// ticks, and only when no ask is active (mind/dream.mjs askActive), one PERIOD runs:
//   generations  one generation of organism genomes in the generations worker
//                (generations/epochs.mjs), its elite promoted through the gate as before
//   dream        the Board 9 imagination region, on the same period (its own afterTick hook)
//   spawn        one suite question the last ruler found no held cell for is asked through
//                act/spawn.mjs on the live brain, so genome/spawn.mjs grows the circuit
//   ingest       (growth mode only) the next articles of the knowledge store become episodes
//   self-code    self/autopilot.mjs --auto in a worker, gated, at most once per selfCodeEvery
//                ticks, and never while another process holds a bench flag (state/bench-flags)
// Every step writes one 'daemon.step' ledger row with its wall milliseconds.
//
// THE RULER, at every checkpoint: the internal suites (bench/answer.mjs draws of algebra,
// sequence and grid, exact path only) scored twice: `exact`, what the exact path answers
// (a held spawn circuit, else act/solve.mjs), and `carried`, what the organism's OWN held
// cells carry (measured on a clone of the spawn region, so measuring never moves the brain).
// Improvement per wall second is score now minus score at the last checkpoint over the wall
// seconds between them. A PlateauRuler per coordinate (the rule of generations/velocity.mjs)
// switches the loop from generations to growth when a coordinate below its ceiling stops
// moving, and back after 2 x patience checkpoints of growth, with fresh rulers.
// Each row rides in the checkpoint header (core/persist.mjs readCheckpointHeader) and in
// state/<name>/ruler.jsonl with its wall time, tick, scores and bytes, so every printed rate
// is reproducible from disk (readRuler + rulerRates below).
//
// THE EXCHANGE HOOK (his P15, daemon/multiply.mjs). opts.onCheckpoint, when a function, is
// called after every checkpoint (kinds built, checkpoint, final) has been written, with
// { kind, t, done, bytes, dir, name }. daemon/multiply.mjs uses it to trade plane elites with
// the other instances of a population at every checkpoint. A throw is counted in the payload's
// exchange.errors and never stops the organism; opts.instance (an id) rides in the payload.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync, statSync, appendFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { layout, ensureDirs, writeMeta } from '../cli/state.mjs';
import { connect, startControl } from '../cli/control.mjs';
import { makeRunner } from '../cli/run.mjs';
import { ops } from '../cli/ops.mjs';
import { buildWhole, restoreWhole, timescaleReport, applyRegionGenes, printable, periodLabel, ORGANISM_REGIONS } from '../seeds/whole.mjs';
import { closeWorld } from '../world/index.mjs';
import { defaultOrganismGenome } from '../generations/organism-genome.mjs';
import { attachDream } from '../mind/dream.mjs';
import { askActive, encodeWords } from '../mind/dream.mjs';
import { setLedgerPolicy, clearLedgerPolicy, ledgerPolicy } from '../core/ledger.mjs';
import { readCheckpointHeader } from '../core/persist.mjs';
import * as S from '../core/signal.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BRAIN_ROOT = path.resolve(HERE, '..');
/** Where a bench says it is running: one <pid>.json per bench process. */
export const BENCH_FLAG_DIR = path.join(BRAIN_ROOT, 'state', 'bench-flags');
export const SUITES = Object.freeze(['algebra', 'sequence', 'grid']);
export const STEP_KINDS = Object.freeze(['generations', 'dream', 'spawn', 'ingest', 'self-code']);
export const LEDGER_LEVELS = Object.freeze(['full', 'summary', 'runs', 'off']);
const MB = 1024 * 1024;

export const DEFAULTS = Object.freeze({
  name: 'whole', majors: 200, substrateUnits: 10_000, seed: 'whole', checkpointEvery: 1000,
  selfEvery: 20_000, genEvery: 100_000, selfCandidates: 4, selfTrialTicks: 48, genPopSize: 6, genTicks: 96,
  ledger: 'summary', summaryBudgetMb: 64, loopEvery: 200, selfCodeEvery: 20_000, selfCodeMax: 5,
  suiteTasks: 12, plateauPatience: 3, plateauEpsilon: 1e-9, ingestBatch: 32,
  genHeapMb: 1536, selfCodeHeapMb: 1024, rulerBudgetMb: 16, stopWaitMs: 30_000,
  // Board 14: minutes of an unattended soak per self-code step (0: one Board 10 pass, as before)
  selfCodeSoak: 0,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jsonSafe = (v) => JSON.parse(JSON.stringify(v, (k, x) => (typeof x === 'bigint' ? String(x) : x instanceof Map ? Object.fromEntries(x) : x instanceof Set ? [...x] : ArrayBuffer.isView(x) ? Array.from(x) : x)));
const askCountOf = (brain) => { const c = brain.ledger && brain.ledger.counts; return c && typeof c.get === 'function' ? (c.get('act.ask') || 0) : 0; };
const firstLine = (e) => String(e && e.message || e).split('\n')[0];
const r3 = (x) => Math.round(x * 1e3) / 1e3;
const r6 = (x) => Math.round(x * 1e6) / 1e6;
const sizeOf = (f) => { try { return statSync(f).size; } catch { return 0; } };
const fmt = (n) => Number(n).toLocaleString('en-US');

function shape(brain) { return { t: brain.clock.t, cells: brain.cells.length, edges: brain.connectome.size(), liveEdges: brain.connectome.live() }; }

/**
 * Snapshot, flush and write meta. `ruler` (a ruler row) rides in the container 2 header.
 * @returns {object} the brain's shape, plus `bytes`, the checkpoint file's size
 */
export function checkpoint(brain, L, name, extra = {}, { ruler = null } = {}) {
  brain.snapshot(L.dir, ruler ? { ruler } : {});
  if (brain.ledger && typeof brain.ledger.flush === 'function') brain.ledger.flush();
  const header = brain.lastCheckpoint || null;
  const bytes = header && Number.isFinite(header.bytes) ? header.bytes : sizeOf(L.snapshot);
  writeMeta(name, { name, kind: 'whole', savedAt: new Date().toISOString(), ...shape(brain), checkpointBytes: bytes, ...extra });
  return { ...shape(brain), bytes };
}

// ---------------------------------------------------------------- the ledger policy
function budgetArg(argv) {
  for (let i = 0; i < argv.length; i++) {
    const a = String(argv[i]);
    if (a === '--ledger-budget-mb') return argv[i + 1];
    if (a.startsWith('--ledger-budget-mb=')) return a.slice('--ledger-budget-mb='.length);
  }
  return undefined;
}

/**
 * What the daemon logs (level) and what reaches the disk (mode, budget), from the options,
 * the command line, the environment, or a policy a supervisor registered for this directory.
 * @returns {{asked, level, mode, budgetMb, budgetBytes, budgetFrom, downgraded}}
 */
export function ledgerOptions(opts = {}, { argv = process.argv, env = process.env, dir = null } = {}) {
  const asked = opts.ledger === true ? 'full' : (opts.ledger || DEFAULTS.ledger);
  if (!LEDGER_LEVELS.includes(asked)) throw new Error('live: ledger must be one of ' + LEDGER_LEVELS.join(', ') + ', got ' + asked);
  const level = opts.ledgerLevel || (asked === 'runs' || asked === 'off' ? asked : 'full');
  const pre = dir ? ledgerPolicy(dir) : null;
  const tries = [[opts.ledgerBudgetMb, 'the ledgerBudgetMb option'], [budgetArg(argv), '--ledger-budget-mb'], [env.BRAIN_LEDGER_BUDGET_MB, 'BRAIN_LEDGER_BUDGET_MB'], [pre && pre.budgetBytes > 0 ? pre.budgetBytes / MB : undefined, 'the policy registered for ' + dir]];
  let budgetMb = null, budgetFrom = null;
  for (const [v, from] of tries) {
    if (v === undefined || v === null || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) { budgetMb = n; budgetFrom = from; break; }
  }
  let mode = asked === 'full' ? 'full' : 'summary', downgraded = null;
  if (mode === 'full' && !budgetMb) {
    mode = 'summary';
    downgraded = 'ledger=full needs --ledger-budget-mb N (an unbounded full ledger once wrote 1 TB); writing the summary ledger instead';
  }
  if (!budgetMb) { budgetMb = DEFAULTS.summaryBudgetMb; budgetFrom = 'the summary default'; }
  return { asked, level, mode, budgetMb, budgetBytes: Math.floor(budgetMb * MB), budgetFrom, downgraded };
}

// ---------------------------------------------------------------- bench flags
function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch (e) { return !!(e && e.code === 'EPERM'); } }

/** Say that a bench is running: other daemons refuse their self-code step until it is lowered. */
export function raiseBenchFlag({ dir = BENCH_FLAG_DIR, command = process.argv.slice(1).join(' '), pid = process.pid } = {}) {
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, pid + '.json');
  writeFileSync(file, JSON.stringify({ pid, command, at: new Date().toISOString() }) + '\n');
  return { file, pid, lower: () => { try { rmSync(file, { force: true }); } catch { /* already gone */ } } };
}

/**
 * The first flag raised by a live process other than selfPid, or null. A dead pid's flag is
 * stale: a bench that was killed never ran its finally, so its flag is removed here, before
 * Windows can hand the pid to an unrelated process that would hold self-code off forever.
 */
export function benchFlag({ dir = BENCH_FLAG_DIR, selfPid = process.pid } = {}) {
  let names;
  try { names = readdirSync(dir); } catch { return null; }
  for (const n of names.sort()) {
    if (!n.endsWith('.json')) continue;
    let j;
    try { j = JSON.parse(readFileSync(path.join(dir, n), 'utf8')); } catch { continue; }
    const pid = Number(j && j.pid);
    if (!Number.isInteger(pid) || pid <= 0 || pid === selfPid) continue;
    if (!pidAlive(pid)) { try { rmSync(path.join(dir, n), { force: true }); } catch { /* another reader swept it */ } continue; }
    return { pid, command: j.command || null, at: j.at || null, file: path.join(dir, n) };
  }
  return null;
}

// ---------------------------------------------------------------- the ruler on disk
export const RULER_FILE = 'ruler.jsonl';
function appendRotating(file, line, budgetBytes) {
  const bytes = Buffer.byteLength(line);
  if (budgetBytes > 0) {
    const size = sizeOf(file);
    if (size > 0 && size + bytes > Math.floor(budgetBytes / 2)) {
      const prev = file.replace(/\.jsonl$/, '') + '.1.jsonl';
      try { rmSync(prev, { force: true }); renameSync(file, prev); } catch { /* the next row tries again */ }
    }
  }
  appendFileSync(file, line);
}

/** Every ruler row a brain directory holds (both segments), in checkpoint order. */
export function readRuler(dir) {
  const rows = [];
  for (const f of [path.join(dir, 'ruler.1.jsonl'), path.join(dir, RULER_FILE)]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try { rows.push(JSON.parse(line)); } catch { /* a torn last line */ }
    }
  }
  return rows.sort((a, b) => (a.atMs - b.atMs) || (a.k - b.k));
}

const frac = (row, key) => (row && row.total && row.total.n > 0 ? row.total[key] / row.total.n : 0);
/** One step of the ruler: score now minus score at the previous row, over the wall seconds between them. */
export function rulerStep(prev, row) {
  if (!prev || !row) return null;
  const seconds = (row.atMs - prev.atMs) / 1000;
  const ticks = row.done - prev.done;
  const per = (key) => (seconds > 0 ? r6((frac(row, key) - frac(prev, key)) / seconds) : null);
  const ledgerBytes = row.bytes && prev.bytes ? row.bytes.ledgerWritten - prev.bytes.ledgerWritten : null;
  return {
    fromK: prev.k, toK: row.k, seconds: r3(seconds), ticks,
    exact: per('exact'), carried: per('carried'),
    exactDelta: r6(frac(row, 'exact') - frac(prev, 'exact')), carriedDelta: r6(frac(row, 'carried') - frac(prev, 'carried')),
    ledgerBytes, ledgerBytesPer1000Ticks: ticks > 0 && ledgerBytes !== null ? Math.round(ledgerBytes / ticks * 1000) : null,
  };
}
/** Every step and the whole run, recomputed from rows alone (readRuler gives them from disk). */
export function rulerRates(rows) {
  const rs = rows.filter((r) => r && r.total && Number.isFinite(r.atMs));
  const steps = [];
  for (let i = 1; i < rs.length; i++) if (rs[i].run === rs[i - 1].run) steps.push(rulerStep(rs[i - 1], rs[i]));
  const first = rs[0] || null, last = rs[rs.length - 1] || null;
  return { rows: rs.length, steps, whole: first && last && first !== last ? rulerStep(first, last) : null };
}

// ---------------------------------------------------------------- the plateau signal
/** The coordinates a row carries: each suite's carried fraction, and the generations best. */
export function coordinatesOf(row) {
  const out = {};
  for (const s of SUITES) {
    const sc = row && row.scores ? row.scores[s] : null;
    // the ceiling is the suite's reach: the items whose plan has circuits AND that the exact
    // path answers. A spawned circuit runs the solver's own operations, so an item the exact
    // path gets wrong is out of reach, and a suite at its reach is finished, not stuck (the bar
    // of 2026-09-24 sat at grid 159 of 160 and fired carried.grid on every arm, 11 switches).
    // A row from before reach existed uses n.
    if (sc) { const top = Number.isFinite(sc.reach) ? sc.reach : sc.n; out['carried.' + s] = { value: sc.n ? sc.carried / sc.n : 0, ceiling: sc.n > 0 && sc.carried >= top }; }
  }
  const g = row && row.generations ? row.generations.best : null;
  out['generations.best'] = { value: Number.isFinite(g) ? g : null, ceiling: false };
  return out;
}

/**
 * The loop's mode as a pure function of the ruler rows: a PlateauRuler per coordinate (the
 * class generations/velocity.mjs exports, passed in), observed once per row. A coordinate at
 * its ceiling is finished, not stuck, and never fires. Generations switch to growth when any
 * coordinate fires; growth switches back after 2 x patience rows, with fresh rulers.
 */
export class LoopPlateau {
  constructor({ Ruler, patience = DEFAULTS.plateauPatience, epsilon = DEFAULTS.plateauEpsilon } = {}) {
    if (typeof Ruler !== 'function') throw new Error('LoopPlateau: pass the PlateauRuler class of generations/velocity.mjs');
    this.Ruler = Ruler; this.patience = patience; this.epsilon = epsilon;
    this.rulers = {}; this.ceiling = {}; this.mode = 'generations'; this.growthSince = null; this.arm = 0; this.switches = [];
  }
  observe(row) {
    const fired = [];
    for (const [name, c] of Object.entries(coordinatesOf(row))) {
      if (c.value === null) continue;
      if (c.ceiling) { this.ceiling[name] = row.k; continue; }
      delete this.ceiling[name];
      const r = this.rulers[name] || (this.rulers[name] = new this.Ruler({ epsilon: this.epsilon, patience: this.patience }));
      r.observe(row.k, c.value);
      if (r.fired) fired.push(name);
    }
    if (this.mode === 'generations' && fired.length) {
      this.mode = 'growth'; this.growthSince = row.k;
      this.switches.push({ k: row.k, t: row.t, to: 'growth', why: fired.join(', ') + ' stopped moving (' + this.patience + ' checkpoints within ' + this.epsilon + ')' });
    } else if (this.mode === 'growth' && row.k - this.growthSince >= 2 * this.patience) {
      this.mode = 'generations'; this.growthSince = null; this.rulers = {}; this.arm++;
      this.switches.push({ k: row.k, t: row.t, to: 'generations', why: 'growth ran ' + (2 * this.patience) + ' checkpoints; rulers re-armed' });
    }
    return this.state();
  }
  state() {
    const coords = {};
    for (const [name, r] of Object.entries(this.rulers)) coords[name] = { fired: r.fired, firedAt: r.firedAt, ref: r.ref === -Infinity ? null : r6(r.ref), lastImprovement: r.lastImprovementGen, observed: r.observed };
    for (const [name, k] of Object.entries(this.ceiling)) coords[name] = { ceiling: true, since: k };
    return { mode: this.mode, arm: this.arm, patience: this.patience, epsilon: this.epsilon, growthSince: this.growthSince, fired: Object.entries(coords).filter(([, v]) => v.fired).map(([k]) => k), coords, switchCount: this.switches.length, switches: this.switches.slice(-8) };
  }
}

/** Replay rows from disk into a LoopPlateau: the state a resumed daemon continues from. */
export async function replayPlateau(rows, opts = {}) {
  const { PlateauRuler } = await import('../generations/velocity.mjs');
  const p = new LoopPlateau({ Ruler: PlateauRuler, ...opts });
  let last = null;
  for (const r of rows) if (r && r.scores) last = p.observe(r);
  return { plateau: p, state: last || p.state() };
}

// ---------------------------------------------------------------- the suites, exact path only
export async function loopModules() {
  const [velocity, act, genome, solveMod, answer, clone, prompt, knowledge] = await Promise.all([
    import('../generations/velocity.mjs'), import('../act/spawn.mjs'), import('../genome/spawn.mjs'), import('../act/solve.mjs'),
    import('../bench/answer.mjs'), import('../simulate/clone.mjs'), import('../act/prompt.mjs'), import('../memory/knowledge.mjs'),
  ]);
  return {
    PlateauRuler: velocity.PlateauRuler, spawnAsk: act.spawnAsk, plan: genome.plan, holds: genome.holds, regionCells: genome.regionCells, SPAWN_REGION: genome.SPAWN_REGION,
    solve: solveMod.solve, renderSolved: solveMod.renderSolved, buildQuestions: answer.buildQuestions, gradeAnswer: answer.gradeAnswer,
    cloneSub: clone.cloneSub, keywords: prompt.keywords, knowledgeReady: prompt.knowledgeReady, KNOWLEDGE_DIR: prompt.KNOWLEDGE_DIR, KnowledgeStore: knowledge.KnowledgeStore,
  };
}

/**
 * The suite ruler: bench/answer.mjs draws of algebra, sequence and grid. `carried` asks each
 * question of a CLONE of the spawn region and counts it only when held cells answered it with
 * nothing grown; `exact` is that answer, else act/solve.mjs (a pure function of the prompt,
 * so its verdict per question is computed once and kept).
 */
export function makeSuiteRuler(M, { tasks = DEFAULTS.suiteTasks, seed = null } = {}) {
  const questions = M.buildQuestions({ tasksPerSuite: tasks, seed }).filter((q) => SUITES.includes(q.source));
  const growable = new Map(questions.map((q) => [q.id, M.plan(q.q).circuits.length > 0]));
  const planned = {};
  for (const s of SUITES) planned[s] = questions.filter((q) => q.source === s && growable.get(q.id)).length;
  const solved = new Map();
  return {
    questions, growable, planned,
    measure(brain) {
      const t0 = performance.now();
      const scores = {};
      for (const s of SUITES) scores[s] = { n: 0, exact: 0, carried: 0, reach: 0 };
      const missing = [];
      let clone = null, cloneMs = 0;
      if (M.regionCells(brain) > 0) { const c0 = performance.now(); clone = M.cloneSub(brain, { region: M.SPAWN_REGION, name: brain.name + '.ruler', seed: 'daemon.ruler' }); cloneMs = performance.now() - c0; }
      for (const q of questions) {
        const sc = scores[q.source];
        sc.n++;
        let carried = false;
        if (clone && M.plan(q.q).circuits.some((c) => M.holds(clone, c))) {
          try {
            const r = M.spawnAsk(clone, q.q, { by: 'daemon.ruler', keptCells: 0 });
            carried = !!(r.answer && r.record.cellsSpawned === 0 && r.record.incumbents > 0 && M.gradeAnswer(r.answer.text, q).ok);
          } catch { carried = false; }
        }
        if (!solved.has(q.id)) {
          let ok = false;
          try { const s = M.solve(q.q); ok = !!(s && M.gradeAnswer(M.renderSolved(s), q).ok); } catch { ok = false; }
          solved.set(q.id, ok);
        }
        if (carried) sc.carried++;
        // only an item the exact path answers is offered to spawn: a circuit runs the solver's
        // own operations, so one the exact path gets wrong would be retried every checkpoint
        else if (growable.get(q.id) && solved.get(q.id)) missing.push(q);
        if (carried || solved.get(q.id)) { sc.exact++; if (growable.get(q.id)) sc.reach++; }
      }
      const total = { n: 0, exact: 0, carried: 0 };
      for (const s of SUITES) { total.n += scores[s].n; total.exact += scores[s].exact; total.carried += scores[s].carried; }
      return { scores, total, missing, ms: r3(performance.now() - t0), cloneMs: r3(cloneMs), spawnCells: M.regionCells(brain) };
    },
  };
}

// ---------------------------------------------------------------- generations in a worker
class GenerationsWorker {
  constructor({ dir, seed, popSize, ticks, heapMb = DEFAULTS.genHeapMb }) {
    this.dir = dir; this.seed = seed; this.popSize = popSize; this.ticks = ticks; this.heapMb = heapMb;
    this.worker = null; this.pending = new Map(); this.seq = 0; this.steps = 0; this.last = null; this.error = null;
  }
  async start() {
    this.worker = new Worker(new URL('./generations-worker.mjs', import.meta.url), { workerData: { dir: this.dir, seed: this.seed, popSize: this.popSize, ticks: this.ticks }, resourceLimits: { maxOldGenerationSizeMb: this.heapMb } });
    this.worker.on('message', (m) => { const p = this.pending.get(m.id); if (!p) return; this.pending.delete(m.id); if (m.ok) p.res(m); else p.rej(new Error(m.error)); });
    this.worker.on('error', (e) => { this.error = String(e && e.message || e); for (const p of this.pending.values()) p.rej(e); this.pending.clear(); });
    this.worker.on('exit', () => { for (const p of this.pending.values()) p.rej(new Error('generations worker exited')); this.pending.clear(); });
    const r = await this.call('boot');
    this.boot = r.boot;
    return r.boot;
  }
  call(op, args = {}) {
    return new Promise((res, rej) => { const id = ++this.seq; this.pending.set(id, { res, rej }); this.worker.postMessage({ id, op, ...args }); });
  }
  async step() { const r = await this.call('step'); this.steps++; this.last = r; return r; }
  async stop() {
    if (!this.worker) return;
    try { await Promise.race([this.call('stop'), sleep(2000)]); } catch { /* the worker is gone */ }
    try { await this.worker.terminate(); } catch { /* already terminated */ }
    this.worker = null;
  }
}
export { GenerationsWorker };

// The self-code worker: self/autopilot.mjs runFromCli (what `brain self-code --auto` runs) in
// its own thread, so a gate or a verification that takes minutes never stalls the ticks.
const SELF_CODE_WORKER = [
  "const { parentPort, workerData } = require('node:worker_threads');",
  'import(workerData.url).then((m) => {',
  '  let r;',
  '  try { r = m.runFromCli(workerData.opts); } catch (e) { parentPort.postMessage({ ok: false, error: String(e && e.stack || e) }); return; }',
  '  parentPort.postMessage({ ok: true, result: { ok: r.ok, reason: r.reason || null, dry: r.dry, candidates: r.candidates, counts: r.counts || null, sources: r.sources ? Object.keys(r.sources) : [], author: !!(r.author && r.author.on), exitCode: r.exitCode, ledgerFile: r.ledgerFile || null } });',
  '}).catch((e) => parentPort.postMessage({ ok: false, error: String(e && e.stack || e) }));',
].join('\n');

// The region whose genes stray furthest from the default organism genome is the one the
// elite differs in, so it is the region the elite replaces.
export function pickRegion(brain, genome) {
  const base = defaultOrganismGenome({ majors: genome.scale ? genome.scale.majors : 64 }).regions;
  let best = null, bestD = -1;
  for (const name of ORGANISM_REGIONS) {
    if (!brain.regions.has(name)) continue;
    const g = genome.regions && genome.regions[name], b = base[name];
    if (!g || !b) continue;
    let d = Math.abs((g.learnProb || 0) - (b.learnProb || 0)) + Math.abs((g.delayScale || 1) - (b.delayScale || 1));
    const keys = new Set([...Object.keys(g.periodMix || {}), ...Object.keys(b.periodMix || {})]);
    for (const k of keys) d += Math.abs(((g.periodMix || {})[k] || 0) - ((b.periodMix || {})[k] || 0));
    if (d > bestD) { bestD = d; best = name; }
  }
  return { region: best, distance: bestD };
}

export function promoteElite(brain, result, state) {
  const best = result && result.best;
  if (!best || !best.genome) return null;
  if (state.lastElite === best.id + ':' + best.fitness) return null;
  state.lastElite = best.id + ':' + best.fitness;
  const row = result.row || {};
  const control = state.lastPromotedFitness != null ? state.lastPromotedFitness : (typeof row.genMean === 'number' ? row.genMean : 0);
  const gain = best.fitness - control;
  const { region } = pickRegion(brain, best.genome);
  if (!region) return null;
  const p = brain.gate.propose({
    kind: 'genome.promote', by: 'daemon.generations',
    what: { region, elite: best.id, key: best.key, fitness: best.fitness, gen: best.gen },
    why: 'elite ' + best.id + ' (fitness ' + best.fitness + ') against control ' + control + ' replaces region ' + region,
    evidence: { gain, beatControl: gain > 0, control, fitness: best.fitness, generation: row.gen },
  }, { t: brain.clock.t, gen: brain.clock.gen });
  const out = { t: brain.clock.t, region, elite: best.id, fitness: best.fitness, control, gain, proposal: p.id, status: p.status, applied: null };
  if (p.status === 'approved') { out.applied = applyRegionGenes(brain, region, best.genome); state.lastPromotedFitness = best.fitness; }
  return out;
}

// ---------------------------------------------------------------- the persistent process
export async function live(opts = {}) {
  const name = opts.name || DEFAULTS.name;
  const majors = opts.majors ?? DEFAULTS.majors, substrateUnits = opts.substrateUnits ?? DEFAULTS.substrateUnits, seed = opts.seed ?? DEFAULTS.seed;
  const ticks = opts.ticks === undefined || opts.ticks === null ? Infinity : opts.ticks;
  const bounded = Number.isFinite(ticks);
  const wallMs = Number(opts.wallMs) > 0 ? Number(opts.wallMs) : 0;
  const checkpointEvery = opts.checkpointEvery ?? DEFAULTS.checkpointEvery;
  const loopEvery = Math.max(0, Math.floor(opts.loopEvery ?? (bounded ? 0 : DEFAULTS.loopEvery)));
  const loopOn = loopEvery > 0;
  const selfEvery = opts.selfEvery ?? (bounded ? 0 : DEFAULTS.selfEvery);
  // with the loop on, generations run once per period and the old slow trigger is off
  const genEvery = loopOn ? 0 : (opts.genEvery ?? (bounded ? 0 : DEFAULTS.genEvery));
  const rulerOn = opts.ruler ?? loopOn;
  const mode = opts.mode || 'fast', precision = opts.precision || 'timer';
  const out = typeof opts.out === 'function' ? opts.out : null;
  const say = (line) => { if (out) out(line); };

  const L = layout(name);
  ensureDirs(name);
  const already = await connect(L.dir);
  if (already) throw new Error('brain "' + name + '" is already running at ' + already.info.url + ' (pid ' + already.info.pid + '). Use: brain stop ' + name);

  // the disk policy is registered before the brain opens its ledger in L.ledgerDir, and the
  // policy that was there before (a supervisor's) is put back when this run ends
  const priorPolicy = ledgerPolicy(L.ledgerDir);
  const led = ledgerOptions(opts, { dir: L.ledgerDir });
  setLedgerPolicy(L.ledgerDir, { mode: led.mode, budgetBytes: led.budgetBytes });
  const restorePolicy = () => { if (priorPolicy) setLedgerPolicy(L.ledgerDir, priorPolicy); else clearLedgerPolicy(L.ledgerDir); };

  const t0 = Date.now();
  let brain, report, built;
  try {
    if (existsSync(L.snapshot)) {
      ({ brain, report } = restoreWhole(L.dir, { ledger: led.level }));
      built = false;
    } else {
      ({ brain, report } = buildWhole({ majors, seed, substrateUnits, world: opts.world || null, name, dir: L.dir, ledger: led.level, mindBytes: opts.mindBytes, growth: opts.growth }));
      built = true;
    }
  } catch (e) { restorePolicy(); throw e; }
  const ledger = brain.ledger;
  ledger.configure({ mode: led.mode, budgetBytes: led.budgetBytes });
  const loadMs = Date.now() - t0;
  const start = shape(brain);
  const startRows = timescaleReport(brain);
  const startRuns = new Map(brain.cells.map((c) => [c.id, { runs: c.stats.runs, fired: c.stats.fired }]));
  let checkpoints = 0, checkpointErrors = 0, lastCheckpointError = null, checkpointBytes = 0, lastCheckpointBytes = 0;
  // the exchange hook (daemon/multiply.mjs): called after each checkpoint lands, never fatal
  const exchangeHook = typeof opts.onCheckpoint === 'function' ? opts.onCheckpoint : null;
  const exchange = { calls: 0, errors: [] };

  // ------------------------------------------------ the loop's modules, state and ruler
  const M = loopOn || rulerOn ? await loopModules() : null;
  const runId = new Date(t0).toISOString() + ':' + process.pid;
  const priorRows = rulerOn ? readRuler(L.dir) : [];
  const priorMeta = (() => { try { return JSON.parse(readFileSync(L.meta, 'utf8')); } catch { return null; } })();
  const priorLoop = priorMeta && priorMeta.daemon && priorMeta.daemon.loop ? priorMeta.daemon.loop : null;
  const patience = opts.plateauPatience ?? DEFAULTS.plateauPatience, epsilon = opts.plateauEpsilon ?? DEFAULTS.plateauEpsilon;
  let plateau = null;
  if (rulerOn) plateau = (await replayPlateau(priorRows, { patience, epsilon })).plateau;
  const suite = rulerOn ? makeSuiteRuler(M, { tasks: opts.suiteTasks ?? DEFAULTS.suiteTasks, seed: opts.suiteSeed ?? null }) : null;
  const rulerFile = path.join(L.dir, RULER_FILE);
  const rulerBudget = Math.floor((opts.rulerBudgetMb ?? DEFAULTS.rulerBudgetMb) * MB);
  const ruler = { rows: 0, first: null, last: null, prev: priorRows.length ? priorRows[priorRows.length - 1] : null, nextK: priorRows.length ? priorRows[priorRows.length - 1].k + 1 : 0, missing: [], errors: [], ms: 0 };
  const loop = {
    every: loopEvery, mode: plateau ? plateau.mode : 'generations', periods: 0, skippedForAsk: 0, lastAskReason: null,
    steps: Object.fromEntries(STEP_KINDS.map((k) => [k, 0])), stepMs: Object.fromEntries(STEP_KINDS.map((k) => [k, 0])),
    refused: Object.fromEntries(STEP_KINDS.map((k) => [k, 0])), refusals: [], busy: { generations: 0, 'self-code': 0 },
    dream: { every: 0, dreamed: 0, skipped: 0, why: {}, ownAsks: 0 }, spawn: { carried: 0, declined: 0, correct: 0, grew: 0, kept: 0, tried: new Set() },
    ingest: { cursor: priorLoop && Number.isInteger(priorLoop.ingestCursor) ? priorLoop.ingestCursor : 0, added: 0, of: null, store: null, reason: null },
    selfCode: { every: Math.max(0, Math.floor(opts.selfCodeEvery ?? DEFAULTS.selfCodeEvery)), lastT: brain.clock.t, dry: opts.selfCodeDry === true, last: null, errors: [] },
    errors: [],
  };
  const benchFlagDir = opts.benchFlagDir || BENCH_FLAG_DIR;
  const stepDone = (kind, ms, detail = {}) => {
    if (detail.refused) { loop.refused[kind]++; loop.refusals.push({ kind, t: brain.clock.t, why: detail.refused }); if (loop.refusals.length > 16) loop.refusals.shift(); }
    else { loop.steps[kind]++; loop.stepMs[kind] += ms; }
    try { ledger.note({ type: 'daemon.step', kind, t: brain.clock.t, mode: loop.mode, ms: r3(ms), ...detail }); } catch (e) { loop.errors.push('note: ' + firstLine(e)); }
  };

  // one ruler row: measure, observe the plateau, then (by the caller) snapshot with the row in its header
  const genState = { worker: null, steps: 0, promotions: [], errors: [], boot: null, lastElite: null, lastPromotedFitness: null, best: null };
  let runner = null;
  const measureRow = (kind) => {
    const m = suite.measure(brain);
    ruler.ms += m.ms;
    ruler.missing = m.missing; loop.spawn.tried.clear();
    const row = {
      source: 'daemon', kind, run: runId, k: ruler.nextK++, at: new Date().toISOString(), atMs: Date.now(), wallMs: Date.now() - t0,
      t: brain.clock.t, done: runner ? runner.state.done : 0,
      score: m.total.exact, of: m.total.n, carried: m.total.carried, scores: m.scores, total: m.total,
      generations: { steps: genState.steps, best: genState.best ? genState.best.fitness : null },
      spawnCells: m.spawnCells, rulerMs: m.ms, tasksPerSuite: opts.suiteTasks ?? DEFAULTS.suiteTasks,
    };
    const st = plateau.observe(row);
    if (st.mode !== loop.mode) say('[loop] mode ' + loop.mode + ' -> ' + st.mode + ' at checkpoint ' + row.k + ': ' + (st.switches.length ? st.switches[st.switches.length - 1].why : ''));
    loop.mode = st.mode;
    row.mode = st.mode; row.plateau = { mode: st.mode, arm: st.arm, fired: st.fired, coords: st.coords };
    return row;
  };
  const finishRow = (row, ck) => {
    const ls = ledger.stats();
    row.bytes = { snapshot: ck ? ck.bytes : sizeOf(L.snapshot), ledgerWritten: ls.bytesWritten, ledgerFile: ls.fileBytes, ledgerDisk: ls.diskBytes, ledgerRotations: ls.rotations };
    row.loop = { mode: loop.mode, periods: loop.periods, steps: { ...loop.steps }, refused: { ...loop.refused }, ingestCursor: loop.ingest.cursor };
    const prevSameRun = ruler.prev && ruler.prev.run === row.run ? ruler.prev : null;
    row.step = rulerStep(prevSameRun, row);
    try { appendRotating(rulerFile, JSON.stringify(row) + '\n', rulerBudget); } catch (e) { ruler.errors.push('append: ' + firstLine(e)); }
    ruler.rows++; if (!ruler.first) ruler.first = row; ruler.last = row; ruler.prev = row;
    const sc = SUITES.map((s) => s + ' ' + row.scores[s].exact + '/' + row.scores[s].n + ' carried ' + row.scores[s].carried).join(', ');
    const fired = row.plateau.fired.length ? row.plateau.fired.join(',') + ' fired' : 'none fired';
    say('[ruler] k=' + row.k + ' ' + row.kind + ' t=' + row.t + ' done=' + row.done + ' wall ' + r3(row.wallMs / 1000) + ' s | exact ' + row.total.exact + '/' + row.total.n + ' carried ' + row.total.carried + '/' + row.total.n + ' | ' + sc
      + (row.step ? ' | per wall s since k=' + row.step.fromK + ': exact ' + row.step.exact + ', carried ' + row.step.carried : '') + ' | mode ' + row.mode + ' | plateau ' + fired + ' | ' + row.rulerMs + ' ms');
    if (row.step) say('[ledger] ' + ls.mode + ': ' + fmt(row.step.ledgerBytes) + ' B over ' + row.step.ticks + ' ticks = ' + fmt(row.step.ledgerBytesPer1000Ticks ?? 0) + ' B per 1000 ticks, file ' + fmt(ls.fileBytes) + ' B, disk ' + fmt(ls.diskBytes) + ' B, rotations ' + ls.rotations + ', checkpoint ' + fmt(row.bytes.snapshot) + ' B');
    return row;
  };
  // a checkpoint through the daemon: ruler row, one ledger row, snapshot with the row in its header, meta, ruler.jsonl
  const daemonCheckpoint = (kind, extra = {}) => {
    let row = null;
    // a final checkpoint on the tick of the last autosave measures nothing new: no row, so the
    // plateau never observes a zero tick interval as a coordinate that stopped moving
    const repeat = kind === 'final' && ruler.last && ruler.last.run === runId && runner && ruler.last.done === runner.state.done;
    if (rulerOn && !repeat) {
      try { row = measureRow(kind); } catch (e) { ruler.errors.push(kind + ' t=' + brain.clock.t + ': ' + firstLine(e)); row = null; }
    }
    if (row) { try { ledger.note({ type: 'daemon.checkpoint', k: row.k, kind, t: row.t, done: row.done, wallMs: row.wallMs, score: row.score, of: row.of, carried: row.carried, mode: row.mode }); ledger.flush(); } catch (e) { loop.errors.push('note: ' + firstLine(e)); } }
    const src = row || (repeat ? ruler.last : null);
    const headerRow = src ? { ...src, bytes: undefined, loop: undefined, step: undefined, ledger: { mode: ledger.mode, written: ledger.bytesWritten, file: ledger.fileBytes, rotations: ledger.rotations } } : null;
    const ck = checkpoint(brain, L, name, { ...extra, daemon: row ? { k: row.k, run: row.run, loop: { mode: loop.mode, ingestCursor: loop.ingest.cursor } } : undefined }, { ruler: headerRow });
    checkpointBytes += ck.bytes; lastCheckpointBytes = ck.bytes;
    if (row) finishRow(row, ck);
    if (exchangeHook) {
      try { exchangeHook({ kind, t: brain.clock.t, done: runner ? runner.state.done : 0, bytes: ck.bytes, dir: L.dir, name }); exchange.calls++; }
      catch (e) { exchange.errors.push(kind + ' t=' + brain.clock.t + ': ' + firstLine(e)); if (exchange.errors.length > 16) exchange.errors.shift(); }
    }
    return ck;
  };

  if (built) { daemonCheckpoint('built', { built: true }); checkpoints++; }
  else if (rulerOn) { try { const row = measureRow('start'); ledger.flush(); finishRow(row, null); } catch (e) { ruler.errors.push('start: ' + firstLine(e)); } }
  say(printable(report));
  say('[live] ' + (built ? 'built' : 'resumed') + ' ' + name + ' in ' + loadMs + ' ms at t=' + start.t + ', cells ' + start.cells + ', edges ' + start.edges + ', checkpoint every ' + checkpointEvery + ' ticks, self every ' + (selfEvery || 'off') + ', generations every ' + (loopOn ? loopEvery + ' (loop)' : (genEvery || 'off')) + ', ticks ' + (bounded ? ticks : 'unbounded') + (wallMs ? ', wall ' + wallMs + ' ms' : '') + ', loop ' + (loopEvery || 'off') + ', ledger ' + led.mode + ' budget ' + led.budgetMb + ' MB');
  if (led.downgraded) say('[live] ' + led.downgraded);

  // the runner: ticks in chunks, checkpoints at exact multiples of checkpointEvery. With a
  // slow loop on, a chunk is one tick: the runner reads its pause flag between chunks, and
  // the hook below raises it on the due tick itself (one setImmediate per tick; the
  // orchestrator's timer fires in the timers phase, after the runner's own continuation,
  // so a wide chunk would land the round one chunk late).
  const loopsOn = selfEvery > 0 || genEvery > 0 || loopOn;
  const chunk = opts.chunk || (mode === 'fast' ? (loopsOn ? 1 : 500) : 2000);
  runner = makeRunner(brain, {
    mode, ticks, autosave: checkpointEvery, precision, chunk,
    save: (b) => {
      try { daemonCheckpoint('checkpoint'); checkpoints++; }
      catch (e) {
        // a failed autosave is counted and reported, never fatal: the organism keeps ticking
        // and the next boundary tries again (a throw here used to end the run with nothing saved)
        checkpointErrors++; lastCheckpointError = 't=' + b.clock.t + ': ' + String(e && e.message || e).split('\n')[0];
        say('[live] checkpoint failed at ' + lastCheckpointError);
      }
    },
    onProgress: out ? (s) => say('[live] t=' + brain.clock.t + ' done=' + s.done + ' ' + (s.ticksPerSec ?? 0) + '/s runs=' + brain.stats.runs + ' signals=' + brain.stats.signals + ' checkpoints=' + checkpoints + (runner.state.paused ? ' PAUSED' : '') + (loopOn ? ' mode=' + loop.mode + ' steps=' + STEP_KINDS.map((k) => k + ':' + loop.steps[k]).join(',') : '')) : null,
  });

  // the control plane: every CLI op and the viz attach here
  let controlInfo = null;
  const env = { name, layout: L, runner, live: true };
  const control = await startControl({
    dir: L.dir, name, port: opts.port || 0,
    handler: async (op, args) => {
      const fn = ops[op];
      if (!fn) throw new Error('unknown op ' + op);
      const payload = await fn(brain, args, env);
      return { ...payload, live: true, control: controlInfo };
    },
  });
  controlInfo = { url: control.url, pid: control.pid, port: control.port, started: control.started };
  say('[live] control ' + control.url + ' pid ' + control.pid);

  let viz = null;
  if (opts.viz) {
    try {
      const mod = await import('../viz/server.mjs');
      viz = await mod.startViz(brain, { port: opts.vizPort || 0 });
      if (viz.ready && typeof viz.ready.then === 'function') await viz.ready;
      say('[live] viz ' + viz.url);
    } catch (e) { say('[live] viz not started: ' + String(e && e.message).split('\n')[0]); }
  }

  // the slow loops: flags set inside the tick, acted on between runner chunks
  const due = { self: false, gen: false, loop: false };
  brain.hooks.afterTick.push((b, t) => {
    if (selfEvery > 0 && t > 0 && t % selfEvery === 0) { due.self = true; if (selfState.daemon) runner.pause(); }
    if (genEvery > 0 && t > 0 && t % genEvery === 0) due.gen = true;
    if (loopOn && t > 0 && t % loopEvery === 0) due.loop = true;
  });
  // the imagination region (mind/dream.mjs): dreams on its own period, only when no ask is
  // active; with the loop on it dreams once per period, and it is off in a bounded run unless asked
  const dreamEvery = opts.dreamEvery ?? (loopOn ? loopEvery : (bounded ? 0 : undefined));
  const dreamRegion = attachDream(brain, { every: dreamEvery, log: out ? (l) => say('[dream] ' + l) : null });
  if (dreamRegion) {
    loop.dream.every = dreamRegion.every;
    const cycle = dreamRegion.cycle.bind(dreamRegion);
    dreamRegion.cycle = () => {
      const c0 = performance.now();
      const row = cycle();
      if (row && row.skipped) { loop.dream.skipped++; loop.dream.why[row.skipped] = (loop.dream.why[row.skipped] || 0) + 1; } else loop.dream.dreamed++;
      // a cycle that stood down for an ask is a refused dream step, never a dream
      if (loopOn) stepDone('dream', performance.now() - c0, row && row.skipped ? { refused: 'ask', why: row.skipped, resolved: row.resolved } : { made: row ? row.made : 0, proposed: row ? row.proposed : 0, resolved: row ? row.resolved : 0 });
      return row;
    };
  }
  const selfState = { rounds: 0, applied: 0, errors: [], daemon: null };
  if (selfEvery > 0) {
    try {
      const selfMod = await import('../self/daemon.mjs');
      if (typeof selfMod.SelfDaemon === 'function') {
        selfState.daemon = new selfMod.SelfDaemon(brain, { dir: path.join(L.dir, 'self'), minutes: Infinity, rounds: Infinity, candidates: opts.selfCandidates ?? DEFAULTS.selfCandidates, trialTicks: opts.selfTrialTicks ?? DEFAULTS.selfTrialTicks, liveTicks: 0, log: out ? (l) => say('[self] ' + l) : null });
        try { if (typeof selfState.daemon.resume === 'function') selfState.daemon.resume(); } catch (e) { selfState.errors.push('resume: ' + String(e && e.message)); }
      } else selfState.errors.push('self/daemon.mjs exports no SelfDaemon');
    } catch (e) { selfState.errors.push('self/daemon.mjs: ' + String(e && e.message).split('\n')[0]); }
  }
  if (genEvery > 0 || loopOn) {
    genState.worker = new GenerationsWorker({ dir: path.join(L.dir, 'generations'), seed: seed + ':epochs', popSize: opts.genPopSize ?? DEFAULTS.genPopSize, ticks: opts.genTicks ?? DEFAULTS.genTicks, heapMb: opts.genHeapMb ?? DEFAULTS.genHeapMb });
    try { genState.boot = await genState.worker.start(); say('[gen] worker ' + (genState.boot.resumed ? 'resumed' : 'started') + ' at generation ' + genState.boot.generation); }
    catch (e) { genState.errors.push('start: ' + String(e && e.message)); genState.worker = null; }
  }

  // ------------------------------------------------ the steps of one period
  let running = true, genBusy = false, selfCodeBusy = false, selfCodeWorker = null;
  const generationsStep = () => {
    if (!genState.worker) return;
    if (genBusy) { loop.busy.generations++; return; }
    genBusy = true;
    const c0 = performance.now(), at = brain.clock.t;
    genState.worker.step().then((r) => {
      genState.steps++; genState.best = r.best; genState.summary = r.summary;
      say('[gen] generation ' + (r.row && r.row.gen) + ' best ' + (r.best ? r.best.id + ' ' + r.best.fitness : 'none') + ' fill ' + (r.row && r.row.fill));
      const promo = promoteElite(brain, r, genState);
      if (promo) { genState.promotions.push(promo); say('[gen] genome.promote ' + promo.status + ' region ' + promo.region + ' gain ' + promo.gain + (promo.applied ? ' applied: ' + JSON.stringify(promo.applied) : '')); }
      if (loopOn) stepDone('generations', performance.now() - c0, { from: at, gen: r.row ? r.row.gen : null, best: r.best ? r.best.fitness : null, promoted: promo ? promo.status : null });
    }).catch((e) => genState.errors.push('step: ' + String(e && e.message).split('\n')[0])).finally(() => { genBusy = false; });
  };
  const spawnStep = () => {
    const q = ruler.missing.find((x) => !loop.spawn.tried.has(x.id));
    if (!q) return;
    loop.spawn.tried.add(q.id);
    const c0 = performance.now();
    let r = null, err = null;
    const asks0 = askCountOf(brain), dreamAsks0 = dreamRegion ? dreamRegion.askCount : null;
    try { r = M.spawnAsk(brain, q.q, { by: 'daemon.spawn' }); } catch (e) { err = firstLine(e); }
    // the spawn step is the organism asking itself, not a caller: its own act.ask events are
    // credited to the dream region's count, so the next dream cycle does not stand down for
    // them (every period spawns, so without this the region dreamed 1 cycle in 66). A caller's
    // ask still moves the count, and ask mail, inflight asks and ctx.asking still hold it.
    const own = askCountOf(brain) - asks0;
    if (dreamRegion && own > 0) { loop.dream.ownAsks += own; dreamRegion.askCount = dreamRegion.askCount === dreamAsks0 ? dreamRegion.askCount + own : askCountOf(brain); }
    const rec = r ? r.record : null;
    const correct = !!(r && r.answer && M.gradeAnswer(r.answer.text, q).ok);
    if (rec && rec.carried) loop.spawn.carried++; else loop.spawn.declined++;
    if (correct) loop.spawn.correct++;
    if (rec) { loop.spawn.grew += rec.cellsSpawned; loop.spawn.kept += rec.cellsSpawned - rec.cellsPruned; }
    stepDone('spawn', performance.now() - c0, { q: q.id, source: q.source, carried: rec ? rec.carried : null, declined: rec ? rec.declined : err, grew: rec ? rec.cellsSpawned : 0, pruned: rec ? rec.cellsPruned : 0, region: rec ? rec.region : null, correct });
  };
  const ingestStep = () => {
    const ig = loop.ingest;
    if (ig.store === null) {
      const dir = opts.ingestStore || M.KNOWLEDGE_DIR;
      const ready = M.knowledgeReady(dir);
      if (!ready.ok) { ig.store = false; ig.reason = ready.reason; }
      else { try { ig.store = M.KnowledgeStore.open(dir); ig.of = ig.store.A; } catch (e) { ig.store = false; ig.reason = firstLine(e); } }
    }
    const mem = brain.memory;
    if (!ig.store || !mem || !mem.episodic) { stepDone('ingest', 0, { refused: !ig.store ? 'no knowledge store: ' + ig.reason : 'this brain has no episodic memory' }); return; }
    const c0 = performance.now(), from = ig.cursor, batch = opts.ingestBatch ?? DEFAULTS.ingestBatch;
    let added = 0;
    for (let i = 0; i < batch && ig.cursor < ig.store.A; i++) {
      const a = ig.cursor++;
      const title = ig.store.title(a);
      const items = ig.store.itemsOf(a);
      const text = (title + ': ' + (items.length ? ig.store.text(items[0]) : '')).slice(0, 600);
      const words = M.keywords(text, { max: 24 });
      const key = encodeWords(words);
      if (!key) continue;
      try {
        mem.episodic.append({ key, items: words, t: brain.clock.t, gen: brain.clock.gen, value: { text, origin: 'knowledge', provenance: 'knowledge', article: a, title } });
        added++;
      } finally { S.release(key); }
    }
    ig.added += added;
    stepDone('ingest', performance.now() - c0, { from, to: ig.cursor, added, of: ig.store.A });
  };
  const selfCodeStep = () => {
    const sc = loop.selfCode;
    if (!(sc.every > 0) || brain.clock.t - sc.lastT < sc.every) return;
    sc.lastT = brain.clock.t;
    // Board 14: the switch. While state/self/STOP exists no self-code step starts.
    if (existsSync(path.join(BRAIN_ROOT, 'state', 'self', 'STOP'))) { stepDone('self-code', 0, { refused: 'stop', reason: 'stopped by state/self/STOP' }); say('[self-code] refused at t=' + brain.clock.t + ': stopped by state/self/STOP'); return; }
    const flag = benchFlag({ dir: benchFlagDir, selfPid: process.pid });
    if (flag) { stepDone('self-code', 0, { refused: 'bench', flagPid: flag.pid, flagCommand: flag.command ? String(flag.command).slice(0, 160) : null }); say('[self-code] refused at t=' + brain.clock.t + ': a bench is running (pid ' + flag.pid + ')'); return; }
    if (selfCodeBusy) { loop.busy['self-code']++; return; }
    selfCodeBusy = true;
    const c0 = performance.now(), at = brain.clock.t;
    const cliOpts = { dry: sc.dry, max: opts.selfCodeMax ?? DEFAULTS.selfCodeMax, rerun: opts.selfCodeRerun === true };
    if (opts.selfCodeSources) cliOpts.sources = [].concat(opts.selfCodeSources).join(',');
    // Board 14: the author is on by default when the step is wet (the model may author, never grade)
    if (opts.selfCodeAuthor !== undefined) cliOpts.author = opts.selfCodeAuthor;
    else if (!sc.dry) cliOpts.author = 'on';
    const soakMin = Number(opts.selfCodeSoak ?? DEFAULTS.selfCodeSoak);
    if (Number.isFinite(soakMin) && soakMin > 0) cliOpts.soak = soakMin;
    let settled = false;
    const w = new Worker(SELF_CODE_WORKER, { eval: true, workerData: { url: pathToFileURL(path.join(BRAIN_ROOT, 'self', 'autopilot.mjs')).href, opts: cliOpts }, resourceLimits: { maxOldGenerationSizeMb: opts.selfCodeHeapMb ?? DEFAULTS.selfCodeHeapMb } });
    selfCodeWorker = w;
    const done = (m) => {
      if (settled) return;
      settled = true; selfCodeBusy = false; selfCodeWorker = null;
      const res = m && m.ok ? m.result : null;
      sc.last = { t: at, ok: !!res, result: res, error: m && !m.ok ? firstLine(m.error) : null };
      if (!res) sc.errors.push(sc.last.error);
      const soakOf = res && res.soak ? { runId: res.runId || null, status: res.status || null, attempts: res.attempts || null, stopped: !!res.stopped } : null;
      stepDone('self-code', performance.now() - c0, { from: at, dry: sc.dry, ok: res ? res.ok : false, reason: res ? res.reason : sc.last.error, candidates: res ? res.candidates ?? null : null, counts: res ? res.counts ?? null : null, soak: soakOf });
      say('[self-code] ' + (res ? (sc.dry ? 'dry ' : '') + (soakOf ? 'soak from t=' + at + ': ' + (soakOf.stopped ? 'stopped by state/self/STOP' : soakOf.status + ', ' + JSON.stringify(soakOf.attempts)) : 'run from t=' + at + ': ' + res.candidates + ' candidates, ' + JSON.stringify(res.counts)) : 'failed from t=' + at + ': ' + sc.last.error));
    };
    w.on('message', (m) => { done(m); w.terminate().catch(() => {}); });
    w.on('error', (e) => done({ ok: false, error: String(e && e.message || e) }));
    w.on('exit', (code) => done({ ok: false, error: 'the self-code worker exited ' + code + ' before it answered' }));
  };
  const runPeriod = () => {
    loop.periods++;
    const why = askActive(brain);
    if (why) { loop.skippedForAsk++; loop.lastAskReason = why; return; }
    try {
      if (loop.mode === 'generations') generationsStep();
      spawnStep();
      if (loop.mode === 'growth') ingestStep();
      selfCodeStep();
    } catch (e) { loop.errors.push('t=' + brain.clock.t + ': ' + firstLine(e)); }
  };

  const orchestrator = (async () => {
    let stopAt = null;
    for (;;) {
      if (due.self) {
        due.self = false;
        if (selfState.daemon) {
          if (running) runner.pause();
          // The label is selfState.daemon.round, not the separately kept selfState.rounds
          // counter. runRound() increments the daemon's OWN round number as its very first
          // statement, so the moment it returns, that field IS the round that just ran, by
          // construction, and it is the SAME number the daemon's own "round N: candidates
          //..." line (printed from inside runRound(), through this same say(), '[self] '
          // prefixed) reports for that round: the two lines can never disagree again.
          // selfState.rounds is a second counter, local to this process, that used to be
          // printed here instead; the live soak's log showed it one round behind the
          // daemon's own number for the same event (2026-09-17, notes/self.md). It is kept
          // below only as this process's own round tally, never as the label.
          try { await selfState.daemon.runRound(); selfState.rounds++; selfState.applied = selfState.daemon.applied ? selfState.daemon.applied.length : selfState.applied; say('[self] round ' + selfState.daemon.round + ' done at t=' + brain.clock.t + ', applied so far ' + selfState.applied); }
          catch (e) { selfState.errors.push('round: ' + String(e && e.message).split('\n')[0]); }
          if (running) runner.resume();
        }
      }
      if (due.gen && !genBusy) {
        due.gen = false;
        if (genState.worker) generationsStep();
      }
      if (due.loop) { due.loop = false; if (running) runPeriod(); }
      // the last chunk of a run may raise a flag after the runner returned: drain it too; a
      // self-code run still going at the end is given stopWaitMs, then its worker is ended
      if (!running && selfCodeBusy) {
        if (stopAt === null) stopAt = Date.now();
        if (Date.now() - stopAt > (opts.stopWaitMs ?? DEFAULTS.stopWaitMs) && selfCodeWorker) {
          const w = selfCodeWorker;
          loop.selfCode.errors.push('terminated at stop after ' + (Date.now() - stopAt) + ' ms');
          try { await w.terminate(); } catch { /* already ended */ }
          selfCodeBusy = false; selfCodeWorker = null;
        }
      }
      if (!running && !due.self && !(due.gen && genState.worker) && !genBusy && !selfCodeBusy) break;
      await sleep(20);
    }
  })();

  let interrupts = 0;
  const onSignal = (sig) => {
    interrupts++;
    if (interrupts > 1) process.exit(130);
    say('[live] ' + sig + ': checkpointing and stopping');
    runner.stop(String(sig).toLowerCase());
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  if (process.platform === 'win32') process.on('SIGBREAK', onSignal);
  const wallTimer = wallMs ? setTimeout(() => runner.stop('wall'), wallMs) : null;

  // Every step from here releases something the process holds (the orchestrator, the
  // generations worker, the control server, the viz, the world's timers), and each is guarded
  // so that one failure cannot skip the rest. The soak of 2026-09-17 showed the cost of an
  // unguarded line: the final checkpoint threw, control.close() never ran, and the process
  // lived on for twelve minutes as a zombie that answered /health, held the name and 734 MB,
  // and ticked nothing. An error is rethrown only after everything is closed.
  let finalState = null, end = null, endError = null;
  try { finalState = await runner.run(); }
  catch (e) { endError = e; say('[live] run ended by an error at t=' + brain.clock.t + ': ' + firstLine(e)); }
  if (wallTimer) clearTimeout(wallTimer);
  running = false;
  try { await orchestrator; } catch (e) { endError = endError || e; }
  if (genState.worker) { try { await genState.worker.stop(); } catch (e) { genState.errors.push('stop: ' + firstLine(e)); } }
  if (!endError) {
    // no final checkpoint after a runner error: a tick that threw halfway may have left the
    // organism inconsistent, and the last good checkpoint is worth more than that state
    try { end = daemonCheckpoint('final', { built: false, stoppedBy: finalState.reason }); checkpoints++; }
    catch (e) { endError = e; say('[live] final checkpoint failed at t=' + brain.clock.t + ': ' + firstLine(e)); }
  }
  let endRows = null;
  try { endRows = timescaleReport(brain); } catch { /* reported nowhere else */ }
  try { await control.close(); } catch { /* already closed */ }
  if (viz) { try { await viz.close(); } catch { /* already closed */ } }
  process.removeListener('SIGINT', onSignal);
  process.removeListener('SIGTERM', onSignal);
  if (process.platform === 'win32') process.removeListener('SIGBREAK', onSignal);
  if (dreamRegion) { try { dreamRegion.detach(); } catch { /* already detached */ } }
  if (loop.ingest.store) { try { loop.ingest.store.close(); } catch { /* already closed */ } }
  const ledgerEnd = ledger.stats();
  try { closeWorld(brain); } catch { /* nothing open */ }
  const learning = brain.whole && brain.whole.services && brain.whole.services.learning;
  if (learning && typeof learning.detach === 'function') { try { learning.detach(); } catch { /* already detached */ } }
  restorePolicy();
  if (endError) throw endError;

  const periods = {};
  const delta = (label, cells, idxs) => {
    let runs = 0, fired = 0;
    for (const idx of idxs) { const c = brain.cells[idx]; const b0 = startRuns.get(c.id) || { runs: 0, fired: 0 }; runs += c.stats.runs - b0.runs; fired += c.stats.fired - b0.fired; }
    periods[label] = { cells, runs, fired };
  };
  for (const p of brain.clock.periods) delta(periodLabel(p), brain.clock.wheel.get(p).size, brain.clock.wheel.get(p));
  delta('event', brain.clock.eventCells.size, brain.clock.eventCells);
  void startRows; void endRows;
  const thisRun = rulerOn ? readRuler(L.dir).filter((r) => r.run === runId) : [];
  const payload = {
    name, built, resumed: !built, mode, ticks: bounded ? ticks : null, wallMs: wallMs || null, loadMs, start, end, checkpoints, checkpointErrors, lastCheckpointError, checkpointEvery,
    checkpointBytes: { total: checkpointBytes, last: lastCheckpointBytes },
    runner: jsonSafe(finalState), periods, illegal: report.illegal, regions: Object.keys(report.regions), kinds: report.kindCount,
    self: { every: selfEvery, rounds: selfState.rounds, applied: selfState.applied, errors: selfState.errors },
    generations: { every: loopOn ? loopEvery : genEvery, steps: genState.steps, boot: genState.boot, best: genState.best ? { id: genState.best.id, key: genState.best.key, fitness: genState.best.fitness } : null, promotions: genState.promotions, errors: genState.errors },
    ledger: { asked: led.asked, level: led.level, budgetMb: led.budgetMb, budgetFrom: led.budgetFrom, downgraded: led.downgraded, ...ledgerEnd },
    loop: loopOn ? {
      every: loopEvery, mode: loop.mode, periods: loop.periods, skippedForAsk: loop.skippedForAsk, lastAskReason: loop.lastAskReason,
      steps: loop.steps, stepMs: Object.fromEntries(Object.entries(loop.stepMs).map(([k, v]) => [k, r3(v)])), refused: loop.refused, refusals: loop.refusals, busy: loop.busy,
      dream: loop.dream, spawn: { carried: loop.spawn.carried, declined: loop.spawn.declined, correct: loop.spawn.correct, grew: loop.spawn.grew, kept: loop.spawn.kept },
      ingest: { cursor: loop.ingest.cursor, added: loop.ingest.added, of: loop.ingest.of, reason: loop.ingest.reason },
      selfCode: { every: loop.selfCode.every, dry: loop.selfCode.dry, last: loop.selfCode.last, errors: loop.selfCode.errors }, errors: loop.errors,
    } : null,
    ruler: rulerOn ? { file: rulerFile, run: runId, rows: thisRun.length, first: thisRun[0] || null, last: thisRun[thisRun.length - 1] || null, rates: rulerRates(thisRun), plateau: plateau.state(), ms: r3(ruler.ms), errors: ruler.errors } : null,
    control: controlInfo, snapshot: L.snapshot, dir: L.dir, summary: jsonSafe(brain.summary()),
    instance: opts.instance || null, exchange: exchangeHook ? { calls: exchange.calls, errors: exchange.errors } : null,
  };
  return payload;
}

/** The ruler a checkpoint carries in its header, read without its body (null for a JSON checkpoint). */
export function checkpointRuler(file) { const h = readCheckpointHeader(file); return h ? h.ruler || null : null; }

export function printLive(p) {
  const per = Object.entries(p.periods || {}).map(([k, v]) => k + ':' + v.runs).join(' ');
  const lines = [
    'live ' + p.name + ' ' + (p.built ? 'built' : 'resumed') + ' at t=' + p.start.t + ', stopped (' + (p.runner && p.runner.reason) + ') at t=' + p.end.t + ': ' + (p.runner ? p.runner.done : 0) + ' ticks, ' + (p.runner ? p.runner.ticksPerSec : 0) + ' ticks/s, ' + p.checkpoints + ' checkpoints',
    'cells ' + p.end.cells + ' (start ' + p.start.cells + '), edges ' + p.end.edges + ' (start ' + p.start.edges + '), illegal ' + p.illegal + ', regions ' + p.regions.length + ', kinds ' + p.kinds,
    'runs per period over this run: ' + per,
    'self rounds ' + p.self.rounds + ' (every ' + (p.self.every || 'off') + ', applied ' + p.self.applied + '), generations steps ' + p.generations.steps + ' (every ' + (p.generations.every || 'off') + (p.generations.best ? ', best ' + p.generations.best.id + ' fitness ' + p.generations.best.fitness : '') + '), promotions ' + p.generations.promotions.length + (p.generations.promotions.length ? ' [' + p.generations.promotions.map((x) => x.status + ' ' + x.region + ' gain ' + x.gain).join('; ') + ']' : ''),
    ...(p.self.errors.length ? ['self errors: ' + p.self.errors.join(' | ')] : []),
    ...(p.generations.errors.length ? ['generations errors: ' + p.generations.errors.join(' | ')] : []),
  ];
  if (p.ledger) lines.push('ledger ' + p.ledger.mode + ' (asked ' + p.ledger.asked + ', budget ' + p.ledger.budgetMb + ' MB from ' + p.ledger.budgetFrom + '): ' + p.ledger.bytesWritten + ' bytes written, file ' + p.ledger.fileBytes + ', disk ' + p.ledger.diskBytes + ', rotations ' + p.ledger.rotations + (p.ledger.downgraded ? ' [' + p.ledger.downgraded + ']' : ''));
  if (p.loop) lines.push('loop every ' + p.loop.every + ' ticks, mode ' + p.loop.mode + ', periods ' + p.loop.periods + ' (skipped for an ask ' + p.loop.skippedForAsk + '), steps ' + STEP_KINDS.map((k) => k + ' ' + p.loop.steps[k]).join(', ') + ', refused ' + (STEP_KINDS.filter((k) => p.loop.refused[k]).map((k) => k + ' ' + p.loop.refused[k]).join(', ') || 'none'));
  if (p.ruler && p.ruler.last) {
    const w = p.ruler.rates.whole;
    lines.push('ruler ' + p.ruler.rows + ' rows: exact ' + p.ruler.first.total.exact + '/' + p.ruler.first.total.n + ' -> ' + p.ruler.last.total.exact + '/' + p.ruler.last.total.n + ', carried ' + p.ruler.first.total.carried + ' -> ' + p.ruler.last.total.carried + (w ? ', per wall second over ' + w.seconds + ' s: exact ' + w.exact + ', carried ' + w.carried : '') + ', plateau ' + (p.ruler.plateau.fired.length ? p.ruler.plateau.fired.join(',') + ' fired' : 'none fired') + ', mode ' + p.ruler.plateau.mode);
  }
  lines.push('snapshot ' + p.snapshot);
  return lines.join('\n');
}
