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
// TWO MORE (Board 15, his 14:29 "it should be able to finish undone work"), printed last:
//
//   AUTONOMY  the loop that finishes undone work, read off the installation: state/self/gaps.jsonl
//             under 48 h old, every gap of kinds missed, ladder, gate red and gate slow carrying a
//             trial whose bench file exists, the BrainAutopilot task registered and Ready (schtasks
//             /query, read only; not registered prints the register command), state/self/STOP
//             absent (present prints "stopped by hand"), and the newest decision file under
//             bench/verdicts/autopilot/ under 48 h old. Prints the counts and every cause.
//   HANDOFF   docs/HANDOFF.md on disk, generated under 48 h ago by its own footer, every command it
//             lists existing (a script file, an executable on PATH, a registered task), and its
//             undone counts by kind equal to the ledger's. Prints every cause.
//             Both rows are graded only on the installation (the tree BrainAutopilot runs in) and
//             print N/A on any copy or plant; while a live autopilot holds its lock they are
//             printed as referees and do not rule (see the block above autonomyRow).
//
// ONE MORE (Board 13, RULES (1): a bar verdict names its split), printed last:
//
//   CONTAMINATION  every bench/verdicts/*.json with isTheBar true must carry a split object. RED for a
//             bar file with no split, a split that is not an object (a dataset split name such as
//             "evaluation"), or contaminated true with a statement that does not say so. Prints the
//             count of bar files, with a split object, contaminated and labelled, contaminated and
//             unlabelled, and every file behind a cause by name. A referee under a live autopilot
//             lock, like the two rows above (see the block above contaminationRow).
//
// ONE MORE (his 2026-09-26 20:20 "I wouldnt declare the project EVER over until the vision is 100 percent
// fulfilled" and 21:03 "after tonight 'Yes. we are close. No lies'"; docs/VISION.md order 9), printed last:
//
//   VISION    docs/VISION.md section 3 lists every order he gave with a status word; tools/vision-count.mjs
//             counts them. The row prints the counter's line, rules RED when section 4 retypes a different
//             count (the typed count can never drift from the list) or an order has no status word, and
//             prints "reached" true only when MET equals the total. It never rules RED for an unfinished
//             vision: the count is the report, the drift is the defect. N/A on a tree with no document
//             or no counter (the gate copied alone into a fixture tree).
//
//   node bench/gate.mjs [--quiet]
//   node bench/gate.mjs --contamination      the CONTAMINATION row alone, no test run, no gate.json
//   node bench/gate.mjs --vision             the VISION row alone, no test run, no gate.json
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
const VISION_MOD = await loaded('../tools/vision-count.mjs');
const budget = BUDGET_MOD.mod ? BUDGET_MOD.mod.budget : null;
const readCheckpointHeader = PERSIST_MOD.mod ? PERSIST_MOD.mod.readCheckpointHeader : null;
/** Why a sibling could not be loaded (null when it was). */
export const MISSING = Object.freeze({ budget: BUDGET_MOD.error, persist: PERSIST_MOD.error, vision: VISION_MOD.error });

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
// A fixture the tree generates itself (a SOURCES.md line saying 'generated by node <file>.mjs', the file present in the tree) is the organism's own data, not his: covered without a licence token.
export const GENERATED_RE = /\bgenerated by node ([\w./-]+\.mjs)\b/i;
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
            const gen = !lic && isFile ? line.match(GENERATED_RE) : null;
            if (gen && existsSync(path.join(ROOT, ...gen[1].split('/')))) { by = { sources: relTo(root, s.file), line: i + 1, licence: 'generated by ' + gen[1], inherited: false, named: n, generated: true }; break; }
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

// ---------------------------------------------------------------- AUTONOMY and HANDOFF: the installation, read (Board 15)
// Both rows read the machine this tree is installed on (a scheduled task, the gap ledger, the
// decision files, docs/HANDOFF.md). They are GRADED only on the installation: the tree the
// registered BrainAutopilot task runs in (its "Task To Run" names it: cmd /c cd /d <tree> && ...),
// or, when no such task is registered, a tree that carries both .git and state/self. On any other
// tree (a copy the improve, prune or brief operators gate, a planted fixture, a cloud checkout) they
// print N/A and hold nothing. On the installation they are REFEREES, not rulers, while a live
// autopilot holds state/self-code/autopilot.lock: that gate is the autopilot deciding whether to
// keep a patch, no patch can move what these rows read, and a ruling red row there would revert
// every patch. The row is still computed and printed in full, marked as not ruling.
export const AUTONOMY_TASK = 'BrainAutopilot';
export const AUTONOMY_KINDS = Object.freeze(['missed', 'ladder', 'gate red', 'gate slow']);
/** The gap ids the ledger writes for these rows themselves: a red row must not be its own cause. */
export const ROW_ECHO_GAPS = Object.freeze(['gate-red:row:autonomy', 'gate-red:row:handoff']);
export const FRESH_HOURS = 48;
export const LEDGER_REL = 'state/self/gaps.jsonl';
export const DECISIONS_REL = 'bench/verdicts/autopilot';
export const STOP_REL = 'state/self/STOP';
export const LOCK_REL = 'state/self-code/autopilot.lock';
export const HANDOFF_REL = 'docs/HANDOFF.md';
export const REGISTER_CMD = 'node tools/schedule-autopilot.mjs --register';
const hoursSince = (ms, now) => Math.round((now - ms) / 36e5 * 10) / 10;

