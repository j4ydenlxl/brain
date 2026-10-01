#!/usr/bin/env node
// grow/self.mjs: SELF-MODIFY (GROW.md step 6; his NEXT-WEEK.md Day 3: "GROW.md self-modification under the locked
// judge"). One candidate edit per generation to the PROCEDURE (GROW.md, or one existing .mjs or .md under grow/), never
// to the judge: propose writes the SELF BRIEF (the whole prompt of one Claude arm) with this generation's evidence (the
// tournaments and their survival rates, every candidate's verdict line, the blocked lines, the earlier trials); the arm
// writes the whole new file under work/grow/gen-<n>/self/file/<target> and a candidate.json (target, why, hypothesis);
// check grades it offline (the target rule, node --check for a module, the suites run on a scratch copy of the tree with
// the candidate in place); apply puts it in the tree as a TRIAL recorded in grown/self.json with the baseline rate
// (survivors / candidates of the last tournament) and commits it; judge, called by finish of a later generation, keeps
// the edit only when that generation's survival rate is ABOVE the baseline, else writes the file back. A trial whose
// file someone else changed meanwhile is superseded, never clobbered. The same locked judge decides every survival, so
// the edit cannot grade itself. It never opens judge/heldout/, judge/control.jsonl or state/grow/baseline/.
// The tree's earlier attempt, self/trial.mjs and self/apply.mjs (a genome delta on a clone against a matched control,
// through core/gate.mjs), judged circuits, not the procedure; this file judges the procedure by the one number GROW.md
// names, and stores before and after so a cloud checkout that dies loses nothing that was committed (the two copies
// live under grown/self/ only while the trial is pending; git keeps them after the verdict).
// The judge of a trial trusts the locked judge, not the driver: the rate in grown/generations.json must agree with the
// verdict.json files judge/select.mjs wrote for that generation, or the edit goes back.
// A target is the file ON DISK: check and apply resolve it (the native realpath, so a case-insensitive filesystem gives
// the stored name) and run the target rule, NEVER and judge/LOCK.json against the resolved path, so grow/Contract.mjs
// can never write over the locked grow/contract.mjs. The NEO tier (grow/NEO.md, his words: "keep the cells you have, the
// NEO cells generated per task and kept and alters the code") adds grow/neo.mjs and grow/teach.mjs to NEVER: they select
// and admit what the organism grows, and the organism may not edit what grades it; grow/neo-kernel.mjs stays a target.
// Success prints ONE JSON line; a failure one stderr line and a non-zero exit (2: usage); check that finds errors
// prints its JSON line and exits 1. --gen defaults to the last recorded tournament.
//   node grow/self.mjs status [--gen <n>] [--root <dir>]
//   node grow/self.mjs propose [--gen <n>]            the SELF BRIEF: work/grow/gen-<n>/self/brief.md
//   node grow/self.mjs check [--gen <n>]              grade work/grow/gen-<n>/self/candidate.json and its file
//   node grow/self.mjs apply [--gen <n>] [--commit [--no-push]]   the checked candidate into the tree as a trial
//   node grow/self.mjs judge [--gen <m>]              the pending trial judged by generation m's survival rate
// Author: Fable 5.1 orchestrator by hand, Day 3 (2026-10-01), his NEXT-WEEK.md Day 3 and GROW.md step 6.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nextGeneration, conciseDirective, DEFAULT_ROOT, redact, TRAILER, SUITES, pushHead, why1 } from './generation.mjs';

export const LEDGER = 'grown/self.json';
export const KEEP_DIR = 'grown/self';
export const TARGET_RE = /^(GROW\.md|grow\/[A-Za-z0-9][A-Za-z0-9_.-]*\.(mjs|md))$/;
/** Never a candidate: this file (it judges the trial), the cortex rule, the two that produce the result.json the locked
 *  judge reads (an edit there could grade itself up), and the two that select and admit the NEO tier (grow/NEO.md: the
 *  organism may not edit what grades it), that contract itself (his orders, verbatim at its head) and the consistent
 *  measure (grow/measure.mjs: the series its improvement is read from). neverOf adds every file judge/LOCK.json names. */
export const NEVER = Object.freeze(['grow/self.mjs', 'grow/cortex.mjs', 'grow/sandbox.mjs', 'grow/probe.mjs', 'grow/neo.mjs', 'grow/teach.mjs', 'grow/NEO.md', 'grow/measure.mjs']);
export const MAX_BYTES = 300 * 1024;
export const MAX_TEXT = 2000;
/** A GROW.md candidate keeps these (the lock, the self step, the cortex rule, the NEO selector and teacher, the era step (his Order 7: always burning), his directive and the finish line are the procedure's spine). */
export const KEEP = Object.freeze(['## Done', 'judge/verify.mjs', 'LOCK OK', 'grow/self.mjs', 'grow/cortex.mjs', 'grow/neo.mjs', 'grow/teach.mjs', 'grow/era.mjs', 'CONCISE']);
/** A candidate module may not name the files an arm never opens (the judge's held-out truth). */
export const FORBID = Object.freeze(['judge/heldout', 'judge/control.jsonl', 'state/grow/baseline']);
/** The suites a candidate must keep green; suitesWith runs those the checked root holds (a NEO suite not written yet is no failure). */
export const SELF_SUITES = Object.freeze([...SUITES, 'test/grow-generation.test.mjs', 'test/grow-dream.test.mjs', 'test/grow-build.test.mjs', 'test/grow-self.test.mjs', 'test/grow-cortex.test.mjs',
  'test/neo-kernel.test.mjs', 'test/neo.test.mjs', 'test/grow-teach.test.mjs']);
