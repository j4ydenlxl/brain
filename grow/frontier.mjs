#!/usr/bin/env node
// grow/frontier.mjs: THE FRONTIER, the part that finds its own next sources (contract c1 of the era; grow/NEO.md Order 7).
// His words (2026-10-01, verbatim at the head of grow/NEO.md): "Scraping whole internet and having a stronghold over
// everything"; "it stimulates and scarpapes everything to improve itself"; "simple at first but infintie potential".
// The absorber (grow/absorb.mjs) pulls only what neo/sources.json names. The frontier FEEDS that registry, in its own
// format, and never edits the absorber: each step takes URLs from its queue (neo/frontier.json), fetches them politely
// (one request a second per host, a byte cap per fetch and per step, a timeout, a User-Agent that names the project,
// every redirect hop on the allowlist), DISCOVERS more (a datapackage.json lists its resources; a README or an index
// file links raw CSV and JSON; a GitHub tree listing through api.github.com names every file of a repository), and for
// every candidate table parses it with the absorber's own parser as DATA, keeps it only when it is a real table (a
// header, at least 20 rows, a key-like column, a value column) whose registry row absorb's own sourceErrors accepts and
// whose adapter opens at least one task that splits, then appends it to neo/sources.json with its sha256. At most 5 new
// sources a step, deduplicated by sha256 and by URL. Hosts: raw.githubusercontent.com (absorb's ALLOWED_HOSTS) for data,
// api.github.com for tree listings only; any other host is refused and counted. When the seeds are spent, every
// repository the registry names is a new tree to list, and every repository a page links is one more: the crawl only
// grows. Nothing fetched is ever evaluated, imported or followed as an instruction; a cell that looks like code or a
// prompt is a string. A token is read by the NAME GITHUB_TOKEN from the environment, sent to api.github.com only, never
// printed and never written. No model call anywhere. It writes only <root>/neo/frontier.json and <root>/neo/sources.json.
//   node grow/frontier.mjs step [--max-ms 60000] [--era <n>] [--max-add 5] [--max-bytes 16000000] [--max-fetch-bytes 4000000]
//                               [--fetch-timeout-ms 15000] [--max-fetches 60]
//   node grow/frontier.mjs status
//   node grow/frontier.mjs seeds                                       [--root <dir>] on every verb
// Success prints ONE JSON line as the last stdout line and exits 0; a failure prints one stderr line and exits non-zero
// (2: usage).
// Author: Opus 5.5 builder (FRONTIER) for the Fable 5.1 orchestrator, 2026-10-01.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FORBIDDEN } from './contract.mjs';
import {
  ALLOWED_HOSTS, SOURCES, MAX_BASE, ID_RE, ADAPTERS, decode, parseCsv, recordsOf, jsonLines, getPath, clean, numOf, normKey,
  sourceErrors, readRegistry, splitTask, taskNamesOf,
} from './absorb.mjs';
import { TASK_RE, lockedClasses, readLedger } from './teach.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** The tree this file lives in: its seeds are the fallback when a root carries none. */
export const CODE_ROOT = path.resolve(HERE, '..');
export const FRONTIER = 'neo/frontier.json';
export const SEEDS = 'neo/frontier-seeds.json';
export const LIST_HOST = 'api.github.com';
/** data: the hosts a table, a page or a datapackage may come from (absorb's own list); list: tree listings only. */
export const HOSTS = Object.freeze({ data: Object.freeze([...ALLOWED_HOSTS]), list: Object.freeze([LIST_HOST]) });
export const USER_AGENT = 'dilation-brain-frontier/1 (+https://dilation.dev)';
/** The NAME of the environment variable a GitHub token is read from (the value is never printed or written). */
export const TOKEN_NAME = 'GITHUB_TOKEN';
/** New sources a step may append, at the most (the brief's cap; --max-add may lower it, never raise it). */
export const MAX_ADD = 5;
/** One request a second per host. */
export const PER_HOST_MS = 1000;
export const DEFAULTS = Object.freeze({ maxMs: 60000, maxAdd: MAX_ADD, maxBytes: 16000000, maxFetchBytes: 4000000, fetchTimeoutMs: 15000, maxFetches: 60 });
export const LIMITS = Object.freeze({ maxMs: 86400000, maxAdd: MAX_ADD, maxBytes: 256000000, maxFetchBytes: 8000000, fetchTimeoutMs: 600000, maxFetches: 100000 });
export const MAX_REDIRECTS = 3;
/** A real table: at least this many data rows. */
export const MIN_TABLE_ROWS = 20;
export const QUEUE_MAX = 2000;
export const SEEN_MAX = 12000;
export const REPOS_MAX = 3000;
export const ADDED_KEEP = 1000;
/** Table candidates one tree listing may enqueue (the rest wait for the next listing of that repository). */
export const PER_TREE = 60;
/** Links one page may enqueue. */
export const PER_PAGE = 120;
/** A repository is listed again after this long (its new files are new places to look). */
export const RELIST_MS = 30 * 24 * 3600 * 1000;
/** A host that said "slow down" (403/429 or a spent rate limit) is left alone this long when it names no reset. */
export const BACKOFF_MS = 15 * 60 * 1000;
/** Bytes of a page read for links. */
export const PAGE_BYTES = 1000000;
export const DATA_EXT = Object.freeze(['csv', 'tsv', 'json', 'jsonl']);
/** Queue priority by kind: a licence before the tables it covers, tables before the pages and trees that find more. */
export const PRIORITY = Object.freeze({ license: 0, datapackage: 1, table: 2, page: 3, tree: 4, wait: 5 });
export const KINDS = Object.freeze(Object.keys(PRIORITY).filter((k) => k !== 'wait'));
export const USAGE = [
  'usage: node grow/frontier.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  step [--max-ms ' + DEFAULTS.maxMs + '] [--era <n>] [--max-add ' + DEFAULTS.maxAdd + '] [--max-bytes ' + DEFAULTS.maxBytes + '] [--max-fetch-bytes ' + DEFAULTS.maxFetchBytes + '] [--fetch-timeout-ms ' + DEFAULTS.fetchTimeoutMs + '] [--max-fetches ' + DEFAULTS.maxFetches + ']',
  '      fetch from the queue of ' + FRONTIER + ', discover more, append real tables to ' + SOURCES,
  '  status                                     { queue, seen, repos, sources, counts }',
  '  seeds                                      { seeds, domains, refused }: the seed file, checked offline',
].join('\n');

class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const first = (e) => String((e && e.message) || e).split('\n')[0];
const words = (s) => typeof s === 'string' && s.trim().length > 0;
const hex = (s) => createHash('sha256').update(String(s)).digest('hex');
/** The key a URL is remembered by in seen: 16 hex of its sha256 (a URL is never stored twice). */
export const seenKey = (u) => hex(u).slice(0, 16);
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const sleepReal = (ms) => new Promise((r) => { setTimeout(r, Math.max(0, ms)); });

/** A line made safe to print: a token's value (when one is given) and every GitHub or JWT token shape become <token>. */
export function scrub(s, token = '') {
  let t = String(s ?? '');
  if (typeof token === 'string' && token.length >= 4) t = t.split(token).join('<token>');
  return t.replace(/\b(gh[pousr]_[A-Za-z0-9]{8,}|github_pat_[A-Za-z0-9_]{8,}|eyJ[A-Za-z0-9_.-]{8,})/g, '<token>');
}

// ---- URLs: the allowlist, the shapes the frontier knows
const NAME_RE = /^[A-Za-z0-9_.-]{1,100}$/;
const TREE_PATH_RE = /^\/repos\/([A-Za-z0-9_.-]{1,100})\/([A-Za-z0-9_.-]{1,100})\/git\/trees\/([^/]{1,200})$/;
/**
 * Why a URL may not be fetched for a purpose, or '' when it may: https only, no credentials, the default port, a host of
 * HOSTS[purpose]; a listing must be a git tree path of api.github.com (that host answers listings only).
 * @param {string} u
 * @param {'data'|'list'} purpose
 */