/** schtasks /query /tn name /fo LIST /v; {status, out, err}. Read only: nothing here writes a task. */
export function queryTask(name) {
  const r = spawnSync('schtasks', ['/query', '/tn', name, '/fo', 'LIST', '/v'], { encoding: 'utf8', windowsHide: true });
  if (r.error) return { status: -1, out: '', err: String(r.error.message) };
  return { status: r.status, out: String(r.stdout || ''), err: String(r.stderr || '').trim() };
}
/** The labelled fields of schtasks /FO LIST output (the first of each label). */
export function parseTaskFields(out) {
  const f = {};
  for (const line of String(out || '').split(/\r?\n/)) {
    const m = /^([A-Za-z][A-Za-z :/()]*?):\s+(.*)$/.exec(line);
    if (m && !(m[1].trim() in f)) f[m[1].trim()] = m[2].trim();
  }
  return f;
}
/** One task, read: {name, registered, status, state, taskToRun, why}. */
export function taskOf(name, taskQuery = queryTask) {
  let r;
  try { r = taskQuery(name); } catch (e) { r = { status: -1, out: '', err: String((e && e.message) || e) }; }
  if (!r || r.status !== 0) return { name, registered: false, status: null, state: null, taskToRun: null, why: 'schtasks /query exited ' + (r ? r.status : 'null') + (r && r.err ? ': ' + String(r.err).split('\n')[0] : '') };
  const f = parseTaskFields(r.out);
  return { name, registered: true, status: f.Status || null, state: f['Scheduled Task State'] || null, taskToRun: f['Task To Run'] || null, why: null };
}
/** The tree a task's "Task To Run" changes into (cmd /c cd /d <tree> && ...), or null. */
export function taskRootOf(taskToRun) {
  const m = /\bcd\s+\/d\s+("?)([^"&]+?)\1\s*&&/i.exec(String(taskToRun || ''));
  return m ? m[2].trim() : null;
}
const sameDir = (a, b) => path.resolve(a).replace(/[\\/]+$/, '').toLowerCase() === path.resolve(b).replace(/[\\/]+$/, '').toLowerCase();
/** Is this tree the installation? {installed, how, taskRoot, why}. */
export function installationOf({ root = ROOT, task = null } = {}) {
  const taskRoot = task && task.registered ? taskRootOf(task.taskToRun) : null;
  if (taskRoot) {
    const installed = sameDir(root, taskRoot);
    return { installed, how: 'task', taskRoot, why: installed ? 'the tree ' + AUTONOMY_TASK + ' runs in' : 'not the tree ' + AUTONOMY_TASK + ' runs in (' + taskRoot + ')' };
  }
  const git = existsSync(path.join(root, '.git')), state = existsSync(path.join(root, 'state', 'self'));
  const installed = git && state;
  return { installed, how: 'tree', taskRoot: null, why: (task && task.registered ? AUTONOMY_TASK + ' names no tree (Task To Run: ' + task.taskToRun + ')' : AUTONOMY_TASK + ' is not registered') + ', and this tree ' + (installed ? 'carries .git and state/self' : 'lacks ' + [git ? null : '.git', state ? null : 'state/self'].filter(Boolean).join(' and ')) };
}
export function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}
/** A live autopilot holding the lock makes these rows referees: {referee, holder, why}. */
export function refereeOf(root = ROOT, { alive = pidAlive } = {}) {
  let j = null;
  try { j = JSON.parse(readFileSync(path.join(root, ...LOCK_REL.split('/')), 'utf8')); } catch { j = null; }
  if (!j) return { referee: false, holder: null, why: 'no ' + LOCK_REL };
  if (!alive(j.pid)) return { referee: false, holder: j, why: LOCK_REL + ' is stale (pid ' + j.pid + ' is not running)' };
  return { referee: true, holder: j, why: 'autopilot pid ' + j.pid + ' holds ' + LOCK_REL + ' since ' + j.at };
}
function readLedger(root) {
  const f = path.join(root, ...LEDGER_REL.split('/'));
  let text, st;
  try { st = statSync(f); text = readFileSync(f, 'utf8'); } catch { return null; }
  const rows = []; let bad = 0;
  for (const l of text.split('\n')) { if (!l.trim()) continue; try { rows.push(JSON.parse(l)); } catch { bad++; } }
  return { rows, bad, mtimeMs: st.mtimeMs };
}
/** The file a gap's trial runs: trial.bench, else the first script in its argv or command. */
export function trialBenchOf(g) {
  const t = g && g.trial;
  if (!t) return null;
  if (typeof t === 'object' && typeof t.bench === 'string' && t.bench) return t.bench;
  const toks = typeof t === 'string' ? t.split(/\s+/) : Array.isArray(t.argv) ? t.argv.map(String) : String(t.command || '').split(/\s+/);
  const s = toks.find((x) => /\.(mjs|cjs|js)$/i.test(x) && !x.startsWith('<') && !/tools[\\/]budget\.mjs$/.test(x));
  return s || null;
}
/** The newest decision file (*.jsonl) under bench/verdicts/autopilot/, by mtime, or null. */
function newestDecision(root) {
  const dir = path.join(root, ...DECISIONS_REL.split('/'));
  let names; try { names = readdirSync(dir).filter((n) => n.endsWith('.jsonl')); } catch { return { files: null, newest: null }; }
  let newest = null;
  for (const n of names) { try { const m = statSync(path.join(dir, n)).mtimeMs; if (!newest || m > newest.mtimeMs) newest = { name: n, mtimeMs: m }; } catch { /* gone */ } }
  return { files: names.length, newest };
}
const notGraded = (label, inst, extra = {}) => ({ ok: true, graded: false, rules: false, installation: inst, ...extra, line: label + ' N/A: ' + inst.why + '; the row grades only the installation (the tree ' + AUTONOMY_TASK + ' runs in), so this tree holds nothing' });
const headOf = (label, ok, ref) => label + ' ' + (ok ? 'GREEN' : 'RED') + (ref && ref.referee ? ' (REFEREE, not ruling: ' + ref.why + ')' : '') + ': ';

