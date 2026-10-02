// grow/evolve.mjs: NATIVE EVOLVE, the organism rewrites its own engine with no model (grow/NEO.md, his words of 19:15Z
// to 19:26Z: "it should change its own code for iteration, testing, benching", "how does it self iterate if it doesnt
// change its own code??", "IT should permanently change code for the better", "rewrite itself, and iterate its own
// engine"; and of 20:51Z: "It should be able to become a god by itself. you jsut gotta build how it can").
// Until 2026-10-02 the only thing that changed the organism's code was a Claude arm inside the hourly routine
// (grow/self.mjs: propose, check, apply, judge by a later generation, keep or revert). This is the same loop with a
// SEARCH in place of the model and a MEASURED TRIAL in place of an opinion: a seeded mutant of the engine's genome
// (grow/genome.mjs) or a macro mined from the colonies' own kept cells, run by the engine itself against the present
// genome on two scratch roots under ONE budget, kept permanently only when the engine's printed score says it is better
// in two repeated runs, else reverted cleanly. No model call, no key, no dependency (Node 22 and 24).
//
//   node grow/evolve.mjs step [--era <n>] [--max-ms <n>] [--root <dir>] [--sample <k>] [--generated <k>] [--kind genome|macro]
//                             [--genes <a,b>] [--engine <file>] [--tmp <dir>]
//   node grow/evolve.mjs status [--root <dir>]
//   node grow/evolve.mjs mine [--root <dir>]
// Each verb prints ONE JSON line last and exits 0; a usage error exits 2, a failure 1 (contract c1).
//
// ONE TRIAL A STEP (kinds alternate by era: an odd era a genome mutant, an even era a macro; a kind the engine cannot
// load yet, by `node grow/neo.mjs status` features, is a skipped row with its reason and the other kind runs):
//  (a) a deterministic sample of the ledger's tasks (seed: the era), unmastered first;
//  (b) one template scratch root outside the tree (the engine's import closure, judge/ without judge/heldout/, grown/,
//      neo/ with every task's dev rows and the sampled tasks' own files), copied by path, never read row by row;
//  (c) two arm roots copied from it that differ in ONE file (neo/GENOME.json or neo/MACROS.json), the engine run on
//      each sampled task with the SAME --max-generated and --max-ms;
//  (d) the score is what the engine printed: held-out correct summed over the sample, then mastered, then cells per
//      second; KEPT only when the mutant is strictly better on held-out, or equal on held-out (no mastered task lost) and
//      at least 5 percent faster, the same verdict in BOTH of two repeated runs (the second with the arms in the other
//      order: a race is not graded by one run); a mutant worse or equal in the first run is reverted at once. A first
//      run TOO CLOSE TO CALL (the arms scored some task differently, yet their sums lie KNOBS.close rows apart or fewer)
//      GROWS the sample to KNOBS.grow times its tasks (the next tasks of the same draw) and the grown sample decides,
//      in both orders; no time for it is an unconfirmed row (the candidate is drawn again);
//  (d') the genome candidate: a seeded mutant, or every KNOBS.crossEvery-th graded genome trial a CROSSOVER of the two
//      most promising mutants no trial kept (their first run better or faster), each gene taken whole from one parent;
//  (e) kept: <root>/neo/GENOME.json (or MACROS.json) written atomically; reverted: nothing changes; either way one row
//      appended to <root>/neo/TRIALS.jsonl with every number the trial used;
//  (f) the scratch roots removed, even when the engine crashed, hung or the clock ran out.
// It writes only <root>/neo/TRIALS.jsonl, <root>/neo/GENOME.json and <root>/neo/MACROS.json. It never opens state/,
// judge/heldout/, judge/control.jsonl or a task's heldout.jsonl: it copies them by path for the engine and reads only
// the engine's printed line. A cell's text and a printed line are DATA: parsed as JSON, never evaluated.
// Author: NATIVE EVOLVE builder, 2026-10-01.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { GENOME_FILE, GENOME_VERSION, DEFAULTS as GENOME_DEFAULTS, GENES, genomeFrom, readGenomeDoc, mutate, crossover, describe, genomeId, hashText, diff, rng } from './genome.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const TRIALS_FILE = 'neo/TRIALS.jsonl';
export const MACROS_FILE = 'neo/MACROS.json';
export const LEDGER_FILE = 'neo/LEDGER.json';
export const TASKS_DIR = 'neo/tasks';
export const ENGINE = 'grow/neo.mjs';
/**
 * The step's knobs: its clock, the sample, the per-grow candidate budget, the speed bar, the retire age of a macro;
 * close: a first run whose arms differ task by task but sum this many held-out rows apart or fewer is too close to call;
 * grow: the sample is then grown to this many times its tasks; crossEvery: every this-th graded genome trial is a
 * crossover of the promising mutants earlier trials did not keep.
 */
export const KNOBS = Object.freeze({ maxMs: 240000, sample: 3, generated: 20000, faster: 1.05, retireEras: 20, minGrowMs: 400, slackMs: 45000, tries: 16, minTasks: 2, close: 1, grow: 2, crossEvery: 3, cpsFloor: 1000, minGenerated: 1000 });
export const USAGE = [
  'usage: node grow/evolve.mjs step [--era <n>] [--max-ms <n>] [--root <dir>] [--sample <k>] [--generated <k>] [--kind genome|macro] [--genes <a,b>] [--engine <file>] [--tmp <dir>]',
  '       node grow/evolve.mjs status [--root <dir>]',
  '       node grow/evolve.mjs mine [--root <dir>]',
].join('\n');
const TASK_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

export class Fail extends Error { constructor(msg, code = 1) { super(msg); this.code = code; } }

// ---------------------------------------------------------------- small helpers
const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const first = (e) => String((e && e.message) || e).split(/\r?\n/)[0].trim();
const posix = (p) => p.split(path.sep).join('/');
const abs = (root, rel) => path.join(root, ...rel.split('/'));
function readJson(file) { try { const j = JSON.parse(fs.readFileSync(file, 'utf8')); return j; } catch { return null; } }
/** Write a file atomically: a temp file in the same directory, then a rename over the target. */
export function writeAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.' + process.pid + '.' + Date.now().toString(36) + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}
const writeJsonAtomic = (file, o) => writeAtomic(file, JSON.stringify(o, null, 2) + '\n');
/** The last line of a text that parses as a JSON object, or null (a child's line is DATA, parsed, never evaluated). */
export function lastJson(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i].trim();
    if (!l.startsWith('{')) continue;
    try { const j = JSON.parse(l); if (isObj(j)) return j; } catch { /* not this line */ }
  }
  return null;
}
/** Whether p lies inside root (or is root). */
function inside(root, p) { const r = path.relative(path.resolve(root), path.resolve(p)); return r === '' || (!r.startsWith('..') && !path.isAbsolute(r)); }

// ---------------------------------------------------------------- (a) the tasks and the sample
/**
 * The ledger's tasks (each name once, in ledger order) whose directory holds a dev set; a held-out file is checked
 * for its presence only, never opened.
 * @param {string} root the tree
 * @returns {string[]}
 */
