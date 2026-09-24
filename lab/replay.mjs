#!/usr/bin/env node
// lab/replay.mjs : DETERMINISTIC REPLAY. His manual: "The system should make it possible to
// pause computation, inspect state, replay events, compare versions, analyze connectivity,
// and reproduce experiments." Reproducing an experiment means this, exactly: take a
// snapshot plus the ledger written after it, run the same ticks again, and prove that the
// same events happened in the same order carrying the same bytes.
//
// What is compared, in order, and why each one is necessary:
//   the ledger sequence   every event type in the order the original run appended it
//   cell.run order        which cell ran on which tick, and how many signals it consumed
//   outputs               the content hash core/signal.mjs already stamps on every emitted
//                         signal, so "bit for bit" means the DATA, not just its shape
//   the fingerprint       simulate/clone.mjs stable() over cells, state, mailboxes and the
//                         whole connectome after the last tick
//
// Two numbers in a ledger event are not comparable across runs: `seq` itself (the reference
// window starts wherever the original brain's ledger had got to) and the seqs a cell.run
// lists in `consumed`. Both are normalized the same way in both streams: a seq that belongs
// to this window becomes its distance back from the event that names it, and a seq from
// before the window (an in-flight signal restored out of the snapshot, which carries its
// ORIGINAL seq in both runs) becomes the token 'pre'. Nothing else is touched, so a real
// divergence cannot hide inside the normalization.
//
// Usage: node lab/replay.mjs <dir> [--ticks N] [--json]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import '../cells/index.mjs'; // every cell kind, so any snapshot can deserialize
import { Brain } from '../core/brain.mjs';
import { fingerprint } from '../simulate/clone.mjs';
import { loadLedger, parseArgs } from '../tools/lib.mjs';

export const RECORD_FILE = 'replay.json';

// ---------------------------------------------------------------- recording
/**
 * Snapshot a brain, then run N ticks with the ledger on. The dir afterwards holds
 * everything replay() needs: snapshot.json, ledger/ledger.jsonl and replay.json.
 * The brain must have been constructed with `dir` (its ledger has to be on disk).
 * @param {Brain} brain @param {string} dir @param {object} [opts] { ticks }
 * @returns {object} the recording manifest
 */
export function record(brain, dir, { ticks = 100 } = {}) {
  if (!brain.ledger || !brain.ledger.file) throw new Error('lab/replay: record needs a brain with a file backed ledger (new Brain({ dir })), otherwise there is nothing to replay against');
  if (brain.ledgerLevel !== 'full') throw new Error('lab/replay: record needs ledger level "full", got "' + brain.ledgerLevel + '": a partial ledger cannot prove an order it did not write');
  mkdirSync(dir, { recursive: true });
  brain.snapshot(dir);
  const t0 = brain.clock.t;
  const seqAt = brain.ledger.seq;
  const coactAtSnapshot = brain.coact.counts.size; // what the snapshot just wrote, not what is left at the end
  brain.tick(ticks);
  brain.ledger.flush();
  const manifest = {
    version: 1,
    at: new Date().toISOString(),
    node: process.version,
    name: brain.name,
    t0, ticks, t1: brain.clock.t,
    baseSeq: seqAt,
    events: brain.ledger.seq - seqAt,
    // The brain is rebuilt from these, not from Brain's defaults: growth and pruning change
    // which structural proposals a tick makes, so replaying with other settings would be
    // replaying a different organism.
    options: {
      growth: { enabled: brain.coact.enabled, window: brain.coact.window, threshold: brain.coact.threshold, maxPairs: brain.coact.maxPairs, sampleBudget: brain.coact.sampleBudget },
      pruneEvery: brain.pruneEvery,
      hebbian: { ...brain.hebbian },
      connectomeCapacity: brain.connectome.cap ?? undefined,
    },
    // Co-activation counters ARE in snapshot.json now (core/brain.mjs writes coact beside the
    // connectome: notes/lab.md request 2, answered), so a recording taken part way to a growth
    // threshold replays structurally instead of growing a different organism. This is how many
    // pairs the snapshot carried, read off the brain at the moment it was written; replay()
    // reports how many came back, and the two have to agree.
    coactPending: coactAtSnapshot,
    coactAtEnd: brain.coact.counts.size,
    fingerprint: hashOf(fingerprint(brain)),
    stats: { ...brain.stats },
  };
  writeFileSync(path.join(dir, RECORD_FILE), JSON.stringify(manifest, null, 2));
  return manifest;
}

// ---------------------------------------------------------------- the reference stream
/**
 * The events the original run appended after its last snapshot, as written to disk.
 * @param {string} dir @param {object} [opts] { ticks }
 */
