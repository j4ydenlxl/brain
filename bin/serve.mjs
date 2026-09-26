#!/usr/bin/env node
// bin/serve.mjs: THE CONTAINER ENTRY (his P13: "It should live 24/7 on the cloud remember Its
// literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE"). One process that keeps the organism
// alive and bounded, in three roles chosen by how it is started:
//
//   node bin/serve.mjs                      the SUPERVISOR: forks the daemon child, restarts it
//                                           from the last checkpoint on ANY exit and prints the
//                                           restart count, samples its RSS against a cap, rotates
//                                           the ledger as a backstop, serves daemon/health.mjs,
//                                           heartbeats /state/instances.json, and runs
//                                           bench/ladder.mjs --log once a day at 04:00.
//   node bin/serve.mjs --child              the DAEMON CHILD: installs the egress guard, then runs
//                                           daemon/run.mjs live() (ledger summary, checkpoint
//                                           every N ticks, resume from $BRAIN_STATE_DIR).
//   node --import <this file> other.mjs     the GUARD ONLY, when BRAIN_EGRESS_GUARD=1: every node
//                                           process under the supervisor (the ladder, anything
//                                           the daemon spawns) gets it through NODE_OPTIONS.
//
// THE EGRESS ALLOWLIST. Three sources and nothing else: the venue feed hosts world/policy.json
// declares (http.hosts, and a url or host on each venue.venues / venue.feeds entry; the shipped
// file declares none), the model endpoint (BRAIN_MODEL_URL, default act/llm.mjs OLLAMA_BASE),
// the checkpoint store (BRAIN_CHECKPOINT_URL, none by default), plus BRAIN_EGRESS_ALLOW, a comma
// list of host:port that compose.yaml documents. Every other fetch, http.request and
// https.request is refused before a socket opens, with code EGRESS_REFUSED, and one JSON line
// goes to $BRAIN_STATE_DIR/egress.log (rotated at 1 MB). When BRAIN_MODEL_URL names a different
// origin than the default, a request to the default origin is ROUTED there: act/llm.mjs has
// 127.0.0.1:11434 built in, and inside a container that address is the container itself.
//
// Environment (every value has a default; compose.yaml sets the container's):
//   BRAIN_STATE_DIR   /state in the image, brain/state natively       BRAIN_NAME        cloud
//   BRAIN_MAJORS 12   BRAIN_UNITS 256   BRAIN_SEED (build only)       BRAIN_CHECKPOINT_EVERY 1000
//   BRAIN_LEDGER summary                BRAIN_LEDGER_BUDGET_MB 64      BRAIN_HEAP_MB 224
//   BRAIN_RSS_CAP_MB 448                BRAIN_NODE_FLAGS "--max-semi-space-size=1 --optimize-for-size"
//   BRAIN_SELF_EVERY / BRAIN_GEN_EVERY  (unset: daemon/run.mjs defaults)
//   HEALTH_PORT 8080  HEALTH_HOST 127.0.0.1 (0.0.0.0 in the image)  BRAIN_INSTANCE host-pid
//   BRAIN_INSTANCE_EVERY_MS 60000       BRAIN_LADDER on|off  BRAIN_LADDER_HOUR 4  BRAIN_LADDER_HEAP_MB 384
//   BRAIN_SAMPLE_MS 1000                BRAIN_DISK_CAP_MB 2048
//   BRAIN_EPISODES_MAX 2048             the episodic record's bound, handed to the daemon child
//                                       (seeds/whole.mjs): 2048 keys x 8192 Int8 lanes = 16 MB
//                                       (notes/cloud.md, Measured: 8192 held about 55 MB more
//                                       RSS and the same rulers; board 16 builder, fit item)
import { fork, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, statSync, readdirSync, appendFileSync, rmSync, cpSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { syncBuiltinESMExports } from 'node:module';

const SELF = fileURLToPath(import.meta.url);
export const ROOT = path.resolve(path.dirname(SELF), '..');
/** act/llm.mjs OLLAMA_BASE, repeated here so the supervisor never loads the model module; a test holds the two equal. */
export const DEFAULT_MODEL_URL = 'http://127.0.0.1:11434';
export const EGRESS_CODE = 'EGRESS_REFUSED';

const now = () => Date.now();
const iso = (ms = now()) => new Date(ms).toISOString();
const firstLine = (e) => String((e && e.message) || e).split('\n')[0];
const sleepSync = (ms) => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch { /* no wait available */ } };

// ---------------------------------------------------------------- configuration
/** The episodic bound the daemon gets when BRAIN_EPISODES_MAX is unset: 2048 keys x 8192 lanes = 16 MB. */
export const DEFAULT_EPISODES_MAX = 2048;
/**
 * The episodic record's bound from the environment. Pure: no process, no file.
 * @returns {{ maxEpisodes: number, from: string }}
 */
export function episodicOptions(env = process.env) {
  const v = env.BRAIN_EPISODES_MAX;
  if (v === undefined || String(v).trim() === '') return { maxEpisodes: DEFAULT_EPISODES_MAX, from: 'default' };
  const n = Number(String(v).trim());
  if (!Number.isInteger(n) || n < 16) throw new Error('BRAIN_EPISODES_MAX must be an integer of at least 16, got ' + JSON.stringify(v));
  return { maxEpisodes: n, from: 'BRAIN_EPISODES_MAX' };
}

