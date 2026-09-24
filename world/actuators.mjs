// world/actuators.mjs: THE HANDS. Cell kinds that reach outside the process.
//
// "what if you didnt require a browser for it to do EVERYTHING in the internet" (his words).
// The answer here is not a browser: it is five primitives that cover the reachable world
// (a socket, a file, a process, a clock, a listening port) wired into the same connectome
// as every other cell, so the organism acts through its own anatomy rather than through a
// tool call bolted on the side.
//
// THE RULE THAT BINDS ALL OF THEM: before anything leaves this process, the cell files a
// Proposal of kind 'world.act' to core/gate.mjs carrying WHAT it wants to do, WHY, and the
// EVIDENCE it read the policy by. It acts only if the gate answers 'approved'. The gate
// judges with world/policy.mjs, which the cell does not own. Then the outcome is logged
// with `from` pointing at the act, and the act's `from` points at the signal that caused
// it, so world/trace.mjs walks an effect in the world all the way back to the cell run and
// the signal that produced it.
//
// compute() stays synchronous, like every other cell kind in this codebase: asynchronous
// work (fetch, spawn, timers, sockets) is kicked off once, its result lands on a plain
// queue in cell.state, and each run drains one item. Synchronous work (the filesystem) is
// pushed onto the same queue and drained in the same run, so an fs answer needs no extra
// tick. Nothing here can throw into a tick: a refusal is a value on the error port.
import { spawn } from 'node:child_process';
import http from 'node:http';
import { appendFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defineKind } from '../core/cell.mjs';
import { parse } from '../lang/parse.mjs';
import { WORLD_KIND, armedPolicy, authorize, isArmed, tighten } from './policy.mjs';

export const ACTUATOR_KINDS = Object.freeze(['world.http', 'world.fs', 'world.proc', 'world.clock', 'world.net.listen', 'world.relay']);

// ---------------------------------------------------------------- live handles
// Same discipline as io/sources.mjs: cell.state stays plain serializable data (queues,
// counters, addresses); anything holding an OS resource (a server, a timer, a child
// process) lives off to the side in a WeakMap keyed by the cell object, so nothing about a
// live handle can ever be mistaken for state worth snapshotting.
const HANDLES = new WeakMap();
export function retain(cell, closer) {
  let l = HANDLES.get(cell);
  if (!l) { l = []; HANDLES.set(cell, l); }
  l.push(closer);
  return closer;
}
export function release(cell, closer) {
  const l = HANDLES.get(cell);
  if (!l) return false;
  const i = l.indexOf(closer);
  if (i < 0) return false;
  l.splice(i, 1);
  return true;
}
/** Close every OS resource this cell holds. Safe to call on any cell, of any kind. */
export function closeWorldCell(cell) {
  const l = HANDLES.get(cell);
  if (!l) return 0;
  let n = 0;
  for (const close of l) { try { close(); n++; } catch { /* already gone */ } }
  HANDLES.delete(cell);
  return n;
}
export function handleCount(cell) { return (HANDLES.get(cell) || []).length; }

// ---------------------------------------------------------------- the gate call
const seqOrNull = (s) => (typeof s === 'number' && s >= 0 ? s : null);

/**
 * File one 'world.act' proposal and report what the gate said. This is the only door.
 * @param {object} cell  the proposing cell
 * @param {object} ctx   the brain ctx (must carry ctx.brain, or there is no authority)
 * @param {object|null} sig the signal that asked for this action, for the trace back
 * @param {object} what  { op, ... } the described action
 * @param {string} why   one line, in prose, that a human reads in the pending queue
 * @returns {{approved: boolean, status: string, reason: string|null, seq: number|null, policy: object|null, proposal: object|null}}
 */
