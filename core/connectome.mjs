// core/connectome.mjs: THE CONNECTOME, first class. Edges live in typed arrays so a
// million of them are a few tens of MB and propagation is a tight loop. Every edge has a
// learned weight, a delay, usage statistics, confidence and state flags. Strengthen and
// weaken are learning (free). Grow, prune and replace are structural: they go through
// the gate as Proposals and every one is a ledger event.
export const ACTIVE = 1, DORMANT = 2, PRUNED = 4;

export class Connectome {
  constructor(capacity = 1024) {
    this.n = 0;
    this._alloc(capacity);
    this._dirty = true;
    this._bySrc = null; this._byDst = null;
    this._key = new Map(); // (src,dst,srcPort,dstPort) -> e, so find() and connect() are O(1) instead of a full reindex per edge
    this.stats = { grown: 0, pruned: 0, strengthened: 0, weakened: 0 };
  }
  _alloc(cap) {
    const grow = (Ctor, old) => { const a = new Ctor(cap); if (old) a.set(old.subarray(0, this.n)); return a; };
    this.src = grow(Uint32Array, this.src); this.dst = grow(Uint32Array, this.dst);
    this.srcPort = grow(Uint8Array, this.srcPort); this.dstPort = grow(Uint8Array, this.dstPort);
    this.w = grow(Float32Array, this.w); this.delay = grow(Uint16Array, this.delay);
    this.usage = grow(Uint32Array, this.usage); this.lastT = grow(Float64Array, this.lastT);
    this.conf = grow(Float32Array, this.conf); this.flags = grow(Uint8Array, this.flags);
    this.cap = cap;
  }
  get capacity() { return this.cap; }
  size() { return this.n; }
  live() { let c = 0; for (let e = 0; e < this.n; e++) if (this.flags[e] & ACTIVE) c++; return c; }

  add(src, dst, { srcPort = 0, dstPort = 0, w = 1, delay = 0, conf = 0.5 } = {}) {
    if (this.n === this.cap) this._alloc(this.cap * 2);
    const e = this.n++;
    this.src[e] = src; this.dst[e] = dst; this.srcPort[e] = srcPort; this.dstPort[e] = dstPort;
    this.w[e] = w; this.delay[e] = delay; this.usage[e] = 0; this.lastT[e] = -1; this.conf[e] = conf; this.flags[e] = ACTIVE;
    this._dirty = true; this.stats.grown++;
    this._key.set(src + ',' + dst + ',' + srcPort + ',' + dstPort, e);
    return e;
  }
  find(src, dst, srcPort = 0, dstPort = 0) {
    const e = this._key.get(src + ',' + dst + ',' + srcPort + ',' + dstPort);
    return e === undefined || (this.flags[e] & PRUNED) ? -1 : e;
  }
  edge(e) {
    return { e, src: this.src[e], dst: this.dst[e], srcPort: this.srcPort[e], dstPort: this.dstPort[e], w: this.w[e], delay: this.delay[e], usage: this.usage[e], lastT: this.lastT[e], conf: this.conf[e], flags: this.flags[e] };
  }
  _index() {
    if (!this._dirty) return;
    const n = this.n; let maxNode = 0; // a loop, not a spread: spread overflows the call stack near 96000 edges
    for (let e = 0; e < n; e++) { if (this.src[e] >= maxNode) maxNode = this.src[e] + 1; if (this.dst[e] >= maxNode) maxNode = this.dst[e] + 1; }
    const build = (key) => {
      const count = new Uint32Array(maxNode + 1);
      for (let e = 0; e < n; e++) count[key[e] + 1]++;
      for (let i = 0; i < maxNode; i++) count[i + 1] += count[i];
      const list = new Uint32Array(n), fill = count.slice();
      for (let e = 0; e < n; e++) list[fill[key[e]]++] = e;
      return { ptr: count, list };
    };
    this._bySrc = build(this.src); this._byDst = build(this.dst);
    this._nodes = maxNode;
    this._dirty = false;
  }
  outOf(node) {
    this._index();
    if (node >= this._nodes) return EMPTY;
    return this._bySrc.list.subarray(this._bySrc.ptr[node], this._bySrc.ptr[node + 1]);
  }
  into(node) {
    this._index();
    if (node >= this._nodes) return EMPTY;
    return this._byDst.list.subarray(this._byDst.ptr[node], this._byDst.ptr[node + 1]);
  }
  touch(e, t) { this.usage[e]++; this.lastT[e] = t; }
  // The tick a signal emitted at t over edge e arrives: one tick of travel plus the edge delay.
  arrival(e, t) { return t + 1 + this.delay[e]; }

