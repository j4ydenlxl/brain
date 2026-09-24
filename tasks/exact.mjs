// tasks/exact.mjs: THE INDEPENDENT RULER. Exact rational arithmetic on BigInt, written
// for the task graders alone. It deliberately imports nothing from core/: not signal.mjs,
// not primitives.mjs, nothing the brain runs on. An expected answer produced here cannot
// be right merely because the brain is self-consistent with itself. When a grader says a
// problem is correct, two independent implementations of the same arithmetic agreed.
//
// Representation: { n: BigInt, d: BigInt } with d > 0n and gcd(|n|, d) === 1n.
// Canonical string: "n" when d === 1n, otherwise "n/d". That spelling matches what the
// brain prints, which is the only thing borrowed here, and a spelling is not an answer.

export function gcdBig(a, b) {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  while (b) { const t = a % b; a = b; b = t; }
  return a;
}

export function Q(n, d = 1n) {
  n = BigInt(n); d = BigInt(d);
  if (d === 0n) throw new Error('exact: division by zero');
  if (d < 0n) { n = -n; d = -d; }
  if (n === 0n) return { n: 0n, d: 1n };
  const g = gcdBig(n, d);
  return { n: n / g, d: d / g };
}

export const Q0 = Q(0n);
export const Q1 = Q(1n);

export function qAdd(a, b) { return Q(a.n * b.d + b.n * a.d, a.d * b.d); }
export function qSub(a, b) { return Q(a.n * b.d - b.n * a.d, a.d * b.d); }
export function qMul(a, b) { return Q(a.n * b.n, a.d * b.d); }
export function qDiv(a, b) { if (b.n === 0n) throw new Error('exact: division by zero'); return Q(a.n * b.d, a.d * b.n); }
export function qNeg(a) { return { n: -a.n, d: a.d }; }
export function qAbs(a) { return a.n < 0n ? { n: -a.n, d: a.d } : a; }
export function qCmp(a, b) { const l = a.n * b.d, r = b.n * a.d; return l < r ? -1 : l > r ? 1 : 0; }
export function qEq(a, b) { return a.n === b.n && a.d === b.d; }
export function qIsZero(a) { return a.n === 0n; }
export function qIsInt(a) { return a.d === 1n; }

export function qPow(a, k) {
  k = BigInt(k);
  if (k === 0n) return Q1;
  if (k < 0n) { if (a.n === 0n) throw new Error('exact: zero to a negative power'); return Q(a.d ** -k, a.n ** -k); }
  return Q(a.n ** k, a.d ** k);
}

// Own parser. Accepts "12", "-3.75", "+0.1", "7/8", "-2.5/1.25". No exponent notation:
// the generators never emit one, and a parser that accepts what it is never given is a
// parser nothing has ever checked.
export function qFromString(s) {
  s = String(s).trim();
  if (s.includes('/')) {
    const i = s.indexOf('/');
    return qDiv(qFromString(s.slice(0, i)), qFromString(s.slice(i + 1)));
  }
  let sign = 1n;
  if (s.startsWith('-')) { sign = -1n; s = s.slice(1); }
  else if (s.startsWith('+')) s = s.slice(1);
  if (s === '') throw new Error('exact: not a number: ' + s);
  const dot = s.indexOf('.');
  let ip = s, fp = '';
  if (dot >= 0) { ip = s.slice(0, dot); fp = s.slice(dot + 1); }
  if (ip === '') ip = '0';
  for (const part of [ip, fp]) for (let i = 0; i < part.length; i++) {
    const c = part.charCodeAt(i);
    if (c < 48 || c > 57) throw new Error('exact: not a number: ' + s);
  }
  const n = BigInt(ip + fp) * sign;
  const d = 10n ** BigInt(fp.length);
  return Q(n, d);
}

export function qToString(a) { return a.d === 1n ? a.n.toString() : a.n.toString() + '/' + a.d.toString(); }

// Exact decimal rendering when the denominator is 2^i * 5^j; null otherwise. Used to
// print problems in decimal form without ever rounding.
export function qToDecimal(a) {
  let d = a.d, twos = 0, fives = 0;
  while (d % 2n === 0n) { d /= 2n; twos++; }
  while (d % 5n === 0n) { d /= 5n; fives++; }
  if (d !== 1n) return null;
  const places = Math.max(twos, fives);
  const scaled = a.n * 10n ** BigInt(places) / a.d;
  const neg = scaled < 0n;
  let digits = (neg ? -scaled : scaled).toString();
  if (places === 0) return (neg ? '-' : '') + digits;
  while (digits.length <= places) digits = '0' + digits;
  const ip = digits.slice(0, digits.length - places);
  const fp = digits.slice(digits.length - places).replace(/0+$/, '');
  return (neg ? '-' : '') + ip + (fp ? '.' + fp : '');
}

// Decimal with exactly `places` digits after the point, built from an integer of
// unscaled units. Generators use this so every literal they print is exact by construction.
export function decimal(units, places) {
  return Q(BigInt(units), 10n ** BigInt(places));
}

// Binomial coefficient as an exact rational, C(n, k) for integer n >= 0.
export function binomial(n, k) {
  n = BigInt(n); k = BigInt(k);
  if (k < 0n || k > n) return Q0;
  let num = 1n, den = 1n;
  for (let i = 0n; i < k; i++) { num *= (n - i); den *= (i + 1n); }
  return Q(num, den);
}

// Evaluate a plain problem spec tree. This is the graders' evaluator: a spec node is
// { op: '+'|'-'|'*'|'/'|'^', args: [...] } or { op: 'q', value: Q } and nothing else. It
// shares no code with core/primitives.mjs evalSym, which is the point.
export function qEval(node) {
  switch (node.op) {
    case 'q': return node.value;
    case '+': return node.args.map(qEval).reduce(qAdd);
    case '*': return node.args.map(qEval).reduce(qMul);
    case '-': return qSub(qEval(node.args[0]), qEval(node.args[1]));
    case '/': return qDiv(qEval(node.args[0]), qEval(node.args[1]));
    case '^': return qPow(qEval(node.args[0]), node.k);
    default: throw new Error('exact: unknown spec op ' + node.op);
  }
}

// Render a spec tree as a word-free infix string. The prompt a solver sees.
export function qSpecToString(node) {
  switch (node.op) {
    case 'q': return node.text ?? qToDecimal(node.value) ?? qToString(node.value);
    case '^': return '(' + qSpecToString(node.args[0]) + ')^' + String(node.k);
    default: return '(' + node.args.map(qSpecToString).join(' ' + node.op + ' ') + ')';
  }
}
