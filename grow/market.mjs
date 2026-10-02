#!/usr/bin/env node
// grow/market.mjs: THE MARKET SENSE of the organism. PAPER ONLY.
// His words (2026-10-01): "model needs to be a god too, at memecoins, which is how i can monetize it, it will have its
// own cloud computer"; "its deadass iteration velocity as its whole philosophy"; "make sure they dont commit, they go
// through pipeline to do so ... and to test if they are really posing higher measure".
// THE HARD LINE: this part SEES markets and keeps a SIMULATED book. It holds no credential of any kind, it reads no
// environment variable, every request it makes is a GET to a public read-only data host of ALLOWED_HOSTS, and no code
// path in it could place a trade (test/grow-market.test.mjs greps this file to prove it). Going live with money is the
// owner's own later step, outside this file.
// (1) WATCH: public market data pulled as DATA from the keyless endpoints of neo/market-sources.json (each checked live,
//     its status recorded there), at most one request a second per host (slower where the config's hostGapMs says so),
//     byte and time caps, a User-Agent naming the project,
//     a back off on 429, no redirect followed. What it saw is appended to a bounded tape <root>/neo/market/tape/ (JSONL
//     by UTC day, at most 20 MB in all, oldest dropped): pool, token, age, price, liquidity, volume, transactions and the
//     time the row was SEEN (the clock when the response arrived, never a time it guesses).
// (2) STRATEGIES ARE CELLS: an entry (a guard of feature conditions) and an exit (the apex: take profit, stop, trail,
//     time) over FEATURES computed natively from the tape, enumerated and mutated by a seeded search, no model.
// (3) THE PIPELINE: a fill is the NEXT observed row after a decision, quoted against the liquidity seen with the fee and
//     slippage of COSTS (constants, never flattered); the grade is WALK-FORWARD (the search sees only the earlier tape,
//     the grade only the later tape); every candidate is graded against a PLACEBO (the same number of entries at random
//     times in the same pools, GRADE.seeds seeds) and kept only when it beats it by GRADE.margin on GRADE.beatShare of
//     the seeds with a positive net after costs; win rate is never the score; the tail is reported apart; a result
//     carried by one or two trades is flagged; an unreadable row is null, never zero; a feature that reads a later row
//     is caught (leakCheck) and left out; a kept candidate wired to the CANARY sensor voids the step.
// (4) THE BOOK: <root>/neo/market/BOOK.jsonl (simulated positions of the kept strategies, forward from the moment each
//     was kept, each with the tape rows it was priced from), STRATEGIES.json (kept strategies, their out-of-sample grade
//     and their control), STATE.json (hosts, the watch list, counters).
//   node grow/market.mjs step --max-ms <n> [--root <dir>] [--era <n>] [--offline]
//   node grow/market.mjs status [--root <dir>]
// Contract c1: ONE JSON line last on stdout and exit 0; a usage error exits 2, another step holding the lock exits 3,
// any other failure exits 1 with one stderr line. It writes only under <root>/neo/market/.
// Author: Opus 5.5 builder (MARKET SENSE) for the Fable 5.1 orchestrator, 2026-10-01.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const PAPER = true;
/** The only hosts a request may name (the config's allowlist may narrow it, never widen it). Read-only public data. */
export const ALLOWED_HOSTS = Object.freeze(['api.dexscreener.com', 'api.geckoterminal.com', 'api.coingecko.com']);
export const USER_AGENT = 'dilation-brain-market/1 (paper only, public data, one request a second per host; dilation.dev)';
export const CONFIG = 'neo/market-sources.json';
export const DIR = 'neo/market';
export const TAPE = 'neo/market/tape';
export const BOOK = 'neo/market/BOOK.jsonl';
export const STRATEGIES = 'neo/market/STRATEGIES.json';
export const STATE = 'neo/market/STATE.json';
export const LOCK = 'neo/market/step.lock';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');

export const CAPS = Object.freeze({
  tapeBytes: 20 * 1024 * 1024, // the whole tape
  responseBytes: 2000000, // one response
  stepBytes: 16000000, // every response of one step
  fetchMs: 10000, // one request
  hostGapMs: 1000, // one request a second per host
  requestsPerHost: 60, // per step
  rowsPerResponse: 400,
  watchPerFamily: 120, // pools re-read each round, per family
  watchTtlMs: 6 * 3600 * 1000,
  batch: 30, // addresses per watch request
  roundGapMs: 15000, // a watched pool is re-read about this often inside a step
  text: 48,
  bookLines: 5000,
  kept: 40,
  retired: 50,
  frontier: 12,
  backoffMs: 30000,
  backoffMaxMs: 15 * 60 * 1000,
  maxGapMs: 60000, // the slowest a 429 can teach a host to be read
  lockStaleMs: 30 * 60 * 1000,
  blockedKeep: 20,
});

/**
 * What a simulated position pays. Constants, stated, never flattered: the fixed round trip (fee and slippage, both
 * sides) is 1 - ((1 - feePerSide) * (1 - slipPerSide))^2 = 4.62%, at or above the 4.54% round trip this owner measured
 * on bonding curves (measuredRoundTrip); the pool's own price impact for notionalUsd against the liquidity seen comes on
 * top of it (a constant-product quote on half the liquidity).
 */
export const COSTS = Object.freeze({
  notionalUsd: 100,
  feePerSide: 0.0125,
  slipPerSide: 0.011,
  minLiqUsd: 2000, // under this a pool is not quoted for an entry: no fill
  fillMaxMs: 5 * 60 * 1000, // a decision older than this when the next row arrives is not filled
  staleMs: 15 * 60 * 1000, // an open position whose pool was not seen this long before the window end is unseen (null)
  measuredRoundTrip: 0.0454,
});
export const roundTripFixed = (c = COSTS) => 1 - ((1 - c.feePerSide) * (1 - c.slipPerSide)) ** 2;

export const GRADE = Object.freeze({
  fitShare: 0.6, // the search sees the earliest 60% of the tape's time span, the grade the rest
  minSeries: 12, // pools with at least 3 rows
  minSpanMs: 30 * 60 * 1000,
  minFitTrades: 5,
  minTrades: 8, // out of sample
  seeds: 20, // placebo draws
  beatShare: 0.9,
  margin: 0.02, // mean net per trade over the placebo's, per seed
  maxUnseenShare: 0.2,
  oosCandidates: 5,
  maxConditions: 3,
  maxCandidates: 30000,
  quantiles: Object.freeze([0.1, 0.25, 0.5, 0.75, 0.9]),
  mutants: 300,
  pairs: 24,
  leakSample: 400,
});

/** Exit templates the search starts from (hold in seconds; tp, sl, trail as fractions of the fill row's price). */
export const EXITS = Object.freeze([
  { tp: 0.25, sl: -0.15, hold: 900, trail: null },
  { tp: 0.5, sl: -0.25, hold: 1800, trail: null },
  { tp: 1, sl: -0.4, hold: 3600, trail: null },
  { tp: 0.25, sl: -0.15, hold: 900, trail: 0.12 },
  { tp: 2, sl: -0.5, hold: 7200, trail: 0.3 },
  { tp: null, sl: -0.3, hold: 1800, trail: 0.2 },
].map((e) => Object.freeze(e)));
export const EXIT_BOUNDS = Object.freeze({ tp: [0.05, 10], sl: [-0.95, -0.02], hold: [60, 14400], trail: [0.03, 0.8] });

export const USAGE = [
  'usage: node grow/market.mjs <verb> [flags]   (--root <dir>: another tree root)   PAPER ONLY: no trade is ever placed',
  '  step --max-ms <n> [--era <n>] [--offline]   see (unless --offline), grow and grade strategies, update the paper book',
  '  status                                       { paper, tapeRows, pools, tried, kept, best, edge, book }',
].join('\n');

class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const own = (o, k) => (isObj(o) || Array.isArray(o)) && Object.prototype.hasOwnProperty.call(o, k);
/** A nested field read through own properties only (a payload's __proto__ or getters are never followed). */
export function pick(o, ...ks) { let c = o; for (const k of ks) { if (!own(c, k)) return undefined; c = c[k]; } return c; }
const first = (e) => String((e && e.message) || e).split('\n')[0].slice(0, 200);
export const sha = (s) => createHash('sha256').update(String(s)).digest('hex');
const iso = (ms) => new Date(ms).toISOString();
const sig = (x) => Number(Number(x).toPrecision(4));
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const sum = (a) => a.reduce((s, v) => s + v, 0);
const r4 = (x) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 1e4) / 1e4);
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const readJsonOr = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
function writeAtomic(f, text) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, f);
}
const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
/** A seeded generator (mulberry32): the search and the placebo are reproducible from their seed. */
export function rngOf(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const hash32 = (s) => parseInt(sha(s).slice(0, 8), 16) >>> 0;

/** A finite number from a number or a plain numeric string; anything else (an object, a word, 1e400) is null. */
export function num(x) {
  if (typeof x === 'number') return Number.isFinite(x) ? x : null;
  if (typeof x === 'string') {
    const s = x.trim();
    if (s.length > 0 && s.length <= 80 && /^-?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) { const v = Number(s); return Number.isFinite(v) ? v : null; }
  }
  return null;
}
const posNum = (x) => { const v = num(x); return v !== null && v > 0 ? v : null; };
const nonNeg = (x) => { const v = num(x); return v !== null && v >= 0 ? v : null; };
const count = (x) => { const v = num(x); return v !== null && v >= 0 && Number.isInteger(v) ? v : null; };
const pctNum = (x) => { const v = num(x); return v !== null && Math.abs(v) <= 1e6 ? v : null; };
// control characters, C1 controls and the two Unicode line separators (built from code points, never literal in this file)
const CTRL_RE = new RegExp('[' + String.fromCharCode(0, 45, 31, 127, 45, 159, 0x2028, 0x2029) + ']', 'g');
/** Text from a payload: a string only, control characters out, at most max characters. Data, never an instruction. */
export function cleanText(x, max = CAPS.text) {
  if (typeof x !== 'string') return null;
  const s = x.replace(CTRL_RE, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  return s || null;
}
export const ADDR_RE = /^[A-Za-z0-9]{20,66}$/;
export const CHAIN_RE = /^[a-z0-9-]{2,24}$/;

// ---- the network: GET only, an allowlist, one request a second per host, caps, a back off on 429
/**
 * Why a URL may not be requested, or '' when it may: https, a host of ALLOWED_HOSTS and of the config's own list, no
 * credentials, the default port.
 */
export function urlRefusal(u, allowed = ALLOWED_HOSTS) {
  let x;
  try { x = new URL(String(u)); } catch { return 'not a URL'; }
  if (x.protocol !== 'https:') return 'not https (' + x.protocol + ')';
  if (x.username || x.password) return 'a URL with credentials is refused';
  if (x.port) return 'a non-default port is refused';
  const h = x.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.includes(h)) return 'the host ' + h + ' is not in ALLOWED_HOSTS';
  if (!Array.isArray(allowed) || !allowed.includes(h)) return 'the host ' + h + ' is not in the config allowlist';
  return '';
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
      if (n > max) { try { await reader.cancel(); } catch { /* dropped either way */ } throw new Error('over the byte cap of ' + max); }
      parts.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
    }
    return Buffer.concat(parts, n);
  }
  const b = Buffer.from(typeof res.arrayBuffer === 'function' ? await res.arrayBuffer() : String(await res.text()));
  if (b.length > max) throw new Error('over the byte cap of ' + max);
  return b;
}