/**
 * AUTONOMY: GREEN when the ledger is under 48 h old, every gap of kinds missed, ladder, gate red
 * and gate slow has a trial whose bench file exists, BrainAutopilot is registered and Ready
 * (Running is also taken as working, and printed), state/self/STOP is absent, and the newest
 * decision file is under 48 h old. Every cause is printed. Injectable: task, now, alive.
 */
export function autonomyRow({ root = ROOT, now = Date.now(), task = null, taskQuery = queryTask, alive = pidAlive } = {}) {
  const t = task || taskOf(AUTONOMY_TASK, taskQuery);
  const inst = installationOf({ root, task: t });
  if (!inst.installed) return notGraded('AUTONOMY', inst, { task: t });
  const ref = refereeOf(root, { alive });
  const causes = [];
  const L = readLedger(root);
  let ledgerAgeH = null;
  const graded = [], withTrial = [], noTrial = [], noBench = [], echoes = [];
  if (!L) causes.push(LEDGER_REL + ' is not on disk (node self/gaps.mjs writes it)');
  else {
    ledgerAgeH = hoursSince(L.mtimeMs, now);
    if (ledgerAgeH >= FRESH_HOURS) causes.push(LEDGER_REL + ' is ' + ledgerAgeH + ' h old (the bar is under ' + FRESH_HOURS + ' h; node self/gaps.mjs rewrites it)');
    if (L.bad) causes.push(L.bad + ' ledger line(s) do not parse');
    for (const g of L.rows) {
      if (!AUTONOMY_KINDS.includes(g.kind)) continue;
      if (ROW_ECHO_GAPS.includes(g.id)) { echoes.push(g.id); continue; }
      graded.push(g);
      const b = trialBenchOf(g);
      if (!b) noTrial.push(g.id);
      else if (!existsSync(path.isAbsolute(b) ? b : path.join(root, ...b.split(/[\\/]/)))) noBench.push(g.id + ' (' + b + ')');
      else withTrial.push(g.id);
    }
    if (noTrial.length) causes.push(noTrial.length + ' gap(s) with no trial: ' + noTrial.join(', '));
    if (noBench.length) causes.push(noBench.length + ' gap(s) whose trial bench file is missing: ' + noBench.join(', '));
  }
  const working = t.registered && (t.status === 'Ready' || t.status === 'Running') && t.state !== 'Disabled';
  if (!t.registered) causes.push(AUTONOMY_TASK + ' is not registered (' + t.why + '); ' + REGISTER_CMD + ' registers it');
  else if (!working) causes.push(AUTONOMY_TASK + ' is registered but ' + (t.state === 'Disabled' ? 'Disabled' : 'its status is ' + (t.status || 'unreadable')) + ' (Ready is the bar)');
  const stopped = existsSync(path.join(root, ...STOP_REL.split('/')));
  if (stopped) causes.push('stopped by hand (' + STOP_REL + ' is present; delete it to let the loop run)');
  const D = newestDecision(root);
  const decAgeH = D.newest ? hoursSince(D.newest.mtimeMs, now) : null;
  if (D.files === null) causes.push(DECISIONS_REL + '/ is not on disk: no decision was ever written');
  else if (!D.newest) causes.push('no decision file (*.jsonl) under ' + DECISIONS_REL + '/');
  else if (decAgeH >= FRESH_HOURS) causes.push('the newest decision file ' + D.newest.name + ' is ' + decAgeH + ' h old (the bar is under ' + FRESH_HOURS + ' h)');
  const ok = causes.length === 0;
  const byKind = {};
  for (const g of graded) byKind[g.kind] = (byKind[g.kind] || 0) + 1;
  const line = headOf('AUTONOMY', ok, ref)
    + (L ? 'ledger ' + L.rows.length + ' gaps, ' + ledgerAgeH + ' h old; kinds missed, ladder, gate red, gate slow: ' + graded.length + ' (' + AUTONOMY_KINDS.map((k) => k + ' ' + (byKind[k] || 0)).join(', ') + '), ' + withTrial.length + ' with a trial whose bench file exists, ' + noTrial.length + ' with no trial, ' + noBench.length + ' with a missing bench' + (echoes.length ? '; excluded as echoes of this gate row itself: ' + echoes.join(', ') : '') : 'ledger not measured')
    + '; ' + AUTONOMY_TASK + ' ' + (t.registered ? 'registered, status ' + (t.status || 'unreadable') + (t.state ? ', ' + t.state : '') : 'NOT REGISTERED')
    + '; ' + STOP_REL + ' ' + (stopped ? 'PRESENT' : 'absent')
    + '; newest decision file ' + (D.newest ? D.newest.name + ', ' + decAgeH + ' h old, of ' + D.files : 'none')
    + '; installation: ' + inst.why
    + (causes.length ? '; CAUSES (' + causes.length + '): ' + causes.join('; ') : '');
  return { ok, graded: true, rules: !ref.referee, referee: ref, installation: inst, task: t, ledger: L ? { gaps: L.rows.length, ageHours: ledgerAgeH, unparsed: L.bad } : null, kinds: byKind, withTrial: withTrial.length, noTrial, noBench, echoes, stopped, newestDecision: D.newest ? { file: D.newest.name, ageHours: decAgeH, files: D.files } : null, causes, line };
}

