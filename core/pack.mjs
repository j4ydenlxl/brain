// core/pack.mjs: PACKED HYPERVECTORS. A bipolar hypervector (every lane +1 or -1, which is what
// core/simd.mjs hands out at 8192 lanes) carries ONE bit of content per lane, and an Int8Array
// spends eight on it; as a JSON array of numbers it spends about three characters. A ternary
// vector (lanes in -1, 0, +1) carries log2(3) bits and is stored in two.
//
// Two layers:
//   bits    packBipolarBits / unpackBipolarBits and packTernaryBits / unpackTernaryBits work on
//           raw lanes and raw bytes, with no framing, for bulk use (core/persist.mjs writes a
//           whole checkpoint section of them back to back).
//   framed  packHV / unpackHV write one vector as a self describing record with a checksum:
//             byte 0      kind: 1 bipolar, 2 ternary
//             bytes 1..4  lanes, uint32 little endian
//             bytes 5..   the packed lanes
//             last 4      CRC32 (IEEE, zlib's) over every byte before it, uint32 little endian
//           unpackHV refuses a record whose checksum, kind or length does not hold, so a
//           flipped bit is an error that names itself, never a silently different vector.
//
// Bit order: lane i lives in byte i >> 3 at bit i & 7, and a set bit means +1. That is the
// order core/signal.mjs packHV has always written after its 'b<lanes>:' marker, so a packed
// payload from a snapshot and a packed record here hold the same bytes.
// Ternary: lane i lives in byte i >> 2 at bits 2 * (i & 3) and up: 00 is 0, 01 is +1, 10 is -1.
// 11 never occurs in anything this file writes, and the reader refuses it.
//
// Exact round trip is the contract, graded in test/compress.test.mjs on 1000 random vectors
// of each kind and of lane counts that are not multiples of 8.
import zlib from 'node:zlib';

export const KIND_BIPOLAR = 1;
export const KIND_TERNARY = 2;
const FRAME = 1 + 4 + 4; // kind, lanes, crc32

