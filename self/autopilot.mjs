// self/autopilot.mjs: SELF-CODE WITH NO HUMAN IN THE LOOP. His 2026-09-18 08:42: "Soon it
// needs to generate itself open source more cells and gets better without your help", and
// his 10:26 answer to the ask for self-code approval: "Nah im not doing shit bro. Find a way
// to do it yrself everything is in ur hands". self/code.mjs stops at 'hold' and waits for
// `brain self-code --approve`. This file is the way to do it without him: the human's
// approval is replaced by a MEASUREMENT, and every step that measurement can get wrong is
// undone byte for byte.
//
// Board 10 (his P15, 2026-09-23 17:44: "I wouldnt even need to pay $100 claude subscription
// anymore", and 18:12: "It should be able to work without you very soon") gave it SOURCES and
// an AUTHOR. The candidates no longer come from survived mutants alone:
//
//   gate      a red row of the last gate run (bench/verdicts/gate.json), re-run now
//   notes     a line of notes/*.md starting with "OPEN:" (the planted grammar), or a bullet
//             under a heading that starts with "Open"
//   imagine   mind/imagine.mjs propose(), when that file exists (run in a child process)
//   census    a dead edge declaration of the census seed (bench/verdicts/census.json, its
//             liveness bitset): a prune candidate, graded by "every test stays green"
//   slow      a green row of the last gate run that took at least --slow-ms: graded by "the
//             test stays green and runs at least 20 percent faster"
//   mutants   a mutant the suite did not kill (its killing test is a test file, so the ceiling
//             refuses it: the autopilot never writes the spec it is graded by)
//
// THE AUTHOR. A census prune is written deterministically (the dead lines, deleted). Every
// other candidate without a patch goes to a MODEL CELL ON OPEN WEIGHTS: qwen3:30b-a3b through
// Ollama here (BRAIN_AUTHOR_MODEL and BRAIN_AUTHOR_BASE in a container), asked with the
// candidate, the file, its test, the failing assertion and the OPEN line, answering with a
// unified diff. Never a Claude or Anthropic endpoint: a model name or base url naming either
// is refused before any socket opens. The model is asked from a child process so this file
// stays synchronous (bin/brain.mjs calls runFromCli without await). A fix candidate whose test
// already passes is refused as STALE before any model is asked: nothing could be evidence.
//
// One candidate goes through five walls, in this order, and stops at the first it fails:
//
//   1. THE CEILING. The target must pass safePath (inside the brain, not state/) AND the
//      autopilot's own list: never MANUAL.md or manual/ (his text), never docs/ (written
//      from verdicts), never self/ (the machinery that decides may not rewrite its own
//      referee), never bench/gate.mjs (the gate itself), never bench/verdicts/ (those are
//      measurements), and never a test file (the tests are the spec: a patch that edits the
//      test grading it has no referee). Compared lowercased, because this disk is not case
//      sensitive and SELF/code.mjs is self/code.mjs.
//   2. A PATCH. The candidate's own, the deterministic prune, or the model cell's. None,
//      refused, and the refusal says which author was missing.
//   3. THE EVIDENCE, RUN, sealed by this process on a temp copy of the tree. A FIX (gate,
//      notes, imagine): verifyPatch() from self/code.mjs, the named test FAILS without the
//      patch and PASSES with it. A PRESERVE (census): the test passes before AND after. A
//      FASTER (slow): passes both sides and the after run takes at most 80 percent of the
//      before run. All three: the test runs no fewer tests after than before.
//   4. THE GATE. The patch is written to the real file after its pre-patch bytes and both
//      hashes are snapshotted under state/self-code/<id>/. Then the whole gate runs
//      (bench/gate.mjs, or --gate-cmd). GREEN keeps it. RED reverts it, byte for byte, and the
//      restored file is re-hashed against the snapshot. One exception is measured, never
//      assumed: when the gate was ALREADY red before this patch, the patch is kept only if the
//      gate's own per-file breakdown shows it fixed a red file and turned no green file red
//      (a red tree must be repairable one file at a time).
//   5. THE RECORD. One JSON line per decision in bench/verdicts/autopilot/<date>.jsonl, written
//      after the decision and after the revert was verified, never before. A KEPT patch also
//      appends one line to state/self/authored.jsonl (at, files, source, author, the file
//      hashes and the gate hashes before and after): the numerator of tools/authorship.mjs.
//
// A crash between the write and the gate's ruling leaves a snapshot with no outcome.json.
// The next run finds it and, if the file still holds the patched bytes, restores the
// snapshot: a patch the gate never ruled on does not stay. --dry does everything except
// write: it verifies on a temp copy and prints what it would do; the model author is OFF in a
// dry run unless --author on is given.
//
// Board 14 (his 2026-09-24 12:02: "Its gotta work without me. Thats the most important part.
// EVERY GAP should be able to be filled by itself, ur just the engineer to author it") gave it a
// SEVENTH SOURCE and a CLOCK. `--soak <minutes>` runs the loop unattended for that wall, in a
// child process (runSoak, async), so bin/brain.mjs keeps calling runFromCli without await:
//
//   gaps      every line of state/self/gaps.jsonl (self/gaps.mjs) that carries a trial,
//             ordered by distance to its bar over its trial minutes, largest first. The ledger
//             is rebuilt at the start of a soak when it is older than 24 h, and after every
//             kept patch, so a closed gap leaves it and is printed as closed. A dead-share gap
//             goes to self/prune.mjs; every other gap to an operator of self/operators.mjs
//             (recombine for a grid gap, knob-tune for a file with knobs, strategy-swap for a
//             STRATEGIES selector, author when the author is on), one round per (gap, operator).
//
// A gap round is the IMPROVE evidence mode, on the same five walls: the CEILING is the gap's
// files through allowTarget, minus the trial's own ruler; the PATCH comes from the operator;
// the EVIDENCE is self/improve.mjs on a copy (a baseline, trials, a confirmation run over the
// noise band, the touched tests and the gate, all on the copy); the GATE is the real gate on
// the real tree after the patch is written, snapshotted file by file, and a red gate reverts
// every file byte for byte; the RECORD line gains operator, before, after and noise, and a kept
// patch appends to state/self/authored.jsonl with author "organism (<operator>)" and from
// "gaps:<id>". The Board 10 sources run once per soak, after the gap queue.
//
// Budgets per soak: --model-calls (default 12 per hour of soak), --trial-minutes (default 10; a
// longer trial is refused), at most 2 copies alive, each deleted after its verdict and the
// deletion verified. state/self/STOP refuses the start ("stopped by state/self/STOP", exit 0)
// and ends the loop between rounds; a live bench flag refuses the start. The soak checkpoints
// to state/self/soak-<runId>.json after every decision, so --resume continues it after a kill.
import {
  readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, rmSync, openSync,
  closeSync, writeSync, readdirSync, statSync, mkdtempSync, cpSync, renameSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  ROOT, verifyPatch, isSealed, safePath, applyUnifiedPatch, DEFAULT_TIMEOUT_MS, COPY_SKIP,
  runTest, mutantCandidates, gateCandidates, sha256,
} from './code.mjs';
import { boardItemLines, BOARD_ITEM_KIND } from './boards.mjs';

export const AUTO_KIND = 'self.code.auto';
export const DEFAULT_GATE_CMD = 'node bench/gate.mjs --quiet';
// The gate caps each test file at 600 s; a gate that has run for an hour has stopped being a
// gate and is read as red.
export const GATE_TIMEOUT_MS = 60 * 60_000;
export const LOCK_NAME = 'autopilot.lock';

// Board 10: sources and the author.
export const SOURCE_ORDER = Object.freeze(['gate', 'notes', 'imagine', 'census', 'slow', 'mutants']);
export const SLOW_MS = 15_000;
export const FASTER_RATIO = 0.8;
export const AUTHORED_REL = 'state/self/authored.jsonl';
export const AUTHOR_MODEL = 'qwen3:30b-a3b';
export const AUTHOR_BASE = 'http://localhost:11434';
export const AUTHOR_MODEL_ENV = 'BRAIN_AUTHOR_MODEL';
export const AUTHOR_BASE_ENV = 'BRAIN_AUTHOR_BASE';
export const AUTHOR_TIMEOUT_MS = 600_000;
export const AUTHOR_MAX = 3;
// Every process this file launches declares its heap (the machine is shared by eight
// builders; the budget is at most 6000 MB a process).
export const CHILD_HEAP_MB = 1024;
export const GATE_HEAP_MB = 6000;
const MAX_FILE_CHARS = 16_000;
const CLOSED = /anthropic|claude/i;
const SELF_FILE = fileURLToPath(import.meta.url);

export const hashBytes = (buf) => createHash('sha256').update(buf).digest('hex');
const short = (h) => (h ? String(h).slice(0, 12) : null);
const relOf = (root, abs) => path.relative(root, abs).replaceAll('\\', '/');
function readJsonFile(file) {
  try { return { ok: true, j: JSON.parse(readFileSync(file, 'utf8')) }; } catch (e) { return { ok: false, reason: String(e && e.message || e).split('\n')[0] }; }
}

// ---------------------------------------------------------------- 1. the ceiling
const CEILING = [
  [(r) => r === 'manual.md', 'MANUAL.md is his text, never a patch target'],
  [(r) => r.startsWith('manual/'), 'manual/ is his text, never a patch target'],
  [(r) => r.startsWith('docs/'), 'docs/ is written from verdicts, never patched'],
  [(r) => r.startsWith('self/'), 'self/ decides what gets applied; a patch may not rewrite its own referee'],
  [(r) => r === 'bench/gate.mjs', 'bench/gate.mjs is the gate itself'],
  [(r) => r.startsWith('bench/verdicts/'), 'bench/verdicts/ holds measurements, never code'],
  [(r) => r.startsWith('test/') || /\.test\.mjs$/.test(r), 'a test is the spec: the autopilot never edits one, so no patch can grade itself'],
];

/**
 * May the autopilot write this file with no human? Returns {ok, rel, abs} or {ok:false, reason}.
 * @param {string} file the candidate's target, relative to root
 * @param {string} [test] the test that grades it; a patch to its own grader is refused
 */
export function allowTarget(file, test = null, { root = ROOT } = {}) {
  const f = safePath(file, { root });
  if (!f.ok) return { ok: false, wall: 'ceiling', reason: f.reason };
  const low = f.rel.toLowerCase();
  for (const [hit, why] of CEILING) if (hit(low)) return { ok: false, wall: 'ceiling', reason: why + ': ' + f.rel };
  if (test) {
    const t = safePath(test, { root, mustExist: false });
    if (t.ok && t.rel.toLowerCase() === low) return { ok: false, wall: 'ceiling', reason: 'the patch targets the test that grades it: ' + f.rel };
  }
  return { ok: true, rel: f.rel, abs: f.abs };
}

// ---------------------------------------------------------------- 4. the gate
/** Split a command line into argv. Double quotes group; no shell is ever involved. */
export function splitCommand(cmd) {
  const out = [];
  let cur = '', inQ = false, any = false;
  for (const ch of String(cmd)) {
    if (ch === '"') { inQ = !inQ; any = true; continue; }
    if (!inQ && /\s/.test(ch)) { if (any) out.push(cur); cur = ''; any = false; continue; }
    cur += ch; any = true;
  }
  if (any) out.push(cur);
  return out;
}

// The variables node --test sets for its workers. A gate spawned from inside a test run
// would otherwise inherit NODE_TEST_CONTEXT and its own children would speak the v8 stream
// instead of the reporter the gate parses (self/code.mjs runTest measured the same trap).
function cleanEnv(heapMb = null) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith('NODE_TEST') || k === 'NODE_OPTIONS') continue;
    env[k] = v;
  }
  if (heapMb) env.NODE_OPTIONS = '--max-old-space-size=' + heapMb;
  return env;
}

/**
 * Run the gate in `root`. The exit code is the verdict. When the command is the real gate it
 * also writes bench/verdicts/gate.json, and a file written by THIS run (its "at" is not older
 * than the spawn) gives the per-file breakdown the red-tree rule needs, and its bytes' hash.
 */
export function runGate({ root = ROOT, cmd = null, timeoutMs = GATE_TIMEOUT_MS } = {}) {
  const command = cmd || DEFAULT_GATE_CMD;
  const argv = splitCommand(command);
  if (!argv.length) return { cmd: command, exit: null, green: false, timedOut: false, summary: null, files: null, checks: null, red: null, ms: 0, error: 'the gate command is empty' };
  const exe = argv[0] === 'node' ? process.execPath : argv[0];
  const t0 = Date.now();
  const r = spawnSync(exe, argv.slice(1), { cwd: root, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024, env: cleanEnv(GATE_HEAP_MB), windowsHide: true });
  const ms = Date.now() - t0;
  const text = (r.stdout || '') + (r.stderr || '');
  const summary = (text.match(/^GATE (?:GREEN|RED):.*$/m) || [null])[0];
  let files = null, checks = null, gateAt = null, gateJsonHash = null;
  const gj = path.join(root, 'bench', 'verdicts', 'gate.json');
  if (existsSync(gj)) {
    try {
      const bytes = readFileSync(gj);
      const j = JSON.parse(bytes.toString('utf8'));
      if (Date.parse(j.at) >= t0 - 1000 && Array.isArray(j.tests)) {
        files = Object.fromEntries(j.tests.map((t) => [t.file, t.exit === 0]));
        checks = { emDash: (j.emDash || []).length, badImports: (j.badImports || []).length };
        gateAt = j.at;
        gateJsonHash = hashBytes(bytes);
      }
    } catch { /* a gate.json that does not parse is no breakdown */ }
  }
  const timedOut = r.error?.code === 'ETIMEDOUT' || (r.status === null && r.signal !== null);
  return {
    cmd: command, exit: r.status, green: r.status === 0, timedOut, summary, files, checks, gateAt, gateJsonHash, ms,
    red: files ? Object.keys(files).filter((f) => files[f] !== true) : null,
    tail: text.split('\n').filter(Boolean).slice(-6).join('\n').slice(-1200),
    error: r.error && r.error.code !== 'ETIMEDOUT' ? String(r.error.message) : null,
  };
}

/**
 * The hash of one gate ruling: the bytes of the gate.json that run wrote when there is one,
 * otherwise the command, its exit code and its summary line.
 */
export function gateHash(g) {
  if (!g) return null;
  if (g.gateJsonHash) return g.gateJsonHash;
  return sha256(JSON.stringify({ cmd: g.cmd ?? null, exit: g.exit ?? null, summary: g.summary ?? null }));
}

/**
 * Keep or revert, from the gate after the patch and the gate before it.
 * GREEN keeps. A red gate keeps only when a baseline breakdown exists, the patch turned at
 * least one red file green, turned no green file red, added no failing file and added no
 * em-dash or bad import. Everything else reverts.
 */
export function gateDecision(baseline, after) {
  if (after && after.exit === 0) return { keep: true, gate: 'GREEN', regressions: [], fixed: [], reason: 'the gate is green with the patch' };
  if (!after || after.timedOut) return { keep: false, gate: 'TIMEOUT', regressions: [], fixed: [], reason: 'the gate did not finish' };
  if (!baseline || !baseline.files || !after.files) {
    return { keep: false, gate: 'RED', regressions: after.red || [], fixed: [], reason: 'the gate went red (exit ' + after.exit + ') and there is no per-file baseline to show the red was there before' };
  }
  const regressions = [];
  for (const [f, ok] of Object.entries(after.files)) {
    if (ok) continue;
    if (!(f in baseline.files) || baseline.files[f] === true) regressions.push(f);
  }
  const fixed = Object.keys(after.files).filter((f) => after.files[f] === true && baseline.files[f] === false);
  const b = baseline.checks || { emDash: 0, badImports: 0 }, a = after.checks || { emDash: 0, badImports: 0 };
  const checkWorse = a.emDash > b.emDash || a.badImports > b.badImports;
  if (!regressions.length && !checkWorse && fixed.length) {
    return { keep: true, gate: 'RED-NO-REGRESSION', regressions, fixed, reason: 'the gate was red before this patch; it fixed ' + fixed.join(', ') + ' and turned nothing red' };
  }
  const why = regressions.length ? 'the patch turned ' + regressions.join(', ') + ' red'
    : checkWorse ? 'the patch added an em-dash or a bad import' : 'the gate is red and the patch fixed no red file';
  return { keep: false, gate: 'RED', regressions, fixed, reason: why };
}

// ---------------------------------------------------------------- the lock
function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

/** One autopilot per tree. A lock whose process is gone is taken over and the takeover said. */
export function acquireLock(dir) {
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, LOCK_NAME);
  const body = JSON.stringify({ pid: process.pid, at: new Date().toISOString() });
  let prior = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fd = openSync(file, 'wx');
      try { writeSync(fd, body); } finally { closeSync(fd); }
      return { ok: true, file, tookOver: prior };
    } catch (e) {
      if (e.code !== 'EEXIST') return { ok: false, file, reason: 'the lock could not be created: ' + e.code };
      try { prior = JSON.parse(readFileSync(file, 'utf8')); } catch { prior = { pid: null }; }
      if (pidAlive(prior.pid)) return { ok: false, file, holder: prior, reason: 'another autopilot (pid ' + prior.pid + ', since ' + prior.at + ') holds ' + file };
      try { rmSync(file, { force: true }); } catch { /* the next attempt reports it */ }
    }
  }
  return { ok: false, file, reason: 'the lock could not be taken over: ' + file };
}
export function releaseLock(lock) {
  if (!lock || !lock.ok) return;
  try {
    const j = JSON.parse(readFileSync(lock.file, 'utf8'));
    if (j.pid === process.pid) rmSync(lock.file, { force: true });
  } catch { /* already gone */ }
}

// ---------------------------------------------------------------- snapshots
const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace('.', '');
function snapshotId(dir, when, key, hashBefore) {
  const base = stamp(when) + '-' + createHash('sha256').update(String(key) + '|' + hashBefore).digest('hex').slice(0, 8);
  let id = base, n = 1;
  while (existsSync(path.join(dir, id))) id = base + '-' + (++n);
  return id;
}
function writeOutcome(dir, o) { writeFileSync(path.join(dir, 'outcome.json'), JSON.stringify({ at: new Date().toISOString(), ...o }, null, 2)); }

/**
 * Snapshots with a meta.json and no outcome.json: a run died between the write and the
 * gate's ruling. If the file still holds the patched bytes the snapshot is restored.
 */
export function recoverOrphans({ root = ROOT, dry = false } = {}) {
  const dir = path.join(root, 'state', 'self-code');
  const found = [];
  if (!existsSync(dir)) return found;
  for (const id of readdirSync(dir).sort()) {
    const d = path.join(dir, id);
    try { if (!statSync(d).isDirectory()) continue; } catch { continue; }
    if (!existsSync(path.join(d, 'meta.json')) || existsSync(path.join(d, 'outcome.json'))) continue;
    let meta;
    try { meta = JSON.parse(readFileSync(path.join(d, 'meta.json'), 'utf8')); } catch { found.push({ id, decision: 'orphan', reason: 'meta.json does not parse' }); continue; }
    if (Array.isArray(meta.files)) { found.push(recoverMany(root, d, id, meta, dry)); continue; }
    const f = safePath(meta.file || '', { root });
    const rec = { id, key: meta.key ?? null, file: meta.file ?? null, hashBefore: meta.hashBefore ?? null, hashAfter: meta.hashAfter ?? null };
    if (!f.ok) { found.push({ ...rec, decision: 'orphan', reason: f.reason }); continue; }
    const now = hashBytes(readFileSync(f.abs));
    if (now !== meta.hashAfter) {
      const clean = now === meta.hashBefore;
      if (clean && !dry) writeOutcome(d, { decision: 'orphan-clean', hashNow: now });
      found.push({ ...rec, decision: 'orphan', hashNow: now, reason: clean ? 'the file already holds the pre-patch bytes' : 'the file moved since the snapshot; left alone' });
      continue;
    }
    if (dry) { found.push({ ...rec, decision: 'would-recover', reason: 'the gate never ruled on this patch' }); continue; }
    writeFileSync(f.abs, readFileSync(path.join(d, 'before.bin')));
    const restored = hashBytes(readFileSync(f.abs));
    const ok = restored === meta.hashBefore;
    writeOutcome(d, { decision: ok ? 'recovered' : 'revert-failed', hashRestored: restored });
    found.push({ ...rec, decision: ok ? 'recovered' : 'revert-failed', hashRestored: restored, reason: 'the gate never ruled on this patch; the snapshot was restored' });
  }
  return found;
}

/**
 * A multi-file snapshot (a gap patch, Board 14): meta.files is [{file, before, hashBefore,
 * hashAfter}]. Every file that still holds its patched bytes is restored from its before-file; a
 * file at its pre-patch bytes is left; a file at neither is left alone and said.
 */
function recoverMany(root, d, id, meta, dry) {
  const rec = { id, key: meta.key ?? null, file: meta.files.map((x) => x.file).join(', '), files: [], hashBefore: null, hashAfter: null };
  const state = [];
  for (const x of meta.files) {
    const f = safePath(x.file || '', { root });
    if (!f.ok) { state.push({ x, f, at: 'refused', reason: f.reason }); continue; }
    const now = existsSync(f.abs) ? hashBytes(readFileSync(f.abs)) : null;
    state.push({ x, f, at: now === x.hashAfter ? 'after' : now === x.hashBefore ? 'before' : 'moved', now });
  }
  if (state.some((s) => s.at === 'refused' || s.at === 'moved')) {
    return { ...rec, decision: 'orphan', reason: 'a file of the snapshot moved since it was taken (' + state.filter((s) => s.at !== 'after' && s.at !== 'before').map((s) => s.x.file).join(', ') + '); left alone' };
  }
  const toRestore = state.filter((s) => s.at === 'after');
  if (!toRestore.length) {
    if (!dry) writeOutcome(d, { decision: 'orphan-clean', files: state.map((s) => ({ file: s.x.file, hashNow: s.now })) });
    return { ...rec, decision: 'orphan', reason: 'every file already holds its pre-patch bytes' };
  }
  if (dry) return { ...rec, decision: 'would-recover', reason: 'the gate never ruled on this patch (' + toRestore.length + ' file(s))' };
  let ok = true;
  for (const s of toRestore) {
    writeFileSync(s.f.abs, readFileSync(path.join(d, s.x.before)));
    const back = hashBytes(readFileSync(s.f.abs));
    rec.files.push({ file: s.x.file, hashRestored: back });
    if (back !== s.x.hashBefore) ok = false;
  }
  writeOutcome(d, { decision: ok ? 'recovered' : 'revert-failed', files: rec.files });
  return { ...rec, decision: ok ? 'recovered' : 'revert-failed', reason: 'the gate never ruled on this patch; ' + toRestore.length + ' file(s) restored from the snapshot' };
}

// ================================================================ candidate sources (Board 10)

