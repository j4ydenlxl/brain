// act/web.mjs: THE READING SURFACE. The organism reaches the open web here, and every
// page it reads comes back as TEXT with a label on it: origin 'web'.
//
// Two flaws are designed out of this file by construction, not by care.
//
// 1. SSRF. A url whose host is a loopback, link local, private, carrier private or cloud
//    metadata address is refused before a socket is opened, and refused again at every
//    redirect hop, because the hop is a url the SERVER chose and the policy never saw. A
//    literal address in decimal, octal or hexadecimal form is the same address written
//    differently, so the check runs on the parsed address and not on the spelling. The
//    allowlist ships empty: an unconfigured organism reaches nothing.
// 2. Prompt injection. Nothing in this file turns page text into an instruction. A page
//    becomes two things and no others: a signal whose data carries origin 'web', and
//    memory, written through the same path the mind corpus is written through. The
//    provenance travels with the text so that anything downstream can tell a web page from
//    the user's words. A surface that acts (act/prompt.mjs) refuses a proposal whose
//    evidence is only web origin text; this file gives it the label to refuse on.
//
// The residual risk, stated rather than hidden: DNS may answer differently between the
// check and the connect (rebinding). guardResolved pins what the name resolved to at check
// time and the answer is recorded, so a rebind is visible in the ledger afterwards even
// though this surface cannot prevent it without owning the socket.
import { lookup } from 'node:dns/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineKind, hasKind } from '../core/cell.mjs';
import { drain, propose, push, release, retain } from '../world/actuators.mjs';
import { feed } from '../mind/index.mjs';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const POLICY_FILE = path.join(HERE, 'policy.json');

/** The label every piece of text that came from outside carries. */
export const WEB_ORIGIN = 'web';
/** The cell kind webSense registers. */
export const WEB_SENSE_KIND = 'act.web.page';

// The shipped defaults. hosts is empty on purpose: an organism that was configured for
// nothing reaches nothing, and the refusal says so by counting the entries it had.
export const WEB_DEFAULTS = Object.freeze({
  hosts: [],
  maxBytes: 262144,
  timeoutMs: 5000,
  maxRedirects: 3,
  maxUrlChars: 2048,
  maxIngestChars: 4096,
  contentTypes: Object.freeze(['text/html', 'application/xhtml+xml', 'text/plain', 'text/markdown', 'application/json']),
  allowLoopbackForTests: false,
});

/**
 * Take whatever a caller handed in and return a full web policy. Accepts a bare object,
 * the { web: {...} } shape of act/policy.json, or null for the defaults.
 * @param {object|null} p
 * @returns {object} a frozen-shaped plain object with every field present
 */
export function normalizeWebPolicy(p) {
  const src = p && typeof p === 'object' ? (p.web && typeof p.web === 'object' ? p.web : p) : {};
  const num = (v, d, min = 0) => { const n = Number(v); return Number.isFinite(n) && n >= min ? n : d; };
  const strs = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.length).map((x) => x.trim().toLowerCase()) : []);
  const hosts = strs(src.hosts !== undefined ? src.hosts : src.allowedHosts);
  const types = strs(src.contentTypes);
  return {
    hosts,
    maxBytes: num(src.maxBytes, WEB_DEFAULTS.maxBytes, 1),
    timeoutMs: num(src.timeoutMs, WEB_DEFAULTS.timeoutMs, 1),
    maxRedirects: num(src.maxRedirects, WEB_DEFAULTS.maxRedirects, 0),
    maxUrlChars: num(src.maxUrlChars, WEB_DEFAULTS.maxUrlChars, 16),
    maxIngestChars: num(src.maxIngestChars, WEB_DEFAULTS.maxIngestChars, 1),
    contentTypes: types.length ? types : [...WEB_DEFAULTS.contentTypes],
    allowLoopbackForTests: src.allowLoopbackForTests === true,
  };
}

/**
 * The shipped policy from act/policy.json when that file exists, the defaults when it does
 * not. This never throws: a missing or broken policy file means the deny-all defaults, and
 * the caller is told which of the two it got.
 * @param {string} [file]
 * @returns {object} the policy, with .source naming where it came from
 */
