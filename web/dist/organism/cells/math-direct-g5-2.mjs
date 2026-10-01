// math-direct-g5-2: whole-number theory computed from the prompt (factorial, gcd, lcm, primality, prime factors,
// fibonacci, divisor counts, sums of a run of whole numbers, n choose k). Pure and synchronous; every answer is computed.

export const meta = { id: 'math-direct-g5-2', class: 'math', generation: 5, lane: 'direct', grownFrom: [], version: 1 };

export const examples = [
  { q: 'what is 6 factorial', expect: { contains: ['720'], notRefusal: true, maxWords: 60 } },
  { q: 'gcd of 48 and 18', expect: { contains: ['6'], notRefusal: true, maxWords: 60 } },
  { q: 'is 97 a prime number', expect: { contains: ['97'], containsAny: ['is prime', 'is a prime', 'yes'], notContains: ['not prime', 'not a prime', 'composite'], notRefusal: true, maxWords: 60 } },
  { q: 'lcm of 4 and 6', expect: { contains: ['12'], notRefusal: true, maxWords: 60 } },
  { q: 'prime factors of 360', expect: { contains: ['2', '3', '5'], notContains: ['7', '11', '13'], notRefusal: true, maxWords: 60 } },
  { q: 'the 10th fibonacci number', expect: { contains: ['55'], notRefusal: true, maxWords: 60 } },
  { q: 'how many divisors does 36 have', expect: { contains: ['9'], notRefusal: true, maxWords: 60 } },
  { q: 'sum of 1 to 100', expect: { contains: ['5050'], notRefusal: true, maxWords: 60 } },
  { q: '10 choose 2', expect: { contains: ['45'], notRefusal: true, maxWords: 60 } },
];

// ---- number words to digits
const UNITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
  eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17,
  eighteenth: 18, nineteenth: 19, twentieth: 20, thirtieth: 30, fortieth: 40, fiftieth: 50, hundredth: 100 };
const WORDVAL = new Map();
UNITS.forEach((w, i) => WORDVAL.set(w, i));
TENS.forEach((w, i) => { if (w) WORDVAL.set(w, i * 10); });

function wordsToDigits(s) {
  const toks = s.split(/(\s+|-)/);
  const out = [];
  let cur = null, total = 0, pending = [];
  const flush = () => {
    if (cur !== null || total) { out.push(String(total + (cur || 0))); }
    else out.push(...pending);
    cur = null; total = 0; pending = [];
  };
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    const w = t.toLowerCase();
    if (/^(\s+|-)$/.test(t)) { if (cur !== null || total) { pending.push(t); continue; } out.push(t); continue; }
    if (WORDVAL.has(w)) { cur = (cur || 0) + WORDVAL.get(w); pending = []; continue; }
    if (w === 'hundred' && (cur !== null)) { cur = cur * 100; pending = []; continue; }
    if (w === 'thousand' && (cur !== null || total)) { total = (total + (cur || 0)) * 1000; cur = 0; pending = []; continue; }
    if (w === 'and' && cur !== null && i + 2 < toks.length && WORDVAL.has(toks[i + 2].toLowerCase())) { pending = []; continue; }
    if (ORD[w] !== undefined && w !== 'first') {
      const v = (cur || 0) + total + ORD[w];
      cur = null; total = 0; pending = [];
      out.push(v + 'th');
      continue;
    }
    if (cur !== null || total) { const sp = pending; flush(); out.push(...sp); }
    out.push(t);
  }
  if (cur !== null || total) flush();
  return out.join('');
}

function norm(q) {
  let s = String(q ?? '').toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
  s = wordsToDigits(s);
  s = s.replace(/(\d),(?=\d{3}\b)/g, '$1');
  return s;
}
const nums = (s) => (s.match(/\d+/g) || []).map((x) => BigInt(x));

