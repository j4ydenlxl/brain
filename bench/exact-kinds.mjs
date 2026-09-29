// bench/exact-kinds.mjs: THE BAR OF BOARD 34, ITEM exact-kinds. Nine kinds answered exactly, or refused.
//
// bench/verdicts/conceive.json (at 2026-09-28T12:18:03.618Z) printed the organism native 0 and correct 0 on nine
// census kinds: units, sequence, counting, spelling, calendar, comparison, probability, geometry and logic.
// act/exact-kinds.mjs reads those kinds completely or not at all, and act/solve.mjs calls it last. This bench asks
// two populations the same way, twice:
//
//   development  the census rows of the nine kinds (bench/conceive-prompts.json), each graded by its own grade field
//                with the census ruler (bench/conceive.mjs gradeAnswer)
//   held out     bench/exact-kinds-heldout.jsonl, 106 rows written before the readers existed (its sha256 and its
//                write stamp are in the verdict), graded with the census exact ruler (exactPass) on its answer
//
//   arm solve    act/solve.mjs solve() alone; the nanoseconds are measured around this call and nothing else
//   arm ask      act/prompt.mjs ask() model off (provider null, k 5, a seeds/basic.mjs brain: the census organism arm)
//
// For every kind and population it prints asked, answered, correct, wrong and refused, and the median and p95
// nanoseconds of solve(). A wrong exact answer is worse than a refusal, so the bar counts wrong answers first.
//
// THE CONTROL. The census is re-run as a child process, `node bench/conceive.mjs --limit 0 --nowrite --json`, twice:
// once as the tree is, and once with this item unplugged (a --import preload calls kindsReader(false) in
// act/solve.mjs before the census imports it; the switch reads no environment variable). Its stdout is read; it
// writes nothing, so bench/verdicts/conceive.json is never touched. Every one of the other 32 kinds must keep its
// organism native and correct counts between the two runs, and the nine kinds are printed before and after. The
// committed bench/verdicts/conceive.json is printed beside them: a kind that moved since that commit and moves the
// same with this item unplugged was moved by other uncommitted work, and is named as such.
//
// barMet only when: wrong is 0 on both populations in both arms; the held-out answered share over the nine kinds is
// at least 0.75 (the solve arm); every other census kind keeps its organism native and correct counts; and
// `node --test test/solve.test.mjs test/answer.test.mjs test/exact-kinds.test.mjs` passes.
// With --unplug-spoken (board 36, item pins) two more checks rule: the second arm ran and its probe proved the unplug
// took (spokenControlRan), and every other census kind kept its counts with kindsReader AND the spoken rewrites of
// act/exact-read.mjs unplugged (spokenOtherKindsKept).
//
// MODEL OFF: provider null, no socket, no model call. Run it through the budget:
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/exact-kinds.mjs
import { readFileSync, writeFileSync, statSync, renameSync } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs'; // board 36 (item pins): the --unplug-spoken scratch
import os from 'node:os'; // board 36 (item pins)
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { KINDS, KIND_METHODS } from '../act/exact-kinds.mjs';
import { solve, kindsReader } from '../act/solve.mjs';
import { loadPrompts, gradeAnswer, exactPass, isNative, optsFor } from './conceive.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
export const HELDOUT_FILE = 'bench/exact-kinds-heldout.jsonl';
export const VERDICT_FILE = 'bench/verdicts/exact-kinds.json';
export const COMMAND = 'node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/exact-kinds.mjs';
export const TESTS = Object.freeze(['test/solve.test.mjs', 'test/answer.test.mjs', 'test/exact-kinds.test.mjs']);
export const CENSUS_ARGS = Object.freeze(['bench/conceive.mjs', '--limit', '0', '--nowrite', '--json', '--quiet']);
export const HELDOUT_SHARE_BAR = 0.75;
// The honest state of the split, printed into every verdict (see notes/exact-kinds.md).
export const CONTAMINATION = 'the same builder wrote the held-out rows and then the readers: the held-out file was written and '
  + 'stamped before act/exact-kinds.mjs existed, but every one of its phrasings was in view while the frames were designed, '
  + 'so its answered share is an upper bound, not a blind measurement; the census rows of the nine kinds (the development '
  + 'population) were read too. The refusals the tests pin, and the wrong count, are the parts that do not depend on it.';

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
function pct(xs, q) { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.ceil(q * s.length) - 1)]; }
const nsStats = (xs) => ({ n: xs.length, median: pct(xs, 0.5), p95: pct(xs, 0.95) });

