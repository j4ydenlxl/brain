// sp500-of-observation-402b-compare-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"sp500-of-observation-402b-compare-neo-g10","class":"sp500-of-observation-402b-compare","generation":10,"lane":"neo","grownFrom":["2023-03-20 versus 2018-02-23: compare their sp500","compare the sp500 of 2021-07-26 and 2017-04-27","compare the sp500 of 2017-03-06 and 2018-02-12","2024-11-07 versus 2019-03-13: compare their sp500","compare the sp500 of 2018-08-09 and 2018-11-19","2023-09-11 versus 2017-03-06: compare their sp500","how does the sp500 of 2020-10-09 compare with that of 2020-08-17","compare the sp500 of 2024-04-02 and 2017-11-03","2022-06-24 versus 2016-11-08: compare their sp500","how does the sp500 of 2025-05-22 compare with that of 2024-12-17","how does the sp500 of 2018-02-12 compare with that of 2016-06-14","compare the sp500 of 2020-07-13 and 2018-07-03","compare the sp500 of 2025-02-20 and 2019-04-15","how does the sp500 of 2019-07-17 compare with that of 2024-11-07","compare the sp500 of 2017-03-28 and 2016-07-22","how does the sp500 of 2021-10-13 compare with that of 2023-01-25","2021-04-01 versus 2018-10-25: compare their sp500","how does the sp500 of 2021-05-10 compare with that of 2021-02-10","2020-08-17 versus 2021-10-12: compare their sp500","compare the sp500 of 2020-02-12 and 2018-08-17"],"version":1});

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
knowLoad([{"id":"fr-s-and-p-500-fred-sp500-b187d8","columns":["observation_date","sp500"],"n":2609,"cols":[{"f":"02016-02-12|95|96|97|98|99|822|93|94|95|96|99|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|66-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|67-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|37-01-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|38-01-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|39-01-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|220-01-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|31-01-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|32-01-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|66-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|67-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|33-01-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|34-01-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|35-01-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|36-01-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91","sep":"|"},{"s":"1864.78||1895.58|1926.82|1917.83|1917.78|1945.5|1921.27|1929.8|1951.7|1948.05|1932.23|1978.35|1986.45|1993.4|1999.99|2001.76|1979.26|1989.26|1989.57|2022.19|2019.64|2015.93|2027.22|2040.59|2049.58|2051.6|2049.8|2036.71|2035.94||2037.05|2055.01|2063.95|2059.74|2072.78|2066.13|2045.17|2066.66|2041.91|2047.6|2041.99|2061.72|2082.42|2082.78|2080.73|2094.34|2100.8|2102.4|2091.48|2091.58|2087.79|2091.7|2095.15|2075.81|2065.3|2081.43|2063.37|2051.12|2050.63|2057.14|2058.69|2084.39|2064.46|2064.11|2046.61|2066.66|2047.21|2047.63|2040.04|2052.32|2048.04|2076.06|2090.54|2090.1|2099.06||2096.96|2099.33|2105.26|2099.13|2109.41|2112.13|2119.12|2115.48|2096.07|2079.06|2075.32|2071.5|2077.99|2071.22|2083.25|2088.9|2085.45|2113.32|2037.41|2000.54|2036.09|2070.77|2098.86|2102.95||2088.55|2099.73|2097.9|2129.9|2137.16|2152.14|2152.43|2163.75|2161.74|2166.89|2163.78|2173.02|2165.17|2175.03|2168.48|2169.18|2166.58|2170.06|2173.6|2170.84|2157.03|2163.79|2164.25|2182.87|2180.89|2181.74|2175.49|2185.79|2184.05|2190.15|2178.15|2182.22|2187.02|2183.87|2182.64|2186.9|2175.44|2172.47|2169.04|2180.38|2176.12|2170.95|2170.86|2179.98||2186.48|2186.16|2181.3|2127.81|2159.04|2127.02|2125.77|2147.26|2139.16|2139.12|2139.76|2163.12|2177.18|2164.69|2146.1|2159.93|2171.37|2151.13|2168.27|2161.2|2150.49|2159.73|2160.77|2153.74|2163.66|2136.73|2139.18|2132.55|2132.98|2126.5|2139.6|2144.29|2141.34|2141.16|2151.33|2143.16|2139.43|2133.04|2126.41|2126.15|2111.72|2097.94|2088.66|2085.18|2131.52|2139.56|2163.26|2167.48|2164.45|2164.2|2180.39|2176.94|2187.12|2181.9|2198.18|2202.94|2204.72||2213.35|2201.72|2204.66|2198.81|2191.08|2191.95|2204.71|2212.23|2241.35|2246.19|2259.53|2256.96|2271.72|2253.28|2262.03|2258.07|2262.53|2270.76|2265.18|2260.96|2263.79||2268.88|2249.92|2249.26|2238.83||2257.83|2270.75|2269|2276.98|2268.9|2268.9|2275.32|2270.44|2274.64||2267.89|2271.89|2263.69|2271.31|2265.2|2280.07|2298.37|2296.68|2294.69|2280.9|2278.87|2279.55|2280.85|2297.42|2292.56|2293.08|2294.67|2307.87|2316.1|2328.25|2337.58|2349.25|2347.22|2351.16||2365.38|2362.82|2363.81|2367.34|2369.75|2363.64|2395.96|2381.92|2383.12|2375.31|2368.39|2362.98|2364.87|2372.6|2373.47|2365.45|2385.26|2381.38|2378.25|2373.47|2344.02|2348.45|2345.96|2343.98|2341.59|2358.57|2361.13|2368.06|2362.72|2358.84|2360.16|2352.95|2357.49|2355.54|2357.16|2353.78|2344.93|2328.95||2349.01|2342.19|2338.17|2355.84|2348.69|2374.15|2388.61|2387.45|2388.77|2384.2|2388.33|2391.17|2388.13|2389.52|2399.29|2399.38|2396.92|2399.63|2394.44|2390.9|2402.32|2400.67|2357.03|2365.72|2381.73|2394.02|2398.42|2404.39|2415.07|2415.82||2412.91|2411.8|2430.06|2439.07|2436.1|2429.33|2433.14|2433.79|2431.77|2429.39|2440.35|2437.92|2432.46|2433.15|2453.46|2437.03|2435.61|2434.5|2438.3|2439.07|2419.38|2440.69|2419.7|2423.41|2429.01||2432.54|2409.75|2425.18|2427.43|2425.53|2443.25|2447.83|2459.27|2459.14|2460.61|2473.83|2473.45|2472.54|2469.91|2477.13|2477.83|2475.42|2472.1|2470.3|2476.35|2477.57|2472.16|2476.83|2480.91|2474.92|2474.02|2438.21|2441.32|2465.84|2464.61|2468.11|2430.01|2425.55|2428.37|2452.51|2444.04|2438.97|2443.05|2444.24|2446.3|2457.59|2471.65|2476.55||2457.85|2465.54|2465.1|2461.43|2488.11|2496.48|2498.37|2495.62|2500.23|2503.87|2506.65|2508.24|2500.6|2502.22|2496.66|2496.84|2507.04|2510.06|2519.36|2529.12|2534.58|2537.74|2552.07|2549.33|2544.73|2550.64|2555.24|2550.93|2553.17|2557.64|2559.36|2561.26|2562.1|2575.21|2564.98|2569.13|2557.15|2560.4|2581.07|2572.83|2575.26|2579.36|2579.85|2587.84|2591.13|2590.64|2594.38|2584.62|2582.3|2584.84|2578.87|2564.62|2585.64|2578.85|2582.14|2599.03|2597.08||2602.42|2601.42|2627.04|2626.07|2647.58|2642.22|2639.44|2629.57|2629.27|2636.98|2651.5|2659.99|2664.11|2662.85|2652.01|2675.81|2690.16|2681.47|2679.25|2684.57|2683.34||2680.5|2682.62|2687.54|2673.61||2695.81|2713.06|2723.99|2743.15|2747.71|2751.29|2748.23|2767.56|2786.24||2776.42|2802.56|2798.03|2810.3|2832.97|2839.13|2837.54|2839.25|2872.87|2853.53|2822.43|2823.81|2821.98|2762.13|2648.94|2695.14|2681.66|2581|2619.55|2656|2662.94|2698.63|2731.2|2732.22||2716.26|2701.33|2703.96|2747.3|2779.6|2744.28|2713.83|2677.67|2691.25|2720.94|2728.12|2726.8|2738.97|2786.57|2783.02|2765.31|2749.48|2747.33|2752.01|2712.92|2716.94|2711.93|2643.69|2588.26|2658.55|2612.62|2605|2640.87||2581.88|2614.45|2644.69|2662.84|2604.47|2613.16|2656.87|2642.19|2663.99|2656.3|2677.84|2706.39|2708.64|2693.13|2670.14|2670.29|2634.56|2639.4|2666.94|2669.91|2648.05|2654.8|2635.67|2629.73|2663.42|2672.63|2671.92|2697.79|2723.07|2727.72|2730.13|2711.45|2722.46|2720.13|2712.97|2733.01|2724.44|2733.29|2727.76|2721.33||2689.86|2724.01|2705.27|2734.62|2746.87|2748.8|2772.35|2770.37|2779.03|2782|2786.85|2775.63|2782.49|2779.66|2773.75|2762.59|2767.32|2749.76|2754.88|2717.07|2723.06|2699.63|2716.31|2718.37|2726.71|2713.22||2736.61|2759.82|2784.17|2793.84|2774.02|2798.29|2801.31|2798.43|2809.55|2815.62|2804.49|2801.83|2806.98|2820.4|2846.07|2837.44|2818.82|2802.6|2816.29|2813.36|2827.22|2840.35|2850.4|2858.45|2857.7|2853.58|2833.28|2821.93|2839.96|2818.37|2840.69|2850.13|2857.05|2862.96|2861.82|2856.98|2874.69|2896.74|2897.52|2914.04|2901.13|2901.52||2896.72|2888.6|2878.05|2871.68|2877.13|2887.89|2888.92|2904.18|2904.98|2888.8|2904.31|2907.95|2930.75|2929.67|2919.37|2915.56|2905.97|2914|2913.98|2924.59|2923.43|2925.51|2901.61|2885.57|2884.43|2880.34|2785.68|2728.37|2767.13|2750.79|2809.92|2809.21|2768.78|2767.78|2755.88|2740.69|2656.1|2705.57|2658.69|2641.25|2682.63|2711.74|2740.37|2723.06|2738.31|2755.45|2813.89|2806.83|2781.01|2726.22|2722.18|2701.58|2730.2|2736.27|2690.73|2641.89|2649.93||2632.56|2673.45|2682.17|2743.79|2737.76|2760.17|2790.37|2700.06||2695.95|2633.08|2637.72|2636.78|2651.07|2650.54|2599.95|2545.94|2546.16|2506.96|2467.42|2416.62|2351.1||2467.7|2488.83|2485.74|2506.85||2510.03|2447.89|2531.94|2549.69|2574.41|2584.96|2596.64|2596.26|2582.61|2610.3|2616.1|2635.96|2670.71||2632.9|2638.7|2642.33|2664.76|2643.85|2640|2681.05|2704.1|2706.53|2724.87|2737.7|2731.61|2706.05|2707.88|2709.8|2744.73|2753.03|2745.73|2775.6||2779.76|2784.7|2774.88|2792.67|2796.11|2793.9|2792.38|2784.49|2803.69|2792.81|2789.65|2771.45|2748.93|2743.07|2783.3|2791.52|2810.92|2808.48|2822.48|2832.94|2832.57|2824.23|2854.88|2800.71|2798.36|2818.46|2805.37|2815.44|2834.4|2867.19|2867.24|2873.4|2879.39|2892.74|2895.77|2878.2|2888.21|2888.32|2907.41|2905.58|2907.06|2900.45|2905.03||2907.97|2933.68|2927.25|2926.17|2939.88|2943.03|2945.83|2923.73|2917.52|2945.64|2932.47|2884.05|2879.42|2870.72|2881.4|2811.87|2834.41|2850.96|2876.32|2859.53|2840.23|2864.36|2856.27|2822.24|2826.06||2802.39|2783.02|2788.86|2752.06|2744.45|2803.27|2826.15|2843.49|2873.34|2886.73|2885.72|2879.84|2891.64|2886.98|2889.67|2917.75|2926.46|2954.18|2950.46|2945.35|2917.38|2913.78|2924.92|2941.76|2964.33|2973.01|2995.82||2990.41|2975.95|2979.63|2993.07|2999.91|3013.77|3014.3|3004.04|2984.42|2995.11|2976.61|2985.03|3005.47|3019.56|3003.67|3025.86|3020.97|3013.18|2980.38|2953.56|2932.05|2844.74|2881.77|2883.98|2938.09|2918.65|2883.75|2926.32|2840.6|2847.6|2888.68|2923.65|2900.51|2924.43|2922.95|2847.11|2878.38|2869.16|2887.94|2924.58|2926.46||2906.27|2937.78|2976|2978.71|2978.43|2979.39|3000.93|3009.57|3007.39|2997.96|3005.7|3006.73|3006.79|2992.07|2991.78|2966.6|2984.87|2977.62|2961.79|2976.74|2940.25|2887.61|2910.63|2952.01|2938.79|2893.06|2919.4|2938.13|2970.27|2966.15|2995.68|2989.69|2997.95|2986.2|3006.72|2995.99|3004.52|3010.29|3022.55|3039.42|3036.89|3046.77|3037.56|3066.91|3078.27|3074.62|3076.78|3085.18|3093.08|3087.01|3091.84|3094.04|3096.63|3120.46|3122.03|3120.18|3108.46|3103.54|3110.29|3133.64|3140.52|3153.63||3140.98|3113.87|3093.2|3112.76|3117.43|3145.91|3135.96|3132.52|3141.63|3168.57|3168.8|3191.45|3192.52|3191.14|3205.37|3221.22|3224.01|3223.38||3239.91|3240.02|3221.29|3230.78||3257.85|3234.85|3246.28|3237.18|3253.05|3274.7|3265.35|3288.13|3283.15|3289.29|3316.81|3329.62||3320.79|3321.75|3325.54|3295.47|3243.63|3276.24|3273.4|3283.66|3225.52|3248.92|3297.59|3334.69|3345.78|3327.71|3352.09|3357.75|3379.45|3373.94|3380.16||3370.29|3386.15|3373.23|3337.75|3225.89|3128.21|3116.39|2978.76|2954.22|3090.23|3003.37|3130.12|3023.94|2972.37|2746.56|2882.23|2741.38|2480.64|2711.02|2386.13|2529.19|2398.1|2409.39|2304.92|2237.4|2447.33|2475.56|2630.07|2541.47|2626.65|2584.59|2470.5|2526.9|2488.65|2663.68|2659.41|2749.98|2789.82||2761.63|2846.06|2783.36|2799.55|2874.56|2823.16|2736.56|2799.31|2797.8|2836.74|2878.48|2863.39|2939.51|2912.43|2830.71|2842.74|2868.44|2848.42|2881.19|2929.8|2930.32|2870.12|2820|2852.5|2863.7|2953.91|2922.94|2971.61|2948.51|2955.45||2991.77|3036.13|3029.73|3044.31|3055.73|3080.82|3122.87|3112.35|3193.93|3232.39|3207.18|3190.14|3002.1|3041.31|3066.59|3124.74|3113.49|3115.34|3097.74|3117.86|3131.29|3050.33|3083.76|3009.05|3053.24|3100.29|3115.86|3130.01||3179.72|3145.32|3169.94|3152.05|3185.04|3155.22|3197.52|3226.56|3215.57|3224.73|3251.84|3257.3|3276.02|3235.66|3215.63|3239.41|3218.44|3258.44|3246.22|3271.12|3294.61|3306.51|3327.77|3349.16|3351.28|3360.47|3333.69|3380.35|3373.43|3372.85|3381.99|3389.78|3374.85|3385.51|3397.16|3431.28|3443.62|3478.73|3484.55|3508.01|3500.31|3526.65|3580.84|3455.06|3426.96||3331.84|3398.96|3339.19|3340.97|3383.54|3401.2|3385.49|3357.01|3319.47|3281.06|3315.57|3236.92|3246.59|3298.46|3351.6|3335.47|3363|3380.8|3348.44|3408.63|3360.95|3419.45|3446.83|3477.13|3534.22|3511.93|3488.67|3483.34|3483.81|3426.92|3443.12|3435.56|3453.49|3465.39|3400.97|3390.68|3271.03|3310.11|3269.96|3310.24|3369.16|3443.44|3510.45|3509.44|3550.5|3545.53|3572.66|3537.01|3585.15|3626.91|3609.53|3567.79|3581.87|3557.54|3577.59|3635.41|3629.65||3638.35|3621.63|3662.45|3669.01|3666.72|3699.12|3691.96|3702.25|3672.82|3668.1|3663.46|3647.49|3694.62|3701.17|3722.48|3709.41|3694.92|3687.26|3690.01|3703.06||3735.36|3727.04|3732.04|3756.07||3700.65|3726.86|3748.14|3803.79|3824.68|3799.61|3801.19|3809.84|3795.54|3768.25||3798.91|3851.85|3853.07|3841.47|3855.36|3849.62|3750.77|3787.38|3714.24|3773.86|3826.31|3830.17|3871.74|3886.83|3915.59|3911.23|3909.88|3916.38|3934.83||3932.59|3931.33|3913.97|3906.71|3876.5|3881.37|3925.43|3829.34|3811.15|3901.82|3870.29|3819.72|3768.47|3841.94|3821.35|3875.44|3898.81|3939.34|3943.34|3968.94|3962.71|3974.12|3915.46|3913.1|3940.59|3910.52|3889.14|3909.52|3974.54|3971.09|3958.55|3972.89|4019.87||4077.91|4073.94|4079.95|4097.17|4128.8|4127.99|4141.59|4124.66|4170.42|4185.47|4163.26|4134.94|4173.42|4134.98|4180.17|4187.62|4186.72|4183.18|4211.47|4181.17|4192.66|4164.66|4167.59|4201.62|4232.6|4188.43|4152.1|4063.04|4112.5|4173.85|4163.29|4127.83|4115.68|4159.12|4155.86|4197.05|4188.13|4195.99|4200.88|4204.11||4202.04|4208.12|4192.85|4229.89|4226.52|4227.26|4219.55|4239.18|4247.44|4255.15|4246.59|4223.7|4221.86|4166.45|4224.79|4246.44|4241.84|4266.49|4280.7|4290.61|4291.8|4297.5|4319.94|4352.34||4343.54|4358.13|4320.82|4369.55|4384.63|4369.21|4374.3|4360.03|4327.16|4258.49|4323.06|4358.69|4367.48|4411.79|4422.3|4401.46|4400.64|4419.15|4395.26|4387.16|4423.15|4402.66|4429.1|4436.52|4432.35|4436.75|4447.7|4460.83|4468|4479.71|4448.08|4400.27|4405.8|4441.67|4479.53|4486.23|4496.19|4470|4509.37|4528.79|4522.68|4524.09|4536.95|4535.43||4520.03|4514.07|4493.28|4458.58|4468.73|4443.05|4480.7|4473.75|4432.99|4357.73|4354.19|4395.64|4448.98|4455.48|4443.11|4352.63|4359.46|4307.54|4357.04|4300.46|4345.72|4363.55|4399.76|4391.34|4361.19|4350.65|4363.8|4438.26|4471.37|4486.46|4519.63|4536.19|4549.78|4544.9|4566.48|4574.79|4551.68|4596.42|4605.38|4613.67|4630.65|4660.57|4680.06|4697.53|4701.7|4685.25|4646.71|4649.27|4682.85|4682.8|4700.9|4688.67|4704.54|4697.96|4682.94|4690.7|4701.46||4594.62|4655.27|4567|4513.04|4577.1|4538.43|4591.67|4686.75|4701.21|4667.45|4712.02|4668.97|4634.09|4709.85|4668.67|4620.64|4568.02|4649.23|4696.56|4725.79||4791.19|4786.35|4793.06|4778.73|4766.18|4796.56|4793.54|4700.58|4696.05|4677.03|4670.29|4713.07|4726.35|4659.03|4662.85||4577.11|4532.76|4482.73|4397.94|4410.13|4356.45|4349.93|4326.51|4431.85|4515.55|4546.54|4589.38|4477.44|4500.53|4483.87|4521.54|4587.18|4504.08|4418.64|4401.67|4471.07|4475.01|4380.26|4348.87||4304.76|4225.5|4288.7|4384.65|4373.94|4306.26|4386.54|4363.49|4328.87|4201.09|4170.7|4277.88|4259.52|4204.31|4173.11|4262.45|4357.86|4411.67|4463.12|4461.18|4511.61|4456.24|4520.16|4543.06|4575.52|4631.6|4602.45|4530.41|4545.86|4582.64|4525.12|4481.15|4500.21|4488.28|4412.53|4397.45|4446.59|4392.59||4391.69|4462.21|4459.45|4393.66|4271.78|4296.12|4175.2|4183.96|4287.5|4131.93|4155.38|4175.48|4300.17|4146.87|4123.34|3991.24|4001.05|3935.18|3930.08|4023.89|4008.01|4088.85|3923.68|3900.79|3901.36|3973.75|3941.48|3978.73|4057.84|4158.24||4132.15|4101.23|4176.82|4108.54|4121.43|4160.68|4115.77|4017.82|3900.86|3749.63|3735.48|3789.99|3666.77|3674.84||3764.79|3759.89|3795.73|3911.74|3900.11|3821.55|3818.83|3785.38|3825.33||3831.39|3845.08|3902.62|3899.38|3854.43|3818.8|3801.78|3790.38|3863.16|3830.85|3936.69|3959.9|3998.95|3961.63|3966.84|3921.05|4023.61|4072.43|4130.29|4118.63|4091.19|4155.17|4151.94|4145.19|4140.06|4122.47|4210.24|4207.27|4280.15|4297.14|4305.2|4274.04|4283.74|4228.48|4137.99|4128.73|4140.77|4199.12|4057.66|4030.61|3986.16|3955|3966.85|3924.26||3908.19|3979.87|4006.18|4067.36|4110.41|3932.69|3946.01|3901.35|3873.33|3899.89|3855.93|3789.93|3757.99|3693.23|3655.04|3647.29|3719.04|3640.47|3585.62|3678.43|3790.93|3783.28|3744.52|3639.66|3612.39|3588.84|3577.03|3669.91|3583.07|3677.95|3719.98|3695.16|3665.78|3752.75|3797.34|3859.11|3830.6|3807.3|3901.06|3871.98|3856.1|3759.69|3719.89|3770.55|3806.8|3828.11|3748.57|3956.37|3992.93|3957.25|3991.73|3958.79|3946.56|3965.34|3949.94|4003.58|4027.26||4026.12|3963.94|3957.63|4080.11|4076.57|4071.7|3998.84|3941.26|3933.92|3963.51|3934.38|3990.56|4019.65|3995.32|3895.75|3852.36|3817.66|3821.62|3878.44|3822.39|3844.82||3829.25|3783.22|3849.28|3839.5||3824.14|3852.97|3808.1|3895.08|3892.09|3919.25|3969.61|3983.17|3999.09||3990.97|3928.86|3898.85|3972.61|4019.81|4016.95|4016.22|4060.43|4070.56|4017.77|4076.6|4119.21|4179.76|4136.48|4111.08|4164|4117.86|4081.5|4090.46|4137.29|4136.13|4147.6|4090.41|4079.09||3997.34|3991.05|4012.32|3970.04|3982.24|3970.15|3951.39|3981.35|4045.64|4048.42|3986.37|3992.01|3918.32|3861.59|3855.76|3919.29|3891.93|3960.28|3916.64|3951.57|4002.87|3936.97|3948.72|3970.99|3977.53|3971.27|4027.81|4050.83|4109.31|4124.51|4100.6|4090.38|4105.02||4109.11|4108.94|4091.95|4146.22|4137.64|4151.32|4154.87|4154.52|4129.79|4133.52|4137.04|4071.63|4055.99|4135.35|4169.48|4167.87|4119.58|4090.75|4061.22|4136.25|4138.12|4119.17|4137.64|4130.62|4124.08|4136.28|4109.9|4158.77|4198.05|4191.98|4192.63|4145.58|4115.24|4151.28|4205.45||4205.52|4179.83|4221.02|4282.37|4273.79|4283.85|4267.52|4293.93|4298.86|4338.93|4369.01|4372.59|4425.84|4409.59||4388.71|4365.69|4381.89|4348.33|4328.82|4378.41|4376.86|4396.44|4450.38|4455.59||4446.82|4411.59|4398.95|4409.53|4439.26|4472.16|4510.04|4505.42|4522.79|4554.98|4565.72|4534.87|4536.34|4554.64|4567.46|4566.75|4537.41|4582.23|4588.96|4576.73|4513.39|4501.89|4478.03|4518.44|4499.38|4467.71|4468.83|4464.05|4489.72|4437.86|4404.33|4370.36|4369.71|4399.77|4387.55|4436.01|4376.31|4405.71|4433.31|4497.63|4514.87|4507.66|4515.77||4496.83|4465.48|4451.14|4457.49|4487.46|4461.9|4467.44|4505.1|4450.32|4453.53|4443.95|4402.2|4330|4320.06|4337.44|4273.53|4274.51|4299.7|4288.05|4288.39|4229.45|4263.75|4258.19|4308.5|4335.66|4358.24|4376.95|4349.61|4327.78|4373.63|4373.2|4314.6|4278|4224.16|4217.04|4247.68|4186.77|4137.23|4117.37|4166.82|4193.8|4237.86|4317.78|4358.34|4365.98|4378.38|4382.78|4347.35|4415.24|4411.55|4495.7|4502.88|4508.24|4514.02|4547.38|4538.19|4556.62||4559.34|4550.43|4554.89|4550.58|4567.8|4594.63|4569.78|4567.18|4549.34|4585.59|4604.37|4622.44|4643.7|4707.09|4719.55|4719.19|4740.56|4768.37|4698.35|4746.75|4754.63||4774.75|4781.58|4783.35|4769.83||4742.83|4704.81|4688.68|4697.24|4763.54|4756.5|4783.45|4780.24|4783.83||4765.98|4739.21|4780.94|4839.81|4850.43|4864.6|4868.55|4894.16|4890.97|4927.93|4924.97|4845.65|4906.19|4958.61|4942.81|4954.23|4995.06|4997.91|5026.61|5021.84|4953.17|5000.62|5029.73|5005.57||4975.51|4981.8|5087.03|5088.8|5069.53|5078.18|5069.76|5096.27|5137.08|5130.95|5078.65|5104.76|5157.36|5123.69|5117.94|5175.27|5165.31|5150.48|5117.09|5149.42|5178.51|5224.62|5241.53|5234.18|5218.19|5203.58|5248.49|5254.35||5243.77|5205.81|5211.49|5147.21|5204.34|5202.39|5209.91|5160.64|5199.06|5123.41|5061.82|5051.41|5022.21|5011.12|4967.23|5010.6|5070.55|5071.63|5048.42|5099.96|5116.17|5035.69|5018.39|5064.2|5127.79|5180.74|5187.7|5187.67|5214.08|5222.68|5221.42|5246.68|5308.15|5297.1|5303.27|5308.13|5321.41|5307.01|5267.84|5304.72||5306.04|5266.95|5235.48|5277.51|5283.4|5291.34|5354.03|5352.96|5346.99|5360.79|5375.32|5421.03|5433.74|5431.6|5473.23|5487.03||5473.17|5464.62|5447.87|5469.3|5477.9|5482.87|5460.48|5475.09|5509.01|5537.02||5567.19|5572.85|5576.98|5633.91|5584.54|5615.35|5631.22|5667.2|5588.27|5544.59|5505|5564.41|5555.74|5427.13|5399.22|5459.1|5463.54|5436.44|5522.3|5446.68|5346.56|5186.33|5240.03|5199.5|5319.31|5344.16|5344.39|5434.43|5455.21|5543.22|5554.25|5608.25|5597.12|5620.85|5570.64|5634.61|5616.84|5625.8|5592.18|5591.96|5648.4||5528.93|5520.07|5503.41|5408.42|5471.05|5495.52|5554.13|5595.76|5626.02|5633.09|5634.58|5618.26|5713.64|5702.55|5718.57|5732.93|5722.26|5745.37|5738.17|5762.48|5708.75|5709.54|5699.94|5751.07|5695.94|5751.13|5792.04|5780.05|5815.03|5859.85|5815.26|5842.47|5841.47|5864.67|5853.98|5851.2|5797.42|5809.86|5808.12|5823.52|5832.92|5813.67|5705.45|5728.8|5712.69|5782.76|5929.04|5973.1|5995.54|6001.35|5983.99|5985.38|5949.17|5870.62|5893.62|5916.98|5917.11|5948.71|5969.34|5987.37|6021.63|5998.74||6032.38|6047.15|6049.88|6086.49|6075.11|6090.27|6052.85|6034.91|6084.19|6051.25|6051.09|6074.08|6050.61|5872.16|5867.08|5930.85|5974.07|6040.04||6037.59|5970.84|5906.94|5881.63||5868.55|5942.47|5975.38|5909.03|5918.25||5827.04|5836.22|5842.91|5949.91|5937.34|5996.66||6049.24|6086.37|6118.71|6101.24|6012.28|6067.7|6039.31|6071.17|6040.53|5994.57|6037.88|6061.48|6083.57|6025.99|6066.44|6068.5|6051.97|6115.07|6114.63||6129.58|6144.15|6117.52|6013.13|5983.25|5955.25|5956.06|5861.57|5954.5|5849.72|5778.15|5842.63|5738.52|5770.2|5614.56|5572.07|5599.3|5521.52|5638.94|5675.12|5614.66|5675.29|5662.89|5667.56|5767.57|5776.65|5712.2|5693.31|5580.94|5611.85|5633.07|5670.97|5396.52|5074.08|5062.25|4982.77|5456.9|5268.05|5363.36|5405.97|5396.63|5275.7|5282.7||5158.2|5287.76|5375.86|5484.77|5525.21|5528.75|5560.83|5569.06|5604.14|5686.67|5650.38|5606.91|5631.28|5663.94|5659.91|5844.19|5886.55|5892.58|5916.93|5958.38|5963.6|5940.46|5844.61|5842.01|5802.82||5921.54|5888.55|5912.17|5911.69|5935.94|5970.37|5970.81|5939.3|6000.36|6005.88|6038.81|6022.24|6045.26|5976.97|6033.11|5982.72|5980.87||5967.84|6025.17|6092.18|6092.16|6141.02|6173.07|6204.95|6198.01|6227.42|6279.35||6229.98|6225.52|6263.26|6280.46|6259.75|6268.56|6243.76|6263.7|6297.36|6296.79|6305.6|6309.62|6358.91|6363.35|6388.64|6389.77|6370.86|6362.9|6339.39|6238.01|6329.94|6299.19|6345.06|6340|6389.45|6373.45|6445.76|6466.58|6468.54|6449.8|6449.15|6411.37|6395.78|6370.17|6466.91|6439.32|6465.94|6481.4|6501.86|6460.26||6415.54|6448.26|6502.08|6481.5|6495.15|6512.61|6532.04|6587.47|6584.29|6615.28|6606.76|6600.35|6631.96|6664.36|6693.75|6656.92|6637.97|6604.72|6643.7|6661.21|6688.46|6711.2|6715.35|6715.79|6740.28|6714.59|6753.72|6735.11|6552.51|6654.72|6644.31|6671.06|6629.07|6664.01|6735.13|6735.35|6699.4|6738.44|6791.69|6875.16|6890.89|6890.59|6822.34|6840.2|6851.97|6771.55|6796.29|6720.32|6728.8|6832.43|6846.61|6850.92|6737.49|6734.11|6672.41|6617.32|6642.16|6538.76|6602.99|6705.12|6765.88|6812.61||6849.09|6812.63|6829.37|6849.72|6857.12|6870.4|6846.51|6840.51|6886.68|6901|6827.41|6816.51|6800.26|6721.43|6774.76|6834.5|6878.49|6909.79|6932.05||6929.94|6905.74|6896.24|6845.5||6858.47|6902.05|6944.82|6920.93|6921.46|6966.28|6977.27|6963.74|6926.6|6944.47|6940.01||6796.86|6875.62|6913.35|6915.61|6950.23|6978.6|6978.03|6969.01|6939.03|6976.44|6917.81|6882.72|6798.4|6932.3|6964.82|6941.81|6941.47","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-18f5111d","guard":[["not",["hasAny",["20200130","20200214","20200406","20200421","20200522","20200603","20200720","20200731","20200902","20200903","20201007","20201119","20201203","20210114","20210115","20210304","20210416","20210426","20210511","20210607","20210802","20210827","20210909","20211025","20211026","20211118","20220110","20220128","20220131","20220207","20220210","20220216","20220302","20220311","20220322","20220407","add","angeles","az","china","close","confirmed","cpi","dividend","greater","high","indicator","larger","lesser","makes","mortality","open","price","recovered","smaller","sum","temp"]]]],"pyramid":["render.template",{"lit":["The sp500 of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger sp500."]},["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-1b669b4e","guard":[["hasAny",["bigger than","compare","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The sp500 of ",{"slot":0}," is ",{"slot":1}," and that of ",{"slot":2}," is ",{"slot":3},", so ",{"slot":4}," has the larger sp500."]},["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-57c9fa0e","guard":[["has","compare"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-03-20 versus 2018-02-23: compare their sp500":"The sp500 of 2023-03-20 is 3951.57 and that of 2018-02-23 is 2747.3, so 2023-03-20 has the larger sp500.","compare the sp500 of 2021-07-26 and 2017-04-27":"The sp500 of 2021-07-26 is 4422.3 and that of 2017-04-27 is 2388.77, so 2021-07-26 has the larger sp500.","compare the sp500 of 2017-03-06 and 2018-02-12":"The sp500 of 2017-03-06 is 2375.31 and that of 2018-02-12 is 2656, so 2018-02-12 has the larger sp500.","2024-11-07 versus 2019-03-13: compare their sp500":"The sp500 of 2024-11-07 is 5973.1 and that of 2019-03-13 is 2810.92, so 2024-11-07 has the larger sp500.","compare the sp500 of 2018-08-09 and 2018-11-19":"The sp500 of 2018-08-09 is 2853.58 and that of 2018-11-19 is 2690.73, so 2018-08-09 has the larger sp500.","2023-09-11 versus 2017-03-06: compare their sp500":"The sp500 of 2023-09-11 is 4487.46 and that of 2017-03-06 is 2375.31, so 2023-09-11 has the larger sp500.","how does the sp500 of 2020-10-09 compare with that of 2020-08-17":"The sp500 of 2020-10-09 is 3477.13 and that of 2020-08-17 is 3381.99, so 2020-10-09 has the larger sp500.","compare the sp500 of 2024-04-02 and 2017-11-03":"The sp500 of 2024-04-02 is 5205.81 and that of 2017-11-03 is 2587.84, so 2024-04-02 has the larger sp500.","2022-06-24 versus 2016-11-08: compare their sp500":"The sp500 of 2022-06-24 is 3911.74 and that of 2016-11-08 is 2139.56, so 2022-06-24 has the larger sp500.","how does the sp500 of 2025-05-22 compare with that of 2024-12-17":"The sp500 of 2025-05-22 is 5842.01 and that of 2024-12-17 is 6050.61, so 2024-12-17 has the larger sp500.","how does the sp500 of 2018-02-12 compare with that of 2016-06-14":"The sp500 of 2018-02-12 is 2656 and that of 2016-06-14 is 2075.32, so 2018-02-12 has the larger sp500.","compare the sp500 of 2020-07-13 and 2018-07-03":"The sp500 of 2020-07-13 is 3155.22 and that of 2018-07-03 is 2713.22, so 2020-07-13 has the larger sp500.","compare the sp500 of 2025-02-20 and 2019-04-15":"The sp500 of 2025-02-20 is 6117.52 and that of 2019-04-15 is 2905.58, so 2025-02-20 has the larger sp500.","how does the sp500 of 2019-07-17 compare with that of 2024-11-07":"The sp500 of 2019-07-17 is 2984.42 and that of 2024-11-07 is 5973.1, so 2024-11-07 has the larger sp500.","compare the sp500 of 2017-03-28 and 2016-07-22":"The sp500 of 2017-03-28 is 2358.57 and that of 2016-07-22 is 2175.03, so 2017-03-28 has the larger sp500.","how does the sp500 of 2021-10-13 compare with that of 2023-01-25":"The sp500 of 2021-10-13 is 4363.8 and that of 2023-01-25 is 4016.22, so 2021-10-13 has the larger sp500.","2021-04-01 versus 2018-10-25: compare their sp500":"The sp500 of 2021-04-01 is 4019.87 and that of 2018-10-25 is 2705.57, so 2021-04-01 has the larger sp500.","how does the sp500 of 2021-05-10 compare with that of 2021-02-10":"The sp500 of 2021-05-10 is 4188.43 and that of 2021-02-10 is 3909.88, so 2021-05-10 has the larger sp500.","2020-08-17 versus 2021-10-12: compare their sp500":"The sp500 of 2020-08-17 is 3381.99 and that of 2021-10-12 is 4350.65, so 2021-10-12 has the larger sp500.","compare the sp500 of 2020-02-12 and 2018-08-17":"The sp500 of 2020-02-12 is 3379.45 and that of 2018-08-17 is 2850.13, so 2020-02-12 has the larger sp500.","compare the sp500 of 2016-11-08 and 2025-05-22":"The sp500 of 2016-11-08 is 2139.56 and that of 2025-05-22 is 5842.01, so 2025-05-22 has the larger sp500.","2024-01-26 versus 2020-12-31: compare their sp500":"The sp500 of 2024-01-26 is 4890.97 and that of 2020-12-31 is 3756.07, so 2024-01-26 has the larger sp500.","compare the sp500 of 2021-11-29 and 2017-03-16":"The sp500 of 2021-11-29 is 4655.27 and that of 2017-03-16 is 2381.38, so 2021-11-29 has the larger sp500.","compare the sp500 of 2018-02-23 and 2019-06-19":"The sp500 of 2018-02-23 is 2747.3 and that of 2019-06-19 is 2926.46, so 2019-06-19 has the larger sp500.","how does the sp500 of 2016-09-30 compare with that of 2019-04-02":"The sp500 of 2016-09-30 is 2168.27 and that of 2019-04-02 is 2867.24, so 2019-04-02 has the larger sp500.","2025-07-17 versus 2022-08-18: compare their sp500":"The sp500 of 2025-07-17 is 6297.36 and that of 2022-08-18 is 4283.74, so 2025-07-17 has the larger sp500.","2022-08-23 versus 2023-02-21: compare their sp500":"The sp500 of 2022-08-23 is 4128.73 and that of 2023-02-21 is 3997.34, so 2022-08-23 has the larger sp500.","compare the sp500 of 2025-02-28 and 2019-07-17":"The sp500 of 2025-02-28 is 5954.5 and that of 2019-07-17 is 2984.42, so 2025-02-28 has the larger sp500.","how does the sp500 of 2021-09-15 compare with that of 2017-08-31":"The sp500 of 2021-09-15 is 4480.7 and that of 2017-08-31 is 2471.65, so 2021-09-15 has the larger sp500.","2021-02-09 versus 2020-02-12: compare their sp500":"The sp500 of 2021-02-09 is 3911.23 and that of 2020-02-12 is 3379.45, so 2021-02-09 has the larger sp500.","2017-11-24 versus 2023-11-01: compare their sp500":"The sp500 of 2017-11-24 is 2602.42 and that of 2023-11-01 is 4237.86, so 2023-11-01 has the larger sp500.","compare the sp500 of 2021-10-12 and 2016-09-30":"The sp500 of 2021-10-12 is 4350.65 and that of 2016-09-30 is 2168.27, so 2021-10-12 has the larger sp500.","compare the sp500 of 2018-10-25 and 2020-10-09":"The sp500 of 2018-10-25 is 2705.57 and that of 2020-10-09 is 3477.13, so 2020-10-09 has the larger sp500.","compare the sp500 of 2023-02-21 and 2020-03-03":"The sp500 of 2023-02-21 is 3997.34 and that of 2020-03-03 is 3003.37, so 2023-02-21 has the larger sp500.","2021-02-10 versus 2023-11-14: compare their sp500":"The sp500 of 2021-02-10 is 3909.88 and that of 2023-11-14 is 4495.7, so 2023-11-14 has the larger sp500.","compare the sp500 of 2021-12-20 and 2021-09-15":"The sp500 of 2021-12-20 is 4568.02 and that of 2021-09-15 is 4480.7, so 2021-12-20 has the larger sp500.","how does the sp500 of 2018-12-20 compare with that of 2018-03-28":"The sp500 of 2018-12-20 is 2467.42 and that of 2018-03-28 is 2605, so 2018-03-28 has the larger sp500.","2018-12-24 versus 2022-12-05: compare their sp500":"The sp500 of 2018-12-24 is 2351.1 and that of 2022-12-05 is 3998.84, so 2022-12-05 has the larger sp500.","2023-08-15 versus 2020-07-13: compare their sp500":"The sp500 of 2023-08-15 is 4437.86 and that of 2020-07-13 is 3155.22, so 2023-08-15 has the larger sp500.","compare the sp500 of 2016-05-12 and 2021-09-16":"The sp500 of 2016-05-12 is 2064.11 and that of 2021-09-16 is 4473.75, so 2021-09-16 has the larger sp500.","2018-03-28 versus 2021-12-20: compare their sp500":"The sp500 of 2018-03-28 is 2605 and that of 2021-12-20 is 4568.02, so 2021-12-20 has the larger sp500.","compare the sp500 of 2018-12-31 and 2021-12-23":"The sp500 of 2018-12-31 is 2506.85 and that of 2021-12-23 is 4725.79, so 2021-12-23 has the larger sp500.","how does the sp500 of 2018-07-03 compare with that of 2026-01-20":"The sp500 of 2018-07-03 is 2713.22 and that of 2026-01-20 is 6796.86, so 2026-01-20 has the larger sp500.","compare the sp500 of 2022-12-05 and 2021-05-04":"The sp500 of 2022-12-05 is 3998.84 and that of 2021-05-04 is 4164.66, so 2021-05-04 has the larger sp500.","compare the sp500 of 2017-08-16 and 2019-12-18":"The sp500 of 2017-08-16 is 2468.11 and that of 2019-12-18 is 3191.14, so 2019-12-18 has the larger sp500.","2024-12-17 versus 2020-11-05: compare their sp500":"The sp500 of 2024-12-17 is 6050.61 and that of 2020-11-05 is 3510.45, so 2024-12-17 has the larger sp500.","2017-11-16 versus 2023-11-06: compare their sp500":"The sp500 of 2017-11-16 is 2585.64 and that of 2023-11-06 is 4365.98, so 2023-11-06 has the larger sp500.","compare the sp500 of 2017-12-19 and 2021-05-10":"The sp500 of 2017-12-19 is 2681.47 and that of 2021-05-10 is 4188.43, so 2021-05-10 has the larger sp500.","compare the sp500 of 2024-06-28 and 2017-05-02":"The sp500 of 2024-06-28 is 5460.48 and that of 2017-05-02 is 2391.17, so 2024-06-28 has the larger sp500.","how does the sp500 of 2022-01-24 compare with that of 2020-12-18":"The sp500 of 2022-01-24 is 4410.13 and that of 2020-12-18 is 3709.41, so 2022-01-24 has the larger sp500.","2023-07-27 versus 2021-11-29: compare their sp500":"The sp500 of 2023-07-27 is 4537.41 and that of 2021-11-29 is 4655.27, so 2021-11-29 has the larger sp500.","how does the sp500 of 2021-05-04 compare with that of 2019-09-13":"The sp500 of 2021-05-04 is 4164.66 and that of 2019-09-13 is 3007.39, so 2021-05-04 has the larger sp500.","2023-03-01 versus 2017-08-09: compare their sp500":"The sp500 of 2023-03-01 is 3951.39 and that of 2017-08-09 is 2474.02, so 2023-03-01 has the larger sp500.","how does the sp500 of 2017-04-27 compare with that of 2023-07-27":"The sp500 of 2017-04-27 is 2388.77 and that of 2023-07-27 is 4537.41, so 2023-07-27 has the larger sp500.","how does the sp500 of 2022-01-18 compare with that of 2023-08-15":"The sp500 of 2022-01-18 is 4577.11 and that of 2023-08-15 is 4437.86, so 2022-01-18 has the larger sp500.","2026-01-20 versus 2025-02-28: compare their sp500":"The sp500 of 2026-01-20 is 6796.86 and that of 2025-02-28 is 5954.5, so 2026-01-20 has the larger sp500.","how does the sp500 of 2016-07-11 compare with that of 2025-07-17":"The sp500 of 2016-07-11 is 2137.16 and that of 2025-07-17 is 6297.36, so 2025-07-17 has the larger sp500.","compare the sp500 of 2022-08-18 and 2019-12-26":"The sp500 of 2022-08-18 is 4283.74 and that of 2019-12-26 is 3239.91, so 2022-08-18 has the larger sp500.","2019-04-02 versus 2017-12-19: compare their sp500":"The sp500 of 2019-04-02 is 2867.24 and that of 2017-12-19 is 2681.47, so 2019-04-02 has the larger sp500.","how does the sp500 of 2025-02-21 compare with that of 2019-09-11":"The sp500 of 2025-02-21 is 6013.13 and that of 2019-09-11 is 3000.93, so 2025-02-21 has the larger sp500.","2016-06-14 versus 2021-08-17: compare their sp500":"The sp500 of 2016-06-14 is 2075.32 and that of 2021-08-17 is 4448.08, so 2021-08-17 has the larger sp500.","compare the sp500 of 2019-03-13 and 2021-10-13":"The sp500 of 2019-03-13 is 2810.92 and that of 2021-10-13 is 4363.8, so 2021-10-13 has the larger sp500.","how does the sp500 of 2017-11-03 compare with that of 2021-06-24":"The sp500 of 2017-11-03 is 2587.84 and that of 2021-06-24 is 4266.49, so 2021-06-24 has the larger sp500.","how does the sp500 of 2025-07-03 compare with that of 2022-02-24":"The sp500 of 2025-07-03 is 6279.35 and that of 2022-02-24 is 4288.7, so 2025-07-03 has the larger sp500.","2017-09-18 versus 2016-05-12: compare their sp500":"The sp500 of 2017-09-18 is 2503.87 and that of 2016-05-12 is 2064.11, so 2017-09-18 has the larger sp500.","2023-01-25 versus 2025-02-20: compare their sp500":"The sp500 of 2023-01-25 is 4016.22 and that of 2025-02-20 is 6117.52, so 2025-02-20 has the larger sp500.","2017-01-03 versus 2018-08-09: compare their sp500":"The sp500 of 2017-01-03 is 2257.83 and that of 2018-08-09 is 2853.58, so 2018-08-09 has the larger sp500.","compare the sp500 of 2021-08-17 and 2025-06-23":"The sp500 of 2021-08-17 is 4448.08 and that of 2025-06-23 is 6025.17, so 2025-06-23 has the larger sp500.","2019-09-13 versus 2024-04-02: compare their sp500":"The sp500 of 2019-09-13 is 3007.39 and that of 2024-04-02 is 5205.81, so 2024-04-02 has the larger sp500.","compare the sp500 of 2023-11-01 and 2022-01-18":"The sp500 of 2023-11-01 is 4237.86 and that of 2022-01-18 is 4577.11, so 2022-01-18 has the larger sp500.","how does the sp500 of 2018-11-19 compare with that of 2018-12-24":"The sp500 of 2018-11-19 is 2690.73 and that of 2018-12-24 is 2351.1, so 2018-11-19 has the larger sp500.","2022-02-24 versus 2017-08-16: compare their sp500":"The sp500 of 2022-02-24 is 4288.7 and that of 2017-08-16 is 2468.11, so 2022-02-24 has the larger sp500.","compare the sp500 of 2023-11-06 and 2021-03-11":"The sp500 of 2023-11-06 is 4365.98 and that of 2021-03-11 is 3939.34, so 2023-11-06 has the larger sp500.","how does the sp500 of 2019-04-15 compare with that of 2016-09-23":"The sp500 of 2019-04-15 is 2905.58 and that of 2016-09-23 is 2164.69, so 2019-04-15 has the larger sp500.","how does the sp500 of 2021-03-11 compare with that of 2022-08-23":"The sp500 of 2021-03-11 is 3939.34 and that of 2022-08-23 is 4128.73, so 2022-08-23 has the larger sp500.","how does the sp500 of 2020-03-03 compare with that of 2023-03-20":"The sp500 of 2020-03-03 is 3003.37 and that of 2023-03-20 is 3951.57, so 2023-03-20 has the larger sp500.","2017-08-31 versus 2016-10-11: compare their sp500":"The sp500 of 2017-08-31 is 2471.65 and that of 2016-10-11 is 2136.73, so 2017-08-31 has the larger sp500.","2016-09-23 versus 2017-07-12: compare their sp500":"The sp500 of 2016-09-23 is 2164.69 and that of 2017-07-12 is 2443.25, so 2017-07-12 has the larger sp500.","how does the sp500 of 2023-05-18 compare with that of 2017-09-18":"The sp500 of 2023-05-18 is 4198.05 and that of 2017-09-18 is 2503.87, so 2023-05-18 has the larger sp500.","how does the sp500 of 2017-05-02 compare with that of 2023-03-01":"The sp500 of 2017-05-02 is 2391.17 and that of 2023-03-01 is 3951.39, so 2023-03-01 has the larger sp500.","how does the sp500 of 2017-03-16 compare with that of 2017-11-24":"The sp500 of 2017-03-16 is 2381.38 and that of 2017-11-24 is 2602.42, so 2017-11-24 has the larger sp500.","how does the sp500 of 2021-12-23 compare with that of 2021-04-01":"The sp500 of 2021-12-23 is 4725.79 and that of 2021-04-01 is 4019.87, so 2021-12-23 has the larger sp500.","how does the sp500 of 2025-06-23 compare with that of 2017-11-16":"The sp500 of 2025-06-23 is 6025.17 and that of 2017-11-16 is 2585.64, so 2025-06-23 has the larger sp500.","how does the sp500 of 2021-09-16 compare with that of 2021-02-09":"The sp500 of 2021-09-16 is 4473.75 and that of 2021-02-09 is 3911.23, so 2021-09-16 has the larger sp500.","how does the sp500 of 2019-12-18 compare with that of 2017-01-03":"The sp500 of 2019-12-18 is 3191.14 and that of 2017-01-03 is 2257.83, so 2019-12-18 has the larger sp500.","2020-01-31 versus 2021-07-26: compare their sp500":"The sp500 of 2020-01-31 is 3225.52 and that of 2021-07-26 is 4422.3, so 2021-07-26 has the larger sp500.","compare the sp500 of 2017-08-09 and 2025-07-03":"The sp500 of 2017-08-09 is 2474.02 and that of 2025-07-03 is 6279.35, so 2025-07-03 has the larger sp500.","compare the sp500 of 2023-11-14 and 2022-01-24":"The sp500 of 2023-11-14 is 4495.7 and that of 2022-01-24 is 4410.13, so 2023-11-14 has the larger sp500.","how does the sp500 of 2019-06-19 compare with that of 2024-01-26":"The sp500 of 2019-06-19 is 2926.46 and that of 2024-01-26 is 4890.97, so 2024-01-26 has the larger sp500.","compare the sp500 of 2020-11-05 and 2025-02-21":"The sp500 of 2020-11-05 is 3510.45 and that of 2025-02-21 is 6013.13, so 2025-02-21 has the larger sp500.","2020-12-18 versus 2024-06-28: compare their sp500":"The sp500 of 2020-12-18 is 3709.41 and that of 2024-06-28 is 5460.48, so 2024-06-28 has the larger sp500.","2021-06-24 versus 2017-03-28: compare their sp500":"The sp500 of 2021-06-24 is 4266.49 and that of 2017-03-28 is 2358.57, so 2021-06-24 has the larger sp500.","how does the sp500 of 2019-12-26 compare with that of 2023-09-11":"The sp500 of 2019-12-26 is 3239.91 and that of 2023-09-11 is 4487.46, so 2023-09-11 has the larger sp500.","2019-09-11 versus 2020-10-02: compare their sp500":"The sp500 of 2019-09-11 is 3000.93 and that of 2020-10-02 is 3348.44, so 2020-10-02 has the larger sp500.","how does the sp500 of 2018-08-17 compare with that of 2022-06-24":"The sp500 of 2018-08-17 is 2850.13 and that of 2022-06-24 is 3911.74, so 2022-06-24 has the larger sp500.","compare the sp500 of 2016-10-11 and 2020-12-02":"The sp500 of 2016-10-11 is 2136.73 and that of 2020-12-02 is 3669.01, so 2020-12-02 has the larger sp500.","compare the sp500 of 2020-10-02 and 2018-12-20":"The sp500 of 2020-10-02 is 3348.44 and that of 2018-12-20 is 2467.42, so 2020-10-02 has the larger sp500.","compare the sp500 of 2017-07-12 and 2016-07-11":"The sp500 of 2017-07-12 is 2443.25 and that of 2016-07-11 is 2137.16, so 2017-07-12 has the larger sp500.","compare the sp500 of 2020-12-31 and 2023-05-18":"The sp500 of 2020-12-31 is 3756.07 and that of 2023-05-18 is 4198.05, so 2023-05-18 has the larger sp500.","how does the sp500 of 2016-07-22 compare with that of 2020-01-31":"The sp500 of 2016-07-22 is 2175.03 and that of 2020-01-31 is 3225.52, so 2020-01-31 has the larger sp500."}}},
{"id":"n-e657bcc3","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","of","position"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-6d897390","guard":[["hasAny",["bigger than","element","exceeds","greater than","invert case","item number","larger than","more than","nth","of","position","swap case","toggle case"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.swapCase",["sense.numeral"]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-9c4ebbb7","guard":[["hasAny",["bigger than","class name","element","exceeds","greater than","item number","larger than","more than","nth","of","pascal case","pascalcase","position","upper camel case"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.pascal",["sense.numeral"]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-1b6b22ce","guard":[["hasAny",["bigger than","delete","element","exceeds","greater than","item number","larger than","more than","nth","of","position","remove","strip out","without"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["sense.numeral"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-4e4c2a9f","guard":[["hasAny",["bigger than","each word","element","exceeds","greater than","item number","larger than","more than","nth","of","position","split into words","words"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["render.list",["transform.words",["sense.numeral"]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-619282fd","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","of","position"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-8bd290b6","guard":[["hasAny",["bigger than","each word","element","exceeds","greater than","item number","larger than","more than","nth","of","position","split into words","words"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["render.and",["transform.words",["sense.numeral"]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-b6a410b4","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","of","position"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-785a4e83","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","of","position"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-837b8eb1","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","of","position"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-8a25f8b8","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","of","position"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-a0b60675","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","of","position"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-7f512a69","guard":[["has","compare"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"2021-07-26 and 2017-04-27":"The sp500 of 2021-07-26 is 4422.3 and that of 2017-04-27 is 2388.77, so 2021-07-26 has the larger sp500.","2017-03-06 and 2018-02-12":"The sp500 of 2017-03-06 is 2375.31 and that of 2018-02-12 is 2656, so 2018-02-12 has the larger sp500.","2018-08-09 and 2018-11-19":"The sp500 of 2018-08-09 is 2853.58 and that of 2018-11-19 is 2690.73, so 2018-08-09 has the larger sp500.","2020-10-09 compare with that of 2020-08-17":"The sp500 of 2020-10-09 is 3477.13 and that of 2020-08-17 is 3381.99, so 2020-10-09 has the larger sp500.","2024-04-02 and 2017-11-03":"The sp500 of 2024-04-02 is 5205.81 and that of 2017-11-03 is 2587.84, so 2024-04-02 has the larger sp500.","2025-05-22 compare with that of 2024-12-17":"The sp500 of 2025-05-22 is 5842.01 and that of 2024-12-17 is 6050.61, so 2024-12-17 has the larger sp500.","2018-02-12 compare with that of 2016-06-14":"The sp500 of 2018-02-12 is 2656 and that of 2016-06-14 is 2075.32, so 2018-02-12 has the larger sp500.","2020-07-13 and 2018-07-03":"The sp500 of 2020-07-13 is 3155.22 and that of 2018-07-03 is 2713.22, so 2020-07-13 has the larger sp500.","2025-02-20 and 2019-04-15":"The sp500 of 2025-02-20 is 6117.52 and that of 2019-04-15 is 2905.58, so 2025-02-20 has the larger sp500.","2019-07-17 compare with that of 2024-11-07":"The sp500 of 2019-07-17 is 2984.42 and that of 2024-11-07 is 5973.1, so 2024-11-07 has the larger sp500.","2017-03-28 and 2016-07-22":"The sp500 of 2017-03-28 is 2358.57 and that of 2016-07-22 is 2175.03, so 2017-03-28 has the larger sp500.","2021-10-13 compare with that of 2023-01-25":"The sp500 of 2021-10-13 is 4363.8 and that of 2023-01-25 is 4016.22, so 2021-10-13 has the larger sp500.","2021-05-10 compare with that of 2021-02-10":"The sp500 of 2021-05-10 is 4188.43 and that of 2021-02-10 is 3909.88, so 2021-05-10 has the larger sp500.","2020-02-12 and 2018-08-17":"The sp500 of 2020-02-12 is 3379.45 and that of 2018-08-17 is 2850.13, so 2020-02-12 has the larger sp500.","2016-11-08 and 2025-05-22":"The sp500 of 2016-11-08 is 2139.56 and that of 2025-05-22 is 5842.01, so 2025-05-22 has the larger sp500.","2021-11-29 and 2017-03-16":"The sp500 of 2021-11-29 is 4655.27 and that of 2017-03-16 is 2381.38, so 2021-11-29 has the larger sp500.","2018-02-23 and 2019-06-19":"The sp500 of 2018-02-23 is 2747.3 and that of 2019-06-19 is 2926.46, so 2019-06-19 has the larger sp500.","2016-09-30 compare with that of 2019-04-02":"The sp500 of 2016-09-30 is 2168.27 and that of 2019-04-02 is 2867.24, so 2019-04-02 has the larger sp500.","2025-02-28 and 2019-07-17":"The sp500 of 2025-02-28 is 5954.5 and that of 2019-07-17 is 2984.42, so 2025-02-28 has the larger sp500.","2021-09-15 compare with that of 2017-08-31":"The sp500 of 2021-09-15 is 4480.7 and that of 2017-08-31 is 2471.65, so 2021-09-15 has the larger sp500.","2021-10-12 and 2016-09-30":"The sp500 of 2021-10-12 is 4350.65 and that of 2016-09-30 is 2168.27, so 2021-10-12 has the larger sp500.","2018-10-25 and 2020-10-09":"The sp500 of 2018-10-25 is 2705.57 and that of 2020-10-09 is 3477.13, so 2020-10-09 has the larger sp500.","2023-02-21 and 2020-03-03":"The sp500 of 2023-02-21 is 3997.34 and that of 2020-03-03 is 3003.37, so 2023-02-21 has the larger sp500.","2021-12-20 and 2021-09-15":"The sp500 of 2021-12-20 is 4568.02 and that of 2021-09-15 is 4480.7, so 2021-12-20 has the larger sp500.","2018-12-20 compare with that of 2018-03-28":"The sp500 of 2018-12-20 is 2467.42 and that of 2018-03-28 is 2605, so 2018-03-28 has the larger sp500.","2016-05-12 and 2021-09-16":"The sp500 of 2016-05-12 is 2064.11 and that of 2021-09-16 is 4473.75, so 2021-09-16 has the larger sp500.","2018-12-31 and 2021-12-23":"The sp500 of 2018-12-31 is 2506.85 and that of 2021-12-23 is 4725.79, so 2021-12-23 has the larger sp500.","2018-07-03 compare with that of 2026-01-20":"The sp500 of 2018-07-03 is 2713.22 and that of 2026-01-20 is 6796.86, so 2026-01-20 has the larger sp500.","2022-12-05 and 2021-05-04":"The sp500 of 2022-12-05 is 3998.84 and that of 2021-05-04 is 4164.66, so 2021-05-04 has the larger sp500.","2017-08-16 and 2019-12-18":"The sp500 of 2017-08-16 is 2468.11 and that of 2019-12-18 is 3191.14, so 2019-12-18 has the larger sp500.","2017-12-19 and 2021-05-10":"The sp500 of 2017-12-19 is 2681.47 and that of 2021-05-10 is 4188.43, so 2021-05-10 has the larger sp500.","2024-06-28 and 2017-05-02":"The sp500 of 2024-06-28 is 5460.48 and that of 2017-05-02 is 2391.17, so 2024-06-28 has the larger sp500.","2022-01-24 compare with that of 2020-12-18":"The sp500 of 2022-01-24 is 4410.13 and that of 2020-12-18 is 3709.41, so 2022-01-24 has the larger sp500.","2021-05-04 compare with that of 2019-09-13":"The sp500 of 2021-05-04 is 4164.66 and that of 2019-09-13 is 3007.39, so 2021-05-04 has the larger sp500.","2017-04-27 compare with that of 2023-07-27":"The sp500 of 2017-04-27 is 2388.77 and that of 2023-07-27 is 4537.41, so 2023-07-27 has the larger sp500.","2022-01-18 compare with that of 2023-08-15":"The sp500 of 2022-01-18 is 4577.11 and that of 2023-08-15 is 4437.86, so 2022-01-18 has the larger sp500.","2016-07-11 compare with that of 2025-07-17":"The sp500 of 2016-07-11 is 2137.16 and that of 2025-07-17 is 6297.36, so 2025-07-17 has the larger sp500.","2022-08-18 and 2019-12-26":"The sp500 of 2022-08-18 is 4283.74 and that of 2019-12-26 is 3239.91, so 2022-08-18 has the larger sp500.","2025-02-21 compare with that of 2019-09-11":"The sp500 of 2025-02-21 is 6013.13 and that of 2019-09-11 is 3000.93, so 2025-02-21 has the larger sp500.","2019-03-13 and 2021-10-13":"The sp500 of 2019-03-13 is 2810.92 and that of 2021-10-13 is 4363.8, so 2021-10-13 has the larger sp500.","2017-11-03 compare with that of 2021-06-24":"The sp500 of 2017-11-03 is 2587.84 and that of 2021-06-24 is 4266.49, so 2021-06-24 has the larger sp500.","2025-07-03 compare with that of 2022-02-24":"The sp500 of 2025-07-03 is 6279.35 and that of 2022-02-24 is 4288.7, so 2025-07-03 has the larger sp500.","2021-08-17 and 2025-06-23":"The sp500 of 2021-08-17 is 4448.08 and that of 2025-06-23 is 6025.17, so 2025-06-23 has the larger sp500.","2023-11-01 and 2022-01-18":"The sp500 of 2023-11-01 is 4237.86 and that of 2022-01-18 is 4577.11, so 2022-01-18 has the larger sp500.","2018-11-19 compare with that of 2018-12-24":"The sp500 of 2018-11-19 is 2690.73 and that of 2018-12-24 is 2351.1, so 2018-11-19 has the larger sp500.","2023-11-06 and 2021-03-11":"The sp500 of 2023-11-06 is 4365.98 and that of 2021-03-11 is 3939.34, so 2023-11-06 has the larger sp500.","2019-04-15 compare with that of 2016-09-23":"The sp500 of 2019-04-15 is 2905.58 and that of 2016-09-23 is 2164.69, so 2019-04-15 has the larger sp500.","2021-03-11 compare with that of 2022-08-23":"The sp500 of 2021-03-11 is 3939.34 and that of 2022-08-23 is 4128.73, so 2022-08-23 has the larger sp500.","2020-03-03 compare with that of 2023-03-20":"The sp500 of 2020-03-03 is 3003.37 and that of 2023-03-20 is 3951.57, so 2023-03-20 has the larger sp500.","2023-05-18 compare with that of 2017-09-18":"The sp500 of 2023-05-18 is 4198.05 and that of 2017-09-18 is 2503.87, so 2023-05-18 has the larger sp500.","2017-05-02 compare with that of 2023-03-01":"The sp500 of 2017-05-02 is 2391.17 and that of 2023-03-01 is 3951.39, so 2023-03-01 has the larger sp500.","2017-03-16 compare with that of 2017-11-24":"The sp500 of 2017-03-16 is 2381.38 and that of 2017-11-24 is 2602.42, so 2017-11-24 has the larger sp500.","2021-12-23 compare with that of 2021-04-01":"The sp500 of 2021-12-23 is 4725.79 and that of 2021-04-01 is 4019.87, so 2021-12-23 has the larger sp500.","2025-06-23 compare with that of 2017-11-16":"The sp500 of 2025-06-23 is 6025.17 and that of 2017-11-16 is 2585.64, so 2025-06-23 has the larger sp500.","2021-09-16 compare with that of 2021-02-09":"The sp500 of 2021-09-16 is 4473.75 and that of 2021-02-09 is 3911.23, so 2021-09-16 has the larger sp500.","2019-12-18 compare with that of 2017-01-03":"The sp500 of 2019-12-18 is 3191.14 and that of 2017-01-03 is 2257.83, so 2019-12-18 has the larger sp500.","2017-08-09 and 2025-07-03":"The sp500 of 2017-08-09 is 2474.02 and that of 2025-07-03 is 6279.35, so 2025-07-03 has the larger sp500.","2023-11-14 and 2022-01-24":"The sp500 of 2023-11-14 is 4495.7 and that of 2022-01-24 is 4410.13, so 2023-11-14 has the larger sp500.","2019-06-19 compare with that of 2024-01-26":"The sp500 of 2019-06-19 is 2926.46 and that of 2024-01-26 is 4890.97, so 2024-01-26 has the larger sp500.","2020-11-05 and 2025-02-21":"The sp500 of 2020-11-05 is 3510.45 and that of 2025-02-21 is 6013.13, so 2025-02-21 has the larger sp500.","2019-12-26 compare with that of 2023-09-11":"The sp500 of 2019-12-26 is 3239.91 and that of 2023-09-11 is 4487.46, so 2023-09-11 has the larger sp500.","2018-08-17 compare with that of 2022-06-24":"The sp500 of 2018-08-17 is 2850.13 and that of 2022-06-24 is 3911.74, so 2022-06-24 has the larger sp500.","2016-10-11 and 2020-12-02":"The sp500 of 2016-10-11 is 2136.73 and that of 2020-12-02 is 3669.01, so 2020-12-02 has the larger sp500.","2020-10-02 and 2018-12-20":"The sp500 of 2020-10-02 is 3348.44 and that of 2018-12-20 is 2467.42, so 2020-10-02 has the larger sp500.","2017-07-12 and 2016-07-11":"The sp500 of 2017-07-12 is 2443.25 and that of 2016-07-11 is 2137.16, so 2017-07-12 has the larger sp500.","2020-12-31 and 2023-05-18":"The sp500 of 2020-12-31 is 3756.07 and that of 2023-05-18 is 4198.05, so 2023-05-18 has the larger sp500.","2016-07-22 compare with that of 2020-01-31":"The sp500 of 2016-07-22 is 2175.03 and that of 2020-01-31 is 3225.52, so 2020-01-31 has the larger sp500."}}},
{"id":"n-f3669308","guard":[["has","compare"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"sp500"}]]],"mem":{"table":{"of 2021-07-26 and 2017-04-27":"The sp500 of 2021-07-26 is 4422.3 and that of 2017-04-27 is 2388.77, so 2021-07-26 has the larger sp500.","of 2017-03-06 and 2018-02-12":"The sp500 of 2017-03-06 is 2375.31 and that of 2018-02-12 is 2656, so 2018-02-12 has the larger sp500.","of 2018-08-09 and 2018-11-19":"The sp500 of 2018-08-09 is 2853.58 and that of 2018-11-19 is 2690.73, so 2018-08-09 has the larger sp500.","of 2020-10-09 compare with that of 2020-08-17":"The sp500 of 2020-10-09 is 3477.13 and that of 2020-08-17 is 3381.99, so 2020-10-09 has the larger sp500.","of 2024-04-02 and 2017-11-03":"The sp500 of 2024-04-02 is 5205.81 and that of 2017-11-03 is 2587.84, so 2024-04-02 has the larger sp500.","of 2025-05-22 compare with that of 2024-12-17":"The sp500 of 2025-05-22 is 5842.01 and that of 2024-12-17 is 6050.61, so 2024-12-17 has the larger sp500.","of 2018-02-12 compare with that of 2016-06-14":"The sp500 of 2018-02-12 is 2656 and that of 2016-06-14 is 2075.32, so 2018-02-12 has the larger sp500.","of 2020-07-13 and 2018-07-03":"The sp500 of 2020-07-13 is 3155.22 and that of 2018-07-03 is 2713.22, so 2020-07-13 has the larger sp500.","of 2025-02-20 and 2019-04-15":"The sp500 of 2025-02-20 is 6117.52 and that of 2019-04-15 is 2905.58, so 2025-02-20 has the larger sp500.","of 2019-07-17 compare with that of 2024-11-07":"The sp500 of 2019-07-17 is 2984.42 and that of 2024-11-07 is 5973.1, so 2024-11-07 has the larger sp500.","of 2017-03-28 and 2016-07-22":"The sp500 of 2017-03-28 is 2358.57 and that of 2016-07-22 is 2175.03, so 2017-03-28 has the larger sp500.","of 2021-10-13 compare with that of 2023-01-25":"The sp500 of 2021-10-13 is 4363.8 and that of 2023-01-25 is 4016.22, so 2021-10-13 has the larger sp500.","of 2021-05-10 compare with that of 2021-02-10":"The sp500 of 2021-05-10 is 4188.43 and that of 2021-02-10 is 3909.88, so 2021-05-10 has the larger sp500.","of 2020-02-12 and 2018-08-17":"The sp500 of 2020-02-12 is 3379.45 and that of 2018-08-17 is 2850.13, so 2020-02-12 has the larger sp500.","of 2016-11-08 and 2025-05-22":"The sp500 of 2016-11-08 is 2139.56 and that of 2025-05-22 is 5842.01, so 2025-05-22 has the larger sp500.","of 2021-11-29 and 2017-03-16":"The sp500 of 2021-11-29 is 4655.27 and that of 2017-03-16 is 2381.38, so 2021-11-29 has the larger sp500.","of 2018-02-23 and 2019-06-19":"The sp500 of 2018-02-23 is 2747.3 and that of 2019-06-19 is 2926.46, so 2019-06-19 has the larger sp500.","of 2016-09-30 compare with that of 2019-04-02":"The sp500 of 2016-09-30 is 2168.27 and that of 2019-04-02 is 2867.24, so 2019-04-02 has the larger sp500.","of 2025-02-28 and 2019-07-17":"The sp500 of 2025-02-28 is 5954.5 and that of 2019-07-17 is 2984.42, so 2025-02-28 has the larger sp500.","of 2021-09-15 compare with that of 2017-08-31":"The sp500 of 2021-09-15 is 4480.7 and that of 2017-08-31 is 2471.65, so 2021-09-15 has the larger sp500.","of 2021-10-12 and 2016-09-30":"The sp500 of 2021-10-12 is 4350.65 and that of 2016-09-30 is 2168.27, so 2021-10-12 has the larger sp500.","of 2018-10-25 and 2020-10-09":"The sp500 of 2018-10-25 is 2705.57 and that of 2020-10-09 is 3477.13, so 2020-10-09 has the larger sp500.","of 2023-02-21 and 2020-03-03":"The sp500 of 2023-02-21 is 3997.34 and that of 2020-03-03 is 3003.37, so 2023-02-21 has the larger sp500.","of 2021-12-20 and 2021-09-15":"The sp500 of 2021-12-20 is 4568.02 and that of 2021-09-15 is 4480.7, so 2021-12-20 has the larger sp500.","of 2018-12-20 compare with that of 2018-03-28":"The sp500 of 2018-12-20 is 2467.42 and that of 2018-03-28 is 2605, so 2018-03-28 has the larger sp500.","of 2016-05-12 and 2021-09-16":"The sp500 of 2016-05-12 is 2064.11 and that of 2021-09-16 is 4473.75, so 2021-09-16 has the larger sp500.","of 2018-12-31 and 2021-12-23":"The sp500 of 2018-12-31 is 2506.85 and that of 2021-12-23 is 4725.79, so 2021-12-23 has the larger sp500.","of 2018-07-03 compare with that of 2026-01-20":"The sp500 of 2018-07-03 is 2713.22 and that of 2026-01-20 is 6796.86, so 2026-01-20 has the larger sp500.","of 2022-12-05 and 2021-05-04":"The sp500 of 2022-12-05 is 3998.84 and that of 2021-05-04 is 4164.66, so 2021-05-04 has the larger sp500.","of 2017-08-16 and 2019-12-18":"The sp500 of 2017-08-16 is 2468.11 and that of 2019-12-18 is 3191.14, so 2019-12-18 has the larger sp500.","of 2017-12-19 and 2021-05-10":"The sp500 of 2017-12-19 is 2681.47 and that of 2021-05-10 is 4188.43, so 2021-05-10 has the larger sp500.","of 2024-06-28 and 2017-05-02":"The sp500 of 2024-06-28 is 5460.48 and that of 2017-05-02 is 2391.17, so 2024-06-28 has the larger sp500.","of 2022-01-24 compare with that of 2020-12-18":"The sp500 of 2022-01-24 is 4410.13 and that of 2020-12-18 is 3709.41, so 2022-01-24 has the larger sp500.","of 2021-05-04 compare with that of 2019-09-13":"The sp500 of 2021-05-04 is 4164.66 and that of 2019-09-13 is 3007.39, so 2021-05-04 has the larger sp500.","of 2017-04-27 compare with that of 2023-07-27":"The sp500 of 2017-04-27 is 2388.77 and that of 2023-07-27 is 4537.41, so 2023-07-27 has the larger sp500.","of 2022-01-18 compare with that of 2023-08-15":"The sp500 of 2022-01-18 is 4577.11 and that of 2023-08-15 is 4437.86, so 2022-01-18 has the larger sp500.","of 2016-07-11 compare with that of 2025-07-17":"The sp500 of 2016-07-11 is 2137.16 and that of 2025-07-17 is 6297.36, so 2025-07-17 has the larger sp500.","of 2022-08-18 and 2019-12-26":"The sp500 of 2022-08-18 is 4283.74 and that of 2019-12-26 is 3239.91, so 2022-08-18 has the larger sp500.","of 2025-02-21 compare with that of 2019-09-11":"The sp500 of 2025-02-21 is 6013.13 and that of 2019-09-11 is 3000.93, so 2025-02-21 has the larger sp500.","of 2019-03-13 and 2021-10-13":"The sp500 of 2019-03-13 is 2810.92 and that of 2021-10-13 is 4363.8, so 2021-10-13 has the larger sp500.","of 2017-11-03 compare with that of 2021-06-24":"The sp500 of 2017-11-03 is 2587.84 and that of 2021-06-24 is 4266.49, so 2021-06-24 has the larger sp500.","of 2025-07-03 compare with that of 2022-02-24":"The sp500 of 2025-07-03 is 6279.35 and that of 2022-02-24 is 4288.7, so 2025-07-03 has the larger sp500.","of 2021-08-17 and 2025-06-23":"The sp500 of 2021-08-17 is 4448.08 and that of 2025-06-23 is 6025.17, so 2025-06-23 has the larger sp500.","of 2023-11-01 and 2022-01-18":"The sp500 of 2023-11-01 is 4237.86 and that of 2022-01-18 is 4577.11, so 2022-01-18 has the larger sp500.","of 2018-11-19 compare with that of 2018-12-24":"The sp500 of 2018-11-19 is 2690.73 and that of 2018-12-24 is 2351.1, so 2018-11-19 has the larger sp500.","of 2023-11-06 and 2021-03-11":"The sp500 of 2023-11-06 is 4365.98 and that of 2021-03-11 is 3939.34, so 2023-11-06 has the larger sp500.","of 2019-04-15 compare with that of 2016-09-23":"The sp500 of 2019-04-15 is 2905.58 and that of 2016-09-23 is 2164.69, so 2019-04-15 has the larger sp500.","of 2021-03-11 compare with that of 2022-08-23":"The sp500 of 2021-03-11 is 3939.34 and that of 2022-08-23 is 4128.73, so 2022-08-23 has the larger sp500.","of 2020-03-03 compare with that of 2023-03-20":"The sp500 of 2020-03-03 is 3003.37 and that of 2023-03-20 is 3951.57, so 2023-03-20 has the larger sp500.","of 2023-05-18 compare with that of 2017-09-18":"The sp500 of 2023-05-18 is 4198.05 and that of 2017-09-18 is 2503.87, so 2023-05-18 has the larger sp500.","of 2017-05-02 compare with that of 2023-03-01":"The sp500 of 2017-05-02 is 2391.17 and that of 2023-03-01 is 3951.39, so 2023-03-01 has the larger sp500.","of 2017-03-16 compare with that of 2017-11-24":"The sp500 of 2017-03-16 is 2381.38 and that of 2017-11-24 is 2602.42, so 2017-11-24 has the larger sp500.","of 2021-12-23 compare with that of 2021-04-01":"The sp500 of 2021-12-23 is 4725.79 and that of 2021-04-01 is 4019.87, so 2021-12-23 has the larger sp500.","of 2025-06-23 compare with that of 2017-11-16":"The sp500 of 2025-06-23 is 6025.17 and that of 2017-11-16 is 2585.64, so 2025-06-23 has the larger sp500.","of 2021-09-16 compare with that of 2021-02-09":"The sp500 of 2021-09-16 is 4473.75 and that of 2021-02-09 is 3911.23, so 2021-09-16 has the larger sp500.","of 2019-12-18 compare with that of 2017-01-03":"The sp500 of 2019-12-18 is 3191.14 and that of 2017-01-03 is 2257.83, so 2019-12-18 has the larger sp500.","of 2017-08-09 and 2025-07-03":"The sp500 of 2017-08-09 is 2474.02 and that of 2025-07-03 is 6279.35, so 2025-07-03 has the larger sp500.","of 2023-11-14 and 2022-01-24":"The sp500 of 2023-11-14 is 4495.7 and that of 2022-01-24 is 4410.13, so 2023-11-14 has the larger sp500.","of 2019-06-19 compare with that of 2024-01-26":"The sp500 of 2019-06-19 is 2926.46 and that of 2024-01-26 is 4890.97, so 2024-01-26 has the larger sp500.","of 2020-11-05 and 2025-02-21":"The sp500 of 2020-11-05 is 3510.45 and that of 2025-02-21 is 6013.13, so 2025-02-21 has the larger sp500.","of 2019-12-26 compare with that of 2023-09-11":"The sp500 of 2019-12-26 is 3239.91 and that of 2023-09-11 is 4487.46, so 2023-09-11 has the larger sp500.","of 2018-08-17 compare with that of 2022-06-24":"The sp500 of 2018-08-17 is 2850.13 and that of 2022-06-24 is 3911.74, so 2022-06-24 has the larger sp500.","of 2016-10-11 and 2020-12-02":"The sp500 of 2016-10-11 is 2136.73 and that of 2020-12-02 is 3669.01, so 2020-12-02 has the larger sp500.","of 2020-10-02 and 2018-12-20":"The sp500 of 2020-10-02 is 3348.44 and that of 2018-12-20 is 2467.42, so 2020-10-02 has the larger sp500.","of 2017-07-12 and 2016-07-11":"The sp500 of 2017-07-12 is 2443.25 and that of 2016-07-11 is 2137.16, so 2017-07-12 has the larger sp500.","of 2020-12-31 and 2023-05-18":"The sp500 of 2020-12-31 is 3756.07 and that of 2023-05-18 is 4198.05, so 2023-05-18 has the larger sp500.","of 2016-07-22 compare with that of 2020-01-31":"The sp500 of 2016-07-22 is 2175.03 and that of 2020-01-31 is 3225.52, so 2020-01-31 has the larger sp500."}}},
{"id":"n-be35eb5f","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-6acdbaf7","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","no vowels","nth","position","remove vowels","without vowels"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.noVowels",["sense.wordAt",{"lit":3}]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-89442496","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-934e4012","guard":[["hasAny",["and","bigger than","class name","element","exceeds","greater than","item number","larger than","more than","nth","pascal case","pascalcase","position","upper camel case"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-f0afb235","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-15e76d55","guard":[["hasAny",["bigger than","class name","element","exceeds","greater than","item number","larger than","more than","nth","pascal case","pascalcase","position","upper camel case","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.pascal",["sense.lastWord"]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-b056a5c1","guard":[["hasAny",["bigger than","element","exceeds","greater than","invert case","item number","larger than","more than","nth","position","swap case","toggle case","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-1520fb08","guard":[["hasAny",["bigger than","does","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-1965f205","guard":[["not",["hasAny",["add","angeles","az","china","close","confirmed","greater","high","indicator","larger","lesser","makes","open","price","rate","recovered","smaller","sum","temp"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-2a28fb78","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-3d2e98de","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-44097e1e","guard":[["hasAny",["bigger than","delete","element","exceeds","greater than","item number","larger than","more than","nth","position","remove","strip out","versus","without"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.lastWord"],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-5b7c4714","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-6d6cd831","guard":[["hasAny",["bigger than","each word","element","exceeds","greater than","item number","larger than","more than","nth","position","split into words","versus","words"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-733ccd54","guard":[["hasAny",["bigger than","delete","element","exceeds","greater than","item number","larger than","more than","nth","position","remove","strip out","versus","without"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.remove",["sense.lastWord"],["sense.subject"]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-9eef805b","guard":[["hasAny",["bigger than","does","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-a997f447","guard":[["hasAny",["bigger than","compare","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-ca8401ae","guard":[["hasAny",["bigger than","each word","element","exceeds","greater than","item number","larger than","more than","nth","position","split into words","versus","words"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-e48d8e7e","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.nthStr",["sense.words"],["sense.howMany"]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-f3be4182","guard":[["hasAny",["bigger than","delete","element","exceeds","greater than","item number","larger than","more than","nth","position","remove","strip out","versus","without"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-68f737bd","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.lastWord"],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-7c698c4a","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.lastWord"],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-b5987488","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-c74b3687","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","versus"]],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-ff61d866","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","normalise","normalize","nth","of","position","simplify the text"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.norm",["sense.numeral"],["sense.second"]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-e59df1bd","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","normalise","normalize","nth","of","position","simplify the text"]],["has","sp500"],["has","compare"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["transform.norm",["sense.numeral"],["sense.last"]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-189c5cb6","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["words<=",7],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],["sense.second"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-59bb50d6","guard":[["hasAny",["and","bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position"]],["words<=",7],["has","sp500"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2}," and that of ",{"slot":3}," is ",{"slot":4},", so ",{"slot":5}," has the larger sp500."]},["sense.numeral"],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],["sense.last"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}],["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}],{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-fred-sp500-b187d8"},{"lit":"observation_date"}],{"lit":2}]]],"mem":null},
{"id":"n-00acddd0","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2016-06-14 versus 2021-08-17: compare their sp500":"The sp500 of 2016-06-14 is 2075.32 and that of 2021-08-17 is 4448.08, so 2021-08-17 has the larger sp500."}}},
{"id":"n-09eafde0","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-09-18 versus 2016-05-12: compare their sp500":"The sp500 of 2017-09-18 is 2503.87 and that of 2016-05-12 is 2064.11, so 2017-09-18 has the larger sp500."}}},
{"id":"n-0b5f37c6","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2024-06-28 and 2017-05-02":"The sp500 of 2024-06-28 is 5460.48 and that of 2017-05-02 is 2391.17, so 2024-06-28 has the larger sp500."}}},
{"id":"n-0e8cf4c8","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2019-07-17 compare with that of 2024-11-07":"The sp500 of 2019-07-17 is 2984.42 and that of 2024-11-07 is 5973.1, so 2024-11-07 has the larger sp500."}}},
{"id":"n-0ecbc366","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2023-02-21 and 2020-03-03":"The sp500 of 2023-02-21 is 3997.34 and that of 2020-03-03 is 3003.37, so 2023-02-21 has the larger sp500."}}},
{"id":"n-1271d203","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2021-11-29 and 2017-03-16":"The sp500 of 2021-11-29 is 4655.27 and that of 2017-03-16 is 2381.38, so 2021-11-29 has the larger sp500."}}},
{"id":"n-12f3c2f1","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2023-11-14 and 2022-01-24":"The sp500 of 2023-11-14 is 4495.7 and that of 2022-01-24 is 4410.13, so 2023-11-14 has the larger sp500."}}},
{"id":"n-16e8c891","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2018-03-28 versus 2021-12-20: compare their sp500":"The sp500 of 2018-03-28 is 2605 and that of 2021-12-20 is 4568.02, so 2021-12-20 has the larger sp500."}}},
{"id":"n-17e5f898","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2020-10-02 and 2018-12-20":"The sp500 of 2020-10-02 is 3348.44 and that of 2018-12-20 is 2467.42, so 2020-10-02 has the larger sp500."}}},
{"id":"n-1d3cabb9","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2018-12-24 versus 2022-12-05: compare their sp500":"The sp500 of 2018-12-24 is 2351.1 and that of 2022-12-05 is 3998.84, so 2022-12-05 has the larger sp500."}}},
{"id":"n-20a74681","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2023-05-18 compare with that of 2017-09-18":"The sp500 of 2023-05-18 is 4198.05 and that of 2017-09-18 is 2503.87, so 2023-05-18 has the larger sp500."}}},
{"id":"n-20ec4e07","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-06-24 versus 2016-11-08: compare their sp500":"The sp500 of 2022-06-24 is 3911.74 and that of 2016-11-08 is 2139.56, so 2022-06-24 has the larger sp500."}}},
{"id":"n-25a5c629","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2018-12-20 compare with that of 2018-03-28":"The sp500 of 2018-12-20 is 2467.42 and that of 2018-03-28 is 2605, so 2018-03-28 has the larger sp500."}}},
{"id":"n-28e32645","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2025-07-17 versus 2022-08-18: compare their sp500":"The sp500 of 2025-07-17 is 6297.36 and that of 2022-08-18 is 4283.74, so 2025-07-17 has the larger sp500."}}},
{"id":"n-291d5fc0","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-03-20 versus 2018-02-23: compare their sp500":"The sp500 of 2023-03-20 is 3951.57 and that of 2018-02-23 is 2747.3, so 2023-03-20 has the larger sp500."}}},
{"id":"n-2959b1e4","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-01-25 versus 2025-02-20: compare their sp500":"The sp500 of 2023-01-25 is 4016.22 and that of 2025-02-20 is 6117.52, so 2025-02-20 has the larger sp500."}}},
{"id":"n-2b319be0","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2020-12-31 and 2023-05-18":"The sp500 of 2020-12-31 is 3756.07 and that of 2023-05-18 is 4198.05, so 2023-05-18 has the larger sp500."}}},
{"id":"n-303f818e","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2016-09-30 compare with that of 2019-04-02":"The sp500 of 2016-09-30 is 2168.27 and that of 2019-04-02 is 2867.24, so 2019-04-02 has the larger sp500."}}},
{"id":"n-31d90cab","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2016-07-22 compare with that of 2020-01-31":"The sp500 of 2016-07-22 is 2175.03 and that of 2020-01-31 is 3225.52, so 2020-01-31 has the larger sp500."}}},
{"id":"n-33b1d277","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-08-23 versus 2023-02-21: compare their sp500":"The sp500 of 2022-08-23 is 4128.73 and that of 2023-02-21 is 3997.34, so 2022-08-23 has the larger sp500."}}},
{"id":"n-3b03db71","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2021-12-23 compare with that of 2021-04-01":"The sp500 of 2021-12-23 is 4725.79 and that of 2021-04-01 is 4019.87, so 2021-12-23 has the larger sp500."}}},
{"id":"n-3bcd4af3","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-04-01 versus 2018-10-25: compare their sp500":"The sp500 of 2021-04-01 is 4019.87 and that of 2018-10-25 is 2705.57, so 2021-04-01 has the larger sp500."}}},
{"id":"n-3cc90c09","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-09-13 versus 2024-04-02: compare their sp500":"The sp500 of 2019-09-13 is 3007.39 and that of 2024-04-02 is 5205.81, so 2024-04-02 has the larger sp500."}}},
{"id":"n-3df14f4d","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2021-07-26 and 2017-04-27":"The sp500 of 2021-07-26 is 4422.3 and that of 2017-04-27 is 2388.77, so 2021-07-26 has the larger sp500."}}},
{"id":"n-456e88eb","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2017-07-12 and 2016-07-11":"The sp500 of 2017-07-12 is 2443.25 and that of 2016-07-11 is 2137.16, so 2017-07-12 has the larger sp500."}}},
{"id":"n-4631f86e","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2022-08-18 and 2019-12-26":"The sp500 of 2022-08-18 is 4283.74 and that of 2019-12-26 is 3239.91, so 2022-08-18 has the larger sp500."}}},
{"id":"n-469d4f3f","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2020-02-12 and 2018-08-17":"The sp500 of 2020-02-12 is 3379.45 and that of 2018-08-17 is 2850.13, so 2020-02-12 has the larger sp500."}}},
{"id":"n-4cb63a6a","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2020-07-13 and 2018-07-03":"The sp500 of 2020-07-13 is 3155.22 and that of 2018-07-03 is 2713.22, so 2020-07-13 has the larger sp500."}}},
{"id":"n-4f9a82a5","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2024-04-02 and 2017-11-03":"The sp500 of 2024-04-02 is 5205.81 and that of 2017-11-03 is 2587.84, so 2024-04-02 has the larger sp500."}}},
{"id":"n-51b9c2d1","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2017-05-02 compare with that of 2023-03-01":"The sp500 of 2017-05-02 is 2391.17 and that of 2023-03-01 is 3951.39, so 2023-03-01 has the larger sp500."}}},
{"id":"n-51db0fbd","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2017-03-06 and 2018-02-12":"The sp500 of 2017-03-06 is 2375.31 and that of 2018-02-12 is 2656, so 2018-02-12 has the larger sp500."}}},
{"id":"n-52e91b43","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2025-07-03 compare with that of 2022-02-24":"The sp500 of 2025-07-03 is 6279.35 and that of 2022-02-24 is 4288.7, so 2025-07-03 has the larger sp500."}}},
{"id":"n-532e47c1","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-02-24 versus 2017-08-16: compare their sp500":"The sp500 of 2022-02-24 is 4288.7 and that of 2017-08-16 is 2468.11, so 2022-02-24 has the larger sp500."}}},
{"id":"n-56ef703a","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2017-12-19 and 2021-05-10":"The sp500 of 2017-12-19 is 2681.47 and that of 2021-05-10 is 4188.43, so 2021-05-10 has the larger sp500."}}},
{"id":"n-5976e339","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2018-08-17 compare with that of 2022-06-24":"The sp500 of 2018-08-17 is 2850.13 and that of 2022-06-24 is 3911.74, so 2022-06-24 has the larger sp500."}}},
{"id":"n-5a8e0f45","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2018-08-09 and 2018-11-19":"The sp500 of 2018-08-09 is 2853.58 and that of 2018-11-19 is 2690.73, so 2018-08-09 has the larger sp500."}}},
{"id":"n-5dc60450","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2022-01-24 compare with that of 2020-12-18":"The sp500 of 2022-01-24 is 4410.13 and that of 2020-12-18 is 3709.41, so 2022-01-24 has the larger sp500."}}},
{"id":"n-5fc0e21a","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-12-17 versus 2020-11-05: compare their sp500":"The sp500 of 2024-12-17 is 6050.61 and that of 2020-11-05 is 3510.45, so 2024-12-17 has the larger sp500."}}},
{"id":"n-61c95311","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-12-18 versus 2024-06-28: compare their sp500":"The sp500 of 2020-12-18 is 3709.41 and that of 2024-06-28 is 5460.48, so 2024-06-28 has the larger sp500."}}},
{"id":"n-62372d19","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2019-06-19 compare with that of 2024-01-26":"The sp500 of 2019-06-19 is 2926.46 and that of 2024-01-26 is 4890.97, so 2024-01-26 has the larger sp500."}}},
{"id":"n-64b97d38","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2019-12-18 compare with that of 2017-01-03":"The sp500 of 2019-12-18 is 3191.14 and that of 2017-01-03 is 2257.83, so 2019-12-18 has the larger sp500."}}},
{"id":"n-66ce1108","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-02-09 versus 2020-02-12: compare their sp500":"The sp500 of 2021-02-09 is 3911.23 and that of 2020-02-12 is 3379.45, so 2021-02-09 has the larger sp500."}}},
{"id":"n-68d009a5","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2018-02-12 compare with that of 2016-06-14":"The sp500 of 2018-02-12 is 2656 and that of 2016-06-14 is 2075.32, so 2018-02-12 has the larger sp500."}}},
{"id":"n-6e0eee35","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2025-02-20 and 2019-04-15":"The sp500 of 2025-02-20 is 6117.52 and that of 2019-04-15 is 2905.58, so 2025-02-20 has the larger sp500."}}},
{"id":"n-6e159e5e","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2020-11-05 and 2025-02-21":"The sp500 of 2020-11-05 is 3510.45 and that of 2025-02-21 is 6013.13, so 2025-02-21 has the larger sp500."}}},
{"id":"n-77a96e75","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2018-11-19 compare with that of 2018-12-24":"The sp500 of 2018-11-19 is 2690.73 and that of 2018-12-24 is 2351.1, so 2018-11-19 has the larger sp500."}}},
{"id":"n-79de8498","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2020-03-03 compare with that of 2023-03-20":"The sp500 of 2020-03-03 is 3003.37 and that of 2023-03-20 is 3951.57, so 2023-03-20 has the larger sp500."}}},
{"id":"n-7d901527","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2026-01-20 versus 2025-02-28: compare their sp500":"The sp500 of 2026-01-20 is 6796.86 and that of 2025-02-28 is 5954.5, so 2026-01-20 has the larger sp500."}}},
{"id":"n-7db1d740","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-07-27 versus 2021-11-29: compare their sp500":"The sp500 of 2023-07-27 is 4537.41 and that of 2021-11-29 is 4655.27, so 2021-11-29 has the larger sp500."}}},
{"id":"n-885b52f2","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2017-03-28 and 2016-07-22":"The sp500 of 2017-03-28 is 2358.57 and that of 2016-07-22 is 2175.03, so 2017-03-28 has the larger sp500."}}},
{"id":"n-91edd4e4","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2023-11-06 and 2021-03-11":"The sp500 of 2023-11-06 is 4365.98 and that of 2021-03-11 is 3939.34, so 2023-11-06 has the larger sp500."}}},
{"id":"n-921721c9","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2021-09-15 compare with that of 2017-08-31":"The sp500 of 2021-09-15 is 4480.7 and that of 2017-08-31 is 2471.65, so 2021-09-15 has the larger sp500."}}},
{"id":"n-9555365b","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-08-15 versus 2020-07-13: compare their sp500":"The sp500 of 2023-08-15 is 4437.86 and that of 2020-07-13 is 3155.22, so 2023-08-15 has the larger sp500."}}},
{"id":"n-96db9a04","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2016-05-12 and 2021-09-16":"The sp500 of 2016-05-12 is 2064.11 and that of 2021-09-16 is 4473.75, so 2021-09-16 has the larger sp500."}}},
{"id":"n-99378abd","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-03-01 versus 2017-08-09: compare their sp500":"The sp500 of 2023-03-01 is 3951.39 and that of 2017-08-09 is 2474.02, so 2023-03-01 has the larger sp500."}}},
{"id":"n-9c6976d1","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-01-31 versus 2021-07-26: compare their sp500":"The sp500 of 2020-01-31 is 3225.52 and that of 2021-07-26 is 4422.3, so 2021-07-26 has the larger sp500."}}},
{"id":"n-9e14a3a6","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2025-02-21 compare with that of 2019-09-11":"The sp500 of 2025-02-21 is 6013.13 and that of 2019-09-11 is 3000.93, so 2025-02-21 has the larger sp500."}}},
{"id":"n-9f39e53c","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2018-02-23 and 2019-06-19":"The sp500 of 2018-02-23 is 2747.3 and that of 2019-06-19 is 2926.46, so 2019-06-19 has the larger sp500."}}},
{"id":"n-9f3b3cc7","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2019-04-15 compare with that of 2016-09-23":"The sp500 of 2019-04-15 is 2905.58 and that of 2016-09-23 is 2164.69, so 2019-04-15 has the larger sp500."}}},
{"id":"n-a2d24c18","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2025-05-22 compare with that of 2024-12-17":"The sp500 of 2025-05-22 is 5842.01 and that of 2024-12-17 is 6050.61, so 2024-12-17 has the larger sp500."}}},
{"id":"n-a2fc5fbf","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2017-08-16 and 2019-12-18":"The sp500 of 2017-08-16 is 2468.11 and that of 2019-12-18 is 3191.14, so 2019-12-18 has the larger sp500."}}},
{"id":"n-a69b0592","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2017-04-27 compare with that of 2023-07-27":"The sp500 of 2017-04-27 is 2388.77 and that of 2023-07-27 is 4537.41, so 2023-07-27 has the larger sp500."}}},
{"id":"n-a7718049","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2021-05-10 compare with that of 2021-02-10":"The sp500 of 2021-05-10 is 4188.43 and that of 2021-02-10 is 3909.88, so 2021-05-10 has the larger sp500."}}},
{"id":"n-a977f39e","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-09-11 versus 2020-10-02: compare their sp500":"The sp500 of 2019-09-11 is 3000.93 and that of 2020-10-02 is 3348.44, so 2020-10-02 has the larger sp500."}}},
{"id":"n-aa3c4069","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-01-03 versus 2018-08-09: compare their sp500":"The sp500 of 2017-01-03 is 2257.83 and that of 2018-08-09 is 2853.58, so 2018-08-09 has the larger sp500."}}},
{"id":"n-ac8ddfab","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2021-08-17 and 2025-06-23":"The sp500 of 2021-08-17 is 4448.08 and that of 2025-06-23 is 6025.17, so 2025-06-23 has the larger sp500."}}},
{"id":"n-b0f04096","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2021-05-04 compare with that of 2019-09-13":"The sp500 of 2021-05-04 is 4164.66 and that of 2019-09-13 is 3007.39, so 2021-05-04 has the larger sp500."}}},
{"id":"n-b40d550a","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2017-08-09 and 2025-07-03":"The sp500 of 2017-08-09 is 2474.02 and that of 2025-07-03 is 6279.35, so 2025-07-03 has the larger sp500."}}},
{"id":"n-b5ed1459","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2016-10-11 and 2020-12-02":"The sp500 of 2016-10-11 is 2136.73 and that of 2020-12-02 is 3669.01, so 2020-12-02 has the larger sp500."}}},
{"id":"n-b665f2cf","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2022-12-05 and 2021-05-04":"The sp500 of 2022-12-05 is 3998.84 and that of 2021-05-04 is 4164.66, so 2021-05-04 has the larger sp500."}}},
{"id":"n-bd57aa47","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2018-12-31 and 2021-12-23":"The sp500 of 2018-12-31 is 2506.85 and that of 2021-12-23 is 4725.79, so 2021-12-23 has the larger sp500."}}},
{"id":"n-bf4a692f","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2021-10-13 compare with that of 2023-01-25":"The sp500 of 2021-10-13 is 4363.8 and that of 2023-01-25 is 4016.22, so 2021-10-13 has the larger sp500."}}},
{"id":"n-bf58ed52","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2023-11-01 and 2022-01-18":"The sp500 of 2023-11-01 is 4237.86 and that of 2022-01-18 is 4577.11, so 2022-01-18 has the larger sp500."}}},
{"id":"n-c05c7598","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2016-09-23 versus 2017-07-12: compare their sp500":"The sp500 of 2016-09-23 is 2164.69 and that of 2017-07-12 is 2443.25, so 2017-07-12 has the larger sp500."}}},
{"id":"n-c1128d9a","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2018-07-03 compare with that of 2026-01-20":"The sp500 of 2018-07-03 is 2713.22 and that of 2026-01-20 is 6796.86, so 2026-01-20 has the larger sp500."}}},
{"id":"n-c24f5e49","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-11-07 versus 2019-03-13: compare their sp500":"The sp500 of 2024-11-07 is 5973.1 and that of 2019-03-13 is 2810.92, so 2024-11-07 has the larger sp500."}}},
{"id":"n-c510fa45","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2019-03-13 and 2021-10-13":"The sp500 of 2019-03-13 is 2810.92 and that of 2021-10-13 is 4363.8, so 2021-10-13 has the larger sp500."}}},
{"id":"n-c714cd15","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2016-11-08 and 2025-05-22":"The sp500 of 2016-11-08 is 2139.56 and that of 2025-05-22 is 5842.01, so 2025-05-22 has the larger sp500."}}},
{"id":"n-c7da0de0","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-01-26 versus 2020-12-31: compare their sp500":"The sp500 of 2024-01-26 is 4890.97 and that of 2020-12-31 is 3756.07, so 2024-01-26 has the larger sp500."}}},
{"id":"n-c8bff3d8","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2021-09-16 compare with that of 2021-02-09":"The sp500 of 2021-09-16 is 4473.75 and that of 2021-02-09 is 3911.23, so 2021-09-16 has the larger sp500."}}},
{"id":"n-cba13111","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-02-10 versus 2023-11-14: compare their sp500":"The sp500 of 2021-02-10 is 3909.88 and that of 2023-11-14 is 4495.7, so 2023-11-14 has the larger sp500."}}},
{"id":"n-d2ca3b00","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2025-06-23 compare with that of 2017-11-16":"The sp500 of 2025-06-23 is 6025.17 and that of 2017-11-16 is 2585.64, so 2025-06-23 has the larger sp500."}}},
{"id":"n-d676bae5","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2017-03-16 compare with that of 2017-11-24":"The sp500 of 2017-03-16 is 2381.38 and that of 2017-11-24 is 2602.42, so 2017-11-24 has the larger sp500."}}},
{"id":"n-dab3fa8d","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-08-17 versus 2021-10-12: compare their sp500":"The sp500 of 2020-08-17 is 3381.99 and that of 2021-10-12 is 4350.65, so 2021-10-12 has the larger sp500."}}},
{"id":"n-dc555014","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-09-11 versus 2017-03-06: compare their sp500":"The sp500 of 2023-09-11 is 4487.46 and that of 2017-03-06 is 2375.31, so 2023-09-11 has the larger sp500."}}},
{"id":"n-e162316b","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2020-10-09 compare with that of 2020-08-17":"The sp500 of 2020-10-09 is 3477.13 and that of 2020-08-17 is 3381.99, so 2020-10-09 has the larger sp500."}}},
{"id":"n-e345352c","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-11-16 versus 2023-11-06: compare their sp500":"The sp500 of 2017-11-16 is 2585.64 and that of 2023-11-06 is 4365.98, so 2023-11-06 has the larger sp500."}}},
{"id":"n-e6ed832a","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-06-24 versus 2017-03-28: compare their sp500":"The sp500 of 2021-06-24 is 4266.49 and that of 2017-03-28 is 2358.57, so 2021-06-24 has the larger sp500."}}},
{"id":"n-eb850c1c","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2021-03-11 compare with that of 2022-08-23":"The sp500 of 2021-03-11 is 3939.34 and that of 2022-08-23 is 4128.73, so 2022-08-23 has the larger sp500."}}},
{"id":"n-eb9386db","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-04-02 versus 2017-12-19: compare their sp500":"The sp500 of 2019-04-02 is 2867.24 and that of 2017-12-19 is 2681.47, so 2019-04-02 has the larger sp500."}}},
{"id":"n-ebce6a61","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2021-12-20 and 2021-09-15":"The sp500 of 2021-12-20 is 4568.02 and that of 2021-09-15 is 4480.7, so 2021-12-20 has the larger sp500."}}},
{"id":"n-f0ea3813","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2018-10-25 and 2020-10-09":"The sp500 of 2018-10-25 is 2705.57 and that of 2020-10-09 is 3477.13, so 2020-10-09 has the larger sp500."}}},
{"id":"n-f252a921","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2025-02-28 and 2019-07-17":"The sp500 of 2025-02-28 is 5954.5 and that of 2019-07-17 is 2984.42, so 2025-02-28 has the larger sp500."}}},
{"id":"n-f384d8d5","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2022-01-18 compare with that of 2023-08-15":"The sp500 of 2022-01-18 is 4577.11 and that of 2023-08-15 is 4437.86, so 2022-01-18 has the larger sp500."}}},
{"id":"n-f67d473e","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2019-12-26 compare with that of 2023-09-11":"The sp500 of 2019-12-26 is 3239.91 and that of 2023-09-11 is 4487.46, so 2023-09-11 has the larger sp500."}}},
{"id":"n-f765f8fe","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"compare the sp500 of 2021-10-12 and 2016-09-30":"The sp500 of 2021-10-12 is 4350.65 and that of 2016-09-30 is 2168.27, so 2021-10-12 has the larger sp500."}}},
{"id":"n-fd0a1728","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2016-07-11 compare with that of 2025-07-17":"The sp500 of 2016-07-11 is 2137.16 and that of 2025-07-17 is 6297.36, so 2025-07-17 has the larger sp500."}}},
{"id":"n-fe5038f7","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-11-24 versus 2023-11-01: compare their sp500":"The sp500 of 2017-11-24 is 2602.42 and that of 2023-11-01 is 4237.86, so 2023-11-01 has the larger sp500."}}},
{"id":"n-feaa7a48","guard":[["hasAny",["compare","sp500","versus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-08-31 versus 2016-10-11: compare their sp500":"The sp500 of 2017-08-31 is 2471.65 and that of 2016-10-11 is 2136.73, so 2017-08-31 has the larger sp500."}}},
{"id":"n-fefb4fa5","guard":[["hasAny",["compare","sp500"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"how does the sp500 of 2017-11-03 compare with that of 2021-06-24":"The sp500 of 2017-11-03 is 2587.84 and that of 2021-06-24 is 4266.49, so 2021-06-24 has the larger sp500."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"2023-03-20 versus 2018-02-23: compare their sp500","expect":{"contains":["3951.57","2747.3","2023-03-20"],"notRefusal":true}},{"q":"compare the sp500 of 2021-07-26 and 2017-04-27","expect":{"contains":["4422.3","2388.77","2021-07-26"],"notRefusal":true}},{"q":"compare the sp500 of 2017-03-06 and 2018-02-12","expect":{"contains":["2375.31","2656","2018-02-12"],"notRefusal":true}},{"q":"2024-11-07 versus 2019-03-13: compare their sp500","expect":{"contains":["5973.1","2810.92","2024-11-07"],"notRefusal":true}},{"q":"compare the sp500 of 2018-08-09 and 2018-11-19","expect":{"contains":["2853.58","2690.73","2018-08-09"],"notRefusal":true}},{"q":"2023-09-11 versus 2017-03-06: compare their sp500","expect":{"contains":["4487.46","2375.31","2023-09-11"],"notRefusal":true}},{"q":"how does the sp500 of 2020-10-09 compare with that of 2020-08-17","expect":{"contains":["3477.13","3381.99","2020-10-09"],"notRefusal":true}},{"q":"compare the sp500 of 2024-04-02 and 2017-11-03","expect":{"contains":["5205.81","2587.84","2024-04-02"],"notRefusal":true}},{"q":"2022-06-24 versus 2016-11-08: compare their sp500","expect":{"contains":["3911.74","2139.56","2022-06-24"],"notRefusal":true}},{"q":"how does the sp500 of 2025-05-22 compare with that of 2024-12-17","expect":{"contains":["5842.01","6050.61","2024-12-17"],"notRefusal":true}},{"q":"how does the sp500 of 2018-02-12 compare with that of 2016-06-14","expect":{"contains":["2656","2075.32","2018-02-12"],"notRefusal":true}},{"q":"compare the sp500 of 2020-07-13 and 2018-07-03","expect":{"contains":["3155.22","2713.22","2020-07-13"],"notRefusal":true}},{"q":"compare the sp500 of 2025-02-20 and 2019-04-15","expect":{"contains":["6117.52","2905.58","2025-02-20"],"notRefusal":true}},{"q":"how does the sp500 of 2019-07-17 compare with that of 2024-11-07","expect":{"contains":["2984.42","5973.1","2024-11-07"],"notRefusal":true}},{"q":"compare the sp500 of 2017-03-28 and 2016-07-22","expect":{"contains":["2358.57","2175.03","2017-03-28"],"notRefusal":true}},{"q":"how does the sp500 of 2021-10-13 compare with that of 2023-01-25","expect":{"contains":["4363.8","4016.22","2021-10-13"],"notRefusal":true}},{"q":"2021-04-01 versus 2018-10-25: compare their sp500","expect":{"contains":["4019.87","2705.57","2021-04-01"],"notRefusal":true}},{"q":"how does the sp500 of 2021-05-10 compare with that of 2021-02-10","expect":{"contains":["4188.43","3909.88","2021-05-10"],"notRefusal":true}},{"q":"2020-08-17 versus 2021-10-12: compare their sp500","expect":{"contains":["3381.99","4350.65","2021-10-12"],"notRefusal":true}},{"q":"compare the sp500 of 2020-02-12 and 2018-08-17","expect":{"contains":["3379.45","2850.13","2020-02-12"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