// the command lines a markdown file lists: every non-empty line of a fenced block, and every inline
// code span that starts with an executable
const CMD_EXES = /^(node|npx|git|gh|schtasks|powershell|cmd|cmd\.exe)\b/i;
export function commandsIn(md) {
  const out = []; let fenced = false;
  for (const l of String(md).split('\n')) {
    if (l.trimStart().startsWith('```')) { fenced = !fenced; continue; }
    if (fenced) { if (l.trim()) out.push(l.trim()); continue; }
    for (const m of l.matchAll(/`([^`]+)`/g)) if (CMD_EXES.test(m[1].trim())) out.push(m[1].trim());
  }
  return [...new Set(out)];
}
// the same parse tools/handoff.mjs checksOf makes (script paths, executables, task names), kept
// here because this file is copied alone into planted trees where tools/ is absent
const SCRIPT_TOKEN = /\.(mjs|cjs|js|exe|cmd)$/i;
const CHECK_EXES = new Set(['node', 'npx', 'git', 'gh', 'schtasks', 'powershell', 'cmd', 'cmd.exe']);
export function checksOfLine(line) {
  const checks = [], seen = new Set();
  const add = (c) => { const k = c.kind + ':' + c.name; if (!seen.has(k)) { seen.add(k); checks.push(c); } };
  const toks = String(line).split(/\s+/).map((x) => x.replace(/^[("']+|[)"';,]+$/g, '')).filter(Boolean);
  toks.forEach((x, i) => {
    const lx = x.toLowerCase();
    if (i === 0 && CHECK_EXES.has(lx)) add({ kind: 'exe', name: lx.replace(/\.exe$/, '') });
    else if (lx === 'node' || lx === 'git' || lx === 'gh' || lx === 'npx') add({ kind: 'exe', name: lx });
    else if (SCRIPT_TOKEN.test(x) && !x.startsWith('<') && !x.startsWith('--')) add(/^cmd(\.exe)?$/i.test(x) ? { kind: 'exe', name: 'cmd' } : { kind: 'file', name: x });
  });
  const tn = toks.findIndex((x) => /^\/tn$/i.test(x));
  if (/^schtasks$/i.test(toks[0] || '') && tn >= 0 && toks[tn + 1] && !toks.some((x) => /^\/create$/i.test(x))) add({ kind: 'task', name: toks[tn + 1] });
  return checks;
}
export function whichExe(exe) {
  const r = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', [exe], { encoding: 'utf8', windowsHide: true });
  return r.status === 0 && String(r.stdout || '').trim() ? String(r.stdout).split(/\r?\n/)[0].trim() : null;
}
/** "### kind (n)" headings and their "- `" bullets under "## WHAT IS UNDONE". */
export function undoneCountsIn(md) {
  const lines = String(md).split('\n');
  const start = lines.indexOf('## WHAT IS UNDONE');
  const headings = {}, bullets = {};
  if (start < 0) return { found: false, headings, bullets };
  let kind = null;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('## ')) break;
    const h = /^### (.+) \((\d+)\)$/.exec(l);
    if (h) { kind = h[1]; headings[kind] = Number(h[2]); bullets[kind] = 0; continue; }
    if (kind && l.startsWith('- `')) bullets[kind]++;
  }
  return { found: true, headings, bullets };
}
/** The files the doc's COMMANDS CHECKED section names as still to be built by a board item. */
export function toBuildIn(md) {
  const lines = String(md).split('\n');
  const start = lines.indexOf('## COMMANDS CHECKED');
  const out = new Set();
  if (start < 0) return out;
  for (let i = start + 1; i < lines.length && !lines[i].startsWith('## '); i++) {
    const m = /runs (\S+), to be built by its board item/.exec(lines[i]);
    if (m) out.add(m[1].replace(/\\/g, '/'));
  }
  return out;
}

/**
 * HANDOFF: GREEN when docs/HANDOFF.md exists, its own footer says it was generated under 48 h ago,
 * every command it lists exists (each script as a file under the tree, each executable on PATH,
 * each task name registered, by schtasks /query only; a script the doc itself names as still to be
 * built is pending, not missing, when an undone board item in the ledger names it in its bar
 * command), and its undone counts by kind equal the ledger's. Every cause is printed.
 */
