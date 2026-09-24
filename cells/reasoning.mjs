// cells/reasoning.mjs: associative memory, k-NN, boolean logic and exact symbolic
// algebra (simplify, differentiate, verify). Importing this module registers the kinds.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import * as P from '../core/primitives.mjs';

const { S: Y } = S; // sym tree constructors (Y.num, Y.add, Y.mul, ...), aliased off the signal module namespace
const first = (m) => (m.length ? m[m.length - 1].sig : null);
function dot(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

// ---------------------------------------------------------------- hopfield.assoc
defineKind('hopfield.assoc', {
  doc: 'Modern Hopfield / dense associative memory: stores vec patterns arriving on write. A query on query converges over params.iters softmax-weighted (params.beta) updates toward the nearest stored pattern.',
  ports: { in: [{ name: 'write', kinds: ['vec'] }, { name: 'query', kinds: ['vec'] }], out: [{ name: 'out', kinds: ['vec'] }] },
  defaults: { beta: 8, iters: 3, capacity: 64 },
  init: () => ({ patterns: [] }),
  compute: (ins, cell) => {
    const w = first(ins[0]);
    if (w) { cell.state.patterns.push(Float32Array.from(w.data)); if (cell.state.patterns.length > cell.params.capacity) cell.state.patterns.shift(); }
    const q = first(ins[1]); if (!q || !cell.state.patterns.length) return [null];
    let x = Float32Array.from(q.data);
    for (let it = 0; it < cell.params.iters; it++) {
      const scores = cell.state.patterns.map(p => cell.params.beta * dot(p, x));
      const m = Math.max(...scores), exps = scores.map(v => Math.exp(v - m)), Z = exps.reduce((a, b) => a + b, 0);
      const next = new Float32Array(x.length);
      for (let k = 0; k < cell.state.patterns.length; k++) {
        const wgt = exps[k] / Z, p = cell.state.patterns[k];
        for (let d = 0; d < x.length; d++) next[d] += wgt * p[d];
      }
      x = next;
    }
    return [{ kind: 'vec', data: x }];
  },
  serialize: (s) => ({ patterns: s.patterns.map(p => S.dataToJSON('vec', p)) }),
  deserialize: (j) => ({ patterns: j.patterns.map(p => S.dataFromJSON('vec', p)) }),
});

// ---------------------------------------------------------------- knn.retrieve
defineKind('knn.retrieve', {
  doc: 'Stores (vec, label) pairs arriving together on write and label. A query on query emits event { matches: [{ label, dist }, ...] }, the params.k nearest by Euclidean distance.',
  ports: { in: [{ name: 'write', kinds: ['vec'] }, { name: 'label', kinds: ['event'] }, { name: 'query', kinds: ['vec'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { k: 3, capacity: 1024 },
  init: () => ({ vecs: [], labels: [] }),
  compute: (ins, cell) => {
    const w = first(ins[0]), l = first(ins[1]);
    if (w && l) {
      cell.state.vecs.push(Float32Array.from(w.data)); cell.state.labels.push(l.data.label);
      if (cell.state.vecs.length > cell.params.capacity) { cell.state.vecs.shift(); cell.state.labels.shift(); }
    }
    const q = first(ins[2]); if (!q) return [null];
    const dists = cell.state.vecs.map((v, i) => {
      let s = 0; for (let d = 0; d < v.length; d++) { const diff = v[d] - q.data[d]; s += diff * diff; }
      return { label: cell.state.labels[i], dist: Math.sqrt(s) };
    });
    dists.sort((a, b) => a.dist - b.dist);
    return [{ kind: 'event', data: { matches: dists.slice(0, cell.params.k) } }];
  },
  serialize: (s) => ({ vecs: s.vecs.map(v => S.dataToJSON('vec', v)), labels: s.labels }),
  deserialize: (j) => ({ vecs: j.vecs.map(v => S.dataFromJSON('vec', v)), labels: j.labels }),
});

// ---------------------------------------------------------------- logic.gate
defineKind('logic.gate', {
  doc: 'Boolean op (params.op: and, or, not, xor, nand) over every event { value } received on in this tick, any fan-in.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { op: 'and' },
  compute: (ins, cell) => {
    const vals = ins[0].map(it => !!it.sig.data.value);
    if (!vals.length) return [null];
    let r;
    switch (cell.params.op) {
      case 'and': r = vals.every(Boolean); break;
      case 'or': r = vals.some(Boolean); break;
      case 'not': r = !vals[0]; break;
      case 'xor': r = vals.reduce((a, b) => a !== b); break;
      case 'nand': r = !vals.every(Boolean); break;
      default: throw new Error('logic.gate: unknown op ' + cell.params.op);
    }
    return [{ kind: 'event', data: { value: r } }];
  },
});

// ---------------------------------------------------------------- sym.simplify
function hasVar(e) { return e.op === 'var' ? true : e.op === 'num' ? false : e.args.some(hasVar); }
function foldIdentities(e) {
  if (e.op === '+') {
    const args = e.args.filter(a => !(a.op === 'num' && a.value.n === 0n));
    if (!args.length) return { op: 'num', value: S.rat(0n) };
    if (args.length === 1) return args[0];
    return { op: '+', args };
  }
  if (e.op === '*') {
    if (e.args.some(a => a.op === 'num' && a.value.n === 0n)) return { op: 'num', value: S.rat(0n) };
    const args = e.args.filter(a => !(a.op === 'num' && a.value.n === a.value.d));
    if (!args.length) return { op: 'num', value: S.rat(1n) };
    if (args.length === 1) return args[0];
    return { op: '*', args };
  }
  if (e.op === '-' && e.args[1].op === 'num' && e.args[1].value.n === 0n) return e.args[0];
  if (e.op === '/' && e.args[1].op === 'num' && e.args[1].value.n === e.args[1].value.d) return e.args[0];
  return e;
}
function simplify(e) {
  if (e.op === 'num' || e.op === 'var') return e;
  const args = e.args.map(simplify);
  const node = { op: e.op, args };
  if (!args.some(hasVar)) { try { return { op: 'num', value: P.evalSym(node, {}) }; } catch { /* fall through and keep the folded children */ } }
  return foldIdentities(node);
}
defineKind('sym.simplify', {
  doc: 'Constant-folds a sym tree: any subtree with no variables is evaluated exactly (core/primitives evalSym); a few identities (x+0, x*1, x*0, x-0, x/1) clean up the rest. Variables are kept.',
  ports: { in: [{ name: 'in', kinds: ['sym'] }], out: [{ name: 'out', kinds: ['sym'] }] },
  compute: (ins) => { const s = first(ins[0]); if (!s) return [null]; return [{ kind: 'sym', data: simplify(s.data) }]; },
});

// ---------------------------------------------------------------- sym.diff
function diff(e, x) {
  switch (e.op) {
    case 'num': return Y.num(0);
    case 'var': return Y.num(e.name === x ? 1 : 0);
    case 'neg': return Y.neg(diff(e.args[0], x));
    case '+': return Y.add(...e.args.map(a => diff(a, x)));
    case '-': return Y.sub(diff(e.args[0], x), diff(e.args[1], x));
    case '*': {
      if (e.args.length === 1) return diff(e.args[0], x);
      const terms = e.args.map((_, i) => Y.mul(...e.args.map((a, j) => (j === i ? diff(a, x) : a))));
      return Y.add(...terms);
    }
    case '/': {
      const [u, v] = e.args, du = diff(u, x), dv = diff(v, x);
      return Y.div(Y.sub(Y.mul(du, v), Y.mul(u, dv)), Y.mul(v, v));
    }
    case '^': {
      const [u, k] = e.args;
      if (k.op !== 'num') throw new Error('sym.diff: only constant exponents are supported');
      const du = diff(u, x), newExp = { op: 'num', value: S.ratSub(k.value, S.rat(1n)) };
      return Y.mul(k, Y.pow(u, newExp), du);
    }
    default: throw new Error('sym.diff: unsupported op ' + e.op);
  }
}
defineKind('sym.diff', {
  doc: 'Symbolic derivative of a sym tree with respect to params.variable, for + - * / ^ (constant integer exponent only) by the standard rules. The result is not simplified; compose with sym.simplify if a smaller tree is wanted. evalSym on the result is always exact regardless.',
  ports: { in: [{ name: 'in', kinds: ['sym'] }], out: [{ name: 'out', kinds: ['sym'] }] },
  defaults: { variable: 'x' },
  compute: (ins, cell) => { const s = first(ins[0]); if (!s) return [null]; return [{ kind: 'sym', data: diff(s.data, cell.params.variable) }]; },
});

// ---------------------------------------------------------------- verify.numeric
defineKind('verify.numeric', {
  doc: 'Checks the latest value against the latest expected, both num, exactly: |value - expected| <= params.tolerance (an exact rational, given as a decimal string). Emits { ok, diff }.',
  ports: { in: [{ name: 'value', kinds: ['num'] }, { name: 'expected', kinds: ['num'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { tolerance: '0' },
  init: () => ({ value: null, expected: null }),
  compute: (ins, cell) => {
    const v = first(ins[0]), e = first(ins[1]);
    if (v) cell.state.value = v.data;
    if (e) cell.state.expected = e.data;
    if (cell.state.value == null || cell.state.expected == null) return [null];
    const diffv = S.ratSub(cell.state.value, cell.state.expected);
    const absDiff = S.ratCmp(diffv, S.rat(0n)) < 0 ? S.ratSub(S.rat(0n), diffv) : diffv;
    const tol = S.ratFromDecimal(String(cell.params.tolerance));
    return [{ kind: 'event', data: { ok: S.ratCmp(absDiff, tol) <= 0, diff: S.ratToString(diffv) } }];
  },
  serialize: (s) => ({ value: s.value && S.numToJSON(s.value), expected: s.expected && S.numToJSON(s.expected) }),
  deserialize: (j) => ({ value: j.value && S.numFromJSON(j.value), expected: j.expected && S.numFromJSON(j.expected) }),
});