export function refusal(u, purpose) {
  if (!own(HOSTS, purpose)) return 'no purpose ' + String(purpose);
  let x;
  try { x = new URL(String(u)); } catch { return 'not a URL: ' + String(u).slice(0, 80); }
  if (x.protocol !== 'https:') return 'not https (' + x.protocol + ')';
  if (x.username || x.password) return 'a URL with credentials is refused';
  if (x.port) return 'a non-default port is refused (' + x.port + ')';
  const host = x.hostname.toLowerCase();
  if (!HOSTS[purpose].includes(host)) return 'the host ' + host + ' is not allowed for ' + purpose;
  if (purpose === 'list' && !TREE_PATH_RE.test(x.pathname)) return LIST_HOST + ' answers tree listings only';
  return '';
}
/** The purpose a queue kind is fetched for. */
export const purposeOf = (kind) => (kind === 'tree' ? 'list' : 'data');
/** The file extension of a URL's path, lower case ('' when none). */
export function extOf(u) {
  let p;
  try { p = new URL(String(u)).pathname; } catch { return ''; }
  const m = /\.([A-Za-z0-9]{1,8})$/.exec(p);
  return m ? m[1].toLowerCase() : '';
}
/** What a data URL is to the frontier: 'datapackage', 'license', 'page', 'table', or null (not a place to look). */
export function classify(u) {
  let p;
  try { p = decodeURIComponent(new URL(String(u)).pathname); } catch { return null; }
  const base = p.split('/').pop().toLowerCase();
  if (base === 'datapackage.json') return 'datapackage';
  if (/^(licen[cs]e|copying)(\.(md|txt|markdown))?$/.test(base)) return 'license';
  const ext = extOf(u);
  if (DATA_EXT.includes(ext)) return 'table';
  if (['md', 'markdown', 'rst', 'txt'].includes(ext) || /^readme/.test(base)) return 'page';
  return null;
}
/** { owner, repo, branch, path } of a raw.githubusercontent.com URL (a refs/heads/<b> ref is read as <b>), or null. */
export function rawParts(u) {
  let x;
  try { x = new URL(String(u)); } catch { return null; }
  if (!HOSTS.data.includes(x.hostname.toLowerCase())) return null;
  const segs = x.pathname.split('/').slice(1);
  if (segs.length < 4) return null;
  let [owner, repo, branch, ...rest] = segs;
  if (branch === 'refs' && rest[0] === 'heads' && rest.length >= 3) { branch = rest[1]; rest = rest.slice(2); }
  try { branch = decodeURIComponent(branch); } catch { return null; }
  if (!NAME_RE.test(owner) || !NAME_RE.test(repo) || !branch || branch.length > 200 || /[\s?#]/.test(branch)) return null;
  return { owner, repo, branch, path: rest.join('/') };
}
export const repoKey = (owner, repo) => owner.toLowerCase() + '/' + repo.toLowerCase();
const encPath = (p) => p.split('/').map(encodeURIComponent).join('/');
/** The raw URL of a file of a repository at a ref. */
export const rawUrl = (owner, repo, branch, p) => 'https://' + HOSTS.data[0] + '/' + owner + '/' + repo + '/' + encodeURIComponent(branch) + '/' + encPath(p);
/** The api.github.com listing of every file of a repository at a ref (HEAD: its default branch). */
export const treeUrl = (owner, repo, branch = 'HEAD') => 'https://' + LIST_HOST + '/repos/' + owner + '/' + repo + '/git/trees/' + encodeURIComponent(branch) + '?recursive=1';
/** { owner, repo, branch } of a tree listing URL, or null. */
export function treeParts(u) {
  let x;
  try { x = new URL(String(u)); } catch { return null; }
  const m = TREE_PATH_RE.exec(x.pathname);
  if (!m || x.hostname.toLowerCase() !== LIST_HOST) return null;
  let branch;
  try { branch = decodeURIComponent(m[3]); } catch { return null; }
  return { owner: m[1], repo: m[2], branch };
}
/**
 * Where a link found on a page points, as a frontier item ({ u, k, owner, repo, branch }), or { refused } for a host
 * outside the allowlist, or null for a link that is no place to look. A github.com link to a file becomes its raw URL;
 * a github.com link to a repository (or one of its trees) becomes that repository's tree listing. Nothing is fetched.
 */
export function linkTarget(href, base) {
  let x;
  try { x = base ? new URL(String(href), base) : new URL(String(href)); } catch { return null; }
  if (x.protocol !== 'https:' && x.protocol !== 'http:') return null;
  x.hash = '';
  const host = x.hostname.toLowerCase();
  if (HOSTS.data.includes(host)) {
    const u = x.href;
    const why = refusal(u, 'data');
    if (why) return { refused: why };
    const k = classify(u);
    const r = rawParts(u);
    return k && r ? { u, k, owner: r.owner, repo: r.repo, branch: r.branch } : null;
  }
  if (host === 'github.com' || host === 'www.github.com') {
    const segs = x.pathname.split('/').filter(Boolean);
    if (segs.length < 2 || !NAME_RE.test(segs[0]) || !NAME_RE.test(segs[1])) return null;
    const owner = segs[0], repo = segs[1].replace(/\.git$/, '');
    if (!NAME_RE.test(repo)) return null;
    if (segs.length === 2) return { u: treeUrl(owner, repo, 'HEAD'), k: 'tree', owner, repo, branch: 'HEAD' };
    if ((segs[2] === 'blob' || segs[2] === 'raw') && segs.length >= 5) {
      const u = rawUrl(owner, repo, decodeURIComponent(segs[3]), segs.slice(4).map((s) => decodeURIComponent(s)).join('/'));
      const k = classify(u);
      return k ? { u, k, owner, repo, branch: decodeURIComponent(segs[3]) } : null;
    }
    if (segs[2] === 'tree' && segs.length >= 4) return { u: treeUrl(owner, repo, decodeURIComponent(segs[3])), k: 'tree', owner, repo, branch: decodeURIComponent(segs[3]) };
    return null;
  }
  return { refused: 'the host ' + host + ' is not allowed' };
}

// ---- the network: the allowlist on every hop, a time budget, a byte budget, nothing run
const REDIRECT = new Set([301, 302, 303, 307, 308]);
/** A fetch that did not give data: kind is 'refused', 'rate' (the host said slow down), 'http', 'size' or 'net'. */
export class FetchError extends Error {
  constructor(kind, line, extra = {}) { super(line); this.kind = kind; Object.assign(this, extra); }
}
async function readCapped(res, max) {
  if (res.body && typeof res.body.getReader === 'function') {
    const reader = res.body.getReader();
    const parts = [];
    let n = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      n += value.byteLength;
      if (n > max) { try { await reader.cancel(); } catch { /* the stream is dropped either way */ } throw new FetchError('size', 'over the byte cap: more than ' + max + ' bytes'); }
      parts.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
    }
    return Buffer.concat(parts, n);
  }
  if (typeof res.arrayBuffer !== 'function') throw new FetchError('net', 'the response has no body');
  const b = Buffer.from(await res.arrayBuffer());
  if (b.length > max) throw new FetchError('size', 'over the byte cap: ' + b.length + ' bytes, ' + max + ' allowed');
  return b;
}
/** When a host that said slow down may be asked again (ms since the epoch), from its own headers or BACKOFF_MS. */
export function retryAt(get, nowMs) {
  const ra = Number(get('retry-after'));
  if (Number.isFinite(ra) && ra > 0) return nowMs + Math.min(ra * 1000, 24 * 3600 * 1000);
  const reset = Number(get('x-ratelimit-reset'));
  if (Number.isFinite(reset) && reset * 1000 > nowMs) return Math.min(reset * 1000 + 1000, nowMs + 24 * 3600 * 1000);
  return nowMs + BACKOFF_MS;
}
/**
 * GET one URL for a purpose: every hop is checked against HOSTS[purpose] BEFORE it is fetched (redirects by hand, at most
 * MAX_REDIRECTS), the User-Agent names the project, a token goes to api.github.com only, a time budget and a byte cap
 * bound it, and only status 200 is data. The bytes are returned, never run.
 * @returns {Promise<{ bytes: Buffer, url: string, hops: number, remaining: number|null, reset: number|null }>}
 */
export async function fetchCapped(url, purpose, { fetch: fetchFn = globalThis.fetch, timeoutMs = DEFAULTS.fetchTimeoutMs, maxBytes = DEFAULTS.maxFetchBytes, token = '', nowMs = Date.now() } = {}) {
  if (typeof fetchFn !== 'function') throw new FetchError('net', 'no fetch in this runtime');
  const ac = new AbortController();
  let timer = null;
  const expired = new Promise((resolve, reject) => { timer = setTimeout(() => { ac.abort(); reject(new FetchError('net', 'timed out after ' + timeoutMs + ' ms')); }, timeoutMs); });
  expired.catch(() => { /* raced below */ });
  const race = (p) => Promise.race([p, expired]);
  try {
    let cur = String(url);
    for (let hop = 0; ; hop++) {
      const why = refusal(cur, purpose);
      if (why) throw new FetchError('refused', (hop ? 'a redirect refused before the fetch: ' : 'refused before the fetch: ') + why);
      cur = new URL(cur).href;
      const headers = { 'user-agent': USER_AGENT, accept: purpose === 'list' ? 'application/vnd.github+json' : '*/*' };
      if (purpose === 'list') {
        headers['x-github-api-version'] = '2022-11-28';
        if (token && new URL(cur).hostname.toLowerCase() === LIST_HOST) headers.authorization = 'Bearer ' + token;
      }
      let res;
      try { res = await race(fetchFn(cur, { redirect: 'manual', signal: ac.signal, headers })); } catch (e) { throw e instanceof FetchError ? e : new FetchError('net', first(e)); }
      if (!res || !Number.isInteger(res.status)) throw new FetchError('net', 'the fetch returned no response');
      const get = (h) => (res.headers && typeof res.headers.get === 'function' ? res.headers.get(h) : null);
      // a runtime that followed a redirect by itself reports where it landed: that place is checked too
      if (typeof res.url === 'string' && res.url && refusal(res.url, purpose)) throw new FetchError('refused', 'refused after the fetch: the response came from ' + refusal(res.url, purpose));
      if (REDIRECT.has(res.status)) {
        const loc = get('location');
        if (!loc) throw new FetchError('http', 'HTTP ' + res.status + ' with no location');
        if (hop >= MAX_REDIRECTS) throw new FetchError('http', 'more than ' + MAX_REDIRECTS + ' redirects');
        try { if (res.body && typeof res.body.cancel === 'function') await res.body.cancel(); } catch { /* nothing to read */ }
        try { cur = new URL(loc, cur).href; } catch { throw new FetchError('http', 'HTTP ' + res.status + ' to a location that is not a URL'); }
        continue;
      }
      const remaining = get('x-ratelimit-remaining') === null ? null : Number(get('x-ratelimit-remaining'));
      if (res.status === 429 || (res.status === 403 && (remaining === 0 || get('retry-after') !== null))) {
        throw new FetchError('rate', 'HTTP ' + res.status + ': the host asks to slow down', { until: retryAt(get, nowMs) });
      }
      if (res.status !== 200) throw new FetchError('http', 'HTTP ' + res.status, { status: res.status });
      const len = Number(get('content-length'));
      if (get('content-length') !== null && Number.isFinite(len) && len > maxBytes) {
        try { if (res.body && typeof res.body.cancel === 'function') await res.body.cancel(); } catch { /* dropped */ }
        throw new FetchError('size', 'over the byte cap: ' + len + ' bytes, ' + maxBytes + ' allowed');
      }
      const bytes = await race(readCapped(res, maxBytes));
      const reset = get('x-ratelimit-reset') === null ? null : Number(get('x-ratelimit-reset'));
      return { bytes, url: cur, hops: hop, remaining: Number.isFinite(remaining) ? remaining : null, reset: Number.isFinite(reset) ? reset : null };
    }
  } finally { clearTimeout(timer); }
}

// ---- licences: a repository's licence is named or its tables are not taken
/** Licence texts by a phrase each holds (the first that matches names it; non-commercial and no-derivatives first). */
export const LICENSES = Object.freeze([
  [/Attribution-NonCommercial|\bCC[- ]BY[- ]NC\b|creativecommons\.org\/licenses\/by-nc/i, 'CC-BY-NC'],
  [/Attribution-NoDerivatives|\bCC[- ]BY[- ]ND\b|creativecommons\.org\/licenses\/by-nd/i, 'CC-BY-ND'],
  [/Attribution-ShareAlike 4\.0|creativecommons\.org\/licenses\/by-sa\/4\.0/i, 'CC-BY-SA-4.0'],
  [/Attribution-ShareAlike 3\.0|creativecommons\.org\/licenses\/by-sa\/3\.0/i, 'CC-BY-SA-3.0'],
  [/Attribution 4\.0 International|creativecommons\.org\/licenses\/by\/4\.0|Creative Commons BY license/i, 'CC-BY-4.0'],
  [/Attribution 3\.0|creativecommons\.org\/licenses\/by\/3\.0/i, 'CC-BY-3.0'],
  [/\bCC0\b|Creative Commons Zero|creativecommons\.org\/publicdomain\/zero/i, 'CC0-1.0'],
  [/Open Data Commons Public Domain Dedication|\bPDDL\b/i, 'ODC-PDDL-1.0'],
  [/Open Database License|\bODbL\b/i, 'ODbL-1.0'],
  [/Open Data Commons Attribution|\bODC-By\b/i, 'ODC-By-1.0'],
  [/GNU AFFERO GENERAL PUBLIC LICENSE/i, 'AGPL-3.0'],
  [/GNU LESSER GENERAL PUBLIC LICENSE/i, 'LGPL'],
  [/GNU GENERAL PUBLIC LICENSE[\s\S]{0,80}Version 3/i, 'GPL-3.0'],
  [/GNU GENERAL PUBLIC LICENSE[\s\S]{0,80}Version 2/i, 'GPL-2.0'],
  [/Apache License[\s\S]{0,60}Version 2\.0/i, 'Apache-2.0'],
  [/Mozilla Public License[\s\S]{0,20}2\.0/i, 'MPL-2.0'],
  [/free and unencumbered software released into the public domain/i, 'Unlicense'],
  [/\bMIT License\b|Permission is hereby granted, free of charge/i, 'MIT'],
  [/\bISC License\b/i, 'ISC'],
  [/Redistribution and use in source and binary forms[\s\S]*Neither the name/i, 'BSD-3-Clause'],
  [/Redistribution and use in source and binary forms/i, 'BSD-2-Clause'],
]);
/** The licence a text names, or null. */
export function licenseOf(text) {
  const t = String(text ?? '').slice(0, 200000);
  const hit = LICENSES.find(([re]) => re.test(t));
  return hit ? hit[1] : null;
}
/** The licence a README's own Licence section names (the text under a "License" heading), or null. */
export function licenseSection(text) {
  const t = String(text ?? '');
  const m = /^#{1,6}[ \t]*licen[cs]e\b.*$/im.exec(t);
  if (!m) return null;
  const rest = t.slice(m.index + m[0].length);
  const end = /^#{1,6}[ \t]/m.exec(rest);
  return licenseOf(rest.slice(0, end ? end.index : 4000));
}
/** A licence name as a registry may hold it (letters, digits, space and . + ( ) _ -; at most 60), or null. */
export function licenseName(s) {
  const t = String(s ?? '').replace(/[^A-Za-z0-9 .+()_-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  return t || null;
}
/** Open: named, and neither non-commercial nor no-derivatives. */
export const isOpen = (name) => words(name) && !/\bNC\b|NonCommercial|\bND\b|NoDeriv/i.test(name);
/** The licence a datapackage.json names (licenses[0] name, id or title; or license), or null. */
export function packageLicense(d) {
  if (!isObj(d)) return null;
  const l = Array.isArray(d.licenses) && d.licenses.length ? d.licenses[0] : d.license;
  if (typeof l === 'string') return licenseName(l);
  if (isObj(l)) return licenseName(l.name || l.id || l.type || l.title);
  return null;
}

// ---- tables: what absorb's own parser reads, kept only when it is a real table
const NAMEISH = /(^|[^a-z])(name|title|country|city|state|nation|province|region|symbol|ticker|word|term|label|language|element|team|player|species|airport|company|currency|county|code)([^a-z]|$)/i;
const YEARISH = /(^|[^a-z])(year|date|month|season)([^a-z]|$)/i;
const URLISH = /^(https?:|www\.)|^[0-9a-f]{16,}$/i;
const ADDRESSABLE = /^[^.{}]{1,80}$/;
export const MAX_REL = 3;
export const MAX_NUM = 2;
/** Prompt templates of a relation the frontier writes ({vl}, {kl}: the labels; {key}: the entity). */
export const FWD_TEMPLATES = Object.freeze(['what is the {vl} of {key}', 'tell me the {vl} of the {kl} {key}', 'give the {vl} for {key}', 'which {vl} does the {kl} {key} have']);
export const FWD_ANSWER = 'The {vl} of {key} is {value}.';
/** A column name as words a prompt may hold (a-z, digits, single spaces; at most 30; a letter in it), or null. */
export function labelOf(h) {
  if (h === '$key') return 'name';
  const s = String(h ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_\-./]+/g, ' ').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  return s && s.length <= 30 && /[a-z]/.test(s) ? s : null;
}
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const stem = (s, n) => slug(s).slice(0, n).replace(/-+$/, '');
const hasForbidden = (texts) => texts.some((t) => FORBIDDEN.some(([re]) => re.test(String(t))));
const no = (why, extra = {}) => ({ ok: false, why, ...extra });

function csvTable(text, ext) {
  const nl = text.indexOf('\n');
  const headLine = nl < 0 ? text : text.slice(0, nl);
  let delim = '\t';
  if (ext !== 'tsv') {
    const counts = [',', ';', '\t', '|'].map((d) => [d, headLine.split(d).length - 1]).sort((a, b) => b[1] - a[1]);
    delim = counts[0][1] > 0 ? counts[0][0] : ',';
  }
  const rows = parseCsv(text, delim);
  if (rows.length < 2) return no('no data rows');
  const head = rows[0].map((h) => h.trim());
  if (head.length < 2) return no('one column: no value beside a key');
  if (head.some((h) => !h)) return no('a header name is empty');
  if (new Set(head.map((h) => h.toLowerCase())).size !== head.length) return no('a header name is there twice');
  if (head.filter((h) => numOf(h) !== null).length * 2 > head.length) return no('no header: the first row is numbers');
  const data = rows.slice(1);
  if (data.length < MIN_TABLE_ROWS) return no('under ' + MIN_TABLE_ROWS + ' rows');
  if (data.filter((r) => r.length === head.length).length < data.length * 0.9) return no('the rows do not fit the header');
  const format = ext === 'tsv' ? 'tsv' : 'csv';
  const make = { format, ...(delim !== (format === 'tsv' ? '\t' : ',') ? { delimiter: delim } : {}) };
  return { ok: true, format, make, recs: recordsOf(text, make, format), columns: head };
}

function jsonTable(text, ext) {
  let make = null;
  if (ext === 'jsonl') make = { format: 'jsonl' };
  else {
    let doc;
    try { doc = JSON.parse(text); } catch { doc = undefined; }
    if (doc === undefined) {
      try { if (jsonLines(text).length) make = { format: 'jsonl' }; } catch { return no('not JSON'); }
      if (!make) return no('not JSON');
    } else if (Array.isArray(doc)) make = { format: 'json' };
    else if (isObj(doc)) {
      let best = null;
      for (const [k, v] of Object.entries(doc)) {
        if (!Array.isArray(v) || !/^[A-Za-z0-9_$-]{1,60}$/.test(k) || v.filter(isObj).length < MIN_TABLE_ROWS) continue;
        if (best === null || v.length > doc[best].length) best = k;
      }
      if (best !== null) make = { format: 'json', root: best };
      else if (Object.values(doc).filter(isObj).length >= MIN_TABLE_ROWS) make = { format: 'json', entries: true };
      else return no('no array of records');
    } else return no('not a JSON table');
  }
  let recs;
  try { recs = recordsOf(text, make, 'json').filter(isObj); } catch (e) { return no(first(e)); }
  if (recs.length < MIN_TABLE_ROWS) return no('under ' + MIN_TABLE_ROWS + ' records');
  const sample = recs.slice(0, 2000);
  const cnt = new Map();
  for (const r of sample) for (const [k, v] of Object.entries(r)) if (typeof v === 'string' || typeof v === 'number') cnt.set(k, (cnt.get(k) || 0) + 1);
  const columns = [...cnt].filter(([, n]) => n >= sample.length * 0.8).map(([k]) => k).slice(0, 60);
  if (columns.length < 2) return no('under two columns');
  return { ok: true, format: make.format, make, recs, columns };
}

/**
 * The table a fetched file holds, read by absorb's own parser (parseCsv, recordsOf, jsonLines) as DATA: { ok, format,
 * make (format, delimiter, root, entries: what recordsOf needs), recs, columns } or { ok: false, why }. A header, at
 * least MIN_TABLE_ROWS rows and two columns, or it is not a table.
 */
export function tableOf(bytes, url) {
  const ext = extOf(url);
  const text = decode(bytes);
  if (ext === 'csv' || ext === 'tsv') return csvTable(text, ext);
  if (ext === 'json' || ext === 'jsonl') return jsonTable(text, ext);
  return no('not a table file (' + (ext || 'no extension') + ')');
}

/** Per column, over the first 5000 records: fill, distinct values, uniqueness, letters, numbers, links, mean length. */
export function columnStats(recs, columns) {
  const sample = recs.slice(0, 5000);
  const n = Math.max(1, sample.length);
  return columns.filter((c) => ADDRESSABLE.test(c) && labelOf(c) !== null).map((c, index) => {
    let fill = 0, letters = 0, nums = 0, urlish = 0, len = 0;
    const distinct = new Set();
    for (const r of sample) {
      const raw = getPath(r, c);
      const v = clean(raw);
      if (v === null) continue;
      fill++;
      len += v.length;
      distinct.add(normKey(v));
      if (/\p{L}/u.test(v)) letters++;
      if (numOf(raw) !== null) nums++;
      if (URLISH.test(v)) urlish++;
    }
    const f = Math.max(1, fill);
    return { c, index, label: labelOf(c), fill: fill / n, distinct: distinct.size, uniq: distinct.size / f, letters: letters / f, nums: nums / f, urlish: urlish / f, meanLen: len / f };
  });
}

/** The key-like column: filled, unique, at least MIN_TABLE_ROWS distinct short values, words (or a year); a name-like header first. */
export function keyColumn(stats) {
  const ok = stats.filter((s) => s.fill >= 0.9 && s.uniq >= 0.95 && s.distinct >= MIN_TABLE_ROWS && s.meanLen <= 50 && s.urlish < 0.5 && (s.letters >= 0.5 || YEARISH.test(s.label)));
  ok.sort((a, b) => (NAMEISH.test(b.label) - NAMEISH.test(a.label)) || (a.index - b.index));
  return ok[0] || null;
}

/** The value columns beside a key: filled, short, at least two values, not links, not a copy of the key; numeric or text. */
export function valueColumns(recs, stats, key) {
  const sample = recs.slice(0, 5000);
  const out = [];
  for (const s of stats) {
    if (s.c === key.c || s.label === key.label || s.fill < 0.8 || s.meanLen > 60 || s.distinct < 2 || s.urlish >= 0.5) continue;
    let same = 0, both = 0;
    for (const r of sample) {
      const k = clean(getPath(r, key.c)), v = clean(getPath(r, s.c));
      if (k === null || v === null) continue;
      both++;
      if (normKey(k) === normKey(v)) same++;
    }
    if (both && same / both > 0.5) continue;
    out.push({ ...s, numeric: s.nums >= 0.95 && s.distinct >= 5 });
  }
  return out;
}

// ---- the registry row: absorb's exact shape, proved by absorb's own adapter and validator before it is written
const fillLabels = (t, kl, vl) => String(t).replace(/\{kl\}/g, kl).replace(/\{vl\}/g, vl);
/** Every task name a relation or numeric spec makes (absorb's taskNamesOf on a one-spec row). */
const specNames = (kind, field, spec) => taskNamesOf({ kind, make: { [field]: [spec] } });
/**
 * A task name for a spec: <value>-of-<key>, cut so every name it makes stays inside absorb's MAX_BASE, then 4 hex of the
 * URL and the column; another 4 hex while a name it makes is taken (the registry, the ledger, a locked class, this step).
 */
function nameSpec(kind, field, url, key, val, taken, build) {
  const cut = field === 'relations' ? MAX_BASE - 4 - 5 : MAX_BASE - 8 - 5;
  for (let i = 0; i < 16; i++) {
    const task = stem(val.label + ' of ' + key.label, cut) + '-' + hex(url + '\u0000' + val.c + '\u0000' + i).slice(0, 4);
    const spec = build(task);
    const names = specNames(kind, field, spec);
    if (names.every((n) => TASK_RE.test(n) && n.length <= MAX_BASE && !taken.has(n))) return spec;
  }
  return null;
}
/** A registry id: fr-<repo>-<file>-<6 hex of the URL> (absorb's ID_RE), another 6 hex while taken. */
export function idOf(url, ids) {
  const r = rawParts(url);
  const file = r ? r.path.split('/').pop().replace(/\.[A-Za-z0-9]+$/, '') : 'table';
  const base = 'fr-' + (stem((r ? r.repo + '-' : '') + file, 50) || 'table');
  for (let i = 0; i < 16; i++) {
    const id = base + '-' + hex(url + '\u0000' + i).slice(0, 6);
    if (ID_RE.test(id) && !ids.has(id)) return id;
  }
  return null;
}
/** Tasks of a registry row that absorb's adapter opens AND that split into a dev and a held-out set (0 when it throws). */
export function provedTasks(bytes, row) {
  try { return ADAPTERS[row.kind](bytes, { ...row.make, domain: row.domain }).filter((t) => splitTask(t.rows).ok).length; } catch { return 0; }
}
/**
 * The registry row a fetched table becomes, in absorb's exact shape ({ id, kind, domain, license, url, checked: { at,
 * status, bytes, sha256 }, make }), or { ok: false, why }. Text value columns make a csv/json-relation (both directions),
 * else numeric ones a csv/json-numeric; a spec whose tasks do not split is left out; the row must pass absorb's
 * sourceErrors. Every label is the column name cut to a-z, digits and spaces: a header is data, never an instruction.
 */
export function candidateOf(bytes, url, { domain, license, at, taken = new Set(), ids = new Set(), locked = new Set() }) {
  const t = tableOf(bytes, url);
  if (!t.ok) return no(t.why, { index: true });
  const stats = columnStats(t.recs, t.columns);
  const key = keyColumn(stats);
  if (!key) return no('no key-like column');
  const vals = valueColumns(t.recs, stats, key);
  if (!vals.length) return no('no value column');
  const id = idOf(url, ids);
  if (!id) return no('no free id');
  const base = t.format === 'csv' || t.format === 'tsv' ? 'csv' : 'json';
  const checked = { at, status: 200, bytes: bytes.length, sha256: sha256(bytes) };
  const tries = [
    [base + '-relation', 'relations', vals.filter((v) => !v.numeric), (task, v) => ({
      key: key.c, value: v.c, keyLabel: key.label, valueLabel: v.label, task,
      templates: FWD_TEMPLATES.map((x) => fillLabels(x, key.label, v.label)), answer: fillLabels(FWD_ANSWER, key.label, v.label),
    }), MAX_REL],
    [base + '-numeric', 'numerics', vals.filter((v) => v.numeric), (task, v) => ({ key: key.c, value: v.c, noun: v.label, task }), MAX_NUM],
  ];
  const whys = [];
  for (const [kind, field, cols, build, most] of tries) {
    const names = new Set(taken);
    const specs = [];
    for (const v of cols) {
      if (specs.length >= most) break;
      const spec = nameSpec(kind, field, url, key, v, names, (task) => build(task, v));
      if (!spec) continue;
      const texts = [...(spec.templates || []), spec.answer || '', spec.keyLabel || '', spec.valueLabel || '', spec.noun || ''];
      if (hasForbidden(texts)) { whys.push(v.c + ': a label holds a FORBIDDEN word'); continue; }
      const one = { id, kind, domain, license, url, checked, make: { ...t.make, [field]: [spec] } };
      if (provedTasks(bytes, one) < 1) { whys.push(v.c + ': no task that splits'); continue; }
      specs.push(spec);
      for (const n of specNames(kind, field, spec)) names.add(n);
    }
    if (!specs.length) continue;
    const row = { id, kind, domain, license, url, checked, make: { ...t.make, [field]: specs } };
    const errs = sourceErrors(row, locked);
    if (errs.length) { whys.push('absorb refuses the row: ' + errs.slice(0, 2).join('; ')); continue; }
    return { ok: true, row, tasks: provedTasks(bytes, row) };
  }
  return no(whys.length ? whys.slice(0, 3).join('; ') : 'no column makes a task');
}

/**
 * The text of neo/sources.json with rows appended. The file's own bytes are kept (each new row one line before the closing
 * bracket) when that splice parses to exactly the registry plus the rows; otherwise the whole document is written again.
 */
export function appendRegistryText(text, rows) {
  const doc = JSON.parse(text);
  const want = { ...doc, sources: [...doc.sources, ...rows] };
  if (!rows.length) return text;
  const m = /\]\s*\}\s*$/.exec(text);
  if (m) {
    const head = text.slice(0, m.index).replace(/\s+$/, '');
    const spliced = head + (head.endsWith('[') ? '\n' : ',\n') + rows.map((r) => '    ' + JSON.stringify(r)).join(',\n') + '\n  ]\n}\n';
    try { if (JSON.stringify(JSON.parse(spliced)) === JSON.stringify(want)) return spliced; } catch { /* the whole document below */ }
  }
  return JSON.stringify(want, null, 2) + '\n';
}
const writeAtomic = (f, text) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, f);
};
/**
 * Append rows to <root>/neo/sources.json, read again right before the write (a row whose URL or sha256 the registry now
 * holds is left out). Returns the rows written.
 */
