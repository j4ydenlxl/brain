// judge/select.mjs: THE SELECTOR (his loop, step 4: "A cell survives only if it answers its class's HELD-OUT
// examples better than the organism did before it."). Reads a candidate's result.json, the class's held-out and
// dev sets, the control and the baseline, checks the lock FIRST, and writes verdict.json in the CONTRACT.md shape.
//   node judge/select.mjs <candidateDir> [--baseline <file>] [--out <verdict.json>] [--root <dir>]
// survived is true only on the whole conjunction: lockOk, validate.ok with no error listed, tests.failed 0 with
// exit code 0 (and at least one test run), control.shadows 0 with every control row probed, every example ok, no
// held-out prompt among the cell's examples or quoted in its files, a clean sandbox run (exitCode 0, error null,
// both recorded), every held-out row probed to a recorded can(q), and heldout.score > baseline.score. `why` names
// every failed clause. The baseline is re-graded here from its rows' answers with the locked held-out set, never
// read off its score, and it must carry the fingerprint of the organism as it is NOW (organismPrint: grown/ and the
// import closure of act/prompt.mjs and seeds/basic.mjs): after a promotion the old baseline is refused.
// Exit 0 when a verdict is written; 1 with a one-line reason when none can be (or when the judge drifted).
// Author: board 37 builder, item judge, 2026-09-30.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseJsonl } from '../grow/contract.mjs';
import { expectFailures, score, qKey } from './judge.mjs';
import { DEFAULT_ROOT, verifyLock, shaFile, shaText } from './verify.mjs';

const USAGE = 'usage: node judge/select.mjs <candidateDir> [--baseline <file>] [--out <verdict.json>] [--root <dir>]';
export const CLASS_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const readRows = (file) => (fs.existsSync(file) ? parseJsonl(fs.readFileSync(file, 'utf8')) : null);
const rel = (root, f) => path.relative(root, f).split(path.sep).join('/');
const list = (xs) => xs.map((s) => '"' + s + '"').join(', ');
const sha = (text) => crypto.createHash('sha256').update(text).digest('hex');
const posix = (p) => p.split(path.sep).join('/');

/** The organism's entry files: the answer path and the brain the baseline builds (judge/baseline.mjs). */
export const ORGANISM_ENTRIES = Object.freeze(['act/prompt.mjs', 'seeds/basic.mjs']);
const SPEC_RES = [/\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]/g, /\bimport\s*['"](\.{1,2}\/[^'"]+)['"]/g, /\bimport\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g];

/** Every file under root/rel, recursively, as sorted root-relative posix paths. */
function filesUnder(root, rel) {
  const out = [];
  const walk = (r) => {
    let ents = [];
    try { ents = fs.readdirSync(path.join(root, r), { withFileTypes: true }); } catch { return; }
    for (const e of ents) { const p = r + '/' + e.name; if (e.isDirectory()) walk(p); else if (e.isFile()) out.push(p); }
  };
  walk(rel);
  return out.sort();
}

/**
 * The fingerprint of the organism under root, the one a baseline measured and select compares against:
 * grownSha over every file under grown/ (index.json, index.mjs, cells/), with its generation and cell count, and
 * codeSha over the relative-import closure of act/prompt.mjs and seeds/basic.mjs (static, bare and literal dynamic
 * imports; grown/ is left to grownSha). Text is hashed with CRLF read as LF; a missing file hashes as missing.
 * @returns {{ grownSha: string, generation: number|null, cells: number, codeSha: string, files: number }}
 */
export function organismPrint(root) {
  const g = filesUnder(root, 'grown');
  const grownSha = sha(g.map((rel) => rel + '\0' + (shaFile(root, rel) ?? 'missing')).join('\n') || 'no grown/');
  let generation = null, cells = 0;
  try {
    const ix = JSON.parse(fs.readFileSync(path.join(root, 'grown', 'index.json'), 'utf8'));
    generation = Number.isInteger(ix.generation) ? ix.generation : null;
    cells = Array.isArray(ix.cells) ? ix.cells.length : 0;
  } catch { /* no index: generation null, 0 cells */ }
  const seen = new Map();
  const todo = [...ORGANISM_ENTRIES];
  while (todo.length) {
    const rel = todo.pop();
    if (seen.has(rel)) continue;
    let text = null;
    try { text = fs.readFileSync(path.join(root, rel), 'utf8'); } catch { text = null; }
    seen.set(rel, text === null ? 'missing' : shaText(text));
    if (text === null || !/\.m?js$/.test(rel)) continue;
    for (const re of SPEC_RES) for (const m of text.matchAll(re)) {
      const next = posix(path.normalize(path.join(path.dirname(rel), m[1])));
      if (next.startsWith('..') || path.isAbsolute(next) || next.startsWith('grown/') || seen.has(next)) continue;
      todo.push(next);
    }
  }
  const code = [...seen.keys()].sort();
  return { grownSha, generation, cells, codeSha: sha(code.map((rel) => rel + '\0' + seen.get(rel)).join('\n')), files: code.length };
}