export function handoffRow({ root = ROOT, now = Date.now(), task = null, taskQuery = queryTask, which = whichExe, alive = pidAlive, checksOf = checksOfLine } = {}) {
  const t = task || taskOf(AUTONOMY_TASK, taskQuery);
  const inst = installationOf({ root, task: t });
  if (!inst.installed) return notGraded('HANDOFF', inst);
  const ref = refereeOf(root, { alive });
  const causes = [];
  let md = null;
  try { md = readFileSync(path.join(root, ...HANDOFF_REL.split('/')), 'utf8'); } catch { md = null; }
  if (md === null) {
    causes.push(HANDOFF_REL + ' is not on disk (node tools/handoff.mjs writes it)');
    return { ok: false, graded: true, rules: !ref.referee, referee: ref, installation: inst, exists: false, causes, line: headOf('HANDOFF', false, ref) + 'CAUSES (1): ' + causes[0] };
  }
  // the footer: "Generated <ISO> under: GATE ..."; the last such line wins
  const gens = [...md.matchAll(/^Generated (\S+) under:/gm)].map((m) => m[1]);
  const genAt = gens.length ? gens[gens.length - 1] : null;
  const genMs = genAt ? Date.parse(genAt) : NaN;
  const ageH = Number.isFinite(genMs) ? hoursSince(genMs, now) : null;
  if (ageH === null) causes.push('its footer carries no "Generated <time> under:" line, so its age is not measured');
  else if (ageH >= FRESH_HOURS) causes.push('generated ' + genAt + ', ' + ageH + ' h ago (the bar is under ' + FRESH_HOURS + ' h; node tools/handoff.mjs rewrites it)');
  // every command
  const L = readLedger(root);
  const building = toBuildIn(md);
  const boardTrials = L ? L.rows.filter((g) => g.kind === 'board item').map((g) => String(typeof g.trial === 'string' ? g.trial : (g.trial && g.trial.command) || '').replace(/\\/g, '/')) : [];
  const cmds = commandsIn(md);
  const taskCache = new Map(), whichCache = new Map();
  let checked = 0, placeholders = 0;
  const missing = [], pending = [];
  for (const c of cmds) for (const k of checksOf(c)) {
    if (k.kind === 'task' && /^</.test(k.name)) { placeholders++; continue; }
    checked++;
    let ok;
    if (k.kind === 'file') ok = existsSync(path.isAbsolute(k.name) || /^[A-Za-z]:[\\/]/.test(k.name) ? k.name : path.join(root, ...k.name.split(/[\\/]/)));
    else if (k.kind === 'exe') { if (k.name === 'node') ok = true; else { if (!whichCache.has(k.name)) whichCache.set(k.name, !!which(k.name)); ok = whichCache.get(k.name); } }
    else if (k.kind === 'task') { if (!taskCache.has(k.name)) taskCache.set(k.name, k.name === t.name ? t : taskOf(k.name, taskQuery)); ok = taskCache.get(k.name).registered; }
    else ok = false;
    if (ok) continue;
    const n = k.name.replace(/\\/g, '/');
    if (k.kind === 'file' && building.has(n) && boardTrials.some((s) => s.includes(n))) { if (!pending.includes(n)) pending.push(n); continue; }
    const m = k.kind + ' ' + k.name;
    if (!missing.includes(m)) missing.push(m);
  }
  if (missing.length) causes.push(missing.length + ' listed command(s) name something that does not exist: ' + missing.join(', '));
  // the undone counts against the ledger
  const U = undoneCountsIn(md);
  const want = {};
  if (L) for (const g of L.rows) { const k = String(g.kind || 'unknown'); want[k] = (want[k] || 0) + 1; }
  const kinds = [...new Set([...Object.keys(want), ...Object.keys(U.headings)])];
  const diffs = kinds.filter((k) => want[k] !== U.headings[k] || want[k] !== U.bullets[k]).map((k) => k + ' ledger ' + (want[k] ?? 0) + ' vs doc ' + (U.headings[k] ?? 'none') + (U.bullets[k] !== undefined && U.bullets[k] !== U.headings[k] ? ' (' + U.bullets[k] + ' listed)' : ''));
  const docTotal = Object.values(U.headings).reduce((a, b) => a + b, 0);
  if (!L) causes.push(LEDGER_REL + ' is not on disk, so the undone counts are not measured against it');
  else if (!U.found) causes.push('no "## WHAT IS UNDONE" section, so its undone counts are not measured');
  else if (diffs.length) causes.push('its undone counts differ from the ledger (doc ' + docTotal + ', ledger ' + L.rows.length + '): ' + diffs.join(', '));
  const ok = causes.length === 0;
  const line = headOf('HANDOFF', ok, ref)
    + HANDOFF_REL + ' generated ' + (genAt || 'at an unread time') + (ageH !== null ? ', ' + ageH + ' h ago' : '')
    + '; commands listed ' + cmds.length + ', ' + checked + ' checks (files under the tree, executables on PATH, tasks by schtasks /query), missing ' + missing.length + ', pending ' + pending.length + (pending.length ? ' (' + pending.join(', ') + ', named by an undone board item)' : '') + (placeholders ? ', placeholders skipped ' + placeholders : '')
    + '; undone ' + (U.found ? docTotal + ' in the doc' : 'not in the doc') + ' vs ' + (L ? L.rows.length + ' in the ledger' : 'ledger not measured') + ', kinds differing ' + diffs.length
    + (causes.length ? '; CAUSES (' + causes.length + '): ' + causes.join('; ') : '');
  return { ok, graded: true, rules: !ref.referee, referee: ref, installation: inst, exists: true, generatedAt: genAt, ageHours: ageH, commands: cmds.length, checks: checked, missing, pending, placeholders, undone: { doc: U.found ? docTotal : null, ledger: L ? L.rows.length : null, diffs }, causes, line };
}