export function ledgerTasks(root) {
  const led = readJson(abs(root, LEDGER_FILE));
  const out = [];
  for (const r of isObj(led) && Array.isArray(led.tasks) ? led.tasks : []) {
    const t = isObj(r) ? r.task : null;
    if (typeof t !== 'string' || !TASK_RE.test(t) || out.includes(t)) continue;
    const d = abs(root, TASKS_DIR + '/' + t);
    if (fs.existsSync(path.join(d, 'dev.jsonl')) && fs.existsSync(path.join(d, 'heldout.jsonl'))) out.push(t);
  }
  return out;
}
/** The tasks whose promoted colony is mastered by the engine's own rule (its held-out score is 1), from grown/index.json. */
export function masteredTasks(root) {
  const ix = readJson(abs(root, 'grown/index.json'));
  const out = new Set();
  for (const r of isObj(ix) && Array.isArray(ix.cells) ? ix.cells : []) {
    if (!isObj(r) || r.tier !== 'neo') continue;
    const t = typeof r.task === 'string' ? r.task : r.class;
    if (typeof t === 'string' && isObj(r.heldout) && r.heldout.score === 1) out.add(t);
  }
  return out;
}
function shuffle(list, r) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/**
 * The trial's sample: k tasks of the ledger, deterministic for the era (seed "sample:<era>"), every unmastered task
 * before any mastered one.
 * @param {string} root the tree
 * @param {number} era the era (the seed)
 * @param {number} k the sample size
 * @returns {{ tasks: string[], unmastered: number, pool: number }}
 */
export function sampleTasks(root, era, k) {
  const all = ledgerTasks(root), done = masteredTasks(root), r = rng('sample:' + era);
  const un = shuffle(all.filter((t) => !done.has(t)), r), ma = shuffle(all.filter((t) => done.has(t)), r);
  const tasks = [...un, ...ma].slice(0, Math.max(0, k));
  return { tasks, unmastered: tasks.filter((t) => !done.has(t)).length, pool: all.length };
}

// ---------------------------------------------------------------- (b) the scratch roots, copied by path
/** The entry files of the engine's code: the engine, the baseline organism it measures against, the genome, and the
 *  parts the ENGINE builder is landing (copied when present). */
export const CODE_ENTRIES = Object.freeze(['grow/neo.mjs', 'grow/neo-core.mjs', 'grow/neo-kernel.mjs', 'grow/know.mjs', 'grow/genome.mjs', 'judge/baseline.mjs', 'act/prompt.mjs', 'seeds/basic.mjs']);
const SPEC_RES = [/\bfrom\s*['"](\.{1,2}\/[^'"\n]+)['"]/g, /\bimport\s*['"](\.{1,2}\/[^'"\n]+)['"]/g, /\bimport\s*\(\s*['"](\.{1,2}\/[^'"\n]+)['"]\s*\)/g];
const JOIN_RE = /path\.(?:join|resolve)\(\s*([A-Za-z_$][\w$]*)\s*((?:,\s*'[^'\n]+'\s*)+)\)/g;
/** Never copied as code or data by the closure: runtime state, the git store, the held-out truth (the engine's own
 *  judge/ and the task files are copied by the explicit rules below), and the two trees the step writes itself. */
const NEVER_COPY = [/^state(\/|$)/, /^work(\/|$)/, /^\.git(\/|$)/, /(^|\/)node_modules(\/|$)/, /^judge\/heldout(\/|$)/, /^grown(\/|$)/, /^neo(\/|$)/, /(^|\/)\.env/];
/** A directory a closure names is copied whole only under these caps (the 191 MB knowledge pack is not). */
const DIR_CAP = Object.freeze({ bytes: 16 * 1024 * 1024, files: 4000 });
function walk(dir, rel = '', out = [], prune = null) {
  let ents = [];
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!prune || !prune(r)) walk(path.join(dir, e.name), r, out, prune); }
    else if (e.isFile()) out.push(r);
  }
  return out;
}
function dirSize(dir) { let bytes = 0, files = 0; for (const r of walk(dir)) { files++; try { bytes += fs.statSync(path.join(dir, ...r.split('/'))).size; } catch { /* gone */ } if (bytes > DIR_CAP.bytes || files > DIR_CAP.files) break; } return { bytes, files }; }
/**
 * The engine's code closure under root: the entry files, every relative import they make (static and dynamic string
 * specifiers), and every file or small directory they name as path.join(<dir>, '<a>', '<b>') with literal parts
 * (a name ending in HERE or DIR resolves from the file's own directory, any other from root).
 * @param {string} root the tree
 * @param {string[]} entries files relative to root
 * @returns {{ files: string[], dirs: string[], skipped: string[] }}
 */
