// memory/episodic.mjs. EPISODIC MEMORY, append only up to a bound.
// Every episode is a hypervector key plus a value, a wall time, a generation and an
// optional list of item names. Below the bound nothing is deleted: forgetting means going
// cold, which removes an episode from similarity retrieval but keeps it on the record. At
// the bound (maxEpisodes) the oldest cold episodes leave the record first, then the oldest
// warm ones, until three quarters of the bound remain; the ledger keeps what it logged.
// The slot arrays never pass the bound: capacity starts at min(capacity, maxEpisodes), a grow
// doubles up to the bound and no further, and a restore allocates at most the bound. Before
// 2026-09-25 capacity doubled past it (65536 bound: 8192 -> 16384 -> 32768 keys of 8192 lanes)
// and EpisodicStore.from restored with min(n, max) * 2, so a 512 MB container passed its RSS cap
// (bench/cloud.mjs, 14 restarts in 300 s). maxEpisodes is a per store option; EPISODIC_DEFAULTS
// stays frozen, and a deployment names its own bound (seeds/whole.mjs, BRAIN_EPISODES_MAX).
// Without the bound the soak's tier held 176238 episodes at t=4000, 1.84 GB of a 2.64 GB
// checkpoint, growing 5.6x between t=2000 and t=4000 (2026-09-17).
//
// The index has three parts, all rebuilt deterministically from the seed:
//   1. a bit signature per episode, sampled at fixed coordinates of the hypervector,
//      so an approximate distance is a handful of XOR and popcount operations;
//   2. banded buckets over that signature, so a query only looks at episodes that
//      already agree with it somewhere, instead of at all of them;
//   3. the time axis, which is a sorted array while episodes arrive in order, so a
//      time range is two binary searches.
// Candidates are ranked by signature distance, then the head of that ranking is
// rescored exactly with sim() on the full hypervector. The exact full scan is still
// available through { scan: true } and is what the scale test grades the index against.
import { D, sim, dataToJSON, dataFromJSON, release } from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';

export const EPISODIC_DEFAULTS = Object.freeze({
  d: D,
  capacity: 1024,     // starting slot count, doubled on demand
  seed: 'episodic',   // fixes the signature coordinates
  bands: 16,          // bucket tables
  bandBits: 8,        // bits per band, must divide 32
  rescore: 64,        // candidates that get an exact sim()
  minCandidates: 32,  // below this the query falls back to ranking every episode
  maxEpisodes: 1 << 16, // the record's bound; at it the oldest cold, then the oldest warm, leave
});

/** popcount of a 32 bit word. @param {number} x @returns {number} */
export function popcount32(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  return (Math.imul(x, 0x01010101) >>> 24);
}

export class EpisodicStore {
  /**
   * @param {object} [opts] see EPISODIC_DEFAULTS
   */
  constructor(opts = {}) {
    const o = { ...EPISODIC_DEFAULTS, ...opts };
    if (32 % o.bandBits !== 0) throw new Error('episodic: bandBits must divide 32, got ' + o.bandBits);
    if (o.bandBits > 16) throw new Error('episodic: bandBits above 16 makes buckets too sparse to be worth a map');
    this.d = o.d;
    this.seed = o.seed;
    this.bands = o.bands;
    this.bandBits = o.bandBits;
    this.sigBits = o.bands * o.bandBits;
    this.words = Math.ceil(this.sigBits / 32);
    this.bandMask = (1 << o.bandBits) - 1;
    this.rescore = o.rescore;
    this.minCandidates = o.minCandidates;
    this.maxEpisodes = Math.max(16, o.maxEpisodes);

    this.n = 0;
    this.cap = Math.min(Math.max(16, o.capacity), this.maxEpisodes); // never allocated past the bound
    this.keys = new Int8Array(this.cap * this.d);
    this.sig = new Uint32Array(this.cap * this.words);
    this.times = new Float64Array(this.cap);
    this.gens = new Float64Array(this.cap);
    this.cold = new Uint8Array(this.cap);
    this.values = [];
    this.items = [];

    // signature coordinates, deterministic in the seed so a restore reproduces them
    const rng = new RNG('episodic-sig:' + this.seed);
    this.pos = new Uint32Array(this.sigBits);
    for (let j = 0; j < this.sigBits; j++) this.pos[j] = rng.int(this.d);

    this.buckets = Array.from({ length: this.bands }, () => new Map());
    this.itemIndex = new Map();
    this._mark = new Int32Array(this.cap);
    this._stamp = 0;
    this._scratch = new Uint32Array(this.words);
    this.timesSorted = true;
    this.stats = { appended: 0, queries: 0, scans: 0, candidates: 0, rescored: 0, cooled: 0, evicted: 0, compactions: 0 };
  }