/** The files of a candidate the arm wrote (not the runner's result.json, the selector's verdict.json, or examples.jsonl, which clause 8 reads). */
function armFiles(dir) {
  return filesUnder(dir, '.').map((p) => p.replace(/^\.\//, '')).filter((p) => !['result.json', 'verdict.json', 'examples.jsonl'].includes(p));
}
/** The held-out prompts (4 characters or more) a candidate's own files quote whole, in '', "" or ``. */
export function quotedHeldout(dir, heldoutRows) {
  const texts = [];
  for (const p of armFiles(dir)) { try { texts.push(fs.readFileSync(path.join(dir, p), 'utf8').toLowerCase()); } catch { /* unreadable: nothing quoted */ } }
  const out = [];
  for (const r of heldoutRows) {
    const k = qKey(r.q);
    if (k.length < 4) continue; // a fragment of 1 to 3 letters is in any source; its echo cannot be hard-coded past a general cell
    if (texts.some((t) => ["'", '"', '`'].some((c) => t.includes(c + k + c)))) out.push(r.q);
  }
  return out;
}

/** The default baseline file of a class under root. */
export const baselineFile = (root, cls) => path.join(root, 'state', 'grow', 'baseline', cls + '.json');

/**
 * Judge one candidate. Pure over what it is handed, apart from the lock check and the file reads.
 * @returns {{ verdict: object|null, fatal: string|null }}
 */
export function select(candidateDir, opts = {}) {
  const root = opts.root ? path.resolve(opts.root) : DEFAULT_ROOT;
  const dir = path.resolve(candidateDir);
  const resultFile = path.join(dir, 'result.json');
  let result;
  try { result = JSON.parse(fs.readFileSync(resultFile, 'utf8')); } catch (e) {
    return { verdict: null, fatal: 'no readable result.json in ' + dir + ' (' + String((e && e.code) || (e && e.message) || e) + ')' };
  }
  const at = opts.at || new Date().toISOString();
  const cls = typeof result.class === 'string' ? result.class : null;
  const base = {
    candidate: result.candidate ?? path.basename(dir), id: result.id ?? null, class: cls, survived: false, why: [],
    lockOk: false, judgeSha: null, examples: { n: 0, ok: 0 }, heldout: { n: 0, ok: 0, score: 0 }, baseline: null,
    control: { n: 0, shadows: 0 }, tests: { passed: 0, failed: 0 }, at,
  };
  // 1. the lock, before anything else is read: a drifted judge grades nothing
  const lock = verifyLock(root);
  if (!lock.ok) return { verdict: { ...base, why: ['the judge drifted: ' + lock.drift] }, fatal: null, drift: lock.drift };
  base.lockOk = true;
  base.judgeSha = lock.judgeSha;
  if (!cls || !CLASS_RE.test(cls)) return { verdict: { ...base, why: ['the result names no class the judge knows: ' + JSON.stringify(result.class)] }, fatal: null };
  const heldoutPath = path.join(root, 'judge', 'heldout', cls + '.jsonl');
  const heldoutRows = readRows(heldoutPath);
  if (!heldoutRows || !heldoutRows.length) return { verdict: { ...base, why: ['no held-out set for class ' + cls] }, fatal: null };
  const devRows = readRows(path.join(root, 'judge', 'dev', cls + '.jsonl')) || [];
  const controlRows = readRows(path.join(root, 'judge', 'control.jsonl')) || [];
  // 2. the baseline: the organism before the cell, re-graded with the locked held-out set
  const bFile = opts.baseline ? path.resolve(opts.baseline) : baselineFile(root, cls);
  let bl;
  try { bl = JSON.parse(fs.readFileSync(bFile, 'utf8')); } catch { return { verdict: null, fatal: 'no baseline for ' + cls + ': run node judge/baseline.mjs ' + cls }; }
  const why = [];
  const bRows = Array.isArray(bl && bl.rows) ? bl.rows : [];
  const bScore = score(heldoutRows, bRows.map((r) => ({ q: r && r.q, got: r ? r.got : null })));
  const bFileRel = rel(root, bFile);
  base.baseline = { n: bScore.n, ok: bScore.ok, score: bScore.score, file: bFileRel.startsWith('..') ? bFile : bFileRel };
  if (bl && bl.class !== undefined && bl.class !== cls) why.push('the baseline is for class ' + bl.class + ', not ' + cls);
  const bQs = new Set(bRows.map((r) => qKey(r && r.q)));
  const uncovered = heldoutRows.filter((r) => !bQs.has(qKey(r.q))).map((r) => r.q);
  if (uncovered.length) why.push('the baseline has no row for held-out ' + list(uncovered) + ': run node judge/baseline.mjs ' + cls);
  const heldSha = shaFile(root, 'judge/heldout/' + cls + '.jsonl');
  if (bl && bl.heldoutSha !== undefined && bl.heldoutSha !== heldSha) why.push('the baseline was measured on another held-out set: run node judge/baseline.mjs ' + cls);
  if (bl && bl.score !== undefined && bl.score !== bScore.score) why.push('the baseline file says score ' + bl.score + ' but its rows grade ' + bScore.score);
  // the baseline must be of the organism as it is now: a promotion (grown/) or an edit to its code makes it stale
  const now = organismPrint(root);
  const bp = bl && bl.organismPrint && typeof bl.organismPrint === 'object' ? bl.organismPrint : null;
  if (!bp) why.push('the baseline records no organism fingerprint: run node judge/baseline.mjs ' + cls);
  else {
    if (bp.grownSha !== now.grownSha) why.push('the baseline was measured before grown/ changed (generation ' + bp.generation + ', ' + bp.cells + ' cells; now generation ' + now.generation + ', ' + now.cells + ' cells): run node judge/baseline.mjs ' + cls);
    if (bp.codeSha !== now.codeSha) why.push('the baseline was measured on other organism code (the import closure of act/prompt.mjs and seeds/basic.mjs changed): run node judge/baseline.mjs ' + cls);
  }
  // 3. the sandbox run itself
  // (the runner records both fields on every run: an absent one is not a clean run)
  if (result.error === undefined) why.push('the result records no sandbox error field');
  else if (result.error !== null) why.push('the sandbox run failed: ' + String(result.error).slice(0, 300));
  if (result.exitCode === undefined || result.exitCode === null) why.push('the result records no sandbox exit code');
  else if (result.exitCode !== 0) why.push('the sandbox run exited ' + result.exitCode);
  // 4. the contract: ok true AND an empty error list
  const v = result.validate || {};
  const vErrs = Array.isArray(v.errors) ? v.errors : null;
  if (v.ok !== true) why.push('the cell is not a valid cell: ' + ((vErrs && vErrs.length) ? vErrs.slice(0, 8).join('; ') : 'no validation recorded'));
  else if (!vErrs) why.push('the validation records no error list');
  else if (vErrs.length) why.push('the validation says ok but lists errors: ' + vErrs.slice(0, 8).join('; '));
  // 5. its own tests
  const t = result.tests || {};
  base.tests = { passed: Number.isInteger(t.passed) ? t.passed : 0, failed: Number.isInteger(t.failed) ? t.failed : null };
  if (t.failed !== 0 || t.exitCode !== 0) why.push('the cell\'s tests failed: ' + (t.failed ?? 'unknown') + ' failed, exit code ' + (t.exitCode ?? 'unknown'));
  else if (!(Number.isInteger(t.passed) && t.passed >= 1)) why.push('the cell\'s tests ran no test');
  // 6. the control: a cell may never shadow a right answer
  const cRes = new Map();
  for (const r of Array.isArray(result.control) ? result.control : []) if (r && typeof r.q === 'string' && !cRes.has(qKey(r.q))) cRes.set(qKey(r.q), r);
  let shadows = 0;
  const unprobed = [];
  for (const row of controlRows) {
    const r = cRes.get(qKey(row.q));
    if (!r) { unprobed.push(row.q); continue; }
    if (r.can === true) { shadows++; why.push('the cell shadows a right answer: "' + row.q + '"'); } else if (r.can !== false) unprobed.push(row.q);
  }
  base.control = { n: controlRows.length, shadows };
  if (!controlRows.length) why.push('the control set is empty');
  if (unprobed.length) why.push('control rows not probed to a false can(q): ' + list(unprobed));
  // 7. its examples: graded with the locked dev expect when the row is a dev row, else the cell's own examples.jsonl
  const devBy = new Map(devRows.map((r) => [qKey(r.q), r.expect]));
  const ownBy = new Map();
  try { for (const r of readRows(path.join(dir, 'examples.jsonl')) || []) if (r && typeof r.q === 'string') ownBy.set(qKey(r.q), r.expect); } catch { /* a bad line leaves the row without an expect */ }
  const exRows = Array.isArray(result.examples) ? result.examples : [];
  let exOk = 0;
  for (const r of exRows) {
    const q = r && typeof r.q === 'string' ? r.q : '';
    const expect = devBy.has(qKey(q)) ? devBy.get(qKey(q)) : ownBy.get(qKey(q));
    let fails;
    if (!expect) fails = ['no expect in the dev set or examples.jsonl'];
    else if (r.can !== true) fails = ['can(q) is not true'];
    else fails = expectFailures(r.got, expect);
    if (fails.length) why.push('an example failed: "' + q + '" (' + fails.join('; ') + ')'); else exOk++;
  }
  base.examples = { n: exRows.length, ok: exOk };
  if (!exRows.length) why.push('the result carries no example');
  // 8. no held-out row may be among what the cell was grown from
  const heldBy = new Set(heldoutRows.map((r) => qKey(r.q)));
  const leaked = [...new Set([...exRows.map((r) => r && r.q), ...[...ownBy.keys()]].filter((q) => typeof q === 'string' && heldBy.has(qKey(q))).map(qKey))];
  if (leaked.length) why.push('the cell was grown on held-out rows: ' + list(leaked));
  // an arm is shown the dev rows only (judge/README.md): a held-out prompt quoted in the cell's own files is one it read
  const quoted = quotedHeldout(dir, heldoutRows);
  if (quoted.length) why.push('the cell\'s files quote held-out prompts: ' + list(quoted));
  // 9. selection: better than the organism before it, on the held-out rows; a row counts only when can(q) is true,
  // and a row whose can(q) was never recorded (true or false) is a probe that did not run: it fails the run
  const hIn = Array.isArray(result.heldout) ? result.heldout : [];
  const hRes = hIn.map((r) => (r && typeof r === 'object' ? { q: r.q, got: r.can === true ? r.got : null, can: r.can === true } : r));
  const noCan = hIn.filter((r) => r && typeof r.q === 'string' && r.can !== true && r.can !== false).map((r) => r.q);
  if (noCan.length) why.push('held-out rows with no can(q) recorded: ' + list(noCan));
  // a held-out row the result does not carry at all was never probed: a partial result is not a run of the set
  const missing = heldoutRows.filter((row) => !hIn.some((r) => r && typeof r.q === 'string' && qKey(r.q) === qKey(row.q))).map((row) => row.q);
  if (missing.length) why.push('held-out rows missing from result.json: ' + list(missing));
  const h = score(heldoutRows, hRes);
  base.heldout = { n: h.n, ok: h.ok, score: h.score };
  if (!(h.score > bScore.score)) why.push('held-out score ' + h.score + ' (' + h.ok + '/' + h.n + ') is not above the baseline\'s ' + bScore.score + ' (' + bScore.ok + '/' + bScore.n + ')');
  const survived = why.length === 0 && base.lockOk && v.ok === true && Array.isArray(vErrs) && vErrs.length === 0
    && t.failed === 0 && t.exitCode === 0 && shadows === 0 && result.exitCode === 0 && result.error === null
    && exRows.length > 0 && exOk === exRows.length && !leaked.length && !quoted.length && noCan.length === 0 && missing.length === 0
    && h.score > bScore.score;
  return { verdict: { ...base, survived, why }, fatal: null };
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) { console.log(USAGE); return 0; }
  const opts = {};
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--baseline' || a === '--out' || a === '--root') {
      if (!argv[i + 1]) { console.log(a + ' needs a value. ' + USAGE); return 2; }
      opts[a.slice(2)] = argv[++i];
    } else if (a.startsWith('--')) { console.log('unknown option ' + a + '. ' + USAGE); return 2; } else pos.push(a);
  }
  if (pos.length !== 1) { console.log('one <candidateDir> is needed. ' + USAGE); return 2; }
  let r;
  try { r = select(pos[0], opts); } catch (e) { console.log('select failed: ' + String((e && e.message) || e)); return 1; }
  if (r.fatal) { console.log(r.fatal); return 1; }
  const out = path.resolve(opts.out || path.join(pos[0], 'verdict.json'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(r.verdict, null, 2) + '\n');
  if (r.drift) { console.log('LOCK DRIFT ' + r.drift + ': the judge refused, survived false, verdict ' + out); return 1; }
  const vd = r.verdict;
  console.log(JSON.stringify({ candidate: vd.candidate, id: vd.id, class: vd.class, survived: vd.survived, heldout: vd.heldout.score, baseline: vd.baseline && vd.baseline.score, why: vd.why.length, verdict: out }));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
