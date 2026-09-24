// core/persist.mjs: write a snapshot as JSON without ever holding the whole document as one string
// (V8 caps a string near 2^29 characters; the soak of 2026-09-17 hit that cap at t=898 while
// stopping, the checkpoint threw "Invalid string length", and the run was lost), and atomically:
// the bytes go to a temp file that is renamed over the target only after a complete write, so a
// failed checkpoint never replaces the last good one. Without `intern` the output is byte for
// byte what JSON.stringify(obj) would produce, and the test proves it on nested, sparse and
// typed values; with `intern` it is the same document with a blob table, checkpoint format 3 or
// format 4, both described below. The reader restores versions 1, 2, 3 and 4.
import { openSync, writeSync, closeSync, renameSync, unlinkSync, existsSync, readSync, fstatSync } from 'node:fs';
import { deflateRawSync, inflateRawSync } from 'node:zlib';
import { crc32, packBipolarBits, packTernaryBits, bipolarBytes, ternaryBytes, xorRiceEncode, xorRiceDecode, XOR_RICE_WINDOW } from './pack.mjs';

const CHUNK = 1 << 22; // characters of pending text before one write to the descriptor

// ---------------------------------------------------------------- the blob table (format 3)
// MEASURED, bench/verdicts/checkpoint.json rows[].arms["2"].payloads: a checkpoint is base64
// payload text and almost nothing else, and about half of that text is a BYTE IDENTICAL COPY of
// a payload written somewhere else in the same file, because the same base hypervectors appear
// in cell state, in the signals in flight, in the mailboxes and in the outbox at once.
// So the cut is NOT "encode a typed array as base64 instead of a list of decimal numbers":
// core/cell.mjs toSafe, core/connectome.mjs serialize and core/signal.mjs dataToJSON already do
// that, and the same verdict's cellFields.numberListBytes says how little is left in number
// lists. The cut is that the file writes the SAME base64 string thousands of times, and writes
// it uncompressed.
//
// Format 3 therefore writes every payload string once, into a `blobs` member appended as the
// LAST member of the document, and leaves a short reference where the string was. The table is
// deflated and split into chunks bounded by raw text size, so no single string in the document
// (and no single string this writer ever builds) is unbounded: the 2^29 character V8 cap that
// cost the soak a thousand ticks on 2026-09-17 is not traded away for the size win.
//
// The reader below resolves the references before returning, so EVERY consumer of a snapshot
// (Brain.restore, cli/ops.mjs diffSnapshots, tools/lib.mjs loadBrainAt) sees exactly the shape
// a format 1 or format 2 file had. Nothing outside this file knows the table exists.
//
// ---------------------------------------------------------------- format 4: the table is binary
// MEASURED, bench/verdicts/checkpoint-before.json and the blob histogram this bench now prints:
// format 3's table is the payload strings AS TEXT, joined and deflated. Two things are paid for
// there that need not be. Base64 text carries 6 bits of content in every 8 bit character, and a
// BIPOLAR vector (every element +1 or -1, which is what core/signal.mjs hv is) carries ONE bit of
// content per element while the Int8 base64 form spends 10.67 bits on it.
//
// Format 4 keeps the document byte for byte what format 3 made of it (the same references, the
// same escapes, the same keys) and changes only what the table holds: a record stream of decoded
// bytes, deflated and base64ed once at the end. Each record says what it is, so the reader
// rebuilds the ORIGINAL STRING exactly:
//   tag 1 raw        the string's own bytes, for anything not recognised below
//   tag 2 b64        the decoded bytes of a canonical base64 string
//   tag 3 bipolar    the elements of an Int8 base64 string whose every byte is +1 or -1, one
//                    BIT each, with the element count; unpacked element for element on read
//   tag 4 prefix+b64 a "b8192:<base64>" packed hypervector: the marker, then the decoded bytes
// A string only takes tag 2, 3 or 4 when re-encoding its bytes reproduces the string exactly
// (Buffer.toString('base64') is canonical), so identity is decided at write time and the reader
// never has to guess.
export const BLOB_ENC_V3 = 'v3-deflate-raw-b64';
export const BLOB_ENC_V4 = 'v4-packed-deflate-b64';
export const BLOB_ENC = BLOB_ENC_V4;  // what `intern: true` writes today
const BLOB_MIN = 48;                 // shortest string worth a reference; below it the reference costs more than it saves
const BLOB_CHUNK_BYTES = 32 << 20;   // raw joined text per deflate chunk
const REF = '~b';
const REF_RE = /^~b[0-9]+$/;
// Only base64 payload text is interned. The class has no '~' and no newline in it, so a
// reference can never be mistaken for an internable string and a payload can never contain the
// separator the table is split on.
const PAYLOAD_RE = /^[A-Za-z0-9+/=:]+$/;

// A value string on its way into a format 3 document. A string that is not interned but starts
// with '~' is written with one more '~' in front, and the reader strips exactly one, so an
// ORIGINAL string of the shape "~b12" round trips instead of being read back as blob 12. That
// escape is what makes the reference unambiguous rather than merely improbable.
function valueOut(v, table) {
  if (v.length >= BLOB_MIN && PAYLOAD_RE.test(v)) return '"' + REF + table.add(v) + '"';
  if (v.charCodeAt(0) === 126) return JSON.stringify('~' + v); // 126 is '~'
  return JSON.stringify(v);
}

// ---------------------------------------------------------------- the format 4 record stream
const TAG_RAW = 1, TAG_B64 = 2, TAG_BIPOLAR = 3, TAG_PREFIX_B64 = 4;
const PLUS_ONE = 1, MINUS_ONE = 255; // an Int8Array of +1/-1 read as bytes

