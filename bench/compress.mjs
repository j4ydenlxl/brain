// bench/compress.mjs: SELF COMPRESSING, MEASURED (his P5 of 2026-09-23). Board 10 built the binary
// checkpoint container; Board 12 (item delta) adds DELTA CHECKPOINTS (core/checkpoint-delta.mjs)
// and PACKED HYPERVECTORS (core/pack.mjs PackedHVStore) and measures three things in one run.
//
// 1. THE DAEMON, 60 s twice (the bar). The daemon's bar organism (12 majors, 10000 substrate units,
//    a checkpoint every 1000 ticks, ledger summary, no model calls: bench/daemon.mjs phase A) runs
//    in this process for 60 s of wall time writing Board 10's full container 2 checkpoints, then
//    again, built fresh, for 60 s writing a delta chain (a full every 20 deltas, the SHA-1 of
//    every document recorded). Printed for each: every byte its checkpoints wrote (the checkpoint
//    at build and the final one included) over the ticks it ran, and the ratio of the two; then
//    the same ratio over only the checkpoints both arms wrote at the same tick. The chain the
//    second arm leaves is read back and every link verified, the last against the SHA-1 of the
//    document its writer was handed.
//
// 2. THE ORGANISM (Board 10's method, kept, with the chain added). One whole organism is built,
//    ticked, and checkpointed at every ruler row and at the end as
//
//   v1     container 1, the JSON checkpoint the writer emitted before Board 10: snapshot.json as
//          text, document version 3 with the format 4 blob table (core/persist.mjs). Printed
//          beside it, "v1 plain": the same organism as a document version 2 JSON file with no
//          table, the shape state/soak/snapshot.json has on this machine.
//   v2     container 2, the binary checkpoint (core/persist.mjs writeCheckpoint): a small JSON
//          header, every hypervector one bit per lane and held once, edges and cell state as
//          typed arrays, one CRC32 per section.
//   chain  a delta chain in its own directory, one link per ruler row: a full container 2 file at
//          the first row, then deltas holding only what changed (core/checkpoint-delta.mjs).
//
// Printed: the bytes of each, the ratio, and the median of three rounds (the order rotated each
// round) of write ms, read ms (the file back into its document) and restore ms (restoreWhole, the
// whole organism back). The chain's document is compared with v2's section by section.
//
// THE REPLAY. The live organism and the three restored ones then run 200 ticks IN LOCKSTEP, tick
// k of each before tick k+1 of any, while questions of the three answer suites (algebra,
// sequence, grid, drawn by bench/answer.mjs buildQuestions) are injected at ask.in on a fixed
// schedule and cross the organism's own ask region. Every tick of every organism is reduced to
// one digest: the clock, the run, signal, delivery, growth, prune, error and refusal counters,
// the edge count, the signals in flight, the cells that fired in order, every signal it put in
// its outbox (kind, source, port, payload hash), and the answer ask.verify holds. Wall time is
// an INPUT to this organism (world.clock emits it as an event; the ask region stamps it), so for
// the replay Date.now is held to one value per lockstep tick and every organism is fed the same
// one. Memory systems are a process global registry keyed by name (memory/index.mjs
// registerMemorySystem) and a restored organism keeps the name it came from, so organisms in one
// process would otherwise share whichever store registered last (measured: two restored
// organisms' mem.episodic lastId ended 8 apart); each organism's own store is registered before
// each of its steps, as it would be alone in its own process. The mind model is shared too, and
// is read only here (installLanguage learn false). Nothing else is controlled. Identity is
// claimed tick by tick, and the answers are compared question by question (text, provenance,
// method, the tick it arrived).
//
// THE RULER. bytes per score point = checkpoint bytes / summed suite score, where the score is
// the number of correct answers on a fixed draw of the three suites (10 per suite, the suites'
// own seeds) asked on the exact path (act/prompt.mjs ask, provider 'null', route 'direct', so no
// model and no network). It is printed at every checkpoint row with the organism's generated
// lines (genome/emit.mjs emitOrganism, written to a temp dir and counted) and cells. v2 and the
// chain head carry it in their headers, where readCheckpointHeader() reads it without the body.
// For the chain, "bytes" is what that checkpoint WROTE (one delta link plus the head); the head
// also carries chainBytes, every file a restore reads, and both are printed.
//
// 3. THE PACKED TIERS. Bipolar 8192 lane keys held as Int8 lanes take 8192 bytes a key; packed one
//    bit a lane they take 1024. The tiers that compare keys only by their dot product (which on
//    bipolar keys is lanes minus twice the Hamming distance) are memory.assoc (cells/basic.mjs:
//    the first strict maximum of sim over every key) and the episodic store (memory/episodic.mjs:
//    sampled sign bands propose candidates, sim rescores the head of them). Each is run as the
//    organism runs it, on Int8 lanes, and beside it a twin that packs every key on write
//    (PackedHVStore) and answers from Hamming on the packed words with the same selection rule,
//    unpacking nothing. Both hold the title keys of the held-out draw bench/knowledge.mjs grades
//    (drawHeldout, DRAW_SEED, 200 records) among the first titles of the ingested store, 4096 keys
//    in all (memory.assoc's capacity), and are asked twice per drawn record: by the title's own
//    key, and by the key of the hidden sentence (knowledge.mjs factMembers). Printed: key bytes,
//    recall@1 and ms per query before and after, and how many answers differ. The semantic tier
//    is not packed: its cleanup iterates on lane values. The knowledge tier already compares 256
//    bit signatures. The organism's tier modules (memory/, cells/) are not this item's files and
//    are unchanged: the twins are how this run shows what reading the packed form does to recall.
//
// BUDGETS: one process, --max-old-space-size 6000, no workers, ledger off (summary for the daemon
// arms, never full), every file under --tmp (the OS temp dir by default) and removed at the end.
// Over the whole run it writes several hundred MB, one file replaced by the next; the total is
// printed. No model is called anywhere in it.
//
//   node --max-old-space-size=6000 bench/compress.mjs [--tmp DIR] [--nowrite] [--quiet]
//        narrower (writes compress-partial.json): [--majors 12] [--units 256] [--ticks 2000]
//        [--replay 200] [--tasks 10] [--every 500] [--seed compress-12] [--full-every 20]
//        [--daemon-wall-ms 60000] [--daemon-units 10000] [--daemon-majors 12] [--daemon-every 1000]
//        [--daemon-tasks 1000] [--tier-n 200] [--tier-keys 4096] [--skip-daemon] [--skip-organism]
//        [--skip-tiers]
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { freemem, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { buildWhole, restoreWhole } from '../seeds/whole.mjs';
import { closeWorld } from '../world/index.mjs';
import { readJSONStreamed, readCheckpointHeader } from '../core/persist.mjs';
import { setDeltaPolicy, clearDeltaPolicy, readChain } from '../core/checkpoint-delta.mjs';
import { PackedHVStore, packWords, isBipolar } from '../core/pack.mjs';
import { hashSignal } from '../core/signal.mjs';
import { ask } from '../act/prompt.mjs';
import { buildQuestions, gradeAnswer } from './answer.mjs';
import { emitOrganism } from '../genome/emit.mjs';
import { registerMemorySystem } from '../memory/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const VERDICTS = path.join(HERE, 'verdicts');
const ITEM = 'delta';
export const BAR = Object.freeze({
  majors: 12, units: 256, ticks: 2000, replay: 200, tasks: 10, every: 500, seed: 'compress-12', fullEvery: 20,
  daemonMajors: 12, daemonUnits: 10000, daemonEvery: 1000, daemonTasks: 1000, daemonWallMs: 60000,
  tierN: 200, tierKeys: 4096,
});
/** The bar: checkpoint bytes per tick fall this many times, identity intact, tier recall unchanged. */
export const BAR_RATIO = 5;
export const SUITES = Object.freeze(['algebra', 'sequence', 'grid']);
const MIN_FREE_GB = 16;

const now = () => performance.now();
const r1 = (x) => Math.round(x * 10) / 10;
const r3 = (x) => Math.round(x * 1000) / 1000;
const r4 = (x) => Math.round(x * 10000) / 10000;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const rssMb = () => Math.round(process.memoryUsage().rss / 1048576);
/** Make this organism's memory system the one its cells resolve by name (see the header). */
export function own(b) { if (b && b.memory) registerMemorySystem(b.memory.name, b.memory); return b; }

/** The drawn suite questions: bench/answer.mjs buildQuestions, the three suites only. */
export function suiteQuestions(tasks = BAR.tasks) {
  return buildQuestions({ tasksPerSuite: tasks }).filter((q) => SUITES.includes(q.source));
}

/**
 * The summed suite score on the exact path: ask() with provider 'null' and route 'direct'.
 * @returns {Promise<{ score: number, of: number, bySource: object, provenance: object }>}
 */
export async function suiteScore(brain, questions) {
  own(brain);
  let score = 0;
  const bySource = {}, provenance = {};
  for (const q of questions) {
    const a = await ask(brain, q.q, { provider: 'null', route: 'direct', spawn: false });
    const ok = gradeAnswer(a.text, q).ok;
    const s = bySource[q.source] || (bySource[q.source] = { n: 0, correct: 0 });
    s.n++;
    if (ok) { s.correct++; score++; }
    const p = a.provenance && a.provenance.answer;
    provenance[p] = (provenance[p] || 0) + 1;
  }
  return { score, of: questions.length, bySource, provenance };
}

/** The lines genome/emit.mjs writes for this organism, counted on a temp copy that is then removed. */
export function generatedLines(brain, root = tmpdir()) {
  const dir = mkdtempSync(path.join(root, 'compress-emit-'));
  try {
    const r = emitOrganism(brain, { dir, clean: true });
    return { lines: r.lines, files: Array.isArray(r.files) ? r.files.length : null };
  } catch (e) {
    return { lines: null, files: null, reason: String(e && e.message || e).split('\n')[0] };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

function inflightCount(b) { let n = 0; for (const l of b.inflight.values()) n += l.length; return n; }

/** A payload hash that survives a BigInt (hashSignal's stable JSON cannot). */
function payloadHash(kind, data) {
  try { return hashSignal({ kind, data }); } catch { return 'j' + createHash('sha1').update(JSON.stringify(data, (_k, v) => (typeof v === 'bigint' ? v.toString() + 'n' : v)) || '').digest('hex').slice(0, 16); }
}

/**
 * One tick of one organism as a digest: the counters, the cells that fired in order, EVERY
 * signal a cell emitted this tick (cell, port, kind, payload hash), every signal it put in its
 * outbox (the outbox is drained into the digest, identically on every organism of a replay), and
 * the answer ask.verify holds.
 */
// The digest is kept as its parts too, so a split can be named by the part it is in: the bar run
// of 2026-09-24 matched on all 98 emissions of the first tick and the reporter could only say
// "null against null"; the difference was in the counters (stats.pruned).
const COUNTERS = ['t', 'runs', 'signals', 'delivered', 'grown', 'pruned', 'errors', 'refused', 'outboxDropped', 'mailDropped', 'edges', 'inflight'];
function tickParts(b, fired, emits) {
  const s = b.stats;
  const counters = [b.clock.t, s.runs, s.signals, s.delivered, s.grown, s.pruned, s.errors, s.refused, s.outboxDropped || 0, s.mailDropped || 0, b.connectome.size(), inflightCount(b)];
  const out = [];
  for (const sig of b.takeOutbox()) out.push(sig.kind + ':' + sig.src + ':' + sig.port + ':' + payloadHash(sig.kind, sig.data));
  const v = b.byId.has('ask.verify') ? b.cell('ask.verify').state : null;
  const verify = v ? v.answers + ':' + (v.last ? v.last.promptHash + ':' + v.last.text + ':' + (v.last.provenance && v.last.provenance.answer) : '') : null;
  return { counters, fired: fired ? fired.join(',') : '', emit: emits, out, verify };
}
function tickDigest(p) {
  const h = createHash('sha1');
  h.update(JSON.stringify(p.counters));
  h.update('fired:' + p.fired);
  h.update('emit:' + p.emit.join('|'));
  for (const o of p.out) h.update('|out:' + o);
  if (p.verify !== null) h.update('|verify:' + p.verify);
  return h.digest('hex').slice(0, 20);
}
// Where two tick digests part: the first part that differs, with both values at the first
// element that differs inside it.
function splitOf(b, k, a, z) {
  const who = (e) => { if (!e) return null; const c = b.cells[Number(e.split(':')[0])]; return c ? c.id + ' (' + c.kind + ')' : e; };
  const firstDiff = (x, y) => { let j = 0; while (j < x.length && j < y.length && x[j] === y[j]) j++; return j; };
  const j = firstDiff(a.emit, z.emit);
  const at = { tick: k, emission: j, restored: who(a.emit[j]), live: who(z.emit[j]) };
  if (JSON.stringify(a.counters) !== JSON.stringify(z.counters)) {
    const d = {}; a.counters.forEach((x, i) => { if (x !== z.counters[i]) d[COUNTERS[i]] = [x, z.counters[i]]; });
    return { ...at, part: 'counters', differ: d };
  }
  if (a.fired !== z.fired) { const fa = a.fired.split(','), fz = z.fired.split(','); const i = firstDiff(fa, fz); return { ...at, part: 'fired', index: i, restoredCell: fa[i] === undefined ? null : who(fa[i] + ':'), liveCell: fz[i] === undefined ? null : who(fz[i] + ':'), firedCount: [fa.length, fz.length] }; }
  if (j < a.emit.length || j < z.emit.length) return { ...at, part: 'emit', restoredSignal: a.emit[j] || null, liveSignal: z.emit[j] || null };
  if (a.out.join('|') !== z.out.join('|')) { const i = firstDiff(a.out, z.out); return { ...at, part: 'outbox', index: i, restoredSignal: a.out[i] || null, liveSignal: z.out[i] || null }; }
  return { ...at, part: 'verify', restored: a.verify, live: z.verify };
}

function splitText(f) {
  if (f.part === 'counters') return Object.entries(f.differ).map(([k, [a, z]]) => k + ' ' + a + ' vs ' + z).join(', ') + ' (after ' + f.emission + ' equal emissions)';
  if (f.part === 'fired') return 'fired cell ' + f.index + ': ' + f.restoredCell + ' vs ' + f.liveCell;
  if (f.part === 'emit') return 'emission ' + f.emission + ': ' + f.restored + ' vs ' + f.live;
  if (f.part === 'outbox') return 'outbox signal ' + f.index + ': ' + f.restoredSignal + ' vs ' + f.liveSignal;
  return 'verify ' + f.restored + ' vs ' + f.live;
}

/**
 * Run organisms in lockstep for `ticks` ticks, injecting schedule.get(k) at ask.in before tick
 * k of each. Date.now is held to base + 16 k during tick k of every organism and put back after.
 * Every emission is recorded through an instance wrapper on _emit that is removed afterwards.
 * @returns {{ traces: string[][], answers: object[][], emitted: number[], firstSplit: object[] }}
 */
export function lockstep(orgs, schedule, ticks) {
  const realNow = Date.now;
  const base = realNow();
  const traces = orgs.map(() => []), answers = orgs.map(() => []);
  const fired = orgs.map(() => null), emits = orgs.map(() => []), emitted = orgs.map(() => 0);
  const firstSplit = orgs.map(() => null), parts = orgs.map(() => null);
  const hooks = orgs.map((b, i) => { const fn = (_b, _t, f) => { fired[i] = f ? f.slice() : null; }; b.hooks.afterTick.push(fn); return fn; });
  orgs.forEach((b, i) => {
    const orig = Object.getPrototypeOf(b)._emit;
    b._emit = function (cell, p, out, runSeq) { emits[i].push(cell.idx + ':' + p + ':' + out.kind + ':' + payloadHash(out.kind, out.data)); return orig.call(this, cell, p, out, runSeq); };
  });
  const seen = orgs.map((b) => (b.byId.has('ask.verify') ? b.cell('ask.verify').state.answers : 0));
  try {
    for (let k = 0; k < ticks; k++) {
      const wall = base + 16 * k;
      Date.now = () => wall;
      const q = schedule.get(k);
      for (let i = 0; i < orgs.length; i++) {
        const b = orgs[i];
        if (q) b.inject('ask.in', 'prompt', { kind: 'event', data: { text: q.q, started: base, provider: 'null', model: null, k: null } });
        fired[i] = null; emits[i] = [];
        own(b);
        b.tick(1);
        emitted[i] += emits[i].length;
        parts[i] = tickParts(b, fired[i], emits[i]);
        traces[i].push(tickDigest(parts[i]));
        if (i > 0 && !firstSplit[i] && traces[i][k] !== traces[0][k]) firstSplit[i] = splitOf(b, k, parts[i], parts[0]);
        const v = b.byId.has('ask.verify') ? b.cell('ask.verify').state : null;
        if (v && v.answers > seen[i]) {
          seen[i] = v.answers;
          const l = v.last || {};
          answers[i].push({ tick: k, promptHash: l.promptHash, text: l.text, provenance: l.provenance && l.provenance.answer, method: l.provenance && l.provenance.method });
        }
      }
    }
  } finally {
    Date.now = realNow;
    orgs.forEach((b, i) => { delete b._emit; const at = b.hooks.afterTick.indexOf(hooks[i]); if (at >= 0) b.hooks.afterTick.splice(at, 1); });
  }
  return { traces, answers, emitted, firstSplit };
}

/** Where two traces first differ, and how many ticks agree. */
function agreement(a, b) {
  let same = 0, first = -1;
  for (let k = 0; k < Math.min(a.length, b.length); k++) { if (a[k] === b[k]) same++; else if (first < 0) first = k; }
  return { same, of: Math.max(a.length, b.length), first, mismatches: Math.max(a.length, b.length) - same };
}

// The top level sections of two documents that differ, compared whole (isDeepStrictEqual).
function sectionDiff(A, B) {
  const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])];
  return keys.filter((k) => !isDeepStrictEqual(A[k], B[k]));
}