/** Path segments a scratch copy never carries, and the heavy prefixes no grow suite reads. */
export const COPY_SKIP = new Set(['.git', 'node_modules', 'state', 'work', '.vercel']);
export const COPY_SKIP_PREFIX = Object.freeze(['bench/verdicts/', 'site/', 'web/screenshots/', 'viz/', 'docs/boards/']);
const SECRET_RES = [/sk-[A-Za-z0-9_-]{20,}/, /sk_(live|test)_[A-Za-z0-9]{16,}/, /gh[pousr]_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{30,}/, /eyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{8,}/, /AKIA[0-9A-Z]{16}/, /xox[abprs]-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /sb_secret_[A-Za-z0-9_-]{16,}/];
/** The kind of the first secret-shaped string in a text (never the string itself), or null. */
export function secretHit(text) {
  for (const re of SECRET_RES) if (re.test(String(text))) return re.source.slice(0, 12).replace(/[^A-Za-z_ -]/g, '') + '...';
  return null;
}
export const USAGE = [
  'usage: node grow/self.mjs <verb> [flags]   (--root <dir>: another tree root; --gen <n>: the generation)',
  '  status                      the pending trial and the history (' + LEDGER + ')',
  '  propose                     the SELF BRIEF with this generation\'s evidence: work/grow/gen-<n>/self/brief.md',
  '  check                       grade work/grow/gen-<n>/self/candidate.json and the file under self/file/',
  '  apply [--commit [--no-push]]  the checked candidate into the tree as a trial, recorded in ' + LEDGER,
  '  judge                       the pending trial judged by generation <n>\'s survival rate: kept or reverted',
].join('\n');
const MIN = 60000;

class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const posix = (p) => p.split(path.sep).join('/');
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const writeJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const selfDirOf = (root, n) => path.join(root, 'work', 'grow', 'gen-' + n, 'self');
const lastLine = (r) => why1(r); // the line that says why (an Error, a refusal), never the Node banner or a stack frame
const round4 = (x) => Math.round(x * 10000) / 10000;
const clip = (s, k) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > k ? t.slice(0, k - 1) + '~' : t; };
/** The child environment: no test-runner context, no NODE_OPTIONS. */
const childEnv = (env) => { const e = { ...env }; delete e.NODE_TEST_CONTEXT; delete e.NODE_OPTIONS; return e; };