function varint(n) {
  const out = [];
  let v = n;
  do { let b = v & 0x7f; v = Math.floor(v / 128); if (v > 0) b |= 0x80; out.push(b); } while (v > 0);
  return Buffer.from(out);
}
function readVarint(buf, i) {
  let v = 0, shift = 1, b;
  do { b = buf[i++]; v += (b & 0x7f) * shift; shift *= 128; } while (b & 0x80);
  return [v, i];
}
// null unless the text is EXACTLY what Buffer.toString('base64') would produce for its own bytes.
// Buffer.from(t, 'base64') accepts text this writer could not reproduce, and a payload that does
// not re-encode to itself is stored raw instead of being silently rewritten.
function canonicalBytes(t) {
  const b = Buffer.from(t, 'base64');
  return b.length && b.toString('base64') === t ? b : null;
}
function allBipolar(b) {
  for (let i = 0; i < b.length; i++) { const x = b[i]; if (x !== PLUS_ONE && x !== MINUS_ONE) return false; }
  return true;
}
/** One bit per element: bit set means +1. The inverse of unpackBipolar, graded in test/checkpoint.test.mjs. */
export function packBipolar(b) {
  const out = Buffer.alloc((b.length + 7) >>> 3);
  for (let i = 0; i < b.length; i++) if (b[i] === PLUS_ONE) out[i >>> 3] |= 1 << (i & 7);
  return out;
}
/** n elements back out of the bits, as the +1/-1 BYTES an Int8Array of them has. */
export function unpackBipolar(bits, n, at = 0) {
  const out = Buffer.allocUnsafe(n);
  for (let i = 0; i < n; i++) out[i] = (bits[at + (i >>> 3)] >>> (i & 7)) & 1 ? PLUS_ONE : MINUS_ONE;
  return out;
}

function encodePayload(s) {
  const colon = s.indexOf(':');
  if (colon < 0) {
    const bytes = canonicalBytes(s);
    if (bytes) {
      if (allBipolar(bytes)) return Buffer.concat([Buffer.from([TAG_BIPOLAR]), varint(bytes.length), packBipolar(bytes)]);
      return Buffer.concat([Buffer.from([TAG_B64]), varint(bytes.length), bytes]);
    }
  } else {
    // core/signal.mjs packHV writes "b<lanes>:<base64>", which is already one bit per lane; the
    // marker is kept as text and only the base64 after it is decoded.
    const bytes = canonicalBytes(s.slice(colon + 1));
    if (bytes) {
      const pre = Buffer.from(s.slice(0, colon + 1), 'latin1');
      return Buffer.concat([Buffer.from([TAG_PREFIX_B64]), varint(pre.length), pre, varint(bytes.length), bytes]);
    }
  }
  const raw = Buffer.from(s, 'latin1'); // exact: PAYLOAD_RE admits ASCII only
  return Buffer.concat([Buffer.from([TAG_RAW]), varint(raw.length), raw]);
}

class Interner {
  // `version` is the TABLE version, 3 or 4. The document around it is identical either way.
  constructor(version = 4) { this.map = new Map(); this.texts = []; this.version = version; }
  add(v) {
    let i = this.map.get(v);
    if (i === undefined) { i = this.texts.length; this.map.set(v, i); this.texts.push(v); }
    return i;
  }
  // The table, written straight to the descriptor through `put`. Each chunk is deflated on its
  // own so the group being joined stays bounded; latin1 is exact in the format 3 path because
  // PAYLOAD_RE admits ASCII only.
  emit(put) {
    const v4 = this.version === 4;
    put('{"enc":' + JSON.stringify(v4 ? BLOB_ENC_V4 : BLOB_ENC_V3) + ',"count":' + this.texts.length + ',"chunks":[');
    const counts = [];
    let group = [], groupBytes = 0, groupCount = 0, first = true;
    const flush = () => {
      if (!groupCount) return;
      const raw = v4 ? Buffer.concat(group) : Buffer.from(group.join('\n'), 'latin1');
      const d = deflateRawSync(raw, { level: 6 });
      put((first ? '' : ',') + JSON.stringify(d.toString('base64')));
      first = false;
      counts.push(groupCount);
      group = []; groupBytes = 0; groupCount = 0;
    };
    for (const t of this.texts) {
      const rec = v4 ? encodePayload(t) : t;
      group.push(rec); groupCount++;
      groupBytes += v4 ? rec.length : t.length + 1;
      if (groupBytes >= BLOB_CHUNK_BYTES) flush();
    }
    flush();
    put('],"counts":' + JSON.stringify(counts) + '}');
  }
}

// `intern` picks the table: false writes no table at all (format 2 and below), true writes the
// current best table, and 3 or 4 names one. core/brain.mjs snapshot() passes a BOOLEAN
// (`intern: version >= 3`, line 288), so the product always takes the current best; the bench
// names 3 explicitly to measure the format this one replaced on the same brain.
function tableVersion(intern) {
  if (intern === true) return 4;
  if (intern === 3 || intern === 4) return intern;
  throw new TypeError('writeJSONStreamed: intern must be false, true, 3 or 4, got ' + String(intern));
}

export function writeJSONStreamed(file, obj, { intern = false } = {}) {
  const tmp = file + '.tmp';
  const fd = openSync(tmp, 'w');
  let parts = [], size = 0;
  const put = s => { parts.push(s); size += s.length; if (size >= CHUNK) { writeSync(fd, parts.join('')); parts = []; size = 0; } };
  try {
    if (intern) emitInterned(obj, put, tableVersion(intern));
    else emit(obj, put, 0);
    if (parts.length) writeSync(fd, parts.join(''));
    closeSync(fd);
  } catch (err) {
    try { closeSync(fd); } catch {}
    try { if (existsSync(tmp)) unlinkSync(tmp); } catch {}
    throw err;
  }
  renameSync(tmp, file);
  return file;
}

// The top two levels (the snapshot object and its sections: cells, mailboxes, inflight, outbox,
// the connectome) are walked element by element; below that each element is one JSON.stringify,
// which is a cell, a signal or an edge table and stays small on any organism built so far.
function emit(v, put, depth) {
  const container = v !== null && typeof v === 'object' && typeof v.toJSON !== 'function' && !ArrayBuffer.isView(v);
  if (!container) {
    const s = JSON.stringify(v);
    put(s === undefined ? 'null' : s);
    return;
  }
  if (depth >= 2) {
    // one JSON.stringify for a small container; a container too large for one string (one
    // cell's mailbox at t=2000 of the soak, 2026-09-17, which threw "Invalid string length"
    // and lost a thousand ticks) is walked element by element instead, at any depth
    let s = null;
    try { s = JSON.stringify(v); } catch (e) { if (!(e instanceof RangeError)) throw e; }
    if (s !== null) { put(s); return; }
  }
  if (Array.isArray(v)) {
    put('[');
    for (let i = 0; i < v.length; i++) {
      if (i) put(',');
      const x = v[i];
      if (x === undefined || typeof x === 'function') put('null'); else emit(x, put, depth + 1);
    }
    put(']');
    return;
  }
  put('{');
  let first = true;
  for (const k of Object.keys(v)) {
    const x = v[k];
    if (x === undefined || typeof x === 'function') continue; // JSON.stringify omits these members
    put((first ? '' : ',') + JSON.stringify(k) + ':');
    first = false;
    emit(x, put, depth + 1);
  }
  put('}');
}