export function propose(cell, ctx, sig, what, why) {
  const brain = ctx && ctx.brain;
  if (!brain || !brain.gate) {
    return { approved: false, status: 'refused', reason: 'no gate in this context: a cell with no authority never acts', seq: null, policy: null, proposal: null };
  }
  if (!isArmed(brain.gate)) {
    return { approved: false, status: 'refused', reason: 'this gate was never armed for ' + WORLD_KIND + ': call armWorld(brain.gate, policy) first', seq: null, policy: null, proposal: null };
  }
  const policy = armedPolicy(brain.gate);
  const evidence = authorize(policy, what); // the cell's own reading, offered, never trusted
  const from = sig ? seqOrNull(sig.seq) : null;
  let proposal;
  try {
    proposal = brain.gate.propose({
      kind: WORLD_KIND, what, why, by: cell.id,
      evidence: { ...evidence, cell: cell.id, kind: cell.kind, region: cell.region, circuit: cell.circuit, signal: from },
    }, ctx);
  } catch (err) {
    return { approved: false, status: 'refused', reason: 'gate refused the proposal: ' + String(err && err.message || err), seq: null, policy, proposal: null };
  }
  const actSeq = brain.log({
    type: 'world.act', from, cell: cell.id, op: what.op, what, why,
    proposal: proposal.id, proposalSeq: seqOrNull(proposal.seq), status: proposal.status,
    allowed: evidence.ok === true, reason: evidence.ok ? null : (evidence.reason || null),
  });
  if (proposal.status !== 'approved') {
    const reason = evidence.ok ? ('the gate answered ' + proposal.status) : (evidence.reason || 'denied by policy');
    brain.log({ type: 'world.refused', from: seqOrNull(actSeq), cell: cell.id, op: what.op, status: proposal.status, reason });
    return { approved: false, status: proposal.status, reason, seq: seqOrNull(actSeq), policy, proposal };
  }
  return { approved: true, status: 'approved', reason: null, seq: seqOrNull(actSeq), policy, proposal };
}

/** Record how an approved act turned out, linked back to the act. */
export function outcome(ctx, actSeq, fields) {
  const brain = ctx && ctx.brain;
  if (!brain) return null;
  return seqOrNull(brain.log({ type: 'world.outcome', from: seqOrNull(actSeq), ...fields }));
}

// A queue that forgets its oldest item rather than growing without bound.
export function push(st, item, max) {
  st.queue.push(item);
  while (st.queue.length > max) { st.queue.shift(); st.dropped++; }
}
const sigsOf = (mail) => mail.map((it) => it.sig);
const errEvent = (data) => ({ kind: 'event', data });

// ---------------------------------------------------------------- world.relay
// The conduit cell. attachWorld puts one in perception and one in motor so the world
// region has a named, inspectable border with the rest of the organism instead of a
// tangle of direct edges into whichever cell happened to accept an event.
// A cell may emit at most one signal per out port per run (core/cell.mjs), and several
// actuators can answer into the border on the same tick, so the border QUEUES what arrives
// and passes one along per run. Keeping only the last would silently drop a refusal on a
// tick where anything else also spoke, which is exactly the event nobody can afford to
// lose. That is why the border runs on the clock and not on 'event'.
defineKind('world.relay', {
  doc: 'Queues every event that crosses the border and passes one along per run, counting what crossed. The named border between the world region and the rest of the organism.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { keep: 16, queueMax: 256 },
  init: () => ({ queue: [], passed: 0, dropped: 0 }),
  compute: (ins, cell) => {
    const st = cell.state;
    for (const sig of sigsOf(ins[0])) {
      push(st, sig.data, cell.params.queueMax);
      cell.memory.working.push({ t: sig.t, kind: sig.kind });
      if (cell.memory.working.length > cell.params.keep) cell.memory.working.shift();
    }
    if (!st.queue.length) return [null];
    st.passed++;
    return [{ kind: 'event', data: st.queue.shift() }];
  },
  cost: 1,
});

