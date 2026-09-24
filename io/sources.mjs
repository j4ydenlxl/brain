// io/sources.mjs: THE SENSES. Cell kinds that bring the outside world in as Signals.
// Every kind here follows the same contract as cells/basic.mjs: defineKind registers a
// kind with ports + compute(ins, cell, ctx). A "source" cell has no in ports; each run
// (each time the clock wheel or an explicit tick calls it) it may emit on its out port.
//
// compute() is synchronous (core/cell.mjs calls it and expects an array back, not a
// Promise), but real IO (fetch, fs.watch, stdin) is asynchronous. The pattern used below
// for source.http and source.watch is the same in both: kick off the async work once,
// let its callback push a finished result onto a small in-memory queue on cell.state, and
// have compute() drain one item off that queue per run. That keeps every source cell a
// plain, synchronous function of (ins, cell, ctx) -> outs, matching the rest of the brain.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { readFileSync, watch } from 'node:fs';
import { createInterface } from 'node:readline';
import { MS } from '../core/clock.mjs';

// Cells that hold a real OS handle (an fs.watch watcher, a readline interface bound to a
// stream) register a closer here, keyed by the cell object itself. cell.state stays plain
// data (queues, counters); the live handle lives off to the side so nothing about it is
// ever mistaken for serializable state. Call closeSource(cell) when you are done with a
// cell of one of these kinds, or its handle will keep the process alive.
const HANDLES = new WeakMap();
export function closeSource(cell) {
  const h = HANDLES.get(cell);
  if (!h) return false;
  try { h.close(); } catch { /* already closed */ }
  HANDLES.delete(cell);
  return true;
}