// ---------------------------------------------------------------- writing a table (format 3 or 4)
// The top level object, with `blobs` appended as its last member: the table is written after
// the walk, when it is complete, so nothing is buffered twice and the walk stays streamed.
// A document that is not an object has no place to put a table, so it is written as before.
function emitInterned(obj, put, version) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj) || typeof obj.toJSON === 'function' || ArrayBuffer.isView(obj)) {
    emit(obj, put, 0);
    return;
  }
  // `blobs` is this format's own member name, so a document that already carries one would be
  // written with the key twice and read back wrong. Refused rather than silently mangled.
  if (Object.prototype.hasOwnProperty.call(obj, 'blobs')) throw new TypeError('format 3 reserves the top level member "blobs"; this document already has one');
  const table = new Interner(version);
  put('{');
  let first = true;
  for (const k of Object.keys(obj)) {
    const x = obj[k];
    if (x === undefined || typeof x === 'function') continue;
    // KEYS ARE WRITTEN VERBATIM at every depth, never interned and never escaped, so the
    // reader never has to rebuild an object with different keys and a key that happens to look
    // like a reference stays exactly what it was.
    put((first ? '' : ',') + JSON.stringify(k) + ':');
    first = false;
    walkInterned(x, put, table);
  }
  put((first ? '' : ',') + '"blobs":');
  table.emit(put);
  put('}');
}

// Element by element the whole way down: unlike emit() above there is no JSON.stringify
// shortcut for a small subtree, because a payload string buried in one would never be seen.
// The cost of that is measured as writeMs in bench/verdicts/checkpoint.json.
function walkInterned(v, put, table) {
  if (typeof v === 'string') { put(valueOut(v, table)); return; }
  const container = v !== null && typeof v === 'object' && typeof v.toJSON !== 'function' && !ArrayBuffer.isView(v);
  if (!container) { const s = JSON.stringify(v); put(s === undefined ? 'null' : s); return; }
  if (Array.isArray(v)) {
    put('[');
    for (let i = 0; i < v.length; i++) {
      if (i) put(',');
      const x = v[i];
      if (x === undefined || typeof x === 'function') put('null'); else walkInterned(x, put, table);
    }
    put(']');
    return;
  }
  put('{');
  let first = true;
  for (const k of Object.keys(v)) {
    const x = v[k];
    if (x === undefined || typeof x === 'function') continue;
    put((first ? '' : ',') + JSON.stringify(k) + ':');
    first = false;
    walkInterned(x, put, table);
  }
  put('}');
}

// ---------------------------------------------------------------- reading a table (format 3 or 4)
// Resolution happens here and nowhere else: a format 3 document handed back by the reader is
// the same object a format 1 or format 2 document would have produced, `blobs` removed.
export function expandBlobTable(b) {
  const out = [];
  if (b.enc === BLOB_ENC_V4) {
    for (const c of b.chunks || []) expandV4Chunk(inflateRawSync(Buffer.from(c, 'base64')), out);
  } else {
    for (const c of b.chunks || []) {
      const text = inflateRawSync(Buffer.from(c, 'base64')).toString('latin1');
      if (text.length) for (const s of text.split('\n')) out.push(s);
    }
  }
  if (Number.isFinite(b.count) && out.length !== b.count) throw new Error('blob table declares ' + b.count + ' payloads and holds ' + out.length);
  return out;
}
// One deflated chunk of format 4 records back into the strings they were written from.
function expandV4Chunk(bin, out) {
  let i = 0;
  while (i < bin.length) {
    const tag = bin[i++];
    if (tag === TAG_RAW) { const [n, j] = readVarint(bin, i); i = j; out.push(bin.toString('latin1', i, i + n)); i += n; }
    else if (tag === TAG_B64) { const [n, j] = readVarint(bin, i); i = j; out.push(bin.toString('base64', i, i + n)); i += n; }
    else if (tag === TAG_BIPOLAR) {
      const [n, j] = readVarint(bin, i); i = j;
      out.push(unpackBipolar(bin, n, i).toString('base64'));
      i += (n + 7) >>> 3;
    } else if (tag === TAG_PREFIX_B64) {
      const [p, j] = readVarint(bin, i); i = j;
      const pre = bin.toString('latin1', i, i + p); i += p;
      const [n, k] = readVarint(bin, i); i = k;
      out.push(pre + bin.toString('base64', i, i + n)); i += n;
    } else throw new Error('blob table: unknown record tag ' + tag + ' at ' + (i - 1));
  }
}
export function resolveBlobs(doc) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return doc;
  const b = doc.blobs;
  if (!b || typeof b !== 'object' || (b.enc !== BLOB_ENC_V3 && b.enc !== BLOB_ENC_V4)) return doc;
  const blobs = expandBlobTable(b);
  delete doc.blobs; // so the resolved document is exactly the shape a format 2 file had
  return unref(doc, blobs);
}
function unref(v, blobs) {
  if (typeof v === 'string') {
    if (REF_RE.test(v)) {
      const i = Number(v.slice(2));
      if (i >= blobs.length) throw new Error('blob reference ' + v + ' past the end of a table of ' + blobs.length);
      return blobs[i];
    }
    return v.charCodeAt(0) === 126 ? v.slice(1) : v;
  }
  if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) v[i] = unref(v[i], blobs); return v; }
  if (v !== null && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = unref(v[k], blobs); return v; }
  return v;
}

