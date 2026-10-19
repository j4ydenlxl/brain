// max-temp-c-of-date-1007-compare-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"max-temp-c-of-date-1007-compare-neo-g10","class":"max-temp-c-of-date-1007-compare","generation":10,"lane":"neo","grownFrom":["how does the max temp c of 2006-05-29 compare with that of 2000-06-10","compare the max temp c of 2016-09-28 and 2016-05-21","2013-06-12 versus 2016-06-08: compare their max temp c","how does the max temp c of 2014-05-16 compare with that of 2018-08-14","2001-07-14 versus 2023-10-08: compare their max temp c","compare the max temp c of 2000-01-06 and 1993-03-04","compare the max temp c of 2022-11-21 and 2006-05-29","compare the max temp c of 2016-07-20 and 2010-10-23","2016-11-05 versus 2016-09-28: compare their max temp c","how does the max temp c of 2007-05-07 compare with that of 2013-06-12","1992-03-29 versus 2007-06-03: compare their max temp c","1998-09-10 versus 1999-09-03: compare their max temp c","2003-08-12 versus 2007-08-19: compare their max temp c","compare the max temp c of 2014-02-02 and 2017-06-26","how does the max temp c of 1993-03-04 compare with that of 2001-01-13","compare the max temp c of 1997-11-27 and 2014-04-28","how does the max temp c of 2016-05-21 compare with that of 2019-11-25","compare the max temp c of 2023-10-08 and 2024-09-11","how does the max temp c of 2023-02-15 compare with that of 1999-06-21","compare the max temp c of 2007-06-03 and 2003-08-06"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-weather-07bc7b","columns":["date","max temp c"],"n":12538,"cols":[{"f":"01991-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|36-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|37-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|38-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|39-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|02000-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|31-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|36-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|37-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|38-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|39-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|210-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|31-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|36-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|37-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|38-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|39-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|220-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|31-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|32-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|33-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|34-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|65-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|66-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|67-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|68-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|69-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|510-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|61-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|35-01-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|62-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|63-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99|830|91|64-01|92|93|94|95|96|97|98|99|810|91|92|93|94|95|96|97|98|99|820|91|92|93|94|95|96|97|98|99","sep":"|"},{"d":"29.3|27.5|28.2|30.8|30.4|25.5|25|22|24.3|27.3|28.9|29.5|26.9|31.9|28.1|23.2|23.3|26|27.7|31.2|25.9|25.8|23.9|28|32.5|30|24.4|27.6|27.2|26.6|28.4|24.1|27.9|30.7|31.8|27.1|27.8|26.4|23.7|29.4|34.7|28.7|21.5|22.7|22.4|23.4|26.3|25.4|31|22.1|22.2|20.4|26.8|26.5|26.7|20.7|22.5|25.1|25.2|22.8|21.9|23.6|24.2|22.6|19.6|22.3|20.9|21|21.3|21.4|23.1|19.8|21.2|21.1|17.3|19.9|20.8|17|18.5|18.4|18.6|19.4|17.5|18.3|19.5|14.7|15.5|16.1|16.6|16.2|16.4|18.1|16.7|17.6|19.2|19|20.6|18.2|17.4|15.7|17.2|18|19.3|16.9|17.7|16|16.5|17.1|15.8|15.1|15.2|21.7|19.1|16.8|14.9|16.3|13.9|14.8|12.6|13.5|13.7|14.4|15.3|14.1|17.8|12.4|12.7|13.8|13.1|15.9|14.3|20.5|20.1|13|15|13.6|13.2|13.4|15.4|15.6|20.3|14.2|18.7|18.8|21.8|24.9|20|21.6|24.8|30.6|19.7|22.9|29.6|20.2|17.9|25.6|24.5|26.2|28.3|25.3|23.8|23.5|24|23|18.9|13.3|14.6|12.9|14|11.3|27.4|30.5|29.9|32.3|29.8|25.7|24.6|30.2|34.2|29.1|24.7|27|11.5|12|29|32|31.7|34.4|31.3|34|33.6|33|28.5|26.1|28.8|12.3|14.5|12.8|31.5|31.4|36.6|11.2|12.5|32.7|28.6|29.7|9.9|31.6|32.1|12.2|33.5|31.1|30.1|34.1|32.2|11.4|12.1|30.3|29.2|11.9|30.9|33.7|32.6|33.3|35.3|35.4|33.1|36.7|33.2|33.8|37.5|33.4|34.5|38.4|11.8|36.4|32.4|34.3|36.2|37.3|11.7|34.8|35.9|36.3|37.9|33.9|39.3|32.8|36.1|35.1|37.1|36.5|39|34.6|41|36.8|32.9|36.9|35|34.9|39.9|40.3|41.8|38.9|38.7|38|9.8|35.8|10.5|39.1|37.4|35.2","i":"0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,m,w,x,y,z,10,11,n,12,12,8,13,14,l,15,16,17,9,18,19,1a,1b,h,1,1c,1d,1e,1d,1f,17,1g,11,1h,1i,z,2,17,r,1j,1k,1l,1m,k,l,11,p,8,1n,1b,1k,1o,1p,s,1q,1p,8,1r,1m,r,1s,1t,8,17,l,16,1u,1v,1w,1x,1v,1r,1y,1u,1z,1r,1u,20,21,5,22,23,24,1y,25,26,27,28,29,1t,8,2a,2b,2c,1x,1t,17,2d,2e,2f,2g,2h,2h,2i,2j,2k,2l,2b,26,2l,2b,2m,2n,23,2o,2p,2q,2r,2s,2t,2m,2p,2c,2u,27,2t,2v,2q,2w,2x,2q,2w,2y,2y,2z,23,2a,2e,30,31,2j,2e,32,26,2m,33,2r,34,2c,35,2h,36,2g,37,2x,2e,38,31,39,3a,3b,3c,2d,3d,2h,3e,3f,39,2j,3g,2x,3h,3i,3b,3j,3k,3f,32,2x,3l,31,3e,3m,2q,3n,3o,2y,37,3p,3q,3l,2v,25,2c,2x,2z,3r,3s,3f,27,2o,39,2b,3n,3t,3l,3u,2b,26,2z,2g,3v,2x,2k,23,2n,1v,3w,1f,21,2t,28,2a,3f,3x,3y,1n,1w,34,27,2k,2b,1w,2b,2q,22,1s,3z,25,1y,33,1x,g,3y,3o,40,g,i,41,f,25,1n,2m,g,42,43,a,p,2q,3w,1k,44,45,29,28,1s,g,2t,2v,22,29,1k,t,2b,2c,18,l,g,1q,1,1r,g,33,1j,1n,3z,3g,3w,1x,46,47,1b,29,26,24,17,1y,1l,48,49,24,1a,4a,1z,1w,4b,u,26,43,1d,4c,4d,4e,2m,23,2m,12,n,8,33,6,1o,v,7,2o,1r,19,4f,1l,4f,4g,24,3o,1d,4h,1n,1t,7,47,4f,g,1v,7,2o,1n,1r,4b,t,18,4c,23,18,4c,11,48,4e,3,1x,17,g,44,6,3o,7,1q,1p,44,45,1q,1e,q,2o,3w,43,4i,41,l,43,43,2m,21,g,4d,1d,m,1p,u,12,2m,2u,1f,1w,40,33,47,4g,4i,1n,4g,m,1t,1t,4j,g,v,4i,1y,4f,4b,1z,1j,17,43,q,m,2o,1t,4j,20,7,v,33,1o,7,4h,1p,1v,24,43,1d,19,19,2z,3g,1s,1u,1x,33,47,1r,g,4a,2n,46,1k,3n,2s,2l,35,3g,1s,3z,18,1s,23,26,4k,2p,1s,3w,3w,46,3o,1e,2b,2t,29,3o,2z,2w,3y,22,26,2a,30,2y,3b,32,2y,2x,2a,3l,2h,2y,2i,2p,2n,27,22,31,3u,2v,2e,3d,3t,3e,3f,2y,2r,3u,2x,39,2g,30,2x,37,2i,30,2k,3s,4l,3u,30,32,4m,3v,26,28,1z,1u,37,3l,3e,2d,3r,3c,3k,2k,2z,3e,2f,37,2x,2y,37,3h,4n,3d,3q,2x,35,3k,37,4a,3z,1v,2g,2r,22,3u,4o,2l,2y,3e,31,3e,2i,2t,1f,3q,2q,2u,26,f,31,2a,3q,3v,35,4a,4p,3s,3m,3e,31,38,2y,2k,1s,2u,2m,2b,27,26,3n,3m,3t,3e,1u,3e,3v,2f,1s,2l,2s,2w,3c,30,26,1f,24,2u,1r,4m,35,46,28,27,2q,2g,2k,2b,2o,3z,2b,42,44,29,29,2s,3z,42,1k,4i,1p,1w,1f,35,38,30,3g,24,4i,3y,46,1j,2o,47,1i,1d,20,4b,1e,4k,4a,3y,1w,l,1f,2s,2f,2s,26,2u,1v,2c,21,v,12,q,1m,1l,1m,h,21,1p,1d,2p,2q,2c,24,1o,1x,41,24,2o,26,4k,1s,3n,20,q,l,1u,1z,24,18,1o,4h,41,8,t,9,48,1e,19,9,8,4h,4i,l,4b,4d,42,1w,12,1o,1e,1m,6,h,1e,4j,4q,4r,4s,4t,45,1l,t,4,16,41,4u,41,1r,4v,2,1,8,4w,4x,1,r,4y,40,47,l,l,1a,12,11,4g,33,1e,19,1m,4h,4i,12,1h,47,1r,4c,4d,4f,4s,b,4z,18,1m,3n,3o,7,g,4c,v,40,21,21,24,24,1t,1n,17,1n,1k,7,50,24,2o,v,1y,4h,h,5,44,2c,33,3n,33,23,46,51,15,4v,1r,24,3w,16,4j,8,51,1o,2m,2m,21,1o,1t,1n,33,43,17,1p,34,21,43,33,2c,34,2c,20,12,2a,2j,2u,1r,2o,4k,1v,23,1j,2g,1f,3d,32,4a,2q,2b,28,29,3y,4k,2x,34,2v,2z,3g,28,16,1u,2d,2l,2y,3e,38,2h,2y,2v,39,3l,32,52,3b,3u,2e,2f,37,2i,2c,2w,26,2v,2r,4m,3d,2d,2d,3x,32,2e,2f,2s,2p,3y,3u,2e,2w,2q,2f,3x,36,2y,2i,22,2w,37,32,2d,3j,3r,2e,4o,4a,2p,22,2l,31,3u,3d,2y,3y,39,2g,2e,53,3j,3m,2g,2f,28,42,2k,2f,29,2b,40,27,2r,26,2h,2q,23,27,22,2s,2n,26,2y,3q,3e,3l,1z,7,2t,2g,2d,3e,37,4a,7,3l,3l,2v,32,2e,25,2i,34,3g,2y,2b,2o,2z,4a,2v,2v,2b,30,2a,2o,f,4g,1l,4k,49,27,2q,2u,46,6,4u,3z,3u,2i,28,49,2l,40,1z,44,33,47,2a,3y,43,4i,1m,33,26,16,2p,26,2m,3w,4i,40,16,1s,21,1t,21,49,2z,2n,1r,m,17,3y,1j,19,54,55,f,7,4b,28,3w,46,7,2,2o,33,12,4s,1r,41,4q,42,2o,2o,1e,1w,1t,4w,e,4g,z,2,4w,1o,1y,1m,4h,1w,1a,1a,19,1p,10,1w,1l,k,v,1,1h,56,57,c,58,59,5a,5b,51,4g,51,u,48,4h,18,1a,x,5c,4w,z,t,1x,m,4i,h,l,h,1p,5d,k,h,z,1l,g,l,s,w,5e,1,15,u,4x,1p,44,6,1m,5c,4g,21,1z,3o,24,4i,4f,4f,1l,1q,4v,42,1v,40,12,12,12,1q,1w,17,20,h,1k,2z,3n,1o,20,1y,3g,3y,29,2c,2o,1w,1u,42,1v,1w,21,24,1u,1j,18,4f,1u,3w,1o,19,6,7,3o,1x,4w,2a,3v,4k,2n,1s,24,1t,29,1v,1f,3o,1v,1v,40,7,4h,6,4f,v,7,5,50,22,2t,2t,34,23,2g,37,2z,2r,32,2a,3w,2s,35,34,1w,2v,3l,2n,24,24,1d,1m,27,20,1w,29,4k,42,34,4a,2l,2w,2u,2p,2y,3q,3v,37,2f,2y,3u,3g,2z,2h,2q,2k,27,30,3f,3l,29,2y,25,2a,3d,4l,3r,38,3j,3q,37,3o,42,3z,3y,2l,2l,22,3y,2s,2e,2r,2e,2s,4o,3v,36,2r,2f,4l,5f,3j,2y,2d,3u,2v,2a,28,3t,3u,2e,36,3m,5g,28,2w,3b,3c,3b,2k,24,1x,3u,32,22,2e,3s,39,2f,2z,34,1j,2k,2l,29,23,4j,22,2x,2q,3w,2c,4c,m,1y,23,3d,3u,2h,2g,3o,1q,4j,29,2t,16,3y,4j,2s,25,5h,21,4v,1v,2z,1s,2f,3w,18,21,2j,m,4j,5,1w,1q,4w,4a,2p,1n,18,2z,3w,28,19,g,5e,28,4a,1f,35,2w,27,3n,47,4q,1y,1b,2m,16,1k,4d,3z,1k,1w,1u,4j,46,1t,1j,g,1h,7,16,41,1p,34,1d,1j,l,5i,4g,3o,40,50,v,b,5j,40,k,5d,26,2u,1j,1t,4i,q,r,24,2t,2m,1o,1q,s,7,16,6,5d,4d,4e,j,5k,1q,1a,1j,21,4i,15,2,7,q,6,2,24,16,44,1h,45,33,3n,1t,g,1p,1b,44,1b,5,5d,5d,1q,47,g,42,42,1f,1o,1d,1o,17,1p,1a,1h,21,1v,4v,58,v,b,f,18,8,41,4j,50,m,m,f,4g,1t,1u,40,1n,40,1e,4d,4j,19,4w,l,4b,41,40,1j,40,21,17,q,f,1b,4j,1f,2o,4q,2u,4g,1f,46,1m,5c,1f,1d,44,h,1q,2,29,21,43,2c,23,1t,47,2m,7,2w,3w,4h,49,3z,2t,29,3z,2m,26,4k,3y,4k,1x,24,1j,33,2m,4k,2u,1f,g,3y,1u,28,24,1r,19,21,3z,2c,2b,3x,2h,2j,2z,2j,2u,1e,f,g,1o,3g,2a,25,3g,2c,4a,3l,30,2w,2w,29,2t,36,35,2f,2r,2z,3u,4m,39,5g,3l,30,2m,49,7,1s,37,2r,32,3u,3h,4n,5l,3h,3d,36,4p,3k,4m,31,2s,2a,34,2z,36,32,4o,31,2v,3r,4o,3s,5m,3s,3i,31,2y,3l,35,31,2e,2i,2v,3l,3f,3t,3f,26,3v,3l,5h,3u,2g,2e,3d,4l,37,2e,3g,3b,2f,38,4o,3q,3r,3x,31,2r,2y,2y,2l,3g,1u,4h,47,1x,1q,4w,24,k,2q,4i,1i,43,2h,49,1a,1g,2n,2h,1s,43,3j,5g,3f,3q,2z,3y,2q,35,34,f,2w,2y,2e,2t,m,4b,43,34,1t,2n,4o,38,39,2h,31,2s,1w,1p,3g,32,46,18,1n,2h,2x,16,4d,47,1b,2z,2z,1z,4i,18,h,46,46,1j,1s,3g,2j,26,42,24,1o,2i,2v,1t,e,1b,16,4h,17,1k,q,11,b,1o,2s,49,1o,4f,23,24,4b,34,2v,3g,2q,3g,3w,28,i,5n,56,5o,f,1q,3o,q,5c,24,1q,24,1e,12,1h,16,2k,1z,1d,6,9,1r,2,16,21,34,2a,25,3g,4k,47,1p,16,17,4i,1l,1i,t,1w,1u,33,1j,1r,19,1p,1o,1k,1r,1e,4g,1a,1e,f,5d,h,5p,21,1x,1t,4f,p,5,1i,1q,t,1k,0,2,4q,g,12,10,1q,4v,k,4j,1w,1v,23,4k,49,1j,1f,12,1q,4c,20,33,1o,33,1u,1d,q,1,t,1j,4j,1o,19,12,4j,4i,12,2c,3n,1j,1d,18,1m,50,1q,5o,50,1v,g,21,16,3n,7,33,1y,f,17,7,m,11,4i,v,4b,4c,1t,18,1r,54,1t,26,2i,2z,27,42,33,42,16,2w,3l,2c,2m,16,3n,1u,g,v,1m,6,2w,2n,3z,1z,2m,49,29,49,23,24,2a,26,1t,19,16,25,2g,2a,2l,2q,3g,27,2g,2f,22,3z,3z,2z,2w,2l,28,2w,3y,4k,3n,27,28,1t,2w,2v,22,2e,3u,5g,3m,36,39,5g,3q,3q,2e,2p,2p,4k,25,2f,25,2q,3v,3v,36,3u,2h,2k,3u,2h,32,2r,2i,2z,32,4n,4l,3p,3x,3i,3k,4o,38,3b,3c,36,2m,37,3f,2i,2z,3g,31,3l,4a,36,2t,2h,2v,3z,2t,2u,4k,2k,27,2f,5h,3d,2r,2p,3w,1u,4j,4a,2t,3g,3g,5q,2d,3m,31,2e,37,2u,2w,2t,1u,31,3x,3q,2r,2t,2r,4a,4k,3g,23,2n,2c,4a,2s,1u,2h,34,40,h,5d,1x,5,2l,31,2i,1u,1a,3w,16,2t,2z,1d,1w,2t,3n,7,20,1y,23,2i,2z,1e,k,4s,3n,34,3w,1e,1b,3g,47,8,3q,2y,2a,3g,29,1e,28,4k,1o,1t,49,35,27,1v,1r,1t,2r,37,3g,23,4i,1s,2u,4j,4r,5j,5d,4b,48,3w,4a,1u,2k,3u,2g,2c,4v,y,g,20,4f,41,10,5r,43,q,1r,l,1y,1e,5d,1r,43,34,3z,29,40,1,2m,3n,7,42,1r,h,1i,i,s,l,33,8,43,29,43,3n,1d,4j,m,1l,r,1x,20,1w,16,1z,49,1w,1k,4b,4w,33,1o,4c,5,s,s,5,17,4g,1y,5,1b,1w,2o,17,4b,1d,3w,1w,33,44,q,1,5s,11,16,g,6,4g,1b,1q,4c,1b,50,5d,4w,n,4v,5d,1y,t,1n,1r,51,5,z,4b,1e,1n,12,41,1j,1e,1q,1b,1v,4j,4i,1n,16,4w,5c,4c,20,1j,4h,1r,1w,f,6,w,7,40,1s,3o,k,1a,1m,1l,4b,2z,2l,20,1j,2o,21,1k,k,1f,1v,6,17,46,1o,1n,1n,1q,n,2t,16,1w,17,4h,17,1e,1d,21,7,4j,1w,7,2y,3v,2e,2k,2g,2z,2l,4k,3y,49,2p,3e,2q,4a,2s,2y,2q,3g,4k,3o,49,3o,39,3t,31,37,2x,2a,42,16,2l,2h,2i,2k,2y,35,2j,36,4n,3f,39,38,36,2x,3l,2i,25,2v,4o,5g,2r,30,3u,32,3f,3t,38,3c,4o,3f,2f,2u,36,5t,3t,3x,5t,3d,2v,3x,3j,4o,39,2d,3e,2g,3e,2h,2q,3y,2j,2g,3x,2d,2e,3f,39,4m,3m,3d,3v,27,2v,3q,3d,3z,2h,27,2g,2q,3n,17,37,3u,5g,2i,3g,1v,4n,3v,3l,2k,2p,27,3z,3n,25,1j,2o,46,3g,2q,2n,2c,2n,2z,2y,2g,2n,42,m,2p,3v,3u,30,1j,3q,2x,3c,38,2w,24,33,25,2r,4k,20,i,41,2e,1s,2x,2z,33,29,16,13,44,34,4j,2m,1p,23,25,2t,37,2q,4a,1u,4h,q,44,r,1f,1n,4i,r,4b,f,1s,42,2o,1e,1h,1s,1x,1a,4r,1e,6,p,1o,1i,21,1y,11,m,16,19,4q,4i,l,48,5u,1y,4b,18,i,5s,1x,1l,41,11,f,g,4d,40,1y,t,4x,54,5c,t,d,r,5v,51,57,45,q,1a,1b,5w,3w,19,4d,5d,t,2,5p,b,g,4h,f,17,m,1y,v,k,1i,c,e,x,19,1a,5i,44,u,4i,i,j,2,5,c,4c,55,4c,n,l,u,n,4,s,4z,2,5o,u,19,g,k,5w,50,i,5s,45,1x,44,4r,5j,4g,5p,40,41,54,x,5x,1r,1p,1m,c,45,5e,4e,1x,20,f,1q,5,1h,4,q,43,4w,18,m,50,10,5y,5c,5n,g,1w,1n,1t,i,18,1y,u,1z,1x,4v,1n,l,41,6,15,20,34,1j,1q,41,3y,49,3w,1o,1f,33,49,4i,3g,26,46,12,3z,1s,46,1j,1e,3g,2q,2p,34,3g,16,23,2k,2i,2i,26,46,2j,28,3n,29,26,2j,26,46,2t,2w,1j,2h,22,2g,3y,2m,1s,46,2c,3w,25,35,2v,2a,1z,31,2f,2f,2x,25,42,2y,2k,2k,3q,4n,3e,31,2s,22,2r,5z,53,3a,5g,3q,25,2e,3j,3c,36,2e,30,2l,46,3l,2y,60,3t,3c,36,3l,3b,4m,2d,3u,3q,2r,3q,22,2y,2d,32,2g,4m,2e,3r,3a,3b,3x,3e,2e,2s,46,3e,38,30,32,3u,2f,27,2w,37,26,3m,3j,2d,3g,30,2k,2n,1s,2q,3q,3e,3l,30,2g,3g,2j,3y,1u,20,1f,47,2p,35,2l,26,2a,34,28,23,1d,42,2w,22,2n,47,44,2b,4k,16,19,2t,2r,3z,42,4j,10,11,4z,4s,0,1k,47,4i,2i,30,37,3v,2j,3n,1b,46,1e,2m,l,58,24,3y,4k,1j,1s,8,f,k,3y,2s,2j,29,24,2e,2y,4a,1v,1m,49,4h,43,2n,34,1o,4j,4j,1e,47,46,3n,35,2f,22,1k,c,29,34,2m,46,1u,2m,3z,23,1s,18,e,1u,2c,1e,1k,7,50,50,e,n,n,s,1w,1t,4w,43,1y,15,1x,1y,g,1p,1m,44,4w,50,1h,4w,4j,41,1m,1i,r,i,r,9,1g,1l,1m,61,q,10,1k,1q,t,h,1i,e,1o,3w,18,1q,f,4g,50,4g,1p,1h,f,18,1r,19,4g,4h,4g,c,4e,f,4h,4g,4w,41,6,h,i,k,5e,50,33,19,41,4h,4w,33,1n,43,f,4i,1k,4g,t,w,1i,1,19,1e,g,50,1o,v,r,z,4f,f,q,4c,8,44,1i,4w,3n,18,1m,51,c,42,3y,43,1x,28,3w,7,3w,1v,1x,2p,1j,3n,2c,1u,1j,17,1p,3o,23,1z,24,f,4g,2x,2x,37,2t,29,3n,32,2k,35,2k,30,2w,34,2c,2n,29,1s,16,28,27,1s,1j,1u,3o,1w,3m,2z,2b,2u,1z,26,3y,23,2u,24,1f,3z,25,1z,46,23,2v,2t,2y,35,26,2n,2q,25,37,2j,39,32,32,5h,5f,4o,3l,2l,2y,3v,2q,5g,2e,3u,32,30,3v,2y,22,37,36,3m,5g,30,2w,3u,2x,2i,3l,2g,2k,2e,2g,2e,2y,31,22,3z,3y,39,36,30,2d,2e,3m,2e,30,3e,37,27,3m,3c,4m,4m,3e,32,4m,2f,27,2y,22,2v,49,2l,4l,3m,36,3u,2w,1u,1u,3e,30,3v,25,3y,1f,2x,2w,2w,2n,3y,1v,27,3z,16,49,3g,39,2x,22,3d,3v,2f,2i,2k,1n,1y,2n,2z,22,3l,25,3w,4i,3n,1j,3y,2b,2u,21,18,1k,1j,28,3y,2l,2l,2a,1z,4w,54,1h,1s,1s,42,1v,27,4k,47,2g,22,1x,50,2l,3y,1t,1y,1v,1r,v,4g,v,2p,2q,2l,2j,1z,1q,20,29,2h,2x,2j,29,v,n,11,3g,2f,2s,2p,2m,43,1b,43,1z,43,50,2w,34,21,4j,m,m,t,33,f,1r,q,11,5p,3o,h,23,43,43,12,z,16,21,1f,3z,24,1o,19,18,1d,1d,16,7,49,40,2u,1f,3n,4c,4e,1y,43,49,2o,43,1r,16,40,16,1y,12,1i,43,41,5b,5i,5e,g,2m,42,1d,f,4h,19,43,20,1t,4j,6,k,i,5y,12,5d,z,b,e,58,m,2o,3o,1w,q,1m,1b,k,62,4v,4w,t,5d,5,1g,18,50,1p,1p,4b,s,18,6,2o,1j,1z,1m,1y,4w,19,1p,10,1n,50,4b,z,4c,19,34,49,18,4k,3o,7,1k,4b,40,17,4f,1q,3o,l,40,f,29,49,42,20,1d,16,1j,7,1q,4g,50,1x,3o,2p,3o,1w,2g,2q,27,2j,2c,3w,3n,20,1r,1u,2o,3n,3w,29,2o,2b,27,34,22,2p,28,1o,2m,2s,37,2w,2v,2t,27,2k,3g,2s,2m,2z,2j,2s,3a,63,5m,5g,3u,3j,31,3e,3s,3f,31,3u,3e,3v,4o,3m,3f,3e,2g,2g,2k,2v,3l,2y,3z,2w,3u,3q,3q,2y,2h,27,3s,3e,2d,2h,2h,5g,31,2r,37,37,2a,2x,36,39,3d,3m,2r,2x,31,39,2t,30,2e,36,2i,29,1j,2d,3h,3f,32,37,30,2h,2f,2g,2v,2h,2i,22,2u,2j,2s,2f,2e,2e,3v,2q,5m,3m,2d,3u,3g,3g,2j,2k,2r,2z,2w,3z,2g,22,4a,1s,2p,35,2u,2j,1r,1s,37,2u,46,2s,49,2z,2u,1t,4a,26,4w,m,m,43,1n,1u,23,1j,2k,2p,q,1k,64,1n,3w,1z,1z,49,g,5c,5o,1m,2a,1d,2a,2u,2z,2c,1j,2b,2q,2c,40,3w,26,2c,33,40,41,4i,m,2v,2w,4a,2u,49,3o,40,2m,23,4k,2j,1s,1j,1v,23,23,1j,2p,27,49,1y,1u,33,1d,2o,24,12,16,33,q,19,v,4v,e,46,1f,16,18,m,1e,18,m,24,8,5o,56,h,18,g,4i,4w,1h,4v,54,5c,5b,n,55,4s,4s,15,1v,18,2o,1o,v,1i,4u,u,4e,4v,4b,4j,2o,1t,4f,62,1l,1h,65,47,4w,17,19,1b,1h,u,55,45,a,u,5o,12,1b,4w,3w,17,8,4b,4e,1i,7,17,q,i,6,17,4f,45,4f,1f,1w,47,f,1q,12,1l,z,11,51,h,z,10,4z,4j,q,40,1k,1k,4i,1o,1p,1k,1q,v,l,1x,47,12,8,f,17,4w,1m,6,g,1h,1e,1t,4c,1q,29,1j,1u,33,1q,3n,23,1r,m,1y,19,8,1p,1j,4f,2y,1s,20,8,4i,k,4c,62,20,2b,3n,3n,1z,1v,40,1t,34,2n,26,2p,2p,3y,2m,4a,2e,2h,2s,2j,2w,2w,2v,2b,3y,34,1n,34,2d,32,2a,2l,2e,2i,2w,35,2a,2q,2f,2d,3l,37,2r,2q,2s,4a,4a,2j,42,2n,27,2t,2p,2m,2u,2g,3j,30,37,2h,25,37,35,2s,2q,2u,2l,2j,2g,2q,25,2x,37,2i,3q,2h,2h,3m,3m,3t,36,30,25,2k,26,2t,2z,2i,3v,2g,2r,2h,2x,32,3d,32,2r,3v,3d,2d,2f,3l,2v,3z,32,37,4k,16,2r,3q,2d,2v,4k,26,3g,3l,2h,1z,17,4m,3e,2z,2b,36,4m,5g,3v,2m,4k,3s,2h,5g,3v,3u,2w,22,2c,3y,3q,2k,2m,33,2n,3g,28,2c,46,23,46,4h,2n,1s,1e,f,1j,24,20,4w,l,2w,35,3z,3o,7,q,1o,g,42,27,12,27,2p,22,4k,2z,1k,4j,21,4k,1d,7,19,2t,2f,2b,1j,18,k,h,8,17,1q,4f,1m,m,40,1s,34,40,1p,1m,3g,22,24,1p,2o,3o,43,3o,40,1f,4w,z,2e,2i,2a,34,1e,5d,13,5o,3w,24,8,u,f,s,66,1p,2u,1m,a,46,19,1,8,7,8,q,42,1o,1d,8,5,4q,4w,1p,c,d,4t,1g,7,4b,u,d,3,56,4x,1i,s,4f,11,65,54,1y,1n,g,g,f,47,1n,3n,7,1y,44,t,54,62,4g,12,1p,4i,1l,4d,5d,l,1q,4h,1b,17,46,42,3n,40,1b,1q,41,1f,1w,33,g,v,10,4i,1d,m,4v,1,1p,1y,f,1y,4c,4w,1r,7,4h,47,1r,1o,19,1i,21,2o,40,18,m,1w,40,g,e,5p,1i,45,9,16,20,18,g,q,41,1q,43,1v,34,1u,1w,20,4h,19,3y,2o,24,21,17,1p,4i,19,q,3n,1u,1w,1f,1f,4w,g,4i,49,1d,4g,4i,19,4k,4k,29,3y,1s,29,1s,3o,23,1o,1e,1t,18,21,2t,46,1f,2f,26,1x,2q,2x,2k,3j,2v,2t,2g,2f,3l,3e,2k,2d,38,2e,32,31,3e,2z,3g,2j,27,40,2l,22,26,2g,2r,2z,37,2b,21,2f,3c,39,31,35,2h,2e,3u,2t,3q,2y,4l,3b,36,3d,30,2s,2d,2t,39,2k,25,3z,3e,3u,2z,2q,2g,3v,4a,2r,2x,2j,23,3e,3l,3y,30,3s,2w,2q,2j,2w,32,2q,3y,3o,18,28,30,20,1s,2q,2p,1k,v,27,3q,4m,39,30,3v,3q,2s,26,2j,26,4o,2d,4m,2x,2e,35,34,24,1f,2e,1f,4h,6,1k,3w,1y,1j,1t,3v,3e,3g,1s,3n,21,4g,2v,2c,27,2l,1r,16,2m,44,s,1q,1x,19,2g,2s,3o,19,5d,4v,1m,4g,4b,15,2w,2v,2v,2m,m,4h,19,5d,26,4v,1i,f,29,g,z,21,z,2f,2q,3y,20,10,4i,1e,1r,64,k,1x,33,m,64,13,5d,49,1t,m,1y,42,29,1o,6,1b,5,1v,4c,f,48,67,o,47,40,19,3w,3w,1q,i,5r,a,2o,1x,z,1y,2v,1f,1y,c,47,1a,54,4h,1d,g,1b,11,56,1n,16,17,3o,1n,f,q,4v,1h,4g,12,f,41,50,4b,i,66,1e,1t,16,33,4j,v,4c,50,54,68,q,h,4r,1y,m,1b,4q,4t,1b,v,5w,69,6,19,v,q,8,4f,4f,5d,51,1h,5o,k,10,4e,50,n,5e,19,1n,4j,v,1d,6,4h,1p,4w,v,50,9,50,1v,21,f,43,g,1y,v,1e,33,1u,1r,19,1p,4i,43,17,19,6,i,18,3n,2c,42,1d,f,1e,f,1y,1r,49,43,1d,2m,2i,2b,3n,1x,4i,1z,3o,23,1u,f,1o,8,3g,2s,2w,3z,2u,29,2n,34,34,2n,24,29,43,1e,1x,2j,4k,1v,2f,26,46,1v,18,18,3z,25,3y,25,2q,2w,2l,46,3n,4h,3w,1s,3g,2l,2r,32,3l,22,2a,2t,2j,34,49,3n,20,1f,2m,3y,2x,2i,2k,2i,35,2u,3y,2e,36,3l,2s,2s,2s,35,39,2y,39,5g,38,32,3g,3y,2t,2i,3k,3i,3s,3f,31,2h,2f,4a,3l,2x,22,26,2e,2r,26,2s,39,3q,3m,2e,37,2b,3o,4m,2h,38,2d,3x,3x,3b,3m,3q,2e,2b,23,3w,2l,37,22,2i,3j,2d,4a,2b,2b,4o,3u,2t,37,3h,3r,31,2x,3y,2b,2t,2k,30,2r,2t,7,22,38,3g,2b,2g,1d,2p,2f,2d,3v,2t,43,3w,29,42,22,3z,1u,1u,50,25,1t,5e,z,1b,4q,8,25,2x,1d,2i,34,1t,36,2k,2p,22,35,43,4o,27,4o,3u,2h,2t,16,3w,34,1u,6,2c,q,49,1s,1z,24,1s,25,3o,1u,1t,19,3w,28,3z,1v,q,r,29,24,47,19,4f,3w,34,4h,u,21,2w,3n,19,h,v,2p,3y,37,37,22,27,49,1t,1q,1g,1r,1k,c,49,2b,2m,1f,1o,v,n,4v,5o,1k,4i,1p,50,r,5j,50,z,64,7,4b,d,1q,1f,33,19,11,62,i,1g,z,4e,w,4v,6a,1g,l,4r,1h,6,15,4g,q,8,z,1v,33,t,64,5p,4c,9,4w,19,q,1h,4d,51,4f,l,q,18,4j,5,4x,4q,0,69,5r,6b,62,11,t,5p,44,4w,44,1l,4x,5v,4v,17,1u,46,24,47,4c,a,3w,24,1t,47,50,1r,4g,n,5u,1f,33,5d,18,1t,m,18,47,16,4c,6,1x,24,1k,1n,l,51,18,1r,44,11,8,1h,18,4g,24,21,7,42,23,1x,40,4j,18,24,1k,1p,4c,1i,42,1v,43,1x,1k,4f,3o,40,3o,2n,34,26,43,1u,2z,4k,4i,3z,24,1v,29,3g,2k,1z,2l,3o,2c,2u,1k,34,34,2t,3w,3o,2m,49,2o,24,2v,3e,2g,25,25,4a,24,4a,1s,2v,3l,2s,2j,3w,24,2q,32,2f,42,18,2t,37,39,2r,2x,3x,2w,2k,4k,2w,2a,2h,25,1z,42,1z,2l,2b,2l,1e,2b,2r,3l,3t,2k,35,4a,2l,2x,2g,30,3g,3f,63,3h,4m,3q,2d,2f,35,2j,3l,5g,2g,3u,3e,2e,32,25,36,3q,35,2i,2e,2x,2z,2k,3y,3y,20,27,3j,3x,3u,5f,36,2w,1w,17,35,27,2c,3o,4g,2n,25,1e,2p,5g,4o,37,2z,31,22,3n,1k,29,29,1e,2e,2p,2u,49,23,2c,2u,2q,2z,1x,6,1u,3z,2n,1t,l,4i,5c,2v,2r,22,24,1z,17,2j,2c,2o,2c,3n,6,4s,6c,5p,1n,2b,2i,3q,2z,2b,3n,49,1d,2n,1f,v,15,2n,2g,3y,21,1p,k,47,17,4j,19,1v,2b,2p,29,1x,4c,4v,12,q,1x,4h,5v,1,2p,2n,2t,2p,2c,3n,12,2,5s,5c,6d,6e,29,1s,43,4g,12,1d,q,19,g,4d,1p,v,4d,1f,17,1e,41,5y,1j,m,1b,4v,i,16,12,0,3y,26,3n,g,b,1h,4i,e,61,4d,1k,1z,1v,1d,4h,54,4q,1c,1a,h,3n,1t,50,5c,44,4c,1q,8,v,q,v,50,5d,4j,8,1i,z,4c,k,4v,1g,n,6f,4c,24,1t,4h,43,1q,45,1e,1y,5,5p,33,44,1q,8,l,1i,m,7,1y,5,8,1b,6,51,42,1n,47,12,1k,4g,1m,4v,h,1i,47,4k,1s,2o,24,1f,4k,29,29,2n,28,v,20,2c,2n,1j,18,1b,b,29,1j,f,1t,1p,4i,44,1q,1w,2o,8,24,43,f,5c,47,46,2o,1t,1t,16,1y,4j,v,1q,4q,20,7,3y,1j,24,21,3n,2j,4k,1w,1r,1x,23,28,28,2j,3l,37,3v,3v,2x,3z,2u,1s,27,20,3v,35,2z,37,2l,2b,2y,2z,3g,3w,3z,4k,4k,3w,1f,1f,29,2p,2j,3n,2l,2j,2h,3u,2i,27,2g,31,5g,2h,3e,2d,2y,2y,3g,2h,2s,25,2v,35,2v,2w,2w,2h,2f,3c,32,3m,2x,2h,32,37,38,2e,3v,3l,30,25,2v,2u,29,49,35,2v,2l,4k,3z,2b,2p,43,22,38,37,2s,2a,4k,35,3k,38,3v,2l,24,2f,2v,3o,1v,25,26,2h,3e,35,25,2b,2v,2t,42,33,4h,35,2n,2h,3c,3u,35,26,3w,40,8,1o,2g,2c,29,1r,25,2s,2z,46,2l,2m,24,19,1u,2n,1z,2w,49,28,4k,1t,c,54,26,1b,3w,3w,4v,3w,49,6,2u,1t,18,3z,4a,34,28,2c,29,1u,4h,1p,4g,4b,0,4c,4h,19,7,4h,17,4c,w,7,42,20,7,1m,w,61,1d,1e,1w,1y,h,28,49,17,1,1f,1r,4w,46,1v,2u,v,2i,28,24,1o,4f,l,1q,9,i,5o,5u,5o,v,u,1f,1e,8,m,1m,45,9,4c,20,1m,4,47,5u,6g,n,4q,11,5v,4d,15,6c,6h,4v,5e,7,7,m,4j,q,4w,p,5i,41,4i,i,1q,z,i,16,17,1q,9,1,i,1y,4g,1b,1,1i,5d,w,1b,5o,0,11,19,4b,p,1d,6,5i,g,44,i,h,q,4b,11,4s,y,13,4c,44,k,l,h,i,10,19,41,6,q,12,8,4c,4u,5d,1p,w,1b,11,e,64,4i,4d,4x,41,v,z,1d,1e,1t,1r,17,1t,1p,6,1m,1y,4v,19,49,3o,f,1h,a,1w,19,1w,24,1t,w,5c,1b,1m,33,1s,1r,4b,w,11,1n,28,1s,2b,2t,26,28,2c,1v,1j,1w,3n,4h,21,1x,42,4c,2l,2m,49,2y,2i,1z,3y,2s,4a,3o,2c,1f,1j,2q,32,3e,26,3z,2k,2f,2h,30,3f,2s,2s,3d,39,31,3s,5g,39,2x,2s,3e,63,3m,3v,32,2h,3q,3d,3v,2f,2g,32,2d,2h,30,3d,3x,2x,2h,37,36,2y,30,3f,31,2w,22,2r,36,3m,2z,1v,3x,4o,3v,39,2k,22,3x,3t,3k,32,3v,3l,5g,2x,2h,2z,25,2u,2z,2a,2x,3f,30,3b,32,2e,39,2p,2j,3m,37,2v,22,4k,3g,3y,17,3y,2p,25,4a,43,2n,28,2l,39,2p,35,2w,2t,2c,33,4w,5d,2t,2u,2t,3u,3v,3d,3d,3q,2f,2t,2u,49,46,1z,g,4v,h,4h,4d,m,p,2k,27,1k,3z,41,22,1s,41,26,42,4f,26,4j,4q,2s,27,18,1i,1c,56,4k,2j,44,5e,1o,4v,2e,2a,1z,40,z,2m,1i,34,26,46,1y,12,1,1y,2n,2j,34,2p,2a,27,v,t,t,5,40,4g,3l,34,4j,41,4q,5i,68,50,1r,k,7,1q,62,7,4i,4s,1m,3z,3w,1t,41,19,1k,17,8,5c,1s,4h,15,2m,1z,1w,12,12,1w,47,1b,4f,1y,41,23,7,8,17,16,1t,7,1t,1d,1n,41,1i,3,43,17,50,2,4e,19,8,8,1b,4q,t,t,4x,5a,t,1h,q,g,54,4s,9,41,5e,1p,1k,1p,11,50,4v,5,5d,6,41,4f,47,21,1e,4g,8,l,4b,4w,1a,4d,l,t,c,n,4h,1e,4c,m,4b,4f,15,w,v,1d,4j,i,40,16,l,1r,21,g,1b,58,6,1k,k,2,4b,t,11,x,29,49,1j,1p,l,47,1v,43,1p,4j,21,m,2u,3z,1f,24,1o,1m,1w,1o,18,5,18,7,1r,v,1o,1k,17,25,2z,27,2u,26,1u,18,3n,3w,m,50,8,1e,1k,16,4c,43,28,34,49,21,43,2o,33,40,2c,2o,29,29,2k,2t,4a,2b,28,23,3n,33,25,2k,2q,22,2j,2q,2i,2i,3e,36,4m,2e,35,4m,4m,4l,4m,39,30,5g,4l,39,3j,3c,2d,31,30,36,6i,4n,2g,2d,3e,2k,2u,2p,4o,32,2e,5f,3c,4l,3m,4m,38,3t,4l,5m,5h,5f,4l,3c,4o,3x,32,2i,2b,1s,27,2h,32,2d,2x,1f,1u,3s,38,2f,2z,2k,2u,2o,3w,7,1s,38,3c,32,2v,1s,2d,3m,3e,3v,3u,3v,2i,2y,1j,4g,19,28,42,47,2x,40,28,4o,3e,2x,36,2y,2x,4k,2n,29,3w,m,3g,49,3g,2w,20,2e,35,32,2z,4h,3z,28,4j,h,23,4h,1,4i,5j,3w,g,13,49,3z,2m,23,6,3o,2z,33,4b,p,2i,2m,l,18,1h,r,1o,46,24,43,1d,5d,62,v,1p,33,1k,1w,1l,35,2z,2h,2h,2t,46,24,40,1x,1l,18,19,50,q,50,1q,8,1v,1v,1k,4g,4j,40,m,12,1d,16,47,1m,1b,1k,1p,1b,12,11,16,2u,3w,1f,1e,l,1y,43,24,7,1y,1h,k,24,40,24,47,1q,50,4v,1m,1l,4f,l,50,4h,19,1a,1q,44,1m,5,11,1i,5p,18,1m,54,1d,1r,4c,s,16,24,1d,1p,19,v,l,4c,1g,4q,2,1n,1q,q,17,44,h,1p,1u,2u,20,1d,50,2o,1w,1x,1w,33,47,47,4c,g,5d,m,q,7,41,4b,2m,2j,46,24,1o,8,40,q,1n,18,1y,4g,8,v,q,4w,1m,6,50,1b,4i,c,1j,1x,1n,4i,4v,1m,1j,27,1v,v,1y,1o,1b,49,23,21,1z,2m,1s,42,1x,21,1t,21,3g,2b,2t,27,2w,3y,2s,2b,4k,4a,3y,1s,43,g,3u,2y,2l,2t,1s,27,4a,2n,16,23,3y,4k,28,27,2j,2b,3z,42,1u,20,2g,26,2m,25,37,2i,35,35,3y,1z,2s,3g,28,34,2a,2a,27,2y,2x,2y,2y,2s,2z,2l,1z,2m,2y,3m,2f,2v,2a,26,2b,2i,35,3v,3v,2k,2y,3g,25,2y,2j,1s,2w,22,32,36,2i,2a,27,32,3t,39,3f,3d,4a,4k,22,2f,37,22,30,25,2g,3t,3b,3r,3i,3q,5g,63,3i,2d,3g,2j,31,3l,2d,39,3m,3v,2r,3v,3x,3x,3q,36,2e,2y,2f,3f,3q,3e,3g,34,5z,3k,3q,31,3z,4m,3x,2d,3v,23,2j,4a,3x,32,38,3k,2g,3f,3f,3m,2s,1u,1b,f,q,2q,39,26,47,15,21,4q,3u,2k,2t,7,19,54,23,2u,1e,u,1c,20,23,1r,2l,3g,3y,20,1w,33,1l,2m,25,34,17,17,1i,3w,2g,4m,3e,28,1e,1l,u,3n,2o,9,6a,34,v,10,26,18,1,4h,50,20,1r,40,m,4i,i,21,28,46,20,1y,1g,4f,3y,34,1v,28,1f,q,44,3n,12,5c,m,4e,1w,e,5b,4c,1d,1a,43,4k,4b,4,19,1j,4g,4b,r,18,2n,1v,4j,4w,49,4j,4b,4e,9,1n,c,4q,62,42,1d,q,4r,u,64,1t,49,18,4w,1b,h,61,6a,4w,1j,19,4v,0,5s,5s,x,6j,1p,4b,q,1i,10,w,5o,c,9,51,11,0,4u,6k,4s,1d,33,20,3n,3w,3o,1j,33,1d,q,4d,4w,1n,47,h,i,19,18,1d,1m,v,1q,4w,4v,4h,1k,41,1e,1k,1n,1n,4c,4w,t,5d,4i,19,4j,4v,4b,8,41,k,1h,4q,9,1j,1k,4h,1n,2o,1e,18,v,2c,21,28,29,2c,3n,1r,1p,q,1x,g,c,1t,16,42,1z,28,2m,2c,46,40,1n,4k,2z,29,3u,3e,2n,46,3y,1u,28,23,3w,2t,1z,2v,35,2v,23,2c,46,1u,4a,4k,2c,28,28,2b,28,26,34,3n,27,2x,2f,3l,2s,2z,2x,25,3g,2b,2s,2q,2s,3q,5h,39,32,2s,37,2q,3l,2h,3u,35,2g,2a,2b,4a,2l,30,30,3v,2h,2n,22,3z,2g,4m,3e,31,3f,3p,2d,37,37,32,2b,2q,2e,3b,3b,3d,2v,2t,26,29,1e,32,5g,3e,3t,2i,2k,2l,37,4a,2z,2i,2b,2w,2i,3g,1x,4m,3l,2a,2z,2j,4k,3y,46,1r,42,35,2q,3w,33,27,1t,40,26,1z,20,1o,1m,25,2m,26,28,3w,20,3y,27,2j,2b,3y,2u,2m,l,1,26,1f,42,i,1f,3n,8,1n,e,1j,16,m,27,22,1s,29,1q,4z,46,3v,3l,2a,35,2g,31,2d,2e,3y,47,17,23,1w,23,3y,2t,2o,q,5e,49,1q,20,23,2g,2c,1d,1v,4j,20,f,k,6l,29,27,2o,43,1w,1n,f,1y,1,2o,4w,1y,4e,16,m,1,66,62,6m,1v,19,1b,1i,4r,5y,62,46,28,3o,4h,7,v,q,b,4q,1p,s,k,4d,5,1k,m,62,5u,12,1g,47,k,48,2,5p,4b,1x,4j,f,47,4j,1p,4v,c,21,4j,h,50,1y,4f,4,9,4b,4,5,17,19,l,6,12,4i,10,5e,6k,6n,4i,l,54,41,4b,1g,4f,l,11,41,1l,4w,6,f,f,41,4b,1g,10,d,4f,6,r,m,1p,17,19,4b,15,1c,g,1e,17,4g,5d,l,29,1v,1t,4i,44,4v,1b,r,s,3n,16,1o,16,1e,19,4w,8,4f,1g,5e,b,17,4b,f,1l,b,1b,c,10,24,20,1e,21,46,49,1f,33,v,6,1t,1q,1a,1d,1z,1e,1e,1w,1e,18,4j,1y,1y,4i,1a,1,1f,29,29,1n,18,2m,49,1p,33,19,1j,46,46,1v,40,40,4w,22,4k,2n,28,2n,2v,2g,2s,2z,2i,2e,2i,3z,2k,2g,2l,28,2k,2v,2z,25,2l,2k,2i,2a,30,31,3l,3e,3d,2e,3d,31,2r,37,25,37,3u,2p,2l,2i,2r,2g,2i,26,22,3c,3j,6o,3j,39,3r,3m,2r,2e,2e,4m,36,3v,2h,2w,3l,25,3v,36,36,32,2z,5g,3b,3d,4o,2d,3q,5g,31,37,3q,2k,49,4k,27,3x,4m,30,3v,2d,38,2d,2f,2f,37,30,2h,2b,4a,2k,3q,2j,1u,2y,2i,30,5h,4a,3v,32,2h,3u,2h,2f,34,19,2l,2g,3z,29,2t,38,3u,2b,33,2q,2p,1o,30,34,34,37,34,2z,2w,1u,34,2z,1w,v,3n,41,4j,36,2y,2j,4k,3g,2n,1v,49,1x,4a,26,2u,46,1j,f,1q,1e,2e,3w,43,2l,42,1v,4j,5,2a,2m,17,1x,34,2o,8,1l,4k,26,1x,3l,2a,3g,1o,4f,1x,4c,4g,5,r,r,1x,16,2o,1e,4k,1j,40,1o,47,1p,q,v,8,1n,1f,43,2o,1k,g,1t,4j,1y,4i,1i,5o,l,41,11,1n,f,1m,50,1l,4f,q,1o,44,18,l,1o,l,54,2u,7,44,4f,1i,a,41,24,24,1n,1n,8,4f,41,4w,50,l,5,9,h,h,n,47,4h,4c,1a,1h,1h,58,2,13,2,1y,19,r,3,6p,4r,6q,y,6r,6c,1e,4i,1y,6,4x,4h,4g,1n,g,1m,1h,l,45,13,33,1v,1e,50,4f,1g,u,4z,o,1n,e,1a,1f,1x,f,4b,i,1i,1q,4d,1,4w,47,1l,1d,1x,21,40,4j,k,z,44,4g,1j,1u,1n,1y,1i,23,1o,1f,18,1u,1s,3n,16,1t,1p,1a,2o,21,1k,18,24,2j,46,20,1r,4j,4h,1p,2u,3w,2u,34,2n,2m,23,2u,42,2u,2s,28,2q,22,4a,28,3u,2x,3u,2d,2u,2e,2v,2s,2a,2j,2n,49,33,33,21,2k,39,37,2x,2g,2h,2x,22,2b,2w,26,34,2h,32,3x,53,2d,3q,32,3q,3v,2k,2v,35,2g,30,37,2t,2j,3f,2a,2f,2s,2t,2z,37,2g,2i,30,35,2p,29,31,2r,36,31,3f,3m,2d,37,5f,3r,3b,2d,3m,2v,3c,39,4o,3s,3c,4l,2r,2y,3x,35,2k,2a,2g,1s,3o,1x,18,1x,33,2l,3v,3x,2i,37,32,25,5g,3e,2r,3v,2y,3q,2i,2f,3l,25,22,2u,28,2b,2t,1u,3u,2s,2s,2r,2t,2c,16,17,2t,2y,3d,2x,2z,3l,1s,g,3g,47,16,c,1r,1b,3w,3n,r,2k,2e,2i,26,1s,2c,2n,2q,39,31,2x,2a,2b,34,26,18,34,2u,26,4a,3z,1w,33,2q,3y,1f,47,l,4j,8,5o,1z,22,29,16,44,1n,26,1z,3n,27,46,v,10,4b,a,e,c,40,12,4i,5s,g,47,21,g,51,5y,1d,16,4a,2j,49,h,4v,4c,44,z,2j,2t,49,4k,35,2t,26,42,20,7,m,2t,3w,27,1z,2m,2o,1e,g,1v,40,24,1e,4g,44,4f,1x,1x,1w,33,1x,q,6,4v,5p,v,1w,g,41,4f,1i,l,2o,v,2o,3n,4j,1q,5,4i,4w,19,1r,17,1t,g,4c,47,4c,4f,61,k,3w,2u,1w,g,4f,47,1o,18,1n,f,47,1p,1r,1d,17,v,4f,50,6,8,1k,1k,1l,5,4w,4w,h,54,18,4w,49,43,1h,19,2o,2j,49,44,1k,1d,18,12,1y,8,4f,3o,1j,1w,7,1q,42,1y,20,1s,33,4j,1d,1p,43,4g,1q,1k,4w,1q,4h,g,50,1k,1d,2f,2k,2n,1d,18,f,1t,4k,3w,20,f,40,4g,23,1d,22,2c,1s,1v,4a,3y,3w,33,1s,26,3g,2p,2i,1z,4j,12,m,2j,2h,37,3g,2s,4a,2n,34,2f,2l,3z,23,2z,2y,2f,2h,2h,2h,2y,35,22,2y,2r,2b,4o,3f,2d,36,3u,3x,31,2y,35,37,2n,4m,35,2i,2z,3q,2h,2e,3f,3v,2i,3t,3q,2r,35,2z,4o,5g,3m,3b,3s,3b,4o,3v,2e,35,2j,3z,3n,2s,2d,2v,4a,2v,3b,31,3m,4m,3u,2e,2k,2n,2x,2h,3x,3f,3b,3t,2d,35,4a,1z,31,2e,26,2v,3x,3x,3j,3v,2a,3o,2z,34,2h,2g,3e,34,33,v,2b,25,2w,25,27,1j,46,2g,3u,22,1s,43,v,50,3o,3z,2j,20,2m,3w,1o,2i,2s,2j,2a,3z,2c,2c,4i,3o,4g,1v,2a,26,m,62,1x,2n,2j,3y,6,1g,4r,3g,2p,2r,2k,21,2b,39,2z,2w,17,5c,3z,1s,5d,13,6,30,2p,33,1,40,2p,3y,1u,1o,4f,5v,3y,46,33,6,h,4g,4c,4v,2w,2c,1r,3o,2c,19,27,49,1x,46,1z,4j,4k,3n,5,5o,4b,4g,7,4b,45,5r,4j,4j,1g,1q,21,4j,4v,18,2c,1w,4h,41,h,1h,5w,1e,1m,3,5u,47,4f,2,5p,1j,24,m,5e,4j,4h,z,54,21,12,4d,n,1i,d,6s,1e,6,y,6t,1q,1w,1p,4d,p,6u,1n,4g,41,62,1p,4f,4q,s,1y,17,v,12,1a,40,26,24,1t,1e,4h,50,1i,51,1a,1d,1o,1k,4i,1p,1n,19,1q,41,50,1p,19,q,51,1i,1b,l,r,42,33,1r,47,19,4w,6,8,4c,41,1q,1q,6,1y,1r,1l,1j,3w,24,1e,4f,13,4d,1i,4f,1b,1a,a,1s,1t,7,1o,4j,28,2c,21,24,24,16,42,33,1p,1t,g,6,4v,28,42,23,2l,2f,2t,7,1r,42,46,1k,7,1b,1n,24,17,22,46,33,2z,2g,26,29,1j,1v,46,3n,1d,2p,2c,28,3g,2t,2t,2n,23,3u,3u,37,2l,2t,2s,2l,26,49,20,1j,32,37,2q,2q,26,24,2i,3g,2z,37,35,3g,25,35,2f,3q,31,3j,4o,38,3b,38,4n,36,2r,2x,30,4o,39,2z,37,2x,29,25,36,37,2y,3c,3b,3q,2y,37,2k,2p,3z,42,46,2j,2t,3d,32,3q,39,2r,2i,37,2v,2c,2w,30,2h,2b,3l,2v,27,3w,32,3s,2k,42,2b,1t,28,1j,2y,2w,33,1f,2p,4o,31,2h,2w,29,21,2p,4k,42,49,1p,1w,1u,1u,49,3w,8,1w,4d,2j,19,r,40,1o,2y,1u,2w,2p,16,17,3n,3z,26,1v,4h,r,t,15,1s,51,1f,t,62,q,2f,3g,4f,2,2p,4a,k,6v,46,11,56,4k,21,4b,x,27,1u,1m,4u,c,x,7,1x,1u,43,1n,19,2c,16,40,2,4t,2a,2n,43,1a,5w,n,2g,2u,7,4w,12,3o,2a,2v,29,16,47,19,m,1n,1x,1j,4k,43,1i,28,3z,42,7,1y,5c,4g,3n,1t,4c,13,e,1i,1p,41,40,1e,18,4c,8,l,56,41,j,5x,16,1e,1y,1p,41,21,1r,1l,5e,67,4w,8,11,r,42,2o,18,8,s,1l,1p,t,62,4e,r,a,l,6,v,4j,1p,t,33,18,8,h,10,1a,w,4d,4d,1a,17,20,33,44,c,s,1p,1m,4g,t,8,q,4c,18,f,t,6,4h,40,1e,4i,41,15,18,21,1w,33,17,4g,5,4j,4f,4c,44,50,6,4b,1n,1m,1i,1i,50,1i,50,19,41,4b,k,20,g,43,1d,1k,1p,4j,1k,4c,q,4f,1v,18,23,3n,40,1x,43,q,3w,2c,4k,1z,23,2o,4g,1s,21,1f,19,f,51,46,1t,2n,46,12,21,27,42,3m,2k,2j,27,2q,2a,27,1j,2c,1s,2n,23,49,1x,1o,33,f,1p,42,1y,m,18,4j,1y,1p,33,28,3y,2n,2c,29,28,29,2a,3m,2g,3e,2x,2y,22,3g,2j,2t,30,25,2q,2v,2w,1z,4a,2z,2w,3q,2f,27,2t,29,4m,3x,2h,35,2x,3y,37,3u,2h,2r,3y,39,2f,2s,3c,3e,2v,2h,2t,4o,3d,31,36,36,2r,25,1z,2l,2a,28,2o,1w,1e,3l,3b,4m,2y,2l,3y,2z,3l,4k,3o,4n,3a,5g,30,2h,2x,30,3x,3q,2d,2e,2h,3e,2q,2l,3q,3v,2k,3q,30,2p,2o,2k,2d,32,39,3v,2f,2a,1v,1x,1x,3l,37,42,28,16,3o,2q,2g,2v,2z,27,2u,7,24,4a,27,43,1i,4z,3z,16,2m,1r,1,4g,4w,3g,1s,1t,q,4c,4v,2b,2f,3o,2y,2j,1d,2b,3g,3n,1q,4g,44,w,e,k,1j,4f,1,55,3w,1z,40,q,34,1v,1t,1d,21,4k,1u,1l,d,1v,4d,1n,4h,1p,5p,5a,k,61,5d,40,1y,49,1e,4c,1i,4v,u,2,h,l,8,5d,54,1r,1p,1k,42,3o,17,19,l,1x,4c,49,1e,q,l,l,17,4d,l,1x,18,1g,i,m,51,1i,4q,62,12,5,1i,1i,i,z,33,1n,t,64,4g,1g,13,l,1j,1y,8,4b,s,51,x,20,3w,1w,1j,19,f,4j,7,1k,1t,47,1y,41,a,1m,5,5d,k,5,1b,4d,1g,1h,4f,44,l,1p,1b,4b,v,18,6,4w,11,5r,17,1l,1b,41,c,1p,h,9,v,11,1m,3o,47,33,1v,f,4e,1a,4e,33,17,5d,19,1v,5,m,1x,4h,g,1x,4i,t,23,2j,1d,4h,21,1v,46,4k,3w,1j,2m,3n,1y,4q,1w,1b,2c,2f,2y,2b,2o,f,33,2p,2t,22,2a,28,2n,2m,2c,49,q,2j,3g,2t,3y,2m,34,1f,36,2g,22,35,2l,26,1s,18,2n,2r,2h,2y,3g,2s,2p,46,2c,25,37,3f,3x,3e,3v,4o,2l,28,1j,3o,31,2k,2z,3g,2w,25,35,25,32,5h,3r,5g,2h,2w,2p,2x,37,2z,2r,35,2z,38,2e,3s,4l,36,3f,3b,38,2e,3e,25,5h,30,3t,3k,4p,5h,3h,3t,3d,2h,2v,2r,2l,2j,26,3p,2e,32,2l,25,23,1t,3u,63,3c,3d,30,3m,3u,28,2j,2h,2y,2i,2y,2l,4k,4o,30,2p,23,4g,2z,2l,2k,2w,2b,2a,3g,2x,25,22,4a,2n,2e,2w,3l,1o,2t,2k,2q,2c,33,16,1x,1a,3z,35,2z,25,22,21,2h,3t,3m,3u,22,2v,3z,7,2c,4h,40,s,5r,58,4,2c,2m,40,1y,1q,4q,42,1o,4h,9,m,16,4i,11,1h,2m,4k,1v,1q,e,2j,23,1x,40,1r,6,1,42,1f,f,5d,43,34,1x,4g,1n,4h,5d,34,26,3n,1b,55,4u,6w,3o,47,50,4g,x,6l,1w,1d,v,10,5j,1f,2o,1k,1q,5,m,1m,62,k,o,49,1p,51,1a,47,4i,z,5e,5i,4b,2o,1w,40,17,11,49,42,16,4j,1q,1p,4j,7,3o,2u,2u,1w,4h,1p,6,62,5w,5p,4y,1z,21,1k,4c,2,6k,d,9,g,f,19,v,4j,4v,1i,1h,10,4w,4c,50,1e,18,19,v,1l,4i,5,l,1m,1g,58,1,44,7,50,r,1l,4b,9,4q,13,o,1a,4f,1a,4f,h,1,1,4d,1g,9,r,1i,54,4q,9,i,z,t,4w,g,4g,s,1w,46,29,3o,f,4b,1b,1p,4j,19,1e,4b,17,41,2,43,17,4v,p,3o,2o,19,4f,m,24,16,1x,v,44,1z,1j,43,17,1p,1r,27,46,1u,7,1t,f,v,4j,1m,4h,1y,1k,1x,1y,1o,24,1w,1d,4k,2o,43,f,1k,7,50,1j,1x,1v,1z,7,m,2n,28,2n,2i,3u,2q,2z,2y,37,2y,2l,4k,4k,3e,2k,2l,1f,4k,22,32,25,2p,2q,26,3o,27,2b,4a,2h,2g,2g,5g,5h,3r,4p,39,2r,2r,4o,3l,2d,3d,2r,3q,3e,4o,2x,37,1s,2a,5f,4o,31,2k,2q,24,1o,22,28,17,2e,3c,32,3l,2x,2h,3v,2i,2p,2j,5g,2d,3u,3f,31,2d,2x,27,43,25,2r,27,2t,27,29,1u,42,16,2h,2a,2e,32,4o,3l,38,2i,4a,2z,34,2n,29,2g,2w,2p,2b,29,1s,1z,24,1f,4a,2t,2m,1t,2u,2c,4k,2l,29,2q,2w,28,29,46,3o,2j,3o,2t,27,2i,29,g,18,24,3w,1l,s,4k,41,4s,2n,1f,3l,28,1y,1g,2t,50,16,1z,4b,2s,37,2n,47,5d,42,1j,33,h,1f,43,1d,1p,1a,4j,18,5c,h,1u,1r,17,48,9,1j,2o,16,4c,b,1r,4c,10,48,5e,16,4h,12,f,1a,18,50,e,4r,v,t,48,1p,g,w,12,18,4i,54,6k,6x,2c,4f,15,2m,1n,5o,4g,17,f,h,4b,u,1a,62,67,5n,4q,1a,47,1p,4i,m,1l,6,2,15,66,6y,9,56,4s,5,0,6z,10,19,5p,19,5,6g,6b,4g,12,1a,5p,5w,6z,6u,4f,8,1a,5v,5k,4u,4f,h,4x,70,6w,54,12,18,5d,j,71,1a,17,l,1l,c,i,1b,1w,f,4c,1m,4g,44,1p,g,1r,19,1w,20,17,1n,1n,4d,l,8,4w,v,43,8,1b,5d,1h,5p,17,7,4h,4b,h,4c,54,1r,49,f,1z,2c,3w,1w,40,1d,g,4v,2b,20,3w,3w,1d,1u,m,1o,1k,7,1k,1k,18,m,1n,4d,1t,2q,3y,1z,42,g,7,2a,2u,24,4h,2c,25,2j,2u,2u,2b,2c,26,3y,2m,34,3o,28,1j,1z,29,21,1u,26,4a,46,43,3l,2x,3f,3l,2g,2k,2k,2l,3u,2r,2k,2s,2s,2a,4a,25,2t,34,22,2l,37,22,2w,22,2z,2t,2a,37,2i,3v,3u,32,4m,5g,31,2r,3z,2t,3l,2k,3l,3e,2e,2h,3f,2i,29,2i,3u,22,1j,3u,3q,31,35,1z,3y,2b,1s,2g,2w,3z,m,2r,3l,3v,2x,3v,2w,2c,25,35,3y,47,4g,4k,4k,1w,18,23,24,32,36,5g,30,2l,46,2k,3e,2b,2b,2d,3u,2k,39,2h,2c,4q,24,2z,2s,46,2b,2a,2a,40,e,55,3u,1u,1t,2i,1e,g,22,47,2,6v,61,h,3o,19,8,1l,4w,1v,43,4j,7,q,29,1s,1p,5p,1v,50,51,18,2n,1v,1k,4j,1n,6,25,4a,34,33,1b,15,1j,1t,1h,62,6v,28,1z,q,15,37,3g,4f,26,4k,1v,43,7,40,1j,1o,f,4h,1e,40,4j,1d,1e,1k,q,k,k,4v,1l,8,8,4v,1,w,1b,1u,47,h,u,w,1r,q,h,h,58,6r,l,4s,c,15,69,6q,4j,1h,4r,6x,1o,f,6,e,3,6k,1b,h,k,1e,v,1g,6p,72,65,n,1p,1m,4e,5a,20,f,16,1n,t,p,o,62,5a,u,5p,z,r,e,51,10,a,1v,21,33,f,8,1m,4v,1h,5o,4q,5o,4u,r,11,6p,4q,n,r,e,1a,16,19,5,15,56,33,1x,47,n,4h,v,t,8,g,1n,4h,19,4g,4w,1a,5d,47,50,58,1m,48,73,e,5d,24,1e,1n,1g,5s,q,18,11,t,13,12,4z,5w,12,4i,1a,50,51,4v,74,19,r,67,56,4s,1d,2,16,43,44,47,40,16,g,1r,16,18,1s,2t,29,4k,1r,1k,6,11,21,1u,4i,m,f,v,31,2z,2w,4a,3y,2y,3y,2n,3y,3w,42,18,1z,28,4a,42,23,2c,1n,2z,35,36,3v,2g,2k,36,2a,3y,2j,3q,2f,2h,25,2j,2t,26,2h,3f,32,3q,2s,31,2s,22,3u,30,2f,3e,22,31,2w,30,3l,25,3y,4h,19,2h,2e,30,3l,2x,25,2i,31,2e,2f,1j,28,1s,1s,2f,2r,2w,43,20,2b,2n,49,1y,2a,1z,1s,2z,1w,2n,34,2y,2x,2b,2t,1u,1q,30,2c,21,4i,1z,2g,1v,31,3d,35,2f,3l,3l,2w,2h,3c,3s,4m,2e,2r,2o,3f,3e,2v,25,2t,1j,30,1j,2b,1x,i,2p,1n,4,3q,35,1r,10,2e,34,43,28,31,2f,2e,1u,t,2u,2z,49,33,5d,2x,3u,2w,2t,2u,1y,3l,2v,2p,2m,3n,1j,33,f,47,4v,r,28,7,44,28,1f,1z,1r,26,2o,g,4i,p,71,56,8,51,5o,7,4k,1z,1u,1e,1n,m,18,1x,3n,3n,24,1e,1i,r,f,33,4h,1x,1w,1k,34,3n,1o,4w,5r,9,1d,1o,m,8,1b,4b,1m,1o,19,k,l,z,0,1,q,4f,5o,1d,2c,1o,1q,4q,n,4s,j,55,5i,64,1c,9,11,6g,75,40,5,9,5w,8,1h,45,4f,1,5p,p,x,66,4b,1l,51,61,13,10,5w,o,5s,10,13,5v,6b,1p,11,4z,b,1g,4q,n,b,x,4g,54,69,50,4i,4d,9,54,4x,1,1r,4j,1t,1e,4i,50,5d,1m,r,c,s,s,2,62,76,4i,1i,m,5o,4b,56,4j,4c,18,f,1e,1k,m,8,50,4c,c,4z,1b,19,1e,4c,k,6,49,1v,33,v,40,7,c,50,4s,51,28,2c,21,m,24,43,7,4j,50,4j,19,41,1l,1k,1q,1m,s,3y,2o,1u,g,1y,m,44,24,28,1z,21,29,2n,2t,49,42,16,1o,20,43,43,24,43,43,1l,1e,1d,1p,8,16,3z,2s,4a,3u,46,2b,26,2z,5t,3x,2a,2z,37,49,1v,42,1v,7,2l,2w,3l,31,25,3u,3f,3c,38,3m,2k,2s,22,2t,4k,34,2h,2h,2j,28,4a,2w,27,4a,2n,2g,2r,2t,2t,3f,3v,2i,3z,2l,2j,2b,4a,1j,1w,33,3y,4a,2t,2t,3g,2m,36,39,2p,22,28,2k,2n,4a,49,29,3u,3b,5g,2f,35,4a,3y,18,2s,2u,30,29,23,28,2a,4g,2o,39,2x,1z,4n,3e,2g,1v,2u,40,8,3o,c,25,2a,2y,2r,3z,44,34,2j,6,e,3e,22,23,3w,f,2o,3n,34,2m,2c,4j,2b,1z,2a,1s,1y,r,55,2p,1d,21,24,35,2s,2h,2g,27,40,1y,21,5d,1k,c,29,1o,1n,4h,b,6d,4u,20,1o,12,1l,1m,4v,t,4z,33,49,l,5o,5o,2m,18,5c,6g,16,4v,u,20,33,2,5s,50,t,1d,1w,4d,3,77,47,4w,1,1k,1v,43,t,4x,6f,5n,l,50,48,76,1t,1d,41,1i,5c,1e,1q,67,78,10,77,1o,4g,4v,l,1,51,0,1c,5k,79,m,1m,6t,7a,q,1h,4s,4w,51,54,1n,17,4c,4b,r,e,1x,16,h,51,5c,5i,7b,6,5c,5u,s,4z,11,u,5n,7c,e,4r,1d,4w,50,20,1t,4i,1a,w,1l,5,q,q,1q,5d,62,51,33,f,1p,44,5d,c,45,8,g,44,z,6g,43,m,12,11,1t,24,21,16,1y,m,12,2p,2n,1v,40,4w,4z,74,v,1g,24,43,1e,49,1d,1n,4h,1l,4c,4j,4c,50,1q,1t,1d,46,4k,1v,3n,4w,4k,3w,4j,1b,z,m,21,2m,20,1k,4g,f,4v,q,4d,1u,18,4b,1f,2r,3v,2t,2l,2b,21,4j,4f,4w,37,2s,2m,2j,30,30,27,27,3g,1s,1n,2q,30,2g,2i,3v,2q,2z,2c,2k,3y,42,1j,3q,25,36,2g,25,4m,3v,22,2r,28,2h,4k,1z,2n,2u,2h,25,2t,3z,2y,4m,36,22,35,2g,2d,3d,32,2g,2c,7,2y,39,2y,2y,2x,3u,2f,2x,3e,37,36,5g,36,3d,4m,2y,2p,37,36,2s,2k,25,2g,2r,3v,2g,2w,2g,3v,2w,4a,34,49,32,3x,4l,37,4o,3x,2y,4a,42,4a,2a,2w,4a,29,3z,2i,35,3c,3q,2h,39,2y,2n,35,42,f,2o,2x,1n,15,1j,1j,4a,1f,33,4m,2i,28,1v,4g,29,49,12,4z,2p,24,17,t,6,1d,23,16,2i,2l,2p,2w,1v,1p,v,4b,1,58,2n,18,t,1e,g,6,1t,1i,33,41,24,50,4j,26,24,33,1e,8,4g,3u,3v,2p,3g,2n,1z,f,3y,3w,2o,m,2r,2t,4k,26,1s,21,4c,0,z,19,r,67,24,1d,1m,b,4w,4e,l,21,4b,u,5a,7d,7d,1p,4d,7,1l,62,4f,5c,2,1x,g,8,21,17,g,1o,44,1,4,b,49,1o,1e,4b,1k,4i,3w,l,51,5d,24,1t,1d,1w,20,44,10,5d,1e,3w,21,g,4f,1h,w,z,j,1l,1q,4i,1,1o,33,4v,5v,5c,56,5i,5k,17,16,1e,6,1k,1m,18,m,h,l,4i,1m,1o,1r,17,50,4r,24,1t,7,8,g,4i,4f,l,5,l,1f,24,m,q,1r,50,4u,40,2o,l,1w,20,4g,4s,z,m,6,1l,5e,2j,2o,24,1t,1w,1n,21,49,3w,47,z,6,43,4w,4j,f,1j,1x,f,q,4w,1i,41,8,19,4h,1i,1o,2v,2j,21,4b,12,49,2n,23,1d,40,26,2n,24,24,46,21,40,1j,1w,1w,40,1e,4j,2z,26,3w,1f,v,2u,1k,20,46,20,2t,2i,2y,2t,2j,4k,1s,2k,27,27,3y,1f,2c,4a,2h,32,3v,2a,2t,46,38,3z,2e,2t,2b,2a,3c,7e,32,35,25,2k,2h,2z,2f,35,3j,4m,2r,37,2j,3o,2b,22,2s,3u,2e,2i,2v,2p,2t,3m,3u,36,3q,2e,3c,3c,3q,2f,4a,30,46,2q,4l,2z,4m,36,3c,3v,2f,37,3p,2b,42,g,2i,37,2u,4h,2s,4k,3x,2w,34,2q,36,25,21,19,1s,3y,2b,29,1f,2z,2q,2c,33,16,4w,41,4p,2x,37,2w,2g,35,2q,2o,1r,1j,33,1d,2t,2a,1j,3w,4v,1y,51,5c,2r,4o,3e,31,1v,1i,1k,6,2e,2z,4c,k,46,4m,2a,1w,1f,1x,40,1d,4h,4b,24,1r,4u,3n,1l,11,2e,2x,3o,1d,1z,24,23,4i,g,23,1v,18,t,2u,20,3n,4g,w,y,27,2c,40,g,47,43,43,4h,m,1o,16,21,2b,42,2m,20,1n,2b,1u,f,1i,2o,4a,42,1e,4i,4g,2b,2a,34,1f,20,m,1m,k,1j,46,19,k,2m,40,2j,2c,49,21,47,4e,4j,t,d,66,9,1g,41,12,4v,2,6,1k,1f,1d,50,5d,1b,51,h,4b,1q,4v,1b,a,4b,51,1g,1b,4w,t,a,1a,0,f,1o,f,1p,12,1r,19,8,1l,k,51,r,z,z,66,20,43,7,1y,g,1e,4h,48,0,4g,17,1p,5d,1g,1i,j,51,1p,10,5e,19,6,4v,12,1w,8,6,7,21,1y,4c,h,4i,4f,7,1n,20,1o,v,47,f,q,4j,5d,4d,7,1p,1y,1i,f,3o,1n,1v,40,g,1o,40,1f,4a,2o,44,4b,4g,3z,1j,1r,7,12,c,1u,2u,1t,12,7,1k,4w,1b,17,20,1u,1j,40,3n,3o,2m,4h,4b,1s,1j,1v,1t,g,1v,3g,2p,26,2p,1v,4k,49,3w,8,4i,1o,29,29,25,2e,2m,34,2g,2q,2j,1z,3o,34,2y,36,2e,3a,3e,3x,3v,2i,3q,4m,38,3m,3v,3u,31,3e,2x,2w,2c,3g,25,2v,2z,4k,2f,3g,28,2c,28,31,3q,35,2g,3s,2f,2x,25,3l,2x,2a,38,30,30,4m,3v,3x,3d,3q,5g,2u,3c,3i,39,39,2s,37,2s,2l,25,2y,27,36,31,2y,26,2w,43,1j,1u,4a,2h,3u,3m,2e,2i,2a,35,2f,2l,2s,4a,42,27,26,2l,2o,3w,2i,2a,2h,35,3z,29,47,26,2n,2i,3q,2g,2i,32,2z,34,34,20,42,34,3u,35,2z,17,1v,20,24,2u,49,2b,2l,46,3o,2q,1v,1f,2a,2f,2k,37,28,43,2y,1s,1t,1p,3u,2k,27,2n,1s,4h,3w,1f,27,1j,12,21,1t,4h,1w,40,6,1h,6,47,4g,4i,4e,40,3g,23,29,1u,18,1t,1e,7,40,4h,1q,4w,t,1w,4k,2w,29,q,4f,1k,33,1h,8,q,4g,c,24,1d,1j,2o,1u,33,8,2,4g,z,34,26,1n,n,4q,q,1n,20,3y,28,26,34,1z,1f,1y,1,54,5,1,1h,1h,18,4i,8,1m,k,11,4w,1j,2m,16,1d,50,m,q,6,h,44,1,1i,h,5e,3n,21,12,1w,19,4d,5d,5p,5d,4z,54,2,k,1l,9,5o,4v,4v,t,5d,4c,4h,i,o,1l,f,f,44,i,r,4x,h,4e,e,1r,17,8,4v,4z,1l,5,4d,6,6,1l,e,7f,y,5c,11,4b,0,44,4j,4h,1h,67,62,5o,61,18,1k,4h,m,1p,12,8,1m,1a,1h,47,g,3y,1f,1t,4h,1r,1d,19,18,49,2n,1j,16,49,29,4i,6,1f,1d,f,4k,1f,1w,43,1t,f,40,47,6,2w,2b,28,1u,7,28,24,1s,3q,2x,4a,3z,2c,1v,29,27,4k,3w,2x,31,2s,3g,2w,2t,2j,4k,1t,2x,2y,2g,1z,3o,1u,1w,42,16,3y,28,2b,46,2a,2n,25,2z,2n,2u,2v,2s,2t,3g,26,2r,3q,30,3l,2l,3g,4k,2b,2q,7g,4m,25,2a,2q,2a,4m,23,2g,35,2t,2l,3y,28,3z,2m,16,f,2s,2j,3w,3e,2l,2l,30,2g,37,2l,3z,4k,1k,7,q,16,1j,34,2o,24,4k,2y,2e,2q,46,18,27,49,2s,2x,32,2e,2m,2y,2a,1f,42,4j,3g,27,29,3z,2u,23,1v,41,2l,2s,2i,2p,2n,12,3w,1y,26,26,2p,28,42,33,v,11,5j,j,56,6d,65,1t,2a,34,46,m,2o,1o,1v,k,1g,77,a,57,z,1w,1u,2l,1j,19,20,m,5r,19,9,19,5d,4a,1j,1r,v,q,9,k,5c,1d,2k,2z,24,k,6c,5e,1s,16,33,3w,34,1j,47,q,h,m,1a,g,18,8,17,m,3o,1t,1q,41,4j,4h,17,g,1l,a,4g,7,50,c,1m,4g,12,q,2,4w,t,4y,7h,4b,1g,c,56,7i,u,5a,4w,n,58,1f,20,1d,1k,g,50,1i,1l,4q,q,m,1k,4f,4b,s,h,47,50,4b,51,50,s,c,s,5e,4f,1r,m,4e,10,5d,1h,66,1y,8,5i,65,6j,m,4b,w,4b,4f,1g,4q,1h,j,5a,v,1e,4j,19,4h,4c,t,p,2,19,4d,4e,r,4j,1e,8,15,57,43,4f,1i,1l,54,14,t,4i,48,1e,1q,e,1i,51,i,r,4q,4,51,3,47,1n,1o,4h,5d,4w,3w,33,17,1q,51,50,12,47,1p,k,1b,z,1m,1t,23,16,4d,6,16,3n,42,3w,40,16,f,17,16,1v,40,2u,2p,29,1v,17,50,2c,3z,23,1t,4f,2a,2a,2p,2g,2w,4a,23,26,26,3y,46,35,2n,29,1v,1v,1z,21,39,2k,2q,2a,2w,2j,2b,4a,29,3y,34,1z,1o,2u,2i,3l,3l,2i,5g,3e,22,3z,22,2g,3v,2g,2d,3r,3p,39,32,30,4o,39,3u,3r,3d,2e,2z,2m,25,2g,3y,3j,3b,3d,3m,2i,30,3e,3u,2y,27,2q,37,2i,3l,36,4l,3c,2q,37,2e,32,2x,2q,2w,3y,7,4k,2f,3p,3t,4m,39,3x,36,2v,32,31,2g,2y,2q,3z,2q,2z,3g,2p,2g,2v,42,4k,2e,2h,3n,v,42,46,h,g,21,1d,t,7,54,17,4b,41,2z,3n,1h,4z,4i,2c,q,23,1k,4k,2v,7,3v,2j,1f,50,1h,4g,1n,6,r,m,62,3l,37,2t,1s,3y,23,2j,3z,20,44,1h,e,2x,2p,1o,1r,2q,49,4i,2a,2t,43,8,1o,3o,29,40,11,42,16,34,1q,50,1t,50,k,1v,4c,58,1w,1k,5n,5x,10,50,6,1x,1d,4j,3w,1f,v,1a,4b,1j,1e,4h,6,9,1,4q,6c,6w,4s,1e,k,r,13,5w,f,4v,5v,y,1,1o,47,41,w,62,5d,11,61,5a,20,17,1b,54,11,a,g,s,51,7j,5,w,4b,1h,5o,1k,6,s,4s,58,3n,1u,18,4g,4i,44,4q,i,n,24,1e,4i,1v,1d,k,56,1r,1n,4i,s,6v,5k,f,g,f,41,h,10,5p,5w,z,4z,4e,1b,1n,6,l,4d,w,4c,1f,1x,4f,50,43,1n,5,4q,4d,19,k,w,o,4z,1a,4h,m,1l,4w,v,q,k,44,8,50,1i,a,4r,6n,1j,4h,l,5c,5d,19,4h,4i,g,1m,4c,1q,1d,17,1o,20,43,50,47,v,50,1l,24,1o,1p,c,4g,1l,c,43,1x,33,4j,r,w,4b,1u,47,1r,40,1k,49,1f,1f","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-acdba42e","guard":[["not",["hasAny",["20200202","20200406","20200417","20200419","20200421","20200427","20200522","20200527","20200603","20200719","20200730","20200731","20200902","20200913","20200926","20201007","20201008","20201023","20201119","20201122","20201124","20201203","20201231","20210102","20210117","20210209","20210214","20210304","20210314","20210415","20210416","20210502","20210511","20210530","20210607","20210719","20210802","20210806","20210820","20210829","20210909","20211024","20211025","20211026","20211118","20211121","20211130","20211211","20220106","20220110","20220131","20220207","20220209","20220210","20220216","20220302","20220305","20220311","20220407","add","angeles","china","close","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","makes","min","national","open","phoenix","price","rate","recovered","smaller","sp500","sum"]]]],"pyramid":["render.template",{"lit":["The max temp c of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger max temp c."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-ba47d2fd","guard":[["hasAny",["bigger than","c","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","compare"],["has","max"]],"pyramid":["render.template",{"lit":["The max temp c of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger max temp c."]},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-dabbdd6d","guard":[["has","c"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2016-09-28 and 2016-05-21":"The max temp c of 2016-09-28 is 18 and that of 2016-05-21 is 19.8, so 2016-05-21 has the larger max temp c.","how does the max temp c of 2006-05-29 compare with that of 2000-06-10":"The max temp c of 2006-05-29 is 15.8 and that of 2000-06-10 is 15.6, so 2006-05-29 has the larger max temp c.","2013-06-12 versus 2016-06-08: compare their max temp c":"The max temp c of 2013-06-12 is 16.8 and that of 2016-06-08 is 17.6, so 2016-06-08 has the larger max temp c.","how does the max temp c of 2014-05-16 compare with that of 2018-08-14":"The max temp c of 2014-05-16 is 21.4 and that of 2018-08-14 is 21.1, so 2014-05-16 has the larger max temp c.","2001-07-14 versus 2023-10-08: compare their max temp c":"The max temp c of 2001-07-14 is 18 and that of 2023-10-08 is 20.7, so 2023-10-08 has the larger max temp c.","compare the max temp c of 2000-01-06 and 1993-03-04":"The max temp c of 2000-01-06 is 21.6 and that of 1993-03-04 is 20.1, so 2000-01-06 has the larger max temp c.","compare the max temp c of 2022-11-21 and 2006-05-29":"The max temp c of 2022-11-21 is 22.5 and that of 2006-05-29 is 15.8, so 2022-11-21 has the larger max temp c.","compare the max temp c of 2016-07-20 and 2010-10-23":"The max temp c of 2016-07-20 is 17.3 and that of 2010-10-23 is 25.5, so 2010-10-23 has the larger max temp c.","2016-11-05 versus 2016-09-28: compare their max temp c":"The max temp c of 2016-11-05 is 23 and that of 2016-09-28 is 18, so 2016-11-05 has the larger max temp c.","how does the max temp c of 2007-05-07 compare with that of 2013-06-12":"The max temp c of 2007-05-07 is 21.5 and that of 2013-06-12 is 16.8, so 2007-05-07 has the larger max temp c.","1992-03-29 versus 2007-06-03: compare their max temp c":"The max temp c of 1992-03-29 is 21.9 and that of 2007-06-03 is 18.1, so 1992-03-29 has the larger max temp c.","1998-09-10 versus 1999-09-03: compare their max temp c":"The max temp c of 1998-09-10 is 19.1 and that of 1999-09-03 is 18.8, so 1998-09-10 has the larger max temp c.","2003-08-12 versus 2007-08-19: compare their max temp c":"The max temp c of 2003-08-12 is 17.9 and that of 2007-08-19 is 14.3, so 2003-08-12 has the larger max temp c.","compare the max temp c of 2014-02-02 and 2017-06-26":"The max temp c of 2014-02-02 is 26.2 and that of 2017-06-26 is 16.4, so 2014-02-02 has the larger max temp c.","how does the max temp c of 1993-03-04 compare with that of 2001-01-13":"The max temp c of 1993-03-04 is 20.1 and that of 2001-01-13 is 25.1, so 2001-01-13 has the larger max temp c.","compare the max temp c of 1997-11-27 and 2014-04-28":"The max temp c of 1997-11-27 is 33.5 and that of 2014-04-28 is 19.7, so 1997-11-27 has the larger max temp c.","how does the max temp c of 2016-05-21 compare with that of 2019-11-25":"The max temp c of 2016-05-21 is 19.8 and that of 2019-11-25 is 30.8, so 2019-11-25 has the larger max temp c.","compare the max temp c of 2023-10-08 and 2024-09-11":"The max temp c of 2023-10-08 is 20.7 and that of 2024-09-11 is 22.5, so 2024-09-11 has the larger max temp c.","how does the max temp c of 2023-02-15 compare with that of 1999-06-21":"The max temp c of 2023-02-15 is 24.8 and that of 1999-06-21 is 17.4, so 2023-02-15 has the larger max temp c.","compare the max temp c of 2007-06-03 and 2003-08-06":"The max temp c of 2007-06-03 is 18.1 and that of 2003-08-06 is 17.6, so 2007-06-03 has the larger max temp c.","how does the max temp c of 2001-06-28 compare with that of 2014-11-03":"The max temp c of 2001-06-28 is 17.4 and that of 2014-11-03 is 19.8, so 2014-11-03 has the larger max temp c.","compare the max temp c of 1993-10-14 and 2002-12-13":"The max temp c of 1993-10-14 is 20.2 and that of 2002-12-13 is 26.9, so 2002-12-13 has the larger max temp c.","how does the max temp c of 2017-06-26 compare with that of 2019-11-22":"The max temp c of 2017-06-26 is 16.4 and that of 2019-11-22 is 22.1, so 2019-11-22 has the larger max temp c.","how does the max temp c of 2017-01-11 compare with that of 2006-07-15":"The max temp c of 2017-01-11 is 37.1 and that of 2006-07-15 is 14.8, so 2017-01-11 has the larger max temp c.","compare the max temp c of 2007-04-24 and 2014-05-16":"The max temp c of 2007-04-24 is 17.1 and that of 2014-05-16 is 21.4, so 2014-05-16 has the larger max temp c.","how does the max temp c of 2005-06-19 compare with that of 2017-06-24":"The max temp c of 2005-06-19 is 16.4 and that of 2017-06-24 is 17.5, so 2017-06-24 has the larger max temp c.","how does the max temp c of 2000-01-30 compare with that of 2008-02-24":"The max temp c of 2000-01-30 is 21.2 and that of 2008-02-24 is 24.4, so 2008-02-24 has the larger max temp c.","2002-07-31 versus 1991-10-20: compare their max temp c":"The max temp c of 2002-07-31 is 17.4 and that of 1991-10-20 is 24.8, so 1991-10-20 has the larger max temp c.","compare the max temp c of 1991-10-20 and 2023-11-22":"The max temp c of 1991-10-20 is 24.8 and that of 2023-11-22 is 23.5, so 1991-10-20 has the larger max temp c.","2002-10-07 versus 2001-09-07: compare their max temp c":"The max temp c of 2002-10-07 is 25.6 and that of 2001-09-07 is 19.2, so 2002-10-07 has the larger max temp c.","2000-06-10 versus 2018-01-02: compare their max temp c":"The max temp c of 2000-06-10 is 15.6 and that of 2018-01-02 is 25.9, so 2018-01-02 has the larger max temp c.","2018-11-05 versus 2002-10-02: compare their max temp c":"The max temp c of 2018-11-05 is 27 and that of 2002-10-02 is 23.4, so 2018-11-05 has the larger max temp c.","compare the max temp c of 2017-02-23 and 2000-01-30":"The max temp c of 2017-02-23 is 27.7 and that of 2000-01-30 is 21.2, so 2017-02-23 has the larger max temp c.","2001-01-13 versus 1999-08-21: compare their max temp c":"The max temp c of 2001-01-13 is 25.1 and that of 1999-08-21 is 15.3, so 2001-01-13 has the larger max temp c.","compare the max temp c of 1992-06-28 and 2007-04-12":"The max temp c of 1992-06-28 is 15.2 and that of 2007-04-12 is 21.3, so 2007-04-12 has the larger max temp c.","how does the max temp c of 2020-10-03 compare with that of 2018-11-05":"The max temp c of 2020-10-03 is 25.6 and that of 2018-11-05 is 27, so 2018-11-05 has the larger max temp c.","2006-07-03 versus 1993-10-14: compare their max temp c":"The max temp c of 2006-07-03 is 14.1 and that of 1993-10-14 is 20.2, so 1993-10-14 has the larger max temp c.","2017-07-03 versus 1998-01-12: compare their max temp c":"The max temp c of 2017-07-03 is 15.7 and that of 1998-01-12 is 26.7, so 1998-01-12 has the larger max temp c.","how does the max temp c of 2019-06-14 compare with that of 1992-03-29":"The max temp c of 2019-06-14 is 17.6 and that of 1992-03-29 is 21.9, so 1992-03-29 has the larger max temp c.","2014-11-03 versus 2000-01-06: compare their max temp c":"The max temp c of 2014-11-03 is 19.8 and that of 2000-01-06 is 21.6, so 2000-01-06 has the larger max temp c.","how does the max temp c of 2007-04-12 compare with that of 2012-01-26":"The max temp c of 2007-04-12 is 21.3 and that of 2012-01-26 is 24.5, so 2012-01-26 has the larger max temp c.","compare the max temp c of 1999-04-29 and 1998-03-12":"The max temp c of 1999-04-29 is 16.8 and that of 1998-03-12 is 26.5, so 1998-03-12 has the larger max temp c.","compare the max temp c of 1991-12-01 and 2019-06-14":"The max temp c of 1991-12-01 is 19.8 and that of 2019-06-14 is 17.6, so 1991-12-01 has the larger max temp c.","how does the max temp c of 1991-03-10 compare with that of 2001-07-14":"The max temp c of 1991-03-10 is 22.7 and that of 2001-07-14 is 18, so 1991-03-10 has the larger max temp c.","compare the max temp c of 2009-08-29 and 1997-03-02":"The max temp c of 2009-08-29 is 25.2 and that of 1997-03-02 is 25.5, so 1997-03-02 has the larger max temp c.","how does the max temp c of 2007-01-11 compare with that of 2002-07-31":"The max temp c of 2007-01-11 is 28.2 and that of 2002-07-31 is 17.4, so 2007-01-11 has the larger max temp c.","compare the max temp c of 2003-08-31 and 1991-06-06":"The max temp c of 2003-08-31 is 17.3 and that of 1991-06-06 is 18, so 1991-06-06 has the larger max temp c.","1999-06-21 versus 1997-10-02: compare their max temp c":"The max temp c of 1999-06-21 is 17.4 and that of 1997-10-02 is 27.7, so 1997-10-02 has the larger max temp c.","compare the max temp c of 1999-08-21 and 2007-05-07":"The max temp c of 1999-08-21 is 15.3 and that of 2007-05-07 is 21.5, so 2007-05-07 has the larger max temp c.","compare the max temp c of 2007-08-19 and 2023-02-15":"The max temp c of 2007-08-19 is 14.3 and that of 2023-02-15 is 24.8, so 2023-02-15 has the larger max temp c.","2017-06-24 versus 2013-07-30: compare their max temp c":"The max temp c of 2017-06-24 is 17.5 and that of 2013-07-30 is 17.7, so 2013-07-30 has the larger max temp c.","2018-08-14 versus 2004-07-28: compare their max temp c":"The max temp c of 2018-08-14 is 21.1 and that of 2004-07-28 is 16.6, so 2018-08-14 has the larger max temp c.","how does the max temp c of 2023-11-22 compare with that of 2002-10-07":"The max temp c of 2023-11-22 is 23.5 and that of 2002-10-07 is 25.6, so 2002-10-07 has the larger max temp c.","how does the max temp c of 2005-06-09 compare with that of 2020-09-04":"The max temp c of 2005-06-09 is 20.4 and that of 2020-09-04 is 20.7, so 2020-09-04 has the larger max temp c.","compare the max temp c of 2003-01-01 and 2005-08-16":"The max temp c of 2003-01-01 is 23.8 and that of 2005-08-16 is 16.1, so 2003-01-01 has the larger max temp c.","2009-07-29 versus 1991-12-01: compare their max temp c":"The max temp c of 2009-07-29 is 17.6 and that of 1991-12-01 is 19.8, so 1991-12-01 has the larger max temp c.","1993-10-19 versus 1995-01-09: compare their max temp c":"The max temp c of 1993-10-19 is 21.7 and that of 1995-01-09 is 22.3, so 1995-01-09 has the larger max temp c.","how does the max temp c of 2020-08-01 compare with that of 2024-07-10":"The max temp c of 2020-08-01 is 17.7 and that of 2024-07-10 is 17.4, so 2020-08-01 has the larger max temp c.","compare the max temp c of 1999-09-03 and 2020-10-03":"The max temp c of 1999-09-03 is 18.8 and that of 2020-10-03 is 25.6, so 2020-10-03 has the larger max temp c.","compare the max temp c of 1998-01-12 and 1997-05-22":"The max temp c of 1998-01-12 is 26.7 and that of 1997-05-22 is 17.2, so 1998-01-12 has the larger max temp c.","compare the max temp c of 1997-10-02 and 2003-12-12":"The max temp c of 1997-10-02 is 27.7 and that of 2003-12-12 is 25.7, so 1997-10-02 has the larger max temp c.","compare the max temp c of 2004-07-28 and 1991-03-10":"The max temp c of 2004-07-28 is 16.6 and that of 1991-03-10 is 22.7, so 1991-03-10 has the larger max temp c.","how does the max temp c of 2010-10-23 compare with that of 1993-10-19":"The max temp c of 2010-10-23 is 25.5 and that of 1993-10-19 is 21.7, so 2010-10-23 has the larger max temp c.","compare the max temp c of 2013-07-30 and 2019-06-20":"The max temp c of 2013-07-30 is 17.7 and that of 2019-06-20 is 14.1, so 2013-07-30 has the larger max temp c.","1995-12-17 versus 2007-04-24: compare their max temp c":"The max temp c of 1995-12-17 is 22.6 and that of 2007-04-24 is 17.1, so 1995-12-17 has the larger max temp c.","how does the max temp c of 1997-03-02 compare with that of 2006-07-03":"The max temp c of 1997-03-02 is 25.5 and that of 2006-07-03 is 14.1, so 1997-03-02 has the larger max temp c.","compare the max temp c of 2001-09-07 and 2017-02-01":"The max temp c of 2001-09-07 is 19.2 and that of 2017-02-01 is 25.3, so 2017-02-01 has the larger max temp c.","how does the max temp c of 2010-03-12 compare with that of 2016-11-05":"The max temp c of 2010-03-12 is 21.9 and that of 2016-11-05 is 23, so 2016-11-05 has the larger max temp c.","compare the max temp c of 1995-01-09 and 2005-06-19":"The max temp c of 1995-01-09 is 22.3 and that of 2005-06-19 is 16.4, so 1995-01-09 has the larger max temp c.","1999-03-23 versus 2015-09-03: compare their max temp c":"The max temp c of 1999-03-23 is 20.5 and that of 2015-09-03 is 19, so 1999-03-23 has the larger max temp c.","2008-02-24 versus 2014-06-21: compare their max temp c":"The max temp c of 2008-02-24 is 24.4 and that of 2014-06-21 is 17.9, so 2008-02-24 has the larger max temp c.","compare the max temp c of 2018-01-02 and 1993-10-02":"The max temp c of 2018-01-02 is 25.9 and that of 1993-10-02 is 18.9, so 2018-01-02 has the larger max temp c.","how does the max temp c of 2005-08-16 compare with that of 1995-12-17":"The max temp c of 2005-08-16 is 16.1 and that of 1995-12-17 is 22.6, so 1995-12-17 has the larger max temp c.","compare the max temp c of 2016-06-08 and 2020-08-01":"The max temp c of 2016-06-08 is 17.6 and that of 2020-08-01 is 17.7, so 2020-08-01 has the larger max temp c.","how does the max temp c of 2002-12-13 compare with that of 2003-08-12":"The max temp c of 2002-12-13 is 26.9 and that of 2003-08-12 is 17.9, so 2002-12-13 has the larger max temp c.","1996-11-29 versus 2014-02-02: compare their max temp c":"The max temp c of 1996-11-29 is 25.3 and that of 2014-02-02 is 26.2, so 2014-02-02 has the larger max temp c.","2024-07-10 versus 1999-04-29: compare their max temp c":"The max temp c of 2024-07-10 is 17.4 and that of 1999-04-29 is 16.8, so 2024-07-10 has the larger max temp c.","2019-11-25 versus 2003-08-31: compare their max temp c":"The max temp c of 2019-11-25 is 30.8 and that of 2003-08-31 is 17.3, so 2019-11-25 has the larger max temp c.","compare the max temp c of 2002-10-02 and 2005-06-09":"The max temp c of 2002-10-02 is 23.4 and that of 2005-06-09 is 20.4, so 2002-10-02 has the larger max temp c.","how does the max temp c of 2024-09-11 compare with that of 1996-11-29":"The max temp c of 2024-09-11 is 22.5 and that of 1996-11-29 is 25.3, so 1996-11-29 has the larger max temp c.","1992-04-24 versus 1997-11-27: compare their max temp c":"The max temp c of 1992-04-24 is 16.8 and that of 1997-11-27 is 33.5, so 1997-11-27 has the larger max temp c.","2010-08-08 versus 2009-08-29: compare their max temp c":"The max temp c of 2010-08-08 is 14.7 and that of 2009-08-29 is 25.2, so 2009-08-29 has the larger max temp c.","2020-09-04 versus 2015-12-16: compare their max temp c":"The max temp c of 2020-09-04 is 20.7 and that of 2015-12-16 is 22.9, so 2015-12-16 has the larger max temp c.","compare the max temp c of 1997-01-07 and 2010-03-12":"The max temp c of 1997-01-07 is 21.4 and that of 2010-03-12 is 21.9, so 2010-03-12 has the larger max temp c.","how does the max temp c of 2003-12-12 compare with that of 1998-09-10":"The max temp c of 2003-12-12 is 25.7 and that of 1998-09-10 is 19.1, so 2003-12-12 has the larger max temp c.","2005-06-16 versus 2022-11-21: compare their max temp c":"The max temp c of 2005-06-16 is 18.1 and that of 2022-11-21 is 22.5, so 2022-11-21 has the larger max temp c.","2006-07-15 versus 1992-06-28: compare their max temp c":"The max temp c of 2006-07-15 is 14.8 and that of 1992-06-28 is 15.2, so 1992-06-28 has the larger max temp c.","2022-02-27 versus 2003-01-01: compare their max temp c":"The max temp c of 2022-02-27 is 24.3 and that of 2003-01-01 is 23.8, so 2022-02-27 has the larger max temp c.","compare the max temp c of 2014-06-21 and 2017-01-11":"The max temp c of 2014-06-21 is 17.9 and that of 2017-01-11 is 37.1, so 2017-01-11 has the larger max temp c.","how does the max temp c of 1997-05-22 compare with that of 2010-08-08":"The max temp c of 1997-05-22 is 17.2 and that of 2010-08-08 is 14.7, so 1997-05-22 has the larger max temp c.","2012-01-26 versus 1997-01-07: compare their max temp c":"The max temp c of 2012-01-26 is 24.5 and that of 1997-01-07 is 21.4, so 2012-01-26 has the larger max temp c.","compare the max temp c of 2015-09-03 and 2007-01-11":"The max temp c of 2015-09-03 is 19 and that of 2007-01-11 is 28.2, so 2007-01-11 has the larger max temp c.","how does the max temp c of 1993-10-02 compare with that of 1999-03-23":"The max temp c of 1993-10-02 is 18.9 and that of 1999-03-23 is 20.5, so 1999-03-23 has the larger max temp c.","how does the max temp c of 1991-06-06 compare with that of 2009-07-29":"The max temp c of 1991-06-06 is 18 and that of 2009-07-29 is 17.6, so 1991-06-06 has the larger max temp c.","how does the max temp c of 1998-03-12 compare with that of 2022-02-27":"The max temp c of 1998-03-12 is 26.5 and that of 2022-02-27 is 24.3, so 1998-03-12 has the larger max temp c.","how does the max temp c of 2017-02-01 compare with that of 1992-04-24":"The max temp c of 2017-02-01 is 25.3 and that of 1992-04-24 is 16.8, so 2017-02-01 has the larger max temp c.","compare the max temp c of 2015-12-16 and 2001-06-28":"The max temp c of 2015-12-16 is 22.9 and that of 2001-06-28 is 17.4, so 2015-12-16 has the larger max temp c.","2019-11-22 versus 2016-07-20: compare their max temp c":"The max temp c of 2019-11-22 is 22.1 and that of 2016-07-20 is 17.3, so 2019-11-22 has the larger max temp c.","how does the max temp c of 2014-04-28 compare with that of 2017-07-03":"The max temp c of 2014-04-28 is 19.7 and that of 2017-07-03 is 15.7, so 2014-04-28 has the larger max temp c.","how does the max temp c of 2003-08-06 compare with that of 2005-06-16":"The max temp c of 2003-08-06 is 17.6 and that of 2005-06-16 is 18.1, so 2005-06-16 has the larger max temp c."}}},
{"id":"n-3a936a81","guard":[["has","c"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"2016-09-28 and 2016-05-21":"The max temp c of 2016-09-28 is 18 and that of 2016-05-21 is 19.8, so 2016-05-21 has the larger max temp c.","2006-05-29 compare with that of 2000-06-10":"The max temp c of 2006-05-29 is 15.8 and that of 2000-06-10 is 15.6, so 2006-05-29 has the larger max temp c.","2014-05-16 compare with that of 2018-08-14":"The max temp c of 2014-05-16 is 21.4 and that of 2018-08-14 is 21.1, so 2014-05-16 has the larger max temp c.","2000-01-06 and 1993-03-04":"The max temp c of 2000-01-06 is 21.6 and that of 1993-03-04 is 20.1, so 2000-01-06 has the larger max temp c.","2022-11-21 and 2006-05-29":"The max temp c of 2022-11-21 is 22.5 and that of 2006-05-29 is 15.8, so 2022-11-21 has the larger max temp c.","2016-07-20 and 2010-10-23":"The max temp c of 2016-07-20 is 17.3 and that of 2010-10-23 is 25.5, so 2010-10-23 has the larger max temp c.","2007-05-07 compare with that of 2013-06-12":"The max temp c of 2007-05-07 is 21.5 and that of 2013-06-12 is 16.8, so 2007-05-07 has the larger max temp c.","2014-02-02 and 2017-06-26":"The max temp c of 2014-02-02 is 26.2 and that of 2017-06-26 is 16.4, so 2014-02-02 has the larger max temp c.","1993-03-04 compare with that of 2001-01-13":"The max temp c of 1993-03-04 is 20.1 and that of 2001-01-13 is 25.1, so 2001-01-13 has the larger max temp c.","1997-11-27 and 2014-04-28":"The max temp c of 1997-11-27 is 33.5 and that of 2014-04-28 is 19.7, so 1997-11-27 has the larger max temp c.","2016-05-21 compare with that of 2019-11-25":"The max temp c of 2016-05-21 is 19.8 and that of 2019-11-25 is 30.8, so 2019-11-25 has the larger max temp c.","2023-10-08 and 2024-09-11":"The max temp c of 2023-10-08 is 20.7 and that of 2024-09-11 is 22.5, so 2024-09-11 has the larger max temp c.","2023-02-15 compare with that of 1999-06-21":"The max temp c of 2023-02-15 is 24.8 and that of 1999-06-21 is 17.4, so 2023-02-15 has the larger max temp c.","2007-06-03 and 2003-08-06":"The max temp c of 2007-06-03 is 18.1 and that of 2003-08-06 is 17.6, so 2007-06-03 has the larger max temp c.","2001-06-28 compare with that of 2014-11-03":"The max temp c of 2001-06-28 is 17.4 and that of 2014-11-03 is 19.8, so 2014-11-03 has the larger max temp c.","1993-10-14 and 2002-12-13":"The max temp c of 1993-10-14 is 20.2 and that of 2002-12-13 is 26.9, so 2002-12-13 has the larger max temp c.","2017-06-26 compare with that of 2019-11-22":"The max temp c of 2017-06-26 is 16.4 and that of 2019-11-22 is 22.1, so 2019-11-22 has the larger max temp c.","2017-01-11 compare with that of 2006-07-15":"The max temp c of 2017-01-11 is 37.1 and that of 2006-07-15 is 14.8, so 2017-01-11 has the larger max temp c.","2007-04-24 and 2014-05-16":"The max temp c of 2007-04-24 is 17.1 and that of 2014-05-16 is 21.4, so 2014-05-16 has the larger max temp c.","2005-06-19 compare with that of 2017-06-24":"The max temp c of 2005-06-19 is 16.4 and that of 2017-06-24 is 17.5, so 2017-06-24 has the larger max temp c.","2000-01-30 compare with that of 2008-02-24":"The max temp c of 2000-01-30 is 21.2 and that of 2008-02-24 is 24.4, so 2008-02-24 has the larger max temp c.","1991-10-20 and 2023-11-22":"The max temp c of 1991-10-20 is 24.8 and that of 2023-11-22 is 23.5, so 1991-10-20 has the larger max temp c.","2017-02-23 and 2000-01-30":"The max temp c of 2017-02-23 is 27.7 and that of 2000-01-30 is 21.2, so 2017-02-23 has the larger max temp c.","1992-06-28 and 2007-04-12":"The max temp c of 1992-06-28 is 15.2 and that of 2007-04-12 is 21.3, so 2007-04-12 has the larger max temp c.","2020-10-03 compare with that of 2018-11-05":"The max temp c of 2020-10-03 is 25.6 and that of 2018-11-05 is 27, so 2018-11-05 has the larger max temp c.","2019-06-14 compare with that of 1992-03-29":"The max temp c of 2019-06-14 is 17.6 and that of 1992-03-29 is 21.9, so 1992-03-29 has the larger max temp c.","2007-04-12 compare with that of 2012-01-26":"The max temp c of 2007-04-12 is 21.3 and that of 2012-01-26 is 24.5, so 2012-01-26 has the larger max temp c.","1999-04-29 and 1998-03-12":"The max temp c of 1999-04-29 is 16.8 and that of 1998-03-12 is 26.5, so 1998-03-12 has the larger max temp c.","1991-12-01 and 2019-06-14":"The max temp c of 1991-12-01 is 19.8 and that of 2019-06-14 is 17.6, so 1991-12-01 has the larger max temp c.","1991-03-10 compare with that of 2001-07-14":"The max temp c of 1991-03-10 is 22.7 and that of 2001-07-14 is 18, so 1991-03-10 has the larger max temp c.","2009-08-29 and 1997-03-02":"The max temp c of 2009-08-29 is 25.2 and that of 1997-03-02 is 25.5, so 1997-03-02 has the larger max temp c.","2007-01-11 compare with that of 2002-07-31":"The max temp c of 2007-01-11 is 28.2 and that of 2002-07-31 is 17.4, so 2007-01-11 has the larger max temp c.","2003-08-31 and 1991-06-06":"The max temp c of 2003-08-31 is 17.3 and that of 1991-06-06 is 18, so 1991-06-06 has the larger max temp c.","1999-08-21 and 2007-05-07":"The max temp c of 1999-08-21 is 15.3 and that of 2007-05-07 is 21.5, so 2007-05-07 has the larger max temp c.","2007-08-19 and 2023-02-15":"The max temp c of 2007-08-19 is 14.3 and that of 2023-02-15 is 24.8, so 2023-02-15 has the larger max temp c.","2023-11-22 compare with that of 2002-10-07":"The max temp c of 2023-11-22 is 23.5 and that of 2002-10-07 is 25.6, so 2002-10-07 has the larger max temp c.","2005-06-09 compare with that of 2020-09-04":"The max temp c of 2005-06-09 is 20.4 and that of 2020-09-04 is 20.7, so 2020-09-04 has the larger max temp c.","2003-01-01 and 2005-08-16":"The max temp c of 2003-01-01 is 23.8 and that of 2005-08-16 is 16.1, so 2003-01-01 has the larger max temp c.","2020-08-01 compare with that of 2024-07-10":"The max temp c of 2020-08-01 is 17.7 and that of 2024-07-10 is 17.4, so 2020-08-01 has the larger max temp c.","1999-09-03 and 2020-10-03":"The max temp c of 1999-09-03 is 18.8 and that of 2020-10-03 is 25.6, so 2020-10-03 has the larger max temp c.","1998-01-12 and 1997-05-22":"The max temp c of 1998-01-12 is 26.7 and that of 1997-05-22 is 17.2, so 1998-01-12 has the larger max temp c.","1997-10-02 and 2003-12-12":"The max temp c of 1997-10-02 is 27.7 and that of 2003-12-12 is 25.7, so 1997-10-02 has the larger max temp c.","2004-07-28 and 1991-03-10":"The max temp c of 2004-07-28 is 16.6 and that of 1991-03-10 is 22.7, so 1991-03-10 has the larger max temp c.","2010-10-23 compare with that of 1993-10-19":"The max temp c of 2010-10-23 is 25.5 and that of 1993-10-19 is 21.7, so 2010-10-23 has the larger max temp c.","2013-07-30 and 2019-06-20":"The max temp c of 2013-07-30 is 17.7 and that of 2019-06-20 is 14.1, so 2013-07-30 has the larger max temp c.","1997-03-02 compare with that of 2006-07-03":"The max temp c of 1997-03-02 is 25.5 and that of 2006-07-03 is 14.1, so 1997-03-02 has the larger max temp c.","2001-09-07 and 2017-02-01":"The max temp c of 2001-09-07 is 19.2 and that of 2017-02-01 is 25.3, so 2017-02-01 has the larger max temp c.","2010-03-12 compare with that of 2016-11-05":"The max temp c of 2010-03-12 is 21.9 and that of 2016-11-05 is 23, so 2016-11-05 has the larger max temp c.","1995-01-09 and 2005-06-19":"The max temp c of 1995-01-09 is 22.3 and that of 2005-06-19 is 16.4, so 1995-01-09 has the larger max temp c.","2018-01-02 and 1993-10-02":"The max temp c of 2018-01-02 is 25.9 and that of 1993-10-02 is 18.9, so 2018-01-02 has the larger max temp c.","2005-08-16 compare with that of 1995-12-17":"The max temp c of 2005-08-16 is 16.1 and that of 1995-12-17 is 22.6, so 1995-12-17 has the larger max temp c.","2016-06-08 and 2020-08-01":"The max temp c of 2016-06-08 is 17.6 and that of 2020-08-01 is 17.7, so 2020-08-01 has the larger max temp c.","2002-12-13 compare with that of 2003-08-12":"The max temp c of 2002-12-13 is 26.9 and that of 2003-08-12 is 17.9, so 2002-12-13 has the larger max temp c.","2002-10-02 and 2005-06-09":"The max temp c of 2002-10-02 is 23.4 and that of 2005-06-09 is 20.4, so 2002-10-02 has the larger max temp c.","2024-09-11 compare with that of 1996-11-29":"The max temp c of 2024-09-11 is 22.5 and that of 1996-11-29 is 25.3, so 1996-11-29 has the larger max temp c.","1997-01-07 and 2010-03-12":"The max temp c of 1997-01-07 is 21.4 and that of 2010-03-12 is 21.9, so 2010-03-12 has the larger max temp c.","2003-12-12 compare with that of 1998-09-10":"The max temp c of 2003-12-12 is 25.7 and that of 1998-09-10 is 19.1, so 2003-12-12 has the larger max temp c.","2014-06-21 and 2017-01-11":"The max temp c of 2014-06-21 is 17.9 and that of 2017-01-11 is 37.1, so 2017-01-11 has the larger max temp c.","1997-05-22 compare with that of 2010-08-08":"The max temp c of 1997-05-22 is 17.2 and that of 2010-08-08 is 14.7, so 1997-05-22 has the larger max temp c.","2015-09-03 and 2007-01-11":"The max temp c of 2015-09-03 is 19 and that of 2007-01-11 is 28.2, so 2007-01-11 has the larger max temp c.","1993-10-02 compare with that of 1999-03-23":"The max temp c of 1993-10-02 is 18.9 and that of 1999-03-23 is 20.5, so 1999-03-23 has the larger max temp c.","1991-06-06 compare with that of 2009-07-29":"The max temp c of 1991-06-06 is 18 and that of 2009-07-29 is 17.6, so 1991-06-06 has the larger max temp c.","1998-03-12 compare with that of 2022-02-27":"The max temp c of 1998-03-12 is 26.5 and that of 2022-02-27 is 24.3, so 1998-03-12 has the larger max temp c.","2017-02-01 compare with that of 1992-04-24":"The max temp c of 2017-02-01 is 25.3 and that of 1992-04-24 is 16.8, so 2017-02-01 has the larger max temp c.","2015-12-16 and 2001-06-28":"The max temp c of 2015-12-16 is 22.9 and that of 2001-06-28 is 17.4, so 2015-12-16 has the larger max temp c.","2014-04-28 compare with that of 2017-07-03":"The max temp c of 2014-04-28 is 19.7 and that of 2017-07-03 is 15.7, so 2014-04-28 has the larger max temp c.","2003-08-06 compare with that of 2005-06-16":"The max temp c of 2003-08-06 is 17.6 and that of 2005-06-16 is 18.1, so 2005-06-16 has the larger max temp c."}}},
{"id":"n-e2f164c8","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","max"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-01cea440","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","max"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-21c3c8b8","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","max"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-71b26e8a","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","max"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-740e9d00","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","max"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-6fbcc98e","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","max"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.wordAt",{"lit":3}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-b245d38d","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","max"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-cb12688f","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","max"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.wordAt",{"lit":3}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-d858e306","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","max"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," temp c of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-b6282e8f","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-45c1073e","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.after",{"lit":"temp"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-4f902846","guard":[["hasAny",["bigger than","class name","element","exceeds","greater than","item number","larger than","more than","nth","pascal case","pascalcase","position","upper camel case","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["transform.pascal",["sense.lastWord"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-5b6e2ced","guard":[["not",["hasAny",["angeles","dividend","greater","high","lesser","min","recovered"]]]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["aggregate.commonLetter",["sense.lastWord"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-6b7a4c97","guard":[["hasAny",["alphabetize the letters","bigger than","element","exceeds","greater than","item number","larger than","letters in order","more than","nth","position","sort the letters","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["transform.sortLetters",["sense.lastWord"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-77659176","guard":[["hasAny",["backwards","bigger than","element","exceeds","greater than","item number","larger than","mirror","more than","nth","position","reverse","reversed","spell backwards","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["transform.reverse",["sense.lastWord"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-9ffe4612","guard":[["hasAny",["abbreviate","abbreviation","acronym","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","short form","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["transform.acronym",["sense.lastWord"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-e1c1eca1","guard":[["hasAny",["bigger than","c","element","exceeds","greater than","item number","larger than","more than","most common letter","most frequent letter","nth","position","which letter appears most"]],["has","versus"],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["aggregate.commonLetter",["sense.lastWord"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-372199ee","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-677840ab","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-6f0e2a89","guard":[["hasAny",["bigger than","each word","element","exceeds","greater than","item number","larger than","more than","nth","position","split into words","versus","words"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-8c108d04","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-d0cf9fe5","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-ee530637","guard":[["hasAny",["bigger than","convert to base","does","element","exceeds","greater than","in base","in binary","in octal","item number","larger than","more than","nth","position","to binary","to hex"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["compute.toBase",{"lit":12},["sense.wordCount"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-f0aaea6b","guard":[["hasAny",["bigger than","each word","element","exceeds","greater than","item number","larger than","more than","nth","position","split into words","versus","words"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-131dba6a","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-35f5d929","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.lastWord"],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-3eb6e6c2","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.lastWord"],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-a646254e","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-478d6448","guard":[["hasAny",["bigger than","convert to base","does","element","exceeds","greater than","in base","in binary","in octal","item number","larger than","more than","nth","position","to binary","to hex"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["compute.toBase",{"lit":12},["sense.wordCount"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-6adceff3","guard":[["hasAny",["bigger than","convert to base","does","element","exceeds","greater than","in base","in binary","in octal","item number","larger than","more than","nth","position","to binary","to hex"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["compute.toBase",{"lit":12},["sense.wordCount"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-b5fdfa87","guard":[["hasAny",["bigger than","convert to base","does","element","exceeds","greater than","in base","in binary","in octal","item number","larger than","more than","nth","position","to binary","to hex"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["compute.toBase",{"lit":12},["sense.wordCount"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-ca62bdbb","guard":[["hasAny",["bigger than","convert to base","does","element","exceeds","greater than","in base","in binary","in octal","item number","larger than","more than","nth","position","to binary","to hex"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["compute.toBase",{"lit":12},["sense.wordCount"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-3c92d96d","guard":[["hasAny",["bigger than","convert to base","does","element","exceeds","greater than","in base","in binary","in octal","item number","larger than","more than","nth","position","to binary","to hex"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["compute.toBase",{"lit":12},["sense.wordCount"]],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-8baf2377","guard":[["hasAny",["bigger than","convert to base","does","element","exceeds","greater than","in base","in binary","in octal","item number","larger than","more than","nth","position","to binary","to hex"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["compute.toBase",{"lit":12},["sense.wordCount"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-c0a1c67c","guard":[["hasAny",["bigger than","convert to base","does","element","exceeds","greater than","in base","in binary","in octal","item number","larger than","more than","nth","position","to binary","to hex"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["compute.toBase",{"lit":12},["sense.wordCount"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-da460ce2","guard":[["hasAny",["bigger than","convert to base","does","element","exceeds","greater than","in base","in binary","in octal","item number","larger than","more than","nth","position","to binary","to hex"]],["has","max"]],"pyramid":["render.template",{"lit":["The max temp ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger max temp c."]},["compute.toBase",{"lit":12},["sense.wordCount"]],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"},{"lit":"max temp c"}]]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-weather-07bc7b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-01636ef8","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2018-01-02 and 1993-10-02":"The max temp c of 2018-01-02 is 25.9 and that of 1993-10-02 is 18.9, so 2018-01-02 has the larger max temp c."}}},
{"id":"n-08467b65","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2005-06-16 versus 2022-11-21: compare their max temp c":"The max temp c of 2005-06-16 is 18.1 and that of 2022-11-21 is 22.5, so 2022-11-21 has the larger max temp c."}}},
{"id":"n-09e5d268","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2001-07-14 versus 2023-10-08: compare their max temp c":"The max temp c of 2001-07-14 is 18 and that of 2023-10-08 is 20.7, so 2023-10-08 has the larger max temp c."}}},
{"id":"n-0ac011a4","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2005-06-09 compare with that of 2020-09-04":"The max temp c of 2005-06-09 is 20.4 and that of 2020-09-04 is 20.7, so 2020-09-04 has the larger max temp c."}}},
{"id":"n-0c474788","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2017-01-11 compare with that of 2006-07-15":"The max temp c of 2017-01-11 is 37.1 and that of 2006-07-15 is 14.8, so 2017-01-11 has the larger max temp c."}}},
{"id":"n-10f65498","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 1991-06-06 compare with that of 2009-07-29":"The max temp c of 1991-06-06 is 18 and that of 2009-07-29 is 17.6, so 1991-06-06 has the larger max temp c."}}},
{"id":"n-12ebb8b6","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1993-10-14 and 2002-12-13":"The max temp c of 1993-10-14 is 20.2 and that of 2002-12-13 is 26.9, so 2002-12-13 has the larger max temp c."}}},
{"id":"n-13422421","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2014-04-28 compare with that of 2017-07-03":"The max temp c of 2014-04-28 is 19.7 and that of 2017-07-03 is 15.7, so 2014-04-28 has the larger max temp c."}}},
{"id":"n-140e7fb2","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1997-11-27 and 2014-04-28":"The max temp c of 1997-11-27 is 33.5 and that of 2014-04-28 is 19.7, so 1997-11-27 has the larger max temp c."}}},
{"id":"n-154b52a7","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2014-05-16 compare with that of 2018-08-14":"The max temp c of 2014-05-16 is 21.4 and that of 2018-08-14 is 21.1, so 2014-05-16 has the larger max temp c."}}},
{"id":"n-169b63b2","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2005-06-19 compare with that of 2017-06-24":"The max temp c of 2005-06-19 is 16.4 and that of 2017-06-24 is 17.5, so 2017-06-24 has the larger max temp c."}}},
{"id":"n-18a9f9fd","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2003-12-12 compare with that of 1998-09-10":"The max temp c of 2003-12-12 is 25.7 and that of 1998-09-10 is 19.1, so 2003-12-12 has the larger max temp c."}}},
{"id":"n-1cc6f07a","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2015-09-03 and 2007-01-11":"The max temp c of 2015-09-03 is 19 and that of 2007-01-11 is 28.2, so 2007-01-11 has the larger max temp c."}}},
{"id":"n-1e7e5c3f","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2016-05-21 compare with that of 2019-11-25":"The max temp c of 2016-05-21 is 19.8 and that of 2019-11-25 is 30.8, so 2019-11-25 has the larger max temp c."}}},
{"id":"n-22cf9ea3","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2003-08-12 versus 2007-08-19: compare their max temp c":"The max temp c of 2003-08-12 is 17.9 and that of 2007-08-19 is 14.3, so 2003-08-12 has the larger max temp c."}}},
{"id":"n-2841ee70","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2017-02-01 compare with that of 1992-04-24":"The max temp c of 2017-02-01 is 25.3 and that of 1992-04-24 is 16.8, so 2017-02-01 has the larger max temp c."}}},
{"id":"n-296d81d1","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2010-08-08 versus 2009-08-29: compare their max temp c":"The max temp c of 2010-08-08 is 14.7 and that of 2009-08-29 is 25.2, so 2009-08-29 has the larger max temp c."}}},
{"id":"n-2c4395e9","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1991-12-01 and 2019-06-14":"The max temp c of 1991-12-01 is 19.8 and that of 2019-06-14 is 17.6, so 1991-12-01 has the larger max temp c."}}},
{"id":"n-2ee11c40","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2020-10-03 compare with that of 2018-11-05":"The max temp c of 2020-10-03 is 25.6 and that of 2018-11-05 is 27, so 2018-11-05 has the larger max temp c."}}},
{"id":"n-2ff29af0","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1992-04-24 versus 1997-11-27: compare their max temp c":"The max temp c of 1992-04-24 is 16.8 and that of 1997-11-27 is 33.5, so 1997-11-27 has the larger max temp c."}}},
{"id":"n-32a66b40","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2004-07-28 and 1991-03-10":"The max temp c of 2004-07-28 is 16.6 and that of 1991-03-10 is 22.7, so 1991-03-10 has the larger max temp c."}}},
{"id":"n-37f98087","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2016-07-20 and 2010-10-23":"The max temp c of 2016-07-20 is 17.3 and that of 2010-10-23 is 25.5, so 2010-10-23 has the larger max temp c."}}},
{"id":"n-39194d62","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2009-08-29 and 1997-03-02":"The max temp c of 2009-08-29 is 25.2 and that of 1997-03-02 is 25.5, so 1997-03-02 has the larger max temp c."}}},
{"id":"n-3b85fa92","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1997-10-02 and 2003-12-12":"The max temp c of 1997-10-02 is 27.7 and that of 2003-12-12 is 25.7, so 1997-10-02 has the larger max temp c."}}},
{"id":"n-3d4dcb74","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2007-04-12 compare with that of 2012-01-26":"The max temp c of 2007-04-12 is 21.3 and that of 2012-01-26 is 24.5, so 2012-01-26 has the larger max temp c."}}},
{"id":"n-3d9734cd","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2014-11-03 versus 2000-01-06: compare their max temp c":"The max temp c of 2014-11-03 is 19.8 and that of 2000-01-06 is 21.6, so 2000-01-06 has the larger max temp c."}}},
{"id":"n-3e44ab6d","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2022-11-21 and 2006-05-29":"The max temp c of 2022-11-21 is 22.5 and that of 2006-05-29 is 15.8, so 2022-11-21 has the larger max temp c."}}},
{"id":"n-3e93a50d","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1993-10-19 versus 1995-01-09: compare their max temp c":"The max temp c of 1993-10-19 is 21.7 and that of 1995-01-09 is 22.3, so 1995-01-09 has the larger max temp c."}}},
{"id":"n-459a5086","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2015-12-16 and 2001-06-28":"The max temp c of 2015-12-16 is 22.9 and that of 2001-06-28 is 17.4, so 2015-12-16 has the larger max temp c."}}},
{"id":"n-46e2a41c","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2007-08-19 and 2023-02-15":"The max temp c of 2007-08-19 is 14.3 and that of 2023-02-15 is 24.8, so 2023-02-15 has the larger max temp c."}}},
{"id":"n-4870359d","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2001-01-13 versus 1999-08-21: compare their max temp c":"The max temp c of 2001-01-13 is 25.1 and that of 1999-08-21 is 15.3, so 2001-01-13 has the larger max temp c."}}},
{"id":"n-4c506407","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1992-06-28 and 2007-04-12":"The max temp c of 1992-06-28 is 15.2 and that of 2007-04-12 is 21.3, so 2007-04-12 has the larger max temp c."}}},
{"id":"n-54920f75","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2003-08-06 compare with that of 2005-06-16":"The max temp c of 2003-08-06 is 17.6 and that of 2005-06-16 is 18.1, so 2005-06-16 has the larger max temp c."}}},
{"id":"n-5686790a","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 1991-03-10 compare with that of 2001-07-14":"The max temp c of 1991-03-10 is 22.7 and that of 2001-07-14 is 18, so 1991-03-10 has the larger max temp c."}}},
{"id":"n-56921918","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2002-12-13 compare with that of 2003-08-12":"The max temp c of 2002-12-13 is 26.9 and that of 2003-08-12 is 17.9, so 2002-12-13 has the larger max temp c."}}},
{"id":"n-5a237932","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 1993-10-02 compare with that of 1999-03-23":"The max temp c of 1993-10-02 is 18.9 and that of 1999-03-23 is 20.5, so 1999-03-23 has the larger max temp c."}}},
{"id":"n-5af8fd42","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2002-10-02 and 2005-06-09":"The max temp c of 2002-10-02 is 23.4 and that of 2005-06-09 is 20.4, so 2002-10-02 has the larger max temp c."}}},
{"id":"n-60682b31","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1999-04-29 and 1998-03-12":"The max temp c of 1999-04-29 is 16.8 and that of 1998-03-12 is 26.5, so 1998-03-12 has the larger max temp c."}}},
{"id":"n-60bee9d3","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2001-06-28 compare with that of 2014-11-03":"The max temp c of 2001-06-28 is 17.4 and that of 2014-11-03 is 19.8, so 2014-11-03 has the larger max temp c."}}},
{"id":"n-61c7b881","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2012-01-26 versus 1997-01-07: compare their max temp c":"The max temp c of 2012-01-26 is 24.5 and that of 1997-01-07 is 21.4, so 2012-01-26 has the larger max temp c."}}},
{"id":"n-62b75309","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2016-09-28 and 2016-05-21":"The max temp c of 2016-09-28 is 18 and that of 2016-05-21 is 19.8, so 2016-05-21 has the larger max temp c."}}},
{"id":"n-6383dcb0","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2003-08-31 and 1991-06-06":"The max temp c of 2003-08-31 is 17.3 and that of 1991-06-06 is 18, so 1991-06-06 has the larger max temp c."}}},
{"id":"n-63c1d946","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2016-06-08 and 2020-08-01":"The max temp c of 2016-06-08 is 17.6 and that of 2020-08-01 is 17.7, so 2020-08-01 has the larger max temp c."}}},
{"id":"n-67f7286d","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2007-05-07 compare with that of 2013-06-12":"The max temp c of 2007-05-07 is 21.5 and that of 2013-06-12 is 16.8, so 2007-05-07 has the larger max temp c."}}},
{"id":"n-6cc6c978","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2007-01-11 compare with that of 2002-07-31":"The max temp c of 2007-01-11 is 28.2 and that of 2002-07-31 is 17.4, so 2007-01-11 has the larger max temp c."}}},
{"id":"n-6d3eeea6","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2013-07-30 and 2019-06-20":"The max temp c of 2013-07-30 is 17.7 and that of 2019-06-20 is 14.1, so 2013-07-30 has the larger max temp c."}}},
{"id":"n-701acf4a","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1999-03-23 versus 2015-09-03: compare their max temp c":"The max temp c of 1999-03-23 is 20.5 and that of 2015-09-03 is 19, so 1999-03-23 has the larger max temp c."}}},
{"id":"n-739e0b99","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2005-08-16 compare with that of 1995-12-17":"The max temp c of 2005-08-16 is 16.1 and that of 1995-12-17 is 22.6, so 1995-12-17 has the larger max temp c."}}},
{"id":"n-758318c2","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2020-08-01 compare with that of 2024-07-10":"The max temp c of 2020-08-01 is 17.7 and that of 2024-07-10 is 17.4, so 2020-08-01 has the larger max temp c."}}},
{"id":"n-78612149","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2014-02-02 and 2017-06-26":"The max temp c of 2014-02-02 is 26.2 and that of 2017-06-26 is 16.4, so 2014-02-02 has the larger max temp c."}}},
{"id":"n-7ab17bb9","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2024-09-11 compare with that of 1996-11-29":"The max temp c of 2024-09-11 is 22.5 and that of 1996-11-29 is 25.3, so 1996-11-29 has the larger max temp c."}}},
{"id":"n-7ed079c3","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-07-10 versus 1999-04-29: compare their max temp c":"The max temp c of 2024-07-10 is 17.4 and that of 1999-04-29 is 16.8, so 2024-07-10 has the larger max temp c."}}},
{"id":"n-83a71844","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2013-06-12 versus 2016-06-08: compare their max temp c":"The max temp c of 2013-06-12 is 16.8 and that of 2016-06-08 is 17.6, so 2016-06-08 has the larger max temp c."}}},
{"id":"n-85d0c6f4","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 1998-03-12 compare with that of 2022-02-27":"The max temp c of 1998-03-12 is 26.5 and that of 2022-02-27 is 24.3, so 1998-03-12 has the larger max temp c."}}},
{"id":"n-8605c482","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2006-05-29 compare with that of 2000-06-10":"The max temp c of 2006-05-29 is 15.8 and that of 2000-06-10 is 15.6, so 2006-05-29 has the larger max temp c."}}},
{"id":"n-863252d8","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2016-11-05 versus 2016-09-28: compare their max temp c":"The max temp c of 2016-11-05 is 23 and that of 2016-09-28 is 18, so 2016-11-05 has the larger max temp c."}}},
{"id":"n-8ae89850","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1998-09-10 versus 1999-09-03: compare their max temp c":"The max temp c of 1998-09-10 is 19.1 and that of 1999-09-03 is 18.8, so 1998-09-10 has the larger max temp c."}}},
{"id":"n-8af7b845","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1995-01-09 and 2005-06-19":"The max temp c of 1995-01-09 is 22.3 and that of 2005-06-19 is 16.4, so 1995-01-09 has the larger max temp c."}}},
{"id":"n-8bdc59d5","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 1993-03-04 compare with that of 2001-01-13":"The max temp c of 1993-03-04 is 20.1 and that of 2001-01-13 is 25.1, so 2001-01-13 has the larger max temp c."}}},
{"id":"n-94269422","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2008-02-24 versus 2014-06-21: compare their max temp c":"The max temp c of 2008-02-24 is 24.4 and that of 2014-06-21 is 17.9, so 2008-02-24 has the larger max temp c."}}},
{"id":"n-96ceef6f","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1995-12-17 versus 2007-04-24: compare their max temp c":"The max temp c of 1995-12-17 is 22.6 and that of 2007-04-24 is 17.1, so 1995-12-17 has the larger max temp c."}}},
{"id":"n-9c9644a4","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2003-01-01 and 2005-08-16":"The max temp c of 2003-01-01 is 23.8 and that of 2005-08-16 is 16.1, so 2003-01-01 has the larger max temp c."}}},
{"id":"n-9ca12333","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2017-02-23 and 2000-01-30":"The max temp c of 2017-02-23 is 27.7 and that of 2000-01-30 is 21.2, so 2017-02-23 has the larger max temp c."}}},
{"id":"n-a9ddf0d0","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-06-24 versus 2013-07-30: compare their max temp c":"The max temp c of 2017-06-24 is 17.5 and that of 2013-07-30 is 17.7, so 2013-07-30 has the larger max temp c."}}},
{"id":"n-abcf0ede","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1991-10-20 and 2023-11-22":"The max temp c of 1991-10-20 is 24.8 and that of 2023-11-22 is 23.5, so 1991-10-20 has the larger max temp c."}}},
{"id":"n-acfafef6","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2007-04-24 and 2014-05-16":"The max temp c of 2007-04-24 is 17.1 and that of 2014-05-16 is 21.4, so 2014-05-16 has the larger max temp c."}}},
{"id":"n-af19facb","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1997-01-07 and 2010-03-12":"The max temp c of 1997-01-07 is 21.4 and that of 2010-03-12 is 21.9, so 2010-03-12 has the larger max temp c."}}},
{"id":"n-b1b8b562","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-11-22 versus 2016-07-20: compare their max temp c":"The max temp c of 2019-11-22 is 22.1 and that of 2016-07-20 is 17.3, so 2019-11-22 has the larger max temp c."}}},
{"id":"n-b290e1bc","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2009-07-29 versus 1991-12-01: compare their max temp c":"The max temp c of 2009-07-29 is 17.6 and that of 1991-12-01 is 19.8, so 1991-12-01 has the larger max temp c."}}},
{"id":"n-b3159c75","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1998-01-12 and 1997-05-22":"The max temp c of 1998-01-12 is 26.7 and that of 1997-05-22 is 17.2, so 1998-01-12 has the larger max temp c."}}},
{"id":"n-b8352d45","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 1997-05-22 compare with that of 2010-08-08":"The max temp c of 1997-05-22 is 17.2 and that of 2010-08-08 is 14.7, so 1997-05-22 has the larger max temp c."}}},
{"id":"n-be7f8f98","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1992-03-29 versus 2007-06-03: compare their max temp c":"The max temp c of 1992-03-29 is 21.9 and that of 2007-06-03 is 18.1, so 1992-03-29 has the larger max temp c."}}},
{"id":"n-c3401986","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2006-07-15 versus 1992-06-28: compare their max temp c":"The max temp c of 2006-07-15 is 14.8 and that of 1992-06-28 is 15.2, so 1992-06-28 has the larger max temp c."}}},
{"id":"n-c60a80f3","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1999-08-21 and 2007-05-07":"The max temp c of 1999-08-21 is 15.3 and that of 2007-05-07 is 21.5, so 2007-05-07 has the larger max temp c."}}},
{"id":"n-c9e5710a","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-09-04 versus 2015-12-16: compare their max temp c":"The max temp c of 2020-09-04 is 20.7 and that of 2015-12-16 is 22.9, so 2015-12-16 has the larger max temp c."}}},
{"id":"n-cd46ad41","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2019-06-14 compare with that of 1992-03-29":"The max temp c of 2019-06-14 is 17.6 and that of 1992-03-29 is 21.9, so 1992-03-29 has the larger max temp c."}}},
{"id":"n-ce757ba3","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2006-07-03 versus 1993-10-14: compare their max temp c":"The max temp c of 2006-07-03 is 14.1 and that of 1993-10-14 is 20.2, so 1993-10-14 has the larger max temp c."}}},
{"id":"n-cfc5a57f","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 1997-03-02 compare with that of 2006-07-03":"The max temp c of 1997-03-02 is 25.5 and that of 2006-07-03 is 14.1, so 1997-03-02 has the larger max temp c."}}},
{"id":"n-d0c397fb","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1996-11-29 versus 2014-02-02: compare their max temp c":"The max temp c of 1996-11-29 is 25.3 and that of 2014-02-02 is 26.2, so 2014-02-02 has the larger max temp c."}}},
{"id":"n-d166b223","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-02-27 versus 2003-01-01: compare their max temp c":"The max temp c of 2022-02-27 is 24.3 and that of 2003-01-01 is 23.8, so 2022-02-27 has the larger max temp c."}}},
{"id":"n-d294dc11","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2023-10-08 and 2024-09-11":"The max temp c of 2023-10-08 is 20.7 and that of 2024-09-11 is 22.5, so 2024-09-11 has the larger max temp c."}}},
{"id":"n-d920ac51","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1999-06-21 versus 1997-10-02: compare their max temp c":"The max temp c of 1999-06-21 is 17.4 and that of 1997-10-02 is 27.7, so 1997-10-02 has the larger max temp c."}}},
{"id":"n-da5035cc","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2010-03-12 compare with that of 2016-11-05":"The max temp c of 2010-03-12 is 21.9 and that of 2016-11-05 is 23, so 2016-11-05 has the larger max temp c."}}},
{"id":"n-dab5cf63","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-11-25 versus 2003-08-31: compare their max temp c":"The max temp c of 2019-11-25 is 30.8 and that of 2003-08-31 is 17.3, so 2019-11-25 has the larger max temp c."}}},
{"id":"n-dc16069f","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2000-01-30 compare with that of 2008-02-24":"The max temp c of 2000-01-30 is 21.2 and that of 2008-02-24 is 24.4, so 2008-02-24 has the larger max temp c."}}},
{"id":"n-dc3898d2","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2017-06-26 compare with that of 2019-11-22":"The max temp c of 2017-06-26 is 16.4 and that of 2019-11-22 is 22.1, so 2019-11-22 has the larger max temp c."}}},
{"id":"n-e0c7d6b1","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2000-06-10 versus 2018-01-02: compare their max temp c":"The max temp c of 2000-06-10 is 15.6 and that of 2018-01-02 is 25.9, so 2018-01-02 has the larger max temp c."}}},
{"id":"n-e141d9db","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2018-08-14 versus 2004-07-28: compare their max temp c":"The max temp c of 2018-08-14 is 21.1 and that of 2004-07-28 is 16.6, so 2018-08-14 has the larger max temp c."}}},
{"id":"n-e323d161","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-07-03 versus 1998-01-12: compare their max temp c":"The max temp c of 2017-07-03 is 15.7 and that of 1998-01-12 is 26.7, so 1998-01-12 has the larger max temp c."}}},
{"id":"n-e840b65a","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2001-09-07 and 2017-02-01":"The max temp c of 2001-09-07 is 19.2 and that of 2017-02-01 is 25.3, so 2017-02-01 has the larger max temp c."}}},
{"id":"n-ea854e26","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2023-11-22 compare with that of 2002-10-07":"The max temp c of 2023-11-22 is 23.5 and that of 2002-10-07 is 25.6, so 2002-10-07 has the larger max temp c."}}},
{"id":"n-eab877a7","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2023-02-15 compare with that of 1999-06-21":"The max temp c of 2023-02-15 is 24.8 and that of 1999-06-21 is 17.4, so 2023-02-15 has the larger max temp c."}}},
{"id":"n-ec0d9836","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2014-06-21 and 2017-01-11":"The max temp c of 2014-06-21 is 17.9 and that of 2017-01-11 is 37.1, so 2017-01-11 has the larger max temp c."}}},
{"id":"n-ecfddbd2","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2007-06-03 and 2003-08-06":"The max temp c of 2007-06-03 is 18.1 and that of 2003-08-06 is 17.6, so 2007-06-03 has the larger max temp c."}}},
{"id":"n-f17d7f34","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2002-07-31 versus 1991-10-20: compare their max temp c":"The max temp c of 2002-07-31 is 17.4 and that of 1991-10-20 is 24.8, so 1991-10-20 has the larger max temp c."}}},
{"id":"n-f2d35670","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the max temp c of 2010-10-23 compare with that of 1993-10-19":"The max temp c of 2010-10-23 is 25.5 and that of 1993-10-19 is 21.7, so 2010-10-23 has the larger max temp c."}}},
{"id":"n-f48ecfd7","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2018-11-05 versus 2002-10-02: compare their max temp c":"The max temp c of 2018-11-05 is 27 and that of 2002-10-02 is 23.4, so 2018-11-05 has the larger max temp c."}}},
{"id":"n-f665931c","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 1999-09-03 and 2020-10-03":"The max temp c of 1999-09-03 is 18.8 and that of 2020-10-03 is 25.6, so 2020-10-03 has the larger max temp c."}}},
{"id":"n-f796485d","guard":[["hasAny",["c","compare","max","temp","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2002-10-07 versus 2001-09-07: compare their max temp c":"The max temp c of 2002-10-07 is 25.6 and that of 2001-09-07 is 19.2, so 2002-10-07 has the larger max temp c."}}},
{"id":"n-fda2d195","guard":[["hasAny",["c","compare","max","temp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the max temp c of 2000-01-06 and 1993-03-04":"The max temp c of 2000-01-06 is 21.6 and that of 1993-03-04 is 20.1, so 2000-01-06 has the larger max temp c."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"how does the max temp c of 2006-05-29 compare with that of 2000-06-10","expect":{"contains":["15.8","15.6","2006-05-29"],"notRefusal":true}},{"q":"compare the max temp c of 2016-09-28 and 2016-05-21","expect":{"contains":["18","19.8","2016-05-21"],"notRefusal":true}},{"q":"2013-06-12 versus 2016-06-08: compare their max temp c","expect":{"contains":["16.8","17.6","2016-06-08"],"notRefusal":true}},{"q":"how does the max temp c of 2014-05-16 compare with that of 2018-08-14","expect":{"contains":["21.4","21.1","2014-05-16"],"notRefusal":true}},{"q":"2001-07-14 versus 2023-10-08: compare their max temp c","expect":{"contains":["18","20.7","2023-10-08"],"notRefusal":true}},{"q":"compare the max temp c of 2000-01-06 and 1993-03-04","expect":{"contains":["21.6","20.1","2000-01-06"],"notRefusal":true}},{"q":"compare the max temp c of 2022-11-21 and 2006-05-29","expect":{"contains":["22.5","15.8","2022-11-21"],"notRefusal":true}},{"q":"compare the max temp c of 2016-07-20 and 2010-10-23","expect":{"contains":["17.3","25.5","2010-10-23"],"notRefusal":true}},{"q":"2016-11-05 versus 2016-09-28: compare their max temp c","expect":{"contains":["23","18","2016-11-05"],"notRefusal":true}},{"q":"how does the max temp c of 2007-05-07 compare with that of 2013-06-12","expect":{"contains":["21.5","16.8","2007-05-07"],"notRefusal":true}},{"q":"1992-03-29 versus 2007-06-03: compare their max temp c","expect":{"contains":["21.9","18.1","1992-03-29"],"notRefusal":true}},{"q":"1998-09-10 versus 1999-09-03: compare their max temp c","expect":{"contains":["19.1","18.8","1998-09-10"],"notRefusal":true}},{"q":"2003-08-12 versus 2007-08-19: compare their max temp c","expect":{"contains":["17.9","14.3","2003-08-12"],"notRefusal":true}},{"q":"compare the max temp c of 2014-02-02 and 2017-06-26","expect":{"contains":["26.2","16.4","2014-02-02"],"notRefusal":true}},{"q":"how does the max temp c of 1993-03-04 compare with that of 2001-01-13","expect":{"contains":["20.1","25.1","2001-01-13"],"notRefusal":true}},{"q":"compare the max temp c of 1997-11-27 and 2014-04-28","expect":{"contains":["33.5","19.7","1997-11-27"],"notRefusal":true}},{"q":"how does the max temp c of 2016-05-21 compare with that of 2019-11-25","expect":{"contains":["19.8","30.8","2019-11-25"],"notRefusal":true}},{"q":"compare the max temp c of 2023-10-08 and 2024-09-11","expect":{"contains":["20.7","22.5","2024-09-11"],"notRefusal":true}},{"q":"how does the max temp c of 2023-02-15 compare with that of 1999-06-21","expect":{"contains":["24.8","17.4","2023-02-15"],"notRefusal":true}},{"q":"compare the max temp c of 2007-06-03 and 2003-08-06","expect":{"contains":["18.1","17.6","2007-06-03"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
