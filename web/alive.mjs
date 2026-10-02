// web/alive.mjs: the living page, dilation.dev/alive. His plan, verbatim: "A living page, dilation.dev/alive: generations,
// cells, arms, and what it learned in the last hour, for him and for VCs." Author: Day 3 board, alive builder, 2026-10-01.
//
// WHAT IT IS. Pure functions, data in and HTML out. readAlive(root) reads the organism's own records (grown/generations.json,
// grown/index.json, grown/self.json, grown/cortex.json, grown/apps.json, grow/dreams.jsonl, grow/curriculum.jsonl) and never
// throws: a missing, empty or broken file is a source with a state, not an exception. aliveModel turns the records into the
// numbers the page shows, each next to the file it came from; aliveHtml renders that model, and aliveData IS that model, served
// beside the page as /alive/data.json, so a reader can check every number against the file and the bytes (sha256) it was read from.
// WHY THIS SHAPE. He reads it on his phone first and VCs pay for what they see, so the first screen is the verdict in large
// numbers. His standing rule is that every number is traceable, so nothing here types one: a section with nothing to show says
// "none yet" and why, and a rate whose denominator is 0 is "none yet", never a 0. builtAt is passed in by web/build.mjs (its own
// new Date().toISOString()); aliveHtml never reads a clock, so the same records and stamp always make the same bytes.
// Every string from a record is HTML-escaped (dream prompts are text the organism wrote for itself: untrusted) and an em dash in
// a record becomes a comma, so none reaches the page; data.json keeps the record's text and writes an em dash as its \u escape.
//
// THE NEO PART (his order 7, "visible constant improvement"; and of 20:51Z, "simple at first but infintie potential"):
// the organism that heartbeats and iterates itself with no model, seen from outside. Read at build time from the
// committed files the eras write (NEO_FILES: neo/LEDGER.json, neo/ERA.json, grown/measure.jsonl, neo/ABSORB.json,
// neo/frontier.json, neo/TRIALS.jsonl, neo/COMPUTE.json), every number exactly as the file holds it, a file not written yet "not yet":
// iterations, eras and the last era's time and body, tasks, colonies, cells, mastered and the held-out fraction of the
// newest measure row, the newest SERIES_ROWS rows as two inline SVG sparklines with their table, velocity and plateau
// when the row has them, sources absorbed and the crawl queue's counts, the self-modification record (neo/TRIALS.jsonl
// with grown/self.json and grown/cortex.json), the bodies that beat in the day before the build, and one plain sentence
// for what is not working yet, built from those numbers. FEATURE-DETECTED: the last promote (pipelineOf: an era row's
// pipeline and promoted fields, grow/era.mjs) and the compute ledger (computeOf: neo/COMPUTE.json, grow/compute.mjs, read
// generically) show only when the files carry them. A count of one takes the singular noun (pl). OPEN-ENDED: a velocity
// key the measure adds later is drawn by its own name, a body the era names later is counted by its own name.
// GUARDS: refusedPath keeps every reader off state/, judge/heldout/, judge/control.jsonl and neo/tasks/*/heldout.jsonl
// (the read is refused before a file is opened); every JSON file is size-capped and a JSON-lines file is read from its
// newest bytes (a torn line is counted and skipped); every string of the model is scrubbed (token shapes, credentials
// in a URL, the value of any token-named variable of the build's environment, and any path into the runtime directory)
// before it reaches the page or data.json. No script on the page, no external request.
// NEO part author: Opus 5.5 builder (ALIVE) for the Fable 5.1 orchestrator, 2026-10-01.
//
// Run: node web/alive.mjs   (writes web/dist/alive/index.html and data.json, prints one JSON line; web/build.mjs calls generateAlive)
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FILES = Object.freeze({ generations: 'grown/generations.json', index: 'grown/index.json', self: 'grown/self.json', cortex: 'grown/cortex.json',
  apps: 'grown/apps.json', dreams: 'grow/dreams.jsonl', curriculum: 'grow/curriculum.jsonl' });
// grow/cortex.mjs DEFAULT_POINTER: with no ledger the cortex is the model the procedure names (GROW.md step 2)
export const DEFAULT_POINTER = 'claude-opus-5-5';
export const PAGE_CAP = 150000;
// The page grows by a row per generation (hourly); past these the rows live in data.json only, so the page stays under the cap.
export const GEN_ROWS = 120, HISTORY_ROWS = 40, DREAM_PROMPTS = 6;
const PROMPT_CHARS = 240;
const EM = String.fromCharCode(0x2014);
// the NEO part's files (kept apart from FILES so a page built before the part landed still matches its own data.json)
export const NEO_FILES = Object.freeze({ ledger: 'neo/LEDGER.json', era: 'neo/ERA.json', measure: 'grown/measure.jsonl', absorb: 'neo/ABSORB.json',
  frontier: 'neo/frontier.json', trials: 'neo/TRIALS.jsonl', compute: 'neo/COMPUTE.json' });
// the sparkline's rows, the trial rows on the page, the window of the bodies that beat (a day before the build stamp)
export const SERIES_ROWS = 48, TRIAL_ROWS = 8, BODY_WINDOW_MS = 24 * 60 * 60 * 1000;
// bounds: a JSON file over jsonBytes is not parsed; a JSON-lines file is read from its newest bytes
export const READ_LIMITS = Object.freeze({ jsonBytes: 32 * 1024 * 1024, measureBytes: 4 * 1024 * 1024, trialsBytes: 16 * 1024 * 1024 });

