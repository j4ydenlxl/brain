// cli/state.mjs: WHERE A BRAIN LIVES ON DISK. One directory per named brain:
//
//   <root>/<name>/snapshot.json            the live snapshot (Brain.snapshot writes this name)
//   <root>/<name>/snapshots/<label>.json   labelled snapshots, for replay and diff
//   <root>/<name>/ledger/ledger.jsonl      the append only event log (core/ledger.mjs writes this)
//   <root>/<name>/control.json             host, port and token of a running brain
//   <root>/<name>/meta.json                seed, creation time, node version
//
// <root> is brain/state by default and $BRAIN_STATE_DIR when set, which is how the tests
// keep every run inside a temp directory.
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, copyFileSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CLI_DIR = path.dirname(fileURLToPath(import.meta.url));
export const BRAIN_ROOT = path.resolve(CLI_DIR, '..');

const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export function stateRoot() {
  const env = process.env.BRAIN_STATE_DIR;
  return env && env.trim() ? path.resolve(env.trim()) : path.join(BRAIN_ROOT, 'state');
}

export function checkName(name, what = 'brain name') {
  if (!name || !NAME_RE.test(name)) throw new Error(what + ' must match ' + NAME_RE.source + ', got ' + JSON.stringify(name ?? null));
  return name;
}

export function layout(name) {
  checkName(name);
  const dir = path.join(stateRoot(), name);
  return {
    name, dir, root: stateRoot(),
    snapshot: path.join(dir, 'snapshot.json'),
    snapshotsDir: path.join(dir, 'snapshots'),
    labelled: (label) => path.join(dir, 'snapshots', checkName(label, 'label') + '.json'),
    ledgerDir: path.join(dir, 'ledger'),
    ledger: path.join(dir, 'ledger', 'ledger.jsonl'),
    control: path.join(dir, 'control.json'),
    meta: path.join(dir, 'meta.json'),
  };
}

export function ensureDirs(name) {
  const L = layout(name);
  mkdirSync(L.dir, { recursive: true });
  mkdirSync(L.snapshotsDir, { recursive: true });
  mkdirSync(L.ledgerDir, { recursive: true });
  return L;
}

export function brainExists(name) { return existsSync(layout(name).snapshot); }

export function listBrains() {
  const root = stateRoot();
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && NAME_RE.test(d.name) && existsSync(path.join(root, d.name, 'snapshot.json')))
    .map((d) => {
      const L = layout(d.name);
      const s = statSync(L.snapshot);
      return { name: d.name, bytes: s.size, saved: s.mtime.toISOString(), live: existsSync(L.control) };
    });
}

export function listLabels(name) {
  const L = layout(name);
  if (!existsSync(L.snapshotsDir)) return [];
  return readdirSync(L.snapshotsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const p = path.join(L.snapshotsDir, f);
      const s = statSync(p);
      return { label: f.slice(0, -5), bytes: s.size, saved: s.mtime.toISOString(), file: p };
    })
    .sort((a, b) => (a.saved < b.saved ? 1 : -1));
}

// Copy the live snapshot to snapshots/<label>.json. Nothing in core writes labelled files,
// so the label is a copy of what Brain.snapshot() just produced.
export function saveLabel(name, label) {
  const L = ensureDirs(name);
  if (!existsSync(L.snapshot)) throw new Error('no snapshot to label at ' + L.snapshot);
  const dest = L.labelled(label);
  copyFileSync(L.snapshot, dest);
  return dest;
}

// Resolve a snapshot reference: a label, or "live"/"snapshot"/"current" for snapshot.json.
export function resolveSnapshotFile(name, ref) {
  const L = layout(name);
  if (ref === 'live' || ref === 'current' || ref === 'snapshot') return L.snapshot;
  const f = L.labelled(ref);
  if (!existsSync(f)) throw new Error('no labelled snapshot "' + ref + '" (have: ' + (listLabels(name).map((l) => l.label).join(', ') || 'none') + ')');
  return f;
}

export function readJSON(file, dflt = null) {
  if (!existsSync(file)) return dflt;
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return dflt; }
}
export function writeJSON(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
  return file;
}
export function readMeta(name) { return readJSON(layout(name).meta, {}); }
export function writeMeta(name, meta) { return writeJSON(layout(name).meta, meta); }

// ---------------------------------------------------------------- the brain itself
// Cell kinds must be registered before a snapshot can be deserialized, so cells/all.mjs is
// imported first: cells/basic.mjs alone left `brain status whole` throwing on the first
// substrate, phv, memory, mind, world or solve cell in the snapshot (notes/whole.md request
// 2). Read only commands load with ledger 'off' so that merely looking at a brain never
// writes an event; mutating commands load with 'full' and flush before exit.
export async function loadBrain(name, { ledger = 'off' } = {}) {
  const L = layout(name);
  if (!existsSync(L.snapshot)) throw new Error('no brain "' + name + '" at ' + L.dir + ' (run: brain init ' + name + ')');
  await import('../cells/all.mjs');
  const { Brain } = await import('../core/brain.mjs');
  return Brain.restore(L.dir, { ledger });
}

export async function loadBrainFromFile(file, dir, { ledger = 'off' } = {}) {
  mkdirSync(dir, { recursive: true });
  copyFileSync(file, path.join(dir, 'snapshot.json'));
  await import('../cells/all.mjs');
  const { Brain } = await import('../core/brain.mjs');
  return Brain.restore(dir, { ledger });
}

// Persist and make durable in one step: the ledger buffers up to flushEvery events in memory,
// so a CLI process that exits without flushing would silently lose its own provenance.
export function saveBrain(brain, name) {
  const L = ensureDirs(name);
  const file = brain.snapshot(L.dir);
  brain.ledger.flush();
  return file;
}

// ---------------------------------------------------------------- the ledger on disk
// The in memory ring is empty in a fresh CLI process, so trace and ledger read the JSONL.
export function readLedgerFile(name, { max = 200_000, tailBytes = 64 * 1024 * 1024 } = {}) {
  const L = layout(name);
  if (!existsSync(L.ledger)) return [];
  // only the tail of the file is read: the soak's ledger passed 1 GB by t=1300 (2026-09-17),
  // and reading all of it as one string throws at V8's cap ("Cannot create a string longer
  // than 0x1fffffe8 characters"), which took brain status down with it
  const size = statSync(L.ledger).size;
  const from = Math.max(0, size - tailBytes);
  const fd = openSync(L.ledger, 'r');
  let text;
  try {
    const buf = Buffer.allocUnsafe(size - from);
    let got = 0;
    while (got < buf.length) { const n = readSync(fd, buf, got, buf.length - got, from + got); if (n <= 0) break; got += n; }
    text = buf.toString('utf8', 0, got);
  } finally { closeSync(fd); }
  const lines = text.split('\n');
  if (from > 0) lines.shift(); // the line the tail window cut into
  if (lines.length && lines[lines.length - 1] === '') lines.pop(); // the newline that ends the file, or max counts one event short
  const out = [];
  for (let i = Math.max(0, lines.length - max); i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    try { out.push(JSON.parse(line)); } catch { /* a torn last line from a killed process */ }
  }
  return out;
}
export function ledgerIndex(events) {
  const m = new Map();
  for (const e of events) m.set(e.seq, e);
  return m;
}
export function ledgerCounts(events) {
  const c = {};
  for (const e of events) c[e.type] = (c[e.type] || 0) + 1;
  return Object.fromEntries(Object.entries(c).sort());
}
