// memory/semantic.mjs. SEMANTIC MEMORY, the associative tier.
// Patterns are stored hypervectors. Retrieval is the modern Hopfield update: score every
// pattern against the current state, softmax those scores, bundle the patterns under
// those weights, and repeat with the result as the new query until the state stops
// moving. One step is a soft lookup, the iteration is the cleanup that turns a noisy
// cue into the stored attractor.
//
// Two notes on the mechanics that are not obvious.
//  1. core/signal.mjs bundle() accumulates into an Int32Array, so a weight below 1
//     truncates to zero. Softmax weights are therefore scaled to integers before the
//     bundle, with WEIGHT_SCALE as the unit.
//  2. Each pattern carries a strength that acts as a log prior in the update and as the
//     thing that decays. Strength under the floor is what "forgotten" means here.
//  3. When one weight is larger than all the others together, the weighted bundle is that
//     one pattern and nothing has to be scanned to know it: see step(). That is an
//     identity, not an approximation, and it is what the accumulation costs least on.
//  4. THE BOUND IS BYTES, NOT A COUNT (Board 11, item native). The tier used to drop its
//     weakest pattern past 4,096 keys, a number that said nothing about the machine. It now
//     holds keys until the bytes they occupy pass a DECLARED budget: 256 MB by default,
//     BRAIN_SEMANTIC_BUDGET_MB in the environment or budgetMb / budgetBytes in the options to
//     change it. A key's bytes are counted when it is stored: its pattern (d bytes), its copy
//     in the resident arena (d + 4 bytes) and, for a named key, its packed codebook entry (d / 8
//     bytes). JS object headers are not counted. budget() reports keys held and bytes, and a
//     log function in the options is handed that report the first time the budget evicts and
//     at every power of two evictions after. An explicit capacity is still honoured, as a
//     count cap beside the budget, for the callers that ask for one.
import { D, ItemMemory, bundle, bundleFromAcc, sim, dataToJSON, dataFromJSON, release } from '../core/signal.mjs';
import * as SIMD from '../core/simd.mjs';

export const SEMANTIC_DEFAULTS = Object.freeze({
  d: D,
  beta: 8,          // inverse temperature of the softmax; higher is a harder lookup
  maxIters: 8,      // cleanup iterations before giving up on convergence
  capacity: null,   // an optional COUNT cap beside the byte budget; null: the budget alone bounds the tier
  budgetMb: 256,    // the declared byte budget; the weakest pattern is dropped while the tier's key bytes pass it
  floor: 0.1,       // strength under this is forgotten by decay()
  decayRate: 0.9,   // multiplier applied to every strength by decay()
});

export const WEIGHT_SCALE = 1_000_000;

/** The count cap every SemanticMemory carried before the byte budget, kept only to read old checkpoints. */
export const LEGACY_CAPACITY = 4096;

/**
 * The byte budget an options object declares: budgetBytes, else budgetMb, else the environment's
 * BRAIN_SEMANTIC_BUDGET_MB, else SEMANTIC_DEFAULTS.budgetMb.
 * @param {object} [opts]
 * @returns {number} bytes
 */
export function semanticBudgetBytes(opts = {}) {
  if (Number.isFinite(opts.budgetBytes) && opts.budgetBytes >= 0) return Math.floor(opts.budgetBytes);
  if (Number.isFinite(opts.budgetMb) && opts.budgetMb >= 0) return Math.floor(opts.budgetMb * 1048576);
  const env = Number(process.env.BRAIN_SEMANTIC_BUDGET_MB);
  if (process.env.BRAIN_SEMANTIC_BUDGET_MB !== undefined && Number.isFinite(env) && env >= 0) return Math.floor(env * 1048576);
  return Math.floor(SEMANTIC_DEFAULTS.budgetMb * 1048576);
}

