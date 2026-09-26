// test/cloud-fit-stream.test.mjs: THE STREAMED CHECKPOINT (board 19 builder, queue item 9, B1 the fit).
//
// core/persist.mjs writeCheckpointStreamed writes the container 2 checkpoint in bounded blocks
// from a lazy snapshot document (core/brain.mjs snapshotDoc), and daemon/run.mjs uses it unless
// BRAIN_CHECKPOINT_STREAM=0 (the control). The format is unchanged, so every test here compares
// against today's writer (writeCheckpoint), byte for byte. The checkpoint is a binary container,
// not JSON text, so "JSON.stringify" enters where it can: the document read back from the streamed
// file is JSON.stringify-equal to the planted one. No daemon, no model, no network; every file is
// written under the OS temp dir.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { RNG } from '../core/rng.mjs';
import { writeCheckpoint, writeCheckpointStreamed, readCheckpoint, readCheckpointHeader, STREAM_BLOCK } from '../core/persist.mjs';
import { xorRiceEncode, XorRiceStream, packBipolarBits, bipolarBytes } from '../core/pack.mjs';
import { packHV } from '../core/signal.mjs';
import { buildWhole, restoreWhole } from '../seeds/whole.mjs';
import { closeWorld } from '../world/index.mjs';
import { checkpointStream } from '../daemon/run.mjs';

const tmp = (tag) => mkdtempSync(path.join(tmpdir(), 'cloud-fit-stream-' + tag + '-'));
const b64 = (ta) => Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength).toString('base64');
function bip(rng, lanes) { const v = new Int8Array(lanes); for (let i = 0; i < lanes; i++) v[i] = rng.int(2) ? 1 : -1; return v; }
function ter(rng, lanes) { const v = new Int8Array(lanes); for (let i = 0; i < lanes; i++) v[i] = rng.int(3) - 1; return v; }
function f32(rng, n) { const v = new Float32Array(n); for (let i = 0; i < n; i++) v[i] = rng.next() * 2 - 1; return v; }

// A document with every shape the table knows: packed vectors ("b<lanes>:"), Int8 bipolar and
// ternary base64, other base64, the typed edge columns, repeated payloads, the same vector under
// two string forms, strings that need the '~' escape, unicode, numbers, holes and a raw typed
// array (written as JSON.stringify writes it, today's encoding).
function plantedDoc(n, seed = 'planted') {
  const rng = new RNG(seed);
  const base = []; for (let i = 0; i < 24; i++) base.push(bip(rng, 1024));
  const vec = (i) => { const v = Int8Array.from(base[i % base.length]); for (let f = 0; f < 3 + (i % 7); f++) v[rng.int(v.length)] *= -1; return v; };
  const cells = [];
  for (let i = 0; i < n; i++) {
    const v = vec(i);
    cells.push({
      id: 'c' + i, idx: i, kind: i % 3 ? 'unit' : 'major', region: '~r' + (i % 4), note: i % 5 ? 'naïve ✓ 𝄞 ' + i : '~b' + i,
      state: { hv: packHV(v), again: i % 4 === 0 ? b64(v) : null, tern: i % 9 === 0 ? b64(ter(rng, 256)) : undefined, vec: i % 6 === 0 ? b64(f32(rng, 32)) : 'short', w: [rng.next(), -0, NaN, null, true, undefined] },
      mail: i % 2 ? [{ sig: { kind: 'hv', data: packHV(base[i % base.length]) }, w: 0.5 }] : [],
    });
  }
  const E = 64 + n;
  const col = (T, fill) => { const a = new T(E); for (let i = 0; i < E; i++) a[i] = fill(i); return b64(a); };
  return {
    version: 3, name: 'planted', clock: { t: 1234 + n, gen: 2 }, rng: { s: [1, 2, 3, 4] },
    cells,
    connectome: { n: E, src: col(Uint32Array, (i) => i % n), dst: col(Uint32Array, (i) => (i * 7) % n), srcPort: col(Uint8Array, (i) => i & 3), dstPort: col(Uint8Array, (i) => (i >> 2) & 3), w: col(Float32Array, (i) => i / E), delay: col(Uint16Array, (i) => i & 15), usage: col(Uint32Array, (i) => i * 3), lastT: col(Float64Array, (i) => i * 1.5), conf: col(Float32Array, () => 0.25), flags: col(Uint8Array, (i) => i & 1) },
    coact: { keys: col(Float64Array, (i) => i * 1e6 + 7), vals: col(Uint32Array, (i) => i + 1) },
    raw: new Int8Array([1, -1, 1]), sparse: [1, , 3], nested: { deep: [[{ x: 'y' }]], empty: {}, list: [] },
    extras: { whole: { memory: { keys: base.slice(0, 8).map((v) => packHV(v)) }, text: 'a long leaf '.repeat(40) } },
  };
}
const RULER = { score: 12, of: 36, source: 'test' };
function both(doc, dir, opts = {}) {
  const a = path.join(dir, 'a.json'), b = path.join(dir, 'b.json');
  writeCheckpoint(a, doc, { ruler: RULER, hv: opts.hv || 'xor-rice' });
  const res = writeCheckpointStreamed(b, doc, { ruler: RULER, hv: opts.hv || 'xor-rice', ...(opts.blockBytes ? { blockBytes: opts.blockBytes } : {}), ...(opts.probe ? { probe: opts.probe } : {}) });
  return { a: readFileSync(a), b: readFileSync(b), res, fileB: b };
}