export function closureOf(root, entries = CODE_ENTRIES) {
  const files = new Set(), dirs = new Set(), skipped = new Set(), todo = [...entries];
  const ok = (rel) => !!rel && !rel.startsWith('..') && !path.isAbsolute(rel) && !NEVER_COPY.some((re) => re.test(rel));
  while (todo.length) {
    const rel = todo.pop();
    if (files.has(rel) || !ok(rel)) continue;
    let st = null;
    try { st = fs.statSync(abs(root, rel)); } catch { continue; }
    if (!st.isFile()) continue;
    files.add(rel);
    if (!/\.m?js$/.test(rel)) continue;
    let text = '';
    try { text = fs.readFileSync(abs(root, rel), 'utf8'); } catch { continue; }
    for (const re of SPEC_RES) for (const m of text.matchAll(re)) todo.push(path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[1].split('?')[0])));
    for (const m of text.matchAll(JOIN_RE)) {
      const parts = [...m[2].matchAll(/'([^'\n]+)'/g)].map((x) => x[1]);
      const fromFile = /(HERE|DIR|dirname)$/i.test(m[1]);
      const target = path.posix.normalize(path.posix.join(fromFile ? path.posix.dirname(rel) : '.', ...parts));
      if (!ok(target)) continue;
      let ts = null;
      try { ts = fs.statSync(abs(root, target)); } catch { continue; }
      if (ts.isFile()) todo.push(target);
      else if (ts.isDirectory()) { const s = dirSize(abs(root, target)); if (s.bytes <= DIR_CAP.bytes && s.files <= DIR_CAP.files) dirs.add(target); else skipped.add(target); }
    }
  }
  return { files: [...files].sort(), dirs: [...dirs].sort(), skipped: [...skipped].sort() };
}
function copyFile(root, dest, rel) {
  const from = abs(root, rel), to = abs(dest, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  return fs.statSync(to).size;
}
/**
 * Copy what the engine needs to grow `tasks` from root into dest, by path: the code closure, judge/ without
 * judge/heldout/, grow/'s own data files, grown/ whole, the top files of neo/ (not TRIALS.jsonl) and neo/know/, every
 * task's dev.jsonl and task.json, and every file of the given tasks (all tasks with allTasks). No file is opened
 * row by row; the held-out files are copied as bytes for the engine's own SELECT.
 * @param {string} root the tree
 * @param {string} dest the scratch root (outside root)
 * @param {{ tasks?: string[], allTasks?: boolean }} opts
 * @returns {{ files: number, bytes: number, skipped: string[] }}
 */
export function copyRoot(root, dest, { tasks = [], allTasks = false } = {}) {
  if (inside(root, dest) || inside(dest, root)) throw new Fail('refused: the scratch root ' + dest + ' is not outside ' + root);
  const rels = new Set(), cl = closureOf(root);
  for (const r of cl.files) rels.add(r);
  for (const d of cl.dirs) for (const r of walk(abs(root, d))) rels.add(d + '/' + r);
  for (const r of walk(abs(root, 'judge'), '', [], (d) => d === 'heldout')) rels.add('judge/' + r);
  for (const r of walk(abs(root, 'grow'), '', [], () => true)) if (!r.includes('/') && /\.(mjs|json|jsonl|md)$/.test(r)) rels.add('grow/' + r);
  for (const r of walk(abs(root, 'grown'))) rels.add('grown/' + r);
  for (const r of walk(abs(root, 'neo'))) {
    if (!r.includes('/')) { if (r !== 'TRIALS.jsonl' && !r.endsWith('.tmp')) rels.add('neo/' + r); continue; }
    if (r.startsWith('know/')) { rels.add('neo/' + r); continue; }
    const m = /^tasks\/([^/]+)\/(.+)$/.exec(r);
    if (!m) continue;
    if (allTasks || tasks.includes(m[1]) || m[2] === 'dev.jsonl' || m[2] === 'task.json') rels.add('neo/' + r);
  }
  let bytes = 0, files = 0;
  for (const r of [...rels].sort()) { bytes += copyFile(root, dest, r); files++; }
  return { files, bytes, skipped: cl.skipped };
}

// ---------------------------------------------------------------- (c) the engine, a child process
/**
 * Run the engine once: node <engine> <args>, captured, killed at timeoutMs. Never throws.
 * @returns {{ ok: boolean, line: object|null, code: number|null, why: string|null, ms: number }}
 */
export function runEngine(engine, args, { env = process.env, timeoutMs = 60000, cwd } = {}) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [engine, ...args], { encoding: 'utf8', timeout: Math.max(1, Math.floor(timeoutMs)), killSignal: 'SIGKILL', windowsHide: true, env, cwd, maxBuffer: 64 * 1024 * 1024 });
  const ms = Date.now() - t0;
  const line = lastJson(r.stdout);
  if (r.error) return { ok: false, line, code: null, why: (r.error.code === 'ETIMEDOUT' ? 'timed out after ' + ms + ' ms' : first(r.error)), ms, ...(r.error.code === 'ETIMEDOUT' ? { timedOut: true } : {}) };
  if (r.status !== 0) {
    const err = String(r.stderr || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)[0] || (line && line.error) || 'no stderr';
    return { ok: false, line, code: r.status, why: 'exited ' + r.status + (r.signal ? ' (' + r.signal + ')' : '') + ': ' + String(err).slice(0, 200), ms };
  }
  if (!line) return { ok: false, line: null, code: 0, why: 'printed no JSON line', ms };
  return { ok: true, line, code: 0, why: null, ms };
}
/** The engine's features (contract c3: `status` JSON carries `features`), or [] with the reason. */
export function engineFeatures(engine, root, opts = {}) {
  const r = runEngine(engine, ['status', '--root', root], opts);
  if (!r.ok) return { features: [], why: 'status ' + r.why };
  return { features: Array.isArray(r.line.features) ? r.line.features.filter((x) => typeof x === 'string') : [], why: null };
}
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
/**
 * One arm of a trial: the engine grows every sampled task on the arm's root with the given budget. The score is what
 * the engine printed: per task the held-out { ok, n } of its line (a grow that compiled nothing scores 0), generated
 * and cellsPerSecond; summed: held-out ok, n, mastered tasks, generated, and cells per second as generated over the
 * seconds the printed rates imply.
 * @returns {{ heldoutOk: number, n: number, mastered: number, generated: number, cps: number, ms: number, tasks: object[], blocked: string|null }}
 */
export function runArm({ engine, root, tasks, gen, budget, deadline, env, slackMs = KNOBS.slackMs, minGrowMs = KNOBS.minGrowMs, stage = null }) {
  const out = { heldoutOk: 0, n: 0, mastered: 0, generated: 0, cps: 0, ms: 0, tasks: [], blocked: null };
  let secs = 0;
  for (const t of tasks) {
    const left = deadline - Date.now();
    if (left < minGrowMs) { out.blocked = 'out of time before ' + t; break; }
    const args = ['grow', '--task', t, '--gen', String(gen), '--root', root, '--max-generated', String(budget.maxGenerated), '--max-ms', String(budget.maxMs)];
    if (stage) args.push('--stage', stage);
    const cap = budget.maxMs + slackMs;
    const r = runEngine(engine, args, { env, timeoutMs: Math.min(left, cap) });
    out.ms += r.ms;
    // killed at the step's clock (what was left, under the grow's own cap): the clock ran out, not the engine
    if (r.timedOut && left < cap) { out.blocked = 'out of time in ' + t + ' (the step clock killed its grow after ' + r.ms + ' ms, under its cap of ' + cap + ' ms)'; break; }
    if (!r.ok || r.line.ok === false) { out.blocked = 'grow ' + t + ' ' + (r.why || 'printed ok false: ' + String(r.line.error || '').slice(0, 200)); break; }
    let line = r.line;
    if (!isObj(line.heldout) && stage) { const s = readJson(path.join(stage, t + '.json')); if (isObj(s) && isObj(s.result)) line = { ...s.result, ...line, heldout: s.result.heldout }; }
    const h = isObj(line.heldout) ? line.heldout : null;
    const ok = h ? num(h.ok) : 0, n = h ? num(h.n) : 0, g = num(line.generated), cps = num(line.cellsPerSecond);
    const row = { task: t, ok, n, generated: g, cps, ms: r.ms, ...(line.capped ? { capped: line.capped } : {}), ...(h ? {} : { heldout: null }) };
    out.tasks.push(row);
    out.heldoutOk += ok; out.n += n; out.generated += g;
    if (n > 0 && ok === n) out.mastered++;
    if (cps > 0) secs += g / cps;
  }
  out.cps = secs > 0 ? Math.round(out.generated / secs) : 0;
  return out;
}

/**
 * The engine's time over the time its grows were told, measured on the latest trial whose first run finished both arms:
 * that run's ms over 2 arms x its tasks x the trial's budget.maxMs, never under 1 (two decimals); 1 with no such trial.
 * The next budget is divided by it, so one run comes back to half the step (a fixed point: a grow's own fixed cost
 * shrinks the next grow's share until the run fits).
 * @param {object[]} rows the rows of TRIALS.jsonl
 * @returns {number}
 */
export function overrun(rows) {
  for (let i = (Array.isArray(rows) ? rows.length : 0) - 1; i >= 0; i--) {
    const r = rows[i];
    const run = isObj(r) && Array.isArray(r.runs) ? r.runs[0] : null;
    if (!isObj(run) || !isObj(run.base) || !isObj(run.mut) || run.base.blocked || run.mut.blocked || !isObj(r.budget)) continue;
    const told = 2 * (Array.isArray(run.base.tasks) ? run.base.tasks.length : 0) * num(r.budget.maxMs), took = num(run.base.ms) + num(run.mut.ms);
    if (told > 0 && took > 0) return Math.max(1, Math.round((took / told) * 100) / 100);
  }
  return 1;
}

// ---------------------------------------------------------------- (d) the verdict
/** The score of an arm as a row records it (every number the verdict reads). */
const scoreOf = (a) => ({ heldoutOk: a.heldoutOk, n: a.n, mastered: a.mastered, cps: a.cps, generated: a.generated, ms: a.ms });
/**
 * The verdict of one run: "better" (more held-out rows right), "worse" (fewer, or as many with a mastered task lost),
 * "faster" (as many, no mastered task lost, cells per second at least `faster` times the present arm's), else "equal".
 * @param {{ heldoutOk: number, mastered: number, cps: number }} base the present arm
 * @param {{ heldoutOk: number, mastered: number, cps: number }} mut the mutant arm
 * @param {number} faster the speed bar (1.05)
 * @returns {"better"|"worse"|"faster"|"equal"}
 */
