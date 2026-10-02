#!/usr/bin/env node
// grow/tape.mjs: THE TAPE, one general ability: WATCHING any public source over time (contract c1, the step
// `tape pull`, after `frontier step` and before `know shelve`). His words (Oct 2 2026, verbatim at the head of
// grow/NEO.md): "It should be an octopus over the entire fucking internet scrape every ticker and then compileand then use
// it for memecoin trading but u cant build that its gotta create and assemble the cells for it". So this file knows no
// market and no domain. A TAPE is a row of neo/tapes.json: a public keyless JSON or CSV endpoint (https, GET only, a host
// on the allowlist the registry keeps), a declared path to its list of records, a key field and numeric fields. Each pull
// GETs every due tape politely (at most one request a second per host, slower where the registry or a 429 says so, a
// byte cap, a deadline, a User-Agent that names the project) and APPENDS one snapshot (the time, each key, each numeric
// field) to a TIME-KEYED knowledge pack neo/know/tape-<id>.json in the pack shape of contract c5 (grow/know.mjs): a long
// table with the columns [key, "time", field ..], one row per key per snapshot, which the know and series primitives read
// like any other pack. A pack never passes its cap: the oldest snapshots are thinned first (the one closest in time to
// its older neighbour, inside the oldest half), the newest is never dropped.
// IT WIDENS ITSELF: a listing longer than a tape tracks keeps the top N by a declared field and ROTATES a window through
// the rest across pulls (a key cursor), so over many eras every key is seen; a tape may declare `discover` (a field
// holding more endpoint URLs, or a URL template over the record's fields) and the new tapes found that way are appended
// to neo/tapes.json, at most a few a pull, only on the allowlist, each with a time to live. A host that fails five eras
// in a row is PARKED and named (probed again a day later); so is a tape.
// Bytes are DATA: parsed as text (JSON.parse or the CSV parser of grow/absorb.mjs), never evaluated, never followed as
// an instruction; a key that names a FORBIDDEN pattern of grow/contract.mjs is dropped. No endpoint with a key, no order,
// wallet or account path, no credentials, no non-default port. No model call anywhere.
//   node grow/tape.mjs pull [--max-ms 30000] [--era <n>] [--fetch-timeout-ms 15000] [--max-fetch-bytes 4000000]
//                           [--max-bytes 32000000] [--max-discover 5]
//   node grow/tape.mjs status                                           [--root <dir>] on every verb
// It reads neo/tapes.json (made from neo/tapes-seeds.json on the first pull; the root's seeds, else this tree's), writes
// only neo/tapes.json, neo/know/tape-*.json and neo/know/INDEX.json (other packs' entries kept), and never opens state/,
// judge/heldout/, judge/control.jsonl or any neo/tasks/*/heldout.jsonl. Success prints ONE JSON line as the last stdout
// line and exits 0; a failure one stderr line and a non-zero exit (2: usage).
// Author: Opus 5.5 builder (THE TAPE) for the Fable 5.1 orchestrator, 2026-10-02.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORBIDDEN } from './contract.mjs';
import { DEFAULT_ROOT, redact } from './generation.mjs';
import { decode, parseCsv, getPath, clean, keyOf, numOf, sha256 } from './absorb.mjs';
import { retryAt } from './frontier.mjs';
import { KNOW_DIR, INDEX, PACK_RE, PACK_MAX_BYTES, PACKS_MAX_BYTES, readIndex, pack as readPack } from './know.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** The tree this file lives in: its seeds are the fallback when a root carries none. */
export const CODE_ROOT = path.resolve(HERE, '..');
export const TAPES = 'neo/tapes.json';
export const SEEDS = 'neo/tapes-seeds.json';
/** A tape's pack id is this prefix and the tape id (so it never meets a source id of neo/sources.json). */
export const PACK_PREFIX = 'tape-';
export const ID_RE = /^[a-z0-9][a-z0-9-]{0,47}$/;
export const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]([a-z0-9-]*[a-z0-9])?$/;
export const USER_AGENT = 'dilation-brain-tape/1 (+https://dilation.dev; public data, GET only, one request a second per host)';
/** One request a second per host, at the most; the registry's hostGapMs and a 429 only slow a host. */
export const PER_HOST_MS = 1000;
export const MAX_GAP_MS = 60000;
/** Eras in a row a host (or a tape) may fail before it is parked; a parked one is probed again after PARK_RETRY_MS. */
export const FAIL_PARK = 5;
export const PARK_RETRY_MS = 24 * 3600 * 1000;
/** Tapes the registry may hold (seeds and discovered). */
export const MAX_TAPES = 200;
export const MAX_FIELDS = 16;
/** Keys one snapshot may hold (top + rotate). */
export const MAX_KEYS = 1000;
export const TOP = 50;
export const ROTATE = 50;
/** A tape is not pulled again sooner than this (its own everyMs may say otherwise). */
export const EVERY_MS = 30000;
/** A discovered tape lives this long unless its discover row says otherwise. */
export const TTL_MS = 3 * 24 * 3600 * 1000;
export const MAX_DISCOVER = 5;
/** A tape pack's own cap (at most know's PACK_MAX_BYTES); all tape packs together at most TAPES_MAX_BYTES. */
export const TAPE_MAX_BYTES = 1000000;
export const TAPES_MAX_BYTES = 12 * 1024 * 1024;
export const MAX_REDIRECTS = 3;
/** Kept back at the end of --max-ms for the writes. */
export const RESERVE_MS = 1500;
export const DEFAULTS = Object.freeze({ maxMs: 30000, fetchTimeoutMs: 15000, maxFetchBytes: 4000000, maxBytes: 32000000, maxDiscover: MAX_DISCOVER });
export const LIMITS = Object.freeze({ maxMs: 86400000, fetchTimeoutMs: 600000, maxFetchBytes: 8000000, maxBytes: 256000000, maxDiscover: 50 });
export const FORMATS = Object.freeze(['json', 'csv', 'tsv']);
/** A path segment that names an order, a wallet, an account or a credential: never fetched. */
export const SEG_RE = /^(orders?|wallets?|accounts?|withdraws?|withdrawals?|deposits?|transfers?|swaps?|sign|signin|signup|login|logout|auth|oauth2?|keys?|apikeys?|portfolios?|balances?|positions?|private|me|session|sessions)$/i;
/** A query parameter that carries a key: never fetched. */
export const KEYQ_RE = /^(api[-_]?key|apikey|key|token|access[-_]?token|auth|secret|password|passwd|signature|sig|session)$/i;
export const USAGE = [
  'usage: node grow/tape.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  pull [--max-ms ' + DEFAULTS.maxMs + '] [--era <n>] [--fetch-timeout-ms ' + DEFAULTS.fetchTimeoutMs + '] [--max-fetch-bytes ' + DEFAULTS.maxFetchBytes + '] [--max-bytes ' + DEFAULTS.maxBytes + '] [--max-discover ' + MAX_DISCOVER + ']',
  '       every due tape of ' + TAPES + ': one GET, one snapshot appended to ' + KNOW_DIR + '/' + PACK_PREFIX + '<id>.json',
  '  status                                  { tapes, packs, rows, keys, keys2, parked, list }',
].join('\n');