/**
 * The polite reader. hosts is the persisted per-host record { last, backoffUntil, backoffMs, gapMs } (STATE.json), so
 * two steps back to back keep the gap and the back off. A 429 also doubles the host's learned gap (gapMs, at most
 * caps.maxGapMs), and each answered request takes a tenth off it again. get(url) resolves { json, seenMs, bytes } or
 * null (the reason is logged).
 */
export function createNet({ fetch: fetchFn = globalThis.fetch, clock = () => Date.now(), sleep = defaultSleep, hosts = {}, caps = CAPS, allowed = ALLOWED_HOSTS, deadline = Infinity, gaps = {} } = {}) {
  // a host's gap: caps.hostGapMs, or longer where the config slows it or a 429 taught it (never shorter)
  const gapOf = (host, h) => Math.max(caps.hostGapMs, num(pick(gaps, host)) || 0, num(h.gapMs) || 0);
  const log = { requests: 0, ok: 0, bytes: 0, blocked: [], perHost: {}, limited: {} };
  const block = (where, why) => { if (log.blocked.length < caps.blockedKeep) log.blocked.push(String(where).slice(0, 60) + ': ' + why); };
  async function get(url) {
    const why = urlRefusal(url, allowed);
    if (why) { block(String(url).slice(0, 60), 'refused before any request: ' + why); return null; }
    if (typeof fetchFn !== 'function') { block('net', 'no fetch in this runtime'); return null; }
    const href = new URL(String(url)).href;
    const host = new URL(href).hostname.toLowerCase();
    if (!isObj(hosts[host])) hosts[host] = { last: 0, backoffUntil: 0, backoffMs: 0, gapMs: 0 };
    const h = hosts[host];
    if (clock() < h.backoffUntil) { block(host, 'backing off until ' + iso(h.backoffUntil)); return null; }
    if ((log.perHost[host] || 0) >= caps.requestsPerHost) { block(host, 'the per-step request cap of ' + caps.requestsPerHost); return null; }
    if (log.bytes >= caps.stepBytes) { block(host, 'the per-step byte cap of ' + caps.stepBytes); return null; }
    const wait = h.last + gapOf(host, h) - clock();
    if (wait > 0) {
      if (clock() + wait >= deadline) { block(host, 'no time left for the host gap'); return null; }
      await sleep(wait);
    }
    const left = deadline - clock();
    if (left < 250) { block(host, 'no time left'); return null; }
    h.last = clock();
    log.requests++;
    log.perHost[host] = (log.perHost[host] || 0) + 1;
    const timeoutMs = Math.max(1, Math.min(caps.fetchMs, left));
    const ac = new AbortController();
    let timer = null;
    const expired = new Promise((resolve, reject) => { timer = setTimeout(() => { ac.abort(); reject(new Error('timed out after ' + timeoutMs + ' ms')); }, timeoutMs); });
    expired.catch(() => { /* raced below */ });
    try {
      const res = await Promise.race([fetchFn(href, { method: 'GET', redirect: 'manual', signal: ac.signal, headers: { accept: 'application/json', 'user-agent': USER_AGENT } }), expired]);
      if (!res || !Number.isInteger(res.status)) throw new Error('no response');
      const header = (k) => (res.headers && typeof res.headers.get === 'function' ? res.headers.get(k) : null);
      if (res.status === 429) {
        const ra = num(header('retry-after'));
        const ms = clamp(ra !== null && ra > 0 ? ra * 1000 : Math.max(caps.backoffMs, (h.backoffMs || 0) * 2), caps.backoffMs, caps.backoffMaxMs);
        h.backoffMs = ms;
        h.backoffUntil = clock() + ms;
        h.gapMs = Math.min(caps.maxGapMs, 2 * gapOf(host, h));
        log.limited[host] = (log.limited[host] || 0) + 1;
        block(host, '429: backing off ' + ms + ' ms, then one request per ' + h.gapMs + ' ms');
        return null;
      }
      if (res.status !== 200) { block(host, 'status ' + res.status + (res.status >= 300 && res.status < 400 ? ' (a redirect is never followed)' : '')); return null; }
      if (typeof res.url === 'string' && res.url && urlRefusal(res.url, allowed)) { block(host, 'the response came from elsewhere'); return null; }
      const bytes = await Promise.race([readCapped(res, Math.min(caps.responseBytes, caps.stepBytes - log.bytes)), expired]);
      log.bytes += bytes.length;
      h.backoffMs = 0;
      if (h.gapMs) h.gapMs = h.gapMs * 0.9 <= caps.hostGapMs ? 0 : Math.round(h.gapMs * 0.9);
      let json;
      try { json = JSON.parse(bytes.toString('utf8')); } catch { block(host, 'not JSON'); return null; }
      log.ok++;
      return { json, seenMs: clock(), bytes: bytes.length };
    } catch (e) {
      block(host, first(e));
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return { get, log, hosts };
}

// ---- the payloads: DATA turned into tape rows (never evaluated, never followed)
function makeRow(o, seenMs) {
  const cm = num(o.createdMs);
  const created = cm !== null && cm > 0 && cm <= seenMs + 60000 ? cm : null;
  return {
    seen: iso(seenMs), src: o.src, chain: o.chain, pool: o.pool, token: o.token,
    sym: cleanText(o.sym, 24), dex: cleanText(o.dex, 24),
    created: created === null ? null : iso(created),
    age: created === null ? null : Math.max(0, Math.round((seenMs - created) / 1000)),
    price: posNum(o.price), liq: nonNeg(o.liq),
    vol: { m5: nonNeg(o.vol[0]), h1: nonNeg(o.vol[1]), h24: nonNeg(o.vol[2]) },
    tx: { m5: { b: count(o.tx[0]), s: count(o.tx[1]) }, h1: { b: count(o.tx[2]), s: count(o.tx[3]) } },
    chg: { m5: pctNum(o.chg[0]), h1: pctNum(o.chg[1]) },
    fdv: nonNeg(o.fdv),
  };
}
const okChain = (c, chains) => typeof c === 'string' && CHAIN_RE.test(c) && (!Array.isArray(chains) || chains.includes(c));
const okAddr = (a) => typeof a === 'string' && ADDR_RE.test(a);

/** Rows from a dexscreener pairs payload ({ pairs: [..] }, [..] or { pair }). Each row is refused unless its ids are sane. */
export function rowsFromDexPairs(json, seenMs, chains) {
  const list = Array.isArray(json) ? json : Array.isArray(pick(json, 'pairs')) ? json.pairs : isObj(pick(json, 'pair')) ? [json.pair] : [];
  const rows = [];
  let refused = Math.max(0, list.length - CAPS.rowsPerResponse);
  for (const p of list.slice(0, CAPS.rowsPerResponse)) {
    const chain = pick(p, 'chainId'), pool = pick(p, 'pairAddress'), token = pick(p, 'baseToken', 'address');
    if (!isObj(p) || !okChain(chain, chains) || !okAddr(pool) || !okAddr(token)) { refused++; continue; }
    rows.push(makeRow({
      src: 'ds', chain, pool, token, sym: pick(p, 'baseToken', 'symbol'), dex: pick(p, 'dexId'), createdMs: pick(p, 'pairCreatedAt'),
      price: pick(p, 'priceUsd'), liq: pick(p, 'liquidity', 'usd'),
      vol: [pick(p, 'volume', 'm5'), pick(p, 'volume', 'h1'), pick(p, 'volume', 'h24')],
      tx: [pick(p, 'txns', 'm5', 'buys'), pick(p, 'txns', 'm5', 'sells'), pick(p, 'txns', 'h1', 'buys'), pick(p, 'txns', 'h1', 'sells')],
      chg: [pick(p, 'priceChange', 'm5'), pick(p, 'priceChange', 'h1')], fdv: pick(p, 'fdv'),
    }, seenMs));
  }
  return { rows, refused };
}

/** Rows from a geckoterminal pools payload ({ data: [..] }) of one network. */
export function rowsFromGeckoPools(json, seenMs, network) {
  const list = Array.isArray(pick(json, 'data')) ? json.data : [];
  const rows = [];
  let refused = Math.max(0, list.length - CAPS.rowsPerResponse);
  if (!okChain(network)) return { rows, refused: list.length };
  for (const d of list.slice(0, CAPS.rowsPerResponse)) {
    const a = pick(d, 'attributes');
    const pool = pick(a, 'address');
    const tid = pick(d, 'relationships', 'base_token', 'data', 'id');
    const token = typeof tid === 'string' && tid.startsWith(network + '_') ? tid.slice(network.length + 1) : null;
    if (!isObj(a) || !okAddr(pool) || !okAddr(token)) { refused++; continue; }
    const name = pick(a, 'name');
    const created = pick(a, 'pool_created_at');
    rows.push(makeRow({
      src: 'gt', chain: network, pool, token, sym: typeof name === 'string' ? name.split(' / ')[0] : null,
      dex: pick(d, 'relationships', 'dex', 'data', 'id'), createdMs: typeof created === 'string' ? Date.parse(created) : null,
      price: pick(a, 'base_token_price_usd'), liq: pick(a, 'reserve_in_usd'),
      vol: [pick(a, 'volume_usd', 'm5'), pick(a, 'volume_usd', 'h1'), pick(a, 'volume_usd', 'h24')],
      tx: [pick(a, 'transactions', 'm5', 'buys'), pick(a, 'transactions', 'm5', 'sells'), pick(a, 'transactions', 'h1', 'buys'), pick(a, 'transactions', 'h1', 'sells')],
      chg: [pick(a, 'price_change_percentage', 'm5'), pick(a, 'price_change_percentage', 'h1')], fdv: pick(a, 'fdv_usd'),
    }, seenMs));
  }
  return { rows, refused };
}

/** Token addresses from a dexscreener token list (profiles, boosts): [{ chain, token }], unique, sane ids only. */
export function tokensFromList(json, chains) {
  const list = Array.isArray(json) ? json : [];
  const out = [];
  const seen = new Set();
  let refused = 0;
  for (const x of list.slice(0, CAPS.rowsPerResponse)) {
    const chain = pick(x, 'chainId'), token = pick(x, 'tokenAddress');
    if (!okChain(chain, chains) || !okAddr(token)) { refused++; continue; }
    const k = chain + ':' + token;
    if (!seen.has(k)) { seen.add(k); out.push({ chain, token }); }
  }
  return { tokens: out, refused };
}
// ---- the config: neo/market-sources.json (the allowlist and every endpoint with the status seen live)
export const KINDS = Object.freeze(['ds-token-list', 'ds-pairs', 'gt-pools', 'none']);
export const ROLES = Object.freeze(['discover', 'resolve', 'watch', 'off']);
const fillUrl = (t, v) => String(t).replace(/\{chain\}/g, v.chain || '').replace(/\{addresses\}/g, v.addresses || '');
/** Every reason a config is refused (empty when it is sound). A host outside ALLOWED_HOSTS is refused here too. */
export function configErrors(cfg) {
  const e = [];
  if (!isObj(cfg)) return ['the config is not an object'];
  if (cfg.paper !== true) e.push('paper must be true');
  if (!Array.isArray(cfg.allowedHosts) || !cfg.allowedHosts.length) e.push('allowedHosts must be a non-empty array');
  else for (const h of cfg.allowedHosts) if (!ALLOWED_HOSTS.includes(h)) e.push('the host ' + h + ' is not in ALLOWED_HOSTS');
  if (!Array.isArray(cfg.chains) || !cfg.chains.length || !cfg.chains.every((c) => okChain(c))) e.push('chains must be a non-empty array of chain ids');
  if (cfg.hostGapMs !== undefined) {
    if (!isObj(cfg.hostGapMs)) e.push('hostGapMs must be an object { host: ms }');
    else for (const [h, v] of Object.entries(cfg.hostGapMs)) {
      if (!Array.isArray(cfg.allowedHosts) || !cfg.allowedHosts.includes(h)) e.push('hostGapMs names ' + h + ', not an allowed host');
      if (!Number.isInteger(v) || v < CAPS.hostGapMs || v > 600000) e.push('hostGapMs of ' + h + ' must be an integer from ' + CAPS.hostGapMs + ' to 600000 ms');
    }
  }
  if (!Array.isArray(cfg.sources)) return [...e, 'sources must be an array'];
  const ids = new Set();
  cfg.sources.forEach((s, i) => {
    const at = 'source ' + i;
    if (!isObj(s)) { e.push(at + ' is not an object'); return; }
    if (typeof s.id !== 'string' || !/^[a-z0-9-]{2,40}$/.test(s.id) || ids.has(s.id)) e.push(at + ' needs a unique id');
    ids.add(s.id);
    if (!KINDS.includes(s.kind)) e.push(at + ' kind ' + s.kind + ' is not one of ' + KINDS.join(', '));
    if (!ROLES.includes(s.role)) e.push(at + ' role ' + s.role + ' is not one of ' + ROLES.join(', '));
    if (typeof s.use !== 'boolean') e.push(at + ' needs use: true or false');
    if (s.kind === 'gt-pools' && s.role === 'discover' && !okChain(s.network)) e.push(at + ' needs a network');
    const why = urlRefusal(fillUrl(s.url, { chain: 'solana', addresses: 'A'.repeat(32) }), Array.isArray(cfg.allowedHosts) ? cfg.allowedHosts : []);
    if (why) e.push(at + ' url: ' + why);
  });
  return e;
}
/** The config of <root>, else the tree's own copy beside this file. A refused config is a failure, never a guess. */
export function loadConfig(root) {
  const f = [path.join(root, CONFIG), path.join(HERE, '..', CONFIG)].find((p) => fs.existsSync(p));
  if (!f) throw new Fail('no ' + CONFIG + ' under the root or beside grow/market.mjs');
  const cfg = readJsonOr(f);
  const errs = configErrors(cfg);
  if (errs.length) throw new Fail(CONFIG + ' is refused: ' + errs.slice(0, 3).join('; '));
  return cfg;
}

// ---- the tape: JSONL by UTC day, bounded, a torn line skipped and counted
const DAY_RE = /^\d{4}-\d{2}-\d{2}\.jsonl$/;
const endsWithNewline = (f) => {
  try {
    const st = fs.statSync(f);
    if (!st.size) return true;
    const fd = fs.openSync(f, 'r');
    try { const b = Buffer.alloc(1); fs.readSync(fd, b, 0, 1, st.size - 1); return b[0] === 10; } finally { fs.closeSync(fd); }
  } catch { return true; }
};
/** Append rows to the tape (a torn last line is closed first, so a new row is never glued to it), then cap it. */
export function appendTape(root, rows, cap = CAPS.tapeBytes) {
  const dir = path.join(root, TAPE);
  let appended = 0;
  if (rows.length) {
    fs.mkdirSync(dir, { recursive: true });
    const byDay = new Map();
    for (const r of rows) {
      const d = String(r.seen).slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
      if (!byDay.has(d)) byDay.set(d, []);
      byDay.get(d).push(JSON.stringify(r));
      appended++;
    }
    for (const [d, lines] of byDay) {
      const f = path.join(dir, d + '.jsonl');
      fs.appendFileSync(f, (endsWithNewline(f) ? '' : '\n') + lines.join('\n') + '\n');
    }
  }
  return { appended, ...capTape(root, cap) };
}
/** Hold the tape under cap bytes: the oldest day files go first; a single day over the cap keeps its newest lines. */
export function capTape(root, cap = CAPS.tapeBytes) {
  const dir = path.join(root, TAPE);
  let files;
  try { files = fs.readdirSync(dir).filter((n) => DAY_RE.test(n)).sort(); } catch { return { dropped: 0, droppedLines: 0, bytes: 0, files: 0 }; }
  const sizes = files.map((n) => fs.statSync(path.join(dir, n)).size);
  let total = sum(sizes), dropped = 0, droppedLines = 0;
  while (total > cap && files.length > 1) { fs.rmSync(path.join(dir, files[0]), { force: true }); total -= sizes[0]; files.shift(); sizes.shift(); dropped++; }
  if (total > cap && files.length === 1) {
    const f = path.join(dir, files[0]);
    const lines = fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.length);
    const keep = [];
    let n = 0;
    for (let i = lines.length - 1; i >= 0; i--) { const b = Buffer.byteLength(lines[i]) + 1; if (n + b > cap) break; n += b; keep.push(lines[i]); }
    keep.reverse();
    droppedLines = lines.length - keep.length;
    writeAtomic(f, keep.length ? keep.join('\n') + '\n' : '');
    total = n;
  }
  return { dropped, droppedLines, bytes: total, files: files.length };
}
const SRCS = ['ds', 'gt'];
/** A row read back from the tape, re-validated (the file is never trusted): null when it is not a row. */
export function tapeRow(r) {
  if (!isObj(r)) return null;
  const ms = typeof r.seen === 'string' ? Date.parse(r.seen) : NaN;
  if (!Number.isFinite(ms) || !SRCS.includes(r.src) || !okChain(r.chain) || !okAddr(r.pool)) return null;
  return {
    seen: r.seen, ms, key: r.src + ':' + r.chain + ':' + r.pool, src: r.src, chain: r.chain, pool: r.pool,
    token: okAddr(r.token) ? r.token : null, sym: cleanText(r.sym, 24), dex: cleanText(r.dex, 24),
    age: nonNeg(r.age), price: posNum(r.price), liq: nonNeg(r.liq), fdv: nonNeg(r.fdv),
    vol: { m5: nonNeg(pick(r, 'vol', 'm5')), h1: nonNeg(pick(r, 'vol', 'h1')), h24: nonNeg(pick(r, 'vol', 'h24')) },
    tx: { m5: { b: count(pick(r, 'tx', 'm5', 'b')), s: count(pick(r, 'tx', 'm5', 's')) }, h1: { b: count(pick(r, 'tx', 'h1', 'b')), s: count(pick(r, 'tx', 'h1', 's')) } },
    chg: { m5: pctNum(pick(r, 'chg', 'm5')), h1: pctNum(pick(r, 'chg', 'h1')) },
  };
}
/** Every row of the tape in time order, with the count of torn lines (not JSON) and bad rows (JSON, not a row). */
export function readTape(root) {
  const dir = path.join(root, TAPE);
  let files = [];
  try { files = fs.readdirSync(dir).filter((n) => DAY_RE.test(n)).sort(); } catch { /* no tape yet */ }
  const rows = [];
  let torn = 0, bad = 0, bytes = 0;
  for (const n of files) {
    let text = '';
    try { text = fs.readFileSync(path.join(dir, n), 'utf8'); } catch { continue; }
    bytes += Buffer.byteLength(text);
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      let o;
      try { o = JSON.parse(line); } catch { torn++; continue; }
      const r = tapeRow(o);
      if (r) rows.push(r); else bad++;
    }
  }
  rows.sort((a, b) => a.ms - b.ms || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { rows, torn, bad, files: files.length, bytes };
}
/** One series per pool (source, chain, pool), rows in time order, one row per instant (the later read wins). */
export function seriesOf(rows) {
  const m = new Map();
  for (const r of rows) {
    let s = m.get(r.key);
    if (!s) { s = []; m.set(r.key, s); }
    if (s.length && s[s.length - 1].ms === r.ms) { s[s.length - 1] = r; continue; }
    if (s.length && s[s.length - 1].ms > r.ms) { s.push(r); s.sort((a, b) => a.ms - b.ms); continue; }
    s.push(r);
  }
  return [...m.keys()].sort().map((key) => ({ key, rows: m.get(key) }));
}

// ---- the feature primitives: f(rows, i) reads rows[0..i] only; a feature that reads a later row is caught by leakCheck
const peakCache = new WeakMap();
function peakUpTo(rows, i) {
  let pk = peakCache.get(rows);
  if (!pk || pk.length !== rows.length) {
    pk = new Float64Array(rows.length);
    let m = 0;
    for (let k = 0; k < rows.length; k++) { const p = rows[k].price; if (p !== null && p > m) m = p; pk[k] = m; }
    peakCache.set(rows, pk);
  }
  return pk[i] > 0 ? pk[i] : null;
}
/** The latest k <= i with rows[k].ms <= ms and a readable price, or -1. */
function atOrBefore(rows, i, ms) {
  let lo = 0, hi = i, best = -1;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (rows[mid].ms <= ms) { best = mid; lo = mid + 1; } else hi = mid - 1; }
  while (best >= 0 && rows[best].price === null) best--;
  return best;
}
const momentum = (w) => (rows, i) => {
  const p = rows[i].price;
  if (p === null) return null;
  const k = atOrBefore(rows, i, rows[i].ms - w * 1000);
  if (k < 0 || rows[i].ms - rows[k].ms > 3 * w * 1000) return null;
  return p / rows[k].price - 1;
};
const ratio = (a, b) => (a === null || b === null || !(b > 0) ? null : a / b);
const share = (b, s) => (b === null || s === null || b + s === 0 ? null : b / (b + s));
const fromPct = (x) => (x === null ? null : x / 100);
const canaryCache = new Map();
/** The CANARY: a hash of the pool id, 0 to 3. It cannot carry anything about the future: a kept rule wired to it is noise. */
export function canaryOf(pool) {
  let v = canaryCache.get(pool);
  if (v === undefined) { v = hash32('canary:' + pool) % 4; if (canaryCache.size < 100000) canaryCache.set(pool, v); }
  return v;
}
export const CANARY = 'canary';
export const FEATURES = Object.freeze({
  age: (rows, i) => rows[i].age, // seconds since the pool was created, as the source states it
  liq: (rows, i) => rows[i].liq,
  fdv: (rows, i) => rows[i].fdv,
  mom1: momentum(60), mom5: momentum(300), mom15: momentum(900), mom60: momentum(3600),
  chg5: (rows, i) => fromPct(rows[i].chg.m5), chg60: (rows, i) => fromPct(rows[i].chg.h1),
  buys5: (rows, i) => rows[i].tx.m5.b, sells5: (rows, i) => rows[i].tx.m5.s,
  bsr5: (rows, i) => share(rows[i].tx.m5.b, rows[i].tx.m5.s), bsr60: (rows, i) => share(rows[i].tx.h1.b, rows[i].tx.h1.s),
  vl5: (rows, i) => ratio(rows[i].vol.m5, rows[i].liq), vl60: (rows, i) => ratio(rows[i].vol.h1, rows[i].liq),
  dd: (rows, i) => { const p = rows[i].price, pk = peakUpTo(rows, i); return p === null || pk === null ? null : p / pk - 1; },
  nobs: (rows, i) => i + 1,
  [CANARY]: (rows, i) => canaryOf(rows[i].pool),
});
const valueOf = (fn, rows, i) => { try { const v = fn(rows, i); return typeof v === 'number' && Number.isFinite(v) ? v : null; } catch { return null; } };
/**
 * The names of the features whose value at a point changes when every later row is cut away: they read the future.
 * A deterministic sample of points spread over the series (never only the last row of a series).
 */
