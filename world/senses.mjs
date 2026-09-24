// world/senses.mjs: THE SENSES. The matching half of world/actuators.mjs: cell kinds that
// let the outside world reach IN, on a declared period, from a declared place.
//
// A sense is authority too. Reading is not neutral: a poll opens a socket to somebody
// else's machine, a watcher holds a file handle, stdin attaches to a stream the operator
// owns. So each sense opens through the same gate, with the same 'world.act' proposal kind,
// and a refused sense never touches the resource at all. The difference from an actuator is
// GRANULARITY, and it is deliberate: an actuator proposes once per act, because each act is
// a separate reach; a sense proposes once when the stream OPENS, because the stream itself
// is the act, and then every arrival is logged as a 'world.sense' event whose `from` is the
// seq of the proposal that authorized the stream. Nothing that arrives is untraceable, and
// nothing streams without an approval standing behind it.
//
// Every sense emits plain 'event' signals, which is what the perception region eats:
// world/index.mjs wires them through a world.relay cell sitting in perception, so the
// border between the organism and its world is one named, inspectable cell rather than a
// scatter of edges.
import { watch } from 'node:fs';
import { createInterface } from 'node:readline';
import { defineKind } from '../core/cell.mjs';
import { armedPolicy } from './policy.mjs';
import { drain, fetchOnce, propose, push, release, retain } from './actuators.mjs';
// A recorded market tape is a sense like any other: it opens with one proposal and every
// reading after it is a world.sense event pointing back at that proposal. It lives in
// world/venue.mjs with the actuator it feeds, because the two share one replay cursor, and
// it is registered here so the sense path has one list and not two.
import './venue.mjs';

export const SENSE_KINDS = Object.freeze(['sense.poll', 'sense.watch', 'sense.stdin', 'sense.venue']);

const sigsOf = (mail) => mail.map((it) => it.sig);
const errEvent = (data) => ({ kind: 'event', data });
const seqOrNull = (s) => (typeof s === 'number' && s >= 0 ? s : null);

// One arrival from the world, recorded against the proposal that authorized the stream.
function sensed(ctx, actSeq, fields) {
  const brain = ctx && ctx.brain;
  if (!brain) return null;
  return seqOrNull(brain.log({ type: 'world.sense', from: seqOrNull(actSeq), ...fields }));
}

