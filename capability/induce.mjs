// capability/induce.mjs: PROGRAM INDUCTION OVER OUR OWN LANGUAGE.
//
// Nobody asks this brain to build a solver. It is given examples and it writes the
// program itself, in the sym language of core/signal.mjs, and keeps what it wrote.
//
// The search is bottom-up enumeration with observational equivalence pruning: terms are
// built smallest first, every term is evaluated on every example input at the moment it
// is built, and a term whose output vector has been seen before is thrown away, since any
// larger term containing it would behave identically. That is the whole reason the search
// counts stay small: the pruning is on BEHAVIOUR, not on syntax.
//
// Two layers of term:
//   scalar  a sym tree exactly as core/signal.mjs S builds it, evaluated by evalSym over
//           exact BigInt rationals. Nothing is approximate, ever.
//   list    a typed layer above it (rev, sort, sum, max, min, len, head, last, tail, map,
//           filter). map and filter carry a scalar sym body in the variable e, so the
//           element-wise part of a list program is still a sym program. Strings are lists
//           of code points, so string tasks are list tasks with no new machinery.
//
// Algebra is not enumerated. A linear equation is solved exactly by two probes (f(0) and
// f(1) of left minus right), checked for linearity at a third point, and then VERIFIED BY
// SUBSTITUTION: the solution is put back into the original tree and both sides must come
// out as the same exact rational. A solution that does not verify is not returned.
import * as S from '../core/signal.mjs';
import { evalSym } from '../core/primitives.mjs';
import { parse } from '../lang/parse.mjs';

const L = S.S;
const R0 = S.rat(0n), R1 = S.rat(1n);

// ---------------------------------------------------------------- values
// A value is either a num (exact rational) or a list (array of nums). Nothing else.
export function num(x) { return typeof x === 'object' ? S.toRat(x) : S.ratFromDecimal(String(x)); }
export function list(arr) { return arr.map(num); }
export function isList(v) { return Array.isArray(v); }
export function typeOf(v) { return isList(v) ? 'list' : 'num'; }
export function valueToString(v) { return isList(v) ? '[' + v.map(S.ratToString).join(', ') + ']' : S.ratToString(v); }
export function valueEq(a, b) {
  if (isList(a) !== isList(b)) return false;
  if (isList(a)) return a.length === b.length && a.every((x, i) => S.ratEq(x, b[i]));
  return S.ratEq(a, b);
}
// Strings are lists of code points, so "string ops via symbols" needs no new kind.
export function fromString(s) { return list([...s].map(c => c.codePointAt(0))); }
export function toString_(v) { return v.map(r => String.fromCodePoint(Number(S.toRat(r).n))).join(''); }

// A rational whose numerator or denominator has run away is not a useful term; the guard
// keeps one bad branch from making every later product enormous.
const LIMIT = 10n ** 40n;
function sane(v) {
  if (isList(v)) return v.length <= 4096 && v.every(sane);
  const n = v.n < 0n ? -v.n : v.n;
  return n < LIMIT && v.d < LIMIT;
}

// ---------------------------------------------------------------- the term language
const LIST_OPS = new Set(['lst.rev', 'lst.sort', 'lst.sum', 'lst.prod', 'lst.max', 'lst.min', 'lst.len', 'lst.head', 'lst.last', 'lst.tail', 'lst.map', 'lst.filter']);
export function hasListOp(t) {
  if (!t || typeof t !== 'object') return false;
  if (LIST_OPS.has(t.op)) return true;
  if (t.args) for (const a of t.args) if (hasListOp(a)) return true;
  if (t.value && typeof t.value === 'object' && t.value.op && hasListOp(t.value)) return true;
  if (t.body && hasListOp(t.body)) return true;
  if (t.fbody && hasListOp(t.fbody)) return true;
  if (t.fn && hasListOp(t.fn)) return true;
  return false;
}
const truthy = (v) => !(v && v.n === 0n);

