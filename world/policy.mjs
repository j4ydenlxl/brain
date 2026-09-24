// world/policy.mjs: THE AUTHORITY LAYER OF THE WORLD SUBSYSTEM.
//
// His manual: "The architecture should also maintain a strict distinction between
// computation and authority. The ability of a subsystem to reason about a change does not
// automatically grant it permission to make that change... modifications to core
// architecture, learning rules, external interfaces, or persistent state should pass
// through explicit control mechanisms."
//
// An actuator cell can reason all it likes about a URL, a file or an executable. It cannot
// touch one. Every reach outside the process is a Proposal of kind 'world.act' put to
// core/gate.mjs, and the gate decides with THIS module's policy, which the cell does not
// own and cannot edit. Three properties make that real:
//
//   1. Deny by default. An empty allowlist denies everything. There is no wildcard that
//      means "any host"; a host, a root and an executable must be named.
//   2. The gate re-derives the verdict. The cell attaches its own reading of the policy as
//      evidence, and the gate ignores it and runs authorize() again over proposal.what.
//      A cell that lies about its evidence changes nothing.
//   3. One policy per gate. armWorld(gate, policy) is the only way 'world.act' becomes a
//      kind the gate will even accept; an unarmed gate throws on it, so a brain that was
//      never armed cannot act on the world at all. core/gate.mjs is not edited: its
//      PROPOSAL_KINDS list is frozen and core is not ours to change from here, so the kind
//      is installed on the gate INSTANCE, exactly as self/apply.mjs installs 'self.improve'.
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WORLD_KIND = 'world.act';

// Every operation an actuator or a sense may ask for. An op outside this list is rejected
// before any allowlist is consulted.
export const WORLD_OPS = Object.freeze([
  'http.get', 'http.post',
  'fs.read', 'fs.write', 'fs.append', 'fs.list', 'fs.stat',
  'proc.spawn',
  'clock.read', 'clock.timer',
  'net.listen',
  'sense.poll', 'sense.watch', 'sense.stdin',
  'sense.venue', 'venue.order',
]);

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const POLICY_FILE = path.join(HERE, 'policy.json');
const WIN = process.platform === 'win32';

// ---------------------------------------------------------------- loading
// DENY_ALL is what an unconfigured brain gets: every list empty, so authorize() refuses
// every op for want of an entry. It is a function and not a shared constant so a caller
// cannot mutate the default for everyone else.
export function denyAll() {
  return normalizePolicy({});
}

function num(v, dflt, min = 0) {
  const n = Number(v);
  return Number.isFinite(n) && n >= min ? n : dflt;
}
function list(v) {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim()) : [];
}

/**
 * Fill in every field of a policy, leaving anything unnamed empty (denied).
 * @param {object} raw
 * @returns {object} a normalized policy, safe to read from anywhere
 */
export function normalizePolicy(raw = {}) {
  const h = raw.http || {}, f = raw.fs || {}, p = raw.proc || {}, c = raw.clock || {}, l = raw.listen || {}, s = raw.senses || {}, v = raw.venue || {};
  return {
    version: num(raw.version, 1),
    http: {
      hosts: list(h.hosts),
      methods: (Array.isArray(h.methods) ? h.methods : ['GET', 'POST']).map((m) => String(m).toUpperCase()),
      timeoutMs: num(h.timeoutMs, 5000, 1),
      maxBytes: num(h.maxBytes, 1048576, 1),
      followRedirects: h.followRedirects === true,
      maxHeaderBytes: num(h.maxHeaderBytes, 8192, 1),
    },
    fs: {
      roots: list(f.roots),
      ops: Array.isArray(f.ops) ? f.ops.map(String) : ['read', 'write', 'append', 'list', 'stat'],
      maxBytes: num(f.maxBytes, 1048576, 1),
    },
    proc: {
      exec: list(p.exec),
      timeoutMs: num(p.timeoutMs, 10000, 1),
      maxBytes: num(p.maxBytes, 262144, 1),
      maxArgs: num(p.maxArgs, 32, 0),
      maxArgLength: num(p.maxArgLength, 4096, 1),
    },
    clock: {
      enabled: c.enabled !== false,
      maxTimers: num(c.maxTimers, 64, 0),
      maxAfterMs: num(c.maxAfterMs, 3600000, 1),
    },
    listen: {
      enabled: l.enabled === true,
      host: typeof l.host === 'string' ? l.host : '127.0.0.1',
      port: num(l.port, 0, 0),
      path: typeof l.path === 'string' && l.path.startsWith('/') ? l.path : '/signal',
      maxBytes: num(l.maxBytes, 65536, 1),
      token: typeof l.token === 'string' && l.token.length ? l.token : null,
      queueMax: num(l.queueMax, 256, 1),
    },
    senses: {
      poll: Array.isArray(s.poll) ? s.poll.filter((x) => x && typeof x.url === 'string') : [],
      watch: Array.isArray(s.watch) ? s.watch.filter((x) => x && typeof x.path === 'string') : [],
      stdin: s.stdin === true,
    },
    // The venue: a recorded tape in, PAPER orders out, and nothing else. paper is not a
    // mode among modes, it is the only value this field accepts: anything other than true
    // is refused by authorize(), so a policy file cannot ask for a live order by editing
    // one word. A tape must be named in tapes, an instrument venue in venues, and both
    // lists start empty, which denies everything.
    venue: {
      enabled: v.enabled === true,
      paper: v.paper !== false,
      tapes: list(v.tapes),
      venues: list(v.venues),
      allowSynthetic: v.allowSynthetic === true,
      feeRoundTrip: num(v.feeRoundTrip, 0.0454, 0),
      maxNotional: num(v.maxNotional, 0.02, 0),
      maxReadings: num(v.maxReadings, 1000000, 0),
    },
    requireHuman: list(raw.requireHuman),
    hold: raw.hold === true,
  };
}

