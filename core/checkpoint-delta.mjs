// core/checkpoint-delta.mjs: DELTA CHECKPOINTS (Board 12, item delta; his P5 "self compressing").
//
// A container 2 checkpoint (core/persist.mjs writeCheckpoint) writes the WHOLE organism every time.
// MEASURED on 60 s of the daemon's 12 major organism (a checkpoint every 1000 ticks, 16 of them):
// the file grows from 526656 bytes at t=0 to 11054800 at t=14429 and the run writes 111947896
// bytes, while between two checkpoints only a slice of it changes: about 2600 hypervectors the
// chain has never held, the substrate's dynamic arrays, and a third of the skeleton's numbers.
//
// A CHAIN is one full checkpoint followed by deltas, each holding only what changed since the
// checkpoint before it, and after `fullEvery` deltas (default 20) the next checkpoint is a full
// one again and the old chain is deleted. On disk, next to the organism's snapshot.json:
//
//   snapshot.json               the HEAD: magic "BRAINCKH", H, CRC32 of the header, a JSON header
//                               naming the chain, its files in order (size, CRC32 of the whole
//                               file, SHA-1 of the skeleton text each link rebuilds) and the ruler
//   chain/<id>.full.ck2         the full checkpoint: a plain container 2 file, readable alone
//   chain/<id>.d<seq>.ckd       a delta: magic "BRAINCKD", the same prefix and header layout as a
//                               container 2 file, sections each with its own CRC32:
//     slots     deflated slot records for the payload strings the chain has not held (the
//               records of container 2, plus S_WORDS below); a string held anywhere in the chain
//               keeps its slot number, so the skeleton refers to it as it did
//     patch     the skeleton text of this checkpoint against the one before it: zstd with the old
//               text as its dictionary ("zstd-dict", Node 23.8 or later), or, without zstd or with
//               the policy's zstd off, deflated ops ("cdc": COPY a run of the old text, or a
//               LITERAL piece deflated with the old text it replaces as its dictionary; content
//               defined chunks find the unchanged runs) with the literal pieces in a
//     lits      section of their own, back to back
//     bytes     deflated: the new payloads with no better coding
//     words     S_WORDS payloads: a payload of 4 byte words (3072 bytes or more) whose path held one
//               of the same length at the checkpoint before, coded as a mask of the words that
//               changed (or were nonzero) plus their values, their XOR, or their arithmetic
//               difference, as one run or four byte planes, whichever deflates smallest
//     hv.*      the vectors the chain has not held: bipolar ones coded against ANY earlier vector
//               of the chain (core/pack.mjs xorRefEncode, references proposed by HammingLsh),
//               ternary ones as two bit lanes
//
// Writing is atomic link by link: the chain file goes to a temp file renamed into place, then the
// head is rewritten the same way, so a crash between the two leaves the previous head, which
// names only files that are complete. Old chain files are deleted only AFTER a new full
// checkpoint's head is on disk, so the last good full is never lost to a failed write.
//
// Reading (core/persist.mjs readJSONStreamed, readCheckpoint, and so Brain.restore) replays the
// full and every delta in order. Every file is checked against the head (size, CRC32) and every
// section against its own CRC32 before anything in it is decoded, every link's rebuilt skeleton
// against the SHA-1 its writer recorded, and with `digest` on, the final document against the
// SHA-1 of the document the writer was handed. A delta that fails any check is REFUSED by name:
// the read throws, and readChain(file, { lastGood: true }) instead returns the state of the last
// link that verified, with the full it started from untouched on disk.
//
// Turned on per directory (setDeltaPolicy), or for every checkpoint of the process by the
// environment variable BRAIN_CHECKPOINT_DELTA or the flag --checkpoint-delta, each taking N, the
// deltas between two full checkpoints ("on" is 20, "off" or 0 is off). Off by default.
//
// A writer holds the chain's registries in memory (every slot's digest, every vector, the last
// skeleton text). A process that finds a chain head on disk it did not write (a restart, another
// writer) starts a new chain with a full checkpoint rather than trusting a chain it cannot see.
import { openSync, writeSync, closeSync, renameSync, unlinkSync, existsSync, readdirSync, mkdirSync, readSync, fstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import zlib, { deflateRawSync, inflateRawSync } from 'node:zlib';
import { crc32, packBipolarBits, packTernaryBits, bipolarBytes, ternaryBytes, xorRefEncode, xorRefDecode, HammingLsh } from './pack.mjs';
import { CHECKPOINT_INTERNALS } from './persist.mjs';

export const HEAD_MAGIC = 'BRAINCKH';
export const DELTA_MAGIC = 'BRAINCKD';
export const DEFAULT_FULL_EVERY = 20;
export const CHAIN_DIR = 'chain';
const PRE = 16;
const S_WORDS = 6;                  // a slot record type container 2 does not have: a payload of 4 byte words, coded (below)
const WORDS_MIN_BYTES = 3072;       // a payload smaller than this is left to the shared bytes section
const SPARSE_MIN_CHARS = 4096;      // the base64 length past which a payload's path is remembered for the next delta
const SEP = '\u0001';               // joins a path's keys (no key the snapshot writes contains it)
const LSH_WINDOW = 32;              // new vectors also tried against the ones just before them
const LIT_PIECE = 16384;            // a literal run is deflated in pieces of this many bytes
const DICT_PAD = 4096;              // old text either side of a piece's matching region, as dictionary
const I = () => CHECKPOINT_INTERNALS; // read at call time: the import is circular

// ---------------------------------------------------------------- the policy
const POLICIES = new Map();          // resolved directory -> { fullEvery, digest }
const STATES = new Map();            // resolved head file -> the writer's chain state

function checkEvery(n, what) {
  if (!Number.isInteger(n) || n < 1) throw new RangeError(what + ': a full checkpoint every N deltas needs an integer N >= 1, got ' + n);
  return n;
}
/**
 * Write every checkpoint into `dir` as a delta chain.
 * @param {string} dir the directory holding snapshot.json
 * @param {object} [opts] { fullEvery: deltas between two full checkpoints (default 20),
 *   digest: record the SHA-1 of every document written and check it on every read (costs one
 *   serialization of the document per checkpoint), zstd: false codes the skeleton patch with the
 *   content defined chunk coder even where Node has zstd }
 */
export function setDeltaPolicy(dir, { fullEvery = DEFAULT_FULL_EVERY, digest = false, zstd = true } = {}) {
  POLICIES.set(path.resolve(dir), { fullEvery: checkEvery(fullEvery, 'setDeltaPolicy'), digest: !!digest, zstd: zstd !== false });
}
/** Back to plain container 2 checkpoints in `dir`, and forget any chain state written there. */
export function clearDeltaPolicy(dir) {
  const d = path.resolve(dir);
  POLICIES.delete(d);
  for (const k of [...STATES.keys()]) if (path.dirname(k) === d) STATES.delete(k);
}
/** The policy set on `dir` by setDeltaPolicy, or null. */
export function deltaPolicy(dir) { return POLICIES.get(path.resolve(dir)) || null; }
/** The policy for a checkpoint file: its directory's, else the process wide flag, else null (off). */
export function deltaPolicyFor(file) {
  return POLICIES.get(path.resolve(path.dirname(file))) || processPolicy();
}
function processPolicy() {
  let v = process.env.BRAIN_CHECKPOINT_DELTA;
  let from = 'BRAIN_CHECKPOINT_DELTA';
  if (v === undefined || v === '') {
    v = null; from = '--checkpoint-delta';
    const a = process.argv;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === '--checkpoint-delta') { v = a[i + 1] !== undefined && /^[0-9]+$/.test(a[i + 1]) ? a[i + 1] : 'on'; break; }
      if (String(a[i]).startsWith('--checkpoint-delta=')) { v = String(a[i]).slice('--checkpoint-delta='.length); break; }
    }
    if (v === null) return null;
  }
  const s = String(v).trim().toLowerCase();
  if (s === 'off' || s === '0' || s === 'false' || s === 'no') return null;
  if (s === 'on' || s === 'true' || s === 'yes' || s === '') return { fullEvery: DEFAULT_FULL_EVERY, digest: false };
  return { fullEvery: checkEvery(Number(s), from), digest: false };
}

