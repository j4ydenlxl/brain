// bench/gate.mjs: THE TESTING PLANE. Runs every test file, counts lines, scans prose for
// em-dashes and for numbers that no command printed (docs must cite a bench), checks that
// no module imports a dependency, and writes bench/verdicts/gate.json. Exit code is the
// verdict: 0 only if every test file passed and every check is green. Numbers come from here.
//
// THREE ROWS (Board 10, his P4 and P15), each printed and each able to turn the gate red:
//
//   BUDGET    every test file runs under tools/budget.mjs: a working set cap on its whole
//             process tree, a disk cap on its OWN temp directory (TEMP, TMP and TMPDIR point
//             there, so every os.tmpdir() write of the file and of its children is counted),
//             and --max-old-space-size on the node it starts. The row prints each file's peak
//             RSS and dir bytes, the largest of each, and is red if any file was killed,
//             refused or aborted, or did not run under the budget at all.
//   COMPRESS  bytes per score point at this checkpoint against the last recorded one: every
//             record is a checkpoint header read from disk (a verdict's ruler.v2Header, or the
//             header of a container 2 checkpoint under a state directory), ordered by its own
//             time. Red if the newest rose against the one before it while the score did not.
//   HIS DATA  bytes of the owner's data in the tree = 0, ruled by provenance: every data file
//             under bench/fixtures/ must be named (itself or a directory above it) on a line of
//             a SOURCES.md at or above it, and that line must name a licence ("the same
//             licence" inherits the one the same SOURCES.md names elsewhere). Notice files
//             (SOURCES.md, LICENSE*, NOTICE*, COPYING*, .gitignore) are listed, not counted as
//             data. Red if any data file is uncovered, with its path and bytes.
//
// TWO MORE (Board 12, his P8 and P15), printed after them and able to turn the gate red:
//
//   LOAD-BEARING  the dead share (1 - load-bearing lines / loaded lines) of every emitted seed
//             under organism/, from the census verdicts on disk. A census counts for a seed only
//             when it still describes it: its manifest hash is the seed's, or, when it carries
//             none, it was written after the seed's manifest last changed. Red when any seed has
//             no such census, or when a seed the daemon loads is above 10 percent dead. Which
//             seeds the daemon loads is read, not assumed: the string literals of every module
//             its entries can import that name a seed by path, and every checkpoint meta under
//             a state directory that names one. The line says how many that is, even when 0.
//   BOUNDARY  from bench/verdicts/boundary.json: red when a boundary's copied buffers reached the
//             audit's cap, when a boundary was not measured, when the verdict lists an unlisted
//             boundary, or when a static scan of the tree now (tools/boundary-audit.mjs, when it
//             can be loaded) finds one the allowlist does not list. The wire size, strings
//             included, is printed beside it; the audit reports it and does not hold it to the cap.
//
//   node bench/gate.mjs [--quiet]
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// The two siblings are loaded, not imported: self/autopilot's tests copy THIS FILE ALONE into a
// fixture tree and run it there, so a missing sibling must never stop the gate. Without
// tools/budget.mjs every test file still runs (a plain spawn) and the BUDGET row is RED and says
// why; without core/persist.mjs the COMPRESS row reads verdicts only, and says so.
const loaded = async (spec) => { try { return { mod: await import(spec), error: null }; } catch (e) { return { mod: null, error: String((e && e.message) || e).split('\n')[0] }; } };
const BUDGET_MOD = await loaded('../tools/budget.mjs');
const PERSIST_MOD = await loaded('../core/persist.mjs');
const budget = BUDGET_MOD.mod ? BUDGET_MOD.mod.budget : null;
const readCheckpointHeader = PERSIST_MOD.mod ? PERSIST_MOD.mod.readCheckpointHeader : null;
/** Why a sibling could not be loaded (null when it was). */
export const MISSING = Object.freeze({ budget: BUDGET_MOD.error, persist: PERSIST_MOD.error });

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
const MB = 1024 * 1024;
const r3 = (x) => Math.round(x * 1000) / 1000;

/** The caps every test file runs under. The heap flag is the BUDGETS rule's ceiling. */
export const GATE_CAPS = Object.freeze({
  ramMb: 6000, diskMb: 2048, intervalMs: 1000, heapMb: 6000, timeoutMs: 600_000,
  waitFreeRamMb: 16384, waitMaxS: 1800,
});

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'state' || name.startsWith('.')) continue;
    // web/dist/learn and web/dist/sat are his SAT and Learn study pages (another project's static
    // content, written 2026-09-19, hosted on the same domain). Not brain code or prose: not counted,
    // not scanned. The brain's own site is web/dist/index.html, app.js and findings/.
    if (/[\\/]web[\\/]dist$/.test(dir) && (name === 'learn' || name === 'sat')) continue;
    const p = path.join(dir, name), st = statSync(p);
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const relTo = (root, p) => path.relative(root, p).replaceAll('\\', '/');

function dirBytes(dir) {
  let bytes = 0, files = 0, entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return { bytes: 0, files: 0 }; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    try {
      if (e.isDirectory()) { const d = dirBytes(p); bytes += d.bytes; files += d.files; } else { bytes += statSync(p).size; files++; }
    } catch { /* removed while we looked */ }
  }
  return { bytes, files };
}

// ---------------------------------------------------------------- BUDGET: one test file, capped
/**
 * Run one test file under tools/budget.mjs. Its TEMP, TMP and TMPDIR are a fresh directory the
 * budget watches, removed afterwards (the bytes it left there are measured first).
 * @returns {Promise<{row: object, out: string}>}
 */
