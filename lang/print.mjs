// lang/print.mjs: print(tree) renders a sym tree (as built by core/signal.mjs's S) back
// to text that parse() re-reads into an equal tree, using minimal parentheses.
//
// Precedence, loosest to tightest (mirrors parse.mjs exactly so wrapping decisions match
// what the grammar would require without parens):
//   0 EXPR (if/let/fn/rec: only reachable from a full-expression position)
//   1 OR   2 AND   3 NOT   4 CMP   5 ADD(+ -)   6 MUL(* /)   7 UNARY(-)   8 POW(^)
//   9 CALL (f(...), floor/abs/mod(...))   10 ATOM (number, variable)
//
// Numbers print as decimal literals (never as a bare "n/d", since '/' is the division
// operator in this grammar, not part of a number token) whenever the rational is exactly
// decimal-representable (denominator's prime factors are only 2 and 5), which covers
// every literal parse() itself can ever produce. A rational that is not exactly decimal
// (e.g. constructed directly as S.num of 1/3, never producible from source text) falls
// back to printing as an explicit division; that reparses to an equal VALUE but, since no
// single number token can spell a repeating decimal, not to a structurally identical tree.

const EXPR = 0, OR = 1, AND = 2, NOT = 3, CMP = 4, ADD = 5, MUL = 6, UNARY = 7, POW = 8, CALL = 9, ATOM = 10;

function stripFactor(x, p) { let c = 0n; while (x % p === 0n) { x /= p; c++; } return [x, c]; }

// Exact decimal text for nAbs/d (d > 0), or null if d has a prime factor other than 2, 5.
function decimalOf(nAbs, d) {
  if (d === 1n) return nAbs.toString();
  const [r1, c2] = stripFactor(d, 2n);
  const [r2, c5] = stripFactor(r1, 5n);
  if (r2 !== 1n) return null;
  const k = c2 > c5 ? c2 : c5;
  const scale = 10n ** k;
  const scaled = nAbs * (scale / d);
  let s = scaled.toString();
  const kk = Number(k);
  while (s.length <= kk) s = '0' + s;
  const intPart = s.slice(0, s.length - kk);
  const fracPart = s.slice(s.length - kk);
  return intPart + '.' + fracPart;
}

function printNum(v) {
  const neg = v.n < 0n;
  const nAbs = neg ? -v.n : v.n;
  const dec = decimalOf(nAbs, v.d);
  if (dec !== null) return { text: (neg ? '-' : '') + dec, prec: neg ? UNARY : ATOM };
  // not exactly decimal: best-effort fallback via the division operator (value-equal, not
  // structure-equal on reparse (see module note above).
  const body = nAbs.toString() + '/' + v.d.toString();
  return { text: neg ? '-(' + body + ')' : body, prec: neg ? UNARY : MUL };
}

function wrap(child, minPrec) { return child.prec < minPrec ? '(' + child.text + ')' : child.text; }
function full(e) { return pr(e).text; } // a full-expression position: never needs parens

function binLeft(e, opText, P) {
  const left = pr(e.args[0]), right = pr(e.args[1]);
  return { text: wrap(left, P) + ' ' + opText + ' ' + wrap(right, P + 1), prec: P };
}

function pr(e) {
  switch (e.op) {
    case 'num': return printNum(e.value);
    case 'var': return { text: e.name, prec: ATOM };
    case 'neg': { const c = pr(e.args[0]); return { text: '-' + wrap(c, UNARY), prec: UNARY }; }
    case '+': return binLeft(e, '+', ADD);
    case '-': return binLeft(e, '-', ADD);
    case '*': return binLeft(e, '*', MUL);
    case '/': return binLeft(e, '/', MUL);
    case 'and': return binLeft(e, 'and', AND);
    case 'or': return binLeft(e, 'or', OR);
    case '^': {
      const base = pr(e.args[0]), exp = pr(e.args[1]);
      return { text: wrap(base, CALL) + ' ^ ' + wrap(exp, UNARY), prec: POW };
    }
    case 'not': { const c = pr(e.args[0]); return { text: 'not ' + wrap(c, NOT), prec: NOT }; }
    case '=': case '!=': case '<': case '<=': case '>': case '>=': {
      const left = pr(e.args[0]), right = pr(e.args[1]);
      return { text: wrap(left, ADD) + ' ' + e.op + ' ' + wrap(right, ADD), prec: CMP };
    }
    case 'floor': return { text: 'floor(' + full(e.args[0]) + ')', prec: ATOM };
    case 'abs': return { text: 'abs(' + full(e.args[0]) + ')', prec: ATOM };
    case 'mod': return { text: 'mod(' + full(e.args[0]) + ', ' + full(e.args[1]) + ')', prec: ATOM };
    case 'if': return { text: 'if ' + full(e.args[0]) + ' then ' + full(e.args[1]) + ' else ' + full(e.args[2]), prec: EXPR };
    case 'let': return { text: 'let ' + e.name + ' = ' + full(e.value) + ' in ' + full(e.body), prec: EXPR };
    case 'fn': return { text: 'fn(' + e.params.join(', ') + ') ' + full(e.body), prec: EXPR };
    case 'rec': return { text: 'rec ' + e.name + '(' + e.params.join(', ') + ') = ' + full(e.fbody) + ' in ' + full(e.body), prec: EXPR };
    case 'call': {
      const fnPart = wrap(pr(e.fn), CALL);
      return { text: fnPart + '(' + e.args.map(full).join(', ') + ')', prec: CALL };
    }
    default: throw new Error('print: unknown op ' + e.op);
  }
}

export function print(tree) { return pr(tree).text; }
