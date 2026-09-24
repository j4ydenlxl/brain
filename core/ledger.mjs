// core/ledger.mjs: OBSERVABILITY. Append-only event log: every cell run, edge op,
// proposal, decision. Each event gets a seq. Cell runs record the seqs of the signals
// they consumed, so `trace(seq)` walks upstream and names exactly which cells, edges,
// memories and predictions contributed to a result. JSONL on disk, ring in memory.
//
// WHAT REACHES THE DISK is a policy of the ledger, separate from what the brain logs
// (Brain.ledgerLevel decides which events exist at all; the ring always holds them):
//
//   full     every event is one JSONL line, as it always was. The 12 major organism wrote
//            99,403,450 bytes per 1000 ticks this way (2026-09-23 probe, notes/daemon.md), and
//            an unbounded soak once wrote a 1 TB ledger.jsonl. So a full ledger may carry a
//            BUDGET: past budgetBytes / 2 the file rotates to ledger.1.jsonl (the older
//            segment is deleted), so the two segments kept on disk never pass the budget.
//   summary  events stay in the ring, the counts and the listeners, and never become lines.
//            The file receives only (a) rows written through note(), which are real events
//            with their own seq, and (b) at every flush(), one 'ledger.counts' row: the seq
//            range it covers and how many events of each type arrived in it. A summary
//            ledger rotates at its budget too, so a daemon that lives for months stays bounded.
//
// The policy comes from the constructor, or from setLedgerPolicy(dir, ...) registered
// before a Brain builds its ledger in that directory (the Brain constructor passes only the
// directory), or from configure() on a live ledger. The default is 'full' with no budget:
// every caller that never asks behaves exactly as before.
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, openSync, readSync, closeSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';

export const LEDGER_MODES = Object.freeze(['full', 'summary']);
export const COUNTS_TYPE = 'ledger.counts';

const POLICIES = new Map();
const policyKey = (dir) => path.resolve(dir).toLowerCase();
/**
 * Register the disk policy a ledger created in `dir` will take. Keyed by the resolved
 * directory (lower case: this disk is not case sensitive), so it reaches exactly one brain.
 * @param {string} dir the ledger directory (<state>/<name>/ledger)
 * @param {{mode?: 'full'|'summary', budgetBytes?: number}} policy
 */
export function setLedgerPolicy(dir, policy) {
  if (!dir) return;
  if (policy && policy.mode && !LEDGER_MODES.includes(policy.mode)) throw new Error('ledger: mode must be one of ' + LEDGER_MODES.join(', ') + ', got ' + policy.mode);
  POLICIES.set(policyKey(dir), { ...policy });
}
export function clearLedgerPolicy(dir) { if (dir) POLICIES.delete(policyKey(dir)); }
export function ledgerPolicy(dir) { return dir ? POLICIES.get(policyKey(dir)) || null : null; }

/** The older segment a rotation keeps beside the live file. */
export function previousSegment(file) { return file.replace(/\.jsonl$/, '') + '.1.jsonl'; }

export class Ledger {
  constructor({ dir = null, ring = 100_000, flushEvery = 2000, mode = null, budgetBytes = null } = {}) {
    this.dir = dir;
    this.file = dir ? path.join(dir, 'ledger.jsonl') : null;
    this.seq = 0;
    this.ring = new Array(ring); this.ringSize = ring;
    this.buffer = []; this.flushEvery = flushEvery;
    this.counts = new Map();
    this.listeners = new Set();
    const pol = ledgerPolicy(dir);
    this.mode = mode || (pol && pol.mode) || 'full';
    if (!LEDGER_MODES.includes(this.mode)) throw new Error('ledger: mode must be one of ' + LEDGER_MODES.join(', ') + ', got ' + this.mode);
    this.budgetBytes = Math.max(0, Number(budgetBytes ?? (pol && pol.budgetBytes) ?? 0) || 0);
    this.bytesWritten = 0; this.linesWritten = 0; this.rotations = 0; this.rotateErrors = 0; this.lastRotateError = null;
    this.fileBytes = 0; this.prevBytes = 0;
    this.summarySeq = 0; this.summaryCounts = new Map(); this.appendsSince = 0;
    if (this.file) {
      mkdirSync(dir, { recursive: true });
      // resume seq from the last line, read from the file's tail: the whole file is never
      // one string (the soak's ledger passed 1 GB on 2026-09-17, past V8's string cap, and
      // the restore threw here before the organism was even read). A file emptied by a
      // rotation resumes from the segment the rotation kept.
      const size = existsSync(this.file) ? statSync(this.file).size : 0;
      this.fileBytes = size;
      let last = size ? lastLine(this.file) : '';
      const prev = previousSegment(this.file);
      if (!last && existsSync(prev)) last = lastLine(prev);
      if (last) { try { this.seq = JSON.parse(last).seq + 1; } catch {} }
      this.prevBytes = existsSync(prev) ? statSync(prev).size : 0;
    }
    // the high-water mark of both segments together, taken after every write: the number a
    // budget is proved against, measured where the bytes are written rather than sampled
    this.maxDiskBytes = this.fileBytes + this.prevBytes;
    this.summarySeq = this.seq;
  }