// evalTerm: the one evaluator. A term with no list op anywhere is handed straight to
// core/primitives.evalSym, so pure scalar programs are evaluated by the brain's own
// language and not by a copy of it here.
export function evalTerm(t, env = {}) {
  // A bare variable is looked up here rather than in evalSym, because a list value has no
  // spelling in the scalar language and would be stripped out of the environment.
  if (t.op === 'var' && env[t.name] !== undefined) return env[t.name];
  if (!hasListOp(t)) {
    const scalar = {};
    for (const k of Object.keys(env)) if (!isList(env[k])) scalar[k] = env[k];
    return evalSym(t, scalar);
  }
  switch (t.op) {
    case 'var': { const v = env[t.name]; if (v === undefined) throw new Error('unbound variable ' + t.name); return v; }
    case 'if': return truthy(evalTerm(t.args[0], env)) ? evalTerm(t.args[1], env) : evalTerm(t.args[2], env);
    case 'lst.rev': return [...asList(evalTerm(t.args[0], env))].reverse();
    case 'lst.sort': return [...asList(evalTerm(t.args[0], env))].sort(S.ratCmp);
    case 'lst.tail': return asList(evalTerm(t.args[0], env)).slice(1);
    case 'lst.sum': return asList(evalTerm(t.args[0], env)).reduce(S.ratAdd, R0);
    case 'lst.prod': return asList(evalTerm(t.args[0], env)).reduce(S.ratMul, R1);
    case 'lst.max': return reduceCmp(asList(evalTerm(t.args[0], env)), 1);
    case 'lst.min': return reduceCmp(asList(evalTerm(t.args[0], env)), -1);
    case 'lst.len': return S.rat(BigInt(asList(evalTerm(t.args[0], env)).length));
    case 'lst.head': return firstOf(asList(evalTerm(t.args[0], env)), 0);
    case 'lst.last': return firstOf(asList(evalTerm(t.args[0], env)), -1);
    case 'lst.map': return asList(evalTerm(t.args[0], env)).map(e => evalSym(t.fn, { ...scalarEnv(env), e }));
    case 'lst.filter': return asList(evalTerm(t.args[0], env)).filter(e => truthy(evalSym(t.fn, { ...scalarEnv(env), e })));
    default: {
      const kids = t.args.map(a => evalTerm(a, env));
      return evalSym({ ...t, args: kids.map(v => ({ op: 'num', value: v })) }, {});
    }
  }
}
function scalarEnv(env) { const o = {}; for (const k of Object.keys(env)) if (!isList(env[k])) o[k] = env[k]; return o; }
function asList(v) { if (!isList(v)) throw new Error('evalTerm: expected a list'); return v; }
function reduceCmp(v, dir) { if (!v.length) throw new Error('evalTerm: empty list'); let b = v[0]; for (const x of v) if (S.ratCmp(x, b) === dir) b = x; return b; }
function firstOf(v, i) { if (!v.length) throw new Error('evalTerm: empty list'); return i === 0 ? v[0] : v[v.length - 1]; }

export function termSize(t) {
  if (!t || typeof t !== 'object') return 1;
  let n = 1;
  if (t.fn) n += termSize(t.fn);
  if (t.args) for (const a of t.args) n += termSize(a);
  return n;
}
export function substVar(t, name, repl) {
  if (!t || typeof t !== 'object') return t;
  if (t.op === 'var' && t.name === name) return repl;
  const out = { ...t };
  if (t.args) out.args = t.args.map(a => substVar(a, name, repl));
  return out;
}

// printTerm: text a human reads and, for pure scalar programs, text lang/parse reads back.
export function printTerm(t) {
  switch (t.op) {
    case 'num': return S.ratToString(t.value);
    case 'var': return t.name;
    case 'lst.map': return 'map(e -> ' + printTerm(t.fn) + ', ' + printTerm(t.args[0]) + ')';
    case 'lst.filter': return 'filter(e -> ' + printTerm(t.fn) + ', ' + printTerm(t.args[0]) + ')';
    case 'neg': return '-(' + printTerm(t.args[0]) + ')';
    case 'abs': case 'floor': return t.op + '(' + printTerm(t.args[0]) + ')';
    case 'mod': return 'mod(' + printTerm(t.args[0]) + ', ' + printTerm(t.args[1]) + ')';
    case 'if': return 'if ' + printTerm(t.args[0]) + ' then ' + printTerm(t.args[1]) + ' else ' + printTerm(t.args[2]);
    default:
      if (LIST_OPS.has(t.op)) return t.op.slice(4) + '(' + t.args.map(printTerm).join(', ') + ')';
      return '(' + t.args.map(printTerm).join(' ' + t.op + ' ') + ')';
  }
}

