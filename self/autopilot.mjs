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
import {
  readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, rmSync, openSync,
  closeSync, writeSync, readdirSync, statSync, mkdtempSync, cpSync,
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
  const want = new Set(Array.isArray(sources) && sources.length ? sources : SOURCE_ORDER);
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
  return { sources: detail, candidates: SOURCE_ORDER.filter((s) => want.has(s)).flatMap((s) => lists[s] || []) };
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
const sourceClass = (s) => (SOURCE_ORDER.includes(s) ? s : 'given');
const evidenceMode = (c) => (c.evidence === 'preserve' || c.evidence === 'faster' ? c.evidence : 'fix');

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
  if (!dry) {
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
  for (const name of [...SOURCE_ORDER, 'given']) {
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