// ---------------------------------------------------------------- small pieces
const sha1 = (b) => createHash('sha1').update(b).digest('hex');
// a slot's identity: the string itself when short, else its SHA-1 (the two can never collide: 's' or 'h' first)
function slotKey(s) { return s.length < 96 ? 's' + s : 'h' + createHash('sha1').update(s, 'latin1').digest('base64'); }
function bitsKey(b) { return createHash('sha1').update(b).digest('base64'); }
function varints(nums) { return I().recordOf(nums); }
const popcnt32 = (x) => { x = x - ((x >>> 1) & 0x55555555); x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; };

// a store of fixed size vectors that grows, kept 4 byte aligned so distances run on 32 bit words
class GrowStore {
  constructor(per, cap = 256) { this.per = per; this.count = 0; this.ab = new ArrayBuffer(per * Math.max(1, cap)); this.u8 = new Uint8Array(this.ab); this.u32 = per % 4 === 0 ? new Uint32Array(this.ab) : null; }
  static from(buf, per, count) { const g = new GrowStore(per, Math.max(count, 64)); g.u8.set(buf.subarray(0, per * count)); g.count = count; return g; }
  room(n) {
    if (n * this.per <= this.ab.byteLength) return;
    let cap = this.ab.byteLength / this.per; while (cap < n) cap *= 2;
    const ab = new ArrayBuffer(cap * this.per), u8 = new Uint8Array(ab);
    u8.set(this.u8.subarray(0, this.count * this.per));
    this.ab = ab; this.u8 = u8; this.u32 = this.per % 4 === 0 ? new Uint32Array(ab) : null;
  }
  push(bytes) { this.room(this.count + 1); this.u8.set(bytes.subarray(0, this.per), this.count * this.per); return this.count++; }
  append(buf, count) { this.room(this.count + count); this.u8.set(buf.subarray(0, count * this.per), this.count * this.per); this.count += count; }
  at(i) { return Buffer.from(this.ab, i * this.per, this.per); }
  hamming(i, j) {
    let h = 0;
    if (this.u32) { const W = this.per >>> 2, a = i * W, b = j * W, u = this.u32; for (let q = 0; q < W; q++) h += popcnt32(u[a + q] ^ u[b + q]); }
    else { const a = i * this.per, b = j * this.per, u = this.u8; for (let q = 0; q < this.per; q++) h += popcnt32(u[a + q] ^ u[b + q]); }
    return h;
  }
}

// ---------------------------------------------------------------- content defined chunks of text
// A gear hash over the bytes: a cut where its top 8 bits are zero (a chunk of about 320 bytes
// past its 64 byte minimum), and never a chunk past 4096. A cut depends only on the 32 bytes
// before it, so an edit moves the cuts near it and none elsewhere.
const GEAR = (() => { const g = new Uint32Array(256); let s = 0x9E3779B9; for (let i = 0; i < 256; i++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; g[i] = s; } return g; })();
const CDC_MIN = 64, CDC_MAX = 4096;
function cdcCuts(buf) {
  const cuts = [];
  let start = 0, h = 0;
  for (let i = 0; i < buf.length; i++) {
    h = ((h << 1) + GEAR[buf[i]]) >>> 0;
    const len = i + 1 - start;
    if ((len >= CDC_MIN && (h >>> 24) === 0) || len >= CDC_MAX) { cuts.push(i + 1); start = i + 1; h = 0; }
  }
  if (start < buf.length) cuts.push(buf.length);
  return cuts;
}
/**
 * The ops that turn `old` into `neu`: [0, at, len] copies old[at, at + len); [1, len, dictAt,
 * dictLen, stored] is a literal piece of len bytes, deflated with old[dictAt, dictAt + dictLen) as
 * its dictionary and stored in `lits`.
 * @returns {{ ops: Buffer, lits: Buffer, copied: number, literal: number, pieces: number }}
 */
export function diffText(old, neu) {
  const index = new Map();
  let s = 0;
  for (const e of cdcCuts(old)) { const key = crc32(old.subarray(s, e)) * 8192 + (e - s); if (!index.has(key)) index.set(key, s); s = e; }
  const runs = []; // { copy: true, at, len } | { copy: false, from, to }
  s = 0;
  for (const e of cdcCuts(neu)) {
    const len = e - s, key = crc32(neu.subarray(s, e)) * 8192 + len, at = index.get(key);
    const same = at !== undefined && old.compare(neu, s, e, at, at + len) === 0;
    const last = runs[runs.length - 1];
    if (same) {
      if (last && last.copy && last.at + last.len === at) last.len += len;
      else runs.push({ copy: true, at, len });
    } else if (last && !last.copy) last.to = e;
    else runs.push({ copy: false, from: s, to: e });
    s = e;
  }
  const ops = [], lits = [];
  let litBytes = 0, copied = 0, literal = 0, pieces = 0;
  for (let r = 0; r < runs.length; r++) {
    const run = runs[r];
    if (run.copy) { ops.push(varints([0, run.at, run.len])); copied += run.len; continue; }
    // the old text this literal replaced: between the copies either side of it
    const prev = r > 0 ? runs[r - 1] : null, next = r + 1 < runs.length ? runs[r + 1] : null;
    let rs = prev ? prev.at + prev.len : 0, re = next ? next.at : old.length;
    if (re <= rs) { rs = Math.min(rs, old.length); re = Math.min(old.length, rs + (run.to - run.from)); }
    const litLen = run.to - run.from, regLen = re - rs;
    for (let p = 0; p < litLen; p += LIT_PIECE) {
      const n = Math.min(LIT_PIECE, litLen - p);
      const c = rs + Math.floor(regLen * (p / litLen));
      const da = Math.max(0, c - DICT_PAD), db = Math.min(old.length, c + n + DICT_PAD);
      const piece = neu.subarray(run.from + p, run.from + p + n);
      const d = db > da ? deflateRawSync(piece, { level: 6, dictionary: old.subarray(da, db) }) : deflateRawSync(piece, { level: 6 });
      ops.push(varints([1, n, da, db - da, d.length]));
      lits.push(d); litBytes += d.length; pieces++;
    }
    literal += litLen;
  }
  return { ops: Buffer.concat(ops), lits: Buffer.concat(lits, litBytes), copied, literal, pieces };
}
/** The inverse of diffText: `old` and the ops and literals back into the new text. */
export function patchText(old, ops, lits, expectBytes = null) {
  const { readVarint } = I();
  const parts = [];
  let i = 0, lp = 0, total = 0;
  const next = () => { if (i >= ops.length) throw new Error('skeleton patch: the ops end inside an op'); const [v, j] = readVarint(ops, i); i = j; return v; };
  while (i < ops.length) {
    const kind = next();
    if (kind === 0) {
      const at = next(), len = next();
      if (at + len > old.length) throw new Error('skeleton patch: a copy of ' + len + ' bytes at ' + at + ' runs past the old text of ' + old.length);
      parts.push(old.subarray(at, at + len)); total += len;
    } else if (kind === 1) {
      const n = next(), da = next(), dl = next(), stored = next();
      if (lp + stored > lits.length || da + dl > old.length) throw new Error('skeleton patch: a literal runs past its section or its dictionary past the old text');
      const src = lits.subarray(lp, lp + stored); lp += stored;
      const piece = dl > 0 ? inflateRawSync(src, { dictionary: old.subarray(da, da + dl) }) : inflateRawSync(src);
      if (piece.length !== n) throw new Error('skeleton patch: a literal inflates to ' + piece.length + ' bytes, the op says ' + n);
      parts.push(piece); total += n;
    } else throw new Error('skeleton patch: unknown op ' + kind);
  }
  if (lp !== lits.length) throw new Error('skeleton patch: ' + (lits.length - lp) + ' literal bytes left over');
  if (expectBytes !== null && total !== expectBytes) throw new Error('skeleton patch: the text rebuilds to ' + total + ' bytes, the header says ' + expectBytes);
  return Buffer.concat(parts, total);
}