export function config(env = process.env) {
  const num = (k, d) => {
    const v = env[k];
    if (v === undefined || v === '') return d;
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error(k + ' must be a number, got ' + JSON.stringify(v));
    return n;
  };
  const opt = (k) => (env[k] === undefined || env[k] === '' ? undefined : num(k, undefined));
  const stateDir = path.resolve(env.BRAIN_STATE_DIR && env.BRAIN_STATE_DIR.trim() ? env.BRAIN_STATE_DIR.trim() : path.join(ROOT, 'state'));
  return {
    stateDir,
    name: env.BRAIN_NAME || 'cloud',
    majors: num('BRAIN_MAJORS', 12),
    units: num('BRAIN_UNITS', 256),
    seed: env.BRAIN_SEED || undefined,
    checkpointEvery: num('BRAIN_CHECKPOINT_EVERY', 1000),
    ledger: env.BRAIN_LEDGER || 'summary',
    ledgerBudgetMb: num('BRAIN_LEDGER_BUDGET_MB', 64),
    heapMb: num('BRAIN_HEAP_MB', 224),
    episodesMax: episodicOptions(env).maxEpisodes,
    rssCapMb: num('BRAIN_RSS_CAP_MB', 448),
    nodeFlags: (env.BRAIN_NODE_FLAGS === undefined ? '--max-semi-space-size=1 --optimize-for-size' : env.BRAIN_NODE_FLAGS).split(/\s+/).filter(Boolean),
    selfEvery: opt('BRAIN_SELF_EVERY'),
    genEvery: opt('BRAIN_GEN_EVERY'),
    healthPort: num('HEALTH_PORT', 8080),
    healthHost: env.HEALTH_HOST || '127.0.0.1',
    instance: env.BRAIN_INSTANCE || (os.hostname() + '-' + process.pid),
    instanceEveryMs: num('BRAIN_INSTANCE_EVERY_MS', 60_000),
    ladder: (env.BRAIN_LADDER || 'on') !== 'off',
    ladderHour: num('BRAIN_LADDER_HOUR', 4),
    ladderHeapMb: num('BRAIN_LADDER_HEAP_MB', 384),
    sampleMs: num('BRAIN_SAMPLE_MS', 1000),
    diskCapMb: num('BRAIN_DISK_CAP_MB', 2048),
    imageSeed: env.BRAIN_IMAGE_SEED || null,
  };
}

// ---------------------------------------------------------------- the egress allowlist
const DEFAULT_PORT = { 'http:': '80', 'https:': '443', 'ws:': '80', 'wss:': '443' };

/** "host", "host:port" or a URL to { host, port } ('*' when a bare host names no port). */
export function parseEntry(s) {
  const t = String(s || '').trim();
  if (!t) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) {
    const u = new URL(t);
    return { host: u.hostname.replace(/^\[|\]$/g, '').toLowerCase(), port: u.port || DEFAULT_PORT[u.protocol] || '*' };
  }
  const m = /^\[?([^\]\s]+?)\]?(?::(\d+|\*))?$/.exec(t);
  if (!m) return null;
  return { host: m[1].toLowerCase(), port: m[2] || '*' };
}

function venueHosts(policy) {
  const out = [];
  const http_ = policy && policy.http;
  for (const h of (http_ && Array.isArray(http_.hosts) ? http_.hosts : [])) out.push(typeof h === 'string' ? h : h && (h.url || h.host));
  const v = policy && policy.venue;
  for (const list of [v && v.venues, v && v.feeds]) {
    for (const x of (Array.isArray(list) ? list : [])) out.push(typeof x === 'string' ? x : x && (x.feed || x.url || x.host));
  }
  return out.filter(Boolean);
}

/**
 * The allowlist, from its three sources and the documented extra. Each entry says why it is
 * there, so the refusal message and the health JSON can print the reason.
 */
export function egressAllow({ env = process.env, policyFile = path.join(ROOT, 'world', 'policy.json') } = {}) {
  const entries = [];
  const add = (spec, why) => { const e = parseEntry(spec); if (e && !entries.some((x) => x.host === e.host && x.port === e.port)) entries.push({ ...e, why }); };
  let policy = null;
  try { policy = JSON.parse(readFileSync(policyFile, 'utf8')); } catch { /* no policy file: no venue hosts */ }
  for (const h of venueHosts(policy)) add(h, 'venue feed (world/policy.json)');
  add(env.BRAIN_MODEL_URL || DEFAULT_MODEL_URL, 'model endpoint');
  if (env.BRAIN_CHECKPOINT_URL) add(env.BRAIN_CHECKPOINT_URL, 'checkpoint store');
  for (const h of String(env.BRAIN_EGRESS_ALLOW || '').split(',')) add(h, 'BRAIN_EGRESS_ALLOW');
  let route = null;
  if (env.BRAIN_MODEL_URL) {
    const from = new URL(DEFAULT_MODEL_URL), to = new URL(env.BRAIN_MODEL_URL);
    if (from.origin !== to.origin) route = { from: from.origin, to: to.origin };
  }
  return { entries, route, venueDeclared: venueHosts(policy).length };
}

/** Decide one request. Pure: no socket, no log. */
export function checkEgress(allow, urlLike) {
  let u;
  try { u = new URL(String(urlLike)); } catch { return { ok: false, host: null, port: null, reason: 'not a url: ' + String(urlLike).slice(0, 80) }; }
  if (u.protocol === 'data:' || u.protocol === 'blob:') return { ok: true, host: null, port: null, url: u, why: 'no network' };
  const host = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const port = u.port || DEFAULT_PORT[u.protocol] || '';
  const hit = allow.entries.find((e) => e.host === host && (e.port === '*' || e.port === port));
  if (hit) return { ok: true, host, port, url: u, why: hit.why };
  const list = allow.entries.map((e) => e.host + ':' + e.port).join(', ') || 'empty';
  return { ok: false, host, port, url: u, reason: host + ':' + port + ' is not on the egress allowlist (' + list + ')' };
}