// ---------------------------------------------------------------- reading a snapshot of any size
// The mirror of the writer. readFileSync(file, 'utf8') and JSON.parse both need the whole
// document as one string, and the soak's t=1000 snapshot (615 MB, 2026-09-17) is past what
// V8 allows, so a restore of it threw before a single cell was read. Here the bytes stay in a
// Buffer, which has no such cap; a value whose text is at most `limit` bytes is handed to
// JSON.parse as one slice (that is every cell, signal and edge table), and a container larger
// than that is walked element by element. Below the limit the result is exactly JSON.parse's.
const SLICE = 1 << 26; // 64 MB
const Q = 34, BS = 92, LB = 123, RB = 125, LS = 91, RS = 93, COMMA = 44, COLON = 58;

export function readJSONStreamed(file, { limit = SLICE, chunk = 1 << 30 } = {}) {
  const buf = readAll(file, chunk);
  // A checkpoint container version 2 (the binary file below) is recognised by its magic and
  // comes back as the same document a JSON file would have held, so every consumer that reads
  // through here (Brain.restore, cli/ops.mjs diffSnapshots, tools/lib.mjs) reads both.
  if (isCheckpoint(buf)) return readCheckpointBuffer(buf, { limit, file }).doc;
  // A format 1 or format 2 document carries no blob table and comes back untouched, which is
  // what lets a file the old code wrote (the soak of 2026-09-18 writes one every checkpoint)
  // restore under this reader.
  if (buf.length <= limit) return resolveBlobs(JSON.parse(buf.toString('utf8')));
  const [value, end] = parseAt(buf, ws(buf, 0), limit);
  if (ws(buf, end) !== buf.length) throw new SyntaxError('trailing bytes after the JSON document at ' + end);
  return resolveBlobs(value);
}

// readFileSync refuses a file past 2 GiB (ERR_FS_FILE_TOO_LARGE; the soak's t=4000 snapshot was
// 2641524189 bytes, 2026-09-17), so a snapshot is read into one Buffer in chunks instead.
function readAll(file, chunk) {
  const fd = openSync(file, 'r');
  try {
    const size = fstatSync(fd).size;
    const buf = Buffer.allocUnsafe(size);
    let at = 0;
    while (at < size) {
      const n = readSync(fd, buf, at, Math.min(chunk, size - at), at);
      if (n <= 0) throw new Error('short read at ' + at + ' of ' + size + ' bytes in ' + file);
      at += n;
    }
    return buf;
  } finally { closeSync(fd); }
}

function ws(buf, i) {
  while (i < buf.length) { const b = buf[i]; if (b === 32 || b === 10 || b === 13 || b === 9) i++; else break; }
  return i;
}

// the index just past the string that opens at i (escapes skipped, so a quote inside never ends it)
function scanString(buf, i) {
  let j = i + 1;
  while (j < buf.length) { const b = buf[j]; if (b === BS) { j += 2; continue; } if (b === Q) return j + 1; j++; }
  throw new SyntaxError('unterminated string at ' + i);
}

// the index just past the value that starts at i, without parsing it
function scanValue(buf, i) {
  const c = buf[i];
  if (c === Q) return scanString(buf, i);
  if (c === LB || c === LS) {
    let d = 0, j = i;
    while (j < buf.length) {
      const b = buf[j];
      if (b === Q) { j = scanString(buf, j); continue; }
      if (b === LB || b === LS) d++;
      else if (b === RB || b === RS) { d--; if (d === 0) return j + 1; }
      j++;
    }
    throw new SyntaxError('unterminated container at ' + i);
  }
  let j = i;
  while (j < buf.length) { const b = buf[j]; if (b === COMMA || b === RB || b === RS || b === 32 || b === 10 || b === 13 || b === 9) break; j++; }
  return j;
}

function parseAt(buf, i, limit) {
  const c = buf[i];
  const end = scanValue(buf, i);
  if ((c === LB || c === LS) && end - i > limit) {
    if (c === LS) {
      const arr = [];
      let j = ws(buf, i + 1);
      if (buf[j] === RS) return [arr, j + 1];
      for (;;) {
        const [v, k] = parseAt(buf, j, limit);
        arr.push(v);
        j = ws(buf, k);
        if (buf[j] === COMMA) { j = ws(buf, j + 1); continue; }
        if (buf[j] === RS) return [arr, j + 1];
        throw new SyntaxError('expected , or ] at ' + j);
      }
    }
    const obj = {};
    let j = ws(buf, i + 1);
    if (buf[j] === RB) return [obj, j + 1];
    for (;;) {
      if (buf[j] !== Q) throw new SyntaxError('expected a key at ' + j);
      const ke = scanString(buf, j);
      const key = JSON.parse(buf.toString('utf8', j, ke));
      j = ws(buf, ke);
      if (buf[j] !== COLON) throw new SyntaxError('expected : at ' + j);
      const [v, k] = parseAt(buf, ws(buf, j + 1), limit);
      if (key === '__proto__') Object.defineProperty(obj, key, { value: v, enumerable: true, configurable: true, writable: true });
      else obj[key] = v;
      j = ws(buf, k);
      if (buf[j] === COMMA) { j = ws(buf, j + 1); continue; }
      if (buf[j] === RB) return [obj, j + 1];
      throw new SyntaxError('expected , or } at ' + j);
    }
  }
  return [JSON.parse(buf.toString('utf8', i, end)), end];
}