export function leakCheck(features, series, sample = GRADE.leakSample) {
  const names = Object.keys(features);
  const pts = [];
  for (let si = 0; si < series.length; si++) for (let i = 0; i < series[si].rows.length - 1; i++) pts.push([si, i]);
  const stride = Math.max(1, Math.floor(pts.length / Math.max(1, sample)));
  const leaks = new Set();
  for (let k = 0; k < pts.length; k += stride) {
    const [si, i] = pts[k];
    const rows = series[si].rows;
    const cut = rows.slice(0, i + 1);
    for (const n of names) {
      if (leaks.has(n)) continue;
      const a = valueOf(features[n], rows, i), b = valueOf(features[n], cut, i);
      if (!(a === b || (a !== null && b !== null && Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(a))))) leaks.add(n);
    }
  }
  return [...leaks].sort();
}

/**
 * A grading context: every row in [from, to) with a readable price is a decision point; feature columns hold NaN for
 * null (a null never satisfies a condition: an unreadable row is never zero). Fills and exits never read a row at or
 * after `to`.
 */
export function buildCtx(series, features, { from = -Infinity, to = Infinity } = {}) {
  const names = Object.keys(features);
  const ps = [], pi = [], sStart = [], sEnd = [];
  const raw = Object.fromEntries(names.map((n) => [n, []]));
  series.forEach((s, si) => {
    sStart.push(ps.length);
    for (let i = 0; i < s.rows.length; i++) {
      const r = s.rows[i];
      if (r.ms < from || r.ms >= to || r.price === null) continue;
      ps.push(si); pi.push(i);
      for (const n of names) { const v = valueOf(features[n], s.rows, i); raw[n].push(v === null ? NaN : v); }
    }
    sEnd.push(ps.length);
  });
  const cols = Object.fromEntries(names.map((n) => [n, Float64Array.from(raw[n])]));
  return { series, names, ps: Int32Array.from(ps), pi: Int32Array.from(pi), sStart, sEnd, cols, from, to, cache: new Map() };
}

