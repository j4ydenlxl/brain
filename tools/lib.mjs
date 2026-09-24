// tools/lib.mjs: shared plumbing for the observability CLIs (trace, inspect, diff).
//
// A brain lives in a "state dir": <dir>/snapshot.json plus <dir>/ledger/ledger.jsonl
// (core/brain.mjs Brain#snapshot and the Ledger constructor agree on that layout; see
// DESIGN.md section 12). Every tool here accepts either that directory or a direct path
// to its snapshot.json, reads the ledger straight off disk (a freshly restored Brain's
// in-memory ledger ring is empty, only the file has history), and shares one plain-text
// table renderer so the three CLIs look like one instrument.
//
// Nothing here mutates a brain or a ledger. Read only, by design: pointing a tool at a
// live brain's state dir must never race its own writes.
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import '../cells/index.mjs'; // registers every cell kind so any snapshot can deserialize
import { Brain } from '../core/brain.mjs';

// ---------------------------------------------------------------- locating a brain
// Accepts a state dir, or a path straight to its snapshot.json. Returns the dir (the
// thing Brain.restore wants, and the thing a co-located ledger/ hangs off of).
export function resolveStateDir(input) {
  if (input == null) throw new Error('no snapshot or state dir given');
  const p = path.resolve(String(input));
  if (!existsSync(p)) throw new Error('no such path: ' + p);
  const st = statSync(p);
  if (st.isFile()) {
    if (path.basename(p) !== 'snapshot.json') {
      throw new Error('expected a snapshot.json file, got ' + p + ' (point at the file itself or its directory)');
    }
    return path.dirname(p);
  }
  const snap = path.join(p, 'snapshot.json');
  if (!existsSync(snap)) throw new Error('no snapshot.json under ' + p);
  return p;
}

// Restore a Brain from a state dir or its snapshot.json. Read only: ledgerLevel 'off'
// unless the caller asks for 'full' (loading with 'full' still never writes anything by
// itself; a caller would have to call .tick()/.inject() to produce new events).
export function loadBrainAt(input, opts = {}) {
  const dir = resolveStateDir(input);
  const brain = Brain.restore(dir, { ledger: 'off', ...opts });
  return brain;
}

// ---------------------------------------------------------------- the ledger, from disk
// Find the ledger.jsonl for a state dir, a ledger/ dir, or a direct file path.
export function resolveLedgerFile(input) {
  const p = path.resolve(String(input));
  if (!existsSync(p)) throw new Error('no such path: ' + p);
  const st = statSync(p);
  if (st.isFile()) return p;
  const asState = path.join(p, 'ledger', 'ledger.jsonl');
  if (existsSync(asState)) return asState;
  const asLedgerDir = path.join(p, 'ledger.jsonl');
  if (existsSync(asLedgerDir)) return asLedgerDir;
  return asState; // caller gets a clean "no such file" from readLedgerFile
}

// Parse every line of a ledger.jsonl into events. A torn last line (process killed
// mid-append) is skipped rather than failing the whole read.
export function loadLedger(input) {
  const file = resolveLedgerFile(input);
  if (!existsSync(file)) return { file, events: [], seq: 0, counts: {} };
  const events = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line) continue;
    try { events.push(JSON.parse(line)); } catch { /* torn line, skip */ }
  }
  const counts = {};
  let seq = 0;
  for (const e of events) { counts[e.type] = (counts[e.type] || 0) + 1; if (e.seq >= seq) seq = e.seq + 1; }
  return { file, events, seq, counts };
}

// Map<seq, event> for a live or restored Brain's ledger, always reading the authoritative
// copy: flush any buffered-but-unwritten events first when the ledger is file backed,
// otherwise fall back to the in-memory ring (a dir-less, in-process-only brain).
export function ledgerIndexFor(brain) {
  const led = brain.ledger;
  const idx = new Map();
  if (led.file) {
    led.flush();
    for (const e of loadLedger(led.file).events) idx.set(e.seq, e);
  } else {
    for (let s = 0; s < led.seq; s++) {
      const e = led.ring[s % led.ringSize];
      if (e && e.seq === s) idx.set(s, e);
    }
  }
  return idx;
}

// All ledger events for a state dir, in seq order, as a plain array (for tools that want
// to scan rather than random-access by seq).
export function ledgerEventsFor(brain) {
  return [...ledgerIndexFor(brain).values()].sort((a, b) => a.seq - b.seq);
}

export function cellKindOf(brain, cellId) {
  try { return brain.cell(cellId).kind; } catch { return null; }
}

// ---------------------------------------------------------------- CLI argument parsing
// Minimal argv parser shared by trace/inspect/diff: --flag value, --flag=value, bare
// --flag for booleans (from boolFlags, or when the next token is missing/another flag).
export function parseArgs(argv, boolFlags = []) {
  const opts = {}, pos = [];
  const bools = new Set(boolFlags);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') { pos.push(...argv.slice(i + 1)); break; }
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) { opts[a.slice(2, eq)] = a.slice(eq + 1); continue; }
      const key = a.slice(2);
      if (bools.has(key)) { opts[key] = true; continue; }
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) opts[key] = true;
      else { opts[key] = next; i++; }
      continue;
    }
    pos.push(a);
  }
  return { opts, pos };
}

// ---------------------------------------------------------------- plain text formatting
// No color codes unless --color is passed: makeStyler(false) (the default) returns
// identity functions so piping a report to a file never carries ANSI escapes.
export function makeStyler(enabled) {
  const wrap = (code) => (s) => (enabled ? '\x1b[' + code + 'm' + s + '\x1b[0m' : String(s));
  return {
    enabled: !!enabled,
    bold: wrap(1), dim: wrap(2), grey: wrap(90), red: wrap(31), green: wrap(32),
    yellow: wrap(33), blue: wrap(34), magenta: wrap(35), cyan: wrap(36),
  };
}

export function padRight(s, n) { s = String(s); return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length); }
export function padLeft(s, n) { s = String(s); return s.length >= n ? s.slice(0, n) : ' '.repeat(n - s.length) + s; }

// columns: [{ key, label, width, align: 'l'|'r' }]. rows: plain objects keyed by column key.
export function renderTable(columns, rows) {
  const pad = (s, w, align) => (align === 'r' ? padLeft(s, w) : padRight(s, w));
  const header = columns.map((c) => pad(c.label, c.width, c.align)).join('  ');
  const sep = columns.map((c) => '-'.repeat(c.width)).join('  ');
  const lines = rows.map((r) => columns.map((c) => pad(r[c.key] == null ? '' : String(r[c.key]), c.width, c.align)).join('  '));
  if (!rows.length) return [header, sep, '(none)'].join('\n');
  return [header, sep, ...lines].join('\n');
}

export function fmtNum(n, digits = 4) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return String(n);
  return Number.isInteger(n) ? String(n) : n.toFixed(digits);
}

// min / median / max of a numeric array. Returns null fields for an empty array rather
// than NaN, so a caller can print "n/a" instead of a broken number.
export function stats3(arr) {
  if (!arr.length) return { min: null, median: null, max: null, n: 0 };
  const s = [...arr].sort((a, b) => a - b);
  const mid = s.length >> 1;
  const median = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  return { min: s[0], median, max: s[s.length - 1], n: s.length };
}

export function section(title, ST) { return (ST ? ST.bold(title) : title) + '\n'; }
export function hr(w = 60) { return '-'.repeat(w); }