export class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }
/** A fetch or a body that did not give records: kind is refused, rate (the host said slow down), http, size, net or body. */
export class TapeError extends Error { constructor(kind, line, extra = {}) { super(line); this.kind = kind; Object.assign(this, extra); } }
const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const first = (e) => String((e && e.message) || e).split(/\r?\n/)[0].slice(0, 300);
const tripped = (s) => FORBIDDEN.some(([re]) => re.test(s));
const isCell = (v) => typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v));
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
/** An ISO time to the second, the form every snapshot carries ("2026-10-02T12:00:00Z"). */
export const isoSecond = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
function writeAtomic(f, text) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.' + process.pid + '.' + Date.now().toString(36) + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, f);
}

// ---- the network: the allowlist on every hop, GET only, a time budget, a byte cap, nothing run
/**
 * Why a URL may not be fetched, or '' when it may: https, no credentials, the default port, a host on the allowlist,
 * no path segment that names an order, wallet, account or credential, no query parameter that carries a key.
 * @param {string} u
 * @param {Iterable<string>} allowed the hosts (lower case)
 * @returns {string}
 */
export function urlRefusal(u, allowed) {
  let x;
  try { x = new URL(String(u)); } catch { return 'not a URL: ' + String(u).slice(0, 80); }
  if (x.protocol !== 'https:') return 'not https (' + x.protocol + ')';
  if (x.username || x.password) return 'a URL with credentials is refused';
  if (x.port) return 'a non-default port is refused (' + x.port + ')';
  const host = x.hostname.toLowerCase();
  const set = allowed instanceof Set ? allowed : new Set(allowed || []);
  if (!set.has(host)) return 'the host ' + host + ' is not on the allowlist';
  for (const seg of x.pathname.split('/')) {
    let s = seg;
    try { s = decodeURIComponent(seg); } catch { /* the raw segment is checked */ }
    if (SEG_RE.test(s)) return 'a path that names an order, wallet, account or credential is refused (' + s.slice(0, 40) + ')';
  }
  for (const k of x.searchParams.keys()) if (KEYQ_RE.test(k)) return 'a URL that carries a key is refused (' + k.slice(0, 40) + ')';
  return '';
}
/** The lower case host of a URL, or ''. */
export function hostOf(u) { try { return new URL(String(u)).hostname.toLowerCase(); } catch { return ''; } }

const REDIRECT = new Set([301, 302, 303, 307, 308]);
async function readCapped(res, max) {
  if (res.body && typeof res.body.getReader === 'function') {
    const reader = res.body.getReader();
    const parts = [];
    let n = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      n += value.byteLength;
      if (n > max) { try { await reader.cancel(); } catch { /* dropped either way */ } throw new TapeError('size', 'over the byte cap: more than ' + max + ' bytes'); }
      parts.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
    }
    return Buffer.concat(parts, n);
  }
  if (typeof res.arrayBuffer !== 'function') throw new TapeError('net', 'the response has no body');
  const b = Buffer.from(await res.arrayBuffer());
  if (b.length > max) throw new TapeError('size', 'over the byte cap: ' + b.length + ' bytes, ' + max + ' allowed');
  return b;
}
async function drop(res) { try { if (res && res.body && typeof res.body.cancel === 'function') await res.body.cancel(); } catch { /* nothing to read */ } }

/**
 * GET one URL: every hop is checked by urlRefusal BEFORE it is fetched (redirects by hand, at most MAX_REDIRECTS), the
 * method is GET with no body, the User-Agent names the project, a time budget and a byte cap bound it; a 429 (or a 503
 * with Retry-After) is a TapeError of kind rate with `until` (the host's own Retry-After, else frontier's back-off); only
 * status 200 is data. The bytes are returned, never run.
 * @returns {Promise<{ bytes: Buffer, url: string, hops: number, type: string }>}
 */
export async function fetchGet(url, { fetch: fetchFn = globalThis.fetch, allowed = [], timeoutMs = DEFAULTS.fetchTimeoutMs, maxBytes = DEFAULTS.maxFetchBytes, nowMs = Date.now() } = {}) {
  if (typeof fetchFn !== 'function') throw new TapeError('net', 'no fetch in this runtime');
  const ac = new AbortController();
  let timer = null;
  const expired = new Promise((resolve, reject) => { timer = setTimeout(() => { ac.abort(); reject(new TapeError('net', 'timed out after ' + timeoutMs + ' ms')); }, timeoutMs); });
  expired.catch(() => { /* raced below */ });
  const race = (p) => Promise.race([p, expired]);
  try {
    let cur = String(url);
    for (let hop = 0; ; hop++) {
      const why = urlRefusal(cur, allowed);
      if (why) throw new TapeError('refused', (hop ? 'a redirect refused before the fetch: ' : 'refused before the fetch: ') + why);
      cur = new URL(cur).href;
      let res;
      try {
        res = await race(fetchFn(cur, { method: 'GET', redirect: 'manual', signal: ac.signal, headers: { 'user-agent': USER_AGENT, accept: 'application/json, text/csv;q=0.9, */*;q=0.1' } }));
      } catch (e) { throw e instanceof TapeError ? e : new TapeError('net', first(e)); }
      if (!res || !Number.isInteger(res.status)) throw new TapeError('net', 'the fetch returned no response');
      const get = (h) => (res.headers && typeof res.headers.get === 'function' ? res.headers.get(h) : null);
      // a runtime that followed a redirect by itself reports where it landed: that place is checked too
      if (typeof res.url === 'string' && res.url && urlRefusal(res.url, allowed)) { await drop(res); throw new TapeError('refused', 'refused after the fetch: the response came from ' + urlRefusal(res.url, allowed)); }
      if (REDIRECT.has(res.status)) {
        const loc = get('location');
        await drop(res);
        if (!loc) throw new TapeError('http', 'HTTP ' + res.status + ' with no location');
        if (hop >= MAX_REDIRECTS) throw new TapeError('http', 'more than ' + MAX_REDIRECTS + ' redirects');
        try { cur = new URL(loc, cur).href; } catch { throw new TapeError('http', 'HTTP ' + res.status + ' to a location that is not a URL'); }
        continue;
      }
      if (res.status === 429 || (res.status === 503 && get('retry-after') !== null)) {
        await drop(res);
        throw new TapeError('rate', 'HTTP ' + res.status + ': the host asks to slow down', { until: retryAt(get, nowMs) });
      }
      if (res.status !== 200) { await drop(res); throw new TapeError('http', 'HTTP ' + res.status, { status: res.status }); }
      const len = Number(get('content-length'));
      if (get('content-length') !== null && Number.isFinite(len) && len > maxBytes) { await drop(res); throw new TapeError('size', 'over the byte cap: ' + len + ' bytes, ' + maxBytes + ' allowed'); }
      const bytes = await race(readCapped(res, maxBytes));
      return { bytes, url: cur, hops: hop, type: String(get('content-type') || '') };
    }
  } finally { clearTimeout(timer); }
}