export async function runTestFile(file, { root = ROOT, caps = GATE_CAPS, log = () => {} } = {}) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'bg-'));
  let out = '';
  const t0 = Date.now();
  let rec = null;
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT')), TEMP: tmp, TMP: tmp, TMPDIR: tmp };
  try {
    if (!budget) {
      // no tools/budget.mjs in this tree: the file still runs, and its row says it was not budgeted
      const r = spawnSync(process.execPath, ['--max-old-space-size=' + caps.heapMb, '--test', file], { cwd: root, env, encoding: 'utf8', timeout: caps.timeoutMs, maxBuffer: 256 * MB });
      out = (r.stdout || '') + (r.stderr || '');
      rec = { outcome: 'unbudgeted', exitCode: r.status === null ? 1 : r.status, error: 'tools/budget.mjs could not be loaded: ' + MISSING.budget, peakRssMb: 0, peakDirBytes: null, samples: 0, maxProcs: 0, killed: null };
    } else rec = await budget('node', ['--max-old-space-size=' + caps.heapMb, '--test', file], {
      ramMb: caps.ramMb, diskMb: caps.diskMb, dir: tmp, intervalMs: caps.intervalMs, statusMs: 3_600_000,
      record: false, cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
      // NODE_TEST_CONTEXT is dropped from env: a gate called from inside a test would otherwise
      // hand it to the child, whose node --test then refuses to run "recursively" and reports nothing
      env,
      signal: AbortSignal.timeout(caps.timeoutMs),
      waitFreeRamMb: caps.waitFreeRamMb, waitMaxS: caps.waitMaxS,
      log: (line) => { out += line + '\n'; log(line); },
      onSpawn: (child) => {
        child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
        child.stdout.on('data', (d) => { out += d; });
        child.stderr.on('data', (d) => { out += d; });
      },
    });
  } catch (e) {
    rec = { outcome: 'error', exitCode: 127, error: e.message, peakRssMb: 0, peakDirBytes: null, samples: 0, killed: null };
  } finally {
    const left = dirBytes(tmp);
    try { rmSync(tmp, { recursive: true, force: true, maxRetries: 3 }); } catch { /* a handle still open; the OS temp cleaner takes it */ }
    rec = rec || { outcome: 'error', exitCode: 127, error: 'no run record' };
    rec.leftBytes = left.bytes; rec.leftFiles = left.files;
  }
  const num = (label) => { const m = out.match(new RegExp('ℹ ' + label + ' (\\d+)')); return m ? Number(m[1]) : null; };
  const row = {
    file: relTo(root, file), pass: num('pass'), fail: num('fail'), total: num('tests'), exit: rec.exitCode, ms: Date.now() - t0,
    budget: {
      outcome: rec.outcome, killed: rec.killed ? rec.killed.which || rec.outcome : null, error: rec.error || null,
      peakRssMb: rec.peakRssMb ?? 0, peakDirBytes: rec.peakDirBytes ?? null, leftBytes: rec.leftBytes, leftFiles: rec.leftFiles,
      samples: rec.samples ?? 0, maxProcs: rec.maxProcs ?? null, cpuSeconds: rec.cpuSeconds ?? null,
      caps: { ramMb: caps.ramMb, diskMb: caps.diskMb, heapMb: caps.heapMb, intervalMs: caps.intervalMs, timeoutMs: caps.timeoutMs },
    },
  };
  return { row, out };
}

/**
 * The BUDGET row from the per-file results. Green only when every file ran under the budget
 * and exited on its own: a kill, a refusal, an abort or an error is red.
 */
export function budgetRow(tests, caps = GATE_CAPS) {
  const underBudget = tests.filter((t) => t.budget && ['exit', 'killed', 'aborted'].includes(t.budget.outcome));
  const notRun = tests.filter((t) => !t.budget || !['exit', 'killed', 'aborted'].includes(t.budget.outcome));
  const kills = tests.filter((t) => t.budget && t.budget.outcome !== 'exit').map((t) => ({ file: t.file, outcome: t.budget ? t.budget.outcome : 'none', which: t.budget ? t.budget.killed : null, error: t.budget ? t.budget.error : 'no budget record' }));
  let peakRss = { mb: 0, file: null }, peakDir = { bytes: 0, file: null };
  // a file whose tree no sample caught alive has no RSS: it is unsampled, not 0 MB
  const sampled = tests.filter((t) => t.budget && t.budget.maxProcs > 0);
  // a tree without tools/budget.mjs still runs every file, unbudgeted, and the row is red and says why
  const unbudgeted = tests.filter((t) => t.budget && t.budget.outcome === 'unbudgeted');
  let leftBytes = 0; const leftFiles = [];
  for (const t of tests) {
    if (!t.budget) continue;
    if (t.budget.peakRssMb > peakRss.mb) peakRss = { mb: t.budget.peakRssMb, file: t.file };
    if ((t.budget.peakDirBytes ?? 0) > peakDir.bytes) peakDir = { bytes: t.budget.peakDirBytes, file: t.file };
    if (t.budget.leftBytes > 0) { leftBytes += t.budget.leftBytes; leftFiles.push(t.file); }
  }
  const ok = tests.length > 0 && kills.length === 0 && notRun.length === 0;
  const line = 'BUDGET ' + (ok ? 'GREEN' : 'RED') + ': ' + underBudget.length + ' of ' + tests.length + ' test files ran under tools/budget.mjs'
    + ' (cap ' + caps.ramMb + ' MB working set of the file\'s whole process tree, cap ' + caps.diskMb + ' MB on the file\'s own TEMP dir, sampled every '
    + caps.intervalMs + ' ms, --max-old-space-size=' + caps.heapMb + '), ' + kills.length + ' killed, refused or aborted'
    + (kills.length ? ' (' + kills.map((k) => k.file + ' ' + k.outcome + (k.which ? ' ' + k.which : '')).join(', ') + ')' : '')
    + '; peak RSS ' + peakRss.mb + ' MB' + (peakRss.file ? ' (' + peakRss.file + ')' : '')
    + ', RSS sampled on ' + sampled.length + ' of ' + tests.length + ' files (a file that exits before a sample catches its tree has none)'
    + ', peak dir ' + peakDir.bytes + ' bytes' + (peakDir.file ? ' (' + peakDir.file + ')' : '')
    + ', left behind in temp ' + leftBytes + ' bytes by ' + leftFiles.length + ' files'
    + (unbudgeted.length ? '; ' + unbudgeted.length + ' ran with no budget at all (' + unbudgeted[0].budget.error + ')' : '');
  return { ok, files: tests.length, underBudget: underBudget.length, rssSampled: sampled.length, unbudgeted: unbudgeted.length, kills, notRun: notRun.map((t) => t.file), peakRss, peakDir, left: { bytes: leftBytes, files: leftFiles }, caps: { ...caps }, line };
}

// ---------------------------------------------------------------- COMPRESS: bytes per score point
/** Every state directory a checkpoint could sit in: $BRAIN_STATE_DIR, /state (the container), and ROOT/state. */
export function stateDirs(root = ROOT) {
  const out = [];
  for (const d of [process.env.BRAIN_STATE_DIR, path.resolve('/state'), path.join(root, 'state')]) {
    if (d && existsSync(d) && !out.includes(path.resolve(d))) out.push(path.resolve(d));
  }
  return out;
}

/**
 * Every bytes per score point a checkpoint header recorded, read from disk and ordered by its
 * own time: verdicts carrying ruler.v2Header, and container 2 checkpoints (header only, the body
 * is never read) one level under each state directory.
 * @returns {Array<{at, where, score, of, bytes, bytesPerScorePoint, isTheBar}>}
 */