// ---------------------------------------------------------------- the files: prefix, header, sections
// Both chain file kinds share the container 2 layout: magic (8), H (uint32), CRC32 of the header
// (uint32), the header padded to an 8 aligned body, the sections 8 aligned in the body. The header
// states the file's own size, written with placeholders first so its length cannot move under it.
function writeContainer(file, magic, head, sections, sizeFields) {
  let off = 0;
  for (const s of sections) { s.offset = off; s.bytes = s.stored.length; s.crc32 = crc32(s.stored); off += s.bytes; off += (8 - (off % 8)) % 8; }
  const bodyLen = off;
  head.sections = sections.length ? sections.map(({ stored, ...rest }) => rest) : undefined;
  const PLACE = 999999999999999.9;
  const placeLen = Buffer.byteLength(JSON.stringify(sizeFields(head, PLACE, PLACE)), 'utf8');
  const H = placeLen + ((8 - ((PRE + placeLen) % 8)) % 8);
  const total = PRE + H + bodyLen;
  const text = JSON.stringify(sizeFields(head, total, PRE + H));
  const hb = Buffer.alloc(H, 0x20);
  if (hb.write(text, 0, 'utf8') !== Buffer.byteLength(text, 'utf8')) throw new Error('chain file ' + file + ': the header outgrew its placeholder');
  const pre = Buffer.alloc(PRE);
  pre.write(magic, 0, 'latin1'); pre.writeUInt32LE(H, 8); pre.writeUInt32LE(crc32(hb), 12);
  const whole = Buffer.alloc(total);
  pre.copy(whole, 0); hb.copy(whole, PRE);
  for (const s of sections) s.stored.copy(whole, PRE + H + s.offset);
  const tmp = file + '.tmp';
  const fd = openSync(tmp, 'w');
  try { writeSync(fd, whole); closeSync(fd); }
  catch (e) { try { closeSync(fd); } catch {} try { if (existsSync(tmp)) unlinkSync(tmp); } catch {} throw e; }
  renameSync(tmp, file);
  return { bytes: total, crc32: crc32(whole), header: JSON.parse(text) };
}
function readContainerHeader(buf, magic, format, file) {
  if (!buf || buf.length < PRE || buf.toString('latin1', 0, 8) !== magic) throw new Error('chain file ' + file + ': no ' + magic + ' magic');
  const H = buf.readUInt32LE(8);
  if (PRE + H > buf.length) throw new Error('chain file ' + file + ': the header claims ' + H + ' bytes and the file holds ' + (buf.length - PRE) + ' after the prefix');
  const hb = buf.subarray(PRE, PRE + H);
  const want = buf.readUInt32LE(12), got = crc32(hb);
  if (want !== got) throw new Error('chain file ' + file + ': the header fails its checksum (stored crc32 ' + want.toString(16) + ', computed ' + got.toString(16) + '); refusing it');
  const header = JSON.parse(hb.toString('utf8'));
  if (header.format !== format || header.version !== 1) throw new Error('chain file ' + file + ': format ' + header.format + ' version ' + header.version + ' is not ' + format + ' version 1');
  return { header, bodyAt: PRE + H };
}
function sectionsOf(buf, header, bodyAt, file) {
  const got = {};
  for (const s of header.sections || []) {
    const at = bodyAt + s.offset;
    if (at + s.bytes > buf.length) throw new Error('chain file ' + file + ': section ' + s.name + ' runs past the end of the file');
    const stored = buf.subarray(at, at + s.bytes), c = crc32(stored);
    if (c !== (s.crc32 >>> 0)) throw new Error('chain file ' + file + ': section ' + s.name + ' fails its checksum (stored crc32 ' + (s.crc32 >>> 0).toString(16) + ', computed ' + c.toString(16) + '); refusing it');
    got[s.name] = { s, stored };
  }
  return got;
}

/** true when the bytes start with the chain head magic */
export function isChainHead(buf) { return !!buf && buf.length >= PRE && buf.toString('latin1', 0, 8) === HEAD_MAGIC; }
/** The head's header, its checksum checked (the head has no body). */
export function readChainHeaderBuffer(buf, file = 'snapshot.json') { return readContainerHeader(buf, HEAD_MAGIC, 'brain.checkpoint.chain', file).header; }
function readHeadFile(file) {
  let fd;
  try { fd = openSync(file, 'r'); } catch { return null; }
  try {
    const pre = Buffer.alloc(PRE);
    if (readSync(fd, pre, 0, PRE, 0) < PRE || !isChainHead(pre)) return null;
    const H = pre.readUInt32LE(8), both = Buffer.alloc(PRE + H);
    pre.copy(both);
    if (readSync(fd, both, PRE, H, PRE) < H) return null;
    return readChainHeaderBuffer(both, file);
  } catch { return null; } finally { closeSync(fd); }
}

// ---------------------------------------------------------------- writing
let chainCounter = 0;
function newChainId() { return 'c' + Date.now().toString(36) + '-' + process.pid.toString(36) + '-' + (chainCounter++).toString(36); }
function docShape(doc) {
  return {
    doc: doc.version ?? null, name: doc.name ?? null,
    t: doc.clock && Number.isFinite(doc.clock.t) ? doc.clock.t : null,
    cells: Array.isArray(doc.cells) ? doc.cells.length : null,
    edges: doc.connectome && Number.isFinite(doc.connectome.n) ? doc.connectome.n : null,
  };
}
function docDigest(doc) { const h = createHash('sha1'); I().emit(doc, (s) => h.update(s), 0); return h.digest('hex'); }
function textOf(doc, table) {
  const bufs = []; let parts = [], size = 0;
  const flush = () => { if (parts.length) { bufs.push(Buffer.from(parts.join(''), 'utf8')); parts = []; size = 0; } };
  I().walkInterned(doc, (s) => { parts.push(s); size += s.length; if (size >= (1 << 24)) flush(); }, table, []);
  flush();
  return bufs.length === 1 ? bufs[0] : Buffer.concat(bufs);
}

/**
 * Write one checkpoint of a chain: a full one when the chain is new, unknown, or `fullEvery`
 * deltas long, else a delta. Called by core/persist.mjs writeCheckpoint under a policy.
 * @returns {{ file: string, bytes: number, header: object }} header is the chain head's: `bytes` is
 *   what this checkpoint wrote (its chain file plus the head), chainBytes what a restore reads
 */