// ---------------------------------------------------------------- operator table
// Every operator carries its type signature, a builder for the term, and a fast evaluator
// that works on the CHILD OUTPUTS the enumeration already has, so a term of size 9 is
// never re-walked from the leaves.
const OPS = [
  { name: '+', in: ['num', 'num'], out: 'num', make: (a, b) => L.add(a, b), ev: (a, b) => S.ratAdd(a, b) },
  { name: '-', in: ['num', 'num'], out: 'num', make: (a, b) => L.sub(a, b), ev: (a, b) => S.ratSub(a, b) },
  { name: '*', in: ['num', 'num'], out: 'num', make: (a, b) => L.mul(a, b), ev: (a, b) => S.ratMul(a, b) },
  { name: '/', in: ['num', 'num'], out: 'num', make: (a, b) => L.div(a, b), ev: (a, b) => { if (b.n === 0n) throw new Error('div0'); return S.ratDiv(a, b); } },
  { name: 'mod', in: ['num', 'num'], out: 'num', make: (a, b) => L.mod(a, b), ev: (a, b) => { if (b.n === 0n) throw new Error('mod0'); return evalSym(L.mod(numLit(a), numLit(b)), {}); } },
  { name: 'neg', in: ['num'], out: 'num', make: (a) => L.neg(a), ev: (a) => S.ratSub(R0, a) },
  { name: 'abs', in: ['num'], out: 'num', make: (a) => L.abs(a), ev: (a) => (a.n < 0n ? S.ratSub(R0, a) : a) },
  { name: 'lst.rev', in: ['list'], out: 'list', make: (a) => ({ op: 'lst.rev', args: [a] }), ev: (a) => [...a].reverse() },
  { name: 'lst.sort', in: ['list'], out: 'list', make: (a) => ({ op: 'lst.sort', args: [a] }), ev: (a) => [...a].sort(S.ratCmp) },
  { name: 'lst.tail', in: ['list'], out: 'list', make: (a) => ({ op: 'lst.tail', args: [a] }), ev: (a) => a.slice(1) },
  { name: 'lst.sum', in: ['list'], out: 'num', make: (a) => ({ op: 'lst.sum', args: [a] }), ev: (a) => a.reduce(S.ratAdd, R0) },
  { name: 'lst.prod', in: ['list'], out: 'num', make: (a) => ({ op: 'lst.prod', args: [a] }), ev: (a) => a.reduce(S.ratMul, R1) },
  { name: 'lst.max', in: ['list'], out: 'num', make: (a) => ({ op: 'lst.max', args: [a] }), ev: (a) => reduceCmp(a, 1) },
  { name: 'lst.min', in: ['list'], out: 'num', make: (a) => ({ op: 'lst.min', args: [a] }), ev: (a) => reduceCmp(a, -1) },
  { name: 'lst.len', in: ['list'], out: 'num', make: (a) => ({ op: 'lst.len', args: [a] }), ev: (a) => S.rat(BigInt(a.length)) },
  { name: 'lst.head', in: ['list'], out: 'num', make: (a) => ({ op: 'lst.head', args: [a] }), ev: (a) => firstOf(a, 0) },
  { name: 'lst.last', in: ['list'], out: 'num', make: (a) => ({ op: 'lst.last', args: [a] }), ev: (a) => firstOf(a, -1) },
];
function numLit(v) { return { op: 'num', value: v }; }

// The element bodies map and filter carry: scalar sym programs in the variable e, small
// by construction. They are enumerated once and reused at every list size.
const MAP_CONSTS = ['0', '1', '2', '3', '5', '10', '32', '-1', '-32'];
function mapBodies() {
  const out = [{ term: L.v('e'), size: 1 }];
  for (const c of MAP_CONSTS) {
    const k = L.num(c);
    out.push({ term: L.add(L.v('e'), k), size: 3 });
    out.push({ term: L.sub(L.v('e'), k), size: 3 });
    out.push({ term: L.mul(L.v('e'), k), size: 3 });
  }
  out.push({ term: L.mul(L.v('e'), L.v('e')), size: 3 });
  out.push({ term: L.neg(L.v('e')), size: 2 });
  out.push({ term: L.abs(L.v('e')), size: 2 });
  return out;
}
function filterBodies() {
  const e = L.v('e');
  return [
    { term: L.gt(e, L.num('0')), size: 3 }, { term: L.lt(e, L.num('0')), size: 3 },
    { term: L.ge(e, L.num('0')), size: 3 }, { term: L.eq(L.mod(e, L.num('2')), L.num('0')), size: 5 },
    { term: L.ne(L.mod(e, L.num('2')), L.num('0')), size: 5 }, { term: L.gt(e, L.num('5')), size: 3 },
  ];
}
const MAP_BODIES = mapBodies(), FILTER_BODIES = filterBodies();
const CONSTS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '-1', '-2'];