// ------------------------------------------------------------------ guards: what may never be opened, what may never be shown
// exactly the rule: state/, judge/heldout/, judge/control.jsonl and neo/tasks/*/heldout.jsonl (one task segment), no wider
const REFUSED = [/^state(\/|$)/i, /^judge\/heldout(\/|$)/i, /^judge\/control\.jsonl$/i, /^neo\/tasks\/[^/]+\/heldout\.jsonl$/i];
/** Why a tree-relative path may not be opened (a held-out or runtime path, or a path that leaves the tree), else null. */
export function refusedPath(rel) {
  const r = String(rel ?? '').replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^(\.\/)+/, '');
  if (!r || r.startsWith('/') || /^[a-z]:/i.test(r) || r.split('/').includes('..')) return 'not a path inside the tree';
  return REFUSED.some((re) => re.test(r)) ? 'a held-out or runtime path: never opened' : null;
}
const REDACTED = '[redacted]', RUNTIME = '[a runtime path]';
// a distinctive prefix is matched even glued to the word before it; a short generic one (sk-, npm_, rk_) only at a word start
const TOKEN_SHAPES = [
  /gh[pousr]_[A-Za-z0-9]{20,}/g, /github_pat_[A-Za-z0-9_]{20,}/g, /glpat-[A-Za-z0-9_-]{16,}/g, /\bnpm_[A-Za-z0-9]{30,}/g,
  /sk-(?:ant|proj)-[A-Za-z0-9_-]{20,}/g, /\bsk-[A-Za-z0-9_-]{20,}/g, /\b[rsp]k_(?:live|test)_[A-Za-z0-9]{10,}/g, /xox[abposr]-[A-Za-z0-9-]{10,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g, /AIza[0-9A-Za-z_-]{35}/g, /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}/g, /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi,
];
const URL_CRED = /\b([a-z][a-z0-9+.-]*:\/\/)[^\s/@:]*:[^\s/@]+@/gi;
const NAMED = /\b((?:[A-Za-z0-9]+[_-])*(?:token|secret|password|passwd|api[_-]?key|access[_-]?key|auth))(\s*[:=]\s*)(["']?)[^\s"',;&]{6,}/gi;
const RUNTIME_PATH = /[^\s"'<>()]*(?<![A-Za-z0-9_.-])state[\\/][^\s"'<>()]*/gi;
/** A string with every token shape, credential in a URL, token-named assignment and runtime path replaced; secrets are exact values to remove too. */
export function scrub(s, secrets = []) {
  let t = String(s);
  for (const v of secrets) if (typeof v === 'string' && v.length >= 8) t = t.split(v).join(REDACTED);
  for (const re of TOKEN_SHAPES) t = t.replace(re, REDACTED);
  return t.replace(URL_CRED, '$1' + REDACTED + '@').replace(NAMED, '$1$2$3' + REDACTED).replace(RUNTIME_PATH, RUNTIME);
}
const SECRET_NAME = /token|secret|password|passwd|api[_-]?key|access[_-]?key|credential|auth|private|cookie|session|pat$/i;
/** The values (never the names, never printed) of the environment's token-named variables, the build scrubs them by value. */
export function secretValues(env = {}) {
  const out = [];
  for (const [k, v] of Object.entries(isObjLoose(env) ? env : {})) if (SECRET_NAME.test(k) && typeof v === 'string' && v.length >= 8) out.push(v);
  return out.sort((a, b) => b.length - a.length);
}
function isObjLoose(v) { return Boolean(v) && typeof v === 'object'; }
/** Every string of a value scrubbed (keys too), a fresh copy; numbers, booleans and null as they are. */
function deepScrub(v, secrets) {
  if (typeof v === 'string') return scrub(v, secrets);
  if (Array.isArray(v)) return v.map((x) => deepScrub(x, secrets));
  if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[scrub(k, secrets)] = deepScrub(x, secrets); return o; }
  return v;
}

// an em dash in a record becomes a comma (with the spaces around it folded), so the page never carries one
const DASH = new RegExp('\\s*' + EM + '\\s*', 'g');
const noDash = (s) => String(s).replace(DASH, ', ');
export const esc = (s) => scrub(noDash(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const count = (v) => (Number.isInteger(v) && v >= 0 ? v : null);
const finite = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const text = (v) => (typeof v === 'string' && v.trim() ? v : null);
const clip = (s, n) => (s.length > n ? s.slice(0, n - 3) + '...' : s);
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

// ------------------------------------------------------------------ reading (tolerant: a file is a source with a state)
/** The newest maxBytes of a file from its first whole line, and the sha256 of the whole file (hashed in chunks). */
function readTail(file, size, maxBytes) {
  const fd = fs.openSync(file, 'r');
  try {
    const hash = createHash('sha256'), chunk = Buffer.alloc(1024 * 1024);
    for (let pos = 0; pos < size;) { const n = fs.readSync(fd, chunk, 0, Math.min(chunk.length, size - pos), pos); if (n <= 0) break; hash.update(chunk.subarray(0, n)); pos += n; }
    // one byte more than the window, so a window that starts on a line start keeps that line (the byte before it is its newline)
    const tail = Buffer.alloc(maxBytes + 1);
    const got = fs.readSync(fd, tail, 0, maxBytes + 1, size - maxBytes - 1);
    const buf = tail.subarray(0, got), nl = buf.indexOf(10);
    return { buf: nl < 0 ? Buffer.alloc(0) : buf.subarray(nl + 1), sha256: hash.digest('hex') };
  } finally { fs.closeSync(fd); }
}
/**
 * One record of the tree as text, never throwing: { src: { file, state, bytes, sha256 }, body }. A refused path (refusedPath)
 * is never opened; a file over maxBytes is "too large", or with tail its newest maxBytes from a whole line (src.tailBytes).
 */
export function load(root, rel, { maxBytes = READ_LIMITS.jsonBytes, tail = false } = {}) {
  const src = { file: rel, state: 'missing', bytes: null, sha256: null };
  if (refusedPath(rel)) { src.state = 'refused'; return { src, body: null }; }
  const file = path.join(root, ...rel.split('/'));
  let buf;
  try {
    const st = fs.statSync(file, { throwIfNoEntry: false });
    if (!st) return { src, body: null };
    if (!st.isFile()) { src.state = 'unreadable'; return { src, body: null }; }
    if (st.size > maxBytes) {
      src.bytes = st.size;
      if (!tail) { src.state = 'too large'; return { src, body: null }; }
      const t = readTail(file, st.size, maxBytes);
      buf = t.buf; src.sha256 = t.sha256; src.tailBytes = maxBytes;
    } else {
      buf = fs.readFileSync(file);
      src.bytes = buf.length;
      src.sha256 = createHash('sha256').update(buf).digest('hex');
    }
  } catch { src.state = 'unreadable'; return { src, body: null }; }
  const body = buf.toString('utf8').replace(/^﻿/, '');
  if (!body.trim()) { src.state = 'empty'; return { src, body: null }; }
  src.state = 'read';
  return { src, body };
}
function loadJson(root, rel, shapeOk) {
  const { src, body } = load(root, rel);
  if (body === null) return { src, json: null };
  let json;
  try { json = JSON.parse(body); } catch { src.state = 'not JSON'; return { src, json: null }; }
  if (!shapeOk(json)) { src.state = 'wrong shape'; return { src, json: null }; }
  return { src, json };
}
function loadJsonl(root, rel, opts) {
  const { src, body } = load(root, rel, opts);
  if (body === null) return { src, rows: [] };
  const rows = [];
  let bad = 0;
  for (const line of body.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { const r = JSON.parse(line); if (isObj(r)) rows.push(r); else bad++; } catch { bad++; }
  }
  src.rows = rows.length;
  src.bad = bad;
  if (!rows.length) src.state = 'no JSON line';
  return { src, rows };
}

/**
 * The NEO records under root, never throwing: { ledger, era, measure: [rows], absorb, frontier, trials: [rows], compute, sources }.
 * Each a whole object as its file holds it (or null / []); the model picks the numbers.
 */
export function readNeo(root = ROOT) {
  const led = loadJson(root, NEO_FILES.ledger, isObj), er = loadJson(root, NEO_FILES.era, isObj);
  const ab = loadJson(root, NEO_FILES.absorb, isObj), fr = loadJson(root, NEO_FILES.frontier, isObj);
  const me = loadJsonl(root, NEO_FILES.measure, { maxBytes: READ_LIMITS.measureBytes, tail: true });
  const tr = loadJsonl(root, NEO_FILES.trials, { maxBytes: READ_LIMITS.trialsBytes, tail: true });
  const co = loadJson(root, NEO_FILES.compute, isObj);
  return { ledger: led.json, era: er.json, measure: me.rows, absorb: ab.json, frontier: fr.json, trials: tr.rows, compute: co.json,
    sources: { ledger: led.src, era: er.src, measure: me.src, absorb: ab.src, frontier: fr.src, trials: tr.src, compute: co.src } };
}

/** The organism's records under root, never throwing: { generations, index, self, cortex, apps, dreams, curriculum, neo, sources }. */
export function readAlive(root = ROOT) {
  const g = loadJson(root, FILES.generations, (j) => isObj(j) && Array.isArray(j.generations));
  const ix = loadJson(root, FILES.index, (j) => isObj(j) && Array.isArray(j.cells));
  const sf = loadJson(root, FILES.self, isObj);
  const cx = loadJson(root, FILES.cortex, isObj);
  const ap = loadJson(root, FILES.apps, (j) => isObj(j) && Array.isArray(j.apps));
  const dr = loadJsonl(root, FILES.dreams), cu = loadJsonl(root, FILES.curriculum);
  return {
    generations: g.json ? g.json.generations.filter((e) => isObj(e) && Number.isInteger(e.generation)) : [],
    index: { generation: ix.json ? count(ix.json.generation) : null, cells: ix.json ? ix.json.cells.filter((c) => isObj(c) && text(c.id)) : [] },
    self: { trial: sf.json && isObj(sf.json.trial) ? sf.json.trial : null, history: sf.json && Array.isArray(sf.json.history) ? sf.json.history.filter(isObj) : [] },
    cortex: cx.json,
    apps: ap.json ? ap.json.apps.filter(isObj) : [],
    dreams: dr.rows, curriculum: cu.rows, neo: readNeo(root),
    sources: { generations: g.src, index: ix.src, self: sf.src, cortex: cx.src, apps: ap.src, dreams: dr.src, curriculum: cu.src },
  };
}

// ------------------------------------------------------------------ the model: every number the page shows, with its file
function lanesOf(e) {
  const lanes = isObj(e.lanes) ? e.lanes : {};
  return Object.keys(lanes).map((lane) => {
    const l = isObj(lanes[lane]) ? lanes[lane] : {};
    return { lane, candidates: count(l.candidates), survivors: count(l.survivors), parent: lane === e.parent };
  });
}
function genRow(e) {
  const lanes = lanesOf(e);
  const counted = lanes.filter((l) => l.candidates !== null && l.survivors !== null);
  const note = text(e.note);
  return {
    generation: e.generation, at: text(e.at), parent: text(e.parent), lanes,
    candidates: counted.length ? counted.reduce((a, l) => a + l.candidates, 0) : null,
    survivors: counted.length ? counted.reduce((a, l) => a + l.survivors, 0) : null,
    misses: Array.isArray(e.misses) ? e.misses.length : null, note, byHand: Boolean(note && /by hand/i.test(note)),
  };
}
/** Hours from a record's stamp to the build, one decimal; null when either is not an ISO stamp. */
export function hoursBefore(at, builtAt) {
  if (!text(at) || !text(builtAt) || !ISO.test(at) || !ISO.test(builtAt)) return null;
  const a = Date.parse(at), b = Date.parse(builtAt);
  return Number.isFinite(a) && Number.isFinite(b) ? Math.round((b - a) / 360000) / 10 : null;
}
// a rate as the ledger holds it; a 0 denominator is no rate
const rateOf = (r) => (isObj(r) ? { generation: count(r.generation), candidates: count(r.candidates), survivors: count(r.survivors), rate: r.candidates === 0 ? null : finite(r.rate) } : null);
function tally(rows, key, empty) {
  const m = new Map();
  for (const r of rows) { const k = text(r[key]) || empty; m.set(k, (m.get(k) || 0) + 1); }
  return [...m].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map(([k, n]) => ({ [key]: k, n }));
}
function challengerOf(c) {
  if (text(c)) return { model: c, by: null, at: null };
  if (!isObj(c)) return null;
  const model = text(c.model) || text(c.id) || text(c.name);
  return model ? { model, by: text(c.by), at: text(c.at) || text(c.since) } : null;
}
function cortexRow(h) {
  return {
    generation: count(h.generation), incumbent: text(h.incumbent), challenger: text(h.challenger) || (isObj(h.challenger) ? text(h.challenger.model) : null),
    pairs: finite(h.pairs), incumbentScore: finite(h.incumbentScore), challengerScore: finite(h.challengerScore),
    incumbentSurvivors: count(h.incumbentSurvivors), challengerSurvivors: count(h.challengerSurvivors), verdict: text(h.verdict), reason: text(h.reason), at: text(h.at) || text(h.judgedAt),
  };
}
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/, APP_PATH = /^\/apps\/[a-z0-9][a-z0-9-]{0,63}\/$/;

// ------------------------------------------------------------------ the NEO part of the model
// a body as grow/measure.mjs bodiesPart accepts one; an era row without one is "unrecorded", any other value "unrecognised"
const BODY_RE = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,63}$/;
const bodyName = (b) => (b === undefined || b === null ? 'unrecorded' : typeof b === 'string' && BODY_RE.test(b) ? b : 'unrecognised');
// the velocity keys of contract c7 first, in its order; any other numeric key the measure adds is drawn after them by name
export const VELOCITY_ORDER = Object.freeze(['cellsPerSecond', 'tasksPerMinute', 'masteredPerEra', 'eraMs', 'workers', 'era']);
const KEY_RE = /^[A-Za-z][A-Za-z0-9_]{0,40}$/;
const arrLen = (v) => (Array.isArray(v) ? v.length : null);
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
function velocityOf(v) {
  if (!isObj(v)) return null;
  const keys = Object.keys(v).filter((k) => KEY_RE.test(k) && finite(v[k]) !== null);
  const known = VELOCITY_ORDER.filter((k) => keys.includes(k)), other = keys.filter((k) => !VELOCITY_ORDER.includes(k)).sort();
  const out = [...known, ...other].map((key) => ({ key, value: v[key] }));
  return out.length ? out : null;
}
const neoCounts = (r) => {
  const o = isObj(r.neo) ? r.neo : {}, h = isObj(o.heldout) ? o.heldout : {};
  return { tasks: count(o.tasks), colonies: count(o.colonies), cells: count(o.cells), mastered: count(o.mastered), ok: count(h.ok), n: count(h.n), score: finite(h.score) };
};
/** first, last (each with its era), lowest and highest of one key over the series rows; null when no row holds it. */
function statsOf(rows, key) {
  const held = rows.filter((r) => r[key] !== null);
  if (!held.length) return null;
  const vals = held.map((r) => r[key]), a = held[0], z = held[held.length - 1];
  return { first: a[key], firstEra: a.era, last: z[key], lastEra: z.era, min: Math.min(...vals), max: Math.max(...vals) };
}
/** A trial row of neo/TRIALS.jsonl as grow/evolve.mjs counts it: skipped, retired, kept, blocked, else reverted. */
export function trialVerdict(r) {
  if (r.skipped) return 'skipped';
  if (isObj(r.change) && r.change.op === 'retire') return 'retired';
  if (r.kept === true) return 'kept';
  if (r.blocked) return 'blocked';
  return 'reverted';
}
/** A trial's change as one short line: a string as it is, an object as its first scalar fields. */
function changeText(c) {
  if (text(c)) return clip(c, 120);
  if (!isObj(c)) return null;
  const parts = Object.entries(c).filter(([k, v]) => KEY_RE.test(k) && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')).slice(0, 4).map(([k, v]) => k + ' ' + v);
  return parts.length ? clip(parts.join(', '), 120) : null;
}

/** A count's noun: the singular for exactly 1, else the plural. */
export const pl = (v, one, many) => (v === 1 ? one : many);

/** The highest-numbered row among rows (a tie, the later row), or null. */
const highest = (rows) => rows.reduce((a, r) => (!a || r.era >= a.era ? r : a), null);
/**
 * THE LAST PROMOTE, feature-detected: grow/era.mjs gives an era row `pipeline` (snapshot, absent or none) and, once its
 * promote step answered, `promoted` { promoted, why, raised, fell, gained, before, after }. null when no row carries
 * either (a tree before the pipeline landed); else the newest row's pipeline and the newest promote with its counts.
 */
export function pipelineOf(eraRows) {
  const rows = (Array.isArray(eraRows) ? eraRows : []).filter((r) => isObj(r) && count(r.era) !== null);
  const lp = highest(rows.filter((r) => text(r.pipeline) || isObj(r.promoted)));
  if (!lp) return null;
  const pr = highest(rows.filter((r) => isObj(r.promoted)));
  const po = pr ? pr.promoted : null;
  return {
    state: text(lp.pipeline) ? clip(lp.pipeline, 24) : null, stateEra: lp.era,
    era: pr ? pr.era : null, at: pr ? text(pr.at) : null,
    promoted: po && typeof po.promoted === 'boolean' ? po.promoted : null,
    why: po && text(po.why) ? clip(po.why, 200) : null,
    raised: po ? arrLen(po.raised) : null, fell: po ? arrLen(po.fell) : null, gained: po ? arrLen(po.gained) : null,
    before: po ? finite(po.before) : null, after: po ? finite(po.after) : null,
  };
}

// the ledger keys of grow/compute.mjs nextLedger first, in its order; any other scalar key after them by name
export const COMPUTE_ORDER = Object.freeze(['month', 'at', 'budgetMinutes', 'spentMinutes', 'reservePct', 'heartbeatMinutes', 'visibility', 'source']);
const COMPUTE_FIELDS = 16;
/** The scalar fields of an object (a finite number, a boolean, a short string, or null) as [{ key, value }], known keys first. */
function scalarsOf(o, order = []) {
  const keys = Object.keys(o).filter((k) => KEY_RE.test(k) && (o[k] === null || typeof o[k] === 'boolean' || finite(o[k]) !== null || typeof o[k] === 'string'));
  const known = order.filter((k) => keys.includes(k)), other = keys.filter((k) => !order.includes(k)).sort();
  return [...known, ...other].slice(0, COMPUTE_FIELDS).map((key) => ({ key, value: typeof o[key] === 'string' ? clip(o[key], 120) : o[key] }));
}
/**
 * THE COMPUTE LEDGER, feature-detected: neo/COMPUTE.json as grow/compute.mjs writes it, read generically: its scalar
 * fields, the size of each list or map it holds (runs, plans), and the scalar fields of its newest plan. null without it.
 */
export function computeOf(c) {
  if (!isObj(c)) return null;
  const counts = Object.keys(c).filter((k) => KEY_RE.test(k) && (Array.isArray(c[k]) || isObj(c[k]))).sort()
    .map((key) => ({ key, n: Array.isArray(c[key]) ? c[key].length : Object.keys(c[key]).length }));
  const plans = Array.isArray(c.plans) ? c.plans : null;
  const lastPlan = plans && plans.length && isObj(plans[plans.length - 1]) ? scalarsOf(plans[plans.length - 1], ['at', 'beatMinutes', 'shards', 'relay', 'mergeMinutes', 'why']) : null;
  return { fields: scalarsOf(c, COMPUTE_ORDER), counts, lastPlan };
}

/** The plain sentence of what is not working yet, from the numbers alone (each one a number the page shows beside it). */
export function gapSentence(now, last, same) {
  if (!now || [now.tasks, now.mastered, now.ok, now.n].every((v) => v === null)) return null;
  const parts = [];
  if (now.tasks !== null && now.mastered !== null && now.mastered < now.tasks) parts.push('only ' + now.mastered + ' of ' + now.tasks + pl(now.tasks, ' task is', ' tasks are') + ' mastered');
  if (now.tasks !== null && now.colonies !== null && now.colonies < now.tasks) parts.push(now.colonies + ' of ' + now.tasks + pl(now.tasks, ' task has', ' tasks have') + ' a colony at all');
  if (now.ok !== null && now.n !== null && now.ok < now.n) parts.push('the colonies answer ' + now.ok + ' of ' + now.n + pl(now.n, ' held-out row', ' held-out rows') + ' right' + (now.score !== null ? ' (' + now.score + ')' : ''));
  if (now.plateau !== null && now.plateau > 0) parts.push('the held-out total has not risen for ' + now.plateau + pl(now.plateau, ' era', ' eras'));
  if (same !== null) parts.push('the newest ' + same + ' measure rows hold the same task, colony, cell, mastered and held-out counts');
  if (last && last.grown !== null && last.grown > 0 && last.promoted === 0) parts.push('era ' + last.era + ' grew ' + last.grown + pl(last.grown, ' task', ' tasks') + ' and promoted none');
  return parts.length ? 'Not working yet: ' + parts.join('; ') + '.' : 'No gap shows in these numbers yet.';
}

/** The NEO part: every number from the file that holds it (see NEO_FILES), null when the file does not hold it. */
export function neoModel(raw, { builtAt = null, selfHistory = [], cortexHistory = [] } = {}) {
  const n = isObj(raw) ? raw : {};
  const given = isObj(n.sources) ? n.sources : {};
  const sources = {};
  for (const k of Object.keys(NEO_FILES)) sources[k] = isObj(given[k]) ? { ...given[k], file: NEO_FILES[k] } : { file: NEO_FILES[k], state: 'missing', bytes: null, sha256: null };
  const built = text(builtAt);
  const ledger = isObj(n.ledger) ? n.ledger : null;
  // ERA: the count, the last era (the highest number; a tie, the later row), the bodies of the day before the build
  const ed = isObj(n.era) ? n.era : null;
  const eraRows = ed && Array.isArray(ed.eras) ? ed.eras.filter((r) => isObj(r) && count(r.era) !== null) : [];
  const lr = highest(eraRows);
  const grown = lr && Array.isArray(lr.grown) ? lr.grown.filter(isObj) : null;
  const last = lr ? { era: lr.era, at: text(lr.at), hoursBefore: hoursBefore(lr.at, built), ms: count(lr.ms), body: bodyName(lr.body), workers: count(lr.workers),
    grown: grown ? grown.length : null, promoted: grown ? grown.filter((g) => g.promoted === true).length : null, cells: count(lr.cells), mastered: count(lr.mastered) } : null;
  let bodies = null;
  if (eraRows.length && built && ISO.test(built) && Number.isFinite(Date.parse(built))) {
    const end = Date.parse(built), since = end - BODY_WINDOW_MS, by = new Map();
    let eras = 0, ahead = 0;
    for (const r of eraRows) {
      const t = text(r.at) && ISO.test(r.at) ? Date.parse(r.at) : NaN;
      if (!Number.isFinite(t) || t < since) continue;
      eras++;
      if (t > end) ahead++;
      const k = bodyName(r.body), b = by.get(k) || { body: k, eras: 0, last: null };
      b.eras++;
      if (!b.last || r.at > b.last) b.last = r.at;
      by.set(k, b);
    }
    bodies = { since: new Date(since).toISOString(), eras, by: [...by.values()].sort((a, b) => b.eras - a.eras || cmp(a.body, b.body)), ...(ahead ? { ahead } : {}) };
  }
  // MEASURE: the newest row and the series of the newest SERIES_ROWS rows
  const mrows = (Array.isArray(n.measure) ? n.measure : []).filter(isObj);
  const lm = mrows.length ? mrows[mrows.length - 1] : null;
  const now = lm ? { era: count(lm.era), at: text(lm.at), ...neoCounts(lm), velocity: velocityOf(lm.velocity), plateau: count(lm.plateau) } : null;
  const rows = mrows.slice(-SERIES_ROWS).map((r) => { const c = neoCounts(r); return { era: count(r.era), at: text(r.at), mastered: c.mastered, ok: c.ok, n: c.n, score: c.score }; });
  const sig = (r) => { const c = neoCounts(r); return Object.values(c).some((v) => v === null) ? null : JSON.stringify(c); };
  let same = null;
  if (lm && sig(lm) !== null) {
    let k = 1;
    for (let i = mrows.length - 2; i >= 0 && sig(mrows[i]) === sig(lm); i--) k++;
    if (k >= 2) same = k;
  }
  const series = rows.length ? { count: rows.length, rows, mastered: statsOf(rows, 'mastered'), score: statsOf(rows, 'score') } : null;
  // ABSORB and the crawl queue
  const ab = isObj(n.absorb) ? n.absorb : null;
  const pulled = ab && Array.isArray(ab.pulled) ? ab.pulled.filter(isObj) : null;
  const absorbed = ab ? { pulls: pulled ? pulled.length : null, sources: pulled ? new Set(pulled.filter((p) => text(p.id)).map((p) => p.id)).size : null,
    bytes: count(ab.bytes), rows: count(ab.rows), cursor: count(ab.cursor), blocked: arrLen(ab.blocked) } : null;
  const fr = isObj(n.frontier) ? n.frontier : null;
  const frontier = fr ? { queue: arrLen(fr.queue), seen: arrLen(fr.seen), repos: isObj(fr.repos) ? Object.keys(fr.repos).length : arrLen(fr.repos), added: arrLen(fr.added) } : null;
  // SELF-MODIFICATION: the native trials, then the routine's trials and the cortex trials the page shows below
  const trows = (Array.isArray(n.trials) ? n.trials : []).filter(isObj);
  let trials = null;
  if (trows.length) {
    const c = { kept: 0, reverted: 0, skipped: 0, blocked: 0, retired: 0 };
    for (const r of trows) c[trialVerdict(r)]++;
    trials = { rows: trows.length, ...c, newest: trows.slice(-TRIAL_ROWS).reverse().map((r) => ({ era: count(r.era), at: text(r.at), kind: text(r.kind) ? clip(r.kind, 24) : null,
      verdict: trialVerdict(r), change: changeText(r.change), why: clip(text(r.why) || text(r.skipped) || text(r.blocked) || '', 200) || null })) };
  }
  const selfMod = { trials, self: tally((Array.isArray(selfHistory) ? selfHistory : []).filter(isObj), 'verdict', 'no verdict'),
    cortex: tally((Array.isArray(cortexHistory) ? cortexHistory : []).filter(isObj), 'verdict', 'no verdict') };
  return {
    iterations: ledger ? count(ledger.generated) : null,
    eras: { count: ed ? count(ed.era) : null, last }, bodies, now, series, same, absorbed, frontier, selfMod,
    pipeline: pipelineOf(eraRows), compute: computeOf(n.compute),
    gap: gapSentence(now, last, same), sources,
  };
}

/**
 * The page's numbers and their files. builtAt is the caller's stamp; nothing here reads a clock. secrets are exact values
 * (secretValues of the build's environment) removed from every string, with every token shape and runtime path (scrub).
 */
export function aliveModel(data, { builtAt = null, secrets = [] } = {}) {
  // the records are scrubbed before the model clips any text (a clip must never cut a token or a secret in half and leave
  // a piece that no longer matches), and the model once more after (a line it composes)
  const sec = Array.isArray(secrets) ? secrets : [];
  return deepScrub(modelOf(deepScrub(data, sec), { builtAt }), sec);
}
function modelOf(data, { builtAt = null } = {}) {
  const d = isObj(data) ? data : {};
  const given = isObj(d.sources) ? d.sources : {};
  const sources = {};
  for (const k of Object.keys(FILES)) sources[k] = isObj(given[k]) ? { ...given[k], file: FILES[k] } : { file: FILES[k], state: 'missing', bytes: null, sha256: null };
  const built = text(builtAt);
  const generations = (Array.isArray(d.generations) ? d.generations : []).filter((e) => isObj(e) && Number.isInteger(e.generation)).map(genRow).sort((a, b) => a.generation - b.generation);
  const cells = (isObj(d.index) && Array.isArray(d.index.cells) ? d.index.cells : []).filter((c) => isObj(c) && text(c.id)).map((c) => {
    const h = isObj(c.heldout) ? c.heldout : {};
    return { id: c.id, class: text(c.class) || 'unclassed', generation: count(c.generation), lane: text(c.lane), score: finite(h.score), n: count(h.n), ok: count(h.ok), promotedAt: text(c.promotedAt) };
  }).sort((a, b) => (a.class < b.class ? -1 : a.class > b.class ? 1 : 0));
  const curriculum = (Array.isArray(d.curriculum) ? d.curriculum : []).filter(isObj);
  const dreamsAll = (Array.isArray(d.dreams) ? d.dreams : []).filter(isObj);
  // the octopus: one arm per domain (the curriculum's classes, in its order), then every other class a living cell holds
  const domains = [...new Set(curriculum.map((r) => text(r.class)).filter(Boolean))];
  const curByClass = tally(curriculum, 'class', 'unclassed');
  const extra = [...new Set(cells.map((c) => c.class))].filter((c) => !domains.includes(c)).sort();
  const arms = [...domains, ...extra].map((cls) => ({ class: cls, domain: domains.includes(cls), cells: cells.filter((c) => c.class === cls).map((c) => c.id),
    curriculum: (curByClass.find((x) => x.class === cls) || { n: 0 }).n }));
  const sf = isObj(d.self) ? d.self : {};
  const trial = isObj(sf.trial) ? sf.trial : null;
  const historyAll = (Array.isArray(sf.history) ? sf.history : []).filter(isObj).map((h) => ({
    generation: count(h.generation), target: text(h.target), verdict: text(h.verdict), baseline: rateOf(h.baseline), judged: rateOf(h.judged), reason: text(h.reason), judgedAt: text(h.judgedAt), appliedAt: text(h.appliedAt),
  }));
  const cx = isObj(d.cortex) ? d.cortex : null;
  const pointer = cx ? text(cx.pointer) : null;
  const cortexAll = (cx && Array.isArray(cx.history) ? cx.history.filter(isObj) : []).map(cortexRow);
  const apps = (Array.isArray(d.apps) ? d.apps : []).filter(isObj).map((a) => {
    const slug = text(a.slug) && SLUG.test(a.slug) ? a.slug : null;
    return { slug: text(a.slug), name: text(a.name) || text(a.slug) || 'unnamed', prompt: text(a.prompt), generation: count(a.generation),
      path: typeof a.path === 'string' && APP_PATH.test(a.path) ? a.path : slug ? '/apps/' + slug + '/' : null, at: text(a.at) };
  });
  const indexed = dreamsAll.map((r, i) => ({ r, i }));
  const newestDreams = indexed.sort((x, y) => { const a = text(x.r.at) || '', b = text(y.r.at) || ''; return a < b ? 1 : a > b ? -1 : y.i - x.i; }).slice(0, DREAM_PROMPTS)
    .map(({ r }) => ({ id: text(r.id), class: text(r.class) || 'unclassed', generation: count(r.generation), status: text(r.status), at: text(r.at), prompt: clip(text(r.prompt) || text(r.q) || '(no prompt)', PROMPT_CHARS) }));
  const newest = generations.length ? generations[generations.length - 1] : null;
  let last = null;
  if (newest) {
    const g = newest.generation;
    const collected = dreamsAll.filter((r) => r.generation === g);
    last = { ...newest, hoursBefore: hoursBefore(newest.at, built), promoted: cells.filter((c) => c.generation === g),
      self: historyAll.filter((h) => h.judged && h.judged.generation === g), cortex: cortexAll.filter((h) => h.generation === g),
      dreams: { count: collected.length, byClass: tally(collected, 'class', 'unclassed') } };
  }
  const genField = newest ? 'generations[generation ' + newest.generation + ']' : 'generations';
  return {
    page: '/alive', builtAt: built,
    vitals: {
      generations: { value: generations.length, file: FILES.generations, field: 'generations (records)' },
      cells: { value: cells.length, classes: new Set(cells.map((c) => c.class)).size, file: FILES.index, field: 'cells (records)' },
      lastGeneration: { generation: newest ? newest.generation : null, survivors: newest ? newest.survivors : null, candidates: newest ? newest.candidates : null, file: FILES.generations, field: genField + '.lanes' },
      dreams: { value: dreamsAll.length, classes: new Set(dreamsAll.map((r) => text(r.class) || 'unclassed')).size, file: FILES.dreams, field: 'lines' },
      cortex: { pointer: pointer || DEFAULT_POINTER, from: pointer ? 'file' : 'default', file: FILES.cortex, field: 'pointer' },
      heartbeat: { at: newest ? newest.at : null, hoursBefore: last ? last.hoursBefore : null, file: FILES.generations, field: genField + '.at' },
    },
    last, generations, cells, arms,
    self: { pending: trial ? { generation: count(trial.generation), next: count(trial.next), target: text(trial.target), baseline: rateOf(trial.baseline), appliedAt: text(trial.appliedAt), why: text(trial.why), hypothesis: text(trial.hypothesis) } : null,
      history: historyAll.slice(-HISTORY_ROWS).reverse(), count: historyAll.length },
    cortex: { pointer: pointer || DEFAULT_POINTER, from: pointer ? 'file' : 'default', since: cx ? (count(cx.since) ?? text(cx.since)) : null,
      challenger: cx ? challengerOf(cx.challenger) : null, history: cortexAll.slice(-HISTORY_ROWS).reverse(), count: cortexAll.length },
    dreams: { count: dreamsAll.length, byClass: tally(dreamsAll, 'class', 'unclassed'), byStatus: tally(dreamsAll, 'status', 'unmarked'), newest: newestDreams },
    curriculum: { count: curriculum.length, byClass: curByClass, byStatus: tally(curriculum, 'status', 'unmarked') },
    apps, sources,
    neo: neoModel(d.neo, { builtAt: built, selfHistory: historyAll, cortexHistory: cortexAll }),
  };
}

/** The JSON served at /alive/data.json: the model the page was rendered from. */
export const aliveData = (data, opts = {}) => aliveModel(data, opts);
/** data.json's bytes: an em dash is written as its \u escape, so the file holds none and still holds the record's text. */
export const jsonText = (model) => JSON.stringify(model, null, 2).split(EM).join('\\u2014') + '\n';

// ------------------------------------------------------------------ rendering
const STYLE = `:root { color-scheme: dark; --ink: #e8eefc; --dim: #7f8ba6; --line: rgba(150,180,255,0.14); --glass: rgba(10,14,26,0.62);
  --accent: #7fb0ff; --warm: #ffb27f; --violet: #c3b1ff; --live: #7fffb0; --bg: #02030a; }
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--ink); font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
body { padding: 0 16px 80px; overflow-x: hidden; background-image: radial-gradient(ellipse 90% 420px at 50% -60px, rgba(127,176,255,0.13), transparent 75%); background-repeat: no-repeat; }
.wrap { max-width: 1060px; margin: 0 auto; }
a { color: var(--accent); text-decoration: none; }
h1, h2, h3, .serif, .val, .verdict, .score, .gnum { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif; font-weight: 400; }
h1, h2, h3, .verdict, .gnum { font-style: italic; }
header.top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 22px 0 12px; border-bottom: 1px solid var(--line); }
.brand { letter-spacing: 0.22em; text-transform: uppercase; font-size: 11px; }
.dim, .brand .dim { color: var(--dim); }
nav.pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill { display: inline-block; background: var(--glass); border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; color: var(--ink);
  letter-spacing: 0.16em; text-transform: uppercase; font-size: 10.5px; font-style: normal; backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px); white-space: nowrap; }
a.pill:hover, .pill.here { border-color: var(--accent); text-shadow: 0 0 12px rgba(127,176,255,0.55); }
.pill.sm { padding: 1px 8px; font-size: 9.5px; letter-spacing: 0.12em; vertical-align: 2px; }
.pill.parent, .pill.hand, .pill.reverted, .pill.held { border-color: rgba(255,178,127,0.55); color: var(--warm); }
.pill.kept, .pill.moved { border-color: rgba(127,255,176,0.5); color: var(--live); }
.pill.pending { border-color: rgba(127,176,255,0.55); color: var(--accent); }
h1 { font-size: clamp(46px, 12vw, 78px); line-height: 1.02; margin: 26px 0 10px; text-shadow: 0 0 24px rgba(127,176,255,0.25); }
h2 { font-size: clamp(22px, 5.4vw, 28px); margin: 0 0 4px; line-height: 1.2; text-shadow: 0 0 16px rgba(127,176,255,0.18); }
h3 { font-size: 16px; margin: 20px 0 6px; color: #cfd9f5; }
.what { font-size: 14px; line-height: 1.7; color: #c9d3ec; max-width: 62ch; margin: 0; }
.verdict { font-size: clamp(19px, 4.8vw, 24px); line-height: 1.45; margin: 16px 0 0; color: #fff; max-width: 48ch; }
.verdict b, .lede b, .line b { font-weight: 400; color: var(--accent); }
.tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 18px 0 6px; }
.tile { background: var(--glass); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px 10px; min-width: 0; backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px); box-shadow: 0 0 26px rgba(127,176,255,0.05); }
.tile.wide { grid-column: span 2; }
.tile .lbl { color: var(--dim); letter-spacing: 0.14em; text-transform: uppercase; font-size: 10px; }
.val { font-size: clamp(36px, 10.5vw, 48px); line-height: 1.08; margin: 4px 0 2px; color: #fff; text-shadow: 0 0 18px rgba(127,176,255,0.35); overflow-wrap: anywhere; }
.val.str { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: clamp(15px, 4.4vw, 20px); padding: 8px 0 5px; }
.val .of { color: var(--dim); font-size: 0.55em; margin: 0 5px; }
.val .nm { font-size: 0.5em; }
.tile .sub { color: #c9d3ec; font-size: 11px; }
.src { color: var(--dim); font-size: 10.5px; margin: 6px 0 0; overflow-wrap: anywhere; }
.src code, code { color: var(--warm); background: rgba(255,178,127,0.06); border: 1px solid rgba(255,178,127,0.14); border-radius: 4px; padding: 0 4px; overflow-wrap: anywhere; }
.pulse { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--live); margin-right: 8px; vertical-align: 3px; animation: beat 2.4s ease-out infinite; }
@keyframes beat { 0% { box-shadow: 0 0 0 0 rgba(127,255,176,0.6); } 70% { box-shadow: 0 0 0 11px rgba(127,255,176,0); } 100% { box-shadow: 0 0 0 0 rgba(127,255,176,0); } }
@media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }
.card { background: var(--glass); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; margin: 18px 0; backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px); box-shadow: 0 0 26px rgba(127,176,255,0.05); }
.lede { color: #c9d3ec; font-size: 12.5px; line-height: 1.7; margin: 4px 0 0; max-width: 82ch; }
.line { margin: 8px 0 0; }
.nm { color: var(--dim); font-style: italic; }
.none { margin: 8px 0 0; color: #c9d3ec; }
.lane { display: grid; grid-template-columns: minmax(7em, 10em) minmax(0, 1fr) auto; gap: 10px; align-items: center; margin: 7px 0; }
.lane .ln { overflow-wrap: anywhere; }
.lane .n { white-space: nowrap; text-align: right; }
.bar { position: relative; height: 10px; background: rgba(150,180,255,0.10); border-radius: 5px; overflow: hidden; }
.bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 5px; background: linear-gradient(90deg, rgba(127,176,255,0.45), var(--accent)); box-shadow: 0 0 10px rgba(127,176,255,0.45); }
.bar.parent i { background: linear-gradient(90deg, rgba(255,178,127,0.45), var(--warm)); box-shadow: 0 0 10px rgba(255,178,127,0.4); }
.gen { border-top: 1px solid var(--line); padding: 12px 0 10px; }
.gen:first-of-type { border-top: 0; }
.ghead { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; }
.gnum { font-size: 19px; color: #fff; }
.note { border-left: 2px solid rgba(255,178,127,0.55); padding: 4px 0 4px 12px; margin: 8px 0 0; color: #ead7c8; overflow-wrap: anywhere; }
.octo { display: block; width: 100%; max-width: 330px; margin: 8px auto 12px; }
.octo path { fill: none; stroke: rgba(150,180,255,0.16); stroke-width: 5; stroke-linecap: round; }
.octo .on path { stroke: rgba(127,176,255,0.55); }
.octo circle { fill: none; stroke: var(--dim); stroke-width: 1.5; }
.octo .on circle { fill: var(--accent); stroke: none; filter: drop-shadow(0 0 6px rgba(127,176,255,0.85)); }
.octo .body { fill: rgba(10,14,26,0.92); stroke: rgba(127,176,255,0.5); stroke-width: 1.5; }
.octo text { fill: #fff; text-anchor: middle; }
.octo .c { font: italic 28px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; }
.octo .l { font: 9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: var(--dim); letter-spacing: 0.14em; }
.arms { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin: 6px 0; }
.arm { border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; background: rgba(10,14,26,0.45); min-width: 0; }
.arm.on { border-color: rgba(127,176,255,0.42); box-shadow: inset 0 0 18px rgba(127,176,255,0.07); }
.arm .cls { font-size: 13px; color: #fff; overflow-wrap: anywhere; }
.arm .score { font-size: 30px; line-height: 1.1; color: var(--accent); text-shadow: 0 0 14px rgba(127,176,255,0.4); }
.arm .score.nm { font-size: 15px; color: var(--dim); text-shadow: none; margin: 8px 0 4px; }
.arm .k { color: var(--dim); font-size: 10.5px; overflow-wrap: anywhere; }
.arm .id { color: #c9d3ec; font-size: 11px; overflow-wrap: anywhere; margin-top: 4px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 0; }
.chip { border: 1px solid var(--line); border-radius: 999px; padding: 2px 10px; font-size: 11px; white-space: nowrap; color: #c9d3ec; }
.chip b { color: #fff; font-weight: 400; margin-left: 5px; }
.prompts { list-style: none; padding: 0; margin: 8px 0 0; }
.prompts li { border-left: 2px solid rgba(195,177,255,0.5); padding: 3px 0 3px 12px; margin: 10px 0; overflow-wrap: anywhere; }
.prompts .q { color: #fff; font-size: 13px; }
.big { font-size: clamp(26px, 7vw, 34px); color: #fff; }
.scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { border-collapse: collapse; width: 100%; margin: 6px 0; }
th { color: var(--dim); font-weight: 400; text-align: left; border-bottom: 1px solid var(--line); padding: 5px 12px 5px 0; white-space: nowrap; }
td { padding: 5px 12px 5px 0; vertical-align: top; border-bottom: 1px solid rgba(150,180,255,0.05); }
th.n, td.n { text-align: right; white-space: nowrap; }
td.why { min-width: 22ch; color: #c9d3ec; }
ul.apps { margin: 8px 0 0; padding-left: 18px; }
ul.apps li { margin: 6px 0; overflow-wrap: anywhere; }
footer { margin-top: 36px; color: var(--dim); border-top: 1px solid var(--line); padding-top: 12px; }
footer p { margin: 6px 0; }
ul.files { list-style: none; padding: 0; margin: 8px 0; }
ul.files li { margin: 5px 0; overflow-wrap: anywhere; }
ul.files code { white-space: nowrap; }
.gap { border-left: 2px solid rgba(255,178,127,0.7); padding: 6px 0 6px 12px; margin: 12px 0 0; color: #ead7c8; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.spark { display: block; width: 100%; height: 56px; margin: 6px 0 2px; background: rgba(150,180,255,0.05); border-radius: 6px; }
.spark polyline { fill: none; stroke: var(--accent); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.spark.held polyline { stroke: var(--live); }
details { margin: 8px 0 0; }
summary { cursor: pointer; color: var(--accent); }
@media (min-width: 760px) { .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 640px) { .card { padding: 14px; border-radius: 12px; } body { padding: 0 16px 60px; } }`;

const b = (v) => '<b>' + esc(v) + '</b>';
const files = (...fs_) => '<p class="src">from ' + fs_.map((f) => '<code>' + esc(f) + '</code>').join(', ') + '</p>';
const noneYet = (why) => '<p class="none"><span class="nm">none yet</span>: ' + esc(why) + '</p>';
const WHY_STATE = Object.freeze({ missing: 'is not on disk', empty: 'is empty', unreadable: 'could not be read', 'not JSON': 'does not parse as JSON',
  'wrong shape': 'does not hold the shape the organism writes', 'no JSON line': 'holds no JSON line' });
/** Why a source shows nothing: its state, or (read) that it holds nothing yet. */
const whyEmpty = (s, what) => s.file + ' ' + (s.state === 'read' ? 'holds ' + what : WHY_STATE[s.state] || 'holds nothing to show');
const rateText = (r) => {
  if (!r) return '<span class="nm">none yet</span>';
  // the counts are printed beside a missing rate too (a 0-candidate baseline reads "none yet (0 of 0, ...)"): they are the file's
  const of = r.survivors !== null && r.candidates !== null ? ' (' + esc(r.survivors) + ' of ' + esc(r.candidates) + (r.generation !== null ? ', generation ' + esc(r.generation) : '') + ')' : '';
  return (r.rate === null ? '<span class="nm">none yet</span>' : esc(r.rate)) + of;
};
const pillFor = (v) => (v ? '<span class="pill sm ' + esc(v.replace(/[^a-z]/gi, '').toLowerCase()) + '">' + esc(v) + '</span>' : '<span class="nm">no verdict</span>');
const hoursText = (h) => (h === null ? 'its age is not computable (no build stamp or no ISO stamp)' : esc(Math.abs(h)) + pl(Math.abs(h), ' hour ', ' hours ') + (h < 0 ? 'after' : 'before') + ' this page was built');

function laneBars(lanes) {
  return lanes.map((l) => {
    const n = l.candidates !== null && l.survivors !== null && l.candidates > 0;
    const width = n ? Math.min(100, (l.survivors / l.candidates) * 100).toFixed(2) : '0';
    return '<div class="lane"><span class="ln">' + esc(l.lane) + (l.parent ? ' <span class="pill sm parent">parent</span>' : '') + '</span>'
      + '<span class="bar' + (l.parent ? ' parent' : '') + '" role="img" aria-label="' + esc(l.lane + ': ' + (n ? l.survivors + ' of ' + l.candidates + ' survived' : 'none yet')) + '"><i style="width:' + width + '%"></i></span>'
      + '<span class="n">' + (n ? esc(l.survivors) + ' <span class="dim">of</span> ' + esc(l.candidates) : '<span class="nm">none yet</span>') + '</span></div>';
  }).join('');
}

function tile(label, value, sub, file, wide) {
  return '<div class="tile' + (wide ? ' wide' : '') + '"><div class="lbl">' + label + '</div>' + value + '<div class="sub">' + sub + '</div><div class="src">' + esc(file) + '</div></div>';
}

function hero(m) {
  const v = m.vitals, g = m.sources.generations, last = m.last;
  const none = '<div class="val"><span class="nm">none yet</span></div>';
  let verdict;
  if (!last) verdict = '<p class="verdict"><span class="nm">none yet</span>: ' + esc(whyEmpty(g, 'no generation yet')) + '.</p>';
  else {
    verdict = '<p class="verdict">Generation ' + b(last.generation) + ' ran ' + (last.hoursBefore === null ? 'at ' + esc(last.at || 'an unrecorded time') : b(Math.abs(last.hoursBefore) + pl(Math.abs(last.hoursBefore), ' hour', ' hours')) + (last.hoursBefore < 0 ? ' after' : ' before') + ' this page was built')
      + ': ' + (last.candidates ? b(last.survivors) + ' of ' + b(last.candidates) + pl(last.candidates, ' candidate cell', ' candidate cells') + ' survived the locked judge' : 'it recorded no candidate')
      + ', and ' + (m.cells.length ? b(m.cells.length) + pl(m.cells.length, ' cell is alive.', ' cells are alive.') : 'no cell is alive yet.')
      + (last.byHand ? ' Its record was corrected by hand; the note is under Generations.' : '') + '</p>';
  }
  const tiles = [
    tile('generations run', v.generations.value ? '<div class="val">' + esc(v.generations.value) + '</div>' : none,
      last ? 'newest: generation ' + esc(last.generation) : esc(whyEmpty(g, 'no generation yet')), v.generations.file),
    tile('cells alive', v.cells.value ? '<div class="val">' + esc(v.cells.value) + '</div>' : none,
      v.cells.value ? 'in ' + esc(v.cells.classes) + pl(v.cells.classes, ' class', ' classes') + ', one arm each' : esc(whyEmpty(m.sources.index, 'no cell yet')), v.cells.file),
    tile('last generation', last && last.candidates ? '<div class="val">' + esc(last.survivors) + '<span class="of">/</span>' + esc(last.candidates) + '</div>' : none,
      last ? 'survivors over candidates, generation ' + esc(last.generation) + (last.byHand ? ' <span class="pill sm hand">corrected by hand</span>' : '') : esc(whyEmpty(g, 'no generation yet')), v.lastGeneration.file),
    tile('dreams set for itself', v.dreams.value ? '<div class="val">' + esc(v.dreams.value) + '</div>' : none,
      v.dreams.value ? 'tasks it wrote for itself, in ' + esc(v.dreams.classes) + pl(v.dreams.classes, ' class', ' classes') : esc(whyEmpty(m.sources.dreams, 'no dream yet')), v.dreams.file),
    tile('cortex', '<div class="val str">' + esc(v.cortex.pointer) + '</div>',
      'the model that runs each generation' + (v.cortex.from === 'default' ? ', by default: ' + esc(whyEmpty(m.sources.cortex, 'no pointer')) : m.cortex.since !== null ? ', since ' + (typeof m.cortex.since === 'number' ? 'generation ' : '') + esc(m.cortex.since) : ''), v.cortex.file, true),
    tile('last heartbeat', v.heartbeat.at ? '<div class="val str"><span class="pulse" aria-hidden="true"></span>' + esc(v.heartbeat.at) + '</div>' : none,
      v.heartbeat.at ? hoursText(v.heartbeat.hoursBefore) : esc(whyEmpty(g, 'no generation yet')), v.heartbeat.file, true),
  ];
  return '<section id="now"><h1>Alive</h1>'
    + '<p class="what">A brain that grows its own cells in the cloud, every hour, with its owner\'s PC off: its arms write candidate cells, a locked judge grades each one on held-out questions, and only the survivors join it.</p>'
    + verdict + '<div class="tiles">' + tiles.join('') + '</div></section>';
}

function lastHour(m) {
  const head = '<section class="card" id="last-hour"><h2>The last hour</h2>';
  const l = m.last;
  if (!l) return head + noneYet(whyEmpty(m.sources.generations, 'no generation yet')) + files(FILES.generations) + '</section>';
  const out = [head, '<p class="lede">What generation ' + b(l.generation) + ' did: its heartbeat at ' + esc(l.at || 'an unrecorded time') + ', ' + hoursText(l.hoursBefore) + '.</p>'];
  out.push('<h3>The tournament</h3>' + (l.lanes.length ? laneBars(l.lanes) : noneYet('generation ' + l.generation + ' recorded no lane'))
    + '<p class="line">' + (l.candidates ? b(l.survivors) + ' of ' + b(l.candidates) + ' survived' : '<span class="nm">none yet</span>: no candidate recorded')
    + (l.parent ? '; the parent of the next generation is the ' + b(l.parent) + ' lane, the one with more survivors' : '; no parent lane recorded')
    + (l.misses !== null ? '; it worked on ' + b(l.misses) + pl(l.misses, ' miss', ' misses') : '') + '.</p>' + files(FILES.generations));
  out.push('<h3>Cells it promoted</h3>' + (l.promoted.length
    ? '<div class="scroll"><table><tr><th>cell</th><th>class</th><th>lane</th><th class="n">held-out score</th><th class="n">rows</th></tr>'
      + l.promoted.map((c) => '<tr><td>' + esc(c.id) + '</td><td>' + esc(c.class) + '</td><td>' + esc(c.lane || '') + '</td><td class="n">' + (c.score === null ? '<span class="nm">none yet</span>' : esc(c.score)) + (c.ok !== null ? ' (' + esc(c.ok) + ' ok)' : '') + '</td><td class="n">' + (c.n === null ? '' : esc(c.n)) + '</td></tr>').join('') + '</table></div>'
    : noneYet('no cell in ' + FILES.index + ' carries generation ' + l.generation)) + files(FILES.index));
  out.push('<h3>Self-modification</h3>' + (l.self.length
    ? l.self.map((h) => '<p class="line">' + pillFor(h.verdict) + ' ' + esc(h.target || 'no target') + ': judged rate ' + rateText(h.judged) + ' against the baseline ' + rateText(h.baseline) + '.</p>').join('')
    : noneYet('no trial in ' + FILES.self + ' was judged by generation ' + l.generation + (m.self.pending ? '; one is pending (' + (m.self.pending.target || 'no target') + ')' : '')))
    + files(FILES.self));
  if (l.cortex.length) out.push('<h3>Cortex</h3>' + l.cortex.map((h) => '<p class="line">' + pillFor(h.verdict) + ' ' + esc(h.challenger || 'no challenger') + ' against ' + esc(h.incumbent || 'the pointer') + (h.pairs !== null ? ' over ' + b(h.pairs) + pl(h.pairs, ' pair', ' pairs') : '') + '.</p>').join('') + files(FILES.cortex));
  out.push('<h3>Dreams it set itself</h3>' + (l.dreams.count
    ? '<p class="line">' + b(l.dreams.count) + pl(l.dreams.count, ' task', ' tasks') + ' it set itself after generation ' + b(l.generation) + '.</p><div class="chips">' + l.dreams.byClass.map((x) => '<span class="chip">' + esc(x.class) + '<b>' + esc(x.n) + '</b></span>').join('') + '</div>'
    : noneYet('no line of ' + FILES.dreams + ' carries generation ' + l.generation)) + files(FILES.dreams));
  return out.join('') + '</section>';
}

function generationsSection(m) {
  const head = '<section class="card" id="generations"><h2>Generations</h2><p class="lede">Every tournament, newest first: per lane, the survivors over the candidates the locked judge graded. The lane with more survivors parents the next generation. A record corrected by hand says so, with its note.</p>';
  if (!m.generations.length) return head + noneYet(whyEmpty(m.sources.generations, 'no generation yet')) + files(FILES.generations) + '</section>';
  const shown = m.generations.slice(-GEN_ROWS).reverse();
  const rows = shown.map((g) => '<div class="gen"><div class="ghead"><span class="gnum">Generation ' + esc(g.generation) + '</span><span class="dim">' + esc(g.at || 'no stamp') + '</span>'
    + (g.byHand ? '<span class="pill sm hand">corrected by hand</span>' : g.note ? '<span class="pill sm">note</span>' : '') + '</div>'
    + (g.lanes.length ? laneBars(g.lanes) : noneYet('no lane recorded'))
    + '<div class="dim">' + (g.candidates ? esc(g.survivors) + ' of ' + esc(g.candidates) + ' survived' : 'none yet: no candidate recorded') + (g.parent ? ', parent ' + esc(g.parent) : '') + (g.misses !== null ? ', ' + esc(g.misses) + pl(g.misses, ' miss', ' misses') : '') + '</div>'
    + (g.note ? '<p class="note">' + esc(g.note) + '</p>' : '') + '</div>');
  const older = m.generations.length - shown.length;
  return head + rows.join('') + (older > 0 ? '<p class="src">' + esc(older) + pl(older, ' older generation is', ' older generations are') + ' in <a href="/alive/data.json">data.json</a>.</p>' : '') + files(FILES.generations) + '</section>';
}

function octopus(arms, alive) {
  if (!arms.length) return '';
  const C = 165, parts = arms.map((a, i) => {
    const t = -Math.PI / 2 + (2 * Math.PI * i) / arms.length;
    const p = (r, dt = 0) => (C + r * Math.cos(t + dt)).toFixed(1) + ' ' + (C + r * Math.sin(t + dt)).toFixed(1);
    const on = a.cells.length > 0, tip = p(136).split(' ');
    return '<g class="' + (on ? 'on' : 'off') + '"><title>' + esc(a.class + (on ? ': ' + a.cells.join(', ') : ': no cell yet')) + '</title><path d="M' + p(40) + ' Q' + p(96, 0.34) + ' ' + p(136) + '"/>'
      + '<circle cx="' + tip[0] + '" cy="' + tip[1] + '" r="' + (on ? 8 : 6) + '"/></g>';
  });
  return '<svg class="octo" viewBox="0 0 330 330" role="img" aria-label="' + esc(alive + pl(alive, ' cell', ' cells') + ' alive on ' + arms.length + pl(arms.length, ' arm', ' arms')) + '">' + parts.join('')
    + '<circle class="body" cx="165" cy="165" r="40"/><text class="c" x="165" y="170">' + esc(alive) + '</text><text class="l" x="165" y="186">CELLS</text></svg>';
}

function cellsSection(m) {
  const head = '<section class="card" id="cells"><h2>Cells, one arm per domain</h2><p class="lede">The octopus: every domain of the curriculum is an arm, and an arm is lit when a living cell holds its class. One cell per class, the champion: a newer survivor replaces it only with a higher held-out score.</p>';
  if (!m.arms.length) return head + noneYet(whyEmpty(m.sources.index, 'no cell yet') + '; ' + whyEmpty(m.sources.curriculum, 'no curriculum row yet')) + files(FILES.index, FILES.curriculum) + '</section>';
  const byId = new Map(m.cells.map((c) => [c.id, c]));
  const cards = m.arms.map((a) => {
    if (!a.cells.length) return '<div class="arm"><div class="cls">' + esc(a.class) + '</div><div class="score nm">no cell yet</div><div class="k">' + (a.curriculum ? esc(a.curriculum) + pl(a.curriculum, ' curriculum row waits', ' curriculum rows wait') + ' for it' : 'no curriculum row') + '</div></div>';
    return a.cells.map((id) => {
      const c = byId.get(id);
      return '<div class="arm on"><div class="cls">' + esc(a.class) + (a.domain ? '' : ' <span class="dim">(not a curriculum domain)</span>') + '</div>'
        + '<div class="score">' + (c.score === null ? '<span class="nm">none yet</span>' : esc(c.score)) + '</div>'
        + '<div class="k">held-out score' + (c.ok !== null && c.n !== null ? ', ' + esc(c.ok) + ' of ' + esc(c.n) + pl(c.n, ' row', ' rows') + ' ok' : c.n !== null ? ' on ' + esc(c.n) + pl(c.n, ' row', ' rows') : '') + '</div>'
        + '<div class="id">' + esc(c.id) + '</div><div class="k">generation ' + (c.generation === null ? 'unrecorded' : esc(c.generation)) + ', lane ' + esc(c.lane || 'unrecorded') + (c.promotedAt ? ', promoted ' + esc(c.promotedAt) : '') + '</div>'
        + (a.curriculum ? '<div class="k">' + esc(a.curriculum) + pl(a.curriculum, ' curriculum row', ' curriculum rows') + ' in its class</div>' : '') + '</div>';
    }).join('');
  });
  return head + octopus(m.arms, m.cells.length) + '<div class="arms">' + cards.join('') + '</div>'
    + (m.cells.length ? '' : noneYet(whyEmpty(m.sources.index, 'no cell yet'))) + files(FILES.index, FILES.curriculum) + '</section>';
}

function selfSection(m) {
  const s = m.self;
  const head = '<section class="card" id="self"><h2>Self-modification</h2><p class="lede">One edit to its own procedure per generation, kept only when the next generation\'s survival rate (survivors over candidates, every lane) rises above the baseline; else the file is written back.</p>';
  const out = [head];
  if (s.pending) {
    const p = s.pending;
    out.push('<p class="line"><span class="pill sm pending">pending</span> ' + esc(p.target || 'no target') + ', applied ' + esc(p.appliedAt || 'at an unrecorded time') + (p.generation !== null ? ' after generation ' + esc(p.generation) : '')
      + (p.next !== null ? '; generation ' + esc(p.next) + ' judges it' : '') + '; baseline ' + rateText(p.baseline) + '.</p>' + (p.why ? '<p class="src">why: ' + esc(p.why) + '</p>' : ''));
  }
  if (s.history.length) {
    out.push('<p class="line">' + b(s.count) + pl(s.count, ' trial', ' trials') + ' in the history, newest first.</p><div class="scroll"><table><tr><th>after</th><th>target</th><th>baseline rate</th><th>judged rate</th><th>verdict</th><th>reason</th></tr>'
      + s.history.map((h) => '<tr><td>' + (h.generation === null ? '' : 'generation ' + esc(h.generation)) + '</td><td>' + esc(h.target || '') + '</td><td>' + rateText(h.baseline) + '</td><td>' + rateText(h.judged) + '</td><td>' + pillFor(h.verdict) + '</td><td class="why">' + esc(h.reason || '') + '</td></tr>').join('')
      + '</table></div>' + (s.count > s.history.length ? '<p class="src">' + esc(s.count - s.history.length) + pl(s.count - s.history.length, ' older trial is', ' older trials are') + ' in <a href="/alive/data.json">data.json</a>.</p>' : ''));
  }
  if (!s.pending && !s.history.length) out.push(noneYet(whyEmpty(m.sources.self, 'no trial yet')));
  else if (!s.history.length) out.push(noneYet('no trial has been judged yet'));
  return out.join('') + files(FILES.self) + '</section>';
}

function cortexSection(m) {
  const c = m.cortex;
  const out = ['<section class="card" id="cortex"><h2>Cortex</h2><p class="lede">The model whose arms write the cells. The pointer moves to a challenger only when the challenger scores higher on the held-out tasks over the paired arms of one tournament.</p>'];
  out.push('<p class="line"><span class="big">' + esc(c.pointer) + '</span></p><p class="line">' + (c.from === 'default' ? 'the default pointer: ' + esc(whyEmpty(m.sources.cortex, 'no pointer'))
    : 'the pointer' + (c.since !== null ? ', since ' + (typeof c.since === 'number' ? 'generation ' : '') + esc(c.since) : '')) + '.</p>');
  out.push(c.challenger ? '<p class="line"><span class="pill sm pending">challenger</span> ' + esc(c.challenger.model) + (c.challenger.at ? ', registered ' + esc(c.challenger.at) : '') + (c.challenger.by ? ', by ' + esc(c.challenger.by) : '') + '; the next tournament judges it.</p>'
    : noneYet('no challenger is pending in ' + FILES.cortex));
  if (c.history.length) {
    const sc = (a, b2) => (a === null && b2 === null ? '' : (a === null ? '?' : esc(a)) + ' vs ' + (b2 === null ? '?' : esc(b2)));
    out.push('<p class="line">' + b(c.count) + pl(c.count, ' trial', ' trials') + ' in the history, newest first.</p><div class="scroll"><table><tr><th>generation</th><th>pointer</th><th>challenger</th><th class="n">pairs</th><th class="n">held-out score</th><th class="n">survivors</th><th>verdict</th></tr>'
      + c.history.map((h) => '<tr><td>' + (h.generation === null ? '' : esc(h.generation)) + '</td><td>' + esc(h.incumbent || '') + '</td><td>' + esc(h.challenger || '') + '</td><td class="n">' + (h.pairs === null ? '' : esc(h.pairs)) + '</td><td class="n">'
        + sc(h.incumbentScore, h.challengerScore) + '</td><td class="n">' + sc(h.incumbentSurvivors, h.challengerSurvivors) + '</td><td>' + pillFor(h.verdict) + (h.reason ? ' <span class="dim">' + esc(h.reason) + '</span>' : '') + '</td></tr>').join('')
      + '</table></div>' + (c.count > c.history.length ? '<p class="src">' + esc(c.count - c.history.length) + pl(c.count - c.history.length, ' older trial is', ' older trials are') + ' in <a href="/alive/data.json">data.json</a>.</p>' : ''));
  } else out.push(noneYet('no cortex trial in ' + FILES.cortex + ' yet'));
  return out.join('') + files(FILES.cortex) + '</section>';
}

const chips = (list, key) => '<div class="chips">' + list.map((x) => '<span class="chip">' + esc(x[key]) + '<b>' + esc(x.n) + '</b></span>').join('') + '</div>';

function dreamsSection(m) {
  const d = m.dreams, c = m.curriculum;
  const out = ['<section class="card" id="dreams"><h2>Dreams and curriculum</h2><p class="lede">After each generation a proposer arm writes tasks just past what the brain answers, a solver arm answers them, and the ones the brain still misses become its next misses. The curriculum is the seed set a human session wrote, one class per domain.</p>'];
  out.push('<h3>Dreams</h3>');
  if (d.count) {
    out.push('<p class="line"><span class="big">' + esc(d.count) + '</span> <span class="dim">tasks set for itself</span></p>' + chips(d.byClass, 'class') + chips(d.byStatus, 'status')
      + '<ul class="prompts">' + d.newest.map((x) => '<li><div class="q">' + esc(x.prompt) + '</div><div class="dim">' + esc(x.class) + (x.generation !== null ? ', generation ' + esc(x.generation) : '') + (x.status ? ', ' + esc(x.status) : '') + '</div></li>').join('') + '</ul>');
  } else out.push(noneYet(whyEmpty(m.sources.dreams, 'no dream yet')));
  out.push(files(FILES.dreams) + '<h3>Curriculum</h3>');
  if (c.count) out.push('<p class="line"><span class="big">' + esc(c.count) + '</span> <span class="dim">curriculum rows</span></p>' + chips(c.byClass, 'class') + chips(c.byStatus, 'status'));
  else out.push(noneYet(whyEmpty(m.sources.curriculum, 'no curriculum row yet')));
  return out.join('') + files(FILES.curriculum) + '</section>';
}

function appsSection(m) {
  const out = ['<section class="card" id="apps"><h2>Apps it built</h2><p class="lede">A request for an app ("make me a todo app") is grown by the builder arm, judged by its own tests in the sandbox, and served on this site.</p>'];
  if (m.apps.length) {
    out.push('<ul class="apps">' + m.apps.map((a) => '<li>' + (a.path ? '<a href="' + esc(a.path) + '">' + esc(a.name) + '</a>' : esc(a.name) + ' <span class="nm">(no servable path)</span>')
      + (a.prompt ? ' <span class="dim">built from "' + esc(a.prompt) + '"</span>' : '') + (a.generation !== null ? ' <span class="dim">generation ' + esc(a.generation) + '</span>' : '') + '</li>').join('') + '</ul>');
  } else out.push(noneYet(whyEmpty(m.sources.apps, 'no app yet')));
  return out.join('') + files(FILES.apps) + '</section>';
}

// ------------------------------------------------------------------ the NEO part on the page
const NY = '<span class="nm">not yet</span>', NR = '<span class="nm">not recorded</span>';
const notYet = (why) => '<p class="none">' + NY + ': ' + esc(why) + '</p>';
const bn = (v) => (v === null || v === undefined ? NR : b(v));
const nr = (v) => (v === null || v === undefined ? NR : esc(v));
const valOf = (v) => '<div class="val">' + (v === null || v === undefined ? NY : esc(v)) + '</div>';
const eraOf = (e) => (e === null ? 'an unnumbered row' : 'era ' + esc(e));
const VELOCITY_LABEL = Object.freeze({ cellsPerSecond: 'cells per second', tasksPerMinute: 'tasks per minute', masteredPerEra: 'mastered per era', eraMs: 'era ms', workers: 'workers', era: 'era' });
const TRIAL_VERDICTS = ['kept', 'reverted', 'skipped', 'blocked', 'retired'];

/** One series as an inline SVG polyline (a null breaks the line), scaled to its own lowest and highest value. */
function sparkSvg(rows, key, cls) {
  const W = 300, H = 56, P = 4, n = rows.length;
  const held = rows.map((r) => r[key]).filter((v) => v !== null);
  const lo = Math.min(...held), hi = Math.max(...held);
  const x = (i) => (n === 1 ? W / 2 : P + ((W - 2 * P) * i) / (n - 1));
  const y = (v) => (hi === lo ? H / 2 : H - P - ((H - 2 * P) * (v - lo)) / (hi - lo));
  const segs = [];
  let cur = [];
  rows.forEach((r, i) => { if (r[key] === null) { if (cur.length) segs.push(cur); cur = []; } else cur.push([x(i), y(r[key])]); });
  if (cur.length) segs.push(cur);
  const lines = segs.map((s) => '<polyline points="' + (s.length === 1 ? [[s[0][0] - 2, s[0][1]], [s[0][0] + 2, s[0][1]]] : s).map(([a, c]) => a.toFixed(1) + ',' + c.toFixed(1)).join(' ') + '"/>');
  return '<svg class="spark ' + cls + '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + lines.join('') + '</svg>';
}
function sparkBlock(sr, key, cls, label, what) {
  const st = sr[key];
  if (!st) return '<h3>' + label + '</h3>' + notYet('no row among the newest ' + sr.count + ' of ' + NEO_FILES.measure + ' holds ' + what);
  return '<h3>' + label + '</h3>' + sparkSvg(sr.rows, key, cls) + '<p class="line">' + b(st.first) + ' at ' + eraOf(st.firstEra) + ' to ' + b(st.last) + ' at ' + eraOf(st.lastEra)
    + '; lowest ' + esc(st.min) + ', highest ' + esc(st.max) + '.</p>';
}
const verdictChips = (list) => (list.length ? '<span class="chips">' + list.map((x) => '<span class="chip">' + esc(x.verdict) + '<b>' + esc(x.n) + '</b></span>').join('') + '</span>' : NY);

function neoSection(m) {
  const n = m.neo, s = n.sources, now = n.now, last = n.eras.last;
  const out = ['<section class="card" id="neo"><h2>The organism by itself</h2><p class="lede">No model runs in this loop. Each era the organism absorbs open data, opens tasks from it, grows cells for every task by composing its own primitives, tries changes to its own engine, measures itself and commits them, on whichever body is beating. Every number below is read from the committed file named under it when this page was built; a file not written yet reads "not yet".</p>'];
  out.push('<p class="gap">' + (n.gap ? esc(n.gap) : NY + ': ' + esc(now ? 'the newest row of ' + NEO_FILES.measure + ' holds no task, mastered or held-out count'
    : whyEmpty(s.measure, 'no measure row yet') + ', so nothing is measured')) + '</p>');
  const mv = s.measure, whyM = esc(whyEmpty(mv, 'no measure row yet'));
  const tiles = [
    tile('iterations', valOf(n.iterations), n.iterations !== null ? 'candidate cells generated, every era together' : esc(whyEmpty(s.ledger, 'no generated count')), NEO_FILES.ledger + ' generated'),
    tile('eras run', valOf(n.eras.count), last ? 'the last: era ' + esc(last.era) + (last.at ? ', ' + esc(last.at) : '') : esc(whyEmpty(s.era, 'no era yet')), NEO_FILES.era + ' era'),
    tile('tasks', valOf(now ? now.tasks : null), now ? 'opened, measured at ' + eraOf(now.era) : whyM, NEO_FILES.measure + ' neo.tasks'),
    tile('colonies', valOf(now ? now.colonies : null), now ? 'tasks with a grown colony' : whyM, NEO_FILES.measure + ' neo.colonies'),
    tile('cells', valOf(now ? now.cells : null), now ? 'kept cells, every colony together' : whyM, NEO_FILES.measure + ' neo.cells'),
    tile('mastered', now && now.mastered !== null ? '<div class="val">' + esc(now.mastered) + (now.tasks !== null ? '<span class="of">/</span>' + esc(now.tasks) : '') + '</div>' : valOf(null),
      now ? pl(now.tasks, 'task', 'tasks') + ' whose colony answers every held-out row' : whyM, NEO_FILES.measure + ' neo.mastered'),
    tile('held-out fraction', valOf(now ? now.score : null), now && now.ok !== null && now.n !== null ? esc(now.ok) + ' of ' + esc(now.n) + pl(now.n, ' held-out row', ' held-out rows') + ' right, every colony together' : now ? 'no held-out count in the newest row' : whyM,
      NEO_FILES.measure + ' neo.heldout', true),
  ];
  out.push('<div class="tiles">' + tiles.join('') + '</div>');
  // the last era and the bodies that beat
  out.push('<h3>The last era</h3>' + (last
    ? '<p class="line">Era ' + b(last.era) + ' ran ' + (last.at ? 'at ' + esc(last.at) + ', ' + hoursText(last.hoursBefore) : 'at an unrecorded time') + (last.body === 'unrecorded' ? ', on a body its row does not name' : ', on the body ' + b(last.body))
      + (last.ms !== null ? ', for ' + b(last.ms) + ' ms' : '') + (last.workers !== null ? ' with ' + b(last.workers) + pl(last.workers, ' worker', ' workers') : '')
      + ': it grew ' + (last.grown !== null ? b(last.grown) + pl(last.grown, ' task', ' tasks') + ' and promoted ' + b(last.promoted) + pl(last.promoted, ' colony', ' colonies') : 'no recorded task')
      + (last.cells !== null ? '; the organism then held ' + b(last.cells) + pl(last.cells, ' cell', ' cells') : '') + (last.mastered !== null ? ' and ' + b(last.mastered) + pl(last.mastered, ' mastered task', ' mastered tasks') : '') + '.</p>'
    : notYet(whyEmpty(s.era, 'no era yet'))));
  const bd = n.bodies;
  out.push('<h3>Bodies that beat in the day before this build</h3>' + (bd
    ? (bd.eras ? '<p class="line">' + b(bd.eras) + pl(bd.eras, ' era', ' eras') + ' since ' + esc(bd.since) + ', by body:</p><div class="chips">' + bd.by.map((x) => '<span class="chip">' + esc(x.body) + '<b>' + esc(x.eras) + '</b></span>').join('') + '</div>'
        + '<p class="src">the newest beat of each: ' + bd.by.map((x) => esc(x.body) + ' at ' + esc(x.last)).join(', ') + '</p>'
      : notYet('no era of ' + NEO_FILES.era + ' ran since ' + bd.since))
      + (bd.ahead ? '<p class="src">' + esc(bd.ahead) + pl(bd.ahead, ' era row is', ' era rows are') + ' stamped after this build: the clock went backwards</p>' : '')
    : notYet(last ? 'no ISO build stamp given, so the window is not computable' : whyEmpty(s.era, 'no era yet'))) + files(NEO_FILES.era));
  // the last promote (feature-detected: an era row's pipeline and promoted fields)
  const pp = n.pipeline;
  out.push('<h3>The last promote</h3>' + (pp
    ? '<p class="line">The newest pipeline state, ' + eraOf(pp.stateEra) + ': ' + (pp.state ? b(pp.state) : NR) + '. '
      + (pp.era !== null
        ? 'The last promote, ' + eraOf(pp.era) + (pp.at ? ' at ' + esc(pp.at) : '') + ': ' + (pp.promoted === true ? b('promoted') : pp.promoted === false ? b('not promoted') : NR)
          + (pp.why ? ' (' + esc(pp.why) + ')' : '') + '; ' + bn(pp.raised) + pl(pp.raised, ' task', ' tasks') + ' raised, ' + bn(pp.fell) + ' fell, ' + bn(pp.gained) + ' gained'
          + (pp.before !== null || pp.after !== null ? '; held-out rows right ' + bn(pp.before) + ' before, ' + bn(pp.after) + ' after' : '') + '.'
        : 'No era has a promote on record yet.') + '</p>'
    : notYet(last ? 'no row of ' + NEO_FILES.era + ' carries a pipeline or a promote yet' : whyEmpty(s.era, 'no era yet'))) + files(NEO_FILES.era));
  // the series, velocity and plateau
  const sr = n.series;
  if (sr) {
    out.push('<h3>Era by era</h3><p class="lede">The newest ' + b(sr.count) + pl(sr.count, ' row', ' rows') + ' of <code>' + esc(NEO_FILES.measure) + '</code>, oldest on the left; the newest is ' + eraOf(now.era) + (now.at ? ' at ' + esc(now.at) : '') + '.'
      + (n.same !== null ? ' The newest ' + b(n.same) + ' rows hold the same counts.' : '') + '</p>');
    out.push(sparkBlock(sr, 'mastered', 'mast', 'Mastered tasks', 'a mastered count') + sparkBlock(sr, 'score', 'held', 'Held-out fraction', 'a held-out score'));
    out.push('<details><summary>the ' + esc(sr.count) + pl(sr.count, ' row', ' rows') + ', newest first</summary><div class="scroll"><table><tr><th class="n">era</th><th>at</th><th class="n">mastered</th><th class="n">held-out right</th><th class="n">of rows</th><th class="n">fraction</th></tr>'
      + sr.rows.slice().reverse().map((r) => '<tr><td class="n">' + nr(r.era) + '</td><td>' + (r.at ? esc(r.at) : NR) + '</td><td class="n">' + nr(r.mastered) + '</td><td class="n">' + nr(r.ok) + '</td><td class="n">' + nr(r.n) + '</td><td class="n">' + nr(r.score) + '</td></tr>').join('')
      + '</table></div></details>');
  } else out.push('<h3>Era by era</h3>' + notYet(whyEmpty(mv, 'no measure row yet')));
  out.push('<h3>Velocity and plateau</h3>');
  if (!now) out.push(notYet(whyEmpty(mv, 'no measure row yet')));
  else {
    out.push(now.velocity ? '<div class="chips">' + now.velocity.map((v) => '<span class="chip">' + esc(VELOCITY_LABEL[v.key] || v.key) + '<b>' + esc(v.value) + '</b></span>').join('') + '</div>'
      : notYet('the newest row of ' + NEO_FILES.measure + ' carries no velocity'));
    out.push(now.plateau !== null ? '<p class="line">plateau ' + b(now.plateau) + ': the eras since the held-out total last rose.</p>' : notYet('the newest row of ' + NEO_FILES.measure + ' carries no plateau'));
  }
  out.push(files(NEO_FILES.measure));
  // what it absorbed, the crawl queue
  const a = n.absorbed, f = n.frontier;
  out.push('<h3>What it absorbed</h3>' + (a
    ? '<p class="line">' + bn(a.sources) + pl(a.sources, ' source', ' sources') + ' over ' + bn(a.pulls) + pl(a.pulls, ' pull', ' pulls') + ': ' + bn(a.bytes) + pl(a.bytes, ' byte', ' bytes') + ', ' + bn(a.rows) + pl(a.rows, ' row', ' rows')
      + '; the cursor stands at ' + bn(a.cursor) + (a.blocked !== null ? '; ' + bn(a.blocked) + pl(a.blocked, ' blocked pull', ' blocked pulls') + ' on record' : '') + '.</p>'
    : notYet(whyEmpty(s.absorb, 'nothing absorbed yet'))) + files(NEO_FILES.absorb));
  out.push('<h3>The crawl queue</h3>' + (f
    ? '<p class="line">' + bn(f.queue) + pl(f.queue, ' link', ' links') + ' queued, ' + bn(f.seen) + ' seen, ' + bn(f.repos) + pl(f.repos, ' repository', ' repositories') + ', ' + bn(f.added) + pl(f.added, ' source', ' sources') + ' added.</p>'
    : notYet(whyEmpty(s.frontier, 'no queue yet'))) + files(NEO_FILES.frontier));
  // the self-modification record
  const sm = n.selfMod, t = sm.trials;
  out.push('<h3>Self-modification record</h3><p class="lede">Changes the organism tries on its own engine, a genome mutant or a macro mined from its own kept cells, each kept only when the engine\'s own printed score is better in two runs, else reverted.</p>');
  if (t) {
    out.push('<div class="chips">' + TRIAL_VERDICTS.map((k) => '<span class="chip">' + k + '<b>' + esc(t[k]) + '</b></span>').join('') + '</div><p class="line">' + b(t.rows) + pl(t.rows, ' trial row', ' trial rows') + '; the newest first:</p>'
      + '<div class="scroll"><table><tr><th class="n">era</th><th>kind</th><th>verdict</th><th>change</th><th>why</th></tr>'
      + t.newest.map((r) => '<tr><td class="n">' + nr(r.era) + '</td><td>' + (r.kind ? esc(r.kind) : NR) + '</td><td>' + pillFor(r.verdict) + '</td><td>' + (r.change ? esc(r.change) : '') + '</td><td class="why">' + (r.why ? esc(r.why) : '') + '</td></tr>').join('')
      + '</table></div>');
  } else out.push(notYet(whyEmpty(s.trials, 'no trial yet')));
  out.push(files(NEO_FILES.trials));
  out.push('<p class="line">The routine\'s trials, by verdict: ' + verdictChips(sm.self) + '</p>' + files(FILES.self)
    + '<p class="line">The cortex trials, by verdict: ' + verdictChips(sm.cortex) + '</p>' + files(FILES.cortex));
  // the compute ledger (feature-detected: neo/COMPUTE.json, read generically)
  const co = n.compute;
  const chip = (k, v) => '<span class="chip">' + esc(k) + (v === null ? ' ' + NR : '<b>' + esc(v) + '</b>') + '</span>';
  out.push('<h3>Compute</h3><p class="lede">The month\'s runner minutes as the organism ledgers them for itself before each beat: its budget, what it spent, and the plan it made.</p>' + (co
    ? (co.fields.length ? '<div class="chips">' + co.fields.map((x) => chip(x.key, x.value)).join('') + '</div>' : '')
      + (co.counts.length ? '<p class="line">On record: ' + co.counts.map((x) => esc(x.key) + ' ' + b(x.n)).join(', ') + '.</p>' : '')
      + (co.lastPlan ? '<p class="line">The newest plan: ' + co.lastPlan.map((x) => esc(x.key) + ' ' + (x.value === null ? NR : b(x.value))).join(', ') + '.</p>' : '')
      + (co.fields.length || co.counts.length ? '' : notYet(NEO_FILES.compute + ' holds no field the page reads'))
    : notYet(whyEmpty(s.compute, 'no compute ledger yet'))) + files(NEO_FILES.compute));
  return out.join('') + '</section>';
}

function footer(m) {
  const all = [...Object.values(m.sources), ...(m.neo && isObj(m.neo.sources) ? Object.values(m.neo.sources) : [])];
  const rows = all.map((s) => '<li><code>' + esc(s.file) + '</code> ' + esc(s.state) + (typeof s.bytes === 'number' ? ', ' + esc(s.bytes) + pl(s.bytes, ' byte', ' bytes') : '')
    + (typeof s.tailBytes === 'number' ? ', the newest ' + esc(s.tailBytes) + pl(s.tailBytes, ' byte', ' bytes') + ' read' : '')
    + (typeof s.rows === 'number' && s.state === 'read' ? ', ' + esc(s.rows) + pl(s.rows, ' line', ' lines') : '') + (s.bad ? ', ' + esc(s.bad) + pl(s.bad, ' unreadable line', ' unreadable lines') : '') + (s.sha256 ? ', sha256 ' + esc(s.sha256.slice(0, 16)) : '') + '</li>');
  return '<footer><p>Built at ' + (m.builtAt ? esc(m.builtAt) : '<span class="nm">no build stamp given</span>') + ' by <code>node web/build.mjs</code> from the files below. The organism rebuilds this page itself every generation, before its commit; no number on it is typed: each one is read from the file named under it, and the same numbers are served as <a href="/alive/data.json">data.json</a>.</p>'
    + '<ul class="files">' + rows.join('') + '</ul><p><a href="/">back to the organism</a></p></footer>';
}

/** The whole page for a model. */
export function renderAlive(m) {
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>DILATION / BRAIN / ALIVE</title>\n'
    + '<meta name="description" content="The brain growing its own cells in the cloud: its eras with no model in the loop, its generations, its cells by arm, its self-edits, its cortex and the tasks it set itself, read from its own records at every build.">\n'
    + (m.builtAt ? '<meta name="generated" content="' + esc(m.builtAt) + '">\n' : '')
    + '<style>\n' + STYLE + '\n</style>\n</head>\n<body>\n<div class="wrap">\n'
    + '<header class="top"><div class="brand">DILATION <span class="dim">/</span> BRAIN <span class="dim">/</span> ALIVE</div>'
    + '<nav class="pills"><a class="pill" href="/">organism</a><a class="pill" href="/ask">ask</a><a class="pill" href="/ladder/">ladder</a><a class="pill" href="/findings/">findings</a><a class="pill" href="/portfolio/">portfolio</a><span class="pill here">alive</span></nav></header>\n'
    + hero(m) + '\n' + (m.neo ? neoSection(m) + '\n' : '') + lastHour(m) + '\n' + generationsSection(m) + '\n' + cellsSection(m) + '\n' + selfSection(m) + '\n' + cortexSection(m) + '\n' + dreamsSection(m) + '\n' + appsSection(m) + '\n'
    + footer(m) + '\n</div>\n</body>\n</html>\n';
}

/** The page for the records readAlive returned; builtAt is the caller's stamp. */
export const aliveHtml = (data, { builtAt = null, secrets = [] } = {}) => renderAlive(aliveModel(data, { builtAt, secrets }));

/**
 * Read the records under root and write <outDir>/index.html and <outDir>/data.json. Throws when no stamp is passed or an em
 * dash would ship. env is the build's environment: the values of its token-named variables are scrubbed from both files.
 */
export function generateAlive({ root = ROOT, outDir = null, builtAt, env = process.env } = {}) {
  if (!text(builtAt)) throw new Error('alive: no builtAt: the caller passes its own new Date().toISOString()');
  const dir = outDir || path.join(root, 'web', 'dist', 'alive');
  const m = aliveModel(readAlive(root), { builtAt, secrets: secretValues(env) });
  const html = renderAlive(m), json = jsonText(m);
  if (html.includes(EM) || json.includes(EM)) throw new Error('alive: an em dash reached the page');
  fs.mkdirSync(dir, { recursive: true });
  const page = path.join(dir, 'index.html'), dataPath = path.join(dir, 'data.json');
  fs.writeFileSync(page, html);
  fs.writeFileSync(dataPath, json);
  const lg = m.vitals.lastGeneration;
  return { path: page, dataPath, bytes: Buffer.byteLength(html), dataBytes: Buffer.byteLength(json), cap: PAGE_CAP, generations: m.generations.length, newest: lg.generation,
    survivors: lg.survivors, candidates: lg.candidates, cells: m.cells.length, dreams: m.dreams.count, pointer: m.cortex.pointer,
    neo: { iterations: m.neo.iterations, eras: m.neo.eras.count, tasks: m.neo.now ? m.neo.now.tasks : null, cells: m.neo.now ? m.neo.now.cells : null,
      mastered: m.neo.now ? m.neo.now.mastered : null, series: m.neo.series ? m.neo.series.count : 0 },
    notRead: [...Object.values(m.sources), ...Object.values(m.neo.sources)].filter((s) => s.state !== 'read').map((s) => s.file + ' ' + s.state) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const r = generateAlive({ builtAt: new Date().toISOString() });
    console.log(JSON.stringify({ ...r, path: path.relative(ROOT, r.path).split(path.sep).join('/'), dataPath: path.relative(ROOT, r.dataPath).split(path.sep).join('/') }));
  } catch (e) {
    console.error('alive: ' + String((e && e.message) || e).split('\n')[0]);
    process.exit(1);
  }
}
