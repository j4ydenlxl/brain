// test/lang.test.mjs: the text front-end for the sym language: round trips, evaluation
// against the same programs written with the S builders in test/universal.test.mjs, and
// parse errors that name what was expected and where.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as Sig from '../core/signal.mjs';
import { evalSym } from '../core/primitives.mjs';
import { parse, print, run } from '../lang/index.mjs';

const S = Sig.S;
const N = (x) => S.num(x), V = S.v;
const str = (r) => Sig.ratToString(r);

// deepEqual understands plain objects, arrays and BigInt leaves (SameValueZero), which is
// exactly the shape of a sym tree (num nodes carry BigInt n/d).
function roundTrips(text) {
  const t1 = parse(text);
  const printed = print(t1);
  const t2 = parse(printed);
  assert.deepEqual(t2, t1, 'round trip changed the tree for ' + JSON.stringify(text) + ' (printed: ' + JSON.stringify(printed) + ')');
  return t1;
}

// ---------------------------------------------------------------- round trips (40+)
const ROUND_TRIP_PROGRAMS = [
  '42',
  '3.14',
  '0.5',
  '9.11',
  '3/4',
  '-5',
  '-3.5',
  '- - x',
  '2 + 3 * 4',
  '(2 + 3) * 4',
  '2 ^ 3 ^ 2',
  '(2 ^ 3) ^ 2',
  '-2 ^ 2',
  '2 ^ -1',
  '2 - 3 - 4',
  '2 - (3 - 4)',
  '10 / 2 / 5',
  '10 / (2 / 5)',
  'a + b * c - d / e',
  '2 * 3 + 4 * 5',
  'a * (b + c)',
  '1 + 2 + 3 + 4',
  '1 = 1',
  '1 != 2',
  '1 < 2',
  '1 <= 1',
  '2 > 1',
  '2 >= 2',
  '1 < 2 and 3 > 2',
  '1 < 2 or 3 < 2',
  'not 1 = 2',
  'not not x',
  'a and b or c',
  'a or b and c',
  '(a or b) and c',
  'a = b and c = d',
  'not (a and b)',
  'if a then b else c',
  'if 1 < 2 then 10 else 20',
  'let x = 5 in x + 1',
  'let x = let y = 2 in y + 1 in x * 3',
  'fn(x, y) x + y',
  'let add = fn(x, y) x + y in add(2, 3)',
  'rec fact(n) = if n <= 1 then 1 else n * fact(n - 1) in fact(5)',
  'rec fib(n) = if n < 2 then n else fib(n - 1) + fib(n - 2) in fib(10)',
  'floor(3.7)',
  'floor(-3.7)',
  'abs(-5)',
  'abs(5)',
  'mod(7, 3)',
  'mod(-7, 3)',
  'f(x)',
  'f(x, y, z)',
  'f()',
  '(fn(x) x * 2)(5)',
  'x ^ y ^ z',
  'let k = 1 in # a trailing comment\n  k + 1',
];

test('lang: at least 40 programs round trip through parse -> print -> parse (deepEqual)', () => {
  assert.ok(ROUND_TRIP_PROGRAMS.length >= 40, 'need at least 40 programs, have ' + ROUND_TRIP_PROGRAMS.length);
  for (const p of ROUND_TRIP_PROGRAMS) roundTrips(p);
});

// ---------------------------------------------------------------- evaluation matches universal.test.mjs
test('lang: factorial 20 and fibonacci 20 as text agree exactly with the S-builder trees in test/universal.test.mjs', () => {
  const factText = 'rec fact(n) = if n <= 1 then 1 else n * fact(n - 1) in fact(20)';
  const factS = S.rec('fact', ['n'], S.if(S.le(V('n'), N(1)), N(1), S.mul(V('n'), S.call('fact', S.sub(V('n'), N(1))))), S.call('fact', N(20)));
  assert.equal(run(factText).decimal, str(evalSym(factS)));
  assert.equal(run(factText).decimal, '2432902008176640000');

  const fibText = 'rec fib(n) = if n < 2 then n else fib(n - 1) + fib(n - 2) in fib(20)';
  const fibS = S.rec('fib', ['n'], S.if(S.lt(V('n'), N(2)), V('n'), S.add(S.call('fib', S.sub(V('n'), N(1))), S.call('fib', S.sub(V('n'), N(2))))), S.call('fib', N(20)));
  assert.equal(run(fibText).decimal, str(evalSym(fibS)));
  assert.equal(run(fibText).decimal, '6765');
});

