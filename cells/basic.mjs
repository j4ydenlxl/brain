// cells/basic.mjs: the first cell library, composed from primitives. Importing this
// module registers the kinds. Every kind declares its ports and the signal kinds they carry.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import * as P from '../core/primitives.mjs';

const ANY = S.KINDS.slice(); // every kind; the port a source feeds is checked at wiring (overlap) and at emit (exact)
const sigs = (m) => m.map(it => it.sig);
const first = (m) => (m.length ? m[m.length - 1].sig : null);

// ---------------------------------------------------------------- sources and sinks
defineKind('source.const', {
  doc: 'Emits a constant signal every run.',
  ports: { in: [], out: [{ name: 'out', kinds: ANY }] },
  init: (p) => ({ kind: p.kind, data: p.data }),
  compute: (ins, cell) => [{ kind: cell.state.kind, data: cell.state.data }],
});
defineKind('source.counter', {
  doc: 'Emits an exact integer that increments every run.',
  ports: { in: [], out: [{ name: 'out', kinds: ['num'] }] },
  init: () => ({ n: 0 }),
  compute: (ins, cell) => [{ kind: 'num', data: S.int(cell.state.n++) }],
  serialize: (s) => ({ n: s.n }),
});
defineKind('sink.log', {
  doc: 'Keeps the last N signals it received in working memory.',
  ports: { in: [{ name: 'in', kinds: ANY }], out: [] },
  defaults: { keep: 64 },
  compute: (ins, cell) => {
    for (const it of ins[0]) { cell.memory.working.push({ t: it.sig.t, kind: it.sig.kind, hash: S.hashSignal(it.sig) }); if (cell.memory.working.length > cell.params.keep) cell.memory.working.shift(); }
    return [];
  },
});

