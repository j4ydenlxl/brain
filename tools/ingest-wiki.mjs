// tools/ingest-wiki.mjs. ONE OPEN ENCYCLOPEDIA INTO THE KNOWLEDGE TIER, with no dependency.
//
//   node tools/ingest-wiki.mjs --download                  fetch the dump named below into bench/fixtures/wiki/
//   node tools/ingest-wiki.mjs [--dump F] [--store DIR] [--limit N] [--workers W]
//
// The dump is the Simple English Wikipedia articles dump from dumps.wikimedia.org (CC BY-SA 4.0,
// the url, bytes and sha256 prefix are in bench/fixtures/wiki/SOURCES.md). Everything between the
// file and memory/knowledge.mjs is written here, because nothing in node reads bzip2:
//
//   1. a bzip2 decoder (Huffman, move to front, the inverse Burrows-Wheeler transform, the run
//      length stage) that checks every block's CRC and every stream's combined CRC, so a decoder
//      bug is an exception and never a silently wrong article;
//   2. the multistream split: the articles dump is many small bzip2 streams laid end to end, each
//      starting on a byte boundary with "BZh" and a block magic, so worker threads decode them in
//      parallel and the main thread reassembles them in file order;
//   3. a streaming XML page reader (title, namespace, redirect, text), entity decoding included;
//   4. a wikitext stripper: comments, references, templates, tables, files, categories, links,
//      external links, quotes and tags out, headings kept as section boundaries, plain sentences out;
//   5. the ingest: each article becomes a title item, a first-sentence fact and section facts in
//      memory/knowledge.mjs, with the held-out rule applied on the way in (bench/knowledge.mjs).
//
// Every rate this prints is measured by this run: articles per second, bytes per article on disk,
// memory bytes per article, and breadth as articles held over articles in the dump.
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const FIXTURE_DIR = path.join(ROOT, 'bench', 'fixtures', 'wiki');
export const DUMP_NAME = 'simplewiki-latest-pages-articles-multistream.xml.bz2';
export const DUMP_URL = 'https://dumps.wikimedia.org/simplewiki/latest/' + DUMP_NAME;
export const DUMP_PATH = path.join(FIXTURE_DIR, DUMP_NAME);
export const STORE_DIR = path.join(FIXTURE_DIR, 'store');

// ------------------------------------------------------------------------------------ bzip2
// bzip2's CRC is the big-endian CRC-32 (polynomial 0x04c11db7, not reflected).
const CRC = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i << 24;
  for (let k = 0; k < 8; k++) c = (c & 0x80000000) ? ((c << 1) ^ 0x04c11db7) : (c << 1);
  CRC[i] = c;
}

export class Bz2Error extends Error {}
class Underflow extends Bz2Error {}

const MAX_GROUPS = 6, MAX_ALPHA = 258, MAX_LEN = 20, LOOK = 10, GROUP_SIZE = 50;
const RUNA = 0, RUNB = 1;

/**
 * One reusable decoder: the work arrays for a 900k block are allocated once and reused for
 * every block, so a whole dump costs one set of them per thread.
 */
export class Bz2Decoder {
  constructor() {
    this.ll = new Uint8Array(900000);
    this.tt = new Uint32Array(900000);
    this.out = new Uint8Array(1 << 21);
    this.lens = Array.from({ length: MAX_GROUPS }, () => new Uint8Array(MAX_ALPHA));
    this.look = Array.from({ length: MAX_GROUPS }, () => new Int32Array(1 << LOOK));
    this.limit = Array.from({ length: MAX_GROUPS }, () => new Int32Array(MAX_LEN + 2));
    this.base = Array.from({ length: MAX_GROUPS }, () => new Int32Array(MAX_LEN + 2));
    this.perm = Array.from({ length: MAX_GROUPS }, () => new Int32Array(MAX_ALPHA));
    this.minLen = new Int32Array(MAX_GROUPS);
    this.stats = { streams: 0, blocks: 0, bytesIn: 0, bytesOut: 0 };
  }

  /**
   * Decode every stream that starts at `pos` and follows it in `buf` (a multistream file is
   * streams back to back). Calls emit(Uint8Array view, valid until the next call) per block.
   * @returns {number} the byte position after the last whole stream decoded
   */
  decodeAll(buf, pos, emit) {
    while (pos + 4 <= buf.length && buf[pos] === 0x42 && buf[pos + 1] === 0x5a && buf[pos + 2] === 0x68) {
      pos = this.decodeStream(buf, pos, emit);
    }
    return pos;
  }