// ---- the costs: a fill quoted against the liquidity seen
/** Units bought for notionalUsd at a seen price and liquidity (constant product on half the liquidity), or null. */
export function buyFill(price, liq, c = COSTS) {
  if (!(typeof price === 'number' && price > 0) || !(typeof liq === 'number' && liq >= c.minLiqUsd)) return null;
  const q = liq / 2;
  const d = c.notionalUsd * (1 - c.feePerSide);
  const units = (d / (price * (1 + d / q))) * (1 - c.slipPerSide);
  return { units, px: c.notionalUsd / units, impact: d / q };
}
/** Dollars a sale of units brings at a seen price and liquidity, after the price impact, the fee and the slippage. */
export function sellValue(units, price, liq, c = COSTS) {
  if (!(units > 0) || typeof price !== 'number' || !(price >= 0) || typeof liq !== 'number' || !(liq >= 0)) return null;
  const q = liq / 2;
  if (q === 0 || price === 0) return 0;
  const v = units * price;
  return (v / (1 + v / q)) * (1 - c.feePerSide) * (1 - c.slipPerSide);
}
const quotable = (r) => r.price !== null && r.liq !== null;
export const exitKey = (e) => [e.tp, e.sl, e.hold, e.trail].join('/');
/**
 * One simulated position: decided at row i, filled at the NEXT quotable row (within fillMaxMs, before `to`), exited at
 * the quotable row after the row where the exit rule fired. Still open at `to`: marked at the last quotable row, or
 * unseen (net null) when the pool went unseen for staleMs before `to`. null when there is no fill.
 */