  // Hebbian with decay (the fly's rule): dW = eta * pre * post - alpha * W. Clamped.
  strengthen(e, pre, post, eta = 1e-2, alpha = 1e-4, wMax = 4) {
    const dw = eta * pre * post - alpha * this.w[e];
    this.w[e] = Math.min(wMax, Math.max(-wMax, this.w[e] + dw));
    if (dw > 0) this.stats.strengthened++; else this.stats.weakened++;
    return dw;
  }
  weaken(e, amount) { this.w[e] -= amount; this.stats.weakened++; return this.w[e]; }
  setFlags(e, flags) { this.flags[e] = flags; }
  dormant(e) { this.flags[e] = (this.flags[e] & ~ACTIVE) | DORMANT; }
  wake(e) { this.flags[e] = (this.flags[e] & ~DORMANT) | ACTIVE; }
  prune(e) { this.flags[e] = PRUNED; this.stats.pruned++; }

  // Candidates for pruning: live, |w| under floor, and unused for staleTicks.
  pruneCandidates(t, { floor = 0.05, staleTicks = 1000 } = {}) {
    const out = [];
    for (let e = 0; e < this.n; e++) {
      if (!(this.flags[e] & ACTIVE)) continue;
      if (Math.abs(this.w[e]) < floor && (this.lastT[e] < 0 || t - this.lastT[e] > staleTicks)) out.push(e);
    }
    return out;
  }

  // Sum of |w| per source node, cheap degree stats for the viz and for growth rules.
  degree(node) { return { out: this.outOf(node).length, in: this.into(node).length }; }

