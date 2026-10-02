// gmsl-monthly-of-time-c212-neo-g7.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"gmsl-monthly-of-time-c212-neo-g7","class":"gmsl-monthly-of-time-c212","generation":7,"lane":"neo","grownFrom":["what is the gmsl monthly of 2003-May","tell me the gmsl monthly of 1993-Jul","tell me the gmsl monthly of 1996-Mar","give the gmsl monthly of 2009-Dec","give the gmsl monthly of 2009-Oct","tell me the gmsl monthly of 2018-Nov","tell me the gmsl monthly of 2000-Apr","what is the gmsl monthly of 1997-Aug","give the gmsl monthly of 2012-Jul","what is the gmsl monthly of 2017-Jan","tell me the gmsl monthly of 2018-Feb","what is the gmsl monthly of 2019-Feb","tell me the gmsl monthly of 2011-Jun","tell me the gmsl monthly of 1993-Jun","give the gmsl monthly of 2003-Jan","what is the gmsl monthly of 1997-Jun","give the gmsl monthly of 2010-Feb","what is the gmsl monthly of 1996-Apr","what is the gmsl monthly of 2010-Aug","give the gmsl monthly of 2013-Mar"],"version":1});

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
{"id":"n-b1c17aa4","guard":[["hasAny",["element","gmsl","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-dbab6ee3","guard":[["hasAny",["element","gmsl","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The gmsl ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-4d0a58b3","guard":[["has","gmsl"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2003-May":"The gmsl monthly of 2003-May is -15.2.","tell me the gmsl monthly of 1993-Jul":"The gmsl monthly of 1993-Jul is -45.7.","tell me the gmsl monthly of 1996-Mar":"The gmsl monthly of 1996-Mar is -42.3.","give the gmsl monthly of 2009-Dec":"The gmsl monthly of 2009-Dec is 15.3.","give the gmsl monthly of 2009-Oct":"The gmsl monthly of 2009-Oct is 14.3.","tell me the gmsl monthly of 2018-Nov":"The gmsl monthly of 2018-Nov is 53.","tell me the gmsl monthly of 2000-Apr":"The gmsl monthly of 2000-Apr is -23.5.","what is the gmsl monthly of 1997-Aug":"The gmsl monthly of 1997-Aug is -27.7.","give the gmsl monthly of 2012-Jul":"The gmsl monthly of 2012-Jul is 15.2.","what is the gmsl monthly of 2017-Jan":"The gmsl monthly of 2017-Jan is 37.","tell me the gmsl monthly of 2018-Feb":"The gmsl monthly of 2018-Feb is 38.9.","what is the gmsl monthly of 2019-Feb":"The gmsl monthly of 2019-Feb is 45.7.","tell me the gmsl monthly of 2011-Jun":"The gmsl monthly of 2011-Jun is 0.9.","tell me the gmsl monthly of 1993-Jun":"The gmsl monthly of 1993-Jun is -51.5.","give the gmsl monthly of 2003-Jan":"The gmsl monthly of 2003-Jan is -12.7.","what is the gmsl monthly of 1997-Jun":"The gmsl monthly of 1997-Jun is -37.","give the gmsl monthly of 2010-Feb":"The gmsl monthly of 2010-Feb is 5.3.","what is the gmsl monthly of 1996-Apr":"The gmsl monthly of 1996-Apr is -38.4.","what is the gmsl monthly of 2010-Aug":"The gmsl monthly of 2010-Aug is 8.1.","give the gmsl monthly of 2013-Mar":"The gmsl monthly of 2013-Mar is 18.5.","tell me the gmsl monthly of 2010-May":"The gmsl monthly of 2010-May is 5.4.","give the gmsl monthly of 2004-Jul":"The gmsl monthly of 2004-Jul is -11.2.","give the gmsl monthly of 2017-Jun":"The gmsl monthly of 2017-Jun is 34.7.","tell me the gmsl monthly of 2008-May":"The gmsl monthly of 2008-May is 1.3.","what is the gmsl monthly of 2020-Jan":"The gmsl monthly of 2020-Jan is 49.","what is the gmsl monthly of 2001-Nov":"The gmsl monthly of 2001-Nov is -7.2.","give the gmsl monthly of 2011-Aug":"The gmsl monthly of 2011-Aug is 4.6.","what is the gmsl monthly of 2005-Sep":"The gmsl monthly of 2005-Sep is 0.1.","tell me the gmsl monthly of 2012-Nov":"The gmsl monthly of 2012-Nov is 27.4.","give the gmsl monthly of 1997-Mar":"The gmsl monthly of 1997-Mar is -34.8.","tell me the gmsl monthly of 2003-Apr":"The gmsl monthly of 2003-Apr is -14.7.","what is the gmsl monthly of 2015-May":"The gmsl monthly of 2015-May is 29.7.","give the gmsl monthly of 1994-Dec":"The gmsl monthly of 1994-Dec is -39.4.","what is the gmsl monthly of 1998-May":"The gmsl monthly of 1998-May is -26.6.","what is the gmsl monthly of 2002-Oct":"The gmsl monthly of 2002-Oct is -2.3.","tell me the gmsl monthly of 2004-May":"The gmsl monthly of 2004-May is -14.4.","give the gmsl monthly of 2006-Sep":"The gmsl monthly of 2006-Sep is 2.8.","give the gmsl monthly of 1998-Sep":"The gmsl monthly of 1998-Sep is -19.","what is the gmsl monthly of 2016-Jun":"The gmsl monthly of 2016-Jun is 35.2.","what is the gmsl monthly of 2015-Apr":"The gmsl monthly of 2015-Apr is 27.6.","what is the gmsl monthly of 2016-Oct":"The gmsl monthly of 2016-Oct is 43.2.","what is the gmsl monthly of 2012-Mar":"The gmsl monthly of 2012-Mar is 13.3.","give the gmsl monthly of 1998-Mar":"The gmsl monthly of 1998-Mar is -23.9.","what is the gmsl monthly of 2018-Oct":"The gmsl monthly of 2018-Oct is 54.","what is the gmsl monthly of 2017-Sep":"The gmsl monthly of 2017-Sep is 46.9.","tell me the gmsl monthly of 2014-Oct":"The gmsl monthly of 2014-Oct is 29.7.","what is the gmsl monthly of 1996-Oct":"The gmsl monthly of 1996-Oct is -18.8.","give the gmsl monthly of 2007-Sep":"The gmsl monthly of 2007-Sep is 0.9.","tell me the gmsl monthly of 2011-Feb":"The gmsl monthly of 2011-Feb is 4.8.","tell me the gmsl monthly of 2017-May":"The gmsl monthly of 2017-May is 34.7.","give the gmsl monthly of 2003-Mar":"The gmsl monthly of 2003-Mar is -13.3.","give the gmsl monthly of 2002-Feb":"The gmsl monthly of 2002-Feb is -16.8.","what is the gmsl monthly of 2006-Aug":"The gmsl monthly of 2006-Aug is -2.1.","tell me the gmsl monthly of 2019-Nov":"The gmsl monthly of 2019-Nov is 58.6.","tell me the gmsl monthly of 2010-Jan":"The gmsl monthly of 2010-Jan is 12.1.","what is the gmsl monthly of 2015-Aug":"The gmsl monthly of 2015-Aug is 32.4.","tell me the gmsl monthly of 2006-Apr":"The gmsl monthly of 2006-Apr is -7.3.","tell me the gmsl monthly of 2000-Jul":"The gmsl monthly of 2000-Jul is -29.7.","tell me the gmsl monthly of 2005-Dec":"The gmsl monthly of 2005-Dec is 1.1.","tell me the gmsl monthly of 2012-Jun":"The gmsl monthly of 2012-Jun is 12.4.","tell me the gmsl monthly of 2007-Apr":"The gmsl monthly of 2007-Apr is -2.6.","tell me the gmsl monthly of 2013-Feb":"The gmsl monthly of 2013-Feb is 23.1.","give the gmsl monthly of 1999-Nov":"The gmsl monthly of 1999-Nov is -21.9.","give the gmsl monthly of 2009-Apr":"The gmsl monthly of 2009-Apr is 3.8.","what is the gmsl monthly of 2020-Mar":"The gmsl monthly of 2020-Mar is 48.","tell me the gmsl monthly of 2013-Jan":"The gmsl monthly of 2013-Jan is 25.6.","give the gmsl monthly of 2010-Sep":"The gmsl monthly of 2010-Sep is 10.3.","tell me the gmsl monthly of 2019-Sep":"The gmsl monthly of 2019-Sep is 57.8.","what is the gmsl monthly of 2008-Jul":"The gmsl monthly of 2008-Jul is -0.2.","give the gmsl monthly of 2014-Mar":"The gmsl monthly of 2014-Mar is 20.9.","give the gmsl monthly of 2002-Nov":"The gmsl monthly of 2002-Nov is -7.5.","tell me the gmsl monthly of 2004-Dec":"The gmsl monthly of 2004-Dec is -4.3.","give the gmsl monthly of 1993-Nov":"The gmsl monthly of 1993-Nov is -39.3.","what is the gmsl monthly of 1996-Jan":"The gmsl monthly of 1996-Jan is -47.2.","what is the gmsl monthly of 1996-Jun":"The gmsl monthly of 1996-Jun is -37.8.","tell me the gmsl monthly of 1998-Jun":"The gmsl monthly of 1998-Jun is -32.3.","give the gmsl monthly of 2006-Dec":"The gmsl monthly of 2006-Dec is 0.1.","what is the gmsl monthly of 2006-Jul":"The gmsl monthly of 2006-Jul is -5.6.","what is the gmsl monthly of 2020-May":"The gmsl monthly of 2020-May is 49.1.","give the gmsl monthly of 2019-Aug":"The gmsl monthly of 2019-Aug is 54.4.","tell me the gmsl monthly of 2007-Feb":"The gmsl monthly of 2007-Feb is -6.3.","tell me the gmsl monthly of 2019-Jun":"The gmsl monthly of 2019-Jun is 46.9.","what is the gmsl monthly of 1996-Dec":"The gmsl monthly of 1996-Dec is -36.","tell me the gmsl monthly of 1997-Jan":"The gmsl monthly of 1997-Jan is -36.5.","give the gmsl monthly of 1998-Jul":"The gmsl monthly of 1998-Jul is -25.1.","tell me the gmsl monthly of 2011-Nov":"The gmsl monthly of 2011-Nov is 19.1.","give the gmsl monthly of 2010-Dec":"The gmsl monthly of 2010-Dec is 11.7.","what is the gmsl monthly of 2015-Dec":"The gmsl monthly of 2015-Dec is 43.5.","tell me the gmsl monthly of 2013-Apr":"The gmsl monthly of 2013-Apr is 21.","give the gmsl monthly of 2018-Jun":"The gmsl monthly of 2018-Jun is 38.2.","tell me the gmsl monthly of 2016-Nov":"The gmsl monthly of 2016-Nov is 47.1.","give the gmsl monthly of 2006-Jun":"The gmsl monthly of 2006-Jun is -7.7.","give the gmsl monthly of 2014-Dec":"The gmsl monthly of 2014-Dec is 29.2.","give the gmsl monthly of 2012-Dec":"The gmsl monthly of 2012-Dec is 27.4.","give the gmsl monthly of 2008-Aug":"The gmsl monthly of 2008-Aug is 2.2.","what is the gmsl monthly of 2012-Sep":"The gmsl monthly of 2012-Sep is 20.7.","what is the gmsl monthly of 1997-May":"The gmsl monthly of 1997-May is -34.1.","give the gmsl monthly of 2011-Jan":"The gmsl monthly of 2011-Jan is 9.4.","what is the gmsl monthly of 2007-Oct":"The gmsl monthly of 2007-Oct is 4.2."}}},
{"id":"n-41099c77","guard":[["has","gmsl"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"monthly"}]]],"mem":{"table":{"of 2003-May":"The gmsl monthly of 2003-May is -15.2.","of 1993-Jul":"The gmsl monthly of 1993-Jul is -45.7.","of 1996-Mar":"The gmsl monthly of 1996-Mar is -42.3.","of 2009-Dec":"The gmsl monthly of 2009-Dec is 15.3.","of 2009-Oct":"The gmsl monthly of 2009-Oct is 14.3.","of 2018-Nov":"The gmsl monthly of 2018-Nov is 53.","of 2000-Apr":"The gmsl monthly of 2000-Apr is -23.5.","of 1997-Aug":"The gmsl monthly of 1997-Aug is -27.7.","of 2012-Jul":"The gmsl monthly of 2012-Jul is 15.2.","of 2017-Jan":"The gmsl monthly of 2017-Jan is 37.","of 2018-Feb":"The gmsl monthly of 2018-Feb is 38.9.","of 2019-Feb":"The gmsl monthly of 2019-Feb is 45.7.","of 2011-Jun":"The gmsl monthly of 2011-Jun is 0.9.","of 1993-Jun":"The gmsl monthly of 1993-Jun is -51.5.","of 2003-Jan":"The gmsl monthly of 2003-Jan is -12.7.","of 1997-Jun":"The gmsl monthly of 1997-Jun is -37.","of 2010-Feb":"The gmsl monthly of 2010-Feb is 5.3.","of 1996-Apr":"The gmsl monthly of 1996-Apr is -38.4.","of 2010-Aug":"The gmsl monthly of 2010-Aug is 8.1.","of 2013-Mar":"The gmsl monthly of 2013-Mar is 18.5.","of 2010-May":"The gmsl monthly of 2010-May is 5.4.","of 2004-Jul":"The gmsl monthly of 2004-Jul is -11.2.","of 2017-Jun":"The gmsl monthly of 2017-Jun is 34.7.","of 2008-May":"The gmsl monthly of 2008-May is 1.3.","of 2020-Jan":"The gmsl monthly of 2020-Jan is 49.","of 2001-Nov":"The gmsl monthly of 2001-Nov is -7.2.","of 2011-Aug":"The gmsl monthly of 2011-Aug is 4.6.","of 2005-Sep":"The gmsl monthly of 2005-Sep is 0.1.","of 2012-Nov":"The gmsl monthly of 2012-Nov is 27.4.","of 1997-Mar":"The gmsl monthly of 1997-Mar is -34.8.","of 2003-Apr":"The gmsl monthly of 2003-Apr is -14.7.","of 2015-May":"The gmsl monthly of 2015-May is 29.7.","of 1994-Dec":"The gmsl monthly of 1994-Dec is -39.4.","of 1998-May":"The gmsl monthly of 1998-May is -26.6.","of 2002-Oct":"The gmsl monthly of 2002-Oct is -2.3.","of 2004-May":"The gmsl monthly of 2004-May is -14.4.","of 2006-Sep":"The gmsl monthly of 2006-Sep is 2.8.","of 1998-Sep":"The gmsl monthly of 1998-Sep is -19.","of 2016-Jun":"The gmsl monthly of 2016-Jun is 35.2.","of 2015-Apr":"The gmsl monthly of 2015-Apr is 27.6.","of 2016-Oct":"The gmsl monthly of 2016-Oct is 43.2.","of 2012-Mar":"The gmsl monthly of 2012-Mar is 13.3.","of 1998-Mar":"The gmsl monthly of 1998-Mar is -23.9.","of 2018-Oct":"The gmsl monthly of 2018-Oct is 54.","of 2017-Sep":"The gmsl monthly of 2017-Sep is 46.9.","of 2014-Oct":"The gmsl monthly of 2014-Oct is 29.7.","of 1996-Oct":"The gmsl monthly of 1996-Oct is -18.8.","of 2007-Sep":"The gmsl monthly of 2007-Sep is 0.9.","of 2011-Feb":"The gmsl monthly of 2011-Feb is 4.8.","of 2017-May":"The gmsl monthly of 2017-May is 34.7.","of 2003-Mar":"The gmsl monthly of 2003-Mar is -13.3.","of 2002-Feb":"The gmsl monthly of 2002-Feb is -16.8.","of 2006-Aug":"The gmsl monthly of 2006-Aug is -2.1.","of 2019-Nov":"The gmsl monthly of 2019-Nov is 58.6.","of 2010-Jan":"The gmsl monthly of 2010-Jan is 12.1.","of 2015-Aug":"The gmsl monthly of 2015-Aug is 32.4.","of 2006-Apr":"The gmsl monthly of 2006-Apr is -7.3.","of 2000-Jul":"The gmsl monthly of 2000-Jul is -29.7.","of 2005-Dec":"The gmsl monthly of 2005-Dec is 1.1.","of 2012-Jun":"The gmsl monthly of 2012-Jun is 12.4.","of 2007-Apr":"The gmsl monthly of 2007-Apr is -2.6.","of 2013-Feb":"The gmsl monthly of 2013-Feb is 23.1.","of 1999-Nov":"The gmsl monthly of 1999-Nov is -21.9.","of 2009-Apr":"The gmsl monthly of 2009-Apr is 3.8.","of 2020-Mar":"The gmsl monthly of 2020-Mar is 48.","of 2013-Jan":"The gmsl monthly of 2013-Jan is 25.6.","of 2010-Sep":"The gmsl monthly of 2010-Sep is 10.3.","of 2019-Sep":"The gmsl monthly of 2019-Sep is 57.8.","of 2008-Jul":"The gmsl monthly of 2008-Jul is -0.2.","of 2014-Mar":"The gmsl monthly of 2014-Mar is 20.9.","of 2002-Nov":"The gmsl monthly of 2002-Nov is -7.5.","of 2004-Dec":"The gmsl monthly of 2004-Dec is -4.3.","of 1993-Nov":"The gmsl monthly of 1993-Nov is -39.3.","of 1996-Jan":"The gmsl monthly of 1996-Jan is -47.2.","of 1996-Jun":"The gmsl monthly of 1996-Jun is -37.8.","of 1998-Jun":"The gmsl monthly of 1998-Jun is -32.3.","of 2006-Dec":"The gmsl monthly of 2006-Dec is 0.1.","of 2006-Jul":"The gmsl monthly of 2006-Jul is -5.6.","of 2020-May":"The gmsl monthly of 2020-May is 49.1.","of 2019-Aug":"The gmsl monthly of 2019-Aug is 54.4.","of 2007-Feb":"The gmsl monthly of 2007-Feb is -6.3.","of 2019-Jun":"The gmsl monthly of 2019-Jun is 46.9.","of 1996-Dec":"The gmsl monthly of 1996-Dec is -36.","of 1997-Jan":"The gmsl monthly of 1997-Jan is -36.5.","of 1998-Jul":"The gmsl monthly of 1998-Jul is -25.1.","of 2011-Nov":"The gmsl monthly of 2011-Nov is 19.1.","of 2010-Dec":"The gmsl monthly of 2010-Dec is 11.7.","of 2015-Dec":"The gmsl monthly of 2015-Dec is 43.5.","of 2013-Apr":"The gmsl monthly of 2013-Apr is 21.","of 2018-Jun":"The gmsl monthly of 2018-Jun is 38.2.","of 2016-Nov":"The gmsl monthly of 2016-Nov is 47.1.","of 2006-Jun":"The gmsl monthly of 2006-Jun is -7.7.","of 2014-Dec":"The gmsl monthly of 2014-Dec is 29.2.","of 2012-Dec":"The gmsl monthly of 2012-Dec is 27.4.","of 2008-Aug":"The gmsl monthly of 2008-Aug is 2.2.","of 2012-Sep":"The gmsl monthly of 2012-Sep is 20.7.","of 1997-May":"The gmsl monthly of 1997-May is -34.1.","of 2011-Jan":"The gmsl monthly of 2011-Jan is 9.4.","of 2007-Oct":"The gmsl monthly of 2007-Oct is 4.2."}}},
{"id":"n-ccae6118","guard":[["has","gmsl"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"gmsl"}]]],"mem":{"table":{"monthly of 2003-May":"The gmsl monthly of 2003-May is -15.2.","monthly of 1993-Jul":"The gmsl monthly of 1993-Jul is -45.7.","monthly of 1996-Mar":"The gmsl monthly of 1996-Mar is -42.3.","monthly of 2009-Dec":"The gmsl monthly of 2009-Dec is 15.3.","monthly of 2009-Oct":"The gmsl monthly of 2009-Oct is 14.3.","monthly of 2018-Nov":"The gmsl monthly of 2018-Nov is 53.","monthly of 2000-Apr":"The gmsl monthly of 2000-Apr is -23.5.","monthly of 1997-Aug":"The gmsl monthly of 1997-Aug is -27.7.","monthly of 2012-Jul":"The gmsl monthly of 2012-Jul is 15.2.","monthly of 2017-Jan":"The gmsl monthly of 2017-Jan is 37.","monthly of 2018-Feb":"The gmsl monthly of 2018-Feb is 38.9.","monthly of 2019-Feb":"The gmsl monthly of 2019-Feb is 45.7.","monthly of 2011-Jun":"The gmsl monthly of 2011-Jun is 0.9.","monthly of 1993-Jun":"The gmsl monthly of 1993-Jun is -51.5.","monthly of 2003-Jan":"The gmsl monthly of 2003-Jan is -12.7.","monthly of 1997-Jun":"The gmsl monthly of 1997-Jun is -37.","monthly of 2010-Feb":"The gmsl monthly of 2010-Feb is 5.3.","monthly of 1996-Apr":"The gmsl monthly of 1996-Apr is -38.4.","monthly of 2010-Aug":"The gmsl monthly of 2010-Aug is 8.1.","monthly of 2013-Mar":"The gmsl monthly of 2013-Mar is 18.5.","monthly of 2010-May":"The gmsl monthly of 2010-May is 5.4.","monthly of 2004-Jul":"The gmsl monthly of 2004-Jul is -11.2.","monthly of 2017-Jun":"The gmsl monthly of 2017-Jun is 34.7.","monthly of 2008-May":"The gmsl monthly of 2008-May is 1.3.","monthly of 2020-Jan":"The gmsl monthly of 2020-Jan is 49.","monthly of 2001-Nov":"The gmsl monthly of 2001-Nov is -7.2.","monthly of 2011-Aug":"The gmsl monthly of 2011-Aug is 4.6.","monthly of 2005-Sep":"The gmsl monthly of 2005-Sep is 0.1.","monthly of 2012-Nov":"The gmsl monthly of 2012-Nov is 27.4.","monthly of 1997-Mar":"The gmsl monthly of 1997-Mar is -34.8.","monthly of 2003-Apr":"The gmsl monthly of 2003-Apr is -14.7.","monthly of 2015-May":"The gmsl monthly of 2015-May is 29.7.","monthly of 1994-Dec":"The gmsl monthly of 1994-Dec is -39.4.","monthly of 1998-May":"The gmsl monthly of 1998-May is -26.6.","monthly of 2002-Oct":"The gmsl monthly of 2002-Oct is -2.3.","monthly of 2004-May":"The gmsl monthly of 2004-May is -14.4.","monthly of 2006-Sep":"The gmsl monthly of 2006-Sep is 2.8.","monthly of 1998-Sep":"The gmsl monthly of 1998-Sep is -19.","monthly of 2016-Jun":"The gmsl monthly of 2016-Jun is 35.2.","monthly of 2015-Apr":"The gmsl monthly of 2015-Apr is 27.6.","monthly of 2016-Oct":"The gmsl monthly of 2016-Oct is 43.2.","monthly of 2012-Mar":"The gmsl monthly of 2012-Mar is 13.3.","monthly of 1998-Mar":"The gmsl monthly of 1998-Mar is -23.9.","monthly of 2018-Oct":"The gmsl monthly of 2018-Oct is 54.","monthly of 2017-Sep":"The gmsl monthly of 2017-Sep is 46.9.","monthly of 2014-Oct":"The gmsl monthly of 2014-Oct is 29.7.","monthly of 1996-Oct":"The gmsl monthly of 1996-Oct is -18.8.","monthly of 2007-Sep":"The gmsl monthly of 2007-Sep is 0.9.","monthly of 2011-Feb":"The gmsl monthly of 2011-Feb is 4.8.","monthly of 2017-May":"The gmsl monthly of 2017-May is 34.7.","monthly of 2003-Mar":"The gmsl monthly of 2003-Mar is -13.3.","monthly of 2002-Feb":"The gmsl monthly of 2002-Feb is -16.8.","monthly of 2006-Aug":"The gmsl monthly of 2006-Aug is -2.1.","monthly of 2019-Nov":"The gmsl monthly of 2019-Nov is 58.6.","monthly of 2010-Jan":"The gmsl monthly of 2010-Jan is 12.1.","monthly of 2015-Aug":"The gmsl monthly of 2015-Aug is 32.4.","monthly of 2006-Apr":"The gmsl monthly of 2006-Apr is -7.3.","monthly of 2000-Jul":"The gmsl monthly of 2000-Jul is -29.7.","monthly of 2005-Dec":"The gmsl monthly of 2005-Dec is 1.1.","monthly of 2012-Jun":"The gmsl monthly of 2012-Jun is 12.4.","monthly of 2007-Apr":"The gmsl monthly of 2007-Apr is -2.6.","monthly of 2013-Feb":"The gmsl monthly of 2013-Feb is 23.1.","monthly of 1999-Nov":"The gmsl monthly of 1999-Nov is -21.9.","monthly of 2009-Apr":"The gmsl monthly of 2009-Apr is 3.8.","monthly of 2020-Mar":"The gmsl monthly of 2020-Mar is 48.","monthly of 2013-Jan":"The gmsl monthly of 2013-Jan is 25.6.","monthly of 2010-Sep":"The gmsl monthly of 2010-Sep is 10.3.","monthly of 2019-Sep":"The gmsl monthly of 2019-Sep is 57.8.","monthly of 2008-Jul":"The gmsl monthly of 2008-Jul is -0.2.","monthly of 2014-Mar":"The gmsl monthly of 2014-Mar is 20.9.","monthly of 2002-Nov":"The gmsl monthly of 2002-Nov is -7.5.","monthly of 2004-Dec":"The gmsl monthly of 2004-Dec is -4.3.","monthly of 1993-Nov":"The gmsl monthly of 1993-Nov is -39.3.","monthly of 1996-Jan":"The gmsl monthly of 1996-Jan is -47.2.","monthly of 1996-Jun":"The gmsl monthly of 1996-Jun is -37.8.","monthly of 1998-Jun":"The gmsl monthly of 1998-Jun is -32.3.","monthly of 2006-Dec":"The gmsl monthly of 2006-Dec is 0.1.","monthly of 2006-Jul":"The gmsl monthly of 2006-Jul is -5.6.","monthly of 2020-May":"The gmsl monthly of 2020-May is 49.1.","monthly of 2019-Aug":"The gmsl monthly of 2019-Aug is 54.4.","monthly of 2007-Feb":"The gmsl monthly of 2007-Feb is -6.3.","monthly of 2019-Jun":"The gmsl monthly of 2019-Jun is 46.9.","monthly of 1996-Dec":"The gmsl monthly of 1996-Dec is -36.","monthly of 1997-Jan":"The gmsl monthly of 1997-Jan is -36.5.","monthly of 1998-Jul":"The gmsl monthly of 1998-Jul is -25.1.","monthly of 2011-Nov":"The gmsl monthly of 2011-Nov is 19.1.","monthly of 2010-Dec":"The gmsl monthly of 2010-Dec is 11.7.","monthly of 2015-Dec":"The gmsl monthly of 2015-Dec is 43.5.","monthly of 2013-Apr":"The gmsl monthly of 2013-Apr is 21.","monthly of 2018-Jun":"The gmsl monthly of 2018-Jun is 38.2.","monthly of 2016-Nov":"The gmsl monthly of 2016-Nov is 47.1.","monthly of 2006-Jun":"The gmsl monthly of 2006-Jun is -7.7.","monthly of 2014-Dec":"The gmsl monthly of 2014-Dec is 29.2.","monthly of 2012-Dec":"The gmsl monthly of 2012-Dec is 27.4.","monthly of 2008-Aug":"The gmsl monthly of 2008-Aug is 2.2.","monthly of 2012-Sep":"The gmsl monthly of 2012-Sep is 20.7.","monthly of 1997-May":"The gmsl monthly of 1997-May is -34.1.","monthly of 2011-Jan":"The gmsl monthly of 2011-Jan is 9.4.","monthly of 2007-Oct":"The gmsl monthly of 2007-Oct is 4.2."}}},
{"id":"n-4094f3ea","guard":[["hasAny",["1993jul","1993jun","1996apr","1996dec","1996jan","1996jun","1996mar","1996oct","1997aug","1997jan","1997jun","1997may","1998jun","1998may","2000apr","2000jul","2001nov","2002oct","2003apr","2003may","2004dec","2004may","2005dec","2005sep","2006apr","2006aug","2006jul","2007apr","2007feb","2007oct","2008jul","2008may","2010aug","2010jan","2010may","2011feb","2011jun","2011nov","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017may","2017sep","2018feb","2018nov","2018oct","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","element","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-024f080b","guard":[["hasAny",["1993jul","1993jun","1996apr","1996dec","1996jan","1996jun","1996mar","1996oct","1997aug","1997jan","1997jun","1997may","1998jun","1998may","2000apr","2000jul","2001nov","2002oct","2003apr","2003may","2004dec","2004may","2005dec","2005sep","2006apr","2006aug","2006jul","2007apr","2007feb","2007oct","2008jul","2008may","2010aug","2010jan","2010may","2011feb","2011jun","2011nov","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017may","2017sep","2018feb","2018nov","2018oct","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","element","item number","lower case","lowercase","nth","position","small letters"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-143f753d","guard":[["hasAny",["1993jul","1993jun","1996apr","1996dec","1996jan","1996jun","1996mar","1996oct","1997aug","1997jan","1997jun","1997may","1998jun","1998may","2000apr","2000jul","2001nov","2002oct","2003apr","2003may","2004dec","2004may","2005dec","2005sep","2006apr","2006aug","2006jul","2007apr","2007feb","2007oct","2008jul","2008may","2010aug","2010jan","2010may","2011feb","2011jun","2011nov","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017may","2017sep","2018feb","2018nov","2018oct","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-c448062f","guard":[["hasAny",["1993jul","1993jun","1996apr","1996dec","1996jan","1996jun","1996mar","1996oct","1997aug","1997jan","1997jun","1997may","1998jun","1998may","2000apr","2000jul","2001nov","2002oct","2003apr","2003may","2004dec","2004may","2005dec","2005sep","2006apr","2006aug","2006jul","2007apr","2007feb","2007oct","2008jul","2008may","2010aug","2010jan","2010may","2011feb","2011jun","2011nov","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017may","2017sep","2018feb","2018nov","2018oct","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-d2db333a","guard":[["hasAny",["1993jul","1993jun","1996apr","1996dec","1996jan","1996jun","1996mar","1996oct","1997aug","1997jan","1997jun","1997may","1998jun","1998may","2000apr","2000jul","2001nov","2002oct","2003apr","2003may","2004dec","2004may","2005dec","2005sep","2006apr","2006aug","2006jul","2007apr","2007feb","2007oct","2008jul","2008may","2010aug","2010jan","2010may","2011feb","2011jun","2011nov","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017may","2017sep","2018feb","2018nov","2018oct","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","element","invert case","item number","nth","position","swap case","toggle case"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-553b09c4","guard":[["hasAny",["1993jul","1993jun","1996apr","1996dec","1996jan","1996jun","1996mar","1996oct","1997aug","1997jan","1997jun","1997may","1998jun","1998may","2000apr","2000jul","2001nov","2002oct","2003apr","2003may","2004dec","2004may","2005dec","2005sep","2006apr","2006aug","2006jul","2007apr","2007feb","2007oct","2008jul","2008may","2010aug","2010jan","2010may","2011feb","2011jun","2011nov","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017may","2017sep","2018feb","2018nov","2018oct","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","element","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-55d1ebab","guard":[["hasAny",["1993jul","1993jun","1996apr","1996dec","1996jan","1996jun","1996mar","1996oct","1997aug","1997jan","1997jun","1997may","1998jun","1998may","2000apr","2000jul","2001nov","2002oct","2003apr","2003may","2004dec","2004may","2005dec","2005sep","2006apr","2006aug","2006jul","2007apr","2007feb","2007oct","2008jul","2008may","2010aug","2010jan","2010may","2011feb","2011jun","2011nov","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017may","2017sep","2018feb","2018nov","2018oct","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","element","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-403e5fb8","guard":[["hasAny",["2005dec","2005sep","2006dec","2006sep","2007oct","2007sep","2008aug","2008may","2009apr","2009dec","2009oct","2010aug","2010dec","2010feb","2010jan","2010may","2010sep","2011aug","2011feb","2011jan","2011jun","2011nov","2012dec","2012jul","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2013mar","2014dec","2014mar","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017jun","2017may","2017sep","2018feb","2018jun","2018nov","2018oct","2019aug","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","element","item number","negate","negative","nth","opposite","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["transform.neg",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-5561bd59","guard":[["hasAny",["2005dec","2005sep","2006dec","2006sep","2007oct","2007sep","2008aug","2008may","2009apr","2009dec","2009oct","2010aug","2010dec","2010feb","2010jan","2010may","2010sep","2011aug","2011feb","2011jan","2011jun","2011nov","2012dec","2012jul","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2013mar","2014dec","2014mar","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017jun","2017may","2017sep","2018feb","2018jun","2018nov","2018oct","2019aug","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-86c34154","guard":[["hasAny",["2009dec","2009oct","2010dec","2010jan","2010sep","2011nov","2012dec","2012jul","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2013mar","2014dec","2014mar","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017jun","2017may","2017sep","2018feb","2018jun","2018nov","2018oct","2019aug","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.hypot",["sense.howMany"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-02229d18","guard":[["hasAny",["2005dec","2005sep","2007oct","2008may","2010aug","2010jan","2010may","2011feb","2011jun","2011nov","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017may","2017sep","2018feb","2018nov","2018oct","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-0e4f5668","guard":[["hasAny",["2005dec","2005sep","2007oct","2008may","2010aug","2010jan","2010may","2011feb","2011jun","2011nov","2012jun","2012mar","2012nov","2012sep","2013apr","2013feb","2013jan","2014oct","2015apr","2015aug","2015dec","2015may","2016jun","2016nov","2016oct","2017jan","2017may","2017sep","2018feb","2018nov","2018oct","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-17539e08","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","element","item number","nth","position"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-10763e61","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","class name","element","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-279deede","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-29d47784","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","element","invert case","item number","nth","position","swap case","toggle case"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-4d51ee4b","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.upper",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-77bd4a74","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","element","item number","lower case","lowercase","nth","position","small letters"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.lower",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-854c5f9a","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","element","item number","no vowels","nth","position","remove vowels","without vowels"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.noVowels",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-f012e668","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","element","invert case","item number","nth","position","swap case","toggle case"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.after",{"lit":"gmsl"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-29665181","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","element","item number","nth","position"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-96e88aa7","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","each word","element","item number","nth","position","split into words","words"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-9a0a8bff","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","element","item number","nth","position"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-b32ecefb","guard":[["hasAny",["1993nov","1994dec","1997mar","1998jul","1998mar","1998sep","1999nov","2002feb","2002nov","2003jan","2003mar","2004jul","2006dec","2006jun","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","each word","element","item number","nth","position","split into words","words"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-19bcfef4","guard":[["has","gmsl"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the gmsl monthly of 2003-May":"The gmsl monthly of 2003-May is -15.2.","the gmsl monthly of 1997-Aug":"The gmsl monthly of 1997-Aug is -27.7.","the gmsl monthly of 2017-Jan":"The gmsl monthly of 2017-Jan is 37.","the gmsl monthly of 2019-Feb":"The gmsl monthly of 2019-Feb is 45.7.","the gmsl monthly of 1997-Jun":"The gmsl monthly of 1997-Jun is -37.","the gmsl monthly of 1996-Apr":"The gmsl monthly of 1996-Apr is -38.4.","the gmsl monthly of 2010-Aug":"The gmsl monthly of 2010-Aug is 8.1.","the gmsl monthly of 2020-Jan":"The gmsl monthly of 2020-Jan is 49.","the gmsl monthly of 2001-Nov":"The gmsl monthly of 2001-Nov is -7.2.","the gmsl monthly of 2005-Sep":"The gmsl monthly of 2005-Sep is 0.1.","the gmsl monthly of 2015-May":"The gmsl monthly of 2015-May is 29.7.","the gmsl monthly of 1998-May":"The gmsl monthly of 1998-May is -26.6.","the gmsl monthly of 2002-Oct":"The gmsl monthly of 2002-Oct is -2.3.","the gmsl monthly of 2016-Jun":"The gmsl monthly of 2016-Jun is 35.2.","the gmsl monthly of 2015-Apr":"The gmsl monthly of 2015-Apr is 27.6.","the gmsl monthly of 2016-Oct":"The gmsl monthly of 2016-Oct is 43.2.","the gmsl monthly of 2012-Mar":"The gmsl monthly of 2012-Mar is 13.3.","the gmsl monthly of 2018-Oct":"The gmsl monthly of 2018-Oct is 54.","the gmsl monthly of 2017-Sep":"The gmsl monthly of 2017-Sep is 46.9.","the gmsl monthly of 1996-Oct":"The gmsl monthly of 1996-Oct is -18.8.","the gmsl monthly of 2006-Aug":"The gmsl monthly of 2006-Aug is -2.1.","the gmsl monthly of 2015-Aug":"The gmsl monthly of 2015-Aug is 32.4.","the gmsl monthly of 2020-Mar":"The gmsl monthly of 2020-Mar is 48.","the gmsl monthly of 2008-Jul":"The gmsl monthly of 2008-Jul is -0.2.","the gmsl monthly of 1996-Jan":"The gmsl monthly of 1996-Jan is -47.2.","the gmsl monthly of 1996-Jun":"The gmsl monthly of 1996-Jun is -37.8.","the gmsl monthly of 2006-Jul":"The gmsl monthly of 2006-Jul is -5.6.","the gmsl monthly of 2020-May":"The gmsl monthly of 2020-May is 49.1.","the gmsl monthly of 1996-Dec":"The gmsl monthly of 1996-Dec is -36.","the gmsl monthly of 2015-Dec":"The gmsl monthly of 2015-Dec is 43.5.","the gmsl monthly of 2012-Sep":"The gmsl monthly of 2012-Sep is 20.7.","the gmsl monthly of 1997-May":"The gmsl monthly of 1997-May is -34.1.","the gmsl monthly of 2007-Oct":"The gmsl monthly of 2007-Oct is 4.2."}}},
{"id":"n-17fd93d5","guard":[["hasAny",["2006dec","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-34b6da29","guard":[["hasAny",["2006dec","2006sep","2007sep","2008aug","2009apr","2009dec","2009oct","2010dec","2010feb","2010sep","2011aug","2011jan","2012dec","2012jul","2013mar","2014dec","2014mar","2017jun","2018jun","2019aug","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-a77025fc","guard":[["hasAny",["2002oct","2004dec","2005dec","2005sep","2006aug","2006dec","2006sep","2007apr","2007oct","2007sep","2008aug","2008jul","2008may","2009apr","2011aug","2011feb","2011jun","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"]]],"mem":null},
{"id":"n-c05d13a0","guard":[["hasAny",["2002oct","2004dec","2005dec","2005sep","2006aug","2006dec","2006sep","2007apr","2007oct","2007sep","2008aug","2008jul","2008may","2009apr","2011aug","2011feb","2011jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"]]],"mem":null},
{"id":"n-14dd2b3c","guard":[["hasAny",["2005dec","2005sep","2006dec","2006sep","2007oct","2007sep","2008aug","2008may","2009apr","2010aug","2010feb","2010may","2011aug","2011feb","2011jan","2011jun","element","first letters of the name","initials","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.str",["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-6ebd2e78","guard":[["hasAny",["2015dec","2016nov","2016oct","2017sep","2018nov","2018oct","2019aug","2019feb","2019jun","2019nov","2019sep","2020jan","2020mar","2020may","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.hypot",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-83774439","guard":[["hasAny",["2002oct","2005dec","2005sep","2006aug","2006dec","2007sep","2008aug","2008jul","2008may","2011jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2}]],"mem":null},
{"id":"n-c14b8bc0","guard":[["hasAny",["2002oct","2005dec","2005sep","2006aug","2006dec","2007sep","2008aug","2008jul","2008may","2011jun","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":2}]],"mem":null},
{"id":"n-750d0563","guard":[["hasAny",["1996dec","1997jun","1998sep","2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","element","floor","item number","nth","position","round down"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-9f97d0a6","guard":[["hasAny",["1996dec","1997jun","1998sep","2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","ceil","ceiling","element","item number","nth","position","round up"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-cc9af59a","guard":[["hasAny",["1996dec","1997jun","1998sep","2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","element","item number","nearest whole number","nth","position","round","rounded"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-d395550f","guard":[["not",["hasAny",["1882aug","1887jan","1905jan","1905may","1909feb","1911apr","1921mar","1975jun","1986may","1997dec","2008dec","2009mar","add","compare","has","larger","makes","smaller","smoothed","sum","uncertainty"]]]],"pyramid":["render.str",["compute.fraction",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"]]],"mem":null},
{"id":"n-f6615994","guard":[["hasAny",["element","gmsl","item number","lowest terms","nth","position","reduce the fraction","simplest form","simplify the fraction"]],["nums==",1],["has","monthly"]],"pyramid":["render.str",["compute.fraction",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"]]],"mem":null},
{"id":"n-22a1de25","guard":[["hasAny",["1996dec","1997jun","2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","element","item number","nearest whole number","nth","position","round","rounded"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-2f3561d9","guard":[["hasAny",["1996dec","1997jun","2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","element","item number","nearest whole number","nth","position","round","rounded"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-74066ebf","guard":[["hasAny",["1996dec","1997jun","2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","ceil","ceiling","element","item number","nth","position","round up"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-7e05e03b","guard":[["hasAny",["1996dec","1997jun","2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","element","floor","item number","nth","position","round down"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-d181a45b","guard":[["hasAny",["1996dec","1997jun","2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","ceil","ceiling","element","item number","nth","position","round up"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-fd81f981","guard":[["hasAny",["1996dec","1997jun","2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","element","floor","item number","nth","position","round down"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-346c7c76","guard":[["hasAny",["2005dec","2005sep","2006dec","2007sep","2008jul","2008may","2011jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3}]],"mem":null},
{"id":"n-f36acbad","guard":[["hasAny",["2005dec","2005sep","2006dec","2007sep","2008jul","2008may","2011jun","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":3}]],"mem":null},
{"id":"n-067cb7e8","guard":[["hasAny",["2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","each word","element","item number","nth","position","split into words","words"]],["nums==",1],["has","monthly"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-0caaf475","guard":[["hasAny",["2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","element","item number","nth","position","snake case","snakecase","underscores","variable name"]],["nums==",1],["has","monthly"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-0d966605","guard":[["hasAny",["2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","slug"]],["nums==",1],["has","monthly"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-12ab92fb","guard":[["hasAny",["2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","each word","element","item number","nth","position","split into words","words"]],["nums==",1],["has","monthly"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-51ea3315","guard":[["hasAny",["1996dec","1997jun","1998sep","2017jan","2020jan","2020mar","alphabetize the letters","element","item number","letters in order","nth","position","sort the letters"]],["nums==",1],["has","monthly"]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-57cefbcd","guard":[["hasAny",["2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","each word","element","item number","nth","position","split into words","words"]],["nums==",1],["has","monthly"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-a6f1b5f4","guard":[["hasAny",["2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","camel case","camelcase","element","item number","lower camel case","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-036b20cb","guard":[["hasAny",["2005dec","2005sep","2006dec","2007sep","2008jul","2011jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":4}]],"mem":null},
{"id":"n-26026894","guard":[["not",["hasAny",["2008dec","add","compare","has","larger","makes","smaller","smoothed","uncertainty"]]]],"pyramid":["render.number",["compute.choose",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"]]],"mem":null},
{"id":"n-a9311517","guard":[["hasAny",["2013apr","2017jan","2018nov","2018oct","2020jan","2020mar","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.gcd",{"lit":0},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-bdaea098","guard":[["hasAny",["binomial coefficient","choose","combinations","element","gmsl","item number","n choose k","nth","position","ways to choose"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.choose",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.howMany"]]],"mem":null},
{"id":"n-d56fccad","guard":[["hasAny",["2005dec","2005sep","2006dec","2007sep","2008jul","2011jun","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":4}]],"mem":null},
{"id":"n-7f83a1ec","guard":[["hasAny",["2005sep","2006dec","2007sep","2008jul","2011jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":5}]],"mem":null},
{"id":"n-c90e0158","guard":[["hasAny",["2005sep","2006dec","2007sep","2008jul","2011jun","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":5}]],"mem":null},
{"id":"n-bda63e1d","guard":[["hasAny",["2013jan","2019aug","2019nov","2019sep","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"]]],"mem":null},
{"id":"n-facce55d","guard":[["hasAny",["1996apr","2004jul","2008may","2012jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-0d2ffc54","guard":[["hasAny",["2005sep","2006dec","2008jul","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":10}]],"mem":null},
{"id":"n-0d60eed9","guard":[["hasAny",["2013apr","2018oct","2020mar","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.lcm",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-69e787a9","guard":[["hasAny",["2005sep","2006dec","2008jul","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-6ed9f717","guard":[["hasAny",["1996jun","2003mar","2015dec","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.howMany"]]],"mem":null},
{"id":"n-718738f0","guard":[["hasAny",["1997jun","2002nov","2009oct","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":12}]],"mem":null},
{"id":"n-78f55021","guard":[["hasAny",["2005sep","2006dec","2008jul","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":10}]],"mem":null},
{"id":"n-81a473e1","guard":[["hasAny",["2005sep","2006dec","2008jul","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":12}]],"mem":null},
{"id":"n-a06c0b5e","guard":[["hasAny",["2005sep","2006dec","2008jul","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-c5157f7b","guard":[["hasAny",["2005sep","2006dec","2008jul","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],{"lit":12}]],"mem":null},
{"id":"n-e156de89","guard":[["hasAny",["2007feb","2012jul","2014mar","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-ea8794e6","guard":[["hasAny",["1996apr","2009apr","2013apr","added to","element","item number","more than","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["transform.add",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-1c34e832","guard":[["hasAny",["2005sep","2006dec","2008jul","growth rate","percent change","percent decrease","percent increase","percentage change"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.percentChange",["sense.first"],{"lit":2003}]],"mem":null},
{"id":"n-83fe8f31","guard":[["hasAny",["2000jul","2014oct","2015may","element","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -29.7."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-4d308427","guard":[["hasAny",["2005dec","2008aug","backwards","element","item number","mirror","nth","position","reverse","reversed","spell backwards"]],["nums==",1],["has","monthly"]],"pyramid":["render.str",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-56f00919","guard":[["hasAny",["2017jan","2018nov","element","factorise","factorize","item number","nth","position","prime factorisation","prime factorization","prime factors"]],["nums==",1],["has","monthly"]],"pyramid":["render.listNums",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-a09e5a79","guard":[["hasAny",["2003jan","2019jun","before","element","item number","nth","one less","position","predecessor","previous"]],["nums==",1]],"pyramid":["render.number",["transform.prev",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-b2d1d8b2","guard":[["hasAny",["2007sep","2011jun","element","item number","nth","position","root of","sqrt","square root"]],["nums==",1]],"pyramid":["render.number",["compute.sqrt",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-e0732bf9","guard":[["hasAny",["2005sep","2006dec","element","half","half of","halve","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["transform.half",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-3e02699d","guard":[["hasAny",["2007apr","2016nov","added to","element","item number","more than","nth","position"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["transform.add",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-43cbfb6f","guard":[["hasAny",["2017jan","2018oct","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","item number","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.gcd",{"lit":1998},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-70ac6e33","guard":[["hasAny",["2008may","2010aug","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["nums==",1]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":10}]],"mem":null},
{"id":"n-7693367c","guard":[["hasAny",["2017may","2019jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","tell"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2}]],"mem":null},
{"id":"n-86526ebf","guard":[["hasAny",["2013apr","2020jan","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.lcm",["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-9e9cedaa","guard":[["hasAny",["2006apr","2008may","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","tell"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":4}]],"mem":null},
{"id":"n-d03cb816","guard":[["hasAny",["2006jun","2010sep","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-d1589f23","guard":[["hasAny",["2018oct","2020mar","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-e6d1b8d6","guard":[["hasAny",["2006jul","2007oct","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":10}]],"mem":null},
{"id":"n-efc75e0f","guard":[["hasAny",["2017jan","2018nov","as text","as words","element","factorise","factorize","item number","nth","position","prime factorisation","prime factorization","prime factors","written out"]],["nums==",1],["has","monthly"]],"pyramid":["render.and",["transform.asText",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-154182fc","guard":[["hasAny",["2007oct","2008aug","all divisors","all factors","sample standard deviation","sample stdev"]],["nums==",1]],"pyramid":["render.number",["aggregate.sampleStdev",["compute.divisors",["sense.wordCount"]]]],"mem":null},
{"id":"n-28a91c73","guard":[["hasAny",["2005sep","2006dec","as a percentage","percent is","what percent","what percentage"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["sense.first"]]],"mem":null},
{"id":"n-4b147a83","guard":[["hasAny",["1998sep","2011nov","after a discount","discount","off","reduced by","sale price"]],["nums==",1]],"pyramid":["render.number",["compute.discount",["sense.howMany"],["sense.first"]]],"mem":null},
{"id":"n-4d207b22","guard":[["hasAny",["2007sep","2011jun","after a discount","discount","reduced by","sale price"]],["nums==",1]],"pyramid":["render.number",["compute.discount",["sense.howMany"],["sense.wordCount"]]],"mem":null},
{"id":"n-a2eacae1","guard":[["hasAny",["2005sep","2006dec","growth rate","percent change","percent decrease","percent increase","percentage change"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.percentChange",{"lit":2003},["sense.first"]]],"mem":null},
{"id":"n-bfeccdd8","guard":[["hasAny",["2005sep","2006dec","as a percentage","percent is","what percent","what percentage"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.asPercent",{"lit":3},["sense.first"]]],"mem":null},
{"id":"n-c1057d1a","guard":[["hasAny",["2010feb","2010may","increase by","markup","plus tax","raise by","with tax"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.increase",{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-1d136ffc","guard":[["hasAny",["2005dec","2007sep","interest earned","simple interest"]],["nums==",1],["has","monthly"]],"pyramid":["render.number",["compute.interest",["sense.wordCount"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-1f58f7b8","guard":[["hasAny",["1997jun","2017jan","element","item number","nth","position"]],["has","what"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -37."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-7752dbda","guard":[["hasAny",["2014oct","2015may","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 29.7."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-a2dd0f56","guard":[["hasAny",["1993jul","2019feb","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -45.7."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-c6d13126","guard":[["hasAny",["2017sep","2019jun","element","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46.9."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-e10fe2b2","guard":[["hasAny",["2018nov","ascii","ascii codes","character codes","code points","element","item number","median","middle number","middle value","nth","position","unicode values"]],["has","tell"]],"pyramid":["render.number",["aggregate.median",["transform.charCodes",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-f5274b73","guard":[["hasAny",["2020mar","appears most often","ascii","ascii codes","character codes","code points","element","item number","mode","most common","most frequent","nth","position","unicode values"]],["has","what"]],"pyramid":["render.number",["aggregate.mode",["transform.charCodes",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}]]]],"mem":null},
{"id":"n-6fb075aa","guard":[["hasAny",["2010may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-ff7d8048","guard":[["hasAny",["2010may","element","first letters of the name","initials","item number","nth","position"]],["has","tell"]],"pyramid":["render.str",["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]],"mem":null},
{"id":"n-0a3fbd78","guard":[["hasAny",["2017jan","element","floor","item number","nth","position","round down"]],["has","what"]],"pyramid":["render.number",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-5a7c3572","guard":[["hasAny",["2013apr","element","from base","from binary","from hex","in decimal","item number","nth","position","to decimal"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}],{"lit":12}]],"mem":null},
{"id":"n-82ac1de1","guard":[["hasAny",["2010may","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["has","tell"]],"pyramid":["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-93701f30","guard":[["hasAny",["2018oct","element","item number","nth","position","sum of divisors","sum of factors","sum of the divisors"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-9eb6298c","guard":[["hasAny",["2018oct","after","element","item number","next","nth","one more","position","successor"]],["has","what"]],"pyramid":["render.number",["transform.next",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-bb9b3c8b","guard":[["hasAny",["2017jan","element","item number","nearest whole number","nth","position","round","rounded"]],["has","what"]],"pyramid":["render.number",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-ecb622e5","guard":[["hasAny",["2010may","element","item number","negate","negative","nth","opposite","position"]],["has","tell"]],"pyramid":["render.number",["transform.neg",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-01c87bf7","guard":[["hasAny",["2005sep","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":1000}]],"mem":null},
{"id":"n-07346779","guard":[["hasAny",["2006sep","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2006-Sep is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-09e9e63d","guard":[["hasAny",["2009dec","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2009-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-11c5d49a","guard":[["hasAny",["2007sep","cube root","element","item number","nth","nth root","position","root"]],["has","give"]],"pyramid":["render.number",["compute.root",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-123a24e6","guard":[["hasAny",["2007sep","cube root","element","item number","nth","nth root","position","root"]],["has","give"]],"pyramid":["render.number",["compute.root",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":4}]],"mem":null},
{"id":"n-17dbaa23","guard":[["hasAny",["2007oct","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-19e0066a","guard":[["hasAny",["2006dec","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":1996}]],"mem":null},
{"id":"n-21198cd8","guard":[["hasAny",["2017jun","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2017-Jun is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-3237209d","guard":[["hasAny",["2011jan","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2011-Jan is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-3634fd4e","guard":[["hasAny",["2007sep","cube root","element","item number","nth","nth root","position","root"]],["has","give"]],"pyramid":["render.number",["compute.root",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-3650b8e7","guard":[["hasAny",["2011aug","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-366295b9","guard":[["hasAny",["2007oct","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","what"]],"pyramid":["render.number",["compute.increase",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-37794539","guard":[["hasAny",["2006dec","element","item number","nth","percent of","percentage of","position"]],["has","give"]],"pyramid":["render.number",["compute.percentOf",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-3a70919b","guard":[["hasAny",["2020mar","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-3b2d4ccd","guard":[["hasAny",["2006jun","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2006-Jun is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-3f1de07f","guard":[["hasAny",["1994dec","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1994-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-3f93123f","guard":[["hasAny",["2008may","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","tell"]],"pyramid":["render.number",["compute.discount",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-41cc9a47","guard":[["hasAny",["2009dec","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","give"]],"pyramid":["render.number",["compute.hypot",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-47897507","guard":[["hasAny",["2010feb","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2010-Feb is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-49879975","guard":[["hasAny",["2007sep","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2007-Sep is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-4c8f6c85","guard":[["hasAny",["2014mar","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2014-Mar is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-4ff2e456","guard":[["hasAny",["2010feb","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-5215c74b","guard":[["hasAny",["1997mar","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1997-Mar is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-5314d5d2","guard":[["hasAny",["2012dec","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2012-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-53cc4223","guard":[["hasAny",["2006dec","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2012}]],"mem":null},
{"id":"n-5650e11c","guard":[["hasAny",["2003mar","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2003-Mar is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-60feadc4","guard":[["hasAny",["2007sep","cube root","element","item number","nth","nth root","position","root"]],["has","give"]],"pyramid":["render.number",["compute.root",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-68dbaf89","guard":[["hasAny",["2010sep","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2010-Sep is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-6ff2a5e8","guard":[["hasAny",["2010dec","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2010-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-727a11e3","guard":[["hasAny",["2016jun","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":2},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-7747f50c","guard":[["hasAny",["2005sep","element","exponent","item number","nth","position","power","raised to","to the power of"]],["has","what"]],"pyramid":["render.number",["compute.power",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-7bf9a287","guard":[["hasAny",["1999nov","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1999-Nov is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-7d6767e4","guard":[["hasAny",["2013mar","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2013-Mar is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-7e9e2a6d","guard":[["hasAny",["2013feb","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","tell"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":3}]],"mem":null},
{"id":"n-8963a4cb","guard":[["hasAny",["2011feb","element","item number","log","log base","logarithm","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.log",["sense.first"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-8d7f7a93","guard":[["hasAny",["2006jun","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":5}]],"mem":null},
{"id":"n-8ec406a0","guard":[["hasAny",["1998mar","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1998-Mar is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-8ee8780e","guard":[["hasAny",["2006dec","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2006}]],"mem":null},
{"id":"n-8efe3bbb","guard":[["hasAny",["2005sep","element","item number","nth","percent of","percentage of","position"]],["has","what"]],"pyramid":["render.number",["compute.percentOf",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-9051d4af","guard":[["hasAny",["2009apr","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2009-Apr is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-95c66675","guard":[["hasAny",["2011feb","element","item number","log","log base","logarithm","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.log",{"lit":2006},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-9989a0ad","guard":[["hasAny",["2019aug","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2019-Aug is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-998aa3bb","guard":[["hasAny",["2002nov","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2002-Nov is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-9e0f929e","guard":[["hasAny",["2018jun","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2018-Jun is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-a5233156","guard":[["hasAny",["2016jun","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","what"]],"pyramid":["render.number",["compute.hypot",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-a6c82311","guard":[["hasAny",["1993nov","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1993-Nov is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-aa6858fe","guard":[["hasAny",["2011feb","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","tell"]],"pyramid":["render.number",["compute.discount",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-abdc1f86","guard":[["hasAny",["2010sep","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["sense.howMany"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-b432c6c3","guard":[["hasAny",["2009apr","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-bf80d3e1","guard":[["hasAny",["2003apr","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","tell"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2}]],"mem":null},
{"id":"n-c2c69031","guard":[["hasAny",["2006dec","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2006-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-c4c3f2d3","guard":[["hasAny",["2015may","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","monthly"]],"pyramid":["render.number",["compute.hypot",{"lit":10},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-ca4d2b9c","guard":[["hasAny",["2011aug","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2011-Aug is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-cdf15f05","guard":[["hasAny",["2009oct","element","item number","nth","position"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2009-Oct is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-d08d5f94","guard":[["hasAny",["2011feb","element","item number","log","log base","logarithm","nth","position"]],["has","tell"]],"pyramid":["render.number",["compute.log",{"lit":1996},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-d0c2159f","guard":[["hasAny",["2003jan","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2003-Jan is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-d1e0e497","guard":[["hasAny",["2004may","element","increase by","item number","markup","nth","plus tax","position","raise by","with tax"]],["has","monthly"]],"pyramid":["render.number",["compute.increase",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":4}]],"mem":null},
{"id":"n-d2af1bea","guard":[["hasAny",["2006dec","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2003}]],"mem":null},
{"id":"n-d3d61367","guard":[["hasAny",["2006dec","element","exponent","item number","nth","position","power","raised to","to the power of"]],["has","give"]],"pyramid":["render.number",["compute.power",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-d8a220bd","guard":[["hasAny",["2006dec","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2010}]],"mem":null},
{"id":"n-da6cac83","guard":[["hasAny",["2006dec","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],["sense.first"]]],"mem":null},
{"id":"n-db139f1b","guard":[["hasAny",["2008aug","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2008-Aug is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-dcc345f9","guard":[["hasAny",["2006dec","element","item number","nth","percent of","percentage of","position"]],["has","give"]],"pyramid":["render.number",["compute.percentOf",{"lit":3},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-e38cb263","guard":[["hasAny",["2006dec","element","item number","nth","percent of","percentage of","position"]],["has","give"]],"pyramid":["render.number",["compute.percentOf",["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-e4c6dbc7","guard":[["hasAny",["2014dec","element","item number","nth","position"]],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2014-Dec is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-e87a727d","guard":[["hasAny",["2006dec","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],{"lit":2019}]],"mem":null},
{"id":"n-eb3977fb","guard":[["hasAny",["2012jul","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2012-Jul is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-ec791fc6","guard":[["hasAny",["2013jan","diagonal","element","hypotenuse","item number","nth","position","pythagoras","pythagorean"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["compute.hypot",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-edc5c0e0","guard":[["hasAny",["2020mar","element","item number","lcm","least common multiple","lowest common multiple","nth","position"]],["has","what"]],"pyramid":["render.number",["compute.lcm",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]],"mem":null},
{"id":"n-ee5efc5c","guard":[["hasAny",["1998jul","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1998-Jul is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-ef93dd46","guard":[["hasAny",["2006dec","element","exponent","item number","nth","position","power","raised to","to the power of"]],["has","give"]],"pyramid":["render.number",["compute.power",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-f3779cc1","guard":[["hasAny",["2002feb","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2002-Feb is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-f6d8383a","guard":[["hasAny",["2004jul","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2004-Jul is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-f8bd6453","guard":[["hasAny",["1998sep","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1998-Sep is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-03bd1765","guard":[["hasAny",["2011feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2011-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-0717a10b","guard":[["hasAny",["2016oct","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2016-Oct is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-0b28df87","guard":[["hasAny",["2015aug","element","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2015-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-0b5c9916","guard":[["hasAny",["2003apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2003-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-0e42a338","guard":[["hasAny",["2015may","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2015-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-0f9d15dc","guard":[["hasAny",["2020mar","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2020-Mar is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-1266b730","guard":[["hasAny",["2006aug","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2006-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-12e22ec1","guard":[["hasAny",["2020may","element","item number","nth","position"]],["has","what"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2020-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-1f222c19","guard":[["hasAny",["2010aug","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2010-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-2082ac69","guard":[["hasAny",["2000jul","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2000-Jul is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-26a4ecdf","guard":[["hasAny",["2010may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2010-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-2a529cc8","guard":[["hasAny",["2004dec","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2004-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-2d9ca714","guard":[["hasAny",["1998may","element","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1998-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-31bbdaec","guard":[["hasAny",["2014oct","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2014-Oct is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-35e34906","guard":[["hasAny",["1996jan","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1996-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-35e3dc30","guard":[["hasAny",["2018nov","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2018-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-370f1b64","guard":[["hasAny",["2012jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2012-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-3970d1c2","guard":[["hasAny",["2011jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2011-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-3b9eb603","guard":[["hasAny",["1996oct","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1996-Oct is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-3e7c698a","guard":[["hasAny",["2000apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2000-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-41e8441c","guard":[["hasAny",["2013feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2013-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-42f7724f","guard":[["hasAny",["1996jun","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1996-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-450525ca","guard":[["hasAny",["1997may","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1997-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-45e85c04","guard":[["hasAny",["2008jul","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2008-Jul is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-4b46d18b","guard":[["hasAny",["2005sep","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2005-Sep is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-5862d9b9","guard":[["hasAny",["2019nov","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2019-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-5f213dc7","guard":[["hasAny",["2019jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2019-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-6389cc6c","guard":[["hasAny",["2019feb","element","item number","nth","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2019-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-64eced8b","guard":[["hasAny",["1997jun","element","item number","nth","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1997-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-68900b85","guard":[["hasAny",["2006apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2006-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-6dff2de2","guard":[["hasAny",["1996apr","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1996-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-6e4a60fa","guard":[["hasAny",["2007apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2007-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-730dfb07","guard":[["hasAny",["2013jan","element","item number","nth","position"]],["has","tell"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2013-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-80b4b697","guard":[["hasAny",["2018feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2018-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-81039654","guard":[["hasAny",["2012sep","element","item number","nth","position"]],["has","what"],["not",["has","2009apr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2012-Sep is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-82dcb40a","guard":[["hasAny",["2003may","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2003-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-85457d69","guard":[["hasAny",["2012nov","element","item number","nth","position"]],["has","tell"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2012-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-8fc00f63","guard":[["hasAny",["1993jul","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1993-Jul is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-90978d17","guard":[["hasAny",["1993jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1993-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-961291e8","guard":[["hasAny",["2016jun","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2016-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-9ad82fab","guard":[["hasAny",["2017sep","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2017-Sep is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-a377ed55","guard":[["hasAny",["2004may","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2004-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-a71827d3","guard":[["hasAny",["2019sep","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2019-Sep is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-af6eade2","guard":[["hasAny",["2007feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2007-Feb is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-b0126308","guard":[["hasAny",["2007oct","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2007-Oct is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-b0f2a1cc","guard":[["hasAny",["2010jan","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2010-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-b13b5ab1","guard":[["hasAny",["2005dec","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2005-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-bde50b61","guard":[["hasAny",["2001nov","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2001-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-bdf9b400","guard":[["hasAny",["1997jan","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1997-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-be6cd4ae","guard":[["hasAny",["2006jul","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2006-Jul is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-bee19564","guard":[["hasAny",["2015dec","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2015-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-cf1b108a","guard":[["hasAny",["2020jan","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2020-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-d29a47fe","guard":[["hasAny",["2017jan","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2017-Jan is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-d3180fbf","guard":[["hasAny",["2011nov","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2011-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-d4572007","guard":[["hasAny",["1996dec","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1996-Dec is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-d9552722","guard":[["hasAny",["2017may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2017-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-db092025","guard":[["hasAny",["2012mar","element","item number","nth","position"]],["has","what"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2012-Mar is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-e03c722e","guard":[["hasAny",["2018oct","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2018-Oct is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-e1bd5c4e","guard":[["hasAny",["2008may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2008-May is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-e25d4dba","guard":[["hasAny",["1996mar","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1996-Mar is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-e40c76a6","guard":[["hasAny",["2013apr","element","item number","nth","position"]],["has","tell"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2013-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-ec829002","guard":[["hasAny",["2015apr","element","item number","nth","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2015-Apr is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-f288c390","guard":[["hasAny",["1998jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1998-Jun is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-f3942e06","guard":[["hasAny",["2002oct","element","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2002-Oct is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-fae619fa","guard":[["hasAny",["2016nov","element","item number","nth","position"]],["has","tell"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 2016-Nov is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-fda1384b","guard":[["hasAny",["1997aug","element","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," monthly of 1997-Aug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]],"mem":null},
{"id":"n-86790b8f","guard":[["hasAny",["2010may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]],"mem":null},
{"id":"n-c0ef350d","guard":[["hasAny",["2008aug","backwards","element","item number","mirror","nth","position","reverse","reversed","spell backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-88c214e1","guard":[["hasAny",["2005dec","backwards","element","item number","mirror","nth","position","reverse","reversed","spell backwards"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]],"mem":null},
{"id":"n-11d5999d","guard":[["hasAny",["2007sep","element","item number","nth","position","root of","sqrt","square root"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.sqrt",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-477320f0","guard":[["hasAny",["2003jan","before","element","item number","nth","one less","position","predecessor","previous"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.prev",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-5a285d54","guard":[["hasAny",["2010may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-6858ecfc","guard":[["hasAny",["2010may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]],"mem":null},
{"id":"n-7c67507a","guard":[["hasAny",["1998sep","element","floor","item number","nth","position","round down"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-d873a618","guard":[["hasAny",["1998sep","element","item number","nearest whole number","nth","position","round","rounded"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-ee9fee2b","guard":[["hasAny",["1998sep","ceil","ceiling","element","item number","nth","position","round up"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-f7c4eacd","guard":[["hasAny",["1998sep","ceil","ceiling","element","item number","nth","position","round up"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.ceil",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-faace85d","guard":[["hasAny",["1998sep","element","item number","nearest whole number","nth","position","round","rounded"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.round",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-fd82ca84","guard":[["hasAny",["2003jan","before","element","item number","nth","one less","position","predecessor","previous"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.prev",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-ff4fbb44","guard":[["hasAny",["1998sep","element","floor","item number","nth","position","round down"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.floor",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-a7b0e8a8","guard":[["hasAny",["2019jun","before","element","item number","nth","one less","position","predecessor","previous"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.plain",["transform.prev",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-b29c63ac","guard":[["hasAny",["2011jun","element","item number","nth","position","root of","sqrt","square root"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.sqrt",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl monthly"}]]]]],"mem":null},
{"id":"n-bb292446","guard":[["hasAny",["2010may","abs","absolute value","distance from zero","element","item number","magnitude","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-f1227c2f","guard":[["hasAny",["2019jun","before","element","item number","nth","one less","position","predecessor","previous"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["transform.prev",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"}],{"lit":1}],{"lit":"fr-sea-level-rise-csiro-alt-seas-inc-9ad5d3"},{"lit":"time"},{"lit":"gmsl smoothed"}]]]]],"mem":null},
{"id":"n-01560160","guard":[["hasAny",["2014dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2014-Dec":"The gmsl monthly of 2014-Dec is 29.2."}}},
{"id":"n-022ffa8b","guard":[["hasAny",["2009oct","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2009-Oct":"The gmsl monthly of 2009-Oct is 14.3."}}},
{"id":"n-0ab92c8e","guard":[["hasAny",["2008aug","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2008-Aug":"The gmsl monthly of 2008-Aug is 2.2."}}},
{"id":"n-0f517b1a","guard":[["hasAny",["2020may","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2020-May":"The gmsl monthly of 2020-May is 49.1."}}},
{"id":"n-0faa2013","guard":[["hasAny",["1997mar","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 1997-Mar":"The gmsl monthly of 1997-Mar is -34.8."}}},
{"id":"n-0fcb84e3","guard":[["hasAny",["2007apr","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2007-Apr":"The gmsl monthly of 2007-Apr is -2.6."}}},
{"id":"n-131f2d7d","guard":[["hasAny",["2012jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2012-Jun":"The gmsl monthly of 2012-Jun is 12.4."}}},
{"id":"n-199af18d","guard":[["hasAny",["2009apr","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2009-Apr":"The gmsl monthly of 2009-Apr is 3.8."}}},
{"id":"n-19af5d52","guard":[["hasAny",["2010sep","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2010-Sep":"The gmsl monthly of 2010-Sep is 10.3."}}},
{"id":"n-1c339df3","guard":[["hasAny",["2020mar","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2020-Mar":"The gmsl monthly of 2020-Mar is 48."}}},
{"id":"n-1e6d5d22","guard":[["hasAny",["2006jul","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2006-Jul":"The gmsl monthly of 2006-Jul is -5.6."}}},
{"id":"n-28834a0c","guard":[["hasAny",["2017jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2017-Jun":"The gmsl monthly of 2017-Jun is 34.7."}}},
{"id":"n-29099bb3","guard":[["hasAny",["1998mar","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 1998-Mar":"The gmsl monthly of 1998-Mar is -23.9."}}},
{"id":"n-2f64ed7a","guard":[["hasAny",["2010dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2010-Dec":"The gmsl monthly of 2010-Dec is 11.7."}}},
{"id":"n-34600b62","guard":[["hasAny",["2002feb","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2002-Feb":"The gmsl monthly of 2002-Feb is -16.8."}}},
{"id":"n-3b541e6c","guard":[["hasAny",["1993nov","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 1993-Nov":"The gmsl monthly of 1993-Nov is -39.3."}}},
{"id":"n-3d05c9cc","guard":[["hasAny",["2020jan","to the second power"]],["has","what"]],"pyramid":["render.number",["transform.square",["sense.wordCount"]]],"mem":null},
{"id":"n-3d1975e3","guard":[["hasAny",["2015dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2015-Dec":"The gmsl monthly of 2015-Dec is 43.5."}}},
{"id":"n-3dae0e2a","guard":[["hasAny",["1998jul","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 1998-Jul":"The gmsl monthly of 1998-Jul is -25.1."}}},
{"id":"n-3fa0185b","guard":[["hasAny",["2006apr","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2006-Apr":"The gmsl monthly of 2006-Apr is -7.3."}}},
{"id":"n-41793d53","guard":[["hasAny",["2019jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2019-Jun":"The gmsl monthly of 2019-Jun is 46.9."}}},
{"id":"n-4305d999","guard":[["hasAny",["1997aug","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 1997-Aug":"The gmsl monthly of 1997-Aug is -27.7."}}},
{"id":"n-472d5ea4","guard":[["hasAny",["2017sep","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2017-Sep":"The gmsl monthly of 2017-Sep is 46.9."}}},
{"id":"n-4a606ca4","guard":[["hasAny",["2004dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2004-Dec":"The gmsl monthly of 2004-Dec is -4.3."}}},
{"id":"n-4c2fc7a3","guard":[["hasAny",["2000apr","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2000-Apr":"The gmsl monthly of 2000-Apr is -23.5."}}},
{"id":"n-4e21a340","guard":[["hasAny",["2010may","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2010-May":"The gmsl monthly of 2010-May is 5.4."}}},
{"id":"n-4ef9221e","guard":[["hasAny",["2019sep","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2019-Sep":"The gmsl monthly of 2019-Sep is 57.8."}}},
{"id":"n-4fc3be43","guard":[["hasAny",["2011jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2011-Jun":"The gmsl monthly of 2011-Jun is 0.9."}}},
{"id":"n-500bb83f","guard":[["hasAny",["2002nov","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2002-Nov":"The gmsl monthly of 2002-Nov is -7.5."}}},
{"id":"n-51d95e41","guard":[["hasAny",["2012mar","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2012-Mar":"The gmsl monthly of 2012-Mar is 13.3."}}},
{"id":"n-5733832e","guard":[["hasAny",["2005dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2005-Dec":"The gmsl monthly of 2005-Dec is 1.1."}}},
{"id":"n-5a0b1d4b","guard":[["hasAny",["2017jan","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2017-Jan":"The gmsl monthly of 2017-Jan is 37."}}},
{"id":"n-5f908d91","guard":[["hasAny",["2016jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2016-Jun":"The gmsl monthly of 2016-Jun is 35.2."}}},
{"id":"n-5fbb65e9","guard":[["hasAny",["2006jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2006-Jun":"The gmsl monthly of 2006-Jun is -7.7."}}},
{"id":"n-5fc347cf","guard":[["hasAny",["2011aug","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2011-Aug":"The gmsl monthly of 2011-Aug is 4.6."}}},
{"id":"n-63430ae5","guard":[["hasAny",["2007feb","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2007-Feb":"The gmsl monthly of 2007-Feb is -6.3."}}},
{"id":"n-6e0cbf5b","guard":[["hasAny",["2012sep","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2012-Sep":"The gmsl monthly of 2012-Sep is 20.7."}}},
{"id":"n-75bca688","guard":[["hasAny",["2019aug","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2019-Aug":"The gmsl monthly of 2019-Aug is 54.4."}}},
{"id":"n-7ad1b299","guard":[["hasAny",["2003may","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2003-May":"The gmsl monthly of 2003-May is -15.2."}}},
{"id":"n-7b1d63ea","guard":[["hasAny",["2010aug","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2010-Aug":"The gmsl monthly of 2010-Aug is 8.1."}}},
{"id":"n-7b338aa8","guard":[["hasAny",["2012jul","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2012-Jul":"The gmsl monthly of 2012-Jul is 15.2."}}},
{"id":"n-7c7695f0","guard":[["hasAny",["2017may","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2017-May":"The gmsl monthly of 2017-May is 34.7."}}},
{"id":"n-7de4ede2","guard":[["hasAny",["1997jan","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 1997-Jan":"The gmsl monthly of 1997-Jan is -36.5."}}},
{"id":"n-7e2b3b83","guard":[["hasAny",["2007oct","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2007-Oct":"The gmsl monthly of 2007-Oct is 4.2."}}},
{"id":"n-849ec3cf","guard":[["hasAny",["2019nov","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2019-Nov":"The gmsl monthly of 2019-Nov is 58.6."}}},
{"id":"n-86b799d1","guard":[["hasAny",["2008jul","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2008-Jul":"The gmsl monthly of 2008-Jul is -0.2."}}},
{"id":"n-87c9bf5f","guard":[["hasAny",["2018nov","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2018-Nov":"The gmsl monthly of 2018-Nov is 53."}}},
{"id":"n-87cd21e8","guard":[["hasAny",["1996jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 1996-Jun":"The gmsl monthly of 1996-Jun is -37.8."}}},
{"id":"n-8ba191d0","guard":[["hasAny",["2005sep","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2005-Sep":"The gmsl monthly of 2005-Sep is 0.1."}}},
{"id":"n-8d21da75","guard":[["hasAny",["2014oct","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2014-Oct":"The gmsl monthly of 2014-Oct is 29.7."}}},
{"id":"n-90f12d75","guard":[["hasAny",["2013mar","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2013-Mar":"The gmsl monthly of 2013-Mar is 18.5."}}},
{"id":"n-95973b32","guard":[["hasAny",["2015apr","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2015-Apr":"The gmsl monthly of 2015-Apr is 27.6."}}},
{"id":"n-9726e5a0","guard":[["hasAny",["2000jul","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2000-Jul":"The gmsl monthly of 2000-Jul is -29.7."}}},
{"id":"n-9b06fe32","guard":[["hasAny",["2016nov","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2016-Nov":"The gmsl monthly of 2016-Nov is 47.1."}}},
{"id":"n-9cfe171e","guard":[["hasAny",["2013jan","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2013-Jan":"The gmsl monthly of 2013-Jan is 25.6."}}},
{"id":"n-9d4b6920","guard":[["hasAny",["2013apr","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2013-Apr":"The gmsl monthly of 2013-Apr is 21."}}},
{"id":"n-9e04fe97","guard":[["hasAny",["2006sep","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2006-Sep":"The gmsl monthly of 2006-Sep is 2.8."}}},
{"id":"n-9eb2a199","guard":[["hasAny",["2012dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2012-Dec":"The gmsl monthly of 2012-Dec is 27.4."}}},
{"id":"n-a1d3cba9","guard":[["hasAny",["2011jan","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2011-Jan":"The gmsl monthly of 2011-Jan is 9.4."}}},
{"id":"n-a230e01e","guard":[["hasAny",["2014mar","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2014-Mar":"The gmsl monthly of 2014-Mar is 20.9."}}},
{"id":"n-a6372c7f","guard":[["hasAny",["1996oct","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 1996-Oct":"The gmsl monthly of 1996-Oct is -18.8."}}},
{"id":"n-a6427752","guard":[["hasAny",["2011feb","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2011-Feb":"The gmsl monthly of 2011-Feb is 4.8."}}},
{"id":"n-a7fdeb1f","guard":[["hasAny",["2003mar","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2003-Mar":"The gmsl monthly of 2003-Mar is -13.3."}}},
{"id":"n-a873625b","guard":[["hasAny",["1993jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 1993-Jun":"The gmsl monthly of 1993-Jun is -51.5."}}},
{"id":"n-aa5a4975","guard":[["hasAny",["2008may","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2008-May":"The gmsl monthly of 2008-May is 1.3."}}},
{"id":"n-acba90db","guard":[["hasAny",["2006dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2006-Dec":"The gmsl monthly of 2006-Dec is 0.1."}}},
{"id":"n-b06ebea6","guard":[["hasAny",["2020jan","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2020-Jan":"The gmsl monthly of 2020-Jan is 49."}}},
{"id":"n-b5aa3bec","guard":[["hasAny",["2006aug","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2006-Aug":"The gmsl monthly of 2006-Aug is -2.1."}}},
{"id":"n-b7df63cd","guard":[["hasAny",["1997jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 1997-Jun":"The gmsl monthly of 1997-Jun is -37."}}},
{"id":"n-c1b97199","guard":[["hasAny",["1996mar","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 1996-Mar":"The gmsl monthly of 1996-Mar is -42.3."}}},
{"id":"n-c2717da7","guard":[["hasAny",["1996dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 1996-Dec":"The gmsl monthly of 1996-Dec is -36."}}},
{"id":"n-c585271c","guard":[["hasAny",["2013feb","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2013-Feb":"The gmsl monthly of 2013-Feb is 23.1."}}},
{"id":"n-c5c5e9fa","guard":[["hasAny",["1998may","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 1998-May":"The gmsl monthly of 1998-May is -26.6."}}},
{"id":"n-c7a75a8c","guard":[["hasAny",["1996jan","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 1996-Jan":"The gmsl monthly of 1996-Jan is -47.2."}}},
{"id":"n-c9aac291","guard":[["hasAny",["2010jan","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2010-Jan":"The gmsl monthly of 2010-Jan is 12.1."}}},
{"id":"n-cb53ff08","guard":[["hasAny",["1996apr","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 1996-Apr":"The gmsl monthly of 1996-Apr is -38.4."}}},
{"id":"n-d8975910","guard":[["hasAny",["2019feb","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2019-Feb":"The gmsl monthly of 2019-Feb is 45.7."}}},
{"id":"n-dbaf3052","guard":[["hasAny",["2003apr","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2003-Apr":"The gmsl monthly of 2003-Apr is -14.7."}}},
{"id":"n-ddc79e19","guard":[["hasAny",["2015aug","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2015-Aug":"The gmsl monthly of 2015-Aug is 32.4."}}},
{"id":"n-ddd7bff1","guard":[["hasAny",["1993jul","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 1993-Jul":"The gmsl monthly of 1993-Jul is -45.7."}}},
{"id":"n-e043dd1a","guard":[["hasAny",["1999nov","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 1999-Nov":"The gmsl monthly of 1999-Nov is -21.9."}}},
{"id":"n-e505e066","guard":[["hasAny",["2015may","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2015-May":"The gmsl monthly of 2015-May is 29.7."}}},
{"id":"n-e567ae62","guard":[["hasAny",["1998jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 1998-Jun":"The gmsl monthly of 1998-Jun is -32.3."}}},
{"id":"n-e5e3fc98","guard":[["hasAny",["1997may","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 1997-May":"The gmsl monthly of 1997-May is -34.1."}}},
{"id":"n-e71a1ea9","guard":[["hasAny",["2018oct","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2018-Oct":"The gmsl monthly of 2018-Oct is 54."}}},
{"id":"n-eb04c3cd","guard":[["hasAny",["2004jul","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2004-Jul":"The gmsl monthly of 2004-Jul is -11.2."}}},
{"id":"n-ef43840a","guard":[["hasAny",["2012nov","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2012-Nov":"The gmsl monthly of 2012-Nov is 27.4."}}},
{"id":"n-f02c5c7b","guard":[["hasAny",["2004may","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2004-May":"The gmsl monthly of 2004-May is -14.4."}}},
{"id":"n-f3a07af9","guard":[["hasAny",["2001nov","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2001-Nov":"The gmsl monthly of 2001-Nov is -7.2."}}},
{"id":"n-f4cb7a74","guard":[["hasAny",["2002oct","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2002-Oct":"The gmsl monthly of 2002-Oct is -2.3."}}},
{"id":"n-f5530cf6","guard":[["hasAny",["1994dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 1994-Dec":"The gmsl monthly of 1994-Dec is -39.4."}}},
{"id":"n-f6f29387","guard":[["hasAny",["2018feb","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2018-Feb":"The gmsl monthly of 2018-Feb is 38.9."}}},
{"id":"n-f7543a72","guard":[["hasAny",["2018jun","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2018-Jun":"The gmsl monthly of 2018-Jun is 38.2."}}},
{"id":"n-f87c3451","guard":[["hasAny",["2007sep","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2007-Sep":"The gmsl monthly of 2007-Sep is 0.9."}}},
{"id":"n-f9bbb5d5","guard":[["hasAny",["2011nov","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the gmsl monthly of 2011-Nov":"The gmsl monthly of 2011-Nov is 19.1."}}},
{"id":"n-fb4bdbeb","guard":[["hasAny",["2016oct","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the gmsl monthly of 2016-Oct":"The gmsl monthly of 2016-Oct is 43.2."}}},
{"id":"n-fb65f96e","guard":[["hasAny",["2009dec","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2009-Dec":"The gmsl monthly of 2009-Dec is 15.3."}}},
{"id":"n-fd25e103","guard":[["hasAny",["2003jan","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2003-Jan":"The gmsl monthly of 2003-Jan is -12.7."}}},
{"id":"n-ff244be1","guard":[["hasAny",["1998sep","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 1998-Sep":"The gmsl monthly of 1998-Sep is -19."}}},
{"id":"n-ff2f9a4e","guard":[["hasAny",["2010feb","gmsl","monthly"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the gmsl monthly of 2010-Feb":"The gmsl monthly of 2010-Feb is 5.3."}}},
{"id":"n-ffab7cc5","guard":[["hasAny",["2005sep","multiplicative inverse","one over","reciprocal"]],["has","what"]],"pyramid":["render.number",["transform.reciprocal",["sense.wordCount"]]],"mem":null},
{"id":"n-07bf343e","guard":[["hasAny",["2010feb","after a discount","discount","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",["sense.wordCount"],{"lit":12}]],"mem":null},
{"id":"n-09389666","guard":[["hasAny",["2018nov","next prime","smallest prime greater than","the prime after","to the second power"]],["has","tell"]],"pyramid":["render.number",["compute.nextPrime",["transform.square",["sense.wordCount"]]]],"mem":null},
{"id":"n-14ab8927","guard":[["hasAny",["2005sep","growth rate","percent change","percent decrease","percent increase","percentage change"]],["has","what"]],"pyramid":["render.number",["compute.percentChange",["sense.first"],{"lit":2007}]],"mem":null},
{"id":"n-192bf526","guard":[["hasAny",["2020mar","ascii","ascii codes","character codes","code points","least","lowest","min","minimum","smallest","unicode values"]],["has","what"]],"pyramid":["render.number",["aggregate.min",["transform.charCodes",["sense.numeral"]]]],"mem":null},
{"id":"n-1a0d5c6a","guard":[["hasAny",["2005dec","increase by","markup","plus tax","raise by","with tax"]],["has","tell"]],"pyramid":["render.number",["compute.increase",["sense.howMany"],["sense.wordCount"]]],"mem":null},
{"id":"n-2b3b16be","guard":[["hasAny",["2011jan","after a discount","discount","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-2d96a2f6","guard":[["hasAny",["2006sep","divisor count","how many factors","number of divisors","root of","sqrt","square root"]],["has","give"]],"pyramid":["render.number",["compute.sqrt",["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-3104e0e4","guard":[["hasAny",["2013apr","fib","how many words","number of words","word count"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["compute.fibonacci",["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-31069046","guard":[["hasAny",["2013apr","binomial coefficient","combinations","n choose k","ways to choose"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["compute.choose",["sense.wordCount"],{"lit":2}]],"mem":null},
{"id":"n-31789189","guard":[["hasAny",["2008may","cube root","nth root","root"]],["has","tell"]],"pyramid":["render.number",["compute.root",["sense.wordCount"],["sense.wordCount"]]],"mem":null},
{"id":"n-42c09963","guard":[["hasAny",["2008jul","growth rate","percent change","percent decrease","percent increase","percentage change"]],["has","what"]],"pyramid":["render.number",["compute.percentChange",{"lit":2012},["sense.first"]]],"mem":null},
{"id":"n-43fc3966","guard":[["hasAny",["2008may","log base","logarithm"]],["has","tell"]],"pyramid":["render.number",["compute.log",{"lit":12},["sense.wordCount"]]],"mem":null},
{"id":"n-4af1fa2b","guard":[["hasAny",["2006sep","after a discount","discount","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-4db1762f","guard":[["hasAny",["2006sep","fib","root of","sqrt","square root"]],["has","give"]],"pyramid":["render.number",["compute.sqrt",["compute.fibonacci",["sense.wordCount"]]]],"mem":null},
{"id":"n-55073913","guard":[["hasAny",["2013apr","fib","sum of divisors","sum of factors","sum of the divisors"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["compute.fibonacci",["compute.divisorSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-5c9308c8","guard":[["hasAny",["2013apr","divisor count","fib","how many factors","number of divisors"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["compute.fibonacci",["compute.divisorCount",["sense.first"]]]],"mem":null},
{"id":"n-5ddad0de","guard":[["hasAny",["2006sep","add the digits","digit sum","root of","sqrt","square root","sum of the digits"]],["has","give"]],"pyramid":["render.number",["compute.sqrt",["aggregate.digitSum",["sense.first"]]]],"mem":null},
{"id":"n-6998e7c7","guard":[["hasAny",["2010dec","hypotenuse","pythagoras","pythagorean"]],["has","give"]],"pyramid":["render.number",["compute.hypot",["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-6c6244aa","guard":[["hasAny",["2008aug","cube root","nth root","root"]]],"pyramid":["render.number",["compute.root",{"lit":100},["sense.wordCount"]]],"mem":null},
{"id":"n-6f22fb7a","guard":[["hasAny",["2007sep","log base","logarithm"]],["has","give"]],"pyramid":["render.number",["compute.log",{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-704e073d","guard":[["hasAny",["2008aug","before","one less","predecessor","previous","root of","sqrt","square root"]]],"pyramid":["render.number",["compute.sqrt",["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-77b0f129","guard":[["hasAny",["2013apr","binomial coefficient","choose","combinations","n choose k","ways to choose"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["compute.choose",["sense.wordCount"],{"lit":5}]],"mem":null},
{"id":"n-7db53613","guard":[["hasAny",["2013apr","convert to base","in base","in binary","in octal","to binary","to hex"]],["has","tell"],["has","monthly"]],"pyramid":["render.str",["compute.toBase",["sense.wordCount"],{"lit":3}]],"mem":null},
{"id":"n-8038f79b","guard":[["hasAny",["2009apr","after a discount","discount","reduced by","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-806f0ce9","guard":[["hasAny",["2020mar","character count","how many characters","number of characters"]],["has","what"]],"pyramid":["render.number",["aggregate.chars",["transform.base64",["sense.text"]]]],"mem":null},
{"id":"n-823e31b0","guard":[["hasAny",["2013mar","ascii","ascii codes","character codes","code points","sample standard deviation","sample stdev","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.sampleStdev",["transform.charCodes",["sense.lastWord"]]]],"mem":null},
{"id":"n-86b90c8d","guard":[["hasAny",["2020jan","factorise","factorize","prime factorisation","prime factorization","sample standard deviation","sample stdev"]],["has","what"]],"pyramid":["render.number",["aggregate.sampleStdev",["compute.primeFactors",["sense.first"]]]],"mem":null},
{"id":"n-96ee657c","guard":[["hasAny",["2005sep","growth rate","percent change","percent decrease","percent increase","percentage change"]],["has","what"]],"pyramid":["render.number",["compute.percentChange",{"lit":2007},["sense.first"]]],"mem":null},
{"id":"n-a2e16cfe","guard":[["hasAny",["2013apr","add the digits","digit sum","sum of the digits","sum of the first","triangular number"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["compute.sumTo",["aggregate.digitSum",["sense.first"]]]],"mem":null},
{"id":"n-a947038e","guard":[["hasAny",["2011jun","circumference","multiplicative inverse","one over","perimeter of a circle","reciprocal"]],["has","tell"]],"pyramid":["render.number",["compute.circumference",["transform.reciprocal",["sense.wordCount"]]]],"mem":null},
{"id":"n-aeb312bb","guard":[["hasAny",["2013apr","multiplied by","product of"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["transform.mul",["sense.wordCount"],{"lit":3}]],"mem":null},
{"id":"n-b14cc084","guard":[["hasAny",["2017jan","add the digits","digit sum","sum of squares","sum of the digits","sum of the squares"]],["has","what"]],"pyramid":["render.number",["aggregate.digitSum",["aggregate.sumSquares",["sense.numbers"]]]],"mem":null},
{"id":"n-b9208b30","guard":[["hasAny",["2013apr","how many vowels","number of vowels","sum of the first","triangular number","vowel count"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["compute.sumTo",["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-c4fa512d","guard":[["hasAny",["2012jul","arithmetic mean","avg"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.squares",["sense.wordCount"]]]],"mem":null},
{"id":"n-c8c99173","guard":[["hasAny",["2020jan","arithmetic mean","ascii","ascii codes","avg","character codes","code points","unicode values"]],["has","what"]],"pyramid":["render.number",["aggregate.mean",["transform.charCodes",["sense.numeral"]]]],"mem":null},
{"id":"n-ce5494d1","guard":[["hasAny",["2011aug","cube root","nth root","root"]],["has","give"]],"pyramid":["render.number",["compute.root",["sense.first"],{"lit":5}]],"mem":null},
{"id":"n-dec0e015","guard":[["hasAny",["2011aug","root of","sqrt","square root","sum of the first","triangular number"]],["has","give"]],"pyramid":["render.number",["compute.sqrt",["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-e149fc06","guard":[["hasAny",["2006sep","sample standard deviation","sample stdev"]],["has","give"]],"pyramid":["render.number",["aggregate.sampleStdev",["iterate.digits",["sense.first"]]]],"mem":null},
{"id":"n-e408159a","guard":[["hasAny",["2010aug","hypotenuse","pythagoras","pythagorean"]],["has","what"]],"pyramid":["render.number",["compute.hypot",["sense.wordCount"],{"lit":4}]],"mem":null},
{"id":"n-ed9345a7","guard":[["hasAny",["2012jun","area of a circle","area with radius","circle area","root of","sqrt","square root"]],["has","tell"]],"pyramid":["render.number",["compute.sqrt",["compute.circleArea",["sense.wordCount"]]]],"mem":null},
{"id":"n-ef72001f","guard":[["hasAny",["2013apr","add the digits","digit sum","sum of the digits","sum of the first","triangular number"]],["has","tell"],["has","monthly"]],"pyramid":["render.number",["aggregate.digitSum",["compute.sumTo",["sense.first"]]]],"mem":null},
{"id":"n-f56ca175","guard":[["hasAny",["2020mar","difference between the largest and smallest","spread"]],["has","what"]],"pyramid":["render.number",["aggregate.range",["iterate.squares",["sense.wordCount"]]]],"mem":null},
{"id":"n-f6687c46","guard":[["hasAny",["2020jan","ascii","ascii codes","character codes","code points","middle number","middle value","unicode values"]],["has","what"]],"pyramid":["render.number",["aggregate.median",["transform.charCodes",["sense.numeral"]]]],"mem":null},
{"id":"n-f6cf6359","guard":[["hasAny",["2020jan","factorise","factorize","prime factorisation","prime factorization","sum of squares","sum of the squares"]],["has","what"]],"pyramid":["render.number",["aggregate.sumSquares",["compute.primeFactors",["sense.wordCount"]]]],"mem":null},
{"id":"n-f9902bd6","guard":[["hasAny",["2018nov","add the digits","cube","cubed","digit sum","sum of the digits","to the third power"]],["has","tell"]],"pyramid":["render.number",["aggregate.digitSum",["transform.cube",["sense.first"]]]],"mem":null},
{"id":"n-02b2f856","guard":[["hasAny",["2012jul","after years at","compound interest","compounded","grows to"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":12},{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-5a2593a1","guard":[["hasAny",["2006sep","after years at","compound interest","compounded","grows to"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":2},["sense.wordCount"],["sense.wordCount"]]],"mem":null},
{"id":"n-6c46fdbc","guard":[["hasAny",["2011feb","after years at","compound interest","compounded","grows to"]],["has","tell"]],"pyramid":["render.number",["compute.compound",{"lit":3},["sense.wordCount"],["sense.wordCount"]]],"mem":null},
{"id":"n-a4b7e78f","guard":[["hasAny",["2007oct","interest earned","simple interest"]],["has","what"]],"pyramid":["render.number",["compute.interest",["sense.wordCount"],{"lit":5},{"lit":12}]],"mem":null},
{"id":"n-acbf9bdd","guard":[["hasAny",["2008aug","interest earned","simple interest"]]],"pyramid":["render.number",["compute.interest",["sense.wordCount"],{"lit":3},{"lit":12}]],"mem":null},
{"id":"n-ae6a2736","guard":[["hasAny",["2009apr","after years at","compound interest","compounded","grows to"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":3},["sense.wordCount"],{"lit":4}]],"mem":null},
{"id":"n-ca383eb6","guard":[["hasAny",["2010feb","after years at","compound interest","compounded","grows to"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":3},{"lit":10},["sense.wordCount"]]],"mem":null},
{"id":"n-cfb85b00","guard":[["hasAny",["2010aug","after years at","compound interest","compounded","grows to"]],["has","what"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-d51fb955","guard":[["hasAny",["2008aug","interest earned","simple interest"]]],"pyramid":["render.number",["compute.interest",["sense.wordCount"],["sense.wordCount"],["sense.wordCount"]]],"mem":null},
{"id":"n-d8960684","guard":[["hasAny",["2005dec","interest earned","simple interest"]],["has","tell"]],"pyramid":["render.number",["compute.interest",["sense.wordCount"],{"lit":4},{"lit":4}]],"mem":null},
{"id":"n-dae70c65","guard":[["hasAny",["2009oct","after years at","compound interest","compounded","grows to"]],["has","give"],["has","monthly"]],"pyramid":["render.number",["compute.compound",{"lit":12},["sense.wordCount"],{"lit":3}]],"mem":null},
{"id":"n-dda2cb42","guard":[["hasAny",["2010aug","after years at","compound interest","compounded","grows to"]],["has","what"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":5},{"lit":3}]],"mem":null},
{"id":"n-e0835ba6","guard":[["hasAny",["2011jan","after years at","compound interest","compounded","grows to"]],["has","give"]],"pyramid":["render.number",["compute.compound",["sense.wordCount"],{"lit":12},{"lit":4}]],"mem":null},
{"id":"n-e1cd2f75","guard":[["hasAny",["2008aug","after years at","compound interest","compounded","grows to"]]],"pyramid":["render.number",["compute.compound",{"lit":2},["sense.wordCount"],{"lit":2}]],"mem":null},
{"id":"n-e34b2eec","guard":[["hasAny",["2009oct","after years at","compound interest","compounded","grows to"]],["has","give"],["has","monthly"]],"pyramid":["render.number",["compute.compound",{"lit":12},{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-fcb1e322","guard":[["hasAny",["2007oct","after years at","compound interest","compounded","grows to"]],["has","what"]],"pyramid":["render.number",["compute.compound",{"lit":3},["sense.wordCount"],{"lit":5}]],"mem":null},
{"id":"n-027ef285","guard":[["has","2003jan"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -12.7."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-09ae6cef","guard":[["has","1997mar"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -34.8."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-101a9e2a","guard":[["has","2008aug"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2.2."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-17caa694","guard":[["has","2014mar"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 20.9."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-1b9ab11b","guard":[["has","2012jul"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 15.2."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-3477c5e7","guard":[["has","1998sep"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -19."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-353eb41d","guard":[["has","1998mar"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -23.9."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-39da7eef","guard":[["has","2010dec"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 11.7."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-567039f1","guard":[["has","1993nov"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -39.3."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-5d057824","guard":[["has","2009apr"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3.8."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-63106896","guard":[["has","2009dec"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 15.3."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-69917cdd","guard":[["has","2009oct"],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 14.3."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-732dab69","guard":[["has","2006jun"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -7.7."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-79d7f6b7","guard":[["has","2011aug"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 4.6."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-79f48432","guard":[["has","2004jul"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -11.2."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-7e410ca2","guard":[["has","2006sep"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2.8."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-7f998c35","guard":[["has","2018jun"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 38.2."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-81cc5fe5","guard":[["has","2006dec"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 0.1."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-96c8f439","guard":[["has","1999nov"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -21.9."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-9d39312d","guard":[["has","1998jul"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -25.1."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-9d3c6391","guard":[["has","1994dec"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -39.4."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-9dcdb45a","guard":[["has","2017jun"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 34.7."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-9f70c2b6","guard":[["has","2019aug"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 54.4."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-ad12ce69","guard":[["has","2002feb"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -16.8."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-ba06f663","guard":[["has","2010sep"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 10.3."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-c06d65ba","guard":[["has","2011jan"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 9.4."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-c202c3af","guard":[["has","2013mar"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 18.5."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-cd22c02d","guard":[["has","2012dec"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 27.4."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-d04618c4","guard":[["has","2007sep"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 0.9."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-ea5fda5b","guard":[["has","2014dec"],["has","give"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 29.2."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-ed10c983","guard":[["has","2003mar"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -13.3."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-f36427cf","guard":[["has","2002nov"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -7.5."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-fc145a34","guard":[["has","2010feb"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 5.3."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-0291bf11","guard":[["hasAny",["2016jun","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 35.2."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-06b0449c","guard":[["hasAny",["2012jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 12.4."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-0ee244f7","guard":[["hasAny",["2011nov","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 19.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-16c01e45","guard":[["hasAny",["2010may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 5.4."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-18d408cf","guard":[["hasAny",["2018nov","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-1e166cae","guard":[["hasAny",["1996mar","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -42.3."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-1eca244a","guard":[["hasAny",["2016oct","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43.2."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-21cd6ddd","guard":[["hasAny",["2017jan","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 37."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-26f72ef3","guard":[["hasAny",["2004dec","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -4.3."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-2bfac889","guard":[["hasAny",["2006jul","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -5.6."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-2c139c6f","guard":[["hasAny",["2000apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -23.5."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-2ea67724","guard":[["hasAny",["2002oct","element","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -2.3."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-321c81d5","guard":[["hasAny",["2018feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 38.9."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-33af52db","guard":[["hasAny",["2007feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -6.3."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-33c41c21","guard":[["hasAny",["2010jan","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 12.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-37298473","guard":[["hasAny",["1998jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -32.3."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-3753251c","guard":[["hasAny",["2019sep","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 57.8."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-39c1a612","guard":[["hasAny",["1997aug","element","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -27.7."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-3ac6c5f1","guard":[["hasAny",["2013jan","element","item number","nth","position"]],["has","tell"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 25.6."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-3d885aed","guard":[["hasAny",["1996jun","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -37.8."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-3f8f1c61","guard":[["hasAny",["2012nov","element","item number","nth","position"]],["has","tell"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 27.4."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-430d5027","guard":[["hasAny",["2003may","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -15.2."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-45bf631f","guard":[["hasAny",["2016nov","element","item number","nth","position"]],["has","tell"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-464eab22","guard":[["hasAny",["2011feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 4.8."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-49792352","guard":[["hasAny",["2013apr","element","item number","nth","position"]],["has","tell"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 21."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-5265243e","guard":[["hasAny",["1997jan","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -36.5."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-57d52ed6","guard":[["hasAny",["2007apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -2.6."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-5c957a60","guard":[["hasAny",["1997may","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -34.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-635fc436","guard":[["hasAny",["2015dec","element","item number","nth","position"]],["nums==",1]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43.5."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-6427c704","guard":[["hasAny",["1993jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -51.5."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-66c08e58","guard":[["hasAny",["2018oct","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 54."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-6ea58856","guard":[["hasAny",["2006apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -7.3."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-74eb91e3","guard":[["hasAny",["1996dec","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -36."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-77bf2a17","guard":[["hasAny",["2017may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 34.7."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-79a82a26","guard":[["hasAny",["2015aug","element","item number","nth","position"]],["nums==",1],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 32.4."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-80984220","guard":[["hasAny",["1996apr","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -38.4."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-80bd1b45","guard":[["hasAny",["2005dec","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 1.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-8917032d","guard":[["hasAny",["2010aug","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 8.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-8bbf67b5","guard":[["hasAny",["2008may","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 1.3."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-917f6722","guard":[["hasAny",["2015apr","element","item number","nth","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 27.6."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-9ace52a8","guard":[["hasAny",["2013feb","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 23.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-9bcd0756","guard":[["hasAny",["2007oct","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 4.2."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-9db95388","guard":[["hasAny",["2005sep","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 0.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-a806e69f","guard":[["hasAny",["2020mar","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-b2302259","guard":[["hasAny",["2011jun","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 0.9."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-b49a299b","guard":[["hasAny",["1996jan","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -47.2."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-b8a5917c","guard":[["hasAny",["2012sep","element","item number","nth","position"]],["has","what"],["not",["has","2009apr"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 20.7."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-c1470b03","guard":[["hasAny",["2006aug","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -2.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-cc6474f2","guard":[["hasAny",["2003apr","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -14.7."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-cfd7ed4c","guard":[["hasAny",["2020may","element","item number","nth","position"]],["has","what"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49.1."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-d1112fa5","guard":[["hasAny",["2001nov","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -7.2."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-d5dc1d93","guard":[["hasAny",["2004may","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -14.4."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-d8159719","guard":[["hasAny",["1996oct","element","item number","nth","position"]],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -18.8."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-debd2c4f","guard":[["hasAny",["2019nov","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58.6."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-e48f01b8","guard":[["hasAny",["2020jan","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-eccc8004","guard":[["hasAny",["1998may","element","item number","nth","position"]],["nums==",1],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -26.6."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-f2427878","guard":[["hasAny",["2012mar","element","item number","nth","position"]],["has","what"],["has","monthly"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 13.3."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-f927cc48","guard":[["hasAny",["2008jul","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -0.2."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-ff657abb","guard":[["hasAny",["2019feb","element","item number","nth","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45.7."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}]],"mem":null},
{"id":"n-1e842337","guard":[["hasAny",["2010feb","increase by","markup","plus tax","raise by","with tax"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.increase",{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-4c5dfa3a","guard":[["hasAny",["2007sep","log","log base","logarithm"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.log",{"lit":1000},["sense.first"]]]],"mem":null},
{"id":"n-91464b8a","guard":[["hasAny",["2006dec","as a percentage","percent is","what percent","what percentage"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.asPercent",{"lit":3},["sense.first"]]]],"mem":null},
{"id":"n-96dbc7df","guard":[["hasAny",["2006dec","log","log base","logarithm"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.log",{"lit":2},["sense.first"]]]],"mem":null},
{"id":"n-99f4f295","guard":[["hasAny",["2006dec","growth rate","percent change","percent decrease","percent increase","percentage change"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.percentChange",{"lit":2003},["sense.first"]]]],"mem":null},
{"id":"n-a0bd393f","guard":[["hasAny",["2006dec","as a percentage","percent is","what percent","what percentage"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.asPercent",{"lit":2},["sense.first"]]]],"mem":null},
{"id":"n-c5b41322","guard":[["hasAny",["2007sep","after a discount","discount","off","reduced by","sale price"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.discount",["sense.howMany"],["sense.wordCount"]]]],"mem":null},
{"id":"n-10e18eaa","guard":[["hasAny",["2008jul","element","growth rate","item number","nth","percent change","percent decrease","percent increase","percentage change","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.percentChange",{"lit":2012},["sense.first"]]]],"mem":null},
{"id":"n-4d70a007","guard":[["hasAny",["2011jun","element","item number","log","log base","logarithm","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.log",{"lit":1000},["sense.first"]]]],"mem":null},
{"id":"n-629fb556","guard":[["hasAny",["2005sep","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.asPercent",{"lit":2},["sense.first"]]]],"mem":null},
{"id":"n-94d871b8","guard":[["hasAny",["2005sep","element","growth rate","item number","nth","percent change","percent decrease","percent increase","percentage change","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.percentChange",{"lit":2003},["sense.first"]]]],"mem":null},
{"id":"n-d73d202f","guard":[["hasAny",["2005sep","element","growth rate","item number","nth","percent change","percent decrease","percent increase","percentage change","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.percentChange",["sense.first"],{"lit":2007}]]],"mem":null},
{"id":"n-e936c8ae","guard":[["hasAny",["2011jun","after a discount","discount","element","item number","nth","off","position","reduced by","sale price"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.discount",["sense.howMany"],["sense.wordCount"]]]],"mem":null},
{"id":"n-f6a0c451","guard":[["hasAny",["2005sep","as a percentage","element","item number","nth","percent is","position","what percent","what percentage"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"gmsl"}],["render.number",["compute.asPercent",{"lit":3},["sense.first"]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the gmsl monthly of 2003-May","expect":{"contains":["-15.2"],"notRefusal":true}},{"q":"tell me the gmsl monthly of 1993-Jul","expect":{"contains":["-45.7"],"notRefusal":true}},{"q":"tell me the gmsl monthly of 1996-Mar","expect":{"contains":["-42.3"],"notRefusal":true}},{"q":"give the gmsl monthly of 2009-Dec","expect":{"contains":["15.3"],"notRefusal":true}},{"q":"give the gmsl monthly of 2009-Oct","expect":{"contains":["14.3"],"notRefusal":true}},{"q":"tell me the gmsl monthly of 2018-Nov","expect":{"contains":["53"],"notRefusal":true}},{"q":"tell me the gmsl monthly of 2000-Apr","expect":{"contains":["-23.5"],"notRefusal":true}},{"q":"what is the gmsl monthly of 1997-Aug","expect":{"contains":["-27.7"],"notRefusal":true}},{"q":"give the gmsl monthly of 2012-Jul","expect":{"contains":["15.2"],"notRefusal":true}},{"q":"what is the gmsl monthly of 2017-Jan","expect":{"contains":["37"],"notRefusal":true}},{"q":"tell me the gmsl monthly of 2018-Feb","expect":{"contains":["38.9"],"notRefusal":true}},{"q":"what is the gmsl monthly of 2019-Feb","expect":{"contains":["45.7"],"notRefusal":true}},{"q":"tell me the gmsl monthly of 2011-Jun","expect":{"contains":["0.9"],"notRefusal":true}},{"q":"tell me the gmsl monthly of 1993-Jun","expect":{"contains":["-51.5"],"notRefusal":true}},{"q":"give the gmsl monthly of 2003-Jan","expect":{"contains":["-12.7"],"notRefusal":true}},{"q":"what is the gmsl monthly of 1997-Jun","expect":{"contains":["-37"],"notRefusal":true}},{"q":"give the gmsl monthly of 2010-Feb","expect":{"contains":["5.3"],"notRefusal":true}},{"q":"what is the gmsl monthly of 1996-Apr","expect":{"contains":["-38.4"],"notRefusal":true}},{"q":"what is the gmsl monthly of 2010-Aug","expect":{"contains":["8.1"],"notRefusal":true}},{"q":"give the gmsl monthly of 2013-Mar","expect":{"contains":["18.5"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
