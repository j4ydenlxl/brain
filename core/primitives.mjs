// core/primitives.mjs: ORTHOGONAL PRIMITIVES. A small, general vocabulary of pure
// operations from which cells are composed. Each has a manifest (accepted kinds, produced
// kind, cost) and a function. Nothing here has state; state lives in cells.
import * as S from './signal.mjs';

const REG = new Map();
function def(name, manifest, fn) { REG.set(name, { name, ...manifest, fn }); return fn; }
export function primitive(name) { const p = REG.get(name); if (!p) throw new Error('unknown primitive ' + name); return p; }
export function listPrimitives() { return [...REG.values()].map(({ fn, ...m }) => m); }

// transform: apply a function to data of one kind, produce the same kind.
export const transform = def('transform', { in: ['vec', 'hv', 'num', 'sym', 'event'], out: 'same', cost: 1 },
  (kind, data, fn) => fn(data, kind));

// compare: similarity in [-1, 1] (hv, vec), overlap ratio (sdr), exact order (num), structural equality (sym, event).
export const compare = def('compare', { in: ['hv', 'vec', 'sdr', 'num', 'sym', 'event'], out: 'num', cost: 1 },
  (kind, a, b) => {
    switch (kind) {
      case 'hv': return S.sim(a, b);
      case 'vec': return S.vecCos(a, b);
      case 'sdr': return S.sdrOverlap(a, b) / Math.max(1, Math.min(a.idx.length, b.idx.length));
      case 'num': return S.ratCmp(a, b);
      default: return JSON.stringify(a) === JSON.stringify(b) ? 1 : 0;
    }
  });

// bind / bundle / permute: the algebra of hypervectors (roles, superposition, sequence).
export const bind = def('bind', { in: ['hv'], out: 'hv', cost: 1 }, (a, b) => S.bind(a, b));
export const bundle = def('bundle', { in: ['hv'], out: 'hv', cost: 1 }, (list, weights) => S.bundle(list, weights));
export const permute = def('permute', { in: ['hv'], out: 'hv', cost: 1 }, (a, k) => S.permute(a, k));

// aggregate: many signals of one kind into one.
export const aggregate = def('aggregate', { in: ['hv', 'vec', 'sdr', 'num'], out: 'same', cost: 1 },
  (kind, list) => {
    if (list.length === 0) return null;
    switch (kind) {
      case 'hv': return S.bundle(list);
      case 'vec': return S.vecMean(list);
      case 'sdr': return list.reduce((a, b) => S.sdrUnion(a, b));
      case 'num': return list.reduce((a, b) => S.ratAdd(a, b));
    }
  });

// integrate: temporal integration, exponential moving average with time constant tau (ticks).
export const integrate = def('integrate', { in: ['vec', 'num'], out: 'same', cost: 1 },
  (kind, prev, x, tau) => {
    const a = 1 / Math.max(1, tau);
    if (kind === 'num') { const px = prev ? S.ratToNumber(prev) : 0; return S.ratFromDecimal(String(px + a * (S.ratToNumber(x) - px))); }
    if (!prev) return Float32Array.from(x);
    // Two vec signals of different widths meet here (a reservoir emits 1, an mlp 4, an encoder 8).
    // A dimension the sample does not carry holds its state; a dimension the state has never seen
    // takes the sample as its first value. Reading past the shorter end made a NaN.
    const n = Math.max(prev.length, x.length), out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = i >= prev.length ? x[i] : i >= x.length ? prev[i] : prev[i] + a * (x[i] - prev[i]);
    return out;
  });

// count: exact counting is a primitive because LLMs cannot do it.
export const count = def('count', { in: ['sdr', 'event', 'vec'], out: 'num', cost: 1 },
  (kind, data, pred) => {
    if (kind === 'sdr') return S.int(data.idx.length);
    if (kind === 'vec') { let c = 0; for (let i = 0; i < data.length; i++) if (pred ? pred(data[i]) : data[i] !== 0) c++; return S.int(c); }
    if (Array.isArray(data)) return S.int(pred ? data.filter(pred).length : data.length);
    return S.int(0);
  });

// verify: exactness. num equality is exact rational equality; sym is evaluated both sides.
export const verify = def('verify', { in: ['num', 'sym', 'event'], out: 'event', cost: 1 },
  (kind, a, b, env) => {
    if (kind === 'num') return { ok: S.ratEq(a, b) };
    if (kind === 'sym') {
      if (a.op === '=') { const l = evalSym(a.args[0], env), r = evalSym(a.args[1], env); return { ok: S.ratEq(l, r), left: S.ratToString(l), right: S.ratToString(r) }; }
      return { ok: S.ratEq(evalSym(a, env), evalSym(b, env)) };
    }
    return { ok: JSON.stringify(a) === JSON.stringify(b) };
  });