/** Candidates from the slow rows of the last gate run: green, but at least slowMs long. */
export function slowCandidates({ verdicts, slowMs = SLOW_MS, max = 5 } = {}) {
  const file = path.join(verdicts, 'gate.json');
  const empty = (extra) => ({ read: false, where: 'bench/verdicts/gate.json', tests: 0, slow: 0, slowMs, candidates: [], ...extra });
  if (!existsSync(file)) return empty({ reason: 'no gate.json' });
  const r = readJsonFile(file);
  if (!r.ok) return empty({ reason: r.reason });
  const j = r.j;
  const tests = Array.isArray(j.tests) ? j.tests : [];
  const slow = tests.filter((t) => t && t.exit === 0 && Number.isFinite(t.ms) && t.ms >= slowMs).sort((a, b) => b.ms - a.ms);
  const candidates = slow.slice(0, max).map((t) => ({
    key: 'slow:' + t.file, source: 'slow', where: 'bench/verdicts/gate.json', kind: 'gate.slow', evidence: 'faster',
    file: null, test: t.file, patch: null,
    why: t.file + ' took ' + t.ms + ' ms in the gate run of ' + (j.at || 'an unknown time') + ' (slow is ' + slowMs + ' ms or more); a patch must keep it green and make it run in at most ' + Math.round(FASTER_RATIO * 100) + ' percent of the time',
    evidenceData: { ms: t.ms, pass: t.pass ?? null, total: t.total ?? null, at: j.at ?? null },
  }));
  return { read: true, where: 'bench/verdicts/gate.json', at: j.at ?? null, tests: tests.length, slow: slow.length, slowMs, candidates };
}

/**
 * The OPEN lines of one notes file. Two grammars: a line starting with "OPEN:" anywhere (the
 * planted one), and a top-level bullet under a heading whose text starts with "Open" (the
 * sections the builders already write). A bullet's indented continuation lines join it.
 */
export function parseOpenLines(text) {
  const out = [];
  const lines = String(text).split(/\r?\n/);
  let inOpen = false, inFence = false, cur = null;
  const flush = () => { if (cur) { out.push(cur); cur = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) { flush(); inFence = !inFence; continue; }
    if (inFence) continue;
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flush(); inOpen = /^open\b/i.test(h[2].trim()); continue; }
    const strict = line.match(/^OPEN:\s*(\S.*)$/);
    if (strict) { flush(); out.push({ line: i + 1, grammar: 'OPEN:', text: strict[1].trim() }); continue; }
    if (!inOpen) continue;
    const b = line.match(/^(?:[-*]|\d+\.)\s+(\S.*)$/);
    if (b) { flush(); cur = { line: i + 1, grammar: 'section', text: b[1].trim() }; continue; }
    if (cur && /^\s+\S/.test(line)) { cur.text += ' ' + line.trim(); continue; }
    flush();
  }
  flush();
  return out;
}

const PATH_RE = /[A-Za-z0-9_\-/.]+\.(?:mjs|js)\b/g;
/** The first source file and the first test file an OPEN line names that exist in root. */
export function pathsIn(text, noteName, root = ROOT) {
  let file = null, test = null, testFrom = null;
  for (const m of String(text).matchAll(PATH_RE)) {
    const p = m[0].replace(/^\.\//, '');
    const sp = safePath(p, { root });
    if (!sp.ok) continue;
    if (/\.test\.mjs$/i.test(sp.rel)) { if (!test) { test = sp.rel; testFrom = 'named'; } continue; }
    if (!file) file = sp.rel;
  }
  if (!test && noteName) {
    const t = 'test/' + noteName + '.test.mjs';
    if (existsSync(path.join(root, t))) { test = t; testFrom = 'note name'; }
  }
  return { file, test, testFrom };
}

/** Candidates from notes/*.md: every OPEN line. */
export function notesCandidates({ root = ROOT, max = 80 } = {}) {
  const dir = path.join(root, 'notes');
  if (!existsSync(dir)) return { read: false, files: 0, open: 0, strict: 0, candidates: [] };
  const names = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  const all = [];
  for (const f of names) {
    let text;
    try { text = readFileSync(path.join(dir, f), 'utf8'); } catch { continue; }
    for (const o of parseOpenLines(text)) all.push({ ...o, note: 'notes/' + f, name: f.replace(/\.md$/, '') });
  }
  const candidates = all.slice(0, max).map((o) => {
    const { file, test, testFrom } = pathsIn(o.text, o.name, root);
    return {
      key: 'notes:' + o.note + ':' + o.line, source: 'notes', where: o.note + ':' + o.line, kind: 'notes.open', grammar: o.grammar,
      evidence: 'fix', file, test, testFrom, patch: null, why: o.text.slice(0, 400), openLine: o.text.slice(0, 1200),
    };
  });
  return { read: true, files: names.length, open: all.length, strict: all.filter((o) => o.grammar === 'OPEN:').length, candidates };
}

/** Decode a liveness bitset (bit i of byte i>>3 at position i&7) and check its popcount. */
export function decodeBits(o) {
  if (!o || !Number.isInteger(o.n) || o.n < 0 || typeof o.b64 !== 'string') return null;
  const bytes = Buffer.from(o.b64, 'base64');
  if (bytes.length < Math.ceil(o.n / 8)) return null;
  let count = 0;
  for (let i = 0; i < o.n; i++) if ((bytes[i >> 3] >> (i & 7)) & 1) count++;
  if (Number.isInteger(o.count) && o.count !== count) return null;
  return { n: o.n, count, bit: (i) => ((bytes[i >> 3] >> (i & 7)) & 1) === 1 };
}

/** The first test file (sorted) whose text names this path. */
export function findTestFor(root, rel) {
  const dir = path.join(root, 'test');
  if (!rel || !existsSync(dir)) return null;
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.test.mjs')).sort()) {
    try { if (readFileSync(path.join(dir, f), 'utf8').includes(rel)) return 'test/' + f; } catch { /* unreadable is not a match */ }
  }
  return null;
}

/**
 * Candidates from bench/verdicts/census.json: one per edges file of the census seed that holds
 * a dead edge declaration (an `e(` line whose liveness bit is 0). Edges only: a dead cell is
 * named by edges in other files, so pruning one is a change to many files, counted here and
 * not proposed. A seed whose manifest.json pins a content hash is marked pinned: deleting
 * lines from one of its files fails verify(), so the author will not write that prune.
 */