// ---------------------------------------------------------------- world.http
// Request event: { url, method, body, headers, as }. Anything absent falls back to params.
// The response leaves as an event (status, headers, body, json), a sym expression (the
// body parsed by lang/parse.mjs, so a fetched formula is computable by the cognitive
// region), or a vec (every number in the body, for the numeric cells).
defineKind('world.http', {
  doc: 'GET or POST an allowlisted URL with the global fetch, under a timeout and a byte cap, and emit the response as an event, a sym expression or a vec. Every request is a world.act proposal first; a denied host never opens a socket.',
  ports: {
    in: [{ name: 'req', kinds: ['event'] }],
    out: [{ name: 'out', kinds: ['event', 'sym', 'vec'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { url: null, method: 'GET', headers: null, as: 'event', timeoutMs: null, maxBytes: null, queueMax: 32 },
  init: () => ({ queue: [], inflight: 0, sent: 0, failed: 0, refused: 0, dropped: 0, lastTrace: null }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    for (const sig of sigsOf(ins[0])) {
      const r = sig.data || {};
      const url = r.url || p.url;
      const method = String(r.method || p.method || 'GET').toUpperCase();
      const as = r.as || p.as || 'event';
      const body = r.body === undefined ? null : r.body;
      const payload = body == null ? null : (typeof body === 'string' ? body : JSON.stringify(body));
      const op = method === 'POST' ? 'http.post' : 'http.get';
      const what = { op, url: String(url ?? ''), method, bytes: payload ? Buffer.byteLength(payload) : 0, as };
      const why = method + ' ' + String(url ?? '(no url)') + ' asked for by ' + cell.id;
      const g = propose(cell, ctx, sig, what, why);
      if (!g.approved) {
        st.refused++;
        push(st, { error: true, url: what.url, op, status: g.status, reason: g.reason, act: g.seq }, p.queueMax);
        continue;
      }
      st.inflight++;
      fetchOnce(cell, ctx, g, what, payload, r.headers || p.headers, as);
    }
    return drain(cell, st);
  },
  serialize: dropQueue,
  cost: 2,
});

// A result waiting in a queue is a payload of the outside world: a sym tree carrying
// BigInt rationals, a Float32Array, a megabyte of text. None of that belongs in a
// snapshot, and a BigInt would make JSON.stringify throw, so a snapshot records how many
// results were in flight and drops them. The act and the outcome are already in the
// ledger, which is where the history of a reach into the world is supposed to live.
function dropQueue(s) { return { ...s, queue: [], queuedAtSnapshot: s.queue.length }; }

export function drain(cell, st) {
  if (!st.queue.length) return [null, null];
  const item = st.queue.shift();
  if (item.error) return [null, errEvent({ url: item.url || null, op: item.op || null, status: item.status ?? null, reason: item.reason || null, message: item.message || null, act: item.act ?? null, outcome: item.outcome ?? null })];
  st.lastTrace = { act: item.act ?? null, outcome: item.outcome ?? null };
  return [item.out, null];
}

function headersOf(res, cap) {
  const out = {};
  let bytes = 0;
  for (const [k, v] of res.headers) {
    bytes += k.length + String(v).length;
    if (bytes > cap) break;
    out[k] = v;
  }
  return out;
}

// Everything asynchronous about world.http. Never awaited by compute; its only effect on
// the cell is a queue push and a counter.
export function fetchOnce(cell, ctx, g, what, payload, headers, as) {
  const st = cell.state, p = cell.params, policy = g.policy;
  const timeoutMs = tighten(policy.http.timeoutMs, p.timeoutMs);
  const maxBytes = tighten(policy.http.maxBytes, p.maxBytes);
  const started = Date.now();
  const fail = (fields) => {
    st.inflight--; st.failed++;
    const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: what.op, ok: false, url: what.url, ms: Date.now() - started, ...fields });
    push(st, { error: true, url: what.url, op: what.op, status: fields.status ?? null, reason: fields.reason || 'request failed', message: fields.message || null, act: g.seq, outcome: outSeq }, p.queueMax);
  };
  let ac = null, timer = null;
  try { ac = new AbortController(); } catch { ac = null; }
  if (ac) timer = setTimeout(() => { try { ac.abort(); } catch { /* already settled */ } }, timeoutMs);
  const init = {
    method: what.method,
    headers: { ...(headers || {}), ...(payload != null ? { 'content-type': 'application/json' } : {}) },
    redirect: policy.http.followRedirects ? 'follow' : 'error',
    signal: ac ? ac.signal : undefined,
  };
  if (payload != null) init.body = payload;
  let promise;
  try { promise = fetch(what.url, init); }
  catch (err) { if (timer) clearTimeout(timer); fail({ reason: 'fetch threw', message: String(err && err.message || err) }); return; }
  promise.then(async (res) => {
    let received = 0, capped = false;
    const chunks = [];
    const reader = res.body ? res.body.getReader() : null;
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      if (received > maxBytes) { capped = true; try { await reader.cancel(); } catch { /* already closed */ } break; }
      chunks.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
    }
    const text = chunks.length ? Buffer.concat(chunks).toString('utf8') : '';
    const ms = Date.now() - started;
    if (timer) clearTimeout(timer);
    if (!res.ok) {
      st.inflight--; st.failed++;
      const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: what.op, ok: false, url: what.url, status: res.status, bytes: received, ms, reason: 'status ' + res.status });
      push(st, { error: true, url: what.url, op: what.op, status: res.status, reason: 'status ' + res.status, act: g.seq, outcome: outSeq }, p.queueMax);
      return;
    }
    let out, shapeError = null;
    try { out = shape(as, text, { url: what.url, status: res.status, ms, bytes: received, capped, headers: headersOf(res, policy.http.maxHeaderBytes) }, g.seq); }
    catch (err) { shapeError = String(err && err.message || err); }
    st.inflight--;
    if (shapeError != null) {
      st.failed++;
      const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: what.op, ok: false, url: what.url, status: res.status, bytes: received, ms, reason: 'as ' + as + ' could not shape the body', message: shapeError });
      push(st, { error: true, url: what.url, op: what.op, status: res.status, reason: 'as ' + as + ' could not shape the body', message: shapeError, act: g.seq, outcome: outSeq }, p.queueMax);
      return;
    }
    st.sent++;
    const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: what.op, ok: true, url: what.url, status: res.status, bytes: received, capped, ms, as });
    if (as === 'event') out.data.trace = { act: g.seq, outcome: outSeq };
    push(st, { error: false, out, act: g.seq, outcome: outSeq }, p.queueMax);
  }).catch((err) => {
    if (timer) clearTimeout(timer);
    const aborted = err && (err.name === 'AbortError' || err.name === 'TimeoutError');
    fail({ reason: aborted ? 'timed out after ' + timeoutMs + 'ms' : 'network error', message: String(err && err.message || err), timeout: !!aborted });
  });
}