// evalSym: exact evaluation of an expression tree with an environment of variable -> num.
// The sym language is a complete one: exact rational arithmetic, comparisons that yield
// 1 or 0, if, let, first-class functions (fn), calls, and named recursion (rec). With
// those, any computable function over the rationals is a sym tree a cell can evaluate
// natively; nothing has to be hand-built per capability. Tail calls are trampolined so a
// loop written as tail recursion runs in constant JS stack; deep non-tail recursion
// (fib written naively) is bounded by the JS stack and reports that plainly.
const ONE = S.rat(1n), ZERO = S.rat(0n);
const truthy = (v) => !(v && v.n === 0n) && !(v && v.type === 'float' && v.x === 0);
export function evalSym(e, env = {}) {
  try { return ev(e, env, false); }
  catch (err) { if (err instanceof RangeError) throw new Error('evalSym: recursion too deep for the JS stack (write the loop as a tail call)'); throw err; }
}
function ev(e, env, tail) {
  switch (e.op) {
    case 'num': return e.value;
    case 'var': { const v = env[e.name]; if (v === undefined) throw new Error('unbound variable ' + e.name); return typeof v === 'object' ? v : S.ratFromDecimal(String(v)); }
    case '+': return e.args.map(a => ev(a, env, false)).reduce(S.ratAdd);
    case '*': return e.args.map(a => ev(a, env, false)).reduce(S.ratMul);
    case '-': return S.ratSub(ev(e.args[0], env, false), ev(e.args[1], env, false));
    case '/': return S.ratDiv(ev(e.args[0], env, false), ev(e.args[1], env, false));
    case '^': { const b = ev(e.args[0], env, false), k = S.toRat(ev(e.args[1], env, false)); if (k.d !== 1n) throw new Error('non-integer power'); return S.ratPow(b, k.n); }
    case 'neg': return S.ratSub(ZERO, ev(e.args[0], env, false));
    case 'floor': { const r = S.toRat(ev(e.args[0], env, false)); const q = r.n / r.d; return S.rat((r.n < 0n && q * r.d !== r.n) ? q - 1n : q); }
    case 'mod': { const a = S.toRat(ev(e.args[0], env, false)), b = S.toRat(ev(e.args[1], env, false)); const q = ev({ op: 'floor', args: [{ op: 'num', value: S.ratDiv(a, b) }] }, env, false); return S.ratSub(a, S.ratMul(b, q)); }
    case 'abs': { const r = S.toRat(ev(e.args[0], env, false)); return r.n < 0n ? S.ratSub(ZERO, r) : r; }
    case '=': case '!=': case '<': case '<=': case '>': case '>=': {
      const c = S.ratCmp(ev(e.args[0], env, false), ev(e.args[1], env, false));
      const ok = { '=': c === 0, '!=': c !== 0, '<': c < 0, '<=': c <= 0, '>': c > 0, '>=': c >= 0 }[e.op];
      return ok ? ONE : ZERO;
    }
    case 'and': { for (const a of e.args) if (!truthy(ev(a, env, false))) return ZERO; return ONE; }
    case 'or': { for (const a of e.args) if (truthy(ev(a, env, false))) return ONE; return ZERO; }
    case 'not': return truthy(ev(e.args[0], env, false)) ? ZERO : ONE;
    case 'if': return ev(truthy(ev(e.args[0], env, false)) ? e.args[1] : e.args[2], env, tail);
    case 'let': { const env2 = Object.create(env); env2[e.name] = ev(e.value, env, false); return ev(e.body, env2, tail); }
    case 'fn': return { op: 'closure', params: e.params, body: e.body, env };
    case 'rec': { const env2 = Object.create(env); env2[e.name] = { op: 'closure', params: e.params, body: e.fbody, env: env2 }; return ev(e.body, env2, tail); }
    case 'call': {
      const f = ev(e.fn, env, false), args = e.args.map(a => ev(a, env, false));
      if (tail) return { op: 'tail', f, args };
      return apply(f, args);
    }
    case 'closure': case 'tail': return e;
    default: throw new Error('evalSym: unknown op ' + e.op);
  }
}
function apply(f, args) {
  for (;;) {
    if (!f || f.op !== 'closure') throw new Error('evalSym: call of a non-function');
    if (args.length !== f.params.length) throw new Error('evalSym: function takes ' + f.params.length + ' arguments, got ' + args.length);
    const env2 = Object.create(f.env);
    for (let i = 0; i < args.length; i++) env2[f.params[i]] = args[i];
    const r = ev(f.body, env2, true);
    if (r && r.op === 'tail') { f = r.f; args = r.args; continue; }
    return r;
  }
}
export function applySym(f, args) { return apply(f, args); }

