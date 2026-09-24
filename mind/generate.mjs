// mind/generate.mjs: SAMPLING. The mixture gives a distribution over the whole vocabulary at
// every position; temperature reshapes it, top k truncates it, and a seeded RNG draws from it
// so a continuation is reproducible from its seed. Nothing here is a wrapper around anything.
import { RNG } from '../core/rng.mjs';

/**
 * Reshape a distribution by temperature and top k, then renormalize.
 * @param {Float32Array} p
 * @param {object} [opts] { temperature, topK }
 * @returns {Float32Array}
 */
export function shape(p, { temperature = 1, topK = 0 } = {}) {
  const V = p.length, out = new Float32Array(V);
  if (temperature <= 0) { // greedy: all mass on the argmax
    let best = 0;
    for (let t = 1; t < V; t++) if (p[t] > p[best]) best = t;
    out[best] = 1;
    return out;
  }
  const inv = 1 / temperature;
  let max = 0;
  for (let t = 0; t < V; t++) { out[t] = Math.pow(p[t], inv); if (out[t] > max) max = out[t]; }
  if (topK > 0 && topK < V) {
    const order = Array.from({ length: V }, (_, t) => t).sort((a, b) => out[b] - out[a]);
    for (let r = topK; r < V; r++) out[order[r]] = 0;
  }
  let sum = 0;
  for (let t = 0; t < V; t++) sum += out[t];
  if (sum === 0) { out.fill(1 / V); return out; }
  for (let t = 0; t < V; t++) out[t] /= sum;
  return out;
}

/**
 * Draw one index from a distribution with a seeded RNG.
 * @param {Float32Array} p
 * @param {RNG} rng
 * @returns {number}
 */
export function draw(p, rng) {
  const u = rng.u32() / 4294967296;
  let cum = 0;
  for (let t = 0; t < p.length; t++) { cum += p[t]; if (u < cum) return t; }
  return p.length - 1;
}

/**
 * Sample a continuation of a prompt.
 * @param {import('./model.mjs').MindModel} model
 * @param {string} prompt
 * @param {object} [opts] { maxTokens, temperature, topK, seed }
 * @returns {{prompt: string, text: string, full: string, tokens: number, ids: number[], bitsPerToken: number, ms: number}}
 */
export function generate(model, prompt, { maxTokens = 64, temperature = 0.8, topK = 40, seed = 'mind:gen' } = {}) {
  const rng = new RNG(String(seed));
  const ids = Array.from(model.tok.encode(Buffer.from(prompt, 'utf8')));
  const promptLen = ids.length;
  const t0 = Date.now();
  let bits = 0;
  for (let k = 0; k < maxTokens; k++) {
    const p = model.dist(Int32Array.from(ids), ids.length);
    const q = shape(p, { temperature, topK });
    const id = draw(q, rng);
    bits += -Math.log(Math.max(p[id], 1e-300)) / Math.log(2);
    ids.push(id);
  }
  const ms = Date.now() - t0;
  const full = Buffer.from(model.tok.decode(ids)).toString('utf8');
  const text = Buffer.from(model.tok.decode(ids.slice(promptLen))).toString('utf8');
  return {
    prompt, text, full, tokens: ids.length - promptLen, ids: ids.slice(promptLen),
    bitsPerToken: maxTokens ? bits / maxTokens : 0, ms,
    tokensPerSecond: (ids.length - promptLen) / Math.max(1e-3, ms / 1000),
  };
}
