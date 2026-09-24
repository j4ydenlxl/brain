// test/delta.test.mjs: DELTA CHECKPOINTS and PACKED HYPERVECTORS (Board 12, item delta; his P5,
// self compressing). node --test test/delta.test.mjs
//
//   (a) a delta chain restores to the full state: every link reads back to the document it was
//       handed (and its SHA-1, with digest on), and the organism restored from a chain is the live
//       one, at restore and tick for tick on a short lockstep replay
//   (b) every fullEvery deltas the next checkpoint is a full one, and the old chain's files leave
//       only once the new head is down; a writer that did not write the head on disk starts a full
//   (c) a corrupted delta is refused by name, the last good state is returned on request, and the
//       full the chain starts from is untouched on disk and still reads alone; a truncated link, a
//       missing link and a corrupted head are refused too
//   (d) the skeleton patch without zstd (content defined chunks) round trips, in a chain and alone
//   (e) word payloads: every coding the writer picks round trips to the byte
//   (f) packed hypervectors: pack and unpack round trip; Hamming on packed words equals Hamming on
//       the Int8 lanes; the packed store ranks exactly as the lanes do, ties to the earlier vector
//   (g) new vectors coded against held ones (xor-ref, references from HammingLsh) round trip
//   (h) the policy: off by default, per directory, or process wide from BRAIN_CHECKPOINT_DELTA
//   (i) no em dashes in the files of this item
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readJSONStreamed, readCheckpoint, readCheckpointHeader, writeCheckpoint } from '../core/persist.mjs';
import { setDeltaPolicy, clearDeltaPolicy, deltaPolicy, deltaPolicyFor, readChain, readChainHeader, encodeWords, decodeWords, diffText, patchText, CHAIN_DIR, DEFAULT_FULL_EVERY } from '../core/checkpoint-delta.mjs';
import { PackedHVStore, packWords, hammingPacked, hammingLanes, unpackBipolarBits, xorRefEncode, xorRefDecode, HammingLsh, bipolarBytes, packBipolarBits } from '../core/pack.mjs';
import { sim } from '../core/signal.mjs';
import { buildWhole, restoreWhole } from '../seeds/whole.mjs';
import { closeWorld } from '../world/index.mjs';
import { RNG } from '../core/rng.mjs';
import { lockstep, stateDiff } from '../bench/compress.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMALL = { majors: 4, substrateUnits: 128, ledger: 'off', name: 'delta-test', seed: 'delta-test' };
// a process wide policy from the caller's environment would turn the plain writes below into chains
const ENV0 = process.env.BRAIN_CHECKPOINT_DELTA;
delete process.env.BRAIN_CHECKPOINT_DELTA;
const LEDGER_AHEAD = /^ledger\.seq: (\d+) vs (\d+)$/;
const sha1 = (b) => createHash('sha1').update(b).digest('hex');
const tmp = (tag) => mkdtempSync(path.join(tmpdir(), 'delta-' + tag + '-'));

function shutdown(brain) {
  if (!brain) return;
  try { closeWorld(brain); } catch { /* nothing open */ }
  const l = brain.whole && brain.whole.services && brain.whole.services.learning;
  if (l && typeof l.detach === 'function') { try { l.detach(); } catch { /* already detached */ } }
}

// Six documents of one organism, 25 ticks apart, each read back from a plain container 2 file:
// the vectors, word arrays, strings and skeleton a real checkpoint holds, as they move.
let SERIES = null;
function series() {
  if (SERIES) return SERIES;
  const dir = tmp('series');
  const live = buildWhole(SMALL).brain;
  try {
    const docs = [];
    for (let i = 0; i < 6; i++) {
      live.tick(25);
      const f = live.snapshot(path.join(dir, 's' + i), { container: 2 });
      docs.push(readCheckpoint(f).doc);
    }
    SERIES = docs;
    return docs;
  } finally { shutdown(live); rmSync(dir, { recursive: true, force: true }); }
}
const chainFiles = (dir) => (existsSync(path.join(dir, CHAIN_DIR)) ? readdirSync(path.join(dir, CHAIN_DIR)).sort() : []);
const listed = (head) => readChainHeader(head).files.map((f) => path.basename(f.file)).sort();

