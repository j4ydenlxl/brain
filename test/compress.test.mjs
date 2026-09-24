// test/compress.test.mjs: SELF COMPRESSING (his P5): core/pack.mjs, checkpoint container 2 and
// the bytes per score point ruler. node --test test/compress.test.mjs
//
//   (a) pack round trip exact for 1000 random bipolar and 1000 random ternary vectors, at lane
//       counts that are and are not multiples of 8, raw and framed, with the checksum checked
//   (b) a v1 checkpoint (container 1, JSON, document 2 and document 3) still restores, and
//       restores to the same organism the v2 file restores to
//   (c) a v2 restore equals the live organism: the same state the moment it is restored, and
//       the same emissions, fired cells, outbox and answers tick for tick on a lockstep replay
//   (d) a corrupted section is refused with its checksum, every section of the file in turn,
//       and so are a corrupted header and a truncated file
//   (e) the ruler: v2 carries bytes per score point in its header, readable without the body
//   (f) no em dashes in the files of this item
//   (g) a restore keeps the runtime the brain was built with (pruneEvery, hebbian, outboxRing,
//       the growth tracker's config), in both containers; a caller that names one still wins,
//       and a file written before the runtime section restores with the defaults it always did
//   (h) the vector sections are XOR and Rice coded (core/pack.mjs xorRiceEncode): exact on random
//       and on correlated stores of any width, a checkpoint written with plain bits still reads
//       to the same document and restores, an unknown section encoding is refused by name, and
//       a section whose stored checksum was forged to match corrupted bytes is still refused by
//       the checksum of what it decodes to
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, statSync, existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  crc32, crc32Portable, packBipolarBits, unpackBipolarBits, packTernaryBits, unpackTernaryBits,
  packHV, unpackHV, unpackHVRecord, bipolarBytes, ternaryBytes, packedSize, KIND_BIPOLAR, KIND_TERNARY,
  xorRiceEncode, xorRiceDecode,
} from '../core/pack.mjs';
import { readJSONStreamed, readCheckpoint, readCheckpointHeader, readCheckpointBuffer, writeCheckpoint, isCheckpoint, CKPT_MAGIC } from '../core/persist.mjs';
import { buildWhole, restoreWhole, CHECKPOINT_CONTAINER } from '../seeds/whole.mjs';
import { closeWorld } from '../world/index.mjs';
import { RNG } from '../core/rng.mjs';
import { lockstep, stateDiff, suiteQuestions, suiteScore } from '../bench/compress.mjs';
import { Brain } from '../core/brain.mjs';
import { ACTIVE } from '../core/connectome.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMALL = { majors: 4, substrateUnits: 128, ledger: 'off', name: 'compress-test', seed: 'compress-test' };

function shutdown(brain) {
  if (!brain) return;
  try { closeWorld(brain); } catch { /* nothing open */ }
  const l = brain.whole && brain.whole.services && brain.whole.services.learning;
  if (l && typeof l.detach === 'function') { try { l.detach(); } catch { /* already detached */ } }
}

// The one thing a restore adds: learning/engine.mjs appends a learn.attach event when the
// restored organism's learning engine attaches, so the restored ledger is one event ahead.
const LEDGER_AHEAD = /^ledger\.seq: (\d+) vs (\d+)$/;

