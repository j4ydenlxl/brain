// price-of-date-2a9f-compare-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"price-of-date-2a9f-compare-neo-g10","class":"price-of-date-2a9f-compare","generation":10,"lane":"neo","grownFrom":["2011-10-07 versus 2018-09-05: compare their price","how does the price of 2007-06-01 compare with that of 1999-08-06","compare the price of 2008-03-11 and 2010-07-02","2000-10-23 versus 2010-11-12: compare their price","2007-10-18 versus 2005-11-08: compare their price","2023-03-14 versus 2000-07-19: compare their price","2002-11-19 versus 2020-08-07: compare their price","compare the price of 2005-02-17 and 2016-07-08","how does the price of 2011-06-10 compare with that of 2011-10-07","compare the price of 2005-11-08 and 2011-02-02","2009-07-30 versus 2016-06-06: compare their price","how does the price of 2019-06-14 compare with that of 2008-01-11","2011-09-07 versus 2012-08-21: compare their price","compare the price of 2020-12-28 and 2015-07-16","how does the price of 2010-05-27 compare with that of 2023-09-13","how does the price of 2010-07-02 compare with that of 2016-09-07","compare the price of 2006-06-30 and 2019-11-08","compare the price of 2013-01-30 and 2010-05-27","compare the price of 2012-08-21 and 2002-08-27","2014-10-13 versus 2003-07-28: compare their price"],"version":1});

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
knowLoad([{"id":"fr-natural-gas-daily-4cc47b","columns":["date","price"],"n":5698,"cols":[{"f":"01997-01-07|98|99|810|93|94|95|96|97|820|91|93|94|97|98|99|62-03|94|95|96|97|810|91|92|94|98|821|94|95|96|97|63-04|95|96|97|810|92|93|94|97|98|99|820|91|94|95|96|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|65-01|95|96|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|96|813|96|97|98|820|95|96|67-02|99|810|91|96|821|92|95|98|99|68-04|95|98|812|99|829|69-05|811|99|822|93|94|99|510-07|813|96|97|820|91|830|61-03|821|94|62-03|95|98|99|812|97|98|826|99|831|38-01-06|99|815|96|827|98|99|830|62-05|812|99|820|93|95|96|63-03|95|96|810|830|64-01|92|99|813|828|65-01|95|829|66-03|94|98|816|823|95|67-01|98|823|99|830|68-05|97|813|99|827|831|69-04|98|810|94|95|96|98|821|93|95|99|830|510-05|97|815|821|98|99|830|61-03|99|810|92|93|98|99|823|94|95|62-02|810|94|831|39-01-04|98|825|97|62-03|94|810|92|97|98|825|63-11|92|99|823|95|99|831|64-08|99|819|822|65-12|94|97|98|827|66-10|91|94|96|98|823|99|67-02|97|99|819|820|96|97|830|68-03|95|96|99|817|820|93|95|830|91|69-03|813|821|92|97|99|510-04|811|94|820|92|61-01|92|98|99|812|95|99|62-09|810|94|830|02000-01-10|93|94|99|827|62-08|811|97|823|95|98|63-02|93|97|814|828|64-06|97|810|91|92|94|98|825|98|65-02|99|819|822|95|830|91|66-01|92|96|98|99|812|94|95|96|99|820|91|92|93|97|98|99|830|67-03|813|94|98|99|820|91|95|97|98|68-01|93|99|822|94|98|69-08|812|98|510-02|93|95|810|91|96|823|94|96|830|91|61-01|96|827|98|99|62-01|94|95|96|97|98|811|92|94|95|98|99|822|98|31-01-02|93|94|95|98|99|810|98|824|95|96|99|62-05|812|94|821|96|97|63-01|92|813|94|95|96|99|820|92|97|98|64-02|95|820|93|830|65-03|94|823|95|66-01|94|95|97|811|822|97|98|67-03|818|823|831|68-07|98|810|96|823|830|69-06|97|817|820|91|95|96|510-04|95|99|811|95|826|830|61-01|95|813|94|821|96|97|830|62-04|812|97|821|96|97|98|831|32-01-03|94|97|810|91|95|96|97|822|93|98|99|830|91|62-01|815|822|97|63-06|813|94|821|98|64-12|95|98|825|96|65-15|822|98|830|66-11|97|820|96|97|67-01|822|830|91|68-06|816|827|98|69-12|93|824|95|97|510-01|92|822|61-13|94|95|98|99|820|91|62-02|810|91|96|97|827|33-01-09|813|96|822|93|62-06|814|98|99|824|95|98|63-03|97|819|820|91|95|64-09|828|830|65-01|66-04|95|810|93|67-07|98|99|814|98|821|94|95|98|68-01|98|814|826|98|99|69-02|95|811|822|99|510-06|97|99|810|94|96|97|820|93|94|61-03|94|811|94|98|821|62-01|94|95|99|34-01-07|98|99|814|95|822|96|62-05|99|818|823|95|64-06|65-03|810|821|96|66-03|828|67-02|98|821|93|98|68-24|97|830|69-01|93|813|94|97|820|94|97|510-01|97|98|813|98|99|827|98|61-04|95|98|99|812|97|822|99|830|62-02|813|94|97|821|93|97|35-01-03|94|97|810|91|825|98|62-09|817|824|95|98|63-02|810|98|822|94|830|64-04|97|98|819|828|65-06|812|831|66-07|810|820|67-01|98|819|828|68-01|823|69-02|96|97|98|99|812|93|95|99|821|92|510-07|821|97|61-04|97|98|810|91|95|96|98|821|92|98|62-08|812|823|97|98|36-01-03|94|95|812|824|62-10|94|63-03|810|95|97|820|93|94|99|64-26|98|65-04|99|810|92|96|98|826|66-01|92|95|99|812|96|820|91|93|830|67-05|97|810|94|828|68-04|822|93|831|69-01|811|94|95|99|510-13|820|61-03|822|830|62-06|98|814|95|829|37-01-23|94|62-09|821|63-02|98|827|99|64-04|95|99|810|91|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|38-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|39-01-02|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|210-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|91|31-01-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|823|94|95|99|830|91|64-01|94|97|98|811|92|93|94|95|98|821|95|96|97|98|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|66-01|92|93|96|97|98|99|810|93|95|96|97|821|92|93|97|98|99|67-01|96|97|98|811|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|32-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|33-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|96|97|830|91|34-01-02|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|35-01-02|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|36-01-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|66-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|67-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|37-01-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|38-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|64-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|96|97|98|39-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|812|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|96|97|830|91|220-01-02|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|31-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|91|32-01-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|66-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|811|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|33-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|67-03|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|34-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|820|91|94|95|96|97|98|67-01|92|93|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|96|97|830|91|35-01-02|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|92|93|94|97|98|99|820|91|94|95|96|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|99|830|91|36-01-05|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99","sep":"|"},{"d":"3.82|3.8|3.61|3.92|4|4.01|4.34|4.71|3.91|3.26|2.99|2.96|2.62|2.98|3.05|2.91|2.49|2.59|2.65|2.51|2.39|2.42|2.34|2.12|1.84|1.92|1.77|1.81|1.8|1.87|1.82|1.89|1.95|1.96|1.98|1.97|2.01|1.91|1.88|1.85|1.99|2|2.02|2.08|2.1|2.09|2.22|2.11|2.16|2.19|2.23|2.25|2.33|2.3|2.27|2.18|2.21|2.2|2.29|2.15|2.32|2.14|2.24|2.17|2.26|2.38|2.56|2.61|2.69|2.67|2.78|2.94|3.09|3.03|2.81|2.87|2.97|3.13|3.34|3.23|2.63|2.53|2.35|2.37|2.07|2.06|2.31|2.28|2.45|2.43|2.52|2.13|2.04|2.46|1.83|1.76|1.61|1.71|1.86|1.94|2.05|1.75|1.7|1.4|1.59|1.9|1.79|1.64|1.73|2.55|2.73|2.7|2.95|3.1|2.85|2.84|2.47|2.8|2.57|2.9|3|2.44|2.4|2.76|2.6|2.66|2.5|2.72|2.83|3.11|3.12|3.18|3.2|3.25|3.76|3.95|4.18|4.35|4.52|4.39|4.21|4.48|3.96|4.14|4.22|4.16|4.38|4.45|4.02|4.44|4.42|4.55|4.25|4.36|4.08|4.17|3.99|4.07|3.86|3.88|3.63|3.75|3.89|3.78|4.23|4.8|4.53|4.62|4.74|4.96|5.06|5.24|5.29|5.21|5.16|5.1|5.34|4.82|4.84|4.61|4.56|4.37|4.4|4.6|6.24|5.9|5.93|6.53|7.41|8.03|8.75|8.48|8.13|9.96|8.58|7.48|9.28|9.11|10.48|9.22|9.97|9.71|9.45|10.03|10.31|9.95|9.91|7.09|6.81|7|6.76|6.15|5.74|5.89|5.2|5.07|5.25|5.08|4.99|5.27|5.47|5.6|5|5.09|4.73|4.46|4.5|4.11|3.83|3.7|3.98|3.93|3.68|3.39|3.15|3.02|3.31|3.16|3.46|2.36|2.41|3.06|2.58|2.03|3.07|3.27|3.5|3.32|3.6|3.33|3.22|3.28|3.01|3.47|3.37|4.41|4.27|4.2|3.9|4.24|4.63|5.31|5.13|4.81|5.05|5.23|5.5|5.72|6.55|6.08|5.88|6.09|6.1|11.98|18.48|10.81|8.51|7.42|5.11|5.3|5.32|6.4|6.17|5.44|5.4|5.56|5.15|5.01|4.86|4.68|5.02|4.94|4.76|4.85|4.57|4.66|4.78|4.92|4.3|4.9|4.12|4.15|5.7|6.27|6.52|6.61|6.41|6.91|5.73|6.02|6.03|5.54|5.33|5.8|6.14|6.35|6.7|6.44|6.13|6.19|5.98|5.77|4.32|5.12|4.95|5.22|5.41|5.38|5.59|5.64|8.12|6.8|7.4|6.62|5.79|6.06|6.79|6.69|6.89|7.1|7.26|6.83|6.98|6.57|5.53|5.71|5.82|6.21|5.96|6.23|6.2|6.05|6.33|7.12|7.24|7.07|7.18|7.8|7.5|6.95|6.67|6.31|7.13|7.01|7.87|7.7|7.69|11.75|11.56|11.03|10.92|10.68|10.71|11.24|11.99|14.26|14.84|13.67|12.73|13.9|9.67|8.77|9.15|9.66|9.2|9.21|10.01|11.15|11.01|14.25|14.82|11.17|10.22|9.9|9.25|9.24|8.7|8.27|7.57|7.03|6.59|7.17|7.16|7.43|6.64|6.47|6.5|5.99|5.78|6.25|5.84|5.18|6.28|7.44|6.86|7.19|6.88|8.32|7.32|7.45|6.82|7.53|7.58|8.16|7.51|7.22|7.14|7.15|7.34|7.46|7.65|7.97|7.93|7.66|7.54|7.6|7.56|7.71|7.64|7.82|7.63|7.85|7.68|7.62|7.47|7.73|7.83|7.89|7.52|7.39|7.04|6.77|6.85|6.74|6.37|6.3|6.39|6.66|6.26|6.32|6.34|6.46|6|5.66|5.83|6.11|6.38|6.45|7.3|6.96|5.92|5.69|5.49|6.42|6.12|6.54|6.07|6.63|7.29|7.11|6.49|6.43|6.99|7.28|6.71|7.2|7.35|7.38|6.97|7.27|7.06|6.94|7.84|7.61|7.59|7.96|8.45|8.43|8.23|8.1|8.42|8.17|7.88|7.94|7.99|8.06|8.38|8.37|8.35|8.5|8.73|8.91|9.08|8.9|8.65|9.1|9.07|9.37|9.7|9.82|9.59|9.85|9.69|9.74|9.84|8.54|8.99|9.3|9.36|9.86|9.92|9.6|9.68|9.48|9.78|9.88|10.18|10.07|10.16|10.11|10.27|10.08|10.5|10.56|10.33|10.58|10.72|10.95|10.94|10.66|10.37|10.77|11.09|11.08|11.33|11.29|11.38|11.18|11.52|11.41|11.31|11.1|11.4|11.57|11.85|11.6|11.81|11.43|11.8|12.27|12.17|12.49|12.71|12.72|12.51|12.87|12.93|13.09|12.76|12.92|12.96|12.7|13.1|13.19|13.28|13.31|13|12.47|12.1|11.83|12.15|11.58|11.79|10.54|9.34|9.26|9.17|9.01|9.05|8.66|8.22|8.18|8.11|8.15|7.74|8.02|8.04|7.98|8.36|8.24|7.76|7.72|8.26|7.79|6.87|6.58|6.65|6.29|6.75|6.18|6.6|7.02|6.56|6.48|6.68|5.57|5.67|5.86|5.75|5.63|5.39|5.37|5.81|4.87|4.72|4.75|4.77|5.04|4.67|4.43|3.87|4.13|3.73|3.58|3.56|3.69|3.66|3.74|3.59|3.54|3.55|3.43|3.48|3.19|3.29|3.3|3.62|3.67|4.1|4.05|3.77|3.41|3.35|3.49|3.81|3.51|3.53|4.19|4.04|3.72|3.24|3.36|3.17|3.21|3.57|2.68|2.89|4.03|3.94|4.98|4.88|4.59|4.33|4.49|3.79|5.65|5.87|5.55|5.91|6.01|5.61|5.51|5.52|5.76|5.42|5.26|5.48|4.91|4.83|4.47|4.51|4.29|3.97|4.26|4.28|4.31|4.89|5.14|5.17|4.54|4.7|4.69|4.65|3.85|4.06|4.09|3.4|3.42|3.84|4.64|4.58|3.52|3.65|3.44|3.38|3.45|3.08|2.71|2.48|2.54|2.74|2.79|2.88|2.92|3.14|2.77|2.82|2.75|2.64|3.71|3.64|6.9|7.75|4.79|2.86|3.04|2.93|1.66|1.74|1.63|1.93|1.78|1.62|1.57|1.6|1.49|1.56|1.72|1.68||5.46|1.65|1.69|1.55|1.5|1.58|1.67|1.43|1.51|1.53|1.42|1.33|1.41|11.32|23.86|8.56|4.97|5.94|5.58|5.68|4.93|5.45|5.19|5.43|5.95|6.84|8.3|6.78|7.25|8.07|8.53|8.21|8.87|9.44|9.19|8.46|8.47|8.34|9.43|8.78|9|7.37|8.25|8.52|9.46|8.33|8.2|8.01|7.81|8.4|7.86|8.62|9.51|9.42|9.14|9.75|9.27|9.47|8.93|9.38|9.18|8.31|8.49|8.6|6.16|5.28|6.73|13.2|1.52|1.47|1.48|1.54|1.25|1.26|1.38|1.46|1.36|1.35|1.21|5.62|30.72|25.01|17.19|10.25","i":"0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,l,n,o,p,p,q,r,s,t,p,u,v,w,x,y,z,10,11,12,12,t,s,13,13,o,w,13,t,11,14,10,x,z,y,15,15,16,17,18,19,18,1a,1b,1c,18,19,1c,1d,1e,1f,1g,1h,1i,1j,1a,1f,1d,1f,1a,1k,1a,1l,1m,m,1m,1e,1l,1b,1d,1d,1n,1l,1l,1a,1f,1o,1e,1p,1c,1n,1c,1q,1r,1j,1a,1d,1e,1s,1g,1t,1u,1v,1w,1x,1y,1z,d,20,21,20,22,23,1z,24,e,25,26,27,h,28,29,l,1h,2a,1h,1t,2b,1j,1g,1i,1c,19,2c,1b,2d,19,2c,19,2e,1l,1a,1l,1l,1k,2f,1q,n,18,1f,1o,2g,2h,1v,2i,1i,1b,1d,18,2j,2k,15,18,2a,k,2l,k,15,14,w,11,u,2m,x,2n,2o,2p,r,12,2q,2r,1n,1i,1j,1d,1t,2d,1a,19,2s,2t,2k,2u,15,15,18,2f,1h,1k,1k,18,18,16,17,2j,2v,2w,s,w,18,2x,2n,2t,s,2y,s,u,2y,s,2z,t,r,30,s,s,s,16,2c,18,18,1q,1d,2f,2e,1h,1i,2b,1h,1m,2f,1q,1f,1g,1s,1l,1r,1l,1q,31,31,31,1v,1w,1w,32,33,24,34,35,36,37,38,39,1g,1h,j,3a,g,29,33,3b,3c,32,22,h,3d,1c,1g,1c,1l,1i,g,1h,1l,1m,2f,3e,3f,3g,i,3h,3i,j,3g,39,3j,1y,3k,1z,d,a,24,d,e,3l,3m,3n,20,3o,3p,3q,3r,3s,3t,3u,3v,3w,3x,3y,3z,40,41,42,43,42,44,3z,45,46,47,45,48,49,49,4a,4b,4c,4d,4e,4f,4g,4h,4i,4j,4k,3x,4l,4m,4n,4o,4p,4q,4r,4s,4t,4u,4v,4w,4x,4y,4z,50,51,52,53,54,55,56,57,58,59,5a,5b,5c,5d,5e,5f,59,5g,5h,5i,5j,5k,5l,5m,5n,5o,5p,5q,5r,5s,5s,5t,5u,5v,5w,5x,5y,5z,5z,60,4q,61,62,63,63,63,63,4u,64,65,60,63,66,67,68,69,6a,6b,6c,6d,6e,6f,6g,8,6g,6h,3o,3c,6i,6j,6k,6l,3l,a,6m,23,38,2h,6n,6n,2d,2k,2r,12,2j,1b,1b,6o,1s,6p,3l,a,23,1t,1m,11,2y,t,2m,15,3a,3e,3e,3e,3e,3e,3e,6q,6q,6q,1o,1o,1o,1t,3e,2f,2f,6r,6r,2f,2f,2f,1j,3e,g,2i,24,1y,3o,3n,6s,6t,6u,6m,6v,6w,6h,3n,6x,3l,26,6x,3,6y,6z,70,24,6j,39,35,71,6k,6y,72,4,3q,3q,73,74,75,6c,76,3,3s,48,74,77,4k,52,78,79,7a,7b,7c,7d,7e,7f,7g,7h,7i,7j,7k,7l,7m,7n,7o,7p,5y,5y,7c,5z,7q,7r,60,7s,7t,7u,7h,7v,5y,7w,7x,7y,7z,7q,80,81,81,7,82,4v,67,83,80,4n,84,85,42,86,52,87,88,89,4y,89,4m,8a,8b,88,8c,5,3u,4n,3t,8d,82,8e,8f,8g,8h,8i,8j,8k,8l,8m,8e,8n,7v,8o,4v,4v,8e,8p,8q,8r,8s,8t,8u,7i,8v,55,8w,8x,7d,7c,7c,82,8y,8z,7y,90,91,92,91,93,54,94,93,95,8u,96,97,98,7h,99,9a,55,9b,4r,5u,9c,9d,9e,9f,9g,9h,9i,9j,9k,9l,9m,9n,9o,8t,9p,9q,9r,9s,54,99,8h,8j,9t,9u,9v,9w,9x,9y,9g,9z,a0,a0,99,a1,a2,5r,9x,a3,a4,a5,a6,59,5d,a7,a8,a9,aa,a9,ab,ac,ad,ae,af,ag,ah,ai,aj,ak,al,am,an,ao,ap,a9,aq,5i,ar,as,at,au,av,aw,ax,ax,ay,az,b0,b1,b2,b3,b4,7t,9f,b5,5t,b6,b7,b6,b5,b8,b9,7g,ba,8r,bb,9a,bc,bd,9p,7t,7k,8l,b3,99,ba,8q,be,8e,bf,7s,bg,9u,bh,bi,bj,8p,4r,4s,67,52,62,8a,bk,b7,7p,bl,bm,bn,9g,bo,7e,bp,bq,br,bs,bt,bu,bv,bw,bx,bp,by,by,bz,c0,c1,9y,c2,c2,bm,9u,b2,c3,c4,bh,c5,c6,c6,bq,c7,a6,9y,bx,c8,bp,c9,ca,cb,a6,a4,c1,c3,bs,c4,cc,bs,c5,9x,b2,cd,ce,ce,cf,cg,7p,bn,c3,5f,bq,a6,bx,ch,9u,ci,cj,ck,cl,9c,7t,54,cm,cn,5v,co,8t,cp,cq,8f,cr,cs,9p,ba,ct,cu,cv,7x,cw,8x,a1,57,8v,cs,cx,7k,cy,54,cz,9j,bv,bi,d0,d1,bu,b9,d2,be,8k,d3,4w,7x,95,8n,d4,7r,8p,8l,9k,7x,8w,8u,8f,9p,cy,d5,bd,8l,9o,d6,d7,b9,cy,5v,d8,7g,d1,8j,cj,9d,d9,9c,ct,5r,da,9t,db,8j,d9,cn,cx,dc,dd,cp,de,df,5r,d9,dg,dh,7p,5s,b4,9h,bt,df,di,da,dj,5s,a0,a0,bp,7p,bs,bn,da,dk,dl,ci,da,ci,9i,9t,bt,bx,5r,dm,b6,9w,bj,b3,b3,dn,97,db,db,ce,do,bs,dp,dq,cf,dr,5c,ds,dt,du,dv,dw,bz,do,c9,9x,a4,dv,dx,dv,dy,c4,9x,dz,e0,e1,e2,e3,e4,e5,e6,e7,e8,e9,ea,am,ap,ap,5h,eb,ec,ap,ed,ee,ef,eg,eh,ei,ej,ek,eg,eb,5h,el,em,5g,ay,en,eo,ep,eq,er,es,eo,et,eu,ev,ew,ex,5n,ey,ez,f0,f1,f2,f3,f4,f5,f6,f7,f8,7n,f9,fa,fb,fc,fd,fe,ff,fg,fh,fi,fj,fk,fl,f8,fm,fn,a8,fo,fp,fq,fr,fs,ft,fu,fv,fw,fw,fx,fv,fy,fy,ai,fz,g0,g1,g2,g3,g4,g2,g5,g6,g7,g8,g9,ga,g4,gb,gc,gd,ge,gf,gg,ar,fr,gh,f5,ey,ev,ee,gi,gj,gk,gl,gj,gm,ao,gn,b0,al,go,gp,du,gq,gr,c7,gs,cd,gt,gu,gv,c8,gt,el,gw,gx,gx,9g,9u,98,ca,df,by,ce,gt,gt,gy,gz,h0,h1,c1,do,gr,c8,7p,a2,b5,58,c6,b6,h2,cl,h3,9d,8g,99,cl,b8,h4,5u,9i,5u,dn,cj,h5,8f,7t,h3,h6,h7,cz,9c,dn,ci,h8,9v,h9,h4,a1,9s,7g,cl,5u,5u,ha,ck,dg,dd,dd,hb,hc,hb,7g,bb,8k,hd,he,hf,7x,hg,hg,9a,hh,cv,hi,hj,7v,7v,hk,9l,hh,92,cw,7k,5x,9o,65,94,8e,64,63,67,80,hl,hm,hn,4n,84,4y,7,ho,3x,hp,7z,4y,hq,84,4y,81,68,53,3t,3t,69,3w,4k,3w,75,4a,49,hr,4k,40,6f,4e,4f,3,hs,76,4j,4j,4h,6g,4c,4b,ht,ht,41,hu,4g,hv,hw,hx,hy,hz,6w,6u,i0,6m,i0,6w,i1,71,i2,i3,i4,6m,6k,i5,i6,i3,3p,i7,71,i8,i9,3y,41,77,73,46,ia,ib,44,4c,4h,ic,id,ie,if,i2,3,4e,ib,ig,hv,ih,ii,ii,hw,ih,i1,1,41,4c,ij,ik,5,8,1,0,ig,4f,il,4g,if,im,i7,6y,in,im,io,i6,72,ip,6h,if,if,hy,72,6m,if,id,26,26,i3,ii,2,4j,iq,i2,i1,in,26,3n,3l,3m,21,21,1y,1w,36,3f,3f,2i,l,6n,1f,2d,2m,2h,3j,ir,1z,37,ip,6z,6u,ip,ie,72,i3,hw,2,i1,i7,3p,f,1o,is,27,6d,77,3,3y,it,0,4f,iu,40,53,4l,iv,iw,3u,3u,ix,6b,6b,8y,iy,iz,8a,3r,4j,3q,i0,im,j,i,71,hz,iq,20,j0,4g,6v,6v,73,8a,hq,86,4m,88,4v,63,82,4t,92,9k,hd,j1,j2,9a,7x,j3,hg,j4,j5,bc,9m,7j,8v,b9,bs,ha,8x,hd,j6,8x,cv,j7,8n,j8,he,j9,j6,ja,7s,jb,7r,64,j7,64,j6,8k,8n,jc,9k,jc,j1,64,7w,4v,89,jd,jd,4y,84,je,88,84,88,50,jf,jg,45,jf,3t,jh,42,74,ij,5,44,4a,44,5,3,6c,j0,6f,il,6f,41,4a,3,76,ik,ji,8d,41,ji,44,6f,3y,3r,4d,4k,3s,ij,77,iu,4e,3y,4,ji,8,4a,8d,3s,jj,74,6,46,jk,8c,8c,4a,4a,ij,40,jl,3v,8y,69,53,hq,jm,hn,81,81,83,7q,7a,jn,jo,7y,hl,8b,iw,4y,85,81,4m,jp,hm,85,84,4z,49,46,69,3v,hr,81,50,ix,jq,hq,jr,js,hm,hn,4l,7b,83,88,ho,4y,hq,3u,hr,42,46,3t,51,jk,3t,jh,ij,8c,4d,4c,jt,4h,ic,1,hu,hz,hz,0,ig,j0,j0,6c,6e,ju,jv,6b,5,3r,44,4a,ji,1,1,ig,jt,i9,hw,ih,hw,i8,in,i3,jw,hv,hv,71,in,in,6m,6m,i5,3n,6z,72,in,in,jx,3o,ie,ii,71,if,3q,4,hu,6u,hw,hy,ic,4i,j0,44,6f,0,0,8c,41,3w,jk,4k,jf,3x,jf,3u,51,47,3t,40,ij,4c,ia,4b,5,4a,ib,ia,ij,40,40,jp,4z,3u,iz,46,iz,46,47,3x,42,3u,3x,86,hm,hm,69,52,73,74,46,46,47,jr,3x,8y,77,40,6b,3y,4i,3,6f,76,jy,4i,6c,6c,ig,6f,6f,j0,4h,6d,hu,6c,ig,hs,4j,76,ig,4e,jt,6e,3s,74,ht,74,48,8y,8y,3w,8c,ib,ib,4a,3z,8c,3w,4k,iy,51,8y,3t,42,53,53,ix,iz,77,jk,ij,4k,ia,jv,3w,48,8d,ia,ib,74,51,49,51,49,78,4n,jz,hm,je,je,je,89,hm,hn,4m,jp,3v,51,46,jl,48,6,52,iy,6,48,ij,3t,hr,46,iz,53,53,jz,k0,69,43,hr,69,73,jj,jh,8a,jj,75,4,4,ju,jv,ju,4b,ib,it,6e,6e,4c,ji,5,ia,5,3y,6f,jt,ji,3s,8c,6f,3y,4c,3y,3,3y,5,ik,jy,4j,jy,4j,il,hz,1,3,4f,ic,6g,iq,hw,4g,if,jw,id,k1,i1,jx,if,il,4g,i0,2,i1,2,i8,k2,i0,4g,hy,if,6h,6h,k3,ie,jx,i2,i4,i6,io,3m,3l,3l,70,1z,6p,37,37,20,6h,ii,if,ie,k4,i3,k5,jx,i6,25,3m,k6,e,70,21,6p,e,k6,24,20,6s,21,d,24,b,f,36,is,24,22,33,1x,j,g,6n,1e,k,3g,1v,ir,h,k7,j,1o,1h,3e,2l,3g,k8,3i,j,l,k8,k9,38,1x,28,3g,ir,3g,31,3d,3d,2g,1t,2e,1h,1q,1q,1k,1r,1n,2j,2c,10,1p,1d,1k,1d,2c,1c,19,2s,16,15,12,2r,2d,y,14,14,11,t,t,12,v,t,13,u,v,z,14,18,2s,18,1m,2e,1m,1h,1h,1i,6n,6n,2b,6o,1t,3i,3g,1u,3g,31,3g,3h,1u,3i,k,m,1q,1o,k,6o,1g,1a,1a,1r,1j,1l,3d,2g,h,3g,k8,3i,33,33,23,22,ka,32,1y,3b,1z,kb,23,3j,3k,kc,kd,3k,37,a,21,e,6l,i5,25,35,ke,3o,3o,6l,f,3b,a,24,is,37,kf,kb,kg,1y,33,kh,39,39,22,22,39,k7,ki,3j,3j,22,23,36,32,3h,kg,b,70,1z,3k,ka,33,3f,3f,kg,37,kd,70,k6,i5,ip,ip,27,9,3n,3n,9,6z,k4,ie,6t,im,6z,i3,if,26,i3,6h,k4,jw,jx,6u,6u,jw,26,id,71,k5,6x,jw,iq,hy,4g,6m,4g,i8,i0,i0,4h,ic,kj,2,6m,k3,k4,id,i4,6x,ie,6h,6x,6t,6i,3o,i6,3p,ie,jx,i7,ie,6k,jw,i3,i7,i5,3o,i7,ip,ke,k6,3n,6h,jw,i3,k3,i1,4g,ii,hw,jx,3p,ke,im,6x,26,6t,26,id,6h,9,3o,i7,i6,i7,i5,27,26,i6,6t,jx,6m,if,i4,i1,ii,4g,iq,i1,iq,kk,kj,il,hz,4i,6e,3y,ji,5,5,4a,4c,4a,it,ji,4d,4,iu,6e,3s,4a,4d,6b,3w,4k,ij,77,4k,42,iy,74,48,ij,41,jk,8a,jl,jk,6e,6f,4f,4e,hs,76,hs,6f,it,5,4i,ia,ht,41,8d,8d,ij,8d,8c,44,4,4,4c,6f,j0,jt,ic,hz,hu,3q,4j,76,6f,76,jt,ig,ic,il,hu,iq,k1,hv,i1,k1,k2,hx,hx,kk,2,i9,hx,i9,hy,4j,kj,6g,6d,6g,i0,if,i4,6m,k3,6h,6x,ie,6v,6t,6v,26,26,in,26,ie,6m,i4,ih,k1,6u,i2,6u,i1,hv,iq,kk,6g,6d,i2,i8,k2,6w,iq,6w,kk,ic,il,hu,6g,hy,i0,k1,if,ih,i4,hw,4g,hv,iq,i8,il,6d,hz,hz,0,6c,jy,4h,il,ic,6d,hy,k2,hx,2,iq,i2,iq,k5,k4,72,6m,i0,i1,i8,hx,hx,k1,hw,kj,4g,4g,6g,4j,jt,hs,hs,hs,jt,jy,4i,ji,8d,77,77,77,52,45,3w,75,48,48,3t,3u,3u,52,6,73,jl,8y,3v,6a,k0,49,8d,3r,ij,49,43,47,3v,4z,89,95,jo,cv,60,7d,63,hp,hp,bc,96,kl,d2,gr,km,9o,4w,8n,8p,cu,9o,54,7h,4t,7b,4z,4l,5r,gv,ct,jm,88,hq,hq,hm,73,52,86,46,hr,3v,iy,46,4m,45,3v,6a,3x,3v,3v,jg,iz,k0,86,hq,hq,hq,jz,jr,jz,jz,84,84,7b,7b,je,hm,88,kn,kn,68,68,4l,4x,ho,ix,3u,jf,jf,46,46,jp,4m,86,86,52,52,50,78,iz,iz,4n,4n,87,87,hq,hq,jg,jg,jq,7,81,81,hq,4m,4m,iz,k0,k0,3v,3v,jf,jf,jl,jl,3s,4b,8d,ht,ht,ht,41,ik,4a,hs,ig,6c,6c,4e,jy,j0,4j,4j,ic,hs,hs,3,4c,iu,4,iu,76,jt,1,4j,jy,4f,4f,4f,iu,4c,44,ju,ik,5,iu,8,4e,4e,6f,6e,iu,0,3,jt,ji,4c,4c,4f,76,jy,4i,4i,4i,3z,3z,4,iu,4i,4f,4f,hs,4e,hs,8,ig,1,hu,hx,i8,hx,6w,ii,hw,ii,6w,3q,0,0,i9,6c,3,3,3s,3s,75,75,ib,jj,iy,73,73,8y,jv,jv,8d,8a,8a,ic,4g,4g,jx,jx,4g,k2,6g,8,il,hv,il,kj,kj,e,a,a,ka,6s,ke,ke,70,6y,d,k6,kd,b,3b,kd,6i,6v,3l,1z,1z,34,b,kd,b,is,kc,kc,kc,1x,32,3h,3h,c,1x,ko,ko,kh,kh,kd,kd,6j,6y,6y,ip,ip,kb,kb,3c,6t,6t,is,kh,3f,3f,kg,3j,ir,kg,39,ko,ko,3j,kb,kf,kf,is,ki,i,c,28,28,k7,k7,3j,6q,6q,6q,c,1v,1x,3a,h,28,h,h,3i,31,31,1u,ir,3j,3f,3f,ka,1y,36,36,36,23,b,70,70,kp,b,b,kg,kg,1y,1y,1y,28,i,3g,3g,3g,3j,22,kc,kc,is,1z,kq,kq,22,kb,3k,3k,39,kf,kf,39,1y,kb,kb,kb,kf,kf,33,33,kc,kc,kq,3b,kc,kc,37,37,kd,kd,kd,is,f,23,3f,3f,3k,36,3f,3f,36,37,kq,kq,3k,kb,k7,kf,kf,33,i,k7,32,1w,1w,33,33,33,1x,1x,1x,ka,ka,k7,1x,33,ka,1w,1w,1w,1v,1v,c,c,3g,3h,3a,38,2b,2b,m,2a,2a,2a,g,k8,38,38,k9,l,2h,2l,2b,2b,2f,1j,1p,1p,1n,y,p,p,2k,2k,1d,1d,1p,2j,2s,16,16,2s,18,18,1j,1j,1p,1p,1p,1p,1b,1b,1d,1p,18,2d,10,15,w,2y,2u,kr,2u,2y,ks,2n,30,kt,kt,kt,1b,k,2f,2f,2f,k,1g,2b,2a,38,k9,3e,2f,1k,1j,1j,1e,1j,1a,1k,1c,1s,1s,1n,2f,2f,2c,2d,2c,17,1e,1r,1c,1n,17,17,w,ku,v,2m,2q,13,13,kv,kv,kw,kx,ky,2w,kz,l0,ky,2o,l1,ks,l2,r,q,o,o,2y,2y,2y,kv,kv,kv,q,t,y,12,x,x,11,x,14,2x,z,10,ku,2p,2n,2r,2r,x,p,z,z,12,12,v,11,2r,6r,2s,2q,10,10,10,10,x,11,z,11,2m,r,x,11,q,q,q,q,n,1f,1h,2e,1o,1o,6n,m,2l,31,31,c,c,h,ka,kb,kg,1w,k7,kb,is,1z,1z,is,is,kg,kg,1y,39,kc,kc,22,kb,33,3k,3k,3f,3f,39,39,37,37,kb,24,24,kb,is,is,kc,36,36,3f,33,33,kh,kh,3f,kh,1x,kh,kh,kg,is,f,24,34,34,34,kc,kc,kc,kf,kc,kq,kp,kp,6s,d,24,3c,3m,i5,3n,6p,6p,20,6s,d,37,37,3k,3k,kp,6j,3n,io,io,6l,3n,ip,3p,3n,3m,kd,1y,1w,1w,3j,3j,36,29,29,6o,1l,2b,m,1a,17,17,1s,g,g,2b,3g,22,32,3f,3f,3f,b,6j,6v,6v,k3,k3,4h,1,6g,4h,6w,k2,i2,hw,ih,i2,6h,6u,6u,6w,6w,6d,6d,kj,kj,kj,id,jx,jx,k4,ke,ip,6t,in,in,in,72,9,3p,27,6l,6l,9,k3,6k,6y,3c,6i,25,25,kd,21,e,3l,3l,kq,36,34,kc,kh,kh,1u,2i,28,28,3d,k9,k9,h,3i,ir,ir,h,3k,d,kp,6j,6j,37,36,kq,20,6j,kq,24,1z,34,21,k6,25,25,6p,6y,27,27,6i,3l,24,3c,3c,20,3l,3l,25,6p,6p,a,6p,25,3o,3o,25,ke,3l,35,6p,21,21,27,im,9,6t,6t,25,3l,im,6y,6y,35,35,35,35,e,e,36,kd,kd,6p,d,21,3m,3m,34,1z,70,23,f,f,kc,is,d,a,21,6s,d,d,d,d,is,f,kd,d,70,b,1z,kp,3l,3l,3m,6p,a,a,kd,34,b,23,39,39,3f,3f,39,22,22,is,b,6j,b,1z,f,3b,3c,3c,1z,24,kq,34,34,34,kd,kc,kc,kc,d,kd,kc,kc,kc,6j,21,3c,3l,3n,25,3l,kq,b,b,d,b,1z,1z,32,39,39,kq,23,is,is,34,a,23,kc,22,3k,39,34,34,d,f,1y,1z,37,ir,ir,kh,70,6s,6l,3n,io,25,6p,6l,20,kp,kp,e,e,e,e,kc,kc,6p,6p,37,f,ko,ko,22,1y,22,23,23,1w,3g,k7,kh,3j,ki,28,ir,3f,24,hx,54,54,js,l3,is,kq,6l,6l,ju,l4,3,3,3o,25,ie,i1,i1,hv,6w,6w,26,6p,f,36,kh,ka,ka,3h,3g,6q,29,g,g,1v,i,i,6q,3g,h,3h,1x,1x,33,33,39,39,k7,1y,3f,1w,33,c,c,k7,ka,c,6q,28,3g,ki,22,kh,kh,22,22,22,1y,1y,ka,3f,kg,kc,37,36,39,1y,1y,kb,22,22,kg,kh,kh,kf,kh,kh,ka,kf,kh,1y,kh,37,3k,36,kh,kh,kf,3f,is,kc,kc,37,3k,1z,f,is,is,is,6j,f,3c,d,d,a,6j,a,34,b,k6,34,b,d,70,a,b,3b,3b,f,f,3b,3b,is,is,ko,3f,22,39,kh,kb,kb,32,kg,kg,1y,kh,kg,39,kf,ko,36,34,a,6j,b,kd,6j,6j,6j,70,kp,70,6j,70,a,d,d,b,b,d,b,3c,kq,kc,3b,1z,d,1z,f,34,3c,3l,6s,6j,kp,3m,35,e,70,25,ke,9,6h,3p,6z,jw,k5,6l,i5,9,6t,i7,6z,3o,3o,6z,jx,jx,6t,3o,6t,6k,in,9,ii,ii,i1,i1,hz,3y,ia,ia,jr,8a,js,js,jq,jk,jk,6a,6a,4z,52,52,jr,45,jg,jp,4m,4m,jl,4c,1,1,kk,6d,6d,jx,35,3p,3p,3j,39,ka,is,kd,34,34,in,i1,hv,hv,i3,i3,25,25,6s,e,1z,3c,kg,33,3a,k9,6q,c,3h,3f,k7,1v,1v,h,1w,1w,32,ka,37,ka,is,is,i5,48,3n,3n,3b,3b,ko,3k,23,34,34,3b,kd,ko,ko,kh,3j,ka,1w,1w,32,32,3f,ka,3h,c,3j,k7,3j,3j,kh,kh,3h,31,k9,1v,29,29,k9,6q,6q,h,h,28,h,k9,k9,ki,c,ki,k7,33,1w,c,1v,33,32,32,1u,3g,i,1w,1w,h,3i,2g,2g,3e,2h,l,6o,2h,2h,2b,2l,3d,2h,1t,1i,2e,2e,m,1o,l,1g,1h,1m,k,6o,g,k9,k9,29,29,3d,1t,1h,1g,m,1g,1s,1e,1e,1a,2f,6n,n,16,1n,1j,2j,19,1k,1q,1a,1d,1l,1s,2a,2e,2f,1n,1e,1q,1q,6n,1g,k,k8,g,g,i,1x,28,c,1v,kh,33,3j,i,m,31,31,k9,3a,6o,2b,6n,6n,2e,1f,6n,1m,1s,1s,2j,2j,1m,3d,1m,17,2j,1k,m,1g,1s,g,1v,k7,32,k9,kf,kf,kg,37,23,3j,3h,ir,33,ki,29,1u,29,c,j,j,2l,2l,1m,l,2h,l,2e,1r,1j,2f,2f,2f,m,1h,1s,1k,1i,1r,1b,19,2t,2d,19,2s,2d,18,1r,19,2s,2s,6r,1n,10,2d,2c,y,v,w,11,6r,x,ku,2r,11,2x,v,v,2q,ku,13,13,11,w,ku,2k,10,y,x,2r,ku,x,kv,2y,2t,kv,2m,v,2n,ks,11,x,u,2r,v,v,30,l2,2n,2u,30,s,30,2u,l5,2p,l6,l7,l8,2z,2m,2q,ks,2q,2n,l2,2w,2p,kv,p,2x,2q,r,l2,s,30,kt,l6,kv,ku,2x,o,ks,2u,2o,l0,ky,kr,q,13,2m,2t,2u,2y,kv,2y,2u,2w,l9,o,l2,s,l2,l2,l1,q,la,2z,lb,l7,lc,kz,2z,2o,2z,ld,le,la,2n,l6,l9,2p,2n,kv,12,2y,2t,ks,2n,2y,2y,2p,kr,l6,2t,q,13,2m,q,r,2m,w,2c,1e,1s,1n,1j,1d,2s,1d,1e,1o,2g,2h,2a,k,3a,k9,2i,2i,2l,1h,1a,1n,1o,s,2a,1k,2j,ku,1j,1d,2d,l5,l0,lf,kz,ks,ku,2x,2m,ks,kr,ky,lg,p,2q,10,kz,1f,2e,1p,16,1e,1c,1h,3a,34,a,f,ke,6s,ke,6p,21,21,kc,28,1w,1x,28,ka,kh,22,kg,c,31,2b,1d,1a,1e,38,38,is,is,kh,2l,k8,k,6n,2g,2g,k9,1w,28,32,33,32,ir,3f,3f,ir,k,3e,6n,k,3g,kf,3f,22,kf,k7,is,kg,kg,ko,i,3a,g,2g,28,32,kf,3f,ir,kc,im,70,a,if,jw,ie,3q,ba,d6,lh,li,lj,4p,6l,1z,39,3j,3h,33,23,ko,kb,3j,1x,c,c,33,i,6q,3i,3g,2g,29,31,1u,1u,2i,2i,6q,31,2i,2i,2h,3d,2h,38,k8,3i,3a,i,c,28,kh,3f,3j,kf,kb,32,f,d,f,ko,b,3c,a,3b,3b,kq,f,f,34,34,a,b,kc,ko,37,1y,23,f,36,f,6j,20,70,70,d,3l,25,25,27,in,6k,3p,im,27,6i,ip,in,i7,jw,i8,4h,j0,3q,i9,6g,hy,hw,kj,6d,4j,1,6g,6d,4h,0,iu,44,6b,jv,8d,ia,it,iu,44,ju,75,74,3w,77,8c,4d,ia,3r,6f,3,4e,6c,iu,6f,3r,it,4d,3t,48,iy,43,js,ho,7,87,lk,7a,4t,hi,cv,j8,7s,60,4p,89,83,4v,9k,ll,8k,lm,j6,8p,cm,cu,9l,l4,l4,4w,7x,d2,7v,7z,7b,hl,83,4v,7f,94,j4,ln,d4,91,8o,94,8k,j7,9k,61,50,7b,lk,ho,7q,4x,90,8b,je,90,lo,8b,3u,jl,4a,j0,hy,6w,j0,i9,k2,ib,kj,j0,i9,kj,8,3y,3r,hw,k5,6v,jw,0,0,hz,hu,4j,iu,6c,41,41,4n,88,51,47,jm,43,6b,75,77,hr,hr,d3,7x,lp,8s,be,4w,45,8a,ht,it,ik,ib,jl,3v,86,4z,3x,ix,88,78,69,49,js,78,4o,lo,4z,47,js,kn,ix,69,81,4l,hl,ho,66,jb,lq,j7,j8,7s,7s,l4,lr,7f,ls,h5,9r,cy,8r,b4,hc,dn,5f,bh,9t,bk,b4,d5,9e,8j,dk,lt,d0,do,lu,dw,e4,e1,lv,bp,lw,km,lx,h0,ly,lz,bz,br,m0,m1,m2,lu,m3,m4,e9,m5,e8,5g,m6,br,m7,m8,ca,gz,dy,m9,h8,5u,d7,8p,7j,cp,9d,d7,hg,7f,j1,cw,7t,bo,5s,hc,kl,h8,by,di,bq,e0,ma,mb,mc,ea,5a,md,me,mf,mg,mh,lu,gy,a4,mi,ly,e6,mj,5g,mk,ml,mm,eh,mn,mo,mp,et,az,eb,mq,mr,ms,mb,96,b1,mt,me,mu,b0,mv,gq,dr,mf,e0,gy,h6,h6,9h,b4,9j,7t,95,7w,be,8j,bd,9q,h8,bd,7k,7h,mw,hh,4v,43,7b,jo,mx,7r,82,82,86,k0,js,4,4n,4,6m,4l,4l,54,55,7i,9q,7k,9p,8f,9j,9j,cu,8m,5t,9s,89,8d,k0,iz,kn,iv,my,dh,d7,97,d9,7h,mx,8u,9f,bv,iw,ju,4j,k1,kk,4h,4j,i3,k2,6v,id,71,i3,i3,3o,f,6i,i3,ie,20,3j,3k,kg,i,i,1x,3e,1r,2a,3e,3e,2b,l,l,2g,k8,2f,n,2c,1r,6n,31,3i,h,1x,3h,2l,2i,3i,3i,3e,3e,i,2g,2g,l,1e,ku,6r,17,2k,2k,16,2r,w,18,19,2j,1r,1j,1n,1d,1a,2k,t,1k,1e,1l,1d,1l,1d,1k,1d,1r,1i,1q,n,10,x,13,n,1a,n,2c,y,1f,2f,1f,1h,2b,1h,1a,1f,1e,12,1b,18,q,ks,p,w,2j,18,13,2x,15,2s,1j,2j,1t,1q,1i,1a,c,ir,k7,3e,k8,k8,i,3i,g,31,3a,31,3i,3i,2l,2i,j,1v,1v,ir,3h,3g,38,29,6q,g,2h,3d,29,i,kf,kd,3k,1v,ka,i,31,1u,3d,3g,6q,3g,l,2l,3g,3i,k8,1u,33,3g,g,2g,29,3i,3j,3f,22,ka,k9,2l,1y,33,28,28,31,3j,ka,ir,33,k7,kd,kd,i7,26,i5,6l,3l,d,1z,kd,37,3g,i,36,ko,23,im,io,26,i5,3m,3c,k7,15,1j,k7,k7,1v,1w,kc,f,c,g,28,3j,3j,ka,1y,33,kh,28,31,3j,3f,2i,3a,k,2b,1g,k,3d,h,3d,k8,k8,k9,3i,28,31,6q,1u,3a,3k,kh,3j,3p,3p,6i,mz,3p,ko,kc,33,2a,1n,2g,1u,6n,6o,1s,1d,1n,10,n,18,2r,ks,ks,2n,2o,lc,ld,l7,l8,l9,kw,n0,l5,n0,2o,la,n1,n2,lc,la,l0,n3,n3,kx,n4,n5,n6,n3,l7,l9,l7,l8,n7,n2,lb,n3,2z,l5,2q,kv,l9,30,2m,2x,kw,n8,lg,n6,l8,2w,lb,2z,2w,ky,n7,2v,l7,l2,kt,kr,la,12,w,10,6r,1p,1b,1p,n,1o,3d,2i,2i,j,ki,1a,1m,1l,t,kv,31,6q,1i,1h,2l,1v,k7,39,kb,ka,3i,2h,k,3d,6q,1v,2g,31,l,1k,2d,16,16,18,l,3e,1e,1r,n,18,y,15,12,1d,2j,15,15,y,2x,r,2r,w,v,2m,2m,x,13,2r,18,1c,1j,1d,10,n,1j,1p,ku,u,2j,11,v,13,ku,ku,2s,16,19,6r,2j,2j,2j,1f,1e,1g,2e,1q,1l,3e,1v,c,ki,29,i,1x,kf,kh,g,j,j,2h,1s,2e,2b,1k,1d,u,2n,2n,2x,2k,ku,6r,u,6r,u,le,n9,kw,s,kz,na,na,p,2d,1b,l5,17,18,1o,37,6o,1y,i5,6h,6h,e,1z,kh,34,3k,e,3b,3b,3m,6i,23,36,70,6i,35,is,34,b,f,6h,jw,k2,jw,ib,1,4h,iu,ht,52,8y,43,8a,ep,52,8,8,jy,kj,jw,k4,3m,kq,i7,3p,6y,6k,6v,i4,k2,ji,hr,53,7t,bv,nb,hr,4e,4f,76,8,8,1,3v,52,3v,3v,4k,86,3s,4i,4i,8d,4b,3w,4k,6f,it,iu,jt,4f,4i,6b,3y,ik,3w,ik,ji,jt,jx,6d,k3,iq,6t,3p,1z,6l,3m,3m,23,k7,b,io,3m,k6,35,9,k6,3n,27,6y,i5,6t,6k,3o,70,b,6i,3o,3c,kq,3o,20,24,ko,3c,37,39,ko,ir,25,kb,32,3b,i,3b,3b,i3,20,6u,i7,9,27,27,9,ke,35,im,im,3o,k6,3l,6y,ip,6k,jx,k1,6u,6u,6l,k6,25,35,3m,k6,d,a,3c,is,d,6j,e,21,e,kq,34,1y,d,b,23,39,kc,3f,3f,kg,kc,3b,kc,33,3c,3l,e,35,3m,is,22,ko,3c,6s,i5,35,is,3b,ko,kc,d,3b,kq,3m,im,6v,i5,6v,6v,ie,3p,3b,3b,3k,kb,kg,i,a,6z,k5,26,ip,i7,k3,in,6m,iq,72,ie,ih,kj,3q,1,6w,6w,if,kj,6d,iu,ji,ht,8d,8c,ix,61,je,80,jm,lq,lq,84,4n,3t,4d,76,hv,hy,hs,hv,i9,k4,6k,3t,52,4,kg,36,35,kd,23,3b,3c,25,kd,6p,4,4p,dw,nc,nd,ne,gi,nf,9w,52,6b,bk,mx,51,3p,3n,3p,i3,im,25,d,20,6i,25,a,6j,1z,a,a,35,23,3b,35,3p,k6,6i,6t,3o,21,ke,3m,ip,kp,1z,3b,1z,a,a,kc,kc,a,ko,kp,70,1y,1y,ki,kb,kb,1y,1y,k7,22,3f,kh,i,k9,3j,33,3g,ki,28,1x,3k,kh,33,kh,kg,f,kc,kb,is,6s,27,3n,ke,kd,35,25,kp,26,6s,24,24,k6,e,35,3n,6t,6l,6p,6p,35,3p,k6,6l,6i,i5,ip,9,6x,26,26,26,i6,25,25,io,32,3k,3f,39,3k,kh,39,39,kq,kd,23,28,i,6q,i,h,22,ka,3g,3g,1u,3j,kb,kg,kg,kb,kf,kg,1z,1z,kg,3k,33,22,is,kg,3b,3b,kc,34,kd,3b,22,3f,k7,36,24,3c,3b,24,kq,3b,6p,3c,ip,25,3n","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-7c8b1bbe","guard":[["not",["hasAny",["19970117","19970214","19970402","19970404","19970425","19990419","19991112","20001011","20010105","20020115","20021002","20030116","20030501","20030826","20031201","20040115","20040924","20041001","20050909","20051115","20060210","20060323","20060620","20070430","20070820","20080115","20080630","20081024","20090401","20090414","20090417","20090514","20090612","20090630","20091105","20091231","20100122","20100301","20100512","20100630","20100715","20100716","20110401","20110815","20120130","20120217","20121030","20130415","20130426","20140110","20140211","20140218","20140312","20140627","20140630","20150109","20150527","20150612","20150615","20150715","20150901","20151016","20151127","20160129","20160412","20160617","20160630","20160812","20161014","20161209","20170106","20170215","20170411","20170501","20170623","20170630","20170908","20171124","20171215","20180119","20180815","20181127","20181228","20190522","20190621","20190701","20190718","20190724","20191011","20191015","20191127","20200130","20200214","20200406","20200417","20200421","20200522","20200527","20200603","20200630","20200710","20200720","20200730","20200731","20200902","20200903","20200915","20201029","20201119","20201203","20201231","20210115","20210129","20210209","20210304","20210416","20210511","20210607","20210909","20211001","20211025","20211026","20211118","20211220","20220110","20220128","20220131","20220207","20220210","20220216","20220302","20220311","20220323","20220407","20220429","20220607","20220610","20220630","20220725","20220923","20230106","20230302","20230720","20240321","20241115","20250207","20250328","20250415","20250422","20250609","20250630","20250815","20250829","20251117","20260218","20260601","20260917","add","angeles","china","close","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","makes","national","open","phoenix","rate","recovered","smaller","sp500","sum","temp"]]]],"pyramid":["render.template",{"lit":["The price of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger price."]},["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-5fa5a6cc","guard":[["not",["hasAny",["19970117","19970214","19970402","19970404","19970425","19990419","19991112","20001011","20010105","20020115","20021002","20030116","20030501","20030826","20031201","20040115","20040924","20041001","20050909","20051115","20060210","20060323","20060620","20070430","20070820","20080115","20080630","20081024","20090401","20090414","20090417","20090514","20090612","20090630","20091105","20091231","20100122","20100301","20100512","20100630","20100715","20100716","20110401","20110815","20120130","20120217","20121030","20130415","20130426","20140110","20140211","20140218","20140312","20140627","20140630","20150109","20150527","20150612","20150615","20150715","20150901","20151016","20151127","20160129","20160412","20160617","20160630","20160812","20161014","20161209","20170106","20170215","20170411","20170501","20170623","20170630","20170908","20171124","20171215","20180119","20180815","20181127","20181228","20190522","20190621","20190701","20190718","20190724","20191011","20191015","20191127","20200130","20200214","20200406","20200417","20200421","20200522","20200527","20200603","20200630","20200710","20200720","20200730","20200731","20200902","20200903","20200915","20201029","20201119","20201203","20201231","20210115","20210129","20210209","20210304","20210416","20210511","20210607","20210909","20211001","20211025","20211026","20211118","20211220","20220110","20220128","20220131","20220207","20220210","20220216","20220302","20220311","20220323","20220407","20220429","20220607","20220610","20220630","20220725","20220923","20230106","20230302","20230720","20240321","20241115","20250207","20250328","20250415","20250422","20250609","20250630","20250815","20250829","20251117","20260218","20260601","20260917","add","angeles","china","close","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","makes","national","open","phoenix","rate","recovered","smaller","sp500","sum","temp"]]]],"pyramid":["render.template",{"lit":["The price of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger price."]},["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-e87b7e73","guard":[["not",["hasAny",["19970117","19970214","19970402","19970404","19970425","19990419","19991112","20001011","20010105","20020115","20021002","20030116","20030501","20030826","20031201","20040115","20040924","20041001","20050909","20051115","20060210","20060323","20060620","20070430","20070820","20080115","20080630","20081024","20090401","20090414","20090417","20090514","20090612","20090630","20091105","20091231","20100122","20100301","20100512","20100630","20100715","20100716","20110401","20110815","20120130","20120217","20121030","20130415","20130426","20140110","20140211","20140218","20140312","20140627","20140630","20150109","20150527","20150612","20150615","20150715","20150901","20151016","20151127","20160129","20160412","20160617","20160630","20160812","20161014","20161209","20170106","20170215","20170411","20170501","20170623","20170630","20170908","20171124","20171215","20180119","20180815","20181127","20181228","20190522","20190621","20190701","20190718","20190724","20191011","20191015","20191127","20200130","20200214","20200406","20200417","20200421","20200522","20200527","20200603","20200630","20200710","20200720","20200730","20200731","20200902","20200903","20200915","20201029","20201119","20201203","20201231","20210115","20210129","20210209","20210304","20210416","20210511","20210607","20210909","20211001","20211025","20211026","20211118","20211220","20220110","20220128","20220131","20220207","20220210","20220216","20220302","20220311","20220323","20220407","20220429","20220607","20220610","20220630","20220725","20220923","20230106","20230302","20230720","20240321","20241115","20250207","20250328","20250415","20250422","20250609","20250630","20250815","20250829","20251117","20260218","20260601","20260917","add","angeles","china","close","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","makes","national","open","phoenix","rate","recovered","smaller","sp500","sum","temp"]]]],"pyramid":["render.template",{"lit":["The price of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger price."]},["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]]],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-67af536c","guard":[["not",["hasAny",["19970117","19970214","19970402","19970404","19970425","19990419","19991112","20001011","20010105","20020115","20021002","20030116","20030501","20030826","20031201","20040115","20040924","20041001","20050909","20051115","20060210","20060323","20060620","20070430","20070820","20080115","20080630","20081024","20090401","20090414","20090417","20090514","20090612","20090630","20091105","20091231","20100122","20100301","20100512","20100630","20100715","20100716","20110401","20110815","20120130","20120217","20121030","20130415","20130426","20140110","20140211","20140218","20140312","20140627","20140630","20150109","20150527","20150612","20150615","20150715","20150901","20151016","20151127","20160129","20160412","20160617","20160630","20160812","20161014","20161209","20170106","20170215","20170411","20170501","20170623","20170630","20170908","20171124","20171215","20180119","20180815","20181127","20181228","20190522","20190621","20190701","20190718","20190724","20191011","20191015","20191127","20200130","20200214","20200406","20200417","20200421","20200522","20200527","20200603","20200630","20200710","20200720","20200730","20200731","20200902","20200903","20200915","20201029","20201119","20201203","20201231","20210115","20210129","20210209","20210304","20210416","20210511","20210607","20210909","20211001","20211025","20211026","20211118","20211220","20220110","20220128","20220131","20220207","20220210","20220216","20220302","20220311","20220323","20220407","20220429","20220607","20220610","20220630","20220725","20220923","20230106","20230302","20230720","20240321","20241115","20250207","20250328","20250415","20250422","20250609","20250630","20250815","20250829","20251117","20260218","20260601","20260917","add","angeles","china","close","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","makes","national","open","phoenix","rate","recovered","smaller","sp500","sum","temp"]]]],"pyramid":["render.template",{"lit":["The price of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger price."]},["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-923962c7","guard":[["not",["hasAny",["19970117","19970214","19970402","19970404","19970425","19990419","19991112","20001011","20010105","20020115","20021002","20030116","20030501","20030826","20031201","20040115","20040924","20041001","20050909","20051115","20060210","20060323","20060620","20070430","20070820","20080115","20080630","20081024","20090401","20090414","20090417","20090514","20090612","20090630","20091105","20091231","20100122","20100301","20100512","20100630","20100715","20100716","20110401","20110815","20120130","20120217","20121030","20130415","20130426","20140110","20140211","20140218","20140312","20140627","20140630","20150109","20150527","20150612","20150615","20150715","20150901","20151016","20151127","20160129","20160412","20160617","20160630","20160812","20161014","20161209","20170106","20170215","20170411","20170501","20170623","20170630","20170908","20171124","20171215","20180119","20180815","20181127","20181228","20190522","20190621","20190701","20190718","20190724","20191011","20191015","20191127","20200130","20200214","20200406","20200417","20200421","20200522","20200527","20200603","20200630","20200710","20200720","20200730","20200731","20200902","20200903","20200915","20201029","20201119","20201203","20201231","20210115","20210129","20210209","20210304","20210416","20210511","20210607","20210909","20211001","20211025","20211026","20211118","20211220","20220110","20220128","20220131","20220207","20220210","20220216","20220302","20220311","20220323","20220407","20220429","20220607","20220610","20220630","20220725","20220923","20230106","20230302","20230720","20240321","20241115","20250207","20250328","20250415","20250422","20250609","20250630","20250815","20250829","20251117","20260218","20260601","20260917","add","angeles","china","close","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","makes","national","open","phoenix","rate","recovered","smaller","sp500","sum","temp"]]]],"pyramid":["render.template",{"lit":["The price of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger price."]},["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-d51e6792","guard":[["not",["hasAny",["19970117","19970214","19970402","19970404","19970425","19990419","19991112","20001011","20010105","20020115","20021002","20030116","20030501","20030826","20031201","20040115","20040924","20041001","20050909","20051115","20060210","20060323","20060620","20070430","20070820","20080115","20080630","20081024","20090401","20090414","20090417","20090514","20090612","20090630","20091105","20091231","20100122","20100301","20100512","20100630","20100715","20100716","20110401","20110815","20120130","20120217","20121030","20130415","20130426","20140110","20140211","20140218","20140312","20140627","20140630","20150109","20150527","20150612","20150615","20150715","20150901","20151016","20151127","20160129","20160412","20160617","20160630","20160812","20161014","20161209","20170106","20170215","20170411","20170501","20170623","20170630","20170908","20171124","20171215","20180119","20180815","20181127","20181228","20190522","20190621","20190701","20190718","20190724","20191011","20191015","20191127","20200130","20200214","20200406","20200417","20200421","20200522","20200527","20200603","20200630","20200710","20200720","20200730","20200731","20200902","20200903","20200915","20201029","20201119","20201203","20201231","20210115","20210129","20210209","20210304","20210416","20210511","20210607","20210909","20211001","20211025","20211026","20211118","20211220","20220110","20220128","20220131","20220207","20220210","20220216","20220302","20220311","20220323","20220407","20220429","20220607","20220610","20220630","20220725","20220923","20230106","20230302","20230720","20240321","20241115","20250207","20250328","20250415","20250422","20250609","20250630","20250815","20250829","20251117","20260218","20260601","20260917","add","angeles","china","close","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","makes","national","open","phoenix","rate","recovered","smaller","sp500","sum","temp"]]]],"pyramid":["render.template",{"lit":["The price of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger price."]},["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-fa92305e","guard":[["not",["hasAny",["19970117","19970214","19970402","19970404","19970425","19990419","19991112","20001011","20010105","20020115","20021002","20030116","20030501","20030826","20031201","20040115","20040924","20041001","20050909","20051115","20060210","20060323","20060620","20070430","20070820","20080115","20080630","20081024","20090401","20090414","20090417","20090514","20090612","20090630","20091105","20091231","20100122","20100301","20100512","20100630","20100715","20100716","20110401","20110815","20120130","20120217","20121030","20130415","20130426","20140110","20140211","20140218","20140312","20140627","20140630","20150109","20150527","20150612","20150615","20150715","20150901","20151016","20151127","20160129","20160412","20160617","20160630","20160812","20161014","20161209","20170106","20170215","20170411","20170501","20170623","20170630","20170908","20171124","20171215","20180119","20180815","20181127","20181228","20190522","20190621","20190701","20190718","20190724","20191011","20191015","20191127","20200130","20200214","20200406","20200417","20200421","20200522","20200527","20200603","20200630","20200710","20200720","20200730","20200731","20200902","20200903","20200915","20201029","20201119","20201203","20201231","20210115","20210129","20210209","20210304","20210416","20210511","20210607","20210909","20211001","20211025","20211026","20211118","20211220","20220110","20220128","20220131","20220207","20220210","20220216","20220302","20220311","20220323","20220407","20220429","20220607","20220610","20220630","20220725","20220923","20230106","20230302","20230720","20240321","20241115","20250207","20250328","20250415","20250422","20250609","20250630","20250815","20250829","20251117","20260218","20260601","20260917","add","angeles","china","close","confirmed","cpi","dividend","fatalities","greater","high","larger","lesser","makes","national","open","phoenix","rate","recovered","smaller","sp500","sum","temp"]]]],"pyramid":["render.template",{"lit":["The price of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger price."]},["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}],{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"},{"lit":"price"}]]],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-natural-gas-daily-4cc47b"},{"lit":"date"}],{"lit":2}]]],"mem":null},
{"id":"n-9fa126b4","guard":[["has","compare"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2011-10-07 versus 2018-09-05: compare their price":"The price of 2011-10-07 is 3.4 and that of 2018-09-05 is 3, so 2011-10-07 has the larger price.","how does the price of 2007-06-01 compare with that of 1999-08-06":"The price of 2007-06-01 is 7.57 and that of 1999-08-06 is 2.69, so 2007-06-01 has the larger price.","compare the price of 2008-03-11 and 2010-07-02":"The price of 2008-03-11 is 9.85 and that of 2010-07-02 is 4.72, so 2008-03-11 has the larger price.","2000-10-23 versus 2010-11-12: compare their price":"The price of 2000-10-23 is 4.82 and that of 2010-11-12 is 3.5, so 2000-10-23 has the larger price.","2007-10-18 versus 2005-11-08: compare their price":"The price of 2007-10-18 is 7.11 and that of 2005-11-08 is 9.15, so 2005-11-08 has the larger price.","2023-03-14 versus 2000-07-19: compare their price":"The price of 2023-03-14 is 2.65 and that of 2000-07-19 is 4.07, so 2000-07-19 has the larger price.","2002-11-19 versus 2020-08-07: compare their price":"The price of 2002-11-19 is 4.25 and that of 2020-08-07 is 2.15, so 2002-11-19 has the larger price.","compare the price of 2005-02-17 and 2016-07-08":"The price of 2005-02-17 is 6.05 and that of 2016-07-08 is 2.8, so 2005-02-17 has the larger price.","how does the price of 2011-06-10 compare with that of 2011-10-07":"The price of 2011-06-10 is 4.72 and that of 2011-10-07 is 3.4, so 2011-06-10 has the larger price.","compare the price of 2005-11-08 and 2011-02-02":"The price of 2005-11-08 is 9.15 and that of 2011-02-02 is 4.55, so 2005-11-08 has the larger price.","2009-07-30 versus 2016-06-06: compare their price":"The price of 2009-07-30 is 3.34 and that of 2016-06-06 is 2.32, so 2009-07-30 has the larger price.","how does the price of 2019-06-14 compare with that of 2008-01-11":"The price of 2019-06-14 is 2.37 and that of 2008-01-11 is 8.13, so 2008-01-11 has the larger price.","2011-09-07 versus 2012-08-21: compare their price":"The price of 2011-09-07 is 3.96 and that of 2012-08-21 is 2.8, so 2011-09-07 has the larger price.","compare the price of 2020-12-28 and 2015-07-16":"The price of 2020-12-28 is 2.39 and that of 2015-07-16 is 2.9, so 2015-07-16 has the larger price.","how does the price of 2010-05-27 compare with that of 2023-09-13":"The price of 2010-05-27 is 4.22 and that of 2023-09-13 is 2.76, so 2010-05-27 has the larger price.","how does the price of 2010-07-02 compare with that of 2016-09-07":"The price of 2010-07-02 is 4.72 and that of 2016-09-07 is 2.77, so 2010-07-02 has the larger price.","compare the price of 2006-06-30 and 2019-11-08":"The price of 2006-06-30 is 5.84 and that of 2019-11-08 is 2.87, so 2006-06-30 has the larger price.","compare the price of 2013-01-30 and 2010-05-27":"The price of 2013-01-30 is 3.24 and that of 2010-05-27 is 4.22, so 2010-05-27 has the larger price.","compare the price of 2012-08-21 and 2002-08-27":"The price of 2012-08-21 is 2.8 and that of 2002-08-27 is 3.47, so 2002-08-27 has the larger price.","2014-10-13 versus 2003-07-28: compare their price":"The price of 2014-10-13 is 3.87 and that of 2003-07-28 is 4.68, so 2003-07-28 has the larger price.","how does the price of 2002-08-27 compare with that of 2010-04-13":"The price of 2002-08-27 is 3.47 and that of 2010-04-13 is 3.97, so 2010-04-13 has the larger price.","how does the price of 2009-08-31 compare with that of 2008-05-22":"The price of 2009-08-31 is 2.42 and that of 2008-05-22 is 11.57, so 2008-05-22 has the larger price.","2023-09-13 versus 2008-05-01: compare their price":"The price of 2023-09-13 is 2.76 and that of 2008-05-01 is 10.66, so 2008-05-01 has the larger price.","how does the price of 2014-02-19 compare with that of 2004-01-26":"The price of 2014-02-19 is 6 and that of 2004-01-26 is 5.7, so 2014-02-19 has the larger price.","how does the price of 1997-12-29 compare with that of 2019-10-09":"The price of 1997-12-29 is 2.33 and that of 2019-10-09 is 2.26, so 1997-12-29 has the larger price.","how does the price of 2026-03-05 compare with that of 2010-07-27":"The price of 2026-03-05 is 2.9 and that of 2010-07-27 is 4.72, so 2010-07-27 has the larger price.","2025-06-24 versus 2019-11-20: compare their price":"The price of 2025-06-24 is 3.3 and that of 2019-11-20 is 2.56, so 2025-06-24 has the larger price.","compare the price of 1997-08-19 and 2019-02-21":"The price of 1997-08-19 is 2.61 and that of 2019-02-21 is 2.73, so 2019-02-21 has the larger price.","compare the price of 2023-09-29 and 2017-03-23":"The price of 2023-09-29 is 2.68 and that of 2017-03-23 is 2.93, so 2017-03-23 has the larger price.","2009-03-10 versus 2024-08-06: compare their price":"The price of 2009-03-10 is 3.88 and that of 2024-08-06 is 1.83, so 2009-03-10 has the larger price.","how does the price of 2009-06-22 compare with that of 2011-12-08":"The price of 2009-06-22 is 4.01 and that of 2011-12-08 is 3.42, so 2009-06-22 has the larger price.","2008-01-11 versus 2013-01-30: compare their price":"The price of 2008-01-11 is 8.13 and that of 2013-01-30 is 3.24, so 2008-01-11 has the larger price.","how does the price of 2022-10-14 compare with that of 2024-11-22":"The price of 2022-10-14 is 6.1 and that of 2024-11-22 is 2.41, so 2022-10-14 has the larger price.","compare the price of 2009-09-04 and 2026-03-05":"The price of 2009-09-04 is 1.83 and that of 2026-03-05 is 2.9, so 2026-03-05 has the larger price.","compare the price of 2020-08-07 and 2011-06-10":"The price of 2020-08-07 is 2.15 and that of 2011-06-10 is 4.72, so 2011-06-10 has the larger price.","compare the price of 2016-06-06 and 2017-10-19":"The price of 2016-06-06 is 2.32 and that of 2017-10-19 is 2.83, so 2017-10-19 has the larger price.","compare the price of 2011-12-23 and 2016-01-21":"The price of 2011-12-23 is 2.97 and that of 2016-01-21 is 2.22, so 2011-12-23 has the larger price.","how does the price of 2019-08-14 compare with that of 2019-07-25":"The price of 2019-08-14 is 2.22 and that of 2019-07-25 is 2.26, so 2019-07-25 has the larger price.","compare the price of 2018-09-05 and 2000-12-12":"The price of 2018-09-05 is 3 and that of 2000-12-12 is 8.58, so 2000-12-12 has the larger price.","2019-07-25 versus 2024-05-08: compare their price":"The price of 2019-07-25 is 2.26 and that of 2024-05-08 is 2.01, so 2019-07-25 has the larger price.","2019-03-06 versus 1997-08-19: compare their price":"The price of 2019-03-06 is 3.18 and that of 1997-08-19 is 2.61, so 2019-03-06 has the larger price.","2007-05-04 versus 2017-05-23: compare their price":"The price of 2007-05-04 is 7.82 and that of 2017-05-23 is 3.22, so 2007-05-04 has the larger price.","compare the price of 2007-10-15 and 2019-09-17":"The price of 2007-10-15 is 7.09 and that of 2019-09-17 is 2.7, so 2007-10-15 has the larger price.","compare the price of 2024-05-08 and 2007-06-01":"The price of 2024-05-08 is 2.01 and that of 2007-06-01 is 7.57, so 2007-06-01 has the larger price.","compare the price of 2025-06-13 and 2014-02-19":"The price of 2025-06-13 is 2.65 and that of 2014-02-19 is 6, so 2014-02-19 has the larger price.","compare the price of 2015-10-30 and 2022-02-09":"The price of 2015-10-30 is 1.98 and that of 2022-02-09 is 4.13, so 2022-02-09 has the larger price.","how does the price of 2016-12-21 compare with that of 2023-03-14":"The price of 2016-12-21 is 3.5 and that of 2023-03-14 is 2.65, so 2016-12-21 has the larger price.","how does the price of 2019-02-21 compare with that of 2018-12-14":"The price of 2019-02-21 is 2.73 and that of 2018-12-14 is 3.99, so 2018-12-14 has the larger price.","how does the price of 2011-02-02 compare with that of 2000-04-07":"The price of 2011-02-02 is 4.55 and that of 2000-04-07 is 2.99, so 2011-02-02 has the larger price.","2020-07-28 versus 2010-09-27: compare their price":"The price of 2020-07-28 is 1.83 and that of 2010-09-27 is 3.8, so 2010-09-27 has the larger price.","2011-05-09 versus 2011-12-23: compare their price":"The price of 2011-05-09 is 4.28 and that of 2011-12-23 is 2.97, so 2011-05-09 has the larger price.","compare the price of 2014-02-05 and 2022-10-14":"The price of 2014-02-05 is 8.12 and that of 2022-10-14 is 6.1, so 2014-02-05 has the larger price.","2010-07-27 versus 2007-12-18: compare their price":"The price of 2010-07-27 is 4.72 and that of 2007-12-18 is 7.16, so 2007-12-18 has the larger price.","compare the price of 2010-11-12 and 2009-07-27":"The price of 2010-11-12 is 3.5 and that of 2009-07-27 is 3.46, so 2010-11-12 has the larger price.","how does the price of 2016-01-21 compare with that of 2007-06-14":"The price of 2016-01-21 is 2.22 and that of 2007-06-14 is 7.48, so 2007-06-14 has the larger price.","compare the price of 2024-07-08 and 2014-02-04":"The price of 2024-07-08 is 2.1 and that of 2014-02-04 is 5.78, so 2014-02-04 has the larger price.","2016-03-14 versus 2020-12-28: compare their price":"The price of 2016-03-14 is 1.68 and that of 2020-12-28 is 2.39, so 2020-12-28 has the larger price.","compare the price of 2008-05-01 and 2023-05-30":"The price of 2008-05-01 is 10.66 and that of 2023-05-30 is 2.11, so 2008-05-01 has the larger price.","compare the price of 2024-08-06 and 2016-12-21":"The price of 2024-08-06 is 1.83 and that of 2016-12-21 is 3.5, so 2016-12-21 has the larger price.","compare the price of 2021-08-16 and 2009-08-31":"The price of 2021-08-16 is 3.93 and that of 2009-08-31 is 2.42, so 2021-08-16 has the larger price.","2008-05-22 versus 2023-09-29: compare their price":"The price of 2008-05-22 is 11.57 and that of 2023-09-29 is 2.68, so 2008-05-22 has the larger price.","compare the price of 2017-05-23 and 2019-06-14":"The price of 2017-05-23 is 3.22 and that of 2019-06-14 is 2.37, so 2017-05-23 has the larger price.","how does the price of 2009-07-27 compare with that of 2011-09-07":"The price of 2009-07-27 is 3.46 and that of 2011-09-07 is 3.96, so 2011-09-07 has the larger price.","2011-12-08 versus 2024-07-08: compare their price":"The price of 2011-12-08 is 3.42 and that of 2024-07-08 is 2.1, so 2011-12-08 has the larger price.","2008-01-24 versus 2014-07-02: compare their price":"The price of 2008-01-24 is 7.85 and that of 2014-07-02 is 4.47, so 2008-01-24 has the larger price.","2000-04-07 versus 2014-02-05: compare their price":"The price of 2000-04-07 is 2.99 and that of 2014-02-05 is 8.12, so 2014-02-05 has the larger price.","how does the price of 2011-11-25 compare with that of 2015-05-11":"The price of 2011-11-25 is 2.84 and that of 2015-05-11 is 2.85, so 2015-05-11 has the larger price.","2004-01-26 versus 2008-03-11: compare their price":"The price of 2004-01-26 is 5.7 and that of 2008-03-11 is 9.85, so 2008-03-11 has the larger price.","compare the price of 2015-02-04 and 2011-11-25":"The price of 2015-02-04 is 2.73 and that of 2011-11-25 is 2.84, so 2011-11-25 has the larger price.","how does the price of 2017-10-19 compare with that of 2025-06-24":"The price of 2017-10-19 is 2.83 and that of 2025-06-24 is 3.3, so 2025-06-24 has the larger price.","2015-05-11 versus 2006-06-30: compare their price":"The price of 2015-05-11 is 2.85 and that of 2006-06-30 is 5.84, so 2006-06-30 has the larger price.","how does the price of 2022-02-09 compare with that of 2008-01-24":"The price of 2022-02-09 is 4.13 and that of 2008-01-24 is 7.85, so 2008-01-24 has the larger price.","how does the price of 2016-07-08 compare with that of 2016-03-14":"The price of 2016-07-08 is 2.8 and that of 2016-03-14 is 1.68, so 2016-07-08 has the larger price.","2024-11-22 versus 2025-06-13: compare their price":"The price of 2024-11-22 is 2.41 and that of 2025-06-13 is 2.65, so 2025-06-13 has the larger price.","compare the price of 2007-12-18 and 2017-12-18":"The price of 2007-12-18 is 7.16 and that of 2017-12-18 is 2.71, so 2007-12-18 has the larger price.","compare the price of 2014-07-02 and 2020-03-19":"The price of 2014-07-02 is 4.47 and that of 2020-03-19 is 1.68, so 2014-07-02 has the larger price.","compare the price of 2000-07-19 and 2008-12-12":"The price of 2000-07-19 is 4.07 and that of 2008-12-12 is 5.56, so 2008-12-12 has the larger price.","compare the price of 2019-11-20 and 2025-10-31":"The price of 2019-11-20 is 2.56 and that of 2025-10-31 is 3.57, so 2025-10-31 has the larger price.","how does the price of 2017-03-23 compare with that of 2019-03-06":"The price of 2017-03-23 is 2.93 and that of 2019-03-06 is 3.18, so 2019-03-06 has the larger price.","2016-09-07 versus 2008-12-19: compare their price":"The price of 2016-09-07 is 2.77 and that of 2008-12-19 is 5.66, so 2008-12-19 has the larger price.","how does the price of 2019-09-17 compare with that of 2007-05-04":"The price of 2019-09-17 is 2.7 and that of 2007-05-04 is 7.82, so 2007-05-04 has the larger price.","2018-12-14 versus 2005-02-17: compare their price":"The price of 2018-12-14 is 3.99 and that of 2005-02-17 is 6.05, so 2005-02-17 has the larger price.","how does the price of 2015-07-16 compare with that of 2020-07-28":"The price of 2015-07-16 is 2.9 and that of 2020-07-28 is 1.83, so 2015-07-16 has the larger price.","compare the price of 2003-07-28 and 2009-06-22":"The price of 2003-07-28 is 4.68 and that of 2009-06-22 is 4.01, so 2003-07-28 has the larger price.","how does the price of 2019-11-08 compare with that of 2009-07-30":"The price of 2019-11-08 is 2.87 and that of 2009-07-30 is 3.34, so 2009-07-30 has the larger price.","2007-06-14 versus 2015-02-04: compare their price":"The price of 2007-06-14 is 7.48 and that of 2015-02-04 is 2.73, so 2007-06-14 has the larger price.","compare the price of 2010-09-27 and 1997-12-29":"The price of 2010-09-27 is 3.8 and that of 1997-12-29 is 2.33, so 2010-09-27 has the larger price.","how does the price of 2008-12-12 compare with that of 2014-10-13":"The price of 2008-12-12 is 5.56 and that of 2014-10-13 is 3.87, so 2008-12-12 has the larger price.","how does the price of 2014-02-04 compare with that of 2002-11-19":"The price of 2014-02-04 is 5.78 and that of 2002-11-19 is 4.25, so 2014-02-04 has the larger price.","2023-06-07 versus 2007-10-15: compare their price":"The price of 2023-06-07 is 2.13 and that of 2007-10-15 is 7.09, so 2007-10-15 has the larger price.","compare the price of 2007-01-24 and 2013-05-06":"The price of 2007-01-24 is 7.58 and that of 2013-05-06 is 3.93, so 2007-01-24 has the larger price.","2019-10-09 versus 2007-01-24: compare their price":"The price of 2019-10-09 is 2.26 and that of 2007-01-24 is 7.58, so 2007-01-24 has the larger price.","how does the price of 2020-03-19 compare with that of 2000-10-23":"The price of 2020-03-19 is 1.68 and that of 2000-10-23 is 4.82, so 2000-10-23 has the larger price.","how does the price of 2000-12-12 compare with that of 2007-10-18":"The price of 2000-12-12 is 8.58 and that of 2007-10-18 is 7.11, so 2000-12-12 has the larger price.","how does the price of 2025-10-31 compare with that of 2023-06-07":"The price of 2025-10-31 is 3.57 and that of 2023-06-07 is 2.13, so 2025-10-31 has the larger price.","2010-04-13 versus 2021-08-16: compare their price":"The price of 2010-04-13 is 3.97 and that of 2021-08-16 is 3.93, so 2010-04-13 has the larger price.","how does the price of 2013-05-06 compare with that of 2011-05-09":"The price of 2013-05-06 is 3.93 and that of 2011-05-09 is 4.28, so 2011-05-09 has the larger price.","compare the price of 2008-12-19 and 2019-08-14":"The price of 2008-12-19 is 5.66 and that of 2019-08-14 is 2.22, so 2008-12-19 has the larger price.","1999-08-06 versus 2015-10-30: compare their price":"The price of 1999-08-06 is 2.69 and that of 2015-10-30 is 1.98, so 1999-08-06 has the larger price.","how does the price of 2017-12-18 compare with that of 2009-03-10":"The price of 2017-12-18 is 2.71 and that of 2009-03-10 is 3.88, so 2009-03-10 has the larger price."}}},
{"id":"n-83d184c4","guard":[["has","compare"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"price"}]]],"mem":{"table":{"of 2007-06-01 compare with that of 1999-08-06":"The price of 2007-06-01 is 7.57 and that of 1999-08-06 is 2.69, so 2007-06-01 has the larger price.","of 2008-03-11 and 2010-07-02":"The price of 2008-03-11 is 9.85 and that of 2010-07-02 is 4.72, so 2008-03-11 has the larger price.","of 2005-02-17 and 2016-07-08":"The price of 2005-02-17 is 6.05 and that of 2016-07-08 is 2.8, so 2005-02-17 has the larger price.","of 2011-06-10 compare with that of 2011-10-07":"The price of 2011-06-10 is 4.72 and that of 2011-10-07 is 3.4, so 2011-06-10 has the larger price.","of 2005-11-08 and 2011-02-02":"The price of 2005-11-08 is 9.15 and that of 2011-02-02 is 4.55, so 2005-11-08 has the larger price.","of 2019-06-14 compare with that of 2008-01-11":"The price of 2019-06-14 is 2.37 and that of 2008-01-11 is 8.13, so 2008-01-11 has the larger price.","of 2020-12-28 and 2015-07-16":"The price of 2020-12-28 is 2.39 and that of 2015-07-16 is 2.9, so 2015-07-16 has the larger price.","of 2010-05-27 compare with that of 2023-09-13":"The price of 2010-05-27 is 4.22 and that of 2023-09-13 is 2.76, so 2010-05-27 has the larger price.","of 2010-07-02 compare with that of 2016-09-07":"The price of 2010-07-02 is 4.72 and that of 2016-09-07 is 2.77, so 2010-07-02 has the larger price.","of 2006-06-30 and 2019-11-08":"The price of 2006-06-30 is 5.84 and that of 2019-11-08 is 2.87, so 2006-06-30 has the larger price.","of 2013-01-30 and 2010-05-27":"The price of 2013-01-30 is 3.24 and that of 2010-05-27 is 4.22, so 2010-05-27 has the larger price.","of 2012-08-21 and 2002-08-27":"The price of 2012-08-21 is 2.8 and that of 2002-08-27 is 3.47, so 2002-08-27 has the larger price.","of 2002-08-27 compare with that of 2010-04-13":"The price of 2002-08-27 is 3.47 and that of 2010-04-13 is 3.97, so 2010-04-13 has the larger price.","of 2009-08-31 compare with that of 2008-05-22":"The price of 2009-08-31 is 2.42 and that of 2008-05-22 is 11.57, so 2008-05-22 has the larger price.","of 2014-02-19 compare with that of 2004-01-26":"The price of 2014-02-19 is 6 and that of 2004-01-26 is 5.7, so 2014-02-19 has the larger price.","of 1997-12-29 compare with that of 2019-10-09":"The price of 1997-12-29 is 2.33 and that of 2019-10-09 is 2.26, so 1997-12-29 has the larger price.","of 2026-03-05 compare with that of 2010-07-27":"The price of 2026-03-05 is 2.9 and that of 2010-07-27 is 4.72, so 2010-07-27 has the larger price.","of 1997-08-19 and 2019-02-21":"The price of 1997-08-19 is 2.61 and that of 2019-02-21 is 2.73, so 2019-02-21 has the larger price.","of 2023-09-29 and 2017-03-23":"The price of 2023-09-29 is 2.68 and that of 2017-03-23 is 2.93, so 2017-03-23 has the larger price.","of 2009-06-22 compare with that of 2011-12-08":"The price of 2009-06-22 is 4.01 and that of 2011-12-08 is 3.42, so 2009-06-22 has the larger price.","of 2022-10-14 compare with that of 2024-11-22":"The price of 2022-10-14 is 6.1 and that of 2024-11-22 is 2.41, so 2022-10-14 has the larger price.","of 2009-09-04 and 2026-03-05":"The price of 2009-09-04 is 1.83 and that of 2026-03-05 is 2.9, so 2026-03-05 has the larger price.","of 2020-08-07 and 2011-06-10":"The price of 2020-08-07 is 2.15 and that of 2011-06-10 is 4.72, so 2011-06-10 has the larger price.","of 2016-06-06 and 2017-10-19":"The price of 2016-06-06 is 2.32 and that of 2017-10-19 is 2.83, so 2017-10-19 has the larger price.","of 2011-12-23 and 2016-01-21":"The price of 2011-12-23 is 2.97 and that of 2016-01-21 is 2.22, so 2011-12-23 has the larger price.","of 2019-08-14 compare with that of 2019-07-25":"The price of 2019-08-14 is 2.22 and that of 2019-07-25 is 2.26, so 2019-07-25 has the larger price.","of 2018-09-05 and 2000-12-12":"The price of 2018-09-05 is 3 and that of 2000-12-12 is 8.58, so 2000-12-12 has the larger price.","of 2007-10-15 and 2019-09-17":"The price of 2007-10-15 is 7.09 and that of 2019-09-17 is 2.7, so 2007-10-15 has the larger price.","of 2024-05-08 and 2007-06-01":"The price of 2024-05-08 is 2.01 and that of 2007-06-01 is 7.57, so 2007-06-01 has the larger price.","of 2025-06-13 and 2014-02-19":"The price of 2025-06-13 is 2.65 and that of 2014-02-19 is 6, so 2014-02-19 has the larger price.","of 2015-10-30 and 2022-02-09":"The price of 2015-10-30 is 1.98 and that of 2022-02-09 is 4.13, so 2022-02-09 has the larger price.","of 2016-12-21 compare with that of 2023-03-14":"The price of 2016-12-21 is 3.5 and that of 2023-03-14 is 2.65, so 2016-12-21 has the larger price.","of 2019-02-21 compare with that of 2018-12-14":"The price of 2019-02-21 is 2.73 and that of 2018-12-14 is 3.99, so 2018-12-14 has the larger price.","of 2011-02-02 compare with that of 2000-04-07":"The price of 2011-02-02 is 4.55 and that of 2000-04-07 is 2.99, so 2011-02-02 has the larger price.","of 2014-02-05 and 2022-10-14":"The price of 2014-02-05 is 8.12 and that of 2022-10-14 is 6.1, so 2014-02-05 has the larger price.","of 2010-11-12 and 2009-07-27":"The price of 2010-11-12 is 3.5 and that of 2009-07-27 is 3.46, so 2010-11-12 has the larger price.","of 2016-01-21 compare with that of 2007-06-14":"The price of 2016-01-21 is 2.22 and that of 2007-06-14 is 7.48, so 2007-06-14 has the larger price.","of 2024-07-08 and 2014-02-04":"The price of 2024-07-08 is 2.1 and that of 2014-02-04 is 5.78, so 2014-02-04 has the larger price.","of 2008-05-01 and 2023-05-30":"The price of 2008-05-01 is 10.66 and that of 2023-05-30 is 2.11, so 2008-05-01 has the larger price.","of 2024-08-06 and 2016-12-21":"The price of 2024-08-06 is 1.83 and that of 2016-12-21 is 3.5, so 2016-12-21 has the larger price.","of 2021-08-16 and 2009-08-31":"The price of 2021-08-16 is 3.93 and that of 2009-08-31 is 2.42, so 2021-08-16 has the larger price.","of 2017-05-23 and 2019-06-14":"The price of 2017-05-23 is 3.22 and that of 2019-06-14 is 2.37, so 2017-05-23 has the larger price.","of 2009-07-27 compare with that of 2011-09-07":"The price of 2009-07-27 is 3.46 and that of 2011-09-07 is 3.96, so 2011-09-07 has the larger price.","of 2011-11-25 compare with that of 2015-05-11":"The price of 2011-11-25 is 2.84 and that of 2015-05-11 is 2.85, so 2015-05-11 has the larger price.","of 2015-02-04 and 2011-11-25":"The price of 2015-02-04 is 2.73 and that of 2011-11-25 is 2.84, so 2011-11-25 has the larger price.","of 2017-10-19 compare with that of 2025-06-24":"The price of 2017-10-19 is 2.83 and that of 2025-06-24 is 3.3, so 2025-06-24 has the larger price.","of 2022-02-09 compare with that of 2008-01-24":"The price of 2022-02-09 is 4.13 and that of 2008-01-24 is 7.85, so 2008-01-24 has the larger price.","of 2016-07-08 compare with that of 2016-03-14":"The price of 2016-07-08 is 2.8 and that of 2016-03-14 is 1.68, so 2016-07-08 has the larger price.","of 2007-12-18 and 2017-12-18":"The price of 2007-12-18 is 7.16 and that of 2017-12-18 is 2.71, so 2007-12-18 has the larger price.","of 2014-07-02 and 2020-03-19":"The price of 2014-07-02 is 4.47 and that of 2020-03-19 is 1.68, so 2014-07-02 has the larger price.","of 2000-07-19 and 2008-12-12":"The price of 2000-07-19 is 4.07 and that of 2008-12-12 is 5.56, so 2008-12-12 has the larger price.","of 2019-11-20 and 2025-10-31":"The price of 2019-11-20 is 2.56 and that of 2025-10-31 is 3.57, so 2025-10-31 has the larger price.","of 2017-03-23 compare with that of 2019-03-06":"The price of 2017-03-23 is 2.93 and that of 2019-03-06 is 3.18, so 2019-03-06 has the larger price.","of 2019-09-17 compare with that of 2007-05-04":"The price of 2019-09-17 is 2.7 and that of 2007-05-04 is 7.82, so 2007-05-04 has the larger price.","of 2015-07-16 compare with that of 2020-07-28":"The price of 2015-07-16 is 2.9 and that of 2020-07-28 is 1.83, so 2015-07-16 has the larger price.","of 2003-07-28 and 2009-06-22":"The price of 2003-07-28 is 4.68 and that of 2009-06-22 is 4.01, so 2003-07-28 has the larger price.","of 2019-11-08 compare with that of 2009-07-30":"The price of 2019-11-08 is 2.87 and that of 2009-07-30 is 3.34, so 2009-07-30 has the larger price.","of 2010-09-27 and 1997-12-29":"The price of 2010-09-27 is 3.8 and that of 1997-12-29 is 2.33, so 2010-09-27 has the larger price.","of 2008-12-12 compare with that of 2014-10-13":"The price of 2008-12-12 is 5.56 and that of 2014-10-13 is 3.87, so 2008-12-12 has the larger price.","of 2014-02-04 compare with that of 2002-11-19":"The price of 2014-02-04 is 5.78 and that of 2002-11-19 is 4.25, so 2014-02-04 has the larger price.","of 2007-01-24 and 2013-05-06":"The price of 2007-01-24 is 7.58 and that of 2013-05-06 is 3.93, so 2007-01-24 has the larger price.","of 2020-03-19 compare with that of 2000-10-23":"The price of 2020-03-19 is 1.68 and that of 2000-10-23 is 4.82, so 2000-10-23 has the larger price.","of 2000-12-12 compare with that of 2007-10-18":"The price of 2000-12-12 is 8.58 and that of 2007-10-18 is 7.11, so 2000-12-12 has the larger price.","of 2025-10-31 compare with that of 2023-06-07":"The price of 2025-10-31 is 3.57 and that of 2023-06-07 is 2.13, so 2025-10-31 has the larger price.","of 2013-05-06 compare with that of 2011-05-09":"The price of 2013-05-06 is 3.93 and that of 2011-05-09 is 4.28, so 2011-05-09 has the larger price.","of 2008-12-19 and 2019-08-14":"The price of 2008-12-19 is 5.66 and that of 2019-08-14 is 2.22, so 2008-12-19 has the larger price.","of 2017-12-18 compare with that of 2009-03-10":"The price of 2017-12-18 is 2.71 and that of 2009-03-10 is 3.88, so 2009-03-10 has the larger price."}}},
{"id":"n-b8a09d4b","guard":[["has","compare"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"2007-06-01 compare with that of 1999-08-06":"The price of 2007-06-01 is 7.57 and that of 1999-08-06 is 2.69, so 2007-06-01 has the larger price.","2008-03-11 and 2010-07-02":"The price of 2008-03-11 is 9.85 and that of 2010-07-02 is 4.72, so 2008-03-11 has the larger price.","2005-02-17 and 2016-07-08":"The price of 2005-02-17 is 6.05 and that of 2016-07-08 is 2.8, so 2005-02-17 has the larger price.","2011-06-10 compare with that of 2011-10-07":"The price of 2011-06-10 is 4.72 and that of 2011-10-07 is 3.4, so 2011-06-10 has the larger price.","2005-11-08 and 2011-02-02":"The price of 2005-11-08 is 9.15 and that of 2011-02-02 is 4.55, so 2005-11-08 has the larger price.","2019-06-14 compare with that of 2008-01-11":"The price of 2019-06-14 is 2.37 and that of 2008-01-11 is 8.13, so 2008-01-11 has the larger price.","2020-12-28 and 2015-07-16":"The price of 2020-12-28 is 2.39 and that of 2015-07-16 is 2.9, so 2015-07-16 has the larger price.","2010-05-27 compare with that of 2023-09-13":"The price of 2010-05-27 is 4.22 and that of 2023-09-13 is 2.76, so 2010-05-27 has the larger price.","2010-07-02 compare with that of 2016-09-07":"The price of 2010-07-02 is 4.72 and that of 2016-09-07 is 2.77, so 2010-07-02 has the larger price.","2006-06-30 and 2019-11-08":"The price of 2006-06-30 is 5.84 and that of 2019-11-08 is 2.87, so 2006-06-30 has the larger price.","2013-01-30 and 2010-05-27":"The price of 2013-01-30 is 3.24 and that of 2010-05-27 is 4.22, so 2010-05-27 has the larger price.","2012-08-21 and 2002-08-27":"The price of 2012-08-21 is 2.8 and that of 2002-08-27 is 3.47, so 2002-08-27 has the larger price.","2002-08-27 compare with that of 2010-04-13":"The price of 2002-08-27 is 3.47 and that of 2010-04-13 is 3.97, so 2010-04-13 has the larger price.","2009-08-31 compare with that of 2008-05-22":"The price of 2009-08-31 is 2.42 and that of 2008-05-22 is 11.57, so 2008-05-22 has the larger price.","2014-02-19 compare with that of 2004-01-26":"The price of 2014-02-19 is 6 and that of 2004-01-26 is 5.7, so 2014-02-19 has the larger price.","1997-12-29 compare with that of 2019-10-09":"The price of 1997-12-29 is 2.33 and that of 2019-10-09 is 2.26, so 1997-12-29 has the larger price.","2026-03-05 compare with that of 2010-07-27":"The price of 2026-03-05 is 2.9 and that of 2010-07-27 is 4.72, so 2010-07-27 has the larger price.","1997-08-19 and 2019-02-21":"The price of 1997-08-19 is 2.61 and that of 2019-02-21 is 2.73, so 2019-02-21 has the larger price.","2023-09-29 and 2017-03-23":"The price of 2023-09-29 is 2.68 and that of 2017-03-23 is 2.93, so 2017-03-23 has the larger price.","2009-06-22 compare with that of 2011-12-08":"The price of 2009-06-22 is 4.01 and that of 2011-12-08 is 3.42, so 2009-06-22 has the larger price.","2022-10-14 compare with that of 2024-11-22":"The price of 2022-10-14 is 6.1 and that of 2024-11-22 is 2.41, so 2022-10-14 has the larger price.","2009-09-04 and 2026-03-05":"The price of 2009-09-04 is 1.83 and that of 2026-03-05 is 2.9, so 2026-03-05 has the larger price.","2020-08-07 and 2011-06-10":"The price of 2020-08-07 is 2.15 and that of 2011-06-10 is 4.72, so 2011-06-10 has the larger price.","2016-06-06 and 2017-10-19":"The price of 2016-06-06 is 2.32 and that of 2017-10-19 is 2.83, so 2017-10-19 has the larger price.","2011-12-23 and 2016-01-21":"The price of 2011-12-23 is 2.97 and that of 2016-01-21 is 2.22, so 2011-12-23 has the larger price.","2019-08-14 compare with that of 2019-07-25":"The price of 2019-08-14 is 2.22 and that of 2019-07-25 is 2.26, so 2019-07-25 has the larger price.","2018-09-05 and 2000-12-12":"The price of 2018-09-05 is 3 and that of 2000-12-12 is 8.58, so 2000-12-12 has the larger price.","2007-10-15 and 2019-09-17":"The price of 2007-10-15 is 7.09 and that of 2019-09-17 is 2.7, so 2007-10-15 has the larger price.","2024-05-08 and 2007-06-01":"The price of 2024-05-08 is 2.01 and that of 2007-06-01 is 7.57, so 2007-06-01 has the larger price.","2025-06-13 and 2014-02-19":"The price of 2025-06-13 is 2.65 and that of 2014-02-19 is 6, so 2014-02-19 has the larger price.","2015-10-30 and 2022-02-09":"The price of 2015-10-30 is 1.98 and that of 2022-02-09 is 4.13, so 2022-02-09 has the larger price.","2016-12-21 compare with that of 2023-03-14":"The price of 2016-12-21 is 3.5 and that of 2023-03-14 is 2.65, so 2016-12-21 has the larger price.","2019-02-21 compare with that of 2018-12-14":"The price of 2019-02-21 is 2.73 and that of 2018-12-14 is 3.99, so 2018-12-14 has the larger price.","2011-02-02 compare with that of 2000-04-07":"The price of 2011-02-02 is 4.55 and that of 2000-04-07 is 2.99, so 2011-02-02 has the larger price.","2014-02-05 and 2022-10-14":"The price of 2014-02-05 is 8.12 and that of 2022-10-14 is 6.1, so 2014-02-05 has the larger price.","2010-11-12 and 2009-07-27":"The price of 2010-11-12 is 3.5 and that of 2009-07-27 is 3.46, so 2010-11-12 has the larger price.","2016-01-21 compare with that of 2007-06-14":"The price of 2016-01-21 is 2.22 and that of 2007-06-14 is 7.48, so 2007-06-14 has the larger price.","2024-07-08 and 2014-02-04":"The price of 2024-07-08 is 2.1 and that of 2014-02-04 is 5.78, so 2014-02-04 has the larger price.","2008-05-01 and 2023-05-30":"The price of 2008-05-01 is 10.66 and that of 2023-05-30 is 2.11, so 2008-05-01 has the larger price.","2024-08-06 and 2016-12-21":"The price of 2024-08-06 is 1.83 and that of 2016-12-21 is 3.5, so 2016-12-21 has the larger price.","2021-08-16 and 2009-08-31":"The price of 2021-08-16 is 3.93 and that of 2009-08-31 is 2.42, so 2021-08-16 has the larger price.","2017-05-23 and 2019-06-14":"The price of 2017-05-23 is 3.22 and that of 2019-06-14 is 2.37, so 2017-05-23 has the larger price.","2009-07-27 compare with that of 2011-09-07":"The price of 2009-07-27 is 3.46 and that of 2011-09-07 is 3.96, so 2011-09-07 has the larger price.","2011-11-25 compare with that of 2015-05-11":"The price of 2011-11-25 is 2.84 and that of 2015-05-11 is 2.85, so 2015-05-11 has the larger price.","2015-02-04 and 2011-11-25":"The price of 2015-02-04 is 2.73 and that of 2011-11-25 is 2.84, so 2011-11-25 has the larger price.","2017-10-19 compare with that of 2025-06-24":"The price of 2017-10-19 is 2.83 and that of 2025-06-24 is 3.3, so 2025-06-24 has the larger price.","2022-02-09 compare with that of 2008-01-24":"The price of 2022-02-09 is 4.13 and that of 2008-01-24 is 7.85, so 2008-01-24 has the larger price.","2016-07-08 compare with that of 2016-03-14":"The price of 2016-07-08 is 2.8 and that of 2016-03-14 is 1.68, so 2016-07-08 has the larger price.","2007-12-18 and 2017-12-18":"The price of 2007-12-18 is 7.16 and that of 2017-12-18 is 2.71, so 2007-12-18 has the larger price.","2014-07-02 and 2020-03-19":"The price of 2014-07-02 is 4.47 and that of 2020-03-19 is 1.68, so 2014-07-02 has the larger price.","2000-07-19 and 2008-12-12":"The price of 2000-07-19 is 4.07 and that of 2008-12-12 is 5.56, so 2008-12-12 has the larger price.","2019-11-20 and 2025-10-31":"The price of 2019-11-20 is 2.56 and that of 2025-10-31 is 3.57, so 2025-10-31 has the larger price.","2017-03-23 compare with that of 2019-03-06":"The price of 2017-03-23 is 2.93 and that of 2019-03-06 is 3.18, so 2019-03-06 has the larger price.","2019-09-17 compare with that of 2007-05-04":"The price of 2019-09-17 is 2.7 and that of 2007-05-04 is 7.82, so 2007-05-04 has the larger price.","2015-07-16 compare with that of 2020-07-28":"The price of 2015-07-16 is 2.9 and that of 2020-07-28 is 1.83, so 2015-07-16 has the larger price.","2003-07-28 and 2009-06-22":"The price of 2003-07-28 is 4.68 and that of 2009-06-22 is 4.01, so 2003-07-28 has the larger price.","2019-11-08 compare with that of 2009-07-30":"The price of 2019-11-08 is 2.87 and that of 2009-07-30 is 3.34, so 2009-07-30 has the larger price.","2010-09-27 and 1997-12-29":"The price of 2010-09-27 is 3.8 and that of 1997-12-29 is 2.33, so 2010-09-27 has the larger price.","2008-12-12 compare with that of 2014-10-13":"The price of 2008-12-12 is 5.56 and that of 2014-10-13 is 3.87, so 2008-12-12 has the larger price.","2014-02-04 compare with that of 2002-11-19":"The price of 2014-02-04 is 5.78 and that of 2002-11-19 is 4.25, so 2014-02-04 has the larger price.","2007-01-24 and 2013-05-06":"The price of 2007-01-24 is 7.58 and that of 2013-05-06 is 3.93, so 2007-01-24 has the larger price.","2020-03-19 compare with that of 2000-10-23":"The price of 2020-03-19 is 1.68 and that of 2000-10-23 is 4.82, so 2000-10-23 has the larger price.","2000-12-12 compare with that of 2007-10-18":"The price of 2000-12-12 is 8.58 and that of 2007-10-18 is 7.11, so 2000-12-12 has the larger price.","2025-10-31 compare with that of 2023-06-07":"The price of 2025-10-31 is 3.57 and that of 2023-06-07 is 2.13, so 2025-10-31 has the larger price.","2013-05-06 compare with that of 2011-05-09":"The price of 2013-05-06 is 3.93 and that of 2011-05-09 is 4.28, so 2011-05-09 has the larger price.","2008-12-19 and 2019-08-14":"The price of 2008-12-19 is 5.66 and that of 2019-08-14 is 2.22, so 2008-12-19 has the larger price.","2017-12-18 compare with that of 2009-03-10":"The price of 2017-12-18 is 2.71 and that of 2009-03-10 is 3.88, so 2009-03-10 has the larger price."}}},
{"id":"n-003479b2","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2014-02-05 and 2022-10-14":"The price of 2014-02-05 is 8.12 and that of 2022-10-14 is 6.1, so 2014-02-05 has the larger price."}}},
{"id":"n-014621e1","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2019-09-17 compare with that of 2007-05-04":"The price of 2019-09-17 is 2.7 and that of 2007-05-04 is 7.82, so 2007-05-04 has the larger price."}}},
{"id":"n-01bf1b09","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2008-12-19 and 2019-08-14":"The price of 2008-12-19 is 5.66 and that of 2019-08-14 is 2.22, so 2008-12-19 has the larger price."}}},
{"id":"n-0885f947","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2007-10-18 versus 2005-11-08: compare their price":"The price of 2007-10-18 is 7.11 and that of 2005-11-08 is 9.15, so 2005-11-08 has the larger price."}}},
{"id":"n-097be229","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 1997-08-19 and 2019-02-21":"The price of 1997-08-19 is 2.61 and that of 2019-02-21 is 2.73, so 2019-02-21 has the larger price."}}},
{"id":"n-0a550a5f","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2022-10-14 compare with that of 2024-11-22":"The price of 2022-10-14 is 6.1 and that of 2024-11-22 is 2.41, so 2022-10-14 has the larger price."}}},
{"id":"n-0a5cd8a5","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2002-08-27 compare with that of 2010-04-13":"The price of 2002-08-27 is 3.47 and that of 2010-04-13 is 3.97, so 2010-04-13 has the larger price."}}},
{"id":"n-0c355d30","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2009-03-10 versus 2024-08-06: compare their price":"The price of 2009-03-10 is 3.88 and that of 2024-08-06 is 1.83, so 2009-03-10 has the larger price."}}},
{"id":"n-1318e3ab","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2019-11-08 compare with that of 2009-07-30":"The price of 2019-11-08 is 2.87 and that of 2009-07-30 is 3.34, so 2009-07-30 has the larger price."}}},
{"id":"n-13c7b1d1","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2009-06-22 compare with that of 2011-12-08":"The price of 2009-06-22 is 4.01 and that of 2011-12-08 is 3.42, so 2009-06-22 has the larger price."}}},
{"id":"n-182b55aa","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2005-02-17 and 2016-07-08":"The price of 2005-02-17 is 6.05 and that of 2016-07-08 is 2.8, so 2005-02-17 has the larger price."}}},
{"id":"n-1a5b0b1e","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2010-05-27 compare with that of 2023-09-13":"The price of 2010-05-27 is 4.22 and that of 2023-09-13 is 2.76, so 2010-05-27 has the larger price."}}},
{"id":"n-1b60e9d8","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2015-02-04 and 2011-11-25":"The price of 2015-02-04 is 2.73 and that of 2011-11-25 is 2.84, so 2011-11-25 has the larger price."}}},
{"id":"n-1bc65aae","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2011-12-23 and 2016-01-21":"The price of 2011-12-23 is 2.97 and that of 2016-01-21 is 2.22, so 2011-12-23 has the larger price."}}},
{"id":"n-1e60b50a","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2024-08-06 and 2016-12-21":"The price of 2024-08-06 is 1.83 and that of 2016-12-21 is 3.5, so 2016-12-21 has the larger price."}}},
{"id":"n-1f5a8947","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2003-07-28 and 2009-06-22":"The price of 2003-07-28 is 4.68 and that of 2009-06-22 is 4.01, so 2003-07-28 has the larger price."}}},
{"id":"n-2214f19d","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2000-10-23 versus 2010-11-12: compare their price":"The price of 2000-10-23 is 4.82 and that of 2010-11-12 is 3.5, so 2000-10-23 has the larger price."}}},
{"id":"n-2ade8ba6","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2018-12-14 versus 2005-02-17: compare their price":"The price of 2018-12-14 is 3.99 and that of 2005-02-17 is 6.05, so 2005-02-17 has the larger price."}}},
{"id":"n-30d53749","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2017-10-19 compare with that of 2025-06-24":"The price of 2017-10-19 is 2.83 and that of 2025-06-24 is 3.3, so 2025-06-24 has the larger price."}}},
{"id":"n-31e6dbdd","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2017-05-23 and 2019-06-14":"The price of 2017-05-23 is 3.22 and that of 2019-06-14 is 2.37, so 2017-05-23 has the larger price."}}},
{"id":"n-33b52559","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-09-13 versus 2008-05-01: compare their price":"The price of 2023-09-13 is 2.76 and that of 2008-05-01 is 10.66, so 2008-05-01 has the larger price."}}},
{"id":"n-3476c553","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2014-02-04 compare with that of 2002-11-19":"The price of 2014-02-04 is 5.78 and that of 2002-11-19 is 4.25, so 2014-02-04 has the larger price."}}},
{"id":"n-350811f8","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-10-09 versus 2007-01-24: compare their price":"The price of 2019-10-09 is 2.26 and that of 2007-01-24 is 7.58, so 2007-01-24 has the larger price."}}},
{"id":"n-36344e13","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2026-03-05 compare with that of 2010-07-27":"The price of 2026-03-05 is 2.9 and that of 2010-07-27 is 4.72, so 2010-07-27 has the larger price."}}},
{"id":"n-3811bacc","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2016-07-08 compare with that of 2016-03-14":"The price of 2016-07-08 is 2.8 and that of 2016-03-14 is 1.68, so 2016-07-08 has the larger price."}}},
{"id":"n-38e05616","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2018-09-05 and 2000-12-12":"The price of 2018-09-05 is 3 and that of 2000-12-12 is 8.58, so 2000-12-12 has the larger price."}}},
{"id":"n-3d8652f6","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2014-07-02 and 2020-03-19":"The price of 2014-07-02 is 4.47 and that of 2020-03-19 is 1.68, so 2014-07-02 has the larger price."}}},
{"id":"n-44803dff","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2025-06-24 versus 2019-11-20: compare their price":"The price of 2025-06-24 is 3.3 and that of 2019-11-20 is 2.56, so 2025-06-24 has the larger price."}}},
{"id":"n-453e1dca","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2019-02-21 compare with that of 2018-12-14":"The price of 2019-02-21 is 2.73 and that of 2018-12-14 is 3.99, so 2018-12-14 has the larger price."}}},
{"id":"n-459d5a07","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2024-05-08 and 2007-06-01":"The price of 2024-05-08 is 2.01 and that of 2007-06-01 is 7.57, so 2007-06-01 has the larger price."}}},
{"id":"n-47300695","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2007-06-01 compare with that of 1999-08-06":"The price of 2007-06-01 is 7.57 and that of 1999-08-06 is 2.69, so 2007-06-01 has the larger price."}}},
{"id":"n-481f035d","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-03-14 versus 2000-07-19: compare their price":"The price of 2023-03-14 is 2.65 and that of 2000-07-19 is 4.07, so 2000-07-19 has the larger price."}}},
{"id":"n-4981d0a1","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2008-03-11 and 2010-07-02":"The price of 2008-03-11 is 9.85 and that of 2010-07-02 is 4.72, so 2008-03-11 has the larger price."}}},
{"id":"n-4bd6d408","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2022-02-09 compare with that of 2008-01-24":"The price of 2022-02-09 is 4.13 and that of 2008-01-24 is 7.85, so 2008-01-24 has the larger price."}}},
{"id":"n-4e50f7f3","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2008-05-22 versus 2023-09-29: compare their price":"The price of 2008-05-22 is 11.57 and that of 2023-09-29 is 2.68, so 2008-05-22 has the larger price."}}},
{"id":"n-52ba4cb7","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-06-07 versus 2007-10-15: compare their price":"The price of 2023-06-07 is 2.13 and that of 2007-10-15 is 7.09, so 2007-10-15 has the larger price."}}},
{"id":"n-5fb0f52d","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2019-06-14 compare with that of 2008-01-11":"The price of 2019-06-14 is 2.37 and that of 2008-01-11 is 8.13, so 2008-01-11 has the larger price."}}},
{"id":"n-6143c528","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2025-10-31 compare with that of 2023-06-07":"The price of 2025-10-31 is 3.57 and that of 2023-06-07 is 2.13, so 2025-10-31 has the larger price."}}},
{"id":"n-64e1900a","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2023-09-29 and 2017-03-23":"The price of 2023-09-29 is 2.68 and that of 2017-03-23 is 2.93, so 2017-03-23 has the larger price."}}},
{"id":"n-65390fad","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2006-06-30 and 2019-11-08":"The price of 2006-06-30 is 5.84 and that of 2019-11-08 is 2.87, so 2006-06-30 has the larger price."}}},
{"id":"n-656677e5","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2008-12-12 compare with that of 2014-10-13":"The price of 2008-12-12 is 5.56 and that of 2014-10-13 is 3.87, so 2008-12-12 has the larger price."}}},
{"id":"n-687b53fe","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2020-03-19 compare with that of 2000-10-23":"The price of 2020-03-19 is 1.68 and that of 2000-10-23 is 4.82, so 2000-10-23 has the larger price."}}},
{"id":"n-69b2dee1","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2020-08-07 and 2011-06-10":"The price of 2020-08-07 is 2.15 and that of 2011-06-10 is 4.72, so 2011-06-10 has the larger price."}}},
{"id":"n-727c30f1","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2013-05-06 compare with that of 2011-05-09":"The price of 2013-05-06 is 3.93 and that of 2011-05-09 is 4.28, so 2011-05-09 has the larger price."}}},
{"id":"n-77c8bb85","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2016-09-07 versus 2008-12-19: compare their price":"The price of 2016-09-07 is 2.77 and that of 2008-12-19 is 5.66, so 2008-12-19 has the larger price."}}},
{"id":"n-782f59d3","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2009-09-04 and 2026-03-05":"The price of 2009-09-04 is 1.83 and that of 2026-03-05 is 2.9, so 2026-03-05 has the larger price."}}},
{"id":"n-7882f162","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2011-02-02 compare with that of 2000-04-07":"The price of 2011-02-02 is 4.55 and that of 2000-04-07 is 2.99, so 2011-02-02 has the larger price."}}},
{"id":"n-7ac9abae","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2000-04-07 versus 2014-02-05: compare their price":"The price of 2000-04-07 is 2.99 and that of 2014-02-05 is 8.12, so 2014-02-05 has the larger price."}}},
{"id":"n-7dfe39ea","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2016-03-14 versus 2020-12-28: compare their price":"The price of 2016-03-14 is 1.68 and that of 2020-12-28 is 2.39, so 2020-12-28 has the larger price."}}},
{"id":"n-80de5f19","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2019-08-14 compare with that of 2019-07-25":"The price of 2019-08-14 is 2.22 and that of 2019-07-25 is 2.26, so 2019-07-25 has the larger price."}}},
{"id":"n-826ccd67","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2000-07-19 and 2008-12-12":"The price of 2000-07-19 is 4.07 and that of 2008-12-12 is 5.56, so 2008-12-12 has the larger price."}}},
{"id":"n-82990342","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2017-12-18 compare with that of 2009-03-10":"The price of 2017-12-18 is 2.71 and that of 2009-03-10 is 3.88, so 2009-03-10 has the larger price."}}},
{"id":"n-86027399","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2011-12-08 versus 2024-07-08: compare their price":"The price of 2011-12-08 is 3.42 and that of 2024-07-08 is 2.1, so 2011-12-08 has the larger price."}}},
{"id":"n-86bfa4a4","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2010-07-27 versus 2007-12-18: compare their price":"The price of 2010-07-27 is 4.72 and that of 2007-12-18 is 7.16, so 2007-12-18 has the larger price."}}},
{"id":"n-88c6bf42","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2002-11-19 versus 2020-08-07: compare their price":"The price of 2002-11-19 is 4.25 and that of 2020-08-07 is 2.15, so 2002-11-19 has the larger price."}}},
{"id":"n-949e12e5","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2000-12-12 compare with that of 2007-10-18":"The price of 2000-12-12 is 8.58 and that of 2007-10-18 is 7.11, so 2000-12-12 has the larger price."}}},
{"id":"n-94b53dad","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2019-11-20 and 2025-10-31":"The price of 2019-11-20 is 2.56 and that of 2025-10-31 is 3.57, so 2025-10-31 has the larger price."}}},
{"id":"n-94f3fc34","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2015-07-16 compare with that of 2020-07-28":"The price of 2015-07-16 is 2.9 and that of 2020-07-28 is 1.83, so 2015-07-16 has the larger price."}}},
{"id":"n-959aad65","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2007-05-04 versus 2017-05-23: compare their price":"The price of 2007-05-04 is 7.82 and that of 2017-05-23 is 3.22, so 2007-05-04 has the larger price."}}},
{"id":"n-965970e6","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2024-07-08 and 2014-02-04":"The price of 2024-07-08 is 2.1 and that of 2014-02-04 is 5.78, so 2014-02-04 has the larger price."}}},
{"id":"n-97a519d6","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2008-01-11 versus 2013-01-30: compare their price":"The price of 2008-01-11 is 8.13 and that of 2013-01-30 is 3.24, so 2008-01-11 has the larger price."}}},
{"id":"n-9a3bd198","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2008-01-24 versus 2014-07-02: compare their price":"The price of 2008-01-24 is 7.85 and that of 2014-07-02 is 4.47, so 2008-01-24 has the larger price."}}},
{"id":"n-9bf7360b","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2011-05-09 versus 2011-12-23: compare their price":"The price of 2011-05-09 is 4.28 and that of 2011-12-23 is 2.97, so 2011-05-09 has the larger price."}}},
{"id":"n-9d2dece3","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-03-06 versus 1997-08-19: compare their price":"The price of 2019-03-06 is 3.18 and that of 1997-08-19 is 2.61, so 2019-03-06 has the larger price."}}},
{"id":"n-9fb2b737","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2016-06-06 and 2017-10-19":"The price of 2016-06-06 is 2.32 and that of 2017-10-19 is 2.83, so 2017-10-19 has the larger price."}}},
{"id":"n-a2abbef5","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2007-10-15 and 2019-09-17":"The price of 2007-10-15 is 7.09 and that of 2019-09-17 is 2.7, so 2007-10-15 has the larger price."}}},
{"id":"n-a3acb091","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2020-12-28 and 2015-07-16":"The price of 2020-12-28 is 2.39 and that of 2015-07-16 is 2.9, so 2015-07-16 has the larger price."}}},
{"id":"n-a3f9d513","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2007-12-18 and 2017-12-18":"The price of 2007-12-18 is 7.16 and that of 2017-12-18 is 2.71, so 2007-12-18 has the larger price."}}},
{"id":"n-a5113d8f","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2025-06-13 and 2014-02-19":"The price of 2025-06-13 is 2.65 and that of 2014-02-19 is 6, so 2014-02-19 has the larger price."}}},
{"id":"n-a5b5deb8","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2008-05-01 and 2023-05-30":"The price of 2008-05-01 is 10.66 and that of 2023-05-30 is 2.11, so 2008-05-01 has the larger price."}}},
{"id":"n-a6810843","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2014-02-19 compare with that of 2004-01-26":"The price of 2014-02-19 is 6 and that of 2004-01-26 is 5.7, so 2014-02-19 has the larger price."}}},
{"id":"n-ae8b583a","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2011-11-25 compare with that of 2015-05-11":"The price of 2011-11-25 is 2.84 and that of 2015-05-11 is 2.85, so 2015-05-11 has the larger price."}}},
{"id":"n-b1ed491e","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2004-01-26 versus 2008-03-11: compare their price":"The price of 2004-01-26 is 5.7 and that of 2008-03-11 is 9.85, so 2008-03-11 has the larger price."}}},
{"id":"n-b983e79b","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2010-09-27 and 1997-12-29":"The price of 2010-09-27 is 3.8 and that of 1997-12-29 is 2.33, so 2010-09-27 has the larger price."}}},
{"id":"n-bfbf47fa","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2010-11-12 and 2009-07-27":"The price of 2010-11-12 is 3.5 and that of 2009-07-27 is 3.46, so 2010-11-12 has the larger price."}}},
{"id":"n-c996d7c9","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-11-22 versus 2025-06-13: compare their price":"The price of 2024-11-22 is 2.41 and that of 2025-06-13 is 2.65, so 2025-06-13 has the larger price."}}},
{"id":"n-ca1a199f","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2015-10-30 and 2022-02-09":"The price of 2015-10-30 is 1.98 and that of 2022-02-09 is 4.13, so 2022-02-09 has the larger price."}}},
{"id":"n-cc10f5a6","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1999-08-06 versus 2015-10-30: compare their price":"The price of 1999-08-06 is 2.69 and that of 2015-10-30 is 1.98, so 1999-08-06 has the larger price."}}},
{"id":"n-d33232ee","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2017-03-23 compare with that of 2019-03-06":"The price of 2017-03-23 is 2.93 and that of 2019-03-06 is 3.18, so 2019-03-06 has the larger price."}}},
{"id":"n-d96ea31a","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2015-05-11 versus 2006-06-30: compare their price":"The price of 2015-05-11 is 2.85 and that of 2006-06-30 is 5.84, so 2006-06-30 has the larger price."}}},
{"id":"n-db255a28","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2016-12-21 compare with that of 2023-03-14":"The price of 2016-12-21 is 3.5 and that of 2023-03-14 is 2.65, so 2016-12-21 has the larger price."}}},
{"id":"n-dc54f5f6","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2007-06-14 versus 2015-02-04: compare their price":"The price of 2007-06-14 is 7.48 and that of 2015-02-04 is 2.73, so 2007-06-14 has the larger price."}}},
{"id":"n-dfb0a101","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2021-08-16 and 2009-08-31":"The price of 2021-08-16 is 3.93 and that of 2009-08-31 is 2.42, so 2021-08-16 has the larger price."}}},
{"id":"n-e1abefc3","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2016-01-21 compare with that of 2007-06-14":"The price of 2016-01-21 is 2.22 and that of 2007-06-14 is 7.48, so 2007-06-14 has the larger price."}}},
{"id":"n-e36833e3","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2011-09-07 versus 2012-08-21: compare their price":"The price of 2011-09-07 is 3.96 and that of 2012-08-21 is 2.8, so 2011-09-07 has the larger price."}}},
{"id":"n-e63b12eb","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2011-06-10 compare with that of 2011-10-07":"The price of 2011-06-10 is 4.72 and that of 2011-10-07 is 3.4, so 2011-06-10 has the larger price."}}},
{"id":"n-e7700c3d","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2009-07-30 versus 2016-06-06: compare their price":"The price of 2009-07-30 is 3.34 and that of 2016-06-06 is 2.32, so 2009-07-30 has the larger price."}}},
{"id":"n-e79eb66d","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2009-08-31 compare with that of 2008-05-22":"The price of 2009-08-31 is 2.42 and that of 2008-05-22 is 11.57, so 2008-05-22 has the larger price."}}},
{"id":"n-ecc9b6b3","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2007-01-24 and 2013-05-06":"The price of 2007-01-24 is 7.58 and that of 2013-05-06 is 3.93, so 2007-01-24 has the larger price."}}},
{"id":"n-ed63fdcd","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2005-11-08 and 2011-02-02":"The price of 2005-11-08 is 9.15 and that of 2011-02-02 is 4.55, so 2005-11-08 has the larger price."}}},
{"id":"n-edb4c671","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2010-04-13 versus 2021-08-16: compare their price":"The price of 2010-04-13 is 3.97 and that of 2021-08-16 is 3.93, so 2010-04-13 has the larger price."}}},
{"id":"n-edd56914","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2013-01-30 and 2010-05-27":"The price of 2013-01-30 is 3.24 and that of 2010-05-27 is 4.22, so 2010-05-27 has the larger price."}}},
{"id":"n-f06d3b6a","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-07-28 versus 2010-09-27: compare their price":"The price of 2020-07-28 is 1.83 and that of 2010-09-27 is 3.8, so 2010-09-27 has the larger price."}}},
{"id":"n-f1e0568f","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 1997-12-29 compare with that of 2019-10-09":"The price of 1997-12-29 is 2.33 and that of 2019-10-09 is 2.26, so 1997-12-29 has the larger price."}}},
{"id":"n-f28408e9","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2011-10-07 versus 2018-09-05: compare their price":"The price of 2011-10-07 is 3.4 and that of 2018-09-05 is 3, so 2011-10-07 has the larger price."}}},
{"id":"n-f29bfad5","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2014-10-13 versus 2003-07-28: compare their price":"The price of 2014-10-13 is 3.87 and that of 2003-07-28 is 4.68, so 2003-07-28 has the larger price."}}},
{"id":"n-f7845052","guard":[["hasAny",["compare","price","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-07-25 versus 2024-05-08: compare their price":"The price of 2019-07-25 is 2.26 and that of 2024-05-08 is 2.01, so 2019-07-25 has the larger price."}}},
{"id":"n-f80f6c2b","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2009-07-27 compare with that of 2011-09-07":"The price of 2009-07-27 is 3.46 and that of 2011-09-07 is 3.96, so 2011-09-07 has the larger price."}}},
{"id":"n-f87f7472","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the price of 2012-08-21 and 2002-08-27":"The price of 2012-08-21 is 2.8 and that of 2002-08-27 is 3.47, so 2002-08-27 has the larger price."}}},
{"id":"n-fd108ae4","guard":[["hasAny",["compare","price"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the price of 2010-07-02 compare with that of 2016-09-07":"The price of 2010-07-02 is 4.72 and that of 2016-09-07 is 2.77, so 2010-07-02 has the larger price."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"2011-10-07 versus 2018-09-05: compare their price","expect":{"contains":["3.4","3","2011-10-07"],"notRefusal":true}},{"q":"how does the price of 2007-06-01 compare with that of 1999-08-06","expect":{"contains":["7.57","2.69","2007-06-01"],"notRefusal":true}},{"q":"compare the price of 2008-03-11 and 2010-07-02","expect":{"contains":["9.85","4.72","2008-03-11"],"notRefusal":true}},{"q":"2000-10-23 versus 2010-11-12: compare their price","expect":{"contains":["4.82","3.5","2000-10-23"],"notRefusal":true}},{"q":"2007-10-18 versus 2005-11-08: compare their price","expect":{"contains":["7.11","9.15","2005-11-08"],"notRefusal":true}},{"q":"2023-03-14 versus 2000-07-19: compare their price","expect":{"contains":["2.65","4.07","2000-07-19"],"notRefusal":true}},{"q":"2002-11-19 versus 2020-08-07: compare their price","expect":{"contains":["4.25","2.15","2002-11-19"],"notRefusal":true}},{"q":"compare the price of 2005-02-17 and 2016-07-08","expect":{"contains":["6.05","2.8","2005-02-17"],"notRefusal":true}},{"q":"how does the price of 2011-06-10 compare with that of 2011-10-07","expect":{"contains":["4.72","3.4","2011-06-10"],"notRefusal":true}},{"q":"compare the price of 2005-11-08 and 2011-02-02","expect":{"contains":["9.15","4.55","2005-11-08"],"notRefusal":true}},{"q":"2009-07-30 versus 2016-06-06: compare their price","expect":{"contains":["3.34","2.32","2009-07-30"],"notRefusal":true}},{"q":"how does the price of 2019-06-14 compare with that of 2008-01-11","expect":{"contains":["2.37","8.13","2008-01-11"],"notRefusal":true}},{"q":"2011-09-07 versus 2012-08-21: compare their price","expect":{"contains":["3.96","2.8","2011-09-07"],"notRefusal":true}},{"q":"compare the price of 2020-12-28 and 2015-07-16","expect":{"contains":["2.39","2.9","2015-07-16"],"notRefusal":true}},{"q":"how does the price of 2010-05-27 compare with that of 2023-09-13","expect":{"contains":["4.22","2.76","2010-05-27"],"notRefusal":true}},{"q":"how does the price of 2010-07-02 compare with that of 2016-09-07","expect":{"contains":["4.72","2.77","2010-07-02"],"notRefusal":true}},{"q":"compare the price of 2006-06-30 and 2019-11-08","expect":{"contains":["5.84","2.87","2006-06-30"],"notRefusal":true}},{"q":"compare the price of 2013-01-30 and 2010-05-27","expect":{"contains":["3.24","4.22","2010-05-27"],"notRefusal":true}},{"q":"compare the price of 2012-08-21 and 2002-08-27","expect":{"contains":["2.8","3.47","2002-08-27"],"notRefusal":true}},{"q":"2014-10-13 versus 2003-07-28: compare their price","expect":{"contains":["3.87","4.68","2003-07-28"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