// ---------------------------------------------------------------- CONTAMINATION: every bar file names its split (Board 13)
// RULES (1) of every board since Board 11: a verdict JSON carries a "split" object naming what was
// development and what was held out, and "contaminated": true with the reason when a held-out record
// was ever seen in development. Board 11's math bench developed on GSM8K TEST records (there is no
// train split on disk), so a held-out claim from those records would be a contaminated one; this row
// makes the rule a check instead of a sentence. It reads every bench/verdicts/*.json (the top level,
// as the rule names it) and grades the BAR files, those with isTheBar true:
//   RED  a bar file with no split at all;
//   RED  a bar file whose split is not an object: a string such as "evaluation" names the dataset's
//        own split, not what the run developed on and what it held out;
//   RED  a bar file marked contaminated (contaminated true anywhere in its split, or at its top level)
//        whose statement does not say so (no word beginning "contaminat" in it).
// A contaminated bar file whose statement says so is counted and is not a cause: the rule is that the
// reader is told, not that no bench may reuse a record. A file that does not parse is counted as
// unread, never as clean. The line prints the count of bar files, with a split object, contaminated
// and labelled, contaminated and unlabelled, and names every file behind a cause, so the orchestrator
// can decide about the older ones. Like AUTONOMY and HANDOFF it is a REFEREE, printed in full and not
// ruling, while a live autopilot holds state/self-code/autopilot.lock: no code patch that gate judges
// can move a verdict's split, and a ruling red row there would revert every patch.
export const CONTAMINATION_WORD = /contaminat/i;
const SPLIT_DEPTH = 4;
/** True when contaminated === true sits anywhere in the split (to a small depth). */
function markedContaminated(x, depth = 0) {
  if (!x || typeof x !== 'object' || depth > SPLIT_DEPTH) return false;
  if (x.contaminated === true) return true;
  return Object.values(x).some((y) => markedContaminated(y, depth + 1));
}
/** The shape of a verdict's split: object, none (absent or null), string, array or the typeof. */
export function splitShapeOf(v) {
  const s = v ? v.split : undefined;
  if (s === undefined || s === null) return 'none';
  if (Array.isArray(s)) return 'array';
  return typeof s === 'object' ? 'object' : typeof s;
}
/** One record per bench/verdicts/*.json: its name, whether it is a bar file, its split shape, and the contamination marks. */
export function contaminationRecords(verdictsDir = path.join(ROOT, 'bench', 'verdicts')) {
  let names; try { names = readdirSync(verdictsDir).filter((n) => n.endsWith('.json')).sort(); } catch { return { dir: verdictsDir, read: false, records: [] }; }
  const records = [];
  for (const file of names) {
    let v; try { v = JSON.parse(readFileSync(path.join(verdictsDir, file), 'utf8')); } catch { records.push({ file, unread: true, bar: null }); continue; }
    if (!v || typeof v !== 'object' || Array.isArray(v)) { records.push({ file, unread: false, bar: false, notAnObject: true }); continue; }
    const shape = splitShapeOf(v);
    const contaminated = v.contaminated === true || (shape === 'object' && markedContaminated(v.split));
    const labelled = contaminated && typeof v.statement === 'string' && CONTAMINATION_WORD.test(v.statement);
    records.push({ file, unread: false, bar: v.isTheBar === true, split: shape, splitValue: shape === 'string' ? v.split : undefined, contaminated, labelled });
  }
  return { dir: verdictsDir, read: true, records };
}
/** The CONTAMINATION row from contaminationRecords() and the referee (refereeOf, or { referee: false }). */
export function contaminationRow(census, { referee = { referee: false, why: 'not asked' } } = {}) {
  const recs = census && Array.isArray(census.records) ? census.records : [];
  const bars = recs.filter((r) => r.bar === true);
  const unread = recs.filter((r) => r.unread).map((r) => r.file);
  const withSplit = bars.filter((r) => r.split === 'object');
  const noSplit = bars.filter((r) => r.split === 'none').map((r) => r.file);
  const notObject = bars.filter((r) => r.split !== 'object' && r.split !== 'none');
  const labelled = bars.filter((r) => r.contaminated && r.labelled).map((r) => r.file);
  const unlabelled = bars.filter((r) => r.contaminated && !r.labelled).map((r) => r.file);
  const causes = [];
  if (noSplit.length) causes.push(noSplit.length + ' bar file(s) with no split: ' + noSplit.join(', '));
  if (notObject.length) causes.push(notObject.length + ' bar file(s) whose split is not an object: ' + notObject.map((r) => r.file + ' (' + r.split + (r.split === 'string' ? ' "' + String(r.splitValue).slice(0, 40) + '"' : '') + ')').join(', '));
  if (unlabelled.length) causes.push(unlabelled.length + ' bar file(s) contaminated with a statement that does not say so: ' + unlabelled.join(', '));
  const ok = causes.length === 0;
  const counts = { files: recs.length, unread: unread.length, bar: bars.length, withSplit: withSplit.length, noSplit: noSplit.length, splitNotObject: notObject.length, contaminated: labelled.length + unlabelled.length, labelled: labelled.length, unlabelled: unlabelled.length };
  const where = census && census.read === false ? 'no bench/verdicts directory' : counts.files + ' verdict files';
  const line = headOf('CONTAMINATION', ok, referee)
    + 'bar files (isTheBar true) ' + counts.bar + ' of ' + where + (counts.bar ? '' : ', so nothing was graded')
    + ', with a split object ' + counts.withSplit + ', contaminated and labelled ' + counts.labelled + (labelled.length ? ' (' + labelled.join(', ') + ')' : '')
    + ', contaminated and unlabelled ' + counts.unlabelled + ', with no split ' + counts.noSplit + ', split not an object ' + counts.splitNotObject
    + (unread.length ? ', unread ' + unread.length + ' (' + unread.join(', ') + ', counted as unread, not clean)' : '')
    + (causes.length ? '; CAUSES (' + causes.length + '): ' + causes.join('; ') : '');
  return { ok, graded: true, rules: !(referee && referee.referee), referee, counts, noSplit, splitNotObject: notObject.map((r) => ({ file: r.file, split: r.split, value: r.splitValue ?? null })), labelled, unlabelled, unread, causes, line };
}