// The three shapes a response may take on the way in.
function shape(as, text, meta, actSeq) {
  if (as === 'sym') return { kind: 'sym', data: parse(text.trim()) };
  if (as === 'vec') {
    const nums = [];
    let json = null;
    try { json = JSON.parse(text); } catch { json = null; }
    if (Array.isArray(json)) for (const x of json) { const n = Number(x); if (Number.isFinite(n)) nums.push(n); }
    if (!nums.length) for (const m of text.matchAll(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)) nums.push(Number(m[0]));
    if (!nums.length) throw new Error('no numbers in a body of ' + text.length + ' chars');
    return { kind: 'vec', data: Float32Array.from(nums) };
  }
  if (as !== 'event') throw new Error('unknown shape ' + as + ' (event, sym or vec)');
  let json = null;
  try { json = JSON.parse(text); } catch { json = null; }
  return { kind: 'event', data: { ...meta, body: text, json, act: actSeq } };
}

// ---------------------------------------------------------------- world.fs
// Request event: { op: 'read'|'write'|'append'|'list'|'stat', path, data, encoding }.
// Synchronous on purpose: the answer is pushed and drained inside the same run, so a file
// read costs one tick and not two. The root allowlist is checked by the gate against the
// REAL path (symlinks resolved), so a link inside a root cannot point out of it.
defineKind('world.fs', {
  doc: 'Read, write, append, list or stat a path under an allowlisted root. A path outside every root is refused by the gate and never touched.',
  ports: {
    in: [{ name: 'req', kinds: ['event'] }],
    out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { root: null, op: 'read', encoding: 'utf8', maxBytes: null, queueMax: 32, mkdir: true },
  init: () => ({ queue: [], reads: 0, writes: 0, refused: 0, dropped: 0, lastTrace: null }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    for (const sig of sigsOf(ins[0])) {
      const r = sig.data || {};
      const op = 'fs.' + String(r.op || p.op || 'read');
      const target = r.path != null ? (p.root ? path.resolve(p.root, String(r.path)) : String(r.path)) : (p.root || '');
      const data = r.data == null ? null : (typeof r.data === 'string' ? r.data : JSON.stringify(r.data));
      const what = { op, path: target, bytes: data ? Buffer.byteLength(data) : 0 };
      const why = (r.op || p.op || 'read') + ' ' + target + ' asked for by ' + cell.id;
      const g = propose(cell, ctx, sig, what, why);
      if (!g.approved) {
        st.refused++;
        push(st, { error: true, op, path: target, status: g.status, reason: g.reason, act: g.seq }, p.queueMax);
        continue;
      }
      const started = Date.now();
      try {
        const res = doFs(op, target, data, cell, g.policy, r);
        if (op === 'fs.write' || op === 'fs.append') st.writes++; else st.reads++;
        const outSeq = outcome(ctx, g.seq, { cell: cell.id, op, ok: true, path: target, bytes: res.bytes ?? 0, ms: Date.now() - started });
        push(st, { error: false, out: { kind: 'event', data: { ...res, op, path: target, trace: { act: g.seq, outcome: outSeq } } }, act: g.seq, outcome: outSeq }, p.queueMax);
      } catch (err) {
        const message = String(err && err.message || err);
        const outSeq = outcome(ctx, g.seq, { cell: cell.id, op, ok: false, path: target, ms: Date.now() - started, reason: 'the filesystem refused', message });
        push(st, { error: true, op, path: target, reason: 'the filesystem refused', message, act: g.seq, outcome: outSeq }, p.queueMax);
      }
    }
    return drain(cell, st);
  },
  serialize: dropQueue,
  cost: 2,
});

function doFs(op, target, data, cell, policy, req) {
  const cap = tighten(policy.fs.maxBytes, cell.params.maxBytes);
  const encoding = req.encoding || cell.params.encoding || 'utf8';
  switch (op) {
    case 'fs.read': {
      const st = statSync(target);
      if (st.size > cap) throw new Error('file is ' + st.size + ' bytes, over the cap ' + cap);
      const buf = readFileSync(target);
      return { ok: true, bytes: buf.length, data: encoding === 'base64' ? buf.toString('base64') : buf.toString('utf8'), encoding };
    }
    case 'fs.write': case 'fs.append': {
      if (data == null) throw new Error('a write needs data');
      const bytes = Buffer.byteLength(data);
      if (bytes > cap) throw new Error('write of ' + bytes + ' bytes is over the cap ' + cap);
      if (cell.params.mkdir) mkdirSync(path.dirname(target), { recursive: true });
      if (op === 'fs.append') appendFileSync(target, data); else writeFileSync(target, data);
      return { ok: true, bytes };
    }
    case 'fs.list': {
      const names = readdirSync(target, { withFileTypes: true }).map((d) => ({ name: d.name, dir: d.isDirectory() }));
      return { ok: true, entries: names, count: names.length, bytes: 0 };
    }
    case 'fs.stat': {
      const s = statSync(target);
      return { ok: true, size: s.size, dir: s.isDirectory(), file: s.isFile(), mtimeMs: s.mtimeMs, bytes: 0 };
    }
    default: throw new Error('unknown fs op ' + op);
  }
}

// ---------------------------------------------------------------- world.proc
// Request event: { exec, args, stdin, cwd, timeoutMs }. Never a shell: spawn is called
// with shell false, so an argument cannot become a command. Only an allowlisted
// executable runs, compared by real path when the request names a path.
defineKind('world.proc', {
  doc: 'Spawn an allowlisted executable with args and capture stdout, stderr and the exit code. No shell, ever: args are passed as an array.',
  ports: {
    in: [{ name: 'req', kinds: ['event'] }],
    out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { exec: null, args: null, cwd: null, timeoutMs: null, maxBytes: null, queueMax: 16 },
  init: () => ({ queue: [], running: 0, ran: 0, refused: 0, dropped: 0, lastTrace: null }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    for (const sig of sigsOf(ins[0])) {
      const r = sig.data || {};
      const exec = r.exec || p.exec;
      const args = (Array.isArray(r.args) ? r.args : (Array.isArray(p.args) ? p.args : [])).map(String);
      const cwd = r.cwd || p.cwd || null;
      const what = { op: 'proc.spawn', exec: String(exec ?? ''), args, cwd };
      const why = 'run ' + String(exec ?? '(none)') + ' with ' + args.length + ' args, asked for by ' + cell.id;
      const g = propose(cell, ctx, sig, what, why);
      if (!g.approved) {
        st.refused++;
        push(st, { error: true, op: 'proc.spawn', exec: what.exec, status: g.status, reason: g.reason, act: g.seq }, p.queueMax);
        continue;
      }
      st.running++;
      spawnOnce(cell, ctx, g, what, r.stdin == null ? null : String(r.stdin));
    }
    return drain(cell, st);
  },
  serialize: dropQueue,
  cost: 4,
});

function spawnOnce(cell, ctx, g, what, stdin) {
  const st = cell.state, p = cell.params, policy = g.policy;
  const timeoutMs = tighten(policy.proc.timeoutMs, p.timeoutMs);
  const maxBytes = tighten(policy.proc.maxBytes, p.maxBytes);
  const started = Date.now();
  let child;
  try {
    child = spawn(what.exec, what.args, { cwd: what.cwd || undefined, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (err) {
    st.running--;
    const message = String(err && err.message || err);
    const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: 'proc.spawn', ok: false, exec: what.exec, ms: Date.now() - started, reason: 'spawn threw', message });
    push(st, { error: true, op: 'proc.spawn', exec: what.exec, reason: 'spawn threw', message, act: g.seq, outcome: outSeq }, p.queueMax);
    return;
  }
  let out = '', err = '', capped = false, settled = false;
  const timer = setTimeout(() => { try { child.kill(); } catch { /* already gone */ } }, timeoutMs);
  const closer = retain(cell, () => { clearTimeout(timer); try { child.kill(); } catch { /* already gone */ } });
  const take = (which, chunk) => {
    const text = chunk.toString('utf8');
    if (which === 'out') { if (out.length + text.length > maxBytes) { out += text.slice(0, Math.max(0, maxBytes - out.length)); capped = true; } else out += text; }
    else if (err.length + text.length > maxBytes) { err += text.slice(0, Math.max(0, maxBytes - err.length)); capped = true; } else err += text;
  };
  child.stdout.on('data', (c) => take('out', c));
  child.stderr.on('data', (c) => take('err', c));
  const settle = (code, signal, thrown) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer); release(cell, closer);
    st.running--; st.ran++;
    const ms = Date.now() - started;
    const ok = thrown == null && code === 0;
    const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: 'proc.spawn', ok, exec: what.exec, args: what.args.length, code, signal, bytes: out.length + err.length, capped, ms, reason: ok ? null : (thrown || 'exit ' + code + (signal ? ' on ' + signal : '')) });
    if (thrown != null) {
      push(st, { error: true, op: 'proc.spawn', exec: what.exec, reason: 'the child failed', message: thrown, act: g.seq, outcome: outSeq }, p.queueMax);
      return;
    }
    push(st, { error: false, out: { kind: 'event', data: { exec: what.exec, args: what.args, code, signal, stdout: out, stderr: err, capped, ms, trace: { act: g.seq, outcome: outSeq } } }, act: g.seq, outcome: outSeq }, p.queueMax);
  };
  child.on('error', (e) => settle(null, null, String(e && e.message || e)));
  child.on('close', (code, signal) => settle(code, signal, null));
  if (stdin != null) { try { child.stdin.end(stdin); } catch { /* the child closed it */ } }
  else { try { child.stdin.end(); } catch { /* the child closed it */ } }
}