// ---------------------------------------------------------------- (a)
test('(a) a delta chain restores to the full state, link by link', () => {
  const docs = series();
  const dir = tmp('chain');
  try {
    setDeltaPolicy(dir, { fullEvery: 20, digest: true });
    const head = path.join(dir, 'snapshot.json');
    let written = 0, plain = 0;
    docs.forEach((doc, i) => {
      const r = writeCheckpoint(head, doc, { ruler: { score: 3, of: 3 } });
      assert.equal(r.header.kind, i === 0 ? 'full' : 'delta', 'link ' + i);
      assert.equal(r.header.seq, i);
      const back = readChain(head);
      assert.deepEqual(back.doc, doc, 'link ' + i + ' reads back to the document it was handed');
      assert.equal(back.links, i + 1);
      assert.deepEqual(back.verified, { docSha1: true });
      assert.equal(back.refused, null);
      assert.deepEqual(readJSONStreamed(head), doc, 'the streamed reader (Brain.restore) replays the chain too');
      const h = readCheckpointHeader(head);
      assert.equal(h.bytes, r.header.bytes, 'the head says what this checkpoint wrote');
      assert.equal(h.ruler.bytesPerScorePoint, Math.round((r.header.bytes / 3) * 1000) / 1000);
      written += r.header.bytes;
      const pf = path.join(dir, 'plain-' + i + '.ck2');
      writeCheckpoint(pf, doc, { chain: false });
      plain += statSync(pf).size;
    });
    assert.ok(written < plain, 'the chain wrote ' + written + ' bytes against ' + plain + ' for full checkpoints');
    assert.deepEqual(chainFiles(dir), listed(head), 'the chain directory holds exactly the files the head names');
  } finally { clearDeltaPolicy(dir); rmSync(dir, { recursive: true, force: true }); }
});

