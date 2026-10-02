#!/usr/bin/env node
// grow/measure.mjs: THE MEASURE (grow/NEO.md, "Order 7: always burning", MEASURE): the visible, constant improvement test,
// and the part that measures itself and finds new ways to measure.
// His words (2026-10-01, verbatim at the head of NEO.md): "orthogonally automatically measure, iterate, and improve itself,
// over consistent measures always on in the background ... and visible constant improvement test", "it never stops, and
// always finds ways to emasure itself and get better, and to make iteration velocity", "everything it generates should be
// effective, self assessing", and "All native btw, its ai data center in ur pocket, none of that ollama crap". No model
// call anywhere here; only node: builtins; it runs the same on a GitHub runner, a cloud VM or a PC.
// run appends ONE row to grown/measure.jsonl, the SAME measures every time, never rewriting a row before it:
//   { at, era, generation,
//     locked: { classes, mean, byClass, knowledge, ruler: "organism", via: { <cls>: { own, other, ask, by } } },
//     neo: { tasks, colonies, cells, mastered, serving, heldout: { ok, n, score }, ruler: "colony" },
//     generated, absorbed: { bytes, rows, sources }, syllabus: { skills, opened, pending }, ladder: { composite, at } | null,
//     velocity: { cellsPerSecond, tasksPerMinute, masteredPerEra, eraMs, workers, era }, plateau,
//     regressions: { count, tasks: [{ task, before, after }] }, knowledge: { mastered: { backed, plain }, colonies: {..} },
//     trials: { rows, kept, reverted, byKind, skipped, truncated }, sources: { registry, domains },
//     frontier: { seeds, queue, seen, repos, added },
//     bodies: { eras, by: { <body>: eras } }, probes: { proposed, total, opened }, ms, partMs: { <part>: ms }, blocked: [..] }
// TWO RULERS, NAMED (the disagreement of 2026-10-01: the measure printed locked math 0.8571 and writing 0.6667 while
// grown/index.json holds 1 and 0.9167; both are right, they measure different things):
//   locked.byClass (ruler "organism"): the organism END TO END on the class's held-out rows, exactly as the site serves it:
//     judge/baseline.mjs runs act/prompt.mjs ask() (which consults grown/ itself and prefixes a grown cell's answer with its
//     provenance line) and grown/index.mjs grownAnswer on a refusal, and grades the TEXT. A cell earlier in the index order
//     can claim a prompt of another class (shadowing), and the provenance line counts against maxWords and notContains.
//   grown/index.json heldout (and neo.heldout, ruler "colony"): the cell or colony ALONE on the same rows when it was
//     selected (judge/select.mjs, grow/neo.mjs SELECT): its own can and answer, no ask() in front, no provenance line.
//   locked.via shows the gap row by row as counts [ok, n]: own (the class's own cell answered), other (another cell
//     answered; by names those cells), ask (ask() answered without a cell). The knowledge pack is not the cause: the
//     organism scores the same with --knowledge none on those classes.
// Each part reads only its own sources (SOURCES below). A part that cannot be read is null with a blocked line, and the
// row is still appended. An input that does not exist yet (a file another part writes when it lands) is null with no
// blocked line: absent is not broken, and never a guess. velocity and plateau are the series' own derivative: they read
// the last rows of grown/measure.jsonl (a bounded tail) besides their sources.
// SELF-MADE MEASURES: run also proposes the organism's own next probes, from what it holds: for every column pair of a
// knowledge pack (neo/know/INDEX.json) with no task yet, one line in neo/probes.jsonl (a task the teacher could open: the
// pack, the key column, the value column, a question template built from the column names), at most PROBES_PER_RUN a run,
// deduplicated, and only a pair whose key column holds enough unambiguous keys for a dev set and a held-out set.
// neo/MEASURE.json is the snapshot of every colony's held-out [ok, n] at the last run: regressions are read against it.
// The measure never opens judge/heldout/, judge/control.jsonl, state/ or any neo/tasks/*/heldout.jsonl: every read here
// goes through guardedPath, which REFUSES those paths. The locked classes are read by NAME (judge/dev/<cls>.jsonl is never
// opened) and graded by `node judge/baseline.mjs <cls>` as a child, whose --out goes to a temporary directory removed
// after the run (the measure counts its rows by route and never copies a prompt or an answer), so the child does not
// write state/ either. Every reader is bounded: a JSON file over JSON_MAX_BYTES is refused, a JSON-lines file is read
// from its newest bytes (TAIL_BYTES for the series, JSONL_MAX_BYTES for counts, marked truncated), a torn line is skipped.
// Writes: grown/measure.jsonl (append), neo/MEASURE.json (replaced whole), neo/probes.jsonl (append). Nothing else.
// Success prints ONE JSON line; a failure one stderr line and a non-zero exit (2: usage).
//   node grow/measure.mjs run [--era <e>] [--gen <n>] [--max-ms <n>] [--jobs 4] [--timeout-ms 900000]   [--root <dir>]
//   node grow/measure.mjs series [--last 200]
// Author: Opus 5.5 builder (MEASURE) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7 and his 20:51Z order.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const MEASURE_FILE = 'grown/measure.jsonl';
export const SNAPSHOT_FILE = 'neo/MEASURE.json';
export const PROBES_FILE = 'neo/probes.jsonl';
export const KNOW_INDEX = 'neo/know/INDEX.json';
export const ERA_FILE = 'neo/ERA.json';
export const TRIALS_FILE = 'neo/TRIALS.jsonl';
export const SOURCES_FILE = 'neo/sources.json';
export const FRONTIER_FILE = 'neo/frontier-seeds.json';
export const FRONTIER_STATE = 'neo/frontier.json';
export const CLASS_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
/** grow/teach.mjs TASK_RE (a probe's task name must be one the teacher can open). */
export const TASK_RE = /^[a-z0-9][a-z0-9-]{2,40}$/;
export const PACK_RE = /^[a-z0-9-]+$/;
/** The row's keys, in order: the same every time, whatever could be read. */
export const ROW_KEYS = Object.freeze(['at', 'era', 'generation', 'locked', 'neo', 'generated', 'absorbed', 'syllabus', 'ladder',
  'velocity', 'plateau', 'regressions', 'knowledge', 'trials', 'sources', 'frontier', 'bodies', 'probes', 'ms', 'partMs', 'blocked']);
/** The parts, in row order (each a key of the row and of partMs). */
export const PARTS = Object.freeze(['locked', 'neo', 'generated', 'absorbed', 'syllabus', 'ladder', 'velocity', 'plateau', 'regressions',
  'knowledge', 'trials', 'sources', 'frontier', 'bodies', 'probes']);