// ---------------------------------------------------------------- the enumerator
// rows: one environment per example. accept(entry) returns true to stop. The signature
// function decides what "behaves the same" means: exact outputs for an example task, the
// decision vector for a policy search, so the pruning always matches the question asked.
export function enumerateTerms({ rows, varTypes, maxSize = 7, maxTerms = 200000, wantTypes = ['num', 'list'], library = [], signature = defaultSignature, accept = () => false, onNew = null }) {
  const pools = { num: new Map(), list: new Map() };
  const seen = { num: new Set(), list: new Set() };
  let searched = 0, kept = 0, best = null;
  const ops = OPS.concat(library);

  const add = (term, size, outs, type) => {
    searched++;
    if (searched > maxTerms) return 'stop';
    const sig = type + '#' + signature(outs);
    if (seen[type].has(sig)) return null;
    seen[type].add(sig);
    kept++;
    const entry = { term, size, outs, type, sig };
    if (!pools[type].has(size)) pools[type].set(size, []);
    pools[type].get(size).push(entry);
    if (onNew) onNew(entry);
    if (wantTypes.includes(type) && accept(entry)) { best = entry; return 'stop'; }
    return null;
  };
  const evalAll = (fn) => { const outs = []; for (let i = 0; i < rows.length; i++) { const v = fn(i); if (v === undefined || !sane(v)) return null; outs.push(v); } return outs; };

  // size 1: the inputs and the constant vocabulary
  for (const [name, type] of Object.entries(varTypes)) {
    const outs = evalAll(i => rows[i][name]);
    if (outs && add(L.v(name), 1, outs, type) === 'stop') return done();
  }
  for (const c of CONSTS) {
    const v = S.ratFromDecimal(c);
    const outs = rows.map(() => v);
    if (add(L.num(c), 1, outs, 'num') === 'stop') return done();
  }

  for (let size = 2; size <= maxSize; size++) {
    for (const op of ops) {
      if (op.in.length === 1) {
        const childSize = size - 1;
        for (const child of pools[op.in[0]].get(childSize) || []) {
          const outs = evalAll(i => { try { return op.ev(child.outs[i]); } catch { return undefined; } });
          if (!outs) continue;
          if (add(op.make(child.term), size, outs, op.out) === 'stop') return done();
        }
      } else {
        for (let sa = 1; sa <= size - 2; sa++) {
          const sb = size - 1 - sa;
          for (const a of pools[op.in[0]].get(sa) || []) for (const b of pools[op.in[1]].get(sb) || []) {
            const outs = evalAll(i => { try { return op.ev(a.outs[i], b.outs[i]); } catch { return undefined; } });
            if (!outs) continue;
            if (add(op.make(a.term, b.term), size, outs, op.out) === 'stop') return done();
          }
        }
      }
    }
    // map and filter: a list child plus a scalar body, sizes adding up
    for (const [bodies, opName] of [[MAP_BODIES, 'lst.map'], [FILTER_BODIES, 'lst.filter']]) {
      for (const body of bodies) {
        const childSize = size - 1 - body.size;
        if (childSize < 1) continue;
        for (const child of pools.list.get(childSize) || []) {
          const outs = evalAll(i => {
            try {
              const src = child.outs[i];
              if (opName === 'lst.map') return src.map(e => evalSym(body.term, { e }));
              return src.filter(e => truthy(evalSym(body.term, { e })));
            } catch { return undefined; }
          });
          if (!outs) continue;
          if (add({ op: opName, fn: body.term, args: [child.term] }, size, outs, 'list') === 'stop') return done();
        }
      }
    }
  }
  return done();
  function done() { return { best, searched, kept, pools }; }
}
function defaultSignature(outs) { return outs.map(valueToString).join('|'); }