/** The first paths at which two documents differ (depth first, at most limit of them). */
export function diffPaths(A, B, limit = 6, at = '', out = []) {
  if (out.length >= limit) return out;
  if (isDeepStrictEqual(A, B)) return out;
  const obj = (x) => x !== null && typeof x === 'object';
  if (!obj(A) || !obj(B) || Array.isArray(A) !== Array.isArray(B)) {
    const show = (x) => { const j = JSON.stringify(x); return j === undefined ? 'undefined' : j.length > 80 ? j.slice(0, 77) + '...' : j; };
    out.push(at + ': ' + show(A) + ' vs ' + show(B));
    return out;
  }
  if (Array.isArray(A) && A.length !== B.length) { out.push(at + ': length ' + A.length + ' vs ' + B.length); return out; }
  const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])];
  for (const k of keys) { if (out.length >= limit) break; diffPaths(A[k], B[k], limit, at + '.' + k, out); }
  return out;
}

/**
 * The whole state of organisms [live, v2, v1] (and a fourth, restored from the chain, when given)
 * compared: each written as a document 2 JSON checkpoint and read back, with Date.now held to one
 * value for all of them, then compared section by section, with the first paths of each differing
 * section. `bytes` is what the comparison wrote to disk (every file removed again).
 */
export function stateDiff(orgs, tmp, tag) {
  const realNow = Date.now, wall = realNow();
  let docs, bytes = 0;
  try {
    Date.now = () => wall;
    docs = orgs.map((b, i) => { const d = path.join(tmp, tag + '-' + i); const f = b.snapshot(d, { version: 2 }); bytes += statSync(f).size; const j = readJSONStreamed(path.join(d, 'snapshot.json')); rmSync(d, { recursive: true, force: true }); return j; });
  } finally { Date.now = realNow; }
  const diff = { v2_live: sectionDiff(docs[1], docs[0]), v1_live: sectionDiff(docs[2], docs[0]), v2_v1: sectionDiff(docs[1], docs[2]) };
  const bySection = (A, B, secs) => secs.flatMap((k) => diffPaths(A[k], B[k], 3, k));
  const paths = { v2_live: bySection(docs[1], docs[0], diff.v2_live), v1_live: bySection(docs[2], docs[0], diff.v1_live), v2_v1: bySection(docs[1], docs[2], diff.v2_v1) };
  if (docs.length > 3) {
    diff.chain_live = sectionDiff(docs[3], docs[0]); diff.chain_v2 = sectionDiff(docs[3], docs[1]);
    paths.chain_live = bySection(docs[3], docs[0], diff.chain_live); paths.chain_v2 = bySection(docs[3], docs[1], diff.chain_v2);
  }
  return { diff, paths, bytes };
}

