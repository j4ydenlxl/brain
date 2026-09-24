// mind/model.mjs: THE SEQUENCE PREDICTOR, BUILT OUT OF CELLS AND LOCAL RULES.
//
// Five arms are graded on the same held out tokens, in bits per BYTE so that a tokenizer
// which makes longer tokens cannot buy the number:
//
//   uniform    the null. A model that learned nothing pays log2(V) bits per token.
//   unigram    exact token counts, smoothed toward uniform.
//   ngram      interpolated backoff over orders 1..N. The baseline any language model owes.
//   hv         the associative memory. The context is ONE hypervector (a bundle of permuted
//              token quanta), that vector addresses the memory by its own sign pattern, and
//              the value stored there is a superposition of the next token quanta that
//              followed. Reading it back is a cleanup against the codebook. One pass, local
//              rules, no gradient, no backpropagation, nothing but counting and bundling.
//   mixture    a convex combination of the three learned arms.
//
// Every hyperparameter that is chosen rather than fixed (the hv decoding sharpness, the
// mixture weights) is chosen on a DEV SLICE OF TRAIN. Held out never chooses anything.
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';
import { Tokenizer, MIND_D } from './tokenizer.mjs';

const LOG2 = Math.log(2);
const bits = (p) => -Math.log(Math.max(p, 1e-300)) / LOG2;

// ---------------------------------------------------------------- uniform, the null
export class UniformModel {
  constructor(V) { this.V = V; this.p = 1 / V; }
  probAt() { return this.p; }
  dist() { const d = new Float32Array(this.V); d.fill(this.p); return d; }
  sizeBytes() { return 4; }
}

// ---------------------------------------------------------------- n gram backoff
// p_0(t)            = 1 / V
// p_k(t | h_k)      = (c_k(h_k, t) + alpha * p_{k-1}(t | h_{k-1})) / (total_k(h_k) + alpha)
// with h_1 empty, so p_1 IS the unigram arm and the two arms share one table.
export class NgramBackoff {
  /** @param {number} V @param {object} [opts] { order, alpha } */
  constructor(V, { order = 4, alpha = 1 } = {}) {
    this.V = V; this.order = order; this.alpha = alpha;
    this.tables = []; // index k-1 -> Map(contextKey -> { total, counts: Map })
    for (let k = 0; k < order; k++) this.tables.push(new Map());
    this.tokens = 0;
  }
  static key(ids, i, back) {
    if (back === 0) return '';
    let s = '';
    for (let j = i - back; j < i; j++) s += (j < 0 ? -1 : ids[j]) + ',';
    return s;
  }
  /** Local rule: see a token, add one to every order's count for the context that preceded it. */
  observe(ids, i) {
    const t = ids[i];
    for (let k = 1; k <= this.order; k++) {
      if (i - (k - 1) < 0) break;
      const table = this.tables[k - 1];
      const key = NgramBackoff.key(ids, i, k - 1);
      let e = table.get(key);
      if (!e) { e = { total: 0, counts: new Map() }; table.set(key, e); }
      e.counts.set(t, (e.counts.get(t) || 0) + 1);
      e.total++;
    }
    this.tokens++;
  }
  /** @param {Int32Array|number[]} ids @param {number} i position being predicted @param {number} [maxOrder] @returns {number} */
  probAt(ids, i, maxOrder = this.order) {
    const t = ids[i];
    let p = 1 / this.V;
    for (let k = 1; k <= maxOrder; k++) {
      if (i - (k - 1) < 0) break;
      const e = this.tables[k - 1].get(NgramBackoff.key(ids, i, k - 1));
      const c = e ? (e.counts.get(t) || 0) : 0;
      const total = e ? e.total : 0;
      p = (c + this.alpha * p) / (total + this.alpha);
    }
    return p;
  }
  /** Full distribution at position i, for sampling. @returns {Float32Array} */
  dist(ids, i, maxOrder = this.order) {
    let p = new Float32Array(this.V); p.fill(1 / this.V);
    for (let k = 1; k <= maxOrder; k++) {
      if (i - (k - 1) < 0) break;
      const e = this.tables[k - 1].get(NgramBackoff.key(ids, i, k - 1));
      const total = e ? e.total : 0;
      const denom = total + this.alpha;
      const next = new Float32Array(this.V);
      for (let v = 0; v < this.V; v++) next[v] = (this.alpha * p[v]) / denom;
      if (e) for (const [tok, c] of e.counts) next[tok] += c / denom;
      p = next;
    }
    return p;
  }
  sizeBytes() {
    let b = 0;
    for (const table of this.tables) for (const [key, e] of table) b += key.length + 8 + e.counts.size * 8;
    return b;
  }
  stats() { return this.tables.map((t, k) => ({ order: k + 1, contexts: t.size })); }
}