  /** Change the disk policy of a live ledger. Summary mode drops pending full lines: they are counted, not written. */
  configure({ mode, budgetBytes } = {}) {
    if (mode !== undefined) {
      if (!LEDGER_MODES.includes(mode)) throw new Error('ledger: mode must be one of ' + LEDGER_MODES.join(', ') + ', got ' + mode);
      if (mode === 'summary' && this.mode === 'full') { this.buffer = this.buffer.filter((s) => s.startsWith('{"seq":') && s.includes('"note":true')); }
      this.mode = mode;
    }
    if (budgetBytes !== undefined) this.budgetBytes = Math.max(0, Number(budgetBytes) || 0);
    return this.stats();
  }

  append(ev) {
    const e = { seq: this.seq++, ...ev };
    this.ring[e.seq % this.ringSize] = e;
    this.counts.set(e.type, (this.counts.get(e.type) || 0) + 1);
    this.appendsSince++;
    if (this.file && this.mode === 'full') { this.buffer.push(JSON.stringify(e)); if (this.buffer.length >= this.flushEvery) this._drain(); }
    for (const fn of this.listeners) { try { fn(e); } catch {} }
    return e.seq;
  }

  /**
   * A summary row: a real event (seq, ring, counts, listeners) that is written to the file
   * whatever the mode. The daemon's step and checkpoint lines go through here.
   */
  note(ev) {
    const e = { seq: this.seq++, ...ev, note: true };
    this.ring[e.seq % this.ringSize] = e;
    this.counts.set(e.type, (this.counts.get(e.type) || 0) + 1);
    if (this.file) { this.buffer.push(JSON.stringify(e)); if (this.buffer.length >= this.flushEvery) this._drain(); }
    for (const fn of this.listeners) { try { fn(e); } catch {} }
    return e.seq;
  }

  flush() {
    if (!this.file) return;
    // a counts row only when events other than notes arrived: a flush right after a flush, or
    // after nothing but the daemon's own rows, writes nothing
    if (this.mode === 'summary' && this.appendsSince > 0) {
      const delta = {};
      for (const [k, v] of this.counts) { const d = v - (this.summaryCounts.get(k) || 0); if (d > 0) delta[k] = d; }
      const from = this.summarySeq, to = this.seq - 1;
      this.summaryCounts = new Map(this.counts);
      this.note({ type: COUNTS_TYPE, from, to, events: to - from + 1, counts: delta });
      this.summaryCounts.set(COUNTS_TYPE, this.counts.get(COUNTS_TYPE));
      this.summarySeq = this.seq; this.appendsSince = 0;
    }
    this._drain();
  }

  // write the buffered lines, rotating at the segment boundary: with a budget the lines are
  // packed into chunks that each fit what is left of the live segment, so one large drain
  // (the brain flushes 2000 lines at a time) can never carry a segment past half the budget.
  // A single line longer than a whole segment is written alone and is the only overshoot.
  _drain() {
    if (!this.file || !this.buffer.length) return;
    const all = this.buffer;
    this.buffer = [];
    const seg = this.budgetBytes > 0 ? Math.floor(this.budgetBytes / 2) : 0;
    if (!seg) { this._write(all); return; }
    let chunk = [], chunkBytes = 0;
    for (let i = 0; i < all.length; i++) {
      const lb = Buffer.byteLength(all[i]) + 1;
      if (this.fileBytes + chunkBytes + lb > seg && (chunkBytes > 0 || this.fileBytes > 0)) {
        if (chunk.length) { this._write(chunk, chunkBytes); chunk = []; chunkBytes = 0; }
        if (this.fileBytes > 0) {
          const before = this.rotations;
          this._rotate();
          // a rotation Windows refused: write the rest of this drain and try again next drain
          if (this.rotations === before) { this._write(all.slice(i)); return; }
        }
      }
      chunk.push(all[i]); chunkBytes += lb;
    }
    if (chunk.length) this._write(chunk, chunkBytes);
  }

