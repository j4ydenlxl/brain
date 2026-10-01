// math-direct-g4-2: whole-number theory computed exactly with BigInt.
export const meta = { id: 'math-direct-g4-2', class: 'math', generation: 4, lane: 'direct', grownFrom: ["what is 6 factorial","gcd of 48 and 18","is 97 a prime number","lcm of 4 and 6","prime factors of 360","the 10th fibonacci number","how many divisors does 36 have","sum of 1 to 100","10 choose 2","how many divisors does 60 have","7 choose 3","prime factors of 924","the 15th fibonacci number","how many divisors does 120 have"], version: 1 };

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

const WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100 };
const ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20, thirtieth: 30, fortieth: 40, fiftieth: 50, hundredth: 100 };

function norm(q) {
  let s = String(q == null ? '' : q).toLowerCase().replace(/(\d),(?=\d{3}\b)/g, '$1');
  s = s.replace(/[a-z]+/g, (w) => (w in WORDS ? String(WORDS[w]) : w));
  s = s.replace(/\b([a-z]+)\b(?! \d)/g, (w) => (w in ORD ? ORD[w] + 'th' : w));
  s = s.replace(/\b([1-9]) 100\b/g, (m, a) => String(Number(a) * 100));
  s = s.replace(/\b([2-9]0) ([1-9])\b/g, (m, a, b) => String(Number(a) + Number(b)));
  s = s.replace(/\b([1-9]00) (?:and )?([1-9]\d?)\b/g, (m, a, b) => String(Number(a) + Number(b)));
  return s.replace(/\s+/g, ' ').trim();
}
const nums = (s) => (s.match(/\d+/g) || []).map((x) => BigInt(x));

const KIND = [
  ['choose', /\b\d+\s*(?:choose|c|ncr)\s*\d+\b|\bc\s*\(\s*\d+\s*,\s*\d+\s*\)|\bbinomial coefficient\b|\bcombinations?\b|\bways to (?:choose|pick|select)\b/],
  ['fact', /\bfactorial\b|\b\d+\s*!(?!=)/],
  ['gcd', /\bgcd\b|\bhcf\b|\bgcf\b|\bgreatest common (?:divisor|factor)\b|\bhighest common factor\b/],
  ['lcm', /\blcm\b|\bleast common multiple\b|\blowest common multiple\b|\bsmallest common multiple\b/],
  ['pf', /\bprime factor(?:s|i[sz]ation)?\b|\bfactori[sz](?:e|ation)\b|\bfactor (?:\d+ )?into primes\b/],
  ['fib', /\bfibonacci\b|\bfib\s*\(\s*\d+\s*\)/],
  ['div', /\b(?:number of|how many|count(?: of)?|count the)\b[^?]*\b(?:divisors|factors)\b|\bdivisors? count\b|\bd\s*\(\s*\d+\s*\)/],
  ['prime', /\bprime\b/],
  ['sum', /\bsum\b[^?]*\b\d+\s*(?:to|through|thru|until|-)\s*\d+\b|\bsum of (?:the )?first \d+\b|\badd(?:ing)? (?:up )?(?:all )?(?:the )?(?:numbers|integers|whole numbers)? ?(?:from )?\d+ (?:to|through) \d+\b|\b1 ?\+ ?2 ?\+ ?(?:3 ?\+ ?)?(?:\.\.\.|…) ?\+ ?\d+\b/],
];

function kind(s) {
  if (!/\d/.test(s)) return null;
  for (const [k, re] of KIND) if (re.test(s)) return k;
  return null;
}

export function can(q) {
  try { return kind(norm(q)) !== null; } catch { return false; }
}