// ---- a tape: its declaration and its records
const LABEL_RE = /^[^\u0000-\u001f<>]{1,40}$/;
const lastSeg = (p) => String(p).split('.').filter(Boolean).at(-1) || String(p);
/** A tape's numeric fields as [{ path, label }] (a bare string is a path whose label is its last segment). */
export function fieldsOf(t) {
  return (Array.isArray(t && t.fields) ? t.fields : []).map((f) => (typeof f === 'string' ? { path: f, label: lastSeg(f) } : isObj(f) ? { path: f.path, label: typeof f.label === 'string' && f.label.trim() ? f.label.trim() : lastSeg(f.path) } : { path: null, label: null }));
}
/** The key column's name. */
export const keyLabelOf = (t) => (isObj(t) && typeof t.keyLabel === 'string' && t.keyLabel.trim() ? t.keyLabel.trim() : 'key');
/** A tape pack's columns: [key, "time", field ..]. */
export const columnsOf = (t) => [keyLabelOf(t), 'time', ...fieldsOf(t).map((f) => f.label)];
const intIn = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;

/**
 * What is wrong with a tape row, or [] when it may be pulled.
 * @param {object} t a row of neo/tapes.json
 * @param {Iterable<string>} allowed the registry's allowlist
 * @param {{ nested?: boolean }} o nested: a discover's `as` row (no id or url of its own yet, no discover of its own)
 * @returns {string[]}
 */
export function tapeErrors(t, allowed, { nested = false } = {}) {
  if (!isObj(t)) return ['a tape is an object'];
  const e = [];
  if (!nested) {
    if (typeof t.id !== 'string' || !ID_RE.test(t.id)) e.push('id is ' + ID_RE + ', not ' + JSON.stringify(t.id).slice(0, 60));
    const why = urlRefusal(t.url, allowed);
    if (why) e.push('url: ' + why);
  }
  if (t.format !== undefined && !FORMATS.includes(t.format)) e.push('format is one of ' + FORMATS.join(', '));
  for (const k of ['root', 'rankBy']) if (t[k] !== undefined && typeof t[k] !== 'string') e.push(k + ' is a path (a string)');
  if (t.key !== undefined && t.key !== null && (typeof t.key !== 'string' || !t.key)) e.push('key is a path or a template of paths, or null (the tape id)');
  if (t.entries !== undefined && typeof t.entries !== 'boolean') e.push('entries is true or false');
  if (t.header !== undefined && typeof t.header !== 'boolean') e.push('header is true or false');
  const kl = keyLabelOf(t);
  if (!LABEL_RE.test(kl) || kl === 'time') e.push('keyLabel is 1 to 40 characters, no markup, not "time"');
  if (t.fields !== undefined && !Array.isArray(t.fields)) e.push('fields is a list');
  const fs_ = fieldsOf(t);
  if (fs_.length > MAX_FIELDS) e.push('at most ' + MAX_FIELDS + ' fields');
  const seen = new Set([kl, 'time']);
  for (const f of fs_) {
    if (typeof f.path !== 'string' || !f.path) { e.push('a field has no path'); continue; }
    if (!LABEL_RE.test(f.label) || seen.has(f.label)) { e.push('the field label ' + JSON.stringify(f.label) + ' is empty, markup, "time", the key label or taken'); continue; }
    if (tripped(f.label)) { e.push('the field label ' + JSON.stringify(f.label) + ' names a forbidden pattern'); continue; }
    seen.add(f.label);
  }
  const top = t.top ?? TOP, rot = t.rotate ?? ROTATE;
  if (!intIn(top, 0, MAX_KEYS) || !intIn(rot, 0, MAX_KEYS) || top + rot < 1 || top + rot > MAX_KEYS) e.push('top and rotate are integers, 1 to ' + MAX_KEYS + ' keys in all');
  if (t.everyMs !== undefined && !intIn(t.everyMs, 0, 86400000)) e.push('everyMs is 0 to 86400000');
  if (t.maxBytes !== undefined && !intIn(t.maxBytes, 4096, PACK_MAX_BYTES)) e.push('maxBytes is 4096 to ' + PACK_MAX_BYTES);
  if (t.expires !== undefined && !Number.isFinite(t.expires)) e.push('expires is a time in ms');
  if (t.discover !== undefined) {
    const d = t.discover;
    if (nested) e.push('a discovered tape does not discover');
    else if (!isObj(d) || (typeof d.path !== 'string' && typeof d.template !== 'string')) e.push('discover has a path (a field holding URLs) or a template (a URL over the record fields)');
    else {
      if (d.max !== undefined && !intIn(d.max, 1, LIMITS.maxDiscover)) e.push('discover.max is 1 to ' + LIMITS.maxDiscover);
      if (d.ttlMs !== undefined && !intIn(d.ttlMs, 60000, 90 * 24 * 3600 * 1000)) e.push('discover.ttlMs is one minute to 90 days');
      if (!isObj(d.as)) e.push('discover.as declares the new tapes (root, key, fields)');
      else for (const x of tapeErrors(d.as, allowed, { nested: true })) e.push('discover.as: ' + x);
    }
  }
  return e;
}

/** A number from a JSON number, a numeric string (an exponent or "1,234" too) or a boolean (1 or 0); else null. */
export function numberOf(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d{1,3})?$/.test(s)) { const n = Number(s); return Number.isFinite(n) ? n : null; }
  const m = numOf(s);
  return m ? m.n : null;
}

/**
 * The records of a response, by the tape's declaration: CSV or TSV rows keyed by the header, or the JSON value at `root`
 * ("" is the document) that is a list of records; `entries` turns an object into [{ $key, ...value }] ({ $key, $value }
 * for a scalar), `header` turns a list of lists into records by its first row, one object is one record. A body that is
 * not JSON (or, for CSV, is markup) is refused and named.
 * @returns {object[]}
 */
export function recordsFrom(bytes, t, type = '') {
  const text = decode(bytes);
  const fmt = t.format || 'json';
  const said = (type ? ', ' + String(type).split(';')[0].trim().slice(0, 40) : '');
  if (fmt === 'csv' || fmt === 'tsv') {
    if (/^\s*</.test(text)) throw new TapeError('body', 'the body is markup, not ' + fmt.toUpperCase() + ' (' + Buffer.byteLength(text) + ' bytes' + said + ')');
    const rows = parseCsv(text, fmt === 'tsv' ? '\t' : ',');
    const head = (rows.shift() || []).map((h) => h.trim());
    if (head.length < 2) throw new TapeError('body', 'the body is not ' + fmt.toUpperCase() + ': no header of two columns');
    return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] === undefined ? '' : r[i]])));
  }
  let doc;
  try { doc = JSON.parse(text); } catch { throw new TapeError('body', 'the body is not JSON (' + Buffer.byteLength(text) + ' bytes' + said + ')'); }
  let at = t.root ? getPath(doc, t.root) : doc;
  if (t.entries) {
    if (!isObj(at)) throw new TapeError('body', 'entries: the value at ' + JSON.stringify(t.root || '') + ' is not an object');
    at = Object.entries(at).map(([k, v]) => (isObj(v) ? { ...v, $key: k } : { $key: k, $value: v }));
  } else if (t.header) {
    if (!Array.isArray(at) || !Array.isArray(at[0])) throw new TapeError('body', 'header: the value at ' + JSON.stringify(t.root || '') + ' is not a list of lists');
    const head = at[0].map((h) => String(h));
    at = at.slice(1).filter(Array.isArray).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
  } else if (isObj(at)) at = [at];
  if (!Array.isArray(at)) throw new TapeError('body', 'the value at ' + JSON.stringify(t.root || '') + ' is not a list of records');
  return at.map((v) => (isObj(v) ? v : { $: v }));
}