/**
 * Load a policy from an object, a path to a JSON file, or the shipped world/policy.json.
 * A missing file is not an error: it means deny everything.
 * @param {object|string|null} src
 */
export function loadPolicy(src = null) {
  if (src && typeof src === 'object') return normalizePolicy(src);
  const file = typeof src === 'string' ? src : POLICY_FILE;
  if (!existsSync(file)) return denyAll();
  try { return normalizePolicy(JSON.parse(readFileSync(file, 'utf8'))); }
  catch (err) { throw new Error('world policy ' + file + ' is not readable JSON: ' + String(err && err.message || err)); }
}

// ---------------------------------------------------------------- allowlist checks
// Each check returns { ok, reason, ... } and never throws: a malformed request is a
// refusal with a reason, which is a ledger event, not an exception inside a tick.

// The same few urls are checked every tick by every world sense and actuator, and URL
// parsing was 2.9 s of a 117.2 s soak profile (2026-09-17), so a verdict is cached per
// policy object (a new policy is a new object; the host list is never edited in place),
// bounded at 4096 urls, and forgotten with the policy.
const HOST_CACHE = new WeakMap();
export function hostAllowed(policy, rawUrl) {
  const key = String(rawUrl);
  let cache = HOST_CACHE.get(policy);
  if (!cache) { cache = new Map(); HOST_CACHE.set(policy, cache); }
  const hit = cache.get(key);
  if (hit) return hit;
  const r = hostVerdict(policy, key);
  if (cache.size >= 4096) cache.clear();
  cache.set(key, r);
  return r;
}
function hostVerdict(policy, rawUrl) {
  let u;
  try { u = new URL(rawUrl); }
  catch { return { ok: false, reason: 'not a url: ' + String(rawUrl).slice(0, 120) }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false, reason: 'protocol ' + u.protocol + ' is not http or https', host: u.host };
  if (u.username || u.password) return { ok: false, reason: 'credentials in the url are refused', host: u.host };
  const host = u.host.toLowerCase(), name = u.hostname.toLowerCase();
  for (const raw of policy.http.hosts) {
    const e = raw.toLowerCase();
    if (e === host || e === name) return { ok: true, host, hostname: name, entry: e, url: u.toString() };
    if (e.startsWith('*.') && (name === e.slice(2) || name.endsWith(e.slice(1)))) return { ok: true, host, hostname: name, entry: e, url: u.toString() };
  }
  return { ok: false, reason: 'host ' + host + ' is not on the allowlist (' + (policy.http.hosts.length || 'no') + ' entries)', host, hostname: name };
}