export function verdictOf(base, mut, faster = KNOBS.faster) {
  if (mut.heldoutOk > base.heldoutOk) return 'better';
  if (mut.heldoutOk < base.heldoutOk || mut.mastered < base.mastered) return 'worse';
  if (base.cps > 0 && mut.cps >= base.cps * faster) return 'faster';
  return 'equal';
}
/**
 * Keep or revert from the verdicts of the runs: kept only when two runs gave the same verdict and it is "better" or
 * "faster" (a race is not graded by one run).
 * @param {string[]} verdicts one per run
 * @returns {{ kept: boolean, why: string }}
 */
export function decide(verdicts) {
  const [a, b] = verdicts;
  if (a === undefined) return { kept: false, why: 'no run was graded' };
  if (a === 'worse') return { kept: false, why: 'the mutant scored worse than the present engine' };
  if (a === 'equal') return { kept: false, why: 'the mutant tied on held-out and was not 5 percent faster' };
  if (b === undefined) return { kept: false, why: 'the first run said ' + a + ' and no second run confirmed it' };
  if (a !== b) return { kept: false, why: 'the two runs disagree (' + a + ', then ' + b + ')' };
  return { kept: true, why: a === 'better' ? 'more held-out rows right in both runs' : 'as many held-out rows right and at least 5 percent faster in both runs' };
}
/**
 * Whether a run is too close to call: the two arms scored some task differently, yet their held-out sums lie `close`
 * rows apart or fewer. Arms that scored every task alike are a clear call (the change does nothing the sample sees).
 * @param {{ heldoutOk: number, tasks: { task: string, ok: number }[] }} base the present arm
 * @param {{ heldoutOk: number, tasks: { task: string, ok: number }[] }} mut the mutant arm
 * @param {number} close the margin in held-out rows (KNOBS.close)
 * @returns {{ close: boolean, apart: number }}
 */
export function tooClose(base, mut, close = KNOBS.close) {
  const apart = Math.abs(num(mut.heldoutOk) - num(base.heldoutOk));
  const ok = new Map((Array.isArray(base.tasks) ? base.tasks : []).map((t) => [t.task, t.ok]));
  const differ = (Array.isArray(mut.tasks) ? mut.tasks : []).some((t) => !ok.has(t.task) || ok.get(t.task) !== t.ok) || (Array.isArray(base.tasks) && Array.isArray(mut.tasks) && base.tasks.length !== mut.tasks.length);
  return { close: differ && apart <= close, apart };
}

// ---------------------------------------------------------------- the ledger of trials
/** The rows of <root>/neo/TRIALS.jsonl (a line that is not a JSON object is left out). */
export function readTrials(root) {
  let text = '';
  try { text = fs.readFileSync(abs(root, TRIALS_FILE), 'utf8'); } catch { return []; }
  const out = [];
  for (const l of text.split(/\r?\n/)) { if (!l.trim()) continue; try { const j = JSON.parse(l); if (isObj(j)) out.push(j); } catch { /* a torn line */ } }
  return out;
}
function appendTrial(root, row) {
  const f = abs(root, TRIALS_FILE);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.appendFileSync(f, JSON.stringify(row) + '\n');
  return row;
}
/** A row that graded its candidate (a skip, a blocked trial or an unconfirmed one did not: that candidate is drawn again). */
const graded = (r) => !r.skipped && r.kept === false && !r.blocked && !r.unconfirmed;

// ---------------------------------------------------------------- (3) macros: library learning over the kept cells
/** The parsed <root>/neo/MACROS.json, always { macros: [...] } (other keys kept). */
export function readMacros(root) {
  const j = readJson(abs(root, MACROS_FILE));
  const doc = isObj(j) ? j : {};
  return { ...doc, macros: Array.isArray(doc.macros) ? doc.macros.filter((m) => isObj(m) && typeof m.name === 'string') : [] };
}
/**
 * The kept cells of the promoted NEO colonies in grown/, as DATA: the lines of each module's `const COLONY = [` block
 * parsed one by one as JSON (never imported, never evaluated).
 * @param {string} root the tree
 * @returns {{ task: string, id: string|null, pyramid: Array }[]}
 */
export function grownCells(root) {
  const ix = readJson(abs(root, 'grown/index.json'));
  const out = [];
  for (const r of isObj(ix) && Array.isArray(ix.cells) ? ix.cells : []) {
    if (!isObj(r) || r.tier !== 'neo' || typeof r.file !== 'string') continue;
    const task = typeof r.task === 'string' ? r.task : String(r.class ?? '');
    const file = path.join(root, 'grown', ...r.file.split('/'));
    if (!inside(path.join(root, 'grown'), file)) continue;
    let text = '';
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const head = 'const COLONY = [\n', a = text.indexOf(head);
    if (a < 0) continue;
    const b = text.indexOf('\n];', a + head.length);
    if (b < 0) continue;
    for (const line of text.slice(a + head.length, b).split('\n')) {
      const l = line.trim().replace(/,$/, '');
      if (!l.startsWith('{')) continue;
      try { const c = JSON.parse(l); if (isObj(c) && Array.isArray(c.pyramid)) out.push({ task, id: typeof c.id === 'string' ? c.id : null, pyramid: c.pyramid }); } catch { /* a line that is not a cell */ }
    }
  }
  return out;
}
const isNode = (n) => Array.isArray(n) && typeof n[0] === 'string';
const familyOfName = (name) => String(name).split('.')[0];
/** The node count and the primitive count of a body ({ param } and { lit } leaves count as nodes, not primitives). */
function countOf(n) { if (!isNode(n)) return { size: 1, prims: 0 }; let size = 1, prims = 1; for (const c of n.slice(1)) { const k = countOf(c); size += k.size; prims += k.prims; } return { size, prims }; }
const canonText = (v) => JSON.stringify(v, (k, x) => (isObj(x) ? Object.fromEntries(Object.keys(x).sort().map((y) => [y, x[y]])) : x));
/** A body with its holes as { param: k } in depth-first order: every literal (variant 1), or every literal and every
 *  sense primitive (variant 2: the macro then takes what it senses as its arguments). */
