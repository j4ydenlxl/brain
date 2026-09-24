// mind/index.mjs: THE LANGUAGE REGION.
//
// Importing this module registers four cell kinds, so a Brain can hold the language model
// the way it holds everything else: as cells, in circuits, in a region, wired by the
// connectome, ticked by the clock, recorded in the ledger. Bytes go in at the perception
// port of the tokenizer circuit; predictions come out of the memory and decode circuits;
// the prediction error of every tick is written to the cell that made the prediction.
//
// A cell's params are serialized with the cell, so a param cannot hold a live object. Same
// constraint the memory tiers hit, same answer: a registry keyed by name (notes/mind.md).
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { MindModel } from './model.mjs';

const MODELS = new Map();

/** @param {string} name @param {MindModel} model @returns {MindModel} */
export function registerMind(name, model) { MODELS.set(name, model); return model; }
/** @param {string} [name] @returns {MindModel} */
export function getMind(name = 'default') {
  const m = MODELS.get(name);
  if (!m) throw new Error('mind: no model registered as ' + name + ' (registered: ' + [...MODELS.keys()].join(', ') + ')');
  return m;
}
/** @param {string} name @returns {boolean} */
export function hasMind(name) { return MODELS.has(name); }
/** @param {string} name @returns {boolean} */
export function unregisterMind(name) { return MODELS.delete(name); }
/** @returns {string[]} */
export function listMinds() { return [...MODELS.keys()]; }

const last = (mail) => (mail.length ? mail[mail.length - 1].sig : null);
const LOG2 = Math.log(2);

// ---------------------------------------------------------------- mind.tokenize
defineKind('mind.tokenize', {
  doc: 'The perception port of language. Accepts event { text } or { bytes: [...] }, encodes it with the learned byte pair vocabulary, and emits one token per run as event { id, text, remaining } so the pipeline drains at one token per tick. Perception takes its input from OUTSIDE the organism: an item that arrived over an edge (it.e >= 0) is ignored unless params.acceptWired says otherwise, so no grown edge can feed the brain its own output as though it were the world.',
  ports: { in: [{ name: 'bytes', kinds: ['event'] }], out: [{ name: 'token', kinds: ['event'] }] },
  defaults: { model: 'default', acceptWired: false },
  init: () => ({ queue: [] }),
  compute: (ins, cell) => {
    const model = getMind(cell.params.model);
    for (const it of ins[0]) {
      if (it.e >= 0 && !cell.params.acceptWired) continue;
      const d = it.sig.data || {};
      if (d.bytes === undefined && d.text === undefined) continue;
      const bytes = d.bytes ? Uint8Array.from(d.bytes) : Buffer.from(String(d.text ?? ''), 'utf8');
      if (!bytes.length) continue;
      for (const id of model.tok.encode(bytes)) cell.state.queue.push(id);
    }
    if (!cell.state.queue.length) return [null];
    const id = cell.state.queue.shift();
    return [{ kind: 'event', data: { id, text: model.tok.text(id), remaining: cell.state.queue.length } }];
  },
  serialize: (s) => ({ queue: s.queue }),
  deserialize: (j) => ({ queue: j.queue || [] }),
});

// ---------------------------------------------------------------- mind.context
defineKind('mind.context', {
  doc: 'The context bundle. Holds the trailing params.context tokens and emits, for every token that arrives, the hypervector of the context that PRECEDED it (a bundle of permuted token quanta, position carried by permutation) on the ctx port, and that token itself on the observed port. Both leave in the same run so the memory sees a context and its answer together.',
  ports: { in: [{ name: 'token', kinds: ['event'] }], out: [{ name: 'ctx', kinds: ['hv'] }, { name: 'observed', kinds: ['event'] }] },
  defaults: { model: 'default', context: 4 },
  init: () => ({ history: [] }),
  compute: (ins, cell) => {
    const sig = last(ins[0]);
    if (!sig) return [null, null];
    const model = getMind(cell.params.model);
    const k = cell.params.context;
    const ctx = model.tok.sequenceVector(cell.state.history, k);
    const id = sig.data.id;
    cell.state.history.push(id);
    if (cell.state.history.length > k) cell.state.history.shift();
    return [{ kind: 'hv', data: ctx }, { kind: 'event', data: { id, text: model.tok.text(id), n: cell.state.history.length } }];
  },
  serialize: (s) => ({ history: s.history }),
  deserialize: (j) => ({ history: j.history || [] }),
});