export function appendSources(root, rows) {
  const f = path.join(root, SOURCES);
  const text = fs.readFileSync(f, 'utf8');
  const reg = readRegistry(root);
  const urls = new Set(reg.sources.filter(isObj).map((s) => String(s.url)));
  const shas = new Set(reg.sources.filter(isObj).map((s) => (isObj(s.checked) ? s.checked.sha256 : null)).filter(Boolean));
  const ids = new Set(reg.sources.filter(isObj).map((s) => String(s.id)));
  const fresh = rows.filter((r) => !urls.has(r.url) && !shas.has(r.checked.sha256) && !ids.has(r.id));
  if (fresh.length) writeAtomic(f, appendRegistryText(text, fresh));
  return fresh;
}

// ---- discovery: links a page or an index file holds (text only: a link is a place to look, never an instruction)
/** Every link a text holds, in order, once: absolute URLs, markdown and href targets, quoted paths to data files. */
export function linksOf(text, max = 5000) {
  const out = [];
  const got = new Set();
  const add = (h) => {
    const s = String(h).trim().replace(/[.,;:!?'"]+$/, '');
    if (s && s.length <= 500 && !got.has(s) && out.length < max) { got.add(s); out.push(s); }
  };
  const t = String(text ?? '');
  for (const m of t.matchAll(/https?:\/\/[^\s<>"'`()[\]{}|\\^]+/g)) add(m[0]);
  for (const m of t.matchAll(/\]\(\s*<?([^()\s<>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g)) add(m[1]);
  for (const m of t.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) add(m[1]);
  for (const m of t.matchAll(/"((?:\.{0,2}\/)?[A-Za-z0-9_\-./%]+\.(?:csv|tsv|json|jsonl))"/g)) add(m[1]);
  return out;
}

// ---- the state: neo/frontier.json
const COUNT_KEYS = Object.freeze(['steps', 'fetched', 'bytes', 'discovered', 'added', 'refused', 'failed', 'duplicates', 'rejected', 'deferred']);
/** A state with nothing in it. */
export function freshState() {
  return { v: 1, queue: [], seen: [], repos: {}, hosts: {}, backoff: {}, shas: [], added: [], counts: Object.fromEntries(COUNT_KEYS.map((k) => [k, 0])) };
}
const itemOk = (q) => isObj(q) && typeof q.u === 'string' && own(PRIORITY, q.k) && q.k !== 'wait';
const numMap = (o) => (isObj(o) ? Object.fromEntries(Object.entries(o).filter(([, v]) => Number.isFinite(v))) : {});
/**
 * neo/frontier.json, every field checked (a field of the wrong shape is its empty value). A file that is not JSON is set
 * aside as neo/frontier.corrupt.json and the frontier starts again (it is a crawl cache: the registry keeps what it found).
 * @returns {{ state: object, repaired: boolean }}
 */
export function readState(root) {
  const f = path.join(root, FRONTIER);
  let text;
  try { text = fs.readFileSync(f, 'utf8'); } catch { return { state: freshState(), repaired: false }; }
  let doc;
  try { doc = JSON.parse(text); } catch { doc = null; }
  if (!isObj(doc)) {
    try { fs.renameSync(f, path.join(root, 'neo', 'frontier.corrupt.json')); } catch { /* the write below replaces it */ }
    return { state: freshState(), repaired: true };
  }
  const s = freshState();
  if (Array.isArray(doc.queue)) s.queue = doc.queue.filter(itemOk).slice(0, QUEUE_MAX);
  if (Array.isArray(doc.seen)) s.seen = doc.seen.filter((k) => typeof k === 'string' && /^[0-9a-f]{16}$/.test(k)).slice(-SEEN_MAX);
  if (isObj(doc.repos)) for (const [k, r] of Object.entries(doc.repos)) if (isObj(r) && NAME_RE.test(String(r.o)) && NAME_RE.test(String(r.r))) s.repos[k] = { o: r.o, r: r.r, b: typeof r.b === 'string' && r.b ? r.b : 'HEAD', l: typeof r.l === 'string' && r.l ? r.l : null, lc: r.lc === true, d: typeof r.d === 'string' ? r.d : null, t: Number.isFinite(r.t) ? r.t : null, more: r.more === true, n: Number.isFinite(r.n) ? r.n : 0 };
  s.hosts = numMap(doc.hosts);
  s.backoff = numMap(doc.backoff);
  if (Array.isArray(doc.shas)) s.shas = doc.shas.filter((x) => typeof x === 'string' && /^[0-9a-f]{64}$/.test(x)).slice(-ADDED_KEEP);
  if (Array.isArray(doc.added)) s.added = doc.added.filter(isObj).slice(-ADDED_KEEP);
  if (isObj(doc.counts)) for (const k of COUNT_KEYS) if (Number.isFinite(doc.counts[k])) s.counts[k] = doc.counts[k];
  return { state: s, repaired: false };
}
export const writeState = (root, s) => writeAtomic(path.join(root, FRONTIER), JSON.stringify(s) + '\n');

/**
 * The seeds: <root>/neo/frontier-seeds.json, or this tree's own when the root has none. { seeds: rows that pass,
 * refused: [why] }. A seed is { url (raw, a kind the frontier reads), domain, license, checked: { at, status } }.
 */
export function readSeeds(root) {
  let text = null;
  for (const r of [root, CODE_ROOT]) { try { text = fs.readFileSync(path.join(r, SEEDS), 'utf8'); break; } catch { text = null; } }
  if (text === null) return { seeds: [], refused: [SEEDS + ' is missing'] };
  let doc;
  try { doc = JSON.parse(text); } catch (e) { return { seeds: [], refused: [SEEDS + ' is not JSON (' + first(e) + ')'] }; }
  const rows = isObj(doc) && Array.isArray(doc.seeds) ? doc.seeds : [];
  const seeds = [], refused = [];
  for (const s of rows) {
    const why = !isObj(s) ? 'not an object' : refusal(s.url, 'data') || (!classify(s.url) ? 'not a page, datapackage or table' : !rawParts(s.url) ? 'not a repository file' : !words(s.domain) ? 'no domain' : !words(s.license) ? 'no licence' : '');
    if (why) refused.push(String(isObj(s) ? s.url : s).slice(0, 120) + ': ' + why);
    else seeds.push(s);
  }
  return { seeds, refused };
}
const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch { return ''; } };
const domainOf = (s) => (typeof s === 'string' && slug(s) ? slug(s).slice(0, 40) : 'open-data');
/** Files a tree listing never offers as a table: tooling, tests, vendored code. */
export const JUNK_RE = /(^|\/)(node_modules|\.github|\.vscode|\.devcontainer|vendor|dist|build|tests?|spec|__tests__|fixtures?)\/|(^|\/)(package(-lock)?|composer|tsconfig[^/]*|jsconfig|bower|lerna|renovate|manifest|\.?eslintrc[^/]*|\.?babelrc|vercel|netlify|app|angular|tslint|firebase|now|deno|turbo|nx|project|workspace|settings|launch|extensions|datapackage)\.json$/i;
const extRank = (p) => (/\.(csv|tsv)$/i.test(p) ? 0 : 1);
const dataDir = (p) => (/(^|\/)data\//i.test(p) ? 0 : 1);
const depthOf = (p) => p.split('/').length - 1;
const extP = (p) => ((/\.([A-Za-z0-9]{1,8})$/.exec(p) || [])[1] || '').toLowerCase();
const treeRank = (a, b) => extRank(a.path) - extRank(b.path) || dataDir(a.path) - dataDir(b.path) || depthOf(a.path) - depthOf(b.path) || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

// ---- the step
/**
 * One step: the seeds not yet seen and every repository the registry names join the queue; then, until the time, byte,
 * fetch or add budget is spent, the next item (a licence first, then datapackages, tables, pages, trees; a host that
 * asked to slow down is left alone) is fetched one request a second per host and read: a tree listing offers its files,
 * a licence names the repository's licence, a datapackage its resources, a page its links, a table becomes a registry
 * row when it is real. The rows are appended to neo/sources.json; the state is written to neo/frontier.json.
 * @param {string} root
 * @param {{ fetch?: Function, env?: object, clock?: () => number, sleep?: (ms: number) => Promise<void>, now?: () => string,
 *   maxMs?: number, maxAdd?: number, maxBytes?: number, maxFetchBytes?: number, fetchTimeoutMs?: number, maxFetches?: number, era?: number|null }} o
 */
export async function step(root, o = {}) {
  const {
    fetch: fetchFn = globalThis.fetch, env = process.env, clock = () => Date.now(), sleep = sleepReal, now = () => new Date().toISOString(),
    maxMs = DEFAULTS.maxMs, maxAdd = DEFAULTS.maxAdd, maxBytes = DEFAULTS.maxBytes, maxFetchBytes = DEFAULTS.maxFetchBytes,
    fetchTimeoutMs = DEFAULTS.fetchTimeoutMs, maxFetches = DEFAULTS.maxFetches, era = null,
  } = o;
  const t0 = clock();
  const deadline = t0 + maxMs;
  const cap = Math.max(0, Math.min(MAX_ADD, Math.floor(Number(maxAdd) || 0)));
  const token = isObj(env) && typeof env[TOKEN_NAME] === 'string' ? env[TOKEN_NAME].trim() : '';
  const reg = readRegistry(root);
  const sources = reg.sources.filter(isObj);
  const locked = new Set(lockedClasses(root));
  let ledgerNames = [];
  try { ledgerNames = readLedger(root).tasks.map((r) => r.task); } catch { ledgerNames = []; }
  const { state, repaired } = readState(root);
  const taken = new Set([...locked, ...ledgerNames, ...sources.flatMap((s) => { try { return taskNamesOf(s); } catch { return []; } })]);
  const ids = new Set(sources.map((s) => String(s.id)));
  const regUrls = new Set(sources.map((s) => String(s.url)));
  const shas = new Set([...state.shas, ...sources.map((s) => (isObj(s.checked) ? s.checked.sha256 : null)).filter((x) => typeof x === 'string')]);
  const seen = new Set(state.seen);
  const queued = new Set(state.queue.map((q) => q.u));
  const out = { fetched: 0, bytes: 0, discovered: 0, seeded: 0, refused: 0, failed: 0, duplicates: 0, rejected: 0, deferred: 0 };
  const notes = [];
  const note = (s) => { if (notes.length < 12) notes.push(scrub(String(s), token).slice(0, 240)); };
  const added = [];
  const tasksOf = new Map();

  // every URL pushed is built by rawUrl or treeUrl from checked names, or passed linkTarget or readSeeds: the allowlist
  // is applied again when an item leaves the queue (a hand-edited state file) and on every hop of its fetch
  const push = (item, seed = false) => {
    if (queued.has(item.u) || (item.k !== 'tree' && seen.has(seenKey(item.u))) || (item.k === 'table' && regUrls.has(item.u))) return false;
    if (state.queue.length >= QUEUE_MAX) return false;
    state.queue.push({ u: item.u, k: item.k, d: item.d || null, o: item.o, r: item.r, b: item.b, f: String(item.f || '').slice(0, 200) });
    queued.add(item.u);
    if (seed) out.seeded++; else out.discovered++;
    return true;
  };
  const repoFor = (owner, repo, branch, d) => {
    if (!NAME_RE.test(String(owner)) || !NAME_RE.test(String(repo))) return null;
    const key = repoKey(owner, repo);
    if (!state.repos[key]) {
      if (Object.keys(state.repos).length >= REPOS_MAX) return null;
      state.repos[key] = { o: owner, r: repo, b: branch || 'HEAD', l: null, lc: false, d: d || null, t: null, more: false, n: 0 };
    }
    return state.repos[key];
  };
  // a repository's tree is a place to look: once, until it is listed again
  const look = (owner, repo, branch, d, f) => {
    const r = repoFor(owner, repo, branch, d);
    if (r && r.t === null) push({ u: treeUrl(r.o, r.r, r.b), k: 'tree', d: r.d, o: r.o, r: r.r, b: r.b, f });
    return r;
  };

  // the seeds not yet seen, then every repository the registry names (the absorbed ones are new places to look)
  const sd = readSeeds(root);
  for (const why of sd.refused) note('seed refused: ' + why);
  for (const s of sd.seeds) {
    const p = rawParts(s.url);
    const r = repoFor(p.owner, p.repo, p.branch, domainOf(s.domain));
    if (r && !r.l) r.l = licenseName(s.license);
    push({ u: s.url, k: classify(s.url), d: domainOf(s.domain), o: p.owner, r: p.repo, b: p.branch, f: 'seed' }, true);
  }
  for (const s of sources) {
    const p = rawParts(s.url);
    if (!p) continue;
    const r = repoFor(p.owner, p.repo, p.branch, domainOf(s.domain));
    if (r && !r.l && isOpen(s.license)) r.l = licenseName(s.license);
    look(p.owner, p.repo, p.branch, domainOf(s.domain), 'registry');
  }
  // nothing left to read but trees: a repository with files not yet offered, or listed long ago, is listed again
  if (!state.queue.some((q) => q.k !== 'tree')) {
    let n = 0;
    for (const r of Object.values(state.repos)) {
      if (n >= 20) break;
      if (r.t !== null && (r.more || t0 - r.t > RELIST_MS) && push({ u: treeUrl(r.o, r.r, r.b), k: 'tree', d: r.d, o: r.o, r: r.r, b: r.b, f: 'relist' })) n++;
    }
  }

  const onTree = (item, bytes) => {
    const tp = treeParts(item.u);
    const r = tp ? repoFor(tp.owner, tp.repo, tp.branch, item.d) : null;
    if (!r) { out.failed++; note(item.u + ': not a repository listing'); return; }
    r.t = clock();
    r.more = false;
    let doc;
    try { doc = JSON.parse(decode(bytes)); } catch { doc = null; }
    if (!isObj(doc) || !Array.isArray(doc.tree)) { out.failed++; note(item.u + ': not a tree listing'); return; }
    const blobs = doc.tree.filter((e) => isObj(e) && e.type === 'blob' && typeof e.path === 'string' && e.path.length <= 300 && !e.path.split('/').some((g) => g === '' || g === '.' || g === '..'));
    const at = (k, p) => push({ u: rawUrl(r.o, r.r, tp.branch, p), k, d: r.d, o: r.o, r: r.r, b: tp.branch, f: item.u });
    if (!r.lc && !r.l) { const lic = blobs.find((e) => /^(licen[cs]e|copying)(\.(md|txt|markdown))?$/i.test(e.path)); if (lic) at('license', lic.path); }
    for (const e of blobs) {
      const base = e.path.split('/').pop().toLowerCase();
      if (base === 'datapackage.json' && depthOf(e.path) <= 2) at('datapackage', e.path);
      else if (depthOf(e.path) === 0 && /^readme(\.(md|markdown|rst|txt))?$/.test(base)) at('page', e.path);
    }
    const cands = blobs.filter((e) => DATA_EXT.includes(extP(e.path)) && !JUNK_RE.test(e.path) && (!Number.isFinite(e.size) || (e.size >= 64 && e.size <= maxFetchBytes))).sort(treeRank);
    let n = 0;
    for (const e of cands) {
      if (n >= PER_TREE) { r.more = true; break; }
      if (at('table', e.path)) n++;
    }
  };
  const onLicense = (item, bytes) => {
    const r = repoFor(item.o, item.r, item.b, item.d);
    if (!r) return;
    r.lc = true;
    const name = licenseOf(decode(bytes));
    if (name && !r.l) r.l = name;
    if (!name) note(item.u + ': names no licence the frontier knows');
  };
  const onPage = (item, bytes, onlyData = false) => {
    const text = decode(bytes.subarray(0, PAGE_BYTES));
    const r = repoFor(item.o, item.r, item.b, item.d);
    const p = rawParts(item.u);
    if (!onlyData && r && !r.l && p && !p.path.includes('/')) { const lic = licenseSection(text); if (lic) r.l = lic; }
    let n = 0;
    for (const h of linksOf(text)) {
      if (n >= PER_PAGE) break;
      const t = linkTarget(h, item.u);
      if (!t) continue;
      if (t.refused) { out.refused++; continue; }
      if (onlyData && t.k !== 'table' && t.k !== 'datapackage') continue;
      if (t.k === 'page' && !/^readme/i.test(String(rawParts(t.u)?.path || '').split('/').pop())) continue;
      if (t.k === 'tree') {
        const rr = repoFor(t.owner, t.repo, t.branch, item.d);
        if (rr && rr.t === null && push({ u: treeUrl(rr.o, rr.r, rr.b), k: 'tree', d: rr.d, o: rr.o, r: rr.r, b: rr.b, f: item.u })) n++;
        continue;
      }
      if (repoKey(t.owner, t.repo) !== repoKey(item.o, item.r)) look(t.owner, t.repo, t.branch, item.d, item.u);
      if (push({ u: t.u, k: t.k, d: item.d, o: t.owner, r: t.repo, b: t.branch, f: item.u })) n++;
    }
    if (!onlyData) look(item.o, item.r, item.b, item.d, item.u);
  };
  const onPackage = (item, bytes) => {
    const r = repoFor(item.o, item.r, item.b, item.d);
    let d;
    try { d = JSON.parse(decode(bytes)); } catch { d = null; }
    if (!isObj(d)) { out.rejected++; note(item.u + ': not a datapackage'); return; }
    const lic = packageLicense(d);
    if (r && lic && !r.l) r.l = lic;
    for (const res of (Array.isArray(d.resources) ? d.resources : []).slice(0, PER_PAGE)) {
      if (!isObj(res)) continue;
      const p = Array.isArray(res.path) ? res.path[0] : typeof res.path === 'string' ? res.path : res.url;
      if (typeof p !== 'string') continue;
      const t = linkTarget(p, item.u);
      if (!t) continue;
      if (t.refused) { out.refused++; note('refused ' + p.slice(0, 120) + ': ' + t.refused); continue; }
      if (t.k !== 'table') continue;
      if (repoKey(t.owner, t.repo) !== repoKey(item.o, item.r)) look(t.owner, t.repo, t.branch, item.d, item.u);
      push({ u: t.u, k: 'table', d: item.d, o: t.owner, r: t.repo, b: t.branch, f: item.u });
    }
    look(item.o, item.r, item.b, item.d, item.u);
  };
  const onTable = (item, bytes) => {
    const sha = sha256(bytes);
    if (shas.has(sha)) { out.duplicates++; return; }
    const r = repoFor(item.o, item.r, item.b, item.d);
    const cand = candidateOf(bytes, item.u, { domain: domainOf(item.d || (r && r.d)), license: r && r.l, at: now(), taken, ids, locked });
    if (!cand.ok) {
      out.rejected++;
      note(item.u + ': ' + cand.why);
      if (cand.index) onPage(item, bytes, true);
      return;
    }
    added.push(cand.row);
    tasksOf.set(cand.row.id, cand.tasks);
    shas.add(sha);
    regUrls.add(item.u);
    ids.add(cand.row.id);
    for (const nm of taskNamesOf(cand.row)) taken.add(nm);
    if (r) r.n += 1;
    look(item.o, item.r, item.b, item.d, item.u);
  };

  const pick = () => {
    const nowMs = clock();
    let best = -1, bp = Infinity;
    for (let i = 0; i < state.queue.length; i++) {
      const q = state.queue[i];
      if (parked.has(q.u)) continue;
      if ((state.backoff[hostOf(q.u)] || 0) > nowMs) continue;
      const p = q.w ? PRIORITY.wait : PRIORITY[q.k];
      if (p < bp) { bp = p; best = i; if (p === 0) break; }
    }
    return best;
  };
  const parked = new Set();
  let fetches = 0;
  while (added.length < cap && fetches < maxFetches && out.bytes < maxBytes && clock() < deadline) {
    const i = pick();
    if (i < 0) break;
    const item = state.queue.splice(i, 1)[0];
    queued.delete(item.u);
    const purpose = purposeOf(item.k);
    const host = hostOf(item.u);
    const why = refusal(item.u, purpose);
    if (why) { out.refused++; note('refused ' + String(item.u).slice(0, 120) + ': ' + why); continue; }
    if (item.k !== 'tree' && seen.has(seenKey(item.u))) continue;
    if (item.k === 'table') {
      if (regUrls.has(item.u)) { out.duplicates++; seen.add(seenKey(item.u)); continue; }
      // a table is taken only under a named open licence: one wait for its repository's listing, then refused unfetched
      const r = repoFor(item.o, item.r, item.b, item.d);
      const lic = r ? r.l : null;
      if (!lic || !isOpen(lic)) {
        // still waiting for its repository's listing (a host that asked to slow down): it waits for the next step
        if (item.w && r && lic === null && r.t === null) { state.queue.push(item); queued.add(item.u); parked.add(item.u); continue; }
        if (!item.w && r && lic === null && (r.t === null || !r.lc)) {
          item.w = 1;
          state.queue.push(item);
          queued.add(item.u);
          out.deferred++;
          look(item.o, item.r, item.b, item.d, item.u);
          continue;
        }
        out.rejected++;
        seen.add(seenKey(item.u));
        note(item.u + ': ' + (lic ? 'the licence ' + lic + ' is not open' : 'no licence named'));
        continue;
      }
    }
    // one request a second per host
    const wait = (state.hosts[host] || 0) + PER_HOST_MS - clock();
    if (wait > 0) {
      if (clock() + wait >= deadline) { state.queue.unshift(item); queued.add(item.u); break; }
      await sleep(wait);
    }
    const left = deadline - clock();
    if (left < 1) { state.queue.unshift(item); queued.add(item.u); break; }
    state.hosts[host] = clock();
    fetches++;
    let got;
    try {
      got = await fetchCapped(item.u, purpose, { fetch: fetchFn, timeoutMs: Math.max(1, Math.min(fetchTimeoutMs, left)), maxBytes: Math.max(1, Math.min(maxFetchBytes, maxBytes - out.bytes)), token, nowMs: clock() });
    } catch (e) {
      if (e instanceof FetchError && e.kind === 'rate') {
        state.backoff[host] = e.until;
        state.queue.push(item);
        queued.add(item.u);
        out.deferred++;
        note(host + ': ' + first(e));
        continue;
      }
      if (e instanceof FetchError && e.kind === 'refused') out.refused++;
      else out.failed++;
      if (item.k === 'tree') { const tp = treeParts(item.u); const r = tp ? repoFor(tp.owner, tp.repo, tp.branch, item.d) : null; if (r) r.t = clock(); }
      else seen.add(seenKey(item.u));
      note(String(item.u).slice(0, 160) + ': ' + first(e));
      continue;
    }
    out.fetched++;
    out.bytes += got.bytes.length;
    if (purpose === 'list' && got.remaining === 0 && got.reset) state.backoff[host] = got.reset * 1000 + 1000;
    if (item.k !== 'tree') seen.add(seenKey(item.u));
    if (item.k === 'tree') onTree(item, got.bytes);
    else if (item.k === 'license') onLicense(item, got.bytes);
    else if (item.k === 'datapackage') onPackage(item, got.bytes);
    else if (item.k === 'page') onPage(item, got.bytes);
    else onTable(item, got.bytes);
  }

  let written = [];
  if (added.length) {
    try { written = appendSources(root, added); } catch (e) { note('registry: ' + first(e)); for (const r of added) seen.delete(seenKey(r.url)); }
  }
  const at = now();
  for (const r of written) { state.added.push({ id: r.id, url: r.url, sha256: r.checked.sha256, at, era }); state.shas.push(r.checked.sha256); }
  state.added = state.added.slice(-ADDED_KEEP);
  state.shas = state.shas.slice(-ADDED_KEEP);
  state.seen = [...seen].slice(-SEEN_MAX);
  state.queue = state.queue.slice(0, QUEUE_MAX);
  for (const [k, v] of Object.entries(state.backoff)) if (v <= clock()) delete state.backoff[k];
  const c = state.counts;
  c.steps++;
  for (const k of ['fetched', 'bytes', 'discovered', 'refused', 'failed', 'duplicates', 'rejected', 'deferred']) c[k] += out[k];
  c.added += written.length;
  writeState(root, state);
  return {
    era, fetched: out.fetched, bytes: out.bytes, discovered: out.discovered, added: written.length, refused: out.refused, queue: state.queue.length,
    ms: Math.max(0, clock() - t0), seeded: out.seeded, failed: out.failed, duplicates: out.duplicates, rejected: out.rejected, deferred: out.deferred,
    sources: written.map((r) => ({ id: r.id, kind: r.kind, url: r.url, license: r.license, domain: r.domain, tasks: tasksOf.get(r.id) || 0 })),
    ...(repaired ? { repaired: FRONTIER + ' was not JSON: set aside as neo/frontier.corrupt.json, a fresh state started' } : {}),
    notes,
  };
}

/** { queue, byKind, seen, repos, listed, licensed, sources, added, counts, backoff }: what neo/frontier.json holds. Reads only. */
export function status(root) {
  const f = path.join(root, FRONTIER);
  let state = freshState();
  if (fs.existsSync(f)) {
    let doc = null;
    try { doc = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { doc = null; }
    if (!isObj(doc)) throw new Fail(FRONTIER + ' is not JSON: the next step sets it aside and starts again');
    state = readState(root).state;
  }
  let sources = null;
  try { sources = readRegistry(root).sources.length; } catch { sources = null; }
  const repos = Object.values(state.repos);
  const byKind = {};
  for (const q of state.queue) byKind[q.k] = (byKind[q.k] || 0) + 1;
  return {
    queue: state.queue.length, byKind, seen: state.seen.length, repos: repos.length, listed: repos.filter((r) => r.t !== null).length,
    licensed: repos.filter((r) => r.l).length, sources, added: state.added.length, counts: state.counts,
    backoff: Object.keys(state.backoff).filter((h) => state.backoff[h] > Date.now()),
  };
}

/** { seeds, domains, repos, refused }: the seed file checked offline (no fetch). */
export function seedsStatus(root) {
  const s = readSeeds(root);
  return {
    seeds: s.seeds.length, domains: new Set(s.seeds.map((x) => domainOf(x.domain))).size,
    repos: new Set(s.seeds.map((x) => { const p = rawParts(x.url); return repoKey(p.owner, p.repo); })).size, refused: s.refused,
  };
}

// ---- arguments and main
const VALUE = new Set(['root', 'max-ms', 'era', 'max-add', 'max-bytes', 'max-fetch-bytes', 'fetch-timeout-ms', 'max-fetches']);
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

/** The CLI as a function: the printed object, or { usage: true }. o.fetch, o.env, o.clock, o.sleep and o.now replace the world (a test's stubs). */
export async function main(argv, o = {}) {
  const { verb, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  const root = flags.root ? path.resolve(flags.root) : CODE_ROOT;
  if (verb === 'step') {
    return await step(root, {
      ...o,
      maxMs: intOf(flags, 'max-ms', 1, LIMITS.maxMs, DEFAULTS.maxMs),
      era: intOf(flags, 'era', 0, Number.MAX_SAFE_INTEGER, null),
      maxAdd: intOf(flags, 'max-add', 1, LIMITS.maxAdd, DEFAULTS.maxAdd),
      maxBytes: intOf(flags, 'max-bytes', 1, LIMITS.maxBytes, DEFAULTS.maxBytes),
      maxFetchBytes: intOf(flags, 'max-fetch-bytes', 1, LIMITS.maxFetchBytes, DEFAULTS.maxFetchBytes),
      fetchTimeoutMs: intOf(flags, 'fetch-timeout-ms', 1, LIMITS.fetchTimeoutMs, DEFAULTS.fetchTimeoutMs),
      maxFetches: intOf(flags, 'max-fetches', 1, LIMITS.maxFetches, DEFAULTS.maxFetches),
    });
  }
  if (verb === 'status') return status(root);
  if (verb === 'seeds') return seedsStatus(root);
  throw new Fail('unknown verb ' + verb + ': step, status or seeds (--help)', 2);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  const tok = typeof process.env[TOKEN_NAME] === 'string' ? process.env[TOKEN_NAME] : '';
  main(process.argv.slice(2)).then((r) => { process.stdout.write(scrub(r.usage ? USAGE : JSON.stringify(r), tok) + '\n'); done(0); }, (e) => {
    const coded = e instanceof Error && Number.isInteger(e.code);
    process.stderr.write(scrub(coded ? e.message : 'frontier failed: ' + ((e && e.stack) || e), tok).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
