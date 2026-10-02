#!/usr/bin/env node
// grow/pipeline.mjs: THE PIPELINE (contract c9). His words (2026-10-01 23:19Z, verbatim at the head of grow/NEO.md):
// "make sure they dont commit, they go through pipeline to do so, or make it more efficient for it to do it and to test
// if they are really posing higher measure/something all native to the model". Nothing the organism generates (cells,
// colonies, tasks, packs, a genome change, a macro) reaches a commit unless `promote` printed {"promoted":true,...}.
//   snapshot: the state BEFORE an era, cheap: every file under neo/ and grown/ as a content address (a blob copied once
//     into the store and reused while its bytes do not move) and the organism's own measures (held-out rows right in
//     total and per task, mastered colonies, the locked classes' mean). A snapshot still pending when the next one is
//     taken belongs to an era that never reached promote (a crash between steps): the tree is put back at it first.
//   promote: the state AFTER the era against the snapshot. RAISED: more held-out rows right in total, more mastered
//     colonies, or an evolve trial of this era kept on held-out rows measured by the engine (grow/evolve.mjs, c6). FELL:
//     fewer held-out rows right, fewer mastered, one task whose colony answers fewer held-out rows (or lost its colony),
//     the locked classes' mean lower (or not measurable after a change to what serves). Promoted only when something
//     rose and nothing fell; a tie is not promoted. Not promoted: every generated file is restored byte for byte from the
//     snapshot (a file the era added is removed), while the KEEP files (the counters, the search cursor, the logs) keep
//     what the era wrote, so the next era does not repeat the same search; neo/LEDGER.json is merged: the tasks the era
//     opened are restored away, its `generated` total and the cursor on every task it kept stay. The search cursors
//     (neo/ABSORB.json, neo/frontier.json, the registry neo/sources.json) move on: a source comes round again (a ring).
//     A file unchanged since the snapshot is compared by its bytes' hash before it is left alone (a restore is exact).
//   restore: put the tree back at the pending snapshot (the era calls it when promote did not answer).
//   status: the pending snapshot, the counts, the last decision.
// The store lives in <root>/work/grow/pipeline/ (work/ is runtime and never committed, like state/); the decisions are
// kept in neo/PIPELINE.json (a KEEP file). A held-out file (neo/tasks/*/heldout.jsonl) is never opened by this code: it
// is copied by path and compared by its size and times only. No model call, no network, zero dependencies (Node 22, 24).
// Success prints ONE JSON line; a failure one stderr line and a non-zero exit (1 failure, 2 usage).
//   node grow/pipeline.mjs snapshot [--era <n>] [--max-ms <n>] [--root <dir>]
//   node grow/pipeline.mjs promote  [--era <n>] [--max-ms <n>] [--root <dir>]
//   node grow/pipeline.mjs restore  [--era <n>] [--root <dir>]
//   node grow/pipeline.mjs status   [--root <dir>]
// Author: Opus 5.5 builder (THE ERA LOOP) for the Fable 5.1 orchestrator, 2026-10-02.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { colonies, patternRe, isObj, Fail } from './era.mjs';
import { lockedPart } from './measure.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const STORE = 'work/grow/pipeline';
export const PENDING = STORE + '/pending.json';
export const CACHE = STORE + '/cache.json';
export const LOCKED_CACHE = STORE + '/locked.json';
export const BLOBS = STORE + '/blobs';
export const PIPELINE_FILE = 'neo/PIPELINE.json';
export const LEDGER_FILE = 'neo/LEDGER.json';
export const TRIALS_FILE = 'neo/TRIALS.jsonl';
export const TOPS = Object.freeze(['neo', 'grown']);
/**
 * KEEP: the counters, the cursors and the logs. A restore never touches them (they keep what the era wrote) and the
 * 6-hourly record commit carries them. neo/LEDGER.json is merged (mergeLedger), not kept whole.
 */