// ---------------------------------------------------------------- the hv associative memory
//
// Address: the context vector's own sign pattern against m fixed random probes. Two contexts
// that share their recent tokens land in the same bucket, which is the generalization this
// arm is for. Value: an integer accumulator of dimension d, into which the quantum of every
// token that followed is added. That accumulator IS a bundle: superposition, weighted by how
// often each token followed. Reading it is a cleanup, a dot against the whole codebook.
export class HvAssociative {
  /** @param {Tokenizer} tok @param {object} [opts] { bits: address bits, context: tokens bundled, seed, floor } */
  constructor(tok, { bits: addrBits = 11, context = 4, seed = 'mind:lsh', floor = 0.05 } = {}) {
    this.tok = tok; this.d = tok.d; this.V = tok.size;
    this.bits = addrBits; this.context = context; this.floor = floor;
    this.beta = 1.5; // decoding sharpness, chosen on dev
    const rng = new RNG(seed + ':' + addrBits + ':' + this.d);
    this.probes = [];
    for (let i = 0; i < addrBits; i++) this.probes.push(S.hvRandom(rng, this.d));
    this.acc = new Map();   // bucket -> Int32Array(d)
    this.hits = new Map();  // bucket -> how many tokens were written there
    this.cache = new Map(); // bucket -> standardized cleanup scores (Float32Array(V))
    this.writes = 0;
  }
  /** @param {Int8Array} v @returns {number} the bucket a context vector addresses */
  address(v) {
    let b = 0;
    for (let i = 0; i < this.bits; i++) b = (b << 1) | (S.sim(this.probes[i], v) >= 0 ? 1 : 0);
    return b;
  }
  /** The local rule: bundle the observed token's quantum into the bucket the context addressed. */
  observe(ctxVec, tokenId) {
    const b = this.address(ctxVec);
    let a = this.acc.get(b);
    if (!a) { a = new Int32Array(this.d); this.acc.set(b, a); }
    const q = this.tok.quantum(tokenId);
    for (let i = 0; i < this.d; i++) a[i] += q[i];
    this.hits.set(b, (this.hits.get(b) || 0) + 1);
    this.writes++;
    this.cache.delete(b);
  }
  /**
   * Cleanup: the standardized similarity of every token quantum with the bucket's
   * superposition. Memoized per bucket because after training a bucket never changes.
   * @param {number} b
   * @returns {Float32Array|null}
   */
  scores(b) {
    const cached = this.cache.get(b);
    if (cached) return cached;
    const a = this.acc.get(b);
    if (!a) return null;
    const M = this.tok.codebook(), V = this.V, d = this.d;
    const s = new Float32Array(V);
    for (let t = 0; t < V; t++) {
      let dot = 0;
      const off = t * d;
      for (let i = 0; i < d; i++) dot += M[off + i] * a[i];
      s[t] = dot;
    }
    let mean = 0; for (let t = 0; t < V; t++) mean += s[t];
    mean /= V;
    let varr = 0; for (let t = 0; t < V; t++) { const z = s[t] - mean; varr += z * z; }
    const sd = Math.sqrt(varr / V) || 1;
    for (let t = 0; t < V; t++) s[t] = (s[t] - mean) / sd;
    this.cache.set(b, s);
    return s;
  }
  /**
   * The distribution this memory predicts for a context, floored toward a background so a
   * bucket that has never seen a token still gives it a probability.
   * @param {Int8Array} ctxVec
   * @param {Float32Array} background unigram distribution
   * @returns {Float32Array}
   */
  dist(ctxVec, background) {
    const s = this.scores(this.address(ctxVec));
    if (!s) return background;
    const V = this.V, out = new Float32Array(V);
    let max = -Infinity;
    for (let t = 0; t < V; t++) { const z = this.beta * s[t]; if (z > max) max = z; }
    let sum = 0;
    for (let t = 0; t < V; t++) { const e = Math.exp(this.beta * s[t] - max); out[t] = e; sum += e; }
    const f = this.floor, g = (1 - f) / sum;
    for (let t = 0; t < V; t++) out[t] = g * out[t] + f * background[t];
    return out;
  }
  /** @returns {number} */
  probAt(ctxVec, tokenId, background) { return this.dist(ctxVec, background)[tokenId]; }
  sizeBytes() { return this.acc.size * this.d * 4 + this.probes.length * this.d; }
  stats() { return { buckets: this.acc.size, capacity: 2 ** this.bits, writes: this.writes, beta: this.beta }; }
}