/** @param {Int8Array} v @returns {boolean} every lane is +1 or -1 */
function isBipolar(v) {
  for (let i = 0; i < v.length; i++) if (v[i] !== 1 && v[i] !== -1) return false;
  return true;
}

export class SemanticMemory {
  /** @param {object} [opts] see SEMANTIC_DEFAULTS */
  constructor(opts = {}) {
    const o = { ...SEMANTIC_DEFAULTS, ...opts };
    this.d = o.d;
    this.beta = o.beta;
    this.maxIters = o.maxIters;
    this.countCap = Number.isFinite(o.capacity) ? Math.max(0, Math.floor(o.capacity)) : null;
    this.budgetBytes = semanticBudgetBytes(opts);
    this.log = typeof opts.log === 'function' ? opts.log : null;
    this.keyBytes = [];                    // bytes counted per slot when it was stored
    this._bytes = 0;
    this.floor = o.floor;
    this.decayRate = o.decayRate;
    this.items = new ItemMemory(this.d);   // the codebook of named concepts
    this.patterns = [];                    // Int8Array per slot
    this.names = [];                       // string or null per slot
    this.strength = [];                    // number per slot
    this.byName = new Map();               // name to slot
    // Every pattern also lives once, raw, in a wasm arena of its own, so a Hopfield step is
    // two kernel scans (dots, then the weighted accumulation) instead of a JS loop over every
    // lane of every pattern. What the two scans cost per call, and what the shortcut below
    // takes off them, is measured by bench/semantic-cleanup.mjs into
    // bench/verdicts/semantic-cleanup.json; no timing is quoted here. The arena removes by
    // swap, so slotOf maps a pattern index to its arena slot.
    this.arena = SIMD.fits(this.d) ? new SIMD.RawArena(this.d, Math.max(1, Math.min(this.capacity, 256))) : null;
    this.slotOf = [];
    // Whether each stored pattern is bipolar, checked once on the way in. step()'s shortcut
    // bounds the rest of an accumulation by the weight sum, which is only a bound while
    // every lane of every pattern is +1 or -1; _nonBip counts the ones that are not.
    this.bip = [];
    this._nonBip = 0;
    // false selects the paths this tier ran before 2026-09-17: the scan on every step and a
    // second scan inside recognize. The bench's old arm and the exactness test's control
    // set it; the organism never does. BRAIN_SEMANTIC_FAST=0 in the environment sets it for
    // a whole process, which is how the profiled control arm of a live run is pinned to the
    // old paths without a preload file: see bench/semantic-cleanup.mjs --live.
    this.fast = opts.fast !== undefined ? Boolean(opts.fast) : process.env.BRAIN_SEMANTIC_FAST !== '0';
    this.stats = {
      learned: 0, merged: 0, forgotten: 0, dropped: 0, cleanups: 0, iterations: 0, concepts: 0,
      steps: 0, nonzero: 0, dominated: 0, reusedSims: 0,
    };
  }

  /** @returns {number} patterns currently stored */
  size() { return this.patterns.length; }

  /** Bytes one key occupies in this tier: its pattern, its arena copy, and a named key's packed codebook entry. */
  bytesPerKey(named = true) { return this.d + (this.arena ? this.d + 4 : 0) + (named && this.items.packed ? Math.ceil(this.d / 8) : 0); }

  /** The keys the byte budget holds (named keys), or the count cap when that is smaller. */
  get capacity() {
    const byBudget = Math.floor(this.budgetBytes / this.bytesPerKey(true));
    return this.countCap === null ? byBudget : Math.min(this.countCap, byBudget);
  }

  /** @returns {number} the key bytes this tier holds now */
  bytes() { return this._bytes; }