export function trade(rows, i, exit, to, c = COSTS) {
  let j = i + 1;
  while (j < rows.length && rows[j].ms < to && !quotable(rows[j])) j++;
  if (j >= rows.length || rows[j].ms >= to || rows[j].ms - rows[i].ms > c.fillMaxMs) return null;
  const buy = buyFill(rows[j].price, rows[j].liq, c);
  if (!buy) return null;
  const p0 = rows[j].price;
  let peak = p0, why = null, k = j + 1;
  for (; k < rows.length && rows[k].ms < to; k++) {
    const p = rows[k].price;
    if (p === null) continue;
    if (p > peak) peak = p;
    const g = p / p0 - 1;
    if (exit.tp !== null && g >= exit.tp) why = 'tp';
    else if (g <= exit.sl) why = 'sl';
    else if (exit.trail !== null && p <= peak * (1 - exit.trail)) why = 'trail';
    else if (rows[k].ms - rows[j].ms >= exit.hold * 1000) why = 'hold';
    if (why) break;
  }
  const base = { i, j, units: buy.units, px: buy.px };
  if (why) {
    let x = k + 1;
    while (x < rows.length && rows[x].ms < to && !quotable(rows[x])) x++;
    if (x < rows.length && rows[x].ms < to) {
      const v = sellValue(buy.units, rows[x].price, rows[x].liq, c);
      return { ...base, status: 'closed', why, k, x, m: null, net: v === null ? null : v / c.notionalUsd - 1 };
    }
  }
  let m = j;
  for (let y = rows.length - 1; y > j; y--) if (rows[y].ms < to && quotable(rows[y])) { m = y; break; }
  if (Number.isFinite(to) && to - rows[m].ms > c.staleMs) return { ...base, status: 'unseen', why: why || 'open', k: why ? k : null, x: null, m, net: null };
  const v = sellValue(buy.units, rows[m].price, rows[m].liq, c);
  return { ...base, status: 'open', why: why || 'open', k: why ? k : null, x: null, m, net: v === null ? null : v / c.notionalUsd - 1 };
}
/** The position a decision point p of ctx would open with an exit (cached per exit), or null. */
export function tradeAt(ctx, p, exit) {
  const ek = exitKey(exit);
  let m = ctx.cache.get(ek);
  if (!m) { m = new Map(); ctx.cache.set(ek, m); }
  if (m.has(p)) return m.get(p);
  const si = ctx.ps[p];
  const t = trade(ctx.series[si].rows, ctx.pi[p], exit, ctx.to);
  const v = t ? { ...t, p, si } : null;
  m.set(p, v);
  return v;
}
/** The positions a strategy opens in ctx: at most one per pool, at its first decision point that holds and fills. */
export function simulate(strat, ctx) {
  const conds = strat.entry.map(([n, op, thr]) => [ctx.cols[n], op === '>=', thr]);
  if (conds.some((c) => !c[0])) return [];
  const out = [];
  for (let si = 0; si < ctx.series.length; si++) {
    for (let p = ctx.sStart[si]; p < ctx.sEnd[si]; p++) {
      let ok = true;
      for (const [col, ge, thr] of conds) { const v = col[p]; if (!(ge ? v >= thr : v <= thr)) { ok = false; break; } }
      if (!ok) continue;
      const t = tradeAt(ctx, p, strat.exit);
      if (!t) continue;
      out.push(t);
      break;
    }
  }
  return out;
}
// ---- strategies are cells: { entry: [[feature, '>=' | '<=', threshold], ..] (the guard), exit: { tp, sl, hold, trail } }
const OPS = ['>=', '<='];
function canonExit(e) {
  const b = EXIT_BOUNDS;
  const tp = e.tp === null ? null : sig(clamp(e.tp, b.tp[0], b.tp[1]));
  const trail = e.trail === null ? null : sig(clamp(e.trail, b.trail[0], b.trail[1]));
  return { tp, sl: sig(clamp(e.sl, b.sl[0], b.sl[1])), hold: Math.round(clamp(e.hold, b.hold[0], b.hold[1])), trail };
}
/** The canonical form: one condition per feature and operator (the last wins), sorted; the exit clamped to its bounds. */
export function canon(s) {
  const m = new Map();
  for (const [n, op, thr] of s.entry) m.set(n + op, [n, op, sig(thr)]);
  const entry = [...m.values()].sort((a, b) => (a[0] + a[1] < b[0] + b[1] ? -1 : 1));
  return { entry, exit: canonExit(s.exit) };
}
export const stratId = (s) => 'm-' + sha(JSON.stringify(canon(s))).slice(0, 12);
export function ruleText(s) {
  const e = s.exit;
  return s.entry.map(([n, op, thr]) => n + op + thr).join(' & ') + ' | ' + [e.tp === null ? null : 'tp' + e.tp, 'sl' + e.sl, 'hold' + e.hold + 's', e.trail === null ? null : 'trail' + e.trail].filter(Boolean).join(' ');
}
/** A strategy read back from a file: canonical, or null (a corrupt or foreign shape is never run). */
export function validStrat(s, features = FEATURES) {
  if (!isObj(s) || !Array.isArray(s.entry) || !s.entry.length || s.entry.length > GRADE.maxConditions || !isObj(s.exit)) return null;
  for (const c of s.entry) if (!Array.isArray(c) || c.length !== 3 || !own(features, c[0]) || !OPS.includes(c[1]) || num(c[2]) === null || typeof c[2] !== 'number') return null;
  const e = s.exit;
  const optNum = (v) => v === null || (typeof v === 'number' && Number.isFinite(v));
  if (!optNum(e.tp) || !optNum(e.trail) || typeof e.sl !== 'number' || !Number.isFinite(e.sl) || typeof e.hold !== 'number' || !Number.isFinite(e.hold)) return null;
  return canon(s);
}
const nearest = (g, v) => { let k = 0; for (let i = 1; i < g.length; i++) if (Math.abs(g[i] - v) < Math.abs(g[k] - v)) k = i; return k; };
/** One mutant of a strategy (seeded): a threshold moved, an operator flipped, a condition added or dropped, the exit changed. */
export function mutate(s, rng, grid, names) {
  const entry = s.entry.map((c) => [...c]);
  let exit = { ...s.exit };
  const r = rng();
  const any = (a) => a[Math.floor(rng() * a.length)];
  const usable = names.filter((n) => grid[n] && grid[n].length);
  if (r < 0.3 && entry.length) {
    const c = any(entry);
    const g = grid[c[0]];
    if (g && g.length > 1) c[2] = g[clamp(nearest(g, c[2]) + (rng() < 0.5 ? -1 : 1), 0, g.length - 1)];
    else c[2] = sig(c[2] === 0 ? (rng() < 0.5 ? -0.01 : 0.01) : c[2] * (rng() < 0.5 ? 0.8 : 1.25));
  } else if (r < 0.42 && entry.length) {
    const c = any(entry);
    c[1] = c[1] === '>=' ? '<=' : '>=';
  } else if (r < 0.58 && entry.length < GRADE.maxConditions && usable.length) {
    const n = any(usable);
    entry.push([n, any(OPS), any(grid[n])]);
  } else if (r < 0.68 && entry.length > 1) {
    entry.splice(Math.floor(rng() * entry.length), 1);
  } else if (r < 0.8) {
    exit = { ...any(EXITS) };
  } else {
    const f = rng() < 0.5 ? 0.75 : 1.33;
    const which = any(['tp', 'sl', 'hold', 'trail']);
    if (which === 'tp') exit.tp = exit.tp === null ? 0.5 : exit.tp * f;
    else if (which === 'sl') exit.sl = exit.sl * f;
    else if (which === 'hold') exit.hold = exit.hold * f;
    else exit.trail = exit.trail === null ? 0.2 : rng() < 0.2 ? null : exit.trail * f;
  }
  return canon({ entry, exit });
}

/** Thresholds per feature: the GRADE.quantiles of its readable values over the context's decision points. */
export function gridOf(ctx, names = ctx.names) {
  const grid = {};
  for (const n of names) {
    const v = Array.from(ctx.cols[n]).filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
    if (v.length < 10) { grid[n] = []; continue; }
    grid[n] = [...new Set(GRADE.quantiles.map((q) => sig(v[Math.min(v.length - 1, Math.floor(q * v.length))])))];
  }
  return grid;
}
/** The fit score: net return summed over the positions (unseen ones left out), with the count; never the win rate. */
export function fitScore(strat, ctx) {
  const nets = simulate(strat, ctx).map((t) => t.net).filter((v) => v !== null);
  return { n: nets.length, score: nets.length >= GRADE.minFitTrades ? sum(nets) : -Infinity };
}
const STOP = Symbol('budget');
/**
 * The search over the FIT context only: mutants of the parents first, then every single condition (feature x operator
 * x threshold, the order shuffled by the seed) with every exit template, then pairs of the best single conditions,
 * then mutants of the best so far, until the budget or maxCandidates. Deterministic for one seed and one count.
 */
export function search(fit, { seed = 1, budgetMs = 10000, clock = () => Date.now(), maxCandidates = GRADE.maxCandidates, parents = [], names = fit.names } = {}) {
  const t0 = clock();
  const rng = rngOf(seed);
  const grid = gridOf(fit, names);
  const seen = new Set();
  const scored = [];
  let tried = 0;
  const tryOne = (s, from) => {
    const c = canon(s);
    const id = stratId(c);
    if (seen.has(id)) return;
    if (tried >= maxCandidates || clock() - t0 > budgetMs) throw STOP;
    seen.add(id);
    tried++;
    scored.push({ id, strat: c, parents: from ? [from] : [], ...fitScore(c, fit) });
  };
  const best = (k) => [...scored].filter((x) => x.score > -Infinity).sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1)).slice(0, k);
  try {
    const ps = parents.map((p) => validStrat(p)).filter(Boolean).filter((p) => p.entry.every((c) => names.includes(c[0])));
    for (const p of ps) tryOne(p, null);
    for (let m = 0; m < GRADE.mutants && ps.length; m++) { const p = ps[Math.floor(rng() * ps.length)]; tryOne(mutate(p, rng, grid, names), stratId(p)); }
    const singles = [];
    for (const n of names) for (const op of OPS) for (const thr of grid[n] || []) singles.push([n, op, thr]);
    for (let i = singles.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [singles[i], singles[j]] = [singles[j], singles[i]]; }
    for (const c of singles) for (const ex of EXITS) tryOne({ entry: [c], exit: ex }, null);
    const top = [];
    for (const b of best(scored.length)) { if (b.strat.entry.length !== 1) continue; const k = b.strat.entry[0].join(); if (!top.some((t) => t.join() === k)) top.push(b.strat.entry[0]); if (top.length >= GRADE.pairs) break; }
    for (let a = 0; a < top.length; a++) for (let b = a + 1; b < top.length; b++) {
      if (top[a][0] === top[b][0]) continue;
      for (const ex of EXITS) tryOne({ entry: [top[a], top[b]], exit: ex }, null);
    }
    // then mutants of the best so far for the rest of the budget (every candidate it can afford): it ends at the budget,
    // at maxCandidates, or when GRADE.mutants draws in a row bring nothing new
    let pool = [];
    for (let m = 0, dup = 0; dup < GRADE.mutants; m++) {
      if (m % 25 === 0) pool = best(CAPS.frontier);
      if (!pool.length) break;
      const p = pool[Math.floor(rng() * pool.length)];
      const before = tried;
      tryOne(mutate(p.strat, rng, grid, names), p.id);
      dup = tried === before ? dup + 1 : 0;
    }
  } catch (e) {
    if (e !== STOP) throw e;
  }
  const ms = Math.max(1, clock() - t0);
  return { tried, ms, cps: Math.round((tried * 1000) / ms), grid, ranked: best(scored.length) };
}