  /** @returns {number} episodes on the record, cold ones included */
  size() { return this.n; }

  _grow() {
    // doubling stops AT the bound: append() compacts at n >= maxEpisodes before it grows, so a
    // full store at its bound never reaches here
    const cap = Math.min(this.cap * 2, this.maxEpisodes);
    if (cap <= this.cap) throw new Error('episodic: capacity ' + this.cap + ' is at the bound ' + this.maxEpisodes + ' and the store did not compact');
    const keys = new Int8Array(cap * this.d); keys.set(this.keys.subarray(0, this.n * this.d));
    const sig = new Uint32Array(cap * this.words); sig.set(this.sig.subarray(0, this.n * this.words));
    const times = new Float64Array(cap); times.set(this.times.subarray(0, this.n));
    const gens = new Float64Array(cap); gens.set(this.gens.subarray(0, this.n));
    const cold = new Uint8Array(cap); cold.set(this.cold.subarray(0, this.n));
    const mark = new Int32Array(cap); mark.set(this._mark.subarray(0, this.n));
    this.keys = keys; this.sig = sig; this.times = times; this.gens = gens; this.cold = cold; this._mark = mark;
    this.cap = cap;
  }

  _sign(key, out, off) {
    for (let w = 0; w < this.words; w++) out[off + w] = 0;
    for (let j = 0; j < this.sigBits; j++) {
      if (key[this.pos[j]] > 0) out[off + (j >>> 5)] |= (1 << (j & 31));
    }
  }

  _band(sigArr, off, b) {
    const bit = b * this.bandBits;
    return (sigArr[off + (bit >>> 5)] >>> (bit & 31)) & this.bandMask;
  }

  /**
   * Append one episode. Nothing already stored is modified.
   * @param {object} ep { key: Int8Array, value?: any, items?: string[], t?: number, gen?: number, cold?: boolean }
   * @returns {number} the episode id
   */
  append(ep) {
    const key = ep.key;
    if (!key || key.length !== this.d) throw new Error('episodic: key must be an hv of length ' + this.d);
    if (this.n >= this.maxEpisodes) this._compact();
    if (this.n === this.cap) this._grow();
    const id = this.n++;
    this.keys.set(key, id * this.d);
    this._sign(key, this.sig, id * this.words);
    const t = ep.t ?? 0;
    if (id > 0 && t < this.times[id - 1]) this.timesSorted = false;
    this.times[id] = t;
    this.gens[id] = ep.gen ?? 0;
    this.cold[id] = ep.cold ? 1 : 0;
    this.values.push(ep.value ?? null);
    const items = ep.items ? [...ep.items] : [];
    this.items.push(items);
    for (let b = 0; b < this.bands; b++) {
      const v = this._band(this.sig, id * this.words, b);
      const m = this.buckets[b];
      const list = m.get(v);
      if (list) list.push(id); else m.set(v, [id]);
    }
    for (const name of new Set(items)) {
      const l = this.itemIndex.get(name);
      if (l) l.push(id); else this.itemIndex.set(name, [id]);
    }
    this.stats.appended++;
    return id;
  }

  // At the bound: the oldest cold episodes leave first, then the oldest warm ones, until
  // three quarters of the bound remain. Ids are positions, so survivors are renumbered and
  // the index is rebuilt; nothing holds an id across a tick (retrieval records are per call).
  _compact() {
    const keep = Math.floor(this.maxEpisodes * 3 / 4);
    const drop = this.n - keep;
    if (drop <= 0) return 0;
    const order = new Array(this.n);
    for (let id = 0; id < this.n; id++) order[id] = id;
    order.sort((a, b) => (this.cold[b] - this.cold[a]) || (this.times[a] - this.times[b]) || (a - b));
    const gone = new Uint8Array(this.n);
    for (let i = 0; i < drop; i++) gone[order[i]] = 1;
    const values = [], items = [];
    let w = 0;
    for (let id = 0; id < this.n; id++) {
      if (gone[id]) continue;
      if (w !== id) {
        this.keys.copyWithin(w * this.d, id * this.d, (id + 1) * this.d);
        this.times[w] = this.times[id]; this.gens[w] = this.gens[id]; this.cold[w] = this.cold[id];
      }
      values.push(this.values[id]); items.push(this.items[id]);
      w++;
    }
    this.n = w; this.values = values; this.items = items;
    this._reindex();
    this.stats.evicted += drop;
    this.stats.compactions++;
    return drop;
  }