/** A rank value: a number, else a string, else null (a number ranks above a string, a null last). */
const rankOf = (rec, p) => { const v = getPath(rec, p); const n = numberOf(v); return n !== null ? n : typeof v === 'string' && v.trim() ? v.trim() : null; };
function byRank(a, b) {
  if (a.r === null || b.r === null) return a.r === b.r ? cmp(a.k, b.k) : a.r === null ? 1 : -1;
  if (typeof a.r !== typeof b.r) return typeof a.r === 'number' ? -1 : 1;
  const d = typeof a.r === 'number' ? b.r - a.r : cmp(b.r, a.r);
  return d || cmp(a.k, b.k);
}

/**
 * The keys one snapshot holds. One record a key (the first wins; a key that is missing, too long, markup or a FORBIDDEN
 * pattern is dropped). A listing of at most top + rotate keys is kept whole, in its own order. A longer one keeps the
 * top `top` keys by `rankBy` (descending; the listing order when no rankBy) and a window of `rotate` keys of the rest in
 * key order, starting after `cursor` and wrapping: the next cursor is the window's last key, so over many pulls every
 * key is seen.
 * @returns {{ chosen: [string, object][], listed: number, cursor: string|null, wrapped: boolean, dupes: number, nokey: number, dropped: number }}
 */
export function selectKeys(recs, t, cursor = null) {
  const byKey = new Map();
  let dupes = 0, nokey = 0, dropped = 0;
  for (const r of recs) {
    const k = t.key === null || t.key === undefined ? (byKey.size ? null : t.id) : keyOf(r, t.key);
    if (k === null || k === undefined) { nokey++; continue; }
    if (tripped(k)) { dropped++; continue; }
    if (byKey.has(k)) { dupes++; continue; }
    byKey.set(k, r);
  }
  const keys = [...byKey.keys()];
  const top = t.top ?? TOP, rot = t.rotate ?? ROTATE;
  if (keys.length <= top + rot) return { chosen: keys.map((k) => [k, byKey.get(k)]), listed: keys.length, cursor: null, wrapped: false, dupes, nokey, dropped };
  const ranked = typeof t.rankBy === 'string' && t.rankBy ? keys.map((k) => ({ k, r: rankOf(byKey.get(k), t.rankBy) })).sort(byRank).map((x) => x.k) : keys;
  const head = ranked.slice(0, top);
  const inHead = new Set(head);
  const rest = keys.filter((k) => !inHead.has(k)).sort(cmp);
  let i = typeof cursor === 'string' ? rest.findIndex((k) => cmp(k, cursor) > 0) : 0;
  let wrapped = false;
  if (i < 0) { i = 0; wrapped = true; }
  const n = Math.min(rot, rest.length), win = [];
  for (let j = 0; j < n; j++) { const x = i + j; if (x >= rest.length) wrapped = true; win.push(rest[x % rest.length]); }
  return { chosen: [...head, ...win].map((k) => [k, byKey.get(k)]), listed: keys.length, cursor: win.length ? win[win.length - 1] : cursor, wrapped, dupes, nokey, dropped };
}

/** The rows of one snapshot: [key, time, field ..], a field that is not a number is "". */
export function snapshotRows(chosen, t, at) {
  const fs_ = fieldsOf(t);
  return chosen.map(([k, rec]) => [k, at, ...fs_.map((f) => { const n = numberOf(getPath(rec, f.path)); return n === null ? '' : n; })]);
}

// ---- the pack: a long table, appended to, thinned from the oldest half, never past its cap
const rowBytes = (r) => Buffer.byteLength(JSON.stringify(r));
const timeMs = (s) => { const n = Date.parse(s); return Number.isFinite(n) ? n : 0; };
/**
 * Which snapshot to thin next: among the oldest half of all but the newest, the one closest in time to its older
 * neighbour (the older on a tie); the oldest when fewer than four snapshots are left. Never the newest.
 * @param {{ time: string }[]} groups snapshots in time order
 * @returns {number} an index, or -1 when only the newest is left
 */
export function thinIndex(groups) {
  const m = groups.length - 1;
  if (m < 1) return -1;
  const h = Math.ceil(m / 2);
  if (h < 2) return 0;
  let best = 1, gap = Infinity;
  for (let i = 1; i < h; i++) { const g = timeMs(groups[i].time) - timeMs(groups[i - 1].time); if (g < gap) { gap = g; best = i; } }
  return best;
}

/**
 * The pack of a tape with one more snapshot: the previous pack's rows (mapped to today's columns by name), the new rows
 * at `at`, the oldest snapshots thinned (thinIndex) until the text is at most `cap` bytes; when the newest alone is over
 * the cap its last rows are cut. null pk when a snapshot at `at` is there already.
 * @returns {{ pk: object|null, text?: string, size?: number, appended: number, thinned: number, cut: number, why?: string }}
 */
export function appendSnapshot(prev, t, rows, { at, era = null, cap = PACK_MAX_BYTES } = {}) {
  const columns = columnsOf(t);
  const id = PACK_PREFIX + t.id;
  const old = [];
  let thinnedBefore = 0;
  if (isObj(prev) && Array.isArray(prev.columns) && Array.isArray(prev.rows)) {
    const map = columns.map((c) => prev.columns.indexOf(c));
    if (map[0] >= 0 && map[1] >= 0) {
      for (const r of prev.rows) {
        if (!Array.isArray(r) || typeof r[map[1]] !== 'string' || !isCell(r[map[0]])) continue;
        old.push(map.map((j) => (j >= 0 && isCell(r[j]) ? r[j] : '')));
      }
    }
    if (isObj(prev.tape) && Number.isInteger(prev.tape.thinned)) thinnedBefore = prev.tape.thinned;
  }
  if (old.some((r) => r[1] === at)) return { pk: null, appended: 0, thinned: 0, cut: 0, why: 'a snapshot at ' + at + ' is in the pack already' };
  const byTime = new Map();
  for (const r of old) { if (!byTime.has(r[1])) byTime.set(r[1], []); byTime.get(r[1]).push(r); }
  byTime.set(at, rows.slice());
  const groups = [...byTime.entries()].sort((a, b) => cmp(timeMs(a[0]), timeMs(b[0])) || cmp(a[0], b[0])).map(([time, rs]) => ({ time, rows: rs, bytes: rs.reduce((s, r) => s + rowBytes(r) + 1, 0) }));
  let thinned = thinnedBefore, cut = 0;
  const build = () => {
    const all = groups.flatMap((g) => g.rows);
    const keys = new Set(all.map((r) => r[0]));
    return {
      id, from: String(t.url), sha: sha256(JSON.stringify(all)), columns, rows: all, at,
      tape: { id: t.id, key: columns[0], time: 'time', fields: columns.slice(2), snapshots: groups.length, keys: keys.size, first: groups[0].time, last: groups[groups.length - 1].time, thinned, ...(cut ? { cut } : {}), era },
    };
  };
  for (let guard = 0; guard < 100000; guard++) {
    // the estimate first (no stringify of the whole pack per snapshot thinned), the exact size last
    const shell = build();
    const base = Buffer.byteLength(JSON.stringify({ ...shell, rows: [] }) + '\n') + 64;
    let est = base + groups.reduce((s, g) => s + g.bytes, 0);
    while (est > cap && groups.length > 1) { const i = thinIndex(groups); est -= groups[i].bytes; groups.splice(i, 1); thinned++; }
    if (est > cap && groups.length === 1) {
      const g = groups[0];
      while (est > cap && g.rows.length > 1) { const r = g.rows.pop(); const b = rowBytes(r) + 1; g.bytes -= b; est -= b; cut++; }
    }
    const pk = build();
    const text = JSON.stringify(pk) + '\n';
    const size = Buffer.byteLength(text);
    if (size <= cap) return { pk, text, size, appended: groups[groups.length - 1].time === at ? groups[groups.length - 1].rows.length : 0, thinned: thinned - thinnedBefore, cut };
    if (groups.length > 1) { const i = thinIndex(groups); groups.splice(i, 1); thinned++; continue; }
    if (groups[0].rows.length > 1) { const r = groups[0].rows.pop(); groups[0].bytes -= rowBytes(r) + 1; cut++; continue; }
    return { pk: null, appended: 0, thinned: 0, cut: 0, why: 'one row is over the cap of ' + cap + ' bytes' };
  }
  return { pk: null, appended: 0, thinned: 0, cut: 0, why: 'the cap of ' + cap + ' bytes was not reached' };
}