/** The tail of a set of net returns: best, worst, what the top two carry, the mean without them. */
export function tailOf(nets) {
  if (!nets.length) return { best: null, worst: null, top2: null, exTop2Mean: null, carried: false };
  const s = [...nets].sort((a, b) => b - a);
  const total = sum(s), top2 = s[0] + (s.length > 1 ? s[1] : 0), rest = s.slice(2);
  return { best: r4(s[0]), worst: r4(s[s.length - 1]), top2: r4(top2), exTop2Mean: rest.length ? r4(sum(rest) / rest.length) : null, carried: total > 0 && total - top2 <= 0 };
}
/**
 * The out-of-sample grade of one strategy on ctx against its PLACEBO: per seed, the same number of entries, each in the
 * pool of one of the strategy's positions, at a decision point drawn at random among the ones that fill there, with the
 * same exit. pass only when: trades >= minTrades, net after costs > 0, the mean beats the placebo mean by margin on at
 * least beatShare of the seeds, unseen positions at most maxUnseenShare, and the rule does not wire the canary.
 */
export function gradeOOS(strat, ctx, { seeds = GRADE.seeds, margin = GRADE.margin, seedBase = 0 } = {}) {
  const trades = simulate(strat, ctx);
  const nets = trades.map((t) => t.net).filter((v) => v !== null);
  const unseen = trades.length - nets.length;
  const total = sum(nets);
  const mean = nets.length ? total / nets.length : null;
  const id = stratId(strat);
  const eligible = new Map();
  const eligibleIn = (si) => {
    if (!eligible.has(si)) { const a = []; for (let p = ctx.sStart[si]; p < ctx.sEnd[si]; p++) { const t = tradeAt(ctx, p, strat.exit); if (t && t.net !== null) a.push(p); } eligible.set(si, a); }
    return eligible.get(si);
  };
  const means = [];
  for (let s = 0; s < seeds; s++) {
    const rng = rngOf(hash32(id + ':' + (seedBase + s)));
    const pn = [];
    for (const t of trades) {
      const cands = eligibleIn(t.si);
      if (!cands.length) continue;
      const pt = tradeAt(ctx, cands[Math.floor(rng() * cands.length)], strat.exit);
      if (pt && pt.net !== null) pn.push(pt.net);
    }
    if (pn.length) means.push(sum(pn) / pn.length);
  }
  const ctrl = median(means);
  const beat = mean === null ? 0 : means.filter((m) => mean - m >= margin).length;
  const tail = tailOf(nets);
  const why = [];
  if (nets.length < GRADE.minTrades) why.push('only ' + nets.length + ' priced trades out of sample (needs ' + GRADE.minTrades + ')');
  if (!(total > 0)) why.push('the net after costs is not positive');
  if (beat < Math.ceil(GRADE.beatShare * seeds)) why.push('it beat its placebo by ' + margin + ' on ' + beat + ' of ' + seeds + ' seeds');
  if (trades.length && unseen / trades.length > GRADE.maxUnseenShare) why.push(unseen + ' of ' + trades.length + ' positions went unseen: the outcome cannot be read');
  if (strat.entry.some((c) => c[0] === CANARY)) why.push('it wires the canary sensor');
  return {
    trades: nets.length, unseen, net: { total: r4(total), mean: r4(mean), median: r4(median(nets)) },
    winRate: nets.length ? r4(nets.filter((v) => v > 0).length / nets.length) : null, // reported, never the score
    tail, carried: tail.carried,
    control: { seeds, draws: means.length, median: r4(ctrl), beat, margin },
    edge: mean !== null && ctrl !== null ? r4(mean - ctrl) : null,
    pass: why.length === 0, why,
  };
}

/** The walk-forward split of a tape: the search's rows (seen before split) and the time the grade starts. */
export function splitTape(rows) {
  if (!rows.length) return { tmin: null, tmax: null, split: null, fit: [] };
  const tmin = rows[0].ms, tmax = rows[rows.length - 1].ms;
  const split = Math.floor(tmin + GRADE.fitShare * (tmax - tmin));
  return { tmin, tmax, split, fit: rows.filter((r) => r.ms < split) };
}
/**
 * THINK: leak check, walk-forward split, the search on the fit tape, the out-of-sample grade of the best candidates with
 * their placebo, the canary rule, and the forward re-grade of the strategies already kept. Pure apart from the clock.
 */
export function think({ rows, features = FEATURES, kept = [], frontier = [], seed = 1, budgetMs = 10000, clock = () => Date.now(), maxCandidates = GRADE.maxCandidates, era = null }) {
  const series = seriesOf(rows);
  const leaks = leakCheck(features, series);
  const feats = Object.fromEntries(Object.entries(features).filter(([n]) => !leaks.includes(n)));
  const { tmin, tmax, split, fit } = splitTape(rows);
  const span = tmin === null ? 0 : tmax - tmin;
  const usable = series.filter((s) => s.rows.length >= 3).length;
  const out = { leaks, split: split === null ? null : iso(split), fitRows: fit.length, testRows: rows.length - fit.length, tried: 0, cps: 0, graded: [], kept: [], retired: [], frontier: [], void: null, skipped: null, ranked: [] };
  // the forward re-grade of every kept strategy: rows after the moment it was kept, never seen by the search that found it
  for (const k of kept) {
    const s = validStrat(k);
    const from = Date.parse(k.keptAt);
    if (!s || !Number.isFinite(from) || tmax === null) { out.kept.push(k); continue; }
    const fctx = buildCtx(series, feats, { from, to: tmax + 1 });
    const g = gradeOOS(s, fctx, { seedBase: 1000 });
    const next = { ...k, forward: { at: iso(tmax), ...g } };
    if (g.trades >= GRADE.minTrades && !g.pass) out.retired.push({ id: k.id, rule: k.rule, retiredAt: iso(tmax), era, why: g.why });
    else out.kept.push(next);
  }
  if (usable < GRADE.minSeries || span < GRADE.minSpanMs) {
    out.skipped = 'the tape holds ' + rows.length + ' rows, ' + usable + ' pools with 3+ rows, over ' + Math.round(span / 60000) + ' minutes; a walk-forward grade needs ' + GRADE.minSeries + ' pools of 3+ rows over ' + GRADE.minSpanMs / 60000 + ' minutes';
    return out;
  }
  const fitCtx = buildCtx(seriesOf(fit), feats, { to: split });
  const testCtx = buildCtx(series, feats, { from: split, to: tmax + 1 });
  const parents = [...kept, ...frontier].map((p) => validStrat(p)).filter(Boolean);
  const res = search(fitCtx, { seed, budgetMs, clock, maxCandidates, parents, names: Object.keys(feats) });
  out.tried = res.tried;
  out.cps = res.cps;
  out.ranked = res.ranked.slice(0, 20).map((c) => c.id);
  out.frontier = res.ranked.slice(0, CAPS.frontier).map((c) => ({ id: c.id, ...c.strat, fit: { n: c.n, score: r4(c.score) } }));
  const cands = res.ranked.filter((c) => c.n >= GRADE.minFitTrades && c.score > 0).slice(0, GRADE.oosCandidates);
  for (const c of cands) out.graded.push({ id: c.id, strat: c.strat, rule: ruleText(c.strat), parents: c.parents, fit: { n: c.n, score: r4(c.score) }, oos: gradeOOS(c.strat, testCtx) });
  // the canary: a candidate wired to a sensor that cannot know the future passed every other gate, and the canary is
  // what carried it (the rule is the canary alone, or the same rule without its canary conditions fails): the grade
  // cannot tell signal from noise on this tape, so nothing is kept this step
  const canaryCarried = (g) => {
    if (!g.strat.entry.some((c) => c[0] === CANARY) || g.oos.why.length !== 1 || !/canary/.test(g.oos.why[0])) return false;
    const rest = g.strat.entry.filter((c) => c[0] !== CANARY);
    return !rest.length || !gradeOOS({ entry: rest, exit: g.strat.exit }, testCtx).pass;
  };
  const canaryPass = out.graded.find(canaryCarried);
  if (canaryPass) { out.void = 'the candidate ' + canaryPass.id + ' wired to the canary beat its placebo out of sample: nothing is kept this step'; return out; }
  const have = new Set(out.kept.map((k) => k.id));
  for (const g of out.graded) {
    if (!g.oos.pass || have.has(g.id)) continue;
    out.kept.push({ id: g.id, rule: g.rule, entry: g.strat.entry, exit: g.strat.exit, parents: g.parents, era, keptAt: iso(tmax), split: out.split, fit: g.fit, oos: g.oos, forward: null });
    have.add(g.id);
  }
  return out;
}
// ---- the state, the watch list, the strategies file, the book
const FAMILIES = ['ds', 'gt'];
/** STATE.json read back and sanitised: unknown hosts and shapes are dropped, never trusted. */
export function readState(root) {
  const s = readJsonOr(path.join(root, STATE));
  const int = (v) => (Number.isInteger(v) && v >= 0 ? v : 0);
  const hosts = {};
  for (const h of ALLOWED_HOSTS) {
    const x = pick(s, 'hosts', h);
    if (isObj(x)) hosts[h] = { last: num(x.last) || 0, backoffUntil: num(x.backoffUntil) || 0, backoffMs: num(x.backoffMs) || 0, gapMs: clamp(num(x.gapMs) || 0, 0, CAPS.maxGapMs) };
  }
  const watch = {};
  for (const f of FAMILIES) {
    watch[f] = {};
    const w = pick(s, 'watch', f);
    if (!isObj(w)) continue;
    for (const [k, v] of Object.entries(w)) {
      const [chain, pool] = k.split(':');
      if (okChain(chain) && okAddr(pool) && isObj(v) && num(v.first) !== null) watch[f][k] = { first: num(v.first), last: num(v.last) || num(v.first) };
    }
  }
  return { version: 1, paper: true, steps: int(pick(s, 'steps')), tried: int(pick(s, 'tried')), spanMs: int(pick(s, 'spanMs')), hosts, watch };
}
function watchAdd(state, fam, row, now) {
  if (row.liq === null) return; // a pool with no liquidity on its rows can never be quoted
  const k = row.chain + ':' + row.pool;
  const w = state.watch[fam];
  if (w[k]) w[k].last = now; else w[k] = { first: now, last: now };
}
function watchPrune(state, now) {
  for (const f of FAMILIES) {
    const kept = Object.entries(state.watch[f]).filter(([, v]) => now - v.first <= CAPS.watchTtlMs).sort((a, b) => b[1].first - a[1].first || (a[0] < b[0] ? -1 : 1)).slice(0, CAPS.watchPerFamily);
    state.watch[f] = Object.fromEntries(kept);
  }
}
function watchGroups(state, fam) {
  const g = new Map();
  for (const k of Object.keys(state.watch[fam]).sort()) { const [chain, pool] = k.split(':'); if (!g.has(chain)) g.set(chain, []); g.get(chain).push(pool); }
  return g;
}
const chunks = (a, n) => { const out = []; for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n)); return out; };
const watchCount = (state) => FAMILIES.reduce((s, f) => s + Object.keys(state.watch[f]).length, 0);

