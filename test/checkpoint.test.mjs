// test/checkpoint.test.mjs: THE CHECKPOINT FORMAT, GRADED AGAINST THE FORMAT IT REPLACED.
//
// core/persist.mjs format 3 writes every repeated payload string once into a deflated blob
// table of TEXT and leaves a reference behind. Format 4 keeps that document byte for byte and
// changes only what the table holds: the payloads' decoded BYTES, with a bipolar vector packed
// one bit per element. The claim of both is that they change the SIZE and nothing else, so
// every test here compares a format against the thing it replaced (a format 2 file and a
// format 3 file of the same brain, both kept as fixtures, both written by the writer as it
// stood BEFORE the format after them) or against a control (the same brain ticked on without
// a checkpoint at all), never against itself.
//
// test/fixtures/checkpoint-v2/snapshot.json is written by `node bench/checkpoint.mjs
// --make-fixture` through the unchanged format 2 path, which is byte for byte what the writer
// produced before 2026-09-18.
// test/fixtures/checkpoint-v3/snapshot.json is THE SAME BRAIN, written by the format 3 writer
// before format 4 existed. Neither fixture is regenerated: a fixture a later writer produced
// would grade the new code against itself.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, statSync, writeFileSync, readFileSync, existsSync, openSync, readSync, closeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Brain } from '../core/brain.mjs';
import { serializeCell } from '../core/cell.mjs';
import { RNG } from '../core/rng.mjs';
import { packHV } from '../core/signal.mjs';
import {
  writeJSONStreamed, readJSONStreamed, expandBlobTable, packBipolar, unpackBipolar,
  BLOB_ENC, BLOB_ENC_V3, BLOB_ENC_V4,
} from '../core/persist.mjs';
import { buildFixtureBrain } from '../bench/checkpoint.mjs';
import '../cells/all.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const FIXTURE_V2 = path.join(ROOT, 'test', 'fixtures', 'checkpoint-v2');
const FIXTURE_V3 = path.join(ROOT, 'test', 'fixtures', 'checkpoint-v3');

const tmp = () => mkdtempSync(path.join(tmpdir(), 'brain-ckpt-'));
const RESTORE_OPTS = { dir: null, ledger: 'off', growth: { enabled: false }, pruneEvery: 0 };

// Everything a restore has to reproduce, pulled out of a live brain in one shape so two brains
// can be compared with one deepEqual instead of a list of assertions that can forget a field.
function organism(b) {
  return {
    clock: b.clock.serialize(),
    stats: b.stats,
    // serializeCell is the same function the checkpoint itself uses, so a field it writes is a
    // field this comparison covers; JSON round tripping it turns typed arrays into the plain
    // values deepEqual can compare.
    cells: b.cells.map((c) => JSON.parse(JSON.stringify(serializeCell(c)))),
    connectome: b.connectome.serialize(),
    edges: b.connectome.size(), live: b.connectome.live(),
  };
}

// A format 3 file of a document the caller already has. brain.snapshot cannot write one any
// more (core/brain.mjs passes `intern: version >= 3`, a boolean, and the writer's current best
// table for `true` is format 4), so the format 3 arm is written here the way bench/checkpoint.mjs
// writes it: through the writer, naming the table version.
function writeFormat3(dir, doc) {
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'snapshot.json');
  writeJSONStreamed(file, doc, { intern: 3 });
  return file;
}