  /**
   * Keys held and bytes, against the declared budget.
   * @returns {{keys: number, bytes: number, budgetBytes: number, capacity: number, countCap: number|null, bytesPerKey: number, dropped: number, line: string}}
   */
  budget() {
    const out = { keys: this.patterns.length, bytes: this._bytes, budgetBytes: this.budgetBytes, capacity: this.capacity, countCap: this.countCap, bytesPerKey: this.bytesPerKey(true), dropped: this.stats.dropped };
    out.line = 'semantic tier: ' + out.keys + ' keys held, ' + out.bytes + ' bytes of a ' + out.budgetBytes + ' byte budget (' + (out.budgetBytes / 1048576).toFixed(1) + ' MB), '
      + out.bytesPerKey + ' bytes a named key, room for ' + out.capacity + (out.countCap === null ? '' : ' (count cap ' + out.countCap + ')') + ', ' + out.dropped + ' dropped';
    return out;
  }

  // Drop the weakest while the key bytes pass the budget or the count passes an explicit cap.
  _enforce() {
    const before = this.stats.dropped;
    while (this.patterns.length > 0 && (this._bytes > this.budgetBytes || (this.countCap !== null && this.patterns.length > this.countCap))) this._dropWeakest();
    const now = this.stats.dropped;
    if (this.log && now > before && (before === 0 || Math.floor(Math.log2(now)) > Math.floor(Math.log2(before)))) this.log(this.budget().line);
  }

  /** @param {string} name @returns {boolean} */
  has(name) { return this.byName.has(name); }

  /** @param {string} name @returns {Int8Array|null} the stored concept vector */
  concept(name) { const i = this.byName.get(name); return i === undefined ? null : this.patterns[i]; }

  /** @param {string} name @returns {number} the concept strength, 0 when unknown */
  strengthOf(name) { const i = this.byName.get(name); return i === undefined ? 0 : this.strength[i]; }

  /** @returns {Array<{name: string, strength: number}>} named concepts, strongest first */
  concepts() {
    const out = [];
    for (const [name, i] of this.byName) out.push({ name, strength: this.strength[i] });
    out.sort((a, b) => b.strength - a.strength);
    return out;
  }

  /**
   * Store a pattern. A named pattern that already exists is merged into the existing
   * one, weighted by the two strengths, which is how a concept sharpens with repetition.
   * @param {Int8Array} hv
   * @param {object} [opts] { name, strength }
   * @returns {number} the slot index
   */
  add(hv, opts = {}) {
    if (!hv || hv.length !== this.d) throw new Error('semantic: pattern must be an hv of length ' + this.d);
    const name = opts.name ?? null;
    const strength = Number.isFinite(opts.strength) ? opts.strength : 1;
    if (name !== null && this.byName.has(name)) {
      const i = this.byName.get(name);
      const wOld = Math.max(1, Math.round(this.strength[i]));
      const wNew = Math.max(1, Math.round(strength));
      this.patterns[i] = bundle([this.patterns[i], hv], [wOld, wNew]);
      this._setBip(i, isBipolar(this.patterns[i]));
      if (this.arena) this.arena.set(this.slotOf[i], this.patterns[i]);
      this.strength[i] += strength;
      this.items.set(name, this.patterns[i]);
      this.stats.merged++;
      return i;
    }
    const i = this.patterns.length;
    this.patterns.push(Int8Array.from(hv));
    this.bip.push(isBipolar(this.patterns[i]));
    if (this.bip[i] === false) this._nonBip++;
    if (this.arena) { const s = this.arena.count; this.arena.set(s, this.patterns[i]); this.slotOf.push(s); }
    this.names.push(name);
    this.strength.push(strength);
    if (name !== null) { this.byName.set(name, i); this.items.set(name, this.patterns[i]); this.stats.concepts++; }
    const kb = this.bytesPerKey(name !== null);
    this.keyBytes.push(kb);
    this._bytes += kb;
    this.stats.learned++;
    this._enforce();
    return i;
  }

  /**
   * Store or merge a named concept.
   * @param {string} name
   * @param {Int8Array} hv
   * @param {object} [opts] { strength }
   * @returns {number} the slot index
   */
  learn(name, hv, opts = {}) { return this.add(hv, { ...opts, name }); }