export function writeChain(file, doc, { ruler = null, hv = 'xor-rice', policy }) {
  const headFile = path.resolve(file);
  let st = STATES.get(headFile) || null;
  if (st) { const h = readHeadFile(headFile); if (!h || h.chain !== st.id || h.seq !== st.seq) st = null; }
  const full = !st || st.seq >= policy.fullEvery;
  try {
    return full ? writeFull(headFile, doc, { ruler, hv, policy }) : writeDelta(st, doc, { ruler, policy });
  } catch (e) {
    STATES.delete(headFile); // a failed link leaves no half registered state: the next checkpoint is a full one
    throw e;
  }
}

function writeFull(headFile, doc, { ruler, hv, policy }) {
  const X = I();
  const dir = path.dirname(headFile), cdir = path.join(dir, CHAIN_DIR);
  mkdirSync(cdir, { recursive: true });
  const id = newChainId(), rel = CHAIN_DIR + '/' + id + '.full.ck2', abs = path.join(dir, rel);
  const table = new X.SlotTable();
  const paths = new Map();
  // which slots hold vectors (a vector is never coded sparse, so its path is not remembered)
  const vec = new Set(), VEC = new Set([X.S_BIPOLAR, X.S_PACKED, X.S_TERNARY]);
  const tracked = {
    add(v, stack) {
      const before = table.count, i = table.add(v);
      if (i >= before) { const p = table.recs.parts; if (VEC.has(p[p.length - 1][0])) vec.add(i); }
      if (stack && v.length >= SPARSE_MIN_CHARS && !vec.has(i)) paths.set(stack.join(SEP), { gid: i, str: v });
      return i;
    },
  };
  X.registerColumns(doc, table);
  const skel = X.skeletonOf(doc, tracked, { stack: [], keep: true });
  const res = X.assembleCheckpoint(abs, doc, table, skel, { ruler, hv, extra: { id, seq: 0, kind: 'full' } });
  const whole = X.readAll(abs, 1 << 30);
  // the chain's registries, seeded from exactly what the full file holds
  const st = { id, seq: 0, headFile, dir, fullEvery: policy.fullEvery, digest: policy.digest, slots: new Map(), slotCount: table.count, vecSlots: vec, groups: new Map(), nextGroup: 2, text: skel.text, textSha1: sha1(skel.text), paths, files: [] };
  for (const [s, i] of table.map) st.slots.set(slotKey(s), i);
  for (const g of table.groups) {
    const G = chainGroup(st, g.kind, g.lanes, g.id);
    const store = g.store.buffer();
    for (let i = 0; i < g.count; i++) { const b = store.subarray(i * g.per, (i + 1) * g.per); G.store.push(b); G.index.set(bitsKey(b), i); if (G.lsh) G.lsh.add(i, b); }
  }
  const entry = { file: rel, kind: 'full', seq: 0, t: res.header.t, bytes: whole.length, crc32: crc32(whole), textSha1: st.textSha1, ...(policy.digest ? { docSha1: docDigest(doc) } : {}) };
  st.files = [entry];
  const out = writeHead(st, doc, { ruler, wrote: entry, kind: 'full' });
  STATES.set(headFile, st);
  // only now, with the new full's head on disk, does anything of an older chain go
  const keep = new Set(st.files.map((f) => path.basename(f.file)));
  for (const f of readdirSync(cdir)) if (/^c[0-9a-z-]+\.(full\.ck2|d[0-9]+\.ckd)(\.tmp)?$/.test(f) && !keep.has(f)) { try { unlinkSync(path.join(cdir, f)); } catch { /* raced, next full retries */ } }
  return out;
}

function chainGroup(st, kind, lanes, id = null) {
  const key = kind + lanes;
  let G = st.groups.get(key);
  if (!G) {
    const per = kind === 'bipolar' ? bipolarBytes(lanes) : ternaryBytes(lanes);
    G = { id: id ?? st.nextGroup, kind, lanes, per, store: new GrowStore(per), index: new Map(), lsh: kind === 'bipolar' ? new HammingLsh(lanes) : null };
    st.nextGroup = Math.max(st.nextGroup, G.id + 1);
    st.groups.set(key, G);
  }
  return G;
}

// the payloads of one delta: every string the chain has not held gets a slot record here
class DeltaTable {
  constructor(st) {
    this.st = st; this.X = I();
    this.base = st.slotCount; this.recs = new this.X.Parts(); this.bytes = new this.X.Parts(); this.sparse = new this.X.Parts();
    this.paths = new Map(); this.fresh = new Map(); // group key -> { G, base, refs: [] }
    this.census = { held: 0, raw: 0, b64: 0, bipolar: 0, packed: 0, ternary: 0, sparse: 0, sparseBytes: 0, sparseRaw: 0, vectorsNew: 0, vectorsHeld: 0 };
    this.keys = createHash('sha1'); // the keys of the new slots in order: the reader proves it decoded these strings
    this.isVec = false;
  }
  add(v, stack) {
    const key = slotKey(v);
    let gid = this.st.slots.get(key);
    if (gid === undefined) {
      gid = this.st.slotCount++;
      this.st.slots.set(key, gid);
      this.isVec = false;
      this.recs.push(this.encode(v, stack));
      if (this.isVec) this.st.vecSlots.add(gid);
      this.keys.update(key); this.keys.update('\n');
    } else this.census.held++;
    if (stack && v.length >= SPARSE_MIN_CHARS && !this.st.vecSlots.has(gid)) this.paths.set(stack.join(SEP), { gid, str: v });
    return gid;
  }
  vector(G, bits) {
    const key = bitsKey(bits);
    const had = G.index.get(key);
    if (had !== undefined) { this.census.vectorsHeld++; return had; }
    let f = this.fresh.get(G.kind + G.lanes);
    if (!f) { f = { G, base: G.store.count, refs: [] }; this.fresh.set(G.kind + G.lanes, f); }
    const idx = G.store.push(bits);
    G.index.set(key, idx);
    if (G.lsh) {
      // the nearest earlier vector the index proposes, or one of the few just before this one
      let best = -1, bh = G.lanes + 1;
      const tryRef = (j) => { const h = G.store.hamming(idx, j); if (h < bh || (h === bh && j > best)) { bh = h; best = j; } };
      for (const j of G.lsh.candidates(bits)) if (j < idx) tryRef(j);
      for (let j = idx - 1; j >= Math.max(0, idx - LSH_WINDOW); j--) tryRef(j);
      f.refs.push(best);
      G.lsh.add(idx, bits);
    }
    this.census.vectorsNew++;
    return idx;
  }
  encode(s, stack) {
    const X = this.X;
    const colon = s.indexOf(':');
    if (colon > 0) {
      if (X.PACKED_PREFIX_RE.test(s.slice(0, colon + 1))) {
        const lanes = Number(s.slice(1, colon));
        const bytes = Number.isSafeInteger(lanes) ? X.canonicalBytes(s.slice(colon + 1)) : null;
        if (bytes && bytes.length === bipolarBytes(lanes)) {
          this.census.packed++; this.isVec = true;
          const G = chainGroup(this.st, 'bipolar', lanes);
          return X.recordOf([X.S_PACKED, G.id, this.vector(G, bytes)]);
        }
      }
    } else if (colon < 0) {
      const bytes = X.canonicalBytes(s);
      if (bytes) {
        if (X.allBipolar(bytes)) {
          this.census.bipolar++; this.isVec = true;
          const G = chainGroup(this.st, 'bipolar', bytes.length);
          return X.recordOf([X.S_BIPOLAR, G.id, this.vector(G, packBipolarBits(bytes, Buffer.alloc(bipolarBytes(bytes.length))))]);
        }
        if (X.allTernaryBytes(bytes)) {
          this.census.ternary++; this.isVec = true;
          const G = chainGroup(this.st, 'ternary', bytes.length);
          return X.recordOf([X.S_TERNARY, G.id, this.vector(G, packTernaryBits(bytes, Buffer.alloc(ternaryBytes(bytes.length))))]);
        }
        const w = this.wordsOf(bytes, stack);
        if (w) return w;
        this.census.b64++;
        return X.recordOf([X.S_B64, X.SEC_BYTES, this.bytes.push(bytes), bytes.length]);
      }
    }
    this.census.raw++;
    const raw = Buffer.from(s, 'latin1');
    return X.recordOf([X.S_RAW, X.SEC_BYTES, this.bytes.push(raw), raw.length]);
  }
  // A payload of 4 byte words (a typed array): coded by encodeWords, against the payload that
  // sat at the same path at the checkpoint before when there was one of the same length, and
  // only when that beats deflating the payload itself.
  wordsOf(bytes, stack) {
    if (bytes.length < WORDS_MIN_BYTES || bytes.length % 4) return null;
    const prev = stack ? this.st.paths.get(stack.join(SEP)) : null;
    let base = null;
    if (prev) { const old = prev.bytes || (prev.bytes = Buffer.from(prev.str, 'base64')); if (old.length === bytes.length) base = old; }
    const w = encodeWords(bytes, base);
    if (w.mode === WORDS_PLAIN) return null;
    this.census.sparse++; this.census.sparseBytes += w.blob.length; this.census.sparseRaw += bytes.length;
    return this.X.recordOf([S_WORDS, base ? prev.gid + 1 : 0, w.mode, this.sparse.push(w.blob), w.blob.length, bytes.length]);
  }
}