export function compressRecords({ root = ROOT, verdictsDir = path.join(root, 'bench', 'verdicts'), states = stateDirs(root) } = {}) {
  const out = [];
  if (existsSync(verdictsDir)) {
    for (const f of readdirSync(verdictsDir)) {
      if (!f.endsWith('.json')) continue;
      const p = path.join(verdictsDir, f);
      let text;
      try { text = readFileSync(p, 'utf8'); } catch { continue; }
      if (!text.includes('"v2Header"')) continue;
      let v; try { v = JSON.parse(text); } catch { continue; }
      const h = v && v.ruler && v.ruler.v2Header;
      if (!h || !Number.isFinite(h.bytesPerScorePoint) || !Number.isFinite(h.score)) continue;
      out.push({ at: v.at, where: relTo(root, p) + ' ruler.v2Header', score: h.score, of: h.of ?? null, bytes: h.bytes ?? null, bytesPerScorePoint: h.bytesPerScorePoint, isTheBar: v.isTheBar ?? null });
    }
  }
  for (const s of states) {
    let names; try { names = readdirSync(s, { withFileTypes: true }); } catch { continue; }
    for (const e of names) {
      if (!e.isDirectory()) continue;
      const dir = path.join(s, e.name);
      let files; try { files = readdirSync(dir); } catch { continue; }
      for (const f of files) {
        if (!/^snapshot.*\.(json|ckpt|bin)$/.test(f)) continue;
        const p = path.join(dir, f);
        let h = null; try { h = readCheckpointHeader ? readCheckpointHeader(p) : null; } catch { h = null; }
        const r = h && h.ruler;
        if (!r || !Number.isFinite(r.bytesPerScorePoint) || !Number.isFinite(r.score)) continue;
        let at = null; try { at = statSync(p).mtime.toISOString(); } catch { /* raced */ }
        out.push({ at: h.savedAt || at, where: p.replaceAll('\\', '/') + ' header.ruler', score: r.score, of: r.of ?? null, bytes: h.bytes ?? null, bytesPerScorePoint: r.bytesPerScorePoint, isTheBar: null });
      }
    }
  }
  return out.filter((r) => r.at).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

/** The COMPRESS row: the newest record against the one before it. Red if it rose while the score did not. */
export function compressRow(records) {
  const current = records.length ? records[records.length - 1] : null;
  const previous = records.length > 1 ? records[records.length - 2] : null;
  if (!current) return { ok: true, current: null, previous: null, records: 0, line: 'COMPRESS GREEN: no checkpoint header on disk records bytes per score point, so nothing rose' };
  if (!previous) return { ok: true, current, previous: null, records: 1, line: 'COMPRESS GREEN: bytes per score point ' + current.bytesPerScorePoint + ' at this checkpoint (' + current.where + ', ' + current.at + ', score ' + current.score + (current.of ? ' of ' + current.of : '') + '); no earlier record to rise against' };
  const rose = current.bytesPerScorePoint > previous.bytesPerScorePoint;
  const scoreRose = current.score > previous.score;
  const ok = !(rose && !scoreRose);
  const pct = previous.bytesPerScorePoint > 0 ? Math.round(((current.bytesPerScorePoint - previous.bytesPerScorePoint) / previous.bytesPerScorePoint) * 10000) / 100 : null;
  const line = 'COMPRESS ' + (ok ? 'GREEN' : 'RED') + ': bytes per score point ' + current.bytesPerScorePoint + ' at this checkpoint (' + current.where + ', ' + current.at
    + ', score ' + current.score + (current.of ? ' of ' + current.of : '') + ') against ' + previous.bytesPerScorePoint + ' at the last recorded one (' + previous.where + ', ' + previous.at
    + ', score ' + previous.score + (previous.of ? ' of ' + previous.of : '') + '): ' + (rose ? 'rose' : current.bytesPerScorePoint === previous.bytesPerScorePoint ? 'held' : 'fell')
    + (pct === null || pct === 0 ? '' : ' ' + Math.abs(pct) + ' percent') + ', score ' + (scoreRose ? 'rose' : current.score === previous.score ? 'held' : 'fell')
    + (ok ? '' : ': the checkpoint grew per point while the score did not');
  return { ok, current, previous, records: records.length, rose, scoreRose, changePercent: pct, line };
}

// ---------------------------------------------------------------- HIS DATA: provenance of every fixture byte
export const NOTICE_FILE = /^(SOURCES\.md|LICEN[CS]E([-._].*)?|NOTICE.*|COPYING.*|\.gitignore)$/i;
export const LICENCE_RE = /\b(MIT|Apache(?:[ -]License)?[ -]?2(?:\.0)?|Apache License|BSD[ -]?\d?[ -]?Clause|BSD|CC0(?:-1\.0)?|CC[ -]BY(?:-SA|-NC|-ND)*(?:[ -]\d(?:\.\d)?)?|ISC|MPL(?:[ -]?2(?:\.0)?)?|L?GPL(?:[ -]?v?\d(?:\.\d)?)?|Unlicense|public domain|ODC-By|ODbL|CDLA[ -\w.]*)\b/i;
const SAME_LICENCE = /\bsame licen[cs]e\b/i;
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A file is named when its path stands alone between separators. A directory is named when
// the line names the DIRECTORY (optionally with a trailing slash), not a path under it: a line
// about humaneval/HumanEval.jsonl is not a line about humaneval/humaneval-js.jsonl.
const SEP_BEFORE = '(^|[\\s|`(\\[,\'"*])';
// a period ends a name only where a sentence ends: HumanEval.jsonl.bak does not name HumanEval.jsonl
const SEP_AFTER = '(?=[\\s|`)\\],;:\'"*]|\\.(?:\\s|$)|$)';
export function mentionsFile(line, p) { return new RegExp(SEP_BEFORE + escRe(p) + SEP_AFTER).test(line); }
export function mentionsDir(line, p) { return new RegExp(SEP_BEFORE + escRe(p) + '/?' + SEP_AFTER).test(line); }

/**
 * Which fixture files a SOURCES.md line covers. A file is covered when a SOURCES.md in its own
 * directory or any directory above it (up to the fixtures root) has a line that names the file's
 * path relative to that SOURCES.md, or a directory on that path, and names a licence on the same
 * line (or says "the same licence" in a SOURCES.md that names one elsewhere).
 */
export function fixtureCoverage(fixturesDir) {
  const root = path.resolve(fixturesDir);
  const all = existsSync(root) ? walkAll(root) : [];
  const sources = new Map();
  for (const f of all) {
    if (path.basename(f) !== 'SOURCES.md') continue;
    const lines = readFileSync(f, 'utf8').split(/\r?\n/);
    const fileLicence = (lines.map((l) => (l.match(LICENCE_RE) || [null])[0]).find(Boolean)) || null;
    sources.set(path.dirname(f), { file: f, lines, fileLicence });
  }
  const files = [], notice = [];
  for (const f of all) {
    const bytes = statSync(f).size;
    const rel = relTo(root, f);
    if (NOTICE_FILE.test(path.basename(f))) { notice.push({ file: rel, bytes }); continue; }
    let by = null;
    for (let d = path.dirname(f); ; d = path.dirname(d)) {
      const s = sources.get(d);
      if (s) {
        const relHere = relTo(d, f);
        const parts = relHere.split('/');
        // the file itself first, then its directories from the deepest up
        const names = parts.map((_, i) => parts.slice(0, i + 1).join('/')).reverse();
        for (const n of names) {
          const isFile = n === relHere;
          for (let i = 0; i < s.lines.length && !by; i++) {
            const line = s.lines[i];
            if (!(isFile ? mentionsFile(line, n) : mentionsDir(line, n))) continue;
            const lic = (line.match(LICENCE_RE) || [null])[0] || (SAME_LICENCE.test(line) ? s.fileLicence : null);
            if (lic) by = { sources: relTo(root, s.file), line: i + 1, licence: lic, inherited: !(line.match(LICENCE_RE)), named: n };
          }
          if (by) break;
        }
      }
      if (by || d === root || path.dirname(d) === d || !d.startsWith(root)) break;
    }
    files.push({ file: rel, bytes, covered: !!by, by });
  }
  const uncovered = files.filter((x) => !x.covered);
  return {
    dir: fixturesDir, files: files.length, bytes: files.reduce((a, x) => a + x.bytes, 0),
    covered: files.length - uncovered.length, coveredBytes: files.filter((x) => x.covered).reduce((a, x) => a + x.bytes, 0),
    uncovered: uncovered.map((x) => ({ file: x.file, bytes: x.bytes })), uncoveredBytes: uncovered.reduce((a, x) => a + x.bytes, 0),
    notice, sources: [...sources.values()].map((s) => relTo(root, s.file)),
    byLicence: files.filter((x) => x.covered).reduce((m, x) => (m[x.by.licence] = (m[x.by.licence] || 0) + 1, m), {}),
    list: files,
  };
}
function walkAll(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkAll(p, out); else out.push(p);
  }
  return out;
}

