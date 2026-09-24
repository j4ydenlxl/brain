// memory/direct.mjs. THE DIRECT TIER: a question the organism has already answered is answered
// again with ONE table lookup and no search (his order of 2026-09-23: "it processes items in
// nanoseconds").
//
// What a key is. The knowledge tier (memory/knowledge.mjs) keys a question by the hypervector of
// its words, bundle(words.map(w => hvFromSeed('word:' + w))), and indexes titles by the SIGN BITS
// of that vector's first SIG_BITS (256) lanes. The direct key is that same 256 bit signature
// folded to 64 bits by XOR (hi = words 0^2^4^6, lo = words 1^3^5^7). The lanes of a bundle of
// seeded vectors are independent coin flips, so the fold of two different word sets is a 64 bit
// random value: two questions that share a fold are a collision, and they are counted.
//
// Why a verifier rides with the key. A hypervector of words is a BAG: it cannot tell "7 - 3"
// from "3 - 7", and "What is Paris?" from "Where is Paris?" differ only in a stop word. So every
// slot also holds a 64 bit hash (core/rng.mjs hash32 and memory/knowledge.mjs hash2) of the
// question's CANONICAL form, and a hit needs both. The canonical form is chosen so that a hit
// returns exactly what the organism would have computed:
//   fact  the question is a factual shape (act/prompt.mjs factQuestion): the kind and the
//         subject's tokens. The knowledge tier's answer to "What is S?" is a pure function of
//         tokens(S) (its querySubject, titleWords and normTitle all start from tokens), so two
//         phrasings with the same subject tokens ARE the same question to it.
//   text  anything else: the text with its whitespace collapsed, operators and case kept.
// Two keys with the same fold and different verifiers are both stored; the probe walks past the
// one that is not asked for.
//
// The table. Open addressing with linear probing over five typed arrays (fold hi, fold lo,
// verifier hi, verifier lo, entry index), load factor at most MAX_LOAD, doubled when it would
// pass it. An entry is columnar: the answer and the article title (strings), the source it was
// filled from ('exact' or 'memory'), the confidence the tier gave it, the fact's item id in the
// knowledge store (or -1), and a note (the exact method, or the knowledge kind). lookup() reads
// integers only and returns an entry index or -1.
//
// On disk (save/load). One file: an 8 byte magic, a u32 header length, a JSON header (format,
// counts, the store the table is bound to, the byte offset of every section), then the sections
// 8 byte aligned. A table built from a knowledge store is BOUND to it by the store's meta.json
// counts, and a caller refuses a table whose binding does not match the store it would answer for.
import fs from 'node:fs';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { hash32 } from '../core/rng.mjs';
import { KnowledgeStore, SIG_WORDS, confidenceOf, contentWords, hash2, normTitle, sigOf, titleWords, uniq } from './knowledge.mjs';

export const DIRECT_FORMAT = 1;
export const MAGIC = 'DIRECT01';
/** What an entry was filled from. */
export const SOURCES = Object.freeze(['exact', 'memory']);
/** The most slots a table fills before it doubles. */
export const MAX_LOAD = 0.5;
/** The fact kinds a key can carry: 'what' is the knowledge tier's own question, the others are marked. */
export const FACT_KINDS = Object.freeze(['what', 'where', 'when']);

const SIG = new Uint32Array(SIG_WORDS);

/**
 * XOR fold of a signature (an even number of u32 words) to 64 bits.
 * @param {Uint32Array|Int32Array} sig
 * @returns {{hi: number, lo: number}} two unsigned 32 bit halves
 */
export function fold64(sig) {
  let hi = 0, lo = 0;
  for (let w = 0; w + 1 < sig.length; w += 2) { hi ^= sig[w]; lo ^= sig[w + 1]; }
  return { hi: hi >>> 0, lo: lo >>> 0 };
}

function verifier(s) { return { vh: hash32(s) >>> 0, vl: hash2(s) >>> 0 }; }