export function loadWebPolicy(file = POLICY_FILE) {
  let raw = null, source = 'defaults';
  try {
    if (existsSync(file)) { raw = JSON.parse(readFileSync(file, 'utf8')); source = file; }
  } catch { raw = null; source = 'defaults (act/policy.json did not parse)'; }
  const pol = normalizeWebPolicy(raw);
  pol.source = source;
  return pol;
}

// ---------------------------------------------------------------- addresses
// Every address family this surface refuses, and the word it refuses it with. The words
// are part of the contract: a refusal that does not say what it saw is not evidence.
function blockedV4(o) {
  const [a, b] = o;
  if (a === 0) return 'this network (0.0.0.0/8)';
  if (a === 127) return 'loopback (127.0.0.0/8)';
  if (a === 10) return 'private (10.0.0.0/8)';
  if (a === 172 && b >= 16 && b <= 31) return 'private (172.16.0.0/12)';
  if (a === 192 && b === 168) return 'private (192.168.0.0/16)';
  if (a === 169 && b === 254) return o[2] === 169 && o[3] === 254 ? 'cloud metadata (169.254.169.254)' : 'link local (169.254.0.0/16)';
  if (a === 100 && b >= 64 && b <= 127) return 'carrier private (100.64.0.0/10)';
  if (a === 192 && b === 0 && o[2] === 0) return 'protocol assignment (192.0.0.0/24)';
  if (a === 198 && (b === 18 || b === 19)) return 'benchmark (198.18.0.0/15)';
  if (a >= 224 && a <= 239) return 'multicast (224.0.0.0/4)';
  if (a >= 240) return 'reserved (240.0.0.0/4)';
  return null;
}

/** A dotted quad, or null. Strict: four decimal octets, nothing else. */
function dottedQuad(host) {
  const parts = host.split('.');
  if (parts.length !== 4) return null;
  const out = [];
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const n = Number(p);
    if (n > 255) return null;
    out.push(n);
  }
  return out;
}

/**
 * The inet_aton forms: 2130706433, 0177.0.0.1, 0x7f.0.0.1, 127.1. The WHATWG url parser
 * already folds most of these into a dotted quad, which is why the check runs on the
 * parsed host; this parser is here so a form the parser leaves alone is still an address
 * to this surface and not an opaque name.
 * @param {string} host
 * @returns {number[]|null} four octets, or null when the host is not numeric at all
 */
export function looseIPv4(host) {
  const quad = dottedQuad(host);
  if (quad) return quad;
  const parts = host.split('.');
  if (parts.length < 1 || parts.length > 4) return null;
  const nums = [];
  for (const p of parts) {
    let n;
    if (/^0[xX][0-9a-fA-F]+$/.test(p)) n = parseInt(p.slice(2), 16);
    else if (/^0[0-7]+$/.test(p)) n = parseInt(p.slice(1), 8);
    else if (/^\d+$/.test(p)) n = Number(p);
    else return null;
    if (!Number.isFinite(n) || n < 0) return null;
    nums.push(n);
  }
  const last = nums[nums.length - 1];
  const lead = nums.slice(0, -1);
  if (lead.some((n) => n > 255)) return null;
  const room = Math.pow(256, 4 - lead.length);
  if (last >= room) return null;
  let value = last;
  for (let i = 0; i < lead.length; i++) value += lead[i] * Math.pow(256, 3 - i);
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}

