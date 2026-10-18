// gmsl-smoothed-of-time-e510-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"gmsl-smoothed-of-time-e510-neo-g10","class":"gmsl-smoothed-of-time-e510","generation":10,"lane":"neo","grownFrom":["what is the gmsl smoothed of 2015-Feb","give the gmsl smoothed of 2018-Jan","tell me the gmsl smoothed of 1996-Apr","tell me the gmsl smoothed of 2020-May","what is the gmsl smoothed of 2010-Feb","give the gmsl smoothed of 2013-Dec","tell me the gmsl smoothed of 2011-Dec","give the gmsl smoothed of 2017-Aug","tell me the gmsl smoothed of 1997-Apr","tell me the gmsl smoothed of 2000-Feb","tell me the gmsl smoothed of 2006-Aug","tell me the gmsl smoothed of 2007-Dec","what is the gmsl smoothed of 2014-Jun","what is the gmsl smoothed of 2012-Mar","what is the gmsl smoothed of 2010-Oct","give the gmsl smoothed of 2001-Jan","tell me the gmsl smoothed of 2013-Jan","what is the gmsl smoothed of 2013-Jun","give the gmsl smoothed of 2017-Sep","give the gmsl smoothed of 2012-Apr"],"version":1});

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
knowLoad([{"id":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3","columns":["time","gmsl monthly","gmsl smoothed"],"n":331,"cols":[{"f":"01993-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|34-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|35-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|36-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|37-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|38-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|39-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|02000-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|31-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|32-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|33-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|34-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|35-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|36-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|37-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|38-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|39-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|210-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|31-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|32-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|33-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|34-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|35-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|36-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|37-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|38-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|39-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l|5Aug|5Sep|5Oct|5Nov|5Dec|220-Jan|5Feb|5Mar|5Apr|5May|5Jun|7l","sep":"|"},{"s":"-48.7|-52.4|-44.4|-50.4|-46.3|-51.5|-45.7|-44.9|-37.4|-38.5|-39.3|-40.4|-44.3|-49|-40.6|-44.1|-48.9|-49.3|-48.1|-41.7|-40.6|-35|-43.3|-39.4|-44.8|-42.7|-43|-40.6|-49.2|-44|-48.9|-38.1|-35.5|-30.8|-36.7|-34.2|-47.2|-37.1|-42.3|-38.4|-40.5|-37.8|-36.2|-33.3|-29.7|-18.8|-24.3|-36|-36.5|-39.8|-34.8|-38.2|-34.1|-37|-28|-27.7|-16.3|-21.6|-19.5|-31|-26.2|-29.8|-23.9|-27.7|-26.6|-32.3|-25.1|-25.5|-19|-16.7|-19.3|-22.1|-24.6|-24.4|-29.3|-28.5|-32.9|-31.2|-29.9|-22.4|-22.6|-10.3|-21.9|-14.8|-24.8|-20.5|-25.3|-23.5|-30.9|-25|-29.7|-18.9|-17.5|-8.1|-15.7|-17.8|-20.3|-21|-19.6|-20.5|-22.6|-22.9|-17.1|-17.6|-5.7|-10.5|-7.2|-16.9|-14.8|-16.8|-17.7|-18.7|-17.8|-20.7|-14.2|-8.5|-7.7|-2.3|-7.5|-10.4|-12.7|-12.1|-13.3|-14.7|-15.2|-18.5|-15.4|-11.7|-2.8|-2.8|-5.3|-8.4|-8.1|-12.2|-10.6|-11.9|-14.4|-15.1|-11.2|-9.1|-1.5|-3.1|-4.6|-4.3|-9|-8.2|-7.3|-10.1|-10.2|-9.9|-8.7|-4.8|0.1|2.7|3.8|1.1|-7.1|-5.7|-7.1|-7.3|-8.5|-7.7|-5.6|-2.1|2.8|5.8|0.4|0.1|-6.6|-6.3|-6.5|-2.6|-7.7|-8.3|-8.1|-3|0.9|4.2|6.1|-0.7|-1|-5.4|-1.4|-3.6|1.3|-1.9|-0.2|2.2|8.6|10.1|10.6|6|6.9|3.9|0|3.8|1.4|2.8|2.4|4.7|7.9|14.3|16.2|15.3|12.1|5.3|5|4.9|5.4|5.9|8.7|8.1|10.3|10.9|15|11.7|9.4|4.8|3.7|0|2.4|0.9|5.6|4.6|12.6|13.5|19.1|15.1|15.7|16.7|13.3|12.5|11.3|12.4|15.2|19.6|20.7|25.3|27.4|27.4|25.6|23.1|18.5|21|17.3|17.9|16|20.1|19.7|25.2|26.5|28.3|23.4|21.9|20.9|21.6|18.7|18.3|20.2|23.5|28.3|29.7|33.4|29.2|32.6|27.4|30.4|27.6|29.7|26.6|31.5|32.4|38.9|42.4|47|43.5|41.3|37.8|36.6|35.8|33.5|35.2|36.6|36.6|41.8|43.2|47.1|41.9|37|32.7|35.6|36.9|34.7|34.7|38.2|42.6|46.9|47.7|50.7|46.4|41.8|38.9|40.2|36|40|38.2|42.6|44|51.9|54|53|48.4|47.5|45.7|47.7|45.4|47.5|46.9|49.3|54.4|57.8|59.3|58.6|56.2|49|51.1|48|49.7|49.1|50.3|52.1","sep":"|","num":true},{"s":"|-48.5|-49.1|-47|-49.4|-47.8|-47.4|-42.7|-40.2|-38.4|-39.4|-41.3|-44.6|-44.6|-44.5|-44.5|-47.4|-48.7|-46.3|-43.5|-39.1|-39.6|-39.2|-42.5|-42.3|-43.5|-42.1|-44.2|-44.6|-47.4|-43.7|-40.8|-34.8|-34.3|-33.9|-39.4|-39.5|-42.2|-39.3|-40.4|-38.9|-38.2|-35.8|-33.1|-27.3|-24.3|-26.4|-32.2|-37.4|-37|-37.6|-35.7|-36.4|-33|-30.9|-24|-21.9|-19.1|-24|-25.6|-29|-26.7|-27.1|-26.1|-28.9|-28|-27.6|-23.2|-20.4|-18.3|-19.4|-22|-23.7|-26.1|-27.4|-30.2|-30.8|-31.3|-27.8|-24.9|-18.4|-18.3|-15.7|-20.5|-20|-23.5|-23.1|-26.6|-26.5|-28.5|-24.5|-22|-14.8|-13.8|-13.9|-18|-19.7|-20.3|-20.3|-20.9|-22|-20.8|-19.2|-13.5|-11.3|-7.8|-11.6|-13|-16.2|-16.4|-17.7|-18.1|-19|-17.6|-14.5|-10.1|-6.2|-5.8|-6.7|-10.2|-11.7|-12.7|-13.4|-14.4|-16.1|-16.4|-15.2|-10|-5.8|-3.7|-5.5|-7.2|-9.5|-10.3|-11.5|-12.3|-13.8|-13.5|-11.8|-7.2|-4.6|-3.1|-4|-6|-7.2|-8.2|-8.5|-9.2|-10|-9.6|-7.8|-4.5|-0.7|2.2|2.5|-0.7|-3.9|-6.6|-6.7|-7.6|-7.8|-7.3|-5.1|-1.6|2.2|3|2.1|-2|-4.3|-6.5|-5.1|-5.6|-6.2|-8|-6.4|-3.4|0.7|3.8|3.2|1.5|-2.4|-2.6|-3.5|-1.2|-1.4|-0.3|0|3.5|7|9.8|8.9|7.8|5.6|3.6|2.6|1.8|2.7|2.2|3.3|5|8.9|12.8|15.2|14.5|10.9|7.5|5.1|5.1|5.4|6.7|7.6|9|9.7|12|12.5|12|8.6|6|2.8|2|1.1|3|3.7|7.6|10.2|15|15.9|16.6|15.8|15.2|14.1|12.3|12.1|13|15.7|18.5|21.9|24.5|26.7|26.8|25.3|22.4|20.9|19|18.7|17.1|18|18.6|21.7|23.8|26.7|26|24.5|22|21.5|20.4|19.6|19.1|20.7|24|27.2|30.5|30.7|31.7|29.7|30.1|28.4|29.2|28|29.3|30.2|34.3|37.9|42.7|44.3|43.9|40.9|38.6|36.7|35.3|34.8|35.1|36.1|38.3|40.5|44|44.1|42|37.2|35.1|35.1|35.7|35.4|35.9|38.5|42.6|45.7|48.4|48.3|46.3|42.4|40.3|38.4|38.7|38.1|40.3|41.6|46.2|50|53|51.8|49.6|47.2|47|46.3|46.9|46.6|47.9|50.2|53.9|57.2|58.6|58|54.6|52.1|49.3|49.6|49|49.7|50.5|","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-eabf3c5d","guard":[["hasAny",["1994dec","1994feb","1994jan","1994mar","1995aug","1995feb","1995jun","1996apr","1997apr","1997aug","1998may","1999dec","1999feb","1999oct","2001mar","2002aug","2002dec","2002jan","2002jun","2002nov","2002oct","2004aug","2004dec","2004jan","2004sep","2006aug","2006dec","2006may","2006nov","2006sep","2007aug","2007dec","2007jun","2007nov","2008nov","2009feb","2009sep","2010feb","2010nov","2010oct","2011aug","2011dec","2011feb","2012mar","2012nov","2013apr","2013feb","2013jan","2013jun","2014apr","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016nov","2017apr","2017dec","2017jan","2017nov","2020jun","2020may","element","item number","nth","position"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-96925d84","guard":[["hasAny",["1994dec","1994feb","1994jan","1994mar","1995aug","1995feb","1995jun","1996apr","1997apr","1997aug","1998may","1999dec","1999feb","1999oct","2001mar","2002aug","2002dec","2002jan","2002jun","2002nov","2002oct","2004aug","2004dec","2004jan","2004sep","2006aug","2006dec","2006may","2006nov","2006sep","2007aug","2007dec","2007jun","2007nov","2008nov","2009feb","2009sep","2010feb","2010nov","2010oct","2011aug","2011dec","2011feb","2012mar","2012nov","2013apr","2013feb","2013jan","2013jun","2014apr","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016nov","2017apr","2017dec","2017jan","2017nov","2020jun","2020may","element","item number","lower case","lowercase","nth","position","small letters"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-b836e4f1","guard":[["hasAny",["1994dec","1994feb","1994jan","1994mar","1995aug","1995feb","1995jun","1996apr","1997apr","1997aug","1998may","1999dec","1999feb","1999oct","2001mar","2002aug","2002dec","2002jan","2002jun","2002nov","2002oct","2004aug","2004dec","2004jan","2004sep","2006aug","2006dec","2006may","2006nov","2006sep","2007aug","2007dec","2007jun","2007nov","2008nov","2009feb","2009sep","2010feb","2010nov","2010oct","2011aug","2011dec","2011feb","2012mar","2012nov","2013apr","2013feb","2013jan","2013jun","2014apr","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016nov","2017apr","2017dec","2017jan","2017nov","2020jun","2020may","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-e3ba5f96","guard":[["hasAny",["1994dec","1994feb","1994jan","1994mar","1995aug","1995feb","1995jun","1996apr","1997apr","1997aug","1998may","1999dec","1999feb","1999oct","2001mar","2002aug","2002dec","2002jan","2002jun","2002nov","2002oct","2004aug","2004dec","2004jan","2004sep","2006aug","2006dec","2006may","2006nov","2006sep","2007aug","2007dec","2007jun","2007nov","2008nov","2009feb","2009sep","2010feb","2010nov","2010oct","2011aug","2011dec","2011feb","2012mar","2012nov","2013apr","2013feb","2013jan","2013jun","2014apr","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016nov","2017apr","2017dec","2017jan","2017nov","2020jun","2020may","element","invert case","item number","nth","position","swap case","toggle case"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-ebc0b486","guard":[["hasAny",["1994dec","1994feb","1994jan","1994mar","1995aug","1995feb","1995jun","1996apr","1997apr","1997aug","1998may","1999dec","1999feb","1999oct","2001mar","2002aug","2002dec","2002jan","2002jun","2002nov","2002oct","2004aug","2004dec","2004jan","2004sep","2006aug","2006dec","2006may","2006nov","2006sep","2007aug","2007dec","2007jun","2007nov","2008nov","2009feb","2009sep","2010feb","2010nov","2010oct","2011aug","2011dec","2011feb","2012mar","2012nov","2013apr","2013feb","2013jan","2013jun","2014apr","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016nov","2017apr","2017dec","2017jan","2017nov","2020jun","2020may","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-74baa881","guard":[["hasAny",["1994dec","1994feb","1994jan","1994mar","1995aug","1995feb","1995jun","1996apr","1997apr","1997aug","1998may","1999dec","1999feb","1999oct","2001mar","2002aug","2002dec","2002jan","2002jun","2002nov","2002oct","2004aug","2004dec","2004jan","2004sep","2006aug","2006dec","2006may","2006nov","2006sep","2007aug","2007dec","2007jun","2007nov","2008nov","2009feb","2009sep","2010feb","2010nov","2010oct","2011aug","2011dec","2011feb","2012mar","2012nov","2013apr","2013feb","2013jan","2013jun","2014apr","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016nov","2017apr","2017dec","2017jan","2017nov","2020jun","2020may","element","item number","nth","position"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-8d2e5843","guard":[["hasAny",["1994dec","1994feb","1994jan","1994mar","1995aug","1995feb","1995jun","1996apr","1997apr","1997aug","1998may","1999dec","1999feb","1999oct","2001mar","2002aug","2002dec","2002jan","2002jun","2002nov","2002oct","2004aug","2004dec","2004jan","2004sep","2006aug","2006dec","2006may","2006nov","2006sep","2007aug","2007dec","2007jun","2007nov","2008nov","2009feb","2009sep","2010feb","2010nov","2010oct","2011aug","2011dec","2011feb","2012mar","2012nov","2013apr","2013feb","2013jan","2013jun","2014apr","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016nov","2017apr","2017dec","2017jan","2017nov","2020jun","2020may","element","item number","nth","position"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-4795cc7c","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","negate","negative","nth","opposite","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.neg",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-6885e13e","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-08a3886a","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2006}]],"mem":null},
{"id":"n-2aa66071","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2010}]],"mem":null},
{"id":"n-53bbfa05","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":100}]],"mem":null},
{"id":"n-53d5d236","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.first"]]],"mem":null},
{"id":"n-7ff81343","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":1000}]],"mem":null},
{"id":"n-860ae996","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":1994}]],"mem":null},
{"id":"n-88620271","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":1998}]],"mem":null},
{"id":"n-9a364265","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2014}]],"mem":null},
{"id":"n-c26623bf","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2002}]],"mem":null},
{"id":"n-cc7a6ce5","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2017}]],"mem":null},
{"id":"n-d13f2ebf","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2013}]],"mem":null},
{"id":"n-fca7920c","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2007}]],"mem":null},
{"id":"n-fe34e4a3","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2010oct","2011aug","2011dec","2011feb","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":1997}]],"mem":null},
{"id":"n-5f78ab21","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2009feb","2009sep","2010feb","2010nov","2010oct","2011aug","2011dec","2011feb","2012mar","2012nov","2013apr","2013feb","2013jan","2013jun","2014apr","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016nov","2017apr","2017dec","2017jan","2017nov","2020jun","2020may","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-768202e7","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2009feb","2009sep","2010feb","2010nov","2010oct","2011aug","2011dec","2011feb","2012mar","2012nov","2013apr","2013feb","2013jan","2013jun","2014apr","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016nov","2017apr","2017dec","2017jan","2017nov","2020jun","2020may","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-0bddb243","guard":[["has","gmsl"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the gmsl smoothed of 2015-Feb":"The gmsl smoothed of 2015-Feb is 30.1.","the gmsl smoothed of 2010-Feb":"The gmsl smoothed of 2010-Feb is 7.5.","the gmsl smoothed of 2014-Jun":"The gmsl smoothed of 2014-Jun is 19.1.","the gmsl smoothed of 2012-Mar":"The gmsl smoothed of 2012-Mar is 14.1.","the gmsl smoothed of 2010-Oct":"The gmsl smoothed of 2010-Oct is 12.","the gmsl smoothed of 2013-Jun":"The gmsl smoothed of 2013-Jun is 17.1.","the gmsl smoothed of 2009-Feb":"The gmsl smoothed of 2009-Feb is 3.6.","the gmsl smoothed of 2002-Jun":"The gmsl smoothed of 2002-Jun is -17.6.","the gmsl smoothed of 2011-Feb":"The gmsl smoothed of 2011-Feb is 6.","the gmsl smoothed of 2009-Sep":"The gmsl smoothed of 2009-Sep is 8.9.","the gmsl smoothed of 1994-Feb":"The gmsl smoothed of 1994-Feb is -44.6.","the gmsl smoothed of 2012-Nov":"The gmsl smoothed of 2012-Nov is 26.7.","the gmsl smoothed of 1998-May":"The gmsl smoothed of 1998-May is -28.9.","the gmsl smoothed of 2004-Sep":"The gmsl smoothed of 2004-Sep is -4.6.","the gmsl smoothed of 1994-Jan":"The gmsl smoothed of 1994-Jan is -44.6.","the gmsl smoothed of 2007-Feb":"The gmsl smoothed of 2007-Feb is -6.5.","the gmsl smoothed of 2006-May":"The gmsl smoothed of 2006-May is -7.8.","the gmsl smoothed of 2011-Aug":"The gmsl smoothed of 2011-Aug is 7.6.","the gmsl smoothed of 2020-Jun":"The gmsl smoothed of 2020-Jun is 50.5.","the gmsl smoothed of 2004-Jan":"The gmsl smoothed of 2004-Jan is -9.5.","the gmsl smoothed of 2001-Mar":"The gmsl smoothed of 2001-Mar is -20.3.","the gmsl smoothed of 2006-Sep":"The gmsl smoothed of 2006-Sep is 2.2.","the gmsl smoothed of 1997-Aug":"The gmsl smoothed of 1997-Aug is -24.","the gmsl smoothed of 1995-Jun":"The gmsl smoothed of 1995-Jun is -47.4.","the gmsl smoothed of 2017-Nov":"The gmsl smoothed of 2017-Nov is 48.3.","the gmsl smoothed of 1999-Oct":"The gmsl smoothed of 1999-Oct is -18.3.","the gmsl smoothed of 2017-Dec":"The gmsl smoothed of 2017-Dec is 46.3.","the gmsl smoothed of 2008-Nov":"The gmsl smoothed of 2008-Nov is 8.9.","the gmsl smoothed of 2002-Nov":"The gmsl smoothed of 2002-Nov is -6.7.","the gmsl smoothed of 2006-Nov":"The gmsl smoothed of 2006-Nov is 2.1.","the gmsl smoothed of 2014-Nov":"The gmsl smoothed of 2014-Nov is 30.7.","the gmsl smoothed of 2007-Aug":"The gmsl smoothed of 2007-Aug is -3.4.","the gmsl smoothed of 2013-Feb":"The gmsl smoothed of 2013-Feb is 22.4."}}},
{"id":"n-1e54e39a","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","element","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-409b43a7","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.upper",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-4d0b7536","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","class name","element","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-71f77071","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","element","invert case","item number","nth","position","swap case","toggle case"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-aef3f5ac","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","element","item number","no vowels","nth","position","remove vowels","without vowels"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.noVowels",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-cc56452a","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-d65c059d","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","element","invert case","item number","nth","position","swap case","toggle case"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-de39b561","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","element","item number","lower case","lowercase","nth","position","small letters"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.lower",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-1fa60bef","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","element","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-9472eeba","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","element","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-aff3a6c4","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","each word","element","item number","nth","position","split into words","words"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-ce60b06a","guard":[["hasAny",["1993sep","1997feb","1997jan","1997jul","1998apr","1998jan","1998jun","1998nov","1999jan","2000jul","2000sep","2001jan","2001may","2005dec","2006jun","2007apr","2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","each word","element","item number","nth","position","split into words","words"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-43b63873","guard":[["hasAny",["2010oct","2011dec","2012apr","2012feb","2012mar","2012nov","2013apr","2013dec","2013feb","2013jan","2013jun","2014apr","2014jan","2014jul","2014jun","2014nov","2015aug","2015feb","2015jun","2016dec","2016feb","2016nov","2017apr","2017aug","2017dec","2017jan","2017nov","2017sep","2018jan","2020jun","2020may","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",["sense.howMany"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-2b11df3d","guard":[["hasAny",["2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-d0fb9092","guard":[["hasAny",["2008oct","2008sep","2009mar","2010apr","2010mar","2012apr","2012feb","2013dec","2014dec","2014jan","2016dec","2016feb","2017aug","2017mar","2017sep","2018jan","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-6dc7f4dd","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2011aug","2011feb","element","first letters of the name","initials","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-0c239f00","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2011aug","2011feb","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":12}]],"mem":null},
{"id":"n-e3e8eb27","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2008nov","2008oct","2008sep","2009feb","2009mar","2009sep","2010apr","2010feb","2010mar","2011aug","2011feb","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":10}]],"mem":null},
{"id":"n-61b08785","guard":[["hasAny",["1997feb","1998jan","2001may","2004dec","2006dec","2007jun","2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","element","item number","nearest whole number","nth","position","round","rounded"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-8764bb0c","guard":[["hasAny",["1997feb","1998jan","2001may","2004dec","2006dec","2007jun","2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","element","floor","item number","nth","position","round down"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-8c4c3a54","guard":[["hasAny",["1997feb","1998jan","2001may","2004dec","2006dec","2007jun","2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","ceil","ceiling","element","item number","nth","position","round up"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-503600d1","guard":[["hasAny",["1997feb","1998jan","2001may","2004dec","2006dec","2007jun","2008sep","2010oct","2011feb","2013apr","2013dec","alphabetize the letters","element","item number","letters in order","nth","position","sort the letters"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-aa2cff10","guard":[["hasAny",["2004sep","2005dec","2006aug","2006dec","2006nov","2006sep","2007aug","2007dec","2007nov","2009feb","2009mar","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"]]],"mem":null},
{"id":"n-b8d4bee0","guard":[["hasAny",["2004sep","2005dec","2006aug","2006dec","2006nov","2006sep","2007aug","2007dec","2007nov","2009feb","2009mar","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"]]],"mem":null},
{"id":"n-a1b3fbcb","guard":[["hasAny",["2016dec","2016nov","2017aug","2017dec","2017nov","2017sep","2018jan","2020jun","2020may","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-db900909","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2009feb","2009mar","2010apr","2010mar","2011feb","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-0508823c","guard":[["hasAny",["1997feb","1998jan","1998jun","2001may","2008sep","2013dec","2016dec","element","item number","nearest whole number","nth","position","round","rounded"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-19cc5022","guard":[["hasAny",["1997feb","1998jan","1998jun","2001may","2008sep","2013dec","2016dec","element","floor","item number","nth","position","round down"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-2b4a3866","guard":[["hasAny",["1997feb","1998jan","1998jun","2001may","2008sep","2013dec","2016dec","element","floor","item number","nth","position","round down"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-a794c1d1","guard":[["hasAny",["1997feb","1998jan","1998jun","2001may","2008sep","2013dec","2016dec","ceil","ceiling","element","item number","nth","position","round up"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-eb160f51","guard":[["hasAny",["1997feb","1998jan","1998jun","2001may","2008sep","2013dec","2016dec","ceil","ceiling","element","item number","nth","position","round up"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-f2025780","guard":[["hasAny",["1997feb","1998jan","1998jun","2001may","2008sep","2013dec","2016dec","element","item number","nearest whole number","nth","position","round","rounded"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-1c4b7fcf","guard":[["hasAny",["1997aug","2004dec","2006dec","2007jun","2010oct","2011feb","2013apr","element","item number","nearest whole number","nth","position","round","rounded"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-2cb4f0c0","guard":[["hasAny",["1997aug","2004dec","2006dec","2007jun","2010oct","2011feb","2013apr","element","floor","item number","nth","position","round down"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-31816a67","guard":[["hasAny",["1997aug","2004dec","2006dec","2007jun","2010oct","2011feb","2013apr","element","floor","item number","nth","position","round down"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-6ca70114","guard":[["hasAny",["1997aug","2004dec","2006dec","2007jun","2010oct","2011feb","2013apr","element","item number","nearest whole number","nth","position","round","rounded"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-70aca9d1","guard":[["hasAny",["1997aug","2004dec","2006dec","2007jun","2010oct","2011feb","2013apr","ceil","ceiling","element","item number","nth","position","round up"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-f90a6a02","guard":[["hasAny",["1997aug","2004dec","2006dec","2007jun","2010oct","2011feb","2013apr","ceil","ceiling","element","item number","nth","position","round up"]],["nums==",1],["has","smoothed"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-3a999561","guard":[["hasAny",["2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","each word","element","item number","nth","position","split into words","words"]],["nums==",1],["has","smoothed"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-40dfc5da","guard":[["hasAny",["2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","each word","element","item number","nth","position","split into words","words"]],["nums==",1],["has","smoothed"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-9016fe90","guard":[["hasAny",["2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","camel case","camelcase","element","item number","lower camel case","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-94ba7ad4","guard":[["hasAny",["2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","slug"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-99e5bb32","guard":[["hasAny",["2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","each word","element","item number","nth","position","split into words","words"]],["nums==",1],["has","smoothed"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-9a107f87","guard":[["hasAny",["2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","element","item number","nth","position","snake case","snakecase","underscores","variable name"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-6b6955c2","guard":[["hasAny",["2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","each word","element","item number","longest","longest one","longest word","nth","position","split into words","words"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-6d1ab0fe","guard":[["hasAny",["2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-b9692fb6","guard":[["hasAny",["2001may","2004dec","2006dec","2007jun","2008sep","2011feb","digits backwards","digits reversed","element","item number","nth","position","reverse the digits"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.reverseDigits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-307b5ba7","guard":[["not",["hasAny",["2010dec","2012jun","2018oct","add","compare","greater","larger","lesser","makes","monthly","smaller","sum","uncertainty"]]]],"pyramid":["render.number",["compute.choose",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"]]],"mem":null},
{"id":"n-3b5fe5e7","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2009feb","2009mar","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-60b62f17","guard":[["hasAny",["2005dec","2006aug","2006dec","2006nov","2006sep","2007dec","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2}]],"mem":null},
{"id":"n-7c49e259","guard":[["hasAny",["2006nov","2006sep","2007dec","2007nov","2009feb","2009mar","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":4}]],"mem":null},
{"id":"n-b2e8d6d5","guard":[["hasAny",["2008sep","2010oct","2011feb","2013apr","2013dec","2016dec","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.gcd",{"lit":0},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-ecf13b49","guard":[["hasAny",["2005dec","2006aug","2006dec","2006nov","2006sep","2007dec","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2}]],"mem":null},
{"id":"n-e421a68e","guard":[["hasAny",["2005dec","2006aug","2006dec","2006nov","2006sep","2007dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"],{"lit":2}]],"mem":null},
{"id":"n-216bfeec","guard":[["hasAny",["2005dec","2006aug","2006dec","2006nov","2006sep","2007dec","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-37affbc4","guard":[["hasAny",["2005dec","2006aug","2006dec","2006nov","2006sep","2007dec","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-77f28cdf","guard":[["hasAny",["2005dec","2006aug","2006dec","2006nov","2007dec","2009mar","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-bb21de22","guard":[["hasAny",["2005dec","2006aug","2006dec","2006nov","2007dec","2009mar","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-eef4dded","guard":[["hasAny",["2004dec","2006dec","2007jun","2008sep","2011feb","element","from base","from binary","from hex","in decimal","item number","nth","position","to decimal"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}],{"lit":12}]],"mem":null},
{"id":"n-74095706","guard":[["hasAny",["2008sep","2011feb","2013apr","2013dec","2016dec","element","factorise","factorize","item number","lcm of all","least common multiple of the list","nth","position","prime factorisation","prime factorization","prime factors"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.lcmAll",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-bdff7417","guard":[["hasAny",["2004dec","2006dec","2007jun","2008sep","2011feb","convert to base","element","in base","in binary","in octal","item number","nth","position","to binary","to hex"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["compute.toBase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":12}]],"mem":null},
{"id":"n-44b783f9","guard":[["hasAny",["2010oct","2011dec","2015feb","2015jun","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":10}]],"mem":null},
{"id":"n-a18627dc","guard":[["hasAny",["2006nov","2006sep","2007dec","2009mar","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-cb628abd","guard":[["hasAny",["2010oct","2011feb","2013dec","2016dec","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.lcm",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-8699af9f","guard":[["hasAny",["2006sep","2008sep","2011feb","backwards","element","item number","mirror","nth","position","reverse","reversed","spell backwards"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-01f449bd","guard":[["hasAny",["2001may","2007jun","2016dec","ceil","ceiling","element","item number","nth","position","round up"]],["nums==",1]],"pyramid":["render.number",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-e52da0b1","guard":[["hasAny",["2004dec","2006dec","2011feb","element","from base","from binary","from hex","in decimal","item number","nth","position","to decimal"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}],["sense.wordCount"]]],"mem":null},
{"id":"n-308bbabd","guard":[["hasAny",["2004dec","2006dec","2011feb","convert to base","element","in base","in binary","in octal","item number","nth","position","to binary","to hex"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["compute.toBase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-34ba4c76","guard":[["hasAny",["2005dec","2006aug","2007dec","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-5150a520","guard":[["hasAny",["2005dec","2006aug","2007dec","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-820f0e18","guard":[["hasAny",["2010oct","2011feb","2016dec","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.lcm",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-be9438aa","guard":[["hasAny",["2000feb","2007apr","2016nov","difference","element","item number","less","minus","nth","position","subtract","take away"]],["nums==",1],["has","smoothed"],["not",["has","is"]]],"pyramid":["render.number",["transform.sub",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3}]],"mem":null},
{"id":"n-f3af2171","guard":[["hasAny",["2001jan","2008oct","2013feb","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3}]],"mem":null},
{"id":"n-f3b77018","guard":[["hasAny",["2010oct","2011feb","2016dec","before","element","item number","nth","one less","position","predecessor","previous","sum of divisors","sum of factors","sum of the divisors"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.divisorSum",["transform.prev",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-fdf450c5","guard":[["hasAny",["2009sep","2017jan","2020jun","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-78e22c57","guard":[["hasAny",["2010oct","2011dec","2015jun","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":5},{"lit":2}]],"mem":null},
{"id":"n-9ce72f01","guard":[["hasAny",["2005dec","2006aug","2007dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"],{"lit":3}]],"mem":null},
{"id":"n-54bf9cc7","guard":[["hasAny",["2010apr","2010mar","2011feb","population standard deviation","standard deviation","stdev"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.stdev",["iterate.multiples",{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-7b619137","guard":[["hasAny",["2010apr","2010mar","2011feb","population standard deviation","standard deviation","std dev","stdev"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.stdev",["iterate.multiples",{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-1499eb6c","guard":[["hasAny",["2010apr","2010mar","diagonal","element","how many vowels","hypotenuse","item number","nth","number of vowels","position","pythagoras","pythagorean","vowel count"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",{"lit":5},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-e2d69c53","guard":[["hasAny",["2010apr","2010mar","consonant count","element","how many consonants","increase by","item number","markup","nth","number of consonants","plus tax","position","raise by","with tax"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.increase",{"lit":5},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-2e60f016","guard":[["hasAny",["2008sep","2011feb","characters","each letter","element","item number","letters","nth","position","spell","spell out"]],["nums==",1],["has","smoothed"]],"pyramid":["render.and",["transform.letters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-81ce918a","guard":[["hasAny",["2008sep","2011feb","abbreviate","abbreviation","acronym","element","item number","nth","position","short form"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["transform.acronym",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-f70548be","guard":[["hasAny",["2008sep","2011feb","characters","each letter","element","item number","letters","nth","position","spell","spell out"]],["nums==",1],["has","smoothed"]],"pyramid":["render.lines",["transform.letters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-febdc72e","guard":[["hasAny",["2008sep","2011feb","characters","each letter","element","item number","letters","nth","position","spell","spell out"]],["nums==",1],["has","smoothed"]],"pyramid":["render.list",["transform.letters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-2bcec516","guard":[["hasAny",["2008sep","2011feb","add the digits","digit sum","element","item number","nth","position","sum of the digits"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.digitSum",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-7bc44c0c","guard":[["hasAny",["2008sep","2011feb","element","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.listNums",["iterate.digits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-ced8c7f7","guard":[["hasAny",["2008sep","2011feb","character at","element","item number","letter at","nth","nth letter","position","which letter"]],["nums==",1],["has","smoothed"]],"pyramid":["render.str",["transform.charAt",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}],["sense.howMany"]]],"mem":null},
{"id":"n-dae037cc","guard":[["hasAny",["2008sep","2013apr","element","factorise","factorize","item number","nth","position","prime factorisation","prime factorization","prime factors"]],["nums==",1],["has","smoothed"]],"pyramid":["render.listNums",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-f5fa639d","guard":[["hasAny",["2007jun","2016dec","element","item number","nearest whole number","nth","position","round","rounded"]],["nums==",1]],"pyramid":["render.number",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-08151027","guard":[["hasAny",["2010oct","2011feb","element","item number","nearest whole number","nth","position","round","rounded","sum of divisors","sum of factors","sum of the divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-0c8d447f","guard":[["hasAny",["2008sep","2013apr","appears most often","element","factorise","factorize","item number","mode","most common","most frequent","nth","position","prime factorisation","prime factorization","prime factors"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.mode",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-10de7ae8","guard":[["hasAny",["2008sep","2013apr","biggest","element","factorise","factorize","greatest","highest","item number","largest","max","maximum","nth","position","prime factorisation","prime factorization","prime factors"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.max",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-11ae0f58","guard":[["hasAny",["2010mar","2016feb","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2}]],"mem":null},
{"id":"n-12417ebd","guard":[["hasAny",["2008sep","2013apr","element","factorise","factorize","item number","least","lowest","min","minimum","nth","position","prime factorisation","prime factorization","prime factors","smallest"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.min",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-21e9c807","guard":[["hasAny",["2008sep","2011feb","element","item number","least","lowest","min","minimum","nth","position","smallest"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.min",["iterate.digits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-24a3d291","guard":[["hasAny",["2010oct","2020jun","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["nums==",1]],"pyramid":["render.number",["compute.hypot",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-271628a9","guard":[["hasAny",["2008sep","2011feb","as text","as words","element","item number","nth","position","written out"]],["nums==",1],["has","smoothed"]],"pyramid":["render.and",["transform.asText",["iterate.digits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-2e7d9bcb","guard":[["hasAny",["2008sep","2013apr","element","factorise","factorize","item number","median","middle number","middle value","nth","position","prime factorisation","prime factorization","prime factors"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.median",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-38333633","guard":[["hasAny",["2008sep","2011feb","add the digits","digit sum","element","floor","item number","nth","position","round down","sum of the digits"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.digitSum",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-3acd2e83","guard":[["hasAny",["2010oct","2011feb","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.gcd",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-49fb4a2f","guard":[["hasAny",["2006sep","2013dec","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","smoothed"],["not",["has","compare"]]],"pyramid":["render.number",["transform.mod",{"lit":2007},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-51ce20ed","guard":[["hasAny",["2010oct","2011feb","ceil","ceiling","element","item number","nth","position","round up","sum of divisors","sum of factors","sum of the divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-5345f816","guard":[["hasAny",["2008sep","2013apr","biggest","element","greatest","highest","item number","largest","max","maximum","nth","position","prime numbers less than","primes below","primes under","primes up to"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.max",["compute.primesUpTo",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-5d98852a","guard":[["hasAny",["2008sep","2013apr","arithmetic mean","average","avg","element","factorise","factorize","item number","mean","nth","position","prime factorisation","prime factorization","prime factors"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.mean",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-5e18cf5d","guard":[["hasAny",["2006sep","2013dec","element","item number","left over","mod","modulo","nth","position","remainder"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.mod",{"lit":2007},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-61513aff","guard":[["hasAny",["2008sep","2013apr","element","factorise","factorize","gcd of all","greatest common divisor of the list","item number","nth","position","prime factorisation","prime factorization","prime factors"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.gcdAll",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-655ed49d","guard":[["hasAny",["2001jan","2013apr","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-6bf6cca0","guard":[["hasAny",["2006sep","2009mar","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","smoothed"],["has","of"]],"pyramid":["render.number",["transform.mod",{"lit":2002},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-75c25d7b","guard":[["hasAny",["2008sep","2011feb","element","item number","lcm of all","least common multiple of the list","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.lcmAll",["iterate.digits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-7862abf1","guard":[["hasAny",["2000jul","2014jan","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-8537e4fe","guard":[["hasAny",["2008sep","2013apr","all divisors","all factors","divisors","element","factors","item number","multiplied together","multiply them all","nth","position","product"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.product",["compute.divisors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-85f52810","guard":[["hasAny",["2008sep","2013apr","as text","as words","element","factorise","factorize","item number","nth","position","prime factorisation","prime factorization","prime factors","written out"]],["nums==",1],["has","smoothed"]],"pyramid":["render.and",["transform.asText",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-8f00913c","guard":[["hasAny",["2008sep","2011feb","biggest","element","greatest","highest","item number","largest","max","maximum","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.max",["iterate.digits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-97b022ab","guard":[["hasAny",["2008sep","2011feb","appears most often","element","item number","mode","most common","most frequent","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.mode",["iterate.digits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-9bcfb4a7","guard":[["hasAny",["2008sep","2011feb","add the digits","ceil","ceiling","digit sum","element","item number","nth","position","round up","sum of the digits"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.digitSum",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-9ed12b7e","guard":[["hasAny",["2008sep","2013apr","add up","altogether","combined","element","factorise","factorize","in all","item number","nth","position","prime factorisation","prime factorization","prime factors","total"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.sum",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-a4cb741b","guard":[["hasAny",["2008sep","2011feb","add the digits","digit sum","element","item number","nth","position","sum of the digits"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.digitSum",["aggregate.digitSum",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-b2d0b696","guard":[["hasAny",["1996apr","2013apr","difference","element","item number","less","minus","nth","position","subtract","take away"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.sub",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2}]],"mem":null},
{"id":"n-b4a34e2f","guard":[["hasAny",["2008sep","2011feb","element","gcd of all","greatest common divisor of the list","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.gcdAll",["iterate.digits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-b5c85e2d","guard":[["hasAny",["2008sep","2011feb","arithmetic mean","average","avg","element","item number","mean","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.mean",["iterate.digits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-cc0948fd","guard":[["hasAny",["2008sep","2013dec","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.gcd",{"lit":2002},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-cc35fb20","guard":[["hasAny",["2008sep","2011feb","element","item number","multiplied together","multiply them all","nth","position","product"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.product",["iterate.digits",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-cccaa282","guard":[["hasAny",["2010mar","2017aug","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","give"]],"pyramid":["render.number",["compute.hypot",["sense.howMany"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-dc0ec0da","guard":[["hasAny",["2002dec","2012apr","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2}]],"mem":null},
{"id":"n-f185b2af","guard":[["hasAny",["2008sep","2011feb","add the digits","digit sum","element","item number","nearest whole number","nth","position","round","rounded","sum of the digits"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.digitSum",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-ff1b7685","guard":[["hasAny",["1995aug","1999feb","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","tell"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-073e3e38","guard":[["hasAny",["1997jul","2010oct","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["not",["has","me"]]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"],{"lit":10}]],"mem":null},
{"id":"n-180ce9ed","guard":[["hasAny",["2010mar","2016feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"],{"lit":2}]],"mem":null},
{"id":"n-43bed18e","guard":[["hasAny",["2010apr","2010mar","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":5}]],"mem":null},
{"id":"n-8099e1f6","guard":[["hasAny",["2008sep","2011feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":4}]],"mem":null},
{"id":"n-81d9cb08","guard":[["hasAny",["2007aug","2009sep","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"],["has","smoothed"],["not",["has","2005jul"]]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"],{"lit":12}]],"mem":null},
{"id":"n-8356318c","guard":[["hasAny",["1997jul","2010oct","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["not",["has","me"]]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2},{"lit":5}]],"mem":null},
{"id":"n-933bc168","guard":[["hasAny",["2010apr","2010mar","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-9404a57a","guard":[["hasAny",["2007aug","2009sep","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"],["has","smoothed"],["not",["has","2005jul"]]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3},{"lit":4}]],"mem":null},
{"id":"n-f40af528","guard":[["hasAny",["2007aug","2009sep","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"],["has","smoothed"],["not",["has","2005jul"]]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":4},{"lit":3}]],"mem":null},
{"id":"n-fa8ebff2","guard":[["hasAny",["1996apr","2010apr","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"],{"lit":5}]],"mem":null},
{"id":"n-30d0d83d","guard":[["hasAny",["2006sep","2011feb","backwards","element","item number","mirror","nth","position","reverse","reversed","spell backwards"]],["nums==",1],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-3b4bea0f","guard":[["hasAny",["2006nov","2009mar","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-774d944f","guard":[["hasAny",["2006may","2010apr","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-d8889fe1","guard":[["hasAny",["2006may","2010apr","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-0f318ddd","guard":[["hasAny",["2008sep","2010oct","fib","one less","predecessor","previous"]],["nums==",1]],"pyramid":["render.number",["transform.prev",["compute.fibonacci",["sense.wordCount"]]]],"mem":null},
{"id":"n-13aa1271","guard":[["hasAny",["2008sep","2010oct","before","fib","one less","predecessor","previous"]],["nums==",1]],"pyramid":["render.number",["transform.prev",["compute.fibonacci",["sense.wordCount"]]]],"mem":null},
{"id":"n-2b4ddea6","guard":[["hasAny",["2004dec","2011feb","take away"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.sub",["sense.howMany"],["sense.wordCount"]]],"mem":null},
{"id":"n-349ee900","guard":[["hasAny",["2004dec","2011feb","difference","take away"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.sub",["sense.howMany"],["sense.wordCount"]]],"mem":null},
{"id":"n-3feaf0df","guard":[["hasAny",["2004dec","2010oct","difference","take away"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["transform.sub",{"lit":1998},["sense.first"]]],"mem":null},
{"id":"n-d047c923","guard":[["hasAny",["2007jun","2008sep","how many words","negate","negative","number of words","opposite","word count"]],["nums==",1]],"pyramid":["render.number",["transform.neg",["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-099c7b73","guard":[["hasAny",["2008sep","2011aug","circumference","log base","logarithm","perimeter of a circle"]],["has","smoothed"],["has","of"]],"pyramid":["render.number",["compute.circumference",["compute.log",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-0ff52956","guard":[["hasAny",["2008sep","2010oct","add the digits","as a percentage","digit sum","percent is","sum of the digits","what percent","what percentage"]],["nums==",1]],"pyramid":["render.number",["aggregate.digitSum",["compute.asPercent",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-1d972277","guard":[["hasAny",["2008nov","2009sep","ascii","ascii codes","character codes","code points","population standard deviation","standard deviation","stdev","unicode values"]],["has","what"]],"pyramid":["render.number",["aggregate.stdev",["transform.charCodes",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-2a2decc5","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],["sense.first"]]],"mem":null},
{"id":"n-34460694","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":2010}]],"mem":null},
{"id":"n-46c8e9ab","guard":[["hasAny",["2010apr","2010mar","log base","logarithm","root of","sqrt","square root"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.log",{"lit":100},["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-52c4d762","guard":[["hasAny",["2008nov","2009sep","after years at","compound interest","compounded","grows to"]],["has","what"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":5},{"lit":5}]],"mem":null},
{"id":"n-560b1f60","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":2007}]],"mem":null},
{"id":"n-5a37a5e6","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":1997}]],"mem":null},
{"id":"n-5b28dc05","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":1998}]],"mem":null},
{"id":"n-5c898b42","guard":[["hasAny",["2008nov","2009sep","after a discount","how many letters","letter count","number of letters","reduced by","sale price"]],["has","what"]],"pyramid":["render.number",["compute.discount",{"lit":12},["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-5e2c5220","guard":[["hasAny",["2008nov","2009sep","as a percentage","percent is","root of","sqrt","square root","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.sqrt",["sense.first"]]]],"mem":null},
{"id":"n-603c45e1","guard":[["hasAny",["2008nov","2009sep","cubed","increase by","markup","plus tax","raise by","to the third power","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",{"lit":2},["transform.cube",["sense.wordCount"]]]],"mem":null},
{"id":"n-6ae03d35","guard":[["hasAny",["2008nov","2009sep","ascii","ascii codes","character codes","code points","population standard deviation","standard deviation","stdev","unicode values"]],["has","what"]],"pyramid":["render.number",["aggregate.stdev",["transform.charCodes",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-7d585a61","guard":[["hasAny",["2006sep","2009mar","divisor count","how many factors","log","log base","logarithm","number of divisors"]],["has","smoothed"],["has","of"]],"pyramid":["render.number",["compute.log",{"lit":100},["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-811a6796","guard":[["hasAny",["2008nov","2009sep","how many vowels","hypotenuse","number of vowels","pythagoras","pythagorean","vowel count"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":4},["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-8c9c8bee","guard":[["hasAny",["2008sep","2011feb","caesar cipher","how many vowels","number of vowels","rotate the letters","shift by","shift each letter","vowel count"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.vowels",["transform.caesar",["sense.text"],{"lit":2}]]],"mem":null},
{"id":"n-8d841122","guard":[["hasAny",["2008sep","2011feb","how many numbers","number of values"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["aggregate.count",["iterate.rangeFrom",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-8f84c5f1","guard":[["hasAny",["2008sep","2010oct","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","sum of divisors","sum of factors","sum of the divisors"]],["nums==",1]],"pyramid":["render.number",["compute.divisorSum",["compute.gcd",["sense.first"],{"lit":12}]]],"mem":null},
{"id":"n-92ec06a7","guard":[["hasAny",["2007nov","2009mar","population standard deviation","standard deviation","std dev","stdev"]],["has","smoothed"],["has","of"]],"pyramid":["render.number",["aggregate.stdev",["iterate.rangeFrom",["sense.first"],{"lit":2017}]]],"mem":null},
{"id":"n-93d2bc97","guard":[["hasAny",["2010apr","2010mar","after years at","compound interest","compounded","grows to"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":4},{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-958ada14","guard":[["hasAny",["2008nov","2009sep","after a discount","next prime","reduced by","sale price","smallest prime greater than","the prime after"]],["has","what"]],"pyramid":["render.number",["compute.discount",{"lit":10},["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-97360c11","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":2014}]],"mem":null},
{"id":"n-9b50270f","guard":[["hasAny",["2010apr","2010mar","hypotenuse","one less","predecessor","previous","pythagoras","pythagorean"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",["sense.howMany"],["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-9e3ded1d","guard":[["hasAny",["2008sep","2010oct","add the digits","area of a triangle","digit sum","half base times height","sum of the digits","triangle area"]],["has","of"]],"pyramid":["render.number",["aggregate.digitSum",["compute.triangleArea",["sense.first"],{"lit":5}]]],"mem":null},
{"id":"n-a25d7de5","guard":[["hasAny",["2007nov","2009mar","population standard deviation","standard deviation","stdev"]],["has","smoothed"],["has","of"]],"pyramid":["render.number",["aggregate.stdev",["iterate.rangeFrom",["sense.first"],{"lit":2017}]]],"mem":null},
{"id":"n-abed2011","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":2017}]],"mem":null},
{"id":"n-b4676f61","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":2002}]],"mem":null},
{"id":"n-b6c8f7a6","guard":[["hasAny",["2008nov","2009sep","after years at","compound interest","compounded","grows to"]],["has","what"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":2},{"lit":12}]],"mem":null},
{"id":"n-c5a1c6ec","guard":[["hasAny",["2012feb","2013jun","after a discount","consonant count","how many consonants","number of consonants","reduced by","sale price"]],["nums==",1]],"pyramid":["render.number",["compute.discount",["aggregate.consonants",["sense.text"]],{"lit":5}]],"mem":null},
{"id":"n-c9bbfb00","guard":[["hasAny",["2008nov","2009sep","log","log base","logarithm","nth prime","the prime number in position"]],["has","what"]],"pyramid":["render.number",["compute.log",["compute.nthPrime",["sense.first"]],{"lit":3}]],"mem":null},
{"id":"n-dc6e55f3","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":1994}]],"mem":null},
{"id":"n-e6334189","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":2006}]],"mem":null},
{"id":"n-e79898ac","guard":[["hasAny",["2008sep","2010oct","left over","mod","modulo","remainder","sum of divisors","sum of factors","sum of the divisors"]],["nums==",1]],"pyramid":["render.number",["compute.divisorSum",["transform.mod",["sense.first"],{"lit":12}]]],"mem":null},
{"id":"n-e82ff0f4","guard":[["hasAny",["2008nov","2009sep","hypotenuse","pythagoras","pythagorean","sum of divisors","sum of factors","sum of the divisors"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":4},["compute.divisorSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-f1dae80d","guard":[["hasAny",["2010apr","2010mar","as a percentage","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.first"]],{"lit":2013}]],"mem":null},
{"id":"n-f661ae6c","guard":[["hasAny",["2008sep","2010oct","binomial coefficient","choose","combinations","digit count","how many digits","n choose k","number of digits","ways to choose"]],["nums==",1]],"pyramid":["render.number",["aggregate.digitCount",["compute.choose",["sense.first"],{"lit":2006}]]],"mem":null},
{"id":"n-f6d0ea0b","guard":[["hasAny",["2008nov","2009sep","how many words","hypotenuse","number of words","pythagoras","pythagorean","word count"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":4},["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-f8788e3e","guard":[["hasAny",["2010apr","2010mar","character count","how many characters","log base","logarithm","number of characters"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.log",["aggregate.chars",["sense.text"]],{"lit":2}]],"mem":null},
{"id":"n-0d471218","guard":[["hasAny",["2010apr","2010mar"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 5.1."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-a740d35d","guard":[["hasAny",["2000jul","2014jan"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -24.5."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-1e7a233a","guard":[["hasAny",["2004dec","2011feb","element","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -6."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-881e29d9","guard":[["hasAny",["1997apr","2017apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -35.7."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-a671bf4d","guard":[["hasAny",["2008nov","2009sep","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 8.9."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-ec6b6bed","guard":[["hasAny",["1994feb","1994jan","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -44.6."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-1c877f53","guard":[["hasAny",["2008sep","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"smoothed"}]],"mem":null},
{"id":"n-1e9d90b9","guard":[["hasAny",["2008sep","consonant count","element","how many consonants","item number","nth","number of consonants","position"]],["has","give"]],"pyramid":["render.number",["aggregate.consonants",["transform.base64",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-63f1cef6","guard":[["hasAny",["2013jan","ascii","ascii codes","character codes","code points","element","item number","nth","position","sample standard deviation","sample stdev","unicode values"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["aggregate.sampleStdev",["transform.charCodes",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-67a64e16","guard":[["hasAny",["2006dec","consonant count","element","how many consonants","item number","negate","negative","nth","number of consonants","opposite","position"]],["has","tell"]],"pyramid":["render.number",["transform.neg",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-8d09370c","guard":[["hasAny",["2008sep","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"8.9"}]],"mem":null},
{"id":"n-8e45fbf8","guard":[["hasAny",["2013dec","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["sense.text"]]],"mem":null},
{"id":"n-e4693085","guard":[["hasAny",["2008sep","character count","element","how many characters","item number","length","no vowels","nth","number of characters","position","remove vowels","without vowels"]],["has","give"]],"pyramid":["render.number",["aggregate.chars",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-0bfdb2c3","guard":[["hasAny",["2009feb","consonant count","element","how many consonants","item number","log","log base","logarithm","nth","number of consonants","position"]],["has","what"]],"pyramid":["render.number",["compute.log",{"lit":12},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-0fe4b325","guard":[["hasAny",["2010oct","diagonal","element","how many vowels","hypotenuse","item number","nth","number of vowels","position","pythagoras","pythagorean","vowel count"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":12},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-151a060f","guard":[["hasAny",["2008sep","at which position","element","index of","item number","most common letter","most frequent letter","nth","position","position of","which letter appears most"]],["has","give"]],"pyramid":["render.number",["aggregate.indexOf",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["aggregate.commonLetter",["sense.text"]]]],"mem":null},
{"id":"n-25def6ee","guard":[["hasAny",["2013apr","after a discount","discount","element","how many vowels","item number","nth","number of vowels","off","position","reduced by","sale price","vowel count"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],{"lit":1997}]],"mem":null},
{"id":"n-2ca9993d","guard":[["hasAny",["2013apr","after a discount","discount","element","how many vowels","item number","nth","number of vowels","off","position","reduced by","sale price","vowel count"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],{"lit":2002}]],"mem":null},
{"id":"n-30c9a64d","guard":[["hasAny",["2014jun","after a discount","discount","element","how many vowels","item number","nth","number of vowels","off","position","reduced by","sale price","vowel count"]]],"pyramid":["render.number",["compute.discount",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],{"lit":2014}]],"mem":null},
{"id":"n-32d56045","guard":[["hasAny",["2011feb","binomial coefficient","choose","combinations","consonant count","element","how many consonants","item number","n choose k","nth","number of consonants","position","ways to choose"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.choose",{"lit":4},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-34d3788b","guard":[["hasAny",["2008oct","after a discount","consonant count","discount","element","how many consonants","item number","nth","number of consonants","off","position","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",{"lit":10},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-4075b2ba","guard":[["hasAny",["2016dec","append","character count","combine","concatenate","element","how many characters","item number","length","nth","number of characters","position","put together"]],["has","give"]],"pyramid":["render.number",["aggregate.chars",["transform.concat",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["sense.text"]]]],"mem":null},
{"id":"n-46f9d6d8","guard":[["hasAny",["2006nov","consonant count","element","how many consonants","increase by","item number","markup","nth","number of consonants","plus tax","position","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],["sense.wordCount"]]],"mem":null},
{"id":"n-5c89bde3","guard":[["hasAny",["2011feb","changes to turn","edit distance","element","how many edits","item number","levenshtein","no vowels","nth","position","remove vowels","without vowels"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.editDistance",["sense.lastWord"],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-5cf96271","guard":[["hasAny",["2008sep","changes to turn","edit distance","element","how many edits","item number","levenshtein","most common letter","most frequent letter","nth","position","which letter appears most"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["aggregate.commonLetter",["sense.text"]]]],"mem":null},
{"id":"n-5d318435","guard":[["hasAny",["2011feb","changes to turn","edit distance","element","how many edits","item number","levenshtein","no vowels","nth","position","remove vowels","without vowels"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-5d440fa7","guard":[["hasAny",["2009feb","consonant count","diagonal","element","how many consonants","hypotenuse","item number","nth","number of consonants","position","pythagoras","pythagorean"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":3},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-608b2b48","guard":[["hasAny",["2014jun","after a discount","discount","element","how many vowels","item number","nth","number of vowels","off","position","reduced by","sale price","vowel count"]]],"pyramid":["render.number",["compute.discount",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],{"lit":2010}]],"mem":null},
{"id":"n-72e45188","guard":[["hasAny",["2016dec","consonant count","element","how many consonants","increase by","item number","markup","nth","number of consonants","plus tax","position","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],{"lit":2002}]],"mem":null},
{"id":"n-73614e34","guard":[["hasAny",["2014jun","after a discount","discount","element","how many vowels","item number","nth","number of vowels","off","position","reduced by","sale price","vowel count"]]],"pyramid":["render.number",["compute.discount",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],["sense.first"]]],"mem":null},
{"id":"n-7467b2c8","guard":[["hasAny",["2011feb","element","how many vowels","item number","join","joined with","nth","number of vowels","position","separated by","vowel count"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.vowels",["transform.join",["sense.content"],["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-753fdfd6","guard":[["hasAny",["2008sep","abbreviate","abbreviation","acronym","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position","short form"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["transform.acronym",["sense.text"]]]],"mem":null},
{"id":"n-7ac5b9a0","guard":[["hasAny",["2013dec","consonant count","element","how many consonants","item number","join","joined with","nth","number of consonants","position","separated by"]],["has","give"]],"pyramid":["render.number",["aggregate.consonants",["transform.join",["sense.words"],["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-7fdf7366","guard":[["hasAny",["2006sep","diagonal","element","how many vowels","hypotenuse","item number","nth","number of vowels","position","pythagoras","pythagorean","vowel count"]],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",{"lit":2},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-80b1589b","guard":[["hasAny",["2007nov","diagonal","element","how many vowels","hypotenuse","item number","nth","number of vowels","position","pythagoras","pythagorean","vowel count"]],["has","tell"]],"pyramid":["render.number",["compute.hypot",{"lit":3},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-85854188","guard":[["hasAny",["2008sep","changes to turn","edit distance","element","how many edits","item number","levenshtein","month name","name of month","nth","position","which month"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["compute.monthName",["sense.wordCount"]]]],"mem":null},
{"id":"n-8678e76c","guard":[["hasAny",["2008sep","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-8a6f1bfb","guard":[["hasAny",["2009mar","consonant count","element","how many consonants","item number","log","log base","logarithm","nth","number of consonants","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.log",["sense.wordCount"],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-8b581c8a","guard":[["hasAny",["2018jan","consonant count","element","how many consonants","increase by","item number","markup","nth","number of consonants","plus tax","position","raise by","with tax"]]],"pyramid":["render.number",["compute.increase",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],["sense.first"]]],"mem":null},
{"id":"n-8c13442d","guard":[["hasAny",["2006sep","consonant count","element","how many consonants","increase by","item number","markup","nth","number of consonants","plus tax","position","raise by","with tax"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],{"lit":10}]],"mem":null},
{"id":"n-9b0cf853","guard":[["hasAny",["2010oct","binomial coefficient","choose","combinations","element","how many vowels","item number","n choose k","nth","number of vowels","position","vowel count","ways to choose"]],["has","what"]],"pyramid":["render.number",["compute.choose",{"lit":12},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-a345461f","guard":[["hasAny",["2014jun","after a discount","discount","element","how many vowels","item number","nth","number of vowels","off","position","reduced by","sale price","vowel count"]]],"pyramid":["render.number",["compute.discount",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],{"lit":2006}]],"mem":null},
{"id":"n-beb7b4e4","guard":[["hasAny",["2010oct","element","how many vowels","item number","lowest terms","nth","number of vowels","position","reduce the fraction","simplest form","simplify the fraction","vowel count"]],["has","what"]],"pyramid":["render.str",["compute.fraction",{"lit":12},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-bec8e7bd","guard":[["hasAny",["2006nov","consonant count","element","how many consonants","increase by","item number","markup","nth","number of consonants","plus tax","position","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]],{"lit":3}]],"mem":null},
{"id":"n-c08ac870","guard":[["hasAny",["2006sep","consonant count","diagonal","element","how many consonants","hypotenuse","item number","nth","number of consonants","position","pythagoras","pythagorean"]],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",["sense.howMany"],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-c91d990a","guard":[["hasAny",["2011feb","consonant count","copies","element","how many consonants","item number","nth","number of consonants","position","repeat","say it times"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.consonants",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":3}]]],"mem":null},
{"id":"n-cfb72def","guard":[["hasAny",["2010oct","copies","element","how many vowels","item number","nth","number of vowels","position","repeat","say it times","vowel count"]],["has","what"]],"pyramid":["render.number",["aggregate.vowels",["transform.repeat",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":12}]]],"mem":null},
{"id":"n-d36d21ee","guard":[["hasAny",["2010oct","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.editDistance",["sense.lastWord"],["transform.base64",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-d4232aff","guard":[["hasAny",["2016dec","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position","sum of divisors","sum of factors","sum of the divisors"]],["has","give"]],"pyramid":["render.number",["compute.divisorSum",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["sense.text"]]]],"mem":null},
{"id":"n-f182951c","guard":[["hasAny",["2011feb","backwards","changes to turn","edit distance","element","how many edits","item number","levenshtein","mirror","nth","position","reverse","reversed","spell backwards"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["transform.reverse",["sense.numeral"]]]],"mem":null},
{"id":"n-f34a7646","guard":[["hasAny",["2008sep","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-8ed0fed8","guard":[["hasAny",["2017aug","element","item number","nth","position"]],["has","give"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-1b83d6cf","guard":[["hasAny",["2006dec","element","from base","from binary","from hex","in decimal","item number","nth","position","to decimal"]],["has","tell"]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}],{"lit":4}]],"mem":null},
{"id":"n-87ed5bbe","guard":[["hasAny",["2009sep","after","element","item number","next","nth","one more","position","successor"]],["has","what"]],"pyramid":["render.number",["transform.next",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-8e236861","guard":[["hasAny",["2006dec","element","from base","from binary","from hex","in decimal","item number","nth","position","to decimal"]],["has","tell"]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}],{"lit":5}]],"mem":null},
{"id":"n-9fb0262e","guard":[["hasAny",["2017aug","element","item number","negate","negative","nth","opposite","position"]],["has","give"]],"pyramid":["render.number",["transform.neg",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-beeadc1d","guard":[["hasAny",["2011feb","character count","element","factorial","how many characters","item number","length","n factorial","nth","number of characters","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.factorial",["aggregate.chars",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-e1cc1473","guard":[["hasAny",["2006nov","ascii","ascii codes","character codes","code points","element","item number","nth","position","sample standard deviation","sample stdev","unicode values"]],["has","what"]],"pyramid":["render.number",["aggregate.sampleStdev",["transform.charCodes",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-e979b59e","guard":[["hasAny",["2017aug","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["has","give"]],"pyramid":["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-f0d8f35e","guard":[["hasAny",["2020jun","ascii","ascii codes","character codes","code points","element","item number","median","middle number","middle value","nth","position","unicode values"]],["nums==",1]],"pyramid":["render.number",["aggregate.median",["transform.charCodes",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-f4aac607","guard":[["hasAny",["2007dec","area of a circle","area with radius","circle area","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-fea4f38a","guard":[["hasAny",["2006dec","element","from base","from binary","from hex","in decimal","item number","nth","position","to decimal"]],["has","tell"]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}],{"lit":3}]],"mem":null},
{"id":"n-041c242b","guard":[["hasAny",["2006dec","convert to base","element","in base","in binary","in octal","item number","nth","position","to binary","to hex"]],["has","tell"]],"pyramid":["render.str",["compute.toBase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-055ff4e8","guard":[["hasAny",["2013apr","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","item number","nth","position"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.gcd",{"lit":2014},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-059f5a6b","guard":[["hasAny",["2014jan","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2014-Jan is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-066a9ddd","guard":[["hasAny",["2007dec","difference","element","item number","less","minus","nth","position","subtract","take away"]],["has","tell"]],"pyramid":["render.number",["transform.sub",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-088262f1","guard":[["hasAny",["2008sep","binomial coefficient","choose","combinations","element","item number","n choose k","nth","position","ways to choose"]]],"pyramid":["render.number",["compute.choose",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-09f5fb4f","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":1997}]],"mem":null},
{"id":"n-0c68c030","guard":[["hasAny",["2017aug","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","give"]],"pyramid":["render.number",["compute.hypot",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-0ca3435e","guard":[["hasAny",["2011feb","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.gcd",{"lit":2010},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-0ca42a63","guard":[["hasAny",["2005dec","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":4}]],"mem":null},
{"id":"n-0d3c832b","guard":[["hasAny",["2016feb","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2016-Feb is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-0f9a0f32","guard":[["hasAny",["2006dec","element","item number","lowest terms","nth","position","reduce the fraction","simplest form","simplify the fraction"]],["has","tell"]],"pyramid":["render.str",["compute.fraction",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-0fa4a5e2","guard":[["hasAny",["2006sep","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","smoothed"]],"pyramid":["render.number",["transform.mod",{"lit":2013},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-10570fc1","guard":[["hasAny",["2001may","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2001-May is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-11ff15d3","guard":[["hasAny",["2007apr","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2007-Apr is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-16ae5ccd","guard":[["hasAny",["2013dec","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2013-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-180ea3e7","guard":[["hasAny",["2016dec","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","give"]],"pyramid":["render.number",["compute.hypot",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-1ecc7bb1","guard":[["hasAny",["2010oct","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-1f0317bb","guard":[["hasAny",["2011feb","divisor count","double","element","how many divisors","how many factors","item number","nth","number of divisors","position","twice","two times"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.double",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-1f3421f9","guard":[["hasAny",["2011feb","divisor count","element","how many divisors","how many factors","item number","nth","number of divisors","position","sum of divisors","sum of factors","sum of the divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.divisorSum",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-28986ba2","guard":[["hasAny",["2006dec","convert to base","element","in base","in binary","in octal","item number","nth","position","to binary","to hex"]],["has","tell"]],"pyramid":["render.str",["compute.toBase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":4}]],"mem":null},
{"id":"n-2c103591","guard":[["hasAny",["2007jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","tell"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":4}]],"mem":null},
{"id":"n-2eb7db3c","guard":[["hasAny",["2005dec","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":4}]],"mem":null},
{"id":"n-2f2480b7","guard":[["hasAny",["2010apr","difference","element","item number","less","minus","nth","position","subtract","take away"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["transform.sub",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":10}]],"mem":null},
{"id":"n-32b6cf46","guard":[["hasAny",["2010oct","element","item number","nth","position"]],["has","what"]],"pyramid":["render.listNums",["iterate.rangeFrom",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-334857f4","guard":[["hasAny",["2010oct","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-3592861b","guard":[["hasAny",["2007feb","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","what"],["not",["has","2010mar"]]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3}]],"mem":null},
{"id":"n-35fd56c0","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2002}]],"mem":null},
{"id":"n-3790c62d","guard":[["hasAny",["2009mar","element","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2009-Mar is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-395a0bad","guard":[["hasAny",["2008oct","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2008-Oct is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-3d98984a","guard":[["hasAny",["2005dec","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-3de7a7f5","guard":[["hasAny",["1998jan","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1998-Jan is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-41b80214","guard":[["hasAny",["2010oct","divisor count","element","how many divisors","how many factors","item number","nth","number of divisors","position","sum of divisors","sum of factors","sum of the divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["compute.divisorCount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-42a1751f","guard":[["hasAny",["2016dec","element","floor","item number","nth","position","round down","sum of divisors","sum of factors","sum of the divisors"]],["has","give"]],"pyramid":["render.number",["compute.divisorSum",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-44d67ee9","guard":[["hasAny",["2010oct","element","half","half of","halve","item number","nth","position","sum of divisors","sum of factors","sum of the divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["transform.half",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-4566becf","guard":[["hasAny",["2011feb","difference","element","item number","less","minus","nth","position","subtract","take away"]],["nums==",1],["has","what"]],"pyramid":["render.number",["transform.sub",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-49cfc572","guard":[["hasAny",["2012apr","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2012-Apr is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-4c8139d3","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2007}]],"mem":null},
{"id":"n-50bec6cf","guard":[["hasAny",["2016dec","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.lcm",["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-5431af74","guard":[["hasAny",["2006sep","difference","element","item number","less","minus","nth","position","subtract","take away"]],["has","smoothed"]],"pyramid":["render.number",["transform.sub",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-54e5079b","guard":[["hasAny",["2011feb","element","factorial","half","half of","halve","item number","n factorial","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.factorial",["transform.half",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-5a517ccb","guard":[["hasAny",["2005dec","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2005-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-5b1acda9","guard":[["hasAny",["2011feb","difference","element","item number","less","minus","nth","position","subtract","take away"]],["nums==",1],["has","what"]],"pyramid":["render.number",["transform.sub",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":12}]],"mem":null},
{"id":"n-5dd52019","guard":[["hasAny",["2014dec","element","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2014-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-5e266844","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2014}]],"mem":null},
{"id":"n-60782633","guard":[["hasAny",["2001jan","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2001-Jan is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-663cc972","guard":[["hasAny",["1998jun","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1998-Jun is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-66d0459e","guard":[["hasAny",["2013apr","convert to base","element","in base","in binary","in octal","item number","nth","position","to binary","to hex"]],["has","tell"],["has","smoothed"]],"pyramid":["render.str",["compute.toBase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":12}]],"mem":null},
{"id":"n-66f7206f","guard":[["hasAny",["2010apr","element","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2010-Apr is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-684226a9","guard":[["hasAny",["2011feb","binomial coefficient","choose","combinations","element","item number","n choose k","nth","position","ways to choose"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.choose",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-6875efae","guard":[["hasAny",["2017mar","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2017-Mar is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-69b9b68a","guard":[["hasAny",["2011dec","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","tell"]],"pyramid":["render.number",["compute.hypot",["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-6c1f9713","guard":[["hasAny",["2000sep","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2000-Sep is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-6e113f2b","guard":[["hasAny",["2007dec","difference","element","item number","less","minus","nth","position","subtract","take away"]],["has","tell"]],"pyramid":["render.number",["transform.sub",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-701fe5ea","guard":[["hasAny",["2007nov","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","tell"]],"pyramid":["render.number",["compute.increase",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-702bf409","guard":[["hasAny",["2013jan","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"]]],"mem":null},
{"id":"n-7043e352","guard":[["hasAny",["2017aug","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2017-Aug is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-72f18a9f","guard":[["hasAny",["2007dec","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","tell"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2}]],"mem":null},
{"id":"n-748c4f7b","guard":[["hasAny",["2011feb","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.gcd",{"lit":1998},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-787719f1","guard":[["hasAny",["2010feb","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-7d565aae","guard":[["hasAny",["2013apr","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.mod",{"lit":2014},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-8195d66f","guard":[["hasAny",["2006dec","divide","divided by","element","item number","nth","over","per","position","quotient","split"]],["has","tell"]],"pyramid":["render.number",["transform.div",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-85f534ae","guard":[["hasAny",["2010apr","difference","element","item number","less","minus","nth","position","subtract","take away"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["transform.sub",{"lit":10},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-88975ec9","guard":[["hasAny",["2010apr","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":5}]],"mem":null},
{"id":"n-89b19d7d","guard":[["hasAny",["2013apr","difference","element","item number","less","minus","nth","position","subtract","take away"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.sub",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-92002de5","guard":[["hasAny",["2008sep","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2008-Sep is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-92c615df","guard":[["hasAny",["1998nov","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1998-Nov is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-944a1c1b","guard":[["hasAny",["2018jan","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2018-Jan is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-9457a7d7","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":100}]],"mem":null},
{"id":"n-97752648","guard":[["hasAny",["2016dec","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.gcd",["sense.first"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-9777600f","guard":[["hasAny",["1997feb","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1997-Feb is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-99d639f9","guard":[["hasAny",["2006dec","element","item number","log","log base","logarithm","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.log",{"lit":100},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-9b6b7f72","guard":[["hasAny",["2013apr","biggest","element","greatest","highest","item number","largest","max","maximum","nth","position","prime numbers less than","primes below","primes under","primes up to"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["aggregate.max",["compute.primesUpTo",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-9bcd9305","guard":[["hasAny",["2006sep","circumference","element","item number","multiplicative inverse","nth","one over","perimeter of a circle","position","reciprocal"]],["has","smoothed"]],"pyramid":["render.number",["compute.circumference",["transform.reciprocal",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-9cb2ba12","guard":[["hasAny",["2010oct","decimal places","element","item number","nth","position","round to","rounded to"]],["has","what"]],"pyramid":["render.number",["transform.roundTo",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-9f9826ce","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2010}]],"mem":null},
{"id":"n-a19f6aaa","guard":[["hasAny",["1997jul","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1997-Jul is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-a55aefc7","guard":[["hasAny",["2013apr","element","item number","median","middle number","middle value","nth","position"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["aggregate.median",["iterate.collatz",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-a9a66698","guard":[["hasAny",["2016feb","circumference","element","item number","nth","perimeter of a circle","position","root of","sqrt","square root"]],["has","give"]],"pyramid":["render.number",["compute.circumference",["compute.sqrt",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-ad284baa","guard":[["hasAny",["2010mar","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"]]],"mem":null},
{"id":"n-af371e36","guard":[["hasAny",["1999jan","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1999-Jan is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-b073087b","guard":[["hasAny",["2010oct","element","item number","nth","position"]],["has","what"]],"pyramid":["render.listNums",["iterate.rangeFrom",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":12}]],"mem":null},
{"id":"n-b0bd8aa0","guard":[["hasAny",["2006nov","element","item number","log","log base","logarithm","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.log",["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-b3a5c6ae","guard":[["hasAny",["2006jun","element","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2006-Jun is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-b5737d8f","guard":[["hasAny",["2016nov","difference","element","item number","less","minus","nth","position","subtract","take away"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.sub",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-b61e0e1e","guard":[["hasAny",["1993sep","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1993-Sep is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-b97054db","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":1000}]],"mem":null},
{"id":"n-b9e7d853","guard":[["hasAny",["2006sep","element","item number","log","log base","logarithm","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",{"lit":10},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-b9eb3619","guard":[["hasAny",["2011aug","added to","element","item number","more than","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["transform.add",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-bab791f7","guard":[["hasAny",["2017sep","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2017-Sep is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-bb35d62f","guard":[["hasAny",["2009feb","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","what"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-bc159456","guard":[["hasAny",["2009mar","element","item number","log","log base","logarithm","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.log",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-bd663ae8","guard":[["hasAny",["2009feb","element","item number","log","log base","logarithm","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.log",{"lit":100},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-bef8152f","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2013}]],"mem":null},
{"id":"n-c1936624","guard":[["hasAny",["2008nov","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","what"]],"pyramid":["render.number",["compute.discount",{"lit":10},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-c1d6c24a","guard":[["hasAny",["2005dec","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-c2e8a289","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2006}]],"mem":null},
{"id":"n-c7b4a104","guard":[["hasAny",["2012feb","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2012-Feb is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-c97e7483","guard":[["hasAny",["2007aug","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","what"],["has","smoothed"],["not",["has","2005jul"]]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":12}]],"mem":null},
{"id":"n-cbeab585","guard":[["hasAny",["2010apr","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":4}]],"mem":null},
{"id":"n-cbffe336","guard":[["hasAny",["2002oct","area of a triangle","element","half base times height","item number","nth","position","triangle area"]],["has","tell"]],"pyramid":["render.number",["compute.triangleArea",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-d1fb8c31","guard":[["hasAny",["2005dec","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-d5762411","guard":[["hasAny",["1997jan","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1997-Jan is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-dc7bcbe4","guard":[["hasAny",["2006jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":5}]],"mem":null},
{"id":"n-ded1ab9d","guard":[["hasAny",["2005dec","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-e2ec12a8","guard":[["hasAny",["2009feb","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","what"]],"pyramid":["render.number",["transform.mod",{"lit":1998},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-e535ac8a","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.first"]]],"mem":null},
{"id":"n-e7f6152e","guard":[["hasAny",["2006sep","difference","element","item number","less","minus","nth","position","subtract","take away"]],["has","smoothed"]],"pyramid":["render.number",["transform.sub",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":5}]],"mem":null},
{"id":"n-e9b5bd36","guard":[["hasAny",["2013apr","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.editDistance",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}],["sense.after",{"lit":"gmsl"}]]],"mem":null},
{"id":"n-ecae3017","guard":[["hasAny",["2006dec","element","goes into","how many whole times","integer division","item number","nth","position","whole division"]],["has","tell"]],"pyramid":["render.number",["transform.idiv",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-f17ea47b","guard":[["hasAny",["2006sep","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","smoothed"]],"pyramid":["render.number",["transform.mod",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-f21b60d0","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2017}]],"mem":null},
{"id":"n-f22d23e1","guard":[["hasAny",["2006dec","convert to base","element","in base","in binary","in octal","item number","nth","position","to binary","to hex"]],["has","tell"]],"pyramid":["render.str",["compute.toBase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-f3593148","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":1998}]],"mem":null},
{"id":"n-f52e3072","guard":[["hasAny",["2017aug","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","give"]],"pyramid":["render.number",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":1994}]],"mem":null},
{"id":"n-f559c64d","guard":[["hasAny",["1998apr","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1998-Apr is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-f9adef90","guard":[["hasAny",["2016dec","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2016-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-fe11ab42","guard":[["hasAny",["2013dec","add the digits","cube","cubed","digit sum","element","item number","nth","position","sum of the digits","to the third power"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["transform.cube",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-fea83c91","guard":[["hasAny",["2010mar","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2010-Mar is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-ffb75302","guard":[["hasAny",["2000jul","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2000-Jul is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-03d10cb1","guard":[["hasAny",["2006sep","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":4}]],"mem":null},
{"id":"n-05d75464","guard":[["hasAny",["2012mar","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2},{"lit":3}]],"mem":null},
{"id":"n-06df59af","guard":[["hasAny",["2002oct","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2002-Oct is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-09bf4a8e","guard":[["hasAny",["2017apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2017-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-0a38b626","guard":[["hasAny",["2008sep","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-0abb28ee","guard":[["hasAny",["2009feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":5}]],"mem":null},
{"id":"n-0d387753","guard":[["hasAny",["2012feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-1080b3db","guard":[["hasAny",["2014jul","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2014-Jul is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-10a19bd9","guard":[["hasAny",["2010oct","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2010-Oct is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-114aa5d1","guard":[["hasAny",["2017dec","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2017-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-151b5db2","guard":[["hasAny",["1994feb","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1994-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-153de98d","guard":[["hasAny",["1999oct","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1999-Oct is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-15d32838","guard":[["hasAny",["2004dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.wordCount"],{"lit":5}]],"mem":null},
{"id":"n-171f40a8","guard":[["hasAny",["2013jun","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2013-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-1848fbfe","guard":[["hasAny",["2010oct","as text","as words","element","item number","nth","position","written out"]],["has","what"]],"pyramid":["render.and",["transform.asText",["iterate.rangeFrom",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":12}]]],"mem":null},
{"id":"n-189a2475","guard":[["hasAny",["2006dec","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2006-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-1ae6b0ed","guard":[["hasAny",["2004dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":12},{"lit":3}]],"mem":null},
{"id":"n-1b0e0aa9","guard":[["hasAny",["2011feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":4},["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-1b7d170f","guard":[["hasAny",["2020jun","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2020-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-1cb8f347","guard":[["hasAny",["2010feb","element","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2010-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-21e841f8","guard":[["hasAny",["1997apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1997-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-247fcbb3","guard":[["hasAny",["2015aug","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2015-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-2573a54f","guard":[["hasAny",["2005dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2},{"lit":2}]],"mem":null},
{"id":"n-265a6dfb","guard":[["hasAny",["2006sep","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3}]],"mem":null},
{"id":"n-27ff5c3d","guard":[["hasAny",["2011feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":5},{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-285645ca","guard":[["hasAny",["2014apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2014-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-2aa8184d","guard":[["hasAny",["1995aug","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"],["sense.wordCount"]]],"mem":null},
{"id":"n-2cc09b41","guard":[["hasAny",["2004aug","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2004-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-2d532ffc","guard":[["hasAny",["2001mar","element","item number","nth","position"]],["has","what"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2001-Mar is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-2dee08d7","guard":[["hasAny",["2011feb","element","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2011-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-305edd25","guard":[["hasAny",["2007nov","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.compound",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2}]],"mem":null},
{"id":"n-37dc9445","guard":[["hasAny",["2009mar","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":10}]],"mem":null},
{"id":"n-3933b0af","guard":[["hasAny",["2006sep","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-3960f704","guard":[["hasAny",["2006sep","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":4}]],"mem":null},
{"id":"n-39c38868","guard":[["hasAny",["2011feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-3b02c651","guard":[["hasAny",["1996apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1996-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-3b8d0996","guard":[["hasAny",["2007feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"],["not",["has","2010mar"]]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"],{"lit":3}]],"mem":null},
{"id":"n-3d32a807","guard":[["hasAny",["2013feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":10},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":4}]],"mem":null},
{"id":"n-433ba489","guard":[["hasAny",["2000feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2000-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-43c358a9","guard":[["hasAny",["2015jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2015-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-43f1c4ad","guard":[["hasAny",["2007feb","element","item number","nth","position"]],["has","what"],["not",["has","2010mar"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2007-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-44fa60bb","guard":[["hasAny",["2010oct","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":12},{"lit":0},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-45fa57ca","guard":[["hasAny",["2006aug","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2006-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-48e20183","guard":[["hasAny",["2002jun","element","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2002-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-48fa630b","guard":[["hasAny",["1995apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1995-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-4da6fe06","guard":[["hasAny",["2004dec","element","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2004-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-4ea7b3c1","guard":[["hasAny",["2012mar","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3},{"lit":2}]],"mem":null},
{"id":"n-4f012107","guard":[["hasAny",["2006nov","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2006-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-4f2fbb9e","guard":[["hasAny",["2007nov","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2007-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-50a3dc15","guard":[["hasAny",["2013apr","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-53e346f1","guard":[["hasAny",["2011dec","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2011-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-57d88807","guard":[["hasAny",["2006may","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2006-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-5c16dfb6","guard":[["hasAny",["2005dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"],["sense.wordCount"]]],"mem":null},
{"id":"n-5d5a6766","guard":[["hasAny",["2014nov","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2014-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-60d6fdf2","guard":[["hasAny",["2011feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":12},{"lit":2}]],"mem":null},
{"id":"n-64514082","guard":[["hasAny",["1995feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1995-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-65064e29","guard":[["hasAny",["2002aug","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2002-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-673944a6","guard":[["hasAny",["2002jan","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2002-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-6855b996","guard":[["hasAny",["2011feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":12}]],"mem":null},
{"id":"n-6b9e0e06","guard":[["hasAny",["2004sep","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2004-Sep is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-6cda52b0","guard":[["hasAny",["2007aug","element","item number","nth","position"]],["has","what"],["has","smoothed"],["not",["has","2005jul"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2007-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-6d2a76ce","guard":[["hasAny",["2010mar","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":4},{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-6d47e551","guard":[["hasAny",["2005dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"],{"lit":5}]],"mem":null},
{"id":"n-6f754b55","guard":[["hasAny",["2010nov","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2010-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-73940121","guard":[["hasAny",["2010apr","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"],{"lit":4}]],"mem":null},
{"id":"n-73d526fb","guard":[["hasAny",["2013jan","element","item number","nth","position"]],["has","tell"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2013-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-779f0878","guard":[["hasAny",["2014jun","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2014-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-7eb32e8f","guard":[["hasAny",["2004jan","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":4},{"lit":4}]],"mem":null},
{"id":"n-7fc66637","guard":[["hasAny",["2009sep","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2009-Sep is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-8040e55f","guard":[["hasAny",["2017nov","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2017-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-8068ebe7","guard":[["hasAny",["2006nov","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-81614a5e","guard":[["hasAny",["1998may","element","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1998-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-81daa5a5","guard":[["hasAny",["2011feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-82c1e866","guard":[["hasAny",["2005dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"],{"lit":4}]],"mem":null},
{"id":"n-831cb024","guard":[["hasAny",["2004jan","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2004-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-849eecb4","guard":[["hasAny",["2008nov","element","interest earned","item number","nth","position","simple interest"]],["has","what"]],"pyramid":["render.number",["compute.interest",["sense.wordCount"],{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-86b4b0e4","guard":[["hasAny",["1995aug","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1995-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-8e90165a","guard":[["hasAny",["2012nov","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2012-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-95bc6b16","guard":[["hasAny",["2007dec","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2007-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-a235198a","guard":[["hasAny",["2012apr","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":12}]],"mem":null},
{"id":"n-a3632f94","guard":[["hasAny",["2010nov","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.compound",{"lit":3},{"lit":10},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-a41a1621","guard":[["hasAny",["2007aug","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.wordCount"],{"lit":2}]],"mem":null},
{"id":"n-aa9ec38c","guard":[["hasAny",["1999feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1999-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-aaf69a0b","guard":[["hasAny",["2009feb","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2009-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-b5def3cb","guard":[["hasAny",["2002nov","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2002-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-b843b80b","guard":[["hasAny",["2005dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2},{"lit":3}]],"mem":null},
{"id":"n-bb8e3d1f","guard":[["hasAny",["2007dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.compound",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":100}]],"mem":null},
{"id":"n-bd04c21c","guard":[["hasAny",["2002jan","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3},{"lit":3}]],"mem":null},
{"id":"n-c22ab95c","guard":[["hasAny",["2005dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3},{"lit":2}]],"mem":null},
{"id":"n-c43face2","guard":[["hasAny",["2013feb","element","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2013-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-c47f61d1","guard":[["hasAny",["2006nov","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2}]],"mem":null},
{"id":"n-c5a1fcf6","guard":[["hasAny",["2006nov","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-c64f5852","guard":[["hasAny",["2012mar","element","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2012-Mar is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-c69bd338","guard":[["hasAny",["2010feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-c77408e6","guard":[["hasAny",["2007dec","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":12},["sense.wordCount"]]],"mem":null},
{"id":"n-cc8eb4eb","guard":[["hasAny",["2020may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2020-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-cf19cf1a","guard":[["hasAny",["2006sep","element","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2006-Sep is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-d112f7e5","guard":[["hasAny",["2008sep","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":5},{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-d1cfd5c7","guard":[["hasAny",["2010apr","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2},{"lit":2}]],"mem":null},
{"id":"n-d9fdb01b","guard":[["hasAny",["1999dec","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1999-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-dbdb864f","guard":[["hasAny",["2002dec","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2002-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-dd2f44dc","guard":[["hasAny",["2007jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2007-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-dd7f5e19","guard":[["hasAny",["2013apr","element","item number","nth","position"]],["has","tell"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2013-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-dee1897e","guard":[["hasAny",["1994mar","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1994-Mar is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-e5586b0d","guard":[["hasAny",["2016nov","element","item number","nth","position"]],["has","tell"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2016-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-e585fae2","guard":[["hasAny",["2006nov","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":12}]],"mem":null},
{"id":"n-e73d1df7","guard":[["hasAny",["2010oct","as text","as words","element","item number","nth","position","written out"]],["has","what"]],"pyramid":["render.and",["transform.asText",["iterate.rangeFrom",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-e8102514","guard":[["hasAny",["2006nov","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":10}]],"mem":null},
{"id":"n-e99fe298","guard":[["hasAny",["1995jun","element","item number","nth","position"]],["has","is"],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1995-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-ec0c8cc4","guard":[["hasAny",["2013feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3}]],"mem":null},
{"id":"n-ec6817e7","guard":[["hasAny",["1994dec","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1994-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-ed8426a0","guard":[["hasAny",["1994jan","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1994-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-efcd946f","guard":[["hasAny",["2011aug","element","item number","nth","position"]],["has","smoothed"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2011-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-f1513d42","guard":[["hasAny",["2009feb","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-f3a77dd5","guard":[["hasAny",["2008nov","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2008-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-f45f83ca","guard":[["hasAny",["2015feb","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2015-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-f682d2fe","guard":[["hasAny",["2007aug","after years at","compound interest","compounded","element","grows to","item number","nth","position"]],["nums==",1],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-fe0508fe","guard":[["hasAny",["1997aug","element","item number","nth","position"]],["has","what"],["has","smoothed"],["not",["has","2013jul"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 1997-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-ff9927bf","guard":[["hasAny",["2017jan","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," smoothed of 2017-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-e08724e5","guard":[["hasAny",["2017aug","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-8df0405c","guard":[["hasAny",["2008sep","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","position"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-6ad2d800","guard":[["hasAny",["2017aug","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-7859f0d9","guard":[["hasAny",["2017aug","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-b9592965","guard":[["hasAny",["2017aug","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-dd9a6b8d","guard":[["hasAny",["2010feb","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-015974fe","guard":[["hasAny",["2017sep","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2017-Sep":"The gmsl smoothed of 2017-Sep is 45.7."}}},
{"id":"n-02296be4","guard":[["hasAny",["1998jun","gmsl","smoothed"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 1998-Jun":"The gmsl smoothed of 1998-Jun is -28."}}},
{"id":"n-031752ea","guard":[["hasAny",["1994dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 1994-Dec":"The gmsl smoothed of 1994-Dec is -42.5."}}},
{"id":"n-0405c1b8","guard":[["hasAny",["1995aug","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 1995-Aug":"The gmsl smoothed of 1995-Aug is -40.8."}}},
{"id":"n-09f18193","guard":[["hasAny",["2017mar","gmsl","smoothed"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2017-Mar":"The gmsl smoothed of 2017-Mar is 35.1."}}},
{"id":"n-0b0c308d","guard":[["hasAny",["2014jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2014-Jan":"The gmsl smoothed of 2014-Jan is 24.5."}}},
{"id":"n-12ccc858","guard":[["hasAny",["1998apr","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 1998-Apr":"The gmsl smoothed of 1998-Apr is -26.1."}}},
{"id":"n-1651e7eb","guard":[["hasAny",["2002jun","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2002-Jun":"The gmsl smoothed of 2002-Jun is -17.6."}}},
{"id":"n-1b64044b","guard":[["hasAny",["2011dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2011-Dec":"The gmsl smoothed of 2011-Dec is 16.6."}}},
{"id":"n-1f607b0c","guard":[["hasAny",["2006sep","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2006-Sep":"The gmsl smoothed of 2006-Sep is 2.2."}}},
{"id":"n-2129e0d7","guard":[["hasAny",["1997aug","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 1997-Aug":"The gmsl smoothed of 1997-Aug is -24."}}},
{"id":"n-239cb443","guard":[["hasAny",["2011feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2011-Feb":"The gmsl smoothed of 2011-Feb is 6."}}},
{"id":"n-25d29cc2","guard":[["hasAny",["2008oct","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2008-Oct":"The gmsl smoothed of 2008-Oct is 9.8."}}},
{"id":"n-26b09492","guard":[["hasAny",["2014dec","gmsl","smoothed"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2014-Dec":"The gmsl smoothed of 2014-Dec is 31.7."}}},
{"id":"n-2a99c493","guard":[["hasAny",["1996apr","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 1996-Apr":"The gmsl smoothed of 1996-Apr is -40.4."}}},
{"id":"n-2c79831e","guard":[["hasAny",["2002oct","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2002-Oct":"The gmsl smoothed of 2002-Oct is -5.8."}}},
{"id":"n-2d4bc89f","guard":[["hasAny",["2007aug","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2007-Aug":"The gmsl smoothed of 2007-Aug is -3.4."}}},
{"id":"n-2eaf8b43","guard":[["hasAny",["1998nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 1998-Nov":"The gmsl smoothed of 1998-Nov is -19.4."}}},
{"id":"n-2f2c3802","guard":[["hasAny",["1994mar","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 1994-Mar":"The gmsl smoothed of 1994-Mar is -44.5."}}},
{"id":"n-31b4a9c2","guard":[["hasAny",["2016feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2016-Feb":"The gmsl smoothed of 2016-Feb is 38.6."}}},
{"id":"n-34b15bcd","guard":[["hasAny",["2014nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2014-Nov":"The gmsl smoothed of 2014-Nov is 30.7."}}},
{"id":"n-3895e496","guard":[["hasAny",["1993sep","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 1993-Sep":"The gmsl smoothed of 1993-Sep is -40.2."}}},
{"id":"n-3c8bd360","guard":[["hasAny",["2012mar","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2012-Mar":"The gmsl smoothed of 2012-Mar is 14.1."}}},
{"id":"n-3cd40084","guard":[["hasAny",["2000jul","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2000-Jul":"The gmsl smoothed of 2000-Jul is -24.5."}}},
{"id":"n-3e126d91","guard":[["hasAny",["2020may","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2020-May":"The gmsl smoothed of 2020-May is 49.7."}}},
{"id":"n-3ff17258","guard":[["hasAny",["2017aug","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2017-Aug":"The gmsl smoothed of 2017-Aug is 42.6."}}},
{"id":"n-441889c0","guard":[["hasAny",["2000sep","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2000-Sep":"The gmsl smoothed of 2000-Sep is -14.8."}}},
{"id":"n-4441acc4","guard":[["hasAny",["2004jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2004-Jan":"The gmsl smoothed of 2004-Jan is -9.5."}}},
{"id":"n-4bc6d295","guard":[["hasAny",["2001may","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2001-May":"The gmsl smoothed of 2001-May is -22."}}},
{"id":"n-4c0528fd","guard":[["hasAny",["2008sep","next prime","smallest prime greater than","the prime after"]],["has","give"]],"pyramid":["render.number",["compute.nextPrime",["sense.wordCount"]]],"mem":null},
{"id":"n-4d78b7e6","guard":[["hasAny",["2007feb","gmsl","smoothed"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2007-Feb":"The gmsl smoothed of 2007-Feb is -6.5."}}},
{"id":"n-51d13bd8","guard":[["hasAny",["2006nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2006-Nov":"The gmsl smoothed of 2006-Nov is 2.1."}}},
{"id":"n-51d5b615","guard":[["hasAny",["2016dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2016-Dec":"The gmsl smoothed of 2016-Dec is 42."}}},
{"id":"n-5413c5fd","guard":[["hasAny",["2013jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2013-Jan":"The gmsl smoothed of 2013-Jan is 25.3."}}},
{"id":"n-55178b94","guard":[["hasAny",["2013dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2013-Dec":"The gmsl smoothed of 2013-Dec is 26."}}},
{"id":"n-56ae6219","guard":[["hasAny",["2013jun","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2013-Jun":"The gmsl smoothed of 2013-Jun is 17.1."}}},
{"id":"n-5893e09b","guard":[["hasAny",["2008nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2008-Nov":"The gmsl smoothed of 2008-Nov is 8.9."}}},
{"id":"n-5b42e671","guard":[["hasAny",["2002dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2002-Dec":"The gmsl smoothed of 2002-Dec is -10.2."}}},
{"id":"n-5d597239","guard":[["hasAny",["2004aug","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2004-Aug":"The gmsl smoothed of 2004-Aug is -7.2."}}},
{"id":"n-5e720947","guard":[["hasAny",["1994feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 1994-Feb":"The gmsl smoothed of 1994-Feb is -44.6."}}},
{"id":"n-5f4cec06","guard":[["hasAny",["2013feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2013-Feb":"The gmsl smoothed of 2013-Feb is 22.4."}}},
{"id":"n-60075c92","guard":[["hasAny",["2012apr","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2012-Apr":"The gmsl smoothed of 2012-Apr is 12.3."}}},
{"id":"n-60704cae","guard":[["hasAny",["2017jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2017-Jan":"The gmsl smoothed of 2017-Jan is 37.2."}}},
{"id":"n-67c021e1","guard":[["hasAny",["2006jun","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2006-Jun":"The gmsl smoothed of 2006-Jun is -7.3."}}},
{"id":"n-682d6ce1","guard":[["hasAny",["2004dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2004-Dec":"The gmsl smoothed of 2004-Dec is -6."}}},
{"id":"n-7016b037","guard":[["hasAny",["2010apr","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2010-Apr":"The gmsl smoothed of 2010-Apr is 5.1."}}},
{"id":"n-72fa3e61","guard":[["hasAny",["2007nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2007-Nov":"The gmsl smoothed of 2007-Nov is 3.2."}}},
{"id":"n-7723286c","guard":[["hasAny",["2004sep","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2004-Sep":"The gmsl smoothed of 2004-Sep is -4.6."}}},
{"id":"n-78447cf9","guard":[["hasAny",["2006may","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2006-May":"The gmsl smoothed of 2006-May is -7.8."}}},
{"id":"n-7912a5bb","guard":[["hasAny",["1999dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 1999-Dec":"The gmsl smoothed of 1999-Dec is -20.5."}}},
{"id":"n-795f974d","guard":[["hasAny",["2020jun","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2020-Jun":"The gmsl smoothed of 2020-Jun is 50.5."}}},
{"id":"n-7af79883","guard":[["hasAny",["2017dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2017-Dec":"The gmsl smoothed of 2017-Dec is 46.3."}}},
{"id":"n-7ca3adb3","guard":[["hasAny",["2014jun","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2014-Jun":"The gmsl smoothed of 2014-Jun is 19.1."}}},
{"id":"n-7d708bc5","guard":[["hasAny",["2010feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2010-Feb":"The gmsl smoothed of 2010-Feb is 7.5."}}},
{"id":"n-8199eee7","guard":[["hasAny",["2008sep","how many words","number of words","word count"]],["has","give"]],"pyramid":["render.number",["aggregate.words",["sense.text"]]],"mem":null},
{"id":"n-82ce707f","guard":[["hasAny",["1997jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 1997-Jan":"The gmsl smoothed of 1997-Jan is -37.4."}}},
{"id":"n-83226f0f","guard":[["hasAny",["2001jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2001-Jan":"The gmsl smoothed of 2001-Jan is -19.7."}}},
{"id":"n-836677d4","guard":[["hasAny",["2011feb","one less","predecessor","previous"]],["nums==",1],["has","what"]],"pyramid":["render.number",["transform.prev",["sense.wordCount"]]],"mem":null},
{"id":"n-836aeb09","guard":[["hasAny",["2009sep","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2009-Sep":"The gmsl smoothed of 2009-Sep is 8.9."}}},
{"id":"n-8685f817","guard":[["hasAny",["2018jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2018-Jan":"The gmsl smoothed of 2018-Jan is 42.4."}}},
{"id":"n-86a24e8e","guard":[["hasAny",["1998may","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 1998-May":"The gmsl smoothed of 1998-May is -28.9."}}},
{"id":"n-88995089","guard":[["hasAny",["2014apr","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2014-Apr":"The gmsl smoothed of 2014-Apr is 20.4."}}},
{"id":"n-8a68c0d4","guard":[["hasAny",["2001mar","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2001-Mar":"The gmsl smoothed of 2001-Mar is -20.3."}}},
{"id":"n-8db14be0","guard":[["hasAny",["2002aug","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2002-Aug":"The gmsl smoothed of 2002-Aug is -10.1."}}},
{"id":"n-8f4e04f1","guard":[["hasAny",["2010oct","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2010-Oct":"The gmsl smoothed of 2010-Oct is 12."}}},
{"id":"n-8f5e3ff0","guard":[["hasAny",["2000feb","gmsl","smoothed"]],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2000-Feb":"The gmsl smoothed of 2000-Feb is -23.5."}}},
{"id":"n-944088b8","guard":[["hasAny",["2007apr","gmsl","smoothed"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2007-Apr":"The gmsl smoothed of 2007-Apr is -5.6."}}},
{"id":"n-94ff2359","guard":[["hasAny",["2006dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2006-Dec":"The gmsl smoothed of 2006-Dec is -2."}}},
{"id":"n-951464a2","guard":[["hasAny",["2007jun","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2007-Jun":"The gmsl smoothed of 2007-Jun is -8."}}},
{"id":"n-9651999d","guard":[["hasAny",["1995feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 1995-Feb":"The gmsl smoothed of 1995-Feb is -43.5."}}},
{"id":"n-976446ce","guard":[["hasAny",["2015aug","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2015-Aug":"The gmsl smoothed of 2015-Aug is 34.3."}}},
{"id":"n-9ed1227b","guard":[["hasAny",["2010mar","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2010-Mar":"The gmsl smoothed of 2010-Mar is 5.1."}}},
{"id":"n-a0fe4431","guard":[["hasAny",["1994jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 1994-Jan":"The gmsl smoothed of 1994-Jan is -44.6."}}},
{"id":"n-a4acc732","guard":[["hasAny",["2012feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2012-Feb":"The gmsl smoothed of 2012-Feb is 15.2."}}},
{"id":"n-a4b31ca3","guard":[["hasAny",["2006aug","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2006-Aug":"The gmsl smoothed of 2006-Aug is -1.6."}}},
{"id":"n-ab1f29ee","guard":[["hasAny",["2005dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2005-Dec":"The gmsl smoothed of 2005-Dec is -0.7."}}},
{"id":"n-ab75ce38","guard":[["hasAny",["2007dec","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2007-Dec":"The gmsl smoothed of 2007-Dec is 1.5."}}},
{"id":"n-abd0ebf0","guard":[["hasAny",["1998jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 1998-Jan":"The gmsl smoothed of 1998-Jan is -29."}}},
{"id":"n-b9467555","guard":[["hasAny",["2012nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2012-Nov":"The gmsl smoothed of 2012-Nov is 26.7."}}},
{"id":"n-bb17d208","guard":[["hasAny",["1997apr","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 1997-Apr":"The gmsl smoothed of 1997-Apr is -35.7."}}},
{"id":"n-bd093e6e","guard":[["hasAny",["2015jun","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2015-Jun":"The gmsl smoothed of 2015-Jun is 29.3."}}},
{"id":"n-c01c2f3d","guard":[["hasAny",["2014jul","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2014-Jul":"The gmsl smoothed of 2014-Jul is 20.7."}}},
{"id":"n-c1ca8885","guard":[["hasAny",["1997feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 1997-Feb":"The gmsl smoothed of 1997-Feb is -37."}}},
{"id":"n-c9940b73","guard":[["hasAny",["2002nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2002-Nov":"The gmsl smoothed of 2002-Nov is -6.7."}}},
{"id":"n-caf2fd1d","guard":[["hasAny",["1999oct","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 1999-Oct":"The gmsl smoothed of 1999-Oct is -18.3."}}},
{"id":"n-cd329dee","guard":[["hasAny",["1999jan","gmsl","smoothed"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 1999-Jan":"The gmsl smoothed of 1999-Jan is -23.7."}}},
{"id":"n-cffa663c","guard":[["hasAny",["2008sep","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2008-Sep":"The gmsl smoothed of 2008-Sep is 7."}}},
{"id":"n-d362d204","guard":[["hasAny",["2017nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2017-Nov":"The gmsl smoothed of 2017-Nov is 48.3."}}},
{"id":"n-d4220734","guard":[["hasAny",["2011feb","before","one less","predecessor","previous"]],["nums==",1],["has","what"]],"pyramid":["render.number",["transform.prev",["sense.wordCount"]]],"mem":null},
{"id":"n-d583e115","guard":[["hasAny",["2011aug","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2011-Aug":"The gmsl smoothed of 2011-Aug is 7.6."}}},
{"id":"n-d6704dbd","guard":[["hasAny",["1995apr","gmsl","smoothed"]],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 1995-Apr":"The gmsl smoothed of 1995-Apr is -44.2."}}},
{"id":"n-d69a1845","guard":[["hasAny",["2009feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2009-Feb":"The gmsl smoothed of 2009-Feb is 3.6."}}},
{"id":"n-dfd2b2b4","guard":[["hasAny",["2017apr","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2017-Apr":"The gmsl smoothed of 2017-Apr is 35.7."}}},
{"id":"n-ed29731e","guard":[["hasAny",["2002jan","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2002-Jan":"The gmsl smoothed of 2002-Jan is -16.2."}}},
{"id":"n-ef778b73","guard":[["hasAny",["1999feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 1999-Feb":"The gmsl smoothed of 1999-Feb is -26.1."}}},
{"id":"n-f2957552","guard":[["hasAny",["2010nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2010-Nov":"The gmsl smoothed of 2010-Nov is 12.5."}}},
{"id":"n-f55b6433","guard":[["hasAny",["2009mar","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 2009-Mar":"The gmsl smoothed of 2009-Mar is 2.6."}}},
{"id":"n-f6a38d83","guard":[["hasAny",["2013apr","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2013-Apr":"The gmsl smoothed of 2013-Apr is 19."}}},
{"id":"n-f7d6c903","guard":[["hasAny",["1995jun","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 1995-Jun":"The gmsl smoothed of 1995-Jun is -47.4."}}},
{"id":"n-f8c298da","guard":[["hasAny",["2015feb","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl smoothed of 2015-Feb":"The gmsl smoothed of 2015-Feb is 30.1."}}},
{"id":"n-ff2f87d0","guard":[["hasAny",["2016nov","gmsl","smoothed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl smoothed of 2016-Nov":"The gmsl smoothed of 2016-Nov is 44.1."}}},
{"id":"n-ff704d97","guard":[["hasAny",["1997jul","gmsl","smoothed"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl smoothed of 1997-Jul":"The gmsl smoothed of 1997-Jul is -30.9."}}},
{"id":"n-02f96e4d","guard":[["hasAny",["2010oct","convert to base","in base","in binary","in octal","to binary","to hex"]],["has","what"]],"pyramid":["render.str",["compute.toBase",["sense.wordCount"],{"lit":5}]],"mem":null},
{"id":"n-10926eec","guard":[["hasAny",["2008sep","next prime","smallest prime greater than","the prime after"]],["has","give"]],"pyramid":["render.listNums",["iterate.digits",["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-15e5f713","guard":[["hasAny",["2011feb","all divisors","all factors"]],["nums==",1],["has","what"]],"pyramid":["render.listNums",["iterate.diffs",["compute.divisors",["sense.wordCount"]]]],"mem":null},
{"id":"n-1a7016c4","guard":[["hasAny",["2007jun","negate","negative","opposite","sum of divisors","sum of factors","sum of the divisors"]],["has","tell"]],"pyramid":["render.number",["transform.neg",["compute.divisorSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-1a9ceb99","guard":[["hasAny",["2013dec","nth prime","the prime number in position","two times"]],["has","give"]],"pyramid":["render.number",["transform.double",["compute.nthPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-1b0d5f61","guard":[["hasAny",["2010oct","left over","mod","modulo","remainder"]],["has","what"]],"pyramid":["render.number",["transform.mod",["sense.first"],{"lit":1998}]],"mem":null},
{"id":"n-1c7c2a34","guard":[["hasAny",["2008sep","how many letters","letter count","number of letters"]],["has","give"]],"pyramid":["render.number",["aggregate.letters",["sense.before",{"lit":"gmsl"}]]],"mem":null},
{"id":"n-1d174c96","guard":[["hasAny",["2009mar","log base","logarithm"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.log",["sense.wordCount"],{"lit":2}]],"mem":null},
{"id":"n-1eb949ae","guard":[["hasAny",["2020jun","growth rate","percent change","percent decrease","percent increase","percentage change"]],["nums==",1]],"pyramid":["render.number",["compute.percentChange",["sense.first"],{"lit":1000}]],"mem":null},
{"id":"n-21565bba","guard":[["hasAny",["2013apr","nth prime","sum of divisors","sum of factors","sum of the divisors","the prime number in position"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.nthPrime",["compute.divisorSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-2377ac19","guard":[["hasAny",["2018jan","increase by","markup","plus tax","raise by","with tax"]]],"pyramid":["render.number",["compute.increase",{"lit":2},["sense.first"]]],"mem":null},
{"id":"n-254b6720","guard":[["hasAny",["2008sep","negate","negative","next prime","opposite","smallest prime greater than","the prime after"]],["has","give"]],"pyramid":["render.number",["transform.neg",["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-2e142f0c","guard":[["hasAny",["2006dec","take away"]],["has","tell"]],"pyramid":["render.number",["transform.sub",{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-35362323","guard":[["hasAny",["2006dec","divisor count","how many factors","negate","negative","number of divisors","opposite"]],["has","tell"]],"pyramid":["render.number",["transform.neg",["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-3b05b9be","guard":[["hasAny",["2007dec","cube root","nth root"]],["has","tell"]],"pyramid":["render.number",["compute.root",["sense.wordCount"],{"lit":5}]],"mem":null},
{"id":"n-406ac0f8","guard":[["hasAny",["2016dec","divisor count","double","how many factors","number of divisors","twice","two times"]],["has","give"]],"pyramid":["render.number",["compute.divisorCount",["transform.double",["sense.first"]]]],"mem":null},
{"id":"n-423f4bdd","guard":[["hasAny",["2008sep","changes to turn","edit distance","how many edits","levenshtein"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["sense.lastWord"],{"lit":"smoothed"}]],"mem":null},
{"id":"n-444c8471","guard":[["hasAny",["2004dec","difference","take away"]],["has","smoothed"]],"pyramid":["render.number",["transform.sub",["sense.first"],{"lit":2010}]],"mem":null},
{"id":"n-467ef309","guard":[["hasAny",["2011feb","sum of squares","sum of the squares"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.sumSquares",["iterate.digits",["sense.first"]]]],"mem":null},
{"id":"n-4779f15a","guard":[["hasAny",["2013apr","consonant count","how many consonants","number of consonants","successor"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.next",["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-4b0dbfb6","guard":[["hasAny",["2007nov","increase by","markup","plus tax","raise by","with tax"]],["has","tell"]],"pyramid":["render.number",["compute.increase",{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-4fb990ae","guard":[["hasAny",["2009mar","next prime","root of","smallest prime greater than","sqrt","square root","the prime after"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.sqrt",["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-55d764b2","guard":[["hasAny",["2006sep","how long each","length of each","lengths","population standard deviation","standard deviation","std dev","stdev"]],["has","smoothed"]],"pyramid":["render.number",["aggregate.stdev",["transform.lengths",["sense.words"]]]],"mem":null},
{"id":"n-5aecf276","guard":[["hasAny",["2010oct","one less","predecessor","previous","sum of divisors","sum of factors","sum of the divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-5b06f629","guard":[["hasAny",["2014jun","after a discount","discount","reduced by","sale price"]]],"pyramid":["render.number",["compute.discount",["sense.howMany"],["sense.first"]]],"mem":null},
{"id":"n-5c9a1fd0","guard":[["hasAny",["2011feb","left over","mod","modulo","remainder"]],["nums==",1],["has","what"]],"pyramid":["render.number",["transform.mod",{"lit":1994},["sense.wordCount"]]],"mem":null},
{"id":"n-5db4d425","guard":[["hasAny",["2013apr","left over","mod","modulo","remainder"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.mod",["sense.first"],{"lit":1994}]],"mem":null},
{"id":"n-5e75b4e8","guard":[["hasAny",["2007dec","cube root","nth root","root"]],["has","tell"]],"pyramid":["render.number",["compute.root",["sense.wordCount"],{"lit":5}]],"mem":null},
{"id":"n-633ae56c","guard":[["hasAny",["2008sep","before","divisor count","how many factors","number of divisors","one less","predecessor","previous"]],["has","give"]],"pyramid":["render.number",["transform.prev",["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-6389dc1a","guard":[["hasAny",["2011dec","circumference","perimeter of a circle","root of","sqrt","square root"]],["has","tell"]],"pyramid":["render.number",["compute.circumference",["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-6793206a","guard":[["hasAny",["2016dec","double","sum of the first","triangular number","twice","two times"]],["has","give"]],"pyramid":["render.number",["transform.double",["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-68e5eb6b","guard":[["hasAny",["2013dec","character count","how many characters","no vowels","number of characters","remove vowels","without vowels"]],["has","give"]],"pyramid":["render.number",["aggregate.chars",["transform.noVowels",["sense.text"]]]],"mem":null},
{"id":"n-6b5c062b","guard":[["hasAny",["2009feb","fib","root of","sqrt","square root"]],["has","what"]],"pyramid":["render.number",["compute.sqrt",["compute.fibonacci",["sense.wordCount"]]]],"mem":null},
{"id":"n-6c20f526","guard":[["hasAny",["2011feb","consonant count","divisor count","how many consonants","how many factors","number of consonants","number of divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-6cf966a1","guard":[["hasAny",["2011feb","difference","take away"]],["nums==",1],["has","what"]],"pyramid":["render.number",["transform.sub",["sense.first"],{"lit":2017}]],"mem":null},
{"id":"n-6d148e82","guard":[["hasAny",["2010feb","increase by","markup","plus tax","raise by","with tax"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["sense.wordCount"],["sense.wordCount"]]],"mem":null},
{"id":"n-76e8c410","guard":[["hasAny",["2006sep","prime numbers less than","primes below","primes under","primes up to","sample standard deviation","sample stdev"]],["has","smoothed"]],"pyramid":["render.number",["aggregate.sampleStdev",["compute.primesUpTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-7e6482ff","guard":[["hasAny",["2013feb","half","half of","halve","root of","sqrt","square root"]],["nums==",1],["has","what"]],"pyramid":["render.number",["transform.half",["compute.sqrt",["sense.first"]]]],"mem":null},
{"id":"n-82ed6d54","guard":[["hasAny",["2013apr","difference","take away"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.sub",["sense.first"],{"lit":1994}]],"mem":null},
{"id":"n-8394b27b","guard":[["hasAny",["2008sep","add the digits","digit sum","next prime","smallest prime greater than","sum of the digits","the prime after"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-8486e4f9","guard":[["hasAny",["2006nov","increase by","markup","plus tax","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-868d7a57","guard":[["hasAny",["2013apr","added to"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.add",["sense.wordCount"],{"lit":12}]],"mem":null},
{"id":"n-88298c78","guard":[["hasAny",["2011feb","consonant count","how many consonants","number of consonants"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.consonants",["sense.before",{"lit":"gmsl"}]]],"mem":null},
{"id":"n-8cb9d8e1","guard":[["hasAny",["2008sep","factorise","factorize","how many words","number of words","prime factorisation","prime factorization","word count"]],["has","give"]],"pyramid":["render.listNums",["compute.primeFactors",["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-8d8bbd9a","guard":[["hasAny",["2011feb","how many vowels","number of vowels","vowel count"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.vowels",["transform.base64",["sense.text"]]]],"mem":null},
{"id":"n-94b3be85","guard":[["hasAny",["2012feb","arithmetic mean"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.squares",["sense.wordCount"]]]],"mem":null},
{"id":"n-9ccd0628","guard":[["hasAny",["2016dec","factorise","factorize","lcm of all","least common multiple of the list","prime factorisation","prime factorization"]],["has","give"]],"pyramid":["render.number",["compute.lcmAll",["compute.primeFactors",["sense.first"]]]],"mem":null},
{"id":"n-9cee9354","guard":[["hasAny",["2013apr","added to","more than"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.add",["sense.wordCount"],{"lit":12}]],"mem":null},
{"id":"n-9d66c33c","guard":[["hasAny",["2013apr","after","consonant count","how many consonants","number of consonants","one more","successor"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.next",["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-9dc5fd5b","guard":[["hasAny",["2011feb","how many letters","letter count","number of letters"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.letters",["transform.base64",["sense.numeral"]]]],"mem":null},
{"id":"n-a1b0bc48","guard":[["hasAny",["2011feb","after","divisor count","how many factors","next","number of divisors","one more","successor"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.next",["sense.first"]]]],"mem":null},
{"id":"n-a5869d95","guard":[["hasAny",["2009feb","root of","sqrt","square root","successor"]],["has","what"]],"pyramid":["render.number",["transform.next",["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-a82eb63e","guard":[["hasAny",["2016dec","digits backwards","digits reversed","how many letters","letter count","number of letters","reverse the digits"]],["has","give"]],"pyramid":["render.number",["transform.reverseDigits",["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-a83fa74b","guard":[["hasAny",["2006dec","difference","take away"]],["has","tell"]],"pyramid":["render.number",["transform.sub",{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-aafc188d","guard":[["hasAny",["2016dec","sum of the first","triangular number","two times"]],["has","give"]],"pyramid":["render.number",["transform.double",["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-b3ef3ae4","guard":[["hasAny",["2006sep","how long each","length of each","lengths","population standard deviation","standard deviation","stdev"]],["has","smoothed"]],"pyramid":["render.number",["aggregate.stdev",["transform.lengths",["sense.words"]]]],"mem":null},
{"id":"n-b79ae55e","guard":[["hasAny",["2008sep","divisor count","how many factors","number of divisors","sum of divisors","sum of factors","sum of the divisors"]],["has","give"]],"pyramid":["render.number",["compute.divisorSum",["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-b8897fca","guard":[["hasAny",["2013apr","how many vowels","nth prime","number of vowels","the prime number in position","vowel count"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.nthPrime",["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-be625e60","guard":[["hasAny",["2008sep","add the digits","character count","digit sum","how many characters","number of characters","sum of the digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-bed0fd4a","guard":[["hasAny",["2004dec","add the digits","digit sum","negate","negative","opposite","sum of the digits"]],["has","smoothed"]],"pyramid":["render.number",["transform.neg",["aggregate.digitSum",["sense.first"]]]],"mem":null},
{"id":"n-c0593720","guard":[["hasAny",["2016dec","divisor count","how many factors","number of divisors","twice","two times"]],["has","give"]],"pyramid":["render.number",["compute.divisorCount",["transform.double",["sense.first"]]]],"mem":null},
{"id":"n-c2a850a0","guard":[["hasAny",["2011feb","difference","take away"]],["nums==",1],["has","what"]],"pyramid":["render.number",["transform.sub",{"lit":2017},["sense.first"]]],"mem":null},
{"id":"n-c3392f4c","guard":[["hasAny",["2013apr","consonant count","how many consonants","next prime","number of consonants","smallest prime greater than","the prime after"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.nextPrime",["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-c6e782a3","guard":[["hasAny",["2012feb","arithmetic mean","avg"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.squares",["sense.wordCount"]]]],"mem":null},
{"id":"n-c92d4193","guard":[["hasAny",["2011feb","how many words","number of words","word count"]],["nums==",1]],"pyramid":["render.number",["aggregate.words",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ce2c614f","guard":[["hasAny",["2011aug","hypotenuse","pythagoras","pythagorean"]],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",["sense.wordCount"],{"lit":3}]],"mem":null},
{"id":"n-ce97e361","guard":[["hasAny",["2007jun","how many vowels","negate","negative","number of vowels","opposite","vowel count"]],["has","tell"]],"pyramid":["render.number",["transform.neg",["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-d39a3fe2","guard":[["hasAny",["2013apr","divisor count","how many factors","nth prime","number of divisors","the prime number in position"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.nthPrime",["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-d619e9df","guard":[["hasAny",["2011feb","how many vowels","number of vowels","vowel count"]],["nums==",1]],"pyramid":["render.number",["aggregate.vowels",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-dbca69af","guard":[["hasAny",["2009mar","log base","logarithm"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.log",{"lit":100},["sense.wordCount"]]],"mem":null},
{"id":"n-dcf763fe","guard":[["hasAny",["2010oct","next prime","smallest prime greater than","sum of divisors","sum of factors","sum of the divisors","the prime after"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-e44445a7","guard":[["hasAny",["2013dec","double","nth prime","the prime number in position","twice","two times"]],["has","give"]],"pyramid":["render.number",["transform.double",["compute.nthPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-e7189815","guard":[["hasAny",["2010oct","one less","predecessor","previous","two times"]],["has","what"]],"pyramid":["render.number",["transform.double",["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-e8d9a1f1","guard":[["hasAny",["2013apr","difference","take away"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["transform.sub",{"lit":1994},["sense.first"]]],"mem":null},
{"id":"n-e9f9395d","guard":[["hasAny",["2008sep","how many vowels","number of vowels","one less","predecessor","previous","vowel count"]],["has","give"]],"pyramid":["render.number",["transform.prev",["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-ea9d87b5","guard":[["hasAny",["2010oct","difference","take away"]],["has","what"]],"pyramid":["render.number",["transform.sub",["sense.first"],{"lit":1998}]],"mem":null},
{"id":"n-ee2f076c","guard":[["hasAny",["2011feb","divisor count","how many factors","next","number of divisors","one more","successor"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.next",["sense.first"]]]],"mem":null},
{"id":"n-f06e7deb","guard":[["hasAny",["2011feb","divisor count","how many factors","number of divisors","sum of divisors","sum of factors","sum of the divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.divisorSum",["sense.first"]]]],"mem":null},
{"id":"n-f47aa089","guard":[["hasAny",["2011feb","left over","mod","modulo","remainder"]],["nums==",1],["has","what"]],"pyramid":["render.number",["transform.mod",{"lit":2017},["sense.first"]]],"mem":null},
{"id":"n-f604bc00","guard":[["hasAny",["2014dec","half","half of","halve","root of","sqrt","square root"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.sqrt",["transform.half",["sense.first"]]]],"mem":null},
{"id":"n-f8eab1a1","guard":[["hasAny",["2008sep","add the digits","consonant count","digit sum","how many consonants","number of consonants","sum of the digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-fbf078d2","guard":[["hasAny",["2006sep","sample standard deviation","sample stdev"]],["has","smoothed"]],"pyramid":["render.number",["aggregate.sampleStdev",["iterate.countdown",["sense.wordCount"]]]],"mem":null},
{"id":"n-00077401","guard":[["hasAny",["2010oct","character count","first letters of the name","how many characters","initials","number of characters"]],["has","what"]],"pyramid":["render.number",["aggregate.chars",["transform.initials",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-000cc377","guard":[["hasAny",["2017jan","character count","how many characters","hypotenuse","number of characters","pythagoras","pythagorean"]],["has","tell"]],"pyramid":["render.number",["compute.hypot",{"lit":4},["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-005fdc63","guard":[["hasAny",["2004aug","increase by","markup","negate","negative","opposite","plus tax","raise by","with tax"]],["has","tell"]],"pyramid":["render.number",["compute.increase",["transform.neg",["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-02053220","guard":[["hasAny",["2010oct","divisor count","from base","from binary","from hex","how many divisors","how many factors","in decimal","number of divisors","to decimal"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.fromBase",["sense.numeral"],["sense.wordCount"]]]],"mem":null},
{"id":"n-02540a6a","guard":[["hasAny",["2011feb","add the digits","binomial coefficient","choose","combinations","digit sum","n choose k","sum of the digits","ways to choose"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.choose",["aggregate.digitSum",["sense.first"]],{"lit":2}]],"mem":null},
{"id":"n-03586d41","guard":[["hasAny",["2010oct","added to","divisor count","how many factors","number of divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.add",["sense.first"],{"lit":2002}]]],"mem":null},
{"id":"n-044c0267","guard":[["hasAny",["2016dec","add the digits","binomial coefficient","combinations","digit sum","n choose k","sum of the digits","ways to choose"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["compute.choose",["sense.first"],{"lit":3}]]],"mem":null},
{"id":"n-044f485c","guard":[["hasAny",["2011feb","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",["sense.first"],["sense.wordCount"]]]],"mem":null},
{"id":"n-05806778","guard":[["hasAny",["2010oct","binomial coefficient","combinations","n choose k","next prime","smallest prime greater than","the prime after","ways to choose"]],["has","what"]],"pyramid":["render.number",["compute.choose",{"lit":12},["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-07551e4a","guard":[["hasAny",["2011aug","log","log base","logarithm","twice","two times"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",["transform.double",["sense.first"]],{"lit":3}]],"mem":null},
{"id":"n-076ad565","guard":[["hasAny",["2008sep","how many numbers","number of values"]],["has","give"]],"pyramid":["render.number",["aggregate.count",["iterate.rangeFrom",["sense.first"],{"lit":2002}]]],"mem":null},
{"id":"n-08a17218","guard":[["hasAny",["2006sep","after a discount","area of a circle","area with radius","circle area","reduced by","sale price"]],["has","smoothed"]],"pyramid":["render.number",["compute.discount",{"lit":4},["compute.circleArea",["sense.wordCount"]]]],"mem":null},
{"id":"n-08b8ff9c","guard":[["hasAny",["2011feb","character count","how many characters","length","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",["sense.first"],{"lit":2}]]],"mem":null},
{"id":"n-09733964","guard":[["hasAny",["2010oct","add the digits","digit sum","multiplied by","product of","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.mul",["sense.first"],["sense.wordCount"]]]],"mem":null},
{"id":"n-0a0312fc","guard":[["hasAny",["2007nov","area of a circle","area with radius","circle area","divide","quotient","split"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["transform.div",{"lit":2014},["sense.first"]]]],"mem":null},
{"id":"n-0a7fe3e4","guard":[["hasAny",["2020may","as a percentage","percent is","twice","two times","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":2007},["transform.double",["sense.first"]]]],"mem":null},
{"id":"n-0d2baaf3","guard":[["hasAny",["2011feb","divisor count","how many factors","least common multiple","lowest common multiple","number of divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.lcm",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-0d4267ad","guard":[["hasAny",["2011feb","character count","how many characters","length","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",{"lit":2},["sense.first"]]]],"mem":null},
{"id":"n-0dac5081","guard":[["hasAny",["2008oct","add the digits","after a discount","digit sum","discount","reduced by","sale price","sum of the digits"]],["has","give"]],"pyramid":["render.number",["compute.discount",["aggregate.digitSum",["sense.first"]],{"lit":2}]],"mem":null},
{"id":"n-0ee3d9d9","guard":[["hasAny",["2012mar","log","log base","logarithm","nth prime","the prime number in position"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",["compute.nthPrime",["sense.first"]],{"lit":2}]],"mem":null},
{"id":"n-12075575","guard":[["hasAny",["2011feb","arithmetic mean"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.mean",["iterate.rangeFrom",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-149c48bf","guard":[["hasAny",["2010oct","add the digits","added to","digit sum","more than","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["sense.first"],{"lit":2007}]]],"mem":null},
{"id":"n-166f74ee","guard":[["hasAny",["2002nov","after a discount","negate","negative","opposite","reduced by","sale price"]],["has","what"]],"pyramid":["render.number",["compute.discount",["transform.neg",["sense.wordCount"]],{"lit":5}]],"mem":null},
{"id":"n-16fb04c9","guard":[["hasAny",["2009feb","divisor count","how many factors","log base","logarithm","number of divisors"]],["has","what"]],"pyramid":["render.number",["compute.log",{"lit":12},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-180f5656","guard":[["hasAny",["2009mar","after a discount","halve","reduced by","sale price"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["transform.half",["sense.wordCount"]],{"lit":12}]],"mem":null},
{"id":"n-18b4fc6d","guard":[["hasAny",["2009feb","as a percentage","multiplicative inverse","one over","percent is","reciprocal","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",["transform.reciprocal",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-19b2d194","guard":[["hasAny",["2011aug","area of a circle","area with radius","as a percentage","circle area","percent is","what percent","what percentage"]],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["compute.circleArea",["sense.wordCount"]],{"lit":2017}]],"mem":null},
{"id":"n-19c7d806","guard":[["hasAny",["2013dec","add the digits","digit sum","sum of the digits","take away"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["transform.sub",["sense.wordCount"],{"lit":1994}]]],"mem":null},
{"id":"n-19db99e3","guard":[["hasAny",["2011feb","before","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","one less","predecessor","previous"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.gcd",{"lit":1998},["transform.prev",["sense.first"]]]],"mem":null},
{"id":"n-1aee3aa1","guard":[["hasAny",["2011feb","add the digits","digit sum","left over","mod","modulo","remainder","sum of the digits"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.mod",{"lit":2017},["sense.first"]]]],"mem":null},
{"id":"n-1c57db6c","guard":[["hasAny",["2007nov","area of a circle","area with radius","circle area","divide","quotient","split"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["transform.div",["sense.first"],{"lit":1997}]]],"mem":null},
{"id":"n-1cb4541d","guard":[["hasAny",["2013apr","caesar cipher","consonant count","how many consonants","number of consonants","rotate the letters","shift by","shift each letter"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["aggregate.consonants",["transform.caesar",["sense.text"],{"lit":2010}]]],"mem":null},
{"id":"n-1cfab562","guard":[["hasAny",["2020jun","after a discount","reduced by","root of","sale price","sqrt","square root"]],["nums==",1]],"pyramid":["render.number",["compute.discount",["compute.sqrt",["sense.wordCount"]],{"lit":2010}]],"mem":null},
{"id":"n-1e1fee8e","guard":[["hasAny",["2011feb","left over","mod","modulo","remainder","sum of divisors","sum of factors","sum of the divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["transform.mod",["sense.first"],{"lit":2006}]]],"mem":null},
{"id":"n-1f6e4000","guard":[["hasAny",["2007nov","area of a circle","area with radius","circle area","divide","quotient","split"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["transform.div",{"lit":2010},["sense.first"]]]],"mem":null},
{"id":"n-216ad517","guard":[["hasAny",["2012mar","after years at","compound interest","compounded","grows to"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",{"lit":10},{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-218bb907","guard":[["hasAny",["2010oct","add the digits","digit sum","least common multiple","lowest common multiple","sum of the digits"]],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":12},["aggregate.digitSum",["sense.first"]]]],"mem":null},
{"id":"n-235085ac","guard":[["hasAny",["2009feb","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","what"]],"pyramid":["render.number",["compute.log",["compute.circleArea",["sense.first"]],{"lit":100}]],"mem":null},
{"id":"n-245429cc","guard":[["hasAny",["2011feb","character count","how many characters","length","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",{"lit":5},["sense.first"]]]],"mem":null},
{"id":"n-25004191","guard":[["hasAny",["2011feb","abbreviate","acronym","changes to turn","edit distance","how many edits","levenshtein"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.editDistance",["sense.lastWord"],["transform.acronym",["sense.text"]]]],"mem":null},
{"id":"n-25a81050","guard":[["hasAny",["2008sep","digit count","how many digits","least common multiple","lowest common multiple","number of digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitCount",["compute.lcm",["sense.first"],{"lit":1997}]]],"mem":null},
{"id":"n-266b0792","guard":[["hasAny",["2009mar","log base","logarithm","multiplicative inverse","one over","reciprocal"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.log",{"lit":100},["transform.reciprocal",["sense.wordCount"]]]],"mem":null},
{"id":"n-2680bf17","guard":[["hasAny",["2010oct","add the digits","digit sum","increase by","markup","plus tax","raise by","sum of the digits","with tax"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.increase",["sense.first"],["sense.first"]]]],"mem":null},
{"id":"n-28b3e42a","guard":[["hasAny",["2007nov","population standard deviation","standard deviation","stdev"]],["has","tell"]],"pyramid":["render.number",["aggregate.stdev",["iterate.rangeFrom",["sense.first"],{"lit":1997}]]],"mem":null},
{"id":"n-28bb008b","guard":[["hasAny",["2011feb","consonant count","how many consonants","lowest terms","number of consonants","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.str",["compute.fraction",["aggregate.consonants",["sense.text"]],{"lit":3}]],"mem":null},
{"id":"n-29d55f4b","guard":[["hasAny",["2006nov","increase by","markup","plus tax","raise by","root of","sqrt","square root","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",{"lit":2},["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-2ad354a5","guard":[["hasAny",["2008sep","after a discount","discount","divisor count","how many factors","number of divisors","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",["compute.divisorCount",["sense.first"]],{"lit":12}]],"mem":null},
{"id":"n-2c0853c8","guard":[["hasAny",["2008sep","after a discount","fib","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",["compute.fibonacci",["sense.wordCount"]],{"lit":12}]],"mem":null},
{"id":"n-2c4991b4","guard":[["hasAny",["2016dec","least common multiple","lowest common multiple","next prime","smallest prime greater than","the prime after"]],["has","give"]],"pyramid":["render.number",["compute.lcm",["sense.wordCount"],["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-2d8cf869","guard":[["hasAny",["2007dec","interest earned","simple interest"]],["has","tell"]],"pyramid":["render.number",["compute.interest",["sense.wordCount"],["sense.wordCount"],{"lit":3}]],"mem":null},
{"id":"n-2dcc6b81","guard":[["hasAny",["2006sep","as a percentage","percent is","root of","sqrt","square root","what percent","what percentage"]],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["sense.howMany"],["compute.sqrt",["sense.first"]]]],"mem":null},
{"id":"n-2eb7d6ff","guard":[["hasAny",["2011feb","how many vowels","number of vowels","sum of divisors","sum of factors","sum of the divisors","vowel count"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["aggregate.vowels",["sense.after",{"lit":"gmsl"}]]]],"mem":null},
{"id":"n-2f09fc9b","guard":[["hasAny",["2010oct","added to","divisor count","how many factors","number of divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.add",["sense.first"],{"lit":10}]]],"mem":null},
{"id":"n-2f6cab66","guard":[["hasAny",["2011feb","difference","divisor count","how many factors","number of divisors","subtract","take away"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.sub",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-2f7853ac","guard":[["hasAny",["2010oct","area of a triangle","divisor count","half base times height","how many factors","number of divisors","triangle area"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.triangleArea",["sense.first"],{"lit":5}]]],"mem":null},
{"id":"n-2f80ca93","guard":[["hasAny",["2008oct","after a discount","reduced by","root of","sale price","sqrt","square root"]],["has","give"]],"pyramid":["render.number",["compute.discount",{"lit":10},["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-3209e399","guard":[["hasAny",["2008sep","add the digits","added to","digit sum","sum of the digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["sense.first"],{"lit":2013}]]],"mem":null},
{"id":"n-326f21c3","guard":[["hasAny",["2008sep","binomial coefficient","combinations","digit count","how many digits","n choose k","number of digits","ways to choose"]],["has","give"]],"pyramid":["render.number",["aggregate.digitCount",["compute.choose",{"lit":2010},["sense.first"]]]],"mem":null},
{"id":"n-33056d99","guard":[["hasAny",["2011feb","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",["sense.first"],{"lit":5}]]],"mem":null},
{"id":"n-331d1527","guard":[["hasAny",["2001may","after a discount","reduced by","root of","sale price","sqrt","square root"]],["has","give"]],"pyramid":["render.number",["compute.discount",["compute.sqrt",["sense.wordCount"]],{"lit":1000}]],"mem":null},
{"id":"n-331d8907","guard":[["hasAny",["2016dec","arithmetic mean","avg"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-33907d14","guard":[["hasAny",["2008sep","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["has","give"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",["sense.first"],{"lit":1000}]]],"mem":null},
{"id":"n-3413bdfa","guard":[["hasAny",["2018jan","increase by","markup","next","one more","plus tax","raise by","successor","with tax"]]],"pyramid":["render.number",["compute.increase",{"lit":2},["transform.next",["sense.first"]]]],"mem":null},
{"id":"n-349ec2f0","guard":[["hasAny",["2011aug","circumference","cube root","nth root","perimeter of a circle"]],["has","smoothed"]],"pyramid":["render.number",["compute.circumference",["compute.root",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-3564a079","guard":[["hasAny",["2009feb","halve","hypotenuse","pythagoras","pythagorean"]],["has","what"]],"pyramid":["render.number",["compute.hypot",["sense.howMany"],["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-35f18387","guard":[["hasAny",["2011feb","added to","divisor count","how many factors","number of divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.add",["sense.wordCount"],{"lit":2002}]]],"mem":null},
{"id":"n-36386fb2","guard":[["hasAny",["2011feb","left over","mod","modulo","remainder","sum of divisors","sum of factors","sum of the divisors"]],["has","what"],["has","is"]],"pyramid":["render.number",["compute.divisorSum",["transform.mod",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-372d0014","guard":[["hasAny",["2011feb","consonant count","factorial","how many consonants","n factorial","number of consonants"]],["has","what"]],"pyramid":["render.number",["compute.factorial",["aggregate.consonants",["sense.after",{"lit":"smoothed"}]]]],"mem":null},
{"id":"n-378aeb37","guard":[["hasAny",["2011feb","difference","minus","subtract","sum of divisors","sum of factors","sum of the divisors","take away"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["transform.sub",["sense.first"],{"lit":2006}]]],"mem":null},
{"id":"n-37f9163e","guard":[["hasAny",["2011feb","added to","divisor count","how many factors","number of divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.add",["sense.first"],{"lit":12}]]],"mem":null},
{"id":"n-3829a61f","guard":[["hasAny",["2007nov","after a discount","halve","reduced by","sale price"]],["has","tell"]],"pyramid":["render.number",["compute.discount",["transform.half",["sense.wordCount"]],{"lit":10}]],"mem":null},
{"id":"n-382a960a","guard":[["hasAny",["2013apr","changes to turn","edit distance","how many edits","levenshtein"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.editDistance",["sense.after",{"lit":"gmsl"}],{"lit":"gmsl"}]],"mem":null},
{"id":"n-38eacbf8","guard":[["hasAny",["2009feb","after a discount","next prime","reduced by","sale price","smallest prime greater than","the prime after"]],["has","what"]],"pyramid":["render.number",["compute.discount",{"lit":4},["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-399f4c11","guard":[["hasAny",["2011feb","character count","how many characters","length","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",["sense.first"],{"lit":3}]]],"mem":null},
{"id":"n-3a866845","guard":[["hasAny",["2006sep","after years at","compound interest","compounded","grows to"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["sense.howMany"],{"lit":12},["sense.wordCount"]]],"mem":null},
{"id":"n-3b9380ba","guard":[["hasAny",["2010oct","arithmetic mean"]],["has","what"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-3bd29cf5","guard":[["hasAny",["2008sep","log","log base","logarithm","nth prime","the prime number in position"]],["has","give"]],"pyramid":["render.number",["compute.log",["compute.nthPrime",["sense.first"]],{"lit":4}]],"mem":null},
{"id":"n-3c54d207","guard":[["hasAny",["2013apr","consonant count","how many consonants","number of consonants"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["aggregate.consonants",["transform.base64",["sense.after",{"lit":"gmsl"}]]]],"mem":null},
{"id":"n-3cfc35b7","guard":[["hasAny",["2008sep","area of a triangle","digit count","half base times height","how many digits","number of digits","triangle area"]],["has","give"]],"pyramid":["render.number",["aggregate.digitCount",["compute.triangleArea",["sense.first"],["sense.first"]]]],"mem":null},
{"id":"n-3d1d8f60","guard":[["hasAny",["2006sep","area of a circle","area with radius","circle area","percent of","percentage of"]],["has","smoothed"]],"pyramid":["render.number",["compute.circleArea",["compute.percentOf",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-3d2b434e","guard":[["hasAny",["2008sep","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["has","give"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",{"lit":1000},["sense.first"]]]],"mem":null},
{"id":"n-3d9c77ba","guard":[["hasAny",["2011feb","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",{"lit":5},["sense.first"]]]],"mem":null},
{"id":"n-3da06ba3","guard":[["hasAny",["2010oct","character count","how many characters","length","number of characters","sum of divisors","sum of factors","sum of the divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["aggregate.chars",["sense.before",{"lit":"gmsl"}]]]],"mem":null},
{"id":"n-3e709ef4","guard":[["hasAny",["2011feb","consonant count","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","how many consonants","number of consonants"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.gcd",{"lit":2010},["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-3f6d9bba","guard":[["hasAny",["2008sep","digit count","how many digits","least common multiple","lowest common multiple","number of digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitCount",["compute.lcm",["sense.first"],{"lit":1994}]]],"mem":null},
{"id":"n-40a1d932","guard":[["hasAny",["2010oct","alphabetize the letters","from base","from binary","from hex","in decimal","letters in order","sort the letters","to decimal"]],["has","what"]],"pyramid":["render.number",["compute.fromBase",["transform.sortLetters",["sense.numeral"]],{"lit":10}]],"mem":null},
{"id":"n-40e8eb9a","guard":[["hasAny",["2006nov","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","what"]],"pyramid":["render.number",["compute.log",["compute.circleArea",["sense.first"]],{"lit":2014}]],"mem":null},
{"id":"n-423fd1d0","guard":[["hasAny",["2006sep","add the digits","digit sum","log","log base","logarithm","sum of the digits"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",{"lit":100},["aggregate.digitSum",["sense.first"]]]],"mem":null},
{"id":"n-42ad6792","guard":[["hasAny",["2017apr","as a percentage","percent is","sum of the first","triangular number","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-42f57d4a","guard":[["hasAny",["2013dec","how many letters","hypotenuse","letter count","number of letters","pythagoras","pythagorean"]],["has","give"]],"pyramid":["render.number",["compute.hypot",{"lit":10},["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-43e15964","guard":[["hasAny",["2010feb","hypotenuse","pythagoras","pythagorean","root of","sqrt","square root"]],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",["sense.wordCount"],["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-44251673","guard":[["hasAny",["2012mar","increase by","markup","plus tax","raise by","two times","with tax"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["transform.double",["sense.wordCount"]],["sense.howMany"]]],"mem":null},
{"id":"n-467f62d3","guard":[["hasAny",["2013jun","hypotenuse","nth prime","pythagoras","pythagorean","the prime number in position"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":2},["compute.nthPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-46b7a441","guard":[["hasAny",["2011feb","divisor count","how many factors","lowest terms","number of divisors","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.str",["compute.fraction",{"lit":12},["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-46bd74db","guard":[["hasAny",["2010oct","binomial coefficient","combinations","digit count","how many digits","n choose k","number of digits","ways to choose"]],["has","what"]],"pyramid":["render.number",["aggregate.digitCount",["compute.choose",{"lit":2014},["sense.first"]]]],"mem":null},
{"id":"n-47afa067","guard":[["hasAny",["2006nov","circumference","log","log base","logarithm","perimeter of a circle"]],["has","what"]],"pyramid":["render.number",["compute.log",["compute.circumference",["sense.first"]],{"lit":100}]],"mem":null},
{"id":"n-47d4b982","guard":[["hasAny",["2010oct","area of a triangle","divisor count","half base times height","how many factors","number of divisors","triangle area"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.triangleArea",["sense.first"],{"lit":3}]]],"mem":null},
{"id":"n-47ea02b4","guard":[["hasAny",["2011feb","binomial coefficient","combinations","divisor count","how many divisors","how many factors","n choose k","number of divisors","ways to choose"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.choose",{"lit":4},["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-48a24ec6","guard":[["hasAny",["2011feb","days in the month","divisor count","how many days in","how many factors","length of the month","number of divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.daysInMonth",["sense.first"],{"lit":2}]]],"mem":null},
{"id":"n-49bf2655","guard":[["hasAny",["2013jun","as a percentage","cube","cubed","percent is","to the third power","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",["transform.cube",["sense.wordCount"]],{"lit":2002}]],"mem":null},
{"id":"n-49e5c3a6","guard":[["hasAny",["2010oct","divisor count","from base","from binary","from hex","how many divisors","how many factors","in decimal","number of divisors","to decimal"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.fromBase",["sense.numeral"],{"lit":4}]]],"mem":null},
{"id":"n-4b47f020","guard":[["hasAny",["2016nov","after a discount","reduced by","sale price","to the second power"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["transform.square",["sense.wordCount"]],{"lit":10}]],"mem":null},
{"id":"n-4bfef873","guard":[["hasAny",["2010oct","add the digits","added to","digit sum","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["sense.first"],{"lit":2007}]]],"mem":null},
{"id":"n-4c7d08b5","guard":[["hasAny",["2011feb","digit count","how many digits","least common multiple","lowest common multiple","number of digits"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.digitCount",["compute.lcm",["sense.first"],{"lit":100}]]],"mem":null},
{"id":"n-4db344ef","guard":[["hasAny",["2011feb","divisor count","how many factors","least common multiple","lowest common multiple","number of divisors"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":3},["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-4de6b95f","guard":[["hasAny",["2006nov","interest earned","simple interest"]],["has","what"]],"pyramid":["render.number",["compute.interest",["sense.wordCount"],{"lit":3},{"lit":10}]],"mem":null},
{"id":"n-4eaa2569","guard":[["hasAny",["2011feb","all divisors","all factors","as text","as words","written out"]],["nums==",1],["has","what"]],"pyramid":["render.and",["transform.asText",["iterate.diffs",["compute.divisors",["sense.wordCount"]]]]],"mem":null},
{"id":"n-4f44f7e9","guard":[["hasAny",["2011feb","abbreviate","acronym","changes to turn","edit distance","how many edits","levenshtein","short form"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.editDistance",["sense.numeral"],["transform.acronym",["sense.text"]]]],"mem":null},
{"id":"n-51d95128","guard":[["hasAny",["2008sep","left over","mod","modulo","remainder","sum of divisors","sum of factors","sum of the divisors"]],["has","give"]],"pyramid":["render.number",["compute.divisorSum",["transform.mod",["sense.first"],["sense.wordCount"]]]],"mem":null},
{"id":"n-52571446","guard":[["hasAny",["2010nov","halve","hypotenuse","pythagoras","pythagorean"]],["has","tell"]],"pyramid":["render.number",["compute.hypot",{"lit":12},["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-538c5532","guard":[["hasAny",["2008sep","binomial coefficient","combinations","n choose k","next prime","smallest prime greater than","the prime after","ways to choose"]],["has","give"]],"pyramid":["render.number",["compute.choose",["compute.nextPrime",["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-540a6861","guard":[["hasAny",["2006sep","divisor count","how many factors","hypotenuse","number of divisors","pythagoras","pythagorean"]],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",["sense.howMany"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-548cc22b","guard":[["hasAny",["2010oct","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","twice","two times"]],["has","what"]],"pyramid":["render.number",["compute.gcd",{"lit":12},["transform.double",["sense.first"]]]],"mem":null},
{"id":"n-54b3b48d","guard":[["hasAny",["2008sep","digit count","how many digits","least common multiple","lowest common multiple","number of digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitCount",["compute.lcm",["sense.first"],{"lit":2007}]]],"mem":null},
{"id":"n-5544a7c3","guard":[["hasAny",["2006nov","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","what"]],"pyramid":["render.number",["compute.log",["compute.circleArea",["sense.first"]],{"lit":2010}]],"mem":null},
{"id":"n-55782b37","guard":[["hasAny",["2013apr","character count","how many characters","no vowels","number of characters","remove vowels","without vowels"]],["has","smoothed"]],"pyramid":["render.number",["aggregate.chars",["transform.noVowels",["sense.before",{"lit":"of"}]]]],"mem":null},
{"id":"n-56f3d8f6","guard":[["hasAny",["2011aug","after years at","compound interest","compounded","grows to"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":2},{"lit":4}]],"mem":null},
{"id":"n-570d7a98","guard":[["hasAny",["2008sep","count","how many numbers","number of values"]],["has","give"]],"pyramid":["render.number",["aggregate.count",["iterate.rangeFrom",["sense.first"],{"lit":2014}]]],"mem":null},
{"id":"n-579ae23e","guard":[["hasAny",["2008sep","as text","as words","next prime","smallest prime greater than","the prime after","written out"]],["has","give"]],"pyramid":["render.and",["transform.asText",["iterate.digits",["compute.nextPrime",["sense.wordCount"]]]]],"mem":null},
{"id":"n-579b4e11","guard":[["hasAny",["2007nov","area of a circle","area with radius","circle area","divide","quotient","split"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["transform.div",["sense.first"],{"lit":2002}]]],"mem":null},
{"id":"n-585cb8f0","guard":[["hasAny",["2009mar","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.circleArea",["compute.log",{"lit":1000},["sense.first"]]]],"mem":null},
{"id":"n-587618cc","guard":[["hasAny",["2011feb","add the digits","digit sum","goes into","how many whole times","integer division","sum of the digits","whole division"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.idiv",["sense.first"],{"lit":5}]]],"mem":null},
{"id":"n-599d970b","guard":[["hasAny",["2010oct","add the digits","arrangements","digit sum","ordered selections","permutations","sum of the digits","ways to arrange"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.permutations",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-5a295b09","guard":[["hasAny",["2007nov","area of a circle","area with radius","circle area","divide","quotient","split"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["transform.div",["sense.first"],{"lit":1998}]]],"mem":null},
{"id":"n-5cd65471","guard":[["hasAny",["2008sep","after a discount","how many vowels","number of vowels","reduced by","sale price","vowel count"]],["has","give"]],"pyramid":["render.number",["compute.discount",["aggregate.vowels",["sense.text"]],{"lit":12}]],"mem":null},
{"id":"n-5d1b6fcc","guard":[["hasAny",["2007nov","after years at","compound interest","compounded","grows to"]],["has","tell"]],"pyramid":["render.number",["compute.compound",{"lit":2},["sense.wordCount"],["sense.wordCount"]]],"mem":null},
{"id":"n-5d4f580e","guard":[["hasAny",["2008sep","count","how many numbers","number of values"]],["has","give"]],"pyramid":["render.number",["aggregate.count",["iterate.rangeFrom",["sense.first"],{"lit":2002}]]],"mem":null},
{"id":"n-5dec9da4","guard":[["hasAny",["2011feb","how many numbers","number of values"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.count",["iterate.rangeFrom",["sense.first"],{"lit":2006}]]],"mem":null},
{"id":"n-5f1d8e8a","guard":[["hasAny",["2008sep","add the digits","added to","digit sum","sum of the digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["sense.first"],["sense.wordCount"]]]],"mem":null},
{"id":"n-5fa9fa5b","guard":[["hasAny",["2007feb","after a discount","area of a circle","area with radius","circle area","reduced by","sale price"]],["has","what"],["not",["has","2010mar"]]],"pyramid":["render.number",["compute.discount",{"lit":12},["compute.circleArea",["sense.wordCount"]]]],"mem":null},
{"id":"n-603bbbcf","guard":[["hasAny",["2011feb","add the digits","added to","digit sum","sum of the digits"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["sense.first"],{"lit":2}]]],"mem":null},
{"id":"n-6064fb4c","guard":[["hasAny",["2008sep","add the digits","added to","digit sum","more than","sum of the digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["sense.first"],{"lit":2013}]]],"mem":null},
{"id":"n-60bfd69a","guard":[["hasAny",["2010feb","increase by","markup","negate","negative","opposite","plus tax","raise by","with tax"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["transform.neg",["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-60c6ea5e","guard":[["hasAny",["2007nov","after a discount","character count","how many characters","number of characters","reduced by","sale price"]],["has","tell"]],"pyramid":["render.number",["compute.discount",{"lit":5},["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-649c2601","guard":[["hasAny",["2011feb","as a percentage","divisor count","how many factors","number of divisors","percent is","what percent","what percentage"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.asPercent",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-65276e68","guard":[["hasAny",["2011feb","log","log base","logarithm","twice","two times"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.log",["transform.double",["sense.first"]],{"lit":4}]],"mem":null},
{"id":"n-65a85db6","guard":[["hasAny",["2008sep","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","sum of the first","triangular number"]],["has","give"]],"pyramid":["render.number",["compute.gcd",{"lit":2002},["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-6642088e","guard":[["hasAny",["2010oct","add the digits","area of a triangle","digit sum","half base times height","sum of the digits","triangle area"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.triangleArea",["sense.first"],{"lit":2006}]]],"mem":null},
{"id":"n-66e19eb0","guard":[["hasAny",["2007nov","population standard deviation","standard deviation","std dev","stdev"]],["has","tell"]],"pyramid":["render.number",["aggregate.stdev",["iterate.rangeFrom",["sense.first"],{"lit":1997}]]],"mem":null},
{"id":"n-66eac972","guard":[["hasAny",["2010oct","add the digits","digit sum","growth rate","percent change","percent decrease","percent increase","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.percentChange",{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-6724bfa2","guard":[["hasAny",["2002nov","after a discount","negate","negative","opposite","reduced by","sale price"]],["has","what"]],"pyramid":["render.number",["compute.discount",["transform.neg",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-68206af2","guard":[["hasAny",["2011aug","after years at","compound interest","compounded","grows to"]],["has","smoothed"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":3},{"lit":3}]],"mem":null},
{"id":"n-69ba7f05","guard":[["hasAny",["2012feb","after years at","compound interest","compounded","grows to"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":12},{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-69f371ef","guard":[["hasAny",["2007nov","how many vowels","increase by","markup","number of vowels","plus tax","raise by","vowel count","with tax"]],["has","tell"]],"pyramid":["render.number",["compute.increase",{"lit":3},["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-6ae494fa","guard":[["hasAny",["2006nov","area of a circle","area with radius","circle area","log base","logarithm"]],["has","what"]],"pyramid":["render.number",["compute.circleArea",["compute.log",{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-6b455574","guard":[["hasAny",["2011feb","character count","how many characters","length","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",{"lit":4},["sense.first"]]]],"mem":null},
{"id":"n-6b6cbdb4","guard":[["hasAny",["2020jun","increase by","markup","plus tax","raise by","to the second power","with tax"]],["nums==",1]],"pyramid":["render.number",["compute.increase",["transform.square",["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-6b8e0801","guard":[["hasAny",["2008sep","digit count","how many digits","least common multiple","lowest common multiple","number of digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitCount",["compute.lcm",["sense.first"],{"lit":2017}]]],"mem":null},
{"id":"n-6bbe29a5","guard":[["hasAny",["2007dec","how many vowels","log base","logarithm","number of vowels","vowel count"]],["has","tell"]],"pyramid":["render.number",["compute.log",["aggregate.vowels",["sense.text"]],{"lit":4}]],"mem":null},
{"id":"n-6c456152","guard":[["hasAny",["2006sep","circumference","log base","logarithm","perimeter of a circle"]],["has","smoothed"]],"pyramid":["render.number",["compute.circumference",["compute.log",{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-6d17ae25","guard":[["hasAny",["2013jun","area of a circle","area with radius","circle area","quotient"]],["has","what"]],"pyramid":["render.number",["compute.circleArea",["transform.div",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-6d89b862","guard":[["hasAny",["2013apr","changes to turn","edit distance","how many edits","levenshtein"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.editDistance",["sense.after",{"lit":"gmsl"}],{"lit":"-26.1"}]],"mem":null},
{"id":"n-6dd0cd92","guard":[["hasAny",["2008oct","circumference","cube root","nth root","perimeter of a circle"]],["has","give"]],"pyramid":["render.number",["compute.circumference",["compute.root",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-6e7dad80","guard":[["hasAny",["2010oct","add the digits","digit sum","least common multiple","lowest common multiple","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.lcm",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-6e81fa87","guard":[["hasAny",["2010oct","add the digits","digit sum","from base","from binary","from hex","in decimal","sum of the digits","to decimal"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.fromBase",["sense.numeral"],{"lit":5}]]],"mem":null},
{"id":"n-6f2393c1","guard":[["hasAny",["2010oct","how many letters","letter count","number of letters"]],["has","what"]],"pyramid":["render.number",["aggregate.letters",["transform.base64",["sense.after",{"lit":"smoothed"}]]]],"mem":null},
{"id":"n-6f350712","guard":[["hasAny",["2008sep","after years at","compound interest","compounded","grows to"]],["has","give"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":4},{"lit":4}]],"mem":null},
{"id":"n-6fb8b7de","guard":[["hasAny",["2016nov","circumference","hypotenuse","perimeter of a circle","pythagoras","pythagorean"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",{"lit":3},["compute.circumference",["sense.wordCount"]]]],"mem":null},
{"id":"n-71c8a479","guard":[["hasAny",["2011feb","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",{"lit":4},["sense.first"]]]],"mem":null},
{"id":"n-72674ebe","guard":[["hasAny",["2011feb","caesar cipher","how many vowels","number of vowels","rotate the letters","shift by","shift each letter","vowel count"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.vowels",["transform.caesar",["sense.text"],{"lit":2017}]]],"mem":null},
{"id":"n-729400df","guard":[["hasAny",["2010oct","add the digits","after a discount","digit sum","discount","reduced by","sale price","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.discount",{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-742e5c12","guard":[["hasAny",["2008sep","add the digits","digit sum","divide","per","quotient","split","sum of the digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["transform.div",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-757ef25e","guard":[["hasAny",["2007nov","area of a circle","area with radius","as a percentage","circle area","percent is","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":5},["compute.circleArea",["sense.wordCount"]]]],"mem":null},
{"id":"n-75d25299","guard":[["hasAny",["2006sep","as a percentage","percent is","root of","sqrt","square root","what percent","what percentage"]],["has","smoothed"]],"pyramid":["render.number",["compute.asPercent",["compute.sqrt",["sense.first"]],{"lit":1994}]],"mem":null},
{"id":"n-76d20092","guard":[["hasAny",["2008sep","add the digits","digit sum","least common multiple","lowest common multiple","sum of the digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["compute.lcm",["sense.first"],{"lit":100}]]],"mem":null},
{"id":"n-774fc6ed","guard":[["hasAny",["2013apr","character count","how many characters","length","no vowels","number of characters","remove vowels","without vowels"]],["has","smoothed"]],"pyramid":["render.number",["aggregate.chars",["transform.noVowels",["sense.before",{"lit":"of"}]]]],"mem":null},
{"id":"n-78af2751","guard":[["hasAny",["2011feb","divisor count","how many factors","left over","mod","modulo","number of divisors","remainder"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.mod",{"lit":2007},["sense.first"]]]],"mem":null},
{"id":"n-79a8a249","guard":[["hasAny",["2010nov","as a percentage","divisor count","how many factors","number of divisors","percent is","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-7a1c33e8","guard":[["hasAny",["2008sep","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","next","one more","successor"]],["has","give"]],"pyramid":["render.number",["compute.gcd",{"lit":2002},["transform.next",["sense.first"]]]],"mem":null},
{"id":"n-7a2b5d7a","guard":[["hasAny",["2007dec","log base","logarithm","next prime","smallest prime greater than","the prime after"]],["has","tell"]],"pyramid":["render.number",["compute.log",["compute.nextPrime",["sense.wordCount"]],{"lit":5}]],"mem":null},
{"id":"n-7a5684f1","guard":[["hasAny",["2007nov","increase by","markup","plus tax","raise by","sum of divisors","sum of factors","sum of the divisors","with tax"]],["has","tell"]],"pyramid":["render.number",["compute.increase",{"lit":3},["compute.divisorSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-7a865aef","guard":[["hasAny",["2011feb","character count","how many characters","length","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",["sense.first"],{"lit":5}]]],"mem":null},
{"id":"n-7c19b461","guard":[["hasAny",["2011feb","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",{"lit":3},["sense.first"]]]],"mem":null},
{"id":"n-7ca5830e","guard":[["hasAny",["2008sep","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","sum of divisors","sum of factors","sum of the divisors"]],["has","give"]],"pyramid":["render.number",["compute.divisorSum",["compute.gcd",["sense.first"],{"lit":100}]]],"mem":null},
{"id":"n-7cb43968","guard":[["hasAny",["2006sep","how many vowels","log base","logarithm","number of vowels","vowel count"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",{"lit":100},["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-7cd09ba6","guard":[["hasAny",["2007nov","add the digits","digit sum","log","log base","logarithm","sum of the digits"]],["has","tell"]],"pyramid":["render.number",["compute.log",["aggregate.digitSum",["sense.first"]],{"lit":2}]],"mem":null},
{"id":"n-7e9800a9","guard":[["hasAny",["2020may","as a percentage","double","percent is","twice","two times","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":2007},["transform.double",["sense.first"]]]],"mem":null},
{"id":"n-7eecbac8","guard":[["hasAny",["2013jun","as a percentage","cube","cubed","percent is","to the third power","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",["transform.cube",["sense.wordCount"]],{"lit":2010}]],"mem":null},
{"id":"n-7f9292a4","guard":[["hasAny",["2009feb","cubed","log base","logarithm","to the third power"]],["has","what"]],"pyramid":["render.number",["compute.log",["transform.cube",["sense.wordCount"]],{"lit":5}]],"mem":null},
{"id":"n-8036d346","guard":[["hasAny",["2008sep","caesar cipher","how many vowels","number of vowels","rotate the letters","shift by","shift each letter","vowel count"]],["has","give"]],"pyramid":["render.number",["aggregate.vowels",["transform.caesar",["sense.text"],{"lit":2010}]]],"mem":null},
{"id":"n-813e71d4","guard":[["hasAny",["2009mar","divisor count","how many factors","log","log base","logarithm","number of divisors"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.log",["compute.divisorCount",["sense.first"]],{"lit":2}]],"mem":null},
{"id":"n-8143a140","guard":[["hasAny",["2006sep","divisor count","how many factors","increase by","markup","number of divisors","plus tax","raise by","with tax"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["compute.divisorCount",["sense.wordCount"]],{"lit":10}]],"mem":null},
{"id":"n-8145f85b","guard":[["hasAny",["2006sep","add the digits","digit sum","increase by","markup","plus tax","raise by","sum of the digits","with tax"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",{"lit":2},["aggregate.digitSum",["sense.first"]]]],"mem":null},
{"id":"n-8151d314","guard":[["hasAny",["2010oct","add the digits","after a discount","digit sum","reduced by","sale price","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.discount",{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-8194e154","guard":[["hasAny",["2020may","as a percentage","percent is","twice","two times","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":2006},["transform.double",["sense.first"]]]],"mem":null},
{"id":"n-819dfdba","guard":[["hasAny",["2010oct","add the digits","digit sum","least common multiple","lowest common multiple","sum of the digits"]],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":4},["aggregate.digitSum",["sense.first"]]]],"mem":null},
{"id":"n-81a2dfb0","guard":[["hasAny",["2009feb","after a discount","reduced by","sale price","sum of the first","triangular number"]],["has","what"]],"pyramid":["render.number",["compute.discount",{"lit":5},["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-8244c0b9","guard":[["hasAny",["2011feb","add the digits","added to","digit sum","more than","sum of the digits"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["sense.first"],{"lit":2}]]],"mem":null},
{"id":"n-849c5981","guard":[["hasAny",["2006sep","log base","logarithm","next prime","smallest prime greater than","the prime after"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",["compute.nextPrime",["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-85063cca","guard":[["hasAny",["2012apr","increase by","markup","plus tax","raise by","root of","sqrt","square root","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":12},["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-8536bd8c","guard":[["hasAny",["2007feb","after a discount","negate","negative","opposite","reduced by","sale price"]],["has","smoothed"],["nums==",1],["not",["has","me"]]],"pyramid":["render.number",["compute.discount",["transform.neg",["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-854fcf7a","guard":[["hasAny",["2010oct","add the digits","digit sum","increase by","markup","plus tax","raise by","sum of the digits","with tax"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.increase",{"lit":2010},["sense.first"]]]],"mem":null},
{"id":"n-8563666a","guard":[["hasAny",["2008sep","lowest terms","reduce the fraction","simplest form","simplify the fraction","sum of the first","triangular number"]],["has","give"]],"pyramid":["render.str",["compute.fraction",["compute.sumTo",["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-859e60f6","guard":[["hasAny",["2010nov","after a discount","fib","reduced by","sale price"]],["has","tell"]],"pyramid":["render.number",["compute.discount",["compute.fibonacci",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-86207411","guard":[["hasAny",["2006sep","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",["compute.circleArea",["sense.first"]],{"lit":2002}]],"mem":null},
{"id":"n-86516515","guard":[["hasAny",["2011feb","difference between the largest and smallest","spread"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.range",["iterate.rangeFrom",["sense.first"],{"lit":2017}]]],"mem":null},
{"id":"n-87c89f8c","guard":[["hasAny",["2020may","as a percentage","double","percent is","twice","two times","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":2006},["transform.double",["sense.first"]]]],"mem":null},
{"id":"n-87da7d56","guard":[["hasAny",["2008sep","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","sum of divisors","sum of factors","sum of the divisors"]],["has","give"]],"pyramid":["render.number",["compute.divisorSum",["compute.gcd",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-8859ab25","guard":[["hasAny",["2011feb","add the digits","difference","digit sum","sum of the digits","take away"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.sub",["sense.first"],["sense.wordCount"]]]],"mem":null},
{"id":"n-8896ea39","guard":[["hasAny",["2010oct","least common multiple","lowest common multiple","one less","predecessor","previous"]],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":12},["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-88a25c82","guard":[["hasAny",["2011feb","binomial coefficient","combinations","divisor count","how many factors","n choose k","number of divisors","ways to choose"]],["has","what"],["has","is"]],"pyramid":["render.number",["compute.choose",{"lit":4},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-892cea69","guard":[["hasAny",["2011feb","at which position","index of","position of","shortest","shortest one","shortest word"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.indexOf",["sense.text"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-8b602934","guard":[["hasAny",["2011feb","digit count","growth rate","how many digits","number of digits","percent change","percent decrease","percent increase","percentage change"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.digitCount",["compute.percentChange",{"lit":2},["sense.first"]]]],"mem":null},
{"id":"n-8bb02fed","guard":[["hasAny",["2010oct","difference between the largest and smallest","spread"]],["has","what"]],"pyramid":["render.number",["aggregate.range",["iterate.rangeFrom",["sense.first"],{"lit":1998}]]],"mem":null},
{"id":"n-8c5b2949","guard":[["hasAny",["2010oct","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","sum of divisors","sum of factors","sum of the divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["compute.gcd",["sense.first"],{"lit":1998}]]],"mem":null},
{"id":"n-8d371de3","guard":[["hasAny",["2008sep","after years at","compound interest","compounded","grows to"]],["has","give"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-8d55a9db","guard":[["hasAny",["2010oct","add the digits","digit sum","from base","from binary","from hex","in decimal","sum of the digits","to decimal"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.fromBase",["sense.numeral"],{"lit":3}]]],"mem":null},
{"id":"n-8e781844","guard":[["hasAny",["2011feb","after a discount","reduced by","sale price","two times"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.discount",["sense.wordCount"],["transform.double",["sense.wordCount"]]]],"mem":null},
{"id":"n-8e9b7118","guard":[["hasAny",["2010feb","log","log base","logarithm","sum of the first","triangular number"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",["compute.sumTo",["sense.first"]],["sense.wordCount"]]],"mem":null},
{"id":"n-9023a6d9","guard":[["hasAny",["2009feb","halve","increase by","markup","plus tax","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",["transform.half",["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-90833c8d","guard":[["hasAny",["2013jun","as a percentage","cubed","percent is","to the third power","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",["transform.cube",["sense.wordCount"]],{"lit":2010}]],"mem":null},
{"id":"n-9142a083","guard":[["hasAny",["2014jan","as a percentage","percent is","root of","sqrt","square root","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["compute.sqrt",["sense.wordCount"]],{"lit":10}]],"mem":null},
{"id":"n-915264d9","guard":[["hasAny",["2011feb","divisor count","goes into","how many divisors","how many factors","how many whole times","integer division","number of divisors","whole division"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.idiv",["sense.first"],{"lit":100}]]],"mem":null},
{"id":"n-92310517","guard":[["hasAny",["2013dec","add the digits","as a percentage","digit sum","percent is","sum of the digits","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["compute.asPercent",["sense.first"],{"lit":12}]]],"mem":null},
{"id":"n-926ee939","guard":[["hasAny",["2007dec","after a discount","reduced by","sale price","to the second power"]],["has","tell"]],"pyramid":["render.number",["compute.discount",{"lit":3},["transform.square",["sense.wordCount"]]]],"mem":null},
{"id":"n-92754173","guard":[["hasAny",["2006sep","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",["compute.circleArea",["sense.first"]],{"lit":1998}]],"mem":null},
{"id":"n-93376f0f","guard":[["hasAny",["2009mar","after a discount","reduced by","sale price","to the second power"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.discount",{"lit":4},["transform.square",["sense.wordCount"]]]],"mem":null},
{"id":"n-9498df80","guard":[["hasAny",["2008sep","how many numbers","number of values"]],["has","give"]],"pyramid":["render.number",["aggregate.count",["iterate.rangeFrom",["sense.first"],{"lit":2014}]]],"mem":null},
{"id":"n-951b2355","guard":[["hasAny",["2010oct","add the digits","digit sum","multiplied by","product of","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.mul",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-9554be44","guard":[["hasAny",["2009feb","area of a circle","area with radius","circle area","increase by","markup","plus tax","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.circleArea",["compute.increase",["sense.howMany"],["sense.wordCount"]]]],"mem":null},
{"id":"n-95e77271","guard":[["hasAny",["2013dec","at which position","camel case","camelcase","index of","lower camel case","position of"]],["has","give"]],"pyramid":["render.number",["aggregate.indexOf",["transform.camel",["sense.text"]],["sense.lastWord"]]],"mem":null},
{"id":"n-960fe587","guard":[["hasAny",["2010nov","as a percentage","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",["sense.howMany"],["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-9682ea34","guard":[["hasAny",["2009feb","half","half of","halve","log","log base","logarithm"]],["has","what"]],"pyramid":["render.number",["compute.log",["transform.half",["sense.first"]],["sense.wordCount"]]],"mem":null},
{"id":"n-9721cfb9","guard":[["hasAny",["2009mar","after a discount","nth prime","reduced by","sale price","the prime number in position"]],["has","give"],["has","smoothed"]],"pyramid":["render.number",["compute.discount",{"lit":3},["compute.nthPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-996f27aa","guard":[["hasAny",["2011aug","after a discount","character count","how many characters","number of characters","reduced by","sale price"]],["has","smoothed"]],"pyramid":["render.number",["compute.discount",{"lit":12},["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-99d03181","guard":[["hasAny",["2006may","increase by","markup","negate","negative","opposite","plus tax","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",["transform.neg",["sense.wordCount"]],{"lit":12}]],"mem":null},
{"id":"n-99d7bc61","guard":[["hasAny",["2011feb","consonant count","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","how many consonants","number of consonants"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.gcd",{"lit":12},["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-9a001f3c","guard":[["hasAny",["2011feb","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",{"lit":1998},["sense.wordCount"]]]],"mem":null},
{"id":"n-9a2ad3ac","guard":[["hasAny",["2013apr","add the digits","difference","digit sum","sum of the digits","take away"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["aggregate.digitSum",["transform.sub",["sense.wordCount"],{"lit":1997}]]],"mem":null},
{"id":"n-9ac6295f","guard":[["hasAny",["2006sep","circumference","growth rate","percent change","percent decrease","percent increase","percentage change","perimeter of a circle"]],["has","smoothed"]],"pyramid":["render.number",["compute.circumference",["compute.percentChange",["sense.first"],{"lit":2013}]]],"mem":null},
{"id":"n-9aeea7ad","guard":[["hasAny",["2008sep","add the digits","difference","digit sum","sum of the digits","take away"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["transform.sub",["sense.first"],{"lit":3}]]],"mem":null},
{"id":"n-9b1bf1c1","guard":[["hasAny",["2020jun","after a discount","reduced by","root of","sale price","sqrt","square root"]],["nums==",1]],"pyramid":["render.number",["compute.discount",["compute.sqrt",["sense.wordCount"]],{"lit":2007}]],"mem":null},
{"id":"n-9bc7ca54","guard":[["hasAny",["2010oct","add the digits","digit sum","least common multiple","lowest common multiple","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.lcm",["sense.first"],{"lit":2006}]]],"mem":null},
{"id":"n-9bea5832","guard":[["hasAny",["2011aug","how many words","increase by","markup","number of words","plus tax","raise by","with tax","word count"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",["sense.wordCount"],["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-9cb44791","guard":[["hasAny",["2016dec","add the digits","binomial coefficient","choose","combinations","digit sum","n choose k","sum of the digits","ways to choose"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["compute.choose",["sense.first"],{"lit":2013}]]],"mem":null},
{"id":"n-9d739ac0","guard":[["hasAny",["2006nov","log base","logarithm","sum of the first","triangular number"]],["has","what"]],"pyramid":["render.number",["compute.log",["compute.sumTo",["sense.wordCount"]],{"lit":5}]],"mem":null},
{"id":"n-9dd0d905","guard":[["hasAny",["2011feb","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",["sense.first"],{"lit":2}]]],"mem":null},
{"id":"n-9ddad820","guard":[["hasAny",["2009feb","divisor count","how many factors","hypotenuse","number of divisors","pythagoras","pythagorean"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":3},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-9e1ecdd1","guard":[["hasAny",["2007nov","area of a circle","area with radius","circle area","divide","quotient","split"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["transform.div",{"lit":2013},["sense.first"]]]],"mem":null},
{"id":"n-9e5f8517","guard":[["hasAny",["2010oct","add the digits","added to","digit sum","more than","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["sense.first"],{"lit":1998}]]],"mem":null},
{"id":"n-9e9d2cbd","guard":[["hasAny",["2005dec","after a discount","area of a circle","area with radius","circle area","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",{"lit":5},["compute.circleArea",["sense.wordCount"]]]],"mem":null},
{"id":"n-9f845170","guard":[["hasAny",["2015aug","as a percentage","cube","cubed","percent is","to the third power","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",["transform.cube",["sense.wordCount"]],{"lit":1000}]],"mem":null},
{"id":"n-a01d955a","guard":[["hasAny",["2006sep","after a discount","circumference","perimeter of a circle","reduced by","sale price"]],["has","smoothed"]],"pyramid":["render.number",["compute.discount",{"lit":4},["compute.circumference",["sense.wordCount"]]]],"mem":null},
{"id":"n-a03df5ad","guard":[["hasAny",["2011feb","left over","mod","modulo","n factorial","remainder"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.factorial",["transform.mod",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-a2f66cd3","guard":[["hasAny",["2008sep","character count","how many characters","number of characters","sum of divisors","sum of factors","sum of the divisors"]],["has","give"]],"pyramid":["render.number",["compute.divisorSum",["aggregate.chars",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-a309f55f","guard":[["hasAny",["2010oct","added to","divisor count","how many factors","number of divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.add",["sense.wordCount"],{"lit":2013}]]],"mem":null},
{"id":"n-a420d6f2","guard":[["hasAny",["2011feb","difference","divisor count","how many factors","number of divisors","take away"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.sub",["sense.first"],{"lit":2}]]],"mem":null},
{"id":"n-a43bd170","guard":[["hasAny",["2006sep","divisor count","how many factors","increase by","markup","number of divisors","plus tax","raise by","with tax"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",{"lit":2},["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-a74af203","guard":[["hasAny",["2006nov","character count","how many characters","log","log base","logarithm","number of characters"]],["has","what"]],"pyramid":["render.number",["compute.log",["sense.first"],["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-a8591c83","guard":[["hasAny",["2008sep","fib","gcf","greatest common divisor","greatest common factor","hcf","highest common factor"]],["has","give"]],"pyramid":["render.number",["compute.gcd",{"lit":2002},["compute.fibonacci",["sense.first"]]]],"mem":null},
{"id":"n-a9b521ff","guard":[["hasAny",["2006sep","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",["compute.circleArea",["sense.first"]],{"lit":2006}]],"mem":null},
{"id":"n-aa19f22b","guard":[["hasAny",["2010oct","how many vowels","number of vowels","sum of divisors","sum of factors","sum of the divisors","vowel count"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["aggregate.vowels",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-aba7caa4","guard":[["hasAny",["2015aug","as a percentage","cubed","percent is","to the third power","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",["transform.cube",["sense.wordCount"]],{"lit":1000}]],"mem":null},
{"id":"n-abca0d40","guard":[["hasAny",["2008sep","add the digits","digit sum","divide","over","per","quotient","split","sum of the digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitSum",["transform.div",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-acc5e755","guard":[["hasAny",["2015aug","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["compute.log",["sense.first"],{"lit":10}]]],"mem":null},
{"id":"n-acd14900","guard":[["hasAny",["2006sep","after a discount","how many letters","letter count","number of letters","reduced by","sale price"]],["has","smoothed"]],"pyramid":["render.number",["compute.discount",{"lit":3},["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-ad88af0e","guard":[["hasAny",["2006nov","log base","logarithm","sum of the first","triangular number"]],["has","what"]],"pyramid":["render.number",["compute.log",{"lit":1000},["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-ae0a4590","guard":[["hasAny",["2008sep","digit count","how many digits","least common multiple","lowest common multiple","number of digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitCount",["compute.lcm",["sense.first"],{"lit":2013}]]],"mem":null},
{"id":"n-ae8640ab","guard":[["hasAny",["2006nov","divisor count","how many factors","increase by","markup","number of divisors","plus tax","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",["compute.divisorCount",["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-ae9dbfa7","guard":[["hasAny",["2008nov","diagonal","divisor count","how many factors","hypotenuse","number of divisors","pythagoras","pythagorean"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":4},["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-b0d5d387","guard":[["hasAny",["2007nov","log","log base","logarithm","sum of the first","triangular number"]],["has","tell"]],"pyramid":["render.number",["compute.log",["compute.sumTo",["sense.first"]],{"lit":100}]],"mem":null},
{"id":"n-b14800c1","guard":[["hasAny",["2014apr","as a percentage","percent is","to the second power","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["transform.square",["sense.wordCount"]]]],"mem":null},
{"id":"n-b165fe38","guard":[["hasAny",["2011feb","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",["sense.first"],{"lit":3}]]],"mem":null},
{"id":"n-b2d5f408","guard":[["hasAny",["2010nov","as a percentage","how many words","number of words","percent is","what percent","what percentage","word count"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",["sense.howMany"],["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-b3377bd8","guard":[["hasAny",["2008sep","caesar cipher","how many vowels","number of vowels","rotate the letters","shift by","shift each letter","vowel count"]],["has","give"]],"pyramid":["render.number",["aggregate.vowels",["transform.caesar",["sense.text"],{"lit":12}]]],"mem":null},
{"id":"n-b3fadef5","guard":[["hasAny",["2010nov","as a percentage","percent is","sum of divisors","sum of factors","sum of the divisors","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",["sense.howMany"],["compute.divisorSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-b43bf9eb","guard":[["hasAny",["2016dec","goes into","how many whole times","integer division","sum of divisors","sum of factors","sum of the divisors","whole division"]],["has","give"]],"pyramid":["render.number",["compute.divisorSum",["transform.idiv",["sense.first"],{"lit":100}]]],"mem":null},
{"id":"n-b4c6f358","guard":[["hasAny",["2007nov","area of a circle","area with radius","circle area","divide","quotient","split"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["transform.div",{"lit":2017},["sense.first"]]]],"mem":null},
{"id":"n-b4c848ab","guard":[["hasAny",["2006nov","divisor count","how many factors","increase by","markup","number of divisors","plus tax","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",["compute.divisorCount",["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-b74e2b91","guard":[["hasAny",["2010oct","added to","divisor count","how many factors","number of divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.add",["sense.wordCount"],{"lit":1997}]]],"mem":null},
{"id":"n-b988e581","guard":[["hasAny",["2007dec","as a percentage","cubed","percent is","to the third power","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":5},["transform.cube",["sense.wordCount"]]]],"mem":null},
{"id":"n-ba0b950a","guard":[["hasAny",["2011feb","divisor count","exponent","how many factors","number of divisors","raised to","to the power of"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.power",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-ba457d6c","guard":[["hasAny",["2008sep","digit count","how many digits","least common multiple","lowest common multiple","number of digits"]],["has","give"]],"pyramid":["render.number",["aggregate.digitCount",["compute.lcm",["sense.first"],{"lit":2010}]]],"mem":null},
{"id":"n-bcaeae69","guard":[["hasAny",["2010oct","area of a triangle","divisor count","half base times height","how many factors","number of divisors","triangle area"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.triangleArea",["sense.wordCount"],{"lit":2002}]]],"mem":null},
{"id":"n-bdbd9b59","guard":[["hasAny",["2008sep","left over","mod","modulo","remainder","sum of divisors","sum of factors","sum of the divisors"]],["has","give"]],"pyramid":["render.number",["compute.divisorSum",["transform.mod",{"lit":2002},["sense.wordCount"]]]],"mem":null},
{"id":"n-bdf42254","guard":[["hasAny",["2007dec","as a percentage","cube","cubed","percent is","to the third power","what percent","what percentage"]],["has","tell"]],"pyramid":["render.number",["compute.asPercent",{"lit":5},["transform.cube",["sense.wordCount"]]]],"mem":null},
{"id":"n-be1a0c17","guard":[["hasAny",["2011feb","character count","how many characters","length","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",["sense.first"],["sense.wordCount"]]]],"mem":null},
{"id":"n-beb3e20f","guard":[["hasAny",["2010oct","add the digits","digit sum","multiplied by","product of","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.mul",["sense.first"],{"lit":2002}]]],"mem":null},
{"id":"n-c16bde58","guard":[["hasAny",["2017dec","increase by","markup","plus tax","raise by","root of","sqrt","square root","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",["compute.sqrt",["sense.first"]],{"lit":3}]],"mem":null},
{"id":"n-c197f589","guard":[["hasAny",["2010oct","circumference","cube root","nth root","perimeter of a circle"]],["has","what"]],"pyramid":["render.number",["compute.circumference",["compute.root",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-c3e21175","guard":[["hasAny",["2006sep","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","smoothed"]],"pyramid":["render.number",["compute.log",["compute.circleArea",["sense.first"]],{"lit":2007}]],"mem":null},
{"id":"n-c58133cb","guard":[["hasAny",["2006nov","area of a circle","area with radius","circle area","log","log base","logarithm"]],["has","what"]],"pyramid":["render.number",["compute.log",["compute.circleArea",["sense.first"]],{"lit":2013}]],"mem":null},
{"id":"n-c692fc92","guard":[["hasAny",["2013jun","as a percentage","cubed","percent is","to the third power","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",["transform.cube",["sense.wordCount"]],{"lit":2002}]],"mem":null},
{"id":"n-c6d4a5c5","guard":[["hasAny",["2010oct","as a percentage","divisor count","how many factors","number of divisors","percent is","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.asPercent",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-c86d3f9c","guard":[["hasAny",["2010oct","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","sum of divisors","sum of factors","sum of the divisors"]],["has","what"]],"pyramid":["render.number",["compute.gcd",{"lit":12},["compute.divisorSum",["sense.first"]]]],"mem":null},
{"id":"n-c885fa9c","guard":[["hasAny",["2011feb","character count","how many characters","lowest terms","number of characters","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.chars",["compute.fraction",{"lit":2},["sense.first"]]]],"mem":null},
{"id":"n-c8e172a7","guard":[["hasAny",["2011feb","add the digits","area of a triangle","digit sum","half base times height","sum of the digits","triangle area"]],["nums==",1],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["compute.triangleArea",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-cbebf70d","guard":[["hasAny",["2009feb","add the digits","after a discount","digit sum","discount","reduced by","sale price","sum of the digits"]],["has","what"]],"pyramid":["render.number",["compute.discount",{"lit":4},["aggregate.digitSum",["sense.first"]]]],"mem":null},
{"id":"n-cbf0aa8c","guard":[["hasAny",["2011feb","as a percentage","divisor count","how many factors","number of divisors","percent is","what percent","what percentage"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["compute.asPercent",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-cc31eed6","guard":[["hasAny",["2010feb","increase by","markup","plus tax","raise by","to the second power","with tax"]],["has","smoothed"]],"pyramid":["render.number",["compute.increase",{"lit":5},["transform.square",["sense.wordCount"]]]],"mem":null},
{"id":"n-cc39c393","guard":[["hasAny",["2006aug","after a discount","area of a circle","area with radius","circle area","reduced by","sale price"]],["has","tell"]],"pyramid":["render.number",["compute.discount",{"lit":3},["compute.circleArea",["sense.wordCount"]]]],"mem":null},
{"id":"n-cc52c835","guard":[["hasAny",["2007nov","area of a circle","area with radius","circle area","divide","quotient","split"]],["has","tell"]],"pyramid":["render.number",["compute.circleArea",["transform.div",["sense.first"],{"lit":1994}]]],"mem":null},
{"id":"n-ce57f5ed","guard":[["hasAny",["2010oct","add the digits","added to","digit sum","sum of the digits"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["transform.add",["sense.first"],{"lit":1998}]]],"mem":null},
{"id":"n-cf537110","guard":[["hasAny",["2013apr","add the digits","digit sum","sum of the digits","take away"]],["has","tell"],["has","smoothed"]],"pyramid":["render.number",["aggregate.digitSum",["transform.sub",["sense.wordCount"],{"lit":1997}]]],"mem":null},
{"id":"n-cfdd6772","guard":[["hasAny",["2009feb","sample standard deviation","sample stdev"]],["has","what"]],"pyramid":["render.number",["aggregate.sampleStdev",["iterate.rangeFrom",["sense.first"],{"lit":1998}]]],"mem":null},
{"id":"n-d0ba48ed","guard":[["hasAny",["2011feb","divisor count","how many factors","multiplied by","number of divisors","product of"]],["nums==",1],["has","what"]],"pyramid":["render.number",["compute.divisorCount",["transform.mul",["sense.first"],{"lit":4}]]],"mem":null},
{"id":"n-d1643ae0","guard":[["hasAny",["2012mar","hypotenuse","pythagoras","pythagorean","two times"]],["has","smoothed"]],"pyramid":["render.number",["compute.hypot",{"lit":2},["transform.double",["sense.wordCount"]]]],"mem":null},
{"id":"n-d1bc87fd","guard":[["hasAny",["2008sep","as text","as words","factorise","factorize","how many words","number of words","prime factorisation","prime factorization","word count","written out"]],["has","give"]],"pyramid":["render.and",["transform.asText",["compute.primeFactors",["aggregate.words",["sense.text"]]]]],"mem":null},
{"id":"n-d28467c2","guard":[["hasAny",["2011aug","after a discount","reduced by","sale price","sum of divisors","sum of factors","sum of the divisors"]],["has","smoothed"]],"pyramid":["render.number",["compute.discount",["compute.divisorSum",["sense.wordCount"]],{"lit":5}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the gmsl smoothed of 2015-Feb","expect":{"contains":["30.1"],"notRefusal":true}},{"q":"give the gmsl smoothed of 2018-Jan","expect":{"contains":["42.4"],"notRefusal":true}},{"q":"tell me the gmsl smoothed of 1996-Apr","expect":{"contains":["-40.4"],"notRefusal":true}},{"q":"tell me the gmsl smoothed of 2020-May","expect":{"contains":["49.7"],"notRefusal":true}},{"q":"what is the gmsl smoothed of 2010-Feb","expect":{"contains":["7.5"],"notRefusal":true}},{"q":"give the gmsl smoothed of 2013-Dec","expect":{"contains":["26"],"notRefusal":true}},{"q":"tell me the gmsl smoothed of 2011-Dec","expect":{"contains":["16.6"],"notRefusal":true}},{"q":"give the gmsl smoothed of 2017-Aug","expect":{"contains":["42.6"],"notRefusal":true}},{"q":"tell me the gmsl smoothed of 1997-Apr","expect":{"contains":["-35.7"],"notRefusal":true}},{"q":"tell me the gmsl smoothed of 2000-Feb","expect":{"contains":["-23.5"],"notRefusal":true}},{"q":"tell me the gmsl smoothed of 2006-Aug","expect":{"contains":["-1.6"],"notRefusal":true}},{"q":"tell me the gmsl smoothed of 2007-Dec","expect":{"contains":["1.5"],"notRefusal":true}},{"q":"what is the gmsl smoothed of 2014-Jun","expect":{"contains":["19.1"],"notRefusal":true}},{"q":"what is the gmsl smoothed of 2012-Mar","expect":{"contains":["14.1"],"notRefusal":true}},{"q":"what is the gmsl smoothed of 2010-Oct","expect":{"contains":["12"],"notRefusal":true}},{"q":"give the gmsl smoothed of 2001-Jan","expect":{"contains":["-19.7"],"notRefusal":true}},{"q":"tell me the gmsl smoothed of 2013-Jan","expect":{"contains":["25.3"],"notRefusal":true}},{"q":"what is the gmsl smoothed of 2013-Jun","expect":{"contains":["17.1"],"notRefusal":true}},{"q":"give the gmsl smoothed of 2017-Sep","expect":{"contains":["45.7"],"notRefusal":true}},{"q":"give the gmsl smoothed of 2012-Apr","expect":{"contains":["12.3"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