// ---------------------------------------------------------------- perception: text/events -> hv
defineKind('encode.hv', {
  doc: 'Encodes an event { tokens: [...] } or { text } into a hypervector: sequence of item vectors.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'hv', kinds: ['hv'] }] },
  defaults: { sequence: true },
  init: () => ({ items: new S.ItemMemory() }),
  compute: (ins, cell) => {
    const sig = first(ins[0]); if (!sig) return [null];
    const tokens = sig.data.tokens || String(sig.data.text || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [null];
    const vs = tokens.map(t => cell.state.items.get(t));
    // own: both branches allocate a fresh vector (hvSequence permutes every member, bundle
    // writes a new one) and this kind keeps no reference to it, so the signal owns it.
    return [{ kind: 'hv', data: cell.params.sequence ? S.hvSequence(vs) : S.bundle(vs), own: true }];
  },
  serialize: (s) => ({ items: s.items.serialize() }),
  deserialize: (j) => ({ items: S.ItemMemory.from(j.items) }),
});
defineKind('hv.cleanup', {
  doc: 'Nearest named concept for an hv, learning new names when told { name } on the label port.',
  ports: { in: [{ name: 'hv', kinds: ['hv'] }, { name: 'label', kinds: ['event'] }], out: [{ name: 'match', kinds: ['event'] }] },
  defaults: { threshold: 0.1 },
  init: () => ({ items: new S.ItemMemory() }),
  compute: (ins, cell) => {
    const hv = first(ins[0]), label = first(ins[1]);
    // the codebook keeps this vector past the tick, so it keeps its OWN copy: the payload
    // belongs to the signal that carried it and goes back to the heap when the mail is consumed
    if (hv && label && label.data.name) cell.state.items.set(label.data.name, S.hvCopy(hv.data));
    if (!hv) return [null];
    const n = cell.state.items.nearest(hv.data);
    if (!n) return [{ kind: 'event', data: { name: null, sim: 0 } }];
    return [{ kind: 'event', data: { name: n[1] >= cell.params.threshold ? n[0] : null, sim: n[1] } }];
  },
  serialize: (s) => ({ items: s.items.serialize() }),
  deserialize: (j) => ({ items: S.ItemMemory.from(j.items) }),
});
// own is set on the three folds below only where the result is a vector this run made: a
// bindMany of ONE member returns that member, which is the payload of the mail that arrived
// and belongs to whoever sent it, so that case is left unowned and nothing releases it twice.
defineKind('hv.bind', { doc: 'Binds all hvs received this tick (role-filler).', ports: { in: [{ name: 'in', kinds: ['hv'] }], out: [{ name: 'out', kinds: ['hv'] }] },
  compute: (ins) => { const l = sigs(ins[0]); return [l.length ? { kind: 'hv', data: S.bindMany(l.map(s => s.data)), own: l.length > 1 } : null]; } });
defineKind('hv.bundle', { doc: 'Bundles all hvs received this tick, weighted by edge weight.', ports: { in: [{ name: 'in', kinds: ['hv'] }], out: [{ name: 'out', kinds: ['hv'] }] },
  compute: (ins) => { const m = ins[0]; return [m.length ? { kind: 'hv', data: S.bundle(m.map(it => it.sig.data), m.map(it => Math.max(0, it.w))), own: true } : null]; } });
defineKind('hv.permute', { doc: 'Permutes by k (sequence position / role shift).', ports: { in: [{ name: 'in', kinds: ['hv'] }], out: [{ name: 'out', kinds: ['hv'] }] }, defaults: { k: 1 },
  compute: (ins, cell) => { const s = first(ins[0]); return [s ? { kind: 'hv', data: S.permute(s.data, cell.params.k), own: true } : null]; } });
defineKind('hv.compare', { doc: 'Similarity of the two most recent hvs on ports a and b.', ports: { in: [{ name: 'a', kinds: ['hv'] }, { name: 'b', kinds: ['hv'] }], out: [{ name: 'sim', kinds: ['num'] }] },
  init: () => ({ a: null, b: null }),
  // both sides are held until the other arrives, which is past the tick they came in on, so
  // each is copied out of the payload it arrived as
  compute: (ins, cell) => { const a = first(ins[0]), b = first(ins[1]); if (a) cell.state.a = S.hvCopy(a.data); if (b) cell.state.b = S.hvCopy(b.data); if (!cell.state.a || !cell.state.b) return [null]; return [{ kind: 'num', data: S.flt(S.sim(cell.state.a, cell.state.b)) }]; },
  serialize: (s) => ({ a: s.a && S.dataToJSON('hv', s.a), b: s.b && S.dataToJSON('hv', s.b) }),
  deserialize: (j) => ({ a: j.a && S.dataFromJSON('hv', j.a), b: j.b && S.dataFromJSON('hv', j.b) }) });
defineKind('sdr.encode', { doc: 'Top-k sparse code of a vec.', ports: { in: [{ name: 'in', kinds: ['vec'] }], out: [{ name: 'out', kinds: ['sdr'] }] }, defaults: { k: 16 },
  compute: (ins, cell) => { const s = first(ins[0]); return [s ? { kind: 'sdr', data: S.sdrFromVec(s.data, cell.params.k) } : null]; } });

// ---------------------------------------------------------------- exact number and algebra cells
defineKind('num.arith', {
  doc: 'Exact rational arithmetic on the latest a and b: op in + - * / ^.',
  ports: { in: [{ name: 'a', kinds: ['num'] }, { name: 'b', kinds: ['num'] }], out: [{ name: 'out', kinds: ['num'] }] },
  defaults: { op: '+' },
  init: () => ({ a: null, b: null }),
  compute: (ins, cell) => {
    const a = first(ins[0]), b = first(ins[1]);
    if (a) cell.state.a = a.data; if (b) cell.state.b = b.data;
    const { a: x, b: y } = cell.state; if (x == null || y == null) return [null];
    const f = { '+': S.ratAdd, '-': S.ratSub, '*': S.ratMul, '/': S.ratDiv, '^': (p, q) => S.ratPow(p, S.toRat(q).n) }[cell.params.op];
    return [{ kind: 'num', data: f(x, y) }];
  },
  serialize: (s) => ({ a: s.a && S.numToJSON(s.a), b: s.b && S.numToJSON(s.b) }),
  deserialize: (j) => ({ a: j.a && S.numFromJSON(j.a), b: j.b && S.numFromJSON(j.b) }),
});
defineKind('num.compare', {
  doc: 'Exact order of a vs b: event { cmp: -1|0|1 }. 9.11 < 9.9 here, always.',
  ports: { in: [{ name: 'a', kinds: ['num'] }, { name: 'b', kinds: ['num'] }], out: [{ name: 'out', kinds: ['event'] }] },
  init: () => ({ a: null, b: null }),
  compute: (ins, cell) => { const a = first(ins[0]), b = first(ins[1]); if (a) cell.state.a = a.data; if (b) cell.state.b = b.data; if (cell.state.a == null || cell.state.b == null) return [null]; return [{ kind: 'event', data: { cmp: S.ratCmp(cell.state.a, cell.state.b), a: S.ratToString(cell.state.a), b: S.ratToString(cell.state.b) } }]; },
  serialize: (s) => ({ a: s.a && S.numToJSON(s.a), b: s.b && S.numToJSON(s.b) }),
  deserialize: (j) => ({ a: j.a && S.numFromJSON(j.a), b: j.b && S.numFromJSON(j.b) }),
});
defineKind('num.count', { doc: 'Counts items in an event { items: [...] } exactly.', ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['num'] }] },
  compute: (ins) => { const s = first(ins[0]); return [s ? { kind: 'num', data: P.count('event', s.data.items || []) } : null]; } });