/** The eight groups of an IPv6 literal, or null. Accepts the bracketed form. */
export function expandIPv6(raw) {
  let h = String(raw).trim();
  if (h.startsWith('[') && h.endsWith(']')) h = h.slice(1, -1);
  if (!h.includes(':')) return null;
  const zone = h.indexOf('%');
  if (zone >= 0) h = h.slice(0, zone);
  let tail4 = null;
  const lastColon = h.lastIndexOf(':');
  const tail = h.slice(lastColon + 1);
  if (tail.includes('.')) {
    const q = dottedQuad(tail);
    if (!q) return null;
    tail4 = [(q[0] << 8) | q[1], (q[2] << 8) | q[3]];
    h = h.slice(0, lastColon + 1) + '0:0';
  }
  const halves = h.split('::');
  if (halves.length > 2) return null;
  const parse = (s) => (s === '' ? [] : s.split(':').map((g) => (/^[0-9a-fA-F]{1,4}$/.test(g) ? parseInt(g, 16) : NaN)));
  const head = parse(halves[0]);
  const rest = halves.length === 2 ? parse(halves[1]) : [];
  if ([...head, ...rest].some((n) => Number.isNaN(n))) return null;
  let groups;
  if (halves.length === 2) {
    const gap = 8 - head.length - rest.length;
    if (gap < 0) return null;
    groups = [...head, ...new Array(gap).fill(0), ...rest];
  } else {
    groups = head;
  }
  if (groups.length !== 8) return null;
  if (tail4) { groups[6] = tail4[0]; groups[7] = tail4[1]; }
  return groups;
}

function blockedV6(groups) {
  const isZero = groups.slice(0, 7).every((g) => g === 0);
  if (isZero && groups[7] === 1) return 'loopback (::1)';
  if (isZero && groups[7] === 0) return 'unspecified (::)';
  // an IPv4 mapped address is an IPv4 address wearing a hat
  if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) {
    const v4 = [(groups[6] >> 8) & 255, groups[6] & 255, (groups[7] >> 8) & 255, groups[7] & 255];
    const why = blockedV4(v4);
    return why ? 'ipv4 mapped ' + v4.join('.') + ': ' + why : null;
  }
  const first = groups[0];
  if ((first & 0xfe00) === 0xfc00) return 'unique local (fc00::/7)';
  if ((first & 0xffc0) === 0xfe80) return 'link local (fe80::/10)';
  if ((first & 0xff00) === 0xff00) return 'multicast (ff00::/8)';
  return null;
}

/**
 * What an address literal is, and whether this surface will reach it.
 * @param {string} host a hostname, with no port, brackets allowed for IPv6
 * @returns {{literal: boolean, family: string|null, blocked: string|null, octets?: number[]}}
 */
export function classifyHost(host) {
  const h = String(host || '').toLowerCase();
  if (h.includes(':') || (h.startsWith('[') && h.endsWith(']'))) {
    const groups = expandIPv6(h);
    if (!groups) return { literal: true, family: 'ipv6', blocked: 'not a readable ipv6 address' };
    return { literal: true, family: 'ipv6', blocked: blockedV6(groups) };
  }
  const octets = looseIPv4(h);
  if (octets) return { literal: true, family: 'ipv4', blocked: blockedV4(octets), octets };
  return { literal: false, family: null, blocked: null };
}

// ---------------------------------------------------------------- guardUrl
/**
 * May this surface fetch this url at all. Synchronous, so it decides on the url alone: the
 * scheme, the shape, the literal address if the host is one, and the allowlist. The name
 * to address check that a hostname needs is guardResolved, and fetchPage runs both, on
 * every hop.
 *
 * @param {string} url
 * @param {object|null} policy a web policy, or the { web: {...} } shape of act/policy.json
 * @returns {{ok: boolean, reason: string|null, host: string|null, hostname?: string, url?: string, entry?: string, literal?: boolean}}
 */