function refusalError(verdict) {
  return Object.assign(new TypeError('egress refused: ' + verdict.reason), { code: EGRESS_CODE, host: verdict.host, port: verdict.port });
}

function egressLogger(stateDir) {
  const file = stateDir ? path.join(stateDir, 'egress.log') : null;
  let count = 0;
  const log = (row) => {
    count++;
    if (!file) return;
    try {
      mkdirSync(stateDir, { recursive: true });
      try { if (statSync(file).size > 1_048_576) { rmSync(file + '.1', { force: true }); renameSync(file, file + '.1'); } } catch { /* first line */ }
      appendFileSync(file, JSON.stringify(row) + '\n');
    } catch { /* a read-only or missing state dir must not turn a refusal into a crash */ }
  };
  log.count = () => count;
  return log;
}

function routeUrl(allow, href) {
  if (!allow.route) return href;
  return href.startsWith(allow.route.from) ? allow.route.to + href.slice(allow.route.from.length) : href;
}

// THE ONE LOOPBACK EXCEPTION: the organism's own control plane. daemon/run.mjs live() asks
// cli/control.mjs connect() whether a daemon already runs on this brain (GET /health on the
// loopback port its control.json names). Refused, that check reads as "not running" and a
// second daemon would open the same brain. So a loopback request is allowed when its port is
// named by a control.json under the state dir whose pid is alive. Nothing else on loopback is.
const LOOPBACK = new Set(['127.0.0.1', 'localhost', '::1']);
const pidAlive = (pid) => { try { process.kill(Number(pid), 0); return true; } catch (e) { return e.code === 'EPERM'; } };
/** Ports of the live control planes under stateDir (<stateDir>/<name>/control.json). */
export function ownControlPorts(stateDir) {
  const ports = new Set();
  let entries;
  try { entries = readdirSync(stateDir, { withFileTypes: true }); } catch { return ports; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const j = readJson(path.join(stateDir, e.name, 'control.json'));
    if (j && j.port && j.pid && pidAlive(j.pid)) ports.add(String(j.port));
  }
  return ports;
}
/** (host, port) => the reason a refused request is the organism's own control plane, or null. */
export function localControl(stateDir) {
  if (!stateDir) return () => null;
  return (host, port) => (LOOPBACK.has(host) && ownControlPorts(stateDir).has(String(port)) ? 'own control plane (a live control.json under the state dir)' : null);
}

/** A fetch that asks the allowlist first. realFetch is injectable so a test never opens a socket. */
export function guardFetch(realFetch, allow, log = () => {}, local = () => null) {
  return async function guardedFetch(input, init) {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input && input.url;
    const routed = routeUrl(allow, String(href));
    let v = checkEgress(allow, routed);
    if (!v.ok && local(v.host, v.port)) v = { ...v, ok: true };
    if (!v.ok) {
      log({ at: iso(), pid: process.pid, via: 'fetch', host: v.host, port: v.port, url: v.url ? v.url.origin + v.url.pathname : String(href).slice(0, 120), reason: v.reason });
      throw refusalError(v);
    }
    if (routed !== String(href)) return realFetch(routed, typeof input === 'object' && !(input instanceof URL) ? { method: input.method, headers: input.headers, body: input.body, ...init } : init);
    return realFetch(input, init);
  };
}

function requestTarget(proto, args) {
  const [a, b] = args;
  if (typeof a === 'string' || a instanceof URL) {
    const u = new URL(String(a));
    if (b && typeof b === 'object' && (b.hostname || b.host)) return new URL(proto + '//' + (b.hostname || b.host) + (b.port ? ':' + b.port : ''));
    return u;
  }
  const o = a || {};
  const host = o.hostname || (o.host ? String(o.host).replace(/:\d+$/, '') : 'localhost');
  const port = o.port || (o.host && /:\d+$/.test(String(o.host)) ? String(o.host).split(':').pop() : '');
  const bracket = host.includes(':') ? '[' + host + ']' : host;
  return new URL((o.protocol || proto) + '//' + bracket + (port ? ':' + port : '') + (o.path || '/'));
}

function guardModule(mod, proto, allow, log, local = () => null) {
  const original = mod.request;
  const guarded = function request(...args) {
    let target;
    try { target = requestTarget(proto, args); } catch { return original.apply(mod, args); }
    const v = checkEgress(allow, target.href);
    if (v.ok || local(v.host, v.port)) return original.apply(mod, args);
    log({ at: iso(), pid: process.pid, via: proto.slice(0, -1), host: v.host, port: v.port, url: target.origin + target.pathname, reason: v.reason });
    // a request whose connection fails before it opens: the caller sees an ordinary 'error' event
    const cb = args.find((x) => typeof x === 'function');
    const opts = { ...(typeof args[0] === 'object' && !(args[0] instanceof URL) ? args[0] : {}), host: 'invalid.invalid', hostname: 'invalid.invalid', port: 1, agent: undefined,
      createConnection: () => { const s = new net.Socket(); process.nextTick(() => s.destroy(refusalError(v))); return s; } };
    return cb ? original.call(mod, opts, cb) : original.call(mod, opts);
  };
  mod.request = guarded;
  mod.get = function get(...args) { const r = guarded(...args); r.end(); return r; };
}

/**
 * Install the guard in this process: globalThis.fetch, http.request/get, https.request/get.
 * The allowlist comes from BRAIN_EGRESS_LIST (the supervisor computes it once and hands it
 * down) or is computed here. Idempotent.
 */