// ================================================================ checkpoint container version 2
// THE BINARY CHECKPOINT (board 10, item compress; his P5 of 2026-09-23, "self compressing").
// Container version 1 is every checkpoint this file wrote before: snapshot.json as JSON TEXT,
// holding a document of version 1, 2 or 3 (formats 3 and 4 add a deflated blob table as its
// last member). state/soak/snapshot.json is one of those: document version 1, 241845002 bytes.
// Container version 2 holds the SAME document, and the reader hands back the same object, but
// nothing in it is text that need not be:
//
//   bytes 0..7    the magic "BRAINCK2"
//   bytes 8..11   H, the header length, uint32 little endian
//   bytes 12..15  CRC32 of the header bytes
//   bytes 16..    the header: a small JSON object (format, version, doc, name, t, cells, edges,
//                 bytes, ruler, census, sections), space padded so the body starts 8 aligned
//   then          the sections, each at an 8 aligned offset relative to the body, each with its
//                 own CRC32 in the header:
//     slots      deflated: one record per distinct payload string the document held
//     skeleton   deflated in chunks: the document as JSON with every payload string replaced by
//                a "~b<slot>" reference (the escape scheme of format 3 above, unchanged)
//     edges      RAW TYPED ARRAYS: the connectome columns and the co-activation counters, each
//                column 8 aligned and named with its dtype in the header, so a reader can view
//                it as a Float32Array or a Uint32Array in place without parsing anything
//     bytes      deflated in chunks: every other payload, decoded out of base64 into its bytes
//                (the Float32 vectors, the cell state typed arrays of core/cell.mjs toSafe)
//     hv.bipolar.<lanes>   every distinct bipolar hypervector, one BIT per lane, back to back
//                (enc "bits"), or that store XOR coded against the nearest of the 64 vectors
//                before each and Rice coded (enc "xor-rice", core/pack.mjs xorRiceEncode, the
//                writer default since 2026-09-24): measured on the bar checkpoint of
//                bench/compress.mjs, 20157440 bytes of bits in 7351810. The header then also
//                carries raw (the store's length) and rawCrc32 (the store's CRC32), and the
//                reader refuses a decode that does not give back those bytes.
//     hv.ternary.<lanes>   every distinct ternary hypervector, two bits per lane (core/pack.mjs)
//
// A payload string takes a packed form only when rebuilding it from the stored bytes gives
// back the identical string (canonical base64, an exact "b<lanes>:" marker), so the document
// the reader returns is the document the writer was handed, string for string. A vector is
// held ONCE however many places refer to it (the memory's episodic keys and semantic patterns
// are the same vectors, measured). A section whose CRC32 does not match is refused by name
// before anything is decoded.
//
// THE RULER rides in the header: `ruler` is whatever the caller measured (the summed suite
// score and its draw, generated lines, cells) plus `bytes`, the whole file, and
// `bytesPerScorePoint` = bytes / score. readCheckpointHeader() reads the 16 byte prefix and the
// header only, so a daemon can read the ruler of a checkpoint of any size without its body.
//
// The file keeps the name snapshot.json: twenty consumers resolve that path, and the magic, not
// the name, says which container it is. Brain.snapshot writes container 2 when asked for it,
// and seeds/whole.mjs asks for it on every whole organism.
export const CKPT_MAGIC = 'BRAINCK2';
export const CKPT_CONTAINER = 2;
const CKPT_PRE = 16;
const SKEL_CHUNK = 1 << 24;          // characters of skeleton text per deflated chunk
const BYTES_CHUNK = 32 << 20;        // raw bytes per deflated chunk of the bytes section
const S_RAW = 1, S_B64 = 2, S_BIPOLAR = 3, S_PACKED = 4, S_TERNARY = 5;
const SEC_BYTES = 0, SEC_EDGES = 1;  // section ids a slot record names; hv groups take 2 and up
const PACKED_PREFIX_RE = /^b(0|[1-9][0-9]*):$/;
// The typed columns of the two sections that are typed arrays by construction. core/connectome.mjs
// serialize() and CoActivation.serialize() write exactly these, as base64 of the arrays' bytes.
export const EDGE_COLUMNS = Object.freeze({
  connectome: [['src', 'Uint32Array'], ['dst', 'Uint32Array'], ['srcPort', 'Uint8Array'], ['dstPort', 'Uint8Array'], ['w', 'Float32Array'],
    ['delay', 'Uint16Array'], ['usage', 'Uint32Array'], ['lastT', 'Float64Array'], ['conf', 'Float32Array'], ['flags', 'Uint8Array']],
  coact: [['keys', 'Float64Array'], ['vals', 'Uint32Array']],
});
const DTYPE_BYTES = { Uint8Array: 1, Uint16Array: 2, Uint32Array: 4, Float32Array: 4, Float64Array: 8 };
// Every section encoding a reader of this file knows. A section in any other encoding is refused
// by name: read as raw bytes it would restore different vectors without a word.
const SECTION_ENC = new Set(['deflate-raw', 'deflate-raw-chunks', 'typed', 'bits', 'ternary-bits', 'xor-rice']);
export const HV_ENCODINGS = Object.freeze(['xor-rice', 'bits']);

/** true when the bytes start with the container 2 magic */
export function isCheckpoint(buf) { return !!buf && buf.length >= CKPT_PRE && buf.toString('latin1', 0, 8) === CKPT_MAGIC; }

class Parts {
  constructor() { this.parts = []; this.size = 0; }
  push(b) { const at = this.size; if (b.length) { this.parts.push(b); this.size += b.length; } return at; }
  align(n) { const r = this.size % n; if (r) this.push(Buffer.alloc(n - r)); }
  buffer() { return this.parts.length === 1 ? this.parts[0] : Buffer.concat(this.parts, this.size); }
}
function recordOf(nums) {
  const out = [];
  for (const n of nums) { let v = n; do { let b = v & 0x7f; v = Math.floor(v / 128); if (v > 0) b |= 0x80; out.push(b); } while (v > 0); }
  return Buffer.from(out);
}
function allTernaryBytes(b) {
  for (let i = 0; i < b.length; i++) { const x = b[i]; if (x !== 0 && x !== PLUS_ONE && x !== MINUS_ONE) return false; }
  return true;
}

