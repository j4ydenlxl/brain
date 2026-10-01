#!/usr/bin/env node
// grow/measure.mjs: THE MEASURE (grow/NEO.md, "Order 7: always burning", MEASURE): the visible, constant improvement test.
// His words (2026-10-01, verbatim at the head of NEO.md): "orthogonally automatically measure, iterate, and improve itself,
// over consistent measures always on in the background ... and visible constant improvement test", and "All native btw,
// its ai data center in ur pocket, none of that ollama crap". No model call anywhere here; only node: builtins.
// run appends ONE row to grown/measure.jsonl, the SAME measures every time, never rewriting a row before it:
//   { at, era, generation, locked: { classes, mean, byClass, knowledge }, neo: { tasks, colonies, cells, mastered,
//     heldout: { ok, n, score } }, generated, absorbed: { bytes, rows, sources }, syllabus: { skills, opened, pending },
//     ladder: { composite, at } | null, ms, blocked: [..] }
// Each part reads only its own sources (SOURCES below) and no field is computed from a field of another part. A part
// that cannot be read is null with a blocked line, and the row is still appended. series prints last minus first over
// the last rows: a claim of improvement is that line or nothing.
// The measure never opens judge/heldout/, judge/control.jsonl, state/ or any neo/tasks/*/heldout.jsonl: every read here
// goes through readGuarded, which REFUSES those paths. The locked classes are read by NAME (judge/dev/<cls>.jsonl is never
// opened) and graded by `node judge/baseline.mjs <cls>` as a child, whose --out goes to a temporary directory removed
// after the run, so the child does not write state/ either.
// Success prints ONE JSON line; a failure one stderr line and a non-zero exit (2: usage).
//   node grow/measure.mjs run [--era <e>] [--gen <n>] [--jobs 4] [--timeout-ms 900000]   [--root <dir>] on every verb
//   node grow/measure.mjs series [--last 200]
// Author: Opus 5.5 builder (MEASURE) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const MEASURE_FILE = 'grown/measure.jsonl';
export const CLASS_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
/** The row's keys, in order: the same every time, whatever could be read. */
export const ROW_KEYS = Object.freeze(['at', 'era', 'generation', 'locked', 'neo', 'generated', 'absorbed', 'syllabus', 'ladder', 'ms', 'blocked']);
/** What series takes last minus first of. */
export const DELTA_KEYS = Object.freeze(['lockedMean', 'neoTasks', 'neoMastered', 'cells', 'generated']);
/** Each part and the only things it reads (orthogonal: no part reads a source of another part but the NEO ledger, which
 *  neo reads for its task count and generated for its own count). */
export const SOURCES = Object.freeze({
  locked: ['judge/dev/ (names only)', 'node judge/baseline.mjs <cls>'],
  neo: ['grown/index.json', 'neo/LEDGER.json', 'node grow/neo.mjs status'],
  generated: ['neo/LEDGER.json'],
  absorbed: ['neo/ABSORB.json'],
  syllabus: ['node grow/teach.mjs status'],
  ladder: ['bench/verdicts/ladder.json'],
});
export const DEFAULTS = Object.freeze({ last: 200, jobs: 4, timeoutMs: 15 * 60 * 1000 });
export const LIMITS = Object.freeze({ last: 1000000, jobs: 32, timeoutMs: 6 * 60 * 60 * 1000 });
/** Never opened by the measure (paths relative to the root, compared lower case). */
export const NEVER_READ = Object.freeze([/^judge\/heldout(?:\/|$)/, /^judge\/control\.jsonl$/, /^state(?:\/|$)/, /^neo\/tasks\/[^/]+\/heldout\.jsonl$/]);
export const USAGE = [
  'usage: node grow/measure.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  run [--era <e>] [--gen <n>] [--jobs ' + DEFAULTS.jobs + '] [--timeout-ms ' + DEFAULTS.timeoutMs + ']   append one row to ' + MEASURE_FILE,
  '  series [--last ' + DEFAULTS.last + ']                                       { rows, first, last, delta } over the last rows',
].join('\n');