function abstractOf(node, senseHoles) {
  const holes = [];
  const go = (n, parent, j) => {
    if (isNode(n)) {
      if (senseHoles && familyOfName(n[0]) === 'sense' && parent) { holes.push({ parent, j, node: n }); return { param: holes.length - 1 }; }
      return [n[0], ...n.slice(1).map((c, i) => go(c, n[0], i + 1))];
    }
    if (isObj(n) && Object.hasOwn(n, 'lit')) { holes.push({ parent, j, node: n }); return { param: holes.length - 1 }; }
    return n;
  };
  return { body: go(node, null, 0), holes };
}
function subtrees(n, out = []) { if (isNode(n)) { out.push(n); for (const c of n.slice(1)) subtrees(c, out); } return out; }
function slugOf(body, key) {
  const names = [];
  for (const n of subtrees(body)) if (!names.includes(n[0])) names.push(n[0]);
  const s = names.slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/g, '');
  return (s || 'macro') + '-' + hashText(key).slice(0, 6);
}
let KERNEL = undefined;
/** The kernel's argument types, when grow/neo-kernel.mjs loads (feature-detected: a macro is still mined without it). */
async function kernelTypes() {
  if (KERNEL !== undefined) return KERNEL;
  try { const k = await import(pathToFileURL(path.join(HERE, 'neo-kernel.mjs')).href); KERNEL = typeof k.argTypes === 'function' && isObj(k.PRIMS) ? k : null; } catch { KERNEL = null; }
  return KERNEL;
}
function typesOf(K, body, holes) {
  if (!K || !Object.hasOwn(K.PRIMS, body[0])) return { in: null, out: null };
  const ins = holes.map((h) => { const a = h.parent ? K.argTypes(h.parent) : null; return a ? a[h.j - 1] ?? K.PRIMS[h.parent].rest ?? null : null; });
  return { in: ins, out: K.PRIMS[body[0]].out ?? null };
}
/**
 * Mine the kept cells for macros (library learning in the manner of DreamCoder's compression step, by counting, no
 * model): every sub-pyramid of two primitives or more, with its literals (and, in a second variant, its sensed inputs)
 * abstracted into parameters, counted by the TASKS whose cells hold it. A body with a memory primitive is left out: a
 * memory cell's power is its own table, not its shape, and the engine writes memory cells directly, not by enumerating
 * them (a macro is a new composite the enumeration can apply). Ranked: tasks, then the nodes it saves
 * (uses x (primitives - 1)), then size; a body already a macro, or one a trial already reverted, is left out.
 * @param {string} root the tree
 * @param {{ minTasks?: number, exclude?: string[], cells?: object[] }} [opts]
 * @returns {Promise<{ cells: number, candidates: object[] }>}
 */
export async function mineMacros(root, { minTasks = KNOBS.minTasks, exclude = [], cells = null } = {}) {
  const list = cells || grownCells(root);
  const K = await kernelTypes();
  const have = new Set([...readMacros(root).macros.map((m) => canonText(m.body)), ...exclude]);
  const seen = new Map();
  for (const c of list) {
    const inCell = new Set();
    for (const sub of subtrees(c.pyramid)) {
      for (const senseHoles of [false, true]) {
        const { body, holes } = abstractOf(sub, senseHoles);
        if (!isNode(body) || countOf(body).prims < 2 || subtrees(body).some((n) => familyOfName(n[0]) === 'memory')) continue;
        const key = canonText(body);
        if (inCell.has(key)) continue;
        inCell.add(key);
        let e = seen.get(key);
        if (!e) { e = { key, body, holes, tasks: new Set(), uses: 0 }; seen.set(key, e); }
        e.tasks.add(c.task);
        e.uses++;
      }
    }
  }
  const out = [];
  for (const e of seen.values()) {
    if (e.tasks.size < minTasks || have.has(e.key)) continue;
    const { size, prims } = countOf(e.body);
    const t = typesOf(K, e.body, e.holes);
    out.push({ name: 'macro.' + slugOf(e.body, e.key), body: e.body, params: e.holes.length, in: t.in, out: t.out, size, prims, from: [...e.tasks].sort(), uses: e.uses, saving: e.uses * (prims - 1), key: e.key });
  }
  out.sort((a, b) => b.from.length - a.from.length || b.saving - a.saving || b.size - a.size || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { cells: list.length, candidates: out };
}
/** How many kept cells name each macro (a node whose primitive is the macro's name). */
function macroUse(cells, names) {
  const use = new Map(names.map((n) => [n, 0]));
  for (const c of cells) for (const n of subtrees(c.pyramid)) if (use.has(n[0])) use.set(n[0], use.get(n[0]) + 1);
  return use;
}
/**
 * The retire pass: a macro a kept cell uses is marked used this era; a macro no kept cell used for `eras` eras (since
 * it was added or last used) leaves MACROS.json, each by a trial row (kind macro, op retire, kept true).
 * @returns {object[]} the retire rows appended
 */
export function retireMacros(root, era, { eras = KNOBS.retireEras, cells = null, now = () => new Date() } = {}) {
  const doc = readMacros(root);
  if (!doc.macros.length) return [];
  const use = macroUse(cells || grownCells(root), doc.macros.map((m) => m.name));
  const rows = [], keep = [];
  let changed = false;
  for (const m of doc.macros) {
    const u = use.get(m.name) || 0;
    if (u > 0 && m.used !== era) { m.used = era; changed = true; }
    const since = Number.isInteger(m.used) ? m.used : Number.isInteger(m.era) ? m.era : era;
    if (u === 0 && era - since >= eras) {
      changed = true;
      rows.push({ at: now().toISOString(), era, kind: 'macro', change: { op: 'retire', name: m.name, key: canonText(m.body), why: 'no kept cell used it for ' + (era - since) + ' eras' }, before: { macros: doc.macros.length, uses: 0, since }, after: null, kept: true, why: 'no kept cell used it for ' + (era - since) + ' eras (the bar is ' + eras + ')' });
    } else keep.push(m);
  }
  if (changed) {
    for (const r of rows) r.after = { macros: keep.length };
    writeJsonAtomic(abs(root, MACROS_FILE), { ...doc, macros: keep });
    for (const r of rows) appendTrial(root, r);
  }
  return rows;
}

// ---------------------------------------------------------------- the candidates of a trial
/**
 * The next genome mutant: mutate(present, "era:<e>:lineage:<l>:try:<a>") for a = 0, 1, ..., the first whose
 * (present id, mutant id) pair no earlier graded trial reverted.
 * @returns {{ current: object, doc: object|null, lineage: number, mutant: object, change: object[], seed: string, beforeId: string, afterId: string }|null}
 */
export function genomeCandidate(root, era, { genes = null, tries = KNOBS.tries, crossEvery = KNOBS.crossEvery } = {}) {
  const doc = readGenomeDoc(root);
  const current = genomeFrom(doc);
  const lineage = isObj(doc) && Number.isInteger(doc.lineage) && doc.lineage >= 0 ? doc.lineage : 0;
  const beforeId = genomeId(current);
  const rows = readTrials(root);
  const tried = new Set(rows.filter((r) => r.kind === 'genome' && graded(r) && typeof r.beforeId === 'string').map((r) => r.beforeId + '>' + r.afterId));
  const inGenes = (change) => !genes || change.every((c) => genes.includes(c.gene));
  // CROSSOVER: every crossEvery-th graded genome trial, a child of the two most promising mutants no trial kept (or of
  // the present genome and the one there is), each gene taken whole from one parent; a child equal to a parent, to the
  // present genome or to a tried pair is not drawn
  const n = rows.filter((r) => r.kind === 'genome' && (graded(r) || r.kept === true)).length;
  if (Number.isInteger(crossEvery) && crossEvery > 0 && n % crossEvery === crossEvery - 1) {
    const ps = partners(rows, current, { genes });
    const pair = ps.length >= 2 ? [ps[0], ps[1]] : ps.length === 1 ? [{ id: beforeId, genome: current }, ps[0]] : null;
    if (pair) {
      const ids = new Set([beforeId, pair[0].id, pair[1].id]);
      for (let a = 0; a < tries; a++) {
        const seed = 'cross:era:' + era + ':lineage:' + lineage + ':try:' + a;
        const c = crossover(pair[0].genome, pair[1].genome, seed);
        const afterId = genomeId(c.genome), change = diff(current, c.genome);
        if (ids.has(afterId) || !change.length || !inGenes(change) || tried.has(beforeId + '>' + afterId)) continue;
        return { current, doc, lineage, mutant: c.genome, change, seed, beforeId, afterId, op: 'crossover', parents: [pair[0].id, pair[1].id] };
      }
    }
  }
  for (let a = 0; a < tries; a++) {
    const seed = 'era:' + era + ':lineage:' + lineage + ':try:' + a;
    const m = mutate(current, seed, genes ? { genes } : {});
    if (!m.change.length) continue;
    const afterId = genomeId(m.genome);
    if (tried.has(beforeId + '>' + afterId)) continue;
    return { current, doc, lineage, mutant: m.genome, change: m.change, seed, beforeId, afterId, op: 'mutate', parents: null };
  }
  return null;
}
/**
 * The promising mutants no trial kept, as genomes over the present one (its genes with the trial's change applied):
 * genome trials not kept, not skipped, not blocked, whose deciding sample's first run said better or faster (a second run
 * that disagreed, no time to confirm). Ranked by that run's held-out gain, then its speed ratio, then the later era; one
 * per genome; none equal to the present genome; with `genes`, only those that move no other gene.
 * @param {object[]} rows the rows of TRIALS.jsonl
 * @param {object} current the present genome
 * @returns {{ id: string, genome: object, gain: number[], era: number }[]}
 */
export function partners(rows, current, { genes = null } = {}) {
  const out = new Map(), here = genomeId(current);
  for (const r of rows) {
    if (!isObj(r) || r.kind !== 'genome' || r.kept === true || r.skipped || r.blocked || !Array.isArray(r.change) || !r.change.length || !Array.isArray(r.verdicts)) continue;
    const lead = isObj(r.grew) ? r.verdicts[1] : r.verdicts[0];
    if (lead !== 'better' && lead !== 'faster') continue;
    const moves = r.change.filter((c) => isObj(c) && typeof c.gene === 'string');
    const g = genomeFrom({ ...current, ...Object.fromEntries(moves.map((c) => [c.gene, c.to])) });
    const id = genomeId(g);
    if (id === here || out.has(id)) continue;
    if (genes && diff(current, g).some((c) => !genes.includes(c.gene))) continue;
    const b = isObj(r.before) ? r.before : {}, a = isObj(r.after) ? r.after : {};
    out.set(id, { id, genome: g, gain: [num(a.heldoutOk) - num(b.heldoutOk), num(b.cps) > 0 ? num(a.cps) / num(b.cps) : 0], era: Number.isInteger(r.era) ? r.era : 0 });
  }
  return [...out.values()].sort((x, y) => (y.gain[0] - x.gain[0]) || (y.gain[1] - x.gain[1]) || (y.era - x.era));
}
/**
 * The next macro: the best mined candidate that is not a macro yet and that no earlier graded trial reverted.
 * @returns {Promise<{ skip?: string, doc?: object, macro?: object, change?: object, cells?: number, rank?: number }>}
 */
export async function macroCandidate(root, era, { minTasks = KNOBS.minTasks, now = () => new Date() } = {}) {
  const doc = readMacros(root);
  const tried = readTrials(root).filter((r) => r.kind === 'macro' && graded(r) && isObj(r.change) && r.change.op === 'add' && typeof r.change.key === 'string').map((r) => r.change.key);
  const { cells, candidates } = await mineMacros(root, { minTasks, exclude: tried });
  if (!candidates.length) return { skip: cells ? 'no sub-pyramid of two primitives recurs across ' + minTasks + ' tasks that is not a macro or a reverted trial yet (' + cells + ' kept cells mined)' : 'no kept cell in grown/ to mine yet' };
  const c = candidates[0];
  const macro = { name: c.name, body: c.body, params: c.params, in: c.in, out: c.out, size: c.size, from: c.from, at: now().toISOString(), era };
  const change = { op: 'add', name: c.name, body: c.body, params: c.params, size: c.size, from: c.from, uses: c.uses, key: c.key };
  return { doc, macro, change, cells, rank: candidates.length };
}

// ---------------------------------------------------------------- the scratch roots
const SCRATCH_MARK = '.evolve-scratch';
function rmScratch(dir) { try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 6, retryDelay: 250 }); return !fs.existsSync(dir); } catch { return false; } }
/** Remove scratch roots an earlier step left behind (a process killed mid trial): evolve-* under tmp that hold the mark, older than maxAgeMs. */
export function sweepStale(tmp, maxAgeMs = 3600000) {
  let n = 0;
  let names = [];
  try { names = fs.readdirSync(tmp); } catch { return 0; }
  for (const name of names) {
    if (!name.startsWith('evolve-')) continue;
    const d = path.join(tmp, name);
    try { const st = fs.statSync(path.join(d, SCRATCH_MARK)); if (Date.now() - st.mtimeMs > maxAgeMs && rmScratch(d)) n++; } catch { /* not ours */ }
  }
  return n;
}