// ---------------------------------------------------------------- (a)
test('(a) pack round trip is exact for 1000 random bipolar and 1000 random ternary vectors', () => {
  const rng = new RNG('compress-pack');
  let bipolar = 0, ternary = 0, odd = 0;
  for (let n = 0; n < 1000; n++) {
    const lanes = 1 + Math.floor(rng.next() * 9000);
    if (lanes % 8) odd++;
    const b = new Int8Array(lanes);
    for (let i = 0; i < lanes; i++) b[i] = rng.next() < 0.5 ? -1 : 1;
    const bits = packBipolarBits(b);
    assert.equal(bits.length, bipolarBytes(lanes));
    assert.deepEqual(unpackBipolarBits(bits, lanes), b, 'bipolar lanes ' + lanes);
    const rec = packHV(b);
    assert.equal(rec.length, packedSize(lanes, KIND_BIPOLAR));
    const back = unpackHVRecord(rec);
    assert.equal(back.kind, KIND_BIPOLAR); assert.equal(back.lanes, lanes);
    assert.deepEqual(back.v, b);
    bipolar++;

    const t = new Int8Array(lanes);
    for (let i = 0; i < lanes; i++) { const r = rng.next(); t[i] = r < 1 / 3 ? -1 : r < 2 / 3 ? 0 : 1; }
    t[Math.floor(rng.next() * lanes)] = 0; // at least one zero lane, so the frame is ternary
    const tb = packTernaryBits(t);
    assert.equal(tb.length, ternaryBytes(lanes));
    assert.deepEqual(unpackTernaryBits(tb, lanes), t, 'ternary lanes ' + lanes);
    const trec = packHV(t);
    assert.equal(trec.length, packedSize(lanes, KIND_TERNARY));
    assert.deepEqual(unpackHV(trec), t);
    ternary++;
  }
  assert.equal(bipolar, 1000); assert.equal(ternary, 1000);
  assert.ok(odd > 800, 'most lane counts are not a multiple of 8 (' + odd + ' of 1000)');
  // the checksum: node's zlib crc32 and the portable table agree, on known and random input
  assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926);
  assert.equal(crc32Portable(Buffer.from('123456789')), 0xcbf43926);
  const junk = Buffer.alloc(4099); for (let i = 0; i < junk.length; i++) junk[i] = Math.floor(rng.next() * 256);
  assert.equal(crc32(junk), crc32Portable(junk));
  // a framed record with one flipped bit is refused, naming the checksum
  const rec = packHV(Int8Array.from({ length: 777 }, (_, i) => (i % 3 ? 1 : -1)));
  rec[9] ^= 4;
  assert.throws(() => unpackHV(rec), /checksum mismatch, stored crc32 [0-9a-f]+, computed [0-9a-f]+/);
});