export class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const posix = (p) => p.split(path.sep).join('/');
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);
const isCount = (x) => Number.isInteger(x) && x >= 0;
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
const round4 = (x) => Math.round(x * 1e4) / 1e4;
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

/** True when the measure may not open this path (judge/heldout/, judge/control.jsonl, state/, a task's heldout.jsonl). */
export function refusedPath(root, p) {
  const rel = posix(path.relative(path.resolve(root), path.resolve(root, p))).toLowerCase();
  return NEVER_READ.some((re) => re.test(rel));
}
/** Every file the measure reads goes through here: a forbidden path is REFUSED (a throw), not merely avoided. */
export function readGuarded(root, rel) {
  if (refusedPath(root, rel)) throw new Fail('refused: the measure never opens ' + posix(rel));
  return fs.readFileSync(path.resolve(root, rel), 'utf8');
}
/** A JSON file through the guard: { value } or { why } (missing, not JSON). */
function readJsonPart(root, rel) {
  let text;
  try { text = readGuarded(root, rel); } catch (e) { return { why: e instanceof Fail ? e.message : e && e.code === 'ENOENT' ? rel + ' is not there' : rel + ' cannot be read (' + first(e) + ')' }; }
  try { return { value: JSON.parse(text) }; } catch (e) { return { why: rel + ' is not JSON (' + first(e) + ')' }; }
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

// ---- the parts: each returns { value, blocked: [lines] }; value null when it cannot be read

/** The locked classes: the basenames of judge/dev/*.jsonl, by NAME (no file of judge/dev/ is opened). */
export function lockedClasses(root) {
  return fs.readdirSync(path.join(root, 'judge', 'dev')).filter((f) => f.endsWith('.jsonl')).map((f) => f.slice(0, -'.jsonl'.length)).filter((c) => CLASS_RE.test(c)).sort();
}

/**
 * locked: `node judge/baseline.mjs <cls> --out <tmp>` for every locked class, at most `jobs` at once. byClass holds each
 * printed score (null for a class that did not measure); mean is the mean of the scores only when EVERY class measured
 * (a mean over fewer classes is another ruler); knowledge the distinct knowledge each child said it used.
 */
export async function lockedPart(root, { jobs = DEFAULTS.jobs, timeoutMs = DEFAULTS.timeoutMs, env = process.env } = {}) {
  const blocked = [];
  let classes;
  try { classes = lockedClasses(root); } catch (e) { return { value: null, blocked: ['locked: judge/dev/ cannot be listed (' + first(e) + ')'] }; }
  if (!classes.length) return { value: null, blocked: ['locked: judge/dev/ names no class'] };
  if (!fs.existsSync(path.join(root, 'judge', 'baseline.mjs'))) return { value: null, blocked: ['locked: judge/baseline.mjs is not on disk'] };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-measure-'));
  try {
    const got = await pool(classes, jobs, (cls) => runChild(root, 'judge/baseline.mjs', [cls, '--out', path.join(tmp, cls + '.json')], { timeoutMs, env }));
    const byClass = {}, knowledge = new Set();
    classes.forEach((cls, i) => {
      const r = got[i], j = r.code === 0 ? lastJson(r.stdout) : null;
      if (j && j.class === cls && isNum(j.score) && j.score >= 0 && j.score <= 1) {
        byClass[cls] = j.score;
        if (typeof j.knowledge === 'string') knowledge.add(j.knowledge);
      } else {
        byClass[cls] = null;
        blocked.push('locked: ' + cls + ': node judge/baseline.mjs ' + cls + ' ' + (r.code === 0 ? 'printed no { class, score } line' : 'exited ' + r.code) + ': ' + whyOf(r));
      }
    });
    const scores = Object.values(byClass);
    const missing = scores.filter((s) => s === null).length;
    if (missing) blocked.push('locked: mean not taken: ' + missing + ' of ' + classes.length + ' classes did not measure');
    const mean = missing ? null : round4(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { value: { classes: classes.length, mean, byClass, knowledge: [...knowledge].sort() }, blocked };
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* the OS cleans its tmp */ }
  }
}

/** The ledger's well formed task rows (teach.mjs readLedger's rule), or a why. */
function ledgerOf(root) {
  const j = readJsonPart(root, 'neo/LEDGER.json');
  if (j.why) return { why: j.why };
  if (!isObj(j.value) || !Array.isArray(j.value.tasks)) return { why: 'neo/LEDGER.json is not { tasks: [..], generated }' };
  return { doc: j.value, tasks: j.value.tasks.filter((r) => isObj(r) && typeof r.task === 'string') };
}

/**
 * neo: tasks from neo/LEDGER.json; colonies and cells from `node grow/neo.mjs status`; mastered and heldout from the
 * rows of grown/index.json with tier "neo" (one colony a task: a later row of a task replaces an earlier one). mastered is
 * the colonies that answer every held-out row; heldout sums ok and n over the colonies. Null when any source fails.
 */
export async function neoPart(root, { timeoutMs = DEFAULTS.timeoutMs, env = process.env } = {}) {
  const blocked = [];
  const led = ledgerOf(root);
  if (led.why) blocked.push('neo: ' + led.why);
  const ix = readJsonPart(root, 'grown/index.json');
  let colonies = null;
  if (ix.why) blocked.push('neo: ' + ix.why);
  else if (!isObj(ix.value) || !Array.isArray(ix.value.cells)) blocked.push('neo: grown/index.json is not { generation, cells: [..] }');
  else {
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
      byTask.set(task, { ok, n });
    }
    if (bad) blocked.push('neo: grown/index.json has ' + bad + ' tier "neo" ' + (bad === 1 ? 'row' : 'rows') + ' without a readable heldout { score, n, ok }');
    else colonies = [...byTask.values()];
  }
  let status = null;
  if (!fs.existsSync(path.join(root, 'grow', 'neo.mjs'))) blocked.push('neo: grow/neo.mjs is not on disk: node grow/neo.mjs status cannot run');
  else {
    const r = await runChild(root, 'grow/neo.mjs', ['status', '--root', root], { timeoutMs, env });
    const j = r.code === 0 ? lastJson(r.stdout) : null;
    if (j && isCount(j.colonies) && isCount(j.cells)) status = j;
    else blocked.push('neo: node grow/neo.mjs status ' + (r.code === 0 ? 'printed no { colonies, cells } line' : 'exited ' + r.code) + ': ' + whyOf(r));
  }
  if (blocked.length) return { value: null, blocked };
  const ok = colonies.reduce((a, c) => a + c.ok, 0), n = colonies.reduce((a, c) => a + c.n, 0);
  return {
    value: {
      tasks: led.tasks.length, colonies: status.colonies, cells: status.cells,
      mastered: colonies.filter((c) => c.n > 0 && c.ok === c.n).length,
      heldout: { ok, n, score: n ? round4(ok / n) : null },
    },
    blocked,
  };
}