/** What series takes last minus first of. */
export const DELTA_KEYS = Object.freeze(['lockedMean', 'neoTasks', 'neoMastered', 'cells', 'generated']);
export const VELOCITY_KEYS = Object.freeze(['cellsPerSecond', 'tasksPerMinute', 'masteredPerEra', 'eraMs', 'workers', 'era']);
/** Each part and the only things it reads. */
export const SOURCES = Object.freeze({
  locked: ['judge/dev/ (names only)', 'node judge/baseline.mjs <cls> (its line and its --out rows, counted by route)'],
  neo: ['grown/index.json', 'neo/LEDGER.json', 'node grow/neo.mjs status'],
  generated: ['neo/LEDGER.json'],
  absorbed: ['neo/ABSORB.json'],
  syllabus: ['node grow/teach.mjs status'],
  ladder: ['bench/verdicts/ladder.json'],
  velocity: ['neo/ERA.json (the era row)', 'neo/LEDGER.json', 'grown/index.json', 'grown/measure.jsonl (the last rows)'],
  plateau: ['grown/index.json', 'grown/measure.jsonl (the last rows)'],
  regressions: ['grown/index.json', SNAPSHOT_FILE],
  knowledge: ['grown/index.json'],
  trials: [TRIALS_FILE],
  sources: [SOURCES_FILE],
  frontier: [FRONTIER_FILE, FRONTIER_STATE],
  bodies: ['neo/ERA.json'],
  probes: [KNOW_INDEX, 'neo/know/<id>.json', 'neo/LEDGER.json', PROBES_FILE],
});
/** What each score is (see the head of this file). */
export const RULERS = Object.freeze({
  organism: 'the organism end to end on the held-out rows: judge/baseline.mjs (act/prompt.mjs ask(), then grown/index.mjs grownAnswer on a refusal), the text as the site serves it',
  colony: 'the cell or colony alone on its held-out rows when it was selected (judge/select.mjs, grow/neo.mjs SELECT): its own can and answer',
});
export const DEFAULTS = Object.freeze({ last: 200, jobs: 4, timeoutMs: 15 * 60 * 1000 });
export const LIMITS = Object.freeze({ last: 1000000, jobs: 32, timeoutMs: 6 * 60 * 60 * 1000 });
export const BOUNDS = Object.freeze({
  TAIL_BYTES: 8 * 1024 * 1024, // the newest bytes of grown/measure.jsonl any reader holds
  JSONL_MAX_BYTES: 64 * 1024 * 1024, // the newest bytes of a counted JSON-lines file (trials, probes)
  JSON_MAX_BYTES: 64 * 1024 * 1024, // a JSON file larger than this is not parsed
  PACK_MAX_BYTES: 2 * 1024 * 1024, // c5: at most 2 MB a pack
  PACKS_MAX_BYTES: 30 * 1024 * 1024, // c5: 30 MB in all
  PROBES_PER_RUN: 20,
  PROBE_MIN_KEYS: 30, // grow/teach.mjs: a dev set of at least 20 rows and a held-out set of at least 10
  REGRESSIONS_NAMED: 50,
  BODY_WINDOW_MS: 24 * 60 * 60 * 1000,
  VIA_BY: 10,
  CHILD_FLOOR_MS: 1000,
});
/** Never opened by the measure (paths relative to the root, compared lower case). */
export const NEVER_READ = Object.freeze([/^judge\/heldout(?:\/|$)/, /^judge\/control\.jsonl$/, /^state(?:\/|$)/, /^neo\/tasks\/[^/]+\/heldout\.jsonl$/]);
export const USAGE = [
  'usage: node grow/measure.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  run [--era <e>] [--gen <n>] [--max-ms <n>] [--jobs ' + DEFAULTS.jobs + '] [--timeout-ms ' + DEFAULTS.timeoutMs + ']   append one row to ' + MEASURE_FILE,
  '  series [--last ' + DEFAULTS.last + ']                                       { rows, first, last, delta } over the last rows',
].join('\n');

export class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const posix = (p) => p.split(path.sep).join('/');
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);
const isCount = (x) => Number.isInteger(x) && x >= 0;
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
const round4 = (x) => Math.round(x * 1e4) / 1e4;
/** A monotonic clock in ms (a wall clock that jumps back never makes ms negative). */
const mono = () => Number(process.hrtime.bigint() / 1000000n);
export const redact = (s) => String(s ?? '').replace(/eyJ[A-Za-z0-9_.-]+/g, '<token>').replace(/\b(?:sk|ghp|gho|github_pat|xox[a-z])[-_][A-Za-z0-9_-]{8,}/g, '<token>');
const first = (e) => String((e && e.message) || e).split('\n')[0];
const objs = (s) => String(s || '').split(/\r?\n/).flatMap((l) => { const t = l.trim(); if (!t.startsWith('{')) return []; try { const j = JSON.parse(t); return isObj(j) ? [j] : []; } catch { return []; } });
/** The last JSON object line a child printed, or null. */
export const lastJson = (s) => objs(s).pop() || null;
const NOISE = /^(node:internal\/|at |\^|throw err;|Node\.js v|code: '|[{}()\[\];]*$)/;
const said = (s) => String(s || '').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !NOISE.test(l));
const pick = (ls) => ls.find((l) => /\b\w*Error\b:|\bFail\b:|refused|expired|failed|^usage:/i.test(l)) || ls[ls.length - 1] || '';
/** The one line that says why a child failed (stderr before stdout), redacted and cut. */
export const whyOf = (r) => redact(r.timedOut ? 'timed out after ' + r.timeoutMs + ' ms' : pick(said(r.stderr)) || pick(said(r.stdout)) || (r.error ? String(r.error.code || r.error.message) : 'no output')).slice(0, 300);
const parseObj = (line) => { const t = String(line).trim(); if (!t.startsWith('{')) return null; try { const j = JSON.parse(t); return isObj(j) ? j : null; } catch { return null; } };
const sha6 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 6);

/** True when the measure may not open this path (judge/heldout/, judge/control.jsonl, state/, a task's heldout.jsonl). */
export function refusedPath(root, p) {
  const rel = posix(path.relative(path.resolve(root), path.resolve(root, p))).toLowerCase();
  return NEVER_READ.some((re) => re.test(rel));
}
/** The absolute path of a file the measure may open; a forbidden path is REFUSED (a throw), not merely avoided. */
export function guardedPath(root, rel) {
  if (refusedPath(root, rel)) throw new Fail('refused: the measure never opens ' + posix(String(rel)));
  return path.resolve(root, rel);
}
/** Every whole-file read goes through here. */
export function readGuarded(root, rel) {
  return fs.readFileSync(guardedPath(root, rel), 'utf8');
}
/** A JSON file through the guard, at most JSON_MAX_BYTES: { value } or { why, absent } (absent: the file is not there). */
export function readJsonPart(root, rel, { maxBytes = BOUNDS.JSON_MAX_BYTES } = {}) {
  let text;
  try {
    const f = guardedPath(root, rel);
    const size = fs.statSync(f).size;
    if (size > maxBytes) return { why: rel + ' is ' + size + ' bytes, over the ' + maxBytes + ' a JSON file may be' };
    text = fs.readFileSync(f, 'utf8');
  } catch (e) {
    if (e instanceof Fail) return { why: e.message };
    if (e && e.code === 'ENOENT') return { why: rel + ' is not there', absent: true };
    return { why: rel + ' cannot be read (' + first(e) + ')' };
  }
  try { return { value: JSON.parse(text) }; } catch (e) { return { why: rel + ' is not JSON (' + first(e) + ')' }; }
}

/**
 * The newest lines of a JSON-lines file, bounded: at most maxBytes are read, in chunks, from the end of the file; when
 * the file is larger the first line of the window is dropped when it is partial (the byte before the window is not a
 * newline) and truncated is true. fn(line) for each line in
 * file order (a last line without a newline is still a line: JSON decides whether it was torn). A missing file throws
 * ENOENT; a refused path throws Fail.
 * @returns {{ truncated: boolean, bytes: number, lines: number }}
 */
