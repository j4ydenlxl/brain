// memory/sequence.mjs. SEQUENCE MEMORY, order as an algebra.
// A sequence is encoded by permutation chaining: item i is rolled by i * stride and the
// rolled items are bundled into one hypervector. Position is therefore carried by the
// permutation, not by any index stored on the side, so reading position i back is a roll
// in the other direction followed by a cleanup against the item codebook.
//
//   encode([a, b, c]) = bundle( p^0(a), p^1(b), p^2(c) )
//   decodeAt(hv, 1)   = cleanup( p^-1(hv) )  which lands on b
//
// Prediction has two routes. The first is recall: match a cue against the stored
// sequences and read the item one position past the cue. The second is the transition
// memory, a single hypervector holding bind(a, p(b)) for every adjacent pair seen, which
// answers "what usually follows a" without knowing which sequence a came from.
import { D, ItemMemory, bind, bundle, permute, sim, dataToJSON, dataFromJSON } from '../core/signal.mjs';

export const SEQUENCE_DEFAULTS = Object.freeze({
  d: D,
  stride: 1,        // permutation applied per position
  threshold: 0.15,  // minimum similarity for a recall to count as a match
  itemThreshold: 0.05, // minimum similarity for a decoded position to name an item
});

export class SequenceMemory {
  /** @param {object} [opts] see SEQUENCE_DEFAULTS */
  constructor(opts = {}) {
    const o = { ...SEQUENCE_DEFAULTS, ...opts };
    this.d = o.d;
    this.stride = o.stride;
    this.threshold = o.threshold;
    this.itemThreshold = o.itemThreshold;
    this.items = opts.itemMemory instanceof ItemMemory ? opts.itemMemory : new ItemMemory(this.d);
    this.records = [];
    this.byName = new Map();
    this.transitions = [];     // [fromName, toName] pairs, kept so the bundle can be rebuilt
    this.transHv = null;       // bundle of bind(from, p(to))
    this.refs = new Map();     // item name -> stored records that use it, so release() keeps them
    this.stats = { stored: 0, recalls: 0, hits: 0, predictions: 0, decodes: 0 };
  }

  /**
   * Drop codebook items that nothing refers to any more: no stored record uses them and
   * they are not in keep (the names of an open run). A named item comes back identical from
   * its seed, and an item set from a hypervector that no record and no run holds can never be
   * asked for again, so nothing observable changes; only the scan gets shorter. Without this
   * the codebook grew by every unnamed item a brain ever saw (5509 after 600 ticks, 2026-09-17).
   * @param {Iterable<string>} names candidates
   * @param {Set<string>} [keep] names still in use
   * @returns {number} items released
   */
  release(names, keep = null) {
    let n = 0;
    for (const name of names) {
      if (this.refs.has(name) || (keep && keep.has(name))) continue;
      if (this.items.delete(name)) n++;
    }
    return n;
  }
  _ref(itemNames, by) {
    for (const nm of itemNames) {
      const c = (this.refs.get(nm) || 0) + by;
      if (c > 0) this.refs.set(nm, c); else this.refs.delete(nm);
    }
  }

  /** @returns {number} sequences stored */
  size() { return this.records.length; }
  /** @param {string} name @returns {boolean} */
  has(name) { return this.byName.has(name); }
  /** @returns {string[]} every sequence name in insertion order */
  names() { return this.records.map(r => r.name); }

  /**
   * The hypervector of a named item, created deterministically on first use.
   * @param {string} name
   * @returns {Int8Array}
   */
  item(name) { return this.items.get(name); }

  /**
   * Chain encode a list of items into one hypervector.
   * @param {Array<string|Int8Array>} items names or hypervectors
   * @param {number} [offset] position of the first item in the chain
   * @returns {Int8Array}
   */
  encode(items, offset = 0) {
    if (items.length === 0) throw new Error('sequence: cannot encode an empty sequence');
    const rolled = items.map((it, i) => permute(this._hv(it), (offset + i) * this.stride));
    return bundle(rolled);
  }

  _hv(it) { return typeof it === 'string' ? this.items.get(it) : it; }

  /**
   * Store a sequence under a name.
   * @param {string} name
   * @param {Array<string|Int8Array>} items
   * @param {object} [opts] { t, gen }
   * @returns {object} the stored record
   */
  store(name, items, opts = {}) {
    if (this.byName.has(name)) throw new Error('sequence: already stored under ' + name);
    const itemNames = items.map((it, i) => (typeof it === 'string' ? it : name + ':' + i));
    for (let i = 0; i < items.length; i++) if (typeof items[i] !== 'string') this.items.set(itemNames[i], items[i]);
    const rec = {
      name, n: items.length, itemNames,
      hv: this.encode(itemNames),
      t: opts.t ?? 0, gen: opts.gen ?? 0, uses: 0,
    };
    this.records.push(rec);
    this.byName.set(name, rec);
    this._ref(itemNames, 1);
    for (let i = 0; i + 1 < itemNames.length; i++) this.transitions.push([itemNames[i], itemNames[i + 1]]);
    this.transHv = null;
    this.stats.stored++;
    return rec;
  }

  /** @param {string} name @returns {object|null} the stored record */
  get(name) { return this.byName.get(name) ?? null; }

  /**
   * Remove a sequence and every transition it contributed.
   * @param {string} name
   * @returns {boolean} whether something was removed
   */
  forget(name) {
    const rec = this.byName.get(name);
    if (!rec) return false;
    this.records.splice(this.records.indexOf(rec), 1);
    this.byName.delete(name);
    this._ref(rec.itemNames, -1);
    const gone = new Set();
    for (let i = 0; i + 1 < rec.itemNames.length; i++) gone.add(rec.itemNames[i] + '\0' + rec.itemNames[i + 1]);
    this.transitions = this.transitions.filter(([a, b]) => !gone.has(a + '\0' + b));
    this.transHv = null;
    return true;
  }