/**
 * The key of a factual question: the fold of the knowledge tier's signature of the subject's key
 * words (with a shape word for where and when, so their folds differ from the 'what' fold), and
 * the verifier of kind + tokens(subject).
 * @param {string} subject
 * @param {string} [kind] 'what' | 'where' | 'when'
 * @returns {{hi, lo, vh, vl, form: 'fact', kind: string, words: string[], canon: string}}
 */
export function factKey(subject, kind = 'what') {
  const words = titleWords(String(subject ?? ''));
  const members = kind === 'what' ? words : [...words, 'shape:' + kind];
  sigOf(members, SIG);
  const { hi, lo } = fold64(SIG);
  const canon = 'f:' + kind + '\u0000' + normTitle(String(subject ?? ''));
  return { hi, lo, ...verifier(canon), form: 'fact', kind, words: members, canon };
}

/** The canonical text of a non factual question: whitespace collapsed, nothing else changed. */
export function canonText(text) { return String(text ?? '').replace(/\s+/g, ' ').trim(); }

/**
 * The key of any other question: the fold of the signature of its content words, and the
 * verifier of its canonical text (so operators, order and case all count).
 * @param {string} text
 * @returns {{hi, lo, vh, vl, form: 'text', kind: null, words: string[], canon: string}}
 */
export function textKey(text) {
  const c = canonText(text);
  const members = uniq(contentWords(c));
  sigOf(members, SIG);
  const { hi, lo } = fold64(SIG);
  const canon = 'x\u0000' + c;
  return { hi, lo, ...verifier(canon), form: 'text', kind: null, words: members, canon };
}

/** The key rendered for a ledger or a verdict: sixteen hex digits of the fold. */
export function keyHex(k) { return k.hi.toString(16).padStart(8, '0') + k.lo.toString(16).padStart(8, '0'); }

function pow2AtLeast(n) { let c = 16; while (c < n) c *= 2; return c; }

export class DirectTable {
  /**
   * @param {object} [opts] { capacity: entries expected (the table sizes itself to hold them under MAX_LOAD), meta: what it is bound to }
   */
  constructor(opts = {}) {
    const want = Math.max(8, Math.floor(Number(opts.capacity) || 1024));
    this._alloc(pow2AtLeast(Math.ceil(want / MAX_LOAD)));
    this.n = 0;
    this.src = new Uint8Array(want);
    this.conf = new Float32Array(want);
    this.item = new Int32Array(want);
    this.answers = [];
    this.titles = [];
    this.notes = [];
    this.meta = opts.meta ?? null;
    this.learn = opts.learn === true;
    this.stats = { inserted: 0, replaced: 0, foldCollisions: 0, probeCollisions: 0, grows: 0 };
  }

  _alloc(cap) {
    this.cap = cap;
    this.mask = cap - 1;
    this.kh = new Uint32Array(cap);
    this.kl = new Uint32Array(cap);
    this.vh = new Uint32Array(cap);
    this.vl = new Uint32Array(cap);
    this.ref = new Int32Array(cap).fill(-1);
  }

  /** The home slot of a fold. The fold's bits are already uniform, so its low bits are the slot. */
  home(hi, lo) { return (lo ^ Math.imul(hi, 0x9e3779b1)) & this.mask; }

  /**
   * THE lookup: integers only, no allocation, no string. Returns the entry index or -1.
   * @param {number} hi @param {number} lo @param {number} vh @param {number} vl
   * @returns {number}
   */
  lookup(hi, lo, vh, vl) {
    const kh = this.kh, kl = this.kl, v1 = this.vh, v2 = this.vl, ref = this.ref, mask = this.mask;
    let s = (lo ^ Math.imul(hi, 0x9e3779b1)) & mask;
    for (;;) {
      const r = ref[s];
      if (r < 0) return -1;
      if (kl[s] === lo && kh[s] === hi && v2[s] === vl && v1[s] === vh) return r;
      s = (s + 1) & mask;
    }
  }