defineKind('sym.eval', { doc: 'Evaluates a sym tree exactly under env from the env port (event of name -> decimal string).', ports: { in: [{ name: 'expr', kinds: ['sym'] }, { name: 'env', kinds: ['event'] }], out: [{ name: 'out', kinds: ['num'] }] },
  init: () => ({ env: {} }),
  compute: (ins, cell) => { const env = first(ins[1]); if (env) cell.state.env = { ...cell.state.env, ...env.data }; const e = first(ins[0]); if (!e) return [null]; return [{ kind: 'num', data: P.evalSym(e.data, cell.state.env) }]; } });
defineKind('sym.solve', { doc: 'Solves a linear equation in one variable exactly; emits { var, value } or { unsolved }.', ports: { in: [{ name: 'eq', kinds: ['sym'] }], out: [{ name: 'out', kinds: ['event'] }] }, defaults: { variable: 'x' },
  compute: (ins, cell) => { const e = first(ins[0]); if (!e) return [null]; const v = P.solveLinear(e.data, cell.params.variable); return [{ kind: 'event', data: v ? { var: cell.params.variable, value: S.ratToString(v) } : { unsolved: true } }]; } });
defineKind('sym.verify', { doc: 'Checks an equation exactly under env; emits { ok }.', ports: { in: [{ name: 'eq', kinds: ['sym'] }, { name: 'env', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
  init: () => ({ env: {} }),
  compute: (ins, cell) => { const env = first(ins[1]); if (env) cell.state.env = { ...cell.state.env, ...env.data }; const e = first(ins[0]); if (!e) return [null]; return [{ kind: 'event', data: P.verify('sym', e.data, null, cell.state.env) }]; } });

// ---------------------------------------------------------------- vec cells: a small NN with a local delta rule
defineKind('vec.mlp', {
  doc: 'One hidden layer MLP (tanh) with a local delta rule when a target arrives on the target port.',
  ports: { in: [{ name: 'x', kinds: ['vec'] }, { name: 'target', kinds: ['vec'] }], out: [{ name: 'y', kinds: ['vec'] }, { name: 'error', kinds: ['num'] }] },
  defaults: { nin: 8, nhid: 16, nout: 4, lr: 0.05, seed: 'mlp' },
  init: (p, cell) => {
    const rng = new (Object.getPrototypeOf(cellRng).constructor)(p.seed + ':' + cell.id);
    const W1 = new Float32Array(p.nhid * p.nin), b1 = new Float32Array(p.nhid), W2 = new Float32Array(p.nout * p.nhid), b2 = new Float32Array(p.nout);
    const s1 = 1 / Math.sqrt(p.nin), s2 = 1 / Math.sqrt(p.nhid);
    for (let i = 0; i < W1.length; i++) W1[i] = rng.gauss() * s1;
    for (let i = 0; i < W2.length; i++) W2[i] = rng.gauss() * s2;
    return { W1, b1, W2, b2, lastX: null, lastH: null, lastY: null, err: null };
  },
  compute: (ins, cell) => {
    const p = cell.params, s = cell.state;
    const xs = first(ins[0]), tg = first(ins[1]);
    let out = [null, null];
    if (xs) {
      const x = xs.data, h = new Float32Array(p.nhid), y = new Float32Array(p.nout);
      for (let j = 0; j < p.nhid; j++) { let a = s.b1[j]; for (let i = 0; i < p.nin; i++) a += s.W1[j * p.nin + i] * (x[i] || 0); h[j] = Math.tanh(a); }
      for (let k = 0; k < p.nout; k++) { let a = s.b2[k]; for (let j = 0; j < p.nhid; j++) a += s.W2[k * p.nhid + j] * h[j]; y[k] = a; }
      s.lastX = x; s.lastH = h; s.lastY = y;
      out[0] = { kind: 'vec', data: y };
    }
    if (tg && s.lastY) {
      const t = tg.data, dy = new Float32Array(p.nout); let se = 0;
      for (let k = 0; k < p.nout; k++) { dy[k] = s.lastY[k] - (t[k] || 0); se += dy[k] * dy[k]; }
      const dh = new Float32Array(p.nhid);
      for (let k = 0; k < p.nout; k++) { for (let j = 0; j < p.nhid; j++) { dh[j] += dy[k] * s.W2[k * p.nhid + j]; s.W2[k * p.nhid + j] -= p.lr * dy[k] * s.lastH[j]; } s.b2[k] -= p.lr * dy[k]; }
      for (let j = 0; j < p.nhid; j++) { const g = dh[j] * (1 - s.lastH[j] * s.lastH[j]); for (let i = 0; i < p.nin; i++) s.W1[j * p.nin + i] -= p.lr * g * (s.lastX[i] || 0); s.b1[j] -= p.lr * g; }
      s.err = Math.sqrt(se / p.nout);
      cell.stats.surprise = s.err;
      out[1] = { kind: 'num', data: S.flt(s.err) };
    }
    return out;
  },
  serialize: (s) => ({ W1: S.dataToJSON('vec', s.W1), b1: S.dataToJSON('vec', s.b1), W2: S.dataToJSON('vec', s.W2), b2: S.dataToJSON('vec', s.b2), err: s.err }),
  deserialize: (j) => ({ W1: S.dataFromJSON('vec', j.W1), b1: S.dataFromJSON('vec', j.b1), W2: S.dataFromJSON('vec', j.W2), b2: S.dataFromJSON('vec', j.b2), lastX: null, lastH: null, lastY: null, err: j.err }),
});
import { RNG as cellRngClass } from '../core/rng.mjs';
const cellRng = new cellRngClass('cells');

defineKind('integrate.ema', { doc: 'Exponential moving average with time constant tau ticks.', ports: { in: [{ name: 'in', kinds: ['vec'] }], out: [{ name: 'out', kinds: ['vec'] }] }, defaults: { tau: 8 },
  init: () => ({ acc: null }),
  compute: (ins, cell) => { const s = first(ins[0]); if (!s) return [null]; cell.state.acc = P.integrate('vec', cell.state.acc, s.data, cell.params.tau); return [{ kind: 'vec', data: cell.state.acc }]; },
  serialize: (s) => ({ acc: s.acc && S.dataToJSON('vec', s.acc) }), deserialize: (j) => ({ acc: j.acc && S.dataFromJSON('vec', j.acc) }) });
defineKind('aggregate.mean', { doc: 'Mean of all vecs received this tick.', ports: { in: [{ name: 'in', kinds: ['vec'] }], out: [{ name: 'out', kinds: ['vec'] }] },
  compute: (ins) => { const l = sigs(ins[0]); return [l.length ? { kind: 'vec', data: S.vecMean(l.map(s => s.data)) } : null]; } });

// ---------------------------------------------------------------- prediction: hypothesis, observation, error, surprise
defineKind('predict.next', {
  doc: 'Predicts the next input from history (vec: linear extrapolation; hv/num: last). Emits the prediction and the error of the previous prediction as surprise.',
  ports: { in: [{ name: 'observe', kinds: ['vec', 'hv', 'num'] }], out: [{ name: 'prediction', kinds: ['vec', 'hv', 'num'] }, { name: 'error', kinds: ['num'] }] },
  defaults: { history: 4 },
  init: () => ({ kind: null, history: [], lastPrediction: null, lastError: null }),
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null, null];
    const st = cell.state; st.kind = s.kind;
    let error = null;
    if (st.lastPrediction != null) error = P.predict(s.kind, [st.lastPrediction], s.data).error;
    // the history outlives the tick the signal arrived on, so an hv payload is copied into it
    st.history.push(s.kind === 'hv' ? S.hvCopy(s.data) : s.data); if (st.history.length > cell.params.history) st.history.shift();
    const { prediction } = P.predict(s.kind, st.history, null);
    st.lastPrediction = prediction; st.lastError = error;
    if (error != null) cell.stats.surprise = error;
    return [prediction != null ? { kind: s.kind, data: prediction } : null, error != null && Number.isFinite(error) ? { kind: 'num', data: S.flt(error) } : null]; // a num is an exact quantity; a NaN never becomes one
  },
  serialize: (s) => ({ kind: s.kind, history: s.history.map(h => S.dataToJSON(s.kind, h)), lastPrediction: s.lastPrediction && S.dataToJSON(s.kind, s.lastPrediction), lastError: s.lastError }),
  deserialize: (j) => ({ kind: j.kind, history: (j.history || []).map(h => S.dataFromJSON(j.kind, h)), lastPrediction: j.lastPrediction && S.dataFromJSON(j.kind, j.lastPrediction), lastError: j.lastError }),
});

// ---------------------------------------------------------------- routing, state machines, memory, evaluation
defineKind('route.key', {
  doc: 'Routes an event to out port by event[keyField] via table; port names a,b,c,d.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'a', kinds: ['event'] }, { name: 'b', kinds: ['event'] }, { name: 'c', kinds: ['event'] }, { name: 'd', kinds: ['event'] }] },
  defaults: { keyField: 'key', table: {}, dflt: 0 },
  compute: (ins, cell) => { const out = [null, null, null, null]; for (const it of ins[0]) { const p = P.route(it.sig.data[cell.params.keyField], cell.params.table, cell.params.dflt); out[p] = { kind: 'event', data: it.sig.data }; } return out; },
});
defineKind('state.machine', {
  doc: 'Finite state machine: params.transitions[state][event.key] -> next; emits { from, to, key } on change.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { initial: 'idle', transitions: {} },
  init: (p) => ({ state: p.initial }),
  compute: (ins, cell) => { let out = null; for (const it of ins[0]) { const k = it.sig.data.key, nxt = cell.params.transitions[cell.state.state]?.[k]; if (nxt && nxt !== cell.state.state) { out = { kind: 'event', data: { from: cell.state.state, to: nxt, key: k } }; cell.state.state = nxt; } } return [out]; },
});
defineKind('memory.assoc', {
  doc: 'Associative memory: store (key hv, value event) pairs; query by hv nearest key. Ports: key, value, query -> out.',
  ports: { in: [{ name: 'key', kinds: ['hv'] }, { name: 'value', kinds: ['event'] }, { name: 'query', kinds: ['hv'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { threshold: 0.15, capacity: 4096 },
  init: () => ({ keys: [], values: [] }),
  compute: (ins, cell) => {
    const k = first(ins[0]), v = first(ins[1]), q = first(ins[2]), st = cell.state;
    // the key is a row of this memory from now on, so it is this memory's own copy
    if (k && v) { st.keys.push(S.hvCopy(k.data)); st.values.push(v.data); if (st.keys.length > cell.params.capacity) { st.keys.shift(); st.values.shift(); } }
    if (!q) return [null];
    let best = -1, bs = -Infinity;
    for (let i = 0; i < st.keys.length; i++) { const s = S.sim(st.keys[i], q.data); if (s > bs) { bs = s; best = i; } }
    return [{ kind: 'event', data: best >= 0 && bs >= cell.params.threshold ? { hit: true, sim: bs, value: st.values[best] } : { hit: false, sim: bs === -Infinity ? 0 : bs } }];
  },
  serialize: (s) => ({ keys: s.keys.map(k => S.dataToJSON('hv', k)), values: s.values }),
  deserialize: (j) => ({ keys: j.keys.map(k => S.dataFromJSON('hv', k)), values: j.values }),
});
defineKind('evaluate.threshold', { doc: 'Emits { pass } when the incoming num crosses params.threshold in params.direction.', ports: { in: [{ name: 'in', kinds: ['num'] }], out: [{ name: 'out', kinds: ['event'] }] }, defaults: { threshold: 0.5, direction: 'above' },
  compute: (ins, cell) => { const s = first(ins[0]); if (!s) return [null]; const x = S.ratToNumber(s.data.type === 'float' ? S.ratFromDecimal(String(s.data.x)) : s.data); const pass = cell.params.direction === 'above' ? x > cell.params.threshold : x < cell.params.threshold; return [{ kind: 'event', data: { pass, value: x } }]; } });
