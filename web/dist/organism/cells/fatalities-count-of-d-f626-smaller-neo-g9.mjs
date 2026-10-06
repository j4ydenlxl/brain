// fatalities-count-of-d-f626-smaller-neo-g9.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"fatalities-count-of-d-f626-smaller-neo-g9","class":"fatalities-count-of-d-f626-smaller","generation":9,"lane":"neo","grownFrom":["whose fatalities count is smaller: 2016-10-10 or 1996-03-27","whose fatalities count is smaller: 2016-11-26 or 2008-09-06","between 1994-04-15 and 1998-10-09, which has the lesser fatalities count","between 2004-10-18 and 1994-01-11, which has the lesser fatalities count","which has the smaller fatalities count, 2011-08-19 or 2011-10-29","whose fatalities count is smaller: 2002-09-29 or 2010-03-25","whose fatalities count is smaller: 1996-08-03 or 2016-08-26","which has the smaller fatalities count, 2009-05-04 or 1997-10-28","whose fatalities count is smaller: 2011-07-29 or 1992-10-31","which has the smaller fatalities count, 1995-06-15 or 2011-08-23","which has the smaller fatalities count, 2003-11-08 or 1997-07-08","between 2003-04-12 and 1994-09-06, which has the lesser fatalities count","between 2011-11-04 and 1996-12-23, which has the lesser fatalities count","whose fatalities count is smaller: 1994-01-11 or 1997-03-04","between 1998-09-28 and 2016-02-14, which has the lesser fatalities count","between 2007-02-19 and 2002-09-29, which has the lesser fatalities count","whose fatalities count is smaller: 2003-11-03 or 2016-03-11","whose fatalities count is smaller: 1995-10-13 or 2015-10-28","which has the smaller fatalities count, 1998-05-30 or 2003-07-05","between 2001-09-14 and 2016-08-01, which has the lesser fatalities count"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-daily-accidents-6344aa","columns":["date","fatalities count"],"n":9132,"cols":[{"f":"01992-01-01|92|97|812|803|817|93|820|814|91|98|96|805|825|94|815|821|96|830|823|92|810|808|99|94|62-01|93|98|94|97|811|96|94|95|97|822|91|94|809|812|806|810|829|813|63-01|92|94|96|814|92|807|815|820|819|821|93|809|95|828|830|91|824|64-04|96|98|810|92|93|99|826|95|65-01|92|93|98|99|816|94|95|824|99|830|66-06|97|99|98|813|99|805|821|97|96|98|67-04|810|95|92|825|817|98|68-01|92|821|92|830|69-04|814|96|820|96|68-20|510-03|810|96|802|823|61-03|811|62-24|98|502-26|69-05|68-09|62-20|33-01-08|813|824|62-23|91|63-08|62-24|64-16|824|66-11|92|826|67-02|93|817|824|831|68-13|69-25|510-02|99|816|823|99|61-04|812|62-10|34-02-07|66-25|68-13|510-14|35-06-10|67-15|69-29|36-07-05|510-04|37-10-11|61-01|62-20|38-06-27|39-05-29|69-25|510-09|02000-05-07|31-09-22|32-02-25|66-29|68-31|38-01-15|39-01-12|62-23|63-25|64-14|210-03-16|803|512-27|31-01-02|68-29|62-28|33-02-11|34-01-29|01992-01-06|819|827|98|99|831|62-02|95|818|99|823|95|97|98|63-03|98|810|91|93|96|97|98|822|95|96|97|99|64-01|92|93|95|97|99|811|94|95|96|97|98|820|91|92|93|94|97|98|99|830|65-04|95|96|97|810|91|92|93|97|98|99|820|91|92|93|95|96|97|98|831|66-01|92|93|94|810|91|92|94|95|96|97|98|820|92|93|94|95|99|830|67-01|92|93|95|96|97|98|99|811|93|94|96|99|820|91|92|93|94|96|97|98|99|830|91|68-03|94|95|96|97|98|810|91|92|93|94|95|96|97|98|99|823|94|95|96|97|98|99|831|69-01|92|93|96|97|98|99|810|91|92|93|95|97|98|99|821|92|93|94|95|97|98|99|830|510-01|94|95|96|97|98|99|811|92|93|94|95|97|98|99|820|91|92|94|95|96|97|98|99|830|91|61-01|92|94|95|96|97|98|99|810|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|95|96|97|99|830|91|33-01-01|92|93|94|95|96|97|99|810|91|92|94|95|96|97|98|99|820|91|92|93|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|92|95|96|97|98|63-01|92|93|94|95|96|97|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|97|98|99|820|91|92|93|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|93|94|95|96|97|98|99|820|91|92|93|94|95|97|98|99|830|67-01|94|95|96|97|98|99|810|91|92|93|94|95|96|98|99|820|91|92|93|95|96|97|98|99|830|68-01|92|93|94|95|96|97|98|99|810|91|92|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|96|97|98|99|830|510-01|93|94|95|96|97|98|810|91|92|93|94|95|97|98|99|820|91|92|94|95|96|97|98|830|91|61-01|92|93|95|96|97|98|99|810|91|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|811|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|811|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|36-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|37-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-02|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|821|92|93|94|95|96|97|98|99|830|91|38-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|39-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|96|97|98|99|830|510-01|92|93|94|95|96|97|98|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|02000-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|31-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|36-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|37-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|38-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|39-01-01|92|93|94|95|96|97|98|99|810|91|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|210-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|94|95|96|97|98|99|810|91|92|93|94|95|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|98|99|830|91|31-01-01|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|36-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91","sep":"|"},{"d":"144|111|85|127|182|130|119|120|106|124|147|82|99|150|173|91|115|118|113|149|103|129|126|117|152|145|112|190|93|134|107|105|155|170|81|154|164|116|131|96|108|95|177|121|136|64|110|163|138|88|162|148|158|100|171|89|94|114|139|92|109|80|184|104|101|153|176|122|135|125|194|137|209|189|181|199|222|142|146|143|178|196|226|186|140|151|237|168|192|195|203|187|198|227|183|123|161|208|165|228|179|175|185|213|200|174|141|128|172|214|167|233|210|197|160|169|156|166|201|132|83|193|188|84|133|102|98|90|157|97|86|159|204|218|207|220|191|224|235|205|219|223|221|230|225|229|212|206|180|216|215|87|202|238|217|231|249|246|211|252|243|239|240|234|247|244|250|236|232|79|251|241|76|75|63|60|73|74|70|77|69|78|67|72|68|254|266|255|256|270|257|273|258|285|242|253|245|299|47|71","i":"0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,10,11,12,13,14,15,16,17,18,19,1a,1b,1c,1d,1e,1f,1g,1h,1i,1j,1k,1l,1m,1n,1o,1p,1q,1r,1s,1t,1u,1v,1w,1x,1y,1z,20,21,22,23,24,25,26,27,28,29,2a,2b,2c,2d,2e,2f,2g,2h,2i,2j,2k,2l,2m,2n,2o,2p,2q,2r,2s,2t,2u,2v,2w,2x,2y,2z,30,31,32,33,34,35,36,37,38,39,3a,3b,3c,3d,3e,3f,3g,3h,3i,3j,3k,3l,3m,3n,3o,3p,3q,3r,3s,3t,3u,3v,3w,3x,3y,3z,40,41,42,43,44,45,46,47,48,49,4a,4b,4c,4d,4e,4f,4g,4h,4i,4j,4k,4l,4m,4n,4o,4p,4q,4r,4s,4t,4u,4v,4w,4x,4y,4z,50,51,52,53,54,1,1n,1o,f,c,o,c,u,g,l,7,14,u,z,s,l,g,i,m,8,u,1,h,h,1a,z,18,1k,l,1l,0,k,1a,1q,y,1l,6,z,1t,e,i,1h,13,18,5,1r,u,u,1o,1l,6,1x,a,6,1l,h,1q,1n,7,g,9,t,24,5,1a,1a,17,1g,12,1m,1g,2d,9,3b,1q,25,18,2c,1l,j,20,8,1c,18,1c,1o,i,2c,2f,1y,1m,1a,1a,l,2n,4,g,25,25,2o,q,t,m,l,2j,2c,n,c,11,1b,1e,p,14,l,a,e,2b,0,w,27,x,2q,1i,2s,d,1m,3,2u,g,h,1z,d,26,1e,12,k,9,p,16,1o,k,3,g,x,2v,1g,1w,9,2j,20,6,1s,1j,2n,2o,1g,17,q,11,w,4,2t,18,d,1x,2i,2b,1r,2n,2y,9,2g,2y,1a,1z,2y,o,24,x,m,9,u,1u,35,55,2b,1m,18,w,2d,37,d,l,1w,37,2b,21,26,1r,1v,1c,2f,2x,29,26,1x,1l,37,i,l,1o,15,i,n,9,5,1i,2j,2c,1c,h,1c,a,28,2t,a,1o,5,i,o,r,1b,w,1m,9,1t,3,2y,1f,3,10,a,22,3,1l,1c,1a,3m,1w,u,1,3h,1j,v,11,j,1,l,h,11,1c,9,36,g,3f,f,6,k,2f,t,v,17,3h,h,17,2x,1v,26,1o,q,12,p,a,1,11,1x,15,8,1f,0,5,11,a,p,c,l,1w,12,m,1x,e,v,26,t,2z,t,3,3,c,1x,3l,18,3b,12,t,3l,2c,1s,n,38,2x,p,1,7,n,1r,l,2b,1e,6,1o,15,17,30,2j,w,1v,1d,v,6,38,36,h,1v,3c,g,2d,3n,9,3h,3l,2z,2o,34,1f,8,12,1x,1g,30,23,r,3n,1r,14,g,1u,37,10,9,p,2y,9,28,2x,39,3c,2c,3j,a,2k,2j,28,i,1a,3,2z,27,23,27,17,6,2y,38,30,1z,3h,1,2c,2x,56,10,2z,l,1o,1t,p,1y,12,2z,1s,18,2h,t,1t,1w,27,2u,31,3s,a,h,5,0,2s,22,j,5,p,12,2s,22,1x,2y,2y,z,2c,2f,w,0,a,d,3w,2b,2s,n,3g,o,2b,20,2m,0,t,38,2z,1u,2j,2j,2y,1c,d,38,28,3r,1g,1f,d,t,2d,2j,24,28,t,26,26,1w,2s,2p,2q,3e,2y,17,1w,l,3a,2f,1x,3b,j,1m,23,29,11,n,1l,3k,28,34,26,6,p,38,22,38,26,w,3b,27,2f,1z,0,39,1t,2y,30,27,12,s,z,14,2l,3q,1v,9,2d,3s,44,p,18,u,1z,2n,2g,27,u,w,1m,z,2x,2p,12,1g,2c,2k,37,1q,2u,3b,i,7,m,38,32,2t,11,n,6,j,2n,1u,1x,p,12,o,12,d,2w,z,16,10,17,r,37,1w,1r,1v,1a,h,17,h,2c,1z,5,c,k,17,n,3,1p,v,1v,12,14,3k,5,14,1z,c,12,14,10,28,v,17,3l,g,q,1w,2y,6,3h,f,q,0,2f,2f,12,v,1o,1z,i,36,3,13,1s,1d,i,36,2x,3,1l,v,l,17,37,38,11,47,f,26,2n,5,22,3,1k,3h,6,1o,2s,30,1x,1n,1o,1r,1l,2o,2f,e,m,g,l,2z,2o,1f,9,m,m,1h,18,1i,2t,3k,3g,12,l,25,2q,28,l,c,3l,2c,l,2s,1e,11,2n,l,1,0,2m,2u,2y,11,1,2f,3g,2t,1q,2c,1h,1w,m,1m,30,2s,32,w,1k,1v,2d,20,1q,37,i,0,3,1a,37,2h,4,2c,11,m,18,16,3p,a,38,6,10,27,27,1t,22,z,1x,27,3g,x,10,4,1t,2c,0,25,1i,x,1m,26,p,7,26,2x,2j,1c,5,26,1w,2b,3e,29,2d,e,6,2n,2s,2q,1i,30,0,2z,2y,3o,22,44,0,3h,3,18,e,2m,2k,2c,16,1g,2z,2u,2s,1i,39,g,1g,36,24,1q,4,2f,1e,18,2n,43,2k,1c,2c,39,36,30,3z,1u,1c,17,w,2q,27,2h,28,18,1v,3b,5,3a,3q,2f,5,m,t,1g,2v,3r,2j,2c,1f,1l,3g,1b,3o,2o,2c,12,l,2y,2g,21,2q,2y,27,3g,3b,43,2i,2h,1e,27,1o,3k,2l,3t,49,0,w,1u,1c,30,37,d,2c,d,2m,2q,3s,28,17,1a,14,3n,w,44,1b,1b,2c,25,1b,32,31,1t,t,1f,2c,2t,4,2x,2q,12,7,3k,1,16,3x,z,w,38,2p,1f,1t,44,z,26,u,25,25,28,2v,4,32,1b,27,z,2b,r,27,9,11,2d,3,r,22,1u,m,38,w,39,42,2m,1c,2y,a,2c,3g,2d,e,1z,1s,1h,3,1z,2l,2n,g,38,o,2c,27,2g,2o,1z,1h,1r,v,3g,38,1f,1m,1v,f,1r,17,2d,2c,3g,17,q,1l,7,w,1e,k,3,17,m,v,37,0,5,i,1a,2z,18,d,44,1x,n,1o,1s,2n,e,2b,3k,3b,1h,8,1x,28,2k,2d,37,15,26,6,1e,o,j,1l,3h,2n,2s,z,2s,18,2z,3l,1a,2n,2s,1e,1b,q,u,11,u,x,2m,1e,w,1l,1l,j,p,2v,22,2y,1x,7,3,36,1i,1t,2y,1h,3b,p,x,1u,11,1k,g,15,m,1w,2q,0,j,1,1x,1o,32,30,25,h,1a,3,9,30,3k,3g,3n,3,1v,28,2j,2j,1l,26,g,n,o,1u,2a,2h,1m,3,1v,w,2p,2p,28,1t,1f,25,5,1i,2s,2n,6,2d,j,2k,2i,2m,3n,26,17,3g,37,35,x,2z,3n,t,10,1u,4,3e,30,2x,1t,3,1t,23,2u,d,25,2z,2d,2o,x,3g,16,1a,5,44,36,3n,1e,1f,26,1m,39,2u,10,4,1t,1c,3s,2p,46,34,a,3k,28,3s,2s,57,3s,1f,32,1m,1g,44,43,3v,27,3k,1w,z,40,34,2j,p,1,2d,1b,3t,33,10,1f,2y,2y,1c,o,2f,1g,a,1f,36,2x,3e,3x,21,p,2z,2y,36,3q,1y,16,1c,z,g,26,3y,36,1g,10,d,2f,2v,r,28,w,2f,1i,1t,2r,58,43,3g,2q,k,26,2a,2p,3p,h,8,3k,n,2h,2v,z,1l,2f,e,30,22,4a,2o,26,28,1x,2o,49,43,2c,z,d,j,1f,46,10,1f,2o,2n,29,3g,1m,1e,6,t,14,t,25,2s,42,o,l,3g,30,7,3x,3p,1,3n,18,37,3k,22,3d,2f,p,2c,2n,3k,2w,10,1l,3l,1t,1,2z,38,3s,1v,1e,2d,17,25,38,2y,1v,v,b,1s,1o,2q,1e,l,g,18,1l,26,p,j,2n,3b,12,1w,a,2s,x,27,i,3,1l,1i,32,3g,8,13,2y,2n,1,1e,26,27,1k,q,0,2k,2y,35,1v,p,1c,14,g,j,o,2c,g,1z,30,11,j,21,2o,27,3b,w,n,z,x,3,m,3b,m,9,m,16,12,9,27,11,h,2s,1b,37,v,1o,t,2y,2z,1t,3g,3b,3g,16,m,2k,1e,p,26,2q,2y,32,2t,z,25,25,c,n,1t,2t,1q,a,q,1l,h,1x,10,r,2g,2c,n,11,i,z,3s,1m,i,1v,3g,o,32,29,3n,h,s,1v,p,37,44,16,9,3g,t,36,1b,4b,39,10,j,1x,3b,29,3d,3s,37,25,7,36,3s,2b,1f,w,2y,e,j,41,2a,1f,a,w,3g,1q,2m,2m,39,2g,1t,3b,2o,2u,2v,2u,1z,36,2u,2f,16,26,2z,2c,27,9,2q,38,2d,2y,o,p,t,21,2a,39,17,2z,2n,d,3k,2q,1q,0,17,1z,x,3s,21,x,2b,2d,2z,p,22,2w,44,1b,q,m,3k,1q,3v,2s,1t,1w,3g,w,2w,59,2j,37,1x,2z,3k,23,40,2f,1e,a,l,1v,3e,44,1i,l,36,j,2z,3o,3a,39,32,2d,1i,2q,2h,40,2b,t,a,1,j,48,3p,m,w,1,3k,0,1q,2u,37,3n,18,2x,2a,2t,2x,2x,2c,5,1g,30,31,16,3g,39,1v,1q,2h,3x,36,1e,z,1i,3e,4e,4a,o,1x,7,p,o,43,3o,a,w,1z,w,3n,31,30,1z,1m,l,2x,1e,16,2h,1e,1q,2t,32,16,2f,3d,o,3n,1z,o,1t,2q,3v,p,30,3d,1g,10,24,35,l,27,6,25,1t,3w,5a,37,21,2c,m,21,2o,z,2n,1c,o,38,18,2x,e,1x,3n,47,2y,e,3n,2c,p,1k,1c,1g,1a,22,j,2d,1a,i,36,3n,21,38,m,g,1z,1n,n,3,j,2q,1r,2y,12,9,12,38,7,k,q,i,o,3o,o,2c,i,7,11,25,1t,2v,1a,14,3i,3b,3n,16,2s,0,11,6,i,7,p,2f,0,u,1l,h,2n,2o,32,1u,1h,2n,1o,n,1g,37,1x,1f,11,1m,39,d,1t,1t,2n,9,25,3,2x,4,x,t,q,3n,7,2x,36,27,18,l,1w,t,x,4,18,h,1r,17,t,r,2g,37,g,q,t,5,2k,2g,30,9,t,2f,7,2m,3t,1b,w,w,0,3,35,44,1y,p,2d,x,m,2i,3y,23,a,6,v,a,28,16,2m,1t,3b,m,18,w,2p,2f,3n,d,36,36,1y,3v,x,d,1e,5,12,28,4,r,36,3b,p,39,20,43,2m,p,2o,2d,1i,48,x,j,3n,t,10,w,2b,2s,1q,5,12,1u,10,1i,3v,38,1m,1z,1z,32,e,48,3t,a,w,z,2f,2u,31,39,2x,2q,12,26,4,45,2p,1w,10,o,2b,46,2p,3d,1m,d,25,z,2u,2w,22,7,0,1x,2y,2t,24,0,32,9,1m,3k,2p,2f,1b,2n,18,3b,3g,3k,2w,1i,g,1o,p,p,2j,35,30,1s,0,2d,1b,43,2h,4a,t,2z,25,39,35,2p,2m,2f,o,3g,29,2b,4,w,5,o,37,2m,2i,3k,n,6,3,1x,24,2j,3k,25,1o,10,z,2h,32,m,5,1c,3k,2s,1y,18,3n,1x,1,3k,3n,3q,18,2z,6,5,a,3p,3d,1u,w,9,3e,5,a,29,30,1x,9,36,28,2f,44,1v,a,28,2o,39,2t,38,d,2o,0,3s,e,2p,38,43,20,21,1x,26,2c,1c,3h,2z,d,39,1v,w,2d,d,3k,26,1a,26,2c,h,2s,u,n,m,36,o,3h,6,g,2n,1v,27,0,32,u,1,m,2y,m,2x,w,1w,6,j,3g,27,2s,5,t,2y,s,1x,1e,1i,1m,u,o,3,c,2y,2y,11,1l,17,n,27,37,32,1s,1r,36,17,10,2o,32,0,6,1s,p,2z,2y,3a,p,1x,3h,a,9,5,t,1g,8,1l,3g,26,1f,2q,2c,2y,6,9,12,1g,21,1w,2n,1l,m,a,2b,1b,1g,1z,1t,7,1l,1b,x,37,h,2c,18,1x,z,22,2y,14,1k,n,a,2w,21,z,1w,p,1f,j,9,38,z,0,u,p,t,2j,3o,2s,p,6,w,j,23,23,9,u,36,2c,27,2f,38,3g,27,j,2f,2o,1q,37,32,l,j,n,w,w,3w,2z,26,11,27,1l,48,3p,2x,1z,38,g,26,2b,2m,q,2o,27,1y,2h,35,26,3g,p,p,2t,39,3w,37,36,1t,12,10,42,3q,2w,1f,1g,j,2c,29,35,x,36,z,2n,0,35,3r,2g,3k,3n,a,2x,22,3z,2u,r,38,38,1g,2k,3q,3v,2m,p,5,3n,23,2g,20,w,2s,t,a,2t,46,30,27,2d,3b,37,5b,34,w,1o,l,a,37,1q,45,25,1l,0,5,2f,2g,42,39,2n,3b,30,1b,2u,3s,1y,1m,2d,17,t,3a,3q,26,3g,25,25,2f,2p,3q,j,a,1x,12,o,2p,3d,39,3,1u,0,0,4,3s,44,t,d,i,1f,23,3s,3e,0,1f,j,32,16,28,1t,18,1e,2o,o,1t,3s,1m,22,p,n,n,1y,2m,1f,18,2d,36,1b,2i,43,3b,39,0,d,0,4a,37,r,z,1t,5,2q,j,30,1g,2q,25,2d,28,4b,20,3v,2k,2g,4h,16,1m,a,7,j,18,1b,1q,1q,14,1k,15,h,1o,0,m,l,6,7,n,3j,h,3,36,d,3k,k,11,1a,a,d,12,11,3f,1a,3b,7,12,32,12,q,3i,l,9,e,2c,1s,3b,2z,3l,2k,1z,18,12,1,v,q,2f,2q,h,19,1l,d,1v,32,1y,1w,5,12,5,1a,o,2g,12,1v,q,1s,10,2t,25,6,1v,3k,2y,25,26,2q,1e,m,11,t,3,x,4,3g,1o,14,36,6,3a,48,12,d,0,g,1x,3b,1b,10,2c,1r,32,g,1w,2o,1g,1m,h,1v,n,2y,4,x,5,s,q,3b,1y,3x,z,1b,3,18,m,3a,3a,37,3n,12,18,a,2x,4e,2f,12,1x,m,6,32,2v,1t,1m,26,5,2q,e,32,1f,7,27,1a,36,30,37,25,27,2z,w,2h,40,o,28,3k,1a,1z,3e,3t,36,11,30,1w,2q,2s,31,3e,10,a,1t,30,x,2v,2u,39,25,1y,18,2x,3d,3e,3n,1v,p,3h,2s,4f,30,o,q,w,o,x,2f,2i,2d,7,1,2t,e,4a,37,x,e,2o,27,43,4j,r,18,x,2d,2s,2q,4e,30,2q,o,w,26,48,21,21,1g,z,2o,j,4a,3d,44,z,1z,32,o,3a,4b,30,1t,26,38,25,26,3p,38,2o,5,3k,w,3o,2m,23,2y,1w,5,2m,1y,3d,3g,1f,27,9,2t,1i,2b,p,1g,12,39,4e,3s,18,18,3b,1b,2t,42,2x,l,12,1x,2d,44,48,1u,2d,1x,r,10,2k,3t,22,2m,3e,0,1f,30,r,27,g,32,10,x,44,24,32,25,l,25,37,e,46,2j,1g,30,2s,1g,2g,1b,0,3g,v,2c,1g,2m,40,1g,1g,1w,o,m,35,21,1t,1t,o,38,2o,30,3n,10,1i,36,5,16,1q,1c,x,0,3g,2c,26,30,23,t,26,1w,0,27,4,1i,7,t,1r,w,25,2u,0,1f,m,t,25,18,3k,36,39,17,8,u,9,3b,1t,7,i,12,g,2z,j,21,1a,6,u,1n,1m,d,5,t,m,1r,3i,2n,2m,36,1x,m,25,j,1m,37,21,7,7,1v,1z,0,2x,2j,3b,v,0,1q,1w,2f,e,3,w,1x,3,1w,3g,2f,3,1a,17,v,1x,2y,2f,37,3b,u,47,h,2u,1y,39,2d,1x,38,g,3v,2b,a,5,n,1x,a,10,2x,3n,1v,1a,2c,e,43,1u,n,1f,3k,1g,1z,37,2j,1g,s,1x,27,d,1g,34,1b,2o,1z,1x,2q,39,23,26,3b,12,k,2k,e,1u,1v,1m,2s,o,3s,2g,1t,2d,27,1x,w,28,45,21,1m,z,w,2t,2m,3r,1u,10,18,d,32,r,3e,r,z,3k,12,1b,2v,x,1q,m,7,u,2f,2j,3v,46,1q,1e,2d,2d,1t,16,1t,3h,3b,e,w,2m,2a,3v,2s,30,27,w,1i,4b,2t,d,t,30,26,34,2l,37,3n,3g,36,30,3w,29,31,1e,22,x,2t,2m,40,16,p,h,1e,1f,22,4i,3e,1v,z,26,26,29,z,2k,1x,12,w,2j,3t,2e,28,32,2z,p,2y,3s,2p,1t,2c,3h,1w,d,46,3p,35,o,17,2y,27,21,48,1e,2c,1x,0,1u,46,5c,22,1b,36,26,25,1u,2t,1m,p,27,26,1i,24,3p,1e,w,0,j,36,3k,48,2u,o,22,1g,3n,1i,4b,37,g,2o,5,1b,2j,29,1g,w,2c,2o,3k,z,2u,2c,2n,1z,i,1g,2t,2q,3n,1b,o,30,38,2c,2o,26,1,d,l,1b,44,2f,2y,27,10,11,2o,22,3s,32,12,14,2d,n,22,2m,2d,1g,1c,2z,1b,16,3v,26,3k,1b,2y,38,2x,5,14,w,2c,0,3i,39,p,h,1,9,2n,o,2q,3k,17,2z,1v,3i,3,2y,25,1l,1h,1h,l,2z,46,3k,2d,5,1h,3j,1o,2f,1c,1w,12,1o,11,1c,1c,1i,o,17,2c,3g,2y,2t,25,11,m,8,l,5d,1e,z,3g,6,6,6,a,44,2s,1w,3b,i,1s,i,26,z,1f,l,7,q,6,4,2d,18,l,1z,1o,1x,2d,16,3n,u,3h,3h,18,2f,3s,1e,8,1g,6,1m,3d,38,1t,z,5,p,p,3u,w,t,l,v,2n,12,32,3s,2i,3b,25,n,13,2q,2h,3a,2z,o,9,18,1u,2t,2f,o,4,2c,0,46,34,1g,25,1e,z,6,39,22,3o,1c,p,p,2d,2x,4,1y,2t,1c,11,1q,20,2b,1c,2x,1w,1c,3k,2m,29,d,1x,3k,2z,2d,e,2p,1i,2o,1t,d,2n,1q,1y,3s,c,5,v,1g,10,4m,2v,1w,36,30,2d,3s,20,2i,10,7,39,3g,37,3z,29,26,p,1w,o,2m,1u,2f,1m,38,36,1e,30,45,2h,1f,l,32,d,49,4n,2b,2h,23,2y,2o,2v,2g,48,5,d,p,2z,42,20,1b,e,30,22,1w,a,48,10,1z,2c,1m,1m,3a,21,21,o,w,7,25,48,3q,21,26,1x,1t,3b,1u,1y,22,i,6,27,2o,34,n,26,1m,1,z,2h,3x,1y,3g,2z,1x,36,41,2t,2q,m,e,3g,d,3r,4f,3e,w,1g,r,12,2s,4n,4,1t,4,44,44,48,3e,2b,t,12,0,d,2w,41,2u,1f,2y,16,9,34,40,a,2f,25,2c,e,2u,24,10,j,26,34,3k,2o,2u,o,2y,25,a,3k,22,1u,d,e,1w,2d,2t,2g,3a,44,p,a,p,27,20,48,1e,3n,18,w,37,22,4e,2j,x,14,39,2c,2r,3n,1z,27,3o,l,3,27,17,2y,2y,2n,18,23,w,2s,1l,3,1c,1t,2y,2x,r,1l,l,27,g,2n,3v,22,0,z,g,a,27,39,30,1u,h,2b,t,1z,e,3n,39,1w,3,5,1z,z,d,3b,2y,3g,3,d,z,1t,2o,1o,38,c,21,2u,39,q,1w,1c,27,48,3a,2c,8,1c,1w,3o,3n,30,30,l,i,h,25,3g,2t,2d,t,3g,3l,1f,1b,2v,d,1b,t,h,18,1g,3k,2m,3,1r,1m,2z,10,2i,1e,2o,z,l,3k,e,30,2f,0,3,1r,9,10,r,z,u,2z,5,1w,34,46,2o,1m,1w,j,3g,2o,3p,2f,26,1v,38,1f,23,2j,2q,5,i,a,2m,44,2p,2j,26,v,25,1y,16,3v,r,d,a,18,25,30,r,40,d,l,1m,30,1q,2g,35,12,12,1f,w,35,34,1e,z,37,2d,z,2p,2m,12,30,1q,16,2b,42,2x,1z,1t,3d,26,30,3p,4,18,a,1f,2q,2q,3a,2k,3k,1e,2y,1m,16,2w,2s,38,27,16,d,3a,2v,2h,1c,22,39,2o,36,46,3q,j,1x,1g,1v,e,3r,1f,j,2q,30,j,4e,45,38,1g,6,2z,o,21,43,32,1c,2s,38,x,41,3s,1w,1t,26,o,2v,33,31,l,c,12,1t,44,40,2k,g,1m,12,2y,42,4e,45,3,1v,3k,1l,4a,29,2o,j,3b,2c,44,4n,2k,3n,0,2f,w,d,2v,2v,22,1w,j,25,d,3d,4a,w,w,m,d,3n,3t,4a,26,1f,3g,j,10,2v,2i,10,26,36,25,z,36,3a,12,n,l,2d,7,1q,3v,25,1x,3g,37,1m,18,3n,1u,10,t,28,7,1g,23,39,1m,0,2t,1e,3u,16,3b,2c,l,1m,o,4a,44,z,2q,39,1,1t,l,11,l,i,32,2b,9,25,2d,5,1c,12,14,1,1u,2d,11,i,1x,3b,7,26,a,w,1a,n,u,g,0,1x,1x,2n,1x,2z,1c,37,10,2t,t,3,1z,1w,2o,5,1o,3b,36,1w,3,1i,2o,17,1k,1l,3j,0,39,2s,1f,1l,14,1d,v,1t,37,25,14,z,5,1w,3a,1u,1m,1k,1l,h,2y,1g,4,j,d,t,3f,1v,7,16,1e,j,18,1o,7,1g,2u,6,1s,9,1z,2x,2h,35,10,2b,l,5,m,z,3q,37,2q,28,2o,1f,o,48,1q,2q,l,1m,2f,1b,2m,21,6,g,1v,2y,1f,3y,o,t,25,2c,h,2q,4b,z,9,12,t,2q,2u,3y,35,7,2z,7,1w,3p,4e,r,l,l,g,17,3s,r,w,z,1g,2z,29,2k,3a,4,a,z,11,0,16,20,3e,2m,1z,o,n,46,43,4,2t,2y,2q,3n,3e,49,3s,1f,3n,o,4j,2l,2g,1b,3k,1h,3g,2z,46,3x,44,10,p,z,28,2t,41,4a,26,2s,37,2c,2f,4g,43,2d,g,39,j,1q,2g,37,22,2z,3n,16,1y,4e,3x,z,t,2m,1u,34,4r,2u,1v,3k,1z,3k,34,24,3s,d,o,2q,j,42,3p,2g,1g,e,3,2q,3v,r,2g,1l,9,0,11,44,4c,43,1m,1z,w,1f,2w,2e,2r,1g,p,i,1f,2g,34,32,a,2f,1t,a,42,4h,2u,z,v,1b,2b,3v,4o,2g,44,37,e,38,35,3x,2i,36,2c,1g,1v,29,29,2w,1c,1c,l,22,3w,4k,2h,1u,29,3g,1t,26,4a,38,d,1v,w,2t,1b,3y,3d,27,3k,2o,2j,2p,3e,48,44,j,4,2q,44,4,z,1f,36,30,1i,30,44,6,d,36,1f,12,28,e,x,a,27,e,37,2o,2x,2u,o,2q,2m,v,2d,3k,t,12,2y,3n,2x,25,j,25,2z,37,c,i,2f,p,1m,j,a,1c,1z,48,27,27,1c,m,12,25,o,1t,1q,1l,2y,17,1v,1c,2m,3b,17,1v,h,0,e,2t,1m,6,11,1,1,e,2o,1g,1,2n,l,12,17,34,3e,v,h,12,3h,l,4,30,1x,3l,1x,d,10,1e,w,9,5,m,11,2y,r,32,27,1c,1w,z,z,w,1g,g,8,25,2x,d,3e,o,27,1m,1s,a,w,29,p,18,x,1w,2d,3a,48,2y,0,2z,m,32,2s,35,2l,1x,1h,1l,1g,2u,2k,2q,u,6,0,2n,32,43,2m,1c,m,26,48,46,2g,2j,x,1m,1z,a,1q,4,10,m,m,22,z,e,2s,e,37,i,17,3,2i,3y,2f,10,18,2n,1e,2i,20,d,1c,38,t,1g,39,40,24,1b,0,5,39,3n,4c,3s,39,t,p,1g,2r,2a,48,37,1c,16,10,3o,3u,r,2o,1f,z,2c,3n,3p,35,1g,5,38,x,32,37,3q,a,9,25,6,4,33,1b,2t,l,x,1z,35,41,x,37,1t,a,3n,2k,4h,24,3n,1f,2v,1f,2i,2m,48,2q,1g,32,2t,3s,46,2m,11,d,1f,d,1u,2i,4,t,3k,5,l,r,40,2j,2c,0,w,0,r,2j,x,z,l,m,1b,3e,2l,2x,0,5,37,1u,3p,2v,1e,0,11,g,2d,3o,4c,2d,27,17,36,x,28,34,w,32,6,18,2o,1y,5e,3d,1m,1i,1t,3b,3n,2m,32,2z,2c,1m,26,22,45,35,l,2f,l,1v,1y,46,1q,3g,25,36,p,42,4,3k,0,6,2d,o,2h,16,2f,k,32,4o,1c,1e,2v,1i,2y,1l,z,39,e,3s,2c,36,2d,l,2g,2p,t,a,e,32,26,28,2h,3e,x,w,26,4e,3n,1q,18,q,3,11,1z,36,2h,2h,18,39,1a,2d,3,37,25,1l,n,1v,1c,1v,2d,17,3,m,9,2o,27,3k,1e,9,u,1x,3,1g,a,p,1z,n,1o,6,3b,16,e,1f,2q,1c,m,3b,2b,2q,1w,17,26,1o,c,1x,2q,4,2z,1f,1,9,2d,3s,1c,27,1o,1,1z,32,3a,e,3,h,3l,2t,1u,1q,l,8,n,n,2d,1g,21,j,1w,q,12,d,26,29,17,1a,v,z,12,1q,3o,e,j,27,4,27,16,3w,39,4,n,1g,u,2b,2j,21,27,1z,1u,38,2u,2j,36,1e,1h,1m,3g,z,2j,2f,g,27,1z,0,3k,42,48,1m,h,1a,3g,2k,29,1i,9,2d,q,l,4,4i,16,1e,0,d,1f,41,2p,2w,2t,1v,1m,39,2b,3v,28,28,3n,w,37,2f,48,1b,38,2y,27,2x,3n,2r,2s,1b,1i,2c,2q,20,4l,4n,j,3b,38,3k,3v,2a,3u,2m,44,2y,d,x,3w,10,1q,1e,2q,44,23,4d,2m,25,p,o,25,48,2e,2p,2o,26,p,z,33,3v,3a,w,27,3e,1q,23,4a,2h,21,1z,1t,w,37,45,30,3,o,27,1t,16,3a,2u,3k,25,1g,9,3q,2w,3w,w,18,1f,21,41,2a,d,16,12,2m,1m,32,3p,3s,g,j,1c,3k,2x,3d,21,2z,2n,25,r,29,31,1g,2c,x,l,36,2h,5f,z,28,39,5,3q,4l,41,1t,t,5,2d,30,2l,45,28,22,1t,d,1t,3e,3v,32,p,36,36,2m,16,30,43,2o,27,32,0,e,2l,2y,0,3b,2q,w,40,31,3d,44,3n,3k,18,4h,2v,27,2o,3e,4l,2x,1t,2b,2w,p,7,2o,2t,1g,4,1q,17,36,1w,2c,30,28,10,1w,o,w,w,3r,3k,3k,39,1e,0,e,3s,0,a,2n,2y,1m,1a,2x,1b,2t,l,27,3g,l,1w,1b,1x,2d,1w,3,0,x,3k,a,1l,26,l,2n,38,d,1x,1v,1x,12,t,1b,2m,2o,l,5,s,27,44,2m,1m,1z,1t,27,p,j,d,3g,q,1o,27,1m,32,2s,j,1g,11,1s,2y,t,3x,z,9,18,l,2f,p,44,3a,a,0,l,1c,r,4g,38,1s,1v,m,1a,28,0,2x,11,1l,3,1x,d,2h,2f,18,2n,11,1c,3n,44,x,5,j,0,18,1t,r,39,a,2c,3g,j,16,3q,10,1t,n,2z,2d,r,2h,10,h,6,1r,h,2s,2h,32,m,5,27,x,2g,45,34,5,i,p,o,2p,2a,2d,2q,10,1w,36,2t,3v,2k,m,w,0,2n,3y,21,1q,1u,7,p,2z,1z,46,30,36,d,w,2m,r,2a,3d,6,w,1b,23,3x,4a,44,36,1m,2y,v,3e,3a,2m,p,26,2d,1q,r,43,3o,1t,3d,35,t,10,3o,1g,17,18,12,2t,2i,4k,4a,1f,a,p,1t,36,39,29,36,2z,h,z,2t,2b,2v,2n,3k,o,22,1b,49,2u,p,3k,3k,26,3o,5g,4b,w,2z,x,1f,3e,4e,1y,2d,o,17,14,2p,2m,1q,g,1a,3,6,2q,31,16,36,36,h,32,3g,36,2x,m,1w,1m,1t,2h,4g,3d,d,u,a,32,3o,35,2s,18,2x,d,p,29,2t,2w,3n,2x,z,d,46,2b,2i,2q,2j,2q,a,28,3d,1g,1y,32,w,1o,28,3y,32,9,3h,3g,25,46,42,e,26,27,1e,5,x,3e,10,0,1f,2o,2q,16,43,e,2n,i,2q,j,w,2x,o,2y,z,1q,39,44,2i,2i,2c,14,3b,25,3k,3a,2z,3b,1f,9,1f,2w,2y,1i,2q,z,3,j,16,39,4,1b,2w,3b,44,22,2s,t,c,8,1v,1t,1m,38,17,0,i,3g,n,2s,2d,g,1s,11,3l,9,1w,2q,3g,14,1z,1w,1n,o,44,38,i,3c,1o,3k,27,2o,1v,1o,6,1w,7,1b,37,26,27,1z,1w,1g,1x,o,1t,1m,v,8,1z,2f,1i,l,n,12,p,3b,2f,4e,2d,1r,1x,1a,1v,2j,38,5,2j,m,2d,1l,2u,4,16,2y,32,0,25,2v,3k,2y,1z,1r,m,2d,x,2i,1t,l,14,0,g,38,4e,2f,p,1m,3b,5,16,2x,1z,1n,3g,6,9,1c,22,2t,17,z,17,18,34,3v,22,1e,q,2y,18,1i,1y,23,2b,12,1g,37,30,3d,1q,27,1z,0,a,36,24,38,t,3b,h,t,3n,3u,3a,q,9,1m,3k,3a,23,z,2f,g,25,p,e,1i,2t,t,1c,j,z,z,2a,23,i,17,32,1g,2j,4q,3d,e,11,2n,1i,3k,2t,28,1w,2y,1w,1b,3s,3w,4d,18,36,28,3,p,20,1u,1b,30,2c,1c,2s,34,21,p,12,1z,d,2x,1y,21,d,1z,n,1w,2m,24,16,26,1t,4h,39,43,3s,2t,1w,2d,27,g,1q,34,x,37,26,30,1e,32,3e,2m,12,6,0,6,2x,3q,e,1x,1x,11,1x,22,23,29,a,2o,l,1a,1b,2x,x,2z,2y,g,1z,a,2g,4,t,1z,1v,z,e,3q,2k,2o,1x,3k,t,2t,3s,28,t,h,1f,37,1y,1y,16,2c,n,0,w,1y,33,3e,25,h,7,1c,2h,2b,4,3g,2z,0,1t,4,2b,2u,39,5,26,a,2x,5h,1t,p,11,18,5,16,2b,39,1w,2n,12,8,2h,2j,36,z,5,44,p,2q,2q,2o,17,p,11,g,3k,2x,2b,1g,3b,1x,1w,2t,2u,38,1z,1m,q,6,4,e,3h,1a,2d,30,w,1g,2a,3g,2o,15,l,i,3b,1w,3i,g,12,f,3l,3g,7,36,11,n,38,5,36,t,14,5,1o,k,1c,n,1j,2n,27,1z,3c,1b,1u,3b,9,3j,9,2u,0,1q,1g,2f,1a,t,0,e,2o,j,q,i,1w,18,c,2f,25,6,1,8,5,39,1w,w,n,3i,4s,1v,2c,38,o,q,q,3l,1l,27,6,8,3l,1r,1j,h,1x,1w,32,3g,11,u,n,1g,3k,3h,c,2n,1,1z,j,3k,15,1o,1,14,7,9,32,1w,5,3g,6,l,z,37,1w,1k,14,1o,l,e,x,32,11,1a,3g,14,3n,21,1f,i,3b,i,3k,1b,0,2j,i,h,5,u,o,2x,w,11,1r,1s,3,2q,2j,x,13,26,17,z,0,44,1m,0,b,11,g,3b,e,1b,h,1r,u,8,1e,2s,2t,t,1f,h,a,3e,2q,3k,p,m,12,a,2y,2p,3a,2z,1w,3g,0,38,2f,e,w,c,t,3,1q,2g,3k,g,p,0,1x,3k,39,0,8,1z,g,5,5,2j,5,n,1g,1t,2c,2s,1q,16,14,t,11,g,32,3x,1e,9,14,12,6,23,2x,2f,12,m,2n,0,a,34,1f,u,m,h,q,37,37,2c,i,2n,n,2z,34,2b,3w,p,n,1a,g,l,r,10,c,1r,14,11,o,w,1x,u,1v,1,37,1g,3v,39,n,5,14,z,3o,4,1f,12,m,u,12,36,2f,1w,3g,2y,1t,5,2h,1y,39,8,3,p,2c,2s,1b,p,27,6,3l,5,2x,2u,d,h,n,9,1l,2k,4g,28,17,m,l,1z,1f,2u,1t,3m,12,3h,2c,26,3k,t,17,1s,11,3,d,p,17,11,q,1f,2n,5,2f,0,1u,2z,1l,1v,28,2h,1v,1,2d,2d,2d,1t,18,1l,5,1m,1k,u,1g,2b,1,k,2j,32,c,j,17,3i,1l,13,17,3,7,1g,11,1k,6,i,1d,z,26,1n,3l,1x,1r,5,3b,1,p,1r,g,k,v,1v,u,1k,c,1h,1h,p,1a,1v,9,2,3l,n,g,12,1m,1k,13,3j,1r,3b,17,g,s,1l,1s,q,2d,11,8,1h,1v,1,18,j,26,3f,1p,1j,2,1a,3e,25,9,1d,11,v,7,1x,q,3,c,c,47,17,3b,3,1k,1s,s,1z,38,h,1k,b,2z,v,2q,1u,1g,i,9,4p,14,0,3n,i,1v,u,a,3e,1q,1x,3i,1o,8,3,3g,1y,1b,t,11,g,k,1z,2g,5,14,b,6,k,3h,j,6,3,11,17,1x,2d,2q,5,1l,1r,12,3l,39,3x,e,1w,1k,3h,1a,1f,w,36,t,5,g,t,o,2j,17,47,1n,47,2z,1i,3e,1c,1,15,3h,c,2n,35,27,l,3b,2n,q,16,2m,18,1m,m,f,1v,3b,22,37,2n,1a,v,11,1e,0,10,14,2n,i,l,3,2u,39,1l,8,c,1v,3g,30,37,17,v,k,2n,3g,3e,28,5,1x,h,2z,9,1z,1u,3b,13,c,1v,a,28,a,2n,1l,i,j,1v,o,32,g,6,v,2y,1m,w,z,1d,1v,2c,t,x,2c,2c,11,3l,8,3h,1e,2t,t,c,15,v,17,1y,r,a,b,c,u,3j,2d,30,3g,1s,17,1,3,2b,2x,5,1s,4p,g,11,2d,1z,j,14,1n,1s,1o,0,d,17,1n,9,i,18,0,1w,1x,13,i,3j,v,t,1w,a,1o,g,8,1o,36,38,1b,7,1v,1x,1r,j,26,g,s,3m,3h,6,18,p,n,n,2n,n,1h,17,1z,1a,12,2c,g,o,1z,12,3h,25,n,11,3m,6,3g,1z,17,k,1s,12,6,1s,3m,1o,u,n,1l,1n,1r,s,k,8,1,1,37,4w,4s,13,1o,4t,n,4p,14,3m,3c,1h,1a,25,13,8,1n,k,k,1d,u,13,u,1j,v,4w,47,3j,g,1n,13,3h,8,3j,t,3,1r,s,2,3l,2,1n,1a,3j,3h,2,1d,c,k,1j,m,1k,1r,4t,4s,f,v,5,s,8,4p,s,15,1g,8,v,3c,v,v,h,3h,1r,k,1m,2z,2y,2n,u,4v,3l,1h,2z,17,1v,1a,1h,1,1r,1z,1u,37,25,m,3,n,g,1w,2q,a,f,3h,g,9,2d,12,2o,f,15,3h,y,2c,2q,h,1s,3i,3l,1n,10,32,7,6,k,2z,8,32,37,14,1x,1,47,3b,h,d,g,3l,1p,14,u,p,30,10,3j,g,2z,3h,2s,j,t,m,1v,3g,l,i,1u,18,3i,3l,1r,25,2y,26,3b,c,1l,k,n,e,2q,m,1v,1s,s,11,1c,2u,3g,1,1k,3b,7,1t,1t,1e,7,1r,1l,m,p,38,p,2z,13,n,25,3k,2q,1f,6,g,1k,k,x,2b,36,2n,8,1o,1x,1f,2x,12,1x,1x,1n,k,10,2x,38,1f,3c,p,6,2x,1q,1c,t,3i,h,11,1t,1f,3g,3,14,3h,h,1u,2t,2o,6,c,1r,18,12,2s,1c,0,1l,q,1s,1b,2s,2f,9,11,5,n,7,2q,1t,1l,2,1d,2n,2f,2m,e,27,c,1z,w,0,1q,0,2z,1s,9,1w,1b,2b,e,2z,1l,l,1s,j,2k,l,8,1s,3,1a,l,a,1x,1r,h,3i,1n,1v,1e,5,g,2n,g,1o,30,1f,1,1,1a,6,6,1t,1f,9,1a,1c,3l,1h,2y,3k,0,1c,18,2c,1r,1l,1f,l,6,n,h,1a,9,1w,n,f,3c,13,1,1t,l,1o,3j,u,1o,8,m,d,1v,2z,u,q,3,7,4s,y,h,v,w,7,3n,14,k,1h,4p,1o,2,q,3j,3j,3c,19,3h,1m,b,47,2,f,s,1z,27,4p,52,4t,4p,9,3h,1a,1r,3h,13,5i,1v,q,17,11,3c,k,1,y,c,17,i,3i,1o,f,8,7,1w,1r,g,4s,1,4p,1s,1o,13,4p,47,u,l,d,h,1s,y,1k,f,u,2c,1s,13,50,13,6,1f,j,1x,1r,1o,v,1d,3i,3,1n,3m,1h,1d,1h,j,1w,12,f,47,v,k,8,2o,1x,3l,5,1s,n,6,1v,t,1,m,1s,7,1z,27,h,2,3f,4p,u,2z,1w,1,4x,q,4w,1,2y,36,1w,9,13,11,6,a,p,1h,8,3i,13,1j,27,36,m,8,u,v,9,1w,2q,26,3g,1o,1o,14,11,z,p,1k,14,1w,3b,2t,j,1z,g,1o,g,n,t,m,7,2z,1b,3b,7,2z,43,1z,7,m,1h,38,1i,w,1m,2y,7,14,1a,d,2d,1c,h,v,6,l,1e,10,10,u,9,v,7,1,j,1b,1s,1o,h,m,1e,32,3s,1a,3b,3,w,0,1g,9,2y,1r,m,14,t,2d,3n,h,n,2c,6,1c,z,1w,i,25,g,1x,a,2u,9,q,1c,38,28,32,1o,n,1o,i,m,5,28,5,15,6,c,1o,26,2x,w,47,s,8,14,t,z,t,3j,13,14,15,w,4,25,9,2c,1z,0,z,3z,1c,2d,3,1h,l,11,2d,2o,7,13,3h,1s,25,1m,2c,1k,1n,11,2n,5,38,l,9,1x,1d,s,z,10,3b,2c,3b,h,i,t,1a,1m,14,1l,1a,m,p,2c,h,9,k,t,v,1l,1w,v,h,1s,1o,38,7,a,1k,v,1,v,s,1w,1c,3i,11,13,3b,h,1z,1z,i,11,1j,1v,15,3h,v,3m,1j,u,s,n,3n,1x,1f,3c,3i,6,1l,o,1m,14,3i,4w,1r,1w,1a,17,c,4w,1o,1k,3j,v,1,v,1n,k,1k,1p,1l,17,3i,f,2n,1,s,13,h,2n,8,1p,47,2,3b,17,7,3l,1h,3h,n,q,25,1h,14,f,1a,18,3b,1w,1h,8,47,l,i,7,l,17,3h,1o,7,2,1v,l,1a,1k,8,6,6,x,3k,10,1n,3c,i,s,3g,2y,m,y,47,1k,h,27,2f,m,m,k,s,11,14,2d,9,c,47,3m,u,11,2y,w,9,u,14,13,h,0,1x,1,1,3,1h,h,d,27,u,15,1l,1x,3g,30,10,3i,l,k,1r,1r,1c,37,1d,i,j,i,1c,3d,38,c,u,3j,9,3g,39,h,3b,1w,l,11,1m,38,a,3,v,q,5,1v,48,1e,1l,1a,5,7,p,2p,1x,2,1o,9,27,p,2k,18,2n,1r,18,2z,1m,4,1b,u,2z,2c,17,j,1i,3n,1d,1a,i,m,18,2x,1z,1x,12,i,1k,3k,32,j,1m,m,2n,1w,k,3s,1v,3g,14,l,j,12,2t,2t,0,l,7,36,2d,1b,z,8,u,1x,1n,x,10,1z,1w,h,15,1r,1f,22,l,d,3h,13,n,30,2y,1t,1x,14,q,1a,26,z,j,g,1v,6,2z,29,36,p,1h,3g,1v,1v,1g,1t,9,3,k,12,1w,2o,z,25,2z,1b,1,l,0,38,v,15,3i,13,h,1f,p,1f,14,1x,s,1,27,e,1u,8,6,6,5,3k,1g,7,17,1l,g,2y,2c,1u,2c,11,g,n,11,14,1u,w,9,1o,u,1l,3k,2d,1o,v,p,3n,q,k,1m,14,11,q,1l,1o,1v,3k,m,9,l,1k,5,1b,2d,3h,u,1n,1a,13,p,3n,8,2n,1l,26,1f,38,n,8,c,f,1f,47,c,g,1d,1l,3l,51,h,1h,4t,1k,1n,1a,3g,1k,6,1a,f,f,1a,11,b,v,2c,8,2t,i,14,1h,1z,1o,1x,27,c,1s,14,9,q,11,n,v,3,4s,c,3j,s,f,15,1,2,h,1r,f,1j,u,5j,5,g,s,2,3c,1s,g,v,6,3,14,n,2,h,v,n,1m,1,1,8,3j,t,0,g,1,k,v,8,14,1b,3f,b,3c,1d,3m,3,x,j,1l,1d,k,1z,g,10,1z,q,7,8,k,3c,3,p,3h,1s,47,1r,3i,i,7,53,1a,15,1s,p,1g,12,8,11,i,3j,z,25,12,1d,13,g,0,5,1c,c,1h,3i,2z,n,26,1g,2c,7,3m,3c,8,12,1b,39,v,13,13,1x,30,37,t,17,u,1,m,1c,29,25,1x,l,2c,1m,3,x,36,6,13,14,1a,6,1i,p,13,3g,u,h,l,26,1z,6,1n,g,1c,10,1e,12,1,3c,u,1x,t,2d,1t,8,1l,m,27,12,a,1w,1a,c,i,3,1w,2x,t,1j,i,3i,9,0,1i,26,n,2n,6,1a,2y,2u,2d,h,1h,11,1s,1t,2x,1c,26,1,v,p,38,30,3n,1h,3,12,1h,29,e,3n,n,1z,3,18,d,3a,m,q,t,17,25,p,3n,38,n,2z,1a,1a,w,35,1c,1o,1,1a,1l,a,38,p,3h,h,n,n,39,d,26,17,13,9,1w,r,39,5,1k,1h,c,5,1m,z,3b,1,14,26,1l,38,2o,o,5,2z,k,2d,3n,1t,1v,3l,1v,1v,1x,1w,3g,25,1,2c,1a,12,1e,1w,26,3i,k,b,3g,2d,2d,c,1d,1,z,2,1v,3g,1r,18,7,1a,1w,3h,7,37,13,2n,1s,3b,1f,26,15,9,1l,9,f,3,3n,1o,u,m,50,m,14,17,15,6,1a,3b,7,8,13,3c,47,4w,11,15,27,1v,u,13,1d,3m,u,3h,u,1s,1h,15,3c,p,6,8,14,1l,3m,3g,1s,1w,14,1h,15,3j,4s,1k,1n,v,4y,4p,47,4t,11,h,1d,3j,4u,f,6,1w,18,6,3j,54,1n,1l,3b,o,1d,8,4z,4z,1a,2n,25,14,1r,1v,8,3f,g,9,13,i,1x,50,9,3b,3g,c,b,1p,u,3f,1h,l,25,f,s,3l,7,7,9,m,y,f,7,3i,o,r,26,k,47,3g,1,3b,t,n,k,3f,4p,1h,l,d,1x,3i,1,15,7,18,2f,3b,1n,1o,c,3,6,3,12,1l,q,1r,4t,1v,5,t,7,3g,1,3,3n,16,38,f,1h,v,5,1x,2f,p,u,7,1,2d,3g,2i,6,1l,1d,u,17,p,p,1c,m,u,q,k,d,2o,26,2c,1o,17,3g,q,10,g,17,c,2z,m,d,1g,n,1k,38,9,3g,18,32,2z,g,1d,25,1z,3b,21,3g,1l,s,7,m,12,2x,z,3i,f,5,3h,d,32,3b,1x,n,1r,n,1i,a,j,1r,3g,3b,38,36,26,m,11,1v,9,1o,p,z,27,14,3j,3g,1w,2y,e,1x,t,h,7,q,5,1v,2c,1z,2n,14,c,1f,2y,18,1n,47,1s,1f,7,44,a,9,9,h,2n,22,2f,1f,i,2z,1z,1s,2x,3n,1g,25,1,3g,1w,1c,3n,2z,1l,1,1r,1c,p,x,p,1j,8,t,1o,10,2i,1t,q,g,12,g,44,37,6,u,12,2y,n,3k,1g,2y,a,14,1,9,1z,p,11,1l,1,6,3i,0,2u,l,3g,2c,1z,1c,27,26,3g,17,n,u,17,2f,1w,1o,1c,11,i,1c,1f,29,t,6,g,s,k,30,z,1a,1v,i,h,1p,3g,18,1k,3h,8,n,3b,3l,3b,4z,3g,3,1h,15,40,u,3i,1n,m,c,c,q,n,2d,1r,11,c,3h,12,t,q,15,3l,3j,15,1w,3,3h,c,1n,1a,1a,3b,1x,2y,3l,7,1h,3h,h,4a,1l,q,1h,3c,52,1l,g,h,2,4t,3f,4t,f,q,14,14,7,n,k,18,27,1a,l,1h,1,15,a,j,25,a,m,1o,1s,m,t,11,c,1r,6,8,1o,2z,g,1n,1x,l,c,1c,2y,9,7,3f,u,3l,1,2q,1u,1k,1x,3,9,o,37,9,1,s,2c,i,1x,1w,2n,3l,11,1a,2z,2d,1i,23,6,l,6,18,j,2m,x,12,i,1w,p,n,1c,1z,0,14,u,n,m,2u,36,t,3i,5,3g,3g,m,h,1r,3l,3b,2f,7,3s,2b,2n,14,1c,p,d,1m,1e,w,7,1,2y,t,2k,z,3h,13,0,1e,32,29,3g,i,v,27,d,2q,28,w,k,t,2n,t,2q,21,2q,5,1z,1h,1c,2m,3k,o,15,l,t,3k,28,3o,3s,1,6,9,3g,3d,x,2k,m,t,h,1z,23,39,x,1x,1z,2z,1w,2x,46,2t,17,l,3k,3,j,1g,2o,g,3g,s,2y,1w,32,1c,m,18,3g,d,1e,2h,2x,3b,7,1l,9,1x,1t,26,h,m,39,3b,37,44,38,12,3g,2z,2o,3k,2f,z,q,c,j,17,a,1u,2z,o,1c,t,11,1f,2s,2j,25,1,10,27,32,w,3b,3,6,1c,10,2o,2x,1m,18,17,1c,12,2j,1f,2q,25,2o,0,1t,3,3k,1c,2z,2c,1x,18,3k,1w,5,1a,2o,2c,30,0,1w,h,5,1r,1m,a,l,n,2n,1s,1,3b,10,j,x,2f,h,1v,5,9,32,a,2d,2c,t,h,j,12,w,8,1v,o,2f,3,1x,t,3l,3l,i,h,1v,7,s,8,9,53,9,3l,25,n,1a,f,6,8,1c,a,l,3l,1j,1j,11,h,1l,s,13,1n,v,14,v,25,5,6,5,14,1n,2c,l,1w,i,k,b,m,1o,2o,2r,3b,7,1s,3i,1o,36,22,1m,1w,1d,1r,2n,n,17,p,1r,11,1o,c,2s,1c,1t,1o,s,6,2z,1t,26,1x,q,2z,t,1t,n,3g,12,25,1k,8,3k,0,a,l,2z,7,l,38,39,30,26,3g,k,7,3,1f,2s,7,c,3b,9,1l,1x,22,2o,1u,1w,2n,2d,j,e,3,8,1k,2n,v,2n,3d,1x,t,i,g,36,38,2w,2y,1v,3b,18,2y,30,1b,2d,2y,1r,14,1r,39,3e,27,39,1a,0,1q,37,e,3e,25,2n,2d,6,1b,2f,d,0,5,w,z,1b,35,32,2n,1z,2d,1b,39,1g,x,a,10,w,1m,36,42,1e,1t,38,1w,36,3n,3a,x,p,1x,m,12,36,1e,1c,2o,k,3h,2o,2x,29,x,n,6,1m,0,e,1c,1t,6,1o,25,3,d,22,a,9,2c,10,p,37,3p,2b,27,o,z,z,x,2x,30,a,2,n,30,18,34,1b,2q,3b,l,1v,3g,16,1g,1w,7,1f,2x,2q,2t,39,o,2c,3b,1w,18,3n,16,2z,2y,36,a,22,4a,2s,a,27,z,27,2f,3s,1b,n,12,t,12,r,z,1i,32,18,2y,1b,e,2s,3g,z,27,2y,2y,3n,3e,0,o,w,17,2s,16,2g,1g,3b,5,1e,h,1q,2b,j,1g,a,3n,30,39,2t,3n,2c,27,12,2y,36,16,1z,37,m,2c,1c,4e,28,3b,w,9,0,2o,t,1z,1x,5,1w,5,t,3k,1g,l,1e,14,l,2n,10,10,g,n,7,14,z,1e,2s,1c,8,5,32,26,3k,x,3l,q,6,l,1w,17,t","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-2f6c67d7","guard":[["not",["hasAny",["add","angeles","close","compare","cpi","dividend","greater","high","larger","makes","national","open","phoenix","price","rate","sp500","sum","temp"]]]],"pyramid":["render.str",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}]]],"mem":null},
{"id":"n-f00090ad","guard":[["hasAny",["bigger than","count","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["not",["has","of"]],["not",["has","larger"]],["not",["has","compare"]],["not",["has","greater"]]],"pyramid":["render.str",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}]]],"mem":null},
{"id":"n-360b7cef","guard":[["not",["hasAny",["add","angeles","close","compare","cpi","dividend","greater","high","larger","makes","national","open","phoenix","price","rate","sp500","sum","temp"]]]],"pyramid":["render.yesNo",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],["render.template",{"lit":[{"slot":0}," has the smaller fatalities count (",{"slot":1}," against ",{"slot":2},")."]},["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["render.template",{"lit":[{"slot":0}," has the smaller fatalities count (",{"slot":1}," against ",{"slot":2},")."]},["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],"mem":null},
{"id":"n-b0cdf7e1","guard":[["hasAny",["bigger than","count","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["not",["has","of"]],["not",["has","larger"]],["not",["has","compare"]],["not",["has","greater"]]],"pyramid":["render.yesNo",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],["render.template",{"lit":[{"slot":0}," has the smaller fatalities count (",{"slot":1}," against ",{"slot":2},")."]},["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["render.template",{"lit":[{"slot":0}," has the smaller fatalities count (",{"slot":1}," against ",{"slot":2},")."]},["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-daily-accidents-6344aa"},{"lit":"date"},{"lit":"fatalities count"}]]],"mem":null},
{"id":"n-51c97121","guard":[["has","count"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2016-10-10 or 1996-03-27":"1996-03-27 has the smaller fatalities count (134 against 154).","whose fatalities count is smaller: 2016-11-26 or 2008-09-06":"2016-11-26 has the smaller fatalities count (137 against 190).","between 1994-04-15 and 1998-10-09, which has the lesser fatalities count":"1994-04-15 has the smaller fatalities count (179 against 208).","between 2004-10-18 and 1994-01-11, which has the lesser fatalities count":"1994-01-11 has the smaller fatalities count (122 against 139).","which has the smaller fatalities count, 2011-08-19 or 2011-10-29":"2011-08-19 has the smaller fatalities count (138 against 156).","whose fatalities count is smaller: 2002-09-29 or 2010-03-25":"2010-03-25 has the smaller fatalities count (128 against 216).","whose fatalities count is smaller: 1996-08-03 or 2016-08-26":"2016-08-26 has the smaller fatalities count (133 against 189).","which has the smaller fatalities count, 2009-05-04 or 1997-10-28":"2009-05-04 has the smaller fatalities count (108 against 109).","whose fatalities count is smaller: 2011-07-29 or 1992-10-31":"2011-07-29 has the smaller fatalities count (162 against 254).","which has the smaller fatalities count, 1995-06-15 or 2011-08-23":"2011-08-23 has the smaller fatalities count (142 against 149).","which has the smaller fatalities count, 2003-11-08 or 1997-07-08":"1997-07-08 has the smaller fatalities count (134 against 217).","between 2003-04-12 and 1994-09-06, which has the lesser fatalities count":"1994-09-06 has the smaller fatalities count (126 against 207).","between 2011-11-04 and 1996-12-23, which has the lesser fatalities count":"2011-11-04 has the smaller fatalities count (154 against 189).","whose fatalities count is smaller: 1994-01-11 or 1997-03-04":"1997-03-04 has the smaller fatalities count (119 against 122).","between 1998-09-28 and 2016-02-14, which has the lesser fatalities count":"2016-02-14 has the smaller fatalities count (132 against 139).","between 2007-02-19 and 2002-09-29, which has the lesser fatalities count":"2007-02-19 has the smaller fatalities count (117 against 216).","whose fatalities count is smaller: 2003-11-03 or 2016-03-11":"2016-03-11 has the smaller fatalities count (153 against 176).","whose fatalities count is smaller: 1995-10-13 or 2015-10-28":"2015-10-28 has the smaller fatalities count (138 against 228).","which has the smaller fatalities count, 1998-05-30 or 2003-07-05":"1998-05-30 has the smaller fatalities count (156 against 192).","between 2001-09-14 and 2016-08-01, which has the lesser fatalities count":"2016-08-01 has the smaller fatalities count (124 against 176).","whose fatalities count is smaller: 2015-12-14 or 2016-07-06":"2016-07-06 has the smaller fatalities count (126 against 140).","which has the smaller fatalities count, 2015-09-28 or 2001-08-13":"2015-09-28 has the smaller fatalities count (112 against 130).","between 2002-07-19 and 1997-07-28, which has the lesser fatalities count":"1997-07-28 has the smaller fatalities count (147 against 165).","between 1993-08-21 and 2006-07-30, which has the lesser fatalities count":"1993-08-21 has the smaller fatalities count (187 against 213).","which has the smaller fatalities count, 2016-03-11 or 1993-04-23":"1993-04-23 has the smaller fatalities count (151 against 153).","which has the smaller fatalities count, 2009-04-28 or 1998-05-21":"2009-04-28 has the smaller fatalities count (116 against 149).","which has the smaller fatalities count, 2016-11-02 or 2002-07-19":"2016-11-02 has the smaller fatalities count (159 against 165).","which has the smaller fatalities count, 2002-11-11 or 1994-09-12":"1994-09-12 has the smaller fatalities count (140 against 146).","whose fatalities count is smaller: 2007-02-06 or 2014-07-23":"2014-07-23 has the smaller fatalities count (120 against 137).","which has the smaller fatalities count, 1996-06-24 or 1994-04-15":"1994-04-15 has the smaller fatalities count (179 against 192).","between 2011-10-29 and 2002-04-20, which has the lesser fatalities count":"2011-10-29 has the smaller fatalities count (156 against 172).","which has the smaller fatalities count, 1997-03-04 or 1998-09-28":"1997-03-04 has the smaller fatalities count (119 against 139).","whose fatalities count is smaller: 1994-09-06 or 2009-04-28":"2009-04-28 has the smaller fatalities count (116 against 126).","which has the smaller fatalities count, 2010-03-25 or 2011-11-04":"2010-03-25 has the smaller fatalities count (128 against 154).","which has the smaller fatalities count, 2013-10-30 or 2011-11-13":"2013-10-30 has the smaller fatalities count (103 against 139).","which has the smaller fatalities count, 2008-11-04 or 1995-12-09":"2008-11-04 has the smaller fatalities count (126 against 218).","whose fatalities count is smaller: 2012-08-23 or 2016-11-21":"2012-08-23 has the smaller fatalities count (104 against 155).","whose fatalities count is smaller: 2005-04-01 or 2009-05-04":"2009-05-04 has the smaller fatalities count (108 against 184).","which has the smaller fatalities count, 2014-07-23 or 2015-07-09":"2014-07-23 has the smaller fatalities count (120 against 134).","which has the smaller fatalities count, 1997-01-20 or 1999-04-07":"1997-01-20 has the smaller fatalities count (110 against 115).","whose fatalities count is smaller: 2014-09-18 or 2000-05-12":"2014-09-18 has the smaller fatalities count (148 against 165).","whose fatalities count is smaller: 2016-08-01 or 1998-01-15":"2016-08-01 has the smaller fatalities count (124 against 126).","between 1994-09-12 and 1995-10-13, which has the lesser fatalities count":"1994-09-12 has the smaller fatalities count (140 against 228).","between 2001-08-13 and 2014-09-18, which has the lesser fatalities count":"2001-08-13 has the smaller fatalities count (130 against 148).","which has the smaller fatalities count, 2010-07-30 or 2001-09-14":"2010-07-30 has the smaller fatalities count (148 against 176).","between 1999-04-07 and 2011-03-30, which has the lesser fatalities count":"2011-03-30 has the smaller fatalities count (88 against 115).","between 2006-02-21 and 2016-07-24, which has the lesser fatalities count":"2006-02-21 has the smaller fatalities count (116 against 153).","between 1997-10-28 and 2008-05-03, which has the lesser fatalities count":"1997-10-28 has the smaller fatalities count (109 against 144).","whose fatalities count is smaller: 2006-07-30 or 2009-01-23":"2009-01-23 has the smaller fatalities count (105 against 213).","which has the smaller fatalities count, 2016-07-06 or 2009-08-18":"2009-08-18 has the smaller fatalities count (114 against 126).","between 1993-04-23 and 2013-09-12, which has the lesser fatalities count":"2013-09-12 has the smaller fatalities count (142 against 151).","which has the smaller fatalities count, 1994-05-13 or 2006-02-21":"2006-02-21 has the smaller fatalities count (116 against 209).","whose fatalities count is smaller: 2002-04-20 or 1994-05-13":"2002-04-20 has the smaller fatalities count (172 against 209).","whose fatalities count is smaller: 2015-06-28 or 2014-03-26":"2014-03-26 has the smaller fatalities count (107 against 133).","between 1994-05-02 and 2015-12-14, which has the lesser fatalities count":"1994-05-02 has the smaller fatalities count (100 against 140).","between 2011-08-23 and 2009-09-09, which has the lesser fatalities count":"2009-09-09 has the smaller fatalities count (106 against 142).","whose fatalities count is smaller: 2013-09-27 or 1996-02-22":"1996-02-22 has the smaller fatalities count (115 against 147).","between 1998-05-21 and 2012-08-23, which has the lesser fatalities count":"2012-08-23 has the smaller fatalities count (104 against 149).","whose fatalities count is smaller: 2008-05-03 or 2016-11-02":"2008-05-03 has the smaller fatalities count (144 against 159).","which has the smaller fatalities count, 1998-01-15 or 2013-07-19":"1998-01-15 has the smaller fatalities count (126 against 131).","between 2013-07-19 and 1992-05-17, which has the lesser fatalities count":"2013-07-19 has the smaller fatalities count (131 against 184).","which has the smaller fatalities count, 2000-05-12 or 2016-07-25":"2016-07-25 has the smaller fatalities count (119 against 165).","whose fatalities count is smaller: 2016-07-24 or 1997-01-20":"1997-01-20 has the smaller fatalities count (110 against 153).","which has the smaller fatalities count, 2016-11-21 or 2000-02-19":"2016-11-21 has the smaller fatalities count (155 against 160).","which has the smaller fatalities count, 1999-05-14 or 1997-11-08":"1999-05-14 has the smaller fatalities count (174 against 194).","which has the smaller fatalities count, 1996-01-31 or 2014-12-20":"1996-01-31 has the smaller fatalities count (114 against 154).","whose fatalities count is smaller: 2007-02-13 or 1996-06-24":"2007-02-13 has the smaller fatalities count (105 against 192).","whose fatalities count is smaller: 1993-12-02 or 1995-06-15":"1995-06-15 has the smaller fatalities count (149 against 156).","whose fatalities count is smaller: 2011-03-30 or 2015-09-28":"2011-03-30 has the smaller fatalities count (88 against 112).","which has the smaller fatalities count, 1993-11-12 or 2002-06-08":"2002-06-08 has the smaller fatalities count (190 against 216).","between 1997-11-08 and 2007-02-13, which has the lesser fatalities count":"2007-02-13 has the smaller fatalities count (105 against 194).","which has the smaller fatalities count, 1996-02-22 or 1994-05-02":"1994-05-02 has the smaller fatalities count (100 against 115).","between 2003-07-05 and 2015-06-28, which has the lesser fatalities count":"2015-06-28 has the smaller fatalities count (133 against 192).","whose fatalities count is smaller: 2013-09-12 or 2011-08-19":"2011-08-19 has the smaller fatalities count (138 against 142).","whose fatalities count is smaller: 1998-10-09 or 1993-11-12":"1998-10-09 has the smaller fatalities count (208 against 216).","between 2015-07-09 and 1993-06-02, which has the lesser fatalities count":"1993-06-02 has the smaller fatalities count (127 against 134).","between 2002-06-08 and 2010-09-20, which has the lesser fatalities count":"2010-09-20 has the smaller fatalities count (114 against 190).","between 2016-07-25 and 2005-04-01, which has the lesser fatalities count":"2016-07-25 has the smaller fatalities count (119 against 184).","whose fatalities count is smaller: 1997-07-28 or 1999-05-14":"1997-07-28 has the smaller fatalities count (147 against 174).","whose fatalities count is smaller: 1992-05-17 or 2013-10-30":"2013-10-30 has the smaller fatalities count (103 against 184).","between 2011-11-13 and 2011-07-29, which has the lesser fatalities count":"2011-11-13 has the smaller fatalities count (139 against 162).","which has the smaller fatalities count, 1992-10-31 or 1993-08-21":"1993-08-21 has the smaller fatalities count (187 against 254).","which has the smaller fatalities count, 2015-10-28 or 2005-01-27":"2015-10-28 has the smaller fatalities count (138 against 158).","between 1997-07-08 and 2013-09-27, which has the lesser fatalities count":"1997-07-08 has the smaller fatalities count (134 against 147).","which has the smaller fatalities count, 2014-03-26 or 2015-11-19":"2014-03-26 has the smaller fatalities count (107 against 172).","which has the smaller fatalities count, 2008-09-06 or 2007-02-19":"2007-02-19 has the smaller fatalities count (117 against 190).","whose fatalities count is smaller: 2010-09-20 or 2010-07-30":"2010-09-20 has the smaller fatalities count (114 against 148).","whose fatalities count is smaller: 2016-02-14 or 2003-11-08":"2016-02-14 has the smaller fatalities count (132 against 217).","between 2014-12-20 and 2007-02-06, which has the lesser fatalities count":"2007-02-06 has the smaller fatalities count (137 against 154).","which has the smaller fatalities count, 1996-03-27 or 2001-11-07":"1996-03-27 has the smaller fatalities count (134 against 177).","between 1995-12-09 and 2016-11-26, which has the lesser fatalities count":"2016-11-26 has the smaller fatalities count (137 against 218).","between 2001-11-07 and 1993-12-02, which has the lesser fatalities count":"1993-12-02 has the smaller fatalities count (156 against 177).","whose fatalities count is smaller: 1993-06-02 or 2002-11-11":"1993-06-02 has the smaller fatalities count (127 against 146).","which has the smaller fatalities count, 2009-01-23 or 2004-10-18":"2009-01-23 has the smaller fatalities count (105 against 139).","between 2005-01-27 and 2016-10-10, which has the lesser fatalities count":"2016-10-10 has the smaller fatalities count (154 against 158).","between 2015-11-19 and 2003-11-03, which has the lesser fatalities count":"2015-11-19 has the smaller fatalities count (172 against 176).","between 2009-08-18 and 2008-12-09, which has the lesser fatalities count":"2009-08-18 has the smaller fatalities count (114 against 151).","whose fatalities count is smaller: 2009-09-09 or 2008-11-04":"2009-09-09 has the smaller fatalities count (106 against 126).","whose fatalities count is smaller: 2009-09-25 or 1996-01-31":"1996-01-31 has the smaller fatalities count (114 against 151).","which has the smaller fatalities count, 2016-08-26 or 2003-04-12":"2016-08-26 has the smaller fatalities count (133 against 207)."}}},
{"id":"n-23ae5f7a","guard":[["has","count"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"smaller: 2016-10-10 or 1996-03-27":"1996-03-27 has the smaller fatalities count (134 against 154).","smaller: 2016-11-26 or 2008-09-06":"2016-11-26 has the smaller fatalities count (137 against 190).","smaller: 2002-09-29 or 2010-03-25":"2010-03-25 has the smaller fatalities count (128 against 216).","smaller: 1996-08-03 or 2016-08-26":"2016-08-26 has the smaller fatalities count (133 against 189).","smaller: 2011-07-29 or 1992-10-31":"2011-07-29 has the smaller fatalities count (162 against 254).","smaller: 1994-01-11 or 1997-03-04":"1997-03-04 has the smaller fatalities count (119 against 122).","smaller: 2003-11-03 or 2016-03-11":"2016-03-11 has the smaller fatalities count (153 against 176).","smaller: 1995-10-13 or 2015-10-28":"2015-10-28 has the smaller fatalities count (138 against 228).","smaller: 2015-12-14 or 2016-07-06":"2016-07-06 has the smaller fatalities count (126 against 140).","smaller: 2007-02-06 or 2014-07-23":"2014-07-23 has the smaller fatalities count (120 against 137).","smaller: 1994-09-06 or 2009-04-28":"2009-04-28 has the smaller fatalities count (116 against 126).","smaller: 2012-08-23 or 2016-11-21":"2012-08-23 has the smaller fatalities count (104 against 155).","smaller: 2005-04-01 or 2009-05-04":"2009-05-04 has the smaller fatalities count (108 against 184).","smaller: 2014-09-18 or 2000-05-12":"2014-09-18 has the smaller fatalities count (148 against 165).","smaller: 2016-08-01 or 1998-01-15":"2016-08-01 has the smaller fatalities count (124 against 126).","smaller: 2006-07-30 or 2009-01-23":"2009-01-23 has the smaller fatalities count (105 against 213).","smaller: 2002-04-20 or 1994-05-13":"2002-04-20 has the smaller fatalities count (172 against 209).","smaller: 2015-06-28 or 2014-03-26":"2014-03-26 has the smaller fatalities count (107 against 133).","smaller: 2013-09-27 or 1996-02-22":"1996-02-22 has the smaller fatalities count (115 against 147).","smaller: 2008-05-03 or 2016-11-02":"2008-05-03 has the smaller fatalities count (144 against 159).","smaller: 2016-07-24 or 1997-01-20":"1997-01-20 has the smaller fatalities count (110 against 153).","smaller: 2007-02-13 or 1996-06-24":"2007-02-13 has the smaller fatalities count (105 against 192).","smaller: 1993-12-02 or 1995-06-15":"1995-06-15 has the smaller fatalities count (149 against 156).","smaller: 2011-03-30 or 2015-09-28":"2011-03-30 has the smaller fatalities count (88 against 112).","smaller: 2013-09-12 or 2011-08-19":"2011-08-19 has the smaller fatalities count (138 against 142).","smaller: 1998-10-09 or 1993-11-12":"1998-10-09 has the smaller fatalities count (208 against 216).","smaller: 1997-07-28 or 1999-05-14":"1997-07-28 has the smaller fatalities count (147 against 174).","smaller: 1992-05-17 or 2013-10-30":"2013-10-30 has the smaller fatalities count (103 against 184).","smaller: 2010-09-20 or 2010-07-30":"2010-09-20 has the smaller fatalities count (114 against 148).","smaller: 2016-02-14 or 2003-11-08":"2016-02-14 has the smaller fatalities count (132 against 217).","smaller: 1993-06-02 or 2002-11-11":"1993-06-02 has the smaller fatalities count (127 against 146).","smaller: 2009-09-09 or 2008-11-04":"2009-09-09 has the smaller fatalities count (106 against 126).","smaller: 2009-09-25 or 1996-01-31":"1996-01-31 has the smaller fatalities count (114 against 151)."}}},
{"id":"n-01b0f5bb","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2002-09-29 or 2010-03-25":"2010-03-25 has the smaller fatalities count (128 against 216)."}}},
{"id":"n-02ed9a88","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2016-07-25 and 2005-04-01, which has the lesser fatalities count":"2016-07-25 has the smaller fatalities count (119 against 184)."}}},
{"id":"n-072be2be","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2016-11-26 or 2008-09-06":"2016-11-26 has the smaller fatalities count (137 against 190)."}}},
{"id":"n-0760d081","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1999-05-14 or 1997-11-08":"1999-05-14 has the smaller fatalities count (174 against 194)."}}},
{"id":"n-079a9543","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2011-07-29 or 1992-10-31":"2011-07-29 has the smaller fatalities count (162 against 254)."}}},
{"id":"n-09c07d28","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1995-12-09 and 2016-11-26, which has the lesser fatalities count":"2016-11-26 has the smaller fatalities count (137 against 218)."}}},
{"id":"n-0b38ee20","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1998-09-28 and 2016-02-14, which has the lesser fatalities count":"2016-02-14 has the smaller fatalities count (132 against 139)."}}},
{"id":"n-0c86bbd7","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2011-08-23 and 2009-09-09, which has the lesser fatalities count":"2009-09-09 has the smaller fatalities count (106 against 142)."}}},
{"id":"n-0dc488c0","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2011-08-19 or 2011-10-29":"2011-08-19 has the smaller fatalities count (138 against 156)."}}},
{"id":"n-0ee8a72b","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2002-06-08 and 2010-09-20, which has the lesser fatalities count":"2010-09-20 has the smaller fatalities count (114 against 190)."}}},
{"id":"n-0eec7633","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2014-09-18 or 2000-05-12":"2014-09-18 has the smaller fatalities count (148 against 165)."}}},
{"id":"n-1188352d","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1998-01-15 or 2013-07-19":"1998-01-15 has the smaller fatalities count (126 against 131)."}}},
{"id":"n-1652ed8f","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2015-06-28 or 2014-03-26":"2014-03-26 has the smaller fatalities count (107 against 133)."}}},
{"id":"n-167d7401","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 1997-07-28 or 1999-05-14":"1997-07-28 has the smaller fatalities count (147 against 174)."}}},
{"id":"n-16a46d44","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2015-11-19 and 2003-11-03, which has the lesser fatalities count":"2015-11-19 has the smaller fatalities count (172 against 176)."}}},
{"id":"n-18aa5b20","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1993-08-21 and 2006-07-30, which has the lesser fatalities count":"1993-08-21 has the smaller fatalities count (187 against 213)."}}},
{"id":"n-197e23cd","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2011-11-04 and 1996-12-23, which has the lesser fatalities count":"2011-11-04 has the smaller fatalities count (154 against 189)."}}},
{"id":"n-1a4088cb","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1997-07-08 and 2013-09-27, which has the lesser fatalities count":"1997-07-08 has the smaller fatalities count (134 against 147)."}}},
{"id":"n-1d7b82ae","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1998-05-30 or 2003-07-05":"1998-05-30 has the smaller fatalities count (156 against 192)."}}},
{"id":"n-1da0455b","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1992-10-31 or 1993-08-21":"1993-08-21 has the smaller fatalities count (187 against 254)."}}},
{"id":"n-1f60061d","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2009-05-04 or 1997-10-28":"2009-05-04 has the smaller fatalities count (108 against 109)."}}},
{"id":"n-22f04371","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2016-07-06 or 2009-08-18":"2009-08-18 has the smaller fatalities count (114 against 126)."}}},
{"id":"n-271d2875","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1997-11-08 and 2007-02-13, which has the lesser fatalities count":"2007-02-13 has the smaller fatalities count (105 against 194)."}}},
{"id":"n-2b9bfe47","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2010-07-30 or 2001-09-14":"2010-07-30 has the smaller fatalities count (148 against 176)."}}},
{"id":"n-2bf76977","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2008-09-06 or 2007-02-19":"2007-02-19 has the smaller fatalities count (117 against 190)."}}},
{"id":"n-2e30dd44","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2001-09-14 and 2016-08-01, which has the lesser fatalities count":"2016-08-01 has the smaller fatalities count (124 against 176)."}}},
{"id":"n-30848f4c","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2002-07-19 and 1997-07-28, which has the lesser fatalities count":"1997-07-28 has the smaller fatalities count (147 against 165)."}}},
{"id":"n-309348e0","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2016-02-14 or 2003-11-08":"2016-02-14 has the smaller fatalities count (132 against 217)."}}},
{"id":"n-32fcfb2a","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2015-12-14 or 2016-07-06":"2016-07-06 has the smaller fatalities count (126 against 140)."}}},
{"id":"n-38aadc0c","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2011-11-13 and 2011-07-29, which has the lesser fatalities count":"2011-11-13 has the smaller fatalities count (139 against 162)."}}},
{"id":"n-3971a1ef","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2009-08-18 and 2008-12-09, which has the lesser fatalities count":"2009-08-18 has the smaller fatalities count (114 against 151)."}}},
{"id":"n-3b0adf63","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2007-02-19 and 2002-09-29, which has the lesser fatalities count":"2007-02-19 has the smaller fatalities count (117 against 216)."}}},
{"id":"n-42fcb956","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 1994-01-11 or 1997-03-04":"1997-03-04 has the smaller fatalities count (119 against 122)."}}},
{"id":"n-43c663ec","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2008-05-03 or 2016-11-02":"2008-05-03 has the smaller fatalities count (144 against 159)."}}},
{"id":"n-4a46aa30","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2015-07-09 and 1993-06-02, which has the lesser fatalities count":"1993-06-02 has the smaller fatalities count (127 against 134)."}}},
{"id":"n-4b342b4c","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1998-05-21 and 2012-08-23, which has the lesser fatalities count":"2012-08-23 has the smaller fatalities count (104 against 149)."}}},
{"id":"n-4c5cd184","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 1996-08-03 or 2016-08-26":"2016-08-26 has the smaller fatalities count (133 against 189)."}}},
{"id":"n-4d57dbf9","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2003-04-12 and 1994-09-06, which has the lesser fatalities count":"1994-09-06 has the smaller fatalities count (126 against 207)."}}},
{"id":"n-540c5f46","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1999-04-07 and 2011-03-30, which has the lesser fatalities count":"2011-03-30 has the smaller fatalities count (88 against 115)."}}},
{"id":"n-5498e66d","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2006-02-21 and 2016-07-24, which has the lesser fatalities count":"2006-02-21 has the smaller fatalities count (116 against 153)."}}},
{"id":"n-58f0aa45","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2013-09-12 or 2011-08-19":"2011-08-19 has the smaller fatalities count (138 against 142)."}}},
{"id":"n-5cde4996","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2007-02-13 or 1996-06-24":"2007-02-13 has the smaller fatalities count (105 against 192)."}}},
{"id":"n-5cf69555","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2000-05-12 or 2016-07-25":"2016-07-25 has the smaller fatalities count (119 against 165)."}}},
{"id":"n-5d66dac6","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2012-08-23 or 2016-11-21":"2012-08-23 has the smaller fatalities count (104 against 155)."}}},
{"id":"n-640a558d","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2014-03-26 or 2015-11-19":"2014-03-26 has the smaller fatalities count (107 against 172)."}}},
{"id":"n-64a15ed0","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1996-03-27 or 2001-11-07":"1996-03-27 has the smaller fatalities count (134 against 177)."}}},
{"id":"n-65044c00","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2006-07-30 or 2009-01-23":"2009-01-23 has the smaller fatalities count (105 against 213)."}}},
{"id":"n-6987ad43","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 1995-10-13 or 2015-10-28":"2015-10-28 has the smaller fatalities count (138 against 228)."}}},
{"id":"n-698ec48b","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2001-11-07 and 1993-12-02, which has the lesser fatalities count":"1993-12-02 has the smaller fatalities count (156 against 177)."}}},
{"id":"n-69e3b3ee","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1993-11-12 or 2002-06-08":"2002-06-08 has the smaller fatalities count (190 against 216)."}}},
{"id":"n-6d944d6f","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 1992-05-17 or 2013-10-30":"2013-10-30 has the smaller fatalities count (103 against 184)."}}},
{"id":"n-732f0fe0","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1993-04-23 and 2013-09-12, which has the lesser fatalities count":"2013-09-12 has the smaller fatalities count (142 against 151)."}}},
{"id":"n-7dd7e1e6","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1997-01-20 or 1999-04-07":"1997-01-20 has the smaller fatalities count (110 against 115)."}}},
{"id":"n-7f87b067","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2016-11-21 or 2000-02-19":"2016-11-21 has the smaller fatalities count (155 against 160)."}}},
{"id":"n-822b5101","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2015-10-28 or 2005-01-27":"2015-10-28 has the smaller fatalities count (138 against 158)."}}},
{"id":"n-8aa5a279","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2016-10-10 or 1996-03-27":"1996-03-27 has the smaller fatalities count (134 against 154)."}}},
{"id":"n-8aa6216c","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2005-01-27 and 2016-10-10, which has the lesser fatalities count":"2016-10-10 has the smaller fatalities count (154 against 158)."}}},
{"id":"n-8cbe50f8","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1996-01-31 or 2014-12-20":"1996-01-31 has the smaller fatalities count (114 against 154)."}}},
{"id":"n-92219282","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 1993-06-02 or 2002-11-11":"1993-06-02 has the smaller fatalities count (127 against 146)."}}},
{"id":"n-92834a41","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2016-11-02 or 2002-07-19":"2016-11-02 has the smaller fatalities count (159 against 165)."}}},
{"id":"n-9980f583","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1997-03-04 or 1998-09-28":"1997-03-04 has the smaller fatalities count (119 against 139)."}}},
{"id":"n-9acf8d4b","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 1994-09-06 or 2009-04-28":"2009-04-28 has the smaller fatalities count (116 against 126)."}}},
{"id":"n-9bfdbacb","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2016-07-24 or 1997-01-20":"1997-01-20 has the smaller fatalities count (110 against 153)."}}},
{"id":"n-9d0d48bd","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2005-04-01 or 2009-05-04":"2009-05-04 has the smaller fatalities count (108 against 184)."}}},
{"id":"n-a1abbea0","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2014-12-20 and 2007-02-06, which has the lesser fatalities count":"2007-02-06 has the smaller fatalities count (137 against 154)."}}},
{"id":"n-a258cafc","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1994-04-15 and 1998-10-09, which has the lesser fatalities count":"1994-04-15 has the smaller fatalities count (179 against 208)."}}},
{"id":"n-a5aa869a","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2013-07-19 and 1992-05-17, which has the lesser fatalities count":"2013-07-19 has the smaller fatalities count (131 against 184)."}}},
{"id":"n-a96827ee","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2007-02-06 or 2014-07-23":"2014-07-23 has the smaller fatalities count (120 against 137)."}}},
{"id":"n-aa3deea4","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2002-04-20 or 1994-05-13":"2002-04-20 has the smaller fatalities count (172 against 209)."}}},
{"id":"n-ad5707b2","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2003-11-03 or 2016-03-11":"2016-03-11 has the smaller fatalities count (153 against 176)."}}},
{"id":"n-b0fa4b6a","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1995-06-15 or 2011-08-23":"2011-08-23 has the smaller fatalities count (142 against 149)."}}},
{"id":"n-b6559ef4","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2016-08-26 or 2003-04-12":"2016-08-26 has the smaller fatalities count (133 against 207)."}}},
{"id":"n-b941ecf1","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2016-08-01 or 1998-01-15":"2016-08-01 has the smaller fatalities count (124 against 126)."}}},
{"id":"n-bacb7255","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2011-03-30 or 2015-09-28":"2011-03-30 has the smaller fatalities count (88 against 112)."}}},
{"id":"n-beeceee1","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2009-09-25 or 1996-01-31":"1996-01-31 has the smaller fatalities count (114 against 151)."}}},
{"id":"n-bfacd55f","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2009-01-23 or 2004-10-18":"2009-01-23 has the smaller fatalities count (105 against 139)."}}},
{"id":"n-c3f6b23a","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 1993-12-02 or 1995-06-15":"1995-06-15 has the smaller fatalities count (149 against 156)."}}},
{"id":"n-cabb4e92","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2010-09-20 or 2010-07-30":"2010-09-20 has the smaller fatalities count (114 against 148)."}}},
{"id":"n-cd64a481","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2016-03-11 or 1993-04-23":"1993-04-23 has the smaller fatalities count (151 against 153)."}}},
{"id":"n-ce417310","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1997-10-28 and 2008-05-03, which has the lesser fatalities count":"1997-10-28 has the smaller fatalities count (109 against 144)."}}},
{"id":"n-d06e5510","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2011-10-29 and 2002-04-20, which has the lesser fatalities count":"2011-10-29 has the smaller fatalities count (156 against 172)."}}},
{"id":"n-d37e0937","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1994-05-13 or 2006-02-21":"2006-02-21 has the smaller fatalities count (116 against 209)."}}},
{"id":"n-d43028a0","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1994-09-12 and 1995-10-13, which has the lesser fatalities count":"1994-09-12 has the smaller fatalities count (140 against 228)."}}},
{"id":"n-d79f16b5","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 1994-05-02 and 2015-12-14, which has the lesser fatalities count":"1994-05-02 has the smaller fatalities count (100 against 140)."}}},
{"id":"n-d862d754","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2004-10-18 and 1994-01-11, which has the lesser fatalities count":"1994-01-11 has the smaller fatalities count (122 against 139)."}}},
{"id":"n-d9cbbd24","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2014-07-23 or 2015-07-09":"2014-07-23 has the smaller fatalities count (120 against 134)."}}},
{"id":"n-da908bba","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2008-11-04 or 1995-12-09":"2008-11-04 has the smaller fatalities count (126 against 218)."}}},
{"id":"n-de3347dd","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2009-09-09 or 2008-11-04":"2009-09-09 has the smaller fatalities count (106 against 126)."}}},
{"id":"n-e10ae9df","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 1998-10-09 or 1993-11-12":"1998-10-09 has the smaller fatalities count (208 against 216)."}}},
{"id":"n-e728d973","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1996-02-22 or 1994-05-02":"1994-05-02 has the smaller fatalities count (100 against 115)."}}},
{"id":"n-e79fa1ef","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2003-11-08 or 1997-07-08":"1997-07-08 has the smaller fatalities count (134 against 217)."}}},
{"id":"n-e7eb530b","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2015-09-28 or 2001-08-13":"2015-09-28 has the smaller fatalities count (112 against 130)."}}},
{"id":"n-e8889cc2","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2009-04-28 or 1998-05-21":"2009-04-28 has the smaller fatalities count (116 against 149)."}}},
{"id":"n-ebcf7be7","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2002-11-11 or 1994-09-12":"1994-09-12 has the smaller fatalities count (140 against 146)."}}},
{"id":"n-ed842aca","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2010-03-25 or 2011-11-04":"2010-03-25 has the smaller fatalities count (128 against 154)."}}},
{"id":"n-edd82a3a","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 1996-06-24 or 1994-04-15":"1994-04-15 has the smaller fatalities count (179 against 192)."}}},
{"id":"n-f4c750a5","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2003-07-05 and 2015-06-28, which has the lesser fatalities count":"2015-06-28 has the smaller fatalities count (133 against 192)."}}},
{"id":"n-f78ce4e2","guard":[["hasAny",["count","fatalities","has","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which has the smaller fatalities count, 2013-10-30 or 2011-11-13":"2013-10-30 has the smaller fatalities count (103 against 139)."}}},
{"id":"n-fbe16bb9","guard":[["hasAny",["count","fatalities","smaller"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"whose fatalities count is smaller: 2013-09-27 or 1996-02-22":"1996-02-22 has the smaller fatalities count (115 against 147)."}}},
{"id":"n-feb7d5f2","guard":[["hasAny",["between","count","fatalities","has","lesser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"between 2001-08-13 and 2014-09-18, which has the lesser fatalities count":"2001-08-13 has the smaller fatalities count (130 against 148)."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"whose fatalities count is smaller: 2016-10-10 or 1996-03-27","expect":{"contains":["1996-03-27"],"notContains":["2016-10-10"],"notRefusal":true}},{"q":"whose fatalities count is smaller: 2016-11-26 or 2008-09-06","expect":{"contains":["2016-11-26"],"notContains":["2008-09-06"],"notRefusal":true}},{"q":"between 1994-04-15 and 1998-10-09, which has the lesser fatalities count","expect":{"contains":["1994-04-15"],"notContains":["1998-10-09"],"notRefusal":true}},{"q":"between 2004-10-18 and 1994-01-11, which has the lesser fatalities count","expect":{"contains":["1994-01-11"],"notContains":["2004-10-18"],"notRefusal":true}},{"q":"which has the smaller fatalities count, 2011-08-19 or 2011-10-29","expect":{"contains":["2011-08-19"],"notContains":["2011-10-29"],"notRefusal":true}},{"q":"whose fatalities count is smaller: 2002-09-29 or 2010-03-25","expect":{"contains":["2010-03-25"],"notContains":["2002-09-29"],"notRefusal":true}},{"q":"whose fatalities count is smaller: 1996-08-03 or 2016-08-26","expect":{"contains":["2016-08-26"],"notContains":["1996-08-03"],"notRefusal":true}},{"q":"which has the smaller fatalities count, 2009-05-04 or 1997-10-28","expect":{"contains":["2009-05-04"],"notContains":["1997-10-28"],"notRefusal":true}},{"q":"whose fatalities count is smaller: 2011-07-29 or 1992-10-31","expect":{"contains":["2011-07-29"],"notContains":["1992-10-31"],"notRefusal":true}},{"q":"which has the smaller fatalities count, 1995-06-15 or 2011-08-23","expect":{"contains":["2011-08-23"],"notContains":["1995-06-15"],"notRefusal":true}},{"q":"which has the smaller fatalities count, 2003-11-08 or 1997-07-08","expect":{"contains":["1997-07-08"],"notContains":["2003-11-08"],"notRefusal":true}},{"q":"between 2003-04-12 and 1994-09-06, which has the lesser fatalities count","expect":{"contains":["1994-09-06"],"notContains":["2003-04-12"],"notRefusal":true}},{"q":"between 2011-11-04 and 1996-12-23, which has the lesser fatalities count","expect":{"contains":["2011-11-04"],"notContains":["1996-12-23"],"notRefusal":true}},{"q":"whose fatalities count is smaller: 1994-01-11 or 1997-03-04","expect":{"contains":["1997-03-04"],"notContains":["1994-01-11"],"notRefusal":true}},{"q":"between 1998-09-28 and 2016-02-14, which has the lesser fatalities count","expect":{"contains":["2016-02-14"],"notContains":["1998-09-28"],"notRefusal":true}},{"q":"between 2007-02-19 and 2002-09-29, which has the lesser fatalities count","expect":{"contains":["2007-02-19"],"notContains":["2002-09-29"],"notRefusal":true}},{"q":"whose fatalities count is smaller: 2003-11-03 or 2016-03-11","expect":{"contains":["2016-03-11"],"notContains":["2003-11-03"],"notRefusal":true}},{"q":"whose fatalities count is smaller: 1995-10-13 or 2015-10-28","expect":{"contains":["2015-10-28"],"notContains":["1995-10-13"],"notRefusal":true}},{"q":"which has the smaller fatalities count, 1998-05-30 or 2003-07-05","expect":{"contains":["1998-05-30"],"notContains":["2003-07-05"],"notRefusal":true}},{"q":"between 2001-09-14 and 2016-08-01, which has the lesser fatalities count","expect":{"contains":["2016-08-01"],"notContains":["2001-09-14"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
