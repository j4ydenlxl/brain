// location-of-country-f050-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"location-of-country-f050-neo-g10","class":"location-of-country-f050","generation":10,"lane":"neo","grownFrom":["give the location for Antigua and Barbuda","tell me the location of the country El Salvador","tell me the location of the country Panama","tell me the location of the country Barbados","give the location for South Sudan","give the location for Montserrat","give the location for Moldova","what is the location of Afghanistan","what is the location of Uruguay","give the location for United Arab Emirates","give the location for Mexico","tell me the location of the country Congo","give the location for Puerto Rico","give the location for Bosnia and Herzegovina","what is the location of Senegal","give the location for Denmark","what is the location of Pitcairn","what is the location of Yemen","what is the location of Saint Lucia","give the location for Ivory Coast"],"version":1});

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
knowLoad([{"id":"fr-country-json-country-by-region-in-world-2ada49","columns":["country","location"],"n":243,"cols":[{"s":"Afghanistan|Albania|Algeria|American Samoa|Angola|Anguilla|Antarctica|Argentina|Armenia|Australia|Austria|Belarus|Belize|Benin|Bermuda|Botswana|British Indian Ocean Territory|Brunei|China|Denmark|Estonia|Fiji Islands|Guam|Ireland|England|Northern Ireland|Scotland|The Democratic Republic of Congo|Virgin Islands, British|Virgin Islands, U.S.|Wales|Bouvet Island|French Southern territories|Heard Island and McDonald Islands|South Georgia and the South Sandwich Islands|Christmas Island|Cocos (Keeling) Islands|New Zealand|Norfolk Island|Latvia|Lithuania|United Kingdom|Antigua and Barbuda|Aruba|Bahamas|Barbados|Cayman Islands|Cuba|Dominica|Dominican Republic|Grenada|Guadeloupe|Haiti|Jamaica|Martinique|Montserrat|Netherlands Antilles|Puerto Rico|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Trinidad and Tobago|Turks and Caicos Islands|Cameroon|Central African Republic|Chad|Congo|Equatorial Guinea|Gabon|Sao Tome and Principe|Costa Rica|El Salvador|Guatemala|Honduras|Mexico|Nicaragua|Panama|Serbia|Burundi|Comoros|Djibouti|Eritrea|Ethiopia|Kenya|Madagascar|Malawi|Mauritius|Mayotte|Mozambique|Reunion|Rwanda|Seychelles|Somalia|South Sudan|Tanzania|Uganda|Zambia|Zimbabwe|Hong Kong|Japan|Macao|Mongolia|North Korea|South Korea|Bulgaria|Czech Republic|Hungary|Moldova|Poland|Romania|Russia|Slovakia|Ukraine|New Caledonia|Papua New Guinea|Solomon Islands|Vanuatu|Kiribati|Marshall Islands|Micronesia, Federated States of|Nauru|Northern Mariana Islands|Palau|United States Minor Outlying Islands|Azerbaijan|Bahrain|Cyprus|Georgia|Iraq|Israel|Jordan|Kuwait|Lebanon|Oman|Palestine|Qatar|Saudi Arabia|Syria|Turkey|United Arab Emirates|Yemen|Faroe Islands|Finland|Iceland|Norway|Svalbard and Jan Mayen|Sweden|Canada|Greenland|Saint Pierre and Miquelon|United States|Egypt|Libya|Morocco|Sudan|Tunisia|Western Sahara|Cook Islands|French Polynesia|Niue|Pitcairn|Samoa|Tokelau|Tonga|Tuvalu|Wallis and Futuna|Bolivia|Brazil|Chile|Colombia|Ecuador|Falkland Islands|French Guiana|Guyana|Paraguay|Peru|Suriname|Uruguay|Venezuela|Cambodia|East Timor|Indonesia|Laos|Malaysia|Myanmar|Philippines|Singapore|Thailand|Vietnam|Eswatini|Lesotho|Namibia|South Africa|Sri Lanka|Andorra|Bosnia and Herzegovina|Croatia|Gibraltar|Greece|Holy See (Vatican City State)|Italy|Malta|North Macedonia|Portugal|San Marino|Slovenia|Spain|Bangladesh|Bhutan|India|Iran|Kazakhstan|Kyrgyzstan|Maldives|Nepal|Pakistan|Tajikistan|Turkmenistan|Uzbekistan|Burkina Faso|Cape Verde|Gambia|Ghana|Guinea|Guinea-Bissau|Ivory Coast|Liberia|Mali|Mauritania|Niger|Nigeria|Saint Helena|Senegal|Sierra Leone|Togo|Belgium|France|Germany|Liechtenstein|Luxembourg|Monaco|Netherlands|Switzerland","sep":"|"},{"d":"Southern and Central Asia|Southern Europe|Northern Africa|Polynesia|Central Africa|Caribbean|Antarctica|South America|Middle East|Australia and New Zealand|Western Europe|Eastern Europe|Central America|Western Africa|North America|Southern Africa|Eastern Africa|Southeast Asia|Eastern Asia|Nordic Countries|Baltic Countries|Melanesia|Micronesia|British Isles||Central and Southeast Europe|Micronesia/Caribbean|Southern Asia","r":"0*1,1*1,2*1,3*1,4*1,5*1,6*1,7*1,8*1,9*1,a*1,b*1,c*1,d*1,e*1,f*1,g*1,h*1,i*1,j*1,k*1,l*1,m*1,n*1,o*7,6*4,9*4,k*2,n*1,5*l,4*7,c*7,p*1,g*k,i*6,b*9,l*4,m*6,q*1,8*h,j*6,e*4,2*6,3*9,7*d,h*a,f*4,r*1,1*d,0*c,d*g,a*8","sep":"|"}]}]);
const COLONY = [
{"id":"n-6480bd81","guard":[["hasAny",["element","item number","location","nth","position"]],["not",["has","name"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-18a48798","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","location","nth","position","upper case","uppercase"]],["not",["has","name"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-49decbf5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","location","nth","position","title case"]],["not",["has","name"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-7497a49d","guard":[["hasAny",["element","item number","location","lower case","lowercase","nth","position","small letters"]],["not",["has","name"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-bd42302a","guard":[["hasAny",["element","invert case","item number","location","nth","position","swap case","toggle case"]],["not",["has","name"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-0598a314","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","invert case","item number","location","nth","position","swap case","title case","toggle case"]],["not",["has","name"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-ccfbe6c4","guard":[["hasAny",["element","item number","location","nth","position"]],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The location of ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-e9502d8d","guard":[["has","location"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Antigua and Barbuda":"The location of Antigua and Barbuda is Caribbean.","tell me the location of the country El Salvador":"The location of El Salvador is Central America.","tell me the location of the country Panama":"The location of Panama is Central America.","tell me the location of the country Barbados":"The location of Barbados is Caribbean.","give the location for South Sudan":"The location of South Sudan is Eastern Africa.","give the location for Montserrat":"The location of Montserrat is Caribbean.","give the location for Moldova":"The location of Moldova is Eastern Europe.","what is the location of Afghanistan":"The location of Afghanistan is Southern and Central Asia.","what is the location of Uruguay":"The location of Uruguay is South America.","give the location for United Arab Emirates":"The location of United Arab Emirates is Middle East.","give the location for Mexico":"The location of Mexico is Central America.","tell me the location of the country Congo":"The location of Congo is Central Africa.","give the location for Puerto Rico":"The location of Puerto Rico is Caribbean.","give the location for Bosnia and Herzegovina":"The location of Bosnia and Herzegovina is Southern Europe.","what is the location of Senegal":"The location of Senegal is Western Africa.","give the location for Denmark":"The location of Denmark is Nordic Countries.","what is the location of Pitcairn":"The location of Pitcairn is Polynesia.","what is the location of Yemen":"The location of Yemen is Middle East.","what is the location of Saint Lucia":"The location of Saint Lucia is Caribbean.","give the location for Ivory Coast":"The location of Ivory Coast is Western Africa.","tell me the location of the country Croatia":"The location of Croatia is Southern Europe.","tell me the location of the country Ukraine":"The location of Ukraine is Eastern Europe.","tell me the location of the country Suriname":"The location of Suriname is South America.","tell me the location of the country Turkey":"The location of Turkey is Middle East.","what is the location of Kenya":"The location of Kenya is Eastern Africa.","give the location for Christmas Island":"The location of Christmas Island is Australia and New Zealand.","what is the location of Azerbaijan":"The location of Azerbaijan is Middle East.","what is the location of Guinea":"The location of Guinea is Western Africa.","what is the location of Netherlands":"The location of Netherlands is Western Europe.","what is the location of Kyrgyzstan":"The location of Kyrgyzstan is Southern and Central Asia.","what is the location of Qatar":"The location of Qatar is Middle East.","tell me the location of the country Russia":"The location of Russia is Eastern Europe.","tell me the location of the country Martinique":"The location of Martinique is Caribbean.","tell me the location of the country France":"The location of France is Western Europe.","tell me the location of the country Ghana":"The location of Ghana is Western Africa.","tell me the location of the country Switzerland":"The location of Switzerland is Western Europe.","tell me the location of the country Uganda":"The location of Uganda is Eastern Africa.","what is the location of Niue":"The location of Niue is Polynesia.","tell me the location of the country Netherlands Antilles":"The location of Netherlands Antilles is Caribbean.","give the location for Trinidad and Tobago":"The location of Trinidad and Tobago is Caribbean.","give the location for Burundi":"The location of Burundi is Eastern Africa.","what is the location of Tuvalu":"The location of Tuvalu is Polynesia.","what is the location of Gibraltar":"The location of Gibraltar is Southern Europe.","tell me the location of the country Falkland Islands":"The location of Falkland Islands is South America.","what is the location of Ethiopia":"The location of Ethiopia is Eastern Africa.","what is the location of Canada":"The location of Canada is North America.","what is the location of North Korea":"The location of North Korea is Eastern Asia.","tell me the location of the country Reunion":"The location of Reunion is Eastern Africa.","give the location for Bangladesh":"The location of Bangladesh is Southern and Central Asia.","what is the location of Mauritius":"The location of Mauritius is Eastern Africa.","tell me the location of the country American Samoa":"The location of American Samoa is Polynesia.","what is the location of Fiji Islands":"The location of Fiji Islands is Melanesia.","what is the location of Norway":"The location of Norway is Nordic Countries.","tell me the location of the country Sierra Leone":"The location of Sierra Leone is Western Africa.","tell me the location of the country Vanuatu":"The location of Vanuatu is Melanesia.","give the location for Botswana":"The location of Botswana is Southern Africa.","what is the location of Liberia":"The location of Liberia is Western Africa.","give the location for Benin":"The location of Benin is Western Africa.","what is the location of Jamaica":"The location of Jamaica is Caribbean.","tell me the location of the country Guinea-Bissau":"The location of Guinea-Bissau is Western Africa.","what is the location of Faroe Islands":"The location of Faroe Islands is Nordic Countries.","tell me the location of the country Spain":"The location of Spain is Southern Europe.","give the location for Malta":"The location of Malta is Southern Europe.","give the location for Albania":"The location of Albania is Southern Europe.","what is the location of Saint Helena":"The location of Saint Helena is Western Africa.","tell me the location of the country Malawi":"The location of Malawi is Eastern Africa.","tell me the location of the country Eswatini":"The location of Eswatini is Southern Africa.","give the location for Heard Island and McDonald Islands":"The location of Heard Island and McDonald Islands is Antarctica.","tell me the location of the country Philippines":"The location of Philippines is Southeast Asia.","give the location for Bahamas":"The location of Bahamas is Caribbean.","tell me the location of the country Saint Kitts and Nevis":"The location of Saint Kitts and Nevis is Caribbean.","give the location for Paraguay":"The location of Paraguay is South America.","what is the location of Tunisia":"The location of Tunisia is Northern Africa.","give the location for Australia":"The location of Australia is Australia and New Zealand.","give the location for Peru":"The location of Peru is South America.","give the location for Georgia":"The location of Georgia is Middle East.","give the location for Italy":"The location of Italy is Southern Europe.","what is the location of Nauru":"The location of Nauru is Micronesia.","what is the location of Monaco":"The location of Monaco is Western Europe.","give the location for Tajikistan":"The location of Tajikistan is Southern and Central Asia.","tell me the location of the country Greenland":"The location of Greenland is North America.","give the location for Wallis and Futuna":"The location of Wallis and Futuna is Polynesia.","what is the location of Namibia":"The location of Namibia is Southern Africa.","what is the location of Singapore":"The location of Singapore is Southeast Asia.","tell me the location of the country Bahrain":"The location of Bahrain is Middle East.","give the location for Bolivia":"The location of Bolivia is South America.","what is the location of Vietnam":"The location of Vietnam is Southeast Asia.","give the location for Colombia":"The location of Colombia is South America.","tell me the location of the country Chad":"The location of Chad is Central Africa.","tell me the location of the country Egypt":"The location of Egypt is Northern Africa.","give the location for Mongolia":"The location of Mongolia is Eastern Asia.","tell me the location of the country Gambia":"The location of Gambia is Western Africa.","what is the location of Nigeria":"The location of Nigeria is Western Africa.","give the location for Austria":"The location of Austria is Western Europe.","tell me the location of the country Luxembourg":"The location of Luxembourg is Western Europe.","what is the location of India":"The location of India is Southern and Central Asia.","tell me the location of the country Holy See (Vatican City State)":"The location of Holy See (Vatican City State) is Southern Europe.","give the location for Czech Republic":"The location of Czech Republic is Eastern Europe.","what is the location of Palau":"The location of Palau is Micronesia."}}},
{"id":"n-99878a11","guard":[["has","location"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"location"}]]],"mem":{"table":{"for Antigua and Barbuda":"The location of Antigua and Barbuda is Caribbean.","of the country El Salvador":"The location of El Salvador is Central America.","of the country Panama":"The location of Panama is Central America.","of the country Barbados":"The location of Barbados is Caribbean.","for South Sudan":"The location of South Sudan is Eastern Africa.","for Montserrat":"The location of Montserrat is Caribbean.","for Moldova":"The location of Moldova is Eastern Europe.","of Afghanistan":"The location of Afghanistan is Southern and Central Asia.","of Uruguay":"The location of Uruguay is South America.","for United Arab Emirates":"The location of United Arab Emirates is Middle East.","for Mexico":"The location of Mexico is Central America.","of the country Congo":"The location of Congo is Central Africa.","for Puerto Rico":"The location of Puerto Rico is Caribbean.","for Bosnia and Herzegovina":"The location of Bosnia and Herzegovina is Southern Europe.","of Senegal":"The location of Senegal is Western Africa.","for Denmark":"The location of Denmark is Nordic Countries.","of Pitcairn":"The location of Pitcairn is Polynesia.","of Yemen":"The location of Yemen is Middle East.","of Saint Lucia":"The location of Saint Lucia is Caribbean.","for Ivory Coast":"The location of Ivory Coast is Western Africa.","of the country Croatia":"The location of Croatia is Southern Europe.","of the country Ukraine":"The location of Ukraine is Eastern Europe.","of the country Suriname":"The location of Suriname is South America.","of the country Turkey":"The location of Turkey is Middle East.","of Kenya":"The location of Kenya is Eastern Africa.","for Christmas Island":"The location of Christmas Island is Australia and New Zealand.","of Azerbaijan":"The location of Azerbaijan is Middle East.","of Guinea":"The location of Guinea is Western Africa.","of Netherlands":"The location of Netherlands is Western Europe.","of Kyrgyzstan":"The location of Kyrgyzstan is Southern and Central Asia.","of Qatar":"The location of Qatar is Middle East.","of the country Russia":"The location of Russia is Eastern Europe.","of the country Martinique":"The location of Martinique is Caribbean.","of the country France":"The location of France is Western Europe.","of the country Ghana":"The location of Ghana is Western Africa.","of the country Switzerland":"The location of Switzerland is Western Europe.","of the country Uganda":"The location of Uganda is Eastern Africa.","of Niue":"The location of Niue is Polynesia.","of the country Netherlands Antilles":"The location of Netherlands Antilles is Caribbean.","for Trinidad and Tobago":"The location of Trinidad and Tobago is Caribbean.","for Burundi":"The location of Burundi is Eastern Africa.","of Tuvalu":"The location of Tuvalu is Polynesia.","of Gibraltar":"The location of Gibraltar is Southern Europe.","of the country Falkland Islands":"The location of Falkland Islands is South America.","of Ethiopia":"The location of Ethiopia is Eastern Africa.","of Canada":"The location of Canada is North America.","of North Korea":"The location of North Korea is Eastern Asia.","of the country Reunion":"The location of Reunion is Eastern Africa.","for Bangladesh":"The location of Bangladesh is Southern and Central Asia.","of Mauritius":"The location of Mauritius is Eastern Africa.","of the country American Samoa":"The location of American Samoa is Polynesia.","of Fiji Islands":"The location of Fiji Islands is Melanesia.","of Norway":"The location of Norway is Nordic Countries.","of the country Sierra Leone":"The location of Sierra Leone is Western Africa.","of the country Vanuatu":"The location of Vanuatu is Melanesia.","for Botswana":"The location of Botswana is Southern Africa.","of Liberia":"The location of Liberia is Western Africa.","for Benin":"The location of Benin is Western Africa.","of Jamaica":"The location of Jamaica is Caribbean.","of the country Guinea-Bissau":"The location of Guinea-Bissau is Western Africa.","of Faroe Islands":"The location of Faroe Islands is Nordic Countries.","of the country Spain":"The location of Spain is Southern Europe.","for Malta":"The location of Malta is Southern Europe.","for Albania":"The location of Albania is Southern Europe.","of Saint Helena":"The location of Saint Helena is Western Africa.","of the country Malawi":"The location of Malawi is Eastern Africa.","of the country Eswatini":"The location of Eswatini is Southern Africa.","for Heard Island and McDonald Islands":"The location of Heard Island and McDonald Islands is Antarctica.","of the country Philippines":"The location of Philippines is Southeast Asia.","for Bahamas":"The location of Bahamas is Caribbean.","of the country Saint Kitts and Nevis":"The location of Saint Kitts and Nevis is Caribbean.","for Paraguay":"The location of Paraguay is South America.","of Tunisia":"The location of Tunisia is Northern Africa.","for Australia":"The location of Australia is Australia and New Zealand.","for Peru":"The location of Peru is South America.","for Georgia":"The location of Georgia is Middle East.","for Italy":"The location of Italy is Southern Europe.","of Nauru":"The location of Nauru is Micronesia.","of Monaco":"The location of Monaco is Western Europe.","for Tajikistan":"The location of Tajikistan is Southern and Central Asia.","of the country Greenland":"The location of Greenland is North America.","for Wallis and Futuna":"The location of Wallis and Futuna is Polynesia.","of Namibia":"The location of Namibia is Southern Africa.","of Singapore":"The location of Singapore is Southeast Asia.","of the country Bahrain":"The location of Bahrain is Middle East.","for Bolivia":"The location of Bolivia is South America.","of Vietnam":"The location of Vietnam is Southeast Asia.","for Colombia":"The location of Colombia is South America.","of the country Chad":"The location of Chad is Central Africa.","of the country Egypt":"The location of Egypt is Northern Africa.","for Mongolia":"The location of Mongolia is Eastern Asia.","of the country Gambia":"The location of Gambia is Western Africa.","of Nigeria":"The location of Nigeria is Western Africa.","for Austria":"The location of Austria is Western Europe.","of the country Luxembourg":"The location of Luxembourg is Western Europe.","of India":"The location of India is Southern and Central Asia.","of the country Holy See (Vatican City State)":"The location of Holy See (Vatican City State) is Southern Europe.","for Czech Republic":"The location of Czech Republic is Eastern Europe.","of Palau":"The location of Palau is Micronesia."}}},
{"id":"n-6822cbe2","guard":[["hasAny",["afghanistan","albania","antigua","arab","austria","azerbaijan","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","canada","coast","colombia","country","czech","delete","denmark","element","ethiopia","futuna","georgia","gibraltar","guinea","india","island","islands","italy","item number","jamaica","kenya","korea","kyrgyzstan","liberia","malta","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","paraguay","peru","pitcairn","position","puerto","qatar","remove","saint","senegal","singapore","south","strip out","tajikistan","tobago","tunisia","tuvalu","uruguay","vietnam","without","yemen"]],["has","location"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-92e2f380","guard":[["hasAny",["afghanistan","albania","antigua","arab","austria","azerbaijan","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","canada","coast","colombia","country","czech","denmark","element","ethiopia","futuna","georgia","gibraltar","guinea","india","island","islands","italy","item number","jamaica","kenya","korea","kyrgyzstan","liberia","malta","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","paraguay","peru","pitcairn","position","puerto","qatar","saint","senegal","separate by","singapore","south","split","split by","tajikistan","tobago","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-9183484b","guard":[["hasAny",["afghanistan","albania","antigua","arab","austria","azerbaijan","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","canada","change to","coast","colombia","country","czech","denmark","element","ethiopia","futuna","georgia","gibraltar","guinea","india","island","islands","italy","item number","jamaica","kenya","korea","kyrgyzstan","liberia","malta","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","paraguay","peru","pitcairn","position","puerto","qatar","replace","saint","senegal","singapore","south","substitute","swap","tajikistan","tobago","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.text"]]],"mem":null},
{"id":"n-744e9dad","guard":[["hasAny",["afghanistan","albania","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","island","islands","italy","item number","jamaica","kenya","korea","kyrgyzstan","leading zeros","leone","liberia","lucia","luxembourg","malawi","malta","martinique","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","pad","pad with","padded to","palau","panama","paraguay","peru","philippines","pitcairn","position","puerto","qatar","reunion","russia","senegal","singapore","south","spain","suriname","switzerland","tajikistan","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-bde449ee","guard":[["hasAny",["afghanistan","albania","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","island","islands","italy","item number","jamaica","kenya","korea","kyrgyzstan","leading zeros","leone","liberia","lucia","luxembourg","malawi","malta","martinique","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","pad","pad with","padded to","palau","panama","paraguay","peru","philippines","pitcairn","position","puerto","qatar","reunion","russia","senegal","singapore","south","spain","suriname","switzerland","tajikistan","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-817b6c60","guard":[["hasAny",["afghanistan","albania","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","island","islands","italy","item number","jamaica","kenya","korea","kyrgyzstan","leading zeros","leone","liberia","lucia","luxembourg","malawi","malta","martinique","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","pad","pad with","padded to","palau","panama","paraguay","peru","philippines","pitcairn","position","puerto","qatar","reunion","russia","senegal","singapore","south","spain","suriname","switzerland","tajikistan","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-24d09296","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"Eastern Europe"}]],"mem":null},
{"id":"n-26d69aa6","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"Polynesia"}]],"mem":null},
{"id":"n-3a8aa281","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"Southern and Central Asia"}]],"mem":null},
{"id":"n-2bbdc83f","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"Western Europe"}]],"mem":null},
{"id":"n-3bc94953","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"South America"}]],"mem":null},
{"id":"n-bb9f8fe4","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"Middle East"}]],"mem":null},
{"id":"n-803fe841","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"Eastern Africa"}]],"mem":null},
{"id":"n-ba6db452","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","city"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"Southern Europe"}]],"mem":null},
{"id":"n-ef4ab1a6","guard":[["hasAny",["albania","antigua","arab","austria","azerbaijan","bahamas","benin","bolivia","bosnia","botswana","burundi","canada","coast","colombia","country","czech","denmark","element","ethiopia","futuna","georgia","gibraltar","guinea","islands","italy","item number","jamaica","kenya","korea","liberia","malta","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","normalise","normalize","norway","nth","palau","paraguay","peru","pitcairn","position","puerto","qatar","saint","senegal","simplify the text","singapore","south","tobago","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":2}]],"mem":null},
{"id":"n-1c685d14","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"Caribbean"}]],"mem":null},
{"id":"n-39d9415c","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":"Western Africa"}]],"mem":null},
{"id":"n-732d1661","guard":[["hasAny",["afghanistan","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","barbados","benin","bolivia","burundi","canada","chad","coast","colombia","congo","croatia","czech","delete","denmark","egypt","element","eswatini","ethiopia","faroe","fiji","france","futuna","gambia","georgia","ghana","gibraltar","guinea","guineabissau","india","island","item number","jamaica","kenya","korea","kyrgyzstan","leone","liberia","luxembourg","malawi","martinique","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","paraguay","peru","philippines","pitcairn","position","puerto","qatar","remove","reunion","russia","saint","senegal","singapore","south","spain","strip out","switzerland","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","without","yemen"]],["has","location"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-7598a4c3","guard":[["hasAny",["afghanistan","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","barbados","benin","bolivia","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","element","eswatini","ethiopia","faroe","fiji","france","futuna","gambia","georgia","ghana","gibraltar","guinea","guineabissau","india","island","item number","jamaica","kenya","korea","kyrgyzstan","leone","liberia","luxembourg","malawi","martinique","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","paraguay","peru","philippines","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","separate by","singapore","south","spain","split","split by","switzerland","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b4068b12","guard":[["hasAny",["afghanistan","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","barbados","benin","bolivia","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","element","eswatini","ethiopia","faroe","fiji","france","futuna","gambia","georgia","ghana","gibraltar","guinea","guineabissau","india","island","item number","jamaica","kenya","korea","kyrgyzstan","leone","liberia","luxembourg","malawi","martinique","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","paraguay","peru","philippines","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","separate by","singapore","south","spain","split","split by","switzerland","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f7790869","guard":[["hasAny",["afghanistan","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","barbados","benin","bolivia","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","element","eswatini","ethiopia","faroe","fiji","france","futuna","gambia","georgia","ghana","gibraltar","guinea","guineabissau","india","island","item number","jamaica","kenya","korea","kyrgyzstan","leone","liberia","luxembourg","malawi","martinique","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","paraguay","peru","philippines","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","separate by","singapore","south","spain","split","split by","switzerland","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-14c042d0","guard":[["hasAny",["albania","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","czech","delete","denmark","el","element","ethiopia","france","futuna","gambia","georgia","ghana","greenland","guinea","guineabissau","island","islands","italy","item number","jamaica","kenya","korea","leone","liberia","luxembourg","malawi","malta","martinique","mauritius","moldova","monaco","mongolia","montserrat","nauru","netherlands","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","remove","reunion","russia","saint","senegal","south","strip out","suriname","switzerland","tajikistan","tobago","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","without","yemen"]],["has","location"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1a9688cc","guard":[["hasAny",["albania","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","czech","denmark","el","element","ethiopia","france","futuna","gambia","georgia","ghana","greenland","guinea","guineabissau","island","islands","italy","item number","jamaica","kenya","korea","leone","liberia","luxembourg","malawi","malta","martinique","mauritius","moldova","monaco","mongolia","montserrat","nauru","netherlands","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","separate by","south","split","split by","suriname","switzerland","tajikistan","tobago","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","yemen"]],["has","location"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-447b3ce7","guard":[["hasAny",["albania","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","czech","denmark","el","element","ethiopia","france","futuna","gambia","georgia","ghana","greenland","guinea","guineabissau","island","islands","italy","item number","jamaica","kenya","korea","leone","liberia","luxembourg","malawi","malta","martinique","mauritius","moldova","monaco","mongolia","montserrat","nauru","netherlands","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","separate by","south","split","split by","suriname","switzerland","tajikistan","tobago","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","yemen"]],["has","location"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ddc29f05","guard":[["hasAny",["albania","american","antigua","arab","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","czech","denmark","el","element","ethiopia","france","futuna","gambia","georgia","ghana","greenland","guinea","guineabissau","island","islands","italy","item number","jamaica","kenya","korea","leone","liberia","luxembourg","malawi","malta","martinique","mauritius","moldova","monaco","mongolia","montserrat","nauru","netherlands","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","separate by","south","split","split by","suriname","switzerland","tajikistan","tobago","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","yemen"]],["has","location"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-45ada970","guard":[["hasAny",["afghanistan","albania","arab","australia","austria","azerbaijan","bahrain","bangladesh","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","falkland","faroe","france","gambia","georgia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","island","italy","item number","kenya","korea","kyrgyzstan","leading zeros","leone","liberia","luxembourg","malawi","malta","mauritius","moldova","monaco","mongolia","namibia","nauru","nigeria","norway","nth","pad","pad with","padded to","palau","panama","paraguay","peru","philippines","position","qatar","reunion","russia","senegal","singapore","south","spain","suriname","switzerland","tajikistan","tunisia","turkey","uganda","ukraine","uruguay","vietnam","yemen","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-8753d8c2","guard":[["hasAny",["afghanistan","albania","arab","australia","austria","azerbaijan","bahrain","bangladesh","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","falkland","faroe","france","gambia","georgia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","island","italy","item number","kenya","korea","kyrgyzstan","leading zeros","leone","liberia","luxembourg","malawi","malta","mauritius","moldova","monaco","mongolia","namibia","nauru","nigeria","norway","nth","pad","pad with","padded to","palau","panama","paraguay","peru","philippines","position","qatar","reunion","russia","senegal","singapore","south","spain","suriname","switzerland","tajikistan","tunisia","turkey","uganda","ukraine","uruguay","vietnam","yemen","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-35d3ac07","guard":[["hasAny",["afghanistan","albania","arab","australia","austria","azerbaijan","bahrain","bangladesh","benin","bolivia","bosnia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","falkland","faroe","france","gambia","georgia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","island","italy","item number","kenya","korea","kyrgyzstan","leading zeros","leone","liberia","luxembourg","malawi","malta","mauritius","moldova","monaco","mongolia","namibia","nauru","nigeria","norway","nth","pad","pad with","padded to","palau","panama","paraguay","peru","philippines","position","qatar","reunion","russia","senegal","singapore","south","spain","suriname","switzerland","tajikistan","tunisia","turkey","uganda","ukraine","uruguay","vietnam","yemen","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-0a1fb0c2","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","south","spain","suriname","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.and",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-ea868936","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","south","spain","suriname","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-168fcba1","guard":[["hasAny",["albania","all caps","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","capital letters","capitals","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","south","spain","suriname","tobago","tunisia","turkey","tuvalu","uganda","ukraine","upper case","uppercase","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-8ff62631","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","lower case","lowercase","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","small letters","south","spain","suriname","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-c001b1e8","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","invert case","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","south","spain","suriname","swap case","tobago","toggle case","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-d1934e68","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","south","spain","suriname","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-e3184d7d","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","capitalise","capitalize","capitalize each word","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","south","spain","suriname","title case","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-22c5b11e","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","capitalise","capitalize","capitalize each word","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","south","spain","suriname","title case","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-30bf61bf","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","invert case","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","south","spain","suriname","swap case","tobago","toggle case","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-74ef8fb0","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","lower case","lowercase","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","small letters","south","spain","suriname","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-dc9f644e","guard":[["hasAny",["albania","all caps","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","capital letters","capitals","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","south","spain","suriname","tobago","tunisia","turkey","tuvalu","uganda","ukraine","upper case","uppercase","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-b0f2c133","guard":[["hasAny",["albania","american","antigua","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","france","futuna","gambia","georgia","ghana","guinea","india","islands","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","normalise","normalize","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","saint","senegal","simplify the text","south","spain","suriname","tobago","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-44573d70","guard":[["hasAny",["afghanistan","albania","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","benin","bolivia","botswana","burundi","canada","chad","change to","colombia","congo","croatia","denmark","egypt","element","eswatini","ethiopia","france","gambia","georgia","ghana","gibraltar","greenland","guinea","india","italy","item number","jamaica","kenya","kyrgyzstan","liberia","luxembourg","malawi","malta","martinique","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","philippines","pitcairn","position","qatar","replace","reunion","russia","senegal","singapore","spain","substitute","suriname","swap","switzerland","tajikistan","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-7ae4df17","guard":[["hasAny",["afghanistan","albania","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","benin","bolivia","botswana","burundi","canada","chad","change to","colombia","congo","croatia","denmark","egypt","element","eswatini","ethiopia","france","gambia","georgia","ghana","gibraltar","greenland","guinea","india","italy","item number","jamaica","kenya","kyrgyzstan","liberia","luxembourg","malawi","malta","martinique","mauritius","moldova","monaco","mongolia","montserrat","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","philippines","pitcairn","position","qatar","replace","reunion","russia","senegal","singapore","spain","substitute","suriname","swap","switzerland","tajikistan","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-9586c266","guard":[["hasAny",["albania","american","arab","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","falkland","faroe","fiji","france","gambia","georgia","ghana","guinea","helena","india","italy","item number","jamaica","kenya","korea","leone","liberia","longest","longest one","longest word","lucia","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","normalise","normalize","norway","nth","palau","panama","paraguay","peru","pitcairn","position","puerto","qatar","reunion","russia","senegal","simplify the text","south","spain","suriname","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-8e2d97af","guard":[["hasAny",["afghanistan","albania","australia","austria","bangladesh","benin","bolivia","bosnia","botswana","burundi","canada","chad","christmas","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","falkland","faroe","france","gambia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","italy","item number","kenya","korea","kyrgyzstan","leading zeros","leone","liberia","luxembourg","malawi","malta","mauritius","moldova","monaco","mongolia","namibia","nigeria","norway","nth","pad","pad with","padded to","panama","paraguay","peru","philippines","position","reunion","russia","senegal","singapore","south","spain","suriname","switzerland","tajikistan","tunisia","uganda","ukraine","uruguay","vietnam","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-bd842497","guard":[["hasAny",["afghanistan","albania","australia","austria","bangladesh","benin","bolivia","bosnia","botswana","burundi","canada","chad","christmas","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","falkland","faroe","france","gambia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","italy","item number","kenya","korea","kyrgyzstan","leading zeros","leone","liberia","luxembourg","malawi","malta","mauritius","moldova","monaco","mongolia","namibia","nigeria","norway","nth","pad","pad with","padded to","panama","paraguay","peru","philippines","position","reunion","russia","senegal","singapore","south","spain","suriname","switzerland","tajikistan","tunisia","uganda","ukraine","uruguay","vietnam","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-7218e21c","guard":[["hasAny",["afghanistan","albania","australia","austria","bangladesh","benin","bolivia","bosnia","botswana","burundi","canada","chad","christmas","coast","colombia","congo","croatia","czech","denmark","egypt","el","element","eswatini","ethiopia","falkland","faroe","france","gambia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","italy","item number","kenya","korea","kyrgyzstan","leading zeros","leone","liberia","luxembourg","malawi","malta","mauritius","moldova","monaco","mongolia","namibia","nigeria","norway","nth","pad","pad with","padded to","panama","paraguay","peru","philippines","position","reunion","russia","senegal","singapore","south","spain","suriname","switzerland","tajikistan","tunisia","uganda","ukraine","uruguay","vietnam","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-3b638c43","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-7294875c","guard":[["hasAny",["afghanistan","azerbaijan","canada","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-f03a95bf","guard":[["hasAny",["afghanistan","azerbaijan","canada","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-6bf6f797","guard":[["hasAny",["afghanistan","all caps","azerbaijan","canada","capital letters","capitals","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","tunisia","tuvalu","upper case","uppercase","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-7804b523","guard":[["hasAny",["afghanistan","azerbaijan","canada","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-8587ad3e","guard":[["hasAny",["afghanistan","azerbaijan","canada","capitalise","capitalize","capitalize each word","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","title case","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-d520ac60","guard":[["hasAny",["afghanistan","azerbaijan","canada","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","invert case","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","swap case","toggle case","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-e342ab78","guard":[["hasAny",["afghanistan","azerbaijan","canada","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","lower case","lowercase","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","small letters","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-502b660c","guard":[["hasAny",["afghanistan","all caps","azerbaijan","canada","capital letters","capitals","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","tunisia","tuvalu","upper case","uppercase","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-892cfa69","guard":[["hasAny",["afghanistan","azerbaijan","canada","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","invert case","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","swap case","toggle case","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-9fbd695c","guard":[["hasAny",["afghanistan","azerbaijan","canada","capitalise","capitalize","capitalize each word","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","title case","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-e73fec70","guard":[["hasAny",["afghanistan","azerbaijan","canada","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","lower case","lowercase","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","norway","nth","palau","pitcairn","position","qatar","saint","senegal","singapore","small letters","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-a9cd8524","guard":[["hasAny",["afghanistan","azerbaijan","canada","country","element","ethiopia","faroe","fiji","gibraltar","guinea","india","item number","jamaica","kenya","korea","kyrgyzstan","liberia","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","normalise","normalize","norway","nth","palau","pitcairn","position","qatar","saint","senegal","simplify the text","singapore","tunisia","tuvalu","uruguay","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-71f92796","guard":[["has","location"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the country El Salvador":"The location of El Salvador is Central America.","the country Panama":"The location of Panama is Central America.","the country Barbados":"The location of Barbados is Caribbean.","Afghanistan":"The location of Afghanistan is Southern and Central Asia.","Uruguay":"The location of Uruguay is South America.","the country Congo":"The location of Congo is Central Africa.","Senegal":"The location of Senegal is Western Africa.","Pitcairn":"The location of Pitcairn is Polynesia.","Yemen":"The location of Yemen is Middle East.","Saint Lucia":"The location of Saint Lucia is Caribbean.","the country Croatia":"The location of Croatia is Southern Europe.","the country Ukraine":"The location of Ukraine is Eastern Europe.","the country Suriname":"The location of Suriname is South America.","the country Turkey":"The location of Turkey is Middle East.","Kenya":"The location of Kenya is Eastern Africa.","Azerbaijan":"The location of Azerbaijan is Middle East.","Guinea":"The location of Guinea is Western Africa.","Netherlands":"The location of Netherlands is Western Europe.","Kyrgyzstan":"The location of Kyrgyzstan is Southern and Central Asia.","Qatar":"The location of Qatar is Middle East.","the country Russia":"The location of Russia is Eastern Europe.","the country Martinique":"The location of Martinique is Caribbean.","the country France":"The location of France is Western Europe.","the country Ghana":"The location of Ghana is Western Africa.","the country Switzerland":"The location of Switzerland is Western Europe.","the country Uganda":"The location of Uganda is Eastern Africa.","Niue":"The location of Niue is Polynesia.","the country Netherlands Antilles":"The location of Netherlands Antilles is Caribbean.","Tuvalu":"The location of Tuvalu is Polynesia.","Gibraltar":"The location of Gibraltar is Southern Europe.","the country Falkland Islands":"The location of Falkland Islands is South America.","Ethiopia":"The location of Ethiopia is Eastern Africa.","Canada":"The location of Canada is North America.","North Korea":"The location of North Korea is Eastern Asia.","the country Reunion":"The location of Reunion is Eastern Africa.","Mauritius":"The location of Mauritius is Eastern Africa.","the country American Samoa":"The location of American Samoa is Polynesia.","Fiji Islands":"The location of Fiji Islands is Melanesia.","Norway":"The location of Norway is Nordic Countries.","the country Sierra Leone":"The location of Sierra Leone is Western Africa.","the country Vanuatu":"The location of Vanuatu is Melanesia.","Liberia":"The location of Liberia is Western Africa.","Jamaica":"The location of Jamaica is Caribbean.","the country Guinea-Bissau":"The location of Guinea-Bissau is Western Africa.","Faroe Islands":"The location of Faroe Islands is Nordic Countries.","the country Spain":"The location of Spain is Southern Europe.","Saint Helena":"The location of Saint Helena is Western Africa.","the country Malawi":"The location of Malawi is Eastern Africa.","the country Eswatini":"The location of Eswatini is Southern Africa.","the country Philippines":"The location of Philippines is Southeast Asia.","the country Saint Kitts and Nevis":"The location of Saint Kitts and Nevis is Caribbean.","Tunisia":"The location of Tunisia is Northern Africa.","Nauru":"The location of Nauru is Micronesia.","Monaco":"The location of Monaco is Western Europe.","the country Greenland":"The location of Greenland is North America.","Namibia":"The location of Namibia is Southern Africa.","Singapore":"The location of Singapore is Southeast Asia.","the country Bahrain":"The location of Bahrain is Middle East.","Vietnam":"The location of Vietnam is Southeast Asia.","the country Chad":"The location of Chad is Central Africa.","the country Egypt":"The location of Egypt is Northern Africa.","the country Gambia":"The location of Gambia is Western Africa.","Nigeria":"The location of Nigeria is Western Africa.","the country Luxembourg":"The location of Luxembourg is Western Europe.","India":"The location of India is Southern and Central Asia.","the country Holy See (Vatican City State)":"The location of Holy See (Vatican City State) is Southern Europe.","Palau":"The location of Palau is Micronesia."}}},
{"id":"n-7828061c","guard":[["hasAny",["afghanistan","american","azerbaijan","bahrain","barbados","canada","chad","city","congo","croatia","egypt","el","element","eswatini","ethiopia","falkland","faroe","fiji","france","gambia","ghana","gibraltar","greenland","guinea","guineabissau","helena","india","item number","jamaica","kenya","korea","kyrgyzstan","leone","liberia","lucia","luxembourg","malawi","martinique","mauritius","monaco","namibia","nauru","netherlands","nigeria","niue","normalise","normalize","norway","nth","palau","panama","philippines","pitcairn","position","qatar","reunion","russia","senegal","simplify the text","singapore","spain","suriname","switzerland","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-195b96a4","guard":[["hasAny",["albania","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","colombia","congo","croatia","denmark","egypt","element","eswatini","ethiopia","france","gambia","georgia","ghana","guinea","india","italy","item number","jamaica","kenya","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","qatar","reunion","russia","senegal","spain","suriname","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-15ef422e","guard":[["hasAny",["albania","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","camel case","camelcase","canada","chad","colombia","congo","croatia","denmark","egypt","element","eswatini","ethiopia","france","gambia","georgia","ghana","guinea","india","italy","item number","jamaica","kenya","liberia","longest","longest one","longest word","lower camel case","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","qatar","reunion","russia","senegal","spain","suriname","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-c5dfe72d","guard":[["hasAny",["albania","austria","bahamas","bahrain","barbados","benin","bolivia","botswana","burundi","canada","chad","colombia","congo","croatia","denmark","egypt","element","eswatini","ethiopia","france","gambia","georgia","ghana","guinea","india","invert case","italy","item number","jamaica","kenya","liberia","longest","longest one","longest word","malawi","malta","moldova","monaco","mongolia","namibia","nauru","nigeria","niue","norway","nth","palau","panama","paraguay","peru","pitcairn","position","qatar","reunion","russia","senegal","spain","suriname","swap case","toggle case","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-3623d57f","guard":[["hasAny",["albania","antigua","austria","azerbaijan","bahamas","barbados","benin","bolivia","botswana","burundi","canada","colombia","count","czech","denmark","element","ethiopia","fiji","futuna","georgia","gibraltar","guinea","how many","how many items","italy","item number","jamaica","kenya","liberia","lucia","malta","martinique","mauritius","mexico","moldova","monaco","mongolia","montserrat","namibia","nauru","netherlands","nigeria","niue","normalise","normalize","norway","nth","number of items","palau","paraguay","peru","pitcairn","position","puerto","qatar","russia","senegal","simplify the text","singapore","tobago","tunisia","tuvalu","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-1f5224ef","guard":[["hasAny",["afghanistan","azerbaijan","bahrain","barbados","canada","chad","congo","croatia","dashes","egypt","element","eswatini","ethiopia","france","gambia","ghana","gibraltar","greenland","guinea","guineabissau","hyphens","india","item number","jamaica","kebab case","kebabcase","kenya","kyrgyzstan","liberia","luxembourg","malawi","martinique","mauritius","monaco","namibia","nauru","nigeria","niue","norway","nth","palau","panama","philippines","pitcairn","position","qatar","reunion","russia","senegal","singapore","slug","spain","suriname","switzerland","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-32089516","guard":[["hasAny",["afghanistan","azerbaijan","bahrain","barbados","canada","chad","congo","croatia","egypt","element","eswatini","ethiopia","france","gambia","ghana","gibraltar","greenland","guinea","guineabissau","india","item number","jamaica","kenya","kyrgyzstan","liberia","luxembourg","malawi","martinique","mauritius","monaco","namibia","nauru","nigeria","niue","norway","nth","palau","panama","philippines","pitcairn","position","qatar","reunion","reverse the words","reverse word order","russia","senegal","singapore","spain","suriname","switzerland","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","words backwards","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-c3578875","guard":[["hasAny",["afghanistan","azerbaijan","bahrain","barbados","canada","chad","congo","croatia","egypt","element","eswatini","ethiopia","france","gambia","ghana","gibraltar","greenland","guinea","india","item number","jamaica","kenya","kyrgyzstan","liberia","luxembourg","malawi","martinique","mauritius","monaco","namibia","nauru","nigeria","niue","norway","nth","palau","panama","philippines","pitcairn","position","qatar","reunion","russia","senegal","singapore","spain","suriname","switzerland","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-36065c19","guard":[["hasAny",["afghanistan","azerbaijan","bahrain","barbados","canada","chad","congo","croatia","egypt","element","eswatini","ethiopia","france","gambia","ghana","gibraltar","greenland","guinea","india","invert case","item number","jamaica","kenya","kyrgyzstan","liberia","luxembourg","malawi","martinique","mauritius","monaco","namibia","nauru","nigeria","niue","norway","nth","palau","panama","philippines","pitcairn","position","qatar","reunion","russia","senegal","singapore","spain","suriname","swap case","switzerland","toggle case","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-371003bf","guard":[["hasAny",["afghanistan","azerbaijan","bahrain","barbados","camel case","camelcase","canada","chad","congo","croatia","egypt","element","eswatini","ethiopia","france","gambia","ghana","gibraltar","greenland","guinea","india","item number","jamaica","kenya","kyrgyzstan","liberia","lower camel case","luxembourg","malawi","martinique","mauritius","monaco","namibia","nauru","nigeria","niue","norway","nth","palau","panama","philippines","pitcairn","position","qatar","reunion","russia","senegal","singapore","spain","suriname","switzerland","tunisia","turkey","tuvalu","uganda","ukraine","uruguay","vanuatu","vietnam","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-1cd517f1","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-cf6b1b60","guard":[["has","location"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the location of Afghanistan":"The location of Afghanistan is Southern and Central Asia.","the location of Uruguay":"The location of Uruguay is South America.","the location of Senegal":"The location of Senegal is Western Africa.","the location of Pitcairn":"The location of Pitcairn is Polynesia.","the location of Yemen":"The location of Yemen is Middle East.","the location of Saint Lucia":"The location of Saint Lucia is Caribbean.","the location of Kenya":"The location of Kenya is Eastern Africa.","the location of Azerbaijan":"The location of Azerbaijan is Middle East.","the location of Guinea":"The location of Guinea is Western Africa.","the location of Netherlands":"The location of Netherlands is Western Europe.","the location of Kyrgyzstan":"The location of Kyrgyzstan is Southern and Central Asia.","the location of Qatar":"The location of Qatar is Middle East.","the location of Niue":"The location of Niue is Polynesia.","the location of Tuvalu":"The location of Tuvalu is Polynesia.","the location of Gibraltar":"The location of Gibraltar is Southern Europe.","the location of Ethiopia":"The location of Ethiopia is Eastern Africa.","the location of Canada":"The location of Canada is North America.","the location of North Korea":"The location of North Korea is Eastern Asia.","the location of Mauritius":"The location of Mauritius is Eastern Africa.","the location of Fiji Islands":"The location of Fiji Islands is Melanesia.","the location of Norway":"The location of Norway is Nordic Countries.","the location of Liberia":"The location of Liberia is Western Africa.","the location of Jamaica":"The location of Jamaica is Caribbean.","the location of Faroe Islands":"The location of Faroe Islands is Nordic Countries.","the location of Saint Helena":"The location of Saint Helena is Western Africa.","the location of Tunisia":"The location of Tunisia is Northern Africa.","the location of Nauru":"The location of Nauru is Micronesia.","the location of Monaco":"The location of Monaco is Western Europe.","the location of Namibia":"The location of Namibia is Southern Africa.","the location of Singapore":"The location of Singapore is Southeast Asia.","the location of Vietnam":"The location of Vietnam is Southeast Asia.","the location of Nigeria":"The location of Nigeria is Western Africa.","the location of India":"The location of India is Southern and Central Asia.","the location of Palau":"The location of Palau is Micronesia."}}},
{"id":"n-a4f58cf9","guard":[["hasAny",["delete","element","item number","location","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.before",{"lit":"for"}]]],"mem":null},
{"id":"n-76370e2c","guard":[["hasAny",["element","item number","location","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-7230afc6","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","tajikistan","tobago"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.and",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-ec6ec20a","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","tajikistan","tobago"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-404babe8","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","class name","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","pascal case","pascalcase","peru","position","puerto","south","tajikistan","tobago","upper camel case"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-693a4c97","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","tajikistan","tobago"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-875fa6ef","guard":[["hasAny",["albania","all caps","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","capital letters","capitals","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","tajikistan","tobago","upper case","uppercase"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-9996c5b5","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","invert case","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","swap case","tajikistan","tobago","toggle case"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-a3d1187e","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","capitalise","capitalize","capitalize each word","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","tajikistan","title case","tobago"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-bd4b5093","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","invert case","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","swap case","tajikistan","tobago","toggle case"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-f7aa7631","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","lower case","lowercase","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","small letters","south","tajikistan","tobago"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-2457162f","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","each word","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","split into words","tajikistan","tobago","words"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-548ed706","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","lower case","lowercase","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","small letters","south","tajikistan","tobago"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-7d811fe3","guard":[["hasAny",["albania","all caps","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","capital letters","capitals","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","tajikistan","tobago","upper case","uppercase"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-85012651","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","invert case","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","swap case","tajikistan","tobago","toggle case"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-98fd6a42","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","each word","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","split into words","tajikistan","tobago","words"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-f2d1e66c","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","capitalise","capitalize","capitalize each word","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","south","tajikistan","title case","tobago"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-a7ee2404","guard":[["hasAny",["albania","antigua","arab","australia","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","normalise","normalize","nth","paraguay","peru","position","puerto","simplify the text","south","tajikistan","tobago"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-04b94903","guard":[["has","location"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"Antigua and Barbuda":"The location of Antigua and Barbuda is Caribbean.","South Sudan":"The location of South Sudan is Eastern Africa.","Montserrat":"The location of Montserrat is Caribbean.","Moldova":"The location of Moldova is Eastern Europe.","United Arab Emirates":"The location of United Arab Emirates is Middle East.","Mexico":"The location of Mexico is Central America.","Puerto Rico":"The location of Puerto Rico is Caribbean.","Bosnia and Herzegovina":"The location of Bosnia and Herzegovina is Southern Europe.","Denmark":"The location of Denmark is Nordic Countries.","Ivory Coast":"The location of Ivory Coast is Western Africa.","Christmas Island":"The location of Christmas Island is Australia and New Zealand.","Trinidad and Tobago":"The location of Trinidad and Tobago is Caribbean.","Burundi":"The location of Burundi is Eastern Africa.","Bangladesh":"The location of Bangladesh is Southern and Central Asia.","Botswana":"The location of Botswana is Southern Africa.","Benin":"The location of Benin is Western Africa.","Malta":"The location of Malta is Southern Europe.","Albania":"The location of Albania is Southern Europe.","Heard Island and McDonald Islands":"The location of Heard Island and McDonald Islands is Antarctica.","Bahamas":"The location of Bahamas is Caribbean.","Paraguay":"The location of Paraguay is South America.","Australia":"The location of Australia is Australia and New Zealand.","Peru":"The location of Peru is South America.","Georgia":"The location of Georgia is Middle East.","Italy":"The location of Italy is Southern Europe.","Tajikistan":"The location of Tajikistan is Southern and Central Asia.","Wallis and Futuna":"The location of Wallis and Futuna is Polynesia.","Bolivia":"The location of Bolivia is South America.","Colombia":"The location of Colombia is South America.","Mongolia":"The location of Mongolia is Eastern Asia.","Austria":"The location of Austria is Western Europe.","Czech Republic":"The location of Czech Republic is Eastern Europe."}}},
{"id":"n-21285615","guard":[["hasAny",["albania","antigua","arab","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","delete","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","remove","south","strip out","tajikistan","tobago","without"]],["has","location"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-fe1949e5","guard":[["hasAny",["albania","antigua","arab","austria","bahamas","bangladesh","benin","bolivia","bosnia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","island","italy","item number","malta","mexico","moldova","mongolia","montserrat","nth","paraguay","peru","position","puerto","separate by","south","split","split by","tajikistan","tobago"]],["has","location"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-83399b4d","guard":[["hasAny",["american","antigua","antilles","arab","azerbaijan","bahamas","bahrain","barbados","characters from","element","fiji","futuna","georgia","heard","item number","jamaica","kitts","korea","letters from to","lucia","martinique","mongolia","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","qatar","slice of the text","substring","tobago","turkey","tuvalu","vanuatu","yemen"]],["has","location"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-ac158b6b","guard":[["hasAny",["albania","arab","australia","austria","bahamas","bangladesh","benin","bolivia","botswana","burundi","christmas","coast","colombia","czech","denmark","element","georgia","italy","item number","malta","mexico","moldova","mongolia","montserrat","normalise","normalize","nth","paraguay","peru","position","puerto","simplify the text","south","tajikistan"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-2dd3e210","guard":[["hasAny",["albania","antigua","arab","austria","bahamas","benin","bolivia","botswana","burundi","coast","colombia","czech","denmark","element","futuna","georgia","heard","italy","item number","longest","longest one","longest word","malta","mexico","moldova","mongolia","nth","paraguay","peru","position","puerto","south","tobago"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-189a3d5a","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","czech","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","moldova","montserrat","nauru","niue","normalise","normalize","nth","palau","pitcairn","position","puerto","russia","simplify the text","tobago","tuvalu","ukraine","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":3}]],"mem":null},
{"id":"n-44f8cb3d","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse the words","reverse word order","tobago","tuvalu","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-4dd43bf4","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-6e013222","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","snake case","snakecase","tobago","tuvalu","underscores","vanuatu","variable name"]],["has","location"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-732a6891","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","camel case","camelcase","element","fiji","futuna","heard","item number","jamaica","kitts","lower camel case","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","tobago","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-a13104b4","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","dashes","element","fiji","futuna","heard","hyphens","item number","jamaica","kebab case","kebabcase","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","slug","tobago","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-c986eab6","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-d547e31c","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","class name","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pascal case","pascalcase","pitcairn","position","puerto","tobago","tuvalu","upper camel case","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-e52ffa79","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-0021c922","guard":[["hasAny",["all caps","american","antigua","antilles","bahamas","barbados","capital letters","capitals","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","tobago","tuvalu","upper case","uppercase","vanuatu","words"]],["has","location"]],"pyramid":["render.and",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-0c456f06","guard":[["hasAny",["all caps","american","antigua","antilles","bahamas","barbados","capital letters","capitals","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse the words","reverse word order","tobago","tuvalu","upper case","uppercase","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-14d743e7","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","invert case","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","swap case","tobago","toggle case","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-1ad39754","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse the words","reverse word order","snake case","snakecase","tobago","tuvalu","underscores","vanuatu","variable name","words backwards"]],["has","location"]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-1b0e6b61","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","camel case","camelcase","element","fiji","futuna","heard","item number","jamaica","kitts","lower camel case","lower case","lowercase","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","small letters","tobago","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-1c5344cf","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","camel case","camelcase","element","fiji","futuna","heard","invert case","item number","jamaica","kitts","lower camel case","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","swap case","tobago","toggle case","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-232a3a1e","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","capitalise","capitalize","capitalize each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","snake case","snakecase","title case","tobago","tuvalu","underscores","vanuatu","variable name"]],["has","location"]],"pyramid":["render.str",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-2bb18bc1","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","dashes","element","fiji","futuna","heard","hyphens","invert case","item number","jamaica","kebab case","kebabcase","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","slug","swap case","tobago","toggle case","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-468dc3ef","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","camel case","camelcase","element","fiji","futuna","heard","invert case","item number","jamaica","kitts","lower camel case","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","swap case","tobago","toggle case","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-47c3855e","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","invert case","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","swap case","tobago","toggle case","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-4d3e52da","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","element","fiji","futuna","heard","item number","jamaica","kitts","lower case","lowercase","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse the words","reverse word order","small letters","tobago","tuvalu","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-4f2ba70d","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","capitalise","capitalize","capitalize each word","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","title case","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.and",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-510daa89","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","class name","element","fiji","futuna","heard","invert case","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pascal case","pascalcase","pitcairn","position","puerto","swap case","tobago","toggle case","tuvalu","upper camel case","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-5157e800","guard":[["hasAny",["all caps","american","antigua","antilles","bahamas","barbados","capital letters","capitals","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","tobago","tuvalu","upper case","uppercase","vanuatu","words"]],["has","location"]],"pyramid":["render.lines",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-5d07da2b","guard":[["hasAny",["all caps","american","antigua","antilles","bahamas","barbados","capital letters","capitals","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","tobago","tuvalu","upper case","uppercase","vanuatu","words"]],["has","location"]],"pyramid":["render.list",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-68748fe6","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","capitalise","capitalize","capitalize each word","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","title case","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.lines",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-71ef2ddb","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","camel case","camelcase","element","fiji","futuna","heard","item number","jamaica","kitts","lower camel case","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse the words","reverse word order","tobago","tuvalu","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-740bf55e","guard":[["hasAny",["all caps","american","antigua","antilles","bahamas","barbados","camel case","camelcase","capital letters","capitals","element","fiji","futuna","heard","item number","jamaica","kitts","lower camel case","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","tobago","tuvalu","upper case","uppercase","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-7ee99e25","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","shortest","shortest one","shortest word","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-8b8ea203","guard":[["hasAny",["american","antigua","antilles","backwards","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse","reverse order","reversed","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-91711d83","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","dashes","element","fiji","futuna","heard","hyphens","item number","jamaica","kebab case","kebabcase","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse the words","reverse word order","slug","tobago","tuvalu","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-94bfc9ef","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","capitalise","capitalize","capitalize each word","dashes","element","fiji","futuna","heard","hyphens","item number","jamaica","kebab case","kebabcase","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","slug","title case","tobago","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-9c5ad25f","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","element","fiji","futuna","heard","invert case","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","snake case","snakecase","swap case","tobago","toggle case","tuvalu","underscores","vanuatu","variable name"]],["has","location"]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-9cc86c38","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","class name","element","fiji","futuna","heard","invert case","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pascal case","pascalcase","pitcairn","position","puerto","swap case","tobago","toggle case","tuvalu","upper camel case","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-a5a3ae57","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","capitalise","capitalize","capitalize each word","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","title case","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.list",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-aec1c1f2","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","capitalise","capitalize","capitalize each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse the words","reverse word order","title case","tobago","tuvalu","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-bab2d717","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","invert case","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","swap case","tobago","toggle case","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-c9e82ae4","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","element","fiji","futuna","heard","invert case","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse the words","reverse word order","swap case","tobago","toggle case","tuvalu","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-ca27964f","guard":[["hasAny",["a to z","alphabetical","alphabetize","american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","sort","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-defb8b86","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","dashes","each word","element","fiji","futuna","heard","hyphens","item number","jamaica","kebab case","kebabcase","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","slug","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.and",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-e37177af","guard":[["hasAny",["american","antigua","antilles","backwards","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse","reverse order","reversed","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-e4d8a50c","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","longest","longest one","longest word","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-e4fe4590","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","dashes","each word","element","fiji","futuna","heard","hyphens","item number","jamaica","kebab case","kebabcase","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","slug","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.lines",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-e6474db6","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","camel case","camelcase","capitalise","capitalize","capitalize each word","element","fiji","futuna","heard","item number","jamaica","kitts","lower camel case","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","title case","tobago","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-ebfac200","guard":[["hasAny",["american","antigua","antilles","backwards","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","reverse","reverse order","reversed","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-f03d8bb2","guard":[["hasAny",["a to z","alphabetical","alphabetize","american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","sort","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-f239d587","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","class name","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pascal case","pascalcase","pitcairn","position","puerto","reverse the words","reverse word order","tobago","tuvalu","upper camel case","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-f8782261","guard":[["hasAny",["a to z","alphabetical","alphabetize","american","antigua","antilles","bahamas","barbados","each word","element","fiji","futuna","heard","item number","jamaica","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","sort","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-ff625aef","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","dashes","each word","element","fiji","futuna","heard","hyphens","item number","jamaica","kebab case","kebabcase","kitts","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","slug","split into words","tobago","tuvalu","vanuatu","words"]],["has","location"]],"pyramid":["render.list",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]]],"mem":null},
{"id":"n-21100ed0","guard":[["hasAny",["american","antigua","antilles","bahamas","barbados","characters from","element","fiji","futuna","heard","item number","jamaica","kitts","letters from to","lucia","martinique","montserrat","nauru","niue","nth","palau","pitcairn","position","puerto","slice of the text","substring","tobago","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-33da1319","guard":[["hasAny",["american","antigua","bahamas","barbados","camel case","camelcase","element","fiji","futuna","heard","item number","jamaica","kitts","longest","longest one","longest word","lower camel case","lucia","nauru","niue","nth","palau","pitcairn","position","puerto","tobago","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-932ca152","guard":[["hasAny",["american","antigua","bahamas","barbados","dashes","element","fiji","futuna","heard","hyphens","item number","jamaica","kebab case","kebabcase","kitts","longest","longest one","longest word","lucia","nauru","niue","nth","palau","pitcairn","position","puerto","slug","tobago","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-dec984c3","guard":[["hasAny",["american","antigua","bahamas","barbados","class name","element","fiji","futuna","heard","item number","jamaica","kitts","longest","longest one","longest word","lucia","nauru","niue","nth","palau","pascal case","pascalcase","pitcairn","position","puerto","tobago","tuvalu","upper camel case","vanuatu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-e2320e20","guard":[["hasAny",["american","antigua","bahamas","barbados","element","fiji","futuna","heard","item number","jamaica","kitts","longest","longest one","longest word","lucia","nauru","niue","nth","palau","pitcairn","position","puerto","reverse the words","reverse word order","tobago","tuvalu","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-d3328a52","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","tajikistan"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-3cd98b0d","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","camel case","camelcase","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","lower camel case","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","tajikistan"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-c0b37d59","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","colombia","element","ethiopia","gibraltar","invert case","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","swap case","tajikistan","toggle case"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-1ddd3f32","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","tajikistan"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-249dd94a","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","tajikistan"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-3a6ef7b5","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","tajikistan"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-3ddf6f55","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","colombia","element","ethiopia","gibraltar","invert case","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","swap case","tajikistan","toggle case"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-7bd4ade5","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","lower case","lowercase","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","small letters","tajikistan"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-8fd3b51a","guard":[["hasAny",["afghanistan","all caps","australia","azerbaijan","bangladesh","botswana","capital letters","capitals","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","tajikistan","upper case","uppercase"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-c4db69eb","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","capitalise","capitalize","capitalize each word","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","tajikistan","title case"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-110fa08c","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","capitalise","capitalize","capitalize each word","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","tajikistan","title case"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-6f3334b4","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","colombia","element","ethiopia","gibraltar","invert case","item number","kyrgyzstan","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","swap case","tajikistan","toggle case"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-d5c699f7","guard":[["hasAny",["afghanistan","australia","azerbaijan","bangladesh","botswana","colombia","element","ethiopia","gibraltar","item number","kyrgyzstan","lower case","lowercase","mauritius","mongolia","montserrat","nth","paraguay","pitcairn","position","shortest","shortest one","shortest word","singapore","small letters","tajikistan"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-2fce396b","guard":[["hasAny",["american","antilles","barbados","dashes","element","fiji","hyphens","item number","jamaica","kebab case","kebabcase","kitts","lucia","martinique","nauru","niue","nth","palau","pitcairn","position","slug","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-4e84989c","guard":[["hasAny",["american","antilles","barbados","class name","element","fiji","item number","jamaica","kitts","lucia","martinique","nauru","niue","nth","palau","pascal case","pascalcase","pitcairn","position","tuvalu","upper camel case","vanuatu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-7978325d","guard":[["hasAny",["american","antilles","barbados","element","fiji","item number","jamaica","kitts","lucia","martinique","nauru","niue","nth","palau","pitcairn","position","reverse the words","reverse word order","tuvalu","vanuatu","words backwards"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-b3bd3ee9","guard":[["hasAny",["american","antilles","barbados","camel case","camelcase","element","fiji","item number","jamaica","kitts","lower camel case","lucia","martinique","nauru","niue","nth","palau","pitcairn","position","tuvalu","vanuatu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-cfcb9f5b","guard":[["hasAny",["benin","coast","gambia","ghana","guinea","helena","leone","liberia","longest","longest one","longest word","nigeria","senegal"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Western Africa."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-8c067249","guard":[["hasAny",["antigua","antilles","bahamas","barbados","element","item number","jamaica","leading zeros","lucia","martinique","montserrat","nth","pad","pad with","padded to","position","puerto","tobago","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",{"lit":"Caribbean"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-25324783","guard":[["hasAny",["antigua","antilles","bahamas","barbados","jamaica","leading zeros","lucia","martinique","montserrat","pad with","padded to","puerto","tobago","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",{"lit":"Caribbean"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-8b7832fa","guard":[["hasAny",["antigua","antilles","bahamas","barbados","jamaica","leading zeros","lucia","martinique","montserrat","pad with","padded to","puerto","tobago","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",{"lit":"Caribbean"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-1e5deaf4","guard":[["hasAny",["element","gambia","ghana","guinea","guineabissau","helena","item number","leone","liberia","nigeria","nth","position","senegal"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Western Africa."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-e0d4c5e9","guard":[["hasAny",["antigua","bahamas","barbados","how many","how many items","jamaica","lucia","martinique","montserrat","normalise","normalize","number of items","puerto","simplify the text","tobago"]],["has","location"]],"pyramid":["render.str",["transform.norm",{"lit":"Caribbean"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-0c365d63","guard":[["hasAny",["delete","gambia","ghana","guinea","guineabissau","helena","leone","liberia","nigeria","senegal","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-96950a21","guard":[["hasAny",["antigua","bahamas","barbados","jamaica","kitts","longest","longest one","longest word","lucia","puerto","tobago"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Caribbean."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-7321dc27","guard":[["hasAny",["bolivia","colombia","falkland","longest","longest one","longest word","paraguay","peru","suriname","uruguay"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is South America."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-bd5710ea","guard":[["hasAny",["burundi","ethiopia","kenya","longest","longest one","longest word","malawi","reunion","south","uganda"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Eastern Africa."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-465251a9","guard":[["hasAny",["benin","change to","element","gambia","ghana","guinea","item number","liberia","nigeria","nth","position","replace","senegal","substitute","swap"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Western Africa"}]],"mem":null},
{"id":"n-465763fd","guard":[["hasAny",["burundi","change to","element","ethiopia","item number","kenya","malawi","mauritius","nth","position","replace","reunion","substitute","swap","uganda"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"Eastern Africa"}]],"mem":null},
{"id":"n-be266d7d","guard":[["hasAny",["benin","change to","element","gambia","ghana","guinea","item number","liberia","nigeria","nth","position","replace","senegal","substitute","swap"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"Western Africa"}]],"mem":null},
{"id":"n-c916c061","guard":[["hasAny",["burundi","change to","element","ethiopia","item number","kenya","malawi","mauritius","nth","position","replace","reunion","substitute","swap","uganda"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Eastern Africa"}]],"mem":null},
{"id":"n-d3fb4e64","guard":[["hasAny",["arab","azerbaijan","bahrain","element","georgia","item number","leading zeros","nth","pad","pad with","padded to","position","qatar","turkey","yemen","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",{"lit":"Middle East"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-7cf76af8","guard":[["hasAny",["arab","azerbaijan","bahrain","georgia","leading zeros","pad with","padded to","qatar","turkey","yemen","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",{"lit":"Middle East"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-d7e09337","guard":[["hasAny",["arab","azerbaijan","bahrain","georgia","leading zeros","pad with","padded to","qatar","turkey","yemen","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",{"lit":"Middle East"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-c225dd86","guard":[["hasAny",["arab","bahrain","georgia","longest","longest one","longest word","qatar","turkey","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Middle East."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-385fbea5","guard":[["hasAny",["azerbaijan","bahrain","change to","element","georgia","item number","nth","position","qatar","replace","substitute","swap","turkey","yemen"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Middle East"}]],"mem":null},
{"id":"n-3ba0d88d","guard":[["hasAny",["albania","change to","croatia","element","gibraltar","italy","item number","malta","nth","position","replace","spain","substitute","swap"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Southern Europe"}]],"mem":null},
{"id":"n-51ef4290","guard":[["hasAny",["bolivia","change to","colombia","element","item number","nth","paraguay","peru","position","replace","substitute","suriname","swap","uruguay"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"South America"}]],"mem":null},
{"id":"n-5a5902bb","guard":[["hasAny",["albania","change to","croatia","element","gibraltar","italy","item number","malta","nth","position","replace","spain","substitute","swap"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"Southern Europe"}]],"mem":null},
{"id":"n-9303607b","guard":[["hasAny",["antilles","barbados","element","item number","jamaica","kitts","lucia","martinique","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Caribbean."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-c60060db","guard":[["hasAny",["azerbaijan","bahrain","change to","element","georgia","item number","nth","position","qatar","replace","substitute","swap","turkey","yemen"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"Middle East"}]],"mem":null},
{"id":"n-e12fc365","guard":[["hasAny",["bolivia","change to","colombia","element","item number","nth","paraguay","peru","position","replace","substitute","suriname","swap","uruguay"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"South America"}]],"mem":null},
{"id":"n-65ff29ee","guard":[["hasAny",["delete","ethiopia","kenya","malawi","mauritius","reunion","strip out","uganda"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-f8f799ff","guard":[["hasAny",["antilles","barbados","delete","jamaica","kitts","lucia","martinique","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-c255d1bb","guard":[["hasAny",["american","futuna","longest","longest one","longest word","niue","pitcairn","tuvalu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Polynesia."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-e6af7b84","guard":[["hasAny",["albania","croatia","italy","longest","longest one","longest word","malta","spain"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southern Europe."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-1626bc66","guard":[["hasAny",["bahamas","barbados","change to","element","item number","jamaica","martinique","montserrat","nth","position","replace","substitute","swap"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Caribbean"}]],"mem":null},
{"id":"n-4ed423fe","guard":[["hasAny",["afghanistan","bangladesh","change to","element","india","item number","kyrgyzstan","nth","position","replace","substitute","swap","tajikistan"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Southern and Central Asia"}]],"mem":null},
{"id":"n-6cb9f2f7","guard":[["hasAny",["afghanistan","bangladesh","change to","element","india","item number","kyrgyzstan","nth","position","replace","substitute","swap","tajikistan"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"Southern and Central Asia"}]],"mem":null},
{"id":"n-aa46342a","guard":[["hasAny",["austria","change to","element","france","item number","luxembourg","monaco","nth","position","replace","substitute","swap","switzerland"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Western Europe"}]],"mem":null},
{"id":"n-c9625ce3","guard":[["hasAny",["austria","change to","element","france","item number","luxembourg","monaco","nth","position","replace","substitute","swap","switzerland"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"Western Europe"}]],"mem":null},
{"id":"n-d76827a8","guard":[["hasAny",["bahamas","barbados","change to","element","item number","jamaica","martinique","montserrat","nth","position","replace","substitute","swap"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"Caribbean"}]],"mem":null},
{"id":"n-f333152d","guard":[["hasAny",["american","element","futuna","item number","leading zeros","niue","nth","pad","pad with","padded to","pitcairn","position","tuvalu","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",{"lit":"Polynesia"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-d87aa5ab","guard":[["hasAny",["benin","guinea","how many","how many items","liberia","nigeria","normalise","normalize","number of items","senegal","simplify the text"]],["has","location"]],"pyramid":["render.str",["transform.norm",{"lit":"Western Africa"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-f1eceafe","guard":[["hasAny",["bolivia","colombia","how many","how many items","normalise","normalize","number of items","paraguay","peru","simplify the text","uruguay"]],["has","location"]],"pyramid":["render.str",["transform.norm",{"lit":"South America"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-02080965","guard":[["hasAny",["delete","guinea","helena","liberia","nigeria","senegal","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-1800ddbd","guard":[["hasAny",["bolivia","colombia","paraguay","peru","separate by","split by","uruguay"]],["has","location"]],"pyramid":["render.and",["transform.split",{"lit":"South America"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6ab233e9","guard":[["hasAny",["bolivia","colombia","paraguay","peru","separate by","split by","uruguay"]],["has","location"]],"pyramid":["render.lines",["transform.split",{"lit":"South America"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-721473ff","guard":[["hasAny",["bolivia","colombia","delete","paraguay","peru","strip out","uruguay"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-9ecd4f70","guard":[["hasAny",["azerbaijan","bahrain","delete","qatar","strip out","turkey","yemen"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle East"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-bb1d130e","guard":[["hasAny",["american","futuna","leading zeros","niue","pad with","padded to","pitcairn","tuvalu","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",{"lit":"Polynesia"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-cbe6701b","guard":[["hasAny",["antigua","bahamas","delete","montserrat","puerto","remove","strip out","tobago"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-f53e8d5d","guard":[["hasAny",["bolivia","colombia","paraguay","peru","separate by","split by","uruguay"]],["has","location"]],"pyramid":["render.list",["transform.split",{"lit":"South America"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f8ade85c","guard":[["hasAny",["american","futuna","leading zeros","niue","pad with","padded to","pitcairn","tuvalu","zero pad"]],["has","location"]],"pyramid":["render.str",["transform.padStart",{"lit":"Polynesia"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-337f0203","guard":[["hasAny",["albania","bosnia","italy","malta"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southern Europe."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-e3cab6e5","guard":[["hasAny",["czech","longest","longest one","longest word","moldova","russia","ukraine"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Eastern Europe."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-f4dae5e9","guard":[["hasAny",["afghanistan","bangladesh","kyrgyzstan","shortest","shortest one","shortest word","tajikistan"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southern and Central Asia."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-0a9faa65","guard":[["hasAny",["element","france","item number","luxembourg","monaco","nth","position","switzerland"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Western Europe."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-01ed00ad","guard":[["hasAny",["albania","gibraltar","how many","how many items","italy","malta","normalise","normalize","number of items","simplify the text"]],["has","location"]],"pyramid":["render.str",["transform.norm",{"lit":"Southern Europe"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-24977196","guard":[["hasAny",["futuna","how many","how many items","niue","normalise","normalize","number of items","pitcairn","simplify the text","tuvalu"]],["has","location"]],"pyramid":["render.str",["transform.norm",{"lit":"Polynesia"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-2b4f4451","guard":[["hasAny",["czech","how many","how many items","moldova","normalise","normalize","number of items","russia","simplify the text","ukraine"]],["has","location"]],"pyramid":["render.str",["transform.norm",{"lit":"Eastern Europe"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-de768322","guard":[["hasAny",["burundi","ethiopia","how many","how many items","kenya","mauritius","normalise","normalize","number of items","simplify the text"]],["has","location"]],"pyramid":["render.str",["transform.norm",{"lit":"Eastern Africa"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-f8e58349","guard":[["hasAny",["azerbaijan","georgia","how many","how many items","normalise","normalize","number of items","qatar","simplify the text","yemen"]],["has","location"]],"pyramid":["render.str",["transform.norm",{"lit":"Middle East"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-1f67a474","guard":[["hasAny",["city","croatia","gibraltar","separate by","spain","split by"]],["has","location"],["has","of"]],"pyramid":["render.list",["transform.split",{"lit":"Southern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-4d8dc5ce","guard":[["hasAny",["city","croatia","gibraltar","separate by","spain","split by"]],["has","location"],["has","of"]],"pyramid":["render.lines",["transform.split",{"lit":"Southern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-4f0e9adf","guard":[["hasAny",["albania","bosnia","italy","malta","separate by","split by"]],["has","location"]],"pyramid":["render.and",["transform.split",{"lit":"Southern Europe"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-510af30c","guard":[["hasAny",["albania","bosnia","italy","malta","separate by","split by"]],["has","location"]],"pyramid":["render.list",["transform.split",{"lit":"Southern Europe"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7a40a2d9","guard":[["hasAny",["american","delete","niue","pitcairn","strip out","tuvalu"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-98af82f6","guard":[["hasAny",["albania","bosnia","italy","malta","separate by","split by"]],["has","location"]],"pyramid":["render.lines",["transform.split",{"lit":"Southern Europe"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a215a69c","guard":[["hasAny",["bolivia","colombia","delete","paraguay","peru","remove","strip out"]],["has","give"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-ca46a532","guard":[["hasAny",["delete","france","luxembourg","monaco","strip out","switzerland"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Europe"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-d750fec5","guard":[["hasAny",["city","croatia","gibraltar","separate by","spain","split by"]],["has","location"],["has","of"]],"pyramid":["render.and",["transform.split",{"lit":"Southern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-e6c4f56e","guard":[["hasAny",["city","croatia","delete","gibraltar","spain","strip out"]],["has","location"],["has","of"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f68baf54","guard":[["hasAny",["albania","bosnia","delete","italy","malta","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern Europe"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f8a180cd","guard":[["hasAny",["albania","bosnia","delete","italy","malta","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Southern Europe"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-fb970405","guard":[["hasAny",["city","croatia","delete","gibraltar","spain","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern Europe"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-13d3fb84","guard":[["hasAny",["denmark","faroe","longest","longest one","longest word","norway"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Nordic Countries."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-3da1bb06","guard":[["hasAny",["botswana","eswatini","longest","longest one","longest word","namibia"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southern Africa."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-4b972e1b","guard":[["hasAny",["austria","france","longest","longest one","longest word","monaco"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Western Europe."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-c1794582","guard":[["hasAny",["el","longest","longest one","longest word","mexico","panama"]],["has","location"],["not",["has","city"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Central America."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-0c69ea0e","guard":[["hasAny",["change to","element","item number","moldova","nth","position","replace","russia","substitute","swap","ukraine"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"Eastern Europe"}]],"mem":null},
{"id":"n-6c113ee5","guard":[["hasAny",["element","item number","nth","philippines","position","singapore","vietnam"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southeast Asia."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-8a9560e5","guard":[["hasAny",["change to","element","item number","niue","nth","pitcairn","position","replace","substitute","swap","tuvalu"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Polynesia"}]],"mem":null},
{"id":"n-c070995c","guard":[["hasAny",["change to","element","item number","niue","nth","pitcairn","position","replace","substitute","swap","tuvalu"]],["has","location"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"Polynesia"}]],"mem":null},
{"id":"n-f200e8d4","guard":[["hasAny",["change to","element","item number","moldova","nth","position","replace","russia","substitute","swap","ukraine"]],["has","location"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Eastern Europe"}]],"mem":null},
{"id":"n-a22ce772","guard":[["hasAny",["american","antilles","characters from","element","item number","kitts","letters from to","nth","position","slice of the text","substring"]],["has","location"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-be993dd9","guard":[["hasAny",["austria","how many","how many items","monaco","netherlands","normalise","normalize","number of items","simplify the text"]],["has","location"]],"pyramid":["render.str",["transform.norm",{"lit":"Western Europe"},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-14d1ce50","guard":[["hasAny",["afghanistan","india","kyrgyzstan","separate by","split by"]],["has","location"]],"pyramid":["render.list",["transform.split",{"lit":"Southern and Central Asia"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-150e5c0e","guard":[["hasAny",["azerbaijan","delete","qatar","strip out","yemen"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle East"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-37201dde","guard":[["hasAny",["delete","ethiopia","kenya","mauritius","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-64ae3c46","guard":[["hasAny",["afghanistan","delete","india","kyrgyzstan","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern and Central Asia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-7eef9716","guard":[["hasAny",["afghanistan","india","kyrgyzstan","separate by","split by"]],["has","location"]],"pyramid":["render.lines",["transform.split",{"lit":"Southern and Central Asia"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-9a015229","guard":[["hasAny",["afghanistan","delete","india","kyrgyzstan","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern and Central Asia"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c2b6d2fd","guard":[["hasAny",["afghanistan","india","kyrgyzstan","separate by","split by"]],["has","location"]],"pyramid":["render.and",["transform.split",{"lit":"Southern and Central Asia"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ce28a91c","guard":[["hasAny",["delete","falkland","strip out","suriname","uruguay"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-e1ecafd6","guard":[["hasAny",["delete","niue","pitcairn","strip out","tuvalu"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-f958cb37","guard":[["hasAny",["afghanistan","delete","india","kyrgyzstan","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern and Central Asia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-199c3600","guard":[["hasAny",["longest","longest one","longest word","nauru","palau"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Micronesia."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-5571ece3","guard":[["hasAny",["egypt","longest","longest one","longest word","tunisia"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Northern Africa."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-6c7f7cb4","guard":[["hasAny",["korea","longest","longest one","longest word","mongolia"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Eastern Asia."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-718a3716","guard":[["hasAny",["chad","congo","longest","longest one","longest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Central Africa."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-b70b6b35","guard":[["hasAny",["ethiopia","mauritius","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Eastern Africa."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-df71351e","guard":[["hasAny",["fiji","longest","longest one","longest word","vanuatu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Melanesia."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-fc13a9db","guard":[["hasAny",["australia","christmas"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Australia and New Zealand."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-80c65717","guard":[["hasAny",["canada","element","greenland","item number","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is North America."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-2568aa79","guard":[["hasAny",["element","item number","montserrat","nth","pitcairn","position","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-2e58742e","guard":[["hasAny",["class name","element","item number","montserrat","nth","pascal case","pascalcase","pitcairn","position","shortest","shortest one","shortest word","upper camel case"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-ac8d7e72","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","montserrat","nth","pitcairn","position","shortest","shortest one","shortest word","slug"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-f4061157","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","montserrat","nth","pitcairn","position","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]]],"mem":null},
{"id":"n-1ca74577","guard":[["hasAny",["bangladesh","separate by","split by","tajikistan"]],["has","location"]],"pyramid":["render.lines",["transform.split",{"lit":"Southern and Central Asia"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-212b1ec4","guard":[["hasAny",["arab","delete","georgia","remove","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle East"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-219943b8","guard":[["hasAny",["bangladesh","delete","remove","strip out","tajikistan"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern and Central Asia"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-34d16ce3","guard":[["hasAny",["bangladesh","separate by","split by","tajikistan"]],["has","location"]],"pyramid":["render.list",["transform.split",{"lit":"Southern and Central Asia"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-70874581","guard":[["hasAny",["bangladesh","separate by","split by","tajikistan"]],["has","location"]],"pyramid":["render.and",["transform.split",{"lit":"Southern and Central Asia"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-70a4ba74","guard":[["hasAny",["delete","russia","strip out","ukraine"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Europe"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-7211b0a5","guard":[["hasAny",["antilles","characters from","kitts","letters from to","slice of the text","substring"]],["has","location"]],"pyramid":["render.str",["transform.substr",{"lit":"Caribbean"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-ae039862","guard":[["hasAny",["benin","coast","delete","remove","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-c874087e","guard":[["hasAny",["bangladesh","delete","strip out","tajikistan"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern and Central Asia"},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d1ccdc8f","guard":[["hasAny",["burundi","delete","remove","south","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-dce3cbfc","guard":[["hasAny",["czech","delete","moldova","remove","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Europe"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-dfd2986c","guard":[["hasAny",["delete","jamaica","lucia","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-dfe7b8d3","guard":[["hasAny",["delete","monaco","netherlands","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Europe"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-0dd47e31","guard":[["hasAny",["longest","longest one","longest word","vietnam"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southeast Asia."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-43a45ec7","guard":[["hasAny",["shortest","shortest one","shortest word","singapore"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southeast Asia."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-691e9e23","guard":[["hasAny",["azerbaijan","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Middle East."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-6dcbea79","guard":[["hasAny",["gibraltar","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southern Europe."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-6e0f7405","guard":[["hasAny",["canada","longest","longest one","longest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is North America."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-9129be3e","guard":[["hasAny",["india","longest","longest one","longest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southern and Central Asia."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-935c4d20","guard":[["hasAny",["heard","longest","longest one","longest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Antarctica."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-ab1df7fd","guard":[["hasAny",["montserrat","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Caribbean."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-f21447ea","guard":[["hasAny",["australia","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Australia and New Zealand."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}]]],"mem":null},
{"id":"n-0827763e","guard":[["hasAny",["benin","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Benin is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-09948e35","guard":[["hasAny",["bolivia","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bolivia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-17fa55c6","guard":[["hasAny",["barbados","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Barbados is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-1970f358","guard":[["hasAny",["botswana","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Botswana is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-1ca33c6b","guard":[["hasAny",["element","item number","jamaica","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Jamaica is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-210a3269","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tajikistan"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tajikistan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-22ef57ca","guard":[["hasAny",["albania","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Albania is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-27599066","guard":[["hasAny",["el","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of El Salvador is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-301f6d26","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","peru","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Peru is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-3509f71b","guard":[["hasAny",["element","item number","longest","longest one","longest word","namibia","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Namibia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-352d7e82","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","vietnam"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Vietnam is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-37adc1c8","guard":[["hasAny",["element","item number","kenya","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Kenya is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-39f371a3","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tuvalu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tuvalu is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-3be4ef67","guard":[["hasAny",["bahrain","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bahrain is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-3e040905","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","suriname"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Suriname is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-3fccfeca","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","yemen"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Yemen is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-43a6e383","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","senegal"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Senegal is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-443b2ccf","guard":[["hasAny",["element","helena","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Saint Helena is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-44542866","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tunisia"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tunisia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-4d79efb5","guard":[["hasAny",["antigua","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Antigua and Barbuda is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-501ebe89","guard":[["hasAny",["element","item number","montserrat","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Montserrat is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-5303617a","guard":[["hasAny",["element","gambia","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Gambia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-53d64a47","guard":[["hasAny",["element","italy","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Italy is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-59d21c47","guard":[["hasAny",["azerbaijan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Azerbaijan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-5ef548d6","guard":[["hasAny",["burundi","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Burundi is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-5fa2078e","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","paraguay","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Paraguay is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-5fd5117c","guard":[["hasAny",["bosnia","element","item number","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bosnia and Herzegovina is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-60f9fb27","guard":[["hasAny",["austria","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Austria is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-620bad24","guard":[["hasAny",["element","item number","longest","longest one","longest word","lucia","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Saint Lucia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-6601983a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","spain"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Spain is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-6879eadf","guard":[["hasAny",["australia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Australia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-696883bd","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","singapore"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Singapore is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-6a7d1ddb","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","south"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of South Sudan is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-71f57bfc","guard":[["hasAny",["element","item number","kyrgyzstan","nth","position","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Kyrgyzstan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-727816cf","guard":[["hasAny",["element","falkland","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Falkland Islands is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-78357a53","guard":[["hasAny",["element","item number","longest","longest one","longest word","malta","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Malta is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-7887057a","guard":[["hasAny",["city","element","item number","longest","longest one","longest word","nth","position"]],["has","location"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Holy See (Vatican City State) is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-78cd87f2","guard":[["hasAny",["bangladesh","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bangladesh is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-7bc0bb2b","guard":[["hasAny",["denmark","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Denmark is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-8209b8a1","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","vanuatu"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Vanuatu is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-8383e4fa","guard":[["hasAny",["element","faroe","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Faroe Islands is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-88736b9c","guard":[["hasAny",["congo","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Congo is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-8cc4d816","guard":[["hasAny",["element","item number","mauritius","nth","position","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mauritius is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-8d69ef33","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","qatar"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Qatar is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-8e5f1191","guard":[["hasAny",["arab","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of United Arab Emirates is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-9034c7c7","guard":[["hasAny",["afghanistan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Afghanistan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-9171e6b7","guard":[["hasAny",["element","gibraltar","item number","nth","position","shortest","shortest one","shortest word"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Gibraltar is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-95fdf934","guard":[["hasAny",["element","ethiopia","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Ethiopia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-9ada3114","guard":[["hasAny",["croatia","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Croatia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-9ae156a3","guard":[["hasAny",["element","item number","longest","longest one","longest word","mexico","nth","position"]],["has","location"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mexico is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-9b938ba2","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","reunion"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Reunion is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-9d94d31b","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","puerto"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Puerto Rico is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-a16f79ca","guard":[["hasAny",["coast","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Ivory Coast is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-a566df12","guard":[["hasAny",["element","ghana","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Ghana is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-a8dab036","guard":[["hasAny",["colombia","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Colombia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-aa792927","guard":[["hasAny",["element","item number","liberia","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Liberia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-aa82264b","guard":[["hasAny",["element","item number","longest","longest one","longest word","niue","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Niue is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-ac9e789c","guard":[["hasAny",["canada","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Canada is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-b1481a34","guard":[["hasAny",["czech","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Czech Republic is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-b253b2cd","guard":[["hasAny",["element","item number","longest","longest one","longest word","monaco","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Monaco is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-b83cc6e5","guard":[["hasAny",["element","item number","longest","longest one","longest word","nigeria","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Nigeria is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-b9a91247","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","palau","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Palau is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-c26a5b86","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tobago"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Trinidad and Tobago is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-c34003eb","guard":[["hasAny",["element","india","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of India is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-c8b4d8dc","guard":[["hasAny",["element","item number","longest","longest one","longest word","nauru","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Nauru is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-cb92537f","guard":[["hasAny",["element","eswatini","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Eswatini is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-cc4913b8","guard":[["hasAny",["element","guinea","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Guinea is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-cc4e9f69","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","pitcairn","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pitcairn is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-cc6c280b","guard":[["hasAny",["element","georgia","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Georgia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-d0625fb6","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","ukraine"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Ukraine is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-d48019a1","guard":[["hasAny",["element","item number","korea","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of North Korea is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-d59a6393","guard":[["hasAny",["element","fiji","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Fiji Islands is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-d63c629e","guard":[["hasAny",["chad","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Chad is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-dcb07ef9","guard":[["hasAny",["element","heard","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Heard Island and McDonald Islands is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-dda71acc","guard":[["hasAny",["element","item number","longest","longest one","longest word","mongolia","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mongolia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-de2f569d","guard":[["hasAny",["element","item number","longest","longest one","longest word","moldova","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Moldova is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-de61d8b3","guard":[["hasAny",["element","item number","longest","longest one","longest word","malawi","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Malawi is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-df1b2e87","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","turkey"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Turkey is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-e489199e","guard":[["hasAny",["american","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of American Samoa is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-e5334995","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","panama","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Panama is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-e58ce84a","guard":[["hasAny",["element","france","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of France is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-e59f4133","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uganda"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Uganda is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-ed4dc8cd","guard":[["hasAny",["element","futuna","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Wallis and Futuna is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-eddf104a","guard":[["hasAny",["christmas","element","item number","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Christmas Island is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-ee0dc5dc","guard":[["hasAny",["element","item number","leone","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Sierra Leone is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-f057b87f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","russia"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Russia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-f508be7a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uruguay"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Uruguay is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-f57c5139","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bahamas is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-f90df728","guard":[["hasAny",["element","item number","longest","longest one","longest word","norway","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Norway is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-ff6e891a","guard":[["hasAny",["element","item number","kitts","longest","longest one","longest word","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Saint Kitts and Nevis is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-1fcd856a","guard":[["hasAny",["element","item number","luxembourg","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Luxembourg is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-549caff8","guard":[["hasAny",["element","item number","nth","philippines","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Philippines is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-560fed7b","guard":[["hasAny",["element","greenland","item number","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Greenland is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-63afe9d1","guard":[["hasAny",["element","guineabissau","item number","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Guinea-Bissau is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-8b1ff62c","guard":[["hasAny",["element","item number","martinique","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Martinique is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-adddd6d0","guard":[["hasAny",["element","item number","nth","position","switzerland"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Switzerland is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-b89fac7b","guard":[["hasAny",["antilles","element","item number","nth","position"]],["has","location"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Netherlands Antilles is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-region-in-world-2ada49"},{"lit":"country"},{"lit":"location"}]],"mem":null},
{"id":"n-04c8c2d6","guard":[["hasAny",["faroe","islands","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Faroe Islands":"The location of Faroe Islands is Nordic Countries."}}},
{"id":"n-0503698c","guard":[["hasAny",["country","gambia","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Gambia":"The location of Gambia is Western Africa."}}},
{"id":"n-0625ed2b","guard":[["hasAny",["location","tuvalu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Tuvalu":"The location of Tuvalu is Polynesia."}}},
{"id":"n-0669c2df","guard":[["hasAny",["country","location","russia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Russia":"The location of Russia is Eastern Europe."}}},
{"id":"n-0795b764","guard":[["hasAny",["country","location","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Suriname":"The location of Suriname is South America."}}},
{"id":"n-09988140","guard":[["hasAny",["congo","country","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Congo":"The location of Congo is Central Africa."}}},
{"id":"n-09dcb9e8","guard":[["hasAny",["location","monaco"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Monaco":"The location of Monaco is Western Europe."}}},
{"id":"n-0ff46485","guard":[["hasAny",["location","senegal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Senegal":"The location of Senegal is Western Africa."}}},
{"id":"n-112998d0","guard":[["hasAny",["country","greenland","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Greenland":"The location of Greenland is North America."}}},
{"id":"n-1f0b1a61","guard":[["hasAny",["country","guineabissau","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Guinea-Bissau":"The location of Guinea-Bissau is Western Africa."}}},
{"id":"n-21c254e0","guard":[["hasAny",["christmas","island","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Christmas Island":"The location of Christmas Island is Australia and New Zealand."}}},
{"id":"n-295493a0","guard":[["hasAny",["country","location","uganda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Uganda":"The location of Uganda is Eastern Africa."}}},
{"id":"n-2b0d2ace","guard":[["hasAny",["location","singapore"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Singapore":"The location of Singapore is Southeast Asia."}}},
{"id":"n-2da4b715","guard":[["hasAny",["country","eswatini","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Eswatini":"The location of Eswatini is Southern Africa."}}},
{"id":"n-32a74fd6","guard":[["hasAny",["location","lucia","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Saint Lucia":"The location of Saint Lucia is Caribbean."}}},
{"id":"n-3f12d9df","guard":[["hasAny",["country","location","turkey"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Turkey":"The location of Turkey is Middle East."}}},
{"id":"n-414fac97","guard":[["hasAny",["country","location","spain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Spain":"The location of Spain is Southern Europe."}}},
{"id":"n-421ff879","guard":[["hasAny",["liberia","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Liberia":"The location of Liberia is Western Africa."}}},
{"id":"n-422e1038","guard":[["hasAny",["albania","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Albania":"The location of Albania is Southern Europe."}}},
{"id":"n-429def04","guard":[["hasAny",["barbados","country","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Barbados":"The location of Barbados is Caribbean."}}},
{"id":"n-43e23741","guard":[["hasAny",["botswana","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Botswana":"The location of Botswana is Southern Africa."}}},
{"id":"n-44b6bd96","guard":[["hasAny",["denmark","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Denmark":"The location of Denmark is Nordic Countries."}}},
{"id":"n-4506aa37","guard":[["hasAny",["location","nauru"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Nauru":"The location of Nauru is Micronesia."}}},
{"id":"n-45cd62ce","guard":[["hasAny",["location","qatar"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Qatar":"The location of Qatar is Middle East."}}},
{"id":"n-478aa702","guard":[["hasAny",["australia","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Australia":"The location of Australia is Australia and New Zealand."}}},
{"id":"n-4a13d848","guard":[["hasAny",["antigua","barbuda","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Antigua and Barbuda":"The location of Antigua and Barbuda is Caribbean."}}},
{"id":"n-52d0544e","guard":[["hasAny",["korea","location","north"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of North Korea":"The location of North Korea is Eastern Asia."}}},
{"id":"n-541ac858","guard":[["hasAny",["czech","location","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Czech Republic":"The location of Czech Republic is Eastern Europe."}}},
{"id":"n-55b48bec","guard":[["hasAny",["country","location","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Vanuatu":"The location of Vanuatu is Melanesia."}}},
{"id":"n-58449972","guard":[["hasAny",["country","egypt","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Egypt":"The location of Egypt is Northern Africa."}}},
{"id":"n-58eba474","guard":[["hasAny",["bahrain","country","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Bahrain":"The location of Bahrain is Middle East."}}},
{"id":"n-5cee959a","guard":[["hasAny",["benin","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Benin":"The location of Benin is Western Africa."}}},
{"id":"n-5d28c46b","guard":[["hasAny",["country","location","philippines"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Philippines":"The location of Philippines is Southeast Asia."}}},
{"id":"n-68b02f93","guard":[["hasAny",["location","netherlands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Netherlands":"The location of Netherlands is Western Europe."}}},
{"id":"n-695b7c18","guard":[["hasAny",["location","paraguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Paraguay":"The location of Paraguay is South America."}}},
{"id":"n-6c5f218d","guard":[["hasAny",["india","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of India":"The location of India is Southern and Central Asia."}}},
{"id":"n-6f8451ed","guard":[["hasAny",["country","location","panama"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Panama":"The location of Panama is Central America."}}},
{"id":"n-6fbff733","guard":[["hasAny",["location","niue"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Niue":"The location of Niue is Polynesia."}}},
{"id":"n-7418a405","guard":[["hasAny",["location","palau"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Palau":"The location of Palau is Micronesia."}}},
{"id":"n-75aeec89","guard":[["hasAny",["country","leone","location","sierra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Sierra Leone":"The location of Sierra Leone is Western Africa."}}},
{"id":"n-763cc934","guard":[["hasAny",["location","nigeria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Nigeria":"The location of Nigeria is Western Africa."}}},
{"id":"n-792f5d84","guard":[["hasAny",["burundi","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Burundi":"The location of Burundi is Eastern Africa."}}},
{"id":"n-79d0911c","guard":[["hasAny",["location","malta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Malta":"The location of Malta is Southern Europe."}}},
{"id":"n-7c83bf7e","guard":[["hasAny",["location","mauritius"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Mauritius":"The location of Mauritius is Eastern Africa."}}},
{"id":"n-7ec781d8","guard":[["hasAny",["location","peru"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Peru":"The location of Peru is South America."}}},
{"id":"n-80787e5c","guard":[["hasAny",["coast","ivory","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Ivory Coast":"The location of Ivory Coast is Western Africa."}}},
{"id":"n-80dd3a0e","guard":[["hasAny",["heard","island","islands","location","mcdonald"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Heard Island and McDonald Islands":"The location of Heard Island and McDonald Islands is Antarctica."}}},
{"id":"n-878ab467","guard":[["hasAny",["location","pitcairn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Pitcairn":"The location of Pitcairn is Polynesia."}}},
{"id":"n-88a3d3e4","guard":[["hasAny",["azerbaijan","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Azerbaijan":"The location of Azerbaijan is Middle East."}}},
{"id":"n-95c34d56","guard":[["hasAny",["afghanistan","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Afghanistan":"The location of Afghanistan is Southern and Central Asia."}}},
{"id":"n-99780542","guard":[["hasAny",["country","location","luxembourg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Luxembourg":"The location of Luxembourg is Western Europe."}}},
{"id":"n-999a1d02","guard":[["hasAny",["antilles","country","location","netherlands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Netherlands Antilles":"The location of Netherlands Antilles is Caribbean."}}},
{"id":"n-9a1dd96e","guard":[["hasAny",["italy","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Italy":"The location of Italy is Southern Europe."}}},
{"id":"n-9c29a369","guard":[["hasAny",["country","location","reunion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Reunion":"The location of Reunion is Eastern Africa."}}},
{"id":"n-9d5afbf3","guard":[["hasAny",["futuna","location","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Wallis and Futuna":"The location of Wallis and Futuna is Polynesia."}}},
{"id":"n-9debad75","guard":[["hasAny",["colombia","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Colombia":"The location of Colombia is South America."}}},
{"id":"n-9e044eb5","guard":[["hasAny",["ethiopia","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Ethiopia":"The location of Ethiopia is Eastern Africa."}}},
{"id":"n-9fe06d1c","guard":[["hasAny",["bolivia","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Bolivia":"The location of Bolivia is South America."}}},
{"id":"n-a10b4c79","guard":[["hasAny",["location","tunisia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Tunisia":"The location of Tunisia is Northern Africa."}}},
{"id":"n-a20970ac","guard":[["hasAny",["location","moldova"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Moldova":"The location of Moldova is Eastern Europe."}}},
{"id":"n-aa326b63","guard":[["hasAny",["location","norway"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Norway":"The location of Norway is Nordic Countries."}}},
{"id":"n-ac3e9f25","guard":[["hasAny",["location","tajikistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Tajikistan":"The location of Tajikistan is Southern and Central Asia."}}},
{"id":"n-ac56cb96","guard":[["hasAny",["location","puerto","rico"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Puerto Rico":"The location of Puerto Rico is Caribbean."}}},
{"id":"n-ad4d5dcb","guard":[["hasAny",["georgia","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Georgia":"The location of Georgia is Middle East."}}},
{"id":"n-b2b839af","guard":[["hasAny",["chad","country","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Chad":"The location of Chad is Central Africa."}}},
{"id":"n-b5af9131","guard":[["hasAny",["jamaica","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Jamaica":"The location of Jamaica is Caribbean."}}},
{"id":"n-b7775315","guard":[["hasAny",["location","vietnam"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Vietnam":"The location of Vietnam is Southeast Asia."}}},
{"id":"n-b872d20a","guard":[["hasAny",["location","mongolia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Mongolia":"The location of Mongolia is Eastern Asia."}}},
{"id":"n-b924300e","guard":[["hasAny",["american","country","location","samoa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country American Samoa":"The location of American Samoa is Polynesia."}}},
{"id":"n-b9f19cd0","guard":[["hasAny",["country","location","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Ukraine":"The location of Ukraine is Eastern Europe."}}},
{"id":"n-bc126a95","guard":[["hasAny",["country","falkland","islands","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Falkland Islands":"The location of Falkland Islands is South America."}}},
{"id":"n-bdf71331","guard":[["hasAny",["bosnia","herzegovina","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Bosnia and Herzegovina":"The location of Bosnia and Herzegovina is Southern Europe."}}},
{"id":"n-bfd95543","guard":[["hasAny",["location","tobago","trinidad"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Trinidad and Tobago":"The location of Trinidad and Tobago is Caribbean."}}},
{"id":"n-c281ea65","guard":[["hasAny",["country","location","switzerland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Switzerland":"The location of Switzerland is Western Europe."}}},
{"id":"n-c68a6aca","guard":[["hasAny",["country","ghana","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Ghana":"The location of Ghana is Western Africa."}}},
{"id":"n-ca832222","guard":[["hasAny",["kyrgyzstan","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Kyrgyzstan":"The location of Kyrgyzstan is Southern and Central Asia."}}},
{"id":"n-cd57c786","guard":[["hasAny",["helena","location","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Saint Helena":"The location of Saint Helena is Western Africa."}}},
{"id":"n-ce3241a1","guard":[["hasAny",["country","location","malawi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Malawi":"The location of Malawi is Eastern Africa."}}},
{"id":"n-d0d271d4","guard":[["hasAny",["gibraltar","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Gibraltar":"The location of Gibraltar is Southern Europe."}}},
{"id":"n-d4c3bf20","guard":[["hasAny",["location","south","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for South Sudan":"The location of South Sudan is Eastern Africa."}}},
{"id":"n-d6255379","guard":[["hasAny",["location","yemen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Yemen":"The location of Yemen is Middle East."}}},
{"id":"n-d7108cfa","guard":[["hasAny",["location","mexico"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Mexico":"The location of Mexico is Central America."}}},
{"id":"n-dbd67ca5","guard":[["hasAny",["guinea","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Guinea":"The location of Guinea is Western Africa."}}},
{"id":"n-dcddf31c","guard":[["hasAny",["city","country","holy","location","see","state","vatican"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Holy See (Vatican City State)":"The location of Holy See (Vatican City State) is Southern Europe."}}},
{"id":"n-de4ac46b","guard":[["hasAny",["location","namibia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Namibia":"The location of Namibia is Southern Africa."}}},
{"id":"n-e01bf75d","guard":[["hasAny",["fiji","islands","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Fiji Islands":"The location of Fiji Islands is Melanesia."}}},
{"id":"n-e34bf58f","guard":[["hasAny",["arab","emirates","location","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for United Arab Emirates":"The location of United Arab Emirates is Middle East."}}},
{"id":"n-e546df5e","guard":[["hasAny",["austria","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Austria":"The location of Austria is Western Europe."}}},
{"id":"n-e7ccf95f","guard":[["hasAny",["bahamas","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Bahamas":"The location of Bahamas is Caribbean."}}},
{"id":"n-ebce5664","guard":[["hasAny",["location","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Uruguay":"The location of Uruguay is South America."}}},
{"id":"n-ecd53bae","guard":[["hasAny",["country","france","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country France":"The location of France is Western Europe."}}},
{"id":"n-edde3048","guard":[["hasAny",["country","kitts","location","nevis","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Saint Kitts and Nevis":"The location of Saint Kitts and Nevis is Caribbean."}}},
{"id":"n-f020fee8","guard":[["hasAny",["bangladesh","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Bangladesh":"The location of Bangladesh is Southern and Central Asia."}}},
{"id":"n-f6d4cb65","guard":[["hasAny",["kenya","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Kenya":"The location of Kenya is Eastern Africa."}}},
{"id":"n-f6ef91af","guard":[["hasAny",["country","location","martinique"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Martinique":"The location of Martinique is Caribbean."}}},
{"id":"n-f97d20b2","guard":[["hasAny",["country","croatia","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country Croatia":"The location of Croatia is Southern Europe."}}},
{"id":"n-fd1888a2","guard":[["hasAny",["canada","location"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the location of Canada":"The location of Canada is North America."}}},
{"id":"n-fd18a905","guard":[["hasAny",["country","el","location","salvador"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the location of the country El Salvador":"The location of El Salvador is Central America."}}},
{"id":"n-fde56816","guard":[["hasAny",["location","montserrat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the location for Montserrat":"The location of Montserrat is Caribbean."}}},
{"id":"n-6d01d65a","guard":[["hasAny",["austria","delete","remove","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Europe"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-852a1ec5","guard":[["hasAny",["delete","strip out","uruguay"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d77d6c1a","guard":[["hasAny",["american","characters from","letters from to","slice of the text","substring"]],["has","location"]],"pyramid":["render.str",["transform.substr",{"lit":"Polynesia"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-e0d3ad6d","guard":[["hasAny",["delete","futuna","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-e0fd8017","guard":[["hasAny",["delete","gibraltar","strip out"]],["has","location"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern Europe"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-fbd75b09","guard":[["has","location"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Antigua and Barbuda":"The location of Antigua and Barbuda is Caribbean.","tell me the location of the country El Salvador":"The location of El Salvador is Central America.","tell me the location of the country Panama":"The location of Panama is Central America.","tell me the location of the country Barbados":"The location of Barbados is Caribbean.","give the location for South Sudan":"The location of South Sudan is Eastern Africa.","give the location for Montserrat":"The location of Montserrat is Caribbean.","give the location for Moldova":"The location of Moldova is Eastern Europe.","what is the location of Afghanistan":"The location of Afghanistan is Southern and Central Asia.","what is the location of Uruguay":"The location of Uruguay is South America.","give the location for United Arab Emirates":"The location of United Arab Emirates is Middle East.","give the location for Mexico":"The location of Mexico is Central America.","tell me the location of the country Congo":"The location of Congo is Central Africa.","give the location for Puerto Rico":"The location of Puerto Rico is Caribbean.","give the location for Bosnia and Herzegovina":"The location of Bosnia and Herzegovina is Southern Europe.","what is the location of Senegal":"The location of Senegal is Western Africa.","give the location for Denmark":"The location of Denmark is Nordic Countries.","what is the location of Pitcairn":"The location of Pitcairn is Polynesia.","what is the location of Yemen":"The location of Yemen is Middle East.","what is the location of Saint Lucia":"The location of Saint Lucia is Caribbean.","give the location for Ivory Coast":"The location of Ivory Coast is Western Africa.","tell me the location of the country Croatia":"The location of Croatia is Southern Europe.","tell me the location of the country Ukraine":"The location of Ukraine is Eastern Europe.","tell me the location of the country Suriname":"The location of Suriname is South America.","tell me the location of the country Turkey":"The location of Turkey is Middle East.","what is the location of Kenya":"The location of Kenya is Eastern Africa.","give the location for Christmas Island":"The location of Christmas Island is Australia and New Zealand.","what is the location of Azerbaijan":"The location of Azerbaijan is Middle East.","what is the location of Guinea":"The location of Guinea is Western Africa.","what is the location of Netherlands":"The location of Netherlands is Western Europe.","what is the location of Kyrgyzstan":"The location of Kyrgyzstan is Southern and Central Asia.","what is the location of Qatar":"The location of Qatar is Middle East.","tell me the location of the country Russia":"The location of Russia is Eastern Europe.","tell me the location of the country Martinique":"The location of Martinique is Caribbean.","tell me the location of the country France":"The location of France is Western Europe.","tell me the location of the country Ghana":"The location of Ghana is Western Africa.","tell me the location of the country Switzerland":"The location of Switzerland is Western Europe.","tell me the location of the country Uganda":"The location of Uganda is Eastern Africa.","what is the location of Niue":"The location of Niue is Polynesia.","tell me the location of the country Netherlands Antilles":"The location of Netherlands Antilles is Caribbean.","give the location for Trinidad and Tobago":"The location of Trinidad and Tobago is Caribbean.","give the location for Burundi":"The location of Burundi is Eastern Africa.","what is the location of Tuvalu":"The location of Tuvalu is Polynesia.","what is the location of Gibraltar":"The location of Gibraltar is Southern Europe.","tell me the location of the country Falkland Islands":"The location of Falkland Islands is South America.","what is the location of Ethiopia":"The location of Ethiopia is Eastern Africa.","what is the location of Canada":"The location of Canada is North America.","what is the location of North Korea":"The location of North Korea is Eastern Asia.","tell me the location of the country Reunion":"The location of Reunion is Eastern Africa.","give the location for Bangladesh":"The location of Bangladesh is Southern and Central Asia.","what is the location of Mauritius":"The location of Mauritius is Eastern Africa.","tell me the location of the country American Samoa":"The location of American Samoa is Polynesia.","what is the location of Fiji Islands":"The location of Fiji Islands is Melanesia.","what is the location of Norway":"The location of Norway is Nordic Countries.","tell me the location of the country Sierra Leone":"The location of Sierra Leone is Western Africa.","tell me the location of the country Vanuatu":"The location of Vanuatu is Melanesia.","give the location for Botswana":"The location of Botswana is Southern Africa.","what is the location of Liberia":"The location of Liberia is Western Africa.","give the location for Benin":"The location of Benin is Western Africa.","what is the location of Jamaica":"The location of Jamaica is Caribbean.","tell me the location of the country Guinea-Bissau":"The location of Guinea-Bissau is Western Africa.","what is the location of Faroe Islands":"The location of Faroe Islands is Nordic Countries.","tell me the location of the country Spain":"The location of Spain is Southern Europe.","give the location for Malta":"The location of Malta is Southern Europe.","give the location for Albania":"The location of Albania is Southern Europe.","what is the location of Saint Helena":"The location of Saint Helena is Western Africa.","tell me the location of the country Malawi":"The location of Malawi is Eastern Africa.","tell me the location of the country Eswatini":"The location of Eswatini is Southern Africa.","give the location for Heard Island and McDonald Islands":"The location of Heard Island and McDonald Islands is Antarctica.","tell me the location of the country Philippines":"The location of Philippines is Southeast Asia.","give the location for Bahamas":"The location of Bahamas is Caribbean.","tell me the location of the country Saint Kitts and Nevis":"The location of Saint Kitts and Nevis is Caribbean.","give the location for Paraguay":"The location of Paraguay is South America.","what is the location of Tunisia":"The location of Tunisia is Northern Africa.","give the location for Australia":"The location of Australia is Australia and New Zealand.","give the location for Peru":"The location of Peru is South America.","give the location for Georgia":"The location of Georgia is Middle East.","give the location for Italy":"The location of Italy is Southern Europe.","what is the location of Nauru":"The location of Nauru is Micronesia.","what is the location of Monaco":"The location of Monaco is Western Europe.","give the location for Tajikistan":"The location of Tajikistan is Southern and Central Asia.","tell me the location of the country Greenland":"The location of Greenland is North America.","give the location for Wallis and Futuna":"The location of Wallis and Futuna is Polynesia.","what is the location of Namibia":"The location of Namibia is Southern Africa.","what is the location of Singapore":"The location of Singapore is Southeast Asia.","tell me the location of the country Bahrain":"The location of Bahrain is Middle East.","give the location for Bolivia":"The location of Bolivia is South America.","what is the location of Vietnam":"The location of Vietnam is Southeast Asia.","give the location for Colombia":"The location of Colombia is South America.","tell me the location of the country Chad":"The location of Chad is Central Africa.","tell me the location of the country Egypt":"The location of Egypt is Northern Africa.","give the location for Mongolia":"The location of Mongolia is Eastern Asia.","tell me the location of the country Gambia":"The location of Gambia is Western Africa.","what is the location of Nigeria":"The location of Nigeria is Western Africa.","give the location for Austria":"The location of Austria is Western Europe.","tell me the location of the country Luxembourg":"The location of Luxembourg is Western Europe.","what is the location of India":"The location of India is Southern and Central Asia.","tell me the location of the country Holy See (Vatican City State)":"The location of Holy See (Vatican City State) is Southern Europe.","give the location for Czech Republic":"The location of Czech Republic is Eastern Europe.","what is the location of Palau":"The location of Palau is Micronesia."}}},
{"id":"n-00d3f0ac","guard":[["hasAny",["country","falkland","islands","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Falkland Islands":"The location of Falkland Islands is South America."}}},
{"id":"n-05b61f24","guard":[["hasAny",["canada","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Canada":"The location of Canada is North America."}}},
{"id":"n-065334da","guard":[["has","egypt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Egypt":"The location of Egypt is Northern Africa."}}},
{"id":"n-09e614b3","guard":[["hasAny",["bahamas","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Bahamas":"The location of Bahamas is Caribbean."}}},
{"id":"n-0a928125","guard":[["has","ukraine"],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Ukraine":"The location of Ukraine is Eastern Europe."}}},
{"id":"n-0b2b3925","guard":[["has","vanuatu"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Vanuatu":"The location of Vanuatu is Melanesia."}}},
{"id":"n-0beb015e","guard":[["has","uganda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Uganda":"The location of Uganda is Eastern Africa."}}},
{"id":"n-0ec4348a","guard":[["has","faroe"],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Faroe Islands":"The location of Faroe Islands is Nordic Countries."}}},
{"id":"n-0ff20682","guard":[["hasAny",["location","uruguay"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Uruguay":"The location of Uruguay is South America."}}},
{"id":"n-14fe50a7","guard":[["hasAny",["location","mexico"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Mexico":"The location of Mexico is Central America."}}},
{"id":"n-19c4e4a4","guard":[["hasAny",["heard","island","islands","location","mcdonald"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Heard Island and McDonald Islands":"The location of Heard Island and McDonald Islands is Antarctica."}}},
{"id":"n-1a27ef5f","guard":[["has","panama"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Panama":"The location of Panama is Central America."}}},
{"id":"n-1b87e614","guard":[["hasAny",["location","malta"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Malta":"The location of Malta is Southern Europe."}}},
{"id":"n-1c201e40","guard":[["hasAny",["location","tuvalu"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Tuvalu":"The location of Tuvalu is Polynesia."}}},
{"id":"n-1e1f9bfd","guard":[["has","turkey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Turkey":"The location of Turkey is Middle East."}}},
{"id":"n-1e2535bb","guard":[["has","martinique"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Martinique":"The location of Martinique is Caribbean."}}},
{"id":"n-1ea1471b","guard":[["hasAny",["bolivia","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Bolivia":"The location of Bolivia is South America."}}},
{"id":"n-1f752e95","guard":[["hasAny",["location","norway"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Norway":"The location of Norway is Nordic Countries."}}},
{"id":"n-20baf798","guard":[["has","russia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Russia":"The location of Russia is Eastern Europe."}}},
{"id":"n-21554e04","guard":[["hasAny",["location","singapore"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Singapore":"The location of Singapore is Southeast Asia."}}},
{"id":"n-28e7c31c","guard":[["hasAny",["location","niue"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Niue":"The location of Niue is Polynesia."}}},
{"id":"n-2b366901","guard":[["has","france"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country France":"The location of France is Western Europe."}}},
{"id":"n-2f0449c9","guard":[["has","switzerland"],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Switzerland":"The location of Switzerland is Western Europe."}}},
{"id":"n-3108c8b1","guard":[["hasAny",["arab","emirates","location","united"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for United Arab Emirates":"The location of United Arab Emirates is Middle East."}}},
{"id":"n-3c75c6e8","guard":[["hasAny",["ethiopia","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Ethiopia":"The location of Ethiopia is Eastern Africa."}}},
{"id":"n-3ce3d61d","guard":[["hasAny",["coast","ivory","location"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Ivory Coast":"The location of Ivory Coast is Western Africa."}}},
{"id":"n-42d9bf14","guard":[["hasAny",["location","tajikistan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Tajikistan":"The location of Tajikistan is Southern and Central Asia."}}},
{"id":"n-47f4bd3f","guard":[["hasAny",["location","tunisia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Tunisia":"The location of Tunisia is Northern Africa."}}},
{"id":"n-497ceeb9","guard":[["hasAny",["country","leone","location","sierra"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Sierra Leone":"The location of Sierra Leone is Western Africa."}}},
{"id":"n-4e385dd6","guard":[["hasAny",["city","country","holy","location","see","state","vatican"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Holy See (Vatican City State)":"The location of Holy See (Vatican City State) is Southern Europe."}}},
{"id":"n-50f23e5f","guard":[["hasAny",["gibraltar","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Gibraltar":"The location of Gibraltar is Southern Europe."}}},
{"id":"n-5498bba6","guard":[["hasAny",["antigua","barbuda","location"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Antigua and Barbuda":"The location of Antigua and Barbuda is Caribbean."}}},
{"id":"n-5681b64a","guard":[["hasAny",["american","country","location","samoa"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country American Samoa":"The location of American Samoa is Polynesia."}}},
{"id":"n-578b5626","guard":[["hasAny",["kyrgyzstan","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Kyrgyzstan":"The location of Kyrgyzstan is Southern and Central Asia."}}},
{"id":"n-58387050","guard":[["hasAny",["location","paraguay"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Paraguay":"The location of Paraguay is South America."}}},
{"id":"n-5b38ea61","guard":[["has","suriname"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Suriname":"The location of Suriname is South America."}}},
{"id":"n-5d7a0641","guard":[["hasAny",["denmark","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Denmark":"The location of Denmark is Nordic Countries."}}},
{"id":"n-60a526ba","guard":[["hasAny",["india","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of India":"The location of India is Southern and Central Asia."}}},
{"id":"n-628d650a","guard":[["hasAny",["location","namibia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Namibia":"The location of Namibia is Southern Africa."}}},
{"id":"n-653e54ad","guard":[["hasAny",["burundi","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Burundi":"The location of Burundi is Eastern Africa."}}},
{"id":"n-67b15a6c","guard":[["hasAny",["bangladesh","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Bangladesh":"The location of Bangladesh is Southern and Central Asia."}}},
{"id":"n-68361b0c","guard":[["hasAny",["guinea","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Guinea":"The location of Guinea is Western Africa."}}},
{"id":"n-6af2b2b0","guard":[["hasAny",["kenya","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Kenya":"The location of Kenya is Eastern Africa."}}},
{"id":"n-6bd97246","guard":[["hasAny",["jamaica","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Jamaica":"The location of Jamaica is Caribbean."}}},
{"id":"n-6c5b596f","guard":[["hasAny",["czech","location","republic"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Czech Republic":"The location of Czech Republic is Eastern Europe."}}},
{"id":"n-75c51768","guard":[["hasAny",["christmas","island","location"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Christmas Island":"The location of Christmas Island is Australia and New Zealand."}}},
{"id":"n-7801cbc5","guard":[["hasAny",["location","nigeria"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Nigeria":"The location of Nigeria is Western Africa."}}},
{"id":"n-798380da","guard":[["hasAny",["afghanistan","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Afghanistan":"The location of Afghanistan is Southern and Central Asia."}}},
{"id":"n-7a04e2f5","guard":[["has","luxembourg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Luxembourg":"The location of Luxembourg is Western Europe."}}},
{"id":"n-7a064150","guard":[["hasAny",["location","peru"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Peru":"The location of Peru is South America."}}},
{"id":"n-7bbe22c2","guard":[["has","philippines"],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Philippines":"The location of Philippines is Southeast Asia."}}},
{"id":"n-7db3ac7a","guard":[["has","greenland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Greenland":"The location of Greenland is North America."}}},
{"id":"n-7eeadf29","guard":[["hasAny",["benin","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Benin":"The location of Benin is Western Africa."}}},
{"id":"n-800943eb","guard":[["has","bahrain"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Bahrain":"The location of Bahrain is Middle East."}}},
{"id":"n-80460a72","guard":[["hasAny",["location","qatar"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Qatar":"The location of Qatar is Middle East."}}},
{"id":"n-81a78652","guard":[["has","malawi"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Malawi":"The location of Malawi is Eastern Africa."}}},
{"id":"n-845a99ef","guard":[["has","fiji"],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Fiji Islands":"The location of Fiji Islands is Melanesia."}}},
{"id":"n-8759b532","guard":[["hasAny",["location","monaco"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Monaco":"The location of Monaco is Western Europe."}}},
{"id":"n-87dab342","guard":[["hasAny",["futuna","location","wallis"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Wallis and Futuna":"The location of Wallis and Futuna is Polynesia."}}},
{"id":"n-89e89eed","guard":[["hasAny",["azerbaijan","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Azerbaijan":"The location of Azerbaijan is Middle East."}}},
{"id":"n-8cd487d0","guard":[["hasAny",["italy","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Italy":"The location of Italy is Southern Europe."}}},
{"id":"n-8d030aba","guard":[["hasAny",["botswana","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Botswana":"The location of Botswana is Southern Africa."}}},
{"id":"n-90a374f1","guard":[["hasAny",["country","el","location","salvador"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country El Salvador":"The location of El Salvador is Central America."}}},
{"id":"n-92f87eea","guard":[["has","congo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Congo":"The location of Congo is Central Africa."}}},
{"id":"n-94d4f860","guard":[["hasAny",["location","pitcairn"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Pitcairn":"The location of Pitcairn is Polynesia."}}},
{"id":"n-98292691","guard":[["hasAny",["country","kitts","location","nevis","saint"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Saint Kitts and Nevis":"The location of Saint Kitts and Nevis is Caribbean."}}},
{"id":"n-99de1948","guard":[["hasAny",["georgia","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Georgia":"The location of Georgia is Middle East."}}},
{"id":"n-a00a808c","guard":[["hasAny",["austria","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Austria":"The location of Austria is Western Europe."}}},
{"id":"n-a0f72c74","guard":[["hasAny",["liberia","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Liberia":"The location of Liberia is Western Africa."}}},
{"id":"n-a75e6702","guard":[["hasAny",["location","senegal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Senegal":"The location of Senegal is Western Africa."}}},
{"id":"n-aa121aa9","guard":[["has","eswatini"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Eswatini":"The location of Eswatini is Southern Africa."}}},
{"id":"n-abbec619","guard":[["has","guineabissau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Guinea-Bissau":"The location of Guinea-Bissau is Western Africa."}}},
{"id":"n-b12046d4","guard":[["hasAny",["australia","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Australia":"The location of Australia is Australia and New Zealand."}}},
{"id":"n-b3524fa5","guard":[["hasAny",["location","mongolia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Mongolia":"The location of Mongolia is Eastern Asia."}}},
{"id":"n-b4371e42","guard":[["hasAny",["antilles","country"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Netherlands Antilles":"The location of Netherlands Antilles is Caribbean."}}},
{"id":"n-b8398cfb","guard":[["has","chad"],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Chad":"The location of Chad is Central Africa."}}},
{"id":"n-bcb0b8f3","guard":[["has","croatia"],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Croatia":"The location of Croatia is Southern Europe."}}},
{"id":"n-bd994619","guard":[["hasAny",["location","moldova"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Moldova":"The location of Moldova is Eastern Europe."}}},
{"id":"n-c0030773","guard":[["has","spain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Spain":"The location of Spain is Southern Europe."}}},
{"id":"n-c2eac984","guard":[["hasAny",["location","south","sudan"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for South Sudan":"The location of South Sudan is Eastern Africa."}}},
{"id":"n-c3bf341e","guard":[["hasAny",["location","puerto","rico"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Puerto Rico":"The location of Puerto Rico is Caribbean."}}},
{"id":"n-c454794e","guard":[["has","barbados"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Barbados":"The location of Barbados is Caribbean."}}},
{"id":"n-c4ac14dc","guard":[["hasAny",["location","yemen"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Yemen":"The location of Yemen is Middle East."}}},
{"id":"n-c6004c89","guard":[["has","helena"],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Saint Helena":"The location of Saint Helena is Western Africa."}}},
{"id":"n-c63e10f9","guard":[["hasAny",["location","tobago","trinidad"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Trinidad and Tobago":"The location of Trinidad and Tobago is Caribbean."}}},
{"id":"n-c75a138e","guard":[["has","ghana"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Ghana":"The location of Ghana is Western Africa."}}},
{"id":"n-cdcf6aa6","guard":[["has","gambia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Gambia":"The location of Gambia is Western Africa."}}},
{"id":"n-d9266799","guard":[["hasAny",["location","mauritius"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Mauritius":"The location of Mauritius is Eastern Africa."}}},
{"id":"n-da11b2c2","guard":[["hasAny",["location","palau"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Palau":"The location of Palau is Micronesia."}}},
{"id":"n-da9ff672","guard":[["hasAny",["bosnia","herzegovina","location"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Bosnia and Herzegovina":"The location of Bosnia and Herzegovina is Southern Europe."}}},
{"id":"n-dea56c08","guard":[["hasAny",["location","montserrat"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Montserrat":"The location of Montserrat is Caribbean."}}},
{"id":"n-e1e8a2bf","guard":[["has","lucia"],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Saint Lucia":"The location of Saint Lucia is Caribbean."}}},
{"id":"n-e316dac2","guard":[["has","reunion"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the location of the country Reunion":"The location of Reunion is Eastern Africa."}}},
{"id":"n-edcda384","guard":[["hasAny",["location","nauru"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Nauru":"The location of Nauru is Micronesia."}}},
{"id":"n-f0344e6c","guard":[["hasAny",["albania","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Albania":"The location of Albania is Southern Europe."}}},
{"id":"n-f21d249e","guard":[["hasAny",["colombia","location"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the location for Colombia":"The location of Colombia is South America."}}},
{"id":"n-f54517c2","guard":[["hasAny",["location","vietnam"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of Vietnam":"The location of Vietnam is Southeast Asia."}}},
{"id":"n-f766b9ac","guard":[["hasAny",["korea","location","north"]],["has","location"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the location of North Korea":"The location of North Korea is Eastern Asia."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"give the location for Antigua and Barbuda","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"tell me the location of the country El Salvador","expect":{"contains":["Central America"],"notRefusal":true}},{"q":"tell me the location of the country Panama","expect":{"contains":["Central America"],"notRefusal":true}},{"q":"tell me the location of the country Barbados","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"give the location for South Sudan","expect":{"contains":["Eastern Africa"],"notRefusal":true}},{"q":"give the location for Montserrat","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"give the location for Moldova","expect":{"contains":["Eastern Europe"],"notRefusal":true}},{"q":"what is the location of Afghanistan","expect":{"contains":["Southern and Central Asia"],"notRefusal":true}},{"q":"what is the location of Uruguay","expect":{"contains":["South America"],"notRefusal":true}},{"q":"give the location for United Arab Emirates","expect":{"contains":["Middle East"],"notRefusal":true}},{"q":"give the location for Mexico","expect":{"contains":["Central America"],"notRefusal":true}},{"q":"tell me the location of the country Congo","expect":{"contains":["Central Africa"],"notRefusal":true}},{"q":"give the location for Puerto Rico","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"give the location for Bosnia and Herzegovina","expect":{"contains":["Southern Europe"],"notRefusal":true}},{"q":"what is the location of Senegal","expect":{"contains":["Western Africa"],"notRefusal":true}},{"q":"give the location for Denmark","expect":{"contains":["Nordic Countries"],"notRefusal":true}},{"q":"what is the location of Pitcairn","expect":{"contains":["Polynesia"],"notRefusal":true}},{"q":"what is the location of Yemen","expect":{"contains":["Middle East"],"notRefusal":true}},{"q":"what is the location of Saint Lucia","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"give the location for Ivory Coast","expect":{"contains":["Western Africa"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
