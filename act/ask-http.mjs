// act/ask-http.mjs: THE ASK OVER HTTP, the pure request handler (queue item 12, docs/CLOUD-SESSION.md).
// Author: board 18 builder.
//
// His words, 2026-09-26 11:32 EDT: "it should be cli in dilation.dev someday so i can prompt like any
// ai". The tab answers what the organism's exact reader carries (web/ask.mjs); a question the tab does
// not carry comes HERE, and the organism answers it the way `node bin/brain.mjs ask` does: the same
// act/prompt.mjs ask(), the same brain the CLI's `init dilation` builds from seeds/basic.mjs (built
// ONCE per process, in memory, no snapshot on disk), and the same footer fields the CLI prints.
//
// handle({ method, headers, body, ip, env, now }) returns { status, headers, json }. It takes plain
// values, never a node:http request, so the Vercel function (api/ask.mjs), the local server
// (bin/ask-serve.mjs) and the tests (test/ask-http.test.mjs) share this one code path.
//
//   GET      200, a short usage line and the footer field names
//   OPTIONS  204, same origin only: never an Access-Control-Allow-Origin header
//   POST     JSON { prompt }: 400 on a body that is not JSON or has no prompt, 413 over 2000 chars,
//            429 with Retry-After past the per-IP bucket (20 asks a minute, continuous refill) or the
//            per-instance bucket (300 a minute), 403 when a browser Origin names another host
//
// THE MODEL CELL. Provider 'env' only when the environment holds BOTH names BRAIN_LLM_BASE and
// BRAIN_LLM_KEY, exactly the CLI's --provider env --env-base BRAIN_LLM_BASE --env-key BRAIN_LLM_KEY
// --model $BRAIN_LLM_MODEL wiring: the NAMES are passed to act/llm.mjs, which reads the values at
// request time; this file never keeps a value. Otherwise provider 'null', and the footer says the
// model cell is not configured on this host rather than pretending a model answered.
//
// THE BOUNDARY. At cold start the egress guard of bin/serve.mjs (installGuard) is installed with an
// allowlist of ONE origin: the model origin, computed here from BRAIN_LLM_BASE and never logged or
// returned (with no model configured, the default loopback model port, which nothing here calls).
// Every other fetch, http.request and https.request from this process is refused with
// EGRESS_REFUSED before a socket opens. Two local exceptions, neither of which can leave the host:
// a loopback request to a port a server IN THIS PROCESS is listening on (the platform's own bridge
// may forward each request to the function's server that way, the same reason bin/serve.mjs lets
// the organism reach its own control plane), and a Unix socket (socketPath). The response is scrubbed of the key and base values as a
// last wall behind act/llm.mjs's own scrub.
//
// THE LOG. One JSON line per request under os.tmpdir() (the function's only writable directory):
// at, status, promptHash, route, serverUs. Never the prompt. Rotated past 256 KB (one old segment).
//
// THE GROWING REPLY AND THE MISS LOG (board 37, item misses; his NEXT-WEEK.md step 8: "The site's miss reply
// changes from a refusal to \"I am growing a cell for this\", and the miss is logged for step 1. Every miss
// becomes a cell."). With no model cell configured, a memory miss (from memory, no hit, no cite) answers
// GROWING_HEAD on its first line (what a person on a phone reads), and, when the environment holds both
// SUPABASE_URL and SUPABASE_ANON_KEY (read by NAME), the miss is POSTed to Supabase public.misses with the
// publishable key (anon may INSERT only), awaited with a 1500 ms deadline, its failure a reason in
// json.growing and never a thrown error. The guard's allowlist gains that one origin (SUPABASE_URL's) and
// nothing else. A grown cell's answer (from 'cell') is not a miss, so none of this fires for it.
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { syncBuiltinESMExports } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ask, knowledgeReady, promptHash } from './prompt.mjs';
import { scrub } from './llm.mjs';
import { solve } from './solve.mjs';
import { seedBasic } from '../seeds/basic.mjs';
import { installGuard, DEFAULT_MODEL_URL } from '../bin/serve.mjs';
import { scrubSecrets } from './prompt.mjs'; // the miss row's prompt is scrubbed of credential shapes before it leaves

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// The knowledge store the function answers from: the full store when the host has it (this machine),
// else the 200 MB pack tools/knowledge-pack.mjs wrote in the same format (bench/verdicts/knowledge-pack.json:
// recall first 62, top five 78 on 200 held-out questions), which vercel.json includeFiles ships with the
// function (order 42 clause d). undefined means act/prompt.mjs's default, KNOWLEDGE_DIR.
export const PACK_DIR = path.join(ROOT, 'bench', 'fixtures', 'wiki', 'pack-200');
export function knowledgeDir() {
  if (knowledgeReady().ok) return undefined;
  return knowledgeReady(PACK_DIR).ok ? PACK_DIR : undefined;
}
export const BASE_NAME = 'BRAIN_LLM_BASE';
export const KEY_NAME = 'BRAIN_LLM_KEY';
export const MODEL_NAME = 'BRAIN_LLM_MODEL';
export const BRAIN_NAME = 'dilation';
export const LIMITS = Object.freeze({ promptChars: 2000, bodyBytes: 32 * 1024, ipPerMin: 20, instancePerMin: 300, ipTable: 5000, logBytes: 256 * 1024, modelMs: 25_000 });
/** The footer fields of `brain ask`, as this endpoint returns them (GET lists them). */
export const FOOTER = Object.freeze(['text', 'from', 'route', 'provenance', 'exact', 'native', 'llm', 'promptHash', 'promptChars', 'redacted', 'serverUs', 'host', 'knowledge']);
export const NOT_CONFIGURED = 'the model cell is not configured on this host: the environment does not hold both ' + BASE_NAME + ' and ' + KEY_NAME + ', so the null provider (offline, no model, no socket) stood in';
export const USAGE = 'POST application/json {"prompt": "..."} to this path; the organism answers with act/prompt.mjs ask(), as `node bin/brain.mjs ask dilation "..."` does, and returns the CLI footer fields. At most ' + LIMITS.promptChars + ' chars, ' + LIMITS.ipPerMin + ' asks a minute per client.';