/** STRATEGIES.json read back: kept strategies that still parse, the retired record, the search frontier, the last step. */
export function readStrategies(root) {
  const s = readJsonOr(path.join(root, STRATEGIES));
  const arr = (v) => (Array.isArray(v) ? v.filter(isObj) : []);
  const kept = arr(pick(s, 'kept')).filter((k) => typeof k.id === 'string' && validStrat(k) && Number.isFinite(Date.parse(k.keptAt)));
  return { kept, retired: arr(pick(s, 'retired')), frontier: arr(pick(s, 'frontier')).filter((f) => validStrat(f)), last: isObj(pick(s, 'last')) ? s.last : null, updated: typeof pick(s, 'updated') === 'string' ? s.updated : null };
}
/** BOOK.jsonl read back: one simulated position a line; a torn line is skipped and counted. */
export function readBook(root) {
  let text = '';
  try { text = fs.readFileSync(path.join(root, BOOK), 'utf8'); } catch { return { positions: [], torn: 0 }; }
  const positions = [];
  let torn = 0;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try { const p = JSON.parse(line); if (isObj(p) && typeof p.id === 'string' && typeof p.strategy === 'string') positions.push(p); else torn++; } catch { torn++; }
  }
  return { positions, torn };
}
const rowRef = (r) => (r ? { seen: r.seen, price: r.price, liq: r.liq } : null);
/** The paper positions of the kept strategies, forward from the moment each was kept (never on rows its search saw). */
export function bookPositions(kept, series, features, tmax) {
  const out = [];
  if (tmax === null) return out;
  for (const k of kept) {
    const s = validStrat(k, features);
    const from = Date.parse(k.keptAt);
    if (!s || !Number.isFinite(from)) continue;
    const ctx = buildCtx(series, features, { from, to: tmax + 1 });
    for (const t of simulate(s, ctx)) {
      const rows = ctx.series[t.si].rows;
      const d = rows[t.i];
      out.push({
        id: 'b-' + sha(k.id + '|' + d.key + '|' + d.seen).slice(0, 12), strategy: k.id, paper: true, pool: d.key, chain: d.chain, token: d.token, sym: d.sym,
        status: t.status, why: t.why, notionalUsd: COSTS.notionalUsd,
        decision: { seen: d.seen, price: d.price }, fill: { ...rowRef(rows[t.j]), px: t.px },
        exit: t.x !== null ? rowRef(rows[t.x]) : null, mark: t.status === 'closed' ? null : rowRef(rows[t.m]), net: r4(t.net),
      });
    }
  }
  return out;
}
/** A closed position never changes; an open one is replaced by its newer reading; the oldest closed go first past the cap. */
export function mergeBook(old, fresh, cap = CAPS.bookLines) {
  const m = new Map(old.map((p) => [p.id, p]));
  for (const p of fresh) { const o = m.get(p.id); if (!o || o.status !== 'closed') m.set(p.id, p); }
  let all = [...m.values()].sort((a, b) => String(pick(a, 'fill', 'seen')).localeCompare(String(pick(b, 'fill', 'seen'))) || (a.id < b.id ? -1 : 1));
  while (all.length > cap) { const i = all.findIndex((p) => p.status === 'closed'); all.splice(i >= 0 ? i : 0, 1); }
  return all;
}
export function bookStats(positions) {
  const by = (st) => positions.filter((p) => p.status === st);
  const usd = (ps) => r4(sum(ps.map((p) => (typeof p.net === 'number' ? p.net * (num(p.notionalUsd) || COSTS.notionalUsd) : 0))));
  return { open: by('open').length, closed: by('closed').length, unseen: by('unseen').length, netUsd: usd(by('closed')), markUsd: usd(by('open')) };
}

// ---- WATCH: one step's reading of the market
// the share of a step's time spent seeing: half while the tape is long enough to grade (the search takes the rest),
// most of it while the tape is still too short for a walk-forward grade (a search would only be skipped)
export const WATCH_SHARE = Object.freeze({ grading: 0.5, thin: 0.85 });
/** Discover, resolve tokens to pools, then re-read the watched pools in rounds until the deadline; append the tape. */
export async function watch(root, cfg, state, { fetch: fetchFn, clock = () => Date.now(), sleep = defaultSleep, deadline }) {
  const net = createNet({ fetch: fetchFn, clock, sleep, hosts: state.hosts, allowed: cfg.allowedHosts, deadline, gaps: isObj(cfg.hostGapMs) ? cfg.hostGapMs : {} });
  const rows = [];
  const tokens = [];
  let refused = 0;
  const take = (fam, r) => { refused += r.refused; for (const x of r.rows) { rows.push(x); watchAdd(state, fam, x, clock()); } };
  const on = (role) => cfg.sources.filter((s) => s.use === true && s.role === role && s.kind !== 'none');
  for (const s of on('discover')) {
    if (clock() >= deadline) break;
    const got = await net.get(s.url);
    if (!got) continue;
    if (s.kind === 'gt-pools') take('gt', rowsFromGeckoPools(got.json, got.seenMs, s.network));
    else if (s.kind === 'ds-pairs') take('ds', rowsFromDexPairs(got.json, got.seenMs, cfg.chains));
    else if (s.kind === 'ds-token-list') { const t = tokensFromList(got.json, cfg.chains); refused += t.refused; tokens.push(...t.tokens); }
  }
  const resolver = on('resolve').find((s) => s.kind === 'ds-pairs');
  if (resolver && tokens.length) {
    const byChain = new Map();
    for (const t of tokens) { if (!byChain.has(t.chain)) byChain.set(t.chain, new Set()); byChain.get(t.chain).add(t.token); }
    for (const [chain, set] of byChain) for (const c of chunks([...set], CAPS.batch)) {
      if (clock() >= deadline) break;
      const got = await net.get(fillUrl(resolver.url, { chain, addresses: c.join(',') }));
      if (got) take('ds', rowsFromDexPairs(got.json, got.seenMs, cfg.chains));
    }
  }
  watchPrune(state, clock());
  const watchers = on('watch').filter((s) => s.kind === 'ds-pairs' || s.kind === 'gt-pools');
  let rounds = 0;
  while (watchers.length && clock() < deadline) {
    const r0 = clock();
    let asked = 0;
    for (const w of watchers) {
      const fam = w.kind === 'gt-pools' ? 'gt' : 'ds';
      for (const [chain, pools] of watchGroups(state, fam)) for (const c of chunks(pools, CAPS.batch)) {
        if (clock() >= deadline) break;
        asked++;
        const got = await net.get(fillUrl(w.url, { chain, addresses: c.join(',') }));
        if (got) take(fam, fam === 'gt' ? rowsFromGeckoPools(got.json, got.seenMs, chain) : rowsFromDexPairs(got.json, got.seenMs, cfg.chains));
      }
    }
    if (!asked) break;
    rounds++;
    const wait = r0 + CAPS.roundGapMs - clock();
    if (clock() + Math.max(0, wait) >= deadline) break;
    if (wait > 0) await sleep(wait);
  }
  watchPrune(state, clock());
  const t = appendTape(root, rows);
  const now = clock();
  return {
    requests: net.log.requests, perHost: net.log.perHost, limited: net.log.limited, ok: net.log.ok, bytes: net.log.bytes, rows: t.appended, refused, rounds, watching: watchCount(state),
    blocked: net.log.blocked.length, firstBlocked: net.log.blocked.slice(0, 3),
    backoff: Object.keys(state.hosts).filter((h) => state.hosts[h].backoffUntil > now).sort(), tapeDropped: t.dropped, tapeLinesDropped: t.droppedLines,
  };
}