  /** lookup() on a key object. */
  get(k) { return this.lookup(k.hi, k.lo, k.vh, k.vl); }

  /**
   * The same walk as lookup(), reporting what it met: the slow path a test reads.
   * @returns {{index: number, probes: number, foldCollision: boolean, home: number}}
   */
  probe(k) {
    let s = this.home(k.hi, k.lo), probes = 0, foldCollision = false;
    const home = s;
    for (;;) {
      probes++;
      const r = this.ref[s];
      if (r < 0) return { index: -1, probes, foldCollision, home };
      if (this.kh[s] === k.hi && this.kl[s] === k.lo) {
        if (this.vh[s] === k.vh && this.vl[s] === k.vl) return { index: r, probes, foldCollision, home };
        foldCollision = true;
      }
      s = (s + 1) & this.mask;
    }
  }

  _ensureEntries(n) {
    if (n <= this.src.length) return;
    const m = Math.max(n, this.src.length * 2);
    const s = new Uint8Array(m); s.set(this.src); this.src = s;
    const c = new Float32Array(m); c.set(this.conf); this.conf = c;
    const it = new Int32Array(m); it.set(this.item); this.item = it;
  }

  _grow() {
    const old = { kh: this.kh, kl: this.kl, vh: this.vh, vl: this.vl, ref: this.ref, cap: this.cap };
    this._alloc(this.cap * 2);
    for (let s = 0; s < old.cap; s++) {
      const r = old.ref[s];
      if (r < 0) continue;
      let t = this.home(old.kh[s], old.kl[s]);
      while (this.ref[t] >= 0) t = (t + 1) & this.mask;
      this.kh[t] = old.kh[s]; this.kl[t] = old.kl[s]; this.vh[t] = old.vh[s]; this.vl[t] = old.vl[s]; this.ref[t] = r;
    }
    this.stats.grows++;
  }

  /**
   * Insert or replace one answer.
   * @param {object} k a key from factKey() or textKey()
   * @param {object} e { answer, title, source: 'exact'|'memory', confidence, item, note }
   * @returns {number} the entry index
   */
  set(k, e) {
    const src = SOURCES.indexOf(e.source);
    if (src < 0) throw new Error('direct: an entry is filled from ' + SOURCES.join(' or ') + ', got ' + e.source);
    if (this.n + 1 > this.cap * MAX_LOAD) this._grow();
    let s = this.home(k.hi, k.lo), first = true;
    for (;;) {
      const r = this.ref[s];
      if (r < 0) break;
      if (this.kh[s] === k.hi && this.kl[s] === k.lo) {
        if (this.vh[s] === k.vh && this.vl[s] === k.vl) { this._write(r, e, src); this.stats.replaced++; return r; }
        this.stats.foldCollisions++;
      } else if (first) this.stats.probeCollisions++;
      first = false;
      s = (s + 1) & this.mask;
    }
    const i = this.n++;
    this._ensureEntries(this.n);
    this._write(i, e, src);
    this.kh[s] = k.hi; this.kl[s] = k.lo; this.vh[s] = k.vh; this.vl[s] = k.vl; this.ref[s] = i;
    this.stats.inserted++;
    return i;
  }

  _write(i, e, src) {
    this.src[i] = src;
    this.conf[i] = Number.isFinite(e.confidence) ? e.confidence : 1;
    this.item[i] = Number.isInteger(e.item) ? e.item : -1;
    this.answers[i] = String(e.answer ?? '');
    this.titles[i] = e.title == null ? null : String(e.title);
    this.notes[i] = e.note == null ? null : String(e.note);
  }

  /** Entry i as an object. */
  entry(i) {
    return { index: i, answer: this.answers[i], title: this.titles[i], source: SOURCES[this.src[i]], confidence: this.conf[i], item: this.item[i], note: this.notes[i] };
  }