export function scanLines(root, rel, fn, { maxBytes = BOUNDS.JSONL_MAX_BYTES, chunk = 1024 * 1024 } = {}) {
  const fd = fs.openSync(guardedPath(root, rel), 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const start = size > maxBytes ? size - maxBytes : 0;
    let skipFirst = false;
    if (start > 0) { const b = Buffer.alloc(1); fs.readSync(fd, b, 0, 1, start - 1); skipFirst = b[0] !== 0x0a; } // a window that starts on a line start keeps it
    let pos = start, carry = Buffer.alloc(0), lines = 0;
    const emit = (buf) => { if (skipFirst) { skipFirst = false; return; } lines++; fn(buf.toString('utf8')); };
    while (pos < size) {
      const want = Math.min(chunk, size - pos);
      const b = Buffer.alloc(want);
      const got = fs.readSync(fd, b, 0, want, pos);
      if (got <= 0) break;
      pos += got;
      let buf = carry.length ? Buffer.concat([carry, b.subarray(0, got)]) : b.subarray(0, got);
      let i;
      while ((i = buf.indexOf(0x0a)) >= 0) { emit(buf.subarray(0, i)); buf = buf.subarray(i + 1); }
      carry = Buffer.from(buf);
    }
    if (carry.length) emit(carry);
    return { truncated: start > 0, bytes: size - start, lines };
  } finally { fs.closeSync(fd); }
}

/** The run's memoized reads: each JSON source is read once a run, whatever parts read it. */
export function readsOf(root) {
  const memo = new Map();
  return { root, json: (rel) => { if (!memo.has(rel)) memo.set(rel, readJsonPart(root, rel)); return memo.get(rel); } };
}

/** One child: node <root>/<script> args, cwd the root, the environment passed through; never throws. */
export function runChild(root, script, args = [], { timeoutMs = DEFAULTS.timeoutMs, env = process.env } = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, [path.join(root, script), ...args], { cwd: root, env, encoding: 'utf8', timeout: timeoutMs, killSignal: 'SIGKILL', windowsHide: true, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      const timedOut = Boolean(err && err.killed && err.signal);
      const code = !err ? 0 : Number.isInteger(err.code) ? err.code : 1;
      resolve({ code, stdout: String(stdout || ''), stderr: String(stderr || ''), error: err && !Number.isInteger(err.code) ? err : null, timedOut, timeoutMs });
    });
  });
}
/** fn over items with at most `jobs` running at once; results in item order. */
async function pool(items, jobs, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => { while (next < items.length) { const k = next++; out[k] = await fn(items[k], k); } };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(jobs, items.length)) }, worker));
  return out;
}
/** A child's timeout: the flag's, cut to what is left of --max-ms, never under CHILD_FLOOR_MS. */
const childMs = (timeoutMs, deadline) => (deadline === null || deadline === undefined ? timeoutMs : Math.max(BOUNDS.CHILD_FLOOR_MS, Math.min(timeoutMs, deadline - mono())));

// ---- the parts: each returns { value, blocked: [lines] }; value null when it cannot be read

/** The locked classes: the basenames of judge/dev/*.jsonl, by NAME (no file of judge/dev/ is opened). */
export function lockedClasses(root) {
  return fs.readdirSync(path.join(root, 'judge', 'dev')).filter((f) => f.endsWith('.jsonl')).map((f) => f.slice(0, -'.jsonl'.length)).filter((c) => CLASS_RE.test(c)).sort();
}

/** True when a cell id is one of the class's own cells (grow/store.mjs ids: <cls>-<lane>-g<gen>[-<k>]). */
export const ownCell = (cls, id) => CLASS_RE.test(cls) && new RegExp('^' + cls + '-[a-z]+-g\\d+(?:-\\d+)?$').test(String(id));
/**
 * The rows of a baseline --out document counted by who answered, as [ok, n]: own (the class's own cell), other (another
 * cell: by names at most VIA_BY of them), ask (ask() without a cell). Never a prompt or an answer. Null when the document
 * does not carry { rows: [{ ok, via }] }.
 */
export function viaOf(cls, doc) {
  if (!isObj(doc) || !Array.isArray(doc.rows)) return null;
  const v = { own: [0, 0], other: [0, 0], ask: [0, 0] }, by = new Set();
  for (const r of doc.rows) {
    if (!isObj(r) || typeof r.ok !== 'boolean') return null;
    const via = typeof r.via === 'string' ? r.via : '';
    const id = via.startsWith('grown:') ? via.slice('grown:'.length) : null;
    const k = id === null ? 'ask' : ownCell(cls, id) ? 'own' : 'other';
    v[k][1]++;
    if (r.ok) v[k][0]++;
    if (k === 'other' && /^[a-z0-9][a-z0-9-]{0,80}$/.test(id)) by.add(id);
  }
  return { ...v, by: [...by].sort().slice(0, BOUNDS.VIA_BY) };
}

/**
 * locked: `node judge/baseline.mjs <cls> --out <tmp>` for every locked class, at most `jobs` at once. byClass holds each
 * printed score (null for a class that did not measure); mean is the mean of the scores only when EVERY class measured
 * (a mean over fewer classes is another ruler); knowledge the distinct knowledge each child said it used; via the rows
 * of each --out document counted by who answered (viaOf). Ruler "organism" (RULERS).
 */
export async function lockedPart(root, { jobs = DEFAULTS.jobs, timeoutMs = DEFAULTS.timeoutMs, env = process.env, deadline = null } = {}) {
  const blocked = [];
  let classes;
  try { classes = lockedClasses(root); } catch (e) { return { value: null, blocked: ['locked: judge/dev/ cannot be listed (' + first(e) + ')'] }; }
  if (!classes.length) return { value: null, blocked: ['locked: judge/dev/ names no class'] };
  if (!fs.existsSync(path.join(root, 'judge', 'baseline.mjs'))) return { value: null, blocked: ['locked: judge/baseline.mjs is not on disk'] };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-measure-'));
  try {
    const got = await pool(classes, jobs, (cls) => runChild(root, 'judge/baseline.mjs', [cls, '--out', path.join(tmp, cls + '.json')], { timeoutMs: childMs(timeoutMs, deadline), env }));
    const byClass = {}, via = {}, knowledge = new Set();
    classes.forEach((cls, i) => {
      const r = got[i], j = r.code === 0 ? lastJson(r.stdout) : null;
      if (j && j.class === cls && isNum(j.score) && j.score >= 0 && j.score <= 1) {
        byClass[cls] = j.score;
        if (typeof j.knowledge === 'string') knowledge.add(j.knowledge);
        const out = readJsonPart(tmp, cls + '.json');
        via[cls] = out.why ? null : viaOf(cls, out.value);
        if (via[cls] === null) blocked.push('locked: ' + cls + ': the baseline --out document holds no { rows: [{ ok, via }] }: its rows are not counted');
      } else {
        byClass[cls] = null;
        via[cls] = null;
        blocked.push('locked: ' + cls + ': node judge/baseline.mjs ' + cls + ' ' + (r.code === 0 ? 'printed no { class, score } line' : 'exited ' + r.code) + ': ' + whyOf(r));
      }
    });
    const scores = Object.values(byClass);
    const missing = scores.filter((s) => s === null).length;
    if (missing) blocked.push('locked: mean not taken: ' + missing + ' of ' + classes.length + ' classes did not measure');
    const mean = missing ? null : round4(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { value: { classes: classes.length, mean, byClass, knowledge: [...knowledge].sort(), ruler: 'organism', via }, blocked };
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* the OS cleans its tmp */ }
  }
}

/** The ledger's well formed task rows (teach.mjs readLedger's rule), or a why. */
function ledgerOf(ctx) {
  const j = ctx.json('neo/LEDGER.json');
  if (j.why) return { why: j.why };
  if (!isObj(j.value) || !Array.isArray(j.value.tasks)) return { why: 'neo/LEDGER.json is not { tasks: [..], generated }' };
  return { doc: j.value, tasks: j.value.tasks.filter((r) => isObj(r) && typeof r.task === 'string') };
}

