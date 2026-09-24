// self/improve.mjs: THE IMPROVE EVIDENCE MODE (Board 14, item operators).
//
// His order of 2026-09-24 12:02: "Its gotta work without me. Thats the most important part. EVERY
// GAP should be able to be filled by itself, ur just the engineer to author it". The autopilot's
// three evidence modes judge a patch against a TEST (fix: fails then passes; preserve: passes both
// sides; faster: passes both sides in 80 percent of the time). None of them can say whether a patch
// moved a NUMBER toward a BAR. This one can, and it never writes the real tree: everything runs on a
// temp copy, and applying a kept patch to the real tree is the loop's job (Board 14, wave 2).
//
// One improve() call is one (gap, operator) round:
//
//   1. COPY. The tree is copied to a temp directory with the autopilot's skip list (self/code.mjs
//      COPY_SKIP: state, .git, node_modules, site) plus the board's: organism/ (only each seed's
//      manifest.json comes along, a few hundred bytes, so the gate's LOAD-BEARING row can still
//      read which seeds exist; a trial that needs a seed names it in gap.copyInclude), bench/fixtures/
//      and web/dist/. Timestamps are preserved (a census counts a seed "by time" from its manifest's
//      mtime).
//   2. BASELINE. The gap's trial runs UNPATCHED on the copy, TWICE, unless
//      state/self/operators/baselines.jsonl holds that command's metric from today for the same
//      bytes of the gap's files. The NOISE BAND is the spread of the two runs, or 5 percent of the
//      distance to the bar when they agree exactly: measured, never assumed.
//   3. TRIALS. The operator (self/operators.mjs) yields candidate diffs. Each is vetted (every file on
//      the gap's files list and under the autopilot's ceiling; an author diff at most 60 changed
//      lines), applied to the copy, the trial is run under tools/budget.mjs (RAM cap, disk cap on the
//      copy, a 10 minute wall), the metric read, and the file restored to its pre-patch bytes. The
//      operator gets the result back and picks its next step.
//   4. DECIDE. The operator's best candidate is KEPT only when (a) it moved the metric toward the bar
//      by more than the noise band, and a CONFIRMATION run of the same patch did too (the kept
//      "after" is the less favourable of the two: a best-of-six pick is not its own evidence);
//      (b) the touched tests pass on the copy (every test file whose imports resolve to a patched
//      file, plus gap.tests); (c) node bench/gate.mjs --quiet is GREEN on the copy.
//   5. RECORD. Every trial, kept or refused, is one JSON line in state/self/operators/<date>.jsonl
//      (operator, knob or name, before, after, noise, seconds, reason), and one decision line closes
//      the round. Every line is written while the copy still exists (copyAlive: true is measured at
//      the write); the copy is deleted after the last line and the deletion is verified.
//
// Returns {patch, operator, knob, name, before, after, noise, gateHash, ...} for a kept candidate,
// {reason, ...} otherwise.
import {
  readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, rmSync, readdirSync, statSync,
  mkdtempSync, cpSync, statfsSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { COPY_SKIP, applyUnifiedPatch } from './code.mjs';
import { splitCommand } from './autopilot.mjs';
import { OPERATORS, makeBudget, vetDiff, allowedFiles, MAX_CHANGED_LINES } from './operators.mjs';
import { filesOfDiff } from './knobs.mjs';
import { budget as runBudgeted } from '../tools/budget.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
/** The autopilot's skip list plus the board's: organism/, bench/fixtures/ and web/dist/. */
export const COPY_EXCLUDE = Object.freeze([...COPY_SKIP, 'organism', 'bench/fixtures', 'web/dist']);
export const TRIAL_WALL_MS = 10 * 60_000;
export const GATE_WALL_MS = 60 * 60_000;
export const STATE_REL = 'state/self/operators';
export const RAM_MB = 6000;
export const HEAP_MB = 6000;
export const WAIT_FREE_RAM_MB = 16384;
export const DEFAULT_GATE_CMD = 'node bench/gate.mjs --quiet';
const MB = 1048576;
export const COPY_PREFIX = 'brain-operators-';
/** Written into the temp top of a NESTED copy by copyTree, and only there: deleteCopy removes a parent only when it carries this. */
export const TOP_MARKER = '.brain-operators-top';

const r6 = (x) => (x === null || x === undefined || !Number.isFinite(x) ? null : Number(Number(x).toPrecision(10)));
export const today = (d = new Date()) => d.toISOString().slice(0, 10);
const sha = (b) => createHash('sha256').update(b).digest('hex');
const firstLine = (e) => String((e && e.message) || e).split('\n')[0];

// ------------------------------------------------------------------ the copy
function dirBytes(dir) {
  let bytes = 0, files = 0, ents;
  try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return { bytes: 0, files: 0 }; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    try { if (e.isDirectory()) { const d = dirBytes(p); bytes += d.bytes; files += d.files; } else { bytes += statSync(p).size; files++; } } catch { /* raced */ }
  }
  return { bytes, files };
}

/** Free MB on the volume that holds dir (statfs), or null. */
export function freeMb(dir = os.tmpdir()) {
  try { const s = statfsSync(dir); return Math.round((s.bavail * s.bsize) / MB); } catch { return null; }
}

/**
 * Copy the tree to a fresh temp directory: everything except COPY_EXCLUDE (a path excluded when its
 * relative path is one of them or lies under one), then each seed's organism/<seed>/manifest.json,
 * then every path of `include` (a seed, a fixture) whole. Timestamps preserved.
 * @returns {{dir, ms, bytes, files, include}}
 */
export function copyTree(root, { include = [], exclude = COPY_EXCLUDE, manifests = true, prefix = COPY_PREFIX, tmpRoot = null, nest = path.basename(root) } = {}) {
  const t0 = Date.now();
  const base = tmpRoot || os.tmpdir();
  mkdirSync(base, { recursive: true });
  // The copy sits one level down (<tmp>/brain-operators-XXXX/brain) so a path the code resolves
  // beside the tree (tasks/venue.mjs reads ../trader/data/trader.db) lands inside the temp top,
  // where the gate kit can put a copy of it, and never on a shared or real path.
  const top = mkdtempSync(path.join(base, prefix));
  const dir = nest ? path.join(top, nest) : top;
  mkdirSync(dir, { recursive: true });
  if (dir !== top) writeFileSync(path.join(top, TOP_MARKER), 'a temp top made by self/improve.mjs copyTree; deleted with its copy\n');
  const ex = exclude.map((e) => e.replaceAll('\\', '/'));
  cpSync(root, dir, {
    recursive: true, preserveTimestamps: true,
    filter: (src) => {
      const rel = path.relative(root, src).replaceAll('\\', '/');
      if (!rel) return true;
      return !ex.some((e) => rel === e || rel.startsWith(e + '/'));
    },
  });
  const org = path.join(root, 'organism');
  if (manifests && existsSync(org)) {
    for (const e of readdirSync(org, { withFileTypes: true })) {
      const mf = path.join(org, e.name, 'manifest.json');
      if (e.isDirectory() && existsSync(mf)) { mkdirSync(path.join(dir, 'organism', e.name), { recursive: true }); cpSync(mf, path.join(dir, 'organism', e.name, 'manifest.json'), { preserveTimestamps: true }); }
    }
  }
  const added = [];
  for (const rel of include) {
    const src = path.join(root, rel);
    if (!existsSync(src)) continue;
    cpSync(src, path.join(dir, rel), { recursive: true, preserveTimestamps: true });
    added.push(rel);
  }
  const d = dirBytes(dir);
  return { dir, top, ms: Date.now() - t0, bytes: d.bytes, files: d.files, include: added };
}