export function referenceStream(dir, { ticks = null } = {}) {
  const { file, events } = loadLedger(dir);
  if (!events.length) throw new Error('lab/replay: no ledger events under ' + dir + ' (record() writes them; a brain built without a dir keeps its ledger in memory only)');
  let base = -1;
  for (let i = events.length - 1; i >= 0; i--) if (events[i].type === 'snapshot') { base = i; break; }
  if (base < 0) throw new Error('lab/replay: no snapshot event in ' + file + ', so there is no point in the ledger to replay from');
  const t0 = events[base].t;
  let out = events.slice(base + 1);
  if (ticks != null) out = out.filter((e) => e.t < t0 + ticks);
  return { file, t0, base: events[base].seq, events: out };
}

// Normalize one event so it can be compared across two runs whose ledgers start at
// different seqs. `own` is the set of seqs that belong to this window.
export function normalizeEvent(ev, own) {
  const o = {};
  for (const k of Object.keys(ev).sort()) {
    if (k === 'seq') continue;
    if (k === 'consumed' && Array.isArray(ev.consumed)) { o.consumed = ev.consumed.map((s) => (own.has(s) ? ev.seq - s : 'pre')); continue; }
    if (k === 'from' && typeof ev.from === 'number') { o.from = own.has(ev.from) ? ev.seq - ev.from : 'pre'; continue; }
    if (k === 'dir') continue; // an absolute path is a property of the machine, not of the run
    o[k] = ev[k];
  }
  return o;
}
function lineOf(ev, own) { return JSON.stringify(normalizeEvent(ev, own)); }

// ---------------------------------------------------------------- replay
/**
 * Restore the snapshot in dir, re-run the same ticks, and assert every event matches.
 * Nothing is written: the replayed brain keeps its ledger in memory (dir: null), so
 * pointing this at a recording can never damage the recording.
 * @param {string} dir @param {object} [opts] { ticks, tamper }
 * @returns {object} { ok, compared, divergence, ... }
 */
export function replay(dir, opts = {}) {
  const manifest = readManifest(dir);
  const ticks = opts.ticks ?? manifest?.ticks ?? null;
  const ref = referenceStream(dir, { ticks });
  const brainOpts = { ledger: 'full', dir: null, ...(manifest?.options || {}), ...(opts.brainOptions || {}) };
  const t0 = performance.now();
  const brain = Brain.restore(dir, brainOpts);
  // The two ledgers line themselves up. core/brain.mjs writes the ledger seq into the snapshot
  // and Brain.restore continues from it (notes/lab.md request 3, answered), so the replayed
  // window starts at the seq the reference window started at and the original seqs carried by
  // restored in-flight signals normalize to 'pre' in both streams. This file used to set
  // brain.ledger.seq by hand here; that workaround is gone, and the alignment is now a
  // property of the snapshot rather than of this reader.
  const coactPending = brain.coact.counts.size; // measured on the restored brain, never assumed
  if (typeof opts.tamper === 'function') opts.tamper(brain);   // the test injects a divergence here
  const observed = [];
  const off = brain.ledger.on((e) => observed.push(e));
  const ranTicks = ticks ?? 0;
  brain.tick(ranTicks);
  off();
  const wallMs = performance.now() - t0;

  const refOwn = new Set(ref.events.map((e) => e.seq));
  const obsOwn = new Set(observed.map((e) => e.seq));
  const a = ref.events, b = observed;
  const n = Math.min(a.length, b.length);
  let divergence = null, compared = 0;
  for (let i = 0; i < n; i++) {
    const la = lineOf(a[i], refOwn), lb = lineOf(b[i], obsOwn);
    compared++;
    if (la !== lb) {
      divergence = {
        index: i,
        tick: b[i].t ?? a[i].t ?? null,
        cell: b[i].cell ?? a[i].cell ?? null,
        port: b[i].port ?? a[i].port ?? null,
        type: { expected: a[i].type, got: b[i].type },
        field: firstDiff(normalizeEvent(a[i], refOwn), normalizeEvent(b[i], obsOwn)),
        expected: normalizeEvent(a[i], refOwn),
        got: normalizeEvent(b[i], obsOwn),
      };
      break;
    }
  }
  if (!divergence && a.length !== b.length) {
    const short = a.length < b.length ? a : b;
    const long = a.length < b.length ? b : a;
    const e = long[short.length];
    divergence = {
      index: short.length,
      tick: e.t ?? null, cell: e.cell ?? null, port: e.port ?? null,
      type: { expected: a.length > b.length ? a[short.length].type : null, got: b.length > a.length ? b[short.length].type : null },
      field: a.length > b.length ? 'missing event' : 'extra event',
      expected: a.length > b.length ? normalizeEvent(a[short.length], refOwn) : null,
      got: b.length > a.length ? normalizeEvent(b[short.length], obsOwn) : null,
    };
  }

  const runsA = a.filter((e) => e.type === 'cell.run'), runsB = b.filter((e) => e.type === 'cell.run');
  const sigA = a.filter((e) => e.type === 'signal'), sigB = b.filter((e) => e.type === 'signal');
  const fp = hashOf(fingerprint(brain));
  const fingerprintMatch = manifest && manifest.fingerprint ? manifest.fingerprint === fp : null;
  return {
    dir: path.resolve(dir), ticks: ranTicks, wallMs: Math.round(wallMs * 1000) / 1000,
    referenceEvents: a.length, replayedEvents: b.length, compared,
    cellRuns: { reference: runsA.length, replayed: runsB.length },
    signals: { reference: sigA.length, replayed: sigB.length },
    runOrderMatch: sameRunOrder(runsA, runsB),
    outputHashesMatch: sameHashes(sigA, sigB),
    coactPending, recordedCoactPending: manifest ? (manifest.coactPending ?? null) : null,
    coactMatch: manifest && Number.isFinite(manifest.coactPending) ? manifest.coactPending === coactPending : null,
    ledgerSeqAtStart: ref.events.length ? ref.events[0].seq : null,
    fingerprint: fp, recordedFingerprint: manifest ? manifest.fingerprint : null, fingerprintMatch,
    divergence,
    ok: divergence === null && a.length === b.length && fingerprintMatch !== false,
  };
}

