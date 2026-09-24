// cells/sequence.mjs: SEQUENCE cells. Exact n-gram and Markov statistics over token event
// streams, a small exact-probability HMM (Viterbi), lossless num coders (delta, run-length),
// exact global alignment of two token arrays, and shortest-period pattern detection.
// Importing this module registers the kinds; it never edits core/* or the other libraries.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';

const first = (mail) => (mail.length ? mail[mail.length - 1].sig : null);

// ---------------------------------------------------------------- ngram.predict
defineKind('ngram.predict', {
  doc: 'Exact n-gram counts over an event { token } stream: params.n is the gram order (context length n-1). Emits the most likely next token for the current context (event { token, count, total }) and its exact probability as num, ties broken by first-seen token.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'token', kinds: ['event'] }, { name: 'prob', kinds: ['num'] }] },
  defaults: { n: 2 },
  init: () => ({ context: [], counts: new Map() }),
  compute: (ins, cell) => {
    const items = ins[0];
    if (!items.length) return [null, null];
    const order = Math.max(1, cell.params.n) - 1;
    for (const it of items) {
      const token = it.sig.data.token;
      if (cell.state.context.length === order) {
        const key = cell.state.context.join('');
        let m = cell.state.counts.get(key);
        if (!m) { m = new Map(); cell.state.counts.set(key, m); }
        m.set(token, (m.get(token) || 0) + 1);
      }
      cell.state.context.push(token);
      if (cell.state.context.length > order) cell.state.context.shift();
    }
    const key = cell.state.context.join('');
    const m = cell.state.counts.get(key);
    if (!m || !m.size) return [null, null];
    let best = null, bestCount = -1, total = 0;
    for (const [tok, c] of m) { total += c; if (c > bestCount) { bestCount = c; best = tok; } }
    return [{ kind: 'event', data: { token: best, count: bestCount, total } }, { kind: 'num', data: S.rat(bestCount, total) }];
  },
  serialize: (s) => ({ context: s.context, counts: [...s.counts].map(([k, m]) => [k, [...m]]) }),
  deserialize: (j) => ({ context: j.context, counts: new Map(j.counts.map(([k, m]) => [k, new Map(m)])) }),
});

// ---------------------------------------------------------------- markov.chain
defineKind('markov.chain', {
  doc: 'Learns exact transition counts between successive tokens of an event { token } stream (emitted as trans { from, to, count, total }). A sample event { from? } draws the next token from state (or the given from) weighted by its exact transition counts, using ctx.rng; emits { from, to, prob } (prob as a decimal/fraction string).',
  ports: { in: [{ name: 'in', kinds: ['event'] }, { name: 'sample', kinds: ['event'] }], out: [{ name: 'trans', kinds: ['event'] }, { name: 'sample', kinds: ['event'] }] },
  init: () => ({ last: null, counts: new Map() }),
  compute: (ins, cell, ctx) => {
    let outTrans = null;
    for (const it of ins[0]) {
      const token = it.sig.data.token;
      if (cell.state.last != null) {
        let m = cell.state.counts.get(cell.state.last);
        if (!m) { m = new Map(); cell.state.counts.set(cell.state.last, m); }
        m.set(token, (m.get(token) || 0) + 1);
        let total = 0; for (const c of m.values()) total += c;
        outTrans = { kind: 'event', data: { from: cell.state.last, to: token, count: m.get(token), total } };
      }
      cell.state.last = token;
    }
    let outSample = null;
    if (ins[1].length) {
      const req = ins[1][ins[1].length - 1].sig.data || {};
      const from = req.from ?? cell.state.last;
      const m = from != null ? cell.state.counts.get(from) : null;
      if (m && m.size) {
        const entries = [...m.entries()];
        let total = 0; for (const [, c] of entries) total += c;
        if (!ctx.rng) throw new Error('markov.chain: sample needs ctx.rng (run through a Brain, or pass one in ctx)');
        const r = ctx.rng.int(total);
        let cum = 0, chosen = entries[entries.length - 1][0];
        for (const [tok, c] of entries) { cum += c; if (r < cum) { chosen = tok; break; } }
        outSample = { kind: 'event', data: { from, to: chosen, prob: S.ratToString(S.rat(m.get(chosen), total)) } };
      } else {
        outSample = { kind: 'event', data: { from, to: null, prob: '0' } };
      }
    }
    return [outTrans, outSample];
  },
  serialize: (s) => ({ last: s.last, counts: [...s.counts].map(([k, m]) => [k, [...m]]) }),
  deserialize: (j) => ({ last: j.last, counts: new Map(j.counts.map(([k, m]) => [k, new Map(m)])) }),
});