export function guardUrl(url, policy = null) {
  const pol = normalizeWebPolicy(policy);
  if (typeof url !== 'string' || !url.length) return { ok: false, reason: 'not a url: ' + (url === null ? 'null' : typeof url), host: null };
  if (url.length > pol.maxUrlChars) return { ok: false, reason: 'the url is ' + url.length + ' chars, over the cap ' + pol.maxUrlChars, host: null };
  let u;
  try { u = new URL(url); } catch { return { ok: false, reason: 'not a url: ' + url.slice(0, 120), host: null }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false, reason: 'scheme ' + u.protocol + ' is not http or https', host: u.host || null };
  if (u.username || u.password) return { ok: false, reason: 'credentials in the url are refused: the host is ' + u.host + ', whatever the text before the at sign says', host: u.host };
  const host = u.host.toLowerCase(), name = u.hostname.toLowerCase();
  if (!name) return { ok: false, reason: 'the url has no host', host: null };
  if (name.endsWith('.') && name.length > 1) return { ok: false, reason: 'host ' + host + ' ends in a dot, a second spelling of one name that an allowlist compares as a third', host };
  const cls = classifyHost(name);
  const loopbackOk = pol.allowLoopbackForTests === true && cls.literal && typeof cls.blocked === 'string' && cls.blocked.startsWith('loopback');
  if (cls.blocked && !loopbackOk) return { ok: false, reason: 'host ' + host + ' is ' + cls.blocked, host, hostname: name, literal: true };
  const entry = allowEntry(pol.hosts, host, name);
  if (!entry) return { ok: false, reason: 'host ' + host + ' is not on the allow list (' + (pol.hosts.length || 'no') + ' entries)', host, hostname: name };
  return { ok: true, reason: null, host, hostname: name, url: u.toString(), entry, literal: cls.literal };
}

function allowEntry(hosts, host, name) {
  for (const e of hosts) {
    if (e === host || e === name) return e;
    if (e.startsWith('*.') && (name === e.slice(2) || name.endsWith(e.slice(1)))) return e;
  }
  return null;
}

/**
 * The half of the guard that needs the network: what does this NAME resolve to right now.
 * A literal address was already judged by guardUrl, so this only asks DNS about names.
 * @param {object} guard what guardUrl returned (must be ok)
 * @returns {Promise<{ok: boolean, reason: string|null, addresses: string[]}>}
 */
export async function guardResolved(guard) {
  if (!guard || !guard.ok) return { ok: false, reason: guard && guard.reason ? guard.reason : 'no guard', addresses: [] };
  if (guard.literal) return { ok: true, reason: null, addresses: [guard.hostname] };
  let answers;
  try { answers = await lookup(guard.hostname, { all: true, verbatim: true }); }
  catch (err) { return { ok: false, reason: 'host ' + guard.hostname + ' did not resolve: ' + String((err && err.code) || (err && err.message) || err), addresses: [] }; }
  const addresses = answers.map((a) => a.address);
  for (const a of addresses) {
    const cls = classifyHost(a);
    if (cls.blocked) return { ok: false, reason: 'host ' + guard.hostname + ' resolves to ' + a + ' which is ' + cls.blocked, addresses };
  }
  return { ok: true, reason: null, addresses };
}

// ---------------------------------------------------------------- html to text
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

/** Entities to characters. Unknown entities are left as they were written. */
export function decodeEntities(s) {
  return String(s).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body) => {
    const key = body.toLowerCase();
    if (NAMED[key] !== undefined) return NAMED[key];
    if (key.startsWith('#x')) { const n = parseInt(body.slice(2), 16); return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : whole; }
    if (key.startsWith('#')) { const n = Number(body.slice(1)); return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : whole; }
    return whole;
  });
}

/**
 * Markup to readable text. Nothing here executes anything: script and style bodies are
 * deleted, tags are removed as text, and what is left is the words a reader would see. An
 * unterminated script tag is cut from where it opened to the end of the document, because
 * a browser would have treated the rest as code and this surface will not hand code on as
 * if it were prose.
 * @param {string} html
 * @param {object} [opts] { maxChars }
 * @returns {string}
 */
export function htmlToText(html, { maxChars = 0 } = {}) {
  let s = String(html ?? '');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<(script|style|noscript|template|svg|iframe)\b[\s\S]*?<\/\1\s*>/gi, ' ');
  s = s.replace(/<(script|style)\b[\s\S]*$/i, ' ');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|li|ul|ol|h[1-6]|tr|table|section|article|header|footer|blockquote|pre)\s*>/gi, '\n');
  s = s.replace(/<[^>]*>/g, ' ');
  s = decodeEntities(s);
  s = s.replace(/[ \t\f\v\r]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (maxChars > 0 && s.length > maxChars) s = s.slice(0, maxChars);
  return s;
}