// ---------------------------------------------------------------- the whole mind
export class MindModel {
  /**
   * @param {object} [opts] { d, vocabSize, order, alpha, bits, context, devFraction }
   */
  constructor({ d = MIND_D, vocabSize = 512, order = 4, alpha = 1, bits: addrBits = 11, context = 4, devFraction = 0.15 } = {}) {
    this.opts = { d, vocabSize, order, alpha, bits: addrBits, context, devFraction };
    this.tok = new Tokenizer({ d, vocabSize });
    this.ngram = null; this.hv = null; this.V = 0;
    this.weights = { ngram: 1, hv: 0, uni: 0 };
    this.timing = { tokenizerMs: 0, trainMs: 0 };
  }

  /**
   * One pass over the corpus with local rules only.
   * @param {string} trainText
   * @returns {object} what was learned, every number measured here
   */
  train(trainText) {
    const bytes = Buffer.from(trainText, 'utf8');
    const tk = this.tok.train(bytes);
    this.timing.tokenizerMs = tk.ms;
    this.V = this.tok.size;
    const ids = this.tok.encode(bytes);
    this.trainIds = ids;
    const t0 = Date.now();
    this.ngram = new NgramBackoff(this.V, { order: this.opts.order, alpha: this.opts.alpha });
    this.hv = new HvAssociative(this.tok, { bits: this.opts.bits, context: this.opts.context });
    const devStart = Math.floor(ids.length * (1 - this.opts.devFraction));
    // fit on the first part
    for (let i = 0; i < devStart; i++) this._observe(ids, i);
    // choose the decoding sharpness and the mixture weights on the dev slice, which the
    // fitted models have not seen yet
    const dev = this._componentProbs(ids, devStart, ids.length);
    this.hv.beta = this._chooseBeta(ids, devStart, ids.length);
    const dev2 = this._componentProbs(ids, devStart, ids.length);
    this.weights = this._chooseWeights(dev2);
    this.devBits = {
      ngram: this._bpt(dev2.ngram), hv: this._bpt(dev2.hv), uni: this._bpt(dev2.uni),
      mixture: this._bpt(this._mix(dev2, this.weights)),
      before: this._bpt(dev.hv),
    };
    // then finish the single pass: the dev slice is training text too
    for (let i = devStart; i < ids.length; i++) this._observe(ids, i);
    this.timing.trainMs = Date.now() - t0;
    return {
      tokenizer: tk, vocab: this.V, trainTokens: ids.length, devStart,
      ngram: this.ngram.stats(), hv: this.hv.stats(), weights: this.weights, devBits: this.devBits,
      trainMs: this.timing.trainMs,
    };
  }

