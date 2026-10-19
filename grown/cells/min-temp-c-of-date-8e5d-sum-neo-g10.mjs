// min-temp-c-of-date-8e5d-sum-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"min-temp-c-of-date-8e5d-sum-neo-g10","class":"min-temp-c-of-date-8e5d-sum","generation":10,"lane":"neo","grownFrom":["what is the sum of the min temp c of 1996-08-25 and 2020-10-24","the min temp c of 1996-05-18 plus the min temp c of 2021-11-13 makes what","what is the sum of the min temp c of 2007-03-24 and 1994-07-03","the min temp c of 2008-01-12 plus the min temp c of 1998-11-06 makes what","what is the sum of the min temp c of 2021-02-28 and 2020-02-28","the min temp c of 1998-04-08 plus the min temp c of 2011-09-25 makes what","add the min temp c of 2002-12-27 to the min temp c of 1998-04-08","the min temp c of 2012-12-26 plus the min temp c of 1999-11-27 makes what","the min temp c of 2007-06-17 plus the min temp c of 1991-12-18 makes what","add the min temp c of 2019-08-07 to the min temp c of 1995-01-01","the min temp c of 2013-03-13 plus the min temp c of 1993-08-27 makes what","the min temp c of 2017-02-21 plus the min temp c of 2022-04-23 makes what","add the min temp c of 1999-03-14 to the min temp c of 2024-11-02","the min temp c of 2013-01-21 plus the min temp c of 1999-10-28 makes what","what is the sum of the min temp c of 2024-09-23 and 1995-03-29","the min temp c of 2022-10-07 plus the min temp c of 2024-03-20 makes what","what is the sum of the min temp c of 2010-12-09 and 2003-12-31","the min temp c of 2006-07-07 plus the min temp c of 2021-02-28 makes what","what is the sum of the min temp c of 1991-12-18 and 2005-03-22","the min temp c of 2020-01-19 plus the min temp c of 2003-11-13 makes what"],"version":1});

// <KERNEL>
const KERNEL_VERSION = 2;
const MAX_DEPTH = 64;
const MAX_LIST = 10000;
const MAX_BITS = 65536;
const MAX_TEXT = 100000;
const SAFE = 9007199254740991n;
const NEAR = 0.5;
const TYPES = Object.freeze(['text', 'num', 'nums', 'str', 'strs', 'bool', 'kv', 'tpl', 'mat']);
const FAMILIES = Object.freeze(['sense', 'transform', 'aggregate', 'compare', 'compute', 'memory', 'know', 'series', 'table', 'matrix', 'route', 'iterate', 'render']);
/** A matrix holds at most MAT_MAX rows and columns; its determinant and inverse are taken up to MAT_SOLVE. */
const MAT_MAX = 12;
const MAT_SOLVE = 10;
const STOP_WORDS = Object.freeze(('a an the is are was were be been being am of to in on at by for with from and or but ' +
  'what whats which who whom whose how when where why do does did can could would should will shall may might must ' +
  'please me my i im you your it its this that these those tell give show find there their them they we us our ' +
  'so as if than then into let lets just some any').split(' '));
const STOP = new Set(STOP_WORDS);
const MINOR = new Set(['of', 'and', 'the', 'for', 'a', 'an', 'in', 'on', 'to', 'at', 'by', 'with', 'or']);
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

// ---- values and types
function isKv(v) { return v !== null && typeof v === 'object' && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v)); }
function isNum(v) { return (typeof v === 'number' && Number.isFinite(v)) || typeof v === 'bigint'; }
function isInt(v) { return typeof v === 'bigint' || (typeof v === 'number' && Number.isInteger(v)); }
function isTpl(v) { return Array.isArray(v) && v.every((p) => typeof p === 'string' || (isKv(p) && Number.isInteger(p.slot) && p.slot >= 0 && p.slot < 100)); }
/** A matrix: 1 to MAT_MAX rows of one length (1 to MAT_MAX) of numbers. */
function isMat(v) { return Array.isArray(v) && v.length >= 1 && v.length <= MAT_MAX && Array.isArray(v[0]) && v[0].length >= 1 && v[0].length <= MAT_MAX && v.every((r) => Array.isArray(r) && r.length === v[0].length && r.every(isNum)); }
const CHECK = Object.freeze({
  text: (v) => typeof v === 'string', str: (v) => typeof v === 'string', num: isNum, bool: (v) => typeof v === 'boolean',
  nums: (v) => Array.isArray(v) && v.every(isNum), strs: (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
  kv: isKv, tpl: isTpl, mat: isMat,
});
function nz(b) { return b <= SAFE && b >= -SAFE ? Number(b) : b; }
function fin(x) { return typeof x === 'number' && Number.isFinite(x) ? x + 0 : null; }
function big(v) { return typeof v === 'bigint' ? v : BigInt(v); }
function F(v) { return typeof v === 'bigint' ? Number(v) : v; }
function bitLen(b) { return (b < 0n ? -b : b).toString(16).length * 4; }
function capB(b) { return typeof b === 'bigint' && bitLen(b) > MAX_BITS ? null : nz(b); }
function clean(v) {
  if (typeof v === 'number') return fin(v);
  if (typeof v === 'bigint') return capB(v);
  if (Array.isArray(v)) { const out = v.map(clean); return out.includes(null) ? null : out; }
  return v === undefined ? null : v;
}
function ne(list) { return Array.isArray(list) && list.length ? list : null; }
function int(v) { return isInt(v) && F(v) >= -MAX_LIST * 1000 && F(v) <= MAX_LIST * 1000 ? Number(v) : null; }
function pick(list, k) { const i = int(k); if (!Array.isArray(list) || i === null || i === 0) return null; return list[i > 0 ? i - 1 : list.length + i] ?? null; }
function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

// ---- exact arithmetic (BigInt for integers, floats otherwise)
function bin(a, b, bigOp, fOp) { if (!isNum(a) || !isNum(b)) return null; return isInt(a) && isInt(b) ? capB(bigOp(big(a), big(b))) : fin(fOp(F(a), F(b))); }
function add(a, b) { return bin(a, b, (x, y) => x + y, (x, y) => x + y); }
function sub(a, b) { return bin(a, b, (x, y) => x - y, (x, y) => x - y); }
function mul(a, b) { return bin(a, b, (x, y) => x * y, (x, y) => x * y); }
function div(a, b) {
  if (!isNum(a) || !isNum(b) || F(b) === 0) return null;
  if (isInt(a) && isInt(b) && big(a) % big(b) === 0n) return nz(big(a) / big(b));
  return fin(F(a) / F(b));
}
function idiv(a, b) {
  if (!isInt(a) || !isInt(b) || F(b) === 0) return null;
  const x = big(a), y = big(b), q = x / y;
  return nz((x % y !== 0n) && ((x < 0n) !== (y < 0n)) ? q - 1n : q);
}
function mod(a, b) {
  if (!isNum(a) || !isNum(b) || F(b) === 0) return null;
  if (isInt(a) && isInt(b)) { const y = big(b) < 0n ? -big(b) : big(b), m = big(a) % y; return nz(m < 0n ? m + y : m); }
  const y = Math.abs(F(b)), m = F(a) % y;
  return fin(m < 0 ? m + y : m);
}
function neg(a) { return isNum(a) ? (typeof a === 'bigint' ? nz(-a) : fin(-a)) : null; }
function absN(a) { return isNum(a) ? (typeof a === 'bigint' ? nz(a < 0n ? -a : a) : fin(Math.abs(a))) : null; }
function pow(a, b) {
  if (!isNum(a) || !isNum(b)) return null;
  if (isInt(a) && isInt(b) && F(b) >= 0) {
    const x = big(a), e = big(b);
    if (x === 0n || x === 1n) return e === 0n ? 1 : Number(x);
    if (x === -1n) return e % 2n ? -1 : 1;
    if (e * BigInt(bitLen(x)) > BigInt(MAX_BITS)) return null;
    return nz(x ** e);
  }
  return fin(Math.pow(F(a), F(b)));
}
function isqrt(n) { if (n < 2n) return n; let x = 1n << BigInt((bitLen(n) >> 1) + 1); for (;;) { const y = (x + n / x) >> 1n; if (y >= x) return x; x = y; } }
function sqrtN(a) {
  if (!isNum(a) || F(a) < 0) return null;
  if (isInt(a)) { const r = isqrt(big(a)); if (r * r === big(a)) return nz(r); }
  return fin(Math.sqrt(F(a)));
}
function rootN(a, n) {
  const k = int(n);
  if (!isNum(a) || k === null || k < 1) return null;
  if (k === 1) return a;
  const x = F(a);
  if (x < 0 && k % 2 === 0) return null;
  const r = Math.sign(x) * Math.pow(Math.abs(x), 1 / k);
  if (isInt(a) && Number.isFinite(r)) { const t = Math.round(r); if (pow(t, k) !== null && big(pow(t, k)) === big(a)) return t; }
  return fin(r);
}
function sumOf(xs) { if (!CHECK.nums(xs)) return null; let s = 0; for (const x of xs) { s = add(s, x); if (s === null) return null; } return s; }
function prodOf(xs) { if (!CHECK.nums(xs)) return null; let s = 1; for (const x of xs) { s = mul(s, x); if (s === null) return null; } return s; }
function sortNums(xs) { return CHECK.nums(xs) ? xs.slice().sort(cmp) : null; }
function meanOf(xs) { return ne(xs) ? div(sumOf(xs), xs.length) : null; }
function varOf(xs, sample) {
  if (!ne(xs) || !CHECK.nums(xs) || xs.length - (sample ? 1 : 0) < 1) return null;
  const m = F(meanOf(xs));
  let s = 0; for (const x of xs) s += (F(x) - m) ** 2;
  return fin(s / (xs.length - (sample ? 1 : 0)));
}
function gcdB(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; }
function gcdN(a, b) { return isInt(a) && isInt(b) ? nz(gcdB(big(a), big(b))) : null; }
function lcmN(a, b) {
  if (!isInt(a) || !isInt(b)) return null;
  const x = big(a), y = big(b);
  if (x === 0n || y === 0n) return 0;
  const l = (x * y) / gcdB(x, y);
  return capB(l < 0n ? -l : l);
}
function factorial(n) { const k = int(n); if (k === null || k < 0 || k > 3000) return null; let r = 1n; for (let i = 2n; i <= BigInt(k); i++) r *= i; return nz(r); }
function fib(n) { const k = int(n); if (k === null || k < 0 || k > 10000) return null; let a = 0n, b = 1n; for (let i = 0; i < k; i++) [a, b] = [b, a + b]; return nz(a); }
function choose(n, k) {
  const N = int(n), K = int(k);
  if (N === null || K === null || N < 0 || K < 0 || K > N) return null;
  const r = Math.min(K, N - K); if (r > 5000) return null;
  let v = 1n; for (let i = 1; i <= r; i++) v = (v * BigInt(N - r + i)) / BigInt(i);
  return capB(v);
}
function perms(n, k) {
  const N = int(n), K = int(k);
  if (N === null || K === null || N < 0 || K < 0 || K > N || K > 5000) return null;
  let v = 1n; for (let i = 0; i < K; i++) v *= BigInt(N - i);
  return capB(v);
}
function modpow(b, e, m) { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; } return r; }
function isPrimeB(v) {
  if (!isInt(v)) return null;
  const n = big(v);
  if (n < 2n) return false;
  for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n]) { if (n === p) return true; if (n % p === 0n) return false; }
  if (n >= 3317044064679887385961981n) return null;
  let d = n - 1n, s = 0; while (!(d & 1n)) { d >>= 1n; s++; }
  for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n]) {
    let x = modpow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let comp = true;
    for (let i = 1; i < s; i++) { x = (x * x) % n; if (x === n - 1n) { comp = false; break; } }
    if (comp) return false;
  }
  return true;
}
function factorize(v) {
  if (!isInt(v) || F(v) < 2 || F(v) > 1e14) return null;
  let n = Number(v); const out = [];
  for (let d = 2; d * d <= n; d += d === 2 ? 1 : 2) while (n % d === 0) { out.push(d); n /= d; }
  if (n > 1) out.push(n);
  return out;
}
function divisorsOf(v) {
  if (isInt(v) && Number(v) === 1) return [1];
  const f = factorize(v); if (!f) return null;
  let ds = [1];
  for (const p of new Set(f)) {
    const e = f.filter((x) => x === p).length, next = [];
    for (const d of ds) { let m = d; for (let i = 0; i <= e; i++) { next.push(m); m *= p; } }
    ds = next;
  }
  return ds.sort((a, b) => a - b);
}
function sieve(n) { const k = int(n); if (k === null || k < 2 || k > 3000000) return null; const s = new Uint8Array(k + 1), out = []; for (let i = 2; i <= k; i++) { if (s[i]) continue; out.push(i); for (let j = i * i; j <= k; j += i) s[j] = 1; } return out; }
function nthPrime(n) { const k = int(n); if (k === null || k < 1 || k > 200000) return null; const lim = k < 6 ? 15 : Math.ceil(k * (Math.log(k) + Math.log(Math.log(k)))) + 10; return sieve(lim)[k - 1] ?? null; }
function nextPrime(v) { if (!isInt(v) || F(v) > 1e12) return null; let m = Math.max(2, Math.floor(F(v)) + 1); while (!isPrimeB(m)) m++; return m; }
function fraction(a, b) {
  if (!isInt(a) || !isInt(b) || F(b) === 0) return null;
  let x = big(a), y = big(b); const g = gcdB(x, y); x /= g; y /= g;
  if (y < 0n) { x = -x; y = -y; }
  return y === 1n ? String(x) : x + '/' + y;
}
function roundTo(v, places) {
  const k = int(places);
  if (!isNum(v) || k === null || k < -15 || k > 12) return null;
  if (isInt(v) && k >= 0) return v;
  const x = F(v), s = String(Math.abs(x));
  if (s.includes('e')) return k >= 0 ? fin(x) : fin(Math.sign(x) * Math.round(Math.abs(x) / 10 ** -k) * 10 ** -k);
  return fin(Math.sign(x) * Number(Math.round(Number(s + 'e' + k)) + 'e' + -k));
}

// ---- text: norm, words, numbers, quotes, keywords
function norm(q, level = 1) {
  if (![0, 1, 2, 3].includes(level)) return null;
  const l0 = typeof q === 'string' ? q.slice(0, MAX_TEXT).trim().toLowerCase() : '';
  if (level === 0) return l0;
  const l1 = l0.replace(/\s+/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '').replace(/ +/g, ' ').trim();
  if (level === 1) return l1;
  const l2 = splitW(l1).filter((w) => !STOP.has(w));
  return level === 2 ? l2.join(' ') : [...new Set(l2)].sort().join(' ');
}
function splitW(s) { return typeof s === 'string' && s ? s.split(' ').filter(Boolean) : []; }
function wordsOf(q) { return splitW(norm(q, 1)); }
function rawWords(q) { return typeof q === 'string' ? q.slice(0, MAX_TEXT).match(/[\p{L}\p{N}]+(?:['’]\p{L}+)*/gu) || [] : []; }
function hasPhrase(l1, w) { const p = norm(typeof w === 'string' ? w : '', 1); return !!p && (' ' + l1 + ' ').includes(' ' + p + ' '); }
const NUM_RE = /(?<![\p{L}\p{N}_.])-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/gu;
function parseNum(s) {
  const t = String(s).replace(/,/g, '');
  if (!/^-?\d+(?:\.\d+)?$/.test(t)) return null;
  if (t.includes('.')) return fin(Number(t));
  const digits = t.replace('-', '').length;
  return digits > 400 ? null : digits > 15 ? nz(BigInt(t)) : Number(t) + 0;
}
function numbersIn(q) { return typeof q === 'string' ? [...q.slice(0, MAX_TEXT).matchAll(NUM_RE)].map((m) => parseNum(m[0])).filter((v) => v !== null) : []; }
const QUOTE_RE = /"([^"\n]+)"|“([^”\n]+)”|‘([^’\n]+)’|(?<![\p{L}\p{N}])'([^'\n]+)'(?![\p{L}\p{N}])/gu;
function quotedIn(q) { return typeof q === 'string' ? [...q.slice(0, MAX_TEXT).matchAll(QUOTE_RE)].map((m) => (m[1] ?? m[2] ?? m[3] ?? m[4]).trim()).filter(Boolean) : []; }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, (m) => '\\' + m); }
function kwRe(k) { const w = typeof k === 'string' ? k.trim() : ''; return w && w.length < 200 ? new RegExp('(?<![\\p{L}\\p{N}])' + esc(w) + '(?![\\p{L}\\p{N}])', 'iu') : null; }
function tidy(s) {
  const t = String(s).replace(/^[\s:,;\-]+/, '').replace(/[\s?.!,;:]+$/, '').trim();
  const u = t.replace(/^["“'‘]([\s\S]*)["”'’]$/, (m, x) => x).trim();
  return u || null;
}
function afterWord(q, k) { const re = kwRe(k); const m = re && typeof q === 'string' ? re.exec(q.slice(0, MAX_TEXT)) : null; return m ? tidy(q.slice(m.index + m[0].length, MAX_TEXT)) : null; }
function beforeWord(q, k) { const re = kwRe(k); const m = re && typeof q === 'string' ? re.exec(q.slice(0, MAX_TEXT)) : null; return m ? tidy(q.slice(0, m.index)) : null; }
function listAfter(q) {
  const i = typeof q === 'string' ? q.indexOf(':') : -1;
  if (i < 0) return null;
  return ne(q.slice(i + 1, MAX_TEXT).split(/,|;|\n|\band\b|\bor\b/).map(tidy).filter((x) => x !== null));
}
function subjectOf(q) {
  if (typeof q !== 'string') return null;
  const quoted = quotedIn(q)[0]; if (quoted) return quoted;
  const i = q.indexOf(':'); if (i >= 0) { const t = tidy(q.slice(i + 1, MAX_TEXT)); if (t) return t; }
  return rawWords(q).at(-1) ?? null;
}
function pairsIn(q) {
  if (typeof q !== 'string') return null;
  const out = {};
  for (const m of q.slice(0, MAX_TEXT).matchAll(/([\p{L}_][\p{L}\p{N}_-]*)\s*=\s*("[^"]*"|[^,;\s]+)/gu)) {
    const raw = m[2].replace(/^"|"$/g, ''), n = parseNum(raw);
    out[m[1].toLowerCase()] = n === null ? raw : n;
  }
  return Object.keys(out).length ? out : null;
}
function title(s) { return s.toLowerCase().replace(/(^|[\s\-(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()); }
function letters(s) { return [...s].filter((c) => /[\p{L}\p{N}]/u.test(c)).map((c) => c.toLowerCase()); }
function countSub(s, t) { if (typeof s !== 'string' || typeof t !== 'string' || !t) return null; const a = s.toLowerCase(), b = t.toLowerCase(); let n = 0, i = a.indexOf(b); while (i >= 0) { n++; i = a.indexOf(b, i + b.length); } return n; }
function sentence(s) { const t = s.trim(); if (!t) return null; const u = t[0].toUpperCase() + t.slice(1); return /[.!?]$/.test(u) ? u : u + '.'; }

// ---- units (length, mass, temperature, time)
const UNIT_SPEC = 'mm mm millimeter millimeters millimetre millimetres|cm cm centimeter centimeters centimetre centimetres|' +
  'm m meter meters metre metres|km km kms kilometer kilometers kilometre kilometres|in in inch inches|ft ft foot feet|' +
  'yd yd yard yards|mi mi mile miles|mg mg milligram milligrams|g g gram grams|kg kg kgs kilogram kilograms kilo kilos|' +
  'oz oz ounce ounces|lb lb lbs pound pounds|t t tonne tonnes|ms ms millisecond milliseconds|s s sec secs second seconds|' +
  'min min mins minute minutes|h h hr hrs hour hours|day day days|week week weeks wk wks|year year years yr yrs|' +
  'c c °c celsius centigrade|f f °f fahrenheit|k k kelvin kelvins';
const UNIT_BASE = Object.freeze({
  mm: ['length', 0.001], cm: ['length', 0.01], m: ['length', 1], km: ['length', 1000], in: ['length', 0.0254], ft: ['length', 0.3048],
  yd: ['length', 0.9144], mi: ['length', 1609.344], mg: ['mass', 0.001], g: ['mass', 1], kg: ['mass', 1000], oz: ['mass', 28.349523125],
  lb: ['mass', 453.59237], t: ['mass', 1e6], ms: ['time', 0.001], s: ['time', 1], min: ['time', 60], h: ['time', 3600], day: ['time', 86400],
  week: ['time', 604800], year: ['time', 31536000], c: ['temperature', 0], f: ['temperature', 0], k: ['temperature', 0],
});
const UNIT_ALIAS = unitAliases();
const UNIT_AMBIG = new Set(['m', 'in', 's', 'h', 't', 'c', 'f', 'k', 'g', 'min']);
const UNIT_PREP = new Set(['to', 'into', 'in', 'as']);
function unitAliases() { const out = new Map(); for (const g of UNIT_SPEC.split('|')) { const [canon, ...names] = g.split(' '); for (const n of names) out.set(n, canon); } return out; }
function unitOf(s) { return typeof s === 'string' ? UNIT_ALIAS.get(s.trim().toLowerCase()) ?? null : null; }
function tokens(q) { return typeof q === 'string' ? q.slice(0, MAX_TEXT).toLowerCase().match(/°?[a-z]+|\d[\d,]*(?:\.\d+)?/g) || [] : []; }
function unitsIn(q) {
  const tk = tokens(q), out = [], firstNum = tk.findIndex((w) => /^\d/.test(w));
  tk.forEach((w, i) => {
    const u = UNIT_ALIAS.get(w); if (!u) return;
    const prev = tk[i - 1] ?? '', afterNum = /^\d/.test(prev), afterPrep = UNIT_PREP.has(prev);
    if (UNIT_AMBIG.has(w) && !afterNum && !afterPrep) return;
    out.push({ u, afterPrep, afterFirst: firstNum >= 0 && i > firstNum });
  });
  return out;
}
function unitFrom(q) { const us = unitsIn(q); return (us.find((x) => x.afterFirst && !x.afterPrep) ?? us[0])?.u ?? null; }
function unitTo(q) { const us = unitsIn(q), from = unitFrom(q); return (us.find((x) => x.afterPrep && x.u !== from) ?? us.find((x) => x.u !== from))?.u ?? null; }
function unitCount(q) {
  const tk = tokens(q);
  for (let i = 0; i + 1 < tk.length; i++) if (/^\d/.test(tk[i]) && /^°?[a-z]/.test(tk[i + 1])) { const n = parseNum(tk[i]); if (n !== null) return { n, unit: UNIT_ALIAS.get(tk[i + 1]) ?? tk[i + 1] }; }
  return null;
}
function convert(v, a, b) {
  const x = isNum(v) ? F(v) : null, ua = unitOf(a), ub = unitOf(b);
  if (x === null || !ua || !ub) return null;
  const A = UNIT_BASE[ua], B = UNIT_BASE[ub];
  if (A[0] !== B[0]) return null;
  let r;
  if (A[0] === 'temperature') { const c = ua === 'c' ? x : ua === 'f' ? (x - 32) * 5 / 9 : x - 273.15; r = ub === 'c' ? c : ub === 'f' ? c * 9 / 5 + 32 : c + 273.15; }
  else r = x * A[1] / B[1];
  return Number.isFinite(r) ? fin(Number(r.toPrecision(12))) : null;
}

// ---- dates (pure arithmetic on the proleptic Gregorian calendar, years 1 to 9999)
const MONTH_RE = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const DATE_RES = [
  [/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g, (m) => ({ y: +m[1], m: +m[2], d: +m[3] })],
  [/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, (m) => ({ y: +m[3], m: +m[1], d: +m[2] })],
  [new RegExp('\\b' + MONTH_RE + '\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b', 'g'), (m) => ({ y: +m[3], m: monthOf(m[1]), d: +m[2] })],
  [new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?' + MONTH_RE + '\\.?,?\\s+(\\d{4})\\b', 'g'), (m) => ({ y: +m[3], m: monthOf(m[2]), d: +m[1] })],
];
function monthOf(w) { return MONTHS.findIndex((n) => n.startsWith(String(w).slice(0, 3))) + 1; }
function leap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
function monthLen(y, m) { return m === 2 ? (leap(y) ? 29 : 28) : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; }
function okDate(d) { return isKv(d) && [d.y, d.m, d.d].every(Number.isInteger) && d.y >= 1 && d.y <= 9999 && d.m >= 1 && d.m <= 12 && d.d >= 1 && d.d <= monthLen(d.y, d.m); }
function datesIn(q) {
  if (typeof q !== 'string') return [];
  const s = q.slice(0, MAX_TEXT).toLowerCase(), hits = [];
  for (const [re, mk] of DATE_RES) for (const m of s.matchAll(re)) { const d = mk(m); if (okDate(d)) hits.push([m.index, d]); }
  return hits.sort((a, b) => a[0] - b[0]).map((h) => h[1]);
}
function dayNum(d) {
  if (!okDate(d)) return null;
  const y = d.y - (d.m <= 2 ? 1 : 0), era = Math.floor(y / 400), yoe = y - era * 400;
  const doy = Math.floor((153 * (d.m + (d.m > 2 ? -3 : 9)) + 2) / 5) + d.d - 1;
  return era * 146097 + yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy - 719468;
}
function fromDayNum(z0) {
  const z = z0 + 719468, era = Math.floor(z / 146097), doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100)), mp = Math.floor((5 * doy + 2) / 153);
  const m = mp + (mp < 10 ? 3 : -9), out = { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d: doy - Math.floor((153 * mp + 2) / 5) + 1 };
  return okDate(out) ? out : null;
}
function weekday(d) { const z = dayNum(d); return z === null ? null : DAYS[(((z % 7) + 7) + 4) % 7]; }
function dateText(d) { return okDate(d) ? MONTHS[d.m - 1][0].toUpperCase() + MONTHS[d.m - 1].slice(1) + ' ' + d.d + ', ' + d.y : null; }

// ---- roman numerals and bases
function toRoman(v) { const n = isInt(v) ? Number(v) : NaN; if (!(n >= 1 && n <= 3999)) return null; let r = '', x = n; for (const [k, s] of ROMAN) while (x >= k) { r += s; x -= k; } return r; }
function fromRoman(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim().toUpperCase();
  if (!/^[MDCLXVI]{1,15}$/.test(t)) return null;
  let n = 0, i = 0;
  for (const [k, r] of ROMAN) while (t.startsWith(r, i)) { n += k; i += r.length; }
  return i === t.length && toRoman(n) === t ? n : null;
}
function romanIn(q) {
  const ws = rawWords(q).filter((w) => fromRoman(w) !== null);
  return ws.find((w) => w === w.toUpperCase() && w.length > 1) ?? ws.find((w) => w === w.toUpperCase()) ?? ws.find((w) => w.length > 1) ?? ws[0] ?? null;
}
function basesIn(q) {
  const out = [];
  for (const m of norm(q, 1).matchAll(/\b(binary|octal|decimal|hexadecimal|hex|base\s*(\d{1,2}))\b/g)) {
    const b = m[2] ? Number(m[2]) : { binary: 2, octal: 8, decimal: 10, hexadecimal: 16, hex: 16 }[m[1]];
    if (b >= 2 && b <= 36) out.push(b);
  }
  return ne(out);
}
function toBase(v, b) { const B = int(b); if (!isInt(v) || B === null || B < 2 || B > 36 || bitLen(big(v)) > MAX_BITS) return null; return big(v).toString(B); }
function fromBase(s, b) {
  const B = int(b);
  if (typeof s !== 'string' || B === null || B < 2 || B > 36) return null;
  let t = s.trim().toLowerCase().replace(/[\s_]/g, ''), sign = 1n;
  if (t.startsWith('-')) { sign = -1n; t = t.slice(1); }
  const pre = { 16: '0x', 2: '0b', 8: '0o' }[B];
  if (pre && t.startsWith(pre)) t = t.slice(2);
  if (!t || t.length > 4000) return null;
  let n = 0n;
  for (const c of t) { const d = parseInt(c, 36); if (!(d < B)) return null; n = n * BigInt(B) + BigInt(d); }
  return nz(sign * n);
}

// ---- display
function fmtNum(v) {
  if (typeof v === 'bigint') return v.toString();
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  if (Number.isInteger(v)) return BigInt(v).toString();
  const r = Math.sign(v) * Math.round(Math.abs(v) * 10) / 10;
  return Number.isInteger(r) ? BigInt(r).toString() : r.toFixed(1);
}
function fmtFixed(v, places) {
  const k = int(places);
  if (k === null || k < 0 || k > 12) return null;
  if (typeof v === 'bigint') return v.toString() + (k ? '.' + '0'.repeat(k) : '');
  const r = roundTo(v, k);
  if (r === null) return null;
  return Math.abs(r) >= 1e21 ? BigInt(Math.round(r)).toString() + (k ? '.' + '0'.repeat(k) : '') : (r + 0).toFixed(k);
}
function ordinal(v) {
  if (!isInt(v)) return null;
  const s = big(v).toString(), a = big(v) < 0n ? -big(v) : big(v), t = a % 100n, u = a % 10n;
  return s + (t >= 11n && t <= 13n ? 'th' : u === 1n ? 'st' : u === 2n ? 'nd' : u === 3n ? 'rd' : 'th');
}
function show(v) {
  if (typeof v === 'string') return v;
  if (isNum(v)) return fmtNum(v);
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (Array.isArray(v) && v.every((x) => typeof x === 'string' || isNum(x))) return v.map(show).join(', ');
  if (okDate(v)) return dateText(v);
  return null;
}
function fillTpl(t, vals) {
  if (!isTpl(t) || !Array.isArray(vals)) return null;
  let s = '';
  for (const p of t) { const v = typeof p === 'string' ? p : show(vals[p.slot]); if (v === null) return null; s += v; }
  return s;
}
function mapTpl(t, list) {
  if (!isTpl(t) || !Array.isArray(list) || list.length > MAX_LIST) return null;
  const out = [];
  for (let i = 0; i < list.length; i++) { const s = fillTpl(t, [list[i], i + 1, list.length]); if (s === null) return null; out.push(s); }
  return out;
}
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (typeof v === 'bigint') return JSON.stringify(v.toString());
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  const j = JSON.stringify(v);
  return j === undefined ? 'null' : j;
}
function jsonText(v) { return JSON.stringify(v, (k, x) => (typeof x === 'bigint' ? x.toString() : typeof x === 'number' && !Number.isFinite(x) ? null : x)); }

// ---- memory (mem.table: key -> answer; the normalized index is cached per table object)
const TABLE_CACHE = new WeakMap();
function tableIndex(t) {
  let ix = TABLE_CACHE.get(t);
  if (ix) return ix;
  ix = { keys: new Map(), sets: [] };
  for (const [k, v] of Object.entries(t)) {
    for (const lv of [1, 2, 3]) { const n = norm(k, lv); if (n && !ix.keys.has(lv + ':' + n)) ix.keys.set(lv + ':' + n, v); }
    ix.sets.push([new Set(splitW(norm(k, 2))), v]);
  }
  TABLE_CACHE.set(t, ix);
  return ix;
}
function lookup(mem, key) {
  const t = mem && mem.table;
  if (!isKv(t) || typeof key !== 'string') return null;
  const ix = tableIndex(t);
  for (const lv of [1, 2, 3]) { const n = norm(key, lv); if (n && ix.keys.has(lv + ':' + n)) return ix.keys.get(lv + ':' + n); }
  return null;
}
function nearest(mem, key) {
  const t = mem && mem.table;
  if (!isKv(t) || typeof key !== 'string') return null;
  const a = new Set(splitW(norm(key, 2)));
  if (!a.size) return null;
  let best = null, score = 0;
  for (const [b, v] of tableIndex(t).sets) {
    let inter = 0; for (const w of a) if (b.has(w)) inter++;
    const j = inter / (a.size + b.size - inter);
    if (j > score) { score = j; best = v; }
  }
  return score >= NEAR ? best : null;
}
function asStr(v) { return typeof v === 'string' ? v : isNum(v) ? fmtNum(v) : null; }
function asNum(v) { return isNum(v) ? v : typeof v === 'string' ? parseNum(v.trim()) : null; }
function memField(mem, field, key) { const t = mem && mem[field]; return isKv(t) && typeof key === 'string' && Object.hasOwn(t, key) ? t[key] : null; }

// ---- knowledge (contract c5): packs of rows the absorber pulled, loaded by knowLoad, read by the know family. A pack
// is DATA: { id, columns: [names], rows: [[cells]] } or the column form { id, columns, cols } (each column a list of
// cells, or { s: cells joined by sep, sep, num? } or { d: distinct cells joined by sep, i: indices in base 36 joined by
// commas, sep, num? } or { d, r: runs "index*count" in base 36 joined by commas, sep, num? } or { f: cells front coded
// and joined by sep, sep, num? }). A cell is a string or a finite number. Keys match after knowNorm; a key with two
// values is no answer.
const KNOW = new Map();
const KNOW_ID = /^[a-z0-9-]+$/;
const KNOW_MAX_ROWS = 200000;
const KNOW_MAX_GRAM = 8;
/** The match form of a key: no accents, lower case, every run of what is not a letter or a digit one space, no leading "the". */
function knowNorm(s) {
  if (typeof s !== 'string' && !(typeof s === 'number' && Number.isFinite(s))) return '';
  const t = knowWords(String(s));
  return t.startsWith('the ') ? t.slice(4) : t === 'the' ? '' : t;
}
function knowWords(s) { return s.slice(0, 2000).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
/** A number as plain digits (no exponent, no separator; a float to 15 significant digits), or null. */
function plainNum(v) {
  if (typeof v === 'bigint') return v.toString();
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  if (Number.isInteger(v)) return Math.abs(v) < 1e21 ? String(v + 0) : BigInt(v).toString();
  const s = String(Number(v.toPrecision(15)) + 0);
  return /e/i.test(s) ? null : s;
}
function knowCell(v) { return typeof v === 'string' ? (v.trim() ? v : null) : typeof v === 'number' && Number.isFinite(v) ? plainNum(v) : null; }
function knowColumn(c, n) {
  if (Array.isArray(c)) return c.length === n ? c : null;
  if (!isKv(c) || typeof c.sep !== 'string' || c.sep.length !== 1) return null;
  const conv = c.num === true ? (x) => (x === '' ? '' : Number(x)) : (x) => x;
  if (typeof c.s === 'string') { const xs = n ? c.s.split(c.sep) : []; return xs.length === n ? xs.map(conv) : null; }
  if (typeof c.d === 'string' && typeof c.i === 'string') {
    const d = c.d.split(c.sep).map(conv), ix = n ? c.i.split(',') : [];
    if (ix.length !== n) return null;
    const out = new Array(n);
    for (let k = 0; k < n; k++) { const j = parseInt(ix[k], 36); if (!(j >= 0 && j < d.length)) return null; out[k] = d[j]; }
    return out;
  }
  if (typeof c.d === 'string' && typeof c.r === 'string') { // runs of the dictionary: "index*count" in base 36, by commas
    const d = c.d.split(c.sep).map(conv), out = [];
    for (const run of n ? c.r.split(',') : []) {
      const m = /^([0-9a-z]+)\*([0-9a-z]+)$/.exec(run), j = m ? parseInt(m[1], 36) : -1, len = m ? parseInt(m[2], 36) : 0;
      if (!(j >= 0 && j < d.length) || !(len >= 1) || out.length + len > n) return null;
      for (let k = 0; k < len; k++) out.push(d[j]);
    }
    return out.length === n ? out : null;
  }
  if (typeof c.f === 'string') { // front coded: each item the count (one base 36 digit) of first code units it shares with the item before, then the rest
    const xs = n ? c.f.split(c.sep) : [];
    if (xs.length !== n) return null;
    const out = new Array(n);
    let prev = '';
    for (let k = 0; k < n; k++) {
      const m = /^[0-9a-z]/.test(xs[k]) ? parseInt(xs[k][0], 36) : -1;
      if (!(m >= 0 && m <= prev.length)) return null;
      prev = prev.slice(0, m) + xs[k].slice(1);
      out[k] = conv(prev);
    }
    return out;
  }
  return null;
}
function knowRows(p) {
  const cols = p.columns;
  if (Array.isArray(p.rows)) return p.rows.slice(0, KNOW_MAX_ROWS).map((r) => (Array.isArray(r) ? cols.map((_, j) => r[j]) : null));
  if (!Array.isArray(p.cols) || p.cols.length !== cols.length || !Number.isInteger(p.n) || p.n < 0 || p.n > KNOW_MAX_ROWS) return null;
  const data = p.cols.map((c) => knowColumn(c, p.n));
  if (data.some((c) => c === null)) return null;
  return Array.from({ length: p.n }, (_, i) => data.map((c) => c[i]));
}
/**
 * Load knowledge packs: the registry becomes exactly the valid packs given (a later pack of one id wins); the count.
 * A row that is not a list, a cell that is neither a string nor a finite number, becomes empty text.
 */
function knowLoad(packs) {
  KNOW.clear();
  for (const p of Array.isArray(packs) ? packs : []) {
    if (!isKv(p) || typeof p.id !== 'string' || !KNOW_ID.test(p.id) || !Array.isArray(p.columns) || !p.columns.length) continue;
    if (!p.columns.every((c) => typeof c === 'string' && c.trim()) || new Set(p.columns).size !== p.columns.length) continue;
    let rows = null;
    try { rows = knowRows(p); } catch { rows = null; }
    if (!rows) continue;
    const clean = rows.filter(Boolean).map((r) => r.map((v) => (typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v)) ? v : '')));
    KNOW.set(p.id, { id: p.id, cols: p.columns.slice(), col: new Map(p.columns.map((c, j) => [c, j])), rows: clean, keys: new Map(), grams: new Map(), series: new Map(), tables: new Map() });
  }
  return KNOW.size;
}
function knowCol(p, name) { return typeof name === 'string' && p.col.has(name) ? p.col.get(name) : -1; }
function knowKeys(p, j) {
  let m = p.keys.get(j);
  if (m) return m;
  m = new Map();
  p.rows.forEach((r, i) => { const k = knowNorm(r[j]); if (!k) return; const a = m.get(k); if (a) a.push(i); else m.set(k, [i]); });
  p.keys.set(j, m);
  return m;
}
/** The one value of column vc for the key in column kc of a pack, or null (no pack, no column, no key, two values). */
function knowGet(id, kc, key, vc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p || typeof key !== 'string') return null;
  const ki = knowCol(p, kc), vi = knowCol(p, vc);
  if (ki < 0 || vi < 0) return null;
  const at = knowKeys(p, ki).get(knowNorm(key));
  if (!at) return null;
  let out = null, on = null;
  for (const i of at) {
    const v = knowCell(p.rows[i][vi]);
    if (v === null) continue;
    const n = knowNorm(v) || v;
    if (on !== null && n !== on) return null;
    if (on === null) { out = v; on = n; }
  }
  return out;
}
/** The row of a key as { column: cell } (numbers as numbers), or null (no key, or two rows that differ). */
function knowRow(id, kc, key) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p || typeof key !== 'string') return null;
  const ki = knowCol(p, kc);
  const at = ki < 0 ? null : knowKeys(p, ki).get(knowNorm(key));
  if (!at) return null;
  const sig = (r) => r.map((v) => knowNorm(v)).join('\u0000');
  if (at.some((i) => sig(p.rows[i]) !== sig(p.rows[at[0]]))) return null;
  const out = Object.create(null);
  p.cols.forEach((c, j) => { const v = p.rows[at[0]][j]; if (v !== '') out[c] = v; });
  return out;
}
function knowGrams(p, j) {
  let g = p.grams.get(j);
  if (g) return g;
  g = { canon: new Map(), max: 1 };
  for (const r of p.rows) {
    const t = knowCell(r[j]), k = t === null ? '' : knowNorm(t);
    if (!k || g.canon.has(k)) continue;
    g.canon.set(k, t);
    g.max = Math.min(KNOW_MAX_GRAM, Math.max(g.max, k.split(' ').length));
  }
  p.grams.set(j, g);
  return g;
}
/** A key that begins with a mark: neither a letter, a digit nor a space. */
const MARKED = /^[^\p{L}\p{N}\s]/u;
function boundedIn(hay, needle) {
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) {
    const a = i === 0 || !/[\p{L}\p{N}]/u.test(hay[i - 1]), b = i + needle.length >= hay.length || !/[\p{L}\p{N}]/u.test(hay[i + needle.length]);
    if (a && b) return true;
  }
  return false;
}
/**
 * The keys of a pack column the prompt names, in prompt order, each as the pack writes it: the longest match at each
 * place, never overlapping. When one of them is written in the prompt exactly as in the pack, only those exact ones
 * are kept; one made only of stop words goes when another is found. A key written with a leading mark (".no") is
 * named only where the prompt writes it with the mark (any case).
 */
function knowFind(q, id, kc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p || typeof q !== 'string') return null;
  const j = knowCol(p, kc);
  if (j < 0) return null;
  const g = knowGrams(p, j), ws = splitW(knowWords(q)), found = [], src = q.slice(0, 2000), low = src.toLowerCase();
  for (let i = 0; i < ws.length && found.length < 50;) {
    let hit = 0;
    for (let n = Math.min(g.max + 1, ws.length - i); n >= 1 && !hit; n--) {
      let k = ws.slice(i, i + n).join(' ');
      if (k.startsWith('the ')) k = k.slice(4);
      if (!k || !g.canon.has(k)) continue;
      const t = g.canon.get(k);
      // a key the pack writes with a leading mark (".no", "#tag") is named only where the prompt writes the mark too
      if (MARKED.test(t) && !boundedIn(low, t.toLowerCase())) continue;
      if (!found.includes(t)) found.push(t);
      hit = n;
    }
    i += hit || 1;
  }
  const exact = found.filter((t) => boundedIn(src, t));
  const kept = exact.length ? exact : found;
  const content = kept.filter((t) => splitW(norm(t, 1)).some((w) => !STOP.has(w)));
  return content.length ? content : kept;
}
/** The keys among keys whose column vc holds value (knowNorm equal), in the given order. */
function knowWhere(keys, id, kc, vc, value) {
  const want = knowNorm(value);
  if (!want || !Array.isArray(keys)) return null;
  return keys.filter((k) => { const v = knowGet(id, kc, k, vc); return v !== null && knowNorm(v) === want; });
}

// ---- series and long tables (the series and table families). A SERIES is a pack's value column read in the order of
// its key column: the keys order when every one is a date written YYYY, YYYY-MM or YYYY-MM-DD, or else every one is a
// number; a row whose value is no number is left out, and so is a key with two different values. A LONG TABLE holds one
// row per entity and time: a value is read by the pair (a pair with two different values is no answer), an entity's
// values in the order of its times, a time's values in the order of the entities' match forms. Both are built once per
// pack and columns while the pack is loaded, and neither depends on the order of the pack's rows.
// A date key: a year, a month or a day, and a day may carry a UTC time to the second ("2026-10-02T12:34:56Z").
const DATE_KEY = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?Z?)?)?)?$/;
const dateOrder = (m) => [m[2], m[3], m[4], m[5], m[6]].reduce((s, x) => s * 100 + Number(x || 0), Number(m[1])) + (m[7] ? Number('0.' + m[7]) : 0);
/** The place in order of each key (all dates, else all numbers), or null when the keys do not order. */
function orderOf(keys) {
  const ts = keys.map((k) => String(k).trim());
  if (!ts.length) return null;
  if (ts.every((t) => DATE_KEY.test(t))) return ts.map((t) => dateOrder(DATE_KEY.exec(t)));
  const ns = ts.map((t) => parseNum(t));
  return ns.every((x) => x !== null) ? ns.map(F) : null;
}
/** A cell as a number: a finite number, or text that is one (thousands commas allowed), else null. */
/** A float to 12 significant digits (the noise of float arithmetic on pack values goes); any other value as it is. */
function fx(v) { return typeof v === 'number' && Number.isFinite(v) && !Number.isInteger(v) ? Number(v.toPrecision(12)) + 0 : v; }
function cellNum(v) { return typeof v === 'number' ? fin(v) : typeof v === 'string' ? parseNum(v.trim()) : null; }
function seriesOf(id, kc, vc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p) return null;
  const ki = knowCol(p, kc), vi = knowCol(p, vc);
  if (ki < 0 || vi < 0 || ki === vi) return null;
  const tag = ki + ',' + vi;
  if (p.series.has(tag)) return p.series.get(tag);
  const by = new Map();
  for (const r of p.rows) {
    const k = knowCell(r[ki]), n = k === null ? '' : knowNorm(k), v = cellNum(r[vi]);
    if (!n || v === null) continue;
    const e = by.get(n);
    if (!e) by.set(n, { n, k, v, bad: false });
    else { if (cmp(e.v, v) !== 0) e.bad = true; if (k < e.k) e.k = k; }
  }
  const list = [...by.values()].filter((e) => !e.bad), os = orderOf(list.map((e) => e.k));
  let s = null;
  if (os) {
    // keys written two ways for one place in order (2020-2 and 2020-02) are one item when they agree, none when not
    const all = list.map((e, i) => ({ n: e.n, k: e.k, v: e.v, o: os[i] })).sort((a, b) => a.o - b.o || cmp(a.k, b.k));
    const items = [], at = new Map();
    for (let i = 0; i < all.length;) {
      let j = i;
      while (j < all.length && all[j].o === all[i].o) j++;
      const g = all.slice(i, j);
      if (g.every((x) => cmp(x.v, g[0].v) === 0)) { for (const x of g) at.set(x.n, items.length); items.push(g[0]); }
      i = j;
    }
    s = { items, at };
  }
  p.series.set(tag, s);
  return s;
}
function serIdx(s, key) { if (!s || typeof key !== 'string') return -1; const i = s.at.get(knowNorm(key)); return i === undefined ? -1 : i; }
/** The item a step from the key (0 the key's own), or null. */
function serItem(s, key, step) { const i = serIdx(s, key); return i < 0 ? null : s.items[i + step] ?? null; }
/** The items from one key to the other, both included, in order (either may come first). */
function serSpan(s, k1, k2) { const i = serIdx(s, k1), j = serIdx(s, k2); return i < 0 || j < 0 ? null : s.items.slice(Math.min(i, j), Math.max(i, j) + 1); }
function serPair(s, k1, k2) { const i = serIdx(s, k1), j = serIdx(s, k2); return i < 0 || j < 0 ? null : [s.items[i].v, s.items[j].v]; }
/** The key of the one largest (dir 1) or smallest (dir -1) value of items; null for none or a tie. */
function argExt(items, dir) {
  if (!ne(items)) return null;
  let best = items[0], tie = false;
  for (const x of items.slice(1)) { const c = cmp(x.v, best.v) * dir; if (c > 0) { best = x; tie = false; } else if (c === 0) tie = true; }
  return tie ? null : best;
}
function tableOf(id, ec, tc, vc) {
  const p = typeof id === 'string' ? KNOW.get(id) : null;
  if (!p) return null;
  const ei = knowCol(p, ec), ti = knowCol(p, tc), vi = knowCol(p, vc);
  if (ei < 0 || ti < 0 || vi < 0 || ei === ti || ei === vi || ti === vi) return null;
  const tag = ei + ',' + ti + ',' + vi;
  if (p.tables.has(tag)) return p.tables.get(tag);
  const pairs = new Map(), ents = new Map(), times = new Map();
  for (const r of p.rows) {
    const e = knowCell(r[ei]), t = knowCell(r[ti]), v = knowCell(r[vi]);
    const en = e === null ? '' : knowNorm(e), tn = t === null ? '' : knowNorm(t);
    if (!en || !tn || v === null) continue;
    if (!ents.has(en) || e < ents.get(en)) ents.set(en, e);
    if (!times.has(tn) || t < times.get(tn)) times.set(tn, t);
    const k = en + '\u0000' + tn, x = pairs.get(k), vn = knowNorm(v) || v;
    if (!x) pairs.set(k, { en, tn, v, vn, x: cellNum(r[vi]), bad: false });
    else if (x.vn !== vn) x.bad = true;
    else if (v < x.v) x.v = v;
  }
  const tl = [...times.keys()], os = orderOf(tl.map((tn) => times.get(tn)));
  const ord = os ? new Map(tl.map((tn, i) => [tn, os[i]])) : null;
  const byE = new Map(), byT = new Map();
  for (const x of pairs.values()) {
    if (x.bad) continue;
    const item = { en: x.en, tn: x.tn, e: ents.get(x.en), t: times.get(x.tn), v: x.v, x: x.x };
    (byE.get(x.en) || byE.set(x.en, []).get(x.en)).push(item);
    (byT.get(x.tn) || byT.set(x.tn, []).get(x.tn)).push(item);
  }
  if (ord) for (const l of byE.values()) l.sort((a, b) => ord.get(a.tn) - ord.get(b.tn) || cmp(a.tn, b.tn));
  for (const l of byT.values()) l.sort((a, b) => cmp(a.en, b.en));
  const t = { pairs, byE, byT, ord };
  p.tables.set(tag, t);
  return t;
}
function tabPair(t, e, time) {
  if (!t || typeof e !== 'string' || typeof time !== 'string') return null;
  const x = t.pairs.get(knowNorm(e) + '\u0000' + knowNorm(time));
  return x && !x.bad ? x : null;
}
/** An entity's items with a number, in time order (null when the times do not order). */
function tabNums(t, e) { if (!t || !t.ord || typeof e !== 'string') return null; const l = t.byE.get(knowNorm(e)); return l ? ne(l.filter((x) => x.x !== null)) : null; }
/** A time's items with a number, as { k: entity, v: number } in the order of the entities' match forms. */
function tabAt(t, time) { if (!t || typeof time !== 'string') return null; const l = t.byT.get(knowNorm(time)); return l ? ne(l.filter((x) => x.x !== null).map((x) => ({ k: x.e, v: x.x }))) : null; }

// ---- sha256 (pure; the cell id)
const SHA_P = sieve(311);
const SHA_H = SHA_P.slice(0, 8).map((p) => ((Math.sqrt(p) % 1) * 4294967296) | 0);
const SHA_K = SHA_P.slice(0, 64).map((p) => ((Math.cbrt(p) % 1) * 4294967296) | 0);
function ror(x, n) { return (x >>> n) | (x << (32 - n)); }
function sha256Hex(str) {
  const bytes = [];
  for (const ch of String(str)) {
    const c = ch.codePointAt(0);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  const bits = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const hi = Math.floor(bits / 4294967296), lo = bits >>> 0;
  bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255, (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
  const H = SHA_H.slice(), w = new Array(64);
  for (let o = 0; o < bytes.length; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = (bytes[o + 4 * i] << 24) | (bytes[o + 4 * i + 1] << 16) | (bytes[o + 4 * i + 2] << 8) | bytes[o + 4 * i + 3];
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2];
      w[i] = (w[i - 16] + (ror(a, 7) ^ ror(a, 18) ^ (a >>> 3)) + w[i - 7] + (ror(b, 17) ^ ror(b, 19) ^ (b >>> 10))) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + ((e & f) ^ (~e & g)) + SHA_K[i] + w[i]) | 0;
      const t2 = ((ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    [a, b, c, d, e, f, g, h].forEach((x, i) => { H[i] = (H[i] + x) | 0; });
  }
  return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

// ---- list and number helpers the primitives share
function rangeAB(a, b) {
  const x = int(a), y = int(b);
  if (x === null || y === null || Math.abs(y - x) >= MAX_LIST) return null;
  const st = y >= x ? 1 : -1, out = [];
  for (let i = x; i !== y + st; i += st) out.push(i);
  return out;
}
function sliceList(list, i, j) { const x = int(i), y = int(j); return Array.isArray(list) && x !== null && y !== null && x >= 1 && y >= x ? list.slice(x - 1, y) : null; }
function digitsOf(v) { return isInt(v) ? (big(v) < 0n ? -big(v) : big(v)).toString() : null; }
function modeOf(xs) {
  if (!ne(xs) || !CHECK.nums(xs)) return null;
  const n = new Map();
  for (const x of xs) n.set(String(x), (n.get(String(x)) || 0) + 1);
  let best = null, k = 0;
  for (const x of sortNums(xs)) { const c = n.get(String(x)); if (c > k) { k = c; best = x; } }
  return k > 1 || xs.length === 1 ? best : null;
}
function logN(x, b) {
  if (!isNum(x) || !isNum(b) || F(x) <= 0 || F(b) <= 0 || F(b) === 1) return null;
  const r = Math.log(F(x)) / Math.log(F(b)), k = Math.round(r);
  if (isInt(x) && isInt(b) && k >= 0 && k <= 4096) { const p = pow(b, k); if (p !== null && cmp(p, x) === 0) return k; }
  return fin(r);
}
function caseOf(table, key) { return isKv(table) && typeof key === 'string' ? lookup({ table }, key) : null; }

// ---- matrices (type mat): parsed from the prompt as [[1, 2], [3, 4]] or as rows split by ";" (1 2; 3 4), the entries
// exact (BigInt for integers) where the arithmetic is; a determinant of integers is exact (Bareiss), an inverse is taken
// in floats with each entry snapped to an integer within 1e-9 and otherwise to 12 significant digits; a singular one is null
const MAT_BRACKET = /\[\s*\[[^[\]]*\](?:\s*(?:,\s*)?\[[^[\]]*\])*\s*\]/g;
const MAT_ROWS = /-?\d+(?:\.\d+)?(?:(?:[ \t]*,[ \t]*|[ \t]+)-?\d+(?:\.\d+)?)*(?:[ \t]*;[ \t]*-?\d+(?:\.\d+)?(?:(?:[ \t]*,[ \t]*|[ \t]+)-?\d+(?:\.\d+)?)*)+/g;
function rowNums(s) { const ts = s.split(/[\s,]+/).filter(Boolean), xs = ts.map(parseNum); return xs.length && !xs.includes(null) ? xs : null; }
function matOfRows(rows) { const m = rows.map(rowNums); return m.every(Boolean) && isMat(m) ? m : null; }
/** The matrices a prompt writes, in prompt order (the first 4000 characters are read). */
function matricesIn(q) {
  if (typeof q !== 'string') return [];
  const src = q.slice(0, 4000), found = [];
  let rest = src;
  for (const m of src.matchAll(MAT_BRACKET)) {
    const mat = matOfRows([...m[0].matchAll(/\[([^[\]]*)\]/g)].map((x) => x[1]));
    if (mat) found.push([m.index, mat]);
    rest = rest.slice(0, m.index) + ' '.repeat(m[0].length) + rest.slice(m.index + m[0].length);
  }
  for (const m of rest.matchAll(MAT_ROWS)) { const mat = matOfRows(m[0].split(';')); if (mat) found.push([m.index, mat]); }
  return found.sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}
function M(v) { if (!isMat(v)) throw new TypeError('not a matrix'); return v; }
function matT(m) { return M(m)[0].map((_, j) => m.map((r) => r[j])); }
function matZip(a, b, op) { M(a); M(b); return a.length === b.length && a[0].length === b[0].length ? a.map((r, i) => r.map((x, j) => op(x, b[i][j]))) : null; }
function matMul(a, b) {
  M(a); M(b);
  if (a[0].length !== b.length) return null;
  return a.map((r) => b[0].map((_, j) => { let s = 0; for (let k = 0; k < b.length; k++) s = add(s, mul(r[k], b[k][j])); return s; }));
}
function isSquare(m) { return isMat(m) && m.length === m[0].length && m.length <= MAT_SOLVE; }
function matId(n) { const k = int(n); return k !== null && k >= 1 && k <= MAT_MAX ? Array.from({ length: k }, (_, i) => Array.from({ length: k }, (x, j) => (i === j ? 1 : 0))) : null; }
/** A float near an integer (1e-9 relative) is that integer; any other to 12 significant digits. */
function snap(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return null;
  const r = Math.round(x);
  return Math.abs(x - r) <= 1e-9 * Math.max(1, Math.abs(x)) ? r + 0 : Number(x.toPrecision(12)) + 0;
}
function detOf(m) {
  if (!isSquare(m)) return null;
  const n = m.length;
  if (m.every((r) => r.every(isInt))) { // Bareiss: every division is exact
    const a = m.map((r) => r.map(big));
    let sign = 1n, prev = 1n;
    for (let k = 0; k < n - 1; k++) {
      if (a[k][k] === 0n) {
        let s = k + 1;
        while (s < n && a[s][k] === 0n) s++;
        if (s === n) return 0;
        [a[k], a[s]] = [a[s], a[k]];
        sign = -sign;
      }
      for (let i = k + 1; i < n; i++) for (let j = k + 1; j < n; j++) a[i][j] = (a[i][j] * a[k][k] - a[i][k] * a[k][j]) / prev;
      prev = a[k][k];
    }
    return capB(sign * a[n - 1][n - 1]);
  }
  const a = m.map((r) => r.map(F));
  let d = 1;
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[p][k])) p = i;
    if (a[p][k] === 0) return 0;
    if (p !== k) { [a[k], a[p]] = [a[p], a[k]]; d = -d; }
    d *= a[k][k];
    for (let i = k + 1; i < n; i++) { const f = a[i][k] / a[k][k]; for (let j = k; j < n; j++) a[i][j] -= f * a[k][j]; }
  }
  return snap(d);
}
function invOf(m) {
  if (!isSquare(m)) return null;
  const d = detOf(m);
  if (d === null || F(d) === 0) return null;
  const n = m.length, a = m.map((r, i) => [...r.map(F), ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[p][k])) p = i;
    if (Math.abs(a[p][k]) < 1e-12) return null;
    [a[k], a[p]] = [a[p], a[k]];
    const pv = a[k][k];
    for (let j = 0; j < 2 * n; j++) a[k][j] /= pv;
    for (let i = 0; i < n; i++) if (i !== k && a[i][k] !== 0) { const f = a[i][k]; for (let j = 0; j < 2 * n; j++) a[i][j] -= f * a[k][j]; }
  }
  return a.map((r) => r.slice(n).map(snap));
}
function matPow(m, e) {
  const k = int(e);
  if (!isSquare(m) || k === null || k < 0 || k > 64) return null;
  let out = matId(m.length);
  for (let i = 0; i < k && out; i++) out = clean(matMul(out, m));
  return out;
}
/** An entry as text: an integer in full, any other number rounded to 6 decimal places. */
function matNum(v) { return typeof v === 'bigint' || Number.isInteger(v) ? plainNum(v) : plainNum(roundTo(v, 6)); }
function matText(m) { return '[' + M(m).map((r) => '[' + r.map(matNum).join(', ') + ']').join(', ') + ']'; }

// ---- text and code: identifier cases, substrings, codes, distances, base64, a path into JSON
/** The words of an identifier or a phrase: camelCase and PascalCase humps split, every run of what is not a letter or a digit a break. */
function idWords(s) { return s.slice(0, MAX_TEXT).replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2').replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((w) => w.toLowerCase()); }
function cap1(w) { return w ? w[0].toUpperCase() + w.slice(1) : w; }
function caseJoin(s, how) {
  const ws = idWords(s);
  if (!ws.length) return null;
  if (how === 'camel') return ws[0] + ws.slice(1).map(cap1).join('');
  if (how === 'pascal') return ws.map(cap1).join('');
  return ws.join(how === 'snake' ? '_' : '-');
}
function caesar(s, k) {
  const n = int(k);
  if (n === null) return null;
  const sh = ((n % 26) + 26) % 26;
  return s.replace(/[A-Za-z]/g, (ch) => { const b = ch <= 'Z' ? 65 : 97; return String.fromCharCode(((ch.charCodeAt(0) - b + sh) % 26) + b); });
}
function editDistance(a, b) {
  const x = [...a], y = [...b];
  if (x.length > 2000 || y.length > 2000) return null;
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[y.length];
}
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function utf8Of(s) {
  const out = [];
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0xd800 && c <= 0xdfff) return null;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}
/** UTF-8 bytes as text, or null when they are not well formed UTF-8. */
function utf8Text(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length;) {
    const b = bytes[i], n = b < 0x80 ? 0 : b >= 0xc2 && b < 0xe0 ? 1 : b >= 0xe0 && b < 0xf0 ? 2 : b >= 0xf0 && b < 0xf5 ? 3 : -1;
    if (n < 0 || i + n > bytes.length - 1) return null;
    let c = n ? b & (0x3f >> n) : b;
    for (let k = 1; k <= n; k++) { const x = bytes[i + k]; if ((x & 0xc0) !== 0x80) return null; c = (c << 6) | (x & 63); }
    if ((n === 2 && (c < 0x800 || (c >= 0xd800 && c <= 0xdfff))) || (n === 3 && (c < 0x10000 || c > 0x10ffff))) return null;
    s += String.fromCodePoint(c);
    i += n + 1;
  }
  return s;
}
function b64Encode(s) {
  const b = s.length <= MAX_TEXT ? utf8Of(s) : null;
  if (!b) return null;
  let out = '';
  for (let i = 0; i < b.length; i += 3) {
    const x = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
    out += B64[(x >> 18) & 63] + B64[(x >> 12) & 63] + (i + 1 < b.length ? B64[(x >> 6) & 63] : '=') + (i + 2 < b.length ? B64[x & 63] : '=');
  }
  return out;
}
function b64Decode(t) {
  const s = t.trim();
  if (!s || s.length % 4 || s.length > MAX_TEXT || !/^[A-Za-z0-9+/]+={0,2}$/.test(s)) return null;
  const bytes = [];
  for (let i = 0; i < s.length; i += 4) {
    const v = [0, 1, 2, 3].map((k) => (s[i + k] === '=' ? 0 : B64.indexOf(s[i + k])));
    const x = (v[0] << 18) | (v[1] << 12) | (v[2] << 6) | v[3];
    bytes.push((x >> 16) & 255);
    if (s[i + 2] !== '=') bytes.push((x >> 8) & 255);
    if (s[i + 3] !== '=') bytes.push(x & 255);
  }
  return utf8Text(bytes);
}
/** The first JSON object the prompt writes (balanced braces outside strings, then JSON.parse), or null. */
function jsonIn(q) {
  if (typeof q !== 'string') return null;
  const src = q.slice(0, MAX_TEXT);
  for (let i = src.indexOf('{'), tries = 0; i >= 0 && tries < 20; i = src.indexOf('{', i + 1), tries++) {
    let depth = 0, str = false, j = i;
    for (; j < src.length; j++) {
      const ch = src[j];
      if (str) { if (ch === '\\') j++; else if (ch === '"') str = false; continue; }
      if (ch === '"') str = true;
      else if (ch === '{' || ch === '[') depth++;
      else if (ch === '}' || ch === ']') { depth--; if (depth === 0) break; }
    }
    if (depth !== 0) continue;
    try { const v = JSON.parse(src.slice(i, j + 1)); if (isKv(v)) return v; } catch { /* not JSON: the next brace */ }
  }
  return null;
}
/** The value at a dotted path of an object (a list step is a 0-based index) as text: a number in full, an object as JSON. */
function pathGet(obj, p) {
  let v = obj;
  for (const step of p.split('.')) {
    if (Array.isArray(v) && /^\d+$/.test(step)) v = v[Number(step)];
    else if (isKv(v) && Object.hasOwn(v, step)) v = v[step];
    else return null;
  }
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return plainNum(v);
  if (typeof v === 'boolean') return String(v);
  return v !== null && typeof v === 'object' ? jsonText(v) : null;
}
function total(fn, outT) {
  const ok = CHECK[outT];
  return (args, ctx) => {
    try {
      const a = Array.isArray(args) ? args.map((v) => (v === undefined ? null : v)) : [];
      const c = { q: isKv(ctx) && typeof ctx.q === 'string' ? ctx.q : '', mem: isKv(ctx) && isKv(ctx.mem) ? ctx.mem : {} };
      const v = clean(fn(a, c));
      return v !== null && ok(v) ? v : null;
    } catch { return null; }
  };
}

// ---- the primitives (name, input types, output type, words, fn, options)
function buildPrims() {
  const out = {};
  const P = (name, ins, outT, words, fn, opt) => {
    out[name] = Object.freeze({ family: name.slice(0, name.indexOf('.')), in: Object.freeze(splitW(ins)), out: outT, words: Object.freeze(words.split('|')), fn: total(fn, outT), ...(opt || {}) });
  };
  const bad = () => { throw new TypeError('a primitive met a value outside its type'); };
  const S = (v) => (typeof v === 'string' ? v : bad());
  const N = (v) => (isNum(v) ? v : bad());
  const B = (v) => (typeof v === 'boolean' ? v : bad());
  const NS = (v) => (CHECK.nums(v) ? v : bad());
  const SS = (v) => (CHECK.strs(v) ? v : bad());
  const KV = (v) => (isKv(v) ? v : bad());
  const D = (v) => (okDate(v) ? v : bad());
  const LAZY = { lazy: true };
  const ifThen = (a) => (typeof a[0] === 'boolean' ? (a[0] ? a[1] : a[2]) : null);

  // sense: perception of the prompt (the "text" input is the prompt itself)
  P('sense.text', 'text', 'str', 'the text|the prompt|the question|this', (a, c) => c.q.trim() || null);
  P('sense.numbers', 'text', 'nums', 'numbers|the numbers|these numbers|values|data', (a, c) => ne(numbersIn(c.q)));
  P('sense.first', 'text', 'num', 'the number|first number|a number', (a, c) => numbersIn(c.q)[0] ?? null);
  P('sense.second', 'text', 'num', 'second number|the other number', (a, c) => numbersIn(c.q)[1] ?? null);
  P('sense.last', 'text', 'num', 'last number|final number', (a, c) => numbersIn(c.q).at(-1) ?? null);
  P('sense.nth', 'text num', 'num', 'nth number|number at|the number in position', (a, c) => pick(numbersIn(c.q), N(a[0])));
  P('sense.howMany', 'text', 'num', 'how many numbers|count of numbers', (a, c) => numbersIn(c.q).length);
  P('sense.list', 'text', 'strs', 'list|items|the following|these', (a, c) => listAfter(c.q));
  P('sense.listNums', 'text', 'nums', 'these numbers|the list|the data|the values', (a, c) => { const i = c.q.indexOf(':'); return i < 0 ? null : ne(numbersIn(c.q.slice(i + 1))); });
  P('sense.quoted', 'text', 'str', 'quoted|the word|the phrase|in quotes', (a, c) => quotedIn(c.q)[0] ?? null);
  P('sense.quotedAll', 'text', 'strs', 'quoted words|quoted phrases|both words', (a, c) => ne(quotedIn(c.q)));
  P('sense.after', 'text str', 'str', 'about|of|for|to|after|on', (a, c) => afterWord(c.q, S(a[0])));
  P('sense.before', 'text str', 'str', 'before|ahead of', (a, c) => beforeWord(c.q, S(a[0])));
  P('sense.between', 'text str str', 'str', 'between|from to', (a, c) => { const x = afterWord(c.q, S(a[0])); return x === null ? null : beforeWord(x, S(a[1])); });
  P('sense.words', 'text', 'strs', 'words|the words|every word', (a, c) => ne(wordsOf(c.q)));
  P('sense.content', 'text', 'strs', 'key words|content words|topic|keywords', (a, c) => ne(splitW(norm(c.q, 2))));
  P('sense.wordAt', 'text num', 'str', 'nth word|word number', (a, c) => pick(rawWords(c.q), N(a[0])));
  P('sense.lastWord', 'text', 'str', 'last word|the final word', (a, c) => rawWords(c.q).at(-1) ?? null);
  P('sense.subject', 'text', 'str', 'this|it|the subject|the word|the name', (a, c) => subjectOf(c.q));
  P('sense.wordCount', 'text', 'num', 'how many words|word count|number of words', (a, c) => wordsOf(c.q).length);
  P('sense.quantity', 'text', 'kv', 'a count with its unit|quantity|amount|how much', (a, c) => unitCount(c.q));
  P('sense.unit', 'text', 'str', 'unit|from|in units of', (a, c) => unitFrom(c.q));
  P('sense.unitTo', 'text', 'str', 'to|into|in|as', (a, c) => unitTo(c.q));
  P('sense.units', 'text', 'strs', 'units|measures', (a, c) => ne(unitsIn(c.q).map((x) => x.u)));
  P('sense.pairs', 'text', 'kv', 'key value|pairs|settings|fields', (a, c) => pairsIn(c.q));
  P('sense.date', 'text', 'kv', 'date|day|on', (a, c) => datesIn(c.q)[0] ?? null);
  P('sense.dateAt', 'text num', 'kv', 'nth date|second date|the other date', (a, c) => pick(datesIn(c.q), N(a[0])));
  P('sense.roman', 'text', 'str', 'roman numeral|roman|numeral', (a, c) => romanIn(c.q));
  P('sense.bases', 'text', 'nums', 'binary|octal|decimal|hex|hexadecimal|base', (a, c) => basesIn(c.q));
  P('sense.numeral', 'text', 'str', 'digits|binary number|hex number|code', (a, c) => rawWords(c.q).find((w) => /\d/.test(w)) ?? null);
  P('sense.has', 'text str', 'bool', 'mentions|says|contains the word', (a, c) => hasPhrase(norm(c.q, 1), S(a[0])));
  P('sense.matrix', 'text', 'mat', 'matrix|the matrix|grid of numbers|array', (a, c) => matricesIn(c.q)[0] ?? null);
  P('sense.matrixAt', 'text num', 'mat', 'second matrix|the other matrix|nth matrix|matrix b', (a, c) => pick(matricesIn(c.q), N(a[0])));
  P('sense.json', 'text', 'kv', 'json|the object|this json|the record', (a, c) => jsonIn(c.q));

  // transform: one value in, one changed value out
  P('transform.add', 'num num', 'num', 'plus|add|added to|sum of|and|more than', (a) => add(a[0], a[1]));
  P('transform.sub', 'num num', 'num', 'minus|subtract|take away|less|difference', (a) => sub(a[0], a[1]));
  P('transform.mul', 'num num', 'num', 'times|multiply|multiplied by|product of|of', (a) => mul(a[0], a[1]));
  P('transform.div', 'num num', 'num', 'divided by|divide|over|per|quotient|split', (a) => div(a[0], a[1]));
  P('transform.idiv', 'num num', 'num', 'whole division|integer division|how many whole times|goes into', (a) => idiv(a[0], a[1]));
  P('transform.mod', 'num num', 'num', 'remainder|mod|modulo|left over', (a) => mod(a[0], a[1]));
  P('transform.neg', 'num', 'num', 'negative|negate|opposite', (a) => neg(a[0]));
  P('transform.abs', 'num', 'num', 'absolute value|abs|magnitude|distance from zero', (a) => absN(a[0]));
  P('transform.round', 'num', 'num', 'round|rounded|nearest whole number', (a) => roundTo(a[0], 0));
  P('transform.roundTo', 'num num', 'num', 'round to|decimal places|rounded to', (a) => roundTo(a[0], a[1]));
  P('transform.floor', 'num', 'num', 'floor|round down', (a) => (isInt(a[0]) ? a[0] : fin(Math.floor(N(a[0])))));
  P('transform.ceil', 'num', 'num', 'ceiling|ceil|round up', (a) => (isInt(a[0]) ? a[0] : fin(Math.ceil(N(a[0])))));
  P('transform.square', 'num', 'num', 'square|squared|to the second power', (a) => mul(a[0], a[0]));
  P('transform.cube', 'num', 'num', 'cube|cubed|to the third power', (a) => mul(mul(a[0], a[0]), a[0]));
  P('transform.double', 'num', 'num', 'double|twice|two times', (a) => mul(a[0], 2));
  P('transform.half', 'num', 'num', 'half|halve|half of', (a) => div(a[0], 2));
  P('transform.next', 'num', 'num', 'next|one more|successor|after', (a) => add(a[0], 1));
  P('transform.prev', 'num', 'num', 'previous|one less|predecessor|before', (a) => sub(a[0], 1));
  P('transform.reciprocal', 'num', 'num', 'reciprocal|one over|multiplicative inverse', (a) => div(1, a[0]));
  P('transform.reverseDigits', 'num', 'num', 'reverse the digits|digits backwards|digits reversed', (a) => { const s = digitsOf(a[0]); return s === null ? null : nz(BigInt([...s].reverse().join('')) * (F(a[0]) < 0 ? -1n : 1n)); });
  P('transform.sortUp', 'nums', 'nums', 'sort|ascending|smallest to largest|in order|increasing order', (a) => sortNums(a[0]));
  P('transform.sortDown', 'nums', 'nums', 'descending|largest to smallest|decreasing order|biggest first', (a) => sortNums(a[0])?.reverse() ?? null);
  P('transform.sortStrs', 'strs', 'strs', 'alphabetical|alphabetize|sort|a to z', (a) => SS(a[0]).slice().sort((x, y) => cmp(x.toLowerCase(), y.toLowerCase()) || cmp(x, y)));
  P('transform.reverseNums', 'nums', 'nums', 'reverse|backwards|reversed|reverse order', (a) => NS(a[0]).slice().reverse());
  P('transform.reverseStrs', 'strs', 'strs', 'reverse|backwards|reversed|reverse order', (a) => SS(a[0]).slice().reverse());
  P('transform.uniqueNums', 'nums', 'nums', 'unique|distinct|remove duplicates|without repeats', (a) => { const seen = new Set(); return NS(a[0]).filter((x) => !seen.has(String(x)) && !!seen.add(String(x))); });
  P('transform.uniqueStrs', 'strs', 'strs', 'unique|distinct|remove duplicates|without repeats', (a) => [...new Set(SS(a[0]))]);
  P('transform.sliceNums', 'nums num num', 'nums', 'from position|slice|items from to', (a) => sliceList(NS(a[0]), a[1], a[2]));
  P('transform.sliceStrs', 'strs num num', 'strs', 'from position|slice|items from to', (a) => sliceList(SS(a[0]), a[1], a[2]));
  P('transform.takeNums', 'nums num', 'nums', 'first n|top|take', (a) => sliceList(NS(a[0]), 1, a[1]));
  P('transform.takeStrs', 'strs num', 'strs', 'first n|top|take', (a) => sliceList(SS(a[0]), 1, a[1]));
  P('transform.nthNum', 'nums num', 'num', 'nth|position|element|item number', (a) => pick(NS(a[0]), a[1]));
  P('transform.nthStr', 'strs num', 'str', 'nth|position|element|item number', (a) => pick(SS(a[0]), a[1]));
  P('transform.mapAdd', 'nums num', 'nums', 'add to each|each plus|increase each', (a) => NS(a[0]).map((x) => add(x, a[1])));
  P('transform.mapMul', 'nums num', 'nums', 'multiply each|scale|each times', (a) => NS(a[0]).map((x) => mul(x, a[1])));
  P('transform.evens', 'nums', 'nums', 'even numbers|evens|the even ones', (a) => NS(a[0]).filter((x) => isInt(x) && big(x) % 2n === 0n));
  P('transform.odds', 'nums', 'nums', 'odd numbers|odds|the odd ones', (a) => NS(a[0]).filter((x) => isInt(x) && big(x) % 2n !== 0n));
  P('transform.above', 'nums num', 'nums', 'greater than|above|over|more than|bigger than', (a) => NS(a[0]).filter((x) => x > N(a[1])));
  P('transform.below', 'nums num', 'nums', 'less than|below|under|smaller than', (a) => NS(a[0]).filter((x) => x < N(a[1])));
  P('transform.asText', 'nums', 'strs', 'as text|as words|written out', (a) => NS(a[0]).map(fmtNum));
  P('transform.lengths', 'strs', 'nums', 'lengths|how long each|length of each', (a) => SS(a[0]).map((s) => [...s].length));
  P('transform.upper', 'str', 'str', 'uppercase|upper case|capitals|all caps|capital letters', (a) => S(a[0]).toUpperCase());
  P('transform.lower', 'str', 'str', 'lowercase|lower case|small letters', (a) => S(a[0]).toLowerCase());
  P('transform.title', 'str', 'str', 'title case|capitalize|capitalise|capitalize each word', (a) => title(S(a[0])));
  P('transform.swapCase', 'str', 'str', 'swap case|invert case|toggle case', (a) => [...S(a[0])].map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase())).join(''));
  P('transform.reverse', 'str', 'str', 'reverse|backwards|spell backwards|reversed|mirror', (a) => [...S(a[0])].reverse().join(''));
  P('transform.reverseWords', 'str', 'str', 'reverse the words|reverse word order|words backwards', (a) => S(a[0]).trim().split(/\s+/).reverse().join(' '));
  P('transform.sortLetters', 'str', 'str', 'sort the letters|letters in order|alphabetize the letters', (a) => [...S(a[0])].sort().join(''));
  P('transform.noVowels', 'str', 'str', 'remove vowels|without vowels|no vowels', (a) => S(a[0]).replace(/[aeiou]/gi, ''));
  P('transform.initials', 'str', 'str', 'initials|first letters of the name', (a) => ne(rawWords(S(a[0])))?.map((w) => w[0].toUpperCase() + '.').join('') ?? null);
  P('transform.acronym', 'str', 'str', 'acronym|abbreviation|abbreviate|short form', (a) => { const ws = rawWords(S(a[0])), major = ws.filter((w) => !MINOR.has(w.toLowerCase())); return ne(major.length ? major : ws)?.map((w) => w[0].toUpperCase()).join('') ?? null; });
  P('transform.replace', 'str str str', 'str', 'replace|swap|substitute|change to', (a) => (S(a[1]) ? S(a[0]).split(a[1]).join(S(a[2])) : null));
  P('transform.remove', 'str str', 'str', 'remove|delete|without|strip out', (a) => (S(a[1]) ? S(a[0]).split(a[1]).join('') : null));
  P('transform.concat', 'str str', 'str', 'concatenate|combine|append|put together', (a) => S(a[0]) + S(a[1]));
  P('transform.join', 'strs str', 'str', 'join|joined with|separated by', (a) => SS(a[0]).join(S(a[1])));
  P('transform.split', 'str str', 'strs', 'split|split by|separate by', (a) => (S(a[1]) ? S(a[0]).split(a[1]).map((x) => x.trim()).filter(Boolean) : null));
  P('transform.words', 'str', 'strs', 'words|each word|split into words', (a) => ne(rawWords(S(a[0]))));
  P('transform.letters', 'str', 'strs', 'letters|characters|each letter|spell|spell out', (a) => ne([...S(a[0])].filter((ch) => ch.trim())));
  P('transform.trim', 'str', 'str', 'trim|strip spaces|clean up', (a) => S(a[0]).trim().replace(/\s+/g, ' '));
  P('transform.repeat', 'str num', 'str', 'repeat|say it times|copies', (a) => { const k = int(a[1]); return k !== null && k >= 0 && k * S(a[0]).length <= MAX_TEXT ? a[0].repeat(k) : null; });
  P('transform.norm', 'str num', 'str', 'normalize|normalise|simplify the text', (a) => norm(S(a[0]), int(a[1])));
  P('transform.camel', 'str', 'str', 'camel case|camelcase|camelCase|lower camel case', (a) => caseJoin(S(a[0]), 'camel'));
  P('transform.pascal', 'str', 'str', 'pascal case|PascalCase|upper camel case|class name', (a) => caseJoin(S(a[0]), 'pascal'));
  P('transform.snake', 'str', 'str', 'snake case|snake_case|underscores|variable name', (a) => caseJoin(S(a[0]), 'snake'));
  P('transform.kebab', 'str', 'str', 'kebab case|kebab-case|hyphens|slug|dashes', (a) => caseJoin(S(a[0]), 'kebab'));
  P('transform.substr', 'str num num', 'str', 'characters from|substring|letters from to|slice of the text', (a) => { const ch = [...S(a[0]).slice(0, MAX_TEXT)], i = int(a[1]), j = int(a[2]); return i !== null && j !== null && i >= 1 && j >= i && i <= ch.length ? ch.slice(i - 1, j).join('') : null; });
  P('transform.charAt', 'str num', 'str', 'letter at|character at|nth letter|which letter', (a) => pick([...S(a[0]).slice(0, MAX_TEXT)], a[1]));
  P('transform.padStart', 'str num str', 'str', 'pad|pad with|leading zeros|zero pad|padded to', (a) => { const k = int(a[1]); return S(a[2]) && k !== null && k >= 0 && k <= MAX_TEXT ? S(a[0]).padStart(k, a[2]) : null; });
  P('transform.caesar', 'str num', 'str', 'caesar cipher|shift each letter|rot13|rotate the letters|shift by', (a) => caesar(S(a[0]), N(a[1])));
  P('transform.charCodes', 'str', 'nums', 'character codes|ascii codes|code points|unicode values|ascii', (a) => { const ch = [...S(a[0])]; return ch.length <= MAX_LIST ? ne(ch.map((x) => x.codePointAt(0))) : null; });
  P('transform.fromCodes', 'nums', 'str', 'from character codes|from ascii|decode the codes|which characters', (a) => { const xs = ne(NS(a[0])); return xs && xs.length <= MAX_LIST && xs.every((x) => isInt(x) && F(x) >= 0 && F(x) <= 0x10ffff && !(F(x) >= 0xd800 && F(x) <= 0xdfff)) ? String.fromCodePoint(...xs.map(Number)) : null; });
  P('transform.base64', 'str', 'str', 'base64|base 64|encode in base64|to base64', (a) => b64Encode(S(a[0])));
  P('transform.unbase64', 'str', 'str', 'decode base64|from base64|base64 decode|decode', (a) => b64Decode(S(a[0])));
  P('transform.get', 'kv str', 'str', 'the field|the value at|the key|get|path', (a) => (S(a[1]).trim() ? pathGet(KV(a[0]), a[1].trim()) : null));

  // aggregate: many values in, one value out
  P('aggregate.sum', 'nums', 'num', 'sum|total|add up|altogether|in all|combined', (a) => sumOf(a[0]));
  P('aggregate.mean', 'nums', 'num', 'average|mean|arithmetic mean|avg', (a) => meanOf(a[0]));
  P('aggregate.median', 'nums', 'num', 'median|middle value|middle number', (a) => { const s = sortNums(ne(a[0])); if (!s) return null; const h = s.length >> 1; return s.length % 2 ? s[h] : div(add(s[h - 1], s[h]), 2); });
  P('aggregate.mode', 'nums', 'num', 'mode|most common|most frequent|appears most often', (a) => modeOf(a[0]));
  P('aggregate.min', 'nums', 'num', 'minimum|min|smallest|lowest|least', (a) => sortNums(ne(a[0]))?.[0] ?? null);
  P('aggregate.max', 'nums', 'num', 'maximum|max|largest|biggest|highest|greatest', (a) => sortNums(ne(a[0]))?.at(-1) ?? null);
  P('aggregate.range', 'nums', 'num', 'range|spread|difference between the largest and smallest', (a) => { const s = sortNums(ne(a[0])); return s ? sub(s.at(-1), s[0]) : null; });
  P('aggregate.count', 'nums', 'num', 'how many|count|number of values|how many numbers', (a) => NS(a[0]).length);
  P('aggregate.product', 'nums', 'num', 'product|multiply them all|multiplied together', (a) => prodOf(ne(a[0])));
  P('aggregate.sumSquares', 'nums', 'num', 'sum of squares|sum of the squares', (a) => sumOf(NS(a[0]).map((x) => mul(x, x))));
  P('aggregate.variance', 'nums', 'num', 'variance|population variance', (a) => varOf(a[0], false));
  P('aggregate.stdev', 'nums', 'num', 'standard deviation|stdev|std dev|population standard deviation', (a) => sqrtN(varOf(a[0], false)));
  P('aggregate.sampleStdev', 'nums', 'num', 'sample standard deviation|sample stdev', (a) => sqrtN(varOf(a[0], true)));
  P('aggregate.countStrs', 'strs', 'num', 'how many|count|number of items|how many items', (a) => SS(a[0]).length);
  P('aggregate.longest', 'strs', 'str', 'longest|longest word|longest one', (a) => ne(SS(a[0]))?.reduce((x, y) => ([...y].length > [...x].length ? y : x)) ?? null);
  P('aggregate.shortest', 'strs', 'str', 'shortest|shortest word|shortest one', (a) => ne(SS(a[0]))?.reduce((x, y) => ([...y].length < [...x].length ? y : x)) ?? null);
  P('aggregate.digitSum', 'num', 'num', 'sum of the digits|digit sum|add the digits', (a) => { const s = digitsOf(a[0]); return s === null ? null : [...s].reduce((t, d) => t + Number(d), 0); });
  P('aggregate.digitCount', 'num', 'num', 'how many digits|number of digits|digit count', (a) => digitsOf(a[0])?.length ?? null);
  P('aggregate.letters', 'str', 'num', 'how many letters|number of letters|letter count', (a) => (S(a[0]).match(/\p{L}/gu) || []).length);
  P('aggregate.vowels', 'str', 'num', 'how many vowels|number of vowels|vowel count', (a) => (S(a[0]).match(/[aeiou]/gi) || []).length);
  P('aggregate.consonants', 'str', 'num', 'how many consonants|number of consonants|consonant count', (a) => (S(a[0]).match(/[b-df-hj-np-tv-z]/gi) || []).length);
  P('aggregate.words', 'str', 'num', 'how many words|number of words|word count', (a) => rawWords(S(a[0])).length);
  P('aggregate.chars', 'str', 'num', 'how many characters|number of characters|character count|length', (a) => [...S(a[0])].length);
  P('aggregate.occurrences', 'str str', 'num', 'how many times|occurrences|how often|count of', (a) => countSub(a[0], a[1]));
  P('aggregate.countIn', 'strs str', 'num', 'how many times in the list|occurrences in the list', (a) => SS(a[0]).filter((x) => x.toLowerCase() === S(a[1]).toLowerCase()).length);
  P('aggregate.indexOf', 'str str', 'num', 'position of|where does|index of|at which position', (a) => { const h = [...S(a[0]).slice(0, MAX_TEXT).toLowerCase()], n = [...S(a[1]).toLowerCase()]; if (!n.length) return null; for (let i = 0; i + n.length <= h.length; i++) if (n.every((ch, k) => h[i + k] === ch)) return i + 1; return null; });
  P('aggregate.commonLetter', 'str', 'str', 'most common letter|most frequent letter|which letter appears most', (a) => { const n = new Map(); for (const ch of S(a[0]).slice(0, MAX_TEXT).toLowerCase()) if (/\p{L}/u.test(ch)) n.set(ch, (n.get(ch) || 0) + 1); const top = Math.max(0, ...n.values()), best = [...n].filter(([, k]) => k === top); return top && best.length === 1 ? best[0][0] : null; });
  P('aggregate.lines', 'str', 'num', 'how many lines|number of lines|line count|lines of code', (a) => S(a[0]).replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n').length);

  // compare: two values in, a yes or no out
  P('compare.greater', 'num num', 'bool', 'greater than|bigger than|larger than|more than|exceeds', (a) => N(a[0]) > N(a[1]));
  P('compare.less', 'num num', 'bool', 'less than|smaller than|fewer than|below', (a) => N(a[0]) < N(a[1]));
  P('compare.equal', 'num num', 'bool', 'equal|equals|same as|equal to', (a) => cmp(N(a[0]), N(a[1])) === 0);
  P('compare.atLeast', 'num num', 'bool', 'at least|no less than|greater than or equal to', (a) => N(a[0]) >= N(a[1]));
  P('compare.atMost', 'num num', 'bool', 'at most|no more than|less than or equal to', (a) => N(a[0]) <= N(a[1]));
  P('compare.between', 'num num num', 'bool', 'between|within|in the range', (a) => { const x = N(a[0]), l = N(a[1]), h = N(a[2]); return (x >= l && x <= h) || (x >= h && x <= l); });
  P('compare.divisible', 'num num', 'bool', 'divisible by|divides|multiple of|evenly divisible', (a) => (isInt(a[0]) && isInt(a[1]) && F(a[1]) !== 0 ? big(a[0]) % big(a[1]) === 0n : null));
  P('compare.isPrime', 'num', 'bool', 'prime|is prime|a prime number|prime number', (a) => isPrimeB(a[0]));
  P('compare.isEven', 'num', 'bool', 'even|is even|an even number', (a) => (isInt(a[0]) ? big(a[0]) % 2n === 0n : null));
  P('compare.isOdd', 'num', 'bool', 'odd|is odd|an odd number', (a) => (isInt(a[0]) ? big(a[0]) % 2n !== 0n : null));
  P('compare.isSquare', 'num', 'bool', 'perfect square|a square number|square number', (a) => (isInt(a[0]) ? F(a[0]) >= 0 && isqrt(big(a[0])) ** 2n === big(a[0]) : null));
  P('compare.isPerfect', 'num', 'bool', 'perfect number|a perfect number', (a) => { const ds = divisorsOf(a[0]); return ds ? Number(a[0]) > 1 && sumOf(ds) - Number(a[0]) === Number(a[0]) : null; });
  P('compare.isPositive', 'num', 'bool', 'positive|greater than zero|above zero', (a) => N(a[0]) > 0);
  P('compare.isWhole', 'num', 'bool', 'whole number|an integer|integer', (a) => isInt(N(a[0])));
  P('compare.coprime', 'num num', 'bool', 'coprime|relatively prime|share no factor', (a) => { const g = gcdN(a[0], a[1]); return g === null ? null : g === 1; });
  P('compare.isLeap', 'num', 'bool', 'leap year|a leap year|is a leap year', (a) => (isInt(a[0]) && F(a[0]) >= 1 && F(a[0]) <= 1e9 ? leap(Number(a[0])) : null));
  P('compare.isPalindrome', 'str', 'bool', 'palindrome|reads the same backwards|same forwards and backwards', (a) => { const l = letters(S(a[0])); return l.length ? l.join('') === l.slice().reverse().join('') : null; });
  P('compare.isAnagram', 'str str', 'bool', 'anagram|anagrams|same letters', (a) => { const x = letters(S(a[0])), y = letters(S(a[1])); return x.length && y.length ? x.sort().join('') === y.sort().join('') : null; });
  P('compare.contains', 'str str', 'bool', 'contains|includes|has|appears in', (a) => (S(a[1]) ? S(a[0]).toLowerCase().includes(a[1].toLowerCase()) : null));
  P('compare.startsWith', 'str str', 'bool', 'starts with|begins with', (a) => (S(a[1]) ? S(a[0]).trim().toLowerCase().startsWith(a[1].toLowerCase()) : null));
  P('compare.endsWith', 'str str', 'bool', 'ends with|finishes with', (a) => (S(a[1]) ? S(a[0]).trim().toLowerCase().endsWith(a[1].toLowerCase()) : null));
  P('compare.sameText', 'str str', 'bool', 'same|identical|equal|match', (a) => norm(S(a[0]), 1) === norm(S(a[1]), 1));
  P('compare.member', 'strs str', 'bool', 'in the list|one of|among|member of', (a) => SS(a[0]).some((x) => norm(x, 1) === norm(S(a[1]), 1)));
  P('compare.memberNum', 'nums num', 'bool', 'in the list|one of|among', (a) => NS(a[0]).some((x) => cmp(x, N(a[1])) === 0));
  P('compare.isSorted', 'nums', 'bool', 'sorted|in order|in ascending order', (a) => NS(a[0]).every((x, i, l) => i === 0 || l[i - 1] <= x));

  // compute: number theory, percent, geometry, conversion, dates
  P('compute.factorial', 'num', 'num', 'factorial|n factorial|!', (a) => factorial(a[0]));
  P('compute.gcd', 'num num', 'num', 'gcd|greatest common divisor|greatest common factor|gcf|hcf|highest common factor', (a) => gcdN(a[0], a[1]));
  P('compute.lcm', 'num num', 'num', 'lcm|least common multiple|lowest common multiple', (a) => lcmN(a[0], a[1]));
  P('compute.gcdAll', 'nums', 'num', 'gcd of all|greatest common divisor of the list', (a) => ne(NS(a[0]))?.reduce((x, y) => gcdN(x, y)) ?? null);
  P('compute.lcmAll', 'nums', 'num', 'lcm of all|least common multiple of the list', (a) => ne(NS(a[0]))?.reduce((x, y) => lcmN(x, y)) ?? null);
  P('compute.fibonacci', 'num', 'num', 'fibonacci|fib|fibonacci number', (a) => fib(a[0]));
  P('compute.divisors', 'num', 'nums', 'divisors|factors|all factors|all divisors', (a) => divisorsOf(a[0]));
  P('compute.divisorCount', 'num', 'num', 'number of divisors|how many divisors|how many factors|divisor count', (a) => divisorsOf(a[0])?.length ?? null);
  P('compute.divisorSum', 'num', 'num', 'sum of divisors|sum of factors|sum of the divisors', (a) => sumOf(divisorsOf(a[0])));
  P('compute.primeFactors', 'num', 'nums', 'prime factors|prime factorization|factorize|factorise|prime factorisation', (a) => factorize(a[0]));
  P('compute.nthPrime', 'num', 'num', 'nth prime|the prime number in position', (a) => nthPrime(a[0]));
  P('compute.primesUpTo', 'num', 'nums', 'primes up to|primes below|prime numbers less than|primes under', (a) => { const k = int(a[0]); return k !== null && k <= 200000 ? ne(sieve(k)) : null; });
  P('compute.nextPrime', 'num', 'num', 'next prime|the prime after|smallest prime greater than', (a) => nextPrime(a[0]));
  P('compute.choose', 'num num', 'num', 'choose|combinations|n choose k|ways to choose|binomial coefficient', (a) => choose(a[0], a[1]));
  P('compute.permutations', 'num num', 'num', 'permutations|arrangements|ways to arrange|ordered selections', (a) => perms(a[0], a[1]));
  P('compute.power', 'num num', 'num', 'power|to the power of|raised to|exponent|^', (a) => pow(a[0], a[1]));
  P('compute.sqrt', 'num', 'num', 'square root|sqrt|root of', (a) => sqrtN(a[0]));
  P('compute.root', 'num num', 'num', 'nth root|cube root|root', (a) => rootN(a[0], a[1]));
  P('compute.log', 'num num', 'num', 'log|logarithm|log base', (a) => logN(a[0], a[1]));
  P('compute.percentOf', 'num num', 'num', 'percent of|% of|percentage of', (a) => div(mul(a[0], a[1]), 100));
  P('compute.asPercent', 'num num', 'num', 'what percent|as a percentage|what percentage|percent is', (a) => div(mul(a[0], 100), a[1]));
  P('compute.percentChange', 'num num', 'num', 'percent change|percentage change|percent increase|percent decrease|growth rate', (a) => div(mul(sub(a[1], a[0]), 100), a[0]));
  P('compute.discount', 'num num', 'num', 'discount|off|sale price|after a discount|reduced by', (a) => div(mul(a[0], sub(100, a[1])), 100));
  P('compute.increase', 'num num', 'num', 'increase by|markup|raise by|with tax|plus tax', (a) => div(mul(a[0], add(100, a[1])), 100));
  P('compute.interest', 'num num num', 'num', 'simple interest|interest earned', (a) => div(mul(mul(a[0], a[1]), a[2]), 100));
  P('compute.compound', 'num num num', 'num', 'compound interest|compounded|grows to|after years at', (a) => { const t = int(a[2]); return t !== null && t >= 0 ? fin(F(N(a[0])) * Math.pow(1 + F(N(a[1])) / 100, t)) : null; });
  P('compute.hypot', 'num num', 'num', 'hypotenuse|pythagoras|diagonal|pythagorean', (a) => sqrtN(add(mul(a[0], a[0]), mul(a[1], a[1]))));
  P('compute.circleArea', 'num', 'num', 'area of a circle|circle area|area with radius', (a) => fin(Math.PI * F(N(a[0])) ** 2));
  P('compute.circumference', 'num', 'num', 'circumference|perimeter of a circle', (a) => fin(2 * Math.PI * F(N(a[0]))));
  P('compute.triangleArea', 'num num', 'num', 'area of a triangle|triangle area|half base times height', (a) => div(mul(a[0], a[1]), 2));
  P('compute.fraction', 'num num', 'str', 'simplify the fraction|lowest terms|reduce the fraction|simplest form', (a) => fraction(a[0], a[1]));
  P('compute.sumTo', 'num', 'num', 'sum from 1 to|sum of the first|triangular number|1 to n', (a) => (isInt(a[0]) && F(a[0]) >= 0 ? capB((big(a[0]) * (big(a[0]) + 1n)) / 2n) : null));
  P('compute.convert', 'num str str', 'num', 'convert|in|to|how many|equals|is how many', (a) => convert(a[0], a[1], a[2]));
  P('compute.toBase', 'num num', 'str', 'in binary|to binary|to hex|in base|convert to base|in octal', (a) => toBase(a[0], a[1]));
  P('compute.fromBase', 'str num', 'num', 'from binary|from hex|to decimal|in decimal|from base', (a) => fromBase(a[0], a[1]));
  P('compute.toRoman', 'num', 'str', 'roman numeral|in roman numerals|to roman|as a roman numeral', (a) => toRoman(a[0]));
  P('compute.fromRoman', 'str', 'num', 'from roman|roman numeral value|what number is|in arabic numerals', (a) => fromRoman(a[0]));
  P('compute.weekday', 'kv', 'str', 'day of the week|what day|which day|weekday', (a) => weekday(a[0]));
  P('compute.dayOfYear', 'kv', 'num', 'day of the year|which day of the year|day number', (a) => dayNum(D(a[0])) - dayNum({ y: a[0].y, m: 1, d: 1 }) + 1);
  P('compute.daysBetween', 'kv kv', 'num', 'days between|how many days|days from|days until', (a) => Math.abs(dayNum(D(a[1])) - dayNum(D(a[0]))));
  P('compute.addDays', 'kv num', 'kv', 'days after|days later|days from|plus days', (a) => { const k = int(a[1]); return k === null ? null : fromDayNum(dayNum(D(a[0])) + k); });
  P('compute.daysInMonth', 'num num', 'num', 'days in the month|how many days in|length of the month', (a) => { const y = int(a[0]), m = int(a[1]); return y !== null && m !== null && y >= 1 && y <= 9999 && m >= 1 && m <= 12 ? monthLen(y, m) : null; });
  P('compute.monthName', 'num', 'str', 'month name|which month|name of month', (a) => { const m = int(a[0]); return m !== null && m >= 1 && m <= 12 ? MONTHS[m - 1][0].toUpperCase() + MONTHS[m - 1].slice(1) : null; });
  P('compute.year', 'kv', 'num', 'year|which year|the year', (a) => D(a[0]).y);
  P('compute.month', 'kv', 'num', 'month|which month|month number', (a) => D(a[0]).m);
  P('compute.day', 'kv', 'num', 'day of the month|which date|date number', (a) => D(a[0]).d);
  P('compute.editDistance', 'str str', 'num', 'edit distance|levenshtein|how many edits|changes to turn', (a) => editDistance(S(a[0]), S(a[1])));
  P('compute.hamming', 'str str', 'num', 'hamming distance|positions that differ|how many positions differ', (a) => { const x = [...S(a[0])], y = [...S(a[1])]; return x.length === y.length && x.length <= MAX_TEXT ? x.filter((ch, i) => ch !== y[i]).length : null; });

  // memory: what the cell holds (mem)
  P('memory.lookup', 'str', 'str', 'what is|who is|define|meaning of|capital of|look up|tell me about', (a, c) => asStr(lookup(c.mem, a[0])));
  P('memory.lookupNum', 'str', 'num', 'how much is|how many are|value of|number for', (a, c) => asNum(lookup(c.mem, a[0])));
  P('memory.nearest', 'str', 'str', 'like|closest to|similar to|nearest|something like', (a, c) => asStr(nearest(c.mem, a[0])));
  P('memory.has', 'str', 'bool', 'do you know|is there|known|have you heard of', (a, c) => (isKv(c.mem.table) && typeof a[0] === 'string' ? lookup(c.mem, a[0]) !== null : null));
  P('memory.num', 'str', 'num', 'constant|the value|rate', (a, c) => asNum(memField(c.mem, 'consts', a[0])));
  P('memory.text', 'str', 'str', 'fact|note|the text for', (a, c) => asStr(memField(c.mem, 'texts', a[0])));
  P('memory.list', 'str', 'strs', 'list|the items|all of', (a, c) => { const v = memField(c.mem, 'lists', a[0]); return CHECK.strs(v) ? v.slice() : null; });
  P('memory.tpl', '', 'tpl', 'template|format|pattern|shape of the answer', (a, c) => (isTpl(c.mem.tpl) ? c.mem.tpl : null));
  P('memory.tplNamed', 'str', 'tpl', 'named template|the format for', (a, c) => { const v = memField(c.mem, 'tpls', a[0]); return isTpl(v) ? v : null; });
  P('memory.answer', '', 'str', 'the answer|what it holds|the fact', (a, c) => asStr(c.mem.answer));
  P('memory.table', '', 'kv', 'the table|everything it holds', (a, c) => (isKv(c.mem.table) ? c.mem.table : null));

  // know: retrieval from the knowledge packs (knowLoad); a pack id and its column names are literal arguments
  P('know.find', 'text str str', 'strs', 'which|named|mentioned|the one called', (a, c) => ne(knowFind(c.q, S(a[0]), S(a[1]))));
  P('know.lookup', 'str str str str', 'str', 'what is the|look up|the value of|find the', (a) => knowGet(S(a[1]), S(a[2]), S(a[0]), S(a[3])));
  P('know.reverse', 'str str str str', 'str', 'which has|whose|which one has|the one with', (a) => knowGet(S(a[1]), S(a[3]), S(a[0]), S(a[2])));
  P('know.row', 'str str str', 'kv', 'everything about|the record of|all about', (a) => knowRow(S(a[1]), S(a[2]), S(a[0])));
  P('know.has', 'str str str', 'bool', 'is it known|is there a|is it listed', (a) => { const p = KNOW.get(S(a[1])); const j = p ? knowCol(p, S(a[2])) : -1; return j < 0 ? null : knowKeys(p, j).has(knowNorm(S(a[0]))); });
  P('know.where', 'strs str str str str', 'strs', 'which of these|the ones that are|among these', (a) => knowWhere(SS(a[0]), S(a[1]), S(a[2]), S(a[3]), S(a[4])));
  P('know.num', 'str', 'num', 'as a number|numeric value|how much', (a) => parseNum(S(a[0]).trim()));

  // series: a pack's value column in the order of its key column; the keys come first, then the pack id, the key column
  // and the value column (literal arguments, as in know)
  const SER = (a, i) => seriesOf(S(a[i]), S(a[i + 1]), S(a[i + 2]));
  const span = (a) => serSpan(SER(a, 2), S(a[0]), S(a[1]));
  const pair = (a) => serPair(SER(a, 2), S(a[0]), S(a[1]));
  P('series.at', 'str str str str', 'num', 'in|at|value in|the value for', (a) => serItem(SER(a, 1), S(a[0]), 0)?.v ?? null);
  P('series.prev', 'str str str str', 'num', 'the one before|previous|the year before|prior', (a) => serItem(SER(a, 1), S(a[0]), -1)?.v ?? null);
  P('series.next', 'str str str str', 'num', 'the one after|next|the year after|following', (a) => serItem(SER(a, 1), S(a[0]), 1)?.v ?? null);
  P('series.prevKey', 'str str str str', 'str', 'the key before|which came before|the year before', (a) => serItem(SER(a, 1), S(a[0]), -1)?.k ?? null);
  P('series.nextKey', 'str str str str', 'str', 'the key after|which came next|the year after', (a) => serItem(SER(a, 1), S(a[0]), 1)?.k ?? null);
  P('series.step', 'str str str str', 'num', 'change from the one before|rise that year|fall that year|year on year', (a) => { const x = serItem(SER(a, 1), S(a[0]), 0), y = serItem(SER(a, 1), a[0], -1); return x && y ? fx(sub(x.v, y.v)) : null; });
  P('series.delta', 'str str str str str', 'num', 'change from|difference between|how much did it change|rise from', (a) => { const p = pair(a); return p ? fx(sub(p[1], p[0])) : null; });
  P('series.ratio', 'str str str str str', 'num', 'ratio|how many times|times as much', (a) => { const p = pair(a); return p ? fx(div(p[1], p[0])) : null; });
  P('series.change', 'str str str str str', 'num', 'percent change|percentage change|grew by|growth from', (a) => { const p = pair(a); return p ? fx(div(mul(sub(p[1], p[0]), 100), p[0])) : null; });
  P('series.mean', 'str str str str str', 'num', 'average from|mean between|average over|mean from', (a) => fx(meanOf(span(a)?.map((x) => x.v) ?? null)));
  P('series.sum', 'str str str str str', 'num', 'total from|sum over|altogether between', (a) => fx(sumOf(ne(span(a))?.map((x) => x.v) ?? null)));
  P('series.max', 'str str str str str', 'num', 'highest between|peak from|maximum over', (a) => sortNums(ne(span(a))?.map((x) => x.v) ?? null)?.at(-1) ?? null);
  P('series.min', 'str str str str str', 'num', 'lowest between|minimum over', (a) => sortNums(ne(span(a))?.map((x) => x.v) ?? null)?.[0] ?? null);
  P('series.window', 'str str str str str', 'nums', 'values from|from to|between', (a) => ne(span(a))?.map((x) => x.v) ?? null);
  P('series.argmaxIn', 'str str str str str', 'str', 'when was it highest between|peak year between', (a) => argExt(span(a), 1)?.k ?? null);
  P('series.argminIn', 'str str str str str', 'str', 'when was it lowest between|low year between', (a) => argExt(span(a), -1)?.k ?? null);
  P('series.higher', 'str str str str str', 'str', 'which was higher|which is larger|more in', (a) => { const p = pair(a); return p === null || cmp(p[0], p[1]) === 0 ? null : cmp(p[0], p[1]) > 0 ? serItem(SER(a, 2), a[0], 0).k : serItem(SER(a, 2), a[1], 0).k; });
  P('series.lower', 'str str str str str', 'str', 'which was lower|which is smaller|less in', (a) => { const p = pair(a); return p === null || cmp(p[0], p[1]) === 0 ? null : cmp(p[0], p[1]) < 0 ? serItem(SER(a, 2), a[0], 0).k : serItem(SER(a, 2), a[1], 0).k; });
  P('series.greater', 'str str str str str', 'bool', 'higher in|more than in|greater in', (a) => { const p = pair(a); return p ? cmp(p[0], p[1]) > 0 : null; });
  P('series.first', 'str str str', 'num', 'first value|earliest value|at the start', (a) => SER(a, 0)?.items[0]?.v ?? null);
  P('series.last', 'str str str', 'num', 'latest value|most recent|last value', (a) => SER(a, 0)?.items.at(-1)?.v ?? null);
  P('series.firstKey', 'str str str', 'str', 'first year|earliest|since when', (a) => SER(a, 0)?.items[0]?.k ?? null);
  P('series.lastKey', 'str str str', 'str', 'latest year|most recent year|last on record', (a) => SER(a, 0)?.items.at(-1)?.k ?? null);
  P('series.argmax', 'str str str', 'str', 'when was it highest|the year with the highest|peak year|record high', (a) => argExt(SER(a, 0)?.items, 1)?.k ?? null);
  P('series.argmin', 'str str str', 'str', 'when was it lowest|the year with the lowest|record low', (a) => argExt(SER(a, 0)?.items, -1)?.k ?? null);
  P('series.values', 'str str str', 'nums', 'all values|the whole series|every value', (a) => { const s = SER(a, 0); return s && s.items.length <= MAX_LIST ? ne(s.items.map((x) => x.v)) : null; });
  P('series.keys', 'str str str', 'strs', 'every year|all the years|the keys', (a) => { const s = SER(a, 0); return s && s.items.length <= MAX_LIST ? ne(s.items.map((x) => x.k)) : null; });
  P('series.countAbove', 'num str str str', 'num', 'how many years above|how many times over|count above', (a) => { const s = SER(a, 1), x = N(a[0]); return s ? s.items.filter((y) => cmp(y.v, x) > 0).length : null; });
  P('series.countBelow', 'num str str str', 'num', 'how many years below|how many times under|count below', (a) => { const s = SER(a, 1), x = N(a[0]); return s ? s.items.filter((y) => cmp(y.v, x) < 0).length : null; });

  // table: a long table, one row per entity and time; the entity and the time come first, then the pack id, the entity
  // column, the time column and the value column
  const TAB = (a, i) => tableOf(S(a[i]), S(a[i + 1]), S(a[i + 2]), S(a[i + 3]));
  P('table.get', 'str str str str str str', 'str', 'of in|for in|the value of in', (a) => tabPair(TAB(a, 2), S(a[0]), S(a[1]))?.v ?? null);
  P('table.at', 'str str str str str str', 'num', 'how much in|how many in|the number for in', (a) => tabPair(TAB(a, 2), S(a[0]), S(a[1]))?.x ?? null);
  P('table.latest', 'str str str str str', 'num', 'latest|most recent|current|now', (a) => tabNums(TAB(a, 1), S(a[0]))?.at(-1).x ?? null);
  P('table.latestKey', 'str str str str str', 'str', 'when was the latest|most recent year|last year on record for', (a) => tabNums(TAB(a, 1), S(a[0]))?.at(-1).t ?? null);
  P('table.earliest', 'str str str str str', 'num', 'earliest|first recorded|at the start', (a) => tabNums(TAB(a, 1), S(a[0]))?.[0].x ?? null);
  P('table.earliestKey', 'str str str str str', 'str', 'first year|since when|earliest year for', (a) => tabNums(TAB(a, 1), S(a[0]))?.[0].t ?? null);
  P('table.series', 'str str str str str', 'nums', 'over the years|every year of|the history of|all values of', (a) => { const l = tabNums(TAB(a, 1), S(a[0])); return l && l.length <= MAX_LIST ? l.map((x) => x.x) : null; });
  P('table.top', 'str str str str str', 'str', 'which had the most|the highest in|largest in|top in', (a) => argExt(tabAt(TAB(a, 1), S(a[0])), 1)?.k ?? null);
  P('table.bottom', 'str str str str str', 'str', 'which had the least|the lowest in|smallest in|bottom in', (a) => argExt(tabAt(TAB(a, 1), S(a[0])), -1)?.k ?? null);
  P('table.across', 'str str str str str', 'nums', 'all values in|every one in|across in', (a) => { const l = tabAt(TAB(a, 1), S(a[0])); return l && l.length <= MAX_LIST ? l.map((x) => x.v) : null; });
  P('table.rank', 'str str str str str str', 'num', 'rank|ranked|place in|position in', (a) => { const t = TAB(a, 2), x = tabPair(t, S(a[0]), S(a[1]))?.x ?? null, l = tabAt(t, a[1]); return x === null || !l ? null : 1 + l.filter((y) => cmp(y.v, x) > 0).length; });
  P('table.delta', 'str str str str str str str', 'num', 'change from to|difference between and for|how much did it grow', (a) => { const t = TAB(a, 3), x = tabPair(t, S(a[0]), S(a[1]))?.x ?? null, y = tabPair(t, a[0], S(a[2]))?.x ?? null; return x === null || y === null ? null : fx(sub(y, x)); });

  // matrix: shape, parts, arithmetic, determinant and inverse of small square ones
  P('matrix.rows', 'mat', 'num', 'how many rows|number of rows|rows', (a) => M(a[0]).length);
  P('matrix.cols', 'mat', 'num', 'how many columns|number of columns|columns', (a) => M(a[0])[0].length);
  P('matrix.shape', 'mat', 'str', 'shape|dimensions|size of the matrix|order of the matrix', (a) => M(a[0]).length + 'x' + a[0][0].length);
  P('matrix.row', 'mat num', 'nums', 'row|the row|nth row', (a) => pick(M(a[0]), a[1]));
  P('matrix.col', 'mat num', 'nums', 'column|the column|nth column', (a) => pick(matT(a[0]), a[1]));
  P('matrix.at', 'mat num num', 'num', 'entry|element at|row column|entry at', (a) => { const r = pick(M(a[0]), a[1]); return r ? pick(r, a[2]) : null; });
  P('matrix.transpose', 'mat', 'mat', 'transpose|transposed|flip rows and columns', (a) => matT(a[0]));
  P('matrix.add', 'mat mat', 'mat', 'add|add the matrices|sum of the matrices|plus|matrix sum', (a) => matZip(a[0], a[1], add));
  P('matrix.sub', 'mat mat', 'mat', 'subtract|subtract the matrices|difference of the matrices|minus', (a) => matZip(a[0], a[1], sub));
  P('matrix.mul', 'mat mat', 'mat', 'multiply|multiply the matrices|matrix product|product|times', (a) => matMul(a[0], a[1]));
  P('matrix.scale', 'mat num', 'mat', 'scale|multiply the matrix by|scalar multiple|times', (a) => { const k = N(a[1]); return M(a[0]).map((r) => r.map((x) => mul(x, k))); });
  P('matrix.det', 'mat', 'num', 'determinant|det', (a) => detOf(M(a[0])));
  P('matrix.inverse', 'mat', 'mat', 'inverse|invert|inverse matrix', (a) => invOf(M(a[0])));
  P('matrix.trace', 'mat', 'num', 'trace|sum of the diagonal', (a) => (isSquare(a[0]) || (isMat(a[0]) && a[0].length === a[0][0].length) ? sumOf(a[0].map((r, i) => r[i])) : null));
  P('matrix.identity', 'num', 'mat', 'identity matrix|identity|unit matrix', (a) => matId(N(a[0])));
  P('matrix.flatten', 'mat', 'nums', 'flatten|all entries|every entry|entries', (a) => M(a[0]).flat());
  P('matrix.power', 'mat num', 'mat', 'to the power|matrix power|squared|cubed', (a) => matPow(M(a[0]), N(a[1])));
  P('matrix.reshape', 'nums num', 'mat', 'arrange in rows|reshape|in rows|into a grid', (a) => { const xs = NS(a[0]), k = int(a[1]), c = k ? xs.length / k : 0; return k !== null && k >= 1 && k <= MAT_MAX && isInt(c) && c >= 1 && c <= MAT_MAX ? Array.from({ length: k }, (_, i) => xs.slice(i * c, i * c + c)) : null; });

  // route: choose between values (lazy ones see a null instead of failing on it)
  P('route.if', 'bool str str', 'str', 'if|whether|otherwise|depending on', ifThen, LAZY);
  P('route.ifNum', 'bool num num', 'num', 'if|whether|otherwise', ifThen, LAZY);
  P('route.ifStrs', 'bool strs strs', 'strs', 'if|whether|otherwise', ifThen, LAZY);
  P('route.first', 'str str', 'str', 'or|else|otherwise|fallback|failing that', (a) => a[0] ?? a[1], LAZY);
  P('route.firstNum', 'num num', 'num', 'or|else|otherwise|fallback', (a) => a[0] ?? a[1], LAZY);
  P('route.firstStrs', 'strs strs', 'strs', 'or|else|otherwise|fallback', (a) => a[0] ?? a[1], LAZY);
  P('route.when', 'bool str', 'str', 'only if|only when|provided that', (a) => (a[0] === true ? a[1] : null));
  P('route.unless', 'bool str', 'str', 'unless|except when|if not', (a) => (a[0] === false ? a[1] : null));
  P('route.whenNum', 'bool num', 'num', 'only if|only when|provided that', (a) => (a[0] === true ? a[1] : null));
  P('route.case', 'str kv', 'str', 'case|which one|depending on|according to', (a) => asStr(caseOf(a[1], a[0])));
  P('route.caseNum', 'str kv', 'num', 'case|which one|how much for', (a) => asNum(caseOf(a[1], a[0])));

  // iterate: sequences in time and in order (temporal integration, plans)
  P('iterate.range', 'num', 'nums', 'from 1 to|1 to n|count to|up to|each day|days|steps', (a) => { const n = int(a[0]); return n !== null && n >= 1 ? rangeAB(1, n) : null; });
  P('iterate.rangeFrom', 'num num', 'nums', 'from to|through|between|from', (a) => rangeAB(a[0], a[1]));
  P('iterate.steps', 'num num num', 'nums', 'step by|skip count|arithmetic sequence|counting by', (a) => { const k = int(a[2]); if (k === null || k < 1 || k > MAX_LIST) return null; const out = []; let x = N(a[0]); for (let i = 0; i < k; i++) { out.push(x); x = add(x, a[1]); } return out; });
  P('iterate.multiples', 'num num', 'nums', 'multiples|times table|first multiples|multiplication table', (a) => { const k = int(a[1]); return k !== null && k >= 1 ? rangeAB(1, k)?.map((i) => mul(a[0], i)) ?? null : null; });
  P('iterate.squares', 'num', 'nums', 'squares|square numbers|first squares|perfect squares', (a) => { const k = int(a[0]); return k !== null && k >= 1 ? rangeAB(1, k)?.map((i) => mul(i, i)) ?? null : null; });
  P('iterate.powers', 'num num', 'nums', 'powers of|first powers|exponents of', (a) => { const k = int(a[1]); return k !== null && k >= 1 && k <= 2000 ? Array.from({ length: k }, (x, i) => pow(a[0], i + 1)) : null; });
  P('iterate.fibs', 'num', 'nums', 'fibonacci sequence|first fibonacci numbers|fibonacci series', (a) => { const k = int(a[0]); if (k === null || k < 1 || k > 2000) return null; const out = []; let x = 0n, y = 1n; for (let i = 0; i < k; i++) { out.push(nz(x)); [x, y] = [y, x + y]; } return out; });
  P('iterate.countdown', 'num', 'nums', 'count down|countdown|backwards from', (a) => { const n = int(a[0]); return n !== null && n >= 1 ? rangeAB(n, 1) : null; });
  P('iterate.cumsum', 'nums', 'nums', 'running total|cumulative sum|running sum|total so far', (a) => { let s = 0; return NS(a[0]).map((x) => (s = add(s, x))); });
  P('iterate.diffs', 'nums', 'nums', 'differences|changes|step between|gaps', (a) => NS(a[0]).slice(1).map((x, i) => sub(x, a[0][i])));
  P('iterate.growth', 'num num num', 'nums', 'grows by percent|each year|per period|growth over time', (a) => { const k = int(a[2]); if (k === null || k < 1 || k > MAX_LIST) return null; const out = []; let x = F(N(a[0])); for (let i = 0; i < k; i++) { x *= 1 + F(N(a[1])) / 100; out.push(fin(x)); } return out; });
  P('iterate.collatz', 'num', 'nums', 'collatz|3n+1|hailstone sequence', (a) => { if (!isInt(a[0]) || F(a[0]) < 1 || F(a[0]) > 1e12) return null; let n = Number(a[0]); const out = [n]; while (n !== 1 && out.length < MAX_LIST) { n = n % 2 ? 3 * n + 1 : n / 2; if (!Number.isSafeInteger(n)) return null; out.push(n); } return n === 1 ? out : null; });
  P('iterate.digits', 'num', 'nums', 'digits|each digit|the digits', (a) => { const s = digitsOf(a[0]); return s && s.length <= MAX_LIST ? [...s].map(Number) : null; });
  P('iterate.repeat', 'str num', 'strs', 'repeat|times|over and over', (a) => { const k = int(a[1]); return k !== null && k >= 1 && k <= MAX_LIST ? Array(k).fill(S(a[0])) : null; });
  P('iterate.mapTemplate', 'tpl nums', 'strs', 'for each|every day|day by day|plan|schedule|one per', (a) => mapTpl(a[0], NS(a[1])));
  P('iterate.mapTemplateStrs', 'tpl strs', 'strs', 'for each|each item|one per item|for every', (a) => mapTpl(a[0], SS(a[1])));

  // render: the apex, the text a person reads
  P('render.number', 'num', 'str', 'the answer|equals|is|number', (a) => fmtNum(N(a[0])));
  P('render.plain', 'num', 'str', 'exact number|all its digits|in full', (a) => plainNum(N(a[0])));
  P('render.decimals', 'num num', 'str', 'decimal places|to places|rounded to|to the nearest', (a) => fmtFixed(N(a[0]), a[1]));
  P('render.percent', 'num', 'str', 'percent|percentage|%', (a) => fmtNum(N(a[0])) + '%');
  P('render.money', 'num', 'str', 'dollars|cost|price|money|$', (a) => { const s = fmtFixed(absN(N(a[0])), 2); return s === null ? null : (F(a[0]) < 0 ? '-$' : '$') + s; });
  P('render.ordinal', 'num', 'str', 'ordinal|th|place|position', (a) => ordinal(a[0]));
  P('render.unit', 'num str', 'str', 'with units|in units|measured in', (a) => (S(a[1]).trim() ? fmtNum(N(a[0])) + ' ' + a[1].trim() : null));
  P('render.pair', 'str num', 'str', 'label and value|name and number', (a) => (S(a[0]).trim() ? a[0].trim() + ': ' + fmtNum(N(a[1])) : null));
  P('render.list', 'strs', 'str', 'list|comma separated|separated by commas', (a) => SS(a[0]).join(', '));
  P('render.and', 'strs', 'str', 'and|in a sentence|listed', (a) => { const l = SS(a[0]); return l.length < 2 ? l.join('') : l.slice(0, -1).join(', ') + ' and ' + l.at(-1); });
  P('render.listNums', 'nums', 'str', 'list of numbers|the numbers|sequence', (a) => NS(a[0]).map(fmtNum).join(', '));
  P('render.lines', 'strs', 'str', 'lines|one per line|plan|each on its own line', (a) => SS(a[0]).join('\n'));
  P('render.numbered', 'strs', 'str', 'numbered list|steps|ordered list', (a) => SS(a[0]).map((s, i) => i + 1 + '. ' + s).join('\n'));
  P('render.bullets', 'strs', 'str', 'bullet list|bullets|bullet points', (a) => SS(a[0]).map((s) => '- ' + s).join('\n'));
  P('render.yesNo', 'bool str str', 'str', 'yes or no|is it|true or false|whether', (a) => (B(a[0]) ? S(a[1]) : S(a[2])));
  P('render.bool', 'bool', 'str', 'yes|no|true|false', (a) => (B(a[0]) ? 'Yes' : 'No'));
  P('render.template', 'tpl str', 'str', 'sentence|answer in a sentence|fill in|in the form', (a) => fillTpl(a[0], a.slice(1)), { rest: 'str' });
  P('render.templateNum', 'tpl num', 'str', 'sentence with a number|fill in the number', (a) => fillTpl(a[0], a.slice(1)), { rest: 'num' });
  P('render.sentence', 'str', 'str', 'sentence|full sentence|as a sentence', (a) => sentence(S(a[0])));
  P('render.json', 'kv', 'str', 'json|as an object|structured data', (a) => jsonText(KV(a[0])));
  P('render.kvLines', 'kv', 'str', 'table|key value lines|fields', (a) => Object.entries(KV(a[0])).map(([k, v]) => k + ': ' + (show(v) ?? jsonText(v))).join('\n'));
  P('render.code', 'str', 'str', 'code|inline code|monospace|as code', (a) => (S(a[0]).includes('`') ? '`` ' + a[0] + ' ``' : '`' + a[0] + '`'));
  P('render.date', 'kv', 'str', 'date|written date|the date', (a) => dateText(a[0]));
  P('render.str', 'str', 'str', 'say|the text|as is|exactly', (a) => S(a[0]));
  P('render.matrix', 'mat', 'str', 'matrix|as a matrix|in brackets', (a) => matText(a[0]));
  P('render.matrixRows', 'mat', 'str', 'rows|one row per line|as a grid', (a) => M(a[0]).map((r) => r.map(matNum).join(' ')).join('\n'));
  return Object.freeze(out);
}

// ---- evaluation: nodes, types, shape
function isLit(node) { return isKv(node) && Object.hasOwn(node, 'lit'); }
/** The argument types a node of this primitive carries (its in list without the implicit "text"), or null. */
function argTypes(name) {
  if (typeof name !== 'string') return null;
  if (Object.hasOwn(ARGS, name)) return ARGS[name].slice();
  const m = MACROS.get(name);
  return m ? m.in.slice() : null;
}
/**
 * Evaluate a node on a prompt and a mem: a value of the node's type, or null (a miss, never a guess). env holds the
 * argument values of the macro whose body is being evaluated: a { param: j } leaf is the j-th of them.
 */
function evalNode(node, q, mem, depth = 0, env = null) {
  try {
    if (depth > MAX_DEPTH) return null;
    if (isLit(node)) return clean(node.lit);
    if (env !== null && isParam(node)) return node.param < env.length ? env[node.param] : null;
    if (!Array.isArray(node) || typeof node[0] !== 'string') return null;
    if (!Object.hasOwn(PRIMS, node[0])) {
      const m = MACROS.get(node[0]);
      if (!m || node.length - 1 !== m.in.length) return null;
      const vals = [];
      for (let i = 1; i < node.length; i++) { const v = evalNode(node[i], q, mem, depth + 1, env); if (v === null) return null; vals.push(v); }
      return evalNode(m.body, q, mem, depth + 1, vals);
    }
    const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
    if (n < ts.length || (n > ts.length && !p.rest)) return null;
    const args = [];
    for (let i = 1; i <= n; i++) { const v = evalNode(node[i], q, mem, depth + 1, env); if (v === null && !p.lazy) return null; args.push(v); }
    return p.fn(args, { q: typeof q === 'string' ? q : '', mem: isKv(mem) ? mem : null });
  } catch { return null; }
}
/** Whether a node is well typed and yields the wanted type (any type when want is undefined). */
function wellTyped(node, want, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (isLit(node)) return typeof want === 'string' && want !== 'text' && Object.hasOwn(CHECK, want) && CHECK[want](clean(node.lit));
  if (!Array.isArray(node) || typeof node[0] !== 'string') return false;
  if (!Object.hasOwn(PRIMS, node[0])) {
    const m = MACROS.get(node[0]);
    if (!m || (want !== undefined && m.out !== want) || node.length - 1 !== m.in.length) return false;
    for (let i = 1; i < node.length; i++) if (!wellTyped(node[i], m.in[i - 1], depth + 1)) return false;
    return true;
  }
  const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
  if ((want !== undefined && p.out !== want) || n < ts.length || (n > ts.length && !p.rest)) return false;
  for (let i = 1; i <= n; i++) if (!wellTyped(node[i], i <= ts.length ? ts[i - 1] : p.rest, depth + 1)) return false;
  return true;
}
/** A literal is 0; a primitive node is 1 + the tallest of its arguments. */
function heightOf(node, depth = 0) {
  if (!Array.isArray(node) || depth > MAX_DEPTH) return 0;
  let h = 0;
  for (let i = 1; i < node.length; i++) h = Math.max(h, heightOf(node[i], depth + 1));
  return 1 + h;
}
/** Every primitive node and every literal counts 1. */
function sizeOf(node, depth = 0) {
  if (!Array.isArray(node) || depth > MAX_DEPTH) return node === undefined ? 0 : 1;
  let s = 1;
  for (let i = 1; i < node.length; i++) s += sizeOf(node[i], depth + 1);
  return s;
}
function leavesOk(node, depth = 0) {
  if (isLit(node)) return true;
  if (!Array.isArray(node) || depth > MAX_DEPTH) return false;
  if (node.length === 1) return ['sense', 'memory'].includes(PRIMS[node[0]]?.family) || MACROS.has(node[0]); // a macro's own leaves were checked when it loaded
  return node.slice(1).every((x) => leavesOk(x, depth + 1));
}
/** The family of a primitive, or of a macro's apex primitive; null for any other name. */
function familyOfName(name) { return typeof name !== 'string' ? null : Object.hasOwn(PRIMS, name) ? PRIMS[name].family : MACROS.has(name) ? MACROS.get(name).family : null; }

// ---- macros (contract c6): composites of the primitives that grow/evolve.mjs mined from kept cells and a measured
// trial kept (neo/MACROS.json), loaded by macroLoad. A macro node ["macro.<slug>", a1, .., ak] is the macro's body with
// its { param: j } leaves bound to the VALUES of a1 .. ak: typed by the macro's in and out like a primitive, total like
// every node (a null argument is a null, a throw is a null, the depth bar holds inside the body too). A body names
// primitives only, never a macro, so no macro reaches itself; a compiled module carries the macros its cells name.
const MACROS = new Map();
const MACRO_NAME = /^macro\.[a-z0-9][a-z0-9-]{0,79}$/;
/** The most macros loaded, the largest body (nodes) and the most parameters a macro takes. */
const MACRO_MAX = 512;
const MACRO_MAX_SIZE = 48;
const MACRO_MAX_PARAMS = 8;
function isParam(node) { return isKv(node) && Number.isInteger(node.param) && node.param >= 0 && Object.keys(node).length === 1; }
/**
 * A macro checked: { name, body, in, out, family, params, size } frozen, or null. The body is a node of primitives whose
 * leaves are literals of their place's type, sense or memory primitives or { param: j } (j below params, each used,
 * each place of one type); the place types are its in (a given in must equal them), its apex primitive's out its out
 * (a given out must equal it).
 */
function macroOf(m) {
  if (!isKv(m) || typeof m.name !== 'string' || !MACRO_NAME.test(m.name) || Object.hasOwn(PRIMS, m.name)) return null;
  const k = m.params;
  if (!Number.isInteger(k) || k < 0 || k > MACRO_MAX_PARAMS || !Array.isArray(m.body) || !Object.hasOwn(PRIMS, m.body[0])) return null;
  const types = new Array(k).fill(undefined);
  let size = 0;
  const walk = (node, want, depth) => {
    if (++size > MACRO_MAX_SIZE || depth > MAX_DEPTH) return false;
    if (isParam(node)) {
      if (node.param >= k || typeof want !== 'string' || want === 'text') return false;
      if (types[node.param] !== undefined && types[node.param] !== want) return false;
      types[node.param] = want;
      return true;
    }
    if (isLit(node)) return typeof want === 'string' && want !== 'text' && Object.hasOwn(CHECK, want) && CHECK[want](clean(node.lit));
    if (!Array.isArray(node) || typeof node[0] !== 'string' || !Object.hasOwn(PRIMS, node[0])) return false;
    const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
    if ((want !== undefined && p.out !== want) || n < ts.length || (n > ts.length && !p.rest)) return false;
    if (n === 0 && !['sense', 'memory'].includes(p.family)) return false;
    for (let i = 1; i <= n; i++) if (!walk(node[i], i <= ts.length ? ts[i - 1] : p.rest, depth + 1)) return false;
    return true;
  };
  if (!walk(m.body, undefined, 0) || types.some((t) => t === undefined)) return null;
  if (m.in !== undefined && m.in !== null && !(Array.isArray(m.in) && m.in.length === k && m.in.every((t, j) => t === types[j]))) return null;
  const out = PRIMS[m.body[0]].out;
  if (m.out !== undefined && m.out !== null && m.out !== out) return null;
  const body = JSON.parse(JSON.stringify(m.body));
  return Object.freeze({ name: m.name, body, in: Object.freeze(types), out, family: PRIMS[m.body[0]].family, params: k, size });
}
/** Load macros: the registry becomes exactly the valid macros given (the first of a name wins, MACRO_MAX at most); their names. */
function macroLoad(list) {
  MACROS.clear();
  for (const m of Array.isArray(list) ? list : []) {
    if (MACROS.size >= MACRO_MAX) break;
    let e = null;
    try { e = macroOf(m); } catch { e = null; }
    if (e && !MACROS.has(e.name)) MACROS.set(e.name, e);
  }
  return [...MACROS.keys()];
}
/** The loaded macro of a name ({ name, body, in, out, family, params, size }), or null. */
function macroInfo(name) { return typeof name === 'string' && MACROS.has(name) ? MACROS.get(name) : null; }
/** A node with every loaded macro node replaced by its body, the arguments in place of the parameters (primitives only). */
function expandMacros(node, depth = 0, env = null) {
  if (depth > MAX_DEPTH) return node;
  if (env !== null && isParam(node)) return node.param < env.length ? env[node.param] : node;
  if (!Array.isArray(node) || typeof node[0] !== 'string') return node;
  const args = node.slice(1).map((c) => expandMacros(c, depth + 1, env));
  const m = Object.hasOwn(PRIMS, node[0]) ? null : MACROS.get(node[0]);
  return m && args.length === m.in.length ? expandMacros(m.body, depth + 1, args) : [node[0], ...args];
}

// ---- guards (the SENSE face of a cell)
function featuresOf(q) {
  const s = typeof q === 'string' ? q.slice(0, MAX_TEXT) : '', l1 = norm(s, 1);
  return { l0: norm(s, 0), pad: ' ' + l1 + ' ', words: splitW(l1), nums: numbersIn(s).length, colon: s.includes(':'), quoted: quotedIn(s).length > 0 };
}
/** Whether a guard feature is well formed (a known kind with an argument of its kind). */
function featureOk(ft, depth = 0) {
  if (!Array.isArray(ft) || depth > MAX_DEPTH) return false;
  const [k, a] = ft;
  if (k === 'has' || k === 'starts' || k === 'ends') return ft.length === 2 && typeof a === 'string' && a.trim() !== '';
  if (k === 'hasAny') return ft.length === 2 && Array.isArray(a) && a.length > 0 && a.every((w) => typeof w === 'string' && w.trim() !== '');
  if (['nums>=', 'nums==', 'words<=', 'words>='].includes(k)) return ft.length === 2 && Number.isInteger(a) && a >= 0;
  if (k === 'colon' || k === 'quoted') return ft.length === 1;
  if (k === 'not') return ft.length === 2 && featureOk(a, depth + 1);
  return false;
}
function featHolds(ft, f, depth = 0) {
  if (!featureOk(ft, depth)) return null;
  const [k, a] = ft, n = Number.isInteger(a) && a >= 0;
  switch (k) {
    case 'has': { const p = typeof a === 'string' ? norm(a, 1) : ''; return p ? f.pad.includes(' ' + p + ' ') : null; }
    case 'hasAny': return Array.isArray(a) ? a.some((w) => featHolds(['has', w], f) === true) : null;
    case 'starts': return typeof a === 'string' && a.trim() ? f.l0.startsWith(a.trim().toLowerCase()) : null;
    case 'ends': return typeof a === 'string' && a.trim() ? f.l0.endsWith(a.trim().toLowerCase()) : null;
    case 'nums>=': return n ? f.nums >= a : null;
    case 'nums==': return n ? f.nums === a : null;
    case 'words<=': return n ? f.words.length <= a : null;
    case 'words>=': return n ? f.words.length >= a : null;
    case 'colon': return f.colon;
    case 'quoted': return f.quoted;
    case 'not': { const r = featHolds(a, f, depth + 1); return r === null ? null : !r; }
    default: return null;
  }
}
function guardHolds(guard, f) { if (!Array.isArray(guard)) return false; for (const ft of guard) if (featHolds(ft, f) !== true) return false; return true; }
/** The guard features of a prompt, computed once and handed to guardWith for every guard tried on it. */
function promptFeatures(q) { return featuresOf(q); }
/** guardOk on the features of a prompt (promptFeatures): whether every feature of the guard holds. */
function guardWith(guard, f) { try { return isKv(f) && guardHolds(guard, f); } catch { return false; } }
/** Whether every feature of a guard holds on a prompt (an empty guard holds; a non-list or a non-string prompt does not). */
function guardOk(guard, q) { try { return typeof q === 'string' && guardHolds(guard, featuresOf(q)); } catch { return false; } }

// ---- cells
function runCellF(cell, q, f) {
  try {
    if (!isKv(cell) || !guardHolds(cell.guard, f)) return null;
    const v = evalNode(cell.pyramid, q, cell.mem);
    return typeof v === 'string' && v.trim() ? v : null;
  } catch { return null; }
}
/** Run one cell on a prompt: a non-empty string, or null (guard false, a null in the pyramid, an empty text). */
function runCell(cell, q) { return typeof q === 'string' && q.trim() ? runCellF(cell, q, featuresOf(q)) : null; }
/** The cell id: "n-" and the first 8 hex of the sha256 of canon({ guard, pyramid, mem }). */
function cellId(guard, pyramid, mem) { return 'n-' + sha256Hex(canon({ guard: guard ?? [], pyramid: pyramid ?? null, mem: mem ?? null })).slice(0, 8); }
/** Build a cell of the NEO shape from its parts; id, height and size are computed. */
function makeCell(spec) {
  const s = isKv(spec) ? spec : {};
  const guard = Array.isArray(s.guard) ? s.guard : [], pyramid = s.pyramid ?? null, mem = isKv(s.mem) ? s.mem : null;
  return {
    id: cellId(guard, pyramid, mem), task: typeof s.task === 'string' ? s.task : '', gen: Number.isInteger(s.gen) ? s.gen : 0,
    parents: Array.isArray(s.parents) ? s.parents.filter((p) => typeof p === 'string') : [], guard, pyramid, mem,
    height: heightOf(pyramid), size: sizeOf(pyramid), fit: isKv(s.fit) ? s.fit : { ok: 0, fired: 0, rows: 0 },
  };
}
/** Check a cell against the NEO shape: { ok, errors }. */
function checkCell(cell) {
  if (!isKv(cell)) return { ok: false, errors: ['the cell is not an object'] };
  const errors = [], c = cell;
  if (!/^n-[0-9a-f]{8}$/.test(String(c.id))) errors.push('id is not n- and 8 hex');
  else if (c.id !== cellId(c.guard, c.pyramid, c.mem)) errors.push('id is not the hash of guard, pyramid and mem');
  if (typeof c.task !== 'string' || !c.task) errors.push('task is not a word');
  if (!Number.isInteger(c.gen) || c.gen < 0) errors.push('gen is not an integer from 0');
  if (!Array.isArray(c.parents) || !c.parents.every((p) => typeof p === 'string')) errors.push('parents is not a list of ids');
  if (!Array.isArray(c.guard) || !c.guard.every((ft) => featureOk(ft))) errors.push('guard is not a list of known features');
  if (c.mem !== null && !isKv(c.mem)) errors.push('mem is not an object or null');
  if (!Array.isArray(c.pyramid) || !wellTyped(c.pyramid, 'str')) errors.push('pyramid is not a well typed node to str');
  else if (familyOfName(c.pyramid[0]) !== 'render') errors.push('the apex is not a render primitive');
  else if (!leavesOk(c.pyramid)) errors.push('a leaf is not a sense or memory primitive or a literal');
  if (c.height !== heightOf(c.pyramid)) errors.push('height is not the pyramid height');
  if (c.size !== sizeOf(c.pyramid)) errors.push('size is not the pyramid size');
  if (!isKv(c.fit)) errors.push('fit is not an object');
  return { ok: errors.length === 0, errors };
}

// ---- the colony: thousands of cells behind an inverted index
function indexWords(guard) {
  const out = new Set();
  for (const ft of Array.isArray(guard) ? guard : []) {
    if (!Array.isArray(ft)) continue;
    const phrases = ft[0] === 'has' ? [ft[1]] : ft[0] === 'hasAny' && Array.isArray(ft[1]) ? ft[1] : [];
    for (const p of phrases) if (typeof p === 'string') for (const w of splitW(norm(p, 1))) out.add(w);
  }
  return out;
}
/** A colony over cells in their given order: { can, answer, explain, size, touched, stats }. */
function makeColony(cells) {
  const list = Array.isArray(cells) ? cells.filter(isKv) : [], index = new Map(), always = [];
  list.forEach((cell, i) => {
    const ws = indexWords(cell.guard);
    if (!ws.size) { always.push(i); return; }
    for (const w of ws) { const at = index.get(w); if (at) at.push(i); else index.set(w, [i]); }
  });
  const reach = (f) => {
    const s = new Set(always);
    for (const w of new Set(f.words)) for (const i of index.get(w) || []) s.add(i);
    return [...s].sort((x, y) => x - y);
  };
  const colony = {
    size: list.length,
    touched: 0,
    stats: Object.freeze({ indexed: list.length - always.length, always: always.length, words: index.size }),
    explain(q) {
      if (typeof q !== 'string' || !q.trim()) return null;
      const f = featuresOf(q);
      for (const i of reach(f)) {
        colony.touched++;
        const r = runCellF(list[i], q, f);
        if (r !== null) return { id: typeof list[i].id === 'string' ? list[i].id : null, index: i, answer: r };
      }
      return null;
    },
    answer(q) { const e = colony.explain(q); return e ? e.answer : null; },
    can(q) { return colony.answer(q) !== null; },
  };
  return colony;
}
/** The manifests without fn, in registration order: [{ name, family, in, out, words, lazy?, rest? }]. */
function listPrims() {
  return Object.entries(PRIMS).map(([name, p]) => ({ name, family: p.family, in: [...p.in], out: p.out, words: [...p.words], ...(p.lazy ? { lazy: true } : {}), ...(p.rest ? { rest: p.rest } : {}) }));
}
const PRIMS = buildPrims();
const ARGS = Object.freeze(Object.fromEntries(Object.entries(PRIMS).map(([k, p]) => [k, Object.freeze(p.in.filter((t) => t !== 'text'))])));
// </KERNEL>
// the facts the cells read (grow/know.mjs packs, only the columns the cells name)
knowLoad([{"id":"fr-tidytuesday-weather-07bc7b","columns":["date","min temp c"],"n":12538,"cols":[{"f":"01991-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|36-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|37-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|38-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|39-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|02000-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|31-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|36-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|37-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|38-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|39-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|210-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|31-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|36-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|37-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|38-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|39-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|220-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|31-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99","sep":"|"},{"d":"22.1|22.4|21.1|23.7|19.5|18.2|19.4|19.3|20.8|21.5|21.9|22.5|22.7|20.5|21.4|22.2|21|21.3|23.5|23|19.6|17.5|17.8|20.6|18.8|20.9|22.6|22.3|19.8|21.7|21.8|18.5|17.9|20.7|20.2|20.3|19.9|19.1|18.3|16.6|16.4|18.6|20.4|20|17.7|17.6|16.7|18|19|15.6|16.1|15.8|13.1|15.9|16|18.1|12.4|13.9|15.2|17.1|15.3|13.6|14.6|15.4|12.9|11.1|14|15.5|14.1|14.3|14.7|11.2|10.3|14.8|12.5|13.8|11.3|10.5|14.2|14.5|10.7|9.1|9.7|10.9|12.6|11.7|12.8|13.4|13.2|12|12.1|16.2|12.7|13.5|14.4|10.8|9.2|13.7|16.3|15.7|14.9|9.8|13|11.6|11.8|12.3|9.5|11.9|7.8|10|11.4|11.5|10.1|7.9|10.2|9.4|9.9|8|7.7|5.8|7|9.6|8.9|7.6|8.2|7.3|4.8|8.3|8.6|6|11|9|6.4|5.5|6.8|8.8|6.1|6.7|6.9|7.4|7.1|8.1|13.3|12.2|10.6|20.1|16.9|17.4|16.5|17.3|19.2|15.1|16.8|18.7|18.4|17.2|18.9|21.2|10.4|5|8.5|8.7|6.3|4.7|4.5|8.4|9.3|5.6|7.5|6.5|17|19.7|23.8|22|15|5.4|5.7|6.6|22.8|24.6|24.2|21.6|6.2|7.2|3.3|5.2|5.1|4.3|5.9|26.1|23.4|24.5|24.4|4.1|5.3|24.3|23.2|23.3|23.9|22.9|25.3|3.5|23.1|24|24.8|26.4|4.9|3.9|25.1|25.2|26|24.7|25.9|25.7|27|3.1|3.2|4.6|2.5|3.6|4.2|2|0.9|2.9|1.5|3|2.8|3.4|2.6|4|2.7|4.4|2.2|3.7","i":"0,1,2,3,4,5,6,7,8,9,a,8,b,c,8,d,d,d,e,f,g,h,e,i,j,h,k,g,l,m,9,n,o,p,q,1,a,a,2,r,9,h,s,0,t,u,5,v,w,x,y,m,k,z,10,p,8,11,12,13,l,14,15,16,2,17,10,x,18,19,1a,5,w,1b,7,1c,17,g,11,12,1d,1e,1f,1g,12,1h,5,1c,1i,1j,14,1k,1l,1m,1h,14,l,1n,1o,1p,1q,1o,1i,1r,1s,1t,1u,1v,1w,1x,1y,1z,20,21,22,1x,23,24,25,22,26,27,1s,28,29,2a,2b,1u,2c,2d,2e,2f,1g,2g,2h,27,1w,2i,22,2j,1i,2i,1w,2k,2l,2m,1v,1w,23,24,2n,2o,2p,1g,2k,2q,1h,1x,2r,2s,1m,26,2t,2u,2v,2w,2v,2x,29,2y,2z,2z,30,22,2b,2s,2c,31,23,32,2t,33,24,34,2e,25,35,36,2g,25,37,2b,38,39,2b,2a,3a,3b,3c,2a,2o,3d,3e,3f,3g,3h,3i,3g,3d,3j,3j,3g,3k,3l,39,1p,32,2y,3m,3n,37,3o,3p,2t,31,29,3e,3q,3r,3s,2o,28,2o,25,30,3r,3t,3u,2x,3v,36,3r,3n,3w,3j,3r,3w,3x,33,24,3y,38,33,3w,3j,3c,2g,1t,2v,2c,2d,29,3z,36,35,40,2o,24,40,40,2k,1s,2b,2d,1k,1v,1p,3y,19,21,3y,1s,1u,3m,2r,1p,1w,41,2c,2n,2l,1q,42,43,1d,27,21,2l,1g,3y,34,2l,v,26,2x,2r,18,1d,2s,1f,2s,2u,2k,2k,1s,1f,1q,2i,44,2m,2l,1h,1c,23,2w,1s,1y,1a,1b,45,1e,1e,1y,1u,1p,21,46,47,26,1n,45,1a,w,1e,13,m,1r,1n,42,1d,1w,1q,48,13,2q,44,2s,m,43,1c,s,7,w,18,49,o,5,1b,1r,1r,48,5,v,m,1r,1n,o,1a,4a,2q,13,19,1b,4,p,9,c,12,4a,v,19,1i,4b,48,14,4c,y,41,n,4a,s,s,4a,4c,15,9,4d,y,15,48,2m,1l,w,d,1j,y,p,d,49,47,48,1n,2q,48,4a,1b,k,y,17,12,4,10,18,18,1i,1o,49,44,o,46,w,44,5,1f,19,1j,19,1a,k,4c,l,4c,7,4a,19,44,4,1c,v,19,2j,1n,1h,1q,2u,1k,1l,1u,1e,13,45,1f,1f,2s,2u,44,27,1y,1w,2k,2b,1r,1n,1s,27,27,2e,2u,2m,2c,3y,1y,1o,1w,1e,1m,1e,23,32,36,2n,2h,1k,20,24,1k,1z,2i,2n,30,1t,4e,40,1g,1s,2k,2z,2u,2z,3g,4f,3x,4g,4h,3u,3o,35,2b,2n,2z,3e,2n,3q,4e,24,2y,3m,38,4i,3c,3u,38,25,1s,2h,3d,20,24,24,1q,25,4h,3r,3n,30,29,3r,3s,3j,4h,3l,3f,2t,1k,36,3j,2o,3t,4j,3j,3b,36,4k,4l,2b,3g,34,24,35,3h,28,33,1l,1t,30,31,3u,33,2o,34,2b,2n,39,2a,1t,4l,4m,4i,4n,3i,3v,4l,35,4o,3g,3n,2b,3m,20,20,3k,3k,3r,35,3h,1t,20,39,3w,1t,3a,3o,3z,37,2t,20,36,3k,4p,2z,2n,3z,1r,25,28,3n,2p,2o,2n,1k,1z,23,1s,1p,1y,1x,1e,2i,2g,3y,2i,33,23,2e,27,43,1l,2c,25,32,2e,32,22,47,1v,13,2r,1n,m,v,1r,14,2p,1t,2s,26,2h,1d,1l,2i,22,2c,2e,1w,1y,4b,45,1a,49,7,1x,27,26,1e,21,2u,3y,2s,2u,23,1x,1q,v,18,42,45,1e,1m,2r,21,2s,1a,46,1j,w,4q,5,m,15,1c,7,41,41,a,6,5,w,1f,2q,46,4c,46,o,o,4a,48,l,18,19,1n,k,6,11,7,4,4r,a,n,7,2,u,4r,z,9,4s,4,y,8,8,h,4,z,a,t,4t,f,s,y,17,8,8,y,f,11,6,4c,16,17,15,15,49,10,13,2m,1q,2j,18,2,17,4b,2j,2j,2j,21,19,6,w,15,4q,45,42,14,42,43,19,7,4,m,27,1b,l,1i,1a,4a,v,5,49,2j,1v,1o,3y,1u,1o,21,1i,6,1y,1r,42,1f,47,1o,2q,19,44,48,1o,4u,2p,2l,2c,1x,1q,2s,4b,2s,1p,3y,14,1f,32,36,2w,1y,2m,3m,1u,2f,2m,2p,1k,2i,2s,2h,33,2w,2h,1g,2k,4h,3r,28,2c,4h,3r,2n,3z,2d,3m,2c,1h,1w,2g,25,3d,2h,3z,4e,36,30,3j,4e,40,3k,3r,3t,4n,3u,4g,2t,3m,2t,4g,2t,3u,3v,4v,3w,2b,2y,2a,2y,3h,2t,2e,3y,23,32,33,26,4h,4l,22,1z,2v,32,3n,2w,25,2n,2t,3j,3s,3p,3k,2c,38,2o,4p,2t,37,2w,4w,29,37,4l,34,3q,3l,36,3e,2n,34,3w,3g,38,28,2h,29,34,25,39,40,28,2y,4x,4e,2y,24,1k,2i,33,40,1y,2m,1z,4e,2y,4g,4e,3z,2q,2n,4m,4m,1k,23,3d,1t,2v,24,3r,1u,25,29,3h,2n,2t,33,3g,1t,1k,2e,1w,44,23,4b,2i,3e,25,2p,48,1d,2t,2d,20,2d,27,1p,21,1l,2l,1p,2e,2e,22,1u,1n,26,26,2u,2q,1y,2m,23,1e,2e,2g,2w,2b,33,1l,1o,1p,22,2i,14,19,13,1h,1i,5,p,4,1v,1v,1r,1f,1p,26,1r,l,45,1a,18,a,18,o,48,4q,48,43,13,1b,43,18,7,1j,4y,5,4b,18,1n,1c,15,41,4c,4c,1b,42,26,1x,13,48,18,17,41,4z,7,1c,2,4d,50,11,4,2,41,e,2,v,11,9,2,t,g,d,18,18,1n,1j,1c,o,y,4c,11,d,1c,d,41,k,d,d,u,51,e,t,51,x,h,h,2,n,16,41,v,m,4b,2q,1b,1b,8,o,1v,48,1n,42,4q,14,1b,v,4c,v,4c,13,4c,1l,1g,21,1h,1e,14,2j,1e,2r,1w,1u,1r,4q,13,42,1f,1i,4b,1a,1a,44,18,m,1v,13,1n,5,1a,1q,1q,1o,20,2i,44,13,1r,1m,1o,1w,2p,47,22,4u,2f,2m,2s,1d,1v,4b,4q,44,2p,1a,1v,1p,2k,2n,33,2f,34,34,2d,2y,2t,36,4h,3f,1k,1k,31,39,22,3z,28,26,1y,23,2p,4m,29,2z,2n,1y,1k,40,2h,2c,2i,1l,34,25,3k,3h,3n,4g,2a,3v,30,3r,2o,25,4g,3l,24,2v,2w,3d,29,1t,31,31,2b,2t,29,3r,2o,37,4h,3a,3d,4m,3e,31,2y,3j,4x,3o,3d,4p,4o,35,4w,4l,3r,3n,3b,4i,30,4h,3h,2o,4g,2o,29,4o,52,39,4i,2a,3q,3o,3n,4n,39,2f,39,3u,3i,3u,4m,34,3a,3d,39,1t,35,53,39,3n,20,2b,1l,25,3e,2a,3n,2c,32,2f,28,2t,25,28,31,25,21,33,2b,2o,3a,35,1g,4l,31,3t,32,3x,4e,30,29,2t,3z,33,34,1x,32,3e,2e,2t,13,3z,2b,4g,26,3y,33,2i,2o,2e,2h,1r,1v,2s,2c,22,2k,1t,2c,1l,1y,42,2m,2u,1y,47,33,24,1s,2p,4u,44,2w,23,1q,1q,44,14,13,2m,1d,1i,1h,45,4,1c,1w,1o,1e,4,15,u,l,1d,16,1d,1f,2q,1f,1e,1n,4q,49,1q,21,2i,1u,o,15,l,1b,43,16,e,g,y,h,2,7,o,19,1o,s,s,1c,w,7,4c,48,o,16,p,4r,43,1o,12,v,w,1b,42,11,1c,17,10,8,2,g,l,4b,1e,2q,m,14,4,5,17,n,4a,1m,4c,46,8,9,18,2j,48,46,5,17,7,s,z,10,41,6,12,15,12,2j,1c,1c,1i,w,15,17,46,12,m,49,v,2,n,4d,8,o,45,1x,13,1p,43,2q,47,43,4c,1o,23,1y,2j,2j,4q,4b,1i,1e,1y,21,1l,1l,2x,2g,2d,26,2k,2c,34,1s,2e,2k,1x,1p,1e,4u,1f,1o,2z,2x,1d,2c,22,2v,1u,1x,2d,1u,2p,1y,47,1n,43,w,2f,22,1s,26,1w,1p,47,2h,21,4b,4q,1k,2v,1r,1v,1q,1l,1u,2m,26,2u,1o,22,2t,28,2h,2n,1t,28,2i,2n,2h,4m,30,38,3m,21,2s,1s,33,34,35,4e,38,2o,3h,3d,29,4o,3d,34,3l,3g,30,36,2i,2t,3a,2b,3n,3a,3r,54,55,3g,56,3q,57,39,34,38,2w,4h,3k,4l,2v,3d,3u,4k,3k,3d,4m,3h,55,3v,4h,3g,3l,3c,39,58,3h,30,4g,3h,3h,3c,3q,4h,3a,4v,3o,4p,4x,35,36,3m,4e,35,27,2m,20,1w,22,1a,1n,2c,20,33,1x,1u,2p,32,2n,2v,3w,3v,55,2o,2i,2b,2z,3j,2n,23,2e,2f,1u,1l,1d,2k,3m,3d,2v,1u,33,25,3h,1z,37,22,2m,26,2z,4e,1l,24,2f,1k,3m,1l,1r,14,2f,22,31,2d,1y,3z,48,27,42,2k,1y,22,2p,1g,1s,2j,27,2c,33,2r,17,l,1r,21,1o,1u,2x,4b,45,1v,26,2j,1i,45,l,4q,4b,2r,21,1v,1e,2l,1y,1q,48,1e,9,41,k,42,2l,48,5,48,1p,m,1j,6,1e,22,2e,1u,2r,43,48,43,1q,1d,1i,1x,47,2f,4u,1t,2q,l,4b,4,e,d,u,11,v,v,46,v,46,4,4a,1c,15,49,m,1c,x,y,s,8,n,4r,1c,4r,49,e,12,45,15,1n,6,6,p,m,o,4r,n,8,n,16,1h,1r,47,44,27,44,19,m,42,1v,19,4c,w,5,v,5,1j,1d,1b,41,o,4q,1b,6,n,46,1b,1j,m,4q,4b,1n,45,1a,4q,5,11,4c,1l,3y,2r,1u,2q,21,l,4a,1e,1e,4q,1r,19,49,2m,26,1o,1x,2u,14,1b,2q,1p,27,2h,2h,2s,1w,2p,1s,2v,24,3d,4m,2o,25,26,2f,27,3y,2e,1v,2e,1u,1a,1i,45,1b,43,19,3y,13,1r,2g,1g,1h,1y,2p,2z,1x,21,26,2p,26,2i,2o,28,28,40,2x,3e,4m,36,31,53,4g,2k,2p,2f,1l,39,3r,3n,3t,25,2c,2x,2d,28,3x,2h,4e,4m,31,2o,4m,30,2n,1k,4m,2t,34,2a,3f,33,4m,3j,3x,3o,2t,1k,25,3d,53,4l,3q,55,3s,3e,4l,39,4x,3l,39,1t,2o,2a,3j,2d,3k,3d,2v,3y,36,39,29,2y,24,33,1g,2d,3u,31,3j,3b,4l,55,3h,3l,4e,24,20,3a,3s,3q,4p,4w,3b,29,3h,4x,4m,4e,1l,2i,2e,2d,2i,2b,31,38,2b,40,3k,2d,34,32,37,1p,2a,2b,2b,2u,1c,26,1m,1a,34,36,4x,2u,31,31,2i,23,26,2s,1k,20,20,31,2x,44,1p,23,2w,2f,1n,1f,2v,2p,2g,27,18,4u,1u,2z,24,4m,23,40,23,1o,1r,1o,1d,1g,2m,26,1m,1o,1i,2g,1k,3y,21,23,2i,4e,1g,26,b,4u,1v,19,1v,2e,2u,2p,2n,2b,22,2x,2q,1i,18,44,14,1r,g,4q,w,18,o,y,2q,27,1e,w,1h,2p,21,22,1f,12,42,1o,2j,1v,2j,4,1i,16,7,43,48,49,45,1n,44,2l,1v,4q,1a,15,e,1v,1a,l,18,1e,2q,1y,1n,6,18,l,4b,5,1b,4c,41,10,k,1c,y,2,10,k,1c,45,6,1b,48,1f,4a,16,1c,51,50,4r,11,4,d,7,v,4d,p,d,v,x,d,r,d,z,10,41,11,1j,h,k,4,k,10,d,1c,s,5,1j,m,1c,v,12,4c,4c,48,13,k,l,1n,47,2s,4b,1h,l,4c,6,w,w,1l,1w,2l,4b,1q,2r,21,1k,1k,1y,2s,1d,23,1y,5,1d,1m,1y,1n,1q,21,21,1o,42,1a,2l,1y,47,2u,2p,1y,1m,13,4q,2j,1a,2q,1p,24,2d,2c,27,2k,2t,2z,1q,1f,2f,1q,23,27,2d,1w,2f,1k,37,2g,22,23,32,34,24,20,30,3a,3m,2e,2l,2t,3k,3l,4n,56,1t,40,4g,3z,2v,3m,2v,2w,4m,3a,3g,3h,3v,1t,3y,29,4h,22,3m,31,4e,4e,33,1z,2t,2t,2e,39,38,3q,2n,36,3f,3j,29,3r,37,3a,3c,3o,25,3d,4l,1z,3z,3x,31,4m,3o,37,3d,31,20,3a,3u,32,2b,53,3l,4w,1t,3g,3a,3c,39,3z,3m,3f,28,2z,3r,37,4l,39,3h,3j,3w,38,3e,34,1s,1x,1k,33,2n,2v,25,2u,2k,40,24,2x,34,4e,1u,2e,2e,25,23,1p,1y,1s,1t,4e,36,38,32,2d,33,3v,4e,26,43,2n,40,1x,1l,1s,1x,2b,4u,2j,2p,3n,27,2i,1l,2g,3m,3z,32,2p,2v,1l,1q,44,43,2j,1v,42,5,4,2j,2j,1r,4q,1m,1d,1n,2q,12,n,4b,w,45,43,2q,19,1d,1s,4u,5,1n,43,11,l,s,1c,e,18,g,5,13,1b,19,1j,4r,y,1b,n,19,45,12,s,p,z,11,1n,11,41,7,41,59,k,8,41,8,11,o,m,17,k,41,d,t,1c,17,v,46,15,16,u,x,k,16,e,r,d,n,n,n,p,x,17,2,p,0,11,1c,11,d,4,0,4t,u,4t,a,5a,5b,j,5c,s,s,6,6,9,41,q,5c,4q,2m,1b,51,10,1c,4r,4a,4,9,0,z,x,k,6,x,8,4c,5,1n,14,19,1u,19,1c,g,4c,46,k,10,z,o,9,s,1,g,4r,11,10,48,d,10,d,19,w,2r,4c,44,7,v,v,k,4b,14,1e,k,2s,2c,1v,1u,42,2g,19,4q,1n,1e,1i,27,2u,2l,2f,1w,2l,44,2j,1m,1i,l,21,3z,22,2o,2o,4m,22,2r,4u,1e,1f,13,13,45,27,2x,24,3d,4e,22,2c,3x,4h,3v,53,3z,2z,1y,4u,1r,1x,1t,3m,4e,2k,1l,1u,1k,1z,1t,3e,34,2a,37,3u,35,1g,1x,2t,3e,2o,2t,3o,2o,53,4g,40,4o,4i,4h,3k,1t,3k,3e,2o,3t,3e,3v,3a,30,34,3v,4f,33,1t,2z,1g,38,4m,2w,28,2c,25,2p,29,3t,3v,3t,5d,3c,37,23,2p,2e,2f,1g,3r,3n,2y,28,3r,2i,2i,1k,2x,2w,2l,1o,47,3m,34,2o,1t,2g,2l,3v,3f,20,40,31,1g,21,4q,2z,36,2k,2k,3z,47,1h,2h,32,2c,3n,3g,3n,23,1a,47,1d,1e,42,2d,3m,2n,2x,23,2r,21,4r,z,1e,2f,1j,2v,2y,37,2v,2w,1z,1w,1k,38,27,2l,10,v,2e,1z,1z,2u,1s,27,2j,2q,20,2d,27,1p,2i,32,1l,40,2l,14,2s,5,1e,3y,2g,l,15,44,45,13,43,1m,1l,1g,2z,1m,13,1u,2r,48,2m,1a,2m,4u,1l,2g,1v,5,1f,1h,2r,12,7,m,z,8,g,4t,15,v,49,d,o,6,1c,5,11,v,14,1c,1m,19,1c,7,g,8,41,46,y,9,g,8,2,y,s,15,b,7,n,7,7,4r,7,16,p,4r,11,4,y,k,1j,d,z,16,z,k,n,15,11,16,y,o,51,k,o,h,h,4r,11,10,z,r,u,7,1j,1o,18,15,o,1b,s,1c,15,7,17,8,8,o,o,6,17,10,4r,13,m,11,4,k,17,4,46,4a,h,n,15,0,l,45,43,s,4d,4c,26,22,1f,4b,1a,18,1c,7,1o,4u,3y,2s,2q,1v,1p,2v,2m,2j,4q,1q,26,3y,2d,2s,2x,23,1u,2m,2w,2x,2d,2l,1u,1p,2e,3n,3r,36,26,2i,1g,26,3y,2u,23,24,2k,1v,35,4o,2o,4m,2o,1z,2p,26,1m,3y,2x,3z,2y,28,1u,1y,1g,2v,2h,2d,2u,2x,1s,1p,2u,2c,20,2t,3f,2y,3n,30,4x,3e,4e,3k,4n,3n,2i,1s,3m,2i,2x,2b,2n,28,2z,31,31,34,3g,3l,3s,3k,3d,38,4e,3y,2l,2f,1u,2g,3n,4m,33,28,3r,20,3k,30,3j,2w,2y,4g,3t,39,20,2t,4o,3l,39,4o,28,3g,36,1t,36,3g,4m,2x,4l,4l,30,3r,3x,3g,2h,2v,40,2d,25,4h,31,2s,40,27,2s,2l,28,1y,24,1k,48,20,2w,1z,3x,2w,34,3k,3r,3n,35,3y,2l,3d,3n,3n,24,2h,2c,4u,1s,44,2q,1f,2r,47,1r,26,1e,47,1m,3y,1p,3m,2z,4u,4,1w,26,1n,43,1e,1w,2l,1p,2h,4m,2b,1u,2p,22,1p,1l,2g,2c,1v,m,4u,1y,2p,24,22,2q,2r,1f,2d,2h,2w,22,2u,2j,1x,1p,22,2p,1k,2w,1q,1e,2r,4u,1p,2s,2j,1y,2h,2x,1m,2j,48,y,4b,46,46,v,d,18,48,1h,2m,44,1e,43,4r,1a,1f,23,3y,1f,18,o,42,o,46,12,19,2r,13,1d,1f,1m,15,44,1f,1i,44,44,1i,42,1n,l,l,19,14,s,1b,11,w,11,1j,47,1i,13,15,k,15,1j,1f,19,4a,4a,12,7,y,p,2,16,16,2,x,51,46,m,43,1v,m,m,v,7,16,9,g,d,6,11,n,s,4c,7,1h,46,10,v,6,11,1b,1j,h,6,10,x,x,s,d,4t,4d,h,d,4a,m,l,13,44,1r,1d,44,6,12,1n,42,46,1n,7,7,1i,1e,1o,44,1w,1o,27,1h,44,4a,13,1d,21,27,1g,22,3y,3z,2k,1v,1e,1d,1r,1d,1o,21,13,4a,43,19,1w,1y,2z,1t,26,1u,2z,1k,47,2v,28,38,22,4m,3w,2x,4h,39,3d,2h,25,2h,3a,3v,4h,3k,31,25,3r,4w,3j,4g,3g,3q,3b,3j,2v,2z,28,31,5e,58,2o,2t,31,28,2i,1k,20,4l,3o,3h,3v,40,25,4o,2c,2l,2k,25,28,3w,3v,36,3f,39,3n,39,3q,3x,4p,4m,32,2c,3r,3k,3n,3w,55,3v,2n,24,3c,3q,4l,3h,3v,3t,3h,3a,4p,3c,1z,3m,28,2g,4h,30,2y,2o,29,3e,3a,4g,36,20,4h,2y,3t,34,3k,3r,2t,3n,3k,38,31,2a,2t,2n,2a,30,1t,3k,3f,2g,2e,32,3u,38,3a,2a,1z,1l,31,2k,36,33,3z,1l,2f,2l,2m,2u,47,14,27,1d,2j,28,34,31,22,2k,2g,2j,1m,1u,26,1s,27,23,2g,38,1g,4u,1m,1l,21,1w,1w,13,4b,2p,23,2e,2x,2w,1f,21,1x,2r,2r,1h,4u,26,1l,2s,1o,4q,l,4q,48,14,4b,4b,1j,o,49,18,27,1r,5,5,2r,1a,l,15,d,41,1r,1y,42,1a,m,49,l,v,1o,1b,t,16,y,7,4a,45,4c,k,k,7,16,5f,2,16,17,10,42,5,m,4a,4q,1b,7,h,e,p,17,17,5,1j,1y,6,n,41,p,y,x,46,7,15,4,11,b,r,f,q,4y,9,h,h,6,7,16,51,e,0,2,8,1n,4c,h,41,49,8,1,d,4a,v,o,49,s,16,11,p,x,u,t,t,5g,h,d,4c,o,z,1c,y,8,8,16,4d,16,12,k,v,19,17,1v,48,45,46,1u,44,1v,4r,w,2r,1o,1i,2r,2s,27,1f,l,23,2u,4u,1v,v,1a,5,1i,1k,1q,1g,1l,1x,1q,1f,2j,v,48,2q,2k,1g,27,2f,2k,2g,1v,2r,1o,2s,3y,2v,2g,2l,1w,2m,2s,1l,2i,1t,3d,31,2z,1u,22,2v,2h,2b,37,2e,2b,2b,25,4l,37,40,1k,2d,4m,2n,2a,39,3x,4h,2b,1g,1m,2s,2x,26,2z,47,32,39,34,2n,34,3w,35,2o,2n,53,4o,3q,3t,32,3n,4l,3j,29,3e,37,1t,2t,4h,56,3w,3a,2d,2u,2h,2o,3m,20,31,37,37,37,2n,36,2w,3n,2y,20,2d,2g,2v,2k,2l,40,34,4l,3g,4h,2t,4m,3f,2t,2o,4l,3f,3x,3j,24,29,1t,3d,4m,3x,20,36,38,2o,30,30,2n,3j,3x,2x,33,2n,3e,4h,33,2a,2v,38,24,23,2x,2v,28,1r,2c,2b,1t,2y,2x,1f,1y,4u,14,3y,1x,1x,v,1g,3y,2z,2a,1g,4u,1e,1i,2d,2v,2h,22,2w,2d,3d,4u,22,3z,1y,2k,1s,2x,2k,1p,28,2x,2d,1w,l,4b,47,1q,4e,1a,1l,1q,47,1l,1v,26,2q,m,42,1q,2f,1g,1v,1z,1s,27,1h,47,23,k,2d,2e,1u,1w,2k,44,15,15,1b,2q,23,43,w,45,41,o,4q,2j,4a,1o,1d,43,44,1i,19,11,1c,43,5,5,4q,1j,k,10,o,17,49,12,1o,1h,48,46,46,8,s,43,42,1c,s,u,n,4c,v,l,m,4q,18,w,4b,42,1b,46,7,p,9,51,s,17,46,49,46,z,n,8,n,10,p,4r,1b,m,1b,m,2j,5,2j,4q,19,12,w,41,8,d,4r,l,5g,1j,46,11,4c,4r,v,o,18,1b,4a,49,5,4q,15,k,1b,w,2q,1i,6,45,2s,1h,45,l,16,4a,10,1b,1c,1v,1h,4c,4a,10,12,1j,4q,19,48,1h,1i,14,1y,2m,1o,26,19,1a,4q,1n,o,18,48,42,l,2j,1f,1h,11,13,1r,1f,13,1n,1y,1i,1l,3y,1r,1w,1s,1w,22,24,2b,2x,1d,2s,2g,2a,1r,2m,2k,22,2a,3m,36,2z,2k,2v,2f,2p,1k,36,29,1z,24,2w,34,2c,1t,3r,2y,39,2h,2j,2t,2b,3g,3k,2k,2b,1k,1q,39,34,2w,3f,3f,37,3j,4x,3c,29,4i,3n,4m,3d,3o,56,53,2y,32,1z,32,3s,3q,37,4x,4k,3i,39,40,52,3n,30,4w,3g,2t,4l,4m,3u,3n,3s,3w,3f,4x,22,40,30,36,36,3n,4m,20,28,24,37,3n,1u,1n,4m,3e,4m,4e,2o,2b,35,53,4l,29,24,29,2o,34,4m,2b,36,2w,3r,2l,29,2m,1i,31,23,27,3z,3m,32,4m,36,3j,2t,28,1s,14,3d,1s,2n,3n,2g,2b,3y,14,3y,25,2m,32,25,4g,3k,2t,3z,1i,2h,1x,y,1o,1x,23,40,21,1x,2m,2p,k,2v,42,1k,1e,1q,1a,1s,2e,1o,26,1u,3y,1s,4b,2q,42,2j,48,2l,2v,1u,47,w,44,1h,43,m,1a,1b,14,27,2r,4q,18,42,48,o,w,d,3,u,19,15,2q,2j,1u,49,k,1b,27,2g,1e,43,2r,2s,1r,43,4a,15,45,10,o,15,49,k,17,15,11,14,19,5,v,1n,49,1c,17,w,4c,m,11,16,41,z,4q,4a,1j,15,4c,45,43,5,k,9,d,w,11,4d,49,10,v,6,2,8,g,0,h,4r,17,7,y,k,16,g,p,z,8,9,x,n,h,51,r,1,z,1c,16,x,y,4d,16,41,p,1c,y,y,26,2p,1n,46,49,v,5,12,43,m,5,1b,45,43,19,m,1h,12,17,2j,l,1n,43,1d,1o,1a,4u,43,13,45,44,13,4b,1x,3y,2s,3y,2l,1n,14,1e,4q,5,4,2s,2r,1w,2m,2j,14,1f,1u,1u,2e,2j,21,1n,48,2s,1m,1i,4u,1g,27,2s,1d,2l,3m,1k,2l,1p,3z,21,1r,44,1i,2r,26,1m,1f,1p,1z,2w,2e,2e,23,26,21,2k,37,31,4e,47,2l,3y,1x,2w,2c,28,38,2a,2o,3d,1s,31,37,3d,38,4e,35,3j,2d,2o,4g,3w,28,2c,2u,1s,1k,3m,36,24,2b,3e,30,3q,4x,4h,20,36,36,23,3v,4x,3r,30,29,4e,2t,2h,2o,2n,2e,38,3e,3k,3v,55,3b,3w,4o,3d,3s,5d,29,2d,29,3q,3a,4o,30,2t,30,1l,1y,34,39,4m,40,3d,2o,3a,3g,2n,1p,2x,3a,3j,4o,52,24,3d,37,3g,37,37,3n,20,1k,2x,4m,31,40,2f,33,2x,3d,33,1g,21,33,2k,2v,2l,4,x,44,1e,22,2o,2t,36,1k,2m,2w,2v,2i,1s,2h,4m,2c,2y,4m,2a,2z,24,24,47,2s,23,47,1u,2e,27,2l,22,42,1x,3y,2u,1m,2i,34,3z,2w,3m,2i,24,4q,1h,1h,1d,1e,4q,1a,1h,33,1w,x,23,1v,2g,4q,4,19,1v,2l,2g,2p,1w,2l,3y,44,4a,w,l,l,10,44,44,14,1d,2l,v,11,7,1c,4b,1c,1j,4c,n,y,4,16,7,11,46,s,6,18,m,12,y,4d,p,d,4t,t,d,g,0,42,z,o,n,z,b,k,y,2,1c,4a,1b,g,r,e,1c,d,41,o,v,m,43,4b,l,11,5,v,1b,y,4t,a,5a,4y,a,f,5h,h,u,5h,10,6,46,44,5i,s,p,7,w,4b,19,2s,5,48,4q,14,1n,1n,8,d,12,10,17,12,7,4c,4c,43,4,46,1j,4b,5,4,49,12,2s,1o,4u,17,11,2j,m,44,1o,49,46,4a,w,19,1a,1h,2m,1x,1h,1n,45,1l,4q,43,19,1d,2u,27,l,1a,2q,1x,2h,2p,1x,1o,23,1m,2i,4e,2h,2t,2u,2e,1q,1l,2s,1l,25,1x,33,40,36,4m,2i,2i,1s,3x,3z,2g,32,1q,2s,2e,1t,4g,20,3e,4o,3v,3e,1u,2v,3d,30,4l,2t,3n,1k,2e,2o,4h,2k,2g,20,34,39,32,4h,34,2o,4m,3m,3e,4m,3n,3l,2a,4h,3e,2y,53,3m,3u,37,3c,3j,1z,2i,2l,4e,3r,2o,3v,3h,4v,3k,4m,2t,3v,4m,4g,3z,1k,2n,22,3h,3g,3k,4g,4h,4x,24,36,3e,3d,4l,35,20,3v,3e,4o,30,2x,3x,34,38,1t,2t,30,3n,2v,2d,34,25,2n,2p,3y,33,1q,2k,2a,3m,3r,3n,4h,3c,37,1d,1q,2w,34,4g,30,2y,3m,31,4e,2b,2e,2h,2o,2h,1a,1u,2f,1t,1w,1f,4b,2s,21,2f,3m,1x,2x,1w,2b,23,2k,27,2e,2r,17,o,1e,24,26,3y,2l,1r,1f,1d,26,44,1y,2r,18,2i,1g,3y,2z,1i,18,1u,2v,15,48,1h,2r,1f,1q,1m,1d,44,27,1q,2j,1a,14,r,1e,1i,3y,4u,1o,1d,2v,13,5,w,42,d,4q,44,13,18,1n,o,k,d,d,1j,43,15,w,m,1e,44,18,12,1b,45,m,4,8,6,45,m,1w,1w,1o,2r,48,11,15,s,d,4c,1n,45,4q,45,44,1b,11,8,d,a,45,v,4q,6,15,s,4d,e,z,p,4r,8,2,g,y,16,t,21,4q,1a,l,w,4a,z,w,m,11,7,1b,v,17,4a,17,n,x,6,41,10,1c,17,t,41,1j,s,y,s,2,4,47,3y,43,19,4,l,1j,15,7,10,z,45,18,l,4q,13,2r,2j,1o,1s,2s,1g,47,48,1i,2s,1w,21,45,1b,18,1o,l,5,46,19,1j,46,4b,1h,1n,l,42,1j,45,45,1n,2g,1d,4q,2r,27,14,1e,2j,1r,2f,4u,1g,3y,2p,1g,48,1o,2i,3z,3y,1e,1a,1e,1q,1u,1p,2f,2h,1k,25,31,3n,4m,2u,3z,4g,3d,2n,3x,3f,20,35,3e,3k,1z,1u,24,4h,2o,24,1y,2w,2t,2s,1z,31,4e,3g,2b,2i,2v,36,53,40,2u,2d,25,2i,26,1m,32,2w,4e,2y,3d,35,2o,24,2f,37,2d,3k,2d,4h,4l,38,29,3v,3u,38,3n,3a,5e,3o,22,2n,2i,3e,53,37,4l,53,3h,31,4u,3r,4p,3b,3r,4l,2z,3q,3u,3s,55,2v,37,3s,4x,4m,1u,28,4e,4l,29,34,3c,1s,4m,1t,1s,1a,29,2z,2o,2i,3m,2o,4g,2y,1s,2s,m,28,20,33,2h,4e,38,28,3n,25,3m,1t,2d,1l,1h,1i,1o,2g,4b,3n,32,1g,1w,1i,2s,13,2p,1m,2h,2k,3m,1r,1o,1e,1v,1x,26,1r,1r,1a,1a,1u,1y,5,l,2f,v,44,5,18,1j,s,7,6,e,o,l,4a,11,17,2,1m,1i,1o,19,1n,2m,1f,1z,1f,43,m,m,45,42,12,1m,2q,2p,23,21,2r,4r,1i,1m,p,45,f,1c,v,43,18,4q,18,12,13,z,s,l,1a,1y,1d,4r,1j,r,l,1n,z,x,4,4c,10,5j,7,n,1c,6,10,z,k,41,2,c,g,e,e,d,f,4t,p,6,41,4r,x,8,4d,41,e,a,a,e,4,p,0,c,a,9,x,5,7,4,s,46,12,8,7,n,u,4t,17,d,c,b,51,7,x,y,s,2,17,12,4a,p,x,h,v,12,z,41,17,4a,y,e,16,51,4d,e,11,41,e,y,7,1c,v,o,15,1n,21,o,7,1j,4a,l,2l,2e,44,13,1y,1w,27,1x,47,1i,l,15,14,45,1s,1k,13,4q,x,26,32,31,2m,2s,26,1l,2l,2p,26,1x,1u,2e,1q,1t,2c,2d,20,4l,1s,26,2i,24,2i,1u,1s,40,32,2l,3z,2u,2b,4e,28,24,2v,2h,1z,39,2o,28,2h,2t,38,2w,1z,3m,33,2v,2v,1s,2b,4l,4g,3v,4v,4o,4e,2o,2t,28,24,2w,2w,36,3x,2a,3g,3v,3q,39,4e,29,38,22,2t,3k,30,3u,3o,58,3d,2y,3h,32,23,2n,31,22,2n,20,28,2t,39,4e,24,40,28,24,2y,2a,3k,2o,3a,3u,35,1t,2v,2z,3x,4i,2b,4l,3j,4o,35,3g,3e,2w,37,2a,3f,3u,2y,31,2b,2d,2i,2y,2c,2l,47,2z,2f,2e,1i,2u,34,4e,2i,1k,2v,2z,2w,2c,3m,32,1p,1t,34,33,1u,w,28,2n,1b,23,2c,1p,2j,21,1g,1l,2y,2n,2m,2g,1w,1v,2f,2s,1g,2v,2u,2p,19,o,4q,1l,1i,44,44,1a,4u,22,2f,3m,1r,1r,1h,1r,2z,2c,1m,1r,1l,m,13,1d,2q,1y,47,1x,3m,1v,2j,1c,27,2j,25,2z,2b,27,42,18,5k,42,o,48,46,19,1c,11,1o,4b,k,1h,1v,2r,13,w,o,4c,15,l,4q,45,4c,11,42,1h,1l,l,4a,7,6,17,o,k,1p,2f,43,4c,43,48,o,o,15,l,o,o,x,41,4a,1a,19,e,4r,4a,4q,17,10,2,4d,41,0,f,10,q,n,x,2,13,4,6,4d,k,p,k,l,16,8,n,s,p,7,41,11,7,4b,4q,n,41,17,16,e,z,n,8,e,n,6,4,n,41,41,10,4t,b,4r,4,4,49,18,1i,d,4c,1o,1a,k,u,17,17,16,n,t,h,8,4b,l,48,2l,42,1i,1o,4b,1u,1d,45,1a,2j,2j,44,1e,1u,2u,1b,1g,3y,1d,13,4q,1v,1m,1b,2r,14,2q,1d,1v,1w,1y,1f,21,1o,47,3y,1o,18,2h,1g,1o,1m,48,13,1y,2z,1l,1l,27,1y,1x,12,4u,2k,1s,3z,34,3d,2y,30,4l,38,2f,1w,3x,4m,28,38,24,3z,33,33,2l,2l,23,2o,31,3f,29,34,3z,2f,2c,4e,29,3r,35,4x,20,28,1u,2y,3a,40,31,4h,2a,2d,25,3e,2t,4h,3c,2t,31,25,3a,3j,3g,4p,4v,5l,3u,3c,2t,34,2t,39,3a,3a,3a,2y,2y,4g,3f,3t,2h,2g,2p,39,3r,36,3h,3a,1z,2w,1l,2f,24,3n,2y,2n,3y,31,20,3y,2g,1g,22,2c,28,37,34,2y,2i,1t,23,2z,3m,2w,2c,3z,2c,36,2i,2v,20,2e,2i,2a,23,2w,2t,2h,2g,1t,2m,1g,2n,2n,31,1k,2d,47,2c,2u,2w,4q,1w,4u,4u,2k,1w,1u,4u,2l,2h,1h,44,2v,2y,2h,l,1g,1s,2f,2r,2r,44,42,2s,4q,45,1q,1r,9,47,1o,45,l,19,5,2f,27,2p,23,27,1y,2f,2e,1l,1i,45,43,14,1b,5,1c,5,49,4q,o,19,m,1b,l,42,12,1j,48,1c,o,41,s,10,49,11,k,12,43,14,1d,2j,6,18,m,42,46,k,r,14,13,1a,47,w,46,49,1j,4c,7,11,y,z,y,y,2,4r,p,4d,17,16,2,17,16,y,s,41,10,p,41,18,45,l,18,v,4a,41,s,51,t,n,8,z,p,2,4r,1c,49,1i,2q,l,4,1b,1b,4a,5,1j,m,15,4b,1j,11,k,1o,12,4r,5,11,47,27,1i,1v,1l,o,l,m,m,1m,11,l,1n,19,18,m,4a,4,w,7,15,4c,w,4a,7,7,4b,1i,4u,1x,1p,22,2l,1v,1d,3z,1t,1s,1i,1d,2j,1g,2f,2c,1q,2m,1q,1i,1i,1f,1r,2r,1m,1o,27,47,2j,2f,1o,3m,3d,2t,33,2v,2k,3m,4l,36,1s,2d,38,28,1x,2c,1s,1z,4e,1u,1x,37,2b,2n,2h,1s,1t,3z,2o,2b,28,2n,1k,32,34,2m,47,1f,1h,1y,21,2c,2p,1l,2k,1l,2d,3y,3m,3z,27,1w,2h,22,2l,2d,1z,4h,3d,3e,2o,29,4l,3j,30,2o,40,2a,3j,2b,2t,3d,2b,35,35,2y,4n,2t,28,4m,3j,3t,4g,39,2a,38,30,3r,36,34,30,3s,30,34,3g,3p,3m,31,37,4w,53,53,4o,3g,3t,3o,3u,4o,4h,3f,2t,2n,3v,4i,4x,3b,39,28,3d,30,3r,3u,38,31,2a,3w,2k,2o,3v,20,1k,1p,3z,28,34,3n,3j,55,3f,1w,4a,1a,1t,2d,32,2f,1a,3y,1k,1r,1t,2n,2v,2d,19,1z,22,2w,2s,p,1b,1r,13,20,1z,2t,3y,2m,2e,2s,1a,27,2d,2v,1h,2r,2q,1y,2n,34,2d,28,1x,w,48,1a,4b,49,43,2q,4q,1e,2p,1p,1i,o,1d,1e,1q,47,l,1b,17,1b,2r,1a,45,o,1h,15,33,1m,1e,1e,4q,49,15,1y,13,2q,1e,l,v,11,15,4q,w,11,19,42,5,18,1e,2u,1a,w,43,1v,26,48,m,19,2r,1b,s,4,16,v,w,2q,4q,4q,49,1c,1c,16,16,43,19,12,15,4r,s,5m,5,4q,4u,43,7,f,5g,5n,5o,10,g,2,y,41,41,x,y,a,g,4t,51,51,5m,u,2,k,l,w,12,18,1b,18,v,o,48,o,11,k,4,z,y,4r,15,l,16,7,d,4d,42,47,14,49,1c,17,6,17,4c,49,10,2j,1e,m,4b,12,4c,2q,1c,s,41,z,6,4q,47,5,4c,7,41,4,1c,18,1a,42,1f,26,1x,1i,1j,4a,19,1d,4u,2p,4q,1a,1n,43,13,2r,2f,1v,4q,24,2z,3y,2z,40,2x,23,32,1i,2i,1k,1y,2k,27,2u,2t,2a,2b,2i,47,1t,2h,1y,1f,13,44,2j,14,4u,2g,1w,3y,2l,2c,2l,23,2h,23,2c,2v,36,2n,1t,34,3k,3h,3a,3a,29,3n,2n,1s,1z,2g,26,1l,1p,3k,4o,3d,3g,2a,35,4e,2v,2m,3m,2b,2y,40,3c,29,3d,4m,3m,28,40,2v,4m,3c,3v,3m,4x,3f,3c,3k,2l,2n,34,3t,3h,2o,31,4m,30,3e,3r,3a,3c,3k,4o,3l,3d,3e,4k,4x,33,3k,3d,2n,39,4l,4u,3d,3h,2o,3d,2k,2u,2r,27,1k,32,3n,1u,2e,31,4m,3r,1k,1w,2f,38,2u,2w,40,2n,3n,2b,47,1y,1r,2l,1w,1n,2p,28,47,13,2q,1u,2x,1f,31,28,2w,3n,1s,1y,2s,2f,2c,3z,3d,2d,3m,2z,1z,2z,1i,1y,2p,2z,2x,22,2k,1k,2x,2j,1y,2j,1m,27,1m,1q,13,1a,45,1e,1e,4q,4a,4b,48,18,19,43,1m,14,1e,v,27,1h,48,5,4q,5,n,h,17,11,l,1c,k,x,4c,1c,42,1y,21,2m,1a,2q,4a,7,11,45,10,17,14,13,6,10,41,x,x,43,5,1c,y,18,e,e,w,4a,16,4,11,46,2,g,4,46,15,d,k,8,41,e,8,4d,c,10,2,d,g,14,1i,45,y,x,5p,d,d,51,u,51,6,2,4d,f,51,4d,51,b,2,2,e,8,p,16,j,r,4y,h,n,7,46,s,v,41,9,5g,17,7,1b,19,10,1j,w,1j,m,p,8,u,9,46,o,49,49,1j,1j,48,1i,42,44,m,45,d,z,k,4c,1c,7,4d,z,t,n,1j,1n,1b,45,13,1d,1m,4a,x,45,2r,18,26,1p,1k,2m,18,1d,1e,44,44,1i,1r,1f,12,49,27,3z,2d,2k,2m,2s,2l,42,1d,47,24,2v,1z,2x,2e,2c,24,36,2z,2x,2f,2p,2u,2l,2v,3z,2e,2k,2n,2g,2c,1y,3y,4u,1k,2k,2l,2h,2m,47,21,1t,24,34,29,31,3c,2t,36,2y,4g,4o,2w,3d,3k,2a,37,1s,1p,32,2f,2f,2y,3x,5q,5r,3t,3f,3j,38,31,36,2z,2v,2w,2d,3z,2b,1t,2l,20,4h,3r,3f,35,3d,29,3r,20,40,36,2y,31,1u,1t,1k,2p,38,3n,34,29,3w,3k,4g,3v,3q,2y,2n,3d,2b,3k,32,3z,3x,3f,1p,38,4l,39,2b,4e,2t,38,37,37,3d,34,31,22,4u,2l,47,1o,3m,3d,3d,30,2c,32,4o,2i,2u,2i,33,20,3k,28,1t,1t,3y,27,2v,2d,1z,1k,4e,2e,4h,2n,1r,1y,47,47,47,1r,1x,1y,26,44,1i,1f,1n,4a,34,28,32,1l,1l,1w,2m,1y,21,2m,2v,2x,1r,2p,14,15,1b,2c,2h,1w,1l,1x,2k,1i,45,1a,w,1j,11,n,t,1b,4q,1o,2q,2f,1p,2q,4b,1n,19,18,1j,1c,18,w,46,11,4,4,4a,7,6,z,a,51,18,42,5,7,1b,15,49,6,1e,2g,21,2q,1b,45,1r,x,1j,1e,18,43,4r,k,o,o,1j,13,46,49,d,h,4d,t,0,c,t,51,51,z,z,z,e,n,y,d,n,t,r,5m,9,16,12,4d,1,5s,5t,a,4s,5u,7,4a,17,7,16,1,41,z,4r,k,4d,4t,4t,5a,16,4a,4a,1a,w,10,1b,p,5j,49,w,15,w,18,w,18,k,16,d,4,8,17,4r,v,k,1c,7,1c,s,d,10,l,19,m,1n,1a,1j,5,7,43,1n,14,43,4q,1a,4b,1n,1m,1n,26,1k,1p,3y,1x,1v,14,2f,1s,3y,1w,2u,1m,1l,1n,48,44,2j,2j,2j,1f,1p,1g,1x,1l,2e,32,29,2z,2d,4h,4l,32,2n,29,30,29,28,2z,36,31,33,27,2c,2h,2h,3n,34,2c,2g,2m,1h,1r,2n,25,25,36,3q,39,4l,4e,2z,2k,2g,2m,47,21,2o,34,34,4m,3m,3e,34,3k,4g,30,52,2z,1p,2i,22,2z,2o,22,2w,20,32,3t,4n,53,3e,4p,3r,2o,3d,28,40,4l,3h,4e,2w,2v,25,4h,3h,3n,37,3u,3s,4k,3u,3w,4g,28,20,40,24,2k,3v,3h,3x,39,2v,3r,40,36,32,2x,2i,3r,1z,2e,1s,2k,3j,25,3n,2y,36,31,22,2t,1z,1s,1t,2z,22,2f,2d,2w,2w,3k,40,34,3o,3n,2l,34,22,1f,1s,42,2i,4h,2c,1y,2u,22,28,1g,1f,2i,37,2w,2z,1k,36,2k,1s,2c,2w,33,2w,25,1s,47,1n,1f,23,2u,1t,1s,27,44,47,4q,15,1y,1o,2q,13,19,1x,1m,27,21,1x,2l,2j,6,m,6,5a,45,1b,18,1b,18,45,1i,2j,w,k,43,5,1h,2q,2q,1b,1j,27,12,41,1i,1o,1w,2s,3y,2m,2p,2j,1m,13,4q,45,44,1r,1i,1y,1f,2s,v,18,4b,18,45,19,1b,46,o,19,43,4q,14,2s,1j,1c,17,11,49,19,10,a,4a,1j,1m,4u,4a,w,18,s,7,5,6,y,17,4,4,z,n,p,y,g,4t,5c,4c,1c,12,19,m,17,s,7,4r,6,18,13,18,1b,7,48,v,4r,15,z,46,15,44,46,5,d,4d,t,y,16,49,1j,4,17,12,2q,1h,2r,13,42,18,18,18,k,s,1c,1j,49,49,49,1j,43,1w,1o,1i,1i,15,45,1a,1d,1o,44,13,6,4c,l,w,5,2m,2i,2g,2s,2h,4u,2j,4q,42,43,4a,1n,1n,1a,4a,1f,2v,26,1x,47,1x,1y,2c,2u,1m,1g,3y,28,32,4e,38,1g,2k,2p,2b,31,3m,2k,25,25,4l,25,25,4m,29,4e,1x,36,2n,33,1g,2f,2w,2n,2l,1u,25,2y,2z,28,35,30,30,2w,2g,1p,2h,2v,1z,40,1t,3e,4l,3a,32,29,3c,3q,28,2d,28,38,3e,4l,3g,39,37,20,34,40,3n,4x,4e,2i,31,22,36,2o,3d,4h,3n,2y,3a,2d,24,1k,2d,3e,33,29,3r,31,3e,2y,3g,4h,4x,3w,39,4e,3a,4v,3n,4h,40,33,4e,4p,29,37,2t,3r,34,3v,4g,28,1a,2v,31,4h,3g,2o,38,1t,2o,4o,2o,4i,3o,25,1b,21,24,2i,4g,2e,28,2f,29,3d,31,3m,28,38,2b,2f,28,3n,3y,2i,26,3y,49,m,2n,40,2k,24,1k,5,1v,2c,22,2n,38,2g,3n,2a,2d,33,23,l,1y,26,1x,2c,2k,2c,37,1u,1i,2p,21,2f,4u,4u,14,1v,1q,1v,14,1j,1j,7,1b,2j,27,2z,1d,2r,1n,1a,1o,1d,2f,1o,2x,1h,1l,1v,5,o,5,1j,o,4r,4d,d,v,1a,2m,1x,4u,42,4,1n,13,4q,2s,1j,k,z,w,18,15,9,49,1c,x,p,41,w,2j,1n,18,15,1c,4,11,19,12,11,46,10,2,k,11,d,8,17,43,12,43,41,9,y,s,p,10,x,n,4d,4y,0,t,9,41,16,t,1r,1i,1b,19,12,o,7,y,d,10,6,6,4a,v,o,1b,12,1c,7,x,2,8,h,t,u,4d,x,1c,w,4,41,y,4c,12,4c,7,4r,16,4c,1b,12,z,12,m,1r,1x,13,1b,16,t,z,1c,49,y,n,19,2p,w,42,14,l,2r,1n,13,2m,2s,1r,21,2m,2j,1e,1v,l,44,1i,2m,2p,1l,2u,21,1s,1k,1s,2k,2k,23,1w,43,1m,1l,28,1l,3y,1s,2c,2w,2v,1z,1w,2g,1w,2p,4e,2u,3z,2v,25,2b,2d,2d,2d,23,2l,4h,31,3y,22,2z,2v,2l,21,2x,4e,2y,33,1y,1x,2d,20,37,2w,2n,2v,1s,1z,2a,2t,1z,40,34,4m,28,2n,36,2u,2l,2l,2c,1k,2v,4h,3v,29,2u,3a,39,53,31,38,2o,30,4h,2a,2k,2x,2z,2c,1m,3y,3j,3j,3f,2n,2o,4o,30,3u,4e,4e,2e,34,3w,38,4m,2a,1z,2a,3e,3r,25,3o,28,37,25,34,55,1k,4l,2x,3a,3g,3a,40,1s,3h,38,1z,3e,25,4u,1k,20,36,36,3m,2d,1g,1g,44,1f,1c,1g,2i,24,1u,1s,1m,1o,21,2i,32,2w,29,2w,1v,1w,2g,2b,3z,2p,2n,w,1z,2s,33,25,2x,1d,26,3z,m,1e,2x,27,2e,1t,34,5,2p,1t,2u,1y,49,g,48,2d,1l,2i,2r,27,26,2c,2q,1v,4q,1u,4u,40,2s,m,a,1o,4u,1v,26,2r,2q,1r,4u,4u,1i,1w,1b,1c,m,14,1o,1d,1w,1m,1c,1d,1u,2m,26,1a,v,1s,2x,1i,5,5n,19,1c,l,6,12,12,19,15,4a,k,h,v,5a,46,4r,7,1b,11,11,m,m,11,2,y,4r,46,4r,1b,48,v,45,o,49,17,45,10,n,z,6,7,n,n,x,k,n,11,1b,l,6,11,4a,46,41,x,d,4c,1j,43,1q,o,6,d,8,51,51,x,d,9,7,15,y,y,w,15,4c,w,o,4r,p,41,4,4b,6,10,4b,4r,1b,z,17,7,4a,15,s,7,6,p,1e,2r,43,s,k,45,s,k,19,10,8,15,11,6,v,4q,12,v,s,4c,5,5,43,1e,m,1c,1b,1n,1i,1e,1e,1m,1w,2r,1x,3y,2x,22,26,1b,1i,42,44,1o,1b,2f,2p,2v,25,4e,36,23,2l,2e,2x,23,4u,2f,3z,2b,1t,2k,22,22,2l,1l,2i,2x,21,2l,2e,2j,44,2l,1i,4u,1m,2k,3m,1t,2m,1w,1s,2h,40,1x,2d,28,38,1l,32,3d,2w,2x,3e,2x,2a,3d,28,25,2z,2n,34,2w,2t,37,2a,3k,52,3o,3x,31,2y,3h,3f,2o,20,3c,3j,3e,2t,2h,36,3q,2a,33,38,2y,2t,3f,4m,33,38,3j,3m,2h,2c,2m,39,3e,3h,53,3l,30,3n,3k,4h,3n,29,36,39,3d,3g,2u,2o,2k,2h,1z,22,1t,2b,38,33,23,2w,2z,2l,2x,3n,1p,3d,28,2w,3z,24,2y,2i,21,2h,23,2k,2n,1s,1q,2p,24,2o,39,2h,22,37,28,1f,2l,1p,3m,2m,1u,1u,20,2l,47,33,1d,4r,27,26,1w,2e,1h,4q,1g,24,2t,2d,2h,1s,26,4u,26,1u,21,48,1d,14,2g,21,21,1r,f,2p,2p,1d,1a,1e,3y,1u,44,l,14,1f,44,m,5,45,2l,1a,19,14,p,v,4q,s,51,45,4a,1n,1m,15,4,s,16,y,y,d,1c,4r,10,4,z,2q,45,1i,1n,5,1c,o,w,43,1a,46,10,8,10,z,5,49,18,17,1c,y,g,9,e,n,4,e,41,9,r,8,41,x,5m,9,4r,k,n,46,49,d,p,a,u,h,y,1c,15,1h,1r,42,14,18,15,1h,o,15,19,11,g,d,e,n,n,k,z,51,g,n,z,d,4d,d,x,16,41,10,41,7,8,k,4q,17,12,1i,v,z,o,8,16,11,4c,14,45,45,21,6,s,4c,17,41,10,16,13,4q,21,2s,1d,4b,45,12,15,49,1b,13,1q,2r,2l,1i,1o,1m,1q,2j,23,1w,43,11,1c,1j,2u,27,1x,2q,2l,2f,3z,3y,1g,23,2s,1r,42,12,1n,21,2x,33,2w,1t,3m,1l,22,2x,4m,2z,1x,2g,2i,1x,1r,23,2p,2g,3m,3n,2t,4m,2n,4u,2v,2n,32,3k,29,35,3x,4e,37,1z,3y,2x,2u,1t,2e,3r,2d,1r,21,2z,3m,34,3d,3x,4l,2w,28,1s,53,3k,4e,4h,31,3u,3e,56,4v,5e,4l,2o,3q,3s,3g,39,3a,2a,4f,3a,3u,3k,2a,4h,3v,2t,31,29,1t,40,3f,35,2o,3j,38,3r,2w,4p,39,52,4o,4o,3r,35,35,3n,52,3n,4g,3k,34,3e,2o,30,35,3x,3y,2m,1g,2f,1g,2z,40,36,3n,40,2o,3w,2h,22,3d,2k,1t,37,25,2c,40,37,33,1w,1w,2v,2w,2l,2l,24,2d,2f,36,3d,2i,2e,22,24,4e,1p,4u,1f,23,2j,2f,1f,43,14,1h,1y,23,47,42,1r,2q,4q,w,1b,12,w,4c,1b,1d,3y,4u,13,1h,27,2m,1y,13,2j,6,4a,w,m,4a,12,14,2m,1r,1j,l,18,1b,1d,1x,2p,14,45,x,11,w,1h,l,4q,1,13,4c,4r,18,11,4c,4b,1o,1w,13,1j,10,9,17,z,45,18,15,1b,41,4a,o,s,6,5n,15,49,1b,49,15,45,1a,4q,2p,47,48,w,k,4c,5,12,1a,1a,4q,m,4,f,10,4y,1o,1e,1j,1a,1c,e,0,b,c,x,k,41,d,4d,h,s,41,n,1b,45,s,10,16,11,1b,n,42,46,10,17,p,0,h,5,1a,4r,b,e,17,p,p,9,j,a,n,6,y,z,9,h,4,41,x,51,u,t,4y,h,f,51,g,10,46,y,44,4q,1a,14,2q,47,k,v,1c,4c,x,w,18,1r,1n,k,4a,6,17,k,5,45,2r,1f,18,4b,14,1i,l,12,13,4b,13,4b,2r,14,42,4u,1x,4u,1m,4q,v,12,2u,2v,2s,23,1s,2i,44,5,13,2h,2g,22,1z,33,2h,1l,3z,22,25,2g,2l,47,2z,40,22,3z,2n,20,3k,32,2z,24,2u,4u,48,1l,2x,1s,2l,3y,3m,28,38,38,33,3e,33,23,47,1y,2m,2u,34,2c,3h,3u,3r,2o,3c,3f,2o,29,3c,56,2o,4m,2c,1g,2x,2b,3y,1u,2o,3q,3o,4o,2e,2a,2v,1v,1w,2c,2g,3v,37,36,28,4h,4i,4g,3d,2a,25,33,1z,3z,25,3n,39,3r,2u,24,3u,3r,4m,4o,4m,37,2a,2n,1t,4g,3k,20,2h,2y,4l,29,3w,3h,31,47,28,1x,4u,3g,29,3n,33,1x,1q,1r,2i,2z,1l,47,1g,2e,38,2f,1g,36,1y,2k,4u,2f,2m,22,3m,40,2m,2w,22,1z,13,2h,2b,2g,1g,12,1w,2q,22,28,2c,2w,32,1y,v,22,1q,3y,1m,1f,24,24,38,2e,1v,21,42,12,1h,2c,1g,2x,47,k,1y,2m,4a,l,1h,1o,1c,4q,1v,1m,3z,2q,44,v,13,5,y,19,1y,21,48,12,6,15,l,1a,4c,7,m,16,7,1c,7,19,44,1c,10,p,5v,m,18,s,18,45,1n,v,o,1c,11,4r,y,h,x,q,b,5o,2,y,v,4c,7,1c,w,l,17,9,u,f,p,5u,u,o,4r,5w,d,p,46,15,6,5f,7,49,z,v,2,t,5a,a,p,p,j,5x,5y,1,u,8,9,c,5i,4a,z,43,m,51,z,43,1m,1x,5,4r,k,z,49,1c,4,41,49,41,y,11,11,w,19,18,19,1d,2s,4,46,10,e,n,4r,g,9,e,9,s,46,w,l,l,10,17,5h,1d,1w,18,1d,47,2m,22,2d,2e,2u,40,2i,2j,1q,2c,2h,2u,2f,3y,1n,2p,2c,1y,2g,1l,2q,1v,1t,28,3n,2x,3m,2x,1u,2z,2n,36,2v,3x,2b,3r,4l,1k,2w,2x,1g,38,30,36,2p,1f,2z,2z,2z,1z,36,2a,2a,38,20,52,34,53,30,40,31,39,3u,2o,2u,2c,1w,2h,20,2b,2i,4g,2u,2l,2w,2g,22,3t,38,52,3u,3p,4w,3s,3v,39,3x,4j,5z,60,39,31,4w,61,62,5q,63,4n,3e,3p,3p,3u,4j,4v,3c,4o,3j,58,63,54,3v,4p,3m,3w,3g,5e,2a,2v,3v,52,2y,3r,2o,31,28,4h,4g,4n,1u,3t,3d,55,3c,1l,4m,33,30,3l,3b,3p,4v,3f,3d,3s,3w,58,52,3q,4l,3w,4j,53,37,40,35,37,4g,3j,58,58,3r,2q,25,25,3e,4i,3b,4u,3k,4o,37,2k,b,2c,3e,2e,2q,31,2x,3n,2x,2g,2c,1m,4u,2k,2v,1v,44,1j,1c,2i,14,1h,1g,2f,2q,2r,42,1l,25,2c,2h,2m,1n,47,1y,45,4a,2x,3y,2d,1u,1v,1x,1e,2g,2l,20,32,2e,2u,2k,1l,3y,2j,5,4c,48,1i,1a,1i,1r,1v,2r,18,19,49,1c,1b,11,p,1o,4q,1r,1a,18,18,42,27,4u,18,1b,4,d,d,e,16,x,4s,z,k,45,46,7,7,1c,14,10,9,z,n,l,o,49,1o,v,x,t,r,d,2j,17,i,21,2j,v,2q,1k,27,2f,1n,6,4d,y,u,0,c,5g,u,k,v,1d,1h,43,18,2r,1a,w,1n,19,10,a,o,t,4d,y,45,8,4,a,4r,44,2j,m,17,f,l,45,27,n,1j,48,15,s,o,k,11,4c,v,2r,2s,k,1b,12,h,49,m,11,42,46,4a,6,1a,7,s,33,1d,48,48,16,18,43,10,4r,4b,2q,4c,18,44,18,1b,2q,g,t,4a,48,1n,1a,1w,2s,4q,1m,1w,1y,2g,1o,1a,4u,27,1g,3m,1t,3z,m,2n,3d,38,28,2n,1k,3r,2n,2u,1l,2a,34,3k,4h,2a,3k,40,4e,1z,37,4u,3j,35,29,3j,2z,31,1z,2z,2u,2v,24,1z,28,35,2v,40,25,4x,3x,3r,37,3g,3w,3g,2o,1z,4m,3u,4v,57,4j,4i,4i,2w,5q,56,5e,20,3w,3o,3n,1m,3w,4l,29,4n,5r,64,4w,56,65,66,3v,30,5d,2n,4l,67,68,38,35,3b,5d,64,40,3x,5e,3a,4w,4o,3n,3i,2t,4g,3c,4n,61,34,39,4l,4g,37,2y,58,3c,35,53,4n,3n,3l,3e,37,3j,20,39,54,69,3s,2y,4h,3n,3d,36,3q,22,1s,53,1z,4h,2g,2w,32,4g,39,3l,3c,1t,4e,3b,3u,24,2w,3g,4m,3w,53,2l,3r,3k,3e,28,1y,1w,1p,2x,1w,28,4u,23,2u,2c,21,1v,2j,1a,4q,14,42,1q,26,2u,1y,1w,1k,2m,4u,1k,2x,1g,48,p,p,w,2r,8,4r,3z,20,3z,2n,2k,2s,13,14,1u,2c,1f,2d,2e,11,1c,2f,23,2c,1p,2m,4b,1m,23,2m,1m,26,1d,1n,19,1r,1m,1i,18,v,4b,1c,s,4c,x,46,41,z,4c,4,1e,1v,2c,14,19,4a,6,4c,1c,z,h,g,17,11,q,11,4r,p,o,d,49,4r,6,1c,e,41,1,51,9,8,r,2,h,t,1,5h,e,t,j,0,c,8,8,y,41,r,9,y,8,g,1i,47,42,49,18,1e,1a,1a,11,9,11,n,6,4c,6,k,1x,13,1j,46,4r,11,46,7,k,5,l,y,w,n,o,11,g,1j,1c,4c,m,18,18,49,v,4b,z,2,2q,2r,1m,4u,6,2d,32,1o,2p,1u,l,1m,1a,1f,45,21,2e,23,1s,2j,2m,1l,2p,2g,1f,1h,14,44,1b,4u,1x,4u,2g,29,31,1k,2l,2j,18,1v,33,2h,39,3z,3g,20,3e,38,3g,40,34,1t,2t,2b,2e,28,1z,1k,2p,3m,3d,1x,29,3e,2w,3w,39,36,2n,2y,4l,2a,4x,4e,3e,29,4l,3d,29,1x,3n,39,1t,2w,3m,3x,4i,3t,4i,39,34,1t,2h,2y,4h,4g,4h,56,64,3s,1p,1x,32,2o,29,4h,3t,2a,2b,2v,4x,4l,4h,2a,3r,4j,57,4w,4h,3e,2a,3l,4x,3n,4x,5q,3m,2a,3h,2t,58,3u,35,4f,56,3v,2n,35,3g,30,4x,4v,6a,57,29,3t,3n,3f,4l,3g,4n,4f,3l,1z,2d,29,4g,32,1k,3h,3a,3h,53,28,20,28,3k,3g,4m,4i,3t,38,3u,3g,2h,4e,28,2p,2e,1m,27,2y,30,35,34,2n,2f,35,2u,24,37,4e,2x,2s,1u,2s,23,38,28,40,2k,1t,4m,1t,2g,1m,20,3x,31,2t,36,1g,1u,1y,d,2i,3m,33,2u,27,1m,2j,2j,4b,2k,36,1c,1i,28,2f,40,2g,2u,2u,2k,1a,1r,2g,3y,45,21,45,5,m,18,w,2c,2i,11,1n,2j,1w,3z,1o,2x,1d,48,l,1b,13,w,42,1d,1o,4c,49,1m,1q,2j,15,l,w,44,k,4,m,1j,19,15,11,10,46,y,8,10,d,46,41,2,41,7,o,k,4c,18,43,10,46,11,v,4a,48,l,11,q,4t,5m,q,4d,r,15,4d,5g,5h,4y,49,1n,z,s,s,d,k,g,4t,t,8,1a,z,1c,10,11,1v,42,15,o,4b,1b,10,7,1o,13,m,18,4,46,g,7,11,45,1a,2j,2s,1d,2g,1q,1w,14,1d,1u,26,4q,1a,14,19,1m,1e,19,1n,1y,18,42,2s,l,4b,1f,s,2f,3z,47,1y,1i,1d,1u,2b,37,2n,2k,1f,2r,2k,4e,2h,2v,1g,20,2u,32,22,1y,w,2r,4a,34,2v,20,3f,1k,3n,3k,1x,47,40,3t,3b,3t,3d,31,40,3r,31,32,1t,2p,3e,24,2h,2k,1g,1z,3e,4e,38,40,2z,3g,3n,2n,5q,58,52,4e,3m,3z,3m,24,28,2e,4i,3e,4g,4e,4p,3v,2d,3q,4w,53,3k,3q,3k,4o,3v,53,4i,2w,3g,3s,4l,4x,4w,25,3u,4l,4e,3h,53,34,3m,4e,2b,29,4i,4p,3h,3b,4f,3h,53,37,1k,3z,40,3g,20,55,4v,56,39,61,3p,4o,31,30,3e,4g,3j,29,3j,2n,2h,2n,3j,3r,2a,4g,4o,3x,4o,3b,64,64,3r,3i,5e,3y,3d,3a,1q,44,1t,3x,3j,30,2i,3z,31,3d,4g,3n,4e,1t,24,1p,2m,1d,47,18,36,2t,2a,3g,4l,3c,38,2y,23,28,4m,22,2p,1r,1r,2r,2d,2i,25,2r,2c,1v,2g,1f,1v,1f,1q,2f,1k,3y,27,1j,1q,1g,23,2h,27,28,1v,23,1y,32,3z,4u,2k,2v,2l,2k,4e,2w,2r,5,2m,2f,2j,19,13,1w,44,m,2r,y,18,44,1v,1b,11,f,1j,42,v,18,43,4a,p,1d,1u,3z,26,13,45,1f,4a,7,4d,16,4t,15,1b,43,43,1h,1v,w,43,4q,r,44,1j,1a,1c,48,4c,1b,14,4c,49,42,47,27,1v,48,4a,12,4,2q,23,1d,1c,45,1l,4b,x,4c,41,41,1,4,11,41,41,10,4a,4q,42,s,x,4b,15,o,4q,m,1j,51,1b,1b,1c,49,v,s,4a,11,1c,49,45,5,45,7,o,11,s,1n,2s,1f,18,21,43,1b,d,l,n,12,10,3y,47,15,4a,46,6,41,o,4a,42,14,1l,1i,26,23,13,2p,21,27,47,21,21,l,l,19,1r,1m,33,2a,3r,22,2e,1p,2f,25,34,2a,2c,4l,3a,3e,2y,40,2d,2e,4e,2w,3z,2u,2i,2l,2f,1r,w,2l,1u,2z,2f,1s,3y,25,3d,3u,4h,3w,4x,58,3x,30,4h,1k,20,1w,2y,2n,2y,40,58,4i,4x,3a,4e,3u,58,3p,4e,3g,4f,64,4g,3q,3h,3c,3j,3n,2o,4e,1z,40,3r,29,3y,4m,4h,56,3o,2a,2t,4g,1z,4p,61,4n,3p,6b,63,52,2t,34,58,4x,4m,2h,28,28,2a,3o,3f,29,60,3e,2t,3d,3f,2o,3m,4m,5z,2o,1w,58,1t,3x,38,29,3h,29,39,52,32,2c,4x,58,52,4p,3d,4p,55,3x,2w,4l,1d,34,39,3g,3u,4h,4n,53,52,3f,2b,3z,2l,1g,2o,5q,3c,3f,3m,31,1i,2d,38,3d,3g,3c,2m,3k,2w,3e,3a,30,2n,20,2b,4l,31,2h,2e,1s,32,2v,1s,31,20,4g,2p,40,1x,24,32,1u,1p,2i,22,34,2y,2v,2t,2v,2i,2x,14,3d,2a,2g,2p,4b,1w,36,2t,1m,3y,2j,14,1d,1d,45,2q,14,43,2m,1u,1t,2h,20,31,2w,18,1i,1o,1i,2q,27,4c,48,1v,26,1u,1u,o,2j,1n,1a,2j,1i,4u,1j,1d,27,1x,1w,2g,1s,1p,12,42,l,4y,6,12,o,16,7,12,4r,1b,2j,1q,1w,1y,17,46,1c,n,2,4d,a,p,8,2,4t,e,7,4a,8,z,4c,4t,10,7,4c,1n,12,o,19,v,49,e,6,e,6,6,4d,43,13,15,4a,4b,13,1i,4u,1c,4a,w,1h,14,1n,43,4c,6,4q,g,17,7,n,n,y,11,10,s,7,s,4d,46,n,2,g,49,1m,1y,1o,1h,2r,4c,w,1a,49,4c,2m,18,1y,4a,49,13,42,4b,w,15,o,45,4u,21,2z,2l,3y,43,1n,1b,1n,27,1r,4q,1e,47,1s,3y,2g,2u,2u,2f,1s,1v,1w,21,3y,1w,1x,1r,1r,v,24,1t,1k,33,26,2a,3g,3f,34,2e,45,14,l,1e,1e,2w,1z,3k,3r,24,2h,3y,2c,2w,36,36,2t,28,3d,4o,36,4g,3h,4j,4o,25,40,3e,58,3s,3e,2y,39,4o,57,6c,35,3n,4e,25,24,39,3a,3q,3h,4e,3c,3k,3f,58,4m,2a,3m,2l,1q,2m,1y,1g,4l,3k,4l,34,3t,3c,38,61,60,3k,4m,39,4l,2y,1g,20,4l,3c,4l,3k,37,3j,4k,6d,2d,58,34,1i,27,1t,4h,4l,39,3n,3o,2x,20,2o,36,3g,3c,4x,2x,3u,37,4p,1z,3h,3x,3d,20,30,3z,2u,4m,3d,34,2v,3z,4m,37,3j,2k,2l,2h,2o,3g,31,4g,2y,2h,1y,2v,2o,53,2w,4u,2s,22,3d,3n,2v,2f,2x,2g,1g,4e,3k,30,2p,23,1s,1l,36,3e,2i,2v,1k,1d,2v,2c,1x,1k,1w,2q,19,45,48,1n,14,14,1e,2g,1p,33,1m,45,28,2t,2x,2b,24,1g,1l,2i,1g,3m,1p,1f,6,2f,34,2y,1t,38,5,1r,1t,2v,2p,2e,1h,27,13,2l,1o,1u,1a,2f,2k,1q,1a,3y,1n,1w,2z,1p,2,1g,1k,2i,2p,2p,2p,21,1s,1k,2h,1s,47,m,1h,1d,w,15,49,l,19,1j,19,7,42,1m,13,47,2l,1m,12,1j,2q,41,19,11,15,43,4r,13,4q,45,45,1i,2q,6,h,4,f,t,17,k,12,1c,4u,1x,4,1c,4,49,1e,m,17,11,w,44,1e,45,m,n,s,4,10,43,48,2r,4q,8,k,1c,4a,1b,5,4b,16,k,26,21,1x,1e,y,4,12,43,1b,4b,v,6,51,7,4b,4a,v,12,46,o,4,k,1w,2f,2f,2s,26,1f,1r,1x,2f,2k,2l,1t,25,2n,2k,47,2w,5,3z,32,32,2q,1w,2l,1l,1a,2k,22,2g,2v,1m,2f,31,24,3z,28,4g,3g,3k,3g,31,3r,29,3r,2u,3m,28,2y,2k,2a,3h,30,3d,3h,3s,58,3b,2n,4x,3l,3q,3a,3k,24,20,2w,47,2c,4e,20,28,30,35,4n,58,2n,3a,3a,3u,55,5e,63,3l,6a,3i,34,3e,3r,4g,53,4h,3h,3s,4g,3t,4n,28,2b,3e,3x,3g,4h,30,3c,55,4f,55,24,1z,4g,3x,3t,6e,3c,4w,55,20,55,4v,6f,4g,3x,3m,29,2a,3k,3o,4i,3r,1k,2o,4g,3u,4l,4g,55,31,34,3r,53,52,25,35,1t,39,35,40,2o,3c,3x,3g,3k,4o,39,36,3d,3j,4o,4o,2z,53,3w,4b,30,52,3s,3v,39,3f,3f,1z,1o,24,2d,9,26,2c,2y,35,30,40,2h,4u,28,2n,47,1v,2r,t,2k,40,22,3r,3j,2h,33,2b,2w,2z,22,28,33,1y,4e,36,21,4u,22,33,14,3z,3y,2v,2y,40,1b,2b,3y,2s,1m,1o,32,1t,1p,1r,1m,1d,1j,1n,26,48,1i,1d,2x,22,w,4a,19,m,18,o,43,w,18,o,1e,2j,19,1q,48,1y,z,1h,1b,t,a,g,16,1c,u,41,1j,k,4a,51,1c,13,1o,1r,m,48,18,l,13,4b,4q,43,1c,o,o,7,6,2j,44,4r,4r,1b,2,9,43,8,46,6,e,d,19,17,15,41,7,w,4y,5a,p,45,41,r,y,16,y,x,4r,4s,0,o,7,13,z,1b,1d,17,6,10,17,d,41,4d,4c,4,4c,7,d,13,13,v,15,h,h,u,w,k,2l,1h,18,49,13,5,45,45,4a,4c,49,48,m,5,1b,k,43,1g,1s,1n,4u,1q,19,2q,19,1s,1r,1m,45,47,5,w,5,1u,1e,21,2c,24,2h,2d,1l,2p,23,27,1l,24,2s,4u,2k,22,2m,2d,24,28,1z,24,1h,2g,2g,2k,2u,2f,1l,1w,2e,3y,1p,21,1q,2m,24,3z,4e,2v,2z,2o,35,2k,35,3t,3u,2o,4g,3f,4p,3c,39,26,2w,2b,4i,3w,4l,40,3y,2b,3k,4l,55,2a,53,2a,25,52,4g,3h,58,6g,3b,3f,31,56,4k,3t,6h,5d,55,2h,4i,29,25,40,25,1z,2t,24,2k,4p,3h,3c,3d,39,3s,30,2a,4o,56,38,2t,3b,4f,64,25,1k,58,35,3t,3q,4h,3n,4g,55,4k,4k,3w,4f,5d,3s,3g,30,2o,2u,2m,2x,2b,2w,24,3m,39,2m,2f,4g,2h,1d,4u,4p,21,3z,22,1q,2p,2s,3n,55,40,47,19,2g,2t,3z,3g,1o,33,4o,29,5q,3x,3s,3z,35,3m,3n,37,1g,1e,2g,2w,2g,33,2s,2o,1g,1k,39,4u,4u,20,1o,23,2t,2x,1r,24,33,27,3m,39,1h,42,1e,1q,2z,28,1q,2b,31,3n,24,1m,1t,1p,1h,1e,1x,42,w,1d,15,1r,48,1n,1a,1i,1f,48,19,1b,49,11,48,2s,2q,2s,4q,1b,v,11,y,5h,41,y,6,1c,2,g,k,p,u,41,4c,4c,12,42,7,16,g,u,y,15,m,1r,1f,s,16,1f,1e,48,g,15,42,4r,49,k,d,1b,v,4r,d,d,m,45,7,6,17,n,8,8,49,48,4a,49,2s,1q,5,s,45,1a,19,4t,5g,s,17,g,8,6,k,y,4d,9,d,16,g,y,11,o,8,g,4,1r,2p,1p,18,o,4c,1c,1j,46,h,46,10,16,d,z,4d,17,10,z,y,17,10,41,41,46,v,5,t,3,4b,1f,v,k,s,6,y,16,s,11,19,6,4c,46,5,4b,1x,2l,21,1y,2p,1g,47,1y,26,1x,v,1i,1i,15,1h,2j,1u,2u,2s,1i,47,5,42,1m,2m,43,1a,26,2s","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-326d6094","guard":[["not",["hasAny",["20200123","20200210","20200222","20200302","20200308","20200425","20200427","20200522","20200529","20200610","20200624","20200720","20200722","20200817","20200818","20200912","20200914","20200922","20201003","20201007","20201014","20201129","20201223","20201227","20210109","20210119","20210130","20210202","20210207","20210318","20210327","20210423","20210427","20210509","20210512","20210521","20210619","20210725","20210804","20210811","20210814","20210914","20210920","20210922","20211004","20211011","20211121","20211129","20211207","20211213","20211227","20220126","20220203","20220222","20220223","20220321","angeles","avg","china","close","compare","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","max","national","open","phoenix","price","rate","recovered","smaller","sp500","std"]]]],"pyramid":["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]],"mem":null},
{"id":"n-83f302b9","guard":[["hasAny",["added to","c","element","item number","more than","nth","position"]],["words>=",13],["has","min"],["not",["has","compare"]]],"pyramid":["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]],"mem":null},
{"id":"n-8520a0ca","guard":[["hasAny",["added to","c","element","item number","more than","negate","negative","nth","opposite","position"]],["words>=",13],["has","min"],["not",["has","compare"]]],"pyramid":["render.number",["transform.neg",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-c46e17a0","guard":[["not",["hasAny",["20200123","20200210","20200222","20200302","20200308","20200425","20200427","20200522","20200529","20200610","20200624","20200720","20200722","20200817","20200818","20200912","20200914","20200922","20201003","20201007","20201014","20201129","20201223","20201227","20210109","20210119","20210130","20210202","20210207","20210318","20210327","20210423","20210427","20210509","20210512","20210521","20210619","20210725","20210804","20210811","20210814","20210914","20210920","20210922","20211004","20211011","20211121","20211129","20211207","20211213","20211227","20220126","20220203","20220222","20220223","20220321","angeles","avg","china","close","compare","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","max","national","open","phoenix","price","rate","recovered","smaller","sp500","std"]]]],"pyramid":["render.number",["transform.neg",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-320ffee4","guard":[["not",["hasAny",["20200123","20200210","20200222","20200302","20200308","20200425","20200427","20200522","20200529","20200610","20200624","20200720","20200722","20200817","20200818","20200912","20200914","20200922","20201003","20201007","20201014","20201129","20201223","20201227","20210109","20210119","20210130","20210202","20210207","20210318","20210327","20210423","20210427","20210509","20210512","20210521","20210619","20210725","20210804","20210811","20210814","20210914","20210920","20210922","20211004","20211011","20211121","20211129","20211207","20211213","20211227","20220126","20220203","20220222","20220223","20220321","angeles","avg","china","close","compare","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","max","national","open","phoenix","price","rate","recovered","smaller","sp500","std"]]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-7728676c","guard":[["hasAny",["added to","c","element","item number","more than","nth","position"]],["words>=",13],["has","min"],["not",["has","compare"]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-801f786e","guard":[["hasAny",["added to","c","element","item number","more than","nth","position"]],["words>=",13],["has","min"],["not",["has","compare"]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-8d37dd24","guard":[["not",["hasAny",["20200123","20200210","20200222","20200302","20200308","20200425","20200427","20200522","20200529","20200610","20200624","20200720","20200722","20200817","20200818","20200912","20200914","20200922","20201003","20201007","20201014","20201129","20201223","20201227","20210109","20210119","20210130","20210202","20210207","20210318","20210327","20210423","20210427","20210509","20210512","20210521","20210619","20210725","20210804","20210811","20210814","20210914","20210920","20210922","20211004","20211011","20211121","20211129","20211207","20211213","20211227","20220126","20220203","20220222","20220223","20220321","angeles","avg","china","close","compare","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","max","national","open","phoenix","price","rate","recovered","smaller","sp500","std"]]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-2320278d","guard":[["not",["hasAny",["20200123","20200210","20200222","20200302","20200308","20200425","20200427","20200522","20200529","20200610","20200624","20200720","20200722","20200817","20200818","20200912","20200914","20200922","20201003","20201007","20201014","20201129","20201223","20201227","20210109","20210119","20210130","20210202","20210207","20210318","20210327","20210423","20210427","20210509","20210512","20210521","20210619","20210725","20210804","20210811","20210814","20210914","20210920","20210922","20211004","20211011","20211121","20211129","20211207","20211213","20211227","20220126","20220203","20220222","20220223","20220321","angeles","avg","china","close","compare","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","max","national","open","phoenix","price","rate","recovered","smaller","sp500","std"]]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-31e4e87c","guard":[["not",["hasAny",["20200123","20200210","20200222","20200302","20200308","20200425","20200427","20200522","20200529","20200610","20200624","20200720","20200722","20200817","20200818","20200912","20200914","20200922","20201003","20201007","20201014","20201129","20201223","20201227","20210109","20210119","20210130","20210202","20210207","20210318","20210327","20210423","20210427","20210509","20210512","20210521","20210619","20210725","20210804","20210811","20210814","20210914","20210920","20210922","20211004","20211011","20211121","20211129","20211207","20211213","20211227","20220126","20220203","20220222","20220223","20220321","angeles","avg","china","close","compare","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","max","national","open","phoenix","price","rate","recovered","smaller","sp500","std"]]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-4d090b72","guard":[["hasAny",["added to","c","element","item number","more than","nth","position"]],["words>=",13],["has","min"],["not",["has","compare"]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-607555db","guard":[["not",["hasAny",["20200123","20200210","20200222","20200302","20200308","20200425","20200427","20200522","20200529","20200610","20200624","20200720","20200722","20200817","20200818","20200912","20200914","20200922","20201003","20201007","20201014","20201129","20201223","20201227","20210109","20210119","20210130","20210202","20210207","20210318","20210327","20210423","20210427","20210509","20210512","20210521","20210619","20210725","20210804","20210811","20210814","20210914","20210920","20210922","20211004","20211011","20211121","20211129","20211207","20211213","20211227","20220126","20220203","20220222","20220223","20220321","angeles","avg","china","close","compare","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","max","national","open","phoenix","price","rate","recovered","smaller","sp500","std"]]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-6629a180","guard":[["hasAny",["added to","c","element","item number","more than","nth","position"]],["words>=",13],["has","min"],["not",["has","compare"]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-8955bad1","guard":[["not",["hasAny",["20200123","20200210","20200222","20200302","20200308","20200425","20200427","20200522","20200529","20200610","20200624","20200720","20200722","20200817","20200818","20200912","20200914","20200922","20201003","20201007","20201014","20201129","20201223","20201227","20210109","20210119","20210130","20210202","20210207","20210318","20210327","20210423","20210427","20210509","20210512","20210521","20210619","20210725","20210804","20210811","20210814","20210914","20210920","20210922","20211004","20211011","20211121","20211129","20211207","20211213","20211227","20220126","20220203","20220222","20220223","20220321","angeles","avg","china","close","compare","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","max","national","open","phoenix","price","rate","recovered","smaller","sp500","std"]]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-d9261f5e","guard":[["hasAny",["added to","c","element","item number","more than","nth","position"]],["words>=",13],["has","min"],["not",["has","compare"]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-f36dd6df","guard":[["hasAny",["added to","c","element","item number","more than","nth","position"]],["words>=",13],["has","min"],["not",["has","compare"]]],"pyramid":["render.template",{"lit":["The min temp c of ",{"slot":0}," (",{"slot":1},") plus that of ",{"slot":2}," (",{"slot":3},") is ",{"slot":4},"."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-003ab4f3","guard":[["has","c"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1996-08-25 and 2020-10-24":"The min temp c of 1996-08-25 (9.3) plus that of 2020-10-24 (14.6) is 23.9.","the min temp c of 1996-05-18 plus the min temp c of 2021-11-13 makes what":"The min temp c of 1996-05-18 (13.7) plus that of 2021-11-13 (11.1) is 24.8.","what is the sum of the min temp c of 2007-03-24 and 1994-07-03":"The min temp c of 2007-03-24 (17.2) plus that of 1994-07-03 (8.8) is 26.","the min temp c of 2008-01-12 plus the min temp c of 1998-11-06 makes what":"The min temp c of 2008-01-12 (21.1) plus that of 1998-11-06 (14.9) is 36.","what is the sum of the min temp c of 2021-02-28 and 2020-02-28":"The min temp c of 2021-02-28 (19.1) plus that of 2020-02-28 (16.6) is 35.7.","the min temp c of 1998-04-08 plus the min temp c of 2011-09-25 makes what":"The min temp c of 1998-04-08 (19.6) plus that of 2011-09-25 (12.5) is 32.1.","add the min temp c of 2002-12-27 to the min temp c of 1998-04-08":"The min temp c of 2002-12-27 (18.5) plus that of 1998-04-08 (19.6) is 38.1.","the min temp c of 2012-12-26 plus the min temp c of 1999-11-27 makes what":"The min temp c of 2012-12-26 (16.2) plus that of 1999-11-27 (14.7) is 30.9.","the min temp c of 2007-06-17 plus the min temp c of 1991-12-18 makes what":"The min temp c of 2007-06-17 (12.6) plus that of 1991-12-18 (14.6) is 27.2.","add the min temp c of 2019-08-07 to the min temp c of 1995-01-01":"The min temp c of 2019-08-07 (7.4) plus that of 1995-01-01 (18.9) is 26.3.","the min temp c of 2013-03-13 plus the min temp c of 1993-08-27 makes what":"The min temp c of 2013-03-13 (18.3) plus that of 1993-08-27 (12.4) is 30.7.","the min temp c of 2017-02-21 plus the min temp c of 2022-04-23 makes what":"The min temp c of 2017-02-21 (18.2) plus that of 2022-04-23 (14.8) is 33.","add the min temp c of 1999-03-14 to the min temp c of 2024-11-02":"The min temp c of 1999-03-14 (20) plus that of 2024-11-02 (14.3) is 34.3.","the min temp c of 2013-01-21 plus the min temp c of 1999-10-28 makes what":"The min temp c of 2013-01-21 (19.9) plus that of 1999-10-28 (12.6) is 32.5.","what is the sum of the min temp c of 2024-09-23 and 1995-03-29":"The min temp c of 2024-09-23 (13.1) plus that of 1995-03-29 (14.8) is 27.9.","the min temp c of 2022-10-07 plus the min temp c of 2024-03-20 makes what":"The min temp c of 2022-10-07 (13.9) plus that of 2024-03-20 (17.4) is 31.3.","what is the sum of the min temp c of 2010-12-09 and 2003-12-31":"The min temp c of 2010-12-09 (21.6) plus that of 2003-12-31 (21.2) is 42.8.","the min temp c of 2006-07-07 plus the min temp c of 2021-02-28 makes what":"The min temp c of 2006-07-07 (6.9) plus that of 2021-02-28 (19.1) is 26.","what is the sum of the min temp c of 1991-12-18 and 2005-03-22":"The min temp c of 1991-12-18 (14.6) plus that of 2005-03-22 (16.2) is 30.8.","the min temp c of 2020-01-19 plus the min temp c of 2003-11-13 makes what":"The min temp c of 2020-01-19 (18.4) plus that of 2003-11-13 (11.5) is 29.9.","what is the sum of the min temp c of 2013-08-25 and 2008-04-28":"The min temp c of 2013-08-25 (9.9) plus that of 2008-04-28 (9.6) is 19.5.","what is the sum of the min temp c of 2002-07-18 and 2011-01-08":"The min temp c of 2002-07-18 (5.7) plus that of 2011-01-08 (21.3) is 27.","what is the sum of the min temp c of 1998-06-26 and 2002-12-27":"The min temp c of 1998-06-26 (6.4) plus that of 2002-12-27 (18.5) is 24.9.","what is the sum of the min temp c of 2014-12-05 and 2002-08-14":"The min temp c of 2014-12-05 (20.5) plus that of 2002-08-14 (9.3) is 29.8.","what is the sum of the min temp c of 2002-06-28 and 2005-01-20":"The min temp c of 2002-06-28 (9.3) plus that of 2005-01-20 (18.6) is 27.9.","add the min temp c of 1994-07-03 to the min temp c of 2013-01-21":"The min temp c of 1994-07-03 (8.8) plus that of 2013-01-21 (19.9) is 28.7.","what is the sum of the min temp c of 1999-11-27 and 2011-04-05":"The min temp c of 1999-11-27 (14.7) plus that of 2011-04-05 (16.7) is 31.4.","add the min temp c of 1993-10-24 to the min temp c of 2010-07-18":"The min temp c of 1993-10-24 (17.1) plus that of 2010-07-18 (7.9) is 25.","add the min temp c of 2010-05-14 to the min temp c of 2009-06-26":"The min temp c of 2010-05-14 (12.3) plus that of 2009-06-26 (9.7) is 22.","the min temp c of 2020-05-24 plus the min temp c of 2013-08-25 makes what":"The min temp c of 2020-05-24 (12.7) plus that of 2013-08-25 (9.9) is 22.6.","add the min temp c of 2023-02-20 to the min temp c of 2008-01-12":"The min temp c of 2023-02-20 (19.5) plus that of 2008-01-12 (21.1) is 40.6.","add the min temp c of 2023-01-11 to the min temp c of 2020-03-29":"The min temp c of 2023-01-11 (18.1) plus that of 2020-03-29 (16.9) is 35.","the min temp c of 1992-05-10 plus the min temp c of 2010-12-09 makes what":"The min temp c of 1992-05-10 (15.2) plus that of 2010-12-09 (21.6) is 36.8.","the min temp c of 2020-03-29 plus the min temp c of 2001-07-04 makes what":"The min temp c of 2020-03-29 (16.9) plus that of 2001-07-04 (9.8) is 26.7.","what is the sum of the min temp c of 2001-01-02 and 2011-03-23":"The min temp c of 2001-01-02 (19.3) plus that of 2011-03-23 (17.5) is 36.8.","add the min temp c of 2020-10-24 to the min temp c of 1994-08-19":"The min temp c of 2020-10-24 (14.6) plus that of 1994-08-19 (7.7) is 22.3.","add the min temp c of 2011-01-08 to the min temp c of 2004-12-14":"The min temp c of 2011-01-08 (21.3) plus that of 2004-12-14 (17.8) is 39.1.","the min temp c of 1994-08-19 plus the min temp c of 2020-02-19 makes what":"The min temp c of 1994-08-19 (7.7) plus that of 2020-02-19 (15.5) is 23.2.","what is the sum of the min temp c of 2006-03-12 and 2023-02-25":"The min temp c of 2006-03-12 (20.4) plus that of 2023-02-25 (17) is 37.4.","what is the sum of the min temp c of 2002-03-20 and 2010-05-14":"The min temp c of 2002-03-20 (19.9) plus that of 2010-05-14 (12.3) is 32.2.","the min temp c of 2005-05-16 plus the min temp c of 1996-08-25 makes what":"The min temp c of 2005-05-16 (13.6) plus that of 1996-08-25 (9.3) is 22.9.","add the min temp c of 2005-11-22 to the min temp c of 1992-03-27":"The min temp c of 2005-11-22 (17.3) plus that of 1992-03-27 (18.9) is 36.2.","add the min temp c of 1992-11-24 to the min temp c of 2007-06-17":"The min temp c of 1992-11-24 (16.1) plus that of 2007-06-17 (12.6) is 28.7.","the min temp c of 2009-08-23 plus the min temp c of 1992-03-30 makes what":"The min temp c of 2009-08-23 (15.7) plus that of 1992-03-30 (17.6) is 33.3.","add the min temp c of 2009-08-05 to the min temp c of 2013-03-13":"The min temp c of 2009-08-05 (6) plus that of 2013-03-13 (18.3) is 24.3.","the min temp c of 1991-05-19 plus the min temp c of 2007-03-24 makes what":"The min temp c of 1991-05-19 (12.5) plus that of 2007-03-24 (17.2) is 29.7.","the min temp c of 2020-03-27 plus the min temp c of 2001-01-02 makes what":"The min temp c of 2020-03-27 (14.7) plus that of 2001-01-02 (19.3) is 34.","the min temp c of 2019-03-31 plus the min temp c of 2002-06-08 makes what":"The min temp c of 2019-03-31 (11.4) plus that of 2002-06-08 (9.8) is 21.2.","add the min temp c of 1999-03-11 to the min temp c of 2017-02-21":"The min temp c of 1999-03-11 (19.1) plus that of 2017-02-21 (18.2) is 37.3.","the min temp c of 2019-12-20 plus the min temp c of 2006-03-12 makes what":"The min temp c of 2019-12-20 (17.5) plus that of 2006-03-12 (20.4) is 37.9.","what is the sum of the min temp c of 2024-03-20 and 1993-10-24":"The min temp c of 2024-03-20 (17.4) plus that of 1993-10-24 (17.1) is 34.5.","what is the sum of the min temp c of 2003-11-13 and 1999-03-14":"The min temp c of 2003-11-13 (11.5) plus that of 1999-03-14 (20) is 31.5.","the min temp c of 2010-07-18 plus the min temp c of 2002-06-28 makes what":"The min temp c of 2010-07-18 (7.9) plus that of 2002-06-28 (9.3) is 17.2.","what is the sum of the min temp c of 2022-04-23 and 1992-11-24":"The min temp c of 2022-04-23 (14.8) plus that of 1992-11-24 (16.1) is 30.9.","add the min temp c of 1997-02-16 to the min temp c of 2020-03-27":"The min temp c of 1997-02-16 (21.2) plus that of 2020-03-27 (14.7) is 35.9.","the min temp c of 2009-06-26 plus the min temp c of 2014-12-05 makes what":"The min temp c of 2009-06-26 (9.7) plus that of 2014-12-05 (20.5) is 30.2.","add the min temp c of 2004-07-24 to the min temp c of 2020-05-24":"The min temp c of 2004-07-24 (12.4) plus that of 2020-05-24 (12.7) is 25.1.","add the min temp c of 2015-10-29 to the min temp c of 2020-01-19":"The min temp c of 2015-10-29 (14.7) plus that of 2020-01-19 (18.4) is 33.1.","add the min temp c of 2023-02-25 to the min temp c of 1992-05-10":"The min temp c of 2023-02-25 (17) plus that of 1992-05-10 (15.2) is 32.2.","add the min temp c of 2005-03-22 to the min temp c of 2021-09-04":"The min temp c of 2005-03-22 (16.2) plus that of 2021-09-04 (13.1) is 29.3.","add the min temp c of 2002-08-14 to the min temp c of 2011-05-08":"The min temp c of 2002-08-14 (9.3) plus that of 2011-05-08 (11.9) is 21.2.","add the min temp c of 2011-03-23 to the min temp c of 2019-03-31":"The min temp c of 2011-03-23 (17.5) plus that of 2019-03-31 (11.4) is 28.9.","what is the sum of the min temp c of 1991-06-23 and 1999-03-11":"The min temp c of 1991-06-23 (12.5) plus that of 1999-03-11 (19.1) is 31.6.","add the min temp c of 1995-03-29 to the min temp c of 2022-10-07":"The min temp c of 1995-03-29 (14.8) plus that of 2022-10-07 (13.9) is 28.7.","what is the sum of the min temp c of 2002-06-08 and 2019-08-07":"The min temp c of 2002-06-08 (9.8) plus that of 2019-08-07 (7.4) is 17.2.","what is the sum of the min temp c of 2020-02-19 and 2018-02-08":"The min temp c of 2020-02-19 (15.5) plus that of 2018-02-08 (17.6) is 33.1.","the min temp c of 1992-03-27 plus the min temp c of 2002-09-07 makes what":"The min temp c of 1992-03-27 (18.9) plus that of 2002-09-07 (12.2) is 31.1.","the min temp c of 2021-09-04 plus the min temp c of 2004-04-18 makes what":"The min temp c of 2021-09-04 (13.1) plus that of 2004-04-18 (13) is 26.1.","the min temp c of 2006-10-22 plus the min temp c of 2021-09-11 makes what":"The min temp c of 2006-10-22 (13.4) plus that of 2021-09-11 (16) is 29.4.","what is the sum of the min temp c of 2004-04-18 and 2001-06-24":"The min temp c of 2004-04-18 (13) plus that of 2001-06-24 (6.8) is 19.8.","what is the sum of the min temp c of 2018-05-26 and 1997-02-16":"The min temp c of 2018-05-26 (7.9) plus that of 1997-02-16 (21.2) is 29.1.","add the min temp c of 2007-07-20 to the min temp c of 1991-05-19":"The min temp c of 2007-07-20 (10.1) plus that of 1991-05-19 (12.5) is 22.6.","the min temp c of 1995-01-01 plus the min temp c of 2002-03-20 makes what":"The min temp c of 1995-01-01 (18.9) plus that of 2002-03-20 (19.9) is 38.8.","what is the sum of the min temp c of 1998-11-06 and 2005-11-22":"The min temp c of 1998-11-06 (14.9) plus that of 2005-11-22 (17.3) is 32.2.","add the min temp c of 2011-04-05 to the min temp c of 2005-05-16":"The min temp c of 2011-04-05 (16.7) plus that of 2005-05-16 (13.6) is 30.3.","add the min temp c of 2018-02-08 to the min temp c of 2009-08-23":"The min temp c of 2018-02-08 (17.6) plus that of 2009-08-23 (15.7) is 33.3.","add the min temp c of 2020-02-28 to the min temp c of 2012-12-26":"The min temp c of 2020-02-28 (16.6) plus that of 2012-12-26 (16.2) is 32.8.","what is the sum of the min temp c of 1998-06-05 and 1994-01-05":"The min temp c of 1998-06-05 (11.1) plus that of 1994-01-05 (21.1) is 32.2.","what is the sum of the min temp c of 1992-03-30 and 2015-10-29":"The min temp c of 1992-03-30 (17.6) plus that of 2015-10-29 (14.7) is 32.3.","add the min temp c of 2001-07-17 to the min temp c of 1994-09-11":"The min temp c of 2001-07-17 (9.4) plus that of 1994-09-11 (10.5) is 19.9.","what is the sum of the min temp c of 1999-10-28 and 2001-07-17":"The min temp c of 1999-10-28 (12.6) plus that of 2001-07-17 (9.4) is 22.","the min temp c of 2011-05-08 plus the min temp c of 1998-06-05 makes what":"The min temp c of 2011-05-08 (11.9) plus that of 1998-06-05 (11.1) is 23.","what is the sum of the min temp c of 2021-11-13 and 2009-08-05":"The min temp c of 2021-11-13 (11.1) plus that of 2009-08-05 (6) is 17.1.","the min temp c of 2006-04-30 plus the min temp c of 1998-06-26 makes what":"The min temp c of 2006-04-30 (14.3) plus that of 1998-06-26 (6.4) is 20.7.","what is the sum of the min temp c of 2002-09-07 and 2014-06-30":"The min temp c of 2002-09-07 (12.2) plus that of 2014-06-30 (9.7) is 21.9.","add the min temp c of 2001-06-24 to the min temp c of 2006-07-07":"The min temp c of 2001-06-24 (6.8) plus that of 2006-07-07 (6.9) is 13.7.","the min temp c of 1993-07-22 plus the min temp c of 2024-09-23 makes what":"The min temp c of 1993-07-22 (5.5) plus that of 2024-09-23 (13.1) is 18.6.","add the min temp c of 2003-12-31 to the min temp c of 1993-07-22":"The min temp c of 2003-12-31 (21.2) plus that of 1993-07-22 (5.5) is 26.7.","what is the sum of the min temp c of 2021-09-11 and 2018-09-08":"The min temp c of 2021-09-11 (16) plus that of 2018-09-08 (7.2) is 23.2.","what is the sum of the min temp c of 1993-08-27 and 2007-07-20":"The min temp c of 1993-08-27 (12.4) plus that of 2007-07-20 (10.1) is 22.5.","add the min temp c of 2018-09-08 to the min temp c of 1996-05-18":"The min temp c of 2018-09-08 (7.2) plus that of 1996-05-18 (13.7) is 20.9.","what is the sum of the min temp c of 2011-09-25 and 2023-01-11":"The min temp c of 2011-09-25 (12.5) plus that of 2023-01-11 (18.1) is 30.6.","add the min temp c of 2005-01-20 to the min temp c of 2006-10-22":"The min temp c of 2005-01-20 (18.6) plus that of 2006-10-22 (13.4) is 32.","add the min temp c of 2008-04-28 to the min temp c of 2019-12-20":"The min temp c of 2008-04-28 (9.6) plus that of 2019-12-20 (17.5) is 27.1.","what is the sum of the min temp c of 2023-03-26 and 2023-02-20":"The min temp c of 2023-03-26 (18.8) plus that of 2023-02-20 (19.5) is 38.3.","what is the sum of the min temp c of 2001-07-04 and 2004-07-24":"The min temp c of 2001-07-04 (9.8) plus that of 2004-07-24 (12.4) is 22.2.","the min temp c of 2004-12-14 plus the min temp c of 2023-03-26 makes what":"The min temp c of 2004-12-14 (17.8) plus that of 2023-03-26 (18.8) is 36.6.","add the min temp c of 1994-01-05 to the min temp c of 2006-04-30":"The min temp c of 1994-01-05 (21.1) plus that of 2006-04-30 (14.3) is 35.4."}}},
{"id":"n-67e00da9","guard":[["has","c"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the min temp c of 1996-08-25 and 2020-10-24":"The min temp c of 1996-08-25 (9.3) plus that of 2020-10-24 (14.6) is 23.9.","1996-05-18 plus the min temp c of 2021-11-13 makes what":"The min temp c of 1996-05-18 (13.7) plus that of 2021-11-13 (11.1) is 24.8.","the min temp c of 2007-03-24 and 1994-07-03":"The min temp c of 2007-03-24 (17.2) plus that of 1994-07-03 (8.8) is 26.","2008-01-12 plus the min temp c of 1998-11-06 makes what":"The min temp c of 2008-01-12 (21.1) plus that of 1998-11-06 (14.9) is 36.","the min temp c of 2021-02-28 and 2020-02-28":"The min temp c of 2021-02-28 (19.1) plus that of 2020-02-28 (16.6) is 35.7.","1998-04-08 plus the min temp c of 2011-09-25 makes what":"The min temp c of 1998-04-08 (19.6) plus that of 2011-09-25 (12.5) is 32.1.","2002-12-27 to the min temp c of 1998-04-08":"The min temp c of 2002-12-27 (18.5) plus that of 1998-04-08 (19.6) is 38.1.","2012-12-26 plus the min temp c of 1999-11-27 makes what":"The min temp c of 2012-12-26 (16.2) plus that of 1999-11-27 (14.7) is 30.9.","2007-06-17 plus the min temp c of 1991-12-18 makes what":"The min temp c of 2007-06-17 (12.6) plus that of 1991-12-18 (14.6) is 27.2.","2019-08-07 to the min temp c of 1995-01-01":"The min temp c of 2019-08-07 (7.4) plus that of 1995-01-01 (18.9) is 26.3.","2013-03-13 plus the min temp c of 1993-08-27 makes what":"The min temp c of 2013-03-13 (18.3) plus that of 1993-08-27 (12.4) is 30.7.","2017-02-21 plus the min temp c of 2022-04-23 makes what":"The min temp c of 2017-02-21 (18.2) plus that of 2022-04-23 (14.8) is 33.","1999-03-14 to the min temp c of 2024-11-02":"The min temp c of 1999-03-14 (20) plus that of 2024-11-02 (14.3) is 34.3.","2013-01-21 plus the min temp c of 1999-10-28 makes what":"The min temp c of 2013-01-21 (19.9) plus that of 1999-10-28 (12.6) is 32.5.","the min temp c of 2024-09-23 and 1995-03-29":"The min temp c of 2024-09-23 (13.1) plus that of 1995-03-29 (14.8) is 27.9.","2022-10-07 plus the min temp c of 2024-03-20 makes what":"The min temp c of 2022-10-07 (13.9) plus that of 2024-03-20 (17.4) is 31.3.","the min temp c of 2010-12-09 and 2003-12-31":"The min temp c of 2010-12-09 (21.6) plus that of 2003-12-31 (21.2) is 42.8.","2006-07-07 plus the min temp c of 2021-02-28 makes what":"The min temp c of 2006-07-07 (6.9) plus that of 2021-02-28 (19.1) is 26.","the min temp c of 1991-12-18 and 2005-03-22":"The min temp c of 1991-12-18 (14.6) plus that of 2005-03-22 (16.2) is 30.8.","2020-01-19 plus the min temp c of 2003-11-13 makes what":"The min temp c of 2020-01-19 (18.4) plus that of 2003-11-13 (11.5) is 29.9.","the min temp c of 2013-08-25 and 2008-04-28":"The min temp c of 2013-08-25 (9.9) plus that of 2008-04-28 (9.6) is 19.5.","the min temp c of 2002-07-18 and 2011-01-08":"The min temp c of 2002-07-18 (5.7) plus that of 2011-01-08 (21.3) is 27.","the min temp c of 1998-06-26 and 2002-12-27":"The min temp c of 1998-06-26 (6.4) plus that of 2002-12-27 (18.5) is 24.9.","the min temp c of 2014-12-05 and 2002-08-14":"The min temp c of 2014-12-05 (20.5) plus that of 2002-08-14 (9.3) is 29.8.","the min temp c of 2002-06-28 and 2005-01-20":"The min temp c of 2002-06-28 (9.3) plus that of 2005-01-20 (18.6) is 27.9.","1994-07-03 to the min temp c of 2013-01-21":"The min temp c of 1994-07-03 (8.8) plus that of 2013-01-21 (19.9) is 28.7.","the min temp c of 1999-11-27 and 2011-04-05":"The min temp c of 1999-11-27 (14.7) plus that of 2011-04-05 (16.7) is 31.4.","1993-10-24 to the min temp c of 2010-07-18":"The min temp c of 1993-10-24 (17.1) plus that of 2010-07-18 (7.9) is 25.","2010-05-14 to the min temp c of 2009-06-26":"The min temp c of 2010-05-14 (12.3) plus that of 2009-06-26 (9.7) is 22.","2020-05-24 plus the min temp c of 2013-08-25 makes what":"The min temp c of 2020-05-24 (12.7) plus that of 2013-08-25 (9.9) is 22.6.","2023-02-20 to the min temp c of 2008-01-12":"The min temp c of 2023-02-20 (19.5) plus that of 2008-01-12 (21.1) is 40.6.","2023-01-11 to the min temp c of 2020-03-29":"The min temp c of 2023-01-11 (18.1) plus that of 2020-03-29 (16.9) is 35.","1992-05-10 plus the min temp c of 2010-12-09 makes what":"The min temp c of 1992-05-10 (15.2) plus that of 2010-12-09 (21.6) is 36.8.","2020-03-29 plus the min temp c of 2001-07-04 makes what":"The min temp c of 2020-03-29 (16.9) plus that of 2001-07-04 (9.8) is 26.7.","the min temp c of 2001-01-02 and 2011-03-23":"The min temp c of 2001-01-02 (19.3) plus that of 2011-03-23 (17.5) is 36.8.","2020-10-24 to the min temp c of 1994-08-19":"The min temp c of 2020-10-24 (14.6) plus that of 1994-08-19 (7.7) is 22.3.","2011-01-08 to the min temp c of 2004-12-14":"The min temp c of 2011-01-08 (21.3) plus that of 2004-12-14 (17.8) is 39.1.","1994-08-19 plus the min temp c of 2020-02-19 makes what":"The min temp c of 1994-08-19 (7.7) plus that of 2020-02-19 (15.5) is 23.2.","the min temp c of 2006-03-12 and 2023-02-25":"The min temp c of 2006-03-12 (20.4) plus that of 2023-02-25 (17) is 37.4.","the min temp c of 2002-03-20 and 2010-05-14":"The min temp c of 2002-03-20 (19.9) plus that of 2010-05-14 (12.3) is 32.2.","2005-05-16 plus the min temp c of 1996-08-25 makes what":"The min temp c of 2005-05-16 (13.6) plus that of 1996-08-25 (9.3) is 22.9.","2005-11-22 to the min temp c of 1992-03-27":"The min temp c of 2005-11-22 (17.3) plus that of 1992-03-27 (18.9) is 36.2.","1992-11-24 to the min temp c of 2007-06-17":"The min temp c of 1992-11-24 (16.1) plus that of 2007-06-17 (12.6) is 28.7.","2009-08-23 plus the min temp c of 1992-03-30 makes what":"The min temp c of 2009-08-23 (15.7) plus that of 1992-03-30 (17.6) is 33.3.","2009-08-05 to the min temp c of 2013-03-13":"The min temp c of 2009-08-05 (6) plus that of 2013-03-13 (18.3) is 24.3.","1991-05-19 plus the min temp c of 2007-03-24 makes what":"The min temp c of 1991-05-19 (12.5) plus that of 2007-03-24 (17.2) is 29.7.","2020-03-27 plus the min temp c of 2001-01-02 makes what":"The min temp c of 2020-03-27 (14.7) plus that of 2001-01-02 (19.3) is 34.","2019-03-31 plus the min temp c of 2002-06-08 makes what":"The min temp c of 2019-03-31 (11.4) plus that of 2002-06-08 (9.8) is 21.2.","1999-03-11 to the min temp c of 2017-02-21":"The min temp c of 1999-03-11 (19.1) plus that of 2017-02-21 (18.2) is 37.3.","2019-12-20 plus the min temp c of 2006-03-12 makes what":"The min temp c of 2019-12-20 (17.5) plus that of 2006-03-12 (20.4) is 37.9.","the min temp c of 2024-03-20 and 1993-10-24":"The min temp c of 2024-03-20 (17.4) plus that of 1993-10-24 (17.1) is 34.5.","the min temp c of 2003-11-13 and 1999-03-14":"The min temp c of 2003-11-13 (11.5) plus that of 1999-03-14 (20) is 31.5.","2010-07-18 plus the min temp c of 2002-06-28 makes what":"The min temp c of 2010-07-18 (7.9) plus that of 2002-06-28 (9.3) is 17.2.","the min temp c of 2022-04-23 and 1992-11-24":"The min temp c of 2022-04-23 (14.8) plus that of 1992-11-24 (16.1) is 30.9.","1997-02-16 to the min temp c of 2020-03-27":"The min temp c of 1997-02-16 (21.2) plus that of 2020-03-27 (14.7) is 35.9.","2009-06-26 plus the min temp c of 2014-12-05 makes what":"The min temp c of 2009-06-26 (9.7) plus that of 2014-12-05 (20.5) is 30.2.","2004-07-24 to the min temp c of 2020-05-24":"The min temp c of 2004-07-24 (12.4) plus that of 2020-05-24 (12.7) is 25.1.","2015-10-29 to the min temp c of 2020-01-19":"The min temp c of 2015-10-29 (14.7) plus that of 2020-01-19 (18.4) is 33.1.","2023-02-25 to the min temp c of 1992-05-10":"The min temp c of 2023-02-25 (17) plus that of 1992-05-10 (15.2) is 32.2.","2005-03-22 to the min temp c of 2021-09-04":"The min temp c of 2005-03-22 (16.2) plus that of 2021-09-04 (13.1) is 29.3.","2002-08-14 to the min temp c of 2011-05-08":"The min temp c of 2002-08-14 (9.3) plus that of 2011-05-08 (11.9) is 21.2.","2011-03-23 to the min temp c of 2019-03-31":"The min temp c of 2011-03-23 (17.5) plus that of 2019-03-31 (11.4) is 28.9.","the min temp c of 1991-06-23 and 1999-03-11":"The min temp c of 1991-06-23 (12.5) plus that of 1999-03-11 (19.1) is 31.6.","1995-03-29 to the min temp c of 2022-10-07":"The min temp c of 1995-03-29 (14.8) plus that of 2022-10-07 (13.9) is 28.7.","the min temp c of 2002-06-08 and 2019-08-07":"The min temp c of 2002-06-08 (9.8) plus that of 2019-08-07 (7.4) is 17.2.","the min temp c of 2020-02-19 and 2018-02-08":"The min temp c of 2020-02-19 (15.5) plus that of 2018-02-08 (17.6) is 33.1.","1992-03-27 plus the min temp c of 2002-09-07 makes what":"The min temp c of 1992-03-27 (18.9) plus that of 2002-09-07 (12.2) is 31.1.","2021-09-04 plus the min temp c of 2004-04-18 makes what":"The min temp c of 2021-09-04 (13.1) plus that of 2004-04-18 (13) is 26.1.","2006-10-22 plus the min temp c of 2021-09-11 makes what":"The min temp c of 2006-10-22 (13.4) plus that of 2021-09-11 (16) is 29.4.","the min temp c of 2004-04-18 and 2001-06-24":"The min temp c of 2004-04-18 (13) plus that of 2001-06-24 (6.8) is 19.8.","the min temp c of 2018-05-26 and 1997-02-16":"The min temp c of 2018-05-26 (7.9) plus that of 1997-02-16 (21.2) is 29.1.","2007-07-20 to the min temp c of 1991-05-19":"The min temp c of 2007-07-20 (10.1) plus that of 1991-05-19 (12.5) is 22.6.","1995-01-01 plus the min temp c of 2002-03-20 makes what":"The min temp c of 1995-01-01 (18.9) plus that of 2002-03-20 (19.9) is 38.8.","the min temp c of 1998-11-06 and 2005-11-22":"The min temp c of 1998-11-06 (14.9) plus that of 2005-11-22 (17.3) is 32.2.","2011-04-05 to the min temp c of 2005-05-16":"The min temp c of 2011-04-05 (16.7) plus that of 2005-05-16 (13.6) is 30.3.","2018-02-08 to the min temp c of 2009-08-23":"The min temp c of 2018-02-08 (17.6) plus that of 2009-08-23 (15.7) is 33.3.","2020-02-28 to the min temp c of 2012-12-26":"The min temp c of 2020-02-28 (16.6) plus that of 2012-12-26 (16.2) is 32.8.","the min temp c of 1998-06-05 and 1994-01-05":"The min temp c of 1998-06-05 (11.1) plus that of 1994-01-05 (21.1) is 32.2.","the min temp c of 1992-03-30 and 2015-10-29":"The min temp c of 1992-03-30 (17.6) plus that of 2015-10-29 (14.7) is 32.3.","2001-07-17 to the min temp c of 1994-09-11":"The min temp c of 2001-07-17 (9.4) plus that of 1994-09-11 (10.5) is 19.9.","the min temp c of 1999-10-28 and 2001-07-17":"The min temp c of 1999-10-28 (12.6) plus that of 2001-07-17 (9.4) is 22.","2011-05-08 plus the min temp c of 1998-06-05 makes what":"The min temp c of 2011-05-08 (11.9) plus that of 1998-06-05 (11.1) is 23.","the min temp c of 2021-11-13 and 2009-08-05":"The min temp c of 2021-11-13 (11.1) plus that of 2009-08-05 (6) is 17.1.","2006-04-30 plus the min temp c of 1998-06-26 makes what":"The min temp c of 2006-04-30 (14.3) plus that of 1998-06-26 (6.4) is 20.7.","the min temp c of 2002-09-07 and 2014-06-30":"The min temp c of 2002-09-07 (12.2) plus that of 2014-06-30 (9.7) is 21.9.","2001-06-24 to the min temp c of 2006-07-07":"The min temp c of 2001-06-24 (6.8) plus that of 2006-07-07 (6.9) is 13.7.","1993-07-22 plus the min temp c of 2024-09-23 makes what":"The min temp c of 1993-07-22 (5.5) plus that of 2024-09-23 (13.1) is 18.6.","2003-12-31 to the min temp c of 1993-07-22":"The min temp c of 2003-12-31 (21.2) plus that of 1993-07-22 (5.5) is 26.7.","the min temp c of 2021-09-11 and 2018-09-08":"The min temp c of 2021-09-11 (16) plus that of 2018-09-08 (7.2) is 23.2.","the min temp c of 1993-08-27 and 2007-07-20":"The min temp c of 1993-08-27 (12.4) plus that of 2007-07-20 (10.1) is 22.5.","2018-09-08 to the min temp c of 1996-05-18":"The min temp c of 2018-09-08 (7.2) plus that of 1996-05-18 (13.7) is 20.9.","the min temp c of 2011-09-25 and 2023-01-11":"The min temp c of 2011-09-25 (12.5) plus that of 2023-01-11 (18.1) is 30.6.","2005-01-20 to the min temp c of 2006-10-22":"The min temp c of 2005-01-20 (18.6) plus that of 2006-10-22 (13.4) is 32.","2008-04-28 to the min temp c of 2019-12-20":"The min temp c of 2008-04-28 (9.6) plus that of 2019-12-20 (17.5) is 27.1.","the min temp c of 2023-03-26 and 2023-02-20":"The min temp c of 2023-03-26 (18.8) plus that of 2023-02-20 (19.5) is 38.3.","the min temp c of 2001-07-04 and 2004-07-24":"The min temp c of 2001-07-04 (9.8) plus that of 2004-07-24 (12.4) is 22.2.","2004-12-14 plus the min temp c of 2023-03-26 makes what":"The min temp c of 2004-12-14 (17.8) plus that of 2023-03-26 (18.8) is 36.6.","1994-01-05 to the min temp c of 2006-04-30":"The min temp c of 1994-01-05 (21.1) plus that of 2006-04-30 (14.3) is 35.4."}}},
{"id":"n-e49e1679","guard":[["has","c"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"temp"}]]],"mem":{"table":{"c of 1996-08-25 and 2020-10-24":"The min temp c of 1996-08-25 (9.3) plus that of 2020-10-24 (14.6) is 23.9.","c of 1996-05-18 plus the min temp c of 2021-11-13 makes what":"The min temp c of 1996-05-18 (13.7) plus that of 2021-11-13 (11.1) is 24.8.","c of 2007-03-24 and 1994-07-03":"The min temp c of 2007-03-24 (17.2) plus that of 1994-07-03 (8.8) is 26.","c of 2008-01-12 plus the min temp c of 1998-11-06 makes what":"The min temp c of 2008-01-12 (21.1) plus that of 1998-11-06 (14.9) is 36.","c of 2021-02-28 and 2020-02-28":"The min temp c of 2021-02-28 (19.1) plus that of 2020-02-28 (16.6) is 35.7.","c of 1998-04-08 plus the min temp c of 2011-09-25 makes what":"The min temp c of 1998-04-08 (19.6) plus that of 2011-09-25 (12.5) is 32.1.","c of 2002-12-27 to the min temp c of 1998-04-08":"The min temp c of 2002-12-27 (18.5) plus that of 1998-04-08 (19.6) is 38.1.","c of 2012-12-26 plus the min temp c of 1999-11-27 makes what":"The min temp c of 2012-12-26 (16.2) plus that of 1999-11-27 (14.7) is 30.9.","c of 2007-06-17 plus the min temp c of 1991-12-18 makes what":"The min temp c of 2007-06-17 (12.6) plus that of 1991-12-18 (14.6) is 27.2.","c of 2019-08-07 to the min temp c of 1995-01-01":"The min temp c of 2019-08-07 (7.4) plus that of 1995-01-01 (18.9) is 26.3.","c of 2013-03-13 plus the min temp c of 1993-08-27 makes what":"The min temp c of 2013-03-13 (18.3) plus that of 1993-08-27 (12.4) is 30.7.","c of 2017-02-21 plus the min temp c of 2022-04-23 makes what":"The min temp c of 2017-02-21 (18.2) plus that of 2022-04-23 (14.8) is 33.","c of 1999-03-14 to the min temp c of 2024-11-02":"The min temp c of 1999-03-14 (20) plus that of 2024-11-02 (14.3) is 34.3.","c of 2013-01-21 plus the min temp c of 1999-10-28 makes what":"The min temp c of 2013-01-21 (19.9) plus that of 1999-10-28 (12.6) is 32.5.","c of 2024-09-23 and 1995-03-29":"The min temp c of 2024-09-23 (13.1) plus that of 1995-03-29 (14.8) is 27.9.","c of 2022-10-07 plus the min temp c of 2024-03-20 makes what":"The min temp c of 2022-10-07 (13.9) plus that of 2024-03-20 (17.4) is 31.3.","c of 2010-12-09 and 2003-12-31":"The min temp c of 2010-12-09 (21.6) plus that of 2003-12-31 (21.2) is 42.8.","c of 2006-07-07 plus the min temp c of 2021-02-28 makes what":"The min temp c of 2006-07-07 (6.9) plus that of 2021-02-28 (19.1) is 26.","c of 1991-12-18 and 2005-03-22":"The min temp c of 1991-12-18 (14.6) plus that of 2005-03-22 (16.2) is 30.8.","c of 2020-01-19 plus the min temp c of 2003-11-13 makes what":"The min temp c of 2020-01-19 (18.4) plus that of 2003-11-13 (11.5) is 29.9.","c of 2013-08-25 and 2008-04-28":"The min temp c of 2013-08-25 (9.9) plus that of 2008-04-28 (9.6) is 19.5.","c of 2002-07-18 and 2011-01-08":"The min temp c of 2002-07-18 (5.7) plus that of 2011-01-08 (21.3) is 27.","c of 1998-06-26 and 2002-12-27":"The min temp c of 1998-06-26 (6.4) plus that of 2002-12-27 (18.5) is 24.9.","c of 2014-12-05 and 2002-08-14":"The min temp c of 2014-12-05 (20.5) plus that of 2002-08-14 (9.3) is 29.8.","c of 2002-06-28 and 2005-01-20":"The min temp c of 2002-06-28 (9.3) plus that of 2005-01-20 (18.6) is 27.9.","c of 1994-07-03 to the min temp c of 2013-01-21":"The min temp c of 1994-07-03 (8.8) plus that of 2013-01-21 (19.9) is 28.7.","c of 1999-11-27 and 2011-04-05":"The min temp c of 1999-11-27 (14.7) plus that of 2011-04-05 (16.7) is 31.4.","c of 1993-10-24 to the min temp c of 2010-07-18":"The min temp c of 1993-10-24 (17.1) plus that of 2010-07-18 (7.9) is 25.","c of 2010-05-14 to the min temp c of 2009-06-26":"The min temp c of 2010-05-14 (12.3) plus that of 2009-06-26 (9.7) is 22.","c of 2020-05-24 plus the min temp c of 2013-08-25 makes what":"The min temp c of 2020-05-24 (12.7) plus that of 2013-08-25 (9.9) is 22.6.","c of 2023-02-20 to the min temp c of 2008-01-12":"The min temp c of 2023-02-20 (19.5) plus that of 2008-01-12 (21.1) is 40.6.","c of 2023-01-11 to the min temp c of 2020-03-29":"The min temp c of 2023-01-11 (18.1) plus that of 2020-03-29 (16.9) is 35.","c of 1992-05-10 plus the min temp c of 2010-12-09 makes what":"The min temp c of 1992-05-10 (15.2) plus that of 2010-12-09 (21.6) is 36.8.","c of 2020-03-29 plus the min temp c of 2001-07-04 makes what":"The min temp c of 2020-03-29 (16.9) plus that of 2001-07-04 (9.8) is 26.7.","c of 2001-01-02 and 2011-03-23":"The min temp c of 2001-01-02 (19.3) plus that of 2011-03-23 (17.5) is 36.8.","c of 2020-10-24 to the min temp c of 1994-08-19":"The min temp c of 2020-10-24 (14.6) plus that of 1994-08-19 (7.7) is 22.3.","c of 2011-01-08 to the min temp c of 2004-12-14":"The min temp c of 2011-01-08 (21.3) plus that of 2004-12-14 (17.8) is 39.1.","c of 1994-08-19 plus the min temp c of 2020-02-19 makes what":"The min temp c of 1994-08-19 (7.7) plus that of 2020-02-19 (15.5) is 23.2.","c of 2006-03-12 and 2023-02-25":"The min temp c of 2006-03-12 (20.4) plus that of 2023-02-25 (17) is 37.4.","c of 2002-03-20 and 2010-05-14":"The min temp c of 2002-03-20 (19.9) plus that of 2010-05-14 (12.3) is 32.2.","c of 2005-05-16 plus the min temp c of 1996-08-25 makes what":"The min temp c of 2005-05-16 (13.6) plus that of 1996-08-25 (9.3) is 22.9.","c of 2005-11-22 to the min temp c of 1992-03-27":"The min temp c of 2005-11-22 (17.3) plus that of 1992-03-27 (18.9) is 36.2.","c of 1992-11-24 to the min temp c of 2007-06-17":"The min temp c of 1992-11-24 (16.1) plus that of 2007-06-17 (12.6) is 28.7.","c of 2009-08-23 plus the min temp c of 1992-03-30 makes what":"The min temp c of 2009-08-23 (15.7) plus that of 1992-03-30 (17.6) is 33.3.","c of 2009-08-05 to the min temp c of 2013-03-13":"The min temp c of 2009-08-05 (6) plus that of 2013-03-13 (18.3) is 24.3.","c of 1991-05-19 plus the min temp c of 2007-03-24 makes what":"The min temp c of 1991-05-19 (12.5) plus that of 2007-03-24 (17.2) is 29.7.","c of 2020-03-27 plus the min temp c of 2001-01-02 makes what":"The min temp c of 2020-03-27 (14.7) plus that of 2001-01-02 (19.3) is 34.","c of 2019-03-31 plus the min temp c of 2002-06-08 makes what":"The min temp c of 2019-03-31 (11.4) plus that of 2002-06-08 (9.8) is 21.2.","c of 1999-03-11 to the min temp c of 2017-02-21":"The min temp c of 1999-03-11 (19.1) plus that of 2017-02-21 (18.2) is 37.3.","c of 2019-12-20 plus the min temp c of 2006-03-12 makes what":"The min temp c of 2019-12-20 (17.5) plus that of 2006-03-12 (20.4) is 37.9.","c of 2024-03-20 and 1993-10-24":"The min temp c of 2024-03-20 (17.4) plus that of 1993-10-24 (17.1) is 34.5.","c of 2003-11-13 and 1999-03-14":"The min temp c of 2003-11-13 (11.5) plus that of 1999-03-14 (20) is 31.5.","c of 2010-07-18 plus the min temp c of 2002-06-28 makes what":"The min temp c of 2010-07-18 (7.9) plus that of 2002-06-28 (9.3) is 17.2.","c of 2022-04-23 and 1992-11-24":"The min temp c of 2022-04-23 (14.8) plus that of 1992-11-24 (16.1) is 30.9.","c of 1997-02-16 to the min temp c of 2020-03-27":"The min temp c of 1997-02-16 (21.2) plus that of 2020-03-27 (14.7) is 35.9.","c of 2009-06-26 plus the min temp c of 2014-12-05 makes what":"The min temp c of 2009-06-26 (9.7) plus that of 2014-12-05 (20.5) is 30.2.","c of 2004-07-24 to the min temp c of 2020-05-24":"The min temp c of 2004-07-24 (12.4) plus that of 2020-05-24 (12.7) is 25.1.","c of 2015-10-29 to the min temp c of 2020-01-19":"The min temp c of 2015-10-29 (14.7) plus that of 2020-01-19 (18.4) is 33.1.","c of 2023-02-25 to the min temp c of 1992-05-10":"The min temp c of 2023-02-25 (17) plus that of 1992-05-10 (15.2) is 32.2.","c of 2005-03-22 to the min temp c of 2021-09-04":"The min temp c of 2005-03-22 (16.2) plus that of 2021-09-04 (13.1) is 29.3.","c of 2002-08-14 to the min temp c of 2011-05-08":"The min temp c of 2002-08-14 (9.3) plus that of 2011-05-08 (11.9) is 21.2.","c of 2011-03-23 to the min temp c of 2019-03-31":"The min temp c of 2011-03-23 (17.5) plus that of 2019-03-31 (11.4) is 28.9.","c of 1991-06-23 and 1999-03-11":"The min temp c of 1991-06-23 (12.5) plus that of 1999-03-11 (19.1) is 31.6.","c of 1995-03-29 to the min temp c of 2022-10-07":"The min temp c of 1995-03-29 (14.8) plus that of 2022-10-07 (13.9) is 28.7.","c of 2002-06-08 and 2019-08-07":"The min temp c of 2002-06-08 (9.8) plus that of 2019-08-07 (7.4) is 17.2.","c of 2020-02-19 and 2018-02-08":"The min temp c of 2020-02-19 (15.5) plus that of 2018-02-08 (17.6) is 33.1.","c of 1992-03-27 plus the min temp c of 2002-09-07 makes what":"The min temp c of 1992-03-27 (18.9) plus that of 2002-09-07 (12.2) is 31.1.","c of 2021-09-04 plus the min temp c of 2004-04-18 makes what":"The min temp c of 2021-09-04 (13.1) plus that of 2004-04-18 (13) is 26.1.","c of 2006-10-22 plus the min temp c of 2021-09-11 makes what":"The min temp c of 2006-10-22 (13.4) plus that of 2021-09-11 (16) is 29.4.","c of 2004-04-18 and 2001-06-24":"The min temp c of 2004-04-18 (13) plus that of 2001-06-24 (6.8) is 19.8.","c of 2018-05-26 and 1997-02-16":"The min temp c of 2018-05-26 (7.9) plus that of 1997-02-16 (21.2) is 29.1.","c of 2007-07-20 to the min temp c of 1991-05-19":"The min temp c of 2007-07-20 (10.1) plus that of 1991-05-19 (12.5) is 22.6.","c of 1995-01-01 plus the min temp c of 2002-03-20 makes what":"The min temp c of 1995-01-01 (18.9) plus that of 2002-03-20 (19.9) is 38.8.","c of 1998-11-06 and 2005-11-22":"The min temp c of 1998-11-06 (14.9) plus that of 2005-11-22 (17.3) is 32.2.","c of 2011-04-05 to the min temp c of 2005-05-16":"The min temp c of 2011-04-05 (16.7) plus that of 2005-05-16 (13.6) is 30.3.","c of 2018-02-08 to the min temp c of 2009-08-23":"The min temp c of 2018-02-08 (17.6) plus that of 2009-08-23 (15.7) is 33.3.","c of 2020-02-28 to the min temp c of 2012-12-26":"The min temp c of 2020-02-28 (16.6) plus that of 2012-12-26 (16.2) is 32.8.","c of 1998-06-05 and 1994-01-05":"The min temp c of 1998-06-05 (11.1) plus that of 1994-01-05 (21.1) is 32.2.","c of 1992-03-30 and 2015-10-29":"The min temp c of 1992-03-30 (17.6) plus that of 2015-10-29 (14.7) is 32.3.","c of 2001-07-17 to the min temp c of 1994-09-11":"The min temp c of 2001-07-17 (9.4) plus that of 1994-09-11 (10.5) is 19.9.","c of 1999-10-28 and 2001-07-17":"The min temp c of 1999-10-28 (12.6) plus that of 2001-07-17 (9.4) is 22.","c of 2011-05-08 plus the min temp c of 1998-06-05 makes what":"The min temp c of 2011-05-08 (11.9) plus that of 1998-06-05 (11.1) is 23.","c of 2021-11-13 and 2009-08-05":"The min temp c of 2021-11-13 (11.1) plus that of 2009-08-05 (6) is 17.1.","c of 2006-04-30 plus the min temp c of 1998-06-26 makes what":"The min temp c of 2006-04-30 (14.3) plus that of 1998-06-26 (6.4) is 20.7.","c of 2002-09-07 and 2014-06-30":"The min temp c of 2002-09-07 (12.2) plus that of 2014-06-30 (9.7) is 21.9.","c of 2001-06-24 to the min temp c of 2006-07-07":"The min temp c of 2001-06-24 (6.8) plus that of 2006-07-07 (6.9) is 13.7.","c of 1993-07-22 plus the min temp c of 2024-09-23 makes what":"The min temp c of 1993-07-22 (5.5) plus that of 2024-09-23 (13.1) is 18.6.","c of 2003-12-31 to the min temp c of 1993-07-22":"The min temp c of 2003-12-31 (21.2) plus that of 1993-07-22 (5.5) is 26.7.","c of 2021-09-11 and 2018-09-08":"The min temp c of 2021-09-11 (16) plus that of 2018-09-08 (7.2) is 23.2.","c of 1993-08-27 and 2007-07-20":"The min temp c of 1993-08-27 (12.4) plus that of 2007-07-20 (10.1) is 22.5.","c of 2018-09-08 to the min temp c of 1996-05-18":"The min temp c of 2018-09-08 (7.2) plus that of 1996-05-18 (13.7) is 20.9.","c of 2011-09-25 and 2023-01-11":"The min temp c of 2011-09-25 (12.5) plus that of 2023-01-11 (18.1) is 30.6.","c of 2005-01-20 to the min temp c of 2006-10-22":"The min temp c of 2005-01-20 (18.6) plus that of 2006-10-22 (13.4) is 32.","c of 2008-04-28 to the min temp c of 2019-12-20":"The min temp c of 2008-04-28 (9.6) plus that of 2019-12-20 (17.5) is 27.1.","c of 2023-03-26 and 2023-02-20":"The min temp c of 2023-03-26 (18.8) plus that of 2023-02-20 (19.5) is 38.3.","c of 2001-07-04 and 2004-07-24":"The min temp c of 2001-07-04 (9.8) plus that of 2004-07-24 (12.4) is 22.2.","c of 2004-12-14 plus the min temp c of 2023-03-26 makes what":"The min temp c of 2004-12-14 (17.8) plus that of 2023-03-26 (18.8) is 36.6.","c of 1994-01-05 to the min temp c of 2006-04-30":"The min temp c of 1994-01-05 (21.1) plus that of 2006-04-30 (14.3) is 35.4."}}},
{"id":"n-f1107bad","guard":[["has","c"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"min"}]]],"mem":{"table":{"temp c of 1996-08-25 and 2020-10-24":"The min temp c of 1996-08-25 (9.3) plus that of 2020-10-24 (14.6) is 23.9.","temp c of 1996-05-18 plus the min temp c of 2021-11-13 makes what":"The min temp c of 1996-05-18 (13.7) plus that of 2021-11-13 (11.1) is 24.8.","temp c of 2007-03-24 and 1994-07-03":"The min temp c of 2007-03-24 (17.2) plus that of 1994-07-03 (8.8) is 26.","temp c of 2008-01-12 plus the min temp c of 1998-11-06 makes what":"The min temp c of 2008-01-12 (21.1) plus that of 1998-11-06 (14.9) is 36.","temp c of 2021-02-28 and 2020-02-28":"The min temp c of 2021-02-28 (19.1) plus that of 2020-02-28 (16.6) is 35.7.","temp c of 1998-04-08 plus the min temp c of 2011-09-25 makes what":"The min temp c of 1998-04-08 (19.6) plus that of 2011-09-25 (12.5) is 32.1.","temp c of 2002-12-27 to the min temp c of 1998-04-08":"The min temp c of 2002-12-27 (18.5) plus that of 1998-04-08 (19.6) is 38.1.","temp c of 2012-12-26 plus the min temp c of 1999-11-27 makes what":"The min temp c of 2012-12-26 (16.2) plus that of 1999-11-27 (14.7) is 30.9.","temp c of 2007-06-17 plus the min temp c of 1991-12-18 makes what":"The min temp c of 2007-06-17 (12.6) plus that of 1991-12-18 (14.6) is 27.2.","temp c of 2019-08-07 to the min temp c of 1995-01-01":"The min temp c of 2019-08-07 (7.4) plus that of 1995-01-01 (18.9) is 26.3.","temp c of 2013-03-13 plus the min temp c of 1993-08-27 makes what":"The min temp c of 2013-03-13 (18.3) plus that of 1993-08-27 (12.4) is 30.7.","temp c of 2017-02-21 plus the min temp c of 2022-04-23 makes what":"The min temp c of 2017-02-21 (18.2) plus that of 2022-04-23 (14.8) is 33.","temp c of 1999-03-14 to the min temp c of 2024-11-02":"The min temp c of 1999-03-14 (20) plus that of 2024-11-02 (14.3) is 34.3.","temp c of 2013-01-21 plus the min temp c of 1999-10-28 makes what":"The min temp c of 2013-01-21 (19.9) plus that of 1999-10-28 (12.6) is 32.5.","temp c of 2024-09-23 and 1995-03-29":"The min temp c of 2024-09-23 (13.1) plus that of 1995-03-29 (14.8) is 27.9.","temp c of 2022-10-07 plus the min temp c of 2024-03-20 makes what":"The min temp c of 2022-10-07 (13.9) plus that of 2024-03-20 (17.4) is 31.3.","temp c of 2010-12-09 and 2003-12-31":"The min temp c of 2010-12-09 (21.6) plus that of 2003-12-31 (21.2) is 42.8.","temp c of 2006-07-07 plus the min temp c of 2021-02-28 makes what":"The min temp c of 2006-07-07 (6.9) plus that of 2021-02-28 (19.1) is 26.","temp c of 1991-12-18 and 2005-03-22":"The min temp c of 1991-12-18 (14.6) plus that of 2005-03-22 (16.2) is 30.8.","temp c of 2020-01-19 plus the min temp c of 2003-11-13 makes what":"The min temp c of 2020-01-19 (18.4) plus that of 2003-11-13 (11.5) is 29.9.","temp c of 2013-08-25 and 2008-04-28":"The min temp c of 2013-08-25 (9.9) plus that of 2008-04-28 (9.6) is 19.5.","temp c of 2002-07-18 and 2011-01-08":"The min temp c of 2002-07-18 (5.7) plus that of 2011-01-08 (21.3) is 27.","temp c of 1998-06-26 and 2002-12-27":"The min temp c of 1998-06-26 (6.4) plus that of 2002-12-27 (18.5) is 24.9.","temp c of 2014-12-05 and 2002-08-14":"The min temp c of 2014-12-05 (20.5) plus that of 2002-08-14 (9.3) is 29.8.","temp c of 2002-06-28 and 2005-01-20":"The min temp c of 2002-06-28 (9.3) plus that of 2005-01-20 (18.6) is 27.9.","temp c of 1994-07-03 to the min temp c of 2013-01-21":"The min temp c of 1994-07-03 (8.8) plus that of 2013-01-21 (19.9) is 28.7.","temp c of 1999-11-27 and 2011-04-05":"The min temp c of 1999-11-27 (14.7) plus that of 2011-04-05 (16.7) is 31.4.","temp c of 1993-10-24 to the min temp c of 2010-07-18":"The min temp c of 1993-10-24 (17.1) plus that of 2010-07-18 (7.9) is 25.","temp c of 2010-05-14 to the min temp c of 2009-06-26":"The min temp c of 2010-05-14 (12.3) plus that of 2009-06-26 (9.7) is 22.","temp c of 2020-05-24 plus the min temp c of 2013-08-25 makes what":"The min temp c of 2020-05-24 (12.7) plus that of 2013-08-25 (9.9) is 22.6.","temp c of 2023-02-20 to the min temp c of 2008-01-12":"The min temp c of 2023-02-20 (19.5) plus that of 2008-01-12 (21.1) is 40.6.","temp c of 2023-01-11 to the min temp c of 2020-03-29":"The min temp c of 2023-01-11 (18.1) plus that of 2020-03-29 (16.9) is 35.","temp c of 1992-05-10 plus the min temp c of 2010-12-09 makes what":"The min temp c of 1992-05-10 (15.2) plus that of 2010-12-09 (21.6) is 36.8.","temp c of 2020-03-29 plus the min temp c of 2001-07-04 makes what":"The min temp c of 2020-03-29 (16.9) plus that of 2001-07-04 (9.8) is 26.7.","temp c of 2001-01-02 and 2011-03-23":"The min temp c of 2001-01-02 (19.3) plus that of 2011-03-23 (17.5) is 36.8.","temp c of 2020-10-24 to the min temp c of 1994-08-19":"The min temp c of 2020-10-24 (14.6) plus that of 1994-08-19 (7.7) is 22.3.","temp c of 2011-01-08 to the min temp c of 2004-12-14":"The min temp c of 2011-01-08 (21.3) plus that of 2004-12-14 (17.8) is 39.1.","temp c of 1994-08-19 plus the min temp c of 2020-02-19 makes what":"The min temp c of 1994-08-19 (7.7) plus that of 2020-02-19 (15.5) is 23.2.","temp c of 2006-03-12 and 2023-02-25":"The min temp c of 2006-03-12 (20.4) plus that of 2023-02-25 (17) is 37.4.","temp c of 2002-03-20 and 2010-05-14":"The min temp c of 2002-03-20 (19.9) plus that of 2010-05-14 (12.3) is 32.2.","temp c of 2005-05-16 plus the min temp c of 1996-08-25 makes what":"The min temp c of 2005-05-16 (13.6) plus that of 1996-08-25 (9.3) is 22.9.","temp c of 2005-11-22 to the min temp c of 1992-03-27":"The min temp c of 2005-11-22 (17.3) plus that of 1992-03-27 (18.9) is 36.2.","temp c of 1992-11-24 to the min temp c of 2007-06-17":"The min temp c of 1992-11-24 (16.1) plus that of 2007-06-17 (12.6) is 28.7.","temp c of 2009-08-23 plus the min temp c of 1992-03-30 makes what":"The min temp c of 2009-08-23 (15.7) plus that of 1992-03-30 (17.6) is 33.3.","temp c of 2009-08-05 to the min temp c of 2013-03-13":"The min temp c of 2009-08-05 (6) plus that of 2013-03-13 (18.3) is 24.3.","temp c of 1991-05-19 plus the min temp c of 2007-03-24 makes what":"The min temp c of 1991-05-19 (12.5) plus that of 2007-03-24 (17.2) is 29.7.","temp c of 2020-03-27 plus the min temp c of 2001-01-02 makes what":"The min temp c of 2020-03-27 (14.7) plus that of 2001-01-02 (19.3) is 34.","temp c of 2019-03-31 plus the min temp c of 2002-06-08 makes what":"The min temp c of 2019-03-31 (11.4) plus that of 2002-06-08 (9.8) is 21.2.","temp c of 1999-03-11 to the min temp c of 2017-02-21":"The min temp c of 1999-03-11 (19.1) plus that of 2017-02-21 (18.2) is 37.3.","temp c of 2019-12-20 plus the min temp c of 2006-03-12 makes what":"The min temp c of 2019-12-20 (17.5) plus that of 2006-03-12 (20.4) is 37.9.","temp c of 2024-03-20 and 1993-10-24":"The min temp c of 2024-03-20 (17.4) plus that of 1993-10-24 (17.1) is 34.5.","temp c of 2003-11-13 and 1999-03-14":"The min temp c of 2003-11-13 (11.5) plus that of 1999-03-14 (20) is 31.5.","temp c of 2010-07-18 plus the min temp c of 2002-06-28 makes what":"The min temp c of 2010-07-18 (7.9) plus that of 2002-06-28 (9.3) is 17.2.","temp c of 2022-04-23 and 1992-11-24":"The min temp c of 2022-04-23 (14.8) plus that of 1992-11-24 (16.1) is 30.9.","temp c of 1997-02-16 to the min temp c of 2020-03-27":"The min temp c of 1997-02-16 (21.2) plus that of 2020-03-27 (14.7) is 35.9.","temp c of 2009-06-26 plus the min temp c of 2014-12-05 makes what":"The min temp c of 2009-06-26 (9.7) plus that of 2014-12-05 (20.5) is 30.2.","temp c of 2004-07-24 to the min temp c of 2020-05-24":"The min temp c of 2004-07-24 (12.4) plus that of 2020-05-24 (12.7) is 25.1.","temp c of 2015-10-29 to the min temp c of 2020-01-19":"The min temp c of 2015-10-29 (14.7) plus that of 2020-01-19 (18.4) is 33.1.","temp c of 2023-02-25 to the min temp c of 1992-05-10":"The min temp c of 2023-02-25 (17) plus that of 1992-05-10 (15.2) is 32.2.","temp c of 2005-03-22 to the min temp c of 2021-09-04":"The min temp c of 2005-03-22 (16.2) plus that of 2021-09-04 (13.1) is 29.3.","temp c of 2002-08-14 to the min temp c of 2011-05-08":"The min temp c of 2002-08-14 (9.3) plus that of 2011-05-08 (11.9) is 21.2.","temp c of 2011-03-23 to the min temp c of 2019-03-31":"The min temp c of 2011-03-23 (17.5) plus that of 2019-03-31 (11.4) is 28.9.","temp c of 1991-06-23 and 1999-03-11":"The min temp c of 1991-06-23 (12.5) plus that of 1999-03-11 (19.1) is 31.6.","temp c of 1995-03-29 to the min temp c of 2022-10-07":"The min temp c of 1995-03-29 (14.8) plus that of 2022-10-07 (13.9) is 28.7.","temp c of 2002-06-08 and 2019-08-07":"The min temp c of 2002-06-08 (9.8) plus that of 2019-08-07 (7.4) is 17.2.","temp c of 2020-02-19 and 2018-02-08":"The min temp c of 2020-02-19 (15.5) plus that of 2018-02-08 (17.6) is 33.1.","temp c of 1992-03-27 plus the min temp c of 2002-09-07 makes what":"The min temp c of 1992-03-27 (18.9) plus that of 2002-09-07 (12.2) is 31.1.","temp c of 2021-09-04 plus the min temp c of 2004-04-18 makes what":"The min temp c of 2021-09-04 (13.1) plus that of 2004-04-18 (13) is 26.1.","temp c of 2006-10-22 plus the min temp c of 2021-09-11 makes what":"The min temp c of 2006-10-22 (13.4) plus that of 2021-09-11 (16) is 29.4.","temp c of 2004-04-18 and 2001-06-24":"The min temp c of 2004-04-18 (13) plus that of 2001-06-24 (6.8) is 19.8.","temp c of 2018-05-26 and 1997-02-16":"The min temp c of 2018-05-26 (7.9) plus that of 1997-02-16 (21.2) is 29.1.","temp c of 2007-07-20 to the min temp c of 1991-05-19":"The min temp c of 2007-07-20 (10.1) plus that of 1991-05-19 (12.5) is 22.6.","temp c of 1995-01-01 plus the min temp c of 2002-03-20 makes what":"The min temp c of 1995-01-01 (18.9) plus that of 2002-03-20 (19.9) is 38.8.","temp c of 1998-11-06 and 2005-11-22":"The min temp c of 1998-11-06 (14.9) plus that of 2005-11-22 (17.3) is 32.2.","temp c of 2011-04-05 to the min temp c of 2005-05-16":"The min temp c of 2011-04-05 (16.7) plus that of 2005-05-16 (13.6) is 30.3.","temp c of 2018-02-08 to the min temp c of 2009-08-23":"The min temp c of 2018-02-08 (17.6) plus that of 2009-08-23 (15.7) is 33.3.","temp c of 2020-02-28 to the min temp c of 2012-12-26":"The min temp c of 2020-02-28 (16.6) plus that of 2012-12-26 (16.2) is 32.8.","temp c of 1998-06-05 and 1994-01-05":"The min temp c of 1998-06-05 (11.1) plus that of 1994-01-05 (21.1) is 32.2.","temp c of 1992-03-30 and 2015-10-29":"The min temp c of 1992-03-30 (17.6) plus that of 2015-10-29 (14.7) is 32.3.","temp c of 2001-07-17 to the min temp c of 1994-09-11":"The min temp c of 2001-07-17 (9.4) plus that of 1994-09-11 (10.5) is 19.9.","temp c of 1999-10-28 and 2001-07-17":"The min temp c of 1999-10-28 (12.6) plus that of 2001-07-17 (9.4) is 22.","temp c of 2011-05-08 plus the min temp c of 1998-06-05 makes what":"The min temp c of 2011-05-08 (11.9) plus that of 1998-06-05 (11.1) is 23.","temp c of 2021-11-13 and 2009-08-05":"The min temp c of 2021-11-13 (11.1) plus that of 2009-08-05 (6) is 17.1.","temp c of 2006-04-30 plus the min temp c of 1998-06-26 makes what":"The min temp c of 2006-04-30 (14.3) plus that of 1998-06-26 (6.4) is 20.7.","temp c of 2002-09-07 and 2014-06-30":"The min temp c of 2002-09-07 (12.2) plus that of 2014-06-30 (9.7) is 21.9.","temp c of 2001-06-24 to the min temp c of 2006-07-07":"The min temp c of 2001-06-24 (6.8) plus that of 2006-07-07 (6.9) is 13.7.","temp c of 1993-07-22 plus the min temp c of 2024-09-23 makes what":"The min temp c of 1993-07-22 (5.5) plus that of 2024-09-23 (13.1) is 18.6.","temp c of 2003-12-31 to the min temp c of 1993-07-22":"The min temp c of 2003-12-31 (21.2) plus that of 1993-07-22 (5.5) is 26.7.","temp c of 2021-09-11 and 2018-09-08":"The min temp c of 2021-09-11 (16) plus that of 2018-09-08 (7.2) is 23.2.","temp c of 1993-08-27 and 2007-07-20":"The min temp c of 1993-08-27 (12.4) plus that of 2007-07-20 (10.1) is 22.5.","temp c of 2018-09-08 to the min temp c of 1996-05-18":"The min temp c of 2018-09-08 (7.2) plus that of 1996-05-18 (13.7) is 20.9.","temp c of 2011-09-25 and 2023-01-11":"The min temp c of 2011-09-25 (12.5) plus that of 2023-01-11 (18.1) is 30.6.","temp c of 2005-01-20 to the min temp c of 2006-10-22":"The min temp c of 2005-01-20 (18.6) plus that of 2006-10-22 (13.4) is 32.","temp c of 2008-04-28 to the min temp c of 2019-12-20":"The min temp c of 2008-04-28 (9.6) plus that of 2019-12-20 (17.5) is 27.1.","temp c of 2023-03-26 and 2023-02-20":"The min temp c of 2023-03-26 (18.8) plus that of 2023-02-20 (19.5) is 38.3.","temp c of 2001-07-04 and 2004-07-24":"The min temp c of 2001-07-04 (9.8) plus that of 2004-07-24 (12.4) is 22.2.","temp c of 2004-12-14 plus the min temp c of 2023-03-26 makes what":"The min temp c of 2004-12-14 (17.8) plus that of 2023-03-26 (18.8) is 36.6.","temp c of 1994-01-05 to the min temp c of 2006-04-30":"The min temp c of 1994-01-05 (21.1) plus that of 2006-04-30 (14.3) is 35.4."}}},
{"id":"n-8296c33a","guard":[["has","c"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the sum of the min temp c of 1996-08-25 and 2020-10-24":"The min temp c of 1996-08-25 (9.3) plus that of 2020-10-24 (14.6) is 23.9.","the sum of the min temp c of 2007-03-24 and 1994-07-03":"The min temp c of 2007-03-24 (17.2) plus that of 1994-07-03 (8.8) is 26.","the sum of the min temp c of 2021-02-28 and 2020-02-28":"The min temp c of 2021-02-28 (19.1) plus that of 2020-02-28 (16.6) is 35.7.","the sum of the min temp c of 2024-09-23 and 1995-03-29":"The min temp c of 2024-09-23 (13.1) plus that of 1995-03-29 (14.8) is 27.9.","the sum of the min temp c of 2010-12-09 and 2003-12-31":"The min temp c of 2010-12-09 (21.6) plus that of 2003-12-31 (21.2) is 42.8.","the sum of the min temp c of 1991-12-18 and 2005-03-22":"The min temp c of 1991-12-18 (14.6) plus that of 2005-03-22 (16.2) is 30.8.","the sum of the min temp c of 2013-08-25 and 2008-04-28":"The min temp c of 2013-08-25 (9.9) plus that of 2008-04-28 (9.6) is 19.5.","the sum of the min temp c of 2002-07-18 and 2011-01-08":"The min temp c of 2002-07-18 (5.7) plus that of 2011-01-08 (21.3) is 27.","the sum of the min temp c of 1998-06-26 and 2002-12-27":"The min temp c of 1998-06-26 (6.4) plus that of 2002-12-27 (18.5) is 24.9.","the sum of the min temp c of 2014-12-05 and 2002-08-14":"The min temp c of 2014-12-05 (20.5) plus that of 2002-08-14 (9.3) is 29.8.","the sum of the min temp c of 2002-06-28 and 2005-01-20":"The min temp c of 2002-06-28 (9.3) plus that of 2005-01-20 (18.6) is 27.9.","the sum of the min temp c of 1999-11-27 and 2011-04-05":"The min temp c of 1999-11-27 (14.7) plus that of 2011-04-05 (16.7) is 31.4.","the sum of the min temp c of 2001-01-02 and 2011-03-23":"The min temp c of 2001-01-02 (19.3) plus that of 2011-03-23 (17.5) is 36.8.","the sum of the min temp c of 2006-03-12 and 2023-02-25":"The min temp c of 2006-03-12 (20.4) plus that of 2023-02-25 (17) is 37.4.","the sum of the min temp c of 2002-03-20 and 2010-05-14":"The min temp c of 2002-03-20 (19.9) plus that of 2010-05-14 (12.3) is 32.2.","the sum of the min temp c of 2024-03-20 and 1993-10-24":"The min temp c of 2024-03-20 (17.4) plus that of 1993-10-24 (17.1) is 34.5.","the sum of the min temp c of 2003-11-13 and 1999-03-14":"The min temp c of 2003-11-13 (11.5) plus that of 1999-03-14 (20) is 31.5.","the sum of the min temp c of 2022-04-23 and 1992-11-24":"The min temp c of 2022-04-23 (14.8) plus that of 1992-11-24 (16.1) is 30.9.","the sum of the min temp c of 1991-06-23 and 1999-03-11":"The min temp c of 1991-06-23 (12.5) plus that of 1999-03-11 (19.1) is 31.6.","the sum of the min temp c of 2002-06-08 and 2019-08-07":"The min temp c of 2002-06-08 (9.8) plus that of 2019-08-07 (7.4) is 17.2.","the sum of the min temp c of 2020-02-19 and 2018-02-08":"The min temp c of 2020-02-19 (15.5) plus that of 2018-02-08 (17.6) is 33.1.","the sum of the min temp c of 2004-04-18 and 2001-06-24":"The min temp c of 2004-04-18 (13) plus that of 2001-06-24 (6.8) is 19.8.","the sum of the min temp c of 2018-05-26 and 1997-02-16":"The min temp c of 2018-05-26 (7.9) plus that of 1997-02-16 (21.2) is 29.1.","the sum of the min temp c of 1998-11-06 and 2005-11-22":"The min temp c of 1998-11-06 (14.9) plus that of 2005-11-22 (17.3) is 32.2.","the sum of the min temp c of 1998-06-05 and 1994-01-05":"The min temp c of 1998-06-05 (11.1) plus that of 1994-01-05 (21.1) is 32.2.","the sum of the min temp c of 1992-03-30 and 2015-10-29":"The min temp c of 1992-03-30 (17.6) plus that of 2015-10-29 (14.7) is 32.3.","the sum of the min temp c of 1999-10-28 and 2001-07-17":"The min temp c of 1999-10-28 (12.6) plus that of 2001-07-17 (9.4) is 22.","the sum of the min temp c of 2021-11-13 and 2009-08-05":"The min temp c of 2021-11-13 (11.1) plus that of 2009-08-05 (6) is 17.1.","the sum of the min temp c of 2002-09-07 and 2014-06-30":"The min temp c of 2002-09-07 (12.2) plus that of 2014-06-30 (9.7) is 21.9.","the sum of the min temp c of 2021-09-11 and 2018-09-08":"The min temp c of 2021-09-11 (16) plus that of 2018-09-08 (7.2) is 23.2.","the sum of the min temp c of 1993-08-27 and 2007-07-20":"The min temp c of 1993-08-27 (12.4) plus that of 2007-07-20 (10.1) is 22.5.","the sum of the min temp c of 2011-09-25 and 2023-01-11":"The min temp c of 2011-09-25 (12.5) plus that of 2023-01-11 (18.1) is 30.6.","the sum of the min temp c of 2023-03-26 and 2023-02-20":"The min temp c of 2023-03-26 (18.8) plus that of 2023-02-20 (19.5) is 38.3.","the sum of the min temp c of 2001-07-04 and 2004-07-24":"The min temp c of 2001-07-04 (9.8) plus that of 2004-07-24 (12.4) is 22.2."}}},
{"id":"n-cae10ea4","guard":[["hasAny",["add","added to","element","item number","more than","nth","position"]],["has","min"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-f4f16618","guard":[["hasAny",["add","added to","element","item number","more than","nth","position"]],["has","min"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-089b0044","guard":[["hasAny",["add","added to","element","item number","more than","nth","position"]],["has","min"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-446b36db","guard":[["hasAny",["add","added to","element","item number","more than","nth","position"]],["has","min"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-507332ca","guard":[["hasAny",["add","added to","element","item number","more than","nth","position"]],["has","min"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-d73e2006","guard":[["hasAny",["add","added to","element","item number","more than","nth","position"]],["has","min"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-4d290f83","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["has","min"],["has","temp"]],"pyramid":["render.template",{"lit":["The min ",{"slot":0}," c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-97205e19","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["has","min"],["has","temp"]],"pyramid":["render.template",{"lit":["The min ",{"slot":0}," c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.plain",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-092bf5a8","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["has","min"],["has","temp"]],"pyramid":["render.template",{"lit":["The min ",{"slot":0}," c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-1f0bca44","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["has","min"],["has","temp"]],"pyramid":["render.template",{"lit":["The min ",{"slot":0}," c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-8bf0466a","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["has","min"],["has","temp"]],"pyramid":["render.template",{"lit":["The min ",{"slot":0}," c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-9aee9d6e","guard":[["hasAny",["added to","element","item number","more than","nth","plus","position"]],["has","min"],["has","temp"]],"pyramid":["render.template",{"lit":["The min ",{"slot":0}," c of ",{"slot":1}," (",{"slot":2},") plus that of ",{"slot":3}," (",{"slot":4},") is ",{"slot":5},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]],["render.number",["transform.add",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"min temp c"}]]]]],"mem":null},
{"id":"n-01af3866","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2006-03-12 and 2023-02-25":"The min temp c of 2006-03-12 (20.4) plus that of 2023-02-25 (17) is 37.4."}}},
{"id":"n-05d19b4a","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2002-08-14 to the min temp c of 2011-05-08":"The min temp c of 2002-08-14 (9.3) plus that of 2011-05-08 (11.9) is 21.2."}}},
{"id":"n-08cc23db","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2014-12-05 and 2002-08-14":"The min temp c of 2014-12-05 (20.5) plus that of 2002-08-14 (9.3) is 29.8."}}},
{"id":"n-0cc7c1e1","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2019-03-31 plus the min temp c of 2002-06-08 makes what":"The min temp c of 2019-03-31 (11.4) plus that of 2002-06-08 (9.8) is 21.2."}}},
{"id":"n-0df1aee7","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2012-12-26 plus the min temp c of 1999-11-27 makes what":"The min temp c of 2012-12-26 (16.2) plus that of 1999-11-27 (14.7) is 30.9."}}},
{"id":"n-1091d223","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 1995-03-29 to the min temp c of 2022-10-07":"The min temp c of 1995-03-29 (14.8) plus that of 2022-10-07 (13.9) is 28.7."}}},
{"id":"n-124f3611","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2022-10-07 plus the min temp c of 2024-03-20 makes what":"The min temp c of 2022-10-07 (13.9) plus that of 2024-03-20 (17.4) is 31.3."}}},
{"id":"n-1297cca0","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2024-09-23 and 1995-03-29":"The min temp c of 2024-09-23 (13.1) plus that of 1995-03-29 (14.8) is 27.9."}}},
{"id":"n-1c5b536a","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 1994-01-05 to the min temp c of 2006-04-30":"The min temp c of 1994-01-05 (21.1) plus that of 2006-04-30 (14.3) is 35.4."}}},
{"id":"n-1c6c1afd","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1998-06-05 and 1994-01-05":"The min temp c of 1998-06-05 (11.1) plus that of 1994-01-05 (21.1) is 32.2."}}},
{"id":"n-27644af1","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 1995-01-01 plus the min temp c of 2002-03-20 makes what":"The min temp c of 1995-01-01 (18.9) plus that of 2002-03-20 (19.9) is 38.8."}}},
{"id":"n-28bde238","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2006-07-07 plus the min temp c of 2021-02-28 makes what":"The min temp c of 2006-07-07 (6.9) plus that of 2021-02-28 (19.1) is 26."}}},
{"id":"n-2c75f378","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1996-08-25 and 2020-10-24":"The min temp c of 1996-08-25 (9.3) plus that of 2020-10-24 (14.6) is 23.9."}}},
{"id":"n-2e249301","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2013-01-21 plus the min temp c of 1999-10-28 makes what":"The min temp c of 2013-01-21 (19.9) plus that of 1999-10-28 (12.6) is 32.5."}}},
{"id":"n-2fcb275f","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2004-04-18 and 2001-06-24":"The min temp c of 2004-04-18 (13) plus that of 2001-06-24 (6.8) is 19.8."}}},
{"id":"n-306ac215","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2023-02-25 to the min temp c of 1992-05-10":"The min temp c of 2023-02-25 (17) plus that of 1992-05-10 (15.2) is 32.2."}}},
{"id":"n-3737e26d","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2004-12-14 plus the min temp c of 2023-03-26 makes what":"The min temp c of 2004-12-14 (17.8) plus that of 2023-03-26 (18.8) is 36.6."}}},
{"id":"n-3af74b09","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1998-11-06 and 2005-11-22":"The min temp c of 1998-11-06 (14.9) plus that of 2005-11-22 (17.3) is 32.2."}}},
{"id":"n-439bbd95","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2010-05-14 to the min temp c of 2009-06-26":"The min temp c of 2010-05-14 (12.3) plus that of 2009-06-26 (9.7) is 22."}}},
{"id":"n-43bb6f4e","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2023-01-11 to the min temp c of 2020-03-29":"The min temp c of 2023-01-11 (18.1) plus that of 2020-03-29 (16.9) is 35."}}},
{"id":"n-46d072fe","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2005-01-20 to the min temp c of 2006-10-22":"The min temp c of 2005-01-20 (18.6) plus that of 2006-10-22 (13.4) is 32."}}},
{"id":"n-53cb2d79","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 1994-07-03 to the min temp c of 2013-01-21":"The min temp c of 1994-07-03 (8.8) plus that of 2013-01-21 (19.9) is 28.7."}}},
{"id":"n-544ca73b","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2002-12-27 to the min temp c of 1998-04-08":"The min temp c of 2002-12-27 (18.5) plus that of 1998-04-08 (19.6) is 38.1."}}},
{"id":"n-59bcba8f","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2002-06-28 and 2005-01-20":"The min temp c of 2002-06-28 (9.3) plus that of 2005-01-20 (18.6) is 27.9."}}},
{"id":"n-5a253e05","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2002-07-18 and 2011-01-08":"The min temp c of 2002-07-18 (5.7) plus that of 2011-01-08 (21.3) is 27."}}},
{"id":"n-5b7cdc47","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2023-03-26 and 2023-02-20":"The min temp c of 2023-03-26 (18.8) plus that of 2023-02-20 (19.5) is 38.3."}}},
{"id":"n-5c9eae90","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2011-09-25 and 2023-01-11":"The min temp c of 2011-09-25 (12.5) plus that of 2023-01-11 (18.1) is 30.6."}}},
{"id":"n-5e6b7bb9","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2004-07-24 to the min temp c of 2020-05-24":"The min temp c of 2004-07-24 (12.4) plus that of 2020-05-24 (12.7) is 25.1."}}},
{"id":"n-5f672ec8","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1992-03-30 and 2015-10-29":"The min temp c of 1992-03-30 (17.6) plus that of 2015-10-29 (14.7) is 32.3."}}},
{"id":"n-5fad5fc7","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2006-04-30 plus the min temp c of 1998-06-26 makes what":"The min temp c of 2006-04-30 (14.3) plus that of 1998-06-26 (6.4) is 20.7."}}},
{"id":"n-622ffa0e","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2018-05-26 and 1997-02-16":"The min temp c of 2018-05-26 (7.9) plus that of 1997-02-16 (21.2) is 29.1."}}},
{"id":"n-66e3a326","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 1996-05-18 plus the min temp c of 2021-11-13 makes what":"The min temp c of 1996-05-18 (13.7) plus that of 2021-11-13 (11.1) is 24.8."}}},
{"id":"n-68159e9b","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2020-10-24 to the min temp c of 1994-08-19":"The min temp c of 2020-10-24 (14.6) plus that of 1994-08-19 (7.7) is 22.3."}}},
{"id":"n-6bd0cf3e","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2008-04-28 to the min temp c of 2019-12-20":"The min temp c of 2008-04-28 (9.6) plus that of 2019-12-20 (17.5) is 27.1."}}},
{"id":"n-70eaa2f4","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1999-11-27 and 2011-04-05":"The min temp c of 1999-11-27 (14.7) plus that of 2011-04-05 (16.7) is 31.4."}}},
{"id":"n-70f439fb","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 1994-08-19 plus the min temp c of 2020-02-19 makes what":"The min temp c of 1994-08-19 (7.7) plus that of 2020-02-19 (15.5) is 23.2."}}},
{"id":"n-77debaa3","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2002-06-08 and 2019-08-07":"The min temp c of 2002-06-08 (9.8) plus that of 2019-08-07 (7.4) is 17.2."}}},
{"id":"n-79428256","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2021-02-28 and 2020-02-28":"The min temp c of 2021-02-28 (19.1) plus that of 2020-02-28 (16.6) is 35.7."}}},
{"id":"n-7962b26f","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2018-09-08 to the min temp c of 1996-05-18":"The min temp c of 2018-09-08 (7.2) plus that of 1996-05-18 (13.7) is 20.9."}}},
{"id":"n-7ad835a9","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2005-03-22 to the min temp c of 2021-09-04":"The min temp c of 2005-03-22 (16.2) plus that of 2021-09-04 (13.1) is 29.3."}}},
{"id":"n-7dc6842a","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2015-10-29 to the min temp c of 2020-01-19":"The min temp c of 2015-10-29 (14.7) plus that of 2020-01-19 (18.4) is 33.1."}}},
{"id":"n-7e1dca68","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2007-06-17 plus the min temp c of 1991-12-18 makes what":"The min temp c of 2007-06-17 (12.6) plus that of 1991-12-18 (14.6) is 27.2."}}},
{"id":"n-7f761793","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2006-10-22 plus the min temp c of 2021-09-11 makes what":"The min temp c of 2006-10-22 (13.4) plus that of 2021-09-11 (16) is 29.4."}}},
{"id":"n-8399ba4f","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2001-06-24 to the min temp c of 2006-07-07":"The min temp c of 2001-06-24 (6.8) plus that of 2006-07-07 (6.9) is 13.7."}}},
{"id":"n-844a0773","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 1997-02-16 to the min temp c of 2020-03-27":"The min temp c of 1997-02-16 (21.2) plus that of 2020-03-27 (14.7) is 35.9."}}},
{"id":"n-851bce02","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 1999-03-14 to the min temp c of 2024-11-02":"The min temp c of 1999-03-14 (20) plus that of 2024-11-02 (14.3) is 34.3."}}},
{"id":"n-8d51abeb","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2019-08-07 to the min temp c of 1995-01-01":"The min temp c of 2019-08-07 (7.4) plus that of 1995-01-01 (18.9) is 26.3."}}},
{"id":"n-8d996859","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2009-06-26 plus the min temp c of 2014-12-05 makes what":"The min temp c of 2009-06-26 (9.7) plus that of 2014-12-05 (20.5) is 30.2."}}},
{"id":"n-8ef053ff","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2020-03-29 plus the min temp c of 2001-07-04 makes what":"The min temp c of 2020-03-29 (16.9) plus that of 2001-07-04 (9.8) is 26.7."}}},
{"id":"n-908e4100","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2005-05-16 plus the min temp c of 1996-08-25 makes what":"The min temp c of 2005-05-16 (13.6) plus that of 1996-08-25 (9.3) is 22.9."}}},
{"id":"n-90f65ea2","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2001-07-17 to the min temp c of 1994-09-11":"The min temp c of 2001-07-17 (9.4) plus that of 1994-09-11 (10.5) is 19.9."}}},
{"id":"n-933436a3","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2022-04-23 and 1992-11-24":"The min temp c of 2022-04-23 (14.8) plus that of 1992-11-24 (16.1) is 30.9."}}},
{"id":"n-94192324","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2020-03-27 plus the min temp c of 2001-01-02 makes what":"The min temp c of 2020-03-27 (14.7) plus that of 2001-01-02 (19.3) is 34."}}},
{"id":"n-94b4af12","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2018-02-08 to the min temp c of 2009-08-23":"The min temp c of 2018-02-08 (17.6) plus that of 2009-08-23 (15.7) is 33.3."}}},
{"id":"n-9db4433d","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1993-08-27 and 2007-07-20":"The min temp c of 1993-08-27 (12.4) plus that of 2007-07-20 (10.1) is 22.5."}}},
{"id":"n-9ea5d014","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 1991-05-19 plus the min temp c of 2007-03-24 makes what":"The min temp c of 1991-05-19 (12.5) plus that of 2007-03-24 (17.2) is 29.7."}}},
{"id":"n-9ee3d0ba","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2001-07-04 and 2004-07-24":"The min temp c of 2001-07-04 (9.8) plus that of 2004-07-24 (12.4) is 22.2."}}},
{"id":"n-a5cbbb8f","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2011-04-05 to the min temp c of 2005-05-16":"The min temp c of 2011-04-05 (16.7) plus that of 2005-05-16 (13.6) is 30.3."}}},
{"id":"n-aa63ef02","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2020-02-19 and 2018-02-08":"The min temp c of 2020-02-19 (15.5) plus that of 2018-02-08 (17.6) is 33.1."}}},
{"id":"n-aae5fcd1","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2003-11-13 and 1999-03-14":"The min temp c of 2003-11-13 (11.5) plus that of 1999-03-14 (20) is 31.5."}}},
{"id":"n-ac830df1","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2020-05-24 plus the min temp c of 2013-08-25 makes what":"The min temp c of 2020-05-24 (12.7) plus that of 2013-08-25 (9.9) is 22.6."}}},
{"id":"n-ae7b10f3","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2011-05-08 plus the min temp c of 1998-06-05 makes what":"The min temp c of 2011-05-08 (11.9) plus that of 1998-06-05 (11.1) is 23."}}},
{"id":"n-b0095ea8","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1998-06-26 and 2002-12-27":"The min temp c of 1998-06-26 (6.4) plus that of 2002-12-27 (18.5) is 24.9."}}},
{"id":"n-b06b40ed","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2021-09-04 plus the min temp c of 2004-04-18 makes what":"The min temp c of 2021-09-04 (13.1) plus that of 2004-04-18 (13) is 26.1."}}},
{"id":"n-b1a21822","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2009-08-05 to the min temp c of 2013-03-13":"The min temp c of 2009-08-05 (6) plus that of 2013-03-13 (18.3) is 24.3."}}},
{"id":"n-b691fab3","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2008-01-12 plus the min temp c of 1998-11-06 makes what":"The min temp c of 2008-01-12 (21.1) plus that of 1998-11-06 (14.9) is 36."}}},
{"id":"n-b705c248","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2009-08-23 plus the min temp c of 1992-03-30 makes what":"The min temp c of 2009-08-23 (15.7) plus that of 1992-03-30 (17.6) is 33.3."}}},
{"id":"n-be127f8e","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1991-06-23 and 1999-03-11":"The min temp c of 1991-06-23 (12.5) plus that of 1999-03-11 (19.1) is 31.6."}}},
{"id":"n-c04d8a0c","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 1992-03-27 plus the min temp c of 2002-09-07 makes what":"The min temp c of 1992-03-27 (18.9) plus that of 2002-09-07 (12.2) is 31.1."}}},
{"id":"n-c2e2cdd2","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2021-11-13 and 2009-08-05":"The min temp c of 2021-11-13 (11.1) plus that of 2009-08-05 (6) is 17.1."}}},
{"id":"n-c4e0e176","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2011-01-08 to the min temp c of 2004-12-14":"The min temp c of 2011-01-08 (21.3) plus that of 2004-12-14 (17.8) is 39.1."}}},
{"id":"n-cb394e97","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2020-02-28 to the min temp c of 2012-12-26":"The min temp c of 2020-02-28 (16.6) plus that of 2012-12-26 (16.2) is 32.8."}}},
{"id":"n-cd9faba3","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2007-03-24 and 1994-07-03":"The min temp c of 2007-03-24 (17.2) plus that of 1994-07-03 (8.8) is 26."}}},
{"id":"n-ceed0001","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2021-09-11 and 2018-09-08":"The min temp c of 2021-09-11 (16) plus that of 2018-09-08 (7.2) is 23.2."}}},
{"id":"n-cf979971","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2017-02-21 plus the min temp c of 2022-04-23 makes what":"The min temp c of 2017-02-21 (18.2) plus that of 2022-04-23 (14.8) is 33."}}},
{"id":"n-d202f5c5","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 1999-03-11 to the min temp c of 2017-02-21":"The min temp c of 1999-03-11 (19.1) plus that of 2017-02-21 (18.2) is 37.3."}}},
{"id":"n-d5f7db44","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 1992-05-10 plus the min temp c of 2010-12-09 makes what":"The min temp c of 1992-05-10 (15.2) plus that of 2010-12-09 (21.6) is 36.8."}}},
{"id":"n-d729cae9","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2019-12-20 plus the min temp c of 2006-03-12 makes what":"The min temp c of 2019-12-20 (17.5) plus that of 2006-03-12 (20.4) is 37.9."}}},
{"id":"n-d91c4e28","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2020-01-19 plus the min temp c of 2003-11-13 makes what":"The min temp c of 2020-01-19 (18.4) plus that of 2003-11-13 (11.5) is 29.9."}}},
{"id":"n-db3dcb2b","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1999-10-28 and 2001-07-17":"The min temp c of 1999-10-28 (12.6) plus that of 2001-07-17 (9.4) is 22."}}},
{"id":"n-de550e7c","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2010-07-18 plus the min temp c of 2002-06-28 makes what":"The min temp c of 2010-07-18 (7.9) plus that of 2002-06-28 (9.3) is 17.2."}}},
{"id":"n-dec8b050","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2002-03-20 and 2010-05-14":"The min temp c of 2002-03-20 (19.9) plus that of 2010-05-14 (12.3) is 32.2."}}},
{"id":"n-df929a16","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 1993-07-22 plus the min temp c of 2024-09-23 makes what":"The min temp c of 1993-07-22 (5.5) plus that of 2024-09-23 (13.1) is 18.6."}}},
{"id":"n-dfdb275e","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2013-08-25 and 2008-04-28":"The min temp c of 2013-08-25 (9.9) plus that of 2008-04-28 (9.6) is 19.5."}}},
{"id":"n-e454def6","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 1992-11-24 to the min temp c of 2007-06-17":"The min temp c of 1992-11-24 (16.1) plus that of 2007-06-17 (12.6) is 28.7."}}},
{"id":"n-e6df31f4","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2010-12-09 and 2003-12-31":"The min temp c of 2010-12-09 (21.6) plus that of 2003-12-31 (21.2) is 42.8."}}},
{"id":"n-e843acec","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2011-03-23 to the min temp c of 2019-03-31":"The min temp c of 2011-03-23 (17.5) plus that of 2019-03-31 (11.4) is 28.9."}}},
{"id":"n-e87764d7","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2001-01-02 and 2011-03-23":"The min temp c of 2001-01-02 (19.3) plus that of 2011-03-23 (17.5) is 36.8."}}},
{"id":"n-ebbc6040","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2002-09-07 and 2014-06-30":"The min temp c of 2002-09-07 (12.2) plus that of 2014-06-30 (9.7) is 21.9."}}},
{"id":"n-ebc964fc","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 2024-03-20 and 1993-10-24":"The min temp c of 2024-03-20 (17.4) plus that of 1993-10-24 (17.1) is 34.5."}}},
{"id":"n-ecf981ff","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 1998-04-08 plus the min temp c of 2011-09-25 makes what":"The min temp c of 1998-04-08 (19.6) plus that of 2011-09-25 (12.5) is 32.1."}}},
{"id":"n-efd19dc0","guard":[["hasAny",["c","min","sum","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the sum of the min temp c of 1991-12-18 and 2005-03-22":"The min temp c of 1991-12-18 (14.6) plus that of 2005-03-22 (16.2) is 30.8."}}},
{"id":"n-f7ba0865","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2007-07-20 to the min temp c of 1991-05-19":"The min temp c of 2007-07-20 (10.1) plus that of 1991-05-19 (12.5) is 22.6."}}},
{"id":"n-f9baafa5","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2023-02-20 to the min temp c of 2008-01-12":"The min temp c of 2023-02-20 (19.5) plus that of 2008-01-12 (21.1) is 40.6."}}},
{"id":"n-fb31a5d8","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2005-11-22 to the min temp c of 1992-03-27":"The min temp c of 2005-11-22 (17.3) plus that of 1992-03-27 (18.9) is 36.2."}}},
{"id":"n-fbae5448","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 1993-10-24 to the min temp c of 2010-07-18":"The min temp c of 1993-10-24 (17.1) plus that of 2010-07-18 (7.9) is 25."}}},
{"id":"n-fbe24214","guard":[["hasAny",["add","c","min","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"add the min temp c of 2003-12-31 to the min temp c of 1993-07-22":"The min temp c of 2003-12-31 (21.2) plus that of 1993-07-22 (5.5) is 26.7."}}},
{"id":"n-feb80cd5","guard":[["hasAny",["c","makes","min","plus","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the min temp c of 2013-03-13 plus the min temp c of 1993-08-27 makes what":"The min temp c of 2013-03-13 (18.3) plus that of 1993-08-27 (12.4) is 30.7."}}},
{"id":"n-de6cc315","guard":[["hasAny",["normalise","normalize","simplify the text","sum"]],["has","temp"],["has","min"]],"pyramid":["render.str",["transform.norm",{"lit":"26"},["sense.last"]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the sum of the min temp c of 1996-08-25 and 2020-10-24","expect":{"contains":["23.9"],"notRefusal":true}},{"q":"the min temp c of 1996-05-18 plus the min temp c of 2021-11-13 makes what","expect":{"contains":["24.8"],"notRefusal":true}},{"q":"what is the sum of the min temp c of 2007-03-24 and 1994-07-03","expect":{"contains":["26"],"notRefusal":true}},{"q":"the min temp c of 2008-01-12 plus the min temp c of 1998-11-06 makes what","expect":{"contains":["36"],"notRefusal":true}},{"q":"what is the sum of the min temp c of 2021-02-28 and 2020-02-28","expect":{"contains":["35.7"],"notRefusal":true}},{"q":"the min temp c of 1998-04-08 plus the min temp c of 2011-09-25 makes what","expect":{"contains":["32.1"],"notRefusal":true}},{"q":"add the min temp c of 2002-12-27 to the min temp c of 1998-04-08","expect":{"contains":["38.1"],"notRefusal":true}},{"q":"the min temp c of 2012-12-26 plus the min temp c of 1999-11-27 makes what","expect":{"contains":["30.9"],"notRefusal":true}},{"q":"the min temp c of 2007-06-17 plus the min temp c of 1991-12-18 makes what","expect":{"contains":["27.2"],"notRefusal":true}},{"q":"add the min temp c of 2019-08-07 to the min temp c of 1995-01-01","expect":{"contains":["26.3"],"notRefusal":true}},{"q":"the min temp c of 2013-03-13 plus the min temp c of 1993-08-27 makes what","expect":{"contains":["30.7"],"notRefusal":true}},{"q":"the min temp c of 2017-02-21 plus the min temp c of 2022-04-23 makes what","expect":{"contains":["33"],"notRefusal":true}},{"q":"add the min temp c of 1999-03-14 to the min temp c of 2024-11-02","expect":{"contains":["34.3"],"notRefusal":true}},{"q":"the min temp c of 2013-01-21 plus the min temp c of 1999-10-28 makes what","expect":{"contains":["32.5"],"notRefusal":true}},{"q":"what is the sum of the min temp c of 2024-09-23 and 1995-03-29","expect":{"contains":["27.9"],"notRefusal":true}},{"q":"the min temp c of 2022-10-07 plus the min temp c of 2024-03-20 makes what","expect":{"contains":["31.3"],"notRefusal":true}},{"q":"what is the sum of the min temp c of 2010-12-09 and 2003-12-31","expect":{"contains":["42.8"],"notRefusal":true}},{"q":"the min temp c of 2006-07-07 plus the min temp c of 2021-02-28 makes what","expect":{"contains":["26"],"notRefusal":true}},{"q":"what is the sum of the min temp c of 1991-12-18 and 2005-03-22","expect":{"contains":["30.8"],"notRefusal":true}},{"q":"the min temp c of 2020-01-19 plus the min temp c of 2003-11-13 makes what","expect":{"contains":["29.9"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