// ---------------------------------------------------------------- one trial: two arms, one or two runs
function runTrial({ scratch, template, engine, sample, grown = null, budget, gen, deadline, env, variant, o, stage }) {
  const runs = [], verdicts = [];
  let blocked = null, failed = null, unconfirmed = null, close = null, grew = null;
  const part = (a) => (a ? { ...scoreOf(a), tasks: a.tasks, ...(a.blocked ? { blocked: a.blocked } : {}) } : null);
  // one run: both arms on `tasks` in `order`; false when an arm blocked or failed (the trial ends)
  const once = (k, order, tasks) => {
    const res = {};
    for (const which of order) {
      const arm = path.join(scratch, which + '-' + k);
      fs.cpSync(template, arm, { recursive: true });
      variant(arm, which);
      const st = stage ? path.join(scratch, 'stage-' + which + '-' + k) : null;
      if (st) fs.mkdirSync(st, { recursive: true });
      res[which] = runArm({ engine: engine || path.join(arm, ENGINE), root: arm, tasks, gen, budget, deadline, env, slackMs: o.slackMs, minGrowMs: o.minGrowMs, stage: st });
      rmScratch(arm);
      const b = res[which].blocked;
      if (b) {
        if (which === 'base' || b.startsWith('out of time')) blocked = (b.startsWith('out of time') ? 'the clock ran out in the ' + (which === 'base' ? 'present' : 'mutant') + ' arm: ' : 'the present engine failed: ') + b;
        else failed = 'the mutant made the engine fail: ' + b;
        runs.push({ order, base: part(res.base), mut: part(res.mut), verdict: null });
        return null;
      }
    }
    const v = verdictOf(res.base, res.mut, o.faster);
    verdicts.push(v);
    runs.push({ order, base: part(res.base), mut: part(res.mut), verdict: v });
    return res;
  };
  const first = once(0, ['base', 'mut'], sample.tasks);
  const c = first ? tooClose(first.base, first.mut, o.close) : { close: false };
  let d = null;
  if (c.close) close = c.apart;
  if (first && c.close && grown && grown.tasks.length > sample.tasks.length) {
    // TOO CLOSE TO CALL: the sample grows (the next tasks of the same deterministic draw) and the grown sample decides,
    // in both arm orders; a mutant worse or equal in the grown sample's first run is reverted at once
    const from = sample.tasks.length, to = grown.tasks.length, head = 'the first run was too close to call (' + c.apart + ' held-out row' + (c.apart === 1 ? '' : 's') + ' apart)';
    const need = Math.ceil(((runs[0].base.ms + runs[0].mut.ms) * to) / Math.max(1, from)) * 2, left = deadline - Date.now();
    if (left < need) unconfirmed = head + ' and no time is left to grow the sample to ' + to + ' tasks (' + need + ' ms needed, ' + Math.max(0, left) + ' ms were left)';
    else {
      grown.add();
      grew = { from, to, tasks: grown.tasks.slice() };
      for (let k = 1; k <= 2 && !blocked && !failed; k++) {
        if (k === 2 && verdicts[1] !== 'better' && verdicts[1] !== 'faster') break;
        once(k, k === 1 ? ['base', 'mut'] : ['mut', 'base'], grown.tasks);
      }
      if (!blocked && !failed) { const g = decide(verdicts.slice(1)); d = { kept: g.kept, why: head + '; on the sample grown to ' + to + ' tasks: ' + g.why }; }
    }
  } else if (first && (verdicts[0] === 'better' || verdicts[0] === 'faster')) {
    const need = runs[0].base.ms + runs[0].mut.ms, left = deadline - Date.now();
    if (left < need) unconfirmed = 'no time left for the second run (the first took ' + need + ' ms, ' + Math.max(0, left) + ' ms were left)';
    else once(1, ['mut', 'base'], sample.tasks);
  }
  if (!d) d = blocked ? { kept: false, why: blocked } : failed ? { kept: false, why: failed } : unconfirmed ? { kept: false, why: unconfirmed } : decide(verdicts);
  return { runs, verdicts, kept: d.kept, why: d.why, blocked, unconfirmed, close, grew };
}
/** Copy every file of the given tasks from root into a scratch root, by path (bytes, never read row by row). */
function addTasks(root, dest, tasks) {
  let files = 0;
  for (const t of tasks) for (const r of walk(abs(root, TASKS_DIR + '/' + t))) { copyFile(root, dest, TASKS_DIR + '/' + t + '/' + r); files++; }
  return files;
}