// The real path of the nearest existing ancestor, with the not-yet-existing remainder
// appended. A write to a file that does not exist yet still cannot escape its root through
// a symlinked parent, because the parent is what gets resolved.
function resolveReal(target) {
  const abs = path.resolve(target);
  let cur = abs, rest = '';
  for (;;) {
    try {
      const real = realpathSync(cur);
      return rest ? path.join(real, rest) : real;
    } catch {
      const up = path.dirname(cur);
      if (up === cur) return abs;
      rest = rest ? path.join(path.basename(cur), rest) : path.basename(cur);
      cur = up;
    }
  }
}
function sameOrInside(root, target) {
  const r = WIN ? root.toLowerCase() : root, t = WIN ? target.toLowerCase() : target;
  return t === r || t.startsWith(r.endsWith(path.sep) ? r : r + path.sep);
}

export function pathAllowed(policy, rawPath) {
  const given = String(rawPath ?? '');
  if (!given) return { ok: false, reason: 'no path given' };
  if (given.includes('\0')) return { ok: false, reason: 'path contains a null byte' };
  const resolved = resolveReal(given);
  for (const root of policy.fs.roots) {
    const realRoot = resolveReal(root);
    if (sameOrInside(realRoot, resolved)) return { ok: true, resolved, root: realRoot, entry: root };
  }
  return { ok: false, reason: 'path is outside every allowed root (' + (policy.fs.roots.length || 'no') + ' roots)', resolved };
}

export function execAllowed(policy, rawExec) {
  const want = String(rawExec ?? '');
  if (!want) return { ok: false, reason: 'no executable given' };
  if (want.includes('\0')) return { ok: false, reason: 'executable contains a null byte' };
  const wantIsPath = want.includes('/') || want.includes('\\');
  const wantReal = wantIsPath ? resolveReal(want) : null;
  for (const entry of policy.proc.exec) {
    const entryIsPath = entry.includes('/') || entry.includes('\\');
    if (!wantIsPath && !entryIsPath) {
      if (WIN ? entry.toLowerCase() === want.toLowerCase() : entry === want) return { ok: true, resolved: want, entry };
      continue;
    }
    if (wantIsPath && entryIsPath) {
      const entryReal = resolveReal(entry);
      if (WIN ? entryReal.toLowerCase() === wantReal.toLowerCase() : entryReal === wantReal) return { ok: true, resolved: wantReal, entry };
    }
  }
  return { ok: false, reason: 'executable ' + want + ' is not on the allowlist (' + (policy.proc.exec.length || 'no') + ' entries)', resolved: wantReal || want };
}

export function isLoopback(host) {
  const h = String(host || '').toLowerCase().replace(/^\[|\]$/g, '');
  return h === '127.0.0.1' || h === '::1' || h === 'localhost' || h.startsWith('127.');
}

/**
 * The one function that decides whether a described action is inside the declared reach.
 * Pure over (policy, what): the gate runs it, and so may a cell, and they must agree.
 * @param {object} policy a normalized policy
 * @param {object} what   { op, ... } exactly as it is written into the proposal
 * @returns {{ok: boolean, reason?: string}} plus the resolved target when it is allowed
 */