test('checkpoint: a format 2 file written before the change restores, and a format 4 file of the same brain restores to the same organism', async () => {
  assert.ok(existsSync(path.join(FIXTURE_V2, 'snapshot.json')), 'the format 2 fixture exists (node bench/checkpoint.mjs --make-fixture)');
  const raw = JSON.parse(readFileSync(path.join(FIXTURE_V2, 'snapshot.json'), 'utf8'));
  assert.equal(raw.version, 2, 'the fixture really is a format 2 file');
  assert.equal(raw.blobs, undefined, 'a format 2 file carries no blob table');

  const dir = tmp();
  try {
    // the fixture, restored, is the CONTROL: the organism as the old format hands it back
    const a = Brain.restore(FIXTURE_V2, RESTORE_OPTS);

    // the same organism written through today's writer and read back
    const v4 = path.join(dir, 'v4');
    const f4 = a.snapshot(v4, { version: 3 });
    const doc4 = JSON.parse(readFileSync(f4, 'utf8'));
    assert.equal(doc4.blobs.enc, BLOB_ENC, 'today\'s writer carries the current blob table');
    assert.equal(BLOB_ENC, BLOB_ENC_V4, 'and the current table is format 4');
    assert.ok(doc4.blobs.count > 0, 'the fixture has payloads to intern: ' + doc4.blobs.count);
    const b = Brain.restore(v4, RESTORE_OPTS);

    // FIELD FOR FIELD: cells, connectome, stats and clock
    assert.deepEqual(organism(b), organism(a), 'format 4 restores the organism the format 2 file restored');

    // and the reader hands the document back in exactly the shape a format 2 one had
    const resolved = readJSONStreamed(f4);
    assert.equal(resolved.blobs, undefined, 'the blob table is gone by the time a reader sees the document');
    const fixtureDoc = readJSONStreamed(path.join(FIXTURE_V2, 'snapshot.json'));
    for (const k of ['cells', 'connectome', 'mailboxes', 'inflight', 'outbox', 'coact', 'stats', 'clock']) {
      assert.deepEqual(resolved[k], fixtureDoc[k], 'section ' + k + ' reads back identical to the format 2 file');
    }

    // format 1: the sections that did not exist yet are absent, and it still restores
    const v1 = path.join(dir, 'v1');
    mkdirSync(v1, { recursive: true });
    const j1 = readJSONStreamed(path.join(FIXTURE_V2, 'snapshot.json'));
    delete j1.coact; delete j1.ledger; j1.version = 1;
    writeFileSync(path.join(v1, 'snapshot.json'), JSON.stringify(j1));
    const one = Brain.restore(v1, RESTORE_OPTS);
    assert.equal(one.cells.length, a.cells.length);
    assert.equal(one.clock.t, a.clock.t);
    assert.equal(one.connectome.size(), a.connectome.size());
    assert.equal(one.coact.counts.size, 0, 'no counters in a format 1 file, so none are invented');

    const v2bytes = statSync(path.join(FIXTURE_V2, 'snapshot.json')).size;
    const v4bytes = statSync(f4).size;
    console.log('  fixture: format 2 ' + v2bytes + ' B -> format 4 ' + v4bytes + ' B, ' + (v2bytes / v4bytes).toFixed(4) + 'x smaller');
    assert.ok(v4bytes < v2bytes, 'format 4 is smaller: ' + v4bytes + ' against ' + v2bytes);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('checkpoint: versions 2, 3 and 4 of ONE brain restore to one organism, field for field', () => {
  const dir = tmp();
  try {
    // The two fixtures are the same brain written by two writers that no longer exist in the
    // tree: the format 2 writer and the format 3 writer. That is what makes them a control.
    const f2 = path.join(FIXTURE_V2, 'snapshot.json');
    const f3 = path.join(FIXTURE_V3, 'snapshot.json');
    assert.ok(existsSync(f3), 'the format 3 fixture exists');
    const rawV3 = JSON.parse(readFileSync(f3, 'utf8'));
    assert.equal(rawV3.version, 3, 'the v3 fixture really is a version 3 document');
    assert.equal(rawV3.blobs.enc, BLOB_ENC_V3, 'and its table really is the format 3 table of TEXT');

    // the two fixtures are the same document, so any difference below is the format's
    const doc2 = readJSONStreamed(f2), doc3 = readJSONStreamed(f3);
    for (const k of ['name', 'clock', 'cells', 'connectome', 'mailboxes', 'inflight', 'outbox', 'coact', 'stats']) {
      assert.deepEqual(doc3[k], doc2[k], 'the v3 fixture is the same brain as the v2 fixture: ' + k);
    }

    // format 4 of that same document, written by today's writer
    const v4dir = path.join(dir, 'v4');
    mkdirSync(v4dir, { recursive: true });
    const f4 = path.join(v4dir, 'snapshot.json');
    writeJSONStreamed(f4, readJSONStreamed(f2), { intern: true });
    const rawV4 = JSON.parse(readFileSync(f4, 'utf8'));
    assert.equal(rawV4.blobs.enc, BLOB_ENC_V4);
    assert.equal(rawV4.blobs.count, rawV3.blobs.count, 'the same payloads reach the table under both tables');

    // THE DOCUMENT AROUND THE TABLE IS THE SAME BYTES. This is the whole claim of format 4:
    // it changed the table and nothing else, so the two files differ only in `blobs`.
    const strip = (f) => { const j = JSON.parse(readFileSync(f, 'utf8')); delete j.blobs; return JSON.stringify(j); };
    const only3 = writeFormat3(path.join(dir, 'v3'), readJSONStreamed(f2));
    assert.equal(strip(f4), strip(only3), 'format 3 and format 4 write the same document outside the table');

    // FIELD FOR FIELD, all three restored
    const a = Brain.restore(FIXTURE_V2, RESTORE_OPTS);
    const b = Brain.restore(FIXTURE_V3, RESTORE_OPTS);
    const c = Brain.restore(v4dir, RESTORE_OPTS);
    const oa = organism(a);
    assert.deepEqual(organism(b), oa, 'format 3 restores the organism format 2 restored');
    assert.deepEqual(organism(c), oa, 'format 4 restores the organism format 2 restored');

    const s2 = statSync(f2).size, s3 = statSync(f3).size, s4 = statSync(f4).size;
    console.log('  one brain, three formats: v2 ' + s2 + ' B, v3 ' + s3 + ' B, v4 ' + s4 + ' B');
    assert.ok(s4 <= s3, 'format 4 is not larger than format 3: ' + s4 + ' against ' + s3);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('persist: a packed bipolar vector unpacks element for element', () => {
  const cases = [];
  const rng = new RNG('checkpoint:bipolar');            // deterministic, core/rng.mjs
  for (const n of [1, 7, 8, 9, 63, 255, 1000, 8192]) {  // 1000 and 255 are not multiples of 8
    const v = Buffer.allocUnsafe(n);
    for (let i = 0; i < n; i++) v[i] = rng.u32() & 1 ? 1 : 255; // +1 / -1 as an Int8Array reads them
    cases.push(['random ' + n, v]);
  }
  cases.push(['all +1, 8192', Buffer.alloc(8192, 1)]);
  cases.push(['all -1, 8192', Buffer.alloc(8192, 255)]);
  cases.push(['all +1, 13 (not a multiple of 8)', Buffer.alloc(13, 1)]);
  cases.push(['all -1, 13 (not a multiple of 8)', Buffer.alloc(13, 255)]);

  for (const [label, v] of cases) {
    const bits = packBipolar(v);
    assert.equal(bits.length, (v.length + 7) >>> 3, label + ': one bit per element, ' + v.length + ' elements');
    const back = unpackBipolar(bits, v.length);
    assert.equal(back.length, v.length, label + ': length');
    for (let i = 0; i < v.length; i++) assert.equal(back[i], v[i], label + ': element ' + i);
    // and as the Int8Array a reader hands back, element for element
    const original = new Int8Array(v.buffer, v.byteOffset, v.length);
    const restored = new Int8Array(back.buffer, back.byteOffset, back.length);
    for (let i = 0; i < original.length; i++) assert.equal(restored[i], original[i], label + ': Int8 element ' + i);
  }
  // the padding bits of a length that is not a multiple of 8 are not read back as elements
  const odd = Buffer.alloc(5, 1);
  const packed = packBipolar(odd);
  packed[0] |= 0b11100000; // set the three bits past the end
  const back = unpackBipolar(packed, 5);
  assert.equal(back.length, 5, 'only the declared elements come back');
  console.log('  bit identity: ' + (cases.length + 1) + ' vectors packed and unpacked element for element');
});

test('persist: every payload shape in the table comes back as the string it was written from', () => {
  const dir = tmp();
  try {
    const rng = new RNG('checkpoint:payloads');
    const int8 = Buffer.allocUnsafe(8192);
    for (let i = 0; i < int8.length; i++) int8[i] = rng.u32() & 255;           // not bipolar
    const bip = Buffer.allocUnsafe(8192);
    for (let i = 0; i < bip.length; i++) bip[i] = rng.u32() & 1 ? 1 : 255;     // bipolar
    const f32 = Buffer.allocUnsafe(4096);
    for (let i = 0; i < f32.length; i++) f32[i] = rng.u32() & 255;

    const hv = new Int8Array(bip.buffer, bip.byteOffset, bip.length);
    const doc = {
      bipolarB64: bip.toString('base64'),      // tag 3: one bit per element
      plainB64: int8.toString('base64'),       // tag 2: the decoded bytes
      floatB64: f32.toString('base64'),        // tag 2
      packed: packHV(hv),                      // tag 4: "b8192:<base64>", already one bit per lane
      allPlus: Buffer.alloc(8192, 1).toString('base64'),
      allMinus: Buffer.alloc(8192, 255).toString('base64'),
      notCanonical: 'A'.repeat(61) + '=',      // base64 shaped, does not re-encode to itself: tag 1
      colonish: 'b8192:' + 'not base64 at all, but long enough and admitted by the payload class'.replace(/[^A-Za-z0-9+/=]/g, ''),
      shortEnough: 'AAAA',                     // under 48 bytes: never interned
      escaped: '~b0',                          // a value that LOOKS like a reference
      repeated: [bip.toString('base64'), bip.toString('base64')],
    };
    const f4 = path.join(dir, 'v4.json');
    writeJSONStreamed(f4, doc, { intern: true });
    assert.deepEqual(readJSONStreamed(f4), doc, 'every payload shape round trips through the format 4 table');
    assert.deepEqual(readJSONStreamed(f4, { limit: 8 }), doc, 'and through the walking reader');

    const table = JSON.parse(readFileSync(f4, 'utf8')).blobs;
    assert.equal(table.enc, BLOB_ENC_V4);
    const texts = expandBlobTable(table);
    assert.equal(texts.length, table.count, 'the table holds what it declares');
    assert.ok(texts.includes(doc.packed), 'the packed hypervector is in the table as itself');
    assert.ok(texts.includes(doc.bipolarB64), 'the bipolar payload is in the table as itself');

    // THE CONTROL: the same document under format 3, the table this one replaced. Same strings,
    // same count, and a smaller file, because bipolar text is where the bits are.
    const f3 = path.join(dir, 'v3.json');
    writeJSONStreamed(f3, doc, { intern: 3 });
    assert.deepEqual(readJSONStreamed(f3), doc, 'format 3 still round trips');
    const t3 = expandBlobTable(JSON.parse(readFileSync(f3, 'utf8')).blobs);
    assert.deepEqual(t3, texts, 'both tables hold the same payloads in the same order');
    const s3 = statSync(f3).size, s4 = statSync(f4).size;
    console.log('  payload shapes: format 3 ' + s3 + ' B -> format 4 ' + s4 + ' B');
    assert.ok(s4 < s3, 'format 4 is smaller on a document of bipolar payloads: ' + s4 + ' against ' + s3);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('checkpoint: a brain snapshotted, restored and ticked on matches the same brain ticked on without a checkpoint', async () => {
  const dir = tmp();
  try {
    const MORE = 25;
    // one seed, one build; the CONTROL is the same brain ticked on with no checkpoint between
    const live = await buildFixtureBrain({ seed: 'checkpoint-continuity', ticks: 30 });
    const d = path.join(dir, 'k');
    live.snapshot(d, { version: 3 });
    const restored = Brain.restore(d, RESTORE_OPTS);

    live.tick(MORE);
    restored.tick(MORE);
    assert.equal(restored.clock.t, live.clock.t, 'clock');
    assert.equal(restored.clock.gen, live.clock.gen, 'generation');
    assert.deepEqual(restored.stats, live.stats, 'stats after ' + MORE + ' more ticks');
    assert.equal(restored.connectome.size(), live.connectome.size(), 'edge count');
    assert.equal(restored.connectome.live(), live.connectome.live(), 'live edge count');
    assert.deepEqual(organism(restored), organism(live), 'every cell, field for field, after ' + MORE + ' more ticks');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('persist: a reference is unambiguous, and a document with no table is untouched', () => {
  const dir = tmp();
  try {
    const payload = 'A'.repeat(60); // long enough and base64 shaped: this one is interned
    const doc = {
      a: payload, b: payload, c: '~b0', d: '~b0~', e: '~', f: 'short', g: [payload, '~b7'],
      h: { '~b0': payload, 'a key that is long enough to be a payload if keys were interned AAAA': 1 },
      n: 42, z: null,
    };
    const file = path.join(dir, 'x.json');
    writeJSONStreamed(file, doc, { intern: true });
    const onDisk = JSON.parse(readFileSync(file, 'utf8'));
    assert.equal(onDisk.blobs.enc, BLOB_ENC);
    assert.equal(onDisk.blobs.count, 1, 'the repeated payload is stored once');
    assert.equal(onDisk.a, onDisk.b, 'both occurrences became the same reference');
    assert.deepEqual(readJSONStreamed(file), doc, 'every string comes back, references and escaped originals alike');

    // the control: the same document through the format 2 writer has no table and is untouched
    const plain = path.join(dir, 'y.json');
    writeJSONStreamed(plain, doc);
    assert.equal(readFileSync(plain, 'utf8'), JSON.stringify(doc), 'format 2 output is still exactly JSON.stringify');
    assert.deepEqual(readJSONStreamed(plain), doc);

    // and a large document takes the walking reader, which resolves the table the same way
    assert.deepEqual(readJSONStreamed(file, { limit: 8 }), doc, 'the walking reader resolves the table too');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('checkpoint: the live soak on pid 7192 writes a file this reader still restores', () => {
  // READ ONLY. state/soak is another process's working directory: nothing here writes, moves or
  // opens it for anything but a read. The whole document is NOT parsed here: the file is past
  // 200 MB (the size is printed below) and a test process gets a 4288 MB heap, so the version
  // and the absence of a table are read off the head and the tail of the file. The FORMAT is
  // graded by the fixture test above, which restores a format 1 and a format 2 file field for
  // field.
  const file = path.join(ROOT, 'state', 'soak', 'snapshot.json');
  if (!existsSync(file)) { console.log('  no soak snapshot on disk; the v2 fixture test covers the format'); return; }
  const size = statSync(file).size;
  const fd = openSync(file, 'r');
  let head, tail;
  try {
    head = Buffer.allocUnsafe(4096); readSync(fd, head, 0, 4096, 0);
    const n = Math.min(4096, size);
    tail = Buffer.allocUnsafe(n); readSync(fd, tail, 0, n, size - n);
  } finally { closeSync(fd); }
  const m = /"version":(\d+)/.exec(head.toString('latin1'));
  assert.ok(m, 'the soak snapshot declares a version in its first 4096 bytes');
  const version = Number(m[1]);
  console.log('  state/soak/snapshot.json: version ' + version + ', ' + size + ' bytes');
  assert.ok(version >= 1 && version <= 3, 'a version this reader knows: ' + version);
  const hasTable = tail.toString('latin1').includes(BLOB_ENC_V3) || tail.toString('latin1').includes(BLOB_ENC_V4);
  assert.equal(hasTable, version >= 3, 'a blob table sits last, and only versions 3 and up have one');
});

test('checkpoint: the whole brain at 12 majors and 256 units, 20 ticks, is smaller under format 4 by the measured ratio', async () => {
  const { buildWhole } = await import('../seeds/whole.mjs');
  const { closeWorld } = await import('../world/index.mjs');
  const dir = tmp();
  let brain = null;
  try {
    const built = buildWhole({ majors: 12, substrateUnits: 256, ledger: 'off', name: 'ckpt-ratio', seed: 'checkpoint-12x256' });
    brain = built.brain;
    brain.tick(20);
    // INTERLEAVED on one brain: the three arms differ by the format and by nothing else
    const v2 = statSync(brain.snapshot(path.join(dir, 'a'), { version: 2 })).size;
    const v4 = statSync(brain.snapshot(path.join(dir, 'c'), { version: 3 })).size;
    const v3 = statSync(writeFormat3(path.join(dir, 'b'), readJSONStreamed(path.join(dir, 'a', 'snapshot.json')))).size;
    console.log('  12x256 at 20 ticks: format 2 ' + v2 + ' B, format 3 ' + v3 + ' B, format 4 ' + v4 + ' B, ' + (v2 / v4).toFixed(4) + 'x smaller than 2, ' + (v3 / v4).toFixed(4) + 'x smaller than 3');
    // MEASURED by this test on 2026-09-18: 1505258 -> 856807 (format 3) -> 824394 (format 4).
    // The bar is the SHAPE of those measurements, not the exact byte counts, which move with
    // the organism the seed builds.
    assert.ok(v2 / v4 > 1.5 && v2 / v4 < 2.5, 'format 4 is 1.5x to 2.5x smaller than format 2; got ' + (v2 / v4).toFixed(4) + ' (' + v2 + ' -> ' + v4 + ')');
    assert.ok(v4 < v3, 'format 4 is smaller than format 3: ' + v4 + ' against ' + v3);
    assert.ok(v3 / v4 < 1.5, 'and the table is the only thing that moved, so the gain is single digit percent: ' + (v3 / v4).toFixed(4));
  } finally {
    if (brain) { try { closeWorld(brain); } catch { /* nothing open */ } }
    rmSync(dir, { recursive: true, force: true });
  }
});