/** True when the environment holds both names (values are not read beyond presence). */
/** The platform token a Vercel function receives; the AI Gateway accepts it as a Bearer key when no key of ours is set. */
export const OIDC_NAME = 'VERCEL_OIDC_TOKEN';
/** The NAME of the variable the model cell reads its key from: ours when set, else the platform token, else ours (unconfigured). */
export const keyNameFor = (env = process.env) => (env && env[KEY_NAME] ? KEY_NAME : env && env[OIDC_NAME] ? OIDC_NAME : KEY_NAME);
export const modelConfigured = (env = process.env) => Boolean(env && env[BASE_NAME] && env[keyNameFor(env)]);

// ---------------------------------------------------------------- the growing reply and the miss log (board 37, item misses)
// one line a person reads on a phone: under 240 characters, ends with a period (bench/ask-fallthrough.mjs firstLineForPerson)
export const GROWING_HEAD = 'I am growing a cell for this. Your prompt is logged, the next hourly generation in the cloud grows a cell that answers it, and this site answers it after that. Until then I answer greetings, arithmetic, equations and the facts I ingested.';
export const MISS_URL_NAME = 'SUPABASE_URL';
export const MISS_KEY_NAME = 'SUPABASE_ANON_KEY';
export const MISS_MS = 1500;
/** True when the environment holds both miss-log names (values are not read beyond presence). */
export const missConfigured = (env = process.env) => Boolean(env && env[MISS_URL_NAME] && env[MISS_KEY_NAME]);
/** The miss log's origin, for the guard's allowlist; null when the log is not configured or the url is not one. */
export function missOrigin(env = process.env) {
  if (!missConfigured(env)) return null;
  try { return new URL(String(env[MISS_URL_NAME])).origin; } catch { return null; }
}
/** A memory miss: the tier read memory, found nothing and cites nothing (a grown cell's answer is from 'cell'). */
export const isMemoryMiss = (a) => Boolean(a && a.from === 'memory' && ((a.provenance && a.provenance.memoryHits) ?? 0) === 0 && !(a.cites && a.cites.length));

/**
 * POST one miss row to Supabase public.misses with the publishable key (header apikey and Bearer).
 * Awaited, deadline timeoutMs, never throws: { logged, reason, status? }. No value is ever in the reason.
 * @param {object} env holds SUPABASE_URL and SUPABASE_ANON_KEY by name
 * @param {{prompt: string, reply: string, route: object}} row
 * @param {{fetch?: Function, timeoutMs?: number}} [o]
 */