  /**
   * Read position i out of a chain encoded hypervector.
   * @param {Int8Array} hv
   * @param {number} i position
   * @returns {{name: string|null, sim: number}}
   */
  decodeAt(hv, i) {
    this.stats.decodes++;
    const unrolled = permute(hv, -i * this.stride);
    const n = this.items.nearest(unrolled);
    if (!n) return { name: null, sim: 0 };
    return { name: n[1] >= this.itemThreshold ? n[0] : null, sim: n[1] };
  }

  /**
   * Read a whole sequence back out of a hypervector, position by position.
   * @param {Int8Array} hv
   * @param {number} n how many positions to read
   * @returns {Array<{name: string|null, sim: number}>}
   */
  decodeAll(hv, n) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(this.decodeAt(hv, i));
    return out;
  }

  /**
   * Recall a stored sequence from a cue, which is a prefix of its items.
   * The cue is chain encoded at the same positions and matched against every record.
   * The returned items are decoded out of the record hypervector, not copied from the
   * stored name list, so a match that cannot be decoded shows up as exact: false.
   * @param {Array<string|Int8Array>} cue
   * @param {object} [opts] { threshold, offset, decode }
   * @returns {{name: string|null, sim: number, items: Array<string|null>, exact: boolean, stored: string[]|null}}
   */
  recall(cue, opts = {}) {
    this.stats.recalls++;
    const threshold = opts.threshold ?? this.threshold;
    const offset = opts.offset ?? 0;
    if (cue.length === 0 || this.records.length === 0) return { name: null, sim: 0, items: [], exact: false, stored: null };
    const q = this.encode(cue, offset);
    let best = null, bs = -Infinity;
    for (const rec of this.records) {
      const s = sim(rec.hv, q);
      if (s > bs) { bs = s; best = rec; }
    }
    if (!best || bs < threshold) return { name: null, sim: bs === -Infinity ? 0 : bs, items: [], exact: false, stored: null };
    best.uses++;
    this.stats.hits++;
    const decode = opts.decode ?? true;
    const items = decode ? this.decodeAll(best.hv, best.n).map(x => x.name) : [...best.itemNames];
    const exact = items.length === best.itemNames.length && items.every((x, i) => x === best.itemNames[i]);
    return { name: best.name, sim: bs, items, exact, stored: [...best.itemNames] };
  }

  /** Rebuild the transition bundle after a store or a forget. @returns {Int8Array|null} */
  _transitionHv() {
    if (this.transHv) return this.transHv;
    if (this.transitions.length === 0) return null;
    const terms = this.transitions.map(([a, b]) => bind(this.items.get(a), permute(this.items.get(b), this.stride)));
    this.transHv = bundle(terms);
    return this.transHv;
  }

  /**
   * Predict the item that follows a cue. Tries recall first, which is exact when the cue
   * identifies a stored sequence, and falls back to the transition memory otherwise.
   * @param {Array<string|Int8Array>} cue
   * @param {object} [opts] { threshold }
   * @returns {{name: string|null, sim: number, via: 'recall'|'transition'|'none', sequence: string|null}}
   */
  predictNext(cue, opts = {}) {
    this.stats.predictions++;
    if (cue.length === 0) return { name: null, sim: 0, via: 'none', sequence: null };
    const r = this.recall(cue, { ...opts, decode: false });
    if (r.name !== null) {
      const rec = this.byName.get(r.name);
      if (cue.length < rec.n) {
        const d = this.decodeAt(rec.hv, cue.length);
        return { name: d.name, sim: d.sim, via: 'recall', sequence: r.name };
      }
      return { name: null, sim: r.sim, via: 'recall', sequence: r.name };
    }
    const T = this._transitionHv();
    if (!T) return { name: null, sim: 0, via: 'none', sequence: null };
    const last = this._hv(cue[cue.length - 1]);
    const unbound = permute(bind(last, T), -this.stride);
    const n = this.items.nearest(unbound);
    if (!n) return { name: null, sim: 0, via: 'transition', sequence: null };
    return { name: n[1] >= this.itemThreshold ? n[0] : null, sim: n[1], via: 'transition', sequence: null };
  }

  /** @returns {object} JSON safe form */
  serialize() {
    return {
      version: 1, d: this.d, stride: this.stride, threshold: this.threshold, itemThreshold: this.itemThreshold,
      items: this.items.serialize(),
      records: this.records.map(r => ({ name: r.name, n: r.n, itemNames: r.itemNames, hv: dataToJSON('hv', r.hv), t: r.t, gen: r.gen, uses: r.uses })),
      transitions: this.transitions,
      stats: { ...this.stats },
    };
  }

  /**
   * Rebuild from serialize().
   * @param {object} j
   * @returns {SequenceMemory}
   */
  static from(j) {
    const s = new SequenceMemory({ d: j.d, stride: j.stride, threshold: j.threshold, itemThreshold: j.itemThreshold });
    s.items = ItemMemory.from(j.items);
    for (const r of j.records || []) {
      const rec = { name: r.name, n: r.n, itemNames: r.itemNames, hv: Int8Array.from(dataFromJSON('hv', r.hv)), t: r.t, gen: r.gen, uses: r.uses };
      s.records.push(rec);
      s.byName.set(rec.name, rec);
      s._ref(rec.itemNames, 1);
    }
    s.transitions = (j.transitions || []).map(p => [p[0], p[1]]);
    s.transHv = null;
    s.stats = { ...s.stats, ...(j.stats || {}) };
    return s;
  }
}