export function censusCandidates({ root = ROOT, verdicts = null, max = 64 } = {}) {
  const vfile = path.join(verdicts || path.join(root, 'bench', 'verdicts'), 'census.json');
  const where = relOf(root, vfile);
  if (!existsSync(vfile)) return { read: false, where, reason: 'no census verdict', candidates: [] };
  const r = readJsonFile(vfile);
  if (!r.ok) return { read: false, where, reason: r.reason, candidates: [] };
  const j = r.j;
  const seed = typeof j.seed === 'string' ? j.seed.replaceAll('\\', '/').replace(/\/+$/, '') : null;
  const head = { read: true, where, at: j.at ?? null, seed };
  const idx = seed ? safePath(seed + '/index.mjs', { root }) : { ok: false, reason: 'the verdict names no seed' };
  if (!idx.ok) return { ...head, reason: idx.reason, candidates: [] };
  const edgeBits = decodeBits(j.live && j.live.edges), cellBits = decodeBits(j.live && j.live.cells);
  if (!edgeBits) return { ...head, reason: 'the verdict carries no edge liveness bitset that decodes to its own count', candidates: [] };
  const seedDir = path.dirname(idx.abs);
  const indexText = readFileSync(idx.abs, 'utf8');
  const edgeFiles = [...indexText.matchAll(/from\s+["']\.\/(edges-\d+\.mjs)["']/g)].map((m) => m[1]);
  const cellFiles = [...indexText.matchAll(/from\s+["']\.\/(cells-\d+\.mjs)["']/g)].map((m) => m[1]);
  const mf = path.join(seedDir, 'manifest.json');
  const manifest = existsSync(mf) ? readJsonFile(mf) : null;
  const pinned = manifest && manifest.ok && typeof manifest.j.hash === 'string'
    ? seed + '/manifest.json pins content hash ' + manifest.j.hash.slice(0, 12) + ' and the edge count' : null;
  let deadCells = null;
  if (cellBits) {
    let k = 0, d = 0;
    for (const f of cellFiles) for (const line of readFileSync(path.join(seedDir, f), 'utf8').split('\n')) if (line.startsWith('c(')) { if (k < cellBits.n && !cellBits.bit(k)) d++; k++; }
    deadCells = k === cellBits.n ? d : null;
  }
  let k = 0;
  const perFile = [];
  for (const f of edgeFiles) {
    const lines = readFileSync(path.join(seedDir, f), 'utf8').split(/\r?\n/);
    const dead = [];
    let decl = 0;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('e(')) { if (k < edgeBits.n && !edgeBits.bit(k)) dead.push(i + 1); k++; decl++; }
    perFile.push({ file: f, declarations: decl, dead });
  }
  if (k !== edgeBits.n) return { ...head, edges: edgeBits.n, reason: 'the seed moved since the census: ' + k + ' edge declarations on disk, ' + edgeBits.n + ' in the verdict', candidates: [] };
  const test = typeof j.test === 'string' ? j.test : findTestFor(root, seed);
  const deadEdges = perFile.reduce((a, p) => a + p.dead.length, 0);
  const candidates = perFile.filter((p) => p.dead.length).slice(0, max).map((p) => ({
    key: 'census:' + seed + '/' + p.file, source: 'census', where, kind: 'census.dead', evidence: 'preserve',
    file: seed + '/' + p.file, test, patch: null, pinned,
    why: p.dead.length + ' of ' + p.declarations + ' edge declarations in ' + seed + '/' + p.file + ' never delivered in the census of ' + (j.at || 'an unknown time') + '; the prune deletes them and every test must stay green',
    prune: { lines: p.dead, of: p.declarations },
  }));
  return { ...head, edges: edgeBits.n, liveEdges: edgeBits.count, deadEdges, cells: cellBits ? cellBits.n : null, deadCells, edgeFiles: edgeFiles.length, pinned, test, candidates };
}

/** A unified diff that deletes exactly these 1-based lines of `text` (no context: each hunk is a pure deletion). */
export function prunePatch(text, deadLines, rel) {
  const lines = String(text).split(/\r?\n/);
  const set = [...new Set(deadLines)].filter((n) => Number.isInteger(n) && n >= 1 && n <= lines.length).sort((a, b) => a - b);
  if (!set.length) return null;
  const out = ['--- a/' + rel, '+++ b/' + rel];
  let removed = 0;
  for (let i = 0; i < set.length;) {
    let j = i;
    while (j + 1 < set.length && set[j + 1] === set[j] + 1) j++;
    const start = set[i], count = j - i + 1;
    out.push('@@ -' + start + ',' + count + ' +' + (start - removed - 1) + ',0 @@');
    for (let n = start; n <= set[j]; n++) out.push('-' + lines[n - 1]);
    removed += count;
    i = j + 1;
  }
  return out.join('\n') + '\n';
}

function lastJsonLine(text) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) { try { return JSON.parse(lines[i]); } catch { /* not this one */ } }
  return null;
}

/** Candidates from mind/imagine.mjs propose(), when that file exists. Run in a child process. */
export function imagineCandidates({ root = ROOT, timeoutMs = 60_000 } = {}) {
  const f = path.join(root, 'mind', 'imagine.mjs');
  if (!existsSync(f)) return { read: false, present: false, reason: 'mind/imagine.mjs does not exist', candidates: [] };
  const t0 = Date.now();
  const r = spawnSync(process.execPath, ['--max-old-space-size=' + CHILD_HEAP_MB, SELF_FILE, '--child', 'imagine', root], {
    encoding: 'utf8', timeout: timeoutMs, env: cleanEnv(), windowsHide: true, maxBuffer: 16 * 1024 * 1024,
  });
  const ms = Date.now() - t0;
  const ans = lastJsonLine(r.stdout);
  if (!ans || !ans.ok) return { read: false, present: true, ms, reason: ans?.reason || 'the imagine child exited ' + r.status + (r.error ? ' (' + r.error.code + ')' : '') + ': ' + String(r.stderr || '').split('\n').filter(Boolean).slice(-1)[0], candidates: [] };
  const candidates = ans.items.map((it, i) => ({
    key: 'imagine:' + (it.key || i), source: 'imagine', where: 'mind/imagine.mjs', kind: 'imagine',
    evidence: it.evidence === 'preserve' ? 'preserve' : 'fix', file: it.file || null, test: it.test || null,
    patch: it.patch || null, why: it.why || 'an imagined change with no reason given',
  }));
  return { read: true, present: true, ms, how: ans.how || null, proposed: ans.proposed ?? ans.items.length, patches: candidates.filter((c) => c.patch).length, note: ans.note || null, candidates };
}

/**
 * Every source, in SOURCE_ORDER: a red tree is repaired first, and a prune (graded by "every
 * test stays green") runs after the fixes, when the tree can be green.
 */
export function collectCandidates({
  root = ROOT, verdicts = null, run = true, max = 5, timeoutMs = DEFAULT_TIMEOUT_MS, slowMs = SLOW_MS,
  sources = null, imagineTimeoutMs = 60_000,
} = {}) {
  const v = verdicts || path.join(root, 'bench', 'verdicts');
  const want = new Set(Array.isArray(sources) && sources.length ? sources : [...SOURCE_ORDER, BOARDS_SOURCE]);
  const detail = {}, lists = {};
  if (want.has('gate')) {
    const g = gateCandidates({ verdicts: v, root, run, max, timeoutMs });
    detail.gate = { read: g.read, tests: g.tests, red: g.red, verdict: g.verdict ?? null, candidates: g.candidates.length };
    // the gate names the red TEST; the target is chosen by the author among what it imports
    lists.gate = g.candidates.map((c) => ({ ...c, source: 'gate', where: g.file, evidence: 'fix', evidenceData: c.evidence ?? null, file: null }));
  }
  if (want.has('notes')) { const n = notesCandidates({ root }); const { candidates, ...rest } = n; detail.notes = { ...rest, candidates: candidates.length }; lists.notes = candidates; }
  if (want.has('imagine')) { const n = imagineCandidates({ root, timeoutMs: imagineTimeoutMs }); const { candidates, ...rest } = n; detail.imagine = { ...rest, candidates: candidates.length }; lists.imagine = candidates; }
  if (want.has('census')) { const n = censusCandidates({ root, verdicts: v }); const { candidates, ...rest } = n; detail.census = { ...rest, candidates: candidates.length }; lists.census = candidates; }
  if (want.has('slow')) { const n = slowCandidates({ verdicts: v, slowMs, max }); const { candidates, ...rest } = n; detail.slow = { ...rest, candidates: candidates.length }; lists.slow = candidates; }
  if (want.has('mutants')) {
    const m = mutantCandidates({ verdicts: v });
    detail.mutants = { read: m.read, mutants: m.mutants, survived: m.survived, candidates: m.candidates.length };
    lists.mutants = m.candidates.map((c) => ({ ...c, source: 'mutants', where: m.file, evidence: 'fix', evidenceData: c.evidence ?? null }));
  }
  if (want.has(BOARDS_SOURCE)) { const n = boardsCandidates({ root }); const { candidates, ...rest } = n; detail.boards = { ...rest, candidates: candidates.length }; lists.boards = candidates; }
  return { sources: detail, candidates: [...SOURCE_ORDER, BOARDS_SOURCE].filter((s) => want.has(s)).flatMap((s) => lists[s] || []) };
}

// ================================================================ THE BOARDS SOURCE (Board 15)
// Author: board 15 builder. His 2026-09-24 14:29: "it should be able to finish undone work". Every
// undone item of every board (self/boards.mjs reads docs/boards without running a script; the
// ledger writer of self/gaps.mjs appends them to state/self/gaps.jsonl as kind "board item") is a
// candidate of source "boards" with evidence mode "brief", smallest owned set first. The brief
// operator is self/brief.mjs (the Board 15 brief item), imported by name in a child process: when
// that file or its operator export is absent the candidate is REFUSED with "brief operator not
// landed", in a dry run too. A dry run never runs a brief ("would-brief"). A live run runs at most
// BRIEFS_PER_RUN, with the author's remaining model calls (0 when the author is off: the organism's
// own regions only). A kept brief that returns a unified diff goes through applyToTree (the ceiling,
// the gap's files, a snapshot, the real gate, a byte-for-byte revert on red); a kept whole-file
// patch set is saved under state/self/boards-kept/ and refused at the apply wall, because writing
// new files is not a wall this file has. The source is registered OUTSIDE SOURCE_ORDER: a Board 14
// soak's Board 10 pass reads SOURCE_ORDER only, so a 60-minute brief never runs inside a soak.
export const BOARDS_SOURCE = 'boards';
export const BRIEF_EVIDENCE = 'brief';
export const BRIEF_REL = 'self/brief.mjs';
export const BRIEF_OPERATORS = Object.freeze(['runBrief', 'brief', 'executeBrief', 'attemptBrief', 'default']);
export const BRIEF_NOT_LANDED = 'brief operator not landed';
export const BRIEFS_PER_RUN = 1;
export const BRIEF_WALL_MINUTES = 60;
export const BOARDS_KEPT_REL = 'state/self/boards-kept';
const BRIEF_MARK = '@@BRIEF-RESULT@@';

/** Candidates from the board-item lines of the ledger; with none there, a read-only scan of docs/boards. */
export function boardsCandidates({ root = ROOT } = {}) {
  const ledgerRel = 'state/self/gaps.jsonl';
  const ledgerAbs = path.join(root, ...ledgerRel.split('/'));
  let lines = [], from = 'ledger', reason = null, scanErrors = [];
  if (existsSync(ledgerAbs)) {
    try {
      for (const l of readFileSync(ledgerAbs, 'utf8').split(/\r?\n/)) {
        if (!l.trim()) continue;
        try { const g = JSON.parse(l); if (g && g.kind === BOARD_ITEM_KIND) lines.push(g); } catch { /* an unreadable line is the ledger's to count */ }
      }
    } catch (e) { reason = 'the ledger is unreadable: ' + String((e && e.message) || e).split('\n')[0]; }
  }
  if (!lines.length) {
    from = 'scan';
    try { const b = boardItemLines({ root }); lines = b.lines; scanErrors = b.scan.errors; } catch (e) { reason = 'self/boards.mjs threw: ' + String((e && e.message) || e).split('\n')[0]; lines = []; }
  }
  const nFiles = (g) => (Array.isArray(g.files) ? g.files.length : 0);
  lines.sort((a, b) => nFiles(a) - nFiles(b) || (Number(a.board) || 0) - (Number(b.board) || 0) || String(a.key).localeCompare(String(b.key)));
  const brief = probeBrief({ root });
  const candidates = lines.map((g) => ({
    key: 'boards:' + g.id, id: g.id, source: BOARDS_SOURCE, where: from === 'ledger' ? ledgerRel : 'docs/boards (scanned, the ledger has no board-item line)',
    kind: BOARD_ITEM_KIND, evidence: BRIEF_EVIDENCE, file: null, test: null, gap: g, files: Array.isArray(g.files) ? g.files : [],
    why: 'board ' + g.board + ' item ' + g.key + ' is undone (' + (g.state || 'undone') + '): ' + String(g.reason || '').slice(0, 200),
  }));
  return {
    read: true, from, where: from === 'ledger' ? ledgerRel : 'docs/boards', items: lines.length, reason, scanErrors: scanErrors.length,
    withTrial: lines.filter((g) => g.trial).length, needsModel: lines.filter((g) => g.needsModel).length,
    brief: { landed: brief.landed, operator: brief.operator, reason: brief.reason }, candidates,
  };
}

const briefProbes = new Map();
export const BRIEF_PROBE_RETRY_MS = 60_000;
/** Is self/brief.mjs landed under this root, and which operator does it export? Probed once per root, in a child. */
export function probeBrief({ root = ROOT, fresh = false } = {}) {
  const abs = path.join(root, ...BRIEF_REL.split('/'));
  if (!existsSync(abs)) return { landed: false, operator: null, exports: [], reason: BRIEF_NOT_LANDED + ': ' + BRIEF_REL + ' is absent' };
  const key = abs + '|' + statSync(abs).mtimeMs;
  const hit = briefProbes.get(key);
  // a landed probe holds until the file changes; a failed one for BRIEF_PROBE_RETRY_MS (a dependency mid-write heals)
  if (!fresh && hit && (hit.out.landed || Date.now() - hit.at < BRIEF_PROBE_RETRY_MS)) return hit.out;
  const script = 'const m = await import(process.argv[1]); console.log(' + JSON.stringify(BRIEF_MARK) + ' + JSON.stringify(Object.keys(m).map((k) => [k, typeof m[k]])));';
  const r = spawnSync(process.execPath, ['--max-old-space-size=' + CHILD_HEAP_MB, '--input-type=module', '-e', script, pathToFileURL(abs).href], { cwd: root, encoding: 'utf8', timeout: 60_000, windowsHide: true });
  let exps = null;
  const at = String(r.stdout || '').lastIndexOf(BRIEF_MARK);
  if (at >= 0) { try { exps = JSON.parse(String(r.stdout).slice(at + BRIEF_MARK.length).split(/\r?\n/)[0]); } catch { exps = null; } }
  let out;
  // the error line of the child's stderr, not its last line (Node ends a stack with "Node.js vX")
  const errLines = String(r.stderr || '').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !/^at\s/.test(l) && !/^Node\.js v/.test(l));
  const errLine = errLines.find((l) => /\b(?:\w*Error|error)\b[:\s]/.test(l)) || errLines.pop() || (r.error ? r.error.code : 'exit ' + r.status);
  if (!Array.isArray(exps)) out = { landed: false, operator: null, exports: [], reason: BRIEF_NOT_LANDED + ': ' + BRIEF_REL + ' does not import (' + errLine.slice(0, 300) + ')' };
  else {
    const fns = exps.filter(([, t]) => t === 'function').map(([k]) => k);
    const op = BRIEF_OPERATORS.find((n) => fns.includes(n)) || null;
    out = op ? { landed: true, operator: op, exports: exps.map(([k]) => k), reason: null } : { landed: false, operator: null, exports: exps.map(([k]) => k), reason: BRIEF_NOT_LANDED + ': ' + BRIEF_REL + ' exports none of ' + BRIEF_OPERATORS.join(', ') };
  }
  briefProbes.set(key, { out, at: Date.now() });
  return out;
}

/** Run the brief operator on one gap in a child (async inside, synchronous here), bounded by its wall. */
export function runBriefChild({ root = ROOT, operator, gap, modelCalls = 0, wallMinutes = BRIEF_WALL_MINUTES } = {}) {
  const abs = path.join(root, ...BRIEF_REL.split('/'));
  const script = [
    'const chunks = []; for await (const c of process.stdin) chunks.push(c);',
    'const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));',
    'const m = await import(process.argv[1]);',
    'const fn = input.operator === "default" ? m.default : m[input.operator];',
    'let r; try { r = await fn(input.gap, input.opts); } catch (e) { r = { kept: false, wall: "brief", reason: "the brief operator threw: " + String((e && e.message) || e).split("\\n")[0] }; }',
    'console.log(' + JSON.stringify(BRIEF_MARK) + ' + JSON.stringify({ r: r ?? null }));',
  ].join('\n');
  const opts = { root, modelCalls, wallMinutes, author: 'organism (brief)', from: BOARDS_SOURCE };
  const t0 = Date.now();
  const res = spawnSync(process.execPath, ['--max-old-space-size=' + GATE_HEAP_MB, '--input-type=module', '-e', script, pathToFileURL(abs).href], {
    cwd: root, input: JSON.stringify({ operator, gap, opts }), encoding: 'utf8', timeout: (wallMinutes + 5) * 60_000, windowsHide: true, maxBuffer: 256 * 1024 * 1024,
  });
  const ms = Date.now() - t0;
  const at = String(res.stdout || '').lastIndexOf(BRIEF_MARK);
  if (at < 0) return { ok: false, ms, reason: res.error && res.error.code === 'ETIMEDOUT' ? 'the brief ran past its wall of ' + wallMinutes + ' minutes and was killed' : 'the brief child printed no result (exit ' + res.status + '): ' + (String(res.stderr || '').trim().split(/\r?\n/).pop() || '') };
  try { return { ok: true, ms, ...JSON.parse(String(res.stdout).slice(at + BRIEF_MARK.length).split(/\r?\n/)[0]) }; } catch (e) { return { ok: false, ms, reason: 'the brief child result does not parse: ' + String(e.message) }; }
}

/** A unified diff split per file, the grammar of self/improve.mjs splitSections (not imported: improve imports this file). */
export function diffSections(patch) {
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

/**
 * One boards candidate through the brief evidence mode. Returns the decision fields to record.
 * ctx: {root, dry, modelCallsLeft, budget: {left}, gates: {baseline}, gateCmd, gateTimeoutMs, runId, recordAuthored}
 */
export function briefRound(c, ctx = {}) {
  const { root = ROOT, dry = false, modelCallsLeft = 0, budget = { left: BRIEFS_PER_RUN }, gates = {}, gateCmd = null, gateTimeoutMs = GATE_TIMEOUT_MS, runId = null, recordAuthored = true, runChild = runBriefChild, gateFn = runGate } = ctx;
  const g = c.gap || {};
  const info = { gap: g.id ?? null, board: g.board ?? null, verdictFile: g.verdictFile ?? null, trial: g.trial ?? null, needsModel: g.needsModel ?? null, files: Array.isArray(g.files) ? g.files.length : 0 };
  const probe = probeBrief({ root });
  if (!probe.landed) return { ...info, decision: 'refused', wall: 'brief', reason: probe.reason };
  if (dry) return { ...info, decision: 'would-brief', operator: probe.operator, reason: 'a live run would hand this board item to ' + BRIEF_REL + ' ' + probe.operator + '() on a copy, with ' + modelCallsLeft + ' model call' + (modelCallsLeft === 1 ? '' : 's') + ' and a ' + BRIEF_WALL_MINUTES + '-minute wall' };
  if (budget.left <= 0) return { ...info, decision: 'refused', wall: 'budget', reason: 'the brief budget of ' + BRIEFS_PER_RUN + ' per run is spent' };
  budget.left--;
  const out = runChild({ root, operator: probe.operator, gap: g, modelCalls: modelCallsLeft, wallMinutes: Math.min(BRIEF_WALL_MINUTES, Number(g.minutes) || BRIEF_WALL_MINUTES) });
  const r = (out && out.r) || {};
  const calls = Number.isFinite(Number(r.modelCalls)) ? Number(r.modelCalls) : null;
  const brief = { operator: probe.operator, ms: out.ms ?? null, modelCalls: calls, kept: r.kept === true || r.decision === 'kept', wall: r.wall ?? null, steps: Array.isArray(r.steps) ? r.steps.length : null };
  if (!out.ok) return { ...info, decision: 'refused', wall: 'brief', reason: out.reason, brief };
  if (!brief.kept) return { ...info, decision: 'refused', wall: r.wall || 'brief', reason: r.reason || 'the brief kept nothing', brief };
  // self/brief.mjs runBrief returns patchSet {files: [{file, isNew, content}], patch}: whole-file diffs, "--- /dev/null" for a new file.
  const ps = r.patchSet && typeof r.patchSet === 'object' && !Array.isArray(r.patchSet) ? r.patchSet : null;
  const patch = typeof r.patch === 'string' ? r.patch : typeof r.patchSet === 'string' ? r.patchSet : ps && typeof ps.patch === 'string' ? ps.patch : null;
  const sections = patch ? diffSections(patch) : [];
  const fresh = [...new Set([...(ps && Array.isArray(ps.files) ? ps.files.filter((f) => f && f.isNew).map((f) => String(f.file)) : []), ...sections.filter((s) => !existsSync(path.join(root, ...s.file.split('/')))).map((s) => s.file)])];
  if (!patch || !sections.length || fresh.length) {
    const dir = path.join(root, ...BOARDS_KEPT_REL.split('/'));
    mkdirSync(dir, { recursive: true });
    const saved = path.join(dir, stamp(new Date()) + '-' + String(g.id).replace(/[^\w.-]+/g, '_') + '.json');
    writeFileSync(saved, JSON.stringify({ at: new Date().toISOString(), gap: g.id, author: 'organism (brief)', result: r }, null, 2));
    return { ...info, decision: 'refused', wall: 'apply', reason: 'the brief kept a patch set that ' + (fresh.length ? 'creates ' + fresh.length + ' new file(s) (' + fresh.slice(0, 5).join(', ') + ')' : 'is not a unified diff of existing files') + '; this file has no wall that writes new files, so it was saved at ' + relOf(root, saved) + ' for the record wall', brief };
  }
  const a = applyToTree({ root, patch, files: Array.isArray(g.files) ? g.files : [], pre: {}, key: c.key, runId, author: 'organism (brief)', gateCmd, gateTimeoutMs, gates, splitSections: () => sections, gateFn, meta: { gap: g.id, operator: 'brief', source: BOARDS_SOURCE } });
  const fields = { ...info, decision: a.decision, wall: a.wall ?? null, reason: a.reason, author: 'organism (brief)', brief, ...(a.fields || {}) };
  if (a.decision === 'kept' && recordAuthored) {
    appendAuthored(root, { at: new Date().toISOString(), runId, key: c.key, source: BOARDS_SOURCE, from: 'boards:' + g.id, kind: BOARD_ITEM_KIND, files: a.files.map((f) => f.file), author: 'organism (brief)', organism: true, gate: a.gate ? a.gate.gate : null, modelCalls: calls });
  }
  return fields;
}

// ================================================================ the author (Board 10)

/**
 * Where the model cell lives. Open weights only: a model name or base url naming Claude or
 * Anthropic is refused here, before any socket opens, and again in the child.
 */
export function authorConfig({ model = null, base = null, timeoutMs = null, maxTokens = null, numCtx = null, think = true } = {}) {
  const m = String(model || process.env[AUTHOR_MODEL_ENV] || AUTHOR_MODEL);
  const b = String(base || process.env[AUTHOR_BASE_ENV] || AUTHOR_BASE).replace(/\/+$/, '');
  const cfg = {
    provider: 'ollama', model: m, base: b, timeoutMs: timeoutMs || AUTHOR_TIMEOUT_MS, maxTokens: maxTokens || 6000,
    numCtx: numCtx || 16384, think: think !== false, ok: true, reason: null,
  };
  if (CLOSED.test(m) || CLOSED.test(b)) return { ...cfg, ok: false, reason: 'the patch author runs on open weights only; ' + (CLOSED.test(m) ? 'model ' + m : 'base ' + b) + ' names a closed provider and is refused' };
  return cfg;
}

/** The files the author may patch: the candidate's own target, or the modules its test imports. */
export function authorTargets(c, root = ROOT) {
  const out = [];
  const add = (rel) => { const a = allowTarget(rel, c.test || null, { root }); if (a.ok && !out.includes(a.rel)) out.push(a.rel); };
  if (c.file) add(c.file);
  else if (c.test) {
    const tf = safePath(c.test, { root });
    if (tf.ok) {
      const src = readFileSync(tf.abs, 'utf8');
      for (const m of src.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s*)['"](\.{1,2}\/[^'"]+)['"]/gm)) {
        const rel = path.posix.normalize(path.posix.join(path.posix.dirname(tf.rel), m[1]));
        if (!rel.startsWith('..')) add(rel);
        if (out.length >= 3) break;
      }
    }
  }
  return out;
}

const capText = (s) => (s.length > MAX_FILE_CHARS ? s.slice(0, MAX_FILE_CHARS) + '\n/* (truncated at ' + MAX_FILE_CHARS + ' characters) */' : s);

/** The prompt the model cell is asked with: the candidate, the file(s), its test, the failing assertion, the OPEN line. */
export function buildAuthorRequest(c, { root = ROOT, failing = null, mode = 'fix' } = {}) {
  const targets = authorTargets(c, root);
  const system = 'You are the patch author inside a program that rewrites its own source code. You answer with exactly one unified diff and nothing else: no prose, no explanation.';
  const L = [];
  L.push('TASK: ' + String(c.openLine || c.why || '').slice(0, 1200));
  if (mode === 'faster') L.push('GOAL: make ' + c.test + ' run faster while every one of its assertions still passes. Do not remove, skip or weaken any test.');
  else L.push('GOAL: make the failing test pass without breaking anything else. You may not edit the test.');
  L.push('TEST: ' + (c.test || '(none)'));
  if (Array.isArray(failing) && failing.length) L.push('FAILING NOW: ' + failing.slice(0, 3).map((f) => f.name + ' :: ' + (f.error || 'no message')).join(' | '));
  for (const t of targets) {
    let body = '';
    try { body = readFileSync(path.join(root, t), 'utf8'); } catch { body = ''; }
    L.push('', 'FILE ' + t + ':', '```js', capText(body), '```');
  }
  if (c.test) {
    let tb = '';
    try { tb = readFileSync(path.join(root, c.test), 'utf8'); } catch { tb = ''; }
    L.push('', 'TEST FILE ' + c.test + ' (read only):', '```js', capText(tb), '```');
  }
  L.push('', 'Answer with ONE unified diff that edits exactly one of: ' + (targets.join(', ') || '(no file)') + '.',
    'Start with the two header lines "--- a/<path>" and "+++ b/<path>".',
    'Each hunk starts with "@@ -<line>,<count> +<line>,<count> @@". Lines you remove start with "-" and are copied exactly from the file above; lines you add start with "+"; unchanged context lines start with one space.',
    'Output only the diff.');
  return { system, prompt: L.join('\n'), targets };
}

function stripDiffPath(s) {
  let p = String(s).split('\t')[0].trim();
  if (p === '/dev/null') return null;
  p = p.replace(/^["']|["']$/g, '').replace(/^[ab]\//, '');
  return p || null;
}

/**
 * Pull one single-file unified diff out of a model answer: the reasoning block and code fences
 * are stripped, a hunk header without numbers is repaired (the patcher finds the hunk by its
 * content when the line number does not match), and a hunk line that lost its leading space is
 * read as context when more diff follows it. Of a multi-file answer, the first section that
 * targets an allowed file is kept.
 */
export function extractDiff(text, { root = ROOT, targets = [], test = null } = {}) {
  const s = String(text || '').replace(/<think>[\s\S]*?<\/think>/g, '');
  const fences = [...s.matchAll(/```[A-Za-z]*\r?\n([\s\S]*?)```/g)].map((m) => m[1]).filter((b) => /^@@/m.test(b));
  const raw = (fences.length ? fences[0] : s).split(/\r?\n/);
  const startAt = raw.findIndex((l) => l.startsWith('--- ') || l.startsWith('@@'));
  if (startAt < 0) return { patch: null, file: null, reason: 'the answer holds no unified diff (no --- header and no @@ hunk)' };
  const sections = [];
  let cur = null;
  const isTag = (l) => l === '' || /^[ +\-\\]/.test(l) || l.startsWith('@@');
  for (let i = startAt; i < raw.length; i++) {
    let l = raw[i];
    if (l.startsWith('```')) break;
    if (/^(diff --git|index |new file mode|deleted file mode|similarity index|rename (from|to) )/.test(l)) continue;
    if (l.startsWith('--- ') && (!cur || cur.hunks === 0 || (raw[i + 1] || '').startsWith('+++ '))) {
      cur = { from: stripDiffPath(l.slice(4)), to: null, lines: [], hunks: 0 };
      sections.push(cur);
      continue;
    }
    if (l.startsWith('+++ ') && cur && cur.to === null && cur.hunks === 0) { cur.to = stripDiffPath(l.slice(4)); continue; }
    if (!cur) { cur = { from: null, to: null, lines: [], hunks: 0 }; sections.push(cur); }
    if (l.startsWith('@@')) {
      if (!/^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/.test(l)) l = '@@ -1 +1 @@';
      cur.lines.push(l); cur.hunks++;
      continue;
    }
    if (!cur.hunks) continue;
    if (isTag(l)) { cur.lines.push(l); continue; }
    const next = raw.slice(i + 1).find((x) => x.trim() !== '');
    if (next !== undefined && isTag(next) && next !== '') { cur.lines.push(' ' + l); continue; }
    break;
  }
  const usable = sections.filter((x) => x.hunks > 0);
  if (!usable.length) return { patch: null, file: null, reason: 'the diff holds no hunk' };
  const allowed = (p) => p && allowTarget(p, test, { root }).ok;
  let pick = null, file = null;
  for (const x of usable) {
    const p = x.to || x.from;
    if (p && (targets.includes(p) || (!targets.length && allowed(p)))) { pick = x; file = p; break; }
  }
  if (!pick && usable.length === 1 && !(usable[0].to || usable[0].from) && targets.length === 1) { pick = usable[0]; file = targets[0]; }
  if (!pick) return { patch: null, file: null, reason: 'the diff targets ' + usable.map((x) => x.to || x.from || '(no file)').join(', ') + ', none of which the author was given (' + (targets.join(', ') || 'none') + ')' };
  const patch = ['--- a/' + file, '+++ b/' + file, ...pick.lines].join('\n') + '\n';
  return { patch, file, sections: usable.length, reason: null };
}

/**
 * The model author: a function (candidate, {root, failing, mode}) -> {ok, patch, file, ms, ...}
 * that asks the model cell from a child process, synchronously. Its config is fn.config.
 */
export function makeModelAuthor(opts = {}) {
  const cfg = authorConfig(opts);
  const fn = (c, ctx = {}) => {
    const root = ctx.root || ROOT;
    if (!cfg.ok) return { ok: false, patch: null, file: null, ms: 0, model: cfg.model, called: false, answered: false, reason: cfg.reason };
    const req = buildAuthorRequest(c, { root, failing: ctx.failing, mode: ctx.mode || 'fix' });
    if (!req.targets.length) return { ok: false, patch: null, file: null, ms: 0, model: cfg.model, called: false, answered: false, reason: 'no file the autopilot may write is named by the candidate or imported by its test, so no model was asked' };
    const t0 = Date.now();
    const r = spawnSync(process.execPath, ['--max-old-space-size=' + CHILD_HEAP_MB, SELF_FILE, '--child', 'author'], {
      input: JSON.stringify({ system: req.system, prompt: req.prompt, model: cfg.model, base: cfg.base, timeoutMs: cfg.timeoutMs, maxTokens: cfg.maxTokens, numCtx: cfg.numCtx, think: cfg.think }),
      encoding: 'utf8', timeout: cfg.timeoutMs + 30_000, env: cleanEnv(), windowsHide: true, maxBuffer: 16 * 1024 * 1024,
    });
    const ms = Date.now() - t0;
    const ans = lastJsonLine(r.stdout);
    if (!ans || !ans.ok) {
      return { ok: false, patch: null, file: null, ms, model: cfg.model, called: true, answered: false, promptChars: req.prompt.length,
        reason: 'the model cell did not answer: ' + (ans?.reason || 'child exit ' + r.status + (r.error ? ' ' + r.error.code : '') + ' ' + String(r.stderr || '').split('\n').filter(Boolean).slice(-1)[0]) };
    }
    const d = extractDiff(ans.text, { root, targets: req.targets, test: c.test || null });
    return {
      ok: !!d.patch, patch: d.patch, file: d.file, ms, modelMs: ans.ms ?? null, model: ans.model || cfg.model, called: true, answered: true,
      tokens: ans.tokens ?? null, promptTokens: ans.promptTokens ?? null, thinkingChars: ans.thinkingChars ?? 0, promptChars: req.prompt.length,
      reason: d.patch ? null : d.reason, answer: String(ans.text || '').slice(0, 800),
    };
  };
  fn.config = { provider: cfg.provider, model: cfg.model, base: cfg.base, ok: cfg.ok, reason: cfg.reason, timeoutMs: cfg.timeoutMs, maxTokens: cfg.maxTokens, numCtx: cfg.numCtx, think: cfg.think };
  return fn;
}

// ================================================================ preserve evidence (Board 10)
const PRESERVE_SEALED = new WeakSet();
export function isPreserveSealed(v) { return typeof v === 'object' && v !== null && PRESERVE_SEALED.has(v); }
const slimRun = (t) => (t ? { exit: t.exit, pass: t.pass, fail: t.fail, total: t.total, ms: t.ms, timedOut: t.timedOut, failures: t.failures } : null);

/**
 * THE EVIDENCE FOR A CHANGE THAT MUST CHANGE NOTHING (a prune) or only the time (faster): on a
 * temp copy of the tree the named test PASSES before the patch and PASSES after it; for
 * 'faster' the after run also takes at most `ratio` of the before run. Sealed by this process.
 */
export function verifyPreserve({ file, patch, test, root = ROOT, timeoutMs = DEFAULT_TIMEOUT_MS, faster = false, ratio = FASTER_RATIO } = {}) {
  const t0 = Date.now();
  const mode = faster ? 'faster' : 'preserve';
  const seal = (v) => { PRESERVE_SEALED.add(v); return v; };
  const fail = (reason, extra = {}) => seal({ ok: false, mode, reason, failsBefore: false, passesBefore: false, passesAfter: false, before: null, after: null, ms: Date.now() - t0, ...extra });
  const f = safePath(file, { root });
  if (!f.ok) return fail(f.reason);
  const tf = safePath(test || '', { root });
  if (!tf.ok) return fail('the test: ' + tf.reason);
  const original = readFileSync(f.abs, 'utf8');
  const patched = applyUnifiedPatch(original, patch);
  if (!patched.ok) return fail('the patch does not apply: ' + patched.reason);
  if (patched.text === original) return fail('the patch changes nothing');
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-autopilot-'));
  try {
    cpSync(root, dir, { recursive: true, filter: (src) => { const rel = path.relative(root, src); return !rel || !COPY_SKIP.includes(rel.split(path.sep)[0]); } });
    const before = runTest(dir, tf.rel, timeoutMs);
    if (before.exit !== 0) return fail('the test does not pass before the patch, so it cannot show that the patch preserved anything', { before: slimRun(before) });
    writeFileSync(path.join(dir, f.rel), patched.text);
    const after = runTest(dir, tf.rel, timeoutMs);
    const passesAfter = after.exit === 0;
    const fastEnough = !faster || after.ms <= before.ms * ratio;
    const ok = passesAfter && fastEnough;
    return seal({
      ok, mode,
      reason: ok ? null : !passesAfter ? 'the test fails with the patch applied' : 'the test is not faster enough: ' + before.ms + ' ms before, ' + after.ms + ' ms after (at most ' + Math.round(ratio * 100) + ' percent is required)',
      failsBefore: false, passesBefore: true, passesAfter, before: slimRun(before), after: slimRun(after), file: f.rel, test: tf.rel,
      hunks: patched.hunks, hashBefore: sha256(original), hashAfter: sha256(patched.text), ms: Date.now() - t0,
    });
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* a temp dir that will not go is not a verdict */ }
  }
}

/** Append one kept patch to state/self/authored.jsonl (the numerator of tools/authorship.mjs). */
export function appendAuthored(root, line) {
  const file = path.join(root, ...AUTHORED_REL.split('/'));
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(line) + '\n');
  return file;
}

// ---------------------------------------------------------------- the run
function verificationSummary(v) {
  if (!v) return null;
  return {
    ok: v.ok, mode: v.mode || 'fix', failsBefore: v.failsBefore, passesBefore: v.passesBefore ?? null, passesAfter: v.passesAfter,
    beforeFail: v.before?.fail ?? null, beforePass: v.before?.pass ?? null, beforeTotal: v.before?.total ?? null, beforeMs: v.before?.ms ?? null,
    afterPass: v.after?.pass ?? null, afterTotal: v.after?.total ?? null, afterMs: v.after?.ms ?? null, ms: v.ms ?? null,
  };
}
const gateSummary = (g) => (g ? { cmd: g.cmd, exit: g.exit, timedOut: g.timedOut, summary: g.summary, red: g.red, ms: g.ms, hash: gateHash(g) } : null);
const sourceClass = (s) => (SOURCE_ORDER.includes(s) || s === BOARDS_SOURCE ? s : 'given');
const evidenceMode = (c) => (c.evidence === 'preserve' || c.evidence === 'faster' || c.evidence === BRIEF_EVIDENCE ? c.evidence : 'fix');

/**
 * THE AUTOPILOT. Synchronous: every step is a child process or a file operation and each one
 * must finish before the next decision is taken.
 * @param {object} o
 *   candidates  an array to judge; absent, every source in SOURCE_ORDER is read (collectCandidates)
 *   author      (candidate, {root, failing, mode}) -> {patch, file, ms, model, ...}; null = no model author
 *   authorMax   model calls allowed in this run
 * @returns {{ok, dry, root, candidates, decisions, counts, bySource, ledgerFile, ...}}
 */
export function runAutopilot({
  root = ROOT, candidates = null, gateCmd = null, dry = false, max = 5,
  timeoutMs = DEFAULT_TIMEOUT_MS, gateTimeoutMs = GATE_TIMEOUT_MS, verify = verifyPatch, preserve = verifyPreserve,
  rerun = true, now = () => new Date(), print = null,
  author = null, authorMax = AUTHOR_MAX, sources = null, slowMs = SLOW_MS, recordAuthored = true, staleCheck = null,
  lock: useLock = true,
} = {}) {
  const started = now();
  const runId = stamp(started);
  const say = typeof print === 'function' ? print : () => {};
  const stateDir = path.join(root, 'state', 'self-code');
  const ledgerDir = path.join(root, 'bench', 'verdicts', 'autopilot');
  const ledgerFile = path.join(ledgerDir, started.toISOString().slice(0, 10) + '.jsonl');
  const result = {
    kind: AUTO_KIND, runId, at: started.toISOString(), root, dry, gateCmd: gateCmd || DEFAULT_GATE_CMD,
    sources: null, candidates: 0, decisions: [], recovered: [], baseline: null,
    ledgerFile: dry ? null : path.relative(root, ledgerFile).replaceAll('\\', '/'), authoredFile: null, authoredLines: 0,
    ok: true, reason: null,
  };
  const finish = () => {
    const count = (k) => result.decisions.filter((d) => d.decision === k).length;
    const judged = result.decisions.filter((d) => d.candidate === true);
    result.counts = {
      candidates: result.candidates, kept: count('kept'), reverted: count('reverted'), refused: count('refused'),
      wouldApply: count('would-apply'), recovered: count('recovered') + count('would-recover'), revertFailed: count('revert-failed'),
      proposed: judged.filter((d) => d.author).length, modelCalls: judged.filter((d) => d.model && d.model.called !== false).length,
    };
    const by = {};
    for (const d of judged) {
      const s = sourceClass(d.source);
      const t = by[s] || (by[s] = { candidates: 0, proposed: 0, kept: 0, reverted: 0, refused: 0, wouldApply: 0, modelCalls: 0, modelProposed: 0, modelKept: 0, modelMs: [] });
      t.candidates++;
      if (d.author) t.proposed++;
      if (d.decision === 'kept') t.kept++;
      else if (d.decision === 'reverted' || d.decision === 'revert-failed') t.reverted++;
      else if (d.decision === 'refused') t.refused++;
      else if (d.decision === 'would-apply') t.wouldApply++;
      if (d.model && d.model.called !== false) {
        t.modelCalls++;
        if (Number.isFinite(d.model.ms)) t.modelMs.push(d.model.ms);
        if (d.author && String(d.author).startsWith('model:')) { t.modelProposed++; if (d.decision === 'kept') t.modelKept++; }
      }
    }
    result.bySource = by;
    return result;
  };

  let lock = null;
  // useLock false: the caller (a soak) already holds this tree's lock for its whole wall
  if (!dry && useLock !== false) {
    lock = acquireLock(stateDir);
    if (!lock.ok) { result.ok = false; result.reason = lock.reason; return finish(); }
    result.lockTakenOver = lock.tookOver || null;
  }
  const record = (d) => {
    const line = { kind: AUTO_KIND, runId, at: new Date().toISOString(), ...d };
    result.decisions.push(line);
    say(line);
    if (!dry) { mkdirSync(ledgerDir, { recursive: true }); appendFileSync(ledgerFile, JSON.stringify(line) + '\n'); }
    return line;
  };

  try {
    // a patch the gate never ruled on does not stay
    result.recovered = recoverOrphans({ root, dry });
    for (const o of result.recovered) record({ id: o.id, key: o.key ?? null, file: o.file ?? null, decision: o.decision, reason: o.reason, hashBefore: o.hashBefore ?? null, hashAfter: o.hashAfter ?? null, hashRestored: o.hashRestored ?? null });

    let list = candidates;
    if (!Array.isArray(list)) {
      const col = collectCandidates({ root, run: rerun, max, timeoutMs, slowMs, sources });
      result.sources = col.sources;
      list = col.candidates;
    } else result.sources = { given: list.length };
    result.candidates = list.length;
    // collected candidates are checked for staleness before any tree copy; a given list is judged as given
    const checkStale = staleCheck === null ? !Array.isArray(candidates) : staleCheck === true;

    let baseline = null;
    let modelCalls = 0;
    const briefBudget = { left: BRIEFS_PER_RUN }; // the boards source: briefs this run may start
    // one run of a test per tree state: several OPEN lines naming one test run it once, and a write
    // to the tree empties the memo, so a test is never judged on bytes it did not run against
    const nowRuns = new Map();
    const runNow = (rel) => { if (!nowRuns.has(rel)) nowRuns.set(rel, runTest(root, rel, timeoutMs)); return nowRuns.get(rel); };
    for (const c0 of list) {
      const c = { ...c0 };
      const mode = evidenceMode(c);
      const base = {
        candidate: true, key: c.key ?? null, source: c.source ?? null, where: c.where ?? null, kind: c.kind ?? null, evidence: mode,
        origin: c.origin || 'self', file: c.file ?? null, test: c.test ?? null, why: c.why ? String(c.why).slice(0, 300) : null,
      };
      // the boards source (Board 15): a board item goes to the brief operator, never to the walls below
      if (mode === BRIEF_EVIDENCE) {
        const gates = { baseline };
        const f = briefRound(c, { root, dry, modelCallsLeft: typeof author === 'function' ? Math.max(0, authorMax - modelCalls) : 0, budget: briefBudget, gates, gateCmd, gateTimeoutMs, runId, recordAuthored });
        if (f.brief && Number.isFinite(f.brief.modelCalls)) modelCalls += f.brief.modelCalls;
        if (gates.baseline && gates.baseline !== baseline) { baseline = gates.baseline; if (!result.baseline) result.baseline = gateSummary(baseline); }
        if (f.decision === 'kept') { nowRuns.clear(); if (recordAuthored) { result.authoredLines++; result.authoredFile = AUTHORED_REL; } }
        record({ ...base, ...f });
        continue;
      }
      // 1. the ceiling on a target the candidate already names, before any author is asked
      if (c.file) {
        const pre = allowTarget(c.file, c.test || null, { root });
        if (!pre.ok) { record({ ...base, decision: 'refused', wall: 'ceiling', reason: pre.reason }); continue; }
      }
      // 2. a patch: the candidate's own, the deterministic prune, or the model cell's
      let authorName = null, model = null;
      if (c.patch) authorName = c.author || (c.source === 'imagine' ? 'imagine' : c.origin === 'model' ? 'model' : 'given');
      else if (c.kind === 'census.dead') {
        if (c.pinned) { record({ ...base, decision: 'refused', wall: 'patch', reason: 'no one-file prune: ' + c.pinned + ', so deleting lines from one file fails verify(); the whole seed is pruned by genome/emit.mjs --prune, a change to many files' }); continue; }
        const f = safePath(c.file || '', { root });
        c.patch = f.ok && c.prune ? prunePatch(readFileSync(f.abs, 'utf8'), c.prune.lines, f.rel) : null;
        if (!c.patch) { record({ ...base, decision: 'refused', wall: 'patch', reason: 'the prune found no line to delete' }); continue; }
        authorName = 'deterministic:census-prune';
      } else {
        if (typeof author !== 'function') { record({ ...base, decision: 'refused', wall: 'patch', reason: 'no patch: the candidate carries none and the patch author is off in this run' }); continue; }
        if (modelCalls >= authorMax) { record({ ...base, decision: 'refused', wall: 'patch', reason: 'no patch: the author budget of ' + authorMax + ' model call' + (authorMax === 1 ? '' : 's') + ' for this run is spent' }); continue; }
        const tf = safePath(c.test || '', { root });
        if (!tf.ok) { record({ ...base, decision: 'refused', wall: 'evidence', reason: 'the test: ' + tf.reason }); continue; }
        let failing = null;
        if (mode === 'fix') {
          // a fix needs a test that fails NOW; a passing one could not tell a patch from no patch
          const ev = c.evidenceData || {};
          if (ev.reran === true && ev.stillFails === false) { record({ ...base, decision: 'refused', wall: 'stale', reason: tf.rel + ' passed when the gate source re-ran it: there is nothing for a patch to fix, so no model was asked' }); continue; }
          if (ev.reran === true && ev.stillFails === true && ev.assertion) failing = [ev.assertion];
          else {
            const nowRun = runNow(tf.rel);
            if (nowRun.exit === 0 && !nowRun.timedOut) { record({ ...base, decision: 'refused', wall: 'stale', reason: tf.rel + ' passes now (' + nowRun.pass + ' of ' + nowRun.total + '): there is nothing for a patch to fix, so no model was asked' }); continue; }
            failing = nowRun.failures;
          }
        }
        const a = author(c, { root, failing, mode }) || {};
        if (a.called !== false) modelCalls++;
        model = { called: a.called !== false, answered: a.answered ?? null, ok: !!a.patch, ms: a.ms ?? null, modelMs: a.modelMs ?? null, model: a.model ?? null, tokens: a.tokens ?? null, promptTokens: a.promptTokens ?? null, thinkingChars: a.thinkingChars ?? null, promptChars: a.promptChars ?? null };
        if (!a.patch) { record({ ...base, decision: 'refused', wall: 'author', reason: a.reason || 'the author returned no unified diff', model, answer: a.answer ?? null }); continue; }
        c.patch = a.patch;
        if (!c.file) c.file = a.file || null;
        base.file = c.file;
        authorName = 'model:' + (a.model || 'unknown');
      }
      base.author = authorName;
      if (model) base.model = model;
      // 1 again. the ceiling on the file the patch actually writes
      const allow = allowTarget(c.file || '', c.test || null, { root });
      if (!allow.ok) { record({ ...base, decision: 'refused', wall: 'ceiling', reason: allow.reason }); continue; }
      const tf = safePath(c.test || '', { root });
      if (!tf.ok) { record({ ...base, decision: 'refused', wall: 'evidence', reason: 'the test: ' + tf.reason }); continue; }
      if (checkStale && mode === 'fix' && !model) {
        // a carried fix whose test already passes cannot fail before it: refused without copying the tree
        const nowRun = runNow(tf.rel);
        if (nowRun.exit === 0 && !nowRun.timedOut) { record({ ...base, decision: 'refused', wall: 'stale', reason: tf.rel + ' passes now (' + nowRun.pass + ' of ' + nowRun.total + '), so no patch to it can be shown to fix anything' }); continue; }
      }
      // 3. the evidence, run by this process on a copy of the tree
      const v = mode === 'fix'
        ? verify({ file: allow.rel, patch: c.patch, test: tf.rel, root, timeoutMs })
        : preserve({ file: allow.rel, patch: c.patch, test: tf.rel, root, timeoutMs, faster: mode === 'faster' });
      const vs = verificationSummary(v);
      if (!isSealed(v) && !isPreserveSealed(v)) { record({ ...base, decision: 'refused', wall: 'evidence', reason: 'the verification was not run by this process' }); continue; }
      if (!v.ok) { record({ ...base, decision: 'refused', wall: 'evidence', reason: v.reason || 'the patch did not verify', verification: vs }); continue; }
      if ((v.after.total ?? 0) < (v.before.total ?? 0)) { record({ ...base, decision: 'refused', wall: 'evidence', reason: 'the patch makes the test run fewer tests (' + v.before.total + ' -> ' + v.after.total + ')', verification: vs }); continue; }
      const bytes = readFileSync(allow.abs);
      const text = bytes.toString('utf8');
      if (!Buffer.from(text, 'utf8').equals(bytes)) { record({ ...base, decision: 'refused', wall: 'bytes', reason: 'the file is not clean UTF-8, so a patch through text would change bytes it does not name', verification: vs }); continue; }
      const hashBefore = hashBytes(bytes);
      if (hashBefore !== v.hashBefore) { record({ ...base, decision: 'refused', wall: 'moved', reason: 'the file changed during verification (' + short(v.hashBefore) + ' -> ' + short(hashBefore) + ')', verification: vs }); continue; }
      const patched = applyUnifiedPatch(text, c.patch);
      const newBytes = patched.ok ? Buffer.from(patched.text, 'utf8') : null;
      const hashAfter = newBytes ? hashBytes(newBytes) : null;
      if (!patched.ok || hashAfter !== v.hashAfter) { record({ ...base, decision: 'refused', wall: 'bytes', reason: 'the bytes to write are not the bytes that were verified', verification: vs }); continue; }
      if (dry) { record({ ...base, decision: 'would-apply', reason: 'the evidence holds; a live run would write it and run the gate', hashBefore, hashAfter, verification: vs }); continue; }

      // 4. the gate: a baseline once, before the first write of this run
      if (!baseline) { baseline = runGate({ root, cmd: gateCmd, timeoutMs: gateTimeoutMs }); result.baseline = gateSummary(baseline); }
      const id = snapshotId(stateDir, now(), c.key, hashBefore);
      const snap = path.join(stateDir, id);
      mkdirSync(snap, { recursive: true });
      writeFileSync(path.join(snap, 'before.bin'), bytes);
      writeFileSync(path.join(snap, 'patch.diff'), String(c.patch));
      writeFileSync(path.join(snap, 'meta.json'), JSON.stringify({ id, runId, key: c.key ?? null, source: c.source ?? null, author: authorName, file: allow.rel, test: tf.rel, origin: base.origin, hashBefore, hashAfter, bytesBefore: bytes.length, bytesAfter: newBytes.length, at: new Date().toISOString() }, null, 2));
      const gj = path.join(root, 'bench', 'verdicts', 'gate.json');
      const gateJsonBefore = existsSync(gj) ? readFileSync(gj) : null;
      writeFileSync(allow.abs, newBytes);
      nowRuns.clear();
      const hashOnDisk = hashBytes(readFileSync(allow.abs));
      const g = hashOnDisk === hashAfter ? runGate({ root, cmd: gateCmd, timeoutMs: gateTimeoutMs }) : null;
      const d = g ? gateDecision(baseline, g) : { keep: false, gate: 'NOT-RUN', regressions: [], fixed: [], reason: 'the bytes on disk after the write are not the patched bytes' };
      const common = { ...base, id, hashBefore, hashAfter, verification: vs, gate: { ...gateSummary(g), verdict: d.gate, regressions: d.regressions, fixed: d.fixed }, baselineGate: gateSummary(baseline) };
      if (d.keep) {
        writeOutcome(snap, { decision: 'kept', gate: d.gate, hashOnDisk });
        const kept = record({ ...common, decision: 'kept', reason: d.reason, hashOnDisk });
        // 5. the authored ledger: one line per KEPT patch, never for a revert or a refusal
        if (recordAuthored) {
          const file = appendAuthored(root, {
            at: kept.at, runId, key: c.key ?? null, source: sourceClass(c.source), where: c.where ?? c.source ?? null, kind: c.kind ?? null,
            files: [allow.rel], author: authorName, organism: authorName !== 'given',
            hashBefore, hashAfter, gateHashBefore: gateHash(baseline), gateHashAfter: gateHash(g), gate: d.gate,
            model: model ? model.model : null, modelMs: model ? model.ms : null,
          });
          result.authoredFile = relOf(root, file);
          result.authoredLines++;
        }
        baseline = g; // the tree the next candidate is judged against
        continue;
      }
      // revert, byte for byte, and prove it
      writeFileSync(allow.abs, bytes);
      const back = readFileSync(allow.abs);
      const hashRestored = hashBytes(back);
      const restored = back.equals(bytes) && hashRestored === hashBefore;
      let gateJsonRestored = false;
      if (gateJsonBefore) { writeFileSync(gj, gateJsonBefore); gateJsonRestored = readFileSync(gj).equals(gateJsonBefore); }
      else if (existsSync(gj)) { rmSync(gj, { force: true }); gateJsonRestored = !existsSync(gj); }
      writeOutcome(snap, { decision: restored ? 'reverted' : 'revert-failed', gate: d.gate, hashRestored, gateJsonRestored });
      record({ ...common, decision: restored ? 'reverted' : 'revert-failed', reason: d.reason, hashRestored, gateJsonRestored });
      if (!restored) { result.ok = false; result.reason = 'a revert did not restore ' + allow.rel + ' (' + short(hashRestored) + ' is not ' + short(hashBefore) + '); the run stopped'; break; }
    }
  } finally {
    releaseLock(lock);
  }
  return finish();
}

// ---------------------------------------------------------------- the CLI surface
/**
 * `brain self-code [name] --auto [--dry] [--gate-cmd CMD] [--root DIR] [--candidates FILE]
 *  [--max N] [--timeout MS] [--gate-timeout MS] [--sources a,b] [--slow-ms MS]
 *  [--author on|off] [--no-author] [--author-max N] [--model NAME] [--author-base URL]
 *  [--author-timeout MS]`. The brain name is not needed: the autopilot works on the source
 * tree, not on a running organism. The model author is on in a live run and off in a dry one
 * unless --author says otherwise.
 */
export function runFromCli(opts = {}) {
  // Board 14: --soak <minutes> (or --resume) runs THE SOAK in a child process (runSoak is async)
  if ((opts.soak !== undefined && opts.soak !== false) || (opts.resume !== undefined && opts.resume !== false)) return runSoakFromCli(opts);
  const int = (v, d) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : d; };
  const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const root = typeof opts.root === 'string' ? path.resolve(opts.root) : ROOT;
  let candidates = null;
  if (typeof opts.candidates === 'string') {
    const j = JSON.parse(readFileSync(path.resolve(opts.candidates), 'utf8'));
    candidates = Array.isArray(j) ? j : Array.isArray(j.candidates) ? j.candidates : [];
  }
  const dry = opts.dry === true || opts.dry === 'true';
  const authorOn = opts['no-author'] ? false : opts.author === undefined ? !dry : !/^(off|false|0|no)$/i.test(String(opts.author));
  const author = authorOn ? makeModelAuthor({ model: str(opts.model), base: str(opts['author-base']), timeoutMs: int(opts['author-timeout'], null) }) : null;
  const r = runAutopilot({
    root, candidates, dry,
    gateCmd: typeof opts['gate-cmd'] === 'string' ? opts['gate-cmd'] : null,
    max: int(opts.max, 5), timeoutMs: int(opts.timeout, DEFAULT_TIMEOUT_MS), gateTimeoutMs: int(opts['gate-timeout'], GATE_TIMEOUT_MS),
    author, authorMax: int(opts['author-max'], AUTHOR_MAX), slowMs: int(opts['slow-ms'], SLOW_MS),
    sources: str(opts.sources) ? str(opts.sources).split(',').map((s) => s.trim()).filter(Boolean) : null,
  });
  r.author = author ? { on: true, ...author.config } : { on: false };
  r.exitCode = r.ok && r.counts.revertFailed === 0 ? 0 : 1;
  return r;
}