// ---------------------------------------------------------------- sense.poll
// Any allowlisted URL becomes a periodic event stream at a declared period. The period is
// wall time (params.periodMs), not ticks: the cell may be scheduled far more often than it
// polls, and a run that is too early simply does nothing. A request is in flight at most
// once at a time, so a slow endpoint cannot stack requests up behind itself.
defineKind('sense.poll', {
  doc: 'Turns an allowlisted URL into a periodic event stream at a declared period (params.periodMs of wall time). One proposal opens the stream; every arrival after that is a world.sense ledger event pointing back at it.',
  ports: {
    in: [],
    out: [{ name: 'out', kinds: ['event', 'sym', 'vec'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { url: null, periodMs: 1000, as: 'event', headers: null, timeoutMs: null, maxBytes: null, queueMax: 32 },
  init: () => ({ queue: [], opened: false, act: null, reason: null, inflight: 0, polls: 0, sent: 0, failed: 0, dropped: 0, lastAt: 0, lastTrace: null }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    let error = null;
    if (!st.opened) {
      st.opened = true;
      const what = { op: 'sense.poll', url: String(p.url ?? ''), periodMs: Number(p.periodMs), as: p.as };
      const g = propose(cell, ctx, null, what, 'open a ' + p.periodMs + 'ms poll of ' + String(p.url ?? '(no url)') + ' for ' + cell.id);
      st.act = g.seq;
      if (!g.approved) { st.reason = g.reason; error = errEvent({ op: 'sense.poll', url: what.url, status: g.status, reason: g.reason, act: g.seq }); }
    }
    if (st.reason) return [null, error];
    const now = Date.now();
    if (!st.inflight && now - st.lastAt >= Number(p.periodMs)) {
      const policy = armedPolicy(ctx && ctx.brain && ctx.brain.gate);
      if (policy) {
        st.lastAt = now; st.polls++; st.inflight++;
        const what = { op: 'sense.poll', url: String(p.url), method: 'GET', periodMs: Number(p.periodMs), bytes: 0, as: p.as };
        sensed(ctx, st.act, { cell: cell.id, op: 'sense.poll', direction: 'request', url: what.url, poll: st.polls });
        fetchOnce(cell, ctx, { approved: true, seq: st.act, policy }, what, null, p.headers, p.as || 'event');
      }
    }
    const [out, err] = drain(cell, st);
    return [out, err || error];
  },
  serialize: (s) => ({ ...s, queue: [], queuedAtSnapshot: s.queue.length }),
  cost: 2,
});

// ---------------------------------------------------------------- sense.watch
// A file watcher under an allowlisted root. Debounced, because an editor saving a file
// emits three or four events for one human action, and the organism should perceive the
// action, not the syscalls.
defineKind('sense.watch', {
  doc: 'Watches an allowlisted path with fs.watch and emits a debounced event { path, eventType, filename, wallMs } when it changes. A path outside every allowed root is refused and never watched.',
  ports: {
    in: [],
    out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { path: null, debounceMs: 20, recursive: false, queueMax: 64 },
  init: () => ({ queue: [], opened: false, watching: false, act: null, reason: null, changes: 0, dropped: 0 }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    let error = null;
    if (!st.opened) {
      st.opened = true;
      const what = { op: 'sense.watch', path: String(p.path ?? ''), recursive: !!p.recursive };
      const g = propose(cell, ctx, null, what, 'watch ' + String(p.path ?? '(no path)') + ' for ' + cell.id);
      st.act = g.seq;
      if (!g.approved) { st.reason = g.reason; error = errEvent({ op: 'sense.watch', path: what.path, status: g.status, reason: g.reason, act: g.seq }); }
      else error = openWatcher(cell, ctx, g);
    }
    if (st.reason && !st.watching) return [null, error];
    let out = null;
    if (st.queue.length) out = { kind: 'event', data: st.queue.shift() };
    return [out, error];
  },
  serialize: (s) => ({ ...s, queue: s.queue.slice(0, 8) }),
  cost: 1,
});

function openWatcher(cell, ctx, g) {
  const p = cell.params, st = cell.state;
  let pending = null, timer = null;
  try {
    const watcher = watch(p.path, { recursive: !!p.recursive }, (eventType, filename) => {
      pending = { eventType, filename: filename ? String(filename) : null };
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        const ev = pending; pending = null;
        if (!ev) return;
        st.changes++;
        const seq = sensed(ctx, st.act, { cell: cell.id, op: 'sense.watch', direction: 'in', path: p.path, eventType: ev.eventType, filename: ev.filename });
        push(st, { path: p.path, eventType: ev.eventType, filename: ev.filename, wallMs: Date.now(), trace: { act: st.act, sense: seq } }, p.queueMax);
      }, Math.max(0, Number(p.debounceMs) || 0));
      if (typeof timer.unref === 'function') timer.unref();
    });
    st.watching = true;
    retain(cell, () => { if (timer) clearTimeout(timer); watcher.close(); });
    return null;
  } catch (err) {
    st.reason = String(err && err.message || err);
    return errEvent({ op: 'sense.watch', path: p.path, status: 'failed', reason: st.reason, act: g.seq });
  }
}

// ---------------------------------------------------------------- sense.stdin
// The operator's own keyboard, or any stream handed in as params.stream (a live object,
// like io/sources.mjs params.stream, and for the same reason: it is a handle, not state).
// Lines arrive whenever they arrive and wait on a queue; one is emitted per run, so a
// paste of a thousand lines does not flood a single tick.
defineKind('sense.stdin', {
  doc: 'Reads lines from params.stream (default process.stdin) and emits one { line, n } event per run. Refused outright unless the policy enables stdin.',
  ports: {
    in: [],
    out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
  },
  defaults: { stream: null, queueMax: 256 },
  init: () => ({ queue: [], opened: false, reading: false, act: null, reason: null, lines: 0, dropped: 0 }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, st = cell.state;
    let error = null;
    if (!st.opened) {
      st.opened = true;
      const g = propose(cell, ctx, null, { op: 'sense.stdin' }, 'read lines from stdin for ' + cell.id);
      st.act = g.seq;
      if (!g.approved) { st.reason = g.reason; error = errEvent({ op: 'sense.stdin', status: g.status, reason: g.reason, act: g.seq }); }
      else {
        const stream = p.stream || process.stdin;
        const rl = createInterface({ input: stream, terminal: false, crlfDelay: Infinity });
        rl.on('line', (line) => {
          st.lines++;
          const seq = sensed(ctx, st.act, { cell: cell.id, op: 'sense.stdin', direction: 'in', bytes: Buffer.byteLength(String(line)), n: st.lines });
          push(st, { line: String(line), n: st.lines, wallMs: Date.now(), trace: { act: st.act, sense: seq } }, p.queueMax);
        });
        st.reading = true;
        retain(cell, () => rl.close());
      }
    }
    if (st.reason) return [null, error];
    let out = null;
    if (st.queue.length) out = { kind: 'event', data: st.queue.shift() };
    return [out, error];
  },
  serialize: (s) => ({ ...s, queue: s.queue.slice(0, 16) }),
  cost: 1,
});

// release is re-exported so a caller that retained a handle through this module can hand
// it back without reaching into actuators.mjs for the other half of the pair.
export { retain, release };

// ---------------------------------------------------------------- the five receptors (P12)
// His words, 2026-09-23: "It also should be able to feel five senses." Sight, hearing, touch,
// smell and taste are five modules with one contract (world/receptor-kit.mjs): probe() says
// whether this machine has the hardware and how that was found out, sample() reads one
// sample { bytes, latencyMs, encoding }, encode() makes an 8192 lane bipolar percept whose
// provenance is "sense:<name>".
//
// Where the authority sits. A receptor cell never reaches the world: it holds a queue and
// relays what feel() put on it. feel() is called by the operator (bench/senses.mjs, a test,
// a person at a prompt), exactly as brain.inject() is, and the read it does is a READ: a
// screen frame held in memory, a cursor position, a microphone clip deleted as it is read,
// one row of a table. Nothing is written to the screen, the cursor or a key, no socket or
// listener is opened, and so nothing here files a world.act proposal: there is no act.
// Every sample is still on the ledger, as a world.sense event with from: null (no proposal
// stands behind it, and the null says so rather than pointing at one that does not exist).
//
// Where it lands. Each receptor gets two cells: the receptor itself (world region, senses
// circuit), whose hv port feeds a decode.hv PERCEPTION cell and whose event port feeds the
// perception border (w.percept) when attachWorld made one. The perception cell's codebook is
// the five modality keys, so what it fires is the name of the sense it felt, read back out
// of the lanes, not copied from a label: the proof that a percept reached perception is the
// ledger chain receptor run, hv signal, perception run that consumed it, and its output.
import * as sight from './receptor-sight.mjs';
import * as hearing from './receptor-hearing.mjs';
import * as touch from './receptor-touch.mjs';
import * as smell from './receptor-smell.mjs';
import * as taste from './receptor-taste.mjs';
import '../cells/perception.mjs';

export const RECEPTORS = Object.freeze({ sight, hearing, touch, smell, taste });
export const RECEPTOR_NAMES = Object.freeze(Object.keys(RECEPTORS));
// A receptor kind is not a SENSE_KINDS entry: it opens nothing, so closeWorld has nothing of
// it to close, and the world's kind census (13) stays what world.test.mjs pins it to.
export const RECEPTOR_KINDS = Object.freeze(['sense.receptor']);
export const MODALITY_ITEMS = Object.freeze(RECEPTOR_NAMES.map((n) => 'sense:' + n));

defineKind('sense.receptor', {
  doc: 'One of the five receptors (params.sense). Emits one queued percept per run: the 8192 lane hv on port hv (to a decode.hv perception cell) and its provenance event on port out (to the perception border). Opens nothing; feel() fills the queue. Every emission is a world.sense ledger event with from: null.',
  ports: {
    in: [],
    out: [{ name: 'hv', kinds: ['hv'] }, { name: 'out', kinds: ['event'] }],
  },
  defaults: { sense: null, queueMax: 8 },
  init: () => ({ queue: [], sent: 0, dropped: 0, last: null }),
  compute: (ins, cell, ctx) => {
    const st = cell.state;
    if (!st.queue.length) return [null, null];
    const it = st.queue.shift();
    const m = it.meta;
    const seq = sensed(ctx, null, { cell: cell.id, op: 'sense.receptor', direction: 'in', sense: m.sense, provenance: m.provenance, bytes: m.bytes, latencyMs: m.latencyMs, encoding: m.encoding, hardware: m.hardware, source: m.source, hash: m.hash });
    st.sent++;
    st.last = { hash: m.hash, sense: seq };
    return [{ kind: 'hv', data: it.hv }, { kind: 'event', data: { ...m, trace: { act: null, sense: seq } } }];
  },
  serialize: (s) => ({ ...s, queue: [], queuedAtSnapshot: s.queue.length }),
  cost: 1,
});

/**
 * Give a brain its five receptors: for each sense, a receptor cell <prefix>.<name> in the
 * world region and a decode.hv perception cell <prefix>.feel.<name> that fires on it.
 * @returns {{ cells: object, wired: string[] }} also kept on brain.ctx.receptors
 */
export function attachReceptors(brain, { prefix = 'w', senses = RECEPTOR_NAMES } = {}) {
  const border = prefix + '.percept';
  const hasBorder = brain.byId.has(border);
  const report = { prefix, cells: {}, wired: [], border: hasBorder ? border : null };
  for (const name of senses) {
    if (!RECEPTORS[name]) throw new Error('attachReceptors: no receptor ' + JSON.stringify(name) + ' (have ' + RECEPTOR_NAMES.join(', ') + ')');
    const rid = prefix + '.' + name, fid = prefix + '.feel.' + name;
    brain.addCell({ id: rid, kind: 'sense.receptor', region: 'world', circuit: 'senses', params: { sense: name }, policy: { period: 1 } });
    brain.addCell({ id: fid, kind: 'decode.hv', region: 'perception', circuit: 'senses', params: { items: [...MODALITY_ITEMS], threshold: 0.05 }, policy: { period: 'event' } });
    brain.connect(rid, 'hv', fid, 'in');
    report.wired.push(rid + '.hv -> ' + fid + '.in');
    if (hasBorder) { brain.connect(rid, 'out', border, 'in'); report.wired.push(rid + '.out -> ' + border + '.in'); }
    report.cells[name] = { receptor: rid, perception: fid };
  }
  brain.ctx.receptors = report;
  return report;
}

/**
 * Feel once: probe, sample and encode one sense, hand the percept to its receptor cell, and
 * tick until the ledger shows the perception cell fired on it (at most opts.maxTicks, 16).
 * opts goes to probe() and sample() as well (source, powershell, compound, keysMs, ...).
 * @returns {Promise<object>} the probe, the sample's measurements, the encoding and the proof
 */
export async function feel(brain, name, opts = {}) {
  const R = RECEPTORS[name];
  const cells = brain.ctx.receptors && brain.ctx.receptors.cells[name];
  if (!R || !cells) throw new Error('feel: ' + name + ' is not attached (call attachReceptors first)');
  const probe = opts.probe || await R.probe(opts);
  const s = await R.sample({ ...opts, probe });
  const row = { sense: name, present: !!probe.present, how: probe.how, probeMs: probe.ms ?? null, source: s.source, hardware: !!s.hardware, fallback: s.fallback || null, bytes: s.bytes.length, latencyMs: s.latencyMs, encoding: s.encoding };
  if (!s.bytes.length) return { ...row, fired: null, reason: s.fallback || 'the sample is empty' };
  const sig = R.encode(s, opts);
  Object.assign(row, { provenance: sig.provenance, lanes: sig.lanes, hash: sig.hash, code: sig.code, features: sig.features });
  const rc = brain.cell(cells.receptor);
  const meta = { sense: name, provenance: sig.provenance, lanes: sig.lanes, bytes: row.bytes, latencyMs: row.latencyMs, encoding: row.encoding, code: sig.code, hardware: row.hardware, source: row.source, hash: sig.hash };
  push(rc.state, { hv: sig.data, meta }, rc.params.queueMax);
  const seen = [];
  const off = brain.ledger.on((e) => { if (e.type === 'cell.run' || e.type === 'signal' || e.type === 'world.sense') seen.push(e); });
  const maxTicks = opts.maxTicks ?? 16;
  let proof = null;
  try {
    for (let i = 0; i < maxTicks && !proof; i++) { brain.tick(1); proof = proofOf(brain, seen, cells, name, sig.hash); }
  } finally { off(); }
  if (!proof) return { ...row, fired: null, reason: 'no perception run consumed the percept within ' + maxTicks + ' ticks (ledger level ' + brain.ledgerLevel + ')' };
  return { ...row, ...proof };
}

// The ledger chain, read back from the events this feel() saw: the receptor's world.sense
// event carrying this percept's hash, the receptor run right after it, the hv signal that run
// emitted, the perception run that consumed that signal, and the output of that run (found
// in the outbox by its seq, since a decode.hv cell with nothing downstream routes nowhere).
function proofOf(brain, seen, cells, name, hash) {
  const ws = seen.find((e) => e.type === 'world.sense' && e.cell === cells.receptor && e.hash === hash);
  if (!ws) return null;
  const rrun = seen.find((e) => e.type === 'cell.run' && e.cell === cells.receptor && e.seq > ws.seq);
  if (!rrun) return null;
  const hvSig = seen.find((e) => e.type === 'signal' && e.from === rrun.seq && e.kind === 'hv');
  if (!hvSig) return null;
  const frun = seen.find((e) => e.type === 'cell.run' && e.cell === cells.perception && (e.consumed || []).includes(hvSig.seq));
  if (!frun) return null;
  const outSig = seen.find((e) => e.type === 'signal' && e.from === frun.seq);
  const out = outSig ? brain.outbox.find((sg) => sg.seq === outSig.seq) : null;
  const named = out && out.data ? out.data.name : null;
  return {
    fired: cells.perception, tick: frun.t, receptorTick: rrun.t,
    ledger: { sense: ws.seq, receptorRun: rrun.seq, hvSignal: hvSig.seq, perceptionRun: frun.seq, output: outSig ? outSig.seq : null },
    named, sim: out && out.data && Number.isFinite(out.data.sim) ? Math.round(out.data.sim * 1e4) / 1e4 : null,
    recognised: named === 'sense:' + name,
  };
}