const isMastered = (c) => c.n > 0 && c.ok === c.n;
/**
 * The tier "neo" rows of grown/index.json, one colony a task (a later row of a task replaces an earlier one), as
 * Map(task -> { ok, n, know, serve }); know is true only on a row tagged knowledge-backed (c5), serve is the row's
 * boolean or null (c2). A why when the index cannot be read or a tier "neo" row has no readable heldout.
 */
export function coloniesOf(ctx) {
  const ix = ctx.json('grown/index.json');
  if (ix.why) return { why: ix.why };
  if (!isObj(ix.value) || !Array.isArray(ix.value.cells)) return { why: 'grown/index.json is not { generation, cells: [..] }' };
  const byTask = new Map();
  let bad = 0;
  for (const c of ix.value.cells) {
    if (!isObj(c) || c.tier !== 'neo') continue;
    const task = typeof c.task === 'string' ? c.task : typeof c.class === 'string' ? c.class : typeof c.id === 'string' ? c.id : null;
    const h = isObj(c.heldout) ? c.heldout : null;
    const n = h && isCount(h.n) ? h.n : null;
    const ok = h && isCount(h.ok) ? h.ok : h && n !== null && isNum(h.score) ? Math.round(h.score * n) : null;
    if (task === null || n === null || ok === null || ok > n) { bad++; continue; }
    byTask.delete(task);
    byTask.set(task, { ok, n, know: c.know === true, serve: typeof c.serve === 'boolean' ? c.serve : null });
  }
  if (bad) return { why: 'grown/index.json has ' + bad + ' tier "neo" ' + (bad === 1 ? 'row' : 'rows') + ' without a readable heldout { score, n, ok }' };
  return { byTask };
}

/**
 * neo: tasks from neo/LEDGER.json; colonies and cells from `node grow/neo.mjs status`; mastered, serving and heldout from
 * the rows of grown/index.json with tier "neo" (coloniesOf). mastered is the colonies that answer every held-out row;
 * serving the colonies the gate lets answer (serve true; null while no row carries serve); heldout sums ok and n over the
 * colonies. Ruler "colony" (RULERS). Null when any source fails.
 */
export async function neoPart(root, { timeoutMs = DEFAULTS.timeoutMs, env = process.env, deadline = null, ctx = readsOf(root) } = {}) {
  const blocked = [];
  const led = ledgerOf(ctx);
  if (led.why) blocked.push('neo: ' + led.why);
  const cols = coloniesOf(ctx);
  if (cols.why) blocked.push('neo: ' + cols.why);
  let status = null;
  if (!fs.existsSync(path.join(root, 'grow', 'neo.mjs'))) blocked.push('neo: grow/neo.mjs is not on disk: node grow/neo.mjs status cannot run');
  else {
    const r = await runChild(root, 'grow/neo.mjs', ['status', '--root', root], { timeoutMs: childMs(timeoutMs, deadline), env });
    const j = r.code === 0 ? lastJson(r.stdout) : null;
    if (j && isCount(j.colonies) && isCount(j.cells)) status = j;
    else blocked.push('neo: node grow/neo.mjs status ' + (r.code === 0 ? 'printed no { colonies, cells } line' : 'exited ' + r.code) + ': ' + whyOf(r));
  }
  if (blocked.length) return { value: null, blocked };
  const colonies = [...cols.byTask.values()];
  const ok = colonies.reduce((a, c) => a + c.ok, 0), n = colonies.reduce((a, c) => a + c.n, 0);
  const gated = colonies.some((c) => c.serve !== null);
  return {
    value: {
      tasks: led.tasks.length, colonies: status.colonies, cells: status.cells,
      mastered: colonies.filter(isMastered).length,
      serving: gated ? colonies.filter((c) => c.serve === true).length : null,
      heldout: { ok, n, score: n ? round4(ok / n) : null },
      ruler: 'colony',
    },
    blocked,
  };
}

/** generated: the count of candidate cells the NEO ledger records (neo/LEDGER.json `generated`). */
export function generatedPart(root, ctx = readsOf(root)) {
  const led = ledgerOf(ctx);
  if (led.why) return { value: null, blocked: ['generated: ' + led.why] };
  if (!isCount(led.doc.generated)) return { value: null, blocked: ['generated: neo/LEDGER.json generated is not a count'] };
  return { value: led.doc.generated, blocked: [] };
}

/** absorbed: neo/ABSORB.json's bytes and rows, and the distinct sources its pulled list names. */
export function absorbedPart(root, ctx = readsOf(root)) {
  const j = ctx.json('neo/ABSORB.json');
  if (j.why) return { value: null, blocked: ['absorbed: ' + j.why] };
  const a = j.value;
  if (!isObj(a) || !isCount(a.bytes) || !isCount(a.rows) || !Array.isArray(a.pulled)) return { value: null, blocked: ['absorbed: neo/ABSORB.json is not { cursor, pulled: [..], bytes, rows }'] };
  const ids = new Set(a.pulled.filter((p) => isObj(p) && typeof p.id === 'string').map((p) => p.id));
  return { value: { bytes: a.bytes, rows: a.rows, sources: ids.size }, blocked: [] };
}

/** syllabus: `node grow/teach.mjs status`: its syllabus (the distinct skills), opened and pending. */
export async function syllabusPart(root, { timeoutMs = DEFAULTS.timeoutMs, env = process.env, deadline = null } = {}) {
  if (!fs.existsSync(path.join(root, 'grow', 'teach.mjs'))) return { value: null, blocked: ['syllabus: grow/teach.mjs is not on disk'] };
  const r = await runChild(root, 'grow/teach.mjs', ['status', '--root', root], { timeoutMs: childMs(timeoutMs, deadline), env });
  const j = r.code === 0 ? lastJson(r.stdout) : null;
  if (!j || !isCount(j.syllabus) || !isCount(j.opened) || !isCount(j.pending)) {
    return { value: null, blocked: ['syllabus: node grow/teach.mjs status ' + (r.code === 0 ? 'printed no { syllabus, opened, pending } line' : 'exited ' + r.code) + ': ' + whyOf(r)] };
  }
  return { value: { skills: j.syllabus, opened: j.opened, pending: j.pending }, blocked: [] };
}

/**
 * ladder: bench/verdicts/ladder.json's composite and its at, COPIED (never recomputed from the columns): the top-level
 * composite when the file carries one, else the composite of the day `latest` names, else of the last day.
 */
export function ladderPart(root, ctx = readsOf(root)) {
  const j = ctx.json('bench/verdicts/ladder.json');
  if (j.why) return { value: null, blocked: ['ladder: ' + j.why] };
  const v = j.value;
  if (!isObj(v)) return { value: null, blocked: ['ladder: bench/verdicts/ladder.json is not an object'] };
  let composite;
  if ('composite' in v) composite = v.composite;
  else if (Array.isArray(v.days) && v.days.length) {
    const days = v.days.filter(isObj);
    const want = isObj(v.latest) ? v.latest.date : undefined;
    const day = (want !== undefined ? days.filter((d) => d.date === want).pop() : undefined) || days[days.length - 1];
    composite = day ? day.composite : undefined;
  }
  if (!(composite === null || isNum(composite))) return { value: null, blocked: ['ladder: bench/verdicts/ladder.json carries no composite'] };
  const at = typeof v.at === 'string' ? v.at : null;
  return { value: { composite, at }, blocked: at === null ? ['ladder: bench/verdicts/ladder.json carries no at'] : [] };
}