export async function logMiss(env, row, { fetch: f = globalThis.fetch, timeoutMs = MISS_MS } = {}) {
  if (!missConfigured(env)) return { logged: false, reason: 'not logged: the environment does not hold both ' + MISS_URL_NAME + ' and ' + MISS_KEY_NAME };
  const origin = missOrigin(env);
  if (!origin) return { logged: false, reason: 'not logged: ' + MISS_URL_NAME + ' is not a url' };
  const key = String(env[MISS_KEY_NAME]);
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await f(origin + '/rest/v1/misses', {
      method: 'POST',
      headers: { apikey: key, authorization: 'Bearer ' + key, 'content-type': 'application/json', prefer: 'return=minimal' },
      body: JSON.stringify({ prompt: row.prompt, reply: row.reply, route: row.route }),
      signal: ac.signal,
    });
    try { await res.arrayBuffer(); } catch { /* the body is not needed */ }
    if (res.status >= 200 && res.status < 300) return { logged: true, reason: 'logged: the miss log answered ' + res.status, status: res.status };
    return { logged: false, reason: 'not logged: the miss log answered ' + res.status, status: res.status };
  } catch (e) {
    if (ac.signal.aborted) return { logged: false, reason: 'not logged: the miss log did not answer in ' + timeoutMs + ' ms' };
    return { logged: false, reason: 'not logged: the miss log could not be reached (' + String((e && e.code) || (e && e.cause && e.cause.code) || (e && e.name) || 'error') + ')' };
  } finally { clearTimeout(timer); }
}

/** A token bucket with continuous refill. take() returns 0 when a token was taken, else the ms to wait. */
export class Bucket {
  constructor(capacity, perMinute, now) { this.cap = capacity; this.rate = perMinute / 60_000; this.tokens = capacity; this.at = now; }
  refill(now) { if (now > this.at) { this.tokens = Math.min(this.cap, this.tokens + (now - this.at) * this.rate); this.at = now; } }
  take(now) { this.refill(now); if (this.tokens >= 1) { this.tokens -= 1; return 0; } return Math.ceil((1 - this.tokens) / this.rate); }
  give() { this.tokens = Math.min(this.cap, this.tokens + 1); }
}

const BASE_HEADERS = Object.freeze({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', vary: 'Origin' });
const lower = (h) => { const o = {}; for (const [k, v] of Object.entries(h || {})) o[String(k).toLowerCase()] = Array.isArray(v) ? v.join(', ') : v; return o; };
const rel = (s) => String(s || '').split(ROOT + path.sep).join('').split(ROOT).join('.');

/** The one line a response's status and ask leave in the request log. */
function logLine(file, row) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    try { if (fs.statSync(file).size > LIMITS.logBytes) fs.renameSync(file, file.replace(/\.jsonl$/, '.1.jsonl')); } catch { /* first line */ }
    fs.appendFileSync(file, JSON.stringify(row) + '\n');
  } catch { /* a read-only disk must not turn an answer into a crash */ }
}

/** The origin of the model base, for the guard. Read once at cold start, never logged or returned. */
function modelOrigin(env) {
  if (!modelConfigured(env)) return null;
  try { return new URL(String(env[BASE_NAME])).origin; } catch { return null; }
}

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '::1']);
const PORT = { 'http:': '80', 'https:': '443' };
/** The ports servers in THIS process listen on, read at request time. */
export function ownPorts() {
  const ports = new Set();
  const handles = typeof process._getActiveHandles === 'function' ? process._getActiveHandles() : [];
  for (const h of handles) {
    if (!(h instanceof net.Server) || !h.listening) continue;
    const a = h.address();
    if (a && typeof a === 'object' && a.port) ports.add(String(a.port));
  }
  return ports;
}
/** True for a target that cannot leave the host: this process's own listening port on loopback, or a Unix socket. */
export function ownTarget(proto, a, b) {
  try {
    let host, port;
    if (typeof a === 'string' || a instanceof URL) {
      const u = new URL(String(a));
      if (b && typeof b === 'object' && b.socketPath) return true;
      host = (b && typeof b === 'object' && (b.hostname || b.host)) || u.hostname;
      port = String((b && typeof b === 'object' && b.port) || u.port || PORT[u.protocol] || '');
    } else if (a && typeof a === 'object' && !(a instanceof Request)) {
      if (a.socketPath) return true;
      host = a.hostname || (a.host ? String(a.host).replace(/:\d+$/, '') : 'localhost');
      port = String(a.port || (a.host && /:\d+$/.test(String(a.host)) ? String(a.host).split(':').pop() : PORT[a.protocol || proto] || ''));
    } else if (a instanceof Request) {
      const u = new URL(a.url);
      host = u.hostname; port = String(u.port || PORT[u.protocol] || '');
    } else return false;
    return LOOPBACK.has(String(host).replace(/^\[|\]$/g, '').toLowerCase()) && ownPorts().has(port);
  } catch { return false; }
}
// Layered over the installed guard: an own-process target goes to the function the guard wrapped,
// every other target to the guard.
function ownProcessException(pre) {
  const gFetch = globalThis.fetch, gHttp = http.request, gHttps = https.request;
  if (typeof gFetch === 'function' && typeof pre.fetch === 'function') {
    globalThis.fetch = function fetchOwnOrGuarded(input, init) { return ownTarget('http:', input) ? pre.fetch.call(globalThis, input, init) : gFetch(input, init); };
  }
  http.request = function request(...args) { return ownTarget('http:', args[0], args[1]) ? pre.http.apply(http, args) : gHttp.apply(http, args); };
  http.get = function get(...args) { const r = http.request(...args); r.end(); return r; };
  https.request = function request(...args) { return ownTarget('https:', args[0], args[1]) ? pre.https.apply(https, args) : gHttps.apply(https, args); };
  https.get = function get(...args) { const r = https.request(...args); r.end(); return r; };
  syncBuiltinESMExports();
}