/** The temp top that holds a copy: its parent when copyTree nested it (the parent carries TOP_MARKER), else the dir itself. */
export function copyTop(dir) {
  const parent = path.dirname(dir);
  return existsSync(path.join(parent, TOP_MARKER)) ? parent : dir;
}

/**
 * THE GATE KIT. MEASURED 2026-09-24: the real gate on a trial copy (organism/, bench/fixtures/,
 * web/dist/, state/ left out) was RED, test files 66 of 83, while the same gate was GREEN on the
 * real tree: 17 test files read small fixtures (bench/fixtures/answer-questions.json,
 * code-tasks.json, ...) or a small seed. So before the touched tests and the gate, the copy gets
 * what they read and nothing the size of the big stores: every bench/fixtures file up to
 * fixturesMaxBytes (10 MB; 830 of 836 files, about 24 MB; the six left out are five files of the
 * wiki store and the simplewiki dump) and every organism seed whose directory is at most
 * seedMaxBytes (30 MB; never the scale seeds, 270 MB each). Timestamps preserved.
 * MEASURED on the kit copy: 84 of 87 test files; test/daemon.test.mjs still failed on "ingest ran
 * 0 times" because the daemon's ingest step opens the knowledge store (act/prompt.mjs KNOWLEDGE_DIR,
 * bench/fixtures/wiki/store), which is one unit: a store with five files missing does not open. So a
 * WHOLE_DIRS entry is copied whole when it is at most its cap (the store is 388459374 bytes, the cap
 * 512 MB); the 386 MB simplewiki dump, which no test reads, stays out. Returns what was added.
 */
export const GATE_KIT = Object.freeze({ fixturesMaxBytes: 10 * MB, seedMaxBytes: 30 * MB, distMaxBytes: 5 * MB, siblingMaxBytes: 300 * MB });
/** Directories the kit copies as one unit (every file, whatever its size) when the whole is at most maxBytes. */
export const WHOLE_DIRS = Object.freeze([Object.freeze({ rel: 'bench/fixtures/wiki/store', maxBytes: 512 * MB })]);
/**
 * Files the tree reads BESIDE itself. MEASURED 2026-09-24: on a copy with no ../trader/data/trader.db,
 * tasks/venue.mjs falls back to a synthetic tape and test/venue-suite.test.mjs reads a hosting score
 * of 0.125 where the verdict and notes/world.md publish 0.0625. A copy of the file (236 MB, never a
 * link: trader/ is frozen and a link would let the copy write it) goes beside a NESTED copy only.
 */
export const SIBLING_READS = Object.freeze(['../trader/data/trader.db']);
/**
 * Copy each SIBLING_READS file beside a nested copy (inside its own temp top, never onto a shared
 * path). Returns {files, bytes, left}.
 */
export function addSiblings(copyDir, kitRoot = ROOT, { siblings = SIBLING_READS, maxBytes = GATE_KIT.siblingMaxBytes } = {}) {
  const out = { files: [], bytes: 0, left: [] };
  const top = copyTop(copyDir);
  for (const rel of siblings) {
    const src = path.resolve(kitRoot, rel), dst = path.resolve(copyDir, rel);
    if (!existsSync(src)) continue;
    const r = path.relative(top, dst);
    const inside = top !== copyDir && r && !r.startsWith('..') && !path.isAbsolute(r);
    const b = statSync(src).size;
    if (!inside || b > maxBytes) { out.left.push({ file: rel, bytes: b, why: inside ? 'over the cap' : 'the copy is not nested' }); continue; }
    if (!existsSync(dst)) { mkdirSync(path.dirname(dst), { recursive: true }); cpSync(src, dst, { preserveTimestamps: true }); }
    out.files.push(rel); out.bytes += b;
  }
  return out;
}

