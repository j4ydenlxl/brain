// price-of-date-a2b5-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"price-of-date-a2b5-neo-g10","class":"price-of-date-a2b5","generation":10,"lane":"neo","grownFrom":["what is the price of 1991-07-12","give the price of 2006-10-10","what is the price of 2018-10-23","what is the price of 2001-12-07","tell me the price of 2011-07-26","tell me the price of 2002-04-24","what is the price of 2025-12-10","give the price of 2017-07-19","what is the price of 2006-01-04","tell me the price of 2008-03-03","give the price of 2015-12-16","give the price of 1994-11-11","give the price of 2005-11-23","what is the price of 2023-04-21","tell me the price of 2024-07-26","give the price of 2006-04-17","give the price of 2023-10-10","tell me the price of 2008-12-08","tell me the price of 2001-05-25","tell me the price of 1990-12-06"],"version":1});

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
knowLoad([{"id":"fr-oil-prices-wti-daily-2229a9","columns":["date","price"],"n":9512,"cols":[{"f":"01986-01-02|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-03|94|95|96|97|811|92|93|94|98|99|820|91|94|95|96|97|98|63-03|95|96|97|810|91|92|93|94|97|99|820|91|94|95|96|97|831|64-01|92|93|94|97|98|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|96|99|820|91|92|93|97|98|99|66-02|93|94|95|96|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-02|93|97|98|99|810|94|95|96|97|98|821|92|93|94|95|98|99|831|68-01|94|95|96|97|811|92|93|95|98|99|820|91|95|96|97|98|99|69-02|93|94|95|99|810|91|95|96|97|98|99|822|93|94|99|830|510-01|92|93|96|97|98|99|810|94|95|96|97|820|92|93|94|97|98|830|91|61-03|94|95|97|810|91|92|93|94|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|830|37-01-02|95|96|97|98|99|812|93|94|95|96|99|820|91|92|96|97|98|99|830|62-02|93|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|63-03|94|95|99|810|91|92|93|96|97|98|99|820|93|95|96|97|830|91|64-01|92|93|96|97|98|99|810|93|94|95|96|820|91|92|93|94|98|99|830|65-01|94|95|96|97|98|811|92|93|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|98|99|810|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|93|96|97|98|99|810|93|95|96|97|820|91|92|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|94|97|98|99|814|95|96|97|98|821|92|94|98|99|830|91|38-01-04|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|63-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-04|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|66-01|92|93|96|97|98|99|810|94|95|96|97|820|91|92|93|94|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|39-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|99|813|94|95|96|97|820|91|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|91|64-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|65-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|69-01|94|95|96|98|811|92|93|94|98|99|821|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|98|99|290-01-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|96|99|810|91|92|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-03|94|95|96|97|810|91|92|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|31-01-02|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|97|820|91|92|93|94|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|821|94|95|96|97|98|67-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-02|93|94|95|96|99|810|91|93|96|97|98|99|820|93|94|96|97|830|91|32-01-02|96|98|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|810|94|95|96|820|91|92|93|94|98|99|830|65-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|93|96|97|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|33-01-04|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-02|94|95|98|99|810|91|92|96|97|98|99|822|93|94|96|63-01|92|93|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|92|95|96|97|98|812|93|94|95|96|99|820|91|92|93|96|97|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|67-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|97|98|99|810|93|94|95|96|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|62-01|92|93|96|97|99|810|93|94|96|821|92|93|97|98|99|830|34-01-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|831|62-01|92|97|98|99|810|91|94|95|96|97|98|822|94|98|63-01|93|94|97|98|99|810|91|94|96|97|98|821|92|94|95|99|64-04|95|97|812|93|820|91|92|95|96|98|65-03|95|96|810|91|92|93|97|98|99|820|93|94|95|96|97|66-01|96|97|98|99|810|93|94|95|96|97|820|91|93|94|97|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|69-01|92|96|97|98|99|812|94|95|96|99|821|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|93|94|97|99|821|94|95|96|98|831|61-01|92|93|94|97|98|99|810|91|95|96|97|98|821|92|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|821|92|97|98|830|35-01-03|94|95|810|92|96|97|98|820|93|94|95|96|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|97|98|63-01|93|96|97|99|810|93|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|97|810|91|93|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|811|95|96|97|98|99|823|94|95|96|66-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|95|96|97|810|91|92|94|97|98|99|820|94|95|96|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|821|92|93|94|95|98|99|830|91|69-01|96|97|98|811|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|95|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|61-01|92|93|96|97|98|99|810|93|95|96|97|820|91|92|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|97|98|99|36-01-02|93|94|95|98|99|810|91|95|96|97|98|99|822|93|95|96|99|830|62-01|92|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|99|63-04|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|64-02|93|94|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|95|97|98|67-01|92|93|95|99|810|91|92|95|96|97|98|99|822|94|95|68-01|92|95|97|99|813|94|95|99|822|93|96|97|98|99|69-04|95|96|99|812|93|97|98|99|820|93|94|95|97|830|510-01|92|93|97|810|94|96|97|823|95|98|61-01|95|96|811|92|93|94|99|820|92|95|96|97|62-02|93|95|811|92|93|97|98|99|820|93|96|830|91|37-01-03|96|97|98|99|810|93|94|95|96|97|821|92|93|94|98|830|91|62-03|94|95|97|810|91|98|99|824|95|96|98|63-03|94|95|96|97|810|91|92|93|94|98|820|94|95|96|97|831|64-01|92|93|94|98|810|91|94|95|96|821|92|93|94|95|98|99|830|65-02|96|97|99|812|93|94|96|99|820|91|93|830|66-03|95|96|810|91|93|96|97|98|99|820|93|94|95|96|97|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|93|94|95|98|99|830|68-01|95|96|97|98|811|92|93|94|95|98|821|92|95|96|97|98|99|69-02|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|510-03|96|97|98|99|813|94|96|97|820|91|92|93|94|97|99|830|61-03|94|95|810|91|93|94|97|98|820|91|94|95|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|38-01-06|97|98|99|812|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|93|97|98|99|823|94|95|96|97|63-02|93|94|95|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|97|98|811|92|93|94|95|99|820|91|92|96|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|95|96|97|820|91|92|93|94|97|830|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|98|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|95|96|99|810|91|92|93|96|97|820|93|94|95|830|62-01|92|94|97|99|810|91|94|95|96|97|98|821|92|94|98|99|831|39-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|810|91|92|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|94|64-05|96|97|98|99|815|96|99|821|93|96|97|98|99|830|65-05|96|810|92|93|94|99|824|96|66-01|93|97|98|99|810|91|94|95|96|97|98|823|830|67-02|813|96|821|92|99|830|68-02|93|94|95|812|93|97|98|99|823|94|95|69-01|815|97|820|91|92|93|99|830|510-01|98|811|94|95|99|821|96|99|61-02|94|95|98|99|810|92|95|96|97|98|99|822|93|94|96|99|830|62-01|92|93|96|97|98|99|810|93|95|96|97|820|92|97|98|99|830|02000-01-04|95|96|97|810|91|92|94|98|99|820|91|94|95|97|98|831|62-01|92|93|94|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|830|64-04|96|97|810|91|92|93|94|97|98|99|820|94|95|96|97|98|65-01|92|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|95|96|99|820|91|92|93|96|97|98|99|830|67-06|97|810|92|93|97|98|99|820|91|95|97|98|68-01|92|93|94|97|98|99|810|91|94|95|97|98|821|92|93|94|95|98|99|830|91|69-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|98|99|510-03|94|96|99|811|93|96|97|98|820|94|95|96|97|831|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|97|98|99|830|62-01|94|95|96|97|98|811|92|94|95|98|99|820|91|97|98|99|31-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-03|94|95|96|99|810|91|92|96|97|98|99|823|94|95|97|830|65-01|92|93|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-04|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|98|820|93|94|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|94|95|97|98|510-01|92|93|94|95|99|811|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|98|99|812|93|95|96|99|821|96|97|98|830|62-03|94|95|96|97|810|91|93|97|98|99|820|91|96|97|98|831|32-01-02|94|97|99|810|91|95|96|97|98|822|93|94|95|99|830|91|62-01|96|97|98|811|92|93|94|95|99|820|91|92|95|97|98|63-01|95|97|98|811|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|830|91|66-03|94|95|97|810|91|92|93|94|97|821|95|96|97|98|67-01|92|93|98|99|810|91|92|95|96|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|94|95|98|99|820|91|92|95|96|97|62-02|93|94|95|96|810|91|92|93|96|97|98|99|823|94|96|97|830|91|33-01-02|93|96|97|98|99|810|93|95|96|97|821|92|93|94|97|99|831|62-04|95|97|810|91|93|98|820|91|94|96|98|63-05|96|97|811|92|99|821|94|95|831|64-01|98|810|95|96|97|823|94|95|99|65-01|98|813|96|820|91|92|98|99|66-06|99|810|97|99|820|93|94|95|96|830|67-01|97|810|95|96|97|821|93|94|95|98|99|68-04|96|97|98|811|93|95|99|821|92|95|96|99|69-02|95|98|810|91|92|96|97|823|94|95|99|510-01|99|810|93|96|822|93|94|98|99|831|61-07|810|91|94|821|94|95|96|62-03|94|99|810|91|92|96|99|822|93|94|99|830|34-01-06|814|95|821|92|93|96|98|62-02|93|94|95|96|99|813|98|820|93|94|97|63-02|95|98|811|92|95|97|98|822|93|94|95|830|64-05|98|814|95|820|91|92|93|96|97|99|65-05|96|97|810|91|94|97|98|821|94|95|96|97|98|66-01|92|93|97|98|99|810|94|95|96|97|821|92|93|94|99|830|67-01|92|96|97|98|812|93|94|96|99|820|91|92|93|96|98|99|830|68-03|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|830|91|69-01|92|97|99|813|94|95|96|820|92|93|94|97|98|99|830|510-04|95|96|97|98|811|92|93|95|98|99|821|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|35-01-03|94|95|96|97|810|91|93|94|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|95|96|98|823|94|95|63-01|92|93|94|97|98|99|810|91|94|97|98|821|92|93|98|99|830|91|64-05|96|97|98|812|93|94|98|820|91|92|95|96|97|98|99|65-02|93|94|95|99|810|91|92|96|98|99|823|94|95|96|97|831|66-01|92|96|97|98|99|813|94|95|96|97|822|93|94|97|98|99|830|67-01|95|96|97|811|92|93|94|98|99|820|91|92|96|97|98|68-01|92|93|94|95|98|99|810|91|95|96|97|98|822|93|94|95|96|99|831|69-01|96|97|98|812|93|94|95|96|99|821|92|93|96|97|98|830|510-03|94|96|97|811|92|93|97|98|99|824|95|96|97|98|831|61-01|93|94|97|98|99|811|94|96|97|98|821|92|93|99|830|62-01|92|96|99|812|93|94|95|96|99|820|91|93|98|99|36-01-03|94|95|99|810|91|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|821|92|93|94|98|63-01|96|97|98|99|810|93|95|96|97|820|91|92|93|94|97|98|99|830|64-03|94|95|96|97|810|91|92|97|98|99|821|94|95|96|97|98|65-01|92|93|95|98|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|98|99|830|67-05|96|97|810|91|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|830|91|69-01|95|96|97|98|811|92|93|94|95|99|821|92|95|96|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|93|96|97|99|810|93|95|96|97|820|91|92|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|37-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|830|91|62-01|92|95|96|97|98|99|812|93|95|96|820|91|92|93|96|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|99|810|91|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|38-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|39-01-02|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|210-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|91|31-01-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|64-01|94|95|96|97|811|93|95|98|825|96|97|98|65-02|93|810|91|97|98|823|831|66-01|93|98|810|93|821|93|98|830|67-01|97|98|814|95|98|99|820|91|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|32-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|33-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|811|92|93|96|97|98|99|820|93|94|96|97|830|91|34-01-02|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|95|96|97|820|91|92|93|94|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|94|95|98|99|810|91|92|95|96|97|98|99|822|93|96|99|830|91|35-01-02|95|96|97|99|812|93|94|95|96|820|91|93|830|62-03|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|36-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|66-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|37-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|97|810|91|92|93|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-05|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|38-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|64-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|96|97|98|39-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|812|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|96|97|830|91|220-01-02|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|31-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|91|32-01-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|66-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|33-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|67-03|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|34-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|820|91|94|95|96|97|98|67-01|92|93|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|812|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|96|97|830|91|35-01-02|93|96|97|98|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|36-01-02|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99","sep":"|"},{"s":"25.56|26|26.53|25.85|25.87|26.03|25.65|25.08|24.97|25.18|23.98|23.63|21.33|20.61|20.25|19.93|19.45|20.87|19.45|19.61|19.58|17.42|15.58|16.28|16.6|17.7|16.28|15.74|16.43|16.03|14.7|15.08|14.13|13.63|14.68|14.68|14.62|14.05|13.23|11.98|12.03|13.13|12.24|12.94|13.23|14.05|12.6|12.55|13.28|13.25|12.75|13.95|12.2|12.43|12.03|11.35|10.25|11.13|11.35|11.7|12.75|14.39|12.83|13.45|13.63|12.94|12.72|11.5|11.75|11.88|12.48|13.13|13.7|13.65|14.23|13.34|13.63|13.38|13.8|14.65|14.32|14.43|15.13|15.7|15.83|15.75|15.65|15.53|16.08|17.13|16.18|15.53|16.04|16.95|15.1|14.65|14.5|13.8|13.35|13.15|13.21|12.73|12.38|13.52|13.69|13.83|13.65|13.65|13.62|13.73|14.44|14.05|13.98|13.23|13.14|13.38|12.8|12.04|11.7|11.18|11.19|11|11.13|11.23|11.85|12.68|12.3|12.8|13.07|10.88|10.83|10.95|10.83|11.09|11.63|11.23|11.56|14|14.35|14.8|15.18|14.92|15.5|15.28|15.83|15.58|14.98|15.23|15.23|15.48|15.78|15.83|15.83|15.93|16.43|16.03|16.18|15.63|15|14.9|15.05|14.31|13.8|14.03|14.55|14.47|13.94|14.3|14.55|14.93|14.7|15.23|15.38|14.86|14.83|15.6|15.35|15.05|14.98|14.55|14.83|14.53|14.85|15.17|14.85|14.88|14.93|14.4|14.18|15.08|15.25|14.7|15.05|14.93|15.15|15.3|15.39|15.33|15.55|15.68|15.65|15.52|15.1|15.13|14.98|15.05|15|15|15.29|15.22|15.13|15.2|15.14|15.01|14.93|15.12|15.49|16.13|16.38|16.11|15.83|16.28|16.55|16.95|16.93|17.26|17.73|18.13|17.98|18.21|18.28|18.63|18.78|19|18.86|19.13|19.09|19.13|18.7|18.73|18.6|18.76|18.63|18.48|18.56|18.68|18.73|18.59|18.38|18.56|18.44|18.37|18.43|18.03|18.05|17.83|17.78|17.44|17.48|17.83|17.15|16.75|16.43|16.98|16.45|17.4|17.4|18|18.13|18.27|18.33|18.42|18.39|18.61|18.94|18.75|18.61|18.7|18.6|18.48|18.63|18.65|18.67|18.82|18.78|18.9|18.68|18.71|18.69|18.68|18.64|18.26|18.07|18.09|18.46|18.58|18.66|18.97|19.03|19.03|19.01|18.73|18.66|18.76|18.84|18.93|19.18|19.22|19.08|19.28|19.43|19.37|19.39|19.84|19.91|19.97|19.75|19.95|19.68|19.35|19.38|19.28|19.36|19.55|19.7|19.87|19.75|19.94|19.84|19.83|19.93|20.07|20.27|20.41|20.5|20.65|20.49|19.95|20.13|20.15|20.34|20.38|20.22|20.47|20.61|20.92|20.76|20.94|21.32|21.34|21.38|22.23|22.44|22.44|22.23|21.75|21.73|20.58|20.5|21.35|21.49|21.47|21.43|22.21|21.82|21.37|21.17|21.01|20.7|21.07|20.96|20.76|20.53|19.85|19.84|19.71|19.47|19.2|19.18|19.3|19.49|19.69|19.44|19.76|19.61|19.62|19.48|19.34|19.34|18.99|19.43|19.72|19.42|19.64|19.66|19.71|19.58|19.58|19.77|19.35|19.66|19.61|19.47|19.48|19.58|19.62|19.62|19.88|19.81|19.33|19.68|19.77|19.67|19.67|19.66|19.79|19.77|20.23|19.79|19.79|19.93|20.19|20.18|20|20.15|20.1|19.93|19.64|19.39|19.09|19.02|18.73|18.66|18.98|18.92|18.93|18.89|18.69|18.28|18.62|18.55|18.87|19.31|18.73|18.63|18.63|18.52|18.44|18.59|18.68|18.3|18.06|18.53|17.47|16.75|15.97|15.97|15.57|15.12|16.6|16.54|16.46|16.95|16.97|16.74|17.77|17.89|17.73|17.3|17.33|16.63|16.76|16.56|17.1|16.92|17.28|17.3|17.2|17.21|16.99|17.11|16.96|16.64|16.94|16.97|16.83|16.92|17.12|17.17|17.34|17.7|17.38|17.12|17.17|16.84|16.84|16.8|16.62|16.5|16.73|16.64|16.8|16.58|15.86|15.77|15.98|15.57|15.69|15.35|15.63|15.58|15.52|16.04|16.2|15.57|15.81|16.03|16.39|16.61|16.52|16.02|16.58|16.73|17.07|17.05|17.08|17.06|17.09|16.99|16.72|16.8|17.05|16.87|17.87|18.06|18.12|18.4|18.32|18.5|17.92|17.93|18.34|18.13|18.36|18.54|18.32|17.91|18.1|17.12|17.3|17.23|17.41|17.63|17.56|17.5|17.48|17.49|17.53|17.7|17.72|17.39|17.43|17.41|17.01|17.04|17.39|17.54|17.45|17.45|17.54|17.6|17.67|17.51|17.28|17.32|17.35|17.09|16.7|16.85|16.56|16.62|16.43|16.02|15.82|16.03|15.86|16.03|16.01|15.37|15.2|14.92|15.11|15.44|15.83|15.42|14.56|14.61|14.35|14.84|14.85|15.84|15.16|15.76|16.28|16.27|16.09|15.99|16.18|16.08|16.37|16.07|15.57|15.2|15.12|15.31|15.84|15.56|15.65|15.75|15.54|15.59|15.51|15.46|15.59|15.77|15.75|15.71|15.55|15.33|15.35|15.24|15.39|15.19|15.05|14.79|14.79|14.25|14.29|14.51|14.14|14.48|14.55|15.38|14.86|14.5|14.72|15.08|15.19|15.25|14.26|14.16|14.22|14.07|13.91|13.33|13.03|13.03|12.58|12.62|12.99|13.59|13.63|14.02|14.26|14.9|15.16|14.63|15.33|14.44|14.22|12.94|13.36|13.45|13.67|13.79|13.54|13.52|13.78|13.89|14.08|13.7|13.88|13.99|13.99|14.25|14.03|13.68|13.3|13.47|13.73|14.78|14.11|14.11|15.43|14.93|15|15.42|15.63|15.69|15.36|15.51|15.8|15.48|15.9|16.08|15.93|16.33|16.39|16.81|16.24|17.68|17.27|17.36|16.63|16.98|17.03|16.81|17.12|17.38|16.99|17.45|17.56|17.74|17.8|18.16|18.11|18.49|19.03|19.2|19.28|18.85|17.66|17.96|18.23|17.68|17.74|17.32|17|17.5|17.72|17.51|17.38|17.55|17.42|17.61|17.6|18.23|18.35|18.6|18.6|18.64|18.5|18.49|18.06|18.16|18.21|18.3|18.68|18.67|18.73|18.12|18.57|18.53|18.53|19.05|19.47|19.84|19.86|20.34|19.53|20.08|20.21|20.16|20.55|19.93|20.2|21.03|20.27|20.03|20.59|20.07|19.85|20.03|20.65|20.56|20.66|20.26|20.68|21.23|21.74|22.66|24.62|23.38|20.64|21.32|21.2|20.83|20.38|19.73|20.13|20.57|20.08|19.41|19.54|19.56|20.13|20.12|20.53|20.58|20.15|20.25|20.58|20.92|21.77|19.68|19.46|19.55|19.55|19.96|19.93|19.83|20.18|20.5|20.38|19.7|19.94|19.87|19.3|19.5|20.37|20.56|19.98|20.88|19.88|19.74|19.53|19.71|20.28|20.38|20.04|20.27|20.29|20.55|20.29|20.98|20.35|20.78|20.38|20.75|20.2|20.42|20.36|20.49|20.21|19.83|19.92|19.86|18.76|18.52|18.32|18.15|17.96|18.33|17.91|18.18|18.05|17.91|18.06|18.23|18.58|18.46|18.6|18.78|18.99|18.67|18.82|19.1|19.01|19.15|19.02|18.53|18.69|18.59|18.85|18.88|18.88|19.08|19.41|19.77|19.77|19.68|19.87|19.73|19.87|19.68|19.69|19.21|19.49|19.62|19.61|19.99|20.15|19.99|20.15|20.17|19.95|19.89|20.04|20.21|20.18|20.49|20.91|20.64|20.68|20.58|20.37|20.04|19.67|19.7|19.6|19.48|19.79|19.74|19.88|20.09|20.23|20.06|19.97|19.97|19.62|19.62|19.58|19.69|19.88|19.93|20.13|20.52|19.8|19.8|19.84|19.65|19.33|19.87|20.26|20.24|20.22|20.46|20.45|20.41|20.69|20.8|20.75|20.67|21.13|22.2|22.17|21.58|21.53|21.31|21.91|21.6|21.84|22.88|23.81|23.41|23.07|21.64|22.25|22.9|23.15|23.17|22.36|22.61|22.11|22.78|23.7|22.57|22.34|23.43|24.48|22.56|22.79|22.29|22.69|22.71|23.04|22.44|22.36|22.4|22.11|21.82|22.02|21.88|22.12|22.86|22.46|22.46|22.2|21.87|21.4|21.13|21.81|21.62|21.55|21.19|21.36|21.62|21.3|20.93|20.8|20.42|20.26|20.15|20.07|20.38|20.09|19.6|19.34|19.59|19.85|20.28|20.48|20.36|20.09|20.03|20.34|20.51|20.23|19.78|19.48|19.15|18.32|17.56|18.19|17.76|17.87|17.37|16.95|17.93|17.9|18.6|17.85|17.49|18.5|18.57|18.5|18.76|18.63|17.98|17.98|18.3|18.26|19.01|19.03|18.96|19.73|19.52|19.05|18.89|18.78|18.26|17.51|16.25|16.12|18|17.88|17.47|17.51|17.09|16.41|16.91|16.65|16.78|16.82|17.39|17.6|17.11|16.64|15.92|15.55|15.43|16.09|16.5|16.15|17.12|16.7|17.18|17.05|16.94|16.73|16.73|16.5|16.49|16.63|17.05|17.45|18.69|18.37|18.67|18.23|18.57|19.07|19.61|19.88|19.84|19.33|20.33|20.07|20.24|20.57|21.59|23.71|23.79|28.73|29.6|26.19|25.69|26.38|27.07|26.7|26.54|27.4|28.65|28.63|28.46|30.52|31.67|31.1|27.36|27.73|26.15|26.96|27.45|27.45|29.3|30|31.51|30.09|30.83|30.29|30.85|31.79|33.73|33.48|33.18|34.44|36.21|39.05|38.33|39.12|39.77|39.53|37.08|34.43|37.04|36.76|37.87|38.88|40.73|39.3|41.07|39.42|38|39.34|36.03|37.03|33.82|28.46|29.95|30.8|34.35|33.03|35.28|34.93|35.31|35.3|33.95|32.05|32.41|35.48|35.61|33.91|32.08|33.3|31.18|31.05|29.91|31.45|29.5|30.08|30.08|32.35|33.28|33.05|33.28|32.93|29.08|29.4|29.05|27.18|26.35|26.61|27.08|26.5|25.3|26.45|26.6|27.1|27.85|28.26|27.5|27.08|26.95|27.35|26.95|27.58|28.48|26.53|25.61|24.88|27.25|27.5|28|27.55|27.43|30.13|30.35|32.25|21.48|20.05|21.63|24.91|24.08|25.63|24.15|21.03|21.73|21.08|21.9|21.33|21.23|20.7|21.48|21.33|21.78|22.44|22.78|22.38|22.25|20.73|20.73|20.08|20.18|18.48|17.43|17.43|18.48|19.03|19.28|19.43|20.33|20.5|19.78|19.33|19.34|19|20.06|20.48|20.05|19.88|19.78|20.68|20.4|20.78|19.88|19.47|19.78|19.45|19.63|19.28|19.38|19.48|19.98|20.03|20.28|20.58|21.08|20.98|21.54|21.85|21.6|21.73|21.08|21.16|21.68|21.03|21|20.95|21.28|21.3|20.99|21.28|21.17|21.43|21.73|21.72|21.83|21.92|21.25|20.89|20.73|21.04|21.19|21.39|20.95|20.85|20.95|21.04|21.04|21.3|21.16|21.16|20.9|20.45|20.38|20.28|19.84|19.85|20.08|19.71|19.7|19.97|20.11|19.99|20.1|19.92|20.03|20.12|20.41|20.56|20.78|20.92|20.69|20.69|20.91|21.29|21.35|21.43|21.32|21.74|21.5|21.7|22.2|21.97|22.16|21.74|21.25|21.41|21.11|21.48|21.38|21.55|21.7|21.33|21.35|21.5|21.39|21.38|21.6|21.64|21.71|21.52|21.3|21.39|21.29|22.5|22.3|21.44|21.93|21.78|21.98|21.86|21.77|22.02|22.28|22.28|21.76|21.75|21.56|21.36|21.44|21.66|21.51|21.71|21.84|21.73|21.87|21.79|22.02|22.2|22.24|22.11|22.23|22.42|22.25|22.1|22.34|22.7|22.64|22.99|23.02|23.18|23.01|23.19|23.48|23.89|23.67|23.96|24.12|24.03|23.47|23.14|23.47|23.18|23.24|23.09|23.11|23.29|23.85|23.82|23.78|23.44|23.29|23|22.66|22.58|22.28|22.55|22.79|22.38|21.88|22.17|21.93|21.85|22.15|21.04|21.38|21.38|21.48|21.1|20.61|20.75|20.42|19.87|19.39|19.24|19.54|20.09|19.78|19.45|19.39|19.12|18.28|18.58|18.68|18.63|18.82|18.63|19.15|19.43|19.24|17.95|18.26|18.77|18.4|18.83|18.94|19.11|18.92|18.5|18.73|18.38|18.75|19.35|19.09|18.92|18.95|18.93|18.97|19.26|19.5|19.48|19.91|19.69|19.36|19.29|19.7|19.42|19.42|18.14|18.42|18.52|18.6|18.37|18.3|18.44|18.77|18.69|18.36|18.67|18.62|18.58|18.53|18.65|18.62|18.5|18.86|19.16|19.15|19.27|19.05|19.27|18.78|18.91|19.06|19|19.31|19.19|19.25|19.49|19.85|19.79|20.25|20.44|20.29|20.64|20.33|20.45|19.81|19.93|20.25|20.26|20.17|19.92|19.91|20.05|20.29|20.77|20.88|20.88|20.78|20.79|20.73|20.85|21.02|20.98|20.75|20.56|20.7|20.54|20.12|20.2|20.79|20.79|21.8|22|21.97|22.13|22.07|22.2|22.45|22.53|22.65|22.43|22.23|22.49|22.33|22.28|22.38|22.23|22.3|22.23|22.16|22.47|22.74|23.03|22.73|22.42|22.27|21.84|21.9|22.08|22.08|21.87|21.51|21.38|21.25|21.38|21.42|21.73|21.8|21.56|21.78|21.91|21.99|22.11|21.95|22.09|22.03|21.98|21.82|21.83|21.6|21.23|21.18|21.41|21.27|21.12|21|21.13|21.35|21.31|21.47|21.54|21.33|21.4|21.19|21.85|21.6|21.24|21.14|21.3|21.46|21.72|21.65|21.69|21.77|21.77|21.98|22|21.93|22|22.35|22.13|22.39|22.23|21.96|21.91|21.78|21.57|21.51|21.78|21.66|21.83|21.83|21.93|21.76|21.85|21.89|21.99|21.99|22.28|22.12|22.16|22.37|22.31|22.18|21.88|21.49|21.22|21.11|21.14|21.03|21.17|20.71|20.68|20.77|20.6|20.33|20.62|20.26|20.63|20.54|20.46|20.19|20.04|20.37|20.32|20.21|20.5|20.37|20.01|20.06|20.29|20.29|19.91|19.56|19.38|19.08|18.95|19.17|18.69|18.86|19.26|19.09|19.06|18.94|19.42|19.68|19.81|19.92|19.79|19.97|19.97|19.77|19.62|19.63|19.49|19.03|19.13|19.03|18.92|18.9|18.78|18.21|18.51|18.71|18.89|18.94|18.4|18.35|18.71|18.64|19.51|19.67|19.66|20.38|20.27|20|20.29|20.27|20.07|20.12|20.2|20.29|19.96|19.59|19.3|19.44|19.69|20.08|20.49|20.28|20.53|20.62|20.48|20.46|20.85|20.63|20.71|20.42|20.12|20.38|20.18|20.04|20.14|20.29|20.05|19.52|19.98|19.97|20.12|20.42|20.27|20.27|20.44|20.54|20.67|20.59|20.33|20.35|20.22|20.43|20.28|20.38|20.21|20.09|19.99|20.05|19.99|19.79|19.93|19.83|20.21|20.54|20.58|20.4|20.46|20.49|20.43|20.42|20.38|20.19|19.8|19.51|19.51|19.32|19.15|19.56|19.6|19.43|19.75|19.92|20.05|20.04|20.2|20.05|19.77|19.79|19.6|19.65|19.66|19.27|18.99|18.9|18.6|18.87|18.7|18.71|18.63|18.35|18.44|18.83|18.89|18.99|18.82|18.44|17.93|18.29|18.06|17.79|17.92|18.12|18.05|17.43|17.73|17.29|17.68|17.2|17.6|17.57|17.67|18.11|18.5|18.25|18.12|17.9|17.81|17.82|17.54|17.3|17.58|17.58|17.87|18.16|18.14|17.84|17.95|17.68|17.64|18.09|18.42|18.38|18.45|18.4|18.82|18.63|18.24|17.92|17.97|17.72|17.14|17|16.97|16.74|16.98|16.94|16.85|16.85|17.68|18.12|17.53|17.52|17.52|17.52|18.07|18.73|18.72|18.63|18.4|18.43|18.43|18.49|18.53|18.76|18.7|18.65|18.5|18.24|18.13|18.04|18.25|18.28|17.92|17.36|17.55|17.66|17.3|16.97|17.5|17.03|17.47|17.38|17.09|16.69|16.71|16.54|16.91|16.72|16.78|16.69|17.08|16.67|16.55|16.67|16.39|15.73|15.53|15.3|15.36|15.45|14.93|15.03|14.57|14.53|14.65|15.04|14.5|14.47|14.21|14.32|14.61|14.48|14.09|14.11|14.45|14.19|14.52|14.66|15.3|15.36|15.33|14.65|14.95|14.36|14.56|14.81|15.15|14.92|15.25|14.95|14.85|15.09|15.26|15.5|15.37|15.24|15.91|16.06|15.31|15.12|14.64|14.59|14.71|14.15|14.13|13.89|14.26|14.21|14.28|14.82|14.5|14.78|14.74|14.57|14.14|14.17|14.23|14.19|14.47|14.52|15.03|14.83|14.88|15.37|15.04|15.21|15.19|14.41|15.67|15.67|15.59|15.74|15.96|16.65|17.56|17.84|17.66|16.82|16.57|16.93|17.28|17.74|17.62|17.84|18.27|18.2|17.61|18.02|18.49|18.93|18.69|18.4|17.83|17.76|18.02|18.29|18.1|17.78|18.28|18.67|18.48|18.82|18.94|19.75|19.83|20.72|20.68|20.08|19.38|19.28|18.96|19.14|18.82|19.37|19.52|19.62|19.3|19.15|19.48|20.17|20.4|20.14|20.18|19.89|19.38|19.49|19.15|19.32|19.59|19.42|19.26|19.46|19.87|20.3|20.65|20.22|20.06|20.14|19.37|19.41|19.29|18.96|18.67|18.05|18.24|17.64|18.08|17.73|17.56|16.87|17.09|17.54|17.49|17.14|17.4|17.6|17.47|17.52|17.62|17.84|17.62|17.53|17.39|16.72|16.72|16.84|17.21|17.06|17.65|17.76|17.68|17.48|17.69|17.96|18.36|18.16|17.97|18.01|18.24|18.27|17.95|17.74|17.03|16.98|17.11|17.43|17.31|17.5|17.71|18.01|18.25|18.16|18.66|18.9|18.97|18.76|18.38|18.46|18.16|18.18|18.07|17.58|17.38|17.63|17.47|17.43|17.7|17.97|18.06|17.77|17|16.88|16.93|16.86|17.14|17.12|16.92|16.98|16.96|16.6|16.84|16.91|17.07|17.15|17.63|17.74|17.77|17.45|17.56|17.76|17.42|17.72|17.89|18.47|18.72|18.46|18.16|18.53|18.82|18.23|18.2|18.48|18.48|18.54|18.78|18.58|18.43|18.36|18.28|18.47|18.29|18.44|18.46|18.63|18.94|18.86|18.84|18.59|18.64|18.52|18.31|18.63|18.56|18.59|17.98|17.92|18.19|18.12|18.18|18.27|18.58|18.44|18.91|18.85|18.68|19.08|18.95|19.21|19.17|19.18|19.05|19.11|19.57|19.74|19.67|19.61|19.84|19.16|19.8|20.14|20.4|20.52|20.46|20.13|20.31|20.18|20.48|20.36|20.53|20.18|19.88|20.3|20.33|20.32|19.67|19.4|19.91|20.01|19.94|19.99|20.06|19.81|19.34|19.12|18.7|18.89|19.14|19.16|19.08|18.94|18.83|18.87|18.93|19.05|18.9|18.8|18.23|18.01|17.59|17.76|17.81|17.67|17.95|17.98|17.59|17.38|17.33|17.21|17.42|17.14|17.35|17.31|17.49|17.32|17.28|17.33|17.33|17.03|17.17|17.45|17.47|17.43|17.62|17.59|17.95|17.72|17.74|17.65|17.86|17.77|17.91|17.86|17.48|17.4|17.59|17.65|18.26|18.54|18.79|19.6|19.91|17.84|17.87|17.74|17.89|18.08|18.27|18.27|18.44|18.49|18.53|18.87|18.94|18.92|19.01|18.53|17.89|17.27|17.38|17.47|17.64|17.72|17.54|17.67|17.56|16.86|17.36|17.29|17.28|17.08|17.38|17.6|17.59|17.57|17.34|17.44|17.48|17.61|17.58|17.61|17.54|17.67|17.74|17.94|17.93|17.68|17.62|17.82|17.83|17.83|17.78|17.92|18.16|18.56|18.14|17.89|17.93|18.37|18.28|18.27|18.27|18.43|18.61|18.66|18.76|18.69|18.97|18.62|18.8|19.01|19.14|19.51|19.71|19.05|18.87|18.83|19.12|19.49|19.47|19.54|19.83|19.9|19.96|20.26|20.5|19.86|19.66|18.87|18.42|18.12|18.58|19.12|18.94|18.49|18.58|18.06|17.68|17.33|17.65|17.63|17.83|17.74|17.71|17.79|17.83|18.01|18.96|18.86|19.02|19.16|21.07|21.63|22.14|20.97|19.45|19.65|19.59|19.24|19.87|19.66|19.92|20.42|20.49|21.18|21.99|23.23|24.56|22.74|22.44|22.85|23.23|22.38|21.64|21.45|21.43|22.68|22.22|22.75|23.01|23.23|24.08|25.15|24.29|25.13|24.48|24.67|23.47|23.96|23.94|24.39|24|22.33|22.07|20.95|20.81|20.78|21.19|21.06|21.07|21.13|20.65|21.01|21.23|21.35|21.28|20.79|20.64|22.28|21.95|23.02|22.35|21.58|21.1|20.65|19.95|19.77|19.86|20.28|19.73|20.06|20.28|20.18|20.13|20.13|20.03|20.28|21.43|21.53|20.73|20.68|20.38|20.13|20.98|20.92|21.48|21.08|21.38|21.65|21.52|21.56|21.96|21.9|22.43|22.28|21.65|21.68|20.95|21.05|20.97|21.05|20.95|21.35|21.25|21.35|21.6|22.35|22.1|21.95|23.1|22.48|22.23|21.55|21.35|21.75|22.2|23.25|23.45|23.85|23.75|24.95|24.5|23.4|23.85|23.45|23.6|23.83|24.55|24.6|24.6|24.2|24.35|24.05|24.85|25.25|24.3|25.5|25.1|25.4|24.78|24.8|24.75|23|22.65|22.75|23.35|23.4|24.25|24.35|24.5|23.75|24.15|25.75|23.7|23.7|24.7|24.8|25.6|23.4|23.75|24.45|25.7|26.05|26.55|26.1|26.4|25.1|25.35|25.9|25.55|26.25|26.25|26.55|26.3|26.15|25.2|25.1|25.95|25.45|25.4|24.8|24.4|23.85|23.85|23.9|24.8|24.15|24.2|24|23.9|22.3|22.45|22.35|22.5|22.65|21|20.95|21.1|20.3|20.25|20.75|20.5|21|21.35|20.5|20.15|20.6|20.65|21.3|22|22|21|20.95|20.65|20.7|20.35|20.3|19.55|19.45|19.15|19.35|19.55|19.5|19.9|19.6|19.35|20.35|19.6|19.65|19.85|19.8|19.85|20.4|20.2|19.6|19.7|19.6|20.45|21.4|21.1|21.35|22.1|21.5|21.2|21.6|21.25|21|20.35|19.8|19|18.85|18.75|18.95|19.1|19.3|18.9|18.75|18.6|18.9|18.71|19.12|18.84|19.42|20.11|20.39|19.48|19.53|19.67|19.4|19.22|19.39|18.92|19.81|19.57|19.92|19.22|19.25|19.68|19.71|19.71|19.67|20.08|20.43|20.27|20.79|20.46|20.09|19.58|19.73|19.91|20.19|20.02|20.08|19.94|19.83|19.7|19.29|19.31|19.65|19.59|19.66|19.73|19.46|19.61|19.43|19.5|19.5|19.41|19.37|19.3|19.67|19.44|19.41|19.37|19.61|19.71|20.03|20.87|21.29|21.13|22.86|21.97|21.88|22.19|22.01|21.34|20.75|20.98|21.41|20.69|20.68|21.44|21.18|20.99|21.03|20.82|21.26|20.91|20.64|20.44|20.46|20.54|20.76|21.01|20.29|20.01|19.17|19.76|19.41|19.35|18.76|18.67|18.81|18.49|18.72|18.86|18.79|18.15|18.18|18.21|18.18|18.19|18.22|18.51|18.46|18.29|18.39|18.36|18.19|17.64|17.6|17.65|16.64|16.91|17.01|16.65|16.53|16.35|16.48|16.43|16.05|15.93|15.65|16.96|17.06|17.35|17.93|17.21|17.07|16.43|16.42|16.63|16.72|16.59|16.48|16.17|16.03|15.64|16.24|16.12|15.23|15.14|15.28|15.41|15.44|15.32|15.28|15.33|15.34|14.58|14.54|14.3|14.4|14.19|13.41|13.67|14.36|14.43|14.31|16.14|15.52|16.69|16.92|16.84|16.32|15.75|15.69|16.04|16.08|15.48|15.39|15.71|15.61|15.35|15.18|15.64|15.97|15.49|15.52|15.57|15.07|13.09|13.23|15.43|15.9|15.43|15.56|16.25|15.98|15.48|15.26|15.21|15.26|15.21|15.01|15.15|14.51|13.01|13.36|14.21|14.81|14.9|14.88|15.21|14.99|14.81|14.94|15.24|15.13|14.49|13.76|13.54|12.67|12.66|11.69|12.38|12.55|11.8|11.8|13.54|14.65|14.54|13.9|14.21|14.29|14.3|14.47|14.58|13.87|13.83|14.01|14.01|13.96|14.06|14.9|14.54|14.02|13.44|13.83|14.29|13.97|13.93|14.37|14.25|13.93|13.69|13.8|13.87|13.85|13.11|12.87|12.76|13.44|13.4|13.26|13.13|13.21|13.62|13.44|13.78|13.9|13.67|13.35|13.54|13.29|13.62|13.72|14.7|14.34|14.71|14.39|14.46|14.72|14.6|15.07|15.53|15.58|15.73|15.8|15.99|15.8|15.74|16.01|16.19|15.52|15.71|15.24|15.6|15.03|14.57|14.64|14.47|14.27|14.09|14.08|14.16|13.39|13.45|14.14|14|14.06|14.39|14.19|14.35|14.31|14.48|14.45|14.24|13.93|13.93|13.39|13.54|13.63|14.04|13.57|12.81|12.46|12.2|12.51|11.48|10.86|11.37|11.27|11.31|11.2|11.61|11.2|10.82|10.86|11.3|11.64|12.55|11.05|10.95|10.86|10.99|11.03|11.59|11.82|12.14|12.42|12.04|12.84|12.99|13.06|13.43|12.91|12.33|12.23|12.21|12.13|11.82|12.45|12.62|12.41|12.16|12.4|12.52|12.81|12.36|12.21|12.42|11.94|11.85|11.65|11.88|11.94|11.9|11.38|11.49|11.97|11.79|11.97|12.44|12.49|12.61|12.31|12.28|12.66|12.92|13.32|13.33|13.63|13.78|14.74|14.3|14.51|14.48|14.6|15.11|15.11|15.26|15.39|15.18|16.94|16.79|16.02|15.92|16.59|16.85|17.34|17.82|18.05|17.96|17.67|17.82|18.43|18.53|18.69|18.89|18.23|18.57|17.44|18.11|18.04|16.77|16.77|17.32|16.31|16.81|17.91|17.66|17.98|17.82|18.45|18.24|18.61|17.92|18.25|18.01|18.42|19.33|19.7|20.33|20.66|19.54|19.84|21.09|20.52|20.46|20.21|20.49|20.67|21.42|21.67|21.7|21.54|21.86|21.61|21.36|20.66|21.79|24.1|24.72|24.32|24.48|24.26|24.76|24.69|24.54|24.51|20.81|21.58|22.46|22.81|22.36|22.74|23.17|21.79|22.49|23.17|22.93|23.28|24.21|24.37|24.91|25.31|26.04|26.57|25.71|26.61|28.03|26.91|27.22|27.22|25.84|24.87|25.01|25.88|25.71|26.67|26.36|26.69|26|25.21|25.37|26.28|26.74|26.76|26.55|25.51|26.36|26.81|26.41|25.76|25.56|24.65|24.79|24.79|24.71|25.69|26.3|28.01|28.98|29.11|29.67|29.71|29.25|30.28|27.22|27.27|27.65|28.28|27.52|28.26|28.67|28.05|28.71|29.49|29.51|30.3|30.17|30.01|29.37|29.51|29.63|30.19|30.23|30.34|30.11|30.57|31.71|31.51|31.46|32.19|33.9|31.22|31.61|31.76|32.11|31.93|30.47|31.1|30.86|29.33|28.01|27.28|27.47|27.86|27.59|26.67|25.46|25.51|24.97|23.91|24.17|25.49|25.29|25.48|26.06|25.92|27.38|27.29|27.41|26.41|24.69|25.53|25.71|25.84|26.86|27.08|27.37|28.05|28.46|28.1|29.25|29.64|29.95|29.76|29.38|30.28|30.02|28.62|28.61|29.89|30.43|29.76|30.36|29.03|30.19|30.34|29.87|29.78|29.29|29.78|30.22|31.76|32.73|32.7|32.35|31.57|33.07|33.64|34.72|34.76|31.56|32.01|31.86|32.73|32.44|30.19|30.26|29.51|30.34|31.41|30.71|31.94|31.1|30.94|28.56|27.89|28.21|28.22|27.85|28.27|28.92|29.94|28.93|29.26|30.38|31.09|31.02|31.92|31.43|31.88|31.97|32.42|31.24|31.23|33.41|34.01|32.92|32.73|33.25|33.09|33.42|33.92|34.97|35.18|33.62|35.14|34.25|33.87|34.37|35.87|36.75|36.96|37.22|33.84|32.66|31.78|30.26|30.87|31.86|30.91|30.86|31.98|33.2|34.96|33.18|33.36|33.51|34.31|34.53|33.62|33.75|32.78|32.7|33.14|32.59|32.62|33.02|33.44|32.92|33.87|34.05|34.3|34.72|35.54|34.84|35.62|35.98|35.54|36.06|36.24|34.02|34.58|33.61|32.06|31.28|29.25|30.24|29.36|28.31|29.75|29.81|28.06|28.86|29.52|29.34|25.83|26.06|26.55|25.82|26.72|27.29|27.93|27.95|28.02|27.44|27.72|29.42|29.42|30.07|30.19|29.77|30.42|32.12|32.21|31.66|31.46|31.61|29.12|28.62|29.88|31.27|30.55|30.27|31.27|31.57|30.93|30.52|30.12|29.55|28.96|29.22|28.6|28.64|28.52|28.83|28.27|28.26|27.35|27.78|27.89|28.61|28.4|28.95|28.31|27.97|27.91|27.45|26.49|26.56|26.68|26.17|25.99|26.43|26.19|27.31|27.4|27.62|26.43|26.47|26.37|26.65|27.16|27.24|27.07|27.45|28.47|28.42|28.75|28.81|27.89|27.83|27.92|26.97|25.24|25.93|28.35|28.48|28.37|27.89|28.66|27.35|28.39|28.5|28.59|28.83|28.9|28.77|29.02|29.9|29.96|29.75|28.85|27.97|28.08|28.76|28.71|28.39|28.14|27.56|27.91|28.43|28.94|29.13|28.81|29.12|28.52|27.55|27.49|26.52|26.85|27.02|27.11|26.97|25.67|25.75|26.37|26.02|26.28|27.07|28.1|27.63|27.22|27.07|26.85|26.57|26.02|24.65|25.67|25.88|26.18|26.74|26.98|26.6|26.7|26.83|27.86|27.51|27.7|28.17|27.62|27.72|28.12|27.85|28.1|27.51|27.47|26.65|27.2|27.93|27.17|25.63|28.34|26.69|27.16|27.07|26.65|26.65|26.94|27.03|27.54|27.99|27.66|27.65|27.64|28.58|29.59|28.84|27.81|26.73|26.6|21.46|21.63|22.8|23.44|23.12|22.7|22.17|22.7|22.32|22.55|23.49|22.49|22.37|22.01|21.89|21.33|21.99|21.78|21.28|22|21.75|22.07|22.1|21.83|21.2|20.47|20.24|20|19.93|21.21|22.23|21.26|21.56|17.5|18.09|17.74|18.38|18.69|19.57|19.37|19.46|20.27|19.71|19.62|18.69|19.08|18.32|18.04|18.2|19.28|19.38|19.37|18.67|19.3|21.32|21.07|20.42|19.96|21.13|21.47|21.42|20.32|20.48|19.67|18.99|18.96|18.2|18.02|18.36|19.1|19.57|19.8|19.3|19.11|19.71|20.4|19.77|19.75|20.25|21.29|20.76|21.19|21.19|21.47|20.77|20.31|20.81|20.92|20.24|21.4|21.78|22.37|23.18|23.62|23.87|24.36|24.14|24.48|24.47|25.03|25.02|24.92|25.74|25.56|25.69|25.75|25.79|26.21|26.82|27.75|27.55|26.64|26.21|26.16|25.45|26.15|24.93|23.51|24.53|24.92|25.94|25.86|26.43|26.28|26.28|26.28|26.36|27.12|27.32|26.58|26.31|26.75|26.11|26.79|27.76|27.78|27.92|28.62|29.17|28.17|28|28.19|28.24|27.35|27.01|26.6|26.69|25.08|24.78|25.37|25.1|25.32|25.02|24.72|24.24|24.21|24.79|25.54|25.9|25.98|25.51|26.06|26.67|26.77|26.79|26.79|26.83|26.82|26.14|26.16|26.73|27.01|27.48|27.23|27.68|27.5|27.83|26.61|26.61|26.78|26.67|26.55|26.54|27.43|27.02|26.51|26.87|26.55|27.18|26.58|26.67|26.87|27.84|28.35|28.19|28.99|29.24|29.86|30.12|30.37|30.11|29.99|29.23|28.84|28.31|28.83|28.97|27.76|28.28|29.06|29.51|29.8|29.62|29.77|28.95|29.83|29.14|29.08|29.57|29.49|29.65|30.85|30.79|30.69|30.31|30.53|30.59|30.71|30.59|29.73|29.65|29.65|29.56|29.31|28.96|29.36|30.06|29.73|29.28|29.61|29.56|28.31|27.93|28.19|27.87|27.09|27.25|26.81|26.85|27.18|27.04|26.89|26.06|25.72|25.36|25.83|26.02|26.19|25.4|25.5|26.71|26.41|27|27.07|27.73|27.01|26.6|26.87|27.27|27.34|26.8|27.27|27.03|27.73|27.49|28.2|28.39|30.15|30.04|30.41|30.57|32.09|32.13|32.61|32.68|31.41|31.21|31.97|33.26|32.29|31.2|30.66|31.95|31.59|32.08|33.23|33.58|33.88|34.62|34.32|33.9|34.98|32.43|33.54|33.51|33.61|33.91|35.05|34.46|35.43|36.63|36.88|36.45|36.76|37.29|37.96|36.76|36.86|37.21|37.76|36.81|37.87|30.01|27.18|29.51|33.42|31.14|29.48|27.97|27.2|29.46|29.16|30.1|28.04|27.52|25.92|25.32|26.05|26.94|28.51|29.07|29.29|29.51|29.09|28.46|29.15|31.26|31.36|31.72|31.08|29.86|30.63|30.22|30.05|31.65|28.97|30.15|30.41|30.08|31.04|31.6|31.2|31.44|31.67|30.13|30.72|30.31|29.98|30.21|31.8|31.77|32.41|32.23|31.91|30.85|31.01|30.76|31.78|31.64|31.43|32.01|31.76|29.57|28.93|28.85|29.41|28.86|28.26|27.6|27|27|28.19|28.29|28.35|29.43|30.97|32.01|31.91|31.51|30|30.31|29.99|29.57|28.95|29.24|30.73|31.01|31.21|32.31|32.26|29.99|30.02|30.33|30.61|31.24|31.72|31.92|32.01|33.06|32.94|32.81|31.71|32.03|32.99|32.51|33.01|33.54|34.62|33.61|35.53|35.12|34.94|34.41|33.63|34.02|34.2|33.06|33.26|32.49|32.91|34.51|35.42|35.8|35.75|35.85|36.08|36.6|37.31|36.53|36.95|36.21|37.44|38.21|37.81|37.12|37.81|37.06|35.67|36.15|34.29|37.14|36.62|37.74|37.61|36.61|37.7|37.22|37.02|37.49|37.5|39.69|39.41|39.98|38.9|40.3|41.42|41.53|40.32|39.83|42.03|41.45|40.6|39.25|39.9|42.33|39.96|39.29|38.72|37.18|37.6|38.45|37.58|37.18|37.33|38.51|37.69|38.11|37.56|37.81|35.6|36.92|38.56|38.37|39.56|39.18|40.27|39.3|39.55|40.98|41.1|41.55|40.86|40.63|41.51|41.82|41.45|42.81|42.69|43.72|44.13|44.39|43.95|44.86|44.51|44.72|45.52|46.61|46.02|46.75|47.36|48.66|47.6|46|45.68|43.83|43.06|42.32|42.23|43.89|44.04|43.18|44.53|43.86|44.62|43.83|44.03|46.33|48.41|48.37|48.86|49.56|49.76|49.53|49.56|49.85|51.08|51.98|52.56|53.4|53.65|53.49|53.86|54.89|53.59|53.28|54.51|55.52|56.37|52.52|50.95|51.78|50.1|49.6|50.9|48.8|49.65|49.1|47.4|48.7|47.5|47.3|46.1|46.85|46.3|48.9|48.48|48.74|49.14|49.71|49.16|45.56|43.31|42.56|42.96|41.51|41.96|42.41|40.71|41.06|41.76|44.21|44.16|46.31|45.57|45.76|44.05|42.19|41.26|41.78|43.69|43.36|42.16|43.96|43.41|45.51|45.32|45.31|45.66|48.11|48.41|48.46|47.61|47.01|48.31|48.61|49.43|48.8|48.8|47.15|48.25|47.1|46.65|46.4|46.45|45.35|45.4|45.45|47.05|47.15|47.3|48.35|48.45|51.73|52.05|52.2|51.67|53|53.6|53.7|53.9|54.55|54.75|53.52|54.4|54.9|56.4|56.8|56.7|55.95|49.43|54.06|54.26|53.96|55.31|55.83|55.88|54.16|53.46|51.54|50.21|51.11|50.52|52.45|52.49|54.16|53.16|54.33|51.37|51.92|49.2|50.94|49.6|50.22|51.12|52.04|51.76|50.39|48.83|48.64|46.99|47|48.68|49.14|50.37|50.89|51.65|52.08|54.4|53.46|54.46|53.84|52.51|54.36|55.47|55.03|55.53|56.48|58.4|58.27|59.23|59.63|59.78|58.32|57.23|56.63|59.11|59.71|61.24|60.76|59.23|60.49|60|57.83|57.12|57.61|56.73|57.31|57.75|59.05|59.12|59.91|61.51|61.87|60.76|61.6|62.44|63.92|63.13|64.8|65.67|66.21|66.11|63.29|63.47|65.46|65.81|67.1|67.29|66.05|67.41|68.63|69.5|65.83|64.38|64.8|63.29|63.18|65.2|64.64|62.91|67.21|66.96|67.07|64.67|65.98|64.94|66.36|66.21|65.36|63.74|61.81|61.81|63.84|64.13|63.05|64.26|62.94|62.11|60.63|62.83|60.85|61.03|61.3|59.8|59.85|61.7|60.6|59.4|59.7|59.65|57.45|57.6|57.85|56.2|56.3|57.75|58.3|58.35|56.46|57.33|58.46|59.31|59.96|59.41|61.36|61.36|60.86|60.01|58.01|57.31|57.81|58.56|58.08|59.81|60.26|63.11|63.41|62.81|63.56|63.41|63.91|63.86|66.36|65.76|66.86|68.16|68.06|66.83|65.6|65.8|67.81|68.36|67.86|66.61|64.71|65.41|65.11|63.01|62.51|62.66|62.01|61.26|59.61|57.61|58.61|61.21|59.03|58.03|61.46|61.37|62.01|62.46|61.51|60.06|60.51|59.91|61.81|62.11|63.46|62.81|60.31|60.41|60.03|62.13|63.9|63.75|65.65|66|66.7|66.07|65.75|66.76|67.22|67.02|68.29|69.03|68.53|70.3|71.28|72.07|73.73|70.19|67.43|71.71|70.76|71.8|73.75|74.62|72.26|70.09|69.75|72.15|73|71.87|69.25|69.4|68.65|69.63|68.44|69.23|70.78|69.47|70.92|71.35|71.85|71.42|70.11|72.73|72.5|72.43|70.9|70.25|71.62|70.28|68.48|69.12|69.78|69.75|69.21|69.3|70.07|70.62|70.5|71.63|72.15|73.5|73.94|75.2|75|73.76|73.5|74.05|75.7|73.87|72.79|74|73.52|74.29|73.46|73.82|74.5|73.3|74.56|74.93|76.16|75.59|74.78|77.05|76.29|76.28|74.17|74.38|73.33|72.95|71.64|70.12|70.93|72.45|72.55|71.45|72.02|72.13|70.47|70.2|70.38|69.24|68.7|67.75|67.37|66.3|65.42|63.81|64.09|63.27|63.3|61.77|61.62|59.79|60.74|60.63|62.46|62.9|60.96|58.64|59.53|60.02|59.68|59.93|58.5|57.56|58.23|58.69|59.91|58.91|57.66|58.55|57.35|56.74|57.55|59.09|60.27|60.75|58.41|58.72|58.64|59.13|60.11|58.94|61.18|59.66|58.59|58.79|56.23|55.9|56.42|58.01|57.28|60.3|60.97|62.45|62.97|63.43|62.39|62.4|62.2|62.54|62.06|61.26|61.06|61.34|62.48|63.4|62.19|62.87|63.08|62.05|61.81|61.07|60.31|60.39|60.85|60.77|58.31|55.65|56.29|56.08|55.65|53.95|51.91|52.96|51.23|52.3|50.51|51.98|51.11|53.61|54.24|53.49|55.38|57.03|58.17|57.35|59.01|58.69|58.91|57.75|59.76|59.86|57.76|58.98|57.92|59.38|58.32|59.4|60.28|60.28|61.41|61.78|61.97|61.58|60.05|60.66|61.85|61.63|60.06|58.94|58.03|58.15|57.52|57.06|56.65|56.41|56.98|60.21|61.07|61.77|62.98|64.11|66.1|65.94|66.03|64.59|64.4|64.26|61.51|61.92|61.98|63.63|63.63|63.14|63.14|61.81|63.56|65.33|64.1|65.33|65.08|66.45|65.78|64.43|63.78|63.23|61.89|61.48|62.26|61.54|61.85|62.35|62.55|63.16|62.57|64.83|64.93|66.25|64.91|65.1|63.62|64.59|63.19|63.47|64.02|65.09|66.17|65.63|65.97|66.93|64.78|65.93|65.36|66.17|67.62|68.04|69.06|69.15|68.5|68.35|68.85|68.83|67.78|68.98|69.61|70.47|71.11|71.41|71.81|72.8|72.14|72.8|72.58|72.55|73.89|74.11|74.03|75.03|75.9|75.53|74.65|73.38|75.74|74.96|77.03|76.82|78.2|76.49|76.84|75.41|72.03|72.25|72.23|71.62|71.49|71.6|72.4|73.36|70.99|71.9|71.12|69.49|69.3|69.86|71.17|71.98|71.79|73.52|73.37|73.98|75.07|75.74|76.34|76.7|77.53|78.16|79.85|80.05|79.14|80.55|81.51|81.99|83.85|83.38|82.51|81.2|80.31|82.86|81.64|80.31|80|79.97|81.48|81.2|78.97|80.23|81.3|83.05|83.73|86.19|87.58|87.19|89.48|88.58|87.6|86.45|88.3|92.09|91.73|93.45|90.33|94.16|93.53|95.81|94.06|96.65|96.46|95.51|96.36|94.4|91.18|94.02|93.37|94.81|95.75|99.16|98.57|98.24|97.66|94.39|90.71|90.98|88.6|89.29|88.31|87.45|90.25|88.23|87.72|90.12|94.41|92.35|91.31|90.69|89.93|91.11|90.88|93.19|94|95.89|96.63|96.03|95.95|99.64|99.17|97.9|95.08|96.43|95.64|93.92|92.74|94.23|91.87|90.8|90.11|90.55|89.64|87.65|89.98|90.37|90.99|91.66|92.34|91.67|89.03|90.07|88.32|87.16|88.07|91.77|93.56|92.82|93.28|95.42|95.57|99.99|100.86|98.57|99.03|99.4|100.83|99.59|102.6|101.78|102.42|99.72|104.45|105.51|105.12|107.9|108.73|109.86|110.21|110.03|105.74|109.57|103.25|102.57|101.7|101.78|105.83|107.56|105.59|101.54|100.92|104.83|103.92|106.09|108.91|108.54|110.89|110.07|110.14|111.71|113.77|114.8|114.8|116.56|117.48|119.17|119.28|117.1|119.64|118.78|115.67|113.7|112.6|116.36|119.94|121.82|123.56|123.77|125.94|124.02|125.83|124.21|124.25|126.5|127.15|128.93|132.99|130.04|131.58|128.81|131|126.7|127.35|127.75|124.33|122.3|127.93|138.51|134.44|131.38|136.43|136.91|134.84|134.52|133.99|136.54|131.88|134.78|135.98|136.49|133.92|138.91|139.69|139.96|141.06|143.74|145.31|141.38|136.06|135.88|141.47|144.96|145.16|138.68|134.63|129.43|128.94|131.43|127.25|123.73|124.62|122.59|124.72|122.21|126.74|124.17|125.03|121.45|118.71|118.57|119.84|115.42|114.44|113.1|115.96|115.05|113.46|112.92|114.39|115.48|121.23|114.48|114.85|116.31|118.17|115.58|115.55|109.63|109.38|107.99|106.47|106.35|103.23|102.66|100.95|101.19|95.52|91.49|97.39|97.5|104.05|122.61|107.85|106.84|111.54|106.77|96.29|100.7|98.23|93.84|93.91|88.15|90.18|88.94|86.5|77.44|81.17|78.69|74.38|69.81|71.9|74.08|71.29|66.92|67.17|63.34|61.92|62.8|67.45|65.79|68.1|63.93|70.41|65.41|60.72|61.06|62.19|59.38|55.95|58.31|57.18|55.14|54.42|53.64|48.86|49.22|53.63|50.02|54.2|55.21|49.34|47.05|46.79|43.8|41.01|43.69|42|43.1|47.77|46.27|44.61|43.84|40.17|36.73|33.17|31.1|30.28|32.94|37.58|39.89|38.95|44.6|46.17|48.61|48.56|42.75|41.68|40.69|37.65|37.77|37.43|35.41|35.38|38.57|42.56|42.33|45.12|46.5|41.67|42.04|41.58|41.73|41.35|40.87|40.27|41.15|40.24|39.58|37.54|35.93|34.03|37.63|34.96|34.67|39.6|39.35|37.66|38.86|41.64|43.18|40.07|41.57|45.28|43.54|45.43|47.01|45.68|42.46|46.91|46.22|47.33|48.97|48.12|51.46|51.55|53.05|53.36|52.24|53.87|52.41|48.49|49.64|48.46|52.61|52.52|51.1|49.13|49.37|52.24|50.22|49.51|49.26|49.97|50.36|45.82|46.65|47.41|48.46|50.65|49.29|49.01|50.19|50.35|52.18|54.45|53.81|56.29|56.67|58.58|57.79|58.81|58|58.58|56.52|58.99|59.52|61.45|60.49|61.15|62.48|63.41|65.09|66.31|68.59|68.58|66.14|68.8|68.43|68.05|70.02|71.38|72.69|72.13|70.54|70.47|71.07|71.42|69.6|67.09|68.81|68.14|69.7|69.16|71.47|69.82|69.32|66.68|64.06|62.88|60.15|60.36|59.93|59.69|59.62|61.49|62.07|63.56|63.93|64.58|66.1|66.96|68.34|67.24|63.42|66.9|69.26|71.59|71.4|71.97|71.96|70.97|70.59|69.46|70.08|70.57|67.51|66.72|69.22|72.54|72.4|73.12|73.68|71.6|71.38|72.49|72.72|69.97|68.11|68.03|67.9|67.95|71.08|71.27|71.95|69.34|68.86|70.81|72.5|72.48|71.95|69.74|71.5|68.74|65.74|65.91|66.69|66.56|70.46|70.67|69.8|70.26|70.71|69.6|71.69|71.75|73.24|74.1|75.2|77.55|78.54|79.47|78.87|81.03|80.82|80.11|78.61|79.45|77.39|79.84|77.04|78.08|79.58|80.3|79.64|77.4|79.44|79.01|79.16|77.25|76.34|78.91|79.08|79.55|77.47|76.83|76.49|74.88|77.25|75.95|77.19|78.39|76.62|76.42|75.41|73.89|72.59|70.67|70.54|69.86|69.48|70.62|72.64|72.58|73.3|72.71|73.48|76.03|76.83|78.67|78.87|79.35|79.39|81.52|81.74|83.12|82.6|82.74|82.54|80.79|79.66|79.35|77.96|78.98|77.42|75.84|74.25|74.9|74.67|73.64|73.62|72.85|74.41|77.21|76.96|73.13|71.15|71.87|73.71|74.48|75.23|74.11|76.98|77.27|78.97|79.77|80.04|78.61|79.75|77.99|79.72|78.71|79.62|80.91|80.21|81.5|81.85|81.5|82.07|82.1|81.26|79.79|81.75|82.93|82.16|80.58|81.26|81.68|80.29|80.25|79.75|81.92|82.14|83.45|84.53|86.36|86.54|85.64|85.17|84.6|84.07|83.8|85.62|85.25|82.97|81.52|82.98|82.78|82.89|84.34|84.2|82.43|83.22|85.17|86.07|86.19|82.73|80|77.18|75.1|76.89|76.37|75.65|74.38|71.61|70.08|69.38|69.91|68.28|68.03|68.23|64.78|71.52|74.56|74|72.7|72.88|74.62|71.43|71.55|71.88|74.38|75.48|73.89|74.99|76.84|77.67|76.82|77.18|77.84|77.15|75.9|75.96|78.45|78.26|75.93|75.59|72.95|72.06|71.96|74.05|75.46|76.08|74.93|77.16|77.02|76.67|75.96|76.53|77.32|76.27|79.01|78.68|78.93|77.46|77.06|78.3|78.85|81.25|82.52|82.49|82|80.67|81.46|80.24|78.09|75.68|75.39|75.17|75.76|75.39|74.45|73.45|72.71|71.24|72.07|73.36|75.17|74.69|71.93|73.97|74.99|74.52|73.98|74.65|74.25|76.4|77.17|76.78|75.92|74.58|73.63|74.81|72.96|72.98|73.4|74.63|76.51|76.15|77.85|79.95|81.57|81.43|82.83|83.21|81.34|82.66|82.18|81.67|83.03|82.71|81.23|83.06|79.57|81.93|80.03|81.15|82|82.6|81.9|82.2|81.45|82.94|83.91|84.45|86.49|86.85|87.07|87.04|87.77|87.77|84.89|84.88|82.33|80.43|81.88|81.65|81.24|80.79|83.21|83.87|85.73|84.12|86.75|87.98|89.18|89.33|88.69|88.3|88.35|87.81|88.62|88.33|88.66|87.71|88.02|88.68|89.3|89.83|90.84|90.99|91.48|91.13|89.85|91.38|91.59|89.39|90.3|88.37|88.07|89.24|91.11|91.85|91.39|91.53|91.38|90.85|88.56|88.22|86.74|85.08|86.15|84.45|88.15|90.99|89.54|89.78|89.42|87.87|86.3|85.85|85.59|85.44|84.39|83.66|83.13|83.8|85.05|85.03|92.65|96.04|95.83|96.52|97.1|99.63|102.27|101.92|104.34|105.37|105.06|104.39|102.73|101.14|101.2|97.23|97.99|101.47|101.06|102.36|104.53|105.21|105.04|104.89|104.34|103.8|106.19|107.55|108.14|107.82|108.38|109.82|109.5|106.6|109.17|106.7|111.68|111.72|112.31|112.38|113.03|110.6|103.39|97.88|96.4|99.52|97.06|102.7|100.3|100.28|100.77|99.3|97.2|93.7|90.7|92.9|95.3|94.81|98.7|96.2|95.75|97.24|95.94|97.49|98.11|98.96|98.97|99.61|97.4|97.48|95.68|94.98|93.78|91.87|86.75|86.89|81.27|79.32|83.05|85.48|85.19|87.88|86.65|87.58|82.38|82.33|84.42|85.35|84.99|85.15|85.37|87.27|88.9|88.81|88.93|86.45|85.99|89.34|89.05|87.24|88.19|90.21|88.91|89.4|87.96|85.7|86.92|85.77|80.29|79.58|79.97|84.18|80.94|81.87|78.93|77.34|75.4|79.41|82.32|82.7|85.14|85.54|85.3|83.96|86.8|86.38|88.34|86.11|86.07|87.19|91.12|92.98|90.2|93.96|93.32|93.19|92.19|92.51|94.07|94.26|95.52|96.8|95.74|97.78|98.99|98.14|99.37|102.59|98.82|97.67|96.73|97.76|96.16|96.91|98.21|99.79|100.36|100.2|100.97|100.94|101.25|100.45|98.35|99.4|97.77|100.24|94.92|93.84|93.55|93.86|97.16|98.54|99.42|99.72|101.29|99.44|99.68|98.83|102.96|103.22|101.81|101.56|101.31|102.24|100.89|99.03|98.69|100.7|100.61|100.32|98.15|99.47|98.84|99.23|99.76|99.47|98.75|98.46|97.63|96.36|97.8|96.89|98.55|98.8|99.88|98.68|100.39|100.82|101.82|102.33|103.27|105.88|105.99|107.44|109.39|108.49|106.59|107.08|108.76|106.68|106.7|104.71|106.16|106.65|107.4|106.34|106.7|105.49|105.19|107.03|108.09|105.68|106.87|104.98|106.43|107.07|107.32|105.4|102.79|103.03|105.25|104.02|101.53|103.29|102.45|101.12|102.66|103.69|102.84|102.92|104.23|102.65|102.38|103.58|102.68|103.1|103.72|104.56|104.86|104.89|106.17|105.25|102.56|98.49|97.86|97.13|96.8|97.1|96.03|94.75|93.97|92.78|92.53|91.51|92.57|91.44|89.4|90.36|90.64|90.75|87.79|86.52|83.17|83.95|84.31|85.05|84.78|84.08|82.58|83.35|82.56|83.83|84.03|83.26|83.99|81.06|77.91|79.33|78.76|79.34|80.27|77.72|85.04|83.72|87.74|87.11|84.37|85.93|83.92|85.88|86.02|87.15|88.41|89.07|89.88|92.78|91.56|87.77|88.28|88.8|89.4|90.13|89.8|88.08|88.99|87.22|91.4|92.3|93.68|93.39|93.39|92.94|92.76|93.4|94.35|95.66|96|96.03|96.55|96.89|95.87|95.78|95.54|96.3|95.5|94.61|96.47|95.34|95.37|95.58|96.41|96.52|97.03|97.02|98.3|98.94|96.51|95.25|91.97|92.14|92.64|91.68|91.07|89.92|91.89|92.18|92.44|91.88|88.19|91.69|89.87|89.43|92.42|91.24|92.19|91.83|91.84|92.07|92.04|92|90|88.3|86.65|85.39|85.59|85.84|85.52|85.65|86.23|87.05|84.9|85.64|88.62|84.5|85.07|86.08|85.56|85.38|86.32|85.45|86.62|89.05|86.46|87.08|87.01|87.28|86.81|86.1|87.64|88.54|88.69|88.04|87.36|85.47|85.45|85.14|85.36|86.35|85.39|86.32|86.71|87.46|89.09|89.76|88.2|88.29|90.71|90.91|90.66|91.83|93.14|92.97|93.12|93.2|93.21|93.08|93.81|93.6|94.27|93.26|94.28|95.49|95.61|96.09|95.06|95.35|95.15|95.95|97.62|97.98|97.65|97.46|96.21|96.68|96.44|95.84|95.71|97.01|97.48|97.03|97.3|95.95|96.69|94.92|92.79|93.12|92.74|92.63|92.84|92.03|90.71|90.13|90.88|90.47|91.53|92.01|92.07|92.44|92.47|93.03|93.49|93.71|92.44|93.21|92.46|93.41|94.55|95.99|96.53|97.24|97.1|97.23|95.02|93.26|92.76|93.36|94.18|94.59|93.44|91.23|88.75|88.73|86.65|87.83|88.04|88.81|89.21|91.07|93.27|92.63|94.09|93.22|90.74|93.7|95.25|95.8|96.24|96.09|95.81|94.76|93.96|93.95|94.85|95.72|96.29|95.55|93.98|94.12|93.84|94.65|93.13|93.57|91.93|93.41|93.36|93.66|94.71|96.11|95.82|95.5|95.98|96.66|97.83|97.86|98.46|98.24|94.89|93.81|95.07|95.25|95.47|97|96.36|97.94|99.65|101.92|103.09|103.03|103.46|106.41|104.77|105.85|106.2|105.88|106.39|107.94|108|106.61|107.13|105.41|105.47|104.76|104.61|103.14|105.1|107.93|106.94|106.61|105.32|104.41|103.45|106.04|106.19|106.78|106.89|107.43|107.58|107.14|104.9|103.93|104.93|106.48|105.88|109.11|110.17|108.51|107.98|108.67|107.29|108.5|110.62|109.62|107.48|107.65|108.72|108.31|106.54|105.36|108.23|106.26|104.7|103.62|103.22|102.68|103.1|102.86|102.36|102.09|104.15|103.29|103.83|103.07|103.54|101.63|103.08|102.17|102.46|101.15|102.34|100.72|100.87|99.28|97.63|96.9|96.65|97.4|98.74|98.29|96.81|96.29|94.56|94.58|93.4|94.74|94.25|94.56|95.13|93.12|93.91|93.76|93.8|93.03|93.35|93.34|95.35|94.53|93.86|93.41|92.05|92.55|93.61|95.83|96.97|97.14|97.48|97.1|97.25|97.21|96.27|97.18|96.99|97.59|98.4|99.11|98.62|98.87|99.18|99.94|98.9|98.17|95.14|93.66|93.12|93.31|91.9|91.36|92.39|91.45|92.15|93.78|93.54|93.96|94.51|96.35|97.23|96.66|95.82|97.49|97.34|98.25|97.55|96.44|97.24|97.4|97.84|99.98|100.12|99.96|100.38|100.27|100.31|102.54|103.46|103.2|102.53|103.17|102.2|102.93|102.68|102.88|105.34|103.64|101.75|101.82|102.82|101.39|100.29|98.29|98.57|99.23|98.43|100.08|100.71|99.68|99.97|100.05|99.66|100.61|101.25|101.73|101.57|99.69|99.6|100.29|101.16|100.43|102.57|103.55|103.37|103.68|104.05|103.7|103.71|104.33|104.35|101.69|101.47|102.2|100.85|101.13|101.56|100.07|99.69|100.09|99.74|99.81|101.06|100.52|100.32|100.89|102.01|102.63|101.74|102.31|102.95|102.8|104.31|104.03|105.01|104.78|103.37|104.26|103.4|103.07|103.34|103.27|103.17|103.32|105.09|105.02|105.04|107.2|107.49|107.52|106.95|106.64|107.08|107.95|106.83|106.64|107.04|106.49|106.46|106.07|106.06|105.18|104.76|104.19|104.06|102.93|103.61|101.48|101.73|100.56|101.88|103.84|103.83|105.34|104.59|103.81|102.76|105.23|105.68|104.91|104.29|98.23|97.86|98.26|97.34|96.93|97.34|97.61|98.09|97.36|97.57|95.54|97.3|96.44|94.35|96.4|93.97|93.61|95.39|95.78|95.82|96.44|97.86|92.92|95.5|94.51|93.32|92.64|92.73|91.71|92.89|92.18|92.86|94.91|94.33|93.07|92.43|91.46|91.55|93.6|93.59|95.55|94.53|91.17|90.74|91.02|89.76|90.33|88.89|87.29|85.76|85.87|85.73|81.82|82.33|82.8|82.76|83.25|80.52|82.81|81.27|81.36|82.25|81.06|80.53|78.77|77.15|78.71|77.87|78.71|77.43|77.85|77.16|74.13|75.91|75.64|74.55|74.55|75.63|76.52|75.74|74.04|73.7|65.94|68.98|66.99|66.73|65.89|63.13|63.74|60.99|60.01|57.81|55.96|55.97|56.43|54.18|56.91|55.25|56.78|54.59|53.46|54.14|53.45|52.72|50.05|47.98|48.69|48.35|46.06|45.92|48.49|46.37|48.49|46.79|47.85|45.26|47.79|53.04|50.48|51.66|52.99|50.06|48.8|51.17|52.66|53.56|52.13|51.12|49.95|49.56|48.48|50.25|47.65|49.84|49.59|50.43|51.53|50.76|49.61|49.95|48.42|48.06|47.12|44.88|43.93|43.39|44.63|44.02|46|47.4|47.03|48.75|51.41|48.83|48.66|47.72|50.12|49.13|52.08|53.95|50.44|50.79|51.63|51.95|53.3|56.25|56.69|55.71|56.37|55.58|56.17|56.59|55.98|55.56|57.05|58.55|59.62|59.1|58.92|60.38|60.93|58.99|59.41|59.23|60.72|60.5|59.89|59.73|59.44|57.3|58.96|60.18|58.88|57.29|57.51|57.69|60.25|60.24|61.3|59.67|58|59.11|58.15|60.15|61.36|60.74|59.96|59.53|60.01|59.89|60.41|59.62|60.01|61.05|60.01|59.59|59.41|58.34|59.48|56.94|56.93|52.48|52.33|51.61|52.76|52.74|52.19|53.05|51.4|50.9|50.88|50.11|50.59|49.27|48.11|47.98|47.17|47.97|48.77|48.53|47.11|45.25|45.75|45.13|44.69|43.87|44.94|43.11|43.22|42.27|42.45|41.93|42.58|40.75|41|40.45|38.22|39.15|38.5|42.47|45.29|49.2|45.38|46.3|46.75|46.02|45.92|44.13|45.85|44.75|44.07|44.58|47.12|46.93|44.71|46.67|46.17|44.53|44.94|45.55|44.4|45.24|45.06|44.75|45.54|46.28|48.53|47.86|49.46|49.67|47.09|46.7|46.63|46.38|47.3|45.91|45.84|45.22|44.9|43.91|43.19|43.21|45.93|46.02|46.6|46.12|47.88|46.32|45.27|44.32|43.87|44.23|42.95|41.74|40.69|41.68|40.73|40.75|40.55|39.39|39.27|40.89|41.22|40.57|40.43|40.58|39.93|41.08|40|37.64|37.46|37.16|36.76|35.65|36.31|37.32|35.55|34.98|34.72|34.55|36.12|36.76|37.62|36.36|37.88|36.59|37.13|36.81|35.97|33.97|33.29|33.2|31.42|30.42|30.42|31.22|29.45|28.47|26.68|29.55|32.07|30.31|29.54|32.32|33.21|33.66|31.62|29.9|32.29|31.63|30.86|29.71|27.96|27.54|26.19|29.32|29.05|30.68|30.77|29.59|31.37|31.84|30.35|31.4|31.65|32.74|34.39|34.57|34.56|35.91|37.9|36.67|37.62|37.77|38.51|37.2|36.32|38.43|40.17|39.47|39.91|41.45|38.28|38.14|37.99|36.91|36.91|36.94|35.36|34.3|34.52|37.74|37.3|39.74|40.46|42.12|41.7|41.45|40.4|39.74|40.88|42.72|43.18|42.76|41.67|42.52|45.29|46.03|45.98|44.75|43.65|43.77|44.33|44.58|43.45|44.68|46.21|46.64|46.22|47.72|48.29|48.12|48.16|47.67|48.12|48.04|49.1|49|49.36|49.1|49.07|49.14|48.69|49.71|50.37|51.23|50.52|49.09|48.89|48.49|47.92|46.14|48|49.4|48.95|49.16|49.34|46.7|45.8|47.93|49.85|48.27|49.02|46.73|47.37|45.22|45.37|44.73|46.82|44.87|45.64|45.93|45.23|44.64|44.96|43.96|43.41|42.4|42.16|41.9|41.13|41.54|40.05|39.5|40.8|41.92|41.83|43.06|42.78|41.75|43.51|44.47|45.72|46.57|46.81|48.2|48.48|46.8|47.54|46.29|46.97|47.64|46.97|46.32|44.68|43.17|44.39|44.85|45.47|47.63|45.88|46.28|44.91|43.62|43.85|43.04|43.34|43.85|45.33|46.1|44.36|45.6|44.65|47.07|47.72|47.72|48.8|48.67|49.75|50.44|49.76|49.76|50.72|50.14|50.47|50.35|49.97|50.3|51.59|50.31|50.61|50.18|49.45|48.75|49.71|48.72|46.83|46.66|45.32|44.66|44.07|44.88|44.96|45.2|44.62|43.39|43.29|45.86|45.56|45.37|45.69|47.48|48.07|46.72|46.72|45.66|45.29|49.41|51.08|51.7|51.72|50.95|49.85|50.84|51.51|52.74|52.99|51.01|50.9|51.93|52.13|52.22|51.44|51.98|52.01|52.82|54.01|53.8|53.75|52.36|53.26|53.77|53.98|51.95|50.82|52.19|53.01|52.36|52.45|51.12|51.39|52.33|52.77|52.38|52.14|53.24|53.18|52.63|52.75|53.9|53.55|53.81|53.01|52.19|52.37|52.99|53.84|52.96|53.21|53.11|53.41|53.41|54.02|53.61|54.48|53.99|54.04|54|53.82|52.63|53.33|53.19|52.68|49.83|48.75|48.05|47.95|47.24|48.34|48.3|48.34|47.79|47.02|47.29|47|47.3|47.02|48.36|49.47|50.3|50.54|50.25|50.99|51.14|51.69|52.25|53.06|53.38|53.12|53.19|52.62|52.46|50.49|50.26|49.64|48.9|49.22|49.22|48.96|49.31|48.83|47.65|47.79|45.55|46.23|46.46|45.84|47.28|47.81|47.83|48.86|48.64|49.04|49.36|50.32|50.81|51.12|50.99|48.57|49.58|49.63|48.29|48.32|47.68|47.4|48.13|45.8|45.68|45.82|46.1|46.41|44.79|44.47|44.73|44.24|43.34|42.48|42.53|42.86|43.24|44.25|44.74|44.88|46.02|45.11|45.52|44.25|44.4|45.06|45.48|46.06|46.53|46.02|46.4|47.1|46.73|45.78|46.21|47.77|48.58|49.05|49.72|50.21|49.19|49.6|49.03|49.57|49.37|49.07|49.59|48.54|48.81|47.59|47.57|46.8|47.07|48.59|47.39|47.65|48.45|47.24|47.65|46.4|46.46|45.96|47.26|47.32|48.63|49.13|49.1|47.44|48.06|48.21|49.3|49.86|49.9|49.88|49.54|50.29|50.58|50.33|51.85|51.59|52.14|51.62|51.67|50.59|50.44|50|50.79|49.34|49.58|50.93|51.3|50.61|51.43|51.86|51.87|52.05|51.29|51.63|51.91|52.32|51.97|52.41|53.92|54.11|54.36|54.32|54.55|55.63|57.34|57.19|56.82|57.16|56.75|56.77|55.67|55.28|55.14|56.21|56.21|56.84|57.88|58.94|58.1|57.96|57.25|57.4|58.35|57.48|57.66|55.79|56.5|57.15|57.84|57.12|56.59|57|57.29|57.17|57.49|58.09|58.34|58.25|59.55|59.67|59.84|60.46|60.37|61.61|61.98|61.49|61.73|62.92|63.6|63.81|64.22|63.82|63.92|63.96|63.38|63.66|64.45|65.69|65.62|66.27|65.71|64.64|64.82|65.92|65.5|64.18|63.48|61.91|61.3|59.2|59.41|59.33|60.7|61.48|61.89|61.91|61.73|62.72|63.52|63.81|62.94|61.43|60.98|61.19|62.49|62.54|61.09|60.13|62.02|61.35|60.69|60.89|61.16|62.29|62.01|63.37|65.1|64.25|65.8|65.49|65.21|64.3|64.87|63.05|63.41|63.35|63.53|62.03|63.4|65.48|66.81|67.07|67.35|66.23|66.5|68.44|68.3|68.26|67.61|67.66|68|68.18|68.11|68.56|67.28|67.91|68.45|69.71|70.74|68.83|71.16|71.36|70.69|71.01|71.34|71.43|71.47|71.23|72.26|72.09|71.85|70.77|67.92|66.8|68.24|66.98|65.81|64.76|65.51|64.75|65.96|65.77|66.1|66.38|66.63|66.91|65.01|65.91|65.09|65.92|65.68|69.02|69.91|75.23|77.41|73.45|74.13|73.89|74.19|73.05|73.78|73.93|74.11|70.47|70.28|71.03|68.22|68.03|68.78|69.42|70.31|67.9|70.77|71.13|71.59|68.66|71.19|69.88|68.8|68.95|68.49|69.01|69.17|66.92|66.81|67.61|67.25|67.04|65.07|65.44|65.93|66.5|67.32|67.85|69.13|69.71|69.97|68.54|69.68|70.25|69.84|69.82|68.69|67.81|67.73|67.55|69.29|70.37|68.6|68.98|68.86|69.87|71.08|70.77|70.8|73.23|73.4|72.22|72.18|73.16|75.37|75.16|76.4|74.44|74.26|74.27|74.95|73.18|70.97|71.41|71.84|71.93|69.63|68.63|69.16|69.25|66.49|66.56|67.25|67.58|67|66.18|65.31|63.67|63.12|63.12|62.16|61.69|60.71|60.19|59.85|55.63|56.16|56.45|56.49|57.16|53.39|54.41|51.46|51.31|50.06|51.46|50.78|52.98|53.21|52.64|51.54|52.76|51.07|51.65|51.04|52.69|51.26|49.8|46.12|47.96|45.64|45.38|46.04|44.48|45.15|46.31|46.92|47.76|48.27|49.58|52.19|52.42|51.44|50.31|51.8|52.08|51.83|53.6|52.59|52.44|52.94|53.53|51.79|53.07|54.18|53.84|55.29|54.57|53.69|53.94|52.68|52.75|52.43|53.14|53.84|54.4|55.58|56.12|56.9|56.95|57.01|55.32|55.4|56.92|57.21|55.76|56.6|56.55|56.22|56.6|55.77|56.79|56.89|58.27|58.59|58.51|59.09|59.12|60.12|59.98|58.87|58.71|59.87|59.39|59.29|60.19|61.59|62.53|62.46|62.12|63.1|64.37|64.05|64.62|63.61|63.86|63.43|64.01|63.74|64.02|65.66|66.24|65.96|65.23|63.29|63.39|63.83|63.55|61.75|61.98|62.3|61.41|62.13|61.58|61.65|60.97|61.82|62.03|62.93|62.77|63.12|63.02|61.42|57.65|58.4|58.91|58.84|56.47|53.49|53.25|53.5|51.57|52.59|53.95|53.33|53.3|51.13|52.38|52.47|51.94|53.86|53.74|56.88|57.35|57.73|57.63|59.17|59.18|58.2|58.91|56|57.06|57.35|57.57|60.28|59.93|59.99|59.3|57.44|56.5|55.08|55.42|55.87|56.58|55.9|55.88|56.04|56.85|58.04|58.53|53.64|55.67|54.63|53.6|51.14|52.6|54.41|54.98|57.05|55.16|54.51|54.83|56.24|56.18|55.65|55.33|54.08|53.54|54.99|55.76|56.67|55.07|53.91|56.22|56.33|56.45|57.88|57.37|55.66|55.13|54.76|63.1|59.26|58.19|58.19|57.92|58.69|57.22|56.38|56.24|55.95|54.09|53.6|52.67|52.41|52.84|52.76|52.64|52.63|53.57|54.76|53.57|52.81|53.42|53.89|53.75|53.28|54.21|55.9|56.11|56.52|55.6|55.34|54.85|54.02|56.04|56.33|57.04|56.15|56.91|57.02|56.67|56.88|56.57|57.54|56.82|54.93|56.71|58.36|57.68|57.79|58.25|58.12|58.12|55.97|56.15|58.46|58.42|59.2|58.99|59.22|58.74|59.18|60.11|60.21|60.88|60.93|61.3|60.43|60.51|61.17|61.72|61.76|61.66|61.14|61.17|63|63.27|62.7|59.65|59.56|59.02|58.17|58.34|57.86|58.52|58.55|58.25|56.76|55.51|54.09|53.09|53.33|53.29|52.19|51.58|50.06|49.59|50.87|50.94|50.34|49.59|50|51.13|51.41|52.03|52.1|53.31|53.77|53.36|51.36|49.78|48.67|47.17|44.83|46.78|47.27|46.78|45.9|41.14|31.05|34.47|33.13|31.56|31.72|28.96|26.96|20.48|25.09|19.48|23.33|21.03|20.75|16.6|15.48|14.1|20.51|20.28|25.18|28.36|26.21|23.54|24.97|22.9|22.36|20.15|19.96|19.82|18.31|-36.98|8.91|13.64|15.06|15.99|12.17|12.4|15.04|19.23|19.72|20.47|24.56|23.88|23.68|24.73|24.02|25.76|25.37|27.4|29.44|31.83|32.3|33.56|34.3|33.49|34.7|32.8|33.67|35.57|35.49|36.88|37.33|37.42|39.49|38.17|38.98|39.54|36.43|36.24|37.07|38.26|37.91|38.79|39.72|40.6|40.4|37.91|38.66|38.53|39.67|39.27|39.88|40.57|40.51|40.59|40.91|39.64|40.56|40.06|40.3|41.2|40.74|40.55|40.83|41.76|41.88|40.99|41.23|41.46|40.89|41.13|39.85|40.1|40.83|41.67|42.25|41.93|41.16|41.94|41.53|42.6|42.26|42.05|42.89|42.89|42.91|42.62|42.32|42.44|43.17|43.21|42.88|42.96|42.61|42.76|42.76|41.39|39.69|36.87|38.05|37.25|37.33|37.23|38.29|40.17|40.99|41.09|39.26|39.55|39.92|40.11|40.06|40.47|39.03|40.05|38.51|36.9|39.12|40.52|39.82|41.04|40.44|39.22|40.03|40.86|40.84|40.7|40.69|41.37|39.88|40.46|39.73|38.39|39.34|37.27|35.94|35.64|36.6|37.44|38.97|38.56|36.97|40.05|41.18|41.23|40.9|39.93|41.14|41.24|41.64|41.57|41.99|42.91|44.71|45.58|45.2|44.54|45.23|45.65|46.23|45.72|45.64|45.48|46.76|46.59|47.02|47.58|47.86|48.34|49.04|47.79|47.02|47.94|48.18|47.5|47.85|48.24|48.35|47.47|49.78|50.45|50.63|52.14|52.15|53.08|52.81|53.47|52.25|52.87|53.16|53|52.28|52.78|52.61|52.81|52.26|52.16|53.55|54.77|55.67|56.19|56.8|57.95|58.34|58.69|58.22|59.5|60.07|61.09|60.4|59.12|61.67|61.66|63.21|63.43|61.55|60.54|59.7|61.33|63.81|66.08|65.03|64.02|64.45|66.02|65.59|65.36|64.82|64.55|59.95|61.43|61.48|57.75|61.12|58.47|60.93|61.49|60.55|59.19|61.41|58.73|59.34|59.77|59.61|59.29|59.7|60.2|63.15|63.42|63.16|63.33|62.61|61.34|61.45|62.18|62.02|63.03|63.81|65|63.5|64.46|65.72|65.63|64.73|64.96|64.92|65.31|65.96|63.82|65.32|66.24|65.49|63.28|61.95|63.61|66.13|66.27|66.41|66.87|66.31|67.8|68.79|68.81|69.57|69.21|70.11|69.9|70.34|71|70.94|72.06|72.03|71.06|71.64|73.64|73.15|73.11|73.31|74.21|72.98|73.14|73.52|75.33|75.37|73.62|72.22|72.98|74.56|74.21|75.24|73.06|71.67|71.76|66.45|67.32|70.26|72.15|72.24|72.15|71.68|72.37|73.62|73.93|71.31|70.64|68.19|69.1|68.26|66.56|68.33|69.3|69.12|68.36|67.44|66.5|65.36|63.69|62.25|65.65|67.5|68.54|67.42|68.84|69.28|68.43|68.63|70.07|69.34|68.49|69.36|68.26|69.82|70.54|70.53|72.59|72.69|72.09|70.41|70.51|72.37|73.43|74.18|75.54|75.44|75.06|75.22|76.01|77.68|79.17|77.66|78.46|79.55|80.64|80.75|80.67|81.43|82.39|82.62|83.19|84.4|82.64|84.53|84.64|85.64|82.66|82.78|83.5|84.08|83.91|80.82|78.88|81.25|81.96|84.12|81.23|81.47|80.87|80.85|80.76|78.32|78.92|76.11|76.74|78.32|78.32|69.88|66.14|65.44|66.6|66.39|69.62|71.94|72.43|70.87|71.71|71.19|70.57|70.89|72.34|70.93|68.69|71.1|72.82|73.89|75.49|76.01|76.58|76.83|75.33|75.99|77|77.83|79.47|79|78.11|81.17|82.51|81.97|83.82|85.42|86.84|86.29|85.16|84.48|86.61|88.33|87.61|87.67|89.16|88.22|88.16|90.17|92.27|91.25|89.32|89.57|89.83|93.1|95.52|92.07|93.83|91.78|91.26|92.11|92.14|92.77|91.68|96.13|103.66|110.74|107.69|115.77|119.26|123.64|108.81|105.93|109.31|103.22|96.42|94.85|102.97|104.69|112.14|111.03|114.89|114.2|116.2|107.55|104.25|107.81|100.53|99.32|103.29|101.98|96.39|96.05|98.35|94.22|100.52|104.26|106.84|108.24|102.54|102.56|103.89|102.86|99.6|102.62|101.96|105.47|104.59|105.18|102.53|107.84|108.17|109.72|103.08|99.74|105.5|106.15|110.52|114.07|112.31|109.67|112.21|112.63|110.32|112.55|112.88|116.19|114.96|114.38|115.26|116.88|118.97|118.41|119.55|121.94|121.52|120.73|120.92|118.92|115.32|117.56|109.56|110.49|106.22|105.75|109.07|111.44|113.66|111.65|107.76|110.3|101.55|100.31|104.62|106.78|106.09|97.69|98.44|97.79|99.59|104.48|106.12|104.45|98.44|97.71|99.83|97.74|100.03|99.11|101.31|96.59|97.14|93.25|91.29|91.77|93.52|93.18|94.68|97.02|94.86|92.24|89.23|90.85|93.2|93.55|93.42|96.46|95.52|93.33|93.63|97.4|92.08|90.09|87.09|87.29|87.35|82.5|84.04|87.27|88.18|87.84|88.88|85.72|85.57|86.15|84.69|83.38|84.02|79.07|77.17|78.91|82.61|81.78|79.91|84.05|86.87|88.22|88.9|93.07|91.6|89.75|87.83|89.59|86.1|86|83.29|86|86.02|85.47|86.12|86.93|89.39|89.06|87.85|86.54|88.36|90.06|88.14|92.58|91.8|88.8|85.79|86.52|89.14|85.85|86.87|85.62|81.69|80.07|79.74|80.83|77.93|76.45|77.1|77.96|80.48|81.06|79.86|76.83|74.21|71.93|71.3|71.05|72.96|75.44|77.14|75.89|74.19|75.05|75.92|78.17|77.68|79.57|79.45|78.89|78.43|80.16|76.87|72.82|73.61|73.77|74.69|75.11|77.46|78.32|79.9|80.25|79.53|80.31|81.27|81.62|79.86|79.78|80.64|79.73|77.97|78.95|76.34|75.87|73.4|74.11|77.17|78.47|78.04|79.74|80.14|79.08|78.57|78.45|76.31|76.28|73.95|75.26|76.19|75.57|76.88|77.57|78.05|79.62|80.39|77.45|76.56|75.6|76.55|74.68|71.18|67.38|68.15|66.61|67.56|69.4|70.71|69.77|69.22|72.87|73.12|72.95|74.32|75.68|80.4|80.7|80.69|80.7|79.79|81.54|83.26|82.16|82.58|80.93|80.85|79.18|77.27|77.86|78.64|77.05|74.33|74.77|76.78|75.65|71.71|68.62|68.52|71.32|73.13|73.68|72.53|70.81|70.02|71.07|70.85|72.78|71.82|71.57|71.81|72.87|74.37|71.68|72.35|69.45|68.11|70.09|71.76|72.14|71.71|72.52|71.28|70.16|67.08|69.39|68.22|70.61|71.81|70.94|72.55|69.22|68.91|69.09|67.68|69.54|69.85|70.66|69.71|71.78|71.76|73.91|73.05|74.87|75.77|76.86|75.44|74.17|75.76|75.4|75.65|77.06|78.81|79.76|79.11|80.17|80.55|81.8|81.37|79.5|81.56|82.76|81.94|82.94|84.35|82.81|83.17|82.5|81.06|79.4|80.43|81.25|80.71|80.25|78.91|79.52|80.47|80.65|81.14|81.64|83.55|85.52|86.74|87.55|86.87|87.51|87.3|88.87|88.59|90.13|90.83|91.47|91.16|89.2|89.56|90|89.68|91.43|93.67|91.65|90.77|88.81|89.26|84.32|82.3|82.83|85.89|83.7|82.87|87.67|86.65|86.66|88.35|89.35|89.12|85.49|84.58|86.07|83.8|86.04|83.03|81.64|81.05|83.04|81.19|81.54|77.96|75.85|76.34|78.86|78.9|77.15|73.5|76.47|78.1|78.35|76.8|74.83|74.46|76.09|77.56|75.66|73.7|72.73|71.95|68.98|69|70.87|70.95|68.27|69.09|71.21|71.05|72.16|73.23|73.87|73.59|73.29|75.84|74.31|72.02|71.89|70.62|72.97|72.38|74|71.06|72.43|71.57|72.15|72.94|72.63|72.79|74.32|73.69|75.26|74.72|75.48|77.91|78.45|77.25|78.3|76.28|74.36|72.72|73.21|73.83|74.26|76.67|77.26|77.34|78.28|77.09|78.47|79.65|78.72|78.89|79.64|77.6|78.53|79.8|79.44|79.22|80.9|79.67|79.11|80.08|79.81|78.96|78.87|78.51|80.67|82.16|81.94|83.68|84.39|82.79|81.99|81.1|82.41|82.41|82.15|83.96|84.54|85.95|86.22|87.37|87.69|87.24|86.04|86.98|85.79|86.46|86.21|86.15|83.58|83.5|83.79|83.82|84.17|84.09|84.92|85.38|84.26|83.49|80.7|80.59|79.65|80.1|79.97|80.57|80.86|79.81|80.71|79.62|80.23|80.85|81.66|81.39|80.66|79.15|77.47|78.48|80.9|80.24|78.96|77.97|75.26|74.27|75.08|76.52|76.53|78.75|78.88|79.56|79.61|79.41|81.33|82.67|83.34|81.71|82.63|81.97|82.19|83.04|82.83|84.7|84.09|85.19|84.44|83.63|82.78|83.39|83.92|83.49|83.22|81.92|84.16|84.17|81.43|81.25|78.24|78.78|79.43|78.58|77.27|76.17|79.36|77.74|74.99|74.46|74.6|76.68|77.64|78.28|81.45|79.81|78.47|79.66|78.05|75.82|75.27|72.76|73.72|75.82|78.4|76.5|75.49|76.9|74.52|71.28|70.11|70.09|68.58|69.65|66.73|68.25|69.89|69.59|71.1|72.16|71.87|72.86|72.72|71.33|72.34|70.42|68.28|68.72|68.75|70.41|70.74|74.33|74.93|77.76|74.26|73.85|76.46|76.11|71.22|70.97|71.26|69.78|71.16|72.84|71.37|70.58|72.02|67.65|67.48|68.91|69.58|69.81|71.83|72.26|71.98|72.69|70.69|68.43|68.76|68.99|67.33|69.46|69.75|69.25|70.39|71.68|69.41|69.05|69.03|68.26|68.35|70.15|68.81|68.58|68.58|68.65|68.85|70.57|70.25|71.54|71.03|70.31|70.8|70.1|69.71|69.5|70.87|70.38|71.28|71.73|72.44|73.79|74.64|74.31|74.99|73.99|77.27|79.57|78.2|80.73|79.35|78.56|76.79|76.12|75.03|74.97|73.51|74.15|72.94|73.1|72.84|73.52|73.04|71.39|70.97|71.32|72.73|73.67|71.72|71.66|71.05|72.21|72.58|72.88|70.72|71.06|69.15|68.87|70.62|69.97|68.63|68.47|66.58|66.62|67.29|66.31|66.52|67.65|66.82|67.43|67.84|67.49|67.4|68.55|68.52|69.46|69.48|70.05|70.3|69.74|71.87|71.61|72.12|67.43|62.42|61.05|60.04|62.63|60.57|61.91|61.99|61.74|62.88|65.07|63.48|64.6|62.64|63.55|63.85|63.3|61.84|59.55|60.59|59.67|58.5|60.42|59.42|61.25|62.37|63.32|65.04|64.48|63.03|63.84|63.98|63.97|62.93|62.55|62.89|61.61|62.54|61.66|61.46|63.27|64.1|63.57|64.06|65.3|65.99|65.66|68.91|68.73|73.84|72.53|75.62|75.89|75.72|69.36|65.45|65.98|66.44|66.66|66.3|66.64|68.66|68.13|69.16|69.55|69.61|67.78|69.63|68.19|67.76|67.13|68.76|68.53|68.39|67.56|66.05|67.16|66.38|67.81|70.27|71.09|70.36|68.39|67.33|66.2|65.38|64.9|64.94|65.03|64.22|63.68|64.99|63.78|64.51|63.38|64.19|64.56|64.08|65.18|63.6|64.49|64.96|64.36|65.95|64.36|63.81|62.22|62.6|62.97|64.01|62.71|63.02|63.66|64.89|64.41|63.91|63.02|62.99|63.76|65.4|65.51|66.5|64.27|63.17|62.59|61.28|61.65|62.49|62.52|63.37|62.36|59.75|59.52|59.08|58.29|58.3|58.34|58.66|59.3|62.44|62.27|62.13|60.97|61.26|61.36|61.75|61.79|61.38|60.4|60.24|60.54|60.94|59.3|59.54|60.87|60.66|61.51|60.27|60.07|58.86|59.11|58.25|58.81|58.58|59.47|58.81|59.09|59.82|60.23|59.04|58.4|58.67|57.76|57.61|56.97|55.44|56.07|56.22|56.8|58.18|58.55|58.72|56.6|57.89|57.79|57.26|57.21|58.1|56.97|56.01|57.74|58.96|59.39|60.85|61.84|59.13|59.4|60.3|60.38|59.24|60.7|60.46|62.04|62.75|64.77|64.5|61.6|62.62|64.56|62.9|63.77|64.53|64.2|64.8|63.08|63.05|62.53|65.33|66.66|66.69|66.36|65.62|65.3|65.1|66.96|71.13|74.48|74.58|80.88|90.77|94.65|83.71|86.8|95.61|98.48|93.39|96.01|96.12|96.11|98.71|89.33|93.18|91.51|96.18|101.26|104.69|102.86|101.9|113.23|114.01|114.58|96.17|99.62|98.34|100.72|93.07|93.04|96.46|85.91|91.06|93.64|94.76|99.27|98.42|99.89|103.45|110.47|108.64|105.38|109.76|105.66|98.75|98.38|98.87|101.56|105.78|104.52|104.66|108.99|112.25|112.09|101.69|100.2|100.35|97.63|92.35|92.65|91.16|95.96|97.47|99.76|96.83|94.32|95|91.9|93.68|91.58|88.62|84.65|79.8|80.65|80.35|78.94|74.62|71.42|72.67|70.3|71.87|70.56|69.74|69.73|69.6|71.53|74.56|73.15|72.45|79.2|80.44|80.73|80.03|83.43|84.38|86.04|87.66|93.08|91.74|84.25|80.91|86.08|85.15|86.16|81.96|77.33|76.78|78.88|79.77|83.76|84.77|84.97|82.77|83.99|86.04|86.48|87.28|89.75|87.21|86.34|83.9|83.46|84.81|84.57|87.03|91.48|92.15|92.55|92.69|94.21|97.26|103.57|101.27|102.42|107.02|103.62|103.21|101.44|96.97|96.41|93.38|95.88|85.23|99.37|96.16","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-dd923516","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the price of 1991-07-12":"The price of 1991-07-12 is 21.74.","the price of 2018-10-23":"The price of 2018-10-23 is 66.49.","the price of 2001-12-07":"The price of 2001-12-07 is 19.08.","the price of 2025-12-10":"The price of 2025-12-10 is 58.67.","the price of 2006-01-04":"The price of 2006-01-04 is 63.41.","the price of 2023-04-21":"The price of 2023-04-21 is 77.86.","the price of 2021-08-12":"The price of 2021-08-12 is 69.12.","the price of 2022-10-20":"The price of 2022-10-20 is 86.02.","the price of 1991-02-27":"The price of 1991-02-27 is 19.03.","the price of 1990-04-26":"The price of 1990-04-26 is 18.5.","the price of 2019-12-12":"The price of 2019-12-12 is 59.18.","the price of 2020-11-10":"The price of 2020-11-10 is 41.18.","the price of 1994-01-03":"The price of 1994-01-03 is 14.52.","the price of 1987-10-14":"The price of 1987-10-14 is 19.79.","the price of 1996-10-17":"The price of 1996-10-17 is 25.4.","the price of 1989-07-20":"The price of 1989-07-20 is 19.92.","the price of 2023-06-15":"The price of 2023-06-15 is 70.61.","the price of 2000-03-08":"The price of 2000-03-08 is 31.22.","the price of 2006-04-05":"The price of 2006-04-05 is 66.76.","the price of 2014-02-10":"The price of 2014-02-10 is 100.12.","the price of 1996-07-18":"The price of 1996-07-18 is 21.68.","the price of 2001-07-09":"The price of 2001-07-09 is 27.63.","the price of 2001-10-31":"The price of 2001-10-31 is 21.2.","the price of 1997-09-26":"The price of 1997-09-26 is 20.87.","the price of 2016-07-18":"The price of 2016-07-18 is 45.23.","the price of 1986-06-16":"The price of 1986-06-16 is 13.65.","the price of 2007-12-07":"The price of 2007-12-07 is 88.23.","the price of 2026-09-25":"The price of 2026-09-25 is 85.23.","the price of 1995-07-05":"The price of 1995-07-05 is 17.21.","the price of 2008-05-16":"The price of 2008-05-16 is 126.5.","the price of 2017-04-28":"The price of 2017-04-28 is 49.31.","the price of 1991-08-23":"The price of 1991-08-23 is 21.78.","the price of 2005-05-23":"The price of 2005-05-23 is 48.68.","the price of 2014-03-12":"The price of 2014-03-12 is 98.29."}}},
{"id":"n-ed016e91","guard":[["not",["hasAny",["19891115","19911115","19911121","19951117","19991115","20011115","20031121","20061115","20061122","20071130","20081121","20091124","20101115","20111115","20151130","20161115","20161121","20171115","20171117","20181115","20201130","20211130","20221115","20231115","20231117","20251121","add","close","compare","confirmed","date","greater","high","larger","lesser","makes","mortality","open","recovered","smaller","sum","version"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"date"}],{"lit":1}],{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"date"},{"lit":"price"}],["transform.nthStr",["know.find",{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"}],{"lit":2}]]],"mem":null},
{"id":"n-04da412a","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2003-10-31":"The price of 2003-10-31 is 29.24."}}},
{"id":"n-08db1c5c","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2001-08-06":"The price of 2001-08-06 is 27.7."}}},
{"id":"n-11b2e37b","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1986-06-16":"The price of 1986-06-16 is 13.65."}}},
{"id":"n-15184f69","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2014-06-26":"The price of 2014-06-26 is 106.49."}}},
{"id":"n-1522f625","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2001-12-28":"The price of 2001-12-28 is 20.42."}}},
{"id":"n-16836632","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1990-11-27":"The price of 1990-11-27 is 33.05."}}},
{"id":"n-17017c46","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1998-01-21":"The price of 1998-01-21 is 16.05."}}},
{"id":"n-19472b35","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2018-10-23":"The price of 2018-10-23 is 66.49."}}},
{"id":"n-1b65cdd4","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2020-07-22":"The price of 2020-07-22 is 41.88."}}},
{"id":"n-1d371367","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1997-09-09":"The price of 1997-09-09 is 19.5."}}},
{"id":"n-1e206819","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1991-07-12":"The price of 1991-07-12 is 21.74."}}},
{"id":"n-1ffd711d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1994-03-04":"The price of 1994-03-04 is 14.57."}}},
{"id":"n-21d263ea","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2003-04-01":"The price of 2003-04-01 is 29.48."}}},
{"id":"n-25a674b8","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2007-11-15":"The price of 2007-11-15 is 93.37."}}},
{"id":"n-284dd7d1","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1997-09-26":"The price of 1997-09-26 is 20.87."}}},
{"id":"n-2b264fee","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2021-08-27":"The price of 2021-08-27 is 68.84."}}},
{"id":"n-2cf1bf07","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2014-09-23":"The price of 2014-09-23 is 91.55."}}},
{"id":"n-320d101e","guard":[["has","price"],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2025-04-23":"The price of 2025-04-23 is 62.64."}}},
{"id":"n-33bf39ab","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1996-11-11":"The price of 1996-11-11 is 23.35."}}},
{"id":"n-345a7e9b","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2002-04-24":"The price of 2002-04-24 is 26.28."}}},
{"id":"n-370aeafc","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2021-03-22":"The price of 2021-03-22 is 61.48."}}},
{"id":"n-3af2a35a","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2026-09-25":"The price of 2026-09-25 is 85.23."}}},
{"id":"n-3b2272f3","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1994-03-03":"The price of 1994-03-03 is 14.74."}}},
{"id":"n-3e376c8f","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1989-07-20":"The price of 1989-07-20 is 19.92."}}},
{"id":"n-3e7c46a5","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2019-12-12":"The price of 2019-12-12 is 59.18."}}},
{"id":"n-495f5cea","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2020-02-20":"The price of 2020-02-20 is 53.77."}}},
{"id":"n-4a88ecf2","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2000-03-08":"The price of 2000-03-08 is 31.22."}}},
{"id":"n-4e330885","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1992-06-05":"The price of 1992-06-05 is 22.65."}}},
{"id":"n-4ebda6b1","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2021-04-27":"The price of 2021-04-27 is 63.03."}}},
{"id":"n-54a83f5e","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2001-12-07":"The price of 2001-12-07 is 19.08."}}},
{"id":"n-573f7065","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2022-10-20":"The price of 2022-10-20 is 86.02."}}},
{"id":"n-57a21391","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1989-05-11":"The price of 1989-05-11 is 20.13."}}},
{"id":"n-58c96365","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2026-08-31":"The price of 2026-08-31 is 87.03."}}},
{"id":"n-5a02062c","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2006-01-04":"The price of 2006-01-04 is 63.41."}}},
{"id":"n-5b4d0f9e","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2000-01-24":"The price of 2000-01-24 is 29.25."}}},
{"id":"n-5b50c78b","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2008-05-19":"The price of 2008-05-19 is 127.15."}}},
{"id":"n-5c9df132","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2009-08-27":"The price of 2009-08-27 is 72.49."}}},
{"id":"n-635bcc93","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2001-07-09":"The price of 2001-07-09 is 27.63."}}},
{"id":"n-63a462a6","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2023-01-12":"The price of 2023-01-12 is 78.32."}}},
{"id":"n-6793be91","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1996-07-18":"The price of 1996-07-18 is 21.68."}}},
{"id":"n-687b95b6","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2021-08-12":"The price of 2021-08-12 is 69.12."}}},
{"id":"n-6a7b6f56","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2022-02-22":"The price of 2022-02-22 is 92.11."}}},
{"id":"n-6bb9cdc7","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1987-10-14":"The price of 1987-10-14 is 19.79."}}},
{"id":"n-6df1f11b","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2022-02-16":"The price of 2022-02-16 is 93.83."}}},
{"id":"n-741d3a31","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2024-07-26":"The price of 2024-07-26 is 78.58."}}},
{"id":"n-74fc21cf","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2008-02-19":"The price of 2008-02-19 is 99.99."}}},
{"id":"n-7a245e89","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1995-07-05":"The price of 1995-07-05 is 17.21."}}},
{"id":"n-7a97dc72","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2018-06-04":"The price of 2018-06-04 is 64.76."}}},
{"id":"n-7c9afe6d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2003-08-07":"The price of 2003-08-07 is 32.41."}}},
{"id":"n-821f60f6","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2017-07-19":"The price of 2017-07-19 is 47.1."}}},
{"id":"n-862e364d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2001-10-31":"The price of 2001-10-31 is 21.2."}}},
{"id":"n-8bc63c09","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2006-08-02":"The price of 2006-08-02 is 76.16."}}},
{"id":"n-8d0a9757","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2020-11-10":"The price of 2020-11-10 is 41.18."}}},
{"id":"n-8df21d84","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2001-10-03":"The price of 2001-10-03 is 22.17."}}},
{"id":"n-91fc0ff3","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2007-12-07":"The price of 2007-12-07 is 88.23."}}},
{"id":"n-94ad7883","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2001-03-23":"The price of 2001-03-23 is 27.31."}}},
{"id":"n-94fc7592","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2018-02-06":"The price of 2018-02-06 is 63.48."}}},
{"id":"n-98753b19","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2016-07-18":"The price of 2016-07-18 is 45.23."}}},
{"id":"n-9a4cf46e","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2014-04-15":"The price of 2014-04-15 is 103.7."}}},
{"id":"n-9b8d36d7","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2006-04-17":"The price of 2006-04-17 is 70.3."}}},
{"id":"n-9bb527cd","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2025-06-20":"The price of 2025-06-20 is 75.72."}}},
{"id":"n-9c0904cb","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1993-05-03":"The price of 1993-05-03 is 20.58."}}},
{"id":"n-9d0b51e0","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1997-11-20":"The price of 1997-11-20 is 19.17."}}},
{"id":"n-9e4e7ff8","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2014-03-12":"The price of 2014-03-12 is 98.29."}}},
{"id":"n-a0e1ccb8","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2023-06-15":"The price of 2023-06-15 is 70.61."}}},
{"id":"n-a50df9d3","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2005-05-23":"The price of 2005-05-23 is 48.68."}}},
{"id":"n-a5748ba5","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2008-01-03":"The price of 2008-01-03 is 99.17."}}},
{"id":"n-a83f168a","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2008-12-08":"The price of 2008-12-08 is 43.69."}}},
{"id":"n-a92e00e2","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2025-03-04":"The price of 2025-03-04 is 68.47."}}},
{"id":"n-ae28b4a1","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2006-04-05":"The price of 2006-04-05 is 66.76."}}},
{"id":"n-aeb30f19","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2023-04-21":"The price of 2023-04-21 is 77.86."}}},
{"id":"n-affa7539","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2014-02-10":"The price of 2014-02-10 is 100.12."}}},
{"id":"n-b2c4f10d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1994-06-07":"The price of 1994-06-07 is 17.78."}}},
{"id":"n-b703644f","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2015-12-16":"The price of 2015-12-16 is 35.55."}}},
{"id":"n-b87ad9fe","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1996-10-17":"The price of 1996-10-17 is 25.4."}}},
{"id":"n-b9a89254","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2005-11-23":"The price of 2005-11-23 is 58.35."}}},
{"id":"n-bc1286c8","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2006-10-10":"The price of 2006-10-10 is 58.5."}}},
{"id":"n-bd061839","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2003-08-19":"The price of 2003-08-19 is 30.76."}}},
{"id":"n-bf6e8fa4","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2025-12-04":"The price of 2025-12-04 is 59.82."}}},
{"id":"n-c3112771","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1990-04-26":"The price of 1990-04-26 is 18.5."}}},
{"id":"n-cca5dcdc","guard":[["has","price"],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2011-07-26":"The price of 2011-07-26 is 99.61."}}},
{"id":"n-cf7448d9","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2025-08-15":"The price of 2025-08-15 is 63.78."}}},
{"id":"n-d214c09c","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2011-01-06":"The price of 2011-01-06 is 88.37."}}},
{"id":"n-d784e538","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2022-04-29":"The price of 2022-04-29 is 104.59."}}},
{"id":"n-d901f0b5","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2023-10-10":"The price of 2023-10-10 is 85.89."}}},
{"id":"n-d9bf2be9","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1990-12-06":"The price of 1990-12-06 is 26.35."}}},
{"id":"n-db7c1b41","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1988-10-13":"The price of 1988-10-13 is 14.26."}}},
{"id":"n-dfdcc9b6","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2008-03-03":"The price of 2008-03-03 is 102.42."}}},
{"id":"n-e23ea789","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1991-02-07":"The price of 1991-02-07 is 21.33."}}},
{"id":"n-e6359835","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1991-02-27":"The price of 1991-02-27 is 19.03."}}},
{"id":"n-e723980e","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1994-01-03":"The price of 1994-01-03 is 14.52."}}},
{"id":"n-eba7e0fc","guard":[["has","price"],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1994-11-11":"The price of 1994-11-11 is 18.07."}}},
{"id":"n-ecc95fa9","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2025-12-10":"The price of 2025-12-10 is 58.67."}}},
{"id":"n-edc8287b","guard":[["has","price"],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2016-04-29":"The price of 2016-04-29 is 45.98."}}},
{"id":"n-f0215953","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2015-12-09":"The price of 2015-12-09 is 37.16."}}},
{"id":"n-f0679b7d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2008-05-16":"The price of 2008-05-16 is 126.5."}}},
{"id":"n-f4cbab8c","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2001-05-25":"The price of 2001-05-25 is 28.08."}}},
{"id":"n-f60d6583","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1991-08-23":"The price of 1991-08-23 is 21.78."}}},
{"id":"n-fa10688f","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1996-02-21":"The price of 1996-02-21 is 21.63."}}},
{"id":"n-fd0d10e8","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2017-04-28":"The price of 2017-04-28 is 49.31."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the price of 1991-07-12","expect":{"contains":["21.74"],"notRefusal":true}},{"q":"give the price of 2006-10-10","expect":{"contains":["58.5"],"notRefusal":true}},{"q":"what is the price of 2018-10-23","expect":{"contains":["66.49"],"notRefusal":true}},{"q":"what is the price of 2001-12-07","expect":{"contains":["19.08"],"notRefusal":true}},{"q":"tell me the price of 2011-07-26","expect":{"contains":["99.61"],"notRefusal":true}},{"q":"tell me the price of 2002-04-24","expect":{"contains":["26.28"],"notRefusal":true}},{"q":"what is the price of 2025-12-10","expect":{"contains":["58.67"],"notRefusal":true}},{"q":"give the price of 2017-07-19","expect":{"contains":["47.1"],"notRefusal":true}},{"q":"what is the price of 2006-01-04","expect":{"contains":["63.41"],"notRefusal":true}},{"q":"tell me the price of 2008-03-03","expect":{"contains":["102.42"],"notRefusal":true}},{"q":"give the price of 2015-12-16","expect":{"contains":["35.55"],"notRefusal":true}},{"q":"give the price of 1994-11-11","expect":{"contains":["18.07"],"notRefusal":true}},{"q":"give the price of 2005-11-23","expect":{"contains":["58.35"],"notRefusal":true}},{"q":"what is the price of 2023-04-21","expect":{"contains":["77.86"],"notRefusal":true}},{"q":"tell me the price of 2024-07-26","expect":{"contains":["78.58"],"notRefusal":true}},{"q":"give the price of 2006-04-17","expect":{"contains":["70.3"],"notRefusal":true}},{"q":"give the price of 2023-10-10","expect":{"contains":["85.89"],"notRefusal":true}},{"q":"tell me the price of 2008-12-08","expect":{"contains":["43.69"],"notRefusal":true}},{"q":"tell me the price of 2001-05-25","expect":{"contains":["28.08"],"notRefusal":true}},{"q":"tell me the price of 1990-12-06","expect":{"contains":["26.35"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
