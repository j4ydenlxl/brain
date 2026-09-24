// mind/tokenizer.mjs: TOKENS TO QUANTA.
//
// His words: "Instead of tokens, qubits are like quantum tokens". So a token here is not an
// integer that indexes an embedding matrix trained by gradient descent. A token is a
// quantum: an hv item in the same signal algebra every other cell in this organism already
// speaks (core/signal.mjs, kind 'hv'). Bind, bundle and permute are its operations, and a
// sequence of tokens is ONE vector, a bundle of permuted token quanta, not a growing list.
//
// The vocabulary is ours. Bytes are the floor (ids 0..255, so nothing is ever unrepresentable)
// and above them sit byte-pair merges learned from our own corpus by counting, never
// downloaded. Round trip is exact by construction: a merged id decodes to the concatenation
// of its two parts, so decode(encode(bytes)) is the identity on every byte string.
import * as S from '../core/signal.mjs';

export const MIND_D = 2048; // hypervector dimension for token quanta; see notes/mind.md

// A pair (a, b) of ids packs into one number so pair counting can use a Map of numbers.
const PAIR_SHIFT = 2 ** 21;
const packPair = (a, b) => a * PAIR_SHIFT + b;
const unpackPair = (k) => [Math.floor(k / PAIR_SHIFT), k % PAIR_SHIFT];

/**
 * The tokenizer: a learned byte-pair vocabulary plus the hv quantum of every token.
 */
export class Tokenizer {
  /**
   * @param {object} [opts] { d: hv dimension, vocabSize: target vocabulary, minCount: floor on a merge }
   */
  constructor({ d = MIND_D, vocabSize = 512, minCount = 2 } = {}) {
    this.d = d;
    this.vocabSize = vocabSize;
    this.minCount = minCount;
    this.merges = [];              // [aId, bId, newId] in the order they were learned
    this.mergeRank = new Map();    // packed pair -> [rank, newId]
    this.vocab = new Array(256);   // id -> Uint8Array of the bytes it stands for
    for (let i = 0; i < 256; i++) this.vocab[i] = Uint8Array.of(i);
    this.items = new S.ItemMemory(d); // id -> quantum, created on demand, deterministic by name
    this.trained = { merges: 0, corpusBytes: 0, startTokens: 0, endTokens: 0, ms: 0 };
  }

  /** @returns {number} how many ids exist (256 bytes plus every learned merge) */
  get size() { return this.vocab.length; }

  /**
   * Learn merges from a byte string by counting adjacent pairs, repeatedly merging the most
   * frequent one. Ties break toward the smaller packed pair so the vocabulary is a function
   * of the corpus and nothing else.
   * @param {Uint8Array|Buffer} bytes
   * @returns {{merges: number, corpusBytes: number, startTokens: number, endTokens: number, ms: number}}
   */
  train(bytes) {
    const t0 = Date.now();
    let seq = Int32Array.from(bytes);
    let n = seq.length;
    const startTokens = n;
    while (this.vocab.length < this.vocabSize) {
      const counts = new Map();
      for (let i = 0; i + 1 < n; i++) {
        const k = packPair(seq[i], seq[i + 1]);
        counts.set(k, (counts.get(k) || 0) + 1);
      }
      let bestKey = -1, bestCount = 0;
      for (const [k, c] of counts) {
        if (c > bestCount || (c === bestCount && bestKey >= 0 && k < bestKey)) { bestCount = c; bestKey = k; }
      }
      if (bestKey < 0 || bestCount < this.minCount) break;
      const [a, b] = unpackPair(bestKey);
      const id = this.vocab.length;
      const merged = new Uint8Array(this.vocab[a].length + this.vocab[b].length);
      merged.set(this.vocab[a], 0);
      merged.set(this.vocab[b], this.vocab[a].length);
      this.vocab.push(merged);
      this.mergeRank.set(bestKey, [this.merges.length, id]);
      this.merges.push([a, b, id]);
      // one linear pass rewrites the sequence in place, leftmost match wins
      let w = 0;
      for (let i = 0; i < n; i++) {
        if (i + 1 < n && seq[i] === a && seq[i + 1] === b) { seq[w++] = id; i++; }
        else seq[w++] = seq[i];
      }
      n = w;
    }
    this.trained = { merges: this.merges.length, corpusBytes: bytes.length, startTokens, endTokens: n, ms: Date.now() - t0 };
    return this.trained;
  }