// ---------------------------------------------------------------- VISION
/**
 * The VISION row: the counter's line for docs/VISION.md, RED only on drift or an unstated order.
 * @param {{root?: string, md?: string|null, counter?: object|null}} [o] md plants the document text; counter plants the module
 * @returns {{ok: boolean, graded: boolean, rules: boolean, line: string, count?: string, typed?: string|null, reached?: boolean, met?: number, total?: number, unstated?: number[], file: string}}
 */
export function visionRow({ root = ROOT, md = null, counter = VISION_MOD.mod } = {}) {
  const file = 'docs/VISION.md';
  if (!counter || typeof counter.countVision !== 'function') {
    return { ok: true, graded: false, rules: false, file, line: 'VISION N/A: tools/vision-count.mjs is not beside this gate (' + (VISION_MOD.error || 'not loaded') + '), so no order was counted' };
  }
  let text = md;
  if (text == null) {
    const abs = path.join(root, 'docs', 'VISION.md');
    if (!existsSync(abs)) return { ok: true, graded: false, rules: false, file, line: 'VISION N/A: ' + file + ' is not in this tree, so no order was counted' };
    text = readFileSync(abs, 'utf8');
  }
  const c = counter.countVision(text);
  const count = counter.countLine(c);
  const typed = counter.typedLine(text);
  const drift = typed !== count;
  const unstated = c.unstated || [];
  const ok = c.total > 0 && !drift && unstated.length === 0;
  const met = c.counts.MET || 0;
  const reached = c.total > 0 && met === c.total;
  const causes = [];
  if (c.total === 0) causes.push('section 3 lists no numbered order');
  if (drift) causes.push('section 4 types ' + (typed ? JSON.stringify(typed) : 'no count line') + ' while the list counts ' + JSON.stringify(count) + ' (retype section 4 from node tools/vision-count.mjs)');
  if (unstated.length) causes.push('orders with no status word: ' + unstated.join(', '));
  const line = 'VISION ' + (ok ? 'GREEN' : 'RED') + ': ' + count + ' section 4 ' + (drift ? 'DISAGREES' : 'agrees') + '; reached ' + reached + ' (MET ' + met + ' of ' + c.total + ')' + (causes.length ? '; CAUSES (' + causes.length + '): ' + causes.join('; ') : '');
  return { ok, graded: true, rules: true, file, line, count, typed, reached, met, total: c.total, unstated, counts: c.counts };
}