test('a planted snapshot written by the streamed writer is byte-identical to today\'s writer, and reads back JSON.stringify-equal', () => {
  const dir = tmp('bytes');
  try {
    for (const n of [0, 1, 40, 300]) for (const hv of ['xor-rice', 'bits']) for (const blockBytes of [1024, 4096, undefined]) {
      const doc = plantedDoc(n, 'p' + n);
      const { a, b, res, fileB } = both(doc, dir, { hv, blockBytes });
      assert.ok(a.equals(b), 'n ' + n + ' hv ' + hv + ' block ' + blockBytes + ': ' + a.length + ' vs ' + b.length + ' bytes');
      assert.equal(res.bytes, b.length);
      assert.equal(JSON.stringify(readCheckpoint(fileB).doc), JSON.stringify(doc), 'n ' + n + ': the document read back');
    }
    const h = readCheckpointHeader(path.join(dir, 'b.json'));
    assert.ok(h.census.packed > 0 && h.census.bipolar > 0 && h.census.ternary > 0 && h.census.b64 > 0 && h.census.typed === 12, JSON.stringify(h.census));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('the chunk boundaries (a skeleton past SKEL_CHUNK characters, payload bytes past BYTES_CHUNK) give the same bytes', () => {
  const dir = tmp('chunks');
  try {
    const rng = new RNG('chunks');
    const words = []; for (let i = 0; i < 180_000; i++) words.push('a leaf that is not a payload, number ' + i + ' of the skeleton text ' + 'z'.repeat(i % 60));
    const blobs = []; for (let i = 0; i < 36; i++) { const f = new Float32Array(1 << 18); for (let j = 0; j < f.length; j += 97) f[j] = rng.next(); f[0] = i; blobs.push(b64(f)); }
    const doc = { version: 3, name: 'chunks', clock: { t: 1 }, cells: [], words, blobs };
    const { a, b, res } = both(doc, dir, {});
    const h = readCheckpointHeader(path.join(dir, 'b.json'));
    const sk = h.sections.find((s) => s.name === 'skeleton'), by = h.sections.find((s) => s.name === 'bytes');
    assert.ok(sk.chunks.length >= 2, 'skeleton chunks ' + sk.chunks.length);
    assert.ok(by.chunks.length >= 2, 'bytes chunks ' + by.chunks.length);
    assert.ok(a.equals(b), a.length + ' vs ' + b.length + ' bytes');
    assert.ok(res.stream.maxWriteBytes <= res.stream.blockBytes);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('a whole organism: the lazy document and the streamed writer give today\'s bytes, and the daemon\'s reader restores its typed arrays', () => {
  const dir = tmp('whole');
  let brain = null, back = null;
  try {
    ({ brain } = buildWhole({ majors: 2, substrateUnits: 32, ledger: 'off', dir: path.join(dir, 'live'), name: 'fit-stream', seed: 'fit-stream', mindText: 'a small organism for the streamed checkpoint. '.repeat(10) }));
    brain.tick(150);
    const rng = new RNG('fit-stream-episodes');
    const ep = brain.memory.episodic;
    for (let i = 0; i < 20; i++) ep.append({ key: bip(rng, ep.d), t: brain.clock.t, value: { i } });
    assert.equal(JSON.stringify(brain.snapshotDoc(3, { lazy: true })), JSON.stringify(brain.snapshotDoc(3)), 'lazy and eager documents');
    brain.snapshot(path.join(dir, 'eager'), { container: 2 });
    brain.snapshot(path.join(dir, 'streamed'), { container: 2, stream: true });
    const a = readFileSync(path.join(dir, 'eager', 'snapshot.json')), b = readFileSync(path.join(dir, 'streamed', 'snapshot.json'));
    assert.ok(a.equals(b), a.length + ' vs ' + b.length + ' bytes');
    ({ brain: back } = restoreWhole(path.join(dir, 'streamed'), { ledger: 'off' }));
    assert.equal(back.clock.t, brain.clock.t);
    assert.equal(back.cells.length, brain.cells.length);
    const c0 = brain.connectome.serialize(), c1 = back.connectome.serialize();
    for (const k of ['src', 'dst', 'w', 'lastT', 'usage']) assert.equal(c1[k], c0[k], 'connectome column ' + k);
    const e1 = back.memory.episodic;
    assert.equal(e1.n, ep.n);
    for (let i = 0; i < ep.n; i++) assert.ok(Buffer.from(e1.keyAt(i).buffer, e1.keyAt(i).byteOffset, e1.keyAt(i).byteLength).equals(Buffer.from(ep.keyAt(i).buffer, ep.keyAt(i).byteOffset, ep.keyAt(i).byteLength)), 'episodic key ' + i);
  } finally {
    for (const x of [brain, back]) if (x) { try { closeWorld(x); } catch { /* nothing open */ } }
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the writer never holds more than its stated bound, and the bound does not grow with the document', () => {
  const dir = tmp('bound');
  try {
    const block = 4096;
    const runs = [];
    for (const n of [200, 2000]) {
      const writes = [];
      const { a, b, res } = both(plantedDoc(n, 'bound'), dir, { blockBytes: block, probe: (p) => writes.push(p.bytes) });
      assert.ok(a.equals(b));
      assert.ok(Math.max(...writes) <= block, 'largest write ' + Math.max(...writes));
      assert.equal(writes.reduce((x, y) => x + y, 0), b.length, 'the writes add up to the file');
      assert.ok(res.stream.maxWriteBytes <= block);
      if (res.stream.zlib.startsWith('incremental')) assert.ok(res.stream.peakHeldBytes <= res.stream.boundBytes, 'held ' + res.stream.peakHeldBytes + ' over the bound ' + res.stream.boundBytes);
      runs.push({ n, file: b.length, spill: res.stream.spillBytes, held: res.stream.peakHeldBytes, bound: res.stream.boundBytes });
    }
    assert.ok(runs[1].file > 5 * runs[0].file, JSON.stringify(runs));
    assert.equal(runs[1].bound, runs[0].bound, 'the bound is the same for a document ten times larger: ' + JSON.stringify(runs));
    assert.ok(runs[1].held <= runs[0].bound, JSON.stringify(runs));
    assert.equal(STREAM_BLOCK, 64 << 10);
    assert.throws(() => writeCheckpointStreamed(path.join(dir, 'x.json'), plantedDoc(1), { blockBytes: 10 }), /blockBytes/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('temp then rename: no temp or spill file after success, and a planted mid-write error leaves the last checkpoint whole', () => {
  const dir = tmp('atomic');
  try {
    const file = path.join(dir, 'snapshot.json');
    writeCheckpointStreamed(file, plantedDoc(50, 'first'), { ruler: RULER });
    assert.deepEqual(readdirSync(dir), ['snapshot.json']);
    const good = readFileSync(file);
    // a failure while the temp file is being written (the probe throws after three blocks)
    assert.throws(() => writeCheckpointStreamed(file, plantedDoc(400, 'second'), { ruler: RULER, blockBytes: 1024, probe: (p) => { if (p.at > 3 * 1024) throw new Error('planted: the disk went away'); } }), /planted: the disk went away/);
    assert.deepEqual(readdirSync(dir), ['snapshot.json'], 'no temp or spill file left');
    assert.ok(readFileSync(file).equals(good), 'the last good checkpoint is untouched');
    // a failure in the middle of the walk (a value that throws when read), with the spill open
    const bad = plantedDoc(30, 'third');
    Object.defineProperty(bad.cells[20], 'state', { enumerable: true, get() { throw new Error('planted: a cell that cannot be read'); } });
    assert.throws(() => writeCheckpointStreamed(file, bad, { ruler: RULER }), /planted: a cell that cannot be read/);
    assert.deepEqual(readdirSync(dir), ['snapshot.json']);
    assert.ok(readFileSync(file).equals(good));
    assert.ok(!existsSync(file + '.tmp') && !existsSync(file + '.spill'));
    assert.equal(JSON.stringify(readCheckpoint(file).doc), JSON.stringify(plantedDoc(50, 'first')));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('the streamed xor-rice coder writes exactly xorRiceEncode\'s bits', () => {
  const rng = new RNG('xor-rice-stream');
  for (const per of [1024, 128, 6, 3]) for (const count of [0, 1, 2, 70, 150]) for (const clustered of [false, true]) for (const window of [64, 3, 0]) {
    const store = Buffer.alloc(per * count);
    let seedV = Buffer.alloc(per); for (let b = 0; b < per; b++) seedV[b] = rng.int(256);
    for (let i = 0; i < count; i++) {
      const v = Buffer.alloc(per);
      if (clustered) { seedV.copy(v); for (let f = 0; f < 4; f++) v[rng.int(per)] ^= 1 << rng.int(8); if (i % 13 === 0) for (let b = 0; b < per; b++) seedV[b] = rng.int(256); }
      else for (let b = 0; b < per; b++) v[b] = rng.int(256);
      v.copy(store, i * per);
    }
    const want = xorRiceEncode(store, per, count, { window });
    const parts = [];
    const s = new XorRiceStream(per, (b) => parts.push(Buffer.from(b)), { window, block: 64 });
    for (let i = 0; i < count; i++) s.push(store.subarray(i * per, (i + 1) * per));
    assert.equal(s.finish(), want.length);
    assert.ok(Buffer.concat(parts).equals(want), 'per ' + per + ' count ' + count + ' clustered ' + clustered + ' window ' + window);
  }
  const bits = packBipolarBits(bip(rng, 8192), Buffer.alloc(bipolarBytes(8192)));
  assert.equal(bits.length, 1024);
});

test('the control: BRAIN_CHECKPOINT_STREAM=0 turns the streamed writer off, anything else leaves it on', () => {
  assert.equal(checkpointStream({}), true);
  assert.equal(checkpointStream({ BRAIN_CHECKPOINT_STREAM: '1' }), true);
  assert.equal(checkpointStream({ BRAIN_CHECKPOINT_STREAM: '0' }), false);
  assert.equal(checkpointStream({ BRAIN_CHECKPOINT_STREAM: ' 0 ' }), false);
  const src = readFileSync(new URL('../daemon/run.mjs', import.meta.url), 'utf8');
  assert.match(src, /brain\.snapshot\(L\.dir, ruler \? \{ ruler, stream \} : \{ stream \}\)/, 'the daemon checkpoint passes the switch');
});