// solveLinear: solve a*x + b = c*x + d exactly for x (the algebra LLMs get wrong).
// Accepts an '=' sym tree linear in one variable; returns num or null if not linear/degenerate.
export function solveLinear(eq, name) {
  if (eq.op !== '=') throw new Error('solveLinear: needs an equation');
  const lin = (e) => { // returns [coef, const] as rats, or null
    switch (e.op) {
      case 'num': return [S.rat(0n), e.value];
      case 'var': return e.name === name ? [S.rat(1n), S.rat(0n)] : null;
      case 'neg': { const a = lin(e.args[0]); return a && [S.ratSub(S.rat(0n), a[0]), S.ratSub(S.rat(0n), a[1])]; }
      case '+': { let c = S.rat(0n), k = S.rat(0n); for (const a of e.args) { const l = lin(a); if (!l) return null; c = S.ratAdd(c, l[0]); k = S.ratAdd(k, l[1]); } return [c, k]; }
      case '-': { const a = lin(e.args[0]), b = lin(e.args[1]); return a && b && [S.ratSub(a[0], b[0]), S.ratSub(a[1], b[1])]; }
      case '*': {
        let c = S.rat(0n), k = S.rat(1n), seenVar = false;
        for (const a of e.args) {
          const l = lin(a); if (!l) return null;
          if (l[0].n !== 0n) { if (seenVar) return null; seenVar = true; c = S.ratMul(k, l[0]); k = S.ratMul(k, l[1]); }
          else { c = S.ratMul(c, l[1]); k = S.ratMul(k, l[1]); }
        }
        return [c, k];
      }
      case '/': { const a = lin(e.args[0]), b = lin(e.args[1]); if (!a || !b || b[0].n !== 0n || b[1].n === 0n) return null; return [S.ratDiv(a[0], b[1]), S.ratDiv(a[1], b[1])]; }
      default: return null;
    }
  };
  const L = lin(eq.args[0]), R = lin(eq.args[1]);
  if (!L || !R) return null;
  const coef = S.ratSub(L[0], R[0]), k = S.ratSub(R[1], L[1]);
  if (coef.n === 0n) return null;
  return S.ratDiv(k, coef);
}

// route: pick an out-port index from a key via a table; default port if missing.
export const route = def('route', { in: ['event'], out: 'port', cost: 1 },
  (key, table, dflt = 0) => (Object.hasOwn(table, key) ? table[key] : dflt));

// gate: pass x through if cond, else null.
export const gate = def('gate', { in: ['hv', 'vec', 'sdr', 'num', 'sym', 'event'], out: 'same', cost: 1 }, (cond, x) => (cond ? x : null));

// predict: linear extrapolation on vec; last-value on everything else. Returns { prediction, error }.
export const predict = def('predict', { in: ['vec', 'num', 'hv'], out: 'same', cost: 1 },
  (kind, history, observed) => {
    const last = history[history.length - 1] ?? null, prev = history[history.length - 2] ?? null;
    let prediction = last;
    if (kind === 'vec' && last && prev) { prediction = new Float32Array(last.length); for (let i = 0; i < last.length; i++) prediction[i] = i < prev.length ? last[i] + (last[i] - prev[i]) : last[i]; } // a dimension prev never carried extrapolates from last alone
    let error = null;
    if (observed != null && prediction != null) {
      if (kind === 'vec') { const n = Math.min(observed.length, prediction.length); let s = 0; for (let i = 0; i < n; i++) { const d = observed[i] - prediction[i]; s += d * d; } error = Math.sqrt(s / Math.max(1, n)); } // over the dimensions both carry
      else if (kind === 'hv') { const s = S.sim(observed, prediction); error = Number.isFinite(s) ? (1 - s) / 2 : 1; } // a zero-norm vector reads as maximum error, never NaN
      else error = Math.abs(S.ratToNumber(S.ratSub(observed, prediction)));
    }
    return { prediction, error };
  });

// simulate: roll a model forward k steps from a state under an action sequence.
export const simulate = def('simulate', { in: ['event'], out: 'event', cost: 4 },
  (model, state, actions, k) => {
    const traj = [state]; let s = state;
    for (let i = 0; i < k; i++) { s = model(s, actions[i] ?? actions[actions.length - 1]); traj.push(s); }
    return traj;
  });

// retrieve / remember: associative memory on a Map keyed by hv nearest neighbour or exact key.
export const remember = def('remember', { in: ['hv', 'event'], out: 'event', cost: 1 },
  (store, key, value) => { store.set(key, value); return { stored: true }; });
export const retrieve = def('retrieve', { in: ['hv', 'event'], out: 'event', cost: 1 },
  (store, key) => (store.has(key) ? store.get(key) : null));

// evaluate: score a candidate with a scoring function; number in [0,1] unless the fn says otherwise.
export const evaluate = def('evaluate', { in: ['event', 'vec', 'num'], out: 'num', cost: 1 },
  (fn, candidate, context) => fn(candidate, context));