/** The HIS DATA row from a coverage census. */
export function hisDataRow(cov, where = 'bench/fixtures') {
  const ok = cov.uncovered.length === 0;
  const line = 'HIS DATA ' + (ok ? 'GREEN' : 'RED') + ': ' + cov.covered + ' of ' + cov.files + ' data files under ' + where + ' (' + cov.coveredBytes + ' of ' + cov.bytes
    + ' bytes) are named on a SOURCES.md line with a licence (' + Object.entries(cov.byLicence).map(([k, v]) => k + ' ' + v).join(', ') + '); '
    + cov.notice.length + ' notice files are not data; ' + (ok ? 'uncovered 0 files, 0 bytes: bytes of his data 0'
      : 'uncovered ' + cov.uncovered.length + ' files, ' + cov.uncoveredBytes + ' bytes (' + cov.uncovered.map((u) => u.file + ' ' + u.bytes).join(', ') + '): their origin is written nowhere, so bytes of his data cannot be ruled 0');
  return { ok, files: cov.files, covered: cov.covered, bytes: cov.bytes, uncovered: cov.uncovered, uncoveredBytes: cov.uncoveredBytes, notice: cov.notice.map((n) => n.file), sources: cov.sources, byLicence: cov.byLicence, line };
}

// ---------------------------------------------------------------- LOAD-BEARING: the dead share of every emitted seed
/** A seed the daemon loads may be at most this share dead (1 - load-bearing lines / loaded lines). */
export const DEAD_SHARE_CAP = 0.10;
/** Where the daemon starts: the whole brain process, the served one, and the population of them. */
export const DAEMON_ENTRIES = Object.freeze(['daemon/run.mjs', 'bin/serve.mjs', 'daemon/multiply.mjs']);
const pct2 = (x) => (Math.round(x * 10000) / 100).toFixed(2);
const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// tools/boundary-audit.mjs is loaded, not imported, for the same reason as the two siblings above:
// a tree holding this file alone must still run the gate. Loaded once, on first use.
let auditPromise = null;
const auditModule = () => (auditPromise = auditPromise || loaded('../tools/boundary-audit.mjs'));

/** organism/<name> from any spelling of a path to a seed (backslashes, ./, an absolute prefix), else null. */
export function seedOf(p) {
  if (typeof p !== 'string') return null;
  const m = p.trim().replaceAll('\\', '/').match(/(?:^|\/)organism\/([A-Za-z0-9_][\w.-]*)\/?$/);
  return m ? 'organism/' + m[1] : null;
}

/**
 * Every emitted seed: a directory under organism/ holding a manifest.json (or, failing that, an
 * index.mjs). Only the manifest is read, never the seed, so a five million line seed costs one
 * small file here.
 * @returns {Array<{seed, hash, changedAt, by}>}
 */
export function emittedSeeds(root = ROOT) {
  const dir = path.join(root, 'organism');
  let ents; try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return []; }
  const out = [];
  for (const e of ents) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue;
    const mf = path.join(dir, e.name, 'manifest.json'), ix = path.join(dir, e.name, 'index.mjs');
    const file = existsSync(mf) ? mf : existsSync(ix) ? ix : null;
    if (!file) continue;
    let hash = null;
    if (file === mf) { try { const m = JSON.parse(readFileSync(mf, 'utf8')); hash = typeof m.hash === 'string' ? m.hash : null; } catch { hash = null; } }
    let changedAt = null; try { changedAt = statSync(file).mtime.toISOString(); } catch { /* raced */ }
    out.push({ seed: 'organism/' + e.name, hash, changedAt, by: path.basename(file) });
  }
  return out.sort((a, b) => byName(a.seed, b.seed));
}

/**
 * Every census line count on disk: a census verdict naming one seed (seed and lines), and each
 * row of a census over many (seeds). A record with no loaded or no load-bearing count (a refused,
 * stopped or sampled run) is kept, so the row can say a seed was tried and not counted.
 */