// Every payload string of the document, held once, in the section its shape belongs to.
class SlotTable {
  constructor() {
    this.map = new Map(); this.recs = new Parts(); this.count = 0;
    this.bytes = new Parts(); this.edges = new Parts(); this.columns = [];
    this.groups = []; this.groupBy = new Map();
    this.census = { raw: 0, b64: 0, bipolar: 0, packed: 0, ternary: 0, typed: 0, vectorRefs: 0, vectorsHeld: 0 };
  }
  add(v) {
    let i = this.map.get(v);
    if (i === undefined) { i = this.count++; this.map.set(v, i); this.recs.push(this.encode(v)); }
    return i;
  }
  // an edge column, registered before the walk so the walk's add() finds it already placed
  column(v, name, dtype) {
    if (typeof v !== 'string' || v.length < BLOB_MIN || !PAYLOAD_RE.test(v) || this.map.has(v)) return;
    const bytes = canonicalBytes(v);
    if (!bytes || bytes.length % DTYPE_BYTES[dtype]) return;
    this.edges.align(8);
    const at = this.edges.push(bytes);
    const i = this.count++;
    this.map.set(v, i);
    this.recs.push(recordOf([S_B64, SEC_EDGES, at, bytes.length]));
    this.columns.push({ name, dtype, offset: at, bytes: bytes.length, n: bytes.length / DTYPE_BYTES[dtype], slot: i });
    this.census.typed++;
  }
  group(kind, lanes) {
    const key = kind + lanes;
    let g = this.groupBy.get(key);
    if (!g) {
      g = { id: 2 + this.groups.length, kind, lanes, per: kind === 'bipolar' ? bipolarBytes(lanes) : ternaryBytes(lanes), store: new Parts(), index: new Map(), count: 0 };
      this.groups.push(g); this.groupBy.set(key, g);
    }
    return g;
  }
  vector(g, bits) {
    this.census.vectorRefs++;
    const key = bits.toString('latin1');
    let i = g.index.get(key);
    if (i === undefined) { i = g.count++; g.index.set(key, i); g.store.push(bits); this.census.vectorsHeld++; }
    return i;
  }
  encode(s) {
    const colon = s.indexOf(':');
    if (colon > 0) {
      if (PACKED_PREFIX_RE.test(s.slice(0, colon + 1))) {
        const lanes = Number(s.slice(1, colon));
        const bytes = Number.isSafeInteger(lanes) ? canonicalBytes(s.slice(colon + 1)) : null;
        if (bytes && bytes.length === bipolarBytes(lanes)) {
          this.census.packed++;
          const g = this.group('bipolar', lanes);
          return recordOf([S_PACKED, g.id, this.vector(g, bytes)]);
        }
      }
    } else if (colon < 0) {
      const bytes = canonicalBytes(s);
      if (bytes) {
        if (allBipolar(bytes)) {
          this.census.bipolar++;
          const g = this.group('bipolar', bytes.length);
          return recordOf([S_BIPOLAR, g.id, this.vector(g, packBipolarBits(bytes, Buffer.alloc(bipolarBytes(bytes.length))))]);
        }
        if (allTernaryBytes(bytes)) {
          this.census.ternary++;
          const g = this.group('ternary', bytes.length);
          return recordOf([S_TERNARY, g.id, this.vector(g, packTernaryBits(bytes, Buffer.alloc(ternaryBytes(bytes.length))))]);
        }
        this.census.b64++;
        return recordOf([S_B64, SEC_BYTES, this.bytes.push(bytes), bytes.length]);
      }
    }
    this.census.raw++;
    const raw = Buffer.from(s, 'latin1'); // exact: PAYLOAD_RE admits ASCII only
    return recordOf([S_RAW, SEC_BYTES, this.bytes.push(raw), raw.length]);
  }
}

function deflateChunks(raw, size) {
  const chunks = [];
  for (let at = 0; at < raw.length; at += size) {
    const part = raw.subarray(at, Math.min(raw.length, at + size));
    chunks.push({ d: deflateRawSync(part, { level: 6 }), raw: part.length });
  }
  return chunks;
}
const r3 = (x) => Math.round(x * 1000) / 1000;

/**
 * Write a document as a checkpoint container version 2, atomically (a temp file renamed over
 * the target only after a complete write).
 * @param {string} file
 * @param {object} doc the snapshot document core/brain.mjs builds
 * @param {object} [opts] { ruler: { score, of, lines, cells, source, ... } } measured by the caller;
 *   hv: 'xor-rice' (default) or 'bits', how the bipolar vector sections are stored
 * @returns {{ file: string, bytes: number, header: object }}
 */