  // Signatures, buckets and the item index rebuilt from the keys in place.
  _reindex() {
    for (const m of this.buckets) m.clear();
    this.itemIndex.clear();
    this._mark.fill(0); this._stamp = 0;
    this.timesSorted = true;
    for (let id = 0; id < this.n; id++) {
      this._sign(this.keyAt(id), this.sig, id * this.words);
      if (id > 0 && this.times[id] < this.times[id - 1]) this.timesSorted = false;
      for (let b = 0; b < this.bands; b++) {
        const v = this._band(this.sig, id * this.words, b);
        const l = this.buckets[b].get(v);
        if (l) l.push(id); else this.buckets[b].set(v, [id]);
      }
      for (const name of new Set(this.items[id])) {
        const l = this.itemIndex.get(name);
        if (l) l.push(id); else this.itemIndex.set(name, [id]);
      }
    }
  }

  /**
   * Zero copy view of an episode key. Do not hold it across an append, the backing
   * buffer is reallocated when the store grows. Use episode(id).key for a copy.
   * @param {number} id
   * @returns {Int8Array}
   */
  keyAt(id) { return this.keys.subarray(id * this.d, (id + 1) * this.d); }

  /** @param {number} id @returns {string[]} the item names recorded with this episode */
  itemsOf(id) { return this.items[id]; }

  /**
   * A full episode record with a copied key.
   * @param {number} id
   * @returns {object|null}
   */
  episode(id) {
    if (id < 0 || id >= this.n) return null;
    return {
      id, t: this.times[id], gen: this.gens[id], value: this.values[id],
      items: this.items[id], cold: this.cold[id] === 1, key: this.keyAt(id).slice(),
    };
  }

  _record(id, s) {
    return { id, sim: s, t: this.times[id], gen: this.gens[id], value: this.values[id], items: this.items[id], cold: this.cold[id] === 1 };
  }

  _filter({ from = null, to = null, includeCold = false }) {
    if (from === null && to === null && includeCold) return null;
    return (id) => {
      if (!includeCold && this.cold[id] === 1) return false;
      const t = this.times[id];
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      return true;
    };
  }

  /**
   * Retrieve the k most similar episodes to a query hypervector.
   * @param {Int8Array} query
   * @param {object} [opts] { k, minSim, scan, rescore, from, to, includeCold }
   * @returns {object[]} records { id, sim, t, gen, value, items, cold }, best first
   */
  retrieve(query, opts = {}) {
    const k = opts.k ?? 1;
    const minSim = opts.minSim ?? -Infinity;
    const filter = this._filter(opts);
    this.stats.queries++;
    if (this.n === 0) return [];
    if (opts.scan) {
      this.stats.scans++;
      const out = [];
      for (let id = 0; id < this.n; id++) {
        if (filter && !filter(id)) continue;
        const s = sim(this.keyAt(id), query);
        if (s >= minSim) out.push(this._record(id, s));
      }
      out.sort((a, b) => b.sim - a.sim);
      return out.slice(0, k);
    }
    const qs = this._scratch;
    this._sign(query, qs, 0);
    const ids = this._candidates(qs, filter);
    const rescore = Math.max(k, opts.rescore ?? this.rescore);
    return this._rank(ids, qs, query, k, minSim, rescore, filter);
  }

  _candidates(qs, filter) {
    this._stamp++;
    const stamp = this._stamp;
    const out = [];
    for (let b = 0; b < this.bands; b++) {
      const list = this.buckets[b].get(this._band(qs, 0, b));
      if (!list) continue;
      for (let i = 0; i < list.length; i++) {
        const id = list[i];
        if (this._mark[id] === stamp) continue;
        this._mark[id] = stamp;
        if (filter && !filter(id)) continue;
        out.push(id);
      }
    }
    this.stats.candidates += out.length;
    return out;
  }

  _sigDist(id, qs) {
    const off = id * this.words;
    let d = 0;
    for (let w = 0; w < this.words; w++) d += popcount32(this.sig[off + w] ^ qs[w]);
    return d;
  }