  /** One stream at `pos`. @returns {number} the byte position after it */
  decodeStream(buf, pos, emit) {
    if (buf[pos] !== 0x42 || buf[pos + 1] !== 0x5a || buf[pos + 2] !== 0x68) throw new Bz2Error('bz2: no stream header at byte ' + pos);
    const level = buf[pos + 3] - 0x30;
    if (level < 1 || level > 9) throw new Bz2Error('bz2: bad block size ' + level);
    const start = pos;
    // the bit reader state lives in this object so decodeBlock can keep it in locals
    const br = { buf, pos: pos + 4, acc: 0, n: 0 };
    let combined = 0;
    for (;;) {
      const m1 = bits(br, 24), m2 = bits(br, 24);
      if (m1 === 0x314159 && m2 === 0x265359) {
        const stored = ((bits(br, 16) << 16) | bits(br, 16)) | 0;
        const { crc, len } = this.decodeBlock(br, level * 100000);
        if (crc !== stored) throw new Bz2Error('bz2: block CRC mismatch at stream byte ' + start);
        combined = (((combined << 1) | (combined >>> 31)) ^ crc) | 0;
        this.stats.blocks++;
        this.stats.bytesOut += len;
        emit(this.out.subarray(0, len));
      } else if (m1 === 0x177245 && m2 === 0x385090) {
        const stored = ((bits(br, 16) << 16) | bits(br, 16)) | 0;
        if (stored !== combined) throw new Bz2Error('bz2: stream CRC mismatch at byte ' + start);
        // drop the padding bits of the last byte; whole bytes still in the accumulator are unread
        br.n -= br.n & 7;
        const end = br.pos - (br.n >> 3);
        this.stats.streams++;
        this.stats.bytesIn += end - start;
        return end;
      } else {
        throw new Bz2Error('bz2: bad block magic in the stream at byte ' + start);
      }
    }
  }

  decodeBlock(br, blockMax) {
    if (bits(br, 1)) throw new Bz2Error('bz2: randomised blocks (bzip2 before 0.9.5) are not supported');
    const origPtr = bits(br, 24);
    const used16 = bits(br, 16);
    const seqToUnseq = new Uint8Array(256);
    let nInUse = 0;
    for (let i = 0; i < 16; i++) {
      if (used16 & (0x8000 >>> i)) {
        const b = bits(br, 16);
        for (let j = 0; j < 16; j++) if (b & (0x8000 >>> j)) seqToUnseq[nInUse++] = i * 16 + j;
      }
    }
    if (nInUse === 0) throw new Bz2Error('bz2: block uses no symbols');
    const alphaSize = nInUse + 2, EOB = nInUse + 1;
    const nGroups = bits(br, 3);
    if (nGroups < 2 || nGroups > MAX_GROUPS) throw new Bz2Error('bz2: bad group count ' + nGroups);
    const nSelectors = bits(br, 15);
    if (nSelectors < 1) throw new Bz2Error('bz2: no selectors');
    const mtfG = new Uint8Array(MAX_GROUPS);
    for (let i = 0; i < nGroups; i++) mtfG[i] = i;
    const selectors = new Uint8Array(nSelectors);
    for (let i = 0; i < nSelectors; i++) {
      let j = 0;
      while (bits(br, 1)) { j++; if (j >= nGroups) throw new Bz2Error('bz2: bad selector'); }
      const v = mtfG[j];
      for (; j > 0; j--) mtfG[j] = mtfG[j - 1];
      mtfG[0] = v;
      selectors[i] = v;
    }
    for (let t = 0; t < nGroups; t++) {
      const len = this.lens[t];
      let curr = bits(br, 5);
      for (let i = 0; i < alphaSize; i++) {
        for (;;) {
          if (curr < 1 || curr > MAX_LEN) throw new Bz2Error('bz2: bad code length ' + curr);
          if (!bits(br, 1)) break;
          curr += bits(br, 1) ? -1 : 1;
        }
        len[i] = curr;
      }
      this._tables(t, alphaSize);
    }

    // Huffman, run lengths (RUNA/RUNB) and move to front, into ll (the BWT's last column).
    const ll = this.ll, unzftab = new Int32Array(256), mtf = new Uint8Array(256);
    for (let i = 0; i < 256; i++) mtf[i] = i;
    let nblock = 0, groupNo = -1, groupPos = 0, runLen = 0, runMul = 1;
    let look = null, limit = null, base = null, perm = null, minLen = 0;
    let { buf, pos, acc, n } = br;
    const blen = buf.length;
    for (;;) {
      if (groupPos === 0) {
        if (++groupNo >= nSelectors) throw new Bz2Error('bz2: ran out of selectors');
        groupPos = GROUP_SIZE;
        const g = selectors[groupNo];
        look = this.look[g]; limit = this.limit[g]; base = this.base[g]; perm = this.perm[g]; minLen = this.minLen[g];
      }
      groupPos--;
      // peek MAX_LEN bits (zero padded past the end: a valid stream always has 80 more bits)
      while (n < 24) { acc = (acc << 8) | (pos < blen ? buf[pos] : 0); pos++; n += 8; }
      let sym;
      const e = look[(acc >>> (n - LOOK)) & ((1 << LOOK) - 1)];
      if (e >= 0) { sym = e >>> 5; n -= e & 31; }
      else {
        let zn = LOOK + 1, zvec = (acc >>> (n - zn)) & ((1 << zn) - 1);
        while (zn <= MAX_LEN && zvec > limit[zn]) { zn++; zvec = (acc >>> (n - zn)) & ((1 << zn) - 1); }
        if (zn > MAX_LEN) throw new Bz2Error('bz2: bad Huffman code');
        const idx = zvec - base[zn];
        if (idx < 0 || idx >= MAX_ALPHA) throw new Bz2Error('bz2: bad Huffman code');
        sym = perm[idx]; n -= zn;
      }
      if (pos > blen + 4) throw new Underflow('bz2: unexpected end of input');
      if (sym <= RUNB) {
        runLen += (sym + 1) * runMul;
        runMul <<= 1;
        if (runLen > blockMax) throw new Bz2Error('bz2: run too long');
        continue;
      }
      if (runLen > 0) {
        const uc = seqToUnseq[mtf[0]];
        if (nblock + runLen > blockMax) throw new Bz2Error('bz2: block overflow');
        unzftab[uc] += runLen;
        ll.fill(uc, nblock, nblock + runLen);
        nblock += runLen;
        runLen = 0; runMul = 1;
      }
      if (sym === EOB) break;
      let nn = sym - 1;
      const v = mtf[nn];
      if (nn < 16) { for (; nn > 0; nn--) mtf[nn] = mtf[nn - 1]; }
      else mtf.copyWithin(1, 0, nn);
      mtf[0] = v;
      if (nblock >= blockMax) throw new Bz2Error('bz2: block overflow');
      const uc = seqToUnseq[v];
      unzftab[uc]++;
      ll[nblock++] = uc;
    }
    if (pos > blen) throw new Underflow('bz2: unexpected end of input');
    br.pos = pos; br.acc = acc; br.n = n;
    if (origPtr >= nblock) throw new Bz2Error('bz2: origPtr out of range');

    // The inverse BWT: tt[i] holds the byte of row i in its low 8 bits and the next row above.
    const tt = this.tt, cftab = new Int32Array(256);
    for (let i = 1; i < 256; i++) cftab[i] = cftab[i - 1] + unzftab[i - 1];
    for (let i = 0; i < nblock; i++) tt[i] = ll[i];
    for (let i = 0; i < nblock; i++) { const uc = tt[i] & 0xff; tt[cftab[uc]++] |= (i << 8); }

    // The first run length stage: four equal bytes are followed by a count of further copies.
    let out = this.out, o = 0, crc = -1, last = -1, run = 0;
    let tPos = tt[origPtr] >>> 8;
    for (let k = 0; k < nblock; k++) {
      tPos = tt[tPos];
      const ch = tPos & 0xff;
      tPos >>>= 8;
      if (o + 256 > out.length) { const bigger = new Uint8Array(out.length * 2); bigger.set(out.subarray(0, o)); out = this.out = bigger; }
      if (run === 4) {
        for (let r = 0; r < ch; r++) { out[o++] = last; crc = (crc << 8) ^ CRC[((crc >>> 24) ^ last) & 0xff]; }
        run = 0; last = -1;
        continue;
      }
      if (ch === last) run++; else { last = ch; run = 1; }
      out[o++] = ch;
      crc = (crc << 8) ^ CRC[((crc >>> 24) ^ ch) & 0xff];
    }
    return { crc: ~crc | 0, len: o };
  }