/** The era a step runs as when none is given: one after the last era in TRIALS.jsonl. */
function defaultEra(root) { return readTrials(root).reduce((m, r) => (Number.isInteger(r.era) && r.era > m ? r.era : m), 0) + 1; }
/** The counts of TRIALS.jsonl. */
export function counts(rows) {
  let kept = 0, reverted = 0, skipped = 0, blocked = 0, retired = 0;
  for (const r of rows) {
    if (r.skipped) skipped++;
    else if (isObj(r.change) && r.change.op === 'retire') retired++;
    else if (r.kept === true) kept++;
    else if (r.blocked) blocked++;
    else reverted++;
  }
  return { kept, reverted, skipped, blocked, retired };
}

/**
 * STEP: one trial (grow/evolve.mjs header, (a) to (f)), bounded by maxMs. Resolves with the step's line.
 * @param {string} root the tree
 * @param {{ era?: number, maxMs?: number, sample?: number, generated?: number, kind?: "genome"|"macro", genes?: string[], engine?: string, tmp?: string, env?: object, now?: Function }} opts
 * @returns {Promise<object>}
 */
export async function step(root = DEFAULT_ROOT, opts = {}) {
  const t0 = Date.now();
  root = path.resolve(root);
  const o = { ...KNOBS };
  for (const k of Object.keys(KNOBS)) if (opts[k] !== undefined) o[k] = opts[k];
  const now = typeof opts.now === 'function' ? opts.now : () => new Date();
  const era = Number.isInteger(opts.era) && opts.era >= 0 ? opts.era : defaultEra(root);
  const deadline = t0 + o.maxMs;
  const env = { ...process.env, ...(isObj(opts.env) ? opts.env : {}) };
  const tmp = path.resolve(opts.tmp || os.tmpdir());
  if (inside(root, tmp)) throw new Fail('refused: the scratch directory ' + tmp + ' is inside the tree ' + root);
  const engine = opts.engine ? path.resolve(opts.engine) : null;
  const genes = Array.isArray(opts.genes) && opts.genes.length ? opts.genes : null;
  fs.mkdirSync(tmp, { recursive: true });
  const swept = sweepStale(tmp);
  const retired = retireMacros(root, era, { eras: o.retireEras, now });
  const kinds = opts.kind ? [opts.kind] : era % 2 === 1 ? ['genome', 'macro'] : ['macro', 'genome'];
  const skipped = [];
  const skip = (kind, why) => { appendTrial(root, { at: now().toISOString(), era, kind, change: null, before: null, after: null, kept: false, skipped: why }); skipped.push(kind + ': ' + why); };
  const sample = sampleTasks(root, era, o.sample);
  // the grow budget: a quarter of the step over the sample's tasks, over the engine's measured overrun; the cells are
  // sized to that time too (at most cpsFloor a second, never under minGenerated), since the engine's grow runs on to
  // --max-generated whatever its --max-ms (on a copy of the tree three grows told --max-ms 5000 and --max-generated
  // 20000 took 33774 ms; in a step told 115000 ms, the arms of a first run of 3 grows told --max-ms 9583 took 37953 ms
  // and 37455 ms, so a second run could not have fit)
  const over = overrun(readTrials(root));
  const growMs = Math.max(o.minGrowMs, Math.floor(o.maxMs / (4 * Math.max(1, sample.tasks.length) * over)));
  const budget = { maxGenerated: Math.max(o.minGenerated, Math.min(o.generated, Math.floor((growMs / 1000) * o.cpsFloor))), maxMs: growMs, ...(over > 1 ? { overrun: over } : {}) };
  const gen = Math.max(1, era);
  let row = null, copied = null, scratchLeft = false;
  if (!sample.tasks.length) for (const k of kinds) skip(k, 'no opened task with a dev and a held-out set in ' + LEDGER_FILE);
  else {
    const scratch = fs.mkdtempSync(path.join(tmp, 'evolve-'));
    fs.writeFileSync(path.join(scratch, SCRATCH_MARK), String(process.pid));
    try {
      const template = path.join(scratch, 'template');
      copied = copyRoot(root, template, { tasks: sample.tasks });
      const feat = engineFeatures(engine || path.join(template, ENGINE), template, { env, timeoutMs: Math.max(1000, Math.min(120000, deadline - Date.now())) });
      for (const kind of kinds) {
        const need = kind === 'genome' ? 'genome' : 'macros';
        if (!feat.features.includes(need)) { skip(kind, 'the engine cannot load ' + (kind === 'genome' ? 'a genome' : 'macros') + ' yet: its status features ' + JSON.stringify(feat.features) + ' lack "' + need + '"' + (feat.why ? ' (' + feat.why + ')' : '')); continue; }
        let prep;
        if (kind === 'genome') {
          prep = genomeCandidate(root, era, { genes, tries: o.tries, crossEvery: o.crossEvery });
          if (!prep) { skip(kind, 'each of ' + o.tries + ' drawn mutants was already tried and reverted'); continue; }
        } else {
          prep = await macroCandidate(root, era, { minTasks: o.minTasks, now });
          if (prep.skip) { skip(kind, prep.skip); continue; }
        }
        const variant = kind === 'genome'
          ? (arm, which) => { if (which === 'mut') writeJsonAtomic(abs(arm, GENOME_FILE), { version: GENOME_VERSION, genes: { ...prep.mutant }, lineage: prep.lineage + 1, trial: true }); }
          : (arm, which) => { if (which === 'mut') writeJsonAtomic(abs(arm, MACROS_FILE), { ...prep.doc, macros: [...prep.doc.macros, prep.macro] }); };
        // the grown sample: the next tasks of the same draw, copied into the template only when a run is too close to call
        const big = sampleTasks(root, era, Math.max(o.sample, Math.floor(o.sample * o.grow)));
        const grown = big.tasks.length > sample.tasks.length ? { tasks: big.tasks, add: () => addTasks(root, template, big.tasks.filter((x) => !sample.tasks.includes(x))) } : null;
        const t = runTrial({ scratch, template, engine, sample, grown, budget, gen, deadline, env, variant, o, stage: feat.features.includes('stage') });
        const at = now().toISOString();
        // before and after: the first run of the sample that decided (the grown one when the sample grew)
        const lead = t.grew && t.runs[1] && t.runs[1].base ? t.runs[1] : t.runs[0];
        row = {
          at, era, kind, change: kind === 'genome' ? prep.change : prep.change, before: lead ? lead.base && scoreOf(lead.base) : null,
          after: lead && lead.mut ? scoreOf(lead.mut) : null, kept: t.kept, why: t.why,
          ...(kind === 'genome' ? { seed: prep.seed, beforeId: prep.beforeId, afterId: prep.afterId, lineage: prep.lineage, op: prep.op, parents: prep.parents } : { mined: prep.cells, candidates: prep.rank }),
          sample, budget, gen, faster: o.faster, verdicts: t.verdicts, runs: t.runs, close: t.close, grew: t.grew, ...(t.blocked ? { blocked: t.blocked } : {}), ...(t.unconfirmed ? { unconfirmed: true } : {}),
        };
        if (t.kept) {
          try {
            if (kind === 'genome') {
              const hist = isObj(prep.doc) && Array.isArray(prep.doc.history) ? prep.doc.history.slice(-49) : [];
              writeJsonAtomic(abs(root, GENOME_FILE), { version: GENOME_VERSION, genes: { ...prep.mutant }, lineage: prep.lineage + 1, era, at, id: prep.afterId, change: prep.change, history: [...hist, { era, at, op: prep.op, change: prep.change, before: row.before, after: row.after }] });
            } else writeJsonAtomic(abs(root, MACROS_FILE), { ...prep.doc, macros: [...prep.doc.macros, prep.macro] });
          } catch (e) { row.kept = false; row.why = 'kept by the trial but the write failed: ' + first(e); }
        }
        row.ms = Date.now() - t0;
        appendTrial(root, row);
        break;
      }
    } finally {
      scratchLeft = !rmScratch(scratch);
    }
  }
  const doc = readGenomeDoc(root);
  return {
    era, kind: row ? row.kind : null, op: row && row.op ? row.op : null, kept: row ? row.kept : false, why: row ? row.why : null, change: row ? describe(row.change) : null, grew: row && row.grew ? { from: row.grew.from, to: row.grew.to } : null,
    before: row ? row.before : null, after: row ? row.after : null, verdicts: row ? row.verdicts : [], sample: sample.tasks, budget,
    copied: copied ? { files: copied.files, bytes: copied.bytes } : null, skipped, retired: retired.length, swept, scratchLeft,
    trials: counts(readTrials(root)), lineage: isObj(doc) && Number.isInteger(doc.lineage) ? doc.lineage : 0, macros: readMacros(root).macros.length, ms: Date.now() - t0,
  };
}

