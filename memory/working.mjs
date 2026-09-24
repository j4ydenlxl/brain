// memory/working.mjs. WORKING MEMORY, the fastest tier.
// One bounded ring per circuit. Every entry carries a salience that decays exponentially
// with elapsed ticks, so stale content stops competing for attention without anybody
// having to delete it. Sweeping is what finally removes it.
//
// Design contract (DESIGN.md section 8): "working (ring per circuit, seconds)".
import { dataToJSON, dataFromJSON } from '../core/signal.mjs';

export const WORKING_DEFAULTS = Object.freeze({
  capacity: 32,   // entries held per circuit
  tau: 500,       // decay time constant in ticks (1 tick = 1 ms logical)
  floor: 0.05,    // decayed salience below this is swept away
  evict: 'oldest', // 'oldest' keeps a true ring, 'weakest' keeps the most salient
});

/**
 * A bounded ring of recent content for one circuit, with time decayed salience.
 */
export class WorkingMemory {
  /**
   * @param {object} [opts]
   * @param {string} [opts.key] name of the owning circuit, for reporting
   * @param {number} [opts.capacity] maximum entries held at once
   * @param {number} [opts.tau] decay time constant in ticks
   * @param {number} [opts.floor] sweep threshold on decayed salience
   * @param {'oldest'|'weakest'} [opts.evict] which entry loses its slot when full
   */
  constructor(opts = {}) {
    const o = { ...WORKING_DEFAULTS, ...opts };
    this.key = o.key ?? 'default';
    this.capacity = o.capacity;
    this.tau = o.tau;
    this.floor = o.floor;
    this.evict = o.evict;
    this.entries = [];
    this.stats = { pushed: 0, evicted: 0, swept: 0 };
  }

  /** Number of entries currently held. @returns {number} */
  size() { return this.entries.length; }

  /** Drop every entry. @returns {number} how many were dropped */
  clear() { const n = this.entries.length; this.entries = []; return n; }

  /**
   * Push one piece of content into the ring.
   * @param {object} e entry { t, kind, data, salience, cell, port, meta }
   * @returns {object} the stored entry
   */
  push(e) {
    const entry = {
      t: e.t ?? 0,
      kind: e.kind ?? 'event',
      data: e.data ?? null,
      salience: Number.isFinite(e.salience) ? e.salience : 1,
      cell: e.cell ?? null,
      port: e.port ?? 0,
      meta: e.meta ?? null,
    };
    if (this.entries.length >= this.capacity) this._makeRoom(entry.t);
    this.entries.push(entry);
    this.stats.pushed++;
    return entry;
  }

  _makeRoom(now) {
    if (this.evict === 'weakest') {
      let worst = 0, ws = Infinity;
      for (let i = 0; i < this.entries.length; i++) {
        const s = this.salienceAt(this.entries[i], now);
        if (s < ws) { ws = s; worst = i; }
      }
      this.entries.splice(worst, 1);
    } else {
      this.entries.shift();
    }
    this.stats.evicted++;
  }

  /**
   * Salience of an entry after exponential decay.
   * @param {object} entry a stored entry
   * @param {number} now current tick
   * @returns {number} decayed salience
   */
  salienceAt(entry, now) {
    const dt = Math.max(0, (now ?? entry.t) - entry.t);
    return entry.salience * Math.exp(-dt / Math.max(1e-9, this.tau));
  }

  /**
   * Remove every entry whose decayed salience has fallen under the floor.
   * @param {number} now current tick
   * @returns {number} how many entries were removed
   */
  sweep(now) {
    const before = this.entries.length;
    this.entries = this.entries.filter(e => this.salienceAt(e, now) >= this.floor);
    const gone = before - this.entries.length;
    this.stats.swept += gone;
    return gone;
  }

  /**
   * The k most salient entries right now, most salient first.
   * @param {number} now current tick
   * @param {number} [k] how many to return
   * @returns {object[]} entries with a `salience` field already decayed
   */
  top(now, k = 4) {
    return this.entries
      .map(e => ({ ...e, salience: this.salienceAt(e, now) }))
      .sort((a, b) => b.salience - a.salience)
      .slice(0, k);
  }

  /**
   * Every entry, newest last, salience already decayed.
   * @param {number} now current tick
   * @returns {object[]}
   */
  all(now) { return this.entries.map(e => ({ ...e, salience: this.salienceAt(e, now) })); }

  /**
   * The most recent entry, or null.
   * @returns {object|null}
   */
  last() { return this.entries.length ? this.entries[this.entries.length - 1] : null; }

  /**
   * JSON safe form. Typed array payloads go through dataToJSON.
   * @returns {object}
   */
  serialize() {
    return {
      key: this.key, capacity: this.capacity, tau: this.tau, floor: this.floor, evict: this.evict,
      stats: { ...this.stats },
      entries: this.entries.map(e => ({
        t: e.t, kind: e.kind, data: e.data === null ? null : dataToJSON(e.kind, e.data),
        salience: e.salience, cell: e.cell, port: e.port, meta: e.meta,
      })),
    };
  }

  /**
   * Rebuild from serialize().
   * @param {object} j
   * @returns {WorkingMemory}
   */
  static from(j) {
    const w = new WorkingMemory({ key: j.key, capacity: j.capacity, tau: j.tau, floor: j.floor, evict: j.evict });
    w.stats = { ...w.stats, ...(j.stats || {}) };
    w.entries = (j.entries || []).map(e => ({
      t: e.t, kind: e.kind, data: e.data === null ? null : dataFromJSON(e.kind, e.data),
      salience: e.salience, cell: e.cell, port: e.port, meta: e.meta,
    }));
    return w;
  }
}

/**
 * The set of working rings, one per circuit key ("region/circuit").
 */
export class WorkingSet {
  /** @param {object} [defaults] defaults handed to every ring it creates */
  constructor(defaults = {}) {
    this.defaults = { ...WORKING_DEFAULTS, ...defaults };
    this.rings = new Map();
  }

  /**
   * Get the ring for a circuit, creating it on first use.
   * @param {string} key circuit key, conventionally "region/circuit"
   * @param {object} [opts] per ring overrides applied only at creation
   * @returns {WorkingMemory}
   */
  of(key, opts = {}) {
    let r = this.rings.get(key);
    if (!r) { r = new WorkingMemory({ ...this.defaults, ...opts, key }); this.rings.set(key, r); }
    return r;
  }

  /** @returns {boolean} whether a ring exists for this circuit */
  has(key) { return this.rings.has(key); }
  /** @returns {string[]} every circuit key with a ring */
  keys() { return [...this.rings.keys()]; }
  /** @returns {number} total entries held across every ring */
  size() { let n = 0; for (const r of this.rings.values()) n += r.size(); return n; }

  /**
   * Sweep every ring.
   * @param {number} now current tick
   * @returns {number} total entries removed
   */
  sweepAll(now) { let n = 0; for (const r of this.rings.values()) n += r.sweep(now); return n; }

  /** @returns {object} JSON safe form */
  serialize() {
    return { defaults: this.defaults, rings: [...this.rings.values()].map(r => r.serialize()) };
  }

  /**
   * Rebuild from serialize().
   * @param {object} j
   * @returns {WorkingSet}
   */
  static from(j) {
    const s = new WorkingSet(j.defaults || {});
    for (const rj of j.rings || []) s.rings.set(rj.key, WorkingMemory.from(rj));
    return s;
  }
}