  // Canonical Huffman tables for group t: a LOOK bit direct table for short codes, and bzip2's
  // own limit/base/perm arrays for the long ones.
  _tables(t, alphaSize) {
    const len = this.lens[t], limit = this.limit[t], base = this.base[t], perm = this.perm[t], look = this.look[t];
    let minLen = 32, maxLen = 0;
    for (let i = 0; i < alphaSize; i++) { if (len[i] > maxLen) maxLen = len[i]; if (len[i] < minLen) minLen = len[i]; }
    let pp = 0;
    for (let l = minLen; l <= maxLen; l++) for (let j = 0; j < alphaSize; j++) if (len[j] === l) perm[pp++] = j;
    const cnt = new Int32Array(MAX_LEN + 2);
    for (let i = 0; i < alphaSize; i++) cnt[len[i]]++;
    // limit[l]: the largest code of length l; base[l]: code minus perm index for length l
    limit.fill(-1); base.fill(0); look.fill(-1);
    let code = 0, idx = 0;
    for (let l = 1; l <= MAX_LEN; l++) {
      base[l] = code - idx;
      code += cnt[l]; idx += cnt[l];
      limit[l] = code - 1;
      code <<= 1;
    }
    // fill the direct table: every LOOK bit prefix of a code of length <= LOOK
    code = 0; idx = 0;
    for (let l = 1; l <= LOOK; l++) {
      for (let c = 0; c < cnt[l]; c++) {
        const sym = perm[idx + c], cw = code + c;
        const shift = LOOK - l, from = cw << shift, to = from + (1 << shift);
        for (let p = from; p < to; p++) look[p] = (sym << 5) | l;
      }
      code = (code + cnt[l]) << 1; idx += cnt[l];
    }
    this.minLen[t] = minLen;
  }
}

function bits(br, k) {
  while (br.n < k) {
    if (br.pos >= br.buf.length) throw new Underflow('bz2: unexpected end of input');
    br.acc = (br.acc << 8) | br.buf[br.pos++];
    br.n += 8;
  }
  br.n -= k;
  return (br.acc >>> br.n) & ((1 << k) - 1);
}

/** Whole buffer in, whole buffer out (tests and small files). @returns {Buffer} */
export function bunzip2(buf) {
  const dec = new Bz2Decoder(), parts = [];
  const end = dec.decodeAll(buf, 0, (b) => parts.push(Buffer.from(b)));
  if (end === 0) throw new Bz2Error('bz2: not a bzip2 file');
  return Buffer.concat(parts);
}

// A stream start: "BZh" + level + the first block's magic, all byte aligned.
const SIG_TAIL = [0x31, 0x41, 0x59, 0x26, 0x53, 0x59];
function isStreamStart(b, i) {
  if (b[i] !== 0x42 || b[i + 1] !== 0x5a || b[i + 2] !== 0x68) return false;
  const lv = b[i + 3]; if (lv < 0x31 || lv > 0x39) return false;
  for (let k = 0; k < 6; k++) if (b[i + 4 + k] !== SIG_TAIL[k]) return false;
  return true;
}