const plain = new Proxy({}, { get: () => (s) => String(s) });
/** Plain lines for a terminal; `st` is the CLI's styler when there is one. */
export function renderRun(r, st = plain) {
  if (r && r.soak) {
    // the soak printed its lines to stderr as it ran; this is the one line after them
    if (r.stopped || r.refused || !r.runId) return st.bold('self-code soak') + st.grey('  ' + (r.reason || (r.ok ? 'nothing ran' : 'failed')));
    return st.bold('self-code soak ') + r.runId + st.grey('  ' + String(r.status).toUpperCase() + ', ' + r.wallMinutes + ' of ' + r.soakMinutes + ' min, attempts ' + r.attempts.attempts
      + ', kept ' + r.attempts.kept + ', reverted ' + r.attempts.reverted + ', refused ' + r.attempts.refused + '; state in ' + r.soakFile) + (r.ok ? '' : st.red('  ' + r.reason));
  }
  const c = r.counts || {};
  const lines = [
    st.bold('self-code autopilot') + st.grey('  ' + (r.dry ? 'DRY, nothing written' : 'live') + '  root ' + r.root),
    st.grey('  candidates ') + (c.candidates ?? 0) + st.grey('  proposed ') + (c.proposed ?? 0) + st.grey('  kept ') + (c.kept ?? 0) + st.grey('  reverted ') + (c.reverted ?? 0)
      + st.grey('  refused ') + (c.refused ?? 0) + st.grey('  would apply ') + (c.wouldApply ?? 0) + st.grey('  recovered ') + (c.recovered ?? 0) + st.grey('  model calls ') + (c.modelCalls ?? 0),
  ];
  if (r.author) lines.push(st.grey('  author: ' + (r.author.on ? 'model cell ' + r.author.model + ' at ' + r.author.base + (r.author.ok ? '' : ' (REFUSED: ' + r.author.reason + ')') : 'off (no model is asked)')));
  const s = r.sources || {};
  if (s.mutants) lines.push(st.grey('  mutants.json: ' + s.mutants.mutants + ' mutants, ' + s.mutants.survived + ' survived'));
  if (s.gate) lines.push(st.grey('  gate.json: ' + s.gate.tests + ' test files, ' + s.gate.red + ' red (' + (s.gate.verdict || 'no verdict') + ')'));
  if (s.slow) lines.push(st.grey('  gate.json slow rows: ' + s.slow.slow + ' at ' + s.slow.slowMs + ' ms or more'));
  if (s.notes) lines.push(st.grey('  notes: ' + s.notes.open + ' OPEN lines in ' + s.notes.files + ' files (' + s.notes.strict + ' with the OPEN: grammar)'));
  if (s.imagine) lines.push(st.grey('  imagine: ' + (s.imagine.present ? (s.imagine.read ? s.imagine.proposed + ' proposed, ' + s.imagine.patches + ' as patches, by ' + s.imagine.how : 'unread: ' + s.imagine.reason) : 'mind/imagine.mjs absent')));
  if (s.census) lines.push(st.grey('  census: ' + (s.census.read ? (s.census.deadEdges ?? 0) + ' dead edges of ' + (s.census.edges ?? '?') + ' in ' + (s.census.seed || '?') + (s.census.deadCells != null ? ', ' + s.census.deadCells + ' dead cells (many-file, not proposed)' : '') + (s.census.pinned ? ', pinned' : '') + (s.census.reason ? ' (' + s.census.reason + ')' : '') : s.census.reason)));
  const by = r.bySource || {};
  if (s.boards) lines.push(st.grey('  boards: ' + s.boards.items + ' undone board items from ' + s.boards.where + ' (' + s.boards.withTrial + ' with a trial, ' + s.boards.needsModel + ' need the model); brief operator ' + (s.boards.brief && s.boards.brief.landed ? s.boards.brief.operator + '() landed' : 'NOT landed: ' + ((s.boards.brief && s.boards.brief.reason) || BRIEF_NOT_LANDED)) + (s.boards.reason ? ' (' + s.boards.reason + ')' : '')));
  for (const name of [...SOURCE_ORDER, BOARDS_SOURCE, 'given']) {
    const t = by[name];
    if (!t) continue;
    const per = t.modelMs.length ? t.modelMs.join(', ') + ' ms' : '-';
    lines.push('  ' + st.bold(name.padEnd(8)) + st.grey(' candidates ') + t.candidates + st.grey('  proposed ') + t.proposed + st.grey('  kept ') + t.kept
      + st.grey('  reverted ') + t.reverted + st.grey('  refused ') + t.refused + st.grey('  would apply ') + t.wouldApply
      + st.grey('  model: calls ') + t.modelCalls + st.grey(' proposed ') + t.modelProposed + st.grey(' kept ') + t.modelKept + st.grey('  ms per patch ') + per);
  }
  if (r.baseline) lines.push(st.grey('  baseline gate: exit ' + r.baseline.exit + ' ' + (r.baseline.summary || '')));
  for (const d of r.decisions) {
    const tag = d.decision === 'kept' ? st.green('KEPT') : d.decision === 'reverted' ? st.yellow('REVERTED') : d.decision === 'would-apply' ? st.green('WOULD APPLY')
      : d.decision === 'revert-failed' ? st.red('REVERT FAILED') : String(d.decision).toUpperCase();
    let line = '  ' + tag + ' ' + (d.key || '-') + (d.file ? st.grey(' -> ' + d.file) : '') + (d.author ? st.grey(' by ' + d.author) : '');
    if (d.gate && d.gate.verdict) line += st.grey('  gate ') + d.gate.verdict + st.grey(' exit ' + d.gate.exit);
    if (d.hashBefore) line += st.grey('  hash ' + short(d.hashBefore) + ' -> ' + short(d.hashAfter) + (d.hashRestored ? ' -> restored ' + short(d.hashRestored) : ''));
    if (d.model && d.model.called !== false) line += st.grey('  model ' + d.model.ms + ' ms');
    lines.push(line);
    if (d.reason) lines.push(st.grey('      ' + String(d.reason).slice(0, 160)));
  }
  if (!r.decisions.length) lines.push(st.grey('  (no candidate: nothing to do)'));
  if (!r.ok) lines.push(st.red('  stopped: ') + r.reason);
  if (r.ledgerFile && r.decisions.length) lines.push(st.grey('  ledger ' + r.ledgerFile));
  if (r.authoredFile) lines.push(st.grey('  authored ' + r.authoredFile + ' (+' + r.authoredLines + ')'));
  return lines.join('\n');
}

// ================================================================ THE SOAK (Board 14)
export const GAPS_SOURCE = 'gaps';
export const ALL_SOURCES = Object.freeze([...SOURCE_ORDER, GAPS_SOURCE]);
export const STOP_REL = 'state/self/STOP';
export const BENCH_FLAGS_REL = 'state/bench-flags';
export const GAPS_REL = 'state/self/gaps.jsonl';
export const SOAK_MODEL_CALLS_PER_HOUR = 12;
export const SOAK_TRIAL_MINUTES = 10;
export const SOAK_TRIALS_PER_ROUND = 6;
export const SOAK_MAX_COPIES = 2;
export const SOAK_CALL_WALL_MS = 240_000;
export const SOAK_IDLE_STEP_MS = 30_000;
export const SOAK_HEAP_MB = 2048;
export const LEDGER_MAX_AGE_MS = 24 * 3_600_000;
export const BOARD10_MIN_MS = 10 * 60_000;
export const GATE_AFTER_MIN_MINUTES = 10;
export const AUTHOR_FILES_MAX = 2;
export const AUTHOR_CHARS_MAX = 24_000;
/** A tree copy made by improve, prune, verifyPatch or verifyPreserve: the prefix and mkdtemp's six characters. */
export const COPY_RE = /^brain-(?:operators|prune|selfcode|autopilot)-[A-Za-z0-9]{6}$/;
const GAP_OPERATOR_ORDER = Object.freeze(['recombine', 'knob-tune', 'strategy-swap', 'author']);
const rnd = (x, p = 6) => (typeof x === 'number' && Number.isFinite(x) ? Number(x.toPrecision(p)) : null);
const meanOf = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export const stopPath = (root = ROOT) => path.join(root, ...STOP_REL.split('/'));
/** The switch: while state/self/STOP exists no soak starts, and a running one ends between rounds. */
export const isStopped = (root = ROOT) => existsSync(stopPath(root));
export const soakFile = (root, runId) => path.join(root, 'state', 'self', 'soak-' + runId + '.json');

