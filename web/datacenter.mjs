// web/datacenter.mjs: the datacenter wall, dilation.dev/datacenter. His order, verbatim (Oct 2 2026, about 12:44Z, at the
// head of grow/NEO.md): "It is a ultimate of all my projects, and an ai datacenter in pocket that has computer use and can
// multiply computer use to generate thousands of screens and control all them/ warp time, scrape in massive speeds. Why
// dont you build a visualization at 90 percent".
//
// WHAT IT IS. Pure functions, data in and HTML out, the shape of web/alive.mjs. readRecords(root) reads the organism's own
// records and never throws: a missing, empty, oversized or broken file is a source with a state, not an exception.
// datacenterModel turns the records into data.json: every screen of the wall is ONE real unit the organism holds (a task,
// a watched key of a tape pack, a knowledge pack, an absorbed source, a kept cell of a colony) with its real content, and
// the era rows the wall replays. renderPage writes a self-contained page (inline CSS and JS, no CDN, no font, no external
// request) that fetches data.json from beside it and draws thousands of screens on one canvas (WebGL2 instancing with a
// texture atlas of every screen, a 2D layer on top for the legible text of the screens that are large enough to read).
// WHY THIS SHAPE. He reads it on his phone first and investors pay for what they see, so the first view is the wall with
// the verdict over it in large numbers; his standing rule is that every number is a record's number, so the page prints
// the file each total came from, a capped kind says "showing N of M", and a record not written yet is named in words.
// builtAt is passed in; nothing here reads a clock, so the same records and stamp make the same bytes.
// GUARDS. refusedPath keeps every reader off state/, judge/heldout/, judge/control.jsonl and neo/tasks/*/heldout.jsonl (the
// read is refused before a file is opened; a held-out row is never read, not even to count it: counts come from
// neo/LEDGER.json). Record text reaches the page only as data.json (with <, > and & escaped) and is drawn with fillText or
// set with textContent: never innerHTML with record text, never eval, never a URL from a record made clickable.
// Author: Opus 5.5 builder (DATACENTER) for the Fable 5.1 orchestrator, 2026-10-02.
//
// Run: node web/datacenter.mjs --root <dir> --out <dir> [--built-at <iso>]   (prints one JSON line, exit 0)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PAGE_CAP = 120000;
export const DATA_CAP = 900000;
export const FILES = Object.freeze({
  era: 'neo/ERA.json', ledger: 'neo/LEDGER.json', index: 'grown/index.json', know: 'neo/know/INDEX.json', tapes: 'neo/tapes.json',
  seeds: 'neo/tapes-seeds.json', absorb: 'neo/ABSORB.json', sources: 'neo/sources.json', organism: 'bench/verdicts/organism.json',
});
// What is embedded, in this order, each kind by its count cap and its byte budget: eras newest first (the replay starts at the
// first one embedded), tasks, absorbed sources, knowledge packs and colonies in record order, the per-host flow newest window
// first, then the watched keys round-robin over the tape packs, then kept cells round-robin over the embedded colonies until
// SCREENS screens or the data budget. The budgets sum under DATA_CAP, so data.json holds whatever the records grow to.
// The order is printed on the page.
export const CAPS = Object.freeze({
  screens: 4096, tasks: 600, sources: 400, packs: 400, keys: 2400, hosts: 31, devRows: 3, snapshots: 12, fields: 3, sampleRows: 3, pullTimes: 24,
  eraBytes: 200000, taskBytes: 200000, sourceBytes: 60000, packBytes: 60000, colonyBytes: 40000, flowBytes: 40000, keyBytes: 300000, dataBudget: 870000,
});
export const EMBED_ORDER = 'eras newest first up to 200 KB (the replay starts at the first one embedded), then tasks (600, 200 KB), absorbed sources (400, 60 KB), '
  + 'knowledge packs (400, 60 KB) and colonies (40 KB) in record order, the flow of each host newest window first (40 KB), then watched keys round-robin over the tape packs '
  + '(2,400, 300 KB), then kept cells round-robin over the embedded colonies until 4,096 screens or 870 KB of data';
export const READ_LIMITS = Object.freeze({ json: 48 * 1024 * 1024, small: 256 * 1024, devHead: 64 * 1024, colony: 16 * 1024 * 1024, pack: 4 * 1024 * 1024 });
const STR = 160, SHORT = 64;
const EM = String.fromCharCode(0x2014);

// ------------------------------------------------------------------ guards
const REFUSED = [/^state(\/|$)/i, /^judge\/heldout(\/|$)/i, /^judge\/control\.jsonl$/i, /^neo\/tasks\/[^/]+\/heldout\.jsonl$/i];
/** Why a tree-relative path may not be opened (a held-out or runtime path, or one that leaves the tree), else null. */
export function refusedPath(rel) {
  const r = String(rel ?? '').replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^(\.\/)+/, '');
  if (!r || r.startsWith('/') || /^[a-z]:/i.test(r) || r.split('/').includes('..')) return 'not a path inside the tree';
  return REFUSED.some((re) => re.test(r)) ? 'a held-out or runtime path: never opened' : null;
}
const TOKEN_SHAPES = [
  /gh[pousr]_[A-Za-z0-9]{20,}/g, /github_pat_[A-Za-z0-9_]{20,}/g, /glpat-[A-Za-z0-9_-]{16,}/g, /\bnpm_[A-Za-z0-9]{30,}/g,
  /sk-(?:ant|proj)-[A-Za-z0-9_-]{20,}/g, /\bsk-[A-Za-z0-9_-]{20,}/g, /\b[rsp]k_(?:live|test)_[A-Za-z0-9]{10,}/g, /xox[abposr]-[A-Za-z0-9-]{10,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g, /AIza[0-9A-Za-z_-]{35}/g, /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}/g, /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi,
];
const URL_CRED = /\b([a-z][a-z0-9+.-]*:\/\/)[^\s/@:]*:[^\s/@]+@/gi;
const SECRET_NAME = /token|secret|password|passwd|api[_-]?key|access[_-]?key|credential|auth|private|cookie|session|pat$/i;
/** The values (never the names) of the environment's token-named variables: the build removes them from every string. */
export function secretValues(env = {}) {
  const out = [];
  for (const [k, v] of Object.entries(env && typeof env === 'object' ? env : {})) if (SECRET_NAME.test(k) && typeof v === 'string' && v.length >= 8) out.push(v);
  return out.sort((a, b) => b.length - a.length);
}
const DASH = new RegExp('\\s*' + EM + '\\s*', 'g');
// eslint-disable-next-line no-control-regex
const CTRL = /[\u0000-\u0008\u000b-\u001f\u007f\u2028\u2029]/g;
/** A record string made safe to carry: control characters out, token shapes and secret values redacted, an em dash a comma. */
export function clean(s, secrets = []) {
  let t = String(s).replace(CTRL, ' ').replace(DASH, ', ');
  for (const v of secrets) if (v.length >= 8) t = t.split(v).join('[redacted]');
  for (const re of TOKEN_SHAPES) t = t.replace(re, '[redacted]');
  return t.replace(URL_CRED, '$1[redacted]@');
}
const clip = (s, n) => (s.length > n ? s.slice(0, n - 3) + '...' : s);
const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const int = (v) => (Number.isInteger(v) && v >= 0 ? v : null);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const timeOf = (v) => { const t = typeof v === 'string' ? Date.parse(v) : NaN; return Number.isFinite(t) ? t : null; };
const TASK_RE = /^[a-z0-9][a-z0-9._-]{0,95}$/i;
const PACK_RE = /^[a-z0-9-]{1,120}$/;
const COLONY_FILE = /^cells\/[A-Za-z0-9._-]{1,160}\.mjs$/;
/** The host of a URL as text (never a link), or null. */
export function hostOf(u) {
  try { const h = new URL(String(u)).hostname.toLowerCase(); return /^[a-z0-9.-]{1,253}$/.test(h) ? h : null; } catch { return null; }
}

// ------------------------------------------------------------------ reading (tolerant: a file is a source with a state)
function full(root, rel) { return path.join(root, ...rel.split('/')); }
/** { state: read|missing|too big|unreadable|refused, text?, bytes? } for one tree-relative file. */
function readText(root, rel, max) {
  if (refusedPath(rel)) return { state: 'refused' };
  let st;
  try { st = fs.statSync(full(root, rel)); } catch { return { state: 'missing' }; }
  if (!st.isFile()) return { state: 'missing' };
  if (st.size > max) return { state: 'too big', bytes: st.size };
  try { return { state: 'read', text: fs.readFileSync(full(root, rel), 'utf8'), bytes: st.size }; } catch { return { state: 'unreadable' }; }
}
function readJson(root, rel, max = READ_LIMITS.json) {
  const r = readText(root, rel, max);
  if (r.state !== 'read') return { file: rel, state: r.state, bytes: r.bytes ?? null, value: null };
  try { return { file: rel, state: 'read', bytes: r.bytes, value: JSON.parse(r.text) }; } catch { return { file: rel, state: 'broken', bytes: r.bytes, value: null }; }
}
/** The first `max` bytes of a file, cut back to its last whole line. */
function readHead(root, rel, max) {
  if (refusedPath(rel)) return null;
  let fd = null;
  try {
    const st = fs.statSync(full(root, rel));
    if (!st.isFile()) return null;
    fd = fs.openSync(full(root, rel), 'r');
    const buf = Buffer.alloc(Math.min(max, st.size));
    const n = fs.readSync(fd, buf, 0, buf.length, 0);
    let s = buf.subarray(0, n).toString('utf8');
    if (n < st.size) { const nl = s.lastIndexOf('\n'); s = nl >= 0 ? s.slice(0, nl) : ''; }
    return s;
  } catch { return null; } finally { if (fd !== null) try { fs.closeSync(fd); } catch { /* closed either way */ } }
}
function listDir(root, rel) {
  if (refusedPath(rel)) return [];
  try { return fs.readdirSync(full(root, rel), { withFileTypes: true }).map((d) => ({ name: d.name, dir: d.isDirectory() })).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)); } catch { return []; }
}
function sizeOf(root, rel) { try { const s = fs.statSync(full(root, rel)); return s.isFile() ? s.size : null; } catch { return null; } }

/** Every record the wall reads, each with its state. Never throws; never opens a held-out file. */
export function readRecords(root = ROOT) {
  const rec = {};
  for (const [k, rel] of Object.entries(FILES)) rec[k] = readJson(root, rel);
  // tasks: the ledger's, the eras', and every directory of neo/tasks with a task.json (the listing opens no file)
  const names = [];
  const seen = new Set();
  const add = (t) => { if (typeof t === 'string' && TASK_RE.test(t) && !seen.has(t)) { seen.add(t); names.push(t); } };
  if (isObj(rec.ledger.value) && Array.isArray(rec.ledger.value.tasks)) for (const t of rec.ledger.value.tasks) add(isObj(t) ? t.task : null);
  const eras = isObj(rec.era.value) && Array.isArray(rec.era.value.eras) ? rec.era.value.eras : [];
  for (const e of eras) if (isObj(e)) { for (const t of Array.isArray(e.opened) ? e.opened : []) add(t); for (const g of Array.isArray(e.grown) ? e.grown : []) add(isObj(g) ? g.task : null); }
  for (const d of listDir(root, 'neo/tasks')) if (d.dir) add(d.name);
  rec.tasks = names.map((t) => {
    const tj = readJson(root, 'neo/tasks/' + t + '/task.json', READ_LIMITS.small);
    const head = readHead(root, 'neo/tasks/' + t + '/dev.jsonl', READ_LIMITS.devHead);
    const dev = [];
    if (head) for (const line of head.split('\n')) {
      if (dev.length >= CAPS.devRows) break;
      if (!line.trim()) continue;
      try { const r = JSON.parse(line); if (isObj(r) && typeof r.q === 'string') dev.push(r); } catch { /* a torn line is skipped */ }
    }
    return { task: t, json: isObj(tj.value) ? tj.value : null, dev, devState: head === null ? 'missing' : 'read' };
  });
  // colonies: the neo rows of grown/index.json and the kept cells their compiled modules hold, one JSON cell per line
  rec.colonies = [];
  const rows = isObj(rec.index.value) && Array.isArray(rec.index.value.cells) ? rec.index.value.cells : [];
  for (const r of rows) {
    if (!isObj(r) || r.lane !== 'neo' || typeof r.file !== 'string' || !COLONY_FILE.test(r.file)) continue;
    const t = readText(root, 'grown/' + r.file, READ_LIMITS.colony);
    let lines = [];
    if (t.state === 'read') {
      const at = t.text.indexOf('\nconst COLONY = [');
      if (at >= 0) {
        const body = t.text.slice(at + 1).split('\n');
        lines = [];
        for (let i = 1; i < body.length; i++) { const l = body[i]; if (l.startsWith('{')) lines.push(l); else break; }
      }
    }
    rec.colonies.push({ row: r, state: t.state, lines });
  }
  // knowledge packs: the index and each pack file it names (a tape pack is a time-keyed long table)
  rec.packs = [];
  const packIds = [];
  const pseen = new Set();
  if (isObj(rec.know.value) && Array.isArray(rec.know.value.packs)) for (const p of rec.know.value.packs) if (isObj(p) && typeof p.id === 'string' && PACK_RE.test(p.id) && !pseen.has(p.id)) { pseen.add(p.id); packIds.push(p.id); }
  for (const d of listDir(root, 'neo/know')) {
    const m = /^([a-z0-9-]+)\.json$/.exec(d.name);
    if (!d.dir && m && m[1] !== 'INDEX' && PACK_RE.test(m[1]) && !pseen.has(m[1])) { pseen.add(m[1]); packIds.push(m[1]); }
  }
  for (const id of packIds) {
    const rel = 'neo/know/' + id + '.json';
    const j = readJson(root, rel, READ_LIMITS.pack);
    rec.packs.push({ id, state: j.state, bytes: j.state === 'read' ? j.bytes : sizeOf(root, rel), value: isObj(j.value) ? j.value : null });
  }
  return rec;
}