  /**
   * Raise the strength of a named concept.
   * @param {string} name
   * @param {number} [amount]
   * @returns {number} the new strength, 0 when the name is unknown
   */
  reinforce(name, amount = 1) {
    const i = this.byName.get(name);
    if (i === undefined) return 0;
    this.strength[i] += amount;
    return this.strength[i];
  }

  _dropWeakest() {
    let worst = 0;
    for (let i = 1; i < this.strength.length; i++) if (this.strength[i] < this.strength[worst]) worst = i;
    this._removeSlot(worst);
    this.stats.dropped++;
  }

  /** @param {number} i @param {boolean} v the bipolar flag of slot i, keeping _nonBip true */
  _setBip(i, v) {
    if (this.bip[i] === v) return;
    if (v) { if (this.bip[i] === false) this._nonBip--; } else this._nonBip++;
    this.bip[i] = v;
  }

  _removeSlot(i) {
    if (this.bip[i] === false) this._nonBip--;
    this.bip.splice(i, 1);
    if (this.arena) {
      const s = this.slotOf[i], last = this.arena.count - 1;
      if (s !== last) { this.arena.move(last, s); this.slotOf[this.slotOf.indexOf(last)] = s; }
      this.arena.truncate(last);
      this.slotOf.splice(i, 1);
    }
    const name = this.names[i];
    this._bytes -= this.keyBytes[i] || 0;
    this.keyBytes.splice(i, 1);
    this.patterns.splice(i, 1); this.names.splice(i, 1); this.strength.splice(i, 1);
    if (name !== null) { this.byName.delete(name); this.items.items.delete(name); }
    this.byName.clear();
    for (let j = 0; j < this.names.length; j++) if (this.names[j] !== null) this.byName.set(this.names[j], j);
    return name;
  }

  /**
   * One modern Hopfield update: softmax over pattern scores, then a weighted bundle.
   * @param {Int8Array} state current state
   * @param {number} beta inverse temperature
   * @returns {Int8Array} the next state
   */
  step(state, beta = this.beta) {
    const n = this.patterns.length;
    const sims = this._sims(state);
    this._simsVals = sims;
    const logits = new Float64Array(n);
    let m = -Infinity;
    for (let i = 0; i < n; i++) {
      const v = beta * sims[i] + Math.log(Math.max(1e-9, this.strength[i]));
      logits[i] = v;
      if (v > m) m = v;
    }
    let sum = 0;
    const w = new Float64Array(n);
    for (let i = 0; i < n; i++) { w[i] = Math.exp(logits[i] - m); sum += w[i]; }
    if (!(sum > 0)) sum = 1;
    // the integer weights in pattern order, with the largest of them and their sum
    const pw = this._patWeights(n);
    let top = 0, isum = 0, nz = 0;
    for (let i = 0; i < n; i++) {
      const v = Math.max(0, Math.round((w[i] / sum) * WEIGHT_SCALE));
      pw[i] = v; isum += v;
      if (v > 0) nz++;
      if (v > pw[top]) top = i;
    }
    this.stats.steps++; this.stats.nonzero += nz;
    // One weight larger than all the others together decides every lane on its own:
    // acc[j] is pw[top] * patterns[top][j] plus a remainder of at most isum - pw[top],
    // which is smaller, so the sign of acc[j] is the sign of that lane and the bundle is
    // that pattern. The remainder is only bounded by the weight sum while every lane of
    // every pattern is +1 or -1, hence the _nonBip guard, and the winning lane is then
    // never zero, so bundle()'s tie rule cannot apply either.
    if (this.fast && this._nonBip === 0 && 2 * pw[top] > isum) {
      this.stats.dominated++;
      return Int8Array.from(this.patterns[top]);
    }
    if (this.arena) {
      // weights in slot order, the sum in i32 lanes, the sign with bundle()'s tie: the same
      // vector bundle(this.patterns, pw) returns, without touching a lane from JS
      const iw = this._slotWeights(n);
      for (let i = 0; i < n; i++) iw[this.slotOf[i]] = pw[i];
      const acc = this._acc || (this._acc = new Int32Array(this.d));
      this.arena.wacc(iw, acc, n);
      return bundleFromAcc(acc, this.patterns[0]);
    }
    return bundle(this.patterns, pw);
  }