test('(a) the organism restored from a chain is the live one, at restore and on a lockstep replay', () => {
  const dir = tmp('organism'), work = tmp('organism-work');
  let live = null, R = null;
  try {
    live = buildWhole(SMALL).brain;
    setDeltaPolicy(dir, { fullEvery: 20, digest: true });
    for (let i = 0; i < 3; i++) { live.tick(30); live.snapshot(dir, { container: 2 }); }
    const h = readCheckpointHeader(path.join(dir, 'snapshot.json'));
    assert.equal(h.kind, 'delta'); assert.equal(h.seq, 2);
    R = restoreWhole(dir, { ledger: 'off' }).brain;
    const at = stateDiff([live, R, R], work, 'at');
    assert.deepEqual(at.diff.v2_live, ['ledger'], 'at restore: ' + at.paths.v2_live.join('; '));
    const m = LEDGER_AHEAD.exec(at.paths.v2_live[0]);
    assert.ok(m, at.paths.v2_live[0]);
    assert.equal(Number(m[1]) - Number(m[2]), 1, 'the restored ledger is one event (learn.attach) ahead');
    const { traces, emitted, firstSplit } = lockstep([live, R], new Map(), 40);
    assert.equal(firstSplit[1], null, 'first split: ' + JSON.stringify(firstSplit[1]));
    assert.deepEqual(traces[1], traces[0]);
    assert.ok(emitted[0] > 0); assert.equal(emitted[1], emitted[0]);
  } finally {
    shutdown(live); shutdown(R); clearDeltaPolicy(dir);
    rmSync(dir, { recursive: true, force: true }); rmSync(work, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- (b)
test('(b) every fullEvery deltas the next checkpoint is a full; the old chain leaves once the new head is down', () => {
  const docs = series();
  const dir = tmp('rotate');
  try {
    setDeltaPolicy(dir, { fullEvery: 2 });
    const head = path.join(dir, 'snapshot.json');
    const kinds = [];
    let firstChain = null;
    docs.forEach((doc, i) => {
      const r = writeCheckpoint(head, doc);
      kinds.push(r.header.kind);
      if (i === 0) firstChain = r.header.chain;
      assert.deepEqual(readCheckpoint(head).doc, doc, 'checkpoint ' + i);
      assert.deepEqual(chainFiles(dir), listed(head), 'after checkpoint ' + i + ' the directory holds the files the head names, no more');
    });
    assert.deepEqual(kinds, ['full', 'delta', 'delta', 'full', 'delta', 'delta']);
    assert.ok(!chainFiles(dir).some((f) => f.startsWith(firstChain + '.')), 'the first chain is gone');
    // a writer that forgets its chain (a restart) finds a head it cannot vouch for: a full again
    clearDeltaPolicy(dir);
    setDeltaPolicy(dir, { fullEvery: 2 });
    const r = writeCheckpoint(head, docs[0]);
    assert.equal(r.header.kind, 'full');
    assert.deepEqual(readCheckpoint(head).doc, docs[0]);
    assert.deepEqual(chainFiles(dir), listed(head));
    assert.equal(deltaPolicy(dir).fullEvery, 2);
    assert.throws(() => setDeltaPolicy(dir, { fullEvery: 0 }), /integer N >= 1/);
  } finally { clearDeltaPolicy(dir); rmSync(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- (c)
test('(c) a corrupted delta is refused by name; the last good state is returned on request; the full is kept', () => {
  const docs = series();
  const dir = tmp('corrupt');
  try {
    setDeltaPolicy(dir, { fullEvery: 20, digest: true });
    const head = path.join(dir, 'snapshot.json');
    for (let i = 0; i < 4; i++) writeCheckpoint(head, docs[i]);
    const files = readChainHeader(head).files;
    assert.deepEqual(files.map((f) => f.kind), ['full', 'delta', 'delta', 'delta']);
    const fullAbs = path.join(dir, files[0].file), fullSha = sha1(readFileSync(fullAbs));
    const headBytes = readFileSync(head);
    // one byte flipped in the middle of link 2
    const d2 = path.join(dir, files[2].file), good2 = readFileSync(d2);
    const bad = Buffer.from(good2); bad[bad.length >>> 1] ^= 0x10;
    writeFileSync(d2, bad);
    const name = path.basename(files[2].file);
    assert.throws(() => readCheckpoint(head), (e) => e.message.includes(name) && /refused/.test(e.message) && /checksum/.test(e.message));
    assert.throws(() => readJSONStreamed(head), (e) => e.message.includes(name));
    const lg = readChain(head, { lastGood: true });
    assert.deepEqual(lg.doc, docs[1], 'the state of the last link that verified');
    assert.equal(lg.links, 2);
    assert.equal(lg.refused.seq, 2);
    assert.ok(lg.refused.file.endsWith(name));
    assert.deepEqual(lg.verified, { docSha1: true });
    assert.equal(sha1(readFileSync(fullAbs)), fullSha, 'the full checkpoint is untouched on disk');
    assert.deepEqual(readCheckpoint(fullAbs).doc, docs[0], 'and still reads alone, as a plain container 2 file');
    // link 1 refused: the last good state is the full itself
    writeFileSync(d2, good2);
    const d1 = path.join(dir, files[1].file), good1 = readFileSync(d1);
    const bad1 = Buffer.from(good1); bad1[bad1.length - 3] ^= 0x01; writeFileSync(d1, bad1);
    const lg1 = readChain(head, { lastGood: true });
    assert.deepEqual(lg1.doc, docs[0]); assert.equal(lg1.refused.seq, 1);
    writeFileSync(d1, good1);
    assert.deepEqual(readCheckpoint(head).doc, docs[3], 'the chain reads again once the link is whole');
    // truncated
    writeFileSync(d2, good2.subarray(0, good2.length - 7));
    assert.throws(() => readCheckpoint(head), /truncated or extended/);
    assert.deepEqual(readChain(head, { lastGood: true }).doc, docs[1]);
    writeFileSync(d2, good2);
    // missing
    unlinkSync(d2);
    assert.throws(() => readCheckpoint(head), (e) => e.message.includes(name) && /not beside it/.test(e.message));
    writeFileSync(d2, good2);
    // the head itself corrupted: refused outright (its header carries its own CRC32)
    const badHead = Buffer.from(headBytes); badHead[badHead.length - 5] ^= 0x04; writeFileSync(head, badHead);
    assert.throws(() => readCheckpoint(head));
    writeFileSync(head, headBytes);
    assert.deepEqual(readCheckpoint(head).doc, docs[3]);
  } finally { clearDeltaPolicy(dir); rmSync(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- (d)
test('(d) the skeleton patch without zstd (content defined chunks) round trips, in a chain and alone', () => {
  const docs = series();
  const dir = tmp('cdc');
  try {
    setDeltaPolicy(dir, { fullEvery: 20, digest: true, zstd: false });
    const head = path.join(dir, 'snapshot.json');
    for (let i = 0; i < 3; i++) {
      writeCheckpoint(head, docs[i]);
      assert.deepEqual(readChain(head).doc, docs[i]);
      if (i > 0) assert.ok(readChainHeader(head).linkSections.some((s) => s.name === 'lits'), 'link ' + i + ' carries its literal pieces');
    }
  } finally { clearDeltaPolicy(dir); rmSync(dir, { recursive: true, force: true }); }
  const rng = new RNG('delta-text');
  const word = () => { let s = ''; const n = 2 + rng.int(9); for (let i = 0; i < n; i++) s += String.fromCharCode(97 + rng.int(26)); return s; };
  const base = Buffer.from(Array.from({ length: 30000 }, word).join(' '));
  const edit = (buf, n) => { let s = buf.toString(); for (let i = 0; i < n; i++) { const at = rng.int(s.length); s = s.slice(0, at) + word() + s.slice(at + rng.int(40)); } return Buffer.from(s); };
  const cases = [[base, base], [Buffer.alloc(0), base], [base, Buffer.alloc(0)], [base, edit(base, 1)], [base, edit(base, 300)], [base, Buffer.concat([Buffer.from('head '), base, Buffer.from(' tail')])], [base, Buffer.from(word().repeat(5000))]];
  for (const [old, neu] of cases) {
    const p = diffText(old, neu);
    assert.ok(Buffer.from(patchText(old, p.ops, p.lits, neu.length)).equals(neu), 'patch of ' + old.length + ' to ' + neu.length + ' bytes');
  }
  const p = diffText(base, edit(base, 5));
  assert.throws(() => patchText(base.subarray(0, 1000), p.ops, p.lits));
});

// ---------------------------------------------------------------- (e)
test('(e) word payloads: every coding the writer picks round trips to the byte', () => {
  const rng = new RNG('delta-words');
  const n = 4096;
  const f32 = (fill) => { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = fill(i); return Buffer.from(a.buffer); };
  const u32 = (fill) => { const a = new Uint32Array(n); for (let i = 0; i < n; i++) a[i] = fill(i) >>> 0; return Buffer.from(a.buffer); };
  const noise = f32(() => rng.gauss());
  const counters = u32((i) => 1000 + i * 3);
  const cases = [
    ['random floats', noise, null],
    ['mostly zero', f32((i) => (i % 17 === 0 ? rng.gauss() : 0)), null],
    ['few changed', (() => { const b = Buffer.from(noise); for (let i = 0; i < 40; i++) b.writeFloatLE(rng.gauss(), 4 * rng.int(n)); return b; })(), noise],
    ['counters stepped', u32((i) => 1000 + i * 3 + 1 + (i % 3)), counters],
    ['bits flipped', u32((i) => ((1000 + i * 3) ^ (1 << (i % 5))) >>> 0), counters],
    ['half changed', f32((i) => (i % 2 ? rng.gauss() : noise.readFloatLE(4 * i))), noise],
    ['all equal', counters, counters],
  ];
  const modes = new Set();
  for (const [what, bytes, base] of cases) {
    const w = encodeWords(bytes, base);
    if (w.mode === 0) { assert.equal(w.blob, null, what); continue; }
    modes.add(w.mode);
    assert.ok(decodeWords(w.blob, w.mode, bytes.length, base).equals(bytes), what + ' (mode ' + w.mode + ')');
  }
  assert.ok(modes.size >= 3, 'the cases exercise ' + modes.size + ' codings: ' + [...modes].join(', '));
  assert.throws(() => encodeWords(Buffer.alloc(6)), /whole number of words/);
  assert.throws(() => encodeWords(noise, Buffer.alloc(8)), /a base of 8 bytes/);
  assert.throws(() => decodeWords(Buffer.alloc(4), 0x7f, 16), /not one this reader knows/);
});

// ---------------------------------------------------------------- (f)
function randomBipolar(rng, n) { const v = new Int8Array(n); for (let i = 0; i < n; i++) v[i] = rng.sign(); return v; }
function flipped(rng, v, k) { const o = Int8Array.from(v); for (let j = 0; j < k; j++) { const i = rng.int(v.length); o[i] = -o[i]; } return o; }
const dot = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += a[i] * b[i]; return d; };

test('(f) packed hypervectors: pack and unpack round trip; Hamming on packed words equals Hamming on lanes', () => {
  const rng = new RNG('delta-pack');
  const L = 8192;
  const vs = [];
  const bases = Array.from({ length: 20 }, () => randomBipolar(rng, L));
  for (let i = 0; i < 500; i++) vs.push(randomBipolar(rng, L));
  for (let i = 0; i < 500; i++) vs.push(flipped(rng, bases[i % 20], rng.int(1200)));
  const store = new PackedHVStore(L, 8);
  for (const v of vs) {
    const w = packWords(v);
    assert.equal(w.length, 256);
    assert.equal(w.byteLength, 1024, '8192 lanes pack to 1024 bytes');
    assert.deepEqual(unpackBipolarBits(new Uint8Array(w.buffer), L), v);
    assert.ok(Buffer.from(w.buffer).equals(Buffer.from(packBipolarBits(v))), 'the words are the container 2 bits');
    store.add(v);
  }
  assert.equal(store.count, 1000); assert.equal(store.usedBytes, 1000 * 1024);
  for (let i = 0; i < vs.length; i += 7) assert.deepEqual(store.get(i), vs[i], 'vector ' + i + ' unpacks exactly');
  let pairs = 0;
  for (let t = 0; t < 2000; t++) {
    const a = vs[rng.int(vs.length)], b = t % 3 === 0 ? flipped(rng, a, rng.int(64)) : vs[rng.int(vs.length)];
    const h = hammingLanes(a, b);
    assert.equal(hammingPacked(packWords(a), packWords(b), 256), h);
    assert.equal(h, (L - dot(a, b)) / 2);
    pairs++;
  }
  assert.equal(pairs, 2000);
  for (let i = 0; i < 50; i++) { const q = vs[rng.int(vs.length)], qw = packWords(q), j = rng.int(vs.length); assert.equal(store.sim(j, qw), sim(vs[j], q), 'sim ' + j); }
  // odd lane counts: the pad bits never count
  for (const n of [1, 31, 33, 100, 8191]) {
    const a = randomBipolar(rng, n), b = randomBipolar(rng, n);
    const s = new PackedHVStore(n); s.add(a);
    assert.equal(s.hamming(0, packWords(b)), hammingLanes(a, b), n + ' lanes');
    assert.deepEqual(s.get(0), a);
  }
  assert.throws(() => store.add(new Int8Array(L)), /outside \+1, -1/);
  assert.throws(() => store.add(new Int8Array(100).fill(1)), /100 lanes/);
});

test('(f) the packed store ranks exactly as the Int8 lanes do, ties to the earlier vector', () => {
  const rng = new RNG('delta-rank');
  const L = 8192;
  const keys = [];
  for (let i = 0; i < 300; i++) keys.push(randomBipolar(rng, L));
  keys.push(Int8Array.from(keys[17]), Int8Array.from(keys[250]));   // exact duplicates: ties
  const store = new PackedHVStore(L);
  for (const k of keys) store.add(k);
  for (let t = 0; t < 60; t++) {
    const q = t % 2 ? flipped(rng, keys[rng.int(keys.length)], 500 + rng.int(2500)) : randomBipolar(rng, L);
    // the Int8 rule of memory.assoc: the first strict maximum of sim()
    let best = -1, bs = -Infinity;
    for (let i = 0; i < keys.length; i++) { const s = sim(keys[i], q); if (s > bs) { bs = s; best = i; } }
    const got = store.nearest(q, 1)[0];
    assert.equal(got.index, best); assert.equal(got.sim, bs);
    // the k nearest: sim descending, index ascending on a tie
    const ranked = keys.map((k, i) => [i, sim(k, q)]).sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 5).map((x) => x[0]);
    assert.deepEqual(store.nearest(q, 5).map((x) => x.index), ranked);
  }
  assert.equal(store.nearest(keys[17], 1)[0].index, 17, 'a tie goes to the earlier vector');
  assert.equal(store.nearest(keys[250], 1)[0].index, 250);
  store.shift(3);
  assert.equal(store.count, keys.length - 3);
  assert.deepEqual(store.get(0), keys[3], 'shift keeps order');
});

// ---------------------------------------------------------------- (g)
test('(g) new vectors coded against held ones (xor-ref) round trip, references proposed by HammingLsh', () => {
  const rng = new RNG('delta-xorref');
  const L = 8192, per = bipolarBytes(L);
  const old = [], neu = [];
  for (let i = 0; i < 40; i++) old.push(Buffer.from(packBipolarBits(randomBipolar(rng, L))));
  for (let i = 0; i < 60; i++) {
    const from = i % 2 ? old[rng.int(40)] : (neu.length ? neu[rng.int(neu.length)] : old[0]);
    const src = i % 3 === 0 ? randomBipolar(rng, L) : flipped(rng, unpackBipolarBits(from, L), rng.int(900));
    neu.push(Buffer.from(packBipolarBits(src)));
  }
  const words = (b) => new Uint32Array(Uint8Array.from(b).buffer);
  const all = (i) => (i < 40 ? old[i] : neu[i - 40]);
  const lsh = new HammingLsh(L);
  old.forEach((b, i) => lsh.add(i, b));
  const refs = new Int32Array(neu.length).fill(-1);
  let referenced = 0;
  neu.forEach((b, i) => {
    let best = -1, bh = Infinity;
    for (const c of lsh.candidates(b)) { if (c >= 40 + i) continue; const h = hammingPacked(words(all(c)), words(b), per / 4); if (h < bh) { bh = h; best = c; } }
    refs[i] = best; if (best >= 0) referenced++;
    lsh.add(40 + i, b);
  });
  assert.ok(referenced > 20, referenced + ' of 60 new vectors found a reference');
  const store = Buffer.concat(neu);
  const enc = xorRefEncode(store, per, neu.length, { base: 40, refs, refAt: (i) => old[i] });
  assert.ok(enc.length < store.length, 'coded ' + enc.length + ' bytes against ' + store.length + ' as bits');
  const dec = xorRefDecode(enc, per, neu.length, { base: 40, refAt: (i) => old[i] });
  assert.ok(Buffer.from(dec).equals(store));
  // a reference forward of the vector is refused on both sides
  const fwd = Int32Array.from(refs); fwd[5] = 40 + 5;
  assert.throws(() => xorRefEncode(store, per, neu.length, { base: 40, refs: fwd, refAt: (i) => old[i] }), /not before it/);
  assert.throws(() => xorRefDecode(enc, per, neu.length, { base: 40, refAt: () => null }));
});

// ---------------------------------------------------------------- (h)
test('(h) the policy: off by default, per directory, or process wide from BRAIN_CHECKPOINT_DELTA', () => {
  const dir = tmp('policy');
  const f = path.join(dir, 'snapshot.json');
  try {
    assert.equal(deltaPolicyFor(f), null, 'off by default');
    process.env.BRAIN_CHECKPOINT_DELTA = '5';
    assert.equal(deltaPolicyFor(f).fullEvery, 5);
    process.env.BRAIN_CHECKPOINT_DELTA = 'on';
    assert.equal(deltaPolicyFor(f).fullEvery, DEFAULT_FULL_EVERY);
    process.env.BRAIN_CHECKPOINT_DELTA = 'off';
    assert.equal(deltaPolicyFor(f), null);
    process.env.BRAIN_CHECKPOINT_DELTA = '-3';
    assert.throws(() => deltaPolicyFor(f), /integer N >= 1/);
    delete process.env.BRAIN_CHECKPOINT_DELTA;
    setDeltaPolicy(dir, { fullEvery: 7, digest: true });
    assert.deepEqual(deltaPolicyFor(f), { fullEvery: 7, digest: true, zstd: true });
    clearDeltaPolicy(dir);
    assert.equal(deltaPolicyFor(f), null);
  } finally {
    delete process.env.BRAIN_CHECKPOINT_DELTA;
    clearDeltaPolicy(dir); rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- (i)
test('(i) no em dashes in the files of this item', () => {
  const files = ['core/checkpoint-delta.mjs', 'core/pack.mjs', 'core/persist.mjs', 'bench/compress.mjs', 'test/delta.test.mjs', 'test/compress.test.mjs', 'notes/compress.md', 'bench/verdicts/compress.json', 'bench/verdicts/compress-partial.json'];
  let seen = 0;
  for (const f of files) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) continue;
    seen++;
    assert.ok(!readFileSync(p, 'utf8').includes(String.fromCharCode(0x2014)), f + ' has no em dash');
  }
  assert.ok(seen >= 6, seen + ' files read');
});

test.after(() => { if (ENV0 === undefined) delete process.env.BRAIN_CHECKPOINT_DELTA; else process.env.BRAIN_CHECKPOINT_DELTA = ENV0; });