  /** Entries by source. */
  counts() {
    const out = { entries: this.n, exact: 0, memory: 0 };
    for (let i = 0; i < this.n; i++) out[SOURCES[this.src[i]]]++;
    return out;
  }

  /** Bytes this table holds: the typed arrays exactly, the strings at two bytes a UTF-16 unit. */
  bytes() {
    let str = 0;
    for (let i = 0; i < this.n; i++) str += 2 * ((this.answers[i] || '').length + (this.titles[i] || '').length + (this.notes[i] || '').length);
    const typed = this.kh.byteLength + this.kl.byteLength + this.vh.byteLength + this.vl.byteLength + this.ref.byteLength + this.src.byteLength + this.conf.byteLength + this.item.byteLength;
    return { typed, strings: str, total: typed + str };
  }

  /**
   * Write the table to one file, atomically (a temp file renamed over it).
   * @param {string} file
   * @returns {{bytes: number}}
   */
  save(file) {
    const n = this.n;
    const sections = [
      ['kh', this.kh], ['kl', this.kl], ['vh', this.vh], ['vl', this.vl], ['ref', this.ref],
      ['src', this.src.subarray(0, n)], ['conf', this.conf.subarray(0, n)], ['item', this.item.subarray(0, n)],
      ['strings', Buffer.from(JSON.stringify({ answers: this.answers.slice(0, n), titles: this.titles.slice(0, n), notes: this.notes.slice(0, n) }), 'utf8')],
    ];
    const layout = [];
    let off = 0;
    for (const [name, arr] of sections) { layout.push({ name, offset: off, bytes: arr.byteLength }); off += Math.ceil(arr.byteLength / 8) * 8; }
    const header = Buffer.from(JSON.stringify({ format: DIRECT_FORMAT, n, cap: this.cap, meta: this.meta, stats: this.stats, counts: this.counts(), layout }), 'utf8');
    const head = Buffer.alloc(8 + 4 + header.length);
    head.write(MAGIC, 0, 'latin1'); head.writeUInt32LE(header.length, 8); header.copy(head, 12);
    const pad = (Math.ceil(head.length / 8) * 8) - head.length;
    const body = Buffer.alloc(off);
    sections.forEach(([, arr], j) => { Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength).copy(body, layout[j].offset); });
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, Buffer.concat([head, Buffer.alloc(pad), body]));
    fs.renameSync(tmp, file);
    return { bytes: head.length + pad + off };
  }

  /**
   * Read a table save() wrote.
   * @param {string} file
   * @returns {DirectTable}
   */
  static load(file) {
    const buf = fs.readFileSync(file);
    if (buf.toString('latin1', 0, 8) !== MAGIC) throw new Error('direct: ' + file + ' is not a direct table');
    const hl = buf.readUInt32LE(8);
    const h = JSON.parse(buf.toString('utf8', 12, 12 + hl));
    if (h.format !== DIRECT_FORMAT) throw new Error('direct: format ' + h.format + ', this build reads ' + DIRECT_FORMAT);
    const base = Math.ceil((12 + hl) / 8) * 8;
    const sec = Object.fromEntries(h.layout.map((l) => [l.name, l]));
    const take = (name, Ctor) => { const l = sec[name]; const ab = new ArrayBuffer(l.bytes); new Uint8Array(ab).set(buf.subarray(base + l.offset, base + l.offset + l.bytes)); return new Ctor(ab); };
    const t = new DirectTable({ capacity: Math.max(8, h.n), meta: h.meta });
    t.cap = h.cap; t.mask = h.cap - 1;
    t.kh = take('kh', Uint32Array); t.kl = take('kl', Uint32Array); t.vh = take('vh', Uint32Array); t.vl = take('vl', Uint32Array); t.ref = take('ref', Int32Array);
    t.src = take('src', Uint8Array); t.conf = take('conf', Float32Array); t.item = take('item', Int32Array);
    const s = JSON.parse(buf.toString('utf8', base + sec.strings.offset, base + sec.strings.offset + sec.strings.bytes));
    t.answers = s.answers; t.titles = s.titles; t.notes = s.notes;
    t.n = h.n;
    t.stats = { ...t.stats, ...(h.stats || {}) };
    return t;
  }
}