// ------------------------------------------------------------------ the model (data.json)
const WHY_MISSING = Object.freeze({
  era: 'no era has run in this root yet, so the wall has no history to replay and holds its records as they are',
  ledger: 'no task ledger yet, so task screens come from the era rows and neo/tasks only',
  index: 'no colony index yet, so the wall holds no kept cell',
  know: 'no knowledge pack has been written yet (the cloud writes tape packs from its next era), so the wall has no watched-key screen',
  tapes: 'no watch registry yet, so no tape pull is counted',
  seeds: 'no tape seeds in this root',
  absorb: 'nothing absorbed yet, so no packet flows from an absorbed source',
  sources: 'no source registry yet, so absorbed sources are named by their pulls only',
  organism: 'no organism verdict yet',
});
/** A record that is not there or could not be read, said in words. */
function missingLine(key, r) {
  if (r.state === 'missing') return r.file + ' is not there yet: ' + WHY_MISSING[key];
  if (r.state === 'broken') return r.file + ' is not valid JSON, so it was skipped: ' + WHY_MISSING[key];
  if (r.state === 'too big') return r.file + ' is over the read cap (' + r.bytes + ' bytes), so it was skipped';
  return r.file + ' could not be read (' + r.state + ')';
}
const exprText = (n, depth = 0) => {
  if (depth > 24) return '...';
  if (Array.isArray(n)) return String(n[0]) + '(' + n.slice(1).map((a) => exprText(a, depth + 1)).join(', ') + ')';
  if (isObj(n) && 'lit' in n) return clip(JSON.stringify(n.lit) ?? 'null', 28);
  return clip(JSON.stringify(n) ?? 'null', 28);
};
const guardText = (g) => (Array.isArray(g) ? g.map((f) => (Array.isArray(f) ? f.map((x) => (Array.isArray(x) ? x.join('|') : String(x))).join(' ') : String(f))).join(' & ') : '');
function memText(m) {
  if (!isObj(m)) return '';
  if (isObj(m.table)) {
    const ks = Object.keys(m.table);
    const first = ks.length ? ks[0] + ' => ' + String(m.table[ks[0]]) : '';
    return 'table ' + ks.length + (ks.length === 1 ? ' row' : ' rows') + (first ? ': ' + first : '');
  }
  return 'mem ' + Object.keys(m).slice(0, 6).join(', ');
}
/** JSON with <, >, & and the line separators escaped: it cannot close a tag or start one wherever it lands. */
export function safeJson(v) {
  return JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029').split(EM).join('\\u2014');
}
const jbytes = (v) => Buffer.byteLength(safeJson(v));

/**
 * The data the page draws, from readRecords. Pure: the same records and builtAt make the same object.
 * @returns {object} data.json (see the comment of each field)
 */
export function datacenterModel(rec, { builtAt, secrets = [] } = {}) {
  const T = (s, n = STR) => clip(clean(s, secrets), n);
  const missing = [];
  for (const k of Object.keys(FILES)) if (rec[k] && rec[k].state !== 'read' && k !== 'seeds') missing.push(missingLine(k, rec[k]));
  const records = Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, { file: f, state: rec[k] ? rec[k].state : 'missing' }]));
  const eraDoc = isObj(rec.era.value) ? rec.era.value : null;
  const erasAll = eraDoc && Array.isArray(eraDoc.eras) ? eraDoc.eras.filter((e) => isObj(e) && int(e.era) !== null && timeOf(e.at) !== null) : [];
  erasAll.sort((a, b) => timeOf(a.at) - timeOf(b.at) || a.era - b.era);
  if (rec.era.state === 'read' && !erasAll.length) missing.push(FILES.era + ' holds no era row yet, so the wall has no history to replay');
  const ledger = isObj(rec.ledger.value) ? rec.ledger.value : null;
  const ledgerTasks = ledger && Array.isArray(ledger.tasks) ? ledger.tasks.filter(isObj) : [];
  const ledgerBy = new Map(ledgerTasks.filter((t) => typeof t.task === 'string').map((t) => [t.task, t]));

  // the time line: first era start to the newest record time (era ends, pulls, snapshots, promotions)
  const times = [];
  for (const e of erasAll) { times.push(timeOf(e.at)); times.push(timeOf(e.at) + (int(e.ms) ?? 0)); }
  const absorb = isObj(rec.absorb.value) ? rec.absorb.value : null;
  const pulls = absorb && Array.isArray(absorb.pulled) ? absorb.pulled.filter((p) => isObj(p) && typeof p.id === 'string') : [];
  for (const p of pulls) { const t = timeOf(p.at); if (t !== null) times.push(t); }
  const packTimes = [];
  for (const p of rec.packs) if (p.value && Array.isArray(p.value.rows)) for (const r of p.value.rows) if (Array.isArray(r)) { const ti = Array.isArray(p.value.columns) ? p.value.columns.indexOf('time') : -1; const t = ti >= 0 ? timeOf(r[ti]) : null; if (t !== null) packTimes.push(t); }
  for (const t of packTimes) times.push(t);
  for (const c of rec.colonies) { const t = timeOf(c.row.promotedAt); if (t !== null) times.push(t); }
  const start0 = erasAll.length ? timeOf(erasAll[0].at) : (times.length ? Math.min(...times) : null);
  const end = times.length ? Math.max(start0 ?? 0, ...times) : start0;
  let start = start0;
  const rel = (t) => (t === null || start === null ? 0 : Math.max(0, Math.min(end - start, t - start)));
  const taskNames = rec.tasks.map((t) => t.task);
  const taskIdx = new Map(taskNames.map((t, i) => [t, i]));
  let taskLimit = Math.min(rec.tasks.length, CAPS.tasks);

  // eras: compact rows [era, start, ms, cells, mastered, absorbedBytes, absorbedRows, opened[taskIdx], grown[[taskIdx, generated, kept, promoted, hok, hn, bok, bn]], blocked, cumOpened, cumGenerated]
  const eraRow = (e) => [e.era, rel(timeOf(e.at)), int(e.ms) ?? 0, int(e.cells), int(e.mastered),
    isObj(e.absorbed) ? int(e.absorbed.bytes) : null, isObj(e.absorbed) ? int(e.absorbed.rows) : null,
    (Array.isArray(e.opened) ? e.opened : []).map((t) => taskIdx.get(t)).filter((i) => i !== undefined && i < taskLimit),
    (Array.isArray(e.grown) ? e.grown : []).filter((g) => isObj(g) && taskIdx.has(g.task) && taskIdx.get(g.task) < taskLimit).map((g) => [taskIdx.get(g.task), int(g.generated), int(g.kept), g.promoted === true ? 1 : 0,
      isObj(g.heldout) ? int(g.heldout.ok) : null, isObj(g.heldout) ? int(g.heldout.n) : null, isObj(g.baseline) ? int(g.baseline.ok) : null, isObj(g.baseline) ? int(g.baseline.n) : null]),
    Array.isArray(e.blocked) ? e.blocked.length : 0];
  // the counters follow every era row, embedded or not: cumulative opened and generated by era
  let opened = 0, generated = 0;
  const cum = new Map();
  for (const e of erasAll) {
    opened += Array.isArray(e.opened) ? e.opened.length : 0;
    for (const g of Array.isArray(e.grown) ? e.grown : []) if (isObj(g) && int(g.generated) !== null) generated += g.generated;
    cum.set(e.era, [opened, generated]);
  }
  // the cut is measured on the full time line with every task a row may name; the final rows (a later start, the shown tasks) only shrink
  let eraCut = erasAll.length;
  for (let b = 0; eraCut > 0; eraCut--) { const nb = jbytes([...eraRow(erasAll[eraCut - 1]), ...cum.get(erasAll[eraCut - 1].era)]) + 1; if (b + nb > CAPS.eraBytes) break; b += nb; }
  const erasShown = erasAll.slice(eraCut);
  if (eraCut > 0 && erasShown.length) start = timeOf(erasShown[0].at);

  // tasks, in record order, until CAPS.tasks or CAPS.taskBytes
  const openEra = new Map(), masterEra = new Map(), lastGrow = new Map(), firstGrow = new Map();
  for (const e of erasAll) {
    for (const t of Array.isArray(e.opened) ? e.opened : []) if (!openEra.has(t)) openEra.set(t, e);
    for (const g of Array.isArray(e.grown) ? e.grown : []) {
      if (!isObj(g) || typeof g.task !== 'string') continue;
      if (!firstGrow.has(g.task)) firstGrow.set(g.task, e);
      lastGrow.set(g.task, { e, g });
      const h = g.heldout;
      if (g.promoted === true && isObj(h) && int(h.n) && h.ok === h.n && !masterEra.has(g.task)) masterEra.set(g.task, e);
    }
  }
  const colonyByTask = new Map();
  for (const c of rec.colonies) if (typeof c.row.task === 'string' && !colonyByTask.has(c.row.task)) colonyByTask.set(c.row.task, c.row);
  const serves = (r) => Boolean(r) && r.serve === true && Array.isArray(r.templates) && r.templates.length > 0;
  const taskRow = (t) => {
    const L = ledgerBy.get(t.task) || {};
    const j = t.json || {};
    const oe = openEra.get(t.task), me = masterEra.get(t.task), lg = lastGrow.get(t.task), col = colonyByTask.get(t.task);
    const opened = oe ? timeOf(oe.at) : timeOf(L.at);
    const dev = t.dev.map((r) => [T(r.q), T(typeof r.answer === 'string' ? r.answer : isObj(r.expect) && Array.isArray(r.expect.contains) ? r.expect.contains.join(', ') : '')]);
    const sc = (h) => (isObj(h) && int(h.n) !== null && int(h.ok) !== null ? [h.ok, h.n] : null);
    return {
      n: T(t.task, 96), d: typeof j.domain === 'string' ? T(j.domain, 40) : '', r: typeof j.rule === 'string' ? T(j.rule, 200) : '',
      by: typeof L.by === 'string' ? T(L.by, 80) : '', dev: int(L.dev), hn: int(L.heldout), rows: dev,
      o: opened === null ? 0 : rel(opened), oe: oe ? oe.era : null, me: me ? me.era : null, mt: me ? rel(timeOf(me.at) + (int(me.ms) ?? 0)) : null,
      fe: firstGrow.has(t.task) ? firstGrow.get(t.task).era : null,
      h: lg ? sc(lg.g.heldout) : null, b: lg ? sc(lg.g.baseline) : null, he: lg ? lg.e.era : null,
      s: serves(col) ? 1 : 0, c: col && int(col.cells) !== null ? col.cells : null,
    };
  };
  const tasks = [];
  for (let i = 0, b = 0; i < taskLimit; i++) { const row = taskRow(rec.tasks[i]); const nb = jbytes(row) + 1; if (b + nb > CAPS.taskBytes) break; b += nb; tasks.push(row); }
  taskLimit = tasks.length;
  const eraRows = erasShown.map((e) => [...eraRow(e), ...cum.get(e.era)]);

  // sources: neo/sources.json with each one's pulls from neo/ABSORB.json
  const srcDoc = isObj(rec.sources.value) && Array.isArray(rec.sources.value.sources) ? rec.sources.value.sources.filter((s) => isObj(s) && typeof s.id === 'string') : [];
  const srcIds = [];
  const srcSeen = new Set();
  for (const s of srcDoc) if (!srcSeen.has(s.id)) { srcSeen.add(s.id); srcIds.push(s.id); }
  for (const p of pulls) if (!srcSeen.has(p.id)) { srcSeen.add(p.id); srcIds.push(p.id); }
  const srcById = new Map(srcDoc.map((s) => [s.id, s]));
  const pullsBy = new Map();
  for (const p of pulls) { if (!pullsBy.has(p.id)) pullsBy.set(p.id, []); pullsBy.get(p.id).push(p); }
  const fed = new Map();
  for (const t of ledgerTasks) { const m = typeof t.by === 'string' ? /^absorb:(.+)$/.exec(t.by) : null; if (m && taskIdx.has(t.task) && taskIdx.get(t.task) < tasks.length) { if (!fed.has(m[1])) fed.set(m[1], []); fed.get(m[1]).push(taskIdx.get(t.task)); } }
  const sourceRow = (id) => {
    const s = srcById.get(id) || {}, ps = pullsBy.get(id) || [];
    const url = typeof s.url === 'string' ? s.url : ps.length && typeof ps[0].url === 'string' ? ps[0].url : '';
    const ts = ps.map((p) => timeOf(p.at)).filter((t) => t !== null);
    return {
      id: T(id, 96), host: hostOf(url) || '', url: T(url, 200), kind: typeof s.kind === 'string' ? T(s.kind, 40) : '', d: typeof s.domain === 'string' ? T(s.domain, 40) : '',
      lic: typeof s.license === 'string' ? T(s.license, 40) : '', pulls: ps.length, bytes: ps.reduce((a, p) => a + (int(p.bytes) ?? 0), 0),
      rows: ps.reduce((a, p) => a + (int(p.rows) ?? 0), 0), o: ts.length ? rel(Math.min(...ts)) : 0, pt: ts.map(rel).sort((a, b) => a - b).slice(-CAPS.pullTimes),
      tasks: fed.get(id) || [],
    };
  };
  const sources = [];
  for (let i = 0, b = 0; i < Math.min(srcIds.length, CAPS.sources); i++) { const row = sourceRow(srcIds[i]); const nb = jbytes(row) + 1; if (b + nb > CAPS.sourceBytes) break; b += nb; sources.push(row); }

  // knowledge packs and tape keys
  const reg = isObj(rec.tapes.value) ? rec.tapes.value : null;
  const regState = reg && isObj(reg.state) && isObj(reg.state.tapes) ? reg.state.tapes : {};
  const packsAll = rec.packs.filter((p) => p.value && Array.isArray(p.value.columns) && Array.isArray(p.value.rows));
  const packs = [];
  const keyLists = [];
  for (let pi = 0, pb = 0; pi < Math.min(packsAll.length, CAPS.packs); pi++) {
    const p = packsAll[pi];
    const v = p.value, cols = v.columns.map((c) => String(c));
    const ti = cols.indexOf('time');
    const tape = isObj(v.tape) || (p.id.startsWith('tape-') && ti === 1);
    const tid = isObj(v.tape) && typeof v.tape.id === 'string' ? v.tape.id : p.id.replace(/^tape-/, '');
    const st = isObj(regState[tid]) ? regState[tid] : null;
    const pk = { id: T(p.id, 120), host: hostOf(v.from) || '', from: typeof v.from === 'string' ? T(v.from, 200) : '', cols: cols.slice(0, 16).map((c) => T(c, 40)),
      rows: v.rows.length, bytes: p.bytes ?? null, tape: tape ? 1 : 0, pulls: st && int(st.pulls) !== null ? st.pulls : null, listed: st && int(st.listed) !== null ? st.listed : null,
      at: typeof v.at === 'string' ? T(v.at, 40) : '', o: 0, times: [], keys: 0, sample: [] };
    if (tape && ti === 1) {
      const allT = [...new Set(v.rows.filter(Array.isArray).map((r) => String(r[1])))].filter((t) => timeOf(t) !== null).sort((a, b) => timeOf(a) - timeOf(b));
      const keep = allT.slice(-CAPS.snapshots);
      pk.snaps = allT.length;
      pk.times = keep.map((t) => [T(t, 40), rel(timeOf(t))]);
      pk.o = allT.length ? rel(timeOf(allT[0])) : 0;
      const tIdx = new Map(keep.map((t, i) => [t, i]));
      const fields = cols.slice(2, 2 + CAPS.fields);
      pk.f = fields.map((c) => T(c, 40));
      const byKey = new Map();
      // key order: the newest snapshot's order (the tape keeps its top keys first), then any other key by first sight
      const newest = allT[allT.length - 1];
      const order = [];
      for (const r of v.rows) if (Array.isArray(r) && String(r[1]) === newest && !byKey.has(String(r[0]))) { byKey.set(String(r[0]), []); order.push(String(r[0])); }
      for (const r of v.rows) if (Array.isArray(r) && !byKey.has(String(r[0]))) { byKey.set(String(r[0]), []); order.push(String(r[0])); }
      for (const r of v.rows) {
        if (!Array.isArray(r) || !tIdx.has(String(r[1]))) continue;
        const vals = fields.map((_, j) => { const x = r[2 + j]; return num(x) !== null ? x : typeof x === 'string' ? T(x, 40) : null; });
        byKey.get(String(r[0])).push([tIdx.get(String(r[1])), ...vals]);
      }
      pk.keys = order.length;
      pk.kl = { order, byKey };
    } else {
      pk.sample = v.rows.slice(0, CAPS.sampleRows).map((r) => (Array.isArray(r) ? r.slice(0, 8).map((x) => (num(x) !== null ? x : T(x ?? '', 48))) : []));
      const t = timeOf(v.at);
      pk.o = t === null ? 0 : rel(t);
    }
    const kl = pk.kl;
    delete pk.kl;
    const nb = jbytes(pk) + 1;
    if (pb + nb > CAPS.packBytes) break;
    pb += nb;
    if (kl) keyLists.push({ pi: packs.length, order: kl.order, byKey: kl.byKey });
    packs.push(pk);
  }
  const keysTotal = keyLists.reduce((a, k) => a + k.order.length, 0);
  const keys = [];

  // hosts: every source host with the bytes and requests the records hold for it
  const hostMap = new Map();
  const H = (h) => { if (!hostMap.has(h)) hostMap.set(h, { n: h, pulled: 0, req: 0, held: 0, pulls: 0 }); return hostMap.get(h); };
  for (const p of pulls) { const h = hostOf(p.url); if (h) { const x = H(h); x.pulled += int(p.bytes) ?? 0; x.req += 1; } }
  for (const p of packs) if (p.host) { const x = H(p.host); x.held += p.bytes ?? 0; x.pulls += p.pulls ?? 0; }
  for (const s of sources) if (s.host) H(s.host);
  const hostsAll = [...hostMap.values()].sort((a, b) => (b.pulled + b.held) - (a.pulled + a.held) || (a.n < b.n ? -1 : 1));
  const hosts = hostsAll.slice(0, CAPS.hosts).map((h) => ({ ...h, n: T(h.n, 120) }));
  // per era window, the bytes each host delivered (absorbed pulls by their time; a tape snapshot carries its pack's bytes over its snapshots)
  const hostI = new Map(hosts.map((h, i) => [h.n, i]));
  const wins = eraRows.length ? eraRows.map((r) => r[1]) : [0];
  const winOf = (t) => { let lo = 0, hi = wins.length - 1, ans = 0; while (lo <= hi) { const m = (lo + hi) >> 1; if (wins[m] <= t) { ans = m; lo = m + 1; } else hi = m - 1; } return ans; };
  const flowAll = wins.map(() => hosts.map(() => 0));
  const before = (t) => eraCut > 0 && start !== null && t < start;
  for (const p of pulls) { const h = hostOf(p.url), t = timeOf(p.at); if (h && hostI.has(h) && t !== null && !before(t)) flowAll[winOf(rel(t))][hostI.get(h)] += int(p.bytes) ?? 0; }
  for (const p of packs) if (p.host && hostI.has(p.host) && p.times.length && p.bytes) { const per = Math.round(p.bytes / p.times.length); for (const [, t] of p.times) flowAll[winOf(t)][hostI.get(p.host)] += per; }
  // sparse: each window holds [hostIndex, bytes] for the hosts that delivered in it
  const flow = flowAll.map(() => []);
  const flowWins = flowAll.filter((w) => w.some((x) => x > 0)).length;
  let flowShown = 0;
  for (let w = flowAll.length - 1, b = 0; w >= 0; w--) {
    const e = [];
    flowAll[w].forEach((x, h) => { if (x > 0) e.push([h, x]); });
    if (!e.length) continue;
    const nb = jbytes(e);
    if (b + nb > CAPS.flowBytes) break;
    b += nb; flow[w] = e; flowShown++;
  }

  // the data so far; kept cells fill what is left of the screens and the budget
  const newest = erasAll.length ? erasAll[erasAll.length - 1] : null;
  let regPulls = 0;
  for (const v of Object.values(regState)) if (isObj(v) && int(v.pulls) !== null) regPulls += v.pulls;
  const org = isObj(rec.organism.value) ? rec.organism.value : null;
  const totals = {
    eras: erasAll.length, newestEra: newest ? newest.era : null, newestAt: newest ? T(newest.at, 40) : null,
    tasks: rec.tasks.length, cells: newest ? int(newest.cells) : null, mastered: newest ? int(newest.mastered) : null,
    generated: erasAll.length ? generated : null, ledgerGenerated: ledger && int(ledger.generated) !== null ? ledger.generated : null,
    absorbedBytes: absorb && int(absorb.bytes) !== null ? absorb.bytes : null, absorbedRows: absorb && int(absorb.rows) !== null ? absorb.rows : null, requests: absorb ? pulls.length : null,
    eraAbsorbed: erasAll.length ? erasAll.reduce((a, e) => a + (isObj(e.absorbed) ? int(e.absorbed.bytes) ?? 0 : 0), 0) : null,
    sources: rec.sources.state === 'read' ? srcDoc.length : null, tapes: reg && Array.isArray(reg.tapes) ? reg.tapes.length : null, tapePulls: reg ? regPulls : null,
    packs: rec.know.state === 'read' || rec.packs.length ? rec.packs.length : null, tapePacks: keyLists.length, keysWatched: keyLists.length ? keysTotal : null,
    packBytes: rec.packs.length ? rec.packs.reduce((a, p) => a + (p.bytes ?? 0), 0) : null, hosts: hostsAll.length,
    colonies: rec.colonies.length, keptCells: rec.colonies.reduce((a, c) => a + (int(c.row.cells) ?? 0), 0),
    serving: rec.colonies.filter((c) => serves(c.row)).length,
    primitives: org && isObj(org.kernel) && int(org.kernel.primitives) !== null ? org.kernel.primitives : null, organismAt: org && typeof org.at === 'string' ? T(org.at, 40) : null,
  };
  const colonyRow = (c) => ({ id: T(String(c.row.id ?? ''), 120), t: taskIdx.has(c.row.task) && taskIdx.get(c.row.task) < tasks.length ? taskIdx.get(c.row.task) : -1,
    cells: int(c.row.cells), lines: c.lines.length, o: rel(timeOf(c.row.promotedAt)), file: T('grown/' + c.row.file, 160), state: c.state });
  const colonies = [];
  for (let i = 0, b = 0; i < rec.colonies.length; i++) { const row = colonyRow(rec.colonies[i]); const nb = jbytes(row) + 1; if (b + nb > CAPS.colonyBytes) break; b += nb; colonies.push(row); }
  const data = {
    v: 1, builtAt: T(builtAt, 40), era: totals.newestEra, start: start === null ? null : new Date(start).toISOString(), span: start === null ? 0 : end - start,
    order: EMBED_ORDER, records, missing: missing.map((m) => T(m, 300)), totals, eras: eraRows, tasks, sources, packs, keys, hosts, flow, colonies, cells: [],
    caps: {},
  };
  const capsOf = () => ({
    eras: [eraRows.length, erasAll.length], tasks: [tasks.length, rec.tasks.length], sources: [sources.length, srcIds.length], packs: [packs.length, rec.packs.length],
    keys: [keys.length, keysTotal], cells: [data.cells.length, totals.keptCells], hosts: [hosts.length, hostsAll.length],
    colonies: [colonies.length, rec.colonies.length], flow: [flowShown, flowWins],
  });
  // keys: round-robin over the tape packs, each pack's keys in its own order, until CAPS.keys, CAPS.keyBytes or what the data budget leaves
  data.caps = capsOf();
  const keyBudget = Math.max(0, Math.min(CAPS.keyBytes, CAPS.dataBudget - jbytes(data)));
  let keyBytes = 0;
  const keyCap = Math.min(CAPS.keys, CAPS.screens - tasks.length - sources.length - packs.length);
  for (let i = 0, more = true; more && keys.length < keyCap; i++) {
    more = false;
    for (const kl of keyLists) {
      if (i >= kl.order.length) continue;
      more = true;
      const k = kl.order[i];
      const row = [kl.pi, T(k, 96), kl.byKey.get(k).sort((a, b) => a[0] - b[0])];
      const b = jbytes(row) + 1;
      if (keys.length >= keyCap || keyBytes + b > keyBudget) { more = false; break; }
      keyBytes += b;
      keys.push(row);
    }
  }
  keys.sort((a, b) => a[0] - b[0]);
  data.caps = capsOf();
  let size = jbytes(data);
  const cellCap = Math.max(0, CAPS.screens - tasks.length - sources.length - packs.length - keys.length);
  const parsed = new Map();
  const cellAt = (ci, i) => {
    const key = ci + ':' + i;
    if (parsed.has(key)) return parsed.get(key);
    let c = null;
    try { c = JSON.parse(rec.colonies[ci].lines[i].replace(/,\s*$/, '')); } catch { c = null; }
    parsed.set(key, c);
    return c;
  };
  for (let i = 0, more = true; more && data.cells.length < cellCap; i++) {
    more = false;
    for (let ci = 0; ci < colonies.length && data.cells.length < cellCap; ci++) {
      if (i >= rec.colonies[ci].lines.length) continue;
      more = true;
      const c = cellAt(ci, i);
      if (!isObj(c)) continue;
      const row = [ci, T(String(c.id ?? ''), 40), T(guardText(c.guard), 120), T(exprText(c.pyramid), 220), T(memText(c.mem), SHORT)];
      const b = jbytes(row) + 1;
      if (size + b > CAPS.dataBudget) { more = false; break; }
      size += b;
      data.cells.push(row);
    }
  }
  data.cells.sort((a, b) => a[0] - b[0]);
  data.caps = capsOf();
  data.screens = tasks.length + sources.length + packs.length + keys.length + data.cells.length;
  return data;
}