export function installGuard({ env = process.env, stateDir = null } = {}) {
  if (globalThis.__brainEgressGuard) return globalThis.__brainEgressGuard;
  let allow = null;
  if (env.BRAIN_EGRESS_LIST) { try { allow = JSON.parse(env.BRAIN_EGRESS_LIST); } catch { allow = null; } }
  if (!allow || !Array.isArray(allow.entries)) allow = egressAllow({ env });
  const dir = stateDir || (env.BRAIN_STATE_DIR ? path.resolve(env.BRAIN_STATE_DIR) : null);
  const log = egressLogger(dir);
  const local = localControl(dir);
  if (typeof globalThis.fetch === 'function') globalThis.fetch = guardFetch(globalThis.fetch.bind(globalThis), allow, log, local);
  guardModule(http, 'http:', allow, log, local);
  guardModule(https, 'https:', allow, log, local);
  syncBuiltinESMExports(); // so import { request, get } from 'node:http' sees the guarded ones too
  globalThis.__brainEgressGuard = { allow, refused: log.count, logFile: dir ? path.join(dir, 'egress.log') : null };
  return globalThis.__brainEgressGuard;
}

// ---------------------------------------------------------------- small durable files
/** Write JSON atomically: a temp file, then a rename (retried: Windows refuses a rename a reader holds). */
export function writeJsonAtomic(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.' + process.pid + '.tmp';
  writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n');
  for (let i = 0; ; i++) {
    try { renameSync(tmp, file); return file; } catch (e) {
      if (i >= 8) { try { rmSync(tmp, { force: true }); } catch { /* best effort */ } throw e; }
      sleepSync(15 * (i + 1));
    }
  }
}
export function readJson(file, dflt = null) { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return dflt; } }

// ---------------------------------------------------------------- instances: the multiplying ruler
export const ALIVE_WINDOW_MS = 150_000; // two and a half heartbeat periods of 60 s
export const INSTANCE_GC_MS = 600_000;

/** Record this instance in <stateDir>/instances.json (read, merge, atomic write). */
export function heartbeat(stateDir, rec, { at = now(), remove = false } = {}) {
  const file = path.join(stateDir, 'instances.json');
  const doc = readJson(file, null) || { instances: {} };
  if (!doc.instances || typeof doc.instances !== 'object') doc.instances = {};
  for (const [id, r] of Object.entries(doc.instances)) if (!r || !(at - Date.parse(r.lastSeen) < INSTANCE_GC_MS)) delete doc.instances[id];
  if (remove) delete doc.instances[rec.id];
  else doc.instances[rec.id] = { ...rec, lastSeen: iso(at) };
  doc.updatedAt = iso(at);
  doc.aliveWindowMs = ALIVE_WINDOW_MS;
  writeJsonAtomic(file, doc);
  return doc;
}
/** Instances seen within the alive window. */
export function instancesAlive(doc, { at = now(), windowMs = ALIVE_WINDOW_MS } = {}) {
  const rows = Object.values((doc && doc.instances) || {}).filter((r) => r && at - Date.parse(r.lastSeen) <= windowMs);
  return { alive: rows.length, ids: rows.map((r) => r.id).sort() };
}

// ---------------------------------------------------------------- the ladder clock
/** The next local HOUR:00:00 strictly after atMs (container time: the TZ the process runs in). */
export function nextLadderAt(atMs = now(), hour = 4) {
  const d = new Date(atMs);
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 0, 0, 0);
  if (t.getTime() <= atMs) t.setDate(t.getDate() + 1);
  return t.getTime();
}

// ---------------------------------------------------------------- disk
export function dirBytes(dir) {
  let n = 0;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) {
    const f = path.join(dir, e.name);
    try { n += e.isDirectory() ? dirBytes(f) : statSync(f).size; } catch { /* raced with a rename */ }
  }
  return n;
}

/**
 * The backstop rotation: core/ledger.mjs rotates its own file when the daemon registered a
 * budget. If the live file is past the WHOLE budget anyway (no policy, an older core), it is
 * renamed to ledger.1.jsonl here and the older segment deleted.
 */
export function rotateLedger(ledgerFile, budgetBytes) {
  let size = 0;
  try { size = statSync(ledgerFile).size; } catch { return { rotated: false, size: 0 }; }
  if (!(budgetBytes > 0) || size <= budgetBytes) return { rotated: false, size };
  const prev = ledgerFile.replace(/\.jsonl$/, '') + '.1.jsonl';
  try { rmSync(prev, { force: true }); renameSync(ledgerFile, prev); return { rotated: true, size }; }
  catch (e) { return { rotated: false, size, error: firstLine(e) }; }
}

// ---------------------------------------------------------------- the supervisor
export class Supervisor {
  constructor(cfg, { log = (l) => console.log(l) } = {}) {
    this.cfg = cfg;
    this.say = log;
    this.brainDir = path.join(cfg.stateDir, cfg.name);
    this.statusFile = path.join(this.brainDir, 'serve.json');
    this.allow = egressAllow({ env: process.env });
    this.startedAt = now();
    this.restarts = 0; this.plannedStops = 0; this.budgetKills = 0; this.starts = 0;
    this.child = null; this.childInfo = null; this.lastExit = null;
    this.stopping = false; this.paused = false; this.backoffMs = 1000;
    this.peak = { daemonRssMb: 0, serveRssMb: 0 };
    this.ledger = { level: cfg.ledger, budgetMb: cfg.ledgerBudgetMb, backstopRotations: 0, policy: null };
    this.ladderState = { enabled: cfg.ladder, hour: cfg.ladderHour, nextAt: null, running: false, last: null };
    this.overCap = 0; this.stateBytes = null; this.health = null;
    this.timers = [];
    this.sampler = existsSync(path.join(ROOT, 'tools', 'budget.mjs')) ? 'own (tools/budget.mjs is present; the daemon reports its own rss over ipc because the supervisor needs that channel anyway)' : 'own (tools/budget.mjs absent)';
  }