export function authorize(policy, what) {
  if (!what || typeof what !== 'object') return { ok: false, reason: 'proposal has no what' };
  const op = String(what.op || '');
  if (!WORLD_OPS.includes(op)) return { ok: false, reason: 'unknown world op ' + (op || '(none)') };
  switch (op) {
    case 'http.get': case 'http.post': {
      const method = op === 'http.get' ? 'GET' : 'POST';
      if (!policy.http.methods.includes(method)) return { ok: false, reason: 'method ' + method + ' is not allowed by the policy' };
      const h = hostAllowed(policy, what.url);
      if (!h.ok) return h;
      if (op === 'http.post' && typeof what.bytes === 'number' && what.bytes > policy.http.maxBytes) return { ok: false, reason: 'request body ' + what.bytes + ' bytes is over the cap ' + policy.http.maxBytes };
      return { ok: true, op, host: h.host, url: h.url, entry: h.entry };
    }
    case 'fs.read': case 'fs.write': case 'fs.append': case 'fs.list': case 'fs.stat': {
      const short = op.slice(3);
      if (!policy.fs.ops.includes(short)) return { ok: false, reason: 'fs op ' + short + ' is not allowed by the policy' };
      const r = pathAllowed(policy, what.path);
      if (!r.ok) return r;
      if ((op === 'fs.write' || op === 'fs.append') && typeof what.bytes === 'number' && what.bytes > policy.fs.maxBytes) return { ok: false, reason: 'write of ' + what.bytes + ' bytes is over the cap ' + policy.fs.maxBytes };
      return { ok: true, op, resolved: r.resolved, root: r.root, entry: r.entry };
    }
    case 'proc.spawn': {
      const e = execAllowed(policy, what.exec);
      if (!e.ok) return e;
      const args = Array.isArray(what.args) ? what.args : [];
      if (args.length > policy.proc.maxArgs) return { ok: false, reason: args.length + ' args is over the cap ' + policy.proc.maxArgs };
      for (const a of args) {
        if (typeof a !== 'string') return { ok: false, reason: 'every arg must be a string' };
        if (a.length > policy.proc.maxArgLength) return { ok: false, reason: 'an arg of ' + a.length + ' chars is over the cap ' + policy.proc.maxArgLength };
        if (a.includes('\0')) return { ok: false, reason: 'an arg contains a null byte' };
      }
      if (what.cwd != null) {
        const r = pathAllowed(policy, what.cwd);
        if (!r.ok) return { ok: false, reason: 'cwd: ' + r.reason };
      }
      return { ok: true, op, resolved: e.resolved, entry: e.entry, args: args.length };
    }
    case 'clock.read':
      return policy.clock.enabled ? { ok: true, op } : { ok: false, reason: 'the clock is not enabled by the policy' };
    case 'clock.timer': {
      if (!policy.clock.enabled) return { ok: false, reason: 'the clock is not enabled by the policy' };
      const after = Number(what.afterMs);
      if (!Number.isFinite(after) || after < 0) return { ok: false, reason: 'afterMs must be a non negative number' };
      if (after > policy.clock.maxAfterMs) return { ok: false, reason: 'afterMs ' + after + ' is over the cap ' + policy.clock.maxAfterMs };
      if (typeof what.armed === 'number' && what.armed >= policy.clock.maxTimers) return { ok: false, reason: 'already holding ' + what.armed + ' timers, cap is ' + policy.clock.maxTimers };
      return { ok: true, op };
    }
    case 'net.listen': {
      if (!policy.listen.enabled) return { ok: false, reason: 'listening is not enabled by the policy' };
      const host = what.host || policy.listen.host;
      if (!isLoopback(host)) return { ok: false, reason: 'listen host ' + host + ' is not loopback' };
      const port = Number(what.port ?? policy.listen.port);
      if (!Number.isInteger(port) || port < 0 || port > 65535) return { ok: false, reason: 'listen port ' + what.port + ' is not a port' };
      if (policy.listen.port !== 0 && port !== policy.listen.port) return { ok: false, reason: 'the policy declares port ' + policy.listen.port + ', not ' + port };
      return { ok: true, op, host, port };
    }
    case 'sense.poll': {
      const h = hostAllowed(policy, what.url);
      if (!h.ok) return h;
      const period = Number(what.periodMs);
      if (!Number.isFinite(period) || period <= 0) return { ok: false, reason: 'a poll sense must declare a positive periodMs' };
      return { ok: true, op, host: h.host, url: h.url, periodMs: period };
    }
    case 'sense.watch': {
      const r = pathAllowed(policy, what.path);
      return r.ok ? { ok: true, op, resolved: r.resolved, root: r.root } : r;
    }
    case 'sense.stdin':
      return policy.senses.stdin ? { ok: true, op } : { ok: false, reason: 'stdin is not enabled by the policy' };
    case 'sense.venue': {
      if (!policy.venue.enabled) return { ok: false, reason: 'the venue is not enabled by the policy' };
      const readings = Number(what.readings);
      if (!Number.isFinite(readings) || readings <= 0) return { ok: false, reason: 'a venue replay must declare a positive readings count' };
      if (readings > policy.venue.maxReadings) return { ok: false, reason: 'a replay of ' + readings + ' readings is over the cap ' + policy.venue.maxReadings };
      const tape = String(what.tape ?? '');
      if (tape === 'synthetic') {
        return policy.venue.allowSynthetic
          ? { ok: true, op, tape, readings }
          : { ok: false, reason: 'a synthetic tape is not enabled by the policy: a rate measured on a generator is not a measurement of a market' };
      }
      const wanted = resolveReal(tape);
      for (const entry of policy.venue.tapes) {
        if (sameOrInside(resolveReal(entry), wanted)) return { ok: true, op, tape: wanted, entry, readings };
      }
      return { ok: false, reason: 'tape ' + tape + ' is not on the allowlist (' + (policy.venue.tapes.length || 'no') + ' entries)', resolved: wanted };
    }
    case 'venue.order': {
      if (!policy.venue.enabled) return { ok: false, reason: 'the venue is not enabled by the policy' };
      // The one line that keeps this whole subsystem paper. A proposal that does not say
      // paper is refused, and so is a policy that tried to turn paper off.
      if (what.paper !== true) return { ok: false, reason: 'only PAPER orders exist here: an order that does not declare paper is refused' };
      if (policy.venue.paper !== true) return { ok: false, reason: 'the policy turned paper off, and there is no other mode: every order is refused' };
      const side = String(what.side || '');
      if (side !== 'buy' && side !== 'sell') return { ok: false, reason: 'side must be buy or sell, got ' + (side || '(none)') };
      const notional = Number(what.notional);
      if (!Number.isFinite(notional) || notional <= 0) return { ok: false, reason: 'an order needs a positive notional' };
      if (notional > policy.venue.maxNotional) return { ok: false, reason: 'a notional of ' + notional + ' is over the cap ' + policy.venue.maxNotional };
      const venue = String(what.venue || '');
      if (!policy.venue.venues.includes(venue)) return { ok: false, reason: 'venue ' + (venue || '(none)') + ' is not on the allowlist (' + (policy.venue.venues.length || 'no') + ' entries)' };
      if (!String(what.instrument || '')) return { ok: false, reason: 'an order needs an instrument' };
      return { ok: true, op, venue, side, notional, paper: true };
    }
    default:
      return { ok: false, reason: 'unhandled world op ' + op };
  }
}