  _write(lines, bytes = null) {
    const text = lines.join('\n') + '\n';
    const n = bytes ?? Buffer.byteLength(text);
    appendFileSync(this.file, text);
    this.fileBytes += n; this.bytesWritten += n; this.linesWritten += lines.length;
    if (this.fileBytes + this.prevBytes > this.maxDiskBytes) this.maxDiskBytes = this.fileBytes + this.prevBytes;
  }

  _rotate() {
    const prev = previousSegment(this.file);
    try {
      rmSync(prev, { force: true });
      renameSync(this.file, prev);
      this.prevBytes = this.fileBytes; this.fileBytes = 0; this.rotations++;
    } catch (e) {
      // a reader holding the file (Windows refuses the rename) costs one rotation, never a line:
      // the next drain tries again
      this.rotateErrors++; this.lastRotateError = String(e && e.message || e).split('\n')[0];
    }
  }

  /** The disk side of the ledger, as measured. */
  stats() {
    let prevBytes = 0;
    if (this.file) { try { const p = previousSegment(this.file); prevBytes = existsSync(p) ? statSync(p).size : 0; } catch {} }
    return {
      mode: this.mode, budgetBytes: this.budgetBytes, file: this.file, fileBytes: this.fileBytes, previousBytes: prevBytes,
      diskBytes: this.fileBytes + prevBytes, maxDiskBytes: this.maxDiskBytes, bytesWritten: this.bytesWritten, linesWritten: this.linesWritten,
      rotations: this.rotations, rotateErrors: this.rotateErrors, lastRotateError: this.lastRotateError, seq: this.seq,
    };
  }

  get(seq) {
    const e = this.ring[seq % this.ringSize];
    if (e && e.seq === seq) return e;
    if (!this.file) return null;
    this._drain();
    if (!existsSync(this.file)) return null;
    for (const line of readFileSync(this.file, 'utf8').split('\n')) {
      if (!line) continue;
      const j = JSON.parse(line);
      if (j.seq === seq) return j;
    }
    return null;
  }
  recent(n = 50, type = null) {
    const out = [];
    for (let s = this.seq - 1; s >= 0 && out.length < n; s--) {
      const e = this.ring[s % this.ringSize];
      if (!e || e.seq !== s) break;
      if (!type || e.type === type) out.push(e);
    }
    return out.reverse();
  }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  // Walk upstream: a cell.run event lists the seqs of the signal events it consumed;
  // each signal event names the emitting cell.run seq. Depth-limited, deduplicated.
  trace(seq, depth = 8) {
    const seen = new Set(), nodes = [], edges = [];
    const visit = (s, d) => {
      if (d > depth || seen.has(s)) return;
      seen.add(s);
      const e = this.get(s);
      if (!e) return;
      nodes.push(e);
      const parents = e.consumed || (e.from != null ? [e.from] : []);
      for (const p of parents) { edges.push([p, s]); visit(p, d + 1); }
    };
    visit(seq, 0);
    return { root: seq, nodes, edges };
  }
  summary() { return Object.fromEntries([...this.counts].sort()); }
  serialize() { this.flush(); return { seq: this.seq, counts: this.summary() }; }
}

// the last newline-terminated line of a file, read from its tail only (256 KB), so that a
// ledger of any size costs one small read to resume
function lastLine(file, tail = 1 << 18) {
  const size = statSync(file).size;
  if (!size) return '';
  const from = Math.max(0, size - tail);
  const fd = openSync(file, 'r');
  let text;
  try {
    const buf = Buffer.allocUnsafe(size - from);
    let got = 0;
    while (got < buf.length) { const n = readSync(fd, buf, got, buf.length - got, from + got); if (n <= 0) break; got += n; }
    text = buf.toString('utf8', 0, got);
  } finally { closeSync(fd); }
  let end = text.length;
  while (end > 0 && (text[end - 1] === '\n' || text[end - 1] === '\r')) end--;
  const i = text.lastIndexOf('\n', end - 1);
  return text.slice(i + 1, end).trim();
}