// ---------------------------------------------------------------- arrays of 4 byte words
// MEASURED on the daemon's seven substrate cells between two checkpoints (t=13387 and t=14429):
// the ring of pending inputs is mostly zeros and its nonzero floats never repeat, lastFired and
// fireCount change in most words by small amounts, and deflate over the interleaved words pays
// for all of it. A word array is coded by three independent choices, the smallest one kept:
//   mask       none (every word), CHANGED (a bitmap of the words that differ from the base; the
//              rest are the base's) or NONZERO (a bitmap of the nonzero words; the rest are 0)
//   transform  the word itself, its XOR with the base word, or its difference from it (mod 2^32)
//   layout     the words as they are, or as four byte planes (every word's low byte, then the
//              next ...), each deflated alone, so a float's sign and exponent bytes share a table
// The blob is a varint count of parts, a varint length per part, then the parts: the deflated
// mask when there is one, then one deflated value run, or four deflated planes.
const WORDS_PLAIN = 0;
const W_NONE = 0, W_CHANGED = 1, W_NONZERO = 2, W_VALUE = 0, W_XOR = 1, W_DIFF = 2, W_PLANES = 16;
const u32Of = (b) => new Uint32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
function deflateValues(vals, planes) {
  if (!planes) return [deflateRawSync(Buffer.from(vals.buffer, vals.byteOffset, vals.length * 4), { level: 6 })];
  const m = vals.length, p = Buffer.allocUnsafe(m * 4);
  for (let i = 0; i < m; i++) { const v = vals[i]; p[i] = v & 255; p[m + i] = (v >>> 8) & 255; p[2 * m + i] = (v >>> 16) & 255; p[3 * m + i] = v >>> 24; }
  return [0, 1, 2, 3].map((j) => deflateRawSync(p.subarray(j * m, (j + 1) * m), { level: 6 }));
}
function partsBlob(parts) { const X = I(); return Buffer.concat([X.recordOf([parts.length, ...parts.map((q) => q.length)]), ...parts]); }
/**
 * @param {Buffer} bytes a payload whose length is a multiple of 4
 * @param {Buffer|null} base the payload that sat at the same path before, of the same length
 * @returns {{ mode: number, blob: Buffer|null, bytes: number }} mode 0 (WORDS_PLAIN) means plain
 *   deflate was smallest and blob is null
 */
export function encodeWords(bytes, base = null) {
  if (bytes.length % 4) throw new RangeError('encodeWords: ' + bytes.length + ' bytes is not a whole number of words');
  if (base && base.length !== bytes.length) throw new RangeError('encodeWords: a base of ' + base.length + ' bytes for ' + bytes.length);
  const n = bytes.length >>> 2, u = u32Of(bytes), b = base ? u32Of(base) : null;
  let zeros = 0, changed = 0;
  for (let i = 0; i < n; i++) { if (u[i] === 0) zeros++; if (b && u[i] !== b[i]) changed++; }
  const cands = [];
  const plain = deflateRawSync(bytes, { level: 6 }).length;
  const run = (mask, xf, planes) => cands.push([mask, xf, planes]);
  run(W_NONE, W_VALUE, true);
  if (zeros >= n / 10) { run(W_NONZERO, W_VALUE, false); run(W_NONZERO, W_VALUE, true); }
  if (b) {
    run(W_NONE, W_DIFF, true); run(W_NONE, W_XOR, true);
    if (changed <= n * 0.9) { run(W_CHANGED, W_VALUE, false); run(W_CHANGED, W_DIFF, false); run(W_CHANGED, W_VALUE, true); run(W_CHANGED, W_XOR, true); run(W_CHANGED, W_DIFF, true); }
  }
  const masks = new Map();
  const maskOf = (kind) => {
    if (masks.has(kind)) return masks.get(kind);
    const bits = Buffer.alloc((n + 7) >>> 3); let m = 0;
    for (let i = 0; i < n; i++) if (kind === W_NONZERO ? u[i] !== 0 : u[i] !== b[i]) { bits[i >>> 3] |= 1 << (i & 7); m++; }
    const r = { bits, m, stored: deflateRawSync(bits, { level: 6 }) }; masks.set(kind, r); return r;
  };
  let best = { mode: WORDS_PLAIN, blob: null, bytes: plain };
  for (const [mask, xf, planes] of cands) {
    const mk = mask === W_NONE ? null : maskOf(mask);
    const vals = new Uint32Array(mk ? mk.m : n);
    let c = 0;
    for (let i = 0; i < n; i++) {
      if (mk && !((mk.bits[i >>> 3] >>> (i & 7)) & 1)) continue;
      vals[c++] = xf === W_VALUE ? u[i] : xf === W_XOR ? (u[i] ^ b[i]) >>> 0 : (u[i] - b[i]) >>> 0;
    }
    const parts = [...(mk ? [mk.stored] : []), ...deflateValues(vals, planes)];
    const size = parts.reduce((s, q) => s + q.length, 0) + 12;
    if (size < best.bytes) best = { mode: mask | (xf << 2) | (planes ? W_PLANES : 0), parts, bytes: size };
  }
  if (best.mode === WORDS_PLAIN) return best;
  const blob = partsBlob(best.parts);
  return { mode: best.mode, blob, bytes: blob.length };
}
/** The inverse of encodeWords: the payload's bytes, checked to the last word. */
export function decodeWords(blob, mode, rawLen, base = null) {
  const X = I();
  const mask = mode & 3, xf = (mode >>> 2) & 3, planes = (mode & W_PLANES) !== 0;
  if (mode === WORDS_PLAIN || (mode & ~0x1F) || mask === 3 || xf === 3 || (mask === W_NONZERO && xf !== W_VALUE) || rawLen % 4) throw new Error('words: mode ' + mode + ' for ' + rawLen + ' bytes is not one this reader knows');
  if ((mask === W_CHANGED || xf !== W_VALUE) && !(base && base.length === rawLen)) throw new Error('words: mode ' + mode + ' needs a base of ' + rawLen + ' bytes');
  let i = 0;
  const next = () => { const [v, j] = X.readVarint(blob, i); i = j; return v; };
  const count = next(), lens = [];
  for (let k = 0; k < count; k++) lens.push(next());
  const want = (mask ? 1 : 0) + (planes ? 4 : 1);
  if (count !== want || i + lens.reduce((s, x) => s + x, 0) !== blob.length) throw new Error('words: ' + count + ' parts of ' + (blob.length - i) + ' bytes do not make mode ' + mode);
  const parts = lens.map((len) => { const q = blob.subarray(i, i + len); i += len; return q; });
  const n = rawLen >>> 2;
  let bits = null, m = n, pi = 0;
  if (mask) {
    bits = inflateRawSync(parts[pi++]);
    if (bits.length !== ((n + 7) >>> 3)) throw new Error('words: a mask of ' + bits.length + ' bytes for ' + n + ' words');
    m = 0; for (let k = 0; k < n; k++) m += (bits[k >>> 3] >>> (k & 7)) & 1;
    if (n % 8 && (bits[bits.length - 1] >>> (n % 8))) throw new Error('words: mask bits past the last word');
  }
  const vals = new Uint32Array(m);
  if (planes) {
    const p = [0, 1, 2, 3].map(() => inflateRawSync(parts[pi++]));
    if (p.some((q) => q.length !== m)) throw new Error('words: a byte plane is not ' + m + ' bytes');
    for (let k = 0; k < m; k++) vals[k] = (p[0][k] | (p[1][k] << 8) | (p[2][k] << 16) | (p[3][k] << 24)) >>> 0;
  } else {
    const v = inflateRawSync(parts[pi++]);
    if (v.length !== m * 4) throw new Error('words: ' + v.length + ' value bytes for ' + m + ' words');
    vals.set(u32Of(v));
  }
  const b = base ? u32Of(base) : null, out = new Uint32Array(n);
  let c = 0;
  for (let k = 0; k < n; k++) {
    if (bits && !((bits[k >>> 3] >>> (k & 7)) & 1)) { out[k] = mask === W_CHANGED ? b[k] : 0; continue; }
    const v = vals[c++];
    out[k] = xf === W_VALUE ? v : xf === W_XOR ? (v ^ b[k]) >>> 0 : (b[k] + v) >>> 0;
  }
  return Buffer.from(out.buffer);
}