/**
 * Split a window of a multistream file into candidate stream start offsets. A candidate that
 * is a false match inside compressed data fails its CRC and is merged into the stream before
 * it by the caller, so a false match costs time, never correctness.
 */
export function streamStarts(b, from = 0, to = b.length - 10) {
  const out = [];
  for (let i = b.indexOf(0x42, from); i !== -1 && i <= to; i = b.indexOf(0x42, i + 1)) if (isStreamStart(b, i)) out.push(i);
  return out;
}

/**
 * Read a .bz2 file in windows and hand decoded bytes to onBytes in file order. With workers > 1
 * the streams of each window are decoded in parallel worker threads; the main thread only
 * splits and reassembles. A single stream file decodes on the main thread (it has one stream).
 * @param {string} file
 * @param {(bytes: Uint8Array) => boolean|void} onBytes return false to stop early
 * @param {object} [opts] { workers, windowMB }
 * @returns {Promise<{bytesIn, bytesOut, streams, blocks, stopped}>}
 */
export async function bz2File(file, onBytes, opts = {}) {
  const workers = Math.max(1, opts.workers ?? 1);
  let windowBytes = Math.max(1, opts.windowMB ?? 16) * 1048576;
  const fd = fs.openSync(file, 'r');
  const size = fs.fstatSync(fd).size;
  const stats = { bytesIn: 0, bytesOut: 0, streams: 0, blocks: 0, stopped: false, windows: 0, falseStarts: 0 };
  const pool = workers > 1 ? makePool(workers) : null;
  const dec = new Bz2Decoder();
  try {
    let carry = null, filePos = 0;
    for (;;) {
      const want = Math.min(windowBytes, size - filePos);
      const fresh = Buffer.allocUnsafe(want);
      let got = 0;
      while (got < want) { const r = fs.readSync(fd, fresh, got, want - got, filePos + got); if (r <= 0) break; got += r; }
      filePos += got;
      const buf = carry ? Buffer.concat([carry, fresh.subarray(0, got)]) : fresh.subarray(0, got);
      const last = filePos >= size;
      if (!buf.length) break;
      stats.windows++;
      const starts = streamStarts(buf);
      if (!starts.length || starts[0] !== 0) throw new Bz2Error('bz2: not a bzip2 stream at file byte ' + (filePos - buf.length));
      // every stream whose end is in this window; the stream from the last start is carried
      // over unless this is the last window
      const bounds = last ? [...starts, buf.length] : starts;
      const spans = [];
      for (let i = 0; i + 1 < bounds.length; i++) spans.push([bounds[i], bounds[i + 1]]);
      if (!spans.length) { carry = buf; windowBytes *= 2; continue; } // one stream larger than the window
      const decoded = pool ? await pool.run(buf, spans) : spans.map(([x, y]) => decodeSpan(dec, buf, x, y));
      let next = last ? buf.length : starts[starts.length - 1];
      for (let i = 0; i < spans.length; i++) {
        let [x, y] = spans[i];
        let r = decoded[i];
        // a false start splits one stream in two and both halves fail: decode the merge instead
        while (r.error && i + 1 < spans.length) { stats.falseStarts++; y = spans[++i][1]; r = decodeSpan(dec, buf, x, y); }
        if (r.error) {
          if (!last && r.underflow) { next = x; break; }
          throw new Bz2Error(r.error + ' (stream at file byte ' + (filePos - buf.length + x) + ')');
        }
        stats.streams += r.streams; stats.blocks += r.blocks; stats.bytesIn += y - x; stats.bytesOut += r.bytes.length;
        if (onBytes(r.bytes) === false) { stats.stopped = true; return stats; }
      }
      if (last) {
        if (next < buf.length) throw new Bz2Error('bz2: the file ends inside a stream');
        break;
      }
      carry = Buffer.from(buf.subarray(next));
    }
    return stats;
  } finally {
    fs.closeSync(fd);
    if (pool) await pool.close();
  }
}

function decodeSpan(dec, buf, a, b) {
  const parts = [];
  let total = 0;
  const before = { streams: dec.stats.streams, blocks: dec.stats.blocks };
  try {
    const view = buf.subarray(a, b);
    const end = dec.decodeAll(view, 0, (x) => { parts.push(Buffer.from(x)); total += x.length; });
    if (end !== view.length) return { error: 'bz2: trailing bytes inside a stream span', underflow: false };
    return { bytes: parts.length === 1 ? parts[0] : Buffer.concat(parts, total), streams: dec.stats.streams - before.streams, blocks: dec.stats.blocks - before.blocks };
  } catch (e) {
    if (!(e instanceof Bz2Error)) throw e;
    return { error: e.message, underflow: e instanceof Underflow };
  }
}