/**
 * A bench flag (state/bench-flags/<pid>.json, daemon/run.mjs raiseBenchFlag) raised by a live
 * process that is not this one or its parent. A dead pid's flag is stale and is removed, as the
 * daemon's own reader does. Null when no bench is running.
 */
export function liveBenchFlag({ root = ROOT, dir = null, selfPids = null } = {}) {
  const d = dir || path.join(root, ...BENCH_FLAGS_REL.split('/'));
  const mine = Array.isArray(selfPids) ? selfPids : [process.pid, process.ppid];
  let names;
  try { names = readdirSync(d); } catch { return null; }
  for (const n of names.sort()) {
    if (!n.endsWith('.json')) continue;
    let j;
    try { j = JSON.parse(readFileSync(path.join(d, n), 'utf8')); } catch { continue; }
    const pid = Number(j && j.pid);
    if (!Number.isInteger(pid) || pid <= 0 || mine.includes(pid)) continue;
    if (!pidAlive(pid)) { try { rmSync(path.join(d, n), { force: true }); } catch { /* another reader swept it */ } continue; }
    return { pid, command: j.command || null, at: j.at || null, file: path.join(d, n) };
  }
  return null;
}

/** Distance to the bar in units of the bar (raw when the bar is 0), and that over the trial minutes. */
export function gapScore(g) {
  const minutes = Math.max(0.1, Number(g && g.trial && g.trial.minutes) || 1);
  if (!g || g.measured === null || g.measured === undefined || g.bar === null || g.bar === undefined) return { rel: null, score: 0, minutes };
  const m = Number(g.measured), b = Number(g.bar);
  if (!Number.isFinite(m) || !Number.isFinite(b)) return { rel: null, score: 0, minutes };
  const rel = b !== 0 ? Math.abs(m - b) / Math.abs(b) : Math.abs(m - b);
  return { rel: rnd(rel), score: rnd(rel / minutes), minutes };
}

/** The Board 14 modules, imported when a soak starts (improve.mjs imports this file). */
export async function loadSoakModules() {
  const out = { missing: [] };
  for (const [k, f] of [['improve', './improve.mjs'], ['operators', './operators.mjs'], ['gaps', './gaps.mjs'], ['prune', './prune.mjs']]) {
    try { out[k] = await import(new URL(f, import.meta.url).href); } catch (e) { out[k] = null; out.missing.push('self/' + f.slice(2) + ' (' + firstLine(e) + ')'); }
  }
  return out;
}

/** For the author: at most AUTHOR_FILES_MAX files, knob files first, then the smallest, under AUTHOR_CHARS_MAX. */
export function narrowForAuthor(g, root, ops) {
  const withKnobs = new Set();
  try { for (const k of ops.gapKnobs(g, root)) withKnobs.add(k.file); } catch { /* no knobs */ }
  const size = (f) => { try { return statSync(path.join(root, f)).size; } catch { return Number.MAX_SAFE_INTEGER; } };
  const ranked = [...g.files].sort((a, b) => (Number(withKnobs.has(b)) - Number(withKnobs.has(a))) || size(a) - size(b) || (a < b ? -1 : a > b ? 1 : 0));
  const out = [];
  let chars = 0;
  for (const f of ranked) {
    const s = Math.min(size(f), 12_000); // buildGapRequest shows at most 12000 characters of a file
    if (out.length && (out.length >= AUTHOR_FILES_MAX || chars + s > AUTHOR_CHARS_MAX)) break;
    out.push(f);
    chars += s;
  }
  return { ...g, files: out, narrowed: { from: g.files.length, to: out.length, chars } };
}

/**
 * What the soak does with one gap: the rounds (one per operator that applies), or the refusal
 * that holds before any copy. Operators in GAP_OPERATOR_ORDER; the trial's own ruler (trial.bench)
 * is never a patch target.
 */
export function planGap(g, { root = ROOT, ops = null, trialMinutes = SOAK_TRIAL_MINUTES, authorOn = false } = {}) {
  const id = String(g && g.id);
  const t = (g && g.trial) || {};
  const key = (op) => 'gaps:' + id + ':' + op;
  const no = (wall, reason) => ({ id, gap: g, refused: { key: key('none'), wall, reason }, rounds: [] });
  if (g.kind === 'dead share') return { id, gap: g, rounds: [{ key: key('prune'), operator: 'prune', gap: g }] };
  if (t.needsModel) return no('trial', 'the gap\'s trial needs the model; the soak runs model-free trials only (the model may author a patch, never grade one)');
  const minutes = Number(t.minutes);
  if (Number.isFinite(minutes) && minutes > trialMinutes) return no('budget', 'the trial is estimated at ' + minutes + ' minutes, over --trial-minutes ' + trialMinutes);
  if (!ops) return no('patch', 'self/operators.mjs is not landed yet');
  const al = ops.allowedFiles(g, root);
  const ruler = [t.bench].filter((x) => typeof x === 'string' && x).map((x) => x.replaceAll('\\', '/'));
  const files = al.files.filter((f) => !ruler.includes(f));
  if (!files.length) {
    const named = Array.isArray(g.files) ? g.files.length : 0;
    const why = !named ? 'the gap names no file' : al.refused.length ? al.refused.map((r) => r.reason).join('; ') : 'its only file is the trial\'s own ruler ' + ruler.join(', ');
    return no('ceiling', 'no file of the gap passes the ceiling: ' + why);
  }
  const gg = { ...g, files };
  const found = [];
  if (ops.isGridGap(gg)) found.push('recombine');
  let knobs = [];
  try { knobs = ops.gapKnobs(gg, root); } catch { knobs = []; }
  if (knobs.length) found.push('knob-tune');
  if (files.some((f) => { try { return !!ops.readStrategies(readFileSync(path.join(root, f), 'utf8')); } catch { return false; } })) found.push('strategy-swap');
  if (authorOn) found.push('author');
  if (!found.length) return no('patch', 'no operator applies to ' + files.join(', ') + ': no knob, no STRATEGIES selector, not a grid gap, and the author is off in this run');
  const rounds = GAP_OPERATOR_ORDER.filter((op) => found.includes(op)).map((op) => ({ key: key(op), operator: op, gap: op === 'author' ? narrowForAuthor(gg, root, ops) : gg }));
  return { id, gap: g, knobs: knobs.length, rounds };
}

/** Every gap with a trial, largest distance over trial minutes first (ties by id), each planned. */
export function gapQueue(lines, opts = {}) {
  // a board item (Board 15) belongs to the boards source and its brief, never to a bounded gap trial
  const scored = (Array.isArray(lines) ? lines : []).filter((g) => g && g.trial && g.kind !== BOARD_ITEM_KIND).map((g) => ({ g, ...gapScore(g) }));
  scored.sort((a, b) => b.score - a.score || (String(a.g.id) < String(b.g.id) ? -1 : String(a.g.id) > String(b.g.id) ? 1 : 0));
  return scored.map(({ g, rel, score }) => {
    if (rel === 0) return { id: String(g.id), gap: g, refused: { key: 'gaps:' + g.id + ':none', wall: 'bar', reason: 'the ledger reads ' + g.measured + ' against the bar ' + g.bar + ': at the bar, nothing to move' }, rounds: [], rel, score };
    return { ...planGap(g, opts), rel, score };
  });
}

/** The wall a refusal names, from improve's or prune's reason. */
export function wallOfReason(reason) {
  const r = String(reason || '');
  if (/ceiling|outside the gap's files|no file of the gap/i.test(r)) return 'ceiling';
  if (/budget|model call/i.test(r)) return 'budget';
  if (/model cell|the author|no usable diff/i.test(r)) return 'author';
  if (/gate on the copy/i.test(r)) return 'gate';
  if (/touched test/i.test(r)) return 'tests';
  if (/printed no metric|trial command|needs the model/i.test(r)) return 'trial';
  if (/census/i.test(r)) return 'census';
  return 'evidence';
}

function listCopies(dir) {
  try { return readdirSync(dir).filter((n) => COPY_RE.test(n)).map((n) => path.join(dir, n)); } catch { return []; }
}
function dirMb(dir) {
  let bytes = 0;
  const walk = (d) => { let es; try { es = readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of es) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { try { bytes += statSync(p).size; } catch { /* gone */ } } } };
  walk(dir);
  return Math.round(bytes / 1048576 * 10) / 10;
}
function readJsonlFile(file) {
  if (!existsSync(file)) return [];
  const out = [];
  for (const l of readFileSync(file, 'utf8').split('\n')) { if (!l.trim()) continue; try { out.push(JSON.parse(l)); } catch { /* a torn line */ } }
  return out;
}
const hashRel = (root, files) => Object.fromEntries(files.map((f) => { const p = path.join(root, f); return [f, existsSync(p) ? hashBytes(readFileSync(p)) : null]; }));

/** The newest soak file (latest) or the one named, parsed. */
export function findSoak(root, which = 'latest') {
  const dir = path.join(root, 'state', 'self');
  let names;
  try { names = readdirSync(dir).filter((n) => /^soak-.+\.json$/.test(n)); } catch { names = []; }
  if (!names.length) return { ok: false, reason: 'no soak file under state/self to resume' };
  let name;
  if (which === 'latest') name = names.map((n) => ({ n, t: statSync(path.join(dir, n)).mtimeMs })).sort((a, b) => b.t - a.t)[0].n;
  else name = names.find((n) => n === 'soak-' + which + '.json' || n === which || n === which + '.json');
  if (!name) return { ok: false, reason: 'no soak file named ' + which + ' under state/self' };
  const r = readJsonFile(path.join(dir, name));
  if (!r.ok || !r.j || !r.j.runId) return { ok: false, reason: name + ' does not parse as a soak file' + (r.ok ? '' : ': ' + r.reason) };
  return { ok: true, file: path.join(dir, name), state: r.j };
}

/**
 * Write a (possibly multi-file) patch to the real tree behind a snapshot, run the gate, keep or
 * revert byte for byte. Every file must be on `files` and pass the ceiling, and its bytes must be
 * the bytes hashed before the evidence ran (`pre`). The first write of the soak is preceded by
 * one baseline gate (gates.baseline); a keep makes the new gate the baseline.
 */
export function applyToTree({ root = ROOT, patch, files = [], pre = {}, key, runId, author, gateCmd = null, gateTimeoutMs = GATE_TIMEOUT_MS, gates, splitSections, gateFn = runGate, meta = {} } = {}) {
  const refuse = (wall, reason) => ({ decision: 'refused', wall, reason, written: false, files: [] });
  const sections = typeof splitSections === 'function' ? splitSections(patch) : [];
  if (!sections.length) return refuse('patch', 'the kept patch has no file section');
  const items = [];
  for (const s of sections) {
    const a = allowTarget(s.file, null, { root });
    if (!a.ok) return refuse('ceiling', a.reason);
    if (!files.includes(a.rel)) return refuse('ceiling', 'the patch writes ' + a.rel + ', outside the gap\'s files (' + files.join(', ') + ')');
    const bytes = readFileSync(a.abs);
    const text = bytes.toString('utf8');
    if (!Buffer.from(text, 'utf8').equals(bytes)) return refuse('bytes', a.rel + ' is not clean UTF-8, so a patch through text would change bytes it does not name');
    const hashBefore = hashBytes(bytes);
    if (a.rel in pre && pre[a.rel] !== hashBefore) return refuse('moved', a.rel + ' changed while the evidence ran (' + short(pre[a.rel]) + ' -> ' + short(hashBefore) + ')');
    const p = applyUnifiedPatch(text, s.patch);
    if (!p.ok) return refuse('bytes', a.rel + ': the patch does not apply to the real file: ' + p.reason);
    if (p.text === text) return refuse('bytes', a.rel + ': the patch changes nothing on the real file');
    const newBytes = Buffer.from(p.text, 'utf8');
    items.push({ rel: a.rel, abs: a.abs, bytes, newBytes, hashBefore, hashAfter: hashBytes(newBytes) });
  }
  if (!gates.baseline) gates.baseline = gateFn({ root, cmd: gateCmd, timeoutMs: gateTimeoutMs });
  const stateDir = path.join(root, 'state', 'self-code');
  const id = snapshotId(stateDir, new Date(), key, items.map((i) => i.hashBefore).join('|'));
  const snap = path.join(stateDir, id);
  mkdirSync(snap, { recursive: true });
  items.forEach((it, i) => writeFileSync(path.join(snap, 'before-' + i + '.bin'), it.bytes));
  writeFileSync(path.join(snap, 'patch.diff'), String(patch));
  writeFileSync(path.join(snap, 'meta.json'), JSON.stringify({
    id, runId, key, source: GAPS_SOURCE, author, ...meta, at: new Date().toISOString(),
    files: items.map((it, i) => ({ file: it.rel, before: 'before-' + i + '.bin', hashBefore: it.hashBefore, hashAfter: it.hashAfter, bytesBefore: it.bytes.length, bytesAfter: it.newBytes.length })),
  }, null, 2));
  const gj = path.join(root, 'bench', 'verdicts', 'gate.json');
  const gateJsonBefore = existsSync(gj) ? readFileSync(gj) : null;
  for (const it of items) writeFileSync(it.abs, it.newBytes);
  const onDisk = items.every((it) => hashBytes(readFileSync(it.abs)) === it.hashAfter);
  const g = onDisk ? gateFn({ root, cmd: gateCmd, timeoutMs: gateTimeoutMs }) : null;
  gates.last = g || gates.last;
  const d = g ? gateDecision(gates.baseline, g) : { keep: false, gate: 'NOT-RUN', regressions: [], fixed: [], reason: 'the bytes on disk after the write are not the patched bytes' };
  const filesOut = items.map((it) => ({ file: it.rel, hashBefore: it.hashBefore, hashAfter: it.hashAfter }));
  const fields = { id, hashBefore: items[0].hashBefore, hashAfter: items[0].hashAfter, hashes: filesOut, gate: { ...gateSummary(g), verdict: d.gate, regressions: d.regressions, fixed: d.fixed }, baselineGate: gateSummary(gates.baseline) };
  if (d.keep) {
    writeOutcome(snap, { decision: 'kept', gate: d.gate });
    const before = gates.baseline;
    gates.baseline = g;
    return { decision: 'kept', reason: d.reason, written: true, files: filesOut, gate: d, gateBefore: before, gateAfter: g, fields };
  }
  for (const it of items.slice().reverse()) writeFileSync(it.abs, it.bytes);
  const restored = items.map((it) => { const back = readFileSync(it.abs); return { file: it.rel, hashRestored: hashBytes(back), ok: back.equals(it.bytes) }; });
  const ok = restored.every((r) => r.ok);
  let gateJsonRestored = false;
  if (gateJsonBefore) { writeFileSync(gj, gateJsonBefore); gateJsonRestored = readFileSync(gj).equals(gateJsonBefore); }
  else if (existsSync(gj)) { rmSync(gj, { force: true }); gateJsonRestored = !existsSync(gj); }
  writeOutcome(snap, { decision: ok ? 'reverted' : 'revert-failed', gate: d.gate, restored, gateJsonRestored });
  return { decision: ok ? 'reverted' : 'revert-failed', wall: 'gate', reason: d.reason, written: true, files: filesOut.map((f, i) => ({ ...f, hashRestored: restored[i].hashRestored })), fields: { ...fields, hashRestored: restored[0].hashRestored, gateJsonRestored } };
}

/** The options of a soak, from the CLI (a resumed soak keeps the ones it started with). */
export function soakConfig(o = {}) {
  const num = (v, d) => { const n = Number(v); return v !== undefined && v !== null && v !== true && Number.isFinite(n) && n > 0 ? n : d; };
  const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const on = (v) => v === true || /^(on|true|1|yes)$/i.test(String(v ?? ''));
  const dry = o.dry === true || o.dry === 'true';
  const soakMinutes = Number(o.soak);
  const sources = Array.isArray(o.sources) ? o.sources : str(o.sources) ? str(o.sources).split(',').map((s) => s.trim()).filter(Boolean) : null;
  const authorOn = o['no-author'] ? false : o.author === undefined ? !dry : !/^(off|false|0|no)$/i.test(String(o.author));
  return {
    soakMinutes, dry, sources, authorOn, gateAfter: str(o['gate-after']) || 'auto',
    modelCalls: num(o['model-calls'], Math.max(1, Math.ceil(SOAK_MODEL_CALLS_PER_HOUR * (Number.isFinite(soakMinutes) && soakMinutes > 0 ? soakMinutes : 60) / 60))),
    trialMinutes: num(o['trial-minutes'], SOAK_TRIAL_MINUTES),
    gateMinutes: (() => { const n = Number(o['gate-minutes']); return o['gate-minutes'] !== undefined && o['gate-minutes'] !== true && Number.isFinite(n) && n >= 0 ? n : 8; })(),
    callWallMs: num(o['call-wall-ms'], SOAK_CALL_WALL_MS),
    gateCmd: str(o['gate-cmd']), copyGateCmd: str(o['copy-gate-cmd']),
    gateTimeoutMs: num(o['gate-timeout'], GATE_TIMEOUT_MS),
    allowOrganism: on(o['allow-organism']),
    model: str(o.model), base: str(o['author-base']),
    board10MinMs: num(o['board10-min-ms'], BOARD10_MIN_MS),
    idleStepMs: num(o['idle-step-ms'], SOAK_IDLE_STEP_MS),
  };
}

/**
 * THE SOAK. Unattended for cfg.soakMinutes of wall: the gap queue first, round by round, then
 * the Board 10 sources once, then idle (re-reading the ledger) until the minute. A round starts
 * only when its trials and its gate on the copy fit the wall left. Test seams: improveFn, pruneFn,
 * censusFor, refreshLedger, authorFn, board10Fn, board10Author, gateFn, rateFn, modules, tmpBase,
 * sleep, log, selfPids.
 */