/**
 * The binding of a table to a knowledge store: the counts its meta.json carries. A table built
 * from one ingest answers for that ingest and no other.
 * @param {object} meta a knowledge store's meta.json
 * @param {number} floor the confidence floor the table was filled at
 */
export function bindingOf(meta, floor) {
  return { store: 'knowledge', format: meta.format, articles: meta.articles, items: meta.items, facts: meta.facts, knowledgeBytes: meta.knowledgeBytes, floor };
}

/** Whether a table's binding matches a store's meta.json. */
export function boundTo(table, meta) {
  const b = table && table.meta;
  if (!b || !meta) return false;
  return b.store === 'knowledge' && b.format === meta.format && b.articles === meta.articles && b.items === meta.items && b.facts === meta.facts && b.knowledgeBytes === meta.knowledgeBytes;
}

// ------------------------------------------------------------------ the fill from a store
/**
 * The entry the knowledge tier gives "What is <title>?", computed exactly as act/prompt.mjs
 * knowledgeAnswer() computes its answer: store.answer() on the same question with the same pool,
 * the first answer's noun phrase and article title, and confidenceOf() over the same list.
 * @param {KnowledgeStore} store
 * @param {string} title
 * @param {number} [pool]
 * @returns {{answer: string, title: string, confidence: number, item: number, note: string}|null} null when the tier offers nothing
 */
export function titleEntry(store, title, pool = 40) {
  const res = store.answer('What is ' + title + '?', { pool });
  const top = res.answers[0];
  if (!top) return null;
  return { answer: String(top.np), title: String(top.title), confidence: confidenceOf(res.answers), item: Number.isInteger(top.item) ? top.item : -1, note: top.kind == null ? null : String(top.kind) };
}

// One worker: its own store, a range of articles at a time, typed arrays back (fresh ones, each
// owning exactly its buffer, moved rather than copied).
function fillWorker() {
  const { storeDir, pool } = workerData;
  const store = KnowledgeStore.open(storeDir);
  parentPort.on('message', (msg) => {
    if (msg.stop) { store.close(); parentPort.close(); return; }
    const { start, end } = msg;
    const keys = new Uint32Array(4 * (end - start)), conf = new Float32Array(end - start), item = new Int32Array(end - start);
    const art = new Int32Array(end - start);
    const asked = [], answers = [], titles = [], notes = [];
    let n = 0;
    for (let a = start; a < end; a++) {
      const t = store.title(a);
      const e = titleEntry(store, t, pool);
      if (!e) continue;
      const k = factKey(t, 'what');
      keys[4 * n] = k.hi; keys[4 * n + 1] = k.lo; keys[4 * n + 2] = k.vh; keys[4 * n + 3] = k.vl;
      conf[n] = e.confidence; item[n] = e.item; art[n] = a;
      asked.push(t); answers.push(e.answer); titles.push(e.title); notes.push(e.note);
      n++;
    }
    const out = { start, end, n, keys: keys.slice(0, 4 * n), conf: conf.slice(0, n), item: item.slice(0, n), art: art.slice(0, n), asked, answers, titles, notes };
    parentPort.postMessage(out, [out.keys.buffer, out.conf.buffer, out.item.buffer, out.art.buffer]);
  });
}
if (!isMainThread && workerData && workerData.directFill === true) fillWorker();