  _observe(ids, i) {
    this.ngram.observe(ids, i);
    if (i > 0) {
      // The context vector is read by the associative arm for its address and kept by nobody,
      // so its slot goes back to the heap here. A synchronous run never reaches the event loop
      // turn that would otherwise return it, and the footprint bench measured the heap full
      // of exactly these within its first ticks.
      const ctx = this.tok.sequenceVector(ids.subarray(0, i), this.opts.context);
      this.hv.observe(ctx, ids[i]);
      S.release(ctx);
    }
  }

  /** The unigram distribution as a vector, used as the background of the hv arm. */
  background() {
    if (this._bg && this._bgTokens === this.ngram.tokens) return this._bg;
    const V = this.V, out = new Float32Array(V);
    const e = this.ngram.tables[0].get('');
    const total = e ? e.total : 0, a = this.ngram.alpha, u = 1 / V;
    for (let t = 0; t < V; t++) out[t] = (a * u) / (total + a);
    if (e) for (const [t, c] of e.counts) out[t] += c / (total + a);
    this._bg = out; this._bgTokens = this.ngram.tokens;
    return out;
  }

  /** Per token probabilities of each arm over a slice. @returns {{uniform, uni, ngram, hv, n}} */
  _componentProbs(ids, from, to) {
    const n = to - from;
    const uniform = new Float64Array(n), uni = new Float64Array(n), ng = new Float64Array(n), hv = new Float64Array(n);
    const bg = this.background(), pu = 1 / this.V;
    for (let k = 0; k < n; k++) {
      const i = from + k;
      uniform[k] = pu;
      uni[k] = this.ngram.probAt(ids, i, 1);
      ng[k] = this.ngram.probAt(ids, i);
      if (i > 0) { const ctx = this.tok.sequenceVector(ids.subarray(0, i), this.opts.context); hv[k] = this.hv.probAt(ctx, ids[i], bg); S.release(ctx); } else hv[k] = pu;
    }
    return { uniform, uni, ngram: ng, hv, n };
  }

  _bpt(arr) { let b = 0; for (let i = 0; i < arr.length; i++) b += bits(arr[i]); return b / Math.max(1, arr.length); }
  _mix(c, w) {
    const out = new Float64Array(c.n);
    for (let i = 0; i < c.n; i++) out[i] = w.ngram * c.ngram[i] + w.hv * c.hv[i] + w.uni * c.uni[i];
    return out;
  }

  /** Grid over the decoding sharpness, scored on dev only. */
  _chooseBeta(ids, from, to) {
    const bg = this.background();
    const vectors = [], targets = [];
    const step = Math.max(1, Math.floor((to - from) / 4000)); // a sample is enough to pick one scalar
    for (let i = from; i < to; i += step) {
      if (i === 0) continue;
      const ctx = this.tok.sequenceVector(ids.subarray(0, i), this.opts.context);
      vectors.push(this.hv.address(ctx));
      S.release(ctx);
      targets.push(ids[i]);
    }
    let best = this.hv.beta, bestBits = Infinity;
    for (const beta of [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6]) {
      this.hv.beta = beta;
      let b = 0, n = 0;
      for (let k = 0; k < vectors.length; k++) {
        const s = this.hv.scores(vectors[k]);
        let p;
        if (!s) p = bg[targets[k]];
        else {
          let max = -Infinity;
          for (let t = 0; t < this.V; t++) { const z = beta * s[t]; if (z > max) max = z; }
          let sum = 0, pt = 0;
          for (let t = 0; t < this.V; t++) { const e = Math.exp(beta * s[t] - max); sum += e; if (t === targets[k]) pt = e; }
          p = (1 - this.hv.floor) * (pt / sum) + this.hv.floor * bg[targets[k]];
        }
        b += bits(p); n++;
      }
      const avg = b / Math.max(1, n);
      if (avg < bestBits) { bestBits = avg; best = beta; }
    }
    this.hv.beta = best;
    return best;
  }