  _slotWeights(n) {
    if (!this._iw || this._iw.length < n) this._iw = new Int32Array(Math.max(n, 64) * 2);
    return this._iw.length === n ? this._iw : this._iw.subarray(0, n);
  }

  _patWeights(n) {
    if (!this._pw || this._pw.length < n) this._pw = new Int32Array(Math.max(n, 64) * 2);
    return this._pw.length === n ? this._pw : this._pw.subarray(0, n);
  }

  // similarity of a state with every pattern, in pattern order: one arena scan, or sim()
  _sims(state) {
    const n = this.patterns.length;
    const sims = new Float64Array(n);
    if (this.arena) {
      if (!this._dots || this._dots.length < n) this._dots = new Int32Array(Math.max(n, 64) * 2);
      this.arena.dots(state, this._dots, n);
      for (let i = 0; i < n; i++) sims[i] = this._dots[this.slotOf[i]] / this.d;
      return sims;
    }
    for (let i = 0; i < n; i++) sims[i] = sim(this.patterns[i], state);
    return sims;
  }

  /**
   * Iterative cleanup: run step() until the state stops changing or maxIters is reached.
   * @param {Int8Array} query a noisy cue
   * @param {object} [opts] { beta, maxIters }
   * @returns {{hv: Int8Array, iterations: number, converged: boolean}}
   */
  cleanup(query, opts = {}) {
    const beta = opts.beta ?? this.beta;
    const maxIters = opts.maxIters ?? this.maxIters;
    this.stats.cleanups++;
    this._cleanFor = null;
    if (this.patterns.length === 0) return { hv: Int8Array.from(query), iterations: 0, converged: false };
    let state = query, iterations = 0, converged = false;
    for (let i = 0; i < maxIters; i++) {
      const next = this.step(state, beta);
      iterations++;
      this.stats.iterations++;
      const fixed = sim(next, state) === 1;
      // step() read `state` and sim() has just compared it: that is its last read. Every
      // state but the caller's own query is a vector step() made inside this loop and
      // nobody outside it ever saw, so its slot goes back here. Measured before this line
      // existed (bench/verdicts/footprint.json, sites row of the 12 major arm, ownership
      // leaf): memory/semantic.mjs:234 held 736 slots at the end of the run of which 734
      // were garbage a collection returned, the largest garbage owner in the organism.
      if (state !== query) release(state);
      if (fixed) {
        // the last step scored the sims of this state and next is that state lane for
        // lane, so they are the sims of the answer: recognize() reuses them rather than
        // scanning every pattern a second time
        this._cleanFor = next; this._cleanVals = this._simsVals;
        state = next; converged = true; break;
      }
      state = next;
    }
    return { hv: state, iterations, converged };
  }

  /**
   * The same walk cleanup() takes, kept instead of thrown away, so a population that runs to
   * maxIters can be asked what it is doing there: standing still, or going round. Every state
   * of the walk is held and each new state is compared against all of them. A repeat of the
   * state just left is the fixed point cleanup() stops on; a repeat of an older one is an
   * orbit, and its length is how far back the repeat is. This is a measuring path only: it
   * answers nothing the organism reads, and cleanup() is untouched by it.
   * @param {Int8Array} query a cue
   * @param {object} [opts] { beta, maxIters }
   * @returns {{hv: Int8Array, iterations: number, converged: boolean, cycleLength: number, cycleAt: number}}
   */
  walk(query, opts = {}) {
    const beta = opts.beta ?? this.beta;
    const maxIters = opts.maxIters ?? this.maxIters;
    let state = Int8Array.from(query);
    const seen = [state];
    let iterations = 0, converged = false, cycleLength = 0, cycleAt = -1;
    for (let i = 0; i < maxIters; i++) {
      const next = this.step(state, beta);
      iterations++;
      let hit = -1;
      for (let j = seen.length - 1; j >= 0; j--) if (sim(seen[j], next) === 1) { hit = j; break; }
      state = next;
      if (hit === seen.length - 1) { converged = true; break; }
      if (hit >= 0) { cycleLength = seen.length - hit; cycleAt = hit; break; }
      seen.push(next);
    }
    return { hv: state, iterations, converged, cycleLength, cycleAt };
  }