export function addGateKit(copyDir, kitRoot = ROOT, { fixturesMaxBytes = GATE_KIT.fixturesMaxBytes, seedMaxBytes = GATE_KIT.seedMaxBytes, distMaxBytes = GATE_KIT.distMaxBytes, siblingMaxBytes = GATE_KIT.siblingMaxBytes, siblings = SIBLING_READS, wholeDirs = WHOLE_DIRS } = {}) {
  const t0 = Date.now();
  const out = { fixtures: { files: 0, bytes: 0, left: [] }, seeds: { names: [], bytes: 0, left: [] }, dist: { bytes: 0, left: null }, siblings: { files: [], bytes: 0, left: [] }, whole: { dirs: [], bytes: 0, left: [] } };
  const wholeRels = [];
  for (const w of wholeDirs) {
    const src = path.join(kitRoot, ...w.rel.split('/'));
    if (!existsSync(src)) continue;
    const b = dirBytes(src).bytes;
    if (b > w.maxBytes) { out.whole.left.push({ dir: w.rel, bytes: b }); continue; }
    cpSync(src, path.join(copyDir, ...w.rel.split('/')), { recursive: true, preserveTimestamps: true, force: true });
    out.whole.dirs.push(w.rel); out.whole.bytes += b; wholeRels.push(w.rel + '/');
  }
  out.siblings = addSiblings(copyDir, kitRoot, { siblings, maxBytes: siblingMaxBytes });
  // web/dist (1.2 MB): test/findings.test.mjs reads web/dist/index.html
  const dist = path.join(kitRoot, 'web', 'dist');
  if (existsSync(dist)) {
    const b = dirBytes(dist).bytes;
    if (b <= distMaxBytes) { cpSync(dist, path.join(copyDir, 'web', 'dist'), { recursive: true, preserveTimestamps: true, force: true }); out.dist.bytes = b; } else out.dist.left = b;
  }
  const fx = path.join(kitRoot, 'bench', 'fixtures');
  const walk = (d) => {
    let ents; try { ents = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      let size = 0; try { size = statSync(p).size; } catch { continue; }
      const rel = path.relative(kitRoot, p);
      if (wholeRels.some((w) => rel.split(path.sep).join('/').startsWith(w))) continue;
      if (size > fixturesMaxBytes) { out.fixtures.left.push({ file: rel.replaceAll('\\', '/'), bytes: size }); continue; }
      const dst = path.join(copyDir, rel);
      if (existsSync(dst)) continue;
      mkdirSync(path.dirname(dst), { recursive: true });
      cpSync(p, dst, { preserveTimestamps: true });
      out.fixtures.files++; out.fixtures.bytes += size;
    }
  };
  if (existsSync(fx)) walk(fx);
  const org = path.join(kitRoot, 'organism');
  if (existsSync(org)) {
    for (const e of readdirSync(org, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const src = path.join(org, e.name);
      const b = dirBytes(src).bytes;
      if (b > seedMaxBytes) { out.seeds.left.push({ seed: e.name, bytes: b }); continue; }
      cpSync(src, path.join(copyDir, 'organism', e.name), { recursive: true, preserveTimestamps: true, force: true });
      out.seeds.names.push(e.name); out.seeds.bytes += b;
    }
  }
  out.bytes = out.fixtures.bytes + out.seeds.bytes + out.dist.bytes + out.siblings.bytes + out.whole.bytes;
  out.ms = Date.now() - t0;
  return out;
}

/**
 * A trial that died on a missing file under bench/fixtures/ or organism/ of the copy names the path
 * in its ENOENT line. That one path (a file, or the seed directory it lies in) is copied from the
 * tree when it is under the kit's size limits, so the trial can run again: the copy stays lean by
 * default and grows only by what a trial proved it reads. Returns the relative paths added.
 */
export function fillMissing(copyDir, kitRoot, out, { fixturesMaxBytes = GATE_KIT.fixturesMaxBytes, seedMaxBytes = GATE_KIT.seedMaxBytes } = {}) {
  const added = [];
  const norm = (s) => s.replaceAll('\\\\', '\\').replaceAll('\\', '/');
  const base = norm(copyDir).toLowerCase() + '/';
  for (const m of String(out).matchAll(/ENOENT[^'"\n]*['"]([^'"\n]+)['"]/g)) {
    const abs = norm(m[1]);
    if (!abs.toLowerCase().startsWith(base)) continue;
    const rel = abs.slice(base.length);
    let pick = null;
    if (rel.startsWith('bench/fixtures/')) {
      const src = path.join(kitRoot, rel);
      if (existsSync(src) && statSync(src).isFile() && statSync(src).size <= fixturesMaxBytes) pick = rel;
    } else if (rel.startsWith('web/dist/')) {
      if (existsSync(path.join(kitRoot, 'web', 'dist'))) pick = 'web/dist';
    } else if (rel.startsWith('organism/')) {
      const seed = rel.split('/').slice(0, 2).join('/');
      const src = path.join(kitRoot, seed);
      if (existsSync(src) && dirBytes(src).bytes <= seedMaxBytes) pick = seed;
    }
    if (!pick || added.includes(pick)) continue;
    cpSync(path.join(kitRoot, pick), path.join(copyDir, pick), { recursive: true, preserveTimestamps: true, force: true });
    added.push(pick);
  }
  return added;
}

/** Delete a copy and verify it is gone. */
export function deleteCopy(dir) {
  let error = null;
  const top = copyTop(dir);
  try { rmSync(top, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) { error = firstLine(e); }
  const gone = !existsSync(top) && !existsSync(dir);
  return { dir, top, deleted: gone, error, freeMb: freeMb() };
}

/** sha256 of each file of a list (relative to root) and of the list: the "files list" hash. */
export function hashFiles(root, files) {
  const per = {};
  for (const f of files) { const p = path.join(root, f); per[f] = existsSync(p) ? sha(readFileSync(p)) : null; }
  return { per, all: sha(JSON.stringify(Object.entries(per).sort())) };
}

/** sha256 of every file under root (relative path and bytes), skipping the given top directories. */
export function hashTree(root, { skip = ['.git', 'node_modules', 'state', 'organism', 'site'] } = {}) {
  const h = createHash('sha256');
  let files = 0;
  const walk = (d) => {
    let ents; try { ents = readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)); } catch { return; }
    for (const e of ents) {
      const p = path.join(d, e.name);
      const rel = path.relative(root, p).replaceAll('\\', '/');
      if (skip.some((s) => rel === s || rel.startsWith(s + '/'))) continue;
      if (e.isDirectory()) walk(p); else { h.update(rel + '\0'); h.update(readFileSync(p)); files++; }
    }
  };
  walk(root);
  return { hash: h.digest('hex'), files };
}

// ------------------------------------------------------------------ the trial
/**
 * argv of a gaps-ledger trial (self/gaps.mjs trialOf): node plus trial.argv, with {tmp} as <copy>/tmp
 * and {copy} as the copy. Its trial.command is a display line ("--dir <copy>") and is never run.
 * Null when the trial carries no argv.
 */
export function ledgerArgv(trial, dir) {
  if (!trial || !Array.isArray(trial.argv) || !trial.argv.length) return null;
  const tmp = path.join(dir, 'tmp');
  return ['node', ...trial.argv.map((a) => String(a).replaceAll('{tmp}', tmp).replaceAll('{copy}', dir))];
}
/** The copy paths a ledger trial reads: its seed and its fixtures. */
export function ledgerIncludes(trial) {
  if (!trial) return [];
  const out = [];
  if (typeof trial.seed === 'string' && trial.seed) out.push(trial.seed.startsWith('organism/') ? trial.seed : 'organism/' + trial.seed);
  for (const f of [].concat(trial.fixtures || [])) if (typeof f === 'string' && f) out.push(f);
  return out;
}

/** argv of a trial command: a tools/budget.mjs prefix is dropped (this file wraps it itself), node gets a heap cap. */
export function trialArgv(command) {
  let argv = splitCommand(command);
  const bi = argv.findIndex((a) => /tools[\\/]budget\.mjs$/.test(a));
  if (bi >= 0) { const dd = argv.indexOf('--', bi); argv = dd >= 0 ? argv.slice(dd + 1) : argv; }
  if (!argv.length) return null;
  if (argv[0] === 'node') {
    argv = [process.execPath, ...argv.slice(1)];
    if (!argv.some((a) => a.startsWith('--max-old-space-size'))) argv.splice(1, 0, '--max-old-space-size=' + HEAP_MB);
  }
  return argv;
}

const cleanEnv = () => { const env = {}; for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS') env[k] = v; return env; };

/**
 * Run one command in dir under tools/budget.mjs (library form): a RAM cap on its whole process tree,
 * a disk cap on dir, a wall clock (AbortSignal), and a wait for free RAM before it starts.
 * @returns {Promise<{exit, outcome, seconds, peakRssMb, out, killed}>}
 */
export async function runCapped(argv, dir, { wallMs = TRIAL_WALL_MS, ramMb = RAM_MB, diskMb = null, waitFreeRamMb = WAIT_FREE_RAM_MB } = {}) {
  const t0 = Date.now();
  let out = '', stdout = '';
  let rec;
  const disk = diskMb || Math.ceil(dirBytes(dir).bytes / MB) + 1024;
  try {
    rec = await runBudgeted(argv[0], argv.slice(1), {
      ramMb, diskMb: disk, dir, cwd: dir, intervalMs: 1000, statusMs: 3_600_000, record: false,
      stdio: ['ignore', 'pipe', 'pipe'], env: cleanEnv(), signal: AbortSignal.timeout(wallMs),
      waitFreeRamMb, waitMaxS: 1800,
      log: (line) => { out += line + '\n'; },
      onSpawn: (child) => {
        child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
        child.stdout.on('data', (d) => { if (out.length < 4_000_000) out += d; if (stdout.length < 4_000_000) stdout += d; });
        child.stderr.on('data', (d) => { if (out.length < 4_000_000) out += d; });
      },
    });
  } catch (e) {
    rec = { outcome: 'error', exitCode: 127, error: firstLine(e), peakRssMb: 0 };
  }
  return { exit: rec.exitCode, outcome: rec.outcome, seconds: Math.round((Date.now() - t0) / 10) / 100, peakRssMb: rec.peakRssMb ?? 0, killed: rec.killed ? (rec.killed.which || rec.outcome) : null, error: rec.error || null, diskMb: disk, out, stdout };
}

const getPath = (o, p) => String(p).split('.').reduce((a, k) => (a === null || a === undefined ? undefined : a[k]), o);

/**
 * Per-verdict metric readers, registered by the verdict file the gap names: (dir, out) -> number.
 * A gap's own trial.metric ({file, field} or {regex}) wins over these.
 */
export const METRIC_READERS = {};
export function registerMetric(verdictBase, fn) { METRIC_READERS[verdictBase] = fn; }

/**
 * The gaps item (self/gaps.mjs, Board 14 wave 1) registers a per-bench parser beside each trial. It
 * is imported by name when it has landed; until then this prints "not landed yet" once and the
 * readers below carry on without it. Returns the parser function or null.
 */
let GAPS_PARSER = undefined;
let GAPS_SAID = false;
let GAPS_PARSERS = null;
/** Set the gaps item's named parsers by hand (tests): {name: {file(trial) | stdout | row, read}}. */
export function setGapsParsers(obj) { GAPS_PARSERS = obj && typeof obj === 'object' ? obj : null; }
export const GAPS_PARSER_NAMES = Object.freeze(['metricOf', 'parseTrialMetric', 'readTrialMetric', 'trialMetric', 'parseMetric']);
export async function loadGapsParser({ root = ROOT, log = (l) => console.log(l) } = {}) {
  if (typeof GAPS_PARSER === 'function' || GAPS_PARSER === false) return GAPS_PARSER || null;
  const f = path.join(root, 'self', 'gaps.mjs');
  if (!existsSync(f)) {
    if (!GAPS_SAID) log('self/gaps.mjs: not landed yet (the gaps item\'s per-bench parser is not used; gap.trial.metric and "metric <n>" still read)');
    GAPS_SAID = true; GAPS_PARSER = null; return null;
  }
  try {
    const m = await import(pathToFileURL(f).href);
    const name = GAPS_PARSER_NAMES.find((n) => typeof m[n] === 'function');
    GAPS_PARSER = name ? m[name] : false;
    if (m.PARSERS && typeof m.PARSERS === 'object' && !GAPS_PARSERS) GAPS_PARSERS = m.PARSERS;
    log((name ? 'self/gaps.mjs ' + name + '() reads trial metrics' : 'self/gaps.mjs exports no parser function')
      + (GAPS_PARSERS ? '; its PARSERS (' + Object.keys(GAPS_PARSERS).join(', ') + ') read the metric of a trial that names one in trial.parser' : ''));
  } catch (e) { log('self/gaps.mjs does not import: ' + firstLine(e)); GAPS_PARSER = null; }
  return GAPS_PARSER || null;
}
/** Set (or clear, with false) the gaps parser by hand: tests and the bench. */
export function setGapsParser(fn) { GAPS_PARSER = fn; }

/**
 * The metric one trial run printed, in this order: gap.trial.metric ({file, field} or {regex}); a
 * reader registered for the gap's verdict file; the gaps item's parser (loadGapsParser); then a
 * "metric <n>" line on the output.
 */
export function readMetric(gap, { dir, out = '', stdout = null, run = null }) {
  const t = (gap && gap.trial) || {};
  const spec = t.metric || gap.metric || null;
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
  try {
    if (spec && typeof spec === 'object' && spec.file) {
      const f = path.join(dir, spec.file);
      if (!existsSync(f)) return { value: null, how: 'file', reason: spec.file + ' was not written by the trial' };
      const v = num(getPath(JSON.parse(readFileSync(f, 'utf8')), spec.field || 'measured'));
      return v === null ? { value: null, how: 'file', reason: spec.file + ' holds no number at ' + (spec.field || 'measured') } : { value: v, how: 'file ' + spec.file + ' ' + (spec.field || 'measured') };
    }
    if (spec && typeof spec === 'object' && spec.regex) {
      const m = String(out).match(new RegExp(spec.regex, 'm'));
      const v = m ? num(m[1]) : null;
      return v === null ? { value: null, how: 'regex', reason: 'the output does not match ' + spec.regex } : { value: v, how: 'regex' };
    }
    const pname = t.parser || null;
    const p = pname && GAPS_PARSERS ? GAPS_PARSERS[pname] : null;
    if (pname && !p && GAPS_PARSERS) return { value: null, how: 'parser ' + pname, reason: 'self/gaps.mjs PARSERS has no parser named ' + pname };
    if (p) {
      const how = 'self/gaps.mjs PARSERS.' + pname + (p.name ? ' (' + p.name + ')' : '');
      if (p.row) {
        // the test runner: the metric is the file's wall, and a file that fails measured nothing
        if (!run) return { value: null, how, reason: 'no run to read a wall from' };
        if (run.exit !== 0) return { value: null, how, reason: 'the test file failed (exit ' + run.exit + ' ' + run.outcome + '): a failing run is not a wall' };
        return { value: Math.round(run.seconds * 1000), how: how + ', wall ms of a passing run' };
      }
      if (typeof p.file === 'function') {
        const rel = p.file(t);
        const fp = path.join(dir, rel);
        if (!existsSync(fp)) return { value: null, how, reason: rel + ' was not written by the trial' };
        const v = num(p.read(JSON.parse(readFileSync(fp, 'utf8'))));
        return v === null ? { value: null, how, reason: rel + ' holds no number where ' + pname + ' reads' } : { value: v, how: how + ' from ' + rel };
      }
      if (p.stdout) {
        const v = num(p.read(stdout === null ? out : stdout));
        return v === null ? { value: null, how, reason: 'the trial\'s stdout holds no number where ' + pname + ' reads' } : { value: v, how: how + ' from stdout' };
      }
    }
    const base = gap && gap.verdictFile ? path.basename(String(gap.verdictFile)) : null;
    if (base && METRIC_READERS[base]) {
      const v = num(METRIC_READERS[base](dir, out, gap));
      return v === null ? { value: null, how: 'reader ' + base, reason: 'the registered reader for ' + base + ' found no number' } : { value: v, how: 'reader ' + base };
    }
    if (typeof GAPS_PARSER === 'function') {
      const got = GAPS_PARSER(gap, { dir, out, stdout: out });
      const v = num(got && typeof got === 'object' ? (got.value ?? got.metric) : got);
      if (v !== null) return { value: v, how: 'self/gaps.mjs parser' };
    }
  } catch (e) { return { value: null, how: 'error', reason: firstLine(e) }; }
  const m = String(out).match(/^\s*metric[ :=]+(-?\d[\d.eE+-]*)\s*$/m);
  if (m && num(m[1]) !== null) return { value: num(m[1]), how: 'stdout metric' };
  return { value: null, how: 'none', reason: 'no metric reader for this gap and no "metric <n>" line on the output' };
}

// ------------------------------------------------------------------ the noise band and the decision
/** The noise band of a baseline: the spread of its runs, or 5 percent of the distance when they agree exactly. */
export function noiseBand(runs, bar) {
  const xs = runs.filter((x) => typeof x === 'number' && Number.isFinite(x));
  if (xs.length < 2) return { mean: xs[0] ?? null, spread: null, noise: null, how: 'fewer than two baseline runs' };
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const spread = Math.max(...xs) - Math.min(...xs);
  if (spread > 0) return { mean: r6(mean), spread: r6(spread), noise: r6(spread), how: 'the spread of ' + xs.length + ' baseline runs' };
  return { mean: r6(mean), spread: 0, noise: r6(0.05 * Math.abs(bar - mean)), how: 'the ' + xs.length + ' baseline runs agree exactly, so 5 percent of the distance to the bar' };
}

/** +1 when a higher number is closer to the bar, -1 when lower is, 0 at the bar. */
export const directionOf = (before, bar) => (bar > before ? 1 : bar < before ? -1 : 0);
/** How far `after` moved toward the bar from `ref`, in the metric's unit (negative: away). */
export const towardOf = (after, ref, bar, dir) => (after === null || ref === null ? null : r6((after - ref) * dir));
export const closedAt = (after, bar, dir) => after !== null && (dir > 0 ? after >= bar : dir < 0 ? after <= bar : true);

/** The keep rule, exported so a test can grade it alone: moved toward the bar by MORE than the noise band. */
export function beatsNoise(toward, noise) { return toward !== null && noise !== null && toward > noise; }

// ------------------------------------------------------------------ baselines
function readJsonl(file) {
  if (!existsSync(file)) return [];
  const out = [];
  for (const l of readFileSync(file, 'utf8').split(/\r?\n/)) { if (!l.trim()) continue; try { out.push(JSON.parse(l)); } catch { /* torn */ } }
  return out;
}
/** The directory holding baselines.jsonl and the dated record files: <stateRoot>/state/self/operators. */
export const stateDirOf = (stateRoot) => path.join(stateRoot, ...STATE_REL.split('/'));
export const baselinesFile = (stateDir) => path.join(stateDir, 'baselines.jsonl');
export const recordFile = (stateDir, date = today()) => path.join(stateDir, date + '.jsonl');

/** The baseline of today for this command and these file bytes, or null. */
export function findBaseline(stateDir, { command, filesHash, date = today() }) {
  const rows = readJsonl(baselinesFile(stateDir)).filter((b) => b.date === date && b.command === command && b.filesHash === filesHash && Array.isArray(b.runs) && b.runs.length >= 2);
  return rows.length ? rows[rows.length - 1] : null;
}

// ------------------------------------------------------------------ touched tests and the gate
const TEST_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s*)['"](\.{1,2}\/[^'"]+)['"]/gm;
/** Every test/*.test.mjs of the tree whose relative imports resolve to one of the files, plus extra. */
export function touchedTests(root, files, extra = []) {
  const want = new Set(files.map((f) => f.replaceAll('\\', '/')));
  const out = [];
  const tdir = path.join(root, 'test');
  if (existsSync(tdir)) {
    for (const n of readdirSync(tdir).filter((x) => x.endsWith('.test.mjs')).sort()) {
      const src = readFileSync(path.join(tdir, n), 'utf8');
      for (const m of src.matchAll(TEST_RE)) {
        const rel = path.posix.normalize(path.posix.join('test', m[1]));
        if (want.has(rel)) { out.push('test/' + n); break; }
      }
    }
  }
  for (const t of extra) if (t && !out.includes(t)) out.push(t);
  return out;
}

/**
 * One test file on a directory, under tools/budget.mjs like every other process this file starts:
 * node --test with the TAP reporter, the pass and fail counts read from its summary.
 */
export async function testOn(dir, testRel, { wallMs = TRIAL_WALL_MS } = {}) {
  const r = await runCapped([process.execPath, '--max-old-space-size=' + HEAP_MB, '--test', '--test-reporter=tap', testRel], dir, { wallMs });
  const n = (label) => { const m = r.out.match(new RegExp('^# ' + label + ' (\\d+)$', 'm')); return m ? Number(m[1]) : null; };
  const failures = [...r.out.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1].trim()).slice(0, 5);
  return { test: testRel, exit: r.exit, outcome: r.outcome, pass: n('pass'), fail: n('fail'), seconds: r.seconds, peakRssMb: r.peakRssMb, failures };
}