// ---------------------------------------------------------------- mind.assoc
defineKind('mind.assoc', {
  doc: 'The associative memory and the prediction loop. Reads a context hypervector, mixes the n gram backoff, the hv associative memory and the unigram background into one distribution, and when the observed token arrives in the same run scores it: surprise in bits is written to cell.stats.surprise, emitted on the error port, and reported on the pred port. With params.learn true it also writes the observation back into both memories with local rules.',
  ports: {
    in: [{ name: 'ctx', kinds: ['hv'] }, { name: 'observed', kinds: ['event'] }],
    out: [{ name: 'hv', kinds: ['hv'] }, { name: 'pred', kinds: ['event'] }, { name: 'error', kinds: ['num'] }],
  },
  defaults: { model: 'default', learn: false, keep: 64 },
  init: () => ({ ids: [], bits: 0, n: 0 }),
  compute: (ins, cell) => {
    const ctxSig = last(ins[0]), obsSig = last(ins[1]);
    if (!ctxSig) return [null, null, null];
    const model = getMind(cell.params.model);
    const bg = model.background();
    const ctx = ctxSig.data;
    const i = cell.state.ids.length;
    const hvDist = model.hv.dist(ctx, bg);
    const ngDist = model.ngram.dist(cell.state.ids, i);
    const uniDist = model.ngram.dist(cell.state.ids, i, 1);
    const w = model.weights, V = model.V;
    const mix = new Float32Array(V);
    let sum = 0, best = 0;
    for (let t = 0; t < V; t++) { const p = w.ngram * ngDist[t] + w.hv * hvDist[t] + w.uni * uniDist[t]; mix[t] = p; sum += p; }
    for (let t = 0; t < V; t++) { mix[t] /= sum; if (mix[t] > mix[best]) best = t; }
    const predVec = model.predictVector(cell.state.ids) || model.tok.quantum(best);

    let pred = { next: best, text: model.tok.text(best), p: mix[best] };
    let err = null;
    if (obsSig) {
      const obs = obsSig.data.id;
      const p = mix[obs];
      const b = -Math.log(Math.max(p, 1e-300)) / LOG2;
      cell.stats.surprise = b;
      cell.state.bits += b; cell.state.n++;
      pred = { ...pred, observed: obs, observedText: model.tok.text(obs), pObserved: p, bits: b, meanBits: cell.state.bits / cell.state.n };
      err = { kind: 'num', data: S.flt(b) };
      cell.memory.working.push({ observed: obs, bits: Number(b.toFixed(6)) });
      if (cell.memory.working.length > cell.params.keep) cell.memory.working.shift();
      cell.state.ids.push(obs);
      if (cell.params.learn) {
        model.ngram.observe(cell.state.ids, cell.state.ids.length - 1);
        model.hv.observe(ctx, obs);
      }
    }
    return [{ kind: 'hv', data: predVec }, { kind: 'event', data: pred }, err];
  },
  serialize: (s) => ({ ids: s.ids, bits: s.bits, n: s.n }),
  deserialize: (j) => ({ ids: j.ids || [], bits: j.bits || 0, n: j.n || 0 }),
});

// ---------------------------------------------------------------- mind.decode
defineKind('mind.decode', {
  doc: 'The cleanup memory. Takes a hypervector and names it: the nearest token quantum in the codebook, with its similarity. This is how a superposition becomes a symbol again.',
  ports: { in: [{ name: 'hv', kinds: ['hv'] }], out: [{ name: 'token', kinds: ['event'] }] },
  defaults: { model: 'default', threshold: 0 },
  compute: (ins, cell) => {
    const sig = last(ins[0]);
    if (!sig) return [null];
    const model = getMind(cell.params.model);
    const M = model.tok.codebook(), d = model.tok.d, V = model.V, v = sig.data;
    let best = -1, bestSim = -Infinity;
    for (let t = 0; t < V; t++) {
      let dot = 0; const off = t * d;
      for (let i = 0; i < d; i++) dot += M[off + i] * v[i];
      const s = dot / d;
      if (s > bestSim) { bestSim = s; best = t; }
    }
    if (bestSim < cell.params.threshold) return [{ kind: 'event', data: { id: null, text: null, sim: bestSim } }];
    return [{ kind: 'event', data: { id: best, text: model.tok.text(best), sim: bestSim } }];
  },
});

/**
 * Install the language region into a Brain: four circuits, four cells, three wires.
 *
 *   tokenizer  mind.tokenize   bytes in at the perception port
 *   context    mind.context    the trailing tokens as one hypervector
 *   memory     mind.assoc      prediction, prediction error, and the next token vector
 *   decode     mind.decode     the cleanup that names a vector
 *
 * @param {object} brain a core/brain.mjs Brain
 * @param {object} [opts] { model: registered model name, prefix: cell id prefix, learn, context }
 * @returns {{region: string, tokenize: string, context: string, assoc: string, decode: string}}
 */
