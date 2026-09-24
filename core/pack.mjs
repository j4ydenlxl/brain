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