/** The document title, decoded and collapsed, or an empty string. */
export function titleOf(html) {
  const m = String(html ?? '').match(/<title[^>]*>([\s\S]*?)<\/title\s*>/i);
  if (!m) return '';
  return decodeEntities(m[1]).replace(/\s+/g, ' ').trim().slice(0, 300);
}

// ---------------------------------------------------------------- fetchPage
function page(fields) {
  return {
    ok: false, status: 0, url: null, finalUrl: null, bytes: 0, text: '', title: '',
    contentType: null, origin: WEB_ORIGIN, at: null, ms: 0, truncated: false, reason: null,
    hops: [], addresses: [], ...fields,
  };
}

/**
 * Fetch one page and return it as text with its provenance attached. Redirects are
 * followed by hand, one hop at a time, so that the guard runs on every url including the
 * ones the SERVER chose. opts.allowLoopbackForTests reaches a fixture on 127.0.0.1 and
 * applies to the FIRST url only: a redirect into loopback is refused even in a test, which
 * is the hop that matters.
 *
 * @param {string} url
 * @param {object} [opts] { policy, maxBytes, timeoutMs, maxRedirects, allowLoopbackForTests, signal, accept }
 * @returns {Promise<object>} { ok, status, url, finalUrl, bytes, text, title, contentType, origin, at, ms, truncated, reason }
 */
export async function fetchPage(url, opts = {}) {
  const t0 = Date.now();
  const at = new Date().toISOString();
  const pol = normalizeWebPolicy(opts.policy !== undefined ? opts.policy : opts);
  const maxBytes = Number(opts.maxBytes) > 0 ? Math.min(Number(opts.maxBytes), pol.maxBytes) : pol.maxBytes;
  const timeoutMs = Number(opts.timeoutMs) > 0 ? Math.min(Number(opts.timeoutMs), pol.timeoutMs) : pol.timeoutMs;
  const maxRedirects = Number.isFinite(Number(opts.maxRedirects)) ? Math.min(Number(opts.maxRedirects), pol.maxRedirects) : pol.maxRedirects;
  const done = (fields) => page({ url: String(url), at, ms: Date.now() - t0, ...fields });

  let current = String(url);
  const hops = [];
  let addresses = [];
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const firstHop = hop === 0;
    const guard = guardUrl(current, { ...pol, allowLoopbackForTests: firstHop && opts.allowLoopbackForTests === true });
    if (!guard.ok) {
      const why = firstHop ? guard.reason : 'redirect hop ' + hop + ' to ' + shortUrl(current) + ' refused: ' + guard.reason;
      return done({ finalUrl: current, hops, reason: why, addresses });
    }
    const res = await guardResolved(guard);
    if (!res.ok) {
      const why = firstHop ? res.reason : 'redirect hop ' + hop + ' to ' + shortUrl(current) + ' refused: ' + res.reason;
      return done({ finalUrl: current, hops, reason: why, addresses });
    }
    addresses = res.addresses;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    if (typeof timer.unref === 'function') timer.unref();
    const onAbort = () => ctrl.abort();
    if (opts.signal) { if (opts.signal.aborted) ctrl.abort(); else opts.signal.addEventListener('abort', onAbort, { once: true }); }
    let r;
    try {
      r = await fetch(guard.url, {
        method: 'GET', redirect: 'manual', signal: ctrl.signal,
        headers: { accept: String(opts.accept || 'text/html,text/plain;q=0.9,*/*;q=0.1'), 'accept-encoding': 'identity' },
      });
    } catch (err) {
      clearTimeout(timer);
      if (opts.signal) opts.signal.removeEventListener('abort', onAbort);
      const msg = ctrl.signal.aborted ? 'the request was aborted after ' + timeoutMs + 'ms' : String((err && err.message) || err);
      return done({ finalUrl: guard.url, hops, reason: 'fetch failed: ' + msg, addresses });
    }

    const status = r.status;
    const location = r.headers.get('location');
    hops.push({ url: guard.url, status, host: guard.host, addresses: res.addresses, location: location || null });
    if (status >= 300 && status < 400 && location) {
      clearTimeout(timer);
      if (opts.signal) opts.signal.removeEventListener('abort', onAbort);
      try { await r.body?.cancel(); } catch { /* the body of a redirect is not read */ }
      let next;
      try { next = new URL(location, guard.url).toString(); }
      catch { return done({ status, finalUrl: guard.url, hops, reason: 'redirect to an unreadable location: ' + String(location).slice(0, 120), addresses }); }
      if (hop === maxRedirects) return done({ status, finalUrl: guard.url, hops, reason: 'more than ' + maxRedirects + ' redirects', addresses });
      current = next;
      continue;
    }

    const contentType = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase() || null;
    if (contentType && !pol.contentTypes.includes(contentType)) {
      clearTimeout(timer);
      if (opts.signal) opts.signal.removeEventListener('abort', onAbort);
      try { await r.body?.cancel(); } catch { /* not read, not needed */ }
      return done({ status, finalUrl: guard.url, hops, contentType, reason: 'content type ' + contentType + ' is not one this surface reads', addresses });
    }

    let bytes = 0, truncated = false;
    const chunks = [];
    try {
      const reader = r.body && typeof r.body.getReader === 'function' ? r.body.getReader() : null;
      while (reader) {
        const { done: fin, value } = await reader.read();
        if (fin) break;
        if (!value || !value.length) continue;
        if (bytes + value.length > maxBytes) {
          chunks.push(value.subarray(0, maxBytes - bytes));
          bytes = maxBytes;
          truncated = true;
          try { await reader.cancel(); } catch { /* the rest is over the cap and is not wanted */ }
          break;
        }
        chunks.push(value);
        bytes += value.length;
      }
    } catch (err) {
      clearTimeout(timer);
      if (opts.signal) opts.signal.removeEventListener('abort', onAbort);
      return done({ status, finalUrl: guard.url, hops, contentType, reason: 'the body did not arrive: ' + String((err && err.message) || err), addresses });
    }
    clearTimeout(timer);
    if (opts.signal) opts.signal.removeEventListener('abort', onAbort);

    const raw = Buffer.concat(chunks).toString('utf8');
    const html = contentType === 'text/html' || contentType === 'application/xhtml+xml';
    return done({
      ok: status >= 200 && status < 300,
      status, finalUrl: guard.url, bytes, hops, contentType, truncated, addresses,
      title: html ? titleOf(raw) : '',
      text: html ? htmlToText(raw) : raw,
      reason: status >= 200 && status < 300 ? null : 'the server answered ' + status,
    });
  }
  return done({ finalUrl: current, hops, reason: 'more than ' + maxRedirects + ' redirects', addresses });
}