// ---- the lock: one step at a time on one root
function takeLock(root, clock) {
  const f = path.join(root, LOCK);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const body = JSON.stringify({ pid: process.pid, at: clock() });
  try { fs.writeFileSync(f, body, { flag: 'wx' }); return; } catch (e) { if (e.code !== 'EEXIST') throw e; }
  const held = readJsonOr(f);
  const at = num(pick(held, 'at'));
  if (at !== null && clock() - at < CAPS.lockStaleMs) throw new Fail('another market step holds ' + LOCK + ' since ' + iso(at), 3);
  fs.writeFileSync(f, body);
}
const releaseLock = (root) => { try { fs.rmSync(path.join(root, LOCK), { force: true }); } catch { /* the next step finds it stale */ } };

// ---- STEP: see, think, keep the paper book
/**
 * One step (contract c1). o: { maxMs, era, offline, fetch, clock, sleep, maxCandidates, features }. Writes only under
 * <root>/neo/market/ and returns the one line the CLI prints.
 */
export async function step(root, o = {}) {
  const clock = typeof o.clock === 'function' ? o.clock : () => Date.now();
  const sleep = typeof o.sleep === 'function' ? o.sleep : defaultSleep;
  const t0 = clock();
  const maxMs = Number.isFinite(o.maxMs) && o.maxMs > 0 ? o.maxMs : 60000;
  const deadline = t0 + maxMs;
  const cfg = loadConfig(root);
  takeLock(root, clock);
  try {
    const state = readState(root);
    state.steps++;
    const era = Number.isInteger(o.era) && o.era >= 0 ? o.era : null;
    const seed = era !== null ? era + 1 : state.steps;
    const share = state.spanMs >= GRADE.minSpanMs ? WATCH_SHARE.grading : WATCH_SHARE.thin;
    const seen = o.offline ? { skipped: 'offline' } : await watch(root, cfg, state, { fetch: o.fetch, clock, sleep, deadline: t0 + Math.floor(maxMs * share) });
    const tape = readTape(root);
    const strategies = readStrategies(root);
    const features = isObj(o.features) ? o.features : FEATURES;
    const reserve = Math.max(500, Math.floor(maxMs * 0.15));
    const th = think({
      rows: tape.rows, features, kept: strategies.kept, frontier: strategies.frontier, seed, era, clock,
      budgetMs: Math.max(0, deadline - reserve - clock()), maxCandidates: Number.isInteger(o.maxCandidates) ? o.maxCandidates : GRADE.maxCandidates,
    });
    state.tried += th.tried;
    const kept = [...th.kept].sort((a, b) => (num(pick(b, 'oos', 'edge')) || 0) - (num(pick(a, 'oos', 'edge')) || 0) || (a.id < b.id ? -1 : 1));
    const overflow = kept.splice(CAPS.kept).map((k) => ({ id: k.id, rule: k.rule, retiredAt: new Date(clock()).toISOString(), era, why: ['over the cap of ' + CAPS.kept + ' kept strategies, the lowest edge goes'] }));
    const retired = [...strategies.retired, ...th.retired, ...overflow].slice(-CAPS.retired);
    const series = seriesOf(tape.rows);
    const feats = Object.fromEntries(Object.entries(features).filter(([n]) => !th.leaks.includes(n)));
    const tmax = tape.rows.length ? tape.rows[tape.rows.length - 1].ms : null;
    const old = readBook(root);
    const book = mergeBook(old.positions, bookPositions(kept, series, feats, tmax));
    const graded = th.graded.map((g) => ({ id: g.id, rule: g.rule, fit: g.fit, oos: g.oos }));
    const bestG = [...graded].sort((a, b) => (b.oos.edge ?? -Infinity) - (a.oos.edge ?? -Infinity) || (a.id < b.id ? -1 : 1))[0] || null;
    const bestK = kept[0] || null;
    const edge = bestK ? num(pick(bestK, 'oos', 'edge')) : null;
    const why = edge === null ? 'no strategy has beaten its placebo control out of sample yet' + (th.skipped ? ': ' + th.skipped : th.void ? ': ' + th.void : '') : null;
    const updated = new Date(clock()).toISOString();
    const span = tmax === null ? 0 : tmax - tape.rows[0].ms;
    state.spanMs = span;
    writeAtomic(path.join(root, STRATEGIES), JSON.stringify({
      paper: true, updated, era, tried: state.tried, costs: COSTS, grade: GRADE,
      kept, retired, frontier: th.frontier,
      last: { at: updated, split: th.split, fitRows: th.fitRows, testRows: th.testRows, tried: th.tried, leaks: th.leaks, void: th.void, skipped: th.skipped, graded, best: bestG },
    }, null, 2) + '\n');
    writeAtomic(path.join(root, BOOK), book.map((p) => JSON.stringify(p)).join('\n') + (book.length ? '\n' : ''));
    writeAtomic(path.join(root, STATE), JSON.stringify(state, null, 2) + '\n');
    const pools = new Set(tape.rows.map((r) => r.key)).size;
    const compactBest = bestG ? { id: bestG.id, rule: bestG.rule, trades: bestG.oos.trades, net: bestG.oos.net.mean, control: bestG.oos.control.median, beat: bestG.oos.control.beat + '/' + bestG.oos.control.seeds, edge: bestG.oos.edge, carried: bestG.oos.carried, kept: kept.some((k) => k.id === bestG.id) } : null;
    return {
      paper: true, era, ms: clock() - t0, watch: seen,
      tape: { rows: tape.rows.length, pools, torn: tape.torn, bad: tape.bad, bytes: tape.bytes, spanMin: Math.round(span / 60000) },
      search: th.skipped ? { skipped: th.skipped, leaks: th.leaks } : { tried: th.tried, cps: th.cps, split: th.split, fitRows: th.fitRows, testRows: th.testRows, graded: graded.length, leaks: th.leaks },
      tried: state.tried, kept: kept.length, retired: th.retired.length, void: th.void, best: compactBest, edge, why, book: bookStats(book),
    };
  } finally {
    releaseLock(root);
  }
}

/** { paper, tapeRows, pools, tried, kept, best, edge, why, book }: what the files hold, nothing recomputed. */
export function status(root) {
  const tape = readTape(root);
  const st = readState(root);
  const S = readStrategies(root);
  const book = readBook(root);
  const k = S.kept[0] || null;
  const best = k
    ? { id: k.id, rule: k.rule, kept: true, trades: pick(k, 'oos', 'trades') ?? null, net: pick(k, 'oos', 'net', 'mean') ?? null, control: pick(k, 'oos', 'control', 'median') ?? null, edge: pick(k, 'oos', 'edge') ?? null, forward: k.forward ? { trades: k.forward.trades, net: pick(k, 'forward', 'net', 'mean') ?? null, edge: k.forward.edge } : null }
    : isObj(pick(S, 'last', 'best')) ? { id: S.last.best.id, rule: S.last.best.rule, kept: false, trades: pick(S, 'last', 'best', 'oos', 'trades') ?? null, net: pick(S, 'last', 'best', 'oos', 'net', 'mean') ?? null, control: pick(S, 'last', 'best', 'oos', 'control', 'median') ?? null, edge: pick(S, 'last', 'best', 'oos', 'edge') ?? null } : null;
  const edge = k ? num(pick(k, 'oos', 'edge')) : null;
  return {
    paper: true, tapeRows: tape.rows.length, pools: new Set(tape.rows.map((r) => r.key)).size, torn: tape.torn, steps: st.steps, tried: st.tried,
    kept: S.kept.length, retired: S.retired.length, best, edge, why: edge === null ? 'no strategy has beaten its placebo control out of sample yet' : null,
    book: { ...bookStats(book.positions), torn: book.torn }, at: S.updated,
  };
}

// ---- arguments and main
const VALUE = new Set(['max-ms', 'root', 'era']);
const BOOL = new Set(['offline']);
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (BOOL.has(name) && eq < 0) { flags[name] = true; continue; }
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
  if (!Number.isInteger(v) || v < lo || v > hi) throw new Fail('--' + name + ' is an integer from ' + lo + ' to ' + hi + ', not ' + String(flags[name]).slice(0, 20), 2);
  return v;
}
/** The CLI as a function: the printed object, or { usage: true }. o: test doubles (fetch, clock, sleep). */
export async function main(argv, o = {}) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || verb === 'help') return { usage: true };
  if (!verb) throw new Fail('no verb: step or status (--help)', 2);
  if (pos.length) throw new Fail('unexpected argument ' + String(pos[0]).slice(0, 40), 2);
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (verb === 'step') {
    return await step(root, {
      ...o, maxMs: intOf(flags, 'max-ms', 1000, 3600000, 60000), era: intOf(flags, 'era', 0, Number.MAX_SAFE_INTEGER, undefined), offline: flags.offline === true,
    });
  }
  if (verb === 'status') return status(root);
  throw new Fail('unknown verb ' + String(verb).slice(0, 40) + ': step or status (--help)', 2);
}

const samePath = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && samePath(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    const coded = e instanceof Fail;
    process.stderr.write((coded ? e.message : 'market failed: ' + first(e)) + '\n');
    done(coded ? e.code : 1);
  });
}
