// south-of-country-db47-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"south-of-country-db47-neo-g10","class":"south-of-country-db47","generation":10,"lane":"neo","grownFrom":["tell me the south of Finland","tell me the south of Cape Verde","what is the south of Uzbekistan","tell me the south of Latvia","what is the south of Wallis and Futuna","what is the south of Guadeloupe","what is the south of Comoros","give the south of Austria","tell me the south of Christmas Island","give the south of Angola","give the south of Tuvalu","what is the south of Saint Lucia","tell me the south of East Timor","give the south of Tokelau","tell me the south of Argentina","give the south of Turkmenistan","tell me the south of Gabon","give the south of Australia","give the south of Sweden","what is the south of Heard Island and McDonald Islands"],"version":1});

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
knowLoad([{"id":"fr-country-json-country-by-geo-coordinates-bfc6f9","columns":["country","south"],"n":244,"cols":[{"f":"0Afghanistan|1lbania|2geria|1merican Samoa|1ndorra|2gola|3uilla|2tarctica|3igua and Barbuda|1rgentina|2menia|2uba|1ustralia|5ia|1zerbaijan|0Bahamas|3rain|2ngladesh|2rbados|1elarus|3gium|3ize|2nin|2rmuda|1hutan|1olivia|2snia and Herzegovina|2tswana|2uvet Island|1razil|2itish Indian Ocean Territory|2unei|1ulgaria|2rkina Faso|3undi|0Cambodia|3eroon|2nada|2pe Verde|2yman Islands|1entral African Republic|1had|2ile|3na|2ristmas Island|1ocos (Keeling) Islands|2lombia|2moros|2ngo|2ok Islands|2sta Rica|1roatia|1uba|1yprus|1zech Republic|0Denmark|1jibouti|1ominica|8n Republic|0East Timor|1cuador|1gypt|1l Salvador|1ngland|1quatorial Guinea|1ritrea|1stonia|2watini|1thiopia|0Falkland Islands|2roe Islands|1iji Islands|2nland|1rance|2ench Guiana|7Polynesia|7Southern territories|0Gabon|2mbia|1eorgia|2rmany|1hana|1ibraltar|1reece|4nland|3nada|1uadeloupe|3m|3temala|2inea|6-Bissau|2yana|0Haiti|1eard Island and McDonald Islands|1oly See (Vatican City State)|2nduras|3g Kong|1ungary|0Iceland|1ndia|3onesia|1ran|3q|2eland|1srael|1taly|1vory Coast|0Jamaica|2pan|1ordan|0Kazakhstan|1enya|1iribati|1uwait|1yrgyzstan|0Laos|2tvia|1ebanon|2sotho|1iberia|3ya|2echtenstein|2thuania|1uxembourg|0Macao|2dagascar|2lawi|4ysia|3dives|3i|3ta|2rshall Islands|3tinique|2uritania|6ius|2yotte|1exico|1icronesia, Federated States of|1oldova|2naco|3golia|3tenegro|4serrat|2rocco|2zambique|1yanmar|0Namibia|2uru|1epal|2therlands|b Antilles|2w Caledonia|4Zealand|1icaragua|2ger|5ia|2ue|1orfolk Island|3th Korea|6Macedonia|5ern Ireland|9Mariana Islands|3way|0Oman|0Pakistan|2lau|3estine|2nama|2pua New Guinea|2raguay|1eru|1hilippines|1itcairn|1oland|2rtugal|1uerto Rico|0Qatar|0Reunion|1omania|1ussia|1wanda|0Saint Helena|6Kitts and Nevis|6Lucia|6Pierre and Miquelon|6Vincent and the Grenadines|2moa|2n Marino|2o Tome and Principe|2udi Arabia|1cotland|1enegal|2rbia|2ychelles|1ierra Leone|2ngapore|1lovakia|4enia|1olomon Islands|2malia|2uth Africa|6Georgia and the South Sandwich Islands|6Korea|6Sudan|1pain|1ri Lanka|1udan|2riname|1valbard and Jan Mayen|1weden|2itzerland|1yria|0Tajikistan|2nzania|1hailand|2e Democratic Republic of Congo|1ogo|2kelau|2nga|1rinidad and Tobago|1unisia|2rkey|4menistan|4s and Caicos Islands|2valu|0Uganda|1kraine|1nited Arab Emirates|7Kingdom|7States|d Minor Outlying Islands|1ruguay|1zbekistan|0Vanuatu|1enezuela|1ietnam|2rgin Islands, British|gU.S.|0Wales|3lis and Futuna|1estern Sahara|0Yemen|0Zambia|1imbabwe","sep":"|"},{"s":"29.3775|39.6484|18.96|-14.3825|42.4285|-18.0421|18.1668|-89.9999|16.997|-55.0613|38.8305|12.4117|-43.644|46.3727|38.3892|22.8527|25.7969|20.7433|13.0398|51.2564|49.4936|15.8893|6.22575|32.2466|26.7076|-22.8961|42.5461|-26.9072|-54.4624|-33.7507|-7.43803|4.00308|41.2421|9.40111|-4.46571|10.4091|1.65255|41.676|14.808|19.263|2.22051|7.44107|-55.9256|15.7754|-10.5705||-4.22587|-12.3879||-21.9442|8.03298|42.4359|19.8281|34.6333|48.5429|54.5624|10.9099|15.2017|17.5432|-9.46363|-4.99882|21.7254|13.1487||0.92086|12.3596|57.5162|-27.3171|3.40242|-52.3605|61.3949||59.8088|41.3716|2.12709|-27.6536|-49.7352|-3.97881|13.0643|41.0532|47.2758|4.73672|36.109|34.8021|59.7774|11.9869|15.8676|13.2338|13.7373|7.19355|10.9243|1.17508|18.021|-53.192||12.9824|22.1532|45.7436|63.3933|6.74714|-10.9419|25.0641|29.0694|51.4516|29.4966|36.6528|4.35707|17.7036|24.2495|29.1859||-4.67805|-11.4469|28.5246|39.1728|13.91|55.6689|33.0539|-30.669|4.35306||47.0484|53.9013|49.4466|22.1804|-25.609|-17.125|0.855222|-0.692694|10.1595|35.8062|5.58764|14.3923|14.7155|-20.5257|-13.0001|14.5329||45.4689|43.7247|41.5676|-42.7087|16.6748|27.6621|-26.8687||-28.9714|-0.552333|26.3567|50.7539||-22.698|-47.286|10.7075|11.697|4.27714|-19.1522|-29.0631|37.6733|40.8602||14.1102|57.9779|16.6458|23.7867|2.8036|31.2165|7.19791|-11.6579|-27.6087|-18.3497|4.64331||49.0064|36.9613|17.9264|24.4829|-21.3837|43.6273||-2.84068|-16.0195|17.0953|13.7048|46.786|12.584|-14.0409|43.8937|0.024766|15.6143||12.3073||-9.75387|6.92961|1.25856|47.7281|45.4218|-11.8506|-1.67487|-34.8398|-59.4793|33.1909|3.49339|36.0001||8.68472|1.83115|79.2203|55.3371|45.8257|32.3107|36.6741|-11.7457|5.61||6.10442|-9.38111|-21.4551|10.0361|30.2404|35.8154|35.1411|21.4226|-10.8012|-1.48405|44.3904|22.6333|49.9062|24.5442||-34.9808|37.1844|-20.2489|0.626311|8.55961||||-14.3146|20.7742|12.1111|-18.0795|-22.4177","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-27b9b72a","guard":[["hasAny",["abs","absolute value","afghanistan","algeria","andorra","anguilla","antigua","armenia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","bermuda","brunei","bulgaria","caicos","croatia","denmark","distance from zero","element","eritrea","finland","gambia","ghana","greenland","guadeloupe","guiana","guinea","iceland","italy","item number","jordan","kyrgyzstan","latvia","lebanon","lucia","luxembourg","macedonia","magnitude","marshall","martinique","mexico","monaco","nepal","netherlands","norway","nth","palau","philippines","poland","position","romania","shortest","shortest one","shortest word","singapore","slovenia","spain","suriname","sweden","syria","tajikistan","turkmenistan","uzbekistan"]],["words<=",9],["has","of"],["not",["has","compare"]],["not",["has","code"]],["not",["has","area"]],["not",["has","as"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}],["render.plain",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]]]],"mem":null},
{"id":"n-bfdf5019","guard":[["hasAny",["abs","absolute value","afghanistan","algeria","andorra","anguilla","armenia","azerbaijan","bahamas","bangladesh","bermuda","burkina","caicos","cape","costa","croatia","denmark","distance from zero","element","eritrea","finland","gambia","greenland","guadeloupe","guiana","guinea","iceland","item number","jordan","kyrgyzstan","latvia","lebanon","lucia","luxembourg","macedonia","magnitude","martinique","mexico","monaco","netherlands","norway","nth","palau","poland","position","singapore","slovenia","suriname","togo","uzbekistan"]],["words<=",9],["has","of"],["not",["has","compare"]],["not",["has","code"]],["not",["has","area"]],["not",["has","as"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"south"}],["render.plain",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]]]],"mem":null},
{"id":"n-8c1f92aa","guard":[["hasAny",["algeria","angola","anguilla","antigua","argentina","australia","austria","bahrain","bangladesh","barbados","british","brunei","element","eswatini","finland","futuna","gabon","ghana","guadeloupe","iceland","italy","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","philippines","poland","position","samoa","seychelles","shortest","shortest one","shortest word","slovenia","spain","sweden","syria","tajikistan","turkmenistan","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-03801d58","guard":[["hasAny",["algeria","angola","anguilla","antigua","argentina","australia","austria","bahrain","bangladesh","barbados","british","brunei","capitalise","capitalize","capitalize each word","element","eswatini","finland","futuna","gabon","ghana","guadeloupe","iceland","italy","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","philippines","poland","position","samoa","seychelles","shortest","shortest one","shortest word","slovenia","spain","sweden","syria","tajikistan","title case","turkmenistan","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-4391e76e","guard":[["hasAny",["algeria","angola","anguilla","antigua","argentina","australia","austria","bahrain","bangladesh","barbados","british","brunei","element","eswatini","finland","futuna","gabon","ghana","guadeloupe","iceland","italy","item number","jordan","kyrgyzstan","lower case","lowercase","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","philippines","poland","position","samoa","seychelles","shortest","shortest one","shortest word","slovenia","small letters","spain","sweden","syria","tajikistan","turkmenistan","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-53a127d2","guard":[["hasAny",["algeria","angola","anguilla","antigua","argentina","australia","austria","bahrain","bangladesh","barbados","british","brunei","element","eswatini","finland","futuna","gabon","ghana","guadeloupe","iceland","invert case","italy","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","philippines","poland","position","samoa","seychelles","shortest","shortest one","shortest word","slovenia","spain","swap case","sweden","syria","tajikistan","toggle case","turkmenistan","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-7661445f","guard":[["hasAny",["algeria","all caps","angola","anguilla","antigua","argentina","australia","austria","bahrain","bangladesh","barbados","british","brunei","capital letters","capitals","element","eswatini","finland","futuna","gabon","ghana","guadeloupe","iceland","italy","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","philippines","poland","position","samoa","seychelles","shortest","shortest one","shortest word","slovenia","spain","sweden","syria","tajikistan","turkmenistan","upper case","uppercase","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-98269c12","guard":[["hasAny",["algeria","angola","anguilla","antigua","argentina","australia","austria","bahrain","bangladesh","barbados","british","brunei","element","eswatini","finland","futuna","gabon","ghana","guadeloupe","iceland","italy","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","philippines","poland","position","samoa","seychelles","shortest","shortest one","shortest word","slovenia","spain","sweden","syria","tajikistan","turkmenistan","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]]],"mem":null},
{"id":"n-6835f1de","guard":[["has","south"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the south of Uzbekistan":"The south of Uzbekistan is 37.1844.","the south of Wallis and Futuna":"The south of Wallis and Futuna is -14.3146.","the south of Guadeloupe":"The south of Guadeloupe is 15.8676.","the south of Comoros":"The south of Comoros is -12.3879.","the south of Saint Lucia":"The south of Saint Lucia is 13.7048.","the south of Heard Island and McDonald Islands":"The south of Heard Island and McDonald Islands is -53.192.","the south of South Georgia and the South Sandwich Islands":"The south of South Georgia and the South Sandwich Islands is -59.4793.","the south of South Africa":"The south of South Africa is -34.8398.","the south of Cambodia":"The south of Cambodia is 10.4091.","the south of Monaco":"The south of Monaco is 43.7247.","the south of Togo":"The south of Togo is 6.10442.","the south of Falkland Islands":"The south of Falkland Islands is -52.3605.","the south of Anguilla":"The south of Anguilla is 18.1668.","the south of Turks and Caicos Islands":"The south of Turks and Caicos Islands is 21.4226.","the south of Bangladesh":"The south of Bangladesh is 20.7433.","the south of Egypt":"The south of Egypt is 21.7254.","the south of Eswatini":"The south of Eswatini is -27.3171.","the south of Mexico":"The south of Mexico is 14.5329.","the south of French Polynesia":"The south of French Polynesia is -27.6536.","the south of Greenland":"The south of Greenland is 59.7774.","the south of British Indian Ocean Territory":"The south of British Indian Ocean Territory is -7.43803.","the south of Mozambique":"The south of Mozambique is -26.8687.","the south of Luxembourg":"The south of Luxembourg is 49.4466.","the south of Iceland":"The south of Iceland is 63.3933.","the south of Norway":"The south of Norway is 57.9779.","the south of Bermuda":"The south of Bermuda is 32.2466.","the south of Gambia":"The south of Gambia is 13.0643.","the south of Azerbaijan":"The south of Azerbaijan is 38.3892.","the south of Armenia":"The south of Armenia is 38.8305.","the south of Palau":"The south of Palau is 2.8036.","the south of North Macedonia":"The south of North Macedonia is 40.8602.","the south of Albania":"The south of Albania is 39.6484.","the south of Singapore":"The south of Singapore is 1.25856.","the south of Martinique":"The south of Martinique is 14.3923."}}},
{"id":"n-b8fe67a6","guard":[["hasAny",["angola","antigua","australia","austria","bahrain","barbados","belgium","brunei","bulgaria","canada","chad","coast","element","ghana","give","italy","item number","marshall","mauritius","nepal","niue","nth","peru","philippines","position","qatar","reunion","romania","samoa","seychelles","spain","sweden","syria","tajikistan","tokelau","turkmenistan","tuvalu"]],["has","give"],["words<=",7],["has","of"],["not",["has","africa"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-0541a8f4","guard":[["hasAny",["angola","antigua","australia","austria","bahrain","barbados","belgium","brunei","bulgaria","canada","chad","class name","coast","element","ghana","give","italy","item number","marshall","mauritius","nepal","niue","nth","pascal case","pascalcase","peru","philippines","position","qatar","reunion","romania","samoa","seychelles","spain","sweden","syria","tajikistan","tokelau","turkmenistan","tuvalu","upper camel case"]],["has","give"],["words<=",7],["has","of"],["not",["has","africa"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-41c9d853","guard":[["hasAny",["angola","antigua","australia","austria","bahrain","barbados","belgium","brunei","bulgaria","canada","chad","coast","element","ghana","give","invert case","italy","item number","marshall","mauritius","nepal","niue","nth","peru","philippines","position","qatar","reunion","romania","samoa","seychelles","spain","swap case","sweden","syria","tajikistan","toggle case","tokelau","turkmenistan","tuvalu"]],["has","give"],["words<=",7],["has","of"],["not",["has","africa"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-847b2486","guard":[["hasAny",["angola","antigua","australia","austria","bahrain","barbados","belgium","brunei","bulgaria","canada","chad","coast","each word","element","ghana","give","italy","item number","marshall","mauritius","nepal","niue","nth","peru","philippines","position","qatar","reunion","romania","samoa","seychelles","spain","split into words","sweden","syria","tajikistan","tokelau","turkmenistan","tuvalu","words"]],["has","give"],["words<=",7],["has","of"],["not",["has","africa"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-e179224b","guard":[["hasAny",["angola","antigua","australia","austria","bahrain","barbados","belgium","brunei","bulgaria","canada","chad","coast","each word","element","ghana","give","italy","item number","marshall","mauritius","nepal","niue","nth","peru","philippines","position","qatar","reunion","romania","samoa","seychelles","spain","split into words","sweden","syria","tajikistan","tokelau","turkmenistan","tuvalu","words"]],["has","give"],["words<=",7],["has","of"],["not",["has","africa"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-19aefd93","guard":[["hasAny",["algeria","anguilla","argentina","bangladesh","british","burkina","caicos","costa","element","eswatini","finland","futuna","gabon","guadeloupe","iceland","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","poland","position","slovenia","togo","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-2c47de9d","guard":[["hasAny",["algeria","all caps","anguilla","argentina","bangladesh","british","burkina","caicos","capital letters","capitals","costa","element","eswatini","finland","futuna","gabon","guadeloupe","iceland","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","poland","position","slovenia","togo","upper case","uppercase","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-31e10503","guard":[["hasAny",["algeria","anguilla","argentina","bangladesh","british","burkina","caicos","capitalise","capitalize","capitalize each word","costa","element","eswatini","finland","futuna","gabon","guadeloupe","iceland","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","poland","position","slovenia","title case","togo","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-7f60e0b3","guard":[["hasAny",["algeria","anguilla","argentina","bangladesh","british","burkina","caicos","costa","element","eswatini","finland","futuna","gabon","guadeloupe","iceland","item number","jordan","kyrgyzstan","lower case","lowercase","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","poland","position","slovenia","small letters","togo","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-96629fb5","guard":[["hasAny",["algeria","anguilla","argentina","bangladesh","british","burkina","caicos","costa","element","eswatini","finland","futuna","gabon","guadeloupe","iceland","invert case","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","poland","position","slovenia","swap case","toggle case","togo","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-7ef3c3fe","guard":[["hasAny",["algeria","anguilla","argentina","bangladesh","british","burkina","caicos","costa","element","eswatini","finland","futuna","gabon","guadeloupe","iceland","item number","jordan","kyrgyzstan","luxembourg","macedonia","mexico","montenegro","mozambique","netherlands","nth","poland","position","slovenia","togo","uzbekistan","zimbabwe"]],["has","of"],["not",["has","compare"]],["not",["has","add"]],["words<=",12],["not",["has","code"]],["not",["has","area"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"south"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]]],"mem":null},
{"id":"n-ed97a7fd","guard":[["hasAny",["cape","chad","costa","east","element","gabon","ghana","italy","item number","longest","longest one","longest word","lucia","nepal","niue","nth","palau","peru","position","samoa","spain","syria","togo"]],["words<=",7],["has","the"],["not",["has","and"]],["not",["has","continent"]],["not",["has","currency"]],["not",["has","density"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-532ccafa","guard":[["hasAny",["cape","chad","costa","east","element","gabon","ghana","italy","item number","longest","longest one","longest word","lower case","lowercase","lucia","nepal","niue","nth","palau","peru","position","samoa","small letters","spain","syria","togo"]],["words<=",7],["has","the"],["not",["has","and"]],["not",["has","continent"]],["not",["has","currency"]],["not",["has","density"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-9034e9cb","guard":[["hasAny",["all caps","cape","capital letters","capitals","chad","costa","east","element","gabon","ghana","italy","item number","longest","longest one","longest word","lucia","nepal","niue","nth","palau","peru","position","samoa","spain","syria","togo","upper case","uppercase"]],["words<=",7],["has","the"],["not",["has","and"]],["not",["has","continent"]],["not",["has","currency"]],["not",["has","density"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-9342994a","guard":[["hasAny",["cape","chad","costa","east","element","gabon","ghana","invert case","italy","item number","longest","longest one","longest word","lucia","nepal","niue","nth","palau","peru","position","samoa","spain","swap case","syria","toggle case","togo"]],["words<=",7],["has","the"],["not",["has","and"]],["not",["has","continent"]],["not",["has","currency"]],["not",["has","density"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-f07cd58b","guard":[["hasAny",["cape","capitalise","capitalize","capitalize each word","chad","costa","east","element","gabon","ghana","italy","item number","longest","longest one","longest word","lucia","nepal","niue","nth","palau","peru","position","samoa","spain","syria","title case","togo"]],["words<=",7],["has","the"],["not",["has","and"]],["not",["has","continent"]],["not",["has","currency"]],["not",["has","density"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"south"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-78524eaa","guard":[["hasAny",["cape","chad","costa","east","element","gabon","ghana","italy","item number","longest","longest one","longest word","lucia","nepal","niue","nth","palau","peru","position","samoa","spain","syria","togo"]],["words<=",7],["has","the"],["not",["has","and"]],["not",["has","continent"]],["not",["has","currency"]],["not",["has","density"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]]],"mem":null},
{"id":"n-6536c768","guard":[["hasAny",["abs","absolute value","cape","chad","costa","distance from zero","element","ghana","italy","item number","longest","longest one","longest word","lucia","magnitude","nepal","nth","palau","position","spain","syria","togo"]],["words<=",7],["has","the"],["not",["has","and"]],["not",["has","continent"]],["not",["has","currency"]],["not",["has","density"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}],["render.plain",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]]]],"mem":null},
{"id":"n-c9890ba7","guard":[["hasAny",["algeria","element","item number","nth","position"]],["has","south"],["has","tell"]],"pyramid":["render.money",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]],"mem":null},
{"id":"n-00dad43a","guard":[["hasAny",["algeria","element","item number","nth","position"]],["has","south"],["has","tell"]],"pyramid":["render.decimals",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],{"lit":2}],"mem":null},
{"id":"n-04691a62","guard":[["hasAny",["algeria","element","item number","negate","negative","nth","opposite","position"]],["has","south"],["has","tell"]],"pyramid":["render.money",["transform.neg",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]]],"mem":null},
{"id":"n-5a6dea25","guard":[["hasAny",["abs","absolute value","algeria","distance from zero","element","item number","magnitude","nth","position"]],["has","south"],["has","tell"]],"pyramid":["render.money",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]]],"mem":null},
{"id":"n-00181fb8","guard":[["hasAny",["element","guadeloupe","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Guadeloupe is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-0100efc8","guard":[["hasAny",["element","item number","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mozambique is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-0370101e","guard":[["hasAny",["cambodia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Cambodia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-041aed5d","guard":[["hasAny",["element","item number","nth","philippines","position","shortest","shortest one","shortest word"]],["has","south"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Philippines is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-049492e0","guard":[["hasAny",["costa","element","item number","longest","longest one","longest word","nth","position"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Costa Rica is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-055b9faa","guard":[["hasAny",["element","heard","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Heard Island and McDonald Islands is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-07b52baa","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","uzbekistan"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Uzbekistan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-0b3a5fbd","guard":[["hasAny",["east","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of East Timor is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-0c46ac32","guard":[["hasAny",["element","item number","nth","position","sandwich","shortest","shortest one","shortest word"]],["has","what"],["words<=",12]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of South Georgia and the South Sandwich Islands is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-10dc8b49","guard":[["hasAny",["algeria","element","item number","negate","negative","nth","opposite","position"]],["has","south"],["has","tell"]],"pyramid":["render.decimals",["transform.neg",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]],{"lit":2}],"mem":null},
{"id":"n-1bd00ce6","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","peru","position"]],["has","south"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Peru is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-1dc13815","guard":[["hasAny",["angola","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Angola is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-1e877d98","guard":[["hasAny",["element","helena","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Saint Helena is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-20fdc21b","guard":[["hasAny",["albania","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Albania is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-251875f3","guard":[["hasAny",["element","item number","nth","position","romania","shortest","shortest one","shortest word"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Romania is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-28d04d72","guard":[["hasAny",["azerbaijan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Azerbaijan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-2a5ec236","guard":[["hasAny",["argentina","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Argentina is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-2fb3228f","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","turkmenistan"]],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Turkmenistan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-2fccfab0","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","palau","position"]],["has","south"],["has","what"],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Palau is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-3397616f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","samoa"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Samoa is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-348c2118","guard":[["hasAny",["bulgaria","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bulgaria is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-3924079a","guard":[["hasAny",["comoros","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["words<=",6],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Comoros is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-3df21ed5","guard":[["hasAny",["algeria","decimal places","element","item number","nth","position","round to","rounded to"]],["has","south"],["has","tell"]],"pyramid":["render.money",["transform.roundTo",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],{"lit":3}]],"mem":null},
{"id":"n-3eb83233","guard":[["hasAny",["element","equatorial","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Equatorial Guinea is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-3f05f47c","guard":[["hasAny",["element","item number","marshall","nth","position","shortest","shortest one","shortest word"]],["words<=",6],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Marshall Islands is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-42d7b50b","guard":[["hasAny",["element","item number","monaco","nth","position","shortest","shortest one","shortest word"]],["has","south"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Monaco is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-444123df","guard":[["hasAny",["cape","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Cape Verde is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-45af7430","guard":[["hasAny",["element","item number","mexico","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mexico is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-468e08a9","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","qatar"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Qatar is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-48f06073","guard":[["hasAny",["element","falkland","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Falkland Islands is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-491c0b3f","guard":[["hasAny",["egypt","element","item number","longest","longest one","longest word","nth","position"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Egypt is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-5067b744","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","sweden"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Sweden is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-520ac98b","guard":[["hasAny",["element","iceland","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Iceland is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-555c1b1c","guard":[["hasAny",["austria","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Austria is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-647b1d04","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","singapore"]],["has","south"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Singapore is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-6762723c","guard":[["hasAny",["canada","element","item number","nth","position","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Canada is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-6c5c45a9","guard":[["hasAny",["bangladesh","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bangladesh is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-70a005c5","guard":[["hasAny",["belgium","element","item number","nth","position","shortest","shortest one","shortest word"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Belgium is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-738eaab8","guard":[["hasAny",["element","item number","longest","longest one","longest word","lucia","nth","position"]],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Saint Lucia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-74bcc35e","guard":[["hasAny",["element","item number","lesotho","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lesotho is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-753b672a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","togo"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Togo is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-76a8072d","guard":[["hasAny",["barbados","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Barbados is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-77537d04","guard":[["hasAny",["bahrain","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bahrain is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-78a48c3b","guard":[["hasAny",["element","guiana","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of French Guiana is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-78f70714","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","suriname"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Suriname is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-7c22f37b","guard":[["hasAny",["element","item number","jordan","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Jordan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-7ff9f7b5","guard":[["hasAny",["coast","element","item number","longest","longest one","longest word","nth","position"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Ivory Coast is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-8174bb76","guard":[["hasAny",["element","item number","nth","poland","position","shortest","shortest one","shortest word"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Poland is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-85d29af0","guard":[["hasAny",["british","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of British Indian Ocean Territory is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-86002593","guard":[["hasAny",["element","item number","luxembourg","nth","position","shortest","shortest one","shortest word"]],["has","south"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Luxembourg is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-8782ec3f","guard":[["hasAny",["bahamas","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bahamas is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-8a2aa3a9","guard":[["hasAny",["bosnia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bosnia and Herzegovina is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-8c6e8cd9","guard":[["hasAny",["element","gabon","item number","longest","longest one","longest word","nth","position"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Gabon is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-8f89e474","guard":[["hasAny",["element","item number","mauritius","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mauritius is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-90668d81","guard":[["hasAny",["caicos","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Turks and Caicos Islands is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-906c6088","guard":[["hasAny",["element","item number","macedonia","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of North Macedonia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-90e2615f","guard":[["hasAny",["denmark","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Denmark is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-916a9e78","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tajikistan"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tajikistan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-942cb6c9","guard":[["hasAny",["croatia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Croatia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-9481c03b","guard":[["hasAny",["element","item number","martinique","nth","position","shortest","shortest one","shortest word"]],["has","south"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Martinique is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-94bee730","guard":[["hasAny",["element","item number","netherlands","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Netherlands is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-979444ef","guard":[["hasAny",["element","eritrea","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Eritrea is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-994651d4","guard":[["hasAny",["element","item number","latvia","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Latvia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-9da59f0a","guard":[["hasAny",["abs","absolute value","algeria","distance from zero","element","item number","magnitude","nth","position"]],["has","south"],["has","tell"]],"pyramid":["render.decimals",["transform.abs",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]]],{"lit":2}],"mem":null},
{"id":"n-9daac1a4","guard":[["hasAny",["anguilla","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Anguilla is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-a1c1be92","guard":[["hasAny",["element","item number","longest","longest one","longest word","nepal","nth","position"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Nepal is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-a32441a7","guard":[["hasAny",["element","item number","nth","polynesia","position","shortest","shortest one","shortest word"]],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of French Polynesia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-a38a29a4","guard":[["hasAny",["element","item number","longest","longest one","longest word","niue","nth","position"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Niue is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-b29df4e0","guard":[["hasAny",["brunei","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Brunei is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-b68ddeca","guard":[["hasAny",["element","gambia","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Gambia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-b8af6b3c","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","slovenia"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Slovenia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-b8b8ccbb","guard":[["hasAny",["christmas","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Christmas Island is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-bbae61fd","guard":[["hasAny",["element","item number","norway","nth","position","shortest","shortest one","shortest word"]],["has","south"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Norway is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-c4f7c05d","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tuvalu"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tuvalu is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-c625b6a5","guard":[["hasAny",["element","item number","nth","position","reunion","shortest","shortest one","shortest word"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Reunion is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-cb02d64a","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","zimbabwe"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Zimbabwe is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-cbd3b98e","guard":[["hasAny",["afghanistan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Afghanistan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-cedb5d49","guard":[["hasAny",["element","item number","lebanon","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lebanon is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-cff7a4fb","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","spain"]],["words<=",5],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Spain is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-d30316b9","guard":[["hasAny",["australia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Australia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-d349bccc","guard":[["hasAny",["algeria","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","south"],["has","tell"]],"pyramid":["render.money",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],{"lit":1000}]],"mem":null},
{"id":"n-d5c8c208","guard":[["hasAny",["element","ghana","item number","longest","longest one","longest word","nth","position"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Ghana is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-d685ddf7","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","syria"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Syria is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-d80f95d3","guard":[["hasAny",["element","item number","nth","position","seychelles","shortest","shortest one","shortest word"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Seychelles is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-d9054611","guard":[["hasAny",["element","eswatini","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Eswatini is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-db95d218","guard":[["hasAny",["andorra","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Andorra is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-dbb1b1a6","guard":[["hasAny",["element","italy","item number","longest","longest one","longest word","nth","position"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Italy is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-dc4b9ee4","guard":[["hasAny",["element","item number","montenegro","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Montenegro is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-e250c36a","guard":[["hasAny",["bermuda","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","is"],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bermuda is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-e3f8aa84","guard":[["hasAny",["element","item number","kyrgyzstan","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Kyrgyzstan is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-e4796ac3","guard":[["hasAny",["algeria","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Algeria is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-e4be773a","guard":[["hasAny",["antigua","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Antigua and Barbuda is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-e4c31b64","guard":[["hasAny",["algeria","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","south"],["has","tell"]],"pyramid":["render.money",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],{"lit":100}]],"mem":null},
{"id":"n-ec482d38","guard":[["hasAny",["chad","element","item number","longest","longest one","longest word","nth","position"]],["has","give"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Chad is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-ee756a29","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tokelau"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tokelau is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-f0eec230","guard":[["hasAny",["armenia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Armenia is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-f1fb47a5","guard":[["hasAny",["element","futuna","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Wallis and Futuna is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-f4579420","guard":[["hasAny",["element","item number","korea","longest","longest one","longest word","nth","position"]],["has","tell"],["has","south"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of South Korea is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-f78dc324","guard":[["hasAny",["element","finland","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Finland is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-f8b71809","guard":[["hasAny",["element","greenland","item number","nth","position","shortest","shortest one","shortest word"]],["has","south"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Greenland is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-22bf9507","guard":[["hasAny",["element","item number","nth","position","principe"]],["has","south"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Sao Tome and Principe is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-280e90c5","guard":[["hasAny",["burkina","element","item number","nth","position"]],["has","tell"],["has","south"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Burkina Faso is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-3217a70f","guard":[["hasAny",["algeria","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","south"],["has","tell"]],"pyramid":["render.decimals",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],{"lit":100}],{"lit":2}],"mem":null},
{"id":"n-7009450b","guard":[["hasAny",["algeria","element","item number","left over","mod","modulo","nth","position","remainder"]],["has","south"],["has","tell"]],"pyramid":["render.decimals",["transform.mod",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],{"lit":1000}],{"lit":2}],"mem":null},
{"id":"n-7f3591e1","guard":[["hasAny",["algeria","decimal places","element","item number","nth","position","round to","rounded to"]],["has","south"],["has","tell"]],"pyramid":["render.decimals",["transform.roundTo",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],{"lit":3}],{"lit":2}],"mem":null},
{"id":"n-ea757df7","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","what"],["words<=",12],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-ed888aa5","guard":[["hasAny",["element","georgia","item number","nth","position"]],["has","what"],["words<=",12],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"south"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"}],{"lit":1}],{"lit":"fr-country-json-country-by-geo-coordinates-bfc6f9"},{"lit":"country"},{"lit":"south"}]],"mem":null},
{"id":"n-0025c043","guard":[["hasAny",["principe","sao","south","tome"]],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Sao Tome and Principe":"The south of Sao Tome and Principe is 0.024766."}}},
{"id":"n-01545f54","guard":[["hasAny",["netherlands","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Netherlands":"The south of Netherlands is 50.7539."}}},
{"id":"n-0158bbce","guard":[["hasAny",["south","uzbekistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Uzbekistan":"The south of Uzbekistan is 37.1844."}}},
{"id":"n-0403dfb9","guard":[["hasAny",["norway","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Norway":"The south of Norway is 57.9779."}}},
{"id":"n-0559a1c2","guard":[["hasAny",["kyrgyzstan","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Kyrgyzstan":"The south of Kyrgyzstan is 39.1728."}}},
{"id":"n-095b92cd","guard":[["hasAny",["christmas","island","south"]],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Christmas Island":"The south of Christmas Island is -10.5705."}}},
{"id":"n-0b86bd7e","guard":[["hasAny",["equatorial","guinea","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Equatorial Guinea":"The south of Equatorial Guinea is 0.92086."}}},
{"id":"n-0ce91ab3","guard":[["hasAny",["slovenia","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Slovenia":"The south of Slovenia is 45.4218."}}},
{"id":"n-0ec4f801","guard":[["hasAny",["costa","rica","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Costa Rica":"The south of Costa Rica is 8.03298."}}},
{"id":"n-0f52884e","guard":[["hasAny",["austria","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Austria":"The south of Austria is 46.3727."}}},
{"id":"n-101702c1","guard":[["hasAny",["french","guiana","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of French Guiana":"The south of French Guiana is 2.12709."}}},
{"id":"n-102ef34c","guard":[["hasAny",["luxembourg","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Luxembourg":"The south of Luxembourg is 49.4466."}}},
{"id":"n-118d7c2e","guard":[["hasAny",["comoros","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Comoros":"The south of Comoros is -12.3879."}}},
{"id":"n-1865e799","guard":[["hasAny",["canada","south"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Canada":"The south of Canada is 41.676."}}},
{"id":"n-1a1262be","guard":[["hasAny",["barbados","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Barbados":"The south of Barbados is 13.0398."}}},
{"id":"n-1a6d3796","guard":[["hasAny",["eswatini","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Eswatini":"The south of Eswatini is -27.3171."}}},
{"id":"n-1aca0a75","guard":[["hasAny",["bermuda","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Bermuda":"The south of Bermuda is 32.2466."}}},
{"id":"n-1dd44375","guard":[["hasAny",["bosnia","herzegovina","south"]],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Bosnia and Herzegovina":"The south of Bosnia and Herzegovina is 42.5461."}}},
{"id":"n-21fc5790","guard":[["hasAny",["falkland","islands","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Falkland Islands":"The south of Falkland Islands is -52.3605."}}},
{"id":"n-24c27e39","guard":[["hasAny",["ghana","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Ghana":"The south of Ghana is 4.73672."}}},
{"id":"n-24ec972d","guard":[["hasAny",["cambodia","south"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Cambodia":"The south of Cambodia is 10.4091."}}},
{"id":"n-2c1ae42c","guard":[["hasAny",["poland","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Poland":"The south of Poland is 49.0064."}}},
{"id":"n-383cc69b","guard":[["hasAny",["denmark","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Denmark":"The south of Denmark is 54.5624."}}},
{"id":"n-3b381874","guard":[["hasAny",["peru","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Peru":"The south of Peru is -18.3497."}}},
{"id":"n-3cbc7ca0","guard":[["hasAny",["belgium","south"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Belgium":"The south of Belgium is 49.4936."}}},
{"id":"n-3e5786ff","guard":[["hasAny",["burkina","faso","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Burkina Faso":"The south of Burkina Faso is 9.40111."}}},
{"id":"n-436852de","guard":[["hasAny",["lesotho","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Lesotho":"The south of Lesotho is -30.669."}}},
{"id":"n-4678f4c6","guard":[["hasAny",["monaco","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Monaco":"The south of Monaco is 43.7247."}}},
{"id":"n-4bc68241","guard":[["hasAny",["gambia","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Gambia":"The south of Gambia is 13.0643."}}},
{"id":"n-5136e777","guard":[["hasAny",["egypt","south"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Egypt":"The south of Egypt is 21.7254."}}},
{"id":"n-514464ff","guard":[["hasAny",["qatar","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Qatar":"The south of Qatar is 24.4829."}}},
{"id":"n-5319a124","guard":[["hasAny",["mauritius","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Mauritius":"The south of Mauritius is -20.5257."}}},
{"id":"n-555ff91b","guard":[["hasAny",["angola","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Angola":"The south of Angola is -18.0421."}}},
{"id":"n-577e0df7","guard":[["hasAny",["french","polynesia","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of French Polynesia":"The south of French Polynesia is -27.6536."}}},
{"id":"n-58c5269f","guard":[["hasAny",["chad","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Chad":"The south of Chad is 7.44107."}}},
{"id":"n-5da0e271","guard":[["hasAny",["australia","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Australia":"The south of Australia is -43.644."}}},
{"id":"n-5f2e59b4","guard":[["hasAny",["armenia","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Armenia":"The south of Armenia is 38.8305."}}},
{"id":"n-5f5731b2","guard":[["hasAny",["mozambique","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Mozambique":"The south of Mozambique is -26.8687."}}},
{"id":"n-6051f7d8","guard":[["hasAny",["macedonia","north","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of North Macedonia":"The south of North Macedonia is 40.8602."}}},
{"id":"n-6587438a","guard":[["hasAny",["azerbaijan","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Azerbaijan":"The south of Azerbaijan is 38.3892."}}},
{"id":"n-685ad61d","guard":[["hasAny",["anguilla","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Anguilla":"The south of Anguilla is 18.1668."}}},
{"id":"n-69ba79ea","guard":[["hasAny",["montenegro","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Montenegro":"The south of Montenegro is -42.7087."}}},
{"id":"n-69ea98d9","guard":[["hasAny",["futuna","south","wallis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Wallis and Futuna":"The south of Wallis and Futuna is -14.3146."}}},
{"id":"n-7062f9ee","guard":[["hasAny",["africa","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of South Africa":"The south of South Africa is -34.8398."}}},
{"id":"n-74f042b3","guard":[["hasAny",["philippines","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Philippines":"The south of Philippines is 4.64331."}}},
{"id":"n-76172eaf","guard":[["hasAny",["guinea","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Guinea":"The south of Guinea is 7.19355."}}},
{"id":"n-7aa43d3a","guard":[["hasAny",["south","syria"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Syria":"The south of Syria is 32.3107."}}},
{"id":"n-7ab7ffe4","guard":[["hasAny",["south","togo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Togo":"The south of Togo is 6.10442."}}},
{"id":"n-7c549480","guard":[["hasAny",["romania","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Romania":"The south of Romania is 43.6273."}}},
{"id":"n-810ddf0e","guard":[["hasAny",["south","tajikistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Tajikistan":"The south of Tajikistan is 36.6741."}}},
{"id":"n-812d24ea","guard":[["hasAny",["argentina","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Argentina":"The south of Argentina is -55.0613."}}},
{"id":"n-818630b4","guard":[["hasAny",["latvia","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Latvia":"The south of Latvia is 55.6689."}}},
{"id":"n-83b10023","guard":[["hasAny",["islands","marshall","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Marshall Islands":"The south of Marshall Islands is 5.58764."}}},
{"id":"n-84e52ace","guard":[["hasAny",["palau","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Palau":"The south of Palau is 2.8036."}}},
{"id":"n-85482e4b","guard":[["hasAny",["jordan","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Jordan":"The south of Jordan is 29.1859."}}},
{"id":"n-85739a1d","guard":[["hasAny",["afghanistan","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Afghanistan":"The south of Afghanistan is 29.3775."}}},
{"id":"n-85c7d940","guard":[["hasAny",["georgia","islands","sandwich","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of South Georgia and the South Sandwich Islands":"The south of South Georgia and the South Sandwich Islands is -59.4793."}}},
{"id":"n-87838adc","guard":[["hasAny",["georgia","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Georgia":"The south of Georgia is 41.0532."}}},
{"id":"n-87e36f62","guard":[["hasAny",["heard","island","islands","mcdonald","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Heard Island and McDonald Islands":"The south of Heard Island and McDonald Islands is -53.192."}}},
{"id":"n-8b1442fb","guard":[["hasAny",["lucia","saint","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Saint Lucia":"The south of Saint Lucia is 13.7048."}}},
{"id":"n-8b2447de","guard":[["hasAny",["gabon","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Gabon":"The south of Gabon is -3.97881."}}},
{"id":"n-8b265159","guard":[["hasAny",["lebanon","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Lebanon":"The south of Lebanon is 33.0539."}}},
{"id":"n-8f34a912","guard":[["hasAny",["bulgaria","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Bulgaria":"The south of Bulgaria is 41.2421."}}},
{"id":"n-9096980a","guard":[["hasAny",["mexico","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Mexico":"The south of Mexico is 14.5329."}}},
{"id":"n-91b0d2dc","guard":[["hasAny",["british","indian","ocean","south","territory"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of British Indian Ocean Territory":"The south of British Indian Ocean Territory is -7.43803."}}},
{"id":"n-94d6b8bf","guard":[["hasAny",["bahamas","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Bahamas":"The south of Bahamas is 22.8527."}}},
{"id":"n-97597664","guard":[["hasAny",["south","turkmenistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Turkmenistan":"The south of Turkmenistan is 35.1411."}}},
{"id":"n-995a599e","guard":[["hasAny",["finland","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Finland":"The south of Finland is 59.8088."}}},
{"id":"n-9dd23273","guard":[["hasAny",["eritrea","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Eritrea":"The south of Eritrea is 12.3596."}}},
{"id":"n-9e69bb7c","guard":[["hasAny",["italy","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Italy":"The south of Italy is 36.6528."}}},
{"id":"n-9f83a2fc","guard":[["hasAny",["greenland","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Greenland":"The south of Greenland is 59.7774."}}},
{"id":"n-a56057a0","guard":[["hasAny",["samoa","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Samoa":"The south of Samoa is -14.0409."}}},
{"id":"n-acf7155e","guard":[["hasAny",["brunei","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Brunei":"The south of Brunei is 4.00308."}}},
{"id":"n-af254d01","guard":[["hasAny",["south","spain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Spain":"The south of Spain is 36.0001."}}},
{"id":"n-b158e84d","guard":[["hasAny",["coast","ivory","south"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Ivory Coast":"The south of Ivory Coast is 4.35707."}}},
{"id":"n-b60bc11b","guard":[["hasAny",["niue","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Niue":"The south of Niue is -19.1522."}}},
{"id":"n-ba00b6ff","guard":[["hasAny",["south","sweden"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Sweden":"The south of Sweden is 55.3371."}}},
{"id":"n-bed5557a","guard":[["hasAny",["martinique","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Martinique":"The south of Martinique is 14.3923."}}},
{"id":"n-c034bce1","guard":[["hasAny",["cape","south","verde"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Cape Verde":"The south of Cape Verde is 14.808."}}},
{"id":"n-c6aaa781","guard":[["hasAny",["iceland","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Iceland":"The south of Iceland is 63.3933."}}},
{"id":"n-c83581fa","guard":[["hasAny",["helena","saint","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Saint Helena":"The south of Saint Helena is -16.0195."}}},
{"id":"n-c9e4814b","guard":[["hasAny",["south","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Suriname":"The south of Suriname is 1.83115."}}},
{"id":"n-d08155e7","guard":[["hasAny",["south","zimbabwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Zimbabwe":"The south of Zimbabwe is -22.4177."}}},
{"id":"n-d7498dee","guard":[["hasAny",["guadeloupe","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Guadeloupe":"The south of Guadeloupe is 15.8676."}}},
{"id":"n-d81c68e8","guard":[["hasAny",["east","south","timor"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of East Timor":"The south of East Timor is -9.46363."}}},
{"id":"n-d861f9f8","guard":[["hasAny",["antigua","barbuda","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Antigua and Barbuda":"The south of Antigua and Barbuda is 16.997."}}},
{"id":"n-db6e683a","guard":[["hasAny",["south","tokelau"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Tokelau":"The south of Tokelau is -9.38111."}}},
{"id":"n-dd36f723","guard":[["hasAny",["south","tuvalu"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Tuvalu":"The south of Tuvalu is -10.8012."}}},
{"id":"n-e0aa81cd","guard":[["hasAny",["bahrain","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Bahrain":"The south of Bahrain is 25.7969."}}},
{"id":"n-e25eee0f","guard":[["hasAny",["andorra","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Andorra":"The south of Andorra is 42.4285."}}},
{"id":"n-e60a951e","guard":[["hasAny",["reunion","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Reunion":"The south of Reunion is -21.3837."}}},
{"id":"n-e834b86b","guard":[["hasAny",["caicos","islands","south","turks"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Turks and Caicos Islands":"The south of Turks and Caicos Islands is 21.4226."}}},
{"id":"n-ed3e5340","guard":[["hasAny",["seychelles","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Seychelles":"The south of Seychelles is -9.75387."}}},
{"id":"n-f310492d","guard":[["hasAny",["singapore","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Singapore":"The south of Singapore is 1.25856."}}},
{"id":"n-f5975d4b","guard":[["hasAny",["korea","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of South Korea":"The south of South Korea is 33.1909."}}},
{"id":"n-f5b137cf","guard":[["hasAny",["albania","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Albania":"The south of Albania is 39.6484."}}},
{"id":"n-fa25867f","guard":[["hasAny",["algeria","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Algeria":"The south of Algeria is 18.96."}}},
{"id":"n-fafce2bc","guard":[["hasAny",["bangladesh","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the south of Bangladesh":"The south of Bangladesh is 20.7433."}}},
{"id":"n-fcadf25f","guard":[["hasAny",["nepal","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the south of Nepal":"The south of Nepal is 26.3567."}}},
{"id":"n-fec8fd8b","guard":[["hasAny",["croatia","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the south of Croatia":"The south of Croatia is 42.4359."}}},
{"id":"n-9944356f","guard":[["hasAny",["algeria","cubed","increase by","markup","plus tax","raise by","to the third power","with tax"]],["has","south"],["has","tell"]],"pyramid":["render.money",["compute.increase",["sense.wordCount"],["transform.cube",["sense.wordCount"]]]],"mem":null},
{"id":"n-075099ef","guard":[["hasAny",["shortest","shortest one","shortest word","tuvalu"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -10.8012."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-0ede9a0f","guard":[["hasAny",["azerbaijan","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 38.3892."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-0f0fc30f","guard":[["hasAny",["greenland","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59.7774."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-0f18a0bc","guard":[["hasAny",["shortest","shortest one","shortest word","tajikistan"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 36.6741."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-104a57b2","guard":[["hasAny",["afghanistan","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 29.3775."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-106c6b46","guard":[["hasAny",["denmark","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 54.5624."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-115a731d","guard":[["hasAny",["mexico","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 14.5329."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-11aeff42","guard":[["hasAny",["antigua","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 16.997."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-1248e5f1","guard":[["hasAny",["netherlands","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 50.7539."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-125fd791","guard":[["hasAny",["shortest","shortest one","shortest word","turkmenistan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 35.1411."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-139ab4bc","guard":[["hasAny",["chad","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 7.44107."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-163c29bd","guard":[["hasAny",["longest","longest one","longest word","spain"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 36.0001."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-1696be07","guard":[["hasAny",["norway","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 57.9779."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-1881cd39","guard":[["hasAny",["iceland","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63.3933."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-1a6c5402","guard":[["hasAny",["angola","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -18.0421."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-21ef1281","guard":[["hasAny",["cape","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 14.808."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-238f4aae","guard":[["hasAny",["albania","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 39.6484."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-247d3af6","guard":[["hasAny",["equatorial","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 0.92086."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-2f0b4021","guard":[["hasAny",["lebanon","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 33.0539."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-3499f663","guard":[["hasAny",["finland","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59.8088."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-36c29f0a","guard":[["hasAny",["ghana","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 4.73672."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-37b02cb4","guard":[["hasAny",["longest","longest one","longest word","nepal"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 26.3567."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-3da95130","guard":[["hasAny",["jordan","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 29.1859."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-3e404b9b","guard":[["hasAny",["christmas","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -10.5705."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-41402dff","guard":[["hasAny",["algeria","cubed","increase by","markup","plus tax","raise by","to the third power","with tax"]],["has","south"],["has","tell"]],"pyramid":["render.decimals",["compute.increase",["sense.wordCount"],["transform.cube",["sense.wordCount"]]],{"lit":2}],"mem":null},
{"id":"n-423a1096","guard":[["hasAny",["bahamas","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 22.8527."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-42e24ae3","guard":[["hasAny",["mozambique","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -26.8687."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-462cf76c","guard":[["hasAny",["longest","longest one","longest word","palau"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2.8036."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-4a8a0d1b","guard":[["hasAny",["helena","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -16.0195."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-4d698cc6","guard":[["hasAny",["kyrgyzstan","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 39.1728."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-4e7facf4","guard":[["hasAny",["guadeloupe","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 15.8676."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-4f118a51","guard":[["hasAny",["algeria","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 18.96."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-5768ef08","guard":[["hasAny",["east","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -9.46363."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-5944d4a9","guard":[["hasAny",["montenegro","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -42.7087."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-5a2bf190","guard":[["hasAny",["italy","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 36.6528."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-5ae7d5b9","guard":[["hasAny",["gambia","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 13.0643."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-5d8a26c0","guard":[["hasAny",["marshall","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 5.58764."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-5f2f209c","guard":[["hasAny",["seychelles","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -9.75387."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-63a66f0e","guard":[["hasAny",["coast","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 4.35707."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-63cb3101","guard":[["hasAny",["caicos","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 21.4226."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-656a863f","guard":[["hasAny",["belgium","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49.4936."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-67f0e842","guard":[["hasAny",["longest","longest one","longest word","qatar"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 24.4829."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-692a77d1","guard":[["hasAny",["shortest","shortest one","shortest word","slovenia"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45.4218."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-6a0a2855","guard":[["hasAny",["longest","longest one","longest word","niue"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -19.1522."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-6ac88043","guard":[["hasAny",["eritrea","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 12.3596."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-7008b166","guard":[["hasAny",["costa","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 8.03298."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-7041aa9b","guard":[["hasAny",["barbados","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 13.0398."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-73c99150","guard":[["hasAny",["bulgaria","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41.2421."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-74b17a4f","guard":[["hasAny",["sandwich","shortest","shortest one","shortest word"]],["has","what"],["words<=",12]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -59.4793."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-7cb26d7e","guard":[["hasAny",["mauritius","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -20.5257."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-819575ec","guard":[["hasAny",["bahrain","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 25.7969."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-81d6a6e0","guard":[["hasAny",["gabon","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -3.97881."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-85e21eb9","guard":[["hasAny",["korea","longest","longest one","longest word"]],["has","tell"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 33.1909."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-8843bc3b","guard":[["hasAny",["longest","longest one","longest word","lucia"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 13.7048."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-88629ba8","guard":[["hasAny",["canada","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41.676."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-8ad47146","guard":[["hasAny",["romania","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43.6273."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-8cbc6a18","guard":[["hasAny",["shortest","shortest one","shortest word","zimbabwe"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -22.4177."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-933c53f2","guard":[["hasAny",["bangladesh","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 20.7433."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-941ecf2d","guard":[["hasAny",["guiana","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 2.12709."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-9892cc6f","guard":[["hasAny",["shortest","shortest one","shortest word","uzbekistan"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 37.1844."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-98c1172f","guard":[["hasAny",["latvia","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55.6689."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-a1c47d2c","guard":[["hasAny",["longest","longest one","longest word","peru"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -18.3497."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-a379a6cf","guard":[["hasAny",["armenia","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 38.8305."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-a5060165","guard":[["hasAny",["longest","longest one","longest word","syria"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 32.3107."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-a6feea7e","guard":[["hasAny",["martinique","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 14.3923."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-a7d12d67","guard":[["hasAny",["brunei","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 4.00308."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-aaf05d6d","guard":[["hasAny",["poland","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49.0064."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-adbfda85","guard":[["hasAny",["austria","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46.3727."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-afd55385","guard":[["hasAny",["bermuda","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 32.2466."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-afded1ff","guard":[["hasAny",["argentina","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -55.0613."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-b2bd6f74","guard":[["hasAny",["shortest","shortest one","shortest word","singapore"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 1.25856."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-b2f48d5d","guard":[["hasAny",["shortest","shortest one","shortest word","tokelau"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -9.38111."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-ba168294","guard":[["hasAny",["lesotho","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -30.669."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-bd044d57","guard":[["hasAny",["shortest","shortest one","shortest word","sweden"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55.3371."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-c35260c1","guard":[["hasAny",["longest","longest one","longest word","samoa"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -14.0409."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-ca160695","guard":[["hasAny",["monaco","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43.7247."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-cc0a0a23","guard":[["hasAny",["longest","longest one","longest word","togo"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 6.10442."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-cdd0188b","guard":[["hasAny",["shortest","shortest one","shortest word","suriname"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 1.83115."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-cfd4363b","guard":[["hasAny",["polynesia","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -27.6536."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-d0aa1feb","guard":[["hasAny",["reunion","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -21.3837."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-d30b2773","guard":[["hasAny",["bosnia","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42.5461."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-d694b450","guard":[["hasAny",["anguilla","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 18.1668."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-d8861400","guard":[["hasAny",["australia","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -43.644."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-d8b5de73","guard":[["hasAny",["croatia","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42.4359."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-dc5394b6","guard":[["hasAny",["futuna","shortest","shortest one","shortest word"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -14.3146."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-dd2db66c","guard":[["hasAny",["eswatini","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -27.3171."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-e39d6fc3","guard":[["hasAny",["macedonia","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 40.8602."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-e582ef1b","guard":[["hasAny",["falkland","shortest","shortest one","shortest word"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -52.3605."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-e70feb6b","guard":[["hasAny",["luxembourg","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49.4466."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-e74fc018","guard":[["hasAny",["british","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -7.43803."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-edb972a1","guard":[["hasAny",["philippines","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 4.64331."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-f1b7c7e5","guard":[["hasAny",["andorra","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42.4285."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-f304399e","guard":[["hasAny",["egypt","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 21.7254."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-f38b638c","guard":[["hasAny",["comoros","shortest","shortest one","shortest word"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -12.3879."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-f5a7c3f5","guard":[["hasAny",["cambodia","shortest","shortest one","shortest word"]],["has","what"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 10.4091."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-fb0ed125","guard":[["hasAny",["heard","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is -53.192."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-87b02290","guard":[["hasAny",["element","item number","nth","position","principe"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 0.024766."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-c914b515","guard":[["hasAny",["burkina","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 9.40111."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"south"}]],"mem":null},
{"id":"n-00f34610","guard":[["hasAny",["martinique","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Martinique":"The south of Martinique is 14.3923."}}},
{"id":"n-03e8bc47","guard":[["hasAny",["ghana","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Ghana":"The south of Ghana is 4.73672."}}},
{"id":"n-050dff2d","guard":[["hasAny",["mauritius","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Mauritius":"The south of Mauritius is -20.5257."}}},
{"id":"n-05c8a954","guard":[["hasAny",["south","sweden"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Sweden":"The south of Sweden is 55.3371."}}},
{"id":"n-080522b1","guard":[["hasAny",["azerbaijan","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Azerbaijan":"The south of Azerbaijan is 38.3892."}}},
{"id":"n-09f629e8","guard":[["hasAny",["afghanistan","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Afghanistan":"The south of Afghanistan is 29.3775."}}},
{"id":"n-0ef68498","guard":[["hasAny",["nepal","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Nepal":"The south of Nepal is 26.3567."}}},
{"id":"n-109f5984","guard":[["hasAny",["gambia","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Gambia":"The south of Gambia is 13.0643."}}},
{"id":"n-10a0dc89","guard":[["has","polynesia"],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of French Polynesia":"The south of French Polynesia is -27.6536."}}},
{"id":"n-118d6dba","guard":[["has","helena"],["has","tell"],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Saint Helena":"The south of Saint Helena is -16.0195."}}},
{"id":"n-12a14d42","guard":[["hasAny",["futuna","south","wallis"]],["has","what"],["has","south"],["not",["has","andorra"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Wallis and Futuna":"The south of Wallis and Futuna is -14.3146."}}},
{"id":"n-13a4799e","guard":[["hasAny",["korea","south"]],["has","tell"],["words<=",7]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of South Korea":"The south of South Korea is 33.1909."}}},
{"id":"n-14f80d61","guard":[["hasAny",["finland","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Finland":"The south of Finland is 59.8088."}}},
{"id":"n-15b435a7","guard":[["hasAny",["bermuda","south"]],["not",["has","and"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Bermuda":"The south of Bermuda is 32.2466."}}},
{"id":"n-172964f8","guard":[["hasAny",["barbados","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Barbados":"The south of Barbados is 13.0398."}}},
{"id":"n-17db8ffe","guard":[["hasAny",["burkina","faso","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Burkina Faso":"The south of Burkina Faso is 9.40111."}}},
{"id":"n-1dec3d9f","guard":[["hasAny",["kyrgyzstan","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Kyrgyzstan":"The south of Kyrgyzstan is 39.1728."}}},
{"id":"n-1eb66091","guard":[["hasAny",["romania","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Romania":"The south of Romania is 43.6273."}}},
{"id":"n-2143dfc6","guard":[["hasAny",["egypt","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Egypt":"The south of Egypt is 21.7254."}}},
{"id":"n-214f27cb","guard":[["hasAny",["austria","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Austria":"The south of Austria is 46.3727."}}},
{"id":"n-21af07ee","guard":[["hasAny",["luxembourg","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Luxembourg":"The south of Luxembourg is 49.4466."}}},
{"id":"n-23aa3e56","guard":[["hasAny",["angola","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Angola":"The south of Angola is -18.0421."}}},
{"id":"n-246c2ec3","guard":[["hasAny",["qatar","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Qatar":"The south of Qatar is 24.4829."}}},
{"id":"n-258cedc7","guard":[["hasAny",["south","spain"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Spain":"The south of Spain is 36.0001."}}},
{"id":"n-28845a4e","guard":[["hasAny",["south","syria"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Syria":"The south of Syria is 32.3107."}}},
{"id":"n-2c80dc61","guard":[["hasAny",["latvia","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Latvia":"The south of Latvia is 55.6689."}}},
{"id":"n-2e2de8cc","guard":[["hasAny",["slovenia","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Slovenia":"The south of Slovenia is 45.4218."}}},
{"id":"n-2ee93ddb","guard":[["hasAny",["seychelles","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Seychelles":"The south of Seychelles is -9.75387."}}},
{"id":"n-30876357","guard":[["hasAny",["croatia","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Croatia":"The south of Croatia is 42.4359."}}},
{"id":"n-32ee485a","guard":[["has","marshall"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Marshall Islands":"The south of Marshall Islands is 5.58764."}}},
{"id":"n-35f0374f","guard":[["hasAny",["islands","sandwich"]],["has","what"],["words<=",12]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of South Georgia and the South Sandwich Islands":"The south of South Georgia and the South Sandwich Islands is -59.4793."}}},
{"id":"n-398f289c","guard":[["has","lucia"],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Saint Lucia":"The south of Saint Lucia is 13.7048."}}},
{"id":"n-3cd33fb1","guard":[["hasAny",["cape","south","verde"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Cape Verde":"The south of Cape Verde is 14.808."}}},
{"id":"n-3e149a79","guard":[["hasAny",["reunion","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Reunion":"The south of Reunion is -21.3837."}}},
{"id":"n-43bd821d","guard":[["hasAny",["jordan","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Jordan":"The south of Jordan is 29.1859."}}},
{"id":"n-4771dc55","guard":[["hasAny",["samoa","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Samoa":"The south of Samoa is -14.0409."}}},
{"id":"n-479e9cf3","guard":[["hasAny",["algeria","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Algeria":"The south of Algeria is 18.96."}}},
{"id":"n-4a494e92","guard":[["hasAny",["brunei","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Brunei":"The south of Brunei is 4.00308."}}},
{"id":"n-4b74a915","guard":[["hasAny",["christmas","island","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Christmas Island":"The south of Christmas Island is -10.5705."}}},
{"id":"n-4d973465","guard":[["hasAny",["lebanon","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Lebanon":"The south of Lebanon is 33.0539."}}},
{"id":"n-5345b7e0","guard":[["hasAny",["south","zimbabwe"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Zimbabwe":"The south of Zimbabwe is -22.4177."}}},
{"id":"n-540f8a1e","guard":[["hasAny",["cambodia","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Cambodia":"The south of Cambodia is 10.4091."}}},
{"id":"n-55900c8b","guard":[["hasAny",["south","uzbekistan"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Uzbekistan":"The south of Uzbekistan is 37.1844."}}},
{"id":"n-56b69685","guard":[["has","falkland"],["has","what"],["has","is"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Falkland Islands":"The south of Falkland Islands is -52.3605."}}},
{"id":"n-58dacc37","guard":[["hasAny",["andorra","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Andorra":"The south of Andorra is 42.4285."}}},
{"id":"n-5ca448cb","guard":[["hasAny",["italy","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Italy":"The south of Italy is 36.6528."}}},
{"id":"n-64876bdf","guard":[["hasAny",["peru","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Peru":"The south of Peru is -18.3497."}}},
{"id":"n-6903e374","guard":[["hasAny",["antigua","barbuda","south"]],["has","give"],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Antigua and Barbuda":"The south of Antigua and Barbuda is 16.997."}}},
{"id":"n-692faca1","guard":[["hasAny",["south","suriname"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Suriname":"The south of Suriname is 1.83115."}}},
{"id":"n-6c20c9ea","guard":[["hasAny",["eswatini","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Eswatini":"The south of Eswatini is -27.3171."}}},
{"id":"n-6de468c8","guard":[["hasAny",["anguilla","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Anguilla":"The south of Anguilla is 18.1668."}}},
{"id":"n-704b3fca","guard":[["hasAny",["lesotho","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Lesotho":"The south of Lesotho is -30.669."}}},
{"id":"n-75fdee09","guard":[["hasAny",["gabon","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Gabon":"The south of Gabon is -3.97881."}}},
{"id":"n-7a20f00e","guard":[["hasAny",["south","togo"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Togo":"The south of Togo is 6.10442."}}},
{"id":"n-7dddde7f","guard":[["hasAny",["palau","south"]],["words<=",6]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Palau":"The south of Palau is 2.8036."}}},
{"id":"n-834f16aa","guard":[["hasAny",["montenegro","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Montenegro":"The south of Montenegro is -42.7087."}}},
{"id":"n-899d3555","guard":[["hasAny",["costa","rica","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Costa Rica":"The south of Costa Rica is 8.03298."}}},
{"id":"n-8a38aba2","guard":[["hasAny",["mozambique","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Mozambique":"The south of Mozambique is -26.8687."}}},
{"id":"n-8badd380","guard":[["hasAny",["bahamas","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Bahamas":"The south of Bahamas is 22.8527."}}},
{"id":"n-8c9f91aa","guard":[["hasAny",["argentina","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Argentina":"The south of Argentina is -55.0613."}}},
{"id":"n-9216f388","guard":[["hasAny",["greenland","south"]],["words<=",6]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Greenland":"The south of Greenland is 59.7774."}}},
{"id":"n-957f56be","guard":[["hasAny",["australia","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Australia":"The south of Australia is -43.644."}}},
{"id":"n-99a55db8","guard":[["hasAny",["bulgaria","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Bulgaria":"The south of Bulgaria is 41.2421."}}},
{"id":"n-99d1d21a","guard":[["hasAny",["british","indian","ocean","south","territory"]],["has","what"],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of British Indian Ocean Territory":"The south of British Indian Ocean Territory is -7.43803."}}},
{"id":"n-9aea86f4","guard":[["hasAny",["netherlands","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Netherlands":"The south of Netherlands is 50.7539."}}},
{"id":"n-9b0fb10e","guard":[["hasAny",["east","south","timor"]],["has","tell"],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of East Timor":"The south of East Timor is -9.46363."}}},
{"id":"n-9ce99a20","guard":[["hasAny",["niue","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Niue":"The south of Niue is -19.1522."}}},
{"id":"n-a118d58f","guard":[["hasAny",["principe","sao","south","tome"]],["has","south"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Sao Tome and Principe":"The south of Sao Tome and Principe is 0.024766."}}},
{"id":"n-a22d612b","guard":[["hasAny",["monaco","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Monaco":"The south of Monaco is 43.7247."}}},
{"id":"n-a7c06ca4","guard":[["hasAny",["philippines","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Philippines":"The south of Philippines is 4.64331."}}},
{"id":"n-a8132b75","guard":[["hasAny",["south","tuvalu"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Tuvalu":"The south of Tuvalu is -10.8012."}}},
{"id":"n-ac712d9d","guard":[["hasAny",["eritrea","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Eritrea":"The south of Eritrea is 12.3596."}}},
{"id":"n-aca5ca3f","guard":[["hasAny",["comoros","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Comoros":"The south of Comoros is -12.3879."}}},
{"id":"n-b86669aa","guard":[["hasAny",["mexico","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Mexico":"The south of Mexico is 14.5329."}}},
{"id":"n-bcf522fe","guard":[["hasAny",["coast","ivory","south"]],["has","give"],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Ivory Coast":"The south of Ivory Coast is 4.35707."}}},
{"id":"n-c058d84b","guard":[["hasAny",["africa","south"]],["has","what"],["words<=",7],["has","is"],["not",["has","coastline"]],["not",["has","density"]],["not",["has","iso"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of South Africa":"The south of South Africa is -34.8398."}}},
{"id":"n-c12ac86e","guard":[["hasAny",["bahrain","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Bahrain":"The south of Bahrain is 25.7969."}}},
{"id":"n-c212463d","guard":[["hasAny",["bosnia","herzegovina","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Bosnia and Herzegovina":"The south of Bosnia and Herzegovina is 42.5461."}}},
{"id":"n-c6aed250","guard":[["hasAny",["denmark","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Denmark":"The south of Denmark is 54.5624."}}},
{"id":"n-cabda764","guard":[["hasAny",["heard","island","islands","mcdonald","south"]],["has","south"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Heard Island and McDonald Islands":"The south of Heard Island and McDonald Islands is -53.192."}}},
{"id":"n-cf07f3a9","guard":[["has","guiana"],["has","tell"],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of French Guiana":"The south of French Guiana is 2.12709."}}},
{"id":"n-d306bbd1","guard":[["hasAny",["caicos","islands","south","turks"]],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Turks and Caicos Islands":"The south of Turks and Caicos Islands is 21.4226."}}},
{"id":"n-d3af445c","guard":[["has","equatorial"],["has","tell"],["has","south"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Equatorial Guinea":"The south of Equatorial Guinea is 0.92086."}}},
{"id":"n-d9c3c80f","guard":[["hasAny",["guadeloupe","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Guadeloupe":"The south of Guadeloupe is 15.8676."}}},
{"id":"n-da74f424","guard":[["hasAny",["south","tajikistan"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Tajikistan":"The south of Tajikistan is 36.6741."}}},
{"id":"n-dac47d6d","guard":[["hasAny",["armenia","south"]],["words<=",6]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Armenia":"The south of Armenia is 38.8305."}}},
{"id":"n-dcfc9093","guard":[["hasAny",["canada","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Canada":"The south of Canada is 41.676."}}},
{"id":"n-e1dbda1c","guard":[["hasAny",["albania","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Albania":"The south of Albania is 39.6484."}}},
{"id":"n-e2f35f72","guard":[["hasAny",["singapore","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Singapore":"The south of Singapore is 1.25856."}}},
{"id":"n-e5874cac","guard":[["hasAny",["bangladesh","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Bangladesh":"The south of Bangladesh is 20.7433."}}},
{"id":"n-e87b76fc","guard":[["hasAny",["south","turkmenistan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Turkmenistan":"The south of Turkmenistan is 35.1411."}}},
{"id":"n-ea2fa169","guard":[["hasAny",["south","tokelau"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Tokelau":"The south of Tokelau is -9.38111."}}},
{"id":"n-ea54a8a0","guard":[["hasAny",["poland","south"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the south of Poland":"The south of Poland is 49.0064."}}},
{"id":"n-f282cd89","guard":[["hasAny",["macedonia","north","south"]],["has","south"],["has","what"],["has","macedonia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of North Macedonia":"The south of North Macedonia is 40.8602."}}},
{"id":"n-fc445e16","guard":[["hasAny",["norway","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Norway":"The south of Norway is 57.9779."}}},
{"id":"n-fd8d5162","guard":[["hasAny",["iceland","south"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the south of Iceland":"The south of Iceland is 63.3933."}}},
{"id":"n-ffe8d9f7","guard":[["hasAny",["chad","south"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Chad":"The south of Chad is 7.44107."}}},
{"id":"n-ffffd19a","guard":[["hasAny",["belgium","south"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the south of Belgium":"The south of Belgium is 49.4936."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"tell me the south of Finland","expect":{"contains":["59.8088"],"notRefusal":true}},{"q":"tell me the south of Cape Verde","expect":{"contains":["14.808"],"notRefusal":true}},{"q":"what is the south of Uzbekistan","expect":{"contains":["37.1844"],"notRefusal":true}},{"q":"tell me the south of Latvia","expect":{"contains":["55.6689"],"notRefusal":true}},{"q":"what is the south of Wallis and Futuna","expect":{"contains":["-14.3146"],"notRefusal":true}},{"q":"what is the south of Guadeloupe","expect":{"contains":["15.8676"],"notRefusal":true}},{"q":"what is the south of Comoros","expect":{"contains":["-12.3879"],"notRefusal":true}},{"q":"give the south of Austria","expect":{"contains":["46.3727"],"notRefusal":true}},{"q":"tell me the south of Christmas Island","expect":{"contains":["-10.5705"],"notRefusal":true}},{"q":"give the south of Angola","expect":{"contains":["-18.0421"],"notRefusal":true}},{"q":"give the south of Tuvalu","expect":{"contains":["-10.8012"],"notRefusal":true}},{"q":"what is the south of Saint Lucia","expect":{"contains":["13.7048"],"notRefusal":true}},{"q":"tell me the south of East Timor","expect":{"contains":["-9.46363"],"notRefusal":true}},{"q":"give the south of Tokelau","expect":{"contains":["-9.38111"],"notRefusal":true}},{"q":"tell me the south of Argentina","expect":{"contains":["-55.0613"],"notRefusal":true}},{"q":"give the south of Turkmenistan","expect":{"contains":["35.1411"],"notRefusal":true}},{"q":"tell me the south of Gabon","expect":{"contains":["-3.97881"],"notRefusal":true}},{"q":"give the south of Australia","expect":{"contains":["-43.644"],"notRefusal":true}},{"q":"give the south of Sweden","expect":{"contains":["55.3371"],"notRefusal":true}},{"q":"what is the south of Heard Island and McDonald Islands","expect":{"contains":["-53.192"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