// ------------------------------------------------------------------ the page
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
/** n with thousands separators; null as "not yet". */
export function fmt(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 'not yet';
  const s = String(Math.round(Math.abs(n)));
  return (n < 0 ? '-' : '') + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
const KIND_WORD = Object.freeze({ eras: 'era rows', tasks: 'tasks', sources: 'absorbed sources', packs: 'knowledge packs', keys: 'watched keys', cells: 'kept cells', hosts: 'source hosts', colonies: 'colonies', flow: 'era windows of host traffic' });

/** The page: the verdict, the legend and the caps in HTML (escaped), the wall drawn by the inline script from data.json. */
export function renderPage(d) {
  const t = d.totals;
  const capLines = Object.entries(d.caps).filter(([, [n, m]]) => n < m).map(([k, [n, m]]) => 'showing ' + fmt(n) + ' of ' + fmt(m) + ' ' + KIND_WORD[k]);
  const legend = 'Each screen is one real unit the organism holds: a task, watched key, knowledge pack, absorbed source or kept cell. '
    + 'The wall replays the organism\'s own records, built at ' + d.builtAt + (d.era !== null ? ' from era ' + d.era : ' before any era') + '.';
  const big = (n, label, id) => '<div class="v"><b' + (id ? ' id="' + id + '"' : '') + '>' + esc(n) + '</b><span>' + esc(label) + '</span></div>';
  const css = PAGE_CSS;
  const body = '<canvas id="gl" aria-hidden="true"></canvas><canvas id="ov" aria-label="The wall: every screen is one unit the organism holds; pinch, wheel or double tap to zoom, tap a screen to open it"></canvas>'
    + '<header id="top"><div class="brand">dilation.dev / datacenter</div><div class="vs">'
    + big(fmt(d.screens), 'screens on one wall', 'vScreens') + big(fmt(t.eras), 'eras it ran on its own') + big(fmt(t.mastered), 'tasks mastered at full held-out score') + big('$0', 'a token: no step calls a model')
    + '</div><p id="legend">' + esc(legend) + '</p><p id="status" role="status">Loading data.json, the records the wall draws.</p></header>'
    + '<footer id="bar"><div id="hud" aria-live="off"></div>'
    + '<div id="time"><button id="play" type="button" aria-label="Play or pause the replay">pause</button><input id="scrub" type="range" min="0" max="1000" step="1" value="0" aria-label="Scrub the history from the first era to the newest">'
    + '<span id="speeds"></span></div>'
    + '<form id="cmdf" autocomplete="off"><input id="cmd" type="text" spellcheck="false" placeholder="command every screen: type a name, host or key, or all, mastered, tapes, tasks, cells, sources" aria-label="Command every screen at once"><output id="qn"></output></form>'
    + '<div id="chips"><button id="recs" type="button">records</button></div>'
    + '<div id="caps">' + esc(capLines.length ? capLines.join('; ') + '. Every other kind is shown in full.' : 'Every kind is shown in full.') + '</div></footer>'
    + '<aside id="sheet" hidden aria-modal="false" role="dialog"><button id="close" type="button" aria-label="Close">close</button><h2 id="sh"></h2><p id="ss"></p><div id="sb"></div></aside>'
    + '<noscript><p class="ns">The wall is drawn by the page script from data.json.</p></noscript>';
  const script = '(' + clientMain.toString() + ')((' + clientPure.toString() + ')());';
  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
    + '<meta name="color-scheme" content="dark"><link rel="icon" href="data:,"><meta name="description" content="' + esc('A wall of ' + fmt(d.screens) + ' screens, each one unit the organism holds, replaying its own records.') + '">'
    + '<title>Datacenter wall</title><style>' + css + '</style></head><body>' + body + '<script>' + script + '</script></body></html>\n';
}

const PAGE_CSS = [
  ':root{--bg:#020409;--ink:#e8f1ff;--dim:#8ea3c0;--line:rgba(120,170,255,.22);--accent:#37e4ff;--warm:#ffb02e;--gold:#ffd84a;color-scheme:dark}',
  '*{box-sizing:border-box}html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);overflow:hidden;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;-webkit-text-size-adjust:100%}',
  'canvas{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;display:block}#gl{z-index:0}#ov{z-index:1;touch-action:none;cursor:grab}',
  'body::after{content:"";position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(120% 90% at 50% 45%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)}',
  '#top{position:fixed;left:0;right:0;top:0;z-index:2;padding:max(8px,env(safe-area-inset-top)) 12px 14px;pointer-events:none;background:linear-gradient(180deg,rgba(2,4,9,.92),rgba(2,4,9,.7) 75%,rgba(2,4,9,0))}',
  '.brand{color:var(--accent);letter-spacing:.16em;text-transform:uppercase;font-size:9.5px;opacity:.9}',
  '.vs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px 12px;margin-top:3px}',
  '.v b{display:block;font:650 clamp(23px,7.2vw,64px)/1.02 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:-.02em;color:#fff;text-shadow:0 0 22px rgba(55,228,255,.55);white-space:nowrap}',
  '.v:nth-child(3) b{color:var(--gold);text-shadow:0 0 22px rgba(255,216,74,.5)}.v:nth-child(4) b{color:#6dff7a;text-shadow:0 0 22px rgba(109,255,122,.45)}',
  '.v span{display:block;color:var(--dim);font:9.5px/1.2 ui-sans-serif,system-ui,sans-serif;margin-top:2px}',
  '#legend{margin:6px 0 0;color:#b9c8de;font:10px/1.35 ui-sans-serif,system-ui,sans-serif;max-width:860px}#status{margin:3px 0 0;color:var(--warm);font-size:10.5px}#status:empty{display:none}#status.err{color:#ff7a7a}',
  '#bar{position:fixed;left:0;right:0;bottom:0;z-index:2;padding:12px 10px max(8px,env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(2,4,9,.95),rgba(2,4,9,.82) 78%,rgba(2,4,9,0))}',
  '#hud{color:#cfe0f7;font-size:10.5px;line-height:1.4;min-height:4.2em}#hud b{color:#fff}#hud .w{color:var(--warm)}',
  '#time{display:flex;align-items:center;gap:6px;margin:5px 0}#scrub{flex:1;min-width:0;accent-color:var(--accent)}',
  'button{font:inherit;color:var(--ink);background:rgba(55,228,255,.08);border:1px solid var(--line);border-radius:999px;padding:3px 10px;cursor:pointer;min-height:30px}',
  'button:hover,button:focus-visible{border-color:var(--accent);outline:none}button[aria-pressed=true]{background:rgba(55,228,255,.26);border-color:var(--accent)}button:disabled{opacity:.4;cursor:default}',
  '#speeds{display:flex;gap:4px}#cmdf{display:flex;gap:8px;align-items:center}',
  '#cmd{flex:1;min-width:0;font:inherit;font-size:16px;color:#fff;background:rgba(10,18,34,.9);border:1px solid var(--line);border-radius:10px;padding:6px 10px}#cmd:focus{border-color:var(--accent);outline:none}',
  '#qn{color:var(--accent);white-space:nowrap;font-size:11px}#chips{display:flex;gap:6px;overflow-x:auto;margin-top:6px;scrollbar-width:none}#chips button{flex:0 0 auto}#recs{border-color:rgba(255,216,74,.4)}',
  '#caps{color:var(--dim);font-size:9.5px;margin-top:4px}',
  '#sheet{position:fixed;z-index:3;right:0;bottom:0;left:0;max-height:72vh;overflow:auto;background:rgba(3,7,16,.97);border-top:1px solid var(--accent);padding:14px 16px 24px;box-shadow:0 -10px 40px rgba(0,0,0,.6)}',
  '#sheet h2{margin:0 64px 4px 0;font:600 17px/1.3 ui-sans-serif,system-ui,sans-serif;overflow-wrap:anywhere}#ss{margin:0 0 10px;color:var(--dim)}#close{position:absolute;right:12px;top:10px}',
  '#sb table{border-collapse:collapse;width:100%;margin:6px 0 12px}#sb td,#sb th{border-bottom:1px solid rgba(120,170,255,.12);padding:4px 6px;text-align:left;vertical-align:top;overflow-wrap:anywhere}',
  '#sb th{color:var(--dim);font-weight:400}#sb h3{margin:12px 0 4px;font-size:12px;color:var(--accent);font-weight:600}#sb p{margin:4px 0;color:#c6d4e8}',
  '.ns{position:fixed;bottom:0;padding:16px}',
  '@media (min-width:900px){#top{padding:16px 24px 26px}.vs{gap:4px 28px;max-width:1100px}.v span{font-size:11px}#legend{font-size:11.5px}',
  '#bar{padding:16px 24px 14px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:4px 24px;align-items:end}#hud{grid-column:1/3;font-size:12px;min-height:1.4em}#caps{grid-column:1/3}',
  '#sheet{left:auto;top:0;width:min(520px,44vw);max-height:none;border-top:0;border-left:1px solid var(--accent)}}',
  '@media (max-height:600px){#legend,#caps{display:none}}',
].join('\n');

// ------------------------------------------------------------------ the page script (two functions, embedded as their own source)
/**
 * The page's pure helpers, DOM-free (the tests run them in Node): screen list, search, layout, the replay's clock and counters.
 * Embedded in the page as its own source text; it uses nothing outside itself.
 */
export function clientPure() {
  var KIND = ['source', 'pack', 'task', 'key', 'cell'];
  function fmt(n) {
    if (typeof n !== 'number' || !isFinite(n)) return 'not yet';
    var s = String(Math.round(Math.abs(n)));
    return (n < 0 ? '-' : '') + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function dur(ms) {
    var s = Math.round(ms / 1000);
    if (s < 120) return s + ' s';
    var m = Math.round(s / 60);
    if (m < 120) return m + ' min';
    var h = Math.floor(m / 60);
    return h + ' h ' + (m % 60) + ' min';
  }
  // one screen per unit, in wall order: sources, packs, tasks, keys, cells
  function screens(d) {
    var out = [], i;
    for (i = 0; i < d.sources.length; i++) { var s = d.sources[i]; out.push({ k: 0, i: i, name: s.id, hay: (s.id + ' ' + s.host + ' ' + s.d).toLowerCase(), g: s.host }); }
    for (i = 0; i < d.packs.length; i++) { var p = d.packs[i]; out.push({ k: 1, i: i, name: p.id, hay: (p.id + ' ' + p.host).toLowerCase(), g: p.host }); }
    for (i = 0; i < d.tasks.length; i++) { var t = d.tasks[i]; out.push({ k: 2, i: i, name: t.n, hay: (t.n + ' ' + t.d + ' ' + t.by).toLowerCase(), g: t.d }); }
    for (i = 0; i < d.keys.length; i++) { var k = d.keys[i], pk = d.packs[k[0]]; out.push({ k: 3, i: i, name: k[1], hay: (k[1] + ' ' + pk.id + ' ' + pk.host).toLowerCase(), g: pk.id }); }
    for (i = 0; i < d.cells.length; i++) { var c = d.cells[i], col = d.colonies[c[0]], tn = col && col.t >= 0 ? d.tasks[col.t].n : ''; out.push({ k: 4, i: i, name: c[1], hay: (c[1] + ' ' + tn + ' ' + c[3]).toLowerCase(), g: tn }); }
    return out;
  }
  var COMMANDS = { all: -1, sources: 0, tapes: 1, tasks: 2, cells: 4, mastered: 9 };
  // which screens a command selects: a kind word, "mastered" (by the state at the time shown), or any text in a key, name or host
  function select(list, q, mastered) {
    var s = String(q || '').trim().toLowerCase(), m = new Uint8Array(list.length), n = 0, i;
    if (!s || s === 'all') { for (i = 0; i < list.length; i++) m[i] = 1; return { mode: 'all', m: m, n: list.length }; }
    var c = COMMANDS.hasOwnProperty(s) ? COMMANDS[s] : null;
    for (i = 0; i < list.length; i++) {
      var x = list[i], hit;
      if (c === 9) hit = Boolean(mastered && mastered[i]);
      else if (c === 1) hit = x.k === 1 || x.k === 3;
      else if (c === 0) hit = x.k === 0 || x.k === 1;
      else if (c !== null) hit = x.k === c;
      else hit = x.hay.indexOf(s) >= 0;
      if (hit) { m[i] = 1; n++; }
    }
    return { mode: c !== null ? s : 'text', m: m, n: n };
  }
  // columns for n tiles of pitch pw x ph filling a vw x vh view
  function colsFor(n, vw, vh, pw, ph) {
    var c = Math.round(Math.sqrt(Math.max(1, n) * (vw / Math.max(1, vh)) * (ph / pw)));
    return Math.max(6, Math.min(160, c));
  }
  // grid slots: sections (a label row, then rows of tiles); with a selection the matched screens come first as their own section
  function wallRows(counts, cols, lr, mcols) {
    var rows = 0;
    for (var g = 0; g < counts.length; g++) if (counts[g]) { var c = g === 0 && mcols ? mcols : cols; rows += (g === 0 && mcols ? 1 : lr) + Math.ceil(counts[g] / c); }
    return rows;
  }
  function layout(list, cols, sel, labelRows, mcols) {
    var groups = [[], [], [], [], [], []], i, x = new Float32Array(list.length), y = new Float32Array(list.length);
    var on = sel && sel.mode !== 'all', lr = Math.max(1, Math.round(labelRows || 1));
    for (i = 0; i < list.length; i++) { if (on && sel.m[i]) groups[0].push(i); else groups[1 + list[i].k].push(i); }
    var row = 0, labels = [];
    for (var g = 0; g < groups.length; g++) {
      var ids = groups[g];
      if (!ids.length) continue;
      var gc = g === 0 && mcols ? Math.min(mcols, cols) : cols, gl = g === 0 && mcols ? 1 : lr;
      labels.push({ g: g, row: row, h: gl, n: ids.length });
      row += gl;
      for (var j = 0; j < ids.length; j++) { x[ids[j]] = j % gc; y[ids[j]] = row + Math.floor(j / gc); }
      row += Math.ceil(ids.length / gc);
    }
    return { x: x, y: y, rows: row, cols: cols, labels: labels };
  }
  // the replay clock: warp is the real span over the replay span, never typed
  function warp(spanMs, replayMs) { return replayMs > 0 && spanMs > 0 ? spanMs / replayMs : 0; }
  // the newest era row whose start is at or before t (index into eras, -1 before the first)
  function eraAt(eras, t) {
    var lo = 0, hi = eras.length - 1, a = -1;
    while (lo <= hi) { var m = (lo + hi) >> 1; if (eras[m][1] <= t) { a = m; lo = m + 1; } else hi = m - 1; }
    return a;
  }
  // the counters at time t, from the era rows exactly: the running era, tasks opened through it, and the state after the newest finished era
  function counters(eras, t) {
    var k = eraAt(eras, t), done = -1;
    for (var i = Math.max(0, k); i >= 0 && i < eras.length; i--) if (eras[i][1] + eras[i][2] <= t) { done = i; break; }
    var r = k >= 0 ? eras[k] : null, f = done >= 0 ? eras[done] : null;
    return { era: r ? r[0] : null, running: Boolean(r) && t < r[1] + r[2], tasks: r ? r[10] : 0, after: f ? f[0] : null,
      cells: f ? f[3] : null, mastered: f ? f[4] : null, generated: f ? f[11] : null };
  }
  return { KIND: KIND, fmt: fmt, dur: dur, screens: screens, select: select, colsFor: colsFor, wallRows: wallRows, layout: layout, warp: warp, eraAt: eraAt, counters: counters };
}

/** The page script: fetches data.json, builds the atlas and the GL wall, runs the replay, the commands and the sheet. */
export function clientMain(P) {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var statusEl = $('status');
  var reduce = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  window.__fps = 0;
  function fail(e) { statusEl.textContent = 'The wall could not load data.json (' + String((e && e.message) || e).slice(0, 120) + '). The numbers above were built into this page from the same records.'; statusEl.className = 'err'; }
  fetch('data.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('status ' + r.status); return r.json(); }).then(function (d) {
    try { start(d); } catch (e) { fail(e); }
  }, fail);

  function start(d) {
    var TW = 160, TH = 100, GX = 16, GY = 16, PW = TW + GX, PH = TH + GY;
    var COL = ['#3d7fa8', '#ffb02e', '#20d3b0', '#ffd84a', '#6dff7a', '#a77bff', '#ff5cc8', '#4aa8ff', '#37e4ff', '#1a2230'];
    var KLABEL = ['SOURCE', 'PACK', 'TASK', 'KEY', 'CELL'];
    var SECTION = ['matched', 'absorbed sources', 'knowledge packs', 'tasks', 'watched keys', 'kept cells'];
    var CAPK = ['', 'sources', 'packs', 'tasks', 'keys', 'cells'];
    var list = P.screens(d), N = list.length;
    var span = d.span || 0, eras = d.eras;
    var T = reduce ? span : 0, playing = !reduce && span > 0, replayMs = 30000;
    if (!N) { statusEl.textContent = 'The records hold no unit to draw yet. ' + d.missing.join(' '); return; }
    statusEl.textContent = '';
    // per screen: appear time, the task it belongs to (for activity), its kind
    var appear = new Float64Array(N), taskOf = new Int32Array(N).fill(-1), i;
    for (i = 0; i < N; i++) {
      var s = list[i];
      if (s.k === 0) appear[i] = d.sources[s.i].o;
      else if (s.k === 1) appear[i] = d.packs[s.i].o;
      else if (s.k === 2) { appear[i] = d.tasks[s.i].o; taskOf[i] = s.i; }
      else if (s.k === 3) { var kr = d.keys[s.i], pk = d.packs[kr[0]]; appear[i] = kr[2].length ? pk.times[kr[2][0][0]][1] : pk.o; }
      else { var col = d.colonies[d.cells[s.i][0]]; appear[i] = col ? col.o : 0; taskOf[i] = col ? col.t : -1; }
    }
    var mastered = new Uint8Array(N);
    // ---- layout and camera
    var vw = 1, vh = 1, dpr = 1, cols = 8, lay = null, sel = P.select(list, ''), labels = [];
    var px = new Float32Array(N), py = new Float32Array(N), fx = new Float32Array(N), fy = new Float32Array(N), tx = new Float32Array(N), ty = new Float32Array(N);
    var animT0 = -1, ANIM = 700, grid = null, gridCols = 0, gridRows = 0, labelRows = 1, HY = -PH * 2, matchCols = 0;
    var cam = { x: 0, y: 0, z: 1 }, camT = { x: 0, y: 0, z: 1 };
    var topEl = $('top'), barEl = $('bar');
    // the part of the view the wall owns: below the verdict, above the controls (both float over it)
    function area() {
      var top = Math.min(vh * 0.45, topEl.offsetHeight * 0.9), bot = Math.min(vh * 0.45, barEl.offsetHeight * 0.96);
      return { top: top, bot: bot, w: Math.max(80, vw - 12), h: Math.max(80, vh - top - bot) };
    }
    function relayout(animate) {
      var A = area(), counts = [0, 0, 0, 0, 0, 0], on = sel.mode !== 'all', j0;
      for (j0 = 0; j0 < N; j0++) { if (on && sel.m[j0]) counts[0]++; else counts[1 + list[j0].k]++; }
      // a few matches get their own block shaped to the view, so the camera can bring them up to legible size
      matchCols = on && counts[0] > 0 && counts[0] <= 600 ? Math.max(1, Math.round(Math.sqrt(counts[0] * (A.w / A.h) * (PH / PW)))) : 0;
      // the column count that shows the whole wall largest; a section label band grows to about 15 CSS px at that zoom
      var c0 = P.colsFor(N + 6, A.w, A.h, PW, PH), best = null;
      for (var c = Math.max(4, Math.floor(c0 * 0.6)); c <= Math.ceil(c0 * 1.7); c++) {
        var lr = 1, z = 0, mc = matchCols ? Math.min(matchCols, c) : 0;
        for (var it = 0; it < 4; it++) {
          z = Math.min(A.w / (c * PW), A.h / ((P.wallRows(counts, c, lr, mc) + 1) * PH));
          var want = Math.max(1, Math.min(16, Math.ceil(15 / (PH * z))));
          if (want === lr) break;
          lr = want;
        }
        if (!best || z > best.z) best = { c: c, lr: lr, z: z };
      }
      cols = best.c; labelRows = best.lr; if (matchCols) matchCols = Math.min(matchCols, cols);
      lay = P.layout(list, cols, sel, labelRows, matchCols);
      HY = -Math.max(PH * 0.9, 16 / best.z);
      labels = lay.labels;
      for (var j = 0; j < N; j++) { fx[j] = px[j]; fy[j] = py[j]; tx[j] = lay.x[j] * PW; ty[j] = lay.y[j] * PH; if (!animate) { px[j] = tx[j]; py[j] = ty[j]; } }
      animT0 = animate ? performance.now() : -1;
      gridCols = cols; gridRows = lay.rows + 1; grid = new Int32Array(gridCols * gridRows).fill(-1);
      for (var q = 0; q < N; q++) { var gi = Math.round(lay.y[q]) * gridCols + lay.x[q]; if (gi >= 0 && gi < grid.length) grid[gi] = q; }
      buildPackets();
    }
    function wallW() { return cols * PW - GX; }
    function wallH() { return lay.rows * PH; }
    function fit(x0, y0, w, h, now) {
      var A = area(), z = Math.min(A.w / w, A.h / h);
      if (!(z > 0)) z = Math.min(vw / w, vh / h);
      camT.z = z; camT.x = x0 + w / 2 - vw / 2 / z; camT.y = y0 + h / 2 - (A.top + A.h / 2) / z;
      if (now) { cam.x = camT.x; cam.y = camT.y; cam.z = camT.z; }
    }
    function fitWall(now) { var y0 = HY - PH * 0.4; fit(-PW * 0.2, y0, wallW() + PW * 0.4, wallH() - y0, now); }
    // ---- the atlas: every screen drawn once small (its real text at thumbnail size)
    var AW = 64, AH = 40, ACOLS = 64;
    var atlas = document.createElement('canvas');
    function thumbLines(s) {
      if (s.k === 0) { var so = d.sources[s.i]; return [so.host, P.fmt(so.bytes) + ' bytes', P.fmt(so.pulls) + ' pulls', so.d]; }
      if (s.k === 1) { var p = d.packs[s.i]; return [p.host, P.fmt(p.rows) + ' rows', p.tape ? P.fmt(p.keys) + ' keys' : p.cols.join(' '), p.cols.slice(2).join(' ')]; }
      if (s.k === 2) { var t = d.tasks[s.i]; return [t.d, t.r, t.rows.length ? t.rows[0][0] : '', t.rows.length ? t.rows[0][1] : '']; }
      if (s.k === 3) { var k = d.keys[s.i], pk = d.packs[k[0]], last = k[2].length ? k[2][k[2].length - 1] : null; return [pk.id, last ? pk.f[0] + ' ' + last[1] : '', last && pk.f[1] ? pk.f[1] + ' ' + last[2] : '', '']; }
      var c = d.cells[s.i]; return [c[3], c[2], c[4], ''];
    }
    function drawThumb(g, s, x, y) {
      var kc = COL[[7, 6, 0, 5, 8][s.k]];
      g.fillStyle = '#060b14'; g.fillRect(x, y, AW, AH);
      g.fillStyle = kc; g.globalAlpha = 0.22; g.fillRect(x, y, AW, 8); g.globalAlpha = 1;
      g.fillStyle = kc; g.font = 'bold 5px sans-serif'; g.fillText(KLABEL[s.k], x + 3, y + 6);
      g.fillStyle = '#ffffff'; g.font = 'bold 6px sans-serif'; g.fillText(String(s.name).slice(0, 18), x + 3, y + 15);
      var ls = thumbLines(s);
      g.fillStyle = '#9fb6d6'; g.font = '5px sans-serif';
      for (var j = 0; j < 3; j++) if (ls[j]) g.fillText(String(ls[j]).slice(0, 22), x + 3, y + 22 + j * 6);
      if (s.k === 3) sparkTo(g, d.keys[s.i], x + 3, y + 29, AW - 6, 8, kc, 1);
    }
    function sparkTo(g, k, x, y, w, h, color, lw) {
      var v = [], j;
      for (j = 0; j < k[2].length; j++) if (typeof k[2][j][1] === 'number') v.push(k[2][j][1]);
      if (v.length < 2) return;
      var lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), r = hi - lo || 1;
      g.strokeStyle = color; g.lineWidth = lw; g.beginPath();
      for (j = 0; j < v.length; j++) { var xx = x + (j / (v.length - 1)) * w, yy = y + h - ((v[j] - lo) / r) * h; if (j) g.lineTo(xx, yy); else g.moveTo(xx, yy); }
      g.stroke();
    }
    // ---- canvases
    var glc = $('gl'), ovc = $('ov'), ov = ovc.getContext('2d'), gl = null, R = null;
    try { gl = glc.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance' }); } catch (e) { gl = null; }
    if (gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) < 4096) { AW = 32; AH = 20; }
    atlas.width = AW * ACOLS; atlas.height = AH * Math.ceil(N / ACOLS);
    var ag = atlas.getContext('2d');
    for (i = 0; i < N; i++) drawThumb(ag, list[i], (i % ACOLS) * AW, Math.floor(i / ACOLS) * AH);
    if (gl) { try { R = glInit(); } catch (e) { R = null; gl = null; } }
    if (!gl) statusEl.textContent = 'WebGL2 is off here: the wall is drawn in 2D, every screen still from its record.';
    // ---- the instance data: x, y, scale, atlas index, state, alpha, progress, activity
    var inst = new Float32Array(N * 8);
    function glInit() {
      var vs = '#version 300 es\nlayout(location=0) in vec2 c;layout(location=1) in vec4 a;layout(location=2) in vec4 b;uniform vec2 uV;uniform vec3 uC;uniform vec2 uT;uniform vec2 uA;'
        + 'out vec2 vU;out vec2 vL;out vec4 vB;out float vS;void main(){if(b.y<0.01){gl_Position=vec4(2.,2.,2.,1.);return;}vec2 sz=uT*a.z;vec2 p=a.xy+uT*.5+(c-.5)*sz;vec2 s=(p-uC.xy)*uC.z;'
        + 'gl_Position=vec4(s.x/uV.x*2.-1.,1.-s.y/uV.y*2.,0.,1.);float col=mod(a.w,uA.x);float row=floor(a.w/uA.x);vU=(vec2(col,row)+vec2(.02,.03)+c*vec2(.96,.94))/uA;vL=c;vB=b;vS=fract(sin(a.w*12.9898)*43758.5453);}';
      var fs = '#version 300 es\nprecision mediump float;in vec2 vU;in vec2 vL;in vec4 vB;in float vS;uniform sampler2D uX;uniform float uTm;uniform float uP;uniform vec3 uK[10];out vec4 o;'
        + 'void main(){int st=int(vB.x+.5);float bw=clamp(1.2/uP,.012,.2);'
        + 'float e=max(max(step(vL.x,bw),step(1.-bw,vL.x)),max(step(vL.y,bw*1.6),step(1.-bw*1.6,vL.y)));'
        + 'if(st==9){o=vec4(mix(vec3(.03,.05,.085),vec3(.11,.18,.29),e)*vB.y,1.);return;}'
        + 'vec3 t=texture(uX,vU).rgb;vec3 k=uK[st];vec3 c=mix(t,k,e*.9);'
        + 'if(vB.z>0.&&vL.y>.88&&vL.y<.95&&vL.x>.05&&vL.x<.95){float f=step((vL.x-.05)/.9,vB.z);c=mix(c*.35,k*1.25,f);}'
        + 'float ph=fract(uTm*(.04+.22*vB.w)+vS);float ln=floor(ph*4.);vec2 cp=vec2(.06+fract(ph*4.)*.86,.34+ln*.14);vec2 dd=abs(vL-cp);'
        + 'float bl=vB.w>.5?1.:step(.5,fract(uTm*1.1+vS));if(dd.x<.022&&dd.y<.055)c=mix(c,vec3(1.),bl*.95);'
        + 'c+=k*(.05+.05*vB.w)*(.5+.5*sin(uTm*2.4+vS*6.283));o=vec4(c*vB.y,1.);}';
      var pvs = '#version 300 es\nlayout(location=0) in vec4 a;layout(location=1) in vec4 b;uniform vec2 uV;uniform vec3 uC;uniform float uTm;uniform float uD[32];uniform float uR;out float vA;out float vH;'
        + 'void main(){int h=int(b.z);float on=step(b.w,uD[h]);float f=fract(uTm*b.y+b.x);vec2 p=mix(a.xy,a.zw,f);p.x+=sin(f*3.1416)*(a.z-a.x)*.08;'
        + 'vec2 s=(p-uC.xy)*uC.z;gl_Position=on>0.?vec4(s.x/uV.x*2.-1.,1.-s.y/uV.y*2.,0.,1.):vec4(2.,2.,2.,1.);gl_PointSize=uR*(1.+1.5*sin(f*3.1416));vA=sin(f*3.1416);vH=b.z;}';
      var pfs = '#version 300 es\nprecision mediump float;in float vA;in float vH;uniform vec3 uK[10];out vec4 o;void main(){vec2 q=gl_PointCoord-.5;float r=1.-smoothstep(.1,.5,length(q));'
        + 'vec3 k=vH<.5?uK[7]:uK[5];o=vec4(mix(k,vec3(1.),.35)*r*vA,1.);}';
      function sh(type, src) { var x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; }
      function prog(a, b) { var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, a)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, b)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
      var r = { p: prog(vs, fs), pp: prog(pvs, pfs) };
      r.u = {}; ['uV', 'uC', 'uT', 'uA', 'uX', 'uTm', 'uP', 'uK'].forEach(function (n) { r.u[n] = gl.getUniformLocation(r.p, n); });
      r.pu = {}; ['uV', 'uC', 'uTm', 'uD', 'uR', 'uK'].forEach(function (n) { r.pu[n] = gl.getUniformLocation(r.pp, n); });
      r.vao = gl.createVertexArray(); gl.bindVertexArray(r.vao);
      var q = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, q); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      r.ib = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, r.ib); gl.bufferData(gl.ARRAY_BUFFER, N * 32, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0); gl.vertexAttribDivisor(1, 1);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16); gl.vertexAttribDivisor(2, 1);
      r.pvao = gl.createVertexArray(); gl.bindVertexArray(r.pvao);
      r.pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, r.pb);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 32, 0); gl.vertexAttribDivisor(0, 1);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 16); gl.vertexAttribDivisor(1, 1);
      gl.bindVertexArray(null);
      r.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, r.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      r.k = new Float32Array(30);
      COL.forEach(function (h, j) { r.k[j * 3] = parseInt(h.slice(1, 3), 16) / 255; r.k[j * 3 + 1] = parseInt(h.slice(3, 5), 16) / 255; r.k[j * 3 + 2] = parseInt(h.slice(5, 7), 16) / 255; });
      r.np = 0;
      return r;
    }
    // ---- the scrape: packets from each real source host into the screens it feeds, as many as its share of the bytes
    var hosts = d.hosts, HN = hosts.length, dens = new Float32Array(32), pk2 = null, pkN = 0;
    var hostTotal = hosts.map(function (h) { return h.pulled + h.held; });
    var sumBytes = hostTotal.reduce(function (a, b) { return a + b; }, 0);
    // the flow arrives sparse ([hostIndex, bytes] per window); spread into one row per window here
    var FL = (d.flow || []).map(function (w) { var a = new Float64Array(HN); for (var j = 0; j < (w || []).length; j++) if (w[j][0] >= 0 && w[j][0] < HN) a[w[j][0]] += w[j][1]; return a; });
    var flowMax = hosts.map(function (_, h) { var m = 0; for (var w = 0; w < FL.length; w++) m = Math.max(m, FL[w][h]); return m; });
    function hostX(h) { return (h + 0.5) / Math.max(1, HN) * wallW(); }
    function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    function buildPackets() {
      if (!HN || !sumBytes) { pkN = 0; return; }
      var dest = hosts.map(function () { return []; }), hi = {}, j;
      hosts.forEach(function (h, k) { hi[h.n] = k; });
      for (j = 0; j < N; j++) {
        var s = list[j], h = -1;
        if (s.k === 0) h = hi[d.sources[s.i].host];
        else if (s.k === 1) h = hi[d.packs[s.i].host];
        else if (s.k === 3) h = hi[d.packs[d.keys[s.i][0]].host];
        if (h >= 0 && h !== undefined) dest[h].push(j);
      }
      for (j = 0; j < d.sources.length; j++) { var so = d.sources[j], hs = hi[so.host]; if (hs === undefined) continue; for (var q = 0; q < so.tasks.length; q++) dest[hs].push(d.sources.length + d.packs.length + so.tasks[q]); }
      // with a command active, a host sends only into the screens the command raised
      if (sel.mode !== 'all') dest = dest.map(function (ds) { return ds.filter(function (q) { return sel.m[q]; }); });
      var TOTAL = 1800, out = [], r = rng(7);
      for (var h2 = 0; h2 < HN; h2++) {
        if (!dest[h2].length || !hostTotal[h2]) continue;
        var n = Math.max(1, Math.round(TOTAL * hostTotal[h2] / sumBytes));
        for (j = 0; j < n; j++) { var t = dest[h2][Math.floor(r() * dest[h2].length)]; out.push(hostX(h2), HY, tx[t] + TW / 2, ty[t] + TH / 2, r(), 0.18 + r() * 0.35, h2, (j + 0.5) / n); }
      }
      pk2 = new Float32Array(out); pkN = out.length / 8;
      if (gl && R) { gl.bindBuffer(gl.ARRAY_BUFFER, R.pb); gl.bufferData(gl.ARRAY_BUFFER, pk2, gl.STATIC_DRAW); }
    }
    // ---- state at time T
    var liveLoop = 0, cnt = null, flowW = 0;
    function stateAt(now) {
      var k = P.eraAt(eras, T), er = k >= 0 ? eras[k] : null, live = span > 0 ? T >= span : true;
      var running = er && T < er[1] + er[2] ? er : null, prog = running ? (T - running[1]) / Math.max(1, running[2]) : 0;
      if (live && eras.length) { running = eras[eras.length - 1]; prog = (now % 6000) / 6000; }
      var grow = {};
      if (running) for (var g = 0; g < running[8].length; g++) grow[running[8][g][0]] = running[8][g];
      cnt = P.counters(eras, T);
      flowW = k >= 0 ? k : 0;
      for (var h = 0; h < 32; h++) dens[h] = h < HN && flowMax[h] > 0 && FL[flowW] ? FL[flowW][h] / flowMax[h] : 0;
      if (reduce) for (h = 0; h < 32; h++) dens[h] = 0;
      var keyPhase = Math.floor(now / 1400);
      for (var j = 0; j < N; j++) {
        var s = list[j], o = j * 8, st = 0, pr = 0, act = 0, vis = T >= appear[j] || (live && span === 0);
        mastered[j] = 0;
        if (s.k === 2) {
          var t = d.tasks[s.i], gr = grow[s.i];
          if (gr) { st = 1; pr = prog; act = 1; }
          else if (t.mt !== null && t.mt <= T) st = 3;
          else if (t.fe !== null && cnt.after !== null && cnt.after >= t.fe) st = 2;
          if (live && t.s && !gr) st = 4;
          if (t.mt !== null && t.mt <= T) mastered[j] = 1;
        } else if (s.k === 4) { st = 8; if (taskOf[j] >= 0 && grow[taskOf[j]]) { act = 1; pr = prog; } }
        else if (s.k === 3) { st = 5; var kr = d.keys[s.i], pkx = d.packs[kr[0]], n = 0; for (var q = 0; q < kr[2].length; q++) if (pkx.times[kr[2][q][0]][1] <= T) n = q + 1; if (live && kr[2].length > 1) { n = 1 + (keyPhase + j) % kr[2].length; act = 1; } pr = kr[2].length ? n / kr[2].length : 0; }
        else if (s.k === 1) { st = 6; act = live ? 1 : 0; }
        else { st = 7; var so = d.sources[s.i], c2 = 0; for (var z = 0; z < so.pt.length; z++) if (so.pt[z] <= T) c2++; pr = so.pt.length ? c2 / so.pt.length : 0; act = running && so.pt.some(function (x) { return x >= running[1] && x <= running[1] + running[2]; }) ? 1 : 0; }
        var on = sel.mode === 'all' || sel.m[j];
        if (!vis) { st = 9; pr = 0; act = 0; }
        inst[o] = px[j]; inst[o + 1] = py[j]; inst[o + 2] = on && sel.mode !== 'all' ? 1.06 : 1; inst[o + 3] = j;
        inst[o + 4] = st; inst[o + 5] = vis ? (on ? 1 : 0.2) : (on ? 1 : 0.35); inst[o + 6] = pr; inst[o + 7] = reduce ? 0 : act;
        cur[j] = st; curP[j] = pr; curA[j] = act; curV[j] = vis;
      }
    }
    var cur = new Uint8Array(N), curP = new Float32Array(N), curA = new Uint8Array(N), curV = new Uint8Array(N);
    // ---- drawing
    function draw(now) {
      var tm = reduce ? 0 : now / 1000;
      if (gl && R) {
        gl.viewport(0, 0, glc.width, glc.height); gl.clearColor(0.008, 0.016, 0.035, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(R.p); gl.bindVertexArray(R.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, R.ib); gl.bufferSubData(gl.ARRAY_BUFFER, 0, inst);
        gl.uniform2f(R.u.uV, glc.width, glc.height); gl.uniform3f(R.u.uC, cam.x, cam.y, cam.z * dpr); gl.uniform2f(R.u.uT, TW, TH);
        gl.uniform2f(R.u.uA, ACOLS, atlas.height / AH); gl.uniform1i(R.u.uX, 0); gl.uniform1f(R.u.uTm, tm); gl.uniform1f(R.u.uP, TW * cam.z * dpr); gl.uniform3fv(R.u.uK, R.k);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, R.tex);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, N);
        if (pkN && !reduce) {
          gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
          gl.useProgram(R.pp); gl.bindVertexArray(R.pvao);
          gl.uniform2f(R.pu.uV, glc.width, glc.height); gl.uniform3f(R.pu.uC, cam.x, cam.y, cam.z * dpr); gl.uniform1f(R.pu.uTm, tm); gl.uniform1fv(R.pu.uD, dens);
          gl.uniform1f(R.pu.uR, Math.max(2 * dpr, Math.min(5 * dpr, 9 * cam.z * dpr))); gl.uniform3fv(R.pu.uK, R.k);
          gl.drawArraysInstanced(gl.POINTS, 0, 1, pkN);
          gl.disable(gl.BLEND);
        }
        gl.bindVertexArray(null);
      }
      drawOverlay(now, tm);
    }
    function W2S(x, y) { return [(x - cam.x) * cam.z, (y - cam.y) * cam.z]; }
    function drawOverlay(now, tm) {
      ov.setTransform(dpr, 0, 0, dpr, 0, 0); ov.clearRect(0, 0, vw, vh);
      var z = cam.z, j;
      if (!gl) {
        // the 2D wall: every screen a rectangle in its state color, its cursor a white mark
        for (j = 0; j < N; j++) {
          var a = W2S(px[j], py[j]);
          if (a[0] > vw || a[1] > vh || a[0] + TW * z < 0 || a[1] + TH * z < 0) continue;
          ov.globalAlpha = sel.mode === 'all' || sel.m[j] ? 1 : 0.2; ov.fillStyle = COL[cur[j]]; ov.fillRect(a[0], a[1], TW * z, TH * z);
          if (curA[j]) { var ph = (tm * 0.26 + j * 0.618) % 1; ov.fillStyle = '#fff'; ov.fillRect(a[0] + TW * z * (0.06 + ph * 0.86), a[1] + TH * z * 0.5, Math.max(1, TW * z * 0.04), Math.max(1, TH * z * 0.1)); }
        }
        ov.globalAlpha = 1;
      }
      // section labels and the host ports
      ov.textBaseline = 'alphabetic';
      for (j = 0; j < labels.length; j++) {
        var L = labels[j], bandPx = L.h * PH * z, fs = Math.max(10, Math.min(26, bandPx * 0.62)), p = W2S(0, (L.row + L.h) * PH - Math.min(PH * 0.3, 3 / z));
        if (p[1] < -40 || p[1] > vh + 40) continue;
        var c = d.caps[CAPK[L.g]], capped = c && c[0] < c[1];
        var word = L.g === 0 ? fmtSel() : sel.mode !== 'all' ? SECTION[L.g] + ' ' + P.fmt(L.n) + ' dimmed' : capped ? SECTION[L.g] + ', showing ' + P.fmt(c[0]) + ' of ' + P.fmt(c[1]) : SECTION[L.g] + ' ' + P.fmt(L.n);
        ov.font = '600 ' + fs + 'px ui-sans-serif,system-ui,sans-serif'; ov.fillStyle = L.g === 0 ? '#ffd84a' : '#8fd8ff'; ov.fillText(word.toUpperCase(), Math.max(8, p[0]), p[1]);
      }
      if (HN && !reduce) {
        var hf = Math.max(9, Math.min(16, 22 * z));
        ov.font = hf + 'px ui-monospace,monospace';
        for (var h = 0; h < HN; h++) {
          var q = W2S(hostX(h), HY);
          if (q[0] < -200 || q[0] > vw + 200 || q[1] < -40 || q[1] > vh + 40) continue;
          var glow = 3 + 9 * dens[h];
          ov.fillStyle = hosts[h].pulled ? '#4aa8ff' : '#a77bff'; ov.beginPath(); ov.arc(q[0], q[1], Math.max(2.5, glow * Math.min(1, z * 6)), 0, 6.2832); ov.fill();
          if (vw / HN > 70 || z > 0.12) { ov.fillStyle = '#cfe0f7'; ov.save(); ov.translate(q[0], q[1] - 8); ov.rotate(-0.5); ov.fillText(hosts[h].n, 0, 0); ov.restore(); }
        }
      }
      // the screens large enough to read: drawn in full, their own text, their own cursor
      if (TW * z >= 90 || TW * z * dpr >= 240) {
        var x0 = Math.floor(cam.x / PW) - 1, x1 = Math.ceil((cam.x + vw / z) / PW) + 1, y0 = Math.floor(cam.y / PH) - 1, y1 = Math.ceil((cam.y + vh / z) / PH) + 1;
        for (var gy = Math.max(0, y0); gy <= Math.min(gridRows - 1, y1); gy++) for (var gx = Math.max(0, x0); gx <= Math.min(gridCols - 1, x1); gx++) {
          var id = grid[gy * gridCols + gx];
          if (id >= 0) detail(id, tm);
        }
      }
    }
    function fmtSel() { return 'matched ' + P.fmt(sel.n) + ' of ' + P.fmt(N); }
    var wrapCache = {};
    function wrap(id, key, text, width, font) {
      var ck = id + ':' + key;
      if (wrapCache[ck]) return wrapCache[ck];
      ov.font = font; var words = String(text).split(/\s+/), lines = [], line = '';
      for (var w = 0; w < words.length; w++) { var t = line ? line + ' ' + words[w] : words[w]; if (ov.measureText(t).width > width && line) { lines.push(line); line = words[w]; } else line = t; }
      if (line) lines.push(line);
      wrapCache[ck] = lines; return lines;
    }
    function detail(j, tm) {
      var s = list[j], z = cam.z, a = W2S(px[j], py[j]), w = TW * z, h = TH * z;
      if (a[0] > vw || a[1] > vh || a[0] + w < 0 || a[1] + h < 0) return;
      var kc = curV[j] ? COL[cur[j]] : '#5d7390', dim = (sel.mode === 'all' || sel.m[j] ? 1 : 0.35) * (curV[j] ? 1 : 0.5);
      ov.save(); ov.translate(a[0], a[1]); ov.scale(z, z); ov.globalAlpha = dim;
      ov.beginPath(); ov.rect(0, 0, TW, TH); ov.clip();
      ov.fillStyle = '#050a14'; ov.fillRect(0, 0, TW, TH);
      ov.fillStyle = kc; ov.globalAlpha = dim * 0.2; ov.fillRect(0, 0, TW, 14); ov.globalAlpha = dim;
      ov.strokeStyle = kc; ov.lineWidth = 1.2; ov.strokeRect(0.6, 0.6, TW - 1.2, TH - 1.2);
      ov.font = '600 7px ui-monospace,monospace'; ov.fillStyle = kc; ov.fillText(KLABEL[s.k] + '  ' + stateWord(j), 5, 9.5);
      ov.font = '600 9.5px ui-sans-serif,system-ui,sans-serif'; ov.fillStyle = '#fff'; ov.fillText(clipText(s.name, TW - 10), 5, 25);
      var lines = detailLines(j), y = 37;
      ov.font = '6.6px ui-monospace,monospace';
      for (var q = 0; q < lines.length && y < TH - 10; q++) {
        var wl = wrap(j, q, lines[q][1], TW - 10, ov.font);
        for (var r = 0; r < wl.length && y < TH - 10; r++) { ov.fillStyle = lines[q][0]; ov.fillText(wl[r], 5, y); y += 8.4; }
      }
      if (s.k === 3) { var kr = d.keys[s.i]; sparkTo(ov, kr, 5, TH - 22, TW - 10, 10, '#c7a9ff', 0.9); }
      if (curP[j] > 0) { ov.fillStyle = 'rgba(255,255,255,.12)'; ov.fillRect(5, TH - 8, TW - 10, 3); ov.fillStyle = kc; ov.fillRect(5, TH - 8, (TW - 10) * Math.min(1, curP[j]), 3); }
      if (!reduce) { var ph = (tm * (0.04 + 0.22 * curA[j]) + j * 0.6180339) % 1, ln = Math.floor(ph * 4), cx = 5 + (ph * 4 % 1) * (TW - 14), cy = 31 + ln * 8.4; if (curA[j] || (tm * 1.1 + j) % 1 > 0.5) { ov.fillStyle = 'rgba(255,255,255,.6)'; ov.fillRect(cx, cy, 2.4, 7); } }
      ov.restore();
    }
    function clipText(t, w) { t = String(t); if (ov.measureText(t).width <= w) return t; while (t.length > 1 && ov.measureText(t + '...').width > w) t = t.slice(0, -1); return t + '...'; }
    function stateWord(j) { return ['opened', 'growing', 'grown', 'mastered', 'serving', 'watched', 'pack', 'absorbed', 'kept', '', 'off: not on yet at this point of the replay'][cur[j]] || 'off: not on yet at this point of the replay'; }
    function detailLines(j) {
      var s = list[j], W = '#e3ecfa', D = '#9fb6d6', A = '#ffd27a';
      if (s.k === 2) {
        var t = d.tasks[s.i], out = [], gr = null;
        if (cur[j] === 1 && cnt) { var e = eras[P.eraAt(eras, T)] || eras[eras.length - 1]; for (var q = 0; e && q < e[8].length; q++) if (e[8][q][0] === s.i) gr = e[8][q]; }
        if (gr) out.push([A, 'era ' + eraNo() + ': generated ' + P.fmt(Math.round((gr[1] || 0) * curP[j])) + ' of ' + P.fmt(gr[1]) + ', kept ' + P.fmt(Math.round((gr[2] || 0) * curP[j])) + ' of ' + P.fmt(gr[2])]);
        out.push([W, t.h ? 'held-out ' + t.h[0] + '/' + t.h[1] + ' vs baseline ' + (t.b ? t.b[0] + '/' + t.b[1] : 'none') + ' (era ' + t.he + ')' : 'not grown yet']);
        if (t.rows.length) { out.push([D, 'Q: ' + t.rows[0][0]]); out.push([D, 'A: ' + t.rows[0][1]]); }
        out.push([D, t.r]);
        return out;
      }
      if (s.k === 3) {
        var k = d.keys[s.i], pk = d.packs[k[0]], n = Math.max(1, Math.round(curP[j] * k[2].length)), row = k[2][Math.min(k[2].length - 1, n - 1)];
        var o2 = [[D, pk.id + ' on ' + pk.host]];
        if (row) { o2.push([A, 'snapshot ' + n + ' of ' + k[2].length + ' at ' + pk.times[row[0]][0]]); for (var f = 0; f < pk.f.length; f++) o2.push([W, pk.f[f] + ': ' + (row[1 + f] === null ? 'none' : row[1 + f])]); }
        return o2;
      }
      if (s.k === 1) { var p = d.packs[s.i]; return [[D, p.host], [W, P.fmt(p.rows) + ' rows, ' + P.fmt(p.bytes) + ' bytes' + (p.tape ? ', ' + P.fmt(p.keys) + ' keys, ' + P.fmt(p.snaps) + ' snapshots' : '')], [D, 'columns: ' + p.cols.join(', ')], [D, p.pulls !== null ? P.fmt(p.pulls) + ' pulls (neo/tapes.json)' : '']]; }
      if (s.k === 0) { var so = d.sources[s.i]; return [[D, so.host], [W, P.fmt(so.pulls) + ' pulls, ' + P.fmt(so.bytes) + ' bytes, ' + P.fmt(so.rows) + ' rows (neo/ABSORB.json)'], [D, [so.kind, so.d, so.lic].filter(Boolean).join(', ')], [D, 'fed ' + so.tasks.length + ' tasks']]; }
      var c = d.cells[s.i], col = d.colonies[c[0]];
      return [[D, 'colony ' + (col ? col.id : '')], [A, c[3]], [W, 'guard: ' + c[2]], [D, c[4]]];
    }
    function eraNo() { return cnt && cnt.era !== null ? cnt.era : (eras.length ? eras[eras.length - 1][0] : 0); }
    // ---- HUD
    var hud = $('hud'), scrub = $('scrub'), playB = $('play'), qn = $('qn'), cmd = $('cmd');
    var SPEEDS = [120000, 30000, 8000];
    var speedBox = $('speeds');
    SPEEDS.forEach(function (ms) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', ms === replayMs ? 'true' : 'false');
      b.textContent = span > 0 ? 'x' + P.fmt(P.warp(span, ms)) : P.dur(ms);
      b.title = 'replay the whole history in ' + P.dur(ms);
      b.addEventListener('click', function () { replayMs = ms; Array.prototype.forEach.call(speedBox.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); if (!playing && T >= span) T = 0; playing = !reduce && span > 0; syncPlay(); });
      speedBox.appendChild(b);
    });
    if (span <= 0) { scrub.disabled = true; playB.disabled = true; }
    function syncPlay() { playB.textContent = playing ? 'pause' : (T >= span ? 'replay' : 'play'); }
    syncPlay();
    playB.addEventListener('click', function () { if (span <= 0) return; if (!playing && T >= span) T = 0; playing = !playing; syncPlay(); kick(); });
    scrub.addEventListener('input', function () { T = span * Number(scrub.value) / 1000; playing = false; syncPlay(); kick(); });
    var lastHud = '';
    function setHud() {
      var c = cnt, w = P.warp(span, replayMs), parts;
      parts = span > 0 ? [(T >= span ? 'live: newest era ' : (c.running ? 'era running ' : 'era ')) + '<b>' + (c.era === null ? 'none yet' : c.era) + '</b> of ' + (eras.length ? eras[eras.length - 1][0] : 0)] : ['no era history: the records as they are'];
      var txt = parts[0] + ' | tasks opened <b>' + P.fmt(c.tasks) + '</b> | cells <b>' + P.fmt(c.cells) + '</b> | mastered <b>' + P.fmt(c.mastered) + '</b> | generated <b>' + P.fmt(c.generated) + '</b>'
        + (c.after !== null ? ' (after era ' + c.after + ')' : '') + (span > 0 ? ' | <span class="w">time warp x' + P.fmt(w) + ': ' + P.dur(span) + ' of records in ' + P.dur(replayMs) + '</span>' : '');
      if (txt === lastHud) return;
      lastHud = txt;
      // the HUD carries numbers and fixed words only: built as text nodes, bold by element
      hud.textContent = '';
      txt.split(/(<b>|<\/b>|<span class="w">|<\/span>)/).reduce(function (st, part) {
        if (part === '<b>') return 'b'; if (part === '<span class="w">') return 'w'; if (part === '</b>' || part === '</span>') return '';
        if (!part) return st;
        var n = st === 'b' ? document.createElement('b') : st === 'w' ? document.createElement('span') : document.createTextNode(part);
        if (st) { if (st === 'w') n.className = 'w'; n.textContent = part; }
        hud.appendChild(n); return st;
      }, '');
    }
    // ---- commands
    var chips = $('chips');
    ['all', 'mastered', 'tapes', 'tasks', 'cells', 'sources'].forEach(function (w) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = w;
      b.addEventListener('click', function () { cmd.value = w === 'all' ? '' : w; run(w); });
      chips.insertBefore(b, $('recs'));
    });
    function run(q) {
      stateAt(performance.now());
      sel = P.select(list, q, mastered);
      firstSel = -1;
      if (sel.mode !== 'all') for (var f0 = 0; f0 < N; f0++) if (sel.m[f0]) { firstSel = f0; break; }
      qn.textContent = sel.mode === 'all' ? P.fmt(N) + ' screens' : P.fmt(sel.n) + ' of ' + P.fmt(N);
      relayout(true);
      if (matchCols) fit(-PW * 0.25, PH * 0.05, matchCols * PW + PW * 0.5, (1 + Math.ceil(sel.n / matchCols)) * PH + PH * 0.15);
      else fitWall();
      kick();
    }
    var tmr = 0;
    cmd.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(function () { run(cmd.value); }, 160); });
    $('cmdf').addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(tmr); run(cmd.value); cmd.blur(); });
    qn.textContent = P.fmt(N) + ' screens';
    // ---- the sheet: a screen's real rows, set as text
    var sheet = $('sheet');
    function el(tag, text, cls) { var e = document.createElement(tag); if (text !== undefined) e.textContent = String(text); if (cls) e.className = cls; return e; }
    function table(head, rows) {
      var t = el('table'), tr = el('tr');
      head.forEach(function (h) { tr.appendChild(el('th', h)); }); t.appendChild(tr);
      rows.forEach(function (r) { var x = el('tr'); r.forEach(function (c) { x.appendChild(el('td', c === null || c === undefined ? 'none' : c)); }); t.appendChild(x); });
      return t;
    }
    function openSheet(title, sub, blocks) {
      $('sh').textContent = title; $('ss').textContent = sub + sheetNote; sheetNote = '';
      var b = $('sb'); b.textContent = '';
      blocks.forEach(function (x) { b.appendChild(x); });
      sheet.hidden = false;
    }
    var sheetNote = '';
    function openScreen(j) {
      var s = list[j], B = [];
      sheetNote = curV[j] ? '' : ' (off: not on yet at this point of the replay)';
      if (s.k === 2) {
        var t = d.tasks[s.i], er = [];
        for (var q = 0; q < eras.length; q++) for (var g = 0; g < eras[q][8].length; g++) if (eras[q][8][g][0] === s.i) { var x = eras[q][8][g]; er.push([eras[q][0], P.fmt(x[1]), P.fmt(x[2]), x[3] ? 'yes' : 'no', x[4] === null ? 'none' : x[4] + '/' + x[5], x[6] === null ? 'none' : x[6] + '/' + x[7]]); }
        B.push(el('p', t.r)); B.push(table(['field', 'value'], [['state now', stateWord(j)], ['domain', t.d], ['opened in era', t.oe], ['mastered in era', t.me], ['dev rows', t.dev], ['held-out rows (count from neo/LEDGER.json)', t.hn], ['opened by', t.by], ['kept cells in its colony', t.c]]));
        B.push(el('h3', 'era rows that grew it (neo/ERA.json)')); B.push(table(['era', 'generated', 'kept', 'promoted', 'held-out', 'baseline'], er));
        B.push(el('h3', 'dev rows, prompt and answer (neo/tasks/' + t.n + '/dev.jsonl)')); B.push(table(['prompt', 'answer'], t.rows));
        openSheet(t.n, 'task: ' + stateWord(j), B);
      } else if (s.k === 3) {
        var k = d.keys[s.i], pk = d.packs[k[0]];
        B.push(table(['time'].concat(pk.f), k[2].map(function (r) { return [pk.times[r[0]][0]].concat(r.slice(1)); })));
        B.push(el('p', 'Every snapshot the pack holds for this key (newest ' + pk.times.length + ' of ' + pk.snaps + ' snapshots), from neo/know/' + pk.id + '.json, watched on ' + pk.host + '.'));
        openSheet(k[1], 'watched key of ' + pk.id, B);
      } else if (s.k === 1) {
        var p = d.packs[s.i];
        B.push(table(['field', 'value'], [['host', p.host], ['source (text, not a link)', p.from], ['rows', P.fmt(p.rows)], ['bytes on disk', P.fmt(p.bytes)], ['keys', p.tape ? P.fmt(p.keys) : 'not a tape'], ['snapshots', p.tape ? P.fmt(p.snaps) : 'none'], ['pulls (neo/tapes.json)', p.pulls === null ? 'none' : P.fmt(p.pulls)], ['listed at the last pull', p.listed], ['columns', p.cols.join(', ')]]));
        if (p.sample.length) { B.push(el('h3', 'first rows')); B.push(table(p.cols.slice(0, 8), p.sample)); }
        openSheet(p.id, 'knowledge pack, neo/know/' + p.id + '.json', B);
      } else if (s.k === 0) {
        var so = d.sources[s.i];
        B.push(table(['field', 'value'], [['host', so.host], ['url (text, not a link)', so.url], ['kind', so.kind], ['domain', so.d], ['license', so.lic], ['pulls (neo/ABSORB.json)', P.fmt(so.pulls)], ['bytes pulled (neo/ABSORB.json)', P.fmt(so.bytes)], ['rows absorbed', P.fmt(so.rows)]]));
        B.push(el('h3', 'tasks it opened (neo/LEDGER.json by)')); B.push(table(['task'], so.tasks.map(function (ti) { return [d.tasks[ti].n]; })));
        openSheet(so.id, 'absorbed source', B);
      } else {
        var c = d.cells[s.i], col = d.colonies[c[0]];
        B.push(table(['field', 'value'], [['cell', c[1]], ['colony', col ? col.id : ''], ['task', col && col.t >= 0 ? d.tasks[col.t].n : ''], ['composition', c[3]], ['guard', c[2]], ['memory', c[4]], ['module', col ? col.file : ''], ['cells kept in this colony', col ? P.fmt(col.cells) : '']]));
        openSheet(c[1], 'kept cell, ' + (col ? col.file : ''), B);
      }
    }
    function openRecords() {
      var t = d.totals, B = [];
      B.push(el('p', 'Every number is the record\'s own. The wall replays neo/ERA.json from the first era to the newest; the warp shown is the real span of the records divided by the replay span.'));
      B.push(table(['total', 'value', 'record'], [
        ['eras run', P.fmt(t.eras), 'neo/ERA.json eras'], ['tasks', P.fmt(t.tasks), 'neo/LEDGER.json, neo/ERA.json, neo/tasks'], ['cells (newest era)', P.fmt(t.cells), 'neo/ERA.json cells'],
        ['mastered (newest era)', P.fmt(t.mastered), 'neo/ERA.json mastered'], ['candidates generated', P.fmt(t.generated), 'neo/ERA.json grown[].generated, summed'],
        ['generated, the ledger total', P.fmt(t.ledgerGenerated), 'neo/LEDGER.json generated'], ['bytes pulled', P.fmt(t.absorbedBytes), 'neo/ABSORB.json bytes'],
        ['requests', P.fmt(t.requests), 'neo/ABSORB.json pulled (one row a request)'], ['rows absorbed', P.fmt(t.absorbedRows), 'neo/ABSORB.json rows'], ['bytes absorbed by the eras', P.fmt(t.eraAbsorbed), 'neo/ERA.json absorbed.bytes, summed'],
        ['absorbed sources', P.fmt(t.sources), 'neo/sources.json'], ['watched tapes', P.fmt(t.tapes), 'neo/tapes.json tapes'], ['tape pulls', P.fmt(t.tapePulls), 'neo/tapes.json state.tapes[].pulls'],
        ['knowledge packs', P.fmt(t.packs), 'neo/know/INDEX.json'], ['keys watched', P.fmt(t.keysWatched), 'neo/know/tape-*.json'], ['bytes held in packs', P.fmt(t.packBytes), 'neo/know/*.json file sizes'],
        ['source hosts', P.fmt(t.hosts), 'neo/ABSORB.json urls, neo/know/*.json from'], ['colonies', P.fmt(t.colonies), 'grown/index.json lane neo'], ['kept cells in colonies', P.fmt(t.keptCells), 'grown/index.json cells'],
        ['serving colonies', P.fmt(t.serving), 'grown/index.json serve'], ['kernel primitives', P.fmt(t.primitives), 'bench/verdicts/organism.json' + (t.organismAt ? ' at ' + t.organismAt : '')],
      ]));
      B.push(el('h3', 'what the wall shows of each kind'));
      B.push(table(['kind', 'shown', 'of'], Object.keys(d.caps).map(function (k) { return [k, P.fmt(d.caps[k][0]), P.fmt(d.caps[k][1])]; })));
      B.push(el('p', 'Embedded in this order: ' + d.order + '.'));
      B.push(el('h3', 'packets')); B.push(el('p', 'Packets fly from each source host into the screens it feeds. Each host gets packets in proportion to the bytes the records hold for it (pulled bytes in neo/ABSORB.json, pack bytes in neo/know), at least one; at each moment of the replay a host shows the share of its packets that its bytes in that era are of its busiest era. No rate is printed: the records hold bytes and requests, not a rate.'));
      B.push(table(['host', 'bytes pulled', 'requests', 'bytes held in packs', 'tape pulls'], hosts.map(function (h) { return [h.n, P.fmt(h.pulled), P.fmt(h.req), P.fmt(h.held), P.fmt(h.pulls)]; })));
      if (d.missing.length) { B.push(el('h3', 'records not there yet')); d.missing.forEach(function (m) { B.push(el('p', m)); }); }
      B.push(el('h3', 'colors'));
      B.push(table(['color', 'means'], [['steel', 'task opened'], ['amber', 'task growing in the running era'], ['teal', 'task grown'], ['gold', 'task mastered'], ['green', 'colony serving'], ['violet', 'watched key'], ['magenta', 'knowledge pack'], ['blue', 'absorbed source'], ['cyan', 'kept cell']]));
      B.push(el('p', 'Pinch, wheel or double tap to zoom; drag to pan; tap a screen to open it. Keys: / commands, space plays, + and - zoom, 0 fits, Escape clears.'));
      openSheet('records and totals', 'built at ' + d.builtAt + (d.era !== null ? ' from era ' + d.era : ''), B);
    }
    $('recs').addEventListener('click', openRecords);
    $('close').addEventListener('click', function () { sheet.hidden = true; });
    // ---- pointer, wheel, keys
    var ptr = {}, pinch = null, drag = null, lastTap = null, tapTimer = 0;
    function hit(cx, cy) {
      var wx = cam.x + cx / cam.z, wy = cam.y + cy / cam.z, gx = Math.floor(wx / PW), gy = Math.floor(wy / PH);
      if (gx < 0 || gy < 0 || gx >= gridCols || gy >= gridRows) return -1;
      if (wx - gx * PW > TW || wy - gy * PH > TH) return -1;
      var id = grid[gy * gridCols + gx];
      return id;
    }
    // the closest zoom is one screen filling the view (fully legible); the farthest shows the whole wall with room around it
    function zMax() { var A = area(); return Math.max(0.05, Math.min(A.w * 0.94 / TW, A.h * 0.94 / TH)); }
    function zMin() { var A = area(); return Math.min(zMax(), 0.4 * Math.min(A.w / (wallW() + PW), A.h / (wallH() - HY + PH))); }
    function zoomAt(cx, cy, f) {
      var wx = camT.x + cx / camT.z, wy = camT.y + cy / camT.z;
      camT.z = Math.max(zMin(), Math.min(zMax(), camT.z * f)); camT.x = wx - cx / camT.z; camT.y = wy - cy / camT.z; kick();
    }
    ovc.addEventListener('pointerdown', function (e) {
      ovc.setPointerCapture(e.pointerId); ptr[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now() };
      var ids = Object.keys(ptr);
      if (ids.length === 2) { var a = ptr[ids[0]], b = ptr[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: camT.z, wx: camT.x + (a.x + b.x) / 2 / camT.z, wy: camT.y + (a.y + b.y) / 2 / camT.z }; drag = null; }
      else if (ids.length === 1) drag = { x: e.clientX, y: e.clientY, cx: camT.x, cy: camT.y, moved: false };
    });
    ovc.addEventListener('pointermove', function (e) {
      var p = ptr[e.pointerId]; if (!p) return; p.x = e.clientX; p.y = e.clientY;
      var ids = Object.keys(ptr);
      if (pinch && ids.length >= 2) {
        var a = ptr[ids[0]], b = ptr[ids[1]], dd = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        camT.z = Math.max(zMin(), Math.min(zMax(), pinch.z * dd / pinch.d)); camT.x = pinch.wx - mx / camT.z; camT.y = pinch.wy - my / camT.z;
        cam.x = camT.x; cam.y = camT.y; cam.z = camT.z; kick();
      } else if (drag) {
        if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 6) drag.moved = true;
        if (drag.moved) { camT.x = drag.cx - (e.clientX - drag.x) / camT.z; camT.y = drag.cy - (e.clientY - drag.y) / camT.z; cam.x = camT.x; cam.y = camT.y; ovc.style.cursor = 'grabbing'; kick(); }
      }
    });
    function up(e) {
      var p = ptr[e.pointerId]; delete ptr[e.pointerId]; ovc.style.cursor = 'grab';
      if (Object.keys(ptr).length < 2) pinch = null;
      if (!p || !drag || drag.moved || Object.keys(ptr).length) { if (!Object.keys(ptr).length) drag = null; return; }
      drag = null;
      var now = performance.now();
      if (now - p.t > 450) return;
      if (lastTap && now - lastTap.t < 320 && Math.hypot(lastTap.x - p.x, lastTap.y - p.y) < 30) {
        clearTimeout(tapTimer); lastTap = null;
        if (TW * camT.z > vw * 0.55) fitWall(); else zoomAt(p.x, p.y, 3.2);
        return;
      }
      lastTap = { t: now, x: p.x, y: p.y };
      var hx = p.x, hy = p.y;
      tapTimer = setTimeout(function () { lastTap = null; var id = hit(hx, hy); if (id >= 0) openScreen(id); }, 300);
    }
    ovc.addEventListener('pointerup', up); ovc.addEventListener('pointercancel', function (e) { delete ptr[e.pointerId]; pinch = null; drag = null; });
    ovc.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(-Math.max(-300, Math.min(300, e.deltaY)) * 0.0016)); }, { passive: false });
    window.addEventListener('keydown', function (e) {
      if (e.target === cmd) { if (e.key === 'Escape') { cmd.value = ''; run(''); cmd.blur(); } return; }
      if (e.key === '/') { e.preventDefault(); cmd.focus(); }
      else if (e.key === 'Escape') { if (!sheet.hidden) sheet.hidden = true; else { cmd.value = ''; run(''); } }
      else if (e.key === ' ' && e.target === document.body) { e.preventDefault(); playB.click(); }
      else if (e.key === '+' || e.key === '=') zoomAt(vw / 2, vh / 2, 1.5);
      else if (e.key === '-' || e.key === '_') zoomAt(vw / 2, vh / 2, 1 / 1.5);
      else if (e.key === '0' || e.key === 'Home') { fitWall(); kick(); }
      else if (e.key.indexOf('Arrow') === 0) { var st = 120 / camT.z; if (e.key === 'ArrowLeft') camT.x -= st; if (e.key === 'ArrowRight') camT.x += st; if (e.key === 'ArrowUp') camT.y -= st; if (e.key === 'ArrowDown') camT.y += st; kick(); }
    });
    // ---- size and loop
    function resize() {
      dpr = Math.min(3, window.devicePixelRatio || 1); vw = window.innerWidth; vh = window.innerHeight;
      glc.width = ovc.width = Math.round(vw * dpr); glc.height = ovc.height = Math.round(vh * dpr);
      stateAt(performance.now()); setHud();
      relayout(false); fitWall(true); kick();
    }
    window.addEventListener('resize', resize);
    var last = performance.now(), frames = 0, fpsT = last, raf = 0, needs = true, cost = 0, firstSel = -1;
    function kick() { needs = true; if (!raf) raf = requestAnimationFrame(frame); }
    function frame(now) {
      raf = 0;
      var dt = Math.min(100, now - last); last = now;
      frames++; if (now - fpsT >= 1000) { window.__fps = Math.round(frames * 1000 / (now - fpsT)); frames = 0; fpsT = now; }
      if (playing && span > 0) { T = Math.min(span, T + dt * span / replayMs); if (T >= span) { playing = false; syncPlay(); } scrub.value = String(Math.round(T / span * 1000)); }
      if (animT0 >= 0) {
        var a = Math.min(1, (now - animT0) / ANIM), e = a < 0.5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2;
        for (var j = 0; j < N; j++) { px[j] = fx[j] + (tx[j] - fx[j]) * e; py[j] = fy[j] + (ty[j] - fy[j]) * e; }
        if (a >= 1) animT0 = -1;
      }
      var k = 1 - Math.exp(-dt / 110);
      cam.x += (camT.x - cam.x) * k; cam.y += (camT.y - cam.y) * k; cam.z = Math.exp(Math.log(cam.z) + (Math.log(camT.z) - Math.log(cam.z)) * k);
      var c0 = performance.now();
      stateAt(now); draw(now); setHud();
      cost = cost * 0.9 + (performance.now() - c0) * 0.1;
      window.__wall = { screens: N, selected: sel.n, era: cnt.era, T: T, span: span, playing: playing, zoom: cam.z, gl: Boolean(gl), frameMs: Math.round(cost * 100) / 100,
        firstMatch: firstSel >= 0 ? W2S(px[firstSel] + TW / 2, py[firstSel] + TH / 2).map(Math.round) : null };
      needs = false;
      if (!reduce || animT0 >= 0 || Math.abs(cam.z - camT.z) > 1e-4 * camT.z || Math.abs(cam.x - camT.x) * cam.z > 0.3 || Math.abs(cam.y - camT.y) * cam.z > 0.3) raf = requestAnimationFrame(frame);
    }
    resize();
  }
}