// ---------------------------------------------------------------- the gate
async function main() {
  const args = new Set(process.argv.slice(2));
  // the rows item verdict (node bench/ladder.mjs --rows) refuses a gate run that started before
  // a file it grades last changed, so the start is recorded, not only the end
  const startedAt = new Date().toISOString();
  const files = walk(ROOT);
  const rel = (p) => relTo(ROOT, p);
  // --wait-free-ram-mb N: a machine with less RAM than the 16384 MB the wait rule assumes (a 16 GB cloud
  // session host) waits for N MB instead; every other cap is unchanged and the value used is printed.
  const waitAt = process.argv.indexOf('--wait-free-ram-mb');
  const caps = waitAt > 0 && Number(process.argv[waitAt + 1]) > 0 ? { ...GATE_CAPS, waitFreeRamMb: Number(process.argv[waitAt + 1]) } : GATE_CAPS;
  console.log('gate: free RAM ' + Math.round(os.freemem() / MB) + ' MB at start; each test file waits for ' + caps.waitFreeRamMb + ' MB free before it starts');

  // 1. tests, one process per file so a crash in one cannot hide another, each under the budget
  const testFiles = files.filter(f => /[\\/]test[\\/].*\.test\.mjs$/.test(f)).sort();
  const tests = [];
  for (const f of testFiles) {
    const { row: res, out } = await runTestFile(f, { caps });
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
  // web/tools (and its served copy web/dist/tools) is the Code Universe factory copied verbatim from
  // universe/factory on 2026-09-25 (his order: "dilation.dev/tools used to exist. WHere is it now?").
  // Its separators are UI glyphs in a copy nothing here authors or edits; they are skipped and COUNTED,
  // never hidden: the verdict carries emDashCopiedSkipped and the line below prints it.
  const copied = (f) => /[\\/]web[\\/](dist[\\/])?tools[\\/]/.test(f);
  let emDashCopiedSkipped = 0;
  for (const f of files) if (/\.(mjs|js|md|html)$/.test(f) && !hisText(f) && readFileSync(f, 'utf8').includes(String.fromCharCode(0x2014))) {
    if (copied(f)) emDashCopiedSkipped++; else emDash.push(rel(f));
  }

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
  // AUTONOMY and HANDOFF (Board 15): one schtasks /query read serves both
  const installTask = taskOf(AUTONOMY_TASK);
  rows.autonomy = await guarded('AUTONOMY', async () => autonomyRow({ root: ROOT, task: installTask }));
  rows.handoff = await guarded('HANDOFF', async () => handoffRow({ root: ROOT, task: installTask }));  // CONTAMINATION (Board 13): every bar file names its split; a referee while a live autopilot holds the lock
  rows.contamination = await guarded('CONTAMINATION', async () => contaminationRow(contaminationRecords(path.join(ROOT, 'bench', 'verdicts')), { referee: refereeOf(ROOT) }));
  // VISION (his 20:20 and 21:03 of 2026-09-26): the counter's line; RED only when section 4 has drifted from the list
  rows.vision = await guarded('VISION', async () => visionRow({ root: ROOT }));

  // a referee row (a live autopilot holds the lock) is printed and recorded but does not rule
  const rules = (r) => r.rules !== false;

  const rowsPass = rows.budget.ok && rows.compress.ok && rows.hisData.ok && rows.loadBearing.ok && rows.boundary.ok
    && (rows.autonomy.ok || !rules(rows.autonomy)) && (rows.handoff.ok || !rules(rows.handoff))
    && (rows.contamination.ok || !rules(rows.contamination)) && (rows.vision.ok || !rules(rows.vision));
  const allPass = tests.every(t => t.exit === 0) && emDash.length === 0 && badImports.length === 0 && rowsPass;
  const verdict = {
    at: new Date().toISOString(), startedAt, node: process.version, command: 'node bench/gate.mjs' + (args.has('--quiet') ? ' --quiet' : ''),
    tests, testsPassed: tests.filter(t => t.exit === 0).length, testsTotal: tests.length,
    assertionsPassed: tests.reduce((a, t) => a + (t.pass || 0), 0), assertionsFailed: tests.reduce((a, t) => a + (t.fail || 0), 0),
    lines: { code: codeLines, prose: proseLines, codeFiles, generated: generatedLines, generatedFiles, byArea: counts },
    emDash, emDashCopiedSkipped, badImports, notes,
    rows: { budget: rows.budget, compress: rows.compress, hisData: rows.hisData, loadBearing: rows.loadBearing, boundary: rows.boundary, autonomy: rows.autonomy, handoff: rows.handoff, contamination: rows.contamination, vision: rows.vision },
    verdict: allPass ? 'GREEN' : 'RED',
  };
  const gr = (r) => (r.ok ? 'GREEN' : 'RED');
  const gr2 = (r) => (r.graded === false ? 'N/A' : gr(r) + (rules(r) ? '' : ' (referee)'));
  // the summary line is kept in gate.json too, so a verdict that pastes it pastes what was printed
  verdict.line = 'GATE ' + verdict.verdict + ': test files ' + verdict.testsPassed + '/' + verdict.testsTotal + ', assertions ' + verdict.assertionsPassed + ' pass / ' + verdict.assertionsFailed + ' fail, authored code lines ' + codeLines + ' in ' + codeFiles + ' files, prose lines ' + proseLines + ', generated organism lines ' + generatedLines + ' in ' + generatedFiles + ' files, em-dash files ' + emDash.length + ', bad imports ' + badImports.length
    + ', budget ' + gr(rows.budget) + ', compress ' + gr(rows.compress) + ', his data ' + gr(rows.hisData) + ', load-bearing ' + gr(rows.loadBearing) + ', boundary ' + gr(rows.boundary) + ', autonomy ' + gr2(rows.autonomy) + ', handoff ' + gr2(rows.handoff) + ', contamination ' + gr2(rows.contamination) + ', vision ' + gr2(rows.vision);
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', 'gate.json'), JSON.stringify(verdict, null, 2));
  console.log('');
  console.log(rows.budget.line);
  console.log(rows.compress.line);
  console.log(rows.hisData.line);
  console.log(rows.loadBearing.line);
  console.log(rows.boundary.line);
  console.log(rows.autonomy.line);
  console.log(rows.handoff.line);
  console.log(rows.contamination.line);
  console.log(rows.vision.line);

  console.log('\n' + verdict.line);
  if (emDash.length) console.log('em-dashes in: ' + emDash.join(', '));
  if (emDashCopiedSkipped) console.log('em-dashes in copied files skipped: ' + emDashCopiedSkipped + ' (web/tools and web/dist/tools, the Code Universe factory copy)');
  if (badImports.length) console.log('bad imports: ' + badImports.join(', '));
  // gate.json is written above, synchronously, before this line can end the process
  process.exit(allPass ? 0 : 1);
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
// node bench/gate.mjs --contamination: the CONTAMINATION row alone, in milliseconds, with no test run
// and no gate.json written; the exit code is the row (1 only when it is red and rules)
if (isMain && process.argv.includes('--vision')) {
  const r = visionRow({ root: ROOT });
  console.log(r.line);
  process.exitCode = r.ok || !r.rules ? 0 : 1;
} else if (isMain && process.argv.includes('--contamination')) {
  const r = contaminationRow(contaminationRecords(path.join(ROOT, 'bench', 'verdicts')), { referee: refereeOf(ROOT) });
  console.log(r.line);
  process.exitCode = r.ok || !r.rules ? 0 : 1;
} else if (isMain) await main();