/** The gate on a directory, under the budget wrapper; GREEN only on exit 0 AND a gate.json written by this run saying GREEN. */
export async function gateOn(dir, { cmd = DEFAULT_GATE_CMD, wallMs = GATE_WALL_MS } = {}) {
  const argv = trialArgv(cmd);
  const t0 = Date.now();
  const r = await runCapped(argv, dir, { wallMs });
  const gj = path.join(dir, 'bench', 'verdicts', 'gate.json');
  let verdict = null, hash = null, at = null, red = null;
  if (existsSync(gj)) {
    try {
      const bytes = readFileSync(gj);
      const j = JSON.parse(bytes.toString('utf8'));
      if (Date.parse(j.at) >= t0 - 1000) { verdict = j.verdict; hash = sha(bytes); at = j.at; red = (j.tests || []).filter((t) => t.exit !== 0).map((t) => t.file); }
    } catch { /* no breakdown */ }
  }
  const summary = (r.out.match(/^GATE (?:GREEN|RED):.*$/m) || [null])[0];
  const rows = r.out.split('\n').filter((l) => /^(BUDGET|COMPRESS|HIS DATA|LOAD-BEARING|BOUNDARY) (GREEN|RED)/.test(l)).map((l) => l.slice(0, 160));
  return { green: r.exit === 0 && verdict === 'GREEN', exit: r.exit, outcome: r.outcome, verdict, hash, at, red, summary, rows, seconds: r.seconds, peakRssMb: r.peakRssMb };
}