async function waitForRam(say) {
  for (let i = 0; i < 60; i++) {
    const gb = freemem() / 1073741824;
    if (gb >= MIN_FREE_GB) return r1(gb);
    say('free RAM ' + r1(gb) + ' GB is under ' + MIN_FREE_GB + ' GB; waiting 10 s (' + (i + 1) + ' of 60)');
    await new Promise((res) => setTimeout(res, 10_000));
  }
  throw new Error('free RAM stayed under ' + MIN_FREE_GB + ' GB for ten minutes');
}

function shutdown(b) {
  try { closeWorld(b); } catch { /* nothing open */ }
  const l = b && b.whole && b.whole.services && b.whole.services.learning;
  if (l && typeof l.detach === 'function') { try { l.detach(); } catch { /* already detached */ } }
}

// ------------------------------------------------------------------------ 3. the packed tiers
// memory.assoc packed: keys packed on write, the first key at the least Hamming distance wins
// (the first strict maximum of sim, as cells/basic.mjs), a hit at sim >= threshold, the oldest
// key dropped past capacity.
class PackedAssoc {
  constructor({ capacity, threshold, lanes }) { this.capacity = capacity; this.threshold = threshold; this.keys = new PackedHVStore(lanes, capacity); this.values = []; }
  store(key, value) { this.keys.add(key); this.values.push(value); if (this.keys.count > this.capacity) { this.keys.shift(1); this.values.shift(); } }
  query(q) {
    if (this.keys.count === 0) return { hit: false, sim: 0 };
    const b = this.keys.nearest(q, 1)[0];
    return b.sim >= this.threshold ? { hit: true, sim: b.sim, value: this.values[b.index] } : { hit: false, sim: b.sim };
  }
}
// memory/episodic.mjs packed: the same signature coordinates and bands (taken from a store built
// with the same options), read off the packed words; candidates in the same order; ranked by
// signature distance, the head rescored with sim from the packed Hamming distance, best first.
class PackedEpisodic {
  constructor(ref) {
    for (const k of ['d', 'pos', 'bands', 'bandBits', 'bandMask', 'words', 'sigBits', 'rescore', 'minCandidates']) this[k] = ref[k];
    this.keys = new PackedHVStore(this.d, 1024);
    this.sig = new Uint32Array(1024 * this.words);
    this.values = [];
    this.buckets = Array.from({ length: this.bands }, () => new Map());
    this.n = 0;
  }
  _sign(w, out, off) {
    for (let q = 0; q < this.words; q++) out[off + q] = 0;
    for (let j = 0; j < this.sigBits; j++) { const p = this.pos[j]; if ((w[p >>> 5] >>> (p & 31)) & 1) out[off + (j >>> 5)] |= (1 << (j & 31)); }
  }
  _band(sigArr, off, b) { const bit = b * this.bandBits; return (sigArr[off + (bit >>> 5)] >>> (bit & 31)) & this.bandMask; }
  append(key, value) {
    const w = packWords(key, this.d);
    const id = this.keys.add(w);
    if ((id + 1) * this.words > this.sig.length) { const s = new Uint32Array(this.sig.length * 2); s.set(this.sig); this.sig = s; }
    this._sign(w, this.sig, id * this.words);
    this.values.push(value);
    for (let b = 0; b < this.bands; b++) { const v = this._band(this.sig, id * this.words, b), m = this.buckets[b], l = m.get(v); if (l) l.push(id); else m.set(v, [id]); }
    this.n++;
    return id;
  }
  retrieve(query, k = 1) {
    if (this.n === 0) return [];
    const qw = this.keys.query(query), qs = new Uint32Array(this.words);
    this._sign(qw, qs, 0);
    const seen = new Uint8Array(this.n), ids = [];
    for (let b = 0; b < this.bands; b++) { const l = this.buckets[b].get(this._band(qs, 0, b)); if (!l) continue; for (const id of l) { if (seen[id]) continue; seen[id] = 1; ids.push(id); } }
    let pool = ids;
    if (pool.length < Math.max(this.minCandidates, k * 4)) { pool = []; for (let id = 0; id < this.n; id++) pool.push(id); }
    const sigDist = (id) => { let d = 0; const off = id * this.words; for (let q = 0; q < this.words; q++) { let x = this.sig[off + q] ^ qs[q]; x -= (x >>> 1) & 0x55555555; x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); d += (Math.imul((x + (x >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24); } return d; };
    const scored = pool.map((id) => [id, sigDist(id)]);
    scored.sort((a, b) => a[1] - b[1]);
    const head = Math.min(Math.max(k, this.rescore), scored.length);
    const out = [];
    for (let i = 0; i < head; i++) { const id = scored[i][0]; out.push({ id, sim: this.keys.sim(id, qw), value: this.values[id] }); }
    out.sort((a, b) => b.sim - a.sim);
    return out.slice(0, k);
  }
}

/** Part 3: the Hamming tiers on Int8 lanes and packed, on the held-out draw of bench/knowledge.mjs. */
export async function tierBench(o, say) {
  const K = await import('../memory/knowledge.mjs');
  const { STORE_DIR } = await import('../tools/ingest-wiki.mjs');
  const { drawHeldout, DRAW_SEED } = await import('./knowledge.mjs');
  const { EpisodicStore } = await import('../memory/episodic.mjs');
  await import('../cells/basic.mjs');
  const { createCell, runCell } = await import('../core/cell.mjs');
  if (!existsSync(path.join(STORE_DIR, 'heldout.jsonl'))) return { skipped: 'no ingested store at ' + path.relative(ROOT, STORE_DIR).replaceAll('\\', '/') + ' (tools/ingest-wiki.mjs)' };
  const t0 = now();
  const store = K.KnowledgeStore.open(STORE_DIR);
  const { pool, drawn } = drawHeldout(STORE_DIR, o.tierN, DRAW_SEED);
  // the keys: the drawn titles first, then the store's titles in order (a title the draw holds is
  // not repeated), to tierKeys in all; a key that is not bipolar (a title with no words) is skipped
  const keys = [], meta = [];
  const drawnTitles = new Set(drawn.map((h) => K.normTitle(h.title)));
  let skipped = 0;
  const addKey = (title, drawnAt) => { const v = K.keyVector(K.titleWords(title)); if (!isBipolar(v)) { skipped++; return false; } keys.push(v); meta.push({ title, drawnAt }); return true; };
  const target = new Array(drawn.length).fill(-1);
  drawn.forEach((h, i) => { if (addKey(h.title, i)) target[i] = keys.length - 1; });
  for (let a = 0; a < store.A && keys.length < o.tierKeys; a++) { const t = store.title(a); if (drawnTitles.has(K.normTitle(t))) continue; addKey(t, -1); }
  const queries = {
    title: drawn.map((h, i) => ({ i, q: target[i] >= 0 ? keys[target[i]] : null })),
    sentence: drawn.map((h, i) => ({ i, q: K.keyVector(K.factMembers(K.titleWords(h.title), h.sentence)) })),
  };
  const buildMs = now() - t0;
  const out = { draw: { seed: DRAW_SEED, pool, n: drawn.length, store: path.relative(ROOT, STORE_DIR).replaceAll('\\', '/') }, keys: keys.length, skippedKeys: skipped, lanes: keys[0].length, buildMs: r1(buildMs), tiers: {} };
  const time = (f) => { const t = now(); const r = f(); return [r, now() - t]; };
  const recallOf = (answers) => { let hit = 0, n = 0; answers.forEach((a, i) => { if (target[i] < 0) return; n++; if (a === target[i]) hit++; }); return n ? r4(hit / n) : null; };

  // memory.assoc: the cell kind on Int8 lanes, through runCell, against its packed twin
  {
    const cell = createCell({ id: 'compress.assoc', kind: 'memory.assoc' });
    const ctx = {};
    const [, insMs] = time(() => { for (let a = 0; a < keys.length; a++) runCell(cell, [[{ sig: { kind: 'hv', data: keys[a] } }], [{ sig: { kind: 'event', data: { a } } }], []], ctx); });
    const twin = new PackedAssoc({ capacity: cell.params.capacity, threshold: cell.params.threshold, lanes: keys[0].length });
    const [, insMsP] = time(() => { for (let a = 0; a < keys.length; a++) twin.store(keys[a], { a }); });
    const row = { capacity: cell.params.capacity, threshold: cell.params.threshold, held: cell.state.keys.length, heldPacked: twin.keys.count, before: { keyBytes: cell.state.keys.reduce((s, k) => s + k.byteLength, 0), insertMs: r1(insMs) }, after: { keyBytes: twin.keys.usedBytes, insertMs: r1(insMsP) }, differ: {} };
    for (const [set, qs] of Object.entries(queries)) {
      const ask8 = (q) => { const r = runCell(cell, [[], [], [{ sig: { kind: 'hv', data: q } }]], ctx)[0]; return r && r.data; };
      const [b, bMs] = time(() => qs.map((x) => (x.q ? ask8(x.q) : null)));
      const [p, pMs] = time(() => qs.map((x) => (x.q ? twin.query(x.q) : null)));
      const ans = (r) => (r && r.hit ? r.value.a : -1);
      row.before[set] = { recall1: recallOf(b.map(ans)), msPerQuery: r4(bMs / qs.length) };
      row.after[set] = { recall1: recallOf(p.map(ans)), msPerQuery: r4(pMs / qs.length) };
      row.differ[set] = b.reduce((n, r, i) => n + (isDeepStrictEqual(r, p[i]) ? 0 : 1), 0);
    }
    out.tiers.assoc = row;
  }
  // episodic: EpisodicStore on Int8 lanes, retrieve(key, { k: 1 }), against its packed twin
  {
    const ep = new EpisodicStore();
    const [, insMs] = time(() => { for (let a = 0; a < keys.length; a++) ep.append({ key: keys[a], value: { a }, t: a }); });
    const twin = new PackedEpisodic(ep);
    const [, insMsP] = time(() => { for (let a = 0; a < keys.length; a++) twin.append(keys[a], { a }); });
    const row = { held: ep.n, heldPacked: twin.n, rescore: ep.rescore, before: { keyBytes: ep.n * ep.d, keyBytesAllocated: ep.keys.byteLength, insertMs: r1(insMs) }, after: { keyBytes: twin.keys.usedBytes, keyBytesAllocated: twin.keys.bytes, insertMs: r1(insMsP) }, differ: {} };
    for (const [set, qs] of Object.entries(queries)) {
      const [b, bMs] = time(() => qs.map((x) => (x.q ? ep.retrieve(x.q, { k: 1 })[0] || null : null)));
      const [p, pMs] = time(() => qs.map((x) => (x.q ? twin.retrieve(x.q, 1)[0] || null : null)));
      const ans = (r) => (r ? r.value.a : -1);
      row.before[set] = { recall1: recallOf(b.map(ans)), msPerQuery: r4(bMs / qs.length) };
      row.after[set] = { recall1: recallOf(p.map(ans)), msPerQuery: r4(pMs / qs.length) };
      row.differ[set] = b.reduce((n, r, i) => n + ((r === null) !== (p[i] === null) || (r && (r.id !== p[i].id || r.sim !== p[i].sim)) ? 1 : 0), 0);
    }
    out.tiers.episodic = row;
  }
  out.notPacked = { semantic: 'its cleanup (memory/semantic.mjs) iterates on lane values, so its patterns stay Int8', knowledge: 'already compares 256 bit title signatures (memory/knowledge.mjs SIG_BITS)' };
  out.recallUnchanged = Object.values(out.tiers).every((t) => Object.keys(queries).every((s) => t.differ[s] === 0 && t.before[s].recall1 === t.after[s].recall1));
  for (const [k, t] of Object.entries(out.tiers)) {
    say('tier ' + k.padEnd(9) + ' key bytes ' + t.before.keyBytes + ' -> ' + t.after.keyBytes + ' (' + r4(t.before.keyBytes / t.after.keyBytes) + 'x) for ' + t.held + ' keys'
      + Object.keys(queries).map((s) => '   ' + s + ' recall@1 ' + t.before[s].recall1 + ' -> ' + t.after[s].recall1 + ', ' + t.before[s].msPerQuery + ' -> ' + t.after[s].msPerQuery + ' ms/query, answers differing ' + t.differ[s] + '/' + queries[s].length).join(''));
  }
  say('tiers     held-out draw ' + DRAW_SEED + ': ' + drawn.length + ' of ' + pool + ' held-out records, ' + keys.length + ' title keys (' + skipped + ' titles skipped for an empty key); recall unchanged ' + out.recallUnchanged + '; not packed: semantic (cleanup reads lanes), knowledge (256 bit signatures already)');
  return out;
}

// ------------------------------------------------------------------------ 1. the daemon arms
/**
 * One 60 s daemon arm in this process: `kind` 'full' writes Board 10's container 2 checkpoints,
 * 'chain' a delta chain. Everything under a temp state directory that is removed afterwards.
 */
export async function daemonArm(kind, o, root, say) {
  const stateRoot = mkdtempSync(path.join(root, 'compress-daemon-' + kind + '-'));
  const prior = process.env.BRAIN_STATE_DIR;
  process.env.BRAIN_STATE_DIR = stateRoot;
  const D = await import('../daemon/run.mjs');
  const flag = D.raiseBenchFlag({ command: 'node bench/compress.mjs (daemon arm ' + kind + ')' });
  const name = 'bar', dir = path.join(stateRoot, name);
  if (kind === 'chain') setDeltaPolicy(dir, { fullEvery: o.fullEvery, digest: true });
  const series = [], problems = [];
  let verify = null, lastT = now(), prevCk = null;
  const t0 = now();
  try {
    const a = await D.live({
      name, majors: o.daemonMajors, substrateUnits: o.daemonUnits, seed: 'whole', checkpointEvery: o.daemonEvery, selfEvery: 0, selfCodeDry: true,
      selfCodeSources: ['gate', 'notes', 'slow', 'mutants'], suiteTasks: o.daemonTasks, ledger: 'summary', wallMs: o.daemonWallMs,
      out: (l) => { if (/checkpoint failed|\[live\] built/.test(l)) say('  ' + kind + ' ' + l.slice(0, 240)); },
      onCheckpoint: (x) => {
        try {
          const head = path.join(x.dir, 'snapshot.json');
          const h = readCheckpointHeader(head);
          const onDisk = h && h.chain && Array.isArray(h.files) ? h.chainBytes : statSync(head).size;
          series.push({ kind: x.kind, t: x.t, done: x.done, bytes: x.bytes, link: h && h.kind ? h.kind + ' ' + h.seq : 'container 2', onDisk, sinceLastMs: prevCk === null ? null : r1(now() - lastT) });
          prevCk = x.t; lastT = now();
          if (x.kind === 'final' && kind === 'chain') {
            const tv = now();
            const r = readChain(head);
            verify = { links: r.links, kinds: r.header.files.map((f) => f.kind), refused: r.refused, verified: r.verified, ms: r1(now() - tv), t: r.doc && r.doc.clock ? r.doc.clock.t ?? null : null };
          }
        } catch (e) { problems.push(x.kind + ' t=' + x.t + ': ' + String(e && e.message || e).split('\n')[0]); }
      },
    });
    const done = a.runner && Number.isFinite(a.runner.done) ? a.runner.done : null;
    const total = a.checkpointBytes.total;
    const res = {
      kind, ticks: done, t: a.end ? a.end.t : null, checkpoints: a.checkpoints, checkpointErrors: a.checkpointErrors, lastCheckpointError: a.lastCheckpointError,
      bytes: total, bytesPerTick: done ? r3(total / done) : null, loadMs: a.loadMs, wallMs: Math.round(now() - t0), series, verify, problems,
      cells: a.end ? a.end.cells : null, edges: a.end ? a.end.edges : null, exchange: a.exchange,
    };
    say('daemon ' + kind.padEnd(5) + ' ' + res.ticks + ' ticks to t=' + res.t + ' in ' + o.daemonWallMs + ' ms wall (built in ' + res.loadMs + ' ms), ' + res.checkpoints + ' checkpoints writing ' + total + ' bytes = ' + res.bytesPerTick + ' bytes per tick'
      + (verify ? '; the chain reads back: ' + verify.links + ' links (' + verify.kinds.filter((k) => k === 'full').length + ' full), refused ' + (verify.refused ? verify.refused.file : 'none') + ', document SHA-1 verified ' + verify.verified.docSha1 + ' in ' + verify.ms + ' ms' : '')
      + (problems.length ? '; PROBLEMS ' + problems.join(' | ') : ''));
    return res;
  } finally {
    flag.lower();
    if (kind === 'chain') clearDeltaPolicy(dir);
    if (prior === undefined) delete process.env.BRAIN_STATE_DIR; else process.env.BRAIN_STATE_DIR = prior;
    rmSync(stateRoot, { recursive: true, force: true });
  }
}

/** The two arms over the checkpoints they both wrote at the same tick (the final ones aside). */
function matched(full, chain) {
  const at = (s) => new Map(s.series.filter((x) => x.kind !== 'final').map((x) => [x.t, x.bytes]));
  const F = at(full), C = at(chain);
  const ts = [...F.keys()].filter((t) => C.has(t)).sort((a, b) => a - b);
  const f = ts.reduce((s, t) => s + F.get(t), 0), c = ts.reduce((s, t) => s + C.get(t), 0);
  return { ticks: ts, count: ts.length, fullBytes: f, chainBytes: c, ratio: c ? r4(f / c) : null };
}

// ------------------------------------------------------------------------ 2. the organism
async function organismBench(o, tmp, say, questions) {
  const orgs = [];
  let written = 0;
  const wrote = (f) => { const n = statSync(f).size; written += n; return n; };
  try {
    const tb = now();
    const { brain: live } = buildWhole({ majors: o.majors, substrateUnits: o.units, ledger: 'off', name: 'compress', seed: o.seed });
    orgs.push(live);
    say('built ' + live.cells.length + ' cells, ' + live.connectome.size() + ' edges in ' + Math.round(now() - tb) + ' ms; container default ' + live.checkpointContainer);

    // ---- ticking, with a ruler row at every checkpoint; the chain gets one link per row
    const dC = path.join(tmp, 'chain');
    setDeltaPolicy(dC, { fullEvery: o.fullEvery, digest: true });
    const headC = path.join(dC, 'snapshot.json');
    const rows = [];
    const rulerRow = async (t) => {
      const sc = await suiteScore(live, questions);
      const gl = generatedLines(live, tmp);
      const d1 = path.join(tmp, 'row-' + t + '-v1'), d2 = path.join(tmp, 'row-' + t + '-v2');
      const ruler = { score: sc.score, of: sc.of, draw: o.tasks + ' per suite of ' + SUITES.join(', ') + ', bench/answer.mjs buildQuestions, exact path', lines: gl.lines, cells: live.cells.length, t };
      const b1 = wrote(live.snapshot(d1, { version: 3 }));
      let t0 = now();
      const b2 = wrote(live.snapshot(d2, { container: 2, ruler }));
      const v2Ms = now() - t0;
      const head = readCheckpointHeader(path.join(d2, 'snapshot.json'));
      t0 = now();
      live.snapshot(dC, { container: 2, ruler });
      const chainMs = now() - t0;
      const ch = readCheckpointHeader(headC);
      written += ch.bytes;
      rmSync(d1, { recursive: true, force: true }); rmSync(d2, { recursive: true, force: true });
      const row = { t, cells: live.cells.length, edges: live.connectome.size(), lines: gl.lines, score: sc.score, of: sc.of, v1Bytes: b1, v2Bytes: b2,
        v1BytesPerScorePoint: sc.score ? r3(b1 / sc.score) : null, v2BytesPerScorePoint: sc.score ? r3(b2 / sc.score) : null,
        headerRuler: head && head.ruler ? head.ruler.bytesPerScorePoint : null, v2WriteMs: r1(v2Ms),
        chain: { kind: ch.kind, seq: ch.seq, bytes: ch.bytes, chainBytes: ch.chainBytes, writeMs: r1(chainMs), bytesPerScorePoint: ch.ruler ? ch.ruler.bytesPerScorePoint : null, chainBytesPerScorePoint: ch.ruler ? ch.ruler.chainBytesPerScorePoint : null, sections: ch.linkSections || null } };
      rows.push(row);
      say('  checkpoint t=' + t + '  cells ' + row.cells + '  edges ' + row.edges + '  generated lines ' + row.lines + '  score ' + row.score + '/' + row.of
        + '  v1 ' + b1 + ' B  v2 ' + b2 + ' B (' + row.v2BytesPerScorePoint + ' B/pt, ' + row.v2WriteMs + ' ms)  chain ' + ch.kind + ' ' + ch.seq + ' wrote ' + ch.bytes + ' B (' + row.chain.bytesPerScorePoint + ' B/pt, ' + row.chain.writeMs + ' ms), chain on disk ' + ch.chainBytes + ' B');
    };
    const tt = now();
    for (let t = 0; t < o.ticks;) {
      const step = Math.min(o.every, o.ticks - t);
      live.tick(step); t += step;
      await rulerRow(t);
    }
    say('ticked ' + o.ticks + ' in ' + Math.round(now() - tt) + ' ms (ruler rows included)');

    // ---- the bar checkpoint: v1, v1 plain and v2 of the same moment; the chain's last link is
    // the row just written at this moment
    const final = rows[rows.length - 1];
    const ruler = { score: final.score, of: final.of, draw: o.tasks + ' per suite of ' + SUITES.join(', ') + ', bench/answer.mjs buildQuestions, exact path', lines: final.lines, cells: final.cells, t: final.t };
    const dir = { v1: path.join(tmp, 'v1'), v1plain: path.join(tmp, 'v1plain'), v2: path.join(tmp, 'v2'), chain: dC };
    const writeOf = { v1: () => wrote(live.snapshot(dir.v1, { version: 3 })), v2: () => wrote(live.snapshot(dir.v2, { container: 2, ruler })), v1plain: () => wrote(live.snapshot(dir.v1plain, { version: 2 })) };
    const writes = { v1: [], v2: [], v1plain: [] };
    let t0;
    for (const order of [['v1', 'v2', 'v1plain'], ['v2', 'v1plain', 'v1'], ['v1plain', 'v1', 'v2']]) for (const k of order) { t0 = now(); writeOf[k](); writes[k].push(now() - t0); }
    const writeMs = { v1: median(writes.v1), v2: median(writes.v2), v1plain: median(writes.v1plain) };
    const file = (k) => path.join(dir[k], 'snapshot.json');
    const bytes = { v1: statSync(file('v1')).size, v1plain: statSync(file('v1plain')).size, v2: statSync(file('v2')).size };
    const header = readCheckpointHeader(file('v2'));
    const headerC = readCheckpointHeader(headC);
    bytes.chain = headerC.bytes; bytes.chainOnDisk = headerC.chainBytes;
    // read: the file back into its document, three reads each, interleaved
    const reads = { v1: [], v2: [], v1plain: [], chain: [] };
    let docs = {};
    for (let rep = 0; rep < 3; rep++) for (const k of ['v1', 'v2', 'v1plain', 'chain']) { t0 = now(); docs[k] = readJSONStreamed(file(k)); reads[k].push(now() - t0); }
    // the v2 document is the v1 document, section for section (the version field is the one
    // member that differs by construction: v1plain is a version 2 document); the chain rebuilds v2's
    const docSame = { v2_v1: sectionDiff(docs.v2, docs.v1), v2_v1plain: sectionDiff({ ...docs.v2, version: null }, { ...docs.v1plain, version: null }), chain_v2: sectionDiff(docs.chain, docs.v2) };
    const chainVerify = readChain(headC);
    docs = null;
    // restore: the whole organism back, three rounds with the order rotated, median. The last
    // round's organisms are the ones the replay runs; the others are closed as they finish.
    const restores = { v1: [], v2: [], chain: [] };
    const R = {};
    const rounds = [['v2', 'v1', 'chain'], ['chain', 'v2', 'v1'], ['v1', 'chain', 'v2']];
    rounds.forEach((order, r) => {
      for (const k of order) {
        t0 = now(); const b = restoreWhole(dir[k], { ledger: 'off' }).brain; restores[k].push(now() - t0);
        if (r === rounds.length - 1) { R[k] = b; orgs.push(b); } else shutdown(b);
      }
    });
    const restoreMs = { v1: median(restores.v1), v2: median(restores.v2), chain: median(restores.chain) };
    const readMs = { v1: median(reads.v1), v2: median(reads.v2), v1plain: median(reads.v1plain), chain: median(reads.chain) };
    say('v1        ' + bytes.v1 + ' bytes  write ' + Math.round(writeMs.v1) + ' ms  read ' + Math.round(readMs.v1) + ' ms  restore ' + Math.round(restoreMs.v1) + ' ms   (container 1: JSON, document 3, format 4 table)');
    say('v1 plain  ' + bytes.v1plain + ' bytes  write ' + Math.round(writeMs.v1plain) + ' ms  read ' + Math.round(readMs.v1plain) + ' ms   (container 1: JSON, document 2, no table)');
    say('v2        ' + bytes.v2 + ' bytes  write ' + Math.round(writeMs.v2) + ' ms  read ' + Math.round(readMs.v2) + ' ms  restore ' + Math.round(restoreMs.v2) + ' ms   (container 2: binary, Board 10)');
    say('chain     ' + bytes.chain + ' bytes written by its last link (' + headerC.kind + ' ' + headerC.seq + ' of chain ' + headerC.chain + '), ' + bytes.chainOnDisk + ' bytes on disk for a restore (' + headerC.files.length + ' files and the head)  read ' + Math.round(readMs.chain) + ' ms  restore ' + Math.round(restoreMs.chain) + ' ms; verified ' + JSON.stringify(chainVerify.verified) + ' over ' + chainVerify.links + ' links');
    say('v2 census ' + JSON.stringify(header.census) + '  sections ' + header.sections.map((s) => s.name + ' ' + s.bytes + (s.enc === 'xor-rice' ? ' (xor-rice, ' + s.count + ' vectors, ' + s.raw + ' as bits)' : '')).join(', '));
    say('chain link sections ' + (headerC.linkSections || []).map((s) => s.name + ' ' + s.bytes + (s.count !== undefined ? ' (' + s.count + ')' : '')).join(', '));
    say('ratio     v1/v2 ' + r4(bytes.v1 / bytes.v2) + 'x   v1plain/v2 ' + r4(bytes.v1plain / bytes.v2) + 'x   v2/chain link ' + r4(bytes.v2 / bytes.chain) + 'x   v2/chain on disk ' + r4(bytes.v2 / bytes.chainOnDisk) + 'x');
    say('documents v2 vs v1 differ in [' + docSame.v2_v1.join(', ') + ']; v2 vs v1 plain (version aside) in [' + docSame.v2_v1plain.join(', ') + ']; chain vs v2 in [' + docSame.chain_v2.join(', ') + ']');

    // ---- the state at restore, before any replay tick
    const at = stateDiff([live, R.v2, R.v1, R.chain], tmp, 'at');
    written += at.bytes;
    say('at restore differs  v2 vs live [' + at.diff.v2_live.join(', ') + ']   v1 vs live [' + at.diff.v1_live.join(', ') + ']   chain vs live [' + at.diff.chain_live.join(', ') + ']   chain vs v2 [' + at.diff.chain_v2.join(', ') + ']');
    for (const [k, ps] of Object.entries(at.paths)) for (const p of ps) say('  ' + k + '  ' + p);

    // ---- the replay: live and the three restored organisms, in lockstep
    const schedule = new Map();
    const spacing = Math.max(1, Math.floor(o.replay / (questions.length + 1)));
    questions.forEach((q, i) => { const k = (i + 1) * spacing - 1; if (k < o.replay) schedule.set(k, q); });
    const tr = now();
    const { traces, answers, emitted, firstSplit } = lockstep([live, R.v2, R.v1, R.chain], schedule, o.replay);
    const replayMs = now() - tr;
    const agree = { v2_live: agreement(traces[1], traces[0]), v1_live: agreement(traces[2], traces[0]), v2_v1: agreement(traces[1], traces[2]), chain_live: agreement(traces[3], traces[0]), chain_v2: agreement(traces[3], traces[1]) };
    const answersSame = { v2_live: isDeepStrictEqual(answers[1], answers[0]), v1_live: isDeepStrictEqual(answers[2], answers[0]), v2_v1: isDeepStrictEqual(answers[1], answers[2]), chain_live: isDeepStrictEqual(answers[3], answers[0]) };
    const qBySource = {};
    for (const q of schedule.values()) qBySource[q.source] = (qBySource[q.source] || 0) + 1;
    say('replay    ' + o.replay + ' ticks in lockstep in ' + Math.round(replayMs) + ' ms; ' + schedule.size + ' questions injected (' + Object.entries(qBySource).map(([k, v]) => k + ' ' + v).join(', ') + '), ' + answers[0].length + ' answered by the live organism; signals emitted ' + emitted.join(', ') + ' (live, v2, v1, chain)');
    say('identical ticks  chain vs live ' + agree.chain_live.same + '/' + agree.chain_live.of + ' (' + agree.chain_live.mismatches + ' mismatches)   v2 vs live ' + agree.v2_live.same + '/' + agree.v2_live.of + '   v1 vs live ' + agree.v1_live.same + '/' + agree.v1_live.of
      + (firstSplit[3] ? '   (chain first differs from live at replay tick ' + firstSplit[3].tick + ' in ' + firstSplit[3].part + ': ' + splitText(firstSplit[3]) + ')' : '')
      + (firstSplit[1] ? '   (v2 first differs from live at replay tick ' + firstSplit[1].tick + ' in ' + firstSplit[1].part + ': ' + splitText(firstSplit[1]) + ')' : ''));
    say('identical answers  chain vs live ' + answersSame.chain_live + '   v2 vs live ' + answersSame.v2_live + '   v1 vs live ' + answersSame.v1_live + '   (' + answers.map((a) => a.length).join(', ') + ' answers)');
    const end = stateDiff([live, R.v2, R.v1, R.chain], tmp, 'end');
    written += end.bytes;
    say('end state differs  chain vs live [' + end.diff.chain_live.join(', ') + ']   v2 vs live [' + end.diff.v2_live.join(', ') + ']   chain vs v2 [' + end.diff.chain_v2.join(', ') + ']');
    for (const [k, ps] of Object.entries(end.paths)) for (const p of ps) say('  ' + k + '  ' + p);
    const after = { live: await suiteScore(live, questions), v2: await suiteScore(R.v2, questions), v1: await suiteScore(R.v1, questions), chain: await suiteScore(R.chain, questions) };
    const bpsp = { v1: final.score ? r3(bytes.v1 / final.score) : null, v1plain: final.score ? r3(bytes.v1plain / final.score) : null, v2: final.score ? r3(bytes.v2 / final.score) : null, chain: headerC.ruler ? headerC.ruler.bytesPerScorePoint : null, chainOnDisk: headerC.ruler ? headerC.ruler.chainBytesPerScorePoint : null };
    say('ruler     score ' + final.score + '/' + final.of + ' (' + o.tasks + ' per suite, exact path)  generated lines ' + final.lines + '  cells ' + final.cells
      + '   bytes per score point  v1 ' + bpsp.v1 + '  v2 ' + bpsp.v2 + '  chain (what the checkpoint wrote) ' + bpsp.chain + '  chain (every file a restore reads) ' + bpsp.chainOnDisk);
    say('scores after the replay  live ' + after.live.score + '/' + after.live.of + '  v2 ' + after.v2.score + '  v1 ' + after.v1.score + '  chain ' + after.chain.score);
    const replayIdentical = (i, key) => agree[key].same === agree[key].of && answersSame[key] && firstSplit[i] === null;
    return {
      organism: { majors: o.majors, units: o.units, t: final.t, cells: final.cells, edges: final.edges, generatedLines: final.lines },
      rows, final, ruler,
      checkpoints: {
        v1: { container: 1, document: 3, table: 'format 4', bytes: bytes.v1, writeMs: r1(writeMs.v1), readMs: r1(readMs.v1), restoreMs: r1(restoreMs.v1), writeRuns: writes.v1.map(r1), restoreRuns: restores.v1.map(r1) },
        v1plain: { container: 1, document: 2, table: null, bytes: bytes.v1plain, writeMs: r1(writeMs.v1plain), readMs: r1(readMs.v1plain), writeRuns: writes.v1plain.map(r1) },
        v2: { container: 2, document: 3, bytes: bytes.v2, writeMs: r1(writeMs.v2), readMs: r1(readMs.v2), restoreMs: r1(restoreMs.v2), writeRuns: writes.v2.map(r1), restoreRuns: restores.v2.map(r1), census: header.census, sections: header.sections.map((s) => ({ name: s.name, enc: s.enc, bytes: s.bytes, raw: s.raw ?? null, count: s.count ?? null })) },
        chain: { kind: headerC.kind, seq: headerC.seq, chain: headerC.chain, fullEvery: headerC.fullEvery, bytes: bytes.chain, bytesOnDisk: bytes.chainOnDisk, files: headerC.files.map((f) => ({ kind: f.kind, seq: f.seq, t: f.t ?? null, bytes: f.bytes })), readMs: r1(readMs.chain), restoreMs: r1(restoreMs.chain), restoreRuns: restores.chain.map(r1), census: headerC.census || null, linkSections: headerC.linkSections || null, verified: chainVerify.verified, links: chainVerify.links },
      },
      ratio: { v1_over_v2: r4(bytes.v1 / bytes.v2), v1plain_over_v2: r4(bytes.v1plain / bytes.v2), v2_over_chainLink: r4(bytes.v2 / bytes.chain), v2_over_chainOnDisk: r4(bytes.v2 / bytes.chainOnDisk) },
      documentsDiffer: docSame, bpsp, fullHeader: header.ruler, chainHeader: headerC.ruler,
      replay: { ticks: o.replay, questions: schedule.size, bySource: qBySource, ms: r1(replayMs), wallTime: 'Date.now held to one value per lockstep tick, the same for every organism',
        identicalTicks: agree, firstSplit: { chain: firstSplit[3], v2: firstSplit[1], v1: firstSplit[2] }, signalsEmitted: { live: emitted[0], v2: emitted[1], v1: emitted[2], chain: emitted[3] }, identicalAnswers: answersSame, answers: { live: answers[0].length, v2: answers[1].length, v1: answers[2].length, chain: answers[3].length }, endStateDiffers: end.diff, endStatePaths: end.paths, atRestoreDiffers: at.diff, atRestorePaths: at.paths },
      scoresAfterReplay: { live: after.live.score, v2: after.v2.score, v1: after.v1.score, chain: after.chain.score, of: after.live.of },
      identity: { chain: replayIdentical(3, 'chain_live'), v2: replayIdentical(1, 'v2_live'), v1: replayIdentical(2, 'v1_live'), chainDocEqualsV2: docSame.chain_v2.length === 0, chainStateEqualsV2: at.diff.chain_v2.length === 0 && end.diff.chain_v2.length === 0 },
      written,
    };
  } finally {
    for (const b of orgs) shutdown(b);
    clearDeltaPolicy(path.join(tmp, 'chain'));
  }
}

/** The newest ruler.v2Header among the verdicts already on disk (what the gate's COMPRESS row compares against). */
function previousRecord() {
  let best = null;
  if (!existsSync(VERDICTS)) return null;
  for (const f of readdirSync(VERDICTS)) {
    if (!f.endsWith('.json')) continue;
    let v; try { const text = readFileSync(path.join(VERDICTS, f), 'utf8'); if (!text.includes('"v2Header"')) continue; v = JSON.parse(text); } catch { continue; }
    const h = v && v.ruler && v.ruler.v2Header;
    if (!h || !Number.isFinite(h.bytesPerScorePoint) || !v.at) continue;
    if (!best || v.at > best.at) best = { file: 'bench/verdicts/' + f, at: v.at, bytesPerScorePoint: h.bytesPerScorePoint, score: h.score, of: h.of ?? null, bytes: h.bytes ?? null };
  }
  return best;
}

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object).
/** What the compress bar developed on and what it graded: pure, from the run's parameters. */
export function splitFor(opts = {}) {
  return {
    development: { what: 'the organisms this bench builds (the daemon bar organism and the ' + (opts.seed || 'compress-12') + ' organism) and the ruler draw of the three answer suites at their own seeds; the checkpoint formats were written against these organisms', seed: opts.seed ?? null, tasksPerSuite: opts.tasks ?? null },
    heldOut: { what: 'none for the byte, identity and ruler parts; the tier part reads the held-out draw bench/knowledge.mjs grades (drawHeldout, DRAW_SEED) and compares packed recall with Int8 recall on the same keys, which is a comparison, not a held-out score', tierN: opts.tierN ?? null, tierKeys: opts.tierKeys ?? null },
    contaminated: 'no held-out set: the bar measures bytes and identity on the organisms the checkpoint code was written against',
  };
}

// Where the verdict goes. The bar file is written once per item: Board 10's compress.json is
// replaced only when its copy (compress-board10.json, the same "at") sits beside it; this item's
// own bar file is never overwritten (a later run at the bar's parameters writes
// compress-delta-rerun.json with isTheBar false). A narrower run writes compress-partial.json.
function verdictTarget(isTheBar) {
  if (!isTheBar) return { file: 'compress-partial.json', isTheBar: false };
  const bar = path.join(VERDICTS, 'compress.json');
  if (!existsSync(bar)) return { file: 'compress.json', isTheBar: true };
  let prior = null, copy = null;
  try { prior = JSON.parse(readFileSync(bar, 'utf8')); } catch { /* unreadable: never overwritten */ }
  try { copy = JSON.parse(readFileSync(path.join(VERDICTS, 'compress-board10.json'), 'utf8')); } catch { /* no copy */ }
  if (prior && prior.item !== ITEM && copy && copy.at === prior.at) return { file: 'compress.json', isTheBar: true, replaces: { file: 'bench/verdicts/compress.json', at: prior.at, keptAs: 'bench/verdicts/compress-board10.json' } };
  return { file: 'compress-delta-rerun.json', isTheBar: false, rerunOf: { file: 'bench/verdicts/compress.json', at: prior && prior.at, item: prior && prior.item } };
}

/**
 * The bench. Returns the verdict object (and writes it unless write is false).
 * @param {object} [opts] BAR's keys, plus tmp, skipDaemon, skipOrganism, skipTiers, write, quiet
 */
export async function run(opts = {}) {
  const o = { ...BAR, ...opts };
  const say = o.quiet ? () => {} : (s) => console.log(s);
  const started = now();
  let peak = rssMb();
  const sampler = setInterval(() => { peak = Math.max(peak, rssMb()); }, 250);
  sampler.unref();
  const freeGb = await waitForRam(say);
  const root = o.tmp ? path.resolve(o.tmp) : tmpdir();
  mkdirSync(root, { recursive: true });
  say('compress: organism ' + o.majors + ' majors, ' + o.units + ' units, ' + o.ticks + ' ticks, replay ' + o.replay + ', ' + o.tasks + ' per suite, seed ' + o.seed + '; chain full every ' + o.fullEvery
    + '; daemon ' + o.daemonMajors + ' majors, ' + o.daemonUnits + ' units, checkpoint every ' + o.daemonEvery + ', ' + o.daemonWallMs + ' ms per arm; tiers ' + o.tierN + ' drawn, ' + o.tierKeys + ' keys; free RAM ' + freeGb + ' GB, node ' + process.version + ', temp ' + root);
  const questions = suiteQuestions(o.tasks);
  const tmp = mkdtempSync(path.join(root, 'compress-bench-'));
  try {
    const tiers = o.skipTiers ? null : await tierBench(o, say);
    const org = o.skipOrganism ? null : await organismBench(o, tmp, say, questions);
    let daemon = null;
    if (!o.skipDaemon) {
      const full = await daemonArm('full', o, root, say);
      const chain = await daemonArm('chain', o, root, say);
      const m = matched(full, chain);
      const ratio = full.bytesPerTick && chain.bytesPerTick ? r4(full.bytesPerTick / chain.bytesPerTick) : null;
      daemon = { order: ['full', 'chain'], full, chain, ratio, matched: m };
      say('daemon    checkpoint bytes per tick  full ' + full.bytesPerTick + '  chain ' + chain.bytesPerTick + '  RATIO ' + ratio + 'x (bar ' + BAR_RATIO + 'x); over the ' + m.count + ' checkpoints both arms wrote at the same tick (t=' + m.ticks[0] + '..' + m.ticks[m.ticks.length - 1] + ') ' + m.fullBytes + ' against ' + m.chainBytes + ' bytes = ' + m.ratio + 'x');
    }
    const totalMs = now() - started;
    peak = Math.max(peak, rssMb());
    const maxRssMb = Math.round(process.resourceUsage().maxRSS / 1024);
    const written = (org ? org.written : 0) + (daemon ? daemon.full.bytes + daemon.chain.bytes : 0);
    say('wrote     ' + written + ' bytes to disk over the run (every file removed again); peak RSS ' + maxRssMb + ' MB (process maximum), sampled ' + peak + ' MB; wall ' + Math.round(totalMs / 1000) + ' s');

    const prev = previousRecord();
    const met = {
      ratio: daemon ? daemon.ratio >= BAR_RATIO : null,
      chainVerified: daemon ? !!(daemon.chain.verify && daemon.chain.verify.verified.docSha1 && !daemon.chain.verify.refused && daemon.chain.checkpointErrors === 0 && daemon.full.checkpointErrors === 0) : null,
      replayIdenticalChain: org ? org.identity.chain : null,
      chainDocEqualsV2: org ? org.identity.chainDocEqualsV2 : null,
      recallUnchanged: tiers && !tiers.skipped ? tiers.recallUnchanged : null,
      bytesPerScorePointFell: org ? (org.bpsp.chain < org.bpsp.v2 && org.scoresAfterReplay.chain === org.scoresAfterReplay.live && org.final.score === org.final.of) : null,
      belowPreviousRecord: org && prev ? org.bpsp.chain < prev.bytesPerScorePoint : null,
    };
    met.bar = met.ratio === true && met.chainVerified === true && met.replayIdenticalChain === true && met.chainDocEqualsV2 === true && met.recallUnchanged === true && met.bytesPerScorePointFell === true;
    const params = ['majors', 'units', 'ticks', 'replay', 'tasks', 'every', 'seed', 'fullEvery', 'daemonMajors', 'daemonUnits', 'daemonEvery', 'daemonTasks', 'daemonWallMs', 'tierN', 'tierKeys'];
    const atBar = params.every((k) => o[k] === BAR[k]) && !o.skipDaemon && !o.skipOrganism && !o.skipTiers && tiers && !tiers.skipped;
    const target = verdictTarget(atBar);
    const narrow = params.filter((k) => o[k] !== BAR[k]).map((k) => '--' + k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) + ' ' + o[k]).concat(o.skipDaemon ? ['--skip-daemon'] : [], o.skipOrganism ? ['--skip-organism'] : [], o.skipTiers ? ['--skip-tiers'] : []);
    const cmd = 'node --max-old-space-size=6000 bench/compress.mjs' + (narrow.length ? ' ' + narrow.join(' ') : '');
    const tierText = tiers && !tiers.skipped
      ? 'The packed tiers: memory.assoc held ' + tiers.tiers.assoc.held + ' title keys in ' + tiers.tiers.assoc.before.keyBytes + ' bytes as Int8 lanes and ' + tiers.tiers.assoc.after.keyBytes + ' packed, the episodic store ' + tiers.tiers.episodic.before.keyBytes + ' and ' + tiers.tiers.episodic.after.keyBytes
        + '; on the held-out draw of bench/knowledge.mjs (' + tiers.draw.n + ' records, seed ' + tiers.draw.seed + ') recall@1 by the hidden sentence went ' + tiers.tiers.assoc.before.sentence.recall1 + ' to ' + tiers.tiers.assoc.after.sentence.recall1 + ' (assoc) and ' + tiers.tiers.episodic.before.sentence.recall1 + ' to ' + tiers.tiers.episodic.after.sentence.recall1 + ' (episodic), by the title ' + tiers.tiers.assoc.before.title.recall1 + ' to ' + tiers.tiers.assoc.after.title.recall1 + ' and ' + tiers.tiers.episodic.before.title.recall1 + ' to ' + tiers.tiers.episodic.after.title.recall1
        + ', with ' + Object.values(tiers.tiers).reduce((s, t) => s + t.differ.title + t.differ.sentence, 0) + ' of ' + 4 * tiers.draw.n + ' answers differing. '
      : 'The packed tiers were not measured' + (tiers && tiers.skipped ? ' (' + tiers.skipped + '). ' : '. ');
    const daemonText = daemon
      ? 'Over 60 s of the daemon bar organism (' + o.daemonMajors + ' majors, ' + o.daemonUnits + ' substrate units, a checkpoint every ' + o.daemonEvery + ' ticks), Board 10\'s full container 2 checkpoints wrote ' + daemon.full.bytes + ' bytes over ' + daemon.full.ticks + ' ticks (' + daemon.full.bytesPerTick + ' bytes per tick) and the delta chain ' + daemon.chain.bytes + ' bytes over ' + daemon.chain.ticks + ' ticks (' + daemon.chain.bytesPerTick + ' bytes per tick): a fall of ' + daemon.ratio + ' times against a bar of ' + BAR_RATIO
        + ' (' + daemon.matched.ratio + ' times over the ' + daemon.matched.count + ' checkpoints both arms wrote at the same tick); the chain the daemon left read back over ' + (daemon.chain.verify ? daemon.chain.verify.links + ' links to the SHA-1 of the document its writer was handed (' + daemon.chain.verify.verified.docSha1 + ')' : 'no verified read') + '. '
      : 'The daemon arms were not run. ';
    const orgText = org
      ? 'The ' + o.majors + ' major organism (' + org.final.cells + ' cells) checkpointed at t=' + org.final.t + ' as v2 in ' + org.checkpoints.v2.bytes + ' bytes and as a chain link in ' + org.checkpoints.chain.bytes + ' (' + org.checkpoints.chain.bytesOnDisk + ' bytes for every file a restore reads); the chain rebuilt v2\'s document section for section (' + (org.identity.chainDocEqualsV2 ? 'no difference' : 'NOT: [' + org.documentsDiffer.chain_v2.join(', ') + ']') + ') and the organism restored from it matched the live one on '
        + org.replay.identicalTicks.chain_live.same + ' of ' + org.replay.identicalTicks.chain_live.of + ' tick digests of a ' + o.replay + ' tick lockstep replay with ' + org.replay.questions + ' suite questions injected (' + org.replay.identicalTicks.chain_live.mismatches + ' mismatches), ' + (org.replay.identicalAnswers.chain_live ? 'with the same ' + org.replay.answers.chain + ' answers' : 'with DIFFERENT answers')
        + '. A score point (' + org.final.score + ' of ' + org.final.of + ' on the exact path) costs ' + org.bpsp.chain + ' bytes as the checkpoint the chain wrote, ' + org.bpsp.chainOnDisk + ' as every file a restore reads, and ' + org.bpsp.v2 + ' as a full v2 file' + (prev ? '; the newest record before this run was ' + prev.bytesPerScorePoint + ' (' + prev.file + ')' : '') + '. '
      : 'The organism replay was not run. ';
    const statement = daemonText + orgText + tierText + 'Bar ' + (met.bar ? 'MET' : 'NOT MET') + ': a ' + BAR_RATIO + 'x fall in checkpoint bytes per tick with identity intact and tier recall unchanged.';
    const verdict = {
      name: 'compress', item: ITEM, board: 12, at: new Date().toISOString(), command: cmd, node: process.version, isTheBar: target.isTheBar, statement,
      split: splitFor({ seed: o.seed, tasks: o.tasks, tierN: o.tierN, tierKeys: o.tierKeys }),
      bar: { ratio: BAR_RATIO, measured: daemon ? daemon.ratio : null, met: met.bar },
      params: o, freeRamGbAtStart: freeGb,
      daemon,
      ...(org ? {
        organism: org.organism, rows: org.rows, checkpoints: org.checkpoints, ratio: org.ratio, documentsDiffer: org.documentsDiffer,
        ruler: { score: org.final.score, of: org.final.of, draw: org.ruler.draw, generatedLines: org.final.lines, cells: org.final.cells, bytesPerScorePoint: org.bpsp,
          v2Header: org.chainHeader ? { ...org.chainHeader, bytesMeans: 'the bytes this checkpoint wrote: one delta link of the chain plus its head; chainBytes (and chainBytesPerScorePoint) is every file a restore reads' } : null,
          fullHeader: org.fullHeader, previousRecord: prev },
        replay: org.replay, scoresAfterReplay: org.scoresAfterReplay, identity: org.identity,
      } : {}),
      tiers,
      met, ...(target.replaces ? { replaces: target.replaces } : {}), ...(target.rerunOf ? { rerunOf: target.rerunOf } : {}),
      writtenBytes: written, peakRssMb: maxRssMb, sampledPeakRssMb: peak, wallMs: Math.round(totalMs),
      models: 'none: the exact path (provider null) and the daemon arms call no model',
    };
    say('met       ' + Object.entries(met).map(([k, v]) => k + ' ' + v).join('   '));
    if (!o.quiet && o.statement) say(statement);
    if (o.write !== false) {
      mkdirSync(VERDICTS, { recursive: true });
      const out = path.join(VERDICTS, target.file);
      writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
      say('verdict   ' + path.relative(ROOT, out).replaceAll('\\', '/') + ' (isTheBar ' + verdict.isTheBar + ')');
    }
    return verdict;
  } finally {
    clearInterval(sampler);
    rmSync(tmp, { recursive: true, force: true });
  }
}