  /**
   * Clean a cue up and name the attractor it fell into.
   * @param {Int8Array} query
   * @param {object} [opts] { beta, maxIters, threshold }
   * @returns {{name: string|null, sim: number, slot: number, iterations: number, converged: boolean, hv: Int8Array, cueSim: number}}
   */
  recognize(query, opts = {}) {
    const threshold = opts.threshold ?? 0;
    const r = this.cleanup(query, opts);
    let best = -1, bs = -Infinity;
    let sims;
    if (this.fast && this._cleanFor === r.hv) { sims = this._cleanVals; this.stats.reusedSims++; }
    else sims = this._sims(r.hv);
    for (let i = 0; i < this.patterns.length; i++) {
      const s = sims[i];
      if (s > bs) { bs = s; best = i; }
    }
    if (best < 0) return { name: null, sim: 0, slot: -1, iterations: r.iterations, converged: r.converged, hv: r.hv, cueSim: 0 };
    return {
      name: bs >= threshold ? this.names[best] : null,
      sim: bs, slot: best, iterations: r.iterations, converged: r.converged, hv: r.hv,
      cueSim: sim(this.patterns[best], query),
    };
  }

  /**
   * Decay every strength and forget what falls under the floor.
   * @param {object} [opts] { rate, floor }
   * @returns {{forgotten: string[], removed: number, remaining: number}}
   */
  decay(opts = {}) {
    const rate = opts.rate ?? this.decayRate;
    const floor = opts.floor ?? this.floor;
    for (let i = 0; i < this.strength.length; i++) this.strength[i] *= rate;
    const forgotten = [];
    let removed = 0;
    for (let i = this.strength.length - 1; i >= 0; i--) {
      if (this.strength[i] < floor) {
        const name = this._removeSlot(i);
        removed++;
        if (name !== null) forgotten.push(name);
      }
    }
    this.stats.forgotten += removed;
    forgotten.reverse();
    return { forgotten, removed, remaining: this.patterns.length };
  }