// ------------------------------------------------------------------ improve
/**
 * One (gap, operator) round on a copy. See the header.
 * @param {object} o
 *   root        the tree to copy (never written)
 *   stateRoot   where state/self/operators/ lives (default root)
 *   gap         a gaps ledger line: {id, measured, bar, unit, files, trial: {command, metric?, writes?}, tests?, copyInclude?}
 *   operator    a name of OPERATORS
 *   budget      self/operators.mjs makeBudget(): trials per round, model calls, the author
 *   gateCmd     the gate command on the copy (default node bench/gate.mjs --quiet)
 *   trialWallMs the wall of one trial (default 10 minutes)
 *   hooks       {beforeDelete(ctx)}: called with {copy, recordFile} after the last record line and before the copy is deleted
 *   log         a line sink
 */
export async function improve({
  root = ROOT, stateRoot = null, gap, operator = 'knob-tune', budget = null, gateCmd = DEFAULT_GATE_CMD,
  trialWallMs = TRIAL_WALL_MS, gateWallMs = GATE_WALL_MS, runId = null, hooks = {}, log = () => {}, allowModelTrial = false,
  confirm = true, now = () => new Date(), stateDir = null, kitRoot = null, gateKit = true, tmpRoot = null, maxRefill = 3,
} = {}) {
  const t0 = Date.now();
  const sr = stateDir || stateDirOf(stateRoot || root);
  const date = today(now());
  const rid = runId || now().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const bud = budget || makeBudget();
  const recFile = recordFile(sr, date);
  mkdirSync(path.dirname(recFile), { recursive: true });
  let copy = null;
  const trials = [];
  const base = { at: null, runId: rid, gap: gap && gap.id, operator };
  const write = (line) => {
    const full = { ...base, at: now().toISOString(), ...line, copy: copy ? copy.dir : null, copyAlive: copy ? existsSync(copy.dir) : false };
    appendFileSync(recFile, JSON.stringify(full) + '\n');
    return full;
  };
  const refuse = (reason, extra = {}) => { const d = write({ kind: 'decision', kept: false, reason, seconds: Math.round((Date.now() - t0) / 10) / 100, ...extra }); return { kept: false, reason, operator, gap: gap && gap.id, trials, record: recFile, decision: d, ...extra }; };

  if (!gap || typeof gap !== 'object') return refuse('no gap');
  await loadGapsParser({ log });
  if (!OPERATORS[operator]) return refuse('no operator named ' + operator + ' (known: ' + Object.keys(OPERATORS).join(', ') + ')');
  const cmd = gap.trial && gap.trial.command;
  if (!cmd) return refuse('the gap has no trial command');
  if (gap.trial.needsModel && !allowModelTrial) return refuse('the gap\'s trial needs the model; the improve mode runs model-free trials only here');
  const bar = Number(gap.bar);
  if (!Number.isFinite(bar)) return refuse('the gap carries no numeric bar');
  const allowed = allowedFiles(gap, root);
  if (!allowed.files.length) return refuse('no file of the gap passes the ceiling' + (allowed.refused.length ? ': ' + allowed.refused.map((r) => r.reason).join('; ') : ''));
  const fromLedger = Array.isArray(gap.trial.argv) && gap.trial.argv.length > 0;
  let argv = fromLedger ? null : trialArgv(cmd);
  if (!fromLedger && !argv) return refuse('the trial command is empty');
  const fh = hashFiles(root, allowed.files).all;
  const writes = [].concat(gap.trial.writes || []).filter((w) => typeof w === 'string' && !path.isAbsolute(w));

  let result;
  try {
    const include = [...new Set([...[].concat(gap.copyInclude || []), ...ledgerIncludes(gap.trial)])];
    copy = copyTree(root, { include, tmpRoot });
    const kr = kitRoot || root;
    const refilled = [];
    log('copy ' + copy.dir + ': ' + copy.files + ' files, ' + (copy.bytes / MB).toFixed(1) + ' MB in ' + copy.ms + ' ms' + (copy.include.length ? '; with ' + copy.include.join(', ') : ''));
    if (fromLedger) {
      argv = ledgerArgv(gap.trial, copy.dir);
      mkdirSync(path.join(copy.dir, 'tmp'), { recursive: true });
      log('trial argv (the ledger\'s, {tmp} and {copy} on this copy): ' + argv.join(' '));
    }
    if (gap.trial.trader) {
      const sib = addSiblings(copy.dir, kr);
      log('a trader trial: beside the copy ' + (sib.files.join(', ') || 'nothing') + ' (' + (sib.bytes / MB).toFixed(1) + ' MB)' + (sib.left.length ? ', left out: ' + sib.left.map((x) => x.file + ' ' + x.why).join('; ') : ''));
    }
    // what a run leaves behind never reaches the next run: the trial's writes, the file its parser reads, and {tmp}
    const pfile = gap.trial.parser && GAPS_PARSERS && GAPS_PARSERS[gap.trial.parser] && typeof GAPS_PARSERS[gap.trial.parser].file === 'function' ? GAPS_PARSERS[gap.trial.parser].file(gap.trial) : null;
    const clean = () => {
      for (const w of [...writes, ...(pfile ? [pfile] : [])]) { try { rmSync(path.join(copy.dir, w), { force: true, recursive: true }); } catch { /* none */ } }
      if (fromLedger) { try { rmSync(path.join(copy.dir, 'tmp'), { force: true, recursive: true }); } catch { /* none */ } mkdirSync(path.join(copy.dir, 'tmp'), { recursive: true }); }
    };
    const once = async (label) => {
      clean();
      let r = await runCapped(argv, copy.dir, { wallMs: trialWallMs });
      let m = readMetric(gap, { dir: copy.dir, out: r.out, stdout: r.stdout, run: r });
      // a trial that died on a missing fixture, seed or web/dist file gets that one path and runs again
      for (let k = 0; m.value === null && k < maxRefill; k++) {
        const add = fillMissing(copy.dir, kr, r.out);
        if (!add.length) break;
        refilled.push(...add);
        log(label + ': the trial read ' + add.join(', ') + ', missing from the lean copy; copied from the tree and run again');
        clean();
        r = await runCapped(argv, copy.dir, { wallMs: trialWallMs });
        m = readMetric(gap, { dir: copy.dir, out: r.out, stdout: r.stdout, run: r });
      }
      log(label + ': exit ' + r.exit + ' ' + r.outcome + ', metric ' + m.value + ' (' + (m.value === null ? m.reason : m.how) + '), ' + r.seconds + ' s, peak ' + (r.peakRssMb ? r.peakRssMb + ' MB' : 'not sampled (the run ended inside one 1 s sample)'));
      return { ...r, metric: m.value, how: m.how, metricReason: m.reason || null };
    };

    // 2. the baseline: reused from today, else two unpatched runs on this copy
    let bl = findBaseline(sr, { command: cmd, filesHash: fh, date });
    let baselineRan = 0;
    if (bl) log('baseline reused from ' + bl.at + ': ' + bl.runs.join(', '));
    else {
      const a = await once('baseline 1 (unpatched)');
      const b = a.metric === null ? null : await once('baseline 2 (unpatched)');
      baselineRan = b ? 2 : 1;
      if (a.metric === null || !b || b.metric === null) {
        const why = 'the unpatched trial printed no metric: ' + (a.metric === null ? a.metricReason + ' (exit ' + a.exit + ' ' + a.outcome + ')' : b.metricReason);
        trials.push(write({ kind: 'baseline', before: null, after: null, seconds: a.seconds, reason: why, tail: a.out.split('\n').filter(Boolean).slice(-3).join(' | ').slice(0, 400) }));
        result = refuse(why, { baselineRan });
        return result;
      }
      const nb = noiseBand([a.metric, b.metric], bar);
      bl = { at: now().toISOString(), date, command: cmd, gap: gap.id || null, filesHash: fh, runs: [a.metric, b.metric], seconds: [a.seconds, b.seconds], mean: nb.mean, spread: nb.spread, noise: nb.noise, how: nb.how, peakRssMb: Math.max(a.peakRssMb, b.peakRssMb) };
      mkdirSync(path.dirname(baselinesFile(sr)), { recursive: true });
      appendFileSync(baselinesFile(sr), JSON.stringify(bl) + '\n');
      trials.push(write({ kind: 'baseline', before: a.metric, after: b.metric, noise: nb.noise, seconds: r6(a.seconds + b.seconds), reason: nb.how }));
    }
    const nb = noiseBand(bl.runs, bar);
    const before = nb.mean, noise = nb.noise, dir = directionOf(before, bar);
    if (dir === 0) { result = refuse('the baseline ' + before + ' is already at the bar ' + bar, { before, noise, baselineRan }); return result; }

    // 3. trials
    const gen = OPERATORS[operator](gap, copy.dir, bud);
    let step = await gen.next();
    while (!step.done) {
      const c = step.value || {};
      const tag = { knob: c.knob || null, name: c.name || null, file: c.file || null, value: c.value ?? null, from: c.from ?? null };
      // an author's answer and diff go on its line whatever the verdict: what the model proposed is evidence too
      const said = c.operator === 'author' ? { answer: c.answer ? String(c.answer).slice(0, 600) : null, patch: c.patch || null } : {};
      if (c.refused) {
        trials.push(write({ kind: 'trial', ...tag, before, after: null, noise, seconds: 0, reason: 'refused: ' + c.reason, model: c.model || null, ...said }));
        log('refused ' + (c.knob || c.name || c.operator) + ': ' + c.reason);
        step = await gen.next({ refused: true, reason: c.reason, before, after: null, noise });
        continue;
      }
      const vet = vetDiff(c.patch, gap, copy.dir, { maxLines: operator === 'author' ? MAX_CHANGED_LINES : Infinity });
      if (!vet.ok) {
        trials.push(write({ kind: 'trial', ...tag, before, after: null, noise, seconds: 0, reason: 'refused: ' + vet.reason, model: c.model || null, ...said }));
        log('refused ' + (c.knob || c.name || c.operator) + ': ' + vet.reason);
        step = await gen.next({ refused: true, reason: vet.reason, before, after: null, noise });
        continue;
      }
      const applied = applyTo(copy.dir, c.patch);
      if (!applied.ok) {
        trials.push(write({ kind: 'trial', ...tag, before, after: null, noise, seconds: 0, reason: 'refused: the patch does not apply: ' + applied.reason, model: c.model || null, ...said }));
        log('refused ' + (c.knob || c.name || c.operator) + ': the patch does not apply: ' + applied.reason);
        step = await gen.next({ refused: true, reason: applied.reason, before, after: null, noise });
        continue;
      }
      let r;
      try { r = await once('trial ' + (c.knob ? c.knob + ' = ' + c.value : c.name || c.operator)); } finally { restore(copy.dir, applied.originals); }
      const toward = towardOf(r.metric, before, bar, dir);
      const towardRef = towardOf(r.metric, c.ref ?? before, bar, dir);
      const closed = closedAt(r.metric, bar, dir);
      const reason = r.metric === null ? 'the patched trial printed no metric: ' + r.metricReason
        : beatsNoise(towardRef, noise) ? 'moved ' + towardRef + ' toward the bar, over the noise band ' + noise + (closed ? '; the gap is closed' : '')
          : 'moved ' + towardRef + ' toward the bar, inside the noise band ' + noise;
      trials.push(write({ kind: 'trial', ...tag, before, ref: c.ref ?? before, after: r.metric, toward, towardRef, noise, closed, seconds: r.seconds, peakRssMb: r.peakRssMb, exit: r.exit, reason, model: c.model || null, lines: vet.lines, ...said }));
      log('  ' + reason);
      step = await gen.next({ before, after: r.metric, toward, towardRef, noise, closed, seconds: r.seconds });
    }
    const out = step.value || {};
    const best = out.best;
    if (!best) { result = refuse(out.reason || 'no candidate', { before, noise, baselineRan }); return result; }

    // 4. decide: confirmation run, touched tests, the gate, all on the copy with the best patch applied
    const applied = applyTo(copy.dir, best.patch);
    if (!applied.ok) { result = refuse('the best patch no longer applies: ' + applied.reason, { before, noise, baselineRan }); return result; }
    let after = best.after, confirmRun = null;
    if (confirm) {
      const r = await once('confirm ' + (best.knob ? best.knob + ' = ' + best.value : best.name || best.operator));
      confirmRun = r.metric;
      trials.push(write({ kind: 'confirm', knob: best.knob || null, name: best.name || null, value: best.value ?? null, before, after: r.metric, noise, seconds: r.seconds, reason: 'the best candidate run again' }));
      if (r.metric === null) { result = refuse('the confirmation run printed no metric', { before, noise, baselineRan, best: slim(best) }); return result; }
      // the less favourable of the search run and the confirmation run
      after = towardOf(r.metric, before, bar, dir) < towardOf(best.after, before, bar, dir) ? r.metric : best.after;
    }
    const toward = towardOf(after, before, bar, dir);
    if (!beatsNoise(toward, noise)) { result = refuse('the best candidate moved ' + toward + ' toward the bar on its less favourable run, inside the noise band ' + noise, { before, after, noise, baselineRan, best: slim(best) }); return result; }
    let kit = null;
    if (gateKit) {
      kit = addGateKit(copy.dir, kr);
      log('gate kit: ' + kit.fixtures.files + ' fixture files (' + (kit.fixtures.bytes / MB).toFixed(1) + ' MB, ' + kit.fixtures.left.length + ' over the cap left out), ' + kit.seeds.names.length + ' seeds (' + (kit.seeds.bytes / MB).toFixed(1) + ' MB, ' + kit.seeds.left.length + ' left out), web/dist ' + (kit.dist.bytes / MB).toFixed(1) + ' MB, whole ' + (kit.whole.dirs.join(', ') || 'nothing') + ' (' + (kit.whole.bytes / MB).toFixed(1) + ' MB), beside the copy ' + (kit.siblings.files.join(', ') || 'nothing') + ' (' + (kit.siblings.bytes / MB).toFixed(1) + ' MB' + (kit.siblings.left.length ? ', left out: ' + kit.siblings.left.map((x) => x.file + ' ' + x.why).join('; ') : '') + '), in ' + kit.ms + ' ms');
    }
    const kitLine = kit ? { files: kit.fixtures.files, seeds: kit.seeds.names.length, mb: Math.round(kit.bytes / MB * 10) / 10, whole: kit.whole.dirs, siblings: kit.siblings.files, leftOut: [...kit.fixtures.left.map((x) => x.file), ...kit.seeds.left.map((x) => 'organism/' + x.seed), ...kit.siblings.left.map((x) => x.file)] } : null;
    const tests = touchedTests(copy.dir, filesOfDiff(best.patch), [].concat(gap.tests || []));
    const testRuns = [];
    for (const t of tests) {
      const tr = await testOn(copy.dir, t, { wallMs: trialWallMs });
      testRuns.push(tr);
      if (tr.exit !== 0) { result = refuse('a touched test fails on the copy: ' + t + ' (' + (tr.failures[0] || 'exit ' + tr.exit + ' ' + tr.outcome) + ')', { before, after, noise, baselineRan, tests: testRuns, best: slim(best) }); return result; }
    }
    log('touched tests: ' + (tests.length ? tests.join(', ') + ' pass' : 'none import a patched file'));
    const g = await gateOn(copy.dir, { cmd: gateCmd, wallMs: gateWallMs });
    log('gate on the copy: ' + (g.summary || 'no GATE line') + ' (' + g.seconds + ' s)');
    if (!g.green) { result = refuse('the gate on the copy is not GREEN: ' + (g.summary || 'exit ' + g.exit + ' ' + g.outcome) + (g.red && g.red.length ? ' (red: ' + g.red.join(', ') + ')' : '') + (g.rows.filter((x) => / RED/.test(x)).length ? ' ' + g.rows.filter((x) => / RED/.test(x)).join(' | ') : ''), { before, after, noise, baselineRan, tests: testRuns, gate: g, best: slim(best) }); return result; }
    const closed = closedAt(after, bar, dir);
    const d = write({ kind: 'decision', kept: true, knob: best.knob || null, name: best.name || null, file: best.file || null, value: best.value ?? null, from: best.from ?? null, before, after, confirm: confirmRun, noise, toward, closed, gateHash: g.hash, gate: g.summary, kit: kitLine, refilled, tests: testRuns, patch: best.patch, seconds: Math.round((Date.now() - t0) / 10) / 100, reason: 'moved ' + toward + ' toward the bar ' + bar + ', over the noise band ' + noise + '; touched tests pass; the gate on the copy is GREEN' + (closed ? '; the gap is closed' : '') });
    result = { kept: true, patch: best.patch, operator, knob: best.knob || null, name: best.name || null, file: best.file || null, value: best.value ?? null, from: best.from ?? null, before, after, confirm: confirmRun, noise, toward, closed, gateHash: g.hash, gate: g, tests: testRuns, trials, record: recFile, decision: d, baselineRan, gap: gap.id };
    return result;
  } catch (e) {
    result = refuse('improve threw: ' + firstLine(e));
    return result;
  } finally {
    if (copy) {
      if (typeof hooks.beforeDelete === 'function') { try { hooks.beforeDelete({ copy: copy.dir, recordFile: recFile }); } catch (e) { log('beforeDelete hook: ' + firstLine(e)); } }
      const del = deleteCopy(copy.dir);
      if (!del.deleted) appendFileSync(recFile, JSON.stringify({ ...base, at: now().toISOString(), kind: 'copy-left', copy: copy.dir, error: del.error }) + '\n');
      if (result) { result.copy = { dir: copy.dir, mb: Math.round(copy.bytes / MB * 10) / 10, deleted: del.deleted, freeMbAfter: del.freeMb }; }
      log('copy ' + (del.deleted ? 'deleted' : 'LEFT ON DISK') + ': ' + copy.dir + ', ' + del.freeMb + ' MB free after');
    }
  }
}