// ---------------------------------------------------------------- (b) and (e)
test('(b) a v1 checkpoint still restores, to the organism the v2 file restores to; (e) v2 carries the ruler', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'compress-v1-'));
  let live = null; const restored = [];
  try {
    live = buildWhole(SMALL).brain;
    assert.equal(live.checkpointContainer, CHECKPOINT_CONTAINER);
    assert.equal(CHECKPOINT_CONTAINER, 2);
    live.tick(80);
    const q = suiteQuestions(2);
    const sc = await suiteScore(live, q);
    const d = { doc2: path.join(dir, 'doc2'), doc3: path.join(dir, 'doc3'), v2: path.join(dir, 'v2') };
    live.snapshot(d.doc2, { version: 2 });
    live.snapshot(d.doc3, { version: 3 });
    live.snapshot(d.v2, { ruler: { score: sc.score, of: sc.of, draw: 'test', lines: null, cells: live.cells.length } });
    const f = (k) => path.join(d[k], 'snapshot.json');
    // the two JSON files are container 1, the default whole snapshot is container 2
    for (const k of ['doc2', 'doc3']) assert.equal(readFileSync(f(k)).subarray(0, 1).toString(), '{', k + ' is JSON');
    assert.ok(isCheckpoint(readFileSync(f('v2'))));
    assert.equal(readFileSync(f('v2')).subarray(0, 8).toString('latin1'), CKPT_MAGIC);
    // one reader for all three, and the documents it gives back are the same organism
    const docs = { doc2: readJSONStreamed(f('doc2')), doc3: readJSONStreamed(f('doc3')), v2: readJSONStreamed(f('v2')) };
    assert.equal(docs.doc2.version, 2); assert.equal(docs.doc3.version, 3); assert.equal(docs.v2.version, 3);
    assert.deepEqual({ ...docs.v2, version: 0 }, { ...docs.doc3, version: 0 });
    assert.deepEqual({ ...docs.v2, version: 0 }, { ...docs.doc2, version: 0 });
    // each restores, and the three restored organisms are the same organism
    for (const k of ['doc2', 'doc3', 'v2']) restored.push(restoreWhole(d[k], { ledger: 'off' }).brain);
    for (const b of restored) { assert.equal(b.clock.t, 80); assert.equal(b.cells.length, live.cells.length); assert.equal(b.connectome.size(), live.connectome.size()); }
    const cmp = stateDiff([restored[2], restored[1], restored[0]], dir, 'cmp');
    assert.deepEqual(cmp.diff.v2_live, [], 'doc3 restore equals v2 restore: ' + cmp.paths.v2_live.join('; '));
    assert.deepEqual(cmp.diff.v1_live, [], 'doc2 restore equals v2 restore: ' + cmp.paths.v1_live.join('; '));
    // (e) the ruler rides in the header and is read without the body
    const head = readCheckpointHeader(f('v2'));
    assert.equal(head.version, 2); assert.equal(head.bytes, statSync(f('v2')).size);
    assert.equal(head.ruler.score, sc.score);
    assert.ok(sc.score > 0, 'the exact path scores on the drawn suites');
    assert.equal(head.ruler.bytesPerScorePoint, Math.round(head.bytes / sc.score * 1000) / 1000);
    assert.equal(readCheckpointHeader(f('doc3')), null, 'a JSON checkpoint has no header');
    // the v2 file is smaller than either JSON file of the same moment
    assert.ok(head.bytes < statSync(f('doc3')).size && head.bytes < statSync(f('doc2')).size);
  } finally {
    shutdown(live); for (const b of restored) shutdown(b);
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- (c)
test('(c) a v2 restore equals the live organism: at restore, and tick for tick on a replay with the three suites', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'compress-replay-'));
  let live = null, R = null;
  try {
    live = buildWhole(SMALL).brain;
    // The organism is built with pruneEvery 0. The bar run of 2026-09-24 (12 majors, t=2000)
    // found the restore taking the Brain default of 1000 instead and pruning 15 edges on the
    // first replay tick that the live organism never proposed. A 60 tick replay from t=120 never
    // reaches t=1000, so the pass is brought to t=150 here, and the five stalest live edges are
    // made weak so that pass has candidates; a restore that loses pruneEvery then diverges.
    live.pruneEvery = 150;
    live.tick(120);
    const k = live.connectome;
    const stale = [];
    for (let e = 0; e < k.n; e++) if (k.flags[e] & ACTIVE) stale.push(e);
    stale.sort((a, b) => (k.lastT[a] - k.lastT[b]) || (a - b));
    for (const e of stale.slice(0, 5)) k.w[e] = 0.01;
    const file = live.snapshot(path.join(dir, 'ck'));
    assert.ok(isCheckpoint(readFileSync(file)), 'the whole organism checkpoints as container 2 by default');
    R = restoreWhole(path.join(dir, 'ck'), { ledger: 'off' }).brain;
    assert.equal(R.pruneEvery, 150, 'the restore keeps the pruning period the organism ran with');
    assert.deepEqual(R.hebbian, live.hebbian);
    assert.deepEqual(R.genome, JSON.parse(JSON.stringify(live.genome)), 'the genome record comes back');
    // at restore: every section equal (cells, connectome, mailboxes, inflight, the world queues,
    // the attention and learning state in extras), apart from the one ledger event a restore writes
    const at = stateDiff([live, R, R], dir, 'at');
    assert.deepEqual(at.diff.v2_live, ['ledger'], 'at restore: ' + at.paths.v2_live.join('; '));
    const m = LEDGER_AHEAD.exec(at.paths.v2_live[0]);
    assert.ok(m, at.paths.v2_live[0]);
    assert.equal(Number(m[1]) - Number(m[2]), 1, 'the restored ledger is one event (learn.attach) ahead');
    // the replay: 60 ticks in lockstep, one question of each of the three suites every few ticks
    const qs = suiteQuestions(3);
    const schedule = new Map(); qs.forEach((q, i) => schedule.set(2 + i * 6, q));
    let prunes = 0;
    const propose = live.gate.propose;
    live.gate.propose = function (p, ctx) { if (p.kind === 'edge.prune') prunes++; return propose.call(this, p, ctx); };
    let run;
    try { run = lockstep([live, R], schedule, 60); } finally { delete live.gate.propose; }
    const { traces, answers, emitted, firstSplit } = run;
    assert.ok(prunes > 0, 'the replay crosses a pruning pass that has candidates (' + prunes + ' proposed)');
    assert.equal(R.stats.pruned, live.stats.pruned);
    assert.equal(traces[0].length, 60);
    assert.equal(firstSplit[1], null, 'first split: ' + JSON.stringify(firstSplit[1]));
    assert.deepEqual(traces[1], traces[0]);
    assert.ok(emitted[0] > 0); assert.equal(emitted[1], emitted[0]);
    assert.equal(answers[0].length, qs.length, 'every question answered on the replay');
    assert.deepEqual(answers[1], answers[0]);
    // after the replay the organism still agrees section by section. extras may differ in the
    // attention service's raised and lowered counters alone: the live attention keeps references
    // to signal vectors the core later reuses (measured on a 4 major whole: 4 of 896 held
    // references changed content in 60 ticks), which a restore, holding copies, cannot reproduce
    const end = stateDiff([live, R, R], dir, 'end');
    for (const sec of ['clock', 'rng', 'regions', 'circuits', 'cells', 'connectome', 'coact', 'gate', 'stats', 'inflight', 'outbox', 'mailboxes']) {
      assert.ok(!end.diff.v2_live.includes(sec), 'section ' + sec + ' after the replay: ' + end.paths.v2_live.join('; '));
    }
    for (const p of end.paths.v2_live) assert.ok(LEDGER_AHEAD.test(p) || /^extras\.whole\.attention\.stats\.(raised|lowered): /.test(p), 'after the replay: ' + p);
  } finally {
    shutdown(live); shutdown(R);
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- (g)
test('(g) a restore keeps the runtime the brain was built with, in both containers; the caller still wins', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'compress-runtime-'));
  try {
    const want = { pruneEvery: 7, hebbian: { eta: 0.02, alpha: 0.0002 }, outboxRing: 99, growth: { enabled: true, window: 16, threshold: 3, maxPairs: 500, sampleBudget: 10 } };
    const b = new Brain({ name: 'runtime', ledger: 'off', ...want });
    b.snapshot(path.join(dir, 'v1'), { version: 3 });
    b.snapshot(path.join(dir, 'v2'), { container: 2 });
    assert.ok(isCheckpoint(readFileSync(path.join(dir, 'v2', 'snapshot.json'))));
    const growthOf = (x) => ({ enabled: x.coact.enabled, window: x.coact.window, threshold: x.coact.threshold, maxPairs: x.coact.maxPairs, sampleBudget: x.coact.sampleBudget });
    for (const f of ['v1', 'v2']) {
      const r = Brain.restore(path.join(dir, f), { dir: null, ledger: 'off' });
      assert.equal(r.pruneEvery, 7, f);
      assert.deepEqual(r.hebbian, want.hebbian, f);
      assert.equal(r.outboxRing, 99, f);
      assert.deepEqual(growthOf(r), want.growth, f);
      // a caller that names an option gets what it named
      const c = Brain.restore(path.join(dir, f), { dir: null, ledger: 'off', pruneEvery: 0, growth: false });
      assert.equal(c.pruneEvery, 0, f);
      assert.equal(c.coact.enabled, false, f);
      assert.deepEqual(c.hebbian, want.hebbian, f);
    }
    // a file written before the section existed restores with the constructor defaults
    const j = JSON.parse(readFileSync(path.join(dir, 'v1', 'snapshot.json'), 'utf8'));
    assert.deepEqual(j.runtime, want);
    delete j.runtime;
    mkdirSync(path.join(dir, 'old'), { recursive: true });
    writeFileSync(path.join(dir, 'old', 'snapshot.json'), JSON.stringify(j));
    const o = Brain.restore(path.join(dir, 'old'), { dir: null, ledger: 'off' });
    const d = new Brain({ name: 'defaults', ledger: 'off' });
    assert.equal(o.pruneEvery, d.pruneEvery);
    assert.deepEqual(o.hebbian, d.hebbian);
    assert.equal(o.outboxRing, d.outboxRing);
    assert.deepEqual(growthOf(o), growthOf(d));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- (d)
test('(d) a corrupted section is refused with its checksum, and so are a corrupted header and a truncated file', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'compress-bad-'));
  let live = null;
  try {
    live = buildWhole({ ...SMALL, majors: 2 }).brain;
    live.tick(40);
    const good = live.snapshot(path.join(dir, 'good'));
    const buf = readFileSync(good);
    const head = readCheckpointHeader(good);
    const H = buf.readUInt32LE(8), bodyAt = 16 + H;
    assert.ok(head.sections.length >= 4, 'sections: ' + head.sections.map((s) => s.name).join(', '));
    assert.ok(readCheckpoint(good).doc.cells.length === live.cells.length, 'the good file reads');
    let refused = 0;
    for (const s of head.sections) {
      const bad = Buffer.from(buf);
      bad[bodyAt + s.offset + Math.floor(s.bytes / 2)] ^= 0x10;
      const d = path.join(dir, 'bad-' + s.name.replace(/[^a-z0-9]/gi, '_'));
      mkdirSync(d, { recursive: true });
      const f = path.join(d, 'snapshot.json');
      writeFileSync(f, bad);
      const want = new RegExp('section ' + s.name.replace(/\./g, '\\.') + ' fails its checksum \\(stored crc32 ' + (s.crc32 >>> 0).toString(16) + ', computed [0-9a-f]+\\); refusing to restore it');
      assert.throws(() => readCheckpoint(f), want);
      assert.throws(() => readJSONStreamed(f), want);
      assert.throws(() => restoreWhole(d, { ledger: 'off' }), want);
      refused++;
    }
    assert.equal(refused, head.sections.length);
    // the header has a checksum of its own
    const hb = Buffer.from(buf); hb[16 + 3] ^= 0x01;
    const fh = path.join(dir, 'bad-header.json'); writeFileSync(fh, hb);
    assert.throws(() => readCheckpoint(fh), /the header fails its checksum \(stored crc32 [0-9a-f]+, computed [0-9a-f]+\)/);
    // and a file cut short, or with bytes appended, is refused before any section is read
    const ft = path.join(dir, 'short.json'); writeFileSync(ft, buf.subarray(0, buf.length - 100));
    assert.throws(() => readCheckpoint(ft), /refusing a truncated or extended checkpoint/);
    const fx = path.join(dir, 'long.json'); writeFileSync(fx, Buffer.concat([buf, Buffer.alloc(8)]));
    assert.throws(() => readCheckpoint(fx), /refusing a truncated or extended checkpoint/);
    // the good file is untouched by all of that
    const again = path.join(dir, 'again.json'); copyFileSync(good, again);
    assert.equal(readCheckpoint(again).header.bytes, buf.length);
  } finally {
    shutdown(live);
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- (h)
// A container 2 file with its header rewritten by mutate(header): the body is kept byte for
// byte (section offsets are relative to the body), the header is re-padded, and its length,
// bytes and checksum are made consistent again, so only what mutate changed is wrong.
function rewriteHeader(buf, mutate) {
  const H = buf.readUInt32LE(8), body = buf.subarray(16 + H);
  const head = JSON.parse(buf.subarray(16, 16 + H).toString('utf8'));
  mutate(head);
  let len = 0, text = '';
  for (let pass = 0; pass < 4; pass++) {
    head.bytes = 16 + len + body.length;
    text = JSON.stringify(head);
    const n = Buffer.byteLength(text) + ((8 - ((16 + Buffer.byteLength(text)) % 8)) % 8);
    if (n === len) break;
    len = n;
  }
  const hb = Buffer.alloc(len, 0x20); hb.write(text, 0, 'utf8');
  const pre = Buffer.alloc(16); pre.write(CKPT_MAGIC, 0, 'latin1'); pre.writeUInt32LE(len, 8); pre.writeUInt32LE(crc32(hb), 12);
  return Buffer.concat([pre, hb, body]);
}

test('(h) vector sections are XOR and Rice coded, exactly; plain bits still read; a forged section is refused', () => {
  // the coder alone: random stores (nothing to share) and correlated ones, widths that are and
  // are not multiples of 4 bytes, and the edge counts
  const rng = new RNG('compress-xor-rice');
  const bytes = (n) => { const b = Buffer.alloc(n); for (let i = 0; i < n; i++) b[i] = Math.floor(rng.next() * 256); return b; };
  let correlatedSaved = 0;
  for (const [per, count] of [[1, 0], [1, 1], [3, 60], [13, 200], [128, 150], [1024, 1], [1024, 120]]) {
    const rand = bytes(per * count);
    for (const window of [0, 1, 64]) {
      const e = xorRiceEncode(rand, per, count, { window });
      assert.deepEqual(xorRiceDecode(e, per, count), rand, 'random per ' + per + ' count ' + count + ' window ' + window);
      assert.ok(e.length <= Math.ceil(count * (per * 8 + 7) / 8), 'never more than 7 bits a vector over the store');
    }
    // each vector after the first is an earlier one with a few lanes flipped
    const cor = Buffer.from(rand);
    for (let i = 1; i < count; i++) {
      const r = Math.floor(rng.next() * Math.min(i, 64));
      cor.copy(cor, i * per, (i - 1 - r) * per, (i - r) * per);
      for (let f = 0; f < 1 + Math.floor(per / 16); f++) { const bit = Math.floor(rng.next() * per * 8); cor[i * per + (bit >> 3)] ^= 1 << (bit & 7); }
    }
    const e = xorRiceEncode(cor, per, count);
    assert.deepEqual(xorRiceDecode(e, per, count), cor, 'correlated per ' + per + ' count ' + count);
    if (count > 50 && per >= 13) { assert.ok(e.length < cor.length / 2, 'a correlated store codes to under half: ' + e.length + ' of ' + cor.length); correlatedSaved++; }
  }
  assert.equal(correlatedSaved, 3);
  // a stream cut short, or with a byte after it, is refused
  const one = xorRiceEncode(bytes(1024 * 4), 1024, 4);
  assert.throws(() => xorRiceDecode(one.subarray(0, one.length - 3), 1024, 4), /the stream ends inside a code/);
  assert.throws(() => xorRiceDecode(Buffer.concat([one, Buffer.from([7])]), 1024, 4), /after the last vector/);

  // In the container. A test sized whole organism holds too few vectors for the coder to pay
  // (measured: 1 at 2 majors and 49 at 4 majors, t=60 to 300, where the bar organism holds 19685),
  // so the writer keeps them as plain bits, which is its rule. The coded section is graded on a
  // document of 300 packed 8192 lane vectors, each an earlier one with 1 percent of lanes flipped,
  // and the organism grades the other direction: a plain bits file still restores.
  const dir = mkdtempSync(path.join(tmpdir(), 'compress-xr-'));
  let live = null, R = null;
  try {
    const vecs = [bytes(1024)];
    for (let i = 1; i < 300; i++) {
      const v = Buffer.from(vecs[i - 1 - Math.floor(rng.next() * Math.min(i, 40))]);
      for (let f = 0; f < 82; f++) { const bit = Math.floor(rng.next() * 8192); v[bit >> 3] ^= 1 << (bit & 7); }
      vecs.push(v);
    }
    const doc = { version: 3, name: 'xor-rice', clock: { t: 7 }, cells: [], extras: { keys: vecs.map((v) => 'b8192:' + v.toString('base64')), again: ['b8192:' + vecs[5].toString('base64')] } };
    mkdirSync(path.join(dir, 'xr'), { recursive: true });
    const file = path.join(dir, 'xr', 'snapshot.json');
    writeCheckpoint(file, doc);
    const head = readCheckpointHeader(file);
    const hvSec = head.sections.filter((x) => x.name.startsWith('hv.bipolar.'));
    assert.deepEqual(hvSec.map((x) => [x.name, x.enc, x.count]), [['hv.bipolar.8192', 'xor-rice', 300]]);
    assert.ok(hvSec[0].bytes < hvSec[0].raw / 2, 'coded ' + hvSec[0].raw + ' bytes of bits into ' + hvSec[0].bytes);
    assert.deepEqual(readCheckpoint(file).doc, doc, 'the document comes back string for string');
    // the same document with plain bits reads back to the same document, and is larger
    mkdirSync(path.join(dir, 'bits'), { recursive: true });
    const fb = path.join(dir, 'bits', 'snapshot.json');
    writeCheckpoint(fb, doc, { hv: 'bits' });
    assert.deepEqual(readCheckpointHeader(fb).sections.filter((x) => x.name.startsWith('hv.bipolar.')).map((x) => x.enc), ['bits']);
    assert.deepEqual(readCheckpoint(fb).doc, doc);
    assert.ok(statSync(fb).size > statSync(file).size, 'plain bits are larger: ' + statSync(fb).size + ' against ' + statSync(file).size);
    assert.throws(() => writeCheckpoint(fb, doc, { hv: 'zstd' }), /hv must be one of xor-rice, bits/);
    // a whole organism written with plain bits restores
    live = buildWhole({ ...SMALL, majors: 2 }).brain;
    live.tick(20);
    const lf = live.snapshot(path.join(dir, 'org'));
    mkdirSync(path.join(dir, 'orgbits'), { recursive: true });
    writeCheckpoint(path.join(dir, 'orgbits', 'snapshot.json'), readCheckpoint(lf).doc, { hv: 'bits' });
    R = restoreWhole(path.join(dir, 'orgbits'), { ledger: 'off' }).brain;
    assert.equal(R.cells.length, live.cells.length);
    assert.deepEqual(stateDiff([live, R, R], dir, 'bits').diff.v2_live, ['ledger']);
    // an encoding this reader does not know is refused by name, never read as raw bytes
    const buf = readFileSync(file);
    const target = hvSec[0].name;
    const unknown = rewriteHeader(buf, (h) => { for (const x of h.sections) if (x.name === target) x.enc = 'zstd'; });
    assert.throws(() => readCheckpointBuffer(unknown), new RegExp('section ' + target.replace(/./g, '\.') + ' is encoded zstd, which this reader does not know'));
    // a flipped byte whose section checksum has been forged to match: the stored CRC passes, and
    // the CRC of the decoded store (rawCrc32) is what refuses it
    const H = buf.readUInt32LE(8), s0 = hvSec[0];
    let forgedRefused = 0;
    for (const at of [Math.floor(s0.bytes / 3), Math.floor(s0.bytes / 2), s0.bytes - 2]) {
      const bad = Buffer.from(buf);
      bad[16 + H + s0.offset + at] ^= 0x04;
      const forged = rewriteHeader(bad, (h) => { for (const x of h.sections) if (x.name === target) x.crc32 = crc32(bad.subarray(16 + H + s0.offset, 16 + H + s0.offset + s0.bytes)); });
      assert.throws(() => readCheckpointBuffer(forged), new RegExp('section ' + target.replace(/./g, '\.') + ' (does not decode|decodes to bytes that fail their checksum|decodes to [0-9]+ bytes)'));
      forgedRefused++;
    }
    assert.equal(forgedRefused, 3);
    // and the untouched file, re-laid through the same helper, still reads
    assert.deepEqual(readCheckpointBuffer(rewriteHeader(buf, () => {})).doc, doc);
  } finally {
    shutdown(live); shutdown(R);
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- (f)
test('(f) no em dashes in the files of this item', () => {
  const files = ['core/pack.mjs', 'core/persist.mjs', 'core/brain.mjs', 'seeds/whole.mjs', 'bench/compress.mjs', 'test/compress.test.mjs', 'notes/compress.md', 'bench/verdicts/compress.json', 'bench/verdicts/compress-partial.json'];
  for (const f of files) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) continue;
    assert.ok(!readFileSync(p, 'utf8').includes(String.fromCharCode(0x2014)), f + ' has no em dash');
  }
});