/** The era rows of neo/ERA.json (rows with an integer era), or { why, absent }. */
function eraRows(ctx) {
  const j = ctx.json(ERA_FILE);
  if (j.why) return { why: j.why, absent: j.absent === true };
  if (!isObj(j.value) || !Array.isArray(j.value.eras)) return { why: ERA_FILE + ' is not { era, eras: [..] }' };
  return { rows: j.value.eras.filter((r) => isObj(r) && Number.isInteger(r.era)) };
}
const lastWith = (rows, ok) => { for (let i = rows.length - 1; i >= 0; i--) if (ok(rows[i])) return rows[i]; return null; };

/**
 * velocity (c7): from the era row (the row of this era in neo/ERA.json when it is there, else the newest: `era` names
 * which): eraMs (its ms), tasksPerMinute (its grown tasks over its minutes), workers (its workers, when it carries them);
 * and from the deltas between this row and the last row of the series that holds the number: cellsPerSecond (the
 * ledger's generated count over the wall seconds between the two rows; null when the clock did not move forward or the
 * count fell) and masteredPerEra (mastered colonies over the eras between the two rows). A field with no input is null.
 */
export function velocityPart(ctx, { at, era = null, tail = { rows: [] } } = {}) {
  const blocked = [];
  const v = { cellsPerSecond: null, tasksPerMinute: null, masteredPerEra: null, eraMs: null, workers: null, era: null };
  const e = eraRows(ctx);
  if (e.why) { if (!e.absent) blocked.push('velocity: ' + e.why); } else if (e.rows.length) {
    const row = (Number.isInteger(era) ? lastWith(e.rows, (r) => r.era === era) : null) || e.rows.reduce((a, b) => (b.era >= a.era ? b : a));
    v.era = row.era;
    if (isCount(row.ms)) v.eraMs = row.ms;
    if (isCount(row.ms) && row.ms > 0 && Array.isArray(row.grown)) v.tasksPerMinute = round4(row.grown.length / (row.ms / 60000));
    if (isCount(row.workers)) v.workers = row.workers;
  }
  const led = ledgerOf(ctx);
  const gen = !led.why && isCount(led.doc.generated) ? led.doc.generated : null;
  const t = Date.parse(at);
  const prevG = lastWith(tail.rows, (r) => isCount(r.generated) && !Number.isNaN(Date.parse(r.at)));
  if (gen !== null && prevG && !Number.isNaN(t)) {
    const dt = t - Date.parse(prevG.at), dg = gen - prevG.generated;
    if (!(dt > 0)) blocked.push('velocity: the clock did not move forward: this row at ' + at + ', the last row at ' + prevG.at + ': no cells per second');
    else if (dg < 0) blocked.push('velocity: the ledger generated count fell from ' + prevG.generated + ' to ' + gen + ': no cells per second');
    else v.cellsPerSecond = round4(dg / (dt / 1000));
  }
  const cols = coloniesOf(ctx);
  const prevM = lastWith(tail.rows, (r) => Number.isInteger(r.era) && isObj(r.neo) && isCount(r.neo.mastered));
  if (Number.isInteger(era) && cols.byTask && prevM) {
    const de = era - prevM.era;
    const mastered = [...cols.byTask.values()].filter(isMastered).length;
    if (de > 0) v.masteredPerEra = round4((mastered - prevM.neo.mastered) / de);
    else if (de < 0) blocked.push('velocity: the era went backwards: this row is era ' + era + ', the last row era ' + prevM.era);
  }
  return { value: v, blocked };
}

/**
 * plateau (c7): the eras since the held-out total (the ok summed over the colonies) last rose, over the series' bounded
 * tail and this row. When it did not rise inside the tail, the last row's own plateau carries it forward; when the tail
 * is the whole series, it counts from the first row. Null when this row has no era, the colonies cannot be read, or the
 * tail is cut and no row carries a plateau (never a guess).
 */
export function plateauPart(ctx, { era = null, tail = { rows: [], truncated: false } } = {}) {
  const cols = coloniesOf(ctx);
  if (!Number.isInteger(era) || !cols.byTask) return { value: null, blocked: [] };
  const okNow = [...cols.byTask.values()].reduce((a, c) => a + c.ok, 0);
  const pts = tail.rows.filter((r) => Number.isInteger(r.era) && isObj(r.neo) && isObj(r.neo.heldout) && isCount(r.neo.heldout.ok))
    .map((r) => ({ era: r.era, ok: r.neo.heldout.ok, plateau: isCount(r.plateau) ? r.plateau : null }));
  pts.push({ era, ok: okNow, plateau: null });
  let p = null;
  let k = pts.length - 1;
  while (k >= 1 && !(pts[k].ok > pts[k - 1].ok)) k--;
  if (k >= 1) p = era - pts[k].era;
  else {
    const carried = lastWith(pts.slice(0, -1), (x) => x.plateau !== null);
    if (carried) p = carried.plateau + (era - carried.era);
    else if (!tail.truncated) p = era - pts[0].era;
  }
  if (p !== null && !isCount(p)) return { value: null, blocked: ['plateau: the era went backwards: this row is era ' + era + ', an earlier row a later era'] };
  return { value: p, blocked: [] };
}

/** The colonies as the snapshot neo/MEASURE.json keeps them: { at, era, tasks: { <task>: [ok, n] } }, tasks sorted. */
export function snapshotOf(byTask, { at, era = null } = {}) {
  const tasks = {};
  for (const t of [...byTask.keys()].sort()) { const c = byTask.get(t); tasks[t] = [c.ok, c.n]; }
  return { at, era, tasks };
}
/** The snapshot's tasks as Map(task -> [ok, n]), or null when it is not { tasks: { <task>: [ok, n] } }. */
function snapshotTasks(v) {
  if (!isObj(v) || !isObj(v.tasks)) return null;
  const m = new Map();
  for (const [t, p] of Object.entries(v.tasks)) if (Array.isArray(p) && p.length === 2 && isCount(p[0]) && isCount(p[1]) && p[0] <= p[1]) m.set(t, p);
  return m;
}

/**
 * regressions: the tasks whose held-out score fell since the last run (neo/MEASURE.json), a colony that is gone counted
 * as a fall from its score: { count, tasks: [{ task, before: [ok, n], after: [ok, n] | null }] }, the largest fall first,
 * at most REGRESSIONS_NAMED named. Null on the first run (no snapshot) or when the colonies cannot be read.
 */
export function regressionsPart(ctx) {
  const cols = coloniesOf(ctx);
  if (!cols.byTask) return { value: null, blocked: [] };
  const s = ctx.json(SNAPSHOT_FILE);
  if (s.why) return { value: null, blocked: s.absent ? [] : ['regressions: ' + s.why] };
  const snap = snapshotTasks(s.value);
  if (!snap) return { value: null, blocked: ['regressions: ' + SNAPSHOT_FILE + ' is not { at, era, tasks: { <task>: [ok, n] } }'] };
  const fell = [];
  for (const [task, [bok, bn]] of snap) {
    if (bn === 0 || bok === 0) continue; // a score of 0 cannot fall
    const c = cols.byTask.get(task);
    if (!c) fell.push({ task, before: [bok, bn], after: null, drop: bok / bn });
    else if (c.n === 0 || c.ok * bn < bok * c.n) fell.push({ task, before: [bok, bn], after: [c.ok, c.n], drop: bok / bn - (c.n ? c.ok / c.n : 0) });
  }
  fell.sort((a, b) => b.drop - a.drop || (a.task < b.task ? -1 : a.task > b.task ? 1 : 0));
  return { value: { count: fell.length, tasks: fell.slice(0, BOUNDS.REGRESSIONS_NAMED).map(({ task, before, after }) => ({ task, before, after })) }, blocked: [] };
}