export function writeCheckpoint(file, doc, { ruler = null, hv = 'xor-rice' } = {}) {
  if (doc === null || typeof doc !== 'object' || Array.isArray(doc)) throw new TypeError('writeCheckpoint: the document must be a plain object');
  if (!HV_ENCODINGS.includes(hv)) throw new RangeError('writeCheckpoint: hv must be one of ' + HV_ENCODINGS.join(', ') + ', got ' + hv);
  const table = new SlotTable();
  for (const [name, cols] of Object.entries(EDGE_COLUMNS)) {
    const o = doc[name];
    if (o && typeof o === 'object') for (const [k, dtype] of cols) table.column(o[k], name + '.' + k, dtype);
  }
  // the skeleton, deflated a chunk at a time as the walk produces it: no single string past SKEL_CHUNK
  const skel = [];
  let parts = [], size = 0;
  const flush = () => { if (!parts.length) return; const raw = Buffer.from(parts.join(''), 'utf8'); skel.push({ d: deflateRawSync(raw, { level: 6 }), raw: raw.length }); parts = []; size = 0; };
  walkInterned(doc, (s) => { parts.push(s); size += s.length; if (size >= SKEL_CHUNK) flush(); }, table);
  flush();

  const sections = [];
  const slotsRaw = table.recs.buffer();
  sections.push({ name: 'slots', enc: 'deflate-raw', stored: deflateRawSync(slotsRaw, { level: 6 }), raw: slotsRaw.length, count: table.count });
  sections.push({ name: 'skeleton', enc: 'deflate-raw-chunks', stored: Buffer.concat(skel.map((c) => c.d)), raw: skel.reduce((a, c) => a + c.raw, 0), chunks: skel.map((c) => [c.d.length, c.raw]) });
  sections.push({ name: 'edges', id: SEC_EDGES, enc: 'typed', stored: table.edges.buffer(), columns: table.columns });
  const bytesRaw = table.bytes.buffer();
  const bc = deflateChunks(bytesRaw, BYTES_CHUNK);
  sections.push({ name: 'bytes', id: SEC_BYTES, enc: 'deflate-raw-chunks', stored: Buffer.concat(bc.map((c) => c.d)), raw: bytesRaw.length, chunks: bc.map((c) => [c.d.length, c.raw]) });
  for (const g of table.groups) {
    const store = g.store.buffer(), base = { name: 'hv.' + g.kind + '.' + g.lanes, id: g.id, kind: g.kind, lanes: g.lanes, per: g.per, count: g.count };
    if (g.kind === 'bipolar' && hv === 'xor-rice' && g.count > 1) {
      const coded = xorRiceEncode(store, g.per, g.count, { window: XOR_RICE_WINDOW });
      // the coder is never more than 7 bits a vector over the store, but a group of vectors
      // with nothing in common is kept as plain bits rather than paid for
      if (coded.length < store.length) { sections.push({ ...base, enc: 'xor-rice', window: XOR_RICE_WINDOW, raw: store.length, rawCrc32: crc32(store), stored: coded }); continue; }
    }
    sections.push({ ...base, enc: g.kind === 'bipolar' ? 'bits' : 'ternary-bits', stored: store });
  }
  let off = 0;
  for (const s of sections) { s.offset = off; s.bytes = s.stored.length; s.crc32 = crc32(s.stored); off += s.bytes; off += (8 - (off % 8)) % 8; }
  const bodyLen = off;

  const head = {
    format: 'brain.checkpoint', version: CKPT_CONTAINER, doc: doc.version ?? null, name: doc.name ?? null,
    t: doc.clock && Number.isFinite(doc.clock.t) ? doc.clock.t : null,
    cells: Array.isArray(doc.cells) ? doc.cells.length : null,
    edges: doc.connectome && Number.isFinite(doc.connectome.n) ? doc.connectome.n : null,
    bytes: 0, ruler: null, slots: table.count, census: table.census,
    sections: sections.map(({ stored, ...rest }) => rest),
  };
  // The header states the size of the file it opens, and bytesPerScorePoint depends on that
  // size, so the header is first written with 17 character placeholders for both, and the real
  // header is padded to that length: one pass, and the length cannot move under its own numbers.
  const PLACE = 999999999999999.9;
  const fill = (total) => {
    head.bytes = total;
    if (ruler) {
      const score = Number(ruler.score);
      head.ruler = { ...ruler, cells: ruler.cells ?? head.cells, bytes: total, bytesPerScorePoint: total === PLACE ? PLACE : (score > 0 ? r3(total / score) : null) };
    }
    return JSON.stringify(head);
  };
  const placeLen = Buffer.byteLength(fill(PLACE), 'utf8');
  const H = placeLen + ((8 - ((CKPT_PRE + placeLen) % 8)) % 8);
  const total = CKPT_PRE + H + bodyLen;
  const text = fill(total);
  const hb = Buffer.alloc(H, 0x20);
  const n = hb.write(text, 0, 'utf8');
  if (n !== Buffer.byteLength(text, 'utf8')) throw new Error('writeCheckpoint: the header outgrew its placeholder (' + Buffer.byteLength(text, 'utf8') + ' > ' + H + ')');
  const pre = Buffer.alloc(CKPT_PRE);
  pre.write(CKPT_MAGIC, 0, 'latin1');
  pre.writeUInt32LE(H, 8);
  pre.writeUInt32LE(crc32(hb), 12);

  const tmp = file + '.tmp';
  const fd = openSync(tmp, 'w');
  try {
    writeSync(fd, pre); writeSync(fd, hb);
    let at = 0;
    for (const s of sections) {
      if (s.offset > at) { writeSync(fd, Buffer.alloc(s.offset - at)); at = s.offset; }
      if (s.stored.length) writeSync(fd, s.stored);
      at += s.stored.length;
    }
    if (bodyLen > at) writeSync(fd, Buffer.alloc(bodyLen - at));
    closeSync(fd);
  } catch (err) {
    try { closeSync(fd); } catch {}
    try { if (existsSync(tmp)) unlinkSync(tmp); } catch {}
    throw err;
  }
  renameSync(tmp, file);
  return { file, bytes: total, header: JSON.parse(text) };
}

function headerOf(buf, file) {
  if (!isCheckpoint(buf)) throw new Error('checkpoint ' + file + ': no container 2 magic');
  const H = buf.readUInt32LE(8);
  if (CKPT_PRE + H > buf.length) throw new Error('checkpoint ' + file + ': the header claims ' + H + ' bytes and the file holds ' + (buf.length - CKPT_PRE) + ' after the prefix');
  const hb = buf.subarray(CKPT_PRE, CKPT_PRE + H);
  const want = buf.readUInt32LE(12), got = crc32(hb);
  if (want !== got) throw new Error('checkpoint ' + file + ': the header fails its checksum (stored crc32 ' + want.toString(16) + ', computed ' + got.toString(16) + '); refusing to restore it');
  const header = JSON.parse(hb.toString('utf8'));
  if (header.format !== 'brain.checkpoint' || header.version !== CKPT_CONTAINER) throw new Error('checkpoint ' + file + ': format ' + header.format + ' version ' + header.version + ' is not container ' + CKPT_CONTAINER);
  return { header, bodyAt: CKPT_PRE + H };
}

/**
 * The header of a container 2 checkpoint, read without reading the body: the 16 byte prefix and
 * H bytes. null for a JSON checkpoint (container 1), which has no header.
 * @param {string} file
 * @returns {object|null}
 */
export function readCheckpointHeader(file) {
  const fd = openSync(file, 'r');
  try {
    const pre = Buffer.alloc(CKPT_PRE);
    if (readSync(fd, pre, 0, CKPT_PRE, 0) < CKPT_PRE || !isCheckpoint(pre)) return null;
    const H = pre.readUInt32LE(8);
    const both = Buffer.alloc(CKPT_PRE + H);
    pre.copy(both);
    if (readSync(fd, both, CKPT_PRE, H, CKPT_PRE) < H) throw new Error('checkpoint ' + file + ': short header');
    return headerOf(both, file).header;
  } finally { closeSync(fd); }
}

function inflateChunks(stored, chunks, raw, name, file) {
  const out = Buffer.allocUnsafe(raw);
  let at = 0, pos = 0;
  for (const [n, r] of chunks) {
    const part = inflateRawSync(stored.subarray(at, at + n));
    if (part.length !== r) throw new Error('checkpoint ' + file + ': section ' + name + ' chunk inflates to ' + part.length + ' bytes, the header says ' + r);
    part.copy(out, pos); pos += r; at += n;
  }
  if (pos !== raw) throw new Error('checkpoint ' + file + ': section ' + name + ' holds ' + pos + ' bytes, the header says ' + raw);
  return out;
}