// ---------------------------------------------------------------- the skeleton, against the last one
// MEASURED on the daemon's skeleton between t=13387 and t=14429 (2562735 bytes of text): the
// content defined chunk patch above takes 163259 bytes, zstd with the previous skeleton as its
// dictionary 112307 at level 9 and 83546 at level 19. Node carries zstd from 23.8; without it the
// patch falls back to diffText, and a reader without it refuses a zstd link by name.
const ZSTD = typeof zlib.zstdCompressSync === 'function' && typeof zlib.zstdDecompressSync === 'function';
const ZSTD_MAX_WINDOW = 27;
function zstdLevelFor(n) { return n <= (4 << 20) ? 19 : n <= (16 << 20) ? 15 : 9; }
function skeletonPatch(old, neu, { zstd = ZSTD } = {}) {
  if (zstd && old.length + neu.length < (1 << ZSTD_MAX_WINDOW)) {
    const C = zlib.constants, level = zstdLevelFor(neu.length);
    const windowLog = Math.max(20, Math.min(ZSTD_MAX_WINDOW, Math.ceil(Math.log2(old.length + neu.length + 1))));
    const stored = zlib.zstdCompressSync(neu, { dictionary: old, params: { [C.ZSTD_c_compressionLevel]: level, [C.ZSTD_c_windowLog]: windowLog } });
    return [{ name: 'patch', enc: 'zstd-dict', level, windowLog, stored }];
  }
  const p = diffText(old, neu);
  return [
    { name: 'patch', enc: 'cdc', stored: deflateRawSync(p.ops, { level: 6 }), raw: p.ops.length, copied: p.copied, literal: p.literal, pieces: p.pieces },
    { name: 'lits', enc: 'blobs', stored: p.lits },
  ];
}
function applySkeletonPatch(old, got, expectBytes, file) {
  const p = got.patch;
  if (!p) throw new Error(file + ': no patch section');
  if (p.s.enc === 'zstd-dict') {
    if (!ZSTD) throw new Error(file + ': its skeleton is a zstd patch and this Node (' + process.version + ') has no zstd');
    let text;
    try { text = zlib.zstdDecompressSync(p.stored, { dictionary: old, params: { [zlib.constants.ZSTD_d_windowLogMax]: ZSTD_MAX_WINDOW } }); }
    catch (e) { throw new Error(file + ': its skeleton patch does not decode (' + e.message + ')'); }
    if (text.length !== expectBytes) throw new Error(file + ': the skeleton rebuilds to ' + text.length + ' bytes, the header says ' + expectBytes);
    return text;
  }
  if (p.s.enc === 'cdc') {
    if (!got.lits) throw new Error(file + ': a cdc patch without its lits section');
    const ops = inflateRawSync(p.stored);
    if (ops.length !== p.s.raw) throw new Error(file + ': patch ops inflate to ' + ops.length + ' bytes, the header says ' + p.s.raw);
    return patchText(old, ops, got.lits.stored, expectBytes);
  }
  throw new Error(file + ': a skeleton patch encoded ' + p.s.enc + ', which this reader does not know');
}