export function censusRecords(verdictsDir = path.join(ROOT, 'bench', 'verdicts')) {
  let names; try { names = readdirSync(verdictsDir); } catch { return []; }
  const out = [];
  for (const f of names.filter((n) => /^census.*\.json$/.test(n)).sort()) {
    let v; try { v = JSON.parse(readFileSync(path.join(verdictsDir, f), 'utf8')); } catch { continue; }
    if (!v || typeof v !== 'object') continue;
    const push = (s, lines, hash, mode) => {
      const seed = seedOf(s);
      if (!seed) return;
      const n = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
      out.push({ file: f, at: typeof v.at === 'string' ? v.at : null, isTheBar: v.isTheBar === true, seed, loaded: n(lines && lines.loaded), loadBearing: n(lines && lines.loadBearing), hash: typeof hash === 'string' ? hash : null, mode: typeof mode === 'string' ? mode : null });
    };
    if (typeof v.seed === 'string') push(v.seed, v.lines, (v.live && v.live.manifestHash) || (v.hash && v.hash.manifest), v.mode);
    if (v.seeds && typeof v.seeds === 'object') for (const s of Object.values(v.seeds)) if (s && typeof s === 'object') push(s.seed, s.lines, s.manifestHash || (s.live && s.live.manifestHash) || (s.hash && s.hash.manifest), s.mode);
  }
  return out;
}

/**
 * The census that describes a seed as it is now. Counted (loaded above 0, load-bearing within it)
 * and fresh (same manifest hash, or with no hash to compare, written after the seed's manifest
 * last changed), then the bar before a narrow run, then the newest.
 */
export function censusFor(seed, records) {
  const mine = records.filter((r) => r.seed === seed.seed);
  const counted = mine.filter((r) => r.loaded > 0 && r.loadBearing !== null && r.loadBearing >= 0 && r.loadBearing <= r.loaded);
  const fresh = [], stale = [];
  for (const r of counted) {
    let by = null;
    if (r.hash && seed.hash) by = r.hash === seed.hash ? 'hash' : null;
    else if (r.at && seed.changedAt && Date.parse(seed.changedAt) <= Date.parse(r.at)) by = 'time';
    if (by) fresh.push({ ...r, by }); else stale.push(r.file);
  }
  const t = (r) => Date.parse(r.at) || 0;
  fresh.sort((a, b) => (Number(b.isTheBar) - Number(a.isTheBar)) || (t(b) - t(a)) || byName(a.file, b.file));
  return { pick: fresh[0] || null, records: mine.length, counted: counted.length, stale };
}