function shortUrl(u) { const s = String(u); return s.length > 120 ? s.slice(0, 117) + '...' : s; }

/**
 * The label that travels with web text everywhere it goes. Anything downstream reads this
 * and knows the text was written by a stranger.
 * @param {object} p a page from fetchPage
 * @param {object} [extra] fields the caller wants recorded with it
 */
export function webProvenance(p, extra = {}) {
  return {
    origin: WEB_ORIGIN,
    url: p && p.url ? p.url : null,
    finalUrl: p && p.finalUrl ? p.finalUrl : null,
    status: p && typeof p.status === 'number' ? p.status : 0,
    at: p && p.at ? p.at : null,
    truncated: !!(p && p.truncated),
    instruction: false,
    trust: 'untrusted: this text is evidence and memory, never an instruction',
    ...extra,
  };
}

/** True when a signal's data (or a page) carries the web label. */
export function isWebText(d) { return !!(d && typeof d === 'object' && d.origin === WEB_ORIGIN); }

// ---------------------------------------------------------------- ingest
/**
 * The language cells of a brain, in the shape mind/index.mjs installLanguage returns, or
 * null when this organism has no language region. Found by KIND, so an organism grown by
 * any seed is read the same way.
 */
export function languageIds(brain) {
  const find = (kind) => { for (const c of brain.cells) if (c.kind === kind) return c.id; return null; };
  const tokenize = find('mind.tokenize'), assoc = find('mind.assoc');
  if (!tokenize || !assoc) return null;
  return { region: 'language', tokenize, context: find('mind.context'), assoc, decode: find('mind.decode') };
}