// ---------------------------------------------------------------- source.file
// Minimal CSV line splitter: handles quoted fields, "" as an escaped quote inside a
// quoted field, and commas/quotes inside quotes. No multi-line quoted fields (JSONL
// rows and simple CSV exports do not need them).
function parseCsvLine(line) {
  const out = [];
  let cur = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

defineKind('source.file', {
  doc: 'Reads JSONL or CSV rows from params.path (whole file, lazily, on first run) and emits one row per run as an event. format is params.format or inferred from the extension. params.numeric names CSV columns that parse to an exact num (S.ratFromDecimal) instead of staying a string.',
  ports: { in: [], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { path: null, format: null, numeric: [] },
  init: () => ({ rows: null, i: 0 }),
  compute: (ins, cell) => {
    const p = cell.params, st = cell.state;
    if (st.rows === null) {
      if (!p.path) throw new Error('source.file: params.path required');
      const format = p.format || (/\.csv$/i.test(p.path) ? 'csv' : 'jsonl');
      const text = readFileSync(p.path, 'utf8');
      const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
      if (format === 'csv') {
        const header = lines.length ? parseCsvLine(lines[0]) : [];
        const numeric = new Set(p.numeric || []);
        st.rows = lines.slice(1).map((line) => {
          const cells = parseCsvLine(line), row = {};
          for (let i = 0; i < header.length; i++) {
            const col = header[i], raw = cells[i] ?? '';
            row[col] = numeric.has(col) ? S.ratFromDecimal(raw) : raw;
          }
          return row;
        });
      } else {
        st.rows = lines.map((line) => JSON.parse(line));
      }
      st.i = 0;
    }
    if (st.i >= st.rows.length) return [null];
    return [{ kind: 'event', data: st.rows[st.i++] }];
  },
});

// ---------------------------------------------------------------- source.stdin
defineKind('source.stdin', {
  doc: 'Reads lines from params.stream (defaults to process.stdin) without blocking the tick: a readline listener buffers incoming lines on cell.state.queue as they arrive, and each run dequeues and emits the oldest one as an event { line }. Call closeSource(cell) to detach the listener.',
  ports: { in: [], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { stream: null },
  init: () => ({ queue: [], started: false }),
  compute: (ins, cell) => {
    const st = cell.state;
    if (!st.started) {
      st.started = true;
      const stream = cell.params.stream || process.stdin;
      const rl = createInterface({ input: stream, terminal: false, crlfDelay: Infinity });
      rl.on('line', (line) => st.queue.push(line));
      HANDLES.set(cell, { close: () => rl.close() });
    }
    if (!st.queue.length) return [null];
    return [{ kind: 'event', data: { line: st.queue.shift() } }];
  },
});

// ---------------------------------------------------------------- source.timer
defineKind('source.timer', {
  doc: 'Emits an event { wallMs, t } carrying Date.now() and the clock tick on every run. No state, no handle: a pure clock tap.',
  ports: { in: [], out: [{ name: 'out', kinds: ['event'] }] },
  compute: (ins, cell, ctx) => [{ kind: 'event', data: { wallMs: Date.now(), t: ctx.t } }],
});

// ---------------------------------------------------------------- source.http
defineKind('source.http', {
  doc: 'GETs JSON from params.url using fetch on every run where the previous request has finished. The fetch runs in the background (compute stays synchronous): its result lands on a small queue and is drained one item per run onto out (success) or error (failure, non-2xx status, or a timeout past params.timeoutMs). Never throws into the tick.',
  ports: { in: [], out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }] },
  defaults: { url: null, timeoutMs: 5000, headers: null, queueMax: 32 },
  init: () => ({ queue: [], inflight: false }),
  compute: (ins, cell) => {
    const p = cell.params, st = cell.state;
    if (!st.inflight && p.url) {
      st.inflight = true;
      let ac;
      try { ac = new AbortController(); } catch { ac = null; }
      const timer = ac ? setTimeout(() => ac.abort(), p.timeoutMs) : null;
      const push = (item) => { st.queue.push(item); if (st.queue.length > p.queueMax) st.queue.shift(); };
      try {
        fetch(p.url, { headers: p.headers || undefined, signal: ac ? ac.signal : undefined })
          .then(async (res) => {
            if (!res.ok) { push({ error: true, status: res.status, url: p.url }); return; }
            const body = await res.json();
            push({ error: false, data: body });
          })
          .catch((err) => {
            push({ error: true, timeout: err && err.name === 'AbortError', message: String((err && err.message) || err), url: p.url });
          })
          .finally(() => { if (timer) clearTimeout(timer); st.inflight = false; });
      } catch (err) {
        if (timer) clearTimeout(timer);
        st.inflight = false;
        push({ error: true, message: String((err && err.message) || err), url: p.url });
      }
    }
    if (!st.queue.length) return [null, null];
    const item = st.queue.shift();
    if (item.error) return [null, { kind: 'event', data: { url: item.url, status: item.status, timeout: !!item.timeout, message: item.message } }];
    return [{ kind: 'event', data: item.data }, null];
  },
});

// ---------------------------------------------------------------- source.watch
defineKind('source.watch', {
  doc: 'Watches params.path with fs.watch and emits a debounced event { path, eventType, filename, t } when it changes: rapid-fire events inside params.debounceMs collapse into one. Call closeSource(cell) to stop the watcher.',
  ports: { in: [], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { path: null, debounceMs: 20 * MS },
  init: () => ({ queue: [], watching: false, timer: null }),
  compute: (ins, cell) => {
    const p = cell.params, st = cell.state;
    if (!st.watching) {
      if (!p.path) throw new Error('source.watch: params.path required');
      st.watching = true;
      let pending = null;
      const watcher = watch(p.path, (eventType, filename) => {
        pending = { eventType, filename: filename || p.path };
        if (st.timer) clearTimeout(st.timer);
        st.timer = setTimeout(() => { st.queue.push(pending); pending = null; st.timer = null; }, p.debounceMs);
      });
      HANDLES.set(cell, { close: () => { watcher.close(); if (st.timer) clearTimeout(st.timer); } });
    }
    if (!st.queue.length) return [null];
    const ev = st.queue.shift();
    return [{ kind: 'event', data: { path: p.path, eventType: ev.eventType, filename: ev.filename, t: Date.now() } }];
  },
});