export function args(argv) {
  const o = {};
  const num = { '--majors': 'majors', '--units': 'units', '--ticks': 'ticks', '--replay': 'replay', '--tasks': 'tasks', '--every': 'every', '--full-every': 'fullEvery',
    '--daemon-wall-ms': 'daemonWallMs', '--daemon-units': 'daemonUnits', '--daemon-majors': 'daemonMajors', '--daemon-every': 'daemonEvery', '--daemon-tasks': 'daemonTasks', '--tier-n': 'tierN', '--tier-keys': 'tierKeys' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (num[a]) o[num[a]] = Number(argv[++i]);
    else if (a === '--seed') o.seed = argv[++i];
    else if (a === '--tmp') o.tmp = argv[++i];
    else if (a === '--nowrite') o.write = false;
    else if (a === '--quiet') o.quiet = true;
    else if (a === '--statement') o.statement = true;
    else if (a === '--skip-daemon') o.skipDaemon = true;
    else if (a === '--skip-organism') o.skipOrganism = true;
    else if (a === '--skip-tiers') o.skipTiers = true;
    else throw new Error('unknown argument ' + a);
  }
  return o;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run(args(process.argv.slice(2))).then(() => process.exit(0), (e) => { console.error(e && e.stack || e); process.exit(1); });
}