// ---------------------------------------------------------------- induction from examples
// examples: [{ in: { x: value, ... }, out: value }]. Returns a program that reproduces
// every example exactly, or a plain statement that the search did not find one.
export function induceFromExamples(examples, { maxSize = 7, maxTerms = 200000, library = [] } = {}) {
  const t0 = performance.now();
  const rows = examples.map(e => e.in);
  const wanted = examples.map(e => e.out);
  const varTypes = {};
  for (const [k, v] of Object.entries(rows[0])) varTypes[k] = typeOf(v);
  const wantType = typeOf(wanted[0]);
  const r = enumerateTerms({
    rows, varTypes, maxSize, maxTerms, library, wantTypes: [wantType],
    accept: (entry) => entry.type === wantType && entry.outs.every((o, i) => valueEq(o, wanted[i])),
  });
  const ms = performance.now() - t0;
  if (!r.best) return { solved: false, program: null, text: null, searched: r.searched, kept: r.kept, ms, size: null, type: wantType };
  // The accepted term is re-checked through evalTerm, the one evaluator, so what is stored
  // is known to reproduce the examples when run the ordinary way and not only through the
  // enumeration's fast path.
  for (let i = 0; i < examples.length; i++) {
    const got = evalTerm(r.best.term, rows[i]);
    if (!valueEq(got, wanted[i])) return { solved: false, program: null, text: null, searched: r.searched, kept: r.kept, ms, size: null, type: wantType, disagreed: i };
  }
  return { solved: true, program: r.best.term, text: printTerm(r.best.term), searched: r.searched, kept: r.kept, ms, size: r.best.size, type: wantType, vars: Object.keys(varTypes) };
}

// A solved program becomes an operator later searches may use: the library grows.
export function libraryOp(skill) {
  const vars = skill.vars || ['x'];
  if (vars.length !== 1) return null;
  const inType = skill.inTypes ? skill.inTypes[0] : 'num';
  return {
    name: 'skill:' + skill.name, in: [inType], out: skill.type, library: true,
    make: (a) => substVar(skill.program, vars[0], a),
    ev: (a) => evalTerm(skill.program, { [vars[0]]: a }),
  };
}

// ---------------------------------------------------------------- algebra, exact
// Solve an equation linear in one variable over the exact rationals, then VERIFY BY
// SUBSTITUTION. f(x) = left - right. If f is linear then f(x) = a x + b with
// a = f(1) - f(0) and b = f(0), and the root is -b/a. Linearity is checked at x = 2
// (a third point no coefficient was read from), and the answer is only returned when
// putting it back into the original tree makes both sides the same exact rational.
export function solveLinearExact(eq, name = 'x') {
  if (!eq || eq.op !== '=') throw new Error('solveLinearExact: needs an equation (op "=")');
  const f = (xv) => S.ratSub(S.toRat(evalSym(eq.args[0], { [name]: xv })), S.toRat(evalSym(eq.args[1], { [name]: xv })));
  let f0, f1, f2;
  try { f0 = f(R0); f1 = f(R1); f2 = f(S.rat(2n)); }
  catch (err) { return { solved: false, reason: 'evaluation failed: ' + String(err && err.message || err) }; }
  const a = S.ratSub(f1, f0);
  const linear = S.ratEq(f2, S.ratAdd(S.ratMul(a, S.rat(2n)), f0));
  if (!linear) return { solved: false, reason: 'not linear in ' + name, a: S.ratToString(a) };
  if (a.n === 0n) return { solved: false, reason: f0.n === 0n ? 'every value of ' + name + ' is a solution' : 'no solution', a: '0' };
  const x = S.ratDiv(S.ratSub(R0, f0), a);
  const left = S.toRat(evalSym(eq.args[0], { [name]: x })), right = S.toRat(evalSym(eq.args[1], { [name]: x }));
  const verified = S.ratEq(left, right);
  return {
    solved: verified, x, value: S.ratToString(x), verified,
    left: S.ratToString(left), right: S.ratToString(right),
    a: S.ratToString(a), b: S.ratToString(f0),
    reason: verified ? null : 'substitution did not verify',
  };
}
// The text front end of lang/ is the brain's own reader, so an equation may arrive as text.
export function solveEquationText(text, name = 'x') {
  const tree = parse(text);
  if (tree.op !== '=') throw new Error('solveEquationText: ' + JSON.stringify(text) + ' is not an equation');
  return { ...solveLinearExact(tree, name), tree, text };
}

// A seeded battery of linear equations with rational coefficients, every one solved and
// then verified by substitution. Returns counts a command can print.
export function algebraBattery(rng, n = 40) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const a = rng.int(19) - 9 || 3, b = rng.int(21) - 10, c = rng.int(9) - 4, d = rng.int(21) - 10;
    const den = 1 + rng.int(4);
    const text = a + ' * x + ' + b + ' = ' + c + ' * x + ' + d + ' / ' + den;
    const r = solveEquationText(text, 'x');
    rows.push({ text, solved: r.solved, value: r.value ?? null, verified: r.verified === true, reason: r.reason ?? null, degenerate: a === c });
  }
  const solvable = rows.filter(r => !r.degenerate);
  return {
    n, solved: rows.filter(r => r.solved).length, verified: rows.filter(r => r.verified).length,
    solvable: solvable.length, solvedOfSolvable: solvable.filter(r => r.solved).length,
    degenerate: rows.filter(r => r.degenerate).length, rows,
  };
}

