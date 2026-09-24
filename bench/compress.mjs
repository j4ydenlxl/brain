// bench/compress.mjs: SELF COMPRESSING, MEASURED (his P5 of 2026-09-23). One whole organism is
// built, ticked, and checkpointed twice at the same moment:
//
//   v1   container 1, the JSON checkpoint the writer emitted before this item: snapshot.json as
//        text, document version 3 with the format 4 blob table (core/persist.mjs). Printed beside
//        it, "v1 plain": the same organism as a document version 2 JSON file with no table,
//        which is the shape state/soak/snapshot.json has on this machine.
//   v2   container 2, the binary checkpoint (core/persist.mjs writeCheckpoint): a small JSON
//        header, every hypervector one bit per lane and held once, edges and cell state as
//        typed arrays, one CRC32 per section.
//
// Printed: the bytes of each, the ratio, and the median of three rounds (the order rotated each
// round) of write ms, read ms (the file back into its document) and restore ms (restoreWhole, the
// whole organism back).
//
// THE REPLAY. The live organism and the two restored ones then run 200 ticks IN LOCKSTEP, tick
// k of each before tick k+1 of any, while questions of the three answer suites (algebra,
// sequence, grid, drawn by bench/answer.mjs buildQuestions) are injected at ask.in on a fixed
// schedule and cross the organism's own ask region. Every tick of every organism is reduced to
// one digest: the clock, the run, signal, delivery, growth, prune, error and refusal counters,
// the edge count, the signals in flight, the cells that fired in order, every signal it put in
// its outbox (kind, source, port, payload hash), and the answer ask.verify holds. Wall time is
// an INPUT to this organism (world.clock emits it as an event; the ask region stamps it), so for
// the replay Date.now is held to one value per lockstep tick and every organism is fed the same
// one. Memory systems are a process global registry keyed by name (memory/index.mjs
// registerMemorySystem) and a restored organism keeps the name it came from, so three organisms
// in one process would otherwise share whichever store registered last (measured: the two
// restored organisms' mem.episodic lastId ended 8 apart); each organism's own store is
// registered before each of its steps, as it would be alone in its own process. The mind model
// is shared too, and is read only here (installLanguage learn false). Nothing else is controlled. Identity is claimed tick by tick, and the answers are
// compared question by question (text, provenance, method, the tick it arrived).
//
// THE RULER. bytes per score point = checkpoint bytes / summed suite score, where the score is
// the number of correct answers on a fixed draw of the three suites (10 per suite, the suites'
// own seeds) asked on the exact path (act/prompt.mjs ask, provider 'null', route 'direct', so no
// model and no network). It is printed at every checkpoint row with the organism's generated
// lines (genome/emit.mjs emitOrganism, written to a temp dir and counted) and cells, and v2
// carries it in its header, where readCheckpointHeader() reads it without the body.
//
// BUDGETS: one process, --max-old-space-size 6000, no workers, ledger off, every file under the
// OS temp dir and removed at the end (the 12 major checkpoints are tens of MB, not hundreds).
//
//   node --max-old-space-size=6000 bench/compress.mjs [--majors 12] [--units 256] [--ticks 2000]
//        [--replay 200] [--tasks 10] [--every 500] [--seed compress-12] [--nowrite] [--quiet]
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { freemem, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { buildWhole, restoreWhole } from '../seeds/whole.mjs';
import { closeWorld } from '../world/index.mjs';
import { readJSONStreamed, readCheckpointHeader } from '../core/persist.mjs';
import { hashSignal } from '../core/signal.mjs';
import { ask } from '../act/prompt.mjs';
import { buildQuestions, gradeAnswer } from './answer.mjs';
import { emitOrganism } from '../genome/emit.mjs';
import { registerMemorySystem } from '../memory/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const VERDICTS = path.join(HERE, 'verdicts');
export const BAR = Object.freeze({ majors: 12, units: 256, ticks: 2000, replay: 200, tasks: 10, every: 500, seed: 'compress-12' });
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
export function generatedLines(brain) {
  const dir = mkdtempSync(path.join(tmpdir(), 'compress-emit-'));
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
  return { same, of: Math.max(a.length, b.length), first };
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
 * The whole state of three organisms [live, v2, v1] compared: each written as a document 2 JSON
 * checkpoint and read back, with Date.now held to one value for all three, then compared
 * section by section, with the first paths of each differing section.
 */
export function stateDiff(orgs, tmp, tag) {
  const realNow = Date.now, wall = realNow();
  let docs;
  try {
    Date.now = () => wall;
    docs = orgs.map((b, i) => { const d = path.join(tmp, tag + '-' + i); b.snapshot(d, { version: 2 }); const j = readJSONStreamed(path.join(d, 'snapshot.json')); rmSync(d, { recursive: true, force: true }); return j; });
  } finally { Date.now = realNow; }
  const diff = { v2_live: sectionDiff(docs[1], docs[0]), v1_live: sectionDiff(docs[2], docs[0]), v2_v1: sectionDiff(docs[1], docs[2]) };
  const bySection = (A, B, secs) => secs.flatMap((k) => diffPaths(A[k], B[k], 3, k));
  const paths = { v2_live: bySection(docs[1], docs[0], diff.v2_live), v1_live: bySection(docs[2], docs[0], diff.v1_live), v2_v1: bySection(docs[1], docs[2], diff.v2_v1) };
  return { diff, paths };
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

/**
 * The bench. Returns the verdict object (and writes it unless write is false).
 * @param {object} [opts] { majors, units, ticks, replay, tasks, every, seed, write, quiet }
 */
export async function run(opts = {}) {
  const o = { ...BAR, ...opts };
  const say = o.quiet ? () => {} : (s) => console.log(s);
  const started = now();
  let peak = rssMb();
  const sample = () => { peak = Math.max(peak, rssMb()); };
  const freeGb = await waitForRam(say);
  say('compress: ' + o.majors + ' majors, ' + o.units + ' units, ' + o.ticks + ' ticks, replay ' + o.replay + ', ' + o.tasks + ' per suite, seed ' + o.seed + ', free RAM ' + freeGb + ' GB, node ' + process.version);
  const questions = suiteQuestions(o.tasks);
  const tmp = mkdtempSync(path.join(tmpdir(), 'compress-bench-'));
  const orgs = [];
  try {
    const tb = now();
    const { brain: live } = buildWhole({ majors: o.majors, substrateUnits: o.units, ledger: 'off', name: 'compress', seed: o.seed });
    orgs.push(live);
    say('built ' + live.cells.length + ' cells, ' + live.connectome.size() + ' edges in ' + Math.round(now() - tb) + ' ms; container default ' + live.checkpointContainer);
    sample();

    // ---- ticking, with a ruler row at every checkpoint
    const rows = [];
    const rulerRow = async (t) => {
      const sc = await suiteScore(live, questions);
      const gl = generatedLines(live);
      const d1 = path.join(tmp, 'row-' + t + '-v1'), d2 = path.join(tmp, 'row-' + t + '-v2');
      const ruler = { score: sc.score, of: sc.of, draw: o.tasks + ' per suite of ' + SUITES.join(', ') + ', bench/answer.mjs buildQuestions, exact path', lines: gl.lines, cells: live.cells.length, t };
      const b1 = statSync(live.snapshot(d1, { version: 3 })).size;
      const b2 = statSync(live.snapshot(d2, { container: 2, ruler })).size;
      const head = readCheckpointHeader(path.join(d2, 'snapshot.json'));
      rmSync(d1, { recursive: true, force: true }); rmSync(d2, { recursive: true, force: true });
      const row = { t, cells: live.cells.length, edges: live.connectome.size(), lines: gl.lines, score: sc.score, of: sc.of, v1Bytes: b1, v2Bytes: b2,
        v1BytesPerScorePoint: sc.score ? r3(b1 / sc.score) : null, v2BytesPerScorePoint: sc.score ? r3(b2 / sc.score) : null,
        headerRuler: head && head.ruler ? head.ruler.bytesPerScorePoint : null };
      rows.push(row);
      sample();
      say('  checkpoint t=' + t + '  cells ' + row.cells + '  edges ' + row.edges + '  generated lines ' + row.lines + '  score ' + row.score + '/' + row.of
        + '  v1 ' + b1 + ' B (' + row.v1BytesPerScorePoint + ' B/pt)  v2 ' + b2 + ' B (' + row.v2BytesPerScorePoint + ' B/pt, header says ' + row.headerRuler + ')');
      return { sc, gl };
    };
    const tt = now();
    let last = null;
    for (let t = 0; t < o.ticks;) {
      const step = Math.min(o.every, o.ticks - t);
      live.tick(step); t += step;
      last = await rulerRow(t);
    }
    const tickMs = now() - tt;
    say('ticked ' + o.ticks + ' in ' + Math.round(tickMs) + ' ms (ruler rows included)');

    // ---- the bar checkpoint: v1, v1 plain and v2 of the same moment
    const final = rows[rows.length - 1];
    const ruler = { score: final.score, of: final.of, draw: o.tasks + ' per suite of ' + SUITES.join(', ') + ', bench/answer.mjs buildQuestions, exact path', lines: final.lines, cells: final.cells, t: final.t };
    const dir = { v1: path.join(tmp, 'v1'), v1plain: path.join(tmp, 'v1plain'), v2: path.join(tmp, 'v2') };
    // write: three rounds, the order rotated each round so no format always goes first, median
    const writeOf = { v1: () => live.snapshot(dir.v1, { version: 3 }), v2: () => live.snapshot(dir.v2, { container: 2, ruler }), v1plain: () => live.snapshot(dir.v1plain, { version: 2 }) };
    const writes = { v1: [], v2: [], v1plain: [] };
    let t0;
    for (const order of [['v1', 'v2', 'v1plain'], ['v2', 'v1plain', 'v1'], ['v1plain', 'v1', 'v2']]) for (const k of order) { t0 = now(); writeOf[k](); writes[k].push(now() - t0); }
    const writeMs = { v1: median(writes.v1), v2: median(writes.v2), v1plain: median(writes.v1plain) };
    const file = (k) => path.join(dir[k], 'snapshot.json');
    const bytes = { v1: statSync(file('v1')).size, v1plain: statSync(file('v1plain')).size, v2: statSync(file('v2')).size };
    const header = readCheckpointHeader(file('v2'));
    sample();
    // read: the file back into its document, three reads each, interleaved v1 v2 v1plain
    const reads = { v1: [], v2: [], v1plain: [] };
    let docs = {};
    for (let rep = 0; rep < 3; rep++) for (const k of ['v1', 'v2', 'v1plain']) { t0 = now(); docs[k] = readJSONStreamed(file(k)); reads[k].push(now() - t0); }
    // the v2 document is the v1 document, section for section (the version field is the one
    // member that differs by construction: v1plain is a version 2 document)
    const docSame = { v2_v1: sectionDiff(docs.v2, docs.v1), v2_v1plain: sectionDiff({ ...docs.v2, version: null }, { ...docs.v1plain, version: null }) };
    docs = null;
    sample();
    // restore: the whole organism back, three rounds with the order alternated, median. The last
    // round's two organisms are the ones the replay runs; the others are closed as they finish.
    const restores = { v1: [], v2: [] };
    let R2 = null, R1 = null;
    const rounds = [['v2', 'v1'], ['v1', 'v2'], ['v2', 'v1']];
    rounds.forEach((order, r) => {
      for (const k of order) {
        t0 = now(); const b = restoreWhole(dir[k], { ledger: 'off' }).brain; restores[k].push(now() - t0);
        orgs.push(b);
        if (r === rounds.length - 1) { if (k === 'v2') R2 = b; else R1 = b; }
        else { try { closeWorld(b); } catch { /* nothing open */ } const l = b.whole && b.whole.services && b.whole.services.learning; if (l && l.detach) l.detach(); orgs.pop(); }
      }
    });
    const restoreV2 = median(restores.v2), restoreV1 = median(restores.v1);
    sample();
    const readMs = { v1: median(reads.v1), v2: median(reads.v2), v1plain: median(reads.v1plain) };
    say('v1        ' + bytes.v1 + ' bytes  write ' + Math.round(writeMs.v1) + ' ms  read ' + Math.round(readMs.v1) + ' ms  restore ' + Math.round(restoreV1) + ' ms   (container 1: JSON, document 3, format 4 table; the writer default before this item)');
    say('v1 plain  ' + bytes.v1plain + ' bytes  write ' + Math.round(writeMs.v1plain) + ' ms  read ' + Math.round(readMs.v1plain) + ' ms   (container 1: JSON, document 2, no table; the shape of state/soak/snapshot.json)');
    say('v2        ' + bytes.v2 + ' bytes  write ' + Math.round(writeMs.v2) + ' ms  read ' + Math.round(readMs.v2) + ' ms  restore ' + Math.round(restoreV2) + ' ms   (container 2: binary)');
    say('ratio     v1/v2 ' + r4(bytes.v1 / bytes.v2) + 'x   v1plain/v2 ' + r4(bytes.v1plain / bytes.v2) + 'x');
    say('v2 census ' + JSON.stringify(header.census) + '  sections ' + header.sections.map((s) => s.name + ' ' + s.bytes + (s.enc === 'xor-rice' ? ' (xor-rice, ' + s.count + ' vectors, ' + s.raw + ' as bits)' : '')).join(', '));
    say('documents v2 vs v1 differ in [' + docSame.v2_v1.join(', ') + ']; v2 vs v1 plain (version aside) differ in [' + docSame.v2_v1plain.join(', ') + ']');

    // ---- the state at restore, before any replay tick: what a restore gives back
    const { diff: atDiff, paths: atPaths } = stateDiff([live, R2, R1], tmp, 'at');
    say('at restore differs  v2 vs live [' + atDiff.v2_live.join(', ') + ']   v1 vs live [' + atDiff.v1_live.join(', ') + ']   v2 vs v1 [' + atDiff.v2_v1.join(', ') + ']');
    for (const [k, ps] of Object.entries(atPaths)) for (const p of ps) say('  ' + k + '  ' + p);

    // ---- the replay: live, restored from v2, restored from v1, in lockstep
    const schedule = new Map();
    const spacing = Math.max(1, Math.floor(o.replay / (questions.length + 1)));
    questions.forEach((q, i) => { const k = (i + 1) * spacing - 1; if (k < o.replay) schedule.set(k, q); });
    const tr = now();
    const { traces, answers, emitted, firstSplit } = lockstep([live, R2, R1], schedule, o.replay);
    const replayMs = now() - tr;
    sample();
    const agree = { v2_live: agreement(traces[1], traces[0]), v1_live: agreement(traces[2], traces[0]), v2_v1: agreement(traces[1], traces[2]) };
    const answersSame = { v2_live: isDeepStrictEqual(answers[1], answers[0]), v1_live: isDeepStrictEqual(answers[2], answers[0]), v2_v1: isDeepStrictEqual(answers[1], answers[2]) };
    const qBySource = {};
    for (const q of schedule.values()) qBySource[q.source] = (qBySource[q.source] || 0) + 1;
    const answered = answers[0].length;
    say('replay    ' + o.replay + ' ticks in lockstep in ' + Math.round(replayMs) + ' ms; ' + schedule.size + ' questions injected (' + Object.entries(qBySource).map(([k, v]) => k + ' ' + v).join(', ') + '), ' + answered + ' answered by the live organism; signals emitted ' + emitted.join(', ') + ' (live, v2, v1)');
    say('identical ticks  v2 vs live ' + agree.v2_live.same + '/' + agree.v2_live.of + '   v1 vs live ' + agree.v1_live.same + '/' + agree.v1_live.of + '   v2 vs v1 ' + agree.v2_v1.same + '/' + agree.v2_v1.of
      + (firstSplit[1] ? '   (v2 first differs from live at replay tick ' + firstSplit[1].tick + ' in ' + firstSplit[1].part + ': ' + splitText(firstSplit[1]) + ')' : '')
      + (firstSplit[2] ? '   (v1 first differs from live at replay tick ' + firstSplit[2].tick + ' in ' + firstSplit[2].part + ': ' + splitText(firstSplit[2]) + ')' : ''));
    say('identical answers  v2 vs live ' + answersSame.v2_live + '   v1 vs live ' + answersSame.v1_live + '   v2 vs v1 ' + answersSame.v2_v1 + '   (' + answers[0].length + ', ' + answers[1].length + ', ' + answers[2].length + ' answers)');
    // the end state, compared whole
    const { diff: endDiff, paths: endPaths } = stateDiff([live, R2, R1], tmp, 'end');
    say('end state differs  v2 vs live [' + endDiff.v2_live.join(', ') + ']   v1 vs live [' + endDiff.v1_live.join(', ') + ']   v2 vs v1 [' + endDiff.v2_v1.join(', ') + ']');
    for (const [k, ps] of Object.entries(endPaths)) for (const p of ps) say('  ' + k + '  ' + p);
    // the suites once more on the exact path, on all three after the replay
    const after = { live: await suiteScore(live, questions), v2: await suiteScore(R2, questions), v1: await suiteScore(R1, questions) };
    sample();
    const bpsp = { v1: final.score ? r3(bytes.v1 / final.score) : null, v1plain: final.score ? r3(bytes.v1plain / final.score) : null, v2: final.score ? r3(bytes.v2 / final.score) : null };
    say('ruler     score ' + final.score + '/' + final.of + ' (' + o.tasks + ' per suite, exact path)  generated lines ' + final.lines + '  cells ' + final.cells
      + '   bytes per score point  v1 ' + bpsp.v1 + '  v1 plain ' + bpsp.v1plain + '  v2 ' + bpsp.v2 + '  (v2 header: ' + (header.ruler && header.ruler.bytesPerScorePoint) + ')');
    say('scores after the replay  live ' + after.live.score + '/' + after.live.of + '  v2 ' + after.v2.score + '/' + after.v2.of + '  v1 ' + after.v1.score + '/' + after.v1.of);
    const totalMs = now() - started;
    say('peak RSS ' + peak + ' MB (sampled at each phase), wall ' + Math.round(totalMs / 1000) + ' s');

    // THE CLAIM of the bar: the restored organism answers identically, same outputs tick for tick.
    // Held to: every tick digest equal (counters, fired cells, every emission, outbox, the answer
    // held), no first split, and the same answers question for question.
    const replayIdentical = (i, key) => agree[key].same === agree[key].of && answersSame[key] && firstSplit[i] === null;
    const identical = replayIdentical(1, 'v2_live');
    const identicalV1 = replayIdentical(2, 'v1_live');
    // The format claim: v2 and v1 hold one organism, so everything agrees, state included.
    const formatExact = agree.v2_v1.same === agree.v2_v1.of && answersSame.v2_v1 && endDiff.v2_v1.length === 0 && atDiff.v2_v1.length === 0 && docSame.v2_v1.length === 0;
    const isTheBar = o.majors === BAR.majors && o.units === BAR.units && o.ticks === BAR.ticks && o.replay === BAR.replay && o.tasks === BAR.tasks && o.every === BAR.every && o.seed === BAR.seed;
    const cmd = 'node --max-old-space-size=6000 bench/compress.mjs' + (isTheBar ? '' : ' --majors ' + o.majors + ' --units ' + o.units + ' --ticks ' + o.ticks + ' --replay ' + o.replay + ' --tasks ' + o.tasks + ' --every ' + o.every + ' --seed ' + o.seed);
    const statement = 'A ' + o.majors + ' major whole organism (' + final.cells + ' cells, ' + final.edges + ' edges) ticked ' + o.ticks + ' times and checkpointed at t=' + final.t + ' as '
      + 'v1 (the JSON checkpoint the writer emitted before this item) in ' + bytes.v1 + ' bytes and as v2 (the binary container; bipolar vector sections ' + (header.sections.filter((x) => x.name.startsWith('hv.bipolar.')).map((x) => x.enc + (x.raw ? ', ' + x.bytes + ' bytes for ' + x.raw + ' as bits' : '')).join('; ') || 'none') + ') in ' + bytes.v2 + ' bytes, '
      + r4(bytes.v1 / bytes.v2) + ' times smaller; the plain JSON form of the same organism is ' + bytes.v1plain + ' bytes, ' + r4(bytes.v1plain / bytes.v2) + ' times v2. '
      + 'v2 wrote in ' + Math.round(writeMs.v2) + ' ms against ' + Math.round(writeMs.v1) + ' ms and restored the whole organism in ' + Math.round(restoreV2) + ' ms against ' + Math.round(restoreV1) + ' ms. '
      + 'Over a ' + o.replay + ' tick lockstep replay with ' + schedule.size + ' suite questions injected at the ask region, the organism restored from v2 matched the live one on '
      + agree.v2_live.same + ' of ' + agree.v2_live.of + ' tick digests (every emitted signal hashed, ' + emitted[1] + ' of them against ' + emitted[0] + ' live), '
      + (answersSame.v2_live ? 'gave the same ' + answers[1].length + ' answers on the same ticks' : 'did NOT give the same answers')
      + '; its state at restore differed from the live one in [' + atDiff.v2_live.join(', ') + '] (' + (atPaths.v2_live.join('; ') || 'nothing') + ')'
      + ' and after the replay in [' + endDiff.v2_live.join(', ') + '] (' + (endPaths.v2_live.join('; ') || 'nothing') + '). Against the organism restored from v1 it matched on '
      + agree.v2_v1.same + ' of ' + agree.v2_v1.of + ' tick digests and in state section for section ' + (formatExact ? '(no difference at restore or after the replay).' : '(NOT: at restore [' + atDiff.v2_v1.join(', ') + '], after [' + endDiff.v2_v1.join(', ') + ']).') + ' The exact path scored ' + final.score + ' of ' + final.of + ' on the drawn suites, so a score point costs ' + bpsp.v2 + ' bytes in v2 against ' + bpsp.v1 + ' in v1.';
    const verdict = {
      name: 'compress', at: new Date().toISOString(), command: cmd, node: process.version, isTheBar, statement,
      params: o, freeRamGbAtStart: freeGb,
      organism: { majors: o.majors, units: o.units, t: final.t, cells: final.cells, edges: final.edges, generatedLines: final.lines },
      rows,
      checkpoints: {
        v1: { container: 1, document: 3, table: 'format 4', bytes: bytes.v1, writeMs: r1(writeMs.v1), readMs: r1(readMs.v1), restoreMs: r1(restoreV1), writeRuns: writes.v1.map(r1), restoreRuns: restores.v1.map(r1) },
        v1plain: { container: 1, document: 2, table: null, bytes: bytes.v1plain, writeMs: r1(writeMs.v1plain), readMs: r1(readMs.v1plain), writeRuns: writes.v1plain.map(r1) },
        v2: { container: 2, document: 3, bytes: bytes.v2, writeMs: r1(writeMs.v2), readMs: r1(readMs.v2), restoreMs: r1(restoreV2), writeRuns: writes.v2.map(r1), restoreRuns: restores.v2.map(r1), census: header.census, sections: header.sections.map((s) => ({ name: s.name, enc: s.enc, bytes: s.bytes, raw: s.raw ?? null, count: s.count ?? null })) },
      },
      ratio: { v1_over_v2: r4(bytes.v1 / bytes.v2), v1plain_over_v2: r4(bytes.v1plain / bytes.v2) },
      documentsDiffer: docSame,
      ruler: { score: final.score, of: final.of, draw: ruler.draw, generatedLines: final.lines, cells: final.cells, bytesPerScorePoint: bpsp, v2Header: header.ruler },
      replay: { ticks: o.replay, questions: schedule.size, bySource: qBySource, ms: r1(replayMs), wallTime: 'Date.now held to one value per lockstep tick, the same for every organism',
        identicalTicks: agree, firstSplit: { v2: firstSplit[1], v1: firstSplit[2] }, signalsEmitted: { live: emitted[0], v2: emitted[1], v1: emitted[2] }, identicalAnswers: answersSame, answers: { live: answers[0].length, v2: answers[1].length, v1: answers[2].length }, endStateDiffers: endDiff, endStatePaths: endPaths, atRestoreDiffers: atDiff, atRestorePaths: atPaths },
      scoresAfterReplay: { live: after.live.score, v2: after.v2.score, v1: after.v1.score, of: after.live.of },
      met: { replayIdenticalV2: identical, replayIdenticalV1: identicalV1, v2EqualsV1: formatExact, smaller: bytes.v2 < bytes.v1 },
      peakRssMb: peak, wallMs: Math.round(totalMs),
    };
    say('met       replay identical v2 ' + verdict.met.replayIdenticalV2 + '   replay identical v1 ' + verdict.met.replayIdenticalV1 + '   v2 equals v1 ' + verdict.met.v2EqualsV1 + '   v2 smaller ' + verdict.met.smaller);
    if (!o.quiet && o.statement) say(statement);
    if (o.write !== false) {
      mkdirSync(VERDICTS, { recursive: true });
      // The bar file is written once. A later run at the bar's parameters (after a fix) writes
      // compress-rerun.json with isTheBar false and names the bar run it follows; it never
      // overwrites the measurement the bar was judged on.
      const barFile = path.join(VERDICTS, 'compress.json');
      let out = path.join(VERDICTS, isTheBar ? 'compress.json' : 'compress-partial.json');
      if (isTheBar && existsSync(barFile)) {
        let prior = null; try { prior = JSON.parse(readFileSync(barFile, 'utf8')); } catch { /* unreadable: still never overwritten */ }
        verdict.isTheBar = false;
        verdict.rerunOf = { file: 'bench/verdicts/compress.json', at: prior && prior.at, met: prior && prior.met };
        out = path.join(VERDICTS, 'compress-rerun.json');
      }
      writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
      say('verdict   ' + path.relative(ROOT, out).replaceAll('\\', '/') + ' (isTheBar ' + verdict.isTheBar + ')');
    }
    return verdict;
  } finally {
    for (const b of orgs) {
      try { closeWorld(b); } catch { /* nothing open */ }
      const l = b.whole && b.whole.services && b.whole.services.learning;
      if (l && typeof l.detach === 'function') { try { l.detach(); } catch { /* already detached */ } }
    }
    rmSync(tmp, { recursive: true, force: true });
  }
}

function args(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const num = (k) => { o[k] = Number(argv[++i]); };
    if (a === '--majors') num('majors'); else if (a === '--units') num('units'); else if (a === '--ticks') num('ticks');
    else if (a === '--replay') num('replay'); else if (a === '--tasks') num('tasks'); else if (a === '--every') num('every');
    else if (a === '--seed') o.seed = argv[++i]; else if (a === '--nowrite') o.write = false; else if (a === '--quiet') o.quiet = true; else if (a === '--statement') o.statement = true;
    else throw new Error('unknown argument ' + a);
  }
  return o;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run(args(process.argv.slice(2))).then(() => process.exit(0), (e) => { console.error(e && e.stack || e); process.exit(1); });
}