/** The held-out rows, with the file's sha256, byte count and stamps. */
export function loadHeldOut(file = path.join(ROOT, HELDOUT_FILE)) {
  const buf = readFileSync(file);
  const rows = buf.toString('utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const st = statSync(file);
  return { rows, sha256: sha256(buf), bytes: buf.length, born: st.birthtime.toISOString(), modified: st.mtime.toISOString() };
}

// A strict second ruler for the held-out rows: the answer string itself, case and spacing aside, is the one wanted.
const normAns = (s) => String(s ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

function emptyCounts() { return { asked: 0, answered: 0, correct: 0, wrong: 0, refused: 0 }; }
function addTo(t, c) { for (const k of Object.keys(t)) t[k] += c[k]; }

/** One population through solve(): per kind counts, the ns around solve() only, and each wrong row. */
async function solveArm(rows, graderOf) {
  for (const r of rows) solve(r.prompt); // warm pass: the timed pass below measures a warm reader
  const byKind = {}, wrong = [], all = [];
  for (const r of rows) {
    const k = r.kind;
    byKind[k] ||= { ...emptyCounts(), strictCorrect: 0, ns: [] };
    const b = byKind[k];
    b.asked++;
    const t0 = process.hrtime.bigint();
    const s = solve(r.prompt);
    const ns = Number(process.hrtime.bigint() - t0);
    b.ns.push(ns); all.push(ns);
    if (!s) { b.refused++; continue; }
    b.answered++;
    const g = await graderOf(s.answer, r);
    if (g.correct) b.correct++; else { b.wrong++; wrong.push({ id: r.id, arm: 'solve', given: s.answer, wanted: g.wanted, method: s.method }); }
    if (g.strict) b.strictCorrect++;
  }
  return finish(byKind, wrong, all);
}

/** One population through ask(), model off, on a seeds/basic.mjs brain (the census organism arm). */
async function askArm(rows, graderOf, ask, brain) {
  const byKind = {}, wrong = [];
  for (const r of rows) {
    const k = r.kind;
    byKind[k] ||= { ...emptyCounts(), exact: 0 };
    const b = byKind[k];
    b.asked++;
    const a = await ask(brain, r.prompt, optsFor('organism'));
    const text = a && typeof a.text === 'string' ? a.text : '';
    if (!isNative(text)) { b.refused++; continue; }
    b.answered++;
    if (a.provenance && a.provenance.answer === 'exact') b.exact++;
    const g = await graderOf(text, r, true);
    if (g.correct) b.correct++; else { b.wrong++; wrong.push({ id: r.id, arm: 'ask', given: text.split(/\r?\n/).filter((l) => l.trim()).pop() || '', wanted: g.wanted, route: a.route ?? null, provenance: a.provenance ? a.provenance.answer ?? null : null }); }
  }
  return finish(byKind, wrong, null);
}

function finish(byKind, wrong, all) {
  const total = { ...emptyCounts() };
  for (const k of KINDS) if (!byKind[k]) byKind[k] = { ...emptyCounts() };
  const out = {};
  for (const k of KINDS) {
    const b = byKind[k];
    addTo(total, b);
    out[k] = { asked: b.asked, answered: b.answered, correct: b.correct, wrong: b.wrong, refused: b.refused };
    if (b.strictCorrect !== undefined) out[k].strictCorrect = b.strictCorrect;
    if (b.exact !== undefined) out[k].exactProvenance = b.exact;
    if (b.ns) { const s = nsStats(b.ns); out[k].nsMedian = s.median; out[k].nsP95 = s.p95; }
  }
  total.answeredShare = total.asked ? total.answered / total.asked : null;
  const res = { byKind: out, total, wrong };
  if (all) res.ns = nsStats(all);
  return res;
}

const devGrader = async (text, row) => {
  const g = await gradeAnswer(text, row);
  return { correct: g.graded === true, strict: g.graded === true, wanted: row.grade.answer ?? row.grade.pattern ?? (row.grade.any || row.grade.all || []).join(' | ') };
};
const heldGrader = async (text, row, asked) => {
  const correct = exactPass(text, { type: 'exact', answer: row.answer });
  return { correct, strict: asked ? correct : normAns(text) === normAns(row.answer), wanted: row.answer };
};

/** The census as a child process (stdout read, nothing written); unplugged runs it with this item's readers off. */
export function census({ unplugged = false } = {}) {
  const pre = unplugged ? ['--import', 'data:text/javascript,' + encodeURIComponent('import { kindsReader } from ' + JSON.stringify(pathToFileURL(path.join(ROOT, 'act', 'solve.mjs')).href) + '; kindsReader(false);')] : [];
  const t0 = Date.now();
  const r = spawnSync(process.execPath, ['--max-old-space-size=4000', ...pre, ...CENSUS_ARGS], { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 600000 });
  const out = String(r.stdout || '');
  const i = out.lastIndexOf('\nCONCEIVE ');
  if (i < 0) return { ok: false, status: r.status, why: 'no CONCEIVE line on stdout: ' + String(r.stderr || '').slice(0, 300) };
  let v;
  try { v = JSON.parse(out.slice(0, i)); } catch (e) { return { ok: false, status: r.status, why: 'stdout before the CONCEIVE line is not JSON: ' + String(e.message).slice(0, 120) }; }
  return { ok: true, status: r.status, ms: Date.now() - t0, line: out.slice(i + 1).trim(), v };
}

// ---------------------------------------------------------------- board 36 (item pins), add-only: the second unplug
// kindsReader(false) switches off act/exact-kinds.mjs and the gap readers in act/solve.mjs, but not the spoken rewrites
// board 35 readers-2 added to act/exact-read.mjs ("the product of 7 and 8", "7 more than 8", the difference guard), so a
// census kind those rewrites moved looked "kept by this item" in both arms. With --unplug-spoken the census runs a third
// time with kindsReader(false) AND act/exact-read.mjs served as it was before board 35 (git show SPOKEN_BEFORE_REV, the
// parent of the commit that landed readers-2; that commit only added 40 lines to the file). A load hook
// (node:module registerHooks) serves the old source under the file's own URL, so its relative imports resolve as they do
// in the tree. The child prints a probe on stderr: the old reader reads "what's the product of 7 and 8" as 7 + 8 and the
// tree reads it as 7 * 8, so a probe equal to the tree's reading means the hook did not take and the arm is not a control.
export const SPOKEN_FLAG = '--unplug-spoken';
export const SPOKEN_FILE = 'act/exact-read.mjs';
export const SPOKEN_BEFORE_REV = '73f0293^';
export const SPOKEN_PROBE = "what's the product of 7 and 8";
const SPOKEN_PROBE_RE = /^UNPLUG-SPOKEN probe (.*) served (\d+)$/m;

/** The preload that serves act/exact-read.mjs at SPOKEN_BEFORE_REV and then calls kindsReader(false); { ok, dir, file } or { ok: false, why }. */
export function spokenPreload() {
  const g = spawnSync('git', ['show', SPOKEN_BEFORE_REV + ':' + SPOKEN_FILE], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (g.status !== 0 || !g.stdout) return { ok: false, why: 'git show ' + SPOKEN_BEFORE_REV + ':' + SPOKEN_FILE + ' failed: ' + String(g.stderr || '').slice(0, 200) };
  const dir = mkdtempSync(path.join(os.tmpdir(), 'exact-kinds-spoken-'));
  const oldFile = path.join(dir, 'exact-read.before.mjs');
  writeFileSync(oldFile, g.stdout);
  const target = pathToFileURL(path.join(ROOT, SPOKEN_FILE)).href;
  const solveUrl = pathToFileURL(path.join(ROOT, 'act', 'solve.mjs')).href;
  const src = [
    "import { registerHooks } from 'node:module';",
    "import { readFileSync } from 'node:fs';",
    'const TARGET = ' + JSON.stringify(target.toLowerCase()) + ';',
    'const SRC = readFileSync(' + JSON.stringify(oldFile) + ", 'utf8');",
    'let served = 0;',
    'registerHooks({ load(url, context, nextLoad) { if (String(url).toLowerCase() === TARGET) { served++; return { format: \'module\', source: SRC, shortCircuit: true }; } return nextLoad(url, context); } });',
    'const m = await import(' + JSON.stringify(target) + ');',
    'const s = await import(' + JSON.stringify(solveUrl) + ');',
    's.kindsReader(false);',
    "process.stderr.write('UNPLUG-SPOKEN probe ' + JSON.stringify(m.spokenExpression(" + JSON.stringify(SPOKEN_PROBE) + ")) + ' served ' + served + '\\n');",
  ].join('\n');
  const file = path.join(dir, 'unplug-spoken.mjs');
  writeFileSync(file, src + '\n');
  return { ok: true, dir, file, oldBytes: Buffer.byteLength(g.stdout), oldSha256: sha256(g.stdout) };
}

/** The census as a child with kindsReader(false) and the pre-board-35 act/exact-read.mjs; the probe read from stderr. */
export async function censusSpokenUnplugged() {
  const pre = spokenPreload();
  if (!pre.ok) return { ok: false, why: pre.why };
  try {
    const { spokenExpression } = await import('../act/exact-read.mjs');
    const treeReads = spokenExpression(SPOKEN_PROBE);
    const t0 = Date.now();
    const r = spawnSync(process.execPath, ['--max-old-space-size=4000', '--import', pathToFileURL(pre.file).href, ...CENSUS_ARGS], { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 600000 });
    const pm = SPOKEN_PROBE_RE.exec(String(r.stderr || ''));
    const probe = pm ? { prompt: SPOKEN_PROBE, unplugged: JSON.parse(pm[1]), tree: treeReads, served: Number(pm[2]) } : null;
    const probeHeld = !!probe && probe.served > 0 && probe.unplugged !== probe.tree;
    const out = String(r.stdout || '');
    const i = out.lastIndexOf('\nCONCEIVE ');
    if (i < 0) return { ok: false, probe, probeHeld, status: r.status, why: 'no CONCEIVE line on stdout: ' + String(r.stderr || '').slice(0, 300) };
    let v;
    try { v = JSON.parse(out.slice(0, i)); } catch (e) { return { ok: false, probe, probeHeld, status: r.status, why: 'stdout before the CONCEIVE line is not JSON: ' + String(e.message).slice(0, 120) }; }
    return { ok: true, probe, probeHeld, rev: SPOKEN_BEFORE_REV, oldSha256: pre.oldSha256, oldBytes: pre.oldBytes, status: r.status, ms: Date.now() - t0, line: out.slice(i + 1).trim(), v };
  } finally {
    rmSync(pre.dir, { recursive: true, force: true });
  }
}

// a row's text prints the time its answer took ("1644500 ns"), which no two runs share; the rest must be the same
export const untimed = (t) => String(t || '').replace(/\b\d+(?:\.\d+)?\s*(?:ns|\u00B5s|us|ms)\b/g, '<time>');
const pair = (o) => (o ? { native: o.native, correct: o.correct } : null);
const same = (a, b) => !!a && !!b && a.native === b.native && a.correct === b.correct;

/** The control table: every kind, committed / unplugged / as is, and the rows this item moved. */
export function control(committed, off, on) {
  const kinds = {};
  const rowKey = (r) => r.arm + '\u0000' + r.id;
  const offRows = new Map(off.v.rows.map((r) => [rowKey(r), r]));
  for (const k of Object.keys(on.v.kinds)) {
    const moved = on.v.rows.filter((r) => r.kind === k && r.arm === 'organism').filter((r) => {
      const o = offRows.get(rowKey(r));
      return !o || o.native !== r.native || o.graded !== r.graded || untimed(o.text) !== untimed(r.text);
    }).map((r) => r.id);
    const c = pair(committed.kinds[k] && committed.kinds[k].organism), u = pair(off.v.kinds[k] && off.v.kinds[k].organism), a = pair(on.v.kinds[k].organism);
    kinds[k] = {
      nine: KINDS.includes(k), committed: c, unplugged: u, asIs: a,
      site: { committed: pair(committed.kinds[k] && committed.kinds[k]['organism-site']), unplugged: pair(off.v.kinds[k] && off.v.kinds[k]['organism-site']), asIs: pair(on.v.kinds[k]['organism-site']) },
      rowsMovedByThisItem: moved,
      keptByThisItem: same(u, a),
      movedSinceCommit: !same(c, a),
    };
  }
  const others = Object.keys(kinds).filter((k) => !kinds[k].nine);
  return {
    command: 'node ' + CENSUS_ARGS.join(' '),
    unpluggedCommand: 'node --import <data: preload calling kindsReader(false) in act/solve.mjs> ' + CENSUS_ARGS.join(' '),
    committedAt: committed.at, unpluggedAt: off.v.at, asIsAt: on.v.at,
    lines: { unplugged: off.line, asIs: on.line },
    otherKinds: others.length,
    otherKindsKept: others.every((k) => kinds[k].keptByThisItem && kinds[k].rowsMovedByThisItem.length === 0),
    otherKindsMovedSinceCommit: others.filter((k) => kinds[k].movedSinceCommit),
    otherKindsMovedByThisItem: others.filter((k) => !kinds[k].keptByThisItem || kinds[k].rowsMovedByThisItem.length > 0),
    kinds,
  };
}

/** The three test files as a child; the tally lines as printed. */
export function runTests() {
  const r = spawnSync(process.execPath, ['--test', ...TESTS], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 600000 });
  const out = String(r.stdout || '') + String(r.stderr || '');
  const tally = out.split(/\r?\n/).filter((l) => /^ℹ (?:tests|pass|fail) \d+/.test(l));
  const num = (w) => { const l = tally.find((x) => x.startsWith('ℹ ' + w + ' ')); return l ? Number(l.split(' ')[2]) : null; };
  const failing = out.split(/\r?\n/).filter((l) => /^✖ /.test(l)).slice(0, 20);
  return { command: 'node --test ' + TESTS.join(' '), status: r.status, tests: num('tests'), pass: num('pass'), fail: num('fail'), tally, failing, passed: r.status === 0 && num('fail') === 0 && num('tests') > 0 };
}

function writeVerdict(v) {
  const file = path.join(ROOT, VERDICT_FILE);
  const tmp = file + '.tmp';
  writeFileSync(tmp, JSON.stringify(v, null, 1) + '\n');
  renameSync(tmp, file);
}

export async function run({ say = console.log } = {}) {
  const at = new Date().toISOString();
  const set = loadPrompts();
  const dev = set.prompts.filter((p) => KINDS.includes(p.kind));
  const held = loadHeldOut();
  if (!held.rows.every((r) => KINDS.includes(r.kind) && typeof r.prompt === 'string' && typeof r.answer === 'string')) throw new Error(HELDOUT_FILE + ': a row with an unknown kind or no prompt and answer');
  if (!kindsReader()) throw new Error('act/solve.mjs has the nine kinds unplugged in this process');

  const solveDev = await solveArm(dev, devGrader);
  const solveHeld = await solveArm(held.rows, heldGrader);
  const { ask } = await import('../act/prompt.mjs');
  const { seedBasic } = await import('../seeds/basic.mjs');
  const brain = seedBasic({ name: 'exact-kinds-ask', ledger: 'full', ledgerRing: 4096 });
  const askDev = await askArm(dev, devGrader, ask, brain);
  const askHeld = await askArm(held.rows, heldGrader, ask, brain);

  say('EXACT-KINDS populations: development ' + dev.length + ' census rows of the nine kinds (bench/conceive-prompts.json); held out ' + held.rows.length + ' rows (' + HELDOUT_FILE + ', sha256 ' + held.sha256 + ', written ' + held.born + ')');
  for (const [pop, s, a] of [['development', solveDev, askDev], ['heldOut', solveHeld, askHeld]]) {
    for (const k of KINDS) {
      const x = s.byKind[k], y = a.byKind[k];
      say('EXACT-KINDS ' + pop + ' ' + k + ': solve asked ' + x.asked + ' answered ' + x.answered + ' correct ' + x.correct + ' wrong ' + x.wrong + ' refused ' + x.refused + ' ns median ' + x.nsMedian + ' p95 ' + x.nsP95
        + '; ask asked ' + y.asked + ' answered ' + y.answered + ' correct ' + y.correct + ' wrong ' + y.wrong + ' refused ' + y.refused);
    }
    say('EXACT-KINDS ' + pop + ' total: solve asked ' + s.total.asked + ' answered ' + s.total.answered + ' correct ' + s.total.correct + ' wrong ' + s.total.wrong + ' refused ' + s.total.refused + ' (answered share ' + s.total.answeredShare.toFixed(4) + ') ns median ' + s.ns.median + ' p95 ' + s.ns.p95
      + '; ask asked ' + a.total.asked + ' answered ' + a.total.answered + ' correct ' + a.total.correct + ' wrong ' + a.total.wrong + ' refused ' + a.total.refused);
  }

  // the control: the census as a child, unplugged and as is; the committed verdict beside them
  const committed = JSON.parse(readFileSync(path.join(ROOT, 'bench/verdicts/conceive.json'), 'utf8'));
  const off = census({ unplugged: true });
  const on = census();
  let ctl;
  if (!off.ok || !on.ok) ctl = { ok: false, why: (off.ok ? '' : 'unplugged: ' + off.why + ' ') + (on.ok ? '' : 'as is: ' + on.why) };
  else ctl = { ok: true, ...control(committed, off, on) };
  if (ctl.ok) {
    say('EXACT-KINDS control, the census as a child (organism native,correct: committed ' + committed.at + ' | this item unplugged | as is):');
    for (const [k, c] of Object.entries(ctl.kinds)) {
      const f = (p) => (p ? p.native + ',' + p.correct : '-');
      if (c.nine || c.movedSinceCommit || !c.keptByThisItem) say('EXACT-KINDS control ' + (c.nine ? 'nine ' : 'other ') + k + ': ' + f(c.committed) + ' | ' + f(c.unplugged) + ' | ' + f(c.asIs) + (c.nine ? '' : c.keptByThisItem ? ' (kept by this item; moved since the commit by other work)' : ' MOVED BY THIS ITEM rows ' + c.rowsMovedByThisItem.join(',')));
    }
    say('EXACT-KINDS control: ' + ctl.otherKinds + ' other kinds, kept by this item: ' + ctl.otherKindsKept + '; moved since the commit, not by this item: ' + (ctl.otherKindsMovedSinceCommit.filter((k) => !ctl.otherKindsMovedByThisItem.includes(k)).join(', ') || 'none'));
    say('EXACT-KINDS control child line (unplugged): ' + ctl.lines.unplugged);
    say('EXACT-KINDS control child line (as is): ' + ctl.lines.asIs);
  } else say('EXACT-KINDS control FAILED: ' + ctl.why);

  // board 36 (item pins), add-only: the second unplug (--unplug-spoken), printed beside the first
  const unplugSpoken = process.argv.slice(2).includes(SPOKEN_FLAG);
  let ctlSpoken = null;
  if (unplugSpoken) {
    const off2 = await censusSpokenUnplugged();
    if (!off2.ok || !on.ok) ctlSpoken = { ok: false, probe: off2.probe ?? null, probeHeld: off2.probeHeld ?? false, why: (off2.ok ? '' : 'kinds and spoken unplugged: ' + off2.why + ' ') + (on.ok ? '' : 'as is: ' + on.why) };
    else {
      const c2 = control(committed, off2, on);
      const byKind = Object.fromEntries(Object.keys(on.v.kinds).map((k) => [k, { kindsOnly: pair(off.ok && off.v.kinds[k] ? off.v.kinds[k].organism : null), kindsAndSpoken: pair(off2.v.kinds[k] ? off2.v.kinds[k].organism : null) }]));
      const movedBySpoken = Object.keys(byKind).filter((k) => !same(byKind[k].kindsOnly, byKind[k].kindsAndSpoken));
      ctlSpoken = { ok: true, probe: off2.probe, probeHeld: off2.probeHeld, rev: off2.rev, oldSha256: off2.oldSha256, ms: off2.ms, ...c2, unpluggedCommand: 'node --import <preload: act/exact-read.mjs served at ' + SPOKEN_BEFORE_REV + ', then kindsReader(false)> ' + CENSUS_ARGS.join(' '), kindsMovedBySpoken: movedBySpoken, spokenByKind: byKind };
    }
    say('EXACT-KINDS control probe (kinds and spoken unplugged): ' + (ctlSpoken.probe ? JSON.stringify(ctlSpoken.probe.prompt) + ' unplugged reads ' + JSON.stringify(ctlSpoken.probe.unplugged) + ', the tree reads ' + JSON.stringify(ctlSpoken.probe.tree) + ', old source served ' + ctlSpoken.probe.served + ' time(s): the unplug ' + (ctlSpoken.probeHeld ? 'took' : 'DID NOT TAKE') : 'no probe line on stderr'));
    if (ctlSpoken.ok) {
      const f = (p) => (p ? p.native + ',' + p.correct : '-');
      say('EXACT-KINDS control, second arm (organism native,correct: kinds only unplugged | kinds and spoken unplugged | as is):');
      for (const [k, c] of Object.entries(ctlSpoken.kinds)) {
        const moved = ctlSpoken.kindsMovedBySpoken.includes(k);
        if (c.nine || moved || !c.keptByThisItem) say('EXACT-KINDS control2 ' + (c.nine ? 'nine ' : 'other ') + k + ': ' + f(ctlSpoken.spokenByKind[k].kindsOnly) + ' | ' + f(c.unplugged) + ' | ' + f(c.asIs) + (moved ? ' (moved by the spoken rewrites)' : ''));
      }
      say('EXACT-KINDS control (kinds only unplugged): ' + (ctl.ok ? ctl.otherKinds + ' other kinds, kept by this item: ' + ctl.otherKindsKept + '; other kinds moved by this item: ' + (ctl.otherKindsMovedByThisItem.join(', ') || 'none') : 'FAILED'));
      say('EXACT-KINDS control (kinds and spoken unplugged): ' + ctlSpoken.otherKinds + ' other kinds, kept by this item and the spoken rewrites together: ' + ctlSpoken.otherKindsKept + '; other kinds they moved: ' + (ctlSpoken.otherKindsMovedByThisItem.join(', ') || 'none') + '; kinds moved by the spoken rewrites alone (kinds only vs kinds and spoken unplugged): ' + (ctlSpoken.kindsMovedBySpoken.join(', ') || 'none'));
      say('EXACT-KINDS control child line (kinds only unplugged): ' + (ctl.ok ? ctl.lines.unplugged : 'n/a'));
      say('EXACT-KINDS control child line (kinds and spoken unplugged): ' + ctlSpoken.lines.unplugged);
      say('EXACT-KINDS control child line (as is): ' + ctlSpoken.lines.asIs);
    } else say('EXACT-KINDS control, second arm FAILED: ' + ctlSpoken.why);
  }

  const wrongRows = [...solveDev.wrong, ...solveHeld.wrong, ...askDev.wrong, ...askHeld.wrong];
  const heldShare = solveHeld.total.answeredShare;
  const checks = {
    solveWrongDevelopmentZero: solveDev.total.wrong === 0,
    solveWrongHeldOutZero: solveHeld.total.wrong === 0,
    askWrongDevelopmentZero: askDev.total.wrong === 0,
    askWrongHeldOutZero: askHeld.total.wrong === 0,
    heldOutAnsweredShareAtLeast075: heldShare >= HELDOUT_SHARE_BAR,
    controlRan: ctl.ok === true,
    otherKindsKept: ctl.ok === true && ctl.otherKindsKept === true,
    tests: null,
  };
  if (unplugSpoken) checks.spokenControlRan = ctlSpoken !== null && ctlSpoken.ok === true && ctlSpoken.probeHeld === true; // board 36 (item pins)
  // board 36 (item pins, fix): the second arm rules like the first: every other census kind keeps its organism native and
  // correct counts with the spoken rewrites unplugged too, or the bar is not met (a printed control that cannot fail the bar is not a control)
  if (unplugSpoken) checks.spokenOtherKindsKept = ctlSpoken !== null && ctlSpoken.ok === true && ctlSpoken.otherKindsKept === true;
  const base = {
    at, command: COMMAND, argv: process.argv.slice(2), node: process.version,
    isTheBar: true, barMet: false,
    split: {
      contaminated: CONTAMINATION,
      development: 'bench/conceive-prompts.json, the ' + dev.length + ' census rows of the nine kinds, graded by their own grade field (bench/conceive.mjs gradeAnswer)',
      heldOut: { file: HELDOUT_FILE, rows: held.rows.length, sha256: held.sha256, bytes: held.bytes, written: held.born, modified: held.modified, ruler: 'bench/conceive.mjs exactPass on the row answer' },
    },
    development: { solve: { byKind: solveDev.byKind, total: solveDev.total }, ask: { byKind: askDev.byKind, total: askDev.total }, byKind: solveDev.byKind },
    heldOut: { solve: { byKind: solveHeld.byKind, total: solveHeld.total }, ask: { byKind: askHeld.byKind, total: askHeld.total }, byKind: solveHeld.byKind },
    control: ctl,
    wrongRows,
    ns: { around: 'solve() only, one call per row after one warm pass over the population, process.hrtime.bigint', development: solveDev.ns, heldOut: solveHeld.ns },
    methods: KIND_METHODS,
    checks,
  };
  if (unplugSpoken) { base.command = COMMAND + ' ' + SPOKEN_FLAG; base.controlSpoken = ctlSpoken; } // board 36 (item pins)
  // the verdict is written before the tests run (test/exact-kinds.test.mjs reads its shape and its held-out sha), marked
  // not the bar; the tests' own result then decides, and the file is written again with it
  writeVerdict({ ...base, isTheBar: false, notTheBarBecause: 'written before the tests ran; the run rewrites this file with their result', statement: 'pending the tests' });
  const tests = runTests();
  checks.tests = tests.passed;
  const barMet = Object.values(checks).every((x) => x === true);
  const statement = 'Nine kinds read exactly or refused. Development (' + dev.length + ' census rows): solve answered ' + solveDev.total.answered + ', correct ' + solveDev.total.correct + ', wrong ' + solveDev.total.wrong
    + '; ask (model off) answered ' + askDev.total.answered + ', correct ' + askDev.total.correct + ', wrong ' + askDev.total.wrong + '. Held out (' + held.rows.length + ' rows, contaminated as stated in split): solve answered ' + solveHeld.total.answered
    + ' (share ' + heldShare.toFixed(4) + '), correct ' + solveHeld.total.correct + ', wrong ' + solveHeld.total.wrong + '; ask answered ' + askHeld.total.answered + ', correct ' + askHeld.total.correct + ', wrong ' + askHeld.total.wrong
    + '. Control: ' + (ctl.ok ? ctl.otherKinds + ' other census kinds kept by this item ' + ctl.otherKindsKept + ' (moved since the commit by other work: ' + (ctl.otherKindsMovedSinceCommit.filter((k) => !ctl.otherKindsMovedByThisItem.includes(k)).join(', ') || 'none') + ')' : 'FAILED') + '. Tests ' + (tests.passed ? 'passed' : 'FAILED') + ' (' + tests.tally.join('; ') + ').';
  const v = { ...base, barMet, tests, statement };
  // board 36 (item pins): the second arm in the statement, in the words its lines printed
  if (unplugSpoken) v.statement += ' Second control arm (' + SPOKEN_FLAG + ', act/exact-read.mjs as at ' + SPOKEN_BEFORE_REV + ' and kindsReader off): '
    + (ctlSpoken && ctlSpoken.ok ? 'the unplug ' + (ctlSpoken.probeHeld ? 'took' : 'did not take') + ' (the probe read ' + JSON.stringify(ctlSpoken.probe ? ctlSpoken.probe.unplugged : null) + ' against the tree\'s ' + JSON.stringify(ctlSpoken.probe ? ctlSpoken.probe.tree : null) + '); other kinds kept by this item and the spoken rewrites together ' + ctlSpoken.otherKindsKept + ' (moved: ' + (ctlSpoken.otherKindsMovedByThisItem.join(', ') || 'none') + '); kinds moved by the spoken rewrites alone: ' + (ctlSpoken.kindsMovedBySpoken.join(', ') || 'none') + '.' : 'FAILED (' + (ctlSpoken ? ctlSpoken.why : 'not run') + ').');
  writeVerdict(v);
  say('EXACT-KINDS tests: ' + tests.command + ' -> ' + tests.tally.join(' | ') + (tests.failing.length ? ' FAILING ' + tests.failing.join(' | ') : ''));
  say('EXACT-KINDS isTheBar true barMet ' + barMet + ': held-out answered share ' + heldShare.toFixed(4) + ' (bar ' + HELDOUT_SHARE_BAR + '), wrong solve ' + (solveDev.total.wrong + solveHeld.total.wrong) + ' ask ' + (askDev.total.wrong + askHeld.total.wrong)
    + ', other kinds kept ' + (ctl.ok ? ctl.otherKindsKept : 'n/a') + ', tests ' + tests.passed + '; verdict written to ' + VERDICT_FILE);
  return v;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const v = await run();
  if (!v.barMet) process.exitCode = 1;
}