// ---- discovery: more endpoints named by a record, only on the allowlist
/**
 * The URLs a record names for a discover row: its `template` with every {path} replaced by that field (URL-encoded; a
 * missing field gives none), else the string (or the first five strings of the list) at its `path`.
 * @returns {string[]}
 */
export function discoverUrls(rec, d) {
  if (!isObj(d)) return [];
  if (typeof d.template === 'string') {
    let miss = false;
    const u = d.template.replace(/\{([^{}]+)\}/g, (m, p) => { const v = clean(getPath(rec, p)); if (v === null) { miss = true; return ''; } return encodeURIComponent(v); });
    return miss ? [] : [u];
  }
  if (typeof d.path !== 'string') return [];
  const v = getPath(rec, d.path);
  return (Array.isArray(v) ? v : [v]).filter((x) => typeof x === 'string' && x.length <= 2048).slice(0, 5);
}
/** A discovered tape's id: its parent's id and eight hex of the URL's sha256. */
export const discoverId = (parent, href) => String(parent).slice(0, 38).replace(/-+$/, '') + '-' + sha256(String(href)).slice(0, 8);

// ---- the registry: neo/tapes.json, made from the seeds on the first pull
export const ABOUT = 'THE TAPE (grow/tape.mjs): every row is a public keyless endpoint watched over time; each pull appends one snapshot to neo/know/tape-<id>.json. allowedHosts is the allowlist (the code never adds a host; the seeds may); hostGapMs only slows a host. state is the pull state: per tape its last pull, its key cursor and its failures; per host its gap, its back-off and its failures (five failing eras in a row park it).';
const freshRegistry = () => ({ version: 1, about: ABOUT, allowedHosts: [], hostGapMs: {}, tapes: [], state: { tapes: {}, hosts: {} } });
const hostOk = (h) => typeof h === 'string' && HOST_RE.test(h);
/** The seeds: the root's neo/tapes-seeds.json, else this tree's. */
export function readSeeds(root, codeRoot = CODE_ROOT) {
  for (const r of [root, codeRoot]) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(r, ...SEEDS.split('/')), 'utf8'));
      if (isObj(d) && Array.isArray(d.tapes)) return { allowedHosts: Array.isArray(d.allowedHosts) ? d.allowedHosts : [], hostGapMs: isObj(d.hostGapMs) ? d.hostGapMs : {}, tapes: d.tapes, from: r };
    } catch { /* the next place */ }
  }
  return { allowedHosts: [], hostGapMs: {}, tapes: [], from: null };
}
/**
 * neo/tapes.json, read and normalised; made from the seeds when missing or not JSON. The seeds' hosts, gaps and tapes the
 * registry lacks are added on every read (the seed file may grow; nothing else ever adds a host).
 * @returns {{ reg: object, created: boolean, notes: string[] }}
 */