  /**
   * Encode bytes to token ids by applying the learned merges in the order they were learned.
   * @param {Uint8Array|Buffer} bytes
   * @returns {Int32Array}
   */
  encode(bytes) {
    let seq = Int32Array.from(bytes);
    let n = seq.length;
    for (const [a, b, id] of this.merges) {
      let w = 0, hit = false;
      for (let i = 0; i < n; i++) {
        if (i + 1 < n && seq[i] === a && seq[i + 1] === b) { seq[w++] = id; i++; hit = true; }
        else seq[w++] = seq[i];
      }
      if (hit) n = w;
    }
    return seq.slice(0, n);
  }

  /**
   * Decode token ids back to the exact bytes they stand for.
   * @param {Int32Array|number[]} ids
   * @returns {Uint8Array}
   */
  decode(ids) {
    let total = 0;
    for (const id of ids) total += this.vocab[id].length;
    const out = new Uint8Array(total);
    let o = 0;
    for (const id of ids) { out.set(this.vocab[id], o); o += this.vocab[id].length; }
    return out;
  }

  /** @param {number} id @returns {string} the token's bytes as text (lone bytes may be partial utf8) */
  text(id) { return Buffer.from(this.vocab[id]).toString('utf8'); }

  /**
   * The quantum of a token: its hv item. Deterministic in the id and the dimension, so two
   * runs, two processes and two machines agree without shipping a weight file.
   * @param {number} id
   * @returns {Int8Array}
   */
  quantum(id) { return this.items.get('tok:' + this.d + ':' + id); }

  /**
   * The codebook as one flat Int8Array of size (vocab * d), row major. The cleanup memory
   * reads this as a matrix so decoding one hv into a distribution over tokens is one pass.
   * @returns {Int8Array}
   */
  codebook() {
    if (this._codebook && this._codebookSize === this.vocab.length) return this._codebook;
    const V = this.vocab.length, M = new Int8Array(V * this.d);
    for (let i = 0; i < V; i++) M.set(this.quantum(i), i * this.d);
    this._codebook = M; this._codebookSize = V;
    return M;
  }

  /**
   * A sequence as one vector: bundle of permuted quanta, the newest token permuted by 1 and
   * the oldest by k. Position is permutation, exactly as core/signal.mjs defines a sequence.
   * @param {Int32Array|number[]} ids newest last
   * @param {number} [k] how many trailing tokens to take
   * @returns {Int8Array}
   */
  sequenceVector(ids, k = ids.length) {
    const take = Math.min(k, ids.length);
    if (take === 0) return S.hvFromSeed('mind:empty:' + this.d, this.d);
    const list = new Array(take);
    for (let j = 0; j < take; j++) {
      const id = ids[ids.length - 1 - j];
      list[j] = S.permute(this.quantum(id), j + 1);
    }
    const out = S.bundle(list);
    // The permuted quanta are made here and read only by the bundle above, so this fold owns
    // them and returns their slots. Counted in the run (BRAIN_HV_HEAP_SITES=1, footprint row of
    // 12 majors over 200 ticks): this site made 231990 of the row's 299364 allocation attempts
    // and returned none, which is why the heap was full by the first ticks whatever its size.
    S.releaseAll(list, out);
    return out;
  }

  /** @returns {number} bytes the vocabulary itself occupies (merge table plus decoded byte strings) */
  sizeBytes() {
    let b = this.merges.length * 12;
    for (const v of this.vocab) b += v.length;
    return b;
  }

  /** @returns {object} a plain object the snapshot can hold */
  serialize() {
    return { d: this.d, vocabSize: this.vocabSize, minCount: this.minCount, merges: this.merges, trained: this.trained };
  }

  /** @param {object} j @returns {Tokenizer} */
  static from(j) {
    const t = new Tokenizer({ d: j.d, vocabSize: j.vocabSize, minCount: j.minCount });
    for (const [a, b, id] of j.merges) {
      const merged = new Uint8Array(t.vocab[a].length + t.vocab[b].length);
      merged.set(t.vocab[a], 0);
      merged.set(t.vocab[b], t.vocab[a].length);
      t.vocab[id] = merged;
      t.mergeRank.set(packPair(a, b), [t.merges.length, id]);
      t.merges.push([a, b, id]);
    }
    t.trained = j.trained || t.trained;
    return t;
  }
}