// ---- arithmetic on BigInt
const babs = (a) => (a < 0n ? -a : a);
const gcd2 = (a, b) => { a = babs(a); b = babs(b); while (b) { [a, b] = [b, a % b]; } return a; };
const lcm2 = (a, b) => (a === 0n || b === 0n ? 0n : babs(a * b) / gcd2(a, b));
function modpow(b, e, m) { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
function isPrime(n) {
  if (n < 2n) return false;
  for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) { if (n === p) return true; if (n % p === 0n) return false; }
  let d = n - 1n, r = 0;
  while ((d & 1n) === 0n) { d >>= 1n; r++; }
  outer: for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n]) {
    let x = modpow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let i = 1; i < r; i++) { x = x * x % n; if (x === n - 1n) continue outer; }
    return false;
  }
  return true;
}
function rho(n) {
  if (n % 2n === 0n) return 2n;
  for (let c = 1n; c < 50n; c++) {
    let x = 2n, y = 2n, d = 1n;
    const f = (v) => (v * v + c) % n;
    let steps = 0;
    while (d === 1n && steps < 2000000) { x = f(x); y = f(f(y)); d = gcd2(x - y, n); steps++; }
    if (d !== n && d !== 1n) return d;
  }
  return null;
}
// prime factorization as a sorted array of [p, e]
function factor(n) {
  if (n > 10n ** 24n) return null;
  const m = new Map();
  const add = (p) => m.set(p, (m.get(p) || 0) + 1);
  for (let p = 2n; p < 1000n && p * p <= n; p += (p === 2n ? 1n : 2n)) { while (n % p === 0n) { add(p); n /= p; } }
  const stack = n > 1n ? [n] : [];
  while (stack.length) {
    const v = stack.pop();
    if (v === 1n) continue;
    if (isPrime(v)) { add(v); continue; }
    const d = rho(v);
    if (d === null) return null;
    stack.push(d, v / d);
  }
  return [...m.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}
function divisorsOf(f) {
  let ds = [1n];
  for (const [p, e] of f) { const next = []; for (const d of ds) { let x = d; for (let i = 0; i <= e; i++) { next.push(x); x *= p; } } ds = next; }
  return ds.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}
const tau = (f) => f.reduce((a, [, e]) => a * BigInt(e + 1), 1n);
function factorText(f) {
  const count = f.reduce((a, [, e]) => a + e, 0);
  if (count <= 12) { const xs = []; for (const [p, e] of f) for (let i = 0; i < e; i++) xs.push(String(p)); return xs.join(' x '); }
  return f.map(([p, e]) => (e > 1 ? p + '^' + e : String(p))).join(' x ');
}
const listText = (xs) => (xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
function ordinal(n) { const v = Number(n % 100n); const t = Number(n % 10n); const s = v >= 11 && v <= 13 ? 'th' : t === 1 ? 'st' : t === 2 ? 'nd' : t === 3 ? 'rd' : 'th'; return n + s; }
function fact(n) { let r = 1n; for (let i = 2n; i <= n; i++) r *= i; return r; }
function fib(n) { let a = 0n, b = 1n; for (let i = 0n; i < n; i++) [a, b] = [b, a + b]; return a; }
function choose(n, k) { if (k < 0n || k > n) return 0n; if (k > n - k) k = n - k; let r = 1n; for (let i = 1n; i <= k; i++) r = r * (n - k + i) / i; return r; }
function sieve(lim) { const c = new Uint8Array(lim + 1); const ps = []; for (let i = 2; i <= lim; i++) { if (!c[i]) { ps.push(i); for (let j = i * i; j <= lim; j += i) c[j] = 1; } } return ps; }

// ---- shape detection: returns a parsed task or null
const NOT_MATH_PRIME = /\bprime (minister|meridian|time|rib|video|day|suspect|number theorem)|\bamazon prime|\boptimus/;
const RUN = '(?:the )?(?:first )?(?:all )?(?:the )?(?:positive |natural |whole |counting )?(?:integers|numbers|whole numbers|natural numbers|counting numbers)?';

function parse(q) {
  const s = norm(q);
  if (!s || !/\d/.test(s)) return null;
  if (/[a-z]\s*=|=\s*[a-z]|\bsolve\b|\bequation\b|%|\bpercent\b|square root|\bsqrt\b|\bderivative\b|\bintegral\b/.test(s)) return null;
  const n = nums(s);
  let m;

  // n choose k
  if ((m = /\b(\d+)\s*(?:choose|c|ncr)\s*(\d+)\b/.exec(s)) || (m = /\bc\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(s)) || (m = /\bbinomial coefficient\b\D*(\d+)\D+(\d+)/.exec(s))) {
    return { kind: 'choose', n: BigInt(m[1]), k: BigInt(m[2]) };
  }
  if (/\b(combinations?|ways to (?:choose|pick|select)|ways (?:can|could) (?:you|i|we|one) (?:choose|pick|select))\b/.test(s) && n.length === 2) {
    if ((m = /\b(\d+)\b.*\b(?:from|out of|among)\b(?:\s+a\s+(?:set|group)\s+of)?\s*(\d+)\b/.exec(s))) return { kind: 'choose', n: BigInt(m[2]), k: BigInt(m[1]) };
    const [a, b] = n; return { kind: 'choose', n: a > b ? a : b, k: a > b ? b : a };
  }

  // gcd and lcm
  const isG = /\b(gcd|gcf|hcf|greatest common (divisor|factor)|highest common factor|largest common (divisor|factor))\b/.test(s);
  const isL = /\b(lcm|least common multiple|lowest common multiple|smallest common multiple)\b/.test(s);
  if ((isG || isL) && n.length >= 2 && n.length <= 8) return { kind: isL && !isG ? 'lcm' : 'gcd', xs: n };

  // fibonacci
  if (/\bfibonacci\b|\bfib\b/.test(s)) {
    if ((m = /\bfirst (\d+) fibonacci\b/.exec(s))) return { kind: 'fiblist', n: BigInt(m[1]) };
    if ((m = /^(?:is|check if|check whether|whether) (\d+) (?:a |an )?(?:fibonacci|fib)\b/.exec(s))) return { kind: 'isfib', n: BigInt(m[1]) };
    if (n.length === 1) return { kind: 'fib', n: n[0] };
    return null;
  }

  // triangular numbers
  if ((m = /\b(\d+)(?:st|nd|rd|th) triangular number\b/.exec(s)) || (m = /\btriangular number (?:number )?(\d+)\b/.exec(s))) return { kind: 'sum', a: 1n, b: BigInt(m[1]), how: 'tri' };

  // nth prime, primes below n, next prime
  if ((m = /\b(\d+)(?:st|nd|rd|th) (?:smallest )?prime\b/.exec(s)) && !/\bfactor/.test(s)) return { kind: 'nthprime', n: BigInt(m[1]) };
  if ((m = /\bhow many primes?(?: numbers?)? (?:are there )?(?:below|under|less than|up to|smaller than|before|not exceeding|between 1 and|from 1 to)\s*(\d+)\b/.exec(s))) return { kind: 'pi', n: BigInt(m[1]), incl: /up to|not exceeding|between 1 and|from 1 to/.test(s) };
  if ((m = /\b(?:next|first|smallest) prime (?:number )?(?:after|above|greater than|bigger than|larger than)\s*(\d+)\b/.exec(s))) return { kind: 'nextprime', n: BigInt(m[1]) };
  if ((m = /\b(?:largest|biggest|greatest) prime (?:number )?(?:below|under|less than|smaller than|before)\s*(\d+)\b/.exec(s)) || (m = /\bprime (?:number )?(?:just )?before\s*(\d+)\b/.exec(s))) return { kind: 'prevprime', n: BigInt(m[1]) };

  // sum of divisors
  if ((m = /\bsum of (?:the |all )?(?:(?:positive|proper) )?(?:divisors|factors)(?: of)? (\d+)\b/.exec(s))) return { kind: 'sigma', n: BigInt(m[1]), proper: /\bproper\b/.test(s) };

  // prime factors
  if (/\bprime factor|\bfactori[sz](e|ation)|\bprime decomposition\b|\bprimes?\b.*\bmultipl|\bproduct of primes\b|\bwrite \d+ as a product\b|\bbreak \d+ into primes\b/.test(s) && n.length === 1) {
    return { kind: 'pf', n: n[0] };
  }

  // divisors: count or list
  if (/\b(divisors?|factors?)\b/.test(s) && !/other than 1 and (?:it ?self|\d+)/.test(s) && n.length === 1) {
    if (/\bhow many\b|\bnumber of\b|\bcount\b/.test(s)) return { kind: 'tau', n: n[0] };
    if (/\b(list|what are|find|all|give|name|show)\b|^(?:the )?(?:positive )?(?:divisors|factors) of\b/.test(s)) return { kind: 'divs', n: n[0] };
  }
  if (/\bhow many\b.*\bdivide\b/.test(s) && n.length === 1) return { kind: 'tau', n: n[0] };

  // primality
  const other = /\b(?:divisors?|factors?)\b.*\bother than 1 and (?:it ?self|\d+)/.test(s);
  if (other) {
    const t = nums(s.replace(/other than 1 and (?:it ?self|\d+)/, ''));
    if (t.length === 1) return { kind: 'prime', n: t[0], other: true };
  }
  if (/\b(prime|composite|primality)\b/.test(s) && !NOT_MATH_PRIME.test(s) && n.length === 1 &&
      (/^(?:is|does|check|determine|tell|find out|test|decide|verify|whether|can|say|answer)\b|\bprimality\b|\bwhether\b|\b\d+ (?:is )?(?:a )?(?:prime|composite)\b.*\?|\bis (?:the number )?\d+ (?:a )?(?:prime|composite)/.test(s))) {
    return { kind: 'prime', n: n[0], comp: /\bcomposite\b/.test(s) && !/\bprime\b/.test(s) };
  }

  // factorial
  if (!/!=/.test(s)) {
    if ((m = /\b(\d+)\s*!/.exec(s)) && n.length === 1) return { kind: 'fact', n: BigInt(m[1]) };
    if (/\bfactorial\b/.test(s) && n.length === 1) return { kind: 'fact', n: n[0] };
  }
  if ((m = new RegExp('\\b(?:product|multiply(?: together)?|multiplying(?: together)?) (?:of )?' + RUN + ' ?(?:from )?1 (?:to|through|thru|up to|and) (\\d+)\\b').exec(s)) && n.length === 2) return { kind: 'fact', n: BigInt(m[1]), prod: true };

  // sums of a run of whole numbers
  if (/\b(sum|add|adding|total|added)\b/.test(s)) {
    const kindOf = /\bodd\b/.test(s) ? 'odd' : /\beven\b/.test(s) ? 'even' : /\bsquares?\b/.test(s) ? 'sq' : /\bcubes?\b/.test(s) ? 'cube' : 'plain';
    if ((m = /\bfirst (\d+) (?:positive |natural |whole |counting )?(?:odd |even )?(?:integers|numbers|whole numbers|natural numbers|counting numbers|squares|cubes|perfect squares|perfect cubes)\b/.exec(s)) && n.length === 1) return { kind: 'sum', a: 1n, b: BigInt(m[1]), how: kindOf, first: true };
    if ((m = /\b(\d+) (?:to|through|thru|up to|until|till|-) (\d+)\b/.exec(s)) && n.length === 2) {
      const a = BigInt(m[1]), b = BigInt(m[2]);
      if (b >= a && b - a <= 10n ** 15n) return { kind: 'sum', a, b, how: kindOf === 'sq' || kindOf === 'cube' ? (a === 1n ? kindOf : 'plain') : kindOf };
    }
  }
  if ((m = /^\s*1\s*\+\s*2\s*\+\s*(?:3\s*\+\s*)?(?:\.\.\.|…|\.\.)\s*\+\s*(\d+)\s*\??\s*$/.exec(s)) || (m = /\b1\s*\+\s*2\s*\+\s*(?:3\s*\+\s*)?(?:\.\.\.|…)\s*\+\s*(\d+)\b/.exec(s))) return { kind: 'sum', a: 1n, b: BigInt(m[1]), how: 'plain' };
  return null;
}

export function can(q) {
  try { return parse(q) !== null; } catch { return false; }
}

const MAX_FACT = 1000n, MAX_FIB = 10000n;

function solve(t) {
  switch (t.kind) {
    case 'choose': {
      if (t.n > 100000n) return null;
      if (t.k > t.n) return t.n + ' choose ' + t.k + ' is 0: you cannot pick ' + t.k + ' items from ' + t.n + '.';
      return t.n + ' choose ' + t.k + ' is ' + choose(t.n, t.k) + ': there are ' + choose(t.n, t.k) + ' ways to pick ' + t.k + ' items from ' + t.n + '.';
    }
    case 'gcd': { const v = t.xs.reduce(gcd2); return 'The greatest common divisor of ' + listText(t.xs.map(String)) + ' is ' + v + '.'; }
    case 'lcm': { const v = t.xs.reduce(lcm2); return 'The least common multiple of ' + listText(t.xs.map(String)) + ' is ' + v + '.'; }
    case 'fib': {
      if (t.n > MAX_FIB) return null;
      return 'The ' + ordinal(t.n) + ' Fibonacci number is ' + fib(t.n) + '.';
    }
    case 'fiblist': {
      if (t.n < 1n || t.n > 25n) return null;
      const xs = []; for (let i = 1n; i <= t.n; i++) xs.push(String(fib(i)));
      return 'The first ' + t.n + ' Fibonacci numbers are ' + listText(xs) + '.';
    }
    case 'isfib': {
      let a = 0n, b = 1n, i = 0n; while (a < t.n) { [a, b] = [b, a + b]; i++; }
      return a === t.n ? 'Yes, ' + t.n + ' is a Fibonacci number: it is the ' + ordinal(i) + ' one.' : 'No, ' + t.n + ' is not a Fibonacci number.';
    }
    case 'nthprime': {
      if (t.n < 1n || t.n > 200000n) return null;
      const k = Number(t.n); const lim = Math.max(30, Math.ceil(k * (Math.log(k) + Math.log(Math.log(k + 2)) + 2)));
      const ps = sieve(lim);
      return 'The ' + ordinal(t.n) + ' prime number is ' + ps[k - 1] + '.';
    }
    case 'pi': {
      if (t.n > 20000000n) return null;
      const lim = Number(t.incl ? t.n : t.n - 1n); const c = lim < 2 ? 0 : sieve(lim).length;
      return 'There are ' + c + ' prime numbers ' + (t.incl ? 'up to ' : 'below ') + t.n + '.';
    }
    case 'nextprime': { let v = t.n + 1n; while (!isPrime(v)) v++; return 'The smallest prime greater than ' + t.n + ' is ' + v + '.'; }
    case 'prevprime': {
      let v = t.n - 1n; while (v >= 2n && !isPrime(v)) v--;
      return v < 2n ? 'There is no prime below ' + t.n + '.' : 'The largest prime less than ' + t.n + ' is ' + v + '.';
    }
    case 'sigma': {
      if (t.n < 1n) return null;
      const f = factor(t.n); if (!f) return null;
      const s = divisorsOf(f).reduce((a, b) => a + b, 0n) - (t.proper ? t.n : 0n);
      return 'The sum of the ' + (t.proper ? 'proper ' : 'positive ') + 'divisors of ' + t.n + ' is ' + s + '.';
    }
    case 'pf': {
      if (t.n < 2n) return t.n + ' has no prime factors: it is not a product of primes.';
      const f = factor(t.n); if (!f) return null;
      if (f.length === 1 && f[0][1] === 1) return t.n + ' is prime, so its only prime factor is ' + t.n + ' itself.';
      const ps = f.map(([p]) => String(p));
      return t.n + ' = ' + factorText(f) + ', so its prime factors are ' + listText(ps) + '.';
    }
    case 'tau': {
      if (t.n < 1n) return null;
      const f = factor(t.n); if (!f) return null;
      const c = tau(f);
      if (c <= 20n) return t.n + ' has ' + c + ' positive divisor' + (c === 1n ? '' : 's') + ': ' + listText(divisorsOf(f).map(String)) + '.';
      return t.n + ' = ' + factorText(f) + ', so it has ' + c + ' positive divisors.';
    }
    case 'divs': {
      if (t.n < 1n) return null;
      const f = factor(t.n); if (!f) return null;
      const c = tau(f);
      if (c > 30n) return t.n + ' has ' + c + ' positive divisors (' + t.n + ' = ' + factorText(f) + ').';
      return 'The ' + c + ' positive divisors of ' + t.n + ' are ' + listText(divisorsOf(f).map(String)) + '.';
    }
    case 'prime': {
      const v = t.n;
      if (v < 2n) return 'No, ' + v + ' is not prime: a prime has exactly two divisors, 1 and itself.';
      if (t.comp) { if (isPrime(v)) return 'No, ' + v + ' is not composite: ' + v + ' is prime.'; const g = factor(v); return 'Yes, ' + v + ' is composite (it is not prime)' + (g ? ': ' + v + ' = ' + factorText(g) : '') + '.'; }
      if (isPrime(v)) return t.other ? 'No: ' + v + ' is prime, so its only divisors are 1 and ' + v + '.' : 'Yes, ' + v + ' is prime: its only divisors are 1 and ' + v + '.';
      const f = factor(v);
      const body = f ? v + ' = ' + factorText(f) : v + ' is divisible by a smaller number';
      return t.other ? 'Yes: ' + body + ', so ' + v + ' is not prime; it is composite.' : 'No, ' + v + ' is not prime; it is composite: ' + body + '.';
    }
    case 'fact': {
      if (t.n > MAX_FACT) return null;
      const v = fact(t.n);
      if (t.prod) return 'The product of the whole numbers from 1 to ' + t.n + ' is ' + t.n + ' factorial, ' + v + '.';
      return t.n + ' factorial (' + t.n + '!) is ' + v + '.';
    }
    case 'sum': {
      const { a, b, how } = t;
      if (how === 'tri') return 'The ' + ordinal(b) + ' triangular number is ' + (b * (b + 1n) / 2n) + ', the sum of 1 to ' + b + '.';
      if (t.first || a === 1n) {
        const k = b;
        if (how === 'odd') return 'The sum of the first ' + k + ' odd numbers is ' + k * k + '.';
        if (how === 'even') {
          if (t.first) return 'The sum of the first ' + k + ' even numbers is ' + k * (k + 1n) + '.';
          const e = k / 2n; return 'The sum of the even numbers from 1 to ' + k + ' is ' + e * (e + 1n) + '.';
        }
        if (how === 'sq') return 'The sum of the squares from 1 to ' + k + ' is ' + k * (k + 1n) * (2n * k + 1n) / 6n + '.';
        if (how === 'cube') return 'The sum of the cubes from 1 to ' + k + ' is ' + (k * (k + 1n) / 2n) ** 2n + '.';
        if (how === 'plain' && !t.first) return 'The sum of 1 to ' + k + ' is ' + k * (k + 1n) / 2n + ', since ' + k + ' x ' + (k + 1n) + ' / 2 = ' + k * (k + 1n) / 2n + '.';
        if (how === 'plain') return 'The sum of the first ' + k + ' whole numbers is ' + k * (k + 1n) / 2n + '.';
      }
      if (how === 'odd' || how === 'even') {
        const par = how === 'odd' ? 1n : 0n;
        const lo = (a % 2n === par) ? a : a + 1n, hi = (b % 2n === par) ? b : b - 1n;
        const c = hi >= lo ? (hi - lo) / 2n + 1n : 0n;
        return 'The sum of the ' + how + ' numbers from ' + a + ' to ' + b + ' is ' + c * (lo + hi) / 2n + '.';
      }
      return 'The sum of the whole numbers from ' + a + ' to ' + b + ' is ' + (b - a + 1n) * (a + b) / 2n + '.';
    }
    default: return null;
  }
}

export function answer(q) {
  try {
    const t = parse(q);
    if (!t) return null;
    const out = solve(t);
    return typeof out === 'string' && out.length ? out : null;
  } catch { return null; }
}