// ---------------------------------------------------------------- hmm.viterbi
function parseProb(x) { return (x && typeof x === 'object') ? x : S.ratFromDecimal(String(x)); }
function buildHMM(params) {
  const states = params.states || [];
  const n = states.length;
  const init = {}, trans = {}, emissions = {};
  for (const s of states) {
    init[s] = parseProb((params.init && params.init[s] != null) ? params.init[s] : S.rat(1n, BigInt(Math.max(1, n))));
    trans[s] = {};
    for (const s2 of states) trans[s][s2] = parseProb(params.transitions?.[s]?.[s2] ?? 0);
    emissions[s] = {};
    const em = (params.emissions && params.emissions[s]) || {};
    for (const sym of Object.keys(em)) emissions[s][sym] = parseProb(em[sym]);
  }
  return { states, init, trans, emissions };
}
function emissionProb(model, state, sym) {
  const p = model.emissions[state][sym];
  return p === undefined ? S.rat(0n) : p;
}
// Exact-rational Viterbi: delta[t][state] = best joint probability of a path ending in
// state at step t; psi records the argmax predecessor for traceback.
function viterbiPath(model, obs) {
  const { states } = model;
  let delta = new Map();
  for (const s of states) delta.set(s, S.ratMul(model.init[s], emissionProb(model, s, obs[0])));
  const psi = [];
  for (let t = 1; t < obs.length; t++) {
    const next = new Map(), back = {};
    for (const s of states) {
      let bestPrev = null, bestVal = null;
      for (const sp of states) {
        const val = S.ratMul(delta.get(sp), model.trans[sp][s]);
        if (bestVal === null || S.ratCmp(val, bestVal) > 0) { bestVal = val; bestPrev = sp; }
      }
      next.set(s, S.ratMul(bestVal, emissionProb(model, s, obs[t])));
      back[s] = bestPrev;
    }
    psi.push(back);
    delta = next;
  }
  let bestState = null, bestVal = null;
  for (const s of states) { const v = delta.get(s); if (bestVal === null || S.ratCmp(v, bestVal) > 0) { bestVal = v; bestState = s; } }
  const path = [bestState];
  for (let t = psi.length - 1; t >= 0; t--) { bestState = psi[t][bestState]; path.unshift(bestState); }
  return { path, prob: bestVal };
}
defineKind('hmm.viterbi', {
  doc: 'Small HMM (params.states, params.init, params.transitions, params.emissions as exact decimal/fraction probabilities). Buffers a trailing window (params.window) of event { symbol } observations and emits the best hidden-state path over that window (Viterbi, exact rational arithmetic).',
  ports: { in: [{ name: 'obs', kinds: ['event'] }], out: [{ name: 'path', kinds: ['event'] }] },
  defaults: { window: 3, states: [], transitions: {}, emissions: {}, init: null },
  init: (p) => ({ model: buildHMM(p), buffer: [] }),
  compute: (ins, cell) => {
    for (const it of ins[0]) { cell.state.buffer.push(it.sig.data.symbol); if (cell.state.buffer.length > cell.params.window) cell.state.buffer.shift(); }
    if (cell.state.buffer.length < cell.params.window) return [null];
    const { path, prob } = viterbiPath(cell.state.model, cell.state.buffer);
    return [{ kind: 'event', data: { path, obs: [...cell.state.buffer], prob: S.ratToString(prob) } }];
  },
  serialize: (s) => ({ buffer: s.buffer }),
  deserialize: (j, cell) => ({ model: buildHMM(cell.params), buffer: j.buffer || [] }),
});

// ---------------------------------------------------------------- delta.coder
defineKind('delta.coder', {
  doc: 'params.mode "encode": emits the exact successive difference of a num stream (first value is its delta from zero). "decode": emits the exact running sum of a delta stream, recovering the original values.',
  ports: { in: [{ name: 'in', kinds: ['num'] }], out: [{ name: 'out', kinds: ['num'] }] },
  defaults: { mode: 'encode' },
  init: () => ({ prev: S.rat(0n) }),
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null];
    if (cell.params.mode === 'encode') {
      const d = S.ratSub(s.data, cell.state.prev);
      cell.state.prev = s.data;
      return [{ kind: 'num', data: d }];
    }
    const v = S.ratAdd(cell.state.prev, s.data);
    cell.state.prev = v;
    return [{ kind: 'num', data: v }];
  },
  serialize: (s) => ({ prev: S.numToJSON(s.prev) }),
  deserialize: (j) => ({ prev: S.numFromJSON(j.prev) }),
});