export function installLanguage(brain, { model = 'default', prefix = 'lang', learn = false, context = 4 } = {}) {
  const m = getMind(model);
  brain.addRegion('language', { doc: 'Our own language model, held as cells: tokens are hypervector quanta, context is one bundle, prediction is an associative read.' });
  const ids = {
    region: 'language',
    tokenize: prefix + '.tokenize', context: prefix + '.context',
    assoc: prefix + '.assoc', decode: prefix + '.decode',
  };
  brain.addCell({ id: ids.tokenize, kind: 'mind.tokenize', region: 'language', circuit: 'tokenizer', params: { model } });
  brain.addCell({ id: ids.context, kind: 'mind.context', region: 'language', circuit: 'context', params: { model, context: context ?? m.opts.context } });
  brain.addCell({ id: ids.assoc, kind: 'mind.assoc', region: 'language', circuit: 'memory', params: { model, learn } });
  brain.addCell({ id: ids.decode, kind: 'mind.decode', region: 'language', circuit: 'decode', params: { model } });
  brain.connect(ids.tokenize, 'token', ids.context, 'token');
  // both edges carry the same delay, so the context and the token it precedes reach the
  // memory in the same run (notes/mind.md, request 2)
  brain.connect(ids.context, 'ctx', ids.assoc, 'ctx');
  brain.connect(ids.context, 'observed', ids.assoc, 'observed');
  brain.connect(ids.assoc, 'hv', ids.decode, 'hv');
  sealRegion(brain, [ids.tokenize, ids.context, ids.assoc, ids.decode]);
  return ids;
}

/**
 * The language pipeline is engineered structure, not discovered structure, and every cell in
 * it fires on every tick, which makes it the strongest co-activation signal in the brain.
 * Left alone, the growth tracker proposes an edge between any two of them after eight ticks,
 * the gate approves it on that evidence, and a decoder wired back into the perception port
 * turns the region into a loop that feeds itself its own output forever. Measured: the
 * tokenizer queue stalled at 4 and the memory went on scoring tokens that were never fed.
 *
 * Computation is not authority, so the answer is the gate rather than a special case in the
 * connectome: wrap the brain's policy so a grow proposal that touches these cells is
 * refused, with every other proposal handed to the policy that was already there. The
 * refusal is a ledger event like any other, so the fact that the region is sealed is
 * observable rather than invisible.
 * @param {object} brain
 * @param {string[]} cellIds
 */
export function sealRegion(brain, cellIds) {
  const sealed = new Set(cellIds);
  const inner = brain.gate.policy;
  if (inner.__mindSealed) { for (const id of sealed) inner.__mindSealed.add(id); return; }
  const policy = (p, ctx) => {
    if (p.kind === 'edge.grow' || p.kind === 'edge.replace') {
      const w = p.what || {};
      if (sealed.has(w.src) || sealed.has(w.dst)) return 'reject';
    }
    return inner(p, ctx);
  };
  policy.__mindSealed = sealed;
  brain.gate.policy = policy;
}

/**
 * Feed text in at the perception port and tick until the tokenizer queue has drained.
 * @param {object} brain
 * @param {object} ids what installLanguage returned
 * @param {string} text
 * @param {object} [opts] { maxTicks }
 * @returns {{ticks: number, tokens: number, meanBits: number, predictions: object[]}}
 */
export function feed(brain, ids, text, { maxTicks = 0 } = {}) {
  const assoc = brain.cell(ids.assoc);
  const before = assoc.state.n;
  brain.inject(ids.tokenize, 'bytes', { kind: 'event', data: { text } });
  const tokenCell = brain.cell(ids.tokenize);
  const budget = maxTicks || (Buffer.byteLength(text) + 16) * 2;
  let ticks = 0;
  for (; ticks < budget; ticks++) {
    brain.tick(1);
    // drained when the tokenizer has no tokens left, nothing is still in flight between the
    // circuits, and the memory has scored at least one of them
    if (ticks >= 3 && tokenCell.state.queue.length === 0 && !hasInflight(brain) && assoc.state.n > before) { ticks++; break; }
  }
  const predictions = brain.takeOutbox().filter(s => s.kind === 'event' && s.data && s.data.observed !== undefined).map(s => s.data);
  return { ticks, tokens: assoc.state.n - before, meanBits: assoc.state.n ? assoc.state.bits / assoc.state.n : 0, predictions };
}
function hasInflight(brain) { for (const l of brain.inflight.values()) if (l.length) return true; return false; }

export { MindModel };