/** knowledge: the mastered colonies, and all colonies, split into knowledge-backed (know: true, c5) and not. */
export function knowledgePart(ctx) {
  const cols = coloniesOf(ctx);
  if (!cols.byTask) return { value: null, blocked: [] };
  const v = { mastered: { backed: 0, plain: 0 }, colonies: { backed: 0, plain: 0 } };
  for (const c of cols.byTask.values()) {
    const k = c.know ? 'backed' : 'plain';
    v.colonies[k]++;
    if (isMastered(c)) v.mastered[k]++;
  }
  return { value: v, blocked: [] };
}

const KIND_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;
/**
 * trials: neo/TRIALS.jsonl (c6) counted: { rows, kept, reverted, byKind: { <kind>: { kept, reverted } }, skipped (lines
 * that are not a trial row), truncated (only the newest JSONL_MAX_BYTES were read) }. Null while the file is not there.
 */
export function trialsPart(root, { maxBytes = BOUNDS.JSONL_MAX_BYTES } = {}) {
  const t = { rows: 0, kept: 0, reverted: 0, byKind: {}, skipped: 0, truncated: false };
  const by = new Map();
  let r;
  try {
    r = scanLines(root, TRIALS_FILE, (line) => {
      if (!line.trim()) return;
      const j = parseObj(line);
      if (!j || typeof j.kind !== 'string' || typeof j.kept !== 'boolean') { t.skipped++; return; }
      const kind = KIND_RE.test(j.kind) ? j.kind : 'other';
      const b = by.get(kind) || { kept: 0, reverted: 0 };
      t.rows++;
      if (j.kept) { t.kept++; b.kept++; } else { t.reverted++; b.reverted++; }
      by.set(kind, b);
    }, { maxBytes });
  } catch (e) {
    if (e && e.code === 'ENOENT') return { value: null, blocked: [] };
    return { value: null, blocked: ['trials: ' + (e instanceof Fail ? e.message : TRIALS_FILE + ' cannot be read (' + first(e) + ')')] };
  }
  for (const k of [...by.keys()].sort()) t.byKind[k] = by.get(k);
  t.truncated = r.truncated;
  return { value: t, blocked: [] };
}

/** sources: neo/sources.json's registry: the distinct source ids and the distinct domains. Null while it is not there. */
export function sourcesPart(root, ctx = readsOf(root)) {
  const j = ctx.json(SOURCES_FILE);
  if (j.why) return { value: null, blocked: j.absent ? [] : ['sources: ' + j.why] };
  if (!isObj(j.value) || !Array.isArray(j.value.sources)) return { value: null, blocked: ['sources: ' + SOURCES_FILE + ' is not { sources: [..] }'] };
  const rows = j.value.sources.filter(isObj);
  const ids = new Set(rows.filter((s) => typeof s.id === 'string' && s.id).map((s) => s.id));
  const domains = new Set(rows.filter((s) => typeof s.domain === 'string' && s.domain.trim()).map((s) => s.domain.trim().toLowerCase()));
  return { value: { registry: ids.size, domains: domains.size }, blocked: [] };
}

/**
 * frontier: the counts of the frontier part (grow/frontier.mjs): seeds (neo/frontier-seeds.json: its seeds list, or the
 * file when it is a list) and, from its state neo/frontier.json, queue, seen and added (list lengths) and repos (the
 * repositories it holds). A count whose file or field is not there is null. Null while neither file is there, and when a
 * file is there but no count could be read (with a blocked line).
 */
export function frontierPart(root, ctx = readsOf(root)) {
  const s = ctx.json(FRONTIER_FILE), q = ctx.json(FRONTIER_STATE);
  if (s.absent && q.absent) return { value: null, blocked: [] };
  const blocked = [], out = { seeds: null, queue: null, seen: null, repos: null, added: null };
  if (s.why) { if (!s.absent) blocked.push('frontier: ' + s.why); }
  else if (Array.isArray(s.value)) out.seeds = s.value.length;
  else if (isObj(s.value) && Array.isArray(s.value.seeds)) out.seeds = s.value.seeds.length;
  else blocked.push('frontier: ' + FRONTIER_FILE + ' is not { seeds: [..] }');
  if (q.why) { if (!q.absent) blocked.push('frontier: ' + q.why); }
  else if (isObj(q.value)) {
    for (const k of ['queue', 'seen', 'added']) if (Array.isArray(q.value[k])) out[k] = q.value[k].length;
    if (isObj(q.value.repos)) out.repos = Object.keys(q.value.repos).length;
  } else blocked.push('frontier: ' + FRONTIER_STATE + ' is not { queue, seen, repos, added }');
  if (Object.values(out).every((x) => x === null)) return { value: null, blocked: blocked.length ? blocked : ['frontier: neither ' + FRONTIER_FILE + ' nor ' + FRONTIER_STATE + ' holds a count'] };
  return { value: out, blocked };
}

const BODY_RE = /^[A-Za-z0-9][A-Za-z0-9._:@\/-]{0,63}$/;
/**
 * bodies: which bodies ran the eras of the last 24 hours before this row: { eras (era rows in the window), by: { <body>:
 * eras } } from each era row's `body` (an era row without one is in eras and in no body). An era row later than this
 * row's at is in the window and named in a blocked line (the clock went backwards). Null while neo/ERA.json is not there.
 */
export function bodiesPart(ctx, { at } = {}) {
  const e = eraRows(ctx);
  if (e.why) return { value: null, blocked: e.absent ? [] : ['bodies: ' + e.why] };
  const now = Date.parse(at);
  if (Number.isNaN(now)) return { value: null, blocked: ['bodies: this row has no readable at'] };
  const since = now - BOUNDS.BODY_WINDOW_MS, by = new Map();
  let eras = 0, ahead = 0;
  for (const r of e.rows) {
    const t = Date.parse(r.at);
    if (Number.isNaN(t) || t < since) continue;
    eras++;
    if (t > now) ahead++;
    if (typeof r.body === 'string' && BODY_RE.test(r.body)) by.set(r.body, (by.get(r.body) || 0) + 1);
  }
  const out = {};
  for (const k of [...by.keys()].sort()) out[k] = by.get(k);
  return { value: { eras, by: out }, blocked: ahead ? ['bodies: ' + ahead + ' era ' + (ahead === 1 ? 'row is' : 'rows are') + ' later than this row at ' + at + ' (the clock went backwards)'] : [] };
}

// ---- SELF-MADE MEASURES: the probes the organism proposes to itself

/** A column name as words: lower case, every run of other characters one space, at most 40 characters. */
export const labelOf = (c) => String(c).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 40).trim();
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const pairKey = (pack, key, value) => JSON.stringify([pack, key, value]);
/** The task a probe proposes: <pack>-<key>-to-<value> as a TASK_RE name; a name that does not fit gets 6 hex of its pair. */
export function probeTask(pack, key, value) {
  const base = slug(pack + ' ' + labelOf(key) + ' to ' + labelOf(value));
  if (TASK_RE.test(base)) return base;
  const head = base.slice(0, 34).replace(/-+$/, '');
  const name = (head ? head + '-' : 'probe-') + sha6(pairKey(pack, key, value));
  return TASK_RE.test(name) ? name : 'probe-' + sha6(pairKey(pack, key, value));
}
/** The question template of a pair, built from the column names: "what is the <value> of {<key>}". */
export const probeTemplate = (key, value) => 'what is the ' + labelOf(value) + ' of {' + labelOf(key) + '}';
const cellText = (x) => (typeof x === 'number' && Number.isFinite(x) ? String(x) : typeof x === 'string' && x.trim() && x.length <= 300 ? x.trim() : null);
const normKey = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
/** How a pack's rows fit a pair: rows (both cells present), keys (keys that occur once and whose value is not the key). */
export function pairFit(rows, ki, vi) {
  const seen = new Map();
  let usable = 0;
  for (const r of Array.isArray(rows) ? rows : []) {
    if (!Array.isArray(r)) continue;
    const k = cellText(r[ki]), v = cellText(r[vi]);
    if (k === null || v === null) continue;
    const nk = normKey(k);
    if (!nk) continue;
    usable++;
    const s = seen.get(nk);
    seen.set(nk, s ? { n: s.n + 1, same: s.same } : { n: 1, same: normKey(v) === nk });
  }
  let keys = 0;
  for (const s of seen.values()) if (s.n === 1 && !s.same) keys++;
  return { rows: usable, keys };
}