  serialize() {
    const n = this.n, b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
    return {
      n, stats: this.stats,
      src: b64(this.src.subarray(0, n)), dst: b64(this.dst.subarray(0, n)),
      srcPort: b64(this.srcPort.subarray(0, n)), dstPort: b64(this.dstPort.subarray(0, n)),
      w: b64(this.w.subarray(0, n)), delay: b64(this.delay.subarray(0, n)),
      usage: b64(this.usage.subarray(0, n)), lastT: b64(this.lastT.subarray(0, n)),
      conf: b64(this.conf.subarray(0, n)), flags: b64(this.flags.subarray(0, n)),
    };
  }
  static from(j) {
    const c = new Connectome(Math.max(16, j.n * 2));
    const rd = (Ctor, s) => { const b = Buffer.from(s, 'base64'); return new Ctor(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
    c.n = j.n; c.stats = j.stats || c.stats;
    c.src.set(rd(Uint32Array, j.src)); c.dst.set(rd(Uint32Array, j.dst));
    c.srcPort.set(rd(Uint8Array, j.srcPort)); c.dstPort.set(rd(Uint8Array, j.dstPort));
    c.w.set(rd(Float32Array, j.w)); c.delay.set(rd(Uint16Array, j.delay));
    c.usage.set(rd(Uint32Array, j.usage)); c.lastT.set(rd(Float64Array, j.lastT));
    c.conf.set(rd(Float32Array, j.conf)); c.flags.set(rd(Uint8Array, j.flags));
    for (let e = 0; e < c.n; e++) c._key.set(c.src[e] + ',' + c.dst[e] + ',' + c.srcPort[e] + ',' + c.dstPort[e], e);
    c._dirty = true;
    return c;
  }
}
const EMPTY = new Uint32Array(0);

// Co-activation tracker for growth: counts pairs of cells that fire in the same tick
// with no edge between them. When a pair crosses K, it becomes a grow Proposal.
// Cost is bounded: when the fired set has more than sampleBudget pairs, that many pairs are
// sampled from the brain's seeded RNG instead of enumerating all n(n-1)/2. Growth stays
// deterministic for a seed and the per-tick cost stays linear in the budget, not quadratic
// in the fired count (5000 cells firing at once is 12.5 million pairs; the budget is 4096).
export class CoActivation {
  // growth may be given as false or null, both of which mean off, or as the options object.
  // Before this, false fell through to the defaults (a boolean destructures to them) and so
  // turned growth ON, and null threw reading 'window' (notes/whole.md request 3).
  constructor(opts = {}) {
    const off = opts === false || opts === null;
    const { window = 64, threshold = 8, maxPairs = 200000, sampleBudget = 4096, enabled = true } = off ? {} : opts;
    this.enabled = off ? false : enabled; // growth: false, null or { enabled: false } skips the tracker entirely (measured 28x on tick rate by the CLI bench)
    this.window = window; this.threshold = threshold; this.maxPairs = maxPairs; this.sampleBudget = sampleBudget;
    this.counts = new Map(); // key = a*2^21+b (a<b), value = count
    this.stats = { observed: 0, sampled: 0, exhaustive: 0 };
  }
  static key(a, b) { return a < b ? a * 2097152 + b : b * 2097152 + a; }
  _pair(a, b, connectome, out) {
    if (connectome.find(a, b) >= 0 || connectome.find(b, a) >= 0) return;
    const k = CoActivation.key(a, b);
    const c = (this.counts.get(k) || 0) + 1;
    if (c >= this.threshold) { this.counts.delete(k); out.push([Math.min(a, b), Math.max(a, b), c]); }
    else if (this.counts.size < this.maxPairs) this.counts.set(k, c);
  }
  observe(firedIdx, connectome, rng = null) {
    const out = [], n = firedIdx.length;
    if (n < 2) return out;
    const pairs = (n * (n - 1)) / 2;
    if (pairs <= this.sampleBudget || !rng) {
      this.stats.exhaustive++; this.stats.observed += pairs;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) this._pair(firedIdx[i], firedIdx[j], connectome, out);
    } else {
      this.stats.sampled++; this.stats.observed += this.sampleBudget;
      for (let s = 0; s < this.sampleBudget; s++) {
        const i = rng.int(n); let j = rng.int(n - 1); if (j >= i) j++;
        this._pair(firedIdx[i], firedIdx[j], connectome, out);
      }
    }
    return out;
  }
  decay() { for (const [k, v] of this.counts) { if (v <= 1) this.counts.delete(k); else this.counts.set(k, v - 1); } }

  // The counters ride in snapshot.json beside the connectome (notes/lab.md request 2): a
  // recording taken part way to a growth threshold has to replay into the SAME organism, and
  // counters that restart at zero grow a different one. The form is the connectome's own, two
  // typed arrays in base64 and never one object per pair, so the section stays a pair of
  // strings bounded by maxPairs however long the brain has been running. A pair key is
  // a * 2097152 + b, which passes 2^32 on a brain of more than 2048 cells, so the keys ride in
  // a Float64Array (exact for every integer below 2^53) and only the counts are Uint32.
  serialize() {
    const n = this.counts.size;
    const keys = new Float64Array(n), vals = new Uint32Array(n);
    let i = 0;
    for (const [k, v] of this.counts) { keys[i] = k; vals[i] = v; i++; }
    const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
    return { n, stats: { ...this.stats }, keys: b64(keys), vals: b64(vals) };
  }
  // A snapshot written before the counters were serialized has no section at all, and a brain
  // restored from it keeps the empty counters it was constructed with.
  restore(j) {
    if (!j) return this;
    this.counts.clear();
    const rd = (Ctor, s) => { const b = Buffer.from(s || '', 'base64'); return new Ctor(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
    const keys = rd(Float64Array, j.keys), vals = rd(Uint32Array, j.vals);
    const n = Math.min(Number.isFinite(j.n) ? j.n : keys.length, keys.length, vals.length);
    for (let i = 0; i < n; i++) this.counts.set(keys[i], vals[i]);
    if (j.stats) this.stats = { ...this.stats, ...j.stats };
    return this;
  }
}
