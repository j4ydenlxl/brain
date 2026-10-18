// country-name-of-country-c-4749-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-name-of-country-c-4749-neo-g10","class":"country-name-of-country-c-4749","generation":10,"lane":"neo","grownFrom":["give the country name for BZ","what is the country name of FM","what is the country name of GI","what is the country name of DM","give the country name for CK","tell me the country name of the country code SC","give the country name for MS","what is the country name of MV","what is the country name of AR","what is the country name of BE","give the country name for CH","tell me the country name of the country code BJ","give the country name for OM","give the country name for SD","what is the country name of NU","give the country name for SS","what is the country name of BM","tell me the country name of the country code CZ","tell me the country name of the country code ME","give the country name for BS"],"version":1});

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
knowLoad([{"id":"fr-un-locode-country-codes-ce9a0e","columns":["country code","country name"],"n":249,"cols":[{"s":"AF|AL|DZ|AS|AD|AO|AI|AQ|AG|AR|AM|AW|AU|AT|AZ|BS|BH|BD|BB|BY|BE|BZ|BJ|BM|BT|BO|BQ|BA|BW|BR|IO|BN|BG|BF|BI|KH|CM|CA|CV|KY|CF|TD|CL|CN|CX|CC|CO|KM|CG|CD|CK|CR|HR|CU|CW|CY|CZ|CI|DK|DJ|DM|DO|EC|EG|SV|GQ|ER|EE|SZ|ET|FK|FO|FJ|FI|FR|GF|PF|TF|GA|GM|GE|DE|GH|GI|GR|GL|GD|GP|GU|GT|GG|GN|GW|GY|HT|HM|VA|HN|HK|HU|IS|IN|ID|XZ|IR|IQ|IE|IM|IL|IT|JM|JP|JE|JO|KZ|KE|KI|KP|KR|KW|KG|LA|LV|LB|LS|LR|LY|LI|LT|LU|MO|MG|MW|MY|MV|ML|MT|MH|MQ|MR|MU|YT|MX|FM|MD|MC|MN|ME|MS|MA|MZ|MM|NA|NR|NP|NL|NC|NZ|NI|NE|NG|NU|NF|MK|MP|NO|OM|PK|PW|PS|PA|PG|PY|PE|PH|PN|PL|PT|PR|QA|RO|RU|RW|RE|BL|SH|KN|LC|MF|PM|VC|WS|SM|ST|SA|SN|RS|SC|SL|SG|SX|SK|SI|SB|SO|ZA|GS|SS|ES|LK|SD|SR|SJ|SE|CH|SY|TW|TJ|TZ|TH|TL|TG|TK|TO|TT|TN|TM|TC|TV|TR|UG|UA|AE|GB|UM|US|UY|UZ|VU|VE|VN|VG|VI|WF|EH|YE|ZM|ZW|AX","sep":"|"},{"f":"0Afghanistan|1lbania|2geria|1merican Samoa|1ndorra|2gola|3uilla|2tarctica|3igua and Barbuda|1rgentina|2menia|2uba|1ustralia|5ia|1zerbaijan|0Bahamas|3rain|2ngladesh|2rbados|1elarus|3gium|3ize|2nin|2rmuda|1hutan|1olivia, Plurinational State of|2naire, Sint Eustatius and Saba|2snia and Herzegovina|2tswana|1razil|2itish Indian Ocean Territory|2unei Darussalam|1ulgaria|2rkina Faso|3undi|0Cambodia|3eroon|2nada|2pe Verde|2yman Islands|1entral African Republic|1had|2ile|3na|2ristmas Island|1ocos (Keeling) Islands|2lombia|2moros|2ngo|5, The Democratic Republic of the|2ok Islands|2sta Rica|1roatia|1uba|2raçao|1yprus|1zechia|1ôte d'Ivoire|0Denmark|1jibouti|1ominica|8n Republic|0Ecuador|1gypt|1l Salvador|1quatorial Guinea|1ritrea|1stonia|2watini|1thiopia|0Falkland Islands (Malvinas)|2roe Islands|1iji|2nland|1rance|2ench Guiana|7Polynesia|7Southern Territories|0Gabon|2mbia|1eorgia|2rmany|1hana|1ibraltar|1reece|4nland|3nada|1uadeloupe|3m|3temala|2ernsey|2inea|6-Bissau|2yana|0Haiti|1eard Island and McDonald Islands|1oly See (Vatican City State)|2nduras|3g Kong|1ungary|0Iceland|1ndia|3onesia|2stallations in International Waters|1ran, Islamic Republic of|3q|2eland|1sle of Man|2rael|1taly|0Jamaica|2pan|1ersey|1ordan|0Kazakhstan|1enya|1iribati|1orea, Democratic People's Republic of|7Republic of|1uwait|1yrgyzstan|0Lao People's Democratic Republic|2tvia|1ebanon|2sotho|1iberia|3ya|2echtenstein|2thuania|1uxembourg|0Macao|2dagascar|2lawi|4ysia|3dives|3i|3ta|2rshall Islands (the)|3tinique|2uritania|6ius|2yotte|1exico|1icronesia, Federated States of|1oldova, Republic of|2naco|3golia|3tenegro|4serrat|2rocco|2zambique|1yanmar|0Namibia|2uru|1epal|2therlands|2w Caledonia|4Zealand|1icaragua|2ger|5ia|2ue|1orfolk Island|3th Macedonia|5ern Mariana Islands (the)|3way|0Oman|0Pakistan|2lau|3estine, State of|2nama|2pua New Guinea|2raguay|1eru|1hilippines (the)|1itcairn|1oland|2rtugal|1uerto Rico|0Qatar|0Romania|1ussian Federation (the)|1wanda|1éunion|0Saint Barthélemy|6Helena, Ascension and Tristan Da Cunha|6Kitts and Nevis|6Lucia|6Martin (French Part)|6Pierre and Miquelon|6Vincent and the Grenadines|2moa|2n Marino|2o Tome and Principe|2udi Arabia|1enegal|2rbia|2ychelles|1ierra Leone|2ngapore|3t Maarten (Dutch Part)|1lovakia|4enia|1olomon Islands|2malia|2uth Africa|6Georgia and the South Sandwich Islands|6Sudan|1pain|1ri Lanka|1udan (the)|2riname|1valbard and Jan Mayen|1weden|2itzerland|1yrian Arab Republic (the)|0Taiwan (Province of China)|2jikistan|2nzania, United Republic of|1hailand|1imor-Leste|1ogo|2kelau|2nga|1rinidad and Tobago|1unisia|2rkmenistan|4s and Caicos Islands (the)|2valu|1ürkiye|0Uganda|1kraine|1nited Arab Emirates (the)|7Kingdom|7States Minor Outlying Islands|eof America (the)|1ruguay|1zbekistan|0Vanuatu|1enezuela (Bolivarian Republic of)|1iet Nam|2rgin Islands (British)|gU.S.)|0Wallis and Futuna|1estern Sahara|0Yemen|0Zambia|1imbabwe|0Åland Islands","sep":"|"}]}]);
const COLONY = [
{"id":"n-2e17a03c","guard":[["hasAny",["ar","bz","co","delete","dk","dm","fm","for","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","sg","sj","sn","strip out","sv","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-70834346","guard":[["hasAny",["ar","bz","co","dk","dm","fm","for","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","separate by","sg","sj","sn","split","split by","sv","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-bde0587e","guard":[["hasAny",["ar","bz","co","delete","dk","dm","fm","for","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","sg","sj","sn","strip out","sv","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c0f250a0","guard":[["hasAny",["ar","bz","co","dk","dm","fm","for","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","separate by","sg","sj","sn","split","split by","sv","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e28ea9ce","guard":[["hasAny",["ar","bz","co","dk","dm","fm","for","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","separate by","sg","sj","sn","split","split by","sv","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-632d9c41","guard":[["hasAny",["ag","al","ar","ba","bj","bm","ci","de","dm","eh","es","et","fm","gb","gh","gi","id","il","item number","kp","ky","kz","lc","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","nc","ng","np","nth","py","rs","sc","sg","sh","shortest","shortest one","shortest word","sl","sn","sv","tm","tr","ua","ve","vn","xz","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The country ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-dcf6131d","guard":[["hasAny",["ag","al","ar","ba","bj","bm","ci","de","dm","eh","es","et","fm","gb","gh","gi","id","il","item number","kp","ky","kz","lc","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","nc","ng","np","nth","py","rs","sc","sg","sh","shortest","shortest one","shortest word","sl","sn","sv","tm","tr","ua","ve","vn","xz","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-7a8840bf","guard":[["hasAny",["ag","al","ar","ba","bj","bm","ci","de","dm","eh","es","et","fm","gb","gh","gi","id","il","item number","kp","ky","kz","lc","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","nc","ng","np","nth","py","rs","sc","sg","sh","shortest","shortest one","shortest word","sl","sn","sv","tm","tr","ua","ve","vn","xz","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-7e47d00c","guard":[["hasAny",["ag","al","ar","ba","bj","bm","ci","de","dm","eh","es","et","fm","gb","gh","gi","id","il","item number","kp","ky","kz","lc","lower case","lowercase","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","nc","ng","np","nth","py","rs","sc","sg","sh","shortest","shortest one","shortest word","sl","small letters","sn","sv","tm","tr","ua","ve","vn","xz","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-d3601d36","guard":[["hasAny",["ag","al","ar","ba","bj","bm","capital letters","capitals","ci","de","dm","eh","es","et","fm","gb","gh","gi","id","il","item number","kp","ky","kz","lc","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","nc","ng","np","nth","py","rs","sc","sg","sh","shortest","shortest one","shortest word","sl","sn","sv","tm","tr","ua","upper case","uppercase","ve","vn","xz","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-e354fcbe","guard":[["hasAny",["ag","al","ar","ba","bj","bm","capitalise","capitalize","capitalize each word","ci","de","dm","eh","es","et","fm","gb","gh","gi","id","il","item number","kp","ky","kz","lc","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","nc","ng","np","nth","py","rs","sc","sg","sh","shortest","shortest one","shortest word","sl","sn","sv","title case","tm","tr","ua","ve","vn","xz","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-ffbcd24f","guard":[["hasAny",["ag","al","ar","ba","bj","bm","ci","de","dm","eh","es","et","fm","gb","gh","gi","id","il","invert case","item number","kp","ky","kz","lc","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","nc","ng","np","nth","py","rs","sc","sg","sh","shortest","shortest one","shortest word","sl","sn","sv","swap case","tm","toggle case","tr","ua","ve","vn","xz","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-f1676df5","guard":[["hasAny",["ag","al","ar","ba","bj","bm","ci","de","dm","eh","es","et","fm","gb","gh","gi","id","il","item number","kp","ky","kz","lc","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","nc","ng","normalise","normalize","np","nth","py","rs","sc","sg","sh","simplify the text","sl","sn","sv","tm","tr","ua","ve","vn","xz","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-d471f064","guard":[["hasAny",["al","ar","ba","bj","bz","co","dk","dm","es","gb","gh","gn","gp","gr","id","im","item number","jo","lk","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","nc","nf","ng","normalise","normalize","np","nth","om","rs","sc","sg","simplify the text","sj","sl","sn","sv","tm","ua","vn","xz","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1}]],"mem":null},
{"id":"n-fd1ffa57","guard":[["hasAny",["al","ar","ba","bj","bz","co","dk","dm","es","gb","gh","gn","gp","gr","id","im","item number","jo","lk","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","nc","nf","ng","normalise","normalize","np","nth","om","rs","sc","sg","simplify the text","sj","sl","sn","sv","tm","ua","vn","xz","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1}]],"mem":null},
{"id":"n-37dd4454","guard":[["hasAny",["ar","au","aw","be","bm","bs","bz","ch","cl","co","cr","dk","dm","fr","gi","gm","gn","gp","gr","hn","how many","how many items","id","iq","item number","jo","li","lr","mm","mo","ms","mu","mv","mx","mz","ng","normalise","normalize","nth","nu","number of items","om","pe","position","sg","simplify the text","sn","ss","sv","tm","tr","ua","ug","yt","zw"]],["has","country"],["has","name"],["words>=",6]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-b00055ab","guard":[["hasAny",["ar","au","aw","be","bm","bs","bz","ch","cl","co","cr","dk","dm","fr","gi","gm","gn","gp","gr","hn","how many","how many items","id","iq","item number","jo","li","lr","mm","mo","ms","mu","mv","mx","mz","ng","normalise","normalize","nth","nu","number of items","om","pe","position","sg","simplify the text","sn","ss","sv","tm","tr","ua","ug","yt","zw"]],["has","country"],["has","name"],["words>=",6]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-81b5d473","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gb","gh","gn","gp","gr","id","item number","jo","lk","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","nc","nf","ng","normalise","normalize","np","nth","om","rs","sc","sg","simplify the text","sl","sn","sv","tm","ua","vn","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":2}]],"mem":null},
{"id":"n-d526bab1","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gb","gh","gn","gp","gr","id","item number","jo","lk","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","nc","nf","ng","normalise","normalize","np","nth","om","rs","sc","sg","simplify the text","sl","sn","sv","tm","ua","vn","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":2}]],"mem":null},
{"id":"n-4c278236","guard":[["hasAny",["al","ar","bj","bz","characters from","co","dk","dm","es","gh","gn","gp","gr","id","im","item number","jo","letters from to","lk","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sl","slice of the text","sn","substring","sv","tm","ua","vn","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-635d7b3a","guard":[["hasAny",["al","ar","bj","bz","characters from","co","dk","dm","es","gh","gn","gp","gr","id","im","item number","jo","letters from to","lk","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sl","slice of the text","sn","substring","sv","tm","ua","vn","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-cb69c7e8","guard":[["hasAny",["ar","ba","bz","co","dk","dm","fm","gb","gn","gp","gr","id","im","item number","jo","kp","leading zeros","lk","lr","mg","mm","mr","ms","mu","mv","mz","nc","nf","ng","nth","pad with","padded to","sc","sg","sh","sj","sl","sn","sv","tm","ua","xz","yt","zero pad"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-ed0fac2e","guard":[["hasAny",["ar","ba","bz","co","dk","dm","fm","gb","gn","gp","gr","id","im","item number","jo","kp","leading zeros","lk","lr","mg","mm","mr","ms","mu","mv","mz","nc","nf","ng","nth","pad with","padded to","sc","sg","sh","sj","sl","sn","sv","tm","ua","xz","yt","zero pad"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-47c70671","guard":[["hasAny",["ar","ba","bz","co","dk","dm","fm","gb","gn","gp","gr","id","im","item number","jo","kp","leading zeros","lk","lr","mg","mm","mr","ms","mu","mv","mz","nc","nf","ng","nth","pad with","padded to","sc","sg","sh","sj","sl","sn","sv","tm","ua","xz","yt","zero pad"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]]],"mem":null},
{"id":"n-c349eeb1","guard":[["hasAny",["ar","ba","bz","co","dk","dm","fm","gb","gn","gp","gr","id","im","item number","jo","kp","leading zeros","lk","lr","mg","mm","mr","ms","mu","mv","mz","nc","nf","ng","nth","pad with","padded to","sc","sg","sh","sj","sl","sn","sv","tm","ua","xz","yt","zero pad"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]]],"mem":null},
{"id":"n-2acc5155","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","normalise","normalize","np","nth","om","rs","sc","sg","simplify the text","sn","sv","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":3}]],"mem":null},
{"id":"n-e3aa2717","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","normalise","normalize","np","nth","om","rs","sc","sg","simplify the text","sn","sv","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":3}]],"mem":null},
{"id":"n-579c7af6","guard":[["hasAny",["al","ar","bj","bz","characters from","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","letters from to","lk","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","slice of the text","sn","substring","ua","vn","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-edcc9de7","guard":[["hasAny",["al","ar","bj","bz","characters from","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","letters from to","lk","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","slice of the text","sn","substring","ua","vn","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-2605f865","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-4d4cbc4a","guard":[["hasAny",["al","ar","bj","bz","class name","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","pascal case","pascalcase","rs","sc","sg","sn","tm","ua","upper camel case","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-61580aff","guard":[["hasAny",["al","ar","bj","bz","co","dashes","dk","dm","es","gh","gn","gp","gr","hyphens","id","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-6be7d4dd","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-6fcbe23c","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-8111be0b","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-816d6048","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-87e8f3bc","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","snake case","snakecase","tm","ua","underscores","variable name","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-916de3ef","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-9be2cdc2","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","snake case","snakecase","tm","ua","underscores","variable name","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-b3d71175","guard":[["hasAny",["al","ar","bj","bz","class name","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","pascal case","pascalcase","rs","sc","sg","sn","tm","ua","upper camel case","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-d870283d","guard":[["hasAny",["al","ar","bj","bz","co","dashes","dk","dm","es","gh","gn","gp","gr","hyphens","id","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-fb46039f","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-0a2c4044","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","snake case","snakecase","tm","ua","underscores","variable name","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-0ac6765c","guard":[["hasAny",["a to z","al","alphabetical","alphabetize","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-11eb9035","guard":[["hasAny",["al","ar","bj","bz","class name","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","pascal case","pascalcase","rs","sc","sg","sn","swap case","tm","toggle case","ua","upper camel case","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-17860840","guard":[["hasAny",["al","ar","bj","bz","capital letters","capitals","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","upper case","uppercase","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-1cc1c3e0","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","swap case","tm","toggle case","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-1cf02441","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lower case","lowercase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","small letters","sn","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-1e90387e","guard":[["hasAny",["al","ar","bj","bz","capitalise","capitalize","capitalize each word","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","title case","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.list",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-2059678f","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","shortest","shortest one","shortest word","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-227e1b13","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","longest one","longest word","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-288252f0","guard":[["hasAny",["al","ar","bj","bz","capitalise","capitalize","capitalize each word","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","title case","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.lines",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-28d61c1b","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","snake case","snakecase","swap case","tm","toggle case","ua","underscores","variable name","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-29aaa33c","guard":[["hasAny",["al","ar","bj","bz","capitalise","capitalize","capitalize each word","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","snake case","snakecase","title case","tm","ua","underscores","variable name","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-2a370443","guard":[["hasAny",["al","ar","bj","bz","capitalise","capitalize","capitalize each word","co","dashes","dk","dm","es","gh","gn","gp","gr","hyphens","id","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","title case","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-2b2aaf67","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","swap case","tm","toggle case","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-2fcd4687","guard":[["hasAny",["al","ar","bj","bz","capital letters","capitals","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","upper case","uppercase","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.and",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-333b63ac","guard":[["hasAny",["al","ar","bj","bz","capital letters","capitals","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","upper case","uppercase","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.lines",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-33bf1f28","guard":[["hasAny",["al","ar","bj","bz","capitalise","capitalize","capitalize each word","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","snake case","snakecase","title case","tm","ua","underscores","variable name","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-451536df","guard":[["hasAny",["al","ar","bj","bz","co","dashes","dk","dm","each word","es","gh","gn","gp","gr","hyphens","id","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.list",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-4c2bafbf","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","snake case","snakecase","swap case","tm","toggle case","ua","underscores","variable name","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-4db085f0","guard":[["hasAny",["al","ar","bj","bz","capitalise","capitalize","capitalize each word","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","title case","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.and",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-50d943f9","guard":[["hasAny",["al","ar","bj","bz","co","dashes","dk","dm","es","gh","gn","gp","gr","hyphens","id","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-55a2c4ca","guard":[["hasAny",["a to z","al","alphabetical","alphabetize","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-56ac5960","guard":[["hasAny",["al","ar","bj","bz","co","dashes","dk","dm","es","gh","gn","gp","gr","hyphens","id","invert case","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","swap case","tm","toggle case","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-5eeba1c1","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-5efe4068","guard":[["hasAny",["al","ar","bj","bz","class name","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","pascal case","pascalcase","rs","sc","sg","sn","swap case","tm","toggle case","ua","upper camel case","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-6120c59c","guard":[["hasAny",["al","ar","bj","bz","class name","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","pascal case","pascalcase","rs","sc","sg","sn","swap case","tm","toggle case","ua","upper camel case","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-662c356a","guard":[["hasAny",["al","ar","bj","bz","class name","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","pascal case","pascalcase","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","upper camel case","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-711d020d","guard":[["hasAny",["al","ar","bj","bz","class name","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","pascal case","pascalcase","rs","sc","sg","sn","swap case","tm","toggle case","ua","upper camel case","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-71913ceb","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","swap case","tm","toggle case","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-722c218e","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lower case","lowercase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","small letters","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.lines",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-731d221e","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower case","lowercase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","small letters","sn","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-7478a9c6","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","capital letters","capitals","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","tm","ua","upper case","uppercase","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-750e9ca1","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lower case","lowercase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","small letters","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.list",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-782b816d","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower case","lowercase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","small letters","sn","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-7d168704","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lower case","lowercase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","small letters","sn","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-7f899924","guard":[["hasAny",["al","ar","backwards","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse order","reversed","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-806c1592","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","swap case","tm","toggle case","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-87904634","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lower case","lowercase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","small letters","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.and",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-99175e7d","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","shortest","shortest one","shortest word","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-9f1ae9e7","guard":[["hasAny",["al","ar","backwards","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse order","reversed","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-a51bdb4e","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","swap case","tm","toggle case","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-a7356fe6","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","snake case","snakecase","tm","ua","underscores","variable name","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-a998d8b3","guard":[["hasAny",["al","ar","bj","bz","co","dashes","dk","dm","es","gh","gn","gp","gr","hyphens","id","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-aabc4ca3","guard":[["hasAny",["al","ar","bj","bz","capitalise","capitalize","capitalize each word","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","title case","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-adce0c2e","guard":[["hasAny",["al","ar","bj","bz","co","dashes","dk","dm","es","gh","gn","gp","gr","hyphens","id","invert case","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","swap case","tm","toggle case","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-ae4ff59c","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","swap case","tm","toggle case","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-b1868076","guard":[["hasAny",["al","ar","bj","bz","capital letters","capitals","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","upper case","uppercase","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-b1965fe1","guard":[["hasAny",["al","ar","bj","bz","co","dashes","dk","dm","each word","es","gh","gn","gp","gr","hyphens","id","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.lines",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-b4183bfb","guard":[["hasAny",["al","ar","bj","bz","co","dashes","dk","dm","each word","es","gh","gn","gp","gr","hyphens","id","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.and",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-b4e3720f","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","swap case","tm","toggle case","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.list",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-c2d0ebf4","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","capitalise","capitalize","capitalize each word","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","title case","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-c70e1685","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","longest one","longest word","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-c7b8ebc3","guard":[["hasAny",["a to z","al","alphabetical","alphabetize","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-cc0c32aa","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","invert case","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","swap case","tm","toggle case","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-cd022d11","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","capitalise","capitalize","capitalize each word","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","title case","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-cffa72b2","guard":[["hasAny",["al","ar","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","invert case","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","swap case","tm","toggle case","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.and",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-eabe8e6b","guard":[["hasAny",["al","ar","bj","bz","capitalise","capitalize","capitalize each word","co","dashes","dk","dm","es","gh","gn","gp","gr","hyphens","id","item number","jo","kebab case","kebabcase","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","title case","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-ec950343","guard":[["hasAny",["al","ar","bj","bz","capital letters","capitals","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","split into words","tm","ua","upper case","uppercase","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.list",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-f0b3d05a","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-f21edf49","guard":[["hasAny",["al","ar","bj","bz","camel case","camelcase","capital letters","capitals","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lower camel case","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","rs","sc","sg","sn","tm","ua","upper case","uppercase","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-fc518773","guard":[["hasAny",["al","ar","bj","bz","class name","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","pascal case","pascalcase","reverse the words","reverse word order","rs","sc","sg","sn","tm","ua","upper camel case","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-fde87575","guard":[["hasAny",["al","ar","bj","bz","capitalise","capitalize","capitalize each word","co","dk","dm","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse the words","reverse word order","rs","sc","sg","sn","title case","tm","ua","words backwards","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-fdf313b9","guard":[["hasAny",["al","ar","backwards","bj","bz","co","dk","dm","each word","es","gh","gn","gp","gr","id","item number","jo","lr","lv","mg","mm","mn","mr","ms","mu","mv","mx","mz","na","ng","np","nth","om","reverse order","reversed","rs","sc","sg","sn","split into words","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-871b7238","guard":[["hasAny",["bj","bm","dm","fm","gb","gh","item number","kp","ky","kz","lc","lr","lv","mg","mm","mn","mr","mv","mx","mz","nc","ng","no vowels","np","nth","py","remove vowels","rs","sc","sg","sh","sl","sn","sv","tm","tr","vn","without vowels","xz","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-1cceb15b","guard":[["hasAny",["al","ar","bj","bm","de","dm","es","et","gh","gi","id","il","item number","kz","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","ng","np","nth","py","reverse the words","reverse word order","rs","sc","sg","shortest","shortest one","shortest word","sn","tm","tr","ua","words backwards","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-5a103e4e","guard":[["hasAny",["al","ar","bj","bm","camel case","camelcase","de","dm","es","et","gh","gi","id","il","item number","kz","lower camel case","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","ng","np","nth","py","rs","sc","sg","shortest","shortest one","shortest word","sn","tm","tr","ua","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-61eaf5aa","guard":[["hasAny",["al","ar","bj","bm","dashes","de","dm","es","et","gh","gi","hyphens","id","il","item number","kebab case","kebabcase","kz","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","ng","np","nth","py","rs","sc","sg","shortest","shortest one","shortest word","sn","tm","tr","ua","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-baa86d30","guard":[["hasAny",["al","ar","bj","bm","class name","de","dm","es","et","gh","gi","id","il","item number","kz","lr","lv","mg","mm","mn","mr","mv","mx","mz","na","ng","np","nth","pascal case","pascalcase","py","rs","sc","sg","shortest","shortest one","shortest word","sn","tm","tr","ua","upper camel case","yt"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-d27ccc6d","guard":[["has","country"],["not",["has","it"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the country name of FM":"The country name of FM is Micronesia, Federated States of.","the country name of GI":"The country name of GI is Gibraltar.","the country name of DM":"The country name of DM is Dominica.","the country name of MV":"The country name of MV is Maldives.","the country name of AR":"The country name of AR is Argentina.","the country name of BE":"The country name of BE is Belgium.","the country name of NU":"The country name of NU is Niue.","the country name of BM":"The country name of BM is Bermuda.","the country name of HN":"The country name of HN is Honduras.","the country name of LR":"The country name of LR is Liberia.","the country name of MZ":"The country name of MZ is Mozambique.","the country name of UA":"The country name of UA is Ukraine.","the country name of SV":"The country name of SV is El Salvador.","the country name of IM":"The country name of IM is Isle of Man.","the country name of NG":"The country name of NG is Nigeria.","the country name of FR":"The country name of FR is France.","the country name of MM":"The country name of MM is Myanmar.","the country name of TR":"The country name of TR is Türkiye.","the country name of EH":"The country name of EH is Western Sahara.","the country name of NC":"The country name of NC is New Caledonia.","the country name of BL":"The country name of BL is Saint Barthélemy.","the country name of US":"The country name of US is United States of America (the).","the country name of BG":"The country name of BG is Bulgaria.","the country name of VA":"The country name of VA is Holy See (Vatican City State).","the country name of AW":"The country name of AW is Aruba.","the country name of LI":"The country name of LI is Liechtenstein.","the country name of SN":"The country name of SN is Senegal.","the country name of VU":"The country name of VU is Vanuatu.","the country name of ID":"The country name of ID is Indonesia.","the country name of TM":"The country name of TM is Turkmenistan.","the country name of YT":"The country name of YT is Mayotte.","the country name of VE":"The country name of VE is Venezuela (Bolivarian Republic of).","the country name of MX":"The country name of MX is Mexico.","the country name of SG":"The country name of SG is Singapore."}}},
{"id":"n-26744b5c","guard":[["hasAny",["country","delete","item number","nth","position","remove","strip out"]],["has","name"]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-3c785769","guard":[["hasAny",["country","delete","item number","nth","position","remove","strip out"]],["has","name"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-5b71001c","guard":[["hasAny",["country","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-6f935ccf","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","for","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","sj","sm","ss","ug","zw"]],["has","country"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-85301f9e","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","for","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","sj","sm","ss","ug","zw"]],["has","country"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-5c4631ff","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","for","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","sj","sm","ss","ug","zw"]],["has","country"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-94ac84bc","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","class name","co","cr","dk","er","for","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pascal case","pascalcase","pe","ru","sd","sj","sm","ss","ug","upper camel case","zw"]],["has","country"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ea86753c","guard":[["hasAny",["au","bo","bs","bz","camel case","camelcase","ch","ck","cl","co","cr","dk","er","for","gm","gn","gp","gr","iq","item number","jo","lk","lower camel case","mo","ms","mu","nf","nth","om","pe","ru","sd","sj","sm","ss","ug","zw"]],["has","country"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-674e32e5","guard":[["hasAny",["ag","al","alphabetize the letters","ar","be","bj","bm","ci","de","dm","eh","es","et","fm","gh","gi","il","im","item number","kp","ky","kz","letters in order","lr","lv","mm","mn","mr","mv","mx","mz","np","nth","py","rs","sort the letters","sv","xz"]],["has","country"],["has","name"],["has","of"],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ebc65226","guard":[["has","country"],["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"BZ":"The country name of BZ is Belize.","CK":"The country name of CK is Cook Islands.","MS":"The country name of MS is Montserrat.","CH":"The country name of CH is Switzerland.","OM":"The country name of OM is Oman.","SD":"The country name of SD is Sudan (the).","SS":"The country name of SS is South Sudan.","BS":"The country name of BS is Bahamas.","DK":"The country name of DK is Denmark.","UG":"The country name of UG is Uganda.","JO":"The country name of JO is Jordan.","GM":"The country name of GM is Gambia.","ZW":"The country name of ZW is Zimbabwe.","GP":"The country name of GP is Guadeloupe.","SO":"The country name of SO is Somalia.","GN":"The country name of GN is Guinea.","MU":"The country name of MU is Mauritius.","IQ":"The country name of IQ is Iraq.","MO":"The country name of MO is Macao.","SJ":"The country name of SJ is Svalbard and Jan Mayen.","AU":"The country name of AU is Australia.","BO":"The country name of BO is Bolivia, Plurinational State of.","CO":"The country name of CO is Colombia.","CR":"The country name of CR is Costa Rica.","ER":"The country name of ER is Eritrea.","MY":"The country name of MY is Malaysia.","GR":"The country name of GR is Greece.","CL":"The country name of CL is Chile.","LK":"The country name of LK is Sri Lanka.","RU":"The country name of RU is Russian Federation (the).","PE":"The country name of PE is Peru.","NF":"The country name of NF is Norfolk Island.","SM":"The country name of SM is San Marino."}}},
{"id":"n-4021b9ec","guard":[["hasAny",["ag","al","ba","bj","ci","cz","de","es","et","gb","gh","hk","il","item number","kp","ky","kz","lc","lv","mg","mn","mr","na","np","nth","nz","py","rs","rw","sc","sh","shortest","shortest one","shortest word","sl","vn","xz"]],["has","code"],["has","country"],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-3823e8a6","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","ss","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-42d740a5","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","ss","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The country ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-8281118a","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","ss","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-07991fb0","guard":[["hasAny",["au","bo","bs","bz","capital letters","capitals","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","ss","ug","upper case","uppercase","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-1897b4ec","guard":[["hasAny",["ar","aw","bg","bl","bm","dm","eh","fm","fr","gi","hn","id","item number","li","lr","mm","mv","mx","mz","nc","ng","nth","nu","sg","sn","sv","tm","tr","ua","va","ve","vu","yt"]],["has","country"],["has","name"],["has","what"],["nums==",0],["not",["has","az"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-61fc599b","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","lk","lower case","lowercase","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","small letters","ss","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-7a4195b2","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","invert case","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","ss","swap case","toggle case","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-7f90cc33","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","invert case","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","ss","swap case","toggle case","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-9fa8a467","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","sj","sm","ss","ug","zw"]],["has","give"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-e25cb98b","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","class name","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pascal case","pascalcase","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","ss","ug","upper camel case","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-f6d0ba03","guard":[["hasAny",["au","bo","bs","bz","capitalise","capitalize","capitalize each word","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","ss","title case","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-2dfd3576","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","each word","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","split into words","ss","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-766b3401","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","each word","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","nth","om","pe","ru","sd","shortest","shortest one","shortest word","sj","sm","split into words","ss","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-90a19e41","guard":[["hasAny",["ar","aw","bg","bl","bm","dm","eh","fm","fr","gi","hn","id","item number","li","lr","mm","mv","mx","mz","nc","ng","nth","nu","sg","sn","sv","tm","tr","ua","va","ve","vu","yt"]],["has","country"],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-c4a933f2","guard":[["hasAny",["au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","lk","mo","ms","mu","nf","normalise","normalize","nth","om","pe","ru","sd","simplify the text","sj","sm","ss","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-265bd7ba","guard":[["hasAny",["ar","bz","co","dk","dm","fm","gn","gp","gr","id","im","item number","jo","leading zeros","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","pad with","padded to","sg","sj","sn","sv","tm","ua","yt","zero pad"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-54fe098f","guard":[["hasAny",["ar","bz","co","delete","dk","dm","fm","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","sg","sj","sn","strip out","sv","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["words>=",6],["not",["has","abbreviation"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5717ed27","guard":[["hasAny",["ar","bz","co","delete","dk","dm","fm","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","sg","sj","sn","strip out","sv","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["words>=",6],["not",["has","abbreviation"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5d92cb99","guard":[["hasAny",["ar","bz","co","dk","dm","fm","gn","gp","gr","id","im","item number","jo","leading zeros","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","pad with","padded to","sg","sj","sn","sv","tm","ua","yt","zero pad"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-9ae41b03","guard":[["hasAny",["ar","bz","co","dk","dm","fm","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","separate by","sg","sj","sn","split","split by","sv","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["words>=",6],["not",["has","abbreviation"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-bcc17e02","guard":[["hasAny",["ar","bz","co","dk","dm","fm","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","separate by","sg","sj","sn","split","split by","sv","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["words>=",6],["not",["has","abbreviation"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-fcce58e5","guard":[["hasAny",["ar","bz","co","dk","dm","fm","gn","gp","gr","id","im","item number","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","om","separate by","sg","sj","sn","split","split by","sv","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["words>=",6],["not",["has","abbreviation"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-5c583351","guard":[["hasAny",["ar","bz","co","dk","dm","fm","gn","gp","gr","id","im","item number","jo","leading zeros","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","pad with","padded to","sg","sj","sn","sv","tm","ua","yt","zero pad"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]]],"mem":null},
{"id":"n-e81a9d1c","guard":[["hasAny",["ar","bz","co","dk","dm","fm","gn","gp","gr","id","im","item number","jo","leading zeros","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","nth","pad with","padded to","sg","sj","sn","sv","tm","ua","yt","zero pad"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]]],"mem":null},
{"id":"n-a32a2569","guard":[["hasAny",["al","bj","bz","characters from","es","gh","gn","gr","item number","jo","letters from to","lr","lv","mg","mm","mn","mr","mx","na","ng","np","nth","om","rs","sc","slice of the text","sn","substring","ua","vn","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-e9b05c6f","guard":[["hasAny",["al","bj","bz","characters from","es","gh","gn","gr","item number","jo","letters from to","lr","lv","mg","mm","mn","mr","mx","na","ng","np","nth","om","rs","sc","slice of the text","sn","substring","ua","vn","yt"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["words<=",10]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-e06072de","guard":[["hasAny",["alphabetize the letters","au","bo","bs","bz","ch","ck","cl","co","cr","dk","er","gm","gn","gp","gr","iq","item number","jo","letters in order","mo","ms","mu","my","nth","ru","sort the letters","ss"]],["has","country"],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-089aab8f","guard":[["hasAny",["ar","bm","dm","eh","fm","gi","id","item number","lr","mm","mv","mx","mz","nc","ng","nth","sg","sn","sv","tm","tr","ua","ve","yt"]],["has","country"],["has","name"],["has","of"],["nums==",0],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-38775ddb","guard":[["hasAny",["ar","bm","dm","eh","fm","gi","id","item number","lr","mm","mv","mx","mz","nc","ng","nth","sg","sn","sv","tm","tr","ua","ve","yt"]],["has","country"],["has","name"],["has","of"],["nums==",0],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-deaf8480","guard":[["hasAny",["ar","bm","dm","eh","fm","gi","id","item number","lr","mm","mv","mx","mz","nc","ng","nth","sg","sn","sv","tm","tr","ua","ve","yt"]],["has","country"],["has","name"],["has","of"],["nums==",0],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-76429a08","guard":[["hasAny",["ar","bm","camel case","camelcase","dm","eh","fm","gi","id","item number","lower camel case","lr","mm","mv","mx","mz","nc","ng","nth","sg","sn","sv","tm","tr","ua","ve","yt"]],["has","country"],["has","name"],["has","of"],["nums==",0],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ca8143a0","guard":[["hasAny",["ar","bm","class name","dm","eh","fm","gi","id","item number","lr","mm","mv","mx","mz","nc","ng","nth","pascal case","pascalcase","sg","sn","sv","tm","tr","ua","upper camel case","ve","yt"]],["has","country"],["has","name"],["has","of"],["nums==",0],["words>=",7],["words<=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-18ddfc60","guard":[["hasAny",["au","bs","bz","ch","cl","co","dashes","dk","er","gm","gn","gp","gr","hyphens","iq","item number","jo","kebab case","kebabcase","mo","ms","mu","nth","om","pe","shortest","shortest one","shortest word","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-d22415ec","guard":[["hasAny",["au","bs","bz","camel case","camelcase","ch","cl","co","dk","er","gm","gn","gp","gr","iq","item number","jo","lower camel case","mo","ms","mu","nth","om","pe","shortest","shortest one","shortest word","ug","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-f97940f6","guard":[["hasAny",["au","bs","bz","ch","cl","class name","co","dk","er","gm","gn","gp","gr","iq","item number","jo","mo","ms","mu","nth","om","pascal case","pascalcase","pe","shortest","shortest one","shortest word","ug","upper camel case","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-ff3d919c","guard":[["hasAny",["au","bs","bz","ch","cl","co","dk","er","gm","gn","gp","gr","iq","item number","jo","mo","ms","mu","nth","om","pe","reverse the words","reverse word order","shortest","shortest one","shortest word","ug","words backwards","zw"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-6f947ec3","guard":[["hasAny",["bs","bz","ch","ck","cl","cr","dk","gm","gn","gp","gr","item number","lk","ms","my","nf","no vowels","nth","remove vowels","sd","sj","sm","ss","without vowels","zw"]],["words<=",6],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-0669a3f3","guard":[["hasAny",["ba","fm","gb","gp","im","item number","kp","leading zeros","mg","mr","ms","mz","nc","nf","nth","pad with","padded to","sc","sh","sj","sl","sv","tm","xz","zero pad"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-a921e3b9","guard":[["hasAny",["ba","fm","gb","gp","im","item number","kp","leading zeros","mg","mr","ms","mz","nc","nf","nth","pad with","padded to","sc","sh","sj","sl","sv","tm","xz","zero pad"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-5c26cedb","guard":[["hasAny",["ba","fm","gb","gp","im","item number","kp","leading zeros","mg","mr","ms","mz","nc","nf","nth","pad with","padded to","sc","sh","sj","sl","sv","tm","xz","zero pad"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]]],"mem":null},
{"id":"n-a040bf2f","guard":[["hasAny",["ba","fm","gb","gp","im","item number","kp","leading zeros","mg","mr","ms","mz","nc","nf","nth","pad with","padded to","sc","sh","sj","sl","sv","tm","xz","zero pad"]],["has","country"],["has","name"],["nums==",0],["words>=",6],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]]],"mem":null},
{"id":"n-0d5ee5ea","guard":[["hasAny",["ba","fm","gb","item number","kp","leading zeros","nc","nf","nth","pad with","padded to","sh","sj","sl","tm","xz","zero pad"]],["has","country"],["has","name"],["words>=",6],["nums==",0],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-c91cb2dc","guard":[["hasAny",["ba","fm","gb","item number","kp","leading zeros","nc","nf","nth","pad with","padded to","sh","sj","sl","tm","xz","zero pad"]],["has","country"],["has","name"],["words>=",6],["nums==",0],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-006d6343","guard":[["hasAny",["ba","fm","gb","item number","kp","leading zeros","nc","nf","nth","pad with","padded to","sh","sj","sl","tm","xz","zero pad"]],["has","country"],["has","name"],["words>=",6],["nums==",0],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]]],"mem":null},
{"id":"n-5193fc94","guard":[["hasAny",["ba","fm","gb","item number","kp","leading zeros","nc","nf","nth","pad with","padded to","sh","sj","sl","tm","xz","zero pad"]],["has","country"],["has","name"],["words>=",6],["nums==",0],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}]]],"mem":null},
{"id":"n-8633080d","guard":[["hasAny",["bj","characters from","es","gh","item number","letters from to","np","nth","om","slice of the text","substring"]],["has","country"],["has","name"],["not",["has","alpha2"]],["words>=",6]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-cb81e817","guard":[["hasAny",["bj","characters from","es","gh","item number","letters from to","np","nth","om","slice of the text","substring"]],["has","country"],["has","name"],["not",["has","alpha2"]],["words>=",6]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-2e9ed1fa","guard":[["hasAny",["ci","item number","leading zeros","li","mm","mv","nth","pad","pad with","padded to","position","zero pad"]],["has","name"],["has","country"],["not",["has","iso2"]],["words>=",7]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordCount"],["sense.roman"]]],"mem":null},
{"id":"n-49b257a1","guard":[["hasAny",["characters from","iq","item number","letters from to","nth","nu","om","pe","slice of the text","substring"]],["has","name"],["not",["has","domain"]],["not",["has","which"]],["not",["has","alpha2"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-c90a48d9","guard":[["hasAny",["characters from","iq","item number","letters from to","nth","nu","om","pe","slice of the text","substring"]],["has","name"],["not",["has","domain"]],["not",["has","which"]],["not",["has","alpha2"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-f7fafecf","guard":[["hasAny",["ci","item number","leading zeros","li","mm","mv","nth","pad","pad with","padded to","position","zero pad"]],["has","name"],["has","country"],["not",["has","iso2"]],["words>=",7]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.wordCount"],["sense.roman"]]],"mem":null},
{"id":"n-bb724ed4","guard":[["hasAny",["count","country","how many items","item number","normalise","normalize","nth","number of items","position","simplify the text"]],["has","name"],["not",["has","independence"]],["not",["has","currency"]],["not",["has","has"]],["not",["has","aeronautic"]],["not",["has","lb"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-e211da2b","guard":[["hasAny",["count","country","how many items","item number","normalise","normalize","nth","number of items","position","simplify the text"]],["has","name"],["not",["has","independence"]],["not",["has","currency"]],["not",["has","has"]],["not",["has","aeronautic"]],["not",["has","lb"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["aggregate.countStrs",["sense.units"]]]],"mem":null},
{"id":"n-5edb06c5","guard":[["hasAny",["country","delete","item number","nth","position","remove","strip out","without"]],["has","name"],["not",["has","independence"]],["not",["has","currency"]],["not",["has","has"]],["not",["has","aeronautic"]],["not",["has","lb"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.unit"]]],"mem":null},
{"id":"n-7c4078ed","guard":[["hasAny",["country","delete","item number","nth","position","remove","strip out","without"]],["has","name"],["not",["has","independence"]],["not",["has","currency"]],["not",["has","has"]],["not",["has","aeronautic"]],["not",["has","lb"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.unit"]]],"mem":null},
{"id":"n-7791f0b9","guard":[["has","country"],["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.unit"]]],"mem":{"table":{"ms":"The country name of MS is Montserrat.","mm":"The country name of MM is Myanmar.","mg":"The country name of MG is Madagascar."}}},
{"id":"n-14180b36","guard":[["hasAny",["code","item number","leading zeros","ms","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","name"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":10},["sense.unit"]]],"mem":null},
{"id":"n-597e36fc","guard":[["hasAny",["ci","item number","leading zeros","li","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","name"],["not",["has","iso2"]],["words>=",7]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":10},["sense.roman"]]],"mem":null},
{"id":"n-817eaeec","guard":[["hasAny",["ci","item number","leading zeros","li","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","name"],["not",["has","iso2"]],["words>=",7]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":12},["sense.roman"]]],"mem":null},
{"id":"n-ab28cb44","guard":[["hasAny",["ci","item number","leading zeros","li","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","name"],["not",["has","iso2"]],["words>=",7]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":10},["sense.roman"]]],"mem":null},
{"id":"n-bdcdc8e1","guard":[["hasAny",["ci","item number","leading zeros","li","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","name"],["not",["has","iso2"]],["words>=",7]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":12},["sense.roman"]]],"mem":null},
{"id":"n-fbe0e511","guard":[["hasAny",["code","item number","leading zeros","ms","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","name"]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],{"lit":10},["sense.unit"]]],"mem":null},
{"id":"n-89c3c76c","guard":[["hasAny",["alphabetize the letters","item number","letters in order","nth","pe","sort the letters"]],["has","give"]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-f73e6669","guard":[["hasAny",["alphabetize the letters","item number","letters in order","nth","pe","sort the letters"]],["has","give"]],"pyramid":["render.code",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-08675308","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","item number","letters in order","nth","pe","sort the letters","title case"]],["has","give"]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-09f7382e","guard":[["hasAny",["alphabetize the letters","camel case","camelcase","item number","letters in order","lower camel case","nth","pe","sort the letters"]],["has","give"]],"pyramid":["render.str",["transform.camel",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-103e3319","guard":[["hasAny",["alphabetize the letters","item number","letters in order","lower case","lowercase","nth","pe","small letters","sort the letters"]],["has","give"]],"pyramid":["render.code",["transform.lower",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-13fa84d1","guard":[["hasAny",["alphabetize the letters","invert case","item number","letters in order","nth","pe","sort the letters","swap case","toggle case"]],["has","give"]],"pyramid":["render.str",["transform.swapCase",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-18651d5e","guard":[["hasAny",["alphabetize the letters","dashes","hyphens","item number","kebab case","kebabcase","letters in order","nth","pe","sort the letters"]],["has","give"]],"pyramid":["render.str",["transform.kebab",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-29dec240","guard":[["hasAny",["alphabetize the letters","capital letters","capitals","item number","letters in order","nth","pe","sort the letters","upper case","uppercase"]],["has","give"]],"pyramid":["render.code",["transform.upper",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-45ae1680","guard":[["hasAny",["alphabetize the letters","camel case","camelcase","item number","letters in order","lower camel case","nth","pe","sort the letters"]],["has","give"]],"pyramid":["render.code",["transform.camel",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-50a1382b","guard":[["hasAny",["alphabetize the letters","each word","item number","letters in order","nth","pe","sort the letters","split into words"]],["has","give"]],"pyramid":["render.list",["transform.words",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-6528a350","guard":[["hasAny",["alphabetize the letters","class name","item number","letters in order","nth","pascal case","pascalcase","pe","sort the letters","upper camel case"]],["has","give"]],"pyramid":["render.str",["transform.pascal",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-715e199d","guard":[["hasAny",["alphabetize the letters","dashes","hyphens","item number","kebab case","kebabcase","letters in order","nth","pe","sort the letters"]],["has","give"]],"pyramid":["render.code",["transform.kebab",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-72eb0961","guard":[["hasAny",["alphabetize the letters","class name","item number","letters in order","nth","pascal case","pascalcase","pe","sort the letters","upper camel case"]],["has","give"]],"pyramid":["render.code",["transform.pascal",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-77f22124","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","item number","letters in order","nth","pe","sort the letters","title case"]],["has","give"]],"pyramid":["render.code",["transform.sortLetters",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-7dd591be","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","item number","letters in order","nth","pe","sort the letters","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-8580e1c3","guard":[["hasAny",["alphabetize the letters","item number","letters in order","nth","pe","reverse the words","reverse word order","sort the letters","words backwards"]],["has","give"]],"pyramid":["render.str",["transform.reverseWords",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-93581eb3","guard":[["hasAny",["alphabetize the letters","invert case","item number","letters in order","nth","pe","sort the letters","swap case","toggle case"]],["has","give"]],"pyramid":["render.code",["transform.swapCase",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-93a7c825","guard":[["hasAny",["alphabetize the letters","class name","item number","letters in order","nth","pascal case","pascalcase","pe","sort the letters","upper camel case"]],["has","give"]],"pyramid":["render.code",["transform.sortLetters",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-9443f7d1","guard":[["hasAny",["alphabetize the letters","item number","letters in order","nth","pe","snake case","snakecase","sort the letters","underscores","variable name"]],["has","give"]],"pyramid":["render.code",["transform.snake",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-a7a8cbf7","guard":[["hasAny",["alphabetize the letters","class name","item number","letters in order","nth","pascal case","pascalcase","pe","sort the letters","upper camel case"]],["has","give"]],"pyramid":["render.str",["transform.sortLetters",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-c06ce7b9","guard":[["hasAny",["alphabetize the letters","item number","letters in order","nth","pe","snake case","snakecase","sort the letters","underscores","variable name"]],["has","give"]],"pyramid":["render.str",["transform.snake",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-c7f3f636","guard":[["hasAny",["alphabetize the letters","item number","letters in order","lower case","lowercase","nth","pe","small letters","sort the letters"]],["has","give"]],"pyramid":["render.str",["transform.lower",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-ca0d291b","guard":[["hasAny",["alphabetize the letters","capital letters","capitals","item number","letters in order","nth","pe","sort the letters","upper case","uppercase"]],["has","give"]],"pyramid":["render.str",["transform.upper",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-dcddd82a","guard":[["hasAny",["alphabetize the letters","item number","letters in order","nth","pe","reverse the words","reverse word order","sort the letters","words backwards"]],["has","give"]],"pyramid":["render.code",["transform.reverseWords",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-eaff83ba","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","item number","letters in order","nth","pe","sort the letters","title case"]],["has","give"]],"pyramid":["render.code",["transform.title",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]]],"mem":null},
{"id":"n-0910e9f6","guard":[["hasAny",["item number","nth","so"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of SO is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-68a6968a","guard":[["hasAny",["item number","my","nth"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of MY is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-6f3844ab","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","us"]],["has","country"],["words<=",7],["has","name"]],"pyramid":["render.template",{"lit":["The country ",{"slot":0}," of US is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-72dca6aa","guard":[["hasAny",["im","item number","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country ",{"slot":0}," of IM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-8c64b726","guard":[["hasAny",["change to","country","element","item number","nth","position","replace","substitute","swap"]],["has","what"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.unit"],["sense.roman"]]],"mem":null},
{"id":"n-94099b4c","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","so"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The country ",{"slot":0}," of SO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-c85e24f0","guard":[["hasAny",["item number","my","nth","shortest","shortest one","shortest word"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The country ",{"slot":0}," of MY is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-e2cf9697","guard":[["hasAny",["be","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The country ",{"slot":0}," of BE is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-f2800525","guard":[["hasAny",["change to","country","element","item number","nth","position","replace","substitute","swap"]],["has","what"]],"pyramid":["render.code",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}],["sense.unit"],["sense.roman"]]],"mem":null},
{"id":"n-28647e8e","guard":[["hasAny",["be","item number","nth"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of BE is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-8a01983c","guard":[["hasAny",["item number","nth","us"]],["has","country"],["words<=",7],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of US is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-96caaec2","guard":[["hasAny",["im","item number","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of IM is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-2426d8b5","guard":[["hasAny",["item number","my","nth","shortest","shortest one","shortest word"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-f0054f32","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","so"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-019d055a","guard":[["hasAny",["gp","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GP is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-07748c2c","guard":[["hasAny",["camel case","camelcase","item number","lower camel case","my","nth","shortest","shortest one","shortest word"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-0888fdd2","guard":[["hasAny",["item number","jo","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of JO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-091b55d2","guard":[["hasAny",["class name","item number","my","nth","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-0a7886b2","guard":[["hasAny",["invert case","item number","nth","shortest","shortest one","shortest word","so","swap case","toggle case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-11c60982","guard":[["hasAny",["dashes","hyphens","item number","kebab case","kebabcase","my","nth","shortest","shortest one","shortest word"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-128b7094","guard":[["hasAny",["dashes","hyphens","item number","kebab case","kebabcase","nth","shortest","shortest one","shortest word","so"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-1825f439","guard":[["hasAny",["ck","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CK is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-21c414db","guard":[["hasAny",["cr","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CR is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-24f6d523","guard":[["hasAny",["bz","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BZ is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-25c7891d","guard":[["hasAny",["class name","item number","nth","pascal case","pascalcase","shortest","shortest one","shortest word","so","upper camel case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-2eb804b9","guard":[["hasAny",["im","item number","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of IM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-2f211c74","guard":[["hasAny",["invert case","item number","nth","shortest","shortest one","shortest word","so","swap case","toggle case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-345a7bd2","guard":[["hasAny",["item number","nf","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NF is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-39d7d13d","guard":[["hasAny",["co","item number","nth"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-39eebabf","guard":[["hasAny",["dk","item number","nth"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of DK is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-3c495d2a","guard":[["hasAny",["au","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of AU is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-4410c1e6","guard":[["hasAny",["gm","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GM is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-455b5ded","guard":[["hasAny",["item number","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","so","words backwards"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-493a3c2b","guard":[["hasAny",["item number","nth","sj"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SJ is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-53a2e270","guard":[["hasAny",["gn","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GN is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-575c051b","guard":[["hasAny",["camel case","camelcase","item number","lower camel case","nth","shortest","shortest one","shortest word","so"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-5d8a0ed2","guard":[["hasAny",["item number","lk","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of LK is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-6d9f2eda","guard":[["hasAny",["item number","nth","ru"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of RU is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-6ee95c5a","guard":[["hasAny",["item number","nth","sm"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SM is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-75516ac3","guard":[["hasAny",["item number","nth","ss"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SS is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-7672d226","guard":[["hasAny",["item number","ms","nth"]],["has","give"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MS is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-79f7a6be","guard":[["hasAny",["be","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-835e2ef6","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","us"]],["has","country"],["words<=",7],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of US is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-957d384a","guard":[["hasAny",["class name","item number","my","nth","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-9ffa6f01","guard":[["hasAny",["item number","mo","nth"]],["has","give"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-a4a20716","guard":[["hasAny",["gr","item number","nth"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GR is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-a597ba24","guard":[["hasAny",["item number","nth","sd"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SD is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ae07a819","guard":[["hasAny",["bs","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BS is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-b0b137fd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","shortest","shortest one","shortest word","so","title case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-b3258e48","guard":[["hasAny",["bo","item number","nth"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ba4d2dba","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","my","nth","shortest","shortest one","shortest word","title case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-c4ea1788","guard":[["hasAny",["item number","nth","ug"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of UG is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-c7436f07","guard":[["hasAny",["cl","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CL is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-cef234e3","guard":[["hasAny",["item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters","so"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-d438a0d4","guard":[["hasAny",["item number","nth","om"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of OM is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-d45e31fa","guard":[["hasAny",["ch","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CH is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-d80fd5d2","guard":[["hasAny",["er","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ER is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-d8370bc1","guard":[["hasAny",["item number","nth","so"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-e0cfd88d","guard":[["hasAny",["item number","nth","zw"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ZW is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-e5b636db","guard":[["hasAny",["capital letters","capitals","item number","nth","shortest","shortest one","shortest word","so","upper case","uppercase"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-e738b06d","guard":[["hasAny",["invert case","item number","my","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-e74787a1","guard":[["hasAny",["item number","mu","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MU is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-e7ca2888","guard":[["hasAny",["item number","nth","pe"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of PE is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-e88f0563","guard":[["hasAny",["item number","lower case","lowercase","my","nth","shortest","shortest one","shortest word","small letters"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-e8a2067b","guard":[["hasAny",["item number","my","nth"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-eb671aa3","guard":[["hasAny",["item number","my","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-f70bbfe6","guard":[["hasAny",["class name","item number","nth","pascal case","pascalcase","shortest","shortest one","shortest word","so","upper camel case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-fc325c6d","guard":[["hasAny",["invert case","item number","my","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-fd52f005","guard":[["hasAny",["capital letters","capitals","item number","my","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-fffef33e","guard":[["hasAny",["iq","item number","nth"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of IQ is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-017858d2","guard":[["hasAny",["item number","nth","tr"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of TR is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-03bb21c4","guard":[["hasAny",["be","capitalise","capitalize","capitalize each word","item number","nth","shortest","shortest one","shortest word","title case"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-0c263237","guard":[["hasAny",["im","item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of IM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-0d29eba4","guard":[["hasAny",["ar","item number","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of AR is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-105b71bc","guard":[["hasAny",["item number","nth","xz"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of XZ is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-11381c8a","guard":[["hasAny",["de","item number","nth"]],["has","code"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of DE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-12b53942","guard":[["hasAny",["al","item number","nth"]],["has","code"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of AL is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-143f1343","guard":[["hasAny",["item number","mz","nth"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MZ is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-163fe336","guard":[["hasAny",["fm","item number","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of FM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-1c90e38a","guard":[["hasAny",["ba","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BA is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-23357c6c","guard":[["hasAny",["item number","nth","vn"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of VN is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-2461f5d6","guard":[["hasAny",["eh","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of EH is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-25c8d0d5","guard":[["hasAny",["item number","mv","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MV is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-287c34fb","guard":[["hasAny",["bg","item number","nth"]],["has","what"],["has","the"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BG is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-32cc97ca","guard":[["hasAny",["item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters","us"]],["has","country"],["words<=",7],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of US is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-381b6e68","guard":[["hasAny",["item number","kp","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of KP is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-3822e44c","guard":[["hasAny",["dm","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of DM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-3b99f398","guard":[["hasAny",["item number","mm","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-3b9d302a","guard":[["hasAny",["item number","nth","nz"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NZ is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-41b56473","guard":[["hasAny",["each word","item number","nth","shortest","shortest one","shortest word","so","split into words"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-44943816","guard":[["hasAny",["be","item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-4c922996","guard":[["hasAny",["gb","item number","nth"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GB is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-4db09a53","guard":[["hasAny",["item number","nth","us"]],["has","country"],["words<=",7],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of US is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-516951b0","guard":[["hasAny",["item number","np","nth"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NP is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-5256297c","guard":[["hasAny",["each word","item number","nth","shortest","shortest one","shortest word","so","split into words"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-57de1047","guard":[["hasAny",["item number","mg","nth"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MG is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-5f8da62f","guard":[["hasAny",["be","camel case","camelcase","item number","lower camel case","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-61881c18","guard":[["hasAny",["bl","item number","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BL is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-6b54083e","guard":[["hasAny",["es","item number","nth"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ES is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-6be89226","guard":[["hasAny",["aw","item number","nth"]],["has","name"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of AW is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-6e654cac","guard":[["hasAny",["hk","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of HK is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-6eec06ae","guard":[["hasAny",["item number","nth","vu"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of VU is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-7765c0fc","guard":[["hasAny",["be","item number","nth"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-793bd052","guard":[["hasAny",["be","capital letters","capitals","item number","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-81066d83","guard":[["hasAny",["capital letters","capitals","im","item number","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of IM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-87adc757","guard":[["hasAny",["item number","lr","nth"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of LR is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-8e82ed76","guard":[["hasAny",["ci","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CI is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-8f601089","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","shortest","shortest one","shortest word","title case","us"]],["has","country"],["words<=",7],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of US is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-906ae4bf","guard":[["hasAny",["item number","nth","sv"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SV is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-934cfa7e","guard":[["hasAny",["im","invert case","item number","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of IM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-94407b87","guard":[["hasAny",["bm","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-94b3f784","guard":[["hasAny",["et","item number","nth"]],["has","country"],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ET is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-953d1362","guard":[["hasAny",["be","item number","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-95f8a2fd","guard":[["hasAny",["item number","nth","sg"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SG is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-9827c2d8","guard":[["hasAny",["each word","item number","my","nth","shortest","shortest one","shortest word","split into words"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-9d0fb759","guard":[["hasAny",["hn","item number","nth"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of HN is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-9def4357","guard":[["hasAny",["bj","item number","nth"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BJ is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-9e27f4d8","guard":[["hasAny",["capital letters","capitals","item number","nth","shortest","shortest one","shortest word","upper case","uppercase","us"]],["has","country"],["words<=",7],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of US is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-9ff0bf5f","guard":[["hasAny",["item number","nc","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NC is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-a1adf993","guard":[["hasAny",["item number","lc","nth"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of LC is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-aa03b1dd","guard":[["hasAny",["item number","nth","ve"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of VE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ab9ec675","guard":[["hasAny",["item number","nth","nu"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NU is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-aded793d","guard":[["hasAny",["be","class name","item number","nth","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-aeacb52f","guard":[["hasAny",["item number","nth","sc"]],["has","country"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SC is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-b20131f3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","im","item number","nth","shortest","shortest one","shortest word","title case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of IM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-b3bdc069","guard":[["hasAny",["item number","ky","nth"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of KY is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-b464d5bb","guard":[["hasAny",["item number","li","nth"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of LI is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-b6d65b84","guard":[["hasAny",["item number","ng","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NG is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-b7299398","guard":[["hasAny",["item number","nth","py"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of PY is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-bab2c6da","guard":[["hasAny",["item number","nth","rw"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of RW is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-bf8e4619","guard":[["hasAny",["fr","item number","nth"]],["has","country"],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of FR is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-bfeb174f","guard":[["hasAny",["invert case","item number","nth","shortest","shortest one","shortest word","swap case","toggle case","us"]],["has","country"],["words<=",7],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of US is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-c1e8e41a","guard":[["hasAny",["item number","lv","nth"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of LV is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-c72bb3b9","guard":[["hasAny",["be","invert case","item number","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-ca297a56","guard":[["hasAny",["item number","nth","va"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of VA is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-cc79e4f0","guard":[["hasAny",["ag","item number","nth"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of AG is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-d3645066","guard":[["hasAny",["gh","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GH is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-da81f814","guard":[["hasAny",["each word","item number","my","nth","shortest","shortest one","shortest word","split into words"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ddc2f136","guard":[["hasAny",["item number","na","nth"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NA is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-df2e428b","guard":[["hasAny",["be","dashes","hyphens","item number","kebab case","kebabcase","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]]],"mem":null},
{"id":"n-e6170d6f","guard":[["hasAny",["item number","nth","ua"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of UA is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-e73febaf","guard":[["hasAny",["il","item number","nth"]],["has","country"],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of IL is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-e78b7e69","guard":[["hasAny",["im","item number","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of IM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-e995ac8a","guard":[["hasAny",["item number","mr","nth"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MR is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ead135f6","guard":[["hasAny",["item number","kz","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of KZ is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ee20196b","guard":[["hasAny",["item number","nth","rs"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of RS is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ef00967c","guard":[["hasAny",["item number","nth","tm"]],["has","what"],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of TM is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-ef0d21d1","guard":[["hasAny",["id","item number","nth"]],["has","country"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ID is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-f031fb46","guard":[["hasAny",["item number","mn","nth"]],["has","country"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MN is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-f5cadf2d","guard":[["hasAny",["gi","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GI is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-f647b569","guard":[["hasAny",["item number","nth","sl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SL is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-fa2f83ad","guard":[["hasAny",["cz","item number","nth"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CZ is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-fc1c8efa","guard":[["hasAny",["item number","nth","sn"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SN is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-fc6268d7","guard":[["hasAny",["item number","nth","yt"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of YT is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-fcf421cb","guard":[["hasAny",["item number","mx","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MX is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-fd21748f","guard":[["hasAny",["item number","nth","sh"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SH is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"}],{"lit":1}],{"lit":"fr-un-locode-country-codes-ce9a0e"},{"lit":"country code"},{"lit":"country name"}]],"mem":null},
{"id":"n-0025d7dc","guard":[["hasAny",["code","country","ky","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code KY":"The country name of KY is Cayman Islands."}}},
{"id":"n-0581764d","guard":[["hasAny",["country","mv","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of MV":"The country name of MV is Maldives."}}},
{"id":"n-0a29b76e","guard":[["hasAny",["country","name","ru"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for RU":"The country name of RU is Russian Federation (the)."}}},
{"id":"n-0aeba99b","guard":[["hasAny",["au","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for AU":"The country name of AU is Australia."}}},
{"id":"n-0d992b06","guard":[["hasAny",["code","country","name","sl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code SL":"The country name of SL is Sierra Leone."}}},
{"id":"n-0db355e2","guard":[["hasAny",["country","mx","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of MX":"The country name of MX is Mexico."}}},
{"id":"n-14105067","guard":[["hasAny",["bm","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of BM":"The country name of BM is Bermuda."}}},
{"id":"n-157400cf","guard":[["hasAny",["code","country","mr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code MR":"The country name of MR is Mauritania."}}},
{"id":"n-193b9437","guard":[["hasAny",["country","mu","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for MU":"The country name of MU is Mauritius."}}},
{"id":"n-1cbcebd6","guard":[["hasAny",["country","gi","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of GI":"The country name of GI is Gibraltar."}}},
{"id":"n-2060c136","guard":[["hasAny",["code","country","es","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code ES":"The country name of ES is Spain."}}},
{"id":"n-20f89c5b","guard":[["hasAny",["code","country","name","py"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code PY":"The country name of PY is Paraguay."}}},
{"id":"n-2be83846","guard":[["hasAny",["code","country","name","xz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code XZ":"The country name of XZ is Installations in International Waters."}}},
{"id":"n-2c4108d4","guard":[["hasAny",["country","dk","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for DK":"The country name of DK is Denmark."}}},
{"id":"n-2d40fd89","guard":[["hasAny",["aw","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of AW":"The country name of AW is Aruba."}}},
{"id":"n-2e163a02","guard":[["hasAny",["country","fr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of FR":"The country name of FR is France."}}},
{"id":"n-2f62d915","guard":[["hasAny",["code","country","name","np"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code NP":"The country name of NP is Nepal."}}},
{"id":"n-31914f42","guard":[["hasAny",["country","mm","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of MM":"The country name of MM is Myanmar."}}},
{"id":"n-34b9a2a8","guard":[["hasAny",["country","er","name"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for ER":"The country name of ER is Eritrea."}}},
{"id":"n-373f8471","guard":[["hasAny",["country","mo","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for MO":"The country name of MO is Macao."}}},
{"id":"n-3b91c208","guard":[["hasAny",["country","li","name"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of LI":"The country name of LI is Liechtenstein."}}},
{"id":"n-41c7037d","guard":[["hasAny",["bj","code","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code BJ":"The country name of BJ is Benin."}}},
{"id":"n-43597447","guard":[["hasAny",["ch","country","name"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for CH":"The country name of CH is Switzerland."}}},
{"id":"n-4809434b","guard":[["hasAny",["country","name","ve"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of VE":"The country name of VE is Venezuela (Bolivarian Republic of)."}}},
{"id":"n-4bb92162","guard":[["hasAny",["bg","country","name"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of BG":"The country name of BG is Bulgaria."}}},
{"id":"n-4c5fa951","guard":[["hasAny",["ag","code","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code AG":"The country name of AG is Antigua and Barbuda."}}},
{"id":"n-4d390b25","guard":[["hasAny",["country","mz","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of MZ":"The country name of MZ is Mozambique."}}},
{"id":"n-4d6eb430","guard":[["hasAny",["bz","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for BZ":"The country name of BZ is Belize."}}},
{"id":"n-4e2523b2","guard":[["hasAny",["country","fm","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of FM":"The country name of FM is Micronesia, Federated States of."}}},
{"id":"n-511fad95","guard":[["hasAny",["country","dm","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of DM":"The country name of DM is Dominica."}}},
{"id":"n-549bb894","guard":[["hasAny",["country","name","ua"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of UA":"The country name of UA is Ukraine."}}},
{"id":"n-585d4aa7","guard":[["hasAny",["country","name","nc"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of NC":"The country name of NC is New Caledonia."}}},
{"id":"n-59f609f2","guard":[["hasAny",["country","name","pe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for PE":"The country name of PE is Peru."}}},
{"id":"n-5ad89c6a","guard":[["hasAny",["country","name","sn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of SN":"The country name of SN is Senegal."}}},
{"id":"n-5e390762","guard":[["hasAny",["ck","country","name"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for CK":"The country name of CK is Cook Islands."}}},
{"id":"n-60381e0c","guard":[["hasAny",["country","name","tr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of TR":"The country name of TR is Türkiye."}}},
{"id":"n-61f4b934","guard":[["hasAny",["code","country","et","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code ET":"The country name of ET is Ethiopia."}}},
{"id":"n-69114f2e","guard":[["hasAny",["bl","country","name"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of BL":"The country name of BL is Saint Barthélemy."}}},
{"id":"n-6db91b2d","guard":[["hasAny",["country","lr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of LR":"The country name of LR is Liberia."}}},
{"id":"n-6ec63be0","guard":[["hasAny",["code","country","name","vn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code VN":"The country name of VN is Viet Nam."}}},
{"id":"n-71b1cfac","guard":[["hasAny",["code","country","name","rw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code RW":"The country name of RW is Rwanda."}}},
{"id":"n-71e8276c","guard":[["hasAny",["co","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for CO":"The country name of CO is Colombia."}}},
{"id":"n-75609dd3","guard":[["hasAny",["country","ms","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for MS":"The country name of MS is Montserrat."}}},
{"id":"n-758905dd","guard":[["hasAny",["code","country","hk","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code HK":"The country name of HK is Hong Kong."}}},
{"id":"n-7719220c","guard":[["hasAny",["code","country","name","nz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code NZ":"The country name of NZ is New Zealand."}}},
{"id":"n-781cd444","guard":[["hasAny",["code","country","mn","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code MN":"The country name of MN is Mongolia."}}},
{"id":"n-78e62821","guard":[["hasAny",["country","name","sm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for SM":"The country name of SM is San Marino."}}},
{"id":"n-7caf47d7","guard":[["hasAny",["country","gr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for GR":"The country name of GR is Greece."}}},
{"id":"n-8233113e","guard":[["hasAny",["code","country","kp","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code KP":"The country name of KP is Korea, Democratic People's Republic of."}}},
{"id":"n-8748ae70","guard":[["hasAny",["country","name","vu"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of VU":"The country name of VU is Vanuatu."}}},
{"id":"n-89a43d28","guard":[["hasAny",["country","name","ng"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of NG":"The country name of NG is Nigeria."}}},
{"id":"n-95fcca9b","guard":[["hasAny",["code","country","name"]],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code ME":"The country name of ME is Montenegro."}}},
{"id":"n-9eb67747","guard":[["hasAny",["code","country","cz","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code CZ":"The country name of CZ is Czechia."}}},
{"id":"n-a55c89c7","guard":[["hasAny",["code","country","name","sh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code SH":"The country name of SH is Saint Helena, Ascension and Tristan Da Cunha."}}},
{"id":"n-aa56da35","guard":[["hasAny",["country","jo","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for JO":"The country name of JO is Jordan."}}},
{"id":"n-abc04c49","guard":[["hasAny",["ar","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of AR":"The country name of AR is Argentina."}}},
{"id":"n-aec490f5","guard":[["hasAny",["country","gp","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for GP":"The country name of GP is Guadeloupe."}}},
{"id":"n-b5b4674f","guard":[["hasAny",["code","country","il","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code IL":"The country name of IL is Israel."}}},
{"id":"n-b699858a","guard":[["hasAny",["country","name","yt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of YT":"The country name of YT is Mayotte."}}},
{"id":"n-b82d18cb","guard":[["hasAny",["code","country","lv","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code LV":"The country name of LV is Latvia."}}},
{"id":"n-bad94f53","guard":[["hasAny",["country","name","ug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for UG":"The country name of UG is Uganda."}}},
{"id":"n-bcd3892f","guard":[["hasAny",["country","name","sv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of SV":"The country name of SV is El Salvador."}}},
{"id":"n-bd896901","guard":[["hasAny",["code","country","gb","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code GB":"The country name of GB is United Kingdom."}}},
{"id":"n-be9a8b35","guard":[["hasAny",["code","country","name","sc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code SC":"The country name of SC is Seychelles."}}},
{"id":"n-bfeca028","guard":[["hasAny",["country","name","nu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of NU":"The country name of NU is Niue."}}},
{"id":"n-c4d6a3e3","guard":[["hasAny",["country","cr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for CR":"The country name of CR is Costa Rica."}}},
{"id":"n-c5319004","guard":[["hasAny",["bs","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for BS":"The country name of BS is Bahamas."}}},
{"id":"n-c74f2cc1","guard":[["hasAny",["code","country","name","rs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code RS":"The country name of RS is Serbia."}}},
{"id":"n-c8595aab","guard":[["hasAny",["code","country","gh","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code GH":"The country name of GH is Ghana."}}},
{"id":"n-ca1b804f","guard":[["hasAny",["bo","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for BO":"The country name of BO is Bolivia, Plurinational State of."}}},
{"id":"n-ccf0da1f","guard":[["hasAny",["country","name","ss"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for SS":"The country name of SS is South Sudan."}}},
{"id":"n-ce1e87e8","guard":[["hasAny",["country","gn","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for GN":"The country name of GN is Guinea."}}},
{"id":"n-d4cb306b","guard":[["hasAny",["code","country","lc","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code LC":"The country name of LC is Saint Lucia."}}},
{"id":"n-d551e84c","guard":[["hasAny",["country","id","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of ID":"The country name of ID is Indonesia."}}},
{"id":"n-d5ad8f67","guard":[["hasAny",["country","name","om"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for OM":"The country name of OM is Oman."}}},
{"id":"n-d6d6a2f6","guard":[["hasAny",["code","country","na","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code NA":"The country name of NA is Namibia."}}},
{"id":"n-e2d056c0","guard":[["hasAny",["country","name","sd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for SD":"The country name of SD is Sudan (the)."}}},
{"id":"n-e482c6e6","guard":[["hasAny",["ci","code","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code CI":"The country name of CI is Côte d'Ivoire."}}},
{"id":"n-e4a55dab","guard":[["hasAny",["country","lk","name"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for LK":"The country name of LK is Sri Lanka."}}},
{"id":"n-e8ac7484","guard":[["hasAny",["al","code","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code AL":"The country name of AL is Albania."}}},
{"id":"n-e9c95182","guard":[["hasAny",["code","country","de","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code DE":"The country name of DE is Germany."}}},
{"id":"n-ecde2c76","guard":[["hasAny",["code","country","kz","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code KZ":"The country name of KZ is Kazakhstan."}}},
{"id":"n-ee4b3872","guard":[["hasAny",["ba","code","country","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code BA":"The country name of BA is Bosnia and Herzegovina."}}},
{"id":"n-ef705502","guard":[["hasAny",["code","country","mg","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code MG":"The country name of MG is Madagascar."}}},
{"id":"n-f17d4758","guard":[["hasAny",["country","gm","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for GM":"The country name of GM is Gambia."}}},
{"id":"n-f1c6dc35","guard":[["hasAny",["country","name","zw"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for ZW":"The country name of ZW is Zimbabwe."}}},
{"id":"n-f2359ea9","guard":[["hasAny",["country","name","tm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of TM":"The country name of TM is Turkmenistan."}}},
{"id":"n-f257699c","guard":[["hasAny",["country","name","sj"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for SJ":"The country name of SJ is Svalbard and Jan Mayen."}}},
{"id":"n-f6284688","guard":[["hasAny",["country","hn","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of HN":"The country name of HN is Honduras."}}},
{"id":"n-f929d0b9","guard":[["hasAny",["country","eh","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of EH":"The country name of EH is Western Sahara."}}},
{"id":"n-fbeaec73","guard":[["hasAny",["country","iq","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for IQ":"The country name of IQ is Iraq."}}},
{"id":"n-fc9a1736","guard":[["hasAny",["country","name","va"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of VA":"The country name of VA is Holy See (Vatican City State)."}}},
{"id":"n-fd0a777d","guard":[["hasAny",["country","name","sg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country name of SG":"The country name of SG is Singapore."}}},
{"id":"n-fd8317f8","guard":[["hasAny",["country","name","nf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for NF":"The country name of NF is Norfolk Island."}}},
{"id":"n-febca413","guard":[["hasAny",["cl","country","name"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country name for CL":"The country name of CL is Chile."}}},
{"id":"n-4d3e35d1","guard":[["hasAny",["shortest","shortest one","shortest word","so"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SO is Somalia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-50f2744a","guard":[["hasAny",["my","shortest","shortest one","shortest word"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MY is Malaysia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-968908af","guard":[["hasAny",["be","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BE is Belgium."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bd57c6b0","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","us"]],["has","country"],["words<=",7],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of US is United States of America (the)."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f647a3e6","guard":[["hasAny",["im","item number","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of IM is Isle of Man."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-018802fc","guard":[["hasAny",["bz","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Belize."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0665b734","guard":[["hasAny",["au","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Australia."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0732f7dd","guard":[["hasAny",["gn","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Guinea."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-12cf4652","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","ug"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Uganda."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-137b63b5","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","zw"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Zimbabwe."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-24432783","guard":[["hasAny",["bs","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bahamas."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2d997b5a","guard":[["hasAny",["iq","item number","nth","shortest","shortest one","shortest word"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Iraq."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-346aafa2","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sj"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Svalbard and Jan Mayen."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3b222b3f","guard":[["hasAny",["gr","item number","nth","shortest","shortest one","shortest word"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Greece."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-404cd126","guard":[["hasAny",["item number","ms","nth","shortest","shortest one","shortest word"]],["has","give"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Montserrat."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-47149c6f","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","ss"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is South Sudan."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-475d6ca8","guard":[["hasAny",["item number","mo","nth","shortest","shortest one","shortest word"]],["has","give"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Macao."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-552fbc4c","guard":[["hasAny",["item number","nth","pe","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Peru."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5cce5a8c","guard":[["hasAny",["gm","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Gambia."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6769111e","guard":[["hasAny",["ch","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Switzerland."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6a7afe36","guard":[["hasAny",["cl","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Chile."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6de96f19","guard":[["hasAny",["item number","nf","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Norfolk Island."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-701c52b2","guard":[["hasAny",["co","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Colombia."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-91a737aa","guard":[["hasAny",["item number","lk","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Sri Lanka."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-96dd9d83","guard":[["hasAny",["item number","nth","om","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Oman."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9b6cd5e4","guard":[["hasAny",["gp","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Guadeloupe."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a46ba957","guard":[["hasAny",["dk","item number","nth","shortest","shortest one","shortest word"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Denmark."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ac892c60","guard":[["hasAny",["item number","mu","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mauritius."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ad4bfb68","guard":[["hasAny",["item number","jo","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Jordan."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b7db91a6","guard":[["hasAny",["item number","nth","sd","shortest","shortest one","shortest word"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Sudan (the)."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bd3ada09","guard":[["hasAny",["item number","nth","ru","shortest","shortest one","shortest word"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Russian Federation (the)."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c4688037","guard":[["hasAny",["bo","item number","nth","shortest","shortest one","shortest word"]],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bolivia, Plurinational State of."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c5c4ca50","guard":[["hasAny",["er","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eritrea."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cd9de0b5","guard":[["hasAny",["cr","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Costa Rica."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d17868f2","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sm"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is San Marino."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f7a9b612","guard":[["hasAny",["ck","item number","nth","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Cook Islands."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-00dfcfaa","guard":[["hasAny",["item number","nth","rw","shortest","shortest one","shortest word"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Rwanda."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-033e6c53","guard":[["hasAny",["item number","np","nth","shortest","shortest one","shortest word"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Nepal."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0b96d12d","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tr"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Türkiye."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0fd092a8","guard":[["hasAny",["item number","nth","sc","shortest","shortest one","shortest word"]],["has","country"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Seychelles."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-12d9e81f","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","yt"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mayotte."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-143d3c0c","guard":[["hasAny",["item number","mg","nth","shortest","shortest one","shortest word"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Madagascar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1714aff6","guard":[["hasAny",["item number","li","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Liechtenstein."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-190e9e93","guard":[["hasAny",["gh","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ghana."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1b8211f2","guard":[["hasAny",["ar","item number","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Argentina."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1c934296","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","vn"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Viet Nam."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-229cb1ed","guard":[["hasAny",["et","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ethiopia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2a802f21","guard":[["hasAny",["item number","mz","nth","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mozambique."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2f0f561e","guard":[["hasAny",["item number","mv","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Maldives."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-33b77933","guard":[["hasAny",["id","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Indonesia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3480cfc3","guard":[["hasAny",["bg","item number","nth","shortest","shortest one","shortest word"]],["has","what"],["has","the"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bulgaria."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4083236c","guard":[["hasAny",["item number","mn","nth","shortest","shortest one","shortest word"]],["has","country"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mongolia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-48cec8fd","guard":[["hasAny",["item number","na","nth","shortest","shortest one","shortest word"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Namibia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4b9e68f0","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","va"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Holy See (Vatican City State)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4c0cf1be","guard":[["hasAny",["item number","nth","rs","shortest","shortest one","shortest word"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Serbia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4d098463","guard":[["hasAny",["hk","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Hong Kong."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4f65a51d","guard":[["hasAny",["item number","nth","nu","shortest","shortest one","shortest word"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Niue."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4ff12787","guard":[["hasAny",["hn","item number","nth","shortest","shortest one","shortest word"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Honduras."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-553004e3","guard":[["hasAny",["al","item number","nth","shortest","shortest one","shortest word"]],["has","code"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Albania."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5591902f","guard":[["hasAny",["gb","item number","nth","shortest","shortest one","shortest word"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is United Kingdom."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-57f50b6a","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","vu"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Vanuatu."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-60922598","guard":[["hasAny",["aw","item number","nth","shortest","shortest one","shortest word"]],["has","name"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Aruba."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-658c80b7","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sv"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is El Salvador."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-68e177fa","guard":[["hasAny",["item number","ky","nth","shortest","shortest one","shortest word"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Cayman Islands."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7668206e","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","xz"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Installations in International Waters."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-76cd73ab","guard":[["hasAny",["cz","item number","nth","shortest","shortest one","shortest word"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Czechia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-80d825f3","guard":[["hasAny",["item number","nth","py","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Paraguay."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-812edac2","guard":[["hasAny",["ci","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Côte d'Ivoire."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-81338d38","guard":[["hasAny",["item number","ng","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Nigeria."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-816e0c25","guard":[["hasAny",["item number","nth","sh","shortest","shortest one","shortest word"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Saint Helena, Ascension and Tristan Da Cunha."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-81769277","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Sierra Leone."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-93a20b35","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tm"]],["has","what"],["has","country"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Turkmenistan."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9734a9af","guard":[["hasAny",["bj","item number","nth","shortest","shortest one","shortest word"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Benin."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ad2e0f30","guard":[["hasAny",["fm","item number","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Micronesia, Federated States of."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ae2158df","guard":[["hasAny",["item number","lc","nth","shortest","shortest one","shortest word"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Saint Lucia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-afa45c95","guard":[["hasAny",["item number","kz","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kazakhstan."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b7f89709","guard":[["hasAny",["item number","kp","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Korea, Democratic People's Republic of."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b85d2541","guard":[["hasAny",["es","item number","nth","shortest","shortest one","shortest word"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Spain."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b87335d6","guard":[["hasAny",["item number","nc","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is New Caledonia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b9753cbf","guard":[["hasAny",["ba","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bosnia and Herzegovina."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bb904c27","guard":[["hasAny",["il","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Israel."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bd0f0994","guard":[["hasAny",["item number","nth","sg","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Singapore."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c0d467a9","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","ve"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Venezuela (Bolivarian Republic of)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c3b67475","guard":[["hasAny",["bl","item number","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Saint Barthélemy."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c3e02442","guard":[["hasAny",["ag","item number","nth","shortest","shortest one","shortest word"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Antigua and Barbuda."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c786e0c5","guard":[["hasAny",["item number","lv","nth","shortest","shortest one","shortest word"]],["words>=",10]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Latvia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c84a0ea4","guard":[["hasAny",["eh","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Western Sahara."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cabad942","guard":[["hasAny",["item number","mx","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mexico."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cc451610","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sn"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Senegal."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d309ad9e","guard":[["hasAny",["bm","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bermuda."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d8c364ea","guard":[["hasAny",["de","item number","nth","shortest","shortest one","shortest word"]],["has","code"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Germany."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-db3312bf","guard":[["hasAny",["item number","nth","nz","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is New Zealand."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ded396e5","guard":[["hasAny",["item number","mm","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Myanmar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f2c06730","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","ua"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ukraine."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f2ff26a4","guard":[["hasAny",["gi","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Gibraltar."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f5174ed0","guard":[["hasAny",["item number","lr","nth","shortest","shortest one","shortest word"]],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Liberia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f7bdff8d","guard":[["hasAny",["item number","mr","nth","shortest","shortest one","shortest word"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mauritania."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f95da102","guard":[["hasAny",["fr","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is France."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ff129154","guard":[["hasAny",["dm","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Dominica."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-436f09ac","guard":[["hasAny",["ar","bz","co","dk","dm","fm","gn","gp","gr","id","jo","lk","lr","mm","ms","mu","mv","mx","mz","nc","nf","ng","om","sg","sj","sn","sv","tm","ua","yt"]],["has","country"],["has","name"],["nums==",0],["words<=",10],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for BZ":"The country name of BZ is Belize.","what is the country name of FM":"The country name of FM is Micronesia, Federated States of.","what is the country name of GI":"The country name of GI is Gibraltar.","what is the country name of DM":"The country name of DM is Dominica.","give the country name for CK":"The country name of CK is Cook Islands.","tell me the country name of the country code SC":"The country name of SC is Seychelles.","give the country name for MS":"The country name of MS is Montserrat.","what is the country name of MV":"The country name of MV is Maldives.","what is the country name of AR":"The country name of AR is Argentina.","what is the country name of BE":"The country name of BE is Belgium.","give the country name for CH":"The country name of CH is Switzerland.","tell me the country name of the country code BJ":"The country name of BJ is Benin.","give the country name for OM":"The country name of OM is Oman.","give the country name for SD":"The country name of SD is Sudan (the).","what is the country name of NU":"The country name of NU is Niue.","give the country name for SS":"The country name of SS is South Sudan.","what is the country name of BM":"The country name of BM is Bermuda.","tell me the country name of the country code CZ":"The country name of CZ is Czechia.","tell me the country name of the country code ME":"The country name of ME is Montenegro.","give the country name for BS":"The country name of BS is Bahamas.","tell me the country name of the country code MR":"The country name of MR is Mauritania.","what is the country name of HN":"The country name of HN is Honduras.","give the country name for DK":"The country name of DK is Denmark.","give the country name for UG":"The country name of UG is Uganda.","tell me the country name of the country code LC":"The country name of LC is Saint Lucia.","give the country name for JO":"The country name of JO is Jordan.","what is the country name of LR":"The country name of LR is Liberia.","tell me the country name of the country code KY":"The country name of KY is Cayman Islands.","tell me the country name of the country code RS":"The country name of RS is Serbia.","tell me the country name of the country code KZ":"The country name of KZ is Kazakhstan.","what is the country name of MZ":"The country name of MZ is Mozambique.","what is the country name of UA":"The country name of UA is Ukraine.","give the country name for GM":"The country name of GM is Gambia.","give the country name for ZW":"The country name of ZW is Zimbabwe.","what is the country name of SV":"The country name of SV is El Salvador.","what is the country name of IM":"The country name of IM is Isle of Man.","what is the country name of NG":"The country name of NG is Nigeria.","give the country name for GP":"The country name of GP is Guadeloupe.","give the country name for SO":"The country name of SO is Somalia.","tell me the country name of the country code PY":"The country name of PY is Paraguay.","tell me the country name of the country code GH":"The country name of GH is Ghana.","tell me the country name of the country code SH":"The country name of SH is Saint Helena, Ascension and Tristan Da Cunha.","what is the country name of FR":"The country name of FR is France.","what is the country name of MM":"The country name of MM is Myanmar.","give the country name for GN":"The country name of GN is Guinea.","give the country name for MU":"The country name of MU is Mauritius.","tell me the country name of the country code RW":"The country name of RW is Rwanda.","tell me the country name of the country code IL":"The country name of IL is Israel.","give the country name for IQ":"The country name of IQ is Iraq.","give the country name for MO":"The country name of MO is Macao.","give the country name for SJ":"The country name of SJ is Svalbard and Jan Mayen.","tell me the country name of the country code VN":"The country name of VN is Viet Nam.","tell me the country name of the country code SL":"The country name of SL is Sierra Leone.","what is the country name of TR":"The country name of TR is Türkiye.","give the country name for AU":"The country name of AU is Australia.","give the country name for BO":"The country name of BO is Bolivia, Plurinational State of.","tell me the country name of the country code NP":"The country name of NP is Nepal.","what is the country name of EH":"The country name of EH is Western Sahara.","give the country name for CO":"The country name of CO is Colombia.","what is the country name of NC":"The country name of NC is New Caledonia.","tell me the country name of the country code GB":"The country name of GB is United Kingdom.","give the country name for CR":"The country name of CR is Costa Rica.","tell me the country name of the country code ET":"The country name of ET is Ethiopia.","what is the country name of BL":"The country name of BL is Saint Barthélemy.","give the country name for ER":"The country name of ER is Eritrea.","tell me the country name of the country code AG":"The country name of AG is Antigua and Barbuda.","what is the country name of US":"The country name of US is United States of America (the).","tell me the country name of the country code AL":"The country name of AL is Albania.","what is the country name of BG":"The country name of BG is Bulgaria.","give the country name for MY":"The country name of MY is Malaysia.","give the country name for GR":"The country name of GR is Greece.","give the country name for CL":"The country name of CL is Chile.","what is the country name of VA":"The country name of VA is Holy See (Vatican City State).","give the country name for LK":"The country name of LK is Sri Lanka.","tell me the country name of the country code DE":"The country name of DE is Germany.","tell me the country name of the country code MG":"The country name of MG is Madagascar.","what is the country name of AW":"The country name of AW is Aruba.","give the country name for RU":"The country name of RU is Russian Federation (the).","tell me the country name of the country code LV":"The country name of LV is Latvia.","what is the country name of LI":"The country name of LI is Liechtenstein.","what is the country name of SN":"The country name of SN is Senegal.","tell me the country name of the country code NZ":"The country name of NZ is New Zealand.","give the country name for PE":"The country name of PE is Peru.","what is the country name of VU":"The country name of VU is Vanuatu.","tell me the country name of the country code ES":"The country name of ES is Spain.","what is the country name of ID":"The country name of ID is Indonesia.","what is the country name of TM":"The country name of TM is Turkmenistan.","tell me the country name of the country code MN":"The country name of MN is Mongolia.","tell me the country name of the country code HK":"The country name of HK is Hong Kong.","tell me the country name of the country code CI":"The country name of CI is Côte d'Ivoire.","tell me the country name of the country code XZ":"The country name of XZ is Installations in International Waters.","tell me the country name of the country code BA":"The country name of BA is Bosnia and Herzegovina.","tell me the country name of the country code NA":"The country name of NA is Namibia.","give the country name for NF":"The country name of NF is Norfolk Island.","tell me the country name of the country code KP":"The country name of KP is Korea, Democratic People's Republic of.","what is the country name of YT":"The country name of YT is Mayotte.","what is the country name of VE":"The country name of VE is Venezuela (Bolivarian Republic of).","give the country name for SM":"The country name of SM is San Marino.","what is the country name of MX":"The country name of MX is Mexico.","what is the country name of SG":"The country name of SG is Singapore."}}},
{"id":"n-02c72929","guard":[["has","om"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for OM":"The country name of OM is Oman."}}},
{"id":"n-034e9ed5","guard":[["has","ky"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code KY":"The country name of KY is Cayman Islands."}}},
{"id":"n-035c4b1e","guard":[["has","ag"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code AG":"The country name of AG is Antigua and Barbuda."}}},
{"id":"n-0b6d4b9c","guard":[["has","eh"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of EH":"The country name of EH is Western Sahara."}}},
{"id":"n-0e3a2e15","guard":[["has","co"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for CO":"The country name of CO is Colombia."}}},
{"id":"n-1098a508","guard":[["has","ug"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for UG":"The country name of UG is Uganda."}}},
{"id":"n-13ce22fd","guard":[["has","vn"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code VN":"The country name of VN is Viet Nam."}}},
{"id":"n-1a39ecd6","guard":[["has","li"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of LI":"The country name of LI is Liechtenstein."}}},
{"id":"n-1e11cb6f","guard":[["has","lr"],["has","what"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of LR":"The country name of LR is Liberia."}}},
{"id":"n-1f3cbd45","guard":[["has","hn"],["has","what"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of HN":"The country name of HN is Honduras."}}},
{"id":"n-20518d8c","guard":[["has","rw"],["words>=",10]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code RW":"The country name of RW is Rwanda."}}},
{"id":"n-249855e4","guard":[["has","al"],["has","tell"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code AL":"The country name of AL is Albania."}}},
{"id":"n-266827e7","guard":[["has","lk"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for LK":"The country name of LK is Sri Lanka."}}},
{"id":"n-2a675362","guard":[["has","gi"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of GI":"The country name of GI is Gibraltar."}}},
{"id":"n-3088d94d","guard":[["has","mn"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code MN":"The country name of MN is Mongolia."}}},
{"id":"n-3358e575","guard":[["has","lv"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code LV":"The country name of LV is Latvia."}}},
{"id":"n-3433f42f","guard":[["has","pe"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for PE":"The country name of PE is Peru."}}},
{"id":"n-34696419","guard":[["has","mo"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for MO":"The country name of MO is Macao."}}},
{"id":"n-3569267e","guard":[["has","et"],["words>=",10]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code ET":"The country name of ET is Ethiopia."}}},
{"id":"n-3b1c7527","guard":[["has","dk"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for DK":"The country name of DK is Denmark."}}},
{"id":"n-3ef0d278","guard":[["has","ng"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of NG":"The country name of NG is Nigeria."}}},
{"id":"n-3f918ad2","guard":[["has","il"],["words>=",10]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code IL":"The country name of IL is Israel."}}},
{"id":"n-437ab81a","guard":[["has","fm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of FM":"The country name of FM is Micronesia, Federated States of."}}},
{"id":"n-45dbc978","guard":[["has","sj"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for SJ":"The country name of SJ is Svalbard and Jan Mayen."}}},
{"id":"n-47585fbd","guard":[["has","mg"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code MG":"The country name of MG is Madagascar."}}},
{"id":"n-4775e714","guard":[["has","fr"],["has","what"],["has","country"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of FR":"The country name of FR is France."}}},
{"id":"n-4c6fd9ae","guard":[["has","nz"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code NZ":"The country name of NZ is New Zealand."}}},
{"id":"n-531aab93","guard":[["has","ve"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of VE":"The country name of VE is Venezuela (Bolivarian Republic of)."}}},
{"id":"n-53cbd666","guard":[["has","bs"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for BS":"The country name of BS is Bahamas."}}},
{"id":"n-54e92efe","guard":[["has","kp"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code KP":"The country name of KP is Korea, Democratic People's Republic of."}}},
{"id":"n-57f06552","guard":[["has","jo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for JO":"The country name of JO is Jordan."}}},
{"id":"n-59f6bc85","guard":[["has","mz"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of MZ":"The country name of MZ is Mozambique."}}},
{"id":"n-5a8c3772","guard":[["has","xz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code XZ":"The country name of XZ is Installations in International Waters."}}},
{"id":"n-5aff8592","guard":[["has","nu"],["has","what"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of NU":"The country name of NU is Niue."}}},
{"id":"n-5c13235a","guard":[["has","cr"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for CR":"The country name of CR is Costa Rica."}}},
{"id":"n-5e96eca2","guard":[["has","ci"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code CI":"The country name of CI is Côte d'Ivoire."}}},
{"id":"n-5fae87c0","guard":[["has","sl"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code SL":"The country name of SL is Sierra Leone."}}},
{"id":"n-612a1103","guard":[["has","ch"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for CH":"The country name of CH is Switzerland."}}},
{"id":"n-623948a6","guard":[["has","gp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for GP":"The country name of GP is Guadeloupe."}}},
{"id":"n-64aaedb1","guard":[["has","bg"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of BG":"The country name of BG is Bulgaria."}}},
{"id":"n-690f3d70","guard":[["has","bo"],["has","give"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for BO":"The country name of BO is Bolivia, Plurinational State of."}}},
{"id":"n-75846acc","guard":[["has","bz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for BZ":"The country name of BZ is Belize."}}},
{"id":"n-77f50461","guard":[["has","mm"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of MM":"The country name of MM is Myanmar."}}},
{"id":"n-790eacfc","guard":[["has","na"],["words>=",10]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code NA":"The country name of NA is Namibia."}}},
{"id":"n-79623f8f","guard":[["has","lc"],["words>=",10]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code LC":"The country name of LC is Saint Lucia."}}},
{"id":"n-7c2e75b3","guard":[["has","sc"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code SC":"The country name of SC is Seychelles."}}},
{"id":"n-7dc77566","guard":[["has","tm"],["has","name"],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of TM":"The country name of TM is Turkmenistan."}}},
{"id":"n-87a891cb","guard":[["has","er"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for ER":"The country name of ER is Eritrea."}}},
{"id":"n-891601f2","guard":[["has","ar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of AR":"The country name of AR is Argentina."}}},
{"id":"n-8a600afb","guard":[["has","zw"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for ZW":"The country name of ZW is Zimbabwe."}}},
{"id":"n-8d9f9b25","guard":[["has","yt"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of YT":"The country name of YT is Mayotte."}}},
{"id":"n-9035e749","guard":[["has","cz"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code CZ":"The country name of CZ is Czechia."}}},
{"id":"n-91971367","guard":[["has","ms"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for MS":"The country name of MS is Montserrat."}}},
{"id":"n-9238dacb","guard":[["has","gn"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for GN":"The country name of GN is Guinea."}}},
{"id":"n-923b7f78","guard":[["has","de"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code DE":"The country name of DE is Germany."}}},
{"id":"n-92773661","guard":[["has","ru"],["has","give"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for RU":"The country name of RU is Russian Federation (the)."}}},
{"id":"n-93b1fb31","guard":[["has","sd"],["has","give"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for SD":"The country name of SD is Sudan (the)."}}},
{"id":"n-94ee58f2","guard":[["has","nc"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of NC":"The country name of NC is New Caledonia."}}},
{"id":"n-95d4a344","guard":[["has","hk"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code HK":"The country name of HK is Hong Kong."}}},
{"id":"n-978744d1","guard":[["has","mr"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code MR":"The country name of MR is Mauritania."}}},
{"id":"n-9b472a5b","guard":[["has","sn"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of SN":"The country name of SN is Senegal."}}},
{"id":"n-9b93b493","guard":[["has","dm"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of DM":"The country name of DM is Dominica."}}},
{"id":"n-9bc6dd3e","guard":[["has","id"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of ID":"The country name of ID is Indonesia."}}},
{"id":"n-9bdc6724","guard":[["has","tr"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of TR":"The country name of TR is Türkiye."}}},
{"id":"n-a543cf31","guard":[["has","gh"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code GH":"The country name of GH is Ghana."}}},
{"id":"n-a57a758e","guard":[["has","iq"],["has","give"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for IQ":"The country name of IQ is Iraq."}}},
{"id":"n-afe11115","guard":[["has","gb"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code GB":"The country name of GB is United Kingdom."}}},
{"id":"n-b3b04145","guard":[["has","sv"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of SV":"The country name of SV is El Salvador."}}},
{"id":"n-b3b87f23","guard":[["has","mv"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of MV":"The country name of MV is Maldives."}}},
{"id":"n-b8cfd75d","guard":[["has","bl"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of BL":"The country name of BL is Saint Barthélemy."}}},
{"id":"n-bae24964","guard":[["has","nf"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for NF":"The country name of NF is Norfolk Island."}}},
{"id":"n-bc92346b","guard":[["has","bj"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code BJ":"The country name of BJ is Benin."}}},
{"id":"n-be71f611","guard":[["has","sh"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code SH":"The country name of SH is Saint Helena, Ascension and Tristan Da Cunha."}}},
{"id":"n-c0757bfb","guard":[["has","sm"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for SM":"The country name of SM is San Marino."}}},
{"id":"n-c45f1c30","guard":[["has","mu"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for MU":"The country name of MU is Mauritius."}}},
{"id":"n-c6c80c75","guard":[["has","ba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code BA":"The country name of BA is Bosnia and Herzegovina."}}},
{"id":"n-c8f745b8","guard":[["has","sg"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of SG":"The country name of SG is Singapore."}}},
{"id":"n-ca38e2d5","guard":[["has","kz"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code KZ":"The country name of KZ is Kazakhstan."}}},
{"id":"n-caac6194","guard":[["has","gr"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for GR":"The country name of GR is Greece."}}},
{"id":"n-cc71caba","guard":[["has","ss"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for SS":"The country name of SS is South Sudan."}}},
{"id":"n-cd3f08dc","guard":[["has","ua"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of UA":"The country name of UA is Ukraine."}}},
{"id":"n-d07f4ab0","guard":[["has","bm"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of BM":"The country name of BM is Bermuda."}}},
{"id":"n-d424ad8f","guard":[["has","aw"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of AW":"The country name of AW is Aruba."}}},
{"id":"n-d639a443","guard":[["has","cl"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for CL":"The country name of CL is Chile."}}},
{"id":"n-d6844d80","guard":[["has","vu"],["has","what"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of VU":"The country name of VU is Vanuatu."}}},
{"id":"n-d83e68a0","guard":[["has","rs"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code RS":"The country name of RS is Serbia."}}},
{"id":"n-d8d1d3eb","guard":[["has","py"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code PY":"The country name of PY is Paraguay."}}},
{"id":"n-db811649","guard":[["has","mx"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of MX":"The country name of MX is Mexico."}}},
{"id":"n-e39f19ca","guard":[["has","np"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code NP":"The country name of NP is Nepal."}}},
{"id":"n-e853899c","guard":[["has","es"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country name of the country code ES":"The country name of ES is Spain."}}},
{"id":"n-eafb5263","guard":[["has","ck"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for CK":"The country name of CK is Cook Islands."}}},
{"id":"n-efc407e3","guard":[["has","au"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for AU":"The country name of AU is Australia."}}},
{"id":"n-f171fca1","guard":[["has","va"],["has","what"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country name of VA":"The country name of VA is Holy See (Vatican City State)."}}},
{"id":"n-f9200115","guard":[["has","gm"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country name for GM":"The country name of GM is Gambia."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"give the country name for BZ","expect":{"contains":["Belize"],"notRefusal":true}},{"q":"what is the country name of FM","expect":{"contains":["Micronesia, Federated States of"],"notRefusal":true}},{"q":"what is the country name of GI","expect":{"contains":["Gibraltar"],"notRefusal":true}},{"q":"what is the country name of DM","expect":{"contains":["Dominica"],"notRefusal":true}},{"q":"give the country name for CK","expect":{"contains":["Cook Islands"],"notRefusal":true}},{"q":"tell me the country name of the country code SC","expect":{"contains":["Seychelles"],"notRefusal":true}},{"q":"give the country name for MS","expect":{"contains":["Montserrat"],"notRefusal":true}},{"q":"what is the country name of MV","expect":{"contains":["Maldives"],"notRefusal":true}},{"q":"what is the country name of AR","expect":{"contains":["Argentina"],"notRefusal":true}},{"q":"what is the country name of BE","expect":{"contains":["Belgium"],"notRefusal":true}},{"q":"give the country name for CH","expect":{"contains":["Switzerland"],"notRefusal":true}},{"q":"tell me the country name of the country code BJ","expect":{"contains":["Benin"],"notRefusal":true}},{"q":"give the country name for OM","expect":{"contains":["Oman"],"notRefusal":true}},{"q":"give the country name for SD","expect":{"contains":["Sudan (the)"],"notRefusal":true}},{"q":"what is the country name of NU","expect":{"contains":["Niue"],"notRefusal":true}},{"q":"give the country name for SS","expect":{"contains":["South Sudan"],"notRefusal":true}},{"q":"what is the country name of BM","expect":{"contains":["Bermuda"],"notRefusal":true}},{"q":"tell me the country name of the country code CZ","expect":{"contains":["Czechia"],"notRefusal":true}},{"q":"tell me the country name of the country code ME","expect":{"contains":["Montenegro"],"notRefusal":true}},{"q":"give the country name for BS","expect":{"contains":["Bahamas"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