/**
 * probes: for every column pair (key, value) of a knowledge pack (neo/know/INDEX.json, c5) with no task yet (its probe
 * task is not in neo/LEDGER.json) and no probe yet (neo/probes.jsonl), whose key column holds at least PROBE_MIN_KEYS
 * unambiguous keys, one line appended to neo/probes.jsonl: { at, era, task, pack, sha, key, value, template, rows, keys,
 * by: "measure" }; at most PROBES_PER_RUN a run, packs in id order, pairs in column order; a pack over 2 MB is not loaded
 * and at most 30 MB of packs a run. The row carries { proposed, total, opened (probes whose task the ledger now holds) }.
 * Null while there is no knowledge index (no pack, no probe).
 */
export function probesPart(root, ctx = readsOf(root), { at, era = null, write = true } = {}) {
  const ix = ctx.json(KNOW_INDEX);
  if (ix.why) return { value: null, blocked: ix.absent ? [] : ['probes: ' + ix.why] };
  if (!isObj(ix.value) || !Array.isArray(ix.value.packs)) return { value: null, blocked: ['probes: ' + KNOW_INDEX + ' is not { packs: [..] }'] };
  const led = ledgerOf(ctx);
  if (led.why) return { value: null, blocked: ['probes: ' + led.why + ': no task can be told from a probe'] };
  const opened = new Set(led.tasks.map((t) => t.task));
  const blocked = [], seen = new Set(), tasks = [];
  try {
    scanLines(root, PROBES_FILE, (line) => {
      const j = parseObj(line);
      if (!j || typeof j.pack !== 'string' || typeof j.key !== 'string' || typeof j.value !== 'string') return;
      const k = pairKey(j.pack, j.key, j.value);
      if (seen.has(k)) return;
      seen.add(k);
      tasks.push(typeof j.task === 'string' ? j.task : null);
    });
  } catch (e) {
    if (!(e && e.code === 'ENOENT')) return { value: null, blocked: ['probes: ' + (e instanceof Fail ? e.message : PROBES_FILE + ' cannot be read (' + first(e) + ')')] };
  }
  const fresh = [];
  let loaded = 0;
  const packs = ix.value.packs.filter((p) => isObj(p) && typeof p.id === 'string' && PACK_RE.test(p.id) && Array.isArray(p.columns))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  outer: for (const p of packs) {
    if (isCount(p.rows) && p.rows < BOUNDS.PROBE_MIN_KEYS) continue;
    const pairs = [];
    p.columns.forEach((key, a) => p.columns.forEach((value, b) => {
      if (a === b || typeof key !== 'string' || typeof value !== 'string') return;
      if (!labelOf(key) || !labelOf(value) || labelOf(key) === labelOf(value)) return;
      if (seen.has(pairKey(p.id, key, value))) return;
      const task = probeTask(p.id, key, value);
      if (!opened.has(task)) pairs.push({ key, value, task });
    }));
    if (!pairs.length) continue;
    const rel = 'neo/know/' + p.id + '.json';
    let size;
    try { size = fs.statSync(guardedPath(root, rel)).size; } catch (e) { blocked.push('probes: ' + rel + (e && e.code === 'ENOENT' ? ' is not there' : ' cannot be read (' + first(e) + ')')); continue; }
    if (size > BOUNDS.PACK_MAX_BYTES) { blocked.push('probes: ' + rel + ' is ' + size + ' bytes, over the ' + BOUNDS.PACK_MAX_BYTES + ' a pack may be: not loaded'); continue; }
    if (loaded + size > BOUNDS.PACKS_MAX_BYTES) { blocked.push('probes: the ' + BOUNDS.PACKS_MAX_BYTES + ' bytes of packs a run may load are spent: the rest waits for the next run'); break; }
    loaded += size;
    const j = readJsonPart(root, rel, { maxBytes: BOUNDS.PACK_MAX_BYTES });
    if (j.why) { blocked.push('probes: ' + j.why); continue; }
    const pk = j.value;
    if (!isObj(pk) || !Array.isArray(pk.columns) || !Array.isArray(pk.rows)) { blocked.push('probes: ' + rel + ' is not { id, columns: [..], rows: [[..]] }'); continue; }
    const sha = typeof pk.sha === 'string' ? pk.sha : typeof p.sha === 'string' ? p.sha : null;
    for (const pr of pairs) {
      const ki = pk.columns.indexOf(pr.key), vi = pk.columns.indexOf(pr.value);
      if (ki < 0 || vi < 0) continue;
      const fit = pairFit(pk.rows, ki, vi);
      if (fit.keys < BOUNDS.PROBE_MIN_KEYS) continue;
      fresh.push({ at, era, task: pr.task, pack: p.id, sha, key: pr.key, value: pr.value, template: probeTemplate(pr.key, pr.value), rows: fit.rows, keys: fit.keys, by: 'measure' });
      seen.add(pairKey(p.id, pr.key, pr.value));
      if (fresh.length >= BOUNDS.PROBES_PER_RUN) break outer;
    }
  }
  let proposed = fresh.length;
  if (fresh.length && write) {
    try { appendJsonl(root, PROBES_FILE, fresh); } catch (e) { blocked.push('probes: ' + PROBES_FILE + ' cannot be written (' + first(e) + ')'); proposed = 0; }
  }
  const all = [...tasks, ...fresh.slice(0, proposed).map((f) => f.task)];
  return { value: { proposed, total: all.length, opened: all.filter((t) => t !== null && opened.has(t)).length }, blocked };
}

// ---- run

/**
 * Measure once and append the row to grown/measure.jsonl (append only: the bytes before it are never rewritten; a file
 * whose last line was torn gets a newline first, so the torn line stays a line of its own that every reader skips).
 * Every part runs whatever the others do. Then neo/MEASURE.json is replaced by this run's snapshot and the new probes are
 * appended to neo/probes.jsonl; a write that fails is a blocked line of the row.
 * @param {string} root the tree root
 * @param {{ era?: number|null, gen?: number|null, jobs?: number, timeoutMs?: number, maxMs?: number|null, env?: object, now?: () => string }} o
 * @returns {Promise<object>} the row appended
 */
