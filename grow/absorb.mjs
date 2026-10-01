#!/usr/bin/env node
// grow/absorb.mjs: ABSORB (grow/NEO.md, "Order 7: always burning"), the growing side of the hold over the internet.
// His words (2026-10-01, verbatim at the head of NEO.md): "always burning, processing and scraping billioons of packets a
// second and abasorbing data so it constantly iterates in the cloud"; "All native btw, its ai data center in ur pocket,
// none of that ollama crap". The absorber pulls open, structured data (CSV, JSON, JSON lines) that neo/sources.json names
// and turns it, with NO model call, into TASKS in the teacher's own format (grow/teach.mjs), so the NEO engine
// (grow/neo.mjs) always has something new to learn. A source's `kind` names an ADAPTER, a pure function
// (bytes, make) -> [{ task, skill, domain, rule, rows: [{ q, expect, answer, split }] }]. Bytes pulled from the network are
// DATA: parsed as text into rows, never evaluated, never imported, never followed as instructions. Hosts are an ALLOWLIST
// (ALLOWED_HOSTS) checked on the parsed URL before a socket opens and again on every redirect hop. A source that cannot be
// fetched is a blocked line and the cursor still moves (the registry is a ring). It reads neo/sources.json, neo/ABSORB.json
// and neo/LEDGER.json, writes neo/ABSORB.json and work/grow/gen-<n>/teach/<task>/, and never opens state/, judge/heldout/,
// judge/control.jsonl or any neo/tasks/*/heldout.jsonl. Success prints ONE JSON line; a failure one stderr line and a
// non-zero exit (2: usage).
//   node grow/absorb.mjs pull [--gen <n>] [--max-sources 4] [--max-bytes 8000000] [--max-ms 60000] [--fetch-timeout-ms 20000]
//   node grow/absorb.mjs status                                     [--root <dir>] on every verb
// Author: Opus 5.5 builder (ABSORB) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FORBIDDEN } from './contract.mjs';
import { nextGeneration, redact, DEFAULT_ROOT } from './generation.mjs';
import { TASK_RE, MIN_ROWS, OPENED_MARK, REFUSED_MARK, normQ, shaText, rowErrors, readLedger, lockedClasses, validateTaskDir } from './teach.mjs';
import { expectOk } from '../judge/judge.mjs';

/** The only hosts a source, or any redirect hop of it, may name. */
export const ALLOWED_HOSTS = Object.freeze(['raw.githubusercontent.com']);
export const SOURCES = 'neo/sources.json';
export const ABSORB = 'neo/ABSORB.json';
export const DEFAULTS = Object.freeze({ maxSources: 4, maxBytes: 8000000, maxMs: 60000, fetchTimeoutMs: 20000 });
export const LIMITS = Object.freeze({ maxSources: 256, maxBytes: 256000000, maxMs: 86400000, fetchTimeoutMs: 600000 });
/** A prompt longer than this is never emitted (NEO.md). */
export const MAX_Q = 300;
export const MAX_ANSWER = 600;
/** A field longer than this is not an entity or a value (prose, a blob): never asked. */
export const MAX_VALUE = 120;
export const MAX_REDIRECTS = 3;
/** Prompt templates a relation needs at the least: the dev set and the held-out set never share one. */
export const MIN_TEMPLATES = 3;
/** Rows a task gets by default (a source's make.caps may raise them up to CAP_MAX). */
export const CAPS = Object.freeze({ dev: 100, heldout: 50 });
export const CAP_MAX = Object.freeze({ dev: 400, heldout: 200 });
/** A base task name; a taken name gets "-<6 hex of the source sha256>", which keeps it inside TASK_RE's 41. */
export const MAX_BASE = 34;
export const BLOCKED_KEEP = 200;
export const PAIR_TASKS = Object.freeze(['larger', 'smaller', 'compare', 'sum']);
export const NUMERIC_TASKS = Object.freeze(['value', ...PAIR_TASKS]);
export const MEMBER_TASKS = Object.freeze(['member', 'which']);
export const ID_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;
/** The text formats a source may be read as (make.format; the adapter's own default otherwise). */
export const FORMATS = Object.freeze(['csv', 'tsv', 'json', 'jsonl']);
export const USAGE = [
  'usage: node grow/absorb.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  pull [--gen <n>] [--max-sources ' + DEFAULTS.maxSources + '] [--max-bytes ' + DEFAULTS.maxBytes + '] [--max-ms ' + DEFAULTS.maxMs + '] [--fetch-timeout-ms ' + DEFAULTS.fetchTimeoutMs + ']',
  '      the next sources after the cursor of ' + ABSORB + ': fetch, adapt, split, write work/grow/gen-<n>/teach/<task>/',
  '  status                                     { sources, domains, pulled, bytes, rows, tasks, cursor }',
].join('\n');

class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const first = (e) => String((e && e.message) || e).split('\n')[0];
const posix = (p) => p.split(path.sep).join('/');
const words = (s) => typeof s === 'string' && s.trim().length > 0;
const lc = (s) => String(s).toLowerCase();
const writeJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const readJsonOr = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
/** sha256 hex of bytes or a text. */
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');
/** How two entity names are told apart: the teacher's norm level 1, else trimmed lower case. */
export const normKey = (s) => normQ(s) || String(s).trim().toLowerCase();

// ---- the network: an allowlist, checked before any socket and on every redirect hop
/**
 * Why a URL may not be fetched, or '' when it may: https only, a host of ALLOWED_HOSTS, no credentials, the default port.
 * @param {string} u
 * @returns {string}
 */
export function urlRefusal(u) {
  let x;
  try { x = new URL(String(u)); } catch { return 'not a URL: ' + String(u).slice(0, 80); }
  if (x.protocol !== 'https:') return 'not https (' + x.protocol + ')';
  if (x.username || x.password) return 'a URL with credentials is refused';
  if (x.port) return 'a non-default port is refused (' + x.port + ')';
  if (!ALLOWED_HOSTS.includes(x.hostname.toLowerCase())) return 'the host ' + x.hostname + ' is not in ALLOWED_HOSTS';
  return '';
}

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
      if (n > max) { try { await reader.cancel(); } catch { /* the stream is dropped either way */ } throw new Error('over the byte budget: more than ' + max + ' bytes'); }
      parts.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
    }
    return Buffer.concat(parts, n);
  }
  const b = Buffer.from(await res.arrayBuffer());
  if (b.length > max) throw new Error('over the byte budget: ' + b.length + ' bytes, ' + max + ' left');
  return b;
}

/**
 * GET one URL with the allowlist on every hop (redirects are followed by hand, at most MAX_REDIRECTS, each hop checked
 * BEFORE it is fetched), a time budget and a byte budget. Only status 200 is data. The bytes are returned, never run.
 * @param {string} url
 * @param {{ fetch?: Function, timeoutMs?: number, maxBytes?: number }} o
 * @returns {Promise<{ bytes: Buffer, url: string, hops: number }>}
 */
