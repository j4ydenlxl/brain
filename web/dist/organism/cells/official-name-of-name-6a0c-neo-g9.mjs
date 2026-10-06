// official-name-of-name-6a0c-neo-g9.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"official-name-of-name-6a0c-neo-g9","class":"official-name-of-name-6a0c","generation":9,"lane":"neo","grownFrom":["give the official name for Philippines","give the official name for Panama","tell me the official name of the name Guatemala","what is the official name of Uruguay","give the official name for Bahamas","what is the official name of Trinidad and Tobago","give the official name for Kenya","give the official name for Rwanda","what is the official name of Mauritania","tell me the official name of the name Azerbaijan","tell me the official name of the name Guinea","what is the official name of Chile","tell me the official name of the name United Kingdom","tell me the official name of the name Sudan","what is the official name of Algeria","what is the official name of Pakistan","tell me the official name of the name Eritrea","what is the official name of South Africa","what is the official name of Vanuatu","give the official name for Brazil"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-countries-585efe","columns":["name","alpha 2","alpha 3","official name"],"n":249,"cols":[{"s":"Aruba|Egypt|Argentina|Venezuela, Bolivarian Republic of|Bonaire, Sint Eustatius and Saba|Virgin Islands, British|Dominica|Bahamas|Northern Mariana Islands|Curaçao|Czechia|Korea, Democratic People's Republic of|Sao Tome and Principe|Timor-Leste|Sri Lanka|Uruguay|Ethiopia|Nepal|Germany|Nigeria|Somalia|Micronesia, Federated States of|Brazil|France|Gabon|Luxembourg|Jordan|Greece|Hong Kong|Hungary|Papua New Guinea|Samoa|Afghanistan|Iran, Islamic Republic of|Mauritania|Pakistan|Italy|Bahrain|Belgium|Bhutan|Cambodia|Denmark|Eswatini|Lesotho|Morocco|Norway|Saudi Arabia|Spain|Sweden|Thailand|Tonga|Netherlands|Kyrgyzstan|Lebanon|Libya|Macao|Montenegro|American Samoa|Anguilla|Antarctica|Antigua and Barbuda|Australia|Barbados|Belize|Bermuda|Bouvet Island|British Indian Ocean Territory|Brunei Darussalam|Burkina Faso|Canada|Cayman Islands|Central African Republic|Christmas Island|Cocos (Keeling) Islands|Congo, The Democratic Republic of the|Cook Islands|Dominican Republic|Falkland Islands (Malvinas)|Faroe Islands|French Guiana|French Polynesia|French Southern Territories|Georgia|Gibraltar|Greenland|Grenada|Guadeloupe|Guam|Guernsey|Heard Island and McDonald Islands|Holy See (Vatican City State)|Ireland|Isle of Man|Jamaica|Japan|Jersey|Korea, Republic of|Lao People's Democratic Republic|Malaysia|Martinique|Mayotte|Mongolia|Montserrat|New Caledonia|New Zealand|Norfolk Island|Pitcairn|Puerto Rico|Romania|Russian Federation|Réunion|Saint Barthélemy|Saint Helena, Ascension and Tristan da Cunha|Saint Kitts and Nevis|Saint Lucia|Saint Martin (French part)|Saint Pierre and Miquelon|Saint Vincent and the Grenadines|Solomon Islands|South Georgia and the South Sandwich Islands|Svalbard and Jan Mayen|Syrian Arab Republic|Tokelau|Turkmenistan|Turks and Caicos Islands|Tuvalu|Ukraine|United Arab Emirates|United States Minor Outlying Islands|Wallis and Futuna|Western Sahara|Åland Islands|Niue|Algeria|Bangladesh|China|Bolivia, Plurinational State of|Portugal|Andorra|Liechtenstein|Monaco|Albania|Angola|Armenia|Austria|Azerbaijan|Belarus|Benin|Bosnia and Herzegovina|Botswana|Bulgaria|Burundi|Cabo Verde|Cameroon|Chad|Chile|Colombia|Costa Rica|Croatia|Cuba|Cyprus|Côte d'Ivoire|Djibouti|Ecuador|El Salvador|Equatorial Guinea|Estonia|Fiji|Finland|Ghana|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Iceland|India|Indonesia|Iraq|Kazakhstan|Kenya|Kiribati|Latvia|Liberia|Lithuania|Madagascar|Malawi|Maldives|Mali|Malta|Mauritius|Moldova, Republic of|Mozambique|Myanmar|Namibia|Nauru|Nicaragua|North Macedonia|Palau|Panama|Paraguay|Peru|Poland|San Marino|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovenia|South Africa|South Sudan|Suriname|Tajikistan|Trinidad and Tobago|Tunisia|Türkiye|Uganda|Uzbekistan|Vanuatu|Yemen|Zambia|Zimbabwe|Congo|Gambia|Marshall Islands|Niger|Philippines|Sudan|Rwanda|Sint Maarten (Dutch part)|Slovakia|Viet Nam|Israel|Kuwait|Qatar|Oman|Switzerland|Taiwan, Province of China|Togo|Comoros|United Kingdom|Mexico|Tanzania, United Republic of|United States|Virgin Islands, U.S.|Eritrea|Palestine, State of","sep":"|"},{"s":"AW|EG|AR|VE|BQ|VG|DM|BS|MP|CW|CZ|KP|ST|TL|LK|UY|ET|NP|DE|NG|SO|FM|BR|FR|GA|LU|JO|GR|HK|HU|PG|WS|AF|IR|MR|PK|IT|BH|BE|BT|KH|DK|SZ|LS|MA|NO|SA|ES|SE|TH|TO|NL|KG|LB|LY|MO|ME|AS|AI|AQ|AG|AU|BB|BZ|BM|BV|IO|BN|BF|CA|KY|CF|CX|CC|CD|CK|DO|FK|FO|GF|PF|TF|GE|GI|GL|GD|GP|GU|GG|HM|VA|IE|IM|JM|JP|JE|KR|LA|MY|MQ|YT|MN|MS|NC|NZ|NF|PN|PR|RO|RU|RE|BL|SH|KN|LC|MF|PM|VC|SB|GS|SJ|SY|TK|TM|TC|TV|UA|AE|UM|WF|EH|AX|NU|DZ|BD|CN|BO|PT|AD|LI|MC|AL|AO|AM|AT|AZ|BY|BJ|BA|BW|BG|BI|CV|CM|TD|CL|CO|CR|HR|CU|CY|CI|DJ|EC|SV|GQ|EE|FJ|FI|GH|GT|GN|GW|GY|HT|HN|IS|IN|ID|IQ|KZ|KE|KI|LV|LR|LT|MG|MW|MV|ML|MT|MU|MD|MZ|MM|NA|NR|NI|MK|PW|PA|PY|PE|PL|SM|SN|RS|SC|SL|SG|SI|ZA|SS|SR|TJ|TT|TN|TR|UG|UZ|VU|YE|ZM|ZW|CG|GM|MH|NE|PH|SD|RW|SX|SK|VN|IL|KW|QA|OM|CH|TW|TG|KM|GB|MX|TZ|US|VI|ER|PS","sep":"|"},{"s":"ABW|EGY|ARG|VEN|BES|VGB|DMA|BHS|MNP|CUW|CZE|PRK|STP|TLS|LKA|URY|ETH|NPL|DEU|NGA|SOM|FSM|BRA|FRA|GAB|LUX|JOR|GRC|HKG|HUN|PNG|WSM|AFG|IRN|MRT|PAK|ITA|BHR|BEL|BTN|KHM|DNK|SWZ|LSO|MAR|NOR|SAU|ESP|SWE|THA|TON|NLD|KGZ|LBN|LBY|MAC|MNE|ASM|AIA|ATA|ATG|AUS|BRB|BLZ|BMU|BVT|IOT|BRN|BFA|CAN|CYM|CAF|CXR|CCK|COD|COK|DOM|FLK|FRO|GUF|PYF|ATF|GEO|GIB|GRL|GRD|GLP|GUM|GGY|HMD|VAT|IRL|IMN|JAM|JPN|JEY|KOR|LAO|MYS|MTQ|MYT|MNG|MSR|NCL|NZL|NFK|PCN|PRI|ROU|RUS|REU|BLM|SHN|KNA|LCA|MAF|SPM|VCT|SLB|SGS|SJM|SYR|TKL|TKM|TCA|TUV|UKR|ARE|UMI|WLF|ESH|ALA|NIU|DZA|BGD|CHN|BOL|PRT|AND|LIE|MCO|ALB|AGO|ARM|AUT|AZE|BLR|BEN|BIH|BWA|BGR|BDI|CPV|CMR|TCD|CHL|COL|CRI|HRV|CUB|CYP|CIV|DJI|ECU|SLV|GNQ|EST|FJI|FIN|GHA|GTM|GIN|GNB|GUY|HTI|HND|ISL|IND|IDN|IRQ|KAZ|KEN|KIR|LVA|LBR|LTU|MDG|MWI|MDV|MLI|MLT|MUS|MDA|MOZ|MMR|NAM|NRU|NIC|MKD|PLW|PAN|PRY|PER|POL|SMR|SEN|SRB|SYC|SLE|SGP|SVN|ZAF|SSD|SUR|TJK|TTO|TUN|TUR|UGA|UZB|VUT|YEM|ZMB|ZWE|COG|GMB|MHL|NER|PHL|SDN|RWA|SXM|SVK|VNM|ISR|KWT|QAT|OMN|CHE|TWN|TGO|COM|GBR|MEX|TZA|USA|VIR|ERI|PSE","sep":"|"},{"f":"0NA|0Arab Republic of Egypt|2gentine Republic|0Bolivarian Republic of Venezuela|2naire, Sint Eustatius and Saba|1ritish Virgin Islands|0Commonwealth of Dominica|gthe Bahamas|kNorthern Mariana Islands|1uraçao|1zech Republic|0Democratic People's Republic of Korea|bRepublic of Sao Tome and Principe|nTimor-Leste|bSocialist Republic of Sri Lanka|0Eastern Republic of Uruguay|0Federal Democratic Republic of Ethiopia|vNepal|8Republic of Germany|kNigeria|kSomalia|6ted States of Micronesia|7ive Republic of Brazil|1rench Republic|0Gabonese Republic|1rand Duchy of Luxembourg|0Hashemite Kingdom of Jordan|1ellenic Republic|1ong Kong Special Administrative Region of China|1ungary|0Independent State of Papua New Guinea|lSamoa|1slamic Republic of Afghanistan|kIran|kMauritania|kPakistan|1talian Republic|0Kingdom of Bahrain|celgium|chutan|bCambodia|bDenmark|bEswatini|bLesotho|bMorocco|bNorway|bSaudi Arabia|cpain|cweden|bThailand|conga|bthe Netherlands|1yrgyz Republic|0Lebanese Republic|1ibya|0Macao Special Administrative Region of China|1ontenegro|0NA|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|1iue|0People's Democratic Republic of Algeria|9Republic of Bangladesh|lChina|1lurinational State of Bolivia|1ortuguese Republic|1rincipality of Andorra|gLiechtenstein|gMonaco|0Republic of Albania|dngola|drmenia|dustria|dzerbaijan|cBelarus|enin|dosnia and Herzegovina|etswana|dulgaria|erundi|cCabo Verde|emeroon|dhad|eile|dolombia|esta Rica|droatia|duba|dyprus|dôte d'Ivoire|cDjibouti|cEcuador|dl Salvador|dquatorial Guinea|dstonia|cFiji|enland|cGhana|duatemala|einea|i-Bissau|eyana|cHaiti|donduras|cIceland|dndia|fonesia|draq|cKazakhstan|denya|diribati|cLatvia|diberia|ethuania|cMadagascar|elawi|fdives|fi|fta|euritius|doldova|ezambique|dyanmar|cNamibia|euru|dicaragua|dorth Macedonia|cPalau|enama|eraguay|deru|doland|cSan Marino|denegal|erbia|eychelles|dierra Leone|engapore|dlovenia|douth Africa|iSudan|duriname|cTajikistan|drinidad and Tobago|dunisia|dürkiye|cUganda|dzbekistan|cVanuatu|cYemen|cZambia|dimbabwe|cthe Congo|gGambia|gMarshall Islands|gNiger|gPhilippines|gSudan|1wandese Republic|0Sint Maarten (Dutch part)|1lovak Republic|1ocialist Republic of Viet Nam|1tate of Israel|9Kuwait|9Qatar|1ultanate of Oman|1wiss Confederation|0Taiwan, Province of China|1ogolese Republic|0Union of the Comoros|3ted Kingdom of Great Britain and Northern Ireland|7Mexican States|7Republic of Tanzania|7States of America|0Virgin Islands of the United States|0the State of Eritrea|dPalestine","sep":"|"}]}]);
const COLONY = [
{"id":"n-5fe4aab0","guard":[["hasAny",["element","item number","name","nth","position"]],["has","official"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-580bdd00","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","small letters"]],["has","official"]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-9a53ffc2","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","name","nth","position","upper case","uppercase"]],["has","official"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-b4c527dd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","name","nth","position","title case"]],["has","official"]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-f57664bf","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["has","official"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-0982d708","guard":[["hasAny",["at least","element","greater than or equal to","item number","name","no less than","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.yesNo",["compare.atLeast",["sense.wordCount"],{"lit":10}],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],["render.template",{"lit":["The official ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-4d8c9891","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Philippines":"The official name of Philippines is Republic of the Philippines.","give the official name for Panama":"The official name of Panama is Republic of Panama.","tell me the official name of the name Guatemala":"The official name of Guatemala is Republic of Guatemala.","what is the official name of Uruguay":"The official name of Uruguay is Eastern Republic of Uruguay.","give the official name for Bahamas":"The official name of Bahamas is Commonwealth of the Bahamas.","what is the official name of Trinidad and Tobago":"The official name of Trinidad and Tobago is Republic of Trinidad and Tobago.","give the official name for Kenya":"The official name of Kenya is Republic of Kenya.","give the official name for Rwanda":"The official name of Rwanda is Rwandese Republic.","what is the official name of Mauritania":"The official name of Mauritania is Islamic Republic of Mauritania.","tell me the official name of the name Azerbaijan":"The official name of Azerbaijan is Republic of Azerbaijan.","tell me the official name of the name Guinea":"The official name of Guinea is Republic of Guinea.","what is the official name of Chile":"The official name of Chile is Republic of Chile.","tell me the official name of the name United Kingdom":"The official name of United Kingdom is United Kingdom of Great Britain and Northern Ireland.","tell me the official name of the name Sudan":"The official name of Sudan is Republic of the Sudan.","what is the official name of Algeria":"The official name of Algeria is People's Democratic Republic of Algeria.","what is the official name of Pakistan":"The official name of Pakistan is Islamic Republic of Pakistan.","tell me the official name of the name Eritrea":"The official name of Eritrea is the State of Eritrea.","what is the official name of South Africa":"The official name of South Africa is Republic of South Africa.","what is the official name of Vanuatu":"The official name of Vanuatu is Republic of Vanuatu.","give the official name for Brazil":"The official name of Brazil is Federative Republic of Brazil.","tell me the official name of the name Equatorial Guinea":"The official name of Equatorial Guinea is Republic of Equatorial Guinea.","tell me the official name of the name Honduras":"The official name of Honduras is Republic of Honduras.","give the official name for North Macedonia":"The official name of North Macedonia is Republic of North Macedonia.","tell me the official name of the name Côte d'Ivoire":"The official name of Côte d'Ivoire is Republic of Côte d'Ivoire.","what is the official name of Comoros":"The official name of Comoros is Union of the Comoros.","tell me the official name of the name Cambodia":"The official name of Cambodia is Kingdom of Cambodia.","tell me the official name of the name Nigeria":"The official name of Nigeria is Federal Republic of Nigeria.","what is the official name of Finland":"The official name of Finland is Republic of Finland.","give the official name for Latvia":"The official name of Latvia is Republic of Latvia.","give the official name for Slovakia":"The official name of Slovakia is Slovak Republic.","give the official name for Indonesia":"The official name of Indonesia is Republic of Indonesia.","give the official name for Yemen":"The official name of Yemen is Republic of Yemen.","tell me the official name of the name Macao":"The official name of Macao is Macao Special Administrative Region of China.","tell me the official name of the name Mexico":"The official name of Mexico is United Mexican States.","tell me the official name of the name Papua New Guinea":"The official name of Papua New Guinea is Independent State of Papua New Guinea.","tell me the official name of the name Germany":"The official name of Germany is Federal Republic of Germany.","tell me the official name of the name Kuwait":"The official name of Kuwait is State of Kuwait.","what is the official name of Madagascar":"The official name of Madagascar is Republic of Madagascar.","what is the official name of Suriname":"The official name of Suriname is Republic of Suriname.","give the official name for Tonga":"The official name of Tonga is Kingdom of Tonga.","what is the official name of Virgin Islands, British":"The official name of Virgin Islands, British is British Virgin Islands.","give the official name for Marshall Islands":"The official name of Marshall Islands is Republic of the Marshall Islands.","give the official name for Mauritius":"The official name of Mauritius is Republic of Mauritius.","tell me the official name of the name Iraq":"The official name of Iraq is Republic of Iraq.","tell me the official name of the name India":"The official name of India is Republic of India.","tell me the official name of the name Kyrgyzstan":"The official name of Kyrgyzstan is Kyrgyz Republic.","what is the official name of Myanmar":"The official name of Myanmar is Republic of Myanmar.","give the official name for Eswatini":"The official name of Eswatini is Kingdom of Eswatini.","what is the official name of Iran, Islamic Republic of":"The official name of Iran, Islamic Republic of is Islamic Republic of Iran.","tell me the official name of the name Guinea-Bissau":"The official name of Guinea-Bissau is Republic of Guinea-Bissau.","what is the official name of Argentina":"The official name of Argentina is Argentine Republic.","what is the official name of Egypt":"The official name of Egypt is Arab Republic of Egypt.","tell me the official name of the name Costa Rica":"The official name of Costa Rica is Republic of Costa Rica.","what is the official name of Denmark":"The official name of Denmark is Kingdom of Denmark.","what is the official name of Lebanon":"The official name of Lebanon is Lebanese Republic.","give the official name for Spain":"The official name of Spain is Kingdom of Spain.","give the official name for Sierra Leone":"The official name of Sierra Leone is Republic of Sierra Leone.","what is the official name of Samoa":"The official name of Samoa is Independent State of Samoa.","give the official name for Moldova, Republic of":"The official name of Moldova, Republic of is Republic of Moldova.","tell me the official name of the name Iceland":"The official name of Iceland is Republic of Iceland.","what is the official name of Belarus":"The official name of Belarus is Republic of Belarus.","tell me the official name of the name Italy":"The official name of Italy is Italian Republic.","what is the official name of Niger":"The official name of Niger is Republic of the Niger.","what is the official name of Seychelles":"The official name of Seychelles is Republic of Seychelles."}}},
{"id":"n-0f116eaa","guard":[["has","name"],["has","official"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"for Philippines":"The official name of Philippines is Republic of the Philippines.","for Panama":"The official name of Panama is Republic of Panama.","of the name Guatemala":"The official name of Guatemala is Republic of Guatemala.","of Uruguay":"The official name of Uruguay is Eastern Republic of Uruguay.","for Bahamas":"The official name of Bahamas is Commonwealth of the Bahamas.","of Trinidad and Tobago":"The official name of Trinidad and Tobago is Republic of Trinidad and Tobago.","for Kenya":"The official name of Kenya is Republic of Kenya.","for Rwanda":"The official name of Rwanda is Rwandese Republic.","of Mauritania":"The official name of Mauritania is Islamic Republic of Mauritania.","of the name Azerbaijan":"The official name of Azerbaijan is Republic of Azerbaijan.","of the name Guinea":"The official name of Guinea is Republic of Guinea.","of Chile":"The official name of Chile is Republic of Chile.","of the name United Kingdom":"The official name of United Kingdom is United Kingdom of Great Britain and Northern Ireland.","of the name Sudan":"The official name of Sudan is Republic of the Sudan.","of Algeria":"The official name of Algeria is People's Democratic Republic of Algeria.","of Pakistan":"The official name of Pakistan is Islamic Republic of Pakistan.","of the name Eritrea":"The official name of Eritrea is the State of Eritrea.","of South Africa":"The official name of South Africa is Republic of South Africa.","of Vanuatu":"The official name of Vanuatu is Republic of Vanuatu.","for Brazil":"The official name of Brazil is Federative Republic of Brazil.","of the name Equatorial Guinea":"The official name of Equatorial Guinea is Republic of Equatorial Guinea.","of the name Honduras":"The official name of Honduras is Republic of Honduras.","for North Macedonia":"The official name of North Macedonia is Republic of North Macedonia.","of the name Côte d'Ivoire":"The official name of Côte d'Ivoire is Republic of Côte d'Ivoire.","of Comoros":"The official name of Comoros is Union of the Comoros.","of the name Cambodia":"The official name of Cambodia is Kingdom of Cambodia.","of the name Nigeria":"The official name of Nigeria is Federal Republic of Nigeria.","of Finland":"The official name of Finland is Republic of Finland.","for Latvia":"The official name of Latvia is Republic of Latvia.","for Slovakia":"The official name of Slovakia is Slovak Republic.","for Indonesia":"The official name of Indonesia is Republic of Indonesia.","for Yemen":"The official name of Yemen is Republic of Yemen.","of the name Macao":"The official name of Macao is Macao Special Administrative Region of China.","of the name Mexico":"The official name of Mexico is United Mexican States.","of the name Papua New Guinea":"The official name of Papua New Guinea is Independent State of Papua New Guinea.","of the name Germany":"The official name of Germany is Federal Republic of Germany.","of the name Kuwait":"The official name of Kuwait is State of Kuwait.","of Madagascar":"The official name of Madagascar is Republic of Madagascar.","of Suriname":"The official name of Suriname is Republic of Suriname.","for Tonga":"The official name of Tonga is Kingdom of Tonga.","of Virgin Islands, British":"The official name of Virgin Islands, British is British Virgin Islands.","for Marshall Islands":"The official name of Marshall Islands is Republic of the Marshall Islands.","for Mauritius":"The official name of Mauritius is Republic of Mauritius.","of the name Iraq":"The official name of Iraq is Republic of Iraq.","of the name India":"The official name of India is Republic of India.","of the name Kyrgyzstan":"The official name of Kyrgyzstan is Kyrgyz Republic.","of Myanmar":"The official name of Myanmar is Republic of Myanmar.","for Eswatini":"The official name of Eswatini is Kingdom of Eswatini.","of Iran, Islamic Republic of":"The official name of Iran, Islamic Republic of is Islamic Republic of Iran.","of the name Guinea-Bissau":"The official name of Guinea-Bissau is Republic of Guinea-Bissau.","of Argentina":"The official name of Argentina is Argentine Republic.","of Egypt":"The official name of Egypt is Arab Republic of Egypt.","of the name Costa Rica":"The official name of Costa Rica is Republic of Costa Rica.","of Denmark":"The official name of Denmark is Kingdom of Denmark.","of Lebanon":"The official name of Lebanon is Lebanese Republic.","for Spain":"The official name of Spain is Kingdom of Spain.","for Sierra Leone":"The official name of Sierra Leone is Republic of Sierra Leone.","of Samoa":"The official name of Samoa is Independent State of Samoa.","for Moldova, Republic of":"The official name of Moldova, Republic of is Republic of Moldova.","of the name Iceland":"The official name of Iceland is Republic of Iceland.","of Belarus":"The official name of Belarus is Republic of Belarus.","of the name Italy":"The official name of Italy is Italian Republic.","of Niger":"The official name of Niger is Republic of the Niger.","of Seychelles":"The official name of Seychelles is Republic of Seychelles."}}},
{"id":"n-c5a60565","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"official"}]]],"mem":{"table":{"name for Philippines":"The official name of Philippines is Republic of the Philippines.","name for Panama":"The official name of Panama is Republic of Panama.","name of the name Guatemala":"The official name of Guatemala is Republic of Guatemala.","name of Uruguay":"The official name of Uruguay is Eastern Republic of Uruguay.","name for Bahamas":"The official name of Bahamas is Commonwealth of the Bahamas.","name of Trinidad and Tobago":"The official name of Trinidad and Tobago is Republic of Trinidad and Tobago.","name for Kenya":"The official name of Kenya is Republic of Kenya.","name for Rwanda":"The official name of Rwanda is Rwandese Republic.","name of Mauritania":"The official name of Mauritania is Islamic Republic of Mauritania.","name of the name Azerbaijan":"The official name of Azerbaijan is Republic of Azerbaijan.","name of the name Guinea":"The official name of Guinea is Republic of Guinea.","name of Chile":"The official name of Chile is Republic of Chile.","name of the name United Kingdom":"The official name of United Kingdom is United Kingdom of Great Britain and Northern Ireland.","name of the name Sudan":"The official name of Sudan is Republic of the Sudan.","name of Algeria":"The official name of Algeria is People's Democratic Republic of Algeria.","name of Pakistan":"The official name of Pakistan is Islamic Republic of Pakistan.","name of the name Eritrea":"The official name of Eritrea is the State of Eritrea.","name of South Africa":"The official name of South Africa is Republic of South Africa.","name of Vanuatu":"The official name of Vanuatu is Republic of Vanuatu.","name for Brazil":"The official name of Brazil is Federative Republic of Brazil.","name of the name Equatorial Guinea":"The official name of Equatorial Guinea is Republic of Equatorial Guinea.","name of the name Honduras":"The official name of Honduras is Republic of Honduras.","name for North Macedonia":"The official name of North Macedonia is Republic of North Macedonia.","name of the name Côte d'Ivoire":"The official name of Côte d'Ivoire is Republic of Côte d'Ivoire.","name of Comoros":"The official name of Comoros is Union of the Comoros.","name of the name Cambodia":"The official name of Cambodia is Kingdom of Cambodia.","name of the name Nigeria":"The official name of Nigeria is Federal Republic of Nigeria.","name of Finland":"The official name of Finland is Republic of Finland.","name for Latvia":"The official name of Latvia is Republic of Latvia.","name for Slovakia":"The official name of Slovakia is Slovak Republic.","name for Indonesia":"The official name of Indonesia is Republic of Indonesia.","name for Yemen":"The official name of Yemen is Republic of Yemen.","name of the name Macao":"The official name of Macao is Macao Special Administrative Region of China.","name of the name Mexico":"The official name of Mexico is United Mexican States.","name of the name Papua New Guinea":"The official name of Papua New Guinea is Independent State of Papua New Guinea.","name of the name Germany":"The official name of Germany is Federal Republic of Germany.","name of the name Kuwait":"The official name of Kuwait is State of Kuwait.","name of Madagascar":"The official name of Madagascar is Republic of Madagascar.","name of Suriname":"The official name of Suriname is Republic of Suriname.","name for Tonga":"The official name of Tonga is Kingdom of Tonga.","name of Virgin Islands, British":"The official name of Virgin Islands, British is British Virgin Islands.","name for Marshall Islands":"The official name of Marshall Islands is Republic of the Marshall Islands.","name for Mauritius":"The official name of Mauritius is Republic of Mauritius.","name of the name Iraq":"The official name of Iraq is Republic of Iraq.","name of the name India":"The official name of India is Republic of India.","name of the name Kyrgyzstan":"The official name of Kyrgyzstan is Kyrgyz Republic.","name of Myanmar":"The official name of Myanmar is Republic of Myanmar.","name for Eswatini":"The official name of Eswatini is Kingdom of Eswatini.","name of Iran, Islamic Republic of":"The official name of Iran, Islamic Republic of is Islamic Republic of Iran.","name of the name Guinea-Bissau":"The official name of Guinea-Bissau is Republic of Guinea-Bissau.","name of Argentina":"The official name of Argentina is Argentine Republic.","name of Egypt":"The official name of Egypt is Arab Republic of Egypt.","name of the name Costa Rica":"The official name of Costa Rica is Republic of Costa Rica.","name of Denmark":"The official name of Denmark is Kingdom of Denmark.","name of Lebanon":"The official name of Lebanon is Lebanese Republic.","name for Spain":"The official name of Spain is Kingdom of Spain.","name for Sierra Leone":"The official name of Sierra Leone is Republic of Sierra Leone.","name of Samoa":"The official name of Samoa is Independent State of Samoa.","name for Moldova, Republic of":"The official name of Moldova, Republic of is Republic of Moldova.","name of the name Iceland":"The official name of Iceland is Republic of Iceland.","name of Belarus":"The official name of Belarus is Republic of Belarus.","name of the name Italy":"The official name of Italy is Italian Republic.","name of Niger":"The official name of Niger is Republic of the Niger.","name of Seychelles":"The official name of Seychelles is Republic of Seychelles."}}},
{"id":"n-6a9de02a","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","eswatini","finland","germany","guatemala","guineabissau","honduras","iceland","india","indonesia","iraq","islands","italy","item number","kenya","kingdom","kuwait","kyrgyzstan","latvia","lebanon","leone","macao","macedonia","madagascar","mauritania","mauritius","mexico","myanmar","niger","nigeria","nth","pakistan","panama","philippines","position","republic","rwanda","samoa","seychelles","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The official ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-a4d7aba5","guard":[["hasAny",["africa","argentina","azerbaijan","bahamas","belarus","brazil","cambodia","chile","comoros","costa","denmark","egypt","element","eritrea","eswatini","finland","germany","guatemala","guinea","honduras","iceland","india","indonesia","iraq","islands","italy","item number","kenya","kingdom","kuwait","kyrgyzstan","latvia","lebanon","leone","macao","macedonia","madagascar","mauritania","mauritius","mexico","myanmar","niger","nigeria","normalise","normalize","nth","pakistan","panama","philippines","position","republic","rwanda","samoa","seychelles","simplify the text","slovakia","spain","sudan","suriname","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],{"lit":1}]],"mem":null},
{"id":"n-ce04d3ac","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","new","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","slovakia","spain","sudan","suriname","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-0418e6b8","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-93de9a1e","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-1742f485","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","invert case","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","swap case","tobago","toggle case","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-7f9698e6","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-9f5caeb7","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","lower case","lowercase","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","small letters","spain","sudan","suriname","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-dc119de5","guard":[["hasAny",["africa","algeria","all caps","bahamas","belarus","brazil","cambodia","capital letters","capitals","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","tobago","tonga","upper case","uppercase","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-ee5f057e","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","capitalise","capitalize","capitalize each word","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","title case","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-15b80180","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","capitalise","capitalize","capitalize each word","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","title case","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-5dba6c53","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","lower case","lowercase","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","small letters","spain","sudan","suriname","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-ada3096a","guard":[["hasAny",["africa","algeria","all caps","bahamas","belarus","brazil","cambodia","capital letters","capitals","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","tobago","tonga","upper case","uppercase","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-c58bdbfb","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","invert case","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","swap case","tobago","toggle case","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-86c56a29","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","normalise","normalize","nth","pakistan","panama","position","republic","rwanda","samoa","shortest","shortest one","shortest word","simplify the text","slovakia","spain","sudan","suriname","tobago","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-005a13d6","guard":[["hasAny",["appears in","contains","element","includes","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.yesNo",["compare.contains",["sense.before",{"lit":"of"}],["sense.lastWord"]],["render.template",{"lit":["The official ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-c1760dcb","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]],["has","official"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"alpha 2"}],{"lit":1}]]],"mem":null},
{"id":"n-607186aa","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","finland","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-f38a7765","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","finland","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-5654e301","guard":[["hasAny",["africa","algeria","bahamas","belarus","brazil","cambodia","chile","comoros","costa","côte","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","islands","italy","item number","kenya","kingdom","kuwait","latvia","lebanon","leone","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","normalise","normalize","nth","pakistan","panama","position","rwanda","samoa","shortest","shortest one","shortest word","simplify the text","slovakia","spain","sudan","suriname","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-ac69cfe0","guard":[["has","name"],["has","official"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the name Guatemala":"The official name of Guatemala is Republic of Guatemala.","Uruguay":"The official name of Uruguay is Eastern Republic of Uruguay.","Trinidad and Tobago":"The official name of Trinidad and Tobago is Republic of Trinidad and Tobago.","Mauritania":"The official name of Mauritania is Islamic Republic of Mauritania.","the name Azerbaijan":"The official name of Azerbaijan is Republic of Azerbaijan.","the name Guinea":"The official name of Guinea is Republic of Guinea.","Chile":"The official name of Chile is Republic of Chile.","the name United Kingdom":"The official name of United Kingdom is United Kingdom of Great Britain and Northern Ireland.","the name Sudan":"The official name of Sudan is Republic of the Sudan.","Algeria":"The official name of Algeria is People's Democratic Republic of Algeria.","Pakistan":"The official name of Pakistan is Islamic Republic of Pakistan.","the name Eritrea":"The official name of Eritrea is the State of Eritrea.","South Africa":"The official name of South Africa is Republic of South Africa.","Vanuatu":"The official name of Vanuatu is Republic of Vanuatu.","the name Equatorial Guinea":"The official name of Equatorial Guinea is Republic of Equatorial Guinea.","the name Honduras":"The official name of Honduras is Republic of Honduras.","the name Côte d'Ivoire":"The official name of Côte d'Ivoire is Republic of Côte d'Ivoire.","Comoros":"The official name of Comoros is Union of the Comoros.","the name Cambodia":"The official name of Cambodia is Kingdom of Cambodia.","the name Nigeria":"The official name of Nigeria is Federal Republic of Nigeria.","Finland":"The official name of Finland is Republic of Finland.","the name Macao":"The official name of Macao is Macao Special Administrative Region of China.","the name Mexico":"The official name of Mexico is United Mexican States.","the name Papua New Guinea":"The official name of Papua New Guinea is Independent State of Papua New Guinea.","the name Germany":"The official name of Germany is Federal Republic of Germany.","the name Kuwait":"The official name of Kuwait is State of Kuwait.","Madagascar":"The official name of Madagascar is Republic of Madagascar.","Suriname":"The official name of Suriname is Republic of Suriname.","Virgin Islands, British":"The official name of Virgin Islands, British is British Virgin Islands.","the name Iraq":"The official name of Iraq is Republic of Iraq.","the name India":"The official name of India is Republic of India.","the name Kyrgyzstan":"The official name of Kyrgyzstan is Kyrgyz Republic.","Myanmar":"The official name of Myanmar is Republic of Myanmar.","Iran, Islamic Republic of":"The official name of Iran, Islamic Republic of is Islamic Republic of Iran.","the name Guinea-Bissau":"The official name of Guinea-Bissau is Republic of Guinea-Bissau.","Argentina":"The official name of Argentina is Argentine Republic.","Egypt":"The official name of Egypt is Arab Republic of Egypt.","the name Costa Rica":"The official name of Costa Rica is Republic of Costa Rica.","Denmark":"The official name of Denmark is Kingdom of Denmark.","Lebanon":"The official name of Lebanon is Lebanese Republic.","Samoa":"The official name of Samoa is Independent State of Samoa.","the name Iceland":"The official name of Iceland is Republic of Iceland.","Belarus":"The official name of Belarus is Republic of Belarus.","the name Italy":"The official name of Italy is Italian Republic.","Niger":"The official name of Niger is Republic of the Niger.","Seychelles":"The official name of Seychelles is Republic of Seychelles."}}},
{"id":"n-865fa992","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-e42853dc","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-0f1bac0b","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-2a8382ce","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","invert case","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","swap case","tobago","toggle case","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-59fc727e","guard":[["hasAny",["africa","algeria","all caps","argentina","azerbaijan","belarus","british","cambodia","capital letters","capitals","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","tobago","upper case","uppercase","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-6383b0a3","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","lower case","lowercase","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","small letters","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-88eb4112","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","capitalise","capitalize","capitalize each word","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","title case","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-849a6a55","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","capitalise","capitalize","capitalize each word","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","title case","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-8ee8b1bf","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","invert case","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","swap case","tobago","toggle case","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-c91aa3e3","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","lower case","lowercase","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","small letters","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-dfb871e6","guard":[["hasAny",["africa","algeria","all caps","argentina","azerbaijan","belarus","british","cambodia","capital letters","capitals","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","tobago","upper case","uppercase","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-123934f7","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","normalise","normalize","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","simplify the text","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-ae133018","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","join","joined with","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","separated by","seychelles","shortest","shortest one","shortest word","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.join",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"alpha 2"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-257f6cd5","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iran","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","separate by","seychelles","shortest","shortest one","shortest word","split","split by","sudan","suriname","tobago","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"alpha 2"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-c2c5f2e4","guard":[["hasAny",["africa","algeria","argentina","azerbaijan","belarus","british","cambodia","chile","comoros","costa","côte","denmark","egypt","element","equatorial","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","normalise","normalize","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","simplify the text","sudan","suriname","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-09cc0638","guard":[["hasAny",["algeria","bahamas","belarus","brazil","cambodia","chile","comoros","denmark","egypt","element","eritrea","eswatini","finland","germany","honduras","iceland","india","iraq","italy","item number","kenya","kuwait","latvia","lebanon","longest","longest one","longest word","macao","mexico","myanmar","niger","nigeria","nth","pakistan","panama","position","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","sudan","suriname","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-8861674a","guard":[["hasAny",["algeria","argentina","azerbaijan","belarus","cambodia","chile","comoros","dashes","denmark","egypt","element","eritrea","finland","germany","guatemala","guineabissau","honduras","hyphens","iceland","india","iraq","italy","item number","kebab case","kebabcase","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","slug","sudan","suriname","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-ad121885","guard":[["hasAny",["algeria","argentina","azerbaijan","belarus","cambodia","chile","comoros","denmark","egypt","element","eritrea","finland","germany","guatemala","guineabissau","honduras","iceland","india","iraq","italy","item number","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","reverse the words","reverse word order","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","uruguay","vanuatu","words backwards"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-84abd33c","guard":[["hasAny",["algeria","argentina","azerbaijan","belarus","cambodia","chile","comoros","denmark","egypt","element","eritrea","finland","germany","guatemala","honduras","iceland","india","iraq","italy","item number","kuwait","kyrgyzstan","lebanon","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","sudan","suriname","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-27d96bf9","guard":[["hasAny",["algeria","argentina","azerbaijan","belarus","cambodia","chile","comoros","denmark","egypt","element","eritrea","finland","germany","guatemala","honduras","iceland","india","iraq","italy","item number","kuwait","kyrgyzstan","lebanon","lower case","lowercase","macao","madagascar","mauritania","mexico","myanmar","niger","nigeria","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","small letters","sudan","suriname","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-7614174d","guard":[["hasAny",["algeria","bahamas","belarus","brazil","chile","comoros","denmark","egypt","element","eswatini","finland","item number","kenya","latvia","lebanon","longest","longest one","longest word","myanmar","niger","nth","pakistan","panama","position","rwanda","samoa","shortest","shortest one","shortest word","slovakia","spain","suriname","tonga","uruguay","vanuatu","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-8054535c","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The official ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-05e86fac","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-1ac5bcaa","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-002c87cd","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-1718d785","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","invert case","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan","swap case","toggle case"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-33b88e6c","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lower case","lowercase","macao","mexico","nigeria","nth","position","small letters","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-7f76ac70","guard":[["hasAny",["azerbaijan","cambodia","capitalise","capitalize","capitalize each word","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan","title case"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-e3d7b1f6","guard":[["hasAny",["all caps","azerbaijan","cambodia","capital letters","capitals","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan","upper case","uppercase"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-04bc9e58","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","lower case","lowercase","macao","mexico","nigeria","nth","position","small letters","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-2e9af8ba","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","invert case","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan","swap case","toggle case"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-3b7a6851","guard":[["hasAny",["azerbaijan","cambodia","capitalise","capitalize","capitalize each word","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan","title case"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-52d50820","guard":[["hasAny",["all caps","azerbaijan","cambodia","capital letters","capitals","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","nth","position","sudan","upper case","uppercase"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-9d2e5dd8","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","normalise","normalize","nth","position","simplify the text","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-f1595121","guard":[["hasAny",["azerbaijan","cambodia","costa","côte","element","eritrea","germany","guatemala","guinea","guineabissau","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","kyrgyzstan","macao","mexico","nigeria","normalise","normalize","nth","position","simplify the text","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-7d841f37","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the official name of Uruguay":"The official name of Uruguay is Eastern Republic of Uruguay.","the official name of Trinidad and Tobago":"The official name of Trinidad and Tobago is Republic of Trinidad and Tobago.","the official name of Mauritania":"The official name of Mauritania is Islamic Republic of Mauritania.","the official name of Chile":"The official name of Chile is Republic of Chile.","the official name of Algeria":"The official name of Algeria is People's Democratic Republic of Algeria.","the official name of Pakistan":"The official name of Pakistan is Islamic Republic of Pakistan.","the official name of South Africa":"The official name of South Africa is Republic of South Africa.","the official name of Vanuatu":"The official name of Vanuatu is Republic of Vanuatu.","the official name of Comoros":"The official name of Comoros is Union of the Comoros.","the official name of Finland":"The official name of Finland is Republic of Finland.","the official name of Madagascar":"The official name of Madagascar is Republic of Madagascar.","the official name of Suriname":"The official name of Suriname is Republic of Suriname.","the official name of Virgin Islands, British":"The official name of Virgin Islands, British is British Virgin Islands.","the official name of Myanmar":"The official name of Myanmar is Republic of Myanmar.","the official name of Iran, Islamic Republic of":"The official name of Iran, Islamic Republic of is Islamic Republic of Iran.","the official name of Argentina":"The official name of Argentina is Argentine Republic.","the official name of Egypt":"The official name of Egypt is Arab Republic of Egypt.","the official name of Denmark":"The official name of Denmark is Kingdom of Denmark.","the official name of Lebanon":"The official name of Lebanon is Lebanese Republic.","the official name of Samoa":"The official name of Samoa is Independent State of Samoa.","the official name of Belarus":"The official name of Belarus is Republic of Belarus.","the official name of Niger":"The official name of Niger is Republic of the Niger.","the official name of Seychelles":"The official name of Seychelles is Republic of Seychelles."}}},
{"id":"n-5e3a605e","guard":[["hasAny",["algeria","argentina","belarus","chile","comoros","denmark","egypt","element","finland","item number","lebanon","madagascar","mauritania","myanmar","niger","nth","pakistan","position","samoa","seychelles","shortest","shortest one","shortest word","suriname","uruguay","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-73752566","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-1dcd1ef1","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-afeaf88d","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-3ffb851f","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-4e81b598","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","invert case","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","swap case","toggle case","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-67b115f9","guard":[["hasAny",["all caps","bahamas","brazil","capital letters","capitals","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","tonga","upper case","uppercase","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-8fe193cb","guard":[["hasAny",["bahamas","brazil","capitalise","capitalize","capitalize each word","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","title case","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-923287d1","guard":[["hasAny",["bahamas","brazil","class name","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","pascal case","pascalcase","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","tonga","upper camel case","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-9f0bf785","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","invert case","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","swap case","toggle case","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-bacb07e5","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-c391cb70","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","leone","lower case","lowercase","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","small letters","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]]],"mem":null},
{"id":"n-0838d053","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","leone","lower case","lowercase","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","small letters","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-1ae48bca","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","invert case","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","swap case","toggle case","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-72557bf8","guard":[["hasAny",["bahamas","brazil","each word","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","split into words","tonga","words","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-85c6452e","guard":[["hasAny",["bahamas","brazil","each word","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","split into words","tonga","words","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-b08cda98","guard":[["hasAny",["bahamas","brazil","capitalise","capitalize","capitalize each word","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","title case","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-df4e3f91","guard":[["hasAny",["all caps","bahamas","brazil","capital letters","capitals","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","tonga","upper case","uppercase","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-285a5a03","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","moldova","normalise","normalize","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","simplify the text","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-f243225b","guard":[["has","name"],["has","official"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"Philippines":"The official name of Philippines is Republic of the Philippines.","Panama":"The official name of Panama is Republic of Panama.","Bahamas":"The official name of Bahamas is Commonwealth of the Bahamas.","Kenya":"The official name of Kenya is Republic of Kenya.","Rwanda":"The official name of Rwanda is Rwandese Republic.","Brazil":"The official name of Brazil is Federative Republic of Brazil.","North Macedonia":"The official name of North Macedonia is Republic of North Macedonia.","Latvia":"The official name of Latvia is Republic of Latvia.","Slovakia":"The official name of Slovakia is Slovak Republic.","Indonesia":"The official name of Indonesia is Republic of Indonesia.","Yemen":"The official name of Yemen is Republic of Yemen.","Tonga":"The official name of Tonga is Kingdom of Tonga.","Marshall Islands":"The official name of Marshall Islands is Republic of the Marshall Islands.","Mauritius":"The official name of Mauritius is Republic of Mauritius.","Eswatini":"The official name of Eswatini is Kingdom of Eswatini.","Spain":"The official name of Spain is Kingdom of Spain.","Sierra Leone":"The official name of Sierra Leone is Republic of Sierra Leone.","Moldova, Republic of":"The official name of Moldova, Republic of is Republic of Moldova."}}},
{"id":"n-80e763ab","guard":[["hasAny",["cambodia","costa","côte","element","eritrea","germany","honduras","iceland","india","iraq","italy","item number","kingdom","kuwait","longest","longest one","longest word","macao","mexico","new","nigeria","nth","position","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-1955f604","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","leone","macedonia","marshall","mauritius","normalise","normalize","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","simplify the text","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-173f7b88","guard":[["hasAny",["bahamas","brazil","element","eswatini","islands","item number","kenya","latvia","leone","longest","longest one","longest word","moldova","nth","panama","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-265acd1a","guard":[["hasAny",["bahamas","brazil","element","eswatini","islands","item number","kenya","latvia","leone","longest","longest one","longest word","lower case","lowercase","moldova","nth","panama","position","rwanda","shortest","shortest one","shortest word","slovakia","small letters","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-2892f577","guard":[["hasAny",["bahamas","brazil","element","eswatini","indonesia","item number","kenya","latvia","mauritius","nth","panama","philippines","position","rwanda","shortest","shortest one","shortest word","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-972ba439","guard":[["hasAny",["bahamas","brazil","element","eswatini","item number","kenya","latvia","leone","longest","longest one","longest word","marshall","moldova","nth","panama","position","rwanda","slovakia","spain","tonga","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-3083e2d3","guard":[["hasAny",["argentina","british","delete","element","italy","item number","kyrgyzstan","lebanon","mexico","nth","position","remove","republic","rwanda","slovakia","strip out","without"]],["has","official"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-871a9c60","guard":[["hasAny",["argentina","british","element","italy","item number","kyrgyzstan","lebanon","mexico","nth","position","republic","rwanda","separate by","slovakia","split","split by"]],["has","official"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-d52eb84a","guard":[["hasAny",["argentina","british","element","italy","item number","kyrgyzstan","lebanon","mexico","normalise","normalize","nth","position","rwanda","simplify the text","slovakia"]],["has","official"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],{"lit":2}]],"mem":null},
{"id":"n-291e1f0f","guard":[["hasAny",["argentina","azerbaijan","element","guatemala","guineabissau","item number","kyrgyzstan","longest","longest one","longest word","madagascar","mauritania","nth","position","seychelles","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-01888ead","guard":[["hasAny",["argentina","element","italy","item number","kyrgyzstan","lebanon","mexico","nth","position","rwanda","separate by","slovakia","split","split by"]],["has","official"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-64d828f4","guard":[["hasAny",["argentina","delete","element","italy","item number","kyrgyzstan","lebanon","mexico","nth","position","remove","rwanda","slovakia","strip out","without"]],["has","official"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-a67bb94a","guard":[["hasAny",["argentina","element","italy","item number","kyrgyzstan","lebanon","mexico","nth","position","rwanda","separate by","slovakia","split","split by"]],["has","official"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-f1b47fa2","guard":[["hasAny",["argentina","element","italy","item number","kyrgyzstan","lebanon","mexico","nth","position","rwanda","separate by","slovakia","split","split by"]],["has","official"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-441c29e0","guard":[["hasAny",["argentina","element","italy","item number","kyrgyzstan","lebanon","normalise","normalize","nth","position","simplify the text"]],["has","official"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],{"lit":3}]],"mem":null},
{"id":"n-c3b9d72c","guard":[["hasAny",["element","indonesia","item number","longest","longest one","longest word","mauritius","nth","philippines","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-0d02bad4","guard":[["hasAny",["longest","longest one","longest word","shortest","shortest one","shortest word","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Yemen."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-29ef6bc0","guard":[["hasAny",["brazil","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Federative Republic of Brazil."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-2f3218e2","guard":[["hasAny",["leone","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Sierra Leone."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-4b25af89","guard":[["hasAny",["mauritius","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Mauritius."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-607d7c36","guard":[["hasAny",["longest","longest one","longest word","shortest","shortest one","shortest word","spain"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kingdom of Spain."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-61683025","guard":[["hasAny",["longest","longest one","longest word","marshall","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of the Marshall Islands."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-649dd91a","guard":[["hasAny",["indonesia","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Indonesia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-6d895358","guard":[["hasAny",["longest","longest one","longest word","panama","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Panama."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-76c932ba","guard":[["hasAny",["longest","longest one","longest word","moldova","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Moldova."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-830fd288","guard":[["hasAny",["philippines","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of the Philippines."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-9210aa1e","guard":[["hasAny",["kenya","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Kenya."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-93970638","guard":[["hasAny",["longest","longest one","longest word","rwanda","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Rwandese Republic."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-a0f13b07","guard":[["hasAny",["macedonia","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of North Macedonia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-cb7c13de","guard":[["hasAny",["longest","longest one","longest word","shortest","shortest one","shortest word","tonga"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kingdom of Tonga."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-cfa0fc72","guard":[["hasAny",["longest","longest one","longest word","shortest","shortest one","shortest word","slovakia"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Slovak Republic."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-d6a3f62b","guard":[["hasAny",["eswatini","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kingdom of Eswatini."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-d9b4f921","guard":[["hasAny",["bahamas","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Commonwealth of the Bahamas."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-fe0cb3ad","guard":[["hasAny",["latvia","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Latvia."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-04c266d6","guard":[["hasAny",["element","item number","mauritania","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Islamic Republic of Mauritania."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-1ae0688d","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","uruguay"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eastern Republic of Uruguay."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-2061b7fd","guard":[["hasAny",["argentina","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Argentine Republic."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-2e7d5875","guard":[["hasAny",["comoros","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Union of the Comoros."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-385e1476","guard":[["hasAny",["element","item number","nth","position","seychelles","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Seychelles."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-3a08485f","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","suriname"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Suriname."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-3a4cd102","guard":[["hasAny",["element","eritrea","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is the State of Eritrea."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-45dd961f","guard":[["hasAny",["element","guineabissau","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Guinea-Bissau."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-4a81b456","guard":[["hasAny",["costa","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Costa Rica."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-4b6c756e","guard":[["hasAny",["element","item number","lebanon","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Lebanese Republic."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-4da0c025","guard":[["hasAny",["element","item number","nth","position","samoa","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Independent State of Samoa."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-550e0cee","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tobago"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Trinidad and Tobago."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-5f2854cb","guard":[["hasAny",["element","honduras","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Honduras."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-62651bc1","guard":[["hasAny",["element","item number","niger","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of the Niger."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-6a30432b","guard":[["hasAny",["cambodia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kingdom of Cambodia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-6e43a75b","guard":[["hasAny",["element","guatemala","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Guatemala."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-6fc9a085","guard":[["hasAny",["element","iran","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Islamic Republic of Iran."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-7563f0f3","guard":[["hasAny",["british","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is British Virgin Islands."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-7b65962d","guard":[["hasAny",["africa","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of South Africa."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-9159a2dd","guard":[["hasAny",["element","germany","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Federal Republic of Germany."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-a04c5b02","guard":[["hasAny",["element","iraq","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Iraq."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-a4de51d1","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of the Sudan."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-a57b9664","guard":[["hasAny",["element","item number","nth","pakistan","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Islamic Republic of Pakistan."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-a6fb2e7d","guard":[["hasAny",["côte","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Côte d'Ivoire."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-ae1bc2ee","guard":[["hasAny",["azerbaijan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Azerbaijan."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-b108bb14","guard":[["hasAny",["element","india","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of India."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-b4ecae50","guard":[["hasAny",["chile","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Chile."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-b6727948","guard":[["hasAny",["denmark","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kingdom of Denmark."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-b9cb4cfb","guard":[["hasAny",["algeria","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is People's Democratic Republic of Algeria."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-c1c0d9b6","guard":[["hasAny",["egypt","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Arab Republic of Egypt."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-c5b4347c","guard":[["hasAny",["element","item number","mexico","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is United Mexican States."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-cafece61","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Vanuatu."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-cc0d69cd","guard":[["hasAny",["belarus","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Belarus."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-d18a7c93","guard":[["hasAny",["element","item number","kyrgyzstan","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kyrgyz Republic."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-d3782ed8","guard":[["hasAny",["element","iceland","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Iceland."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-dafa2403","guard":[["hasAny",["element","italy","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Italian Republic."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-e2caf5ab","guard":[["hasAny",["element","item number","macao","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Macao Special Administrative Region of China."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-e94c78f3","guard":[["hasAny",["element","item number","nigeria","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Federal Republic of Nigeria."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-f5007b30","guard":[["hasAny",["element","finland","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Finland."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-f611380e","guard":[["hasAny",["element","item number","kingdom","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is United Kingdom of Great Britain and Northern Ireland."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-f74bea7d","guard":[["hasAny",["element","item number","madagascar","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Madagascar."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-f7998533","guard":[["hasAny",["element","item number","myanmar","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Myanmar."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-ff1c67be","guard":[["hasAny",["element","item number","kuwait","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is State of Kuwait."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-ff73cc53","guard":[["hasAny",["element","equatorial","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Republic of Equatorial Guinea."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-2af1c369","guard":[["hasAny",["element","item number","new","nth","position"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Independent State of Papua New Guinea."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}]]],"mem":null},
{"id":"n-106e99af","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","slovakia"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Slovakia is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-1a411662","guard":[["hasAny",["element","item number","nth","philippines","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Philippines is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-1a7cdb6f","guard":[["hasAny",["element","item number","mauritius","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mauritius is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-2c34aa32","guard":[["hasAny",["element","item number","kenya","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kenya is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-2f485c88","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","panama","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Panama is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-31e9d4a5","guard":[["hasAny",["element","indonesia","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Indonesia is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-3f662e0f","guard":[["hasAny",["element","eswatini","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Eswatini is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-41fe967e","guard":[["hasAny",["brazil","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Brazil is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-5238ebdb","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","spain"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Spain is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-59a3f614","guard":[["hasAny",["bahamas","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Bahamas is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-64eb4083","guard":[["hasAny",["element","item number","longest","longest one","longest word","marshall","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Marshall Islands is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-7e68b24c","guard":[["hasAny",["element","item number","longest","longest one","longest word","moldova","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Moldova, Republic of is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-a808dee7","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","yemen"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Yemen is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-c8eb4a61","guard":[["hasAny",["element","item number","leone","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sierra Leone is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-df4c1469","guard":[["hasAny",["element","item number","macedonia","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of North Macedonia is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-e8714572","guard":[["hasAny",["element","item number","latvia","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Latvia is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-f12aac2b","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","rwanda","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Rwanda is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-fcb6a270","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","tonga"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tonga is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-05b6b515","guard":[["hasAny",["element","item number","mauritania","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mauritania is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-06e27f4b","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","suriname"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Suriname is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-07569542","guard":[["hasAny",["belarus","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Belarus is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-0a660c8a","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","sudan"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sudan is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-10be6cfa","guard":[["hasAny",["element","finland","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Finland is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-1f88bb6b","guard":[["hasAny",["element","item number","madagascar","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Madagascar is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-24bf0ac2","guard":[["hasAny",["element","item number","niger","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Niger is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-2c2462ea","guard":[["hasAny",["element","iraq","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Iraq is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-3103f8d9","guard":[["hasAny",["comoros","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Comoros is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-340f9ecc","guard":[["hasAny",["element","item number","macao","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Macao is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-3610a96e","guard":[["hasAny",["element","guineabissau","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Guinea-Bissau is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-361af4fb","guard":[["hasAny",["element","eritrea","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Eritrea is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-367ea7b2","guard":[["hasAny",["element","germany","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Germany is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-3852a993","guard":[["hasAny",["costa","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Costa Rica is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-47b71dba","guard":[["hasAny",["element","guatemala","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Guatemala is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-49696d8f","guard":[["hasAny",["element","item number","lebanon","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lebanon is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-4b3f40a7","guard":[["hasAny",["element","iceland","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Iceland is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-4def7916","guard":[["hasAny",["côte","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Côte d'Ivoire is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-4e7db5c6","guard":[["hasAny",["element","item number","nth","pakistan","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Pakistan is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-53fa9c00","guard":[["hasAny",["chile","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Chile is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-5c2c4b58","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","uruguay"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Uruguay is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-5e78520a","guard":[["hasAny",["element","equatorial","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Equatorial Guinea is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-5fb108f5","guard":[["hasAny",["egypt","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Egypt is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-642d2d39","guard":[["hasAny",["element","item number","nth","position","seychelles","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Seychelles is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-6bcb512c","guard":[["hasAny",["argentina","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Argentina is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-6c3d5c51","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","vanuatu"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Vanuatu is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-70d178f4","guard":[["hasAny",["denmark","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Denmark is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-75b8a7f0","guard":[["hasAny",["element","iran","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Iran, Islamic Republic of is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-813d2cc5","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tobago"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Trinidad and Tobago is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-8792a4cb","guard":[["hasAny",["element","item number","nth","position","samoa","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Samoa is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-8882450b","guard":[["hasAny",["element","italy","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Italy is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-89d29c2a","guard":[["hasAny",["azerbaijan","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Azerbaijan is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-8bac8d42","guard":[["hasAny",["element","item number","kuwait","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kuwait is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-8c316ca9","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]],["has","official"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"alpha 3"}],{"lit":1}]]],"mem":null},
{"id":"n-93626f6e","guard":[["hasAny",["algeria","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Algeria is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-99d5e903","guard":[["hasAny",["element","india","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of India is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-9fc45dd3","guard":[["hasAny",["element","item number","kyrgyzstan","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kyrgyzstan is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-a31576b8","guard":[["hasAny",["element","honduras","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Honduras is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-a44ed351","guard":[["hasAny",["element","item number","myanmar","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Myanmar is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-b370e9d0","guard":[["hasAny",["africa","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of South Africa is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-b99803d5","guard":[["hasAny",["element","item number","nigeria","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Nigeria is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-d9148924","guard":[["hasAny",["cambodia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Cambodia is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-e1368bd9","guard":[["hasAny",["element","item number","kingdom","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of United Kingdom is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-f9dfa959","guard":[["hasAny",["british","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Virgin Islands, British is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-f9f40e82","guard":[["hasAny",["element","item number","mexico","nth","position","shortest","shortest one","shortest word"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mexico is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-8e0ec2bc","guard":[["hasAny",["element","item number","new","nth","position"]],["has","official"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Papua New Guinea is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-countries-585efe"},{"lit":"name"},{"lit":"official name"}]],"mem":null},
{"id":"n-105d45ab","guard":[["hasAny",["myanmar","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Myanmar":"The official name of Myanmar is Republic of Myanmar."}}},
{"id":"n-1670a394","guard":[["hasAny",["belarus","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Belarus":"The official name of Belarus is Republic of Belarus."}}},
{"id":"n-271fd1fc","guard":[["hasAny",["british","islands","name","official","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Virgin Islands, British":"The official name of Virgin Islands, British is British Virgin Islands."}}},
{"id":"n-3677a77e","guard":[["hasAny",["name","niger","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Niger":"The official name of Niger is Republic of the Niger."}}},
{"id":"n-3ecf8483","guard":[["hasAny",["azerbaijan","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Azerbaijan":"The official name of Azerbaijan is Republic of Azerbaijan."}}},
{"id":"n-3f2ddcc1","guard":[["hasAny",["iceland","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Iceland":"The official name of Iceland is Republic of Iceland."}}},
{"id":"n-42627b57","guard":[["hasAny",["africa","name","official","south"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of South Africa":"The official name of South Africa is Republic of South Africa."}}},
{"id":"n-44df5c4d","guard":[["hasAny",["equatorial","guinea","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Equatorial Guinea":"The official name of Equatorial Guinea is Republic of Equatorial Guinea."}}},
{"id":"n-451f19a3","guard":[["hasAny",["cambodia","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Cambodia":"The official name of Cambodia is Kingdom of Cambodia."}}},
{"id":"n-469a92b6","guard":[["hasAny",["iran","islamic","name","official","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Iran, Islamic Republic of":"The official name of Iran, Islamic Republic of is Islamic Republic of Iran."}}},
{"id":"n-488a4065","guard":[["hasAny",["guinea","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Guinea":"The official name of Guinea is Republic of Guinea."}}},
{"id":"n-4970464e","guard":[["hasAny",["egypt","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Egypt":"The official name of Egypt is Arab Republic of Egypt."}}},
{"id":"n-4c32110d","guard":[["hasAny",["islands","marshall","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Marshall Islands":"The official name of Marshall Islands is Republic of the Marshall Islands."}}},
{"id":"n-50149fc8","guard":[["hasAny",["lebanon","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Lebanon":"The official name of Lebanon is Lebanese Republic."}}},
{"id":"n-52460258","guard":[["hasAny",["guinea","name","new","official","papua"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Papua New Guinea":"The official name of Papua New Guinea is Independent State of Papua New Guinea."}}},
{"id":"n-533d91b9","guard":[["hasAny",["indonesia","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Indonesia":"The official name of Indonesia is Republic of Indonesia."}}},
{"id":"n-57e6d184","guard":[["hasAny",["côte","divoire","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Côte d'Ivoire":"The official name of Côte d'Ivoire is Republic of Côte d'Ivoire."}}},
{"id":"n-5d7ea219","guard":[["hasAny",["kingdom","name","official","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name United Kingdom":"The official name of United Kingdom is United Kingdom of Great Britain and Northern Ireland."}}},
{"id":"n-6111adb5","guard":[["hasAny",["moldova","name","official","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Moldova, Republic of":"The official name of Moldova, Republic of is Republic of Moldova."}}},
{"id":"n-627482a5","guard":[["hasAny",["name","official","vanuatu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Vanuatu":"The official name of Vanuatu is Republic of Vanuatu."}}},
{"id":"n-63274582","guard":[["hasAny",["kyrgyzstan","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Kyrgyzstan":"The official name of Kyrgyzstan is Kyrgyz Republic."}}},
{"id":"n-63566e5c","guard":[["hasAny",["italy","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Italy":"The official name of Italy is Italian Republic."}}},
{"id":"n-6913181c","guard":[["hasAny",["mauritius","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Mauritius":"The official name of Mauritius is Republic of Mauritius."}}},
{"id":"n-69dd9ba0","guard":[["hasAny",["mauritania","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Mauritania":"The official name of Mauritania is Islamic Republic of Mauritania."}}},
{"id":"n-740680e7","guard":[["hasAny",["name","official","rwanda"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Rwanda":"The official name of Rwanda is Rwandese Republic."}}},
{"id":"n-74c07fbd","guard":[["hasAny",["kuwait","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Kuwait":"The official name of Kuwait is State of Kuwait."}}},
{"id":"n-75a5b4ac","guard":[["hasAny",["mexico","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Mexico":"The official name of Mexico is United Mexican States."}}},
{"id":"n-77e4afab","guard":[["hasAny",["name","official","slovakia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Slovakia":"The official name of Slovakia is Slovak Republic."}}},
{"id":"n-7e35e289","guard":[["hasAny",["argentina","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Argentina":"The official name of Argentina is Argentine Republic."}}},
{"id":"n-7f63a7c8","guard":[["hasAny",["name","official","samoa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Samoa":"The official name of Samoa is Independent State of Samoa."}}},
{"id":"n-85ab33c3","guard":[["hasAny",["india","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name India":"The official name of India is Republic of India."}}},
{"id":"n-895c8376","guard":[["hasAny",["madagascar","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Madagascar":"The official name of Madagascar is Republic of Madagascar."}}},
{"id":"n-8c725ea9","guard":[["hasAny",["brazil","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Brazil":"The official name of Brazil is Federative Republic of Brazil."}}},
{"id":"n-8d1a10a9","guard":[["hasAny",["name","official","spain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Spain":"The official name of Spain is Kingdom of Spain."}}},
{"id":"n-92049d27","guard":[["hasAny",["name","official","pakistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Pakistan":"The official name of Pakistan is Islamic Republic of Pakistan."}}},
{"id":"n-92fa2c17","guard":[["hasAny",["eritrea","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Eritrea":"The official name of Eritrea is the State of Eritrea."}}},
{"id":"n-99058146","guard":[["hasAny",["name","nigeria","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Nigeria":"The official name of Nigeria is Federal Republic of Nigeria."}}},
{"id":"n-9d2a90b4","guard":[["hasAny",["chile","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Chile":"The official name of Chile is Republic of Chile."}}},
{"id":"n-a3ec09e4","guard":[["hasAny",["name","official","seychelles"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Seychelles":"The official name of Seychelles is Republic of Seychelles."}}},
{"id":"n-a4732163","guard":[["hasAny",["name","official","tonga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Tonga":"The official name of Tonga is Kingdom of Tonga."}}},
{"id":"n-acc8cd73","guard":[["hasAny",["macao","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Macao":"The official name of Macao is Macao Special Administrative Region of China."}}},
{"id":"n-ae166d1c","guard":[["hasAny",["algeria","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Algeria":"The official name of Algeria is People's Democratic Republic of Algeria."}}},
{"id":"n-b0559455","guard":[["hasAny",["name","official","yemen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Yemen":"The official name of Yemen is Republic of Yemen."}}},
{"id":"n-b2526813","guard":[["hasAny",["guatemala","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Guatemala":"The official name of Guatemala is Republic of Guatemala."}}},
{"id":"n-b761a79c","guard":[["hasAny",["eswatini","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Eswatini":"The official name of Eswatini is Kingdom of Eswatini."}}},
{"id":"n-b8df2dbe","guard":[["hasAny",["leone","name","official","sierra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Sierra Leone":"The official name of Sierra Leone is Republic of Sierra Leone."}}},
{"id":"n-bf431666","guard":[["hasAny",["name","official","sudan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Sudan":"The official name of Sudan is Republic of the Sudan."}}},
{"id":"n-c01fd971","guard":[["hasAny",["honduras","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Honduras":"The official name of Honduras is Republic of Honduras."}}},
{"id":"n-c0ab2d2d","guard":[["hasAny",["name","official","tobago","trinidad"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Trinidad and Tobago":"The official name of Trinidad and Tobago is Republic of Trinidad and Tobago."}}},
{"id":"n-c32552d2","guard":[["hasAny",["name","official","philippines"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Philippines":"The official name of Philippines is Republic of the Philippines."}}},
{"id":"n-c69e23e0","guard":[["hasAny",["costa","name","official","rica"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Costa Rica":"The official name of Costa Rica is Republic of Costa Rica."}}},
{"id":"n-d0440276","guard":[["hasAny",["kenya","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Kenya":"The official name of Kenya is Republic of Kenya."}}},
{"id":"n-d4eb347b","guard":[["hasAny",["name","official","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Uruguay":"The official name of Uruguay is Eastern Republic of Uruguay."}}},
{"id":"n-dd16ebd5","guard":[["hasAny",["latvia","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Latvia":"The official name of Latvia is Republic of Latvia."}}},
{"id":"n-ddec016b","guard":[["hasAny",["macedonia","name","north","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for North Macedonia":"The official name of North Macedonia is Republic of North Macedonia."}}},
{"id":"n-e31c3738","guard":[["hasAny",["iraq","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Iraq":"The official name of Iraq is Republic of Iraq."}}},
{"id":"n-ee143b41","guard":[["hasAny",["germany","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Germany":"The official name of Germany is Federal Republic of Germany."}}},
{"id":"n-f5865293","guard":[["hasAny",["finland","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Finland":"The official name of Finland is Republic of Finland."}}},
{"id":"n-f67ce7e3","guard":[["hasAny",["name","official","panama"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Panama":"The official name of Panama is Republic of Panama."}}},
{"id":"n-f74a4e89","guard":[["hasAny",["denmark","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Denmark":"The official name of Denmark is Kingdom of Denmark."}}},
{"id":"n-f750364c","guard":[["hasAny",["comoros","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Comoros":"The official name of Comoros is Union of the Comoros."}}},
{"id":"n-f7b71acd","guard":[["hasAny",["guineabissau","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Guinea-Bissau":"The official name of Guinea-Bissau is Republic of Guinea-Bissau."}}},
{"id":"n-f9996023","guard":[["hasAny",["name","official","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the official name of Suriname":"The official name of Suriname is Republic of Suriname."}}},
{"id":"n-ff92929f","guard":[["hasAny",["bahamas","name","official"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the official name for Bahamas":"The official name of Bahamas is Commonwealth of the Bahamas."}}},
{"id":"n-5a310a33","guard":[["has","name"],["has","official"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Philippines":"The official name of Philippines is Republic of the Philippines.","give the official name for Panama":"The official name of Panama is Republic of Panama.","tell me the official name of the name Guatemala":"The official name of Guatemala is Republic of Guatemala.","what is the official name of Uruguay":"The official name of Uruguay is Eastern Republic of Uruguay.","give the official name for Bahamas":"The official name of Bahamas is Commonwealth of the Bahamas.","what is the official name of Trinidad and Tobago":"The official name of Trinidad and Tobago is Republic of Trinidad and Tobago.","give the official name for Kenya":"The official name of Kenya is Republic of Kenya.","give the official name for Rwanda":"The official name of Rwanda is Rwandese Republic.","what is the official name of Mauritania":"The official name of Mauritania is Islamic Republic of Mauritania.","tell me the official name of the name Azerbaijan":"The official name of Azerbaijan is Republic of Azerbaijan.","tell me the official name of the name Guinea":"The official name of Guinea is Republic of Guinea.","what is the official name of Chile":"The official name of Chile is Republic of Chile.","tell me the official name of the name United Kingdom":"The official name of United Kingdom is United Kingdom of Great Britain and Northern Ireland.","tell me the official name of the name Sudan":"The official name of Sudan is Republic of the Sudan.","what is the official name of Algeria":"The official name of Algeria is People's Democratic Republic of Algeria.","what is the official name of Pakistan":"The official name of Pakistan is Islamic Republic of Pakistan.","tell me the official name of the name Eritrea":"The official name of Eritrea is the State of Eritrea.","what is the official name of South Africa":"The official name of South Africa is Republic of South Africa.","what is the official name of Vanuatu":"The official name of Vanuatu is Republic of Vanuatu.","give the official name for Brazil":"The official name of Brazil is Federative Republic of Brazil.","tell me the official name of the name Equatorial Guinea":"The official name of Equatorial Guinea is Republic of Equatorial Guinea.","tell me the official name of the name Honduras":"The official name of Honduras is Republic of Honduras.","give the official name for North Macedonia":"The official name of North Macedonia is Republic of North Macedonia.","tell me the official name of the name Côte d'Ivoire":"The official name of Côte d'Ivoire is Republic of Côte d'Ivoire.","what is the official name of Comoros":"The official name of Comoros is Union of the Comoros.","tell me the official name of the name Cambodia":"The official name of Cambodia is Kingdom of Cambodia.","tell me the official name of the name Nigeria":"The official name of Nigeria is Federal Republic of Nigeria.","what is the official name of Finland":"The official name of Finland is Republic of Finland.","give the official name for Latvia":"The official name of Latvia is Republic of Latvia.","give the official name for Slovakia":"The official name of Slovakia is Slovak Republic.","give the official name for Indonesia":"The official name of Indonesia is Republic of Indonesia.","give the official name for Yemen":"The official name of Yemen is Republic of Yemen.","tell me the official name of the name Macao":"The official name of Macao is Macao Special Administrative Region of China.","tell me the official name of the name Mexico":"The official name of Mexico is United Mexican States.","tell me the official name of the name Papua New Guinea":"The official name of Papua New Guinea is Independent State of Papua New Guinea.","tell me the official name of the name Germany":"The official name of Germany is Federal Republic of Germany.","tell me the official name of the name Kuwait":"The official name of Kuwait is State of Kuwait.","what is the official name of Madagascar":"The official name of Madagascar is Republic of Madagascar.","what is the official name of Suriname":"The official name of Suriname is Republic of Suriname.","give the official name for Tonga":"The official name of Tonga is Kingdom of Tonga.","what is the official name of Virgin Islands, British":"The official name of Virgin Islands, British is British Virgin Islands.","give the official name for Marshall Islands":"The official name of Marshall Islands is Republic of the Marshall Islands.","give the official name for Mauritius":"The official name of Mauritius is Republic of Mauritius.","tell me the official name of the name Iraq":"The official name of Iraq is Republic of Iraq.","tell me the official name of the name India":"The official name of India is Republic of India.","tell me the official name of the name Kyrgyzstan":"The official name of Kyrgyzstan is Kyrgyz Republic.","what is the official name of Myanmar":"The official name of Myanmar is Republic of Myanmar.","give the official name for Eswatini":"The official name of Eswatini is Kingdom of Eswatini.","what is the official name of Iran, Islamic Republic of":"The official name of Iran, Islamic Republic of is Islamic Republic of Iran.","tell me the official name of the name Guinea-Bissau":"The official name of Guinea-Bissau is Republic of Guinea-Bissau.","what is the official name of Argentina":"The official name of Argentina is Argentine Republic.","what is the official name of Egypt":"The official name of Egypt is Arab Republic of Egypt.","tell me the official name of the name Costa Rica":"The official name of Costa Rica is Republic of Costa Rica.","what is the official name of Denmark":"The official name of Denmark is Kingdom of Denmark.","what is the official name of Lebanon":"The official name of Lebanon is Lebanese Republic.","give the official name for Spain":"The official name of Spain is Kingdom of Spain.","give the official name for Sierra Leone":"The official name of Sierra Leone is Republic of Sierra Leone.","what is the official name of Samoa":"The official name of Samoa is Independent State of Samoa.","give the official name for Moldova, Republic of":"The official name of Moldova, Republic of is Republic of Moldova.","tell me the official name of the name Iceland":"The official name of Iceland is Republic of Iceland.","what is the official name of Belarus":"The official name of Belarus is Republic of Belarus.","tell me the official name of the name Italy":"The official name of Italy is Italian Republic.","what is the official name of Niger":"The official name of Niger is Republic of the Niger.","what is the official name of Seychelles":"The official name of Seychelles is Republic of Seychelles."}}},
{"id":"n-06b688ef","guard":[["has","panama"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Panama":"The official name of Panama is Republic of Panama."}}},
{"id":"n-0d6ee923","guard":[["has","slovakia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Slovakia":"The official name of Slovakia is Slovak Republic."}}},
{"id":"n-10aa7955","guard":[["has","macao"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Macao":"The official name of Macao is Macao Special Administrative Region of China."}}},
{"id":"n-110a33fe","guard":[["has","myanmar"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Myanmar":"The official name of Myanmar is Republic of Myanmar."}}},
{"id":"n-1caa8562","guard":[["has","egypt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Egypt":"The official name of Egypt is Arab Republic of Egypt."}}},
{"id":"n-1d1dddd0","guard":[["has","italy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Italy":"The official name of Italy is Italian Republic."}}},
{"id":"n-1e76bc7d","guard":[["has","samoa"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Samoa":"The official name of Samoa is Independent State of Samoa."}}},
{"id":"n-1fc95d40","guard":[["hasAny",["kingdom","name","official","united"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name United Kingdom":"The official name of United Kingdom is United Kingdom of Great Britain and Northern Ireland."}}},
{"id":"n-23676dcb","guard":[["hasAny",["british","virgin"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Virgin Islands, British":"The official name of Virgin Islands, British is British Virgin Islands."}}},
{"id":"n-2bc279b6","guard":[["hasAny",["africa","name","official","south"]],["has","official"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of South Africa":"The official name of South Africa is Republic of South Africa."}}},
{"id":"n-2fb1f23f","guard":[["has","philippines"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Philippines":"The official name of Philippines is Republic of the Philippines."}}},
{"id":"n-306ec074","guard":[["has","niger"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Niger":"The official name of Niger is Republic of the Niger."}}},
{"id":"n-31ca2160","guard":[["has","moldova"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Moldova, Republic of":"The official name of Moldova, Republic of is Republic of Moldova."}}},
{"id":"n-347d4dae","guard":[["has","yemen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Yemen":"The official name of Yemen is Republic of Yemen."}}},
{"id":"n-352a1f7c","guard":[["has","seychelles"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Seychelles":"The official name of Seychelles is Republic of Seychelles."}}},
{"id":"n-3aaefc38","guard":[["has","equatorial"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Equatorial Guinea":"The official name of Equatorial Guinea is Republic of Equatorial Guinea."}}},
{"id":"n-3e6f83a9","guard":[["has","chile"],["has","official"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Chile":"The official name of Chile is Republic of Chile."}}},
{"id":"n-444298c4","guard":[["has","iceland"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Iceland":"The official name of Iceland is Republic of Iceland."}}},
{"id":"n-492d7867","guard":[["has","belarus"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Belarus":"The official name of Belarus is Republic of Belarus."}}},
{"id":"n-4a0fd7df","guard":[["has","bahamas"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Bahamas":"The official name of Bahamas is Commonwealth of the Bahamas."}}},
{"id":"n-4b1cfd71","guard":[["has","kyrgyzstan"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Kyrgyzstan":"The official name of Kyrgyzstan is Kyrgyz Republic."}}},
{"id":"n-51a5751d","guard":[["has","mexico"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Mexico":"The official name of Mexico is United Mexican States."}}},
{"id":"n-520aab4f","guard":[["has","vanuatu"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Vanuatu":"The official name of Vanuatu is Republic of Vanuatu."}}},
{"id":"n-5a4efa35","guard":[["has","suriname"],["has","official"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Suriname":"The official name of Suriname is Republic of Suriname."}}},
{"id":"n-6117b98d","guard":[["has","denmark"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Denmark":"The official name of Denmark is Kingdom of Denmark."}}},
{"id":"n-63d8045e","guard":[["has","spain"],["has","official"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Spain":"The official name of Spain is Kingdom of Spain."}}},
{"id":"n-6a039c8f","guard":[["has","guineabissau"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Guinea-Bissau":"The official name of Guinea-Bissau is Republic of Guinea-Bissau."}}},
{"id":"n-73e33072","guard":[["has","algeria"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Algeria":"The official name of Algeria is People's Democratic Republic of Algeria."}}},
{"id":"n-74582939","guard":[["has","lebanon"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Lebanon":"The official name of Lebanon is Lebanese Republic."}}},
{"id":"n-760f97fb","guard":[["has","brazil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Brazil":"The official name of Brazil is Federative Republic of Brazil."}}},
{"id":"n-7c7719fc","guard":[["hasAny",["name","official","tobago","trinidad"]],["has","official"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Trinidad and Tobago":"The official name of Trinidad and Tobago is Republic of Trinidad and Tobago."}}},
{"id":"n-7caf22f1","guard":[["has","iraq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Iraq":"The official name of Iraq is Republic of Iraq."}}},
{"id":"n-7e1713d3","guard":[["has","tonga"],["has","official"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Tonga":"The official name of Tonga is Kingdom of Tonga."}}},
{"id":"n-7e23553f","guard":[["has","kuwait"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Kuwait":"The official name of Kuwait is State of Kuwait."}}},
{"id":"n-819439df","guard":[["has","nigeria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Nigeria":"The official name of Nigeria is Federal Republic of Nigeria."}}},
{"id":"n-876ec087","guard":[["has","eswatini"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Eswatini":"The official name of Eswatini is Kingdom of Eswatini."}}},
{"id":"n-8984057e","guard":[["has","sudan"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Sudan":"The official name of Sudan is Republic of the Sudan."}}},
{"id":"n-8b5a2b73","guard":[["has","uruguay"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Uruguay":"The official name of Uruguay is Eastern Republic of Uruguay."}}},
{"id":"n-8b82d53f","guard":[["has","mauritania"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Mauritania":"The official name of Mauritania is Islamic Republic of Mauritania."}}},
{"id":"n-999b1f6b","guard":[["has","finland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Finland":"The official name of Finland is Republic of Finland."}}},
{"id":"n-9c09312e","guard":[["has","honduras"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Honduras":"The official name of Honduras is Republic of Honduras."}}},
{"id":"n-9f691da1","guard":[["has","guatemala"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Guatemala":"The official name of Guatemala is Republic of Guatemala."}}},
{"id":"n-a260a5bf","guard":[["has","kenya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Kenya":"The official name of Kenya is Republic of Kenya."}}},
{"id":"n-a4ad1b9e","guard":[["has","argentina"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Argentina":"The official name of Argentina is Argentine Republic."}}},
{"id":"n-b28371f2","guard":[["hasAny",["côte","divoire","name","official"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Côte d'Ivoire":"The official name of Côte d'Ivoire is Republic of Côte d'Ivoire."}}},
{"id":"n-ba221e32","guard":[["has","pakistan"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Pakistan":"The official name of Pakistan is Islamic Republic of Pakistan."}}},
{"id":"n-cb321898","guard":[["has","india"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name India":"The official name of India is Republic of India."}}},
{"id":"n-cd2b3c61","guard":[["has","comoros"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Comoros":"The official name of Comoros is Union of the Comoros."}}},
{"id":"n-cfefeb4c","guard":[["has","indonesia"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Indonesia":"The official name of Indonesia is Republic of Indonesia."}}},
{"id":"n-da8f350f","guard":[["hasAny",["iran","islamic"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Iran, Islamic Republic of":"The official name of Iran, Islamic Republic of is Islamic Republic of Iran."}}},
{"id":"n-dccb698f","guard":[["has","mauritius"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Mauritius":"The official name of Mauritius is Republic of Mauritius."}}},
{"id":"n-deccbab0","guard":[["has","latvia"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Latvia":"The official name of Latvia is Republic of Latvia."}}},
{"id":"n-e31fb0fc","guard":[["hasAny",["macedonia","name","north","official"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for North Macedonia":"The official name of North Macedonia is Republic of North Macedonia."}}},
{"id":"n-e5d13c35","guard":[["has","germany"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Germany":"The official name of Germany is Federal Republic of Germany."}}},
{"id":"n-e69a88b3","guard":[["has","eritrea"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Eritrea":"The official name of Eritrea is the State of Eritrea."}}},
{"id":"n-e79716cc","guard":[["hasAny",["leone","name","official","sierra"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Sierra Leone":"The official name of Sierra Leone is Republic of Sierra Leone."}}},
{"id":"n-ea20d7b9","guard":[["hasAny",["costa","name","official","rica"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Costa Rica":"The official name of Costa Rica is Republic of Costa Rica."}}},
{"id":"n-ea3521b8","guard":[["has","azerbaijan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Azerbaijan":"The official name of Azerbaijan is Republic of Azerbaijan."}}},
{"id":"n-ec9e1364","guard":[["has","madagascar"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the official name of Madagascar":"The official name of Madagascar is Republic of Madagascar."}}},
{"id":"n-f361a3d2","guard":[["has","marshall"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Marshall Islands":"The official name of Marshall Islands is Republic of the Marshall Islands."}}},
{"id":"n-f7d0d832","guard":[["has","cambodia"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Cambodia":"The official name of Cambodia is Kingdom of Cambodia."}}},
{"id":"n-fa155eaa","guard":[["has","rwanda"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the official name for Rwanda":"The official name of Rwanda is Rwandese Republic."}}},
{"id":"n-fe5d69da","guard":[["hasAny",["new","papua"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the official name of the name Papua New Guinea":"The official name of Papua New Guinea is Independent State of Papua New Guinea."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"give the official name for Philippines","expect":{"contains":["Republic of the Philippines"],"notRefusal":true}},{"q":"give the official name for Panama","expect":{"contains":["Republic of Panama"],"notRefusal":true}},{"q":"tell me the official name of the name Guatemala","expect":{"contains":["Republic of Guatemala"],"notRefusal":true}},{"q":"what is the official name of Uruguay","expect":{"contains":["Eastern Republic of Uruguay"],"notRefusal":true}},{"q":"give the official name for Bahamas","expect":{"contains":["Commonwealth of the Bahamas"],"notRefusal":true}},{"q":"what is the official name of Trinidad and Tobago","expect":{"contains":["Republic of Trinidad and Tobago"],"notRefusal":true}},{"q":"give the official name for Kenya","expect":{"contains":["Republic of Kenya"],"notRefusal":true}},{"q":"give the official name for Rwanda","expect":{"contains":["Rwandese Republic"],"notRefusal":true}},{"q":"what is the official name of Mauritania","expect":{"contains":["Islamic Republic of Mauritania"],"notRefusal":true}},{"q":"tell me the official name of the name Azerbaijan","expect":{"contains":["Republic of Azerbaijan"],"notRefusal":true}},{"q":"tell me the official name of the name Guinea","expect":{"contains":["Republic of Guinea"],"notRefusal":true}},{"q":"what is the official name of Chile","expect":{"contains":["Republic of Chile"],"notRefusal":true}},{"q":"tell me the official name of the name United Kingdom","expect":{"contains":["United Kingdom of Great Britain and Northern Ireland"],"notRefusal":true}},{"q":"tell me the official name of the name Sudan","expect":{"contains":["Republic of the Sudan"],"notRefusal":true}},{"q":"what is the official name of Algeria","expect":{"contains":["People's Democratic Republic of Algeria"],"notRefusal":true}},{"q":"what is the official name of Pakistan","expect":{"contains":["Islamic Republic of Pakistan"],"notRefusal":true}},{"q":"tell me the official name of the name Eritrea","expect":{"contains":["the State of Eritrea"],"notRefusal":true}},{"q":"what is the official name of South Africa","expect":{"contains":["Republic of South Africa"],"notRefusal":true}},{"q":"what is the official name of Vanuatu","expect":{"contains":["Republic of Vanuatu"],"notRefusal":true}},{"q":"give the official name for Brazil","expect":{"contains":["Federative Republic of Brazil"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