// ---------------------------------------------------------------- the gate
/**
 * The decision function the gate runs for every 'world.act' proposal. It never reads
 * proposal.evidence: evidence is what the proposer claims, and a claim is not authority.
 * @param {object} policy
 */
export function worldDecision(policy) {
  return function decide(proposal) {
    const check = authorize(policy, proposal.what);
    if (!check.ok) return 'reject';
    if (policy.requireHuman.includes(proposal.what.op)) return 'hold';
    return policy.hold ? 'hold' : 'approve';
  };
}

/**
 * Teach one gate instance the 'world.act' kind. Idempotent. Mirrors self/apply.mjs arm():
 * the gate keeps its own accounting, ledger events, pending queue and human-hold set.
 * @param {import('../core/gate.mjs').Gate} gate
 * @param {object|string|null} policySrc object, path, or null for world/policy.json
 */
export function armWorld(gate, policySrc = null) {
  const policy = policySrc && policySrc.__normalized ? policySrc : Object.assign(loadPolicy(policySrc), { __normalized: true });
  if (gate._worldArmed) { gate._worldPolicy = policy; gate._worldDecide = worldDecision(policy); return gate; }
  const decide = worldDecision(policy);
  const base = gate.propose.bind(gate);
  gate.propose = function (p, ctx = {}) {
    if (p.kind !== WORLD_KIND) return base(p, ctx);
    const id = this.nextId++;
    const proposal = {
      id, kind: WORLD_KIND, what: p.what, why: p.why || '', evidence: p.evidence || {},
      by: p.by || 'world', t: ctx.t ?? 0, gen: ctx.gen ?? 0, status: 'pending',
    };
    this.stats.proposed++;
    proposal.seq = this.ledger?.append({ type: 'proposal', ...proposal });
    const verdict = this.humanRequired.has(WORLD_KIND) ? 'hold' : this._worldDecide(proposal, ctx);
    if (verdict === 'approve') return this._decide(proposal, 'approved', 'policy', ctx);
    if (verdict === 'reject') return this._decide(proposal, 'rejected', 'policy', ctx);
    this.stats.held++;
    this.pending.set(id, proposal);
    return proposal;
  };
  gate._worldArmed = true;
  gate._worldPolicy = policy;
  gate._worldDecide = decide;
  return gate;
}
export function isArmed(gate) { return !!(gate && gate._worldArmed); }
export function armedPolicy(gate) { return (gate && gate._worldPolicy) || null; }

// A cell may TIGHTEN a numeric cap, never widen it. The authority is the armed policy.
export function tighten(limit, want) {
  const n = Number(want);
  return Number.isFinite(n) && n > 0 && n < limit ? n : limit;
}