// ---------------------------------------------------------------- (4) status
const brief = (r) => ({ at: r.at ?? null, era: r.era ?? null, kind: r.kind ?? null, change: describe(r.change), kept: r.kept === true, ...(r.skipped ? { skipped: r.skipped } : { why: r.why ?? null }), before: r.before ?? null, after: r.after ?? null });
/**
 * STATUS: kept, reverted, skipped, blocked and retired counts, the genome lineage (kept genome changes deep), the genes
 * that differ from today's defaults, the macros, and the last 5 trial rows.
 * @param {string} root the tree
 * @returns {object}
 */
export function status(root = DEFAULT_ROOT) {
  const rows = readTrials(root), doc = readGenomeDoc(root), g = genomeFrom(doc);
  return {
    trials: rows.length, ...counts(rows), lineage: isObj(doc) && Number.isInteger(doc.lineage) ? doc.lineage : 0, genome: genomeId(g),
    changed: diff(GENOME_DEFAULTS, g), macros: readMacros(root).macros.map((m) => m.name), last: rows.slice(-5).map(brief),
  };
}

// ---------------------------------------------------------------- CLI
const FLAGS = new Set(['root', 'era', 'max-ms', 'sample', 'generated', 'kind', 'genes', 'engine', 'tmp']);
function parseFlags(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const k = a.slice(2);
    if (!FLAGS.has(k)) throw new Fail('usage: unknown flag --' + k + '\n' + USAGE, 2);
    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Fail('usage: --' + k + ' needs a value\n' + USAGE, 2);
    flags[k] = argv[++i];
  }
  return { pos, flags };
}
const intFlag = (v, name, min = 1) => { if (v === undefined) return undefined; const n = Number(v); if (!Number.isInteger(n) || n < min) throw new Fail('usage: --' + name + ' is an integer from ' + min + '\n' + USAGE, 2); return n; };
/**
 * The CLI: step, status, mine. Prints one JSON line last; resolves to the exit code (0, 1 a failure, 2 usage).
 * @param {string[]} argv the arguments after the script
 * @param {{ log?: Function, err?: Function, env?: object }} io
 * @returns {Promise<number>}
 */
export async function main(argv = process.argv.slice(2), { log = console.log, err = console.error, env = undefined } = {}) {
  try {
    const { pos, flags } = parseFlags(argv);
    const verb = pos[0];
    if (pos.length !== 1 || !['step', 'status', 'mine'].includes(verb)) throw new Fail('usage: one verb of step, status, mine\n' + USAGE, 2);
    const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
    let out;
    if (verb === 'step') {
      if (flags.kind !== undefined && !['genome', 'macro'].includes(flags.kind)) throw new Fail('usage: --kind is genome or macro\n' + USAGE, 2);
      const genes = flags.genes === undefined ? undefined : flags.genes.split(',').map((s) => s.trim()).filter(Boolean);
      const known = new Set(GENES.map((g) => g.name));
      if (genes && (!genes.length || genes.some((g) => !known.has(g)))) throw new Fail('usage: --genes names genes of grow/genome.mjs GENES\n' + USAGE, 2);
      out = await step(root, {
        era: intFlag(flags.era, 'era', 0), maxMs: intFlag(flags['max-ms'], 'max-ms'), sample: intFlag(flags.sample, 'sample'), generated: intFlag(flags.generated, 'generated'),
        kind: flags.kind, genes, engine: flags.engine, tmp: flags.tmp, env,
      });
    } else if (verb === 'mine') {
      const m = await mineMacros(root);
      out = { cells: m.cells, candidates: m.candidates.length, top: m.candidates.slice(0, 5).map((c) => ({ name: c.name, size: c.size, params: c.params, in: c.in, out: c.out, tasks: c.from.length, uses: c.uses, saving: c.saving, body: c.body })), macros: readMacros(root).macros.length };
    } else out = status(root);
    log(JSON.stringify(out));
    return 0;
  } catch (e) {
    const code = e instanceof Fail ? e.code : 1;
    err('evolve: ' + (e instanceof Fail ? e.message : first(e)));
    log(JSON.stringify({ ok: false, error: first(e), code }));
    return code;
  }
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  main().then((code) => { process.exitCode = code; });
}