/**
 * Ask the knowledge tier "What is <title>?" for every article in [from, to) on `workers` threads
 * (the BUDGETS rule: at most 2), and return every answer it gave as columns.
 * @param {object} o { storeDir, pool, from, to, workers, chunk, heapMb, onProgress(done, total, entries) }
 * @returns {Promise<{n, keys: Uint32Array, conf: Float32Array, item: Int32Array, art: Int32Array, asked: string[], answers: string[], titles: string[], notes: (string|null)[], ms: number}>}
 */
export function fillFromStore(o) {
  const workers = Math.max(1, Math.min(2, o.workers ?? 2));
  const chunk = o.chunk ?? 1000, from = o.from ?? 0, to = o.to;
  const ranges = [];
  for (let s = from; s < to; s += chunk) ranges.push([s, Math.min(to, s + chunk)]);
  const parts = new Array(ranges.length);
  const t0 = Date.now();
  let next = 0, done = 0, entries = 0, live = 0;
  return new Promise((resolve, reject) => {
    let failed = false;
    const finish = () => {
      let n = 0;
      for (const p of parts) n += p.n;
      const out = { n, keys: new Uint32Array(4 * n), conf: new Float32Array(n), item: new Int32Array(n), art: new Int32Array(n), asked: [], answers: [], titles: [], notes: [], ms: Date.now() - t0 };
      let at = 0;
      for (const p of parts) {
        out.keys.set(p.keys, 4 * at); out.conf.set(p.conf, at); out.item.set(p.item, at); out.art.set(p.art, at);
        for (let i = 0; i < p.n; i++) { out.asked.push(p.asked[i]); out.answers.push(p.answers[i]); out.titles.push(p.titles[i]); out.notes.push(p.notes[i]); }
        at += p.n;
      }
      resolve(out);
    };
    if (!ranges.length) { finish(); return; }
    for (let w = 0; w < Math.min(workers, ranges.length); w++) {
      const wk = new Worker(new URL(import.meta.url), { workerData: { directFill: true, storeDir: o.storeDir, pool: o.pool ?? 40 }, resourceLimits: { maxOldGenerationSizeMb: o.heapMb ?? 1500 } });
      live++;
      const give = () => {
        if (next < ranges.length) { const j = next++; wk.postMessage({ start: ranges[j][0], end: ranges[j][1], j }); wk._j = j; }
        else wk.postMessage({ stop: true });
      };
      wk.on('message', (m) => {
        parts[wk._j] = m;
        done += m.end - m.start; entries += m.n;
        if (o.onProgress) o.onProgress(done, to - from, entries);
        give();
      });
      wk.on('error', (e) => { if (!failed) { failed = true; reject(e); } });
      wk.on('exit', () => { live--; if (live === 0 && !failed) finish(); });
      give();
    }
  });
}

/**
 * A table from fill columns (and, optionally, the exact entries of another table).
 * @param {object} cols fillFromStore()'s result
 * @param {object} o { meta, keep(i): false drops column row i, exactFrom: a DirectTable whose exact entries are copied }
 * @returns {DirectTable}
 */
export function tableFromColumns(cols, o = {}) {
  const t = new DirectTable({ capacity: cols.n + 1024, meta: o.meta ?? null });
  if (o.exactFrom) {
    const src = o.exactFrom;
    for (let s = 0; s < src.cap; s++) {
      const r = src.ref[s];
      if (r < 0 || src.src[r] !== 0) continue;
      t.set({ hi: src.kh[s], lo: src.kl[s], vh: src.vh[s], vl: src.vl[s] }, src.entry(r));
    }
  }
  for (let i = 0; i < cols.n; i++) {
    if (o.keep && !o.keep(i)) continue;
    t.set({ hi: cols.keys[4 * i], lo: cols.keys[4 * i + 1], vh: cols.keys[4 * i + 2], vl: cols.keys[4 * i + 3] },
      { source: 'memory', answer: cols.answers[i], title: cols.titles[i], confidence: cols.conf[i], item: cols.item[i], note: cols.notes[i] });
  }
  return t;
}