// ------------------------------------------------------------------ the worker pool
function makePool(n) {
  const self = fileURLToPath(import.meta.url);
  const ws = Array.from({ length: n }, () => new Worker(self, { workerData: { role: 'bz2' } }));
  let seq = 0;
  const waiting = new Map();
  for (const w of ws) w.on('message', (m) => { const f = waiting.get(m.id); if (f) { waiting.delete(m.id); f(m); } });
  return {
    async run(buf, spans) {
      // one shared copy of the window; each worker decodes a strided share of the spans
      const shared = new SharedArrayBuffer(buf.length);
      new Uint8Array(shared).set(buf);
      const jobs = ws.map((w, k) => new Promise((resolve) => {
        const id = ++seq; waiting.set(id, resolve);
        const mine = spans.map((s, i) => [i, s]).filter(([i]) => i % ws.length === k);
        w.postMessage({ id, shared, spans: mine });
      }));
      const replies = await Promise.all(jobs);
      const out = new Array(spans.length);
      for (const r of replies) for (const [i, res] of r.results) out[i] = res.error ? res : { ...res, bytes: Buffer.from(res.bytes.buffer, res.bytes.byteOffset, res.bytes.byteLength) };
      return out;
    },
    async close() { await Promise.all(ws.map((w) => w.terminate())); },
  };
}

if (!isMainThread && workerData && workerData.role === 'bz2') {
  const dec = new Bz2Decoder();
  parentPort.on('message', ({ id, shared, spans }) => {
    const buf = new Uint8Array(shared);
    // each decoded span is copied into its own ArrayBuffer so it can be transferred, not cloned
    const results = spans.map(([i, [a, b]]) => { const r = decodeSpan(dec, buf, a, b); return [i, r.error ? r : { ...r, bytes: new Uint8Array(r.bytes) }]; });
    parentPort.postMessage({ id, results }, results.filter(([, r]) => !r.error).map(([, r]) => r.bytes.buffer));
  });
}

// ------------------------------------------------------------------------- XML pages
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '-', mdash: ', ', minus: '-', times: 'x', hellip: '...', lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"', middot: ' ', bull: ' ', thinsp: ' ', ensp: ' ', emsp: ' ', deg: ' degrees', frac12: ' 1/2', shy: '' };
/** XML and the common HTML entities. Numeric ones become their code point. */
export function decodeEntities(s) {
  if (s.indexOf('&') === -1) return s;
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, e) => {
    if (e[0] === '#') {
      const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) return ' ';
      if (cp === 0x2014) return ', ';
      if (cp === 0x2013 || cp === 0x2212) return '-';
      if (cp === 0xa0) return ' ';
      return String.fromCodePoint(cp);
    }
    const v = ENT[e];
    return v === undefined ? m : v;
  });
}

/**
 * Streaming page reader. push(text) returns the pages completed by that text; a page split
 * across pushes is carried over whole.
 */
export class PageReader {
  constructor() { this.carry = ''; this.pages = 0; }
  push(text) {
    const s = this.carry ? this.carry + text : text;
    const out = [];
    let at = 0;
    for (;;) {
      const a = s.indexOf('<page>', at);
      if (a === -1) { this.carry = ''; at = s.length; break; }
      const b = s.indexOf('</page>', a);
      if (b === -1) { this.carry = s.slice(a); return out; }
      out.push(parsePage(s.slice(a + 6, b)));
      this.pages++;
      at = b + 7;
    }
    return out;
  }
}

function tagText(s, tag) {
  const a = s.indexOf('<' + tag);
  if (a === -1) return null;
  const gt = s.indexOf('>', a);
  if (gt === -1) return null;
  if (s[gt - 1] === '/') return '';
  const b = s.indexOf('</' + tag + '>', gt);
  return b === -1 ? null : s.slice(gt + 1, b);
}

export function parsePage(s) {
  const title = decodeEntities(tagText(s, 'title') || '');
  const ns = Number(tagText(s, 'ns') || 0);
  const r = s.indexOf('<redirect');
  let redirect = null;
  if (r !== -1) { const m = /<redirect title="([^"]*)"/.exec(s.slice(r, r + 600)); redirect = m ? decodeEntities(m[1]) : ''; }
  // the text of the LAST revision (a pages-articles dump has one)
  const ti = s.lastIndexOf('<text');
  let text = '';
  if (ti !== -1) {
    const gt = s.indexOf('>', ti);
    if (gt !== -1 && s[gt - 1] !== '/') { const e = s.indexOf('</text>', gt); if (e !== -1) text = decodeEntities(s.slice(gt + 1, e)); }
  }
  const idm = /<id>(\d+)<\/id>/.exec(s);
  return { title, ns, redirect, text, id: idm ? Number(idm[1]) : 0 };
}

// ---------------------------------------------------------------------- wikitext
const DROP_TAGS = ['math', 'gallery', 'timeline', 'score', 'syntaxhighlight', 'source', 'pre', 'hiero', 'chem', 'ce', 'imagemap', 'mapframe', 'maplink', 'graph', 'templatedata', 'templatestyles', 'inputbox', 'categorytree', 'section', 'references', 'ref'];
const SKIP_SECTIONS = new Set(['references', 'other websites', 'related pages', 'external links', 'sources', 'notes', 'further reading', 'bibliography', 'gallery', 'see also', 'footnotes', 'citations', 'notes and references', 'references and notes', 'other pages', 'links', 'filmography', 'discography', 'works', 'publications']);
const FILE_NS = /^\s*:?\s*(file|image|media|bild|datei|fichier|imagen|archivo)\s*:/i;
const CAT_NS = /^\s*(category)\s*:/i;
const OTHER_NS = /^\s*:?\s*(wikipedia|wp|template|help|portal|user|talk|special|wikt|wiktionary|commons|s|q|n|b|v|voy|species|meta|mw|w|d|wikisource|wikiquote|wikinews|wikibooks|wikiversity|wikidata|simple|en|[a-z]{2,3}(-[a-z]{2,8})?)\s*:/i;