function writeDelta(st, doc, { ruler, policy }) {
  const X = I();
  const seq = st.seq + 1;
  const rel = CHAIN_DIR + '/' + st.id + '.d' + String(seq).padStart(4, '0') + '.ckd', abs = path.join(st.dir, rel);
  const table = new DeltaTable(st);
  const text = textOf(doc, table);
  const textSha1 = sha1(text);
  const sections = [];
  const recs = table.recs.buffer();
  sections.push({ name: 'slots', enc: 'deflate-raw', stored: deflateRawSync(recs, { level: 6 }), raw: recs.length, count: st.slotCount - table.base });
  for (const s of skeletonPatch(st.text, text, { zstd: policy.zstd !== false && ZSTD })) sections.push(s);
  const bytesRaw = table.bytes.buffer();
  const bc = X.deflateChunks(bytesRaw, X.BYTES_CHUNK);
  sections.push({ name: 'bytes', id: X.SEC_BYTES, enc: 'deflate-raw-chunks', stored: Buffer.concat(bc.map((c) => c.d)), raw: bytesRaw.length, chunks: bc.map((c) => [c.d.length, c.raw]) });
  sections.push({ name: 'words', enc: 'blobs', stored: table.sparse.buffer() });
  for (const f of table.fresh.values()) {
    const G = f.G, count = G.store.count - f.base;
    if (!count) continue;
    const store = Buffer.from(G.store.u8.buffer, f.base * G.per, count * G.per);
    const base = { name: 'hv.' + G.kind + '.' + G.lanes, id: G.id, kind: G.kind, lanes: G.lanes, per: G.per, base: f.base, count };
    if (G.kind === 'bipolar') {
      const coded = xorRefEncode(store, G.per, count, { base: f.base, refs: Int32Array.from(f.refs), refAt: (i) => G.store.at(i) });
      sections.push({ ...base, enc: 'xor-ref', raw: store.length, rawCrc32: crc32(store), stored: coded });
    } else sections.push({ ...base, enc: 'ternary-bits', stored: Buffer.from(store) });
  }
  const shape = docShape(doc);
  const head = {
    format: 'brain.checkpoint.delta', version: 1, chain: st.id, seq, parent: st.seq, ...shape, bytes: 0,
    slotsBase: table.base, slots: st.slotCount - table.base, slotsKeySha1: table.keys.digest('hex'),
    parentText: { bytes: st.text.length, sha1: st.textSha1 }, text: { bytes: text.length, sha1: textSha1 },
    census: table.census,
  };
  const w = writeContainer(abs, DELTA_MAGIC, head, sections, (h, total) => ({ ...h, bytes: total }));
  // committed: the next delta is against this one
  st.seq = seq; st.text = text; st.textSha1 = textSha1; st.paths = table.paths;
  const entry = { file: rel, kind: 'delta', seq, t: shape.t, bytes: w.bytes, crc32: w.crc32, textSha1, ...(policy.digest ? { docSha1: docDigest(doc) } : {}) };
  st.files.push(entry);
  return writeHead(st, doc, { ruler, wrote: entry, kind: 'delta', census: table.census, sections: w.header.sections });
}

// The head: which files make the chain, and the ruler. `bytes` is what this checkpoint wrote
// (its chain file and the head), `chainBytes` what a restore reads (every file and the head).
function writeHead(st, doc, { ruler, wrote, kind, census = null, sections = null }) {
  const shape = docShape(doc);
  const filesBytes = st.files.reduce((a, f) => a + f.bytes, 0);
  const head = {
    format: 'brain.checkpoint.chain', version: 1, chain: st.id, seq: st.seq, kind, fullEvery: st.fullEvery, ...shape,
    file: wrote.file, fileBytes: wrote.bytes, bytes: 0, headBytes: 0, chainBytes: 0, savedAt: new Date().toISOString(),
    ruler: null, files: st.files,
    ...(census ? { census } : {}),
  };
  const sizes = (h, total) => {
    const headBytes = total, written = wrote.bytes + headBytes, chainBytes = filesBytes + headBytes;
    const out = { ...h, bytes: written, headBytes, chainBytes };
    if (ruler) {
      const score = Number(ruler.score), placeholder = total > 1e14;
      out.ruler = {
        ...ruler, cells: ruler.cells ?? shape.cells, bytes: written, chainBytes,
        bytesPerScorePoint: placeholder ? total : (score > 0 ? Math.round(written / score * 1000) / 1000 : null),
        chainBytesPerScorePoint: placeholder ? total : (score > 0 ? Math.round(chainBytes / score * 1000) / 1000 : null),
      };
    }
    return out;
  };
  // the head has no body of its own; the sections of the link it just wrote ride as linkSections
  if (sections) head.linkSections = sections.map((s) => ({ name: s.name, bytes: s.bytes, ...(s.count !== undefined ? { count: s.count } : {}), ...(s.raw !== undefined ? { raw: s.raw } : {}) }));
  const w = writeContainer(st.headFile, HEAD_MAGIC, head, [], sizes);
  delete w.header.sections;
  return { file: st.headFile, bytes: w.header.bytes, header: w.header };
}

// ---------------------------------------------------------------- reading
function readLink(dir, entry, headFile) {
  const abs = path.join(dir, entry.file);
  if (!existsSync(abs)) throw new Error('chain ' + headFile + ' names ' + entry.file + ', which is not beside it (was the head copied without its ' + CHAIN_DIR + '/ directory?)');
  const buf = I().readAll(abs, 1 << 30);
  if (buf.length !== entry.bytes) throw new Error(entry.file + ' holds ' + buf.length + ' bytes, the head says ' + entry.bytes + '; refusing a truncated or extended file');
  const c = crc32(buf);
  if (c !== (entry.crc32 >>> 0)) throw new Error(entry.file + ' fails the checksum the head recorded (crc32 ' + (entry.crc32 >>> 0).toString(16) + ', computed ' + c.toString(16) + '); refusing it');
  return buf;
}