// ---------------------------------------------------------------- the checksum
// zlib.crc32 is in Node since 22.2; the table below is the same polynomial (0xEDB88320) for a
// runtime without it, so a checkpoint written on one reads on the other.
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32Table(buf, seed = 0) {
  let c = (seed ^ 0xFFFFFFFF) >>> 0;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
const NATIVE = typeof zlib.crc32 === 'function';
/** CRC32 (IEEE) of a Uint8Array or Buffer, as an unsigned 32 bit integer. */
export function crc32(buf, seed = 0) {
  const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  return NATIVE ? zlib.crc32(u, seed) >>> 0 : crc32Table(u, seed);
}
export { crc32Table as crc32Portable };

// ---------------------------------------------------------------- lane tests
// Both read the lanes as signed values, so an Int8Array and the Uint8 view of its bytes
// (where -1 reads 255) give the same answer.
const lane = (v, i) => { const x = v[i]; return x > 127 ? x - 256 : x; };
/** true when every lane is +1 or -1 */
export function isBipolar(v) {
  for (let i = 0; i < v.length; i++) { const x = lane(v, i); if (x !== 1 && x !== -1) return false; }
  return true;
}
/** true when every lane is -1, 0 or +1 */
export function isTernary(v) {
  for (let i = 0; i < v.length; i++) { const x = lane(v, i); if (x !== 1 && x !== -1 && x !== 0) return false; }
  return true;
}

export const bipolarBytes = (n) => (n + 7) >>> 3;
export const ternaryBytes = (n) => (n + 3) >>> 2;

// ---------------------------------------------------------------- bipolar, one bit per lane
/**
 * Pack the lanes of a bipolar vector (Int8Array, or the bytes of one) into bits.
 * @param {ArrayLike<number>} v lanes, each +1 or -1 (255 read as -1)
 * @param {Uint8Array} [out] destination with room for bipolarBytes(v.length) bytes at `at`
 * @param {number} [at] byte offset into out
 * @returns {Uint8Array} out
 */
export function packBipolarBits(v, out = null, at = 0) {
  const n = v.length, nb = bipolarBytes(n);
  const o = out || new Uint8Array(nb);
  if (out) o.fill(0, at, at + nb);
  const full = n >>> 3;
  // eight lanes to a byte, unrolled: a lane is +1 exactly when its signed value is positive
  for (let b = 0, i = 0; b < full; b++, i += 8) {
    o[at + b] = (lane(v, i) > 0 ? 1 : 0) | (lane(v, i + 1) > 0 ? 2 : 0) | (lane(v, i + 2) > 0 ? 4 : 0) | (lane(v, i + 3) > 0 ? 8 : 0)
      | (lane(v, i + 4) > 0 ? 16 : 0) | (lane(v, i + 5) > 0 ? 32 : 0) | (lane(v, i + 6) > 0 ? 64 : 0) | (lane(v, i + 7) > 0 ? 128 : 0);
  }
  for (let i = full << 3; i < n; i++) if (lane(v, i) > 0) o[at + (i >>> 3)] |= 1 << (i & 7);
  return o;
}
/**
 * n lanes back out of the bits, +1 where a bit is set and -1 where it is not.
 * @param {Uint8Array} bits @param {number} n lanes @param {number} [at] byte offset
 * @param {Int8Array} [out] destination of n lanes
 * @returns {Int8Array}
 */
export function unpackBipolarBits(bits, n, at = 0, out = null) {
  if (at + bipolarBytes(n) > bits.length) throw new RangeError('bipolar bits: ' + n + ' lanes need ' + bipolarBytes(n) + ' bytes at ' + at + ', have ' + (bits.length - at));
  const o = out || new Int8Array(n);
  for (let i = 0; i < n; i++) o[i] = (bits[at + (i >>> 3)] >>> (i & 7)) & 1 ? 1 : -1;
  return o;
}

// ---------------------------------------------------------------- ternary, two bits per lane
/** Pack lanes in -1, 0, +1 at two bits each. Throws on any other lane value. */
export function packTernaryBits(v, out = null, at = 0) {
  const n = v.length, nb = ternaryBytes(n);
  const o = out || new Uint8Array(nb);
  if (out) o.fill(0, at, at + nb);
  for (let i = 0; i < n; i++) {
    const x = lane(v, i);
    if (x === 0) continue;
    if (x !== 1 && x !== -1) throw new RangeError('ternary pack: lane ' + i + ' is ' + x);
    o[at + (i >>> 2)] |= (x === 1 ? 1 : 2) << ((i & 3) << 1);
  }
  return o;
}
/** n lanes back out of two bit codes. Refuses the code 11, which nothing here writes. */
export function unpackTernaryBits(bits, n, at = 0, out = null) {
  if (at + ternaryBytes(n) > bits.length) throw new RangeError('ternary bits: ' + n + ' lanes need ' + ternaryBytes(n) + ' bytes at ' + at + ', have ' + (bits.length - at));
  const o = out || new Int8Array(n);
  for (let i = 0; i < n; i++) {
    const c = (bits[at + (i >>> 2)] >>> ((i & 3) << 1)) & 3;
    if (c === 3) throw new RangeError('ternary unpack: code 11 at lane ' + i);
    o[i] = c === 1 ? 1 : c === 2 ? -1 : 0;
  }
  return o;
}

// ---------------------------------------------------------------- one vector, framed
/**
 * One hypervector as a checksummed record. The kind is chosen from the lanes: bipolar when
 * every lane is +1 or -1, ternary when some lane is 0, and anything else is refused.
 * @param {Int8Array|ArrayLike<number>} v
 * @returns {Buffer}
 */
export function packHV(v) {
  const n = v.length;
  const kind = isBipolar(v) ? KIND_BIPOLAR : isTernary(v) ? KIND_TERNARY : 0;
  if (!kind) throw new RangeError('packHV: a lane outside -1, 0, +1');
  const body = kind === KIND_BIPOLAR ? bipolarBytes(n) : ternaryBytes(n);
  const out = Buffer.alloc(FRAME + body);
  out[0] = kind;
  out.writeUInt32LE(n, 1);
  if (kind === KIND_BIPOLAR) packBipolarBits(v, out, 5); else packTernaryBits(v, out, 5);
  out.writeUInt32LE(crc32(out.subarray(0, 5 + body)), 5 + body);
  return out;
}
/**
 * The record back into lanes, after its checksum, kind and length are checked.
 * @param {Uint8Array} rec
 * @returns {{ v: Int8Array, kind: number, lanes: number }}
 */
export function unpackHVRecord(rec) {
  const buf = Buffer.isBuffer(rec) ? rec : Buffer.from(rec.buffer, rec.byteOffset, rec.byteLength);
  if (buf.length < FRAME) throw new RangeError('packed hv: ' + buf.length + ' bytes is shorter than a frame');
  const kind = buf[0], n = buf.readUInt32LE(1);
  if (kind !== KIND_BIPOLAR && kind !== KIND_TERNARY) throw new RangeError('packed hv: unknown kind ' + kind);
  const body = kind === KIND_BIPOLAR ? bipolarBytes(n) : ternaryBytes(n);
  if (buf.length !== FRAME + body) throw new RangeError('packed hv: ' + buf.length + ' bytes for ' + n + ' lanes of kind ' + kind + ', expected ' + (FRAME + body));
  const want = buf.readUInt32LE(5 + body), got = crc32(buf.subarray(0, 5 + body));
  if (want !== got) throw new Error('packed hv: checksum mismatch, stored crc32 ' + want.toString(16) + ', computed ' + got.toString(16));
  const v = kind === KIND_BIPOLAR ? unpackBipolarBits(buf, n, 5) : unpackTernaryBits(buf, n, 5);
  return { v, kind, lanes: n };
}
/** The lanes of a framed record (see unpackHVRecord for what is checked). */
export function unpackHV(rec) { return unpackHVRecord(rec).v; }
/** Bytes a framed record of n lanes takes. */
export function packedSize(n, kind = KIND_BIPOLAR) { return FRAME + (kind === KIND_BIPOLAR ? bipolarBytes(n) : ternaryBytes(n)); }

// ---------------------------------------------------------------- a store of vectors, delta coded
// The hypervectors an organism holds are not independent. MEASURED on the bar checkpoint of
// bench/compress.mjs (12 majors, t=2000, 19685 distinct 8192 lane vectors, 18291 of them
// episodic memory keys): the Hamming distance from each vector to the nearest of the vectors
// stored before it has median 522 and 90th percentile 1108 of 8192, where two independent
// vectors sit at 4096. The nearest is rarely the one just before (mean 4425.2 against the
// previous vector) but usually within the 64 before it (mean 639.1), so a vector is coded
// against the best of the last `window` as the XOR of the two, and the XOR, sparse, as the gaps
// between its set bits in a Rice code. Measured on the same 20157440 bytes: deflate alone 13716923,
// XOR against the best of 64 then deflate 8671962, XOR then Rice 7340437 (512 back: 7254814, five
// times the search for 1 percent). A vector whose delta would cost more than its bits is stored
// raw, so the section is never more than 7 bits a vector over the raw store.
//
// Stream, least significant bit first, one record per vector in store order:
//   7 bits      d, the reference: 0 = raw, else the vector d places back (1..127)
//   raw         the vector's bytes, 8 bits each
//   delta       NB bits: n, the lanes that differ from the reference (NB holds 0..8*per)
//               5 bits:  k, the Rice parameter
//               n codes: gap g (lanes between two set bits of the XOR) as g >> k in unary
//                        (ones, then a zero) and the low k bits of g
// The reference is the nearest by Hamming distance, the closest one back on a tie, so the
// stream is a function of the store alone. The decoder refuses a reference before the first
// vector, a gap past the last lane, a stream that ends inside a code and trailing bits.
const XR_REF_BITS = 7;
const XR_K_BITS = 5;
export const XOR_RICE_WINDOW = 64;
const LITTLE = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
const POP8 = (() => { const t = new Uint8Array(256); for (let i = 1; i < 256; i++) t[i] = (i & 1) + t[i >> 1]; return t; })();

class BitWriter {
  constructor(cap) { this.buf = new Uint8Array(Math.max(64, cap)); this.pos = 0; this.acc = 0; this.n = 0; }
  // the low `bits` bits of v, bits <= 24 (this.n < 8 between calls, so the sum stays under 32)
  write(v, bits) {
    if (this.pos + 4 > this.buf.length) { const b = new Uint8Array(this.buf.length * 2); b.set(this.buf.subarray(0, this.pos)); this.buf = b; }
    this.acc |= (v & ((1 << bits) - 1)) << this.n;
    this.n += bits;
    while (this.n >= 8) { this.buf[this.pos++] = this.acc & 0xff; this.acc >>>= 8; this.n -= 8; }
  }
  ones(q) { while (q >= 24) { this.write(0xffffff, 24); q -= 24; } if (q > 0) this.write((1 << q) - 1, q); }
  finish() {
    if (this.n > 0) { if (this.pos + 1 > this.buf.length) { const b = new Uint8Array(this.pos + 1); b.set(this.buf.subarray(0, this.pos)); this.buf = b; } this.buf[this.pos++] = this.acc & 0xff; this.acc = 0; this.n = 0; }
    return Buffer.from(this.buf.buffer, this.buf.byteOffset, this.pos);
  }
}
class BitReader {
  constructor(buf) { this.buf = buf; this.pos = 0; this.acc = 0; this.n = 0; }
  read(bits) {
    while (this.n < bits) {
      if (this.pos >= this.buf.length) throw new RangeError('xor-rice: the stream ends inside a code');
      this.acc |= this.buf[this.pos++] << this.n; this.n += 8;
    }
    const v = this.acc & ((1 << bits) - 1);
    this.acc >>>= bits; this.n -= bits;
    return v;
  }
  unary(max) {
    let q = 0;
    for (;;) {
      if (this.n === 0) {
        if (this.pos >= this.buf.length) throw new RangeError('xor-rice: the stream ends inside a code');
        this.acc = this.buf[this.pos++]; this.n = 8;
      }
      const bit = this.acc & 1; this.acc >>>= 1; this.n--;
      if (!bit) return q;
      if (++q > max) throw new RangeError('xor-rice: a gap longer than the vector');
    }
  }
  end() {
    if (this.pos !== this.buf.length || this.n >= 8 || (this.acc & ((1 << this.n) - 1)) !== 0) throw new RangeError('xor-rice: ' + (this.buf.length - this.pos) + ' bytes and ' + this.n + ' bits after the last vector');
  }
}

/**
 * A store of `count` vectors of `per` bytes each, back to back, as one XOR and Rice coded stream.
 * @param {Uint8Array} store at least per * count bytes
 * @param {number} per bytes a vector
 * @param {number} count vectors
 * @param {object} [opts] { window: how many vectors back a reference may be, 0..127 }
 * @returns {Buffer}
 */
export function xorRiceEncode(store, per, count, { window = XOR_RICE_WINDOW } = {}) {
  if (!(Number.isInteger(per) && per > 0)) throw new RangeError('xorRiceEncode: per must be a positive integer, got ' + per);
  if (!(Number.isInteger(count) && count >= 0)) throw new RangeError('xorRiceEncode: count must be a non negative integer, got ' + count);
  if (!(Number.isInteger(window) && window >= 0 && window < (1 << XR_REF_BITS))) throw new RangeError('xorRiceEncode: window must be 0..' + ((1 << XR_REF_BITS) - 1) + ', got ' + window);
  const need = per * count;
  if (store.length < need) throw new RangeError('xorRiceEncode: ' + store.length + ' bytes for ' + count + ' vectors of ' + per);
  const nbits = per * 8, NB = 32 - Math.clz32(nbits);
  if (NB > 24) throw new RangeError('xorRiceEncode: a vector of ' + nbits + ' lanes is past this coder');
  const a = new Uint8Array(need); a.set(store.subarray(0, need));
  const W = per >>> 2, words = LITTLE && per % 4 === 0 && need > 0 ? new Uint32Array(a.buffer, 0, need >>> 2) : null;
  const ham = words
    ? (i, j) => { let c = 0; const x0 = i * W, y0 = j * W; for (let q = 0; q < W; q++) { let x = words[x0 + q] ^ words[y0 + q]; x = x - ((x >>> 1) & 0x55555555); x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); c += (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; } return c; }
    : (i, j) => { let c = 0; const x0 = i * per, y0 = j * per; for (let q = 0; q < per; q++) c += POP8[a[x0 + q] ^ a[y0 + q]]; return c; };
  const w = new BitWriter((need >>> 1) + 64);
  const gaps = new Int32Array(nbits);
  for (let i = 0; i < count; i++) {
    let r = -1, best = nbits + 1;
    for (let j = i - 1, lo = Math.max(0, i - window); j >= lo; j--) { const h = ham(i, j); if (h < best) { best = h; r = j; } }
    let ng = 0, k = 0, cost = Infinity;
    if (r >= 0) {
      let last = -1;
      if (words) {
        const x0 = i * W, y0 = r * W;
        for (let q = 0; q < W; q++) { let v = words[x0 + q] ^ words[y0 + q]; while (v !== 0) { const low = v & -v; const pos = (q << 5) + (31 - Math.clz32(low)); gaps[ng++] = pos - last - 1; last = pos; v ^= low; } }
      } else {
        const x0 = i * per, y0 = r * per;
        for (let q = 0; q < per; q++) { let v = a[x0 + q] ^ a[y0 + q]; while (v !== 0) { const low = v & -v; const pos = (q << 3) + (31 - Math.clz32(low)); gaps[ng++] = pos - last - 1; last = pos; v ^= low; } }
      }
      // k near log2 of the mean gap, then the exact cost of it and of both neighbours
      const mean = ng > 0 ? (nbits - ng) / ng : 0;
      const k0 = Math.max(0, Math.min(23, Math.floor(Math.log2(Math.max(1, mean * Math.LN2)))));
      for (let kk = Math.max(0, k0 - 1); kk <= Math.min(23, k0 + 1); kk++) {
        let c = ng * (kk + 1);
        for (let t = 0; t < ng; t++) c += gaps[t] >>> kk;
        if (c < cost) { cost = c; k = kk; }
      }
      cost += NB + XR_K_BITS;
    }
    const at = i * per;
    if (r < 0 || cost >= nbits) {
      w.write(0, XR_REF_BITS);
      for (let b = 0; b < per; b++) w.write(a[at + b], 8);
    } else {
      w.write(i - r, XR_REF_BITS); w.write(ng, NB); w.write(k, XR_K_BITS);
      const mask = (1 << k) - 1;
      for (let t = 0; t < ng; t++) { w.ones(gaps[t] >>> k); w.write(0, 1); if (k > 0) w.write(gaps[t] & mask, k); }
    }
  }
  return w.finish();
}

/**
 * The stream of xorRiceEncode back into the store it was made from.
 * @param {Uint8Array} buf
 * @param {number} per bytes a vector
 * @param {number} count vectors
 * @returns {Buffer} per * count bytes
 */
export function xorRiceDecode(buf, per, count) {
  if (!(Number.isInteger(per) && per > 0)) throw new RangeError('xorRiceDecode: per must be a positive integer, got ' + per);
  if (!(Number.isInteger(count) && count >= 0)) throw new RangeError('xorRiceDecode: count must be a non negative integer, got ' + count);
  const nbits = per * 8, NB = 32 - Math.clz32(nbits);
  if (NB > 24) throw new RangeError('xorRiceDecode: a vector of ' + nbits + ' lanes is past this coder');
  const out = Buffer.alloc(per * count);
  const rd = new BitReader(buf instanceof Uint8Array ? buf : new Uint8Array(buf));
  for (let i = 0; i < count; i++) {
    const d = rd.read(XR_REF_BITS), at = i * per;
    if (d === 0) { for (let b = 0; b < per; b++) out[at + b] = rd.read(8); continue; }
    if (d > i) throw new RangeError('xor-rice: vector ' + i + ' refers ' + d + ' back, before the first vector');
    const from = (i - d) * per;
    out.copy(out, at, from, from + per);
    const ng = rd.read(NB), k = rd.read(XR_K_BITS);
    if (ng > nbits) throw new RangeError('xor-rice: vector ' + i + ' flips ' + ng + ' of ' + nbits + ' lanes');
    const maxQ = (nbits >>> k) + 1;
    let pos = -1;
    for (let t = 0; t < ng; t++) {
      const q = rd.unary(maxQ);
      pos += (k > 0 ? q * (1 << k) + rd.read(k) : q) + 1;
      if (pos >= nbits) throw new RangeError('xor-rice: vector ' + i + ' flips lane ' + pos + ' of ' + nbits);
      out[at + (pos >>> 3)] ^= 1 << (pos & 7);
    }
  }
  rd.end();
  return out;
}

// ---------------------------------------------------------------- the streamed coder (board 19 builder)
// Board 19, queue item 9 (B1, the fit). xorRiceEncode above holds the whole store, a copy of it
// and an output buffer of half its size or more: three times a group's vectors at once, on the
// daemon's checkpoint path. core/persist.mjs writeCheckpointStreamed feeds this coder one vector
// at a time instead. It keeps only the vectors a reference may name (window + 1 slots of per
// bytes) and hands its output to sink(bytes) in pieces of at most `block` bytes (sink copies;
// the view is reused). The bits are exactly xorRiceEncode's for the same vectors in the same
// order: the same reference search (nearest by Hamming distance, the closest one back on a
// tie), the same Rice parameter, the same bit writer, so a checkpoint's bytes do not change
// (test/cloud-fit-stream.test.mjs holds the two equal on random and clustered stores).
export class XorRiceStream {
  constructor(per, sink, { window = XOR_RICE_WINDOW, block = 1 << 16 } = {}) {
    if (!(Number.isInteger(per) && per > 0)) throw new RangeError('XorRiceStream: per must be a positive integer, got ' + per);
    if (!(Number.isInteger(window) && window >= 0 && window < (1 << XR_REF_BITS))) throw new RangeError('XorRiceStream: window must be 0..' + ((1 << XR_REF_BITS) - 1) + ', got ' + window);
    if (typeof sink !== 'function') throw new TypeError('XorRiceStream: sink must be a function');
    const nbits = per * 8;
    this.NB = 32 - Math.clz32(nbits);
    if (this.NB > 24) throw new RangeError('XorRiceStream: a vector of ' + nbits + ' lanes is past this coder');
    this.per = per; this.nbits = nbits; this.window = window; this.sink = sink;
    this.slots = window + 1; // the candidates i-window .. i-1 and the vector being coded
    this.ring = new Uint8Array(this.slots * per);
    this.W = per >>> 2;
    this.words = LITTLE && per % 4 === 0 ? new Uint32Array(this.ring.buffer, 0, (this.slots * per) >>> 2) : null;
    this.gaps = new Int32Array(nbits);
    this.out = new Uint8Array(Math.max(64, block | 0)); this.pos = 0; this.acc = 0; this.n = 0;
    this.count = 0; this.bytes = 0; this.done = false;
  }
  /** bytes held by this coder: the window ring, the gap list and the output block */
  get held() { return this.ring.byteLength + this.gaps.byteLength + this.out.byteLength; }
  _drain() { if (this.pos) { this.sink(this.out.subarray(0, this.pos)); this.bytes += this.pos; this.pos = 0; } }
  _write(v, bits) {
    if (this.pos + 4 > this.out.length) this._drain();
    this.acc |= (v & ((1 << bits) - 1)) << this.n;
    this.n += bits;
    while (this.n >= 8) { this.out[this.pos++] = this.acc & 0xff; this.acc >>>= 8; this.n -= 8; }
  }
  _ones(q) { while (q >= 24) { this._write(0xffffff, 24); q -= 24; } if (q > 0) this._write((1 << q) - 1, q); }
  /** code one vector of `per` bytes */
  push(vec) {
    if (this.done) throw new Error('XorRiceStream: push after finish');
    if (!vec || vec.length !== this.per) throw new RangeError('XorRiceStream: a vector of ' + (vec ? vec.length : 0) + ' bytes, want ' + this.per);
    const { per, nbits, NB, window, slots, ring, words, W, gaps } = this;
    const i = this.count++;
    const si = i % slots, at = si * per;
    ring.set(vec, at);
    const ham = words
      ? (sj) => { let c = 0; const x0 = si * W, y0 = sj * W; for (let q = 0; q < W; q++) { let x = words[x0 + q] ^ words[y0 + q]; x = x - ((x >>> 1) & 0x55555555); x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); c += (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; } return c; }
      : (sj) => { let c = 0; const x0 = si * per, y0 = sj * per; for (let q = 0; q < per; q++) c += POP8[ring[x0 + q] ^ ring[y0 + q]]; return c; };
    let r = -1, best = nbits + 1;
    for (let j = i - 1, lo = Math.max(0, i - window); j >= lo; j--) { const h = ham(j % slots); if (h < best) { best = h; r = j; } }
    let ng = 0, k = 0, cost = Infinity;
    if (r >= 0) {
      const sr = r % slots;
      let last = -1;
      if (words) {
        const x0 = si * W, y0 = sr * W;
        for (let q = 0; q < W; q++) { let v = words[x0 + q] ^ words[y0 + q]; while (v !== 0) { const low = v & -v; const pos = (q << 5) + (31 - Math.clz32(low)); gaps[ng++] = pos - last - 1; last = pos; v ^= low; } }
      } else {
        const x0 = si * per, y0 = sr * per;
        for (let q = 0; q < per; q++) { let v = ring[x0 + q] ^ ring[y0 + q]; while (v !== 0) { const low = v & -v; const pos = (q << 3) + (31 - Math.clz32(low)); gaps[ng++] = pos - last - 1; last = pos; v ^= low; } }
      }
      const mean = ng > 0 ? (nbits - ng) / ng : 0;
      const k0 = Math.max(0, Math.min(23, Math.floor(Math.log2(Math.max(1, mean * Math.LN2)))));
      for (let kk = Math.max(0, k0 - 1); kk <= Math.min(23, k0 + 1); kk++) {
        let c = ng * (kk + 1);
        for (let t = 0; t < ng; t++) c += gaps[t] >>> kk;
        if (c < cost) { cost = c; k = kk; }
      }
      cost += NB + XR_K_BITS;
    }
    if (r < 0 || cost >= nbits) {
      this._write(0, XR_REF_BITS);
      for (let b = 0; b < per; b++) this._write(ring[at + b], 8);
    } else {
      this._write(i - r, XR_REF_BITS); this._write(ng, NB); this._write(k, XR_K_BITS);
      const mask = (1 << k) - 1;
      for (let t = 0; t < ng; t++) { this._ones(gaps[t] >>> k); this._write(0, 1); if (k > 0) this._write(gaps[t] & mask, k); }
    }
  }
  /** the last partial byte, then everything left to the sink; returns the stream's length in bytes */
  finish() {
    if (this.done) return this.bytes;
    if (this.n > 0) { if (this.pos + 1 > this.out.length) this._drain(); this.out[this.pos++] = this.acc & 0xff; this.acc = 0; this.n = 0; }
    this._drain();
    this.done = true;
    return this.bytes;
  }
}

// ---------------------------------------------------------------- a resident store of packed vectors
// Board 12, item delta (his P5, "self compressing"). A memory tier that stores its keys as 8192
// Int8 lanes spends 8192 bytes on a vector that carries 1024 bytes of content, and the tiers that
// only ever COMPARE keys (nearest by dot product, or by Hamming distance, which for bipolar
// vectors is the same ranking: dot = lanes - 2 * hamming) never need a lane value at all. This
// store packs on write (one bit a lane, the bit order above), answers Hamming distance and the
// nearest key straight from the packed words with a popcount, and unpacks a vector only when a
// caller asks for its lanes. bench/compress.mjs measures what it holds against the Int8 form and
// the recall of the tiers read through it on bench/knowledge.mjs's held-out draw.
//
// Ties go to the EARLIER vector, which is what memory.assoc (a strict > scan) and ItemMemory
// (insertion order) do, so a tier read through this store names the same key the Int8 scan names.
const popcnt32 = (x) => { x = x - ((x >>> 1) & 0x55555555); x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; };

/**
 * Hamming distance between two bipolar vectors held as Int8 lanes (the reference the packed
 * form is graded against; a lane counts as +1 when its signed value is positive).
 */
export function hammingLanes(a, b) {
  if (a.length !== b.length) throw new RangeError('hammingLanes: ' + a.length + ' lanes against ' + b.length);
  let h = 0;
  for (let i = 0; i < a.length; i++) if ((lane(a, i) > 0) !== (lane(b, i) > 0)) h++;
  return h;
}
/**
 * Hamming distance between two packed vectors of `words` 32 bit words each.
 * @param {Uint32Array} a @param {Uint32Array} b @param {number} words
 * @param {number} [ao] word offset into a @param {number} [bo] word offset into b
 */
export function hammingPacked(a, b, words = Math.min(a.length, b.length), ao = 0, bo = 0) {
  let h = 0;
  for (let q = 0; q < words; q++) h += popcnt32(a[ao + q] ^ b[bo + q]);
  return h;
}
/** The words of one bipolar vector packed for a PackedHVStore of `lanes` lanes. */
export function packWords(v, lanes = v.length) {
  const words = (lanes + 31) >>> 5;
  const out = new Uint32Array(words);
  packBipolarBits(v, new Uint8Array(out.buffer, 0, bipolarBytes(lanes)), 0);
  return out;
}

export class PackedHVStore {
  /**
   * @param {number} lanes lanes a vector (8192 for core/simd.mjs vectors)
   * @param {number} [capacity] vectors to reserve room for; the store grows by doubling past it
   */
  constructor(lanes, capacity = 64) {
    if (!(Number.isInteger(lanes) && lanes > 0)) throw new RangeError('PackedHVStore: lanes must be a positive integer, got ' + lanes);
    this.lanes = lanes;
    this.words = (lanes + 31) >>> 5;
    this.count = 0;
    this.data = new Uint32Array(Math.max(1, capacity) * this.words);
    // the pad bits of the last word are zero in every stored vector and in every packed query,
    // so they never add to a distance
  }
  /** Bytes the store holds for its vectors (its word buffer, including room not yet used). */
  get bytes() { return this.data.byteLength; }
  /** Bytes the stored vectors occupy: count x words x 4. */
  get usedBytes() { return this.count * this.words * 4; }
  _room(n) {
    if (n * this.words <= this.data.length) return;
    let cap = Math.max(1, this.data.length / this.words);
    while (cap < n) cap *= 2;
    const d = new Uint32Array(cap * this.words); d.set(this.data.subarray(0, this.count * this.words)); this.data = d;
  }
  /** The packed words of a query: a Uint32Array of the right width passes through, lanes are packed. */
  query(q) {
    if (q instanceof Uint32Array && q.length === this.words) return q;
    if (q.length !== this.lanes) throw new RangeError('PackedHVStore: a query of ' + q.length + ' lanes for a store of ' + this.lanes);
    if (!isBipolar(q)) throw new RangeError('PackedHVStore: a query lane outside +1, -1');
    return packWords(q, this.lanes);
  }
  /**
   * Pack one bipolar vector on the way in. A lane outside +1 / -1 is refused: this store is for
   * the tiers whose keys are bipolar, and a silent rounding would change what they recall.
   * @returns {number} the vector's index
   */
  add(v) {
    const w = this.query(v);
    this._room(this.count + 1);
    this.data.set(w, this.count * this.words);
    return this.count++;
  }
  /** Replace vector i (a ring that overwrites its oldest row). */
  set(i, v) {
    if (!(i >= 0 && i < this.count)) throw new RangeError('PackedHVStore: no vector ' + i);
    this.data.set(this.query(v), i * this.words);
  }
  /** Drop the first n vectors, keeping order (memory.assoc drops its oldest key past capacity). */
  shift(n = 1) {
    const k = Math.min(n, this.count);
    this.data.copyWithin(0, k * this.words, this.count * this.words);
    this.count -= k;
  }
  /** Hamming distance from vector i to a packed query. */
  hamming(i, qw) { return hammingPacked(this.data, qw, this.words, i * this.words, 0); }
  /** dot / lanes of vector i and a packed query: exactly what core/signal.mjs sim() gives on the Int8 lanes. */
  sim(i, qw) { return (this.lanes - 2 * this.hamming(i, qw)) / this.lanes; }
  /**
   * The k nearest vectors by Hamming distance, nearest first, the earlier one first on a tie.
   * @param {Int8Array|Uint32Array} q lanes or packed words
   * @param {number} [k]
   * @param {object} [opts] { ids: only these indices, in this order of preference on a tie }
   * @returns {Array<{ index: number, distance: number, sim: number }>}
   */
  nearest(q, k = 1, { ids = null } = {}) {
    const qw = this.query(q), W = this.words, D = this.data;
    const best = []; // sorted ascending by distance, stable
    const n = ids ? ids.length : this.count;
    for (let t = 0; t < n; t++) {
      const i = ids ? ids[t] : t;
      let h = 0; const o = i * W;
      for (let w = 0; w < W; w++) h += popcnt32(D[o + w] ^ qw[w]);
      if (best.length === k && h >= best[k - 1].distance) continue;
      let at = best.length;
      while (at > 0 && best[at - 1].distance > h) at--;
      best.splice(at, 0, { index: i, distance: h, sim: (this.lanes - 2 * h) / this.lanes });
      if (best.length > k) best.pop();
    }
    return best;
  }
  /** Vector i unpacked into Int8 lanes: the one place a lane value is made. */
  get(i, out = null) {
    if (!(i >= 0 && i < this.count)) throw new RangeError('PackedHVStore: no vector ' + i);
    return unpackBipolarBits(new Uint8Array(this.data.buffer, i * this.words * 4, this.words * 4), this.lanes, 0, out);
  }
}

// ---------------------------------------------------------------- new vectors coded against old ones
// A delta checkpoint (core/checkpoint-delta.mjs) holds only the vectors the chain has not seen.
// MEASURED on 60 s of the daemon's 12 major organism (t=13387 to t=14429, 2575 new 8192 lane
// vectors): coded among themselves with xorRiceEncode they take 1364631 bytes, but each one's
// nearest vector among ALL the chain holds sits at median Hamming 591 (p10 11, p90 1082), which a
// Rice code prices near 363 bytes a vector. So a new vector may name ANY earlier vector as its
// reference, old or new, by its index in the chain's store:
//
//   RB bits     r + 1, the reference's index plus one, 0 = raw (RB holds base + count)
//   raw         the vector's bytes, 8 bits each
//   delta       NB bits n, 5 bits k, n Rice codes: exactly the delta of xorRiceEncode above
//
// The writer picks the references (HammingLsh below finds candidates); the stream is a function
// of the vectors and those choices. The decoder refuses a reference at or past the vector being
// decoded, so a stream can only ever point backwards.
function bitsFor(n) { return Math.max(1, 32 - Math.clz32(n)); }

/**
 * @param {Uint8Array} store `count` new vectors of `per` bytes, back to back
 * @param {number} per @param {number} count
 * @param {object} opts { base: vectors the chain held before these, refs: Int32Array, for each new
 *   vector -1 or the index (below base + i) of its reference, refAt(idx): the bytes of old vector idx < base }
 * @returns {Buffer}
 */
export function xorRefEncode(store, per, count, { base = 0, refs = null, refAt = null } = {}) {
  const nbits = per * 8, NB = 32 - Math.clz32(nbits), RB = bitsFor(base + count);
  if (NB > 24 || RB > 24) throw new RangeError('xorRefEncode: ' + nbits + ' lanes or ' + (base + count) + ' vectors is past this coder');
  if (store.length < per * count) throw new RangeError('xorRefEncode: ' + store.length + ' bytes for ' + count + ' vectors of ' + per);
  const w = new BitWriter((per * count >>> 1) + 64);
  const gaps = new Int32Array(nbits);
  for (let i = 0; i < count; i++) {
    const at = i * per, r = refs ? refs[i] : -1;
    let ng = 0, k = 0, cost = Infinity;
    if (r >= 0) {
      if (r >= base + i) throw new RangeError('xorRefEncode: vector ' + i + ' names reference ' + r + ', not before it');
      const ref = r < base ? refAt(r) : store.subarray((r - base) * per, (r - base + 1) * per);
      let last = -1;
      for (let q = 0; q < per; q++) { let v = store[at + q] ^ ref[q]; while (v !== 0) { const low = v & -v; const pos = (q << 3) + (31 - Math.clz32(low)); gaps[ng++] = pos - last - 1; last = pos; v ^= low; } }
      const mean = ng > 0 ? (nbits - ng) / ng : 0;
      const k0 = Math.max(0, Math.min(23, Math.floor(Math.log2(Math.max(1, mean * Math.LN2)))));
      for (let kk = Math.max(0, k0 - 1); kk <= Math.min(23, k0 + 1); kk++) {
        let c = ng * (kk + 1);
        for (let t = 0; t < ng; t++) c += gaps[t] >>> kk;
        if (c < cost) { cost = c; k = kk; }
      }
      cost += NB + XR_K_BITS;
    }
    if (r < 0 || cost >= nbits) {
      w.write(0, RB);
      for (let b = 0; b < per; b++) w.write(store[at + b], 8);
    } else {
      w.write(r + 1, RB); w.write(ng, NB); w.write(k, XR_K_BITS);
      const mask = (1 << k) - 1;
      for (let t = 0; t < ng; t++) { w.ones(gaps[t] >>> k); w.write(0, 1); if (k > 0) w.write(gaps[t] & mask, k); }
    }
  }
  return w.finish();
}

/**
 * The stream of xorRefEncode back into its `count` vectors.
 * @param {Uint8Array} buf @param {number} per @param {number} count
 * @param {object} opts { base, refAt(idx): the bytes of old vector idx < base }
 * @returns {Buffer} per * count bytes
 */
export function xorRefDecode(buf, per, count, { base = 0, refAt = null } = {}) {
  const nbits = per * 8, NB = 32 - Math.clz32(nbits), RB = bitsFor(base + count);
  if (NB > 24 || RB > 24) throw new RangeError('xorRefDecode: ' + nbits + ' lanes or ' + (base + count) + ' vectors is past this coder');
  const out = Buffer.alloc(per * count);
  const rd = new BitReader(buf instanceof Uint8Array ? buf : new Uint8Array(buf));
  for (let i = 0; i < count; i++) {
    const code = rd.read(RB), at = i * per;
    if (code === 0) { for (let b = 0; b < per; b++) out[at + b] = rd.read(8); continue; }
    const r = code - 1;
    if (r >= base + i) throw new RangeError('xor-ref: vector ' + i + ' names reference ' + r + ', at or past itself (base ' + base + ')');
    const ref = r < base ? (refAt ? refAt(r) : null) : out.subarray((r - base) * per, (r - base + 1) * per);
    if (!ref || ref.length < per) throw new RangeError('xor-ref: vector ' + i + ' names old vector ' + r + ', which the chain does not hold');
    for (let b = 0; b < per; b++) out[at + b] = ref[b];
    const ng = rd.read(NB), k = rd.read(XR_K_BITS);
    if (ng > nbits) throw new RangeError('xor-ref: vector ' + i + ' flips ' + ng + ' of ' + nbits + ' lanes');
    const maxQ = (nbits >>> k) + 1;
    let pos = -1;
    for (let t = 0; t < ng; t++) {
      const q = rd.unary(maxQ);
      pos += (k > 0 ? q * (1 << k) + rd.read(k) : q) + 1;
      if (pos >= nbits) throw new RangeError('xor-ref: vector ' + i + ' flips lane ' + pos + ' of ' + nbits);
      out[at + (pos >>> 3)] ^= 1 << (pos & 7);
    }
  }
  rd.end();
  return out;
}

/**
 * Candidates for the nearest packed vector by Hamming distance, without a scan: `tables` hash
 * tables, each keyed by `bits` lanes drawn from a fixed seed, so two vectors that differ in a
 * fraction f of their lanes share a bucket in one table with probability (1 - f) ^ bits. A
 * bucket keeps its last `cap` members. Approximate by design: it proposes, the caller measures
 * the exact distance of each proposal and keeps the best, and a miss costs bytes, never identity.
 */
export class HammingLsh {
  constructor(lanes, { tables = 16, bits = 14, cap = 8, seed = 0x2545F491 } = {}) {
    if (!(bits >= 1 && bits <= 30)) throw new RangeError('HammingLsh: bits must be 1..30, got ' + bits);
    this.lanes = lanes; this.tables = tables; this.bits = bits; this.cap = cap;
    this.pos = new Int32Array(tables * bits);
    let s = seed >>> 0 || 1;
    for (let i = 0; i < this.pos.length; i++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; this.pos[i] = s % lanes; }
    this.buckets = Array.from({ length: tables }, () => new Map());
  }
  key(bytes, t) {
    let key = 0; const o = t * this.bits;
    for (let j = 0; j < this.bits; j++) { const p = this.pos[o + j]; if ((bytes[p >>> 3] >>> (p & 7)) & 1) key |= 1 << j; }
    return key;
  }
  add(idx, bytes) {
    for (let t = 0; t < this.tables; t++) {
      const m = this.buckets[t], k = this.key(bytes, t);
      let b = m.get(k);
      if (!b) { b = []; m.set(k, b); }
      b.push(idx);
      if (b.length > this.cap) b.shift();
    }
  }
  /** Distinct indices sharing a bucket with `bytes` in any table, the most recent first per table. */
  candidates(bytes) {
    const out = new Set();
    for (let t = 0; t < this.tables; t++) { const b = this.buckets[t].get(this.key(bytes, t)); if (b) for (let i = b.length - 1; i >= 0; i--) out.add(b[i]); }
    return out;
  }
}