export async function fetchBytes(url, { fetch: fetchFn = globalThis.fetch, timeoutMs = DEFAULTS.fetchTimeoutMs, maxBytes = DEFAULTS.maxBytes } = {}) {
  if (typeof fetchFn !== 'function') throw new Error('no fetch in this runtime');
  const ac = new AbortController();
  let timer = null;
  const expired = new Promise((resolve, reject) => { timer = setTimeout(() => { ac.abort(); reject(new Error('timed out after ' + timeoutMs + ' ms')); }, timeoutMs); });
  expired.catch(() => { /* raced below */ });
  const race = (p) => Promise.race([p, expired]);
  try {
    let cur = String(url);
    for (let hop = 0; ; hop++) {
      const why = urlRefusal(cur);
      if (why) throw new Error((hop ? 'redirect refused before the fetch: ' : 'refused before the fetch: ') + why);
      // the URL the check parsed is the URL fetched: no second parser ever reads the raw text
      cur = new URL(cur).href;
      const res = await race(fetchFn(cur, { redirect: 'manual', signal: ac.signal, headers: { accept: '*/*', 'user-agent': 'dilation-brain-absorb' } }));
      const get = (h) => (res && res.headers && typeof res.headers.get === 'function' ? res.headers.get(h) : null);
      if (!res || !Number.isInteger(res.status)) throw new Error('the fetch returned no response');
      // a runtime that followed a redirect by itself reports where it landed: that place is checked too
      if (typeof res.url === 'string' && res.url && urlRefusal(res.url)) throw new Error('refused after the fetch: the response came from ' + urlRefusal(res.url));
      if (REDIRECT.has(res.status)) {
        const loc = get('location');
        if (!loc) throw new Error('HTTP ' + res.status + ' with no location');
        if (hop >= MAX_REDIRECTS) throw new Error('more than ' + MAX_REDIRECTS + ' redirects');
        try { if (res.body && typeof res.body.cancel === 'function') await res.body.cancel(); } catch { /* nothing to read */ }
        try { cur = new URL(loc, cur).href; } catch { throw new Error('HTTP ' + res.status + ' to a location that is not a URL'); }
        continue;
      }
      if (res.status !== 200) throw new Error('HTTP ' + res.status);
      const len = Number(get('content-length'));
      if (get('content-length') !== null && Number.isFinite(len) && len > maxBytes) throw new Error('over the byte budget: ' + len + ' bytes, ' + maxBytes + ' left');
      const bytes = await race(readCapped(res, maxBytes));
      return { bytes, url: cur, hops: hop };
    }
  } finally { clearTimeout(timer); }
}

// ---- parsing: text into records (a parser reads characters; nothing in the bytes is ever run)
/** The text of fetched bytes: UTF-8 (a bad byte becomes U+FFFD), a byte order mark dropped. A string passes through. */
export const decode = (bytes) => (typeof bytes === 'string' ? bytes : new TextDecoder('utf-8').decode(bytes)).replace(/^﻿/, '');

/**
 * RFC 4180 CSV: quoted fields (a quote opens only at the start of a field, "" inside is one quote), CRLF or LF, a
 * delimiter of choice. Blank lines are dropped.
 * @returns {string[][]}
 */
export function parseCsv(text, delim = ',') {
  const s = String(text ?? '');
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c;
      continue;
    }
    if (c === '"' && field === '') { q = true; continue; }
    if (c === delim) { row.push(field); field = ''; continue; }
    if (c === '\r' && s[i + 1] === '\n') continue;
    if (c === '\n' || c === '\r') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

/** JSON lines: every non-blank line that parses; a text with lines and none that parses is not JSON lines. */
export function jsonLines(text) {
  const out = [];
  let lines = 0;
  for (const l of String(text ?? '').split(/\r?\n/)) {
    if (!l.trim()) continue;
    lines++;
    try { out.push(JSON.parse(l)); } catch { /* a bad line is skipped, never guessed */ }
  }
  if (lines && !out.length) throw new Error('neither JSON nor JSON lines');
  return out;
}

/** The value at a dotted path ("name.common", "capital.0", "$key"); own properties only. '' is the value itself. */
export function getPath(o, p) {
  if (p === '' || p === undefined || p === null) return o;
  let cur = o;
  for (const seg of String(p).split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    if (Array.isArray(cur)) { if (!/^\d+$/.test(seg)) return undefined; cur = cur[Number(seg)]; continue; }
    if (!own(cur, seg)) return undefined;
    cur = cur[seg];
  }
  return cur;
}

/**
 * The records of a source: CSV (or TSV) rows as objects keyed by the header (make.columns names a headerless file; a
 * cell "\N" is empty), or a JSON document / JSON lines, the array at make.root (make.entries turns an object into
 * [{ $key, ...value }]; a scalar element becomes { $: element }). Then make.explode (one record per element of an array
 * field), make.where ({ path: value | [values] }, exact) and make.match ({ path: regex source }).
 * @returns {object[]}
 */
export function recordsOf(text, make = {}, dflt = 'json') {
  const fmt = make.format || dflt;
  let recs;
  if (fmt === 'csv' || fmt === 'tsv') {
    const rows = parseCsv(text, typeof make.delimiter === 'string' && make.delimiter.length === 1 ? make.delimiter : fmt === 'tsv' ? '\t' : ',');
    const head = Array.isArray(make.columns) ? make.columns.map(String) : (rows.shift() || []).map((h) => h.trim());
    recs = rows.map((r) => { const o = {}; head.forEach((h, i) => { o[h] = r[i] === undefined || r[i] === '\\N' ? '' : r[i]; }); return o; });
  } else {
    let doc;
    if (fmt === 'jsonl') doc = jsonLines(text);
    else { try { doc = JSON.parse(text); } catch { doc = jsonLines(text); } }
    let at = make.root ? getPath(doc, make.root) : doc;
    if (make.entries) {
      if (!isObj(at)) throw new Error('entries: the value at ' + JSON.stringify(make.root || '') + ' is not an object');
      at = Object.entries(at).map(([k, v]) => (isObj(v) ? { ...v, $key: k } : { $key: k, $value: v }));
    }
    if (!Array.isArray(at)) throw new Error('the value at ' + JSON.stringify(make.root || '') + ' is not an array');
    recs = at.map((v) => (isObj(v) ? v : { $: v }));
  }
  if (make.explode) {
    const f = String(make.explode);
    recs = recs.flatMap((r) => (Array.isArray(r[f]) ? r[f].map((x) => ({ ...r, [f]: x })) : [r]));
  }
  if (isObj(make.where)) {
    for (const [p, v] of Object.entries(make.where)) {
      const want = (Array.isArray(v) ? v : [v]).map(String);
      recs = recs.filter((r) => { const x = getPath(r, p); return want.includes(x === undefined || x === null ? '' : String(x)); });
    }
  }
  if (isObj(make.match)) {
    for (const [p, src] of Object.entries(make.match)) {
      const re = new RegExp(String(src));
      recs = recs.filter((r) => { const x = getPath(r, p); return x !== undefined && x !== null && re.test(String(x)); });
    }
  }
  return recs;
}

/**
 * A field as entity text, or null: a string (control characters to spaces, runs of space collapsed, trimmed) or a
 * finite number; never empty, never over MAX_VALUE characters, never with an angle bracket (markup is not a fact).
 */