export async function runSoak(o = {}) {
  const root = typeof o.root === 'string' ? path.resolve(o.root) : ROOT;
  const say = typeof o.log === 'function' ? o.log : (l) => process.stderr.write(l + '\n');
  const sleep = typeof o.sleep === 'function' ? o.sleep : (ms) => new Promise((res) => setTimeout(res, ms));
  const out = { kind: AUTO_KIND, soak: true, root, ok: true, exitCode: 0, reason: null };
  // 0. the switch and the bench flag, before anything is locked, read or copied
  if (isStopped(root)) { say('stopped by ' + STOP_REL); return { ...out, stopped: true, reason: 'stopped by ' + STOP_REL }; }
  const flag0 = liveBenchFlag({ root, selfPids: o.selfPids });
  if (flag0) {
    const reason = 'refused: a bench is running (pid ' + flag0.pid + (flag0.command ? ', ' + String(flag0.command).slice(0, 120) : '') + '); a soak writes the tree a bench measures';
    say(reason);
    return { ...out, refused: 'bench', reason, flag: flag0 };
  }
  // 1. a new soak, or the one --resume names
  let st;
  const resuming = o.resume !== undefined && o.resume !== false && o.resume !== null;
  if (resuming) {
    const f = findSoak(root, o.resume === true || o.resume === 'true' ? 'latest' : String(o.resume));
    if (!f.ok) { say('resume refused: ' + f.reason); return { ...out, ok: false, exitCode: 1, reason: f.reason }; }
    st = f.state;
    if (st.status === 'done' || st.status === 'stopped') { const reason = 'the soak ' + st.runId + ' is ' + st.status + ': nothing to resume'; say(reason); return { ...out, ok: false, exitCode: 1, reason }; }
    if (st.pid && st.pid !== process.pid && pidAlive(st.pid)) { const reason = 'the soak ' + st.runId + ' is still running (pid ' + st.pid + ')'; say(reason); return { ...out, ok: false, exitCode: 1, reason }; }
    st.resumes = [...(st.resumes || []), { at: new Date().toISOString(), pid: process.pid, elapsedMs: st.elapsedMs || 0 }];
    for (const k of ['done', 'decisions', 'modelCalls', 'trials', 'kept', 'refreshes', 'deferred']) if (!Array.isArray(st[k])) st[k] = [];
    st.copies = { made: 0, deleted: 0, leftFound: 0, swept: 0, ...(st.copies || {}) };
    st.peaks = { trialMb: 0, gateCopyMb: 0, ...(st.peaks || {}) };
    st.idleMs = st.idleMs || 0;
    st.status = 'running';
  } else {
    const cfg0 = soakConfig(o);
    if (!Number.isFinite(cfg0.soakMinutes) || cfg0.soakMinutes <= 0) { const reason = '--soak needs a number of minutes above 0'; say(reason); return { ...out, ok: false, exitCode: 1, reason }; }
    const started = new Date();
    st = {
      runId: stamp(started), startedAt: started.toISOString(), cfg: cfg0, status: 'running', elapsedMs: 0, pid: process.pid,
      done: [], decisions: [], modelCalls: [], trials: [], kept: [], refreshes: [], deferred: [], idleMs: 0, board10: null, resumes: [],
      copies: { made: 0, deleted: 0, leftFound: 0, swept: 0 }, peaks: { trialMb: 0, gateCopyMb: 0 },
    };
  }
  const cfg = st.cfg;
  const soakMs = cfg.soakMinutes * 60_000;
  const t0 = Date.now();
  const priorMs = st.elapsedMs || 0;
  const deadline = t0 + Math.max(0, soakMs - priorMs);
  const elapsed = () => priorMs + (Date.now() - t0);
  const sfile = soakFile(root, st.runId);
  mkdirSync(path.dirname(sfile), { recursive: true });
  const save = () => { st.elapsedMs = elapsed(); st.pid = process.pid; st.updatedAt = new Date().toISOString(); writeFileSync(sfile + '.tmp', JSON.stringify(st, null, 1)); renameSync(sfile + '.tmp', sfile); };
  // 2. the lock, for the whole wall (the Board 10 pass runs under it with lock:false)
  const lock = acquireLock(path.join(root, 'state', 'self-code'));
  if (!lock.ok) { say('refused: ' + lock.reason); return { ...out, refused: 'lock', reason: lock.reason }; }
  save();
  const tmpRoot = path.join(o.tmpBase || tmpdir(), 'brain-soak-' + st.runId);
  const K = o.modules || await loadSoakModules();
  if (!Array.isArray(K.missing)) K.missing = [];
  const improveFn = o.improveFn || (K.improve ? K.improve.improve : null);
  const pruneFn = o.pruneFn || (K.prune ? K.prune.pruneSeed : null);
  const censusFor = o.censusFor || (K.prune ? K.prune.censusesFor : null);
  const splitSections = K.improve ? K.improve.splitSections : null;
  const gateFn = o.gateFn || runGate;
  const refreshLedger = o.refreshLedger || (K.gaps ? async ({ root: r }) => { const b = await K.gaps.buildLedger({ root: r }); const file = K.gaps.writeLedger(b.lines, { root: r }); return { lines: b.lines, file }; } : null);
  const readLines = () => (K.gaps ? K.gaps.readLedger(root).lines : readJsonlFile(path.join(root, GAPS_REL)));
  const wantGaps = !cfg.sources || cfg.sources.includes(GAPS_SOURCE);
  const b10Sources = (cfg.sources || SOURCE_ORDER).filter((s) => SOURCE_ORDER.includes(s));
  const planOpts = { root, ops: K.operators, trialMinutes: cfg.trialMinutes, authorOn: cfg.authorOn };
  const modelLedger = { max: cfg.modelCalls, used: st.modelCalls.length, calls: [] };
  const gates = { baseline: null, last: null };
  const gateMs = (Number.isFinite(cfg.gateMinutes) ? cfg.gateMinutes : 8) * 60_000;
  const ledgerDir = path.join(root, 'bench', 'verdicts', 'autopilot');
  const record = (d) => {
    const line = { kind: AUTO_KIND, runId: st.runId, at: new Date().toISOString(), soak: true, ...d };
    if (!cfg.dry) { mkdirSync(ledgerDir, { recursive: true }); appendFileSync(path.join(ledgerDir, line.at.slice(0, 10) + '.jsonl'), JSON.stringify(line) + '\n'); }
    return line;
  };
  const decide = (d) => {
    const line = record(d);
    st.decisions.push({
      key: d.key ?? null, source: d.source ?? null, gap: d.gap ?? null, operator: d.operator ?? null, decision: d.decision, wall: d.wall ?? null,
      reason: d.reason ? String(d.reason).slice(0, 400) : null, before: d.before ?? null, after: d.after ?? null, noise: d.noise ?? null,
      toward: d.toward ?? null, bar: d.bar ?? null, unit: d.unit ?? null, seconds: d.seconds ?? null, ran: !!d.ran, author: d.author ?? null, at: line.at,
    });
    if (d.key && !st.done.includes(d.key)) st.done.push(d.key);
    save();
    const ba = d.before !== undefined && d.before !== null ? '  before ' + d.before + ' after ' + d.after + (d.noise !== null && d.noise !== undefined ? ' noise ' + d.noise : '') : '';
    say('  ' + String(d.decision).toUpperCase() + ' ' + (d.key || '-') + (d.wall ? ' [' + d.wall + ']' : '') + ba + (d.seconds ? '  ' + d.seconds + ' s' : ''));
    if (d.reason) say('      ' + String(d.reason).slice(0, 300));
    return line;
  };
  const sweep = (why) => {
    const left = listCopies(tmpRoot);
    for (const c of left) { try { rmSync(c, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* reported below */ } }
    const still = listCopies(tmpRoot);
    if (left.length) say('  copies: ' + left.length + ' found ' + why + ', ' + (left.length - still.length) + ' removed' + (still.length ? ', ' + still.length + ' STILL ON DISK' : ''));
    return { found: left.length, removed: left.length - still.length, still: still.length };
  };
  const prevEnv = { TEMP: process.env.TEMP, TMP: process.env.TMP };
  const pointTemp = () => { process.env.TEMP = tmpRoot; process.env.TMP = tmpRoot; };
  const restoreTemp = () => { for (const k of ['TEMP', 'TMP']) { if (prevEnv[k] === undefined) delete process.env[k]; else process.env[k] = prevEnv[k]; } };
  let stopped = false, failed = null;
  say('SOAK ' + st.runId + (resuming ? ' RESUMED at ' + Math.round(priorMs / 1000) + ' s of ' + Math.round(soakMs / 1000) + ' s' : ' started') + ': ' + cfg.soakMinutes + ' min on ' + root
    + (cfg.dry ? ' (DRY: nothing written to the tree)' : '') + '; author ' + (cfg.authorOn ? 'on' : 'off') + ', model calls at most ' + cfg.modelCalls + ', trial minutes at most ' + cfg.trialMinutes
    + ', sources ' + (cfg.sources ? cfg.sources.join(',') : ALL_SOURCES.join(',')) + (K.missing.length ? '; not landed yet: ' + K.missing.join('; ') : ''));

  try {
    for (const r of recoverOrphans({ root, dry: cfg.dry })) record({ candidate: false, id: r.id, key: r.key ?? null, file: r.file ?? null, decision: r.decision, reason: r.reason });
    const s0 = sweep('from a segment of this soak that was killed');
    st.copies.swept += s0.removed;
    mkdirSync(tmpRoot, { recursive: true });

    // 3. the ledger: rebuilt when it is older than 24 h
    let lines = [];
    if (wantGaps) {
      const lf = path.join(root, GAPS_REL);
      const ageMs = existsSync(lf) ? Date.now() - statSync(lf).mtimeMs : null;
      if ((ageMs === null || ageMs > LEDGER_MAX_AGE_MS) && refreshLedger && !cfg.dry) {
        say('ledger ' + (ageMs === null ? 'absent' : (ageMs / 3_600_000).toFixed(1) + ' h old') + ': rebuilt by self/gaps.mjs');
        const t = Date.now();
        try { const r = await refreshLedger({ root }); st.refreshes.push({ at: new Date().toISOString(), why: 'stale', lines: (r.lines || []).length, ms: Date.now() - t }); } catch (e) { say('  the rebuild failed: ' + firstLine(e)); }
      }
      lines = readLines();
    }
    let plans = wantGaps ? gapQueue(lines, planOpts) : [];
    if (wantGaps) say('gaps: ' + lines.length + ' ledger lines, ' + lines.filter((g) => g && g.trial).length + ' with a trial; ' + plans.reduce((s, p) => s + p.rounds.length, 0) + ' rounds planned, ' + plans.filter((p) => p.refused).length + ' gaps refused before any copy');
    const pending = () => plans.flatMap((p) => (p.refused ? [{ plan: p, key: p.refused.key, refusal: p.refused }] : p.rounds.map((r) => ({ plan: p, key: r.key, round: r })))).filter((x) => !st.done.includes(x.key));
    const baselineReused = (g) => {
      if (!K.improve || !K.operators || !g.trial || !g.trial.command || typeof K.improve.findBaseline !== 'function') return false;
      try { return !!K.improve.findBaseline(K.improve.stateDirOf(root), { command: g.trial.command, filesHash: K.improve.hashFiles(root, K.operators.allowedFiles(g, root).files).all }); } catch { return false; }
    };
    // runs of one trial: the baseline (2, or 0 when today's is reused), n trials and one confirm, then the gate on the copy
    const fits = (round, remaining) => {
      if (round.operator === 'prune') return { ok: true, trials: 0, need: 0 };
      const g = round.gap;
      const m = Math.max(0.01, Number(g.trial && g.trial.minutes) || 1) * 60_000;
      const B = baselineReused(g) ? 0 : 2;
      const need = (B + 2) * m + gateMs;
      if (remaining < need) return { ok: false, reason: 'needs ' + rnd(need / 60_000, 3) + ' min (' + (B + 2) + ' trial runs of ~' + rnd(m / 60_000, 3) + ' min and a gate on the copy of ~' + rnd(gateMs / 60_000, 3) + ' min), ' + rnd(remaining / 60_000, 3) + ' min left' };
      return { ok: true, reused: B === 0, trials: Math.max(1, Math.min(SOAK_TRIALS_PER_ROUND, Math.floor((remaining - gateMs) / m) - B - 1)), need };
    };
    const baseOf = (g, round) => ({
      candidate: true, key: round ? round.key : 'gaps:' + g.id + ':none', source: GAPS_SOURCE, where: GAPS_REL, gap: g.id, gapKind: g.kind ?? null,
      operator: round ? round.operator : null, evidence: 'improve', origin: 'self', files: (round ? round.gap.files : g.files) || [],
      file: ((round ? round.gap.files : g.files) || [])[0] || null, test: null, bar: g.bar ?? null, unit: g.unit ?? null, measured: g.measured ?? null,
      why: g.why ? String(g.why).slice(0, 300) : null,
    });

    const refreshAfterKeep = async (g) => {
      if (!refreshLedger) { say('  the ledger was not rebuilt: self/gaps.mjs is not landed yet'); return null; }
      const t = Date.now();
      let r;
      try { r = await refreshLedger({ root }); } catch (e) { say('  the ledger rebuild failed: ' + firstLine(e)); record({ candidate: false, event: 'ledger-refresh', source: GAPS_SOURCE, gap: g.id, ok: false, reason: firstLine(e) }); return null; }
      const nl = r.lines || [];
      const still = nl.find((l) => String(l.id) === String(g.id));
      const ev = { candidate: false, event: 'ledger-refresh', source: GAPS_SOURCE, gap: g.id, closed: !still, measuredBefore: g.measured ?? null, measuredAfter: still ? still.measured ?? null : null, bar: g.bar ?? null, lines: nl.length, ms: Date.now() - t };
      record(ev);
      st.refreshes.push({ at: new Date().toISOString(), why: 'kept', ...ev });
      save();
      say(ev.closed ? '  gap ' + g.id + ' CLOSED: it left the ledger (' + nl.length + ' lines now)' : '  gap ' + g.id + ' still open after the rebuild: the ledger reads ' + ev.measuredAfter + ' against the bar ' + g.bar + ' (it read ' + g.measured + ' before)');
      return nl;
    };

    const keepLine = async (g, round, res, a, line) => {
      const author = 'organism (' + round.operator + ')';
      say('  KEPT ' + round.key + ' by ' + author + ': before ' + res.before + ' after ' + res.after + ' ' + (g.unit || '') + ' (noise ' + res.noise + ', bar ' + g.bar + ')');
      const auth = {
        at: line.at, runId: st.runId, key: round.key, source: GAPS_SOURCE, where: GAPS_REL, kind: g.kind ?? null, from: 'gaps:' + g.id, gap: g.id,
        operator: round.operator, files: a.files.map((x) => x.file), author, organism: true,
        before: res.before ?? null, after: res.after ?? null, noise: res.noise ?? null, toward: res.toward ?? null, bar: g.bar ?? null, unit: g.unit ?? null,
        hashBefore: a.files[0].hashBefore, hashAfter: a.files[0].hashAfter, hashes: a.files,
        gateHashBefore: gateHash(a.gateBefore), gateHashAfter: gateHash(a.gateAfter), gate: a.gate.gate,
        knob: res.knob ?? null, value: res.value ?? null, fromValue: res.from ?? null, model: res.modelName ?? null, improveRecord: line.improveRecord ?? null,
      };
      const f = appendAuthored(root, auth);
      say('  authored ' + relOf(root, f) + ': ' + JSON.stringify(auth));
      st.kept.push({ key: round.key, gap: g.id, operator: round.operator, before: res.before ?? null, after: res.after ?? null, noise: res.noise ?? null, toward: res.toward ?? null, bar: g.bar ?? null, unit: g.unit ?? null, authored: relOf(root, f), author });
      save();
      return refreshAfterKeep(g);
    };

    const pruneRound = async (round) => {
      const g = round.gap;
      const b = baseOf(g, round);
      const seed = (g.trial && typeof g.trial.seed === 'string' && g.trial.seed) || String(g.id).replace(/^dead:/, '');
      const seedRel = seed.startsWith('organism/') ? seed : 'organism/' + seed;
      if (!pruneFn) return decide({ ...b, decision: 'refused', wall: 'patch', reason: 'self/prune.mjs is not landed yet' });
      let census = null;
      try { census = censusFor ? censusFor(root, seedRel) : null; } catch { census = null; }
      if (census && census.usable && census.usable.length && !cfg.allowOrganism) {
        return decide({ ...b, decision: 'refused', wall: 'ceiling', before: g.measured ?? null, reason: 'the prune of ' + seedRel + ' re-points ' + seedRel + '/index.mjs and manifest.json at ' + seedRel + '-pruned: a write under organism/, outside this soak\'s ceiling, so self/prune.mjs was not run on a copy (--allow-organism on runs it)' });
      }
      const t = Date.now();
      let r;
      pointTemp();
      try { r = await pruneFn({ root, seed: seedRel, work: tmpRoot, log: (l) => say('    ' + l) }); } catch (e) { r = { decision: 'refused', wall: 'census', reason: 'self/prune.mjs threw: ' + firstLine(e) }; } finally { restoreTemp(); }
      r = r || { decision: 'refused', wall: 'census', reason: 'self/prune.mjs returned nothing' };
      const secs = rnd((Date.now() - t) / 1000, 4);
      if (r.cleanup) { st.copies.made++; if (r.cleanup.copyDeleted) st.copies.deleted++; }
      const sw = sweep('after the prune of ' + seedRel);
      st.copies.leftFound += sw.found;
      const common = { ...b, before: r.deadShareBefore ?? g.measured ?? null, after: r.deadShareAfter ?? null, noise: null, seconds: secs, ran: !!r.cleanup };
      if (r.decision !== 'would apply') return decide({ ...common, decision: 'refused', wall: r.wall || wallOfReason(r.reason), reason: r.reason || 'self/prune.mjs did not propose a prune' });
      if (!(r.prunedOnReal && r.prunedOnReal.sameHash)) return decide({ ...common, decision: 'refused', wall: 'patch', reason: seedRel + '-pruned is not on the real tree at the pruned hash; emitting a whole seed is a write this loop does not make' });
      if (cfg.dry) return decide({ ...common, decision: 'would-apply', reason: 'the prune holds on a copy (gate ' + (r.gate && r.gate.summary) + '); a live soak would re-point ' + seedRel });
      const filesOfPatch = splitSections ? splitSections(r.patch).map((s) => s.file) : [];
      const a = applyToTree({ root, patch: r.patch, files: filesOfPatch, pre: {}, key: round.key, runId: st.runId, author: 'organism (prune)', gateCmd: cfg.gateCmd, gateTimeoutMs: cfg.gateTimeoutMs, gates, splitSections, gateFn, meta: { gap: g.id, operator: 'prune' } });
      const line = decide({ ...common, ...(a.fields || {}), decision: a.decision, wall: a.wall ?? null, reason: a.reason, author: a.written ? 'organism (prune)' : null });
      if (a.decision === 'revert-failed') { failed = 'a revert did not restore ' + seedRel; return null; }
      if (a.decision === 'kept') return keepLine(g, round, { before: common.before, after: common.after, noise: null, toward: rnd((common.before ?? 0) - (common.after ?? 0)) }, a, line);
      return null;
    };

    const gapRound = async (round, fit) => {
      const g = round.gap, op = round.operator;
      const b = baseOf(g, round);
      if (op === 'prune') return pruneRound(round);
      if (op === 'author' && modelLedger.used >= modelLedger.max) return decide({ ...b, decision: 'refused', wall: 'budget', reason: 'the soak budget of ' + modelLedger.max + ' model call(s) is spent' });
      if (!improveFn || !K.operators) return decide({ ...b, decision: 'refused', wall: 'evidence', reason: 'self/improve.mjs or self/operators.mjs is not landed yet' });
      const s1 = sweep('before ' + round.key);
      st.copies.leftFound += s1.found;
      if (listCopies(tmpRoot).length >= SOAK_MAX_COPIES) return decide({ ...b, decision: 'refused', wall: 'budget', reason: SOAK_MAX_COPIES + ' copies are alive under ' + tmpRoot + ' and could not be removed' });
      const pre = hashRel(root, g.files);
      const callsBefore = modelLedger.calls.length;
      const budget = { ...K.operators.makeBudget({ trials: fit.trials, modelCalls: modelLedger.max, callWallMs: cfg.callWallMs, author: typeof o.authorFn === 'function' ? o.authorFn : null, model: cfg.model, base: cfg.base }), model: modelLedger };
      const m = Math.max(0.01, Number(g.trial && g.trial.minutes) || 1);
      say('ROUND ' + round.key + ': ' + (g.kind || 'gap') + ', measured ' + g.measured + ' against the bar ' + g.bar + ' ' + (g.unit || '') + ', ~' + m + ' min a trial, ' + fit.trials + ' trial(s)'
        + (fit.reused ? ', baseline reused from today' : ', two baseline runs') + (g.narrowed ? ', author files ' + g.files.join(', ') + ' (' + g.narrowed.to + ' of ' + g.narrowed.from + ')' : '') + ', ' + rnd((deadline - Date.now()) / 60_000, 3) + ' min left');
      const t = Date.now();
      let res;
      try {
        const args = { root, stateRoot: root, gap: g, operator: op, budget, trialWallMs: cfg.trialMinutes * 60_000, runId: st.runId, log: (l) => say('    ' + l), allowModelTrial: false, tmpRoot };
        if (cfg.copyGateCmd) args.gateCmd = cfg.copyGateCmd;
        res = await improveFn(args);
      } catch (e) { res = { kept: false, reason: 'improve threw: ' + firstLine(e), trials: [] }; }
      res = res || { kept: false, reason: 'improve returned nothing', trials: [] };
      const secs = rnd((Date.now() - t) / 1000, 4);
      for (const tr of res.trials || []) {
        if (!(Number(tr.seconds) > 0)) continue;
        const runs = tr.kind === 'baseline' && tr.before !== null && tr.before !== undefined && tr.after !== null && tr.after !== undefined ? 2 : 1;
        st.trials.push({ kind: tr.kind || 'trial', seconds: Number(tr.seconds), runs, peakRssMb: tr.peakRssMb ?? null, gap: g.id, operator: op });
        if (Number(tr.peakRssMb) > st.peaks.trialMb) st.peaks.trialMb = Number(tr.peakRssMb);
      }
      if (res.gate && Number(res.gate.peakRssMb) > st.peaks.gateCopyMb) st.peaks.gateCopyMb = Number(res.gate.peakRssMb);
      const newCalls = modelLedger.calls.slice(callsBefore);
      for (const c of newCalls) st.modelCalls.push({ gap: g.id, operator: op, ms: c.ms ?? null, ok: !!c.ok, model: c.model || null, reason: c.reason || null, promptChars: c.promptChars ?? null });
      if (res.copy) { st.copies.made++; if (res.copy.deleted && !existsSync(res.copy.dir)) st.copies.deleted++; }
      const s2 = sweep('after ' + round.key);
      st.copies.leftFound += s2.found;
      const ran = (res.trials || []).some((tr) => Number(tr.seconds) > 0) || !!res.copy;
      const common = {
        ...b, before: res.before ?? null, after: res.after ?? null, noise: res.noise ?? null, toward: res.toward ?? null, closed: res.closed ?? null,
        knob: res.knob ?? null, value: res.value ?? null, from: res.from ?? null, seconds: secs, ran, trials: (res.trials || []).length,
        improveRecord: res.record ? relOf(root, res.record) : null, copy: res.copy ? { mb: res.copy.mb, deleted: !!res.copy.deleted } : null,
        model: newCalls.length ? { calls: newCalls.length, ms: newCalls.map((c) => c.ms), ok: newCalls.filter((c) => c.ok).length } : null,
      };
      if (!res.kept) return decide({ ...common, decision: 'refused', wall: wallOfReason(res.reason), reason: res.reason || 'improve kept nothing' });
      if (cfg.dry) return decide({ ...common, decision: 'would-apply', reason: 'the evidence holds on the copy; a live soak would write it to the real tree and run the gate' });
      const author = 'organism (' + op + ')';
      const a = applyToTree({ root, patch: res.patch, files: g.files, pre, key: round.key, runId: st.runId, author, gateCmd: cfg.gateCmd, gateTimeoutMs: cfg.gateTimeoutMs, gates, splitSections, gateFn, meta: { gap: g.id, operator: op } });
      const line = decide({ ...common, ...(a.fields || {}), decision: a.decision, wall: a.wall ?? null, reason: a.reason, author: a.written ? author : null });
      if (a.decision === 'revert-failed') { failed = 'a revert did not restore ' + a.files.map((f) => f.file).join(', '); return null; }
      if (a.decision === 'kept') return keepLine(g, round, { ...res, modelName: newCalls.length ? newCalls[0].model || null : null }, a, line);
      return null;
    };

    const board10Pass = async () => {
      const left = modelLedger.max - modelLedger.used;
      const author = cfg.authorOn && left > 0 ? (typeof o.board10Author === 'function' ? o.board10Author : makeModelAuthor({ model: cfg.model, base: cfg.base, timeoutMs: cfg.callWallMs })) : null;
      say('BOARD 10 SOURCES (' + b10Sources.join(', ') + '): one pass, ' + (author ? 'at most 1 model call' : 'no model call (' + (cfg.authorOn ? 'the budget is spent' : 'the author is off') + ')') + ', ' + rnd((deadline - Date.now()) / 60_000, 3) + ' min left');
      const t = Date.now();
      let r;
      pointTemp();
      try {
        r = (o.board10Fn || runAutopilot)({
          root, lock: false, sources: b10Sources, author, authorMax: author ? 1 : 0, dry: cfg.dry, gateCmd: cfg.gateCmd, gateTimeoutMs: cfg.gateTimeoutMs, max: 3,
          print: (d) => say('  [' + (d.source || '-') + '] ' + String(d.decision).toUpperCase() + ' ' + (d.key || '-') + (d.wall ? ' [' + d.wall + ']' : '') + (d.reason ? ': ' + String(d.reason).slice(0, 200) : '')),
        });
      } catch (e) { r = { ok: false, reason: 'the Board 10 pass threw: ' + firstLine(e), counts: {}, bySource: {}, decisions: [] }; } finally { restoreTemp(); }
      r = r || { ok: false, reason: 'the Board 10 pass returned nothing', counts: {}, bySource: {}, decisions: [] };
      const calls = (r.decisions || []).filter((d) => d.candidate !== false && d.model && d.model.called);
      modelLedger.used += calls.length;
      for (const d of calls) st.modelCalls.push({ gap: null, source: d.source, operator: 'board10-author', ms: d.model.ms ?? null, ok: !!d.model.ok, model: d.model.model || null, reason: null });
      const by = {};
      for (const [k, v] of Object.entries(r.bySource || {})) by[k] = { candidates: v.candidates ?? 0, kept: v.kept ?? 0, reverted: v.reverted ?? 0, refused: v.refused ?? 0, wouldApply: v.wouldApply ?? 0, modelCalls: v.modelCalls ?? 0 };
      st.board10 = { at: new Date().toISOString(), ms: Date.now() - t, ok: r.ok !== false, reason: r.reason || null, runId: r.runId || null, counts: r.counts || {}, bySource: by, baseline: r.baseline ? r.baseline.summary : null, authoredLines: r.authoredLines || 0 };
      const s = sweep('after the Board 10 pass');
      st.copies.leftFound += s.found;
      save();
      if (r.counts && r.counts.revertFailed) failed = 'the Board 10 pass: ' + (r.reason || 'a revert failed');
    };

    // 4. the loop
    let lastIdle = null;
    for (;;) {
      if (failed) break;
      if (isStopped(root)) { stopped = true; say('stopped by ' + STOP_REL + ' between rounds'); break; }
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      let next = null;
      const deferred = [];
      for (const x of pending()) {
        if (x.refusal) { next = x; break; }
        const fit = fits(x.round, remaining);
        if (fit.ok) { next = { ...x, fit }; break; }
        deferred.push({ key: x.key, why: fit.reason });
      }
      if (next && !next.refusal) {
        const fl = liveBenchFlag({ root, selfPids: o.selfPids });
        if (fl) {
          const why = 'a bench is running (pid ' + fl.pid + ')';
          if (why !== lastIdle) { say('waiting: ' + why + '; no round writes the tree while it runs'); lastIdle = why; }
          const step = Math.min(cfg.idleStepMs, remaining);
          await sleep(step);
          st.idleMs += step;
          save();
          continue;
        }
      }
      if (next) {
        lastIdle = null;
        if (next.refusal) { decide({ ...baseOf(next.plan.gap, null), key: next.key, decision: 'refused', wall: next.refusal.wall, reason: next.refusal.reason }); continue; }
        const nl = await gapRound(next.round, next.fit);
        if (Array.isArray(nl)) { lines = nl; plans = gapQueue(lines, planOpts); }
        continue;
      }
      if (b10Sources.length && !st.board10 && remaining >= cfg.board10MinMs) { await board10Pass(); continue; }
      st.deferred = deferred;
      const why = deferred.length ? deferred.length + ' round(s) do not fit the wall left' : 'every gap of this soak was attempted';
      if (why !== lastIdle) { say('idle: ' + why + (deferred.length ? ' (' + deferred[0].key + ': ' + deferred[0].why + ')' : '') + '; the ledger is re-read every ' + Math.round(cfg.idleStepMs / 1000) + ' s'); lastIdle = why; }
      const step = Math.min(cfg.idleStepMs, remaining);
      await sleep(step);
      st.idleMs += step;
      save();
      if (wantGaps) {
        const fresh = readLines();
        if (JSON.stringify(fresh.map((g) => [g.id, g.measured])) !== JSON.stringify(lines.map((g) => [g.id, g.measured]))) { lines = fresh; plans = gapQueue(lines, planOpts); say('the ledger changed on disk: ' + lines.length + ' lines, re-planned'); }
      }
    }
    const endWhy = failed ? 'the soak failed' : stopped ? 'stopped' : 'the soak reached its minute';
    st.deferred = pending().filter((x) => !x.refusal).map((x) => ({ key: x.key, why: 'not started: ' + endWhy + ((st.deferred || []).find((d) => d.key === x.key) ? ' (' + st.deferred.find((d) => d.key === x.key).why + ')' : '') }));

    // 5. the end: the gate after
    st.loopEndedAt = new Date().toISOString();
    st.overrunMs = Math.max(0, Date.now() - deadline);
    const runAfter = !failed && !stopped && !cfg.dry && (cfg.gateAfter === 'on' || (cfg.gateAfter === 'auto' && cfg.soakMinutes >= GATE_AFTER_MIN_MINUTES));
    if (runAfter) {
      say('gate after: ' + (cfg.gateCmd || DEFAULT_GATE_CMD) + ' on the real tree');
      const g = gateFn({ root, cmd: cfg.gateCmd, timeoutMs: cfg.gateTimeoutMs });
      st.gateAfter = { ...gateSummary(g), ran: 'at the end of the soak' };
    } else if (gates.last) st.gateAfter = { ...gateSummary(gates.last), ran: 'after the last write of this soak' };
    else st.gateAfter = { ran: 'not run', summary: null, why: cfg.dry ? 'a dry soak' : stopped ? 'stopped' : failed ? 'the soak failed' : 'no write this soak and --gate-after ' + cfg.gateAfter + ' (auto runs it for a soak of ' + GATE_AFTER_MIN_MINUTES + ' min or more)' };
  } catch (e) {
    failed = 'the soak threw: ' + firstLine(e) + (e && e.stack ? ' at ' + String(String(e.stack).split('\n')[1] || '').trim() : '');
    say('SOAK CRASHED: ' + failed);
  } finally {
    restoreTemp();
    const left = listCopies(tmpRoot);
    st.copies.leftAtEnd = left.length;
    st.copies.tmpMb = existsSync(tmpRoot) ? dirMb(tmpRoot) : 0;
    try { rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* said below */ }
    st.copies.tmpRemoved = !existsSync(tmpRoot);
    st.copies.leftOnDisk = st.copies.tmpRemoved ? 0 : listCopies(tmpRoot).length;
    st.status = failed ? 'failed' : stopped ? 'stopped' : 'done';
    st.failed = failed;
    st.peakRssMb = Math.round(process.resourceUsage().maxRSS / 1024);
    save();
    releaseLock(lock);
  }
  const summary = summarizeSoak(st);
  summary.magnitude = await soakMagnitude(st, { rateFn: o.rateFn });
  const lines = renderSoak(summary);
  for (const l of lines) say(l);
  const exitCode = failed ? 1 : 0;
  // Board 15: the record keeps its own end lines, MAGNITUDE and exit, and the soak grades itself,
  // so a soak nobody watches (BrainAutopilot at 05:00) leaves its verdict on disk when it ends
  st.magnitude = summary.magnitude;
  st.endLines = lines;
  st.exit = { code: exitCode, by: 'runSoak (the code it returns to its CLI)' };
  try { writeFileSync(sfile + '.tmp', JSON.stringify(st, null, 1)); renameSync(sfile + '.tmp', sfile); } catch (e) { say('the record did not take its end lines: ' + firstLine(e)); }
  let verdict = null;
  if (o.grade !== false) {
    try {
      const proof = findProofSoak(root, { exclude: st.runId });
      const autonomy = await autonomyFacts(root, { queryTask: o.queryTask || null });
      const v = gradeSoak({ root, st, record: relOf(root, sfile), proof, autonomy, returned: exitCode, command: typeof o.command === 'string' ? o.command : null, barMinutes: o.barMinutes ?? SOAK_BAR_MINUTES });
      const w = writeSoakVerdict(root, v);
      verdict = { file: w.rel, archived: w.archived, isTheBar: v.isTheBar, barMet: v.barMet, checks: Object.fromEntries(Object.entries(v.checks).map(([k, c]) => [k, c.pass])) };
      say('VERDICT ' + w.rel + ': isTheBar ' + v.isTheBar + ', barMet ' + v.barMet + ' (' + Object.entries(v.checks).map(([k, c]) => k + ' ' + (c.pass ? 'pass' : 'FAIL')).join(', ') + ')' + (w.archived ? '; the bar file it replaced went to ' + SOAK_HISTORY_REL : ''));
    } catch (e) { say('the soak verdict was not written: ' + firstLine(e)); verdict = { file: null, error: firstLine(e) }; }
  }
  return { ...out, ok: !failed, exitCode, reason: failed, soakFile: relOf(root, sfile), stopped, ...summary, lines, verdict };
}

/** Counts of a soak: per source and per operator, model calls, trials, peaks, copies. */
export function summarizeSoak(st) {
  const tally = () => ({ attempts: 0, kept: 0, reverted: 0, refused: 0, wouldApply: 0 });
  const add = (t, d) => { t.attempts++; if (d === 'kept') t.kept++; else if (d === 'reverted' || d === 'revert-failed') t.reverted++; else if (d === 'refused') t.refused++; else if (d === 'would-apply') t.wouldApply++; };
  const bySource = { gaps: tally() }, byOperator = {};
  for (const d of st.decisions) { add(bySource.gaps, d.decision); const k = d.operator || 'none'; add(byOperator[k] || (byOperator[k] = tally()), d.decision); }
  for (const [s, v] of Object.entries((st.board10 && st.board10.bySource) || {})) bySource[s] = { attempts: v.candidates ?? 0, kept: v.kept ?? 0, reverted: v.reverted ?? 0, refused: v.refused ?? 0, wouldApply: v.wouldApply ?? 0 };
  const total = tally();
  for (const t of Object.values(bySource)) for (const k of Object.keys(total)) total[k] += t[k];
  const callMs = st.modelCalls.map((c) => c.ms).filter((x) => Number.isFinite(x));
  const runsOf = (xs) => xs.reduce((s, t) => s + (t.runs || 1), 0);
  const secsOf = (xs) => xs.reduce((s, t) => s + Number(t.seconds), 0);
  const kinds = {};
  for (const t of st.trials) (kinds[t.kind] || (kinds[t.kind] = [])).push(t);
  const nRuns = runsOf(st.trials);
  return {
    runId: st.runId, startedAt: st.startedAt, soakMinutes: st.cfg.soakMinutes, elapsedMs: st.elapsedMs, wallMinutes: rnd(st.elapsedMs / 60_000, 4),
    idleMs: st.idleMs, overrunMs: st.overrunMs ?? 0, resumes: (st.resumes || []).length, status: st.status, failed: st.failed || null,
    attempts: total, gapsAttempts: bySource.gaps.attempts, roundsRun: st.decisions.filter((d) => d.ran).length, bySource, byOperator,
    refusals: st.decisions.filter((d) => d.decision === 'refused').map((d) => ({ key: d.key, wall: d.wall, reason: d.reason })),
    modelCalls: { n: st.modelCalls.length, ok: st.modelCalls.filter((c) => c.ok).length, meanS: callMs.length ? rnd(meanOf(callMs) / 1000, 4) : null, seconds: callMs.map((x) => rnd(x / 1000, 4)), max: st.cfg.modelCalls },
    trials: { n: nRuns, meanS: nRuns ? rnd(secsOf(st.trials) / nRuns, 4) : null, byKind: Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, { n: runsOf(v), meanS: rnd(secsOf(v) / runsOf(v), 4) }])) },
    peakRssMb: { soak: st.peakRssMb ?? null, trial: st.peaks.trialMb || null, gateOnCopy: st.peaks.gateCopyMb || null },
    copies: { ...st.copies }, gateAfter: st.gateAfter || null, kept: st.kept, refreshes: st.refreshes, deferred: st.deferred || [], board10: st.board10,
  };
}