// ---------------------------------------------------------------- world.clock
// Wall time is outside the process too: it is the one input no deterministic replay can
// reproduce, which is exactly why reading it is an act and not a computation. The tap is
// proposed once (clock.read) and every reading after that is a plain tick event carrying
// the act seq that authorized it. Each armed timer is its own proposal (clock.timer).
defineKind('world.clock', {
  doc: 'Wall time and timers as events. Emits { wallMs, iso, t, gen } on tick every run once the clock tap is approved, and { key, lateMs } on due when a timer armed through the arm port comes up.',
  ports: {
    in: [{ name: 'arm', kinds: ['event'] }],
    out: [{ name: 'tick', kinds: ['event'] }, { name: 'due', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { everyRuns: 1, queueMax: 64 },
  init: () => ({ queue: [], opened: false, act: null, reads: 0, armed: 0, fired: 0, refused: 0, dropped: 0, runs: 0, lastMs: 0, reason: null }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    let error = null;
    if (!st.opened) {
      const g = propose(cell, ctx, null, { op: 'clock.read' }, 'open a tap on wall time for ' + cell.id);
      st.opened = true;
      st.act = g.seq;
      if (!g.approved) { st.reason = g.reason; st.refused++; error = errEvent({ op: 'clock.read', status: g.status, reason: g.reason, act: g.seq }); }
    }
    if (st.reason) return [null, null, error];
    for (const sig of sigsOf(ins[0])) {
      const r = sig.data || {};
      const afterMs = Number(r.afterMs ?? r.after ?? 0);
      const what = { op: 'clock.timer', afterMs, key: String(r.key ?? 'timer' + st.armed), armed: st.armed };
      const g = propose(cell, ctx, sig, what, 'arm a timer for ' + afterMs + 'ms, key ' + what.key);
      if (!g.approved) { st.refused++; error = errEvent({ op: 'clock.timer', status: g.status, reason: g.reason, act: g.seq }); continue; }
      st.armed++;
      const dueAt = Date.now() + afterMs;
      const timer = setTimeout(() => {
        st.armed--; st.fired++;
        release(cell, closer);
        const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: 'clock.timer', ok: true, key: what.key, afterMs, lateMs: Date.now() - dueAt });
        push(st, { key: what.key, afterMs, firedAt: Date.now(), lateMs: Date.now() - dueAt, act: g.seq, outcome: outSeq }, p.queueMax);
      }, afterMs);
      if (typeof timer.unref === 'function') timer.unref();
      const closer = retain(cell, () => clearTimeout(timer));
    }
    st.runs++;
    let tick = null;
    if (p.everyRuns > 0 && st.runs % p.everyRuns === 0) {
      const now = Date.now();
      st.reads++; st.lastMs = now;
      tick = { kind: 'event', data: { wallMs: now, iso: new Date(now).toISOString(), t: ctx.t, gen: ctx.gen, act: st.act } };
    }
    let due = null;
    if (st.queue.length) { const it = st.queue.shift(); due = { kind: 'event', data: it }; }
    return [tick, due, error];
  },
  serialize: (s) => ({ ...s, queue: s.queue.slice(0, 8) }),
  cost: 1,
});

// ---------------------------------------------------------------- world.net.listen
// The other direction: a loopback endpoint any other program on this machine can POST to,
// so the brain can be driven by things that are not the CLI. Loopback only, enforced twice
// (the policy refuses a non loopback host, and the bind uses the policy's host, not the
// request's). params.wake, when it is a function, is called after a body is queued: that
// is how a POST makes the organism tick rather than waiting for the next scheduled tick.
// Like io/sources.mjs params.stream, a function param is live, not serializable state.
defineKind('world.net.listen', {
  doc: 'A loopback HTTP endpoint other programs POST to, so the world can send this brain signals. Each body is queued and drained one per run onto out as an event.',
  ports: {
    in: [],
    out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { path: null, host: null, port: null, token: null, maxBytes: null, queueMax: null, wake: null },
  init: () => ({ queue: [], opened: false, listening: false, address: null, act: null, received: 0, rejected: 0, dropped: 0, reason: null }),
  compute: (ins, cell, ctx) => {
    const st = cell.state;
    let error = null;
    if (!st.opened) {
      st.opened = true;
      error = openListener(cell, ctx);
    }
    let out = null;
    if (st.queue.length) out = { kind: 'event', data: st.queue.shift() };
    return [out, error];
  },
  serialize: (s) => ({ ...s, queue: s.queue.slice(0, 8) }),
  cost: 1,
});

function openListener(cell, ctx) {
  const st = cell.state, p = cell.params;
  const brain = ctx && ctx.brain;
  const policy = brain && brain.gate ? armedPolicy(brain.gate) : null;
  const host = (policy && policy.listen.host) || '127.0.0.1';
  const port = p.port != null ? Number(p.port) : (policy ? policy.listen.port : 0);
  const what = { op: 'net.listen', host, port, path: p.path || (policy ? policy.listen.path : '/signal') };
  const g = propose(cell, ctx, null, what, 'open a loopback endpoint on ' + host + ':' + port + what.path + ' for ' + cell.id);
  st.act = g.seq;
  if (!g.approved) {
    st.reason = g.reason;
    return errEvent({ op: 'net.listen', status: g.status, reason: g.reason, act: g.seq });
  }
  const route = what.path;
  const maxBytes = tighten(policy.listen.maxBytes, p.maxBytes);
  const queueMax = tighten(policy.listen.queueMax, p.queueMax);
  const token = p.token || policy.listen.token;
  const server = http.createServer((req, res) => {
    const send = (code, body) => {
      const text = JSON.stringify(body);
      res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text), connection: 'close' });
      res.end(text);
    };
    let url;
    try { url = new URL(req.url, 'http://' + host); } catch { return send(400, { ok: false, error: 'bad url' }); }
    if (req.method === 'GET' && url.pathname === '/health') return send(200, { ok: true, cell: cell.id, queued: st.queue.length, received: st.received });
    if (req.method !== 'POST' || url.pathname !== route) { st.rejected++; return send(404, { ok: false, error: 'POST ' + route + ' or GET /health' }); }
    if (token && req.headers['x-brain-token'] !== token) { st.rejected++; return send(403, { ok: false, error: 'bad or missing x-brain-token' }); }
    let body = '', over = false;
    req.setEncoding('utf8');
    req.on('data', (c) => {
      body += c;
      if (Buffer.byteLength(body) > maxBytes) { over = true; req.destroy(); }
    });
    req.on('end', () => {
      if (over) { st.rejected++; return send(413, { ok: false, error: 'body over ' + maxBytes + ' bytes' }); }
      let payload;
      try { payload = body.length ? JSON.parse(body) : {}; }
      catch (e) { st.rejected++; return send(400, { ok: false, error: 'bad JSON body: ' + e.message }); }
      st.received++;
      push(st, { from: 'net.listen', at: Date.now(), path: route, remote: req.socket.remoteAddress || null, payload, act: st.act }, queueMax);
      outcome(ctx, st.act, { cell: cell.id, op: 'net.listen', ok: true, direction: 'in', bytes: Buffer.byteLength(body), queued: st.queue.length });
      send(200, { ok: true, queued: st.queue.length });
      if (typeof p.wake === 'function') { try { p.wake(payload, cell); } catch { /* a wake that throws must not kill the endpoint */ } }
    });
  });
  server.on('connection', (s) => s.unref());
  server.on('error', (err) => { st.reason = String(err && err.message || err); st.listening = false; });
  server.listen(port, host, () => {
    const a = server.address();
    st.listening = true;
    st.address = { host: a.address, port: a.port, url: 'http://' + (a.address.includes(':') ? '[' + a.address + ']' : a.address) + ':' + a.port + route, path: route };
    outcome(ctx, st.act, { cell: cell.id, op: 'net.listen', ok: true, direction: 'open', host: a.address, port: a.port, path: route });
  });
  if (typeof server.unref === 'function') server.unref();
  retain(cell, () => { try { server.closeAllConnections?.(); } catch { /* older node */ } server.close(); });
  return null;
}

/** Where a world.net.listen cell is actually listening, or null before the bind lands. */
export function listenAddress(cell) { return cell.state && cell.state.address ? { ...cell.state.address } : null; }

/** Wait for a world.net.listen cell to be bound. Resolves with its address. */
export function waitForListen(cell, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const poll = () => {
      if (cell.state && cell.state.address) return resolve({ ...cell.state.address });
      if (cell.state && cell.state.reason) return reject(new Error('listener refused: ' + cell.state.reason));
      if (Date.now() - started > timeoutMs) return reject(new Error('listener did not bind within ' + timeoutMs + 'ms'));
      setTimeout(poll, 5).unref?.();
    };
    poll();
  });
}