  instanceRecord() {
    return { id: this.cfg.instance, name: this.cfg.name, pid: process.pid, host: os.hostname(), port: this.health ? this.health.port : this.cfg.healthPort, startedAt: iso(this.startedAt), restarts: this.restarts, tick: this.childInfo ? this.childInfo.lastT : null };
  }

  status() {
    const c = this.childInfo;
    return {
      instance: this.cfg.instance, name: this.cfg.name, pid: process.pid, host: os.hostname(), node: process.version,
      startedAt: iso(this.startedAt), updatedAt: iso(), restarts: this.restarts, plannedStops: this.plannedStops, budgetKills: this.budgetKills, starts: this.starts,
      child: c ? { pid: c.pid, startedAt: iso(c.startedAt), built: c.built, resumedAt: c.resumedAt, lastT: c.lastT, lastAt: c.lastAt ? iso(c.lastAt) : null, rssMb: c.rssMb, maxRssMb: c.maxRssMb, heapUsedMb: c.heapUsedMb, heapTotalMb: c.heapTotalMb, externalMb: c.externalMb, arrayBuffersMb: c.arrayBuffersMb, episodic: c.episodic, knowledge: c.knowledge ?? null, fit: c.fit ?? null, cpuS: c.cpuS, ticksPerSec: c.tps, ledgerPolicy: c.ledgerPolicy, guard: c.guard } : null,
      lastExit: this.lastExit, peak: this.peak,
      budget: { heapMb: this.cfg.heapMb, episodesMax: this.cfg.episodesMax, rssCapMb: this.cfg.rssCapMb, diskCapMb: this.cfg.diskCapMb, nodeFlags: this.cfg.nodeFlags, sampler: this.sampler },
      ledger: this.ledger, stateBytes: this.stateBytes,
      ladder: { ...this.ladderState, nextAt: this.ladderState.nextAt ? iso(this.ladderState.nextAt) : null },
      egress: { allow: this.allow.entries, route: this.allow.route, venueDeclared: this.allow.venueDeclared },
      config: { majors: this.cfg.majors, units: this.cfg.units, checkpointEvery: this.cfg.checkpointEvery, selfEvery: this.cfg.selfEvery ?? 'daemon default', genEvery: this.cfg.genEvery ?? 'daemon default' },
    };
  }

  writeStatus() { try { writeJsonAtomic(this.statusFile, this.status()); } catch (e) { this.say('[serve] status write failed: ' + firstLine(e)); } }

  checkpointTick() { const m = readJson(path.join(this.brainDir, 'meta.json'), null); return m && Number.isFinite(m.t) ? m.t : null; }