// ---------------------------------------------------------------- the task catalogue
// The families the manual named: arithmetic maps, list ops, string ops through symbols,
// and algebra. Every one is stated as examples only; no task carries a hint of its answer.
function ex(inObj, out) { return { in: inObj, out }; }
function numTask(name, fn, xs) { return { name, family: 'arithmetic', examples: xs.map(x => ex({ x: num(x) }, num(fn(x)))) }; }
function listTask(name, family, fn, lists) { return { name, family, examples: lists.map(a => ex({ xs: list(a) }, fn(list(a)))) }; }
function strTask(name, fn, strs) { return { name, family: 'string', examples: strs.map(s => ex({ xs: fromString(s) }, fn(s))) }; }

export const TASKS = [
  numTask('affine.3x+2', x => 3 * x + 2, [0, 1, 2, 5, 9]),
  numTask('affine.5x-7', x => 5 * x - 7, [0, 1, 2, 4, 8]),
  numTask('square', x => x * x, [0, 1, 2, 3, 7]),
  numTask('half.minus.one', x => (x - 1) / 2, [1, 3, 5, 9, 11]),
  numTask('quadratic.x2+x', x => x * x + x, [0, 1, 2, 3, 6]),
  listTask('list.reverse', 'list', a => [...a].reverse(), [[1, 2, 3], [4, 5], [7, 1, 9, 2]]),
  listTask('list.sum', 'list', a => a.reduce(S.ratAdd, R0), [[1, 2, 3], [4, 5], [7, 1, 9, 2]]),
  listTask('list.max', 'list', a => reduceCmp(a, 1), [[1, 2, 3], [9, 5], [7, 1, 9, 2]]),
  listTask('list.sort', 'list', a => [...a].sort(S.ratCmp), [[3, 1, 2], [5, 4], [7, 1, 9, 2]]),
  listTask('list.sum.of.sorted.tail', 'list', a => [...a].sort(S.ratCmp).slice(1).reduce(S.ratAdd, R0), [[3, 1, 2], [5, 4, 8], [7, 1, 9, 2]]),
  listTask('list.double.each', 'list', a => a.map(v => S.ratMul(v, S.rat(2n))), [[1, 2, 3], [4, 5], [7, 1, 9]]),
  strTask('string.reverse', s => fromString([...s].reverse().join('')), ['abc', 'brain', 'xy']),
  strTask('string.shift.one', s => fromString([...s].map(c => String.fromCodePoint(c.codePointAt(0) + 1)).join('')), ['abc', 'brain', 'xy']),
  strTask('string.upper', s => fromString(s.toUpperCase()), ['abc', 'brain', 'xy']),
  strTask('string.length', s => num(s.length), ['abc', 'brain', 'xy']),
];

export function getTask(name) { const t = TASKS.find(t => t.name === name); if (!t) throw new Error('induce: unknown task ' + name); return t; }

// Run the whole catalogue. Every solved task is handed to the registry as a skill, and
// the growing library is offered back to the search for the tasks that follow.
export function induceAll({ registry = null, tasks = TASKS, maxSize = 7, useLibrary = true } = {}) {
  const rows = [];
  for (const task of tasks) {
    const library = [];
    if (useLibrary && registry) for (const s of registry.list()) { const op = libraryOp(s); if (op) library.push(op); }
    const r = induceFromExamples(task.examples, { maxSize, library });
    if (r.solved && registry) {
      const inTypes = r.vars.map(v => typeOf(task.examples[0].in[v]));
      registry.store({ name: task.name, program: r.program, text: r.text, type: r.type, vars: r.vars, inTypes, examples: task.examples, cost: r.size, family: task.family });
    }
    rows.push({ task: task.name, family: task.family, solved: r.solved, program: r.text, size: r.size, searched: r.searched, kept: r.kept, ms: Number(r.ms.toFixed(2)), libraryOps: library.length });
  }
  return {
    rows, solved: rows.filter(r => r.solved).length, total: rows.length,
    searched: rows.reduce((a, r) => a + r.searched, 0), ms: Number(rows.reduce((a, r) => a + r.ms, 0).toFixed(2)),
  };
}