export function clean(v) {
  let s;
  if (typeof v === 'number') { if (!Number.isFinite(v)) return null; s = String(v); if (/e/i.test(s)) return null; }
  else if (typeof v === 'string') s = v.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim();
  else return null;
  if (!s || s.length > MAX_VALUE || /[<>]/.test(s)) return null;
  return s;
}

/** A field through spec.valueMap (only a mapped value survives when a map is given). */
export function mapped(raw, spec = {}) {
  if (!isObj(spec.valueMap)) return raw;
  const k = String(raw);
  return own(spec.valueMap, k) ? spec.valueMap[k] : null;
}

/** The entity text of a record: a path, or a template of paths ("{city}, {state}"); null when any part is missing. */
export function keyOf(rec, spec) {
  if (typeof spec !== 'string' || !spec) return null;
  if (!spec.includes('{')) return clean(getPath(rec, spec));
  let miss = false;
  const s = spec.replace(/\{([^{}]+)\}/g, (m, p) => { const v = clean(getPath(rec, p)); if (v === null) miss = true; return v ?? ''; });
  return miss ? null : clean(s);
}

/** One pass over a template: {name} becomes vars[name]; a value is never scanned again. */
export const render = (tpl, vars) => String(tpl).replace(/\{(\w+)\}/g, (m, k) => (own(vars, k) ? String(vars[k]) : m));