const slim = (b) => (b ? { operator: b.operator, knob: b.knob || null, name: b.name || null, value: b.value ?? null, after: b.after, file: b.file || null } : null);

/** Apply a (possibly multi-file) unified diff to the copy, keeping every original's bytes. */
export function applyTo(dir, patch) {
  const originals = [];
  const sections = splitSections(patch);
  if (!sections.length) return { ok: false, reason: 'the diff has no file section', originals };
  for (const s of sections) {
    const abs = path.join(dir, s.file);
    if (!existsSync(abs)) { restore(dir, originals); return { ok: false, reason: 'no such file on the copy: ' + s.file, originals: [] }; }
    const bytes = readFileSync(abs);
    const r = applyUnifiedPatch(bytes.toString('utf8'), s.patch);
    if (!r.ok) { restore(dir, originals); return { ok: false, reason: s.file + ': ' + r.reason, originals: [] }; }
    if (r.text === bytes.toString('utf8')) { restore(dir, originals); return { ok: false, reason: s.file + ': the patch changes nothing', originals: [] }; }
    originals.push({ abs, bytes });
    writeFileSync(abs, r.text);
  }
  return { ok: true, originals };
}
export function restore(dir, originals) { for (const o of originals.slice().reverse()) writeFileSync(o.abs, o.bytes); }