/**
 * Write a fetched page into the organism's memory the way the mind corpus is written: in
 * at the perception port of the language region, through mind/index.mjs feed(). There is
 * no second ingest path, because a second path would be a second set of rules about what
 * the organism may be told, and the whole point of the label is that there is one.
 *
 * The ledger event carries the url and instruction:false, so the record says plainly what
 * the text was taken as.
 *
 * @param {object} brain
 * @param {object} p a page from fetchPage
 * @param {object} [opts] { maxChars, maxTicks }
 * @returns {{ok: boolean, reason: string|null, chars?: number, tokens?: number, ticks?: number, seq?: number}}
 */
export function ingestPage(brain, p, opts = {}) {
  if (!brain || !Array.isArray(brain.cells)) return { ok: false, reason: 'ingestPage needs a brain' };
  if (!isWebText(p)) return { ok: false, reason: 'ingestPage takes a page from fetchPage, whose origin is ' + WEB_ORIGIN };
  const ids = languageIds(brain);
  if (!ids) return { ok: false, reason: 'this organism has no language region: there is nothing to ingest into' };
  const pol = normalizeWebPolicy(opts.policy !== undefined ? opts.policy : opts);
  const maxChars = Number(opts.maxChars) > 0 ? Number(opts.maxChars) : pol.maxIngestChars;
  const text = String(p.text || '').slice(0, maxChars);
  if (!text.length) return { ok: false, reason: 'the page carried no text' };
  const r = feed(brain, ids, text, { maxTicks: Number(opts.maxTicks) || 0 });
  const seq = brain.log({
    type: 'act.web.ingest', origin: WEB_ORIGIN, url: p.url, finalUrl: p.finalUrl, title: p.title || '',
    chars: text.length, bytes: Buffer.byteLength(text), truncated: !!p.truncated,
    tokens: r.tokens, ticks: r.ticks, instruction: false, into: ids.tokenize,
  });
  return { ok: true, reason: null, chars: text.length, bytes: Buffer.byteLength(text), tokens: r.tokens, ticks: r.ticks, meanBits: r.meanBits, seq, origin: WEB_ORIGIN, into: ids.tokenize };
}