/**
 * A handler with its own buckets, brain and log. The module's `handle` below is one of these.
 * @param {object} [o] { stateDir, guard (default true), brainName }
 */
export function createHandler(o = {}) {
  const stateDir = o.stateDir || path.join(os.tmpdir(), 'brain-ask');
  const logFile = path.join(stateDir, 'requests.jsonl');
  const ips = new Map();
  let instance = null;
  let cold = null;
  const stats = { requests: 0, asks: 0, limited: 0, coldStartMs: null };

  async function coldStart(env) {
    const t0 = performance.now();
    let guard = null;
    if (o.guard !== false) {
      // the allowlist is the model origin and nothing else (installGuard reads only these names)
      const pre = globalThis.__brainEgressGuard ? null : { fetch: globalThis.fetch, http: http.request, https: https.request };
      // (and the miss log's origin when SUPABASE_URL and SUPABASE_ANON_KEY are both set: board 37, item misses)
      const g = installGuard({ env: { BRAIN_MODEL_URL: modelOrigin(env) || DEFAULT_MODEL_URL, BRAIN_EGRESS_ALLOW: missOrigin(env) || '' }, stateDir });
      if (pre) ownProcessException(pre);
      guard = { entries: g.allow.entries.length, routed: Boolean(g.allow.route) };
    }
    const brain = seedBasic({ name: o.brainName || BRAIN_NAME, ledger: 'full', ledgerRing: 4096 });
    // warm the exact reader here (its regexes compile on first use, about a millisecond), so the first
    // visitor's ask is timed in microseconds like every other one
    // (and the ask path around it, on a throwaway brain with the null provider: no model is ever warmed)
    solve('what is 17 times 23'); solve('write a poem about the sea');
    const warm = seedBasic({ name: 'warm', ledger: 'off' });
    for (const q of ['what is 17 times 23', 'write a poem about the sea']) await ask(warm, q, { provider: 'null', k: 5, events: [] });
    const kdir = knowledgeDir();
    const k = knowledgeReady(kdir);
    const knowledge = { ready: Boolean(k.ok), why: rel(k.ok ? (kdir ? 'the 200 MB knowledge pack is open to the tier' : 'the knowledge store is ingested and open to the tier') : k.reason), dir: kdir ? rel(kdir) : null };
    stats.coldStartMs = Number((performance.now() - t0).toFixed(3));
    return { brain, knowledge, guard };
  }

  function limit(ip, now) {
    if (!instance) instance = new Bucket(LIMITS.instancePerMin, LIMITS.instancePerMin, now);
    const key = String(ip || 'unknown');
    let b = ips.get(key);
    if (!b) {
      if (ips.size >= LIMITS.ipTable) {
        for (const [k2, v] of ips) { v.refill(now); if (v.tokens >= v.cap) ips.delete(k2); }
        while (ips.size >= LIMITS.ipTable) ips.delete(ips.keys().next().value);
      }
      b = new Bucket(LIMITS.ipPerMin, LIMITS.ipPerMin, now);
      ips.set(key, b);
    }
    const waitIp = b.take(now);
    if (waitIp) return { wait: waitIp, which: 'per client: ' + LIMITS.ipPerMin + ' asks a minute' };
    const waitAll = instance.take(now);
    if (waitAll) { b.give(); return { wait: waitAll, which: 'per instance: ' + LIMITS.instancePerMin + ' asks a minute' }; }
    return null;
  }

  /**
   * One request.
   * @param {{method?: string, headers?: object, body?: string|Buffer|object, ip?: string, env?: object, now?: number}} req
   * @returns {Promise<{status: number, headers: object, json: object|null}>}
   */
  async function handle(req = {}) {
    const env = req.env || process.env;
    const now = Number.isFinite(req.now) ? req.now : Date.now();
    const method = String(req.method || 'GET').toUpperCase();
    const h = lower(req.headers);
    const host = env.VERCEL_REGION || 'local';
    stats.requests++;
    const done = (status, json, extra = {}, row = {}) => {
      const out = json === null ? null : JSON.parse(scrubValues(JSON.stringify(json), env));
      logLine(logFile, { at: new Date(now).toISOString(), method, status, promptHash: row.promptHash || null, route: row.route || null, serverUs: row.serverUs ?? null });
      return { status, headers: { ...BASE_HEADERS, ...extra }, json: out };
    };
    // same origin only: a browser names its origin; another host's page is refused, never granted
    if (h.origin && h.origin !== 'null') {
      let oh = null;
      try { oh = new URL(h.origin).host; } catch { oh = null; }
      const hosts = [h.host, h['x-forwarded-host']].filter(Boolean).map((x) => String(x).split(',')[0].trim());
      if (!oh || !hosts.includes(oh)) return done(403, { ok: false, error: 'cross origin requests are refused: this endpoint answers its own site only' });
    }
    if (method === 'OPTIONS') return done(204, null, { allow: 'GET, POST, OPTIONS' });
    if (method === 'GET' || method === 'HEAD') {
      if (!cold) cold = coldStart(env);
      const s = await cold;
      return done(200, { ok: true, usage: USAGE, footer: FOOTER.slice(), host, knowledge: s.knowledge, model: { configured: modelConfigured(env), provider: modelConfigured(env) ? 'env' : 'null', names: [BASE_NAME, KEY_NAME, MODEL_NAME] } });
    }
    if (method !== 'POST') return done(405, { ok: false, error: 'method ' + method + ' is not served: GET for usage, POST {"prompt"} to ask' }, { allow: 'GET, POST, OPTIONS' });
    // the buckets come before parsing, so a flood of bad bodies is limited too
    const lim = limit(req.ip, now);
    if (lim) {
      stats.limited++;
      const s = Math.max(1, Math.ceil(lim.wait / 1000));
      return done(429, { ok: false, error: 'rate limited (' + lim.which + '): retry after ' + s + ' s', retryAfter: s }, { 'retry-after': String(s) });
    }
    let body = req.body, obj;
    if (body && typeof body === 'object' && !(body instanceof Uint8Array)) obj = body;
    else {
      if (body instanceof Uint8Array) body = Buffer.from(body).toString('utf8');
      if (typeof body !== 'string' || !body.length) return done(400, { ok: false, error: 'the body must be JSON {"prompt": "..."}; it was empty' });
      if (Buffer.byteLength(body) > LIMITS.bodyBytes) return done(413, { ok: false, error: 'the body is over ' + LIMITS.bodyBytes + ' bytes' });
      try { obj = JSON.parse(body); } catch { return done(400, { ok: false, error: 'the body is not JSON: send {"prompt": "..."} as application/json' }); }
    }
    const prompt = obj && typeof obj.prompt === 'string' ? obj.prompt : null;
    if (prompt === null || !prompt.trim()) return done(400, { ok: false, error: 'the JSON has no prompt: send {"prompt": "..."}' });
    if (prompt.length > LIMITS.promptChars) return done(413, { ok: false, error: 'the prompt is ' + prompt.length + ' chars; at most ' + LIMITS.promptChars, promptChars: prompt.length }, {}, { promptHash: promptHash(prompt) });
    if (!cold) cold = coldStart(env);
    const s = await cold;
    const configured = modelConfigured(env);
    // the CLI's wiring: --provider env --env-base BRAIN_LLM_BASE --env-key BRAIN_LLM_KEY --model $BRAIN_LLM_MODEL
    const opts = configured
      ? { provider: 'env', envBase: BASE_NAME, envKey: keyNameFor(env), model: env[MODEL_NAME] || undefined, k: 5, events: [], timeoutMs: LIMITS.modelMs }
      : { provider: 'null', k: 5, events: [] };
    if (s.knowledge.dir) opts.knowledge = PACK_DIR;
    const t0 = process.hrtime.bigint();
    let a;
    try { a = await ask(s.brain, prompt, opts); } catch (e) {
      const serverUs = Number((process.hrtime.bigint() - t0) / 1000n);
      return done(500, { ok: false, error: 'the ask threw: ' + String(e && e.message || e).split('\n')[0].slice(0, 200), serverUs, host }, {}, { promptHash: promptHash(prompt), serverUs });
    }
    const serverUs = Number((process.hrtime.bigint() - t0) / 1000n);
    stats.asks++;
    const p = a.provenance || {};
    const l = p.llm || {};
    const llm = { provider: l.provider ?? null, model: l.model ?? null, ms: l.ms ?? 0, tokens: l.tokens ?? 0, ok: Boolean(l.ok), reason: l.reason ?? null, fellBack: l.fellBack ?? null };
    if (!configured && llm.provider === 'null' && !llm.reason) llm.reason = NOT_CONFIGURED;
    const json = {
      ok: true,
      text: a.text, from: a.from, route: a.route || null,
      provenance: { answer: p.answer ?? null, method: p.method ?? null, memoryHits: p.memoryHits ?? 0, webPages: p.webPages ?? 0, modelAgreed: p.modelAgreed ?? null },
      exact: a.exact ? { answer: a.exact.answer, method: a.exact.method, ...(typeof a.exact.ns === 'number' ? { ns: a.exact.ns } : {}) } : null,
      // The native conversation region (act/converse.mjs): the page renders native.answer the way it renders exact.answer.
      native: a.native && a.native.answer != null ? { kind: a.native.kind, answer: a.native.answer, form: a.native.form ?? null, ...(typeof a.native.ns === 'number' ? { ns: a.native.ns } : {}) } : null,
      llm,
      promptHash: a.promptHash, promptChars: a.promptChars, redacted: a.redacted || 0,
      cites: Array.isArray(a.cites) ? a.cites.slice(0, 5) : [],
      serverUs, host, knowledge: s.knowledge,
      model: { configured, provider: configured ? 'env' : 'null', names: [BASE_NAME, KEY_NAME, MODEL_NAME], keyName: keyNameFor(env) },
    };
    // THE GROWING REPLY (board 37, item misses): no model cell and a memory miss. The first line is the growing
    // head; the miss goes to the log, awaited (a serverless host ends the work with the response).
    if (!configured && isMemoryMiss(a)) {
      json.text = GROWING_HEAD + '\n' + a.text;
      const row = {
        prompt: scrubSecrets(prompt).text.slice(0, LIMITS.promptChars),
        reply: json.text.split('\n')[0],
        route: { from: a.from, route: a.route || null, provenance: p.answer ?? null, host },
      };
      let g;
      try { g = await logMiss(env, row); } catch (e) { g = { logged: false, reason: 'not logged: ' + String((e && e.code) || (e && e.name) || 'error') }; }
      json.growing = { logged: Boolean(g.logged), reason: g.reason };
      // the head says the miss is logged; when it was not, the second line says so (the first line stays the head)
      if (!json.growing.logged) json.text = GROWING_HEAD + '\n(' + g.reason + ')\n' + a.text;
    }
    return done(200, json, {}, { promptHash: a.promptHash, route: json.route, serverUs });
  }

  handle.stats = stats;
  handle.logFile = logFile;
  handle.stateDir = stateDir;
  return handle;
}

/** The last wall: the key and the base values (and the base origin) never leave in a response. */
function scrubValues(s, env) {
  let out = s;
  for (const name of [KEY_NAME, BASE_NAME]) {
    const v = env && env[name];
    if (!v) continue;
    out = scrub(out, v);
    if (name === BASE_NAME) { try { const u = new URL(String(v)); out = scrub(scrub(out, u.origin), u.host); } catch { /* not a url */ } }
  }
  return out;
}

let DEFAULT = null;
/** The process's one handler (the function and the local server use it). */
export function handle(req) { if (!DEFAULT) DEFAULT = createHandler(); return DEFAULT(req); }