/** "A", "A and B", "A, B and C". */
export const listAnd = (xs) => (xs.length < 2 ? String(xs[0] ?? '') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
/** "A or B", "A, B or C". */
export const listOr = (xs) => (xs.length < 2 ? String(xs[0] ?? '') : xs.slice(0, -1).join(', ') + ' or ' + xs[xs.length - 1]);

/** A number as plain digits ("1,234" and "1234.50" become 1234 and 1234.5), or null; a value with an exponent is not read. */
export function numOf(v) {
  let s;
  if (typeof v === 'number') { if (!Number.isFinite(v)) return null; s = String(v); }
  else if (typeof v === 'string') { s = v.trim(); if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, ''); }
  else return null;
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || Math.abs(n) >= 1e15) return null;
  const dec = Math.min(10, s.includes('.') ? s.split('.')[1].length : 0);
  return { n, dec, s: fmtNum(n, dec) };
}
/** n with at most dec decimals, trailing zeros dropped, never "-0". */
export function fmtNum(n, dec) {
  let s = n.toFixed(dec);
  if (dec > 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return /^-0$/.test(s) ? '0' : s;
}

// ---- the split plan: different templates over disjoint entities, and the same entities under another template
/** Entities in a fixed order: sorted by the sha256 of the task and the entity (the same input, the same order). */
export function shaOrder(task, keys) {
  return [...keys].map((k) => [sha256(task + '\u0000' + (Array.isArray(k) ? k.join('\u0000') : k)), k]).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map((e) => e[1]);
}
/** The templates the dev set uses and the ones only the held-out set uses (a third, at least one; never shared). */
export function templateSplit(templates) {
  const k = templates.length;
  const hk = Math.max(1, Math.floor(k / 3));
  return { dev: templates.slice(0, k - hk), held: templates.slice(k - hk) };
}
/**
 * One entity an item: H (held-out only, never in the dev set), D (the dev set) and S (the first |H| of D, asked again in
 * the held-out set under a held-out template): the held-out set is half new entities, half known ones in new words.
 */
export function planSingle(task, keys, caps = CAPS) {
  const order = shaOrder(task, keys);
  const nH = Math.min(Math.floor(caps.heldout / 2), Math.floor(order.length / 5));
  const D = order.slice(nH, nH + caps.dev);
  return { H: order.slice(0, nH), D, S: D.slice(0, nH) };
}
/** Ordered pairs (a, b) of a list, a != b, by sweeps of growing distance, kept by keep(a, b), at most max. */
export function orderedPairs(list, keep, max) {
  const out = [], n = list.length;
  for (let s = 1; s < n && out.length < max; s++) for (let i = 0; i < n && out.length < max; i++) { const a = list[i], b = list[(i + s) % n]; if (keep(a, b)) out.push([a, b]); }
  return out;
}
/** Two entities an item: H pairs only of held-out entities, D pairs only of dev entities, S the first |H| of D again. */
export function planPairs(task, keys, caps = CAPS, keep = () => true) {
  const order = shaOrder(task, keys);
  const h = Math.max(3, Math.min(12, Math.floor(order.length / 5)));
  const H = orderedPairs(order.slice(0, h), keep, Math.floor(caps.heldout / 2));
  const D = orderedPairs(order.slice(h), keep, caps.dev);
  return { H, D, S: D.slice(0, H.length) };
}
function planRows(plan, tpl, rowOf) {
  const out = [];
  plan.D.forEach((k, i) => out.push(rowOf(k, tpl.dev[i % tpl.dev.length], 'dev')));
  plan.H.forEach((k, i) => out.push(rowOf(k, tpl.held[i % tpl.held.length], 'heldout')));
  plan.S.forEach((k, i) => out.push(rowOf(k, tpl.held[(i + 1) % tpl.held.length], 'heldout')));
  return out.filter(Boolean);
}
const capsOf = (make) => {
  const c = isObj(make.caps) ? make.caps : {};
  const pick = (k) => (Number.isInteger(c[k]) && c[k] >= 1 ? Math.min(c[k], CAP_MAX[k]) : CAPS[k]);
  return { dev: pick('dev'), heldout: pick('heldout') };
};

// ---- rows
/**
 * What keeps a row out of a task: the teacher's rowErrors (the shape, the expect, an answer that fails its own expect,
 * a refusal, a grow/contract.mjs FORBIDDEN pattern in q or answer), a prompt over MAX_Q, an answer over MAX_ANSWER, and
 * an expect that an echo of the prompt already passes (a row any parrot passes is no test).
 * @returns {string[]}
 */
export function rowProblems(r) {
  const out = rowErrors(r);
  if (isObj(r) && !out.length) {
    if (!expectOk(r.answer, r.expect)) out.push('the answer fails its own expect');
    if (r.q.length > MAX_Q) out.push('q is over ' + MAX_Q + ' characters');
    if (r.answer.length > MAX_ANSWER) out.push('answer is over ' + MAX_ANSWER + ' characters');
    if (expectOk(r.q, r.expect)) out.push('an echo of the prompt passes the expect');
    // the whole row, expect included: a kept cell carries its rows as code text that validateCell reads
    const text = JSON.stringify([r.q, r.answer, r.expect]);
    for (const [re, what] of FORBIDDEN) if (re.test(text)) out.push('the row uses ' + what + ' (grow/contract.mjs FORBIDDEN)');
  }
  return out;
}
const keepRows = (rows) => rows.filter((r) => rowProblems(r).length === 0);
const taskOf = (task, make, rule, rows) => ({ task, skill: task, domain: words(make.domain) ? make.domain : null, rule, rows: keepRows(rows) });
const row = (q, answer, expect, split) => ({ q, expect: { ...expect, notRefusal: true }, answer, split });
/** notContains for the names a right answer must not hold: those it does not hold and that are not inside the right name. */
const notOf = (right, others, answer) => others.filter((o) => !lc(right).includes(lc(o)) && !lc(answer).includes(lc(o)));
const article = (noun) => (/^[aeiou]/i.test(noun) ? 'an' : 'a');

/** Entities of a relation: key -> value, a key with two different values dropped (an ambiguous question is never asked). */
function relationMap(recs, keySpec, valueOf) {
  const seen = new Map(), bad = new Set();
  for (const r of recs) {
    const k = keyOf(r, keySpec);
    const v = valueOf(r);
    if (k === null || v === null) continue;
    const kk = normKey(k), vk = Array.isArray(v) ? v.map(normKey).sort().join('\u0000') : isObj(v) ? String(v.s) : normKey(v);
    if (!kk) continue;
    if (seen.has(kk)) { if (seen.get(kk).vk !== vk) bad.add(kk); continue; }
    seen.set(kk, { k, v, vk });
  }
  const out = new Map();
  for (const [kk, e] of seen) if (!bad.has(kk)) out.set(e.k, e.v);
  return out;
}
function relValueOf(rel) {
  return (r) => {
    const raw = mapped(getPath(r, rel.value), rel);
    if (Array.isArray(raw)) {
      const xs = [...new Map(raw.map(clean).filter((x) => x !== null).map((x) => [normKey(x), x])).values()];
      if (rel.many === 'all') return xs.length && xs.length <= (Number.isInteger(rel.maxMany) ? rel.maxMany : 4) ? xs : null;
      return xs.length === 1 ? xs[0] : null;
    }
    return clean(raw);
  };
}
function relTask(spec, ents, make, rule) {
  const tpl = templateSplit(spec.templates);
  const plan = planSingle(spec.task, [...ents.keys()], capsOf(make));
  const rowOf = (k, t, split) => {
    const v = ents.get(k);
    const value = Array.isArray(v) ? listAnd(v) : v;
    const answer = render(spec.answer, { key: k, value });
    return row(render(t, { key: k }), answer, spec.expect === 'equals' ? { equals: answer } : { contains: Array.isArray(v) ? v : [v] }, split);
  };
  return taskOf(spec.task, make, words(spec.rule) ? spec.rule : rule, planRows(plan, tpl, rowOf));
}

/** The reverse direction's templates when a relation names none: {kl} and {vl} are the labels, {key} the asked value. */
export const REVERSE_TEMPLATES = Object.freeze(['which {kl} has the {vl} {key}', 'name the {kl} whose {vl} is {key}', '{key} is the {vl} of which {kl}', 'tell me the {kl} with the {vl} {key}']);
export const REVERSE_ANSWER = 'The {kl} whose {vl} is {key} is {value}.';
const labelsOf = (rel) => ({ kl: words(rel.keyLabel) ? rel.keyLabel : String(rel.key), vl: words(rel.valueLabel) ? rel.valueLabel : String(rel.value) });
/** A label placed once into a template; {key} and {value} stay for the row. */
const labelled = (t, L) => String(t).replace(/\{(kl|vl)\}/g, (m, k) => L[k]);
/**
 * The reverse spec of a relation (every relation has both directions): rel.reverse's own fields over the defaults
 * (task <task>-rev, REVERSE_TEMPLATES, REVERSE_ANSWER, contains).
 */
export function reverseOf(rel) {
  const r = isObj(rel.reverse) ? rel.reverse : {};
  const L = labelsOf(rel);
  return {
    task: words(r.task) ? r.task : String(rel.task) + '-rev',
    templates: (Array.isArray(r.templates) ? r.templates : REVERSE_TEMPLATES).map((t) => labelled(t, L)),
    answer: labelled(words(r.answer) ? r.answer : REVERSE_ANSWER, L),
    expect: r.expect === 'equals' ? 'equals' : 'contains',
    ...(words(r.rule) ? { rule: r.rule } : {}),
  };
}

/**
 * csv-relation and json-relation: make.relations [{ key, value, task, templates (>= MIN_TEMPLATES, {key}), answer
 * ({key}, {value}), expect ('contains' | 'equals'), many, valueMap, rule, keyLabel, valueLabel, reverse: { task,
 * templates, answer, expect, rule } }]. One task per relation and per DIRECTION: the forward task asks the key and
 * answers the value; the reverse task asks the value (a single value only) and answers the key. A key with two values,
 * or a value two keys share, is never asked in that direction (an ambiguous question has no one answer).
 */
export function relationTasks(recs, make) {
  const out = [];
  for (const rel of Array.isArray(make.relations) ? make.relations : []) {
    const rev = reverseOf(rel);
    for (const spec of [rel, rev]) if (!Array.isArray(spec.templates) || spec.templates.length < MIN_TEMPLATES) throw new Error((spec.task || 'a relation') + ' has under ' + MIN_TEMPLATES + ' templates');
    const vOf = relValueOf(rel);
    const { kl, vl } = labelsOf(rel);
    out.push(relTask(rel, relationMap(recs, rel.key, vOf), make, 'The answer is the ' + vl + ' the source lists for the ' + kl + ' the prompt names.'));
    // the reverse direction: the forward value is asked (a scalar only), the forward key is the answer
    const ents = relationMap(recs.map((r) => ({ k: keyOf(r, rel.key), v: vOf(r) })).filter((x) => x.k !== null && typeof x.v === 'string'), 'v', (x) => x.k);
    out.push(relTask(rev, ents, make, 'The answer is the ' + kl + ' the source lists for the ' + vl + ' the prompt names.'));
  }
  return out;
}

export const NUM_TEMPLATES = Object.freeze({
  value: ['what is the {noun} of {a}', 'give the {noun} of {a}', 'tell me the {noun} of {a}', 'state the {noun} of {a}'],
  larger: ['which has the larger {noun}, {a} or {b}', 'between {a} and {b}, which has the greater {noun}', 'whose {noun} is larger: {a} or {b}', '{a} or {b}: which one has the higher {noun}'],
  smaller: ['which has the smaller {noun}, {a} or {b}', 'between {a} and {b}, which has the lesser {noun}', 'whose {noun} is smaller: {a} or {b}', '{a} or {b}: which one has the lower {noun}'],
  compare: ['compare the {noun} of {a} and {b}', 'how does the {noun} of {a} compare with that of {b}', '{a} versus {b}: compare their {noun}', 'contrast the {noun} of {a} with the {noun} of {b}'],
  sum: ['what is the sum of the {noun} of {a} and {b}', 'add the {noun} of {a} to the {noun} of {b}', 'the {noun} of {a} plus the {noun} of {b} makes what', 'what do the {noun} of {a} and of {b} add up to'],
});
export const NUM_ANSWERS = Object.freeze({
  value: 'The {noun} of {a} is {va}{unit}.',
  larger: '{win} has the larger {noun} ({vwin}{unit} against {vlose}{unit}).',
  smaller: '{win} has the smaller {noun} ({vwin}{unit} against {vlose}{unit}).',
  compare: 'The {noun} of {a} is {va}{unit} and that of {b} is {vb}{unit}, so {big} has the larger {noun}.',
  sum: 'The {noun} of {a} ({va}) plus that of {b} ({vb}) is {sum}{unit}.',
});
const NUM_RULES = Object.freeze({
  value: 'The answer is the {noun} the source lists for the entity the prompt names.',
  larger: 'The answer names which of the two entities in the prompt has the larger {noun} in the source.',
  smaller: 'The answer names which of the two entities in the prompt has the smaller {noun} in the source.',
  compare: 'The answer states the {noun} of both entities in the prompt and which one is larger, from the source.',
  sum: 'The answer is the sum of the {noun} the source lists for the two entities in the prompt.',
});
/** A numeric task's name: the base for value, base-<which> for the others. */
export const numTaskName = (base, which) => (which === 'value' ? base : base + '-' + which);

/**
 * csv-numeric and json-numeric: make.numerics [{ key (or make.key), value, noun, unit, task (the base), tasks (a subset
 * of NUMERIC_TASKS), templates: { <which>: [..] }, answers: { <which>: '..' } }]: ask the value, compare two entities,
 * the larger, the smaller, the sum of two. A tie is never asked as larger, smaller or compare.
 */
export function numericTasks(recs, make) {
  const out = [];
  for (const spec of Array.isArray(make.numerics) ? make.numerics : []) {
    const ents = relationMap(recs, spec.key || make.key, (r) => numOf(mapped(getPath(r, spec.value), spec)));
    const vars = { noun: spec.noun, unit: spec.unit ? ' ' + spec.unit : '' };
    for (const which of Array.isArray(spec.tasks) ? spec.tasks : NUMERIC_TASKS) {
      const templates = isObj(spec.templates) && Array.isArray(spec.templates[which]) ? spec.templates[which] : NUM_TEMPLATES[which];
      if (!templates || templates.length < MIN_TEMPLATES) throw new Error(numTaskName(spec.task, which) + ' has under ' + MIN_TEMPLATES + ' templates');
      const ans = isObj(spec.answers) && typeof spec.answers[which] === 'string' ? spec.answers[which] : NUM_ANSWERS[which];
      const name = numTaskName(spec.task, which);
      const tpl = templateSplit(templates);
      const caps = capsOf(make);
      let rows;
      if (which === 'value') {
        rows = planRows(planSingle(name, [...ents.keys()], caps), tpl, (a, t, split) => {
          const va = ents.get(a).s;
          return row(render(t, { ...vars, a }), render(ans, { ...vars, a, va }), { contains: [va] }, split);
        });
      } else {
        const keep = which === 'sum' ? () => true : (a, b) => ents.get(a).n !== ents.get(b).n;
        rows = planRows(planPairs(name, [...ents.keys()], caps, keep), tpl, ([a, b], t, split) => {
          const A = ents.get(a), B = ents.get(b);
          const big = A.n > B.n ? a : b, small = big === a ? b : a;
          const win = which === 'smaller' ? small : big, lose = win === a ? b : a;
          const sum = fmtNum(A.n + B.n, Math.max(A.dec, B.dec));
          const v = { ...vars, a, b, va: A.s, vb: B.s, big, win, lose, vwin: ents.get(win).s, vlose: ents.get(lose).s, sum };
          const answer = render(ans, v);
          const expect = which === 'sum' ? { contains: [sum] }
            : which === 'compare' ? { contains: [A.s, B.s, big] }
            : (() => { const nc = notOf(win, [lose], answer); return { contains: [win], ...(nc.length ? { notContains: nc } : {}) }; })();
          return row(render(t, v), answer, expect, split);
        });
      }
      out.push(taskOf(name, make, render(NUM_RULES[which], vars), rows));
    }
  }
  return out;
}

export const MEMBER_TEMPLATES = Object.freeze({
  member: ['is {x} {kind}', 'tell me whether {x} is {kind}', 'would you call {x} {kind}', 'is {x} counted as {kind}'],
  which: ['which of these is {kind}: {options}', 'pick {kind} from {options}', 'among {options}, which one is {kind}', 'one of {options} is {kind}; which is it'],
});
export const MEMBER_ANSWERS = Object.freeze({ yes: 'Yes, {x} is {kind}.', no: 'No, {x} is not {kind}.', which: '{x} is {kind}.' });

/**
 * list-membership: the members (make.item of each record at make.root, or the elements themselves) and the decoys
 * (make.decoys, a literal list, or make.decoysPath, a field of the same records; a decoy that is a member is dropped).
 * member: "is X <kind>", members and decoys balanced one to one; which: "which of these is <kind>: A, B or C", one member
 * and two decoys. make.task is the base: <base>-member and <base>-which.
 */
export function membershipTasks(recs, make) {
  const uniq = (xs) => [...new Map(xs.filter((x) => x !== null).map((x) => [normKey(x), x])).values()];
  const members = uniq(recs.map((r) => clean(getPath(r, make.item || '$'))));
  const isMember = new Set(members.map(normKey));
  const rawDecoys = Array.isArray(make.decoys) ? make.decoys : typeof make.decoysPath === 'string' ? recs.map((r) => getPath(r, make.decoysPath)) : [];
  const decoys = uniq(rawDecoys.map(clean)).filter((d) => !isMember.has(normKey(d)));
  const kind = words(make.kind) ? make.kind : article(make.noun) + ' ' + make.noun;
  const ans = { ...MEMBER_ANSWERS, ...(isObj(make.answers) ? make.answers : {}) };
  const caps = capsOf(make);
  const out = [];
  for (const which of Array.isArray(make.tasks) ? make.tasks : MEMBER_TASKS) {
    const name = make.task + '-' + which;
    const templates = isObj(make.templates) && Array.isArray(make.templates[which]) ? make.templates[which] : MEMBER_TEMPLATES[which];
    if (!templates || templates.length < MIN_TEMPLATES) throw new Error(name + ' has under ' + MIN_TEMPLATES + ' templates');
    const tpl = templateSplit(templates);
    let rows = [];
    if (which === 'member') {
      // as many members as decoys: a yes and a no equally often, so "yes" to everything scores one half
      const m = Math.min(members.length, decoys.length);
      const ms = shaOrder(name, members).slice(0, m), ds = shaOrder(name + '\u0000no', decoys).slice(0, m);
      rows = planRows(planSingle(name, [...ms, ...ds], caps), tpl, (x, t, split) => {
        const yes = isMember.has(normKey(x));
        return row(render(t, { x, kind }), render(yes ? ans.yes : ans.no, { x, kind }), yes ? { contains: ['yes'], notContains: ['not'] } : { contains: ['not'], notContains: ['yes'] }, split);
      });
    } else if (which === 'which' && decoys.length >= 2) {
      rows = planRows(planSingle(name, members, caps), tpl, (x, t, split) => {
        const ds = shaOrder(name + '\u0000' + x, decoys).slice(0, 2);
        const options = listOr(shaOrder(name + '\u0001' + x, [x, ...ds]));
        const answer = render(ans.which, { x, kind });
        const nc = notOf(x, ds, answer);
        return row(render(t, { x, kind, options }), answer, { contains: [x], ...(nc.length ? { notContains: nc } : {}) }, split);
      });
    }
    out.push(taskOf(name, make, which === 'member' ? 'The answer says yes when the prompt names ' + kind + ' the source lists, and no when it does not.' : 'The answer names the one option in the prompt that the source lists as ' + kind + '.', rows));
  }
  return out;
}

/** The adapters: kind -> (bytes, make) -> tasks. Pure: no clock, no random, no network, no file. */
export const ADAPTERS = Object.freeze({
  'csv-relation': (bytes, make) => relationTasks(recordsOf(decode(bytes), make, 'csv'), make),
  'json-relation': (bytes, make) => relationTasks(recordsOf(decode(bytes), make, 'json'), make),
  'csv-numeric': (bytes, make) => numericTasks(recordsOf(decode(bytes), make, 'csv'), make),
  'json-numeric': (bytes, make) => numericTasks(recordsOf(decode(bytes), make, 'json'), make),
  'list-membership': (bytes, make) => membershipTasks(recordsOf(decode(bytes), make, 'json'), make),
});

// ---- the registry (neo/sources.json) and the record (neo/ABSORB.json)
/** The task names a source row makes, without fetching it (each a base: a taken one gets a suffix at pull time). */
export function taskNamesOf(src) {
  const m = isObj(src) && isObj(src.make) ? src.make : {};
  const kind = isObj(src) ? src.kind : null;
  if (kind === 'csv-relation' || kind === 'json-relation') return (Array.isArray(m.relations) ? m.relations : []).filter(isObj).flatMap((r) => [r.task, reverseOf(r).task]);
  if (kind === 'csv-numeric' || kind === 'json-numeric') return (Array.isArray(m.numerics) ? m.numerics : []).flatMap((s) => (isObj(s) ? (Array.isArray(s.tasks) ? s.tasks : NUMERIC_TASKS).map((w) => numTaskName(s.task, w)) : []));
  if (kind === 'list-membership') return (Array.isArray(m.tasks) ? m.tasks : MEMBER_TASKS).map((w) => m.task + '-' + w);
  return [];
}

/**
 * What is wrong with one registry row; [] when it may be pulled. The URL passes urlRefusal, the kind names an adapter,
 * a licence and a domain are named, every task name is a TASK_RE name of at most MAX_BASE characters and not a locked
 * class, every template list holds MIN_TEMPLATES or more, and no template or answer holds a FORBIDDEN pattern.
 */
export function sourceErrors(src, locked = new Set()) {
  if (!isObj(src)) return ['not a JSON object'];
  const out = [];
  if (!ID_RE.test(String(src.id))) out.push('id is not ' + String(ID_RE));
  if (!own(ADAPTERS, String(src.kind))) out.push('kind ' + JSON.stringify(src.kind) + ' names no adapter (' + Object.keys(ADAPTERS).join(', ') + ')');
  const why = urlRefusal(src.url);
  if (why) out.push('url: ' + why);
  for (const k of ['domain', 'license']) if (!words(src[k])) out.push(k + ' is not a non-empty string');
  if (!isObj(src.make)) { out.push('make is not an object'); return out; }
  const m = src.make;
  if (m.format !== undefined && !FORMATS.includes(m.format)) out.push('make.format is not one of ' + FORMATS.join(', '));
  if (m.match !== undefined) {
    if (!isObj(m.match)) out.push('make.match is not an object');
    else for (const [p, s] of Object.entries(m.match)) { try { new RegExp(String(s)); } catch { out.push('make.match.' + p + ' is not a regular expression'); } }
  }
  const texts = [];
  const tplOk = (label, list, slot) => {
    if (list === undefined) return;
    if (!Array.isArray(list) || list.length < MIN_TEMPLATES || !list.every((t) => words(t) && t.includes(slot))) out.push(label + ' needs ' + MIN_TEMPLATES + ' or more templates, each with ' + slot);
    else texts.push(...list);
  };
  if (src.kind === 'csv-relation' || src.kind === 'json-relation') {
    if (!Array.isArray(m.relations) || !m.relations.length) out.push('make.relations is not a non-empty list');
    for (const r of Array.isArray(m.relations) ? m.relations : []) {
      if (!isObj(r) || !words(r.key) || !words(r.value)) { out.push('a relation without key and value'); continue; }
      if (r.reverse !== undefined && !isObj(r.reverse)) out.push(String(r.task) + ': reverse is not an object (every relation has both directions)');
      for (const s of [r, reverseOf(r)]) {
        if (s.templates === undefined) out.push((s.task || 'a relation') + ' has no templates');
        tplOk(String(s.task), s.templates, '{key}');
        if (!words(s.answer) || !s.answer.includes(s.expect === 'equals' ? '{' : '{value}')) out.push(String(s.task) + ': answer is not a template with {value}');
        else texts.push(s.answer);
      }
      texts.push(String(r.keyLabel || ''), String(r.valueLabel || ''));
    }
  } else if (src.kind === 'csv-numeric' || src.kind === 'json-numeric') {
    if (!Array.isArray(m.numerics) || !m.numerics.length) out.push('make.numerics is not a non-empty list');
    for (const s of Array.isArray(m.numerics) ? m.numerics : []) {
      if (!isObj(s) || !words(s.value) || !words(s.noun) || !words(s.key || m.key)) { out.push('a numeric without key, value and noun'); continue; }
      for (const w of Array.isArray(s.tasks) ? s.tasks : []) if (!NUMERIC_TASKS.includes(w)) out.push('numeric task ' + JSON.stringify(w) + ' is not one of ' + NUMERIC_TASKS.join(', '));
      if (isObj(s.templates)) for (const [w, list] of Object.entries(s.templates)) tplOk(numTaskName(s.task, w), list, '{a}');
      if (isObj(s.answers)) texts.push(...Object.values(s.answers).map(String));
      texts.push(s.noun, s.unit || '');
    }
  } else if (src.kind === 'list-membership') {
    if (!words(m.noun) && !words(m.kind)) out.push('make.noun is not a non-empty string');
    if (!Array.isArray(m.decoys) && !words(m.decoysPath)) out.push('make.decoys (a list) or make.decoysPath is required');
    for (const w of Array.isArray(m.tasks) ? m.tasks : []) if (!MEMBER_TASKS.includes(w)) out.push('membership task ' + JSON.stringify(w) + ' is not one of ' + MEMBER_TASKS.join(', '));
    if (isObj(m.templates)) for (const [w, list] of Object.entries(m.templates)) tplOk(m.task + '-' + w, list, '{x}');
    if (isObj(m.answers)) texts.push(...Object.values(m.answers).map(String));
    texts.push(String(m.noun || ''), String(m.kind || ''));
  }
  const names = taskNamesOf(src);
  if (!names.length) out.push('the row makes no task');
  for (const n of names) {
    if (!TASK_RE.test(String(n)) || String(n).length > MAX_BASE) out.push('task name ' + JSON.stringify(n) + ' is not a TASK_RE name of at most ' + MAX_BASE + ' characters');
    else if (locked.has(n)) out.push('task name ' + n + ' is a locked class');
  }
  if (new Set(names).size !== names.length) out.push('the row names one task twice');
  for (const [re, what] of FORBIDDEN) if (texts.some((t) => re.test(t))) out.push('a template uses ' + what + ' (grow/contract.mjs FORBIDDEN)');
  return out;
}

/** neo/sources.json: { sources: [..] }. Missing or not that shape fails (a pull with no registry is a broken tree). */
export function readRegistry(root) {
  let text;
  try { text = fs.readFileSync(path.join(root, SOURCES), 'utf8'); } catch { throw new Fail(SOURCES + ' is missing'); }
  let doc;
  try { doc = JSON.parse(text); } catch (e) { throw new Fail(SOURCES + ' is not JSON (' + first(e) + ')'); }
  if (!isObj(doc) || !Array.isArray(doc.sources)) throw new Fail(SOURCES + ' is not { sources: [..] }');
  return doc;
}

/** neo/ABSORB.json: { cursor, pulled (append only), bytes, rows, blocked (the last BLOCKED_KEEP) }; missing is empty, unreadable fails. */
export function readAbsorb(root) {
  const f = path.join(root, ABSORB);
  let text = null;
  try { text = fs.readFileSync(f, 'utf8'); } catch { text = null; }
  let doc = {};
  if (text !== null) {
    try { doc = JSON.parse(text); } catch (e) { throw new Fail(ABSORB + ' is not JSON (' + first(e) + '): a human session repairs it'); }
    if (!isObj(doc) || (doc.pulled !== undefined && !Array.isArray(doc.pulled))) throw new Fail(ABSORB + ' is not { cursor, pulled: [..], bytes, rows }: a human session repairs it');
  }
  return {
    ...doc,
    cursor: Number.isInteger(doc.cursor) && doc.cursor >= 0 ? doc.cursor : 0,
    pulled: Array.isArray(doc.pulled) ? doc.pulled : [],
    bytes: Number.isFinite(doc.bytes) ? doc.bytes : 0,
    rows: Number.isFinite(doc.rows) ? doc.rows : 0,
    blocked: Array.isArray(doc.blocked) ? doc.blocked : [],
  };
}

// ---- the split and the task directory
/**
 * A task's rows into dev and held-out, deterministic: every row sorted by the sha256 of its prompt; a row the adapter
 * tagged keeps its set, an untagged one goes to the held-out set every third; a prompt repeated under the teacher's
 * normQ is kept once, and no held-out prompt equals a dev prompt under normQ. ok only with MIN_ROWS of each.
 * @returns {{ ok: boolean, why: string, dev: object[], heldout: object[] }}
 */
export function splitTask(rows) {
  const sorted = rows.map((r) => [sha256(String(r.q)), r]).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map((e) => e[1]);
  const dev = [], held = [];
  let u = 0;
  for (const r of sorted) {
    if (r.split === 'dev') dev.push(r);
    else if (r.split === 'heldout') held.push(r);
    else (u++ % 3 === 2 ? held : dev).push(r);
  }
  const strip = (r) => ({ q: r.q, expect: r.expect, answer: r.answer });
  const once = (list, taken) => { const out = []; for (const r of list) { const k = normQ(r.q); if (taken.has(k)) continue; taken.add(k); out.push(strip(r)); } return out; };
  const devKeys = new Set();
  const d = once(dev, devKeys);
  const h = once(held, new Set(devKeys));
  const ok = d.length >= MIN_ROWS.dev && h.length >= MIN_ROWS.heldout;
  return { ok, why: ok ? '' : 'dev ' + d.length + ' rows (at least ' + MIN_ROWS.dev + '), held-out ' + h.length + ' rows (at least ' + MIN_ROWS.heldout + ')', dev: d, heldout: h };
}

const teachDirOf = (root, n) => path.join(root, 'work', 'grow', 'gen-' + n, 'teach');

/** Write one task directory exactly as a teacher arm would (task.json, dev.jsonl, heldout.jsonl) plus source.json. */
function writeTaskDir(dir, { name, base, domain, rule, n, src, sha, bytes, at, dev, heldout }) {
  fs.mkdirSync(dir, { recursive: true });
  fs.rmSync(path.join(dir, REFUSED_MARK), { force: true });
  writeJson(path.join(dir, 'task.json'), { task: name, skill: base, domain, rule, generation: n, by: 'absorb:' + src.id });
  fs.writeFileSync(path.join(dir, 'dev.jsonl'), jsonl(dev));
  fs.writeFileSync(path.join(dir, 'heldout.jsonl'), jsonl(heldout));
  writeJson(path.join(dir, 'source.json'), { id: src.id, url: src.url, license: src.license, kind: src.kind, sha256: sha, bytes, at });
}

// ---- pull and status
/**
 * Pull the NEXT sources after the cursor of neo/ABSORB.json: fetch (the allowlist on every hop), run the adapter, split
 * each task, write work/grow/gen-<n>/teach/<task>/, append neo/ABSORB.json. A source that cannot be fetched or adapted
 * is a blocked line and the cursor still moves past it (the registry is a ring); a spent time or byte budget stops the
 * pull and the sources not reached keep their place. A task the ledger already holds with this very dev set (its
 * devSha) is known and not written again; with other rows it is written as <task>-<6 hex of the sha256 of the bytes>
 * (known when the ledger holds that name too); a directory of the generation another writer left (a teacher arm,
 * another source) is never written into: the task takes the -<sha6> name, or is dropped. Every directory written passes
 * teach.mjs validateTaskDir (the rules of `teach.mjs check`) or is removed with a blocked line.
 * @param {string} root
 * @param {{ gen?: number, fetch?: Function, maxSources?: number, maxBytes?: number, maxMs?: number, fetchTimeoutMs?: number, now?: () => string, clock?: () => number }} o
 * @returns {Promise<object>} { generation, sources, fetched, bytes, tasks, rows, ms, bytesPerSecond, blocked, cursor, dirs, dropped, known }
 */
export async function pull(root, {
  gen, fetch: fetchFn = globalThis.fetch, maxSources = DEFAULTS.maxSources, maxBytes = DEFAULTS.maxBytes, maxMs = DEFAULTS.maxMs,
  fetchTimeoutMs = DEFAULTS.fetchTimeoutMs, now = () => new Date().toISOString(), clock = () => Date.now(),
} = {}) {
  const t0 = clock();
  const n = gen ?? nextGeneration(root);
  const at = now();
  const reg = readRegistry(root);
  const ab = readAbsorb(root);
  const N = reg.sources.length;
  const locked = new Set(lockedClasses(root));
  const ledgerRows = readLedger(root).tasks;
  const ledger = new Set(ledgerRows.map((r) => r.task));
  const ledgerSha = new Map(ledgerRows.map((r) => [r.task, r.devSha]));
  const teach = teachDirOf(root, n);
  let cursor = N ? ab.cursor % N : 0;
  const blocked = [], dirs = [], dropped = [], used = new Set(), fresh = [];
  let attempted = 0, fetched = 0, bytes = 0, tasks = 0, rows = 0, known = 0;
  const block = (id, why) => { const line = redact(String(id) + ': ' + why); blocked.push(line); fresh.push({ id: String(id), at, why: redact(why) }); };
  const take = Math.min(maxSources, N);
  for (let i = 0; i < take; i++) {
    // a spent budget is not a source that failed: the sources not reached keep their place and wait for the next pull
    const spent = clock() - t0;
    if (spent >= maxMs) { blocked.push('pull: the time budget of ' + maxMs + ' ms is spent; ' + (take - i) + ' sources wait for the next pull'); break; }
    const left = maxBytes - bytes;
    if (left <= 0) { blocked.push('pull: the byte budget of ' + maxBytes + ' bytes is spent; ' + (take - i) + ' sources wait for the next pull'); break; }
    const src = reg.sources[cursor];
    cursor = (cursor + 1) % N;
    attempted++;
    const id = isObj(src) && typeof src.id === 'string' ? src.id : 'sources[' + ((cursor + N - 1) % N) + ']';
    const bad = sourceErrors(src, locked);
    if (bad.length) { block(id, 'the registry row is refused before any fetch: ' + bad.slice(0, 3).join('; ')); continue; }
    let got;
    try { got = await fetchBytes(src.url, { fetch: fetchFn, timeoutMs: Math.max(1, Math.min(fetchTimeoutMs, maxMs - spent)), maxBytes: left }); } catch (e) { block(id, first(e)); continue; }
    fetched++;
    bytes += got.bytes.length;
    const sha = sha256(got.bytes);
    let made = [];
    let adaptWhy = null;
    try { made = ADAPTERS[src.kind](got.bytes, { ...src.make, domain: src.domain }); } catch (e) { adaptWhy = 'adapter ' + src.kind + ': ' + first(e); }
    if (adaptWhy) block(id, adaptWhy);
    let st = 0, sr = 0;
    // a directory of this generation another writer left (a teacher arm, another source) and intake has not opened: never
    // written into; this source's own directory (its source.json names it) may be written again
    const foreign = (nm) => { const d = path.join(teach, nm); return fs.existsSync(d) && !fs.existsSync(path.join(d, OPENED_MARK)) && (readJsonOr(path.join(d, 'source.json')) || {}).id !== src.id; };
    for (const t of made) {
      const sp = splitTask(t.rows);
      if (!sp.ok) { dropped.push(t.task + ': ' + sp.why); continue; }
      let name = t.task;
      if (ledger.has(name) || used.has(name) || foreign(name)) {
        // the ledger froze this very dev set (its devSha): the task is known, whichever pull or arm opened it
        if (ledgerSha.get(name) === shaText(jsonl(sp.dev))) { known++; continue; }
        const alt = t.task + '-' + sha.slice(0, 6);
        if (ledger.has(alt) || used.has(alt)) { known++; continue; }
        if (foreign(alt)) { dropped.push(alt + ': another writer holds ' + posix(path.relative(root, path.join(teach, alt))) + '/'); continue; }
        name = alt;
      }
      if (!TASK_RE.test(name) || locked.has(name)) { dropped.push(name + ': not a task name'); continue; }
      const dir = path.join(teach, name);
      // intake already moved it, or already refused these very bytes: writing it again would only be refused again
      if (fs.existsSync(path.join(dir, OPENED_MARK))) { known++; continue; }
      if (fs.existsSync(path.join(dir, REFUSED_MARK)) && (readJsonOr(path.join(dir, 'source.json')) || {}).sha256 === sha) { known++; continue; }
      used.add(name);
      writeTaskDir(dir, { name, base: t.task, domain: t.domain || src.domain, rule: t.rule, n, src, sha, bytes: got.bytes.length, at, dev: sp.dev, heldout: sp.heldout });
      // intake's own offline rules (teach.mjs check): a directory intake would refuse is never left behind
      const v = validateTaskDir(dir, { n, locked, taken: ledger });
      if (!v.ok) { fs.rmSync(dir, { recursive: true, force: true }); block(id, name + ': teach check refused it: ' + v.why.slice(0, 2).join('; ')); continue; }
      dirs.push(posix(path.relative(root, dir)));
      st++;
      sr += sp.dev.length + sp.heldout.length;
    }
    const checked = isObj(src.checked) && typeof src.checked.sha256 === 'string' ? { changed: src.checked.sha256 !== sha } : {};
    ab.pulled.push({ id: src.id, at, generation: n, url: got.url, bytes: got.bytes.length, sha256: sha, tasks: st, rows: sr, ...checked, ...(adaptWhy ? { blocked: redact(adaptWhy) } : {}) });
    tasks += st;
    rows += sr;
  }
  ab.cursor = cursor;
  ab.bytes += bytes;
  ab.rows += rows;
  ab.blocked = [...ab.blocked, ...fresh].slice(-BLOCKED_KEEP);
  writeJson(path.join(root, ABSORB), { cursor: ab.cursor, pulled: ab.pulled, bytes: ab.bytes, rows: ab.rows, blocked: ab.blocked });
  const ms = Math.max(0, clock() - t0);
  return { generation: n, sources: attempted, fetched, bytes, tasks, rows, ms, bytesPerSecond: Math.round((bytes * 1000) / Math.max(1, ms)), blocked, cursor, dirs, dropped, known };
}

/** { sources, domains, pulled, bytes, rows, tasks, cursor }: the registry's size, what ABSORB.json holds. */
export function status(root) {
  const reg = readRegistry(root);
  const ab = readAbsorb(root);
  const domains = new Set(reg.sources.filter(isObj).map((s) => s.domain).filter(words));
  return {
    sources: reg.sources.length, domains: domains.size, pulled: ab.pulled.length, bytes: ab.bytes, rows: ab.rows,
    tasks: ab.pulled.reduce((s, p) => s + (isObj(p) && Number.isFinite(p.tasks) ? p.tasks : 0), 0), cursor: reg.sources.length ? ab.cursor % reg.sources.length : 0,
  };
}

// ---- arguments and main
const VALUE = new Set(['gen', 'max-sources', 'max-bytes', 'max-ms', 'fetch-timeout-ms', 'root']);
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

/** The CLI as a function: the printed object, or { usage: true }. o.fetch replaces the network (a test's stub). */
export async function main(argv, o = {}) {
  const { verb, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (verb === 'pull') {
    return await pull(root, {
      gen: intOf(flags, 'gen', 1, Number.MAX_SAFE_INTEGER, undefined),
      maxSources: intOf(flags, 'max-sources', 1, LIMITS.maxSources, DEFAULTS.maxSources),
      maxBytes: intOf(flags, 'max-bytes', 1, LIMITS.maxBytes, DEFAULTS.maxBytes),
      maxMs: intOf(flags, 'max-ms', 1, LIMITS.maxMs, DEFAULTS.maxMs),
      fetchTimeoutMs: intOf(flags, 'fetch-timeout-ms', 1, LIMITS.fetchTimeoutMs, DEFAULTS.fetchTimeoutMs),
      ...(typeof o.fetch === 'function' ? { fetch: o.fetch } : {}),
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
    process.stderr.write(redact(coded ? e.message : 'absorb failed: ' + ((e && e.stack) || e)).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