export function loadRegistry(root, codeRoot = CODE_ROOT) {
  const f = path.join(root, ...TAPES.split('/'));
  const notes = [];
  let doc = null, created = false;
  if (fs.existsSync(f)) {
    try { doc = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { doc = null; }
    if (!isObj(doc)) { notes.push('tapes: ' + TAPES + ' is not a JSON object: made again from the seeds'); doc = null; }
  }
  if (!doc) { doc = freshRegistry(); created = true; }
  const reg = { ...freshRegistry(), ...doc };
  reg.allowedHosts = [...new Set((Array.isArray(reg.allowedHosts) ? reg.allowedHosts : []).map((h) => String(h).toLowerCase()).filter(hostOk))];
  reg.hostGapMs = Object.fromEntries(Object.entries(isObj(reg.hostGapMs) ? reg.hostGapMs : {}).filter(([h, ms]) => hostOk(h) && intIn(ms, PER_HOST_MS, MAX_GAP_MS)));
  reg.tapes = Array.isArray(reg.tapes) ? reg.tapes : [];
  reg.state = isObj(reg.state) ? reg.state : {};
  reg.state.tapes = isObj(reg.state.tapes) ? reg.state.tapes : {};
  reg.state.hosts = isObj(reg.state.hosts) ? reg.state.hosts : {};
  const seeds = readSeeds(root, codeRoot);
  for (const h of seeds.allowedHosts) { const x = String(h).toLowerCase(); if (hostOk(x) && !reg.allowedHosts.includes(x)) reg.allowedHosts.push(x); }
  for (const [h, ms] of Object.entries(seeds.hostGapMs)) if (hostOk(h) && !own(reg.hostGapMs, h) && intIn(ms, PER_HOST_MS, MAX_GAP_MS)) reg.hostGapMs[h] = ms;
  const ids = new Set(reg.tapes.filter(isObj).map((t) => t.id));
  for (const s of seeds.tapes) {
    if (!isObj(s) || typeof s.id !== 'string' || ids.has(s.id) || reg.tapes.length >= MAX_TAPES) continue;
    const { checked, ...t } = s; // eslint-disable-line no-unused-vars
    reg.tapes.push({ ...t, from: 'seed' });
    ids.add(s.id);
  }
  if (created && !seeds.from) notes.push('tapes: no ' + SEEDS + ' in the root or this tree: the registry is empty');
  return { reg, created, notes };
}
const baseGap = (reg, h) => Math.max(PER_HOST_MS, own(reg.hostGapMs, h) && intIn(reg.hostGapMs[h], PER_HOST_MS, MAX_GAP_MS) ? reg.hostGapMs[h] : PER_HOST_MS);
const knowDir = (root) => path.join(root, ...KNOW_DIR.split('/'));
const sizeOfPack = (root, id) => { try { return fs.statSync(path.join(knowDir(root), id + '.json')).size; } catch { return 0; } };
/** The pack ids of every tape pack on disk. */
function tapeFiles(root) {
  try { return fs.readdirSync(knowDir(root)).filter((f) => /^tape-[a-z0-9-]+\.json$/.test(f)).map((f) => f.slice(0, -5)).filter((id) => PACK_RE.test(id)).sort(); } catch { return []; }
}

// ---- pull: one snapshot a due tape
/** A fetch is not started with less than this left before the deadline. */
export const MIN_FETCH_MS = 1000;
/**
 * pull: every due tape (not pulled in this era yet, not sooner than its everyMs, its host and itself not parked, its
 * host not waiting out a 429) gets ONE GET; the hosts run side by side, each host one request at a time with its gap.
 * The snapshot is appended to the tape's pack (written at once, atomically), then neo/know/INDEX.json and
 * neo/tapes.json are written. Total: a tape that fails is a line, never a throw.
 * @param {string} root the tree
 * @param {{ fetch?: Function, clock?: () => number, sleep?: (ms: number) => Promise<void>, now?: () => string, maxMs?: number, fetchTimeoutMs?: number, maxFetchBytes?: number, maxBytes?: number, maxDiscover?: number, era?: number|null, codeRoot?: string }} o
 * @returns {Promise<object>} the JSON line
 */
export async function pull(root = DEFAULT_ROOT, o = {}) {
  const fetchFn = typeof o.fetch === 'function' ? o.fetch : globalThis.fetch;
  const clock = typeof o.clock === 'function' ? o.clock : () => Date.now();
  const sleep = typeof o.sleep === 'function' ? o.sleep : (ms) => new Promise((r) => setTimeout(r, ms));
  const stamp = typeof o.now === 'function' ? o.now : () => isoSecond(clock());
  const maxMs = o.maxMs ?? DEFAULTS.maxMs, fetchTimeoutMs = o.fetchTimeoutMs ?? DEFAULTS.fetchTimeoutMs;
  const maxFetchBytes = o.maxFetchBytes ?? DEFAULTS.maxFetchBytes, maxBytes = o.maxBytes ?? DEFAULTS.maxBytes;
  const maxDiscover = Math.min(o.maxDiscover ?? DEFAULTS.maxDiscover, LIMITS.maxDiscover);
  const era = Number.isInteger(o.era) ? o.era : null;
  const t0 = clock();
  const deadline = t0 + Math.max(0, maxMs - Math.min(RESERVE_MS, Math.floor(maxMs / 10)));
  const remaining = () => deadline - clock();
  const { reg, created, notes } = loadRegistry(root, o.codeRoot ?? CODE_ROOT);
  const blocked = [...notes], refused = [], waiting = [], written = [], discovered = [], evicted = [], unparked = [];
  const allowed = new Set(reg.allowedHosts);
  const st = reg.state;
  let retired = 0, unchanged = 0, left = 0, requests = 0, bytes = 0, appended = 0, keys = 0, thinned = 0, offList = 0, parkedTapes = 0, capHit = false, spent = false;
  // a discovered tape past its time to live leaves the registry (its pack stays until the budget needs the room)
  reg.tapes = reg.tapes.filter((t) => { if (isObj(t) && typeof t.expires === 'number' && t.expires <= t0) { retired++; return false; } return true; });
  const ids = new Set(reg.tapes.filter(isObj).map((t) => t.id));
  for (const id of Object.keys(st.tapes)) if (!ids.has(id)) delete st.tapes[id];
  const known = new Set(reg.tapes.filter(isObj).map((t) => { try { return new URL(String(t.url)).href; } catch { return ''; } }));
  const tState = (id) => { if (!own(st.tapes, id) || !isObj(st.tapes[id])) st.tapes[id] = {}; return st.tapes[id]; };
  const hState = (h) => { if (!own(st.hosts, h) || !isObj(st.hosts[h])) st.hosts[h] = {}; return st.hosts[h]; };
  const valid = [];
  for (const t of reg.tapes) {
    const errs = tapeErrors(t, allowed);
    if (errs.length) blocked.push('tape ' + (isObj(t) && typeof t.id === 'string' ? t.id.slice(0, 48) : '?') + ': ' + errs[0]);
    else valid.push(t);
  }
  const queues = new Map();
  for (const t of valid) {
    const ts = tState(t.id);
    if (Number.isFinite(ts.parkedAt) && t0 - ts.parkedAt < PARK_RETRY_MS) { parkedTapes++; continue; }
    if (era !== null && ts.lastEra === era) { unchanged++; continue; }
    if (Number.isFinite(ts.lastAt) && t0 - ts.lastAt < (t.everyMs ?? EVERY_MS)) { unchanged++; continue; }
    const h = hostOf(t.url), hs = hState(h);
    if (Number.isFinite(hs.parkedAt) && t0 - hs.parkedAt < PARK_RETRY_MS) continue;
    if (Number.isFinite(hs.until) && hs.until > t0) { waiting.push(t.id); continue; }
    if (!queues.has(h)) queues.set(h, []);
    queues.get(h).push(t);
  }
  // the least recently pulled first, so a deadline never starves the same tapes
  const lastAt = (t) => (Number.isFinite(tState(t.id).lastAt) ? tState(t.id).lastAt : -1);
  for (const q of queues.values()) q.sort((a, b) => lastAt(a) - lastAt(b) || cmp(a.id, b.id));
  const due = [...queues.values()].reduce((s, q) => s + q.length, 0);

  // the bars: a tape's own cap, a fair share of TAPES_MAX_BYTES, know's PACKS_MAX_BYTES for every pack
  const dir = knowDir(root);
  let tapesTotal = tapeFiles(root).reduce((s, id) => s + sizeOfPack(root, id), 0);
  let allTotal = tapesTotal + readIndex(root).packs.filter((p) => !p.id.startsWith(PACK_PREFIX)).reduce((s, p) => s + sizeOfPack(root, p.id), 0);
  const share = Math.floor(TAPES_MAX_BYTES / Math.max(1, valid.length));
  const upd = new Map(), removed = new Set();
  /** Room is made by removing the packs of tapes the registry no longer holds, the least recently written first. */
  const evictFor = (enough) => {
    const gone = tapeFiles(root).filter((id) => !ids.has(id.slice(PACK_PREFIX.length)) && !removed.has(id)).map((id) => {
      let m = 0;
      try { m = fs.statSync(path.join(dir, id + '.json')).mtimeMs; } catch { /* gone already */ }
      return { id, m };
    }).sort((a, b) => a.m - b.m || cmp(a.id, b.id));
    for (const g of gone) {
      if (enough()) break;
      const s = sizeOfPack(root, g.id);
      try { fs.unlinkSync(path.join(dir, g.id + '.json')); } catch { continue; }
      tapesTotal -= s; allTotal -= s; removed.add(g.id); upd.delete(g.id); evicted.push(g.id);
    }
  };
  const tapeFail = (t, why) => {
    const ts = tState(t.id);
    if (era === null || ts.lastFailEra !== era) { ts.fails = (Number.isInteger(ts.fails) ? ts.fails : 0) + 1; ts.lastFailEra = era; }
    ts.why = redact(why).slice(0, 200);
    if (ts.fails >= FAIL_PARK) ts.parkedAt = clock();
  };
  let perEra = 0;
  const discover = (t, chosen) => {
    const d = t.discover;
    const most = Math.min(d.max ?? maxDiscover, maxDiscover);
    let mine = 0;
    for (const [, rec] of chosen) {
      for (const u of discoverUrls(rec, d)) {
        if (perEra >= maxDiscover || mine >= most) return;
        const why = urlRefusal(u, allowed);
        if (why) { offList++; if (refused.length < 40) refused.push('discover ' + t.id + ': ' + why); continue; }
        const href = new URL(u).href;
        if (known.has(href)) continue;
        if (reg.tapes.length >= MAX_TAPES) { capHit = true; return; }
        const nid = discoverId(t.id, href);
        if (ids.has(nid)) continue;
        const { discover: nested, ...as } = d.as; // eslint-disable-line no-unused-vars
        const nt = { ...as, id: nid, url: href, ...(typeof t.domain === 'string' ? { domain: t.domain } : {}), from: 'discover:' + t.id, at: stamp(), ...(era !== null ? { era } : {}), expires: clock() + (d.ttlMs ?? TTL_MS) };
        const errs = tapeErrors(nt, allowed);
        if (errs.length) { if (refused.length < 40) refused.push('discover ' + t.id + ': ' + errs[0]); continue; }
        reg.tapes.push(nt);
        known.add(href); ids.add(nid); discovered.push(nid); perEra++; mine++;
      }
    }
  };
  const lastReq = new Map(), hostAcc = new Map();
  const runHost = async (h, queue) => {
    const hs = hState(h), base = baseGap(reg, h);
    const gap = Math.max(base, intIn(hs.gapMs, PER_HOST_MS, MAX_GAP_MS) ? hs.gapMs : base);
    const probing = Number.isFinite(hs.parkedAt);
    const acc = { tries: 0, ok: 0, failed: 0, rate: false, last: '' };
    hostAcc.set(h, acc);
    for (let i = 0; i < queue.length; i++) {
      const t = queue[i], ts = tState(t.id), id = PACK_PREFIX + t.id;
      const prev = readPack(root, id);
      // a pull stopped after the pack and before the registry: the pack says this era is done
      if (era !== null && prev && isObj(prev.tape) && prev.tape.era === era) { unchanged++; ts.lastEra = era; continue; }
      if (bytes >= maxBytes) { left += queue.length - i; spent = true; break; }
      const wait = lastReq.has(h) ? lastReq.get(h) + gap - clock() : 0;
      if (remaining() - Math.max(0, wait) < MIN_FETCH_MS) { left += queue.length - i; break; }
      if (wait > 0) await sleep(wait);
      lastReq.set(h, clock());
      acc.tries++; requests++;
      let got;
      try {
        got = await fetchGet(t.url, { fetch: fetchFn, allowed, timeoutMs: Math.max(1, Math.min(fetchTimeoutMs, remaining())), maxBytes: Math.max(1, Math.min(maxFetchBytes, maxBytes - bytes)), nowMs: clock() });
      } catch (e) {
        if (e instanceof TapeError && e.kind === 'rate') {
          acc.rate = true;
          hs.gapMs = Math.min(MAX_GAP_MS, gap * 2);
          hs.until = Number.isFinite(e.until) ? e.until : clock() + MAX_GAP_MS;
          for (const x of queue.slice(i)) waiting.push(x.id);
          blocked.push(h + ': ' + first(e) + '; its gap is ' + hs.gapMs + ' ms now, asked again after ' + isoSecond(hs.until));
          break;
        }
        acc.failed++; acc.last = first(e);
        if (e instanceof TapeError && e.kind === 'refused') refused.push('tape ' + t.id + ': ' + first(e));
        else blocked.push(redact('tape ' + t.id + ': ' + first(e)));
        tapeFail(t, first(e));
        if (probing) { left += queue.length - i - 1; break; }
        continue;
      }
      bytes += got.bytes.length;
      try {
        let recs;
        try { recs = recordsFrom(got.bytes, t, got.type); } catch (e) { throw new TapeError('body', first(e)); }
        const sel = selectKeys(recs, t, typeof ts.cursor === 'string' ? ts.cursor : null);
        if (!sel.chosen.length) throw new TapeError('body', 'no record with a key (root ' + JSON.stringify(t.root || '') + ', key ' + JSON.stringify(t.key ?? null) + ', ' + recs.length + ' records)');
        acc.ok++;
        const at = stamp();
        const rows = snapshotRows(sel.chosen, t, at);
        const prevSize = sizeOfPack(root, id);
        const want = Math.min(PACK_MAX_BYTES, t.maxBytes ?? TAPE_MAX_BYTES, share);
        const room = () => Math.min(TAPES_MAX_BYTES - (tapesTotal - prevSize), PACKS_MAX_BYTES - (allTotal - prevSize));
        if (room() < want) evictFor(() => room() >= want);
        const out = appendSnapshot(prev, t, rows, { at, era, cap: Math.min(want, room()) });
        Object.assign(ts, { lastAt: clock(), lastEra: era, listed: sel.listed, fails: 0 });
        delete ts.parkedAt; delete ts.why; delete ts.lastFailEra;
        if (!out.pk) { blocked.push('tape ' + t.id + ': ' + out.why); continue; }
        writeAtomic(path.join(dir, id + '.json'), out.text);
        tapesTotal += out.size - prevSize; allTotal += out.size - prevSize;
        upd.set(id, { id, columns: out.pk.columns, rows: out.pk.rows.length, sha: out.pk.sha });
        removed.delete(id);
        written.push(id);
        appended += out.appended; keys += sel.chosen.length; thinned += out.thinned;
        ts.pulls = (Number.isInteger(ts.pulls) ? ts.pulls : 0) + 1;
        if (sel.cursor !== null) ts.cursor = sel.cursor; else delete ts.cursor;
        if (sel.wrapped) ts.cycles = (Number.isInteger(ts.cycles) ? ts.cycles : 0) + 1;
        if (isObj(t.discover)) discover(t, sel.chosen);
      } catch (e) {
        acc.failed++; acc.last = first(e);
        blocked.push(redact('tape ' + t.id + ': ' + first(e)));
        tapeFail(t, first(e));
        if (probing) { left += queue.length - i - 1; break; }
      }
    }
    return acc;
  };
  await Promise.all([...queues.entries()].map(([h, q]) => runHost(h, q)));

  // the hosts: an era with requests and no record fails it; FAIL_PARK in a row park it; a success unparks it
  for (const [h, acc] of hostAcc) {
    const hs = hState(h);
    if (acc.ok > 0) {
      if (Number.isFinite(hs.parkedAt)) unparked.push(h);
      delete hs.parkedAt; delete hs.why; delete hs.lastFailEra; hs.fails = 0;
      if (!acc.rate && Number.isInteger(hs.gapMs)) { const g = Math.floor(hs.gapMs * 0.9); if (g <= baseGap(reg, h)) delete hs.gapMs; else hs.gapMs = g; }
    } else if (acc.failed > 0) {
      if (era === null || hs.lastFailEra !== era) { hs.fails = (Number.isInteger(hs.fails) ? hs.fails : 0) + 1; hs.lastFailEra = era; }
      hs.why = redact(acc.last).slice(0, 200);
      if (hs.fails >= FAIL_PARK) hs.parkedAt = clock();
    }
  }
  for (const hs of Object.values(st.hosts)) if (isObj(hs) && Number.isFinite(hs.until) && hs.until <= clock()) delete hs.until;
  const parked = [
    ...Object.entries(st.hosts).filter(([, x]) => isObj(x) && Number.isFinite(x.parkedAt)).map(([h, x]) => h + ': ' + (x.why || 'failed') + ' (' + x.fails + ' eras in a row; parked ' + isoSecond(x.parkedAt) + ')'),
    ...Object.entries(st.tapes).filter(([, x]) => isObj(x) && Number.isFinite(x.parkedAt)).map(([id, x]) => 'tape ' + id + ': ' + (x.why || 'failed') + ' (' + x.fails + ' eras in a row; parked ' + isoSecond(x.parkedAt) + ')'),
  ];
  if (capHit) blocked.push('discover: the registry holds ' + MAX_TAPES + ' tapes, the most it may');
  if (spent) blocked.push('pull: the byte budget of ' + maxBytes + ' is spent; the rest wait for the next pull');
  if (left) blocked.push('pull: the time budget of ' + maxMs + ' ms is spent; ' + left + ' tapes wait for the next pull');

  // neo/know/INDEX.json: the other packs' entries kept, the tape packs written or removed, a pack the index lacks added
  const map = new Map(readIndex(root).packs.filter((p) => !removed.has(p.id)).map((p) => [p.id, p]));
  for (const [id, e] of upd) map.set(id, e);
  for (const id of tapeFiles(root)) {
    if (map.has(id)) continue;
    const p = readPack(root, id);
    if (p) map.set(id, { id, columns: p.columns, rows: p.rows.length, sha: typeof p.sha === 'string' ? p.sha : sha256(JSON.stringify(p.rows)) });
  }
  const idxFile = path.join(root, ...INDEX.split('/'));
  let oldIdx = null;
  try { oldIdx = fs.readFileSync(idxFile, 'utf8'); } catch { oldIdx = null; }
  const idxText = JSON.stringify({ packs: [...map.values()].sort((a, b) => cmp(a.id, b.id)) }, null, 2) + '\n';
  if (idxText !== oldIdx && (map.size || oldIdx !== null)) writeAtomic(idxFile, idxText);
  // neo/tapes.json, only when it changed
  const regFile = path.join(root, ...TAPES.split('/'));
  let oldReg = null;
  try { oldReg = fs.readFileSync(regFile, 'utf8'); } catch { oldReg = null; }
  const regText = JSON.stringify(reg, null, 1) + '\n';
  if (regText !== oldReg) writeAtomic(regFile, regText);
  return {
    tapes: reg.tapes.length, due, pulled: written.length, unchanged, waiting: waiting.length, left, rows: appended, keys, thinned,
    packs: written.slice(0, 60), discovered: discovered.slice(0, 40), retired, evicted: evicted.slice(0, 40), offList, refused: refused.slice(0, 20),
    parked: parked.slice(0, 40), parkedTapes, ...(unparked.length ? { unparked } : {}), blocked: blocked.slice(0, 40), requests, bytes,
    ms: Math.max(0, clock() - t0), ...(created ? { created: true } : {}), ...(era === null ? {} : { era }),
  };
}

/**
 * status: { tapes, packs, rows, bytes, keys, keys2, parked, list }: what the tape packs hold; keys2 counts the keys with
 * at least two snapshots (a key seen twice is a series).
 */
export function status(root = DEFAULT_ROOT) {
  let reg = null;
  try { reg = JSON.parse(fs.readFileSync(path.join(root, ...TAPES.split('/')), 'utf8')); } catch { reg = null; }
  const list = [];
  let rows = 0, bytes = 0, keys = 0, keys2 = 0;
  for (const p of readIndex(root).packs) {
    if (!p.id.startsWith(PACK_PREFIX)) continue;
    const pk = readPack(root, p.id);
    if (!pk) continue;
    const ti = pk.columns.indexOf('time');
    if (ti < 0) continue;
    const per = new Map();
    for (const r of pk.rows) { if (!per.has(r[0])) per.set(r[0], new Set()); per.get(r[0]).add(r[ti]); }
    const k2 = [...per.values()].filter((s) => s.size >= 2).length;
    const size = sizeOfPack(root, p.id);
    list.push({ id: p.id, rows: pk.rows.length, snapshots: new Set(pk.rows.map((r) => r[ti])).size, keys: per.size, keys2: k2, bytes: size });
    rows += pk.rows.length; bytes += size; keys += per.size; keys2 += k2;
  }
  const st = isObj(reg) && isObj(reg.state) ? reg.state : {};
  const parked = isObj(st.hosts) ? Object.entries(st.hosts).filter(([, x]) => isObj(x) && Number.isFinite(x.parkedAt)).map(([h, x]) => h + ': ' + (x.why || 'failed')) : [];
  return { tapes: isObj(reg) && Array.isArray(reg.tapes) ? reg.tapes.length : 0, packs: list.length, rows, bytes, keys, keys2, parked, list };
}

// ---- the CLI
const VALUE = new Set(['root', 'max-ms', 'era', 'fetch-timeout-ms', 'max-fetch-bytes', 'max-bytes', 'max-discover']);
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
function intOf(flags, name, lo, hi, dflt) {
  if (flags[name] === undefined) return dflt;
  const v = Number(flags[name]);
  if (!Number.isInteger(v) || v < lo || v > hi) throw new Fail('--' + name + ' is an integer from ' + lo + ' to ' + hi + ', not ' + flags[name], 2);
  return v;
}
/** The CLI as a function: the printed object, or { usage: true }. o.fetch, o.clock, o.sleep replace the network and time. */
export async function main(argv, o = {}) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  if (pos.length) throw new Fail('one verb, no other word: ' + pos.join(' ') + ' (see --help)', 2);
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  // a root that is not there is a typo, never a new tree to fill from the network
  let isDir = false;
  try { isDir = fs.statSync(root).isDirectory(); } catch { isDir = false; }
  if (!isDir) throw new Fail('--root ' + root + ' is not a directory', 2);
  if (verb === 'pull') {
    return await pull(root, {
      ...o,
      maxMs: intOf(flags, 'max-ms', 1, LIMITS.maxMs, DEFAULTS.maxMs),
      fetchTimeoutMs: intOf(flags, 'fetch-timeout-ms', 1, LIMITS.fetchTimeoutMs, DEFAULTS.fetchTimeoutMs),
      maxFetchBytes: intOf(flags, 'max-fetch-bytes', 1, LIMITS.maxFetchBytes, DEFAULTS.maxFetchBytes),
      maxBytes: intOf(flags, 'max-bytes', 1, LIMITS.maxBytes, DEFAULTS.maxBytes),
      maxDiscover: intOf(flags, 'max-discover', 0, LIMITS.maxDiscover, DEFAULTS.maxDiscover),
      era: intOf(flags, 'era', 0, Number.MAX_SAFE_INTEGER, null),
    });
  }
  if (verb === 'status') return status(root);
  throw new Fail('unknown verb ' + verb + ': pull or status (--help)', 2);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    const coded = e instanceof Error && Number.isInteger(e.code);
    process.stderr.write(redact(coded ? e.message : 'tape failed: ' + ((e && e.stack) || e)).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