/** The organism's rate this soak beside the orchestrator's (bench/autopilot.mjs orchestratorRate). */
export async function soakMagnitude(st, { rateFn = null, rateRoot = ROOT } = {}) {
  const hours = Math.max(1e-9, (st.elapsedMs || 0) / 3_600_000);
  const b10Kept = (st.board10 && st.board10.counts && st.board10.counts.kept) || 0;
  const kept = st.kept.length + b10Kept;
  const gapsMoved = new Set(st.kept.map((k) => k.gap)).size;
  const barUnits = st.kept.reduce((s, k) => s + (Number.isFinite(k.toward) ? (Number(k.bar) ? Math.abs(k.toward) / Math.abs(Number(k.bar)) : Math.abs(k.toward)) : 0), 0);
  const organism = {
    kept, gapKept: st.kept.length, board10Kept: b10Kept, gapsMoved, barUnits: rnd(barUnits), wallHours: rnd(hours, 4),
    keptPerHour: rnd(kept / hours, 4), gapsMovedPerHour: rnd(gapsMoved / hours, 4), barUnitsPerHour: rnd(barUnits / hours, 4), keptPerDay: rnd(kept / hours * 24, 4),
  };
  let orchestrator;
  try {
    const fn = rateFn || (await import(new URL('../bench/autopilot.mjs', import.meta.url).href)).orchestratorRate;
    orchestrator = typeof fn === 'function' ? fn({ root: rateRoot }) : { ok: false, reason: 'bench/autopilot.mjs exports no orchestratorRate' };
  } catch (e) { orchestrator = { ok: false, reason: 'bench/autopilot.mjs did not load: ' + firstLine(e) }; }
  const o = orchestrator || { ok: false, reason: 'no rate' };
  const line = 'MAGNITUDE organism: ' + kept + ' kept (' + organism.gapKept + ' from gaps, ' + b10Kept + ' from the Board 10 sources), ' + gapsMoved + ' gap(s) moved, ' + organism.barUnits + ' bar units toward the bars in '
    + organism.wallHours + ' wall hours = ' + organism.keptPerHour + ' kept/hour, ' + organism.gapsMovedPerHour + ' gaps moved/hour, ' + organism.barUnitsPerHour + ' bar units/hour (' + organism.keptPerDay + ' kept/day)'
    + '  |  orchestrator: ' + (o.ok === false ? 'unread (' + o.reason + ')' : o.boards + ' boards landed and ' + o.barsMet + ' bars met over ' + o.windowDays + ' days = ' + o.boardsPerDay + ' boards/day, ' + o.barsMetPerDay + ' bars met/day (' + o.boardsPerHour + ' boards/hour), from ' + (o.sources || []).join(', '));
  return { organism, orchestrator, line };
}

/** The end-of-soak lines. */
export function renderSoak(s) {
  const L = [];
  const t = (x) => 'attempts ' + x.attempts + ', kept ' + x.kept + ', reverted ' + x.reverted + ', refused ' + x.refused + (x.wouldApply ? ', would apply ' + x.wouldApply : '');
  L.push('SOAK ' + s.runId + ' ' + String(s.status).toUpperCase() + ': ' + s.wallMinutes + ' of ' + s.soakMinutes + ' min (idle ' + rnd((s.idleMs || 0) / 60_000, 3) + ' min, overrun ' + rnd((s.overrunMs || 0) / 1000, 4) + ' s, resumed ' + s.resumes + ' time(s))' + (s.failed ? ': ' + s.failed : ''));
  L.push('  total: ' + t(s.attempts) + '; gap rounds that ran a trial or a prune: ' + s.roundsRun);
  for (const [k, v] of Object.entries(s.bySource)) L.push('  source ' + k.padEnd(8) + ' ' + t(v));
  for (const [k, v] of Object.entries(s.byOperator)) L.push('  operator ' + k.padEnd(13) + ' ' + t(v));
  for (const r of s.refusals) L.push('  refused ' + r.key + ' [' + r.wall + ']: ' + r.reason);
  for (const d of s.deferred || []) L.push('  deferred ' + d.key + ': ' + d.why);
  if (s.board10) L.push('  board 10 pass: ' + (s.board10.counts.candidates ?? 0) + ' candidates in ' + Math.round(s.board10.ms / 1000) + ' s' + (s.board10.reason ? ' (' + s.board10.reason + ')' : ''));
  else L.push('  board 10 pass: not run (the gap queue held the wall, the wall left was under the pass minimum, or its sources were not asked)');
  for (const k of s.kept) L.push('  kept ' + k.key + ' by ' + k.author + ': before ' + k.before + ' after ' + k.after + ' ' + (k.unit || '') + ' (bar ' + k.bar + ', noise ' + k.noise + '), authored in ' + k.authored);
  for (const r of s.refreshes) L.push('  ledger ' + (r.why === 'stale' ? 'rebuilt at the start: ' + r.lines + ' lines' : 'rebuilt after the keep of ' + r.gap + ': ' + (r.closed ? 'CLOSED, it left the ledger' : 'still open at ' + r.measuredAfter)));
  L.push('  model calls: ' + s.modelCalls.n + ' of at most ' + s.modelCalls.max + ' (' + s.modelCalls.ok + ' answered), mean ' + (s.modelCalls.meanS ?? '-') + ' s' + (s.modelCalls.seconds.length ? ' [' + s.modelCalls.seconds.join(', ') + ' s]' : ''));
  L.push('  trials: ' + s.trials.n + ' run, mean ' + (s.trials.meanS ?? '-') + ' s' + (Object.keys(s.trials.byKind).length ? ' (' + Object.entries(s.trials.byKind).map(([k, v]) => k + ' ' + v.n + ' at ' + v.meanS + ' s').join(', ') + ')' : ''));
  L.push('  peak RSS: soak process ' + s.peakRssMb.soak + ' MB, largest trial tree ' + (s.peakRssMb.trial ?? '-') + ' MB, largest gate on a copy ' + (s.peakRssMb.gateOnCopy ?? '-') + ' MB');
  L.push('  copies: made ' + s.copies.made + ', deleted and verified ' + s.copies.deleted + ', found left between rounds ' + s.copies.leftFound + ', left on disk ' + s.copies.leftOnDisk + ' (temp root ' + s.copies.tmpMb + ' MB at the end, removed ' + (s.copies.tmpRemoved ? 'yes' : 'NO') + ')');
  const g = s.gateAfter || {};
  L.push('  gate after: ' + (g.ran === 'not run' ? 'not run: ' + g.why : (g.summary || 'no GATE line') + ' (' + g.ran + ', exit ' + g.exit + ')'));
  if (s.magnitude) L.push(s.magnitude.line);
  return L;
}

// ================================================================ the soak grades itself (Board 15)
// His 2026-09-25 order: "Needs to be fronteir level in microseconds. And self improving. Without
// your build. THAT HAS TO BE ESTABLISHED NOW." A soak launched by BrainAutopilot at 05:00 has no
// orchestrator to read its transcript, so at its end it writes its own verdict from its own record:
// bench/verdicts/soak.json (isTheBar true) for a soak of at least SOAK_BAR_MINUTES with the author
// on and not dry, bench/verdicts/soak-partial.json (isTheBar false) for any other. A bar file it
// replaces is appended whole to bench/verdicts/soak-history.jsonl first, so no graded soak is lost.
// The same grader regrades a finished soak from its record and its copied transcript
// (node bench/autopilot.mjs --grade-soak <runId>), which is how the Board 14 soak was graded.
export const SOAK_BAR_MINUTES = 60;
export const SOAK_BAR_GAPS = 3;
export const SOAK_VERDICT_REL = 'bench/verdicts/soak.json';
export const SOAK_PARTIAL_REL = 'bench/verdicts/soak-partial.json';
export const SOAK_HISTORY_REL = 'bench/verdicts/soak-history.jsonl';
export const SOAK_LOGS_REL = 'bench/verdicts/autopilot';
export const SOAK_PROOF_COMMAND = 'node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/self -- node --max-old-space-size=6000 bin/brain.mjs self-code --auto --soak 1 --author off --json';
const readText = (f) => { try { return readFileSync(f, 'utf8'); } catch { return null; } };

/** The command a soak of this config is launched with, under the budget wrapper the schedule uses. */
export function soakCommand(cfg = {}) {
  return 'node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/self -- node --max-old-space-size=6000 bin/brain.mjs self-code --auto --soak ' + cfg.soakMinutes
    + ' --author ' + (cfg.authorOn ? 'on' : 'off') + (cfg.dry ? ' --dry' : '') + ' --json';
}

/** The bar a soak is graded against, in words. */
export function soakBarText(barMinutes = SOAK_BAR_MINUTES) {
  return 'a ' + barMinutes + '-minute unattended soak on the real tree with the author on ran its full wall with no crash, made at least ' + SOAK_BAR_GAPS
    + ' attempts on gaps-source candidates, the gate is GREEN after it, and the registered command with --soak 1 --author off exits 0';
}

/** The transcript files of one soak: bench/verdicts/autopilot/<anything><runId>.{out,err,exit}, or nulls. */
export function soakLogs(root, runId) {
  let names = [];
  try { names = readdirSync(path.join(root, ...SOAK_LOGS_REL.split('/'))).filter((n) => n.includes(String(runId)) && /\.(out|err|exit)$/.test(n)).sort(); } catch { names = []; }
  const pick = (ext) => { const n = names.find((x) => x.endsWith('.' + ext)); return n ? SOAK_LOGS_REL + '/' + n : null; };
  return { out: pick('out'), err: pick('err'), exit: pick('exit') };
}

/** A process exit code from an .exit file: "0", or "exit 0" with a stamp line after it. */
export function parseExitFile(text) {
  if (text === null || text === undefined) return null;
  const m = /^(?:exit\s+)?(-?\d+)\s*$/im.exec(String(text).trim().split('\n')[0]);
  return m ? Number(m[1]) : null;
}

/**
 * What a soak's copied transcript says: the end lines and MAGNITUDE (the JSON result on .out),
 * the code the soak returned, the process exit (.exit) and the budget wrapper's last line (.err).
 */
export function readSoakTranscript(root, logs) {
  const t = { lines: null, magnitude: null, returned: null, processExit: null, budgetDone: null, budgetStatus: null };
  const out = logs.out ? readText(path.join(root, logs.out)) : null;
  if (out) {
    let j = null;
    try { j = JSON.parse(out); } catch { j = lastJsonLine(out); }
    if (j) { t.lines = Array.isArray(j.lines) ? j.lines : null; t.magnitude = j.magnitude || null; t.returned = Number.isInteger(j.exitCode) ? j.exitCode : null; }
  }
  const err = logs.err ? readText(path.join(root, logs.err)) : null;
  if (err) {
    const done = err.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => /^BUDGET done exit -?\d+:/.test(l));
    t.budgetDone = done.length ? done[done.length - 1] : null;
    const status = err.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => /^BUDGET status \d+ s:/.test(l));
    t.budgetStatus = status.length ? status[0] : null;
    if (!t.lines) {
      const all = err.split('\n').map((l) => l.replace(/\r$/, ''));
      const i = all.findIndex((l) => /^SOAK \S+ (DONE|STOPPED|FAILED|RUNNING)\b/.test(l));
      if (i >= 0) { const j = all.findIndex((l, k) => k > i && l.startsWith('MAGNITUDE ')); t.lines = all.slice(i, j > i ? j + 1 : undefined).filter((l) => !/^BUDGET /.test(l)); }
    }
  }
  const ex = logs.exit ? readText(path.join(root, logs.exit)) : null;
  t.processExit = parseExitFile(ex);
  return t;
}

/**
 * The newest 1-minute author-off soak on record (the proof that the registered command starts and
 * exits), other than `exclude`. Its exit is the copied .exit file when there is one (the process's
 * own code), else the code the soak recorded.
 */
export function findProofSoak(root, { exclude = null } = {}) {
  const dir = path.join(root, 'state', 'self');
  let names = [];
  try { names = readdirSync(dir).filter((n) => /^soak-.+\.json$/.test(n)); } catch { names = []; }
  const found = [];
  for (const n of names) {
    let st;
    try { st = JSON.parse(readFileSync(path.join(dir, n), 'utf8')); } catch { continue; }
    if (!st || !st.cfg || !st.runId || st.runId === exclude) continue;
    const c = st.cfg;
    if (!(Number(c.soakMinutes) > 0 && Number(c.soakMinutes) <= 1) || c.authorOn !== false || c.dry) continue;
    const logs = soakLogs(root, st.runId);
    const tr = readSoakTranscript(root, logs);
    const recorded = st.exit && Number.isInteger(st.exit.code) ? st.exit.code : null;
    const exit = tr.processExit !== null ? tr.processExit : recorded;
    let doneLine = (tr.lines && tr.lines[0]) || (Array.isArray(st.endLines) && st.endLines[0]) || null;
    if (!doneLine) { try { doneLine = renderSoak(summarizeSoak(st))[0]; } catch { doneLine = null; } }
    found.push({
      ran: true, runId: st.runId, startedAt: st.startedAt || null, status: st.status || null, exit,
      exitFrom: tr.processExit !== null ? logs.exit + ' (the process exit)' : recorded !== null ? 'state/self/' + n + ' exit (the code the soak returned to its CLI)' : 'nowhere: no .exit file and no exit in the record',
      doneLine: doneLine ? String(doneLine).trim() : null, budgetLine: tr.budgetStatus, budgetDoneLine: tr.budgetDone,
      record: 'state/self/' + n, files: [logs.out, logs.err, logs.exit].filter(Boolean), command: SOAK_PROOF_COMMAND,
    });
  }
  found.sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
  return found.find((f) => f.exit !== null) || found[0] || { ran: false, exit: null, reason: 'no 1-minute author-off soak record under state/self/' };
}

/**
 * The facts a reader of the autonomy row needs, read now: the BrainAutopilot task (queried on the
 * real tree only; a planted tree says so), the STOP switch, the newest decision file and its age,
 * and the last gate (bench/verdicts/gate.json and the last GATE line of docs/LOG.md).
 */