  spawnChild() {
    const cfg = this.cfg;
    const env = { ...process.env, BRAIN_STATE_DIR: cfg.stateDir, BRAIN_NAME: cfg.name, BRAIN_EGRESS_GUARD: '1', BRAIN_EGRESS_LIST: JSON.stringify(this.allow), BRAIN_EPISODES_MAX: String(cfg.episodesMax) };
    const execArgv = ['--max-old-space-size=' + cfg.heapMb, ...cfg.nodeFlags];
    const child = fork(SELF, ['--child'], { cwd: ROOT, env, execArgv, stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
    this.starts++;
    this.child = child;
    this.childInfo = { pid: child.pid, startedAt: now(), built: null, resumedAt: null, lastT: null, lastAt: null, rssMb: null, maxRssMb: null, heapUsedMb: null, heapTotalMb: null, externalMb: null, arrayBuffersMb: null, cpuS: null, tps: null };
    const info = this.childInfo;
    child.on('message', (m) => {
      if (!m || typeof m !== 'object') return;
      if (m.type === 'status') {
        if (Number.isFinite(m.t)) { info.lastT = m.t; info.lastAt = now(); }
        if (Number.isFinite(m.tps)) info.tps = m.tps;
        info.rssMb = m.rssMb; info.maxRssMb = m.maxRssMb; info.heapUsedMb = m.heapUsedMb; info.heapTotalMb = m.heapTotalMb ?? null; info.externalMb = m.externalMb ?? null; info.arrayBuffersMb = m.arrayBuffersMb ?? null; info.episodic = m.episodic ?? null; info.knowledge = m.knowledge ?? null; info.fit = m.fit ?? null; info.cpuS = m.cpuS;
        if (m.ledgerPolicy) { info.ledgerPolicy = m.ledgerPolicy; this.ledger.policy = m.ledgerPolicy; }
        if (m.guard) info.guard = m.guard;
        if (m.event === 'start') {
          info.built = m.built; info.resumedAt = m.resumedAt;
          this.say('[serve] daemon ' + (m.built ? 'built' : 'resumed') + ' ' + cfg.name + ' at t=' + m.resumedAt + ' (pid ' + info.pid + ', start ' + this.starts + ', restarts ' + this.restarts + ')');
        }
        const peak = Math.max(m.maxRssMb || 0, m.rssMb || 0);
        if (peak > this.peak.daemonRssMb) this.peak.daemonRssMb = peak;
        // the RSS cap: two samples in a row over it and the daemon is killed, then restarted from its checkpoint
        if (m.rssMb > cfg.rssCapMb) {
          this.overCap++;
          if (this.overCap >= 2 && this.child === child) {
            this.budgetKills++;
            this.lastKillReason = 'BUDGET KILLED rss ' + m.rssMb + ' MB over cap ' + cfg.rssCapMb + ' MB';
            this.say('[serve] ' + this.lastKillReason);
            try { child.kill('SIGKILL'); } catch { /* already gone */ }
          }
        } else this.overCap = 0;
      }
    });
    child.on('exit', (code, signal) => this.onChildExit(child, code, signal));
    child.on('error', (e) => this.say('[serve] daemon error: ' + firstLine(e)));
    return child;
  }

  onChildExit(child, code, signal) {
    if (this.child !== child) return;
    const info = this.childInfo;
    const afterS = Math.round((now() - info.startedAt) / 100) / 10;
    const planned = this.stopping || this.paused;
    const reason = this.lastKillReason || (planned ? (this.stopping ? 'stop' : 'ladder') : 'exit');
    this.lastKillReason = null;
    this.lastExit = { at: iso(), code, signal, afterS, lastT: info.lastT, reason, planned };
    this.child = null;
    if (planned) { this.plannedStops++; this.say('[serve] daemon stopped (' + reason + ') at t=' + info.lastT + ' after ' + afterS + ' s'); this.writeStatus(); if (this._onStopped) this._onStopped(); return; }
    this.restarts++;
    const ck = this.checkpointTick();
    this.say('[serve] daemon exited code=' + code + ' signal=' + signal + ' at t=' + info.lastT + ' after ' + afterS + ' s (' + reason + '); restart ' + this.restarts + ' from checkpoint t=' + ck);
    this.backoffMs = afterS < 10 ? Math.min(60_000, this.backoffMs * 2) : 1000;
    this.writeStatus();
    const t = setTimeout(() => { if (!this.stopping && !this.paused && !this.child) this.spawnChild(); }, this.backoffMs);
    this.timers.push(t);
  }

  async stopChild(timeoutMs = 25_000) {
    const child = this.child;
    if (!child) return;
    const done = new Promise((r) => { this._onStopped = r; });
    try { child.send({ op: 'stop' }); } catch { try { child.kill('SIGTERM'); } catch { /* gone */ } }
    const timer = new Promise((r) => setTimeout(r, timeoutMs).unref());
    await Promise.race([done, timer]);
    if (this.child === child) { this.say('[serve] daemon did not stop in ' + timeoutMs + ' ms: SIGKILL'); try { child.kill('SIGKILL'); } catch { /* gone */ } await Promise.race([done, new Promise((r) => setTimeout(r, 3000).unref())]); }
    this._onStopped = null;
  }

  sample() {
    const self = Math.round(process.memoryUsage().rss / 1048576);
    const selfMax = Math.round((process.resourceUsage().maxRSS || 0) / 1024);
    this.peak.serveRssMb = Math.max(this.peak.serveRssMb, self, selfMax);
    const ledgerFile = path.join(this.brainDir, 'ledger', 'ledger.jsonl');
    const r = rotateLedger(ledgerFile, this.cfg.ledgerBudgetMb * 1048576);
    if (r.rotated) { this.ledger.backstopRotations++; this.say('[serve] ledger backstop rotation ' + this.ledger.backstopRotations + ' at ' + r.size + ' bytes (budget ' + this.cfg.ledgerBudgetMb + ' MB)'); }
    this.writeStatus();
  }

  diskSample() {
    this.stateBytes = dirBytes(this.cfg.stateDir);
    if (this.stateBytes > this.cfg.diskCapMb * 1048576) this.say('[serve] BUDGET disk: state holds ' + this.stateBytes + ' bytes over cap ' + this.cfg.diskCapMb + ' MB (/duplicate is refused while over)');
  }

  beat(remove = false) {
    try { heartbeat(this.cfg.stateDir, this.instanceRecord(), { remove }); } catch (e) { this.say('[serve] instances.json write failed: ' + firstLine(e)); }
  }

  scheduleLadder() {
    if (!this.cfg.ladder) return;
    const at = nextLadderAt(now(), this.cfg.ladderHour);
    this.ladderState.nextAt = at;
    const t = setTimeout(() => { this.runLadder().catch((e) => this.say('[serve] ladder failed: ' + firstLine(e))).finally(() => this.scheduleLadder()); }, Math.max(1000, at - now()));
    this.timers.push(t);
  }

  // The ladder builds its own organisms; under a 512 MB cap it cannot share the container with
  // a live daemon, so the daemon checkpoints and stops, the ladder runs, the daemon resumes.
  async runLadder() {
    if (this.ladderState.running || this.stopping) return;
    this.ladderState.running = true;
    const t0 = now();
    this.say('[serve] ladder: stopping the daemon for bench/ladder.mjs --log');
    this.paused = true;
    await this.stopChild();
    const guardUrl = pathToFileURL(SELF).href;
    const env = { ...process.env, BRAIN_EGRESS_GUARD: '1', BRAIN_EGRESS_LIST: JSON.stringify(this.allow), NODE_OPTIONS: ((process.env.NODE_OPTIONS || '') + ' --import=' + guardUrl).trim() };
    const code = await new Promise((resolve) => {
      const p = spawn(process.execPath, ['--max-old-space-size=' + this.cfg.ladderHeapMb, path.join(ROOT, 'bench', 'ladder.mjs'), '--log'], { cwd: ROOT, env, stdio: ['ignore', 'inherit', 'inherit'] });
      p.on('exit', (c, s) => resolve(c === null ? 'signal ' + s : c));
      p.on('error', (e) => resolve('spawn error ' + firstLine(e)));
    });
    this.ladderState.last = { at: iso(t0), ms: now() - t0, code };
    this.ladderState.running = false;
    this.say('[serve] ladder finished code=' + code + ' in ' + (now() - t0) + ' ms; resuming the daemon');
    this.paused = false;
    if (!this.stopping) this.spawnChild();
    this.writeStatus();
  }

  seedImageFiles() {
    // the image moved bench/verdicts/ladder* under /state (Dockerfile); first boot copies them back
    const seed = this.cfg.imageSeed;
    if (!seed || !existsSync(seed)) return;
    const dest = path.join(this.cfg.stateDir, 'verdicts');
    try {
      mkdirSync(dest, { recursive: true });
      for (const f of ['ladder', 'ladder.json']) {
        const from = path.join(seed, f), to = path.join(dest, f);
        if (existsSync(from) && !existsSync(to)) cpSync(from, to, { recursive: true });
      }
    } catch (e) { this.say('[serve] image seed copy failed: ' + firstLine(e)); }
  }

  async start() {
    const cfg = this.cfg;
    mkdirSync(this.brainDir, { recursive: true });
    this.seedImageFiles();
    installGuard({ env: { ...process.env, BRAIN_EGRESS_LIST: JSON.stringify(this.allow) }, stateDir: cfg.stateDir });
    const { startHealth } = await import('../daemon/health.mjs');
    this.health = await startHealth({ port: cfg.healthPort, host: cfg.healthHost, stateDir: cfg.stateDir, name: cfg.name, diskCapMb: cfg.diskCapMb });
    this.say('[serve] ' + cfg.instance + ' health ' + this.health.url + '/health, state ' + cfg.stateDir + ', brain ' + cfg.name + ' (' + cfg.majors + ' majors, ' + cfg.units + ' units), heap ' + cfg.heapMb + ' MB, episodes max ' + cfg.episodesMax + ', rss cap ' + cfg.rssCapMb + ' MB, ledger ' + cfg.ledger + ' budget ' + cfg.ledgerBudgetMb + ' MB, sampler ' + this.sampler);
    this.say('[serve] egress allowlist: ' + (this.allow.entries.map((e) => e.host + ':' + e.port + ' (' + e.why + ')').join(', ') || 'empty') + (this.allow.route ? '; route ' + this.allow.route.from + ' -> ' + this.allow.route.to : '') + '; venue hosts declared in world/policy.json: ' + this.allow.venueDeclared);
    this.diskSample();
    this.spawnChild();
    this.beat();
    this.writeStatus();
    const every = (ms, fn) => { const t = setInterval(fn, ms); this.timers.push(t); };
    every(cfg.sampleMs, () => this.sample());
    every(30_000, () => this.diskSample());
    every(cfg.instanceEveryMs, () => this.beat());
    every(60_000, () => {
      const c = this.childInfo;
      const k = c && Array.isArray(c.knowledge) ? c.knowledge.map((r) => 'knowledge ' + r.mode + ' ' + r.residentBytes + ' of ' + r.capBytes + ' bytes resident (cap ' + r.capMb + ' MB), evictions ' + r.evictions).join('; ') : 'knowledge none open';
      const ft = c && c.fit ? 'self rounds run ' + c.fit.guard.run + ' pruned ' + c.fit.guard.prune + ' deferred ' + c.fit.guard.defer + ', hold max ' + c.fit.holds.maxMs + ' ms, self-code starts ' + c.fit.selfCode.starts + ' refused ' + c.fit.selfCode.refusals + (c.fit.selfCode.lastRefusal ? ' (' + c.fit.selfCode.lastRefusal.why + ')' : '') : 'fit census none';
      this.say('[serve] up ' + Math.round((now() - this.startedAt) / 1000) + ' s, restarts ' + this.restarts + ', t=' + (c && c.lastT) + ', daemon rss ' + (c && c.rssMb) + ' MB (peak ' + this.peak.daemonRssMb + '), state ' + this.stateBytes + ' bytes; ' + k + '; ' + ft);
    });
    this.scheduleLadder();
    this.writeStatus();
    return this;
  }

  async stop() {
    if (this.stopping) return;
    this.stopping = true;
    for (const t of this.timers) { clearTimeout(t); clearInterval(t); }
    await this.stopChild();
    this.beat(true);
    this.writeStatus();
    if (this.health) { try { await this.health.close(); } catch { /* closed */ } }
    this.say('[serve] stopped after ' + Math.round((now() - this.startedAt) / 1000) + ' s, restarts ' + this.restarts);
  }
}

// ---------------------------------------------------------------- the daemon child
async function runChild() {
  const cfg = config();
  const guard = installGuard({ stateDir: cfg.stateDir });
  // every node process the daemon spawns carries the guard too
  const guardUrl = pathToFileURL(SELF).href;
  if (!String(process.env.NODE_OPTIONS || '').includes(guardUrl)) process.env.NODE_OPTIONS = ((process.env.NODE_OPTIONS || '') + ' --import=' + guardUrl).trim();

  const brainDir = path.join(cfg.stateDir, cfg.name);
  let ledgerPolicy = 'absent: core/ledger.mjs has no setLedgerPolicy; the supervisor rotation is the only bound';
  try {
    const lm = await import('../core/ledger.mjs');
    if (typeof lm.setLedgerPolicy === 'function' && Array.isArray(lm.LEDGER_MODES) && lm.LEDGER_MODES.includes(cfg.ledger)) {
      lm.setLedgerPolicy(path.join(brainDir, 'ledger'), { mode: cfg.ledger, budgetBytes: cfg.ledgerBudgetMb * 1048576 });
      ledgerPolicy = 'core/ledger.mjs setLedgerPolicy mode ' + cfg.ledger + ' budget ' + cfg.ledgerBudgetMb + ' MB';
    } else if (typeof lm.setLedgerPolicy === 'function') ledgerPolicy = 'core/ledger.mjs does not list mode ' + cfg.ledger;
  } catch (e) { ledgerPolicy = 'core/ledger.mjs failed to load: ' + firstLine(e); }

  let lastT = null, lastTps = null;
  // READ-ONLY census of the memory tiers the organism registered (memory/index.mjs): the episodic
  // record is bounded at maxEpisodes keys of d lanes each, and that bound, not the heap, is what
  // decides whether the daemon fits a container. Nothing here writes to a store.
  let memIndex = null;
  import('../memory/index.mjs').then((m) => { memIndex = m; }, () => {});
  const memCensus = () => {
    if (!memIndex || typeof memIndex.listMemorySystems !== 'function') return null;
    const rows = [];
    for (const name of memIndex.listMemorySystems()) {
      try {
        const e = memIndex.getMemorySystem(name).episodic;
        if (e) rows.push({ name, n: e.n, cap: e.cap, max: e.maxEpisodes, d: e.d, keyMb: Math.round((e.keys ? e.keys.byteLength : 0) / 1048576), boundMb: Math.round(e.maxEpisodes * e.d / 1048576), evicted: e.stats ? e.stats.evicted : null });
      } catch { /* a system without an episodic tier */ }
    }
    return rows;
  };
  // Board 13 fit: the knowledge store's resident set against its cap (memory/knowledge.mjs), and
  // the daemon's self-round guard, holds and self-code floor (daemon/run.mjs fitCensus), read-only
  let kMod = null, runMod = null;
  import('../memory/knowledge.mjs').then((m) => { kMod = m; }, () => {});
  import('../daemon/run.mjs').then((m) => { runMod = m; }, () => {});
  const knowledgeCensus = () => {
    if (!kMod || typeof kMod.knowledgeCensus !== 'function') return null;
    try { return kMod.knowledgeCensus().map((c) => ({ mode: c.mode, residentBytes: c.residentBytes, capBytes: c.capBytes, capMb: c.capMb, capFrom: c.capFrom, evictions: c.evictions, reads: c.reads, peakBytes: c.peakBytes, indexBytes: c.indexBytes, trims: c.trims ?? 0 })); } catch { return null; }
  };
  const fitCensus = () => (runMod && typeof runMod.fitCensus === 'function' ? runMod.fitCensus() : null);
  const send = (extra = {}) => {
    if (!process.send || !process.connected) return;
    const mu = process.memoryUsage(), cpu = process.cpuUsage();
    try {
      process.send({ type: 'status', t: lastT, tps: lastTps, rssMb: Math.round(mu.rss / 1048576), maxRssMb: Math.round((process.resourceUsage().maxRSS || 0) / 1024), heapUsedMb: Math.round(mu.heapUsed / 1048576), heapTotalMb: Math.round(mu.heapTotal / 1048576), externalMb: Math.round(mu.external / 1048576), arrayBuffersMb: Math.round(mu.arrayBuffers / 1048576), cpuS: Math.round((cpu.user + cpu.system) / 1e4) / 100, episodic: memCensus(), knowledge: knowledgeCensus(), fit: fitCensus(), ...extra });
    } catch { /* the supervisor is gone */ }
  };
  const out = (line) => {
    const s = String(line);
    const p = /^\[live\] t=(\d+) done=\d+ (\d+(?:\.\d+)?)\/s/.exec(s);
    if (p) { lastT = Number(p[1]); lastTps = Number(p[2]); return; } // progress: parsed, not printed
    const r = /^\[live\] (built|resumed) \S+ in \d+ ms at t=(\d+)/.exec(s);
    if (r) { lastT = Number(r[2]); send({ event: 'start', built: r[1] === 'built', resumedAt: lastT, ledgerPolicy, guard: { entries: guard.allow.entries.length, route: guard.allow.route } }); }
    console.log(s);
  };

  // a stop asked for before live() registered its handlers is delivered once they exist
  let stopWanted = false, stopSent = false;
  const deliverStop = () => { if (stopWanted && !stopSent && process.listenerCount('SIGTERM') > 0) { stopSent = true; process.emit('SIGTERM', 'SIGTERM'); } };
  process.on('message', (m) => { if (m && m.op === 'stop') { stopWanted = true; deliverStop(); } });
  process.on('disconnect', () => { stopWanted = true; deliverStop(); }); // the supervisor died: checkpoint and go
  const iv = setInterval(() => { send(); deliverStop(); }, cfg.sampleMs);

  const { live } = await import('../daemon/run.mjs');
  let code = 0;
  try {
    const p = await live({ name: cfg.name, majors: cfg.majors, substrateUnits: cfg.units, seed: cfg.seed, checkpointEvery: cfg.checkpointEvery, ledger: cfg.ledger, selfEvery: cfg.selfEvery, genEvery: cfg.genEvery, out });
    lastT = p.end ? p.end.t : lastT;
    send({ event: 'end' });
    console.log('[serve child] live ended at t=' + lastT + ' (' + (p.runner && p.runner.reason) + '), ' + p.checkpoints + ' checkpoints');
  } catch (e) {
    code = 1;
    console.error('[serve child] live failed: ' + firstLine(e));
  }
  clearInterval(iv);
  process.exitCode = code;
  setTimeout(() => process.exit(code), 5000).unref();
  try { process.disconnect(); } catch { /* not connected */ }
}

// ---------------------------------------------------------------- entry
async function main(argv) {
  if (argv.includes('--child')) return runChild();
  const sup = new Supervisor(config());
  let stopping = false;
  const stop = async (why) => {
    if (stopping) return;
    stopping = true;
    sup.say('[serve] ' + why + ': checkpointing the daemon and stopping');
    await sup.stop();
    process.exit(0);
  };
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
  if (process.platform === 'win32') process.on('SIGBREAK', () => stop('SIGBREAK'));
  process.on('message', (m) => { if (m && m.op === 'stop') stop('stop message'); });
  // forked with an ipc channel (a bench, a test): when that parent goes, so do we, cleanly
  if (process.connected) process.on('disconnect', () => stop('parent disconnected'));
  await sup.start();
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === SELF;
if (isMain) await main(process.argv.slice(2));
else if (process.env.BRAIN_EGRESS_GUARD === '1') installGuard();