// ---------------------------------------------------------------- runlength.coder
defineKind('runlength.coder', {
  doc: 'params.mode "encode": buffers an exact num stream on the in port and, whenever the value changes or a flush event arrives, emits the just-completed run as event { value, count } (value as an exact decimal/fraction string). "decode": expands run events { value, count } from the in port back into the exact num stream, one value per run cell (drain over successive ticks).',
  ports: { in: [{ name: 'in', kinds: ['num', 'event'] }, { name: 'flush', kinds: ['event'] }], out: [{ name: 'out', kinds: ['num', 'event'] }] },
  defaults: { mode: 'encode' },
  init: () => ({ run: null, queue: [] }),
  compute: (ins, cell) => {
    if (cell.params.mode === 'encode') {
      const s = first(ins[0]);
      let out = null;
      if (s) {
        if (!cell.state.run) cell.state.run = { value: s.data, count: 1 };
        else if (S.ratEq(cell.state.run.value, s.data)) cell.state.run.count++;
        else {
          out = { kind: 'event', data: { value: S.ratToString(cell.state.run.value), count: cell.state.run.count } };
          cell.state.run = { value: s.data, count: 1 };
        }
      } else if (ins[1].length && cell.state.run) {
        out = { kind: 'event', data: { value: S.ratToString(cell.state.run.value), count: cell.state.run.count } };
        cell.state.run = null;
      }
      return [out];
    }
    const s = first(ins[0]);
    if (s) { const v = S.ratFromDecimal(s.data.value); for (let i = 0; i < s.data.count; i++) cell.state.queue.push(v); }
    if (!cell.state.queue.length) return [null];
    return [{ kind: 'num', data: cell.state.queue.shift() }];
  },
  serialize: (s) => ({ run: s.run ? { value: S.numToJSON(s.run.value), count: s.run.count } : null, queue: s.queue.map(S.numToJSON) }),
  deserialize: (j) => ({ run: j.run ? { value: S.numFromJSON(j.run.value), count: j.run.count } : null, queue: (j.queue || []).map(S.numFromJSON) }),
});

// ---------------------------------------------------------------- sequence.align
function needlemanWunsch(a, b, { match, mismatch, gap }) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i * gap;
  for (let j = 0; j <= m; j++) dp[0][j] = j * gap;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const sub = a[i - 1] === b[j - 1] ? match : mismatch;
    dp[i][j] = Math.max(dp[i - 1][j - 1] + sub, dp[i - 1][j] + gap, dp[i][j - 1] + gap);
  }
  let i = n, j = m; const alignedA = [], alignedB = [];
  while (i > 0 || j > 0) {
    const sub = (i > 0 && j > 0) ? (a[i - 1] === b[j - 1] ? match : mismatch) : null;
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + sub) { alignedA.unshift(a[i - 1]); alignedB.unshift(b[j - 1]); i--; j--; }
    else if (i > 0 && dp[i][j] === dp[i - 1][j] + gap) { alignedA.unshift(a[i - 1]); alignedB.unshift(null); i--; }
    else { alignedA.unshift(null); alignedB.unshift(b[j - 1]); j--; }
  }
  return { score: dp[n][m], a: alignedA, b: alignedB };
}
defineKind('sequence.align', {
  doc: 'Needleman-Wunsch global alignment of the latest token arrays on ports a and b (event { tokens: [...] }), with exact integer match/mismatch/gap scores from params. Emits { score, a, b } (the two aligned rows, null standing for a gap) whenever both sides are known.',
  ports: { in: [{ name: 'a', kinds: ['event'] }, { name: 'b', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { match: 1, mismatch: -1, gap: -2 },
  init: () => ({ a: null, b: null }),
  compute: (ins, cell) => {
    const a = first(ins[0]), b = first(ins[1]);
    if (a) cell.state.a = a.data.tokens;
    if (b) cell.state.b = b.data.tokens;
    if (!cell.state.a || !cell.state.b) return [null];
    return [{ kind: 'event', data: needlemanWunsch(cell.state.a, cell.state.b, cell.params) }];
  },
  serialize: (s) => ({ a: s.a, b: s.b }),
  deserialize: (j) => ({ a: j.a, b: j.b }),
});

// ---------------------------------------------------------------- pattern.detect
defineKind('pattern.detect', {
  doc: 'Buffers an event { token } stream (trailing params.maxWindow tokens). Whenever the trailing window holds two consecutive equal-length copies of a pattern, emits the shortest such period as event { period, pattern }; otherwise null.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { maxWindow: 64 },
  init: () => ({ buffer: [] }),
  compute: (ins, cell) => {
    for (const it of ins[0]) { cell.state.buffer.push(it.sig.data.token); if (cell.state.buffer.length > cell.params.maxWindow) cell.state.buffer.shift(); }
    const buf = cell.state.buffer, n = buf.length;
    for (let p = 1; p <= Math.floor(n / 2); p++) {
      let ok = true;
      for (let i = 0; i < p; i++) if (buf[n - 1 - i] !== buf[n - 1 - i - p]) { ok = false; break; }
      if (ok) return [{ kind: 'event', data: { period: p, pattern: buf.slice(n - p) } }];
    }
    return [null];
  },
  serialize: (s) => ({ buffer: s.buffer }),
  deserialize: (j) => ({ buffer: j.buffer }),
});