  /** Grid over the simplex in steps of 0.05, scored on dev only. */
  _chooseWeights(c) {
    let best = { ngram: 1, hv: 0, uni: 0 }, bestBits = Infinity;
    for (let a = 0; a <= 20; a++) for (let b = 0; a + b <= 20; b++) {
      const w = { ngram: a / 20, hv: b / 20, uni: (20 - a - b) / 20 };
      const bpt = this._bpt(this._mix(c, w));
      if (bpt < bestBits) { bestBits = bpt; best = w; }
    }
    return best;
  }

  /**
   * Grade every arm on text the model has never seen. Bits per BYTE, so the tokenizer cannot
   * buy the number by making tokens longer.
   * @param {string} text
   * @returns {object}
   */
  evaluate(text) {
    const bytes = Buffer.from(text, 'utf8');
    const ids = this.tok.encode(bytes);
    const t0 = Date.now();
    const c = this._componentProbs(ids, 0, ids.length);
    const ms = Date.now() - t0;
    const mix = this._mix(c, this.weights);
    const perByte = (arr) => { let b = 0; for (let i = 0; i < arr.length; i++) b += bits(arr[i]); return b / bytes.length; };
    return {
      bytes: bytes.length, tokens: ids.length,
      bytesPerToken: bytes.length / ids.length,
      bitsPerByte: {
        uniform: perByte(c.uniform), unigram: perByte(c.uni), ngram: perByte(c.ngram),
        hv: perByte(c.hv), mixture: perByte(mix),
      },
      bitsPerToken: {
        uniform: this._bpt(c.uniform), unigram: this._bpt(c.uni), ngram: this._bpt(c.ngram),
        hv: this._bpt(c.hv), mixture: this._bpt(mix),
      },
      weights: this.weights, beta: this.hv.beta, vocab: this.V,
      evalMs: ms, tokensPerSecond: ids.length / Math.max(1e-3, ms / 1000),
    };
  }

  /**
   * The mixture distribution at a position, for sampling.
   * @param {Int32Array|number[]} ids
   * @param {number} i
   * @returns {Float32Array}
   */
  dist(ids, i) {
    const bg = this.background();
    const ng = this.ngram.dist(ids, i);
    const uni = this.ngram.dist(ids, i, 1);
    let hv = bg;
    if (i > 0) { const ctx = this.tok.sequenceVector(ids.subarray ? ids.subarray(0, i) : ids.slice(0, i), this.opts.context); hv = this.hv.dist(ctx, bg); S.release(ctx); }
    const w = this.weights, V = this.V, out = new Float32Array(V);
    let sum = 0;
    for (let t = 0; t < V; t++) { const p = w.ngram * ng[t] + w.hv * hv[t] + w.uni * uni[t]; out[t] = p; sum += p; }
    for (let t = 0; t < V; t++) out[t] /= sum;
    return out;
  }

  /** The predicted next token hypervector: the superposition the memory holds for this context. */
  predictVector(ids) {
    if (!ids.length) return null;
    const ctx = this.tok.sequenceVector(ids, this.opts.context);
    const b = this.hv.address(ctx);
    S.release(ctx);
    const acc = this.hv.acc.get(b);
    if (!acc) return null;
    const out = new Int8Array(this.tok.d);
    for (let i = 0; i < out.length; i++) out[i] = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : 1;
    return out;
  }

  /** @returns {object} every part's size, measured from its actual structure */
  sizeBytes() {
    const tokenizer = this.tok.sizeBytes();
    const codebook = this.V * this.tok.d;
    const ngram = this.ngram ? this.ngram.sizeBytes() : 0;
    const hv = this.hv ? this.hv.sizeBytes() : 0;
    return { tokenizer, codebook, ngram, hv, total: tokenizer + codebook + ngram + hv };
  }
}

export { bits };