  // ids === null means "every episode". Ranking is by signature distance, then the head
  // of that ranking is rescored with the exact similarity.
  _rank(ids, qs, query, k, minSim, rescore, filter) {
    let pool = ids;
    if (pool === null || pool.length < Math.max(this.minCandidates, k * 4)) {
      pool = [];
      for (let id = 0; id < this.n; id++) { if (filter && !filter(id)) continue; pool.push(id); }
    }
    if (pool.length === 0) return [];
    const scored = new Array(pool.length);
    for (let i = 0; i < pool.length; i++) scored[i] = [pool[i], this._sigDist(pool[i], qs)];
    scored.sort((a, b) => a[1] - b[1]);
    const head = Math.min(rescore, scored.length);
    this.stats.rescored += head;
    const out = [];
    for (let i = 0; i < head; i++) {
      const id = scored[i][0];
      const s = sim(this.keyAt(id), query);
      if (s >= minSim) out.push(this._record(id, s));
    }
    out.sort((a, b) => b.sim - a.sim);
    return out.slice(0, k);
  }

  // First id whose time is >= t. Only valid while timesSorted.
  _lowerBound(t) {
    let lo = 0, hi = this.n;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (this.times[mid] < t) lo = mid + 1; else hi = mid; }
    return lo;
  }

  /**
   * Every episode with t0 <= t <= t1, oldest first.
   * @param {number} t0
   * @param {number} t1
   * @param {object} [opts] { limit, includeCold }
   * @returns {object[]} episode records without a key copy
   */
  between(t0, t1, opts = {}) {
    const limit = opts.limit ?? Infinity;
    const includeCold = opts.includeCold ?? true;
    const out = [];
    if (this.timesSorted) {
      for (let id = this._lowerBound(t0); id < this.n && this.times[id] <= t1 && out.length < limit; id++) {
        if (!includeCold && this.cold[id] === 1) continue;
        out.push(this._record(id, 0));
      }
      return out;
    }
    for (let id = 0; id < this.n && out.length < limit; id++) {
      if (!includeCold && this.cold[id] === 1) continue;
      const t = this.times[id];
      if (t >= t0 && t <= t1) out.push(this._record(id, 0));
    }
    return out;
  }

  /**
   * Episode ids inside a time window, used by consolidation.
   * @param {number} [t0]
   * @param {number} [t1]
   * @param {object} [opts] { includeCold }
   * @returns {number[]}
   */
  idsInRange(t0 = -Infinity, t1 = Infinity, opts = {}) {
    const includeCold = opts.includeCold ?? true;
    const out = [];
    if (this.timesSorted && Number.isFinite(t0)) {
      for (let id = this._lowerBound(t0); id < this.n && this.times[id] <= t1; id++) {
        if (!includeCold && this.cold[id] === 1) continue;
        out.push(id);
      }
      return out;
    }
    for (let id = 0; id < this.n; id++) {
      if (!includeCold && this.cold[id] === 1) continue;
      const t = this.times[id];
      if (t >= t0 && t <= t1) out.push(id);
    }
    return out;
  }

  /** @param {string} name @returns {number[]} ids of episodes that recorded this item */
  byItem(name) { return this.itemIndex.get(name) || []; }

  /**
   * Forgetting without deletion: mark every episode older than t as cold, which drops
   * it out of similarity retrieval while leaving the record intact.
   * @param {number} t horizon time
   * @returns {number} how many episodes went cold on this call
   */
  cool(t) {
    let c = 0;
    for (let id = 0; id < this.n; id++) {
      if (this.cold[id] === 0 && this.times[id] < t) { this.cold[id] = 1; c++; }
    }
    this.stats.cooled += c;
    return c;
  }

  /** @param {number} id @returns {boolean} whether the episode was cold and is now warm */
  warm(id) { if (this.cold[id] === 1) { this.cold[id] = 0; return true; } return false; }

  /** @returns {object} counts that describe the store and its index */
  describe() {
    let cold = 0;
    for (let id = 0; id < this.n; id++) cold += this.cold[id];
    let buckets = 0;
    for (const m of this.buckets) buckets += m.size;
    return {
      n: this.n, d: this.d, cold, capacity: this.cap, maxEpisodes: this.maxEpisodes,
      bands: this.bands, bandBits: this.bandBits, sigBits: this.sigBits, words: this.words,
      buckets, timesSorted: this.timesSorted, items: this.itemIndex.size, stats: { ...this.stats },
    };
  }

  /**
   * JSON safe form. The signature and the buckets are not written out, they are rebuilt
   * from the seed on restore, which is also what guarantees they match the keys.
   * @returns {object}
   */
  serialize() {
    return {
      version: 1, d: this.d, seed: this.seed, bands: this.bands, bandBits: this.bandBits,
      rescore: this.rescore, minCandidates: this.minCandidates, maxEpisodes: this.maxEpisodes, n: this.n,
      // one string per episode: as one string the keys passed Node's string cap (2^29
      // characters) at 49k episodes and the soak's final checkpoint at t=2593 was lost
      // (2026-09-17); a list of short strings streams out and back in at any size
      keys: Array.from({ length: this.n }, (_, id) => dataToJSON('hv', this.keyAt(id))),
      times: Array.from(this.times.subarray(0, this.n)),
      gens: Array.from(this.gens.subarray(0, this.n)),
      cold: Array.from(this.cold.subarray(0, this.n)),
      values: this.values, items: this.items, stats: { ...this.stats },
    };
  }

  /**
   * A serialized store put under a new bound, without decoding a key. When n passes the bound,
   * the eviction rule of _compact picks who leaves, in one pass: cold before warm, then the
   * oldest t, then the lowest id; the survivors keep their order and exactly maxEpisodes remain.
   * @param {object} j serialize() output
   * @param {number} maxEpisodes the new bound (at least 16, as in the constructor)
   * @returns {object} a serialize() shaped object
   */
  static bounded(j, maxEpisodes) {
    const m = Number(maxEpisodes);
    if (!Number.isFinite(m) || m < 1) throw new Error('episodic: maxEpisodes must be a positive number, got ' + JSON.stringify(maxEpisodes));
    const bound = Math.max(16, Math.floor(m));
    const n = j.n;
    if (n <= bound) return { ...j, maxEpisodes: bound };
    const cold = (i) => (j.cold[i] === 1 ? 1 : 0);
    const order = Array.from({ length: n }, (_, i) => i);
    order.sort((a, b) => (cold(b) - cold(a)) || (j.times[a] - j.times[b]) || (a - b));
    const gone = new Uint8Array(n);
    for (let i = 0; i < n - bound; i++) gone[order[i]] = 1;
    const keep = [];
    for (let i = 0; i < n; i++) if (!gone[i]) keep.push(i);
    const pick = (a) => keep.map((i) => a[i]);
    let keys;
    if (typeof j.keys === 'string') { // snapshots before 2026-09-17: one string for every key
      const all = dataFromJSON('hv', j.keys);
      keys = keep.map((i) => dataToJSON('hv', all.subarray(i * j.d, (i + 1) * j.d)));
    } else keys = pick(j.keys);
    const stats = { ...(j.stats || {}) };
    stats.evicted = (stats.evicted || 0) + (n - bound);
    return { ...j, maxEpisodes: bound, n: keep.length, keys, times: pick(j.times), gens: pick(j.gens), cold: pick(j.cold), values: pick(j.values), items: pick(j.items), stats };
  }

  /**
   * Rebuild from serialize(). The capacity restored is at most the bound: min(bound, 2n).
   * @param {object} j
   * @param {object} [opts] { maxEpisodes }: a bound that replaces the recorded one; above it the
   *   eviction rule keeps exactly maxEpisodes (see bounded)
   * @returns {EpisodicStore}
   */
  static from(j, opts = {}) {
    if (opts && opts.maxEpisodes !== undefined && opts.maxEpisodes !== null) j = EpisodicStore.bounded(j, opts.maxEpisodes);
    const max = Math.max(16, j.maxEpisodes ?? EPISODIC_DEFAULTS.maxEpisodes);
    const s = new EpisodicStore({
      d: j.d, seed: j.seed, bands: j.bands, bandBits: j.bandBits,
      rescore: j.rescore, minCandidates: j.minCandidates, maxEpisodes: max,
      capacity: Math.min(max, Math.max(16, j.n * 2)),
    });
    // snapshots before 2026-09-17 hold every key in one string
    const keys = typeof j.keys === 'string' ? dataFromJSON('hv', j.keys) : null;
    for (let id = 0; id < j.n; id++) {
      const key = keys ? keys.subarray(id * j.d, (id + 1) * j.d) : dataFromJSON('hv', j.keys[id]);
      s.append({ key, value: j.values[id], items: j.items[id], t: j.times[id], gen: j.gens[id], cold: j.cold[id] === 1 });
      // append() copied the lanes into this store's own flat keys array (see append: keys.set)
      // and nothing else was handed the vector, so a per key slot goes back at that last read.
      // The one key vector case is a subarray of a vector this loop does not own, so it is
      // left alone: releasing a subarray that starts at a slot would free somebody else's slot.
      if (!keys) release(key);
    }
    s.stats = { ...s.stats, ...(j.stats || {}) };
    return s;
  }
}