test('lang: gcd(1071, 462) as text matches the S-builder version exactly', () => {
  const gcdText = 'rec gcd(a, b) = if b = 0 then a else gcd(b, mod(a, b)) in gcd(1071, 462)';
  const gcdS = S.rec('gcd', ['a', 'b'], S.if(S.eq(V('b'), N(0)), V('a'), S.call('gcd', V('b'), S.mod(V('a'), V('b')))), S.call('gcd', N(1071), N(462)));
  assert.equal(run(gcdText).decimal, str(evalSym(gcdS)));
  assert.equal(run(gcdText).decimal, '21');
});

test('lang: Newton sqrt(2), 7 steps from 1, agrees with the S-builder version to 40 exact digits', () => {
  const text = 'rec step(x, k) = if k = 0 then x else step((x + 2 / x) / 2, k - 1) in step(1, 7)';
  const { value } = run(text);
  const r = Sig.toRat(value);
  const digits = (r.n * 10n ** 40n / r.d).toString();
  assert.equal(digits.slice(0, 41), '14142135623730950488016887242096980785696');
});

// ---------------------------------------------------------------- precedence cases
test('lang: precedence matches the grammar exactly, checked against hand-built S trees', () => {
  assert.deepEqual(parse('2 + 3 * 4'), S.add(N(2), S.mul(N(3), N(4))));
  assert.deepEqual(parse('2 ^ 3 ^ 2'), S.pow(N(2), S.pow(N(3), N(2))), '^ is right-associative');
  assert.deepEqual(parse('-2 ^ 2'), S.neg(S.pow(N(2), N(2))), 'unary minus binds looser than ^');
  assert.deepEqual(parse('2 ^ -1'), S.pow(N(2), S.neg(N(1))), 'unary minus on the exponent binds to it');
  assert.deepEqual(parse('1 < 2 and 3 > 2'), S.and(S.lt(N(1), N(2)), S.gt(N(3), N(2))), 'comparisons inside and');
  assert.deepEqual(parse('1 < 2 or 3 < 2'), S.or(S.lt(N(1), N(2)), S.lt(N(3), N(2))), 'comparisons inside or');
  assert.deepEqual(parse('a and b or c'), S.or(S.and(V('a'), V('b')), V('c')), 'and binds tighter than or');
  assert.deepEqual(parse('2 - 3 - 4'), S.sub(S.sub(N(2), N(3)), N(4)), '- is left-associative');
  assert.equal(run('2 + 3 * 4').decimal, '14');
});

// ---------------------------------------------------------------- errors: what, line, column
const POS_RE = /at line (\d+), column (\d+)/;

function assertPos(fn, expectedSubstring, line, col) {
  assert.throws(fn, (err) => {
    assert.ok(err instanceof Error, 'threw an Error');
    assert.ok(err.message.includes(expectedSubstring), 'message ' + JSON.stringify(err.message) + ' should include ' + JSON.stringify(expectedSubstring));
    const m = POS_RE.exec(err.message);
    assert.ok(m, 'message reports a line/column: ' + JSON.stringify(err.message));
    assert.equal(Number(m[1]), line, 'line');
    assert.equal(Number(m[2]), col, 'column');
    return true;
  });
}

test('lang: tokenizer error reports the offending character with line and column', () => {
  assertPos(() => parse('@'), 'unexpected character', 1, 1);
  assertPos(() => parse('1 + @'), 'unexpected character', 1, 5);
  assertPos(() => parse('1 +\n2 +\n@'), 'unexpected character', 3, 1);
});

test('lang: missing closing paren reports end of input with position', () => {
  assertPos(() => parse('(1 + 2'), "expected ')'", 1, 7);
});

test('lang: missing "in" after let reports end of input with position', () => {
  assertPos(() => parse('let x = 5'), "expected 'in'", 1, 10);
});

test('lang: missing "then" and "else" in if report position', () => {
  assertPos(() => parse('if a b else c'), "expected 'then'", 1, 6);
  assertPos(() => parse('if a then b'), "expected 'else'", 1, 12);
});

test('lang: dangling operator reports "expected an expression" with position', () => {
  assertPos(() => parse('2 +'), 'expected an expression', 1, 4);
});

test('lang: trailing tokens after a complete expression report position', () => {
  assertPos(() => parse('1 + 2)'), 'expected end of input', 1, 6);
});

test('lang: a keyword used as a binding name reports position', () => {
  assertPos(() => parse('let if = 5 in if'), 'expected an identifier', 1, 5);
});

test('lang: mod called with the wrong arity reports position', () => {
  assertPos(() => parse('mod(1)'), "expected ','", 1, 6);
  assertPos(() => parse('floor(1, 2)'), "expected ')'", 1, 8);
});

test('lang: multi-line programs track line and column correctly across newlines', () => {
  const text = 'let x = 1 in\n  let y = 2 in\n  x + y +';
  assertPos(() => parse(text), 'expected an expression', 3, 10);
});