// the module specifiers a source can load: static imports, literal dynamic imports, and the
// new URL('./x.mjs', import.meta.url) a Worker is started from
function specifiersOf(src) {
  const specs = [];
  for (const m of src.matchAll(/^\s*(?:import|export)\b[^;]*?(?<!['"\w])from\s*['"]([^'"]+)['"]/gm)) specs.push(m[1]);
  for (const m of src.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) specs.push(m[1]);
  for (const m of src.matchAll(/\bimport\(\s*['"]([^'"]+)['"]/g)) specs.push(m[1]);
  for (const m of src.matchAll(/new URL\(\s*['"]([^'"]+\.m?js)['"]\s*,\s*import\.meta\.url/g)) specs.push(m[1]);
  return specs;
}

/** Every module the entries can load, followed through relative specifiers; paths relative to root. */
export function importClosure(root = ROOT, entries = DAEMON_ENTRIES) {
  const seen = new Set();
  const q = entries.map((e) => path.resolve(root, e));
  while (q.length) {
    const f = q.shift();
    if (seen.has(f) || !existsSync(f)) continue;
    seen.add(f);
    let src; try { src = readFileSync(f, 'utf8'); } catch { continue; }
    for (const s of specifiersOf(src)) if (s.startsWith('.')) q.push(path.resolve(path.dirname(f), s));
  }
  return [...seen].map((f) => relTo(root, f)).sort();
}

// string literals in order, [{ text, start, end }] with start and end the content's offsets. The
// audit's lexer skips comments and regular expressions; without it a plain quoted-string scan
// stands in, and the row says which read the source.
function literalsOf(src, lex) {
  if (lex) {
    try { return lex(src).strings.map((s) => ({ text: src.slice(s.start, s.end), start: s.start, end: s.end })); } catch { /* fall through to the plain scan */ }
  }
  const out = [];
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)) {
    const text = m[1] !== undefined ? m[1] : m[2];
    out.push({ text, start: m.index + 1, end: m.index + 1 + text.length });
  }
  return out;
}

/**
 * Where source names a seed by path: a literal that is a path to organism/<name> ('organism/gen-0',
 * '../organism/gen-0/'), or the literal 'organism' followed, across only a comma, by a literal that
 * is a seed's name (path.join(root, 'organism', 'gen-0')). A usage message or prose that mentions a
 * seed inside a longer string is not a path and is not counted.
 */
export function seedsNamedIn(root, files, seeds, lex = null) {
  const names = new Set(seeds.map((s) => s.seed.slice('organism/'.length)));
  const hits = [];
  for (const rel of files) {
    let src; try { src = readFileSync(path.join(root, rel), 'utf8'); } catch { continue; }
    const lits = literalsOf(src, lex);
    const lineAt = (i) => src.slice(0, i).split('\n').length;
    for (let i = 0; i < lits.length; i++) {
      const s = seedOf(lits[i].text);
      if (s && names.has(s.slice('organism/'.length))) { hits.push({ seed: s, file: rel, line: lineAt(lits[i].start), text: lits[i].text }); continue; }
      const next = lits[i + 1];
      if (lits[i].text === 'organism' && next && names.has(next.text) && /^\s*,\s*$/.test(src.slice(lits[i].end + 1, next.start - 1))) {
        hits.push({ seed: 'organism/' + next.text, file: rel, line: lineAt(lits[i].start), text: "'organism', '" + next.text + "'" });
      }
    }
  }
  return hits;
}

/** Every checkpoint meta.json under the state directories (a few levels down), with its kind and any seed it names. */
export function checkpointMetas(states = stateDirs(ROOT), maxDepth = 4) {
  const out = [];
  const visit = (dir, depth) => {
    let ents; try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.isDirectory()) {
        if (depth < maxDepth && !e.name.startsWith('.') && e.name !== 'ledger' && e.name !== 'node_modules') visit(path.join(dir, e.name), depth + 1);
        continue;
      }
      if (e.name !== 'meta.json') continue;
      const p = path.join(dir, e.name);
      let m; try { m = JSON.parse(readFileSync(p, 'utf8')); } catch { continue; }
      if (!m || typeof m !== 'object') continue;
      const seeds = [...new Set(Object.values(m).map(seedOf).filter(Boolean))];
      out.push({ file: p.replaceAll('\\', '/'), kind: typeof m.kind === 'string' ? m.kind : null, seeds });
    }
  };
  for (const s of states) visit(s, 0);
  return out;
}

/** Which emitted seeds the daemon loads, read from its code and from its checkpoints on disk. */
export async function daemonLoads({ root = ROOT, seeds = emittedSeeds(root), entries = DAEMON_ENTRIES, states = stateDirs(root) } = {}) {
  const A = await auditModule();
  const lex = A.mod && typeof A.mod.lex === 'function' ? A.mod.lex : null;
  const closure = importClosure(root, entries);
  const named = seedsNamedIn(root, closure, seeds, lex);
  const metas = checkpointMetas(states);
  const kinds = {};
  for (const m of metas) kinds[m.kind || 'none'] = (kinds[m.kind || 'none'] || 0) + 1;
  const emitted = new Set(seeds.map((s) => s.seed));
  const loads = [...new Set([...named.map((h) => h.seed), ...metas.flatMap((m) => m.seeds)])].filter((s) => emitted.has(s)).sort();
  return {
    entries: [...entries], entriesPresent: entries.filter((e) => existsSync(path.join(root, e))), closure: closure.length,
    reader: lex ? 'the audit lexer (tools/boundary-audit.mjs lex)' : 'a plain quoted-string scan (tools/boundary-audit.mjs could not be loaded: ' + A.error + ')',
    named, metas: metas.length, kinds, metaSeeds: [...new Set(metas.flatMap((m) => m.seeds))].sort(), seeds: loads,
  };
}

/** The LOAD-BEARING row from the seeds, the census records and what the daemon loads. */
export function loadBearingRow({ seeds, records, daemon, cap = DEAD_SHARE_CAP }) {
  const d = daemon || { entries: [...DAEMON_ENTRIES], entriesPresent: [], closure: 0, reader: 'not read', named: [], metas: 0, kinds: {}, metaSeeds: [], seeds: [] };
  const loads = new Set(d.seeds);
  const per = seeds.map((s) => {
    const c = censusFor(s, records);
    const p = c.pick;
    const deadShare = p ? Math.round((1 - p.loadBearing / p.loaded) * 1e6) / 1e6 : null;
    return {
      seed: s.seed, deadShare, loadedByDaemon: loads.has(s.seed), records: c.records, counted: c.counted, stale: c.stale,
      census: p ? { file: p.file, at: p.at, isTheBar: p.isTheBar, by: p.by, loaded: p.loaded, loadBearing: p.loadBearing, mode: p.mode } : null,
    };
  });
  const noCensus = per.filter((p) => !p.census);
  const overCap = per.filter((p) => p.loadedByDaemon && p.deadShare > cap);
  const ok = seeds.length > 0 && noCensus.length === 0 && overCap.length === 0;
  const counted = per.filter((p) => p.census);
  const worst = counted.slice().sort((a, b) => b.deadShare - a.deadShare || byName(a.seed, b.seed))[0] || null;
  const best = counted.slice().sort((a, b) => a.deadShare - b.deadShare || byName(a.seed, b.seed))[0] || null;
  const byHash = counted.filter((p) => p.census.by === 'hash').length;
  const fromBar = counted.filter((p) => p.census.isTheBar).length;
  const capPct = String(Math.round(cap * 10000) / 100);
  const short = (s) => s.slice('organism/'.length);
  const why = (p) => short(p.seed) + (p.records === 0 ? ' (no census names it)' : p.counted === 0 ? ' (' + p.records + ' census record(s), none with a loaded and a load-bearing count)' : ' (every census with a count is stale: ' + p.stale.join(', ') + ')');
  const shareText = (s) => { const p = per.find((x) => x.seed === s); return p && p.census ? pct2(p.deadShare) + '%' : 'no census'; };
  const daemonText = 'the daemon loads ' + loads.size + ' of ' + seeds.length
    + (loads.size ? ' (' + [...loads].map((s) => short(s) + ' ' + shareText(s)).join(', ') + ')' : '')
    + ': the ' + d.closure + ' modules its entries ' + d.entries.join(', ') + ' can import (' + d.entriesPresent.length + ' of ' + d.entries.length + ' entries in this tree), read by ' + d.reader
    + ', name ' + (d.named.length ? d.named.length + ' seed path(s) (' + d.named.map((h) => h.file + ':' + h.line + ' ' + short(h.seed)).join(', ') + ')' : 'no seed by path')
    + ', and the ' + d.metas + ' checkpoint metas under the state directories (kind ' + (Object.entries(d.kinds).map(([k, n]) => k + ' ' + n).join(', ') || 'none') + ') name ' + (d.metaSeeds.length ? d.metaSeeds.map(short).join(', ') : 'no seed')
    + (loads.size ? '' : ', so the ' + capPct + ' percent cap binds no seed');
  const line = 'LOAD-BEARING ' + (ok ? 'GREEN' : 'RED') + ': '
    + (seeds.length === 0 ? 'no emitted seed under organism/, so nothing was measured; '
      : counted.length + ' of ' + seeds.length + ' emitted seeds under organism/ have a census on disk that still describes them (' + byHash + ' by manifest hash, ' + (counted.length - byHash) + ' written after the manifest last changed; ' + fromBar + ' from a bar census, ' + (counted.length - fromBar) + ' from a narrow run)'
        + (noCensus.length ? ', ' + noCensus.length + ' have none: ' + noCensus.map(why).join(', ') : '')
        + (worst ? '; dead share (1 - load-bearing lines / loaded lines) from ' + pct2(best.deadShare) + '% (' + short(best.seed) + ') to ' + pct2(worst.deadShare) + '% (' + short(worst.seed) + ')' : '') + '; ')
    + daemonText
    + (overCap.length ? '; over the ' + capPct + ' percent cap and loaded: ' + overCap.map((p) => short(p.seed) + ' ' + pct2(p.deadShare) + '%').join(', ') : '')
    + (seeds.length ? '; every seed: ' + per.map((p) => short(p.seed) + ' ' + (p.census ? pct2(p.deadShare) + '% (' + p.census.file + (p.census.mode === 'static' ? ', static: a lower bound on the dead share' : p.census.mode ? ', ' + p.census.mode : '') + ')' : 'no census')).join(', ') : '');
  return { ok, cap, seeds: seeds.length, counted: counted.length, noCensus: noCensus.map((p) => p.seed), overCap: overCap.map((p) => p.seed), daemon: d, per, line };
}

// ---------------------------------------------------------------- BOUNDARY: every structured clone under the cap, every one listed
/** A static scan of the tree now against the audit's allowlist, when the audit can be loaded. */
export async function liveBoundaryScan(root = ROOT) {
  const A = await auditModule();
  if (!A.mod || typeof A.mod.scanTree !== 'function' || typeof A.mod.checkAllowlist !== 'function') return { ran: false, error: A.error || 'tools/boundary-audit.mjs exports no scanTree' };
  try {
    const found = A.mod.scanTree(root);
    const c = A.mod.checkAllowlist(found);
    return { ran: true, found: found.length, listed: Array.isArray(A.mod.ALLOWLIST) ? A.mod.ALLOWLIST.length : null, unlisted: c.unlisted.map((b) => b.key), stale: c.stale.map((a) => a.key), overCap: c.overCap.map((a) => a.key) };
  } catch (e) { return { ran: false, error: String((e && e.message) || e).split('\n')[0] }; }
}

/** The BOUNDARY row from bench/verdicts/boundary.json (parsed, or null) and a live scan (or null). */
export function boundaryRow(v, { live = null, file = 'bench/verdicts/boundary.json' } = {}) {
  const liveText = !live ? 'no scan of the tree now was run'
    : live.ran ? 'a static scan of the tree now finds ' + live.found + ' boundaries against ' + live.listed + ' listed: unlisted ' + live.unlisted.length + (live.unlisted.length ? ' (' + live.unlisted.join('; ') + ')' : '') + ', stale ' + live.stale.length
    : 'no scan of the tree now (' + live.error + ')';
  const liveUnlisted = live && live.ran ? live.unlisted : [];
  const table = v && Array.isArray(v.table) ? v.table : null;
  const cap = v && typeof v.cap === 'number' && Number.isFinite(v.cap) ? v.cap : null;
  if (!v || !table || cap === null) {
    const what = !v ? file + ' is not on disk or does not parse' : file + ' carries no ' + (!table ? 'table' : 'cap');
    return { ok: false, measured: false, liveUnlisted, line: 'BOUNDARY RED: not measured: ' + what + ' (node tools/boundary-audit.mjs --bar writes it), so no boundary is known to be under the cap; ' + liveText };
  }
  const fin = (x) => typeof x === 'number' && Number.isFinite(x);
  const over = table.filter((r) => (fin(r.afterBytes) && r.afterBytes >= cap) || r.underCap === false);
  const unmeasured = table.filter((r) => !fin(r.afterBytes));
  const allow = v.allowlist && typeof v.allowlist === 'object' ? v.allowlist : null;
  const recUnlisted = allow && Array.isArray(allow.unlisted) ? allow.unlisted : null;
  const allowOver = allow && Array.isArray(allow.overCap) ? allow.overCap : [];
  const wire = table.filter((r) => (fin(r.afterWire) && r.afterWire >= cap) || r.wireUnderCap === false).sort((a, b) => (b.afterWire || 0) - (a.afterWire || 0));
  const views = table.filter((r) => fin(r.afterWasmViews) && r.afterWasmViews > 0);
  const partial = v.isTheBar !== true;
  const how = {};
  for (const r of table) how[r.how || 'unrecorded'] = (how[r.how || 'unrecorded'] || 0) + 1;
  const largest = table.filter((r) => fin(r.afterBytes)).sort((a, b) => b.afterBytes - a.afterBytes)[0] || null;
  const ok = !partial && over.length === 0 && unmeasured.length === 0 && allowOver.length === 0 && recUnlisted !== null && recUnlisted.length === 0 && liveUnlisted.length === 0;
  const keyOf = (x) => (typeof x === 'string' ? x : x && x.key) || '?';
  const at = (r) => r.file + ':' + r.line;
  const line = 'BOUNDARY ' + (ok ? 'GREEN' : 'RED') + ': ' + table.length + ' boundaries in ' + file + (partial ? ' (PARTIAL: isTheBar ' + v.isTheBar + ')' : ' (isTheBar true, ' + v.at + ')')
    + ', measured ' + Object.entries(how).map(([k, n]) => k + ' ' + n).join(', ') + ', not measured ' + unmeasured.length + (unmeasured.length ? ' (' + unmeasured.map(at).join(', ') + ')' : '')
    + '; ' + over.length + ' carried copied buffers at or over the ' + cap + ' byte cap' + (over.length ? ' (' + over.map((r) => at(r) + ' ' + r.afterBytes + ' bytes').join(', ') + ')' : '')
    + (largest ? ' (largest copied ' + largest.afterBytes + ' bytes at ' + at(largest) + ')' : '')
    + ', allowlist entries over it ' + allowOver.length + (allowOver.length ? ' (' + allowOver.map(keyOf).join('; ') + ')' : '')
    + '; unlisted in the verdict ' + (recUnlisted === null ? 'not recorded' : recUnlisted.length + (recUnlisted.length ? ' (' + recUnlisted.map(keyOf).join('; ') + ')' : '')) + ', and ' + liveText
    + '; views on a wasm heap ' + views.length
    + '; on the wire (strings included, reported by the audit and not its cap measure) ' + wire.length + ' reached the cap' + (wire.length ? ': ' + wire.map((r) => at(r) + ' ' + r.afterWire + ' bytes').join(', ') : '');
  return { ok, measured: true, partial, at: v.at || null, cap, boundaries: table.length, how, unmeasured: unmeasured.map(at), overCap: over.map(at), allowOverCap: allowOver.map(keyOf), unlisted: recUnlisted === null ? null : recUnlisted.map(keyOf), liveUnlisted, live, overCapWire: wire.map((r) => ({ at: at(r), bytes: r.afterWire })), wasmViews: views.map(at), largest: largest ? { at: at(largest), bytes: largest.afterBytes } : null, line };
}

// ---------------------------------------------------------------- the gate
async function main() {
  const args = new Set(process.argv.slice(2));
  // the rows item verdict (node bench/ladder.mjs --rows) refuses a gate run that started before
  // a file it grades last changed, so the start is recorded, not only the end
  const startedAt = new Date().toISOString();
  const files = walk(ROOT);
  const rel = (p) => relTo(ROOT, p);
  console.log('gate: free RAM ' + Math.round(os.freemem() / MB) + ' MB at start; each test file waits for ' + GATE_CAPS.waitFreeRamMb + ' MB free before it starts');

  // 1. tests, one process per file so a crash in one cannot hide another, each under the budget
  const testFiles = files.filter(f => /[\\/]test[\\/].*\.test\.mjs$/.test(f)).sort();
  const tests = [];
  for (const f of testFiles) {
    const { row: res, out } = await runTestFile(f);
    if (res.exit !== 0 && !args.has('--quiet')) console.log(out.split('\n').filter(l => /✖|Error|assert|expected|actual|BUDGET/.test(l)).slice(0, 40).join('\n'));
    tests.push(res);
    const b = res.budget;
    console.log(`${res.exit === 0 ? 'PASS' : 'FAIL'} ${res.file} pass=${res.pass} fail=${res.fail} ${res.ms}ms rss ${b.maxProcs > 0 ? b.peakRssMb + 'MB' : 'unsampled'} dir ${b.peakDirBytes ?? 0}B${b.outcome !== 'exit' ? ' BUDGET ' + b.outcome + (b.killed ? ' ' + b.killed : '') : ''}`);
  }

  // 2. line counts by area (code and prose separately; only wc-style physical lines).
  // organism/ holds emitted organism source (one cell or edge per line, written by the
  // genome emitter) and is counted apart as generated, never mixed into authored code.
  const counts = {};
  let codeLines = 0, proseLines = 0, codeFiles = 0, generatedLines = 0, generatedFiles = 0;
  for (const f of files) {
    const r = rel(f);
    if (!/\.(mjs|js|html|md|json|jsonl)$/.test(r)) continue;
    const lines = readFileSync(f, 'utf8').split('\n').length;
    const area = r.split('/')[0].replace(/\..*$/, '') || 'root';
    counts[area] = (counts[area] || 0) + lines;
    if (r.startsWith('organism/')) { generatedLines += lines; generatedFiles++; }
    else if (/\.(mjs|js|html)$/.test(r)) { codeLines += lines; codeFiles++; }
    else proseLines += lines;
  }

  // 3. prose checks: no em-dashes anywhere in prose or code comments. The character is
  // written as an escape so this file never carries one itself. MANUAL.md section A and the
  // files under manual/ are his text verbatim and are never edited, so they are exempt.
  const emDash = [];
  const hisText = (f) => /MANUAL\.md$/.test(f) || /[\\/]manual[\\/]/.test(f);
  for (const f of files) if (/\.(mjs|js|md|html)$/.test(f) && !hisText(f) && readFileSync(f, 'utf8').includes(String.fromCharCode(0x2014))) emDash.push(rel(f));

  // 4. dependency check: no bare-specifier imports except node: builtins
  const badImports = [];
  for (const f of files) if (/\.mjs$/.test(f)) {
    const src = readFileSync(f, 'utf8');
    const specs = [];
    for (const m of src.matchAll(/^\s*(?:import|export)\b[^;]*?(?<!['"\w])from\s*['"]([^'"]+)['"]/gm)) specs.push(m[1]); // a quoted "from" key inside exported JSON is data, not an import
    for (const m of src.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) specs.push(m[1]);
    for (const m of src.matchAll(/\bimport\(\s*['"]([^'"]+)['"]/g)) specs.push(m[1]);
    for (const spec of specs) {
      if (/[ ()+]/.test(spec)) continue; // a specifier never holds a space, a parenthesis or a plus: this is a string literal that spells an import call (test/boundary.test.mjs:132), not an import
      if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('node:') || spec.startsWith('file:')) continue;
      badImports.push(rel(f) + ' -> ' + spec);
    }
  }

  // 5. every notes/ request must be answered or open (informational)
  const notes = existsSync(path.join(ROOT, 'notes')) ? readdirSync(path.join(ROOT, 'notes')).map(n => 'notes/' + n) : [];

  // 6. the five rows. A row that throws is RED with its error, never a crashed gate.
  const guarded = async (label, f) => { try { return await f(); } catch (e) { return { ok: false, error: String((e && e.message) || e).split('\n')[0], line: label + ' RED: the row threw: ' + String((e && e.message) || e).split('\n')[0] }; } };
  const rows = {
    budget: budgetRow(tests),
    compress: compressRow(compressRecords()),
    hisData: hisDataRow(fixtureCoverage(path.join(ROOT, 'bench', 'fixtures'))),
    loadBearing: await guarded('LOAD-BEARING', async () => {
      const seeds = emittedSeeds(ROOT);
      return loadBearingRow({ seeds, records: censusRecords(path.join(ROOT, 'bench', 'verdicts')), daemon: await daemonLoads({ root: ROOT, seeds }) });
    }),
    boundary: await guarded('BOUNDARY', async () => {
      let v = null; try { v = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'boundary.json'), 'utf8')); } catch { v = null; }
      return boundaryRow(v, { live: await liveBoundaryScan(ROOT) });
    }),
  };

  const rowsPass = rows.budget.ok && rows.compress.ok && rows.hisData.ok && rows.loadBearing.ok && rows.boundary.ok;
  const allPass = tests.every(t => t.exit === 0) && emDash.length === 0 && badImports.length === 0 && rowsPass;
  const verdict = {
    at: new Date().toISOString(), startedAt, node: process.version, command: 'node bench/gate.mjs' + (args.has('--quiet') ? ' --quiet' : ''),
    tests, testsPassed: tests.filter(t => t.exit === 0).length, testsTotal: tests.length,
    assertionsPassed: tests.reduce((a, t) => a + (t.pass || 0), 0), assertionsFailed: tests.reduce((a, t) => a + (t.fail || 0), 0),
    lines: { code: codeLines, prose: proseLines, codeFiles, generated: generatedLines, generatedFiles, byArea: counts },
    emDash, badImports, notes,
    rows: { budget: rows.budget, compress: rows.compress, hisData: rows.hisData, loadBearing: rows.loadBearing, boundary: rows.boundary },
    verdict: allPass ? 'GREEN' : 'RED',
  };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', 'gate.json'), JSON.stringify(verdict, null, 2));
  console.log('');
  console.log(rows.budget.line);
  console.log(rows.compress.line);
  console.log(rows.hisData.line);
  console.log(rows.loadBearing.line);
  console.log(rows.boundary.line);
  const gr = (r) => (r.ok ? 'GREEN' : 'RED');
  console.log(`\nGATE ${verdict.verdict}: test files ${verdict.testsPassed}/${verdict.testsTotal}, assertions ${verdict.assertionsPassed} pass / ${verdict.assertionsFailed} fail, authored code lines ${codeLines} in ${codeFiles} files, prose lines ${proseLines}, generated organism lines ${generatedLines} in ${generatedFiles} files, em-dash files ${emDash.length}, bad imports ${badImports.length}, budget ${gr(rows.budget)}, compress ${gr(rows.compress)}, his data ${gr(rows.hisData)}, load-bearing ${gr(rows.loadBearing)}, boundary ${gr(rows.boundary)}`);
  if (emDash.length) console.log('em-dashes in: ' + emDash.join(', '));
  if (badImports.length) console.log('bad imports: ' + badImports.join(', '));
  // gate.json is written above, synchronously, before this line can end the process
  process.exit(allPass ? 0 : 1);
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