// ---- arguments
const VALUE = new Set(['gen', 'root']);
const BOOL = new Set(['commit', 'no-push']);
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (BOOL.has(name)) { if (eq > 0) throw new Fail('--' + name + ' takes no value', 2); flags[name] = true; continue; }
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (--help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
/** --gen, else the last recorded tournament (the generation finish just shipped), else 1. */
function genOf(flags, root) {
  if (flags.gen === undefined) return Math.max(1, nextGeneration(root) - 1);
  const n = Number(flags.gen);
  if (!Number.isInteger(n) || n < 1) throw new Fail('--gen is an integer from 1, not ' + flags.gen, 2);
  return n;
}
/** Every file judge/LOCK.json names (the judge an edit may never touch). */
export function lockedOf(root) {
  const l = readJson(path.join(root, 'judge', 'LOCK.json'));
  const files = l && l.files;
  const list = Array.isArray(files) ? files.map((f) => (typeof f === 'string' ? f : f && (f.path || f.file))) : files && typeof files === 'object' ? Object.keys(files) : [];
  return list.filter((f) => typeof f === 'string').map((f) => f.replace(/\\/g, '/'));
}
export const neverOf = (root) => [...new Set([...NEVER, ...lockedOf(root)])];

// ---- the ledger and the tournaments
export function readLedger(root) {
  const l = readJson(path.join(root, LEDGER));
  return { trial: l && l.trial && typeof l.trial === 'object' ? l.trial : null, history: l && Array.isArray(l.history) ? l.history : [] };
}
/** survivors / candidates of a generation record over every lane, null without candidates (a rate field written in the record is never read: the lanes are what the forged rule checks). */
export function rateOf(entry) {
  if (!entry || typeof entry !== 'object') return null;
  let candidates = 0, survivors = 0;
  for (const l of Object.values(entry.lanes && typeof entry.lanes === 'object' ? entry.lanes : {})) {
    if (!l || typeof l !== 'object') continue;
    candidates += Number.isInteger(l.candidates) ? l.candidates : 0;
    survivors += Number.isInteger(l.survivors) ? l.survivors : 0;
  }
  if (!candidates) return null;
  return { generation: entry.generation, at: entry.at || null, candidates, survivors, rate: round4(survivors / candidates) };
}
export function tournaments(root) {
  const gs = readJson(path.join(root, 'grown', 'generations.json'));
  return (gs && Array.isArray(gs.generations) ? gs.generations : []).filter((e) => e && Number.isInteger(e.generation)).sort((a, b) => a.generation - b.generation);
}
/** The newest tournament at or before generation n with candidates: the rate a trial must beat. */
export function baselineOf(root, n) {
  const rates = tournaments(root).filter((e) => e.generation <= n).map(rateOf).filter(Boolean);
  return rates.length ? rates[rates.length - 1] : null;
}
/** Every candidate verdict of generation n (work/grow/gen-n/<lane>/<id>/verdict.json): id, lane, survived, the first why line. */
export function verdictsOf(root, n) {
  const gen = path.join(root, 'work', 'grow', 'gen-' + n);
  const out = [];
  let lanes = [];
  try { lanes = fs.readdirSync(gen, { withFileTypes: true }).filter((d) => d.isDirectory() && !['build', 'dream', 'self'].includes(d.name)).map((d) => d.name); } catch { return out; }
  for (const lane of lanes.sort()) {
    let ids = [];
    try { ids = fs.readdirSync(path.join(gen, lane), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name); } catch { continue; }
    for (const id of ids.sort()) {
      if (!fs.existsSync(path.join(gen, lane, id, 'cell.mjs'))) continue; // a candidate is a directory with a cell.mjs
      const v = readJson(path.join(gen, lane, id, 'verdict.json'));
      if (!v || typeof v !== 'object') { out.push({ id, lane, survived: null, why: 'no verdict.json (the candidate never ran)' }); continue; }
      const why = Array.isArray(v.why) && v.why.length ? clip(v.why.join('; '), 300) : v.survived ? 'survived' : 'no why line';
      out.push({ id, lane, survived: v.survived === true, why });
    }
  }
  return out;
}
/** What the locked judge wrote for generation n in the recorded lanes: the verdict.json files counted, null when none is on disk (another checkout ran it). */
export function judgedOf(root, n, lanes = null) {
  const v = verdictsOf(root, n).filter((x) => x.survived !== null && (!lanes || lanes.includes(x.lane)));
  return v.length ? { candidates: v.length, survivors: v.filter((x) => x.survived).length } : null;
}
export function blockedOf(root, n) {
  try { return fs.readFileSync(path.join(root, 'work', 'grow', 'gen-' + n, 'blocked.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => clip(l, 200)); } catch { return []; }
}
/** The files a candidate may be: GROW.md and the existing .mjs and .md files under grow/, never grow/self.mjs, never a locked file. */
export function targetsOf(root) {
  const out = [], never = neverOf(root);
  if (fs.existsSync(path.join(root, 'GROW.md')) && !never.includes('GROW.md')) out.push('GROW.md');
  let names = [];
  try { names = fs.readdirSync(path.join(root, 'grow')).sort(); } catch { names = []; }
  for (const f of names) { const rel = 'grow/' + f; if (TARGET_RE.test(rel) && !never.includes(rel)) out.push(rel); }
  return out;
}

// ---- the target on disk
/** The target as candidate.json names it: forward slashes, no leading ./ (check and apply read it the same way). */
const namedOf = (cand) => (cand && typeof cand.target === 'string' ? cand.target.replace(/\\/g, '/').replace(/^\.\//, '') : '');
/** The identity of a file (device and inode), or null: no file, or a filesystem with no inode numbers. */
const idOf = (f) => { try { const s = fs.statSync(f, { bigint: true }); return s.ino ? s.dev + ':' + s.ino : null; } catch { return null; } };
/**
 * A candidate target as it is on disk: the native realpath of the root and of the joined path (on a case-insensitive
 * filesystem it returns the stored name; the JS realpath keeps the case it was given), relative in posix form; then
 * TARGET_RE, NEVER and judge/LOCK.json on THAT path, compared without case and by file identity. check and apply read
 * and write `abs` only and record `rel`.
 * @param {string} root the tree root
 * @param {string} named the target as candidate.json names it (namedOf)
 * @returns {{ rel: string|null, abs: string|null, error: string|null }} error is null when the target may be edited
 */
export function resolveTarget(root, named) {
  const fail = (error) => ({ rel: null, abs: null, error });
  let base, abs;
  try { base = fs.realpathSync.native(root); } catch (e) { return fail('target: the tree root does not resolve (' + ((e && e.code) || 'error') + ')'); }
  try { abs = fs.realpathSync.native(path.join(root, named)); } catch (e) {
    const code = (e && e.code) || 'error';
    return fail(code === 'ENOENT' || code === 'ENOTDIR' ? 'target: ' + named + ' does not exist in the tree (an edit, not a new file)' : 'target: ' + named + ' does not resolve on disk (' + code + ')');
  }
  const r = path.relative(base, abs);
  if (!r || r === '..' || r.startsWith('..' + path.sep) || path.isAbsolute(r)) return fail('target: ' + named + ' resolves outside the tree');
  const rel = posix(r);
  const shown = rel === named ? rel : named + ' (on disk ' + rel + ')';
  if (!TARGET_RE.test(rel)) return fail('target: ' + shown + ' is not GROW.md or an .mjs or .md under grow/');
  const me = idOf(abs), low = rel.toLowerCase();
  const same = (f) => f.toLowerCase() === low || (me !== null && idOf(path.join(base, f)) === me);
  if (NEVER.some(same)) return fail('target: ' + shown + ' is never a candidate (it judges the trial or produces what the judge reads)');
  if (lockedOf(root).some(same)) return fail('target: ' + shown + ' is locked (judge/LOCK.json names it; only a human session re-locks)');
  if (!fs.statSync(abs).isFile()) return fail('target: ' + shown + ' is not a file');
  return { rel, abs, error: null };
}

// ---- status
function status(root, flags) {
  const n = genOf(flags, root);
  const { trial, history } = readLedger(root);
  return {
    generation: n, next: nextGeneration(root), trial: trial ? { generation: trial.generation, next: trial.next ?? null, target: trial.target, baseline: trial.baseline, appliedAt: trial.appliedAt } : null,
    history: { count: history.length, kept: history.filter((h) => h.verdict === 'kept').length, reverted: history.filter((h) => h.verdict === 'reverted').length, last: history.slice(-3).map((h) => ({ generation: h.generation, target: h.target, verdict: h.verdict, judged: h.judged || null })) },
    baseline: baselineOf(root, n), targets: targetsOf(root), at: new Date().toISOString(),
  };
}

// ---- propose: the SELF BRIEF
export function selfBrief({ n, directive, baseline, rates, verdicts, blocked, history, targets }) {
  const file = 'work/grow/gen-' + n + '/self/file/<target>';
  const cand = 'work/grow/gen-' + n + '/self/candidate.json';
  const rateLine = (r) => 'generation ' + r.generation + ': ' + r.survivors + ' of ' + r.candidates + ' survived, rate ' + r.rate;
  return [
    '# Generation ' + n + ', SELF arm: one edit to the procedure, kept only if the next generation\'s survival rate rises', '',
    'You are the SELF arm of generation ' + n + ' (GROW.md step 6: one candidate edit to GROW.md or to grow/ per generation, kept only when the next generation\'s survival rate rises, judged by the same locked judge).', '',
    directive, '',
    '## The rule', '',
    '- ONE file, and it must already exist: `GROW.md` (the procedure the cortex reads every heartbeat) or one `.mjs` or `.md` under `grow/` (the briefs the arms read are written by `grow/generation.mjs`, the shapes by `grow/CONTRACT.md`). Never ' + NEVER.map((f) => '`' + f + '`').join(', ') + ', never a `.jsonl`, never anything under `judge/` and never a file `judge/LOCK.json` names (the judge is locked; `node judge/verify.mjs` must keep printing `LOCK OK`). The list at the end of the evidence is the whole set.',
    '- Write the WHOLE new file to `' + file + '` (the same relative path under `self/file/`), and `' + cand + '`: `{ "target": "<the path>", "why": "<which line of the evidence below this answers>", "hypothesis": "<why generation ' + (n + 1) + '\'s survival rate will be above the baseline>" }` (each text under ' + MAX_TEXT + ' characters).',
    '- The edit is applied as a TRIAL after this generation ships. Generation ' + (n + 1) + ' runs under it, and its survival rate (survivors / candidates over every lane) must be ABOVE the baseline, ' + (baseline ? rateLine(baseline) : 'none yet') + ', or the file goes back. The judge is the same locked one: an edit that reads `judge/heldout/`, `judge/control.jsonl` or `state/grow/baseline/`, skips `judge/select.mjs`, or quotes a held-out prompt fails the check and the rule.',
    '- A GROW.md candidate keeps the strings ' + KEEP.map((k) => '`' + k + '`').join(', ') + '. A module candidate passes `node --check` and every suite.', '',
    '## The evidence', '',
    '- The tournaments: ' + (rates.length ? rates.map(rateLine).join('; ') : 'none recorded yet') + '.',
    ...(verdicts.length ? ['- This generation\'s candidates (id, lane: the judge\'s first line):', ...verdicts.map((v) => '  - ' + v.id + ', ' + v.lane + ': ' + (v.survived === true ? 'SURVIVED' : v.survived === false ? 'killed' : 'unrun') + '; ' + v.why)] : ['- This generation\'s candidates: none on disk (a cloud generation leaves its verdicts in grown/generations.json only).']),
    ...(blocked.length ? ['- Blocked lines of this generation:', ...blocked.map((l) => '  - ' + l)] : ['- Blocked lines of this generation: none.']),
    ...(history.length ? ['- Earlier trials (do not repeat an edit that was reverted):', ...history.slice(-5).map((h) => '  - generation ' + h.generation + ', ' + h.target + ': ' + h.verdict + (h.judged ? ' (baseline ' + (h.baseline ? h.baseline.rate : '?') + ', generation ' + h.judged.generation + ' rate ' + h.judged.rate + ')' : '') + (h.why ? '; why: ' + clip(h.why, 240) : ''))] : ['- Earlier trials: none.']),
    '- The files you may edit: ' + targets.map((t) => '`' + t + '`').join(', ') + '.', '',
    '## Where a rate is lost', '',
    'A candidate survives only by the conjunction in grow/CONTRACT.md: the lock, a baseline, a clean sandbox run, its tests, no control shadow, every example ok, no held-out leak, a held-out score above the baseline. Read the killed lines above and find the one cause the PROCEDURE can remove (a brief that lets an arm quote a dev row in its examples, a class rule that misleads the shape, a step the cortex skips because GROW.md is unclear); edit for that one cause and say so in `why`. Do not widen what counts as a survivor: the judge is not yours.', '',
    '## Files you may not open', '',
    'Never open, read, list or grep `judge/heldout/`, `judge/control.jsonl` or `state/grow/baseline/`. Do not edit the tree in place: your file goes under `work/grow/gen-' + n + '/self/` only; apply moves it.', '',
    '## How you validate', '',
    'Run `node grow/self.mjs check --gen ' + n + '` until it prints `"ok":true` (it checks the target rule, runs `node --check` on a module, copies the tree to a scratch directory with your file in place and runs the suites there; minutes). Fix the file and re-run.', '',
    '## Your answer', '',
    'One line: the JSON line check printed.', '',
  ].join('\n');
}
function propose(root, flags) {
  const n = genOf(flags, root);
  const dir = selfDirOf(root, n);
  const blockedLines = [];
  const baseline = baselineOf(root, n);
  if (!baseline) blockedLines.push('self: no tournament to beat yet (no generation with candidates in grown/generations.json)');
  else if (baseline.rate >= 1) blockedLines.push('self: every candidate of generation ' + baseline.generation + ' survived (rate ' + baseline.rate + '): no edit can raise it, the procedure stands');
  const { trial, history } = readLedger(root);
  if (trial) blockedLines.push('self: a trial is pending (generation ' + trial.generation + ', ' + trial.target + '); judge it before proposing another');
  const targets = targetsOf(root);
  if (!targets.length) blockedLines.push('self: nothing to edit (no GROW.md and no grow/*.mjs or *.md under ' + root + ')');
  if (blockedLines.length) return { generation: n, brief: null, blocked: blockedLines, at: new Date().toISOString() };
  const rates = tournaments(root).map(rateOf).filter(Boolean).slice(-6);
  const verdicts = verdictsOf(root, n);
  const blocked = blockedOf(root, n);
  const text = selfBrief({ n, directive: conciseDirective(root), baseline, rates, verdicts, blocked, history, targets });
  fs.mkdirSync(dir, { recursive: true });
  const brief = path.join(dir, 'brief.md');
  fs.writeFileSync(brief, text);
  writeJson(path.join(dir, 'evidence.json'), { generation: n, baseline, rates, verdicts, blocked, history: history.slice(-5), targets, at: new Date().toISOString() });
  return { generation: n, brief: posix(path.relative(root, brief)), baseline, candidates: verdicts.length, killed: verdicts.filter((v) => v.survived !== true).length, blocked: [], at: new Date().toISOString() };
}

// ---- check
/** Every file of the tree to copy for a scratch run: git's view when the root is a repository (tracked plus untracked, ignored left out), else a walk. */
export function treeFiles(root) {
  if (fs.existsSync(path.join(root, '.git'))) {
    const r = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
    if (r.status === 0) return String(r.stdout).split('\0').filter(Boolean).filter((f) => keepPath(f) && fs.existsSync(path.join(root, f)));
  }
  const out = [];
  const walk = (rel) => {
    for (const d of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
      const r = rel ? rel + '/' + d.name : d.name;
      if (!keepPath(r)) continue;
      if (d.isDirectory()) walk(r); else if (d.isFile()) out.push(r);
    }
  };
  walk('');
  return out;
}
const keepPath = (rel) => !rel.split('/').some((seg) => COPY_SKIP.has(seg) || seg.startsWith('.env')) && !COPY_SKIP_PREFIX.some((p) => rel.startsWith(p));
function copyTree(root, scratch) {
  let n = 0;
  for (const rel of treeFiles(root)) {
    const to = path.join(scratch, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(root, rel), to);
    n++;
  }
  return n;
}
/** The suites on a scratch copy of the tree with the candidate in place; the tap tallies. */
export function suitesWith(root, target, content, { env = process.env, suites = SELF_SUITES, timeout = 25 * MIN } = {}) {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-self-'));
  const t0 = Date.now();
  try {
    const copied = copyTree(root, scratch);
    const to = path.join(scratch, target);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, content);
    const files = suites.filter((s) => fs.existsSync(path.join(scratch, s)));
    if (!files.length) return { files: 0, copied, pass: null, fail: null, exitCode: null, ms: Date.now() - t0, line: 'no suite to run' };
    const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...files], { cwd: scratch, env: childEnv(env), encoding: 'utf8', timeout, windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
    const num = (re) => { const m = re.exec(String(r.stdout || '')); return m ? Number(m[1]) : null; };
    const failing = [...String(r.stdout || '').matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => clip(m[1], 120)).slice(0, 5);
    return { files: files.length, copied, pass: num(/^# pass (\d+)/m), fail: num(/^# fail (\d+)/m), exitCode: r.status, ms: Date.now() - t0, line: r.status === 0 ? 'ok' : (failing.length ? 'failed: ' + failing.join(' | ') : lastLine(r)) };
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true, maxRetries: 3 });
  }
}
/** The candidate of generation n graded offline; errors is empty when ok. */
export function check(root, n, { env = process.env, suites = SELF_SUITES } = {}) {
  const dir = selfDirOf(root, n);
  const errors = [];
  const out = { ok: false, errors, generation: n, target: null, bytes: 0, changed: null, suites: null, sha: null, at: null };
  const cand = readJson(path.join(dir, 'candidate.json'));
  if (!cand || typeof cand !== 'object') { errors.push('candidate.json: missing or not JSON at work/grow/gen-' + n + '/self/candidate.json'); return out; }
  const named = namedOf(cand);
  out.target = named || null;
  // the name first (the same lines as ever), then the file on disk: the guards bind the RESOLVED path
  let t = null;
  if (!TARGET_RE.test(named)) errors.push('target: "' + clip(cand.target, 80) + '" is not GROW.md or an .mjs or .md under grow/');
  else if (NEVER.includes(named)) errors.push('target: ' + named + ' is never a candidate (it judges the trial or produces what the judge reads)');
  else if (lockedOf(root).includes(named)) errors.push('target: ' + named + ' is locked (judge/LOCK.json names it; only a human session re-locks)');
  else { t = resolveTarget(root, named); if (t.error) errors.push(t.error); else out.target = t.rel; }
  for (const k of ['why', 'hypothesis']) {
    if (typeof cand[k] !== 'string' || !cand[k].trim()) errors.push(k + ': a non-empty string is required in candidate.json');
    else if (cand[k].length > MAX_TEXT) errors.push(k + ': ' + cand[k].length + ' characters, over ' + MAX_TEXT);
  }
  if (errors.length) return out;
  const target = t.rel;
  const file = path.join(dir, 'file', named);
  if (!fs.existsSync(file)) { errors.push('file: the whole new file is missing at work/grow/gen-' + n + '/self/file/' + named); return out; }
  const content = fs.readFileSync(file);
  out.bytes = content.length;
  out.sha = sha256(content);
  if (content.length > MAX_BYTES) errors.push('file: ' + content.length + ' bytes, over ' + MAX_BYTES);
  const before = fs.readFileSync(t.abs);
  out.changed = !before.equals(content);
  if (!out.changed) errors.push('file: identical to the tree\'s ' + target + ' (no edit)');
  const text = content.toString('utf8'), beforeText = before.toString('utf8');
  const hit = secretHit(text);
  if (hit && !secretHit(beforeText)) errors.push('file: a secret-shaped string is in the candidate (' + hit + ')');
  if (target === 'GROW.md') for (const k of KEEP) if (beforeText.includes(k) && !text.includes(k)) errors.push('GROW.md: the candidate dropped "' + k + '"');
  if (target.endsWith('.mjs')) {
    for (const f of FORBID) if (text.includes(f) && !beforeText.includes(f)) errors.push('file: names ' + f + ' (an arm never opens it; the tree\'s file does not name it)');
    const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', windowsHide: true, timeout: MIN });
    if (r.status !== 0) errors.push('node --check: ' + lastLine(r));
  }
  if (errors.length) return out;
  out.suites = suitesWith(root, target, content, { env, suites });
  if (out.suites.exitCode !== 0 && out.suites.files > 0) errors.push('suites: ' + out.suites.files + ' files, # pass ' + out.suites.pass + ', # fail ' + out.suites.fail + ', exit ' + out.suites.exitCode + ': ' + out.suites.line);
  out.ok = errors.length === 0;
  out.at = new Date().toISOString();
  writeJson(path.join(dir, 'check.json'), out);
  return out;
}
function checkVerb(root, flags, env) {
  const n = genOf(flags, root);
  const r = check(root, n, { env });
  if (!r.ok) { const e = new Fail('check failed', 1); e.json = r; throw e; }
  return r;
}

// ---- apply: the trial into the tree
function ship(root, paths, message, blocked, noPush) {
  const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 2 * MIN });
  const add = git(['add', '--', ...paths]);
  if (add.status !== 0) { blocked.push('commit: git add exited ' + add.status + ': ' + lastLine(add)); return { committed: false, pushed: 'skipped: nothing committed' }; }
  if (git(['diff', '--cached', '--quiet', '--', ...paths]).status === 0) return { committed: 'nothing to commit', pushed: 'skipped: nothing committed' };
  const email = String(git(['config', 'user.email']).stdout || '').trim() || 'j4ydenlxl@users.noreply.github.com';
  const cm = git(['-c', 'user.name=jayden', '-c', 'user.email=' + email, 'commit', '-m', message, '-m', TRAILER, '--', ...paths]);
  if (cm.status !== 0) { blocked.push('commit: git commit exited ' + cm.status + ': ' + lastLine(cm)); return { committed: false, pushed: 'skipped: nothing committed' }; }
  if (noPush) return { committed: true, pushed: 'skipped (--no-push)' };
  const ps = pushHead(root);
  if (!ps.ok) blocked.push('push: ' + ps.why + ' (the commit stays)');
  return { committed: true, pushed: ps.ok };
}
function apply(root, flags, env) {
  const n = genOf(flags, root);
  const dir = selfDirOf(root, n);
  const blocked = [];
  const ledger = readLedger(root);
  if (ledger.trial) return { generation: n, applied: false, blocked: ['self: a trial is pending (generation ' + ledger.trial.generation + ', ' + ledger.trial.target + '); judge it first'], at: new Date().toISOString() };
  const baseline = baselineOf(root, n);
  if (!baseline) return { generation: n, applied: false, blocked: ['self: no tournament to beat yet (no generation with candidates in grown/generations.json)'], at: new Date().toISOString() };
  // ALWAYS a fresh check: check.json sits where the self arm writes, so a recorded ok proves nothing (a forged
  // { ok: true, target, sha, generation } would skip node --check and the suites)
  const cand = readJson(path.join(dir, 'candidate.json'));
  const named = namedOf(cand); // as check reads it; the arm's file sits under self/file/ by this name
  const file = named ? path.join(dir, 'file', named) : null;
  const c = check(root, n, { env });
  if (!c.ok) return { generation: n, applied: false, target: c.target, blocked: c.errors.map((e) => 'self: ' + e), at: new Date().toISOString() };
  // resolved again right before the write: the file check graded is the file written, read and recorded
  const t = resolveTarget(root, named);
  const after = fs.readFileSync(file);
  const moved = t.error || (t.rel !== c.target ? 'target: ' + named + ' now resolves to ' + t.rel + ', not the ' + c.target + ' check graded' : sha256(after) !== c.sha ? 'file: changed since its check' : null);
  if (moved) return { generation: n, applied: false, target: c.target, blocked: ['self: ' + moved], at: new Date().toISOString() };
  const target = t.rel;
  const before = fs.readFileSync(t.abs);
  const base = path.basename(target);
  const keepBefore = KEEP_DIR + '/trial-' + n + '.before.' + base, keepAfter = KEEP_DIR + '/trial-' + n + '.after.' + base;
  fs.mkdirSync(path.join(root, KEEP_DIR), { recursive: true });
  fs.writeFileSync(path.join(root, keepBefore), before);
  fs.writeFileSync(path.join(root, keepAfter), after);
  fs.writeFileSync(t.abs, after);
  // next: the first generation that runs wholly under the edit; the first recorded tournament from it on judges the trial
  const trial = {
    generation: n, next: Math.max(n + 1, nextGeneration(root)), target, ...(named !== target ? { named } : {}), why: clip(cand.why, MAX_TEXT), hypothesis: clip(cand.hypothesis, MAX_TEXT), baseline,
    before: { file: keepBefore, sha: sha256(before), bytes: before.length }, after: { file: keepAfter, sha: sha256(after), bytes: after.length },
    check: { suites: c.suites ? { files: c.suites.files, pass: c.suites.pass, fail: c.suites.fail, exitCode: c.suites.exitCode } : null, at: c.at }, appliedAt: new Date().toISOString(),
  };
  writeJson(path.join(root, LEDGER), { trial, history: ledger.history });
  let committed = 'skipped (no --commit)', pushed = 'skipped (no --commit)';
  if (flags.commit) ({ committed, pushed } = ship(root, [target, LEDGER, KEEP_DIR], 'self: trial ' + target + ' after gen ' + n + ' (baseline ' + baseline.rate + ')', blocked, flags['no-push']));
  return { generation: n, applied: true, next: trial.next, target, baseline, before: trial.before, after: trial.after, committed, pushed, blocked, at: trial.appliedAt };
}

// ---- judge: the pending trial by generation m's rate
/** The paths finish must commit beside grown/: the target of the last trial when it was written back and the tree still holds that text. */
export function shipOf(root) {
  const h = readLedger(root).history;
  const last = h[h.length - 1];
  if (!last || last.verdict !== 'reverted' || !last.before) return [];
  const f = path.join(root, last.target);
  return fs.existsSync(f) && sha256(fs.readFileSync(f)) === last.before.sha ? [last.target] : [];
}
export function judge(root, m) {
  const ledger = readLedger(root);
  const t = ledger.trial;
  const at = new Date().toISOString();
  if (!t) return { generation: m, verdict: 'none', target: null, reason: 'no trial pending', ship: shipOf(root), at };
  const pending = (reason) => ({ generation: m, verdict: 'pending', target: t.target, baseline: t.baseline, reason, ship: [], at });
  const from = Number.isInteger(t.next) ? t.next : t.generation + 1;
  if (m < from) return pending('generation ' + m + ' did not run under the trial (applied after generation ' + t.generation + '); generation ' + from + ' or later judges');
  const entry = tournaments(root).find((e) => e.generation === m);
  const judged = rateOf(entry);
  if (!judged) return pending(entry ? 'generation ' + m + ' had no candidates' : 'generation ' + m + ' is not recorded in grown/generations.json');
  const file = path.join(root, t.target);
  const now = fs.existsSync(file) ? sha256(fs.readFileSync(file)) : null;
  const beforeFile = path.join(root, t.before.file);
  const beforeOk = fs.existsSync(beforeFile) && sha256(fs.readFileSync(beforeFile)) === t.before.sha;
  // the rate is the locked judge's, not the driver's: a record with more survivors, or fewer candidates, than the
  // verdict.json files judge/select.mjs wrote for generation m is not a rate (a withdrawn class has no verdict file
  // and still counts as a candidate, so the record may hold more candidates, never fewer)
  const seen = judgedOf(root, m, Object.keys(entry.lanes || {}));
  const forged = Boolean(seen) && (seen.survivors < judged.survivors || seen.candidates > judged.candidates);
  let verdict, reason;
  if (now !== t.after.sha) { verdict = 'superseded'; reason = t.target + ' changed since the trial (sha ' + String(now).slice(0, 12) + ' is not the trial\'s ' + t.after.sha.slice(0, 12) + '); left as it is'; }
  else if (!forged && judged.rate > t.baseline.rate) { verdict = 'kept'; reason = 'rate ' + judged.rate + ' (' + judged.survivors + ' of ' + judged.candidates + ') is above the baseline ' + t.baseline.rate; }
  else if (!beforeOk) return pending('the trial did not hold and ' + t.before.file + ' is missing or changed: a human session restores ' + t.target);
  else {
    verdict = 'reverted';
    reason = (forged ? 'the record (' + judged.survivors + ' of ' + judged.candidates + ') is not what the judge wrote (' + seen.survivors + ' of ' + seen.candidates + ' in the verdict files)' : 'rate ' + judged.rate + ' (' + judged.survivors + ' of ' + judged.candidates + ') is not above the baseline ' + t.baseline.rate) + '; ' + t.target + ' written back';
    fs.writeFileSync(file, fs.readFileSync(beforeFile));
  }
  // the two copies leave the tree with the verdict (git keeps them); the ledger keeps their sha
  for (const f of [t.before.file, t.after.file]) fs.rmSync(path.join(root, f), { force: true });
  const done = { ...t, verdict, judged, reason, judgedAt: at };
  writeJson(path.join(root, LEDGER), { trial: null, history: [...ledger.history, done] });
  return { generation: m, verdict, target: t.target, baseline: t.baseline, judged, reason, ship: verdict === 'reverted' ? [t.target] : [], at };
}

// ---- main
export async function main(argv, env = process.env) {
  const { verb, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (verb === 'status') return status(root, flags);
  if (verb === 'propose') return propose(root, flags);
  if (verb === 'check') return checkVerb(root, flags, env);
  if (verb === 'apply') return apply(root, flags, env);
  if (verb === 'judge') return judge(root, genOf(flags, root));
  throw new Fail('unknown verb ' + verb + ': status, propose, check, apply or judge (--help)', 2);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    if (e && e.json) { process.stdout.write(JSON.stringify(e.json) + '\n'); done(e.code); return; }
    process.stderr.write(redact(e instanceof Fail ? e.message : 'self failed: ' + ((e && e.stack) || e)).split('\n')[0] + '\n');
    done(e instanceof Fail ? e.code : 1);
  });
}