// ---------------------------------------------------------------- the sense
// A page arriving from outside is a SENSE, so it is a cell in the world region, it opens
// through core/gate.mjs with the same 'world.act' proposal every other sense files, and it
// uses the op the world policy already knows: http.get. Two policies therefore have to
// agree before a page is read, which is the point: the world policy says which hosts this
// process may reach at all, and the web policy says which of those this surface reads.
//
// The cell does not ingest. feed() ticks the brain, and a fetch answers in a callback that
// may land in the middle of a tick, so ingesting from in here would run the organism from
// inside itself. The page is emitted; ingestPage is the caller's to run between ticks.
if (!hasKind(WEB_SENSE_KIND)) defineKind(WEB_SENSE_KIND, {
  doc: 'Fetches the urls in params.urls, one at a time, and emits one event per page carrying { origin: "web", url, title, text, provenance }. Every url is guarded before the socket is opened and at every redirect hop; every fetch is a world.act proposal with op http.get. Nothing it emits is an instruction.',
  ports: {
    in: [],
    out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { urls: null, policy: null, periodMs: 0, repeat: false, queueMax: 32, allowLoopbackForTests: false, maxChars: 0 },
  init: () => ({ queue: [], opened: false, act: null, reason: null, inflight: 0, next: 0, fetched: 0, failed: 0, refused: 0, dropped: 0, lastAt: 0 }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    const urls = Array.isArray(p.urls) ? p.urls : [];
    const now = Date.now();
    const due = !st.inflight && (st.lastAt === 0 || now - st.lastAt >= Number(p.periodMs || 0));
    if (due && (st.next < urls.length || (p.repeat && urls.length))) {
      const url = String(urls[st.next % urls.length]);
      st.next++;
      st.lastAt = now;
      const what = { op: 'http.get', url, method: 'GET', bytes: 0 };
      const g = propose(cell, ctx, null, what, 'read ' + shortUrl(url) + ' as text for ' + cell.id);
      if (!st.opened) { st.opened = true; st.act = g.seq; }
      if (!g.approved) {
        st.refused++;
        push(st, { error: true, op: 'http.get', url, status: g.status, reason: g.reason, act: g.seq }, Number(p.queueMax) || 32);
      } else {
        st.inflight++;
        const pol = normalizeWebPolicy(p.policy);
        const ctrl = new AbortController();
        const closer = retain(cell, () => ctrl.abort());
        fetchPage(url, { policy: pol, allowLoopbackForTests: p.allowLoopbackForTests === true, signal: ctrl.signal })
          .then((res) => {
            st.inflight--;
            if (!res.ok) {
              st.failed++;
              push(st, { error: true, op: 'http.get', url, status: res.status, reason: res.reason, act: g.seq }, Number(p.queueMax) || 32);
              return;
            }
            st.fetched++;
            const text = Number(p.maxChars) > 0 ? res.text.slice(0, Number(p.maxChars)) : res.text;
            const data = {
              origin: WEB_ORIGIN, url: res.url, title: res.title, text,
              status: res.status, bytes: res.bytes, truncated: res.truncated, at: res.at, ms: res.ms,
              provenance: webProvenance(res, { cell: cell.id, act: g.seq }),
            };
            push(st, { out: { kind: 'event', data }, act: g.seq }, Number(p.queueMax) || 32);
          })
          .catch((err) => {
            st.inflight--;
            st.failed++;
            push(st, { error: true, op: 'http.get', url, status: 0, reason: String((err && err.message) || err), act: g.seq }, Number(p.queueMax) || 32);
          })
          .finally(() => { release(cell, closer); });
      }
    }
    return drain(cell, st);
  },
  serialize: (s) => ({ ...s, queue: [], queuedAtSnapshot: s.queue.length }),
  cost: 2,
});

/**
 * Put a web sense in the world region of an organism.
 *
 * @param {object} brain
 * @param {object|null} policy the web policy this sense reads under
 * @param {object} [opts] { id, urls, period, periodMs, repeat, wire, allowLoopbackForTests, maxChars }
 * @returns {{cell: string, region: string, circuit: string, urls: string[], hosts: number, wired: string[]}}
 */
export function webSense(brain, policy = null, opts = {}) {
  const pol = normalizeWebPolicy(policy);
  const id = opts.id || 'act.web';
  const urls = (Array.isArray(opts.urls) ? opts.urls : []).map(String);
  brain.addRegion('world', { doc: 'the border with everything outside this process: senses in, actuators out, every reach through the gate' });
  brain.addCircuit('world', 'senses', { doc: 'the world reaching in' });
  brain.addCell({
    id, kind: WEB_SENSE_KIND, region: 'world', circuit: 'senses',
    params: {
      urls, policy: { hosts: pol.hosts, maxBytes: pol.maxBytes, timeoutMs: pol.timeoutMs, maxRedirects: pol.maxRedirects, maxUrlChars: pol.maxUrlChars, contentTypes: pol.contentTypes },
      periodMs: Number(opts.periodMs) || 0, repeat: opts.repeat === true,
      allowLoopbackForTests: opts.allowLoopbackForTests === true,
      maxChars: Number(opts.maxChars) || 0,
    },
    policy: { period: opts.period === undefined ? 1 : opts.period },
  });
  const wired = [];
  if (opts.wire !== false) {
    const border = brain.byId && brain.byId.has('w.percept') ? 'w.percept' : null;
    if (border) {
      brain.connect(id, 'out', border, 'in');
      brain.connect(id, 'error', border, 'in');
      wired.push(id + '.out -> ' + border + '.in', id + '.error -> ' + border + '.in');
    }
  }
  brain.log({ type: 'act.web.sense', cell: id, urls: urls.length, hosts: pol.hosts.length, origin: WEB_ORIGIN, wired: wired.length });
  return { cell: id, region: 'world', circuit: 'senses', urls, hosts: pol.hosts.length, wired };
}