// one delta onto the replay state, decoded and verified in full BEFORE anything is committed, so
// a refused delta leaves the state exactly at the last link that verified
function applyDelta(S, buf, entry) {
  const X = I();
  const file = entry.file;
  const { header: h, bodyAt } = readContainerHeader(buf, DELTA_MAGIC, 'brain.checkpoint.delta', file);
  if (h.bytes !== buf.length) throw new Error(file + ': the header says ' + h.bytes + ' bytes and the file holds ' + buf.length);
  if (h.chain !== S.chain || h.seq !== entry.seq || h.parent !== S.seq) throw new Error(file + ': link ' + h.chain + ' seq ' + h.seq + ' after ' + h.parent + ' does not follow ' + S.chain + ' seq ' + S.seq);
  if (h.parentText.sha1 !== S.textSha1 || h.parentText.bytes !== S.text.length) throw new Error(file + ': written against a skeleton this chain did not rebuild');
  if (h.slotsBase !== S.strings.length) throw new Error(file + ': its slots start at ' + h.slotsBase + ', the chain holds ' + S.strings.length);
  const got = sectionsOf(buf, h, bodyAt, file);
  for (const n of ['slots', 'patch', 'bytes', 'words']) if (!got[n]) throw new Error(file + ': no ' + n + ' section');
  // the new vectors, each group checked against the store it extends
  const fresh = new Map();
  for (const { s, stored } of Object.values(got)) {
    if (!s.kind) continue;
    let G = S.groups.get(s.kind + s.lanes), isNew = false;
    if (!G) { if (s.base !== 0) throw new Error(file + ': group ' + s.name + ' starts at ' + s.base + ' in a chain that holds none'); G = { id: s.id, kind: s.kind, lanes: s.lanes, per: s.per, store: new GrowStore(s.per) }; isNew = true; }
    else if (G.id !== s.id || G.per !== s.per) throw new Error(file + ': group ' + s.name + ' is id ' + s.id + ' here and id ' + G.id + ' in the chain');
    if (s.base !== G.store.count) throw new Error(file + ': ' + s.name + ' extends the store at ' + s.base + ', which holds ' + G.store.count);
    let data;
    if (s.enc === 'xor-ref') {
      try { data = xorRefDecode(stored, s.per, s.count, { base: s.base, refAt: (i) => (i < G.store.count ? G.store.at(i) : null) }); }
      catch (e) { throw new Error(file + ': section ' + s.name + ' does not decode (' + e.message + ')'); }
      if (data.length !== s.raw || crc32(data) !== (s.rawCrc32 >>> 0)) throw new Error(file + ': section ' + s.name + ' decodes to bytes that fail their checksum');
    } else if (s.enc === 'ternary-bits') {
      if (stored.length !== s.count * s.per) throw new Error(file + ': section ' + s.name + ' holds ' + stored.length + ' bytes for ' + s.count + ' vectors');
      data = stored;
    } else throw new Error(file + ': section ' + s.name + ' is encoded ' + s.enc + ', which this reader does not know');
    fresh.set(s.id, { G, data, isNew, base: s.base, count: s.count });
  }
  const groupOf = (id) => { const f = fresh.get(id); if (f) return f.G; for (const G of S.groups.values()) if (G.id === id) return G; return null; };
  const vecAt = (id, idx) => {
    const f = fresh.get(id), G = f ? f.G : groupOf(id);
    if (!G) throw new Error(file + ': a slot names vector group ' + id + ', which the chain does not hold');
    if (idx < G.store.count) return { G, bytes: G.store.at(idx) };
    if (f && idx < f.base + f.count) return { G, bytes: f.data.subarray((idx - f.base) * G.per, (idx - f.base + 1) * G.per) };
    throw new Error(file + ': vector ' + idx + ' past the ' + G.kind + '.' + G.lanes + ' store');
  };
  // the new slots, in order
  const recs = inflateRawSync(got.slots.stored);
  if (recs.length !== got.slots.s.raw) throw new Error(file + ': slots inflate to ' + recs.length + ' bytes, the header says ' + got.slots.s.raw);
  const bytesSec = got.bytes.s, bytesData = X.inflateChunks(got.bytes.stored, bytesSec.chunks, bytesSec.raw, 'bytes', file);
  const words = got.words.stored;
  const news = [];
  const stringAt = (gid) => (gid < S.strings.length ? S.strings[gid] : gid - S.strings.length < news.length ? news[gid - S.strings.length] : null);
  let i = 0;
  const next = () => { const [v, j] = X.readVarint(recs, i); i = j; return v; };
  while (i < recs.length) {
    const type = recs[i++];
    if (type === X.S_RAW || type === X.S_B64) {
      const sec = next(), at = next(), n = next();
      if (sec !== X.SEC_BYTES || at + n > bytesData.length) throw new Error(file + ': a slot reads past the bytes section');
      news.push(bytesData.toString(type === X.S_RAW ? 'latin1' : 'base64', at, at + n));
    } else if (type === X.S_PACKED || type === X.S_BIPOLAR || type === X.S_TERNARY) {
      const id = next(), idx = next(), { G, bytes } = vecAt(id, idx);
      if (type === X.S_PACKED) news.push('b' + G.lanes + ':' + bytes.toString('base64'));
      else if (type === X.S_BIPOLAR) news.push(X.unpackBipolar(bytes, G.lanes, 0).toString('base64'));
      else news.push(X.unpackTernaryAsBytes(bytes, G.lanes, 0).toString('base64'));
    } else if (type === S_WORDS) {
      const baseRef = next(), mode = next(), at = next(), stored = next(), rawLen = next();
      let base = null;
      if (baseRef > 0) {
        const baseStr = stringAt(baseRef - 1);
        if (baseStr === null) throw new Error(file + ': a word slot names slot ' + (baseRef - 1) + ', which the chain does not hold');
        base = Buffer.from(baseStr, 'base64');
      }
      if (at + stored > words.length) throw new Error(file + ': a word slot reads past the words section');
      try { news.push(decodeWords(words.subarray(at, at + stored), mode, rawLen, base).toString('base64')); }
      catch (e) { throw new Error(file + ': a word slot does not decode (' + e.message + ')'); }
    } else throw new Error(file + ': unknown slot type ' + type);
  }
  if (news.length !== h.slots) throw new Error(file + ': ' + news.length + ' slot records for a declared ' + h.slots);
  const kh = createHash('sha1');
  for (const s of news) { kh.update(slotKey(s)); kh.update('\n'); }
  if (kh.digest('hex') !== h.slotsKeySha1) throw new Error(file + ': the new slots decode to strings other than the ones their writer registered (their key digest differs)');
  const text = applySkeletonPatch(S.text, got, h.text.bytes, file);
  const ts = sha1(text);
  if (ts !== h.text.sha1 || ts !== entry.textSha1) throw new Error(file + ': the rebuilt skeleton fails its SHA-1 (' + ts + ' against ' + h.text.sha1 + ')');
  // verified: commit
  for (const s of news) S.strings.push(s);
  for (const f of fresh.values()) { f.G.store.append(f.data, f.count); if (f.isNew) S.groups.set(f.G.kind + f.G.lanes, f.G); }
  S.text = text; S.textSha1 = ts; S.seq = h.seq; S.file = file;
}

/**
 * A chain head back into its document: the full, then every delta in order, each verified.
 * @param {Buffer} buf the head file's bytes
 * @param {object} [opts] { file: the head's path (the chain files are found beside it), limit,
 *   lastGood: on a refused delta, return the state of the last link that verified instead of throwing }
 * @returns {{ doc: object, header: object, links: number, refused: object|null }}
 */
export function readChainBuffer(buf, { file = 'snapshot.json', limit = null, lastGood = false } = {}) {
  const X = I();
  const head = readChainHeaderBuffer(buf, file);
  const dir = path.dirname(path.resolve(file));
  const files = head.files || [];
  if (!files.length || files[0].kind !== 'full' || files[0].seq !== 0) throw new Error('chain ' + file + ': the head names no full checkpoint to start from');
  const f0 = files[0];
  const b0 = readLink(dir, f0, file);
  const parts = X.readCheckpointParts(b0, { file: f0.file });
  if (!parts.header.chain || parts.header.chain.id !== head.chain) throw new Error('chain ' + file + ': ' + f0.file + ' is not the full checkpoint of chain ' + head.chain);
  const S = { chain: head.chain, seq: 0, file: f0.file, strings: parts.strings, groups: new Map(), text: parts.text, textSha1: sha1(parts.text) };
  if (S.textSha1 !== f0.textSha1) throw new Error('chain ' + file + ': ' + f0.file + ' rebuilds a skeleton that fails its SHA-1');
  for (const x of parts.byId) {
    if (!x || !x.s.kind) continue;
    S.groups.set(x.s.kind + x.s.lanes, { id: x.s.id, kind: x.s.kind, lanes: x.s.lanes, per: x.s.per, store: GrowStore.from(x.data, x.s.per, x.s.count) });
  }
  let refused = null;
  for (let k = 1; k < files.length; k++) {
    const e = files[k];
    try {
      if (e.kind !== 'delta' || e.seq !== k) throw new Error('the head lists ' + e.kind + ' seq ' + e.seq + ' as link ' + k);
      applyDelta(S, readLink(dir, e, file), e);
    } catch (err) {
      const why = String(err && err.message || err);
      if (!lastGood) throw new Error('chain ' + file + ': delta ' + e.file + ' (seq ' + e.seq + ') is refused: ' + why + '; the last good state is seq ' + S.seq + ' (' + S.file + ')');
      refused = { file: e.file, seq: e.seq, why, lastGood: { seq: S.seq, file: S.file, full: f0.file } };
      break;
    }
  }
  const doc = X.unref(X.parseSkeleton(S.text, limit ?? X.SLICE, file), S.strings);
  const last = files[S.seq];
  if (last.docSha1) {
    const d = docDigest(doc);
    if (d !== last.docSha1) throw new Error('chain ' + file + ': the document rebuilt at seq ' + S.seq + ' fails the SHA-1 its writer recorded (' + d + ' against ' + last.docSha1 + ')');
  }
  return { doc, header: head, links: S.seq + 1, refused, verified: { docSha1: !!last.docSha1 } };
}
/** Read a chain head file: see readChainBuffer. */
export function readChain(file, opts = {}) { return readChainBuffer(I().readAll(file, 1 << 30), { ...opts, file }); }
/** The head's header of a chain head file, or null when the file is not one. */
export function readChainHeader(file) { return readHeadFile(file); }