/**
 * A container 2 checkpoint back into its document. Every section's CRC32 is checked before
 * anything is decoded; a mismatch is refused with the section's name and both checksums.
 * @param {Buffer} buf the whole file
 * @param {object} [opts] { limit, file }
 * @returns {{ doc: object, header: object }}
 */
export function readCheckpointBuffer(buf, { limit = SLICE, file = 'checkpoint' } = {}) {
  const { header, bodyAt } = headerOf(buf, file);
  if (header.bytes !== buf.length) throw new Error('checkpoint ' + file + ': the header says ' + header.bytes + ' bytes and the file holds ' + buf.length + '; refusing a truncated or extended checkpoint');
  const got = {};
  for (const s of header.sections) {
    if (!SECTION_ENC.has(s.enc)) throw new Error('checkpoint ' + file + ': section ' + s.name + ' is encoded ' + s.enc + ', which this reader does not know; refusing to restore it');
    const at = bodyAt + s.offset;
    if (at + s.bytes > buf.length) throw new Error('checkpoint ' + file + ': section ' + s.name + ' runs past the end of the file');
    const stored = buf.subarray(at, at + s.bytes);
    const c = crc32(stored);
    if (c !== s.crc32) throw new Error('checkpoint ' + file + ': section ' + s.name + ' fails its checksum (stored crc32 ' + (s.crc32 >>> 0).toString(16) + ', computed ' + c.toString(16) + '); refusing to restore it');
    got[s.name] = { s, stored };
  }
  const byId = [];
  for (const { s, stored } of Object.values(got)) {
    if (s.id === undefined || s.id === null) continue;
    byId[s.id] = { s, data: s.enc === 'deflate-raw-chunks' ? inflateChunks(stored, s.chunks, s.raw, s.name, file) : s.enc === 'xor-rice' ? decodeVectors(stored, s, file) : stored };
  }
  const slotsSec = got.slots, skelSec = got.skeleton;
  if (!slotsSec || !skelSec) throw new Error('checkpoint ' + file + ': no slots or no skeleton section');
  const recs = inflateRawSync(slotsSec.stored);
  if (recs.length !== slotsSec.s.raw) throw new Error('checkpoint ' + file + ': slots inflate to ' + recs.length + ' bytes, the header says ' + slotsSec.s.raw);
  const strings = new Array(slotsSec.s.count);
  let i = 0, k = 0;
  const next = () => { const [v, j] = readVarint(recs, i); i = j; return v; };
  const sec = (id) => { const x = byId[id]; if (!x) throw new Error('checkpoint ' + file + ': a slot names section ' + id + ', which the header does not declare'); return x; };
  while (i < recs.length) {
    const type = recs[i++];
    if (type === S_RAW || type === S_B64) {
      const { data } = sec(next()); const at = next(), n = next();
      strings[k++] = data.toString(type === S_RAW ? 'latin1' : 'base64', at, at + n);
    } else if (type === S_PACKED || type === S_BIPOLAR || type === S_TERNARY) {
      const { s, data } = sec(next()); const idx = next();
      const at = idx * s.per;
      if (idx >= s.count) throw new Error('checkpoint ' + file + ': vector ' + idx + ' past the ' + s.count + ' of ' + s.name);
      if (type === S_PACKED) strings[k++] = 'b' + s.lanes + ':' + data.toString('base64', at, at + s.per);
      else if (type === S_BIPOLAR) strings[k++] = unpackBipolar(data, s.lanes, at).toString('base64');
      else strings[k++] = unpackTernaryAsBytes(data, s.lanes, at).toString('base64');
    } else throw new Error('checkpoint ' + file + ': unknown slot type ' + type + ' at byte ' + (i - 1) + ' of the slot records');
  }
  if (k !== strings.length) throw new Error('checkpoint ' + file + ': ' + k + ' slot records for a declared ' + strings.length);
  const text = inflateChunks(skelSec.stored, skelSec.s.chunks, skelSec.s.raw, 'skeleton', file);
  let doc;
  if (text.length <= limit) doc = JSON.parse(text.toString('utf8'));
  else {
    const [value, end] = parseAt(text, ws(text, 0), limit);
    if (ws(text, end) !== text.length) throw new SyntaxError('trailing bytes after the skeleton at ' + end);
    doc = value;
  }
  return { doc: unref(doc, strings), header };
}
// an xor-rice section back into its store of packed vectors, checked end to end: the decoded
// bytes must be exactly as long as, and have the CRC32 of, the store the writer coded
function decodeVectors(stored, s, file) {
  let data;
  try { data = xorRiceDecode(stored, s.per, s.count); } catch (e) { throw new Error('checkpoint ' + file + ': section ' + s.name + ' does not decode (' + e.message + '); refusing to restore it'); }
  if (data.length !== s.raw) throw new Error('checkpoint ' + file + ': section ' + s.name + ' decodes to ' + data.length + ' bytes, the header says ' + s.raw);
  const c = crc32(data);
  if (c !== (s.rawCrc32 >>> 0)) throw new Error('checkpoint ' + file + ': section ' + s.name + ' decodes to bytes that fail their checksum (stored crc32 ' + (s.rawCrc32 >>> 0).toString(16) + ', computed ' + c.toString(16) + '); refusing to restore it');
  return data;
}
// two bit codes back into the Int8 bytes (as unsigned: -1 is 255) they were packed from
function unpackTernaryAsBytes(bits, n, at) {
  const out = Buffer.allocUnsafe(n);
  for (let i = 0; i < n; i++) {
    const c = (bits[at + (i >>> 2)] >>> ((i & 3) << 1)) & 3;
    if (c === 3) throw new RangeError('ternary slot: code 11 at lane ' + i);
    out[i] = c === 1 ? PLUS_ONE : c === 2 ? MINUS_ONE : 0;
  }
  return out;
}
/** Read a container 2 checkpoint file: the document and its header. */
export function readCheckpoint(file, opts = {}) { return readCheckpointBuffer(readAll(file, 1 << 30), { ...opts, file }); }