export async function measure(root, { era = null, gen = null, jobs = DEFAULTS.jobs, timeoutMs = DEFAULTS.timeoutMs, maxMs = null, env = process.env, now = () => new Date().toISOString() } = {}) {
  const t0 = mono();
  const deadline = maxMs === null || maxMs === undefined ? null : t0 + maxMs;
  const at = now();
  const ctx = readsOf(root);
  const partMs = {}, parts = {};
  const timed = async (name, fn) => {
    const s = mono();
    try { parts[name] = await fn(); } catch (e) { parts[name] = { value: null, blocked: [name + ': the part failed (' + first(e) + ')'] }; } finally { partMs[name] = mono() - s; }
  };
  const pre = [];
  let tail = { rows: [], skipped: 0, truncated: false };
  try { tail = readRows(root); } catch (e) { pre.push('velocity: ' + MEASURE_FILE + ' cannot be read (' + first(e) + '): no delta, no plateau'); }
  const o = { jobs, timeoutMs, env, deadline, ctx };
  await Promise.all([timed('locked', () => lockedPart(root, o)), timed('neo', () => neoPart(root, o)), timed('syllabus', () => syllabusPart(root, o))]);
  await timed('generated', () => generatedPart(root, ctx));
  await timed('absorbed', () => absorbedPart(root, ctx));
  await timed('ladder', () => ladderPart(root, ctx));
  await timed('velocity', () => velocityPart(ctx, { at, era, tail }));
  await timed('plateau', () => plateauPart(ctx, { era, tail }));
  await timed('regressions', () => regressionsPart(ctx));
  await timed('knowledge', () => knowledgePart(ctx));
  await timed('trials', () => trialsPart(root));
  await timed('sources', () => sourcesPart(root, ctx));
  await timed('frontier', () => frontierPart(root, ctx));
  await timed('bodies', () => bodiesPart(ctx, { at }));
  await timed('probes', () => probesPart(root, ctx, { at, era }));
  const post = [];
  const cols = coloniesOf(ctx);
  if (cols.byTask) {
    try { writeJsonAtomic(root, SNAPSHOT_FILE, snapshotOf(cols.byTask, { at, era })); } catch (e) { post.push('regressions: ' + SNAPSHOT_FILE + ' cannot be written (' + first(e) + '): the next run has no snapshot of this one'); }
  }
  const row = { at, era, generation: gen };
  for (const p of PARTS) row[p] = parts[p].value;
  row.ms = mono() - t0;
  row.partMs = Object.fromEntries(PARTS.map((p) => [p, partMs[p]]));
  row.blocked = [...pre, ...PARTS.flatMap((p) => parts[p].blocked), ...post].map(redact);
  appendRow(root, row);
  return row;
}

/** Append rows to a JSON-lines file under the root; never rewrite what is there (a torn last line gets a newline first). */
export function appendJsonl(root, rel, rows) {
  const f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  let lead = '';
  let size = 0;
  try { size = fs.statSync(f).size; } catch { size = 0; }
  if (size > 0) {
    const fd = fs.openSync(f, 'r');
    try { const b = Buffer.alloc(1); fs.readSync(fd, b, 0, 1, size - 1); if (b[0] !== 0x0a) lead = '\n'; } finally { fs.closeSync(fd); }
  }
  fs.appendFileSync(f, lead + rows.map((r) => JSON.stringify(r) + '\n').join(''));
}
/** Append one row to grown/measure.jsonl. */
export function appendRow(root, row) { appendJsonl(root, MEASURE_FILE, [row]); }
/** Replace a JSON file whole: written beside it, then renamed over it (a reader sees the old file or the new one). */
export function writeJsonAtomic(root, rel, value) {
  const f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.' + process.pid + '.tmp';
  try { fs.writeFileSync(tmp, JSON.stringify(value) + '\n'); fs.renameSync(tmp, f); } finally { try { fs.rmSync(tmp, { force: true }); } catch { /* gone */ } }
}

// ---- series

/**
 * The rows of grown/measure.jsonl (objects with an `at`), how many lines were not one (a torn line, a line that is not
 * JSON), and whether the file was larger than the bounded tail read (only its newest maxBytes are read).
 */
export function readRows(root, { maxBytes = BOUNDS.TAIL_BYTES } = {}) {
  const rows = [];
  let skipped = 0, truncated = false;
  try {
    truncated = scanLines(root, MEASURE_FILE, (line) => {
      if (!line.trim()) return;
      const r = parseObj(line);
      if (r && typeof r.at === 'string') rows.push(r); else skipped++;
    }, { maxBytes }).truncated;
  } catch (e) { if (e instanceof Fail || !e || e.code !== 'ENOENT') throw e; }
  return { rows, skipped, truncated };
}

const numOr = (x) => (isNum(x) ? x : null);
/** The five measures series compares, off one row (null where the row's part is null). */
export function pointOf(r) {
  const locked = isObj(r.locked) ? r.locked : {}, neo = isObj(r.neo) ? r.neo : {};
  return {
    at: r.at, era: r.era ?? null, generation: r.generation ?? null,
    lockedMean: numOr(locked.mean), neoTasks: numOr(neo.tasks), neoMastered: numOr(neo.mastered), cells: numOr(neo.cells), generated: numOr(r.generated),
  };
}

/**
 * series: over the last `last` rows of the bounded tail, { rows, first, last, delta, skipped, truncated }: delta is last
 * minus first for each measure, null when either end has no number for it (null is not zero).
 */
export function series(root, { last = DEFAULTS.last, maxBytes = BOUNDS.TAIL_BYTES } = {}) {
  const { rows, skipped, truncated } = readRows(root, { maxBytes });
  const win = rows.slice(-last);
  const a = win.length ? pointOf(win[0]) : null, b = win.length ? pointOf(win[win.length - 1]) : null;
  const delta = {};
  for (const k of DELTA_KEYS) delta[k] = a && b && a[k] !== null && b[k] !== null ? round4(b[k] - a[k]) : null;
  return { rows: win.length, first: a, last: b, delta, skipped, truncated };
}

// ---- arguments and main
const FLAGS = Object.freeze({ run: new Set(['era', 'gen', 'jobs', 'timeout-ms', 'max-ms', 'root']), series: new Set(['last', 'root']) });
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (!FLAGS.run.has(name) && !FLAGS.series.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
function intOf(flags, name, lo, hi, dflt) {
  if (flags[name] === undefined) return dflt;
  const v = Number(flags[name]);
  if (!/^\d+$/.test(String(flags[name])) || !Number.isSafeInteger(v) || v < lo || v > hi) throw new Fail('--' + name + ' is an integer from ' + lo + ' to ' + hi + ', not ' + flags[name], 2);
  return v;
}

/** The CLI as a function: the printed object, or { usage: true }. */
export async function main(argv, env = process.env) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  if (!Object.hasOwn(FLAGS, verb)) throw new Fail('unknown verb ' + verb + ': run or series (--help)', 2);
  if (pos.length) throw new Fail(verb + ' takes no argument, not ' + JSON.stringify(pos[0]), 2);
  for (const k of Object.keys(flags)) if (!FLAGS[verb].has(k)) throw new Fail('--' + k + ' is not a flag of ' + verb + ' (see --help)', 2);
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Fail('--root ' + flags.root + ' is not a directory', 2);
  if (verb === 'series') return series(root, { last: intOf(flags, 'last', 1, LIMITS.last, DEFAULTS.last) });
  return measure(root, {
    era: intOf(flags, 'era', 0, Number.MAX_SAFE_INTEGER, null), gen: intOf(flags, 'gen', 1, Number.MAX_SAFE_INTEGER, null),
    jobs: intOf(flags, 'jobs', 1, LIMITS.jobs, DEFAULTS.jobs), timeoutMs: intOf(flags, 'timeout-ms', 1000, LIMITS.timeoutMs, DEFAULTS.timeoutMs),
    maxMs: intOf(flags, 'max-ms', 1000, LIMITS.timeoutMs, null), env,
  });
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    const coded = e instanceof Fail;
    process.stderr.write(redact(coded ? e.message : 'measure failed: ' + first(e)).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