const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a < 0n ? -a : a; };
function modpow(b, e, m) { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
function isPrime(n) {
  if (n < 2n) return false;
  for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) { if (n === p) return true; if (n % p === 0n) return false; }
  let d = n - 1n, r = 0; while ((d & 1n) === 0n) { d >>= 1n; r++; }
  for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) {
    let x = modpow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let ok = false;
    for (let i = 1; i < r; i++) { x = x * x % n; if (x === n - 1n) { ok = true; break; } }
    if (!ok) return false;
  }
  return true;
}
function rho(n) {
  if (n % 2n === 0n) return 2n;
  for (let c = 1n; c < 50n; c++) {
    let x = 2n, y = 2n, d = 1n;
    const f = (v) => (v * v + c) % n;
    let steps = 0;
    while (d === 1n && steps++ < 200000) { x = f(x); y = f(f(y)); d = gcd(x > y ? x - y : y - x, n); }
    if (d !== 1n && d !== n) return d;
  }
  return null;
}
function factor(n, out = new Map()) {
  for (let p = 2n; p < 1000n && p * p <= n; p += p === 2n ? 1n : 2n) while (n % p === 0n) { out.set(p, (out.get(p) || 0) + 1); n /= p; }
  if (n === 1n) return out;
  if (isPrime(n)) { out.set(n, (out.get(n) || 0) + 1); return out; }
  const d = rho(n);
  if (!d) return null;
  if (!factor(d, out)) return null;
  return factor(n / d, out);
}
function fib(n) { let a = 0n, b = 1n; for (let i = 0n; i < n; i++) [a, b] = [b, a + b]; return a; }
function fact(n) { let r = 1n; for (let i = 2n; i <= n; i++) r *= i; return r; }
function choose(n, k) { if (k < 0n || k > n) return 0n; if (k > n - k) k = n - k; let r = 1n; for (let i = 1n; i <= k; i++) r = r * (n - k + i) / i; return r; }
const list = (xs) => (xs.length < 2 ? String(xs[0]) : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
const LIM = 2n ** 96n;

function solve(s) {
  const k = kind(s);
  if (!k) return null;
  const ns = nums(s);
  if (!ns.length) return null;
  switch (k) {
    case 'fact': {
      const m = s.match(/\bfactorial (?:of )?(\d+)\b/) || s.match(/\b(\d+)\s*(?:!|factorial)/);
      const n = m ? BigInt(m[1]) : ns[0];
      if (n > 3000n) return null;
      return `${n} factorial (${n}!) is ${fact(n)}.`;
    }
    case 'gcd': case 'lcm': {
      const xs = ns.filter((x) => x > 0n);
      if (xs.length < 2) return null;
      const g = xs.reduce(gcd);
      if (k === 'gcd') return `The greatest common divisor of ${list(xs)} is ${g}.`;
      const l = xs.reduce((a, b) => a / gcd(a, b) * b);
      return `The least common multiple of ${list(xs)} is ${l}.`;
    }
    case 'pf': {
      const n = ns[ns.length - 1];
      if (n < 2n || n > LIM) return null;
      const f = factor(n);
      if (!f) return null;
      const ps = [...f.keys()].sort((a, b) => (a < b ? -1 : 1));
      if (ps.length === 1 && f.get(ps[0]) === 1) return `It is prime, so its only prime factor is ${ps[0]}.`;
      return `Its prime factors are ${list(ps)}.`;
    }
    case 'fib': {
      const n = ns[0];
      if (n > 20000n) return null;
      return `The ${ordinal(n)} Fibonacci number is ${fib(n)}.`;
    }
    case 'div': {
      const n = ns[ns.length - 1];
      if (n < 1n || n > LIM) return null;
      const f = factor(n);
      if (!f) return null;
      let c = 1n; for (const e of f.values()) c *= BigInt(e + 1);
      return `${n} has ${c} positive divisors.`;
    }
    case 'prime': {
      const n = ns[0];
      if (n > LIM) return null;
      if (isPrime(n)) return `Yes, ${n} is prime.`;
      if (n < 2n) return `No, ${n} is not prime: primes start at 2.`;
      const f = factor(n);
      const p = f ? [...f.keys()].sort((a, b) => (a < b ? -1 : 1))[0] : null;
      return p ? `No, ${n} is not prime: it is divisible by ${p}.` : `No, ${n} is not prime.`;
    }
    case 'sum': {
      let a, b;
      const first = s.match(/\bfirst (\d+)\b/);
      const range = s.match(/\b(\d+)\s*(?:to|through|thru|until|-)\s*(\d+)\b/) || s.match(/(\d+) ?\+ ?\d+.*?\+ ?(\d+)\b/);
      if (first && !range) { a = 1n; b = BigInt(first[1]); }
      else if (range) { a = BigInt(range[1]); b = BigInt(range[2]); }
      else return null;
      if (b < a) [a, b] = [b, a];
      const t = (a + b) * (b - a + 1n) / 2n;
      return `The sum of the whole numbers from ${a} to ${b} is ${t}.`;
    }
    case 'choose': {
      const m = s.match(/\b(\d+)\s*(?:choose|c|ncr)\s*(\d+)\b/) || s.match(/\bc\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      let n, r;
      if (m) { n = BigInt(m[1]); r = BigInt(m[2]); }
      else {
        const w = s.match(/\b(\d+)\b[^\d]*?\b(?:from|out of|of|among)\b[^\d]*?\b(\d+)\b/);
        if (w) { r = BigInt(w[1]); n = BigInt(w[2]); }
        else if (ns.length >= 2) { n = ns[0]; r = ns[1]; if (r > n) [n, r] = [r, n]; }
        else return null;
      }
      if (n > 5000n) return null;
      return `${n} choose ${r} is ${choose(n, r)}.`;
    }
  }
  return null;
}
function ordinal(n) {
  const t = n % 100n, u = n % 10n;
  const suf = t >= 11n && t <= 13n ? 'th' : u === 1n ? 'st' : u === 2n ? 'nd' : u === 3n ? 'rd' : 'th';
  return `${n}${suf}`;
}

export function answer(q) {
  try { return solve(norm(q)); } catch { return null; }
}