function sameRunOrder(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i].t !== b[i].t || a[i].cell !== b[i].cell || a[i].nin !== b[i].nin) return false;
  return true;
}
function sameHashes(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i].hash !== b[i].hash || a[i].kind !== b[i].kind || a[i].port !== b[i].port) return false;
  return true;
}
function firstDiff(x, y) {
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
    if (JSON.stringify(x[k]) !== JSON.stringify(y[k])) return k;
  }
  return null;
}
function readManifest(dir) {
  const f = path.join(dir, RECORD_FILE);
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
}
function hashOf(s) {
  // A 128 bit FNV-1a over the stable encoding. Zero dependencies, and node:crypto is not
  // needed for an equality check on a string this file produced itself.
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    h1 = (h1 ^ s.charCodeAt(i)) >>> 0; h1 = Math.imul(h1, 16777619) >>> 0;
    h2 = (h2 + s.charCodeAt(i) * (i + 1)) >>> 0; h2 = Math.imul(h2, 2654435761) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0') + ':' + s.length;
}

/** Plain text for one replay result. */
export function renderReplay(r) {
  const L = [];
  L.push('replay ' + r.dir);
  L.push('  ticks              ' + r.ticks + '   ' + r.wallMs + ' ms');
  L.push('  ledger events      reference ' + r.referenceEvents + '   replayed ' + r.replayedEvents + '   compared ' + r.compared);
  L.push('  cell.run order     reference ' + r.cellRuns.reference + '   replayed ' + r.cellRuns.replayed + '   identical ' + r.runOrderMatch);
  L.push('  signal outputs     reference ' + r.signals.reference + '   replayed ' + r.signals.replayed + '   hashes identical ' + r.outputHashesMatch);
  L.push('  coactivation       pairs restored ' + r.coactPending + '   recorded ' + r.recordedCoactPending + '   match ' + r.coactMatch);
  L.push('  fingerprint        ' + r.fingerprint + (r.recordedFingerprint ? '   recorded ' + r.recordedFingerprint + '   match ' + r.fingerprintMatch : '   (no recording manifest)'));
  if (r.divergence) {
    const d = r.divergence;
    L.push('  DIVERGENCE at event ' + d.index + '   tick ' + d.tick + '   cell ' + d.cell + '   port ' + d.port + '   field ' + d.field);
    L.push('    expected ' + JSON.stringify(d.expected));
    L.push('    got      ' + JSON.stringify(d.got));
  } else {
    L.push('  no divergence: the ledger sequence, the cell.run order and every output hash match bit for bit');
  }
  L.push('  VERDICT ' + (r.ok ? 'DETERMINISTIC' : 'DIVERGED'));
  return L.join('\n');
}

// ---------------------------------------------------------------- CLI
async function main(argv) {
  const { opts, pos } = parseArgs(argv, ['json', 'help']);
  if (opts.help || !pos.length) {
    process.stdout.write([
      'usage: node lab/replay.mjs <dir> [--ticks N] [--json]',
      '',
      '  <dir>     a state dir holding snapshot.json, ledger/ledger.jsonl and (optionally) replay.json',
      '  --ticks   how many ticks to replay; defaults to the recorded count',
      '  --json    print the full result as JSON',
    ].join('\n') + '\n');
    return opts.help ? 0 : 1;
  }
  const r = replay(pos[0], { ticks: opts.ticks === undefined ? undefined : Number(opts.ticks) });
  process.stdout.write((opts.json ? JSON.stringify(r, null, 2) : renderReplay(r)) + '\n');
  return r.ok ? 0 : 1;
}
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main(process.argv.slice(2)).then((c) => process.exit(c)).catch((e) => { process.stderr.write('replay: ' + (e && e.message || e) + '\n'); process.exit(2); });