export async function autonomyFacts(root, { queryTask = null, now = Date.now() } = {}) {
  let task;
  if (typeof queryTask === 'function') { try { task = await queryTask(); } catch (e) { task = { registered: null, line: 'the query threw: ' + firstLine(e) }; } }
  else if (path.resolve(root) === path.resolve(ROOT)) {
    try {
      const m = await import(new URL('../tools/schedule-autopilot.mjs', import.meta.url).href);
      const q = m.queryTask({});
      task = { name: m.TASK_NAME, registered: q.registered, status: q.status, nextRun: q.nextRun, line: q.line };
    } catch (e) { task = { registered: null, line: 'tools/schedule-autopilot.mjs not landed yet: ' + firstLine(e) }; }
  } else task = { registered: null, line: 'not queried: a planted tree (' + root + ')' };
  if (task && task.raw) delete task.raw;
  const dir = path.join(root, ...SOAK_LOGS_REL.split('/'));
  let newest = null;
  try {
    for (const n of readdirSync(dir)) {
      if (!/^\d{4}-\d{2}-\d{2}\.jsonl$/.test(n)) continue;
      const s = statSync(path.join(dir, n));
      if (!newest || s.mtimeMs > newest.mtimeMs) newest = { n, mtimeMs: s.mtimeMs };
    }
  } catch { newest = null; }
  const decisions = newest ? {
    file: SOAK_LOGS_REL + '/' + newest.n, mtime: new Date(newest.mtimeMs).toISOString(), ageHours: rnd((now - newest.mtimeMs) / 3_600_000, 4),
    lines: (readText(path.join(dir, newest.n)) || '').split('\n').filter((l) => l.trim()).length,
  } : { file: null, line: 'no decision file under ' + SOAK_LOGS_REL };
  const gj = readJsonFile(path.join(root, 'bench', 'verdicts', 'gate.json'));
  const g = gj.ok ? gj.j : null;
  const gate = g ? {
    file: 'bench/verdicts/gate.json', at: g.at ?? null, verdict: g.verdict ?? null,
    line: 'GATE ' + g.verdict + ': test files ' + g.testsPassed + '/' + g.testsTotal + ', assertions ' + g.assertionsPassed + ' pass / ' + g.assertionsFailed + ' fail',
  } : { file: null, line: 'no bench/verdicts/gate.json' };
  const log = readText(path.join(root, 'docs', 'LOG.md'));
  const gl = log ? (log.match(/GATE (?:GREEN|RED): test files [^\n]*?boundary (?:GREEN|RED)/g) || []) : [];
  gate.logLine = gl.length ? gl[gl.length - 1] : null;
  return { at: new Date(now).toISOString(), task, stop: { path: STOP_REL, present: existsSync(stopPath(root)) }, decisions, gate };
}

/**
 * THE GRADE of one soak, from its record (and, for a soak graded after the fact, its copied
 * transcript). Pure: it reads what it is given and returns the verdict; writeSoakVerdict writes it.
 */
export function gradeSoak({
  root = ROOT, st, record = null, transcript = null, logs = null, proof = null, autonomy = null, barMinutes = SOAK_BAR_MINUTES,
  writtenBy = 'self/autopilot.mjs runSoak at the end of the soak', command = null, at = new Date().toISOString(), returned = null,
} = {}) {
  const summary = summarizeSoak(st);
  const tr = transcript || {};
  const lines = (tr.lines && tr.lines.length ? tr.lines : Array.isArray(st.endLines) && st.endLines.length ? st.endLines : renderSoak(summary)).map((l) => String(l));
  const magLine = (st.magnitude && st.magnitude.line) || (tr.magnitude && tr.magnitude.line) || lines.find((l) => l.startsWith('MAGNITUDE ')) || null;
  const find = (re) => { const l = lines.find((x) => re.test(x.trim())); return l ? l.trim() : null; };
  const cfg = st.cfg || {};
  const minutes = Number(cfg.soakMinutes);
  // the bar's minutes may be lowered only on a planted tree (a test); on the real tree it is at least SOAK_BAR_MINUTES
  if (path.resolve(root) === path.resolve(ROOT) || !(Number(barMinutes) > 0)) barMinutes = Math.max(SOAK_BAR_MINUTES, Number(barMinutes) || 0);
  const bar = Number.isFinite(minutes) && minutes >= barMinutes && cfg.authorOn === true && !cfg.dry;
  const exitCode = tr.processExit !== null && tr.processExit !== undefined ? tr.processExit : Number.isInteger(returned) ? returned : st.exit && Number.isInteger(st.exit.code) ? st.exit.code : null;
  const exitFrom = tr.processExit !== null && tr.processExit !== undefined ? (logs && logs.exit) + ' (the process exit)' : Number.isInteger(returned) ? 'the code runSoak returns to its CLI (bin/brain.mjs exits with it; under the tick, the day log ends "autopilot tick end: exit N")' : st.exit && Number.isInteger(st.exit.code) ? 'the record (' + (st.exit.by || 'the soak') + ')' : 'unknown';
  const g = st.gateAfter || {};
  const gaps = summary.bySource.gaps || { attempts: 0, kept: 0, reverted: 0, refused: 0 };
  const trialRecords = (st.trials || []).length;
  const trialSecs = (st.trials || []).reduce((s, t) => s + Number(t.seconds || 0), 0);
  const recordsByKind = {};
  for (const t of st.trials || []) recordsByKind[t.kind || 'trial'] = (recordsByKind[t.kind || 'trial'] || 0) + 1;
  const pr = proof || { ran: false, exit: null, reason: 'not looked for' };
  const checks = {
    ranFullWall: { pass: st.status === 'done' && !st.failed && Number(st.elapsedMs) >= minutes * 60_000 && (exitCode === null || exitCode === 0), elapsedMin: summary.wallMinutes, soakMinutes: minutes, status: st.status ?? null, exit: exitCode, failed: st.failed || null },
    gapsAttempts: { pass: gaps.attempts >= SOAK_BAR_GAPS, attempts: gaps.attempts, bar: SOAK_BAR_GAPS },
    gateGreenAfter: { pass: g.exit === 0 && /^GATE GREEN\b/.test(String(g.summary || '')), summary: g.summary || null, ran: g.ran || null },
    proofSoakExit0: { pass: pr.ran === true && pr.exit === 0, ...pr },
  };
  const barMet = bar && Object.values(checks).every((c) => c.pass === true);
  const printed = {
    doneLine: find(/^SOAK \S+ [A-Z]+:/), totalLine: find(/^total:/), gapsLine: find(/^source gaps\b/), modelLine: find(/^model calls:/), trialsLine: find(/^trials:/),
    peakLine: find(/^peak RSS:/), copiesLine: find(/^copies: made/), gateLine: find(/^gate after:/), magLine, budgetDoneLine: tr.budgetDone || null,
    sourceLines: lines.filter((l) => /^ {2}source /.test(l)).map((l) => l.trim()), operatorLines: lines.filter((l) => /^ {2}operator /.test(l)).map((l) => l.trim()),
    keptLines: lines.filter((l) => /^ {2}kept /.test(l)).map((l) => l.trim()), ledgerLines: lines.filter((l) => /^ {2}ledger /.test(l)).map((l) => l.trim()),
  };
  // the record renders its own end lines again; a record that kept its MAGNITUDE (Board 15 on) renders that line too
  const reproduced = (() => { const re = renderSoak(st.magnitude && st.magnitude.line ? { ...summary, magnitude: st.magnitude } : summary); const n = lines.filter((l) => re.includes(l)).length; return { lines: lines.length, fromRecord: n, notInRecord: lines.filter((l) => !re.includes(l)).map((l) => l.slice(0, 80)) }; })();
  const rec = record || 'state/self/soak-' + st.runId + '.json';
  const why = bar ? null : !(minutes >= barMinutes) ? 'a soak of ' + minutes + ' min is under the bar\'s ' + barMinutes : cfg.authorOn !== true ? 'the author was off' : 'a dry soak';
  const passes = Object.entries(checks).map(([k, c]) => k + ' ' + (c.pass ? 'pass' : 'FAIL')).join(', ');
  const statement = 'SOAK ' + st.runId + ' (' + rec + (logs && (logs.out || logs.err) ? ', transcript ' + [logs.out, logs.err, logs.exit].filter(Boolean).join(', ') : '') + '): ' + printed.doneLine + '. ' + printed.totalLine + '. '
    + (printed.gapsLine || 'source gaps attempts ' + gaps.attempts) + '. ' + (printed.modelLine || 'no model line') + '. ' + (printed.gateLine || 'no gate line') + '. ' + (magLine || 'no MAGNITUDE line') + '. '
    + 'Exit ' + exitCode + ' from ' + exitFrom + (tr.budgetDone ? '; ' + tr.budgetDone : '') + '. '
    + 'Proof soak of the registered command (--soak 1 --author off): ' + (pr.ran ? pr.runId + ' exit ' + pr.exit + ' from ' + pr.exitFrom + ', ' + pr.doneLine : pr.reason) + '. '
    + (bar ? 'Bar ' + (barMet ? 'MET' : 'MISSED') + ': ' + passes + '.' : 'Not the bar (' + why + '), so this file has isTheBar false: ' + passes + '.')
    + ' The record reproduces ' + reproduced.fromRecord + ' of ' + reproduced.lines + ' printed end lines' + (reproduced.notInRecord.length ? ' (not in it: ' + reproduced.notInRecord.map((l) => l.split(' ')[0]).join(', ') + ')' : '') + '.';
  return {
    at, command: command || soakCommand(cfg), node: process.version, item: 'loop', board: 'BOARD 15 (the soak grades itself; the loop of Board 14)', isTheBar: bar, barMet,
    bar: soakBarText(barMinutes), notTheBarBecause: why,
    split: {
      development: 'test/autopilot.test.mjs on planted trees (operators and author mocked through test/operators-plant.mjs and test/autopilot-plant.mjs, no Ollama)',
      heldOut: (path.resolve(root) === path.resolve(ROOT) ? 'the real tree' : 'the tree ' + root) + ': SOAK ' + st.runId + ' with the author ' + (cfg.authorOn ? 'on' : 'off') + ', and the newest 1-minute author-off proof soak on record',
    },
    soak: {
      runId: st.runId, record: rec, logs: logs ? [logs.out, logs.err, logs.exit].filter(Boolean) : [], startedAt: st.startedAt ?? null, updatedAt: st.updatedAt ?? null, loopEndedAt: st.loopEndedAt ?? null,
      elapsedMs: st.elapsedMs ?? null, idleMs: st.idleMs ?? null, overrunMs: st.overrunMs ?? null, resumes: (st.resumes || []).length, status: st.status ?? null, failed: st.failed || null, cfg,
      exit: exitCode, exitFrom, returned: tr.returned ?? (Number.isInteger(returned) ? returned : null),
    },
    totals: { ...summary.attempts, perSource: summary.bySource, perOperator: summary.byOperator, gapsOnly: { attempts: gaps.attempts, kept: gaps.kept, reverted: gaps.reverted, refused: gaps.refused }, roundsRun: summary.roundsRun },
    kept: st.kept || [],
    modelCalls: { made: summary.modelCalls.n, answered: summary.modelCalls.ok, cap: summary.modelCalls.max, meanSeconds: summary.modelCalls.meanS, seconds: summary.modelCalls.seconds, model: [...new Set((st.modelCalls || []).map((c) => c.model).filter(Boolean))] },
    trials: { runs: summary.trials.n, meanSeconds: summary.trials.meanS, byKind: summary.trials.byKind, records: trialRecords, meanSecondsPerRecord: trialRecords ? rnd(trialSecs / trialRecords, 4) : null, recordsByKind },
    peaks: { soakProcessMb: summary.peakRssMb.soak, trialMb: summary.peakRssMb.trial, gateCopyMb: summary.peakRssMb.gateOnCopy },
    copies: summary.copies, gateAfter: st.gateAfter || null, refreshes: st.refreshes || [], deferred: (st.deferred || []).length,
    magnitude: magLine, printed, reproduced, checks, autonomy: autonomy || null, authored: AUTHORED_REL, writtenBy, statement,
  };
}

/**
 * Write a graded soak: the bar file when it is the bar, else soak-partial.json. A bar file that
 * holds another soak (or another writer's grade of this one) is appended whole to
 * soak-history.jsonl before it is replaced. Returns the path written, relative to root.
 */
export function writeSoakVerdict(root, verdict) {
  const rel = verdict.isTheBar ? SOAK_VERDICT_REL : SOAK_PARTIAL_REL;
  const f = path.join(root, ...rel.split('/'));
  mkdirSync(path.dirname(f), { recursive: true });
  let archived = false;
  if (verdict.isTheBar && existsSync(f)) {
    const prev = readText(f);
    let p = null;
    try { p = JSON.parse(prev); } catch { p = null; }
    const same = p && p.soak && p.soak.runId === verdict.soak.runId && p.writtenBy === verdict.writtenBy;
    if (!same && prev && prev.trim()) {
      appendFileSync(path.join(root, ...SOAK_HISTORY_REL.split('/')), JSON.stringify({ replacedAt: verdict.at, replacedBy: verdict.soak.runId, previous: p || { text: prev } }) + '\n');
      archived = true;
    }
  }
  writeFileSync(f + '.tmp', JSON.stringify(verdict, null, 2) + '\n');
  renameSync(f + '.tmp', f);
  return { rel, archived };
}

/** Grade a finished soak after the fact from its record and copied transcript, and write it. */
export async function regradeSoak({ root = ROOT, runId, write = true, queryTask = null, writtenBy = null, command = null, barMinutes = SOAK_BAR_MINUTES } = {}) {
  const f = findSoak(root, String(runId));
  if (!f.ok) return { ok: false, reason: f.reason };
  const st = f.state;
  const logs = soakLogs(root, st.runId);
  const transcript = readSoakTranscript(root, logs);
  const proof = findProofSoak(root, { exclude: st.runId });
  const autonomy = await autonomyFacts(root, { queryTask });
  const verdict = gradeSoak({ root, st, record: 'state/self/soak-' + st.runId + '.json', transcript, logs, proof, autonomy, barMinutes, command, writtenBy: writtenBy || 'bench/autopilot.mjs --grade-soak ' + st.runId + ' (self/autopilot.mjs gradeSoak, from the record and the copied transcript)' });
  const w = write ? writeSoakVerdict(root, verdict) : null;
  return { ok: true, verdict, wrote: w };
}

/** runFromCli with --soak or --resume: the soak runs in a child process; its lines go to stderr as they happen. */
function runSoakFromCli(opts) {
  const root = typeof opts.root === 'string' ? path.resolve(opts.root) : ROOT;
  if (isStopped(root)) {
    process.stderr.write('stopped by ' + STOP_REL + '\n');
    return { kind: AUTO_KIND, soak: true, root, ok: true, stopped: true, reason: 'stopped by ' + STOP_REL, exitCode: 0 };
  }
  const heap = Number(opts['soak-heap-mb']) > 0 ? Number(opts['soak-heap-mb']) : SOAK_HEAP_MB;
  // the command this soak was launched with, for its verdict (the budget wrapper, when there is one, is outside this process)
  const argv = process.argv.slice(1).map((a, i) => (i === 0 && path.isAbsolute(a) ? relOf(root, a) : a));
  const command = typeof opts.command === 'string' ? opts.command : 'node ' + argv.map((a) => (/[\s&]/.test(a) ? '"' + a + '"' : a)).join(' ');
  const r = spawnSync(process.execPath, ['--max-old-space-size=' + heap, SELF_FILE, '--child', 'soak'], {
    input: JSON.stringify({ ...opts, root, command }), stdio: ['pipe', 'pipe', 'inherit'], encoding: 'utf8', env: cleanEnv(), windowsHide: true, maxBuffer: 256 * 1024 * 1024,
  });
  const ans = lastJsonLine(r.stdout);
  if (!ans) return { kind: AUTO_KIND, soak: true, root, ok: false, exitCode: 1, reason: 'the soak child printed no result (exit ' + r.status + (r.signal ? ', signal ' + r.signal : '') + (r.error ? ', ' + r.error.message : '') + ')' };
  const exitCode = Number.isInteger(ans.exitCode) ? ans.exitCode : (ans.ok ? 0 : 1);
  // Board 15: the record learns the code this CLI exits with, after the child answered (a proof soak is graded by it)
  if (ans.runId && typeof ans.soakFile === 'string') {
    const f = path.join(root, ...ans.soakFile.split('/'));
    const rj = readJsonFile(f);
    if (rj.ok && rj.j && rj.j.runId === ans.runId) {
      rj.j.exit = { code: exitCode, by: 'runSoakFromCli (the code bin/brain.mjs exits with)', childStatus: r.status, at: new Date().toISOString() };
      try { writeFileSync(f + '.tmp', JSON.stringify(rj.j, null, 1)); renameSync(f + '.tmp', f); } catch { /* the record keeps the child's own exit */ }
    }
  }
  return { ...ans, exitCode };
}

// ================================================================ child processes
// `node self/autopilot.mjs --child author` reads one request on stdin and asks the model cell;
// `node self/autopilot.mjs --child imagine <root>` calls <root>/mind/imagine.mjs propose().
// Both print one JSON line. They exist so runAutopilot can stay synchronous.
const firstLine = (e) => String(e && e.message || e).split('\n')[0];
const isPatchItem = (x) => !!x && typeof x === 'object' && (typeof x.patch === 'string' || (x.type === 'patch' && typeof x.anchor === 'string' && typeof x.insert === 'string'));
/**
 * One imagined item as a candidate. A unified diff is taken as it is; the anchor-insert shape of
 * capability/grid-invent.mjs patchFor() ({type:'patch', target, test, anchor, insert}) becomes a
 * diff that inserts the line after the one line equal to the anchor (none or two: no patch).
 */
export function normalizeImagined(x, root = ROOT) {
  if (!x || typeof x !== 'object') return null;
  const s = (v, n) => (typeof v === 'string' && v ? v.slice(0, n) : null);
  const base = { key: s(x.key || x.id, 120), test: s(x.test, 300), why: s(x.why || x.idea || x.text || x.title || x.description, 400), evidence: s(x.evidence, 20) };
  if (typeof x.patch === 'string') return { ...base, file: s(x.file || x.target, 300), patch: x.patch.slice(0, 200_000) };
  if (x.type === 'patch' && typeof x.anchor === 'string' && typeof x.insert === 'string' && typeof x.target === 'string') {
    const f = safePath(x.target, { root });
    if (!f.ok) return { ...base, file: x.target, patch: null, why: (base.why || '') + ' (target refused: ' + f.reason + ')' };
    const lines = readFileSync(f.abs, 'utf8').split('\n').map((l) => l.replace(/\r$/, ''));
    const at = [];
    lines.forEach((l, i) => { if (l === x.anchor) at.push(i); });
    if (at.length !== 1 || /[\r\n]/.test(x.insert)) return { ...base, file: f.rel, patch: null, why: (base.why || '') + ' (the anchor matches ' + at.length + ' lines, so no patch)' };
    const n = at[0] + 1;
    return { ...base, file: f.rel, patch: '--- a/' + f.rel + '\n+++ b/' + f.rel + '\n@@ -' + n + ',1 +' + n + ',2 @@\n ' + x.anchor + '\n+' + x.insert + '\n' };
  }
  return base.why && (x.file || x.test) ? { ...base, file: s(x.file || x.target, 300), patch: null } : null;
}
function childOut(o) { process.stdout.write(JSON.stringify(o) + '\n', () => process.exit(0)); }
async function childMain(mode, args) {
  if (mode === 'soak') {
    let req;
    try { req = JSON.parse(readFileSync(0, 'utf8')); } catch (e) { childOut({ kind: AUTO_KIND, soak: true, ok: false, exitCode: 1, reason: 'the soak request on stdin is not JSON: ' + firstLine(e) }); return; }
    let r;
    try { r = await runSoak(req); } catch (e) { r = { kind: AUTO_KIND, soak: true, ok: false, exitCode: 1, reason: 'the soak threw: ' + firstLine(e) }; }
    childOut(r);
    return;
  }
  if (mode === 'author') {
    let req;
    try { req = JSON.parse(readFileSync(0, 'utf8')); } catch (e) { childOut({ ok: false, reason: 'the request on stdin is not JSON: ' + String(e.message).split('\n')[0] }); return; }
    const cfg = authorConfig(req);
    if (!cfg.ok) { childOut({ ok: false, reason: cfg.reason }); return; }
    const { complete } = await import('../act/llm.mjs');
    const r = await complete({
      provider: 'ollama', model: cfg.model, base: cfg.base, prompt: String(req.prompt || ''), system: req.system || null,
      maxTokens: cfg.maxTokens, numCtx: cfg.numCtx, think: cfg.think, timeoutMs: cfg.timeoutMs, probeMs: 3000, keepAlive: '5m',
    });
    childOut({ ok: r.ok === true, text: r.ok === true ? r.text : null, ms: r.ms, model: r.model, tokens: r.tokens ?? null, promptTokens: r.promptTokens ?? null, thinkingChars: r.thinking ? r.thinking.length : 0, reason: r.reason ?? null, fellBack: r.fellBack ?? null });
    return;
  }
  if (mode === 'imagine') {
    const root = path.resolve(args[0] || ROOT);
    let m;
    try { m = await import(pathToFileURL(path.join(root, 'mind', 'imagine.mjs')).href); } catch (e) { childOut({ ok: false, reason: 'mind/imagine.mjs does not import: ' + firstLine(e) }); return; }
    if (typeof m.propose !== 'function') { childOut({ ok: false, reason: 'mind/imagine.mjs exports no propose()' }); return; }
    let items = null, how = null, first = null;
    try {
      const got = await m.propose({ root, for: 'autopilot', max: 5 });
      items = Array.isArray(got) ? got : Array.isArray(got?.candidates) ? got.candidates : Array.isArray(got?.proposals) ? got.proposals : [];
      how = 'propose({root})';
    } catch (e) { first = firstLine(e); }
    if (!items || !items.some(isPatchItem)) {
      // The imagination proper takes a SPACE (mind/imagine.mjs). The one space whose candidates
      // become code is the grid DSL of capability/grid-invent.mjs: patchFor() turns an imagined
      // chain word into a patch that registers it in capability/grid-dsl.mjs, held for this file.
      const gf = path.join(root, 'capability', 'grid-invent.mjs');
      if (existsSync(gf)) {
        try {
          const gi = await import(pathToFileURL(gf).href);
          if (typeof gi.dslSpace === 'function' && typeof gi.vocabularyMemory === 'function' && typeof gi.patchFor === 'function') {
            const rep = m.propose({ space: gi.dslSpace(), memory: gi.vocabularyMemory(), seed: 'autopilot' }, 16);
            items = (rep.candidates || []).map((c) => {
              const p = gi.patchFor({ key: c.key, spec: c.spec, solved: [] });
              return p ? { ...p, why: 'imagined word ' + c.key + ' at novelty ' + c.novelty + ' (outside memory and the null, operator ' + c.operator + '); capability/grid-invent.mjs patchFor() registers it in ' + p.target } : null;
            }).filter(Boolean);
            how = 'propose(grid DSL space, ' + (rep.candidates || []).length + ' imagined) + patchFor';
          }
        } catch (e) { first = first || firstLine(e); }
      }
    }
    if (!items) { childOut({ ok: false, reason: 'propose() threw: ' + first }); return; }
    const out = [];
    for (const x of items.slice(0, 40)) { const n = normalizeImagined(x, root); if (n) out.push(n); if (out.length >= 5) break; }
    childOut({ ok: true, how, proposed: items.length, items: out, note: first });
    return;
  }
  childOut({ ok: false, reason: 'unknown child mode ' + mode });
}
if (process.argv[1] && path.resolve(process.argv[1]) === SELF_FILE && process.argv[2] === '--child') {
  childMain(process.argv[3], process.argv.slice(4)).catch((e) => childOut({ ok: false, reason: String(e && e.message || e).split('\n')[0] }));
}