/** Remove {{...}} with nesting; a few content templates keep their text. */
function stripTemplates(s) {
  if (s.indexOf('{{') === -1) return s;
  let out = '', i = 0;
  while (i < s.length) {
    const a = s.indexOf('{{', i);
    if (a === -1) { out += s.slice(i); break; }
    out += s.slice(i, a);
    // find the matching close
    let depth = 0, j = a;
    while (j < s.length) {
      if (s[j] === '{' && s[j + 1] === '{') { depth++; j += 2; continue; }
      if (s[j] === '}' && s[j + 1] === '}') { depth--; j += 2; if (depth === 0) break; continue; }
      j++;
    }
    if (depth !== 0) { i = s.length; break; } // unclosed: drop the rest of the text
    out += renderTemplate(s.slice(a + 2, j - 2));
    i = j;
  }
  return out;
}

function renderTemplate(inner) {
  const bar = inner.indexOf('|');
  const name = (bar === -1 ? inner : inner.slice(0, bar)).trim().toLowerCase().replace(/_/g, ' ');
  if (bar === -1) {
    if (name === 'circa' || name === 'c.') return 'c.';
    if (name === 'nbsp' || name === '-' || name === 'snd' || name === 'spaced ndash' || name === 'ndash' || name === 'mdash') return ' ';
    return '';
  }
  // args: only the inner templates' text was already stripped when inner is rendered
  const args = splitArgs(stripTemplates(inner.slice(bar + 1)));
  const pos = args.filter((x) => x.indexOf('=') === -1 || /^[^=]*\[\[/.test(x)).map((x) => x.trim());
  if (name === 'convert' || name === 'cvt') return pos.length >= 2 ? pos[0] + ' ' + pos[1] : '';
  if (name === 'lang' || name === 'lang2') return pos[1] || '';
  if (/^lang-[a-z-]+$/.test(name) || name === 'nowrap' || name === 'nobr' || name === 'small' || name === 'smaller' || name === 'big' || name === 'nowiki' || name === 'keep together' || name === 'noitalic' || name === 'transl' || name === 'transliteration' || name === 'linktext' || name === 'sic' || name === 'visible anchor' || name === 'tooltip' || name === 'abbr') return name === 'transl' || name === 'transliteration' ? (pos[1] || pos[0] || '') : (pos[0] || '');
  if (name === 'circa' || name === 'c.') return 'c. ' + (pos[0] || '');
  if (name === 'frac') return pos.join('/');
  if (name === 'ill' || name === 'interlanguage link') return pos[0] || '';
  if (name === 'as of') return 'as of ' + pos.join(' ');
  return '';
}

function splitArgs(s) {
  // split on | at link depth 0
  const out = []; let depth = 0, cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '[' && s[i + 1] === '[') { depth++; cur += '[['; i++; continue; }
    if (c === ']' && s[i + 1] === ']') { depth = Math.max(0, depth - 1); cur += ']]'; i++; continue; }
    if (c === '|' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}

/** Tables: a line starting with {| opens, |} closes, nesting counted. */
function stripTables(s) {
  if (s.indexOf('{|') === -1) return s;
  const lines = s.split('\n'), keep = [];
  let depth = 0;
  for (const line of lines) {
    const t = line.trimStart();
    if (t.startsWith('{|')) { depth++; continue; }
    if (depth > 0) { if (t.startsWith('|}')) depth--; continue; }
    keep.push(line);
  }
  return keep.join('\n');
}

/** [[links]] with nesting: files dropped, categories collected, the rest become their label. */
function stripLinks(s, cats) {
  if (s.indexOf('[[') === -1) return s;
  let out = '', i = 0;
  while (i < s.length) {
    const a = s.indexOf('[[', i);
    if (a === -1) { out += s.slice(i); break; }
    out += s.slice(i, a);
    let depth = 0, j = a;
    while (j < s.length) {
      if (s[j] === '[' && s[j + 1] === '[') { depth++; j += 2; continue; }
      if (s[j] === ']' && s[j + 1] === ']') { depth--; j += 2; if (depth === 0) break; continue; }
      if (s[j] === '\n' && s[j + 1] === '\n' && depth > 0) break; // a link never spans a paragraph
      j++;
    }
    if (depth !== 0) { out += s.slice(a + 2, j); i = j; continue; }
    const inner = s.slice(a + 2, j - 2);
    if (FILE_NS.test(inner)) { i = j; continue; }
    if (CAT_NS.test(inner)) {
      const name = inner.replace(CAT_NS, '').split('|')[0].trim();
      if (name) cats.push(name);
      i = j; continue;
    }
    if (OTHER_NS.test(inner) && !/^\s*:/.test(inner) === false) { /* a leading colon link to a namespace: keep label */ }
    const bar = inner.indexOf('|');
    let label = bar === -1 ? inner : inner.slice(bar + 1);
    if (bar === -1) {
      if (OTHER_NS.test(inner) && !/^\s*:/.test(inner)) { i = j; continue; } // interwiki or interlanguage
      label = inner.replace(/^\s*:/, '').replace(/#.*$/, '');
    }
    out += stripLinks(label, cats);
    i = j;
  }
  return out;
}

const ABBREV = new Set(['mr', 'mrs', 'ms', 'dr', 'st', 'jr', 'sr', 'vs', 'etc', 'e.g', 'i.e', 'eg', 'ie', 'u.s', 'u.k', 'a.m', 'p.m', 'no', 'mt', 'ft', 'gen', 'col', 'lt', 'sgt', 'capt', 'prof', 'inc', 'ltd', 'co', 'corp', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec', 'c', 'ca', 'approx', 'fig', 'vol', 'pp', 'op', 'rev', 'hon', 'gov', 'sen', 'rep', 'pres', 'est', 'b', 'd', 'fl', 'r', 'al', 'ave', 'blvd', 'rd', 'dept', 'univ', 'assn', 'bros', 'cf', 'ed', 'eds', 'lit', 'nos', 'ch', 'sq', 'km', 'mi', 'oz', 'lb', 'lbs', 'm', 'cm', 'mm', 'kg']);

/** Split a paragraph into sentences at . ! ? followed by space and a capital, a digit or a quote. */
export function splitSentences(p) {
  const out = [];
  let start = 0;
  for (let i = 0; i < p.length; i++) {
    const c = p[i];
    if (c !== '.' && c !== '!' && c !== '?') continue;
    let j = i + 1;
    while (j < p.length && (p[j] === '"' || p[j] === "'" || p[j] === ')')) j++;
    if (j < p.length && p[j] !== ' ') continue;
    let k = j; while (k < p.length && p[k] === ' ') k++;
    if (k < p.length && !/[A-Z0-9"'(\u00C0-\u024F]/.test(p[k])) continue;
    if (c === '.') {
      // the word before the period: an abbreviation or an initial does not end a sentence
      let w = i - 1; while (w >= 0 && /[A-Za-z.]/.test(p[w])) w--;
      const word = p.slice(w + 1, i).toLowerCase();
      if (ABBREV.has(word) || /^[a-z]$/.test(word) || /^([a-z]\.)+[a-z]?$/.test(word)) continue;
    }
    const sent = p.slice(start, j).trim();
    if (sent) out.push(sent);
    start = k;
    i = k - 1;
  }
  const tail = p.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

function cleanLine(s) {
  return s
    .replace(/'{2,}/g, '')
    .replace(/\[(?:https?:|ftp:)?\/\/[^\s\]]+\s+([^\]]*)\]/g, '$1')
    .replace(/\[(?:https?:|ftp:)?\/\/[^\s\]]+\]/g, '')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .replace(/__[A-Z]+__/g, '')
    .replace(/\(\s*[,;:]?\s*\)/g, '')
    .replace(/\(\s*[,;]\s*/g, '(')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Wikitext to sections of plain sentences.
 * @param {string} src
 * @returns {{ sections: Array<{heading: string, level: number, sentences: string[]}>, categories: string[] }}
 */
export function stripWikitext(src) {
  let s = src.replace(/<!--[\s\S]*?(-->|$)/g, '');
  for (const tag of DROP_TAGS) {
    if (s.indexOf('<' + tag) === -1 && s.indexOf('<' + tag.toUpperCase()) === -1) continue;
    s = s.replace(new RegExp('<' + tag + '\\b[^>]*/>', 'gi'), '');
    s = s.replace(new RegExp('<' + tag + '\\b[^>]*>[\\s\\S]*?</' + tag + '\\s*>', 'gi'), '');
  }
  s = stripTemplates(s);
  s = stripTables(s);
  const cats = [];
  s = stripLinks(s, cats);
  s = decodeEntities(s);
  const sections = [{ heading: '', level: 1, sentences: [] }];
  let para = [];
  const flush = () => {
    if (!para.length) return;
    const text = cleanLine(para.join(' '));
    para = [];
    if (!text) return;
    const sec = sections[sections.length - 1];
    for (const sent of splitSentences(text)) if (isSentence(sent)) sec.sentences.push(sent);
  };
  for (const raw of s.split('\n')) {
    const line = raw.trim();
    const h = /^(={2,6})\s*(.*?)\s*\1\s*$/.exec(line);
    if (h) { flush(); sections.push({ heading: cleanLine(h[2]), level: h[1].length, sentences: [] }); continue; }
    if (!line) { flush(); continue; }
    if (/^[*#:;|!{}]/.test(line) || /^-{4,}/.test(line)) { flush(); continue; }
    para.push(line);
  }
  flush();
  const kept = sections.filter((x, i) => i === 0 || !SKIP_SECTIONS.has(x.heading.toLowerCase()));
  return { sections: kept, categories: cats };
}

function isSentence(s) {
  if (s.length < 12 || s.length > 1200) return false;
  if (!/[a-zA-Z]{2}/.test(s)) return false;
  const words = s.split(' ').length;
  if (words < 3) return false;
  if (/^[^A-Za-z0-9"'(\u00C0-\u024F]/.test(s)) return false;
  return true;
}

// -------------------------------------------------------------------------- ingest
/**
 * Stream a dump into a knowledge store.
 * @param {object} o { dump, store, limit, workers, heldout: { seed, every }, leadMax, sectionMax, log }
 * @returns {Promise<object>} the measured stats of the run
 */
export async function ingest(o = {}) {
  const dump = o.dump ?? DUMP_PATH;
  const store = o.store ?? STORE_DIR;
  const limit = Number.isFinite(o.limit) && o.limit > 0 ? o.limit : Infinity;
  // loaded here, not at the top, so a decode worker never loads the hypervector modules
  const { KnowledgeWriter, heldAnswer, HELDOUT_DEFAULTS, heldMark } = await import('../memory/knowledge.mjs');
  const held = { ...HELDOUT_DEFAULTS, ...(o.heldout || {}) };
  const log = o.log ?? (() => {});
  const t0 = process.hrtime.bigint();
  const writer = new KnowledgeWriter(store, { leadMax: o.leadMax, sectionMax: o.sectionMax, source: o.source ?? path.basename(dump) });
  const reader = new PageReader();
  const td = new TextDecoder('utf-8');
  const counts = { pages: 0, ns0: 0, redirects: 0, articles: 0, held: 0, empty: 0, heldout: 0, heldoutIneligible: 0 };
  let stopped = false, lastLog = Date.now();
  const onText = (text) => {
    for (const pg of reader.push(text)) {
      counts.pages++;
      if (pg.ns !== 0) continue;
      counts.ns0++;
      if (pg.redirect !== null) { counts.redirects++; continue; }
      if (counts.articles >= limit) { stopped = true; return false; }
      counts.articles++;
      const doc = stripWikitext(pg.text);
      // the held-out rule: a seeded mark on the title; a marked article whose first sentence has
      // a key noun phrase has that sentence hidden from the ingest and written to heldout.jsonl
      let hide = null;
      const lead = doc.sections[0].sentences;
      if (lead.length && heldMark(pg.title, held)) {
        const kp = heldAnswer(pg.title, lead[0]);
        if (kp) { hide = { title: pg.title, sentence: lead[0], np: kp.np, head: kp.head }; counts.heldout++; }
        else counts.heldoutIneligible++;
      }
      const r = writer.addArticle({ title: pg.title, pageId: pg.id, sections: doc.sections, categories: doc.categories, hide });
      if (r.facts > 0) counts.held++; else counts.empty++;
      if (Date.now() - lastLog > 10000) { lastLog = Date.now(); log(`  ${counts.articles} articles, ${counts.held} held, ${writer.stats.facts} facts, ${(Number(process.hrtime.bigint() - t0) / 1e9).toFixed(0)} s`); }
    }
    return true;
  };
  let bz = null;
  if (/\.bz2$/i.test(dump)) {
    bz = await bz2File(dump, (bytes) => onText(td.decode(bytes, { stream: true })), { workers: o.workers ?? 1, windowMB: o.windowMB });
  } else {
    const fd = fs.openSync(dump, 'r');
    try {
      const b = Buffer.allocUnsafe(1 << 22);
      let pos = 0, r;
      while ((r = fs.readSync(fd, b, 0, b.length, pos)) > 0) { pos += r; if (onText(td.decode(b.subarray(0, r), { stream: true })) === false) break; }
    } finally { fs.closeSync(fd); }
  }
  if (!stopped) onText(td.decode());
  const tIngest = Number(process.hrtime.bigint() - t0) / 1e9;
  const fin = writer.finish({ counts, complete: !stopped && limit === Infinity, heldout: held });
  const seconds = Number(process.hrtime.bigint() - t0) / 1e9;
  return { dump, store, limit: limit === Infinity ? null : limit, complete: !stopped && limit === Infinity, stoppedAtLimit: stopped, counts, bz2: bz, ingestSeconds: tIngest, seconds, ...fin };
}

// -------------------------------------------------------------------------- download
/** Fetch the dump over https into bench/fixtures/wiki/, hashing as it lands. */
export function download(url = DUMP_URL, dest = DUMP_PATH) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  return new Promise((resolve, reject) => {
    const get = (u, hops) => https.get(u, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && hops < 5) { res.resume(); return get(new URL(res.headers.location, u).href, hops + 1); }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('download: HTTP ' + res.statusCode)); }
      const h = crypto.createHash('sha256'), tmp = dest + '.part', f = fs.createWriteStream(tmp);
      let bytes = 0;
      res.on('data', (c) => { h.update(c); bytes += c.length; });
      res.pipe(f);
      f.on('finish', () => { fs.renameSync(tmp, dest); resolve({ url: u, bytes, sha256: h.digest('hex') }); });
      f.on('error', reject);
    }).on('error', reject);
    get(url, 0);
  });
}

// -------------------------------------------------------------------------------- cli
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i === -1 ? def : process.argv[i + 1]; }

if (isMainThread && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--download')) {
    const r = await download(arg('url', DUMP_URL), arg('dump', DUMP_PATH));
    console.log(`downloaded ${r.url}: ${r.bytes} bytes, sha256 ${r.sha256}`);
  } else {
    const limit = arg('limit', null) === null ? Infinity : Number(arg('limit'));
    const workers = Number(arg('workers', 4));
    const r = await ingest({ dump: arg('dump', DUMP_PATH), store: arg('store', STORE_DIR), limit, workers, log: (s) => console.log(s) });
    console.log(`articles in the dump read ${r.counts.articles}${r.complete ? ' (whole dump)' : ' (stopped at --limit)'}, held ${r.counts.held}, breadth ${(r.counts.held / r.counts.articles).toFixed(4)}`);
    console.log(`rate ${(r.counts.articles / r.seconds).toFixed(1)} articles/s over ${r.seconds.toFixed(1)} s; ${r.disk.bytesPerArticle.toFixed(0)} disk bytes/article; ${r.memory.bytesPerArticle.toFixed(0)} memory bytes/article`);
    console.log(`facts ${r.facts}, title items ${r.titles}, held out ${r.counts.heldout}`);
  }
}
