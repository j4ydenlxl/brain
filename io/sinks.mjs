// io/sinks.mjs: THE MUSCLES. Cell kinds that take a Signal out of the brain and act on
// the world with it. Each is a plain terminal cell (in port only, like sink.log in
// cells/basic.mjs): it never emits, so it never needs an edge downstream, and it is safe
// to run with policy.period = 'event' so it only fires when it actually has mail.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ANY = ['hv', 'sdr', 'num', 'sym', 'vec', 'event'];

// A JSON-safe view of one signal: t, kind, and the kind's own JSON encoding of data
// (S.dataToJSON already knows how to turn an hv/vec/num/sdr into plain JSON).
function lineOf(sig) {
  return JSON.stringify({ t: sig.t, kind: sig.kind, data: S.dataToJSON(sig.kind, sig.data) });
}

// ---------------------------------------------------------------- sink.stdout
defineKind('sink.stdout', {
  doc: 'Formats each incoming signal as one JSON line and writes it to params.stream (default process.stdout).',
  ports: { in: [{ name: 'in', kinds: ANY }], out: [] },
  defaults: { stream: null },
  init: () => ({ lines: 0 }),
  compute: (ins, cell) => {
    const stream = cell.params.stream || process.stdout;
    for (const it of ins[0]) { stream.write(lineOf(it.sig) + '\n'); cell.state.lines++; }
    return [];
  },
});

// ---------------------------------------------------------------- sink.file
defineKind('sink.file', {
  doc: 'Appends each incoming signal to params.path as one JSON line. Lines are buffered on cell.state and flushed to disk (fs.appendFileSync) every params.flushEvery runs of this cell (default 1: flush on every run). flushSink(cell) forces an immediate flush regardless of the counter.',
  ports: { in: [{ name: 'in', kinds: ANY }], out: [] },
  defaults: { path: null, flushEvery: 1 },
  init: (p) => {
    if (p.path) mkdirSync(path.dirname(p.path), { recursive: true });
    return { buffer: [], runs: 0, written: 0 };
  },
  compute: (ins, cell) => {
    const p = cell.params, st = cell.state;
    if (!p.path) throw new Error('sink.file: params.path required');
    for (const it of ins[0]) st.buffer.push(lineOf(it.sig));
    st.runs++;
    if (st.buffer.length && st.runs % Math.max(1, p.flushEvery) === 0) doFlush(p.path, st);
    return [];
  },
});
function doFlush(filePath, st) {
  if (!st.buffer.length) return;
  appendFileSync(filePath, st.buffer.join('\n') + '\n');
  st.written += st.buffer.length;
  st.buffer = [];
}

// ---------------------------------------------------------------- sink.http
defineKind('sink.http', {
  doc: 'POSTs each incoming signal as JSON to params.url. A failed request (network error or non-2xx) retries with exponential backoff (params.backoffMs * 2^attempt) up to params.maxRetries, off the tick via setTimeout, never inside compute(). compute() itself never throws: outcomes land in cell.state.sent / cell.state.failed, not in a thrown error.',
  ports: { in: [{ name: 'in', kinds: ANY }], out: [] },
  defaults: { url: null, maxRetries: 3, backoffMs: 20, headers: null },
  init: () => ({ sent: 0, failed: 0, pending: 0, timers: new Set() }),
  compute: (ins, cell) => {
    const p = cell.params, st = cell.state;
    if (!p.url) throw new Error('sink.http: params.url required');
    for (const it of ins[0]) { st.pending++; attemptPost(p, lineOf(it.sig), 0, st); }
    return [];
  },
});
// pending is incremented once per incoming signal (in compute above) and decremented
// exactly once, by whichever attempt finally settles it (success, or maxRetries used up).
function attemptPost(p, body, attempt, st) {
  const done = (ok) => { st.pending--; if (ok) st.sent++; else st.failed++; };
  let promise;
  try {
    promise = fetch(p.url, { method: 'POST', headers: { 'content-type': 'application/json', ...(p.headers || {}) }, body });
  } catch (err) {
    promise = Promise.reject(err);
  }
  promise
    .then((res) => {
      if (res.ok) { done(true); return; }
      if (attempt < p.maxRetries) retry(p, body, attempt, st);
      else done(false);
    })
    .catch(() => {
      if (attempt < p.maxRetries) retry(p, body, attempt, st);
      else done(false);
    });
}
function retry(p, body, attempt, st) {
  const t = setTimeout(() => { st.timers.delete(t); attemptPost(p, body, attempt + 1, st); }, p.backoffMs * (2 ** attempt));
  st.timers.add(t);
}

// flushSink(cell): force sink.file's buffer to disk now, regardless of flushEvery.
// closeSink(cell): cancel any sink.http retries still waiting on a backoff timer.
// Both are no-ops for kinds that keep no such state, so callers can call them on every
// registered sink without checking its kind first.
export function flushSink(cell) {
  if (cell.kind === 'sink.file') doFlush(cell.params.path, cell.state);
}
export function closeSink(cell) {
  if (cell.kind === 'sink.http') { for (const t of cell.state.timers) clearTimeout(t); cell.state.timers.clear(); }
}