/** generated: the count of candidate cells the NEO ledger records (neo/LEDGER.json `generated`). */
export function generatedPart(root) {
  const led = ledgerOf(root);
  if (led.why) return { value: null, blocked: ['generated: ' + led.why] };
  if (!isCount(led.doc.generated)) return { value: null, blocked: ['generated: neo/LEDGER.json generated is not a count'] };
  return { value: led.doc.generated, blocked: [] };
}

/** absorbed: neo/ABSORB.json's bytes and rows, and the distinct sources its pulled list names. */
export function absorbedPart(root) {
  const j = readJsonPart(root, 'neo/ABSORB.json');
  if (j.why) return { value: null, blocked: ['absorbed: ' + j.why] };
  const a = j.value;
  if (!isObj(a) || !isCount(a.bytes) || !isCount(a.rows) || !Array.isArray(a.pulled)) return { value: null, blocked: ['absorbed: neo/ABSORB.json is not { cursor, pulled: [..], bytes, rows }'] };
  const ids = new Set(a.pulled.filter((p) => isObj(p) && typeof p.id === 'string').map((p) => p.id));
  return { value: { bytes: a.bytes, rows: a.rows, sources: ids.size }, blocked: [] };
}

/** syllabus: `node grow/teach.mjs status`: its syllabus (the distinct skills), opened and pending. */
export async function syllabusPart(root, { timeoutMs = DEFAULTS.timeoutMs, env = process.env } = {}) {
  if (!fs.existsSync(path.join(root, 'grow', 'teach.mjs'))) return { value: null, blocked: ['syllabus: grow/teach.mjs is not on disk'] };
  const r = await runChild(root, 'grow/teach.mjs', ['status', '--root', root], { timeoutMs, env });
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
export function ladderPart(root) {
  const j = readJsonPart(root, 'bench/verdicts/ladder.json');
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

/**
 * Measure once and append the row to grown/measure.jsonl (append only: the bytes before it are never rewritten; a file
 * that does not end in a newline gets one first). Every part runs whatever the others do.
 * @param {string} root the tree root
 * @param {{ era?: number|null, gen?: number|null, jobs?: number, timeoutMs?: number, env?: object, now?: () => string }} o
 * @returns {Promise<object>} the row appended
 */
export async function measure(root, { era = null, gen = null, jobs = DEFAULTS.jobs, timeoutMs = DEFAULTS.timeoutMs, env = process.env, now = () => new Date().toISOString() } = {}) {
  const t0 = Date.now();
  const at = now();
  const o = { jobs, timeoutMs, env };
  const [locked, neo, syllabus] = await Promise.all([lockedPart(root, o), neoPart(root, o), syllabusPart(root, o)]);
  const generated = generatedPart(root), absorbed = absorbedPart(root), ladder = ladderPart(root);
  const parts = { locked, neo, generated, absorbed, syllabus, ladder };
  const row = {
    at, era, generation: gen,
    locked: locked.value, neo: neo.value, generated: generated.value, absorbed: absorbed.value, syllabus: syllabus.value, ladder: ladder.value,
    ms: Date.now() - t0,
    blocked: Object.values(parts).flatMap((p) => p.blocked).map(redact),
  };
  appendRow(root, row);
  return row;
}

/** Append one row; never rewrite what is there. */
export function appendRow(root, row) {
  const f = path.join(root, MEASURE_FILE);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  let lead = '';
  let size = 0;
  try { size = fs.statSync(f).size; } catch { size = 0; }
  if (size > 0) {
    const fd = fs.openSync(f, 'r');
    try { const b = Buffer.alloc(1); fs.readSync(fd, b, 0, 1, size - 1); if (b[0] !== 0x0a) lead = '\n'; } finally { fs.closeSync(fd); }
  }
  fs.appendFileSync(f, lead + JSON.stringify(row) + '\n');
}

// ---- series

/** The rows of grown/measure.jsonl (objects with an `at`), and how many lines were not one. */
export function readRows(root) {
  let text = '';
  try { text = readGuarded(root, MEASURE_FILE); } catch (e) { if (e instanceof Fail || !e || e.code !== 'ENOENT') throw e; text = ''; }
  const rows = [];
  let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let r = null;
    try { r = JSON.parse(line); } catch { r = null; }
    if (isObj(r) && typeof r.at === 'string') rows.push(r); else skipped++;
  }
  return { rows, skipped };
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
 * series: over the last `last` rows, { rows, first, last, delta, skipped }: delta is last minus first for each measure,
 * null when either end has no number for it (null is not zero).
 */
export function series(root, { last = DEFAULTS.last } = {}) {
  const { rows, skipped } = readRows(root);
  const win = rows.slice(-last);
  const a = win.length ? pointOf(win[0]) : null, b = win.length ? pointOf(win[win.length - 1]) : null;
  const delta = {};
  for (const k of DELTA_KEYS) delta[k] = a && b && a[k] !== null && b[k] !== null ? round4(b[k] - a[k]) : null;
  return { rows: win.length, first: a, last: b, delta, skipped };
}

// ---- arguments and main
const FLAGS = Object.freeze({ run: new Set(['era', 'gen', 'jobs', 'timeout-ms', 'root']), series: new Set(['last', 'root']) });
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
    jobs: intOf(flags, 'jobs', 1, LIMITS.jobs, DEFAULTS.jobs), timeoutMs: intOf(flags, 'timeout-ms', 1000, LIMITS.timeoutMs, DEFAULTS.timeoutMs), env,
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