// ------------------------------------------------------------------ the generator
/**
 * Build the wall from root into outDir: index.html and data.json. Returns { path, dataPath, bytes, dataBytes, screens, shown, eras, sources, missing }.
 * builtAt is the caller's own new Date().toISOString(); the same records and builtAt make the same bytes.
 */
export function generateDatacenter({ root = ROOT, outDir = null, builtAt, env = process.env } = {}) {
  if (typeof builtAt !== 'string' || !builtAt.trim()) throw new Error('datacenter: no builtAt: the caller passes its own new Date().toISOString()');
  const dir = outDir || path.join(root, 'web', 'dist', 'datacenter');
  const data = datacenterModel(readRecords(root), { builtAt, secrets: secretValues(env) });
  const json = safeJson(data) + '\n';
  const html = renderPage(data);
  if (html.includes(EM) || json.includes(EM)) throw new Error('datacenter: an em dash reached the output');
  if (Buffer.byteLength(html) >= PAGE_CAP) throw new Error('datacenter: index.html is ' + Buffer.byteLength(html) + ' bytes, the cap is ' + PAGE_CAP);
  if (Buffer.byteLength(json) >= DATA_CAP) throw new Error('datacenter: data.json is ' + Buffer.byteLength(json) + ' bytes, the cap is ' + DATA_CAP);
  fs.mkdirSync(dir, { recursive: true });
  const page = path.join(dir, 'index.html'), dataPath = path.join(dir, 'data.json');
  fs.writeFileSync(page, html);
  fs.writeFileSync(dataPath, json);
  const shown = Object.fromEntries(Object.entries(data.caps).map(([k, [n, m]]) => [k, n + ' of ' + m]));
  return { path: page, dataPath, bytes: Buffer.byteLength(html), dataBytes: Buffer.byteLength(json), screens: data.screens, shown, eras: data.totals.eras,
    sources: (data.totals.sources ?? 0) + (data.totals.tapes ?? 0), missing: data.missing };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), flag = (n) => { const i = args.indexOf('--' + n); return i >= 0 && i + 1 < args.length ? args[i + 1] : null; };
  try {
    const root = path.resolve(flag('root') || ROOT), out = flag('out') ? path.resolve(flag('out')) : null;
    const r = generateDatacenter({ root, outDir: out, builtAt: flag('built-at') || new Date().toISOString() });
    console.log(JSON.stringify({ bytes: r.bytes, dataBytes: r.dataBytes, screens: r.screens, shown: r.shown, eras: r.eras, sources: r.sources, missing: r.missing }));
  } catch (e) {
    console.error('datacenter: ' + String((e && e.message) || e).split('\n')[0]);
    process.exit(1);
  }
}