/** One section per file of a unified diff: {file, patch}. */
export function splitSections(patch) {
  const out = [];
  let cur = null, from = null;
  for (const l of String(patch || '').split(/\r?\n/)) {
    if (l.startsWith('--- ')) { from = l.slice(4).split('\t')[0].trim().replace(/^[ab]\//, ''); continue; }
    if (l.startsWith('+++ ')) {
      let to = l.slice(4).split('\t')[0].trim(); to = to === '/dev/null' ? from : to.replace(/^[ab]\//, '');
      cur = { file: to, lines: ['--- a/' + to, '+++ b/' + to] }; out.push(cur); continue;
    }
    if (cur) cur.lines.push(l);
  }
  return out.map((s) => ({ file: s.file, patch: s.lines.join('\n') + '\n' }));
}

// ------------------------------------------------------------------ CLI
//   node self/improve.mjs --gap <id> [--operator knob-tune] [--gaps FILE] [--dry] [--json]
// --dry plans without copying or running anything: the gap, its allowed files and knobs, the trial
// argv, and whether today's baseline would be reused. Without --dry it runs one improve() round on
// a copy (the real tree is never written) and prints the decision.
async function main(argv) {
  const val = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
  const json = argv.includes('--json');
  const gapsFile = path.resolve(val('--gaps', path.join(ROOT, 'state', 'self', 'gaps.jsonl')));
  const id = val('--gap');
  const operator = val('--operator', 'knob-tune');
  if (!id) { console.log('usage: node self/improve.mjs --gap <id> [--operator ' + Object.keys(OPERATORS).join('|') + '] [--gaps FILE] [--dry] [--json]'); return; }
  const gap = readJsonl(gapsFile).find((g) => String(g.id) === String(id));
  if (!gap) { console.log('no gap ' + id + ' in ' + gapsFile); process.exitCode = 1; return; }
  if (argv.includes('--dry')) {
    const allowed = allowedFiles(gap, ROOT);
    const { gapKnobs } = await import('./operators.mjs');
    const knobs = gapKnobs(gap, ROOT);
    const cmd = gap.trial && gap.trial.command;
    const fh = hashFiles(ROOT, allowed.files).all;
    const bl = cmd ? findBaseline(stateDirOf(ROOT), { command: cmd, filesHash: fh }) : null;
    const plan = { gap: gap.id, operator, measured: gap.measured, bar: gap.bar, files: allowed.files, refusedFiles: allowed.refused, knobs: knobs.map((k) => k.name + ' ' + k.literal + ' [' + k.lo + ', ' + k.hi + '] step ' + k.step), trial: cmd ? (Array.isArray(gap.trial.argv) && gap.trial.argv.length ? ledgerArgv(gap.trial, '<copy>') : trialArgv(cmd)) : null, needsModel: !!(gap.trial && gap.trial.needsModel), baseline: bl ? { at: bl.at, runs: bl.runs, noise: bl.noise } : 'none today: two unpatched runs first' };
    console.log(json ? JSON.stringify(plan, null, 2) : Object.entries(plan).map(([k, v]) => k + ': ' + (typeof v === 'string' ? v : JSON.stringify(v))).join('\n'));
    return;
  }
  const r = await improve({ gap, operator, log: json ? () => {} : (l) => console.log(l) });
  const out = { kept: r.kept, operator, gap: gap.id, before: r.before ?? null, after: r.after ?? null, noise: r.noise ?? null, knob: r.knob || null, name: r.name || null, reason: r.kept ? null : r.reason, gateHash: r.gateHash || null, record: r.record, copy: r.copy || null };
  console.log(json ? JSON.stringify(out, null, 2) : (r.kept ? 'KEPT ' : 'NOT KEPT ') + JSON.stringify(out));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch((e) => { console.error(firstLine(e)); process.exitCode = 1; });