  /**
   * Consolidation from episodic memory. Items that keep appearing together in episodes
   * are bundled upward into one concept vector: the item vectors plus the keys of the
   * episodes where they co-occurred. Items seen on their own become concepts too, with a
   * strength equal to their count, which is what later makes the rare ones forgettable.
   * @param {import('./episodic.mjs').EpisodicStore} episodic
   * @param {object} [opts] { from, to, minCount, maxConcepts, maxKeys, includeKeys, solo, includeCold }
   * @returns {{formed: Array<{name: string, members: string[], count: number, episodes: number}>, solo: Array<{name: string, count: number}>, scanned: number}}
   */
  consolidateFromEpisodic(episodic, opts = {}) {
    const from = opts.from ?? -Infinity;
    const to = opts.to ?? Infinity;
    const minCount = opts.minCount ?? 3;
    const maxConcepts = opts.maxConcepts ?? 32;
    const maxKeys = opts.maxKeys ?? 32;
    const includeKeys = opts.includeKeys ?? true;
    const solo = opts.solo ?? true;
    const ids = episodic.idsInRange(from, to, { includeCold: opts.includeCold ?? false });
    const pairs = new Map();
    const soloCount = new Map();
    for (const id of ids) {
      const names = [...new Set(episodic.itemsOf(id))].sort();
      for (const a of names) soloCount.set(a, (soloCount.get(a) || 0) + 1);
      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
          const key = names[i] + '+' + names[j];
          let r = pairs.get(key);
          if (!r) { r = { name: key, members: [names[i], names[j]], count: 0, ids: [] }; pairs.set(key, r); }
          r.count++;
          if (r.ids.length < maxKeys) r.ids.push(id);
        }
      }
    }
    const chosen = [...pairs.values()]
      .filter(r => r.count >= minCount)
      .sort((a, b) => (b.count - a.count) || (a.name < b.name ? -1 : 1))
      .slice(0, maxConcepts);
    const formed = [];
    for (const r of chosen) {
      const parts = r.members.map(m => this.items.get(m));
      if (includeKeys) for (const id of r.ids) parts.push(episodic.keyAt(id));
      this.learn(r.name, bundle(parts), { strength: r.count });
      formed.push({ name: r.name, members: r.members, count: r.count, episodes: r.ids.length });
    }
    const soloOut = [];
    if (solo) {
      for (const [name, count] of [...soloCount].sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : 1))) {
        this.learn(name, this.items.get(name), { strength: count });
        soloOut.push({ name, count });
      }
    }
    return { formed, solo: soloOut, scanned: ids.length };
  }

  /** @returns {object} JSON safe form */
  serialize() {
    return {
      version: 1, d: this.d, beta: this.beta, maxIters: this.maxIters, capacity: this.countCap, budgetBytes: this.budgetBytes,
      floor: this.floor, decayRate: this.decayRate,
      patterns: this.patterns.map(p => dataToJSON('hv', p)),
      names: this.names, strength: this.strength,
      items: this.items.serialize(), stats: { ...this.stats },
    };
  }

  /**
   * Rebuild from serialize().
   * @param {object} j
   * @returns {SemanticMemory}
   */
  static from(j) {
    // A checkpoint written before the byte budget carries capacity 4096, the old DEFAULT, and no
    // budgetBytes: that 4096 was never a declared choice, so it is read as no count cap and the
    // default budget governs. Any other capacity is kept as the count cap it was asked for.
    const legacy = j.budgetBytes === undefined && j.capacity === LEGACY_CAPACITY;
    const m = new SemanticMemory({ d: j.d, beta: j.beta, maxIters: j.maxIters, capacity: legacy ? null : j.capacity, ...(Number.isFinite(j.budgetBytes) ? { budgetBytes: j.budgetBytes } : {}), floor: j.floor, decayRate: j.decayRate });
    // dataFromJSON returns a heap slot for the packed form and Int8Array.from COPIES it, so
    // the slot is garbage the moment the copy exists: it goes back at that last read. The
    // patterns themselves stay plain arrays, which is what this class has always stored.
    m.patterns = j.patterns.map((p) => { const v = dataFromJSON('hv', p); const out = Int8Array.from(v); release(v); return out; });
    m.bip = m.patterns.map(p => isBipolar(p));
    m._nonBip = m.bip.reduce((a, b) => a + (b ? 0 : 1), 0);
    if (m.arena) { m.slotOf = []; for (let i = 0; i < m.patterns.length; i++) { m.arena.set(i, m.patterns[i]); m.slotOf.push(i); } }
    m.names = [...j.names];
    m.strength = [...j.strength];
    m.byName = new Map();
    for (let i = 0; i < m.names.length; i++) if (m.names[i] !== null) m.byName.set(m.names[i], i);
    m.items = ItemMemory.from(j.items);
    m.stats = { ...m.stats, ...(j.stats || {}) };
    m.keyBytes = m.names.map((n) => m.bytesPerKey(n !== null));
    m._bytes = m.keyBytes.reduce((a, b) => a + b, 0);
    return m;
  }
}