export const KEEP = Object.freeze([
  'neo/ERA.json', 'neo/LEDGER.json', 'grown/measure.jsonl', 'neo/TRIALS.jsonl', 'neo/PIPELINE.json', 'neo/COMPUTE.json',
  'neo/requests.jsonl', 'neo/probes.jsonl', 'neo/MEASURE.json', 'neo/STOP', 'neo/ABSORB.json', 'neo/frontier.json',
  'neo/sources.json',
]);
/** The counters one record commit carries at most once every RECORD_MS when nothing was promoted (the brief's list). */
export const RECORD_PATHS = Object.freeze(['neo/ERA.json', 'neo/LEDGER.json', 'grown/measure.jsonl']);
export const RECORD_MS = 6 * 3600 * 1000;
/** Never opened: copied by path, compared by size and times. */
export const UNREAD = Object.freeze(['neo/tasks/*/heldout.jsonl']);
/** The files whose bytes decide what the organism answers end to end (the locked classes are measured again when they move). */
export const SERVING = Object.freeze([/^grown\//, /^neo\/know\//]);
/** Decisions kept in neo/PIPELINE.json. */
export const HISTORY = 50;
/** Locked measurements kept by fingerprint in the store. */
export const LOCKED_KEEP = 20;
export const DEFAULT_MS = 120000;
export const USAGE = [
  'usage: node grow/pipeline.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  snapshot [--era <n>] [--max-ms <n>]   the state before an era (a pending one is restored first)',
  '  promote  [--era <n>] [--max-ms <n>]   promoted only when a measure rose and none fell; else the generated files are restored',
  '  restore  [--era <n>]                  put the tree back at the pending snapshot',
  '  status                                the pending snapshot and the last decision',
].join('\n');

const keepRe = KEEP.map(patternRe), unreadRe = UNREAD.map(patternRe);
export const isKeep = (rel) => keepRe.some((re) => re.test(rel));
export const isUnread = (rel) => unreadRe.some((re) => re.test(rel));
const isServing = (rel) => rel !== 'grown/measure.jsonl' && SERVING.some((re) => re.test(rel));
const first = (e) => String((e && e.message) || e).split('\n')[0];
const abs = (root, rel) => path.join(root, ...rel.split('/'));
const sha1 = (b) => createHash('sha1').update(b).digest('hex');
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const isCount = (x) => Number.isInteger(x) && x >= 0;
/** Replace a file whole: written beside it, then renamed over it. */
export function writeAtomic(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.' + process.pid + '.' + Date.now().toString(36) + '.tmp';
  try { fs.writeFileSync(tmp, data); fs.renameSync(tmp, file); } finally { try { fs.rmSync(tmp, { force: true }); } catch { /* gone */ } }
}
const writeJson = (file, o) => writeAtomic(file, JSON.stringify(o, null, 2) + '\n');

// ---- the files of neo/ and grown/
/** Every regular file under neo/ and grown/ as posix paths relative to the root, sorted (symbolic links left out). */
export function listFiles(root) {
  const out = [];
  const walk = (rel) => {
    let ents;
    try { ents = fs.readdirSync(abs(root, rel), { withFileTypes: true }); } catch { return; }
    for (const d of ents) {
      const r = rel + '/' + d.name;
      if (d.isSymbolicLink()) continue;
      if (d.isDirectory()) walk(r); else if (d.isFile()) out.push(r);
    }
  };
  for (const t of TOPS) walk(t);
  return out.sort();
}
const statKey = (st) => st.size + ':' + st.mtimeMs + ':' + st.ctimeMs + ':' + st.ino;

/**
 * The content address of one file, its blob copied into the store when it is not there: a hash of its bytes, or for a
 * held-out file (never opened) a hash of its path and its size and times, the bytes copied by path. cache (rel -> { key,
 * blob }) skips a file whose size and times did not move. Returns { blob, key, copied } or null when it vanished.
 */
export function blobOf(root, rel, cache) {
  const f = abs(root, rel);
  let st;
  try { st = fs.statSync(f); } catch { return null; }
  const key = statKey(st), dir = abs(root, BLOBS);
  const c = cache[rel];
  if (c && c.key === key && fs.existsSync(path.join(dir, c.blob))) return { blob: c.blob, key, copied: 0 };
  fs.mkdirSync(dir, { recursive: true });
  let blob, copied = 0;
  if (isUnread(rel)) {
    blob = 'p-' + sha1(rel + '\n' + key);
    if (!fs.existsSync(path.join(dir, blob))) { fs.copyFileSync(f, path.join(dir, blob)); copied = st.size; }
  } else {
    let bytes;
    try { bytes = fs.readFileSync(f); } catch { return null; }
    blob = sha1(bytes);
    if (!fs.existsSync(path.join(dir, blob))) { writeAtomic(path.join(dir, blob), bytes); copied = bytes.length; }
  }
  cache[rel] = { key, blob };
  return { blob, key, copied };
}
const readCache = (root) => { const j = readJson(abs(root, CACHE)); return isObj(j) && isObj(j.files) ? j.files : {}; };
const writeCache = (root, files) => writeJson(abs(root, CACHE), { files });

/** The manifest of the tree now: { files: { rel: { blob, key } }, copied, bytes }. */
export function manifestOf(root, cache = readCache(root)) {
  const files = {};
  let copied = 0, bytes = 0;
  for (const rel of listFiles(root)) {
    const b = blobOf(root, rel, cache);
    if (!b) continue;
    files[rel] = { blob: b.blob, key: b.key };
    copied += b.copied;
    bytes += Number(b.key.split(':')[0]) || 0;
  }
  for (const k of Object.keys(cache)) if (!Object.hasOwn(files, k)) delete cache[k];
  return { files, copied, bytes, cache };
}
/** The fingerprint of what serves (grown/ but its measure log, neo/know/): a hash over their paths and blobs. */
export function servingFp(files) {
  const h = createHash('sha1');
  for (const rel of Object.keys(files).sort()) if (isServing(rel)) h.update(rel + '\0' + files[rel].blob + '\n');
  return h.digest('hex');
}

// ---- the measures
/**
 * The organism's own measures of the tree now: the NEO colonies of grown/index.json (ruler "colony": held-out rows
 * right in total and per task, mastered by the engine's rule) and the locked classes' mean (ruler "organism", by
 * fingerprint: measured again only when what serves moved). Null parts are named in blocked.
 */
export async function measuresOf(root, { files, deadline = null, locked = null, env = process.env, known = null } = {}) {
  const blocked = [];
  const cols = colonies(root);
  let heldout = null, tasks = null, mastered = null, colonyN = null;
  if (cols === null) blocked.push('grown/index.json is not JSON: the held-out rows cannot be counted');
  else {
    tasks = {};
    let ok = 0, n = 0;
    for (const [t, c] of cols) {
      const o = isCount(c.ok) ? c.ok : 0, k = isCount(c.n) ? c.n : 0;
      tasks[t] = [o, k];
      ok += o; n += k;
    }
    heldout = { ok, n };
    mastered = [...cols.values()].filter((c) => c.mastered).length;
    colonyN = cols.size;
  }
  const fp = servingFp(files);
  let lk = null;
  if (known && known.fp === fp) lk = { ...known.locked, carried: true };
  else {
    const cached = lockedCache(root).find((x) => x.fp === fp);
    if (cached) lk = { mean: cached.mean, classes: cached.classes, cached: true };
    else {
      const r = await (locked || ((rt, o) => lockedPart(rt, o)))(root, { env, deadline, jobs: 4 });
      const v = isObj(r) ? r.value : null;
      for (const b of isObj(r) && Array.isArray(r.blocked) ? r.blocked : []) blocked.push(String(b));
      lk = isObj(v) ? { mean: typeof v.mean === 'number' ? v.mean : null, classes: isCount(v.classes) ? v.classes : 0 } : { mean: null, classes: 0 };
      if (typeof lk.mean === 'number') saveLocked(root, { fp, mean: lk.mean, classes: lk.classes, at: new Date().toISOString() });
    }
  }
  return { heldout, tasks, mastered, colonies: colonyN, locked: lk, fp, blocked };
}
function lockedCache(root) { const j = readJson(abs(root, LOCKED_CACHE)); return isObj(j) && Array.isArray(j.entries) ? j.entries.filter((x) => isObj(x) && typeof x.fp === 'string' && typeof x.mean === 'number') : []; }
function saveLocked(root, entry) { try { writeJson(abs(root, LOCKED_CACHE), { entries: [...lockedCache(root).filter((x) => x.fp !== entry.fp), entry].slice(-LOCKED_KEEP) }); } catch { /* measured again next time */ } }

/** The trials of an era that the engine's measure kept (grow/evolve.mjs rows: kept true, not skipped). */
export function keptTrials(root, era) {
  if (!Number.isInteger(era)) return [];
  let text = '';
  try { text = fs.readFileSync(abs(root, TRIALS_FILE), 'utf8'); } catch { return []; }
  const out = [];
  for (const l of text.split(/\r?\n/)) {
    if (!l.trim()) continue;
    let j;
    try { j = JSON.parse(l); } catch { continue; }
    if (isObj(j) && j.era === era && j.kept === true && !j.skipped) out.push(j);
  }
  return out;
}

/**
 * The decision: raised (what rose), fell (what fell). Promoted only when raised is not empty and fell is.
 * gained: the tasks whose colony answers more held-out rows (a new colony too); regressed: fewer, or none any more.
 * @returns {{ promoted: boolean, why: string, raised: string[], fell: string[], gained: string[], regressed: string[] }}
 */
export function decide(before, after, trials = []) {
  const raised = [], fell = [];
  if (!before.heldout || !after.heldout) fell.push('the held-out rows could not be counted ' + (!before.heldout ? 'before' : 'after') + ' the era');
  else {
    if (after.heldout.ok > before.heldout.ok) raised.push('held-out rows right ' + before.heldout.ok + ' to ' + after.heldout.ok);
    if (after.heldout.ok < before.heldout.ok) fell.push('held-out rows right ' + before.heldout.ok + ' to ' + after.heldout.ok);
  }
  if (isCount(before.mastered) && isCount(after.mastered)) {
    if (after.mastered > before.mastered) raised.push('mastered ' + before.mastered + ' to ' + after.mastered);
    if (after.mastered < before.mastered) fell.push('mastered ' + before.mastered + ' to ' + after.mastered);
  }
  if (isObj(before.tasks) && isObj(after.tasks)) {
    for (const t of Object.keys(before.tasks).sort()) {
      const b = before.tasks[t], a = after.tasks[t];
      if (!a) fell.push('task ' + t + ' lost its colony (' + b[0] + ' of ' + b[1] + ' held-out rows right before)');
      else if (a[0] < b[0]) fell.push('task ' + t + ' regressed: ' + b[0] + ' to ' + a[0] + ' held-out rows right');
    }
  }
  const lb = before.locked, la = after.locked;
  if (isObj(lb) && typeof lb.mean === 'number' && before.fp !== after.fp) {
    if (!isObj(la) || typeof la.mean !== 'number') fell.push('the locked classes could not be measured after a change to what serves: a fall is not ruled out');
    else if (la.mean < lb.mean) fell.push('the locked classes mean ' + lb.mean + ' to ' + la.mean);
  }
  for (const t of trials) {
    const b = isObj(t.before) ? t.before.heldoutOk : null, a = isObj(t.after) ? t.after.heldoutOk : null;
    raised.push('trial ' + (t.kind || '?') + ' kept by the engine\'s measure' + (Number.isFinite(b) && Number.isFinite(a) ? ' (held-out ' + b + ' to ' + a + ' on its sample)' : '') + (t.why ? ': ' + t.why : ''));
  }
  const gained = [], regressed = [];
  if (isObj(before.tasks) && isObj(after.tasks)) {
    for (const t of Object.keys(after.tasks).sort()) { const b = before.tasks[t] ? before.tasks[t][0] : 0; if (after.tasks[t][0] > b) gained.push(t); }
    for (const t of Object.keys(before.tasks).sort()) if (!after.tasks[t] || after.tasks[t][0] < before.tasks[t][0]) regressed.push(t);
  }
  const promoted = raised.length > 0 && fell.length === 0;
  const why = promoted ? 'rose: ' + raised.join('; ') : fell.length ? 'fell: ' + fell.join('; ') : 'nothing rose (a tie is not promoted)';
  return { promoted, why, raised, fell, gained, regressed };
}

// ---- restore
/**
 * neo/LEDGER.json after a restore: the snapshot's tasks (the ones the era opened go), each kept entry as the era left
 * it when it is the same task (its cursor survives), the era's `generated` total and other keys. A side that is not
 * a ledger: the snapshot's bytes whole.
 */
export function mergeLedger(beforeText, afterText) {
  let b, a;
  try { b = JSON.parse(beforeText); } catch { return beforeText; }
  try { a = JSON.parse(afterText); } catch { return beforeText; }
  if (!isObj(b) || !Array.isArray(b.tasks) || !isObj(a) || !Array.isArray(a.tasks)) return beforeText;
  const tasks = b.tasks.map((r, i) => (isObj(r) && isObj(a.tasks[i]) && a.tasks[i].task === r.task ? a.tasks[i] : r));
  return JSON.stringify({ ...b, ...a, tasks, generated: Number.isFinite(a.generated) ? a.generated : b.generated }, null, 2) + '\n';
}
const blobPath = (root, blob) => path.join(abs(root, BLOBS), blob);
/**
 * Put every generated file back at the manifest: a changed file gets its snapshot bytes, a file the era added is
 * removed, a removed one comes back; KEEP files keep the era's bytes (neo/LEDGER.json merged). Each write is atomic.
 * @returns {{ restored: number, removed: number, merged: boolean, missing: string[] }}
 */
export function restoreTo(root, manifest, cache = readCache(root)) {
  let restored = 0, removed = 0, merged = false;
  const missing = [];
  const now = new Set(listFiles(root));
  for (const [rel, m] of Object.entries(manifest)) {
    const f = abs(root, rel);
    if (rel === LEDGER_FILE && now.has(rel)) {
      const src = blobPath(root, m.blob);
      if (!fs.existsSync(src)) { missing.push(rel); continue; }
      const text = mergeLedger(fs.readFileSync(src, 'utf8'), fs.readFileSync(f, 'utf8'));
      if (text !== fs.readFileSync(f, 'utf8')) { writeAtomic(f, text); merged = true; }
      continue;
    }
    if (isKeep(rel) && now.has(rel)) continue;
    let same = false;
    if (now.has(rel)) {
      try {
        const st = fs.statSync(f);
        same = isUnread(rel) ? statKey(st) === m.key : st.size === Number(m.key.split(':')[0]) && sha1(fs.readFileSync(f)) === m.blob;
      } catch { same = false; }
    }
    if (same) continue;
    const src = blobPath(root, m.blob);
    if (!fs.existsSync(src)) { missing.push(rel); continue; }
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const tmp = f + '.' + process.pid + '.restore.tmp';
    fs.copyFileSync(src, tmp);
    fs.renameSync(tmp, f);
    try { cache[rel] = { key: statKey(fs.statSync(f)), blob: m.blob }; } catch { delete cache[rel]; }
    restored++;
  }
  for (const rel of now) {
    if (Object.hasOwn(manifest, rel) || isKeep(rel)) continue;
    try { fs.rmSync(abs(root, rel), { force: true }); removed++; delete cache[rel]; } catch { missing.push(rel); }
  }
  pruneEmpty(root);
  return { restored, removed, merged, missing };
}
/** Remove the empty directories under neo/ and grown/ (never the two tops). */
function pruneEmpty(root) {
  const walk = (rel) => {
    let ents;
    try { ents = fs.readdirSync(abs(root, rel), { withFileTypes: true }); } catch { return false; }
    let empty = true;
    for (const d of ents) {
      if (d.isDirectory() && !d.isSymbolicLink()) { if (!walk(rel + '/' + d.name)) empty = false; } else empty = false;
    }
    if (empty && !TOPS.includes(rel)) { try { fs.rmdirSync(abs(root, rel)); } catch { return false; } }
    return empty;
  };
  for (const t of TOPS) walk(t);
}
/** Remove the blobs neither the cache nor the pending manifest names. */
function gcBlobs(root, cache, pending = null) {
  const live = new Set(Object.values(cache).map((c) => c.blob));
  if (isObj(pending) && isObj(pending.files)) for (const m of Object.values(pending.files)) live.add(m.blob);
  let names = [];
  try { names = fs.readdirSync(abs(root, BLOBS)); } catch { return 0; }
  let n = 0;
  for (const b of names) if (!live.has(b)) { try { fs.rmSync(path.join(abs(root, BLOBS), b), { force: true }); n++; } catch { /* next time */ } }
  return n;
}

// ---- neo/PIPELINE.json
export function readDecisions(root) {
  const j = readJson(abs(root, PIPELINE_FILE));
  const d = isObj(j) ? j : {};
  return { ...d, promotions: isCount(d.promotions) ? d.promotions : 0, restores: isCount(d.restores) ? d.restores : 0, history: Array.isArray(d.history) ? d.history : [] };
}
function record(root, row) {
  const d = readDecisions(root);
  const out = { ...d, promotions: d.promotions + (row.promoted ? 1 : 0), restores: d.restores + (row.promoted ? 0 : 1), last: row, history: [...d.history, row].slice(-HISTORY) };
  if (row.promoted) out.lastPromoted = { era: row.era, at: row.at };
  writeJson(abs(root, PIPELINE_FILE), out);
}
/** The commit the checkout stands on, read from .git by file (no git call); null when the root is not a checkout. */
const SHA = /^[0-9a-f]{40,64}$/;
export function headOf(root) {
  try {
    let dir = path.join(root, '.git');
    if (fs.statSync(dir).isFile()) {
      const m = /^gitdir:\s*(.+)$/m.exec(fs.readFileSync(dir, 'utf8'));
      if (!m) return null;
      dir = path.resolve(root, m[1].trim());
    }
    const head = fs.readFileSync(path.join(dir, 'HEAD'), 'utf8').trim();
    const ref = /^ref:\s*(.+)$/.exec(head);
    if (!ref) return SHA.test(head) ? head : null;
    let common = dir;
    try { common = path.resolve(dir, fs.readFileSync(path.join(dir, 'commondir'), 'utf8').trim()); } catch { /* not a worktree */ }
    for (const d of [dir, common]) { try { const v = fs.readFileSync(path.join(d, ...ref[1].trim().split('/')), 'utf8').trim(); if (SHA.test(v)) return v; } catch { /* packed */ } }
    for (const d of [dir, common]) {
      let text = '';
      try { text = fs.readFileSync(path.join(d, 'packed-refs'), 'utf8'); } catch { continue; }
      for (const l of text.split(/\r?\n/)) { const [sha, name] = l.trim().split(' '); if (name === ref[1].trim() && SHA.test(sha)) return sha; }
    }
    return null;
  } catch { return null; }
}
/** A pending snapshot taken on another commit than the checkout stands on now (a reset or a pull came between). */
const moved = (root, pend) => typeof pend.head === 'string' && pend.head !== headOf(root);
const readPending = (root) => { const j = readJson(abs(root, PENDING)); return isObj(j) && isObj(j.files) ? j : null; };
const brief = (m) => (m ? { heldout: m.heldout, mastered: m.mastered, colonies: m.colonies, locked: m.locked } : null);

// ---- the verbs
/** The deadline lockedPart reads: on the monotonic clock of grow/measure.mjs (process.hrtime in ms). */
const mono = () => Number(process.hrtime.bigint() / 1000000n);
const deadlineOf = (maxMs, t0) => (Number.isInteger(maxMs) && maxMs > 0 ? t0 + maxMs : null);
/**
 * snapshot: a pending snapshot is restored first (an era that never reached promote), then the tree's manifest and its
 * measures become the pending snapshot of this era.
 */
export async function snapshot(root, { era = null, maxMs = DEFAULT_MS, env = process.env, locked = null, now = () => new Date() } = {}) {
  const t0 = Date.now(), m0 = mono();
  const cache = readCache(root);
  let recovered = null;
  const old = readPending(root);
  if (old && moved(root, old)) recovered = { era: old.era ?? null, dropped: 'the checkout moved to another commit since it was taken: not restored' };
  else if (old) {
    const r = restoreTo(root, old.files, cache);
    recovered = { era: old.era ?? null, restored: r.restored, removed: r.removed, missing: r.missing.length };
  }
  if (old) {
    try { fs.rmSync(abs(root, PENDING), { force: true }); } catch { /* replaced below */ }
  }
  const m = manifestOf(root, cache);
  const meas = await measuresOf(root, { files: m.files, deadline: deadlineOf(maxMs, m0), locked, env });
  const at = now().toISOString();
  writeJson(abs(root, PENDING), { era, at, head: headOf(root), files: m.files, measures: { heldout: meas.heldout, tasks: meas.tasks, mastered: meas.mastered, colonies: meas.colonies, locked: meas.locked, fp: meas.fp } });
  writeCache(root, m.cache);
  return { snapshot: true, era, at, files: Object.keys(m.files).length, bytes: m.bytes, copied: m.copied, before: brief(meas), recovered, blocked: meas.blocked, ms: Date.now() - t0 };
}

/** promote: decide on the pending snapshot; restore the generated files when nothing rose or something fell. */
export async function promote(root, { era = null, maxMs = DEFAULT_MS, env = process.env, locked = null, now = () => new Date() } = {}) {
  const t0 = Date.now(), m0 = mono();
  const pend = readPending(root);
  if (!pend) throw new Fail('no pending snapshot in ' + PENDING + ': run `node grow/pipeline.mjs snapshot` before the era', 1);
  const e = Number.isInteger(era) ? era : Number.isInteger(pend.era) ? pend.era : null;
  const cache = readCache(root);
  const m = manifestOf(root, cache);
  const before = { ...pend.measures };
  const after = await measuresOf(root, { files: m.files, deadline: deadlineOf(maxMs, m0), locked, env, known: before.fp ? { fp: before.fp, locked: before.locked } : null });
  const trials = keptTrials(root, e);
  const d = decide(before, after, trials);
  let restored = null;
  if (!d.promoted) {
    const r = restoreTo(root, pend.files, m.cache);
    restored = { files: r.restored, removed: r.removed, ledger: r.merged, missing: r.missing };
  }
  const at = now().toISOString();
  const row = { at, era: e, promoted: d.promoted, why: d.why, raised: d.raised, fell: d.fell, before: brief(before), after: brief(after), restored };
  record(root, row);
  fs.rmSync(abs(root, PENDING), { force: true });
  writeCache(root, m.cache);
  gcBlobs(root, m.cache);
  return { promoted: d.promoted, why: d.why, before: brief(before), after: brief(after), raised: d.raised, fell: d.fell, gained: d.gained, regressed: d.regressed, era: e, restored, trials: trials.length, blocked: after.blocked, ms: Date.now() - t0 };
}

/** restore: the tree back at the pending snapshot (nothing pending: nothing to do). */
export function restore(root, { era = null, now = () => new Date() } = {}) {
  const t0 = Date.now();
  const pend = readPending(root);
  if (!pend) return { restored: 0, removed: 0, why: 'no pending snapshot', era, ms: Date.now() - t0 };
  if (moved(root, pend)) { fs.rmSync(abs(root, PENDING), { force: true }); return { restored: 0, removed: 0, why: 'the checkout moved to another commit since the snapshot: dropped, not restored', era: pend.era ?? null, ms: Date.now() - t0 }; }
  const cache = readCache(root);
  const r = restoreTo(root, pend.files, cache);
  record(root, { at: now().toISOString(), era: Number.isInteger(era) ? era : pend.era ?? null, promoted: false, why: 'restored: the era did not reach a decision', raised: [], fell: [], before: brief(pend.measures), after: null, restored: { files: r.restored, removed: r.removed, ledger: r.merged, missing: r.missing } });
  fs.rmSync(abs(root, PENDING), { force: true });
  writeCache(root, cache);
  gcBlobs(root, cache);
  return { restored: r.restored, removed: r.removed, ledger: r.merged, missing: r.missing, era: pend.era ?? null, ms: Date.now() - t0 };
}

/** status: the pending snapshot's era, the counts, the last decision, the store. */
export function status(root) {
  const d = readDecisions(root), p = readPending(root);
  let blobs = 0;
  try { blobs = fs.readdirSync(abs(root, BLOBS)).length; } catch { blobs = 0; }
  return { pending: p ? { era: p.era ?? null, at: p.at ?? null, files: Object.keys(p.files).length } : null, promotions: d.promotions, restores: d.restores, last: d.last || null, lastPromoted: d.lastPromoted || null, blobs };
}

// ---- arguments and main
const VERBS = Object.freeze({ snapshot: new Set(['era', 'max-ms', 'root']), promote: new Set(['era', 'max-ms', 'root']), restore: new Set(['era', 'root']), status: new Set(['root']) });
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (!['era', 'max-ms', 'root'].includes(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
const intFlag = (flags, name, lo) => {
  if (flags[name] === undefined) return null;
  const v = Number(flags[name]);
  if (!/^\d+$/.test(String(flags[name])) || !Number.isSafeInteger(v) || v < lo) throw new Fail('--' + name + ' is an integer from ' + lo + ', not ' + flags[name], 2);
  return v;
};
/** The CLI as a function: the printed object, or { usage: true }. */
export async function main(argv, env = process.env) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  if (!Object.hasOwn(VERBS, verb)) throw new Fail('unknown verb ' + verb + ': snapshot, promote, restore or status (--help)', 2);
  if (pos.length) throw new Fail('unexpected argument ' + pos[0] + ' (see --help)', 2);
  for (const k of Object.keys(flags)) if (!VERBS[verb].has(k)) throw new Fail('--' + k + ' is not a flag of ' + verb + ' (see --help)', 2);
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Fail('--root ' + flags.root + ' is not a directory', 2);
  const era = intFlag(flags, 'era', 0), maxMs = intFlag(flags, 'max-ms', 1) ?? DEFAULT_MS;
  if (verb === 'snapshot') return snapshot(root, { era, maxMs, env });
  if (verb === 'promote') return promote(root, { era, maxMs, env });
  if (verb === 'restore') return restore(root, { era });
  return status(root);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    const coded = e instanceof Fail;
    process.stderr.write(('pipeline: ' + (coded ? e.message : 'failed: ' + first(e))).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
